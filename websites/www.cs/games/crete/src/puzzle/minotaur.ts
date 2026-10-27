// websites/www.cs/games/crete/src/puzzle/minotaur.ts
/* The Island of Crete: the Minotaur's rule, the one from Theseus and the
 * Minotaur. Each turn it takes two steps toward its target (the cow while one
 * stands, else the player): one cell along the horizontal gap if that cell is
 * open to it, else along the vertical gap, else it stays. It never picks
 * anything up, never presses a button and never dies. DOM-free. */
import { TERRAIN } from './tiles.ts';
import type { Cell, Dir } from './tiles.ts';
import { inside, index, next, same } from './state.ts';
import { tAt, oAt } from './work.ts';
import { caught } from './catch.ts';
import type { GameEvent, Work } from './work.ts';

export function minotaurMayEnter(w: Work, x: Cell): boolean {
  return inside(w.level, x) && TERRAIN[tAt(w, x)].minotaur && oAt(w, x) !== 'block';
}

/** The Minotaur arrives on `to`: the cow is gone, the player is caught. True when the turn's steps end. */
function arrive(w: Work, to: Cell, ev: GameEvent[]): boolean {
  w.minotaur = to;
  if (same(to, w.cow)) w.cow = null;
  if (same(to, w.player)) {
    caught(w, ev, 'minotaur');
    return true;
  }
  return false;
}

/** One step. True when the turn's steps end (a catch). */
export function minotaurStep(w: Work, ev: GameEvent[]): boolean {
  const m = w.minotaur;
  if (!m) return true;
  const target = w.cow ?? w.player;
  const dc = Math.sign(target.c - m.c);
  const dr = Math.sign(target.r - m.r);
  const tries: Dir[] = [];
  if (dc) tries.push(dc > 0 ? 'right' : 'left');
  if (dr) tries.push(dr > 0 ? 'down' : 'up');
  const d = tries.find(dir => minotaurMayEnter(w, next(m, dir)));
  if (!d) return false;
  const to = next(m, d);
  ev.push({ kind: 'moved', who: 'minotaur', from: m, to });
  if (arrive(w, to, ev)) return true;
  // Ice and force floors move it on, as they move the player.
  let dir = d;
  const seen = new Set<number>([index(w, to)]);
  for (;;) {
    const def = TERRAIN[tAt(w, w.minotaur!)];
    if (def.carries) dir = def.carries;
    else if (!def.slides) return false;
    const on = next(w.minotaur!, dir);
    if (!minotaurMayEnter(w, on) || seen.has(index(w, on))) return false;
    ev.push({ kind: 'slid', who: 'minotaur', from: w.minotaur!, to: on });
    seen.add(index(w, on));
    if (arrive(w, on, ev)) return true;
  }
}

/** Its turn: a stone turn, or two steps. */
export function minotaurPhase(w: Work, ev: GameEvent[]): void {
  if (!w.minotaur) return;
  if (w.stone > 0) {
    w.stone--;
    return;
  }
  for (let i = 0; i < 2 && w.outcome === 'playing'; i++) if (minotaurStep(w, ev)) return;
}
