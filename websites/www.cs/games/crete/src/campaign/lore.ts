/* The Island of Crete: the shape of a chapter's words (src/campaign/chapter-1.ts).
 * Every quotation is word for word from a public-domain translation; its cite
 * reads "Author, Work, section, tr. Translator (year)". DOM-free. */

export interface Quote { text: string; cite: string }

/** A chapter card: the opening or closing paragraph, with at most one quotation. */
export interface Card { text: string; quote?: Quote }

/** A story page; a level's `pages:` header names its id. */
export interface Page { id: string; title: string; text: string; quote?: Quote }

export interface ChapterLore { opening: Card; closing: Card; pages: readonly Page[] }
