/* The Island of Crete: the move pad under a held finger or button. A press on an arrow moves at once; held there, it
 * moves again once HOLD_MS has passed and the last move has finished playing, then again each time the move before
 * has played and REPEAT_MS has passed. A finger that slides across the pad moves the way of each arrow it enters
 * and stops over the centre; past the pad's edge it reads as the nearest arrow. DOM-free; src/ui.ts wires it. */
import type { MoveAction } from "./keys.ts";

/** How long an arrow is held before it moves again, in ms. */
export const HOLD_MS = 300;
/** The least time between two moves of a held arrow, in ms, once it repeats. */
export const REPEAT_MS = 150;

/** The arrow at `(dx, dy)` CSS pixels from the centre of the pad (y down), or null over the centre square, whose half
 *  width is `half`: the way it lies furthest, however far out. */
export function padDir(dx: number, dy: number, half: number): MoveAction | null {
  if (Math.max(Math.abs(dx), Math.abs(dy)) <= half) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}

/** Whether a held arrow moves again now: `since` ms after its last move, the `repeats`-th time it would repeat, with
 *  `busy` while that move is still playing. */
export function repeatDue(since: number, repeats: number, busy: boolean): boolean {
  return !busy && since >= (repeats === 0 ? HOLD_MS : REPEAT_MS);
}
