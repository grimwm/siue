// websites/www.cs/games/crete/test/puzzle-run.test.ts
// A try: undo steps back one turn as far as the start, restart goes back to the start,
// a finished try only undoes or restarts, help marks the try assisted until it is left, and a turn that brings the
// whole situation back to an earlier one is an undo to there.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../src/puzzle/level.ts';
import { startRun, act, undo, restart, assist } from '../src/puzzle/run.ts';
import { mv, WAIT } from './puzzle-grid.ts';
import type { Action } from '../src/puzzle/step.ts';
import type { Run } from '../src/puzzle/run.ts';

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

test('showing an invisible wall is a turn: one entry in undo, and Undo hides it again', () => {
  let run = startRun(lv(['P.I.E', '.....']));
  run = act(run, mv('right')).run;
  const shown = act(run, mv('right'));
  assert.ok(shown.events.some(e => e.kind === 'revealed'));
  assert.equal(shown.run.past.length, 2, 'the bump is an entry of its own');
  assert.equal(shown.run.now.moves, 2, 'and counts as a move');
  assert.equal(shown.run.now.terrain[2], 'wall');
  const back = undo(shown.run);
  assert.equal(back.now, run.now, 'Undo takes back the bump alone');
  assert.equal(back.now.terrain[2], 'invisible-wall', 'the wall is hidden again');
  assert.equal(back.now.moves, 1);
});

test('a turn after the bump never retraces past it: the shown wall is part of the situation', () => {
  let run = startRun(lv(['P.I.E', '.....']));
  run = act(run, mv('right')).run;
  run = act(run, mv('right')).run;
  const r = act(run, mv('left'));
  assert.equal(r.back, undefined, 'back at the start cell, but with the wall shown: no undo to there');
  assert.equal(r.run.past.length, 3);
  const again = act(r.run, mv('right'));
  assert.equal(again.back, 2, 'stepping back beside it retraces to the turn after the bump');
});

/** Plays `actions` from `r`, each turn's `back` kept. */
function walk(r: Run, ...actions: Action[]): { run: Run; backs: (number | undefined)[] } {
  const backs: (number | undefined)[] = [];
  for (const a of actions) {
    const x = act(r, a);
    r = x.run;
    backs.push(x.back);
  }
  return { run: r, backs };
}

/** A corridor, and the Minotaur walled in below it: he can never move. */
const PENNED = ['P....E', '######', 'M#....'];

test('three steps out and three back, with the Minotaur penned, is an undo to the start, one turn at a time', () => {
  const r0 = startRun(lv(PENNED));
  const out = walk(r0, mv('right'), mv('right'), mv('right'));
  assert.equal(out.run.now.moves, 3);
  assert.deepEqual(out.backs, [undefined, undefined, undefined]);
  const back = walk(out.run, mv('left'));
  assert.equal(back.run.now, undo(out.run).now, 'the first step back leaves the try as Undo would');
  assert.equal(back.run.past.length, undo(out.run).past.length);
  assert.deepEqual(back.backs, [2]);
  const home = walk(back.run, mv('left'), mv('left'));
  assert.deepEqual(home.backs, [1, 0]);
  assert.equal(home.run.now, r0.now, 'back at the start');
  assert.equal(home.run.now.moves, 0);
  assert.deepEqual(home.run.past, []);
});

test('a retrace that leaves the Minotaur somewhere else still counts every move', () => {
  const r0 = startRun(lv(['P....', '.....', '....M']));
  const { run, backs } = walk(r0, mv('right'), mv('left'));
  assert.equal(run.now.moves, 2);
  assert.deepEqual(backs, [undefined, undefined]);
  assert.equal(run.past.length, 2);
});

test('Wait: one that changes nothing is an undo to before it; one the Minotaur moves in counts', () => {
  const penned = walk(startRun(lv(PENNED)), mv('right'), WAIT);
  assert.deepEqual(penned.backs, [undefined, 1]);
  assert.equal(penned.run.now.moves, 1);
  const free = walk(startRun(lv(['P....', '.....', '....M'])), WAIT);
  assert.deepEqual(free.backs, [undefined]);
  assert.equal(free.run.now.moves, 1);
});

test('a retrace back to before a relic was taken is no undo: the relic is held now', () => {
  const r0 = startRun(lv(['P*..E', '#####', 'M#...']));
  const { run, backs } = walk(r0, mv('right'), mv('left'));
  assert.deepEqual(backs, [undefined, undefined]);
  assert.equal(run.now.moves, 2);
});
