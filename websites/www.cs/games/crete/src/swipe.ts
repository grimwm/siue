/* The Island of Crete: a finger's swipe on the board as a move. A touch that travels at least SWIPE_PX within
 * SWIPE_MS is a swipe the way it went most, as the screen shows it (up is toward the screen's top); the page turns
 * that into the direction on the grid, as it does a move key. A shorter or slower touch is not a swipe. DOM-free. */
import type { MoveAction } from "./keys.ts";

export const SWIPE_PX = 24;
export const SWIPE_MS = 700;

/** The swipe of a touch that moved `(dx, dy)` CSS pixels (y down) in `ms`, or null. */
export function swipeDir(dx: number, dy: number, ms: number): MoveAction | null {
  if (ms > SWIPE_MS || Math.hypot(dx, dy) < SWIPE_PX) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}
