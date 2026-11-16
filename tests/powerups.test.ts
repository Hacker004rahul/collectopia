import { describe, expect, it } from 'vitest';
import { POWERUPS } from '../src/config/balance';
import { applyMagnetPull } from '../src/collectibles/magnet';
import { resolveObstacleContact } from '../src/obstacles/contact';
import {
  PowerUpTimers,
  getPowerUpDuration,
} from '../src/powerups/PowerUpTimers';

describe('PowerUpTimers', () => {
  it('refreshes Magnet to exactly five seconds instead of stacking', () => {
    const timers = new PowerUpTimers();
    timers.activate('magnet');
    expect(timers.remaining('magnet')).toBe(5);

    timers.update(3);
    expect(timers.remaining('magnet')).toBeCloseTo(2);

    timers.activate('magnet');
    expect(timers.remaining('magnet')).toBe(5);
    expect(timers.remaining('magnet')).toBeLessThanOrEqual(
      getPowerUpDuration('magnet'),
    );
  });

  it('expires only after the full duration and reports each expiry once', () => {
    const timers = new PowerUpTimers();
    timers.activate('shield', 2);
    expect(timers.update(1.9)).toEqual([]);
    expect(timers.isActive('shield')).toBe(true);
    expect(timers.update(0.2)).toEqual(['shield']);
    expect(timers.isActive('shield')).toBe(false);
    expect(timers.update(1)).toEqual([]);
  });

  it('supports independent timers and manual consumption', () => {
    const timers = new PowerUpTimers();
    timers.activate('magnet', 1);
    timers.activate('freeze', 3);

    expect(timers.getStates().map((state) => state.type)).toEqual([
      'magnet',
      'freeze',
    ]);
    expect(timers.update(1.1)).toEqual(['magnet']);
    expect(timers.isActive('freeze')).toBe(true);

    expect(timers.remove('freeze')).toBe(true);
    expect(timers.isActive('freeze')).toBe(false);
  });

  it('clears all timers on a new run', () => {
    const timers = new PowerUpTimers();
    timers.activate('double-coins');
    timers.clear();
    expect(timers.getStates()).toEqual([]);
  });

  it('keeps Magnet at the required five-second maximum', () => {
    expect(POWERUPS.magnetDuration).toBe(5);
    expect(getPowerUpDuration('magnet')).toBe(5);
  });
});

describe('magnet attraction', () => {
  it('pulls an in-range coin toward the player', () => {
    const coin = { x: 2, distance: 104 };
    const moved = applyMagnetPull(coin, 0, 100, 0.5, 8, 15);
    expect(moved).toBe(true);
    expect(coin.x).toBeLessThan(2);
    expect(coin.distance).toBeLessThan(104);
  });

  it('ignores coins outside the attraction radius', () => {
    const coin = { x: 2.7, distance: 140 };
    const moved = applyMagnetPull(coin, 0, 100, 0.5, 8, 15);
    expect(moved).toBe(false);
    expect(coin.x).toBe(2.7);
    expect(coin.distance).toBe(140);
  });

  it('does not overshoot the player when very close', () => {
    const coin = { x: 0.1, distance: 100.1 };
    applyMagnetPull(coin, 0, 100, 1, 8, 100);
    expect(coin.x).toBeCloseTo(0);
    expect(coin.distance).toBeCloseTo(100);
  });
});

describe('obstacle contact resolution', () => {
  it('ends the run on an unblocked obstacle', () => {
    expect(resolveObstacleContact('wall-concrete', false, false)).toBe('fatal');
  });

  it('lets Shield absorb one collision', () => {
    expect(resolveObstacleContact('wall-brick', true, false)).toBe('shield');
  });

  it('lets Super Punch break breakable walls without a game over', () => {
    expect(resolveObstacleContact('wall-breakable', false, true)).toBe('break');
  });

  it('does not treat decorative/non-obstacle content as a collision', () => {
    expect(resolveObstacleContact('barrier', false, false)).toBe('fatal');
    // Coins, gates, pedestrians and decorative props never reach this helper.
  });
});
