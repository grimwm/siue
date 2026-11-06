// A player wrote of a freeze on Chapter 1, Level 2 ("The Tribute Relics", trial-2): Theseus back on his start,
// the corner, with a wall below him and the Minotaur beside him. Right, Left, Wait from the start leads there in
// three turns. The engine never hangs: every move there is a bump, Wait lets the Minotaur catch him (a heart, and
// the beast sent home), and Undo takes the turn back. What looked like a freeze was the arrows doing nothing; the
// page now says so (boxedIn, src/tool-effects.ts).
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
});

test('trial-2 corner: every move is a bump, so the page calls him boxed in', () => {
  const s = corner();
  for (const d of DIRS) assert.equal(step(s, mv(d)).state, s, `${d} is a bump`);
  assert.equal(boxedIn(s), true);
  assert.equal(boxedIn(initial(trialLevel(1))), false, 'the start itself is open to the right');
});

test('trial-2 corner: Wait is a catch, not a hang; the Minotaur goes home and play goes on', () => {
  const r = step(corner(), WAIT);
  assert.ok(r.events.some(e => e.kind === 'caught'));
  assert.equal(r.state.hearts, 2);
  assert.deepEqual(r.state.player, { r: 1, c: 1 });
  assert.deepEqual(r.state.minotaur, trialLevel(1).minotaur, 'thrown back onto the cell he caught on, he is sent home');
  assert.equal(r.state.outcome, 'playing');
  assert.equal(boxedIn(r.state), false, 'free to move again');
});

test('trial-2 corner on the last heart: Wait ends the try, and Undo brings the corner back', () => {
  let run = startRun(trialLevel(1));
  for (const a of [mv('right'), mv('left'), WAIT]) run = act(run, a).run;
  const last = { ...run, now: { ...run.now, hearts: 1 } };
  const lost = act(last, WAIT).run;
  assert.equal(lost.now.outcome, 'lost');
  assert.equal(undo(lost).now, last.now);
});

test('boxed in: not while the try is over, and not in a snare, whose own line is said', () => {
  assert.equal(boxedIn(grid(['#M#', '#P#', '###'], 'hearts: 1')), true);
  assert.equal(boxedIn(play(grid(['M#', 'P#', '##'], 'hearts: 1'), WAIT).state), false, 'lost');
  assert.equal(boxedIn(play(grid(['#.#', 'P&.', '###']), mv('right')).state), false, 'held');
});

test('the boxed-in line names Wait and Undo by key with a keyboard, by button on a touch screen', () => {
  assert.equal(boxedInLine('keys'), 'No way to move: press . to Wait (the Minotaur moves) or U to Undo.');
  assert.equal(boxedInLine('touch'), 'No way to move: tap Wait (the Minotaur moves) or Undo.');
});
