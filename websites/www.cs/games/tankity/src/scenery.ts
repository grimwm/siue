/* Operation Tankity: the hills past the field's edges, for drawing only.
 * The sim never reads this: past the edge nothing is hittable. Pure. */
import { hillY } from './sim.ts';
import type { Hills } from './sim.ts';

/** Columns over which the scenery eases from the field's edge into the hills, at least. */
export const SEAM_EASE = 48;

/** The ground at column x as drawn: the field inside it; past an edge the
 *  round's hills continued, eased from the field's live edge height over
 *  max(SEAM_EASE, |difference|) columns, so the ease adds at most 1 px a column. */
export function sceneryY(h: Hills, terrain: readonly number[], x: number): number {
  const w = terrain.length;
  if (x >= 0 && x <= w - 1) return terrain[Math.round(x)]!;
  const edge = x < 0 ? 0 : w - 1;
  const d = terrain[edge]! - hillY(h, edge);
  const span = Math.max(SEAM_EASE, Math.ceil(Math.abs(d)));
  return hillY(h, x) + d * Math.max(0, 1 - Math.abs(x - edge) / span);
}
