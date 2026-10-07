# Cylon gameplay polish (missile floor, click lock, text ambush)

Date: 2026-10-06  
Approved inline; implements three tweaks on the live Missile Command build.

## Decisions

1. **Missile cadence:** Keep difficulty ramp; late game ~3.5–6s; hard floor **3.5s** between missile schedules; still one in flight.
2. **Click lock:** Game On → page content non-interactive (`pointer-events: none` on links/buttons in main content); scroll allowed; game chrome + bots + reticle remain interactive.
3. **Text ambush:** ~40% of bot spawns start under text (h1/h2/h3/p/li), lower z-index behind type, then emerge after a short beat to become tappable. Edge marches unchanged for the rest. Avoid nav interactive controls.

## Files

- `websites/www.cs/main.js`
- `websites/www.cs/custom.css`
- `websites/www.cs/index.html` (cache-bust)
