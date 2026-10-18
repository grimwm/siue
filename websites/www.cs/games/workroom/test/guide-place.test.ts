// Where the guide's card goes so it never covers the lit part: the side with
// more room, as tall as that room allows; a part taller than the screen gets
// the card over its far end with its top left in view.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardPlacement } from '../src/guide-place.ts';

const VW = 390;
const VH = 844;
/** The card's vertical extent for a placement, as the overlay draws it (16 px from the screen's edge). */
const cardBox = (side: string, maxHeight: number): [number, number] => (side === 'above' ? [16, 16 + maxHeight] : [VH - 16 - maxHeight, VH - 16]);
const clear = (spot: { top: number; height: number }) => {
  const place = cardPlacement({ left: 16, width: 358, ...spot }, VW, VH);
  const [a, b] = cardBox(place.side, place.maxHeight);
  assert.notEqual(place.side, 'over');
  assert.ok(b <= spot.top || a >= spot.top + spot.height, `card ${a}-${b} clear of spot ${spot.top}-${spot.top + spot.height}`);
  return place;
};

test('a spot near the top puts the card below it, near the bottom above it', () => {
  assert.equal(clear({ top: 60, height: 80 }).side, 'below');
  assert.equal(clear({ top: 700, height: 80 }).side, 'above');
});

test('a tall stage starting at 200 gets the roomier side, capped to fit', () => {
  const place = clear({ top: 200, height: 460 });
  assert.equal(place.side, 'above');
  assert.ok(place.maxHeight >= 120);
});

test('a spot in the middle gets a card as tall as the room allows, never taller than half the screen', () => {
  const place = clear({ top: 380, height: 100 });
  assert.ok(place.maxHeight <= VH / 2);
});

test('a spot taller than the screen: the card goes over its far end and the spot’s top stays in view', () => {
  const spot = { left: 0, width: 390, top: 100, height: 2000 };
  const place = cardPlacement(spot, VW, VH);
  assert.equal(place.side, 'over');
  const [a] = cardBox('below', place.maxHeight);
  assert.ok(a > spot.top, 'the card starts below the spot’s top');
});
