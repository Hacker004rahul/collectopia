export interface MagnetTarget {
  x: number;
  distance: number;
}

/**
 * Moves a coin towards the player while preserving its current direction.
 * Mutates the target to keep the per-frame allocation cost at zero.
 * Returns true when the target was inside the attraction radius.
 */
export function applyMagnetPull(
  target: MagnetTarget,
  playerX: number,
  playerDistance: number,
  dt: number,
  radius: number,
  speed: number,
): boolean {
  const dx = playerX - target.x;
  const dz = playerDistance - target.distance;
  const distanceSq = dx * dx + dz * dz;
  if (distanceSq > radius * radius || distanceSq < 0.0001) return false;

  const distance = Math.sqrt(distanceSq);
  const step = Math.min(distance, Math.max(0, speed) * Math.max(0, dt));
  target.x += (dx / distance) * step;
  target.distance += (dz / distance) * step;
  return true;
}
