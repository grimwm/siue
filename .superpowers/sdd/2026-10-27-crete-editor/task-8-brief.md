### Task 8: The editor view, the board and the palette

**Files:**
- Create:
  - `src/editor/editor.ts`: the view, which holds the canvas, painting, fitting and the keys;
  - `src/editor/palette.tsx`;
  - `src/editor/keys.ts`.
- Modify:
  - `index.html`: `#editor-root`, holding its own canvas `#editor-stage`;
  - `src/layers.ts`: an `editor` layer;
  - `src/ui.ts`: while `editor` is the top layer, every key goes to the editor's handler;
  - `src/main.ts`: `#edit` opens the editor, at start and on `hashchange`;
  - `src/ui/title.tsx` and `src/keys.ts`: **Make a level** (`#title-editor`, key E), which opens the editor;
  - `game.css`.
- Test: `test/editor-ui.test.ts` (the DOM stub, as in `test/ui.test.ts`), `test/keys.test.ts`, `test/ui.test.ts`

**Interfaces:**
- Consumes: `Draft`, `Brush`, `paint`, `History` (Task 6); `drawList`, `Atlas` (`board-plan.ts`); `createBoard`; `cellFor`.
- Produces:
  - `export const EDITOR_KEYS: Record<EditorAction, KeyDef>` in `src/editor/keys.ts`, where `EditorAction` is `'undo' | 'redo' | 'try' | 'check' | 'rotate'`;
  - `export interface PaletteProps { brush: Brush; owner: boolean; onPick(b: Brush): void; onRotate(): void }`;
  - `export interface Editor { open(draft?: Draft): void; close(): void; readonly draft: Draft; key(ev: KeyboardEvent): boolean }`;
  - `export function createEditor(deps: { root: HTMLElement; atlas: Atlas; image: HTMLImageElement; tryIt(level: Level, text: string): void; changed(): void }): Editor`;
  - `window.__creteTest.editor`: the `Editor`, plus `load(text: string): void`, extended by later tasks.

- [ ] **Step 1: Write the failing tests.**
  - The palette lists one button per brush, with ids `brush-<terrain|object|hazard|machine…>`. The hazard and machine buttons show their direction, and `O` rotates the brush.
  - `the page brush only with the owner flag`.
  - `EDITOR_KEYS never binds escape`.
  - `Make a level on the title card opens the editor layer`.
  - `game keys do nothing while the editor is open`: an arrow key moves no figure.
  - `Q in the editor closes it to the title card`.
- [ ] **Step 2:** Run. Expect FAIL.
- [ ] **Step 3: Implement.**
  - The board draws `drawList(initial(toLevel(draft)), restingFigures, atlas, now)` on `#editor-stage`. The list is recomputed only when the draft changes.
  - Mouse down paints, a drag paints every cell it crosses, and mouse up commits one history entry. Touch does the same with one finger.
  - A size bar holds rows and cols number inputs (3–64) and Resize.
  - Hearts (1–99) and relics needed ("all", or 0..count).
  - At widths under 700 px the palette is a drawer, opened by a **Pieces** button.
  - A big board scrolls as in `ui.ts`'s fit.
  - Opening with no draft starts `newDraft(12, 12)`, or the draft in progress when the editor was left by Try it or Q.
- [ ] **Step 4:** Run the unit tests, then `sh crete/test.sh`. Expect PASS.
- [ ] **Step 5: Commit** `Crete: the level editor`.

