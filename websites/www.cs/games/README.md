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
play: index.html                  # a page in this folder, opened full-page
# start: cylonStartGame           # OR a site-page function (mounted games)
order: 20                         # optional whole number, low first; default 100
hidden: false                     # optional; true keeps the card off the page
image: og.png                     # optional 1200x630 picture for link previews
```

- Set exactly one of `play` or `start`. `play` must be a file inside the game
  folder; `start` must name a function the site page defines.
- Folder names are lowercase letters, digits and dashes.
- Only top-level `key: value` lines, `#` comments, quotes and `>` blocks are
  understood (the server has no YAML extension). Unknown keys are errors.
- A broken file keeps only that game off the page; `games.php` lists why under
  `errors`, and the browser console repeats it.
- Check every game with `php tests/games-hub-test.php`.
- Link previews: `php tools/game-share-tags.php` writes each game's share tags
  (title, description, `image`) into its page, or for a `start` game into
  `games/<id>/index.html`, a page that forwards to `?game=<id>`. Run it after
  editing a `metadata.yaml`; `make deploy` refuses stale tags.
- Every card has **Copy link**: its game folder (`games/<id>/`). For a
  `start` game that folder holds the generated share page, which forwards to
  the site with `?game=<id>`; the site launches it on load.

## Site contract
- `index.html` owns brand, Home / Contact / Games hub panels, and combat nav chrome slots.
- `#game-root` receives the active game’s mount markup.
- Content roots the game may wreck: `#nav-main`, `#nav-contact`, `#nav-games`.

## Adding another game later
1. Add `games/<id>/{…}`.
2. Add `games/<id>/metadata.yaml` (above); the Games page picks it up.
3. A game mounted into the site page (like The CIC) exposes a global `start`
   function; only one runs at a time.
