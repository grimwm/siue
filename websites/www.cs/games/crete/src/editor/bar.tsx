// The Island of Crete: the level editor's controls around its board. The bar holds Undo, Redo, Try it and Leave,
// the size bar (rows and cols, 3 to 64, and Resize), the hearts (1 to 99) and the relics needed ("all", or 0 to
// the relics on the board). The palette sits beside the board; under 700 px it is a drawer the Pieces button
// opens (game.css).
import { render } from 'preact';
import { useRef } from 'preact/hooks';
import { Button } from '../../../_kit/ui/button.tsx';
import { BACK_KEY } from '../../../_kit/keys.ts';
import { OBJECTS } from '../puzzle/tiles.ts';
import { MAX_SIDE, MIN_SIDE } from './model.ts';
import type { Brush, Draft } from './model.ts';
import { EDITOR_KEYS } from './keys.ts';
import { Palette } from './palette.tsx';

export interface EditorPanelProps {
  draft: Draft;
  canUndo: boolean;
  canRedo: boolean;
  brush: Brush;
  owner: boolean;
  /** The palette drawer is open (it is a drawer only on a narrow screen). */
  drawer: boolean;
  onPick(b: Brush): void;
  onRotate(): void;
  onUndo(): void;
  onRedo(): void;
  onTry(): void;
  /** Leaves the editor for the title card, when the page gives it. */
  onLeave?: () => void;
  onDrawer(open: boolean): void;
  onResize(rows: number, cols: number): void;
  onHearts(hearts: number): void;
  /** null: every relic on the board. */
  onRelics(relics: number | null): void;
}

export function EditorPanel(p: EditorPanelProps) {
  const rows = useRef<HTMLInputElement>(null);
  const cols = useRef<HTMLInputElement>(null);
  const d = p.draft;
  const relicsOnBoard = d.cells.filter(ch => ch === OBJECTS.relic.char).length;
  const relics = d.relics === null ? 'all' : String(Math.min(d.relics, relicsOnBoard));
  // A size typed and not yet applied stays put while the board is painted; a new size resets both boxes.
  const sized = `${d.rows}x${d.cols}`;
  return (
    <>
      <header class="editor-bar" aria-label="Level editor">
        <div class="editor-actions">
          <Button id="editor-undo" disabled={!p.canUndo} keyLabel={EDITOR_KEYS.undo.label} onClick={p.onUndo}>Undo</Button>
          <Button id="editor-redo" disabled={!p.canRedo} keyLabel={EDITOR_KEYS.redo.label} onClick={p.onRedo}>Redo</Button>
          <Button id="editor-try" keyLabel={EDITOR_KEYS.try.label} onClick={p.onTry}>▶ Try it</Button>
          <button type="button" id="editor-pieces" class="editor-pieces" aria-expanded={p.drawer} aria-controls="editor-side"
            onClick={() => p.onDrawer(!p.drawer)}>Pieces</button>
          {p.onLeave && <Button id="editor-leave" keyLabel={BACK_KEY} onClick={p.onLeave}>Leave</Button>}
        </div>
        <div class="editor-size">
          <label>Rows <input id="editor-rows" key={`r${sized}`} ref={rows} type="number" min={MIN_SIDE} max={MAX_SIDE} defaultValue={String(d.rows)} /></label>
          <label>Cols <input id="editor-cols" key={`c${sized}`} ref={cols} type="number" min={MIN_SIDE} max={MAX_SIDE} defaultValue={String(d.cols)} /></label>
          <Button id="editor-resize" onClick={() => p.onResize(Number(rows.current?.value), Number(cols.current?.value))}>Resize</Button>
          <label>Hearts <input id="editor-hearts" key={`h${d.hearts}`} type="number" min={1} max={99} defaultValue={String(d.hearts)}
            onChange={ev => p.onHearts(Number(ev.currentTarget.value))} /></label>
          <label>Relics needed <select id="editor-relics" value={relics}
            onChange={ev => { const v = ev.currentTarget.value; p.onRelics(v === 'all' ? null : Number(v)); }}>
            <option value="all">all</option>
            {Array.from({ length: relicsOnBoard + 1 }, (_, n) => <option key={n} value={String(n)}>{n}</option>)}
          </select></label>
        </div>
      </header>
      <aside id="editor-side" class={p.drawer ? 'editor-side open' : 'editor-side'} aria-label="Pieces">
        <Palette brush={p.brush} owner={p.owner} onPick={p.onPick} onRotate={p.onRotate} />
      </aside>
    </>
  );
}

export function renderEditorPanel(root: Element, props: EditorPanelProps): void {
  render(<EditorPanel {...props} />, root);
}
