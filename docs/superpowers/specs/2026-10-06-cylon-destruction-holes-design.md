# Cylon destruction holes + realistic explosion SFX

Date: 2026-10-06  
Site: `websites/www.cs` (Cylon defense mini-game)

## Goal

When combat impacts land, the page content in that area should look destroyed (scorched void + edge glitch) for a weapon-scaled hold, then gradually fade back into existence. Explosion-class sounds should feel more realistic via layered Web Audio (no new media files).

## Decisions (locked)

- Visual style: **scorch + edge glitch** (not scorch-only or glitch-only).
- Hole scale: **weapon-scaled** (bolts/KOs small → grenade/Raptor medium → nuke large).
- Duration: **weapon-scaled** hold + fade.
- Implementation approach: **overlay masks** in `#cylon-field`, not DOM cloning/shredding of page content, not shipped audio samples.

## Behavior

| Source | Hole size | Hold | Fade back |
|--------|-----------|------|-----------|
| Bot bolt impact / KO burst | small (~48–64px) | ~0.8s | ~1s |
| Grenade | medium (~`GRENADE_RADIUS`) | ~2.5s | ~2s |
| Raptor strike (per impact point) | medium | ~2.5s | ~2s |
| Nuke | large (near-viewport) | ~4s | ~3s |

- Look: dark scorched void in the center; light glitch/crackle on the rim while held; both ease off during fade so content appears to reform.
- Holes may stack when blasts overlap.
- Game chrome stays undamaged: nav, reticle, score HUD, help/options overlays, ability buttons.
- Visual only: holes use `pointer-events: none`; links and combat remain interactive under holes.
- No holes while Game Off.
- Pause (How to Play): hole timers freeze with other game timers (same pause accounting as cooldowns).

## Architecture

### API

`punchHole(pageX, pageY, { radius, holdMs, fadeMs })` in `main.js`:

1. Append a `.cylon-hole` into `#cylon-field` using the same page-coordinate positioning as bots/blasts.
2. Apply hold class, then after `holdMs` switch to fade class for `fadeMs`, then remove the node.
3. On pause, extend scheduled times by pause duration (or clearTimeout/reschedule consistently with existing pause helpers).

### Call sites

- Bolt impact finish (`fireBolt` impact spawn).
- Bot KO (`knockOutBot`) at bot center.
- Grenade blast center (`throwGrenadeAt`).
- Each Raptor impact (`spawnRaptorImpacts`).
- Nuke detonation (`launchNuke` / detonation point).

### Limits & cleanup

- Cap concurrent holes (~24). If exceeded, force-fade the oldest hole early.
- Clear all holes on Game Off and game-over teardown with other FX cleanup.
- `aria-hidden="true"` on hole nodes.

### CSS (`custom.css`)

- `.cylon-hole`: absolutely positioned disc; scorched radial via dark overlay + `mix-blend-mode` so page text reads burned-out rather than sticker-covered.
- Rim glitch via short CSS animation (skew / chromatic offset / noise flicker) while held; settles as fade starts.
- `.cylon-hole.is-fading`: opacity and blend ease toward transparent.
- `prefers-reduced-motion`: static scorch only (no glitch jitter); still fades back.
- Holes must not paint over fixed game UI (field stacking / z-index below HUD overlays).

## Audio

Keep procedural Web Audio on `sfxBus`. No new `.mp3`/`.ogg` assets.

Replace flat noise-burst chains for explosion-class events with:

`playExplosion({ size: 'small' | 'medium' | 'large' })`

Layers (all gated by SFX toggle + volume):

1. Low thump / sub boom  
2. Sharp mid crack  
3. Filtered debris / hiss  
4. Brief rumble tail  

Size maps to gain, duration, and filter sweep:

- `small` — bot KO only (bolt impacts keep the existing zap; they still punch a small hole visually)  
- `medium` — grenade detonation + each Raptor ground hit  
- `large` — nuke  

Projectile “zap” and grenade-arm click stay as they are; only KO / grenade / Raptor ground / nuke use `playExplosion`.

Wire:

- `playGrenadeSound` → medium explosion (arm sound unchanged, separate)  
- Raptor ground impacts → medium explosion (staggered with existing impact timing)  
- `playNukeSound` → large explosion  
- `playKoSound` → small explosion

## Non-goals

- Physically deleting or permanently altering real page HTML.
- Cloning/shattering real DOM nodes under the blast.
- Shipping licensed explosion sample files.
- Blocking clicks or gameplay through holes.
- Damaging the navbar / reticle / score / modal UI.

## Testing

- Desktop + mobile: grenade, Raptor, nuke, bot KO each leave a hole that holds then fades.
- Overlapping blasts stack without locking the UI.
- Cap: rapid KO spam does not leave dozens of permanent nodes.
- Game Off clears holes; pause freezes hole lifetime.
- SFX off / volume 0: no audible explosions; holes still appear.
- `prefers-reduced-motion`: scorch without glitch jitter; fade still works.
- Hard-refresh after deploy with cache-bust on `main.js` / `custom.css`.

## Files

- `websites/www.cs/main.js` — `punchHole`, call sites, `playExplosion`, pause/cleanup.
- `websites/www.cs/custom.css` — hole visuals + reduced-motion.
- `websites/www.cs/index.html` — cache-bust query only if needed.
