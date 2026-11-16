export type DifficultyTier =
  | 'intro'
  | 'moderate'
  | 'complex'
  | 'endless';

export interface ObstaclePatternWeights {
  single: number;
  adjacent: number;
  staggered: number;
  narrow: number;
  moving: number;
}

export interface ObstacleDifficulty {
  minSpacing: number;
  maxSpacing: number;
  maxActive: number;
  patternWeights: ObstaclePatternWeights;
  breakableChance: number;
  vehicleBias: number;
}

export interface EnemyKindWeights {
  basic: number;
  fast: number;
  guard: number;
  heavy: number;
  boss: number;
}

export interface EnemyDifficulty {
  minSpacing: number;
  maxSpacing: number;
  maxActive: number;
  approachSpeedScale: number;
  laneChangeChance: number;
  kindWeights: EnemyKindWeights;
}

export interface CoinDifficulty {
  patternGapMin: number;
  patternGapMax: number;
}

export interface DifficultyProfile {
  levelIndex: number;
  tier: DifficultyTier;
  obstacle: ObstacleDifficulty;
  enemy: EnemyDifficulty;
  coin: CoinDifficulty;
}

interface DifficultyPreset {
  tier: DifficultyTier;
  obstacle: ObstacleDifficulty;
  enemy: EnemyDifficulty;
  coin: CoinDifficulty;
}

const INTRO: DifficultyPreset = {
  tier: 'intro',
  obstacle: {
    minSpacing: 32,
    maxSpacing: 48,
    maxActive: 16,
    patternWeights: {
      single: 0.7,
      adjacent: 0.12,
      staggered: 0.18,
      narrow: 0,
      moving: 0,
    },
    breakableChance: 0.02,
    vehicleBias: 0.24,
  },
  enemy: {
    minSpacing: 55,
    maxSpacing: 78,
    maxActive: 6,
    approachSpeedScale: 1,
    laneChangeChance: 0.25,
    kindWeights: { basic: 0.72, fast: 0.28, guard: 0, heavy: 0, boss: 0 },
  },
  coin: { patternGapMin: 15, patternGapMax: 21 },
};

const MODERATE: DifficultyPreset = {
  tier: 'moderate',
  obstacle: {
    minSpacing: 27,
    maxSpacing: 42,
    maxActive: 20,
    patternWeights: {
      single: 0.43,
      adjacent: 0.27,
      staggered: 0.21,
      narrow: 0.06,
      moving: 0.03,
    },
    breakableChance: 0.04,
    vehicleBias: 0.4,
  },
  enemy: {
    minSpacing: 44,
    maxSpacing: 66,
    maxActive: 9,
    approachSpeedScale: 1.1,
    laneChangeChance: 0.36,
    kindWeights: { basic: 0.5, fast: 0.3, guard: 0.2, heavy: 0, boss: 0 },
  },
  coin: { patternGapMin: 13, patternGapMax: 19 },
};

const COMPLEX: DifficultyPreset = {
  tier: 'complex',
  obstacle: {
    minSpacing: 22,
    maxSpacing: 36,
    maxActive: 24,
    patternWeights: {
      single: 0.34,
      adjacent: 0.3,
      staggered: 0.2,
      narrow: 0.1,
      moving: 0.06,
    },
    breakableChance: 0.06,
    vehicleBias: 0.52,
  },
  enemy: {
    minSpacing: 34,
    maxSpacing: 54,
    maxActive: 12,
    approachSpeedScale: 1.35,
    laneChangeChance: 0.5,
    kindWeights: {
      basic: 0.32,
      fast: 0.3,
      guard: 0.2,
      heavy: 0.12,
      boss: 0.06,
    },
  },
  coin: { patternGapMin: 12, patternGapMax: 18 },
};

const ENDLESS_MAX: DifficultyPreset = {
  tier: 'endless',
  obstacle: {
    minSpacing: 19,
    maxSpacing: 31,
    maxActive: 28,
    patternWeights: {
      single: 0.27,
      adjacent: 0.34,
      staggered: 0.21,
      narrow: 0.1,
      moving: 0.08,
    },
    breakableChance: 0.08,
    vehicleBias: 0.64,
  },
  enemy: {
    minSpacing: 28,
    maxSpacing: 44,
    maxActive: 16,
    approachSpeedScale: 1.7,
    laneChangeChance: 0.62,
    kindWeights: {
      basic: 0.26,
      fast: 0.3,
      guard: 0.2,
      heavy: 0.14,
      boss: 0.1,
    },
  },
  coin: { patternGapMin: 10, patternGapMax: 16 },
};

const ENDLESS_START_PRESET: DifficultyPreset = {
  tier: 'endless',
  obstacle: {
    minSpacing: 21,
    maxSpacing: 34,
    maxActive: 25,
    patternWeights: {
      single: 0.31,
      adjacent: 0.32,
      staggered: 0.2,
      narrow: 0.1,
      moving: 0.07,
    },
    breakableChance: 0.07,
    vehicleBias: 0.58,
  },
  enemy: {
    minSpacing: 31,
    maxSpacing: 49,
    maxActive: 13,
    approachSpeedScale: 1.45,
    laneChangeChance: 0.55,
    kindWeights: {
      basic: 0.29,
      fast: 0.3,
      guard: 0.2,
      heavy: 0.13,
      boss: 0.08,
    },
  },
  coin: { patternGapMin: 11, patternGapMax: 17 },
};

const ENDLESS_RAMP_LEVELS = 14;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clonePreset(preset: DifficultyPreset): DifficultyPreset {
  return {
    tier: preset.tier,
    obstacle: {
      ...preset.obstacle,
      patternWeights: { ...preset.obstacle.patternWeights },
    },
    enemy: {
      ...preset.enemy,
      kindWeights: { ...preset.enemy.kindWeights },
    },
    coin: { ...preset.coin },
  };
}

function lerpPreset(
  from: DifficultyPreset,
  to: DifficultyPreset,
  t: number,
): DifficultyPreset {
  const clamped = Math.max(0, Math.min(1, t));
  return {
    tier: 'endless',
    obstacle: {
      minSpacing: lerp(from.obstacle.minSpacing, to.obstacle.minSpacing, clamped),
      maxSpacing: lerp(from.obstacle.maxSpacing, to.obstacle.maxSpacing, clamped),
      maxActive: Math.round(
        lerp(from.obstacle.maxActive, to.obstacle.maxActive, clamped),
      ),
      patternWeights: {
        single: lerp(
          from.obstacle.patternWeights.single,
          to.obstacle.patternWeights.single,
          clamped,
        ),
        adjacent: lerp(
          from.obstacle.patternWeights.adjacent,
          to.obstacle.patternWeights.adjacent,
          clamped,
        ),
        staggered: lerp(
          from.obstacle.patternWeights.staggered,
          to.obstacle.patternWeights.staggered,
          clamped,
        ),
        narrow: lerp(
          from.obstacle.patternWeights.narrow,
          to.obstacle.patternWeights.narrow,
          clamped,
        ),
        moving: lerp(
          from.obstacle.patternWeights.moving,
          to.obstacle.patternWeights.moving,
          clamped,
        ),
      },
      breakableChance: lerp(
        from.obstacle.breakableChance,
        to.obstacle.breakableChance,
        clamped,
      ),
      vehicleBias: lerp(
        from.obstacle.vehicleBias,
        to.obstacle.vehicleBias,
        clamped,
      ),
    },
    enemy: {
      minSpacing: lerp(from.enemy.minSpacing, to.enemy.minSpacing, clamped),
      maxSpacing: lerp(from.enemy.maxSpacing, to.enemy.maxSpacing, clamped),
      maxActive: Math.round(
        lerp(from.enemy.maxActive, to.enemy.maxActive, clamped),
      ),
      approachSpeedScale: lerp(
        from.enemy.approachSpeedScale,
        to.enemy.approachSpeedScale,
        clamped,
      ),
      laneChangeChance: lerp(
        from.enemy.laneChangeChance,
        to.enemy.laneChangeChance,
        clamped,
      ),
      kindWeights: {
        basic: lerp(
          from.enemy.kindWeights.basic,
          to.enemy.kindWeights.basic,
          clamped,
        ),
        fast: lerp(
          from.enemy.kindWeights.fast,
          to.enemy.kindWeights.fast,
          clamped,
        ),
        guard: lerp(
          from.enemy.kindWeights.guard,
          to.enemy.kindWeights.guard,
          clamped,
        ),
        heavy: lerp(
          from.enemy.kindWeights.heavy,
          to.enemy.kindWeights.heavy,
          clamped,
        ),
        boss: lerp(
          from.enemy.kindWeights.boss,
          to.enemy.kindWeights.boss,
          clamped,
        ),
      },
    },
    coin: {
      patternGapMin: lerp(
        from.coin.patternGapMin,
        to.coin.patternGapMin,
        clamped,
      ),
      patternGapMax: lerp(
        from.coin.patternGapMax,
        to.coin.patternGapMax,
        clamped,
      ),
    },
  };
}

/**
 * Returns a stable difficulty profile for any level index.
 * Levels 1-2 are intentionally sparse; 3-5 ramp up; 6-10 are complex;
 * 11+ ramps toward hard caps so the run remains fair indefinitely.
 */
export function getDifficultyProfile(levelIndex: number): DifficultyProfile {
  const safeIndex = Number.isFinite(levelIndex)
    ? Math.max(0, Math.floor(levelIndex))
    : 0;

  let preset: DifficultyPreset;
  if (safeIndex <= 1) {
    preset = clonePreset(INTRO);
  } else if (safeIndex <= 4) {
    preset = clonePreset(MODERATE);
  } else if (safeIndex <= 9) {
    preset = clonePreset(COMPLEX);
  } else {
    const ramp = (safeIndex - 9) / ENDLESS_RAMP_LEVELS;
    preset = lerpPreset(ENDLESS_START_PRESET, ENDLESS_MAX, ramp);
    preset.tier = 'endless';
  }

  return {
    levelIndex: safeIndex,
    tier: preset.tier,
    obstacle: preset.obstacle,
    enemy: preset.enemy,
    coin: preset.coin,
  };
}

/** Pick a weighted key from a table of non-negative weights. */
export function pickWeighted<T extends string>(
  weights: Record<T, number>,
  roll: number,
): T {
  const entries = Object.entries(weights) as Array<[T, number]>;
  let total = 0;
  for (const [, weight] of entries) {
    if (weight > 0) total += weight;
  }
  if (total <= 0) return entries[0][0];

  let cursor = Math.max(0, Math.min(1, roll)) * total;
  for (const [key, weight] of entries) {
    if (weight <= 0) continue;
    cursor -= weight;
    if (cursor <= 0) return key;
  }
  return entries[entries.length - 1][0];
}
