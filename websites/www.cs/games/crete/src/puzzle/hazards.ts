/* The Island of Crete: the moving hazards' phase, between Theseus's action and
 * the Minotaur's steps. Each hazard goes ahead, or turns by its own rule when
 * blocked; ice and force floors move it on as they move the Minotaur. DOM-free. */
import { TERRAIN, HAZARDS } from './tiles.ts';
import type { Dir } from './tiles.ts';
import { index, next, same } from './state.ts';
import { caught } from './catch.ts';
import { flip, hazardMayEnter, heldAt } from './pieces.ts';
import { tAt } from './work.ts';
import type { GameEvent, Work } from './work.ts';

/** Each turn, relative to the way a hazard faces. */
const TURN: Record<'ahead' | 'left' | 'right' | 'back', Record<Dir, Dir>> = {
  ahead: { up: 'up', down: 'down', left: 'left', right: 'right' },
  left: { up: 'left', left: 'down', down: 'right', right: 'up' },
  right: { up: 'right', right: 'down', down: 'left', left: 'up' },
  back: { up: 'down', down: 'up', left: 'right', right: 'left' },
};

/** How a hazard's move ended: it stands somewhere, it is gone, or it caught Theseus. */
type Outcome = 'on' | 'gone' | 'caught';

/** Hazard `i` has just entered its cell: it catches Theseus, explodes on a bomb, presses the toggle button or is
 *  held by a snare. */
function arrive(w: Work, i: number, ev: GameEvent[]): Outcome {
  const h = w.hazards[i]!;
  if (same(h.at, w.player)) {
    caught(w, ev, 'hazard');
    return 'caught';
  }
  const t = tAt(w, h.at);
  if (t === 'bomb') {
    w.terrain[index(w, h.at)] = 'floor';
    w.hazards.splice(i, 1);
    ev.push({ kind: 'exploded', who: 'hazard', at: h.at });
    return 'gone';
  }
  if (t === 'button') flip(w, ev);
  if (heldAt(w, h.at)) ev.push({ kind: 'held', who: 'hazard', at: h.at });
  return 'on';
}

/** Hazard `i`'s move: ahead, else the first of its turns it may enter; then on over ice and force floors until the
 *  slide is stopped, would cross itself, or the hazard is gone or has caught Theseus. */
function moveHazard(w: Work, i: number, ev: GameEvent[]): Outcome {
  let h = w.hazards[i]!;
  let dir: Dir | undefined = h.dir;
  if (!hazardMayEnter(w, h, next(h.at, dir))) {
    dir = undefined;
    for (const turn of HAZARDS[h.kind].turns) {
      const d = TURN[turn][h.dir];
      if (hazardMayEnter(w, h, next(h.at, d))) {
        dir = d;
        break;
      }
    }
  }
  if (!dir) return 'on';
  let to = next(h.at, dir);
  ev.push({ kind: 'moved', who: 'hazard', hazard: h.kind, from: h.at, to });
  const seen = new Set<number>([index(w, to)]);
  for (;;) {
    h = w.hazards[i] = { ...h, at: to, dir };
    const end = arrive(w, i, ev);
    if (end !== 'on') return end;
    const def = TERRAIN[tAt(w, to)];
    if (def.carries) {
      dir = def.carries;
      if (h.dir !== dir) h = w.hazards[i] = { ...h, dir };
    } else if (!def.slides) return 'on';
    const on = next(to, dir);
    if (seen.has(index(w, on)) || !hazardMayEnter(w, h, on)) return 'on';
    ev.push({ kind: 'slid', who: 'hazard', hazard: h.kind, from: to, to: on });
    seen.add(index(w, on));
    to = on;
  }
}

/** Every hazard moves once, in reading order of the cells they stood on when the phase began; a hazard that moves
 *  keeps its place in that order. A catch ends the phase. */
export function hazardPhase(w: Work, ev: GameEvent[]): void {
  if (w.hazards.length === 0) return;
  for (let i = 0, n = w.hazards.length; i < n;) {
    const end = moveHazard(w, i, ev);
    if (end === 'caught') break;
    if (end === 'gone') n--;
    else i++;
  }
  w.hazards.sort((a, b) => index(w, a.at) - index(w, b.at));
}
