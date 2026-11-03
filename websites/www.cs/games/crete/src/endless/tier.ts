/* The Island of Crete: which pieces a new Endless run uses. A chapter's pieces are the player's once they have
 * cleared every one of its teaching levels, where the piece is taught; Chapter 1's are always theirs. A run takes
 * the chapters in order up to the first whose teaching levels are not all cleared, and every piece once the whole
 * campaign is cleared. A run keeps the tier it started with, so a shared seed plays the same levels for anyone.
 * DOM-free. */
import type { Chapter } from '../campaign/chapters.ts';

export function tierOf(chapters: readonly Chapter[], cleared: (id: string) => boolean): number {
  const released = chapters.filter(c => c.released);
  if (released.every(c => c.levelIds.every(cleared))) return released.length;
  let tier = 1;
  for (const c of released.slice(1)) {
    if (!c.levelIds.slice(0, c.teaching).every(cleared)) break;
    tier = c.n;
  }
  return tier;
}
