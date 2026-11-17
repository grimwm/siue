# Task 2 report: cache eviction

Commit 9728584 "Crete: the result cache keeps its newest 256 entries".

Implemented: `RESULT_LIMIT`, `evictions`, optional `ResultStore.trim`, `safeResults.trim` (never throws) in cache.ts; `diskResults.trim` in solver-worker.ts (serialized by a flag, skipped while running, lists crete-results/*.json, lastModified, removeEntry); host calls `void results.trim?.()` after put (solver-host.ts). The worker's trim uses its own `version` promise. An unknown version (null) evicts nothing for version reasons, only by age.

TDD: RED `node --test crete/test/cache.test.ts crete/test/solver-client.test.ts` -> "does not provide an export named 'RESULT_LIMIT'", cache.test.ts not ok, "the host trims after it caches a result" not ok (pass 20 fail 2). GREEN same command -> pass 31 fail 0.
Full: `bash units.sh` pass 3330 fail 0; `sh crete/test.sh` rc 0 (after rebuild). Dist, index.html, sw.js regenerated and committed.

Self-review: the null-version rule is my addition (extra test). Trim in the worker is untested (needs OPFS). Trim is not awaited, so a trim may overlap the next put; harmless.
