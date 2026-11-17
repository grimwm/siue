### Task 9: Try it

**Files:**
- Modify: `src/editor/editor.ts`, `src/main.ts`
- Test: `test/editor-ui.test.ts`

**Interfaces:**
- Consumes: `Levels.outside`, `Levels.line`, `backToEditor` (Task 7); `Editor` (Task 8).
- Produces: `main.ts`'s `tryLevel(level: Level, text: string, line: readonly Action[] | null): void`. It opens the level as an outside level of kind `'try'`, with the line from the last Check when that check is for this exact text.

- [ ] **Step 1: Write the failing tests:**
  - `Try it opens the level on the game screen with its start card`.
  - `Back to the editor returns to the same draft and history`.
  - `an unassisted win records the author's best for that text`.
  - `a hinted win records none`.
  - `an edit after a win forgets the best`, because the best is keyed by `toText(d, true)`.
  - `P with no player-reachable problem opens Try it; the editor layer closes`.
- [ ] **Step 2:** Run. Expect FAIL.
- [ ] **Step 3: Implement.** P and the **Try it** button call `tryIt`.
  - `main.ts` closes the editor layer and opens the level through the queued scratch path with `outside` and `line` set.
  - `backToEditor` stops the game and reopens the editor layer on its draft.
  - The game's `progress`-recording win hook is replaced, for a try, by the editor's best map: an unassisted won run's `moves`.
- [ ] **Step 4:** Run, then `bash units.sh`. Expect PASS.
- [ ] **Step 5: Commit** `Crete: Try it plays the level on the game screen`.

