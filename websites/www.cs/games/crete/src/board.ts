// websites/www.cs/games/crete/src/board.ts
/* The Island of Crete: paints a draw list (src/board-plan.ts) on the board's
 * canvas from the sprite atlas, and draws Ariadne's thread as a red line
 * through cell centres. The canvas is drawn in whole device pixels: a cell is
 * `round(cellPx × dpr)` of them, the backing store is that many per cell, and
 * the CSS size is the backing size over the ratio, so the browser never
 * rescales it and neighbouring tiles meet without a seam. */
import type { Atlas, Draw } from './board-plan.ts';
import type { Cell } from './puzzle/tiles.ts';

export interface Board {
  /** Sets the canvas to `cols × rows` cells of `cellPx` CSS pixels (plus the top row's rise). */
  size(cols: number, rows: number, cellPx: number): void;
  paint(list: Draw[], thread?: readonly Cell[]): void;
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
      if (thread && thread.length > 1) {
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = Math.max(2, cell / 8);
        ctx.lineJoin = 'round';
        ctx.beginPath();
        thread.forEach((c, i) => {
          const x = (c.c + 0.5) * cell;
          const y = (c.r + 0.5) * cell + top;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
    },
  };
}
