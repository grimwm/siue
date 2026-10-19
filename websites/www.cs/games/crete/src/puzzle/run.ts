/* The Island of Crete: one try at a level, with its undo. Undo is the list of
 * earlier states; restart goes back to the level's start. Any help from
 * Ariadne's thread marks the try assisted, and restart keeps the mark: only
 * opening the level again clears it. DOM-free. */
import { initial } from './state.ts';
import type { State } from './state.ts';
import { step } from './step.ts';
import type { Action, GameEvent } from './step.ts';
import type { Level } from './level.ts';

export interface Run {
  readonly past: readonly State[];
  readonly now: State;
  readonly assisted: boolean;
}

export const startRun = (level: Level): Run => ({ past: [], now: initial(level), assisted: false });

export function act(run: Run, a: Action): { run: Run; events: GameEvent[] } {
  const r = step(run.now, a);
  if (r.state === run.now) return { run, events: [] };
  return { run: { ...run, past: [...run.past, run.now], now: r.state }, events: r.events };
}

export function undo(run: Run): Run {
  if (run.past.length === 0) return run;
  return { ...run, past: run.past.slice(0, -1), now: run.past[run.past.length - 1]! };
}

export const restart = (run: Run): Run => ({ past: [], now: initial(run.now.level), assisted: run.assisted });
export const assist = (run: Run): Run => (run.assisted ? run : { ...run, assisted: true });
