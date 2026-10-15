// The arsenal baked into the page for when game.json cannot load must be game.yaml's own rows, not a hand-kept copy that drifts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal } from '../src/sim.ts';
import type { Gear, Weapon } from '../src/sim.ts';
import { FALLBACK_ARSENAL } from '../src/fallback-arsenal.ts';

const game: { arsenal: { ammo: Weapon[]; gear: Gear[] } } = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));

test('every fallback row is the same row game.json carries', () => {
  for (const [list, rows] of [['ammo', FALLBACK_ARSENAL.ammo], ['gear', FALLBACK_ARSENAL.gear]] as const) {
    assert.ok(rows.length > 0, `the fallback ${list} is empty`);
    for (const row of rows) {
      const live = (game.arsenal[list] as { key: string }[]).find(r => r.key === row.key);
      assert.ok(live, `${list} row ${row.key} is gone from game.json; drop it from src/fallback-arsenal.ts`);
      assert.deepEqual(row, live, `${list} row ${row.key} drifted from game.json; copy the row over`);
    }
  }
});

test('the fallback builds into an arsenal that holds the free Shell', () => {
  const a = buildArsenal(FALLBACK_ARSENAL);
  assert.ok(a, 'the fallback arsenal builds');
  assert.ok(a.weapons.shell, 'the Shell is in it');
});
