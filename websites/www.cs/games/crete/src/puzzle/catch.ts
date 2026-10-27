// websites/www.cs/games/crete/src/puzzle/catch.ts
/* The Island of Crete: the catch every cause shares. A heart lost, Theseus
 * thrown back to his last safe zone, the Minotaur sent home when he lands on
 * it. A hazard on a cell something is thrown onto is never destroyed: it goes
 * back to its own start, or to the nearest free cell. DOM-free. */
import { TERRAIN, HAZARDS, DIRS } from './tiles.ts';
import type { Cell, HazardKind, Terrain } from './tiles.ts';
import { inside, index, next, same } from './state.ts';
import type { Level } from './level.ts';
import { tAt, oAt } from './work.ts';
import type { GameEvent, Work } from './work.ts';

export type CatchCause = 'minotaur' | 'hazard' | 'bomb';

/** The cell a hazard's home stands for: a level hazard's start, or the front of the clone machine that makes one. */
export function homeCell(level: Level, home: number): Cell {
  const h = level.hazards[home];
  if (h) return h.at;
  const m = level.machines.find(x => x.home === home)!;
  return next(m.at, m.dir);
}

/** Theseus leaves `from` by being thrown, not by walking. */
export function leave(_w: Work, _from: Cell, _ev: GameEvent[]): void {}

/** A hazard of this kind may stand on terrain `t`. */
const mayStandOn = (kind: HazardKind, t: Terrain): boolean =>
  TERRAIN[t].hazard || HAZARDS[kind].crosses === t;

/** A hazard of this kind may stand on `x` now: its terrain, with no object, cow, Minotaur, hazard or Theseus there. */
function hazardMayStand(w: Work, kind: HazardKind, x: Cell): boolean {
  return inside(w.level, x) && mayStandOn(kind, tAt(w, x)) && !oAt(w, x)
    && !same(x, w.player) && !same(x, w.minotaur) && !same(x, w.cow)
    && !w.hazards.some(h => same(x, h.at));
}

/** Where a hazard goes when sent home: its home cell, else the nearest free cell breadth-first from it over all
 *  four-neighbours, walls included, ties in reading order; null when no cell on the board can take it. */
function homeFor(w: Work, kind: HazardKind, home: number): Cell | null {
  const start = homeCell(w.level, home);
  const seen = new Set<number>([index(w, start)]);
  let layer: Cell[] = [start];
  while (layer.length > 0) {
    const free = layer.filter(x => hazardMayStand(w, kind, x)).sort((a, b) => index(w, a) - index(w, b));
    if (free.length > 0) return free[0]!;
    const out: Cell[] = [];
    for (const x of layer) {
      for (const d of DIRS) {
        const y = next(x, d);
        if (!inside(w.level, y) || seen.has(index(w, y))) continue;
        seen.add(index(w, y));
        out.push(y);
      }
    }
    layer = out;
  }
  return null;
}

/** The hazard standing on `x`, if any, goes home; with no cell to take it, it is gone (`to: null`). */
function sendHome(w: Work, x: Cell, ev: GameEvent[]): void {
  const i = w.hazards.findIndex(h => same(x, h.at));
  if (i < 0) return;
  const h = w.hazards[i]!;
  w.hazards.splice(i, 1);
  const to = homeFor(w, h.kind, h.home);
  if (to) {
    w.hazards.push({ ...h, at: to });
    w.hazards.sort((a, b) => index(w, a.at) - index(w, b.at));
  }
  ev.push({ kind: 'sent-home', from: x, to });
}

/** A catch: a heart lost, Theseus thrown back, or the try over. */
export function caught(w: Work, ev: GameEvent[], by: CatchCause): void {
  w.hearts--;
  ev.push({ kind: 'caught', at: w.player, hearts: w.hearts, by });
  if (w.hearts <= 0) {
    w.outcome = 'lost';
    ev.push({ kind: 'lost' });
    return;
  }
  leave(w, w.player, ev);
  w.player = w.throwBack;
  let home: Cell | null = null;
  if (same(w.player, w.minotaur)) {
    home = w.level.minotaur!;
    w.minotaur = home;
    if (same(home, w.cow)) w.cow = null;
  }
  sendHome(w, w.player, ev);
  if (home) sendHome(w, home, ev);
}

/** The turn stops here: the try is decided, or something was caught. */
export const turnOver = (w: Work, ev: readonly GameEvent[]): boolean =>
  w.outcome !== 'playing' || ev.some(e => e.kind === 'caught');
