// The touch tour: when it shows by itself, and what each step shows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TOUR_STEPS, tourDue } from '../src/tour.ts';

test('the tour shows by itself only on a touch screen, once, while a level is in play with no card over it', () => {
  const due = { touch: true, seen: false, playing: true, covered: false };
  assert.equal(tourDue(due), true);
  assert.equal(tourDue({ ...due, touch: false }), false, 'a mouse needs no tour');
  assert.equal(tourDue({ ...due, seen: true }), false, 'once only');
  assert.equal(tourDue({ ...due, playing: false }), false, 'not on the title card or after a try ends');
  assert.equal(tourDue({ ...due, covered: true }), false, 'never over the start card or a first card');
});

test('the tour walks through a tap, a hold, a slide, one finger and two, each with a short caption', () => {
  assert.deepEqual(TOUR_STEPS.map(s => s.caption), [
    'Tap an arrow to take a step',
    'Hold an arrow to keep walking',
    'Slide to another arrow to change way',
    'One finger turns and tilts the view',
    'Two fingers pan, twist and pinch',
  ]);
  const at = { arrow: (d: string) => ({ x: d.length, y: 0 }), board: (fx: number, fy: number) => ({ x: fx * 100, y: fy * 100 }) };
  const plans = TOUR_STEPS.map(s => s.play(at));
  assert.deepEqual(plans.map(p => p.dots.length), [1, 1, 1, 1, 2]);
  for (const p of plans) for (const d of p.dots) assert.equal(d.points.length, d.press.length);
  assert.deepEqual(plans.map(p => p.board !== undefined), [false, false, false, true, true], 'only the view steps move the board');
});
