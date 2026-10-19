// The campaign's chapters and their lore: ten chapters, the released ones complete, every story page
// placed in exactly one level, every quotation cited by author, work, section, translator and year.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, LEVEL_IDS, chapterOf, pageHome, nextChapter } from '../src/campaign/chapters.ts';
import type { Quote } from '../src/campaign/lore.ts';
import { TRIALS, trialLevel } from '../src/puzzle/trials.ts';

const CITE = /^[A-Z][^,]+, .+, .+, tr\. .+ \(\d{4}\)$/;
const released = CHAPTERS.filter(c => c.released);
/** The levels that exist so far, by level index (Task 3 adds levels 9 and 10). */
const existing = LEVEL_IDS.flatMap((id, i) => (TRIALS.some(t => t.id === id) ? [i] : []));
const levelOf = (i: number) => trialLevel(TRIALS.findIndex(t => t.id === LEVEL_IDS[i]));

test('ten chapters, numbered 1 to 10; Chapter 1 is The Outer Halls and released', () => {
  assert.equal(CHAPTERS.length, 10);
  CHAPTERS.forEach((c, i) => assert.equal(c.n, i + 1));
  const [one] = CHAPTERS;
  assert.equal(one!.name, 'The Outer Halls');
  assert.equal(one!.released, true);
  assert.deepEqual(one!.levelIds.slice(0, 8), Array.from({ length: 8 }, (_, i) => `trial-${i + 1}`));
});

test('Chapter 1 holds ten levels, trial-1 to trial-10', { todo: 'Task 3 adds levels 9 and 10' }, () => {
  assert.deepEqual(CHAPTERS[0]!.levelIds, Array.from({ length: 10 }, (_, i) => `trial-${i + 1}`));
});

test('released chapters come first and have lore; the rest are empty', () => {
  const firstUnreleased = CHAPTERS.findIndex(c => !c.released);
  assert.ok(firstUnreleased > 0);
  CHAPTERS.slice(firstUnreleased).forEach(c => {
    assert.equal(c.released, false, `chapter ${c.n} released after an unreleased one`);
    assert.equal(c.name, '');
    assert.deepEqual(c.levelIds, []);
    assert.equal(c.lore, null);
  });
  released.forEach(c => {
    assert.ok(c.lore, `chapter ${c.n} has no lore`);
    assert.ok(c.name.length > 0);
    assert.ok(c.lore.opening.text.length > 0 && c.lore.closing.text.length > 0);
  });
});

test('LEVEL_IDS is every released level in play order', () => {
  assert.deepEqual(LEVEL_IDS, released.flatMap(c => c.levelIds));
});

test('chapterOf maps a level index to its chapter and place in it', () => {
  assert.deepEqual(chapterOf(0), { chapter: CHAPTERS[0], within: 0 });
  assert.deepEqual(chapterOf(7), { chapter: CHAPTERS[0], within: 7 });
  assert.throws(() => chapterOf(LEVEL_IDS.length));
  assert.throws(() => chapterOf(-1));
});

test('nextChapter is the following chapter, or null after the last', () => {
  assert.equal(nextChapter(1), CHAPTERS[1]);
  assert.equal(nextChapter(1)!.released, false);
  assert.equal(nextChapter(10), null);
});

test('Chapter 1 has two pages with ch1- ids; page ids are unique across chapters', () => {
  const ids = released.flatMap(c => c.lore!.pages.map(p => p.id));
  assert.equal(CHAPTERS[0]!.lore!.pages.length, 2);
  ids.forEach(id => assert.match(id, /^[a-z0-9-]+$/));
  CHAPTERS[0]!.lore!.pages.forEach(p => {
    assert.match(p.id, /^ch1-/);
    assert.ok(p.title.length > 0 && p.text.length > 0, `page ${p.id} is empty`);
  });
  assert.equal(new Set(ids).size, ids.length);
});

test('every page a level names is in its chapter\'s lore (levels that exist so far)', () => {
  for (const i of existing) {
    const { chapter } = chapterOf(i);
    const known = new Set(chapter.lore!.pages.map(p => p.id));
    levelOf(i).pageIds.forEach(id => assert.ok(known.has(id), `level ${i + 1} names unknown page ${id}`));
  }
});

test('pageHome finds no level for a page nobody names', () => {
  assert.deepEqual(pageHome('no-such-page'), []);
});

test('every lore page is named by exactly one level', { todo: 'Task 3 places the pages in levels 9 and 10' }, () => {
  released.forEach(c => c.lore!.pages.forEach(p => assert.equal(pageHome(p.id).length, 1, `page ${p.id}`)));
});

test('every quotation has text and a full citation', () => {
  const quotes: Quote[] = released.flatMap(c => {
    const l = c.lore!;
    return [l.opening.quote, l.closing.quote, ...l.pages.map(p => p.quote)].filter((q): q is Quote => !!q);
  });
  quotes.forEach(q => {
    assert.ok(q.text.trim().length > 0);
    assert.match(q.cite, CITE);
  });
});

test('the closing card leaves the next chapter to the UI', () => {
  assert.doesNotMatch(CHAPTERS[0]!.lore!.closing.text, /chapter 2|not yet released/i);
});

test('trial 8 no longer ends the tribute', () => {
  assert.notEqual(trialLevel(7).title, 'The Heart of the Labyrinth');
  assert.doesNotMatch(trialLevel(7).intro, /tribute/i);
});
