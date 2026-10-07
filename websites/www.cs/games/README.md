# Games

Pluggable mini-games for the SIUE personal site.

## Layout
```
games/
  README.md
  cylon/           # The CIC — Cylon defense
    cylon.css
    cylon.js       # source; also ~/cylon.js (host blocks .js under games/)
    mount.html     # FX / overlays; also ~/cylon-mount.html (host blocks .html under games/)
    README.md
```

## Site contract
- `index.html` owns brand, Home / Contact / Games hub panels, and combat nav chrome slots.
- `#game-root` receives the active game’s mount markup.
- Content roots the game may wreck: `#nav-main`, `#nav-contact`, `#nav-games`.

## Adding another game later
1. Add `games/<id>/{…}`.
2. Register a mount API (Phase 4 hub) and a hub card in `#nav-games`.
3. Only one game `start()` at a time.
