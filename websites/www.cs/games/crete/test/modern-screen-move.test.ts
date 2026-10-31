// A direction on the screen becomes a grid direction: up is the grid direction closest to away from the camera.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MOVE_HYSTERESIS, createMoveMap, moveQuarter, screenToGrid } from '../src/modern/screen-move.ts';

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

test('at each quarter turn, up is away from the camera and the rest follow', () => {
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

test('at any heading, up is the grid direction closest to away from the camera', () => {
  const want: [number, string][] = [[0, 'up'], [30, 'up'], [44, 'up'], [46, 'left'], [90, 'left'], [200, 'down'], [315, 'up'], [-30, 'up'], [-46, 'right']];
  for (const [heading, grid] of want) assert.equal(screenToGrid('up', heading), grid, `up at ${heading}°`);
  // The rest turn with it: at 200° (nearest 180°) right on the screen is left on the grid.
  assert.equal(screenToGrid('right', 200), 'left');
  assert.equal(screenToGrid('left', 30), 'left');
  assert.equal(screenToGrid('down', 315), 'down');
});

test('near a 45° boundary the last quarter holds for a few degrees, then gives way', () => {
  assert.equal(moveQuarter(46, 0), 0, 'just past 45° from north stays north');
  assert.equal(moveQuarter(44, 1), 1, 'and back the other way stays on the quarter it was');
  assert.equal(moveQuarter(45 + MOVE_HYSTERESIS + 1, 0), 1, 'further on it changes');
  assert.equal(moveQuarter(-46, 0), 0);
  assert.equal(moveQuarter(314, 0), 0, '314° is within the band of north');
  assert.equal(moveQuarter(200, 0), 2, 'a jump far past the band takes the nearest quarter');
  const map = createMoveMap();
  assert.equal(map('up', 44), 'up');
  assert.equal(map('up', 47), 'up', 'the map remembers north');
  assert.equal(map('up', 60), 'left');
  assert.equal(map('up', 44), 'left', 'and now remembers west');
  assert.equal(map('up', 30), 'up');
});
