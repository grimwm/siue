// websites/www.cs/games/crete/test/item-bubble.test.ts
// The item bubble: shown only for the Minotaur at rest on an item, never for Theseus, never for a block; and placed
// up and to the right of the head unless that would leave the board, when it goes to the side or below.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bubbleAt, bubbleSize, bubbles, spotInView } from '../src/item-bubble.ts';
import type { Figures } from '../src/board-plan.ts';
import type { State } from '../src/puzzle/state.ts';
import type { ObjectKind } from '../src/puzzle/tiles.ts';
import { grid } from './puzzle-grid.ts';

/** `s` with `kind` set down at (r, c). */
function withItem(s: State, r: number, c: number, kind: ObjectKind): State {
  const objects = [...s.objects];
  objects[r * s.level.cols + c] = kind;
  return { ...s, objects };
}

const at = (s: State): Figures => ({ player: s.player, minotaur: s.minotaur, hazards: [] });

test('the Minotaur on any item Theseus could take shows a bubble of that item', () => {
  const s = grid(['P..', '.M.', '...']);
  for (const kind of ['relic', 'key-red', 'flippers', 'mirror', 'cake', 'page'] as const) {
    const on = withItem(s, 1, 1, kind);
    assert.deepEqual(bubbles(on, at(on)), [{ kind, c: 1, r: 1, by: 'minotaur' }], kind);
  }
});

test('no bubble off an item, on a block, for Theseus, or with no Minotaur', () => {
  const s = grid(['P..', '.M.', '...']);
  assert.deepEqual(bubbles(s, at(s)), []);
  const block = withItem(s, 1, 1, 'block');
  assert.deepEqual(bubbles(block, at(block)), []);
  const under = withItem(s, 0, 0, 'key-red');
  assert.deepEqual(bubbles(under, at(under)), [], 'Theseus never has one');
  const none = { ...withItem(s, 1, 1, 'relic'), minotaur: null };
  assert.deepEqual(bubbles(none, at(none)), []);
});

test('no bubble while the Minotaur is mid-step, nor on a cell he is only passing', () => {
  const s = withItem(grid(['P..', '.M.', '...']), 1, 1, 'relic');
  assert.deepEqual(bubbles(s, { ...at(s), minotaur: { r: 1, c: 1.5 } }), []);
  assert.deepEqual(bubbles(withItem(s, 1, 2, 'cake'), { ...at(s), minotaur: { r: 1, c: 2 } }), []);
});

test('the bubble goes up and right of the head, and stays on the board at its edges', () => {
  const cell = 60, d = bubbleSize(cell);
  const mid = bubbleAt(200, 200, cell, 400, 400);
  assert.equal(mid.place, 0);
  assert.ok(mid.cx > 200 && mid.cy < 200, 'up and right');
  for (const [x, head] of [[200, 6], [395, 200], [395, 6], [4, 6], [200, 396]] as const) {
    const b = bubbleAt(x, head, cell, 400, 400);
    assert.ok(b.cx - d / 2 >= 0 && b.cx + d / 2 <= 400 && b.cy - d / 2 >= 0 && b.cy + d / 2 <= 400, `inside at ${x},${head}`);
  }
  assert.notEqual(bubbleAt(200, 6, cell, 400, 400).place, 0, 'the top row turns it aside');
});

test('the bubble stays readable on a phone and small beside a zoomed-in cell', () => {
  assert.equal(bubbleSize(20), 34);
  assert.equal(bubbleSize(200), 54);
});

test('a Minotaur the camera has turned or panned out of view shows no bubble', () => {
  const bubble = { kind: 'relic', c: 1, r: 1, by: 'minotaur' } as const;
  const spot = (x: number, head: number) => ({ bubble, x, head, cell: 60 });
  assert.ok(spotInView(spot(200, 200), 400, 400));
  assert.ok(spotInView(spot(200, -30), 400, 400), 'a top-row head just above the board still counts');
  for (const [x, head] of [[-10, 200], [410, 200], [200, -70], [200, 420]] as const) {
    assert.ok(!spotInView(spot(x, head), 400, 400), `out at ${x},${head}`);
  }
});
