/* The Island of Crete: the moving hazards' phase, between Theseus's action and
 * the Minotaur's steps. Each hazard goes ahead, or turns by its own rule when
 * blocked; ice and force floors move it on as they move the Minotaur. DOM-free. */
import { TERRAIN, HAZARDS } from './tiles.ts';
import type { Dir } from './tiles.ts';
import { index, next, same } from './state.ts';
import { caught } from './catch.ts';
import { hazardLands, hazardMayGo, hazardPhaseOf, heldAt } from './pieces.ts';
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

/** Hazard `i` has just entered its cell: it catches Theseus (a cow set down there is lost), else it lands. */
function arrive(w: Work, i: number, ev: GameEvent[]): Outcome {
  if (same(w.hazards[i]!.at, w.player)) {
    if (same(w.player, w.cow)) w.cow = null;
    caught(w, ev, 'hazard');
    return 'caught';
  }
  return hazardLands(w, i, ev);
}

/** Hazard `i`'s move: ahead, else the first of its turns it may enter; then on over ice and force floors until the
 *  slide is stopped, would cross itself, or the hazard is gone or has caught Theseus. */
function moveHazard(w: Work, i: number, ev: GameEvent[]): Outcome {
  let h = w.hazards[i]!;
  if (heldAt(w, h.at)) return 'on';
  let dir: Dir | undefined = h.dir;
  if (!hazardMayGo(w, h.kind, next(h.at, dir))) {
    dir = undefined;
    for (const turn of HAZARDS[h.kind].turns) {
      const d = TURN[turn][h.dir];
      if (hazardMayGo(w, h.kind, next(h.at, d))) {
        dir = d;
        break;
      }
    }
  }
  if (!dir) return 'on';
  let to = next(h.at, dir);
  ev.push({ kind: 'moved', who: 'hazard', hazard: h.kind, from: h.at, to });
  let seen: Set<number> | null = null;
  for (;;) {
    h = w.hazards[i] = { ...h, at: to, dir };
    const end = arrive(w, i, ev);
    if (end !== 'on') return end;
    const def = TERRAIN[tAt(w, to)];
    if (def.carries) {
      dir = def.carries;
      if (h.dir !== dir) h = w.hazards[i] = { ...h, dir };
    } else if (!def.slides) return 'on';
    // Ice and force floors are never snares, so a sliding hazard is never held.
    seen ??= new Set<number>([index(w, to)]);
    const on = next(to, dir);
    if (seen.has(index(w, on)) || !hazardMayGo(w, h.kind, on)) return 'on';
    ev.push({ kind: 'slid', who: 'hazard', hazard: h.kind, from: to, to: on });
    seen.add(index(w, on));
    to = on;
  }
}

/** Every hazard moves once, in reading order of the cells they stood on when the phase began; a hazard that moves
 *  keeps its place in that order. A hazard cloned in the phase joins the end of the list and does not move until
 *  the next phase. A catch ends the phase. */
export function hazardPhase(w: Work, ev: GameEvent[]): void {
  if (w.hazards.length === 0) return;
  hazardPhaseOf(w);
  for (let i = 0, n = w.hazards.length; i < n;) {
    const end = moveHazard(w, i, ev);
    if (end === 'caught') break;
    if (end === 'gone') n--;
    else i++;
  }
  hazardPhaseOf(null);
  w.hazards.sort((a, b) => index(w, a.at) - index(w, b.at));
}
