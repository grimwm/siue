import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../src/puzzle/level.ts';
import { CHAPTERS, levelById } from '../src/campaign/chapters.ts';
import { HIDDEN_WALLS_CHAPTER, WALL_HINTS, wallHint } from '../src/wall-hint.ts';

const grid = (...rows: string[]) => parse([...rows, ''].join('\n'));
const FAKE = grid('#####', '#P.W#', '#..E#', '#####');
const UNSEEN = grid('#####', '#P.I#', '#..E#', '#####');
const BOTH = grid('#####', '#PWI#', '#..E#', '#####');
const PLAIN = grid('#####', '#P..#', '#..E#', '#####');

test('one line for each kind of hidden wall, none for a level without', () => {
  assert.ok((WALL_HINTS.fake as readonly string[]).includes(wallHint(FAKE, null)!));
  assert.ok((WALL_HINTS.invisible as readonly string[]).includes(wallHint(UNSEEN, null)!));
  assert.ok((WALL_HINTS.both as readonly string[]).includes(wallHint(BOTH, null)!));
  assert.equal(wallHint(PLAIN, null), null);
  assert.equal(wallHint(PLAIN, 7), null);
});

test('a level always gets the same line, by its grid', () => {
  assert.equal(wallHint(FAKE, null), wallHint(grid('#####', '#P.W#', '#..E#', '#####'), null));
  assert.equal(wallHint(FAKE, 2), wallHint(FAKE, null));
  // The pick: an FNV-1a hash of the size and grid, taken modulo the lines (pinned, so it never shifts unnoticed).
  assert.equal(wallHint(FAKE, null), WALL_HINTS.fake[1]);
  assert.equal(wallHint(UNSEEN, null), WALL_HINTS.invisible[1]);
  assert.equal(wallHint(BOTH, null), WALL_HINTS.both[2]);
});

test('different levels spread over the lines', () => {
  const seen = new Set<string>();
  for (let n = 0; n < 12; n++) {
    const row = '#P' + '.'.repeat(n) + 'W#';
    const lv = grid('#'.repeat(row.length), row, '#' + '.'.repeat(row.length - 3) + 'E#', '#'.repeat(row.length));
    seen.add(wallHint(lv, null)!);
  }
  assert.equal(seen.size, WALL_HINTS.fake.length);
});

test('Chapter 4 says it in its own intros, so it gets no line', () => {
  const ch4 = CHAPTERS[HIDDEN_WALLS_CHAPTER - 1]!;
  for (const id of ch4.levelIds) {
    const lv = levelById(id);
    assert.equal(wallHint(lv, HIDDEN_WALLS_CHAPTER), null);
    assert.match(lv.intro, /painted|unseen|cannot see|no gap|looks open is shut|not open at all/, `${id}'s intro names its hidden walls`);
  }
});

test('every campaign level outside Chapter 4 with a hidden wall gets a line', () => {
  for (const ch of CHAPTERS) {
    if (ch.n === HIDDEN_WALLS_CHAPTER) continue;
    for (const id of ch.levelIds) {
      const lv = levelById(id);
      const hides = lv.terrain.includes('fake-wall') || lv.terrain.includes('invisible-wall');
      assert.equal(wallHint(lv, ch.n) !== null, hides, id);
    }
  }
});

test('the lines are short sentences that never say where', () => {
  for (const line of Object.values(WALL_HINTS).flat()) {
    const words = line.split(/\s+/).length;
    assert.ok(words >= 12 && words <= 20, `${words} words: ${line}`);
    assert.match(line, /^[A-Z]/);
    assert.match(line, /[.!]$/);
    assert.doesNotMatch(line, /\b(north|south|east|west|left|right|corner|row|column)\b/i, line);
  }
});
