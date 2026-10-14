# Operation Tankity

Scorched-Earth artillery against a drone battery. Endless escalating rounds
from a $600 stake, solo or in network rooms (max 10 live). No chat; names are
3-letter initials, typed in either case and stored uppercase, with a blocked
list (`room_valid_initials` in server/rules.php, through `tankity_initials`).
Kid-friendly copy, human error strings, never status codes. GPLv3 (LICENSE).

The page opens on a title card over the dimmed demo: Play (solo, random hills), Play with friends (the rooms), Tutorial, Settings, and the player's initials, the one set solo and the rooms both use. The rooms lobby has the same three boxes above Host and Join, so a friend who arrives on an invite link (straight into the lobby) can set theirs there; a set typed in either place shows in both. Host and Join use what the boxes hold, and refuse half-typed boxes or a blocked word with a line by the boxes. The card comes back after a match ends and after leaving a room. Q toggles the settings menu and closes whatever is open; Esc does nothing (Safari and Firefox always leave full screen on it, so the game never asks for it, and `game.yaml` refuses it as a binding). Quit in the menu ends the match (leaving a room first) and returns to the title card over the demo; an installed app closes, or says how to close it (`games/_kit/app.ts`).

## Files

| File                                                            | What it is                                                                                                                                                                                  |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`, `game.css`                                        | The page and its styles. The page loads `dist/fx.js` (deferred), then `dist/main.js` (an ES module) |
| `src/main.ts`                                                   | The entry module: the game's state, the main loop, the keys, the page's plumbing (overlays, the firing range, loading `game.json`) and the wiring that hands each typed module below the pieces of the game it needs. It is bundled into `dist/main.js` |
| `game.yaml`                                                     | The one file a maintainer edits: `arsenal` (21 shells and tricks), `keys` (every binding), `audio` (optional sound files), `effects` (every weapon's muzzle, trail and blast). Commented field by field |
| `game.json`                                                     | Generated from `game.yaml`; the only data file `src/main.ts`, `rooms.php` and the effects editor load. Never edit by hand                                                                                           |
| `audio/sfx/`, `audio/music/`, `audio/CREDITS.md`                | Optional CC0 sound files named by `game.yaml`, and where each came from                                                                                                                     |
| `src/detmath.ts` | `dsin`, `dcos`, `datan`, `datan2`: the sim's trigonometry from `+ − × ÷` and `floor` only, the same bits as `server/detmath.php` |
| `src/sim.ts` | The game math in TypeScript: RNG, terrain, flight, hit tests, blasts. Pure: state in, what happened out; no page, sound or particles |
| `src/field.ts` | How wide a solo field is dealt (from the landscape battlefield box, whichever way the device is held), where the field sits in the box, and the power step and its display per width. DOM-free |
| `src/ghosts.ts` | The draw-only flight of a shell the sim retired past the field's edge, until it is off the picture: no collision, blast or effect on the game |
| `src/scenery.ts` | The hills past the field's edges, for drawing only: the round's hills continued, eased from the field's edge |
| `src/rotate-hint.ts`, `src/ui/rotate-hint.tsx` | When the "turn sideways" chip shows (portrait, in a match, until dismissed) and the chip itself |
| `src/ai.ts` | The drone AI: ballistic aim, bracketing, the six strategies (`aiChoose`, `pickTactic`) and the difficulty table (`DIFFICULTY`). Pure; imports the sim, never the reverse (the sim keeps `brkLand`, which a blast calls) |
| `src/ai-measure.ts` | `measureHitRates`: a drone bracketing a stationary player on seeded hills with the real sim, counting the shots that take armor off, per shot of the bracket. The difficulty table is tuned against it. Pure, never bundled |
| `src/difficulty.ts` | The Difficulty setting as the player keeps it (`tankity-difficulty`, missing or unknown reads as normal) and the levels' names |
| `src/audio.ts` | All the sound in TypeScript: WebAudio context, synthesized effects and built-in songs, game.json's sound files, the track player (silence-trimmed loops, cross-fades), mutes. It never touches the page |
| `src/net.ts` | The room client: transport (one fetcher, the 429 retry; create and join never retry a 429), the session (host, join, or resume a stored seat; `detach` drops it telling nobody, `leave` gives it up), polling, the act/buy/ready/leave senders, `mine` (its own fetch path), the turn, shop and room-close clocks, and the hidden-tab catch-up decision. It never touches the page: fetch, timers and the clock are passed in |
| `src/replay.ts` | The room volley replay: the queue of events waiting to play and the volley on screen. Eases the shooter's barrel, flies each shell along the path the server recorded (positions and velocities for the renderer), lands blasts and hits when the events say, and plays a volley kept back by a catch-up, or fired by a drone with no human standing (`watch`), at triple speed (`FAST_SPEED`). Sound, particles, craters, armor and log lines happen through callbacks; it never touches the page |
| `src/preview.ts` | The firing-range preview simulation: a fixed dummy, the solver that aims at it with the war's own ballistics, the shell loop (seeker, cluster, pierce, proximity, roller), the damage tally and the result timing, on its own small field. Weapons, effects and the result line are passed in; it never touches the page |
| `src/flow.ts` | The solo match flow: the `Phase` union (`banner`, `shop`, `aim`, `think`, `fly`, `settle`, `over`), the events that move between them and one table, `FLOW`, with `transition(phase, event)` returning the next phase or `null` for an illegal move. `match.ts` stores the result in `G.phase`; room matches take their phase from the server and skip it. It also holds the solo watch speed (`WATCH_SPEED`, `warSpeed`) and the fixed-step runner `runFixed` (`MAX_STEPS` per frame). Pure; it never touches the page |
| `src/render.ts` | The battlefield on the canvas: sky and moon, clouds, hills, the scenery past the field's edges and the dirt below it (melting into the ground), the units and their bodies, aim arm, blasts, shells (and, draw-only, the ones the sim retired past the edge), sparks, the wind streaks, the on-canvas turn clock and the firing-range preview. Reads a `BattleView` that `view.ts` builds each frame and paints it; it never changes game state |
| `src/game-types.ts` | Types only: the shapes `main.ts` shares with its modules. `GameState` (the sim's `World` plus the page's bookkeeping: the shop, the dialogue queue, the banner, the camera), `GameTank`, `MatchState` (a room match's turn, unsent aim and waiting snapshot) and `Tables` (the arsenal as `main.ts` holds it now). Each module picks the slice it reads and writes |
| `src/match.ts` | The solo match as the page plays it: announcing whose turn it is, firing and what a blast does to each unit, a drone's shot, the end of a round and of the match (saved once on this browser's board), the 1-ups (`checkOneUps`: each frame, and before and after a round settles), the name cards, the end veil's props and the cosmetics decay. `createMatch(deps)` |
| `src/solo.ts` | The solo rules, without a page: dealing a match, mustering a round, the turn order, settling a volley, 1-ups and a drone's aim. Reads no clock and no `Math.random` |
| `src/room.ts` | A running room match on this client: the moves it sends (fire, aim, drive, load a gun, buy, Ready), adopting the room snapshot once the replay before it has played, turning events into log lines, talk and sounds, a room frame, the turn alert for a hidden tab, and the final standings. `createRoom(deps)` |
| `src/lobby.ts` | Getting into and out of a room: the lobby overlay's props, the server dot, the hills picker, the initials boxes' line, hosting and joining under the initials the boxes hold, the roster, the invite link, starting the match, the leave question, leaving, and back to the lobby for Play again. `createLobby(deps)` |
| `src/seats.ts` | The room seats this browser holds (`tankity-seats`: code, seat, token, CSRF token, initials; newest 12): remembered after host and join, forgotten on Leave or when the server says the room is gone. A malformed entry is dropped on its own |
| `src/games.ts` | The Your games watcher: asks `action=mine` every 10 s (and when the tab comes back) for every stored seat but the room on screen, forgets gone rooms, and reports each turn once by its turn key. `roomOnScreen` says which room a tab shows. DOM-free |
| `src/notify.ts` | Turn alerts as browser notifications: feature-detected, permission asked only from the Turn alerts click (promise or callback form), the opt-in `tankity-turn-alerts` setting, `showTurnNotification` |
| `src/toasts.ts`, `src/ui/toast.tsx` | The turn toasts: one per room, the newest three, each closing 12 s after the page is first seen with it; drawn into `#toast-root` with Go and Dismiss |
| `src/on-screen.ts` | Which room each tab of the game shows, told to the other tabs over a BroadcastChannel (else the `tankity-on-screen` localStorage key and its storage events), so no tab toasts a room another tab shows |
| `src/turn-time.ts`, `src/ui/turn-time.tsx` | A room's turn time: the seven stops and labels (kept equal to `server/settings.php`), clock text at any length, the status bar's and the shop's notes, the settle delay; and the slider (a native range with its label) |
| `src/ui/games.tsx` | Your games: one row per room (where it stands, whose turn, time left or the room's close), Open, and the Turn alerts button |
| `src/armor.ts` | Armor between rounds: max armor (100 plus 25 per plate), what a repair restores and how many packs fill the hull, a plate's armor, what the next round musters with, and the armor words the shop and the ARMOR pill use. The room server's armor rules (`rooms.php`) agree with it |
| `src/shop.ts` | The field shop: what a pack costs and how many the chest covers, each row's stat lines, the Ready line in a room, what a purchase does to the stock and the gear, and the shop overlay's props. `createShop(deps)` |
| `src/guns.ts` | The weapon picker: the rack's tiles, the cursor and its keys, loading a gun and cycling through the rack. `createGuns(deps)` |
| `src/chatter.ts` | What the crew says: the speakers, the line tables, the portrait, the speech-bubble queue, and the radio log with its overlay props. `createChatter(deps)` |
| `src/effects.ts` | Weapon looks on the effects engine (`src/fx/engine.ts`): the baked fallback, installing `game.json`'s effects over it, and the muzzle, impact, special and trail plays. `createEffects(deps)` |
| `src/hud.ts` | The status bar's values (aim numbers, AMMO, ARMOR, lives and WIND pills, the match badge) and the Weapon button's face, redrawn only when they change. `createHud(deps)` |
| `src/weapon-label.ts` | The Weapon button's line: damage and an S/M/L blast size from the radius, one tested cut-off (and the same line in words for screen readers) |
| `src/ui/gun-label.tsx` | The Weapon button's face: shell icon, name, the damage and blast line, and the rest of the rack for readers |
| `src/view.ts` | The camera, and the `BattleView` snapshot the canvas paints each frame (whose turn marker shows, whether the aim arm is up, when the clock counts down). `createView(deps)` |
| `src/tutorial.ts` | The coach: the steps, their key-name text, remembering a finished lesson, and the overlay's props. `createTutorial(deps)` |
| `src/standings.ts` | This match's scoreboards: the room's match-end rule (`matchOutcome`, `winnerBonus`), room and solo rows (`roomBoard`, `soloBoard`), the filed line of an online score and the saved line of a local one (`localLine`), and `roomLocalSaver`, which saves a one-human room's score on this browser's board once per match |
| `src/ui/standings.tsx` | The scoreboard table, at the top of the shop and on the end cards |
| `src/scores.ts` | The scores overlay's data: the online board for a difficulty from `scores.php` (the latest load wins; the player's own rows marked), this browser's board for it, `saveLocal` for a finished run (the run just saved is marked), and a redraw when another tab saves. At load it moves the older `tankity-local` rows onto this browser's board. `createScores(deps)` |
| `src/local-board.ts` | This browser's board, pure on the kit's storage port: the best 20 runs per difficulty under `tankity-scores-local` (`{v: 1, boards}`), ties to the older run, a run saved once by its `ref`, a damaged value read as empty and blocked storage kept nothing and said so, and the move of the `tankity-local` rows an older page saved |
| `src/menu.ts` | The settings menu (the unit look, the text size, the Difficulty and Screen flashes, all remembered in this browser) and the menu overlay's props. `createMenu(deps)` |
| `src/title.ts` | The title card over the demo: whether it shows, the initials it edits, and its props. `createTitle(deps)` |
| `src/initials.ts` | A player's three-letter initials: the rule, the blocked words, the one saved set per browser (`tankity-initials`), random until chosen, saving a typed set, and reading the three boxes for Host and Join |
| `src/ui/initials-picker.tsx` | The three initials boxes the title card and the rooms lobby share, their ids under a prefix (`title-initial-1`, `lobby-initial-1`); typing survives a redraw |
| `src/protocol.ts` | The room wire protocol as types: replies, the room snapshot, the discriminated union of events, and each action's request body. Types only |
| `src/protocol-fixtures.check.ts`, `src/tsconfig.check.json` | Type-check only, never emitted: assigns every `protocol/*.json` to its type (see Protocol fixtures) |
| `src/ui/*.tsx` | The Preact overlays and panels (see Preact overlays): `chrome.tsx` holds the shared key labels, title bar and scroll keeper; `help.tsx`, `shop.tsx`, `lobby.tsx`, `menu.tsx`, `guns.tsx`, `scores.tsx`, `log.tsx`, `tutorial.tsx`, `hud.tsx`, `endveil.tsx`, `leave.tsx` and `title.tsx` one each, and `initials-picker.tsx` shared by the title card and the lobby |
| `src/ui/icons.ts` | The small canvas pictures (a shell, a trick, a hills silhouette, a unit thumbnail). Each draws on the canvas and the weapon or trick it is handed and reads nothing else |
| `dist/main.js`, `dist/fx.js`, `dist/fx-editor.js` (and `.map`s) | The bundles the games kit builds from `src/` (see Source layout and build); checked in and deployed (the host has no Node), except the dev-only `fx-editor.js`. Never edit by hand |
| `build.json`, `tsconfig.json`, `src/tsconfig.dom.json`, `src/tsconfig.check.json` | The build setup: the three entries and the three type-check programs. Never deployed, like `src/`, `test/` and `tools/` |
| `test/*.test.mjs`, `test/dom-stub.mjs` | The Node tests (`node:test`, see Tests); the stub is the small Node DOM that `ui.test.mjs` and `smoke.test.mjs` share. Never deployed |
| `test/php/`, `test/php-docker/` | The PHPUnit cases (`tankity` and `tankity-docker` suites) and, in `checks/`, the check scripts they run. Never deployed |
| `rooms.php` | Room server entry point: request parsing, the `$action` handlers, `room_json_out` (gzip), `room_gate`. It requires the files below, and keeps the one helper that resolves against its own location (`room_arsenal` reads `game.json`) |
| `server/settings.php` | What a room is (`ROOM_*` shape constants) and the host's knobs (`room_max_rooms`, `room_live_secs`) and the turn-time stops |
| `server/store.php` | Rooms as rows: the room lock (`RoomLock`, one write transaction from `room_load` to `room_unlock`), create/register/close/discard, `room_save`, `room_count`, the sweep, room codes |
| `server/db.php` | Where Tankity keeps its files (`tankity_data_dir`), the database (`tankity_db`), the journal mode for its filesystem, the schema steps, `tankity_tx` |
| `server/rate.php` | Each address's hourly count of rooms created and joined, in the `rate` table: `room_rate_take`, `rate_used`, `rate_take`, `rate_expire`, and `room_joins_per_hour()` (`room_joins_per_hour`, default 300) |
| `server/guard.php` | Tankity's settings for the kit's `Kit\ScoreGuard` (`tankity_guard()`, `tankity_initials()`; Tankity uses its origin, address and initials checks), and `BLOCKED_INITIALS` (the same list as `src/initials.ts`) |
| `server/score-guard.php` | The kit's score guard, a generated copy written by `tools/install-files.php` (`kit_php`); never edit it |
| `server/board.php` | The all-time boards, one per difficulty, best 100 room runs each, rows in the database (`board_file`, `board_top`); a row can only come from a room match that two or more humans started |
| `server/housekeep.php` | Cleanup on requests, at most once a minute (`tankity_housekeep`, `tankity_jobs`) |
| `data/` | Runtime only, when PHP may write here: `tankity.sqlite` and the deny `.htaccess` PHP writes. Never in git, never deployed |
| `server/detmath.php` | `det_sin`, `det_cos`, `det_atan`, `det_atan2` and `det_round` (`Math.round`): the same bits as `src/detmath.ts` |
| `server/sim.php` | The deterministic sim that `src/sim.ts` mirrors: RNG, terrain, the curated hills, weapons, ballistics, the Roller (`room_roll_*`), hit boxes and sweeps, explosions, settling |
| `server/ai.php` | Drone aim, bracketing, the strategies and their flips, `room_ai_rack` |
| `server/rules.php` | Seats and economy, rounds (`room_start_round`, `room_advance`, `room_end_round`), the turn clock, drone pacing and watch turns, the shop, firing a volley, lives and winnings, scores |
| `server/protocol.php` | The event log, `room_want`, snapshots and deltas (`terrainRev`, resync) |
| `server/.htaccess` | `Require all denied`: the files in `server/` are libraries, never endpoints. Each also answers 404 if asked for directly (`TANKITY_ROOMS_INCLUDED` is defined only by `rooms.php`) |
| `scores.php`, `config.php` | Score API: a GET answers a difficulty's online board, every POST answers 410 (solo scores stay in the browser); `.config.yaml` reader |
| `src/fx/engine.ts`, `src/fx/types.ts`, `src/fx/trail.ts` | The effects engine (particle pool, emitters, screen flash, shell glow), shared by the game and the editor; bundled as the classic script `dist/fx.js`, which sets `window.TankityFX`. `types.ts` is the engine's public shape (`FxEngine`) |
| `fx/sprites/` | Sprite sheets and `sprites.json`, rendered by `fx/blender/render_fx.py`: blasts and smoke (`blast`, `fireball`, `plume`, `smoke`, `flakburst`, `nuke`), ground (`dirt`, `debris`, `scorch`), light (`shock`, `energy`, `electric`, `flare`, `muzzle`), the shells in flight (`shells.png`, one `p_*` sheet per shell), `moon` and `parachute` |
| `fx/blender/render_fx.py` | Headless Blender script that builds and renders the sprite sheets; its header documents the command and every option. Dev only |
| `fx-editor.html`, `fx-editor.css`, `src/fx/editor.ts` | Dev-only live effects editor (see Weapon effects); `editor.ts` is bundled as the classic script `dist/fx-editor.js`, which sets `window.fxEditor`. Never deployed |
| `.config.yaml` | Server settings, read-only, never sent to browsers; env vars win (`TANKITY_MAX_ROOMS`, `TANKITY_ROOM_LIVE_SECS`, `TANKITY_DATA_DIR`, `TANKITY_JOURNAL`, `TANKITY_ROOM_JOINS_PER_HOUR`, `TANKITY_ROOM_HOSTS_PER_ADDRESS`, `TANKITY_ROOM_LONG_SHARE`, `TANKITY_ALLOWED_HOSTS`; `CONFIG_FILE` points elsewhere) |
| `metadata.yaml`, `og.png`                                       | Games-page card and link preview (see `../README.md`)                                                                                                                                       |
| `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png` | Install and offline support; the first two are generated by `tools/install-files.php`                                                                                                     |

## Layout

The frame stacks the status bar (`#hud-bar`, Preact), the battlefield (`#field`: the canvas, the title card, the round banner and the one-line chatter toast) and the control deck (`#deck`, static HTML in `index.html`: Aim, Drive, More, Weapon, FIRE). Breakpoints follow the frame's width (`#frame` is a size container): at 1100 px the labels shorten, at 860 px the bar drops to 11 px, at 760 px the key chips go. A portrait phone stacks the bar in three rows and moves Next song to the Menu; a landscape phone floats the controls over the battlefield's corners and moves Radio, Help and Next song to the Menu. `tankity-layout.spec.mjs` measures all of this on eight screens.

## The battlefield

The field is 460 world units tall. A room's is 720 wide; a solo match's is dealt at the start of each match, 460 × the battlefield box's landscape aspect, between 720 and 1440 on a whole number of 24-unit columns, and kept for the match: a resize or a turn only rescales. In portrait the width is the one the same device gives in landscape. The canvas fills the box: a wider box shows the round's hills continuing past both edges as dimmed scenery (`#stage`'s `data-w` and `data-field` give the width and the field's place); a taller box spans the field across and fills the rest with sky above and dirt below. The units spawn spread over the whole width, at least 110 apart (more than any blast plus a hull). Shells fly √(W/720) faster and last that much longer, so full power still crosses the field and the wind bends a shot by the same share of its length; a press of power changes it by 720/W and the status bar shows one decimal above 720. The drones' wobble tightens per width (`FIELD_AIM` in `ai.ts`), so each difficulty keeps its hit rates at every width. The server's sim takes the width; rooms pass 720, and `protocol/sim-vectors.json`'s `field` group pins 720, 1080 and 1440 (terrain heights included, bit for bit).

## Editing game data

The game is self-contained: its generators live in `tools/` here and need
only PHP (and Node for the TypeScript, see Source layout) and this folder. Run from this folder (from the site folder,
`websites/www.cs`, prefix the paths with `games/tankity/`):

```
php tools/game-json.php          # validate game.yaml, rewrite game.json
php tools/game-json.php --check  # fail if invalid or game.json is stale
php tools/install-files.php      # after the last edit to any served file
```

- The generator carries its own small YAML-subset parser (the host has no YAML
  extension); the subset is listed at the top of `game.yaml`. It rejects
  unknown keys, bad enums, colours, ranges and audio paths, naming the line.
- `src/main.ts` and `rooms.php` hold a frozen fallback copy of a few arsenal rows,
  and `src/input.ts` one of the key table (shaped like `game.json`'s sections); keep them in step
  with `game.yaml` defaults.
- `install-files.php` rewrites `manifest.webmanifest`, `sw.js` and the `?v=` hashes (see Source layout and build), and keeps the
  install block in `index.html` (cache
  version = hash of the served static files, so any edit makes it stale).
  Music and sound files are never precached; sound effects are cached by the
  worker the first time they play, music streams from the network.
- `make test` and `make deploy` both run the `--check`s (the generators and the kit build) and the deploy refuses stale output. `game.yaml`, `tools/` and this file are not deployed.
- Audio plays only after the first tap or key press, never while its toggle
  (E sound, M music) is off, and a missing or undecodable file silently leaves
  the synthesized sound or song in place. Add a line to `audio/CREDITS.md` for
  every file, and use only CC0 or otherwise redistributable audio.
- Key tokens match `event.code` first, then `event.key`; the first token of an
  action names the key on buttons. Touch-only screens (coarse pointer, no
  mouse) get no key bindings or labels.
  Driving is Shift plus an arrow; W, A, S, D and C are bound nowhere. Q toggles
  the menu: it closes whatever is open and, with nothing open, opens the menu.
  Esc is bound to nothing.

## Architecture rules

- Rooms are rows in Tankity's database (see Storage), one serialized room per
  row (`rooms`: code, data, created, touched, expires). Create, join, state and every
  act hold their room as one write transaction (`BEGIN IMMEDIATE`) from
  `room_load` (or `room_alloc`) to `room_unlock`, so writers take turns across
  all rooms; a request that waits past the 2 s busy timeout answers 503 "this
  room is busy". A room serializes to 30–45 KB; one past 128 KB is refused.
- Create draws a random code and inserts its row with `INSERT OR IGNORE`
  under the write lock, so a collision just draws another code; the cap is
  counted under the same lock, so it is exact. Ping only reads: it counts
  the rooms that have not expired.
- Closing a room (the last human leaves) deletes its row in its own
  transaction; a request that was waiting for it finds no room: the 404. An
  idle room is deleted by whoever loads it next, by a create, and by
  housekeeping.
- Crash safety: a request that ends while it holds a room commits what
  `room_save` wrote and rolls back anything else; one that is killed leaves
  SQLite to roll back its open transaction, and the operating system frees
  its lock.
- The server is authoritative. Clients send intents (aim, drive, weapon, fire,
  buy, body), never hits. CSRF and Origin gated; every act is range-checked.
  A request's Origin, else its Referer, must name the request's own host or
  one in `allowed_hosts` (`room_origin_ok`, the score guard's
  `originAllowed`); one that sends neither passes on its seat and room tokens.
  Creating and joining a room together spend one address's hourly allowance,
  `room_joins_per_hour` (300; 429 `too many rooms from here; try again
  later`), counted in the `rate` table, keyed by address
  (IPv6 by its /64, IPv4 inside IPv6 by the IPv4 address). Every create and
  join past the origin check is charged, except a create answered 409 because
  every room is taken: that is read before charging. A spent allowance is
  refused from a plain read, so a flood past it never takes the write lock.
  The client never retries that 429 and retries a create or join's 503 once
  (other acts retry a 429 or 503 up to three times). The docker stack
  (`compose.yaml`, local and CI) sets the allowance to 100000, since every
  test run hosts and joins from the same addresses.
- The server settles a whole turn per request. Every event it emits carries
  `at` (seconds into the volley); shot events carry their flight path, launch
  and landing times, and blast radius. Clients replay each volley at real
  speed and adopt the new room state only after the replay drains.
- Live occupancy only: a room's expiry (`room_expires`, stored in
  `rooms.expires` at every save) is the one rule the cap count, the sweep (on
  create and ping) and the load check share. A lobby expires `room_live_secs`
  after its last touch (seated polls heartbeat it). A running room (play,
  shop) expires `max(room_live_secs, distinct addresses x turn time)` after
  the last human act (one live window with fewer than two addresses): any
  request through `room_gate`, plus create and join; polls, `mine` and
  timeouts never count. The end of a match counts as an act, and a finished
  room (over) lasts one live window after it, so its places (the cap, its
  host's, a long place) come back soon. There is no total-age cap.
- A `state` poll of a running room is a read: it takes the write lock and
  saves only when `room_tick_due` says a clock ran out or a drone is up.
- The hosting cap counts a room against its current host's address
  (`room_host_key`), so when the host leaves a running match the place moves
  to the new host. Addresses are stored as a keyed hash (`addr_key`).
- Seats: a room always has four (`ROOM_SEATS`), seat 0 the host. Each seat is
  a human or a non-human with `mode` `ai` (the drone battery, the default) or
  `open` (no unit). The lobby shows them as a tile grid (initials, `AI`,
  `Open`); only the host flips a non-human tile (`action=seatmode`, lobby only,
  CSRF and the 150 ms act throttle apply). A joiner takes the first seat no
  human holds, open or drone. Start refuses unless at least one seat is on AI
  (host plus a drone is the two-tank minimum). Spawn slots count fielded seats
  only, so spacing and AI turns work with two or three tanks.
- Leaving: any human may leave at any time (`action=leave`, never throttled so
  it lands right behind an aim tap). In the lobby the chair resets to a drone
  seat (a host leaving the lobby closes the room, since nobody else can start
  it). Once the match has begun the seat, host included, becomes a drone and the
  match carries on; nothing after the lobby is host-only. The last human out
  removes the room.
- Turn clock: a human's turn runs for the room's turn time (`turnSecs`, one of
  `ROOM_TURN_STOPS`: 1 min, 2 min by default, 10 min, 30 min, 8 h, 24 h, 1
  week; set at create, changed by the host with `action=turntime` in any
  phase, kept by Play again). The clock starts in the request that passes the
  turn and stamps the seconds it started with, so a change applies from the
  next turn; aiming and driving do not reset it. When it runs out a drone
  fires for that player (`room_standin_shot`): it aims as the room's drones
  aim, with a gun from the player's own rack (the Shell when the drone's pick
  is not stocked or not yet unlocked), and never drives; the seat stays the
  player's. Snapshots carry `turnSecs` and `turnLeft`; the client alerts its
  player at 30 s and shows everyone a countdown for the last 10. Solo play has
  no clock. `room_tick` applies whatever is due and `room_tick_due` says from
  a read whether it would change anything.
- Shop clock: between rounds the shop is open for `room_shop_secs` (a turn
  time of 2 min or less gives `min(turn, 90)` s; a longer turn time gives the
  turn time itself, stamped when the shop opens), or until every human still
  in the match is ready. The
  shop button is the Ready toggle (`action=ready` with `{"ready": true|false}`,
  the wanted state rather than a flip, not throttled). Each ready change and
  the "all ready, start" check run in one locked read-modify-write, so the last
  Ready starts the round at once and a later "unready" (or a duplicate) finds
  the shop closed and changes nothing; it answers with the current snapshot.
  A clock that runs out starts the round for everyone, settled by whichever
  request (poll, buy, ready) reaches the room first. Drones, open seats,
  leavers and eliminated players never block. Snapshots carry `shopLeft` and
  `seats[].ready`; the client shows the countdown and how many are ready.
  Solo play has no shop clock.
- How a round ends (rooms and solo alike): only when one unit is left
  standing, humans and drones counted together (or none, when the last two fall
  together). Two or more humans fight on after the last drone is wrecked; every
  human wrecked, the drones fight on while the players watch. Every human whose
  tank was wrecked loses a life when the round ends; a human who survives to be
  the last unit loses none. At 0 lives a human is eliminated (`eliminated`);
  with no human left on a life the match is over (`matchover`). Only a human
  who is the last unit standing is paid (the round bonus and prize), reported
  as `roundwin` with that player's `seat`; a drone survivor, or nobody, is
  `roundlost`. Every round starts from the shop, won or lost, and a room closes
  only when every human has left it. Solo follows the same rules for the one
  player: the round ends when one tank remains, a lost round costs a life and
  opens the shop (the next round has the next number), and the last life ends
  the match.
- Speed when nobody is playing: once no human is standing, the drones play at
  3x. In a room the server advances ONE drone turn per poll, and only after the
  previous volley has had time to play (its flight time plus a beat, at least
  `ROOM_DRONE_PACE_MIN` seconds, all divided by `ROOM_DRONE_SPEED` = 3), so a
  drone-only battle is never run inline in one request and the event buffer
  (`ROOM_EVENT_KEEP`) cannot overflow between polls. Those volleys' opening
  events carry `watch: true`, and the replay plays them at `FAST_SPEED` (3, the
  same speed a hidden tab's catch-up uses; catch-up itself is unchanged). The
  volley that fells the last human plays at normal speed. Solo does the same
  client-side: with the player's tank wrecked, `warSpeed` in `src/flow.ts`
  (`WATCH_SPEED` = 3) feeds three times the frame's time to `runFixed`, which
  takes fixed `SOLO_STEP` (1/60 s) steps (aim, think delay, tank falls, shell
  flight, settle) until one tank remains; the demo never speeds up.
- Spawns are random, at least 110 px apart, and units never end a move within
  44 px of another. Each tank faces the middle; barrel keys swing toward the
  side pressed.
- Wire cost. Every human polls `action=state` every 1.6 s, and a snapshot is
  mostly hills (720 heights, about 4 KB of its 5.6 KB). So a client says what it
  already holds and the server sends only the rest:
  - `rooms.php` keeps `terrainRev` in the room, raised by
    `room_terrain_changed` whenever the hills change (a crater that really
    carved, a new round). Every snapshot names the current `terrainRev`.
  - Polls (query) and room-answering POSTs (`start`, `act`, `buy`, `ready`,
    `body`, `map`, `seatmode`; body) carry `since` (the newest event seen),
    `have` (the `terrainRev` held; absent while holding no hills) and `full=1`.
    `room_want` reads them, `room_reply_snapshot` answers.
  - The snapshot omits `terrain` when `have` equals the room's `terrainRev`.
    It is full (carries `terrain`) when `have` is missing or another revision,
    when `full=1`, and when the room has no hills yet.
  - `resync: true` marks a snapshot whose `since` is older than the oldest of
    the `ROOM_EVENT_KEEP` events still kept, or newer than the room's own
    count: events were lost, so it is full too. `RoomClient` takes it as a first
    sync: the log catches up, nothing is replayed, `room.ts` drops what was
    queued.
  - `RoomClient` keeps the hills last received (`terrain`, `terrainRev`) and
    puts them back into a snapshot that omits them, so `onSnapshot` always gets
    a complete room; `room.ts` still copies `room.terrain` into `G.terrain`, so
    craters the replay carved locally are replaced by the server's ground on
    every adopt. A reply older than the revision held never rolls the
    hills back. A new match, and leaving, forget the hills (the first sync is
    always full).
  - The client asks for `full=1` on its next request after the server could not
    be reached, after a hidden tab comes back (`resync()`), and when a snapshot
    omits hills for a revision it does not hold (it fetches again instead of
    using that snapshot; once, so a server that never sends the hills is not
    looped on).
  - JSON replies are gzipped when the request accepts it (`room_json_out`,
    `ob_gzhandler`, so errors too). Static text (`json`, `js`, `mjs`, `css`,
    `html`, `svg`, `webmanifest`) is gzipped by `mod_deflate` in
    `games/.htaccess` (`<IfModule mod_deflate.c>`); images and audio are not.
    The local nginx has the same in `docker/nginx/default.conf`.
  - Typical bytes of one poll (compact JSON, scripted match with a human
    thinking about 13 s between shots): 5.6 KB raw, 1.9 KB gzipped, 1.4 KB as a
    delta, 0.55 KB delta and gzipped. An act reply is dominated by the volley's
    shot paths (about 7.4 KB raw, 2.8 KB gzipped).
- The lobby's hill tiles draw `profile` (48 heights, 0..1) that
  `rooms.php?action=maps` computes from round one of each map's terrain.

## Storage

Everything Tankity keeps is in one directory, picked in this order:

1. `data_dir` from `.config.yaml` or `TANKITY_DATA_DIR` (the environment wins):
   used exactly as given, created 0700 when missing, and a 503 ("store
   unavailable", logged) when PHP cannot write it; never a silent fallback.
   Tests point it at a temporary directory;
2. `games/tankity/data/` when PHP can write there; PHP then writes
   `data/.htaccess` (`Require all denied`) itself, and the local nginx denies
   `/games/tankity/data/` too;
3. `/var/tmp/<username>-tankity/`, where `<username>` is `get_current_user()`
   (the owner of the running script: the account the site is deployed as),
   or `uid<N>` when the name cannot be resolved. A directory PHP creates is
   mode 0700 and its files 0600 (`Kit\StoreModes`); one that already exists
   there must be a real directory owned by PHP's own user and closed to group
   and others, or every request answers 503 "store unavailable".

Who else can reach the data depends on which user PHP runs as. As the deploying account: nobody else. As a web user every site
on the host shares: any other site's PHP runs as that user and can read and
write Tankity's database, as it can Cylon's scores; the modes
cannot prevent that.

`deploy.sh` never stages anything under `games/tankity/data/` (and git
ignores it), so a deploy never uploads into it, changes its modes or prunes
it.

The directory holds `tankity.sqlite` (rooms, the online boards and each address's
hourly room counts) and its journal. The journal mode is WAL when the directory is on a local filesystem
(`/proc/self/mounts`) and DELETE on anything else, including when the mount
table cannot be read; `journal_mode` overrides. `PRAGMA user_version` is the
schema version (`tankity_schema_steps()`); a newer server runs the missing
steps on its first request, and a database at a version this server does not
know is refused (503) rather than read. The step that creates the `rate` table
also deletes every board row a room did not file and drops the per-callsign
tables (`callsigns`, `legacy_imported`), so the online boards hold only room
matches two or more humans played.

Housekeeping has no cron: any request to `rooms.php` or `scores.php` runs it,
at most once a minute, each job bounded by rows (idle rooms, 100 at a time;
old room-join counts, 5000 at a time).

## Armor

A human's tank carries its armor from round to round. Max armor is 100 plus
25 per hull plate; fitting a plate raises the max and adds 25 armor at once.
Repair +40 restores up to max and never beyond: the shop greys it out at full
armor and says what it would restore. Losing a life sends the next round out
in a fresh tank at full max, plates still fitted. Drones are unchanged: each
round they muster with 60 + 6 × (round − 1) armor.

The rules live in `src/armor.ts` and `server/rules.php` (`room_max_armor` ..
`room_carry_armor`, used by `room_buy` and the round start and end); the
`armor` group of the sim vectors keeps them identical.

## Falling and parachutes

A unit whose ground a blast carves away drops straight down, never sideways,
and comes to rest on the ground or on a unit beneath it. Falls settle once a
volley, when its last shell is down, so a pit dug by several bursts (a
Buckshot's pellets) is one fall. The drop is measured at rest: the first `freePx` pixels are free, and every
pixel past them costs `perPx` armor, rounded down (`arsenal.fall` in
`game.yaml`, which also explains the chosen numbers). Fall damage is a hit like
any other: it comes off armor, the bunker halves it, and a shield does not
stop it.

- Credit goes to the blast that lowered the ground under the unit the most
  (the first of equals; a last stand going off under a unit another shot
  dug out does not take its fall): the damage scores and pays as a hit of theirs would (the player's twice the
  damage against drones), and a wreck is their kill, with the kill bonus, the
  match kill and the drone's last hit. A unit that digs out its own footing
  takes the damage and credits nobody.
- A unit that lands on another hurts the one beneath by the same amount,
  credited to the same digger.
- Parachutes are a shop row (`parachute`, two a pack, they stack; the status
  bar and the shop count them). One opens when a fall would cost the unit more
  than `chuteOver` (5, as in Scorched Earth), counting its bunker: the unit floats down and takes
  nothing. At or under it the parachute stays packed and the small damage
  applies. A parachute never protects the unit underneath. Drones carry one
  each from round `aiRound` and spend it by the same rule.
- One settle, everywhere. The room server lands every unit at the end of each
  volley (`room_settle_tanks`, run by `room_fire_shot`) and emits `fall`
  events (and `kill`) stamped for the replay. A solo match runs the same
  settle in the browser (`src/sim.ts` `settleFalls`, through `settleVolley`
  when the volley's last shell is down in `src/match.ts`); until then a unit's
  rule height stays where it stood, for the volley's later hits, as on the
  server. So the same shot costs the same armor solo and in a room; the `fall`
  and `volley` groups of the sim vectors check it (the browser replays each
  volley as a solo match plays it).
- The picture is separate (`drawY`, `fallTanks`): a unit whose ground goes is
  seen to fall at once, solo and in a room, and on to where the settle put it.
  A landing's words, sparks and wreck show when its unit is seen to touch down
  (or at once, if it already has), and its armor bar holds until then
  (`settleVolley`, `dueFalls`). A parachute is armed, not opened: by the
  volley's settle or its prediction (`armChutes`) in a solo match, and by the
  volley's `fall` event when the replay starts it in a room. It opens as the
  unit starts to drop, floats it down at 60 px/s and folds on landing; no
  canopy is ever drawn over a unit on its ground.
- The parachute drawn over a falling unit is `fx/sprites/parachute.png` (six
  frames opening, ten swaying), with a canopy drawn in code until the sheet
  has loaded.

## Match end and scoreboards

Solo is endless and ends at ♥ 0. A room with one human plays the same way, and its score goes on this browser's board like a solo one (see Scores). A
room that started with two or more humans ends when only one human has lives
left: that human wins, with a winner's bonus of twice the round bonus
(`room_match_outcome`, `room_winner_bonus`; `src/standings.ts` is the same
rule, pinned by the `match-end` vectors). The drones' 40-turn watch cap stays.

Leaving a room mid-match is a forfeit: the leaver's seat goes to the battery
and the other of the last two humans wins when that round ends, with the
normal bonus. A player who left is not filed online. A seat that is out of the match
cannot buy in the shop (`room_buy` answers 409). When the host leaves, the
lowest seated human hosts the room, so Play again always has someone to start it.

The server keeps each human's match (rounds won, kills, this round's gain, the
round the last life went) and sends it in every snapshot, with the winner and
the winner's bonus. The shop opens under this match's scoreboard after every
round (beside the weapon list on any wide screen, above it on a phone held
upright); a finished room match shows the final standings with ♛ on the
winner, **Play again (same room)** (back to the lobby with the same code and
seats, every human on fresh lives, score and cash) and **Leave room**; losing
your last life while others play shows the same table with **Watch the
finish**, and Menu → Standings brings it back. A solo match shows its rounds
the same way and heads its end card with them.

## Scores: the online board and this browser's board

There are two boards, each with Easy, Normal and Hard.

**The online board** holds room matches that two or more humans started. The
room server files each human when the last life goes and the winner when the
match ends, on the room's difficulty (the host's), with `rooms.php` computing
the score; a browser never sends one. A match counts as two-human by the
number of humans seated when it began (`startHumans`), so a match one player
forfeits still files its winner, while a room with one human and drones files
nothing online: the snapshot marks that player's `you.filedLocal` and the
client saves the score locally. Each board keeps the best 100 runs. One person
with two browsers can seat two humans and file online; the score is still the
server's own computation of a real match.

`scores.php` answers a GET with a difficulty's board
(`{difficulty, scores: [{name, best, banked, won, place, at}], keep}`, never a
seed) and every POST with `410 {"error": "solo scores now stay in this
browser"}`, before reading the body or touching the database, so a page cached
from before the change saves its run locally (a failed filing keeps the run in
`tankity-local`, which the current page moves onto its board at load).

**This browser's board** (`src/local-board.ts`) holds solo matches and room
matches only one human played, in `localStorage` under `tankity-scores-local`
(`{v: 1, boards: {easy, normal, hard}}`): the best 20 per difficulty, ties to
the older run, each run saved once by its `ref` (`solo:<seed>:<at>`,
`room:<code>:<matchId>`, or `legacy:…` for a moved `tankity-local` row). A
damaged value reads as empty boards; blocked storage keeps nothing and the card
says so. Two tabs saving in the same millisecond can lose a row. The end card
says where the run went: "Saved on this browser's board · #3 on Normal",
"Saved in this browser · 8,240 pts, outside its best 20 on Normal", or "This
browser can't keep scores (storage is blocked)", and "Filed · #12 all-time on
Normal" for an online score.

Menu → Scores opens on the player's current difficulty with a switcher to the
other two and two lists under it: "Online · room matches with 2+ players"
(`#scores`, the top 20 with the player's own runs marked; "The online board is
out of reach right now." when the server cannot be asked) and "This browser"
(`#scores-local`, each row tagged solo or room, the run just saved marked). A
change another tab saves redraws an open overlay.

The server settings that remain are in `.config.yaml` or as upper-case
`TANKITY_` environment variables (the environment wins):

| Setting | Default | What it bounds |
| --- | --- | --- |
| `max_rooms` | 50 | Rooms that exist at once |
| `room_live_secs` | 600 | Seconds since the last touch before a lobby closes; also the shortest idle limit of a started room |
| `room_hosts_per_address` | 4 | Unexpired rooms one address hosts at once (429 past it) |
| `room_joins_per_hour` | 300 | Rooms one address creates or joins in an hour |
| `room_long_share` | 0.5 | Fraction of `max_rooms` that rooms with a turn time of 8 h or more may hold, at least one room; the create or turn-time change that would pass it gets 409 "every long-game slot is taken" |
| `allowed_hosts` | `www.cs.siue.edu,cs.siue.edu` | Hosts a request's Origin may name |
| `addr_key` | made once, kept in the database | The key for the hash a room stores in place of an address |

Rooms are shared out by address, not by player. A room that has fewer than two
distinct addresses among its humans closes `room_live_secs` after the last human
act, whatever its turn time; each further distinct address adds one turn time.
Players behind one shared address (a lab or campus NAT) count as one address, so
together they host 4 rooms at once (`room_hosts_per_address`) and their rooms
close after the 10-minute idle limit. For a host whose players share an address,
raise `room_hosts_per_address` and `room_live_secs`. Long games (turn time 8 h or
more) are capped at `floor(max_rooms * room_long_share)` rooms, at least one, so
several addresses together cannot hold every place for a week; shorter turn times
stay allowed when that share is full.

## Long games

A room plays over minutes, hours or a week.

- **Turn time.** The host picks one of seven stops on a slider: Lightning 1 min,
  2 min (the default), 10 min, 30 min, 8 h, 24 h, 1 week. It sits in the host
  form, in the room's lobby and, during a match, in the menu; everyone else sees
  the label. The slider sends its value once it has stood 400 ms, so a drag is
  one change. A change counts from the next turn: the running turn clock and an
  open shop keep theirs. In a match every player's radio log says who set it.
  With a turn time of 10 min or more, the status bar shows the time left.
- **When a turn runs out**, a drone fires for that player once: it aims as the
  room's drones aim and fires from the player's own rack (the Shell when the
  drone's pick is not stocked or not yet unlocked), and never drives. The seat
  stays the player's.
- **The shop** stays open 90 s in rooms of 2 min or less (60 s in Lightning) and
  one turn time in longer rooms; all voters Ready still closes it at once.
- **Closing.** See the idle rule above: a lobby lasts `room_live_secs` after its
  last touch; a started room lasts one turn time per distinct address with
  nobody acting, at least `room_live_secs`. Replies carry `expiresAt` and
  `closesIn` (seconds from the reply, so the client's own clock never matters);
  when the room would close before the running clock ends, the status bar, the
  shop line and Your games say "Room closes in 9:00 unless someone plays".
- **Seats outlive the tab.** Closing a tab sends nothing. The browser keeps every
  seat it holds (`tankity-seats`); the room link (`?code=`) or Your games brings
  the player back, into the lobby or the running match. In a match the leave
  question offers Step out (back to the title card, seat kept) and Leave room
  (the seat goes to the drone battery for good); Menu → Quit steps out. Only
  Leave gives a seat up.
- **A room's lobby closed with Q** keeps its seat and its heartbeat: this tab
  keeps polling the lobby, so it stays open and listed in Your games. If the
  host starts the match meanwhile, the match waits in Your games (and its turn
  toast) rather than pulling the player out of what they are doing.
- **A room that is gone** (swept after its idle limit) or a seat given up in
  another tab stops the polls at once: the seat is forgotten and the player
  lands in the rooms lobby with "Room CODE has closed." or "Your seat in room
  CODE was given up."
- **The lobby's status line** holds what the player's last act got (a refusal
  such as a full long-game share, or a match that needs a drone) until the next
  act; who starts the match is a separate line (`#room-hint`).
- **Your games** lists those rooms on the title card and in the rooms lobby,
  each with where it stands ("ZED's turn", "Your turn, 7h 59m left", "Shop
  open"). A tab asks `action=mine` every 10 s and when it comes back into view;
  the server applies any timeout that is due while answering.
- **Toasts and turn alerts.** When your turn starts in a room not on screen, a
  toast names it ("Your turn in 7K2Q · vs ZED"), with Go. Turn alerts are opt-in:
  the Turn alerts button asks the browser for notifications from its click and
  then a hidden tab also shows a notification. Both need a tab of the game open
  somewhere; there is no Web Push. Browsers throttle timers in background tabs
  (Chrome to about one poll a minute once a tab has been hidden five minutes, and Safari may suspend them
  entirely), so a hidden Safari tab can be late or silent. Tabs tell each other
  which room each shows, and no tab toasts a room another tab is showing.

## Drone aim

Two copies of one algorithm, `room_ai_choose` in `server/ai.php` and `aiChoose` in
`src/ai.ts`, pinned together by the sim vectors.

- Target: whoever the drone's strategy picks (next section), except that a
  bracket in progress on a target the strategy still wants is kept.
- Ranging shot: a search (which a strategy can narrow) for the landing nearest
  the target, over the shell and any loaded gun, on the grid of angles 25-155
  and powers 20-98 in steps of 6: every other point of it (steps of 12), then
  the eight 6-step neighbours of the best. Guns that fly the same planning arc
  share one search: their flight key (`flightKey` in `src/sim.ts`,
  `room_flight_key` in `server/sim.php`) holds every field the planning flight
  reads (flat, speed, and a roller's friction and roll time), so a gun given
  its own arc is searched on its own, and the first gun of an arc in rack
  order keeps it. Then Gaussian wobble: wob = max(`wobFloor`, `wobStart` - `wobStep` x
  round), angle +-9 x wob, power +-12 x wob, doubled against a jammer's owner.
  Then a 35% chance to shuffle 8-35 px.
- Bracketing: each drone remembers its last shot (`brk` on the tank in a room,
  on the drone object solo: target index, angle, power, weapon, corrections so
  far `n`, target x and own x then, and `land`, the x where the volley first
  burst, filled in when it does). While the same target stands within
  `BRK_DRIFT` = 3 px of where it stood, the drone is within 1 px of where it
  fired from, and its gun is still loaded, the next shot is a correction: the
  sim's landing for the last aim is shifted by `correct` times the measured miss
  (`land` against the target's x; a burst within `BRK_ON` = 22 px, the hull,
  counts as on target and holds the aim), a search near the last aim (angle
  +-12 and power +-18 in steps of 6, then the 3-step and the 1-step neighbours
  of the best) finds the angle and power for that landing, and the wobble shrinks
  to wob x `brkShrink`^n, never below `brkFloor` (so a drone never locks into a
  bad aim). A bracketing drone does not shuffle.
- Restart: the target moved or died, the drone moved or its gun ran dry, or
  `brkMax` corrections went by, and the next shot is a fresh ranging shot
  with full wobble.

### Difficulty

How well the drones aim is one of three levels, one row each of `DIFFICULTY` in
`src/ai.ts`, mirrored by `ROOM_DIFFICULTY` in `server/ai.php` (the sim vectors
hold both to the same aim at every level):

| Level | `wobStart` | `wobStep` | `wobFloor` | `correct` | `brkShrink` | `brkFloor` | `brkMax` |
|---|---|---|---|---|---|---|---|
| `easy` | 5 | 0.3 | 2 | 0.5 | 0.6 | 0.8 | 5 |
| `normal` | 3.7 | 0.33 | 1.15 | 0.6 | 0.5 | 0.4 | 5 |
| `hard` | 0.85 | 0.12 | 0.25 | 1 | 0.65 | 0.2 | 5 |

- Solo: the Menu's Difficulty picker (Easy, Normal, Hard; Normal by default),
  saved in this browser as `tankity-difficulty`. A match reads it when it is
  dealt (`G.difficulty`), so a change waits for the next match.
- Rooms: the host's Menu setting rides on `action=create` (`difficulty`), is
  stored in the room for good (`$room['difficulty']`; joiners cannot change it)
  and is in every snapshot (`difficulty`), where the lobby shows it. Only the
  exact words count: anything else, and a room stored before the setting, is
  normal.
- Hit rates (`src/ai-measure.ts`: one drone with only the Shell bracketing a
  stationary player on 1000 seeded hills, wind and spots; a hit is any armor
  taken), percent on the ranging shot / after one correction / after two:

  | Level | Round 1 | Round 5 | Round 10 |
  |---|---|---|---|
  | `easy` | 9 / 11 / 16 | 10 / 14 / 19 | 17 / 22 / 28 |
  | `normal` | 10 / 17 / 26 | 15 / 27 / 42 | 27 / 40 / 54 |
  | `hard` | 34 / 51 / 65 | 74 / 81 / 81 | 74 / 84 / 82 |

  A shell landing anywhere on the field reaches the hull about one time in
  ten (the blast reaches 40 px each side), so normal's first round of
  ranging shots, and easy's, are close to that floor; easy is gentler mainly
  in how slowly it walks its shots in. `test/ai-hitrate.test.mjs` keeps normal
  within 5 points of 10/15/25% (ranging) and 25/40/55% (after two
  corrections), easy within 5 points of half of normal, and hard at or above
  normal.
- The memory is a few numbers per drone and rides in the room's JSON; the
  snapshot a client sees leaves it out.

## Drone strategies

Every drone is dealt one strategy at random when it spawns (round start for a
seat's first round, and when a bot takes over a departed player's seat), with
a stream seeded from the room's RNG and the seat in a room (so dealing never
shifts its shots) and the match RNG solo, so the same seed deals the same hands. A strategy keeps for the whole match (`room['tactic']` per seat
in a room, `G.tactics` per drone solo) and decides whom the drone targets and
how it aims; all of them bracket a standing target the same way.

| Strategy | Target | Aim |
|---|---|---|
| `hunter` | The target it picked (the nearest, at the time) until that one is wrecked; no random switching | As usual |
| `bully` | Always the nearest rival | As usual |
| `sniper` | The weakest rival (lowest hp, nearest on a tie) | Base wobble x`SNIPER_WOB` = 0.8 |
| `avenger` | Whoever last damaged it (`lastHitBy`); the nearest while nobody has, or when that unit is wrecked | As usual |
| `glory` | The leader: a human by match score, a drone by kills this round x`KILL_GLORY` = 300 | Only its strongest loaded gun (highest damage) |
| `lobber` | A random rival | Angles above `LOB_ANGLE` = 60 degrees first (flat ones only when no high arc lands within `LOB_OK` = 40 px), and area guns (buckshot, cluster, anything with blast radius 40 or more) when it has them |

- Flipping: each drone counts `dry`, its consecutive own turns that dealt no
  damage (to anyone but itself). From `DRY_FLIP` = 3 dry turns on, every
  further dry turn has a `FLIP_CHANCE` = 35% chance to switch to a different
  random strategy and reset `dry`. A turn that deals damage resets `dry`.
- The switch is announced: a room sends `{t:'tactic', seat, s}` ahead of the
  drone's `aifire`, solo logs the same line, and the radio log reads "WRAITH
  switches to sniper tactics."
- State per tank: `s`, `dry`, `dealt` (damage since its last turn),
  `lastHitBy` (index in the tanks array) and `kills`. It stays on the server
  (and on the solo drone objects); the snapshot carries only the `tactic`
  event. `dry`, `lastHitBy` and `kills` start over each round; `s` does not.
- The rules sit in `src/ai.ts` (`aiChoose`, `TACTICS`) and `server/ai.php`
  (`room_ai_choose`, `ROOM_TACTICS`) and are held together by the `ai-tactic`
  vectors.

## Source layout and build

The client is TypeScript in `src/`, bundled by the games kit (`../_kit`, see its
README) into three files in `dist/`, listed in `build.json`:

| Entry | Bundle | Format | What it is |
| ----- | ------ | ------ | ---------- |
| `src/main.ts` | `dist/main.js` | ES module | The game; `index.html` loads it with `<script type="module">` |
| `src/fx/engine.ts` | `dist/fx.js` | classic script | The effects engine; sets `window.TankityFX` exactly once, and loads first (`defer`) |
| `src/fx/editor.ts` | `dist/fx-editor.js` | classic script | The dev-only effects editor; sets `window.fxEditor` |

Preact is bundled into `dist/main.js`. Modules never import in a cycle: `ai.ts` imports `sim.ts`, so `brkLand`, which a blast calls, stays in the sim.

```
cd .. && npm ci                            # once, in games/: TypeScript, esbuild, Preact
node _kit/build/build.mjs tankity          # type-check src/ and write dist/
node _kit/build/build.mjs tankity --check  # fail if dist/ is stale, missing or has extra files
php tools/install-files.php                # after a rebuild: ?v= cache-busters and sw.js
```

- `dist/` is generated and committed, like `game.json` and `sw.js`: edit
  `src/`, rebuild, commit both. `make test` runs `npm ci` in `games/` and the
  `--check`, and `deploy.sh` refuses a stale `dist/`. Rerun
  `php tools/install-files.php` after a rebuild: it writes the `?v=` hash of
  `dist/main.js`, `dist/fx.js` and `game.css` into `index.html` and precaches
  `dist/` (not the editor) in `sw.js`, versioning the cache by content.
- Three programs are type-checked (`build.json`). `tsconfig.json` extends the
  kit's base (strict, `noUncheckedIndexedAccess`, `erasableSyntaxOnly`, imports
  written with their `.ts`/`.tsx` extension) and lists the DOM-free modules (the
  sim, the AI, the room client, the input, the firing range, the replay and the
  flow), which compile without DOM types, so they cannot reach for the page.
  `src/tsconfig.dom.json` adds the DOM lib for the modules that need WebAudio,
  `fetch`, timers, canvas and the document (`audio.ts`, `render.ts`, the three
  entries, the modules `main.ts` wires, which reach the page through the `$` it
  hands them, and the overlays in `ui/`). `src/tsconfig.check.json` type-checks
  the protocol fixtures and emits nothing. Each is its own program, so adding
  the DOM lib for the audio never lets the sim see `document`. A module that
  holds only types (`protocol.ts`, `fx/types.ts`) adds nothing to a bundle.
- **Cache-busting.** Because every module is inside a bundle, only three
  files carry a `?v=`: `dist/main.js`, `dist/fx.js` and `game.css` in
  `index.html`, each the first 10 hex characters of the file's SHA-256, written
  by `tools/install-files.php`. Versions are functions of content, so two
  branches that touch different files do not conflict over them.
- **`window.TankityFX`.** `dist/fx.js` assigns `window.TankityFX = api` once.
  The browser specs record that assignment, so keep it a single plain
  assignment of the whole API.
- **How the modules get the game.** `main.ts` owns the state (`G`, the room
  client `net`, `MATCH`, the arsenal tables) and each of `match`, `room`,
  `lobby`, `shop`, `guns`, `chatter`, `effects`, `hud`, `view`, `tutorial`,
  `scores` and `menu` is a factory, `createX(deps)`, that returns the functions
  `main.ts` calls. `deps` is a typed object (the module exports its interface)
  naming everything the module takes from the page and from the rest of the
  game: a slice of the state (`Pick<GameState, ...>` from `src/game-types.ts`),
  the room client, the sound, the page's `$`, and the other modules' functions.
  A module reaches for no global of the game's, so what it can touch is what its
  `deps` lists. The arsenal changes when `game.json` arrives, so modules read it
  through the `tables` getters (`tables.weapons`, `tables.order`, ...), never
  from a copy. `main.ts` wires the factories in dependency order; a dependency
  on a module wired further down is passed as an arrow (`openShop: () =>
  openShop()`), which resolves when it is called. What a module keeps for itself
  (the log's lines, the coach's step, the gun cursor) stays in its closure, and
  the rest of the game asks through the object it returns (`isActive`, `cursorAt`).
- **Preact overlays.** The panels that are mostly markup are Preact components
  in `src/ui/`, drawn into the elements `index.html` keeps (`#help-overlay`,
  `#shop-veil`, marked `data-ui`). Preact is a pinned dependency of `games/package.json`, bundled into
  `dist/main.js`, so the game stays self-contained and works offline. To
  upgrade: change the version in `games/package.json`, run `npm install` in
  `games/`, then rebuild and run `php tools/install-files.php`. The rules for a component: props in, DOM and
  callbacks out. The module that owns an overlay (`shop.ts` for the shop,
  `lobby.ts` for the lobby, and so on) builds a finished view of the state (the shop's
  rows, the cash line, the start button's label) and hands it in with the
  callbacks (`onBuy`, `onPreview`, `onNext`, `onLeave`, `onClose`, and so on); the
  component never reaches into game state or the page, and keeps local state
  only for the UI itself. Components keep the ids and classes `game.css` and
  the browser specs use. Key labels come from the `keyHint` prop through
  `KeyHints` context (`Key` in `chrome.tsx`), so a remapped `game.json` rewrites
  them; the document-wide `renderKeyHints` pass skips anything under
  `[data-ui]`. Touch screens hide `.key` caps and `.keys-only` text centrally in
  `game.css`, so components still emit them. Each overlay module exports a
  `render*(container, props)` that the module owning its state calls on every change: Preact diffs,
  so the DOM (scroll position, focus) persists between renders. Every panel
  and overlay is a component now: the help, the shop, the rooms lobby (`#lobby-veil`),
  the menu with its settings (`#menu-overlay`), the weapon picker, the scores,
  the tutorial coach, the radio log (each in its own `<section>`), the end-of-match
  veil (`#end-veil`), the leave-room question (`#leave-veil`) and the status
  bar (`#hud-bar`). The modules keep the state of each (`LOBBY` in `lobby.ts`, `SCORES`, `HUD`, `END`,
  the log's lines, the gun cursor) and redraw; the text boxes whose content the
  player types (seed, initials, room code) stay uncontrolled inputs the
  component reads when its form is sent. The HUD is asked every frame, so
  `paintHud` redraws only when its text changed.
  A scrolled panel stays put: Preact updates rows in place, and where a row can
  change height the browser's scroll anchoring can nudge the list on Linux
  fonts even though it does not on macOS. `useScrollKeep` (`chrome.tsx`)
  remembers the player's scroll and restores it after any redraw that does not
  itself move a cursor (the weapon picker scrolls its cursor into view and the
  radio log follows its newest line; those take the new place). A closed panel
  forgets its scroll, since the browser reopens it at the top. The shop does the
  same with its selection. A key that scrolls a panel (`scrollOverlay`) sends
  the scroll event itself, because a script's `scrollTop` change is reported
  only on the next frame.
- The Roller (`effect: roller`) is a shell that does not burst where it lands:
  it flies like a Shell, and touching down it rolls the ground (wind no longer
  touches it) and bursts when it reaches a unit, comes to rest in a dip, runs
  off the board, or has rolled `rollTime` seconds. A roller that meets a unit
  while still airborne bursts as a direct hit, as a shell does. Rolling is 1D
  along the terrain: it starts at 70 % of its speed along the ground, downhill
  pulls it on (`GRAV` along the slope), `friction` (a share of its speed per
  second, a game.yaml field) and a constant 10 px/s^2 drag slow it, and it
  stops once it is slower than 12 px/s on ground that pulls it by less than
  20 px/s^2. The ball rides 3 px above the ground (a linear blend between
  columns) and a unit counts as touched when the ball is within the width of
  its hit box at any height, so it also reaches a drone hovering above it (the
  owner-clear rule is the shell's). Its burst is a normal blast at the ground
  under the ball, direct on the unit it touched. `groundAt`, `groundSlope`,
  `rollStart`, `rollStep`, `rollHit` and `rollOut` in `sim.ts` and their
  `room_*` twins in `rooms.php` are the rolling; the room replay needs
  nothing extra, because the rolling is just more points on the shot's path
  (a point every `PATH_HZ`, and the shot's `t1` is the flight plus the roll).
  The drones' aim predicts a roller's landing with `rollOut`: where it comes to
  rest (ignoring units, which the predictor never sees). The renderer draws a
  `painter: ball` shell as a ball with a stripe that turns as the ball travels.
- The sim takes its state as arguments (`World`, `Arsenal`) and reports what
  happened as data: `explode` returns the blast (each unit's shield, wound or
  wreck, a last stand's nested blast), `stepShells` returns the frame's trails,
  splits, pierces and blasts. `match.ts` plays them as sound, particles and chat.
- `audio.ts` is a handful of exports and keeps its state to itself: `initAudio`
  installs game.json's audio section, `sfx.play(name)` (plus `sfx.turnPing()` and
  `sfx.clockWarn()`) voices an event, `music.start/stop/next/playTheme/forRound/
  leaveTheme` drive the soundtrack, `music.watchdog()` runs every frame,
  `music.onTrackStart(cb)` reports the track that begins (`main.ts` shows it as
  a log line), `noteGesture` and `unlock` wake the speakers, and
  `setSoundMuted`/`setMusicMuted` (with `isSoundMuted`/`isMusicMuted`) are the
  toggles.
- `net.ts` exports `RoomClient`, built with a `RoomEnv` (fetch, timers, a
  clock, the leave beacon: `main.ts` passes the page's) and `RoomHandlers`
  (`onSnapshot(room, fresh, first)`, `onReachable`, `onReadyChange`,
  `onError`). The client owns the session (`code`, `seat`, `token`, `csrf`,
  the event cursor `since`, the hills held and their `terrainRev`),
  `post(action, body)` typed by `protocol.ts`, the
  match and lobby polls, `act`/`sendQuiet`/`setMenu`/`buy`/`setReady`/`leave`,
  and the clocks (`armClocks`, `turnClockLeft`, `clockWarnDue`). It counts the
  events past its cursor as seen and hands them over; `room.ts` queues the
  events in the replay and calls `shouldCatchUp` to decide when a hidden tab skips, and the
  HUD, the lobby and the shop keep what draws or animates. Because every environmental call is injected, `net.ts` is
  in the DOM-free program and `test/net.test.mjs` runs it against a fake server.
- `replay.ts` exports `createReplay(env)`, which returns the replay: `push(events)`
  queues a snapshot's events, `step(dt)` plays them (the volley on screen, then
  whatever is next in the queue), `idle()` says nothing is playing or waiting
  (`room.ts` adopts the pending room snapshot then, and only then), `flying()`
  gives the renderer the shells on screen with their velocities, `shooter()` the
  tank whose barrel is easing, `catchUp(waiting, seat)` applies `planCatchUp` and
  returns the events it dropped for `room.ts` to log, and `clear()` forgets it
  all. `ReplayEnv` is everything the replay causes: the tank for a seat, a
  weapon's effect kind, the log line for an event, `launch`, `blast`, `muzzle`,
  `special` and `trail`. `shellAt`/`shellVel` read a recorded path (points
  `PATH_HZ` = 12 a second apart). `test/replay.test.mjs` steps the recorded volleys of
  `protocol/play-after-fire.json` and checks every shell against its path.
- `preview.ts` exports `createPreview(wkey, env, fx, canvas)` (null for an unknown
  weapon), `stepPreview(pv, dt, env)` and the solver. The state it returns is a
  plain `PreviewState` that `main.ts` keeps as `G.preview` and the renderer
  draws; `PreviewEnv` supplies the weapon table, the effect hooks and the result
  line. `test/preview.test.mjs` steps it on frames the test counts.
- `flow.ts` exports `transition(phase, event)`, the `FLOW` table behind it and the `Phase` and
  `FlowEvent` types. `match.ts` wraps it in `advance(event)`, which stores the next phase in
  `G.phase` (the same strings the e2e specs read) or, for a move the table rejects, leaves the
  phase alone and warns on the console. `test/flow.test.mjs` walks the table.
- `render.ts` exports `createRenderer(canvas, deps)`, which returns
  `{ frame(view) }`, and `drawChassis` (the unit picker draws its small bodies
  with the battlefield's painter). `deps` (`RenderDeps`) is everything it
  borrows: the effects engine as a typed slice of `window.TankityFX` (`FxApi`),
  the sim helpers it shares with `view.ts` (it imports nothing at run time, so
  they arrive as arguments), a weapon's paint job, the reduced-motion setting
  and the random source for screen shake. `view` (`BattleView`) is a read-only
  snapshot: the camera, terrain, tanks, shells, blast discs, sparks, wind, text
  scale, and the decisions made elsewhere (whose turn marker shows, the aim arm
  and its length, the clock count-down, the replay's shells, the firing range).
  Rendering reads and draws; whatever advances lives in the update step
  (`decayFx` in `match.ts` ages the blast discs and shake, `trackMotion` in `view.ts` notes which ground
  units moved), and `battleView()` in `view.ts` just assembles the snapshot. The sky is built
  from the match key and cached inside the renderer. `test/render.test.mjs` paints a
  deep-frozen view, so a frame that wrote to the game state would throw.

- `input.ts` maps physical keys and touches to named commands, and `main.ts`
  says what each command does. The commands are the action names of
  `game.json`'s `keys` section (`barrelLeft`, `fire`, `guns`, `lineDown`, ...),
  so rebinding a key in `game.yaml` changes nothing in either file. `createInput({ touch })`
  returns the input: `register(commands, context)` takes a `CommandTable` (a
  handler per command) and an `InputContext` (`shopLive`, `modalOpen`/`modalBack`,
  `onHold`); `bind(window)` listens (no key listeners on a touch-only screen, but
  blur still drops the held keys); `bindHold(button, command)` makes an
  on-screen pad button hold a command while the pointer is down; `held` is the
  set of held aim and drive commands; `lookup`, `hint` and `setKeys` serve the
  key table (Shift+ and Ctrl+ tokens win while that modifier is held, then
  `event.code`, then `event.key`). A handler returns `true` when it used the key
  (input then calls `preventDefault`), `'quiet'` when it used the key and the
  browser's default should stand, and nothing when the command does not apply
  here, so the key falls through. One keydown is offered in this order: the
  scroll commands (`lineDown/Up`, `pageDown/Up`, `halfDown/Up`), the gun
  grid's fixed keys (`gridLeft/Right/Up/Down`, `confirm`, `digit`: arrows,
  Enter or Space, 1-9, never rebound), the shop commands (only while
  `shopLive`), the global `back` (Q), the held aim keys (always suppressed, so
  the arrows never scroll the page), `fire` (suppressed, once per press), then
  the other global commands (once per press). A question that holds the keys
  (`modalOpen`) lets only Q through. An editable text box keeps every key, Q
  included; a read-only field (the invite link) keeps every key but Q, which
  still goes back. Only plain Q is back: Ctrl+Q, Alt+Q and Cmd+Q are the
  browser's, and a held Q goes back once, not on every auto-repeat. Esc is
  bound to nothing. `stepArm(held, dt, arm, facing)` is one frame of held-key
  arm movement at 42 degrees per second for the barrel and 45 power per second,
  clamped to 10-170 and 10-100, reporting whether a key is
  adjusting and whether none is down (the room client sends the aim when the
  keys are released). Driving stays in `main.ts` because it depends on terrain
  and fuel. `touchOnly(matchMedia)` is the one test for a touch-only screen;
  `main.ts` keeps its result as `TOUCH`, which hides key hints (`.touch .key`)
  and rewrites prose, so there is one source of truth. What stays in
  `main.ts`: `bindKeys`, which says what each command does by calling into the shop, the weapon picker and the other
  modules, scrolling a panel, the key hint text, and the capture-phase
  keydown that wakes audio. The module touches no page API, so `test/input.test.mjs`
  drives it with plain event objects.

## Tests

| Command                                        | Covers                                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `node ../_kit/build/build.mjs tankity --check` | `dist/` is exactly what `src/` bundles to, `src/` type-checks, and every `protocol/*.json` fits its type in `protocol.ts` (run `npm ci` in `games/` first) |
| `node --test 'test/*.test.mjs'`                | Every Node test below, run by `test.sh` (the UI test bundles `src/ui/*.tsx` once with esbuild, Preact left external) |
| `test/standings.test.mjs`                      | `src/standings.ts`: the match-end rule against the `match-end` vectors, room and solo rows, the winner's bonus line, the filed and saved lines (online, local, a one-human room's), and what Q does on each end card |
| `test/standings-ui.test.mjs`                   | The scoreboard table (`src/ui/standings.tsx`): a room's rows, you, the crown, the lost-out marks, and a solo run's rounds with the total |
| `test/scores-ui.test.mjs`                      | The scores overlay (`src/ui/scores.tsx`): both lists, the player's own runs marked, the empty and blocked-storage lines, the switcher, and the data in `src/scores.ts`: the online list latest-load-wins, this browser's rows, a redraw when another tab saves |
| `test/local-board.test.mjs` | `src/local-board.ts`: the best 20 per difficulty, order and ties, place or null, a ref saved once, a damaged value read as empty, blocked storage kept nothing, and the move of `tankity-local` rows (difficulty-less rows to Normal, the old key removed only after the write, unparseable left alone, a second run a no-op) |
| `test/match-local.test.mjs` | A solo match played to its end saves once on this browser's board under the difficulty it was dealt, and the end card says where it went |
| `test/shop.test.mjs` | `src/shop.ts`: a solo visit buys as often as the chest allows, and a room's Repair asks `netBuy` for what the hull takes |
| `test/ui.test.mjs`                             | The Preact overlays (`src/ui/`) rendered with sample props into the stub DOM: ids and classes, the title bar, every shop row, the Ready toggle, the lobby's forms, map tiles and seat grid, the menu's pickers and toggles, the weapon tiles, the log, the tutorial and the status bar, the key labels, that clicks and submits reach the callbacks, and that a redraw keeps the scroll |
| `test/smoke.test.mjs`                          | The shipped bundles (`dist/fx.js`, then `dist/main.js`) in a stub DOM, driven by the `game.json` key table and the `protocol/` fixtures; also checks the page loads exactly those two scripts with no import map and that the bundle has no bare imports, every weapon has muzzle, trail and impact effects, that the `effects:` block of `game.yaml` is exactly what the editor exports, and that the particle pool caps; a solo player who wrecks their own tank sees the drones fight on to one and the lost round open the shop |
| `test/ai-hitrate.test.mjs`                     | The drones' measured hit rates per difficulty against the targets (see Difficulty), the table's shape, hard being the sharpest aim (its exact constants), unknown levels aiming at normal, and the saved setting's default and form. The harness is seeded, so it never flakes, but one cell runs close: at 1440 wide, round 10, easy's ranging shot (17.2%) is 0.33 points inside its band (half of normal's ±5). A later aim or weapon change can fail this test on that easy cell rather than on what it changed; read the failure for that before blaming the change |
| `test/ai-arcs.test.mjs`                        | Guns share a drone's aim search only when their flight key matches: every field of every gun is changed (a string field to a value no gun holds), and any change that bends a planning flight must change the key; every gun field `simShot` reads, traced as it reads it, must be one `flightKey` reads; a gun given its own speed, flat flight or roll is searched on its own (`test/php/AiArcsTest.php` is the same for the server) |
| `test/ai-search.test.mjs`                      | The planning flights one drone turn costs, counted as `simShot` flies them (not as `aiChoose` looks guns up): a coarse grid and the fine neighbours of its best per distinct arc, a lobber's high arcs, and a bracket correction's three grids |
| `test/prefs-legacy.test.mjs`                   | The saved settings (`tankity-body`, `tankity-text`, `tankity-tutorial`) read back through the kit's prefs exactly as the code before it wrote them, and the `tankity-local` and `tankity-scores-local` values |
| `test/audio.test.mjs`                          | `src/audio.ts` imports without a browser; the loop-point trim and the round-to-track mapping are right |
| `test/field.test.mjs`                          | The width from the landscape box (clamps, columns, portrait equals landscape), that a deal holds through a resize, fitting the field in a box, and the power step and display at 720, 1080 and 1440 |
| `test/detmath.test.mjs`                        | `src/detmath.ts` is within 1e-15 of `Math` where the sim feeds it, keeps the sign of zero, and is exact at 0, 1 and the right angles |
| `test/solo.test.mjs`                           | `src/solo.ts` without a page: the deal and its width, a round's muster, settling a volley, the turn order, the drones' difficulty and 1-ups |
| `test/fall.test.mjs`                           | Falls in `src/sim.ts`: the damage formula, credit to the digger (score, cash, kills, the last hit) and none for your own pit, parachutes over and under the threshold, the drones' own, the bunker and the shield, landing on a unit, a stack landing bottom up, the drawn height following the ground at once while the rules wait for the settle, a settled fall playing out from where it was drawn, a parachute armed then opened only as its unit drops (never at rest), a solo volley arming one, a unit dug out by an early pellet seen falling mid-volley, a fall wreck seen to land before its words and wreck show, the same shot costing the same armor as a solo volley and as a room's (Buckshot bursts, fractional ground, parachutes), the bunker counting toward the parachute, credit to the deepest blast, the drones' parachutes by round and the stacking shop row |
| `test/fixed-step.test.mjs` | The solo war runs in fixed steps whatever the frame lengths, tank falls included, so play is the same on a 30 Hz phone and a 144 Hz monitor |
| `test/determinism.test.mjs` | The rule modules call no clock, no `Math.random` and no libm trigonometry, so the shared sim stays bit-exact across the two languages (see Deterministic math) |
| `test/wide-field.test.mjs`                     | The sim at any width: the same hills continued, units spread outside each other's blast, reach and wind scaling, flights that last as long as the field, 720 unchanged |
| `test/ghosts.test.mjs`                         | A shell retired past the edge keeps flying (draw only), one that burst inside leaves no ghost, a replay's last point keeps its velocity, ghosts are dropped off the picture |
| `test/scenery.test.mjs`                        | The scenery continues the hills with no step over 1 px at the seam, cratered or not |
| `test/rotate-hint.test.mjs`                    | The rotate hint's rule and its chip |
| `test/php/AiArcsTest.php`                      | `server/ai.php` `room_ai_arc_guns` and `server/sim.php` `room_flight_key`: a flight by definition is the shot by key, guns with one key fly the same arcs, any field change that bends a flight changes the key, the key is exact whatever `serialize_precision` says and refuses a speed, friction or roll time that is not finite, and a gun given its own arc is searched on its own |
| `test/php/DetMathTest.php`                     | `server/detmath.php` is within 1e-15 of libm, rounds halves and keeps the sign of zero like `Math.round`, and the `detmath` vectors cover every function |
| `test/php/FieldWidthTest.php`                  | The server's width rule, hills, reach and aim, units spread outside each other's blast, and a room dealt at 720 |
| `test/php/RoomSnapshotLeakTest.php`            | A room snapshot carries no seed, generator state, seat token or server path |
| `test/render.test.mjs`                         | `src/render.ts` paints a deep-frozen view on a stub canvas (so it cannot write to the game state), draws the firing range on its own canvas, skips quietly with no 2D context, rebuilds the sky only when the match key or the visible area changes, and draws an open parachute from its sheet (opening once, then swaying) or as a drawn canopy until the sheet loads, none over an armed or settled unit at rest, and units at their drawn height (a falling wreck whole) |
| `test/input.test.mjs`                          | `src/input.ts` with plain events: token lookup (code, key, Shift+, Ctrl+), the shipped bindings, command routing and fall-through, Q, the leave question, held keys and blur, the hold buttons, and the arm's rate on a fake clock |
| `test/net.test.mjs`                            | `src/net.ts` against a fake server and timers: the 429 retry (none for a create or join's 429, one for its 503), Ready's ordering under rapid toggles, polling, the leave beacon (Leave only), resume, detach and `mine`, the clocks and `closesIn`, the hidden-tab catch-up plan, delta snapshots (the rev it sends, hills kept when omitted, full on an unknown rev, a resync, a hidden-tab return or a reconnect) |
| `test/seats.test.mjs`                          | `src/seats.ts`: round trip, newest first, the 12-seat cap, a malformed entry dropped alone, storage that refuses writes |
| `test/games.test.mjs`                          | `src/games.ts` with fake timers: what it asks, gone rooms forgotten, one report per turn key, never the room on screen or one another tab shows, the step-out hush |
| `test/notify.test.mjs`                         | `src/notify.ts` against a stubbed Notification: missing, promise and callback permission, the opt-in setting, the notification's tag and click |
| `test/toasts.test.mjs`                         | `src/toasts.ts`: one per room, the newest three, the countdown starting only on a visible page |
| `test/on-screen.test.mjs`                      | `src/on-screen.ts` over a fake BroadcastChannel and over shared storage with storage events; stale tabs forgotten |
| `test/turn-time.test.mjs`                      | `src/turn-time.ts` and the slider: the stops equal `server/settings.php`'s, labels, clock text, the status bar and shop notes, the settle delay |
| `test/games-ui.test.mjs`                       | Your games, the toasts and the title card's list |
| `test/lobby.test.mjs`                          | `src/lobby.ts` on a real room client over a fake server: a refusal stays on the status line through polls, a lobby closed with Q keeps polling, a swept room lands back in the lobby with its line |
| `test/replay.test.mjs`                         | `src/replay.ts` on the recorded `protocol/` volleys with a recording host: shell positions against the path points at fixed times, blasts and hits on time, aim easing, the catch-up plan with the kept volley at 3x, a `watch` volley at 3x for that volley only, and a parachute armed by its volley's `fall` event, closed through real frames on unbroken ground and open every frame its unit falls once the pit is carved |
| `test/preview.test.mjs`                        | `src/preview.ts` on a fake clock with the real arsenal: the aim, fly, show and aim phases, each gun's first volley, cluster, pierce and pellet behaviour, and the resets |
| `test/flow.test.mjs`                           | `src/flow.ts`: every legal transition, every other event/phase pair rejected, and a scripted match from the demo through shop, turns, a won round, a lost round that goes through the shop, the match-over phase, and the 3x watch speed on a fake clock |
| `test/protocol.test.mjs`                       | `src/protocol.ts` against the server: the check program type-checks, and the literal unions (phases, seat modes, event `t`) read out of the types are compared with the fixtures, with the phases, event types and POST actions `rooms.php` spells out, and with the events the client handles (`src/**/*.ts`) |
| `test/sim-vectors.test.mjs`                    | `src/sim.ts`, `src/ai.ts` and `src/armor.ts` agree with `rooms.php` on every shared sim vector; the detmath, field, armor and match-end cases compare exactly (see Sim vectors) |
| `phpunit --testsuite tankity` (host PHP)       | `ConfigTest` (`.config.yaml` precedence), `DataDirTest`, `DbTest`, `RoomStoreTest` and `HousekeepTest` (storage: the directory and its checks, the database and its journal, the v4 to v5 upgrade that leaves only room rows, rooms as rows, cleanup on a fake clock), `GameJsonTest` (the YAML parser, the `game.yaml` schema including effects, `--check` staleness) and `RoomsSimTest` (server sim units: pierce, spawns, spacing, replay stamping; drone bracketing and strategies; one unit left standing ends a round, the one-turn-per-poll drone pacing and the event buffer; `room_snapshot` shapes against `protocol/`; the Roller) |
| `RoomMatchEndTest` (host PHP) | The match-end rule: one human plays like solo, the last human standing wins twice the round bonus, a leave is a forfeit, two out at once, the watch cap |
| `RoomStandingsTest` (host PHP) | Each human's rounds won, kills, round gain and out round, in the snapshot with the winner's bonus |
| `RoomFilingTest` (host PHP) | A match two or more humans started files each human once on its Difficulty's board, the winner before the eliminated, a leaver not at all but the winner of a forfeit still; a match one human started files nothing and marks `filedLocal`; a failed filing logged and read as not filed |
| `RoomAgainTest` (host PHP) | Play again keeps code and seats and resets lives, score and cash; a second press is harmless; the lowest human hosts when the host left |
| `BoardTest`, `ScoresEndpointTest` (host PHP) | The boards (one per difficulty, room rows only, ties, the trim, a required source), and `scores.php` as a request (the board in the page's shape, no seeds, every POST answered 410 and nothing written, other methods 405) |
| `RoomGuardTest` (host PHP) | Initials stored uppercase and the blocked set refused, origins and referers against the allow list, and the hourly allowance on creating and joining: a setting, exact in every sliding hour, per address, in the `rate` table, swept by housekeeping, a spent one refused without the write lock, a 429 from `rooms.php` itself, and a create refused for a full server not charged |
| `RoomArmorTest`, `RoomBuyTest` (host PHP) | Armor carry-over and re-muster, the capped repair, plates, and every shop purchase rule |
| `RoomFallTest` (host PHP) | The room's falls: the formula, the digger's credit and kill, your own pit, parachutes (spent, kept, a drone's), the bunker and the shield, landing on a unit, a volley ending with its falls settled and stamped, drones' parachutes by round, the stacking shop row in the snapshot, the bunker counting toward the parachute, credit to the deepest blast, and a rise folding a parachute |
| `phpunit --testsuite tankity-docker`           | `RoomsTest` (the room shelf over its own `php -S`), `RoomsStoreTest` (the store under real concurrency: exact cap under a race, close, sweep, a held writer and the 503, a killed holder), `RoomsRefusedStoreTest` (a store PHP refuses answers JSON 503 on every endpoint, with one log line per request), `RoomsStoreFailureTest` (a database error partway through a save answers JSON 503 and leaves nothing behind) and `RoomsLoadTest` (8 playing rooms, each with 3 seated players and a watcher, polling at the client's pace against the docker site: no 503, p95 under 300 ms). Runs inside the PHP container, which matches the host's PHP (`make test` does) |
| `php protocol/generate.php --check`            | `protocol/` fixtures are current (run inside the PHP container)                 |
| `tests/tankity-data-deny.sh` | `games/tankity/data/` is refused over HTTP (`make test` runs it) |
| `php protocol/sim-vectors.php --check`         | `protocol/sim-vectors.json` is current (docker PHP)                                         |
| `curl <site>/games/tankity/rooms-web-test.php` | Rooms over real HTTP (local docker only; never deployed)                                   |
| `make e2e` (site root)                         | Real-browser checks, solo and two-player, audio, weapon effects (`tankity-fx-battle`, `tankity-fx-range`, and `tankity-fx-editor`, which runs on a local site only), and the end of a match (`tankity-end`: a lost solo match is saved on this browser's board, shows under "This browser" in Scores and sends nothing to the score server; `tankity-end-again`: Play again in a room; `tankity-end-forfeit`: a leave, the winner filed online, and the solo card after it saved locally; `tankity-end-out`: the you're-out card and Menu → Standings), and long games (`tankity-rooms-long`: the room link brings a closed tab back, Step out and Your games, the turn toast and Go, a lobby closed with Q listed, the turn time reaching everyone). Each player context gives up its stored seats when a spec closes it (`tests/e2e/helpers.mjs`); `E2E_BASE_URL` points it at the live site |
| `make e2e-changed` (site root) | Only the browser specs your changes need (`tests/e2e/select.mjs` maps touched files to specs; CI uses the same map) |

`make test` from the site root runs every suite above except e2e. CI runs
`make test` as `units` and `make e2e` as `e2e` on every pull request. Deploys
skip `test/`, `README.md` files, `protocol/`, the effects editor and the Blender script.

## Protocol fixtures

`protocol/*.json` are real room-server replies, one file per moment:
`lobby-host`, `lobby-public`, `play-my-turn`, `play-after-fire` (fire, shot and
hit events, then the drone's answer), `play-after-fire-delta` (the same moment
for a poll that holds the current hills: no `terrain`), `play-resync` (a stale
`since`: full, `resync: true`), `shop-after-win`, `shop-ready` (the shop
with one of two humans readied), `create-reply`, `join-reply`, `error-too-fast` (429) and `error-not-your-turn` (409). Each file
is `{about, status, body}`.
`sim-vectors.json` in the same folder is not one of them (see Sim vectors).

- `protocol/generate.php` writes them. Snapshots are built in process with
  `rooms.php`'s own functions on a fixed room code and seeds
  (`protocol/scenarios.php`); the create and join replies and the two errors
  come from `rooms.php` served by a throwaway `php -S` with a private
  data directory, with codes and tokens replaced by fixed placeholders.
- Regenerate from the site folder (`websites/www.cs`) with the site running:
  `make protocol`. Commit the result. `make test` runs
  `php protocol/generate.php --check`, which fails when any fixture differs.
- `src/protocol.ts` types the wire: `RoomSnapshot` (phase, seats with `ready`,
  tanks, optional `terrain` with `terrainRev`, `resync`, `turnLeft`, `shopLeft`, `events`, the private `you` and
  `csrf`), `RoomEvent` (a union discriminated by `t`, written from every event
  `rooms.php` emits), the replies (`SeatReply`, `RoomReply`, `ErrorReply`, ...)
  and `PostBodies`/`PostReplies`, which type `RoomClient.post`.
  `src/protocol-fixtures.check.ts` imports every fixture and assigns it to its
  type; `node ../_kit/build/build.mjs tankity --check` (so `make test`) fails with the
  offending fixture and key when a fixture holds a field the types lack, lacks
  one they need, or changes a type. A JSON import types strings as `string`,
  so `test/protocol.test.mjs` checks the literal values (phase, seat mode, event
  `t`). Add a fixture to the `fixturesFit` list when `generate.php` gains one.
  `rooms.php` stores a `join` event without a `seq`, which no snapshot ever
  carries; it has no member in the union.
- `test/php/checks/rooms-sim.php` compares the keys and types of today's `room_snapshot`
  output with each fixture, on any PHP.
- `test/smoke.test.mjs` checks that every hand-written snapshot its fake server
  sends has the fixtures' keys and types, then serves the fixtures themselves
  to the client: lobby, start, a fired turn replayed, the shop, a 429 and a
  409. A server change the client does not handle fails there.
- The fixtures are not precached by the service worker (only top-level
  static files, `fx/sprites/` and `dist/` are) and are not deployed.

## Sim vectors

The game's math runs twice: in `src/sim.ts` (solo, demo, the client's own
shell flight and the room aim preview) and in `rooms.php` (the authoritative
room server). `protocol/sim-vectors.json`
keeps the two honest: `protocol/sim-vectors.php` calls `rooms.php`'s real
functions over a spread of cases and writes each case's inputs and expected
outputs; `test/sim-vectors.test.mjs` replays every case through the sim,
`src/sim.ts`, the drone AI, `src/ai.ts`, and the armor rules, `src/armor.ts`; the sim and AI
compare within 1e-4; the deterministic math (`detmath`), the field at each
width (terrain heights included), armor and match-end cases compare exactly,
with -0 equal to 0 only where a case says so.

- Covered: the RNG and terrain generator, spawn spots, shot speed, muzzle,
  gravity and wind, hit boxes, the swept hit test (owner-clear rule, lance
  skip), seeker steering, the cluster fan, blast damage and craters (shield,
  bunker, EMP, last stand, kill bonus), landing prediction, where a roller's
  roll ends, whole volleys for every weapon in `game.json` (and a roller down
  into a valley, into a unit, back onto its gunner, off either edge and
  stopping on a rise, and cluster bomblets bursting at once in a ledge), the
  drone's aim, sequences of drone shots that bracket a target in (and
  re-range when it drives off, keep a lance's first burst, and shrink to the
  wobble floor of a wide field), the aim and a bracket at each
  difficulty (and an unknown word aiming at normal), each drone strategy's choice of
  target, gun and arc and a flip after a dry spell, tank settling, and falls
  (the damage at and past the free drop, credit to the digger and none for
  your own pit, parachutes and their threshold, the bunker, landing on a
  unit, a stack, a wreck's last stand, and craters each weapon digs beside a
  drone). Volleys and brackets end with the falls settled; the browser plays
  each volley as a solo match does (falls animated every frame, one settle
  once the last shell is down), including Buckshot pits dug in bursts and
  craters in fractional ground.
- Shared rules the cases pin: only a kill the player's own shot made pays the
  300 bonus, and a volley's projectiles (buckshot pellets, cluster bomblets)
  burst in launch order, each against the ground the earlier ones left. The
  browser still flies a volley's shells together; a shell that reaches the
  ground or a unit while an earlier one is in the air holds there until that
  one has burst.
- Not covered: pacing. The browser steps its war in fixed 1/60 s steps; the
  cases use 1/60 s for both.
- Regenerate from the site folder with `make sim-vectors` (in the docker
  PHP, the same build as the server, so float output never varies by host) after any change to `rooms.php`'s sim or to `game.yaml`'s arsenal,
  and commit the result. `make test` runs the generator's `--check` and the
  replay.
- A failing case prints its name, inputs, expected and actual values. Expected
  comes from the server, so the browser disagrees with it: fix whichever side
  is wrong, then regenerate. A stale `--check` only means the file was not
  regenerated.
- A case with a `known` reason is a difference the two sides have on purpose;
  the replay lists it and does not fail. The replay does fail when a known
  case starts to agree, so the reason is removed with the difference.
- The replay imports `src/sim.ts` and passes each case its own plain state
  object; nothing is stubbed, because the sim has no side effects to stub.

## Deterministic math

The browser's sim, drone AI and armor rules (`src/sim.ts`, `ai.ts`, `armor.ts`)
and the room server's (`server/sim.php`, `ai.php`, `rules.php`) compute the
same numbers to the last bit, so the browser's aim preview and the drones' search
agree with what the server then plays:

- the drones aim from one table per difficulty (`DIFFICULTY` in `src/ai.ts`,
  `ROOM_DIFFICULTY` in `server/ai.php`, the same numbers);
- no `Math.hypot`/`hypot()`, powers or other last-bit-sensitive helpers in the
  rule modules: distances are `dist()`/`room_dist()`, whole powers are
  `powi()`/`room_powi()`, hit boxes multiply, and degrees go through `rad()`
  in PHP `deg2rad`'s order;
- a seeker within 1 px of its target does not steer, a cluster's bomblets may
  burst on the ground at once, and a drone's bracket learns where a lance
  first burst, on both sides;
- `sin`, `cos` and `atan2` come from `src/detmath.ts` / `server/detmath.php`:
  fdlibm's polynomials built only from `+ − × ÷` and `floor`, so both sides
  compute the same bits whatever the browser's or the host's libm does; the
  `detmath` vectors are compared without tolerance. Halves round toward +∞
  (`Math.round`, `det_round`). Rendering keeps `Math.*`.

`test/determinism.test.mjs` keeps the banned calls out; the sim vectors keep
the two sides agreeing.

## Weapon effects

Looks are data and the blast radius stays the sim's. The arsenal in `game.yaml` owns
`radius` (crater and damage); the `effects` section only decorates it: its
emitters size themselves from the radius `explode` hands them (`unit: "r"`),
the blast disc `drawBoom` paints is exactly that radius (drawn under the
effects), and `gfx.shake` is still the screen shake unless an effect sets its
own `screen.shake`.

`effects` is the last section of `game.yaml`, keyed by weapon key (every ammo
key, plus `laststand`, the wreck blast); the generator rejects a missing
weapon. Each entry has `body` (the shell: its glow `halo`, `alpha`,
`pulse`, `stretch`, and its rendered sprite `sprite`, a `p_*` sheet, with
`size`, `fps`, and `spin` or `roll`; the sprite turns to the heading unless
it spins or rolls, and the plain disc stands in until it loads) and three effects: `muzzle` (once, at the barrel), `trail` (every
frame in flight, emitters need a `rate`), `impact` (on detonation). `special`
holds named extras: `split` (cluster bloom), `steer` (seeker pulse), `pierce`
(lance through a tank), `arc` (EMP, over each tank it fries). An effect is
`emitters` (one `- { ... }` line each) and an optional `screen: { shake,
flash: { color, alpha, dur } }`. An emitter's fields and defaults are
`DEFAULTS` in `src/fx/engine.ts` (shape `dot | streak | ring | spark | smoke | sprite |
bolt | beam`, count or rate, delay, duration, life, speed, aim/angle/spread,
offset/edge, gravity, drag, wind, size over life, alpha keyframes, colour
ramp, `glow` = additive, sprite sheet/fps/anim/scale/anchor/align/tint); only non-default
fields are written. `game.yaml` documents each field with its range, and
`tools/game-json.php` checks them: unknown names, a trail emitter with no
`rate`, an emitter that emits nothing, a sprite with no sheet or a sheet
that does not exist, and out-of-range numbers (checked against the unit they
are written in). The generated `game.json` carries the section as plain JSON.
`main.ts` reads it from `game.json`, carries a baked Shell fallback for when
that does not arrive, and derives a plain effect from `gfx` for any weapon
the data does not describe. `unit: "r"` multiplies size, speed, offset and
length by the blast radius, so keep sizes in r small (a `dot` of size 1 is a
disc of radius r).

Engine (`src/fx/engine.ts`): one preallocated pool per canvas (battlefield 700 particles,
firing range 260, hard caps; a full pool recycles slots, and trails stop
feeding it past 80 % so a blast always has room), no allocation per frame (colour
ramps are cached lookup tables), additive particles drawn in a second pass.
`FX.play` (`muzzle`, `impact`, `special`, `trail`) is how a weapon's entry is
played; `main.ts` (battlefield, and the effects the firing range and the room replay ask for)
and the editor both go through it. Reduced motion (`prefers-reduced-motion`)
cuts counts and rates (x0.35, x0.4), shortens lives and drops the screen
flash; shake was already off. Sprite sheets load lazily from `fx/sprites/`:
the moon and the shell bodies at once, the rest one file at a time when the
page is idle (the sheets most blasts use first), and a gun's own sheets as
soon as it is bought or a round starts with it in the rack (`FX.preload`,
`fxPreload`), so a nuke's mushroom is ready before it lands. Each file is
decoded (`img.decode()`) before its sheets count as ready, so the first
frame drawn costs nothing. Until a sheet arrives, or if it never does, the
other emitters carry the effect. Sheets that share a file (the shells atlas)
share one image and its tinted copies.

Screen flashes: the full-screen flash ramps in over 80 ms and is never drawn
past 0.35, whatever an effect asks. Settings has a Screen flashes toggle
(`tankity-flashes` in this browser, on by default): off drops the flash and
the large bright layers (`FX.isBright`: additive dots, blobs and sprites sized
by the blast radius, three quarters of it or more). Reduced motion drops the
flash too.

Every impact is built in layers, each its own emitter so a weapon can drop or
retune any of them: a burn mark on the crater walls (`scorch`, on the edge of
a circle below the blast), the flash, the fireball (`blast`, a Blender volume
that cools into smoke), ground thrown up (`dirt`, standing on the point),
the shock ring, tumbling chunks (`debris` with `anim: random`, tinted earth
or metal), sparks and embers, and smoke that lingers and drifts with the wind
(`plume`, tinted). Energy weapons swap the fire for `flare`, `energy` or
`electric`; Flak bursts in the air (`flakburst`) and the nuke plays the
`nuke` mushroom sequence over its blast.

Regenerate the sheets (Blender 4.2+, `brew install --cask blender`), from
`fx/blender/` (`--only blast,nuke` re-renders just those; the script's header
lists every option):

    /Applications/Blender.app/Contents/MacOS/Blender -b -P render_fx.py -- --out ../sprites

`--only parachute` (any sheet names, comma separated) renders just those and
keeps the other entries of `sprites.json`.

The editor, `fx-editor.html` (open it from the local site: `make url`, then
`games/tankity/fx-editor.html`), edits the effects live: pick a weapon and
slot, edit every emitter field, add, duplicate, reorder, mute and remove
emitters, watch a looping shot (slow motion, reduced motion and a blast-radius
ring are toggles). It starts from the `effects` in `game.json`. Copy YAML (or
Download effects.yaml) exports the whole `effects:` block, which runs to the
end of `game.yaml`: paste it over the old block, then run
`php tools/game-json.php` and `php tools/install-files.php`. Unsaved edits are
kept in `localStorage` until Reload file re-reads `game.json`. `deploy.sh`
skips `games/*/fx-editor.*` (so `dist/fx-editor.js` too) and `games/*/fx/blender/*`, the service worker
precache leaves the editor out and includes `fx/sprites/`, and nginx denies the
Blender folder. The Blender scenes (`fx/blender/*.blend`) are the sources of the sheets and live in Git LFS.

## Night sky

Each match draws its own sky from the match key (the solo seed, or the room
code) through a generator of its own (`buildSky` in `main.ts`), so it never
touches the sim's random numbers and every client in a room sees the same
stars: about 290 square pixel stars in three sizes, varied brightness and a few
warm or cool tints, a slanted milky band with a faint glow, a few clusters, a
quiet twinkle on some (none under reduced motion), and the moon in one of
seven phases from `fx/sprites/moon.png`. The sky is fixed to the screen, not
the camera.

