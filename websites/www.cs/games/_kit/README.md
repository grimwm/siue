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

## Components (`ui/`)

Preact components every game draws its overlays with. A page keeps an empty
mount point; the game's module renders a component into it with a finished
view of its state and callbacks, and redraws when the state changes.

- `Dialog`: a modal panel in its veil. `open` shows it; on opening it focuses
  `focusId` (or its first visible, enabled button, else the panel itself),
  on closing it gives focus back; Escape and
  a click on the veil (one that also began there) call `onDismiss`; a game
  whose own key router already handles Escape should not pass `onDismiss`.
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

## Tests (`test/`)

Unit tests are `*.test.mjs` files run with `node --test`. They import
sources directly (`../src/engine.ts`): Node strips the types. Doubles:
`manualClock()` (timers that fire only on `advance`), `mulberry32(seed)`,
`recorder()`, `memoryStorage()`, `throwingStorage()`. `check(name, ok,
detail)` runs an older PASS/FAIL script under `node:test` unchanged, one
test per check; write new tests with `test()` and `assert` directly. PHP
has the same bridge: `php/testing/LegacyCheckCase.php`.

Components are tested in Node: `importTsx(import.meta.dirname, { name: '../src/ui/x.tsx' })`
bundles `.tsx` with esbuild (preact left external, so the test and the
components share one copy), and `dom-stub.mjs` is a small DOM to render into:
`makeEl`, `click`, `fire(el, type, extra)`, `fireDocument(type, extra)`, and
`globalThis.__focused` for the element last focused.
