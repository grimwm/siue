// games/tankity/test/field.test.mjs
// How wide a solo field is dealt, and how the field sits in the battlefield
// box (src/field.ts). The width comes from the box the device gives in
// landscape and never from portrait.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FIELD_COL, FIELD_W_MAX, FIELD_W_MIN, H, ROOM_W, fieldWidthOk } from '../src/sim.ts';
import { createFieldWidth, fieldWidth, fieldWidthFor, fitField, landscapeBox, visibleWorld } from '../src/field.ts';

test('the width is 460 × the landscape aspect, on a whole column', () => {
  assert.equal(fieldWidth({ w: 1118, h: 426 }), 1200); // 1207.2 → 50.3 columns → 50
  assert.equal(fieldWidth({ w: 842, h: 318 }), 1224);
  assert.equal(fieldWidth({ w: 1118, h: 526 }), 984);
  for (const w of [1200, 1224, 984]) assert.equal(w % FIELD_COL, 0);
});

test('the width clamps to 720–1440', () => {
  assert.equal(fieldWidth({ w: 800, h: 600 }), FIELD_W_MIN);
  assert.equal(fieldWidth({ w: 3000, h: 400 }), FIELD_W_MAX);
  assert.equal(fieldWidth({ w: 1000, h: 0 }), FIELD_W_MAX, 'a collapsed box never divides by zero');
  assert.equal(ROOM_W, FIELD_W_MIN);
});

test("a portrait box is read in its landscape aspect", () => {
  assert.equal(fieldWidth({ w: 383, h: 568 }), fieldWidth({ w: 568, h: 383 }));
});

test('the box is the one the device gives in landscape, whichever way it is held', () => {
  assert.deepEqual(landscapeBox(1280, 720), { w: 1118, h: 426 });
  assert.deepEqual(landscapeBox(1024, 640), { w: 1006, h: 346 });
  assert.deepEqual(landscapeBox(1180, 820), { w: 1118, h: 526 });
  assert.deepEqual(landscapeBox(852, 393), { w: 842, h: 318 });
  assert.deepEqual(landscapeBox(740, 360), { w: 730, h: 285 });
  for (const [w, h] of [[393, 852], [360, 740], [820, 1180]]) assert.deepEqual(landscapeBox(w, h), landscapeBox(h, w));
});

test('portrait and landscape on one device deal the same width', () => {
  const pairs = [[[1180, 820], [820, 1180], 984], [[852, 393], [393, 852], 1224], [[740, 360], [360, 740], 1176]];
  for (const [land, port, want] of pairs) {
    assert.equal(fieldWidthFor(...land), want, `${land} in landscape`);
    assert.equal(fieldWidthFor(...port), want, `${port} in portrait`);
  }
  assert.equal(fieldWidthFor(1280, 720), 1200);
  assert.equal(fieldWidthFor(1024, 640), 1344);
});

test('the dealt width holds until the next deal, whatever the viewport does', () => {
  let vp = { w: 1280, h: 720 };
  const fw = createFieldWidth(() => vp);
  assert.equal(fw.width, ROOM_W, 'nothing dealt yet');
  assert.equal(fw.deal(), 1200);
  vp = { w: 1024, h: 640 };
  assert.equal(fw.width, 1200, 'a resize mid-match rescales only');
  vp = { w: 640, h: 1024 };
  assert.equal(fw.width, 1200, 'and so does turning the device');
  assert.equal(fw.deal(), 1344, 'the next match takes the new shape');
});

test('fieldWidthOk takes only whole columns in range', () => {
  for (const w of [720, 744, 1200, 1440]) assert.ok(fieldWidthOk(w), String(w));
  for (const w of [696, 1464, 1201, 1200.5, '1200', null, NaN]) assert.ok(!fieldWidthOk(w), String(w));
});

test('a wider box centres the field; a taller one spans it and puts 60 % of the rest above', () => {
  const wide = fitField({ w: 1118, h: 426 }, { w: ROOM_W, h: H });
  assert.ok(Math.abs(wide.s - 426 / H) < 1e-12);
  assert.ok(Math.abs(wide.ox - (1118 - ROOM_W * wide.s) / 2) < 1e-9 && Math.abs(wide.oy) < 1e-9);
  const tall = fitField({ w: 383, h: 568 }, { w: 1224, h: H });
  assert.ok(Math.abs(tall.s * 1224 - 383) < 1e-9, 'the field spans the full width');
  assert.equal(tall.ox, 0);
  assert.ok(Math.abs(tall.oy - (568 - H * tall.s) * 0.6) < 1e-9);
  const seen = visibleWorld(tall, { w: 383, h: 568 });
  assert.ok(seen.x0 === 0 && Math.abs(seen.x1 - 1224) < 1e-9);
  assert.ok(seen.y0 < 0 && seen.y1 > H, 'sky above the field and dirt below it are in view');
});
