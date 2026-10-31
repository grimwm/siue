// A direction on the screen becomes a grid direction at the view's nearest quarter turn.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { screenToGrid } from '../src/modern/screen-move.ts';

test('screen-up follows the quarter turn of the view', () => {
  assert.equal(screenToGrid('up', 15), 'up');
  assert.equal(screenToGrid('up', 44), 'up');
  assert.equal(screenToGrid('up', 90), 'left');
  assert.equal(screenToGrid('up', 180), 'down');
  assert.equal(screenToGrid('up', -90), 'right');
  assert.equal(screenToGrid('up', 270), 'right');
  assert.equal(screenToGrid('up', 720 + 15), 'up');
});

test('the other directions rotate with it', () => {
  assert.equal(screenToGrid('right', 90), 'up');
  assert.equal(screenToGrid('down', 90), 'right');
  assert.equal(screenToGrid('left', 90), 'down');
  assert.equal(screenToGrid('left', 0), 'left');
  assert.equal(screenToGrid('right', 0), 'right');
  assert.equal(screenToGrid('down', 180), 'up');
});

test('at each of the four headings a view settles to, up is away from the camera and the rest follow', () => {
  // Heading 0 looks north (up the board); each quarter turn of the view swings screen-up a quarter the other way.
  const want: Record<number, Record<'up' | 'right' | 'down' | 'left', string>> = {
    0: { up: 'up', right: 'right', down: 'down', left: 'left' },
    90: { up: 'left', right: 'up', down: 'right', left: 'down' },
    180: { up: 'down', right: 'left', down: 'up', left: 'right' },
    270: { up: 'right', right: 'down', down: 'left', left: 'up' },
  };
  for (const [heading, map] of Object.entries(want)) {
    for (const [screen, grid] of Object.entries(map)) {
      assert.equal(screenToGrid(screen as 'up', Number(heading)), grid, `${screen} at ${heading}`);
      assert.equal(screenToGrid(screen as 'up', Number(heading) - 360), grid, `${screen} at ${Number(heading) - 360}`);
    }
  }
});
