// The arsenal baked into the page for when game.json cannot load must be game.yaml's own rows, not a hand-kept copy that drifts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal } from '../src/sim.ts';
import type { Gear, Personality, Weapon } from '../src/sim.ts';
import { FALLBACK_ARSENAL, FALLBACK_DRONES } from '../src/fallback-arsenal.ts';

const game: { arsenal: { ammo: Weapon[]; gear: Gear[] }; drones: { personalities: Personality[] } } = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));

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

test('the fallback drones are the personalities game.json carries, in its order', () => {
  assert.deepEqual(FALLBACK_DRONES, game.drones, 'copy game.json\'s drones section into src/fallback-arsenal.ts');
  const a = buildArsenal(FALLBACK_ARSENAL, FALLBACK_DRONES);
  assert.ok(a);
  assert.equal(a.drones.length, game.drones.personalities.length);
});
