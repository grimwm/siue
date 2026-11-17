# Task 1 Report: Remove nukes toggle + hit-triggered nukes

## Status

**Complete.** All brief steps implemented, verified, and committed on `feature/cylon-missile-command-pacing`.

## Changes

### `websites/www.cs/main.js`

- Removed `nukesEnabled: true` from settings defaults.
- Removed `HITS_PER_NUKE` constant (10).
- Removed nukes checkbox sync in `syncSettingsUi` (`data-setting="nukesEnabled"` query and `checked` assignment).
- Removed hit-triggered nuke block from `registerHit` (every 10 hits via `launchNuke()`).
- Updated `launchNuke` guard: dropped `!settings.nukesEnabled` check; still requires live game, non-disoriented eye, and no nuke in flight.

`launchNuke` remains in the codebase for future scheduler-driven use (Task 2+). No schedulers or small missiles were added.

### `websites/www.cs/index.html`

- Removed the “Nukes (every 10 hits)” options checkbox label.
- Updated settings hint to: “Survive until 30 hits — occasional nukes and missiles may appear. Drag the pip to dodge · tap drones · Grenade / Raptor in the bar.”

## Verification

| Check | Command | Result |
|-------|---------|--------|
| Syntax | `node --check websites/www.cs/main.js` | Exit 0 |
| No stale symbols | `rg "nukesEnabled\|HITS_PER_NUKE" websites/www.cs` | No matches (rg exit 1) |

## Commit

- **Hash:** `4cf7117`
- **Message:** Remove hit-triggered nukes and the nukesEnabled options toggle.

## Notes / follow-ups

- Players with `nukesEnabled` in localStorage will retain the key until settings are rewritten; it is ignored (no default, no UI). Harmless; optional cleanup in a later task if desired.
- Help copy elsewhere in `index.html` still references “nuke lands on you” for score/game-over UX; Task 5 may align full help text.

## Out of scope (per brief)

- Missile/nuke schedulers
- Small missiles
- Deploy
