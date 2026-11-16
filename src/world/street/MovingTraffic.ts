import * as THREE from 'three';
import { bakeStaticGroupAs } from '../../core/bakeStaticGroup';
import { LANES } from '../../config/balance';
import type { StreetMaterials } from './StreetMaterials';

type TrafficKind = 'auto' | 'scooter' | 'bicycle';

interface TrafficActor {
  root: THREE.Group;
  material: THREE.MeshStandardMaterial;
  kind: TrafficKind;
  laneX: number;
  distanceAhead: number;
  approachSpeed: number;
  driftPhase: number;
}

const ACTOR_COUNT = 6;
const MIN_AHEAD = 76;
const MAX_AHEAD = 202;
const FADE_OUT_END = 94;
const FADE_IN_START = 188;

/**
 * Ambient Traffic Crossing vehicles. They stay well ahead of the player and
 * fade out before the player could reach them, so they never behave like a
 * collision hazard. Phase 3 adds real moving obstacles.
 */
export class MovingTraffic {
  readonly root = new THREE.Group();

  private readonly actors: TrafficActor[] = [];
  private readonly rng = new TrafficRng(0x51a7c0de);
  private visible = false;
  private time = 0;

  constructor(materials: StreetMaterials) {
    this.root.name = 'moving-traffic';
    this.root.visible = false;

    const kinds: TrafficKind[] = [
      'auto',
      'scooter',
      'bicycle',
      'auto',
      'scooter',
      'bicycle',
    ];
    const laneChoices = [LANES[0], LANES[2]];

    for (let index = 0; index < ACTOR_COUNT; index += 1) {
      const kind = kinds[index];
      const material = materials.metal.clone();
      material.name = `movingTraffic-${kind}-${index}`;
      material.transparent = true;
      material.opacity = 0;
      material.depthWrite = false;

      const source = new THREE.Group();
      if (kind === 'auto') this.buildAuto(source, materials);
      else if (kind === 'scooter') this.buildScooter(source, materials);
      else this.buildBicycle(source, materials);

      const baked = bakeStaticGroupAs(source, material, false, false);
      const distanceAhead =
        96 + (index / ACTOR_COUNT) * 82 + this.rng.range(-8, 8);

      const actor: TrafficActor = {
        root: baked,
        material,
        kind,
        laneX: laneChoices[index % laneChoices.length],
        distanceAhead,
        approachSpeed: this.rng.range(2.5, 4.2),
        driftPhase: this.rng.range(0, Math.PI * 2),
      };
      this.root.add(actor.root);
      this.actors.push(actor);
    }
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    this.root.visible = visible;
  }

  update(playerZ: number, playerX: number, dt: number, active: boolean): void {
    if (!active) {
      this.setVisible(false);
      return;
    }

    this.setVisible(true);
    this.time += dt;

    for (const actor of this.actors) {
      actor.distanceAhead -= actor.approachSpeed * dt;
      if (actor.distanceAhead <= MIN_AHEAD) {
        actor.distanceAhead = MAX_AHEAD + this.rng.range(0, 10);
        actor.approachSpeed = this.rng.range(2.5, 4.2);
      }

      let opacity = 1;
      if (actor.distanceAhead < FADE_OUT_END) {
        opacity = THREE.MathUtils.clamp(
          (actor.distanceAhead - MIN_AHEAD) / (FADE_OUT_END - MIN_AHEAD),
          0,
          1,
        );
      } else if (actor.distanceAhead > FADE_IN_START) {
        opacity = THREE.MathUtils.clamp(
          (MAX_AHEAD - actor.distanceAhead) / (MAX_AHEAD - FADE_IN_START),
          0,
          1,
        );
      }
      actor.material.opacity = opacity * 0.98;
      actor.root.visible = opacity > 0.02;

      const drift = Math.sin(this.time * 0.55 + actor.driftPhase) * 0.16;
      const laneOffset = (playerX - actor.laneX) * 0.02;
      actor.root.position.set(
        actor.laneX + drift + laneOffset,
        0.01,
        playerZ - actor.distanceAhead,
      );
      actor.root.rotation.y =
        this.time * 0.12 * (actor.laneX < 0 ? -1 : 1) * 0.02;
    }
  }

  dispose(): void {
    for (const actor of this.actors) {
      actor.root.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.isMesh) mesh.geometry.dispose();
      });
      actor.material.dispose();
    }
    this.root.clear();
    this.actors.length = 0;
  }

  private buildAuto(group: THREE.Group, materials: StreetMaterials): void {
    const body = this.rng.chance(0.5) ? 0xe5b83f : 0x2f7d4a;
    const accent = body === 0xe5b83f ? 0x2f7d4a : 0xe5b83f;

    addShadow(group, materials, 1.4, 2.6);
    addBox(group, materials, accent, 1.12, 0.42, 2.15, 0, 0.5, 0);
    addBox(group, materials, body, 1.12, 0.6, 2.15, 0, 0.98, 0);
    addBox(group, materials, body, 1.0, 0.68, 1.2, 0, 1.42, -0.12);
    addBox(group, materials, 0x2f3c44, 0.94, 0.42, 1.02, 0, 1.45, -0.12);
    addBox(group, materials, 0x25282c, 1.03, 0.08, 1.3, 0, 1.8, -0.1);
    addBox(group, materials, 0x25282c, 1.16, 0.08, 1.8, 0, 0.28, 0);
    addBox(group, materials, 0xffe8ae, 0.3, 0.16, 0.05, 0, 1.0, -1.08);
    addBox(group, materials, 0x25282c, 0.8, 0.12, 0.08, 0, 0.84, 1.06);

    for (const z of [-0.72, 0.68]) {
      addWheel(group, materials, 0.28, 0.14, z, 0.28);
    }
  }

  private buildScooter(group: THREE.Group, materials: StreetMaterials): void {
    const body = this.rng.chance(0.5) ? 0xb6493d : 0x316f98;
    addShadow(group, materials, 1.0, 1.9);
    addBox(group, materials, 0x25282c, 0.34, 0.12, 1.25, 0, 0.52, 0.1);
    addBox(group, materials, body, 0.4, 0.38, 1.05, 0, 0.73, 0.12);
    addBox(group, materials, 0x24262a, 0.34, 0.12, 0.56, 0, 0.92, 0.18);
    addBox(group, materials, body, 0.3, 0.46, 0.12, 0, 0.82, -0.46);
    addBox(group, materials, 0x9b9c92, 0.66, 0.04, 0.04, 0, 1.06, -0.52);
    addBox(group, materials, 0xffe9b0, 0.18, 0.13, 0.05, 0, 0.92, -0.58);
    addBox(group, materials, 0x25282c, 0.46, 0.06, 0.18, 0, 0.42, 0.68);

    for (const z of [-0.52, 0.54]) {
      addWheel(group, materials, 0.24, 0.11, z, 0.24);
    }

    addRider(group, materials, body, false);
  }

  private buildBicycle(group: THREE.Group, materials: StreetMaterials): void {
    const frame = this.rng.chance(0.5) ? 0x365f6d : 0x7a3f35;
    addShadow(group, materials, 0.8, 1.85);

    addTorus(group, materials, 0x25282c, 0.34, 0.035, 0.42, -0.58);
    addTorus(group, materials, 0x25282c, 0.34, 0.035, 0.42, 0.58);
    addBox(group, materials, frame, 0.07, 0.07, 1.02, 0, 0.58, 0.0);
    addBox(group, materials, frame, 0.07, 0.5, 0.07, 0, 0.58, -0.5);
    addBox(group, materials, frame, 0.07, 0.52, 0.07, 0, 0.56, 0.48);
    addBox(group, materials, 0x25282c, 0.3, 0.06, 0.5, 0, 0.86, -0.35);
    addBox(group, materials, 0x25282c, 0.14, 0.06, 0.34, 0, 0.9, 0.42);
    addBox(group, materials, 0xb5b5aa, 0.62, 0.04, 0.04, 0, 1.0, -0.54);

    addRider(group, materials, frame, true);
  }
}

function addRider(
  group: THREE.Group,
  materials: StreetMaterials,
  accent: number,
  bent: boolean,
): void {
  const skin = 0x9a6a4f;
  const shirt = accent;
  const lean = bent ? 0.55 : 0.28;

  addBox(group, materials, 0x2f3438, 0.34, 0.22, 0.3, 0, 1.12, 0.18);
  addBox(group, materials, shirt, 0.38, 0.56, 0.24, 0, 1.34, 0.2 - lean * 0.1);
  addSphere(group, materials, skin, 0.135, 0, 1.73, 0.18 - lean * 0.12);
  addSphere(group, materials, 0x25282c, 0.14, 0, 1.79, 0.18 - lean * 0.12);
  addBox(group, materials, 0x2f3438, 0.12, 0.48, 0.18, -0.24, 1.35, 0.2);
  addBox(group, materials, 0x2f3438, 0.12, 0.48, 0.18, 0.24, 1.35, 0.2);
  addBox(group, materials, skin, 0.1, 0.1, 0.5, -0.18, 1.5, -0.05 - lean * 0.1);
  addBox(group, materials, skin, 0.1, 0.1, 0.5, 0.18, 1.5, -0.05 - lean * 0.1);
}

function addShadow(
  group: THREE.Group,
  materials: StreetMaterials,
  width: number,
  depth: number,
): void {
  addBox(group, materials, 0x1d211f, width, 0.006, depth, 0, 0.006, 0);
}

function addWheel(
  group: THREE.Group,
  materials: StreetMaterials,
  radius: number,
  thickness: number,
  z: number,
  y: number,
): void {
  const geometry = new THREE.CylinderGeometry(radius, radius, thickness, 12);
  colorGeometry(geometry, 0x24282a);
  const mesh = new THREE.Mesh(geometry, materials.metal);
  mesh.rotation.z = Math.PI / 2;
  mesh.position.set(0, y, z);
  group.add(mesh);
}

function addTorus(
  group: THREE.Group,
  materials: StreetMaterials,
  color: number,
  radius: number,
  tube: number,
  y: number,
  z: number,
): void {
  const geometry = new THREE.TorusGeometry(radius, tube, 6, 14);
  colorGeometry(geometry, color);
  const mesh = new THREE.Mesh(geometry, materials.metal);
  mesh.rotation.y = Math.PI / 2;
  mesh.position.set(0, y, z);
  group.add(mesh);
}

function addBox(
  group: THREE.Group,
  materials: StreetMaterials,
  color: number,
  width: number,
  height: number,
  depth: number,
  x: number,
  y: number,
  z: number,
): void {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  colorGeometry(geometry, color);
  const mesh = new THREE.Mesh(geometry, materials.metal);
  mesh.position.set(x, y, z);
  group.add(mesh);
}

function addSphere(
  group: THREE.Group,
  materials: StreetMaterials,
  color: number,
  radius: number,
  x: number,
  y: number,
  z: number,
): void {
  const geometry = new THREE.SphereGeometry(radius, 8, 6);
  colorGeometry(geometry, color);
  const mesh = new THREE.Mesh(geometry, materials.metal);
  mesh.position.set(x, y, z);
  group.add(mesh);
}

function colorGeometry(geometry: THREE.BufferGeometry, color: number): void {
  const count = geometry.attributes.position.count;
  const data = new Float32Array(count * 3);
  const value = new THREE.Color(color);
  for (let index = 0; index < count; index += 1) {
    data[index * 3] = value.r;
    data[index * 3 + 1] = value.g;
    data[index * 3 + 2] = value.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(data, 3));
}

class TrafficRng {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }
}
