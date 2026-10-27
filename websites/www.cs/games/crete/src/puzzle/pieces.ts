// websites/www.cs/games/crete/src/puzzle/pieces.ts
/* The Island of Crete: the trap and trick pieces' shared rules. Teleports send
 * Theseus and blocks out of the next teleport in reading order; the toggle
 * button flips; a red button makes its clone machine's template; a hazard
 * keeps to the cells it may enter. DOM-free. */
import { TERRAIN, HAZARDS } from './tiles.ts';
import type { Cell, Dir, HazardKind } from './tiles.ts';
import { index, inside, next, same } from './state.ts';
import type { Level } from './level.ts';
import { blockMayEnter, settleBlock } from './step.ts';
import { tAt, oAt } from './work.ts';
import type { GameEvent, Work } from './work.ts';

/** A hazard stands on `x`. */
export const hazardOn = (w: Work, x: Cell): boolean => w.hazards.length > 0 && w.hazards.some(h => same(x, h.at));

/** Something pressed the toggle button: every toggle wall opens or closes. */
export function flip(w: Work, ev: GameEvent[]): void {
  w.terrain = w.terrain.map(t => (t === 'toggle-open' ? 'toggle-closed' : t === 'toggle-closed' ? 'toggle-open' : t));
  ev.push({ kind: 'flipped' });
}

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
    return same(x, w.player) || oAt(w, x) === 'block' || hazardOn(w, x);
  });
}

/** `x` is a snare that holds whatever stands on it: no linked brown button is held down. */
export const heldAt = (w: Work, x: Cell): boolean => tAt(w, x) === 'trap' && !released(w, x.r * w.level.cols + x.c);

/** A hazard of this kind may stand on the terrain at `x`. */
function hazardGround(w: Work, kind: HazardKind, x: Cell): boolean {
  if (!inside(w.level, x)) return false;
  const t = tAt(w, x);
  return TERRAIN[t].hazard || HAZARDS[kind].crosses === t;
}

/** A hazard of this kind has room on `x`, Theseus aside: terrain it may stand on, and no object, cow, Minotaur
 *  (stone or not) or hazard there. */
export const hazardRoom = (w: Work, kind: HazardKind, x: Cell): boolean =>
  hazardGround(w, kind, x) && !oAt(w, x) && !same(x, w.minotaur) && !same(x, w.cow) && !hazardOn(w, x);

/** A hazard of this kind, not held, may move onto `x`: Theseus's cell whenever its terrain lets the hazard in (a
 *  catch, whatever else stands there), else a cell with room. */
export const hazardMayGo = (w: Work, kind: HazardKind, x: Cell): boolean =>
  same(x, w.player) ? hazardGround(w, kind, x) : hazardRoom(w, kind, x);

/** Hazard `i` has landed on its cell, Theseus not there: a bomb destroys it, buttons press, a snare holds it.
 *  `keep` is the cell Theseus is stepping into. */
export function hazardLands(w: Work, i: number, ev: GameEvent[], keep?: Cell): 'on' | 'gone' {
  const h = w.hazards[i]!;
  const t = tAt(w, h.at);
  if (t === 'bomb') {
    w.terrain[index(w, h.at)] = 'floor';
    w.hazards.splice(i, 1);
    ev.push({ kind: 'exploded', who: 'hazard', at: h.at });
    return 'gone';
  }
  if (t === 'button') flip(w, ev);
  else if (t === 'button-red') fireRed(w, index(w, h.at), ev, keep);
  if (heldAt(w, h.at)) ev.push({ kind: 'held', who: 'hazard', at: h.at });
  return 'on';
}

/** The red button at index `button` fires: its machine's template appears in front of the machine when that cell
 *  is free for it, never on Theseus nor on `keep`, the cell he is stepping into. A block then settles as if pushed
 *  the machine's way; a hazard faces that way and lands, first moving in the next hazard phase. Each clone takes
 *  a free cell or uses up a bomb or water, so a chain of firings ends. */
export function fireRed(w: Work, button: number, ev: GameEvent[], keep?: Cell): void {
  const c = w.level.links[button];
  if (c === undefined) return;
  const m = w.level.machines.find(x => index(w, x.at) === c)!;
  const front = next(m.at, m.dir);
  if (keep && same(front, keep)) return;
  if (m.template === 'block') {
    if (!blockMayEnter(w, front)) return;
    w.objects[index(w, front)] = 'block';
    ev.push({ kind: 'cloned', what: 'block', at: front });
    settleBlock(w, front, m.dir, keep, ev);
    return;
  }
  if (!hazardRoom(w, m.template, front) || same(front, w.player)) return;
  const h = { kind: m.template, at: front, dir: m.dir, home: m.home! };
  let i = w.hazards.length;
  if (!w.inHazardPhase) {
    const f = index(w, front);
    while (i > 0 && index(w, w.hazards[i - 1]!.at) > f) i--;
  }
  w.hazards.splice(i, 0, h);
  ev.push({ kind: 'cloned', what: m.template, at: front });
  hazardLands(w, i, ev, keep);
}
