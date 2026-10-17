# The Island of Crete

A text-based chase on a seeded 15 x 15 maze. You move once per turn, the creature twice; reach the exit alive. The page is one frame: a status bar (HP, Turns, Pages, Score, Fuses, Bash, the Minotaur's distance, Menu), the maze, and a control strip (the move pad, Hint, Route, Auto, Bash and the three tools with their counts), each button with a key tab. Arrows or WASD move, Space bashes, Z/X/C use tools, H hints, V shows the route, T plays itself, M mutes, N starts a new run, and Q opens the menu and closes whatever is open. Esc is never bound. The seed is in the address (`?seed=`), so a link replays a maze. A hidden tab pauses the play-through and the hint fade, and showing it again resumes them.

It is a `play` game: the folder is a complete page (`index.html`) with its own PWA files, and the site wraps it in `play/crete/` without the game knowing.

## Files

- `index.html`, `game.css`: the frame markup and its style (status bar, maze, strip, toast, cards, the phone layouts).
- `src/main.ts`: the entry. It wires the modules together, starts a run behind the title card, keeps the sound and full-screen settings, and exposes `window.__mazeTest` for the browser specs.
- `src/engine.ts`, `src/audio.ts`, `src/ui.ts`: the typed modules (below).
- `src/keys.ts`, `src/layers.ts`, `src/status.ts`, `src/fit.ts`, `src/help.ts`, `src/settings.ts`: the DOM-free page helpers (below). `src/notes.ts`, `src/install-slot.ts`: the words for a full-screen toggle that did not go, and the title card's install bar.
- `dist/`: the esbuild bundle (`main.js`, `main.js.map`), checked in and served as it is: the host has no Node.
- `build.json`, `tsconfig.json`, `src/tsconfig.dom.json`: the build and its two type programs.
- `test/`: the unit and static suites, TypeScript on `node:test`; `tsconfig.test.json` type-checks them, so `build.mjs crete --check` fails on a type error in a test. `../units.sh` runs them with every other game's; `test.sh` runs the build checks.
- `tools/install-files.php`: Crete's config for `../_kit/php/install-core.php` (manifest, service worker, install block, `?v=` versions).
- `metadata.yaml`: the Games-page card and install colours.

## Source layout and build

`index.html` loads `dist/main.js` with `<script type="module">`. The patterns shared with the other games are in `../_kit/README.md`.

```
cd .. && npm ci                            # once, in games/
node ../_kit/build/build.mjs crete         # type-check src/ and bundle into dist/
node ../_kit/build/build.mjs crete --check # fail if dist/ is missing or stale
php tools/install-files.php                # then rewrite the ?v= versions and sw.js
```

| Module | What it holds | Program |
| --- | --- | --- |
| `grid` | cells, keys and the breadth-first searches | DOM-free |
| `bots` | the dasher and the strategist: each names one action for a game | DOM-free |
| `engine` | seeded RNG and the per-attempt streams, maze generation and the maze rule, the run's state and every rule (moves, items, bash, waiting, the chase, hint, route, play-through) | DOM-free |
| `audio` | the Web Audio synth and the mute switch | DOM lib |
| `ui` | drawing the board, toast and cards, choosing what the ending says; keys and clicks | DOM lib |
| `keys`, `layers`, `status`, `fit`, `help`, `settings` | the key table (which keys do what, and what every key tab and help line prints), the stack of open cards and the Q rule, the status bar's words, the largest whole-pixel maze cell that fits, the "How to play" lines, the sound and full-screen preferences on the kit's `pref` | DOM-free |
| `ui/status.tsx`, `ui/strip.tsx`, `ui/menu.tsx`, `ui/story.tsx`, `ui/title.tsx`, `ui/end.tsx` | the status bar, the control strip, the menu, the story card, the title card and the ending card, drawn with the kit's `Dialog`, `Button` and `KeyChip`; `ui.ts` hands them a finished view | DOM lib |

## Layout

The frame (`#frame`, a size container) fills the window and stacks the status bar (`#status-root`), the maze (`#board`, with a one-line toast over its foot that shows the newest log line and fades) and the control strip (`#strip-root`). `fit.ts` picks the largest whole-pixel cell that fits the board, and `ui.ts` sets it as `--cell` on every resize. The title, menu, story and ending cards are inside the frame, so full screen keeps them. A key tab is the kit's `.kit-key-tab`; it shows only with a mouse and a frame at least 760 px wide. A portrait phone stacks the status bar in two rows and puts the strip under the maze; a landscape phone puts the pad and the actions in the margins left and right of the maze. `crete-layout.spec.ts` measures ten screens: no page scroll, every control on screen, no control over the maze, at least 8 px per cell.

## Cards, Q and settings

The cards are a stack (`layers.ts`): title, menu, story, ending. Only the top one shows. Q (the kit's `isBackKey`) closes the top card; with nothing open it opens the menu; the title card ignores it. A run's end opens the ending card over the title card, so Q reveals the title card. While a card is up only Q, N and M reach the game. Q typed into the seed box is a letter. Esc is never bound and never leaves full screen: the full-screen toggle takes the Escape lock where the browser has Keyboard Lock (`_kit/app.ts`). The menu holds, in order, the seed box, Sound and Full screen, the story log, How to play and Quit. Sound and full screen are kept in this browser under `crete-sound` and `crete-fullscreen`; Play enters full screen again when it was last on.

The split follows one seam: what the game *is* versus what the player *sees*. The engine never names the page. Everything it shows or plays goes out through `Hooks` (`say`, `sfx`, `render`, `showEnd`), and its timers arrive as an argument, so `test/engine.test.ts` plays whole runs against recording hooks and a manual clock. `ui.ts` and `audio.ts` are the other ends of those hooks. `ui.ts` imports only *types* from the engine and takes what it needs at run time as arguments.

- `dist/` is generated: edit `src/`, rebuild, rerun `install-files.php`, commit all of it. `make test` runs `npm ci` and `--check`, and `deploy.sh` refuses a stale `dist/`.
- `tsconfig.json` extends the kit's base, is strict and lists the DOM-free modules (`engine`, `grid`, `bots` and the page helpers), which compile without page types, so it cannot reach for `document`. `src/tsconfig.dom.json` extends it with the DOM lib for `audio.ts`, `ui.ts`, the views and `main.ts`. Imports carry their `.ts` extension.
- `hashSeed` and `mulberry32` come from the kit (`_kit/rng.ts`, written for Crete): the mazes are pinned to their seeds.
- Versions are content hashes written by `tools/install-files.php`, never by hand: `dist/main.js?v=` and `game.css?v=` in `index.html`. `sw.js` hashes the same files plus the rest of `dist/`, so a changed bundle makes it stale too.

## The maze rule

Every maze must be met and must be winnable. For a seed, attempt *i* draws its
layout from `mulberry32(hashSeed(seed + ":maze:" + i))` and its run from
`mulberry32(hashSeed(seed + ":run:" + i))`, and `trial()` plays it with the real
`createGame` rules and silent hooks, twice: the **dasher** (`bots.ts`) walks
`goalPath()` and never fights; the **strategist** bashes, raises a shard,
throws the jammer, eats a snack, waits in a safe zone (six turns at most) or
steps, first match wins. The first attempt (of 80) where the creature reaches
the dasher and the strategist escapes is the maze. Failing that, the
strategist-won attempt whose dasher came closest is used; a maze the
strategist loses is never returned. A candidate is skipped before any bot plays
it when a closed barrier seals off the loot, leaves the creature on the exit, or
starts it fewer than 8 steps from the player (barriers open). The route the bots
walk, and the Hint, is the fewest-step trip to the exit, fetching a spare fuse on
the way when that is shorter. The play-through
(T) is the strategist, so it wins any run it starts from the beginning.
`test/maze-sweep.test.ts` holds the budgets over 300 seeds, and 10,000 nightly:
the fallback on at most 1% of seeds, and at most 6 candidates per seed on average
(20 at p95), which keeps generation to a few milliseconds.

## Tests

From this folder: `./test.sh` (the build check, its tests' type check included, `install-files.php --check` and the icon check), and `node --test test/*.test.ts` for the unit tests; `../units.sh` runs them with every other game's, as `make test` does, and fails on a folder with none. Run `npm ci` in `games/` first. Browser specs: `crete-play`, `crete-layout`, `games-hub`, `games-install` and `games-pwa` in `../../tests/e2e`.
