// The move pad under a held finger: which arrow a point is over, and when a held arrow moves again.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HOLD_MS, PadPress, REPEAT_MS, padDir, repeatDue } from '../src/pad.ts';
import type { MoveAction } from '../src/keys.ts';

test('a point is over the arrow it lies furthest toward; the centre square is no arrow', () => {
  assert.equal(padDir(0, 0, 22), null);
  assert.equal(padDir(20, -21, 22), null, 'inside the centre square');
  assert.equal(padDir(30, 5, 22), 'right');
  assert.equal(padDir(-30, 10, 22), 'left');
  assert.equal(padDir(4, -40, 22), 'up');
  assert.equal(padDir(-10, 25, 22), 'down');
});

test('past the pad the nearest arrow still counts, so a slide can run off its edge', () => {
  assert.equal(padDir(400, 90, 22), 'right');
  assert.equal(padDir(-60, -300, 22), 'up');
});

test('a held arrow waits HOLD_MS before it moves again, then REPEAT_MS between moves, and never while a move plays', () => {
  assert.equal(repeatDue(HOLD_MS - 1, 0, false), false);
  assert.equal(repeatDue(HOLD_MS, 0, false), true);
  assert.equal(repeatDue(HOLD_MS + 500, 0, true), false, 'the last move is still playing');
  assert.equal(repeatDue(REPEAT_MS - 1, 3, false), false);
  assert.equal(repeatDue(REPEAT_MS, 3, false), true);
  assert.ok(REPEAT_MS < HOLD_MS);
});

/** A finger on the pad as src/ui.ts drives it, ticking every 30 ms as its timer does, with each move it makes. */
function finger() {
  const moves: MoveAction[] = [];
  let press: PadPress | null = null;
  let t = 0;
  const made = (d: MoveAction | null) => { if (d) moves.push(d); };
  return {
    moves,
    down(dir: MoveAction | null) { press = new PadPress(dir, t); },
    over(dir: MoveAction | null) { made(press!.over(dir, t)); },
    up() { made(press!.up()); press = null; },
    wait(ms: number) {
      for (const end = t + ms; t < end;) {
        t = Math.min(end, t + 30);
        if (press) made(press.tick(t, false));
      }
    },
  };
}

test('a tap is one move, made as the finger lifts', () => {
  const f = finger();
  f.down('left');
  assert.deepEqual(f.moves, [], 'a press only arms the arrow');
  f.wait(80);
  f.up();
  assert.deepEqual(f.moves, ['left']);
  f.wait(1000);
  assert.deepEqual(f.moves, ['left'], 'nothing walks on after the lift');
});

test('rapid taps are one move each, however fast', () => {
  const f = finger();
  for (let i = 0; i < 7; i++) {
    f.down('up');
    f.wait(i % 2 ? 0 : 40);
    f.up();
    f.wait(i % 3 ? 10 : 0);
  }
  assert.deepEqual(f.moves, Array(7).fill('up'));
});

test('a slide from left to right moves only right, and the arrow it landed on never moves', () => {
  const f = finger();
  f.down('left');
  f.wait(60);
  f.over(null);
  f.over('right');
  assert.deepEqual(f.moves, ['right'], 'right as it enters');
  f.up();
  assert.deepEqual(f.moves, ['right'], 'and no tap on the lift');
});

test('back onto the arrow it landed on, with nothing moved yet, the press is still only a tap', () => {
  const f = finger();
  f.down('left');
  f.over(null);
  f.over('left');
  assert.deepEqual(f.moves, []);
  f.up();
  assert.deepEqual(f.moves, ['left']);
});

test('a held arrow moves at HOLD_MS, then every REPEAT_MS until the lift', () => {
  const f = finger();
  f.down('right');
  f.wait(HOLD_MS - 30);
  assert.deepEqual(f.moves, []);
  f.wait(30);
  assert.deepEqual(f.moves, ['right']);
  f.wait(REPEAT_MS * 3);
  assert.deepEqual(f.moves, Array(4).fill('right'));
  f.up();
  f.wait(1000);
  assert.deepEqual(f.moves, Array(4).fill('right'), 'the lift is no extra move');
});

test('slid into an arrow and held there, it walks on that way', () => {
  const f = finger();
  f.down('left');
  f.over('down');
  f.wait(HOLD_MS + REPEAT_MS);
  f.up();
  assert.deepEqual(f.moves, ['down', 'down', 'down']);
});

test('a held arrow waits while a move plays, and a stalled one walks no further', () => {
  const p = new PadPress('up', 0);
  assert.equal(p.tick(HOLD_MS + 100, true), null, 'busy');
  assert.equal(p.tick(HOLD_MS + 130, false), 'up');
  p.stalled = true;
  assert.equal(p.tick(5000, false), null);
  assert.equal(p.up(), null);
});
