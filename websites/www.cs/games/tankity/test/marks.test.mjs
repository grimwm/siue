// Tracer marks (src/marks.ts): a line is its gunner's alone until that
// gunner fires again; smoke is everyone's until the round ends.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MARK_EVERY, createMarks, smokeDrift } from '../src/marks.ts';

const fly = (marks, shot, by, kind, from, to, steps = 20) => {
  for (let i = 0; i <= steps; i++) marks.trail(shot, by, 'tr', kind, from + (to - from) * i / steps, 300 - i);
  marks.land(shot, to, 400);
};

test('a tracer\'s mark is the path it flew, ending where it came down', () => {
  const marks = createMarks();
  const shot = {};
  fly(marks, shot, 0, 'line', 100, 300);
  const [m] = marks.list;
  assert.equal(marks.list.length, 1);
  assert.deepEqual(m.pts.slice(0, 2), [100, 300]);
  assert.deepEqual(m.pts.slice(-2), [300, 400]);
  assert.equal(m.landed, true);
  for (let i = 2; i < m.pts.length - 2; i += 2) {
    assert.ok(Math.hypot(m.pts[i] - m.pts[i - 2], m.pts[i + 1] - m.pts[i - 1]) >= MARK_EVERY, 'points are spaced');
  }
  marks.trail(shot, 0, 'tr', 'line', 500, 500);
  assert.deepEqual(m.pts.slice(-2), [300, 400], 'a landed mark grows no more');
});

test('a line is shown to its gunner alone, until that gunner fires again', () => {
  const marks = createMarks();
  fly(marks, {}, 0, 'line', 100, 300);
  fly(marks, {}, 2, 'line', 400, 200);
  assert.equal(marks.shown(0).length, 1);
  assert.equal(marks.shown(0)[0].by, 0);
  assert.equal(marks.shown(1).length, 0, 'nobody else sees it');
  marks.fired(2);
  assert.equal(marks.shown(0).length, 1, 'another gunner firing leaves it');
  marks.fired(0);
  assert.equal(marks.shown(0).length, 0);
});

test('smoke is shown to everyone, and stays when its gunner fires again, until the round ends', () => {
  const marks = createMarks();
  fly(marks, {}, 0, 'smoke', 100, 300);
  assert.equal(marks.shown(0).length, 1);
  assert.equal(marks.shown(3).length, 1);
  marks.fired(0);
  assert.equal(marks.shown(3).length, 1);
  marks.step(2);
  assert.equal(marks.list[0].age, 2);
  marks.clear();
  assert.equal(marks.list.length, 0);
});

test('smoke drifts with the wind, further the older it is', () => {
  assert.equal(smokeDrift(0, 6), 0);
  assert.ok(smokeDrift(4, 6) > smokeDrift(2, 6) && smokeDrift(2, 6) > 0);
  assert.ok(smokeDrift(2, -6) < 0, 'a head wind pushes it back');
});
