// games/tankity/test/scenery.test.ts
// The hills past the field's edges (src/scenery.ts): the same hills continued,
// eased from the field's live edge so a crater there leaves no cliff, and
// never more than 1 px of step at the seam beyond the hills' own slope.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { carveCrater, genTerrain, hashSeed, hillY, mulberry32 } from '../src/sim.ts';
import { SEAM_EASE, sceneryY } from '../src/scenery.ts';
import type { Hills } from '../src/sim.ts';

function nth(t: readonly number[], i: number): number {
  const v = t[i];
  assert.ok(v !== undefined, `no column ${i}`);
  return v;
}

const SEEDS = Array.from({ length: 60 }, (_, i) => 'seam-' + i);
const deal = (seed: string, w: number) => genTerrain(mulberry32(hashSeed(seed)), w);
function seamSteps(h: Hills, t: readonly number[]) {
  const w = t.length;
  return [
    Math.abs(sceneryY(h, t, -1) - nth(t, 0)) - Math.abs(hillY(h, -1) - hillY(h, 0)),
    Math.abs(sceneryY(h, t, w) - nth(t, w - 1)) - Math.abs(hillY(h, w) - hillY(h, w - 1)),
  ];
}

test('inside the field the scenery is the field', () => {
  const { terrain, hills } = deal('in', 1080);
  for (let x = 0; x < 1080; x += 13) assert.equal(sceneryY(hills, terrain, x), terrain[x]);
});

test('past the ease the scenery is the same hills, continued', () => {
  for (const w of [720, 1080, 1440]) {
    const { terrain, hills } = deal('far', w);
    for (const x of [-SEAM_EASE - 1, -300, w + SEAM_EASE, w + 500]) assert.equal(sceneryY(hills, terrain, x), hillY(hills, x));
  }
});

test('the seam adds no step greater than 1 px, untouched or cratered', () => {
  for (const w of [720, 1080, 1440]) {
    for (const seed of SEEDS) {
      const { terrain, hills } = deal(seed, w);
      for (const s of seamSteps(hills, terrain)) assert.ok(s <= 1 + 1e-9, `${seed} at ${w}: ${s}`);
      carveCrater(terrain, 0, nth(terrain, 0), 60, 456);
      carveCrater(terrain, w - 1, nth(terrain, w - 1), 60, 456);
      for (const s of seamSteps(hills, terrain)) assert.ok(s <= 1 + 1e-9, `${seed} at ${w}, cratered: ${s}`);
    }
  }
});

test('each column of the ease moves at most 1 px off the hills', () => {
  const { terrain, hills } = deal('ease', 720);
  carveCrater(terrain, 719, nth(terrain, 719), 90, 456);
  for (let k = 1; k < 200; k++) {
    const off = sceneryY(hills, terrain, 719 + k) - hillY(hills, 719 + k);
    const prev = sceneryY(hills, terrain, 718 + k) - hillY(hills, 718 + k);
    assert.ok(Math.abs(off - prev) <= 1 + 1e-9, `column ${k}`);
  }
});
