// websites/www.cs/games/crete/src/puzzle/pieces.ts
/* The Island of Crete: the trap and trick pieces' shared rules. Teleports send
 * Theseus and blocks out of the next teleport in reading order. DOM-free. */
import type { Cell, Dir } from './tiles.ts';
import { next, same } from './state.ts';
import type { Level } from './level.ts';
import { tAt, oAt } from './work.ts';
import type { Work } from './work.ts';

const teleportLists = new WeakMap<Level, readonly number[]>();

/** The level's teleport cells as indices in reading order. Teleports never change, so it is computed once a level. */
function teleportsOf(level: Level): readonly number[] {
  let list = teleportLists.get(level);
  if (!list) {
    list = level.terrain.flatMap((t, i) => (t === 'teleport' ? [i] : []));
    teleportLists.set(level, list);
  }
  return list;
}

/** The level has a teleport to come out of: a lone teleport is wall. */
export const teleportsLinked = (level: Level): boolean => teleportsOf(level).length > 1;

/** Where a figure entering the teleport at `entry` heading `d` comes out: the teleports after `entry` in reading
 *  order, wrapping, `entry` excluded; the first whose cell beyond in `d` is not a teleport and passes `mayEnter`.
 *  Null when every exit is blocked. */
export function teleportExit(w: Work, entry: Cell, d: Dir, mayEnter: (beyond: Cell) => boolean): { via: Cell; to: Cell } | null {
  const { cols } = w.level;
  const list = teleportsOf(w.level);
  const e = entry.r * cols + entry.c;
  const first = list.findIndex(i => i > e);
  for (let k = 0; k < list.length; k++) {
    const i = list[((first < 0 ? 0 : first) + k) % list.length]!;
    if (i === e) continue;
    const via = { r: Math.floor(i / cols), c: i % cols };
    const to = next(via, d);
    if (tAt(w, to) !== 'teleport' && mayEnter(to)) return { via, to };
  }
  return null;
}

const trapButtons = new WeakMap<Level, ReadonlyMap<number, readonly number[]>>();

/** Each snare's brown buttons, as cell indices. Links never change, so it is computed once a level. */
function buttonsOf(level: Level): ReadonlyMap<number, readonly number[]> {
  let m = trapButtons.get(level);
  if (!m) {
    const build = new Map<number, number[]>();
    for (const [b, t] of Object.entries(level.links)) {
      if (level.terrain[t] !== 'trap') continue;
      const list = build.get(t);
      if (list) list.push(Number(b));
      else build.set(t, [Number(b)]);
    }
    m = build;
    trapButtons.set(level, m);
  }
  return m;
}

/** The snare at index `trap` is released: Theseus, a block or a hazard stands on a brown button linked to it. The
 *  Minotaur and the cow never release it. */
export function released(w: Work, trap: number): boolean {
  const buttons = buttonsOf(w.level).get(trap);
  if (!buttons) return false;
  const { cols } = w.level;
  return buttons.some(b => {
    const x = { r: Math.floor(b / cols), c: b % cols };
    return same(x, w.player) || oAt(w, x) === 'block' || (w.hazards.length > 0 && w.hazards.some(h => same(x, h.at)));
  });
}

/** `x` is a snare that holds whatever stands on it: no linked brown button is held down. */
export const heldAt = (w: Work, x: Cell): boolean => tAt(w, x) === 'trap' && !released(w, x.r * w.level.cols + x.c);
