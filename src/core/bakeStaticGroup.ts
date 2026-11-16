import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

interface Bucket {
  material: THREE.Material;
  geometries: THREE.BufferGeometry[];
  castShadow: boolean;
  receiveShadow: boolean;
}

const MERGE_BATCH_SIZE = 48;

export function bakeStaticGroup(source: THREE.Group): THREE.Group {
  return runGenerator(bakeStaticGroupSteps(source));
}

export function bakeStaticGroupAs(
  source: THREE.Group,
  material: THREE.Material,
  castShadow = false,
  receiveShadow = false,
): THREE.Group {
  return runGenerator(
    bakeStaticGroupAsSteps(source, material, castShadow, receiveShadow),
  );
}

/**
 * Incremental version of bakeStaticGroup. Yields between mesh clones, merge
 * batches and line copies so callers can spread the work across frames.
 */
export function* bakeStaticGroupSteps(
  source: THREE.Group,
): Generator<string, THREE.Group, void> {
  source.updateMatrixWorld(true);

  const buckets = new Map<string, Bucket>();
  const meshes: THREE.Mesh[] = [];
  const lines: THREE.Line[] = [];

  source.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh) {
      if (!Array.isArray(mesh.material)) meshes.push(mesh);
      return;
    }

    const line = object as THREE.Line;
    if (line.isLine || (object as THREE.LineSegments).isLineSegments) {
      lines.push(line);
    }
  });

  for (const mesh of meshes) {
    const material = mesh.material as THREE.Material;
    const key = material.uuid;
    let bucket = buckets.get(key);
    if (!bucket) {
      const created: Bucket = {
        material,
        geometries: [],
        castShadow: false,
        receiveShadow: false,
      };
      buckets.set(key, created);
      bucket = created;
    }

    const geometry = mesh.geometry.clone();
    geometry.applyMatrix4(mesh.matrixWorld);
    bucket.geometries.push(geometry);
    bucket.castShadow = bucket.castShadow || mesh.castShadow;
    bucket.receiveShadow = bucket.receiveShadow || mesh.receiveShadow;
    yield 'bake-core-clone';
  }

  const result = new THREE.Group();

  for (const bucket of buckets.values()) {
    if (bucket.geometries.length === 0) continue;

    if (bucket.geometries.length === 1) {
      const mesh = new THREE.Mesh(bucket.geometries[0], bucket.material);
      mesh.castShadow = bucket.castShadow;
      mesh.receiveShadow = bucket.receiveShadow;
      result.add(mesh);
      yield 'bake-core-mesh';
      continue;
    }

    const merged = yield* mergeGeometriesBatched(bucket.geometries);
    if (!merged) {
      return source;
    }

    const mesh = new THREE.Mesh(merged, bucket.material);
    mesh.castShadow = bucket.castShadow;
    mesh.receiveShadow = bucket.receiveShadow;
    result.add(mesh);
    yield 'bake-core-mesh';
  }

  for (const line of lines) {
    line.removeFromParent();
    line.applyMatrix4(line.matrixWorld);
    result.add(line);
    yield 'bake-core-line';
  }

  return result;
}

/**
 * Incremental version of bakeStaticGroupAs. Every source mesh is copied and
 * yielded individually; large merges are performed in batches with yields.
 */
export function* bakeStaticGroupAsSteps(
  source: THREE.Group,
  material: THREE.Material,
  castShadow = false,
  receiveShadow = false,
): Generator<string, THREE.Group, void> {
  source.updateMatrixWorld(true);

  const geometries: THREE.BufferGeometry[] = [];
  const meshes: THREE.Mesh[] = [];
  source.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || Array.isArray(mesh.material)) return;
    meshes.push(mesh);
  });

  for (const mesh of meshes) {
    const geometry = mesh.geometry.clone();
    geometry.applyMatrix4(mesh.matrixWorld);
    geometries.push(geometry);
    yield 'bake-as-clone';
  }

  const result = new THREE.Group();
  if (geometries.length === 0) return result;

  const merged = yield* mergeGeometriesBatched(geometries);
  if (!merged) return result;

  const mesh = new THREE.Mesh(merged, material);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  result.add(mesh);
  yield 'bake-as-mesh';
  return result;
}

function* mergeGeometriesBatched(
  geometries: THREE.BufferGeometry[],
): Generator<string, THREE.BufferGeometry | null, void> {
  let current = geometries;

  while (current.length > 1) {
    if (current.length <= MERGE_BATCH_SIZE) {
      const merged = mergeGeometries(current, false);
      for (const geometry of current) geometry.dispose();
      return merged;
    }

    const next: THREE.BufferGeometry[] = [];
    for (let index = 0; index < current.length; index += MERGE_BATCH_SIZE) {
      const batch = current.slice(index, index + MERGE_BATCH_SIZE);
      if (batch.length === 1) {
        next.push(batch[0]);
      } else {
        const merged = mergeGeometries(batch, false);
        for (const geometry of batch) geometry.dispose();
        if (!merged) return null;
        next.push(merged);
      }
      yield 'merge-batch';
    }
    current = next;
  }

  return current[0] ?? null;
}

function runGenerator<T>(generator: Generator<string, T, void>): T {
  let step = generator.next();
  while (!step.done) {
    step = generator.next();
  }
  return step.value;
}
