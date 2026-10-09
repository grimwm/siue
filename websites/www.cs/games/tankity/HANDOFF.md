# HANDOFF: Operation Tankity -> siue repo

## Status: ready to move. Nothing blocks the copy.

All suites green at handoff (2026-10-09, local docker, port 8000):
`node smoke-test.js` -> SMOKE-OK, 198 PASS, every press driven from
`keys.json`. `php config-test.php` -> 9 PASS.
`curl .../rooms-web-test.php` -> WEB-OK 21/21 (host->guest->AI turns,
10-room ceiling, stale sweep, 5s crash-lock recovery; the suite is
config-driven now: ceiling and SHM key come from `.config.yaml`, counts
are relative to a baseline, it only ages out its own rooms).
`php /tmp/e2e/turn-cycle.php` -> CYCLE-OK. Two-browser host/guest/AI OK.
Headless Chrome probes in `/tmp/e2e/` (not part of the move):
`arrow-verify.mjs` ARROWS-OK, `keys-verify.mjs` KEYS-OK, `net-turns.mjs`
host->guest->AI cycle OK.

## What this game is

Scorched-Earth artillery vs AI battery. Endless, no victory, escalating
rounds, $600 stake. Solo hills or network rooms (max 10, live count only).
No chat anywhere. Names are 3-letter initials, lowercase allowed,
cylon-style blocked list (`room_valid_initials` in rooms.php).
Kid-friendly, human error strings, never status codes. GPLv3 (LICENSE).
1991 EGA palette on canvas. 20-item arsenal lives in `weapons.json`
(data, not code; JS + PHP both read it). Music: 4 songs, one per round.
Tutorial remembers skip in localStorage, `U` replays, `ESC` closes menus.
All keyboard bindings live in `keys.json` (contexts: aim, shop, global,
scroll; first token per action shows on labels). `game.js` carries an
identical frozen fallback so the game works if the file cannot load; edit
both together. Buttons, nav hints, help, and tutorial render their caps
from it via `data-keyhint` spans, so labels cannot drift from behavior.

## Architecture the next agent must preserve

- Rooms live in SysV shared memory ONLY. No disk, no fallback, no persist
  across restarts. Key = numeric `shm_key` from `.config.yaml`, else
  `ftok(rooms.php,'R')`, else `0x54414E4B`. Registry at var 1.
- `.config.yaml` (game root, `CONFIG_FILE` env may override) is READ ONLY.
  Never written. Env vars win over file. `max_rooms: 10`.
- Server is authoritative. Clients never report hits. CSRF + Origin gated.
- Locks are bounded (~5s): a crashed holder must never brick the shelf.
  `rooms-web-test.php` proves this; keep that check passing.
- Live occupancy only: rooms idle > `room_live_secs` (600) stop counting;
  the sweep (runs on ping) drops them. `used` in ping is the live count.

## Docker requirement (do this when setting up siue docker)

The PHP web image MUST install `sysvsem` and `sysvshm` (bundled exts,
no apt deps). Without them every rooms endpoint fails and the game
silently falls back to solo. Locally this bit us when a container
recreate wiped a hand install. Reference patch (adapt path as needed):

```
 RUN docker-php-ext-install \
     pdo \
     pdo_mysql \
     pdo_pgsql \
     pdo_sqlite \
     pgsql \
     mysqli \
-    zip
+    zip \
+    sysvsem \
+    sysvshm
```

## The move

Plain copy of this directory to `siue/websites/www.cs/games/` (folder name TBD).
Full page, NOT embedded. Hookup patch + staged compose not yet written;
deployment stays on hold until after the move. After moving, re-run every
suite above against the new docker and eyeball fullscreen fit (it was not
re-checked after the palette change) plus a ~20-item balance pass.

## Test quirks worth knowing

- `rooms-test.php` (CLI) needs SysV in the *executing* PHP or it SKIPs;
  `rooms-web-test.php` (over HTTP) is the real room coverage.
- `rooms-web-test.php` reaches itself via public host, or the `nginx`
  sibling when the host is localhost; it only ages out rooms it created.
- Room create/start/act are throttled; the suites already sleep correctly.
- Game keys (defaults; reconfigure in `keys.json`): Left/Right swing the
  barrel, Up/Down work power, A/D drive, Ctrl fire, Q cycle, digits buy
  rows in the shop, 1-4 favorites in battle, B buy, V/P preview, N
  new/next, C menu, O rooms, U tutorial, T random seed, F fullscreen,
  M music, E sound, J/K and PgUp/PgDn scroll overlays, ESC closes.
