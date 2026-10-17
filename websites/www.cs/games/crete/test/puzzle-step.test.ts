// websites/www.cs/games/crete/test/puzzle-step.test.ts
// The player's half of a turn, with no Minotaur on the grid: moving and bumping, keys and doors,
// relics, the gate and the exit, gear, ice and force floors, blocks, buttons and safe zones.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { step } from '../src/puzzle/step.ts';
import { terrainAt } from '../src/puzzle/state.ts';
import { grid, mv, play, WAIT } from './puzzle-grid.ts';

test('a move takes a turn; a bump returns the same state and costs nothing', () => {
  const s = grid(['P.#']);
  const a = step(s, mv('right'));
  assert.deepEqual(a.state.player, { r: 0, c: 1 });
  assert.equal(a.state.moves, 1);
  assert.deepEqual(a.events.map(e => e.kind), ['moved']);
  const b = step(a.state, mv('right'));
  assert.equal(b.state, a.state);
  assert.deepEqual(b.events, []);
  assert.equal(step(s, mv('up')).state, s, 'the grid edge is a wall');
});

test('a coloured key opens its door and is used up; a green key opens every green door', () => {
  const red = play(grid(['PrR.']), mv('right'), mv('right'));
  assert.deepEqual(red.state.player, { r: 0, c: 2 });
  assert.equal(terrainAt(red.state, { r: 0, c: 2 }), 'floor');
  assert.equal(red.state.keys.red, 0);
  assert.deepEqual(red.kinds, ['moved', 'took', 'opened', 'moved']);
  const green = play(grid(['PgGG.']), mv('right'), mv('right'), mv('right'));
  assert.deepEqual(green.state.player, { r: 0, c: 3 });
  assert.equal(green.state.keys.green, 1);
  const s = grid(['PR']);
  assert.equal(step(s, mv('right')).state, s, 'no key, no way through');
});

test('the gate opens when every relic is taken, and the exit wins only then', () => {
  const s = grid(['P*|E']);
  assert.equal(s.relicsLeft, 1);
  const won = play(s, mv('right'), mv('right'), mv('right'));
  assert.equal(won.state.outcome, 'won');
  assert.ok(won.kinds.includes('won'));
  const shut = grid(['P|*']);
  assert.equal(step(shut, mv('right')).state, shut, 'the closed gate is a bump');
  const early = play(grid(['PE*']), mv('right'));
  assert.equal(early.state.outcome, 'playing', 'the exit before the relics is only a cell');
  assert.equal(play(grid(['P|E']), mv('right'), mv('right')).state.outcome, 'won', 'no relics: the gate is open');
});

test('water and fire turn you back without their gear and let you through with it', () => {
  for (const [rows, gear] of [[['P~.'], 'f'], [['PF.'], 'h']] as const) {
    const s = grid(rows);
    assert.equal(step(s, mv('right')).state, s);
    const geared = play(grid([`P${gear}${rows[0].slice(1)}`]), mv('right'), mv('right'), mv('right'));
    assert.deepEqual(geared.state.player, { r: 0, c: 3 });
  }
});

test('ice slides you on until you leave it or meet something; skates stop the slide', () => {
  assert.deepEqual(play(grid(['P===.#']), mv('right')).state.player, { r: 0, c: 4 });
  assert.deepEqual(play(grid(['P==#']), mv('right')).state.player, { r: 0, c: 2 });
  const r = play(grid(['P==O.']), mv('right'));
  assert.deepEqual(r.state.player, { r: 0, c: 2 }, 'a slide never pushes a block');
  assert.ok(r.kinds.includes('slid'));
  assert.deepEqual(play(grid(['Pk==.']), mv('right'), mv('right')).state.player, { r: 0, c: 2 });
});

test('a force floor carries you along its chain; suction boots stand still on it', () => {
  assert.deepEqual(play(grid(['P>>.', '....']), mv('right')).state.player, { r: 0, c: 3 });
  assert.deepEqual(play(grid(['Pv.', '.v.', '.#.']), mv('down')).state.player, { r: 1, c: 0 }, 'not this column');
  assert.deepEqual(play(grid(['P.', 'v.', 'v.', '#.']), mv('down')).state.player, { r: 2, c: 0 });
  assert.deepEqual(play(grid(['Pu>>.']), mv('right'), mv('right')).state.player, { r: 0, c: 2 });
});

test('a force-floor loop stops on the last new cell, and you can walk off it', () => {
  const r = play(grid(['P>v', '.^<']), mv('right'));
  assert.equal(r.state.outcome, 'playing');
  assert.deepEqual(r.state.player, { r: 1, c: 1 });
  assert.deepEqual(play(r.state, mv('left')).state.player, { r: 1, c: 0 });
});

test('a block is pushed one cell; it sinks in water, slides on ice and presses a button', () => {
  const push = play(grid(['PO.']), mv('right'));
  assert.deepEqual(push.state.player, { r: 0, c: 1 });
  assert.equal(push.state.objects[2], 'block');
  assert.ok(push.kinds.includes('pushed'));
  for (const rows of [['PO#'], ['POO.'], ['PO*.'], ['POF.'], ['POS.'], ['POE.']]) {
    const s = grid(rows);
    assert.equal(step(s, mv('right')).state, s, rows[0]);
  }
  const sink = play(grid(['PO~.']), mv('right'));
  assert.equal(terrainAt(sink.state, { r: 0, c: 2 }), 'dirt');
  assert.equal(sink.state.objects[2], null);
  assert.ok(sink.kinds.includes('sank'));
  assert.equal(play(grid(['PO==.']), mv('right')).state.objects[4], 'block');
  const press = play(grid(['PO_T.']), mv('right'));
  assert.equal(terrainAt(press.state, { r: 0, c: 3 }), 'toggle-open');
  assert.ok(press.kinds.includes('flipped'));
});

test('stepping on a button flips every toggle wall; a closed one is a wall', () => {
  const s = grid(['P_T.', '..t.']);
  const r = play(s, mv('right'));
  assert.equal(terrainAt(r.state, { r: 0, c: 2 }), 'toggle-open');
  assert.equal(terrainAt(r.state, { r: 1, c: 2 }), 'toggle-closed');
  assert.deepEqual(play(r.state, mv('right'), mv('right')).state.player, { r: 0, c: 3 });
});

test('things are taken by walking onto them, and a safe zone becomes the throw-back cell', () => {
  const r = play(grid(['Pfhkuzxcp*S']), ...Array(10).fill(mv('right')));
  assert.deepEqual([...r.state.gear].sort(), ['fire-boots', 'flippers', 'skates', 'suction']);
  assert.deepEqual(r.state.tools, { mirror: 1, cake: 1, cow: 1 });
  assert.equal(r.state.pages, 1);
  assert.equal(r.state.relicsLeft, 0);
  assert.deepEqual(r.state.throwBack, { r: 0, c: 10 });
});

test('a step never changes the state it was given', () => {
  const s = grid(['PO~rR.']);
  const before = JSON.stringify(s);
  play(s, mv('right'), mv('right'));
  assert.equal(JSON.stringify(s), before);
});

test('a pushed block is never carried into the cell the player is entering', () => {
  const r = play(grid(['PO<.']), mv('right'));
  assert.deepEqual(r.state.player, { r: 0, c: 1 });
  assert.equal(r.state.objects[1], null);
  assert.equal(r.state.objects[2], 'block');
});

test('a conveyor carries the player back onto the cell the move started from, unless they wear suction boots', () => {
  assert.deepEqual(play(grid(['P<.']), mv('right')).state.player, { r: 0, c: 0 });
  assert.deepEqual(play(grid(['Pu<.']), mv('right'), mv('right')).state.player, { r: 0, c: 2 });
});

test('a relics header below the grid count: extra relics never close the gate again', () => {
  const s = grid(['P**E'], 'relics: 1');
  const r = play(s, mv('right'), mv('right'), mv('right'));
  assert.equal(r.state.relicsLeft, 0);
  assert.equal(r.state.outcome, 'won');
});

test('a block is never pushed onto the throw-back cell', () => {
  const s = grid(['....', '.PO.', '....']);
  // Round the block and back at it from the far side: the cell it would land on is the start.
  const r = play(s, mv('down'), mv('right'), mv('right'), mv('up'));
  assert.deepEqual(r.state.player, { r: 1, c: 3 });
  const b = step(r.state, mv('left'));
  assert.equal(b.state, r.state, 'a bump');
  assert.deepEqual(b.events, []);
});

test('a block is never pushed onto the Minotaur\'s start cell', () => {
  const s = { ...grid(['PO.M']), minotaur: null };
  const r = play(s, mv('right'));
  assert.equal(r.state.objects[2], 'block');
  const b = step(r.state, mv('right'));
  assert.equal(b.state, r.state, 'a bump');
});

test('sent home onto the cow, the Minotaur eats it', () => {
  const base = grid(['..P.M']);
  const s = { ...base, minotaur: { r: 0, c: 0 }, cow: { r: 0, c: 4 } };
  const r = play(s, WAIT);
  assert.deepEqual(r.state.minotaur, { r: 0, c: 4 });
  assert.equal(r.state.cow, null);
  assert.ok(r.kinds.includes('caught'));
});
