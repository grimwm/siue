/* The Island of Crete, modern look: the mini map. The whole level in Classic's sprites (src/board.ts, each at its
 * first frame), at the board's bottom-left, with the camera's view of the floor outlined over it and a tick from
 * the view's centre toward screen-up. A tap or a drag on it sends the camera there. The level is painted only when
 * it changes, and the outline only when the camera moves. */
import { createBoard } from '../board.ts';
import { drawList } from '../board-plan.ts';
import type { Atlas, Figures } from '../board-plan.ts';
import type { State } from '../puzzle/state.ts';
import type { Cell } from '../puzzle/tiles.ts';
import { footprint, fromMini, miniCell, toMini } from './camera.ts';
import type { Cam, Ground } from './camera.ts';

/** True once `image` can be drawn: a still-loading or broken image element draws nothing. */
function imageReady(image: CanvasImageSource): boolean {
  return !(image instanceof HTMLImageElement) || (image.complete && image.naturalWidth > 0);
}

export interface Minimap {
  /** Paints the level as it stands. */
  paint(s: State, f: Figures, thread: readonly Cell[] | null): void;
  /** Outlines what camera `c` sees of the floor on a board `aspect` wide. */
  view(c: Cam, aspect: number): void;
  /** Sizes the cells to a board region `w` × `h` CSS pixels. */
  fit(w: number, h: number): void;
  /** Shows or hides it. */
  show(on: boolean): void;
  dispose(): void;
}

export interface MinimapHost {
  /** True while a layer other than `start` is open. */
  blocked(): boolean;
  /** Sends the camera to look at `g`. */
  look(g: Ground): void;
}

export function createMinimap(parent: HTMLElement, atlas: Atlas, image: HTMLImageElement, host: MinimapHost): Minimap {
  const wrap = document.createElement('div');
  wrap.className = 'minimap';
  wrap.hidden = true;
  const base = document.createElement('canvas');
  base.id = 'minimap';
  base.setAttribute('aria-hidden', 'true');
  const over = document.createElement('canvas');
  over.id = 'minimap-view';
  over.setAttribute('role', 'img');
  over.setAttribute('aria-label', 'Mini map: the whole level from above; the outline is what the camera sees. Tap to look there.');
  wrap.append(base, over);
  parent.append(wrap);
  const board = createBoard(base, atlas, image);
  const g = over.getContext('2d')!;

  let shown: { s: State; f: Figures; thread: readonly Cell[] | null } | null = null;
  let cam: { c: Cam; aspect: number } | null = null;
  let regionW = 0, regionH = 0;
  let cols = 0, rows = 0, cellPx = 0;
  // The painted cell and rise in CSS pixels, as src/board.ts rounded them.
  let cell = 1, top = 0;

  function size(): void {
    if (!shown) return;
    const nc = shown.s.level.cols, nr = shown.s.level.rows;
    const want = miniCell(regionW || 1280, regionH || 800, nc, nr);
    if (nc === cols && nr === rows && want === cellPx) return;
    cols = nc;
    rows = nr;
    cellPx = want;
    board.size(cols, rows, cellPx);
    const dpr = window.devicePixelRatio || 1;
    over.width = base.width;
    over.height = base.height;
    over.style.width = base.style.width;
    over.style.height = base.style.height;
    cell = base.width / dpr / cols;
    top = base.height / dpr - rows * cell;
  }

  function drawLevel(): void {
    if (!shown || !imageReady(image)) return;
    board.paint(drawList(shown.s, shown.f, atlas, 0), shown.thread ?? undefined);
  }

  function drawView(): void {
    if (!cam || !cols) return;
    const dpr = window.devicePixelRatio || 1;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, over.width, over.height);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const f = footprint(cam.c, cam.aspect);
    const at = (p: Ground) => toMini(p, cols, rows, cell, top);
    g.save();
    g.beginPath();
    g.rect(0, top, cols * cell, rows * cell);
    g.clip();
    g.beginPath();
    f.corners.map(at).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
    g.fillStyle = 'rgba(255,230,180,0.10)';
    g.fill();
    g.lineWidth = 1.5;
    g.strokeStyle = '#ffd890';
    g.stroke();
    const [a, b] = f.tick.map(at);
    g.beginPath();
    g.moveTo(a![0], a![1]);
    g.lineTo(b![0], b![1]);
    g.stroke();
    g.restore();
  }

  const arrived = () => drawLevel();
  if (!imageReady(image)) image.addEventListener('load', arrived, { once: true });

  let dragging = false;
  const lookAt = (e: PointerEvent) => {
    if (host.blocked() || !cols) return;
    const r = over.getBoundingClientRect();
    host.look(fromMini(e.clientX - r.left, e.clientY - r.top, cols, rows, cell, top));
  };
  const down = (e: PointerEvent) => {
    if (host.blocked()) return;
    dragging = true;
    try {
      over.setPointerCapture(e.pointerId);
    } catch {
      // A synthetic pointer cannot be captured.
    }
    lookAt(e);
  };
  const move = (e: PointerEvent) => {
    if (dragging) lookAt(e);
  };
  const end = () => {
    dragging = false;
  };
  over.addEventListener('pointerdown', down);
  over.addEventListener('pointermove', move);
  over.addEventListener('pointerup', end);
  over.addEventListener('pointercancel', end);

  return {
    show(on) {
      wrap.hidden = !on;
    },
    paint(s, f, thread) {
      shown = { s, f, thread };
      size();
      drawLevel();
      drawView();
    },
    view(c, aspect) {
      cam = { c: { ...c }, aspect };
      drawView();
    },
    fit(w, h) {
      regionW = w;
      regionH = h;
      const was = cellPx;
      size();
      if (cellPx !== was) {
        drawLevel();
        drawView();
      }
    },
    dispose() {
      image.removeEventListener('load', arrived);
      wrap.remove();
    },
  };
}
