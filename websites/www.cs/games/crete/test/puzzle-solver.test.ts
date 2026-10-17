// The exact solver: the shortest winning line on small levels with known answers,
// "unsolved" when there is none, and the cap.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, stateKey } from '../src/puzzle/solver.ts';
import { step } from '../src/puzzle/step.ts';
import { grid, mv, play } from './puzzle-grid.ts';

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

test('the key tells apart states that differ in a held key, a door or a block, and equal states agree', () => {
  const s = grid(['PrR.']);
  const t = step(s, mv('right')).state;
  assert.notEqual(stateKey(s), stateKey(t));
  assert.equal(stateKey(s), stateKey(grid(['PrR.'])));
  const b = grid(['.PO.', '....']);
  const pushed = step(b, mv('right')).state;
  const walked = play(b, mv('down'), mv('right')).state;
  assert.notEqual(stateKey(pushed), stateKey(walked), 'a block moved');
  const doorOpen = play(grid(['PrR.']), mv('right'), mv('right')).state;
  assert.notEqual(stateKey(doorOpen), stateKey(play(grid(['PrR.']), mv('right')).state), 'a door opened');
});

test('keys of 1 red/11 blue and 11 red/1 blue do not collide', () => {
  const s = grid(['P']);
  const a = { ...s, keys: { red: 1, blue: 11, yellow: 0, green: 0 } };
  const b = { ...s, keys: { red: 11, blue: 1, yellow: 0, green: 0 } };
  assert.notEqual(stateKey(a), stateKey(b));
});

test('a relics header lower than the grid count is solvable', () => {
  const r = solve(grid(['P*E'], 'relics: 0'));
  assert.ok(r.solved);
  assert.equal(r.line.length, 2);
  const r1 = solve(grid(['P**E'], 'relics: 1'));
  assert.ok(r1.solved);
  assert.equal(r1.line.length, 3);
});

test('a solve from a mid-try state wins when the line is replayed from there', () => {
  const s0 = grid(['P.r.R.E']);
  const mid = play(s0, mv('right'), mv('right')).state;
  const r = solve(mid);
  assert.ok(r.solved);
  assert.equal(r.line.length, 4);
  assert.equal(replay(mid, r.line).outcome, 'won');
});

test('a level that needs a tool is solved with it and not without', () => {
  // One heart, the Minotaur between the player and the exit in a two-row room: the mirror
  // stones it for three turns and the player walks round it.
  const rows = ['########', '#Pz...M#', '#......E', '########'];
  const withMirror = solve(grid(rows, 'hearts: 1'));
  assert.ok(withMirror.solved);
  assert.ok(withMirror.line.some(a => a.kind === 'tool' && a.tool === 'mirror'));
  assert.equal(replay(grid(rows, 'hearts: 1'), withMirror.line).outcome, 'won');
  const without = solve(grid(rows.map(r => r.replace('z', '.')), 'hearts: 1'));
  assert.ok(!without.solved && !without.capped);
});

test('a cap of 1 returns capped without expanding', () => {
  const r = solve(grid(['P.E']), 1);
  assert.ok(!r.solved && r.capped);
  assert.equal(r.explored, 1);
});

test('of two equally short lines the solver keeps the one that waits in place', () => {
  // Five turns win either way: the Minotaur must be let past the pillar, by a wait or by a step out and back.
  const rows = ['######', '#M.#.#', '#E.#.#', '##P..#', '######'];
  const r = solve(grid(rows));
  assert.ok(r.solved);
  assert.equal(r.line.length, 5);
  assert.ok(r.line.some(a => a.kind === 'wait'));
  assert.equal(replay(grid(rows), r.line).outcome, 'won');
});
