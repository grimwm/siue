/* The Island of Crete: the move pad under a held finger or button. A press only arms the arrow it lands on: lifted
 * there before HOLD_MS it is a tap, one move; held HOLD_MS it moves, then again each time the move before has played
 * and REPEAT_MS has passed. A finger that slides into another arrow moves that way at once (the arrow it landed on
 * never moves), and held there it walks on as a held arrow does; over the centre it stops; past the pad's edge it
 * reads as the nearest arrow. DOM-free; src/ui.ts wires it. */
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

/** One finger on the pad, from the press to the lift. Each method gives the move to make now, if any; the caller
 *  sets `stalled` when a move could not be made (a wall, a snare), which stops the arrow walking on. */
export class PadPress {
  /** The arrow under the finger, or null over the centre. */
  dir: MoveAction | null;
  stalled = false;
  /** The arrow the finger came down on, until anything moves. */
  private armed: MoveAction | null;
  private at: number;
  private repeats = 0;

  constructor(dir: MoveAction | null, now: number) {
    this.dir = dir;
    this.armed = dir;
    this.at = now;
  }

  /** The finger is over `dir` at `now`. Into another arrow it moves that way; back onto the arrow it came down on,
   *  with nothing moved yet, it is only armed again. */
  over(dir: MoveAction | null, now: number): MoveAction | null {
    if (dir === this.dir) return null;
    this.dir = dir;
    this.at = now;
    this.repeats = 0;
    this.stalled = false;
    if (dir === null || dir === this.armed) return null;
    this.armed = null;
    return dir;
  }

  /** Time passes, `busy` while a move is still playing: an armed arrow moves once held HOLD_MS, and a moved one walks
   *  on as repeatDue says. */
  tick(now: number, busy: boolean): MoveAction | null {
    if (!this.dir || this.stalled) return null;
    if (this.dir === this.armed) {
      if (busy || now - this.at < HOLD_MS) return null;
      this.armed = null;
    } else if (!repeatDue(now - this.at, this.repeats, busy)) return null;
    this.repeats++;
    this.at = now;
    return this.dir;
  }

  /** The finger lifts: a tap moves once, the way of the arrow it came down on; anything else has moved already. */
  up(): MoveAction | null {
    const tap = this.dir !== null && this.dir === this.armed ? this.dir : null;
    this.armed = null;
    this.dir = null;
    return tap;
  }
}
