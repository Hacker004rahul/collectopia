/**
 * EnemySystem
 *
 * Responsibilities
 *  - Procedurally spawn enemy encounters ahead of the player.
 *  - Animate enemies: approach, lane-change, knockback, defeated-flash.
 *  - Detect AABB player contact and apply a one-time damage penalty per
 *    cooldown window via EconomyManager.
 *  - Support punch hits: reduce HP, trigger knockback, award defeat reward once.
 *  - Recycle enemies behind the player.
 *  - Expose shieldActive flag (Phase 5 sets it to block damage).
 *  - Expose freezeActive flag (Phase 5 sets it to freeze enemy movement).
 *  - Scale difficulty with the current level index (faster, denser, tougher).
 */
import * as THREE from 'three';
import { ENEMIES, LANES, PLAYER } from '../config/balance';
import {
  getDifficultyProfile,
  pickWeighted,
  type DifficultyProfile,
} from '../config/difficulty';
import { Rng } from '../core/Rng';
import type { SpawnReservations } from '../core/SpawnReservations';
import type { EconomyManager } from '../economy/EconomyManager';
import {
  buildEnemyMesh,
  ENEMY_HALF_EXTENTS,
  ENEMY_MAX_HP,
  type EnemyKind,
} from './EnemyMeshBuilder';

// ─── public types ─────────────────────────────────────────────────────────────

export interface EnemyHitEvent {
  position: THREE.Vector3;
  shieldBlocked: boolean;
}

export interface EnemyDefeatedEvent {
  position: THREE.Vector3;
  kind: EnemyKind;
  reward: number;
}

export interface EnemySystemCallbacks {
  onPlayerHit: (event: EnemyHitEvent) => void;
  onEnemyDefeated: (event: EnemyDefeatedEvent) => void;
}

// ─── internal ─────────────────────────────────────────────────────────────────

interface EnemyRecord {
  id: number;
  kind: EnemyKind;
  group: THREE.Group;
  /** Current world-space X (may change during lane changes). */
  x: number;
  /** Fixed world-space distance along the track. */
  distance: number;
  laneIndex: number;
  targetLaneIndex: number;
  halfX: number;
  halfZ: number;
  hp: number;
  maxHp: number;
  /** Cooldown before the same enemy can damage the player again (s). */
  hitCooldown: number;
  /** Knockback: metres remaining to push the enemy back. */
  knockbackRemaining: number;
  rewardClaimed: boolean;
  active: boolean;
  /** Defeat flash/fade timer (s). */
  defeatTimer: number;
  /** Approach speed this enemy uses (m/s, scaled by level). */
  approachSpeed: number;
}

// Reward table keyed by kind
const REWARDS: Record<EnemyKind, number> = {
  basic: ENEMIES.rewardBasic,
  fast:  ENEMIES.rewardFast,
  guard: ENEMIES.rewardGuard,
  heavy: ENEMIES.rewardHeavy,
  boss:  ENEMIES.rewardBoss,
};

// HP table
const HP: Record<EnemyKind, number> = {
  basic: ENEMIES.hpBasic,
  fast:  ENEMIES.hpFast,
  guard: ENEMIES.hpGuard,
  heavy: ENEMIES.hpHeavy,
  boss:  ENEMIES.hpBoss,
};

const DEFEAT_FLASH_DURATION = 0.4;

// ─── EnemySystem ──────────────────────────────────────────────────────────────

export class EnemySystem {
  /** Set true when Shield power-up is active (Phase 5). */
  shieldActive = false;
  /** Set true when Freeze Enemy power-up is active (Phase 5). */
  freezeActive = false;

  private readonly records: EnemyRecord[] = [];
  private rng = new Rng(0xf4ce1a7b);
  private nextDistance: number;
  private nextId = 1;
  private time = 0;
  private frozenVisualActive = false;

  // reusable vectors — zero per-frame allocation
  private readonly _pMin = new THREE.Vector3();
  private readonly _pMax = new THREE.Vector3();
  private readonly _eMin = new THREE.Vector3();
  private readonly _eMax = new THREE.Vector3();
  private readonly _hitPos = new THREE.Vector3();

  constructor(
    private readonly scene: THREE.Scene,
    private readonly economy: EconomyManager,
    private readonly callbacks: EnemySystemCallbacks,
    private readonly reservations?: SpawnReservations,
  ) {
    this.rng = new Rng(0xf4ce1a7b);
    this.nextDistance = ENEMIES.initialDistance;
  }

  // ─── public API ─────────────────────────────────────────────────────────────

  /**
   * Called by Game.update() every frame.
   * @param playerZ     current player world-Z (negative = further along)
   * @param playerX     current player world-X
   * @param playerDistance  distance counter (positive, metres)
   * @param dt          frame delta (seconds)
   * @param speed       current forward speed (m/s)
   * @param difficulty  current difficulty profile
   */
  update(
    playerZ: number,
    playerX: number,
    playerDistance: number,
    dt: number,
    speed: number,
    difficulty: DifficultyProfile = getDifficultyProfile(0),
  ): void {
    this.time += dt;

    const config = difficulty.enemy;

    // spawn patterns ahead of the player
    while (this.nextDistance < playerDistance + ENEMIES.spawnAhead) {
      const active = this.records.filter((r) => r.active).length;
      if (active < config.maxActive) {
        this.spawnEncounter(this.nextDistance, difficulty);
      }
      this.nextDistance += this.rng.range(
        config.minSpacing,
        config.maxSpacing,
      );
    }

    // player AABB (reused each frame)
    this._pMin.set(
      playerX - PLAYER.collisionHalfWidth,
      0,
      playerZ - PLAYER.collisionHalfDepth,
    );
    this._pMax.set(
      playerX + PLAYER.collisionHalfWidth,
      2.2,
      playerZ + PLAYER.collisionHalfDepth,
    );

    for (let i = this.records.length - 1; i >= 0; i--) {
      const rec = this.records[i];
      if (!rec.active) continue;

      // recycle when well behind the player
      if (-rec.distance > playerZ + ENEMIES.recycleBehind) {
        this.deactivate(i);
        continue;
      }

      // defeat flash / fade and removal
      if (rec.hp <= 0) {
        rec.defeatTimer -= dt;
        if (rec.defeatTimer <= 0) {
          this.deactivate(i);
        } else {
          // fade out the mesh
          const alpha = rec.defeatTimer / DEFEAT_FLASH_DURATION;
          rec.group.traverse((obj) => {
            const m = obj as THREE.Mesh;
            if (!m.isMesh) return;
            const mat = m.material as THREE.MeshStandardMaterial;
            if (!mat.transparent) {
              mat.transparent = true;
              mat.depthWrite = false;
            }
            mat.opacity = alpha;
          });
        }
        continue;
      }

      // freeze: skip movement when freeze power-up is active
      if (!this.freezeActive) {
        // knockback: push the enemy away from the player (larger Z)
        if (rec.knockbackRemaining > 0) {
          const step = Math.min(
            rec.knockbackRemaining,
            (ENEMIES.knockbackDistance / ENEMIES.knockbackDuration) * dt,
          );
          rec.distance += step;
          rec.knockbackRemaining = Math.max(0, rec.knockbackRemaining - step);
        } else {
          // approach: enemy moves towards the player (closing distance gap)
          const closing = rec.approachSpeed + speed;
          rec.distance -= closing * dt;
        }

        // lane-change drift
        const targetX = LANES[rec.targetLaneIndex];
        if (Math.abs(rec.x - targetX) > 0.05) {
          const dir = rec.x < targetX ? 1 : -1;
          rec.x += dir * ENEMIES.laneChangeSpeed * dt;
          if ((dir > 0 && rec.x >= targetX) || (dir < 0 && rec.x <= targetX)) {
            rec.x = targetX;
            rec.laneIndex = rec.targetLaneIndex;
          }
        }
      }

      rec.group.position.set(rec.x, 0, -rec.distance);

      // tick hit cooldown
      if (rec.hitCooldown > 0) {
        rec.hitCooldown = Math.max(0, rec.hitCooldown - dt);
      }

      // AABB overlap test
      const ez = -rec.distance;
      this._eMin.set(rec.x - rec.halfX, 0, ez - rec.halfZ);
      this._eMax.set(rec.x + rec.halfX, 2.2, ez + rec.halfZ);

      const overlaps =
        this._pMin.x <= this._eMax.x &&
        this._pMax.x >= this._eMin.x &&
        this._pMin.z <= this._eMax.z &&
        this._pMax.z >= this._eMin.z;

      if (!overlaps || rec.hitCooldown > 0) continue;

      // Frozen enemies cannot damage the player.
      if (this.freezeActive) continue;

      rec.hitCooldown = ENEMIES.hitCooldown;
      this._hitPos.set(rec.x, 1.2, ez);

      if (this.shieldActive) {
        // Shield absorbs the hit and shoves the enemy back so it cannot
        // immediately overlap the player after the shield is consumed.
        rec.knockbackRemaining = ENEMIES.knockbackDistance * 2;
        rec.hitCooldown = ENEMIES.hitCooldown;
        this.callbacks.onPlayerHit({
          position: this._hitPos.clone(),
          shieldBlocked: true,
        });
        continue;
      }

      const sourceId = `enemy:${rec.id}:${Math.floor(this.time * 10)}`;
      const result = this.economy.apply({
        type: 'enemy-damage',
        sourceId,
        amount: ENEMIES.damagePenalty,
        label: 'Enemy hit',
      });

      if (result.applied) {
        this.callbacks.onPlayerHit({
          position: this._hitPos.clone(),
          shieldBlocked: false,
        });
      }
    }

    this.reservations?.prune(playerDistance);
  }

  setFreeze(active: boolean): void {
    if (this.freezeActive === active) return;
    this.freezeActive = active;
    this.setFrozenVisual(active);
  }

  /**
   * Register a punch hit attempt.  Returns whether any enemy was struck.
   * @param playerZ  current player world-Z
   * @param playerX  current player world-X
   * @param superPunch  whether Super Punch power-up is active (Phase 5)
   */
  punch(playerZ: number, playerX: number, superPunch = false): boolean {
    let hit = false;

    for (const rec of this.records) {
      if (!rec.active || rec.hp <= 0) continue;

      const ez = -rec.distance;
      const dz = playerZ - ez;    // positive: enemy is ahead
      const dx = Math.abs(playerX - rec.x);

      // Enemy must be ahead of the player and within punch range.
      // Never let the punch hit enemies behind the player.
      if (dz < -0.25 || dz > PUNCH_RANGE_Z_FORWARD) continue;
      if (dx > PUNCH_RANGE_X) continue;

      const damage = superPunch ? 2 : 1;
      rec.hp = Math.max(0, rec.hp - damage);
      rec.knockbackRemaining = ENEMIES.knockbackDistance;

      // boss health bar update
      if (rec.kind === 'boss') {
        this.updateBossHpBar(rec);
      }

      // flash the enemy on hit
      this.flashEnemy(rec);

      if (rec.hp <= 0 && !rec.rewardClaimed) {
        rec.rewardClaimed = true;
        rec.defeatTimer = DEFEAT_FLASH_DURATION;

        const reward = REWARDS[rec.kind];
        const sourceId = `enemy-reward:${rec.id}`;
        this.economy.apply({
          type: 'enemy-reward',
          sourceId,
          amount: reward,
          label: `Defeated ${rec.kind} enemy`,
        });

        this.callbacks.onEnemyDefeated({
          position: new THREE.Vector3(rec.x, 1.5, ez),
          kind: rec.kind,
          reward,
        });
      }

      hit = true;
      break; // one target per punch
    }

    return hit;
  }

  reset(): void {
    for (let i = this.records.length - 1; i >= 0; i -= 1) {
      this.deactivate(i);
    }
    this.records.length = 0;
    this.rng = new Rng(0xf4ce1a7b);
    this.nextDistance = ENEMIES.initialDistance;
    this.nextId = 1;
    this.time = 0;
    this.frozenVisualActive = false;
    this.shieldActive = false;
    this.freezeActive = false;
  }

  dispose(): void {
    for (let i = this.records.length - 1; i >= 0; i--) {
      const rec = this.records[i];
      this.scene.remove(rec.group);
      disposeGroup(rec.group);
    }
    this.records.length = 0;
  }

  /** Returns all currently active enemy records (read-only, for tests). */
  getActiveRecords(): ReadonlyArray<Readonly<EnemyRecord>> {
    return this.records.filter((r) => r.active);
  }

  // ─── private ─────────────────────────────────────────────────────────────

  private spawnEncounter(
    baseDistance: number,
    difficulty: DifficultyProfile,
  ): void {
    const kind = this.pickKind(difficulty);
    const laneIndex = this.rng.int(0, 2);
    const half = ENEMY_HALF_EXTENTS[kind];

    if (
      this.reservations &&
      !this.reservations.isClear(
        baseDistance,
        half.z,
        [laneIndex],
        ENEMIES.gateExclusionZone,
      )
    ) {
      return;
    }

    // compute HP and speed with level scaling
    const hp = HP[kind];
    const approachSpeed =
      ENEMIES.approachSpeed * difficulty.enemy.approachSpeedScale;

    const group = buildEnemyMesh(kind);
    const x = LANES[laneIndex];
    group.position.set(x, 0, -baseDistance);
    this.scene.add(group);
    if (this.frozenVisualActive) this.applyFrozenMaterial(group, true);

    // decide target lane for lane-changers (fast + guard may change lane)
    const targetLaneIndex =
      (kind === 'fast' || kind === 'guard') &&
      this.rng.chance(difficulty.enemy.laneChangeChance)
        ? this.rng.int(0, 2)
        : laneIndex;

    this.records.push({
      id: this.nextId++,
      kind,
      group,
      x,
      distance: baseDistance,
      laneIndex,
      targetLaneIndex,
      halfX: half.x,
      halfZ: half.z,
      hp,
      maxHp: ENEMY_MAX_HP[kind],
      hitCooldown: 0,
      knockbackRemaining: 0,
      rewardClaimed: false,
      active: true,
      defeatTimer: 0,
      approachSpeed,
    });

    this.reservations?.reserve({
      owner: 'enemy',
      distance: baseDistance,
      halfLength: half.z,
      lanes: [laneIndex],
      pad: 2,
    });
  }

  private pickKind(difficulty: DifficultyProfile): EnemyKind {
    return pickWeighted(difficulty.enemy.kindWeights, this.rng.next());
  }

  private setFrozenVisual(active: boolean): void {
    this.frozenVisualActive = active;
    for (const rec of this.records) {
      if (!rec.active) continue;
      this.applyFrozenMaterial(rec.group, active);
    }
  }

  private applyFrozenMaterial(group: THREE.Group, active: boolean): void {
    group.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const material = mesh.material as THREE.MeshStandardMaterial;
      if (!material?.emissive) return;

      if (active) {
        if (material.userData.freezeEmissive === undefined) {
          material.userData.freezeEmissive = material.emissive.getHex();
          material.userData.freezeIntensity = material.emissiveIntensity;
        }
        material.emissive.setHex(0x5bc0ff);
        material.emissiveIntensity = 0.85;
      } else if (material.userData.freezeEmissive !== undefined) {
        material.emissive.setHex(material.userData.freezeEmissive as number);
        material.emissiveIntensity = material.userData.freezeIntensity as number;
        delete material.userData.freezeEmissive;
        delete material.userData.freezeIntensity;
      }
    });
  }

  private deactivate(index: number): void {
    const rec = this.records[index];
    rec.active = false;
    this.scene.remove(rec.group);
    disposeGroup(rec.group);
    this.records.splice(index, 1);
  }

  private flashEnemy(rec: EnemyRecord): void {
    // Brief white flash on hit
    rec.group.traverse((obj) => {
      const m = obj as THREE.Mesh;
      if (!m.isMesh) return;
      const mat = m.material as THREE.MeshStandardMaterial;
      if (!mat.emissive) return;
      mat.emissive.set(0xffffff);
      mat.emissiveIntensity = 0.9;
    });
    setTimeout(() => {
      if (!rec.active && rec.hp <= 0) return;
      rec.group.traverse((obj) => {
        const m = obj as THREE.Mesh;
        if (!m.isMesh) return;
        const mat = m.material as THREE.MeshStandardMaterial;
        if (!mat.emissive) return;
        mat.emissive.set(0x000000);
        mat.emissiveIntensity = 0;
      });
    }, 100);
  }

  private updateBossHpBar(rec: EnemyRecord): void {
    const fill = rec.group.getObjectByName('bossHpFill');
    if (!fill) return;
    const ratio = Math.max(0, rec.hp / rec.maxHp);
    fill.scale.x = ratio;
    fill.position.x = -(1 - ratio) * 0.38; // anchor left
    // colour shift: green → red as hp drops
    const mesh = fill as THREE.Mesh;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const r = Math.round(0x22 + (0xcc - 0x22) * (1 - ratio));
    const gv = Math.round(0xcc - (0xcc - 0x22) * (1 - ratio));
    mat.color.setRGB(r / 255, gv / 255, 0x22 / 255);
    mat.emissive.setRGB(r / 255, gv / 255, 0x22 / 255);
  }
}

// ─── punch range constants (match PUNCH in balance.ts) ───────────────────────
// Imported here rather than from balance to avoid a circular-dep risk; values
// must stay in sync with PUNCH.rangeZ and PUNCH.rangeX in balance.ts.
const PUNCH_RANGE_Z_FORWARD = 4.5;   // matches PUNCH.rangeZ
const PUNCH_RANGE_X = 2.4;           // matches PUNCH.rangeX

// ─── helpers ─────────────────────────────────────────────────────────────────

function disposeGroup(group: THREE.Group): void {
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) mesh.geometry.dispose();
    // materials are per-instance; dispose them too
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (!mat) return;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else mat.dispose();
  });
}
