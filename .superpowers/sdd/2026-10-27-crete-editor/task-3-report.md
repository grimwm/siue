# Task 3 report
Implemented: Difficulty.line (lineText of shortest line, '' unsolved); hardPieces(level); solver-host fromCache rejects measures without string line.
TDD: RED `node --test crete/test/difficulty.test.ts` -> SyntaxError, no export hardPieces (fail 1). GREEN after impl: pass 40 fail 0.
Full: bash units.sh pass 3334 fail 0 skipped 1; sh crete/test.sh clean after rebuild (dist rebuilt, install-files, site-versions, site-game-pages; generated files committed).
Files: src/puzzle/difficulty.ts, src/solver-host.ts, test/difficulty.test.ts, dist/*, index.html, sw.js.
Self-review: cache.ts imports only types, no cycle. Existing pinned-difficulty tests got `line` added. "clone machines not counted above" entry counts machines whose template is neither block nor a hazard: always 0 today. Buttons count brown, red and the `_` toggle button.
Concerns: none.

## Fix round 1
Changes: hardPieces keys/doors entry renders only the present half (sort count still keys+doors); new tests: one-sided keys/doors, singular of each (key+door sorts first since its count is 2), hazard-template machine + tie order; solver-client test that a cached measure without `line` is searched again and one with it is served.
Command: `node --test crete/test/difficulty.test.ts crete/test/solver-client.test.ts` -> all pass, 0 fail; `sh crete/test.sh` clean after rebuild. Rebuilt dist/index/sw and committed.
