# Cylon Defense

Homepage mini-game module. Licensed under the GNU GPL v3 (see `LICENSE`).

## Files
- `css/*.css` — the stylesheets: the scanner eye and glare, the combat nav, the overlays, the battlefield and the world-ended look (see Stylesheets)
- `src/main.ts` — the game's entry: it exports `initializeCylonEffects(options)`. The site shell stays in the site's own scripts.
- `src/*.ts` — the typed modules `main.ts` imports
- `src/ui/` — the Preact overlays (How to Play, game over, settings, the board), drawn with the kit's components; `mount.html` and the site page keep empty mount points (`#cylon-help-root`, `#cylon-gameover-root`, `#cylon-settings-panel`)
- `dist/main.js`, `dist/main.js.map` — the one esbuild bundle the site loads; generated and checked in
- `build.json`, `tsconfig.json`, `src/tsconfig.dom.json` — the kit build config (see Source layout and build)
- `mount.html` — scanner, battlefield, FX and the help and game-over mount points (injected into `#game-root`)
- `scores.php` — high-score API
- `server/score-guard.php` — the kit's score guard (origin, CSRF, run tokens, rate limits, initials), copied by `tools/install-files.php`; never edit the copy
- `data/config.json` — timezone, week boundary, board size, blocked initials, and request limits
- `data/scores.json` — live boards (created on the server; not part of the source tree)
- `test/*.test.mjs` — unit and static checks on `node:test`; `test/php/ScoresTest.php` — PHPUnit cases for `scores.php` (`vendor/bin/phpunit --testsuite cylon` from the site root)
- `data/.htaccess` — denies HTTP access to `data/`
- `tools/install-files.php` — writes `manifest.webmanifest` (the work is `games/_kit/php/install-core.php`)

## High scores
`scores.php` keeps two boards of at most `maxScores` rows each (score, hits, initials, time): the weekly board, which resets Sunday 00:00 America/Chicago (DST follows the timezone, not a fixed offset), and an all-time board that no reset touches. Every accepted score is ranked onto both, highest first, an earlier time winning a tie. The store is one JSON object, `{"week": [...], "alltime": [...]}`, read and rewritten under one `flock`; a store that is still a bare array is read as both boards. `GET` and `POST` answer with `scores` (this week) and `alltime`. The game-over panel shows them as This week and All time tabs, and the settings panel lists the weekly board. `CYLON_SCORES_FILE` points the store somewhere else; the PHPUnit suite uses it, and defines `CYLON_SCORES_LIBRARY` so that requiring `scores.php` serves no request. Every POST passes the kit's score guard first (`server/score-guard.php`), configured by the guard keys in `data/config.json`.

## Loading it
The page loads the entry module and calls it once:

```html
<script type="module">
  const { initializeCylonEffects } = await import('./games/cylon/dist/main.js?v=…');
  await initializeCylonEffects({ onTheme: applyCombatTheme });
</script>
```

The game finds `mount.html` and `scores.php` one folder above the bundle (from `import.meta.url`; `dist/` sits inside the game folder), so it runs from whatever path serves the folder; nothing is configured with attributes. The page links the stylesheets in `css/` itself. The server runs `.js`, `.html` and `.php` under `games/` as they are; PHP in this directory runs once the files are mode `644`. The server umask otherwise saves uploads as `640`, which PHP cannot read; `make deploy` finishes with `scp -p`. `websites/www.cs/scores.php` only forwards to `games/cylon/scores.php` so the old URL keeps working.

## Host contract
Mount into `#game-root`. The game may scatter glyphs in `#nav-main`, `#nav-contact`, `#nav-games` and toggle body classes:
`cylon-game-live`, `cylon-nav-combat`, `cylon-world-ended`, `cylon-glyphs-blown`, `cylon-touch-play`.
Combat nav chrome (toggle, scores, abilities, settings) still lives in the site header until Phase 5.
**Leaving.** Game Off (and Close on a quit run's panel) calls the kit's `exitApp`: the installed app (`start_url` `../../index.html?game=cylon&app=1`, scoped to that page) closes where the platform allows; otherwise the page stays, out of full screen, and an installed app shows `#cylon-exit-hint`.

The game reaches the page only through what it is handed and what it declares:

- **`options.onTheme(combat)`** — called with `true` when combat starts and `false` when it ends. The page uses it to force its dark theme while the game is live and to restore the visitor's choice after; the game changes no theme itself. Omitted, it does nothing.
- **`options.scoresApi`** — the score server's URL, when it is not `scores.php` in the game folder.
- **`window.cylonStartGame`** — the start function `metadata.yaml` names (`start:`); the Games page calls it by name. It is defined once `initializeCylonEffects` has mounted the game, and does nothing while a run is live or the game is over.

The game defines and calls nothing that the site's scripts define; `test/smoke.test.mjs` fails if a function or variable in the site's `main.js` appears in `src/`.

## Source layout and build
`src/main.ts` is the entry; esbuild bundles it and the modules it imports into `dist/main.js` (native ESM), which is checked in and served as it is: the host has no Node. The bundle is built by the games kit (`games/_kit/README.md`).

```
cd games && npm ci
node _kit/build/build.mjs cylon            # type-check both programs, write dist/
node _kit/build/build.mjs cylon --check    # fail if dist/ is missing or stale
php tools/install-files.php                # rewrite manifest.webmanifest if metadata.yaml changed
```

- `dist/` is generated: edit `src/`, rebuild, commit all of it. `make test` and `deploy.sh` run the check. The home page's `?v=` for the bundle is written by `php tools/site-versions.php` at the site root, after the build.
- `tsconfig.json` is strict and lists the DOM-free modules, which compile without page types so they cannot reach for the page. `src/tsconfig.dom.json` extends it with the DOM lib for the modules that touch the page or call `fetch`. Imports carry their `.ts` extension.
- `MOUNT_HTML_V`, the content hash of `mount.html`, is injected by the build (`build.json`'s `versions`), so editing `mount.html` changes the bundle and with it the page's version of the bundle.
- The saved settings are one pref (`cylon-settings`, JSON) through the kit's `pref`; `isSettings` in `types.ts` is its guard, and `chrome.ts` spreads what it reads over `DEFAULT_SETTINGS`.

| Module | What it holds | Program |
| --- | --- | --- |
| `rules` | kill level, difficulty factor, drone cap, missile caps and delays, nuke delay, wave plan, hull points and tint, volume curve | DOM-free |
| `playfield` | the playable box, clear spots, entry edges, where a march begins | DOM-free |
| `state` | the `Schedule` of due-at moments (missile, nuke, heal, grenade and raptor cooldowns, the eye's disorientation) and the `RunState` (kills, hull hits, run clock, game over, pending score), with the pure transitions on each | DOM-free |
| `abilities` | the grenade and the raptor: arming, the throw, the call, the strike and landing timers and the cooldown rule (`createAbilities`), with the effects handed in as callbacks | DOM-free |
| `field` | the terrain holes (hold, fade, the cap of 24, pause) and the page's glyph debris (scatter, restore, the nuke's reshuffle): `createHoles`, `createDebris` | DOM (the elements handed in) |
| `audio` | the WebAudio buses, the sound effects by name, the music bed, volumes and mute (`createAudio`) | DOM (WebAudio types) |
| `scores` | the `scores.php` client (tokens, board, qualifying rule, submission) and the board's rows as data | DOM (`fetch`) |
| `intro` | the opening strike: the nuke's flight to screen center, the timed steps, the "The CIC" title and its glide into the nav brand (`createIntro`) | DOM (window, the elements handed in) |
| `landscape` | the landscape writers: the body's CSS variables for the fracture, ash and land shift, the blast hotspot, the letter kicks (`createLandscape`) | DOM (`<body>`, the debris elements) |
| `eye` | the scanner eye and its glare: the sweep, tracking the cursor, the Raptor's disorientation (`createEye`) | DOM (the eye and glare elements handed in) |
| `reticle` | the aim: the cursor's viewport and page coordinates, the reticle, the touch drag (`createReticle`) | DOM (window, the reticle handed in) |
| `units` | the drones, the missiles and the mid-run nuke, from spawn to removal (`createUnits`) | DOM (the battlefield and the elements handed in) |
| `gameover` | the game-over panel's state and the initials entry, drawn by `ui/gameover.tsx` (`createGameOver`) | DOM (the mount element handed in) |
| `chrome` | the settings and their panel, the Game On toggle, the civil and combat nav and the mobile menu (`createChrome`) | DOM (the nav elements handed in, `document`, the kit's `browserStorage`) |
| `types` | the shapes the modules share: `Game`, `Settings`, `Mouse`, `Bot`, `Missile` | types and the settings key, defaults and guard |

`main.ts` measures the page, creates each module and wires them together, and owns the run clock (the missile, nuke and heal timers and the pause); the modules take what they need as arguments, including the random source, so `test/rules.test.mjs` and `test/playfield.test.mjs` pin them with fixed and seeded draws, and `test/scores.test.mjs` runs the client against a fake server.

`state` holds two plain records. `main.ts` keeps one of each on the `game` record (`types.Game`, which also holds `paused`, `pauseStartedAt`, `nukeInFlight`, `reticlePointerId`, `draggingReticle` and `idleTimer`) and replaces it with what a transition returns: `game.schedule = state.skewForPause(game.schedule, game.pauseStartedAt, elapsed)` moves every moment still ahead of the pause out by the pause (`applyPauseTimeSkew` then re-arms the `setTimeout` for each moment that moved, with `state.msUntil`), and `game.run = state.takeHits(game.run, n, MAX_HITS, fromNuke).run`, `recordKill`, `healOne`, `beginRun`, `endRun`, `resetScore` and the rest carry the score and hull. A module that reads or replaces one of these takes the `game` record, never a copy, so every module sees the current one. A `0` moment is unarmed. The timer handles and the holes' own hold and fade moments stay in `main.ts`, since they belong to elements. `test/state.test.mjs` drives the transitions with a fake clock, including that pausing for N ms shifts every armed due-at by N.

`intro` hands `main.ts` `createIntro(deps)` and gets `play()`, `cancel()` and `playing()`. The flight, the timed steps that wait out a pause, the title's states and the token that cancels them are inside it; the elements, the settings and pause predicates, the sound, the detonation and the start of combat come in as `deps`, so it reaches none of `main.ts`'s state. It has no Node test: the `home-eye` and `cylon-help` browser specs and a play-through cover it.

`audio` hands `main.ts` one object, `createAudio({ settings, sessionActive, volumeToGain, createContext? })`: `sfx(name)` plays an effect, `prime()` opens the context ahead of one, `unlock()` is the first-gesture handler, `syncMusic()` starts or stops the bed to match the settings and the session, and `settingChanged(key)` follows the settings panel. The context, the buses and the bed's timer stay inside it, and it exports no state. The settings, the session predicate and the volume curve (`rules.volumeToGain`) come in as arguments, so the module imports nothing; without an `AudioContext` it is silent. `test/audio.test.mjs` runs it against a fake context.

`abilities` hands `main.ts` `createAbilities(deps)`: `readyGrenade()` arms (a second press disarms), `throwGrenadeAt(x, y)` throws, `callRaptor()` calls the strike (it strikes 700 ms later and lands at 1900 ms), `cancelGrenadeArm()`, `clearRaptor()`, `reset()` for a new run, and `grenadeArmed()` and `raptorInbound()` for the buttons. The cooldowns are the `Schedule`'s `grenadeReadyAt` (10 s) and `raptorReadyAt` (60 s), read and written through `readyAt` and `setReadyAt`, so a pause moves them with the rest. The blast, the eye, the raptor sprite, the strike band and the buttons come in as callbacks. `test/abilities.test.mjs` drives it on a fake clock with fake timers.

`field` has two factories. `createHoles({ field, isLive, paused, viewport, create, now, setTimer, clearTimer })` returns `punch(x, y, preset)`, `clearAll()`, `largeRadius()`, `count()`, and `pause()` and `resume(pausedAt, elapsedMs)` for the help overlay; `HOLE_PRESETS` holds the small, medium and large hold and fade times. `createDebris({ doc, viewport, random, reduceMotion, setTimer, clearTimer })` returns `scatter()`, `restore()`, `reshuffle()`, `scattered()` and `cancelReshuffleSettle()`. `test/field.test.mjs` runs the holes against fake elements, a fake clock and fake timers; the debris has no Node test, and the browser specs and a play-through cover it.

`landscape` hands `main.ts` `createLandscape({ reduceMotion, scrollX, scrollY })`: `rearrangeLandscape(clientX, clientY, scale, opts)` and `rearrangeLandscapePage` write a blast's hotspot (and, for a full nuke, the whole backdrop) into the body's CSS variables, blending from the values the last blast left, `disruptGlyphs` kicks the debris letters next to it, `clearLandscapeVars()` removes every variable, and `randRange` is the draw they share.

`eye` hands `main.ts` `createEye({ eye, glare, game, settings, mouse, state, isGameLive, EYE_DISORIENT_MS })`: `updateEye()` paints a frame and schedules the next, `setEyeTracking(on)`, `disorientEye(ms)`, `clearEyeDisorient()`, `isEyeDisoriented()` (read from `game.schedule`) and `eyeClientCenter()`. The eye's position, tracking flag and sweep phase are inside it. `reticle` takes the eye's functions, the `mouse` and `lastAim` records and the `game` record, and returns `syncMousePageFromClient()`, `paintReticle()`, `syncReticleVisibility()`, `resetReticleToCenter()`, `onPointerMove(e)` and `bindReticle()`; moving the aim arms `game.idleTimer`, which puts the eye's tracking to sleep.

`units` hands `main.ts` `createUnits(deps)`, whose dependencies are the elements, the `game` record, the sound, the holes and debris, the landscape writers, the eye's centre, the hull (`registerHit`) and the tuning constants. It returns the drones' `allBots()`, `knockOutBot(bot)`, `clearAllBots()`, `wipeAllBotsWithScore()`, `herdBotsIntoView()`, `scheduleAmbush(first)` (the wave timer) and `bindPlayerMissShots()`; the missiles' `canLaunchMissile(asTracker)`, `launchSmallMissile(opts)` and `clearActiveMissiles()`; and the nuke's `launchNuke()` and `detonateNukeAt(x, y, opts)`. The drone count, the missile list and the wave, tracker-pair and volley timers are inside it. When the next missile or nuke launches is the run clock's (`main.ts`), which asks `units` to launch one.

`gameover` hands `main.ts` `createGameOver(deps)`: `renderHighScores()` redraws the panel and tells the settings panel the board changed, `fetchHighScores()`, `showGameOver(reason)`, `hideGameOver()` and `resetText()`; the initials entry's state is inside it. `chrome` hands it `createChrome(deps)`: `settings` (the one live object, read through the kit pref with the volume migration), `saveSettings()`, `syncNavChrome()` (the fade between civil and combat), `syncGameToggleUi()`, `renderSettings()` and the binders for the panel, the toggle and the burger. `gameover` and `chrome` call back into the game for what changes a run: `setGameEnabled`, `resetRunStats`, `setEyeTracking` and the sound's `settingChanged`.

Still in `main.ts`, and why: the hull (`registerHit`, healing: it ends the run), the run clock (the missile, nuke and heal timers and the pause that skews them: they span `units`, `holes` and the hull), the help overlay (it is the pause), the grenade's blast and the raptor's strike band (the callbacks `abilities` runs: they use the drones, the holes and the landscape together), the ability buttons, the world-ended look (it drives `debris` and the nav) and the run's start and end (`setGameEnabled`, `endGame`). They reach across every module, so they are the wiring.

## Stylesheets
The page links the stylesheets in `css/`, in this order, and the order is the cascade: `eye` (the scanner, the eye, its glare cone and the home page eye's two sweeps and red fill), `nav` (the combat nav and its fade), `help`, `hud` (touch play, the reticle, the KO and hull readouts), `gameover`, `settings`, `controls` (the Game On toggle, the grenade and raptor buttons, the high-score list), `fx` (the grenade blast, the scorched holes, the page rules while a run is live), `units` (drones, bolts, the raptor, the missiles and the nuke), `world` (the world-ended look and the scattered glyphs) and `intro` (the title card). Each file begins with a one-line comment and is otherwise a contiguous run of the rules in the order they apply.

They are `<link>` tags in the site's `index.html`, each with a content-hash `?v=` that `php tools/site-versions.php` (site root) writes, not `@import`s from one file: an `@import` is fetched only after its parent arrives, a round trip the home page would wait out before it paints. That tool fails if a file in `css/` is not linked, is linked twice, or is linked out of order. `custom.css` at the site root imports them in the same order for any page that still links it.

## Tests
From this folder, `./test.sh` runs the build check, the install check, `node --test 'test/*.test.mjs'` and the PHPUnit suite. Browser specs for the home page and the game are in `../../tests/e2e` (`home-eye`, `cylon-help`).
