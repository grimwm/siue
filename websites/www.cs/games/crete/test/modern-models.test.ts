// The modern board has a model for every terrain sprite, and picks it per cell by Classic's rules.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TERRAIN } from '../src/puzzle/tiles.ts';
import { TERRAIN_MODEL_NAMES, SURFACES, terrainModel } from '../src/modern/model-names.ts';
import { grid } from './puzzle-grid.ts';

const atlas = JSON.parse(readFileSync(new URL('../fx/sprites/tiles.json', import.meta.url), 'utf8')) as {
  sprites: Record<string, unknown>;
};
const terrainSprites = [...new Set(Object.values(TERRAIN).flatMap(d => d.sprites))];

test('every terrain sprite in tiles.json has a modern model, and every model is a terrain sprite', () => {
  for (const name of terrainSprites) assert.ok(name in atlas.sprites, `${name} is in the atlas`);
  assert.deepEqual([...TERRAIN_MODEL_NAMES].sort(), terrainSprites.sort());
  for (const name of TERRAIN_MODEL_NAMES) assert.ok(SURFACES[name], `${name} has a surface`);
});

test('fake and invisible walls show the sprite Classic draws for them', () => {
  const s = grid(['PWI']);
  assert.equal(terrainModel(s, 1), 'wall');
  assert.equal(terrainModel(s, 2), 'floor');
});

test('the gate opens with the last relic', () => {
  const s = grid(['P*|E']);
  assert.equal(terrainModel(s, 2), 'gate-closed');
  assert.equal(terrainModel({ ...s, relicsLeft: 0 }, 2), 'gate-open');
});

test('a clone machine shows its facing', () => {
  const s = grid(['PCC'], 'machines: block-left ball-down');
  assert.equal(terrainModel(s, 1), 'clone-left');
  assert.equal(terrainModel(s, 2), 'clone-down');
});
