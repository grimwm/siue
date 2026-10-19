/* The Island of Crete: the campaign's ten chapters. Releasing a chapter is a
 * change here: its name, levels and lore. LEVEL_IDS is every released level in
 * play order; a level index is a place in it. DOM-free. */
import type { ChapterLore } from './lore.ts';
import { CHAPTER_1 } from './chapter-1.ts';
import { TRIALS, trialLevel } from '../puzzle/trials.ts';

export interface Chapter { n: number; name: string; released: boolean; levelIds: readonly string[]; lore: ChapterLore | null }

const unreleased = (n: number): Chapter => ({ n, name: '', released: false, levelIds: [], lore: null });

export const CHAPTERS: readonly Chapter[] = [
  {
    n: 1, name: 'The Outer Halls', released: true,
    levelIds: ['trial-1', 'trial-2', 'trial-3', 'trial-4', 'trial-5', 'trial-6', 'trial-7', 'trial-8'],
    lore: CHAPTER_1,
  },
  ...Array.from({ length: 9 }, (_, i) => unreleased(i + 2)),
];

export const LEVEL_IDS: readonly string[] = CHAPTERS.filter(c => c.released).flatMap(c => c.levelIds);

/** The chapter that holds level `levelIndex`, and the level's 0-based place in it. */
export function chapterOf(levelIndex: number): { chapter: Chapter; within: number } {
  let start = 0;
  for (const chapter of CHAPTERS) {
    if (!chapter.released) continue;
    if (levelIndex >= start && levelIndex < start + chapter.levelIds.length) return { chapter, within: levelIndex - start };
    start += chapter.levelIds.length;
  }
  throw new RangeError(`no level ${levelIndex}`);
}

/** The level indexes whose `pages:` header names `pageId`. */
export function pageHome(pageId: string): number[] {
  return LEVEL_IDS.flatMap((id, i) => {
    const t = TRIALS.findIndex(x => x.id === id);
    return t >= 0 && trialLevel(t).pageIds.includes(pageId) ? [i] : [];
  });
}

/** The chapter after `n`, released or not; null after the last. */
export function nextChapter(n: number): Chapter | null {
  return CHAPTERS.find(c => c.n === n + 1) ?? null;
}
