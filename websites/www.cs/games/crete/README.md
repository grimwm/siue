# The Island of Crete

A text-based chase on a seeded 15 x 15 maze. You move once per turn, the creature twice; reach the exit alive. Controls are listed on the page (arrows/WASD move, Space bashes, Z/X/C use items, H hints, V shows the route, T plays itself, M mutes, Q quits, N starts a new run). The seed is in the address (`?seed=`), so a link replays a maze.

It is a `play` game: the folder is a complete page (`index.html`) with its own PWA files, and the site wraps it in `play/crete/` without the game knowing.

## Files

- `index.html`, `game.css`: the page and its style.
- `src/main.ts`: the entry. It wires the three modules together, starts a run and exposes `window.__mazeTest` for the browser specs.
- `src/engine.ts`, `src/audio.ts`, `src/ui.ts`: the typed modules (below).
- `dist/`: the esbuild bundle (`main.js`, `main.js.map`), checked in and served as it is: the host has no Node.
- `build.json`, `tsconfig.json`, `src/tsconfig.dom.json`: the build and its two type programs.
- `test/`: the unit and static suites on `node:test`; `test.sh` runs them with the build checks.
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
| `ui` | drawing the board, HUD and log, choosing what the ending and inventory say; keys and clicks | DOM lib |
| `ui/end.tsx`, `ui/inventory.tsx`, `ui/title.tsx` | the ending card, the inventory panel and the title card Quit returns to, drawn with the kit's `Dialog`, `Panel`, `Button` and `KeyChip`; `ui.ts` hands them a finished view | DOM lib |

The split follows one seam: what the game *is* versus what the player *sees*. The engine never names the page. Everything it shows or plays goes out through `Hooks` (`say`, `sfx`, `render`, `showEnd`), and its timers arrive as an argument, so `test/engine.test.mjs` plays whole runs against recording hooks and a manual clock. `ui.ts` and `audio.ts` are the other ends of those hooks. `ui.ts` imports only *types* from the engine and takes what it needs at run time as arguments.

- `dist/` is generated: edit `src/`, rebuild, rerun `install-files.php`, commit all of it. `make test` runs `npm ci` and `--check`, and `deploy.sh` refuses a stale `dist/`.
- `tsconfig.json` extends the kit's base, is strict and lists the DOM-free modules (`engine`, `grid`, `bots`), which compile without page types, so it cannot reach for `document`. `src/tsconfig.dom.json` extends it with the DOM lib for `audio.ts`, `ui.ts` and `main.ts`. Imports carry their `.ts` extension.
- The engine keeps its own mulberry32: the mazes are pinned to their seeds.
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
`test/maze-sweep.test.mjs` holds the budgets over 300 seeds, and 10,000 nightly:
the fallback on at most 1% of seeds, and at most 6 candidates per seed on average
(20 at p95), which keeps generation to a few milliseconds.

## Tests

From this folder: `./test.sh` (the build check, `install-files.php --check`, then `node --test 'test/*.test.mjs'`). Run `npm ci` in `games/` first. Browser specs: `crete-play`, `games-hub` and `games-pwa` in `../../tests/e2e`.
