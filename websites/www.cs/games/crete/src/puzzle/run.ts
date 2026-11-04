/* The Island of Crete: one try at a level, with its undo. Undo is the list of
 * earlier states; restart goes back to the level's start. A turn that brings
 * the whole situation back to an earlier one (the player retraced their steps
 * and everything else came back too) is an undo to there: the turns between go,
 * as if Undo had been pressed that many times. Any help from Ariadne's thread
 * marks the try assisted, and restart keeps the mark: only opening the level
 * again clears it. DOM-free. */
import { initial } from './state.ts';
import type { State } from './state.ts';
import { step, noTurn } from './step.ts';
import type { Action, GameEvent } from './step.ts';
import type { Level } from './level.ts';

export interface Run {
  readonly past: readonly State[];
  readonly now: State;
  readonly assisted: boolean;
}

export const startRun = (level: Level): Run => ({ past: [], now: initial(level), assisted: false });

/** Everything a state holds but its move count: two states with the same key play alike and look alike. */
const keys = new WeakMap<State, string>();
function situation(s: State): string {
  let k = keys.get(s);
  if (k === undefined) {
    const { level: _level, moves: _moves, ...rest } = s;
    k = JSON.stringify(rest);
    keys.set(s, k);
  }
  return k;
}

/** Plays `a`. `back` is set when the turn brought the whole situation back to an earlier state of the try: the run
 *  is then that state, with the turns after it gone, as Undo would leave it. */
export function act(run: Run, a: Action): { run: Run; events: GameEvent[]; back?: number } {
  const r = step(run.now, a);
  if (r.state === run.now) return { run, events: [] };
  // A step that took no turn (an invisible wall shown) is no entry of its own: Undo goes back a whole turn.
  if (noTurn(run.now, r.state)) return { run: { ...run, now: r.state }, events: r.events };
  const past = [...run.past, run.now];
  if (r.state.outcome === 'playing') {
    const key = situation(r.state);
    const k = past.findIndex(p => p.level === r.state.level && situation(p) === key);
    if (k >= 0) return { run: { ...run, past: past.slice(0, k), now: past[k]! }, events: r.events, back: k };
  }
  return { run: { ...run, past, now: r.state }, events: r.events };
}

export function undo(run: Run): Run {
  if (run.past.length === 0) return run;
  return { ...run, past: run.past.slice(0, -1), now: run.past[run.past.length - 1]! };
}

export const restart = (run: Run): Run => ({ past: [], now: initial(run.now.level), assisted: run.assisted });
export const assist = (run: Run): Run => (run.assisted ? run : { ...run, assisted: true });
