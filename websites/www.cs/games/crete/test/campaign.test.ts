// The campaign's chapters and their lore: ten chapters, the released ones complete, every story page
// placed in exactly one level, every quotation cited by author, work, section, translator and year.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, LEVEL_IDS, chapterOf, pageHome, nextChapter, levelById } from '../src/campaign/chapters.ts';
import type { Quote } from '../src/campaign/lore.ts';
import { trialLevel } from '../src/puzzle/trials.ts';

const CITE = /^[A-Z][^,]+, .+, .+, tr\. .+ \(\d{4}\)$/;
const released = CHAPTERS.filter(c => c.released);
const levelOf = (i: number) => levelById(LEVEL_IDS[i]!);

test('ten chapters, numbered 1 to 10; Chapter 1 is The Outer Halls and released', () => {
  assert.equal(CHAPTERS.length, 10);
  CHAPTERS.forEach((c, i) => assert.equal(c.n, i + 1));
  const [one] = CHAPTERS;
  assert.equal(one!.name, 'The Outer Halls');
  assert.equal(one!.released, true);
  assert.deepEqual(one!.levelIds.slice(0, 8), Array.from({ length: 8 }, (_, i) => `trial-${i + 1}`));
});

test('Chapter 1 holds ten levels, trial-1 to trial-10', () => {
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
  assert.equal(nextChapter(1)!.released, true);
  assert.equal(nextChapter(2)!.released, false);
  assert.equal(nextChapter(10), null);
});

test('each released chapter has two pages with chN- ids; page ids are unique across chapters', () => {
  const ids = released.flatMap(c => c.lore!.pages.map(p => p.id));
  ids.forEach(id => assert.match(id, /^[a-z0-9-]+$/));
  released.forEach(c => {
    assert.equal(c.lore!.pages.length, 2, `chapter ${c.n}`);
    c.lore!.pages.forEach(p => {
      assert.match(p.id, new RegExp(`^ch${c.n}-`));
      assert.ok(p.title.length > 0 && p.text.length > 0, `page ${p.id} is empty`);
    });
  });
  assert.equal(new Set(ids).size, ids.length);
});

test('every page a level names is in its chapter\'s lore', () => {
  for (let i = 0; i < LEVEL_IDS.length; i++) {
    const { chapter } = chapterOf(i);
    const known = new Set(chapter.lore!.pages.map(p => p.id));
    levelOf(i).pageIds.forEach(id => assert.ok(known.has(id), `level ${i + 1} names unknown page ${id}`));
  }
});

test('pageHome finds no level for a page nobody names', () => {
  assert.deepEqual(pageHome('no-such-page'), []);
});

test('every lore page is named by exactly one level', () => {
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

test('the closing cards leave the next chapter to the UI', () => {
  released.forEach(c => assert.doesNotMatch(c.lore!.closing.text, /chapter \d|not yet released/i, `chapter ${c.n}`));
});

test("Chapter 2's quotations are all Plutarch's Life of Theseus in Perrin's 1914 translation, chapters 15 to 17", () => {
  const l = CHAPTERS[1]!.lore!;
  const quotes = [l.opening.quote, l.closing.quote, ...l.pages.map(p => p.quote)];
  quotes.forEach(q => {
    assert.ok(q, 'every card and page has its quotation');
    assert.match(q.cite, /^Plutarch, Theseus, 1[5-7]\.\d, tr\. Bernadotte Perrin \(1914\)$/);
  });
});

test('trial 8 no longer ends the tribute', () => {
  assert.notEqual(trialLevel(7).title, 'The Heart of the Labyrinth');
  assert.doesNotMatch(trialLevel(7).intro, /tribute/i);
});
