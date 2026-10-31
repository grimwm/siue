/* The Island of Crete: Ariadne's thread as the squares Theseus crosses, one step at a time, and the arrow each
 * square shows. A line is played from the try as it stands; every square the player's figure enters (a step, each
 * square of a slide or a force floor's ride) follows the square before it. A teleport or a catch that throws
 * Theseus back moves him without crossing the squares between, so the square he lands on is a jump: the thread
 * breaks there. DOM-free. */
import type { State } from './puzzle/state.ts';
import { step } from './puzzle/step.ts';
import type { Action } from './puzzle/step.ts';
import type { Cell, Dir } from './puzzle/tiles.ts';

/** A square of the thread; `jump` when Theseus arrives on it by a teleport or a throw-back, not from the square
 *  before it, so no cord joins the two. */
export interface ThreadCell extends Cell { readonly jump?: true }

const adjacent = (a: Cell, b: Cell): boolean => Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
const same = (a: Cell, b: Cell): boolean => a.r === b.r && a.c === b.c;

/** The squares Theseus crosses playing `line` from `start`, his own square first. */
export function threadPath(start: State, line: readonly Action[]): ThreadCell[] {
  const out: ThreadCell[] = [{ r: start.player.r, c: start.player.c }];
  const last = (): Cell => out[out.length - 1]!;
  // A square entered from the last one by a step; anything else arrives by a jump.
  const enter = (c: Cell, jump = false): void => {
    if (same(last(), c)) return;
    out.push(jump || !adjacent(last(), c) ? { r: c.r, c: c.c, jump: true } : { r: c.r, c: c.c });
  };
  let s = start;
  for (const a of line) {
    const r = step(s, a);
    let thrown = false;
    for (const e of r.events) {
      if ((e.kind === 'moved' || e.kind === 'slid') && e.who === 'player') enter(e.to);
      else if (e.kind === 'teleported' && e.who === 'player') enter(e.to, true);
      else if (e.kind === 'caught') thrown = true;
    }
    enter(r.state.player, thrown);
    s = r.state;
  }
  return out;
}

/** The way from square `i` to the next, or null at the thread's end or before a jump. */
export function arrowAt(thread: readonly ThreadCell[], i: number): Dir | null {
  const a = thread[i], b = thread[i + 1];
  if (!a || !b || b.jump) return null;
  if (b.r < a.r) return 'up';
  if (b.r > a.r) return 'down';
  return b.c < a.c ? 'left' : 'right';
}
