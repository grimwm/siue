import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boundsFor, fitView, fullScoreFit, isClosest, isWhole, resizeView, panBy, pinch, sheetZoom, timeToX, xToTime, zoomAt, zoomBy, MAX_PX_PER_SEC, SHEET_ZOOM, ZOOM_STEP } from '../src/zoom.ts';

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

test('the zoom buttons zoom about the middle of the view, by a step each way', () => {
  const v = zoomBy(fit, ZOOM_STEP, b);
  assert.ok(Math.abs(v.pxPerSec - 50 * ZOOM_STEP) < 1e-9);
  assert.ok(Math.abs(xToTime(v, 400) - 8) < 1e-9, 'the middle stays put');
  const back = zoomBy(v, 1 / ZOOM_STEP, b);
  assert.ok(Math.abs(back.pxPerSec - 50) < 1e-9 && Math.abs(back.start) < 1e-9);
});

test('the view knows when it is whole and when it is as close as it goes', () => {
  assert.equal(isWhole(fit, b), true);
  assert.equal(isWhole(zoomBy(fit, 2, b), b), false);
  assert.equal(isClosest(fit, b), false);
  assert.equal(isClosest(zoomBy(fit, 1e6, b), b), true);
});

test('the sheet zoom: steps, a pinch ratio, and its limits', () => {
  assert.equal(sheetZoom(1, SHEET_ZOOM.step), SHEET_ZOOM.step);
  assert.equal(sheetZoom(1, 1e6), SHEET_ZOOM.max);
  assert.equal(sheetZoom(1, 1e-6), SHEET_ZOOM.min);
  assert.equal(sheetZoom(1, NaN), 1, 'a broken ratio changes nothing');
  assert.equal(sheetZoom(1.5, 200 / 100), 3, 'fingers twice as far apart double it');
  assert.equal(sheetZoom(0.8, 1), 0.8);
});

test('a full score starts smaller on a narrow screen, so a line holds more than one bar', () => {
  assert.equal(fullScoreFit(1200), 1, 'a wide screen draws it at its own size');
  assert.equal(fullScoreFit(760), 1);
  assert.ok(Math.abs(fullScoreFit(380) - 0.5) < 1e-9, 'a phone draws it at half size');
  assert.equal(fullScoreFit(100), SHEET_ZOOM.min, 'never below the smallest zoom');
  assert.equal(fullScoreFit(0), 1, 'an unmeasured width changes nothing');
});
