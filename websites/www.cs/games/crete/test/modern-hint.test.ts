// The modern board's first-time hint: it waits for a quiet moment, shows once a visit on at most two visits, and goes
// for good the first time the player moves the camera.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HINT_DELAY_MS, HINT_MAX_SHOWS, HINT_SHOW_MS, createHint, hintText, readHint } from '../src/modern/hint.ts';

const fresh = () => readHint(null);

test('a new player sees the hint after a quiet moment on the board, and it goes on its own after a while', () => {
  const h = createHint(fresh(), 0);
  assert.equal(h.tick(HINT_DELAY_MS - 1, false), null, 'not yet');
  assert.equal(h.tick(HINT_DELAY_MS, false), 'show');
  assert.equal(h.record().shows, 1);
  assert.equal(h.tick(HINT_DELAY_MS + HINT_SHOW_MS - 1, false), null, 'still up');
  assert.equal(h.tick(HINT_DELAY_MS + HINT_SHOW_MS, false), 'hide');
  assert.equal(h.tick(HINT_DELAY_MS * 10 + HINT_SHOW_MS, false), null, 'once a visit');
  assert.equal(h.over(), true);
});

test('a layer over the board holds the hint back, and the quiet moment starts again when it closes', () => {
  const h = createHint(fresh(), 0);
  assert.equal(h.tick(5000, true), null, 'covered');
  assert.equal(h.tick(5000 + HINT_DELAY_MS - 1, false), null, 'the wait starts when the board is uncovered');
  assert.equal(h.tick(5000 + HINT_DELAY_MS, false), 'show');
  assert.equal(h.tick(5000 + HINT_DELAY_MS + 10, true), 'hide', 'a layer covering it takes it away');
  assert.equal(h.tick(60_000, false), null, 'and it does not come back this visit');
});

test('moving the camera takes the hint away and it never shows again', () => {
  const h = createHint(fresh(), 0);
  h.tick(HINT_DELAY_MS, false);
  assert.equal(h.moved(), 'hide');
  const rec = h.record();
  assert.deepEqual(rec, { shows: 1, moved: true });
  const next = createHint(readHint(JSON.stringify(rec)), 0);
  assert.equal(next.tick(HINT_DELAY_MS * 4, false), null, 'a later visit: never again');
});

test('a player who moves the camera before the hint shows never sees it', () => {
  const h = createHint(fresh(), 0);
  assert.equal(h.moved(), null);
  assert.equal(h.tick(HINT_DELAY_MS * 4, false), null);
  assert.deepEqual(h.record(), { shows: 0, moved: true });
});

test('a tap on the hint closes it; it shows on a second visit, and no third', () => {
  let rec = fresh();
  for (let visit = 1; visit <= HINT_MAX_SHOWS; visit++) {
    const h = createHint(rec, 0);
    assert.equal(h.tick(HINT_DELAY_MS, false), 'show', `visit ${visit}`);
    assert.equal(h.dismiss(), 'hide');
    assert.equal(h.dismiss(), null, 'a second tap does nothing');
    rec = readHint(JSON.stringify(h.record()));
  }
  assert.equal(rec.shows, HINT_MAX_SHOWS);
  const third = createHint(rec, 0);
  assert.equal(third.over(), true, 'no third visit');
  assert.equal(third.tick(HINT_DELAY_MS * 4, false), null);
});

test('a missing or broken record reads as fresh', () => {
  for (const raw of [null, '', 'not json', '{"shows":-3,"moved":"yes"}', '[]']) assert.deepEqual(readHint(raw), { shows: 0, moved: false }, String(raw));
  assert.deepEqual(readHint('{"shows":1,"moved":false}'), { shows: 1, moved: false });
});

test('the line speaks to fingers or to a mouse', () => {
  assert.match(hintText(true), /two fingers/);
  assert.match(hintText(true), /Tap the compass to reset/);
  assert.match(hintText(false), /^Drag to turn and tilt · Right-drag to pan/);
});
