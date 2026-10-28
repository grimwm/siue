/* The Island of Crete: the level editor, a layer over the game frame (#editor-root, which holds its own board
 * canvas #editor-stage). It draws the draft as the game would at its start, paints it with the mouse or one
 * finger (a drag paints every cell it crosses and is one undo step; two fingers scroll a big board), fits the
 * board as the game's does, and answers the editor's keys while src/ui.ts hands them over. The draft and its
 * undo history live for the page's life: leaving the editor by Try it or Q keeps them. Needs the DOM lib. */
import { isBackKey, typesText } from '../../../_kit/keys.ts';
import { oneOf, pref } from '../../../_kit/prefs.ts';
import { browserStorage } from '../../../_kit/ports.browser.ts';
import { createBoard } from '../board.ts';
import { boardRows, drawList } from '../board-plan.ts';
import type { Atlas, Draw, Figures } from '../board-plan.ts';
import { cellFor } from '../fit.ts';
import { initial } from '../puzzle/state.ts';
import type { State } from '../puzzle/state.ts';
import type { Level } from '../puzzle/level.ts';
import { TERRAIN } from '../puzzle/tiles.ts';
import type { Cell, Terrain } from '../puzzle/tiles.ts';
import { renderEditorPanel } from './bar.tsx';
import { editorActionFor } from './keys.ts';
import { commit, redoH, startHistory, undoH } from './history.ts';
import type { History } from './history.ts';
import { newDraft, paint, resize, toLevel, toText } from './model.ts';
import type { Brush, Draft } from './model.ts';
import { HIDDEN_MARK, dirOf, nextDir } from './palette.tsx';

export interface Editor {
  /** Shows the editor on `draft` (a fresh history), or on the draft in progress, or on a new 12 x 12 one. */
  open(draft?: Draft): void;
  close(): void;
  /** The draft as it stands, mid-stroke included. */
  readonly draft: Draft;
  /** Handles a key press while the editor is the top layer; false when the press is not the editor's. */
  key(ev: KeyboardEvent): boolean;
}

export interface EditorDeps {
  root: HTMLElement;
  atlas: Atlas;
  image: HTMLImageElement;
  /** Plays the draft on the game screen. */
  tryIt(level: Level, text: string): void;
  /** The draft changed. */
  changed(): void;
  /** Leaves the editor for the title card (its Leave button), when the page gives it. */
  leave?: () => void;
}

/** The owner flag: the kit pref `crete-owner` set to `on` shows the campaign's own tools. */
export const OWNER_PREF = 'crete-owner';
const NEW_SIDE = 12;

/** The figures where the level starts them. */
function restingFigures(s: State): Figures {
  return { player: s.player, minotaur: s.minotaur, hazards: s.hazards.map(h => ({ kind: h.kind, at: h.at })) };
}

/** The cells on the straight line from `a` to `b`, `b` included and `a` not, with no gaps (Bresenham). */
export function lineCells(a: Cell, b: Cell): Cell[] {
  const out: Cell[] = [];
  const dc = Math.abs(b.c - a.c), dr = -Math.abs(b.r - a.r);
  const sc = a.c < b.c ? 1 : -1, sr = a.r < b.r ? 1 : -1;
  let err = dc + dr;
  let { r, c } = a;
  while (r !== b.r || c !== b.c) {
    const e2 = 2 * err;
    if (e2 >= dr) { err += dr; c += sc; }
    if (e2 <= dc) { err += dc; r += sr; }
    out.push({ r, c });
  }
  return out;
}

const HIDDEN_BY_CHAR = new Map((Object.keys(HIDDEN_MARK) as Terrain[]).map(t => [TERRAIN[t].char, HIDDEN_MARK[t]!]));

/** The cells whose terrain the game draws as something else (a fake wall as wall, an invisible wall as floor), with
 *  the letter the editor's board marks them with. */
export function hiddenMarks(d: Draft): { r: number; c: number; mark: string }[] {
  const out: { r: number; c: number; mark: string }[] = [];
  d.cells.forEach((ch, i) => {
    const mark = HIDDEN_BY_CHAR.get(ch);
    if (mark) out.push({ r: Math.floor(i / d.cols), c: i % d.cols, mark });
  });
  return out;
}

/** Finds `#id` under `root`, or makes it as a child of `parent`. */
function part(root: HTMLElement, parent: HTMLElement, id: string, tag: string): HTMLElement {
  const found = root.querySelector<HTMLElement>(`#${id}`);
  if (found) return found;
  const el = document.createElement(tag);
  el.id = id;
  parent.appendChild(el);
  return el;
}

export function createEditor(deps: EditorDeps): Editor {
  const { root, atlas, image } = deps;
  const holder = part(root, root, 'editor-board', 'div');
  const canvas = part(root, holder, 'editor-stage', 'canvas') as HTMLCanvasElement;
  const panel = part(root, root, 'editor-panel', 'div');
  const board = createBoard(canvas, atlas, image);
  const ctx = canvas.getContext('2d');
  const owner = pref(OWNER_PREF, 'off', oneOf(['on', 'off'], 'off'), browserStorage());

  let history: History<Draft> | null = null;
  /** The draft on show: the history's present, or a stroke's work before it is committed. */
  let live: Draft = newDraft(NEW_SIDE, NEW_SIDE);
  let brush: Brush = { kind: 'terrain', t: 'wall' };
  let isOwner = false;
  let drawer = false;
  let shown = false;
  /** The draw list and the draft it was made for. */
  let list: Draw[] = [];
  let listFor: Draft | null = null;
  let marks: { r: number; c: number; mark: string }[] = [];
  let sized = '';
  /** The stroke in progress: its pointer and the last cell it painted. */
  let stroke: { id: number; last: Cell } | null = null;
  /** Touches on the board, for telling a one-finger stroke from a two-finger scroll. */
  const touches = new Map<number, { x: number; y: number }>();

  const now = (): History<Draft> => (history ??= startHistory(newDraft(NEW_SIDE, NEW_SIDE)));

  function drawBoard(): void {
    if (!shown) return;
    if (listFor !== live) {
      const s = initial(toLevel(live));
      list = drawList(s, restingFigures(s), atlas, 0);
      marks = hiddenMarks(live);
      listFor = live;
    }
    if (sized !== `${live.cols}x${live.rows}`) fit();
    else paintBoard();
  }

  /** The board, then a letter in a dark tab on each cell the game would draw as something else. */
  function paintBoard(): void {
    board.paint(list);
    if (!ctx || marks.length === 0) return;
    const cell = canvas.width / live.cols;
    const top = canvas.height - live.rows * cell;
    const size = Math.max(8, Math.round(cell * 0.45));
    ctx.font = `bold ${size}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const m of marks) {
      const x = (m.c + 0.5) * cell, y = top + (m.r + 0.5) * cell;
      ctx.fillStyle = 'rgba(1, 4, 9, 0.75)';
      ctx.fillRect(x - size * 0.6, y - size * 0.6, size * 1.2, size * 1.2);
      ctx.fillStyle = '#f0b429';
      ctx.fillText(m.mark, x, y);
    }
  }

  /** The cell size: as the game's board (src/ui.ts fit), the largest whole pixel count that fits, and a big draft
   *  keeps cells of at least 32 px and scrolls. */
  function fit(): void {
    if (!shown) return;
    const { cols, rows } = live;
    setScrolls(false);
    const bs = getComputedStyle(holder);
    const w = (holder.clientWidth || 0) - parseFloat(bs.paddingLeft || '0') - parseFloat(bs.paddingRight || '0');
    const h = (holder.clientHeight || 0) - parseFloat(bs.paddingTop || '0') - parseFloat(bs.paddingBottom || '0');
    const fitted = cellFor(w, h, cols, rows, 0, boardRows(live, atlas));
    let cell = Math.max(1, fitted.cell);
    board.size(cols, rows, cell);
    while (!fitted.scrolls && cell > 1 && (parseFloat(canvas.style.width) > w || parseFloat(canvas.style.height) > h)) {
      cell--;
      board.size(cols, rows, cell);
    }
    setScrolls(fitted.scrolls);
    sized = `${cols}x${rows}`;
    if (listFor === live) paintBoard();
  }

  function setScrolls(on: boolean): void {
    const rest = holder.className.split(' ').filter(c => c && c !== 'scrolls');
    holder.className = (on ? [...rest, 'scrolls'] : rest).join(' ');
  }

  function drawPanel(): void {
    if (!shown) return;
    const h = now();
    renderEditorPanel(panel, {
      draft: live, canUndo: h.canUndo, canRedo: h.canRedo, brush, owner: isOwner, drawer,
      onPick: (b) => {
        brush = b;
        drawer = false;
        drawPanel();
      },
      onRotate: rotate,
      onUndo: () => step(undoH),
      onRedo: () => step(redoH),
      onTry: tryIt,
      ...(deps.leave ? { onLeave: deps.leave } : {}),
      onDrawer: (open) => {
        drawer = open;
        drawPanel();
      },
      onResize: (rows, cols) => edit(d => (Number.isFinite(rows) && Number.isFinite(cols) ? resize(d, rows, cols) : d)),
      onHearts: (n) => edit(d => {
        if (!Number.isFinite(n)) return d;
        const hearts = Math.min(99, Math.max(1, Math.trunc(n)));
        return hearts === d.hearts ? d : { ...d, hearts };
      }),
      onRelics: (n) => edit(d => (n === d.relics || (n !== null && !Number.isFinite(n)) ? d : { ...d, relics: n })),
    });
  }

  /** Shows `d` as the draft; the history is the caller's. */
  function show(d: Draft): void {
    if (d === live) return;
    live = d;
    drawBoard();
    drawPanel();
    deps.changed();
  }

  /** One undo step: `fn` of the present draft. */
  function edit(fn: (d: Draft) => Draft): void {
    endStroke();
    history = commit(now(), fn(now().now));
    show(history.now);
  }

  function step(fn: (h: History<Draft>) => History<Draft>): void {
    endStroke();
    history = fn(now());
    show(history.now);
  }

  function rotate(): void {
    const dir = dirOf(brush);
    if (dir === null || (brush.kind !== 'hazard' && brush.kind !== 'machine')) return;
    brush = { ...brush, dir: nextDir(dir) };
    drawPanel();
  }

  function tryIt(): void {
    endStroke();
    deps.tryIt(toLevel(live), toText(live, false));
  }

  /* ---------- painting ---------- */
  function cellAt(ev: PointerEvent): Cell {
    const rect = canvas.getBoundingClientRect();
    const size = rect.width / live.cols;
    const rise = rect.height - live.rows * size;
    const at = { r: Math.floor((ev.clientY - rect.top - rise) / size), c: Math.floor((ev.clientX - rect.left) / size) };
    // A board not laid out yet has no cells to hit.
    return Number.isFinite(at.r) && Number.isFinite(at.c) ? at : { r: -1, c: -1 };
  }

  function endStroke(): void {
    if (!stroke) return;
    stroke = null;
    history = commit(now(), live);
    drawPanel();
  }

  /** A second finger came down: the stroke so far is undone, and the fingers scroll. */
  function dropStroke(): void {
    if (!stroke) return;
    stroke = null;
    show(now().now);
  }

  canvas.addEventListener('pointerdown', (ev) => {
    if (ev.pointerType === 'touch') {
      touches.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
      if (touches.size > 1) {
        dropStroke();
        return;
      }
    } else if (ev.button > 0) return;
    if (!shown || stroke) return;
    ev.preventDefault();
    // The press keeps the focus where it was; a number box keeping it would take the editor's keys as typing.
    const focused = document.activeElement as HTMLElement | null;
    if (focused && typesText(focused)) focused.blur();
    canvas.setPointerCapture?.(ev.pointerId);
    const at = cellAt(ev);
    stroke = { id: ev.pointerId, last: at };
    show(paint(live, at, brush));
  });

  canvas.addEventListener('pointermove', (ev) => {
    const touch = touches.get(ev.pointerId);
    if (touch && touches.size > 1) {
      // Each finger moves the board by its share, so two fingers moving together scroll it by their movement.
      holder.scrollLeft -= (ev.clientX - touch.x) / touches.size;
      holder.scrollTop -= (ev.clientY - touch.y) / touches.size;
    }
    if (touch) touches.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (!stroke || ev.pointerId !== stroke.id) return;
    const at = cellAt(ev);
    if (at.r === stroke.last.r && at.c === stroke.last.c) return;
    let d = live;
    for (const c of lineCells(stroke.last, at)) d = paint(d, c, brush);
    stroke.last = at;
    show(d);
  });

  const lift = (ev: PointerEvent): void => {
    touches.delete(ev.pointerId);
    if (stroke && ev.pointerId === stroke.id) endStroke();
  };
  canvas.addEventListener('pointerup', lift);
  canvas.addEventListener('pointercancel', lift);

  image.addEventListener('load', drawBoard);
  if (typeof ResizeObserver === 'function') new ResizeObserver(fit).observe(holder);
  if (typeof window !== 'undefined') window.addEventListener('resize', fit);

  return {
    open(draft) {
      if (draft) history = startHistory(draft);
      isOwner = owner.get() === 'on';
      if (brush.kind === 'page' && !isOwner) brush = { kind: 'terrain', t: 'wall' };
      shown = true;
      root.hidden = false;
      live = now().now;
      sized = '';
      drawPanel();
      drawBoard();
    },
    close() {
      endStroke();
      touches.clear();
      drawer = false;
      shown = false;
      root.hidden = true;
    },
    get draft() {
      return live;
    },
    key(ev) {
      if (!shown || typesText(ev.target)) return false;
      if (isBackKey(ev)) {
        if (!drawer) return false;
        ev.preventDefault();
        drawer = false;
        drawPanel();
        return true;
      }
      const action = editorActionFor(ev);
      if (!action) return false;
      ev.preventDefault();
      if (ev.repeat && action !== 'undo' && action !== 'redo') return true;
      switch (action) {
        case 'undo': step(undoH); break;
        case 'redo': step(redoH); break;
        case 'try': tryIt(); break;
        // C is Check's key: the press is kept from the game and checks nothing on this page.
        case 'check': break;
        case 'rotate': rotate(); break;
      }
      return true;
    },
  };
}
