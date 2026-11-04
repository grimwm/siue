/* The Island of Crete: the start card's quiet line for a level that hides walls. A level with a fake wall, an
 * invisible wall or both says so under its intro, in the Labyrinth's words, never where. Each kind has a few lines,
 * and a level always gets the same one: picked by a hash of its grid, so a campaign level, an Endless seed, a shared
 * level and the editor's Try It each show their own line every time. Chapter 4, "The False Walls", has none: every
 * one of its intros already names its painted and unseen walls. DOM-free. */
import type { Level } from './puzzle/level.ts';

export const WALL_HINTS = {
  fake: [
    'Daedalus painted some of these stones on plaster. Trust your shoulder before you trust your eyes.',
    "Not every wall in these halls is stone; some are plaster, painted by a craftsman's patient hand.",
    'The builder hid a jest in these halls: a wall that is only paint, waiting for a push.',
  ],
  invisible: [
    'Daedalus set clear glass across some of these passages. What looks like open floor may stop you.',
    'Some floor here is not floor at all, but glass so clear that only a bump will show it.',
    'The craftsman hid walls of glass in these halls; the open way is not always open.',
  ],
  both: [
    'Here Daedalus mixed his tricks: painted plaster that gives at a push, and glass you cannot see.',
    'In these halls the walls lie both ways: some stone is only paint, some open floor is glass.',
    'The builder played both his jokes here. Not every wall is stone, and not every gap is open.',
  ],
} as const;

/** The chapter whose intros teach the hidden walls themselves. */
export const HIDDEN_WALLS_CHAPTER = 4;

/** A 32-bit FNV-1a hash of the level's size and grid. */
function gridHash(lv: Pick<Level, 'rows' | 'cols' | 'terrain'>): number {
  let h = 0x811c9dc5;
  const text = `${lv.rows}x${lv.cols}:${lv.terrain.join(',')}`;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/** The line for `lv`'s start card, or null when it hides no walls or is in `chapter` 4. */
export function wallHint(lv: Pick<Level, 'rows' | 'cols' | 'terrain'>, chapter: number | null): string | null {
  if (chapter === HIDDEN_WALLS_CHAPTER) return null;
  const fake = lv.terrain.includes('fake-wall'), unseen = lv.terrain.includes('invisible-wall');
  if (!fake && !unseen) return null;
  const lines = WALL_HINTS[fake && unseen ? 'both' : fake ? 'fake' : 'invisible'];
  return lines[gridHash(lv) % lines.length]!;
}
