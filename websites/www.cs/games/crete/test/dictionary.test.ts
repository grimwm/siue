// The Dictionary's table and what it reads off a try: every piece of the rules has an entry and a Modern icon, the
// backpack lists only what is held, a turn's meetings are its items and active-tile touches, and the met store keeps
// what was met.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import atlasJson from '../fx/sprites/tiles.json' with { type: 'json' };
import { ACTIVE, ENTRIES, ENTRY, FAMILIES, HAZARD_ENTRY, HIDDEN, LISTED, OBJECT_ENTRY, PLAIN, TERRAIN_ENTRY, backpack, cardOf, locked, meetingsOf, metId } from '../src/dictionary.ts';
import iconsJson from '../fx/sprites/modern-icons.json' with { type: 'json' };
import { ICON_MODELS } from '../src/icons-models.ts';
import { ALL_MET, MET_KEY, createMet } from '../src/met.ts';
import { meetNotices } from '../src/notices.ts';
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
    assert.equal(e.name.toLowerCase(), TOOLS[t].name.toLowerCase());
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

test('a turn\'s meetings: items taken (never a story page) and the active tiles Theseus touches, at the moment he reaches them', () => {
  const walk = (rows: string[], dirs: ('right' | 'left' | 'up' | 'down')[], head = '') => {
    let s = initial(level(rows, head));
    const out: string[][] = [];
    for (const dir of dirs) {
      const before = s;
      const r = step(s, { kind: 'move', dir });
      s = r.state;
      out.push(meetingsOf(before, r.events, 100).map(m => `${m.id}@${m.ms}`));
    }
    return out;
  };
  assert.deepEqual(walk(['#######', '#Pz_$E#', '#######'], ['right', 'right', 'right']), [['mirror@100'], ['button@100'], ['thief@100']]);
  assert.deepEqual(walk(['#######', '#P;..E#', '#######'], ['right', 'right']), [[], ['popup@100']], 'the pop-up wall, as it rises behind him');
  assert.deepEqual(walk(['#######', '#PWI.E#', '#######'], ['right', 'right', 'right']), [['fake-wall@0'], ['invisible-wall@0'], []], 'a wall found by a step');
  assert.deepEqual(walk(['#######', '#P=p=E#', '#######'], ['right'], 'pages: a'), [[]], 'a story page is no meeting');
  assert.deepEqual(walk(['#######', '#P==_E#', '#######'], ['right']), [['button@300']], 'at the end of a slide, where he reaches it');
  assert.deepEqual(walk(['#######', '#P|..E#', '#######'], ['right']), [['gate@100']], 'the open gate');
  assert.deepEqual(walk(['#######', '#P.-..#', '#&..E.#', '#######'], ['down', 'right']), [['trap@100'], []], 'held in a snare');
  assert.deepEqual(walk(['#######', '#P!..E#', '#######'], ['right'], 'hearts: 2'), [['bomb@100']]);
  assert.deepEqual(walk(['########', '#P@.@.E#', '########'], ['right']), [['teleport@100']]);
  for (const id of ACTIVE) assert.equal(ENTRY[id]!.kind, 'hazard', `${id} is a tile`);
});

test('the Dictionary locks only items not yet picked up and the hidden walls not yet found; every other hazard is open', () => {
  const met = new Set<string>();
  const has = (k: string) => met.has(k);
  for (const e of ENTRIES) assert.equal(locked(e.id, has), e.kind === 'item' || HIDDEN.has(e.id), e.id);
  met.add('mirror');
  met.add(metId('fake-wall'));
  assert.equal(locked('mirror', has), false);
  assert.equal(locked('fake-wall', has), false, 'found');
  assert.equal(locked('invisible-wall', has), true, 'not yet found');
  assert.equal(metId('mirror'), 'mirror');
  assert.equal(metId('button'), 'touch-button', 'a touch is kept under its own id');
});

test('a first meeting is a card once; once met it is a banner; with cards off nothing is a first', () => {
  const met = createMet(memory({ [MET_KEY]: JSON.stringify(['button', 'minotaur', 'exit']) }));
  assert.deepEqual(meetNotices(['mirror', 'button', 'mirror'], met, true), { cards: ['mirror', 'button'], banners: [] }, 'a bare tile id is no touch');
  met.add('mirror');
  met.add(metId('button'));
  assert.deepEqual(meetNotices(['mirror', 'button', 'cake'], met, true), { cards: ['cake'], banners: ['mirror', 'button'] });
  assert.deepEqual(meetNotices(['cake'], met, true, new Set(['cake'])), { cards: [], banners: [] }, 'shown at a stop: nothing more');
  assert.deepEqual(meetNotices(['cake', 'button'], createMet(null), false), { cards: [], banners: ['cake', 'button'] });
});

test('the keys are one family: one first card for any colour, naming every colour; a later colour is a banner', () => {
  const keys = ['key-red', 'key-blue', 'key-yellow', 'key-green'];
  assert.deepEqual(ENTRY.keys!.members, keys);
  for (const k of keys) {
    assert.equal(cardOf(k), 'keys', `${k}'s first card is the Keys card`);
    assert.equal(metId(k), 'keys', `${k} is kept as the family`);
    assert.match(ENTRY.keys!.effect, new RegExp(k.slice(4)), `the Keys card names ${k.slice(4)}`);
  }
  for (const k of keys) {
    const met = createMet(memory());
    assert.deepEqual(meetNotices([k], met, true), { cards: ['keys'], banners: [] }, `the first ${k} shows the Keys card`);
    met.add(metId(k));
    for (const other of keys) {
      assert.deepEqual(meetNotices([other], met, true), { cards: [], banners: [other] }, `after ${k}, ${other} is its own banner`);
    }
  }
  assert.deepEqual(meetNotices(['key-red', 'key-blue'], createMet(memory()), true), { cards: ['keys'], banners: [] }, 'two new colours in a turn: one card');
  const stopped = createMet(memory());
  stopped.add(metId('key-red'));
  assert.deepEqual(meetNotices(['key-red', 'key-blue'], stopped, true, new Set(['key-red'])), { cards: [], banners: ['key-blue'] },
    'red shown at a stop: blue, taken later that turn, is its banner');
});

test('the Dictionary lists each family once, in its first member\'s place, and never its members; the backpack counts each colour', () => {
  const ids = LISTED.map(e => e.id);
  assert.equal(ids.filter(id => id === 'keys').length, 1);
  for (const f of FAMILIES) {
    for (const m of f.members!) assert.ok(!ids.includes(m), `${m} is listed only as ${f.id}`);
    assert.ok(f.name && f.lore && f.effect && f.short, `${f.id} has its words`);
    for (const m of f.members!) assert.ok(ENTRY[m], `${m} is an entry`);
  }
  assert.equal(LISTED.length, ENTRIES.length - 3, 'four keys become one row');
  assert.equal(ids.indexOf('keys'), ENTRIES.findIndex(e => e.id === 'key-red'), 'Keys stands where the red key stood');
  assert.equal(locked('keys', () => false), true, 'Keys is locked until a key is taken');
  assert.equal(locked('keys', k => k === 'keys'), false);
});

test('every entry has a Modern icon in the rendered sheet, and a model to render it from', () => {
  const sheet = iconsJson as { cell: number; width: number; height: number; icons: Record<string, { x: number; y: number }> };
  for (const e of ENTRIES) {
    assert.ok(ICON_MODELS[e.id], `${e.id} has a model`);
    const at = sheet.icons[e.id];
    assert.ok(at, `${e.id} has an icon`);
    assert.ok(at.x + sheet.cell <= sheet.width && at.y + sheet.cell <= sheet.height, `${e.id}'s icon lies in the sheet`);
  }
  assert.deepEqual(Object.keys(ICON_MODELS).sort(), ENTRIES.map(e => e.id).sort(), 'no icon for an entry that is gone');
});

test('the met store keeps what was met across loads; "*" is every entry; blocked or corrupt storage reads as none', () => {
  const st = memory();
  const met = createMet(st);
  assert.equal(met.add('mirror'), true);
  assert.equal(met.add('mirror'), false);
  assert.equal(createMet(st).has('mirror'), true);
  assert.equal(createMet(st).has('cake'), false);
  assert.equal(createMet(memory({ [MET_KEY]: JSON.stringify([ALL_MET]) })).has('cake'), true);
  for (const old of ['key-red', 'key-blue', 'key-yellow', 'key-green']) {
    assert.equal(createMet(memory({ [MET_KEY]: JSON.stringify([old]) })).has('keys'), true, `a store that met ${old} has met the Keys`);
  }
  assert.equal(createMet(memory({ [MET_KEY]: JSON.stringify(['mirror']) })).has('keys'), false);
  const throwing: StorageLike = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() {} };
  for (const bad of [null, throwing, memory({ [MET_KEY]: '{}' }), memory({ [MET_KEY]: '["Bad Id"]' }), memory({ [MET_KEY]: 'nope' })]) {
    const m = createMet(bad);
    assert.equal(m.has('mirror'), false);
    assert.equal(m.add('mirror'), true);
    assert.equal(m.has('mirror'), true);
  }
});
