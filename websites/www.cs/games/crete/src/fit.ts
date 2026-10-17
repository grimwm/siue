/* The Island of Crete: the largest whole-pixel cell for a maze of `cols` x
 * `rows` with `gap` px between cells, in a space of `width` x `height`. 0 when
 * not even the gaps fit. DOM-free. */
export function fitCell(width: number, height: number, cols: number, rows: number, gap: number): number {
  const byWidth = (width - (cols - 1) * gap) / cols;
  const byHeight = (height - (rows - 1) * gap) / rows;
  return Math.max(0, Math.floor(Math.min(byWidth, byHeight)));
}
