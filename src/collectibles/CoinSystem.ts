import * as THREE from 'three';
import { COINS, ECONOMY, LANES, POWERUPS } from '../config/balance';
import {
  getDifficultyProfile,
  type DifficultyProfile,
} from '../config/difficulty';
import { Rng } from '../core/Rng';
import type { EconomyManager } from '../economy/EconomyManager';
import { createGlowTexture } from '../assets/proceduralTextures';
import { applyMagnetPull } from './magnet';

interface CoinRecord {
  index: number;
  id: number;
  distance: number;
  x: number;
  phase: number;
  collected: boolean;
}

export interface CoinCollectEvent {
  position: THREE.Vector3;
  amount: number;
}

export interface CoinSystemCallbacks {
  onCollect: (event: CoinCollectEvent) => void;
}

export class CoinSystem {
  private readonly body: THREE.InstancedMesh;
  private readonly rim: THREE.InstancedMesh;
  private readonly glow: THREE.Points;
  private readonly glowPositions: Float32Array;
  private readonly records: Array<CoinRecord | null> = new Array(COINS.maxActive).fill(null);
  private readonly freeIndices: number[] = [];
  private readonly matrix = new THREE.Matrix4();
  private readonly hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
  private readonly collectPosition = new THREE.Vector3();
  private rng = new Rng(0x51c0ffee);
  private nextId = 1;
  private nextPatternDistance = COINS.initialPatternDistance;
  private magnetActive = false;
  private coinMultiplier = 1;

  constructor(
    private readonly scene: THREE.Scene,
    private readonly economy: EconomyManager,
    private readonly callbacks: CoinSystemCallbacks,
  ) {
    const bodyGeometry = new THREE.CylinderGeometry(
      COINS.radius,
      COINS.radius,
      0.075,
      24,
    );
    bodyGeometry.rotateX(Math.PI / 2);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xffcf3d,
      metalness: 0.38,
      roughness: 0.24,
      emissive: 0x8a5600,
      emissiveIntensity: 0.5,
    });

    this.body = new THREE.InstancedMesh(bodyGeometry, bodyMaterial, COINS.maxActive);
    this.body.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.body.frustumCulled = false;
    this.body.castShadow = true;

    const rimGeometry = new THREE.TorusGeometry(COINS.radius, 0.035, 8, 24);
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xffb92e,
      metalness: 0.45,
      roughness: 0.3,
      emissive: 0x704400,
      emissiveIntensity: 0.35,
    });

    this.rim = new THREE.InstancedMesh(rimGeometry, rimMaterial, COINS.maxActive);
    this.rim.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.rim.frustumCulled = false;

    this.glowPositions = new Float32Array(COINS.maxActive * 3);
    const glowGeometry = new THREE.BufferGeometry();
    glowGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.glowPositions, 3),
    );
    glowGeometry.setDrawRange(0, 0);

    this.glow = new THREE.Points(
      glowGeometry,
      new THREE.PointsMaterial({
        map: createGlowTexture(),
        color: 0xffffff,
        size: 1.05,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    );
    this.glow.frustumCulled = false;

    scene.add(this.body, this.rim, this.glow);

    for (let index = COINS.maxActive - 1; index >= 0; index -= 1) {
      this.freeIndices.push(index);
      this.body.setMatrixAt(index, this.hiddenMatrix);
      this.rim.setMatrixAt(index, this.hiddenMatrix);
    }
    this.body.instanceMatrix.needsUpdate = true;
    this.rim.instanceMatrix.needsUpdate = true;
  }

  update(
    dt: number,
    time: number,
    playerDistance: number,
    playerX: number,
    difficulty: DifficultyProfile = getDifficultyProfile(0),
  ): void {
    while (
      this.nextPatternDistance < playerDistance + COINS.patternsAhead &&
      this.freeIndices.length > 0
    ) {
      const span = this.spawnPattern(this.nextPatternDistance);
      this.nextPatternDistance +=
        Math.max(span, 8) +
        this.rng.range(
          difficulty.coin.patternGapMin,
          difficulty.coin.patternGapMax,
        );
    }

    let glowCount = 0;

    for (let i = 0; i < this.records.length; i += 1) {
      const record = this.records[i];
      if (!record) continue;

      if (this.magnetActive && !record.collected) {
        applyMagnetPull(
          record,
          playerX,
          playerDistance,
          dt,
          POWERUPS.magnetRadius,
          POWERUPS.magnetPullSpeed,
        );
      }

      const dz = Math.abs(record.distance - playerDistance);
      const dx = Math.abs(record.x - playerX);

      if (
        !record.collected &&
        dz <= COINS.collectRadiusZ &&
        dx <= COINS.collectRadiusX
      ) {
        const amount = ECONOMY.coinValue * this.coinMultiplier;
        const result = this.economy.apply({
          type: 'coin',
          sourceId: `coin:${record.id}`,
          amount,
          label: 'Gold coin',
        });

        if (result.applied) {
          record.collected = true;
          this.collectPosition.set(record.x, COINS.height, -record.distance);
          this.callbacks.onCollect({
            position: this.collectPosition,
            amount,
          });
        }
      }

      if (record.collected || record.distance < playerDistance - COINS.recycleBehind) {
        this.body.setMatrixAt(record.index, this.hiddenMatrix);
        this.rim.setMatrixAt(record.index, this.hiddenMatrix);
        this.freeIndices.push(record.index);
        this.records[i] = null;
        continue;
      }

      const angle = time * 2.5 + record.phase;
      const bob = Math.sin(time * 2.2 + record.phase) * 0.08;
      const x = record.x;
      const y = COINS.height + bob;
      const z = -record.distance;

      this.matrix.makeRotationY(angle);
      this.matrix.setPosition(x, y, z);
      this.body.setMatrixAt(record.index, this.matrix);
      this.rim.setMatrixAt(record.index, this.matrix);

      const offset = glowCount * 3;
      this.glowPositions[offset] = x;
      this.glowPositions[offset + 1] = y;
      this.glowPositions[offset + 2] = z;
      glowCount += 1;
    }

    this.body.instanceMatrix.needsUpdate = true;
    this.rim.instanceMatrix.needsUpdate = true;

    const glowGeometry = this.glow.geometry;
    glowGeometry.setDrawRange(0, glowCount);
    glowGeometry.attributes.position.needsUpdate = true;
  }

  setMagnet(active: boolean): void {
    this.magnetActive = active;
  }

  setCoinMultiplier(multiplier: number): void {
    this.coinMultiplier =
      Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1;
  }

  reset(): void {
    for (const record of this.records) {
      if (!record) continue;
      this.body.setMatrixAt(record.index, this.hiddenMatrix);
      this.rim.setMatrixAt(record.index, this.hiddenMatrix);
    }
    this.records.fill(null);
    this.freeIndices.length = 0;
    for (let index = COINS.maxActive - 1; index >= 0; index -= 1) {
      this.freeIndices.push(index);
    }
    this.body.instanceMatrix.needsUpdate = true;
    this.rim.instanceMatrix.needsUpdate = true;
    this.glow.geometry.setDrawRange(0, 0);
    this.rng = new Rng(0x51c0ffee);
    this.nextId = 1;
    this.nextPatternDistance = COINS.initialPatternDistance;
    this.magnetActive = false;
    this.coinMultiplier = 1;
  }

  dispose(): void {
    this.scene.remove(this.body, this.rim, this.glow);
    this.body.geometry.dispose();
    this.rim.geometry.dispose();
    this.glow.geometry.dispose();
    (this.body.material as THREE.Material).dispose();
    (this.rim.material as THREE.Material).dispose();
    (this.glow.material as THREE.Material).dispose();
  }

  private spawnPattern(baseDistance: number): number {
    const kind = this.rng.int(0, 3);
    const placements: Array<{ offset: number; lane: number }> = [];

    if (kind === 0) {
      const lane = this.rng.int(0, 2);
      const count = this.rng.int(5, 8);
      for (let i = 0; i < count; i += 1) {
        placements.push({ offset: i * COINS.spacing, lane });
      }
    } else if (kind === 1) {
      let lane = this.rng.int(0, 2);
      let direction = this.rng.chance(0.5) ? -1 : 1;
      const count = this.rng.int(7, 10);
      for (let i = 0; i < count; i += 1) {
        placements.push({ offset: i * COINS.spacing, lane });
        if (i % 2 === 1) {
          if (lane + direction < 0 || lane + direction > 2) {
            direction *= -1;
          }
          lane = THREE.MathUtils.clamp(lane + direction, 0, 2);
        }
      }
    } else if (kind === 2) {
      const sequence = [0, 1, 2, 1, 0];
      for (let i = 0; i < sequence.length; i += 1) {
        for (let j = 0; j < 2; j += 1) {
          placements.push({
            offset: (i * 2 + j) * COINS.spacing,
            lane: sequence[i],
          });
        }
      }
    } else {
      const rows = this.rng.int(1, 2);
      for (let row = 0; row < rows; row += 1) {
        const lanes = row === 0 ? [0, 1, 2] : [0, 2];
        for (const lane of lanes) {
          placements.push({ offset: row * COINS.spacing, lane });
        }
      }
    }

    let maxOffset = 0;
    for (const placement of placements) {
      const spawned = this.spawnCoin(
        baseDistance + placement.offset,
        LANES[placement.lane],
      );
      if (!spawned) break;
      maxOffset = Math.max(maxOffset, placement.offset);
    }

    return maxOffset;
  }

  private spawnCoin(distance: number, x: number): boolean {
    const index = this.freeIndices.pop();
    if (index === undefined) return false;

    const record: CoinRecord = {
      index,
      id: this.nextId++,
      distance,
      x,
      phase: this.rng.range(0, Math.PI * 2),
      collected: false,
    };

    this.records[index] = record;
    this.matrix.makeRotationY(record.phase);
    this.matrix.setPosition(x, COINS.height, -distance);
    this.body.setMatrixAt(index, this.matrix);
    this.rim.setMatrixAt(index, this.matrix);
    return true;
  }
}
