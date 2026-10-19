// Drawing the energy: a stroke in pixels becomes seconds and values; it replaces
// the curve over its own span, clamped and in time order; the curve always runs
// from 0 to the end of the piece.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ENERGY_EDIT_H, curveToPixels, redraw, strokeFromPixels } from '../src/energy.ts';
import { fitView } from '../src/zoom.ts';

test('pixels in the drawing become a curve: top is 1, bottom is 0', () => {
  assert.equal(ENERGY_EDIT_H, 160);
  assert.deepEqual(strokeFromPixels([[0, 160], [400, 80], [800, 0]], fitView(16, 800)), [[0, 0], [8, 0.5], [16, 1]]);
  assert.deepEqual(strokeFromPixels([[0, -20], [400, 400]], fitView(16, 800)), [[0, 1], [8, 0]], 'outside the well is clamped');
});

test('points closer than 4 px are dropped, but the last point of a stroke is kept', () => {
  const s = strokeFromPixels([[0, 80], [1, 80], [2, 80], [3, 80], [5, 80], [6, 40]], fitView(16, 800));
  assert.deepEqual(s.map(p => Math.round(p[0] * 50)), [0, 5, 6]);
});

test('a stroke replaces the curve over its own span, clamped and in time order', () => {
  const curve: [number, number][] = [[0, 0.2], [8, 0.5], [16, 0.9]];
  assert.deepEqual(redraw(curve, [[10, 0.1], [4, 0.8], [6, 1.2]], 16), [[0, 0.2], [4, 0.8], [6, 1], [10, 0.1], [16, 0.9]]);
});

test('a stroke over the ends keeps the curve from 0 to the duration', () => {
  assert.deepEqual(redraw([[0, 0.2], [16, 0.9]], [[-3, 0.5], [20, 0.4]], 16), [[0, 0.5], [16, 0.4]]);
  assert.deepEqual(redraw([[0, 0.2], [16, 0.9]], [[2, 0.5], [3, 0.6]], 16), [[0, 0.2], [2, 0.5], [3, 0.6], [16, 0.9]]);
});

test('drawn back over itself, the later point at a time wins; an empty stroke changes nothing', () => {
  assert.deepEqual(redraw([[0, 0], [16, 0]], [[4, 0.2], [8, 0.4], [4, 0.9]], 16), [[0, 0], [4, 0.9], [8, 0.4], [16, 0]]);
  assert.deepEqual(redraw([[0, 0.3], [16, 0.3]], [], 16), [[0, 0.3], [16, 0.3]]);
});

test('a curve whose times are not increasing is sorted before it is redrawn', () => {
  const unsorted: [number, number][] = [[16, 0.9], [0, 0.2], [8, 0.5]];
  assert.deepEqual(redraw(unsorted, [[10, 0.1], [12, 0.2]], 16), [[0, 0.2], [8, 0.5], [10, 0.1], [12, 0.2], [16, 0.9]]);
  assert.deepEqual(redraw(unsorted, [], 16), [[0, 0.2], [8, 0.5], [16, 0.9]], 'even an empty stroke returns it in time order');
  assert.deepEqual(unsorted, [[16, 0.9], [0, 0.2], [8, 0.5]], 'the input is not changed');
});

test('a curve back to pixels', () => {
  assert.deepEqual(curveToPixels([[0, 0], [8, 0.5], [16, 1]], fitView(16, 800)), [[0, 160], [400, 80], [800, 0]]);
});

test('a curve is drawn in time order from an unsorted input', () => {
  assert.deepEqual(curveToPixels([[16, 1], [0, 0], [8, 0.5]], fitView(16, 800)), [[0, 160], [400, 80], [800, 0]]);
});
