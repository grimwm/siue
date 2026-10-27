// Pruning that never changes an answer: a situation is dropped when it can never win, or when one already stored
// is at least as good in every resource that only helps and was reached in no more moves. Skates and suction
// boots change how many moves a route takes, so they never dominate; gear or a key a ride or a teleport exit
// could be forced to use never dominates either. A thief, a bomb and the hazards leave the rest dominating.
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
import { grid, mv, play } from './puzzle-grid.ts';
import { PIECE_LEVELS } from './piece-levels.ts';
import { sameAnswers } from './same-answers.ts';
import { solveBfs } from './reference-solver.ts';

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

test('a key a teleport exit could meet never dominates', () => {
  // Out of the top teleport heading right, the red door decides whether that exit is blocked.
  const s = grid(['.@R.', 'Pr..', '.@.E']);
  const ask = asker(s);
  assert.equal(ask(withKeys(s, 1), 0), false);
  assert.equal(ask(withKeys(s, 0), 1), false, 'the key can change which exit Theseus takes');
  // A lone teleport is a wall: the key dominates again.
  const lone = grid(['.@R.', 'Pr..', '...E']);
  const askLone = asker(lone);
  assert.equal(askLone(withKeys(lone, 1), 0), false);
  assert.equal(askLone(withKeys(lone, 0), 1), true);
});

test('a key changes which teleport exit Theseus takes', () => {
  // With the key, Theseus comes out of the middle teleport into the door and spends the key; without it, the door
  // blocks that exit and he comes out of the bottom one onto the exit. More keys forced a different, worse turn.
  const s = grid(['#######', '#P@..r#', '#.#@R.#', '#.#@E.#', '#######']);
  const rich = play(withKeys(s, 1), mv('right')).state;
  const poor = play(s, mv('right')).state;
  assert.deepEqual(rich.player, { r: 2, c: 4 });
  assert.equal(rich.keys.red, 0);
  assert.equal(poor.outcome, 'won');
  const ask = asker(s);
  assert.equal(ask(withKeys(s, 1), 0), false);
  assert.equal(ask(withKeys(s, 0), 0), false, 'the poorer situation is kept');
  sameAnswers(s.level, 100_000);
});

test('flippers a teleport exit could need never dominate', () => {
  const s = grid(['.@~.', 'Pf..', '.@.E']);
  const ask = asker(s);
  assert.equal(ask(withGear(s, ['flippers']), 0), false);
  assert.equal(ask(withGear(s, []), 1), false, 'flippers can change which exit Theseus takes');
  const boots = grid(['.@F.', 'Ph..', '.@.E']);
  const askBoots = asker(boots);
  assert.equal(askBoots(withGear(boots, ['fire-boots']), 0), false);
  assert.equal(askBoots(withGear(boots, []), 1), false, 'fire boots too');
});

test('beside a thief, more flippers still dominate: the thief leaves both with nothing', () => {
  const s = grid(['P$~.', 'f...', '...E']);
  const ask = asker(s);
  assert.equal(ask(withGear(s, ['flippers']), 0), false);
  assert.equal(ask(withGear(s, []), 1), true);
  // Onto the thief with and without flippers: the same situation after.
  const rich = play(withGear(s, ['flippers']), mv('right')).state;
  const poor = play(s, mv('right')).state;
  assert.deepEqual(rich.gear, []);
  assert.deepEqual({ ...rich, level: null }, { ...poor, level: null });
});

test('beside a bomb and a hazard, more hearts still dominate', () => {
  const s = grid(['P.!.', '..o.', 'S..E'], 'hearts: 3\nfacing: right');
  const ask = asker(s);
  assert.equal(ask({ ...s, hearts: 3 }, 2), false);
  assert.equal(ask({ ...s, hearts: 2 }, 2), true, 'fewer hearts');
  // A bomb catch costs one heart and throws Theseus back whatever he holds: the richer one stays one ahead.
  const three = play(s, mv('right'), mv('right')).state;
  const two = play({ ...s, hearts: 2 }, mv('right'), mv('right')).state;
  assert.deepEqual([three.hearts, two.hearts], [2, 1]);
  assert.deepEqual({ ...three, hearts: 0, level: null }, { ...two, hearts: 0, level: null });
});

test('every piece level: the pruned solver gives the reference answer', () => {
  for (const lv of Object.values(PIECE_LEVELS)) {
    assert.ok(solveBfs(initial(lv)).solved);
    sameAnswers(lv, 100_000);
  }
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
