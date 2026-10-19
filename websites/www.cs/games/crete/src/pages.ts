/* The Island of Crete: which story pages this browser has found, on the kit's
 * prefs. Storage that is blocked or holds anything unexpected reads as none. */
import { pref, json } from "../../_kit/prefs.ts";
import type { StorageLike } from "../../_kit/ports.ts";

export const PAGES_KEY = "crete-pages";

export interface FoundPages {
  has(id: string): boolean;
  all(): string[];
  /** Adds; returns the ids that were new. */
  add(ids: readonly string[]): string[];
}

const isIds = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(x => typeof x === "string" && /^[a-z0-9-]+$/.test(x));

export function createFoundPages(storage: StorageLike | null): FoundPages {
  const found = pref<string[]>(PAGES_KEY, [], json(isIds), storage);
  return {
    has: id => found.get().includes(id),
    all: () => [...found.get()],
    add(ids) {
      const have = found.get();
      const fresh = [...new Set(ids)].filter(id => !have.includes(id));
      if (fresh.length > 0) found.set([...have, ...fresh]);
      return fresh;
    },
  };
}
