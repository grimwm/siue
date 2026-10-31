/* The Island of Crete: which Dictionary entries this browser has met, on the kit's prefs beside the levels cleared
 * and the story pages found. A first meeting shows its card; after that the entry is open in the Dictionary. The
 * stored word "*" stands for every entry (the browser specs set it to keep their levels free of first cards).
 * Storage that is blocked or holds anything unexpected reads as none met. DOM-free. */
import { pref, json } from "../../_kit/prefs.ts";
import type { StorageLike } from "../../_kit/ports.ts";

export const MET_KEY = "crete-met";
/** The stored word for every entry. */
export const ALL_MET = "*";

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
    return all.includes(ALL_MET) || all.includes(id);
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
