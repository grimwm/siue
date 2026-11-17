# Task 1 report
Implemented CancelledError, SolverJob.cancel(), ToHost cancel; host treats cancel like a newer start (job ends, node file closes). failedJob gets a no-op cancel. Header comments updated.
RED: `node --test crete/test/solver-client.test.ts` before src change: SyntaxError, no export named 'CancelledError' (pass 0).
GREEN: same command: 20 pass, 0 fail. `bash units.sh`: 3324 pass, 0 fail. `sh crete/test.sh`: clean after rebuild.
Files: src/solver-client.ts, src/solver-host.ts, test/solver-client.test.ts, plus generated dist/*, index.html, sw.js.
Concern: host's failed message for a cancelled job now reads "...replaced it or it was cancelled" (client ignores it after cancel).
