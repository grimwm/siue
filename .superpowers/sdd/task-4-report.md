# Task 4 report: KO-tier bot cap

## Status
Complete.

## Changes
- Added `botCap()` using `BOT_CAP_START`, `BOT_CAP_PER_KOS`, and `BOT_HARD_CAP` with live `koScore`.
- `spawnBot()` gates on `activeBots >= botCap()` instead of fixed `MAX_BOTS`.
- `launchWave()` uses `room = botCap() - activeBots` and dynamic `maxBatch` for wave size.
- Removed `MAX_BOTS` and `MAX_WAVE` constants.

## Verification
- `node --check websites/www.cs/main.js` — pass
- `rg MAX_BOTS websites/www.cs/main.js` — no matches

## Commit
Message: *Scale bot population with KO score up to desktop/mobile hard caps.*

## Notes
- At 0 KOs, cap remains 4 (same as prior `MAX_BOTS`).
- Cap rises by 1 every 5 KOs until `BOT_HARD_CAP` (10 mobile / 30 desktop).
- Wave batches scale with cap via `maxBatch`; early game behavior stays similar when `botCap()` is 4.
