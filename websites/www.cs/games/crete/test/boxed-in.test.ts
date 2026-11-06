// A player wrote of a freeze on Chapter 1, Level 2 ("The Tribute Relics", trial-2): Theseus back on his start,
// the corner, with a wall below him and the Minotaur beside him. Right, Left, Wait from the start leads there in
// three turns. Walking into the live Minotaur was a silent bump then, so every arrow did nothing; now it is a catch,
// like his reaching Theseus. Only a stone Minotaur, walls, closed doors and the board's edge still turn a move into
// a bump, and when every move is one the page says so (boxedIn, src/tool-effects.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trialLevel } from '../src/puzzle/trials.ts';
import { initial } from '../src/puzzle/state.ts';
import type { State } from '../src/puzzle/state.ts';
import { step } from '../src/puzzle/step.ts';
import { act, startRun, undo } from '../src/puzzle/run.ts';
import { boxedIn, boxedInLine } from '../src/tool-effects.ts';
import { DIRS } from '../src/puzzle/tiles.ts';
import { mv, play, WAIT, grid } from './puzzle-grid.ts';

/** trial-2 after Right, Left, Wait. */
function corner(): State {
  return play(initial(trialLevel(1)), mv('right'), mv('left'), WAIT).state;
}

test('trial-2: Right, Left, Wait puts Theseus in the corner with the Minotaur beside him, no catch yet', () => {
  const s = corner();
  assert.deepEqual(s.player, { r: 1, c: 1 }, 'the start, the top-left corner');
  assert.deepEqual(s.minotaur, { r: 1, c: 2 }, 'the Minotaur right beside him');
  assert.equal(s.hearts, 3);
  assert.equal(s.outcome, 'playing');
  assert.equal(boxedIn(s), false, 'walking into him is a move');
});

test('trial-2 corner: Right walks into the Minotaur, a catch: a turn, a heart, thrown back to the start', () => {
  const r = step(corner(), mv('right'));
  assert.ok(r.events.some(e => e.kind === 'caught'));
  assert.equal(r.state.hearts, 2);
  assert.equal(r.state.moves, 4);
  assert.deepEqual(r.state.player, { r: 1, c: 1 });
  assert.equal(r.state.outcome, 'playing');
});

test('trial-2 corner: Wait is a catch too, and the Minotaur, on the start, goes home', () => {
  const r = step(corner(), WAIT);
  assert.ok(r.events.some(e => e.kind === 'caught'));
  assert.equal(r.state.hearts, 2);
  assert.deepEqual(r.state.minotaur, trialLevel(1).minotaur);
});

test('trial-2 corner on the last heart: walking into him ends the try, and Undo brings the corner back', () => {
  let run = startRun(trialLevel(1));
  for (const a of [mv('right'), mv('left'), WAIT]) run = act(run, a).run;
  const last = { ...run, now: { ...run.now, hearts: 1 } };
  const lost = act(last, mv('right')).run;
  assert.equal(lost.now.outcome, 'lost');
  assert.equal(undo(lost).now, last.now);
});

test('boxed in: by walls and a stone Minotaur; not by a live one, not while the try is over, not in a snare', () => {
  const held = { ...grid(['#M#', '#P#', '###']), tools: { mirror: 1, cake: 0, cow: 0 } };
  const raised = step(held, { kind: 'tool', tool: 'mirror' }).state;
  assert.ok(raised.stone > 0);
  for (const d of DIRS) assert.equal(step(raised, mv(d)).state, raised, `${d} is a bump`);
  assert.equal(boxedIn(raised), true);
  assert.equal(boxedIn(grid(['#M#', '#P#', '###'])), false, 'live: up is a catch');
  assert.equal(boxedIn(play(grid(['M#', 'P#', '##'], 'hearts: 1'), WAIT).state), false, 'lost');
  assert.equal(boxedIn(play(grid(['#.#', 'P&.', '###']), mv('right')).state), false, 'held');
});

test('the boxed-in line names Wait and Undo by key with a keyboard, by button on a touch screen', () => {
  assert.equal(boxedInLine('keys'), 'No way to move: Wait (.) or Undo (U).');
  assert.equal(boxedInLine('touch'), 'No way to move: tap Wait or Undo.');
});
