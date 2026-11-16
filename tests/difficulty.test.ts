import { describe, expect, it } from 'vitest';
import {
  getDifficultyProfile,
  pickWeighted,
} from '../src/config/difficulty';
import { SpawnReservations } from '../src/core/SpawnReservations';

describe('difficulty progression', () => {
  it('keeps levels 1-2 in the intro tier', () => {
    expect(getDifficultyProfile(0).tier).toBe('intro');
    expect(getDifficultyProfile(1).tier).toBe('intro');
  });

  it('uses moderate difficulty for levels 3-5', () => {
    for (const index of [2, 3, 4]) {
      expect(getDifficultyProfile(index).tier).toBe('moderate');
    }
  });

  it('uses complex difficulty for levels 6-10', () => {
    for (const index of [5, 6, 7, 8, 9]) {
      expect(getDifficultyProfile(index).tier).toBe('complex');
    }
  });

  it('ramps endless difficulty toward a cap', () => {
    const level11 = getDifficultyProfile(10);
    const level30 = getDifficultyProfile(29);
    expect(level11.tier).toBe('endless');
    expect(level30.tier).toBe('endless');
    expect(level30.obstacle.minSpacing).toBeLessThan(level11.obstacle.minSpacing);
    expect(level30.enemy.maxActive).toBeGreaterThanOrEqual(level11.enemy.maxActive);
    expect(level30.obstacle.maxActive).toBeLessThanOrEqual(28);
  });

  it('starts simpler than later levels', () => {
    const intro = getDifficultyProfile(0).obstacle;
    const complex = getDifficultyProfile(6).obstacle;

    expect(intro.minSpacing).toBeGreaterThan(complex.minSpacing);
    expect(intro.patternWeights.narrow).toBe(0);
    expect(intro.patternWeights.moving).toBe(0);
    expect(complex.patternWeights.narrow).toBeGreaterThan(0);
    expect(complex.patternWeights.moving).toBeGreaterThan(0);
  });

  it('never introduces bosses during the intro tier', () => {
    const intro = getDifficultyProfile(0).enemy.kindWeights;
    expect(intro.boss).toBe(0);
    expect(intro.heavy).toBe(0);
  });
});

describe('pickWeighted', () => {
  it('selects deterministically from the supplied weights', () => {
    const weights = { a: 0, b: 1, c: 0 };
    expect(pickWeighted(weights, 0)).toBe('b');
    expect(pickWeighted(weights, 0.999)).toBe('b');
  });

  it('falls back to the first entry when all weights are zero', () => {
    expect(pickWeighted({ a: 0, b: 0 }, 0.5)).toBe('a');
  });
});

describe('SpawnReservations', () => {
  it('blocks overlapping corridors on shared lanes', () => {
    const reservations = new SpawnReservations();
    reservations.reserve({
      owner: 'gate',
      distance: 100,
      halfLength: 3,
      lanes: [0, 1, 2],
      pad: 10,
    });

    expect(reservations.isClear(110, 1, [0])).toBe(false);
    expect(reservations.isClear(130, 1, [0])).toBe(true);
  });

  it('allows different lanes without overlap', () => {
    const reservations = new SpawnReservations();
    expect(
      reservations.reserve({
        owner: 'obstacle',
        distance: 100,
        halfLength: 2,
        lanes: [0],
        pad: 2,
      }),
    ).toBe(true);
    expect(reservations.isClear(100, 2, [1])).toBe(true);
  });

  it('prunes reservations that are far behind the player', () => {
    const reservations = new SpawnReservations();
    reservations.reserve({
      owner: 'enemy',
      distance: 100,
      halfLength: 2,
      lanes: [1],
    });
    expect(reservations.size).toBe(1);
    reservations.prune(200);
    expect(reservations.size).toBe(0);
  });

  it('rejects a second reservation that overlaps the first', () => {
    const reservations = new SpawnReservations();
    reservations.reserve({
      owner: 'powerup',
      distance: 100,
      halfLength: 2,
      lanes: [2],
    });
    expect(
      reservations.reserve({
        owner: 'obstacle',
        distance: 103,
        halfLength: 3,
        lanes: [2],
      }),
    ).toBe(false);
  });
});
