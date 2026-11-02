/* The Island of Crete: which Dictionary entries this browser has met, on the kit's prefs beside the levels cleared
 * and the story pages found: items by id, first touches of active tiles as `touch-<id>` (src/dictionary.ts metId).
 * Met opens an entry in the Dictionary. Which entries have shown their first card is kept apart, as `crete-met-cards`:
 * a first pickup or touch shows its card, after that a banner, and the menu's Reset Tips empties that list (the cards
 * show again) without locking any entry; the touch tour (src/tour.ts) and the rule tips (src/rule-tips.ts) are kept there too. Until it is first stored, the
 * cards shown are the entries met. The stored
 * word "*" stands for every entry (the browser specs set it to keep their levels free of first cards). A key was once kept by its colour
 * (`key-red`); any of those reads as the Keys family (`keys`), met with whichever colour came first.
 * Storage that is blocked or holds anything unexpected reads as none met. DOM-free. */
import { pref, json } from "../../_kit/prefs.ts";
import type { StorageLike } from "../../_kit/ports.ts";

export const MET_KEY = "crete-met";
/** The entries whose first card has shown; missing until the first Reset Tips or card after it. */
export const CARDS_KEY = "crete-met-cards";
/** The stored word for every entry. */
export const ALL_MET = "*";

/** Ids kept before their entry joined a family, and the family they read as. */
const FORMER: Readonly<Record<string, string>> = { 'key-red': 'keys', 'key-blue': 'keys', 'key-yellow': 'keys', 'key-green': 'keys' };

export interface Met {
  /** Whether `id` is met: its Dictionary entry is open. */
  has(id: string): boolean;
  /** Notes `id` as met and its card as shown; true when it was new to either. */
  add(id: string): boolean;
  /** Whether `id`'s first card has shown. */
  carded(id: string): boolean;
  /** Notes a first-time help that is no Dictionary entry (the touch tour, a rule tip) as shown, opening nothing. */
  noteCard(id: string): void;
  /** Every first card shows again; every met entry stays open. */
  resetCards(): void;
}

const isIds = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(x => typeof x === "string" && /^([a-z0-9-]+|\*)$/.test(x));

const isCards = (v: unknown): v is string[] | null => v === null || isIds(v);

/** Whether `id` is in `ids`, the word for every entry and a key kept by its colour included. */
const holds = (ids: readonly string[], id: string): boolean => ids.includes(ALL_MET) || ids.some(x => x === id || FORMER[x] === id);

export function createMet(storage: StorageLike | null): Met {
  const met = pref<string[]>(MET_KEY, [], json(isIds), storage);
  const cards = pref<string[] | null>(CARDS_KEY, null, json(isCards), storage);
  const has = (id: string): boolean => holds(met.get(), id);
  const carded = (id: string): boolean => holds(cards.get() ?? met.get(), id);
  return {
    has,
    carded,
    add(id) {
      const opened = !has(id);
      if (opened) met.set([...met.get(), id]);
      const shown = cards.get();
      const newCard = shown !== null && !holds(shown, id);
      if (newCard) cards.set([...shown, id]);
      return opened || newCard;
    },
    noteCard(id) {
      const shown = cards.get() ?? met.get();
      if (!holds(shown, id)) cards.set([...shown, id]);
    },
    resetCards() {
      cards.set([]);
    },
  };
}
