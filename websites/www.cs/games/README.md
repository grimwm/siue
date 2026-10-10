# Games

Pluggable mini-games for the SIUE personal site.

## Layout
```
games/
  README.md
  cylon/           # The CIC — Cylon defense
    cylon.css
    cylon.js       # source; symlinked at ~/cylon.js
    mount.html     # FX / overlays; symlinked at ~/cylon-mount.html
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
```

- Set exactly one of `play` or `start`. `play` must be a file inside the game
  folder; `start` must name a function the site page defines.
- Folder names are lowercase letters, digits and dashes.
- Only top-level `key: value` lines, `#` comments, quotes and `>` blocks are
  understood (the server has no YAML extension). Unknown keys are errors.
- A broken file keeps only that game off the page; `games.php` lists why under
  `errors`, and the browser console repeats it.
- Check every game with `php tests/games-hub-test.php`.
- `make screenshots` plays each game briefly in a real browser and rewrites
  its `screenshot.jpg` (800x450). Rerun it when a game's look changes.
- Games know nothing about the site. `php tools/game-share-tags.php` writes
  the site's page for each game, `play/<id>/index.html` at the site root:
  - a `play` game: the site navbar (William Grim, Home, Contact, Games, and
    the game's name), painted from `theme_color`, `background_color` and
    `accent_color`, over a full-height frame running the game's own page.
    `play/play.js` hands the frame the address's query and hash (room
    invites ride on `?code=`) and gives it the keyboard;
  - a `start` game: a page that forwards to the site with `?game=<id>`.
  Both carry the game's link previews (title, description, `image`): the
  tags chat apps and social sites read when a link is shared. Run the tool
  after editing a `metadata.yaml`; `make test` and `make deploy` refuse stale
  pages. The home page opens its Contact and Games panels for `#contact` and
  `#games`, which the navbar links to.
- Install and offline: every game is an installable app (PWA). The same tool
  writes `games/<id>/manifest.webmanifest` from `title`, `short_name`,
  `description` and the two colors, and links it (plus `theme-color` and the
  iOS home-screen tags) from the game's page, inside a marked block that
  holds nothing about the site. Each game folder needs two
  square PNG icons, `icon-192.png` and `icon-512.png`; the tool reports a game
  without them as stale. Every URL in a manifest is relative, because the site
  is served from a `~user` path.
  - A `play` game also gets `games/<id>/sw.js`, registered from its page with
    the game folder as scope. It precaches the folder's `.html .js .css .json
    .png` files (not tests, `og.png`, or `sw.js`) so the game opens offline,
    and otherwise asks the network first, so online players always get the
    current files. `.php` requests, non-GET requests and Range requests
    (streamed music) never touch the cache, so rooms and high scores stay
    online-only; other files a game fetches whole (small sound effects) are
    cached the first time they load. The cache name carries a hash
    of the precached files; rerun the tool after editing any of them, or
    `--check` (run by `make test` and `make deploy`) reports the game stale.
    Registration does nothing where service workers are unavailable.
  - A `start` game has no page of its own, so its manifest starts the site
    page at `?game=<id>` with the site root as scope. `main.js` links that
    manifest when the game launches, so installing from there installs the
    game, not the whole site.
- Per-game data: Operation Tankity keeps its arsenal, key bindings and audio
  in `games/tankity/game.yaml` and serves `game.json`, written by
  `php tools/tankity-config.php` (`--check` runs in `make test` and
  `make deploy`). See `games/tankity/README.md`.
- Deploys skip `README.md` files and `games/tankity/game.yaml`; nothing at
  runtime reads them.
- Every card opens, and **Copy link** copies, the game's site page
  (`play/<id>/`). The game's own page (`games/<id>/`) still runs on its own,
  without the navbar.

## Site contract
- `index.html` owns brand, Home / Contact / Games hub panels, and combat nav chrome slots.
- `#game-root` receives the active game’s mount markup.
- Content roots the game may wreck: `#nav-main`, `#nav-contact`, `#nav-games`.

## Adding another game later
1. Add `games/<id>/{…}`.
2. Add `games/<id>/metadata.yaml` (above); the Games page picks it up. Run
   `php tools/game-share-tags.php` to write its `play/<id>/` page.
3. A game mounted into the site page (like The CIC) exposes a global `start`
   function; only one runs at a time.
