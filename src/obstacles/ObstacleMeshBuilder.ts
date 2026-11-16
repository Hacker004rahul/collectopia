/**
 * ObstacleMeshBuilder
 * Builds the visual mesh for each obstacle kind using shared materials.
 * All geometry is created once per kind and reused via clone() so we never
 * allocate new BufferGeometry per obstacle instance.
 */
import * as THREE from 'three';

export type ObstacleKind =
  | 'wall-concrete'
  | 'wall-brick'
  | 'wall-wood'
  | 'wall-low'
  | 'wall-moving'
  | 'wall-breakable'
  | 'barrier'
  | 'crate'
  | 'water-container'
  | 'scooter'
  | 'motorcycle'
  | 'auto-rickshaw'
  | 'bicycle'
  | 'vegetable-cart';

/** AABB half-extents (x, y, z) for collision — kept slightly smaller than visual */
export const OBSTACLE_HALF_EXTENTS: Record<ObstacleKind, THREE.Vector3> = {
  'wall-concrete':   new THREE.Vector3(1.15, 1.1,  0.22),
  'wall-brick':      new THREE.Vector3(1.15, 1.0,  0.22),
  'wall-wood':       new THREE.Vector3(1.05, 0.95, 0.18),
  'wall-low':        new THREE.Vector3(1.1,  0.52, 0.22),
  'wall-moving':     new THREE.Vector3(1.1,  1.1,  0.22),
  'wall-breakable':  new THREE.Vector3(1.05, 1.0,  0.22),
  'barrier':         new THREE.Vector3(0.88, 0.52, 0.18),
  'crate':           new THREE.Vector3(0.42, 0.42, 0.42),
  'water-container': new THREE.Vector3(0.38, 0.55, 0.38),
  'scooter':         new THREE.Vector3(0.28, 0.62, 0.72),
  'motorcycle':      new THREE.Vector3(0.28, 0.72, 0.72),
  'auto-rickshaw':   new THREE.Vector3(0.62, 0.88, 1.05),
  'bicycle':         new THREE.Vector3(0.22, 0.72, 0.62),
  'vegetable-cart':  new THREE.Vector3(0.55, 0.62, 1.05),
};

// ─── shared materials (created once) ────────────────────────────────────────

function mat(color: number, roughness = 0.88, metalness = 0): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, vertexColors: false });
}

const M = {
  concrete:  mat(0xb2a99a),
  brick:     mat(0xa85c44),
  wood:      mat(0x8b6340),
  woodDark:  mat(0x5e3f28),
  metal:     mat(0x7a7e7a, 0.52, 0.28),
  metalDark: mat(0x3a3e3c, 0.48, 0.32),
  yellow:    mat(0xe5b83f),
  green:     mat(0x2f7d4a),
  red:       mat(0xc94040),
  white:     mat(0xe8e4d8),
  orange:    mat(0xd96b2f),
  rubber:    mat(0x252a2d, 0.95),
  glass:     mat(0x587a8a, 0.22, 0.18),
  fabric:    mat(0x3d5a7a, 1.0),
  stripe:    mat(0xd9d2c4),
  breakMark: mat(0xff6b2f, 0.7),
};

export const OBSTACLE_MATERIALS: THREE.Material[] = Object.values(M);

// ─── geometry helpers ────────────────────────────────────────────────────────

function box(
  w: number, h: number, d: number,
  x: number, y: number, z: number,
  material: THREE.MeshStandardMaterial,
  cast = true,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  return mesh;
}

function cyl(
  rt: number, rb: number, h: number, segs: number,
  x: number, y: number, z: number,
  material: THREE.MeshStandardMaterial,
  rotZ = 0,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), material);
  mesh.position.set(x, y, z);
  mesh.rotation.z = rotZ;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// ─── builders ────────────────────────────────────────────────────────────────

function buildWallConcrete(): THREE.Group {
  const g = new THREE.Group();
  g.add(box(2.4, 2.2, 0.38, 0, 1.1, 0, M.concrete));
  // horizontal band
  g.add(box(2.44, 0.12, 0.42, 0, 2.22, 0, M.stripe));
  g.add(box(2.44, 0.12, 0.42, 0, 0.06, 0, M.stripe));
  return g;
}

function buildWallBrick(): THREE.Group {
  const g = new THREE.Group();
  g.add(box(2.4, 2.0, 0.38, 0, 1.0, 0, M.brick));
  g.add(box(2.44, 0.1, 0.42, 0, 2.06, 0, M.concrete));
  g.add(box(2.44, 0.1, 0.42, 0, 0.05, 0, M.concrete));
  return g;
}

function buildWallWood(): THREE.Group {
  const g = new THREE.Group();
  // planks
  for (let i = 0; i < 5; i++) {
    g.add(box(2.2, 0.32, 0.12, 0, 0.18 + i * 0.36, 0, i % 2 === 0 ? M.wood : M.woodDark));
  }
  // cross brace
  g.add(box(0.1, 1.85, 0.16, -0.8, 0.92, 0, M.woodDark));
  g.add(box(0.1, 1.85, 0.16,  0.8, 0.92, 0, M.woodDark));
  return g;
}

function buildWallLow(): THREE.Group {
  const g = new THREE.Group();
  g.add(box(2.4, 1.04, 0.38, 0, 0.52, 0, M.concrete));
  g.add(box(2.44, 0.1, 0.42, 0, 1.05, 0, M.stripe));
  return g;
}

function buildWallMoving(): THREE.Group {
  // Same visual as concrete but with a yellow warning stripe
  const g = new THREE.Group();
  g.add(box(2.4, 2.2, 0.38, 0, 1.1, 0, M.concrete));
  g.add(box(2.44, 0.22, 0.42, 0, 1.1, 0, M.yellow));
  g.add(box(2.44, 0.1,  0.42, 0, 2.22, 0, M.stripe));
  return g;
}

function buildWallBreakable(): THREE.Group {
  // Brick wall with orange X crack marks to signal breakability
  const g = new THREE.Group();
  g.add(box(2.4, 2.0, 0.38, 0, 1.0, 0, M.brick));
  // crack X
  g.add(box(2.2, 0.08, 0.04, 0, 1.0, -0.2, M.breakMark));
  g.add(box(0.08, 2.0, 0.04, 0, 1.0, -0.2, M.breakMark));
  g.add(box(2.44, 0.1, 0.42, 0, 2.06, 0, M.concrete));
  return g;
}

function buildBarrier(): THREE.Group {
  // Jersey barrier / construction barrier
  const g = new THREE.Group();
  g.add(box(1.8, 0.32, 0.36, 0, 0.16, 0, M.concrete));
  g.add(box(1.72, 0.72, 0.28, 0, 0.68, 0, M.concrete));
  // red/white stripes
  for (let i = 0; i < 3; i++) {
    g.add(box(1.74, 0.1, 0.3, 0, 0.38 + i * 0.22, 0, i % 2 === 0 ? M.red : M.white));
  }
  return g;
}

function buildCrate(): THREE.Group {
  const g = new THREE.Group();
  g.add(box(0.88, 0.88, 0.88, 0, 0.44, 0, M.wood));
  // slats
  g.add(box(0.9, 0.06, 0.9, 0, 0.06, 0, M.woodDark));
  g.add(box(0.9, 0.06, 0.9, 0, 0.82, 0, M.woodDark));
  g.add(box(0.06, 0.9, 0.9, -0.42, 0.44, 0, M.woodDark));
  g.add(box(0.06, 0.9, 0.9,  0.42, 0.44, 0, M.woodDark));
  return g;
}

function buildWaterContainer(): THREE.Group {
  const g = new THREE.Group();
  g.add(cyl(0.38, 0.38, 1.1, 12, 0, 0.55, 0, M.metal));
  g.add(cyl(0.4,  0.4,  0.06, 12, 0, 1.13, 0, M.metalDark));
  g.add(cyl(0.4,  0.4,  0.06, 12, 0, 0.03, 0, M.metalDark));
  return g;
}

function buildScooter(): THREE.Group {
  const g = new THREE.Group();
  g.add(box(0.4, 0.34, 1.14, 0, 0.58, 0, M.yellow));
  g.add(box(0.34, 0.13, 0.5, 0, 0.83, 0.15, M.fabric));
  g.add(box(0.36, 0.52, 0.18, 0, 0.66, -0.5, M.yellow));
  g.add(box(0.66, 0.04, 0.04, 0, 0.98, -0.48, M.metal));
  for (const wz of [-0.52, 0.48]) {
    g.add(cyl(0.23, 0.23, 0.13, 12, 0, 0.24, wz, M.rubber, Math.PI / 2));
  }
  return g;
}

function buildMotorcycle(): THREE.Group {
  const g = new THREE.Group();
  g.add(box(0.36, 0.3, 0.56, 0, 0.74, -0.12, M.red));
  g.add(box(0.34, 0.14, 1.1, 0, 0.52, 0, M.metalDark));
  g.add(box(0.3, 0.1, 0.66, 0, 0.82, 0.36, M.fabric));
  g.add(box(0.66, 0.04, 0.04, 0, 1.01, -0.58, M.metal));
  for (const wz of [-0.64, 0.6]) {
    g.add(cyl(0.31, 0.31, 0.11, 14, 0, 0.31, wz, M.rubber, Math.PI / 2));
  }
  return g;
}

function buildAutoRickshaw(): THREE.Group {
  const g = new THREE.Group();
  g.add(box(1.0, 0.55, 1.7, 0, 0.52, 0, M.green));
  g.add(box(1.0, 0.57, 1.7, 0, 0.97, 0, M.yellow));
  g.add(box(0.92, 0.64, 1.02, 0, 1.34, -0.14, M.yellow));
  g.add(box(0.82, 0.42, 0.06, 0, 1.36, -0.68, M.glass));
  g.add(box(0.96, 0.08, 1.14, 0, 1.7, -0.1, M.fabric));
  for (const wx of [-0.55, 0.55]) {
    g.add(cyl(0.26, 0.26, 0.14, 12, wx, 0.26, 0.58, M.rubber, Math.PI / 2));
  }
  g.add(cyl(0.22, 0.22, 0.12, 12, 0, 0.22, -0.64, M.rubber, Math.PI / 2));
  return g;
}

function buildBicycle(): THREE.Group {
  const g = new THREE.Group();
  g.add(box(0.07, 0.07, 1.02, 0, 0.58, 0, M.metal));
  g.add(box(0.07, 0.5, 0.07, 0, 0.58, -0.5, M.metal));
  g.add(box(0.07, 0.52, 0.07, 0, 0.56, 0.48, M.metal));
  g.add(box(0.62, 0.04, 0.04, 0, 1.0, -0.54, M.metal));
  for (const wz of [-0.58, 0.58]) {
    g.add(cyl(0.34, 0.34, 0.06, 14, 0, 0.34, wz, M.rubber, Math.PI / 2));
  }
  return g;
}

function buildVegetableCart(): THREE.Group {
  const g = new THREE.Group();
  g.add(box(1.0, 0.16, 2.1, 0, 0.82, 0, M.wood));
  for (const sx of [-0.42, 0.42]) {
    g.add(box(0.1, 0.68, 2.0, sx, 0.48, 0, M.woodDark));
  }
  for (const wz of [-0.68, 0.68]) {
    g.add(cyl(0.38, 0.38, 0.1, 12, 0, 0.39, wz, M.rubber, Math.PI / 2));
  }
  // produce pile
  g.add(box(0.8, 0.22, 1.6, 0, 1.06, 0, M.orange));
  return g;
}

// ─── public API ──────────────────────────────────────────────────────────────

const BUILDERS: Record<ObstacleKind, () => THREE.Group> = {
  'wall-concrete':   buildWallConcrete,
  'wall-brick':      buildWallBrick,
  'wall-wood':       buildWallWood,
  'wall-low':        buildWallLow,
  'wall-moving':     buildWallMoving,
  'wall-breakable':  buildWallBreakable,
  'barrier':         buildBarrier,
  'crate':           buildCrate,
  'water-container': buildWaterContainer,
  'scooter':         buildScooter,
  'motorcycle':      buildMotorcycle,
  'auto-rickshaw':   buildAutoRickshaw,
  'bicycle':         buildBicycle,
  'vegetable-cart':  buildVegetableCart,
};

export function buildObstacleMesh(kind: ObstacleKind): THREE.Group {
  return BUILDERS[kind]();
}

export function disposeObstacleMaterials(): void {
  for (const m of OBSTACLE_MATERIALS) m.dispose();
}
