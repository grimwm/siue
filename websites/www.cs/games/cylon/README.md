# Cylon Defense

Homepage mini-game module. Licensed under the GNU GPL v3 (see `LICENSE`).

## Files
- `cylon.css` — combat UI, FX, and game-driven nav overrides
- `cylon.js` — game logic (`initializeCylonEffects`); site shell stays in root `main.js`
- `mount.html` — scanner, battlefield, FX, help, game-over (injected into `#game-root`)
- `scores.php` — high-score API
- `data/config.json` — timezone, week boundary, board size, blocked initials, and request limits
- `data/scores.json` — live board (created on the server; not part of the source tree)
- `data/.htaccess` — denies HTTP access to `data/`
- **Deploy:** copy this directory and load `cylon.js` with `data-cylon-base` set to its URL path. Scores are requested at `{base}scores.php`. Omit `data-cylon-base` when this folder is the site root. Set `data-cylon-api` only when that URL has to be somewhere else.
- **This SIUE host** blocks `.js` / `.html` under `games/` — symlink those to the home directory as `cylon.js` and `cylon-mount.html`. PHP in this directory runs once the files are mode `644`. The server umask otherwise saves uploads as `640`, which PHP cannot read; `make deploy` finishes with `scp -p`. `websites/www.cs/scores.php` only forwards to `games/cylon/scores.php` so the old URL keeps working.

## Host contract
Mount into `#game-root`. The game may scatter glyphs in `#nav-main`, `#nav-contact`, `#nav-games` and toggle body classes:
`cylon-game-live`, `cylon-nav-combat`, `cylon-world-ended`, `cylon-glyphs-blown`, `cylon-touch-play`.
Combat nav chrome (toggle, scores, abilities, settings) still lives in the site header until Phase 5.
