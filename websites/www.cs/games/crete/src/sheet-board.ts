/* The Island of Crete, classic look: the game board as a tilted sheet (src/sheet.ts). The sheet canvas holds the
 * terrain and Ariadne's thread, with a margin of the walls' rise all round, and the page turns and tilts it with a CSS
 * transform; the figures, items and hazards stand upright on a second canvas over the whole view, at their sprites'
 * own pixels (scaled only as the whole sheet is while it turns), each on a soft shadow on its square.
 *
 * A raised tile (a wall, a door, a closed toggle wall) shows its top leaning away from the viewer and its face toward
 * them, so the sheet draws every tile turned to the quarter of the view (src/sheet.ts faceQuarter), farthest row
 * first; a tile whose picture points along the grid (a force floor, a clone machine) keeps its own way round, and the
 * gate and a door's sill, which lie across the way through them, swap to their twin drawn the other way round when
 * the turn is a quarter or three. A door sinking draws down its frame, cut off at the frame's foot. Each canvas
 * repaints only when what it shows has changed. */
import type { Atlas, Draw } from './board-plan.ts';
import { drawThread } from './board.ts';
import { pulseScale } from './thread-path.ts';
import type { ThreadCell } from './thread-path.ts';
import { TERRAIN, TURNED_SPRITES } from './puzzle/tiles.ts';
import { AWAY, LEAN_FEET, faceQuarter, project, sheetTransform } from './sheet.ts';
import type { Frame } from './sheet.ts';

export interface SheetBoard {
  /** Sets the sheet to `cols × rows` cells of `cellPx` CSS pixels, snapped to whole device pixels. */
  size(cols: number, rows: number, cellPx: number): void;
  /** Shows the sheet as `f` frames it. */
  frame(f: Frame): void;
  /** Paints `list`: its terrain and `thread` on the sheet, the rest standing over it; `t` (seconds) breathes the next
   *  step's arrow. */
  paint(list: Draw[], thread?: readonly ThreadCell[], t?: number): void;
}

const TERRAIN_SPRITES = new Set([...Object.values(TERRAIN).flatMap(t => t.sprites), ...TURNED_SPRITES]);
/** Each sprite that lies across the way through its cell, and its twin drawn the other way round. */
const TWIN = new Map(TURNED_SPRITES.filter(v => v.endsWith('-v')).flatMap(v => [[v, v.slice(0, -2)], [v.slice(0, -2), v]] as const));
/** Tiles whose picture points along the grid: they never turn with the view. */
const GRID_WAY = new Set(Object.values(TERRAIN).filter(t => t.carries || t === TERRAIN.clone).flatMap(t => t.sprites));
/** A shadow's radius, in cells. */
const SHADOW = 0.33;

export function createSheetBoard(canvas: HTMLCanvasElement, atlas: Atlas, image: HTMLImageElement): SheetBoard {
  const ctx = canvas.getContext('2d')!;
  const view = canvas.parentElement!;
  const overlay = document.createElement('canvas');
  overlay.className = 'stage-figures';
  overlay.setAttribute('aria-hidden', 'true');
  view.append(overlay);
  const o = overlay.getContext('2d')!;
  canvas.classList.add('sheet');
  const rise = atlas.rise / atlas.cell;
  const fw = atlas.cell, fh = atlas.cell + atlas.rise;
  let cell = 16; // a cell, in device pixels
  let top = 0; // the walls' rise, and the margin round the board, in device pixels
  let dpr = 1;
  let f: Frame | null = null;
  let sheetKey = '';
  let overKey = '';
  let lastThread: readonly ThreadCell[] | undefined;
  /** The last paint's list, thread and time: a resize or a new frame repaints from them at once, so no display
   *  frame shows the sheet cleared. */
  let last: Parameters<SheetBoard['paint']> | null = null;

  function paintSheet(terrain: Draw[], thread: readonly ThreadCell[] | undefined, pulse: number, q: number): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const away = AWAY[q]!;
    // Farthest first, so a raised tile's top leaning away covers the tile behind it.
    const order = terrain.slice().sort((a, b) => (b.x * away.x + b.y * away.y) - (a.x * away.x + a.y * away.y));
    for (const d of order) {
      const s = atlas.sprites[(q % 2 && TWIN.get(d.sprite)) || d.sprite];
      if (!s) continue;
      const x = top + d.x * cell, y = top + d.y * cell;
      ctx.save();
      ctx.translate(x + cell / 2, y + cell / 2);
      // Turned a quarter at a time about its square's centre, so its rise (the top of a wall) leans away.
      if (!GRID_WAY.has(d.sprite)) ctx.rotate((-q * Math.PI) / 2);
      const down = (d.sink ?? 0) * (cell + top);
      if (down) {
        ctx.beginPath();
        ctx.rect(-cell / 2, -cell / 2 - top, cell, cell + top);
        ctx.clip();
      }
      ctx.drawImage(image, s.x + d.frame * fw, s.y, fw, fh, -cell / 2, -cell / 2 - top + down, cell, cell + top);
      ctx.restore();
    }
    if (thread && thread.length > 1) {
      ctx.translate(top, 0);
      drawThread(ctx, thread, cell, top, pulse);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
  }

  function paintFigures(up: Draw[], fr: Frame): void {
    const ow = Math.round(fr.vw * dpr), oh = Math.round(fr.vh * dpr);
    if (overlay.width !== ow || overlay.height !== oh) {
      overlay.width = ow;
      overlay.height = oh;
    }
    o.setTransform(1, 0, 0, 1, 0, 0);
    o.clearRect(0, 0, ow, oh);
    o.imageSmoothingEnabled = true;
    o.imageSmoothingQuality = 'high';
    const c = cell / dpr;
    const k = fr.k;
    const lean = Math.min(1, Math.max(0, (90 - fr.pitch) / 45));
    const flat = Math.sin((fr.pitch * Math.PI) / 180);
    // The point of a sprite's frame that stands on its square: the square's centre seen from above, its feet as the
    // view leans.
    const anchor = (top + cell * (0.5 + LEAN_FEET * lean)) * k;
    const placed = up.map(d => ({ d, p: project(fr, (d.x + 0.5) * c, (d.y + 0.5) * c) })).sort((a, b) => a.p.y - b.p.y);
    o.fillStyle = 'rgba(0, 0, 0, 0.42)';
    for (const { p } of placed) {
      o.beginPath();
      o.ellipse(p.x * dpr, p.y * dpr, SHADOW * cell * k, SHADOW * cell * k * flat, 0, 0, Math.PI * 2);
      o.fill();
    }
    const dw = Math.round(cell * k), dh = Math.round((cell + top) * k);
    for (const { d, p } of placed) {
      const s = atlas.sprites[d.sprite]!;
      o.drawImage(image, s.x + d.frame * fw, s.y, fw, fh, Math.round(p.x * dpr - dw / 2), Math.round(p.y * dpr - anchor), dw, dh);
    }
  }

  const sheet: SheetBoard = {
    size(cols, rows, cellPx) {
      dpr = window.devicePixelRatio || 1;
      cell = Math.max(1, Math.round(cellPx * dpr));
      top = Math.round(rise * cell);
      canvas.width = cols * cell + 2 * top;
      canvas.height = rows * cell + 2 * top;
      canvas.style.width = `${canvas.width / dpr}px`;
      canvas.style.height = `${canvas.height / dpr}px`;
      canvas.dataset.cell = String(cellPx);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      sheetKey = overKey = '';
      if (f) canvas.style.transform = sheetTransform(f, top / dpr);
    },
    frame(next) {
      f = next;
      canvas.style.transform = sheetTransform(next, top / dpr);
      overKey = '';
      if (last) sheet.paint(...last);
    },
    paint(list, thread, t) {
      last = [list, thread, t];
      if (!f) return;
      const terrain: Draw[] = [];
      const up: Draw[] = [];
      for (const d of list) (TERRAIN_SPRITES.has(d.sprite) ? terrain : up).push(d);
      const q = faceQuarter(f.yaw);
      const pulse = t === undefined ? 1 : pulseScale(t);
      const showsThread = !!thread && thread.length > 1;
      const sk = `${q}|${showsThread ? pulse.toFixed(3) : '-'}|${terrain.map(d => `${d.sprite}${d.frame}${d.sink ?? ''}`).join(',')}`;
      if (sk !== sheetKey || (showsThread && thread !== lastThread)) {
        sheetKey = sk;
        lastThread = thread;
        paintSheet(terrain, thread, pulse, q);
      }
      const ok = up.map(d => `${d.sprite}${d.frame}@${d.x},${d.y}`).join(',');
      if (ok !== overKey) {
        overKey = ok;
        paintFigures(up, f);
      }
    },
  };
  return sheet;
}
