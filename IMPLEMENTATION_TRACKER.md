# IMPLEMENTATION_TRACKER.md

**Project:** COLLECTOPIA
**PRD:** `COLLECTOPIA_PRD_v1.0.md`
**Plan:** `TECHNICAL_PLAN.md`
**Audit:** `CODEBASE_AUDIT.md`
**Direction:** Track B — Greenfield (confirmed)
**Last updated:** 2026-11-14

---

## Status legend

| Symbol | Meaning |
|---|---|
| `[x]` | Done |
| `[ ]` | Not started |
| `[~]` | In progress |
| `[!]` | Blocked |
| `[-]` | Deferred / not approved |

**Overall project status:** `[~]` PHASE 2 COMPLETE — AWAITING USER SIGN-OFF
**Implementation started:** **Yes (Phases 1–2 complete)**
**Vite initialised:** **Yes**
**Dependencies installed:** **Yes**
**Phase 1 exit gate:** **Passed and signed off by continuing to Phase 2**
**Phase 2 exit gate:** **Build, 17 unit tests and headless theme/performance smoke passed**

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
| D1 | Starting balance / coin value / gate values | `[x]` | Start 0; coin +10; gates +100 / −50 / ×3 / ÷2; floor at 0 |
| D2 | Lane-based vs continuous steering | `[x]` | 3 lanes, smooth lane interpolation |
| D3 | Level completion condition | `[x]` | 10 fixed-length levels, 900 m each; speed rises per level |
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
**Status:** `[x]` Complete — awaiting final sign-off.

| # | Task | Status | Acceptance criteria |
|---|---|---|---|
| 2.1 | Approve and register asset kit + licences | `[x]` | D4 resolved: self-authored procedural art; no third-party licences needed |
| 2.2 | Road, markings, sidewalks, drainage | `[x]` | Existing asphalt, repaired patches, sidewalks, curbs and drains kept; theme-aware markings added |
| 2.3 | Residential buildings, walls, balconies, tanks | `[x]` | Reused varied facades; construction lots now leave unfinished/empty plots |
| 2.4 | Street dressing (scooters, autos, shops, carts, poles, trees) | `[x]` | Theme-specific counts plus stalls, crates, barriers, cones, signals, string lights, rangoli and fields |
| 2.5 | Seven environment zone themes | `[x]` | `src/config/zones.ts` defines all seven; `levels.ts` maps ten levels to them |
| 2.6 | Lighting, shadows, sky, materials | `[x]` | Per-zone sky gradient, fog, hemisphere/sun colour and intensity lerp smoothly at transitions |
| 2.7 | Chunk generation + pooling | `[x]` | Theme-keyed pools, five chunks per theme, recycled around the player, built lazily |
| 2.8 | Environment performance pass | `[x]` | Headless budget check: 117 calls / 143k triangles scene pass, 151 calls / 177k triangles with shadows |

---

## Phase 3 — Obstacles and walls

**Goal:** Physical, fair wall/street-obstacle gameplay.
**Dependencies:** Phase 2 exit gate.
**Status:** `[ ]` Not started.

| # | Task | Status | Acceptance criteria |
|---|---|---|---|
| 3.1 | Concrete, brick, wooden, low and moving walls | `[ ]` | Accurate colliders; steer-around works |
| 3.2 | Breakable walls + Super Punch hook | `[ ]` | Break only with Super Punch |
| 3.3 | Narrow wall passage | `[ ]` | Traversable with reasonable clearance |
| 3.4 | Street obstacles (scooters, carts, crates, barriers) | `[ ]` | Distinct from scenery |
| 3.5 | Damage penalty + hit lock/cooldown | `[ ]` | One penalty per obstacle contact |
| 3.6 | Shield interaction | `[ ]` | Blocks one qualifying hit |
| 3.7 | Fairness validator integration | `[ ]` | Every pattern has a safe route |
| 3.8 | Pattern/fairness tests | `[ ]` | Automated tests pass |

---

## Phase 4 — Enemy and combat

**Goal:** Enemy behaviours, Punch combat, damage/rewards, boss.
**Dependencies:** Phase 3 exit gate.
**Status:** `[ ]` Not started.

| # | Task | Status | Acceptance criteria |
|---|---|---|---|
| 4.1 | Basic, fast, guard, heavy and boss enemies | `[ ]` | Distinct; fair spawn distance |
| 4.2 | Approach/chase/lane-change behaviours | `[ ]` | Readable and fair |
| 4.3 | Enemy collision penalty + cooldown | `[ ]` | Exactly one penalty per encounter |
| 4.4 | Punch targeting, range, cooldown | `[ ]` | Only valid targets take damage |
| 4.5 | Punch animation + impact feedback | `[ ]` | Works while running |
| 4.6 | Heavy/boss multi-hit + boss health bar | `[ ]` | Correct health/defeat logic |
| 4.7 | Defeat reward once per enemy | `[ ]` | No duplicate rewards |
| 4.8 | Super Punch combat effect | `[ ]` | Stronger vs heavies; configurable |
| 4.9 | Freeze Enemy support | `[ ]` | Visible frozen state; safe resume |

---

## Phase 5 — Power-ups

**Goal:** Five power-ups with correct, pause-aware timers.
**Dependencies:** Phase 4 exit gate (enemies for Freeze/Super Punch).
**Status:** `[ ]` Not started.

| # | Task | Status | Acceptance criteria |
|---|---|---|---|
| 5.1 | Magnet (5 s, smooth attraction) | `[ ]` | Each coin attracted/claimed once |
| 5.2 | Shield (one hit, consumed) | `[ ]` | Blocks exactly one qualifying event |
| 5.3 | Super Punch (5 s, breakable walls/heavies) | `[ ]` | Clear activation/expiry |
| 5.4 | Double Coins (5 s, eligible pickups only) | `[ ]` | Does not double gates/enemy rewards |
| 5.5 | Freeze Enemy (5 s, visible, safe resume) | `[ ]` | Enemies stop and resume correctly |
| 5.6 | Spawn rules (fair, reachable, not inside hazards) | `[ ]` | No clutter; validator passes |
| 5.7 | Pause-aware timer service | `[ ]` | Correct through pause/resume |
| 5.8 | Stacking/refresh rules + HUD status | `[ ]` | Same refreshes; different coexist |
| 5.9 | Power-up tests | `[ ]` | All pass |

---

## Phase 6 — HUD, levels and results

**Goal:** Complete mobile UI, 10-level progression, working results.
**Dependencies:** Phase 5 exit gate.
**Status:** `[ ]` Not started.

| # | Task | Status | Acceptance criteria |
|---|---|---|---|
| 6.1 | Full top HUD (level, zone, progress, balance, pause) | `[ ]` | Readable; high contrast; safe areas |
| 6.2 | Power-up status strip | `[ ]` | All five states/countdowns correct |
| 6.3 | Steering + Punch layout | `[ ]` | No overlap; accessible |
| 6.4 | Pause/resume screen | `[ ]` | Freezes timers/state correctly |
| 6.5 | 10 levels across 7 zones | `[ ]` | Complete, data-driven config |
| 6.6 | Difficulty progression | `[ ]` | Increases without unfair patterns |
| 6.7 | Results screen with ledger breakdown | `[ ]` | Totals match ledger exactly |
| 6.8 | Next Level / Replay / Home actions | `[ ]` | Every visible action works |
| 6.9 | Persistence (progress, total balance) | `[ ]` | Survives reload; no run-state restore |
| 6.10 | No jump/slide hints | `[ ]` | Verified across all screens |

---

## Phase 7 — Integration and optimisation

**Goal:** Full regression, mobile/desktop testing, performance and polish.
**Dependencies:** Phase 6 exit gate.
**Status:** `[ ]` Not started.

| # | Task | Status | Acceptance criteria |
|---|---|---|---|
| 7.1 | Full PRD §13 acceptance walkthrough | `[ ]` | Every item checked |
| 7.2 | Mobile device/browser matrix | `[ ]` | Representative devices pass |
| 7.3 | Desktop browser matrix | `[ ]` | Chrome/Firefox/Edge/Safari usable |
| 7.4 | Performance profiling | `[ ]` | Meets plan §12 |
| 7.5 | Memory/leak checks | `[ ]` | No growth across replays |
| 7.6 | Visual/polish pass | `[ ]` | Consistent art direction |
| 7.7 | Documentation + known limitations | `[ ]` | Docs current |
| 7.8 | Final approval review | `[ ]` | User signs off |

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
| Magnet collect-once + expiry | Unit/Integration | 5 | `[ ]` |
| Shield single block | Integration | 3/5 | `[ ]` |
| Collision penalty once | Integration | 3 | `[ ]` |
| Enemy reward once | Integration | 4 | `[ ]` |
| Punch cooldown/range | Unit | 4 | `[ ]` |
| Timer correctness through pause/background | Unit | 5/6 | `[ ]` |
| Fairness validator (all patterns) | Unit | 3 | `[ ]` |
| Results == ledger | Integration | 6 | `[ ]` |
| Persistence reload | Integration | 6 | `[ ]` |
| Mobile HUD / safe areas / no overlap | Manual | 6/7 | `[ ]` |
| Seven-zone mapping + config validity | Unit | 2 | `[x]` |
| Theme activation + atmosphere transition | Integration | 2 | `[x]` (headless CDP run through all 10 levels) |
| Chunk pooling / draw-call and triangle budget | Profiling | 2 | `[x]` (headless, hashed performance smoke) |
| Frame time / draw calls / leaks | Profiling | 7 | `[ ]` |

---

## Blockers and dependencies

| ID | Item | Impact | Status |
|---|---|---|---|
| A1 | Explicit approval of `TECHNICAL_PLAN.md` §15 | Phase 1 | `[x]` Approval granted; Phase 1 implemented |
| A2 | Gameplay tuning values (D1) | Phase 1 balancing | `[x]` Implemented defaults: 0 start, +10 coin, +100/−50/×3/÷2 |
| A3 | Steering model (D2) | Phase 1 | `[x]` 3-lane steering implemented and smoke-tested |
| A4 | Level completion rule (D3) | Phase 1 | `[x]` 10 fixed-length levels implemented |
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
