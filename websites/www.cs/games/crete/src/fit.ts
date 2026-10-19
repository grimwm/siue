/* The Island of Crete: the largest whole-pixel cell for a maze of `cols` x
 * `rows` with `gap` px between cells, in a space of `width` x `height`. 0 when
 * not even the gaps fit. DOM-free. */
export function fitCell(width: number, height: number, cols: number, rows: number, gap: number): number {
  const byWidth = (width - (cols - 1) * gap) / cols;
  const byHeight = (height - (rows - 1) * gap) / rows;
  return Math.max(0, Math.floor(Math.min(byWidth, byHeight)));
}

/** More than this in either dimension is a big level: it may scroll rather than shrink. */
export const BIG = 12;
/** The smallest cell (CSS px) a big level is drawn at; below it the board scrolls. */
export const BIG_MIN_CELL = 32;

/** The cell for a board, and whether it scrolls. Up to BIG x BIG the plain fit, never scrolling; a bigger level
 *  keeps at least BIG_MIN_CELL and scrolls when the fit would be smaller. */
export function cellFor(width: number, height: number, cols: number, rows: number, gap: number): { cell: number; scrolls: boolean } {
  const fit = fitCell(width, height, cols, rows, gap);
  if (cols <= BIG && rows <= BIG) return { cell: fit, scrolls: false };
  return { cell: Math.max(fit, BIG_MIN_CELL), scrolls: fit < BIG_MIN_CELL };
}
