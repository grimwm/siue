/* The Island of Crete: the campaign's ten chapters. Releasing a chapter is a
 * change here: its name, levels and lore. LEVEL_IDS is every released level in
 * play order; a level index is a place in it. DOM-free. */
import type { ChapterLore } from './lore.ts';
import { CHAPTER_1 } from './chapter-1.ts';
import type { Level } from '../puzzle/level.ts';
import { TRIALS, trialLevel } from '../puzzle/trials.ts';

export interface Chapter {
  n: number; name: string; released: boolean; levelIds: readonly string[];
  /** The first `teaching` levels each teach one idea; the rest are the chapter's challenge levels, which must
   *  clear the challenge bar (src/puzzle/difficulty.ts). */
  teaching: number;
  lore: ChapterLore | null;
}

const unreleased = (n: number): Chapter => ({ n, name: '', released: false, levelIds: [], teaching: 0, lore: null });

export const CHAPTERS: readonly Chapter[] = [
  {
    n: 1, name: 'The Outer Halls', released: true,
    levelIds: ['trial-1', 'trial-2', 'trial-3', 'trial-4', 'trial-5', 'trial-6', 'trial-7', 'trial-8', 'trial-9', 'trial-10'],
    teaching: 8,
    lore: CHAPTER_1,
  },
  ...Array.from({ length: 9 }, (_, i) => unreleased(i + 2)),
];

export const LEVEL_IDS: readonly string[] = CHAPTERS.filter(c => c.released).flatMap(c => c.levelIds);

/** A released level's level, by id. */
export const levelById = (id: string): Level => trialLevel(TRIALS.findIndex(t => t.id === id));

/** What the controller plays: a count, and each level's id and level by index. */
export interface Levels { readonly count: number; id(i: number): string; level(i: number): Level }

/** LEVEL_IDS, each built from its trial. */
export const CAMPAIGN_LEVELS: Levels = {
  count: LEVEL_IDS.length,
  id: i => LEVEL_IDS[i]!,
  level: i => levelById(LEVEL_IDS[i]!),
};

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
