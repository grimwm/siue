import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ZOOM_MAX, ZOOM_MAX_CELL, clampZoom, restarted, zoomMax, zoomedCell } from '../src/zoom.ts';
import { act, restart, startRun, undo } from '../src/puzzle/run.ts';
import { levelById } from '../src/campaign/chapters.ts';

test('the zoom runs from the whole level up to 4x, or to a 64 px cell, whichever is less', () => {
  assert.equal(ZOOM_MAX, 4);
  assert.equal(ZOOM_MAX_CELL, 64);
  assert.equal(zoomMax(10), 4); // 40 px cells at most
  assert.equal(zoomMax(17), 64 / 17); // 64 px cells at most
  assert.equal(zoomMax(64), 1); // already 64 px: no zoom in
  assert.equal(zoomMax(80), 1); // never below the whole level
});

test('a zoom is clamped to the range', () => {
  assert.equal(clampZoom(0.5, 17), 1);
  assert.equal(clampZoom(2, 17), 2);
  assert.equal(clampZoom(9, 10), 4);
  assert.equal(clampZoom(9, 32), 2);
});

test('the zoomed cell is the whole-level cell at zoom 1, and a whole number of device pixels otherwise', () => {
  assert.equal(zoomedCell(17, 1, 3), 17);
  assert.equal(zoomedCell(17, 1.5, 1), 26); // 25.5 rounds to 26
  assert.equal(zoomedCell(17, 1.5, 3), 77 / 3); // 25.5 x 3 = 76.5 device px, so 77 / 3 css px
  assert.equal(zoomedCell(17, 100, 1), 64);
  assert.equal(zoomedCell(17, 0.2, 1), 17);
});

test('a restart or a new run is told from an undo, which keeps the zoom', () => {
  const level = levelById('trial-1');
  const start = startRun(level);
  const moved = [1, 2, 3].reduce((r) => act(r, { kind: 'wait' }).run, start);
  assert.ok(moved.past.length > 0, 'the moves were played');
  assert.equal(restarted(moved, restart(moved)), true);
  assert.equal(restarted(moved, undo(moved)), false);
  // Undo all the way back to the start is still an undo.
  let back = moved;
  while (back.past.length > 1) back = undo(back);
  assert.equal(restarted(back, undo(back)), false);
  // A restart at the start is a restart, and a step is not.
  assert.equal(restarted(start, restart(start)), true);
  assert.equal(restarted(start, moved), false);
  assert.equal(restarted(null, start), true);
  assert.equal(restarted(start, start), false);
});
