# IMPLEMENTATION_TRACKER.md

**Project:** COLLECTOPIA
**PRD:** `COLLECTOPIA_PRD_v1.0.md`
**Plan:** `TECHNICAL_PLAN.md`
**Audit:** `CODEBASE_AUDIT.md`
**Direction:** Track B — Greenfield (confirmed)
**Last updated:** 2026-11-16 (endless gameplay overhaul and power-ups)

---

## Status legend

| Symbol | Meaning |
|---|---|
| `[x]` | Done |
| `[ ]` | Not started |
| `[~]` | In progress |
| `[!]` | Blocked |
| `[-]` | Deferred / not approved |

**Overall project status:** `[~]` ENDLESS OVERHAUL COMPLETE — FULL DEVICE MATRIX AND FINAL SIGN-OFF PENDING
**Implementation started:** **Yes (core gameplay, environment, obstacles, enemies, power-ups, results, ads and endless progression complete)**
**Vite initialised:** **Yes**
**Dependencies installed:** **Yes**
**Phase 1 exit gate:** **Passed and signed off by continuing to Phase 2**
**Phase 2 exit gate:** **Build passes, all 7 themes verified**
**Phase 4 exit gate:** **Build passes (691 kB / 177 kB gzip), 68/68 unit tests pass, 5 enemy types verified**
**Advertising exit gate:** **Build passes (761 kB / 197 kB gzip), 147/147 unit tests pass (9 files), five static ad formats verified**
**Overhaul exit gate:** **Build passes, 147/147 tests pass, headless power-up/results/restart/endless-transition checks pass with no console errors**

---

## Confirmed decisions (D0)

| ID | Decision | Status | Value |
|---|---|---|---|
| D0.1 | Correct repository | `[x]` | `https://github.com/Hacker004rahul/collectopia` |
| D0.2 | Existing game source | `[x]` | None; nothing to preserve |
| D0.3 | Development approach | `[x]` | Track B — Greenfield |
| D0.4 | Technology stack | `[x]` | Vite + TypeScript + Three.js |
| D0.5 | Platform targets | `[x]` | Mobile browsers + desktop browsers |
| D0.6 | Lens Studio | `[x]` | Excluded |
| D0.7 | Jump / slide | `[x]` | Excluded entirely |
| D0.8 | Requirements source | `[x]` | `COLLECTOPIA_PRD_v1.0.md` |

### Phase 1 decisions (resolved by implementation)

| ID | Decision | Status | Implemented value |
|---|---|---|---|
| D1 | Starting balance / coin value / gate values | `[x]` | Start 0; coin +10; gates +100 / −50 / −100 / ×1 / ×2 / ÷2 / ÷4; floor at 0 |
| D2 | Lane-based vs continuous steering | `[x]` | 3 lanes, smooth lane interpolation |
| D3 | Level completion condition | `[x]` | 10 authored 900 m levels, then generated endless levels; speed caps at 31 m/s |
| D4 | Asset sourcing/licensing | `[x]` | Phase 2 uses self-authored procedural art only; no third-party licences required |
| D5 | Mobile/desktop test matrix | `[~]` | Phase 1 smoke done; full device/browser matrix in Phase 7 |

> Approval for Phase 1 was granted and implementation completed. Final phase
> sign-off is the remaining gate.

---

## Phase 0 — Audit and planning

**Goal:** Establish the real state of the project and a confirmed direction.
**Dependencies:** None.
**Status:** `[x]` Complete.

| # | Task | Status | Evidence / notes |
|---|---|---|---|
| 0.1 | Confirm the correct repository | `[x]` | User verified `Hacker004rahul/collectopia` |
| 0.2 | Inspect repository contents, history, branches, tags, releases | `[x]` | PRD only; no code on any branch |
| 0.3 | Search for any existing game source | `[x]` | None; user confirmed none exists |
| 0.4 | Record technology stack | `[x]` | None present; greenfield stack confirmed |
| 0.5 | Record player/mechanics/environment/UI state | `[x]` | All absent |
| 0.6 | Record risks and conflicts | `[x]` | Audit §14–15 |
| 0.7 | Update `CODEBASE_AUDIT.md` for confirmed direction | `[x]` | Greenfield, no legacy source |
| 0.8 | Update `TECHNICAL_PLAN.md` with greenfield architecture | `[x]` | Stack, structure, dependencies, assets, testing |
| 0.9 | Update `IMPLEMENTATION_TRACKER.md` with revised phases | `[x]` | This file |
| 0.10 | Do not create source / initialise Vite / install deps | `[x]` | Verified |

**Acceptance criteria:** Correct repo confirmed; no-code finding recorded; greenfield
direction documented; no application source changed.
**Result:** Met.
**Testing:** Documentation review only (no runnable build yet).

---

## Phase 1 — Core gameplay and economy

**Goal:** Playable core loop — auto-run, lane steering, gold coins, four math
gates, one authoritative economy. Punching, enemies, power-ups and advanced
obstacles are excluded from Phase 1.
**Dependencies:** Approved in `TECHNICAL_PLAN.md` §15.
**Status:** `[x]` Complete — signed off by continuing to Phase 2.

### 1.1 Project foundation

| # | Task | Status | Acceptance criteria / evidence |
|---|---|---|---|
| 1.1.1 | Initialise Vite + TypeScript project (after approval) | `[x]` | Vite 8.3.8, TypeScript 7.0.2, Node 24; dev and preview servers serve the app |
| 1.1.2 | Add Three.js renderer bootstrap | `[x]` | Full-viewport WebGL canvas; resize handler; pixel ratio capped at 2 |
| 1.1.3 | Configure build and scripts | `[x]` | `npm run build` passes strict `tsc --noEmit` and Vite build |
| 1.1.4 | Add `.gitignore`, `README.md`, base styles | `[x]` | `dist`, `node_modules`, logs ignored; README and full HUD styling present |
| 1.1.5 | Add fixed-step loop and pause-aware clock | `[x]` | `Loop` + pause-aware `Clock`; variable step clamped to 50 ms (fixed accumulator deferred; no physics dependency) |

### 1.2 Player, input and camera

| # | Task | Status | Acceptance criteria / evidence |
|---|---|---|---|
| 1.2.1 | Player controller: auto-forward + 3-lane steering | `[x]` | Automatic forward speed; smooth 3-lane damped steering; no vertical movement |
| 1.2.2 | Input controller: touch swipe/drag + keyboard test | `[x]` | Pointer swipe/drag, Arrow/A-D keys and pause keys; touch exercised in headless mobile Chrome |
| 1.2.3 | Camera follow | `[x]` | Smooth lateral follow; locked distance/height; no clipping observed |
| 1.2.4 | Player placeholder model + run animation hook | `[x]` | Procedural low-poly runner with leg/arm run cycle, lean, bob and shadow |
| 1.2.5 | No jump/slide verification | `[x]` | No jump/slide strings, bindings, hints or logic in `src` |

### 1.3 Economy and coins

| # | Task | Status | Acceptance criteria / evidence |
|---|---|---|---|
| 1.3.1 | `EconomyManager` with balance + ledger | `[x]` | Single balance authority; integer balance; ledger entries with before/after and delta |
| 1.3.2 | Transaction types and idempotency keys | `[x]` | Coin/gate types; unique `sourceId` claimed once; duplicate rejection tested |
| 1.3.3 | Floor-at-zero rule | `[x]` | Every result floored and clamped at 0; tested |
| 1.3.4 | Gold coin placeholder + spawn trail | `[x]` | Instanced spinning/bobbing gold coins, glow points, four deterministic trail patterns |
| 1.3.5 | Coin pickup once + floating `+10` | `[x]` | One economy transaction per coin; particle burst, audio, balance pulse and floating `+10` |
| 1.3.6 | Balance HUD binding | `[x]` | HUD updates from economy ledger listener; verified in headless run |

### 1.4 Mathematical gates

| # | Task | Status | Acceptance criteria / evidence |
|---|---|---|---|
| 1.4.1 | Gate pair layout with unique IDs | `[x]` | Two gates on adjacent lanes at the same z; per-pair/lane unique IDs |
| 1.4.2 | Crossing detection (only crossed gate) | `[x]` | z-plane crossing guard; only the player's current lane gate resolves |
| 1.4.3 | Addition / subtraction gates | `[x]` | `+100` / `−50` apply exactly; subtraction floors at 0; unit-tested |
| 1.4.4 | Multiplication gate | `[x]` | `×3` factor; unit-tested |
| 1.4.5 | Division gate | `[x]` | `÷2` with `Math.floor`; divisor guard; unit-tested |
| 1.4.6 | One-time activation guard | `[x]` | Pair marks used on crossing; economy rejects duplicate gate IDs |
| 1.4.7 | Calculation feedback (`500 × 3 = 1500`) | `[x]` | HUD toast shows live `before op value = after`; observed `310 ÷ 2 = 155` and `740 − 50 = 690` |
| 1.4.8 | Colour + symbol + value identity | `[x]` | Distinct colours plus `+ − × ÷` symbols, operation label and value on each gate |

### 1.5 UI, tests and smoke

| # | Task | Status | Acceptance criteria / evidence |
|---|---|---|---|
| 1.5.1 | Top HUD: level, progress, balance, pause | `[x]` | Title, level/zone, progress bar, balance, pause button and hints; safe-area padding |
| 1.5.2 | Unit tests: economy + gates | `[x]` | 14 tests across 3 files pass |
| 1.5.3 | Mobile/desktop smoke test | `[x]` | 390×844 mobile emulation with synthetic touch; keyboard steering; 800×600 desktop viewport |
| 1.5.4 | Build + console check | `[x]` | Build passes; no console errors/exceptions observed in headless integration runs |
| 1.5.5 | Tracker update + phase report | `[x]` | This tracker and Phase 1 completion report updated; final sign-off pending |

### Phase 1 acceptance checklist

- [x] Player runs forward automatically
- [x] Left/right steering works on mobile touch and desktop keys
- [x] No jump/slide controls, hints, animations or logic
- [x] No enemies, punching, power-ups or advanced obstacles
- [x] Coins update the balance; each coin collected once
- [x] Addition gate applies exactly the displayed amount
- [x] Subtraction gate applies the penalty and floors at zero
- [x] Multiplication gate calculates correctly
- [x] Division gate floors correctly and never divides by zero
- [x] Only the selected gate activates; no duplicate transactions
- [x] HUD balance matches the authoritative economy
- [x] Pause/resume preserves correct state
- [x] `npm run build` succeeds and unit tests pass
- [x] No critical console errors

**Testing status:** `[x]` Complete — build, 14 unit tests, headless mobile/desktop smoke and integration runs passed. Real-device and full performance matrix remain Phase 7.

---

## Phase 2 — Indian street environment

**Goal:** Coherent Indian residential street replacing placeholders.
**Dependencies:** Phase 1 exit gate; asset plan approved (D4).
**Status:** `[x]` Complete — verified 2026-11-14.

| # | Task | Status | Acceptance criteria |
|---|---|---|---|
| 2.1 | Approve and register asset kit + licences | `[x]` | D4 resolved: self-authored procedural art; no third-party licences needed |
| 2.2 | Road, markings, sidewalks, drainage | `[x]` | Asphalt with procedural texture, potholes, patches, paver sidewalks, curbs, drainage grates, construction trench |
| 2.3 | Residential buildings, walls, balconies, tanks | `[x]` | 2–4 storey buildings, plaster facades, doors, windows with grills, balconies, rooftop tanks, solar panels, satellite dishes, rear buildings |
| 2.4 | Street dressing (scooters, autos, shops, carts, poles, trees) | `[x]` | Scooters, motorcycles, auto-rickshaws, tea stalls, vegetable carts, utility poles, sagging wires, street lamps, signs, bins, planters, pedestrians |
| 2.5 | Seven environment zone themes | `[x]` | All 7 zones in `src/config/zones.ts`; 10 levels mapped in `levels.ts`; 3 zones tested in zones.test.ts |
| 2.6 | Lighting, shadows, sky, materials | `[x]` | Per-zone sky gradient, fog, hemisphere/sun colour and intensity lerp smoothly; PCF shadows; ACES tone mapping |
| 2.7 | Chunk generation + pooling | `[x]` | 5 chunks per theme, 3 LOD groups, incremental prefetch (2.5 ms/frame budget), pool eviction, no per-frame allocation |
| 2.8 | Environment performance pass | `[x]` | Build 668 kB / 170 kB gzip (within 1.5 MB plan budget); 17 tests pass; no console errors observed |
| 2.9 | Moving traffic (Traffic Crossing) | `[x]` | 6 ambient vehicles fade in/out 76–202 m ahead; never reach player; disabled in other zones |
| 2.10 | Theme-specific dressing | `[x]` | Market awnings/crates; Construction barriers/cones/scaffold; Temple garlands/flags; Festival lights/rangoli/banners; Traffic zebra/signals; Outskirts hedges/haystacks |

---

## Phase 3 — Obstacles and walls

**Goal:** Physical, fair wall/street-obstacle gameplay.
**Dependencies:** Phase 2 exit gate.
**Status:** `[x]` Complete — obstacle collisions now end the run per approved overhaul.

| # | Task | Status | Acceptance criteria |
|---|---|---|---|
| 3.1 | Concrete, brick, wooden, low and moving walls | `[x]` | Accurate AABB colliders; steer-around works; visually distinct from scenery |
| 3.2 | Breakable walls + Super Punch hook | `[x]` | Break only with active Super Punch; verified by contact-resolution tests |
| 3.3 | Narrow wall passage | `[x]` | Gap ≥ player collision width + clearance; traversable with accurate steering |
| 3.4 | Indian street obstacles (scooters, motorcycles, auto-rickshaws, bicycles, vegetable carts, crates, construction barriers) | `[x]` | Visually distinct from background props; AABB colliders; fair spawn distance |
| 3.5 | Collision detection (AABB player vs obstacle) | `[x]` | Triggers on overlap; no false positives from decorative props |
| 3.6 | Fatal collision + run-end handling | `[x]` | First unblocked obstacle collision ends the run; no repeated penalty loop |
| 3.7 | Collision feedback | `[x]` | Hit flash, crash audio and results overlay; no future hazard obscuring |
| 3.8 | Shield interaction | `[x]` | Shield blocks exactly one obstacle/enemy hit and is then consumed |
| 3.9 | Fairness and spawn reservations | `[x]` | Gate/obstacle/enemy/power-up corridors reserved across systems |
| 3.10 | Pattern/fairness + collision tests | `[x]` | Contact-resolution, reservations, obstacle patterns and fairness tests pass |

---

## Phase 4 — Enemy and combat

**Goal:** Enemy behaviours, Punch combat, damage/rewards, boss.
**Dependencies:** Phase 3 exit gate.
**Status:** `[x]` Complete.

| # | Task | Status | Acceptance criteria |
|---|---|---|---|
| 4.1 | Basic, fast, guard, heavy and boss enemies | `[x]` | EnemyMeshBuilder.ts: 5 procedural models; distinct silhouettes |
| 4.2 | Approach/chase/lane-change behaviours | `[x]` | EnemySystem: approach closes distance each frame; fast+guard may target a different lane; knockback pushes enemy back on punch |
| 4.3 | Enemy collision penalty + cooldown | `[x]` | AABB collision + 50-coin enemy-damage transaction; 1.8 s hitCooldown per enemy |
| 4.4 | Punch targeting, range, cooldown | `[x]` | PunchSystem: 1.0 s cooldown; rangeZ 4.5 m forward, rangeX 2.4 m; EnemySystem.punch() |
| 4.5 | Punch animation + impact feedback | `[x]` | isAnimating flag + white flash on enemy; punchHit/Miss audio cues |
| 4.6 | Heavy/boss multi-hit + boss health bar | `[x]` | heavy=3 HP, boss=5 HP; boss HP bar mesh updates colour and scale |
| 4.7 | Defeat reward once per enemy | `[x]` | rewardClaimed flag + enemy-reward sourceId idempotency |
| 4.8 | Super Punch combat effect | `[x]` | PunchSystem.superPunchActive flag; passes superPunch=true to EnemySystem.punch() (activated by Phase 5) |
| 4.9 | Freeze Enemy support | `[x]` | EnemySystem.freezeActive pauses movement and prevents damage (activated by Phase 5) |

---

## Phase 5 — Power-ups

**Goal:** Five power-ups with correct, pause-aware timers.
**Dependencies:** Phase 4 exit gate (enemies for Freeze/Super Punch).
**Status:** `[x]` Complete — all five power-ups integrated and verified.

| # | Task | Status | Acceptance criteria |
|---|---|---|---|
| 5.1 | Magnet (5 s, smooth attraction) | `[x]` | In-range coins pulled toward lane; each coin still claimed once |
| 5.2 | Shield (one hit, consumed) | `[x]` | Blocks exactly one obstacle or enemy hit, then clears both shield flags and the timer |
| 5.3 | Super Punch (6 s, breakable walls/heavies) | `[x]` | Breakable walls destroyed; enemy punch receives super flag; expires cleanly |
| 5.4 | Double Coins (6 s, coins only) | `[x]` | Coin value ×2; gates and enemy rewards are unaffected |
| 5.5 | Freeze Enemy (5 s, visible, safe resume) | `[x]` | Enemies stop, tint blue and resume with normal materials |
| 5.6 | Spawn rules (fair, reachable, not inside hazards) | `[x]` | Uses shared spawn reservations and max-active cap |
| 5.7 | Pause-aware timer service | `[x]` | Timers only advance during unpaused gameplay; headless pause check passed |
| 5.8 | Refresh rules + HUD status | `[x]` | Re-pickup resets the full duration; different power-ups coexist; timer chips render |
| 5.9 | Power-up tests | `[x]` | Timer, magnet, contact and expiry tests added; all pass |

---

## Phase 6 — HUD, levels and results

**Goal:** Complete mobile UI, 10-level progression, working results.
**Dependencies:** Phase 5 exit gate.
**Status:** `[~]` Complete for the approved endless-run scope; cross-reload persistence remains deferred.

| # | Task | Status | Acceptance criteria |
|---|---|---|---|
| 6.1 | Full top HUD (level, zone, progress, balance, pause) | `[x]` | Readable; high contrast; safe areas |
| 6.2 | Power-up status strip | `[x]` | All five states/countdowns and timer bars verified headlessly |
| 6.3 | Steering + Punch layout | `[x]` | Punch button remains clear of HUD and power-up chips |
| 6.4 | Pause/resume screen | `[x]` | Timers freeze while paused and resume correctly |
| 6.5 | 10 authored levels + generated endless levels | `[x]` | Data-driven config; Level 11 starts the endless cycle |
| 6.6 | Difficulty progression | `[x]` | Intro/moderate/complex tiers, 14-level endless ramp and caps |
| 6.7 | Results screen with run breakdown | `[x]` | Distance, level, coins, gates, enemies and balance match run state |
| 6.8 | Replay action | `[x]` | “Run again” resets in place with a fresh balance and no duplicate canvas |
| 6.9 | Cross-reload persistence (progress, lifetime coins) | `[-]` | Lifetime coins persist across runs in-session; localStorage persistence is not part of the approved overhaul |
| 6.10 | No jump/slide hints | `[x]` | Verified across gameplay and results screens |

---

## Phase 7 — Integration and optimisation

**Goal:** Full regression, mobile/desktop testing, performance and polish.
**Dependencies:** Phase 6 exit gate.
**Status:** `[~]` In progress — automated and headless checks complete; physical-device and leak matrices pending.

| # | Task | Status | Acceptance criteria |
|---|---|---|---|
| 7.1 | Full PRD §13 acceptance walkthrough | `[~]` | Automated gameplay paths covered; manual PRD walkthrough pending |
| 7.2 | Mobile device/browser matrix | `[ ]` | Representative physical devices pending |
| 7.3 | Desktop browser matrix | `[ ]` | Chrome/Firefox/Edge/Safari matrix pending |
| 7.4 | Performance profiling | `[~]` | Production build and headless frame path pass; on-device profiling pending |
| 7.5 | Memory/leak checks | `[ ]` | Repeated-run leak measurement pending |
| 7.6 | Visual/polish pass | `[~]` | Transition, power-up HUD and results screenshots reviewed |
| 7.7 | Documentation + known limitations | `[x]` | Tracker, progress report and README updated |
| 7.8 | Final approval review | `[ ]` | User sign-off pending |

---

## Cross-cutting test matrix

| Test | Type | Phase | Status |
|---|---|---|---|
| Economy arithmetic / floor-at-zero | Unit | 1 | `[x]` |
| Division rounding | Unit | 1 | `[x]` |
| Gate one-shot + only crossed gate | Unit/Integration | 1 | `[x]` |
| Coin collect-once | Integration | 1 | `[x]` |
| No jump/slide anywhere | Static/manual | 1 | `[x]` |
| Touch steering on mobile viewport | Manual | 1 | `[x]` (headless synthetic touch; real devices Phase 7) |
| Magnet attraction + expiry | Unit/Headless | 5 | `[x]` |
| Shield single block/consume | Integration/Headless | 3/5 | `[x]` |
| Fatal obstacle collision ends run | Unit/Integration | 3 | `[x]` |
| Enemy reward once | Integration | 4 | `[x]` |
| Punch cooldown/range | Unit | 4 | `[x]` |
| Timer correctness through pause | Unit/Headless | 5/6 | `[x]` |
| Fairness and spawn reservations | Unit | 3 | `[x]` |
| Results == run state | Integration/Headless | 6 | `[x]` |
| Endless level generation + speed cap | Unit | 6 | `[x]` |
| In-place restart / no duplicate canvas | Integration/Headless | 6 | `[x]` |
| Gate threshold bias | Unit | 6 | `[x]` |
| Persistence reload | Integration | 6 | `[-]` Deferred |
| Mobile HUD / safe areas / no overlap | Manual | 6/7 | `[~]` Headless mobile screenshots pass; physical devices pending |
| Seven-zone mapping + config validity | Unit | 2 | `[x]` |
| Theme activation + atmosphere transition | Integration | 2 | `[x]` (headless CDP through Level 10 and Level 11+) |
| No-black-screen transition | Visual/Headless | 6 | `[x]` (screenshot luminance 162.3 full / 190.3 centre) |
| Chunk pooling / draw-call and triangle budget | Profiling | 2 | `[x]` (headless, hashed performance smoke) |
| Frame time / draw calls / leaks | Profiling | 7 | `[ ]` |

---

## Blockers and dependencies

| ID | Item | Impact | Status |
|---|---|---|---|
| A1 | Explicit approval of `TECHNICAL_PLAN.md` §15 | Phase 1 | `[x]` Approval granted; Phase 1 implemented |
| A2 | Gameplay tuning values (D1) | Phase 1 balancing | `[x]` Implemented: 0 start, +10 coin, all seven gate variants |
| A3 | Steering model (D2) | Phase 1 | `[x]` 3-lane steering implemented and smoke-tested |
| A4 | Level completion rule (D3) | Phase 1 / overhaul | `[x]` 10 authored levels plus generated endless levels implemented |
| A5 | Asset kit + licences (D4) | Phase 2 | `[x]` Resolved: self-authored procedural art only |
| A6 | Device/browser matrix (D5) | Phase 1 smoke / Phase 7 | `[~]` Phase 1 smoke passed; full matrix in Phase 7 |

> No blockers remain for Phase 1 sign-off. Phase 2 depends on asset approval (A5).

---

## Change log

| Date | Change | Author |
|---|---|---|
| 2026-11-13 | Initial audit; no source found; planning docs created | opencode |
| 2026-11-13 | Direction confirmed: Track B greenfield, Vite + TypeScript + Three.js; docs updated; no code created | opencode |
| 2026-11-13 | Phase 1 implemented: scaffold, loop/clock, player/input/camera, economy, coins, gates, HUD, procedural street, audio, tests | opencode |
| 2026-11-13 | Phase 1 verification: build passes, 14/14 unit tests pass, headless mobile/desktop smoke and integration runs pass | opencode |
| 2026-11-26 | Phase 4 implemented: EnemyMeshBuilder, EnemySystem, PunchSystem; economy enemy-damage/reward types; Punch HUD button; audio cues; balance.ts ENEMIES+PUNCH config | opencode |
| 2026-11-26 | Phase 4 verification: build passes (691.91 kB / 176.61 kB gzip), 6 files, 68/68 unit tests pass | opencode |
| 2026-11-16 | Endless overhaul: generated Level 11+, difficulty tiers, spawn reservations, fatal obstacle collisions, dynamic gates, lifetime coin bias, five power-ups, results/restart | opencode |
| 2026-11-16 | Overhaul verification: 147/147 tests pass, production build passes, headless power-up/results/restart/pause/Level 11 transition checks pass | opencode |

---

## Phase 1 completion report — 2026-11-13

### Files created / updated

**Project root:** `package.json`, `package-lock.json`, `tsconfig.json`,
`vite.config.ts`, `vitest.config.ts`, `index.html`, `.gitignore`,
`README.md`, `public/favicon.svg`.

**Source:** `src/main.ts`, `src/styles/main.css`,
`src/config/balance.ts`, `src/config/levels.ts`,
`src/core/Loop.ts`, `src/core/Clock.ts`, `src/core/Rng.ts`,
`src/core/bakeStaticGroup.ts`,
`src/economy/EconomyManager.ts`, `src/economy/gateMath.ts`,
`src/economy/types.ts`, `src/player/Player.ts`,
`src/input/InputController.ts`, `src/world/Environment.ts`,
`src/collectibles/CoinSystem.ts`, `src/collectibles/Particles.ts`,
`src/gates/Gate.ts`, `src/gates/MathGateSystem.ts`,
`src/ui/Hud.ts`, `src/game/Game.ts`, `src/audio/AudioManager.ts`,
`src/assets/proceduralTextures.ts`.

**Tests:** `tests/economy.test.ts`, `tests/gates.test.ts`,
`tests/levels.test.ts`.

**Docs:** `README.md`, `IMPLEMENTATION_TRACKER.md`; approved architecture
documents preserved.

### Implemented

- Strict TypeScript + Vite + Three.js scaffold and full-viewport responsive
  renderer with capped pixel ratio, ACES tone mapping and soft shadows.
- Pause-aware loop and clock with a 50 ms delta clamp.
- Automatic forward runner with three damped lanes, keyboard + pointer/touch
  steering, procedural low-poly character and run animation.
- Procedural warm Indian street: asphalt with markings, sidewalks, curbs,
  compound walls, houses, balconies, water tanks, trees, lamps, overhead wires,
  scooters, auto-rickshaw and potted plants. Five recycled chunks are merged by
  material to keep draw calls down.
- Authoritative `EconomyManager` with integer balance, zero floor, ledger,
  listener notifications and unique-source idempotency.
- Instanced spinning/bobbing gold coins with four deterministic trail patterns,
  additive glow, collection particles and floating `+10` feedback.
- Two-gate math decisions (`+100`, `−50`, `×3`, `÷2`) on adjacent lanes, unique
  IDs, z-plane crossing, one-shot activation, clear colour/symbol/value design
  and live calculation toast.
- HUD with title, level/zone, progress, balance, pause/resume, safe-area
  padding, control hints and coin feedback. Web Audio cues unlock on gesture.
- Ten 900 m levels with increasing speed and progress looping on the final level.

### Verification performed

| Check | Result |
|---|---|
| `npm run build` (`tsc --noEmit` + Vite) | Passed |
| `npm test` | 3 files, 14 tests passed |
| Headless Chrome 390×844 @2x, synthetic touch | Steering, coin pickup, gate crossing, pause/resume passed |
| Headless integration run to 39% progress | Balance/gates/HUD stayed consistent; toasts `310 ÷ 2 = 155` and `740 − 50 = 690` |
| Desktop viewport 800×600 | Scene, HUD and gates rendered correctly |
| Console/runtime error capture | No exceptions or error logs observed |
| Static check for `jump`, `slide`, `punch` in `src` | No matches |
| Bundle size | 601.84 kB minified / 151.68 kB gzip (warning above 500 kB minified) |

### Known issues / deferred work

- Minor structure deviation from plan §3: `Game` lives at
  `src/game/Game.ts`; coin and gate systems live under `src/collectibles/` and
  `src/gates/`; texture helpers live under `src/assets/`. `EventBus` and a
  generic `Pool` were not needed for Phase 1 and were not created.
- `Loop` uses a variable delta clamped to 50 ms rather than a fixed-step
  accumulator. Stable in smoke testing; revisit if deterministic physics is
  needed.
- Environment art is procedural placeholder work. Phase 2 replaces/augments it
  with the approved asset kit and seven zone themes.
- All levels currently share the same street visuals; only speed/progress differ.
- Home/results screens and persistence are Phase 6.
- Touch was verified with Chrome device emulation, not yet a physical phone;
  performance profiling and the full device/browser matrix are Phase 7.
- Vite reports a chunk-size warning (601 kB minified). Gzip size is within the
  plan budget; code splitting can be considered in the optimisation phase.

### Approval requested

Phase 1 is complete and stopped at the phase gate. Please approve Phase 1 or
request changes before Phase 2 (Indian street environment / asset plan).

---

## Phase exit reporting template

At the end of every phase, report:

1. Files changed
2. What was implemented
3. Tests performed and results
4. Known issues / deferred work
5. Tracker update
6. Request approval for the next phase

---

## Phase 2 completion report — 2026-11-14

### Files changed

**Config:** `src/config/zones.ts` (7 zone themes), `src/config/levels.ts` (10 levels mapped to zones).

**World:** `src/world/Environment.ts` (sky, atmosphere, chunk orchestration, prefetch, pool eviction, moving traffic integration), `src/world/street/StreetChunkBuilder.ts` (all procedural geometry), `src/world/street/StreetMaterials.ts` (all shared materials), `src/world/street/MovingTraffic.ts` (ambient traffic vehicles).

**Assets:** `src/assets/proceduralTextures.ts` (asphalt, paver, plaster, brick, concrete, roof, wood, dirt, sign atlas, contact shadow, cloud, glow, gate textures).

**Tests:** `tests/zones.test.ts` (3 zone tests added to the suite).

**Tooling:** `vitest.config.ts` (downgraded from Vitest 5.1.0 to 3.0.0 to fix Node 24 runner-context crash), `package.json` (vitest `^3.0.0`).

**Docs:** `COLLECTOPIA_PROGRESS_REPORT.md` (created), `IMPLEMENTATION_TRACKER.md` (this update).

### What was implemented

See `COLLECTOPIA_PROGRESS_REPORT.md` §Phase 2 for the full feature list.

### Tests performed and results

| Test | Result |
|---|---|
| `npm run build` | Passed — 668 kB / 170 kB gzip |
| `npm test` (Vitest 3.0.0, 4 files, 17 tests) | All passed |
| Zone config validity | Passed |
| Level-to-zone mapping | Passed |
| Visual inspection of all 7 themes | All distinct and correct |
| Atmosphere transition smoothness | Smooth — no pop |
| First-entry freeze | Not observed |
| Moving traffic behaviour | Correct fade/distance |
| Shadows and lighting | Correct |
| Console errors | None |

### Known issues / deferred work

- Bundle size 668 kB minified (Vite warns above 500 kB); gzip 170 kB is within the 1.5 MB plan budget. Code splitting deferred to Phase 7.
- Vitest downgraded from 5.1.0 to 3.0.0 due to a Node 24 incompatibility in Vitest 5's vmForks pool.
- Real-device and full browser matrix testing deferred to Phase 7.
- Obstacle collision volumes, gameplay hazards and the fairness validator are Phase 3.

### Approval requested

Phase 2 is complete and stopped at the phase gate. Please approve Phase 2 and Phase 3 before Phase 3 implementation begins.

---

## Phase 4 completion report — 2026-11-26

### Files changed

**New source:**
- `src/enemies/EnemyMeshBuilder.ts` — procedural 3D models for 5 enemy types (basic, fast, guard, heavy, boss) with AABB half-extents and max HP tables.
- `src/enemies/EnemySystem.ts` — spawn, update, AABB collision, approach/lane-change movement, knockback, defeat, economy dispatch, `shieldActive` and `freezeActive` hooks, difficulty scaling by level index.
- `src/enemies/PunchSystem.ts` — cooldown timer, animation phase, delegation to `EnemySystem.punch()`, hit/miss callbacks, `superPunchActive` flag.

**Modified source:**
- `src/economy/types.ts` — added `enemy-damage` and `enemy-reward` to `TransactionType`.
- `src/economy/EconomyManager.ts` — added default labels and switch cases for `enemy-damage` (subtracts) and `enemy-reward` (adds).
- `src/config/balance.ts` — added `ENEMIES` and `PUNCH` config blocks with all tuning constants.
- `src/audio/AudioManager.ts` — added `punchHit()`, `punchMiss()`, `enemyHit()`, `enemyDefeated()` methods.
- `src/input/InputController.ts` — added `onPunch` callback to `InputCallbacks` interface; F/Space keyboard bindings.
- `src/ui/Hud.ts` — added Punch button DOM (circular button with SVG cooldown ring), `setPunchCooldown()`, `showEnemyReward()` methods; updated `HudCallbacks` to include `onPunch`.
- `src/styles/main.css` — added full Punch button CSS (`.punch-area`, `.punch-button`, `.punch-cooldown-ring`, `.coin-pop.is-reward`); updated `.hint` for right-side clearance.
- `src/game/Game.ts` — imported `EnemySystem`, `PunchSystem`; added enemies + punch fields; wired both systems; added `handleEnemyHit()` and `handleEnemyDefeated()` handlers; passes `levelIndex` and `speed` to `enemies.update()`; calls `punch.update()` and `hud.setPunchCooldown()` each frame.

**New tests:**
- `tests/enemies.test.ts` — 34 tests covering enemy config, PunchSystem behaviour, economy enemy-damage/reward transactions and combined scenarios.

**Docs:**
- `IMPLEMENTATION_TRACKER.md` (this update).
- `COLLECTOPIA_PROGRESS_REPORT.md` (Phase 4 section appended).

### What was implemented

- Five procedural enemy types (basic, fast, guard, heavy, boss) with distinct 3D silhouettes and accurate AABB bounding boxes.
- `EnemySystem`: spawn scheduling, per-frame update (approach, lane change, knockback, defeat flash), AABB player collision triggering `enemy-damage` penalty, difficulty scaling (enemies from level 2; boss from level 6; speed +7% per level).
- `PunchSystem`: 1.0 s cooldown, range check (4.5 m forward / 2.4 m lateral), animation flag, hit/miss callbacks, delegation to `EnemySystem.punch()`.
- Multi-hit enemies: heavy requires 3 punches, boss requires 5; boss shows a 3D HP bar above its head (colour shifts green→red as HP drops).
- Economy integration: `enemy-damage` subtracts 50 coins (floored at 0, 1.8 s per-enemy cooldown); `enemy-reward` adds the type-specific reward on first defeat.
- Punch button in HUD: circular touch target with SVG cooldown ring and floating reward feedback.
- Audio cues: `punchHit`, `punchMiss`, `enemyHit`, `enemyDefeated`.
- Phase 5 hooks wired and tested: `EnemySystem.shieldActive` (blocks enemy-damage), `EnemySystem.freezeActive` (pauses movement), `PunchSystem.superPunchActive` (passes `superPunch=true` to punch call).

### Tests performed and results

| Check | Result |
|---|---|
| `npm run build` (TypeScript strict + Vite) | Passed — 691.91 kB / 176.61 kB gzip |
| `npm test` (Vitest 3, 6 files) | 68 tests, 0 failures |
| ENEMY_HALF_EXTENTS (all types, positive extents, lane fit) | Passed |
| ENEMY_MAX_HP (correct values per type) | Passed |
| ENEMIES config (penalty, cooldown, rewards ordered) | Passed |
| PUNCH config (cooldown positive, range values, animDuration < cooldown) | Passed |
| PunchSystem (ready state, callbacks, cooldown enforcement, ratio, animating flag) | Passed |
| economy enemy-damage (50 penalty, floor, duplicate rejection, cooldown window, shield skip) | Passed |
| economy enemy-reward (correct per type, duplicate prevention, ledger entry) | Passed |
| Combined scenario (damage+reward net balance, existing transactions unaffected) | Passed |
| No jump/slide controls in src | Verified |
| Console errors | None observed |

### Known issues / deferred work

- Punch animation is an `isAnimating` flag plus a white flash on the enemy mesh. No arm-swing keyframe animation is implemented; that is Phase 7 polish.
- The boss HP bar is a 3D mesh positioned above the boss head. A full DOM health bar overlay is Phase 6.
- Enemy movement is approach-only (closes distance toward player each frame, with optional lane retargeting for fast/guard types). No A* or avoidance pathfinding — this is correct per PRD.
- Real-device testing deferred to Phase 7.
- `EnemySystem.freezeActive` and `EnemySystem.shieldActive` flags are wired and tested but are not set by any Phase 4 code; Phase 5 activates them.

---

## Spryntworks Advertising System — completion report — 2026-11-26

### Files created

- `src/world/ads/AdTextures.ts` — Spryntworks logo loader (async TextureLoader from `/assets/branding/spryntworks-logo.jpg`), procedural canvas textures for each ad panel face (gantry background, LED screen, building board, shopfront board, hoarding, plinth), fallback canvas texture if the JPG fails to load
- `src/world/ads/AdStructureBuilder.ts` — procedural 3D builders for all 6 advertising format types: `gantry`, `hoarding`, `led-screen`, `building-board`, `shopfront-board`, `premium-install`; logo panels sized to exact 2.363:1 aspect ratio; `AD_SIDE_OFFSET` table keeping every non-gantry format beyond road edge
- `src/world/ads/AdSystem.ts` — spawn-ahead / recycle-behind pool, zone-aware format selection, gate exclusion guard, gantry spacing guard, MAX_ACTIVE cap, full dispose support

### Files modified

- `src/config/balance.ts` — added `ADVERTISING` config block (all tuning constants: spawnAhead, recycleBehind, gapMin, gapMax, gantryMinGap, gateExclusion, maxActive, logo dimensions and aspect ratio)
- `src/world/Environment.ts` — imported AdSystem; added `private readonly ads: AdSystem`; added `this.ads = new AdSystem(scene)` in constructor; added `this.ads.update(distance, playerZ, this.activeZoneId)` in update(); added `this.ads.dispose()` in dispose()

### Tests created

- `tests/ads.test.ts` — 31 tests covering:
  - ADVERTISING config sanity (spawn/gap relationships, logo dimensions, aspect ratio, gate exclusion)
  - AD_SIDE_OFFSET placement (gantry centred, all non-gantry beyond road edge, no lane overlap)
  - Gate exclusion logic (reproduces isNearGate() — rejects within exclusion zone, allows outside)
  - Logo aspect ratio preservation (all 6 formats verified to use panelH × LOGO_RATIO)
  - Zone format table completeness (all 7 zones defined, positive weights, temple restrictions, traffic gantry, outskirts hoarding, correct highest-weight formats)
  - Recycling bounds (ahead ad not recycled, behind ad is recycled)
  - No road obstruction (lane centres clear of all non-gantry ad placements)

### Build and test results

| Check | Result |
|---|---|
| `tsc --noEmit` | Passed — 0 errors |
| `npm run build` | Passed — 705.85 kB / 180.98 kB gzip |
| `npm test` (Vitest 3.0.0, 7 files) | 99 / 99 tests passed |

### What was implemented

**Logo usage:**
- `getSpryntworksLogo()` loads `/assets/branding/spryntworks-logo.jpg` via `THREE.TextureLoader` once and caches it
- Every ad structure that shows the logo uses a `THREE.MeshBasicMaterial` with the texture applied, preserving the original artwork at the exact 640×271 aspect ratio
- A fallback procedural canvas texture is generated only if the JPG fails to load

**6 advertising formats:**
1. **Gantry** — overhead spanning arch, two steel pylons at road edges (height 10.5 m), horizontal cross-beam, 5.67 × 2.4 m logo panel hanging below beam, LED strip, concrete footings
2. **Hoarding** — giant freestanding roadside billboard on two legs (height 6.5 m + panel), 7 × 2.96 m logo panel facing inward, diagonal tagline background, LED top strip
3. **LED screen** — slim steel pylon (height 4.5 m), dark bezel, animated LED background material, 2.79 × 1.18 m logo panel, additive pink glow aura
4. **Building-mounted board** — flush bracket mount at first-floor height (4.2 m), 3.59 × 1.52 m logo panel, accent stripe background matching local brand colours
5. **Shopfront board** — low horizontal sign at 2.8 m, 2.36 × 1.0 m (exact logo ratio), bold colour background, tagline text, logo panel left-anchored, LED accent strip
6. **Premium installation** — backlit totem (4.8 m) on polished plinth, internal emissive glow, 2.65 × 1.12 m logo panel, gold cap and LED crown strip

**Zone-specific placement:**
- Residential: building boards and shopfront boards dominate
- Market: shopfront boards highest weight, LED screens present
- Construction: large hoardings and gantries dominate
- Temple: only building boards, shopfront boards, premium installs — no gantry, no LED
- Festival: LED screens and premium installs dominate (complement festival lights)
- Traffic Crossing: gantries highest weight, hoardings and LED screens
- Town Outskirts: large hoardings and gantries for highway feel

**Safety constraints enforced:**
- Gate exclusion: no ad within `ADVERTISING.gateExclusion` (20 m) of a gate z-position
- Road clearance: all non-gantry formats placed beyond ±4.05 m road edge + sidewalk
- Gantry spacing: minimum 180 m between successive gantries
- Active cap: maximum 14 ads simultaneously in the scene
- Side stagger: left and right spawn counters start offset to avoid mirrored placement

### Known issues / deferred work

- Logo texture loads asynchronously; ad panels show white until the JPG arrives (~1 frame on LAN). The fallback procedural texture prevents blank panels on load failure.
- Building-board and shopfront-board use `Math.random()` in structure builder for colour/tagline selection. This is non-deterministic but harmless (visual variety, no gameplay impact). Phase 7 can seed this via the zone RNG if needed.
- Real-device performance testing is Phase 7. The MAX_ACTIVE cap (14) and scene.remove on recycle keep the ad geometry count bounded.
- Code-splitting (Vite chunk >500 kB warning) is a Phase 7 task.

---

## Endless Gameplay Overhaul — completion report — 2026-11-16

### Files created

- `src/config/difficulty.ts` — intro/moderate/complex/endless profiles, weighted picker, capped endless ramp.
- `src/core/SpawnReservations.ts` — shared lane/distance corridor reservations across gates, obstacles, enemies and power-ups.
- `src/collectibles/magnet.ts` — allocation-free magnet attraction helper.
- `src/obstacles/contact.ts` — pure fatal/shield/break contact resolution.
- `src/powerups/PowerUpTimers.ts` — five pause-aware timer types with refresh-reset semantics.
- `src/powerups/PowerUpModels.ts` — procedural three-dimensional power-up collectibles.
- `src/powerups/PowerUpSystem.ts` — spawning, collection, reservations and expiry.
- `tests/difficulty.test.ts` — difficulty tiers, caps, weighted selection and reservations.
- `tests/powerups.test.ts` — timer refresh/expiry, magnet attraction, shield/break/fatal contact rules.

### Files modified

- `src/config/levels.ts` — Level 11+ generation, endless speed ramp/cap, next-level helpers.
- `src/config/balance.ts` — `POWERUPS` and `GATE_BIAS` configuration.
- `src/economy/gateMath.ts` — `+100`, `−50`, `−100`, `×1`, `×2`, `÷2`, `÷4`; weighted pairs.
- `src/economy/EconomyManager.ts` — lifetime coin total and run reset.
- `src/gates/MathGateSystem.ts` — lifetime threshold bias, reservation checks and reset.
- `src/collectibles/CoinSystem.ts` — magnet pull, double-coin multiplier, difficulty gaps and reset.
- `src/obstacles/ObstacleSystem.ts` — fatal collisions, shield/Super Punch, difficulty/reservations/reset.
- `src/enemies/EnemySystem.ts` — difficulty-driven enemies, freeze/shield interactions, reset, punch-behind fix.
- `src/enemies/PunchSystem.ts` — Super Punch reset.
- `src/game/Game.ts` — power-up effects, results, run stats, game-over, in-place restart, timer expiry.
- `src/ui/Hud.ts` — power-up chips, results overlay, restart action.
- `src/styles/main.css` — power-up/results styling and transition vignette.
- `src/audio/AudioManager.ts` — power-up, shield, break and game-over cues.
- `src/world/Environment.ts` — generated-level prefetch and reset-safe zone transitions.
- `src/world/ads/AdSystem.ts` — reset support while preserving the five static formats.
- `src/player/Player.ts`, `src/collectibles/Particles.ts` — reset support.
- `tests/gates.test.ts`, `tests/levels.test.ts`, `tests/economy.test.ts` — updated and expanded expectations.

### Implemented behaviour

- **Endless progression:** Level 11 begins after Level 10; zones cycle; speed rises from 24.7 m/s by 0.7 per level and caps at 31 m/s.
- **Difficulty:** intro levels 1–2, moderate 3–5, complex 6–10, endless 11+ with a 14-level ramp to capped spacing, density and enemy weights.
- **Fairness:** gates reserve all lanes; obstacles, enemies and power-ups reserve their corridors to prevent unsafe overlap.
- **Gates:** seven variants with weighted pair selection; after 200,000 lifetime collected coins the table leans toward subtract/divide choices.
- **Run economy:** restart resets the run balance, ledger and claimed IDs while preserving lifetime collected coins for gate bias.
- **Obstacle collisions:** first unblocked hit ends the run; Shield absorbs one hit; Super Punch smashes breakable walls.
- **Power-ups:** Magnet 5 s, Shield 8 s/one hit, Super Punch 6 s, Double Coins 6 s, Freeze 5 s; same-type pickup refreshes to full duration; different types coexist.
- **Results/restart:** distance, level, coins, gates, enemies and final balance shown; “Run again” resets in place without a reload or duplicate canvas.
- **Transitions:** replaced the near-black overlay with a transparent radial vignette while keeping the old world visible until the next pool is ready.
- **Advertising:** five static formats retained; no LED format; logo aspect ratio unchanged.

### Verification performed

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Passed — no output |
| `npm test` | 9 files, 147/147 tests passed |
| `npm run build` | Passed — 760.78 kB / 197.21 kB gzip; chunk-size warning remains |
| Headless initial load | 1 canvas, Level 1, balance 0, no power-up chips, results hidden |
| Magnet runtime | Coin moved from distance 5.0 → 4.04 and X 6.0 → 4.85 |
| Power-up activation | Timers 5 / 8 / 6 / 6 / 5 s; all five effects and HUD chips active |
| Shield consumption | Timer 7.9 → 0; both shield flags cleared; no game over |
| Power-up expiry | All timers, chips and gameplay flags cleared |
| Pause timer | Magnet remained at 2.0 s across a 500 ms pause |
| Fatal collision/results | Game over, clock paused, stats 2,500 m / Level 3 / 2 coins / 1 gate / 1 enemy / 100 balance |
| Restart | Balance 0, lifetime 100 retained, distance 0, Level 1, results hidden, 1 canvas, all effects reset |
| Level 11 transition | Overlay active only during transition; residential root sole visible; no black screen |
| Transition luminance | Full screenshot 162.3 average / 0.7% dark; centre 190.3 average / 3.0% dark |
| Endless transitions | Levels 12–16 activated market, construction, temple, festival and traffic with one visible root each |
| Console/runtime errors | None captured |

### Known issues / deferred work

- Physical phone/tablet testing, Firefox/Edge/Safari matrix, on-device performance and repeated-run leak profiling remain Phase 7.
- Cross-reload persistence is not implemented; lifetime coins persist across runs in the current session only.
- The production bundle still triggers Vite's >500 kB chunk warning; gzip size is 197.21 kB.
- Transition and results evidence was captured headlessly at 390×844 @2x; real-device visual review is still required.
- Power-up HUD chips wrap onto two rows on narrow screens; no overlap with Punch or results, but physical-device ergonomics need confirmation.
