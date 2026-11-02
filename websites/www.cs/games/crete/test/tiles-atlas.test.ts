// The atlas names every sprite the board asks for, every frame lies inside the PNG,
// and the loops are the ones the spec names.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPRITE_NAMES } from '../src/puzzle/tiles.ts';

const dir = new URL('../fx/sprites/', import.meta.url);
const atlas = JSON.parse(readFileSync(new URL('tiles.json', dir), 'utf8')) as {
  cell: number; rise: number; sprites: Record<string, { x: number; y: number; frames: number; fps: number }>;
};
const png = readFileSync(new URL('tiles.png', dir));
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);

test('every sprite the board draws is in the atlas, and nothing else is', () => {
  assert.deepEqual(Object.keys(atlas.sprites).sort(), [...SPRITE_NAMES].sort());
});

test('every frame lies inside tiles.png', () => {
  for (const [name, s] of Object.entries(atlas.sprites)) {
    assert.ok(s.frames >= 1, name);
    assert.ok(s.x + s.frames * atlas.cell <= width, `${name} runs past the right edge`);
    assert.ok(s.y + atlas.cell + atlas.rise <= height, `${name} runs past the bottom`);
  }
});

test('water, fire, the force floors, the teleport, the Minotaur and the hazards loop; the gate\'s bars step across; everything else is still', () => {
  const loops = ['water', 'fire', 'force-up', 'force-down', 'force-left', 'force-right', 'teleport', 'minotaur', 'ball', 'glider', 'fireball'];
  const steps = ['gate-slide', 'gate-slide-v'];
  for (const [name, s] of Object.entries(atlas.sprites)) {
    if (loops.includes(name)) assert.ok(s.frames >= 6 && s.fps > 0, name);
    else if (steps.includes(name)) assert.ok(s.frames >= 4 && s.fps === 0, name);
    else assert.equal(s.frames, 1, name);
  }
});
