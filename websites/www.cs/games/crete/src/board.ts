// websites/www.cs/games/crete/src/board.ts
/* The Island of Crete: paints a draw list (src/board-plan.ts) on the board's
 * canvas from the sprite atlas, at the device's pixel ratio so the tiles stay
 * sharp, and draws Ariadne's thread as a red line through cell centres. */
import type { Atlas, Draw } from './board-plan.ts';
import { boardRows } from './board-plan.ts';
import type { Cell } from './puzzle/tiles.ts';

export interface Board {
  /** Sets the canvas to `cols × rows` cells of `cellPx` CSS pixels (plus the top row's rise). */
  size(cols: number, rows: number, cellPx: number): void;
  paint(list: Draw[], thread?: readonly Cell[]): void;
}

export function createBoard(canvas: HTMLCanvasElement, atlas: Atlas, image: HTMLImageElement): Board {
  const ctx = canvas.getContext('2d')!;
  let px = 16;
  const rise = atlas.rise / atlas.cell;
  return {
    size(cols, rows, cellPx) {
      px = cellPx;
      const dpr = window.devicePixelRatio || 1;
      const w = cols * cellPx;
      const h = boardRows({ rows }, atlas) * cellPx;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.dataset.cell = String(cellPx);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
        // The canvas starts `rise` above row 0, so a sprite's frame top (its cell's top minus the rise) is y * px.
        ctx.drawImage(image, s.x + d.frame * fw, s.y, fw, fh, d.x * px, d.y * px, px, px * (1 + rise));
      }
      if (thread && thread.length > 1) {
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = Math.max(2, px / 8);
        ctx.lineJoin = 'round';
        ctx.beginPath();
        thread.forEach((c, i) => {
          const x = (c.c + 0.5) * px;
          const y = (c.r + 0.5 + rise) * px;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
    },
  };
}
