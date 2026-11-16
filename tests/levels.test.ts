import { describe, expect, it } from 'vitest';
import {
  ENDLESS_SPEED_CAP,
  LEVELS,
  LEVEL_LENGTH,
  getLevelDefinition,
  getLevelState,
  getNextLevel,
  isEndlessLevel,
} from '../src/config/levels';

describe('getLevelState', () => {
  it('starts at level one', () => {
    const state = getLevelState(0);
    expect(state.level).toBe(LEVELS[0]);
    expect(state.progress).toBe(0);
    expect(state.distanceIntoLevel).toBe(0);
  });

  it('reports progress inside a level', () => {
    const state = getLevelState(450);
    expect(state.level.index).toBe(0);
    expect(state.progress).toBeCloseTo(0.5);
  });

  it('moves to the next level at an exact boundary', () => {
    const state = getLevelState(LEVEL_LENGTH);
    expect(state.level.index).toBe(1);
    expect(state.progress).toBe(0);
  });

  it('starts Level 11 at the end of Level 10 instead of looping', () => {
    const state = getLevelState(LEVEL_LENGTH * 10);
    expect(state.level.index).toBe(10);
    expect(state.level.name).toBe('Level 11');
    expect(state.progress).toBe(0);
  });

  it('keeps progressing through endless levels', () => {
    const state = getLevelState(LEVEL_LENGTH * 10 + 450);
    expect(state.level.index).toBe(10);
    expect(state.level.name).toBe('Level 11');
    expect(state.progress).toBeCloseTo(0.5);
  });

  it('clamps negative distances to the start', () => {
    const state = getLevelState(-100);
    expect(state.level.index).toBe(0);
    expect(state.progress).toBe(0);
  });
});

describe('endless level generation', () => {
  it('reuses existing zones without repeating the same speed', () => {
    const level11 = getLevelDefinition(10);
    const level12 = getNextLevel(10);
    expect(level11.zoneId).toBe('residential');
    expect(level12.zoneId).toBe('market');
    expect(level12.speed).toBeGreaterThan(level11.speed);
    expect(isEndlessLevel(10)).toBe(true);
    expect(isEndlessLevel(9)).toBe(false);
  });

  it('caps endless speed so difficulty cannot grow without limit', () => {
    const late = getLevelDefinition(80);
    expect(late.speed).toBe(ENDLESS_SPEED_CAP);
    expect(late.index).toBe(80);
  });

  it('keeps all predefined levels unchanged', () => {
    expect(LEVELS).toHaveLength(10);
    expect(LEVELS[9].speed).toBe(24);
    expect(LEVEL_LENGTH).toBe(900);
  });
});
