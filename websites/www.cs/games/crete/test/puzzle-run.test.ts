// websites/www.cs/games/crete/test/puzzle-run.test.ts
// A try: undo steps back one turn as far as the start, restart goes back to the start,
// a finished try only undoes or restarts, and help marks the try assisted until it is left.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../src/puzzle/level.ts';
import { startRun, act, undo, restart, assist } from '../src/puzzle/run.ts';
import { mv } from './puzzle-grid.ts';

const lv = (rows: string[], header = '') => parse(`title: t\nintro: i\n${header}\n${rows.join('\n')}\n`);

test('undo steps back one turn; at the start it does nothing', () => {
  const r0 = startRun(lv(['P..E']));
  assert.equal(undo(r0), r0);
  const r1 = act(r0, mv('right')).run;
  const r2 = act(r1, mv('right')).run;
  assert.equal(r2.now.moves, 2);
  assert.equal(undo(r2).now, r1.now);
  assert.equal(undo(undo(r2)).now, r0.now);
});

test('a bump adds nothing to undo', () => {
  const r0 = startRun(lv(['P#']));
  const r = act(r0, mv('right'));
  assert.equal(r.run, r0);
  assert.deepEqual(r.events, []);
});

test('restart goes back to the start and keeps the assisted mark', () => {
  const r = act(assist(startRun(lv(['P..E']))), mv('right')).run;
  const back = restart(r);
  assert.equal(back.now.moves, 0);
  assert.deepEqual(back.past, []);
  assert.equal(back.assisted, true);
});

test('after a win or a loss only undo and restart act', () => {
  const won = act(act(startRun(lv(['P.E'])), mv('right')).run, mv('right')).run;
  assert.equal(won.now.outcome, 'won');
  assert.equal(act(won, mv('left')).run, won);
  assert.equal(undo(won).now.outcome, 'playing');
  const lost = act(startRun(lv(['M.P'], 'hearts: 1')), { kind: 'wait' }).run;
  assert.equal(lost.now.outcome, 'lost');
  assert.equal(act(lost, { kind: 'wait' }).run, lost);
  assert.equal(undo(lost).now.outcome, 'playing');
  assert.equal(restart(lost).now.hearts, 1);
});

test('undo restores the board after a reveal, a bomb and a clone', () => {
  let run = startRun(lv(['PW!+C', '.....'], 'machines: block-down'));
  const seen = [JSON.stringify(run.now)];
  for (let i = 0; i < 5; i++) {
    run = act(run, mv('right')).run;
    seen.push(JSON.stringify(run.now));
  }
  assert.equal(run.now.terrain[1], 'floor', 'the fake wall was found');
  assert.equal(run.now.terrain[2], 'floor', 'the bomb went off');
  assert.equal(run.now.objects[9], 'block', 'the clone was made');
  for (let i = seen.length - 1; i >= 0; i--) {
    assert.equal(JSON.stringify(run.now), seen[i], `turn ${i}`);
    run = undo(run);
  }
  assert.equal(run.now.terrain[1], 'fake-wall');
  assert.equal(run.now.terrain[2], 'bomb');
  assert.equal(run.now.objects[9], null);
});

test('showing an invisible wall is no entry in undo: Undo goes back the last whole turn', () => {
  let run = startRun(lv(['P.I.E', '.....']));
  run = act(run, mv('right')).run;
  const shown = act(run, mv('right'));
  assert.ok(shown.events.some(e => e.kind === 'revealed'));
  assert.equal(shown.run.past.length, 1, 'the bump added no entry');
  assert.equal(shown.run.now.moves, 1);
  const back = undo(shown.run);
  assert.equal(back.now.moves, 0, 'Undo takes back the step before it');
  assert.equal(back.past.length, 0);
});
