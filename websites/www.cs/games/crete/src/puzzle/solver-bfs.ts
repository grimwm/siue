/* The Island of Crete: the breadth-first reference solver. Exact and simple: the first win found is a shortest
 * line. Every faster solver must give its answers (test/same-answers.test.ts). DOM-free. */
import { DIRS, TERRAIN, OBJECTS, KEY_COLORS } from './tiles.ts';
import type { Terrain, Tool } from './tiles.ts';
import type { Level } from './level.ts';
import { step } from './step.ts';
import type { Action, GameEvent } from './step.ts';
import type { State } from './state.ts';

export const SOLVER_CAP = 2_000_000;

export type SolveResult =
  | { solved: true; line: Action[]; explored: number }
  | { solved: false; explored: number; capped: boolean; reason?: string };

const cell = (x: { r: number; c: number } | null) => (x ? `${x.r},${x.c}` : '-');

/** The cells whose terrain can change during a try: doors open, toggle walls flip, water fills in. */
const changing = new WeakMap<Level, number[]>();
function changingCells(lv: Level): number[] {
  let list = changing.get(lv);
  if (!list) {
    const may = (t: Terrain) => t === 'water' || t === 'toggle-open' || t === 'toggle-closed' || TERRAIN[t].door !== undefined;
    list = [];
    lv.terrain.forEach((t, i) => { if (may(t)) list!.push(i); });
    changing.set(lv, list);
  }
  return list;
}

/** Everything that can change during a try, as one string. Moves are left out: the search is breadth-first. */
export function stateKey(s: State): string {
  const objects: string[] = [];
  s.objects.forEach((o, i) => { if (o) objects.push(`${i}:${OBJECTS[o].char}`); });
  return [
    cell(s.player), cell(s.minotaur), cell(s.cow), cell(s.throwBack),
    [s.stone, s.hearts, s.relicsLeft, s.pages, ...KEY_COLORS.map(k => s.keys[k]), s.tools.mirror, s.tools.cake, s.tools.cow].join(','),
    s.gear.slice().sort().join('+'),
    changingCells(s.level).map(i => TERRAIN[s.terrain[i]!].char).join(''),
    objects.join(' '),
  ].join('|');
}

/** The actions a state offers, each as a small int: 0-3 a move (DIRS order), 4 a wait, 5-7 a tool. The wait comes
 *  first, so of two equally short lines the breadth-first search keeps the one that waits in place. */
const TOOL_LIST: readonly Tool[] = ['mirror', 'cake', 'cow'];
const WAIT_CODE = DIRS.length;
function actionCodes(s: State): number[] {
  const out = [WAIT_CODE, ...DIRS.map((_, i) => i)];
  TOOL_LIST.forEach((tool, i) => { if (s.tools[tool] > 0) out.push(WAIT_CODE + 1 + i); });
  return out;
}
function decode(code: number): Action {
  if (code < WAIT_CODE) return { kind: 'move', dir: DIRS[code]! };
  if (code === WAIT_CODE) return { kind: 'wait' };
  return { kind: 'tool', tool: TOOL_LIST[code - WAIT_CODE - 1]! };
}

/** A turn the search treats as a dead end, given its events and the state it was played from. */
export type Refuse = (events: readonly GameEvent[], before: State) => boolean;

/** Breadth-first. A state is kept only until it has been expanded; a visited node costs a parent index, an
 *  action code and its key. */
export function solveBfs(start: State, cap = SOLVER_CAP): SolveResult {
  return search(start, cap, null);
}

/** The same search, but a turn that `refuse` names is a dead end: the shortest line that never plays one.
 *  `solved: false, capped: false` proves there is none. */
export function solveBfsRefusing(start: State, refuse: Refuse, cap = SOLVER_CAP): SolveResult {
  return search(start, cap, refuse);
}

/** A turn that ends in a catch. */
export const caught: Refuse = events => events.some(e => e.kind === 'caught');

function search(start: State, cap: number, refuse: Refuse | null): SolveResult {
  if (start.outcome === 'won') return { solved: true, line: [], explored: 0 };
  const queue: (State | null)[] = [start];
  const parent: number[] = [-1];
  const via: number[] = [-1];
  const seen = new Set<string>([stateKey(start)]);
  if (queue.length >= cap) return { solved: false, explored: queue.length, capped: true };
  for (let head = 0; head < queue.length; head++) {
    const s = queue[head]!;
    queue[head] = null;
    for (const code of actionCodes(s)) {
      const r = step(s, decode(code));
      const n = r.state;
      if (n === s || n.outcome === 'lost' || (refuse && refuse(r.events, s))) continue;
      const k = stateKey(n);
      if (seen.has(k)) continue;
      seen.add(k);
      queue.push(n);
      parent.push(head);
      via.push(code);
      if (n.outcome === 'won') {
        const line: Action[] = [];
        for (let i = queue.length - 1; i > 0; i = parent[i]!) line.unshift(decode(via[i]!));
        return { solved: true, line, explored: queue.length };
      }
      if (queue.length >= cap) return { solved: false, explored: queue.length, capped: true };
    }
  }
  return { solved: false, explored: queue.length, capped: false };
}
