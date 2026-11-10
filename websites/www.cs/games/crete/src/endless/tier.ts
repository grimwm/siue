/* The Island of Crete: which pieces a new Endless run uses. Every run takes every piece of every released chapter,
 * whatever the player has cleared in the campaign. A run keeps the tier it started with, so a shared seed (whose link
 * carries its tier) plays the same levels for anyone. DOM-free. */
import type { Chapter } from '../campaign/chapters.ts';

export function tierOf(chapters: readonly Chapter[]): number {
  return chapters.filter(c => c.released).length;
}
