import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../src/puzzle/level.ts';
import { initial } from '../src/puzzle/state.ts';
import type { State } from '../src/puzzle/state.ts';
import { act, restart, startRun, undo } from '../src/puzzle/run.ts';
import { HAZE_IN_MS, IDLE_MS, SHIMMER_MS, createFoundClock, cuesMoving, fakeFaces, foundWalls, hazeCue, hazeStrength, shimmerAt } from '../src/wall-cues.ts';

// Theseus at (2,2): a fake wall above him and one to his left, an invisible wall to his right.
const LEVEL = parse(['#######', '#..W..#', '#.WPI.#', '#....E#', '#######', ''].join('\n'));
const at = (s: State, r: number, c: number): State => ({ ...s, player: { r, c } });

test('the fake walls beside Theseus, each with its face toward him', () => {
  const s = initial(LEVEL);
  assert.deepEqual(fakeFaces(s), [{ at: { r: 1, c: 3 }, face: 'down' }, { at: { r: 2, c: 2 }, face: 'right' }]);
  // A wall only diagonal to him is not beside him.
  assert.deepEqual(fakeFaces(at(s, 3, 1)), []);
  assert.deepEqual(fakeFaces(at(s, 3, 2)), [{ at: { r: 2, c: 2 }, face: 'down' }]);
  assert.deepEqual(fakeFaces(at(s, 1, 2)), [{ at: { r: 2, c: 2 }, face: 'up' }, { at: { r: 1, c: 3 }, face: 'left' }]);
  assert.deepEqual(fakeFaces(at(s, 3, 4)), []);
  // At the board's edge nothing outside counts.
  assert.deepEqual(fakeFaces(at(s, 0, 0)), []);
});

test('a fake wall that gave way has no face', () => {
  const r = act(startRun(LEVEL), { kind: 'move', dir: 'up' });
  assert.equal(r.run.now.terrain[1 * 7 + 3], 'floor');
  assert.deepEqual(fakeFaces(r.run.now), []);
});

test('the haze waits IDLE_MS of standing still, comes up, then breathes', () => {
  assert.equal(hazeStrength(0, false), 0);
  assert.equal(hazeStrength(IDLE_MS - 1, false), 0);
  assert.ok(hazeStrength(IDLE_MS + HAZE_IN_MS / 2, false) > 0);
  assert.ok(hazeStrength(IDLE_MS + HAZE_IN_MS / 2, false) < hazeStrength(IDLE_MS + HAZE_IN_MS, false));
  for (let t = IDLE_MS + HAZE_IN_MS; t < IDLE_MS + 10_000; t += 97) {
    const k = hazeStrength(t, false);
    assert.ok(k >= 0.55 - 1e-9 && k <= 1 + 1e-9, `breathing stays between a little over half and full: ${k}`);
  }
  // Reduced motion: a still tint, nothing before the wait.
  assert.equal(hazeStrength(IDLE_MS - 1, true), 0);
  assert.equal(hazeStrength(IDLE_MS, true), 1);
  assert.equal(hazeStrength(IDLE_MS + 1234, true), 1);
});

test('no haze while a turn plays, after the try ends, or with no fake wall beside him', () => {
  const s = initial(LEVEL);
  const idle = IDLE_MS + HAZE_IN_MS;
  assert.equal(hazeCue(s, IDLE_MS - 1, false, false), null);
  assert.equal(hazeCue(s, idle, false, true), null);
  assert.equal(hazeCue({ ...s, outcome: 'won' }, idle, false, false), null);
  assert.equal(hazeCue(at(s, 3, 4), idle, false, false), null);
  const cue = hazeCue(s, idle, false, false)!;
  assert.equal(cue.faces.length, 2);
  assert.ok(cue.strength > 0.5);
  assert.ok(cuesMoving({ found: [], haze: cue, t: 1, still: false }));
  assert.ok(!cuesMoving({ found: [], haze: cue, t: 1, still: true }), 'a still tint does not move');
});

test('a bumped invisible wall is found; undo past the bump and restart hide it', () => {
  let run = startRun(LEVEL);
  run = act(run, { kind: 'move', dir: 'down' }).run; // a turn: to (3,3)
  run = act(run, { kind: 'move', dir: 'up' }).run; // back to the start: an undo to there
  assert.deepEqual(foundWalls(run.now), []);
  run = act(run, { kind: 'move', dir: 'down' }).run;
  run = act(run, { kind: 'move', dir: 'right' }).run; // a turn: to (3,4)
  run = act(run, { kind: 'move', dir: 'up' }).run; // bump: (2,4) shows, no turn
  assert.deepEqual(foundWalls(run.now), [2 * 7 + 4]);
  assert.equal(run.now.terrain[2 * 7 + 4], 'wall');
  assert.deepEqual(foundWalls(undo(run).now), [], 'Undo goes back a whole turn, past the bump');
  assert.deepEqual(foundWalls(restart(run).now), []);
});

test('the found clock shimmers a wall found in play once, never one there when the level opens', () => {
  let run = startRun(LEVEL);
  run = act(run, { kind: 'move', dir: 'down' }).run;
  run = act(run, { kind: 'move', dir: 'right' }).run;
  const before = run.now;
  run = act(run, { kind: 'move', dir: 'up' }).run;
  const clock = createFoundClock();
  assert.deepEqual(clock.update(before, 1, 0, false), []);
  assert.deepEqual(clock.update(run.now, 1, 100, false), [{ i: 18, shimmer: 0 }]);
  assert.deepEqual(clock.update(run.now, 1, 100 + SHIMMER_MS / 2, false), [{ i: 18, shimmer: 0.5 }]);
  assert.deepEqual(clock.update(run.now, 1, 100 + SHIMMER_MS, false), [{ i: 18, shimmer: null }], 'then it settles');
  // Undone and found again, it shimmers again.
  assert.deepEqual(clock.update(before, 1, 2000, false), []);
  assert.deepEqual(clock.update(run.now, 1, 2100, false), [{ i: 18, shimmer: 0 }]);
  // A level opened (or the look rebuilt from) a state that already shows it: settled at once.
  const fresh = createFoundClock();
  assert.deepEqual(fresh.update(run.now, 5, 0, false), [{ i: 18, shimmer: null }]);
  assert.deepEqual(clock.update(run.now, 2, 2200, false), [{ i: 18, shimmer: null }]);
  // Reduced motion: no shimmer.
  assert.deepEqual(createFoundClock().update(before, 1, 0, true), []);
  const reduced = createFoundClock();
  reduced.update(before, 1, 0, true);
  assert.deepEqual(reduced.update(run.now, 1, 10, true), [{ i: 18, shimmer: null }]);
});

test('the shimmer runs 0 to 1 over SHIMMER_MS', () => {
  assert.equal(shimmerAt(0, false), 0);
  assert.equal(shimmerAt(SHIMMER_MS / 4, false), 0.25);
  assert.equal(shimmerAt(SHIMMER_MS, false), null);
  assert.equal(shimmerAt(-1, false), null);
  assert.equal(shimmerAt(10, true), null);
});
