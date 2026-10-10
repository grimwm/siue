# The Island of Crete

A text-based chase on a seeded 15 x 15 maze. You move once per turn, the creature twice; reach the exit alive. Controls are listed on the page (arrows/WASD move, Space bashes, Z/X/C use items, H hints, V shows the route, T plays itself, M mutes, N starts a new run). The seed is in the address (`?seed=`), so a link replays a maze.

It is a `play` game: the folder is a complete page (`index.html`) with its own PWA files, and the site wraps it in `play/crete/` without the game knowing.

## Files

- `index.html`, `game.css`: the page and its style.
- `game.js`: the entry module. It imports the three compiled modules, wires them together, starts a run and exposes `window.__mazeTest` for the browser specs.
- `src/*.ts`, `js/*.js`: the typed modules and what they compile to (below).
- `engine-test.js`, `smoke-test.js`, `install-files-test.php`: the unit and static suites.
- `tools/install-files.php`: manifest, service worker, install block, `?v=` versions. `tools/ts-build.mjs`: the TypeScript build.
- `metadata.yaml`: the Games-page card and install colours.

## Source layout and build

`game.js` is loaded by `index.html` with `<script type="module">`; native ES modules, no bundler. `src/*.ts` compiles one file to one file into `js/`, which is checked in and served as it is: the host has no Node.

```
npm ci && node tools/ts-build.mjs          # compile src/ to js/ (type errors fail it)
node tools/ts-build.mjs --check            # fail if js/ is missing, stale or has extra files
php tools/install-files.php                # then rewrite the ?v= versions and sw.js
```

| Module | What it holds | Program |
| --- | --- | --- |
| `engine` | seeded RNG, maze generation, search, the run's state and every rule (moves, items, bash, the chase, hint, route, play-through) | DOM-free |
| `audio` | the Web Audio synth and the mute switch | DOM lib |
| `ui` | drawing the board, HUD, inventory, log and ending; keys and clicks | DOM lib |

The split follows one seam: what the game *is* versus what the player *sees*. The engine never names the page. Everything it shows or plays goes out through `Hooks` (`say`, `sfx`, `render`, `showEnd`), and its timers arrive as an argument, so `engine-test.js` plays whole runs against recording hooks and a manual clock. `ui.ts` and `audio.ts` are the other ends of those hooks. `ui.ts` imports only *types* from the engine (erased on compile) and takes what it needs at run time as arguments, so a `js/` module imports nothing.

- `js/` is generated: edit `src/`, rebuild, rerun `install-files.php`, commit all of it. `make test` runs `npm ci` and `--check`, and `deploy.sh` refuses a stale `js/`.
- `tsconfig.json` is strict and lists the DOM-free engine, which compiles without page types, so it cannot reach for `document`. `src/tsconfig.dom.json` extends it with the DOM lib for `audio.ts` and `ui.ts`. Each config is its own program in `tools/ts-build.mjs`. Imports carry their `.js` extension, the file the browser fetches.
- `tools/ts-build.mjs` is a copy of `games/tankity/tools/ts-build.mjs`: a game folder is self-contained, so there is no shared tool at the repository root. A fix to one belongs in the others. TypeScript is pinned to 6.0.3 because 7 dropped the compiler API the tool uses.
- Versions are content hashes, written by `tools/install-files.php`, never by hand: each `./js/<name>.js?v=` import in `game.js`, then `game.js?v=` and `game.css?v=` in `index.html`. It rewrites only the value after `?v=` and writes nothing if a module is not imported exactly once or a tag is missing. A `js/` module imports nothing, because a second spelling of its URL would load it twice. `sw.js` hashes the same files (including `js/`), so a changed module makes it stale too.

## Tests

From this folder: `npm ci && node tools/ts-build.mjs --check && php tools/install-files.php --check && node engine-test.js && node smoke-test.js && php install-files-test.php`. Browser specs: `games-hub` and `games-pwa` in `../../tests/e2e`.
