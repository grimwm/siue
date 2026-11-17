### Task 7: The game screen plays a level that is not the campaign's

**Files:**
- Modify:
  - `src/campaign/chapters.ts`: the `Levels` type;
  - `src/game.ts`: the thread on a known line;
  - `src/ui.ts`: the start card, end card and menu for a level outside the campaign;
  - `src/ui/menu.tsx`, `src/ui/end.tsx`, `src/ui/start.tsx`;
  - `src/main.ts`: `playLevel` takes the new fields.
- Test: `test/game.test.ts`, `test/ui.test.ts`

**Interfaces:**
- Produces:
  ```ts
  /** A level from outside the campaign: one the author is trying in the editor, or one a link shared. */
  export interface OutsideLevel {
    kind: 'try' | 'shared';
    /** What the start and end cards call it: the draft's title or "Your level" for 'try', the generated name for 'shared'. */
    name: string;
    /** The author's best, for 'shared'; null otherwise or when there is none. */
    best: number | null;
  }
  // in Levels:
  outside?(i: number): OutsideLevel | null;
  /** A proven winning line from the level's start, or null. */
  line?(i: number): readonly Action[] | null;
  ```
  - `MenuProps` and `EndCardProps` gain `onBackToEditor?: () => void`, shown as **Back to the editor** (ids `menu-editor` and `end-editor`) only when it is given.
  - `Controls` gains `backToEditor?(): void`.

- [ ] **Step 1: Write the failing tests.**
  - In `game.test.ts`:
    - `the thread follows a known line while the try is on it`. Give `Levels.line` trial 9's solver line and wrap `solve` with a call counter. Hint three times: `solve` is never called. Then press a move off the line, and the next hint solves.
    - `undo back onto the line uses it again`.
  - In `ui.test.ts`, for an `outside` level:
    - `the start and end cards name an outside level`.
    - `a shared win says whether it beat the author`: `You beat the author's 54.` or `The author's best is 54.`.
    - `an outside level offers no next level and no levels list`.
    - `an outside win records no progress`.
    - `Back to the editor shows in the menu and on the end card only for a try`, and it calls `backToEditor`.
    - A campaign level's cards are unchanged; the existing tests stay green.
- [ ] **Step 2:** Run. Expect FAIL.
- [ ] **Step 3: Implement.**
  - The game keeps `played: Action[]`: a move pushes, undo pops, and restart and open clear it. `line()` returns `known.slice(played.length)` while `played` is a prefix of `known`.
  - `ui.ts` reads `levels.outside?.(g.trial)` wherever it now reads `LEVEL_IDS`, `chapterOf` or `CHAPTERS` for the level in play. An outside level has:
    - kicker `Your level` for a try or `Shared level` for a shared one;
    - `hasNext` false;
    - no chapter card;
    - no pages line.
  - An outside level is scratch: `levels.scratch` is true for it.
- [ ] **Step 4:** Run, then `bash units.sh`. Expect PASS.
- [ ] **Step 5: Commit** `Crete: the game screen plays a level from outside the campaign`.

