# TECHNICAL_PLAN.md

**Project:** COLLECTOPIA
**Document status:** **Approved — Phase 1 implemented; awaiting phase sign-off (Track B Greenfield)**
**Date:** 2026-11-13
**Prerequisite:** `CODEBASE_AUDIT.md`
**Requirements:** `COLLECTOPIA_PRD_v1.0.md` (primary source of truth)

> Phase 1 scope note: enemies, punching, power-ups and advanced obstacles are
> explicitly excluded. Punch remains a Phase 4 deliverable per the PRD.

---

## 0. Confirmed decisions

| Decision | Value |
|---|---|
| Approach | **Track B — Greenfield** |
| Stack | **Vite + TypeScript + Three.js** |
| Platform | **Mobile browsers + desktop browsers** |
| Lens Studio | **Excluded** |
| Jump / slide | **Excluded** |
| Legacy code | **None to preserve** |
| Requirements | Follow `COLLECTOPIA_PRD_v1.0.md` |

---

## 1. Scope and constraints

**In scope:** a mobile-first 3D runner in an Indian residential street, with
automatic forward running, left/right steering, gold coins, four mathematical
gates, walls/street obstacles, enemies with a Punch action, five power-ups,
levels, results and persistence.

**Out of scope (PRD non-goals):** jump/slide, multiplayer, online leaderboards,
real-money features, open world, Lens Studio, replacing the chosen stack without
a documented reason, third-party analytics without approval.

**Engineering constraints:**
- One authoritative owner for balance, collision state, timers and level state.
- All gameplay tuning values in one config module.
- Touch-first UI with safe-area support; desktop usable for testing.
- No per-frame allocations in hot paths; pooled gameplay objects.
- No jump/slide input, animation, hint or logic anywhere.

---

## 2. Technology stack

| Concern | Choice | Rationale |
|---|---|---|
| Language | **TypeScript** | Typed gameplay/config; safer refactors |
| Build/dev | **Vite** | Fast HMR, small static output, simple mobile-LAN testing |
| 3D renderer | **Three.js** | Mature WebGL renderer, mobile-proven, no engine lock-in |
| Collision | **Custom AABB/sphere** | Predictable runner collision; avoids a heavy physics engine |
| UI | **DOM/CSS overlay** | Crisp HUD, safe areas, cheap updates, accessible touch targets |
| Audio | **Web Audio API** | Small cues without large files; unlock on first gesture |
| Unit tests | **Vitest** | Fast tests for economy/gates/fairness |
| E2E (optional) | **Playwright** | Desktop + mobile-viewport smoke tests |
| Persistence | **localStorage, versioned** | No backend; progress only |
| Language/format | ES modules, GLB assets | Modern browsers, efficient 3D assets |

### 2.1 Dependencies (approved for Phase 1)

| Package | Type | Purpose |
|---|---|---|
| `three` | runtime | 3D rendering |
| `typescript` | dev | Types and compilation |
| `vite` | dev | Dev server and production build |
| `vitest` | dev | Unit tests |
| `@types/three` | dev | Types if not supplied by the package |
| `playwright` | dev (optional) | E2E smoke tests |

**Deliberately not used:** physics engine, UI framework, state library,
analytics SDK, Lens Studio, Unity, Babylon.js, PlayCanvas.

---

## 3. Initial project folder structure

This is the target structure for Phase 1. Later phases add files inside the
existing folders; the top-level shape should not change.

```
collectopia/
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── .gitignore
├── README.md
├── public/
│   ├── favicon.ico
│   ├── icons/
│   └── manifest.webmanifest
├── src/
│   ├── main.ts                     # bootstrap, renderer, error boundary
│   ├── Game.ts                     # state machine: Home → Running ⇄ Paused → Results
│   ├── config/
│   │   ├── balance.ts              # every tunable gameplay value
│   │   ├── levels.ts               # 10 levels, 7 zones, gate/obstacle tables
│   │   └── assets.ts               # asset manifest and paths
│   ├── core/
│   │   ├── Loop.ts                 # fixed-step update + render
│   │   ├── Clock.ts                # pause-aware game time
│   │   ├── EventBus.ts             # typed gameplay events
│   │   ├── Pool.ts                 # reusable object pool
│   │   └── Rng.ts                  # seeded RNG for generation
│   ├── player/
│   │   ├── PlayerController.ts     # forward run, lane steering, punch state
│   │   └── PlayerView.ts           # model, animation mixer, shield VFX
│   ├── input/
│   │   └── InputController.ts      # touch swipe/drag + keyboard; NO jump/slide
│   ├── economy/
│   │   ├── EconomyManager.ts       # authoritative balance + ledger + idempotency
│   │   └── types.ts                # TransactionType, LedgerEntry
│   ├── systems/
│   │   ├── CoinSystem.ts
│   │   ├── MathGateSystem.ts
│   │   ├── ObstacleSystem.ts
│   │   ├── EnemySystem.ts
│   │   ├── CombatSystem.ts
│   │   ├── PowerUpSystem.ts
│   │   └── FairnessValidator.ts
│   ├── world/
│   │   ├── EnvironmentManager.ts
│   │   ├── ChunkGenerator.ts
│   │   └── AssetLoader.ts
│   ├── progression/
│   │   ├── LevelManager.ts
│   │   └── SaveService.ts
│   ├── ui/
│   │   ├── Hud.ts
│   │   ├── PunchButton.ts
│   │   ├── Screens.ts
│   │   └── styles.css
│   └── audio/
│       └── AudioManager.ts
├── tests/
│   ├── economy.test.ts
│   ├── gates.test.ts
│   ├── spawn-fairness.test.ts
│   ├── powerups.test.ts
│   └── persistence.test.ts
└── assets-source/                  # optional working files, not shipped
    ├── models/
    ├── textures/
    └── audio/
```

Runtime assets that are loaded by URL will live in `public/assets/` (or be
imported through Vite) once the asset pipeline is approved.

**Rule:** one cohesive module per responsibility; do not create a file per class
unless it earns its place.

---

## 4. Runtime architecture

```
InputController ──► PlayerController ──► PlayerView (animations, VFX)
                          │
                          ├─ lane change, punch
                          ▼
Game (owns state: Home → Running ⇄ Paused → Results)
  ├── Loop + Clock (fixed step, pause-aware time)
  ├── ChunkGenerator ──► CoinSystem / MathGateSystem / ObstacleSystem /
  │                       EnemySystem / PowerUpSystem
  ├── CombatSystem (punch targeting)
  ├── FairnessValidator (rejects unsafe patterns)
  ├── EconomyManager (single balance + ledger authority)
  ├── LevelManager (progress, difficulty, completion)
  ├── SaveService (versioned localStorage)
  └── Hud / Screens / AudioManager (subscribers; never own game state)
```

**Ownership rules**
- `Game` owns run state and the pause transition.
- `EconomyManager` is the only writer of balance and ledger.
- Each system owns its own entity collections and collision volumes.
- `Hud` and `Screens` render state; they never mutate gameplay.
- Power-up timers live in `PowerUpSystem` and use `Clock.dt`.

---

## 5. Module responsibilities

| Module | Responsibility |
|---|---|
| `main.ts` | Create renderer/canvas, HUD root, load config, start `Game` |
| `Game.ts` | State machine, update/render orchestration, pause/resume, run start/end |
| `Loop.ts` | Fixed-step accumulator with interpolated rendering |
| `Clock.ts` | Game-time seconds that stop during pause/background |
| `InputController.ts` | Touch swipe/drag, keyboard test bindings, Punch trigger; no jump/slide |
| `PlayerController.ts` | Auto-forward speed, 3-lane steering, punch lockout, hit reaction |
| `PlayerView.ts` | GLB model, mixer, run/idle/punch/hit animations, shield VFX |
| `EconomyManager.ts` | Balance, ledger, transaction types, idempotency, floor-at-zero |
| `CoinSystem.ts` | Coin spawning, rotation/bob, pickup once, magnet attraction |
| `MathGateSystem.ts` | Gate pairs, symbols/values, crossing detection, one-shot activation |
| `ObstacleSystem.ts` | Walls/street obstacles, moving colliders, hit locks, damage |
| `EnemySystem.ts` | Enemy types/health/behaviours, freeze state, defeat |
| `CombatSystem.ts` | Punch range/cone, cooldown, target selection, rewards |
| `PowerUpSystem.ts` | Spawning, five effects, timers, refresh/stacking |
| `FairnessValidator.ts` | Ensures at least one reachable safe route per pattern |
| `EnvironmentManager.ts` | Sky/light/fog, zone themes, scenery placement |
| `ChunkGenerator.ts` | Seeded segment generation, pooling, despawn |
| `AssetLoader.ts` | GLB/texture/audio loading, progress, disposal |
| `LevelManager.ts` | Level config, completion, difficulty scaling |
| `SaveService.ts` | Versioned save/load/migration, corrupt-data fallback |
| `Hud.ts` / `Screens.ts` | Balance, level, progress, power-ups, pause, results |
| `PunchButton.ts` | Large circular touch control with cooldown feedback |
| `AudioManager.ts` | Cue playback, unlock-on-gesture, volume/mute |

---

## 6. Gameplay defaults (proposed — confirm before tuning)

These are starting values only; all live in `src/config/balance.ts`.

| Topic | Proposed default | PRD reference |
|---|---|---|
| Movement | 3 lanes, smooth interpolation; no vertical movement | §3.1 |
| Forward speed | Increases per level; tunable | §3, §11.2 |
| Jump/slide | Not built, not bound, not shown | §3.1, §10.1 |
| Punch | Tap button; ~1.0 s cooldown; forward range ≈ 1 lane; one target | §8.4 |
| Starting run balance | 0 (configurable per level) | §4.3 |
| Coin value | 10 coins; Double Coins doubles eligible pickups | §4, §9.4 |
| Gate choices | Two gates, adjacent lanes, same z; unique IDs | §5.2 |
| Division rounding | `Math.floor(balance / divisor)` | §5.3 |
| Obstacle damage | 50 coins; floor at 0; one charge per obstacle | §7.3 |
| Enemy damage | 50 coins; floor at 0; one charge per encounter | §8.3 |
| Enemy defeat reward | 30 coins (basic), configurable by type; once | §8.5 |
| Power-up duration | 5 s each, game-time based | §9 |
| Same power-up pickup | Refresh timer | §9.6 |
| Different power-ups | Coexist if effects do not conflict | §9.6 |
| Level structure | 10 fixed-length levels across 7 zone themes | §11 |
| Run persistence | Not restored mid-run; progress/total balance persist | §12.3 |

---

## 7. System design

### 7.1 Movement and input

- Automatic forward movement along the track.
- Lane-based left/right steering with smooth interpolation and input buffering.
- Touch: horizontal swipe (lane-based) and/or horizontal drag; large Punch button.
- Desktop: arrow keys / A-D for steering; Space or F for Punch (test only).
- No up/down swipe handling, no jump/slide bindings, no related hints.
- Punch can trigger while running and steering; movement never stops.

### 7.2 Collision

- Player footprint: AABB/capsule narrower than a lane.
- Static obstacles/walls: AABBs; moving walls move their collider with the mesh.
- Coins/gates/power-ups: trigger-only volumes.
- Enemies: AABB plus per-encounter hit cooldown.
- Punch: forward AABB query limited to the player's lane and adjacent lane.
- Every damage source has an `id` and `lastHitAt`; one penalty per contact.
- Collision runs on the fixed-step update with no per-frame allocation.

### 7.3 Economy and transactions

```
Gameplay event → EconomyManager.apply({ type, amount, sourceId })
  → idempotency check (claimed source IDs)
  → integer math; clamp at 0 by default
  → append ledger entry
  → emit "balance:changed"
  → HUD updates; results aggregate from ledger
```

Transaction types: coin pickup, bonus coin, add gate, subtract gate, multiply
gate, divide gate, enemy damage, obstacle damage, enemy defeat, level completion,
power-up multiplier.

Rules: one claim per collectible, one activation per gate, one penalty per
collision, one reward per defeat; UI mirrors the authoritative balance.

### 7.4 Mathematical gates

- Four operations with colour + symbol + value (never colour-only).
- Two gates side by side; only the crossed gate (z-plane crossing) activates.
- Unique gate IDs; activation recorded once.
- Addition/subtraction use displayed integers; multiplication uses the factor;
  division floors and never divides by zero.
- Brief feedback such as `500 × 3 = 1500`, non-blocking.

### 7.5 Environment

- Chunked street segments with 7 themes: Residential, Market, Construction,
  Temple, Festival, Traffic Crossing, Town Outskirts.
- Road is the playable corridor; buildings/shops form the sides.
- Varied facades, compound walls, gates, balconies, water tanks, scooters,
  auto-rickshaws, carts, poles/wires, lamps, trees, bins, festival details.
- Daylight lighting, grounded shadows, no invisible colliders from decoration.
- Pooled props; despawn/disable behind the camera.

### 7.6 Generation and fairness

- Seeded RNG per run/level for reproducibility.
- Validate each chunk before activation: at least one safe lane for every
  obstacle pattern; gates/coins/power-ups on reachable lanes.
- Never spawn hazards inside the minimum reaction distance.
- Moving hazards telegraph their path.
- Cap active coins/obstacles/enemies per chunk.

### 7.7 Enemies and combat

- Types: basic, fast, guard, heavy, boss.
- Behaviours: approach, lane change, chase, guard formation, health pools.
- Punch: validate target in range/cone, apply damage, cooldown, feedback.
- Defeat reward once; heavy/boss require multiple hits; boss health bar.
- Shield may block one hit; Freeze pauses eligible enemies safely.
- Enemies are visually distinct from scenery pedestrians.

### 7.8 Power-ups

| Power-up | Duration | Behaviour |
|---|---|---|
| Magnet | 5 s | Attracts nearby active coins; one claim per coin |
| Shield | Until one hit | Blocks one qualifying enemy/obstacle damage event |
| Super Punch | 5 s | Stronger attack; breaks designated walls/hurts heavies |
| Double Coins | 5 s | Doubles coin pickups only; not gates/enemy rewards |
| Freeze Enemy | 5 s | Stops eligible nearby enemies; safe resume |

Timers use game time; refresh on same pickup; HUD shows countdown/state; spawns
are fair, reachable and not inside hazards.

### 7.9 HUD, screens and accessibility

- Top: level number + zone name, progress, balance, pause.
- Power-up strip: icon + countdown or ready/consumed.
- Bottom: steering affordance and large circular PUNCH button; no overlap with
  system gestures, notches or top HUD.
- Screens: Home, Pause, Results (ledger breakdown), all actions functional.
- Safe-area insets, high contrast, readable type, restrained motion.
- No jump/slide hint anywhere.

### 7.10 Persistence

- Key: `collectopia.save.v1`.
- Data: `schemaVersion`, `highestLevel`, `currentLevel`, `totalBalance`, `settings`.
- Migrations on load; corrupt data falls back to defaults.
- Active run state and power-up timers are intentionally not persisted.

### 7.11 Audio

- Web Audio cues: coin, bonus coin, gate add/subtract/multiply/divide, punch
  hit/miss, enemy hit, damage, power-up pickup, power-up expiry, UI, level
  complete.
- Unlock audio on first touch/click; mute toggle persisted.

---

## 8. Asset requirements

No assets exist. Phase 1 uses simple primitives/placeholders; Phase 2 introduces
the real kit.

| Category | Required content | Format |
|---|---|---|
| Player | Character model with Run, Idle, Punch, Hit animations | GLB |
| Coins | Gold coin model; optional larger bonus coin | GLB |
| Power-ups | Magnet, Shield, Super Punch, Double Coins, Freeze icons/models | GLB |
| Gates | Gate frame, symbol planes for + − × ÷ | GLB + textures |
| Road | Asphalt tiles, markings, sidewalks, drainage, patches | GLB/textures |
| Buildings | 8–12 varied Indian house/shop facades, compound walls, gates, balconies, water tanks | GLB |
| Street props | Scooters, motorcycles, auto-rickshaw, carts, crates, bins, cones/barriers, poles/wires, lamps, trees, potted plants | GLB |
| Zone dressing | Market stalls, tea stall, vegetable cart, temple/festival props | GLB |
| Enemies | 4 enemy models + 1 boss, distinct silhouettes | GLB |
| Walls | Concrete, brick, wooden barricade, low wall, moving wall, breakable wall | GLB |
| UI | Punch/fist icon, power-up icons, pause/play, coin icon | SVG/PNG |
| Audio | Short cues listed in §7.11 | OGG/MP3 or Web Audio synth |
| Fonts | One display + one readable UI font | WOFF2 (licensed) |

**Asset rules:** low-poly, texture-atlas friendly, shared materials, PBR only
where it matters, mobile-friendly texture sizes (≤1024² for most props), and a
recorded licence for every asset. Prefer CC0/owned assets.

---

## 9. Testing strategy

### 9.1 Automated

| Layer | Tool | Coverage |
|---|---|---|
| Unit | Vitest | Economy arithmetic, division rounding, floor-at-zero, idempotency, ledger totals, gate one-shot, power-up timers/stacking, fairness validator, save migrations |
| Integration | Vitest (headless) | Coin pickup once, gate crossing once, collision penalty once, enemy reward once, pause/resume timers, results == ledger |
| E2E (optional) | Playwright | Start run, steer, collect, pause/resume, reload persistence; desktop + mobile viewport |

**Planned commands (after approval only):**
`npm run dev`, `npm run build`, `npm run test`, `npm run test:e2e`.

### 9.2 Mobile testing

| Aspect | Method |
|---|---|
| Real devices | Android Chrome, iOS Safari; at least one mid-tier and one low-tier device |
| Browsers | Chrome (Android), Safari (iOS), Samsung Internet if available |
| Touch | Swipe/drag steering, Punch reachability, multi-touch safety, no page scroll/zoom |
| Layout | Portrait primary; safe-area notches; small (360×640) to large (430×932) screens |
| Performance | DevTools Performance panel, frame time, draw calls, memory; verify budgets |
| Lifecycle | Background/foreground pause, screen lock, rotation, reload persistence |
| Network | Cold load on throttled 3G/4G; asset lazy-loading |
| Install/PWA (optional) | Manifest, icons, standalone launch |

**Local mobile testing:** run `npm run dev -- --host` and open the LAN URL on the
device; use Chrome remote debugging for Android and Safari Web Inspector for iOS.

### 9.3 Desktop testing

- Chrome, Firefox, Edge, Safari (macOS if available).
- Keyboard steering + Punch.
- Resize from 360 px to 1920 px wide; HUD must remain usable.
- Mouse/trackpad must not trigger unintended steering.
- Performance profiling at 60 Hz and on an integrated GPU.

### 9.4 Regression and acceptance

- PRD §13 functional acceptance checklist at each phase gate.
- No jump/slide strings, bindings or UI anywhere (automated grep in CI/test).
- Every visible button works; results match the ledger; no duplicate rewards.
- No critical console errors; no unbounded memory growth across replays.

---

## 10. Implementation phases

| Phase | Scope | Exit gate |
|---|---|---|
| 0 | Audit + planning documents | **Complete** |
| 1 | Scaffold, loop, player, input, economy, coins, gates, tests | Phase 1 acceptance passes |
| 2 | Indian street environment, zones, lighting, chunking | Zone 1 playable within budget |
| 3 | Walls/street obstacles, collision, fairness validator | Fairness + collision tests pass |
| 4 | Enemies, Punch combat, damage/rewards, boss | Combat acceptance passes |
| 5 | Five power-ups, timers, stacking, pause behaviour | Power-up tests pass |
| 6 | HUD, 10 levels, results, persistence | Results == ledger; progress persists |
| 7 | Regression, mobile/desktop testing, optimisation, polish | PRD §13 complete |

Each phase ends with a report (files, implementation, tests, issues, tracker
update) and waits for explicit approval.

---

## 11. Phase 1 — detailed tasks and acceptance criteria

**Goal:** A playable core loop: automatic running, lane steering, gold coins,
four math gates and an authoritative economy. Punching, enemies, power-ups and
advanced obstacles are **not** part of Phase 1.

| # | Task | Deliverables | Acceptance criteria |
|---|---|---|---|
| 1.1 | Initialise project | `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore` | `npm run dev` serves the app; `npm run build` succeeds |
| 1.2 | Bootstrap renderer | `src/main.ts`, `src/game/Game.ts` | Canvas fills viewport; resize handled; no console errors |
| 1.3 | Loop + clock | `core/Loop.ts`, `core/Clock.ts` | Fixed-step update; pause freezes game time |
| 1.4 | Player + camera | `player/*`, `world/Environment.ts` (placeholder street) | Player runs forward automatically; smooth follow camera |
| 1.5 | Input | `input/InputController.ts` | Touch swipe/drag steers left/right; keyboard test binding; no jump/slide |
| 1.6 | Economy | `economy/EconomyManager.ts`, `economy/types.ts`, `config/balance.ts` | Single balance; ledger entries; no balance below 0 |
| 1.7 | Coins | `collectibles/CoinSystem.ts` | Gold coins; pickup once; balance updates immediately |
| 1.8 | Gates | `gates/MathGateSystem.ts` | Two gates per decision; only crossed gate applies; +,−,×,÷ correct; floor division; no ÷0 |
| 1.9 | Gate feedback | HUD text hook | Shows e.g. `500 × 3 = 1500` briefly |
| 1.10 | HUD core | `ui/Hud.ts`, `styles/main.css` | Title, balance, level, progress, pause and instructions readable; safe areas respected |
| 1.11 | Tests | `tests/economy.test.ts`, `tests/gates.test.ts` | All unit tests pass |
| 1.12 | Mobile/desktop smoke | Manual test pass | Steering usable on a mobile viewport and desktop keyboard |

### Phase 1 acceptance checklist

- [ ] Player runs forward automatically
- [ ] Left/right steering works on mobile touch and desktop keys
- [ ] No jump/slide controls, hints, animations or logic exist
- [ ] No enemies, punching, power-ups or advanced obstacles are present
- [ ] Coins update the balance and can be collected only once
- [ ] Addition gate adds the displayed amount
- [ ] Subtraction gate subtracts and floors at zero
- [ ] Multiplication gate multiplies by the displayed factor
- [ ] Division gate floors the result and never divides by zero
- [ ] Only the selected gate activates; no duplicate gate transactions
- [ ] HUD balance always matches `EconomyManager`
- [ ] Pause/resume does not corrupt state
- [ ] `npm run build` succeeds; unit tests pass
- [ ] No critical console errors

**Testing status:** Phase 1 verification complete — build, 14 unit tests,
headless mobile/desktop smoke and integration runs passed. See
`IMPLEMENTATION_TRACKER.md` for evidence; phase sign-off is pending.

---

## 12. Performance budgets

| Budget | Target |
|---|---|
| Draw calls | ≤ 120 typical, ≤ 200 peak |
| Visible triangles | ≤ 150k |
| Coins / obstacles / enemies | ≤ 80 / 40 / 24 active |
| Frame time | ≤ 16.6 ms on mid-tier mobile |
| JS + engine bundle | ≤ 1.5 MB gzip (assets lazy-loaded) |
| Memory | No per-frame allocations in update; dispose on level unload |

Techniques: instanced meshes, shared materials/atlases, pooled objects, one
directional light, limited shadow map, frustum culling, distance culling.

---

## 13. Risks and mitigations

| Risk | Mitigation |
|---|---|
| No art/audio assets | Placeholder Phase 1; asset kit + licences approved before Phase 2 |
| Mobile performance | Budgets, early device tests, pooling/instancing, quality toggles |
| Economy/gate correctness | Single transaction service; unit tests before UI integration |
| Duplicate rewards/penalties | Idempotency keys, hit locks, integration tests |
| Fairness of generated patterns | Validator + seeded RNG + automated checks |
| Scope creep | PRD non-goals; phase gates and approvals |
| Background/foreground bugs | Pause-aware clock; lifecycle tests |
| Large codebase drift | Cohesive modules, one owner per system |

---

## 14. PRD alignment and conflict resolutions

| PRD requirement | Plan response |
|---|---|
| Mobile-first 3D web game | Vite + TypeScript + Three.js; touch-first HUD |
| No jump/slide | Not built, not bound, not shown |
| One source of truth | `EconomyManager`, `Game`, system-owned entity sets |
| Four math operations | `MathGateSystem` with documented floor division |
| Fairness | `FairnessValidator` before chunk activation |
| Power-up timers | Pause-aware `Clock` + `PowerUpSystem` |
| Preserve existing architecture | Waived — no existing code; approved greenfield |
| Persistence | Versioned localStorage; progress only |
| No unnecessary dependencies | No physics/UI/state libraries |
| Document deviations | This plan and the audit |

---

## 15. Approval checklist

Before implementation starts, please confirm:

- [ ] Track B greenfield and the Vite + TypeScript + Three.js stack
- [ ] Folder structure in §3
- [ ] Dependency list in §2.1 (no physics/UI framework)
- [ ] Gameplay defaults in §6 (or provide replacements)
- [ ] Lane-based steering (3 lanes) vs continuous drag
- [ ] Level completion condition (fixed-length levels)
- [ ] Asset sourcing/licensing approach for §8
- [ ] Mobile/desktop test matrix in §9
- [ ] Phase 1 tasks and acceptance criteria in §11
- [ ] Permission to initialise the project and install dependencies

**Approval granted on 2026-11-13.** Phase 1 source, Vite project and
dependencies were created after approval; Phase 1 is now complete and awaiting
sign-off. Phase 2 depends on agreeing the asset kit and licences in §8.
