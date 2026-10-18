import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boundsFor, fitView, resizeView, panBy, pinch, timeToX, xToTime, zoomAt, MAX_PX_PER_SEC } from '../src/zoom.ts';

const b = boundsFor(16, 800);
const fit = fitView(16, 800);

test('fit shows the whole piece', () => {
  assert.deepEqual(fit, { start: 0, pxPerSec: 50, width: 800 });
  assert.equal(timeToX(fit, 4), 200);
  assert.equal(xToTime(fit, 200), 4);
});

test('zoom keeps the time under the pointer', () => {
  const v = zoomAt(fit, 200, 2, b);
  assert.deepEqual(v, { start: 2, pxPerSec: 100, width: 800 });
  assert.equal(xToTime(v, 200), 4);
});

test('zoom and pan are clamped to the piece', () => {
  assert.deepEqual(zoomAt(fit, 400, 0.1, b), fit, 'never smaller than the whole piece');
  assert.equal(zoomAt(fit, 0, 1e6, b).pxPerSec, MAX_PX_PER_SEC);
  const v = zoomAt(fit, 0, 2, b);
  assert.equal(panBy(v, 10_000, b).start, 0, 'cannot pan before the start');
  assert.equal(panBy(v, -10_000, b).start, 8, 'cannot pan past the end (16 s - 800 px / 100 px/s)');
});

test('a very short sound fits the view and can still zoom in', () => {
  const short = boundsFor(0.4, 800);
  const whole = fitView(0.4, 800);
  assert.ok(Math.abs(whole.pxPerSec - 2000) < 1e-6 && Math.abs(short.minPxPerSec - 2000) < 1e-6, 'a 0.4 s sound fills 800 px');
  assert.ok(Math.abs(short.maxPxPerSec - 16000) < 1e-6, 'the ceiling is eight times the fit, not the 400 px/s a long piece gets');
  assert.equal(whole.start, 0);
  assert.equal(zoomAt(whole, 400, 1e6, short).pxPerSec, short.maxPxPerSec);
  assert.equal(zoomAt(whole, 400, 0.1, short).pxPerSec, short.minPxPerSec, 'never smaller than the whole sound');
  assert.equal(b.maxPxPerSec, MAX_PX_PER_SEC, 'a 16 s piece on 800 px keeps the 400 px/s ceiling');
});

test('pinch: the times under the fingers follow them', () => {
  const v = pinch(fit, [100, 300], [0, 400], b);
  assert.deepEqual(v, { start: 2, pxPerSec: 100, width: 800 });
  assert.deepEqual(pinch(fit, [100, 100], [0, 400], b), fit, 'fingers on one spot change nothing');
});

test('a zero-width measurement still gives a usable view', () => {
  const zb = boundsFor(16, 0);
  const zv = fitView(16, 0);
  assert.ok(zv.pxPerSec > 0 && zv.width >= 1);
  const c = zoomAt(zv, 0, 2, zb);
  assert.ok(Number.isFinite(c.start) && Number.isFinite(c.pxPerSec));
  assert.deepEqual(panBy({ start: NaN, pxPerSec: NaN, width: 0 }, 5, zb), { start: 0, pxPerSec: zb.minPxPerSec, width: 1 });
});

test('a view at fit refits when the width changes; a zoomed or panned view keeps its zoom', () => {
  for (const [duration, from, to] of [[16, 720, 390], [0.4, 720, 390], [16, 390, 1280], [0.4, 320, 1280]] as const) {
    const fitted = resizeView(fitView(duration, from), from, to, duration);
    assert.deepEqual(fitted, fitView(duration, to), `${duration} s, ${from} -> ${to}`);
    assert.equal(timeToX(fitted, duration), to, 'the end of the piece is the right edge');
  }
  const zoomed = zoomAt(fitView(16, 720), 100, 4, boundsFor(16, 720));
  const kept = resizeView(zoomed, 720, 390, 16);
  assert.equal(kept.pxPerSec, zoomed.pxPerSec, 'the owner’s zoom survives');
  assert.equal(kept.width, 390);
});
