/* The Island of Crete: the exact solver. It proves every level winnable and
 * drives Ariadne's thread (one step, the whole line drawn, or played out).
 * It searches with A* over packed situations (astar.ts), dropping those that cannot change the answer
 * (prune.ts). DOM-free. */
import { astar, searching } from './astar.ts';
import type { Progress } from './astar.ts';
import { pruneFor } from './prune.ts';
import { layoutOf } from './pack.ts';
import type { NodeStore } from './store.ts';
import type { State } from './state.ts';
import type { Action, GameEvent } from './step.ts';

/** Situations a search stores at most before it gives up. */
export const SOLVER_CAP = 2_000_000;

export type SolveResult =
  | { solved: true; line: Action[]; explored: number }
  | { solved: false; explored: number; capped: boolean; reason?: string };

/** A turn the search treats as a dead end, given its events and the state it was played from. */
export type Refuse = (events: readonly GameEvent[], before: State) => boolean;

/** A turn that ends in a catch. */
export const caught: Refuse = events => events.some(e => e.kind === 'caught');

/** Where a batched search keeps its nodes and how many it expands per batch. */
export interface SearchRoom { store?: NodeStore; every?: number }

/** A shortest winning line from `start`, or `solved: false` (`capped` says whether the search gave up). */
export function solve(start: State, cap = SOLVER_CAP): SolveResult {
  return astar(start, { cap, refuse: null, prune: pruneFor(start.level, layoutOf(start.level)) });
}

/** The same search, but a turn that `refuse` names is a dead end: the shortest line that never plays one.
 *  `solved: false, capped: false` proves there is none. */
export function solveRefusing(start: State, refuse: Refuse, cap = SOLVER_CAP): SolveResult {
  return astar(start, { cap, refuse, prune: pruneFor(start.level, layoutOf(start.level)) });
}

/** solve (refuse null) or solveRefusing in batches (astar.ts's searching): it yields its progress between them. */
export function solving(start: State, refuse: Refuse | null, cap = SOLVER_CAP, room: SearchRoom = {}): Generator<Progress, SolveResult, void> {
  return searching(start, { cap, refuse, prune: pruneFor(start.level, layoutOf(start.level)), store: room.store, progressEvery: room.every });
}
