// The level text: every legend character parses, a bad level names its line and column,
// and the canonical text survives a round trip.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse, serialize, LevelError } from '../src/puzzle/level.ts';
import { TERRAIN, OBJECTS, SPRITE_NAMES } from '../src/puzzle/tiles.ts';

const SAMPLE = [
  'title: The first gate',
  'intro: Count the walls before it counts you.',
  'hearts: 4',
  '',
  '#########',
  '#P.*..rR#',
  '#~F=^v<>#',
  '#%S_Tt|E#',
  '#BYGbygf#',
  '#hkuzxcp#',
  '#O.....M#',
  '#########',
  '',
].join('\n');

test('every legend character parses to its piece', () => {
  const lv = parse(SAMPLE);
  assert.equal(lv.title, 'The first gate');
  assert.equal(lv.hearts, 4);
  assert.equal(lv.relics, 1);
  assert.equal(lv.rows, 8);
  assert.equal(lv.cols, 9);
  assert.deepEqual(lv.player, { r: 1, c: 1 });
  assert.deepEqual(lv.minotaur, { r: 6, c: 7 });
  const at = (r: number, c: number) => ({ t: lv.terrain[r * lv.cols + c], o: lv.objects[r * lv.cols + c] });
  assert.deepEqual(at(1, 3), { t: 'floor', o: 'relic' });
  assert.deepEqual(at(1, 7), { t: 'door-red', o: null });
  assert.deepEqual(at(2, 4), { t: 'force-up', o: null });
  assert.deepEqual(at(3, 6), { t: 'gate', o: null });
  assert.deepEqual(at(5, 6), { t: 'floor', o: 'cow' });
  assert.deepEqual(at(6, 1), { t: 'floor', o: 'block' });
  assert.deepEqual(at(1, 1), { t: 'floor', o: null }, 'a figure stands on floor');
});

test('the canonical text round-trips exactly', () => {
  assert.equal(serialize(parse(SAMPLE)), SAMPLE);
});

test('hearts and relics default to 3 and the relics on the grid, and are not written then', () => {
  const lv = parse('title: t\nintro: i\n\nP*E\n');
  assert.equal(lv.hearts, 3);
  assert.equal(lv.relics, 1);
  assert.equal(serialize(lv), 'title: t\nintro: i\n\nP*E\n');
});

test('a bad level names its line and column', () => {
  const cases: [string, number, number, RegExp][] = [
    ['title: t\nintro: i\n\nP.Q\n', 4, 3, /unknown tile 'Q'/],
    ['title: t\nintro: i\n\nP..\n..\n', 5, 1, /row is 2 wide, expected 3/],
    ['title: t\nintro: i\n\n...\n', 4, 1, /no player/],
    ['title: t\nintro: i\n\nPP.\n', 4, 2, /second player/],
    ['title: t\nintro: i\n\nPMM\n', 4, 3, /second Minotaur/],
    ['title: t\nsize: 4\n\nP\n', 2, 1, /unknown header 'size'/],
    ['title: t\nhearts: 0\n\nP\n', 2, 9, /hearts must be 1 to 99/],
    ['title: t\nrelics: 2\n\nP*\n', 2, 9, /relics: 2 but the grid has 1/],
    ['title: t\nintro: i\n\nP.\n\nE.\n', 6, 1, /text after the grid/],
  ];
  for (const [text, line, col, msg] of cases) {
    assert.throws(() => parse(text), (e: unknown) => {
      assert.ok(e instanceof LevelError, String(e));
      assert.equal(e.line, line, text);
      assert.equal(e.col, col, text);
      assert.match(e.message, msg);
      assert.match(e.message, new RegExp(`^line ${line}, column ${col}: `));
      return true;
    });
  }
});

test('every piece has a distinct legend character and a sprite on the list', () => {
  const chars = [...Object.values(TERRAIN).map(t => t.char), ...Object.values(OBJECTS).map(o => o.char), 'P', 'M'];
  assert.equal(new Set(chars).size, chars.length);
  for (const t of Object.values(TERRAIN)) for (const s of t.sprites) assert.ok(SPRITE_NAMES.includes(s), s);
  for (const o of Object.values(OBJECTS)) assert.ok(SPRITE_NAMES.includes(o.sprite), o.sprite);
  for (const fig of ['theseus', 'minotaur', 'minotaur-stone', 'cow-standing']) assert.ok(SPRITE_NAMES.includes(fig), fig);
});

test('blank lines after the grid are fine', () => {
  assert.doesNotThrow(() => parse('title: t\nintro: i\n\nP.\n\n\n'));
});
