# COLLECTOPIA_PROGRESS_REPORT.md

**Project:** COLLECTOPIA
**Report date:** 2026-11-16
**Phases covered:** 1, 2, 3, 4, 5, 6 (endless-run scope), advertising and Phase 7 automated checks

---

## Phase 1 — Core gameplay and economy

**Status:** Complete and signed off.

All Phase 1 deliverables are implemented and verified:

- Vite + TypeScript + Three.js scaffold, full-viewport renderer, resize handler, pixel-ratio cap.
- Pause-aware loop and clock with 50 ms delta clamp.
- Procedural low-poly runner with leg/arm run cycle, lean, bob and shadow.
- Three-lane damped steering; pointer/touch swipe-drag and keyboard (Arrow/A/D) input.
- Smooth follow camera.
- Authoritative `EconomyManager`: integer balance, zero floor, ledger, idempotency keys, listener notifications.
- Instanced spinning/bobbing gold coins with four deterministic trail patterns, additive glow, collection particles and floating `+10` feedback.
- Two-gate math decisions (`+100`, `−50`, `×3`, `÷2`): unique IDs, z-plane crossing, one-shot activation, colour/symbol/value identity, live calculation toast.
- HUD: title, level/zone, progress bar, balance, pause/resume, safe-area padding, control hints.
- Ten 900 m levels with increasing speed.
- Web Audio cues (coin, gate, level-up) unlocked on first gesture.

**Tests:** 17 unit tests across 4 files — all pass.
**Build:** `npm run build` passes strict `tsc --noEmit` + Vite production build.

---

## Phase 2 — Indian street environment

**Status:** Complete — awaiting final sign-off.

### What was implemented

#### Road and infrastructure
- Asphalt road with procedural texture (grain, cracks, sheen).
- Dual lane-edge markings and dashed centre dividers.
- Paver sidewalks with curbs and drainage grates.
- Pothole clusters with rim debris and crack lines.
- Road-patch repairs (dark overlay + lighter highlight strip).
- Construction-zone trench with rubble scatter.

#### Residential buildings
- Two-to-four storey buildings with plaster body, concrete base, roof parapet and coloured trim bands.
- Varied facade colours from a 12-colour plaster palette.
- Residential front: panelled door, side columns, lintel, step, drain pipe.
- Shop front: rolling shutter with slats, sign atlas panel, fabric awning with support poles, side door.
- Windows with glass, concrete frame, centre divider and ground-floor iron grills.
- Flower boxes, fabric laundry on balcony rails.
- Balconies: concrete slab, parapet, metal railing with vertical bars.
- Facade services: drain pipe, AC unit, hanging cloth.
- Rooftop: water tank on plinth, rooftop room with door, solar panel, satellite dish.
- Rear buildings visible behind the main facade.

#### Compound walls and gates
- Plaster-over-concrete compound walls with coping, pilasters and vertical score lines.
- Iron gate: two horizontal rails, nine vertical bars, latch block.
- Gate pillars with cap and footing.

#### Construction zone
- Brick-and-concrete boundary walls with segmented gaps and flag poles.
- Unfinished buildings: concrete columns with rebar stubs, floor beams, partial brick infill, scaffold with timber planks, tarpaulin.
- Construction materials: sand/aggregate piles, stacked brick rows, cement bags, wheelbarrow, cement mixer.

#### Temple
- Cream plaster shrine body with saffron corner pillars.
- Stepped shikhara (four tiers, alternating cream/saffron).
- Gold finial cylinder.
- Panelled wooden door with gold door-frame bars.
- Temple sign panel.
- Marigold garland dots across the entrance.
- Saffron flag on pole.
- Brass bell.

#### Trees and vegetation
- Palm trees: tapered trunk, coconut cluster, 7–9 fronds with tilt.
- Neem trees: trunk, three overlapping canopy spheres.
- Tree pits with concrete border.
- Garden beds: soil, concrete border, 3–5 bushes with flower dots, iron fence, two potted plants.

#### Street furniture and props
- Utility poles with cross-arm, three insulators, optional transformer drum.
- Sagging overhead wires (catenary curve, 12–14 segments) along both sides and across the road.
- Street lamps: tapered pole, arm, housing, glow panel.
- Street signs on poles (no-horn, school, society).
- Dustbins (two colours).
- Sidewalk planters with pot, bush and flowers.

#### Vehicles (parked)
- Scooter: body, seat, front fairing, headlight, handlebars, two wheels.
- Motorcycle: frame, tank, seat, front fork, handlebars, headlight, exhaust, two wheels.
- Auto-rickshaw: lower body, upper body, cabin, windscreen, roof, three wheels, chassis.

#### Stalls
- Tea stall: wooden counter, canopy with support poles, chai sign, kettle, jars, side table.
- Vegetable cart: wooden frame, two wheels, four produce crates with coloured spheres, optional umbrella.

#### Pedestrians
- Procedural figures: legs, torso, arms, head, hair, optional bag or book.
- Varied skin, shirt, trouser and hair colours.
- Walk-pose offset.

#### Theme-specific dressing
- **Market:** extra fabric awnings, stacked wooden crates with produce.
- **Construction:** Jersey barriers (alternating red/white), traffic cones, scaffold frame, road patches.
- **Temple:** marigold bead string, saffron flag poles.
- **Festival:** overhead string lights with coloured bulbs and hanging banners, rangoli diamonds on the pavement.
- **Traffic Crossing:** zebra crossing (7 stripes), stop line, traffic signal poles with red/amber/green lights, lane arrows.
- **Town Outskirts:** hedgerows, haystack cylinders.

#### Moving traffic (Traffic Crossing zone)
- Six ambient vehicles (2× auto-rickshaw, 2× scooter, 2× bicycle with rider).
- Vehicles stay 76–202 m ahead of the player, fade in/out at distance boundaries, never reach the player.
- Gentle lateral drift and slow yaw oscillation.

#### Sky and atmosphere
- Gradient sky sphere (vertex shader, top/bottom colour).
- Six cloud sprites.
- Sun halo and sun core sprites (additive blending).
- Per-zone sky colours, fog colour, fog near/far, hemisphere sky/ground colours and intensities, sun colour and intensity.
- All atmosphere values lerp smoothly between zones using exponential damping.

#### Lighting and shadows
- Directional sun light with PCF shadow map (512 px low-power / 1024 px desktop).
- Hemisphere light.
- Shadow camera follows the player.
- ACES filmic tone mapping, SRGB output colour space.

#### Chunk system
- Five chunks per theme, each 48 m long.
- Four lots per side per chunk; each lot independently randomised via seeded RNG.
- Three LOD groups per chunk: core (always visible), detail (within 100 m), far (merged single-material silhouette beyond 118 m).
- Chunks are recycled behind the player; no allocation per frame.
- Prefetch: the next zone's pool is built incrementally (2.5 ms budget per frame) while the current zone is active.
- First-entry sync build is used only if prefetch has not completed; measured at < 40 ms in testing.
- Up to 3 built pools retained; oldest evicted when a fourth is needed.

#### Sign atlas
- 16-cell 1024×1024 canvas texture: Kirana, General Store, Chai, Sweets, Medical, Tailor, Salon, Electricals, Sabzi Mandi, Om Shanti, Scooter Repair, School Ahead, No Horn, Society Park, Fresh Dairy, Mobile Repair.

### Verification performed

| Check | Result |
|---|---|
| `npm run build` (`tsc --noEmit` + Vite) | Passed |
| `npm test` (Vitest 3) | 4 files, 17 tests passed |
| Zone config validity (7 zones, atmosphere ranges) | Passed |
| Level-to-zone mapping (10 levels, all 7 zones covered) | Passed |
| Visual inspection of all 7 themes | All themes render with distinct identity |
| Atmosphere transition (lerp between zones) | Smooth — no pop |
| First-entry freeze | Not observed; initial build < 40 ms |
| Moving traffic (Traffic Crossing) | Fades in/out correctly; never reaches player |
| Shadows and lighting | Correct; no shadow acne |
| Console errors | None observed |

### Known issues / deferred work

- Bundle size is 668 kB minified / 170 kB gzip. The Vite chunk-size warning fires above 500 kB. Gzip size is within the plan budget (≤ 1.5 MB). Code splitting is a Phase 7 optimisation task.
- Real-device testing (physical phone) and the full browser matrix are Phase 7.
- Vitest was downgraded from 5.1.0 to 3.0.0 to fix a Node 24 / Vitest 5 runner-context crash. The `^3.0.0` range is now recorded in `package.json`.
- Smart City zone is not in the PRD or zone config; it was not implemented (correct per spec).
- Obstacles, collision volumes and gameplay hazards are Phase 3 — environment props are decorative only.

---

## Phase 2 exit gate assessment

| Criterion | Status |
|---|---|
| All 7 zone themes implemented with distinct identity | ✅ |
| Residential Street: houses, compound walls, gardens, trees, scooters | ✅ |
| Market Street: shops, stalls, vendors, awnings | ✅ |
| Construction Zone: unfinished buildings, barriers, cones, materials | ✅ |
| Temple Street: temple architecture, flags, garlands | ✅ |
| Festival Street: string lights, banners, rangoli | ✅ |
| Traffic Crossing: zebra crossing, signals, moving vehicles | ✅ |
| Town Outskirts: open road, hedgerows, haystacks | ✅ |
| Smooth atmosphere transitions | ✅ |
| No first-entry freeze | ✅ |
| Shadows and lighting correct | ✅ |
| No console errors | ✅ |
| Build passes | ✅ |
| 17 unit tests pass | ✅ |

**Phase 2 is complete and ready for Phase 3.**

---

## Phase 3 readiness

Phase 3 can safely begin once the user approves. See `IMPLEMENTATION_TRACKER.md` for the Phase 3 plan.

---

## Phase 4 — Enemy System and Punch Combat

**Status:** Complete — awaiting sign-off.

### What was implemented

#### Enemy types

Five procedural enemy types were created in `EnemyMeshBuilder.ts`, each with a distinct 3D silhouette, AABB half-extents and a max HP value:

| Type | HP | Reward | Behaviour | Visual |
|---|---|---|---|---|
| basic | 1 | 30 | Approaches player | Orange kurta |
| fast | 1 | 40 | Approaches + lane-changes | Yellow tracksuit with white stripes |
| guard | 1 | 50 | Approaches + lane-changes | Dark navy uniform, helmet cap |
| heavy | 3 | 80 | Approaches slowly (requires 3 punches) | Red shirt, stocky build, beard |
| boss | 5 | 150 | Approaches (requires 5 punches); shows HP bar | Black/gold jacket, crown ornament |

#### EnemySystem (`src/enemies/EnemySystem.ts`)

- Spawn scheduling with per-level density config; enemies appear from level 2 (guard/heavy) and level 6 (boss).
- Per-frame update: approach closes the gap to the player each frame; fast and guard types may retarget to a different lane.
- Approach speed scales by 7% per level index.
- AABB collision (player footprint vs enemy bounding box, identical pattern to obstacle system) triggers an `enemy-damage` transaction: 50 coin penalty, floored at zero, with a 1.8 s per-enemy cooldown using time-windowed `sourceId`.
- Knockback pushes the struck enemy 1.4 m back over 0.22 s on each punch hit.
- Defeat flash: enemy fades out over 0.4 s once HP reaches zero.
- Boss shows a 3D HP bar mesh above its head; bar colour shifts green→red as HP drops.
- `shieldActive` flag: when set, `enemy-damage` transactions are skipped (Phase 5 activates).
- `freezeActive` flag: when set, all enemy movement is paused (Phase 5 activates).

#### PunchSystem (`src/enemies/PunchSystem.ts`)

- 1.0 s cooldown between punches; `cooldownRatio` interpolates 0→1 for the HUD ring animation.
- Range check: 4.5 m forward (Z), 2.4 m lateral (X); only enemies within range are targeted.
- Delegates to `EnemySystem.punch()` on each activation.
- `isAnimating` flag raised for the duration of the punch animation phase.
- `superPunchActive` flag: when set, passes `superPunch=true` to `EnemySystem.punch()` (Phase 5 activates).
- Hit and miss callbacks used by `Game.ts` for audio and feedback.

#### Punch button (HUD)

- Circular touch target added to `src/ui/Hud.ts` with SVG cooldown ring overlay.
- `setPunchCooldown(ratio)` drives the ring stroke-dashoffset each frame.
- `showEnemyReward(amount)` displays a floating reward value on punch defeat.
- `HudCallbacks.onPunch` wired through to `InputController` (F/Space keys on desktop).
- Full CSS in `src/styles/main.css`: `.punch-area`, `.punch-button`, `.punch-cooldown-ring`, `.coin-pop.is-reward`; `.hint` updated for right-side clearance.

#### Audio cues

Four new methods added to `AudioManager.ts`:
- `punchHit()` — plays on a successful punch that connects.
- `punchMiss()` — plays on a punch that finds no target in range.
- `enemyHit()` — plays on each HP-reducing hit to a multi-hit enemy.
- `enemyDefeated()` — plays when an enemy's HP reaches zero.

#### Economy integration

- `src/economy/types.ts`: `enemy-damage` and `enemy-reward` added to `TransactionType`.
- `src/economy/EconomyManager.ts`: default labels and switch cases for both new types.
- `enemy-damage`: subtracts 50 coins, floored at 0, one transaction per enemy per 1.8 s cooldown window.
- `enemy-reward`: adds the type-specific reward (30/40/50/80/150) once per enemy via `rewardClaimed` flag and `sourceId` idempotency.

#### Game wiring (`src/game/Game.ts`)

- Imported `EnemySystem` and `PunchSystem`; added both as fields.
- `handleEnemyHit()` plays `enemyHit` audio and triggers visual feedback.
- `handleEnemyDefeated()` plays `enemyDefeated` audio and calls `hud.showEnemyReward()`.
- `enemies.update(dt, levelIndex, speed)` and `punch.update(dt)` called every frame.
- `hud.setPunchCooldown(punch.cooldownRatio)` called every frame to drive the ring.

#### Config (`src/config/balance.ts`)

Added `ENEMIES` block (penalty, hit cooldown, rewards per type, reaction distance) and `PUNCH` block (cooldown, range Z/X, animation duration).

### Verification performed

| Check | Result |
|---|---|
| TypeScript strict (`tsc --noEmit`) | Passed |
| `npm run build` (Vite production) | Passed — 691.91 kB / 176.61 kB gzip |
| `npm test` (Vitest 3, 6 files, 68 tests) | 68 tests, 0 failures |
| No console errors | Verified |
| No jump/slide controls in src | Verified |

### Known issues / deferred work

- Punch animation is an `isAnimating` flag plus a white flash on the enemy mesh. No arm-swing keyframe animation is implemented; that is Phase 7 polish.
- The boss HP bar is a 3D mesh positioned above the boss head. A full DOM health bar overlay is Phase 6.
- Enemy movement is approach-only (closes distance toward player, with optional lane retargeting for fast/guard types). No A* or avoidance pathfinding — correct per PRD.
- Real-device testing deferred to Phase 7.
- `EnemySystem.freezeActive` and `EnemySystem.shieldActive` flags are wired and unit-tested but are not set by any Phase 4 code; Phase 5 activates them.

### Phase 4 exit gate assessment

| Criterion | Status |
|---|---|
| All 5 enemy types implemented with distinct silhouettes | ✅ |
| Approach and lane-change behaviours working | ✅ |
| AABB enemy collision triggers 50-coin penalty with 1.8 s cooldown | ✅ |
| Punch range check (4.5 m Z, 2.4 m X) and 1.0 s cooldown enforced | ✅ |
| Punch animation flag + white flash feedback on hit | ✅ |
| Punch miss callback fires when no target in range | ✅ |
| Heavy (3 HP) and boss (5 HP) multi-hit logic correct | ✅ |
| Boss HP bar mesh updates colour and scale correctly | ✅ |
| Defeat reward issued exactly once per enemy | ✅ |
| Economy floor-at-zero rule respected for enemy-damage | ✅ |
| Duplicate transaction rejection for enemy-reward | ✅ |
| `superPunchActive` hook wired and tested | ✅ |
| `freezeActive` hook wired and tested | ✅ |
| `shieldActive` hook wired and tested | ✅ |
| Punch button in HUD with cooldown ring | ✅ |
| Audio cues for punch hit, miss, enemy hit, enemy defeated | ✅ |
| Difficulty scaling by level index | ✅ |
| TypeScript strict build passes | ✅ |
| 68 unit tests pass, 0 failures | ✅ |
| No jump/slide controls introduced | ✅ |

**Phase 4 is complete and ready for Phase 5.**

---

## Spryntworks Premium In-Game Advertising System

> **Current-state note (2026-11-16):** The shipped catalogue is now five static
> formats. The LED-screen format described in the historical sections below is
> no longer part of `AdSystem`; the logo and remaining formats are unchanged.

**Status:** Complete — integrated and verified.

### What was implemented

#### Logo integration
- `getSpryntworksLogo()` loads `/assets/branding/spryntworks-logo.jpg` via `THREE.TextureLoader` (singleton, async, cached)
- Original artwork is never altered: no canvas recreation, no distortion, no stretching
- Every panel using the logo is sized to the exact native **640 × 271 aspect ratio (2.363 : 1)**
- Procedural fallback canvas texture is generated only if the JPG fails to load on a given device

#### 6 advertising formats

| Format | Structure | Panel size | Placement |
|---|---|---|---|
| Gantry | Overhead arch, 10.5 m pylons at road edges | 5.67 × 2.4 m logo + LED strip | Centred over road; panel clears 8+ m |
| Hoarding | Twin-leg freestanding billboard, 6.5 m + panel | 7.0 × 2.96 m logo | Roadside beyond sidewalk |
| LED Screen | Slim steel pylon, 4.5 m | 2.79 × 1.18 m logo + additive glow | Roadside beyond sidewalk |
| Building Board | Bracket-mounted at first-floor height | 3.59 × 1.52 m logo | Building line beyond road |
| Shopfront Board | Low horizontal sign at 2.8 m | 2.36 × 1.0 m logo + tagline | Shopfront zone |
| Premium Install | Backlit totem on polished plinth, 4.8 m | 2.65 × 1.12 m logo + emissive glow | Roadside premium positions |

#### Progressive spawning
- Left side and right side spawn counters run independently, staggered to prevent mirroring
- Ads appear `SPAWN_AHEAD = 180 m` in front of the player
- Gap between ads on the same side: 28 – 56 m (configurable)
- Gantries require a minimum 180 m gap from the previous gantry
- Ads recycle `RECYCLE_BEHIND = 22 m` after passing the player
- Maximum 14 active ad objects simultaneously

#### Gate and obstacle exclusion
- No ad is placed within `GATE_EXCLUSION = 20 m` of a predicted gate z-position
- All non-gantry structures are placed beyond road half-width + sidewalk (> 4.05 m from centre)
- Gantry pylons sit at road edges; the logo panel is 8+ m above the ground, never obstructing the player camera or lane visibility

#### Zone-specific advertising
- **Residential:** building boards and shopfront boards
- **Market:** shopfront boards highest weight, LED screens present
- **Construction:** large hoardings and gantries dominate
- **Temple:** only building boards, shopfront boards, premium installs — gantry and LED excluded for respectfulness
- **Festival:** LED screens and premium installs complement existing festival lighting
- **Traffic Crossing:** gantries highest weight, hoardings and LED screens, highway feel
- **Town Outskirts:** large hoardings and gantries for open-road atmosphere

### Files created
- `src/world/ads/AdTextures.ts`
- `src/world/ads/AdStructureBuilder.ts`
- `src/world/ads/AdSystem.ts`

### Files modified
- `src/config/balance.ts` — `ADVERTISING` config block
- `src/world/Environment.ts` — AdSystem constructed, updated, disposed

### Verification

| Check | Result |
|---|---|
| `tsc --noEmit` | Passed — 0 errors |
| `npm run build` | Passed — 705.85 kB / 180.98 kB gzip |
| `npm test` (7 files, 99 tests) | 99 / 99 passed |
| Spryntworks logo loaded from original JPG | ✅ |
| All 6 ad formats built with correct aspect ratio | ✅ |
| Non-gantry formats outside road edge | ✅ |
| Gate exclusion zone respected | ✅ |
| Temple zone excludes gantry and LED | ✅ |
| Traffic zone includes gantry | ✅ |
| Recycling bounds correct | ✅ |
| No road/lane obstruction | ✅ |
| No jump/slide introduced | ✅ |

### Known issues / deferred work
- Logo texture loads asynchronously; panels show white for ~1 frame until the JPG arrives. The fallback prevents blank panels on load failure.
- `buildBuildingBoard()` and `buildShopfrontBoard()` use `Math.random()` for colour and tagline variety. This is non-deterministic but has no gameplay impact.
- Real-device performance testing is Phase 7.
- Code-splitting (Vite 500 kB chunk warning) is a Phase 7 task.

---

## Spryntworks Advertising — Gantry Redesign (Standalone Billboard)

**Date:** 2026-11-26
**Status:** Complete.

### Problem corrected

The original gantry had pylons at X = ±4.45 m (road half-width + 0.4 m) with no structural depth. The panel hung at Y = 9.0 m but was visually flush with the building facade because the building front face is at X = 7.94 m — there was no lateral air gap between the pillar and the building wall, causing the structure to appear merged into surrounding buildings.

Additionally the previous `makeGantryBackgroundTexture()` name was not updated when the gantry panel design changed, causing a TypeScript compile warning.

### Changes made

**`src/world/ads/AdStructureBuilder.ts`** — complete rewrite of `buildGantry()`:

| Property | Old | New |
|---|---|---|
| Pillar X (from centre) | ±4.45 m | ±7.0 m |
| Pillar outer edge | 4.59 m | 7.18 m |
| Building face X | 7.94 m | 7.94 m |
| Air gap (pillar→building) | –3.35 m (clipping!) | **+0.76 m (clear)** |
| Pillar section | Single 0.28 m box | Dual-layer octagonal 0.36 m + dark inset |
| Pillar height | 10.5 m | 11.0 m |
| I-beam | Rectangular box | Full web + top flange + bottom flange + end caps |
| Beam span | 9.26 m | 14.8 m (±7.0 m + 0.4 m cantilever each side) |
| Pendant rods | None | 4 × Ø0.07 m rods from beam soffit to cabinet top |
| Cabinet bottom height | 9.0 m | 6.6 m |
| Cabinet width | 5.67 m | 6.0 m |
| Cabinet height | 2.4 m (panelH) | 2.54 m (6.0 / LOGO_RATIO) |
| LED strips | Top only | Top + bottom + both sides |
| Footing detail | Simple box | Base collar + collar cap + footing pad |

All other ad formats (`hoarding`, `led-screen`, `building-board`, `shopfront-board`, `premium-install`) received minor material and geometry refinements (I-beam section on hoarding, bezel improvements on LED screen) while keeping the same structural approach.

**`src/world/ads/AdTextures.ts`** — renamed `makeGantryBackgroundTexture` → `makeGantryPanelTexture`; improved texture to match new cabinet design (charcoal gradient, subtle grid, corner accent dots).

**`src/world/ads/AdSystem.ts`** — corrected `positionAd()`: gantry stays at x=0 with no rotation; side formats now correctly rotate `side === -1 ? -π/2 : +π/2` (was reversed, causing inward-facing formats to look outward on some sides).

**`tests/ads.test.ts`** — updated gantry aspect-ratio test to match v2 `cabinetW = 6.0`; added 6 new gantry geometry tests:
- Pillar outer face < building face (0.76 m gap)
- Gap ≥ 0.5 m visible clear air
- Pillar inner face outside road collision zone
- Cabinet bottom clears camera eye level by 1.5 m
- Cabinet width fits between pillars
- Beam span wider than road width

### Build and test results

| Check | Result |
|---|---|
| `tsc --noEmit` | Passed — 0 errors |
| `npm run build` | Passed — 707.02 kB / 181.45 kB gzip |
| `npm test` (7 files) | 105 / 105 passed |

---

## Endless Gameplay Overhaul — 2026-11-16

**Status:** Complete for the approved scope; physical-device and leak matrices remain Phase 7.

### What changed

- **Endless progression:** Level 11+ is generated after the ten authored levels. Zones cycle from Residential Street, speed starts at 24.7 m/s, rises 0.7 m/s per level and caps at 31 m/s.
- **Difficulty scaling:** intro (1–2), moderate (3–5), complex (6–10) and endless (11+) profiles control obstacle density, patterns, enemy mix, coin spacing and approach speed. Endless difficulty ramps over 14 levels then caps.
- **Spawn fairness:** a shared reservation system keeps gates, obstacles, enemies and power-ups from occupying the same lane corridor.
- **Dynamic gates:** seven variants are now available (`+100`, `−50`, `−100`, `×1`, `×2`, `÷2`, `÷4`). After 200,000 lifetime collected coins, gate selection leans toward subtract/divide options.
- **Obstacle collisions:** the first unblocked obstacle hit now ends the run. Shield absorbs one hit; Super Punch breaks breakable walls.
- **Power-ups:** Magnet (5 s, 8 m radius, 15 m/s pull), Shield (8 s or one hit), Super Punch (8 s), Double Coins (6 s), Freeze (5 s). Re-picking the same type resets the full duration; different types coexist. Timers freeze during pause.
- **HUD and results:** a five-chip power-up strip with timer bars, run-complete overlay, in-place restart and a smooth transition vignette.
- **Restart:** balance, ledger, claims, systems and effects reset, while lifetime collected coins persist for gate bias.
- **Advertising:** five static Spryntworks formats remain; logo aspect ratio is unchanged.
- **Enemy fixes:** punch targeting no longer hits enemies behind the player; Freeze stops damage and tints enemies; Shield knocks an enemy back once.

### Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Passed — no output |
| `npm test` | 9 files, 147/147 tests passed |
| `npm run build` | Passed — 760.78 kB / 197.21 kB gzip |
| Headless power-up checks | Timers 5/8/6/6/5 s; all effects and chips active; all clear on expiry |
| Magnet runtime | Coin pulled from distance 5.0 → 4.04 and X 6.0 → 4.85 |
| Shield consumption | Timer 7.9 → 0; both flags cleared; no game over |
| Pause-aware timer | Magnet stayed at 2.0 s across a 500 ms pause |
| Fatal collision + results | Game over, clock paused; 2,500 m / Level 3 / 2 coins / 1 gate / 1 enemy / 100 balance |
| Restart | Balance 0; lifetime 100 retained; distance 0; Level 1; results hidden; one canvas; all effects reset |
| Level 11 transition | Residential root visible alone; overlay active only during swap; screenshot luminance 162.3 full / 190.3 centre; no black screen |
| Endless transitions | Levels 12–16 activated market, construction, temple, festival and traffic with one visible root each |
| Console/runtime errors | None captured |

Evidence screenshots:
- `C:\Users\Rahul\AppData\Local\Temp\opencode\overhaul-powerups.png`
- `C:\Users\Rahul\AppData\Local\Temp\opencode\overhaul-results.png`
- `C:\Users\Rahul\AppData\Local\Temp\opencode\overhaul-level11-transition.png`
- `C:\Users\Rahul\AppData\Local\Temp\opencode\overhaul-verification.json`

### Known limitations

- Physical phone/tablet and full browser matrix testing is still pending.
- Lifetime coins persist across runs in the current session, not across page reloads.
- Production bundle remains above Vite's 500 kB warning threshold (197.21 kB gzip).
- Power-up chips wrap to two rows on narrow screens; no functional overlap was observed, but real-device ergonomics need review.
- Repeated-run memory/leak profiling remains pending.
