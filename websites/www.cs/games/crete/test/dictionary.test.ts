// The Dictionary's table and what it reads off a try: every piece of the rules has an entry, the backpack lists only
// what is held, the board's sights skip hidden walls until found, and the met store keeps what was met.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import atlasJson from '../fx/sprites/tiles.json' with { type: 'json' };
import { ENTRIES, ENTRY, HAZARD_ENTRY, OBJECT_ENTRY, PLAIN, TERRAIN_ENTRY, backpack, inSight } from '../src/dictionary.ts';
import { ALL_MET, MET_KEY, createMet } from '../src/met.ts';
import { meetings, pickupNotices } from '../src/notices.ts';
import { parse } from '../src/puzzle/level.ts';
import { initial } from '../src/puzzle/state.ts';
import { step } from '../src/puzzle/step.ts';
import { HAZARDS, OBJECTS, TERRAIN, TOOLS } from '../src/puzzle/tiles.ts';
import type { HazardKind, ObjectKind, Terrain, Tool } from '../src/puzzle/tiles.ts';
import { trialLevel } from '../src/puzzle/trials.ts';
import type { StorageLike } from '../../_kit/ports.ts';

const memory = (init: Record<string, string> = {}): StorageLike & { data: Record<string, string> } => {
  const data = { ...init };
  return { data, getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, removeItem: k => { delete data[k]; } };
};
const level = (rows: string[], head = '') => parse(`title: t\n${head}\n${rows.join('\n')}\n`);

test('every terrain, object and hazard of the rules has an entry, unless it is plain floor or wall', () => {
  for (const t of Object.keys(TERRAIN) as Terrain[]) {
    const id = TERRAIN_ENTRY[t];
    if (PLAIN.includes(t)) assert.equal(id, null, `${t} is plain`);
    else assert.ok(id && ENTRY[id], `terrain ${t} has an entry`);
  }
  for (const o of Object.keys(OBJECTS) as ObjectKind[]) assert.ok(ENTRY[OBJECT_ENTRY[o]], `object ${o} has an entry`);
  for (const h of Object.keys(HAZARDS) as HazardKind[]) assert.ok(ENTRY[HAZARD_ENTRY[h]], `hazard ${h} has an entry`);
  assert.ok(ENTRY.minotaur, 'the Minotaur has an entry');
});

test('every object but the block is an item; every entry is reached by some piece, has its words and a sprite in the atlas', () => {
  const ids = ENTRIES.map(e => e.id);
  assert.equal(new Set(ids).size, ids.length, 'ids are unique');
  for (const o of Object.keys(OBJECTS) as ObjectKind[]) assert.equal(ENTRY[OBJECT_ENTRY[o]]!.kind, o === 'block' ? 'hazard' : 'item', o);
  const reached = new Set<string>(['minotaur', ...Object.values(OBJECT_ENTRY), ...Object.values(HAZARD_ENTRY),
    ...Object.values(TERRAIN_ENTRY).filter((x): x is string => x !== null)]);
  const sprites = (atlasJson as { sprites: Record<string, unknown> }).sprites;
  for (const e of ENTRIES) {
    assert.ok(reached.has(e.id), `${e.id} is reached by a piece`);
    assert.ok(e.name && e.lore && e.effect && e.short, `${e.id} has its words`);
    assert.ok(sprites[e.sprite], `${e.id}'s sprite ${e.sprite} is in the atlas`);
  }
});

test('each tool has its key, and its effect says to press it', () => {
  for (const t of Object.keys(TOOLS) as Tool[]) {
    const e = ENTRY[t]!;
    assert.equal(e.name, TOOLS[t].name);
    assert.equal(e.key, TOOLS[t].key);
    assert.match(e.effect, new RegExp(`Press ${TOOLS[t].key} `));
  }
  assert.equal(ENTRY.mirror!.effect.startsWith('Hold it up and the Minotaur turns to stone'), true);
  assert.equal(ENTRIES.filter(e => e.key).length, 3, 'only the tools have keys');
});

test('the backpack lists only what is held, with counts, and is empty with no try', () => {
  assert.deepEqual(backpack(null), []);
  const lv = level(['#########', '#Pzzrf*E#', '#########']);
  let s = initial(lv);
  assert.deepEqual(backpack(s), [], 'nothing held at the start');
  s = step(s, { kind: 'move', dir: 'right' }).state;
  assert.deepEqual(backpack(s).map(h => [h.entry.id, h.count]), [['mirror', 1]]);
  for (let i = 0; i < 4; i++) s = step(s, { kind: 'move', dir: 'right' }).state;
  assert.deepEqual(backpack(s).map(h => [h.entry.id, h.count]), [['relic', 1], ['key-red', 1], ['flippers', 1], ['mirror', 2]]);
  s = step(s, { kind: 'tool', tool: 'mirror' }).state;
  assert.deepEqual(backpack(s).map(h => [h.entry.id, h.count]), [['relic', 1], ['key-red', 1], ['flippers', 1], ['mirror', 1]], 'a used tool leaves');
});

test('in sight: the Minotaur and the special tiles at the start; a hidden wall only once found; a sunk block leaves filled water', () => {
  assert.deepEqual(inSight(initial(trialLevel(0))), ['minotaur', 'exit']);
  const lv = level(['#######', '#PO~WI#', '#.....#', '#....E#', '#######']);
  let s = initial(lv);
  assert.deepEqual(inSight(s), ['exit', 'water', 'block'], 'the fake and the invisible wall hide');
  s = step(s, { kind: 'move', dir: 'right' }).state;
  assert.deepEqual(inSight(s), ['exit', 'dirt'], 'the block sank and filled the water');
  s = step(s, { kind: 'move', dir: 'right' }).state;
  s = step(s, { kind: 'move', dir: 'right' }).state;
  assert.ok(inSight(s).includes('fake-wall'), 'the fake wall, found');
  assert.ok(!inSight(s).includes('invisible-wall'));
});

test('a first pickup is a card once; once met it is a banner; a page never has a banner; with cards off nothing is a first', () => {
  const met = createMet(memory());
  assert.deepEqual(pickupNotices(['mirror', 'key-red', 'mirror'], met, true), { cards: ['mirror', 'key-red'], banners: [] });
  met.add('mirror');
  assert.deepEqual(pickupNotices(['mirror', 'key-red'], met, true), { cards: ['key-red'], banners: ['mirror'] });
  met.add('key-red');
  assert.deepEqual(pickupNotices(['mirror', 'key-red', 'page'], met, true), { cards: ['page'], banners: ['mirror', 'key-red'] });
  met.add('page');
  assert.deepEqual(pickupNotices(['page', 'cake'], met, true, new Set(['cake'])), { cards: [], banners: [] }, 'shown at a stop: nothing more');
  assert.deepEqual(pickupNotices(['cake', 'page'], createMet(null), false), { cards: [], banners: ['cake'] });
  assert.deepEqual(meetings(initial(trialLevel(0)), createMet(null), false), []);
  assert.deepEqual(meetings(initial(trialLevel(0)), met, true), ['minotaur', 'exit']);
});

test('the met store keeps what was met across loads; "*" is every entry; blocked or corrupt storage reads as none', () => {
  const st = memory();
  const met = createMet(st);
  assert.equal(met.add('mirror'), true);
  assert.equal(met.add('mirror'), false);
  assert.equal(createMet(st).has('mirror'), true);
  assert.equal(createMet(st).has('cake'), false);
  assert.equal(createMet(memory({ [MET_KEY]: JSON.stringify([ALL_MET]) })).has('cake'), true);
  const throwing: StorageLike = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() {} };
  for (const bad of [null, throwing, memory({ [MET_KEY]: '{}' }), memory({ [MET_KEY]: '["Bad Id"]' }), memory({ [MET_KEY]: 'nope' })]) {
    const m = createMet(bad);
    assert.equal(m.has('mirror'), false);
    assert.equal(m.add('mirror'), true);
    assert.equal(m.has('mirror'), true);
  }
});
