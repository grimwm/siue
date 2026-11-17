# Task 2 Report: Difficulty factor, last-aim buffer, inbound schedulers

## Status
**Complete.** All brief steps implemented in `websites/www.cs/main.js`.

## Summary of changes

### State and constants (after `coarsePointer`)
- `BOT_CAP_START`, `BOT_CAP_PER_KOS`, `BOT_HARD_CAP` (for Task 4 `botCap()`).
- Run/scheduler state: `runStartedAt`, `lastAim`, `missileTimer`, `nukeTimer`, `missileInFlight`, `missileDueAt`, `nukeDueAt`.

### Difficulty and timing
- `lerp`, `difficultyFactor()` (time + KO blend, capped at 1).
- `nextMissileDelayMs()`, `nextNukeDelayMs()` with difficulty-scaled ranges per brief.

### Schedulers
- `clearInboundSchedulers()`, `scheduleMissiles(first?)`, `scheduleNukes(first?)`, `startInboundSchedulers()`.
- Missile timer calls stub `launchSmallMissile()`; nuke timer calls existing `launchNuke()` with `nukeInFlight` guard.
- Reschedules after each fire attempt (including when skipped due to pause, disorient, or in-flight).

### Pause / help
- `openHelp`: clears missile/nuke timeout handles but preserves `missileDueAt` / `nukeDueAt` (hole-timer pattern).
- `applyPauseTimeSkew`: shifts due times and re-arms one-shot callbacks for pending missile/nuke fires.

### Aim buffer
- `setAim` updates `lastAim` with current client coords and `performance.now()`.

### Game lifecycle
- Game On (`setGameEnabled(true)` after `resetRunStats`): `runStartedAt = Date.now()`, `startInboundSchedulers()`.
- Game Off (`setGameEnabled(false)`) and `endGame`: `clearInboundSchedulers()`, `missileInFlight = false`, `runStartedAt = 0`.

### Explicitly not in scope (Tasks 3/4)
- No missile flight CSS or full `launchSmallMissile` body.
- No `botCap()` or spawn usage of BOT_CAP constants.

## Verification
```bash
node --check websites/www.cs/main.js
```
Exit 0.

## Commit
`f01964a` — Schedule occasional nukes and missiles from a ramping difficulty clock.

## Concerns / notes
- `BOT_CAP_*` constants are unused until Task 4; intentional per brief.
- Nuke scheduling now fires via timer in addition to any manual/other triggers; behavior matches missile-command pacing design.
- While help is open, schedulers do not advance; skew on close should keep relative spacing aligned with pause duration.
