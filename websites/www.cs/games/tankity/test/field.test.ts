// games/tankity/test/field.test.ts
// How wide a solo field is dealt, and how the field sits in the battlefield
// box (src/field.ts). The width comes from the box the device gives in
// landscape and never from portrait.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FIELD_COL, FIELD_W_MAX, FIELD_W_MIN, H, ROOM_W, fieldWidthOk } from '../src/sim.ts';
import { stepArm } from '../src/input.ts';
import type { Held } from '../src/input.ts';
import { createFieldWidth, powerScale, angleText, powerText, fieldWidth, fieldWidthFor, fitField, landscapeBox, visibleWorld } from '../src/field.ts';

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

test('a viewport with no size deals the room field', () => {
  assert.equal(fieldWidth({ w: NaN, h: NaN }), ROOM_W);
  // @ts-expect-error: a viewport that reports no size at all, which Box does not allow
  assert.equal(fieldWidth({ w: undefined, h: undefined }), ROOM_W);
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
  for (const [w, h] of [[393, 852], [360, 740], [820, 1180]] satisfies [number, number][]) assert.deepEqual(landscapeBox(w, h), landscapeBox(h, w));
});

test('portrait and landscape on one device deal the same width', () => {
  const pairs = [[[1180, 820], [820, 1180], 984], [[852, 393], [393, 852], 1224], [[740, 360], [360, 740], 1176]] satisfies [[number, number], [number, number], number][];
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

test('a press of power is 720/W of a step, so a shot moves as far on any field', () => {
  // Held keeps its keys in a private set, so a stand-in needs the double cast; stepArm calls only has, axis and aiming.
  const held = { has: (k: string) => k === 'powerUp', axis: () => 0, aiming: () => true } as unknown as Held;
  const step = (w?: number) => stepArm(held, 1, { angle: 45, power: 50 }, 1, w).power - 50;
  assert.equal(step(720), 45);
  assert.equal(step(), 45, 'a room is the default');
  assert.ok(Math.abs(step(1080) - 30) < 1e-12);
  assert.ok(Math.abs(step(1440) - 22.5) < 1e-12);
  assert.equal(powerScale(720), 1);
  assert.equal(powerScale(1440), 0.5);
});

test('power shows whole on a room field and with one decimal on a wider one', () => {
  assert.equal(powerText(55.4, 720), '55');
  assert.equal(powerText(55.5, 720), '56');
  assert.equal(powerText(55.46, 1080), '55.5');
  assert.equal(powerText(100, 1440), '100.0');
  assert.equal(powerText(10, 1440), '10.0');
});

test('the status bar angle reads a far-side dip as the negative angle a near-side dip does', () => {
  assert.equal(angleText(-20), '-20°');
  assert.equal(angleText(200), '-20°');
  assert.equal(angleText(180), '180°');
  assert.equal(angleText(162.4), '162°');
});
