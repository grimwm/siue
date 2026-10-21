// Pruning that never changes an answer: a situation is dropped when it can never win, or when one already stored
// is at least as good in every resource that only helps and was reached in no more moves. Skates and suction
// boots change how many moves a route takes, so they never dominate; gear or a key a ride could be forced to use
// never dominates either.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pruneFor } from '../src/puzzle/prune.ts';
import { layoutOf, pack } from '../src/puzzle/pack.ts';
import { astar } from '../src/puzzle/astar.ts';
import { solve, SOLVER_CAP } from '../src/puzzle/solver.ts';
import { initial } from '../src/puzzle/state.ts';
import type { State } from '../src/puzzle/state.ts';
import type { Gear } from '../src/puzzle/tiles.ts';
import { trialLevel } from '../src/puzzle/trials.ts';
import { grid } from './puzzle-grid.ts';

/** Asks `prune` about `s` as reached in `moves` moves. */
function asker(s0: State) {
  const layout = layoutOf(s0.level);
  const prune = pruneFor(s0.level, layout);
  const buf = new Uint32Array(layout.words);
  return (s: State, moves: number) => {
    const n = { ...s, moves };
    pack(n, layout, buf, 0);
    return prune(n, buf, 0);
  };
}
const withKeys = (s: State, red: number): State => ({ ...s, keys: { ...s.keys, red } });
const withGear = (s: State, gear: Gear[]): State => ({ ...s, gear });

test('a situation with more keys is kept; one with fewer keys and no fewer moves is dropped', () => {
  const s = grid(['P.rr', '..R.', '...E']);
  const ask = asker(s);
  assert.equal(ask(withKeys(s, 1), 3), false);
  assert.equal(ask(withKeys(s, 2), 4), false, 'more keys: never dominated');
  assert.equal(ask(withKeys(s, 0), 2), false, 'fewer keys but fewer moves');
  assert.equal(ask(withKeys(s, 1), 5), true, 'equal keys, more moves');
  assert.equal(ask(withKeys(s, 0), 4), true, 'fewer keys, no fewer moves');
  assert.equal(ask(withKeys(s, 2), 4), true, 'the same situation again');
});

test('skates and suction boots never dominate, nor are dominated', () => {
  const s = grid(['P.ku', '.==.', '...E']);
  const ask = asker(s);
  assert.equal(ask(withGear(s, ['skates', 'suction']), 0), false);
  assert.equal(ask(withGear(s, []), 5), false, 'no gear: not dominated by skates and suction');
  assert.equal(ask(withGear(s, ['skates']), 6), false);
  assert.equal(ask(withGear(s, ['suction']), 7), false);
  assert.equal(ask(withGear(s, ['skates']), 8), true, 'the same situation again');
});

test('flippers dominate, unless a ride could be forced into water by them', () => {
  const calm = grid(['P.f.', '..~.', '...E']);
  const ask = asker(calm);
  assert.equal(ask(withGear(calm, ['flippers']), 0), false);
  assert.equal(ask(withGear(calm, []), 1), true);
  const slide = grid(['P.f.', '.=~.', '...E']);
  const askSlide = asker(slide);
  assert.equal(askSlide(withGear(slide, ['flippers']), 0), false);
  assert.equal(askSlide(withGear(slide, []), 1), false, 'ice beside the water: flippers can change where a slide stops');
});

test('a key a force floor could carry into its door never dominates', () => {
  const s = grid(['P.r.', '.>R.', '...E']);
  const ask = asker(s);
  assert.equal(ask(withKeys(s, 1), 0), false);
  assert.equal(ask(withKeys(s, 0), 1), false);
});

test('more hearts and more tools dominate', () => {
  const s = grid(['P.zx', '....', 'M..E'], 'hearts: 3');
  const ask = asker(s);
  const rich: State = { ...s, hearts: 3, tools: { mirror: 1, cake: 1, cow: 0 } };
  assert.equal(ask(rich, 2), false);
  assert.equal(ask({ ...rich, hearts: 2 }, 2), true, 'fewer hearts');
  assert.equal(ask({ ...rich, tools: { mirror: 0, cake: 1, cow: 0 } }, 3), true, 'no mirror');
  assert.equal(ask({ ...rich, hearts: 2, tools: { mirror: 1, cake: 0, cow: 0 } }, 1), false, 'fewer moves');
});

test('a walled-off exit prunes at the start', () => {
  const s = grid(['P..#.', '...#E', '...##']);
  assert.equal(asker(s)(s, 0), true);
});

test('on level 10, A* with pruning stores fewer situations than without, and solve prunes', () => {
  const level = trialLevel(9);
  const start = initial(level);
  const plain = astar(start, { cap: SOLVER_CAP, refuse: null, prune: null });
  const pruned = astar(start, { cap: SOLVER_CAP, refuse: null, prune: pruneFor(level, layoutOf(level)) });
  assert.ok(plain.solved && pruned.solved);
  assert.equal(pruned.line.length, plain.line.length);
  assert.ok(pruned.explored < plain.explored, `${pruned.explored} stored with pruning, ${plain.explored} without`);
  assert.equal(solve(start).explored, pruned.explored);
});
