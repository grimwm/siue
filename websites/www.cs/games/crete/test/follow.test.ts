import { test } from 'node:test';
import assert from 'node:assert/strict';
import { follow } from '../src/follow.ts';

const content = { w: 1000, h: 800 };
const view = (x: number, y: number) => ({ x, y, w: 300, h: 400 });

test('a box well inside the view leaves the offset alone', () => {
  assert.deepEqual(follow(view(100, 100), content, { left: 200, top: 250, size: 32 }, 64), { x: 100, y: 100 });
});

test('a box past the right or bottom margin moves just enough to sit margin inside', () => {
  // right edge 400 + 64 margin = 464; the view ends at 400, so scroll 64.
  assert.deepEqual(follow(view(100, 100), content, { left: 368, top: 250, size: 32 }, 64), { x: 164, y: 100 });
  // bottom edge 500 + 64 = 564 against 500.
  assert.deepEqual(follow(view(100, 100), content, { left: 200, top: 468, size: 32 }, 64), { x: 100, y: 164 });
});

test('a box past the left or top margin moves just enough the other way', () => {
  assert.deepEqual(follow(view(100, 100), content, { left: 140, top: 250, size: 32 }, 64), { x: 76, y: 100 });
  assert.deepEqual(follow(view(100, 100), content, { left: 200, top: 120, size: 32 }, 64), { x: 100, y: 56 });
});

test('the offset never goes below 0 nor past content minus view', () => {
  assert.deepEqual(follow(view(10, 10), content, { left: 0, top: 0, size: 32 }, 64), { x: 0, y: 0 });
  assert.deepEqual(follow(view(690, 390), content, { left: 968, top: 768, size: 32 }, 64), { x: 700, y: 400 });
});

test('content smaller than the view stays at 0', () => {
  assert.deepEqual(follow({ x: 0, y: 0, w: 300, h: 400 }, { w: 200, h: 300 }, { left: 150, top: 250, size: 32 }, 64), { x: 0, y: 0 });
});
