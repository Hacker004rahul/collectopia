# COLLECTOPIA

## Product Requirements Document (PRD) v1.0

**Document status:** Draft for implementation planning\
**Product name:** COLLECTOPIA\
**Product type:** Mobile-first 3D runner / arcade game\
**Target platform:** Web application, optimized for mobile browsers\
**Development approach:** Upgrade the existing game codebase; do not
rebuild from scratch.

------------------------------------------------------------------------

## 1. Product overview

### 1.1 Product vision

COLLECTOPIA is a fast-paced 3D runner game set in a visually rich Indian
residential neighbourhood. The player runs automatically along a street,
steers left and right, collects gold coins, chooses mathematical gates,
avoids physical obstacles, fights approaching enemies using a punch
action, and collects temporary power-ups.

The game combines simple arcade controls with quick mathematical
decisions and risk/reward gameplay.

### 1.2 Product goals

-   Deliver an immediately understandable, satisfying runner experience.
-   Make the Indian street setting visually distinctive and believable.
-   Make all four mathematical operations affect the live coin balance
    correctly.
-   Give players meaningful ways to avoid or fight enemies.
-   Make power-ups easy to recognize and understand.
-   Maintain responsive, reliable gameplay on mobile web browsers.
-   Preserve existing working features and project architecture wherever
    practical.

### 1.3 Non-goals

The following are outside the current scope unless separately approved:

-   Jumping or sliding mechanics and controls.
-   Multiplayer or online leaderboards.
-   Real-money purchases, cash rewards or cryptocurrency.
-   A fully open-world environment.
-   Replacing the current game engine or framework without a documented
    technical reason.

------------------------------------------------------------------------

## 2. Product principles and implementation constraints

1.  **Inspect before editing.** Audit the existing repository, engine,
    architecture, assets and working systems before implementation.
2.  **Extend, do not casually replace.** Reuse existing player, camera,
    rendering, input, economy, level and UI systems where suitable.
3.  **One source of truth.** Coin balance, active effects, collision
    state and level state must each have an authoritative owner.
4.  **Gameplay before decoration.** Interactive objects must have
    working collision and gameplay behaviour.
5.  **Fairness.** Generated obstacles and gates must leave a reachable,
    valid route.
6.  **Mobile first.** Touch controls, safe areas, readable HUD and
    performance are core requirements.
7.  **Incremental delivery.** Implement and test in phases.
8.  **Document deviations.** Explain technical conflicts and propose
    alternatives before changing scope.

------------------------------------------------------------------------

## 3. Core gameplay loop

1.  The player starts a run with a starting coin balance.
2.  The character automatically runs forward.
3.  The player steers left or right to collect coins and avoid hazards.
4.  The player chooses between mathematical gates.
5.  Enemies and physical obstacles appear along the route.
6.  The player avoids enemies or attacks them with Punch.
7.  The player collects temporary power-ups.
8.  Collisions, gate choices, pickups and combat rewards update the run
    balance.
9.  The player reaches the run/level completion condition.
10. A results screen reports the balance and transaction breakdown.
11. The player can replay, return home or proceed to the next level,
    according to the existing progression design.

### 3.1 Player movement

-   Forward movement is automatic during active gameplay.
-   The player can steer left and right.
-   Steering must be smooth, responsive and predictable.
-   The character continues running while steering, punching or using a
    power-up.
-   The game must not include jump or slide buttons, animations, input
    bindings or gameplay logic.
-   If the existing game contains jump/slide functionality, remove or
    disable it carefully without breaking unrelated controls.

### 3.2 Control support

**Mobile:** Touch/drag steering or the existing lane-based touch
controls, plus a dedicated Punch button. Prefer the existing input model
unless the audit identifies a clear usability issue.

**Desktop testing:** Keyboard steering and a keyboard binding for Punch
may be provided for testing. Mobile remains the primary target.

------------------------------------------------------------------------

## 4. Coin collection and economy

### 4.1 Coin collectible

Replace the previous dumbbell collectible with a 3D gold coin.

Visual requirements: - Metallic gold material and readable coin
silhouette. - Rotating or gently animated presentation. - Subtle glow or
sparkle. - Clear pickup feedback, sound and floating reward text. -
Consistent scale and lighting.

### 4.2 Coin placement

Coins may appear as: - Straight trails. - Curved trails. - Lane-specific
formations. - Groups near gates. - Risk/reward formations around
obstacles. - Rare larger bonus coins, if supported by balancing.

Coin placement must not require an impossible manoeuvre.

### 4.3 Balance model

Maintain: - **Run balance:** authoritative balance for the current
run. - **Persistent balance:** saved player balance, if the existing
game has a persistent wallet. - **Run transaction ledger:** record of
all balance changes in the current run.

Preserve the existing economy design if already implemented. Document
how a new run's starting balance is determined.

### 4.4 Transaction rules

Every balance change must go through one central economy/transaction
service.

Supported transaction types: - Coin pickup. - Bonus coin pickup. -
Addition gate. - Subtraction gate. - Multiplication gate. - Division
gate. - Enemy damage penalty. - Wall/obstacle damage penalty. - Enemy
defeat reward. - Level completion reward. - Power-up coin multiplier
effect.

Rules: - A collectible can be claimed only once. - A gate can be applied
only once per crossing. - One collision event must not repeatedly charge
the player. - One enemy defeat must not award duplicate rewards. -
Balance must never fall below zero by default. - UI balance must match
the authoritative economy state.

------------------------------------------------------------------------

## 5. Mathematical gate system

### 5.1 Supported operations

  ------------------------------------------------------------------------
  Operation        Visual identity                Example Behaviour
  ---------------- ---------------- --------------------- ----------------
  Addition (+)     Green                             +100 Add 100 coins

  Subtraction (-)  Red                                -50 Subtract 50
                                                          coins, floor at
                                                          zero

  Multiplication   Blue/purple                         ×3 Multiply current
  (×)                                                     balance by 3

  Division (÷)     Orange                              ÷2 Divide current
                                                          balance by 2
  ------------------------------------------------------------------------

Operation symbols and values must remain readable without relying on
colour alone.

### 5.2 Gate layout and selection

-   Present two alternatives side by side at decision points.
-   Align each gate with a traversable route/lane.
-   Player steering determines which gate is crossed.
-   Only the gate actually crossed may activate.
-   Gates must have unique IDs and one-time activation protection.
-   The player must not accidentally activate both adjacent gates.
-   Values should be configurable by level/difficulty.

Example choices: - +100 versus -50 - ×3 versus ÷2 - +200 versus ×2 -
-100 versus +150 - ×5 versus -200 - ÷2 versus +300

### 5.3 Calculation rules

-   Addition and subtraction use the displayed integer amount.
-   Multiplication uses the displayed factor.
-   Division uses a documented deterministic integer rounding rule.
    Recommended default: floor to the nearest lower whole coin.
-   Division by zero is invalid and must never be generated.
-   Apply each operation to the authoritative balance at the moment the
    gate is crossed.
-   Record the transaction and update the HUD immediately.

### 5.4 Feedback

Show a brief readable calculation after activation, for example:

`500 × 3 = 1500`

Include suitable sound/visual feedback without obscuring upcoming
hazards for too long.

------------------------------------------------------------------------

## 6. Indian residential street environment

### 6.1 Environment vision

Replace the beach setting with a detailed Indian residential
neighbourhood. The street should feel locally recognizable rather than
like a generic Western city or fantasy track.

The road is the playable space. Houses, shops and street details
primarily form the environment along both sides. Objects enter the road
as hazards only when intentionally designed as gameplay obstacles.

### 6.2 Road

-   Realistic asphalt surface.
-   Natural road markings where appropriate.
-   Slightly varied surface detail, patches and repaired sections.
-   Controlled pothole/repair details.
-   Roadside sidewalks and drainage.
-   Consistent road width, perspective and collision boundaries.
-   Natural daylight and grounded shadows.

Decorative road textures must not cause invisible collisions.

### 6.3 Residential buildings and street dressing

Use varied, correctly scaled Indian houses and buildings: - Small
colourful residential houses. - Traditional entrances and compound
walls. - Iron gates. - Balconies, windows and grills. - Rooftop water
tanks. - Potted plants and small gardens. - Coconut/palm and other
locally appropriate trees. - Electric poles and overhead wires. - Street
lamps and signboards.

Additional street dressing: - Parked scooters and motorcycles. -
Auto-rickshaws. - Small shops and tea stalls. - Vegetable vendors. -
Dustbins. - Sidewalk pedestrians. - Selected small temple/festival
details.

Use varied building facades, props, materials and placement. Avoid
repeated clones, floating objects, oversized props, empty streets and
flat-looking buildings.

### 6.4 Environment zones

1.  Residential Street -- houses, compound walls, scooters and plants.
2.  Market Street -- small shops, tea stalls, vegetable carts and
    crates.
3.  Construction Zone -- concrete barriers, brick walls and roadworks.
4.  Temple Street -- temple surroundings and tasteful decorations.
5.  Festival Street -- lights, banners and festive decoration.
6.  Traffic Crossing -- moving auto-rickshaws, scooters and bicycles.
7.  Town Outskirts -- wider streets and residential edges.

These are environment themes, not separate game modes.

------------------------------------------------------------------------

## 7. Physical wall and street obstacle system

### 7.1 Wall obstacle types

  Type                    Expected player response
  ----------------------- -------------------------------------------
  Concrete wall           Steer around it
  Brick wall              Steer around it
  Wooden road barricade   Steer around it
  Low wall                Steer around it; no jumping
  Moving wall             Time steering to pass
  Breakable wall          Break with active Super Punch
  Coin-trap wall          Use alternate route or break if permitted
  Narrow wall passage     Steer accurately through the gap

Walls must be actual 3D obstacles with accurate collision volumes, not
decorative meshes.

### 7.2 Other street obstacles

Possible obstacles include parked scooters, moving bicycles, crossing
auto-rickshaws, vegetable carts, wooden crates, construction barricades,
water containers, street dogs, delivery motorcycles and temporary
roadblocks.

Distinguish gameplay obstacles visually from harmless background props.

### 7.3 Collision response

On a damaging wall or obstacle collision: - Apply one configured coin
penalty. - Show floating negative feedback such as `-50`. - Trigger
suitable hit feedback and sound. - Briefly slow the player if
appropriate. - Apply a collision cooldown or per-obstacle hit lock. -
Allow an active Shield to block damage according to shield rules.

Do not repeatedly penalize the player while they remain in contact with
one obstacle.

### 7.4 Fairness and generation

-   Every obstacle pattern must have at least one reachable safe route.
-   Moving obstacles must have readable timing and sufficient reaction
    distance.
-   Narrow passages must have reasonable clearance around the player's
    collision width.
-   Do not spawn hazards so that gates, coins or power-ups become
    impossible to reach.
-   Validate procedural patterns before they enter the playable area.

------------------------------------------------------------------------

## 8. Enemy system and combat

### 8.1 Enemy types

1.  **Basic enemy:** Approaches the player.
2.  **Fast enemy:** Moves quickly or changes lanes.
3.  **Guard enemy:** Protects a coin formation.
4.  **Heavy enemy:** Requires multiple successful punches.
5.  **Boss enemy:** Appears in selected encounters and has a health bar.

Enemies must be visually distinct from background pedestrians and props.

### 8.2 Enemy behaviour

Enemies may approach from ahead, move between lanes or chase the player,
according to their type. Movement must be readable and fair. Enemies
must not spawn so close that damage is unavoidable.

### 8.3 Enemy collision

When an enemy successfully hits the player: - Deduct a configured amount
from the run balance. - Show a floating penalty such as `-50`. - Play
appropriate hit feedback and sound. - Trigger a brief player damage
response. - Apply a cooldown to prevent repeated penalties from one
encounter.

A Shield may block the hit according to Section 9.

### 8.4 Punch action

Provide a persistent, clearly visible Punch button in the mobile HUD.

Button design: - Circular, high-contrast control. - Fist icon and
readable PUNCH label. - Press animation and cooldown feedback. -
Positioned so it does not overlap steering controls or important HUD
information.

Punch behaviour: 1. On press, trigger the punch animation. 2. Check for
a valid enemy within configured range and attack direction. 3. Apply
damage only to a valid target. 4. Play impact feedback when a hit lands.
5. Knock back or defeat the enemy as appropriate. 6. Award the
configured reward exactly once when the enemy is defeated. 7. If no
enemy is in range, play the animation but award no coins.

Starting design target: approximately 0.8--1.2 seconds between attacks,
configurable after playtesting.

The player keeps running while punching. Heavy enemies require multiple
hits. Boss enemies display health and require multiple successful
attacks.

### 8.5 Enemy rewards

Example starting reward: `+30` coins for defeating a basic enemy.
Rewards must be configurable by enemy type and balanced through
playtesting.

------------------------------------------------------------------------

## 9. Power-up system

Power-ups are collectible items that appear at random but fair
locations. Each has a distinct model, colour, icon, pickup effect and
HUD status.

### 9.1 Magnet

-   Collectible 3D magnet with a clear silhouette and visual effect.
-   Activates for exactly five seconds.
-   Attracts nearby eligible coins towards the player along smooth
    trajectories.
-   Updates the economy once per attracted coin.
-   Shows an active magnet icon and countdown.
-   Stops attraction automatically when the timer expires.
-   Does not attract coins outside the active playable area.
-   Must not collect the same coin twice.

### 9.2 Shield

-   Creates a visible protective effect around the player.
-   Blocks one qualifying enemy or obstacle damage event.
-   Consumes itself after blocking one event.
-   Shows ready/consumed status.
-   Must not silently block multiple hits unless explicitly configured.

### 9.3 Super Punch

-   Temporary stronger punch effect; proposed duration: five seconds.
-   Enables breaking designated breakable walls.
-   Improves combat effectiveness against heavy enemies.
-   Clearly communicates activation and expiry.
-   Does not make every wall destructible unless configured.

### 9.4 Double Coins

-   Proposed duration: five seconds.
-   Doubles eligible coin pickup value while active.
-   Works with normal and magnet-attracted coin pickups.
-   Does not accidentally double gate rewards, enemy rewards or other
    transactions unless explicitly specified.
-   Shows a clear timer and effect indicator.

### 9.5 Freeze Enemy

-   Proposed duration: five seconds.
-   Temporarily stops eligible nearby enemies from moving or attacking.
-   Clearly indicates frozen enemies.
-   Resumes enemy behaviour safely when the effect expires.

### 9.6 Power-up rules

-   Spawn at configurable intervals and reachable locations.
-   Avoid spawning inside walls or hazards.
-   Avoid cluttering the road with too many simultaneous power-ups.
-   Show activation and expiry feedback.
-   Recommended initial stacking behaviour: collecting the same active
    power-up refreshes its timer; different power-ups may coexist if
    effects do not conflict.
-   Use reliable timers so effects expire correctly when frame rate
    fluctuates.
-   Pause/resume behaviour must be consistent with game state.

------------------------------------------------------------------------

## 10. Player controls and HUD

### 10.1 Controls

Required: - Automatic forward running. - Left/right steering. - Punch
action.

Explicitly excluded: - Jump control and jump gameplay. - Slide control
and slide gameplay.

Do not show jump or slide hints anywhere in the interface.

### 10.2 HUD layout

**Top area** - Level number and environment name. - Level progress. -
Current coin balance. - Pause control.

**Power-up status** - Magnet countdown. - Shield ready/consumed
status. - Super Punch countdown. - Double Coins countdown. - Freeze
Enemy countdown.

**Gameplay controls** - Steering controls appropriate to the existing
input design. - Large Punch button in an accessible lower-screen
position.

### 10.3 UI quality

-   Responsive mobile layout.
-   Safe-area spacing.
-   Readable text and icons.
-   High contrast against the 3D scene.
-   Minimal obstruction of the road.
-   Consistent visual language and restrained animations.
-   Desktop layout remains usable for testing.

------------------------------------------------------------------------

## 11. Levels, progression and results

### 11.1 Suggested progression

    Level Environment theme
  ------- --------------------------------
        1 Residential Street
        2 Market Street
        3 Construction Zone
        4 Temple Street
        5 Festival Street
        6 Traffic Crossing
        7 Town Outskirts
        8 Advanced Residential Challenge
        9 Mega Obstacle Street
       10 Ultimate Collectopia

These are proposed themes. Reuse the existing level system if it already
supports progression.

### 11.2 Difficulty progression

Increase difficulty gradually through enemy speed/behaviour, obstacle
density, moving obstacle timing, gate values, coin placement risk,
power-up frequency and boss encounters.

Difficulty must increase without generating unavoidable patterns.

### 11.3 Results screen

At the existing level/run completion point, show: - Completion status. -
Starting balance. - Coins collected. - Gate gains/losses. - Enemy damage
penalties. - Obstacle damage penalties. - Enemy defeat rewards. - Other
bonuses. - Final run balance. - Stars or score, if supported.

Actions: - Next Level. - Replay, if supported. - Home.

Every visible action must work. Do not show placeholder buttons.

------------------------------------------------------------------------

## 12. Technical and architecture requirements

The existing repository determines the implementation. Do not assume a
framework before auditing it.

The technical plan should identify: - Existing game engine and rendering
approach. - Player controller and input ownership. - Scene/environment
loading. - Collision detection approach. - Coin/economy ownership. -
Gate evaluation and transaction flow. - Enemy state and combat flow. -
Power-up state and timer management. - Level generation/progression. -
Persistence mechanism. - HUD integration. - Asset loading and resource
cleanup.

### 12.1 Suggested logical modules

Use the current architecture where possible. Logical responsibilities
may include PlayerController, InputController, CoinSystem,
EconomyManager, MathGateSystem, ObstacleSystem, WallSystem, EnemySystem,
CombatSystem, PowerUpSystem, EnvironmentManager, LevelManager, HUD/UI
and Save/Progress service.

These are responsibility names, not a mandate to create one file per
module.

### 12.2 Performance

-   Reuse assets and environment prefabs.
-   Use object pooling for frequently spawned coins, enemies and
    obstacles where beneficial.
-   Limit active objects outside the camera's relevant area.
-   Optimize textures, geometry, shadows and lighting for mobile.
-   Avoid unnecessary per-frame allocations and expensive collision
    checks.
-   Dispose of unused resources correctly.
-   Avoid duplicate animation loops and event listeners.
-   Maintain smooth camera and player movement.
-   Test representative mobile browsers and devices.

### 12.3 Persistence

Preserve the existing persistence architecture. If none exists, propose
a safe approach in the technical plan before implementing it.

Persist intended long-term data such as player progress and total
balance. Temporary run state and active power-up timers should not be
restored as if a run were still active unless explicitly designed.

------------------------------------------------------------------------

## 13. Functional acceptance criteria

### Core movement and controls

-   [ ] Player runs forward automatically.
-   [ ] Left/right steering works on mobile.
-   [ ] Punch works while running.
-   [ ] No jump or slide controls or mechanics remain.
-   [ ] Pause/resume works without corrupting timers or state.

### Coin and mathematical gates

-   [ ] Coins update the balance.
-   [ ] Each coin can be collected only once.
-   [ ] Addition gate applies the correct amount.
-   [ ] Subtraction gate applies the correct penalty and balance floor.
-   [ ] Multiplication gate calculates correctly.
-   [ ] Division gate calculates correctly using the documented rounding
    rule.
-   [ ] Only the selected gate activates.
-   [ ] Gate transactions cannot be duplicated.

### Environment and obstacles

-   [ ] Indian residential street loads with houses on both sides.
-   [ ] Road, props and buildings are correctly scaled and grounded.
-   [ ] Wall obstacles have working collision.
-   [ ] Moving walls behave predictably.
-   [ ] Breakable walls respond only to valid Super Punch conditions.
-   [ ] Narrow passages are traversable.
-   [ ] Street obstacles are distinguishable from scenery.
-   [ ] Obstacle patterns always provide a fair route.

### Enemies and combat

-   [ ] Enemies approach using configured behaviours.
-   [ ] Enemy collision applies one correct penalty.
-   [ ] Punch detects valid targets.
-   [ ] Punch cooldown is enforced.
-   [ ] Heavy enemies require multiple hits.
-   [ ] Enemy defeat reward is awarded once.
-   [ ] Boss health and defeat logic work if enabled.

### Power-ups

-   [ ] Magnet attracts nearby coins for five seconds.
-   [ ] Magnet expires correctly.
-   [ ] Shield blocks one qualifying hit.
-   [ ] Super Punch enables configured stronger attacks and wall
    breaking.
-   [ ] Double Coins affects eligible pickups for five seconds.
-   [ ] Freeze Enemy works for five seconds.
-   [ ] Power-up stacking/refresh rules are respected.
-   [ ] Timers remain correct through pause/resume.

### Results, persistence and quality

-   [ ] Results screen totals match the transaction ledger.
-   [ ] Next Level, Replay and Home actions work when shown.
-   [ ] Intended progression persists after refresh.
-   [ ] No duplicate rewards or transactions occur.
-   [ ] Mobile HUD is readable and controls do not overlap.
-   [ ] No major performance or runtime errors remain.

------------------------------------------------------------------------

## 14. Analytics and balancing

If analytics are already present, consider tracking run
starts/completions, coins collected, gate choices, enemy
encounters/defeats, damage events, power-up usage and level completion.

Do not add third-party analytics or transmit personal data without
approval.

Use playtesting to tune coin/gate values, damage penalties, enemy
health/rewards, punch cooldown/range, power-up spawn rates, obstacle
spacing and difficulty progression.

All balance values should be configurable rather than scattered as
unexplained constants.

------------------------------------------------------------------------

## 15. Delivery strategy

Implement in the following order, with testing and review after each
phase.

**Phase 0 -- Codebase audit** - Inspect repository and existing game. -
Identify working features, architecture, assets and risks. - Produce
`CODEBASE_AUDIT.md`, `TECHNICAL_PLAN.md` and
`IMPLEMENTATION_TRACKER.md`. - Make no code changes until the audit is
reviewed.

**Phase 1 -- Core gameplay and economy** - Confirm movement and
steering. - Coin collection and authoritative economy. - Four
mathematical gates. - Transaction and calculation tests.

**Phase 2 -- Indian street environment** - Road and residential
buildings. - Street dressing and environment zones. - Lighting,
materials and performance pass.

**Phase 3 -- Obstacles and walls** - Static, moving, breakable and
narrow-passage walls. - Street obstacles. - Collision, penalties and
fair pattern validation.

**Phase 4 -- Enemy and combat** - Enemy behaviours. - Damage and
penalties. - Punch, enemy health and rewards. - Boss encounters if
included.

**Phase 5 -- Power-ups** - Magnet, Shield, Super Punch, Double Coins and
Freeze Enemy. - Timers, stacking rules and effect tests.

**Phase 6 -- HUD, levels and results** - Mobile HUD. - Environment/level
progression. - Results and rewards.

**Phase 7 -- Integration and optimization** - Full regression testing. -
Mobile browser testing. - Performance and visual polish. - Fix critical
issues.

At the end of each phase: 1. Summarize files changed. 2. Explain what
was implemented. 3. List tests performed and results. 4. List known
issues and deferred work. 5. Update `IMPLEMENTATION_TRACKER.md`. 6. Wait
for approval before starting the next phase.

------------------------------------------------------------------------

## 16. Questions to resolve during codebase audit

Do not guess where existing project behaviour can answer these
questions. Record findings and propose defaults for approval.

1.  Does the existing game use lane-based steering or continuous
    horizontal movement?
2.  Does a persistent coin wallet exist, and how does it relate to run
    balance?
3.  Is the game endless, level-based or a combination?
4.  What is the existing completion condition?
5.  Which 3D assets and animations are available?
6.  What collision system is used?
7.  How are game state and pause/resume managed?
8.  Which mobile devices and browsers are currently supported?

------------------------------------------------------------------------

## 17. Definition of done

The product is ready for release review when: - All approved gameplay
requirements are implemented. - All acceptance criteria pass. - Existing
unrelated functionality remains intact. - Coin transactions are accurate
and auditable. - No jump or slide mechanics remain. - The Indian street
environment is visually coherent and optimized. - Mobile controls and
HUD are usable. - No known critical gameplay bugs remain. -
Implementation and known limitations are documented.

**Final product direction:** COLLECTOPIA should feel like a polished 3D
arcade runner set in a believable Indian neighbourhood. Its identity
comes from Indian street scenery, mathematical gate decisions, coin
collection, enemy punching, physical wall obstacles and short-lived
power-ups.
