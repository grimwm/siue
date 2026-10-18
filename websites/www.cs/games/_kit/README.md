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
- `kitCss`: `true` copies `_kit/kit.css` to `dist/kit.css` (see "The kit
  stylesheet").
- `css`: `{ in, out }` compiles a Tailwind v4 entry (`in`, a CSS file) with
  the pinned `@tailwindcss/cli` into `dist/<out>.css`, minified. The entry
  says what it scans (`@import "tailwindcss" source(none);` then `@source`
  lines), so only the classes a game's sources use are emitted. `--check`
  covers the stylesheet like a bundle.
- `css.fonts`: a folder (in the game, not shipped) with the stylesheet's
  woff2 files and `fonts.json`: `{ "fonts": [{ name, source, license,
  licenseFile, files }] }`. Each listed file is copied to `dist/fonts/` and
  each family's licence text joins `THIRD_PARTY_LICENSES.txt` after the
  package notices. The build refuses a woff2 the manifest does not list, a
  listed file that is not woff2, a missing licence file, a `url(fonts/…)`
  the manifest lacks and a listed font the stylesheet never uses. Reference
  fonts from the CSS as `url("fonts/<file>.woff2")`.

- `inlined`: package names (resolved from `games/node_modules`) that a bundled
  dependency carries prebuilt inside itself, so esbuild never sees them. Their
  licenses go into `THIRD_PARTY_LICENSES.txt` like the others; a name that is
  not installed, or has no license file, fails the build.

`--check` rebuilds in memory and fails on any stale, missing or extra file
in `dist/`. Every tsconfig extends `build/tsconfig.base.json`: strict,
`noUncheckedIndexedAccess`, `erasableSyntaxOnly` (so Node can run the
sources directly), imports written with their `.ts` extension.

A game that bundles npm packages (Preact) also gets
`dist/THIRD_PARTY_LICENSES.txt`: each package's name, version, license field
and full license text, sorted by name, built from the packages' own files. A
package without a license file (`LICENSE`, `LICENCE` or `COPYING`, with `-MIT`
or an `.md`, `.txt` or `.markdown` extension) fails the build. Every bundle containing npm
code starts with `/*! Third-party licenses: THIRD_PARTY_LICENSES.txt */`, and
`--check` covers the file like any other output. A game with fonts
(`css.fonts`) also gets its licences file, with the font notices after the
package notices and the header "Third-party code bundled into this game's
scripts, and the fonts in fonts/."; a game with no npm packages and no fonts
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
`oneOf(values, fallback)` is the codec for a setting that holds one of a fixed set of words: the stored form is the word itself, and any other stored word reads as `fallback`. `subscribe` tells the UI when a value changes. Blocked or missing storage
falls back to a value that lives for the session; nothing throws.

## Score guard (`php/score-guard.php`)

`Kit\ScoreGuard` is the gate in front of a score endpoint: the Origin (else Referer) allow-list, CSRF double-submit (the header must equal the cookie), single-use run tokens that expire, per-client rate limits keyed by an HMAC of the address (`startRun()` and `consumeRun()` count their own; `rateTake($kind, $perHour)` caps any other endpoint), and three-letter initials (`initials()`: `[A-Za-z]{3}` in, `[A-Z]{3}` out; `coerceInitials()` for rows stored before that rule). It reads only the keys in `ScoreGuard::CONFIG_KEYS`, checked by `ScoreGuard::validateConfig()`; a game's config may hold more. The blocked words are one list, `blocked-initials.json`: `ScoreGuard` uses it when a game's config has no `blockedInitials` (`ScoreGuard::OPTIONAL_KEYS`), and `initials.ts` exports it as `BLOCKED_INITIALS` with `validInitials()` (the `[A-Za-z]{3}` rule, uppercased, blocked words refused); `test/initials.test.ts` fails when PHP and TS disagree. A game lists `score-guard.php` and `blocked-initials.json` under `kit_php` in its `install-files.php` config, which keeps a copy of each in the game's `server/` (deny that folder in `.htaccess` and in `docker/nginx/default.conf`).

A POST endpoint must call both `originAllowed()` and `csrfOk()`: a request with neither Origin nor Referer passes the first, so the CSRF pair is what stops it.

The same file holds `Kit\StoreModes`, the one place a game's PHP takes file modes from: 0700/0600 for what only PHP writes, and for a path the deploy account also writes (a game's own `data/`) 0700/0600 when PHP runs as the deploying account, 0777/0666 when it runs as a web user every site shares. In that second case any other site's PHP on the host can read and write the game's stored files; no mode prevents it.

## Storage directories (`php/store-dir.php`)

`Kit\StoreDir` decides whether a place a game's PHP keeps files can be trusted. It is built with a log prefix, the exception class a refusal throws (the message is `<path> <problem>`; the log line adds the remedy) and, optionally, the `.htaccess` text. `claim($dir, $private)` creates a missing directory 0700, then refuses a symbolic link, a non-directory, an unwritable one and, when `$private`, one owned by another account or not exactly 0700. `pick($preferred, $fallback)` uses the preferred directory when PHP can write it (an unlinked one it owns is tightened to 0700) and it can hold its deny file, else the private fallback. `claimFile($path)` is for a file PHP keeps straight in a shared directory such as `/var/tmp`: a link, a non-file, a hard-linked file or another account's file is refused, and one of ours open to others is made 0600. `verifyOpened($fh, $path)` follows every fopen of such a file, because another account can plant a link between the claim and the open: the handle must be a regular file owned by PHP's user with no other hard links, and the path must still name it (not a link, same device and inode), else the handle is closed and the open refused. `openExisting($path, $mode, $initial)` is the open itself: a missing file is made with an exclusive `'x'` open (born with `$mode` and `$initial`), every other open is `'r+'`, so nothing creates or truncates through a link, and the handle comes back verified; a caller rewrites only through it, under `flock`. `ScoreGuard`'s run store and Cylon's scores file open this way, so `score-guard.php` requires `store-dir.php` and a game ships both. `denyHttp($dir)` writes the deny file. Tankity uses `claim` and `pick`; Cylon keeps its own file order (`data/scores.json`, else `/var/tmp/<storageKey>-scores.json`) and adds the link check on the first and `claimFile` on the second; it opens its scores file through `openExisting`. Tankity's SQLite file lives in a directory it claimed (0700, owned by PHP) or an operator-set `data_dir`, so it has no shared-directory open to verify. A game ships it as `server/store-dir.php` through `kit_php`.

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
what each setting means stay in the game.

Beyond the plain envelope, a tone takes `filter` (a `FilterSpec`: `type`,
`freq`, and an optional slide `slideTo` over `slideDur`, `slide: 'linear'` for
a straight line, exponential otherwise) between the oscillator and its gain,
`stopPad` (seconds the oscillator outlives `dur`, default 0.02) and `at` (an
absolute context time to start at, instead of `when` seconds from now; `at`
exists so a game that schedules ahead on `currentTime` adds no rounding).
`noise` takes `filterQ`, `fadePower` (the `'fade'` burst falls along
`(1 - i/length)` to that power; 1 is the straight fade) and `at`.
`voice(spec, to)` is for layers that share one filter and one gain: `oscs`
(`type` and `freq` each), an optional `filter`, an `envelope` of
`{ ramp: 'linear' | 'exp', to, at }` steps after a start at silence, `dur`,
`stopPad`, `when` or `at`. The oscillators each start at the voice's start
and stop at `dur + stopPad`. Without Web Audio, or when making
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
holds its sound; Crete stops its play-through and hint timers (`pause()`, `resume()`) and re-arms them on show. Tankity's own `visibilitychange` listeners (the on-screen report and toast/poll catch-up in `main.ts`, the room catch-up in `room.ts`) stay outside it: they act on the visibility change alone, and `followPage` would also fire them on `freeze`, `resume`, `pageshow` and `pagehide`.

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
- `KeyChip`: one key as a `<kbd class="kit-key-chip">` (styled by the kit
  stylesheet when the game links it; a game passing its own `class` styles
  that), with the label read from the game's key table. `at` records the key-table slot as
  `data-keyhint`; `decorative` hides a chip that sits beside words already
  naming the action from screen readers.

## The kit stylesheet (`kit.css`)

An opt-in sheet for kit components. Everything in it is the kit's: classes
start with `kit-`, custom properties with `--kit-`. No selector is bare
(`body`, `button`, `kbd`, `*`), so linking it changes nothing until an element
wears a `kit-` class; a game's own look stays in the game's CSS.

To opt in, set `"kitCss": true` in the game's `build.json` and run
`node _kit/build/build.mjs <game>`, which writes `<game>/dist/kit.css`. Link
it before the game's own CSS (`<link rel="stylesheet" href="dist/kit.css?v=...">`),
add `dist/kit.css` to `versioned` in `tools/install-files.php` (a page game's
`precache_dirs: ['dist']` already precaches it), and run the generators.
Cylon, mounted on the site page, is linked from the site's `index.html` and
`SITE_VERSIONS_REFS` in `tools/site-versions.php`. The install bar's own CSS
stays injected by `install-page.ts` and does not need the sheet.

| Name | What it styles |
|---|---|
| `.kit-key-chip` | a `KeyChip`: keycap border, radius, padding, monospace, centered |
| `--kit-key-bg`, `--kit-key-color`, `--kit-key-border`, `--kit-key-font` | its colors and font; defaults suit a dark page and follow `currentColor` |
| `.kit-key-tab` | a `KeyChip variant="tab"`: a small bold label in a dark rounded box pinned to a positioned button's top corner; hidden on touch screens (`hover: none` or `pointer: coarse`), in a frame under 760px wide (`@container`), and when empty |
| `--kit-key-tab-position`, `-top`, `-right`, `-height`, `-padding`, `-size`, `-font`, `-color`, `-bg`, `-border`, `-edge`, `-radius`, `-shine` | its placement and look; the defaults are Tankity's key caps |

`:where()` gives `.kit-key-chip` zero specificity, so any rule of the game's
(`.cylon-help-body kbd`, `.inv kbd`) overrides it. `.kit-key-tab` has zero specificity too. A game that wants a tab in flow sets `--kit-key-tab-position: static` on it; a tab's `class` is added after the kit class (a chip's replaces it). The sheet holds only rules
that two or more games would repeat; each game's colors, fonts and layouts
stay in the game. `test/kit-css.test.ts` fails on any selector without a
`.kit-` class.

## Build-time tools

Run by the build, never shipped (only their output is): `esbuild` (MIT),
`typescript` (Apache-2.0), `@resvg/resvg-js` (MPL-2.0), `tailwindcss` and
`@tailwindcss/cli` (MIT; the compiled CSS carries Tailwind's own licence
banner), `lightningcss` (MPL-2.0; Tailwind's CSS minifier, a transitive
dependency of the CLI), `@types/node` (MIT). All but `lightningcss` are
exact pins in `games/package.json`.

## Seeded generator (`rng.ts`)

`hashSeed(string)` and `mulberry32(seed)` are the kit's seeded generator; no
game imports them now (Tankity's initials test uses `test/rng.ts`), and a
change to either changes every sequence a seed gives.
`test/rng.ts` re-exports `mulberry32` for tests, and `test/rng-compare.test.ts`
shows it agrees bit for bit with an independently written mulberry32, over
edge, negative and 10,000-seed ranges. Tankity's own `hashSeed` and
`mulberry32` are a TS/PHP parity twin in its sim and do not come from here.

## Installed apps (`app.ts`)

Each game installs as its own app (its manifest asks for full screen, then
standalone). `isInstalled(env)` reads the display mode (or iOS's
`navigator.standalone`); `enterFullscreen(env, el)` asks once and reports
whether it worked; `exitApp(env)` is every game's Quit: an installed app asks
to close its window, and where that does nothing within `CLOSE_WAIT_MS`, or in
a browser tab (never closed), it leaves full screen and answers `'title'` or,
for an installed app, `'title-with-hint'`: the game then shows its title card
and, with the hint, `EXIT_HINT`. `toggleFullscreen(env, el)` is the Fullscreen
toggle: it enters or leaves and answers `'entered'`, `'left'`, `'unsupported'`
(no native enter-and-leave pair) or `'refused'` (the browser denied entering),
with the request made before its first await so it stays inside the player's
tap. `browserAppEnv()` includes `withWebkitFullscreen`, the prefixed API as the
fallback for entering, leaving (`webkitExitFullscreen`) and reading the
fullscreen element (older Safari and iPadOS); a browser is supported when it
has a way in and a way out, standard or prefixed. Only the toggle and
`exitApp` may leave full screen, and Esc never does
(`tankity/test/fullscreen.test.ts` scans the kit too). Pages pass
`browserAppEnv()`; tests pass a fake environment and a manual clock.

## The back key (`keys.ts`)

Q closes whatever is open: `isBackKey(ev)` is Q in either
case with no Ctrl, Cmd or Alt and nothing being composed, and `typesText(target)`
says when Q is a letter instead (a box that takes text). A held Q acts once:
callers ignore `ev.repeat`. Crete's key router owns Q: with nothing open it opens the menu, and it closes whatever card is open; the install steps and the Share field own Q while they are open. It asks `isBackKey` for Q; Cylon's ability keys skip a typing target through `typesText`. No game listens for
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
its zero-files check. `nth(list, i)` and `last(list)` (`test/nth.ts`) read an element and fail the test, naming the index, when it is not there. Doubles:
`manualClock()` (timers that fire only on `advance`), `mulberry32(seed)`,
`recorder()`, `memoryStorage()`, `throwingStorage()`. Tests use `test()`
and `assert` directly; PHP tests are plain PHPUnit `TestCase`s, and one that needs scratch files uses the `Kit\Tests\TempDir` trait (`php/tests/TempDir.php`, required by path): `makeTempDir($prefix)` makes a unique private directory, `removeTree($path)` deletes it whole (a symlink is unlinked, never followed).

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
