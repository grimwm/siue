# Games kit, bundling, and the Tankity/Crete/Cylon overhaul

Date: 2026-10-12
Status: approved in brainstorming (all sections); next step is the implementation plan.
Mockups: [`2026-10-12-games-kit-mockups/`](2026-10-12-games-kit-mockups/) (open the `.html` files in a browser; `layout-all-devices.py` regenerates the device page and `layout-measure.mjs` is the overflow check the layout spec reuses).

## Goal

Less code and more reuse across the three games (`websites/www.cs/games/{crete,cylon,tankity}`) through a shared, documented kit; strict types everywhere; tests that give real confidence without slowing the PR loop; and a set of Tankity and Crete gameplay and interface fixes found along the way.

## Constraints

- The host is the university's sftp-only PHP 8.4 server. Nothing can be installed or built there; what is deployed is static files plus the existing runtime PHP.
- Node (local and CI) and Composer (dev only) may be used to build and test. Their output is checked in.
- A *built* game folder works copied anywhere (it needs nothing outside itself at run time). A game's *source* needs `games/_kit/` beside it to rebuild.
- One PR at a time per line of work, each through CI, merge, deploy and a light live check, with a cache-busted play link reported.
- Agents run `make test` plus at most two browser specs locally; CI runs the selected specs in four shards.

## 1. The kit (`games/_kit/`)

One source of truth, never deployed. Games import from it by relative path and esbuild inlines what they use, so the only duplication is in the built bundles. There is no copy step and no per-game kit folder.

```
games/
  package.json            # esbuild, typescript (7), preact; one npm ci for all games
  _kit/
    README.md             # each pattern below, named and explained
    build/build.mjs       # tsc --noEmit + esbuild bundle + --check
    build/tsconfig.base.json, tsconfig.dom.json
    php/install-core.php  # yaml subset, manifest, icons, sw precache, page blocks, bundle hash
    php/score-guard.php   # origin, CSRF, run tokens, rate limits, initials (section 8)
    ports.ts              # Timers, Clock, Rng, Log/Sfx hook types
    ports.browser.ts      # the real adapters
    prefs.ts              # typed, safe localStorage with subscriptions
    audio/core.ts         # AudioContext lifecycle, unlock, mute, bus, envelopes
    ui/                   # Preact: Dialog, Button, Panel, KeyChip
    test/                 # node:test helpers: seeded rng, manual clock, recording hooks
```

`hub.php` already skips folders without `metadata.yaml`, so `_kit/` never shows as a game. `deploy.sh` skips `games/_kit/**`.

| Module | Pattern | Replaces |
|---|---|---|
| `build/` | one parameterized build, configured per game by `build.json` | three `tools/ts-build.mjs` |
| `php/install-core.php` | configuration over code: pure functions plus a per-game config array | the `install_*` functions in three `tools/install-files.php` (1,280 lines) |
| `ports.ts` + adapters | Ports and Adapters: engines take `Timers`, `Clock`, `Rng` and hook interfaces; the page wires browser adapters, tests wire fakes | each game's private copies of these types |
| `prefs.ts` | a typed store with Observer subscriptions; every access in try/catch with defaults | scattered `localStorage` calls |
| `audio/core.ts` | Facade over Web Audio; games register named voices (Strategy) | the plumbing in three `audio.ts` files; voices and music stay per game |
| `ui/` | Preact components | Tankity's own primitives and Cylon's/Crete's hand-built overlays |
| `test/` | test doubles for `node:test` | hand-rolled `check()` helpers |

Left out on purpose: a generic state machine (only Tankity's `flow.ts` needs one) and any shared simulation (the games share no mechanics).

## 2. Build and delivery

- `node games/_kit/build/build.mjs <game>` reads the game's `build.json` (its entries, e.g. Tankity `["src/main.ts", "src/fx-editor.ts"]`), then:
  1. type-checks with `tsc --noEmit` (TypeScript 7), two programs per game as today: the DOM-free program for engines and sims, the DOM program for the rest, both extending `tsconfig.base.json` (strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `allowImportingTsExtensions`);
  2. bundles each entry with esbuild (pinned version, ES2022, minified, `react-jsx` with Preact) to `<game>/dist/<name>.js` plus `.js.map`, checked in;
  3. with `--check`, rebuilds into a temporary folder and fails on any byte difference.
- Every hand-written file moves into `src/` as TypeScript: Tankity `game.js` → `src/main.ts`, `fx.js` and `fx-editor.js` → `src/fx/*.ts`; Cylon `cylon.js` → `src/main.ts`; Crete `game.js` → `src/main.ts`.
- Imports use `.ts` extensions, so Node runs the unit tests straight from `src/` (CI moves to Node 24 LTS).
- Cache busting: each page references `dist/main.js?v=<hash>` and `game.css?v=<hash>`, written by `install-core.php`; `sw.js` precaches the bundle, its CSS and assets; `tools/site-versions.php` hashes `cylon/dist/main.js` for the home page.
- Removed: per-import `?v=` rewriting, the Preact import map, `tankity/vendor/` and `tools/vendor.mjs`, the per-game `package.json`/lockfiles/`ts-build.mjs`, and the module lists in `sw.js`.
- Deploy ships `dist/*.js` and `.map`; it skips `src/`, `_kit/`, `build.json`, `node_modules`, `vendor/` (Composer), `composer.*` and `phpunit.xml`.

## 3. Testing and when it runs

| Tier | What | Where | Budget |
|---|---|---|---|
| Static | `tsc --noEmit`, `build.mjs --check`, `install-files --check` | `make test`, CI `units` | ≤ 15 s |
| Unit | `node --test` over `src/` of every game and the kit (parallel files, per-file timing); PHPUnit suites | `make test`, CI `units` | ≤ 45 s |
| E2E, selected | Playwright specs chosen by `select.mjs` from changed files | CI per PR (4 shards); locally ≤ 2 specs | as today |
| Nightly | every spec, plus slow sweeps (Crete 10,000 seeds, Tankity sim vectors) | CI cron on `main` | none; GitHub emails on failure |

- PHPUnit (^12) via `websites/www.cs/composer.json`, dev only. `phpunit.xml` has one suite per game plus `site` and `kit`; each game's `test.sh` runs its suite. Hand-rolled `*-test.php` scripts become `TestCase` classes one-for-one, each game's in the PR that moves it onto the kit.
- Characterization specs land first and pass on today's code: `crete-play` (a fixed seed won through `__mazeTest`, a death, mute, `N`) and `cylon-play` (start, destroy a unit, an ability, game over, score submit). They use Playwright's `page.clock` and aim for ≤ 30 s each.
- `select.mjs` maps `games/_kit/**` to ALL specs.

## 4. Crete: the maze must be met, and must be winnable

Today `generateRun` keeps a maze where the creature's distance exceeds the optimal route by 6 or more, which is a guaranteed clean escape. New rule, checked on every candidate with the real `createGame` rules through the ports seam:

1. **The dasher must meet the creature.** It walks `goalPath()` (fetching fuses when a barrier blocks it), never bashes, uses items or waits. The maze passes only if the creature, at some point, ends a turn adjacent to it (the −2 HP aura) or catches it.
2. **The strategist must win.** Each turn, first match wins: bash if adjacent and charged; raise the shard if adjacent and bash is recharging; throw the jammer if the creature is within 2 steps and on the route ahead; eat a snack at HP ≤ 8; wait in a safe zone while the creature sits on the route ahead; otherwise step along `goalPath()`. It must reach the exit alive. `T` (play-through) uses this same bot.

- Determinism: attempt *i* draws its layout from `mulberry32(hash(seed + ":maze:" + i))` and the run from `mulberry32(hash(seed + ":run:" + i))`, so a simulation starts from exactly the stream the real run uses.
- At most 80 attempts. If none passes both checks, take the candidate whose strategist wins and whose dasher came closest to the creature. Never return a maze the strategist loses.
- A unit test sweeps 1,000 seeds: the fallback must fire on ≤ 1% of them and generation must take ≤ 20 ms at p95. The nightly run sweeps 10,000.
- Visible changes: `?seed=` links give new mazes; the HUD drops "mistake budget N" and keeps "optimal route N moves"; `engine-test` and `crete-play` re-pin their seeds.

## 5. Cylon and Crete overlays

Their hand-built overlays (`createElement`/`innerHTML`) become kit `ui/` components. Gameplay must not change: `cylon-play` and `crete-play` stay green through every PR that touches them.

## 6. Tankity interface

### 6.1 Starting a game

- On load the demo plays dimmed behind a title card: **▶ Play** (solo, random seed), **Play with friends** (Rooms), **Tutorial**, a **Settings** link, and the 3-letter initials picker (section 8). The card returns after a match ends and after leaving a room. Mockup: `title-card.html` (option A).
- The menu becomes settings only: unit, seed (with "Play this seed"), text size, sound, music (with Next song on phones), fullscreen, scores, standings, and Leave room in a room. It opens from a labelled **☰ Menu** button or **Esc**, and Esc closes it again.

### 6.2 Layout (every screen)

Mockups: `controls-and-key-chips.html` (desktop deck and chips), `layout-all-devices.html` (eight devices, solo and room, worst-case values).

- **Status bar on top**, in this order: Menu (with an inline `Esc` chip), angle, power, fuel, **AMMO** pill (orange), **ARMOR** pill (green), **lives** pill (pink, always `♥ N`, `aria-label="N lives"`), **WIND** pill, and the **match badge**, one segmented outline: `$cash | ROUND n | score PTS` in solo, `ROOM code | YOU seat | ROUND n` in a room.
- **Battlefield** in the middle. Chatter is a one-line toast. The wind badge leaves the sky.
- **Control deck** below, in labelled groups: **Aim** (barrel and power arrows, every arrow says which), **Drive (uses fuel)** (Left, Right), **More** (Radio, Next song, Help), **Weapon** (the gun's name over "34 dmg · M", 55 px tall like its neighbours; G opens the picker), and a large rounded-rectangle **FIRE**. Damage is the gun's `dmg`; blast size S/M/L comes from its `radius`, with the cut-offs in one tested function.
- **Portrait phone:** the same deck without group headings; Shell sits directly on FIRE, its top level with ▲; Next song moves to the Menu. The status bar has three rows: Menu and aiming numbers; the four pills; the full-width match badge.
- **Landscape phone:** controls float over the battlefield's lower corners. Arrow keys there are translucent gold (`rgba(255,201,60,.55)`) with white text and a dark halo; other buttons keep their solid style. Shell stacks above FIRE with a clear gap. Radio, Help and Next song move to the Menu.
- **Desktop and portrait** arrow keys stay solid gold with dark text.
- Phones hide the page header; every phone tap target is ≥ 44 px.
- Breakpoints (container width): ≤ 1100 px short labels (ANG, PWR, ARM, RND); ≤ 860 px an 11 px bar; ≤ 760 px no key chips. Nothing in the status bar may wrap or clip at the worst-case values (angle 162°, power 100, fuel 100, ♥ 5, $12,450, round 13, 98,760 pts) on: 1280×720, 1024×640, 1180×820, 820×1180, 393×852, 360×740, 852×393, 740×360.

### 6.3 Keys

`game.yaml` is the single source; `input.ts`'s fallback table mirrors it.

- ←/→ swing the barrel; ↑/↓ change power; **Shift+←/→ drives**.
- Space or Ctrl fires; G opens the weapon picker; Esc opens the Menu.
- L radio, ] next song, H help, M music, E sound, F fullscreen.
- **W, A, S, D and Q are bound in no context.** The `cycle` (next weapon) command is removed.
- Key chips: one style, dark keycap (`#14183a`) with light text, fixed-height flex box centred on its label; shown only under `(hover: hover) and (pointer: fine)`; text read from the key table. Help lists every key.

### 6.4 Accessibility

Visible labels match each `aria-label` (WCAG 2.5.3); `aria-expanded` on everything that opens a panel; focus moves into the title card and the menu and returns on close; the translucent landscape keys pass contrast.

### 6.5 Music

- Twelve new CC0 tracks (sixteen in all) in the existing 16-bit action/chiptune style. Battle Theme A stays first (the theme).
- Only tracks whose source page states CC0 in its license field; each page's URL goes in `audio/CREDITS.md`.
- `audio/music/build_music.sh` downloads sources pinned by SHA-256, transcodes to 80 kbps stereo mp3 with metadata stripped, and normalizes loudness (EBU R128, one target). The existing four go through it too; the per-track `volume: 0.6` goes away.
- Next song shows a toast "♫ Title · Author".
- A unit test checks that `game.yaml`, `CREDITS.md` and `audio/music/` agree.

## 7. Tankity rules

### 7.1 Armor

- Max armor = 100 + 25 × hull plates fitted. Fitting a plate raises the max and adds 25 armor.
- Damage carries over between rounds: a round starts with the armor the last one ended with.
- Repair +40 restores up to max, never beyond. The shop greys it out at full armor and states what it would restore ("Restores 15 (you're at 160 of 175)"). Nothing is banked: `repairBank` and `repairApplied` are removed.
- Losing a life: the next round starts in a fresh tank at full max armor; plates stay fitted.
- Drones are unchanged (round-scaled armor each round).
- The ARMOR pill shows current armor; hover and screen readers give "160 of 175".
- `match.ts` and `server/rules.php` change together; new shared sim vectors cover carry-over, a capped repair, a plate, and death then re-muster.

### 7.2 Match end

- Solo is endless and ends at ♥ 0.
- A room that started with two or more humans ends when only one human has lives left. That human wins and gets a winner's bonus (the round bonus × 2). A room with one human plays like solo.
- The 40-turn watch cap (`WATCH_TURNS`) stays.
- Sim vectors cover the last-human-standing rule.

### 7.3 Scoreboards (this match only)

Mockup: `scoreboards.html`.

- After every round, at the top of the shop: score (with this round's gain), rounds won, kills, lives or "out in round N". Rows sort by score; eliminated players stay listed, greyed.
- Match over: "♛ XYZ wins: last tank standing", final standings, **Play again (same room)** (keeps code and seats, resets lives, scores and cash) and **Leave room**, and "Filed · #12 all-time" when the run places.
- You're out: the same table with **Watch the finish** and **Leave room**; while watching, Menu → Standings shows it.
- Solo: a table of your rounds so far (points, kills, cash, lives, total); at game over it heads the end card.

## 8. High scores and their integrity

- Runs file themselves the moment they end, in solo and rooms. There is no form or button. Menu → Scores always shows the current all-time board with your entries highlighted.
- **Initials:** exactly three letters. Players may type either case; the client displays uppercase and the server uppercases before validating (`[A-Za-z]{3}` in, `[A-Z]{3}` stored). One set per player in the kit's `prefs`, shared by solo and rooms, set in a three-box picker on the title card. A browser that never sets any gets three random letters once.
- Existing solo entries (free-text callsigns, 1–24 characters) are converted once: letters uppercased, everything else dropped, cut or padded with X to three.
- `games/_kit/php/score-guard.php`, generalized from Cylon's `scores.php`: Origin/Referer allow-list; CSRF double-submit (cookie must match header); single-use, expiring run tokens; per-IP rate limits keyed by an HMAC of the IP; initials validation and blocklist; validated config. Cylon moves onto it with no behaviour change; Tankity's score and room endpoints use it.
- Rooms: the server computes and files every score itself; the client never sends one.
- **Solo uses server replay.** At game over the browser sends the seed and the move log (each shot's angle, power and weapon; each drive; each shop purchase). The server replays it with the same PHP sim the rooms use and computes the score. A log that does not replay to a finished game is rejected. Limits: 60 rounds and 2 s of CPU per replay. A run that ends offline waits in the browser and files itself when next online.
- PHPUnit covers every guard rule (bad origin, missing or mismatched CSRF, reused or expired token, rate limit) and replay (a tampered move log, a forged score field, and an honest run that files at exactly the score the browser showed).

## 9. Comments and docs

Each PR tightens the comments in the files it touches:

- Comments say why, never what the next line does, and never history ("kept from when…", "moved here in #NN").
- File headers are one to five lines: what the module is and what it must not touch. Architecture lives once, in the game's `README.md` and `_kit/README.md`.
- Long config preambles (`tsconfig`s) shrink to a pointer to the README. `game.yaml` keeps its per-field notes.
- The foundry `comment-review` pass runs on each PR.

`games/README.md` changes "each game folder is self-contained" to: a built game folder is self-contained; its source needs `_kit/`.

## 10. PR order

| # | PR | Notes |
|---|---|---|
| 1 | Characterization specs (`crete-play`, `cylon-play`) + nightly full-suite workflow | parallel with 2 |
| 2 | Composer + PHPUnit; site `tests/*.php` move over | |
| 3 | Kit core (build, `install-core.php`, ports, prefs, test helpers, Node 24, deploy excludes, select rule); Crete adopts it | |
| 4 | Cylon adopts the kit core | |
| 5 | Tankity adopts the kit core | |
| 6 | Kit `audio/core.ts`, adopted by all three | |
| 7 | Kit `ui/`; Crete overlays → Preact | |
| 8 | Cylon overlays → Preact | |
| 9 | Crete maze rule | |
| 10 | Kit `score-guard.php`; Cylon moves onto it | any time after 2 |
| 11 | Tankity keys and key chips | |
| 12 | Tankity title card (with initials) and settings-only menu | |
| 13 | Tankity layout, pills, deck, phone layouts; `a11y` and eight-device layout specs | |
| 14 | Tankity armor rules (client, server, sim vectors) | |
| 15 | Tankity match end, scoreboards, Play again, auto-filed scores | |
| 16 | Tankity score integrity: guard, solo replay, initials, board conversion | after 10 and 15 |
| 17 | Tankity music | |
| 18 | Typed tests: every remaining `*.test.mjs` becomes `*.test.ts` on `node:test` directly, and every PHP check script a real PHPUnit `TestCase`; each game's `tsconfig.test.json` (with `@types/node`) joins its `build.json` programs; the `check()` and `LegacyCheckCase` bridges are deleted | last; tests in any area a plan B–D PR touches are rewritten in that PR |

After 6, the Crete line (7–9) and the Tankity line (11–17) touch different files and run in parallel worktrees; 14, 15 and 17 are independent of each other. Each implementing agent's job stays at about 20 minutes or less.

New specs and their budgets: `tankity-start`, `tankity-layout` (the eight-device measurement, plus chip centres within 1 px of their row), `a11y` (axe-core over the title card, deck and open menu), each ≤ 15 s. Existing specs that use `#btn-menu`, `C`, `W`/`S`, `A`/`D` or `Q` change in the PR that changes those keys.

## Done when

- Every PR above has landed and deployed, and its live check passed.
- `make test` stays within its budgets (static ≤ 15 s, unit ≤ 45 s) and the nightly run is green.
- No hand-written `.js` remains outside `dist/`, and no tool or helper is duplicated across the games.
- Every test file is TypeScript and type-checked by the build; no test runs through a bridge.
