// The shared bank's server accepts exactly the game's tile characters (bank/Bank.php's TILES): every terrain, object
// and hazard character, Theseus and the Minotaur, and never a story page, which no Endless level holds.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TERRAIN, OBJECTS, HAZARDS } from '../src/puzzle/tiles.ts';

test('the server\'s tile characters are the game\'s', () => {
  const php = readFileSync(new URL('../bank/Bank.php', import.meta.url), 'utf8');
  const m = /public const TILES = '([^']*)';/.exec(php);
  assert.ok(m, 'Bank::TILES is one single-quoted line');
  const game = new Set([
    ...Object.values(TERRAIN).map(t => t.char),
    ...Object.entries(OBJECTS).filter(([k]) => k !== 'page').map(([, o]) => o.char),
    ...Object.values(HAZARDS).map(h => h.char),
    'P', 'M',
  ]);
  assert.deepEqual([...new Set(m[1]!)].sort(), [...game].sort());
  assert.equal(m[1]!.length, game.size, 'no character twice');
  assert.ok(!m[1]!.includes(OBJECTS.page.char));
});
