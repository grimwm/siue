# Games

Pluggable mini-games for the SIUE personal site.

## Layout
```
games/
  README.md
  _kit/            # shared build, test and PHP tooling
  crete/           # The Island of Crete
    build.json     # entries and type programs for _kit/build/build.mjs
    src/           # TypeScript; main.ts is the entry
    dist/          # the esbuild bundle, checked in
    test/          # node:test suites
    index.html, game.css, sw.js, tools/install-files.php
  tankity/         # Operation Tankity
    build.json     # entries and type programs for _kit/build/build.mjs
    src/           # TypeScript; main.ts is the entry, src/fx/ the effects engine and editor
    dist/          # three esbuild bundles (main.js, fx.js, fx-editor.js), checked in
    test/          # node:test suites and PHPUnit cases
    index.html, game.css, game.json (from game.yaml), rooms.php, scores.php, sw.js
  cylon/           # The CIC — Cylon defense
    css/           # the stylesheets, linked by the home page in order
    build.json     # entries and type programs for _kit/build/build.mjs
    src/           # TypeScript; main.ts is the entry the home page imports
    dist/          # the esbuild bundle (main.js), checked in
    test/          # node:test suites and the scores PHPUnit cases
    mount.html     # FX / overlays, fetched into the home page
    scores.php     # high-score API
    data/config.json
    LICENSE        # GPL-3.0
    README.md
```

## Games page catalog
Every `games/<id>/metadata.yaml` becomes a card on the Games page. The page
asks `games.php` (root), which reads them through `games/hub.php`, so a new
game folder with a valid `metadata.yaml` shows up on its own; no page edit.

```yaml
# games/<id>/metadata.yaml
title: Operation Tankity          # required
kicker: Scorched-earth artillery  # optional small line above the title
description: >                    # required; plain text, `>` folds lines
  Mind the wind and out-shoot a drone battery across endless hills.
button: Play Operation Tankity    # optional; default "Play <title>"
play: index.html                  # a page in this folder (the game's own page)
# start: cylonStartGame           # OR a site-page function (mounted games)
order: 20                         # optional whole number, low first; default 100
hidden: false                     # optional; true keeps the card off the page
image: og.png                     # optional 1200x630 picture for link previews
short_name: Tankity               # optional home-screen name; default the title
theme_color: "#05060f"            # optional #rgb/#rrggbb browser bar color
background_color: "#05060f"       # optional #rgb/#rrggbb splash color
accent_color: "#ffc93c"           # optional #rgb/#rrggbb navbar accent on the site
screenshot: screenshot.jpg        # optional 16:9 picture on the Games page card
preview: preview.webp             # optional looping animation on the card (needs screenshot)
video: preview.mp4                # optional silent clip for link previews (og:video)
genre: Artillery                  # optional genre for search engines (JSON-LD)
```

- Set exactly one of `play` or `start`. `play` must be a file inside the game
  folder; `start` must name a function the site page defines.
- Folder names are lowercase letters, digits and dashes.
- Only top-level `key: value` lines, `#` comments, quotes and `>` blocks are
  understood (the server has no YAML extension). Unknown keys are errors.
- A broken file keeps only that game off the page; `games.php` lists why under
  `errors`, and the browser console repeats it.
- Check every game with `vendor/bin/phpunit --filter GamesHubTest` from
  `websites/www.cs`.
- Pictures. `make screenshots` (from `websites/www.cs`, with `make up`
  running, or `E2E_BASE_URL=` the live site) plays each game briefly in
  Chrome and rewrites all of its pictures, then the share pages:
  - `screenshot.jpg`, the 800x450 still on the Games-page card;
  - `preview.webp`, 4.5 s of play looping on that card (640x360, under
    600 KB). The card shows it through `<picture>`, with the still for
    `prefers-reduced-motion: reduce` and for browsers without WebP, and
    lazy-loads both;
  - `og.png`, the 1200x630 link preview: the same moment under the game's
    name and kicker;
  - `preview.mp4`, 5-8 s of silent 1280x720 H.264, the share page's
    `og:video` for apps that play one (Facebook, LinkedIn, Discord); every
    other app shows `og.png`.
  Rerun it whenever a game's look changes (new art, HUD, layout or levels),
  check the pictures, and commit them with the rewritten `play/` pages. It
  needs Chrome and ffmpeg with libwebp and libx264 or libopenh264 (macOS:
  `brew install ffmpeg`; Fedora's `ffmpeg-free` has both). `GAMES="crete"`
  limits it to some games. What each game plays is its entry in
  `tests/e2e/screenshots.ts`.
- Games know nothing about the site. A built game folder is self-contained and
  works copied anywhere; its source needs `games/_kit/` beside it to rebuild
  (`cd games && npm ci && node _kit/build/build.mjs <id>`).
  The site's side lives outside the games.
  - Site: `php tools/site-game-pages.php` (site root) writes the site's page
    for each game, `play/<id>/index.html`:
    - a `play` game: the site navbar (William Grim, Home, Contact, a GitHub
      link, Games, the game's name, and Install and Share), painted from `theme_color`,
      `background_color` and `accent_color`, over a full-height frame running
      the game's own page. `play/play.js` hands the frame the address's query
      and hash (room invites ride on `?code=`) and gives it the keyboard.
      Install and Share sit at the end of the navbar, drawn by the game's own
      `dist/install.js` (the kit's `install.ts`); `?install` highlights
      Install, or on iOS opens the Add to Home Screen steps on the game's page;
    - a `start` game: a page that forwards to the site with `?game=<id>`,
      keeping the address's query (`?install`).
    Both carry the game's link previews (title, description, `image`,
    `video`) and JSON-LD game data (a free browser game): the tags chat apps,
    social sites and search engines read. The picture and clip URLs carry a
    hash of the file, so a recapture gives previews a new address to fetch.
    `og:url` is the page with `?v=<version>`, the hash the game's page loads
    `dist/main.js` with, and every Share button hands out that same link:
    Facebook keys a preview on `og:url`, so each release gets a fresh one.
    The canonical link stays bare, and the games ignore `v`, so links shared
    before keep working. Run the tool
    after editing a `metadata.yaml`; `make test` and `make deploy` refuse
    stale pages. The home page opens its Contact and Games panels for
    `#contact` and `#games`, which the navbar links to.
  - Game: `games/<id>/tools/install-files.php` (run `php tools/install-files.php`
    in the game folder, or `php games/<id>/tools/install-files.php` from the
    site root) keeps the game installable (PWA), reading only that game's
    `metadata.yaml`. It writes `manifest.webmanifest` from `title`,
    `short_name`, `description` and the two colors, and, for a `play` game,
    links it (plus `theme-color` and the iOS home-screen tags) from the
    game's page inside a marked block that holds nothing about the site. Each
    game installs as its own full-screen app (`display_override:
    ["fullscreen", "standalone"]`). Its icons are rendered from
    `tools/icon.svg` by `node _kit/build/icons.mjs <id>` (any 192 and 512,
    maskable 192 and 512, monochrome 512, Apple 180), and `tools/install-files.php
    --check` fails on a missing or wrong-sized one; `icons.mjs <id> --check`
    (in each game's `test.sh`) fails when the drawing changed without a rerun.
    Every game has a Quit through `_kit/app.ts` (Tankity: Menu, Quit; Cylon:
    the Game On toggle; Crete: the Quit button or Q): an installed app closes
    where the platform allows, otherwise the game shows its title card and
    says to swipe the app away. Every URL in a manifest is relative, because
    the site is served from a `~user` path.
    - A page game's page also loads `dist/install.js`, which shows the same
      Install and Share bar in a corner when the address has `?install`.
    - A `play` game also gets `sw.js`, registered from its page with the game
      folder as scope. It precaches the folder's `.html .js .css .json .png`
      files (not tests, the `image:` picture, or `sw.js`) so the game opens
      offline, and otherwise asks the network first, so online players always
      get the current files. `.php` requests, non-GET requests and Range
      requests (streamed music) never touch the cache, so rooms and high
      scores stay online-only; other files a game fetches whole (small sound
      effects) are cached the first time they load. The cache name carries a
      hash of the precached files; rerun the tool after editing any of them,
      or `--check` (run by `make test` and `make deploy`) reports the game
      stale. Registration does nothing where service workers are unavailable.
    - A `start` game has no page of its own, so its manifest starts the site
      page at `?game=<id>` with the site root as scope, and it gets no
      service worker. `main.js` links that manifest when the game launches,
      so installing from there installs the game, not the whole site.
      Its tool also keeps the `?v=` cache-buster on the `mount.html` fetch
      inside the bundle (`dist/main.js`, built by the kit) as a hash of that
      file.
  - Home page: `php tools/site-versions.php` (site root) writes the `?v=`
    cache-busters in `index.html`, the one page the site shares with a mounted
    game: `site.css`, `main.js`, the game's stylesheets `games/cylon/css/*.css`
    (one `<link>` each, in cascade order) and the entry bundle
    `games/cylon/dist/main.js`, each a hash of its file's content. Each file
    has one writer: this tool owns `index.html`, the kit build owns
    `dist/main.js`. The page hashes the bundle as it stands, so run the build
    first; `--check` (in `make test` and `make deploy`) reports the page
    stale when either was forgotten.
    The kit's `InstallCoreTest` covers the shared install logic.
- Per-game data: Operation Tankity keeps its arsenal, key bindings and audio
  in `games/tankity/game.yaml` and serves `game.json`, written by
  `php tools/game-json.php` in its folder (`--check` runs in `make test` and
  `make deploy`). See `games/tankity/README.md`.
- Deploys skip `README.md` files, every game's `tools/` folder, tests,
  `games/tankity/game.yaml`, and the TypeScript setup (`src/`, `build.json`,
  `package*.json`, `tsconfig.json`, `tsconfig.test.json`, `node_modules/`); nothing at runtime reads them. The
  built `dist/` ships. Every game is built by the shared kit in `_kit/`;
  `make test` and `make deploy` run each game's `--check`.
- Every card opens, and **Copy link** copies, the game's site page
  (`play/<id>/`). The game's own page (`games/<id>/`) still runs on its own,
  without the navbar.

## Site contract
- `index.html` owns brand, Home / Contact / Games hub panels, and combat nav chrome slots.
- `#game-root` receives the active game’s mount markup.
- Content roots the game may wreck: `#nav-main`, `#nav-contact`, `#nav-games`.
- The page imports a mounted game's entry module and hands it what it needs as
  options. The CIC takes `onTheme(combat)`, which `index.html` wires to
  `main.js`'s `applyCombatTheme`; the game defines nothing the site's scripts
  define and calls nothing they define (`games/cylon/test/smoke.test.ts` checks).
  The games list loads after the game has been given the chance to define its
  `start` function.

## Adding another game later
1. Add `games/<id>/{…}`.
2. Add `games/<id>/metadata.yaml` (above); the Games page picks it up. Run
   `php tools/site-game-pages.php` to write its `play/<id>/` page, and copy
   another game's `tools/install-files.php` (a `play` game: Crete's; a
   `start` game: The CIC's) into `games/<id>/tools/` and run it there.
3. A game mounted into the site page (like The CIC) exposes a global `start`
   function, named by `start:` in its `metadata.yaml`; only one runs at a time.
