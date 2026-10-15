# Tankity: Room Cap Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Real players are never starved out of Tankity's rooms by a handful of cooperating addresses, on one shared PHP 8.4 host with SQLite. Only a match with two or more humans at Start holds one of the `max_rooms` server slots. A one-human game plays in the browser, like solo. Lobbies wait in a cheap pool of their own. When every slot is taken, a new match reclaims the stalest room instead of being refused. Creating and joining cost a small proof of work, which gets harder under load. Room codes are long enough that guessing them is impractical.

**Architecture:** The `rooms` table gains columns that `room_save` writes from the room's state (`phase`, `acted`, `turn_secs`), the same way it already writes `expires`. That lets the slot count, the lobby count, eviction and reclaim stay plain SQL over at most a few hundred small rows. The `closed` table keeps tombstones, so evicted players hear why. The `pow_used` table refuses replayed puzzles. A started room counts toward `max_rooms`; a lobby counts toward `max_lobbies`. `start` takes the slot under the write lock it already holds. If no slot is free, it closes the stalest eligible room in the same transaction. With one human seated, `start` closes the lobby and the browser plays the match locally. The proof of work is stateless on issue: an HMAC-signed challenge bound to the address hash. Verifying it costs four PBKDF2-HMAC-SHA256 runs of 100 iterations each. The browser solves it with WebCrypto `deriveBits`.

**Tech Stack:** PHP 8.4 (`pdo_sqlite`, `hash_pbkdf2`, `hash_hmac`), SQLite, TypeScript 7 (native type stripping for `node --test`), Preact 11, esbuild via `games/_kit/build/build.mjs`, WebCrypto (`crypto.subtle.importKey`/`deriveBits`, PBKDF2 + SHA-256: Chrome, Safari 11+, Firefox), PHPUnit 12, Playwright (chrome, plus webkit and firefox for the proof-of-work spec).

**Spec:** the Design section below. It supersedes the abuse limits in `2026-10-13-tankity-long-games.md` (rulings on the long share and the two-address idle rule). Its findings come from `.superpowers/sdd/2026-10-13-tankity-long-games/review-1-3.md` item 5 (the residual denial of service).

**Branches:** three PRs off `main`, each in its own worktree under `.claude/worktrees/`, merged in order. GitHub deploys each one after merge, so each PR must leave production fully working on its own. Every PR is a vertical slice (server, client, tests, docs).

| PR | Branch | Tasks | What players notice |
|---|---|---|---|
| 1 | `games/tankity-slots` | 1-5 | Lobbies never fill the server. A full server reclaims the stalest room. Evicted players see "closed to make space". |
| 2 | `games/tankity-local-start` | 6-8 | A room started with only its host plays at once on the device, like solo. |
| 3 | `games/tankity-pow-codes` | 9-14 | "Setting up the room…" for about a second on Host and on Join. Room codes have 6 characters. |

All paths are relative to `websites/www.cs/games/tankity/` unless they start with `websites/` or `tests/` (the latter is `websites/www.cs/tests/`).

---

## Global Constraints

- Long-games behaviour stays intact:
  - turn timers and their stamped clocks;
  - the stand-in drone;
  - seats kept across visits (`tankity-seats`);
  - Your games, toasts and turn alerts;
  - `state` and `mine` stay reads unless a tick is due;
  - the FF game speed and the room speed.
- No client clock is trusted. Every age, TTL, floor and tier is computed from the server's `time()`. Replies carry seconds-from-now (`closesIn`, `expiresIn`), never a deadline for the client to compare against its own clock.
- Per-request cost stays small on the shared host:
  - Counts read indexed columns. No count unserializes a room.
  - Picking a victim (lobby or room) is one `SELECT` over columns plus one decode of the victim.
  - Issuing a challenge is three indexed reads and an HMAC.
  - Verifying a proof of work is four `hash_pbkdf2` runs of 100 iterations (about 0.2 ms).
- Old clients during a deploy fail gracefully:
  - A request this server can no longer serve for an old bundle gets **426** with `{"error": "Tankity was updated. Reload the page to keep playing.", "reload": true}`.
  - Old bundles show `error` verbatim on the lobby line (`prettyRoomError` passes unknown lines through).
  - Running matches, polls, acts and `mine` keep their wire shapes. Fields are only ever added.
- Esc is never bound or mentioned to players; Q is back.
- Docs (README, comments, `.config.yaml`) describe the current state, never history.
- No ssh or deploy work. GitHub deploys after merge.
- Never hardcode weapon groups. This plan touches no weapon code.
- Tests: write each test first and run it red, then implement and run it green.
  - PHPUnit at the handler level uses `RoomGuardTest::call()`'s `proc_open` harness, moved to a shared trait in Task 1.
  - Node tests are `node:test` under `test/*.test.ts`.
  - e2e runs on the docker stack:
    ```bash
    COMPOSE_PROJECT_NAME=tankity-cap-$$ make e2e E2E_ARGS="<spec>"
    ```
    Run it from `websites/www.cs`, and never bind 3000, 5173, 8000 or 8080.
  - Run at most two specs locally; CI runs the rest.
- Quick gate: `bash games/tankity/test.sh` from `websites/www.cs`. Full gate before each PR: `make test` (docker), with a unique `COMPOSE_PROJECT_NAME`.
- Build after any `src/` change, then commit the regenerated `dist/`, `index.html` and `sw.js`:
  - `node _kit/build/build.mjs tankity` from `websites/www.cs/games`;
  - `php tools/install-files.php` in `games/tankity`.
- Protocol fixtures are regenerated with `make protocol` (docker), never by hand.
- Commit after each task, ending the message with the session attribution lines.

## Review Focus

1. **Slot accounting has one source:** the `phase` column that `room_save` writes. Only `play`, `shop` and `over` rows count toward `max_rooms`. Only `lobby` rows count toward `max_lobbies`. No path creates a started row without passing `room_take_slot` under the write lock.
2. **The reclaim order is exactly the Rulings' order,** with no way for an active room to go while an eligible staler one exists. Both the ordering and the floor are tested with fixed clocks.
3. **Only turn-moving acts stamp `acted`.** `menu`, `body` and an off-turn `weapon` keep a room alive for nobody.
4. **Tombstones never leak.** A `closed` row answers only to a token whose hash it holds. It never makes a code joinable and never revives a room.
5. **Proof-of-work checks run in a fixed order:**
   1. format;
   2. MAC (purpose and address are bound into it);
   3. age, by the server clock;
   4. the work;
   5. replay, inserted in the same transaction as the room write.

   A join's work is checked before the code is looked up, so an unsolved guess learns nothing.
6. **Old bundles see the 426 reload line,** never a frozen tab or a crash, on create, join and a one-human start.

---

## Design

### What is scarce

Each started room is one row of about 40 KB. A row costs disk only, and polls of it are reads. The writer lock and the PHP workers are what run out. They are spent by acts, by heartbeats and by the sim. `max_rooms` therefore bounds the matches people play together: 2+ humans, the only matches that file scores online. A lone human against drones needs no referee. It already runs as solo in the browser, and from PR 2 a one-human room does too. A lobby is small (no terrain, no tanks). Its only ongoing cost is one heartbeat write per seated tab every `ROOM_HEARTBEAT_SECS` (20 s), so lobbies get a pool with its own cap.

### Attack model

The attacker is a set of cooperating clients:

- up to 13 IPv4 addresses, or one IPv6 /56 (256 `/64` keys);
- native code that speaks the wire protocol and computes SHA-256 at native speed (about 20 M compressions/s per core);
- no access to the host or to `addr_key`.

Goals:

- **A1 hold every slot:** keep all `max_rooms` started for days, so real 2-human matches cannot start.
- **A2 lobby flood:** fill the lobby pool so real hosts cannot open a lobby.
- **A3 code guessing:** find live lobby codes and sit in strangers' rooms.
- **A4 puzzle replay:** reuse one solved puzzle for many creates or joins.
- **A5 stale puzzles:** stockpile puzzles while the server is calm and spend them under load.
- **A6 cheap keep-alive:** keep a held room "active" with requests that cost nothing (`menu`, `body`).

Out of scope: an attacker with hundreds of real IPv4 addresses running bots that genuinely play every room around the clock. That is indistinguishable from a busy day. The design makes it as expensive as playing, and it names the remaining cost below.

### Capacity math

Defaults: `max_rooms` 50, `max_lobbies` 100, `room_hosts_per_address` 4, `lobbies_per_address` 4, `room_joins_per_hour` 300, codes of 6 characters from a 31-letter alphabet (887,503,681 codes).

| Scenario | Today | After this plan |
|---|---|---|
| A1, idle hold. Each address hosts 4 long rooms; a second address joins each one. | 13 addresses hold 50/50 slots for 2 weeks with zero ongoing work. | Every held room is eligible 1 h after its last turn-moving act. The next real 2-human Start reclaims the stalest. Holding needs a bot that takes a turn in every room at least hourly. |
| A1, played hold. Bots fire on their turns in 50 rooms. | Same as idle. | Possible (residual), but needs ≥ 13 addresses (hosting cap 4) and 50 live bot sessions playing turns, which also needs ≥ 2 humans per room at Start. Matches end, and a finished match (`over`) is the first room reclaimed. Each match cycle needs a lobby (one create puzzle) and a join puzzle per guest. |
| One human plus drones | Holds 1 slot (10 min idle limit). | Holds 0 slots: plays locally. |
| A2, lobby flood | Lobbies are rooms: 13 addresses × 4 lobbies = 52 lobbies take every slot while heartbeating. | Lobbies hold 0 slots. Filling 100 lobbies needs 25 addresses (4 each), each heartbeating every 20 s, and each lobby cost a create puzzle. A lobby younger than 10 min with a live tab is never evicted, so a real host waits at most until the oldest held lobby turns 30 min old, then reclaims it. |
| A3, code guessing (4 chars) | 923,521 codes, ≤ 50 joinable rooms, 300 guesses/h/address. One /56: 76,800/h, a hit every 15 min. | Not applicable (codes are 6 chars). |
| A3, code guessing (6 chars) | Not applicable. | 887 M codes, ≤ 100 joinable lobbies (started rooms refuse joins). One /56: 76,800/h, a hit every ~115 h. Every guess first pays a join puzzle (≈ 40-80 ms of one native core). A hit buys one seat in a stranger's lobby; the host sees the initials before Start. |
| A4, replay | Not applicable. | `pow_used` refuses a second use of any challenge (409). |
| A5, stockpile | Not applicable. | A challenge lives 120 s by the server clock and is bound to its purpose and address, so a stockpile covers two minutes from one address. |
| A6, cheap keep-alive | Any act through `room_gate` (`menu`, `body`) refreshes `actedAt`. | Only turn-moving acts stamp `acted` (Ruling 4). |

Request costs:

- A `start` that must reclaim adds one `SELECT … LIMIT 1` over ≤ 50 rows (columns only), one decode (the victim's tokens for its tombstone), one `DELETE` and one `INSERT`, all under the lock `start` already holds.
- A `create` into a full lobby pool adds the same, over ≤ 100 rows.
- `ping` and `challenge` read two indexed `COUNT`s plus one `SUM` over the `rate` table.

### Proof of work

- **Function:** PBKDF2-HMAC-SHA256.
  - Key: the challenge string's bytes.
  - Salt: `"tankity-pow|" . nonce`, where the nonce is a decimal integer.
  - Iterations: `POW_ITER = 100`. Output: 32 bits.
  - A nonce solves the challenge when its output has at least `bits` leading zero bits.
- **Solution:** `POW_COUNT = 4` distinct nonces, each solving the challenge. Four solutions at `bits` take the same mean work as one at `bits + 2`. The tail is much shorter: the 95th percentile is about 1.6× the mean instead of 3×. That keeps a join "instant-ish" on a mid phone.
- **Why PBKDF2 and not one SHA-256 per guess.**
  - A browser can only reach SHA-256 through WebCrypto. Each `digest` call costs tens of µs of promise and thread overhead, against about 0.1 µs of hashing.
  - With plain hashcash, a native attacker would be roughly 1000× faster than a phone.
  - One `deriveBits` call runs 200 compressions natively inside the browser, so the overhead is a small part of each guess, and the gap falls to about 5-10×.
  - The server still verifies in microseconds: 4 × 100 iterations.
- **Challenge:** `v1.<issued>.<purpose>.<bits>.<rand>.<mac>`.
  - `issued` is the server's unix seconds.
  - `purpose` is `c` (create) or `j` (join).
  - `rand` is 16 random bytes in base64url.
  - `mac` is the first 22 base64url characters of `HMAC-SHA256(pow_key, payload . "|" . room_client_hash())`, where `pow_key = HMAC-SHA256(addr_key, "tankity-pow-v1")`.
  - It is not stored. It is valid for `POW_TTL = 120` s by the server clock. `issued` more than 5 s in the future is refused.
- **Difficulty** comes from `room_pow_bits(purpose)`:
  - Base: `pow_bits` (setting, default 9) for a join, and `pow_bits + 1` for a create.
  - +1 when started rooms ≥ 75 % of `max_rooms`, or lobbies ≥ 75 % of `max_lobbies`, or creates in the last 10 min ≥ `pow_surge` (default 60).
  - +2 when started rooms ≥ `max_rooms`, or lobbies ≥ `max_lobbies`.
  - The total raise is at most +2, so a phone stays within about 2-4 s at the worst.
  - The bits ride inside the MACed challenge, so a raise between issue and redeem never refuses a solver.
  - `pow_bits: 0` turns the proof of work off. Create and join then accept a missing `pow`. The server still requires `proto: 2`.
- **Initial numbers, recalibrated in Task 13:** 4 × 2^9 = 2,048 expected PBKDF2 runs for a join.
  - A mid phone is assumed to do ~4-8 k runs/s with 4 in flight (≈ 0.3-0.5 s for a join, ≈ 0.6-1 s for a create).
  - A native core does ~100 k/s (≈ 20 ms).
  - Task 13 measures the three engines and sets `pow_bits` so a mid phone's join is ≤ 1 s.

### Fairness of reclaim (exact)

The quantities:

- `acted` is the server time of the room's last turn-moving act (Ruling 4).
- `T` is the room's turn time (`room_turn_secs`).
- `L` is `room_live_secs()` (600).
- `D` is `ROOM_DORMANT_SECS = 3600`.
- `idle = now - acted`.

The floor is:

```
floor(room) = max(L, min(2 * T, D))
```

Then:

- A room is **eligible** when `phase = 'over'` or `idle >= floor`.
- An eligible room's **tier** is:
  - 0 when `phase = 'over'` (its standings already live in every player's browser);
  - 1 (**stale**) when `idle >= max(L, 2 * T)`;
  - 2 (**dormant**) otherwise. Only long rooms can be dormant, since for `T <= 1800` the floor is already `2 * T`.
- The **victim** is the eligible room with the smallest `(tier, acted, code)`. With no eligible room, the Start is refused (409, "Every match slot is in play. Try again in a few minutes.").

Guarantees, each one a test in Task 4:

- A room whose last turn-moving act is within its floor is never reclaimed.
- A room within twice its own turn time (a dormant long room) is reclaimed only when no finished or stale room exists.
- Within a tier, the room idle longest goes first.

Why the floor is capped at 1 h for long rooms instead of being a plain `2 × T`:

- With `2 × T`, a week-long room is protected for two weeks. That equals its idle limit, so reclaim would never touch a week room, and attack A1 stays exactly as it is today.
- The cap means a long game risks eviction only after an hour with nobody taking a turn, and only on a full server with no finished or stale room left. Its players then see "closed to make space" in Your games.

### Lobby pool (exact)

- A lobby is a `rooms` row with `phase = 'lobby'`.
- **Caps:**
  - At most `max_lobbies` (default 100) live lobbies.
  - At most `lobbies_per_address` (default 4) hosted by one address.
- **Making a lobby** (`create`, and `again`, which returns a finished match to its lobby) when the pool is full evicts one lobby, picked in this order:
  1. **Dead:** `touched < now - 2 * ROOM_HEARTBEAT_SECS` (no tab polling it). Oldest `touched` first.
  2. **Idle:** `now - acted >= L` (nobody did anything for 10 min). Oldest `acted` first.
  3. **Old:** `now - created >= ROOM_LOBBY_OLD_SECS` (1800). Oldest `created` first.

  With none of these, the request is refused (409, "Every lobby is busy. Try again in a minute."). A lobby that is under 30 min old, was acted in within 10 min and has a live tab is never evicted.
- **Without pressure** a lobby lives as today: `touched + L`, heartbeated by seated polls.
- An evicted lobby gets a tombstone like an evicted room. Its players see "This lobby was closed to make space."

### Tombstones

- `closed(code PRIMARY KEY, reason TEXT, at INTEGER, seats TEXT)`.
  - `reason` is `'space'`.
  - `seats` is a JSON list of `substr(hash('sha256', token), 0, 32)`, one per human seat.
  - Kept `ROOM_TOMBSTONE_SECS = 1209600` (14 days); housekeeping drops older rows.
- `room_alloc` never draws a code that has a tombstone.
- `state` and every gated act on a missing room answer 404 `{"error": "no such room"}`. When a tombstone holds the asker's token hash, the reply adds `"closed": "space"`. Old bundles match `no such room` and say "Room CODE has closed." New ones say "Room CODE was closed to make space."
- `mine` answers `{code, gone: true, closed: "space"}` for such a seat.
  - New bundles keep the seat entry, marked closed.
  - Your games shows "Closed to make space", with Dismiss.
  - Old bundles forget it, as they forget any `gone` row.

### One human at Start (PR 2)

- Hosting always makes a server lobby (a lobby place, no slot), so friends can join by code.
- **Start with 2+ humans seated** promotes the room to a match: it takes a slot, reclaiming one if it must.
- **Start with 1 human** closes the lobby row (no tombstone; the host closed it) and answers `{"ok": true, "local": {"difficulty": "...", "speed": n}}`. The browser:
  - forgets the seat;
  - says "Nobody else joined, so this match plays here on your device.";
  - starts a solo match with the room's Difficulty and speed.
- The local match is solo in every respect:
  - three drones on random hills (the server's named hills keep their seeds on the server, and open seats are a server-match setting);
  - no turn clock (the only human is at the keyboard);
  - the local board;
  - not listed in Your games;
  - Q and Quit leave it as they leave solo.
- The lobby's turn-time slider keeps its value for the next room.
- The room hint says this before Start: "With only you seated, Start plays here on your device."
- An old bundle sending `start` for a one-human lobby gets the 426 reload line, and the lobby is left as it was.
- A server match whose humans drop to one mid-match stays a server match until it ends. Play again from it returns to the lobby, where the rule applies again.

### Room codes (PR 3)

- 6 characters from `ROOM_CODE_ALPHABET` (31 letters and digits, no 0/O/1/I).
- The server accepts `^[A-Z0-9]{4}$|^[A-Z0-9]{6}$`, so rooms made before PR 3 keep working until they end.
- The join box takes 4 or 6 characters, ignoring spaces and hyphens, and shows the code as `K7Q 2MX`.
- A guess pays its join puzzle before the code is looked up.

### Protocol changes

| Where | Change |
|---|---|
| `GET action=challenge&for=create\|join` | New. `{ok: true, challenge, bits, count, iter, expiresIn}`. Not charged. |
| `create`, `join` body | Gain `proto: 2` (required) and `pow: {c: string, n: number[]}` (required unless `pow_bits` is 0). Missing `proto` gives 426 with the reload line. |
| `start` body | Gains `proto: 2`. One human with no `proto` gives 426. One human with `proto` gives `{ok: true, local: {difficulty, speed}}`. |
| 404 `no such room` | Gains `closed: 'space'` when a tombstone holds the token. |
| `MineRow` gone | Gains `closed?: 'space'`. |
| `PingReply` | `rooms: {used, max}` now counts started matches. Gains `lobbies: {used, max}`. |
| `RoomSnapshot` | Unchanged. |

### Retired and kept limits

Kept:

| Limit | Status | Why |
|---|---|---|
| `max_rooms` | **Kept**, narrowed | Counts started rooms (`play`, `shop`, `over`) only. |
| `room_hosts_per_address` | **Kept**, narrowed | Counts started rooms hosted. Lobbies have `lobbies_per_address`. |
| `room_joins_per_hour` | **Kept** | Bounds guessing per address. The puzzle bounds it per CPU. Neither replaces the other. |
| `room_live_secs` | **Kept** | Lobby lifetime, the reclaim floor's minimum, the lobby idle tier, the finished-match window. |
| `addr_key` | **Kept** | Also keys `pow_key`. |

Retired:

| Limit | Why it goes |
|---|---|
| `room_long_share` (`TANKITY_ROOM_LONG_SHARE`, `ROOM_LONG_FULL`, `room_long_count`) | It existed so idle long rooms could not fill the server. Reclaim makes a long room's slot reclaimable 1 h after its last turn. An active long game is as legitimate as an active short one. The refusal paths in `create`, `turntime` and `again` go with it, and so does the full-room unserialize scan (long-games review M4). |
| The two-distinct-address idle rule in `room_idle_limit` | It existed so one address could not hold a slot for a week. Under reclaim, a held-but-idle room is reclaimable after its floor, whatever its idle limit. A started server room now has 2+ humans by construction. The idle limit returns to `max(L, humans × T)`. Two friends behind one campus NAT keep their 24 h game. |
| Create's "every room is taken" 409 and its uncharged pre-check | `create` makes a lobby, not a match. The slot is taken at Start. |

New settings, each with an environment variable that wins when set: `max_lobbies` (100), `lobbies_per_address` (4), `pow_bits` (9), `pow_surge` (60).

---

## Rulings

1. **Slots.** Only `play`, `shop` and `over` rows count toward `max_rooms`. A lobby, including one reached through Play again, holds no slot. `start` takes the slot. `again` gives it back.
2. **Reclaim floor and order:**
   - floor = `max(room_live_secs, min(2 × turn time, 1 h))`;
   - tiers: finished first, then stale (idle ≥ 2 × turn time, at least 10 min), then dormant (long rooms only);
   - oldest `acted` first within a tier, then by code;
   - no eligible room means 409.

   This replaces the plain "2× turn time" floor, for the reason given under Fairness.
3. **Lobby eviction:** dead (no heartbeat for 40 s), then idle (no act for 10 min), then old (30 min since created). Otherwise 409. A fresh, attended lobby is never evicted.
4. **`acted` (was `actedAt`) is stamped by turn-moving acts only:**
   - `create`, `join`, `start`, `again`;
   - `map`, `seatmode`, `turntime`, `speed`;
   - `buy`, `ready`;
   - `act` of kind `aim`, `drive` or `fire`, and `act` of kind `weapon` on the player's own turn.

   `menu`, `body`, `leave`, polls, `mine` and timeouts never stamp it. Rooms saved before PR 1 read `actedAt` as `acted`.
5. **Tombstones** are kept 14 days. They answer only to a seat token whose hash they hold, and they block that code from being drawn again for the same time.
6. **Evicted players** keep the seat entry. It is marked closed and shown in Your games as "Closed to make space" until dismissed. The room on screen says "Room CODE was closed to make space." and goes back to the title card the way `netGone` does today.
7. **One human at Start plays locally** as solo: the room's Difficulty and speed, solo's three drones and random hills, no turn clock, not in Your games, the local board. The lobby row is closed. Two humans behind one address count as two humans.
8. **Invites are not signed.** A room code is enough everywhere (user ruling). Idea 3 is dropped. Guessing is answered with 6-character codes, the join puzzle and the hourly allowance (capacity table, A3).
9. **The proof of work is required on create and join.** Joins are cheaper by one bit. Load raises both by up to +2. Tests and the docker stacks run it at `pow_bits: 4`. `pow_bits: 0` turns it off for a host that wants it off.
10. **Challenges** are stateless, MAC-bound to purpose and address hash, and valid for 120 s by the server clock. A redemption from another address (a phone switching networks) gets 403 `puzzle-address`. The client fetches a new challenge once, silently.
11. **Order of checks** on create and join:
    1. origin;
    2. `proto` (426);
    3. puzzle format, MAC, age and work (403 or 422, uncharged);
    4. replay pre-read (409, uncharged);
    5. the hourly allowance (429);
    6. the rest, with the replay insert inside the write transaction.
12. **Codes** are 6 characters from now on. 4-character rooms stay valid until they end. Input is case-, space- and hyphen-insensitive.
13. **Old bundles:** 426 with the reload line on create, join and a one-human start. Everything else keeps its shape.
14. **Pressure signal** comes from the started count, the lobby count and a global create counter (`rate` row with client `*`, kind `create`), all read at challenge time only.

---

## PR 1: Slots are for matches (`games/tankity-slots`)

### Task 1: Schema step 8 and the shared request harness

**Files:**
- Modify: `server/db.php` (step 8; a step may hold a `Closure(PDO): void` entry beside SQL strings)
- Modify: `server/store.php` (`room_save` writes `phase`, `acted`, `turn_secs`; `room_alloc` inserts `phase = 'lobby'`)
- Create: `test/php/RoomCallTrait.php` (the `call()`, `stored()`, `gap()` helpers lifted from `RoomGuardTest`; `RoomGuardTest` uses the trait)
- Create: `test/php/RoomSchemaTest.php`

**Produces:**
- columns `rooms.phase TEXT NOT NULL DEFAULT 'lobby'`, `rooms.acted INTEGER NOT NULL DEFAULT 0` and `rooms.turn_secs INTEGER NOT NULL DEFAULT 120`;
- tables `closed` and `pow_used`;
- `room_acted(array $room): int`.

- [ ] **Step 1: Write the failing tests** (`RoomSchemaTest`, skeleton as `RoomIdleTest`):
  - `testStepEightAddsTheColumnsAndTables`: a fresh db reports `PRAGMA user_version` 8; `PRAGMA table_info(rooms)` lists `phase`, `acted`, `turn_secs`; `closed` and `pow_used` exist.
  - `testStepEightBackfillsLiveRows`. Build a db at version 7 by running steps 1-7 by hand (`tankity_schema_steps()` sliced). Insert three serialized rooms: a lobby; a `play` room with `actedAt` = 1000 and `turnSecs` = 86400; a room with no `actedAt` and `touched` 900. Open it with `tankity_db()`. The columns read `('lobby', touched, 120)`, `('play', 1000, 86400)` and `(phase, 900, 120)`.
  - `testSaveWritesTheColumns`: alloc, save a `shop` room with `acted` 1234 and `turnSecs` 600. The row reads `('shop', 1234, 600)`.
  - `testActedReadsTheOldKey`: `room_acted(['actedAt' => 5])` is 5; `room_acted(['acted' => 7, 'actedAt' => 5])` is 7; `room_acted(['touched' => 3])` is 3.
- [ ] **Step 2: Run red.**
  ```bash
  cd websites/www.cs && vendor/bin/phpunit -c phpunit.xml --testsuite tankity --filter RoomSchemaTest
  ```
  Expected: `user_version` 7, a missing column, an undefined `room_acted`.
- [ ] **Step 3: Implement.** In `tankity_schema()`, an entry that is a `Closure` is called with the PDO inside the step's transaction; a string is `exec`ed. Step 8:

```php
8 => [
    // What the counts and the reclaim read, written by every room_save (server/store.php).
    "ALTER TABLE rooms ADD COLUMN phase TEXT NOT NULL DEFAULT 'lobby'",
    'ALTER TABLE rooms ADD COLUMN acted INTEGER NOT NULL DEFAULT 0',
    'ALTER TABLE rooms ADD COLUMN turn_secs INTEGER NOT NULL DEFAULT 120',
    'CREATE INDEX rooms_phase ON rooms (phase, expires)',
    // Rooms closed to make space: who may hear why (hashed seat tokens), for 14 days.
    'CREATE TABLE closed (code TEXT PRIMARY KEY, reason TEXT NOT NULL, at INTEGER NOT NULL, seats TEXT NOT NULL)',
    'CREATE INDEX closed_at ON closed (at)',
    // Spent puzzles, until their challenge would have expired anyway.
    'CREATE TABLE pow_used (id TEXT PRIMARY KEY, exp INTEGER NOT NULL)',
    'CREATE INDEX pow_used_exp ON pow_used (exp)',
    static function (PDO $db): void {
        $rows = $db->query('SELECT code, data, touched FROM rooms')->fetchAll(PDO::FETCH_NUM);
        $u = $db->prepare('UPDATE rooms SET phase = ?, acted = ?, turn_secs = ? WHERE code = ?');
        foreach ($rows as [$code, $raw, $touched]) {
            $v = is_string($raw) && $raw !== '' ? @unserialize($raw, ['allowed_classes' => false]) : null;
            if (!is_array($v)) {
                continue;
            }
            $u->execute([(string) ($v['phase'] ?? 'lobby'), (int) ($v['acted'] ?? $v['actedAt'] ?? $touched),
                is_int($v['turnSecs'] ?? null) ? $v['turnSecs'] : 120, $code]);
        }
    },
],
```

  The closure decodes inline rather than calling `room_decode`: `db.php` is loaded without the room library by `scores.php`. `store.php`:

```php
/* The last turn-moving act (Ruling 4 of the room-cap plan); a room saved
   before the key was renamed reads actedAt, then its last touch. */
function room_acted(array $r): int
{
    return (int) ($r['acted'] ?? $r['actedAt'] ?? $r['touched'] ?? $r['created'] ?? 0);
}
```

  `room_save`'s UPDATE gains `phase = ?, acted = ?, turn_secs = ?`, bound from `$room['phase'] ?? 'lobby'`, `room_acted($room)` and `room_turn_secs($room)`. Rename `actedAt` to `acted` everywhere it is written (`rooms.php`, `rules.php` match end, `rooms-lib.php` `room_test_age`, `rooms-web-test.php`). `room_expires` reads `room_acted`.
- [ ] **Step 4: Run green.** Same command, then `--filter 'Room'` (every room test still passes).
- [ ] **Step 5: Commit.** `Tankity: schema step 8, the slot columns, tombstones and spent puzzles`

### Task 2: Turn-moving acts only, and the idle limit without the address rule

**Files:**
- Modify: `rooms.php` (`room_gate` takes a `$stamp` flag; handlers pass it per Ruling 4)
- Modify: `server/store.php` (`room_idle_limit`)
- Modify: `test/php/RoomIdleTest.php`, `test/php/RoomGuardTest.php`
- Modify: `README.md` (idle rule paragraph), `.config.yaml` comments

**Produces:** `room_gate(array $body, bool $needCsrf, bool $throttle = true, bool $stamp = true): array`.

- [ ] **Step 1: Write the failing tests.**
  - `RoomIdleTest::testIdleLimitIsHumansTimesTurnTime`: two human seats from one address, turn 86400. `room_idle_limit` is 172800. One human gives 86400. A Lightning room with one human gives 600.
  - Delete `testALoneHumanOnTheWeekSettingExpiresAfterTheLiveWindow`, `testTwoSeatsFromOneAddressExpireAfterTheLiveWindow` and `testDistinctAddressesEarnTheirTurnsButNeverLessThanTheWindow`.
  - `RoomGuardTest` (handler level, via the trait) `testMenuAndBodyDoNotKeepARoomAlive` (A6):
    1. Start a 2-human room and age it 500 s with `room_test_age`.
    2. Post `act` `{kind: 'menu', open: true}` and `body`. `acted` is unchanged.
    3. Post `act` `{kind: 'aim'}` on the host's turn. `acted` is now within 1 s of `time()`.
  - `testAnOffTurnWeaponDoesNotStamp`: the guest's `weapon` on the host's turn leaves `acted`. The host's own `weapon` stamps it.
- [ ] **Step 2: Run red.**
  ```bash
  vendor/bin/phpunit -c phpunit.xml --testsuite tankity --filter 'RoomIdleTest|RoomGuardTest'
  ```
- [ ] **Step 3: Implement.**

```php
/* How long a started room (play, shop) lasts with no human taking a turn:
   one turn time per human seated, never less than the live window. A full
   server reclaims idle rooms sooner (room_reclaim_pick), so this bounds disk,
   not slots. */
function room_idle_limit(array $r): int
{
    $humans = 0;
    foreach ($r['seats'] ?? [] as $s) {
        $humans += ($s['human'] ?? false) ? 1 : 0;
    }
    return max(room_live_secs(), max(1, $humans) * room_turn_secs($r));
}
```

  In `room_gate`, `$room['acted'] = time()` only when `$stamp`. Callers:
  - `body`, `leave`: `$stamp = false`.
  - `act`: pass `$kind !== 'menu' && !($kind === 'weapon' && !$ownTurn)`. Read the seat and turn first: compute `$ownTurn` inside the handler after the gate, and stamp there instead. The gate gets `false`, and the handler sets `$room['acted'] = time()` for the qualifying kinds.
  - All others: default `true`.

  `room_seat_human` keeps `addr` (the hosting cap still reads the host's).
- [ ] **Step 4: Run green.** Also run `--filter RoomMineTest` (`testMineDoesNotStampActedAt` now reads `acted`).
- [ ] **Step 5: Commit.** `Tankity: only turn-moving acts keep a room alive; idle limit is humans × turn time`

### Task 3: The lobby pool

**Files:**
- Modify: `server/settings.php` (`room_max_lobbies()`, `room_lobbies_per_address()`, `ROOM_LOBBY_OLD_SECS`)
- Modify: `server/store.php` (`room_slots_used`, `room_lobbies_used`, `room_lobbies_hosted`, `room_lobby_evict_pick`, `room_tombstone`, `room_closed_for`; `room_count` becomes `room_slots_used`)
- Modify: `rooms.php` (`create` checks lobbies instead of slots; `again` takes a lobby place; `ping` reports both)
- Create: `test/php/RoomLobbyPoolTest.php`

**Produces:**

```php
function room_slots_used(string $except = '', ?int $now = null): int;      // phase IN ('play','shop','over') AND expires >= now
function room_lobbies_used(string $except = '', ?int $now = null): int;    // phase = 'lobby' AND expires >= now
function room_lobbies_hosted(string $hostKey, string $except = '', ?int $now = null): int;
function room_lobby_evict_pick(string $except, int $now): ?string;         // Ruling 3, null when none may go
function room_tombstone(PDO $db, string $code, string $reason, int $now): void; // decode, hash tokens, DELETE row, INSERT closed
function room_closed_for(string $code, string $token): ?string;           // 'space' or null
```

- [ ] **Step 1: Write the failing tests** (`RoomLobbyPoolTest`, handler level through the trait). Env `TANKITY_MAX_LOBBIES=6`, `TANKITY_LOBBIES_PER_ADDRESS=4`, `TANKITY_MAX_ROOMS=2`, allowance 1000.
  - `testLobbiesHoldNoSlot`: 6 lobbies from 2 addresses. `ping` answers `rooms.used` 0, `lobbies.used` 6.
  - `testFourLobbiesPerAddress`: a 5th create from one address gives 429 "too many lobbies open from here; start or leave one first".
  - **A2 flood:** `testALobbyFloodNeverEvictsAFreshAttendedLobby`.
    1. A real host makes a lobby and heartbeats it (a seated `state` every 20 s of faked time; set `touched` directly with a helper `room_test_touch($code, $t)`).
    2. 5 flood lobbies from 2 other addresses fill the pool, also heartbeated.
    3. A 7th create from a third address gives 409 "Every lobby is busy. Try again in a minute."
    4. The real lobby is still there.
  - `testADeadLobbyGoesFirst`:
    1. Fill the pool.
    2. Make lobby #3's `touched` 41 s old (no heartbeat) and lobby #1's `acted` 700 s old (heartbeated).
    3. A new create succeeds, and #3 is gone, not #1.
    4. A seated `state` on #3 gives 404 `{"error": "no such room", "closed": "space"}`.
    5. The same `state` with an unknown token gives 404 without `closed`.
  - `testThenIdleThenOld`:
    1. All live; #2 `acted` 601 s old. The create evicts #2.
    2. All live and recently acted; #4 `created` 1801 s old. The next create evicts #4.
  - `testPlayAgainTakesALobbyPlace`: a finished match with a full pool and nothing evictable gives 409 on `again`, and the room stays `over`.
  - `testTombstonesBlockTheCodeAndExpire`:
    1. `room_new_code` fed a sequence that hits a tombstoned code skips it.
    2. `tankity_housekeep` at `at + 1209601` deletes the tombstone.
- [ ] **Step 2: Run red.**
  ```bash
  vendor/bin/phpunit -c phpunit.xml --testsuite tankity --filter RoomLobbyPoolTest
  ```
- [ ] **Step 3: Implement.** Settings use `tankity_int_setting` (`TANKITY_MAX_LOBBIES`/`max_lobbies` 100; `TANKITY_LOBBIES_PER_ADDRESS`/`lobbies_per_address` 4). The pick:

```php
/* The lobby a new one may replace when the pool is full (Ruling 3): one no tab
   polls, then one nobody acted in for the live window, then one older than
   ROOM_LOBBY_OLD_SECS. Null when every lobby is fresh and attended. */
function room_lobby_evict_pick(string $except, int $now): ?string
{
    $q = tankity_db()->prepare("SELECT code FROM rooms WHERE phase = 'lobby' AND code <> :x AND expires >= :now
        AND (touched < :dead OR acted <= :idle OR created <= :old)
        ORDER BY CASE WHEN touched < :dead THEN 0 WHEN acted <= :idle THEN 1 ELSE 2 END,
                 CASE WHEN touched < :dead THEN touched WHEN acted <= :idle THEN acted ELSE created END, code
        LIMIT 1");
    $q->execute([':x' => $except, ':now' => $now, ':dead' => $now - 2 * ROOM_HEARTBEAT_SECS,
        ':idle' => $now - room_live_secs(), ':old' => $now - ROOM_LOBBY_OLD_SECS]);
    $c = $q->fetchColumn();
    return $c === false ? null : (string) $c;
}
```

  In `create`:
  - Remove the slot pre-check, `room_sweep` stays.
  - After `room_alloc` (lock held): `room_lobbies_hosted` (429), then `room_lobbies_used($code) >= room_max_lobbies()`. When true, `room_lobby_evict_pick`; tombstone the victim, else discard and 409.
  - The hosting pre-check from a plain read becomes the lobbies-hosted pre-check, kept uncharged.
  - `room_register` and the long-share block are deleted from `create`.

  `again` does the same lobby check under its lock. `room_tombstone` decodes the victim, collects `substr(hash('sha256', $s['token']), 0, 32)` for human seats, deletes the row and inserts `closed`. Every 404 site (`room_gate`, `state`) calls `room_closed_for($code, $token)` and adds `closed` when it answers. Housekeeping job `closed`: `DELETE FROM closed WHERE at < now - ROOM_TOMBSTONE_SECS LIMIT 5000`. `room_alloc` tries a code only when `NOT EXISTS (SELECT 1 FROM closed WHERE code = ?)`.
- [ ] **Step 4: Run green.** Same filter, then the whole `tankity` suite.
- [ ] **Step 5: Commit.** `Tankity: lobbies wait in a pool of their own and hold no match slot`

### Task 4: Start takes a slot, reclaiming the stalest room

**Files:**
- Modify: `server/settings.php` (`ROOM_DORMANT_SECS = 3600`; delete `ROOM_LONG_SHARE`, `room_long_share`, `room_long_cap`)
- Modify: `server/store.php` (`room_reclaim_floor`, `room_reclaim_pick`, `room_take_slot`; delete `room_long_count`, `ROOM_LONG_FULL`, `room_register`)
- Modify: `rooms.php` (`start` calls `room_take_slot`; `turntime` and `again` lose the long-share blocks; the hosting cap moves from `create` to `start`)
- Create: `test/php/RoomReclaimTest.php`
- Modify: `test/php/RoomGuardTest.php` (delete the five long-share tests; move the hosting-cap tests to Start)

**Produces:**

```php
function room_reclaim_floor(int $turnSecs): int;            // max(L, min(2T, D))
function room_reclaim_pick(string $except, int $now): ?string;
/* Under the caller's write lock: true when $code may become a started room now
   (a free slot, or the stalest eligible room tombstoned to make one). */
function room_take_slot(RoomLock $lock, string $code, int $now): bool;
```

- [ ] **Step 1: Write the failing tests** (`RoomReclaimTest`). Store-level cases use fixed `$now` and rows written through `room_alloc`/`room_save` with chosen `phase`/`acted`/`turnSecs`, plus a column helper `room_test_set($code, ['acted' => …])`. Handler-level cases use the trait.
  - `testFloor`:
    - `room_reclaim_floor(60)` is 600.
    - `(120)` is 600.
    - `(600)` is 1200.
    - `(1800)` is 3600.
    - `(28800)` is 3600.
    - `(604800)` is 3600.
  - `testAnActiveRoomIsNeverPicked`: 3 started rooms, each acted within its floor. Pick gives null.
  - `testFinishedThenStaleThenDormant`, at `now`, with every room eligible:
    - A: `over`, acted 30 s ago;
    - B: 2-min turn, acted 700 s ago (stale);
    - C: 24 h turn, acted 5 h ago (dormant, the oldest act);
    - D: 10-min turn, acted 1300 s ago (stale).

    Picks in order (tombstoning each): A, D, B, C. D comes before B: same tier, older `acted`. C goes last despite the oldest act, because it is dormant.
  - `testAnActiveLongGameOutlivesAStaleShortOne`: long room acted 2 h ago (dormant), short room acted 11 min ago (stale). The short room is picked. This is the user's fairness requirement as a test.
  - `testTiesBreakByCode`: two stale rooms with equal `acted`. The lower code goes.
  - **A1 hold:** `testThirteenAddressesCannotHoldEverySlot` (handler level).
    1. Env `TANKITY_MAX_ROOMS=52`, hosting 4, allowance 1000.
    2. For n in 1..13: address `203.0.113.n` creates 4 lobbies at turn 604800; address `198.51.100.n` joins each; the host starts each. 52 rooms are started.
    3. A real pair from two fresh addresses: create, join, start gives 409 "Every match slot is in play…" (all attackers acted under 1 h ago).
    4. `room_test_age` every attacker room by 3601 s.
    5. The real pair's start gives 200. Exactly one attacker room (the oldest `acted`, ties by code) is tombstoned, `ping` `rooms.used` is still 52, and the evicted host's `state` gives 404 with `closed: 'space'`.
    6. Its `mine` row is `{code, gone: true, closed: 'space'}`.
  - `testAPlayedHoldIsTheResidual`: same setup, but before the real start, one attacker room per address posts a host `aim` (stamps `acted`) after the ageing. Those 13 are never picked; the other 39 are.
  - `testTheHostingCapCountsStartedMatches`:
    1. One address starts 4 two-human matches.
    2. Its 5th Start gives 429 "too many matches hosted from here; finish or leave one first".
    3. It can still open lobbies (up to `lobbies_per_address`).
  - `testPlayAgainGivesTheSlotBack`: a finished match `again` gives `ping` `rooms.used` one lower and `lobbies.used` one higher.
  - `testStartRaceCannotOverfill` (trigger pattern from `testTheHostingCapIsRecheckedUnderTheWriteLock`): a trigger fills the last slot when the start's lock is taken. The start reclaims or refuses; it never makes `rooms.used` exceed the cap.
- [ ] **Step 2: Run red.**
  ```bash
  vendor/bin/phpunit -c phpunit.xml --testsuite tankity --filter RoomReclaimTest
  ```
- [ ] **Step 3: Implement.**

```php
const ROOM_DORMANT_SECS = 3600;
/* How long a started room must go without a turn before a full server may
   reclaim it: twice its turn time, at least the live window, at most an hour. */
function room_reclaim_floor(int $turnSecs): int
{
    return max(room_live_secs(), min(2 * $turnSecs, ROOM_DORMANT_SECS));
}
/* The room a new match may replace on a full server: finished first, then
   stale (idle twice its turn time), then dormant (a long room idle past the
   floor), the longest idle first within each. Null when none is eligible. */
function room_reclaim_pick(string $except, int $now): ?string
{
    $L = room_live_secs();
    $q = tankity_db()->prepare("SELECT code FROM rooms
        WHERE phase IN ('play','shop','over') AND code <> :x AND expires >= :now
          AND (phase = 'over' OR :now - acted >= MAX(:L, MIN(2 * turn_secs, :D)))
        ORDER BY CASE WHEN phase = 'over' THEN 0
                      WHEN :now - acted >= MAX(:L, 2 * turn_secs) THEN 1 ELSE 2 END,
                 acted, code
        LIMIT 1");
    $q->execute([':x' => $except, ':now' => $now, ':L' => $L, ':D' => ROOM_DORMANT_SECS]);
    $c = $q->fetchColumn();
    return $c === false ? null : (string) $c;
}
function room_take_slot(RoomLock $lock, string $code, int $now): bool
{
    if (room_slots_used($code, $now) < room_max_rooms()) {
        return true;
    }
    $victim = room_reclaim_pick($code, $now);
    if ($victim === null) {
        return false;
    }
    room_tombstone($lock->db, $victim, 'space', $now);
    return true;
}
```

  `start` after its existing checks:
  - Hosting cap: `room_hosted($hostKey, $code)` over started phases ≥ `room_hosts_per_address()` gives 429.
  - Then `room_take_slot($fh, $code, time())`, which gives 409 "Every match slot is in play. Try again in a few minutes." when false.
  - Then `room_match_begin`.

  `room_hosted` gains `AND phase IN ('play','shop','over')`. Delete:
  - every `room_long_*` and `ROOM_LONG_*` reference;
  - the `turntime` long-share block;
  - the `again` long-share block.
- [ ] **Step 4: Run green.** Same filter, then the whole `tankity` and `tankity-docker` suites (`make test` docker) because `RoomsLoadTest` and `RoomsTest` count rooms.
- [ ] **Step 5: Commit.** `Tankity: Start takes a match slot and reclaims the stalest room on a full server`

### Task 5: Players hear "closed to make space"; docs and the stacks

**Files:**
- Modify: `src/protocol.ts` (`MineRow` gone gains `closed?: 'space'`; `PingReply` gains `lobbies`)
- Modify: `src/seats.ts` (`StoredSeat.closed?: 'space'`; `markClosed(code)`; the parser accepts it)
- Modify: `src/games.ts` (a gone row with `closed` marks instead of forgetting; `onRows` also receives closed rows as `ClosedRow`)
- Modify: `src/net.ts` (`isGoneError` returns the reason; `onGone(code, 'closed' | 'seat' | 'space')`)
- Modify: `src/lobby.ts` (`netGone` handles `'space'`: marks the seat closed instead of forgetting; occupancy line reads "3 / 50 matches running · 12 lobbies open")
- Modify: `src/ui/games.tsx` ("Closed to make space" row with Dismiss)
- Modify: `test/net.test.ts`, `test/games.test.ts`, `test/seats.test.ts`, `test/games-ui.test.ts`, `test/lobby.test.ts`
- Create: `tests/e2e/tankity-rooms-cap.spec.mjs`
- Modify: `README.md` (the settings table, "Long games" → Closing, a new "Room slots" section), `.config.yaml` (comments: drop `room_long_share`, add `max_lobbies`, `lobbies_per_address`), `compose.yaml` (drop `TANKITY_ROOM_LONG_SHARE`), `rooms-web-test.php` (cap counts started matches: start each filled room with a joined second seat)

- [ ] **Step 1: Write the failing tests.**
  - net: a poll answered 404 `{error: 'no such room', closed: 'space'}` detaches and calls `onGone(code, 'space')`. Without `closed` it calls `'closed'`.
  - seats: `markClosed('ABCD')` keeps the entry with `closed: 'space'`, and a reload parses it.
  - games:
    - a `mine` row `{code, gone: true, closed: 'space'}` calls `store.markClosed`, not `forget`;
    - the row reaches `onRows` as `{code, closed: 'space'}`;
    - a closed seat is never sent to `mine` again.
  - games-ui: a closed row renders "ABCD · Closed to make space" with a Dismiss button that calls `forget('ABCD')`.
  - lobby: `netGone('ABCD', 'space')` from a running match calls `backToTitle`, sets the line "Room ABCD was closed to make space." and leaves the seat stored, marked closed.
  - e2e `tankity-rooms-cap.spec.mjs`, "an evicted room says why and stays in Your games":
    1. Two contexts host, join and start a match.
    2. The guest context `page.route`s `rooms.php?action=state*` to fulfil 404 `{"error":"no such room","closed":"space"}`.
    3. The guest sees the title card with "Room CODE was closed to make space."
    4. Your games lists "CODE · Closed to make space".
    5. Dismiss removes it.

    The server half of eviction is covered at the handler level in Task 4. This spec checks what the player sees.
- [ ] **Step 2: Run red.**
  ```bash
  node --test test/net.test.ts test/seats.test.ts test/games.test.ts test/games-ui.test.ts test/lobby.test.ts
  ```
- [ ] **Step 3: Implement** the client changes above, then the README:
  - **"Room slots":** the capacity rules from this Design, in present tense. Covers the slot rule, the lobby pool, reclaim order and floor, tombstones and the residual: a bot that takes a turn every hour in every room, from at least 13 addresses, still holds slots. When that shows up, lower `room_hosts_per_address`.
  - **Settings table:** add `max_lobbies` and `lobbies_per_address`; delete `room_long_share`; `max_rooms` reads "started matches (2+ humans at Start)".
  - **"Long games" → Closing:** "a started room lasts one turn time per human with nobody taking a turn, at least `room_live_secs`; a full server may close it sooner (Room slots)".

  Rebuild.
- [ ] **Step 4: Run green.** The node command above, then `bash games/tankity/test.sh`, then:
  ```bash
  COMPOSE_PROJECT_NAME=tankity-cap-$$ make e2e E2E_ARGS="tankity-rooms-cap.spec.mjs tankity-rooms-long.spec.mjs"
  ```
  `tankity-rooms-long` test 4's mid-game step to 8 h now needs no lifted share. Remove its comment about it.
- [ ] **Step 5: Commit.** `Tankity: evicted rooms say they were closed to make space; Room slots in the README`
- [ ] **Step 6: Full gate.** `COMPOSE_PROJECT_NAME=tankity-cap-$$ make test`. Open PR 1.

---

## PR 2: One human plays here (`games/tankity-local-start`)

### Task 6: Start with one human closes the lobby and answers local

**Files:**
- Modify: `rooms.php` (`start`)
- Modify: `server/settings.php` (`ROOM_PROTO = 2`; `room_proto_ok(array $body): bool`; `room_reload_out(): never`)
- Create: `test/php/RoomLocalStartTest.php`

- [ ] **Step 1: Write the failing tests** (handler level):
  - `testAOneHumanStartPlaysLocally`:
    1. Create a lobby with difficulty `hard`; set speed 2.
    2. `start` with `proto: 2` answers 200 `{ok: true, local: {difficulty: 'hard', speed: 2}}`.
    3. The row is gone, with no tombstone.
    4. `ping` `rooms.used` and `lobbies.used` are both 0.
  - `testAnOldBundleStartingAloneIsToldToReload`: `start` without `proto` answers 426 `{error: 'Tankity was updated. Reload the page to keep playing.', reload: true}`, and the lobby is unchanged (`phase` lobby, row present).
  - `testTwoHumansFromOneAddressTakeASlot`: host and guest from the same address, `start` answers 200 with `room.phase === 'play'`, and `rooms.used` is 1.
  - `testTwoHumansWithoutProtoStillStart`: an old bundle's 2-human start works as before (no 426).
- [ ] **Step 2: Run red.**
  ```bash
  vendor/bin/phpunit -c phpunit.xml --testsuite tankity --filter RoomLocalStartTest
  ```
- [ ] **Step 3: Implement.** In `start`, after the host check and the phase check, before the drone check:

```php
$humans = count(array_filter($room['seats'], static fn(array $s): bool => (bool) ($s['human'] ?? false)));
if ($humans < 2) {
    if (!room_proto_ok($body)) {
        room_unlock($fh);
        room_reload_out();
    }
    // One player needs no referee: the browser plays it as solo (README "Room slots").
    $local = ['difficulty' => room_parse_difficulty($room['difficulty'] ?? null), 'speed' => room_speed($room)];
    room_close($fh);
    room_json_out(200, ['ok' => true, 'local' => $local]);
}
```

  `room_reload_out()` gives `room_json_out(426, ['error' => 'Tankity was updated. Reload the page to keep playing.', 'reload' => true])`. `room_proto_ok` returns `($body['proto'] ?? null) === ROOM_PROTO`.
- [ ] **Step 4: Run green.** The filter above, then `RoomsSimTest` and `RoomMatchEndTest`, whose helpers start one-human rooms through the library: those call `room_match_begin` directly and are unaffected. Check that each still passes.
- [ ] **Step 5: Commit.** `Tankity: a room started with one human closes and plays in the browser`

### Task 7: The browser plays a local start as solo

**Files:**
- Modify: `src/protocol.ts` (`PostBodies.start` gains `proto: 2`; `PostReplies.start` is `RoomReply | LocalReply`; `export interface LocalReply { ok: true; local: { difficulty: Difficulty; speed: Speed } }`)
- Modify: `src/net.ts` (`start()` returns `{ local } | { room }`; every post of `create`/`join`/`start` carries `proto: 2`; `export const PROTO = 2`)
- Modify: `src/lobby.ts` (`startRoom`: on `local`, `seats.forget`, `dropRoom()`, close the lobby veil, `deps.startLocal(local)`, `say('Nobody else joined, so this match plays here on your device.', 'info')`; the room hint for a lone host reads "With only you seated, Start plays here on your device.")
- Modify: `src/main.ts` (`startLocal({difficulty, speed})`: set the difficulty pref for this match only (restore after), set `G.speed`, call `startSolo('')`)
- Modify: `test/lobby.test.ts`, `test/net.test.ts`
- Create: e2e case in `tests/e2e/tankity-rooms.spec.mjs`

- [ ] **Step 1: Write the failing tests.**
  - net: `start()` posts `proto: 2` and resolves `{local}` for a local reply. A 426 reply rejects with the reload line.
  - lobby:
    - with a fake net whose `start` resolves `{local: {difficulty: 'easy', speed: 4}}`, `startRoom()` calls `startLocal` with those, forgets the seat, and leaves `net.code` empty;
    - with only the host in the roster, `#room-hint` reads the lone-host line;
    - with a guest, it reads the usual hint.
  - e2e "a host alone plays here":
    1. Host, then Start.
    2. The lobby veil closes, the HUD shows a solo match, and `ping` (via `request`) shows `rooms.used` unchanged.
    3. Your games does not list the code.
- [ ] **Step 2: Run red.**
  ```bash
  node --test test/net.test.ts test/lobby.test.ts
  ```
- [ ] **Step 3: Implement** as listed. `startLocal` must not touch the room client (no `net.on`). It restores the player's own difficulty pref when the match ends: `END` → `backToTitle`, which already reads the pref. Rebuild.
- [ ] **Step 4: Run green.** The node command above, then:
  ```bash
  COMPOSE_PROJECT_NAME=tankity-local-$$ make e2e E2E_ARGS="tankity-rooms.spec.mjs"
  ```
- [ ] **Step 5: Commit.** `Tankity: a lone host's Start plays the match here, like solo`

### Task 8: Docs and the stacks for local starts

**Files:**
- Modify: `README.md` ("Room slots": the one-human rule; "Long games": a local match has no turn clock and is not in Your games)
- Modify: `tests/e2e/*.spec.mjs` that start a room with one human and expect a server match (grep `#room-start` and `startRoom`; give each a second joined context, or switch it to the local expectation)
- Modify: `rooms-web-test.php` (one-human start case: expects `local`)

- [ ] **Step 1:** Grep:
  ```bash
  grep -ln "room-start\|action=start" tests/e2e/tankity-*.spec.mjs games/tankity/rooms-web-test.php
  ```
  List each spec that starts alone, and make a red run of two of them, to confirm they now fail:
  ```bash
  COMPOSE_PROJECT_NAME=tankity-local-$$ make e2e E2E_ARGS="tankity-end.spec.mjs tankity-hud.spec.mjs"
  ```
- [ ] **Step 2:** Give each of them a guest (helpers in `tests/e2e/helpers.mjs`: add `hostWithGuest(browser)` returning both pages, built from the existing host and join helpers).
- [ ] **Step 3: Run green** (the two specs above), then `make test`. Open PR 2.
- [ ] **Step 4: Commit.** `Tankity: specs that start rooms seat a guest; docs for local starts`

---

## PR 3: Proof of work and 6-character codes (`games/tankity-pow-codes`)

### Task 9: The puzzle on the server

**Files:**
- Create: `server/pow.php` (loaded by `rooms.php`; 404 when requested directly, like its siblings)
- Modify: `server/settings.php` (`room_pow_bits_setting()`, `room_pow_surge()`)
- Modify: `server/housekeep.php` (job `pow`: `DELETE FROM pow_used WHERE exp < now LIMIT 5000`)
- Create: `test/php/RoomPowTest.php`
- Create: `protocol/pow-vectors.php` (writes `protocol/pow-vectors.json`: 6 fixed challenges, each with its 4 solving nonces at bits 6 and one non-solving nonce; `--check` mode)

**Produces:**

```php
const POW_ITER = 100;
const POW_COUNT = 4;
const POW_TTL = 120;
function room_pow_key(): string;                                  // hash_hmac('sha256', 'tankity-pow-v1', tankity_addr_key(), true)
function room_pow_bits(string $purpose, ?int $now = null): int;   // Design "Difficulty"
function room_pow_issue(string $purpose, int $now): array;        // ['challenge','bits','count','iter','expiresIn']
function room_pow_lead(string $challenge, int $nonce): int;       // leading zero bits of PBKDF2(challenge, "tankity-pow|$nonce", 100, 4 bytes)
/* null when the solution holds; else [status, code, message]. Pure: no database. */
function room_pow_check(mixed $pow, string $purpose, int $now): ?array;
function room_pow_spend(PDO $db, string $challenge): bool;        // INSERT OR IGNORE into pow_used; false when it was spent
```

- [ ] **Step 1: Write the failing tests** (`RoomPowTest`; library level with a fixed `$now`; `$_SERVER['REMOTE_ADDR']` set per test):
  - `testIssueIsSignedAndBound`: the challenge has 6 dot-separated parts, `v1` first, and purpose `c`. Each of these fails `room_pow_check` with 403 `puzzle-bad`: changing `bits` in it, changing its purpose, or redeeming it from another `REMOTE_ADDR`. One code covers all three, because the address is inside the MAC and cannot be told apart from a forgery. The client refetches once on any 403 `puzzle-*` (Ruling 10).
  - `testSolvesAreChecked`, with a low bits setting (`TANKITY_POW_BITS=2`, so solving in PHP is fast): brute-force 4 nonces with `room_pow_lead`. The check passes. Three nonces give 422 `puzzle-short`. A repeated nonce gives 422 `puzzle-short`. One wrong nonce gives 403 `puzzle-wrong`.
  - **Old challenge:** `testAnOldChallengeIsRefused`.
    - Issued at `$now - 121` gives 403 `puzzle-expired`.
    - A challenge with a future `issued` (`$now + 6`) and a valid MAC, built in the test with `room_pow_mac`, gives 403 `puzzle-expired`.
    - The same challenge with its `issued` edited and the old MAC kept gives `puzzle-bad`.
    - The age check never reads a client clock: the test passes `$now` and sets nothing client-side.
  - **Replay:** `testReplayIsRefused`. `room_pow_spend` is true once, then false. Housekeeping at `issued + POW_TTL + 1` removes the row.
  - `testBitsRiseUnderPressure`:
    - With `pow_bits` 9: join is 9 and create is 10.
    - With started rooms at 75 % of the cap: 10 and 11.
    - At the cap: 11 and 12.
    - With 60 creates counted in the `rate` table under client `*` within 10 min: +1.
    - Never more than +2.
  - `testZeroBitsTurnsItOff`: `room_pow_check(null, 'c', $now)` is null when `pow_bits` is 0.
  - `testVectorsMatch`: every case in `protocol/pow-vectors.json` gives the stored `lead` from `room_pow_lead`.
- [ ] **Step 2: Run red.**
  ```bash
  vendor/bin/phpunit -c phpunit.xml --testsuite tankity --filter RoomPowTest
  ```
- [ ] **Step 3: Implement.** The core:

```php
/* Leading zero bits of the first 32 bits of PBKDF2-HMAC-SHA256(challenge,
   "tankity-pow|nonce", POW_ITER). Integers only: src/pow.ts counts the same
   way, and protocol/pow-vectors.json pins the two together. */
function room_pow_lead(string $challenge, int $nonce): int
{
    $n = unpack('N', hash_pbkdf2('sha256', $challenge, 'tankity-pow|' . $nonce, POW_ITER, 4, true))[1];
    $k = 0;
    while ($k < 32 && ($n & 0x80000000) === 0) {
        $n = ($n << 1) & 0xFFFFFFFF;
        $k++;
    }
    return $k;
}
function room_pow_mac(string $payload): string
{
    $raw = hash_hmac('sha256', $payload . '|' . room_client_hash(), room_pow_key(), true);
    return substr(rtrim(strtr(base64_encode($raw), '+/', '-_'), '='), 0, 22);
}
function room_pow_check(mixed $pow, string $purpose, int $now): ?array
{
    if (room_pow_bits_setting() === 0) {
        return null;
    }
    $c = is_array($pow) && is_string($pow['c'] ?? null) ? $pow['c'] : '';
    $n = is_array($pow) && is_array($pow['n'] ?? null) && array_is_list($pow['n']) ? $pow['n'] : [];
    $parts = explode('.', $c);
    if (count($parts) !== 6 || $parts[0] !== 'v1' || $parts[2] !== $purpose || !ctype_digit($parts[1]) || !ctype_digit($parts[3])) {
        return [403, 'puzzle-bad', 'That puzzle is not one of ours.'];
    }
    [, $issued, , $bits, $rand, $mac] = $parts;
    if (!hash_equals(room_pow_mac(implode('.', array_slice($parts, 0, 5))), $mac)) {
        return [403, 'puzzle-bad', 'That puzzle is not one of ours.'];
    }
    $age = $now - (int) $issued;
    if ($age > POW_TTL || $age < -5) {
        return [403, 'puzzle-expired', 'That puzzle ran out of time.'];
    }
    $ints = array_values(array_unique(array_filter($n, static fn($x): bool => is_int($x) && $x >= 0 && $x < 2 ** 32)));
    if (count($ints) !== POW_COUNT || count($n) !== POW_COUNT) {
        return [422, 'puzzle-short', 'That puzzle is not finished.'];
    }
    foreach ($ints as $x) {
        if (room_pow_lead($c, $x) < (int) $bits) {
            return [403, 'puzzle-wrong', 'That puzzle is not solved.'];
        }
    }
    return null;
}
```

  The challenge's 6 parts are `v1.issued.purpose.bits.rand.mac` (Design → Proof of work). The MAC covers the first five parts and the address hash.

  `room_pow_bits` reads `room_slots_used()`, `room_lobbies_used()` and `rate_used($db, '*', 'create', $now)` (a 10-minute window: a new helper `rate_used_since($db, $client, $kind, $since)`). Create takes one global `*` count with `rate_take` in its own transaction after the per-address charge.
- [ ] **Step 4: Run green.** The filter above, then `php protocol/pow-vectors.php --check`.
- [ ] **Step 5: Commit.** `Tankity: the room puzzle (PBKDF2 hashcash), signed, timed and spent once`

### Task 10: Create and join require the puzzle; the challenge endpoint

**Files:**
- Modify: `rooms.php` (`GET action=challenge`; `create` and `join` follow Ruling 11's order)
- Modify: `test/php/RoomCallTrait.php` (`solve(string $purpose, array $server, array $env): array`: GET challenge through `call`, brute-force in PHP with `room_pow_lead`, return `['c' => …, 'n' => [...]]`; tests run at `TANKITY_POW_BITS=2`)
- Modify: every handler-level test that creates or joins (pass `proto` and `pow` via a `createBody()`/`joinBody()` helper in the trait)
- Create: `test/php/RoomPowGateTest.php`

- [ ] **Step 1: Write the failing tests** (`RoomPowGateTest`):
  - `testOldBundlesAreToldToReload`: `create` and `join` without `proto` answer 426 with the reload line, and nothing is charged (`roomCharges()` is 0).
  - `testCreateNeedsASolvedPuzzle`:
    - no `pow` gives 422 `{error: 'That puzzle is not finished.', puzzle: 'puzzle-short'}`;
    - a solved create puzzle gives 200;
    - a join puzzle used for a create gives 403 `puzzle-bad`.
  - **Replay:** `testAReplayedPuzzleIsRefusedAndUncharged`. The same `pow` for a second create gives 409 `{puzzle: 'puzzle-spent'}`, and the charge count is unchanged.
  - **Old challenge:** `testAnOldPuzzleIsRefused`. A puzzle solved, then redeemed with `TANKITY_TEST_NOW` +121 (the test env var `rooms.php` reads only when `TANKITY_TEST_CLOCK=1`, set nowhere but in tests), gives 403 `puzzle-expired`.
  - **Guessing:** `testAGuessWithoutWorkLearnsNothing`.
    1. A real lobby exists.
    2. `join` with its code and no `pow` gives 422, the same as a made-up code with no `pow` (identical body).
    3. With a solved puzzle, a made-up code gives 404 and the real code gives 200.
    4. 300 joins per hour per address still give 429 after (the allowance is unchanged).
  - **Guessing, code length:** `testCodesAreSixCharactersAndOldOnesStillWork`.
    1. A new lobby's code matches `^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$`.
    2. A 4-char room inserted directly (as made before PR 3) is joinable with its 4-char code.
    3. `state` accepts both lengths.
    4. A 5-char code gives 422.
  - `testChallengeIsCheapAndUncharged`: 50 GETs of `challenge` leave `rate` empty. The reply's `bits` follows pressure (fill to 75 % and see +1).
- [ ] **Step 2: Run red.**
  ```bash
  vendor/bin/phpunit -c phpunit.xml --testsuite tankity --filter RoomPowGateTest
  ```
- [ ] **Step 3: Implement.**
  - `challenge`: `for` must be `create` or `join` (422 otherwise). Answers `room_pow_issue`.
  - `create` and `join`, after the origin check:
    1. `room_proto_ok` (426);
    2. `room_pow_check($body['pow'] ?? null, $purpose, $now)` → `room_json_out($st, ['error' => $msg, 'puzzle' => $code])`;
    3. a plain-read `SELECT 1 FROM pow_used WHERE id = ?` (409 `puzzle-spent`);
    4. `room_rate_gate()`;
    5. the rest;
    6. inside the write transaction (after `room_alloc` / `room_load`), `room_pow_spend($lock->db, $c)`, which on false gives discard and 409 `puzzle-spent`. The id is the challenge's MAC part.
  - Codes:
    - `ROOM_CODE_LEN = 6`;
    - `ROOM_CODE_RE = '/^(?:[A-Z0-9]{4}|[A-Z0-9]{6})$/'`, used by every former `{4}` site in `rooms.php`;
    - `room_mine_one` normalizes codes with `room_code_clean(string $raw): string`, which upper-cases and strips spaces and hyphens.
  - The test clock: `function room_now(): int { return getenv('TANKITY_TEST_CLOCK') === '1' && ctype_digit((string) getenv('TANKITY_TEST_NOW')) ? (int) getenv('TANKITY_TEST_NOW') : time(); }`, used only by the puzzle checks. Put a comment by it saying that only PHPUnit sets the variable.
- [ ] **Step 4: Run green.** The whole `tankity` suite.
- [ ] **Step 5: Commit.** `Tankity: create and join pay a puzzle; codes are six characters`

### Task 11: The browser solves the puzzle

**Files:**
- Create: `src/pow.ts` (DOM-free; WebCrypto arrives as a dep)
- Create: `test/pow.test.ts`
- Modify: `src/net.ts` (`host`/`join` fetch a challenge, solve, post; on 403 `puzzle-*` or 409 `puzzle-spent` refetch and solve once more; a `onWorking(on: boolean)` handler)
- Modify: `src/protocol.ts` (`ChallengeReply`; `PostBodies.create`/`join` gain `proto` and `pow`)

**Produces:**

```ts
export interface PowChallenge { challenge: string; bits: number; count: number; iter: number }
export interface Subtle {
  importKey(f: 'raw', k: BufferSource, a: 'PBKDF2', x: false, u: ['deriveBits']): Promise<CryptoKey>;
  deriveBits(a: { name: 'PBKDF2'; hash: 'SHA-256'; salt: BufferSource; iterations: number }, k: CryptoKey, len: 32): Promise<ArrayBuffer>;
}
/** Leading zero bits of a 32-bit big-endian word. */
export function leadingZeros(word: number): number;
/** Finds `count` distinct nonces from 0 up, `inFlight` derivations at a time; rejects when `signal` aborts. */
export function solvePow(c: PowChallenge, subtle: Subtle, opts?: { inFlight?: number; signal?: AbortSignal }): Promise<number[]>;
export const POW_IN_FLIGHT = 4;
```

- [ ] **Step 1: Write the failing tests** (`test/pow.test.ts`, using node's `globalThis.crypto.subtle`, the same API as browsers):
  - `leadingZeros`: `0` gives 32, `1` gives 31, `0x80000000` gives 0, `0x00ffffff` gives 8.
  - The vectors: for each case in `protocol/pow-vectors.json`, derive with `subtle` and compare the leading zeros with the stored `lead`.
  - `solvePow` at bits 4 returns 4 distinct nonces, each with ≥ 4 leading zeros (checked against the vector function). The solution at bits 6 for vector 0's challenge equals the PHP-generated nonces, since the search runs from 0 up and takes the first 4 in order.
  - An aborted signal rejects.
  - `net`:
    - `host()` GETs `challenge?for=create`, posts `create` with `proto: 2` and `pow: {c, n}`, and calls `onWorking(true)` then `onWorking(false)`.
    - On a first 403 `{puzzle: 'puzzle-expired'}` it refetches and succeeds.
    - On a second it throws the server line.
    - A 426 throws the reload line and is not retried.
- [ ] **Step 2: Run red.**
  ```bash
  node --test test/pow.test.ts test/net.test.ts
  ```
- [ ] **Step 3: Implement.**

```ts
/** The `count` smallest solving nonces. Lanes finish out of order, so a lane
 * stops only once `count` are found and every nonce below the largest of the
 * smallest `count` has been tried; the answer is then the same on every
 * engine, which the vectors pin. The server accepts any distinct solving set. */
export async function solvePow(c: PowChallenge, subtle: Subtle, opts: { inFlight?: number; signal?: AbortSignal } = {}): Promise<number[]> {
  const enc = new TextEncoder();
  const key = await subtle.importKey('raw', enc.encode(c.challenge), 'PBKDF2', false, ['deriveBits']);
  const found: number[] = [];
  let next = 0;
  let tried = 0; // nonces below this have all answered
  const answered = new Set<number>();
  const settled = (): boolean => {
    if (found.length < c.count) return false;
    const cut = [...found].sort((a, b) => a - b)[c.count - 1]!;
    return tried > cut;
  };
  const lane = async (): Promise<void> => {
    while (!settled()) {
      if (opts.signal?.aborted) throw new Error('aborted');
      const n = next++;
      const bits = await subtle.deriveBits(
        { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode('tankity-pow|' + n), iterations: c.iter }, key, 32);
      if (leadingZeros(new DataView(bits).getUint32(0)) >= c.bits) found.push(n);
      answered.add(n);
      while (answered.has(tried)) answered.delete(tried++);
    }
  };
  await Promise.all(Array.from({ length: opts.inFlight ?? POW_IN_FLIGHT }, lane));
  return found.sort((a, b) => a - b).slice(0, c.count);
}
```

  `net.ts`:
  - `RoomEnv` gains `subtle(): Subtle | null`. `main.ts` passes `globalThis.crypto?.subtle ?? null`; it is null outside a secure context.
  - With `subtle` null, `host` and `join` throw "Rooms need a secure (https) page. Solo hills still work."
- [ ] **Step 4: Run green.** The node command above, then `bash games/tankity/test.sh`.
- [ ] **Step 5: Commit.** `Tankity: the browser solves the room puzzle with WebCrypto PBKDF2`

### Task 12: "Setting up the room…", 6-character codes in the lobby

**Files:**
- Modify: `src/lobby.ts`:
  - `hostRoom` says "Setting up the room…" (replacing "Raising the flag…") and `joinRoom` says "Setting up your seat…" (replacing "Knocking…") through `onWorking`;
  - the Host and Join buttons are `aria-disabled` and ignore clicks while working;
  - join validation uses `/^[A-Z0-9]{4}$|^[A-Z0-9]{6}$/` after `room_code_clean`'s TS twin `cleanCode`;
  - `?code=` accepts 4 or 6, and the error line reads "Room codes are 6 letters or digits. Read it back and retry.".
- Modify: `src/ui/lobby.tsx` (`maxLength={7}`, `placeholder="K7Q 2MX"`, `autocapitalize="characters"`; the code shown as `K7Q 2MX`; the status line already sits in an `aria-live="polite"` region; check that, and add it if missing)
- Modify: `src/seats.ts` (accept 4 or 6)
- Modify: `test/lobby.test.ts`, `test/ui.test.ts`, `test/seats.test.ts`
- Create: `tests/e2e/tankity-pow.spec.mjs`; Modify: `tests/e2e/playwright.config.mjs` (the webkit project's `testMatch` gains `tankity-pow.spec.mjs`; a `firefox` project behind `E2E_FIREFOX`, matching only that spec)
- Modify: `compose.yaml` (`TANKITY_POW_BITS: "4"`), `Makefile` `url` (print `127.0.0.1` when `compose port` answers `0.0.0.0`, so the page is a secure context)

- [ ] **Step 1: Write the failing tests.**
  - lobby:
    - while `host` is pending, the status line is "Setting up the room…" and a second Host click calls nothing;
    - `cleanCode(' k7q-2mx ')` gives `'K7Q2MX'`;
    - a 5-char code is refused with the new line.
  - ui: the code renders as `K7Q 2MX`, and the status region has `aria-live="polite"`.
  - e2e `tankity-pow.spec.mjs` (chrome; webkit and firefox when enabled):
    1. "hosting shows Setting up the room… and gets a 6-character code". Assert `isSecureContext` first, with a message pointing at the Makefile `url` fix.
    2. "a friend joins with the code typed with a space".
    3. "an old tab is told to reload": `page.route` strips `proto` from the create body, and the line reads "Tankity was updated. Reload the page to keep playing."
- [ ] **Step 2: Run red.**
  ```bash
  node --test test/lobby.test.ts test/ui.test.ts test/seats.test.ts
  ```
- [ ] **Step 3: Implement** as listed. Rebuild. Never bind or mention Esc. Q still closes the lobby veil.
- [ ] **Step 4: Run green.**
  ```bash
  node --test test/lobby.test.ts test/ui.test.ts test/seats.test.ts
  COMPOSE_PROJECT_NAME=tankity-pow-$$ E2E_WEBKIT=1 make e2e E2E_ARGS="tankity-pow.spec.mjs"
  COMPOSE_PROJECT_NAME=tankity-pow-$$ E2E_FIREFOX=1 make e2e E2E_ARGS="tankity-pow.spec.mjs"
  ```
- [ ] **Step 5: Commit.** `Tankity: Setting up the room…, six-character codes, puzzle e2e on three engines`

### Task 13: Calibrate the difficulty

**Files:**
- Create: `tools/pow-bench.html` (a page outside the game bundle that runs `solvePow` 20 times at bits 9 and prints the mean and p95; it reuses `dist/` only through a tiny inline module)
- Modify: `server/settings.php` (`ROOM_POW_BITS` default from the measurement), `README.md` (the numbers measured, by engine)

- [ ] **Step 1:** Add a Playwright case to `tankity-pow.spec.mjs` that opens `tools/pow-bench.html` with CPU throttling 4× (Chrome DevTools `Emulation.setCPUThrottlingRate`, the usual stand-in for a mid phone). It reports join and create means and p95s, and fails when the throttled join p95 exceeds 1000 ms. Run it red at a deliberately high default (`pow_bits` 13), to see the failure.
- [ ] **Step 2:** Run it on chrome, webkit and firefox, unthrottled and throttled (chrome only). Set `ROOM_POW_BITS` to the largest value with a throttled join p95 ≤ 1000 ms. Record the table in README "Room slots" as current numbers: per engine, the mean and p95 at the default.
- [ ] **Step 3: Run green** (the same spec).
- [ ] **Step 4: Commit.** `Tankity: puzzle difficulty set from measurements on three engines`

### Task 14: Stacks, web test, docs, the full gate

**Files:**
- Modify: `rooms-web-test.php` (solve puzzles in PHP with `room_pow_lead` at the stack's `pow_bits`; check 426 without `proto`; check a 6-char code)
- Modify: `test/php-docker/RoomsTest.php`, `RoomsLoadTest.php` (create and join through a shared `solve` helper)
- Modify: `README.md` (settings table: `pow_bits`, `pow_surge`; "Room slots": the puzzle, its order of checks, codes, the guessing math table), `.config.yaml` comments
- Modify: `protocol/generate.php` scenarios if a fixture covers create or join bodies; then run `make protocol`

- [ ] **Step 1:** Run red on the stack: `COMPOSE_PROJECT_NAME=tankity-pow-$$ make test`. `rooms-web-test` and the docker suites fail without puzzles.
- [ ] **Step 2:** Implement the helpers, then `make protocol`.
- [ ] **Step 3: Run green:** `COMPOSE_PROJECT_NAME=tankity-pow-$$ make test`, plus the two e2e specs `tankity-pow.spec.mjs` and `tankity-rooms-play.spec.mjs`. Open PR 3.
- [ ] **Step 4: Commit.** `Tankity: the stacks and the web test pay the puzzle; Room slots documents it`

---

## Attack scenarios → tests

| Scenario | Test |
|---|---|
| 13 addresses trying to hold every slot (idle) | `RoomReclaimTest::testThirteenAddressesCannotHoldEverySlot` |
| The same, with bots playing (residual, documented) | `RoomReclaimTest::testAPlayedHoldIsTheResidual` |
| Cheap keep-alive | `RoomGuardTest::testMenuAndBodyDoNotKeepARoomAlive`, `testAnOffTurnWeaponDoesNotStamp` |
| Fairness | `RoomReclaimTest::testFinishedThenStaleThenDormant`, `testAnActiveLongGameOutlivesAStaleShortOne`, `testAnActiveRoomIsNeverPicked` |
| Lobby flood | `RoomLobbyPoolTest::testALobbyFloodNeverEvictsAFreshAttendedLobby`, `testFourLobbiesPerAddress`, `testADeadLobbyGoesFirst` |
| Code guessing | `RoomPowGateTest::testAGuessWithoutWorkLearnsNothing`, `testCodesAreSixCharactersAndOldOnesStillWork` |
| Puzzle replay | `RoomPowTest::testReplayIsRefused`, `RoomPowGateTest::testAReplayedPuzzleIsRefusedAndUncharged` |
| Puzzle from an old challenge | `RoomPowTest::testAnOldChallengeIsRefused`, `RoomPowGateTest::testAnOldPuzzleIsRefused` |
| Forged or rebound challenge | `RoomPowTest::testIssueIsSignedAndBound` |
| Old bundles | `RoomLocalStartTest::testAnOldBundleStartingAloneIsToldToReload`, `RoomPowGateTest::testOldBundlesAreToldToReload`, e2e `tankity-pow.spec.mjs` "an old tab is told to reload" |
| Evicted players see why | e2e `tankity-rooms-cap.spec.mjs`, `test/lobby.test.ts` `netGone('space')` |
