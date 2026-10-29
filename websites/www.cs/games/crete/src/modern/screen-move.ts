/* The Island of Crete, modern look: a key or swipe is a direction on the screen; the board moves along the
 * grid. The view is turned to the nearest quarter, so screen-up is a grid direction. DOM-free. */
import type { Dir } from '../puzzle/tiles.ts';

// Screen-up at each quarter turn; the others follow it round: right one step back, left one on, down two on.
const UP: readonly Dir[] = ['up', 'left', 'down', 'right'];
const OFFSET: Record<Dir, number> = { up: 0, left: 1, down: 2, right: 3 };

export function screenToGrid(dir: Dir, yawDeg: number): Dir {
  const q = ((Math.round(yawDeg / 90) % 4) + 4) % 4;
  return UP[(q + OFFSET[dir]) % 4] ?? 'up';
}
