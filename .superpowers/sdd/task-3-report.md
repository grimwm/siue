# Task 3 Report: Small missile entity (ground + tracker)

## Status

**Complete.** Stub `launchSmallMissile` replaced with full flight, detonation, SFX, and cleanup.

## Branch / base

- Branch: `feature/cylon-missile-command-pacing`
- Base ref: `f01964a850872c0cbcf75c3d785a378b558b0362`

## Commits

| SHA | Message |
|-----|---------|
| `9d90e58` | Add ground and tracker small missiles with distinct seeking visuals. |

## Changes

### `websites/www.cs/index.html`

- Added `#cylon-small-missile` shell immediately after the nuke missile element.

### `websites/www.cs/custom.css`

- `.cylon-small-missile` base styling (ground missile orange gradient).
- `.is-flying` visibility; `.is-tracker` pink/cyan seeker with `trackerPulse` and reticle `::after`.
- `.cylon-missile-blast` radial blast reusing `grenadeBlast` keyframes.
- Reduced-motion override disables tracker pulse animation.

### `websites/www.cs/main.js`

- Constants: `MISSILE_SPEED` (640), `MISSILE_ARRIVE` (22), `MISSILE_MAX_FLIGHT_MS` (2200), `MISSILE_BLAST_RADIUS` (72), `MISSILE_TRACKER_CHANCE` (0.22).
- `missileEl` DOM ref alongside `nukeMissileEl`.
- `playSmallMissileSound(tracker)` — distinct tones/noise for tracker vs ground.
- `detonateSmallMissileAt` — clears flight state, small explosion SFX, blast DOM node, `punchHole` (small preset), `registerHit(2)` within blast radius.
- `launchSmallMissile` — 22% tracker (live cursor); ground locks `lastAim` if fresh (&lt;4s) else current mouse; rAF flight from eye −40px with pause/game-off clock skew; rotate toward target.
- `clearInboundSchedulers` — removes `is-flying` / `is-tracker`, sets `missileInFlight = false`.
- `endGame` — also strips missile classes (mirrors nuke missile cleanup).

## Test summary

| Check | Result |
|-------|--------|
| `node --check websites/www.cs/main.js` | Pass |
| Automated game/browser tests | Not run in this task |
| Manual checklist (recommended) | Game On → wait for scheduled missile; verify ground vs tracker visuals; detonation hole + +2 hits in radius; Game Off / pause mid-flight clears sprite |

## Design notes

- Ground missiles use a fixed lock point; trackers continuously retarget `mouse.clientX/Y`.
- Flight pause handling uses `let started` (same intent as nuke missile pause skew; avoids reassignment on `const`).
- `clearInboundSchedulers` on game off stops schedulers and hides any in-flight missile visual; in-flight rAF exits when `!settings.gameEnabled` or `gameOver` and `missileInFlight` is false.

## Concerns / follow-ups

- None blocking. Optional: add `.cylon-small-missile` to reduced-motion `display: none` block alongside nuke missile if missiles should be fully hidden for a11y (brief did not require).
- Pre-existing: `launchNuke` uses `const started` with `started +=` in pause branch — same pattern as brief; missile uses `let started` for working pause skew.

## Files touched

- `websites/www.cs/index.html`
- `websites/www.cs/custom.css`
- `websites/www.cs/main.js`
