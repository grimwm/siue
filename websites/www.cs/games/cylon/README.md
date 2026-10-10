# Cylon Defense

Homepage mini-game module. Licensed under the GNU GPL v3 (see `LICENSE`).

## Files
- `cylon.css` — combat UI, FX, and game-driven nav overrides
- `cylon.js` — the game: an ES module exporting `initializeCylonEffects(options)`. The site shell stays in the site's own scripts.
- `src/*.ts`, `js/*.js` — the typed modules `cylon.js` imports, and the JavaScript compiled from them (see Source layout and build)
- `mount.html` — scanner, battlefield, FX, help, game-over (injected into `#game-root`)
- `scores.php` — high-score API
- `data/config.json` — timezone, week boundary, board size, blocked initials, and request limits
- `data/scores.json` — live board (created on the server; not part of the source tree)
- `data/.htaccess` — denies HTTP access to `data/`
- `tools/install-files.php` — writes `manifest.webmanifest` and the `?v=` cache-busters inside `cylon.js`
- `tools/ts-build.mjs` — the TypeScript build; `package.json`, `package-lock.json`, `tsconfig.json`, `src/tsconfig.dom.json` configure it
- `*-test.js`, `install-files-test.php` — unit and static checks, run from this folder

## Loading it
The page loads the entry module and calls it once:

```html
<script type="module">
  const { initializeCylonEffects } = await import('./games/cylon/cylon.js?v=…');
  await initializeCylonEffects({ onTheme: applyCombatTheme });
</script>
```

The game finds `mount.html` and `scores.php` next to `cylon.js` (from `import.meta.url`), so it runs from whatever path serves the folder; nothing is configured with attributes. The page links `cylon.css` itself. The server runs `.js`, `.html` and `.php` under `games/` as they are; PHP in this directory runs once the files are mode `644`. The server umask otherwise saves uploads as `640`, which PHP cannot read; `make deploy` finishes with `scp -p`. `websites/www.cs/scores.php` only forwards to `games/cylon/scores.php` so the old URL keeps working.

## Host contract
Mount into `#game-root`. The game may scatter glyphs in `#nav-main`, `#nav-contact`, `#nav-games` and toggle body classes:
`cylon-game-live`, `cylon-nav-combat`, `cylon-world-ended`, `cylon-glyphs-blown`, `cylon-touch-play`.
Combat nav chrome (toggle, scores, abilities, settings) still lives in the site header until Phase 5.

The game reaches the page only through what it is handed and what it declares:

- **`options.onTheme(combat)`** — called with `true` when combat starts and `false` when it ends. The page uses it to force its dark theme while the game is live and to restore the visitor's choice after; the game changes no theme itself. Omitted, it does nothing.
- **`options.scoresApi`** — the score server's URL, when it is not `scores.php` next to `cylon.js`.
- **`window.cylonStartGame`** — the start function `metadata.yaml` names (`start:`); the Games page calls it by name. It is defined once `initializeCylonEffects` has mounted the game, and does nothing while a run is live or the game is over.

The game defines and calls nothing that the site's scripts define; `node smoke-test.js` fails if a function in the site's `main.js` appears in `cylon.js`.

## Source layout and build
`cylon.js` is a native ES module (no bundler). The pure and near-pure parts are TypeScript in `src/`, compiled one file to one file into `js/`, which is checked in and served as it is: the host has no Node.

```
npm ci && node tools/ts-build.mjs          # compile src/ to js/ (type errors fail it)
node tools/ts-build.mjs --check            # fail if js/ is missing, stale or has extra files
php tools/install-files.php                # then rewrite the ?v= versions inside cylon.js
```

- `js/` is generated: edit `src/`, rebuild, rerun `install-files.php`, commit all of it. `make test` runs `npm ci` and `--check`, and `deploy.sh` refuses a stale `js/`.
- `tsconfig.json` is strict and lists the DOM-free modules, which compile without page types so they cannot reach for the page. `src/tsconfig.dom.json` extends it with the DOM lib for the modules that call `fetch`. Each config is its own program in `tools/ts-build.mjs`. Imports carry their `.js` extension, the file the browser fetches.
- `tools/ts-build.mjs` is a copy of `games/tankity/tools/ts-build.mjs`: a game folder is self-contained, so there is no shared tool at the repository root. A fix to one belongs in the other. TypeScript is pinned to 6.0.3 because 7 dropped the compiler API the tool uses.
- Versions: `tools/install-files.php` sets each `./js/<name>.js?v=` import in `cylon.js`, and the `mount.html?v=` fetch, to a hash of that file's content. It rewrites only the value after `?v=` and writes nothing if a module is not imported exactly once or a reference is missing. It never touches the `?v=` of `cylon.js` or `cylon.css`: the page that loads them versions them (`php tools/site-versions.php` at the site root, run after this tool). A `js/` module imports nothing, because a second spelling of its URL would load it twice.

| Module | What it holds | Program |
| --- | --- | --- |
| `rules` | kill level, difficulty factor, drone cap, missile caps and delays, nuke delay, wave plan, hull points and tint, volume curve | DOM-free |
| `playfield` | the playable box, clear spots, entry edges, where a march begins | DOM-free |
| `audio` | the WebAudio buses, the sound effects by name, the music bed, volumes and mute (`createAudio`) | DOM (WebAudio types) |
| `scores` | the `scores.php` client (tokens, board, qualifying rule, submission) and the board's markup | DOM (`fetch`) |

`cylon.js` keeps the state (score, timers, drones) and measures the page; the modules take what they need as arguments, including the random source, so `rules-test.js` and `playfield-test.js` pin them with fixed and seeded draws, and `scores-test.js` runs the client against a fake server.

`audio` hands `cylon.js` one object, `createAudio({ settings, sessionActive, volumeToGain, createContext? })`: `sfx(name)` plays an effect, `prime()` opens the context ahead of one, `unlock()` is the first-gesture handler, `syncMusic()` starts or stops the bed to match the settings and the session, and `settingChanged(key)` follows the settings panel. The context, the buses and the bed's timer stay inside it, and it exports no state. The settings, the session predicate and the volume curve (`rules.volumeToGain`) come in as arguments, so the module imports nothing; without an `AudioContext` it is silent. `audio-test.js` runs it against a fake context.

Still in `cylon.js`: the drone and missile elements and their timers, the nuke and the intro sequence, glyph scattering, the reticle and eye, settings and the nav chrome, the game-over panel.

## Tests
From this folder: `node rules-test.js && node playfield-test.js && node scores-test.js && node audio-test.js && node smoke-test.js && php install-files-test.php`. Browser specs for the home page and the game are in `../../tests/e2e` (`home-eye`, `cylon-help`).
