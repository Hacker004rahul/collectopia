# CODEBASE_AUDIT.md

**Project:** COLLECTOPIA
**Audit date:** 2026-11-13
**Auditor:** opencode
**Audit scope:** `D:\collectopia` (correct repository confirmed by the user) and its
GitHub remote `Hacker004rahul/collectopia`
**Status:** **COMPLETE — no existing game source; greenfield direction confirmed**

---

## 0. Confirmed project direction

The user has verified the repository and the development direction:

| Decision | Confirmed value |
|---|---|
| Correct repository | `https://github.com/Hacker004rahul/collectopia` |
| Existing game source | **None. Explicitly confirmed: nothing needs to be preserved.** |
| Development approach | **Track B — Greenfield development** |
| Technology direction | **Vite + TypeScript + Three.js** |
| Platform targets | **Mobile browsers and desktop browsers** |
| Lens Studio | **Not used** |
| Jump / slide mechanics | **Not implemented anywhere** |
| Requirements document | `COLLECTOPIA_PRD_v1.0.md` (primary source of truth) |

This resolves the earlier ambiguity: there is no legacy codebase to upgrade, so
"upgrade, do not rebuild" is formally waived by the product owner. COLLECTOPIA
will be built as a new mobile-first 3D web game.

**No application source code has been created, modified or deleted.**

---

## 1. Executive summary

The repository contains the COLLECTOPIA PRD plus the three planning documents
produced by this audit (`CODEBASE_AUDIT.md`, `TECHNICAL_PLAN.md`,
`IMPLEMENTATION_TRACKER.md`). It does **not** contain a game.

There is no application code, build system, assets, tests or configuration of
any kind. Therefore no player system, game mechanic, environment, UI,
persistence or performance behaviour can be audited — because none exists.

The PRD's references to a previous beach environment, a dumbbell collectible
and jump/slide mechanics describe a legacy game that is **not supplied and not
required**. COLLECTOPIA starts clean under the confirmed greenfield direction.

---

## 2. Repository facts (verified)

| Item | Finding |
|---|---|
| Local path | `D:\collectopia` |
| Git repository | Yes (initialised) |
| Branch | `main` |
| Commits | 1 (`6125711 Add Collectopia PRD v1.0`) |
| Remote | `https://github.com/Hacker004rahul/collectopia.git` |
| Remote visibility | Public |
| Remote size | 0 KB (GitHub-reported) |
| Remote branches | `main` only |
| Tags / releases | None |
| Tracked files | `COLLECTOPIA_PRD_v1.0.md` only |
| Untracked local files | `CODEBASE_AUDIT.md`, `TECHNICAL_PLAN.md`, `IMPLEMENTATION_TRACKER.md` |
| Git LFS | Not used |
| Hidden / stashed / dangling code | None (only the pre-amend PRD commit is dangling) |

### 2.1 Files present

```
D:\collectopia\
├── .git\
├── COLLECTOPIA_PRD_v1.0.md
├── CODEBASE_AUDIT.md
├── TECHNICAL_PLAN.md
└── IMPLEMENTATION_TRACKER.md
```

### 2.2 Expected game artifacts that are absent

`package.json`, lockfile, `index.html`, `src/`, `public/`, `assets/`,
`vite.config.*`, `tsconfig.json`, test config, CI workflows, `README.md`,
`.gitignore`, service worker, and any 3D models, textures, audio or animation
files.

---

## 3. Technology stack

| Area | Audit result |
|---|---|
| Frontend framework | **None — nothing exists yet** |
| Programming language | **None in the repo** (Markdown only) |
| 3D engine / renderer | **None exists yet** |
| Physics / collision system | **None exists yet** |
| Build tooling | **None exists yet** |
| Test tooling | **None exists yet** |
| Game architecture | **Does not exist yet** |

### 3.1 Confirmed target stack (to be created in Phase 1)

| Concern | Confirmed choice |
|---|---|
| Language | TypeScript |
| Build/dev server | Vite |
| 3D rendering | Three.js |
| Collision | Custom lightweight AABB/sphere (no physics engine) |
| HUD | DOM/CSS overlay |
| Audio | Web Audio API |
| Tests | Vitest (unit), Playwright optional (E2E) |
| Persistence | Versioned `localStorage` |

No framework, engine or game architecture is being preserved because none
exists. This is documented and approved, satisfying the PRD's
"document deviations" principle.

---

## 4. Player system

| Requirement / PRD assumption | Audit result |
|---|---|
| Existing player model and animations | Not present |
| Forward-running mechanism | Not present |
| Left/right movement and lane controls | Not present |
| Existing mobile controls | Not present |
| Existing jump/slide behaviour to remove | Not present — and none will be built |

> The PRD excludes jump/slide. Since this is greenfield, the exclusion is a
> construction rule, not a removal task: no input binding, animation, UI hint or
> gameplay logic for jump/slide will be created.

---

## 5. Game mechanics

| System | Audit result |
|---|---|
| Collectible system | Not present |
| Coin / score management | Not present |
| Mathematical gate implementation | Not present |
| Enemy / combat systems | Not present |
| Collision and obstacle handling | Not present |
| Power-up implementation | Not present |
| Economy / transaction ledger | Not present |
| Persistence | Not present |

Every system will be built new per the PRD and the technical plan.

---

## 6. Environment

| Area | Audit result |
|---|---|
| Existing environment / assets | Not present |
| Road, buildings, scenery, obstacles | Not present |
| Procedural generation | Not present |
| Legacy beach setting | Not present (and not required) |

The Indian residential street environment will be created from a new asset kit.

---

## 7. UI and progression

| Area | Audit result |
|---|---|
| HUD, buttons, mobile interface | Not present |
| Level progression / difficulty | Not present |
| Game-over, pause, result screens | Not present |
| Data persistence | Not present |

---

## 8. Assets and performance

| Area | Audit result |
|---|---|
| 3D models, textures, animations, audio | Not present |
| Reusable assets | None (only the PRD and planning docs) |
| Mobile performance characteristics | Cannot be measured until a build exists |
| Memory leaks / optimisation issues | Not applicable — no code |

Asset requirements and performance budgets are defined in `TECHNICAL_PLAN.md`.

---

## 9. Due-diligence search (retained for the record)

To avoid assuming a project was missing without checking, the following was
verified before the greenfield decision.

| Search | Scope | Result |
|---|---|---|
| Repository tracking / history / branches / tags / releases | `D:\collectopia`, GitHub API | PRD only; no code on any branch |
| Keyword scan (`dumbbell`, `beach`, `collectopia`, `runner`, `three.js`, `coin`, `endless`, `subway`, `surf`) | `D:\` text files | Only the PRD contains these terms |
| Filename scan for matching projects | `D:\`, `Downloads`, `Desktop`, `Documents` | No matching runner project |
| 3D asset / engine dependency scan (`.glb/.gltf/.fbx/.unity/.blend`; three, R3F, Babylon, PlayCanvas, Cannon, Rapier, A-Frame, Phaser) | `C:\Users\Rahul` | Only a Lens Studio sample (`Bitmoji race`) |
| GitHub repository list | `Hacker004rahul` | No runner repository with source |

### 9.1 Candidates examined and rejected

| Candidate | What it is | Why it is not the base game |
|---|---|---|
| `Downloads\Bitmoji race` | Snapchat Lens Studio sample project (runner-like) | Lens Studio, not web; no coins/gates/enemies; tutorial assets |
| `D:\StrikerKIng` | HTML/JS + Socket.io carrom game | Different genre |
| `D:\carrom Pro` / `carrom-master-pro` | Carrom game | Different genre |
| `D:\game3` | Empty directory | No files |
| `highway-beats-truck` (GitHub) | Lovable music/truck website | Not a 3D runner |
| `D:\katda` | Lens Studio project with beach imagery | Not a game |
| `D:\previous-version` | 5.5 MB executable | Not source code |

The user subsequently confirmed that no legacy game exists. This search is
closed.

---

## 10. Working features

**None.** There is no runnable application, so no feature can be confirmed as
working.

## 11. Incomplete features

**None detectable.** The repository contains no partial implementation.

## 12. Reusable components

| Component | Reusable? | Notes |
|---|---|---|
| `COLLECTOPIA_PRD_v1.0.md` | Yes | Requirements source of truth |
| Git remote / repository scaffolding | Yes | Already configured |
| Planning documents | Yes | Audit, plan and tracker |
| Existing game code | No | None exists |
| Existing assets | No | None exist |

## 13. Systems to be built (complete list per PRD)

1. PlayerController and animation state machine
2. InputController (touch steering + Punch; no jump/slide)
3. Camera / follow system
4. Chunked environment and level generation
5. Coin collectible system
6. Authoritative economy manager and run ledger
7. Four-operation mathematical gate system
8. Wall / street obstacle system with collision and fairness validation
9. Enemy system and combat / Punch system
10. Power-up system (Magnet, Shield, Super Punch, Double Coins, Freeze Enemy)
11. HUD and mobile UI
12. Level/progression manager
13. Results screen
14. Save / persistence service
15. Audio service
16. Object pooling and performance instrumentation

## 14. Risks (greenfield)

| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| R1 | No 3D art/audio assets exist | High | Define the low-poly asset kit and licensing before Phase 2; use placeholders in Phase 1 |
| R2 | Mobile GPU/thermal limits | High | Low-poly, instancing, shared materials, strict draw-call/triangle budgets, early device testing |
| R3 | Large scope (7 phases, 5 power-ups, boss, 10 levels) | Medium | Phase gates with explicit approvals |
| R4 | Indian street authenticity could look generic | Medium | Reference-driven kit; varied facades/props; review per zone |
| R5 | Economy/gate arithmetic bugs | Medium | Single transaction service + unit tests first |
| R6 | Duplicate rewards / repeated collision penalties | Medium | Idempotency keys and per-entity hit locks, covered by tests |
| R7 | Fairness of procedural patterns | Medium | Fairness validator + seeded generation + automated checks |
| R8 | Performance regressions from effects/power-ups | Medium | Budgets, profiling, object pooling |
| R9 | Scope creep into multiplayer/leaderboards | Low | PRD non-goals enforced |

## 15. Conflicts and resolution

| # | PRD vs previous state | Resolution |
|---|---|---|
| C1 | PRD says "upgrade existing game; do not rebuild" but no game exists | **Resolved:** user selected Track B greenfield and waived the upgrade constraint |
| C2 | PRD says preserve existing architecture/features | **Resolved:** nothing exists; new architecture defined in `TECHNICAL_PLAN.md` |
| C3 | PRD references removing jump/slide | **Resolved:** never built |
| C4 | PRD references replacing beach/dumbbell | **Resolved:** no legacy assets; build the intended coin/environment directly |
| C5 | PRD says preserve persistence architecture | **Resolved:** propose and implement versioned `localStorage` |
| C6 | Target platform is mobile web | **Resolved:** Vite + TypeScript + Three.js; Lens Studio explicitly excluded |

## 16. Remaining non-blocking questions

These are tuning/product choices, not audit blockers. Proposed defaults are in
`TECHNICAL_PLAN.md` §6.

1. Starting run balance and coin value.
2. Lane-based steering vs continuous drag (proposed: 3 lanes).
3. Level completion condition (proposed: fixed-length levels).
4. Asset sourcing and licensing approach.
5. Exact mobile browser/device test matrix.

## 17. Audit verdict

| Gate | Result |
|---|---|
| Correct repository confirmed | Yes |
| Existing game located | **No — confirmed none exists** |
| Technology stack identified | None present; target stack confirmed for greenfield |
| Existing features documented | None present |
| Reusable components identified | PRD + repository scaffolding + docs |
| Systems to build identified | Yes (all) |
| Risks identified | Yes |
| Conflicts identified and resolved | Yes |
| Safe to begin implementation | **Yes, after explicit approval of the plan** |
| Implementation started | **No** |

**Conclusion:** The audit is complete. COLLECTOPIA is a greenfield build with no
legacy constraints. Implementation remains on hold until the user explicitly
approves `TECHNICAL_PLAN.md`.
