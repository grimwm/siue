/* The Island of Crete: the shape of a chapter's words (src/campaign/chapter-1.ts).
 * Every quotation is word for word from a public-domain translation, or from a public-domain work written in
 * English; its cite reads "Author, Work, section, tr. Translator (year)", or "Author, Work, section (year)" for a
 * work in English. DOM-free. */

export interface Quote { text: string; cite: string }

/** One of the campaign's endings, shown on the last chapter's closing card by the story pages found across the
 *  campaign: every one, some, or none. */
export interface Ending { pages: 'all' | 'some' | 'none'; title: string; text: string }

/** A chapter card: the opening or closing paragraph, with at most one quotation. The last chapter's closing card
 *  also holds the endings. */
export interface Card { text: string; quote?: Quote; endings?: readonly Ending[] }

/** The ending for `found` of `total` story pages. */
export function endingFor(endings: readonly Ending[], found: number, total: number): Ending | null {
  const want = found >= total && total > 0 ? 'all' : found > 0 ? 'some' : 'none';
  return endings.find(e => e.pages === want) ?? null;
}

/** A story page; a level's `pages:` header names its id. */
export interface Page { id: string; title: string; text: string; quote?: Quote }

export interface ChapterLore { opening: Card; closing: Card; pages: readonly Page[] }
