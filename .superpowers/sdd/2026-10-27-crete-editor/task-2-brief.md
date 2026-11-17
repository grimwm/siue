### Task 2: Cache eviction

**Files:**
- Modify: `src/puzzle/cache.ts`, `src/solver-worker.ts`, `src/solver-host.ts`
- Test: `test/cache.test.ts`, `test/solver-client.test.ts`

**Interfaces:**
- Produces:
  - `export const RESULT_LIMIT = 256`;
  - `export function evictions(entries: readonly { key: string; modified: number }[], version: string | null, limit = RESULT_LIMIT): string[]`, which returns the keys to remove;
  - `ResultStore` gains optional `trim?(): Promise<void>`, which `safeResults` wraps so it never throws.

- [ ] **Step 1: Write the failing tests** in `test/cache.test.ts`:
  - `evictions removes other versions first`: given keys `solve-aaaa-<sha>` and `solve-bbbb-<sha>` with version `aaaa`, it returns the `bbbb` key even under the limit.
  - `evictions keeps the newest RESULT_LIMIT`: given 300 current-version entries with `modified` 0…299, it returns the 44 keys with `modified` 0…43.
  - `a key with no version counts as another version`: given version `aaaa`, the key `measure-<sha>` (no version part) is removed.
  - `safeResults trim swallows a throwing trim`.
  - In `test/solver-client.test.ts`: `the host trims after it caches a result`, where a store stub's `trim` is called once after a finished solve.
- [ ] **Step 2:** Run them. Expect FAIL.
- [ ] **Step 3: Implement.**
  - `evictions` parses the version as the second `-` field when there are three, sorts the rest by `modified` descending, and keeps `limit`.
  - The worker's `diskResults.trim` lists `crete-results/`, reads `getFile().lastModified` for each, and removes `evictions(…)` with `removeEntry`. It is serialized: one trim at a time, and a trim asked for while one runs is skipped.
  - The host calls `results.trim?.()` after a put and does not await it into the answer.
- [ ] **Step 4:** Run the two files, then `bash units.sh`. Expect PASS.
- [ ] **Step 5: Commit** `Crete: the result cache keeps its newest 256 entries`.

