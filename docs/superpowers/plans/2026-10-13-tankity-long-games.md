# Tankity: Long Games Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rooms that play over minutes, hours or a week. The host picks the turn time on a 7-stop slider (Lightning 1 min, 2 min default, 10 min, 30 min, 8 h, 24 h, 1 week) and can change it mid-game; a turn that runs out is fired by a drone for that player, who keeps the seat; closing the tab keeps every seat, and a "Your games" list or the room link brings the player back; a toast (and, opted in, a browser notification) names the game that needs your turn; a room closes after (humans × turn time) with nobody acting, with no total-age cap.

**Architecture:** The turn time is room state (`$room['turnSecs']`), and each turn's clock stamps the seconds it started with, so a change applies from the next turn. Clocks stay microtime stamps in the serialized room, applied lazily: one helper (`room_tick`) applies whatever is due, and every request that reads a room through the write path (`state`, and the new `mine` list) calls it. A room's expiry is computed from its state (`room_expires`) and stored in a new `rooms.expires` column, so the cap count and the sweep stay plain SQL. In the browser a seat store (`localStorage` key `tankity-seats`) remembers every seat this browser holds; `pagehide` no longer leaves; a DOM-free watcher (`src/games.ts`) polls `action=mine` for those seats, feeds the "Your games" list, and raises a toast or a notification when a turn starts in a room not on screen.

**Tech Stack:** TypeScript 7 (native type stripping for `node --test`), Preact 11, esbuild via `games/_kit/build/build.mjs`, PHP 8.4 with `pdo_sqlite`, PHPUnit 12, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-12-games-kit-design.md`, "Next: long games".

**Branch:** `games/tankity-long-games` (worktree `.claude/worktrees/tankity-long-games`, off `main` at 11c118e). One PR.

All paths below are relative to `websites/www.cs/games/tankity/` unless they start with `websites/` or `tests/` (the latter is `websites/www.cs/tests/`).

---

## Design

### Room state (serialized in `rooms.data`)

| Key | Type | Meaning |
|---|---|---|
| `turnSecs` | int, one of `ROOM_TURN_STOPS` | The room's turn time. Set at create (body `turn`), changed by the host with `action=turntime` in any phase. Missing (a room saved before this PR) reads as `ROOM_TURN_DEFAULT` (120). Play again keeps it. |
| `clock` | `['key' => string, 'at' => float, 'secs' => int]` | The current human turn's clock. `secs` is stamped from `turnSecs` when the turn's clock starts; a clock without `secs` (an old room) reads as 120. |
| `shop` | `['at' => float, 'secs' => int, 'ready' => array]` | `secs` is `room_shop_secs(turnSecs)` stamped when the shop opens; missing reads as 90. |
| `actedAt` | int (unix seconds) | The last time a human acted: any request that passes `room_gate` (aim, drive, fire, weapon, menu, buy, ready, body, map, seatmode, start, again, turntime), and create and join. Polls and timeouts never stamp it. The end of a match stamps it, so the final standings stay up for one idle limit. Missing reads as `touched`. |

`ROOM_TURN_STOPS = [60, 120, 600, 1800, 28800, 86400, 604800]` and `ROOM_TURN_DEFAULT = 120` live in `server/settings.php`; they are the authority. `src/turn-time.ts` holds the same stops with their labels, and a node test reads `server/settings.php` and fails if the two lists differ.

### Database

Schema step 6 (`server/db.php`):

```sql
ALTER TABLE rooms ADD COLUMN expires INTEGER NOT NULL DEFAULT 0;
UPDATE rooms SET expires = touched + 600;
CREATE INDEX rooms_expires ON rooms (expires);
```

`room_save` writes `expires = room_expires($room)` beside `touched`; `room_alloc` inserts `expires = now + room_live_secs()`. `room_count`, `room_register` and `room_sweep` use `expires >= now` / `expires < now` and nothing else. `rooms_touched` stays (harmless; dropping indexes is not worth a step). The `created` column stays and is no longer read for expiry.

### Idle limit

```
lobby:            expires = touched + room_live_secs()            (600 s; seated lobby polls heartbeat every 20 s as today)
play, shop, over: expires = actedAt + max(room_live_secs(), humans × turnSecs)
```

`humans` = seats with `human => true` (at least 1). The floor at `room_live_secs()` keeps a Lightning room alive while the drones play out a round nobody human is standing in. There is no total-age cap: `room_max_age` / `TANKITY_ROOM_MAX_AGE` are removed from code, `.config.yaml`, README and tests.

### Protocol

- `create` body gains `turn?: number` (seconds; anything not in the stops means the default).
- New `POST action=turntime` `{ secs }` → `RoomReply`. Host only (403), `secs` must be one of the stops (422). Emits `{ t: 'turntime', seat, secs }` when the value changes.
- `RoomSnapshot` gains `turnSecs: number`.
- The `auto` event keeps its shape (`seat`, `w`, `x`, `a`, `pw`); its aim is now the stand-in drone's.
- New `POST action=mine` `{ seats: { code: string; token: string }[] }` (at most `ROOM_MINE_MAX = 12`; more is 422) → `{ ok: true, rooms: MineRow[] }`, in the order asked:

```ts
export type MineRow =
  | { code: string; gone: true }
  | {
      code: string; gone: false; seat: number; phase: 'lobby' | 'play' | 'shop' | 'over';
      round: number; turnSecs: number;
      /** The seat whose turn it is (play only). */
      turn: number | null;
      yourTurn: boolean;
      /** Identifies this turn ("round:turn:shots"); null unless yourTurn. One toast per key. */
      turnKey: string | null;
      turnLeft: number | null; shopLeft: number | null;
      /** Every human's initials, this seat's included, in seat order. */
      players: string[];
      hostSeat: number;
    };
```

`gone` covers no such room, an expired room and a token that holds no seat there (the browser forgets all three). Origin is checked like every POST; no CSRF (it changes nothing a GET `state` poll cannot) and no rate charge. Tokens travel in the body, never the URL.

### Lazy clocks

- `room_turn_key($room)` is the existing `round:turn:shots` key, pulled out of `room_turn_left`.
- A turn's clock starts in the request that passes the turn to that human (`room_advance` already calls `room_turn_left` there). It is never backdated across a gap nobody observed.
- `room_tick(array &$room): void` is what `state` does today for `play` (advance, emit, settle tanks) and `shop` (settle). `room_tick_due(array $room): bool` answers, from a read, whether `room_tick` would change anything: in `shop`, the shop clock is out; in `play`, the unit up is a drone (or a dead human) and the pace is ready, or the human's clock has run out, or the clock key is stale (never stamped).
- `action=mine` peeks every room (`room_peek`, no lock) and takes the write lock only for rooms where `room_tick_due` is true, then ticks and saves. A lobby is never saved by `mine`, so `mine` never keeps a lobby alive.

### Timed-out turn

`room_advance`'s human branch, when `room_turn_left() <= 0`, calls `room_standin_shot($room, $cur)`: `room_ai_choose` aims for that tank exactly as the room's drones aim (the room's Difficulty), its gun is the drone's pick when the player's own rack holds it and the round has unlocked it, else the Shell; it never drives. Ammo is spent from the player's rack as for a human shot. The seat stays human. The `auto` event's log line becomes "ABC was away, so a drone fired for them."

### Browser seats

`src/seats.ts`: a store over the kit's `pref` + `json` codec, key `tankity-seats`:

```ts
export interface StoredSeat { code: string; seat: number; token: string; csrf: string; initials: string; at: number }
// { v: 1, seats: StoredSeat[] }, newest first, at most SEATS_MAX = 12.
```

Saved after `host` / `join` succeed; dropped on an explicit Leave, and when the server says the room is gone (`mine` row `gone`, or 404/401 on resume). `main.ts` no longer wires `pagehide` to `sendLeave`. `RoomClient` gains `resume(seat)` (adopt a stored session), `detach()` (stop polls, clear the session, tell nobody) and `mine(list)`; `leave()` becomes `sendLeave()` + `detach()`.

Getting back in: `?code=XXXX` with a stored seat for `XXXX` resumes it (a lobby opens on the roster, a running match starts with `since = 0`, so its first sync is history, not a replay); without a stored seat the code prefills the join box as today. The leave veil gains **Step out**: back to the title card, seat kept, the room in Your games. Its **Leave room** and the lobby's **Leave room** still give the seat up.

### Your games, toasts, notifications

- `src/games.ts` `createGamesWatch(...)` (DOM-free; fake timers in tests) polls `mine` every `GAMES_POLL_MS = 10_000` and once whenever the tab becomes visible, for every stored seat except the room on screen (`viewing()`: `net.code` while in a room's lobby or match, else `''`). It hands every row to `onRows` (the list), forgets `gone` codes, and calls `onTurn(row)` once per `turnKey` when `yourTurn` is true. It polls nothing when the store is empty.
- `onTurn`: a toast (`src/ui/toast.tsx`, root `#toast-root`, `aria-live="polite"`) reads "Your turn in 7K2Q · vs ZED, QRS" with **Go** (step out of the room on screen if any, resume that one) and a close button; it hides itself after 12 s. When the tab is hidden and turn alerts are on and permitted, a `Notification` with `tag: 'tankity-turn-' + code` is shown too; clicking it focuses the window and resumes that room.
- Turn alerts are opt-in: a **Turn alerts** button (in Your games, and in the in-room lobby) asks permission from its click handler (Safari needs the gesture; old Safari takes a callback rather than returning a promise) and stores `on`/`off` in `tankity-turn-alerts`. Without permission, or with it denied, toasts and the tab-title alert still work and the button says so. The automatic `Notification.requestPermission()` on host and join is removed. The existing in-room hidden-tab `turnAlert` (title, ping) stays and shows its notification only when alerts are on.
- `src/ui/games.tsx` draws the list: one row per room, "7K2Q · ABC, ZED · Round 3 · Your turn, 7h 59m left" / "ZED's turn" / "Shop open" / "Waiting in the lobby" / "Match over", each with **Open**. It shows on the title card (under the buttons, only when the store is not empty) and in the rooms lobby when not in a room.

### Clock text

`src/turn-time.ts` `clockText(secs)`: under 60 → "45 s"; under an hour → "m:ss"; under a day → "7h 59m"; else "6d 23h". The shop line and the HUD use it. The HUD's turn line appends " · 7h 59m left" whenever the room's turn time is 10 min or longer. The on-canvas 10-second countdown and the 30-second alert stay as they are.

### Migration of existing rooms

No data rewrite beyond schema step 6. A room saved before this PR reads `turnSecs` 120, its live clock 120, its shop 90, its `actedAt` as `touched`, and gets `expires = touched + 600` from the step; its next save writes the new rule. Old browsers holding a session in memory keep working (`create` without `turn` is the default; `turnSecs` is an extra snapshot field).

---

## Rulings

1. **Idle limit floor.** `max(room_live_secs, humans × turnSecs)`, measured from the last human act. Acts are requests through `room_gate`, plus create and join; polls, `mine` and timeouts are not. The end of a match counts as an act.
2. **Lobbies** (never started, or back via Play again) keep today's touch-based limit, `room_live_secs` (600 s), heartbeated by seated lobby polls only.
3. **No total-age cap.** `room_max_age` and `TANKITY_ROOM_MAX_AGE` are deleted; a config file still naming them is ignored.
4. **Room cap** default 50: `ROOM_MAX_ROOMS = 50`, and `max_rooms: 50` in `.config.yaml`.
5. **Shop clock**: turn time ≤ 2 min → `min(turn, 90)` s (Lightning 60, 2 min 90); longer → the turn time itself, so a long game's players each get a turn's worth of time to shop. All voters ready still closes it at once. Stamped when the shop opens.
6. **Turn time change**: host only, any phase, from the next turn (the running clock and an open shop keep theirs). In a match every client posts "ABC set the turn time to 10 min, from the next turn."; the lobby just redraws the label.
7. **Clock start**: a turn's clock starts in the request that passes the turn, not backdated.
8. **Stand-in drone**: aims with `room_ai_choose` at the room's Difficulty, fires from the player's own rack (Shell when the drone's pick is not stocked or not unlocked), never drives.
9. **`mine`**: POST, at most 12 seats, ticks only rooms that are due, never touches a lobby, reports gone rooms as `gone`.
10. **Seat store**: `localStorage` `tankity-seats`, newest 12 kept, token and CSRF stored. A token drives one game seat and nothing else; keeping it in same-origin storage is accepted.
11. **Only an explicit Leave gives a seat up.** `pagehide` sends nothing. `sendLeave` keeps its beacon transport for the explicit Leave.
12. **Toasts are for turns only** (not an open shop, which the list shows), once per turn key per page load, never for the room on screen (it has its own alert).
13. **Notifications** need a tab of the game open somewhere (hidden is fine). There is no Web Push.
14. **Watcher cadence** 10 s, plus a poll when the tab becomes visible.
15. **HUD time left** shows for turn times of 10 min and longer.
16. **Joining** stays lobby-only (`match already started` as today).
17. **Copy**: player-facing text says "a drone fires for you"; "the crew fires" goes.

---

## Global Constraints

- Esc is never bound or shown to players; Q is back. README's Esc developer notes stay.
- Never hardcode weapon groups: the stand-in's gun check reads `room_weapons()` per key (`minRound`, the rack count), never a list of keys.
- `server/sim.php`, `server/ai.php`, `server/detmath.php` and the TS rules modules keep the detmath bans (`test/determinism.test.mjs`). `server/rules.php` may read `microtime` (it already does) but never `hypot` or a transcendental.
- Tests: node:test / `check` under `test/*.test.mjs`, PHPUnit under `test/php/`. Quick gate: `bash games/tankity/test.sh` from `websites/www.cs`. e2e: `make e2e E2E_ARGS="<specs>"` from `websites/www.cs` with a unique `COMPOSE_PROJECT_NAME` (e.g. `COMPOSE_PROJECT_NAME=tankity-long-$$`); never bind 3000, 5173, 8000 or 8080. Run at most two specs locally; CI runs the rest.
- Build: `node _kit/build/build.mjs tankity` from `websites/www.cs/games`, then `php tools/install-files.php` in `games/tankity`. Protocol fixtures are regenerated with `make protocol` (docker), never by hand.
- Docs (README, comments, `.config.yaml`) describe the current state, never history.
- Chrome, Safari and Firefox: feature-detect `Notification`; handle both the promise and callback forms of `requestPermission`.
- Commit after each task on `games/tankity-long-games`, message ending with the session attribution lines.

## Review Focus

1. Every path that reads a running room on behalf of a player (`state`, `mine`) applies due timeouts; nothing else changes `actedAt`.
2. `room_expires` is the one source of expiry: `room_idle`, `room_count`, `room_register`, `room_sweep` and the stored column all agree, including for rooms saved before step 6.
3. A turn-time change never shortens or lengthens the running turn or an open shop.
4. Closing a tab sends nothing; only Leave (veil or lobby) gives a seat up and forgets it locally; Step out keeps both.
5. The watcher never toasts the room on screen, never toasts one turn twice, asks for notification permission only from a click, and degrades cleanly without `Notification`.

---

## Task 1: Turn time and clocks on the server

**Files:**
- Modify: `server/settings.php` (stops, default, `room_turn_secs`, `room_shop_secs`; `ROOM_MAX_ROOMS = 50`; delete `room_max_age`)
- Modify: `server/rules.php` (`room_turn_key`, `room_turn_left`, `room_shop_left`, shop stamp in `room_end_round`, `room_standin_shot`, `room_tick`, `room_tick_due`, `actedAt` at match end, `room_again` keeps `turnSecs`)
- Modify: `rooms.php` (`create` reads `turn`; new `turntime`; `state` calls `room_tick`; `room_gate`, `create`, `join` stamp `actedAt`; the "90-second auto-fire rule" comment)
- Modify: `server/protocol.php` (`turnSecs` in the snapshot)
- Create: `test/php/RoomTurnTimeTest.php`

**Produces:** `ROOM_TURN_STOPS`, `ROOM_TURN_DEFAULT`, `room_turn_secs(array $room): int`, `room_shop_secs(int $turnSecs): int`, `room_turn_key(array $room): string`, `room_standin_shot(array &$room, int $cur): string`, `room_tick(array &$room): void`, `room_tick_due(array $room): bool`, `$room['turnSecs']`, `$room['actedAt']`, event `turntime`, snapshot `turnSecs`.

- [ ] **Step 1: Write the failing tests** (`test/php/RoomTurnTimeTest.php`, same skeleton as `RoomAgainTest.php`: `rooms-lib.php`, a temp dir per test). Build a started room in memory the way `RoomsSimTest`/`RoomAgainTest` do (`room_new`, `room_seat_human`, `room_idle_seat`, `room_seat_economy`, `room_match_begin`, `room_start_round`, `room_advance`). Cases:
  - `testStopsAndDefault`: `ROOM_TURN_STOPS === [60, 120, 600, 1800, 28800, 86400, 604800]`; `room_turn_secs(room_new('TTTT','ABC')) === 120`; a room with `turnSecs => 600` reads 600; a room with `turnSecs => 777` reads 120.
  - `testShopSecsFollowTheTurnTime`: `room_shop_secs(60) === 60`, `(120) === 90`, `(600) === 600`, `(604800) === 604800`.
  - `testClockStampsItsOwnSeconds`: with the host's turn up and `turnSecs = 600`, `room_turn_left($room)` is within 1 s of 600 and `$room['clock']['secs'] === 600`; then set `$room['turnSecs'] = 60`; `room_turn_left` still reads ~600 (same key).
  - `testAChangeAppliesFromTheNextTurn`: as above, then bump `$room['shots']` (a new key): the new clock's `secs` is 60.
  - `testAnOldClockWithoutSecondsReads120`: `$room['clock'] = ['key' => room_turn_key($room), 'at' => microtime(true) - 30]` → `room_turn_left` ≈ 90.
  - `testATimedOutTurnIsFiredByADroneAndTheSeatStaysHuman`: backdate `$room['clock']['at']` by `secs + 1`; `room_advance($room, $events)`; an `auto` event for seat 0 is in `$events`; `$room['seats'][0]['human'] === true`; the tank's `angle`/`power` equal the `a`/`pw` on the event; its `x` did not change.
  - `testTheStandInOnlyFiresWhatTheRackHolds`: give seat 0 zero of everything but Shell, time the turn out, the `auto` event's `w === 'shell'`; give it 2 Mortar in round 3 and stub nothing: the `w` is a key whose rack count was > 0 before the shot (read the rack from `$room['ammo'][0]` before and after; the count went down by one unless `w` is `shell`).
  - `testTickDue`: a fresh human turn → `room_tick_due` false; clock backdated past `secs` → true; an unstamped clock (unset `$room['clock']`) → true; shop with `shop.at` backdated past `shop.secs` → true; shop just opened → false; lobby → false.
  - `testTickAppliesTheTimeout`: backdated clock; `room_tick($room)`; the turn moved on (`$room['turn']` or `$room['shots']` changed) and `$room['events']` holds an `auto`.
  - `testTheShopStampsItsSeconds`: `turnSecs = 600`, end a round (kill every drone, `room_end_round`): `$room['shop']['secs'] === 600`; `room_shop_left` ≈ 600.
  - `testMatchEndStampsActedAt`: set `actedAt` to `time() - 5000`, end the match: `actedAt >= time() - 1`.
  - `testPlayAgainKeepsTheTurnTime`: `turnSecs = 28800`, match over, `room_again` → still 28800.
  - Endpoint cases via the test pattern `RoomGuardTest.php` uses for handler code (read it first; if handlers are only reachable over HTTP, put these three in `test/php-docker/` beside `RoomsStoreTest.php` instead): `turntime` from a guest → 403; `secs: 90` → 422; host `secs: 600` mid-play → 200, snapshot `turnSecs` 600, one `turntime` event with `secs` 600; `create` with `turn: 28800` → the room's `turnSecs` is 28800; `create` with `turn: 5` → 120.

- [ ] **Step 2: Run them and watch them fail**

```bash
cd websites/www.cs && vendor/bin/phpunit -c phpunit.xml --testsuite tankity --filter RoomTurnTimeTest
```
Expected: errors on undefined `ROOM_TURN_STOPS` / `room_turn_secs`.

- [ ] **Step 3: Implement.** `server/settings.php`:

```php
/* The turn times the host can pick, in seconds: Lightning 1 min, 2 min (the
   default), 10 min, 30 min, 8 h, 24 h, 1 week. src/turn-time.ts holds the same
   list with its labels; test/turn-time.test.mjs keeps them equal. */
const ROOM_TURN_STOPS = [60, 120, 600, 1800, 28800, 86400, 604800];
const ROOM_TURN_DEFAULT = 120;
const ROOM_MAX_ROOMS = 50; // built-in default; .config.yaml and env can change it

/* The room's turn time; anything that is not a stop (a room from before the
   setting) is the default. */
function room_turn_secs(array $room): int
{
    $s = $room['turnSecs'] ?? null;
    return is_int($s) && in_array($s, ROOM_TURN_STOPS, true) ? $s : ROOM_TURN_DEFAULT;
}
/* The shop stays open 90 s in quick rooms (never longer than a turn) and a
   whole turn time in long ones. */
function room_shop_secs(int $turnSecs): int
{
    return $turnSecs <= 120 ? min($turnSecs, 90) : $turnSecs;
}
```

Delete `room_max_age()`. `server/rules.php`: replace `ROOM_TURN_SECS`/`ROOM_SHOP_SECS` with:

```php
function room_turn_key(array $room): string
{
    return ($room['round'] ?? 1) . ':' . $room['turn'] . ':' . ($room['shots'] ?? 0);
}
function room_turn_left(array &$room): ?float
{
    $t = $room['tanks'][$room['turn']] ?? null;
    if (($room['phase'] ?? '') !== 'play' || !$t || $t['kind'] !== 'human' || $t['hp'] <= 0) {
        return null;
    }
    $key = room_turn_key($room);
    if (($room['clock']['key'] ?? '') !== $key) {
        $room['clock'] = ['key' => $key, 'at' => microtime(true), 'secs' => room_turn_secs($room)];
    }
    $secs = (int) ($room['clock']['secs'] ?? ROOM_TURN_DEFAULT);
    return max(0.0, $secs - (microtime(true) - (float) $room['clock']['at']));
}
function room_shop_left(array $room): ?float
{
    if (($room['phase'] ?? '') !== 'shop') {
        return null;
    }
    $at = (float) ($room['shop']['at'] ?? microtime(true));
    $secs = (int) ($room['shop']['secs'] ?? 90);
    return max(0.0, $secs - (microtime(true) - $at));
}
```

In `room_end_round`: `$room['shop'] = ['at' => microtime(true), 'secs' => room_shop_secs(room_turn_secs($room)), 'ready' => []];`, and in the match-over branch `$room['actedAt'] = time();`.

Stand-in (replaces the `room_random_gun` call in `room_advance`'s human branch; keep `room_random_gun` only if something else uses it, else delete it and its tests' references):

```php
/* A human's turn ran out: a drone takes this one shot for them, aimed as the
   room's drones aim, with a gun from the player's own rack (the Shell when the
   drone's pick is not in the rack or not yet unlocked). It never drives. The
   seat stays the player's. Answers the gun. */
function room_standin_shot(array &$room, int $cur): string
{
    $t = $room['tanks'][$cur];
    $choice = room_ai_choose($room, $t);
    $wkey = (string) $choice['wkey'];
    $def = room_weapons()[$wkey] ?? null;
    $have = $room['ammo'][$t['seat']][$wkey] ?? 0;
    if ($wkey !== 'shell' && ($def === null || $have <= 0 || ($room['round'] ?? 1) < ($def['minRound'] ?? 1))) {
        $wkey = 'shell';
    }
    $room['tanks'][$cur]['angle'] = (float) $choice['angle'];
    $room['tanks'][$cur]['power'] = (float) $choice['power'];
    return $wkey;
}
```

Read `room_ai_choose` in `server/ai.php` first: confirm it works on a human tank (no `s` tactic key, a human `ammo` rack) and does not write anything to the tank you then overwrite; if it needs `s`, pass `$t + ['s' => null]` or whatever its default branch takes. The rest of the branch (the `auto` event, spending ammo, `room_fire_shot`, `lastAct`) stays, with the event's `a`/`pw` taken after the aim is set.

`room_tick` / `room_tick_due`:

```php
/* Applies what is due as of now: in play, the turn that ran out and the
   drones' paced turns; in the shop, its clock. The caller holds the room and
   saves it. */
function room_tick(array &$room): void
{
    if ($room['phase'] === 'play') {
        $events = [];
        room_advance($room, $events);
        foreach ($events as $e) {
            room_emit($room, $e);
        }
        room_settle_tanks($room);
    } elseif ($room['phase'] === 'shop') {
        room_shop_settle($room);
    }
}
/* Whether room_tick would change anything, from a read. */
function room_tick_due(array $room): bool
{
    if ($room['phase'] === 'shop') {
        return room_shop_left($room) <= 0;
    }
    if ($room['phase'] !== 'play') {
        return false;
    }
    $t = $room['tanks'][$room['turn']] ?? null;
    if (!$t) {
        return false;
    }
    if ($t['kind'] !== 'human' || $t['hp'] <= 0) {
        return room_pace_ready($room);
    }
    if (($room['clock']['key'] ?? '') !== room_turn_key($room)) {
        return true;
    }
    return room_turn_left($room) <= 0;
}
```

`rooms.php`: in `state`, the `play` and `shop` branches become `room_tick($room); room_save($fh, $path, $room);`. In `room_gate`, after the token (and CSRF, when needed) pass: `$room['actedAt'] = time();`. In `create` and `join`, set `actedAt` before saving. `create`: `$turn = $body['turn'] ?? null; $room['turnSecs'] = is_int($turn) && in_array($turn, ROOM_TURN_STOPS, true) ? $turn : ROOM_TURN_DEFAULT;`. New handler, placed after `seatmode`:

```php
/* The host sets the turn time in any phase; it applies from the next turn. */
if ($action === 'turntime' && $method === 'POST') {
    [$room, $fh, $path, $seat] = room_gate($body, true, false);
    if ($seat !== room_host($room)) {
        room_unlock($fh);
        room_json_out(403, ['error' => 'only the host sets the turn time']);
    }
    $secs = $body['secs'] ?? null;
    if (!is_int($secs) || !in_array($secs, ROOM_TURN_STOPS, true)) {
        room_unlock($fh);
        room_json_out(422, ['error' => 'pick one of the turn times']);
    }
    if ($secs !== room_turn_secs($room)) {
        $room['turnSecs'] = $secs;
        room_emit($room, ['t' => 'turntime', 'seat' => $seat, 'secs' => $secs]);
    }
    if (!room_save($fh, $path, $room)) {
        room_unlock($fh);
        room_json_out(500, ['error' => 'store write failed']);
    }
    room_unlock($fh);
    room_json_out(200, ['ok' => true, 'room' => room_reply_snapshot($room, $seat, $body)]);
}
```

`server/protocol.php`: `'turnSecs' => room_turn_secs($room),` beside `turnLeft`; update the `turnLeft` comment ("before a drone fires for the human whose turn it is").

- [ ] **Step 4: Run the suite**

```bash
cd websites/www.cs && vendor/bin/phpunit -c phpunit.xml --testsuite tankity && node --test 'games/tankity/test/determinism.test.mjs'
```
Expected: all pass. Fix any existing test that referenced `ROOM_TURN_SECS`, `ROOM_SHOP_SECS` or `room_random_gun`.

- [ ] **Step 5: Commit** — `git commit -m "Tankity: room turn time, stand-in drone on timeout, room_tick"`

---

## Task 2: Idle limit and the room cap

**Files:**
- Modify: `server/db.php` (schema step 6 and its comment)
- Modify: `server/store.php` (`room_idle_limit`, `room_expires`, `room_idle`, `room_count`, `room_register`, `room_alloc`, `room_save`, `room_sweep`, header comments)
- Modify: `server/settings.php` header comment (the knobs: room cap, live window)
- Modify: `.config.yaml` (`max_rooms: 50`; drop `room_max_age` and its comment line)
- Modify: `test/php/rooms-lib.php` (`room_test_age` also shifts `actedAt` and `expires`)
- Modify: `test/php/RoomStoreTest.php`, `test/php/DbTest.php`, `test/php/checks/config.php`, `test/php-docker/RoomsStoreTest.php`, `test/php-docker/checks/rooms.php` (drop `room_max_age` / `TANKITY_ROOM_MAX_AGE`; the config check's example key becomes `room_live_secs`)
- Create: `test/php/RoomIdleTest.php`

**Consumes:** `room_turn_secs` (Task 1). **Produces:** `room_idle_limit(array $room): int`, `room_expires(array $room): int`, column `rooms.expires`.

- [ ] **Step 1: Write the failing tests** (`test/php/RoomIdleTest.php`, `putenv('TANKITY_ROOM_LIVE_SECS=600')` in setUp, cleared in tearDown):
  - `testALobbyLivesOnTouches`: lobby room, `touched = 1000` → `room_expires === 1600`.
  - `testAStartedRoomLivesHumansTimesTurnTime`: phase `play`, 2 human seats, `turnSecs = 28800`, `actedAt = 1000` → `room_expires === 1000 + 57600`.
  - `testTheLiveWindowIsTheFloor`: phase `play`, 2 humans, `turnSecs = 60` → `actedAt + 600`.
  - `testAnOverRoomUsesTheSameRule`: phase `over` → `actedAt + max(600, humans × turn)`.
  - `testAnOldRoomReadsActedAtAsTouched`: no `actedAt`, no `turnSecs`, phase play, 1 human, `touched = 5000` → `5000 + 600`.
  - `testNoTotalAgeCap`: a `play` room with `created = time() - 30 * 86400`, `actedAt = time()`, `turnSecs = 604800` → `room_idle` false.
  - `testPollsDoNotKeepAStartedRoomAlive`: save a started room (1 human, `turnSecs = 60`) with `actedAt = time() - 700` through `room_save` (which sets `touched` now) → `room_idle` true and `room_count()` does not count it.
  - `testTheColumnFollowsTheRoom`: after `room_save`, `SELECT expires FROM rooms WHERE code = ?` equals `room_expires` of the saved room; `room_sweep(time() + 10 ** 7)` deletes it (pass a `$now` far ahead).
  - `testCapCountsOnlyLiveRooms`: two rooms, one expired → `room_count() === 1`, `room_register` with `$max = 2` true.
  - In `DbTest.php`: a database at user_version 5 with a `rooms` row (`touched = 1000`) migrates to 6 with `expires = 1600`, and `PRAGMA index_list(rooms)` includes `rooms_expires`.
  - In `test/php/checks/config.php` or `ConfigTest.php`: `room_max_rooms()` with no file and no env is 50; `function_exists('room_max_age')` is false.

- [ ] **Step 2: Run them and watch them fail**

```bash
cd websites/www.cs && vendor/bin/phpunit -c phpunit.xml --testsuite tankity --filter 'RoomIdleTest|DbTest|ConfigTest'
```

- [ ] **Step 3: Implement.** `server/db.php` step 6:

```php
6 => [
    // A room's expiry, computed from its state at every save (room_expires in server/store.php).
    'ALTER TABLE rooms ADD COLUMN expires INTEGER NOT NULL DEFAULT 0',
    'UPDATE rooms SET expires = touched + 600',
    'CREATE INDEX rooms_expires ON rooms (expires)',
],
```

`server/store.php`:

```php
/* How long a started room (play, shop, over) lasts with no human acting:
   every human gets one turn's worth, never less than the live window. */
function room_idle_limit(array $r): int
{
    $humans = 0;
    foreach ($r['seats'] ?? [] as $s) {
        if ($s['human'] ?? false) {
            $humans++;
        }
    }
    return max(room_live_secs(), max(1, $humans) * room_turn_secs($r));
}
/* When a room closes: a lobby a live window after its last touch (seated
   polls heartbeat it); a started room its idle limit after the last human
   act. There is no total-age cap. */
function room_expires(array $r): int
{
    $touched = (int) ($r['touched'] ?? $r['created'] ?? 0);
    if (($r['phase'] ?? 'lobby') === 'lobby') {
        return $touched + room_live_secs();
    }
    return (int) ($r['actedAt'] ?? $touched) + room_idle_limit($r);
}
function room_idle(array $r, ?int $now = null): bool
{
    return ($now ?? time()) > room_expires($r);
}
```

`room_count`: `SELECT COUNT(*) FROM rooms WHERE expires >= ?` with `[$now]`. `room_register`: `... WHERE code <> ? AND expires >= ?`. `room_alloc`: insert `expires` = `$now + room_live_secs()`. `room_save`: compute `$room['touched'] = time()` first, then `UPDATE rooms SET data = ?, touched = ?, expires = ? WHERE code = ?` with `room_expires($room)`. `room_sweep`: `DELETE FROM rooms WHERE code IN (SELECT code FROM rooms WHERE expires < ? LIMIT ?)`. `rooms-lib.php` `room_test_age`: also subtract `$seconds` from `$room['actedAt']` when set, and set the column `expires = expires - ?`. Update the README-facing comments in `store.php` and `settings.php` to the new rule. `.config.yaml`: `max_rooms: 50`, the `room_max_age` comment and value removed, `room_live_secs` comment reads "seconds since the last touch before a lobby closes; also the shortest idle limit of a started room".

- [ ] **Step 4: Run the tankity PHP suites**

```bash
cd websites/www.cs && vendor/bin/phpunit -c phpunit.xml --testsuite tankity
```
Then the docker suite once (`make test` runs it; or `docker compose exec -T www-cs-php sh -c 'cd /var/www/html && vendor/bin/phpunit --testsuite tankity-docker'` under your own `COMPOSE_PROJECT_NAME`). Expected: all pass.

- [ ] **Step 5: Commit** — `git commit -m "Tankity: rooms close after humans x turn time idle, no age cap, 50-room default"`

---

## Task 3: `action=mine` and the protocol types

**Files:**
- Modify: `rooms.php` (the `mine` handler, before the `room_gate` definition's callers so the router reaches it)
- Modify: `server/protocol.php` (`room_mine_row`)
- Modify: `src/protocol.ts` (`RoomSnapshot.turnSecs`, `TurnTimeEvent` in `RoomEvent`, `MineRow`, `MineReply`, `PostBodies.turntime`/`mine`, `PostReplies.turntime`/`mine`, `create.turn?`)
- Modify: `protocol/scenarios.php` (a `mine-reply` scenario and a `turntime` event in a play scenario); regenerate `protocol/*.json`
- Modify: `src/protocol-fixtures.check.ts` (type-check the new fixture)
- Create: `test/php/RoomMineTest.php`

**Consumes:** `room_tick`, `room_tick_due`, `room_turn_key`, `room_turn_secs` (Task 1). **Produces:** `ROOM_MINE_MAX = 12`, `room_mine_row(array $room, int $seat): array`, the `mine` endpoint and its TS types.

- [ ] **Step 1: Write the failing tests** (`RoomMineTest.php`; drive `room_mine_row` and a library function `room_mine(array $seats): array` that the handler wraps, so the tests need no HTTP):
  - `testAGoneRoomIsGone`: unknown code → `['code' => 'ZZZZ', 'gone' => true]`; a real room with a wrong token → gone; an expired room → gone.
  - `testYourTurnCarriesItsKey`: a started room where seat 0's turn is up → `yourTurn` true, `turnKey === room_turn_key($room)`, `turnLeft` > 0, `players === ['ABC', 'ZED']`; for seat 1 → `yourTurn` false, `turnKey` null, `turn === 0`.
  - `testMineAppliesADueTimeout`: store a started room whose human clock is backdated past `secs`; `room_mine([...])` → the stored room (reload with `room_peek`) has a new `shots` count and an `auto` event, and the row reflects the new turn.
  - `testMineLeavesALobbyAlone`: a lobby with `touched = time() - 300`; after `room_mine`, its stored `touched` is unchanged.
  - `testMineDoesNotStampActedAt`.
  - `testTooManySeatsIsRefused`: 13 entries → `room_mine` returns null (the handler answers 422 `too many rooms at once`); a non-list or entries missing `code`/`token` → those entries are `gone`.

- [ ] **Step 2: Run them and watch them fail** (`--filter RoomMineTest`).

- [ ] **Step 3: Implement.** In `server/protocol.php`:

```php
/* One row of a browser's "Your games" list: what that seat needs to know
   without loading the match. */
function room_mine_row(array $room, int $seat): array
{
    $turnSeat = $room['phase'] === 'play' && count($room['tanks']) ? ($room['tanks'][$room['turn']]['seat'] ?? null) : null;
    $mine = $turnSeat === $seat && room_turn_left($room) !== null;
    $players = [];
    foreach ($room['seats'] as $s) {
        if ($s['human'] ?? false) {
            $players[] = (string) $s['initials'];
        }
    }
    $left = room_turn_left($room);
    $shop = room_shop_left($room);
    return [
        'code' => $room['code'], 'gone' => false, 'seat' => $seat, 'phase' => $room['phase'],
        'round' => (int) $room['round'], 'turnSecs' => room_turn_secs($room), 'turn' => $turnSeat,
        'yourTurn' => $mine, 'turnKey' => $mine ? room_turn_key($room) : null,
        'turnLeft' => $left === null ? null : round($left, 1), 'shopLeft' => $shop === null ? null : round($shop, 1),
        'players' => $players, 'hostSeat' => room_host($room),
    ];
}
```

In `rooms.php` (library part, above the router guard so tests can call it):

```php
const ROOM_MINE_MAX = 12;
/* A browser's seats, one row each in the order asked; null when it asked for
   too many. Rooms with something due (a turn or shop that ran out, a drone
   up) are ticked under the write lock and saved; the rest are plain reads,
   and a lobby is never saved here, so asking keeps nothing alive. */
function room_mine(mixed $seats): ?array
{
    if (!is_array($seats) || !array_is_list($seats) || count($seats) > ROOM_MINE_MAX) {
        return null;
    }
    $out = [];
    foreach ($seats as $ask) {
        $code = strtoupper(trim((string) (is_array($ask) ? ($ask['code'] ?? '') : '')));
        $token = (string) (is_array($ask) ? ($ask['token'] ?? '') : '');
        $gone = ['code' => $code, 'gone' => true];
        if (!preg_match('/^[A-Z0-9]{4}$/', $code) || $token === '') {
            $out[] = $gone;
            continue;
        }
        $room = room_peek($code);
        $seat = $room !== null ? room_find_seat($room, $token) : null;
        if ($room === null || $seat === null) {
            $out[] = $gone;
            continue;
        }
        if (room_tick_due($room)) {
            [$held, $fh, $path] = room_load($code);
            if (!is_array($held)) {
                $out[] = $gone;
                continue;
            }
            room_tick($held);
            room_save($fh, $path, $held);
            room_unlock($fh);
            $room = $held;
            $seat = room_find_seat($room, $token);
            if ($seat === null) {
                $out[] = $gone;
                continue;
            }
        }
        $out[] = room_mine_row($room, $seat);
    }
    return $out;
}
```

Router handler (after `maps`):

```php
if ($action === 'mine' && $method === 'POST') {
    if (!room_origin_ok()) {
        room_json_out(403, ['error' => 'bad origin']);
    }
    try {
        $rows = room_mine($body['seats'] ?? null);
    } catch (Throwable $e) {
        room_store_fail($e);
    }
    if ($rows === null) {
        room_json_out(422, ['error' => 'too many rooms at once']);
    }
    room_json_out(200, ['ok' => true, 'rooms' => $rows]);
}
```

`room_load` / `room_save` failures inside answer through `room_store_fail` as everywhere else. `src/protocol.ts`: add `turnSecs: number` to `RoomSnapshot` (doc: "The room's turn time in seconds, one of the host's stops"), `export interface TurnTimeEvent { t: 'turntime'; seq?: number; seat: number; secs: number }` into the `RoomEvent` union, `MineRow` exactly as in the Design, `export interface MineReply { ok: true; rooms: MineRow[] }`, `PostBodies.create.turn?: number`, `PostBodies.turntime: { secs: number }`, `PostBodies.mine: { seats: { code: string; token: string }[] }`, `PostReplies.turntime: RoomReply`, `PostReplies.mine: MineReply`. Add `'turntime'` to `ROOM_ANSWERS` in `net.ts`. Regenerate the fixtures:

```bash
cd websites/www.cs && COMPOSE_PROJECT_NAME=tankity-long-$$ make protocol
```

- [ ] **Step 4: Run** `vendor/bin/phpunit -c phpunit.xml --testsuite tankity --filter RoomMineTest`, then `bash games/tankity/test.sh`. Expected: pass (the build check type-checks `protocol-fixtures.check.ts` against the new fixtures).

- [ ] **Step 5: Commit** — `git commit -m "Tankity: action=mine lists a browser's rooms and applies due timeouts"`

---

## Task 4: Seats that survive the tab

**Files:**
- Create: `src/seats.ts`, `test/seats.test.mjs`
- Modify: `src/net.ts` (`resume`, `detach`, `leave`, `mine`, `turnSecs` from snapshots; header comment)
- Modify: `test/net.test.mjs` (resume/detach/mine cases; the beacon cases stay)
- Modify: `src/main.ts` (drop the `pagehide` → `sendLeave` line; build the seat store and pass it on)
- Modify: `src/lobby.ts` (remember after host/join, forget on Leave, `resumeRoom`, `?code=` resumes a stored seat, `netStepOut`)
- Modify: `src/ui/leave.tsx` (a **Step out** button, `#leave-step`) and its test in `test/ui.test.mjs` (or wherever `leave.tsx` is covered)
- Modify: `test/smoke.test.mjs` (a check that `main.ts` wires no `pagehide` to a leave)

**Produces:** `StoredSeat`, `SEATS_KEY = 'tankity-seats'`, `SEATS_MAX = 12`, `createSeatStore(storage: StorageLike | null, now: () => number): SeatStore` with `list(): StoredSeat[]`, `get(code): StoredSeat | null`, `remember(s: Omit<StoredSeat, 'at'>): void`, `forget(code): void`, `subscribe(fn): () => void`; `RoomClient.resume(s)`, `RoomClient.detach()`, `RoomClient.mine(seats): Promise<MineRow[]>`, `RoomClient.turnSecs`; `LobbyDeps.seats: SeatStore`; lobby returns `resumeRoom(code)`, `netStepOut(quiet?)`.

- [ ] **Step 1: Write the failing tests.**
  - `test/seats.test.mjs` (node:test, a Map-backed `StorageLike`): remember then `get` round-trips; a second `remember` for the same code replaces it and moves it first; the 13th seat drops the oldest; `forget` removes; malformed JSON in storage reads as empty and never throws; a storage whose `setItem` throws keeps the seat for the session (the kit `pref` behaviour); `subscribe` hears `remember`.
  - `test/net.test.mjs`: `resume({ code: 'FXT1', seat: 1, token: 'tok', csrf: 'c', ... })` then `getState()` sends `code=FXT1&token=tok`; `detach()` after `beginMatch` stops the poll (no request after advancing the fake clock past `MATCH_POLL_MS`), sends no beacon and no fetch, and clears `code`; `leave()` still beacons once; `mine([{ code, token }])` POSTs `rooms.php?action=mine` with body `{ seats: [...] }` and returns the reply's `rooms` (use the regenerated `protocol/mine-reply.json` fixture); an error reply rejects with the server's line; after `apply` of a snapshot with `turnSecs: 600`, `net.turnSecs === 600`.
  - `test/smoke.test.mjs`: `check('no-leave-on-close', !/pagehide[^\n]*sendLeave|pagehide[^\n]*leave\(/.test(mainSrc))`.
  - The leave veil test: rendering with `onStepOut` shows `#leave-step` ("Step out"), and clicking it calls `onStepOut`; the text says the seat waits.

- [ ] **Step 2: Run** `node --test games/tankity/test/seats.test.mjs games/tankity/test/net.test.mjs games/tankity/test/smoke.test.mjs` from `websites/www.cs`; expect failures.

- [ ] **Step 3: Implement.** `src/seats.ts`:

```ts
/* Operation Tankity: the seats this browser holds.
 *
 * Every room seat this browser hosted or joined, so closing the tab never
 * gives one up: the room link or Your games brings the player back to it.
 * Only an explicit Leave, or the server saying the room is gone, forgets one. */
import { json, pref } from '../../_kit/prefs.ts';
import type { StorageLike } from '../../_kit/ports.ts';

export interface StoredSeat { code: string; seat: number; token: string; csrf: string; initials: string; at: number }
export const SEATS_KEY = 'tankity-seats';
export const SEATS_MAX = 12;
interface Saved { v: 1; seats: StoredSeat[] }
const isSeat = (s: unknown): s is StoredSeat => { /* every field typed; code /^[A-Z0-9]{4}$/ */ };
const isSaved = (v: unknown): v is Saved =>
  !!v && typeof v === 'object' && (v as Saved).v === 1 && Array.isArray((v as Saved).seats) && (v as Saved).seats.every(isSeat);

export interface SeatStore {
  list(): StoredSeat[];
  get(code: string): StoredSeat | null;
  remember(s: Omit<StoredSeat, 'at'>): void;
  forget(code: string): void;
  subscribe(fn: () => void): () => void;
}
export function createSeatStore(storage: StorageLike | null, now: () => number): SeatStore {
  const p = pref<Saved>(SEATS_KEY, { v: 1, seats: [] }, json(isSaved), storage);
  const list = () => p.get().seats;
  return {
    list,
    get: code => list().find(s => s.code === code) ?? null,
    remember(s) {
      const rest = list().filter(x => x.code !== s.code);
      p.set({ v: 1, seats: [{ ...s, at: now() }, ...rest].slice(0, SEATS_MAX) });
    },
    forget(code) { p.set({ v: 1, seats: list().filter(x => x.code !== code) }); },
    subscribe(fn) { return p.subscribe(() => fn()); },
  };
}
```

`src/net.ts`: `turnSecs = 120` field set in `apply` from `room.turnSecs`; `resume(s)` = `this.forget(); this.code = s.code; this.seat = s.seat; this.token = s.token; this.csrf = s.csrf;`; `detach()` = today's `leave()` body without `sendLeave()`; `leave()` = `this.sendLeave(); this.detach();`; `mine(seats)` = `fetchJson('rooms.php?action=mine', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seats }) })`, throw on `!ok`, `onReachable(true)`, return `rooms`. Rewrite the `sendLeave` doc: it serves the explicit Leave only. `src/main.ts`: delete `window.addEventListener('pagehide', () => net.sendLeave());`; `const seats = createSeatStore(browserStorage(), () => Date.now());` passed to `createLobby` (and, in Task 6, to the watcher and title). `src/lobby.ts`:
  - after `net.host`/`net.join` succeed: `seats.remember({ code: net.code, seat: net.seat, token: net.token, csrf: net.csrf, initials })`.
  - `netLeave`: `const code = net.code; net.leave(); seats.forget(code);` (the lobby's **Leave room** goes through the same path).
  - `resumeRoom(code)`: `const s = seats.get(code); if (!s) return false; net.resume(s); MATCH.initials = s.initials;` then `getState()`; on an error whose message matches `/no such room|bad seat token/` → `seats.forget(code)`, `net.detach()`, open the lobby with "Room CODE has closed." and return; phase `lobby` → `lobbyTold` reset, open the lobby, `netRenderRoster(room)`, `netLobbyWatch()`; any other phase → `lobbyTold = { code, seq: 0 }` and `startNetMatch(room)`.
  - `maybeApplyInviteCode`: when `seats.get(code)` exists, `void resumeRoom(code)` instead of prefilling.
  - `netStepOut(quiet?)`: the cleanup `netLeave` does, but `net.detach()` instead of `net.leave()` and no `forget`; says "Stepped out of room CODE. Your seat waits; Your games brings you back." and `backToTitle()` unless quiet.
  - The leave veil: `onStepOut: () => { closeLeaveVeil(); netStepOut(); }`; text: "Step out keeps your seat: a drone fires for you when your turn runs out, and Your games brings you back. Leave gives the seat to the drone battery for good."
  - `askNotifications()` calls in `hostRoom`/`joinRoom` are deleted (Task 6 makes alerts opt-in).

- [ ] **Step 4: Run** the three node files again, then `bash games/tankity/test.sh`. Expected: pass.

- [ ] **Step 5: Commit** — `git commit -m "Tankity: seats survive closing the tab; resume by room link; Step out"`

---

## Task 5: The turn-time slider and long clocks in the browser

**Files:**
- Create: `src/turn-time.ts`, `src/ui/turn-time.tsx`, `test/turn-time.test.mjs`
- Modify: `src/ui/lobby.tsx` (slider in the host form; in a room: the host's slider or everyone else's label; intro copy)
- Modify: `src/lobby.ts` (`LobbyView.turnSecs`, host form value, `netTurnTime(secs)`, `net.host(..., turnSecs)`)
- Modify: `src/net.ts` (`host(initials, map, body, difficulty, turn)`)
- Modify: `src/ui/menu.tsx`, `src/menu.ts` (a Turn time row in a room: the host's slider, a label for the rest)
- Modify: `src/room.ts` (`turntime` and `auto` log lines; `tickTurnClock` copy)
- Modify: `src/hud.ts` (time left on the turn line for turn times ≥ 600), `src/shop.ts` (shop clock through `clockText`), `src/render.ts` (canvas clock copy)
- Modify: `test/hud.test.mjs`, `test/shop.test.mjs`, `test/menu.test.mjs`, the lobby component test (wherever `lobby.tsx` is covered)

**Consumes:** `turnSecs` snapshot field, `turntime` action (Tasks 1, 3). **Produces:** `TURN_STOPS`, `TURN_DEFAULT`, `TURN_LABELS`, `turnIndex(secs)`, `turnLabel(secs)`, `clockText(secs)`, `<TurnTime>` component.

- [ ] **Step 1: Write the failing tests** (`test/turn-time.test.mjs`, node:test):
  - `TURN_STOPS` deep-equals the integers parsed from `server/settings.php` (`/const ROOM_TURN_STOPS = \[([^\]]+)\]/`) and `TURN_DEFAULT` equals `ROOM_TURN_DEFAULT` parsed the same way.
  - `turnLabel(60) === 'Lightning · 1 min'`, `turnLabel(120) === '2 min'`, then `'10 min'`, `'30 min'`, `'8 h'`, `'24 h'`, `'1 week'`; `turnIndex(600) === 2`; `turnIndex(777) === 1` (the default's index).
  - `clockText(45.2) === '46 s'` (ceil), `clockText(599) === '9:59'`, `clockText(28799) === '7h 59m'`, `clockText(604799) === '6d 23h'`, `clockText(0) === '0 s'`.
  - `<TurnTime>` (importTsx + dom-stub): renders `input[type=range]` with `min=0 max=6 step=1`, `value` = index, an `<output>` with the label, `aria-valuetext` = the label; an `input` event with value `4` calls `onChange(28800)`; `disabled` renders only the label text (no range).
  - HUD: with `net.turnSecs = 28800`, my turn, `turnClockLeft() = 3600` → the turn line is `'YOU. Aim! · 1h 0m left'`; with `turnSecs = 120` it is `'YOU. Aim!'`.
  - Shop: `shopClockLeft() = 600` → the ready line includes `shop closes in 10:00`; `= 86400` → `shop closes in 1d 0h`.
  - Lobby component: the host form holds `#lobby-turn` (range) and `#host-go`; in a room the host sees `#room-turn` (range), a guest sees `#room-turn-label` with "Turn time: 10 min".
  - Menu: in a room the host sees `#menu-turn`; a guest sees its label; outside a room neither shows.

- [ ] **Step 2: Run** `node --test games/tankity/test/turn-time.test.mjs games/tankity/test/hud.test.mjs games/tankity/test/shop.test.mjs games/tankity/test/menu.test.mjs` from `websites/www.cs`; expect failures.

- [ ] **Step 3: Implement.** `src/turn-time.ts`:

```ts
/* Operation Tankity: a room's turn time.
 *
 * The host's seven stops (server/settings.php ROOM_TURN_STOPS is the
 * authority; test/turn-time.test.mjs keeps this list equal to it), their
 * labels, and how a clock reads at any length. */
export const TURN_STOPS = [60, 120, 600, 1800, 28800, 86400, 604800] as const;
export const TURN_DEFAULT = 120;
export const TURN_LABELS = ['Lightning · 1 min', '2 min', '10 min', '30 min', '8 h', '24 h', '1 week'] as const;
/** Turn times this long or longer show the time left on the status bar. */
export const TURN_LONG_S = 600;
export function turnIndex(secs: number): number {
  const i = (TURN_STOPS as readonly number[]).indexOf(secs);
  return i >= 0 ? i : (TURN_STOPS as readonly number[]).indexOf(TURN_DEFAULT);
}
export function turnLabel(secs: number): string { return TURN_LABELS[turnIndex(secs)]!; }
export function clockText(secs: number): string {
  const s = Math.max(0, Math.ceil(secs));
  if (s < 60) return `${s} s`;
  if (s < 3600) return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
}
```

`src/ui/turn-time.tsx`: `TurnTime({ id, secs, disabled, onChange })` renders a `<label for={id}>Turn time</label>`, `<input type="range" id={id} min=0 max=6 step=1 value={turnIndex(secs)} aria-valuetext={turnLabel(secs)} onInput=... />` and `<output for={id}>{turnLabel(secs)}</output>`; disabled renders `<p class="hint" id={id + '-label'}>Turn time: {turnLabel(secs)}</p>`. Arrow keys work natively; bind no key. The lobby keeps the chosen value in `LOBBY.turnSecs` (default `TURN_DEFAULT`), passes it to `net.host(..., LOBBY.turnSecs)` (body `turn`); in a room the host's `onChange` calls `netTurnTime(secs)` = `net.post('turntime', { secs })` and redraws from the reply (errors to `lobbySay(prettyRoomError(err))`). The roster render sets `LOBBY.turnSecs = room.turnSecs`. Intro copy in `lobby.tsx`: replace "a quiet crew fires on its own after a while so no room ever stalls" with "the host sets how long a turn lasts, from one minute to a week; when a turn runs out, a drone fires for that player, and closing the tab keeps your seat". Menu: in a room, `MenuProps.turn = { secs: net.turnSecs, host: net.isHost }`, host `onTurn(secs)` → the same `turntime` post (in a match the reply goes through `net.apply`). `src/room.ts` `netEvent`: `if (e.t === 'turntime') { say(`${seatName(e.seat)} set the turn time to ${turnLabel(e.secs)}, from the next turn.`, 'info'); return; }`; the `auto` line becomes `` `${seatName(e.seat)} was away, so a drone fired for them.` ``; `tickTurnClock`'s line: `` `${Math.ceil(left)} seconds left. Fire, or a drone fires for you.` ``; its comment names `turnSecs` instead of `ROOM_TURN_SECS`. `src/render.ts`: 'Fire now, or a drone fires for you' / 'A drone fires if the clock runs out'. `src/hud.ts`: on the net turn line, when `net.turnSecs >= TURN_LONG_S` and `net.turnClockLeft()` is a number, append `` ` · ${clockText(left)} left` `` (add `turnSecs` and `turnClockLeft` to the HUD's `net` Pick). `src/shop.ts`: `` ` · shop closes in ${clockText(left)}` ``. `src/protocol.ts` doc for `turnLeft`: "Seconds before a drone fires for the human on turn".

- [ ] **Step 4: Run** the node files again, then `bash games/tankity/test.sh`. Expected: pass.

- [ ] **Step 5: Commit** — `git commit -m "Tankity: turn-time slider for the host, long clocks in the HUD and shop"`

---

## Task 6: Your games, toasts and turn alerts

**Files:**
- Create: `src/games.ts`, `src/notify.ts`, `src/ui/games.tsx`, `src/ui/toast.tsx`, `test/games.test.mjs`, `test/notify.test.mjs`, `test/games-ui.test.mjs`
- Modify: `index.html` (`<div id="toast-root" class="toasts" aria-live="polite"></div>`), `game.css` (toast stack, Your games rows; phone width with no horizontal scroll)
- Modify: `src/ui/title.tsx`, `src/title.ts` (`games` prop: rows, `onOpen(code)`, alerts button)
- Modify: `src/ui/lobby.tsx`, `src/lobby.ts` (Your games when not in a room; Turn alerts button in a room)
- Modify: `src/room.ts` (`askNotifications` removed; `turnAlert` notifies only when alerts are on, through `src/notify.ts`)
- Modify: `src/main.ts` (build the watcher, start it after load, `visibilitychange` → `pollNow`; toast state and rendering)

**Consumes:** `RoomClient.mine`, `SeatStore`, `resumeRoom`, `netStepOut` (Task 4), `clockText`, `turnLabel` (Task 5). **Produces:** `GAMES_POLL_MS`, `createGamesWatch`, `notifyPermission`, `askNotify`, `showTurnNotification`, `ALERTS_KEY = 'tankity-turn-alerts'`, `<YourGames>`, `renderToasts`.

- [ ] **Step 1: Write the failing tests.**
  - `test/games.test.mjs` (fake timers like `net.test.mjs`; a fake `mine` that records calls and returns scripted rows; a Map store):
    - no stored seats → `start()` makes no `mine` call and `onRows([])` is called;
    - two seats, `viewing() === 'AAAA'` → `mine` is asked only for `BBBB`;
    - a `gone` row → `store.forget('BBBB')` and the row is not passed to `onRows`;
    - `yourTurn` with `turnKey '1:0:3'` → `onTurn` once; the same key on the next poll → no second call; key `'1:0:5'` → a second call;
    - a row for the room on screen never reaches `onTurn` even when `yourTurn` (switch `viewing()` between polls);
    - a rejected `mine` → no throw, no `onRows`, the next tick polls again;
    - polls repeat every `GAMES_POLL_MS` (10 000); `pollNow()` polls at once and does not double up while one is in flight; `stop()` clears the interval.
  - `test/notify.test.mjs` (stub `globalThis.Notification`): no `Notification` → `notifyPermission() === 'unsupported'` and `askNotify()` resolves `'unsupported'`; a promise-style `requestPermission` resolving `'granted'` → `'granted'`; a callback-style one (returns undefined, calls its callback with `'denied'`) → `'denied'`; `showTurnNotification` with alerts off or permission not granted does nothing; with both, constructs one `Notification` with `tag: 'tankity-turn-7K2Q'` and a body naming the room and the other players, and its `onclick` calls the given handler.
  - `test/games-ui.test.mjs` (importTsx + dom-stub): `<YourGames rows=[...]>` renders one `li` per row with the texts in the Design ("Your turn, 7h 59m left", "ZED's turn", "Shop open", "Waiting in the lobby", "Match over") and an **Open** button whose click calls `onOpen('7K2Q')`; the Turn alerts button reads "Turn alerts: off" / "Turn alerts: on" / "Turn alerts: blocked in this browser" / hidden when unsupported, and its click calls `onAlerts`; `renderToasts` renders each toast's text, a **Go** button (`onGo`) and a close button (`onClose`), and nothing when empty. The title card shows `#your-games` only when rows are non-empty.

- [ ] **Step 2: Run** `node --test games/tankity/test/games.test.mjs games/tankity/test/notify.test.mjs games/tankity/test/games-ui.test.mjs`; expect failures.

- [ ] **Step 3: Implement.** `src/games.ts`:

```ts
/* Operation Tankity: the rooms this browser sits in, watched.
 *
 * Polls rooms.php?action=mine for every stored seat but the room on screen
 * (which has its own poll and alert), hands the rows to the Your games list,
 * forgets rooms the server says are gone, and reports each turn that starts
 * once (by its turn key). The server applies any timeout that is due while
 * answering, so a turn that ran out while nobody looked moves on here too.
 * DOM-free: timers and the fetch arrive as deps. */
import type { MineRow } from './protocol.ts';
import type { SeatStore } from './seats.ts';
export const GAMES_POLL_MS = 10_000;
export type LiveRow = Extract<MineRow, { gone: false }>;
export interface GamesWatchDeps {
  store: SeatStore;
  mine(seats: { code: string; token: string }[]): Promise<MineRow[]>;
  setInterval(fn: () => void, ms: number): unknown;
  clearInterval(id: unknown): void;
  /** The room on screen (its lobby or match), or ''. */
  viewing(): string;
  onRows(rows: LiveRow[]): void;
  onTurn(row: LiveRow): void;
}
export function createGamesWatch(d: GamesWatchDeps) {
  const told = new Set<string>();
  let id: unknown = 0;
  let busy = false;
  async function poll(): Promise<void> {
    if (busy) return;
    const here = d.viewing();
    const asks = d.store.list().filter(s => s.code !== here).map(s => ({ code: s.code, token: s.token }));
    if (!asks.length) { d.onRows([]); return; }
    busy = true;
    try {
      const rows = await d.mine(asks);
      const live: LiveRow[] = [];
      for (const r of rows) {
        if (r.gone) { d.store.forget(r.code); continue; }
        live.push(r);
        const key = r.code + '#' + r.turnKey;
        if (r.yourTurn && r.turnKey && r.code !== d.viewing() && !told.has(key)) { told.add(key); d.onTurn(r); }
      }
      d.onRows(live);
    } catch (_) { /* the next tick asks again */ } finally { busy = false; }
  }
  return {
    start() { if (!id) id = d.setInterval(() => { void poll(); }, GAMES_POLL_MS); void poll(); },
    stop() { if (id) { d.clearInterval(id); id = 0; } },
    pollNow: poll,
  };
}
```

`src/notify.ts`: `notifyPermission()`, `askNotify()` (wraps `Notification.requestPermission`, accepting both the returned promise and the callback, inside try/catch), `alertsPref(storage)` (`'on' | 'off'`, default `'off'`, key `tankity-turn-alerts`), `showTurnNotification({ code, others }, alertsOn, onClick)` (title "Your turn in Operation Tankity", body `Room ${code} · vs ${others}`, `tag: 'tankity-turn-' + code`; `onclick` focuses `window.top` else `window`, closes, calls `onClick`). `src/ui/toast.tsx`: a list of `{ id, text, onGo, onClose }` rendered into `#toast-root`; each toast has `role="status"`, a **Go** button and a close button with `aria-label="Dismiss"`; no key binding. `src/main.ts` wiring:

```ts
const watch = createGamesWatch({
  store: seats, mine: list => net.mine(list),
  setInterval: (fn, ms) => setInterval(fn, ms), clearInterval: i => clearInterval(i as number),
  viewing: () => net.code,
  onRows: rows => { gamesRows = rows; renderTitle(); renderLobby(); },
  onTurn: row => {
    // `players` lists humans only, so a seat number is not an index into it: drop this seat's own initials.
    const me = seats.get(row.code)?.initials ?? '';
    const others = row.players.filter(p => p !== me);
    pushToast(`Your turn in ${row.code} · vs ${others.join(', ') || 'the drones'}`, () => openGame(row.code));
    if (document.hidden) showTurnNotification({ code: row.code, others }, alerts.get() === 'on', () => openGame(row.code));
  },
});
``` `openGame(code)`: if `net.code` and `net.code !== code` → `lobby.netStepOut(true)`; then `lobby.resumeRoom(code)`; close the title card if the resume starts a match (the resume path already does). Toasts auto-close after 12 s (`setTimeout`). `document.addEventListener('visibilitychange', () => { if (!document.hidden) void watch.pollNow(); })`. Start the watcher at boot and leave it running (it asks nothing when the store is empty). Title card and lobby get `games: { rows, alerts: alertsState(), onOpen: openGame, onAlerts }`; `onAlerts` runs in the click: when off → `askNotify()` then set `on` if granted (the button shows "blocked in this browser" if denied); when on → set `off`. `room.ts`: delete `askNotifications` and its dep everywhere (`LobbyDeps`, `main.ts`), and in `turnAlert` replace the inline `new Notification` with `showTurnNotification({ code: net.code, others: <the other humans' initials from net.seats> }, alerts.get() === 'on', () => {})`.

- [ ] **Step 4: Run** the three new node files, then `bash games/tankity/test.sh`. Build and look once by hand in the docker site (`make up` with your own `COMPOSE_PROJECT_NAME`, then the play URL): host a room, Step out, see the room in Your games on the title card.

- [ ] **Step 5: Commit** — `git commit -m "Tankity: Your games list, turn toasts, opt-in turn alerts"`

---

## Task 7: Browser checks and the docs

**Files:**
- Create: `tests/e2e/tankity-rooms-long.spec.mjs`
- Modify: `tests/e2e/tankity-rooms.spec.mjs` (replace "closing every player tab frees the room slot at once")
- Modify: `tests/e2e/helpers.mjs` only if a helper is missing (e.g. `stepOut(page)`)
- Modify: `README.md` (settings table, Files rows for `src/seats.ts`, `src/games.ts`, `src/notify.ts`, `src/turn-time.ts`, `src/ui/games.tsx`, `src/ui/toast.tsx`, `src/ui/turn-time.tsx`; the rooms-storage paragraphs at lines ~148 and ~174; a new "Long games" section)
- Modify: `rooms-web-test.php` if it asserts anything about room age

- [ ] **Step 1: Write the specs.** `tankity-rooms-long.spec.mjs` (each test `test.setTimeout(180_000)`, contexts closed at the end, `errors` empty):
  1. **The room link brings a closed tab back to its seat.** `roomPair`, host starts; read the guest's seat token from a `state` request (the pattern in `tankity-rooms-leave.spec.mjs`); `await guest.page.close()`; `ping` still counts the room; open a new page in the same `guest.ctx` at `games/tankity/?code=CODE` → no join form shown, the match HUD appears, and its first `state` request carries the same token.
  2. **Step out lists the room, and a turn there raises a toast.** `roomPair`, host starts with seats 2 and 3 set Open; the guest opens the menu's leave veil and clicks `#leave-step` → title card shows `#your-games` with the code; when the guest's turn comes (the host fires), `#toast-root` shows `Your turn in CODE` within 25 s; clicking **Go** returns the guest to the match with `YOU. Aim!` in the HUD.
  3. **The host sets the turn time; a mid-game change reaches everyone.** In the lobby the host moves `#room-turn` to index 2 (keyboard: focus, `ArrowRight`) → the guest's `#room-turn-label` reads "Turn time: 10 min" within one poll; start; the host opens the menu and sets `#menu-turn` to index 4 → both radio logs (`#log`) read "set the turn time to 8 h"; the guest's last snapshot has `turnSecs: 28800`.
  The rewritten case in `tankity-rooms.spec.mjs`: **closing every player tab keeps the room** — close both contexts' pages, `ping`'s `used` is unchanged after 5 s, and `state` for the code (no token) still answers the room.

- [ ] **Step 2: Run them**

```bash
cd websites/www.cs && COMPOSE_PROJECT_NAME=tankity-long-$$ make up && \
  COMPOSE_PROJECT_NAME=tankity-long-$$ make e2e E2E_ARGS="tankity-rooms-long.spec.mjs tankity-rooms.spec.mjs"
```
(Two specs locally; CI runs the rest. `make down` with the same project name afterwards.) Fix what fails in the code, not by loosening the specs.

- [ ] **Step 3: Docs.** README settings table: `max_rooms` 50 "Rooms that exist at once"; `room_live_secs` 600 "Seconds a lobby lives after its last touch, and the shortest idle limit of a started room"; delete the `room_max_age` row, its env name in the Files table and in `.config.yaml`'s comment block. New "Long games" section, current state only: the seven stops and who changes them when; the stand-in drone; the shop clock rule; the idle formula and the lobby rule; seats in `tankity-seats`, Step out vs Leave, the room link; `action=mine`, the 10 s watcher, toasts, opt-in turn alerts and that they need a tab open. Leave the Esc developer notes untouched.

- [ ] **Step 4: Final gate**

```bash
cd websites/www.cs/games && node _kit/build/build.mjs tankity && (cd tankity && php tools/install-files.php) && \
  cd .. && bash games/tankity/test.sh && COMPOSE_PROJECT_NAME=tankity-long-$$ make test
```
Expected: every check green within the `make test` budgets.

- [ ] **Step 5: Commit** — `git commit -m "Tankity: long-game browser checks and docs"`
