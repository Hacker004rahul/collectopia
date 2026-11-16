/**
 * EnemyMeshBuilder
 *
 * Builds procedural low-poly 3D models for each enemy type.
 * All enemies are visually distinct from background pedestrians, props and
 * obstacles.  They share a common upright humanoid silhouette but differ in
 * colour, scale, build and distinguishing features so the player can read their
 * type at a glance.
 *
 * Enemy types
 *  basic  – orange kurta, lean build, standard size
 *  fast   – yellow track-suit, slim, slightly shorter
 *  guard  – dark uniform, broad, helmet-style cap
 *  heavy  – red shirt, stocky and tall, large head
 *  boss   – black and gold, largest, crown ornament
 *
 * No GLB assets are used; all geometry is Three.js primitives.
 */
import * as THREE from 'three';

export type EnemyKind = 'basic' | 'fast' | 'guard' | 'heavy' | 'boss';

// ─── shared material helpers ─────────────────────────────────────────────────

function mat(
  color: number,
  roughness = 0.82,
  emissive = 0,
  emissiveIntensity = 0,
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0,
    flatShading: true,
    emissive,
    emissiveIntensity,
  });
}

// ─── geometry helpers ────────────────────────────────────────────────────────

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  material: THREE.MeshStandardMaterial,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
}

function sphere(
  r: number,
  x: number,
  y: number,
  z: number,
  material: THREE.MeshStandardMaterial,
  wSeg = 10,
  hSeg = 10,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, wSeg, hSeg), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
}

function capsule(
  r: number,
  len: number,
  x: number,
  y: number,
  z: number,
  material: THREE.MeshStandardMaterial,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 4, 8), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
}

// ─── builders ────────────────────────────────────────────────────────────────

function buildBasic(): THREE.Group {
  const g = new THREE.Group();
  const skin  = mat(0xd4906a, 0.78);
  const shirt = mat(0xe07820, 0.82);  // orange kurta
  const pants = mat(0x2b3a52, 0.88);
  const shoe  = mat(0x1a1a1a, 0.95);
  const hair  = mat(0x1a1a20, 0.9);

  // legs
  g.add(box(0.19, 0.58, 0.18, -0.14, 0.29, 0, pants));
  g.add(box(0.19, 0.58, 0.18,  0.14, 0.29, 0, pants));
  // feet
  g.add(box(0.21, 0.1, 0.32, -0.14, 0.05, -0.07, shoe));
  g.add(box(0.21, 0.1, 0.32,  0.14, 0.05, -0.07, shoe));
  // torso
  g.add(capsule(0.26, 0.38, 0, 1.18, 0, shirt));
  // arms
  g.add(box(0.14, 0.52, 0.14, -0.44, 1.14, 0, shirt));
  g.add(box(0.14, 0.52, 0.14,  0.44, 1.14, 0, shirt));
  // hands
  g.add(sphere(0.09, -0.44, 0.84, 0, skin));
  g.add(sphere(0.09,  0.44, 0.84, 0, skin));
  // neck + head
  g.add(sphere(0.1, 0, 1.56, 0, skin));
  g.add(sphere(0.26, 0, 1.88, 0, skin, 10, 10));
  // hair
  g.add(sphere(0.265, 0, 1.92, 0, hair, 10, 8));
  // eyes (simple dark spots)
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x101018 });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), eyeMat);
  eyeL.position.set(-0.1, 1.9, -0.24);
  g.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.set(0.1, 1.9, -0.24);
  g.add(eyeR);

  return g;
}

function buildFast(): THREE.Group {
  const g = new THREE.Group();
  const skin    = mat(0xc8846a, 0.78);
  const suit    = mat(0xd9b820, 0.75);  // yellow tracksuit
  const stripe  = mat(0xffffff, 0.9);
  const shoe    = mat(0x222222, 0.95);
  const hair    = mat(0x0d0d14, 0.9);

  // slim build — slightly shorter (scale applied to group)
  g.scale.set(0.9, 0.92, 0.9);

  g.add(box(0.17, 0.56, 0.17, -0.13, 0.28, 0, suit));
  g.add(box(0.17, 0.56, 0.17,  0.13, 0.28, 0, suit));
  // side stripe on pants
  g.add(box(0.04, 0.56, 0.04, -0.22, 0.28, 0, stripe));
  g.add(box(0.04, 0.56, 0.04,  0.22, 0.28, 0, stripe));
  g.add(box(0.21, 0.1, 0.3, -0.13, 0.05, -0.07, shoe));
  g.add(box(0.21, 0.1, 0.3,  0.13, 0.05, -0.07, shoe));
  g.add(capsule(0.24, 0.36, 0, 1.16, 0, suit));
  // side stripe on jacket
  g.add(box(0.04, 0.44, 0.04, -0.26, 1.16, 0, stripe));
  g.add(box(0.04, 0.44, 0.04,  0.26, 1.16, 0, stripe));
  g.add(box(0.13, 0.5, 0.13, -0.4, 1.12, 0, suit));
  g.add(box(0.13, 0.5, 0.13,  0.4, 1.12, 0, suit));
  g.add(sphere(0.085, -0.4, 0.82, 0, skin));
  g.add(sphere(0.085,  0.4, 0.82, 0, skin));
  g.add(sphere(0.09, 0, 1.54, 0, skin));
  g.add(sphere(0.24, 0, 1.84, 0, skin, 10, 10));
  g.add(sphere(0.245, 0, 1.88, 0, hair, 10, 8));

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x101018 });
  [-0.09, 0.09].forEach((ex) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.038, 6, 6), eyeMat);
    e.position.set(ex, 1.86, -0.23);
    g.add(e);
  });

  return g;
}

function buildGuard(): THREE.Group {
  const g = new THREE.Group();
  const skin    = mat(0xb87050, 0.78);
  const uniform = mat(0x1e2d4a, 0.85);  // dark navy uniform
  const belt    = mat(0x2a2010, 0.92);
  const shoe    = mat(0x0a0a0a, 0.95);
  const helmet  = mat(0x2b3a30, 0.76, 0x112218, 0.08);  // dark-green helmet

  // broader torso
  g.add(box(0.22, 0.6, 0.2, -0.16, 0.3, 0, uniform));
  g.add(box(0.22, 0.6, 0.2,  0.16, 0.3, 0, uniform));
  g.add(box(0.24, 0.1, 0.34, -0.16, 0.05, -0.08, shoe));
  g.add(box(0.24, 0.1, 0.34,  0.16, 0.05, -0.08, shoe));
  g.add(capsule(0.3, 0.44, 0, 1.22, 0, uniform));
  // belt
  g.add(box(0.72, 0.1, 0.36, 0, 0.9, 0, belt));
  g.add(box(0.14, 0.14, 0.14, 0, 0.9, -0.19, belt));
  // arms
  g.add(box(0.16, 0.54, 0.16, -0.5, 1.18, 0, uniform));
  g.add(box(0.16, 0.54, 0.16,  0.5, 1.18, 0, uniform));
  g.add(sphere(0.1, -0.5, 0.86, 0, skin));
  g.add(sphere(0.1,  0.5, 0.86, 0, skin));
  g.add(sphere(0.1, 0, 1.6, 0, skin));
  g.add(sphere(0.28, 0, 1.94, 0, skin, 10, 10));
  // helmet
  const hMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6),
    helmet,
  );
  hMesh.position.set(0, 2.0, 0.02);
  hMesh.castShadow = true;
  g.add(hMesh);
  // helmet brim
  g.add(box(0.72, 0.06, 0.1, 0, 1.78, -0.16, helmet));

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0a0a14 });
  [-0.11, 0.11].forEach((ex) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.042, 6, 6), eyeMat);
    e.position.set(ex, 1.95, -0.26);
    g.add(e);
  });

  return g;
}

function buildHeavy(): THREE.Group {
  const g = new THREE.Group();
  const skin    = mat(0xc07850, 0.78);
  const shirt   = mat(0xc42020, 0.82);  // red shirt
  const pants   = mat(0x1a1a2a, 0.88);
  const shoe    = mat(0x0d0d0d, 0.95);
  const hair    = mat(0x0d0d0d, 0.9);
  const beard   = mat(0x1a1414, 0.88);

  // stocky and tall — 1.1x scale
  g.scale.set(1.1, 1.08, 1.1);

  g.add(box(0.26, 0.64, 0.24, -0.18, 0.32, 0, pants));
  g.add(box(0.26, 0.64, 0.24,  0.18, 0.32, 0, pants));
  g.add(box(0.28, 0.12, 0.38, -0.18, 0.06, -0.09, shoe));
  g.add(box(0.28, 0.12, 0.38,  0.18, 0.06, -0.09, shoe));
  // wide torso
  g.add(capsule(0.34, 0.5, 0, 1.28, 0, shirt));
  g.add(box(0.18, 0.56, 0.18, -0.56, 1.22, 0, shirt));
  g.add(box(0.18, 0.56, 0.18,  0.56, 1.22, 0, shirt));
  g.add(sphere(0.12, -0.56, 0.9, 0, skin));
  g.add(sphere(0.12,  0.56, 0.9, 0, skin));
  // large head
  g.add(sphere(0.12, 0, 1.68, 0, skin));
  g.add(sphere(0.34, 0, 2.08, 0, skin, 10, 10));
  g.add(sphere(0.345, 0, 2.12, 0, hair, 10, 8));
  // beard
  g.add(box(0.42, 0.22, 0.14, 0, 1.9, -0.3, beard));

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0a0a14 });
  [-0.14, 0.14].forEach((ex) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), eyeMat);
    e.position.set(ex, 2.1, -0.32);
    g.add(e);
  });

  // health indicator band (orange stripe on shirt)
  g.add(box(0.78, 0.06, 0.74, 0, 1.46, 0, mat(0xf07820, 0.7, 0xf07820, 0.22)));

  return g;
}

function buildBoss(): THREE.Group {
  const g = new THREE.Group();
  const skin   = mat(0xb06840, 0.76);
  const jacket = mat(0x0d0d14, 0.72, 0x1a1a30, 0.1);  // black jacket
  const gold   = mat(0xd4a820, 0.52, 0xd4a820, 0.28);  // gold trim
  const pants  = mat(0x0a0a0a, 0.88);
  const boot   = mat(0x1a0a00, 0.82);
  const hair   = mat(0x060608, 0.9);

  // tallest and widest
  g.scale.set(1.18, 1.14, 1.18);

  g.add(box(0.28, 0.68, 0.26, -0.2, 0.34, 0, pants));
  g.add(box(0.28, 0.68, 0.26,  0.2, 0.34, 0, pants));
  g.add(box(0.3, 0.14, 0.42, -0.2, 0.07, -0.1, boot));
  g.add(box(0.3, 0.14, 0.42,  0.2, 0.07, -0.1, boot));
  // gold boot trim
  g.add(box(0.32, 0.06, 0.44, -0.2, 0.2, -0.1, gold));
  g.add(box(0.32, 0.06, 0.44,  0.2, 0.2, -0.1, gold));
  // jacket
  g.add(capsule(0.36, 0.56, 0, 1.36, 0, jacket));
  // gold lapels
  g.add(box(0.1, 0.6, 0.06, -0.18, 1.36, -0.33, gold));
  g.add(box(0.1, 0.6, 0.06,  0.18, 1.36, -0.33, gold));
  // arms
  g.add(box(0.19, 0.6, 0.19, -0.6, 1.3, 0, jacket));
  g.add(box(0.19, 0.6, 0.19,  0.6, 1.3, 0, jacket));
  // gold cuffs
  g.add(box(0.22, 0.08, 0.22, -0.6, 0.98, 0, gold));
  g.add(box(0.22, 0.08, 0.22,  0.6, 0.98, 0, gold));
  g.add(sphere(0.13, -0.6, 0.94, 0, skin));
  g.add(sphere(0.13,  0.6, 0.94, 0, skin));
  g.add(sphere(0.14, 0, 1.78, 0, skin));
  g.add(sphere(0.38, 0, 2.2, 0, skin, 12, 12));
  g.add(sphere(0.385, 0, 2.24, 0, hair, 12, 10));
  // crown / turban ornament
  g.add(box(0.72, 0.14, 0.72, 0, 2.52, 0, gold));
  g.add(box(0.52, 0.22, 0.52, 0, 2.66, 0, gold));
  g.add(box(0.3, 0.3, 0.3, 0, 2.82, 0, gold));
  // jewel on crown
  g.add(sphere(0.1, 0, 2.98, 0, mat(0xa00040, 0.4, 0xa00040, 0.5)));

  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x060008 });
  [-0.16, 0.16].forEach((ex) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6), eyeMat);
    e.position.set(ex, 2.22, -0.36);
    g.add(e);
  });

  // health bar backing (dark strip behind boss head)
  g.add(box(0.84, 0.1, 0.06, 0, 2.62, -0.42, mat(0x1a1a1a, 1.0)));
  // health bar fill — starts full, narrowed programmatically via scale.x
  const hpFill = new THREE.Mesh(
    new THREE.BoxGeometry(0.76, 0.06, 0.04),
    mat(0x22cc44, 0.6, 0x22cc44, 0.4),
  );
  hpFill.position.set(0, 2.62, -0.46);
  hpFill.name = 'bossHpFill';
  hpFill.castShadow = false;
  g.add(hpFill);

  return g;
}

// ─── public API ───────────────────────────────────────────────────────────────

const BUILDERS: Record<EnemyKind, () => THREE.Group> = {
  basic: buildBasic,
  fast:  buildFast,
  guard: buildGuard,
  heavy: buildHeavy,
  boss:  buildBoss,
};

export function buildEnemyMesh(kind: EnemyKind): THREE.Group {
  return BUILDERS[kind]();
}

/** Approximate collision AABB half-extents per enemy kind (before group scale). */
export const ENEMY_HALF_EXTENTS: Record<EnemyKind, { x: number; z: number }> = {
  basic: { x: 0.42, z: 0.42 },
  fast:  { x: 0.38, z: 0.38 },
  guard: { x: 0.48, z: 0.48 },
  heavy: { x: 0.52, z: 0.52 },
  boss:  { x: 0.58, z: 0.58 },
};

/** Maximum HP per kind (matches balance.ts). */
export const ENEMY_MAX_HP: Record<EnemyKind, number> = {
  basic: 1,
  fast:  1,
  guard: 1,
  heavy: 3,
  boss:  5,
};
