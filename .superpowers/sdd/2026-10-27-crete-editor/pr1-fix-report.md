# PR 1 fix wave report (all paths under websites/www.cs/games/crete/)

1. toText link form: src/editor/model.ts toText (empty `title: `/`intro: ` when forShare; relics omitted when equal to grid count; always a blank line after head). Tests: test/editor-model.test.ts "toText for sharing is the link form of every trial..." (shared == canonical, unshared == serialize), relics-omission test, explicit-pieces sharing assertions. V43B pin unchanged and passing.
2. README.md: solver section (cancel(), CancelledError, eviction, RESULT_LIMIT, cached measure without line re-searched), Difficulty line + hardPieces, file map gained src/share/ and src/editor/. No test (docs).
3. src/solver-client.ts header reworded.
4. src/solver-host.ts header re-wrapped; Cancelled message `the search was cancelled`.
5. test/solver-client.test.ts "a stopped search can be cancelled...".
6. src/share/link.ts version regex `/^L[1-9][0-9]*$/`, gridShape comment. Tests: L0./L01./L00. in share-link.test.ts.
7. share-link.test.ts: invalid UTF-8, empty `L1.`, `=`-padded fragment (all damaged).
8. src/puzzle/cache.ts: shared `versionPart`; evictions uses it, empty normalized version = age only. Test in cache.test.ts (version with `-`).
9. link.ts: level.rows/cols 3..64 check after parse (second guard; unreachable by test since gridShape rejects first, not separately tested).
10. tsconfig.json: added src/share/open.ts (editor/model.ts, history.ts, share/* were already listed).
11. src/solver-worker.ts header mentions trim to RESULT_LIMIT.

Rebuilt dist, install-files, site-versions, site-game-pages; generated files committed.

Commands: node --test of editor-model, share-link, solver-client, cache: all pass. bash units.sh: exit 0, 3378 pass / 0 fail. sh crete/test.sh: exit 0 (after rebuild; an earlier run failed on a type error in my new test, fixed).
