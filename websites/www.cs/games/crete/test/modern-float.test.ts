// Blocks pushed into water: which cells float a block, and how the block goes in and bobs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DIP_S, FLOAT_TOP, RISE_S, filledWater, floatBob, floatTop } from '../src/modern/float.ts';
import type { Terrain } from '../src/puzzle/tiles.ts';

test('filledWater: water at the start that is dirt now, and nothing else', () => {
  const initial: Terrain[] = ['water', 'water', 'dirt', 'floor', 'water', 'water'];
  const now: Terrain[] = ['dirt', 'water', 'dirt', 'dirt', 'floor', 'dirt'];
  assert.deepEqual(filledWater(initial, now), [0, 5], 'old dirt, new dirt on floor and water turned to floor are not floating blocks');
  assert.deepEqual(filledWater(initial, initial), [], 'back at the start (undo, restart) nothing floats');
});

test('floatTop: in at the entry height, under the surface at the dip, floating at rest after the rise', () => {
  const enter = 0.865;
  assert.equal(floatTop(0, enter), enter);
  assert.ok(floatTop(DIP_S * 0.5, enter) < enter && floatTop(DIP_S * 0.5, enter) > 0, 'falling');
  assert.ok(floatTop(DIP_S, enter) < 0, 'under the surface');
  const rising = [0.2, 0.5, 0.8].map(k => floatTop(DIP_S + k * RISE_S, enter));
  assert.ok(rising[0]! < rising[1]! && rising[1]! < rising[2]! && rising[2]! <= FLOAT_TOP, 'rising, never past rest');
  assert.equal(floatTop(DIP_S + RISE_S, enter), FLOAT_TOP);
  assert.equal(floatTop(5, enter), FLOAT_TOP);
  assert.ok(FLOAT_TOP > 0 && FLOAT_TOP < 0.1, 'its top just above the water');
});

test('floatBob: about a hundredth of a cell over three seconds, and nothing under reduced motion', () => {
  const xs = Array.from({ length: 300 }, (_, i) => floatBob(i / 100, false));
  assert.ok(Math.max(...xs) > 0.005 && Math.max(...xs) <= 0.02);
  assert.ok(Math.abs(floatBob(0.4, false) - floatBob(3.4, false)) < 1e-9);
  for (const t of [0, 0.7, 2.2]) assert.equal(floatBob(t, true), 0);
});
