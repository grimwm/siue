// The modern board has a model for every sprite, and picks and places it by Classic's rules.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FIGURE_SPRITES, HAZARDS, OBJECTS, TERRAIN, TURNED_SPRITES } from '../src/puzzle/tiles.ts';
import type { State } from '../src/puzzle/state.ts';
import { initial } from '../src/puzzle/state.ts';
import { parse } from '../src/puzzle/level.ts';
import { step } from '../src/puzzle/step.ts';
import { drawList, timeline } from '../src/board-plan.ts';
import type { Atlas, Figures } from '../src/board-plan.ts';
import { TILES_LEVEL } from '../src/tiles-level.ts';
import {
  FIGURE_MODEL_NAMES, PIECE_MODEL_NAMES, TERRAIN_MODEL_NAMES, SURFACES, placed, terrainModel,
} from '../src/modern/model-names.ts';
import { grid, mv } from './puzzle-grid.ts';

const atlas = JSON.parse(readFileSync(new URL('../fx/sprites/tiles.json', import.meta.url), 'utf8')) as Atlas;
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

test('every object, hazard and figure sprite has a modern model, and every sprite in tiles.json has one but Classic\'s turned forms', () => {
  const pieces = [...Object.values(OBJECTS).map(o => o.sprite), ...Object.values(HAZARDS).map(h => h.sprite), 'cow-standing'];
  const figures = FIGURE_SPRITES.filter(f => f !== 'cow-standing');
  assert.deepEqual([...PIECE_MODEL_NAMES].sort(), [...new Set(pieces)].sort());
  assert.deepEqual([...FIGURE_MODEL_NAMES].sort(), [...figures].sort());
  const all = [...TERRAIN_MODEL_NAMES, ...PIECE_MODEL_NAMES, ...FIGURE_MODEL_NAMES];
  assert.equal(new Set(all).size, all.length, 'no name is in two tables');
  assert.deepEqual([...all, ...TURNED_SPRITES].sort(), Object.keys(atlas.sprites).sort());
});

const rest = (s: State): Figures => ({ player: s.player, minotaur: s.minotaur, hazards: s.hazards.map(h => ({ kind: h.kind, at: h.at })) });
/** What drawList draws over the terrain, and what `placed` places, as sorted `sprite@row,col` words. */
const classic = (s: State, f: Figures) => {
  const terrain = new Set<string>([...TERRAIN_MODEL_NAMES, ...TURNED_SPRITES]);
  return drawList(s, f, atlas, 0).filter(d => !terrain.has(d.sprite)).map(d => `${d.sprite}@${d.y},${d.x}`).sort();
};
const modern = (s: State, f: Figures) => placed(s, f).map(p => `${p.model}@${p.r},${p.c}`).sort();

test('the pieces and figures stand where Classic draws them: every piece, a template, the hazards', () => {
  const s = initial(parse(TILES_LEVEL));
  assert.deepEqual(modern(s, rest(s)), classic(s, rest(s)));
  assert.ok(modern(s, rest(s)).includes('ball@5,11'), 'a clone machine shows its template');
});

test('a pushed block and a moving hazard stand where the turn has them; a taken object is gone with the state', () => {
  const s = grid(['PO..k', '.....', 'o...M'], 'facing: right');
  const r = step(s, mv('right'));
  const tl = timeline(s, r.events, false, r.state);
  for (const ms of [0, tl.playerEnd / 2, (tl.playerEnd + tl.hazardEnd) / 2, tl.duration]) {
    const f = tl.at(ms);
    const st = ms < tl.playerEnd ? s : r.state;
    assert.deepEqual(modern(st, f), classic(st, f), `at ${ms} ms`);
  }
  const mid = tl.at(tl.playerEnd / 2);
  assert.ok(modern(s, mid).includes('block@0,1.5'));
  assert.ok(!modern(s, mid).includes('block@0,1'), 'the block is not also at its old cell');
});

test('the Minotaur turns to stone under the mirror, and the cow stands where it was set down', () => {
  const s = grid(['Pzc.........', '............', '............', '............', '...........M']);
  const got = [mv('right'), { kind: 'tool', tool: 'mirror' } as const].reduce((x, a) => step(x, a).state, s);
  assert.ok(got.stone > 0);
  assert.ok(modern(got, rest(got)).some(w => w.startsWith('minotaur-stone@')));
  assert.deepEqual(modern(got, rest(got)), classic(got, rest(got)));
  const cow = [mv('right'), { kind: 'tool', tool: 'cow' } as const].reduce((x, a) => step(x, a).state, got);
  assert.ok(cow.cow);
  assert.deepEqual(modern(cow, rest(cow)), classic(cow, rest(cow)));
  assert.ok(modern(cow, rest(cow)).some(w => w.startsWith('cow-standing@')));
});

test('hazards face their way until they step, and a template faces its machine\'s way', () => {
  const s = grid(['P.w.C', '.....', '....M'], 'facing: down\nmachines: fireball-left');
  const ps = placed(s, rest(s));
  assert.equal(ps.find(p => p.model === 'glider')?.dir, 'down');
  assert.equal(ps.find(p => p.model === 'fireball')?.dir, 'left');
  assert.equal(ps.find(p => p.model === 'theseus')?.id, 'theseus');
});
