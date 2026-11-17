### Task 10: Check

**Files:**
- Create: `src/editor/check.ts` (DOM-free state), `src/editor/check-panel.tsx`
- Modify: `src/editor/editor.ts`
- Test: `test/editor-check.test.ts`

**Interfaces:**
- Consumes: `startSearch`, `SolverJob.cancel` (Task 1); `Difficulty.line`, `hardPieces`, `sharedProblems` (Task 3).
- Produces:
  ```ts
  export type CheckState =
    | { kind: 'none' }
    | { kind: 'running'; text: string; report: Report | null; stopped: boolean }
    | { kind: 'done'; text: string; d: Difficulty }
    | { kind: 'failed'; text: string; message: string };
  export interface Checker { readonly state: CheckState; check(text: string): Promise<Difficulty | null>; stop(): void; keepSearching(): void; edited(text: string): void }
  export function createChecker(start: (text: string) => SolverJob, changed: () => void): Checker;
  export function checkLines(s: CheckState, current: string, level: Level): { lines: string[]; stale: boolean; shareable: boolean };
  ```
  `check` resolves `null` when cancelled.

- [ ] **Step 1: Write the failing tests**, with a fake `start` whose job resolves on demand:
  - `an edit cancels the running check and its answer is dropped`.
  - `undo to the checked text makes the result current`.
  - `stop pauses; keep searching resumes`.
  - `a second check of the same text while done reuses the result`.
  - `checkLines` for the following:
    - a winnable chase level, with lines `Winnable: quickest win 54 moves`, `Situations searched: 24,086`, `Chase: the Minotaur adds 22 moves; ignoring him loses` and `Shareable`;
    - a solo level;
    - an unwinnable one: `This level cannot be won.`;
    - a capped one: `The solver could not finish. What makes it hard here: 4 blocks, 1 hazard. Fewer blocks help most.`, with the last sentence only when blocks lead;
    - a winnable but easy one: `Not shareable yet:` followed by `sharedProblems` lines.
- [ ] **Step 2:** Run. Expect FAIL.
- [ ] **Step 3: Implement.**
  - The panel shows the progress bar while running: an indeterminate bar, plus `Searched N situations · trying lines of at least M moves`, where N is `report.stored` and M is `report.bestF`. When `storage` is `memory` it adds `(in memory only)`.
  - The panel has **Stop** and **Keep searching** buttons.
  - The `C` key and the **Check** button call `check(toText(draft, true))`. Every committed edit calls `edited`.
  - A stale result shows greyed with `Out of date: press Check.`
- [ ] **Step 4:** Run. Expect PASS.
- [ ] **Step 5: Commit** `Crete: Check proves and rates a level in the editor`.

