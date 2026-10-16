# Games kit

Shared source for every game. Nothing here is deployed: a game imports what
it needs by relative path, and `build/build.mjs` bundles it into that game's
checked-in `dist/`. A built game folder needs nothing outside itself; its
source needs this folder beside it.

## Build (`build/`)

`node _kit/build/build.mjs <game> [--check]`, run from `games/` after
`npm ci`. Each game's `build.json` names:

- `programs`: tsconfig files, each type-checked by `tsc --noEmit`. A game
  keeps a DOM-free program (engines, sims: `lib: ["ES2022"]`) and a DOM
  program, so pure code cannot reach for the page.
- `entries`: `{ in, out, format }`, bundled by esbuild to `dist/<out>.js`
  with a linked source map. `esm` for modules, `iife` for classic scripts.
- `versions`: `{ CONSTANT: file }`; the bundle sees `CONSTANT` as the
  file's 10-hex content hash (a `?v=` for a file the code fetches).

`--check` rebuilds in memory and fails on any stale, missing or extra file
in `dist/`. Every tsconfig extends `build/tsconfig.base.json`: strict,
`noUncheckedIndexedAccess`, `erasableSyntaxOnly` (so Node can run the
sources directly), imports written with their `.ts` extension.

A game that bundles npm packages (Preact) also gets
`dist/THIRD_PARTY_LICENSES.txt`: each package's name, version, license field
and full license text, sorted by name, built from the packages' own files. A
package without a license file fails the build. Every bundle containing npm
code starts with `/*! Third-party licenses: THIRD_PARTY_LICENSES.txt */`, and
`--check` covers the file like any other output. A game with no npm packages
gets neither.

`node _kit/build/icons.mjs <game>` renders the game's six install icons from
one drawing, `<game>/tools/icon.svg`: a 512×512 SVG with a full-bleed
`<g id="bg">` and a `<g id="art">` that stays within 256 px of the centre. Any
(192, 512) and Apple (180) icons are the drawing; maskable (192, 512) icons
keep the backdrop and scale the art by 0.8 into the safe zone; the monochrome
icon (512) is that art as a white silhouette for Android's themed icons. The
PNGs are checked in; rerun after editing the drawing. The run records the
drawing's hash in `<game>/tools/icons.json`, and `--check` (part of `npm run
check`) fails when the drawing changed without a rerun or an icon is missing;
it compares the hash, not PNG bytes, which differ between platforms. It also
fails when the icons were rendered by another `@resvg/resvg-js` version than
the installed one. Each game's `test.sh` runs the check, so `make test` fails
on a stale icon.
`install-core.php` checks each icon's size.

## Ports and adapters (`ports.ts`)

An engine never reaches for the page. It takes `Timers`, a `Clock`, an `Rng`
and its own hook interface as arguments; the page wires the browser adapters
(`ports.browser.ts`) and tests wire fakes (`test/`). This is what lets
engines type-check without DOM types and run under plain Node.

## Saved settings (`prefs.ts`)

`pref(key, fallback, codec, storage)` is one setting under its own
localStorage key, in the raw form that key already holds (`text` or
`json(guard)`), so moving a game onto it keeps every player's settings.
`subscribe` tells the UI when a value changes. Blocked or missing storage
falls back to a value that lives for the session; nothing throws.

## Score guard (`php/score-guard.php`)

`Kit\ScoreGuard` is the gate in front of a score endpoint: the Origin (else Referer) allow-list, CSRF double-submit (the header must equal the cookie), single-use run tokens that expire, per-client rate limits keyed by an HMAC of the address (`startRun()` and `consumeRun()` count their own; `rateTake($kind, $perHour)` caps any other endpoint), and three-letter initials (`initials()`: `[A-Za-z]{3}` in, `[A-Z]{3}` out; `coerceInitials()` for rows stored before that rule). It reads only the keys in `ScoreGuard::CONFIG_KEYS`, checked by `ScoreGuard::validateConfig()`; a game's config may hold more. The blocked words are one list, `blocked-initials.json`: `ScoreGuard` uses it when a game's config has no `blockedInitials` (`ScoreGuard::OPTIONAL_KEYS`), and `initials.ts` exports it as `BLOCKED_INITIALS` with `validInitials()` (the `[A-Za-z]{3}` rule, uppercased, blocked words refused); `test/initials.test.ts` fails when PHP and TS disagree. A game lists `score-guard.php` and `blocked-initials.json` under `kit_php` in its `install-files.php` config, which keeps a copy of each in the game's `server/` (deny that folder in `.htaccess` and in `docker/nginx/default.conf`).

A POST endpoint must call both `originAllowed()` and `csrfOk()`: a request with neither Origin nor Referer passes the first, so the CSRF pair is what stops it.

The same file holds `Kit\StoreModes`, the one place a game's PHP takes file modes from: 0700/0600 for what only PHP writes, and for a path the deploy account also writes (a game's own `data/`) 0700/0600 when PHP runs as the deploying account, 0777/0666 when it runs as a web user every site shares. In that second case any other site's PHP on the host can read and write the game's stored files; no mode prevents it.

## Sound (`audio/core.ts`)

`createAudioCore()` is a facade over the game's one `AudioContext`. It makes
the context on the first sound, resumes it when suspended, and gives it two
buses, `sfx` and `music`, each a gain node to the speakers. `setGain` and
`setMuted` set a bus at once (a muted bus is 0, and nothing sent to it is even
made); `unlock(onReady)` is for a gesture: it resumes the context and, the
first time it runs, primes it with a silent blip and calls `onReady`.
`tone(spec, bus)` and `noise(spec, bus)` are the two envelopes every voice is
built from: an oscillator or filtered noise whose gain falls exponentially to
silence, with an optional attack and pitch or filter slide. Voices, songs and
what each setting means stay in the game. Without Web Audio, or when making
the context throws, every call is silent. Tests use `fakeAudioContext()` from
`test/audio.ts`, which records every node and parameter call.

## The page's life (`page-life.ts`)

`followPage({ doc, win }, { hide, show, close })` follows the page: hidden
(`visibilitychange`), frozen (`freeze`) or leaving (`pagehide`) calls `hide`;
visible again (`visibilitychange`, `resume`, `pageshow`, only while the
document is not hidden) calls `show`; a `pagehide` that will not come back
from the back/forward cache also calls `close`. A page that starts hidden
hides at once. Each game decides what going quiet means: Tankity suspends its
sound and pauses its media; Cylon pauses the run as How to Play does and
holds its sound.

## Components (`ui/`)

Preact components every game draws its overlays with. A page keeps an empty
mount point; the game's module renders a component into it with a finished
view of its state and callbacks, and redraws when the state changes.

- `Dialog`: a modal panel in its veil. `open` shows it; on opening it focuses
  `focusId` (or its first enabled button that neither is nor sits inside
  anything `hidden` in the panel, else the panel itself), on closing it gives
  focus back. While open it is `aria-modal`, and Tab and Shift+Tab wrap
  inside the panel: focus never reaches the page behind the veil, and focus
  found there is brought back in. Q (the back key) and
  a click on the veil (one that also began there) call `onDismiss`; a game
  whose own key router already handles Q should not pass `onDismiss`. Q
  typed into a box is a letter, and an open dialog stops Q there, so the game
  under it never also acts on it. Escape does nothing.
  Focus returns to what had it, or to the kit `Button` that opened the
  dialog. The game passes its own ids and classes, so its CSS and browser
  specs keep working.
- `Button`: blurs itself before calling `onClick`, so the key that pressed it
  cannot press it again; `keyLabel` adds a `KeyChip`.
- `Panel`: a section named by its `<h2>`.
- `KeyChip`: one key as a `<kbd class="key-chip">`; the game styles it and
  reads the label from its key table. `at` records the key-table slot as
  `data-keyhint`; `decorative` hides a chip that sits beside words already
  naming the action from screen readers.

## Installed apps (`app.ts`)

Each game installs as its own app (its manifest asks for full screen, then
standalone). `isInstalled(env)` reads the display mode (or iOS's
`navigator.standalone`); `enterFullscreen(env, el)` asks once and reports
whether it worked; `exitApp(env)` is every game's Quit: an installed app asks
to close its window, and where that does nothing within `CLOSE_WAIT_MS`, or in
a browser tab (never closed), it leaves full screen and answers `'title'` or,
for an installed app, `'title-with-hint'`: the game then shows its title card
and, with the hint, `EXIT_HINT`. Pages pass `browserAppEnv()`; tests pass a
fake environment and a manual clock.

## The back key (`keys.ts`)

Q closes whatever is open in every game but one: `isBackKey(ev)` is Q in either
case with no Ctrl, Cmd or Alt and nothing being composed, and `typesText(target)`
says when Q is a letter instead (a box that takes text). A held Q acts once:
callers ignore `ev.repeat`. Crete is the exception: with nothing open, Q is Quit
there, and Q is back only for the install steps and the Share field. No game listens for
Escape and no hint names it: Safari and Firefox always leave full screen on
Esc, and no page can stop them (`tankity/test/fullscreen.test.ts` fails on a
binding, listener or visible hint that asks for it).

Esc in full screen: the browser takes it to leave. Where it can, a game holds it with
`holdEscape(!!document.fullscreenElement, topKeyLock(window), warn)` on every
`fullscreenchange`, so a habitual tap does nothing and only holding Esc leaves.
`topKeyLock` is the top-level page's Keyboard Lock, because Chrome refuses
`lock()` inside a frame and the `/play/` pages run each game in one; a refusal
goes to `warn`. Keyboard Lock is Chromium's only: in Safari and Firefox Esc
always leaves full screen. Only the Fullscreen toggle and Quit may call
`exitFullscreen` (`tankity/test/fullscreen.test.ts`).

## Install and Share (`install.ts`, `ui/install-bar.tsx`)

`createInstall(env, setup, onChange)` decides what the Install and Share
buttons show; the browser is a port (`InstallEnv`: the held-back install
prompt, `appinstalled`, whether the page runs installed, the platform, whether
it is framed, `navigator.share`, the clipboard, navigation, timers), so tests
pass a fake and `browserInstallEnv()` is the real one. Chromium gets Install
only while a held-back `beforeinstallprompt` is in hand, and a click spends it;
iOS, which has no install API, gets Install always, opening the "Tap Share,
then Add to Home Screen" steps; other browsers get none; an installed app never
does. `?install` highlights the button, or on iOS opens the steps, and never
prompts by itself.

Chromium offers to install from a page outside the manifest's scope
(`OUT_OF_SCOPE_PROMPTS`, measured in Chrome), so the site's `/play/<id>/`
pages prompt themselves. iOS saves the page it is on, so on a site page its
Install opens the game's own page with `?install`, where the steps open. Share
uses Web Share, then the clipboard ("Link copied"), then a selectable field; a
cancelled share sheet is no error.

`ui/install-bar.tsx` draws it: `#install-btn` (`kit-install-asked` when
highlighted), `#share-btn`, `#share-status` ("Link copied"), `#share-url` (the
address to copy by hand) and the steps dialog `#install-steps` on the kit's
`Dialog` (focus moves in and back; Q closes it). `mountInstallBar(root,
setup, env)` wires it to the browser and adds its stylesheet once, first in
`<head>`; a page restyles it through `--kit-install-accent` or its own rules.
Each page game builds `install-page.ts` as `dist/install.js` (an entry in its
`build.json`): the site's `/play/<id>/` page loads it to fill `#play-install`,
and the game's own page loads it to show a corner bar when the address has
`?install`.

## Tests (`test/`)

Unit tests are `*.test.ts` files on `node:test`. `games/units.sh` runs the
kit's (`test/`, `build/`) and every game's (`<game>/test/`, for each folder
with a `build.json`) in one `node --test`, which runs the files in parallel;
it expands each folder's glob itself and fails on one that matches no file.
`make test` runs it after every `games/*/test.sh`. Tests import sources
directly (`../src/engine.ts`): Node strips the types, and nothing is compiled.
Each folder's `tsconfig.test.json` is its test program, checked at full
strictness with `@types/node`: the kit's by `_kit/test.sh`, a game's as one of
the `build.json` programs, so `build.mjs <game> --check` fails on a type error
in a test. Tests use no `any`, `@ts-ignore` or `@ts-nocheck`; a deliberately
partial fixture is built by a typed helper or `satisfies`, and `as unknown as`
needs a one-line reason. `test/typed-tests.test.ts` is the guard: it fails on
a `*.test.mjs`, a test program missing or left out of `build.json`, an escape
hatch in a test, a `test.sh` that runs `node --test`, or a `units.sh` without
its zero-files check. Doubles:
`manualClock()` (timers that fire only on `advance`), `mulberry32(seed)`,
`recorder()`, `memoryStorage()`, `throwingStorage()`. Tests use `test()`
and `assert` directly; PHP tests are plain PHPUnit `TestCase`s.

Components are tested in Node: `importTsx(import.meta.dirname, { name: '../src/ui/x.tsx' })`
bundles `.tsx` with esbuild (preact left external, so the test and the
components share one copy), and `dom-stub.ts` is a small DOM to render into:
`makeEl`, `click`, `fire(el, type, extra)`, `fireDocument(type, extra)`, and
`globalThis.__focused` for the element last focused. `importTsx<M>` takes the
shape of what it loads, so the exports are typed:
`importTsx<{ help: typeof import('../src/ui/help.tsx') }>(dir, { help: '../src/ui/help.tsx' })`.
The stub is not a DOM, so it meets the real types through helpers, each one
cast made in `dom-stub.ts`: `installDocument()`, `renderTarget(el)` for
preact's `render`, `asElement(el)`, and `childEl`, `elementOf`, `byId`,
`maybeById` and `walk` to read the tree. `test/audio.ts` does the same for
the fake context: `asAudioContext`, `asAudioNode`, and `nodesOf`/`nodeOf`/
`gainAt` to read the nodes it made.
