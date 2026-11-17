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
- Deploy ships `dist/*.js` and `.map`; it skips `src/`, `_kit/`, `build.json`, `node_modules`, `vendor/` (Composer), `composer.*` and `phpunit.xml`, and never stages anything under `games/tankity/data/` (section 12).

## 3. Testing and when it runs

| Tier | What | Where | Budget |
|---|---|---|---|
| Static | `tsc --noEmit`, `build.mjs --check`, `install-files --check` | `make test`, CI `units` | ≤ 15 s |
| Unit | `node --test` over `src/` of every game and the kit (parallel files, per-file timing); PHPUnit suites | `make test`, CI `units` | ≤ 45 s |
| E2E, selected | Playwright specs chosen by `select.mjs` from changed files | CI per PR (4 shards); locally ≤ 2 specs | as today |
| Nightly | every spec, plus slow sweeps (Crete 10,000 seeds, Tankity sim vectors) | CI cron on `main` | none; GitHub emails on failure |

- PHPUnit (^12) via `websites/www.cs/composer.json`, dev only. `phpunit.xml` has one suite per game plus `site` and `kit`; each game's `test.sh` runs its suite. Hand-rolled `*-test.php` scripts become `TestCase` classes one-for-one, each game's in the PR that moves it onto the kit.
- Characterization specs land first and pass on today's code: `crete-play` (a fixed seed won through `__mazeTest`, a death, mute, `N`) and `cylon-play` (start, destroy a unit, an ability, game over, score submit). They use Playwright's `page.clock` and aim for ≤ 30 s each.
- `select.mjs` maps `games/_kit/**` to ALL specs, except files no browser runs, which select nothing on their own:
  - the kit's own tests, test helpers and docs (`_kit/README.md`, `_kit/test/`, `_kit/php/tests/`, `_kit/php/testing/`, `_kit/build/build.test.mjs`, `_kit/build/fixture/`): unit tests cover them;
  - the icon renderer, `_kit/build/icons.mjs` and its test: it runs only when an icon drawing changes, and the PNGs it writes fall under each game's own rule;
  - `_kit/php/score-guard.php`: it reaches a browser only as the copy each game commits in its `server/` (`kit_php`), and that copy selects its own game's specs. The rest of the kit's PHP (`install-core.php`) writes every game's pages and stays ALL.
- Tests written in Plans B–E are `node:test` files named `*.test.mjs` (TypeScript-friendly: `test()` and `node:assert/strict`, no `check()` bridge; components load through the kit's `importTsx`); row 18 turns them, with the rest, into `*.test.ts`. New UI tests go in new `node:test` files, never into the `check()`-style files such as Tankity's `test/ui.test.mjs`.

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
- The menu becomes settings only: unit, seed (with "Play this seed"), text size, Difficulty (how well the drones aim; a change waits for the next match, and a room uses its host's), sound, music (with Next song on phones), fullscreen, scores, **Quit** (section 11), and, in a room, **Standings** and **Leave room**. It opens from a labelled **☰ Menu** button or **Esc**, and Esc closes it again.

### 6.2 Layout (every screen)

Mockups: `controls-and-key-chips.html` (desktop deck and chips), `layout-all-devices.html` (eight devices, solo and room, worst-case values).

- **Status bar on top**, in this order: Menu (with an inline `Esc` chip), angle, power, fuel, **AMMO** pill (orange), **ARMOR** pill (green), **lives** pill (pink, always `♥ N`, `aria-label="N lives"`), **WIND** pill, and the **match badge**, one segmented outline: `$cash | ROUND n | score PTS` in solo, `ROOM code | YOU seat | ROUND n` in a room.
- **Battlefield** in the middle, touching the status bar and the deck and running to the frame's sides (section 6.6). Chatter is a one-line toast. The wind badge leaves the sky.
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

### 6.6 The battlefield fills the screen

Landscape is the preferred way to play. Portrait is allowed and looks as finished. There are no black bars anywhere, and no terrain is cut off sharply where it shows.

- **No bars.** The canvas fills the battlefield box, which touches the status bar and the deck and runs to the frame's sides. Nothing between the status bar and the deck shows the page's background.
- **The field's width W.** The field is always 460 world units tall. A room's is 720 wide, the same for everyone. A solo match's is set at the deal: W = 460 × long side ÷ short side of the battlefield box in landscape, clamped to 720–1440 and rounded to a whole number of 24-unit terrain columns. Demo, tutorial and Play again deal the same way.
- **Map sizing never depends on portrait.** On every device (desktop, tablet or phone), W comes only from the battlefield box's landscape shape. On a device held in portrait, that is the box the device would give in landscape, with the viewport's long side as its width. The box is computed from the viewport, never measured, so both orientations give the same W:
  - when the short side is 500 px or less (the landscape-phone layout), the box is (long − 10) × (short − 75);
  - otherwise it is min(long − 18, 1118) × (short − 294).

  `tankity-layout` checks that this is within 2 px of the measured box on every landscape device. For example, 1280×720 gives 1200; 1024×640 gives 1344; 1180×820 and 820×1180 give 984; 852×393 and 393×852 give 1224; 740×360 and 360×740 give 1176.
- **W is fixed for the match.** Resizing, rotating or going full screen mid-match only rescales the view. The next match takes the new W. Portrait only scales and frames the landscape field (sky above, dirt below, the rotate hint) and never changes the map.
- **Fitting the field.** The field is scaled by s = min(box width ÷ W, box height ÷ 460).
  - A box wider than the field (a room, a clamped W, or full screen) centres the field. The hills continue past both edges as scenery.
  - A taller box (portrait) spans the field across the full width. The night sky, with its stars, clouds and moon, fills the space above, up to the status bar; it takes 60 % of the leftover height. The dirt and its layers fill the rest below, down to the deck. It reads as one picture, not a box.
- **Scenery.** The hills past the field's edges are drawn from the same terrain generator, continuing the same seed's hills. The generator is a sum of three sines, evaluated past the edges. Next to each edge the scenery eases from the field's current edge height over max(48, |difference|) px, so a crater at the edge leaves no cliff. At the seam the scenery adds no step greater than 1 px beyond the hills' own slope. It is dimmed and desaturated. It is not hittable and not part of the sim: a shell that leaves the field flies on over the scenery and is out of play, as it is today. A room's snapshot carries the round's nine hill numbers, so rooms draw the same scenery.
- **Rotate hint.** In portrait, a small dismissible chip says "Turn sideways for the full battlefield". It shows at the start of each portrait match until it is dismissed, and dismissing it is remembered as a kit `pref` (`tankity-rotate-hint`). It never shows in landscape.
- **Fair at any width.** The extra width is part of the fight, and shots get longer.
  - Terrain: the same nine draws make the hills, and W columns are filled. The first 720 columns of a wide field are exactly the 720 field of the same seed.
  - Placement: the units spawn spread over the whole width (30 to W − 30) and face the middle of the field. Neighbours always start at least 110 apart, which is more than the largest blast radius (70) plus a hull's half-width (20), so no unit starts inside another's blast.
  - Reach: shots fly √(W ÷ 720) times faster, so a trajectory's range and height grow by W ÷ 720 and full power still crosses the field. Flights last √(W ÷ 720) times longer too (a steep rail or lance shot about 14.8 s at 1440, a shell under 9 s), so the 12 s flight cap, in the sim and in `simShot`'s step bound, is multiplied by the same factor. On a 720 field the factor is exactly 1.
  - Wind: the range is unchanged (±8 at the deal, ±12 at most). Drift grows with the flight time squared, which grows by W ÷ 720 like the range, so wind bends a shot by the same share of its length at any width (pinned within 2 %).
  - The drone AI searches the same angle and power grid, with out of bounds at W, and drives within the field. A degree or a power point moves a faster shell further, so the drones' wobble tightens per width. A table (`FIELD_AIM`, measured with `ai-measure`) scales the ranging wobble and the bracket's floor: 1 and 1 at 720, 0.7 and 0.5 at 1080, 0.55 and 0.4 at 1440, straight-line between those points.
  - Pinned by the measured hit rates. At 720, 1080 and 1440, Normal stays within 5 points of its targets (ranging 10/15/25 %, after two corrections 25/40/55 % at rounds 1/5/10), Easy within 5 points of half of Normal, and Hard at least Normal. The nightly run adds 912 and 1200.

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

- Solo is endless and ends at ♥ 0; there is no round limit.
- A tank left over a crater falls while shells are still flying, and a later shell of the same volley meets it where it has fallen to. The war (a drone's aim, the flight, the falls) runs in fixed 1/60 s steps, each dropping the tanks and then moving the shells, so play is the same at any frame rate.
- The simulation computes the same bits in the browser and on the server: every `sin`, `cos` and `atan2` it uses comes from one deterministic module per language (`detmath`), built only from `+ − × ÷` and `floor`, with halves rounding toward +∞ on both sides. The room server's sim and the browser's share it bit for bit, so a room's aim preview and its shot agree; shared vectors check it without tolerance. Rendering may use the platform's math.
- A room that started with two or more humans ends when only one human has lives left. That human wins and gets a winner's bonus (the round bonus × 2). A room with one human plays like solo.
- The 40-turn watch cap (`WATCH_TURNS`) stays.
- Sim vectors cover the last-human-standing rule.

### 7.4 Field width on the server

- The server's simulation takes the field width W as a parameter wherever it assumed 720 (terrain, placement, shot speed, out of bounds, the drone AI's wobble). Rooms pass 720, where every factor is exactly 1.
- W is a browser-only solo deal. The server's simulation keeps W as a parameter: rooms pass 720, and the vectors check 720, 1080 and 1440.
- Shared sim vectors at W = 720, 1080 and 1440 (terrain, placement, shot speed, out of bounds, a drone's aim with the width's tightened wobble) are checked bit for bit in both JavaScript and PHP.

### 7.3 Scoreboards (this match only)

Mockup: `scoreboards.html`.

- After every round, at the top of the shop: score (with this round's gain), rounds won, kills, lives or "out in round N". Rows sort by score; eliminated players stay listed, greyed.
- Match over: "♛ XYZ wins: last tank standing", final standings, **Play again (same room)** (keeps code and seats, resets lives, scores and cash) and **Leave room**, and "Filed · #12 all-time on Normal" when two or more humans played and the score places. A one-human room's score, like a solo run's, is saved on this browser's board, and the card says so ("Saved on this browser's board · #3 on Normal").
- You're out: the same table with **Watch the finish** and **Leave room**; while watching, Menu → Standings shows it.
- Solo: a table of your rounds so far (points, kills, cash, lives, total); at game over it heads the end card.

## 8. High scores

- Scores file themselves the moment a match ends. There is no form or button.
- **Two boards.** The online board holds only room matches that two or more humans started: one all-time board per difficulty (Easy, Normal, Hard), each keeping its best 100 runs, on the difficulty the room's host chose. Solo matches and rooms with one human plus drones are local: they save on this browser's board, the best 20 per difficulty, in `localStorage`, and never reach the server. Menu → Scores opens on the player's current difficulty with a switcher to the other two, and shows both lists for it, the online board and this browser's, with your entries highlighted.
- **Initials:** exactly three letters. Players may type either case; the client displays uppercase and the server uppercases before validating (`[A-Za-z]{3}` in, `[A-Z]{3}` stored). One set per player in the kit's `prefs`, shared by solo and rooms, set in a three-box picker on the title card. A browser that never sets any gets three random letters once.
- Existing solo rows and old-callsign rows are deleted when the database upgrades to schema step 5. The old score files are left where they are.
- `games/_kit/php/score-guard.php`, generalized from Cylon's `scores.php`: Origin/Referer allow-list; CSRF double-submit (cookie must match header); single-use, expiring run tokens; per-IP rate limits keyed by an HMAC of the IP; initials validation and blocklist; validated config. Cylon moves onto it with no behaviour change. Tankity's room endpoint uses it, with its rate limit counted in the SQLite `rate` table; `scores.php` is a read and answers every POST with 410.
- Rooms: the server computes and files every score itself; the client never sends one. It decides at the start of a match, from the humans seated then, whether the match is online or local; a human who leaves mid-match does not change that.
- A page from before this design that still POSTs a solo score gets the 410; it saves the run in its own browser, and the new page moves that run onto the local board.
- PHPUnit covers every guard rule (bad origin, missing or mismatched CSRF, reused or expired token, rate limit), a one-human room filing nothing online, a two-human room filing every human, and every POST to `scores.php` answering 410 with the board untouched.

## 9. Comments and docs

Each PR tightens the comments in the files it touches:

- Comments say why, never what the next line does, and never history ("kept from when…", "moved here in #NN").
- File headers are one to five lines: what the module is and what it must not touch. Architecture lives once, in the game's `README.md` and `_kit/README.md`.
- Long config preambles (`tsconfig`s) shrink to a pointer to the README. `game.yaml` keeps its per-field notes.
- The foundry `comment-review` pass runs on each PR.

`games/README.md` changes "each game folder is self-contained" to: a built game folder is self-contained; its source needs `_kit/`.

## 11. Installing each game, full screen, and leaving it

- Each game installs as its own app that opens straight into that game: the manifest asks for full screen (`display_override: ["fullscreen", "standalone"]`, `display: "standalone"` as the fallback, which is what iOS uses). Crete and Tankity start at their own page with scope `./`. Cylon starts at `../../index.html?game=cylon&app=1` with scope `../../index.html`, narrowed so the installed app stays in Cylon mode; it still runs over the home page, because marching over and hiding under page text is part of how it plays.
- Icons per game, generated by one script from one source drawing each (the tank under the moon, the maze, the Cylon eye): `any` 192 and 512, `maskable` 192 and 512 with the art inside the safe zone, a 180 px Apple touch icon, and a `monochrome` icon for Android's themed icons. `install-core.php` checks every icon's size and type, and `icons.mjs --check` (in each game's `test.sh`) fails when a drawing or the renderer changed without the icons being rendered again; the purpose of each icon is assigned by `INSTALL_ICONS`, not read back from the image.
- Every game has an exit:
  - Tankity: Menu → **Quit**. Cylon: the Game On toggle. Crete: a new **Quit** control (and key).
  - Exit closes the app where the platform allows a web app to close its own window (installed desktop Chrome and Edge, via `window.close()`).
  - Where it cannot (phones, a normal browser tab), exit ends the match, leaves full screen, and returns to the game's title card; an installed app on a phone also shows "Swipe the app away to close it".
  - The kit owns this as one helper (`app.ts`: `isInstalled()`, `enterFullscreen()`, `exitApp()`), so all three behave the same.
- **Install and Share buttons.** Each page game's site page (`/play/<id>/`) has Install and Share in its top bar, next to the game's name. The CIC's site page forwards to the home page, so its two buttons sit in its game bar there (`?game=cylon`). Install installs that one game:
  - Chrome, Edge, Android: the page holds back `beforeinstallprompt` (`preventDefault()`), and the button stays hidden until that event fires; a click calls `prompt()`. The button hides on `appinstalled`, and never shows in the installed app (display mode standalone or fullscreen, or iOS's home-screen app).
  - iPhone and iPad: there is no install API, so Install opens a small focus-managed dialog, "Tap Share, then Add to Home Screen", with the Share glyph; Escape closes it. iOS saves the page it is on, so on a site page Install first opens the game's own page (`games/<id>/?install`), which opens the dialog: the home-screen app is then the game, not the wrapper.
  - Browsers that cannot install (Firefox on the desktop, Safari on a Mac): no Install button.
  - `?install` on the address shows the page with Install highlighted, or on iOS opens the dialog. It never prompts by itself: browsers require a user gesture.
  - Whether Chromium offers the prompt on `/play/<id>/`, which links the game's manifest but lies outside its scope, is measured in a real browser before the buttons are built (Plan B Task 26). Where it does not, Install on a site page opens `games/<id>/?install`, and the game's page shows the same buttons.
  - Share calls `navigator.share({ title, url })` with the game's `/play/<id>/` address; without Web Share it copies the address and says "Link copied"; if the clipboard is blocked it shows the address in a selectable field. A cancelled share sheet is not an error.
  - The kit owns it: `install.ts` decides what to show, with the browser behind ports (the install event, `appinstalled`, the standalone check, the platform, `navigator.share`, the clipboard), and `ui/install-bar.tsx` draws it. Each page game ships it as `dist/install.js`, which both its site page and its own page load; The CIC bundles it.
- Tests: `games-pwa` checks each manifest's start URL, scope, display and icons; unit tests cover `exitApp()` for the closable, not-closable and browser-tab cases; each game's spec presses its exit and checks it returns to the title card in a browser tab. Unit tests cover every Install and Share branch (before and after the event, a click, `appinstalled`, standalone, iOS, no install, `?install`, Web Share, clipboard, the field, a cancelled share); `games-install` fires a synthetic `beforeinstallprompt` on each site page, opens the iOS dialog under an iPhone user agent, and checks the "Link copied" fallback; `site-game-pages`' test checks the generated pages carry the buttons.

## 12. Tankity storage

- Everything Tankity keeps lives in one SQLite database, `tankity.sqlite`, with the score guard's run store beside it: rooms (one row each, replacing SysV shared memory), the online boards and the per-address rate counts. Writers take turns through `BEGIN IMMEDIATE` and a 2 s busy timeout. A room's transaction covers only the step that changes it, never a sleep or a long poll, and a poll that changes nothing reads without it; a request that waits past the timeout answers "busy" and the client retries. A load test (8 rooms × 4 players polling) holds this to no 503s and a p95 under 300 ms. The shared-memory code, its `shm_key` / `TANKITY_SHM_KEY` setting and the ping's `store` report are removed.
- **Where:** the `data_dir` setting (`TANKITY_DATA_DIR`, or `.config.yaml`; the environment wins) names the directory. When set it is used exactly: created mode 0700 when missing, and an error ("store unavailable", logged) when PHP cannot write it, never a silent move elsewhere. When unset: `games/tankity/data/` if PHP can write there (PHP then writes `data/.htaccess`, `Require all denied`), else `/var/tmp/<username>-tankity/`, where `<username>` is `get_current_user()` (the owner of the running script, the account the site is deployed as; `uid<N>` when it cannot be resolved). A created directory is 0700 and its files 0600, from the kit's one file-mode helper (`Kit\StoreModes`), which Cylon uses too; a `/var/tmp` directory that is a symlink, belongs to another account or is open to group or others is refused. Who else can reach the data depends on the user PHP runs as, which the probe reports: as the deploying account, nobody; as a web user every site on the host shares, any other site's PHP can read and write it, as with Cylon's scores today.
- `data/` is never served (the `.htaccess` above; the local nginx denies `/games/tankity/data/`) and never deployed: `deploy.sh` never stages, uploads into, changes modes in or prunes it, and git ignores it.
- **Journal mode:** WAL when the directory is on a local filesystem (read from `/proc/self/mounts`), DELETE on anything else, including when the filesystem cannot be determined; chosen at run time, with a `journal_mode` setting to override. A read-only probe of the host (SQLite version, which directory PHP can write, each one's filesystem, and which user PHP runs as against the owner of the deployed files) runs before any of this ships.
- **Migration:** schema step 5 deletes the solo and old-callsign rows. The old score files are not imported.
- **Cleanup:** the host has no cron, so requests run housekeeping, at most once a minute, each job bounded: idle rooms, old rate counts, and temp files a dead writer left. Every job takes the clock as an argument, so tests use a fake one.

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
| 13b | Tankity battlefield fills the screen (6.6, 7.4): solo W from the landscape box, the field fitted with scenery, sky and dirt, the rotate hint; the sim and the server's sim take W as a parameter, rooms stay 720; sim vectors at 720, 1080 and 1440 | after 13, before 19's Tankity work and Plan D |
| 14 | Tankity armor rules (client, server, sim vectors) | |
| 15 | Tankity match end, scoreboards, Play again, auto-filed scores, a board per difficulty | after 20 |
| 20 | Tankity storage: one SQLite database (rooms off shared memory, scores), its location and the import of the old score files, cleanup on requests; host probe first | after 13 and 19, before 14 |
| 16 | Tankity: multiplayer-only board, solo scores in the browser, deterministic shared sim, faster drone aim, room guard | after 10 and 15 |
| 17 | Tankity music | |
| 19 | Install and exit: full-screen manifests, per-game icon sets (maskable, Apple, monochrome), kit `app.ts`, Quit in each game, Install and Share buttons (kit `install.ts`) after a real-browser probe of where Chromium prompts | after 5; Tankity's Quit lands with 12 if 12 is in flight |
| 18 | Typed tests: every remaining `*.test.mjs` becomes `*.test.ts` on `node:test` directly, and every PHP check script a real PHPUnit `TestCase`; each game's `tsconfig.test.json` (with `@types/node`) joins its `build.json` programs; the `check()` and `LegacyCheckCase` bridges are deleted | last; tests in any area a plan B–E PR touches are rewritten in that PR onto `node:test` as `*.test.mjs` (section 3), and this row renames them to `*.test.ts` with the rest |

After 6, the Crete line (7–9) and the Tankity line (11–17, with 13b after 13 and 20 in front of 14) touch different files and run in parallel worktrees; 14 and 17 are independent of each other, and 15 needs 20's database. Each implementing agent's job stays at about 20 minutes or less.

New specs and their budgets: `tankity-start`, `tankity-layout` (the eight-device measurement, plus chip centres within 1 px of their row; from 13b also no band of background between the status bar and the deck, the ground meeting each screen edge with no cut, the field filling the width in portrait, and W the same for a device's portrait and landscape boxes), `a11y` (axe-core over the title card, deck and open menu), each ≤ 15 s. Existing specs that use `#btn-menu`, `C`, `W`/`S`, `A`/`D` or `Q` change in the PR that changes those keys.

## Next: long games

After PR 16, rooms can be played over hours or days.

- The host sets the turn time on a 7-stop slider with a label: Lightning 1 min, 2 min (the default), 10 min, 30 min, 8 h, 24 h, 1 week. The host can change it mid-game.
- When a turn times out, a drone fires for that player.
- Closing the tab keeps your seat: a "Your games" list or the room link brings you back.
- A toast names the game that needs your turn, alongside the browser notification.
- A room closes after (humans × turn time) with nobody acting. There is no total-age cap.

## Done when

- Every PR above has landed and deployed, and its live check passed.
- `make test` stays within its budgets (static ≤ 15 s, unit ≤ 45 s) and the nightly run is green.
- No hand-written `.js` remains outside `dist/`, and no tool or helper is duplicated across the games.
- Every test file is TypeScript and type-checked by the build; no test runs through a bridge.
