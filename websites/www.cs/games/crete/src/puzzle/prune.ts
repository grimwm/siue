/* The Island of Crete: pruning that never changes an answer, for the A* search (astar.ts). A situation is dropped
 * when it can never win (its estimate, heuristic.ts, is infinite), or when one already seen is the same but for
 * resources that only help, holds at least as much of each, and was reached in no more moves: whatever wins from
 * the dropped one wins as fast from that one. Those resources are hearts, keys, the three tools, flippers, fire
 * boots and pages. More of any of them never forces a different turn, with two exceptions the level is checked
 * for: a ride (ice, a force floor) carries Theseus through a door he holds the key to, or into water or fire he
 * holds the gear for, where without it the ride would stop; and a teleport exit beside such a door, water or fire
 * is open to him with the key or gear and blocked without, so he comes out of a different teleport. A key colour
 * or gear a ride or a teleport exit could meet so is not compared. Skates and suction boots change where rides
 * stop, so they must match. The rest hold with every piece: a thief takes all gear from either situation alike; a
 * catch by the Minotaur, a hazard or a bomb costs one heart and throws Theseus back whatever he holds; snares,
 * buttons, clone machines and the hazards never look at what he holds. DOM-free. */
import { DELTA, DIRS, KEY_COLORS, TERRAIN } from './tiles.ts';
import type { Gear, Terrain } from './tiles.ts';
import type { Level } from './level.ts';
import type { State } from './state.ts';
import { get, put } from './pack.ts';
import type { Layout } from './pack.ts';
import { estimateOf } from './heuristic.ts';
import { hashOf } from './store.ts';

export interface Prune {
  /** True when the node can be dropped. `s.moves` is its moves from the start; `words` is `s` packed. */
  (s: State, words: Uint32Array, at: number): boolean;
}

/** A field compared for dominance: a count (more is better) or a set of bits (a superset is better). */
interface Field { pos: number; width: number; set: boolean }

/** True when a ride could be forced onto a cell whose terrain `onto` names: the cell next to it along some
 *  direction is ice, or a force floor carrying that way. */
function rideMeets(lv: Level, onto: (t: Terrain) => boolean): boolean {
  for (let i = 0; i < lv.terrain.length; i++) {
    if (!onto(lv.terrain[i]!)) continue;
    const r = Math.floor(i / lv.cols), c = i % lv.cols;
    for (const d of DIRS) {
      const fr = r - DELTA[d][0], fc = c - DELTA[d][1];
      if (fr < 0 || fc < 0 || fr >= lv.rows || fc >= lv.cols) continue;
      const def = TERRAIN[lv.terrain[fr * lv.cols + fc]!];
      if (def.slides || def.carries === d) return true;
    }
  }
  return false;
}

/** True when a teleport exit could be blocked or not by a cell whose terrain `onto` names: it is next to a
 *  teleport, in a level with two or more. */
function teleportMeets(lv: Level, onto: (t: Terrain) => boolean): boolean {
  const teleports = lv.terrain.flatMap((t, i) => (t === 'teleport' ? [i] : []));
  if (teleports.length < 2) return false;
  return teleports.some(i => DIRS.some(d => {
    const r = Math.floor(i / lv.cols) + DELTA[d][0], c = (i % lv.cols) + DELTA[d][1];
    return r >= 0 && c >= 0 && r < lv.rows && c < lv.cols && onto(lv.terrain[r * lv.cols + c]!);
  }));
}

/** A key colour or gear whose holding could force a different turn: a ride or a teleport exit could meet it. */
const forced = (lv: Level, onto: (t: Terrain) => boolean): boolean => rideMeets(lv, onto) || teleportMeets(lv, onto);

/** The fields this level compares. */
function dominance(lv: Level, l: Layout): Field[] {
  const out: Field[] = [];
  if (l.heartBits) out.push({ pos: l.heartAt, width: l.heartBits, set: false });
  if (l.pageBits) out.push({ pos: l.pageAt, width: l.pageBits, set: true });
  KEY_COLORS.forEach((k, i) => {
    if (l.keyBits[i] && !forced(lv, t => TERRAIN[t].door === k)) out.push({ pos: l.keyAt[i]!, width: l.keyBits[i]!, set: false });
  });
  l.toolBits.forEach((b, i) => { if (b) out.push({ pos: l.toolAt[i]!, width: b, set: false }); });
  const free: readonly Gear[] = ['flippers', 'fire-boots'];
  l.gear.forEach((g, i) => {
    if (free.includes(g) && !forced(lv, t => TERRAIN[t].needs === g)) out.push({ pos: l.gearAt + i, width: 1, set: false });
  });
  return out;
}

const FIRST = 1024;

/** The level's pruning. It keeps, for every situation it let through, its dominance fields (copied side by side
 *  into a word or two) and moves, indexed by its words with those fields masked out; within one index entry it
 *  keeps only those no other one dominates. */
export function pruneFor(level: Level, layout: Layout): Prune {
  const estimate = estimateOf(level);
  const fields = dominance(level, layout);
  if (!fields.length) return s => estimate(s) === Infinity;
  const W = layout.words;
  const mask = new Uint32Array(W);
  for (const f of fields) for (let b = f.pos; b < f.pos + f.width; b++) mask[b >>> 5]! |= 1 << (b & 31);
  // The fields side by side: where each starts, and the words they take.
  const at0: number[] = [];
  let D = 0;
  for (const f of fields) { at0.push(D); D += f.width; }
  const E = (D + 31) >>> 5;

  // Groups: the masked words and the first of their entries.
  let room = FIRST;
  let keys = new Uint32Array(room * W);
  let heads = new Int32Array(room);
  let groups = 0;
  /** Slots hold group + 1; 0 is empty. Kept at most half full. */
  let table = new Int32Array(FIRST * 2);
  let tmask = table.length - 1;
  // Entries: the dominance fields, the moves, and the next entry of the group (-1 at the end). Freed ones are reused.
  let eroom = FIRST;
  let vals = new Uint32Array(eroom * E);
  let moves = new Uint32Array(eroom);
  let nexts = new Int32Array(eroom);
  let entries = 0;
  let free = -1;
  const key = new Uint32Array(W);
  /** The situation asked about: its dominance fields side by side. */
  const cur = new Uint32Array(E);

  function growGroups(): void {
    room *= 2;
    const k = new Uint32Array(room * W); k.set(keys); keys = k;
    const d = new Int32Array(room); d.set(heads); heads = d;
    table = new Int32Array(room * 2);
    tmask = table.length - 1;
    for (let g = 0; g < groups; g++) {
      let slot = hashOf(keys, g * W, W) & tmask;
      while (table[slot] !== 0) slot = (slot + 1) & tmask;
      table[slot] = g + 1;
    }
  }

  function newEntry(g: number, next: number): number {
    let e = free;
    if (e >= 0) free = nexts[e]!;
    else {
      if (entries === eroom) {
        eroom *= 2;
        const v = new Uint32Array(eroom * E); v.set(vals); vals = v;
        const m = new Uint32Array(eroom); m.set(moves); moves = m;
        const n = new Int32Array(eroom); n.set(nexts); nexts = n;
      }
      e = entries++;
    }
    vals.set(cur, e * E);
    moves[e] = g;
    nexts[e] = next;
    return e;
  }

  /** Every field of `a` at least as good as `b`'s (fields side by side). */
  function atLeast(a: Uint32Array, aAt: number, b: Uint32Array, bAt: number): boolean {
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i]!;
      const va = get(a, aAt, at0[i]!, f.width);
      const vb = get(b, bAt, at0[i]!, f.width);
      if (f.set ? (va & vb) !== vb : va < vb) return false;
    }
    return true;
  }

  return (s, words, at) => {
    if (estimate(s) === Infinity) return true;
    const g = s.moves;
    for (let i = 0; i < W; i++) key[i] = words[at + i]! & ~mask[i]!;
    const h = hashOf(key, 0, W);
    cur.fill(0);
    for (let i = 0; i < fields.length; i++) put(cur, 0, at0[i]!, fields[i]!.width, get(words, at, fields[i]!.pos, fields[i]!.width));
    let slot = h & tmask;
    let group = -1;
    for (let e = table[slot]!; e !== 0; slot = (slot + 1) & tmask, e = table[slot]!) {
      const k = e - 1;
      let same = true;
      for (let i = 0; i < W && same; i++) same = keys[k * W + i] === key[i];
      if (same) { group = k; break; }
    }
    if (group < 0) {
      if (groups === room) {
        growGroups();
        slot = h & tmask;
        while (table[slot] !== 0) slot = (slot + 1) & tmask;
      }
      group = groups++;
      keys.set(key, group * W);
      table[slot] = group + 1;
      heads[group] = newEntry(g, -1);
      return false;
    }
    for (let e = heads[group]!; e >= 0; e = nexts[e]!) if (moves[e]! <= g && atLeast(vals, e * E, cur, 0)) return true;
    // Kept: entries it dominates are dropped from the group, as it prunes everything they would.
    let prev = -1;
    for (let e = heads[group]!; e >= 0;) {
      const next = nexts[e]!;
      if (g <= moves[e]! && atLeast(cur, 0, vals, e * E)) {
        if (prev < 0) heads[group] = next; else nexts[prev] = next;
        nexts[e] = free;
        free = e;
      } else prev = e;
      e = next;
    }
    heads[group] = newEntry(g, heads[group]!);
    return false;
  };
}
