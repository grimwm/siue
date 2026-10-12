# The Island of Crete

A text-based chase on a seeded 15 x 15 maze. You move once per turn, the creature twice; reach the exit alive. Controls are listed on the page (arrows/WASD move, Space bashes, Z/X/C use items, H hints, V shows the route, T plays itself, M mutes, N starts a new run). The seed is in the address (`?seed=`), so a link replays a maze.

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
| `engine` | seeded RNG, maze generation, search, the run's state and every rule (moves, items, bash, the chase, hint, route, play-through) | DOM-free |
| `audio` | the Web Audio synth and the mute switch | DOM lib |
| `ui` | drawing the board, HUD, inventory, log and ending; keys and clicks | DOM lib |

The split follows one seam: what the game *is* versus what the player *sees*. The engine never names the page. Everything it shows or plays goes out through `Hooks` (`say`, `sfx`, `render`, `showEnd`), and its timers arrive as an argument, so `test/engine.test.mjs` plays whole runs against recording hooks and a manual clock. `ui.ts` and `audio.ts` are the other ends of those hooks. `ui.ts` imports only *types* from the engine and takes what it needs at run time as arguments.

- `dist/` is generated: edit `src/`, rebuild, rerun `install-files.php`, commit all of it. `make test` runs `npm ci` and `--check`, and `deploy.sh` refuses a stale `dist/`.
- `tsconfig.json` extends the kit's base, is strict and lists the DOM-free engine, which compiles without page types, so it cannot reach for `document`. `src/tsconfig.dom.json` extends it with the DOM lib for `audio.ts`, `ui.ts` and `main.ts`. Imports carry their `.ts` extension.
- The engine keeps its own mulberry32: the mazes are pinned to their seeds.
- Versions are content hashes written by `tools/install-files.php`, never by hand: `dist/main.js?v=` and `game.css?v=` in `index.html`. `sw.js` hashes the same files plus the rest of `dist/`, so a changed bundle makes it stale too.

## Tests

From this folder: `./test.sh` (the build check, `install-files.php --check`, then `node --test 'test/*.test.mjs'`). Run `npm ci` in `games/` first. Browser specs: `crete-play`, `games-hub` and `games-pwa` in `../../tests/e2e`.
