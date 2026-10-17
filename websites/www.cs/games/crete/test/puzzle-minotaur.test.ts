// websites/www.cs/games/crete/test/puzzle-minotaur.test.ts
// The Minotaur's rule (two steps, the horizontal gap first, else the vertical, else stay), what stops it,
// catches and the throw-back, hearts, and the three tools.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { step } from '../src/puzzle/step.ts';
import { terrainAt } from '../src/puzzle/state.ts';
import { grid, mv, play, WAIT } from './puzzle-grid.ts';

const tool = (t: 'mirror' | 'cake' | 'cow') => ({ kind: 'tool', tool: t }) as const;

test('it closes the horizontal gap first, then the vertical', () => {
  const r = play(grid(['M..', '...', '..P']), WAIT);
  assert.deepEqual(r.state.minotaur, { r: 0, c: 2 });
  assert.deepEqual(play(r.state, WAIT).state.player, { r: 2, c: 2 });
});

test('a wall across the horizontal sends it down; walls both ways hold it', () => {
  assert.deepEqual(play(grid(['M#.', '...', '..P']), WAIT).state.minotaur, { r: 1, c: 1 });
  assert.deepEqual(play(grid(['.#.', 'M#P', '.#.']), WAIT).state.minotaur, { r: 1, c: 0 });
});

test('walls, blocks, closed doors and toggles, water, fire, safe zones, the exit and the gate stop it', () => {
  for (const ch of ['#', 'O', 'R', 'T', '~', 'F', 'S', 'E', '|']) {
    const r = play(grid([`M${ch}..P`]), WAIT);
    assert.deepEqual(r.state.minotaur, { r: 0, c: 0 }, ch);
  }
});

test('it walks over things without taking them, slides on ice and does not press buttons', () => {
  const over = play(grid(['M*..P']), WAIT);
  assert.deepEqual(over.state.minotaur, { r: 0, c: 2 });
  assert.equal(over.state.objects[1], 'relic');
  assert.deepEqual(play(grid(['M=...P']), WAIT).state.minotaur, { r: 0, c: 3 }, 'ice carries it one cell further');
  const btn = play(grid(['M_..P', 'T....']), WAIT);
  assert.deepEqual(btn.state.minotaur, { r: 0, c: 2 });
  assert.equal(terrainAt(btn.state, { r: 1, c: 0 }), 'toggle-closed');
});

test('a catch costs a heart and throws you back to your last safe zone; it stays put', () => {
  const s = grid(['PS...', '.....', '....M']);
  const r = play(s, mv('right'), mv('right'));
  assert.equal(r.state.hearts, 2);
  assert.deepEqual(r.state.player, { r: 0, c: 1 });
  assert.deepEqual(r.state.minotaur, { r: 0, c: 2 });
  assert.ok(r.kinds.includes('caught'));
  assert.equal(r.state.outcome, 'playing');
});

test('caught on the throw-back cell: the Minotaur goes back to its start', () => {
  const r = play(grid(['M.P']), WAIT);
  assert.equal(r.state.hearts, 2);
  assert.deepEqual(r.state.player, { r: 0, c: 2 });
  assert.deepEqual(r.state.minotaur, { r: 0, c: 0 });
});

test('the last heart lost ends the try', () => {
  const r = play(grid(['M.P'], 'hearts: 1'), WAIT);
  assert.equal(r.state.outcome, 'lost');
  assert.ok(r.kinds.includes('lost'));
  assert.equal(step(r.state, WAIT).state, r.state);
});

test('you cannot walk into it; as stone it is a wall to you too', () => {
  const s = grid(['PM.']);
  assert.equal(step(s, mv('right')).state, s);
  const near = play(grid(['Pz..M']), mv('right'));
  const stoned = play(near.state, tool('mirror'));
  assert.ok(stoned.kinds.includes('stoned'));
  assert.equal(step(stoned.state, mv('right')).state, stoned.state);
});

test("Medusa's mirror stones it for the turn you raise it and 3 turns after", () => {
  const got = play(grid(['Pz.....M']), mv('right'));
  assert.deepEqual(got.state.minotaur, { r: 0, c: 5 });
  const stoned = play(got.state, tool('mirror'));
  assert.equal(stoned.state.tools.mirror, 0);
  assert.ok(stoned.kinds.includes('stoned'));
  assert.deepEqual(stoned.state.minotaur, { r: 0, c: 5 }, 'the use turn is a stone turn');
  assert.equal(stoned.state.stone, 3, 'three free turns are left');
  const held = play(stoned.state, WAIT, WAIT, WAIT);
  assert.deepEqual(held.state.minotaur, { r: 0, c: 5 });
  assert.equal(held.state.stone, 0);
  assert.deepEqual(play(held.state, WAIT).state.minotaur, { r: 0, c: 3 });
  assert.equal(step(got.state, tool('cake')).state, got.state, 'no cake, a bump');
});

test('honey cake gives a heart back, up to the start, and is a bump at full hearts', () => {
  const s = grid(['Px.....M']);
  const got = play(s, mv('right'));
  assert.equal(step(got.state, tool('cake')).state, got.state);
  const hurt = { ...got.state, hearts: 1 };
  const r = play(hurt, tool('cake'));
  assert.equal(r.state.hearts, 2);
  assert.equal(r.state.tools.cake, 0);
});

test("Daedalus's cow draws it first, and is gone when it is reached", () => {
  const s = { ...grid(['.....', 'P...M']), tools: { mirror: 0, cake: 0, cow: 2 } };
  const set = play(s, tool('cow'));
  assert.deepEqual(set.state.cow, { r: 1, c: 0 });
  assert.deepEqual(set.state.minotaur, { r: 1, c: 2 });
  const away = play(set.state, mv('up'));
  assert.deepEqual(away.state.minotaur, { r: 1, c: 0 });
  assert.equal(away.state.cow, null);
  assert.equal(step(set.state, tool('cow')).state, set.state, 'one cow at a time');
});
