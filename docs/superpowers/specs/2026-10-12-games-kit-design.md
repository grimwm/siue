# Games kit, bundling, and the Tankity/Crete/Cylon overhaul

Date: 2026-10-12
Status: built and live. This document describes what stands on `main`; section 10 lists the pull request each part landed in. Nothing here is waiting to be built: the small leftovers are in [the roadmap](../roadmap.md).
Mockups: [`2026-10-12-games-kit-mockups/`](2026-10-12-games-kit-mockups/) (open the `.html` files in a browser; `layout-all-devices.py` regenerates the device page and `layout-measure.mjs` is the overflow check the layout spec reuses). They show the design as it was drawn; where a mockup and this text differ (Esc, the gold keys), this text is right.

## Goal

Less code and more reuse across the games (`websites/www.cs/games/{crete,cylon,tankity,workroom}`) through a shared, documented kit; strict types everywhere; tests that give real confidence without slowing the PR loop; and a set of Tankity gameplay and interface rules.

## Constraints

- The host is the university's sftp-only PHP 8.4 server. Nothing can be installed or built there; what is deployed is static files plus the existing runtime PHP.
- Node (local and CI) and Composer (dev only) build and test. Their output is checked in.
- A *built* game folder works copied anywhere (it needs nothing outside itself at run time). A game's *source* needs `games/_kit/` beside it to rebuild.
- One PR at a time per line of work, each through CI, merge, deploy and a light live check, with a cache-busted play link reported.
- Agents run `make test` plus at most two browser specs locally; CI runs the selected specs in four shards.

## 1. The kit (`games/_kit/`)

One source of truth, never deployed. Games import from it by relative path and esbuild inlines what they use, so the only duplication is in the built bundles. There is no copy step and no per-game kit folder, with one exception: the kit's runtime PHP, which each game's install step copies into its own `server/` (`kit_php`), because the host never sees `_kit/`.

```
games/
  package.json            # esbuild, typescript (7), preact, tailwind, three; one npm ci for all games
  units.sh                # every unit test in the games, in one node --test run
  _kit/
    README.md             # each pattern below, named and explained
    build/build.mjs       # tsc --noEmit + esbuild bundle + stylesheets + --check
    build/icons.mjs       # every icon of a game, rendered from its one drawing
    build/tsconfig.base.json
    php/install-core.php  # yaml subset, manifest, icons, sw precache, page blocks, bundle hash, kit_php copies
    php/score-guard.php   # origin, CSRF, run tokens, rate limits, initials, file modes (section 8)
    php/store-dir.php     # where a game may keep its data, and how private (section 12)
    ports.ts              # Timers, Clock, Rng, StorageLike
    ports.browser.ts      # the real adapters
    prefs.ts              # typed, safe localStorage with subscriptions
    rng.ts                # the seeded generator
    keys.ts               # the back key (Q) every game shares
    audio/core.ts         # AudioContext lifecycle, unlock, mute, bus, envelopes
    audio-focus.ts, page-life.ts   # sound and timers when the page is away
    app.ts                # installed, full screen, and leaving (section 11)
    install.ts, install-page.ts    # Install and Share (section 11)
    initials.ts, blocked-initials.json   # three-letter initials and the one blocked list
    stats.ts, stats-page.ts        # the visitor-statistics beacon
    kit.css               # the looks the components share (the key chip)
    ui/                   # Preact: Dialog, Button, Panel, KeyChip, InstallBar, ShareIcon
    test/                 # node:test helpers: seeded rng, manual clock, recording hooks, DOM stub, fake audio, importTsx
```

`hub.php` skips folders without `metadata.yaml`, so `_kit/` never shows as a game. `deploy.sh` skips `games/_kit/**`.

| Module | Pattern | Replaced |
|---|---|---|
| `build/` | one parameterized build, configured per game by `build.json` | three `tools/ts-build.mjs` |
| `php/install-core.php` | configuration over code: pure functions plus a per-game config array | the `install_*` functions in three `tools/install-files.php` |
| `ports.ts` + adapters | Ports and Adapters: engines take `Timers`, `Clock`, `Rng` and `StorageLike`; the page wires browser adapters, tests wire fakes | each game's private copies of these types |
| `prefs.ts` | a typed store with Observer subscriptions; every access in try/catch with defaults | scattered `localStorage` calls |
| `audio/core.ts` | Facade over Web Audio; games register named voices (Strategy) | the plumbing in three `audio.ts` files; voices and music stay per game |
| `ui/` | Preact components | Tankity's own primitives and Cylon's hand-built overlays |
| `test/` | test doubles for `node:test` | hand-rolled `check()` helpers |

Left out on purpose: a generic state machine (only Tankity's `flow.ts` needs one) and any shared simulation (the games share no mechanics).

## 2. Build and delivery

- `node games/_kit/build/build.mjs <game>` reads the game's `build.json`: its type-check `programs`, its `entries` (each `{ "in", "out", "format" }`; Tankity's are `main`, `fx`, `fx-editor`, `install`, `stats` and `pow-bench`), and where a game needs them `versions`, `css`, `kitCss` and `inlined`. Then it:
  1. type-checks with `tsc --noEmit` (TypeScript 7), three or four programs per game: the DOM-free program for engines and sims, the DOM program for the rest, a worker, check or crypto program where the game has one, and `tsconfig.test.json` for its unit tests. All extend `tsconfig.base.json` (strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `erasableSyntaxOnly`, `allowImportingTsExtensions`);
  2. bundles each entry with esbuild (pinned version, ES2022, minified, `react-jsx` with Preact) to `<game>/dist/<name>.js` plus `.js.map`, and writes `dist/kit.css`, a game's own stylesheet and fonts, and `THIRD_PARTY_LICENSES.txt`, all checked in;
  3. with `--check`, builds again in memory and fails on any byte difference from `dist/`.
- Every hand-written browser file is TypeScript under `src/`: Tankity `src/main.ts` and `src/fx/{engine,editor}.ts`; Cylon `src/main.ts`; Crete `src/main.ts`.
- Imports use `.ts` extensions, so Node runs the unit tests straight from `src/` (CI is on Node 24 LTS).
- Cache busting: each page references `dist/main.js?v=<hash>`, `game.css?v=<hash>` and its other bundles the same way, written by `install-core.php`; `sw.js` precaches the bundle, its CSS and assets; `tools/site-versions.php` hashes `cylon/dist/main.js` for the home page.
- There is no per-import `?v=` rewriting, no Preact import map, no `tankity/vendor/`, no per-game `package.json` or lockfile, and no module list in `sw.js`.
- Deploy ships `dist/*.js` and `.map`; it skips `src/`, `_kit/`, `build.json`, `node_modules`, `vendor/` (Composer), `composer.*` and `phpunit.xml`, and never stages anything under `games/tankity/data/` (section 12).

## 3. Testing and when it runs

| Tier | What | Where | Budget |
|---|---|---|---|
| Static | `tsc --noEmit`, `build.mjs --check`, and each game's `test.sh` (`install-files --check`, `icons.mjs --check`, and Tankity's `game-json.php --check` and `pow-vectors.php --check`) | `make test`, CI `units` | ≤ 15 s |
| Unit | `games/units.sh`: one parallel `node --test` over the kit's and every game's `*.test.ts`; PHPUnit suites | `make test`, CI `units` | ≤ 45 s |
| E2E, selected | Playwright specs chosen by `select.ts` from changed files | CI per PR (4 shards); locally ≤ 2 specs | as today |
| Nightly | every spec, plus slow sweeps (Tankity's hit rates at five field widths, the full `AiArcsTest` sweep) | CI cron on `main` | none; GitHub emails on failure |

- PHPUnit (^12) via `websites/www.cs/composer.json`, dev only. `phpunit.xml` has one suite per game plus `site`, `kit` and `tankity-docker` (the suites that need the running stack); each game's `test.sh` runs its suite. Every PHP check is a real `TestCase`.
- Two play specs every change must keep green: `crete-play` (the puzzle game, driven through its buttons, keys and `window.__creteTest`) and `cylon-play` (start, destroy a unit, an ability, game over, score submit; a 90 s limit). They use Playwright's `page.clock`.
- `select.ts` maps `games/_kit/**` to ALL specs, except files no browser runs, which select nothing on their own:
  - the kit's own tests, test helpers and docs (`_kit/README.md`, `_kit/test/`, `_kit/php/tests/`, `_kit/build/build.test.ts`, `_kit/build/fixture/`, `_kit/tsconfig.test.json`, `_kit/test.sh`), and each game's `test/` and `tsconfig.test.json`: unit tests cover them;
  - the icon renderer, `_kit/build/icons.mjs` and its test: it runs only when an icon drawing changes, and the PNGs it writes fall under each game's own rule;
  - `_kit/php/score-guard.php`: it reaches a browser only as the copy each game commits in its `server/` (`kit_php`), and that copy selects its own game's specs. The rest of the kit's PHP (`install-core.php`) writes every game's pages and stays ALL.
- Every unit test is a `node:test` file named `*.test.ts`, type-checked by its game's `tsconfig.test.json`; components load through the kit's `importTsx`. The browser specs, `select.ts` and `shard.ts` are TypeScript too. No test runs through a bridge, and `_kit/test/typed-tests.test.ts` fails the run if one comes back.

## 4. Crete

Crete has no random mazes and so no maze rule: it is a puzzle game of hand-built and generated levels proved by a solver. Its design is [`2026-10-16-crete-redesign-vision.md`](2026-10-16-crete-redesign-vision.md) and its rules for levels are in the Crete README. It still stands on the kit: the build, the audio core, the UI components, `app.ts`, and Install and Share.

## 5. Cylon and Crete overlays

Cylon's overlays are kit `ui/` components (`board`, `help`, `gameover`, `settings`). Crete's cards are Preact components on the kit's `Dialog` and `Button`. Gameplay must not change under a change to the kit: `cylon-play` and `crete-play` stay green through every PR that touches them.

## 6. Tankity interface

### 6.1 Starting a game

- On load the demo plays dimmed behind a title card: **▶ Play** (solo, random seed) with **Share** beside it, **Play with Friends** (Rooms), **Tutorial**, a **Settings** link, the 3-letter initials picker (section 8) and, when the player has seats in rooms, a **Your Games** list. The card returns after a match ends and after leaving a room. Mockup: `title-card.html` (option A).
- The menu is settings only: unit, seed (with **Play This Seed**), text size, theme, Difficulty (how well the drones aim; a change waits for the next match, and a room uses its host's), walls, sound, music (with Next Song on phones), fullscreen, flashes, scores, **Quit** (section 11), and, in a room, the turn time, turn alerts, **Standings** and **Leave Room**. It opens from a labelled **☰ Menu** button or **Q**, and Q closes it again.

### 6.2 Layout (every screen)

Mockups: `controls-and-key-chips.html` (desktop deck and chips), `layout-all-devices.html` (eight devices, solo and room, worst-case values).

- **Status bar on top**, in this order: Menu (with an inline `Q` chip), angle, power, fuel, **AMMO** pill (orange), **ARMOR** pill (green), **lives** pill (pink, always `♥ N`, `aria-label="N lives"`), **WIND** pill, and the **match badge**, one segmented outline: `$cash | ROUND n | score PTS` in solo, `ROOM code | YOU seat | ROUND n` in a room.
- **Battlefield** in the middle, touching the status bar and the deck and running to the frame's sides (section 6.6). Chatter is a one-line toast. The wind badge is not in the sky.
- **Control deck** below, in labelled groups: **Aim** (barrel and power arrows, every arrow says which, and the game-speed button), **Drive (uses fuel)** (Left, Right), **More** (Radio, Next Song, Help), **Weapon** (the gun's name over "34 dmg · M", as tall as its neighbours; G opens the picker), and a large rounded-rectangle **FIRE**. Damage is the gun's `dmg`; blast size S/M/L comes from its `radius`, with the cut-offs in one tested function (`weapon-label.ts`); beams, earth and fire weapons say what they are instead of a size.
- **Portrait phone:** the same deck without group headings; Shell sits directly on FIRE, its top level with ▲; Next Song moves to the Menu. The status bar has three rows: Menu and aiming numbers; the four pills; the full-width match badge.
- **Landscape phone:** controls float over the battlefield's lower corners. Arrow keys there are a translucent tint of the player's theme colour (`rgba(var(--accent-rgb), .55)`; the default theme is orange) with white text and a dark halo; other buttons keep their solid style. Shell stacks above FIRE with a clear gap. Radio, Help and Next Song move to the Menu.
- **Desktop and portrait** arrow keys stay solid, in the theme colour.
- Phones hide the page header; every phone tap target is ≥ 44 px.
- Breakpoints (container width): ≤ 1100 px short labels (ANG, PWR, ARM, RND); ≤ 860 px an 11 px bar; ≤ 760 px no key chips. Nothing in the status bar may wrap or clip at the worst-case values (angle 162°, power 100, fuel 100, ♥ 5, $12,450, round 13, 98,760 pts) on: 1280×720, 1024×640, 1180×820, 820×1180, 393×852, 360×740, 852×393, 740×360.

### 6.3 Keys

`game.yaml` is the single source; `input.ts`'s fallback table mirrors it.

- ←/→ swing the barrel; ↑/↓ change power; **Shift+←/→ drives**.
- Space or Ctrl fires; G opens the weapon picker (I filters it to what is in stock); **Q is the back key**: it closes whatever is open and, with nothing open, opens the Menu.
- L radio, ] next song, H help, M music, E sound, F fullscreen, X game speed, R scores, T random hills, O rooms, N a new match on the seed's hills, U tutorial, V the firing range.
- In the shop: ↑/↓ choose a row and ←/→ a quantity, B or Enter buys, 1–9 buy a row, V or P previews, N goes on, Q closes. Long panels scroll with J, K, PageUp and PageDown.
- **Esc is bound nowhere, and `game.yaml`'s check refuses it:** Safari and Firefox always leave full screen on Esc, whatever the page does. **W, A, S, D and C are bound in no context.** There is no next-weapon command.
- Key chips: the kit's one style (`kit-key-tab` in `kit.css`), a dark keycap (`#14183a`) with light text, a fixed-height flex box centred on its label; shown only under `(hover: hover) and (pointer: fine)`; text read from the key table. Help lists every key.

### 6.4 Accessibility

Visible labels match each `aria-label` (WCAG 2.5.3); `aria-expanded` on everything that opens a panel; focus moves into the title card and the menu and returns on close; the translucent landscape keys pass contrast.

### 6.5 Music

- Sixteen CC0 tracks in a 16-bit action/chiptune style. Battle Theme A is first (the theme).
- Only tracks whose source page states CC0 in its license field; each page's URL is in `audio/CREDITS.md`.
- `audio/music/build_music.sh` downloads sources pinned by SHA-256, transcodes to 80 kbps stereo mp3 with metadata stripped, and normalizes loudness (EBU R128) to one target, −14 LUFS. No track carries its own `volume`.
- Pressing Next Song shows a toast "♫ Title · Author"; a track that starts by itself shows none.
- A unit test checks that `game.yaml`, `CREDITS.md` and `audio/music/` agree.

### 6.6 The battlefield fills the screen

Landscape is the preferred way to play. Portrait is allowed and looks as finished. There are no black bars anywhere, and no terrain is cut off sharply where it shows.

- **No bars.** The canvas fills the battlefield box, which touches the status bar and the deck and runs to the frame's sides. Nothing between the status bar and the deck shows the page's background.
- **The field's width W.** The field is always 460 world units tall. A room's is 720 wide, the same for everyone. A solo match's is set at the deal: W = 460 × long side ÷ short side of the battlefield box in landscape, clamped to 720–1440 and rounded to a whole number of 24-unit terrain columns. Demo, tutorial and Play Again deal the same way.
- **Map sizing never depends on portrait.** On every device (desktop, tablet or phone), W comes only from the battlefield box's landscape shape. On a device held in portrait, that is the box the device would give in landscape, with the viewport's long side as its width. The box is computed from the viewport, never measured, so both orientations give the same W:
  - when the short side is 500 px or less (the landscape-phone layout), the box is (long − 10) × (short − 75);
  - otherwise it is min(long − 18, 1118) × (short − 294).

  `tankity-layout` checks that this is within 2 px of the measured box on every landscape device. For example, 1280×720 gives 1200; 1024×640 gives 1344; 1180×820 and 820×1180 give 984; 852×393 and 393×852 give 1224; 740×360 and 360×740 give 1176.
- **W is fixed for the match.** Resizing, rotating or going full screen mid-match only rescales the view. The next match takes the new W. Portrait only scales and frames the landscape field (sky above, dirt below, the rotate hint) and never changes the map.
- **Fitting the field.** The field is scaled by s = min(box width ÷ W, box height ÷ 460).
  - A box wider than the field (a room, a clamped W, or full screen) centres the field. The hills continue past both edges as scenery.
  - A taller box (portrait) spans the field across the full width. The night sky, with its stars, clouds and moon, fills the space above, up to the status bar; it takes 60 % of the leftover height. The dirt and its layers fill the rest below, down to the deck. It reads as one picture, not a box.
- **Scenery.** The hills past the field's edges are drawn from the same terrain generator, continuing the same seed's hills. The generator is a sum of three sines, evaluated past the edges. Next to each edge the scenery eases from the field's current edge height over max(48, |difference|) px, so a crater at the edge leaves no cliff. At the seam the scenery adds no step greater than 1 px beyond the hills' own slope. It is dimmed and desaturated. It is not hittable and not part of the sim: a shell that leaves the field flies on over the scenery and is out of play. A room's snapshot carries the round's nine hill numbers, so rooms draw the same scenery.
- **Rotate hint.** In portrait, a small dismissible chip says "Turn sideways for the full battlefield". It shows at the start of each portrait match until it is dismissed, and dismissing it is remembered as a kit `pref` (`tankity-rotate-hint`). It never shows in landscape.
- **Fair at any width.** The extra width is part of the fight, and shots get longer.
  - Terrain: the same nine draws make the hills, and W columns are filled. The first 720 columns of a wide field are exactly the 720 field of the same seed.
  - Placement: the units spawn spread over the whole width (30 to W − 30) and face the middle of the field. Neighbours always start at least 110 apart, which is more than the largest blast radius (70) plus a hull's half-width (20), so no unit starts inside another's blast.
  - Reach: shots fly √(W ÷ 720) times faster, so a trajectory's range and height grow by W ÷ 720 and full power still crosses the field. Flights last √(W ÷ 720) times longer too, so the 12 s flight cap, in the sim and in `simShot`'s step bound, is multiplied by the same factor. On a 720 field the factor is exactly 1. A press changes power by 720 ÷ W, and the status bar shows one decimal on a wide field.
  - Wind: the range is unchanged (±8 at the deal, ±12 at most). Drift grows with the flight time squared, which grows by W ÷ 720 like the range, so wind bends a shot by the same share of its length at any width (pinned within 2 %).
  - The drone AI searches the same angle and power grid, with out of bounds at W, and drives within the field. A degree or a power point moves a faster shell further, so the drones' wobble tightens per width. A table (`FIELD_AIM`, measured with `ai-measure`, the same in `src/ai.ts` and `server/ai.php`) scales the ranging wobble and the bracket's floor: 1 and 1 at 720, 0.75 and 0.55 at 1080, 0.55 and 0.4 at 1440, straight-line between those points.
  - Pinned by the measured hit rates. At 720, 1080 and 1440, Normal stays within 5 points of its targets (ranging 10/15/25 %, after two corrections 25/40/55 % at rounds 1/5/10), Easy within 5 points of half of Normal, and Hard at least Normal. The nightly run adds 912 and 1200.

## 7. Tankity rules

### 7.1 Armor

- Max armor = 100 + 25 × hull plates fitted. Fitting a plate raises the max and adds 25 armor.
- Damage carries over between rounds: a round starts with the armor the last one ended with.
- Repair +40 restores up to max, never beyond. The shop greys it out at full armor and states what it would restore ("Restores 15 (you're at 160 of 175)"). Nothing is banked.
- Losing a life: the next round starts in a fresh tank at full max armor; plates stay fitted.
- The ARMOR pill shows current armor; hover and screen readers give "160 of 175".
- The browser's rules (`src/armor.ts`, `src/solo.ts`, `src/buy.ts`) and `server/rules.php` change together; shared sim vectors cover carry-over, a capped repair, a plate, and death then re-muster.

### 7.2 Match end

- Solo is endless and ends at ♥ 0; there is no round limit.
- A tank left over a crater falls while shells are still flying, and a later shell of the same volley meets it where it has fallen to. The war (a drone's aim, the flight, the falls) runs in fixed 1/60 s steps, each dropping the tanks and then moving the shells, so play is the same at any frame rate.
- The simulation computes the same bits in the browser and on the server: every `sin`, `cos` and `atan2` it uses comes from one deterministic module per language (`src/detmath.ts`, `server/detmath.php`), built only from `+ − × ÷` and `floor`, with halves rounding toward +∞ on both sides. The room server's sim and the browser's share it bit for bit, so a room's aim preview and its shot agree; shared vectors check it without tolerance. Rendering may use the platform's math.
- A room match needs two or more humans at Start. It ends when only one human has lives left. That human wins and gets a winner's bonus (the round bonus × 2), which the server computes and the snapshot carries.
- With one human seated, Start makes no server match: the lobby closes and the browser plays the match as solo, on the room's difficulty, speed and walls.
- The 40-turn watch cap (`WATCH_TURNS`) stays.
- Sim vectors cover the last-human-standing rule.

### 7.3 Scoreboards (this match only)

Mockup: `scoreboards.html`.

- After every round, at the top of the shop: score (with this round's gain), rounds won, kills, lives or "out in round N". Rows sort by score; eliminated players stay listed, greyed.
- Match over: "♛ XYZ wins: last tank standing", final standings, **Play Again (Same Room)** (back to the lobby with the same code and seats; lives, scores and cash reset, and the host presses Start) and **Leave Room**, and "Filed · #12 all-time on Normal" when the score places.
- You're out: the same table with **Watch the Finish** and **Leave Room**; while watching, Menu → Standings shows it.
- Solo: a table of your rounds so far (points, kills, cash, lives, total); at game over it heads the end card, which says where the run was saved ("Saved on this browser's board · #3 on Normal").

### 7.4 Field width on the server

- The server's simulation takes the field width W as a parameter wherever it would assume 720 (terrain, placement, shot speed, out of bounds, the drone AI's wobble). Rooms pass 720, where every factor is exactly 1.
- W is a browser-only solo deal.
- Shared sim vectors at W = 720, 1080 and 1440 (terrain, placement, shot speed, out of bounds, a drone's aim with the width's tightened wobble) are checked bit for bit in both TypeScript and PHP.

### 7.5 The arsenal, falls and drones

- The arsenal is Tankity's own guns plus the Scorched Earth classics in four families (blast, beams and tracers, earth, fire). Every mechanic is an `effect` with its own fields in `game.yaml`, computed the same in the browser (`src/sim.ts`, `src/earth.ts`, `src/fire.ts`) and on the server. `game.yaml` holds every number; the plan that added them is [`2026-10-13-tankity-se-arsenal.md`](../plans/2026-10-13-tankity-se-arsenal.md).
- A tank whose ground is shot away falls straight down and takes fall damage, credited to whoever fired; parachutes are gear that softens it (the `fall` block in `game.yaml`).
- Every gun sells from round one: there are no round unlocks. Drones earn and buy like players, each with its own shopping habits.

## 8. High scores

- Scores file themselves the moment a match ends. There is no form or button.
- **Two boards.** The online board holds only room matches: one all-time board per difficulty (Easy, Normal, Hard), each keeping its best 100 runs, on the difficulty the room's host chose. Solo matches, including a one-human Start from a lobby, are local: they save on this browser's board, the best 20 per difficulty, in `localStorage`, and never reach the server. Menu → Scores opens on the player's current difficulty with a switcher to the other two, and shows both lists for it, the online board and this browser's, with your entries highlighted.
- **Initials:** exactly three letters. Players may type either case; the client displays uppercase and the server uppercases before validating (`[A-Za-z]{3}` in, `[A-Z]{3}` stored). One set per player in the kit's `prefs` (`tankity-initials`), shared by solo and rooms, set in a three-box picker on the title card. A browser that never sets any gets three random letters once. The blocked list is one kit file, `_kit/blocked-initials.json`, read by the PHP guard and by `_kit/initials.ts`.
- `games/_kit/php/score-guard.php`, generalized from Cylon's `scores.php`: Origin/Referer allow-list; CSRF double-submit (cookie must match header); single-use, expiring run tokens; per-address rate limits keyed by an HMAC of the address (an IPv6 address by its /64); initials validation and blocklist; validated config. Cylon runs on all of it. Tankity uses the guard for the origin check, the address key and initials; its rooms count each address's creates and joins in the SQLite `rate` table, and `scores.php` is a read that answers every POST with 410.
- Rooms: the server computes and files every score itself; the client never sends one. A human who leaves mid-match is not filed.
- A page from before this design that still POSTs a solo score gets the 410; it saves the run in its own browser, and the new page moves that run onto the local board.
- PHPUnit covers every guard rule in the kit's suite (bad origin, missing or mismatched CSRF, reused or expired token, rate limit), and in Tankity's a two-human room filing every human and every POST to `scores.php` answering 410 with the board untouched.

## 9. Comments and docs

Each PR tightens the comments in the files it touches:

- Comments say why, never what the next line does, and never history ("kept from when…", "moved here in #NN").
- File headers are one to five lines: what the module is and what it must not touch. Architecture lives once, in the game's `README.md` and `_kit/README.md`.
- Long config preambles (`tsconfig`s) are a pointer to the README. `game.yaml` keeps its per-field notes.
- The foundry `comment-review` pass runs on each PR.

`games/README.md` says: a built game folder is self-contained; its source needs `_kit/`.

## 10. Where each part landed

| Part | Pull requests |
|---|---|
| Characterization specs and the nightly run; PHPUnit | #70, #71 |
| Kit core; Crete, Cylon and Tankity on it | #73, #74, #75 |
| Kit audio core; kit `ui/`; Cylon's overlays | #79, #80, #82 |
| Kit `score-guard.php`; Cylon on it | #81 |
| Tankity keys and chips; title card and settings-only menu; layout; battlefield fills the screen | #83, #85, #86, #90 |
| Install and exit, icons, Install and Share | #89 |
| Tankity storage; armor; match end and scoreboards; multiplayer-only board and the deterministic sim | #93, #94, #97, #100 |
| Q as the back key in every game | #98 |
| Fall damage and parachutes; the Scorched Earth arsenal | #102; #105, #108, #109, #111 |
| Long games | #106 |
| Tankity music | #107 |
| Typed unit tests; typed browser specs | #110, #112–#116, #118; #139 |
| Room limits: local start, the puzzle and 6-character codes, the disk guard | #135, #136, #137, #142 |
| No round unlocks; drones on a budget | #141, #146 |

## Long games

Rooms can be played over hours or days.

- The host sets the turn time on a 7-stop slider with a label: Lightning · 1 min, 2 min (the default), 10 min, 30 min, 8 h, 24 h, 1 week. The host can change it mid-game; it applies from the next turn.
- When a turn times out, a drone fires one shot for that player, who keeps the seat.
- Closing the tab keeps your seat: the **Your Games** list or the room link brings you back.
- A toast names the game that needs your turn. Browser notifications come too once the player turns Turn Alerts on.
- A started room closes after max(600 s, humans × turn time) with no human taking a turn; only turn-moving acts count. A lobby closes 600 s after its last touch, and a finished match 600 s after it ends. There is no total-age cap.

## 11. Installing each game, full screen, and leaving it

- Each game installs as its own app that opens straight into that game: the manifest asks for full screen (`display_override: ["fullscreen", "standalone"]`, `display: "standalone"` as the fallback, which is what iOS uses). Crete and Tankity start at their own page with scope `./`. Cylon starts at `../../index.html?game=cylon&app=1` with scope `../../index.html`, narrowed so the installed app stays in Cylon mode; it still runs over the home page, because marching over and hiding under page text is part of how it plays.
- Icons per game, generated by one script from one source drawing each (the tank under the moon, the maze, the Cylon eye): `any` 192 and 512, `maskable` 192 and 512 with the art inside the safe zone, a 180 px Apple touch icon, and a `monochrome` icon for Android's themed icons. `install-core.php` checks every icon's size and type, and `icons.mjs --check` (in each game's `test.sh`) fails when a drawing or the renderer changed without the icons being rendered again; the purpose of each icon is assigned by `INSTALL_ICONS`, not read back from the image.
- Every game has an exit:
  - Tankity: Menu → **Quit**. Cylon: the Game On toggle. Crete: Menu → **Quit This Run**. None has a key of its own. In Tankity and Crete, Q, the back key, opens the menu; Cylon's toggle is a button on its game bar.
  - Exit closes the app where the platform allows a web app to close its own window (installed desktop Chrome and Edge, via `window.close()`).
  - Where it cannot (phones, a normal browser tab), exit ends the match, leaves full screen, and returns to the game's title card; an installed app on a phone also shows "Swipe the app away to close it".
  - The kit owns this as one helper (`app.ts`: `isInstalled()`, `enterFullscreen()`, `exitApp()`), so all three behave the same.
- **Install and Share buttons.** Each page game's site page (`/play/<id>/`) has Install and Share in its top bar, next to the game's name. The CIC's site page forwards to the home page, so its two buttons sit in its game bar there (`?game=cylon`). Install installs that one game:
  - Chrome, Edge, Android: the page holds back `beforeinstallprompt` (`preventDefault()`), and the button stays hidden until that event fires; a click calls `prompt()`. The button hides on `appinstalled`, and never shows in the installed app (display mode standalone or fullscreen, or iOS's home-screen app).
  - iPhone and iPad: there is no install API, so Install opens a small focus-managed dialog, "Tap Share, then Add to Home Screen", with the Share glyph; Q closes it. iOS saves the page it is on, so on a site page Install first opens the game's own page (`games/<id>/?install`), which opens the dialog: the home-screen app is then the game, not the wrapper.
  - Browsers that cannot install (Firefox on the desktop, Safari on a Mac): no Install button.
  - `?install` on the address shows the page with Install highlighted, or on iOS opens the dialog. It never prompts by itself: browsers require a user gesture.
  - Chromium offers the prompt on `/play/<id>/`, which links the game's manifest but lies outside its scope; that was measured in a real browser and is recorded as `OUT_OF_SCOPE_PROMPTS` in `install.ts`. So Install on a site page prompts right there.
  - Share calls `navigator.share({ title, url })` with the game's `/play/<id>/` address; without Web Share it copies the address and says "Link copied"; if the clipboard is blocked it shows the address in a selectable field. A cancelled share sheet is not an error.
  - The kit owns it: `install.ts` decides what to show, with the browser behind ports (the install event, `appinstalled`, the standalone check, the platform, `navigator.share`, the clipboard), and `ui/install-bar.tsx` draws it. Each page game ships it as `dist/install.js`, which both its site page and its own page load; The CIC bundles it.
- Tests: `games-pwa` checks each manifest's start URL, scope, display and icons; unit tests cover `exitApp()` for the closable, not-closable and browser-tab cases; each game's spec presses its exit and checks it returns to the title card in a browser tab. Unit tests cover every Install and Share branch (before and after the event, a click, `appinstalled`, standalone, iOS, no install, `?install`, Web Share, clipboard, the field, a cancelled share); `games-install` fires a synthetic `beforeinstallprompt` on each site page, opens the iOS dialog under an iPhone user agent, and checks the "Link copied" fallback; `site-game-pages`' test checks the generated pages carry the buttons.

## 12. Tankity storage

- Everything Tankity keeps lives in one SQLite database, `tankity.sqlite`: rooms (one row each), the online boards, the per-address rate counts and the spent room puzzles. Writers take turns through `BEGIN IMMEDIATE` and a 2 s busy timeout. A room's write transaction runs from its load to its unlock and never spans a sleep or a long poll, and a poll that changes nothing reads without it; a request that waits past the timeout answers "busy" and the client retries. A load test (8 rooms × 4 players polling) holds this to no 503s, with a p95 ceiling of 1000 ms as a second, softer check. There is no shared-memory code.
- **Where:** the `data_dir` setting (`TANKITY_DATA_DIR`, or `.config.yaml`; the environment wins) names the directory. When set it is used exactly: created mode 0700 when missing, and an error ("store unavailable", logged) when PHP cannot write it, never a silent move elsewhere. When unset: `games/tankity/data/` if PHP can write there (PHP then writes `data/.htaccess`, `Require all denied`), else `/var/tmp/<username>-tankity/`, where `<username>` is `get_current_user()` (the owner of the running script, the account the site is deployed as; `uid<N>` when it cannot be resolved). A created directory is 0700 and its files 0600. The kit holds these rules once (`Kit\StoreDir` in `store-dir.php`, with the file modes from `Kit\StoreModes`), and Cylon and Crete's bank use them too; a `/var/tmp` directory that is a symlink, belongs to another account or is open to group or others is refused. Who else can reach the data depends on the user PHP runs as: as the deploying account, nobody; as a web user every site on the host shares, any other site's PHP can read and write it.
- `data/` is never served (the `.htaccess` above; the local nginx denies `/games/tankity/data/`) and never deployed: `deploy.sh` never stages, uploads into, changes modes in or prunes it, and git ignores it.
- **Journal mode:** WAL when the directory is on a local filesystem (read from `/proc/self/mounts`), DELETE on anything else, including when the filesystem cannot be determined; chosen at run time, with a `journal_mode` setting to override.
- **Schema:** eight steps, each run once in its own transaction. Step 5 keeps only the rows rooms filed and drops the old callsign tables; steps 6 to 8 give each room its closing time, its host's address, and its phase, last act and turn time, so the sweep and the limits stay plain SQL. The old score files are not imported.
- **Room limits:** there is no count of rooms. A new lobby is refused only when the data has reached `room_db_max_mb` (256); each address is limited in the lobbies it holds, the matches it hosts and the rooms it creates and joins an hour; creating or joining a room costs the browser a small proof-of-work puzzle; and room codes are six characters.
- **Cleanup:** the host has no cron, so requests run housekeeping, at most once a minute, each job bounded: idle rooms, spent puzzles and old rate counts. Every job takes the clock as an argument, so tests use a fake one.

## Standing rules

- `make test` stays within its budgets (static ≤ 15 s, unit ≤ 45 s) and the nightly run is green.
- No hand-written browser `.js` exists outside `dist/`. The only hand-written JavaScript is build tooling that Node runs (`_kit/build/build.mjs`, `_kit/build/icons.mjs`, `crete/tools/modern-icons.mjs` and the site's `tools/ts-build.mjs`).
- Every test file is TypeScript and type-checked by the build; no test runs through a bridge.
- New specs keep their budgets: `tankity-start`, `tankity-layout` (the eight-device measurement, chip centres within 1 px of their row, no band of background between the status bar and the deck, the ground meeting each screen edge with no cut, the field filling the width in portrait, and W the same for a device's portrait and landscape boxes) and `tankity-a11y` (axe-core over the title card, deck and open menu), each ≤ 15 s.
