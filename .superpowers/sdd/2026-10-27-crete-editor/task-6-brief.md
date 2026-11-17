### Task 6: The editor's document and its undo

**Files:**
- Create: `src/editor/model.ts`, `src/editor/history.ts`
- Test: `test/editor-model.test.ts`

**Interfaces:**
- Produces from `model.ts`:
  ```ts
  export type Brush =
    | { kind: 'terrain'; t: Terrain } | { kind: 'object'; o: ObjectKind }
    | { kind: 'player' } | { kind: 'minotaur' } | { kind: 'erase' }
    | { kind: 'hazard'; h: HazardKind; dir: Dir }
    | { kind: 'machine'; template: Template; dir: Dir }
    | { kind: 'page'; id: string };             // owner only
  export interface Draft {
    readonly rows: number; readonly cols: number;
    /** One legend character per cell, row-major. */
    readonly cells: readonly string[];
    /** Per cell: a hazard's facing, a machine's `<template>-<dir>`, a page's id; else null. */
    readonly extra: readonly (string | null)[];
    readonly hearts: number;
    /** null: every relic on the board. */
    readonly relics: number | null;
    readonly id: string; readonly title: string; readonly intro: string;   // owner only
  }
  export const MIN_SIDE = 3, MAX_SIDE = 64;
  export function newDraft(rows: number, cols: number): Draft;  // wall border, P at (1,1), E at (rows-2, cols-2)
  export function paint(d: Draft, at: Cell, b: Brush): Draft;   // returns d itself when nothing changes
  export function resize(d: Draft, rows: number, cols: number): Draft;
  export function toText(d: Draft, forShare: boolean): string;  // forShare: no title, intro, pages (p → .)
  export function fromLevel(lv: Level): Draft;
  export function toLevel(d: Draft): Level;                      // parse(toText(d, false))
  ```
- Produces from `history.ts`:
  ```ts
  export const UNDO_LIMIT = 50;
  export interface History<T> { readonly now: T; readonly canUndo: boolean; readonly canRedo: boolean }
  export function startHistory<T>(t: T): History<T>;
  export function commit<T>(h: History<T>, t: T): History<T>;   // same object as now: h unchanged
  export function undoH<T>(h: History<T>): History<T>;
  export function redoH<T>(h: History<T>): History<T>;
  ```

- [ ] **Step 1: Write the failing tests:**
  - `a draft always parses`: paint every brush on every cell of a 5 × 5 draft in turn, and `toLevel` never throws.
  - `painting the player moves him`.
  - `erase on the player does nothing`.
  - `painting over a hazard or machine clears its extra`.
  - `toText for sharing drops title, intro and pages`.
  - `fromLevel(parse(text)) round-trips every trial`: run `toText(…, false)` on the result and `parse` it again; `serialize` of the two is equal.
  - `resize keeps the top-left`: new cells are floor, and a player cut off is put back at (0,0)'s nearest floor in reading order.
  - `resize clamps to 3..64`.
  - History: `a stroke is one edit`. The page commits once per stroke; the test commits the final draft of a 64-cell drag once and undoes it to the start in one step.
  - `the 51st edit drops the first`.
  - `redo after a new edit is gone`.
- [ ] **Step 2:** Run `node --test crete/test/editor-model.test.ts`. Expect FAIL.
- [ ] **Step 3: Implement.** The draft has exactly one `P` by construction; the Minotaur is optional.
  - Relics set above the count on the grid are clamped by `toText`.
  - The relics header is written only when `relics !== null`.
  - Facing and machine headers are written in reading order from `extra`.
- [ ] **Step 4:** Run. Expect PASS.
- [ ] **Step 5: Commit** `Crete: the editor's level document and undo`.

---

# Pull request 2: the editor (`crete/editor-page`)

