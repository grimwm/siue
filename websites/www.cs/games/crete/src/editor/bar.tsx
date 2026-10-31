// The Island of Crete: the level editor's controls around its board. The bar holds Undo, Redo, Try it and Leave,
// the size bar (rows and cols, 3 to 64, and Resize), the hearts (1 to 99) and the relics needed ("all", or 0 to
// the relics on the board). The palette sits beside the board; under 700 px it is a drawer the Pieces button
// opens (game.css). The Check panel (check-panel.tsx) and the Share panel (share-panel.tsx) sit above the palette.
import { render } from 'preact';
import { useRef } from 'preact/hooks';
import { Button } from '../../../_kit/ui/button.tsx';
import { BACK_KEY } from '../../../_kit/keys.ts';
import { OBJECTS } from '../puzzle/tiles.ts';
import { MAX_SIDE, MIN_SIDE, clampSide } from './model.ts';
import type { Brush, Draft } from './model.ts';
import { EDITOR_KEYS } from './keys.ts';
import { Palette } from './palette.tsx';
import { CheckPanel, CheckStrip } from './check-panel.tsx';
import type { CheckPanelProps } from './check-panel.tsx';
import { SharePanel } from './share-panel.tsx';
import type { ShareProps } from './share-panel.tsx';

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
  /** The Check panel, above the palette. */
  check?: CheckPanelProps;
  /** The Share panel, under the Check panel. */
  share?: ShareProps;
}

/** A box's number, or null when it is empty or not a number. */
function boxNumber(box: HTMLInputElement | null): number | null {
  const v = box?.value.trim() ?? '';
  const n = Number(v);
  return v === '' || !Number.isFinite(n) ? null : n;
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
          <Button id="editor-try" keyLabel={EDITOR_KEYS.try.label} onClick={p.onTry}>▶ Try It</Button>
          <button type="button" id="editor-pieces" class="editor-pieces" aria-expanded={p.drawer} aria-controls="editor-side"
            onClick={() => p.onDrawer(!p.drawer)}>Pieces</button>
          {p.onLeave && <Button id="editor-leave" keyLabel={BACK_KEY} onClick={p.onLeave}>Leave</Button>}
        </div>
        {p.check && <CheckStrip {...p.check} />}
        <div class="editor-size">
          <label>Rows <input id="editor-rows" key={`r${sized}`} ref={rows} type="number" min={MIN_SIDE} max={MAX_SIDE} defaultValue={String(d.rows)} /></label>
          <label>Cols <input id="editor-cols" key={`c${sized}`} ref={cols} type="number" min={MIN_SIDE} max={MAX_SIDE} defaultValue={String(d.cols)} /></label>
          <Button id="editor-resize" onClick={() => {
            // An empty box resizes nothing; either way the boxes show the size the board will have.
            const r = boxNumber(rows.current), c = boxNumber(cols.current);
            const to = r === null || c === null ? { r: d.rows, c: d.cols } : { r: clampSide(r), c: clampSide(c) };
            if (rows.current) rows.current.value = String(to.r);
            if (cols.current) cols.current.value = String(to.c);
            if (to.r !== d.rows || to.c !== d.cols) p.onResize(to.r, to.c);
          }}>Resize</Button>
          <label>Hearts <input id="editor-hearts" key={`h${d.hearts}`} type="number" min={1} max={99} defaultValue={String(d.hearts)}
            onChange={ev => {
              // Clamped first, so an out-of-range number that clamps to the hearts already set changes nothing; an empty
              // box changes nothing. The box shows the hearts the level has.
              const n = boxNumber(ev.currentTarget);
              const hearts = n === null ? d.hearts : Math.min(99, Math.max(1, Math.trunc(n)));
              ev.currentTarget.value = String(hearts);
              if (hearts !== d.hearts) p.onHearts(hearts);
            }} /></label>
          <label>Relics Needed <select id="editor-relics" value={relics}
            onChange={ev => { const v = ev.currentTarget.value; p.onRelics(v === 'all' ? null : Number(v)); }}>
            <option value="all">all</option>
            {Array.from({ length: relicsOnBoard + 1 }, (_, n) => <option key={n} value={String(n)}>{n}</option>)}
          </select></label>
        </div>
      </header>
      <aside id="editor-side" class={p.drawer ? 'editor-side open' : 'editor-side'} aria-label="Pieces">
        {p.check && <CheckPanel {...p.check} />}
        {p.share && <SharePanel {...p.share} />}
        <Palette brush={p.brush} owner={p.owner} onPick={p.onPick} onRotate={p.onRotate} />
      </aside>
    </>
  );
}

export function renderEditorPanel(root: Element, props: EditorPanelProps): void {
  render(<EditorPanel {...props} />, root);
}
