// The exact solver: the shortest winning line on small levels with known answers,
// "unsolved" when there is none, and the cap.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, stateKey } from '../src/puzzle/solver.ts';
import { step } from '../src/puzzle/step.ts';
import { grid, mv } from './puzzle-grid.ts';

function replay(s: ReturnType<typeof grid>, line: ReturnType<typeof mv>[]) {
  let st = s;
  for (const a of line) st = step(st, a).state;
  return st;
}

test('the shortest line on open floor, and with a relic and the gate', () => {
  const a = solve(grid(['P.E']));
  assert.ok(a.solved);
  assert.deepEqual(a.line, [mv('right'), mv('right')]);
  const b = solve(grid(['P*.|E']));
  assert.ok(b.solved);
  assert.equal(b.line.length, 4);
  assert.equal(replay(grid(['P*.|E']), b.line).outcome, 'won');
});

test('a key fetched off the path is part of the line', () => {
  // Down, right (the red key), up, right (the door opens), right (the exit).
  const r = solve(grid(['P.RE', '.r##']));
  assert.ok(r.solved);
  assert.equal(r.line.length, 5);
});

test('no way out is "unsolved"; a tiny cap says it was capped', () => {
  const none = solve(grid(['P#E']));
  assert.ok(!none.solved && !none.capped);
  const corridor = solve(grid(['P.M.E']));
  assert.equal(corridor.solved, false, 'the Minotaur holds a one-wide corridor');
  const capped = solve(grid(['P........E']), 3);
  assert.ok(!capped.solved && capped.capped);
});

test('the key tells apart states that differ only in a door, a block or a held key', () => {
  const s = grid(['PrR.']);
  const t = step(s, mv('right')).state;
  assert.notEqual(stateKey(s), stateKey(t));
  assert.equal(stateKey(s), stateKey(grid(['PrR.'])));
});
