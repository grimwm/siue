# Task 6 Report: Help copy, cache-bust, deploy

**Branch:** `feature/cylon-missile-command-pacing`  
**Base:** `a2af69ba026e3080a8263a72c3821599e4546545`

## Changes

- **How to Play (desktop + mobile):** Added four bullets covering occasional nukes/small missiles (2 hits), cyan/pink trackers vs orange last-aim lock, KO-scaled drone density, and desolate page look while Game On.
- **Settings hint:** Expanded to match (no hit-count nuke cadence; no “every 10 hits”).
- **Cache-bust:** `custom.css` and `main.js` query strings → `?v=20261006ad`.

## Deploy

```text
cd websites/www.cs && node --check main.js && make deploy
```

Exit 0 — HTML/JS/CSS/PHP and `data/.htaccess` uploaded via Makefile `scp`.

## Manual checklist

| # | Check | Result |
|---|--------|--------|
| 1 | 10 hits → no nuke from hits | Not run in agent session — verify in browser |
| 2 | Idle Game On → small missiles; later/rarer nukes | Not run |
| 3 | Orange missile → recent aim lock; dodge blast | Not run |
| 4 | Cyan/pink tracker distinct + follows pip | Not run |
| 5 | KOs raise bot density; mobile caps at 10 | Not run |
| 6 | No nukes checkbox in Options | **Pass (static):** Options only sound/music/eye — no nuke toggle in `index.html` |
| 7 | Game On fades desolate; Game Off restores | Not run |
| 8 | Pause freezes inbound schedules | Not run |

**Note:** Hard-refresh (Ctrl+Shift+R / cache bypass) after deploy to load `?v=20261006ad` assets.

## Commit

- Message: `Document Missile Command threats in How to Play and cache-bust assets.`
- Files: `websites/www.cs/index.html` only
