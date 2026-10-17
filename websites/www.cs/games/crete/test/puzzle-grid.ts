// websites/www.cs/games/crete/test/puzzle-grid.ts
// Builds a try from grid rows alone, for the rule tests. Not a test file.
import { parse } from '../src/puzzle/level.ts';
import { initial } from '../src/puzzle/state.ts';
import type { State } from '../src/puzzle/state.ts';
import { step } from '../src/puzzle/step.ts';
import type { Action, GameEvent } from '../src/puzzle/step.ts';
import type { Dir } from '../src/puzzle/tiles.ts';

export function grid(rows: readonly string[], header = ''): State {
  return initial(parse(`title: t\nintro: i\n${header}\n${rows.join('\n')}\n`));
}
export const mv = (dir: Dir): Action => ({ kind: 'move', dir });
export const WAIT: Action = { kind: 'wait' };
/** Plays the actions in order and returns the last result with every event seen. */
export function play(s: State, ...actions: Action[]) {
  const events: GameEvent[] = [];
  let state = s;
  for (const a of actions) {
    const r = step(state, a);
    state = r.state;
    events.push(...r.events);
  }
  return { state, events, kinds: events.map(e => e.kind) };
}
