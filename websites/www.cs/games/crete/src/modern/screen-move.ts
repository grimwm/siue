/* The Island of Crete, modern look: a key, pad or swipe press is a direction on the screen; the board moves along the
 * grid. The view may face any heading, so screen-up is the grid direction closest to "away from the camera": the
 * nearest quarter turn to the heading. Near a 45° boundary the quarter last used holds for a few degrees more, so a
 * view left on the boundary does not flip the mapping back and forth. DOM-free. */
import type { Dir } from '../puzzle/tiles.ts';

// Screen-up at each quarter turn; the others follow it round: right one step back, left one on, down two on.
const UP: readonly Dir[] = ['up', 'left', 'down', 'right'];
const OFFSET: Record<Dir, number> = { up: 0, left: 1, down: 2, right: 3 };
/** Degrees past a 45° boundary the quarter last used still holds. */
export const MOVE_HYSTERESIS = 5;

/** The quarter turn (0 to 3) nearest `yawDeg`; with `prev`, the last quarter used, kept while the heading stays
 *  within 45° + MOVE_HYSTERESIS of it. */
export function moveQuarter(yawDeg: number, prev?: number): number {
  const q = ((Math.round(yawDeg / 90) % 4) + 4) % 4;
  if (prev === undefined || prev === q) return q;
  const off = ((((yawDeg - prev * 90) % 360) + 540) % 360) - 180;
  return Math.abs(off) < 45 + MOVE_HYSTERESIS ? prev : q;
}

/** `dir` on the screen as a grid direction, for a view at `yawDeg` (quarter `quarter` when given, from moveQuarter). */
export function screenToGrid(dir: Dir, yawDeg: number, quarter = moveQuarter(yawDeg)): Dir {
  return UP[(quarter + OFFSET[dir]) % 4] ?? 'up';
}

/** A screen-to-grid mapping that remembers its last quarter, for the hysteresis. */
export function createMoveMap(): (dir: Dir, yawDeg: number) => Dir {
  let last: number | undefined;
  return (dir, yawDeg) => {
    last = moveQuarter(yawDeg, last);
    return screenToGrid(dir, yawDeg, last);
  };
}
