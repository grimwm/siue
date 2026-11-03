// Following the playhead: it walks to the middle of the visible area right of the track heads, then the music scrolls
// under it, and it walks on at the end; a hand scroll pauses following until the playhead leaves the view and comes
// back, 600 ms after the last hand scroll.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { followTo, handScrolled, newFollow } from '../src/compose/follow.ts';

// A 1000 px view with 200 px of track heads over a 5000 px timeline: the middle of the music area is 600 px in.
const view = (scrollLeft: number) => ({ scrollLeft, clientWidth: 1000, scrollWidth: 5000, inset: 200 });

test('the playhead walks to the middle, then the music scrolls under it, then it walks on at the end', () => {
  const f = newFollow(0);
  assert.equal(followTo(f, 300, view(0), 0), null, 'left of the middle: it walks');
  assert.equal(followTo(f, 600, view(0), 0), null, 'at the middle: still no scroll');
  assert.equal(followTo(f, 700, view(0), 0), 100, 'past it: the music scrolls');
  assert.equal(followTo(f, 2000, view(100), 0), 1400);
  assert.equal(followTo(f, 4800, view(1400), 0), 4000, 'held at the end');
  assert.equal(followTo(f, 4900, view(4000), 0), null, 'and it walks on to the end');
  assert.equal(followTo(f, 100, view(4000), 0), 0, 'back to the start (a loop): it jumps back');
  assert.equal(followTo(newFollow(0), 900, { scrollLeft: 0, clientWidth: 1000, scrollWidth: 1000, inset: 200 }, 0), null, 'nothing to scroll');
});

test('a hand scroll pauses it until the playhead leaves the view and comes back, after 600 ms', () => {
  const f = newFollow(0);
  assert.equal(followTo(f, 700, view(0), 0), 100);
  handScrolled(f, 101, 10);
  assert.equal(f.paused, false, 'the scroll it set (to 2 px) is not a hand scroll');
  handScrolled(f, 2000, 20);
  assert.equal(f.paused, true);
  assert.equal(followTo(f, 2500, view(2000), 100), null, 'in view: stays paused');
  assert.equal(followTo(f, 3100, view(2000), 1000), null, 'it leaves the view');
  assert.equal(f.out, true);
  handScrolled(f, 2600, 1100);
  assert.equal(f.until, 1700, 'a scroll while paused pushes the resume time on');
  assert.equal(followTo(f, 3200, view(2600), 1500), null, 'back in view but too soon');
  assert.equal(followTo(f, 3400, view(2600), 1800), 2800, 'back in view after 600 ms: following again');
  assert.equal(f.paused, false);
});
