/**
 * PowerUpSystem
 *
 * Spawns floating power-up collectibles, handles collection and owns the
 * active power-up timers. Visual/gameplay effects are applied by Game through
 * the onCollect callback and the expired list returned from update().
 */
import * as THREE from 'three';
import { POWERUPS } from '../config/balance';
import { Rng } from '../core/Rng';
import type { SpawnReservations } from '../core/SpawnReservations';
import { buildPowerUpModel } from './PowerUpModels';
import {
  POWERUP_LABELS,
  POWERUP_TYPES,
  PowerUpTimers,
  type PowerUpType,
} from './PowerUpTimers';

interface PowerUpRecord {
  id: number;
  type: PowerUpType;
  group: THREE.Group;
  x: number;
  distance: number;
  phase: number;
  active: boolean;
}

export interface PowerUpCollectEvent {
  type: PowerUpType;
  position: THREE.Vector3;
}

export interface PowerUpSystemCallbacks {
  onCollect: (event: PowerUpCollectEvent) => void;
}

export { POWERUP_LABELS, POWERUP_TYPES };
export type { PowerUpType };

export class PowerUpSystem {
  readonly timers = new PowerUpTimers();

  private readonly records: PowerUpRecord[] = [];
  private rng = new Rng(0x9a71e5c3);
  private nextDistance = POWERUPS.initialDistance;
  private nextId = 1;
  private lastType: PowerUpType | null = null;

  constructor(
    private readonly scene: THREE.Scene,
    private readonly callbacks: PowerUpSystemCallbacks,
    private readonly reservations?: SpawnReservations,
  ) {}

  update(
    dt: number,
    time: number,
    playerDistance: number,
    playerX: number,
  ): PowerUpType[] {
    this.spawnAhead(playerDistance);

    for (let index = this.records.length - 1; index >= 0; index -= 1) {
      const record = this.records[index];
      if (!record.active) continue;

      const dz = Math.abs(record.distance - playerDistance);
      const dx = Math.abs(record.x - playerX);

      if (dz <= POWERUPS.collectRadiusZ && dx <= POWERUPS.collectRadiusX) {
        record.active = false;
        this.timers.activate(record.type);
        this.callbacks.onCollect({
          type: record.type,
          position: new THREE.Vector3(record.x, 1.25, -record.distance),
        });
        this.removeRecord(index);
        continue;
      }

      if (record.distance < playerDistance - 15) {
        record.active = false;
        this.removeRecord(index);
        continue;
      }

      record.group.rotation.y = time * 1.9 + record.phase;
      record.group.position.y =
        1.15 + Math.sin(time * 2.1 + record.phase) * 0.11;
    }

    return this.timers.update(dt);
  }

  consume(type: PowerUpType): boolean {
    return this.timers.remove(type);
  }

  isActive(type: PowerUpType): boolean {
    return this.timers.isActive(type);
  }

  reset(): void {
    for (let index = this.records.length - 1; index >= 0; index -= 1) {
      this.removeRecord(index);
    }
    this.records.length = 0;
    this.rng = new Rng(0x9a71e5c3);
    this.nextDistance = POWERUPS.initialDistance;
    this.nextId = 1;
    this.lastType = null;
    this.timers.clear();
  }

  dispose(): void {
    for (let index = this.records.length - 1; index >= 0; index -= 1) {
      this.removeRecord(index);
    }
    this.records.length = 0;
    this.timers.clear();
  }

  private spawnAhead(playerDistance: number): void {
    while (this.nextDistance < playerDistance + POWERUPS.spawnAhead) {
      const activeCount = this.records.filter((record) => record.active).length;
      if (activeCount >= POWERUPS.maxActive) {
        this.nextDistance += this.rng.range(
          POWERUPS.gapMin,
          POWERUPS.gapMax,
        );
        continue;
      }

      const lane = this.rng.int(0, 2);
      if (
        this.reservations &&
        !this.reservations.isClear(this.nextDistance, 1.4, [lane], 7)
      ) {
        this.nextDistance += 11;
        continue;
      }

      this.spawnPowerUp(this.nextDistance, lane);
      this.nextDistance += this.rng.range(POWERUPS.gapMin, POWERUPS.gapMax);
    }
  }

  private spawnPowerUp(distance: number, laneIndex: number): void {
    const type = this.pickType();
    const group = buildPowerUpModel(type);
    const x = [-2.7, 0, 2.7][laneIndex];
    group.position.set(x, 1.15, -distance);
    this.scene.add(group);

    this.records.push({
      id: this.nextId++,
      type,
      group,
      x,
      distance,
      phase: this.rng.range(0, Math.PI * 2),
      active: true,
    });
    this.lastType = type;

    this.reservations?.reserve({
      owner: 'powerup',
      distance,
      halfLength: 1.4,
      lanes: [laneIndex],
      pad: 2,
    });
  }

  private pickType(): PowerUpType {
    const candidates = POWERUP_TYPES.filter((type) => type !== this.lastType);
    return this.rng.pick(candidates.length > 0 ? candidates : POWERUP_TYPES);
  }

  private removeRecord(index: number): void {
    const record = this.records[index];
    if (!record) return;
    this.scene.remove(record.group);
    disposeGroup(record.group);
    this.records.splice(index, 1);
  }
}

function disposeGroup(group: THREE.Group): void {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();

  group.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) geometries.add(mesh.geometry);
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (!material) return;
    const list = Array.isArray(material) ? material : [material];
    for (const item of list) {
      materials.add(item);
      const map = (item as THREE.MeshBasicMaterial).map;
      if (map) textures.add(map);
    }
  });

  for (const geometry of geometries) geometry.dispose();
  for (const texture of textures) texture.dispose();
  for (const material of materials) material.dispose();
}
