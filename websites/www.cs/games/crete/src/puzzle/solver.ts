/* The Island of Crete: the exact solver. Breadth-first over states from the
 * one given, so the first win found is a shortest line. It proves every trial
 * winnable and drives Ariadne's thread (one step, the whole line drawn, or
 * played out). DOM-free. */
import { DIRS, TERRAIN, OBJECTS, KEY_COLORS } from './tiles.ts';
import type { Tool } from './tiles.ts';
import { step } from './step.ts';
import type { Action } from './step.ts';
import type { State } from './state.ts';

export const SOLVER_CAP = 2_000_000;

export type SolveResult =
  | { solved: true; line: Action[]; explored: number }
  | { solved: false; explored: number; capped: boolean };

const cell = (x: { r: number; c: number } | null) => (x ? `${x.r},${x.c}` : '-');

/** Everything that can change during a try, as one string. Moves are left out: the search is breadth-first. */
export function stateKey(s: State): string {
  return [
    cell(s.player), cell(s.minotaur), cell(s.cow), cell(s.throwBack), s.stone, s.hearts, s.relicsLeft, s.pages,
    KEY_COLORS.map(k => s.keys[k]).join(''), s.gear.slice().sort().join('+'),
    s.tools.mirror, s.tools.cake, s.tools.cow,
    s.terrain.map(t => TERRAIN[t].char).join(''),
    s.objects.map(o => (o ? OBJECTS[o].char : '.')).join(''),
  ].join('|');
}

function actions(s: State): Action[] {
  const out: Action[] = DIRS.map(dir => ({ kind: 'move', dir }));
  out.push({ kind: 'wait' });
  for (const tool of ['mirror', 'cake', 'cow'] as Tool[]) if (s.tools[tool] > 0) out.push({ kind: 'tool', tool });
  return out;
}

export function solve(start: State, cap = SOLVER_CAP): SolveResult {
  if (start.outcome === 'won') return { solved: true, line: [], explored: 0 };
  const states: State[] = [start];
  const parent: number[] = [-1];
  const via: (Action | null)[] = [null];
  const seen = new Set<string>([stateKey(start)]);
  for (let head = 0; head < states.length; head++) {
    const s = states[head]!;
    for (const a of actions(s)) {
      const n = step(s, a).state;
      if (n === s || n.outcome === 'lost') continue;
      const k = stateKey(n);
      if (seen.has(k)) continue;
      seen.add(k);
      states.push(n);
      parent.push(head);
      via.push(a);
      if (n.outcome === 'won') {
        const line: Action[] = [];
        for (let i = states.length - 1; i > 0; i = parent[i]!) line.unshift(via[i]!);
        return { solved: true, line, explored: states.length };
      }
      if (states.length >= cap) return { solved: false, explored: states.length, capped: true };
    }
  }
  return { solved: false, explored: states.length, capped: false };
}
