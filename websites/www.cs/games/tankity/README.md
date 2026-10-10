# Operation Tankity

Scorched-Earth artillery against a drone battery. Endless escalating rounds
from a $600 stake, solo or in network rooms (max 10 live). No chat; names are
3-letter initials with a blocked list (`room_valid_initials` in rooms.php).
Kid-friendly copy, human error strings, never status codes. GPLv3 (LICENSE).

## Files

| File                                                            | What it is                                                                                                                                                                                  |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`, `game.css`, `game.js`                             | The page and the client (an ES module: the game loop, the state behind the HUD, shop, lobby and menu, and the effects the room replay and the firing range cause); it imports the sim, the audio, the room client, the replay, the firing range, the renderer, the input and the Preact overlays from `js/`                                                                                                               |
| `game.yaml`                                                     | The one file a maintainer edits: `arsenal` (20 shells and tricks), `keys` (every binding), `audio` (optional sound files), `effects` (every weapon's muzzle, trail and blast). Commented field by field |
| `game.json`                                                     | Generated from `game.yaml`; the only data file `game.js`, `rooms.php` and the effects editor load. Never edit by hand                                                                                           |
| `audio/sfx/`, `audio/music/`, `audio/CREDITS.md`                | Optional CC0 sound files named by `game.yaml`, and where each came from                                                                                                                     |
| `src/sim.ts` | The game math in TypeScript: RNG, terrain, flight, hit tests, blasts, the drone's aim. Pure: state in, what happened out; no page, sound or particles |
| `src/audio.ts` | All the sound in TypeScript: WebAudio context, synthesized effects and built-in songs, game.json's sound files, the track player (silence-trimmed loops, cross-fades), mutes. It never touches the page |
| `src/net.ts` | The room client: transport (one fetcher, the 429 retry), the session, polling, the act/buy/ready/leave senders, the turn and shop clocks, and the hidden-tab catch-up decision. It never touches the page: fetch, timers and the clock are passed in |
| `src/replay.ts` | The room volley replay: the queue of events waiting to play and the volley on screen. Eases the shooter's barrel, flies each shell along the path the server recorded (positions and velocities for the renderer), lands blasts and hits when the events say, and plays a volley kept back by a catch-up at triple speed. Sound, particles, craters, armor and log lines happen through callbacks; it never touches the page |
| `src/preview.ts` | The firing-range preview simulation: a fixed dummy, the solver that aims at it with the war's own ballistics, the shell loop (seeker, cluster, pierce, proximity), the damage tally and the result timing, on its own small field. Weapons, effects and the result line are passed in; it never touches the page |
| `src/render.ts` | The battlefield on the canvas: sky and moon, clouds, hills, the units and their bodies, aim arm, blasts, shells, sparks, the wind gauge, the on-canvas turn clock and the firing-range preview. Reads a `BattleView` that `game.js` builds each frame and paints it; it never changes game state |
| `src/protocol.ts` | The room wire protocol as types: replies, the room snapshot, the discriminated union of events, and each action's request body. Types only, so it has no `js/` file |
| `src/protocol-fixtures.check.ts`, `src/tsconfig.check.json` | Type-check only, never emitted: assigns every `protocol/*.json` to its type (see Protocol fixtures) |
| `src/ui/*.tsx` | The Preact overlays and panels (see Preact overlays): `chrome.tsx` holds the shared key labels, title bar and scroll keeper; `help.tsx`, `shop.tsx`, `lobby.tsx`, `menu.tsx`, `guns.tsx`, `scores.tsx`, `log.tsx`, `tutorial.tsx`, `hud.tsx`, `endveil.tsx` and `leave.tsx` one each |
| `js/*.js`, `js/ui/*.js` | `src/*.ts` and `src/ui/*.tsx` compiled by `tools/ts-build.mjs`; checked in and deployed (the host has no Node). Never edit by hand |
| `vendor/preact/` | Preact's ES module builds and licence, copied from `node_modules` by `tools/vendor.mjs`; checked in and deployed. Never edit by hand |
| `package.json`, `package-lock.json`, `tsconfig.json`, `src/tsconfig.dom.json`, `src/tsconfig.check.json` | The build setup (TypeScript and Preact pinned exactly). Never deployed, like `src/`, `tools/` and `node_modules/` |
| `ui-test.js`, `tools/dom-stub.mjs` | Renders the Preact overlays with sample props and asserts their DOM; the stub is the small Node DOM that it and `smoke-test.js` share. Never deployed |
| `rooms.php`                                                     | Room server: authoritative sim, AI turns, shop, events                                                                                                                                      |
| `scores.php`, `config.php`                                      | Score API; `.config.yaml` reader                                                                                                                                                            |
| `fx.js` | The effects engine (particle pool, emitters, screen flash, shell glow), shared by `game.js` and the editor; exposes `window.TankityFX` |
| `fx/sprites/` | Sprite sheets (`fireball`, `smoke`, `shock`, `energy`, `mushroom`, `moon`) and `sprites.json`, rendered by `fx/blender/render_fx.py` |
| `fx/blender/render_fx.py` | Headless Blender script that builds and renders the sprite sheets; its header documents the command and every option. Dev only |
| `fx-editor.html`, `fx-editor.js`, `fx-editor.css` | Dev-only live effects editor (see Weapon effects). Never deployed |
| `.config.yaml`                                                  | Server settings, read-only, never sent to browsers; env vars win (`TANKITY_MAX_ROOMS`, `TANKITY_ROOM_MAX_AGE`, `TANKITY_ROOM_LIVE_SECS`, `TANKITY_SHM_KEY`; `CONFIG_FILE` points elsewhere) |
| `metadata.yaml`, `og.png`                                       | Games-page card and link preview (see `../README.md`)                                                                                                                                       |
| `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png` | Install and offline support; the first two are generated by `tools/install-files.php`                                                                                                     |

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
- `game.js` and `rooms.php` hold a frozen fallback copy of a few arsenal rows,
  and `src/input.ts` one of the key table (shaped like `game.json`'s sections); keep them in step
  with `game.yaml` defaults.
- `install-files.php` rewrites `manifest.webmanifest`, `sw.js` and the `?v=` hashes (see Source layout and build), and keeps the
  install block in `index.html` (cache
  version = hash of the served static files, so any edit makes it stale).
  Music and sound files are never precached; sound effects are cached by the
  worker the first time they play, music streams from the network.
- `make test` and `make deploy` both run the `--check`s (the generators, the TypeScript build, the vendored
  Preact) and the deploy refuses stale output. `game.yaml`, `tools/` and this file are not deployed.
- Audio plays only after the first tap or key press, never while its toggle
  (E sound, M music) is off, and a missing or undecodable file silently leaves
  the synthesized sound or song in place. Add a line to `audio/CREDITS.md` for
  every file, and use only CC0 or otherwise redistributable audio.
- Key tokens match `event.code` first, then `event.key`; the first token of an
  action names the key on buttons. Touch-only screens (coarse pointer, no
  mouse) get no key bindings or labels.

## Architecture rules

- Rooms live in SysV shared memory only: no disk, no fallback. A host restart
  wipes them; a web-server restart does not. Key: `shm_key` from
  `.config.yaml`, else `ftok(rooms.php,'R')`, else `0x54414E4B`. The PHP image
  needs `sysvsem` and `sysvshm` (Fedora's `php-process`).
- The server is authoritative. Clients send intents (aim, drive, weapon, fire,
  buy, body), never hits. CSRF and Origin gated; every act is range-checked.
- The server settles a whole turn per request. Every event it emits carries
  `at` (seconds into the volley); shot events carry their flight path, launch
  and landing times, and blast radius. Clients replay each volley at real
  speed and adopt the new room state only after the replay drains.
- Locks are bounded (~5 s): a crashed holder must never brick the shelf.
- Live occupancy only: rooms idle longer than `room_live_secs` stop counting;
  the sweep (on ping) drops them.
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
- Turn clock: a human's turn runs for 120 s (`ROOM_TURN_SECS`), started when
  the turn begins; aiming and driving do not reset it. When it runs out the
  crew loads a random gun from that player's rack (the Shell, or anything
  with ammo the round has unlocked) and fires it with the current aim.
  Snapshots carry `turnLeft`; the client alerts its player at 30 s and shows
  everyone a countdown for the last 10. Solo play has no clock.
- Shop clock: between rounds the shop is open for at most 90 s
  (`ROOM_SHOP_SECS`), or until every human still in the match is ready. The
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
- Spawns are random, at least 110 px apart, and units never end a move within
  44 px of another. Each tank faces the middle; barrel keys swing toward the
  side pressed.
- The lobby's hill tiles draw `profile` (48 heights, 0..1) that
  `rooms.php?action=maps` computes from round one of each map's terrain.

## Source layout and build

The client is native ES modules with no bundler: `game.js` is loaded by
`index.html` with `<script type="module">`, and `src/*.ts` and `src/ui/*.tsx`
compile one file to one file into `js/`. Both `js/` and `fx.js` (a classic
script exposing `window.TankityFX`, loaded first) are served as they are, and
so is `vendor/`, the one library.

```
npm ci && node tools/ts-build.mjs          # compile src/ to js/ (type errors fail it)
node tools/ts-build.mjs --check            # fail if js/ is missing, stale or has extra files
node tools/vendor.mjs                      # copy Preact from node_modules to vendor/preact/
node tools/vendor.mjs --check              # fail if vendor/ drifted from the pinned version
```

- `js/` is generated and committed, like `game.json` and `sw.js`: edit `src/`,
  rebuild, commit both. `make test` runs `npm ci` and both `--check`s, and
  `deploy.sh` refuses a stale `js/` or `vendor/`. Rerun
  `php tools/install-files.php` after a rebuild: the service worker precaches
  `js/**/*.js` and `vendor/**/*.js` and versions its cache by their content.
- `tsconfig.json`: strict, `noUncheckedIndexedAccess`, ES2022 modules, imports
  written with their `.js` extension (the file the browser fetches), comments
  kept, no source maps. It lists the DOM-free modules (the sim, the room
  client, the input, the firing range and the replay), which compile without DOM types, so they cannot reach for the page.
  `src/tsconfig.dom.json` extends it with the DOM lib for the modules that need
  WebAudio, `fetch`, timers, canvas and the document (`audio.ts`, `render.ts`
  and the overlays in `ui/`), and with `"jsx": "react-jsx"` and
  `"jsxImportSource": "preact"` for the `.tsx` files;
  `src/tsconfig.check.json` is a
  third program that type-checks the protocol fixtures and emits nothing.
  `ts-build.mjs` compiles each config as its own program, so adding the DOM lib
  for the audio never lets the sim see `document`. A module that holds only
  types (`protocol.ts`) compiles to nothing and has no `js/` file.
- **Imports.** A browser keys a module by its URL, so a file imported under two
  spellings (with and without a `?v=`, or with two versions) loads twice and
  one copy is stale. Three rules keep that from happening:
  1. Every import between our own files carries `?v=<hash>`, the first 10 hex
     characters of the SHA-256 of the imported file, and every importer spells
     the same one. `tools/install-files.php` writes them, never by hand: it
     adds a missing `?v=` and edits the compiled `js/` files in place (tsc
     emits `from "./chrome.js"`; `ts-build.mjs` ignores the versions when it
     compares). It works dependencies first, hashing each file after its
     imports are versioned, so one run converges however deep the chain:
     change `sim.js` and everything importing it, `game.js`, `index.html` and
     `sw.js` re-version together.
  2. A bare import (`preact`, `preact/hooks`, `preact/jsx-runtime`) must be an
     entry of the import map in `index.html`, whose URLs (`./vendor/preact/...`)
     carry content hashes too. The map precedes the game's script.
  3. Every `js/` file is reachable from `game.js` through those imports.

  The tool fails, writing nothing, on an import of a file that is missing or
  outside `js/`, a bare import the map lacks, a cycle, an unreachable `js/`
  file, a dynamic `import('...')` of a literal, a malformed map or one placed
  after the game's script, or a page tag that is missing. Then `index.html`'s
  `game.js?v=`, `game.css?v=` and `fx.js?v=` carry the hash of their file (so a
  changed module re-versions `game.js` and the page too). Because versions are
  functions of content, two branches that touch different files do not
  conflict over them. `smoke-test.js` re-checks the same rules from the
  browser's side: versions are present, equal one per module and equal the
  content hash; bare imports are mapped; everything is reachable. The service
  worker serves network first, revalidating, so it never holds a stale module
  for an online player, and its precache lets the import map and the vendored
  files load offline. The Node tests need no map: `preact` resolves to
  `node_modules/preact`, the release `vendor/` is copied from.
- **Preact overlays.** The panels that are mostly markup are Preact components
  in `src/ui/`, drawn into the elements `index.html` keeps (`#help-overlay`,
  `#shop-veil`, marked `data-ui`). Preact is a pinned dependency (`package.json`
  holds an exact version, `package-lock.json` the same) and `tools/vendor.mjs`
  copies its three ES builds and licence to `vendor/preact/`, so the game stays
  self-contained and works offline; `--check` fails if the pin, the lockfile,
  `node_modules` or the copies disagree. To upgrade: change the version, run
  `npm install`, `node tools/vendor.mjs`, `node tools/ts-build.mjs` and
  `php tools/install-files.php`. The rules for a component: props in, DOM and
  callbacks out. `game.js` builds a finished view of its state (the shop's
  rows, the cash line, the start button's label) and hands it in with the
  callbacks (`onBuy`, `onPreview`, `onNext`, `onLeave`, `onClose`, and so on); the
  component never reaches into game state or the page, and keeps local state
  only for the UI itself. Components keep the ids and classes `game.css` and
  the browser specs use. Key labels come from the `keyHint` prop through
  `KeyHints` context (`Key` in `chrome.tsx`), so a remapped `game.json` rewrites
  them; the document-wide `renderKeyHints` pass skips anything under
  `[data-ui]`. Touch screens hide `.key` caps and `.keys-only` text centrally in
  `game.css`, so components still emit them. Each overlay module exports a
  `render*(container, props)` that `game.js` calls on every change: Preact diffs,
  so the DOM (scroll position, focus) persists between renders. Every panel
  and overlay is a component now: the help, the shop, the rooms lobby (`#lobby-veil`),
  the menu with its settings (`#menu-overlay`), the weapon picker, the scores,
  the tutorial coach, the radio log (each in its own `<section>`), the end-of-match
  veil (`#end-veil`), the leave-room question (`#leave-veil`) and the status
  bar (`#hud-bar`). `game.js` keeps the state of each (`LOBBY`, `SCORES`, `HUD`, `END`,
  the log's lines, the gun cursor) and redraws; the text boxes whose content the
  player types (seed, initials, room code, callsign) stay uncontrolled inputs the
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
- The sim takes its state as arguments (`World`, `Arsenal`) and reports what
  happened as data: `explode` returns the blast (each unit's shield, wound or
  wreck, a last stand's nested blast), `stepShells` returns the frame's trails,
  splits, pierces and blasts. `game.js` plays them as sound, particles and chat.
- `audio.ts` is a handful of exports and keeps its state to itself: `initAudio`
  installs game.json's audio section, `sfx.play(name)` (plus `sfx.turnPing()` and
  `sfx.clockWarn()`) voices an event, `music.start/stop/next/playTheme/forRound/
  leaveTheme` drive the soundtrack, `music.watchdog()` runs every frame,
  `music.onTrackStart(cb)` reports the track that begins (`game.js` shows it as
  a log line), `noteGesture` and `unlock` wake the speakers, and
  `setSoundMuted`/`setMusicMuted` (with `isSoundMuted`/`isMusicMuted`) are the
  toggles.
- `net.ts` exports `RoomClient`, built with a `RoomEnv` (fetch, timers, a
  clock, the leave beacon: `game.js` passes the page's) and `RoomHandlers`
  (`onSnapshot(room, fresh, first)`, `onReachable`, `onReadyChange`,
  `onError`). The client owns the session (`code`, `seat`, `token`, `csrf`,
  the event cursor `since`), `post(action, body)` typed by `protocol.ts`, the
  match and lobby polls, `act`/`sendQuiet`/`setMenu`/`buy`/`setReady`/`leave`,
  and the clocks (`armClocks`, `turnClockLeft`, `clockWarnDue`). It counts the
  events past its cursor as seen and hands them over; `game.js` keeps what
  draws or animates (the HUD, the lobby and shop), queues the events in the
  replay and calls `shouldCatchUp` to decide when a hidden tab skips. Because every environmental call is injected, `net.ts` is
  in the DOM-free program and `net-test.js` runs it against a fake server.
- `replay.ts` exports `createReplay(env)`, which returns the replay: `push(events)`
  queues a snapshot's events, `step(dt)` plays them (the volley on screen, then
  whatever is next in the queue), `idle()` says nothing is playing or waiting
  (`game.js` adopts the pending room snapshot then, and only then), `flying()`
  gives the renderer the shells on screen with their velocities, `shooter()` the
  tank whose barrel is easing, `catchUp(waiting, seat)` applies `planCatchUp` and
  returns the events it dropped for `game.js` to log, and `clear()` forgets it
  all. `ReplayEnv` is everything the replay causes: the tank for a seat, a
  weapon's effect kind, the log line for an event, `launch`, `blast`, `muzzle`,
  `special` and `trail`. `shellAt`/`shellVel` read a recorded path (points
  `PATH_HZ` = 12 a second apart). `replay-test.js` steps the recorded volleys of
  `protocol/play-after-fire.json` and checks every shell against its path.
- `preview.ts` exports `createPreview(wkey, env, fx, canvas)` (null for an unknown
  weapon), `stepPreview(pv, dt, env)` and the solver. The state it returns is a
  plain `PreviewState` that `game.js` keeps as `G.preview` and the renderer
  draws; `PreviewEnv` supplies the weapon table, the effect hooks and the result
  line. `preview-test.js` steps it on frames the test counts.
- `render.ts` exports `createRenderer(canvas, deps)`, which returns
  `{ frame(view) }`, and `drawChassis` (the unit picker draws its small bodies
  with the battlefield's painter). `deps` (`RenderDeps`) is everything it
  borrows: the effects engine as a typed slice of `window.TankityFX` (`FxApi`),
  the sim helpers it shares with `game.js` (it imports nothing at run time, so
  they arrive as arguments), a weapon's paint job, the reduced-motion setting
  and the random source for screen shake. `view` (`BattleView`) is a read-only
  snapshot: the camera, terrain, tanks, shells, blast discs, sparks, wind, text
  scale, and the decisions made elsewhere (whose turn marker shows, the aim arm
  and its length, the clock count-down, the replay's shells, the firing range).
  Rendering reads and draws; whatever advances lives in `game.js`'s update step
  (`decayFx` ages the blast discs and shake, `trackMotion` notes which ground
  units moved), and `battleView()` just assembles the snapshot. The sky is built
  from the match key and cached inside the renderer. `render-test.js` paints a
  deep-frozen view, so a frame that wrote to the game state would throw.

- `input.ts` maps physical keys and touches to named commands, and `game.js`
  says what each command does. The commands are the action names of
  `game.json`'s `keys` section (`barrelLeft`, `fire`, `guns`, `lineDown`, ...),
  so rebinding a key in `game.yaml` changes nothing in either file. `createInput({ touch })`
  returns the input: `register(commands, context)` takes a `CommandTable` (a
  handler per command) and an `InputContext` (`shopLive`, `modalOpen`/`modalEscape`,
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
  `shopLive`), the global `escape`, the held aim keys (always suppressed, so
  the arrows never scroll the page), `fire` (suppressed, once per press), then
  the other global commands (once per press). A question that holds the keys
  (`modalOpen`) lets only ESC through. `stepArm(held, dt, arm, facing)` is one
  frame of held-key arm movement at 42 degrees per second for the barrel and 45
  power per second, clamped to 10-170 and 10-100, reporting whether a key is
  adjusting and whether none is down (the room client sends the aim when the
  keys are released). Driving stays in `game.js` because it depends on terrain
  and fuel. `touchOnly(matchMedia)` is the one test for a touch-only screen;
  `game.js` keeps its result as `TOUCH`, which hides key hints (`.touch .key`)
  and rewrites prose, so there is one source of truth. What stays in
  `game.js`: what each command does (shop rows, overlays, the gun picker's
  cursor, scrolling a panel), the key hint text, and the capture-phase
  keydown that wakes audio. The module touches no page API, so `input-test.js`
  drives it with plain event objects.

## Tests

| Command                                        | Covers                                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `node tools/ts-build.mjs --check`              | `js/` is exactly what `src/` compiles to, `src/` type-checks, and every `protocol/*.json` fits its type in `protocol.ts` (run `npm ci` first) |
| `node tools/vendor.mjs --check`, `node vendor-test.js` | `vendor/preact/` is byte-for-byte what the pinned Preact in `node_modules` ships (pin, lockfile and install agree); the check's own failure cases |
| `node ui-test.js`                              | The Preact overlays (`js/ui/`) rendered with sample props into the stub DOM: ids and classes, the title bar, every shop row, the Ready toggle, the lobby's forms, map tiles and seat grid, the menu's pickers and toggles, the weapon tiles, the scores, the log, the tutorial and the status bar, the key labels, that clicks and submits reach the callbacks, and that a redraw keeps the scroll |
| `node smoke-test.js`                           | The shipped client (`game.js` imported as a module) in a stub DOM (loads `fx.js` first), driven by the `game.json` key table and the `protocol/` fixtures; also checks every weapon has muzzle, trail and impact effects, that the `effects:` block of `game.yaml` is exactly what the editor exports, and that the particle pool caps |
| `php config-test.php`                          | `.config.yaml` precedence                                                                  |
| `php rooms-sim-test.php`                       | Server sim units: pierce, repair, spawns, spacing, replay stamping; `room_snapshot` shapes against `protocol/` |
| `php protocol/generate.php --check`            | `protocol/` fixtures are current (needs SysV; run inside the PHP container)                 |
| `php protocol/sim-vectors.php --check`         | `protocol/sim-vectors.json` is current (docker PHP)                                         |
| `node audio-test.js`                            | `js/audio.js` imports without a browser; the loop-point trim and the round-to-track mapping are right |
| `node render-test.js`                           | `js/render.js` paints a deep-frozen view on a stub canvas (so it cannot write to the game state), draws the firing range on its own canvas, skips quietly with no 2D context, and rebuilds the sky only when the match key changes |
| `node input-test.js`                            | `js/input.js` with plain events: token lookup (code, key, Shift+, Ctrl+), the shipped bindings, command routing and fall-through, ESC, the leave question, held keys and blur, the hold buttons, and the arm's rate on a fake clock |
| `node net-test.js`                              | `js/net.js` against a fake server and timers: the 429 retry, Ready's ordering under rapid toggles, polling, the leave beacon, the clocks, the hidden-tab catch-up plan |
| `node replay-test.js`                           | `js/replay.js` on the recorded `protocol/` volleys with a recording host: shell positions against the path points at fixed times, blasts and hits on time, aim easing, and the catch-up plan with the kept volley at 3x |
| `node preview-test.js`                          | `js/preview.js` on a fake clock with the real arsenal: the aim, fly, show and aim phases, each gun's first volley, cluster, pierce and pellet behaviour, and the resets |
| `node protocol-test.js`                         | `src/protocol.ts` against the server: the literal unions (phases, seat modes, event `t`) read out of the types are compared with the fixtures, with the phases, event types and POST actions `rooms.php` spells out, and with the events `game.js` handles |
| `node sim-vectors-test.js`                     | `js/sim.js` agrees with `rooms.php` on every shared sim vector (see Sim vectors)              |
| `php rooms-test.php`                           | The room shelf over its own `php -S` (needs SysV; run inside the PHP container)            |
| `curl <site>/games/tankity/rooms-web-test.php` | Rooms over real HTTP (local docker only; never deployed)                                   |
| `php game-json-test.php`                       | The YAML parser, the `game.yaml` schema (effects included), `--check` staleness            |
| `php install-files-test.php`                   | The manifest, install block, `?v=` content hashes and `sw.js` precache, `--check` staleness                   |
| `make e2e` (site root)                         | Real-browser checks, solo and two-player, audio, weapon effects (`tankity-fx-battle`, `tankity-fx-range`, and `tankity-fx-editor`, which runs on a local site only); `E2E_BASE_URL` points it at the live site |
| `make e2e-changed` (site root) | Only the browser specs your changes need (`tests/e2e/select.mjs` maps touched files to specs; CI uses the same map) |

`make test` from the site root runs every suite above except e2e. CI runs
`make test` as `units` and `make e2e` as `e2e` on every pull request. Deploys
skip `*-test.*`, `README.md` files, `protocol/`, the effects editor and the Blender script.

## Protocol fixtures

`protocol/*.json` are real room-server replies, one file per moment:
`lobby-host`, `lobby-public`, `play-my-turn`, `play-after-fire` (fire, shot and
hit events, then the drone's answer), `shop-after-win`, `shop-ready` (the shop
with one of two humans readied), `create-reply`, `join-reply`, `error-too-fast` (429) and `error-not-your-turn` (409). Each file
is `{about, status, body}`.
`sim-vectors.json` in the same folder is not one of them (see Sim vectors).

- `protocol/generate.php` writes them. Snapshots are built in process with
  `rooms.php`'s own functions on a fixed room code and seeds
  (`protocol/scenarios.php`); the create and join replies and the two errors
  come from `rooms.php` served by a throwaway `php -S` with a private
  shared-memory key, with codes and tokens replaced by fixed placeholders.
- Regenerate from the site folder (`websites/www.cs`) with the site running:
  `make protocol`. Commit the result. `make test` runs
  `php protocol/generate.php --check`, which fails when any fixture differs.
- `src/protocol.ts` types the wire: `RoomSnapshot` (phase, seats with `ready`,
  tanks, terrain, `turnLeft`, `shopLeft`, `events`, the private `you` and
  `csrf`), `RoomEvent` (a union discriminated by `t`, written from every event
  `rooms.php` emits), the replies (`SeatReply`, `RoomReply`, `ErrorReply`, ...)
  and `PostBodies`/`PostReplies`, which type `RoomClient.post`.
  `src/protocol-fixtures.check.ts` imports every fixture and assigns it to its
  type; `node tools/ts-build.mjs --check` (so `make test`) fails with the
  offending fixture and key when a fixture holds a field the types lack, lacks
  one they need, or changes a type. A JSON import types strings as `string`,
  so `protocol-test.js` checks the literal values (phase, seat mode, event
  `t`). Add a fixture to the `fixturesFit` list when `generate.php` gains one.
  `rooms.php` stores a `join` event without a `seq`, which no snapshot ever
  carries; it has no member in the union.
- `rooms-sim-test.php` compares the keys and types of today's `room_snapshot`
  output with each fixture, on any PHP.
- `smoke-test.js` checks that every hand-written snapshot its fake server
  sends has the fixtures' keys and types, then serves the fixtures themselves
  to the client: lobby, start, a fired turn replayed, the shop, a 429 and a
  409. A server change the client does not handle fails there.
- The fixtures are not precached by the service worker (only top-level
  static files, `fx/sprites/` and `js/` are) and are not deployed.

## Sim vectors

The game's math runs twice: in `src/sim.ts` (solo, demo and the client's own
shell flight) and in `rooms.php` (the authoritative room server). `protocol/sim-vectors.json`
keeps the two honest: `protocol/sim-vectors.php` calls `rooms.php`'s real
functions over a spread of cases and writes each case's inputs and expected
outputs; `sim-vectors-test.js` replays every case through the compiled sim,
`js/sim.js`, and compares within 1e-4.

- Covered: the RNG and terrain generator, spawn spots, shot speed, muzzle,
  gravity and wind, hit boxes, the swept hit test (owner-clear rule, lance
  skip), seeker steering, the cluster fan, blast damage and craters (shield,
  bunker, EMP, last stand, kill bonus), landing prediction, whole volleys for
  every weapon in `game.json`, the drone's aim, and tank settling.
- Not covered: pacing. The server steps a whole turn in fixed 1/60 s steps; the
  browser steps per frame. The cases use 1/60 s for both.
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
- The replay imports `js/sim.js` and passes each case its own plain state
  object; nothing is stubbed, because the sim has no side effects to stub.

## Weapon effects

Looks are data and the blast radius stays the sim's. The arsenal in `game.yaml` owns
`radius` (crater and damage); the `effects` section only decorates it: its
emitters size themselves from the radius `explode` hands them (`unit: "r"`),
the blast disc `drawBoom` paints is exactly that radius (drawn under the
effects), and `gfx.shake` is still the screen shake unless an effect sets its
own `screen.shake`.

`effects` is the last section of `game.yaml`, keyed by weapon key (every ammo
key, plus `laststand`, the wreck blast); the generator rejects a missing
weapon. Each entry has `body` (shell glow: `halo`, `alpha`, `pulse`,
`stretch`) and three effects: `muzzle` (once, at the barrel), `trail` (every
frame in flight, emitters need a `rate`), `impact` (on detonation). `special`
holds named extras: `split` (cluster bloom), `steer` (seeker pulse), `pierce`
(lance through a tank), `arc` (EMP, over each tank it fries). An effect is
`emitters` (one `- { ... }` line each) and an optional `screen: { shake,
flash: { color, alpha, dur } }`. An emitter's fields and defaults are
`DEFAULTS` in `fx.js` (shape `dot | streak | ring | spark | smoke | sprite |
bolt | beam`, count or rate, delay, duration, life, speed, aim/angle/spread,
offset/edge, gravity, drag, wind, size over life, alpha keyframes, colour
ramp, `glow` = additive, sprite sheet/fps/scale/anchor/tint); only non-default
fields are written. `game.yaml` documents each field with its range, and
`tools/game-json.php` checks them: unknown names, a trail emitter with no
`rate`, an emitter that emits nothing, a sprite with no sheet or a sheet
that does not exist, and out-of-range numbers (checked against the unit they
are written in). The generated `game.json` carries the section as plain JSON.
`game.js` reads it from `game.json`, carries a baked Shell fallback for when
that does not arrive, and derives a plain effect from `gfx` for any weapon
the data does not describe. `unit: "r"` multiplies size, speed, offset and
length by the blast radius, so keep sizes in r small (a `dot` of size 1 is a
disc of radius r).

Engine (`fx.js`): one preallocated pool per canvas (battlefield 700 particles,
firing range 260, hard caps; a full pool recycles slots, and trails stop
feeding it past 80 % so a blast always has room), no allocation per frame (colour
ramps are cached lookup tables), additive particles drawn in a second pass.
`FX.play` (`muzzle`, `impact`, `special`, `trail`) is how a weapon's entry is
played; `game.js` (battlefield, and the effects the firing range and the room replay ask for)
and the editor both go through it. Reduced motion (`prefers-reduced-motion`)
cuts counts and rates (x0.35, x0.4), shortens lives and drops the screen
flash; shake was already off. Sprite sheets load lazily from `fx/sprites/`; until
a sheet arrives, or if it never does, the other emitters carry the effect.

Regenerate the sheets (Blender 4.2+, `brew install --cask blender`), from
`fx/blender/`:

    /Applications/Blender.app/Contents/MacOS/Blender -b -P render_fx.py -- --out ../sprites

The editor, `fx-editor.html` (open it from the local site: `make url`, then
`games/tankity/fx-editor.html`), edits the effects live: pick a weapon and
slot, edit every emitter field, add, duplicate, reorder, mute and remove
emitters, watch a looping shot (slow motion, reduced motion and a blast-radius
ring are toggles). It starts from the `effects` in `game.json`. Copy YAML (or
Download effects.yaml) exports the whole `effects:` block, which runs to the
end of `game.yaml`: paste it over the old block, then run
`php tools/game-json.php` and `php tools/install-files.php`. Unsaved edits are
kept in `localStorage` until Reload file re-reads `game.json`. `deploy.sh`
skips `games/*/fx-editor.*` and `games/*/fx/blender/*`, the service worker
precache leaves the editor out and includes `fx/sprites/`, and nginx denies the
Blender folder. The Blender scenes (`fx/blender/*.blend`) are the sources of the sheets and live in Git LFS.

## Night sky

Each match draws its own sky from the match key (the solo seed, or the room
code) through a generator of its own (`buildSky` in `game.js`), so it never
touches the sim's random numbers and every client in a room sees the same
stars: about 290 square pixel stars in three sizes, varied brightness and a few
warm or cool tints, a slanted milky band with a faint glow, a few clusters, a
quiet twinkle on some (none under reduced motion), and the moon in one of
seven phases from `fx/sprites/moon.png`. The sky is fixed to the screen, not
the camera.

