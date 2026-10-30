/* The Island of Crete: the largest whole-pixel cell for a maze of `cols` x
 * `rows` with `gap` px between cells, in a space of `width` x `height`. 0 when
 * not even the gaps fit. DOM-free. */
export function fitCell(width: number, height: number, cols: number, rows: number, gap: number): number {
  const byWidth = (width - (cols - 1) * gap) / cols;
  const byHeight = (height - (rows - 1) * gap) / rows;
  return Math.max(0, Math.floor(Math.min(byWidth, byHeight)));
}

/** The game board's cell at its whole-level fit: the largest whole-pixel cell that shows all `cols` x `drawnRows` (the
 *  rows plus the rise of the walls' tops, fractional) in `width` x `height`, however small; at least 1. */
export function wholeCell(width: number, height: number, cols: number, drawnRows: number): number {
  return Math.max(1, fitCell(width, height, cols, drawnRows, 0));
}

/** In the level editor, more than this in either dimension is a big level: it may scroll rather than shrink. */
export const BIG = 12;
/** The smallest cell (CSS px) the editor draws a big level at; below it the editor's board scrolls. */
export const BIG_MIN_CELL = 32;

/** The level editor's cell for a board of `cols` x `rows` cells, and whether it scrolls. Up to BIG x BIG the plain fit, never
 *  scrolling; a bigger level keeps at least BIG_MIN_CELL and scrolls when the fit would be smaller. The canvas is
 *  `drawnRows` tall (the rows plus the rise of the walls' tops, fractional); it is `rows` that decides big. */
export function cellFor(width: number, height: number, cols: number, rows: number, gap: number, drawnRows = rows): { cell: number; scrolls: boolean } {
  const fit = fitCell(width, height, cols, drawnRows, gap);
  if (cols <= BIG && rows <= BIG) return { cell: fit, scrolls: false };
  return { cell: Math.max(fit, BIG_MIN_CELL), scrolls: fit < BIG_MIN_CELL };
}
