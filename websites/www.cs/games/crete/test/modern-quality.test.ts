// The quality ladder follows the measured frame rate: down when it stays slow, back up when it stays fast.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DOWN_FPS, DOWN_MS, STALL_MS, UP_FPS, UP_MS, WARM_FRAMES, createLadder, frameSample, measure, rate, rewarm } from '../src/modern/quality.ts';
import type { Ladder } from '../src/modern/quality.ts';

/** Feeds `ms` of frames `gap` apart; returns the ladder. */
function run(l: Ladder, gap: number, ms: number): Ladder {
  for (let t = 0; t < ms; t += gap) measure(l, gap);
  return l;
}
const warmed = (): Ladder => {
  const l = createLadder();
  l.skip = 0;
  return l;
};

test('the thresholds: down under 40 fps over two seconds, up over 55 fps over three', () => {
  assert.equal(DOWN_FPS, 40);
  assert.equal(DOWN_MS, 2000);
  assert.equal(UP_FPS, 55);
  assert.equal(UP_MS, 3000);
});

test('it starts at full quality, and holds at 60 fps and at 45 fps', () => {
  assert.equal(createLadder().q, 3);
  assert.equal(run(warmed(), 1000 / 60, 20_000).q, 3);
  assert.equal(run(warmed(), 1000 / 45, 20_000).q, 3);
});

test('two seconds under 40 fps drop one step; shorter runs do not', () => {
  assert.equal(run(warmed(), 1000 / 30, 1800).q, 3, 'not two seconds yet');
  const l = run(warmed(), 1000 / 30, 2100);
  assert.equal(l.q, 2);
  assert.ok(l.skip > 0 && l.gaps.length === 0, 'the window starts again, leaving out the next frames');
  // It keeps going down while it stays slow, and stops at 0.
  assert.equal(run(l, 1000 / 20, 20_000).q, 0);
});

test('a single slow frame, or a few, never drops it', () => {
  const l = warmed();
  run(l, 1000 / 60, 1500);
  measure(l, 200);
  run(l, 1000 / 60, 500);
  for (let i = 0; i < 3; i++) measure(l, 120);
  run(l, 1000 / 60, 3000);
  assert.equal(l.q, 3);
});

test('stalls and the first frames after a level opens or the tab returns count for nothing', () => {
  const l = warmed();
  for (let i = 0; i < 50; i++) measure(l, STALL_MS + 1);
  assert.equal(l.q, 3);
  assert.deepEqual(l.gaps, []);
  rewarm(l);
  for (let i = 0; i < WARM_FRAMES; i++) measure(l, 150);
  assert.deepEqual(l.gaps, [], 'the warm-up frames are left out');
  assert.equal(l.q, 3);
});

test('three seconds over 55 fps step back up; a step that proved too slow twice is not tried again', () => {
  const l = run(warmed(), 1000 / 30, 2100);
  assert.equal(l.q, 2);
  l.skip = 0;
  run(l, 1000 / 60, 3100);
  assert.equal(l.q, 3, 'back up');
  l.skip = 0;
  run(l, 1000 / 30, 2100);
  assert.equal(l.q, 2, 'too slow a second time');
  l.skip = 0;
  run(l, 1000 / 60, 10_000);
  assert.equal(l.q, 2, 'stays put now');
});

test('rate: frames over the latest window, or null until there is that much', () => {
  assert.equal(rate([], 2000), null);
  assert.equal(rate(Array(10).fill(100), 2000), null);
  assert.equal(rate(Array(40).fill(50), 2000), 20);
  assert.ok(Math.abs(rate([...Array(100).fill(100), ...Array(130).fill(1000 / 60)], 2000)! - 60) < 1);
});

test('only a frame the last one asked for counts: idle gaps and loop ticks never reach the ladder', () => {
  assert.equal(frameSample(true, 16.7), 16.7);
  assert.equal(frameSample(false, 83), null);
  assert.equal(frameSample(false, 5000), null);
});
