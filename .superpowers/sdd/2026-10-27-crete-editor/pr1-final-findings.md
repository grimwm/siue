# PR 1 whole-branch review — findings to fix (one fix wave)

Branch crete-editor, range 89ae620..71c1308. Paths relative to websites/www.cs/games/crete/.

## Important

1. **Two "link level text" forms.** `toText(d, true)` (src/editor/model.ts ~120-127) writes no `title:`/`intro:` lines, while the link format (src/share/link.ts header, the plan, test/share-link.test.ts `canonical()`) uses `serialize`'s form, which always writes `title: ` and `intro: ` with empty values. Also `toText` writes `relics: N` even when N equals the grid's relic count; `serialize` omits it then. Same board → two levelCodes and two best-map keys.
   Fix: make `toText(d, true)` byte-identical to `serialize` of the same level with empty title/intro and no pages — emit `title: ` and `intro: ` lines, and omit `relics:` when the clamped value equals the grid count (check `toText(d, false)` too: it should match `serialize(toLevel(d))` exactly). Add a test: for every trial in TRIALS (pages header removed, `p` → `.`, title/intro emptied), `toText(fromLevel(parse(t)), true) === canonical(t)` (reuse/share the canonical helper). Update the editor-model sharing test to assert explicit pieces instead of the opaque regex `/title|intro|pages|secret|p/`. The `V43B` pin must stay.
2. **README describes the solver API before this PR.** README.md ~102-104 and the Difficulty list ~118: add `SolverJob.cancel()` / `CancelledError`; the cache eviction (another version's entries first, then the newest `RESULT_LIMIT = 256` by `lastModified`, trimmed after each put); `Difficulty.line` (the shortest line as move letters, '' when unsolved) and that a cached measure without a line is searched again; `hardPieces`. Current state only, never history. (The editor section and file map wait for Task 13 — but if the README has a file map listing src/ folders, add `src/share/` (link codec, opening a link) and `src/editor/` (the editor's document and undo) briefly.)

## Fix now (minor, cheap)

3. src/solver-client.ts header: the sentence about cancel vs a newer search is hard to parse and inaccurate (a replaced search rejects with a plain Error carrying the host's message, not CancelledError). Reword: a search ends by `cancel()` (its answer rejects with CancelledError) or by a newer search (its answer rejects with the host's message).
4. src/solver-host.ts header: re-wrap to the file's width (~120 columns). Host Cancelled message (~:104): `the search was cancelled`.
5. Host test: stop a running search, then cancel it → the result rejects with CancelledError and the node file is closed once.
6. src/share/link.ts: version rule `/^L[1-9][0-9]*$/` so `L0.`/`L01.` are `not-a-link`, not `newer` (~:203); add tests. Fix the `gridShape` doc comment (~:179) to mention `narrowest`.
7. test/share-link.test.ts: add tests for invalid UTF-8 bytes in the inflated payload (→ damaged), the empty `L1.` (→ damaged), and an `=`-padded fragment (→ damaged).
8. src/puzzle/cache.ts `evictions` compares the raw version with the key's middle field while `resultKey` strips non-alphanumerics: share one normalizer so both agree for any version string (an empty version means "no version" — then only age decides, as today). Add a test with a version containing `-`.
9. After `parse` in decodeLink, also check `level.rows`/`level.cols` within 3..64 (second guard independent of gridShape).
10. Add src/share/open.ts (and any other new DOM-free src/share or src/editor file not yet listed) to the tsconfig that type-checks DOM-free code (`tsconfig.json` `files`/`include` — check how src/share/link.ts got there).
11. src/solver-worker.ts header: mention the trim to RESULT_LIMIT after each put.

## Not now (recorded, can wait)
- One throwing getFile aborts a trim; trims===1 sync assertion; `startsWith('key-')`; loss test not pinning the playing guard.
