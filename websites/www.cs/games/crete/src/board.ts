// websites/www.cs/games/crete/src/board.ts
/* The Island of Crete: paints a draw list (src/board-plan.ts) on the board's
 * canvas from the sprite atlas, and draws Ariadne's thread as a red line
 * through cell centres, edged dark, broken at a jump, with an arrow on each
 * square pointing the way to step next. The canvas is drawn in whole device pixels: a cell is
 * `round(cellPx × dpr)` of them, the backing store is that many per cell, and
 * the CSS size is the backing size over the ratio, so the browser never
 * rescales it and neighbouring tiles meet without a seam. */
import type { Atlas, Draw } from './board-plan.ts';
import { arrowAt } from './thread-path.ts';
import type { ThreadCell } from './thread-path.ts';
import type { Dir } from './puzzle/tiles.ts';

export interface Board {
  /** Sets the canvas to `cols × rows` cells of `cellPx` CSS pixels (plus the top row's rise). */
  size(cols: number, rows: number, cellPx: number): void;
  paint(list: Draw[], thread?: readonly ThreadCell[]): void;
}

export function createBoard(canvas: HTMLCanvasElement, atlas: Atlas, image: HTMLImageElement): Board {
  const ctx = canvas.getContext('2d')!;
  const rise = atlas.rise / atlas.cell;
  let cell = 16; // a cell, in device pixels
  let top = 0; // the rise above row 0, in device pixels
  return {
    size(cols, rows, cellPx) {
      const dpr = window.devicePixelRatio || 1;
      cell = Math.max(1, Math.round(cellPx * dpr));
      top = Math.round(rise * cell);
      canvas.width = cols * cell;
      canvas.height = rows * cell + top;
      canvas.style.width = `${canvas.width / dpr}px`;
      canvas.style.height = `${canvas.height / dpr}px`;
      canvas.dataset.cell = String(cellPx);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    },
    paint(list, thread) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const fw = atlas.cell;
      const fh = atlas.cell + atlas.rise;
      for (const d of list) {
        const s = atlas.sprites[d.sprite];
        if (!s) continue;
        // The canvas starts `rise` above row 0, so a sprite's frame top (its cell's top minus the rise) is y × cell.
        ctx.drawImage(image, s.x + d.frame * fw, s.y, fw, fh, Math.round(d.x * cell), Math.round(d.y * cell), cell, cell + top);
      }
      if (thread && thread.length > 1) drawThread(ctx, thread, cell, top);
    },
  };
}

export const THREAD_RED = '#c0392b';
/** The arrows' fill: a brighter red than the cord, so an arrow stands out on it. */
export const ARROW_RED = '#ff5b45';
/** The dark edge round the cord and each arrow, so both read on any floor. */
export const THREAD_EDGE = '#1c0402';
/** Below this many device pixels a cell (the mini map) shows the cord alone. */
const ARROW_MIN_CELL = 12;
/** An arrow's length and half-width, and how far its centre sits from the square's centre toward the next square,
 *  each in cells. */
export const ARROW_LEN = 0.42;
export const ARROW_HALF = 0.14;
export const ARROW_SHIFT = 0.2;

const ANGLE: Record<Dir, number> = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };

function drawThread(ctx: CanvasRenderingContext2D, thread: readonly ThreadCell[], cell: number, top: number): void {
  const at = (c: ThreadCell): [number, number] => [(c.c + 0.5) * cell, (c.r + 0.5) * cell + top];
  const lw = Math.max(1.5, cell / 12);
  const edge = Math.max(0.75, cell / 30);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  // One sub-path per stretch walked; a jump starts a new one, so no cord crosses the squares it skips.
  ctx.beginPath();
  thread.forEach((c, i) => {
    const [x, y] = at(c);
    if (i === 0 || c.jump) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = THREAD_EDGE;
  ctx.lineWidth = lw + 2 * edge;
  ctx.stroke();
  ctx.strokeStyle = THREAD_RED;
  ctx.lineWidth = lw;
  ctx.stroke();
  if (cell < ARROW_MIN_CELL) return;
  // An arrowhead in the half of the square it points into: a square walked one way and back shows both arrows apart.
  const len = cell * ARROW_LEN, half = cell * ARROW_HALF;
  ctx.lineJoin = 'miter';
  for (let i = 0; i < thread.length; i++) {
    const d = arrowAt(thread, i);
    if (!d) continue;
    const [x, y] = at(thread[i]!);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ANGLE[d]);
    ctx.translate(cell * ARROW_SHIFT, 0);
    ctx.beginPath();
    ctx.moveTo(len / 2, 0);
    ctx.lineTo(-len / 2, -half);
    ctx.lineTo(-len / 4, 0);
    ctx.lineTo(-len / 2, half);
    ctx.closePath();
    ctx.lineWidth = Math.max(1, cell / 21);
    ctx.strokeStyle = THREAD_EDGE;
    ctx.stroke();
    ctx.fillStyle = ARROW_RED;
    ctx.fill();
    ctx.restore();
  }
}
