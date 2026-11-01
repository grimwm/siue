/* The Island of Crete: which Dictionary entries this browser has met, on the kit's prefs beside the levels cleared
 * and the story pages found: items by id, first touches of active tiles as `touch-<id>` (src/dictionary.ts metId).
 * A first pickup or touch shows its card; after that it shows a banner. The stored word "*" stands for every entry
 * (the browser specs set it to keep their levels free of first cards). A key was once kept by its colour
 * (`key-red`); any of those reads as the Keys family (`keys`), met with whichever colour came first.
 * Storage that is blocked or holds anything unexpected reads as none met. DOM-free. */
import { pref, json } from "../../_kit/prefs.ts";
import type { StorageLike } from "../../_kit/ports.ts";

export const MET_KEY = "crete-met";
/** The stored word for every entry. */
export const ALL_MET = "*";

/** Ids kept before their entry joined a family, and the family they read as. */
const FORMER: Readonly<Record<string, string>> = { 'key-red': 'keys', 'key-blue': 'keys', 'key-yellow': 'keys', 'key-green': 'keys' };

export interface Met {
  has(id: string): boolean;
  /** Notes `id` as met; true when it was new. */
  add(id: string): boolean;
}

const isIds = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(x => typeof x === "string" && /^([a-z0-9-]+|\*)$/.test(x));

export function createMet(storage: StorageLike | null): Met {
  const met = pref<string[]>(MET_KEY, [], json(isIds), storage);
  const has = (id: string): boolean => {
    const all = met.get();
    return all.includes(ALL_MET) || all.some(x => x === id || FORMER[x] === id);
  };
  return {
    has,
    add(id) {
      if (has(id)) return false;
      met.set([...met.get(), id]);
      return true;
    },
  };
}
