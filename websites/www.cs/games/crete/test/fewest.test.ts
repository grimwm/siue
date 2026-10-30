import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGN_LEVELS, LEVEL_IDS } from '../src/campaign/chapters.ts';
import { FEWEST, againstFewest } from '../src/campaign/fewest.ts';
import { solve } from '../src/puzzle/solver.ts';
import { initial } from '../src/puzzle/state.ts';
import { step } from '../src/puzzle/step.ts';

test('every campaign level has its fewest moves, and each is the solver\'s shortest winning line', () => {
  assert.deepEqual(Object.keys(FEWEST).sort(), [...LEVEL_IDS].sort());
  LEVEL_IDS.forEach((id, i) => {
    const r = solve(initial(CAMPAIGN_LEVELS.level(i)));
    assert.ok(r.solved, `${id} solves`);
    assert.equal(r.line.length, FEWEST[id], id);
    // The game counts a move for each step of that line.
    const end = r.line.reduce((s, a) => step(s, a).state, initial(CAMPAIGN_LEVELS.level(i)));
    assert.equal(end.outcome, 'won', id);
    assert.equal(end.moves, FEWEST[id], `${id}: the move counter agrees`);
  });
});

test('a count of moves is set against the fewest: how many over, or perfect', () => {
  assert.equal(againstFewest(14, 12), 'best possible 12 (2 over)');
  assert.equal(againstFewest(12, 12), 'best possible 12 · perfect');
});
