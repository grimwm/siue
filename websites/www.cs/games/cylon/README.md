# Cylon Defense

Homepage mini-game module.

## Files
- `cylon.css` — combat UI, FX, and game-driven nav overrides
- `cylon.js` — game logic (`initializeCylonEffects`); site shell stays in root `main.js`
- `mount.html` — scanner, battlefield, FX, help, game-over (injected into `#game-root`)
- **Deploy:** SIUE blocks `.js` / `.html` under `games/` — symlink to home-dir root as `cylon.js` and `cylon-mount.html`

## Host contract
Mount into `#game-root`. The game may scatter glyphs in `#nav-main`, `#nav-contact`, `#nav-games` and toggle body classes:
`cylon-game-live`, `cylon-nav-combat`, `cylon-world-ended`, `cylon-glyphs-blown`, `cylon-touch-play`.
Combat nav chrome (toggle, scores, abilities, settings) still lives in the site header until Phase 5.
