export const LANES = [-2.7, 0, 2.7] as const;
export const STARTING_LANE = 1;

export const ROAD = {
  width: 8.1,
  laneWidth: 2.7,
  chunkLength: 48,
  chunkCount: 5,
} as const;

export const PLAYER = {
  forwardSpeed: 16.5,
  laneSmoothing: 13,
  runCycleSpeed: 10.5,
  collisionHalfWidth: 0.78,
  collisionHalfDepth: 0.9,
} as const;

export const ECONOMY = {
  startingBalance: 0,
  coinValue: 10,
  minimumBalance: 0,
} as const;

export const COINS = {
  radius: 0.42,
  height: 1.16,
  spacing: 2.3,
  patternsAhead: 170,
  patternGapMin: 13,
  patternGapMax: 19,
  initialPatternDistance: 20,
  maxActive: 120,
  collectRadiusX: 0.82,
  collectRadiusZ: 1.05,
  recycleBehind: 16,
} as const;

export const OBSTACLES = {
  penalty: 50,
  hitCooldown: 1.8,        // seconds before same obstacle can hit again
  speedPenaltyDuration: 0.38, // seconds of reduced speed after hit
  speedPenaltyFactor: 0.48,   // multiplier applied to forward speed during penalty
  spawnAhead: 160,         // spawn obstacles this far ahead of player (m)
  recycleBehind: 14,       // recycle when this far behind player (m)
  minSpacing: 22,          // minimum gap between consecutive obstacle groups (m)
  maxSpacing: 38,
  initialDistance: 80,     // first obstacle group distance (m)
  reactionDistance: 18,    // minimum clear distance before an obstacle (m)
  maxActive: 24,
} as const;

export const GATES = {
  initialDistance: 58,
  spacingMin: 68,
  spacingMax: 88,
  spawnAhead: 155,
  maxActivePairs: 3,
} as const;

export const GATE_BIAS = {
  /** Lifetime collected coins after which subtract/divide become more common. */
  highBalanceThreshold: 200_000,
} as const;

export const POWERUPS = {
  initialDistance: 95,
  spawnAhead: 165,
  gapMin: 82,
  gapMax: 128,
  maxActive: 6,
  collectRadiusX: 1.05,
  collectRadiusZ: 1.35,
  magnetDuration: 5,
  shieldDuration: 8,
  superPunchDuration: 6,
  doubleCoinsDuration: 6,
  freezeDuration: 5,
  magnetRadius: 8,
  magnetPullSpeed: 15,
} as const;

export const ENEMIES = {
  /** Minimum distance from player before first enemy spawns. */
  initialDistance: 120,
  /** Enemies are pre-spawned this far ahead of the player. */
  spawnAhead: 160,
  /** Minimum gap between consecutive enemy groups (m). */
  minSpacing: 36,
  /** Maximum gap between consecutive enemy groups (m). */
  maxSpacing: 58,
  /** Recycle enemy when this far behind player (m). */
  recycleBehind: 16,
  /** Maximum enemies active simultaneously. */
  maxActive: 12,
  /** Closest an enemy can be to the player at spawn (minimum reaction distance, m). */
  reactionDistance: 22,
  /** How fast a basic enemy approaches the player (m/s). */
  approachSpeed: 3.8,
  /** Lateral movement speed for lane-changing enemies (m/s). */
  laneChangeSpeed: 2.6,
  /** Coin penalty when an enemy successfully hits the player. */
  damagePenalty: 50,
  /** Cooldown between successive enemy-hit penalties from the same enemy (s). */
  hitCooldown: 1.8,
  /** Reward for defeating a basic enemy. */
  rewardBasic: 30,
  /** Reward for defeating a fast enemy. */
  rewardFast: 40,
  /** Reward for defeating a guard enemy. */
  rewardGuard: 50,
  /** Reward for defeating a heavy enemy. */
  rewardHeavy: 80,
  /** Reward for defeating a boss enemy. */
  rewardBoss: 150,
  /** Health points for each type (heavy/boss require multiple punches). */
  hpBasic: 1,
  hpFast: 1,
  hpGuard: 1,
  hpHeavy: 3,
  hpBoss: 5,
  /** Distance the enemy knockback travels on each punch hit (m). */
  knockbackDistance: 1.4,
  /** Duration of knockback animation (s). */
  knockbackDuration: 0.22,
  /** Minimum distance from gates (m) — enemies must not block gates. */
  gateExclusionZone: 14,
} as const;

export const PUNCH = {
  /** Cooldown between consecutive punches (s). */
  cooldown: 1.0,
  /** Forward range from player centre — enemies within this distance can be hit (m). */
  rangeZ: 4.5,
  /** Lateral range — enemy must be within this X distance of the player (m). */
  rangeX: 2.4,
  /** Duration of the player punch animation (s). */
  animDuration: 0.28,
} as const;

export const ADVERTISING = {
  /** Distance from the start where the first ad is prepared (m). */
  initialDistance: 84,
  /** Ads are pre-spawned this far ahead of the player (m). */
  spawnAhead: 200,
  /** Ad is removed this far behind the player (m). */
  recycleBehind: 22,
  /** Minimum run distance between successive ads on both sides (m). */
  gapMin: 92,
  /** Maximum run distance between successive ads on both sides (m). */
  gapMax: 136,
  /** Gantries need at least this much separation (m). */
  gantryMinGap: 180,
  /** No ad within this distance of a gate z-position (m). */
  gateExclusion: 20,
  /** Maximum simultaneous ad objects in the scene. */
  maxActive: 14,
  /** Logo native width (px). */
  logoWidth: 640,
  /** Logo native height (px). */
  logoHeight: 271,
  /** Computed aspect ratio (width / height). */
  logoAspect: 640 / 271,
} as const;

export const CAMERA = {
  fov: 60,
  near: 0.1,
  far: 700,
  height: 5.1,
  distance: 9.4,
  lookAhead: 9,
  followX: 0.32,
  smoothing: 7,
} as const;
