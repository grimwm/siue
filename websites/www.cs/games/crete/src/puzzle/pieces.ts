// websites/www.cs/games/crete/src/puzzle/pieces.ts
/* The Island of Crete: the trap and trick pieces' shared rules. Teleports send
 * Theseus and blocks out of the next teleport in reading order. DOM-free. */
import type { Cell, Dir } from './tiles.ts';
import { next } from './state.ts';
import type { Level } from './level.ts';
import { tAt } from './work.ts';
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
