### Task 3: The line in a measure, and what makes a level hard

**Files:**
- Modify: `src/puzzle/difficulty.ts`, `src/solver-host.ts` (its measure cache check)
- Test: `test/difficulty.test.ts`

**Interfaces:**
- Produces:
  - `Difficulty.line: string`: the shortest line as `lineText`, `''` when not solved;
  - `export function hardPieces(level: Level): string[]`.

- [ ] **Step 1: Write the failing tests:**
  - `measure keeps the shortest line`: for trials 1, 9 and 10, `lineOf(measure(lv).line)` replays from `initial(lv)` to a win, and its length equals `d.shortest`.
  - `an unsolved measure has an empty line`.
  - `hardPieces names the pieces by how many there are`. On a level with 3 blocks, 1 block machine, 2 keys, 2 doors and 1 Harpy, it returns `['4 blocks', '2 keys and 2 doors', '1 hazard']`.
  - `hardPieces skips what the level does not have`: a plain level gives `[]`.
- [ ] **Step 2:** Run `node --test crete/test/difficulty.test.ts`. Expect FAIL.
- [ ] **Step 3: Implement.**
  - `measuring` sets `line: r.solved ? lineText(r.line) : ''`. Import `lineText` from `cache.ts`; if that makes an import cycle, move `lineText` and `lineOf` into a new `src/puzzle/line.ts` and re-export them from `cache.ts`.
  - The host's `fromCache` for `measure` rejects a cached difficulty with no string `line`, so results cached before this change are searched again.
  - `hardPieces` returns these entries, largest first, then in this order on ties:
    - blocks (objects `block` plus block-template machines);
    - keys and doors, together, counted as keys `+` doors;
    - toggle walls (`toggle-open` and `toggle-closed`);
    - hazards (level hazards plus hazard-template machines);
    - clone machines that are not counted above;
    - buttons (brown, red, toggle).
    
    Each entry is singular when its count is 1.
- [ ] **Step 4:** Run the file, then `bash units.sh`. Every Chapter 1 difficulty pin stays the same apart from the new field. Expect PASS.
- [ ] **Step 5: Commit** `Crete: a measure keeps its line; hardPieces`.

