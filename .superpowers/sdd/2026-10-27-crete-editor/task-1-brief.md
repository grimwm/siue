### Task 1: Stop that cancels a search

**Files:**
- Modify: `src/solver-client.ts`, `src/solver-host.ts`
- Test: `test/solver-client.test.ts`

**Interfaces:**
- Produces:
  - `export class CancelledError extends Error` (message `the search was cancelled`);
  - `SolverJob.cancel(): void`;
  - `ToHost` gains `{ type: 'cancel'; id: number }`.

- [ ] **Step 1: Write the failing tests** in `test/solver-client.test.ts`, using the in-process host the file already wires as a `WorkerLike`:
  - `cancel rejects the result with CancelledError at once`: start a `solve` on trial 10, call `job.cancel()`, then `await assert.rejects(job.result, CancelledError)`.
  - `a cancelled search reports no more progress`: count progress calls after `cancel()`; after the host's next pause, the count is unchanged.
  - `cancel closes the node file`: in the host test, an `openFile` stub's `close` has been called once after `cancel`.
  - `a search started after a cancel runs`: cancel one, start another, and its result resolves solved.
- [ ] **Step 2:** Run `node --test crete/test/solver-client.test.ts`. Expect FAIL: `cancel` is not a function.
- [ ] **Step 3: Implement.**
  - Client: `cancel()` deletes the id from its worker's route map, posts `cancel`, and rejects through the pending promise's reject (keep a reference to it). `failedJob` gets a no-op `cancel`.
  - Host: `cancel` for the current id sets `cancelled` and wakes the job, exactly as a newer `start` does.
  - Update the client's header comment: a search ends by `cancel` or by a newer search.
- [ ] **Step 4:** Run the file again. Expect PASS. Then run `bash units.sh`.
- [ ] **Step 5: Commit** `Crete: a search can be cancelled`.

