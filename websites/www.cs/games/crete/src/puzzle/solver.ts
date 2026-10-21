/* The Island of Crete: the exact solver. It proves every level winnable and
 * drives Ariadne's thread (one step, the whole line drawn, or played out).
 * Today it is the breadth-first reference in solver-bfs.ts. DOM-free. */
import { solveBfs, solveBfsRefusing, SOLVER_CAP } from './solver-bfs.ts';
import type { SolveResult, Refuse } from './solver-bfs.ts';
import type { State } from './state.ts';
export { SOLVER_CAP, caught } from './solver-bfs.ts';
export type { SolveResult, Refuse } from './solver-bfs.ts';

/** A shortest winning line from `start`, or `solved: false` (`capped` says whether the search gave up). */
export function solve(start: State, cap = SOLVER_CAP): SolveResult {
  return solveBfs(start, cap);
}

/** The same search, but a turn that `refuse` names is a dead end: the shortest line that never plays one.
 *  `solved: false, capped: false` proves there is none. */
export function solveRefusing(start: State, refuse: Refuse, cap = SOLVER_CAP): SolveResult {
  return solveBfsRefusing(start, refuse, cap);
}
