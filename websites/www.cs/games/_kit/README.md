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

## Tests (`test/`)

Unit tests are `*.test.mjs` files run with `node --test`. They import
sources directly (`../src/engine.ts`): Node strips the types. Doubles:
`manualClock()` (timers that fire only on `advance`), `mulberry32(seed)`,
`recorder()`, `memoryStorage()`, `throwingStorage()`. `check(name, ok,
detail)` runs an older PASS/FAIL script under `node:test` unchanged, one
test per check; write new tests with `test()` and `assert` directly. PHP
has the same bridge: `php/testing/LegacyCheckCase.php`.
