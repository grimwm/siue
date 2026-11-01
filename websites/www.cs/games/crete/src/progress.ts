/* The Island of Crete: which levels this browser has cleared, on the kit's
 * prefs. `assisted` is derived: cleared with no unassisted best. Storage that
 * is blocked or holds anything unexpected reads as empty. */
import { pref, json } from "../../_kit/prefs.ts";
import type { Pref } from "../../_kit/prefs.ts";
import type { StorageLike } from "../../_kit/ports.ts";

export const PROGRESS_KEY = "crete-progress";

export interface TrialProgress {
  cleared: boolean;
  assisted: boolean;
  /** Fewest moves of an unassisted clear. */
  best: number | null;
}

export interface Progress {
  get(id: string): TrialProgress;
  /** Notes a clear; an assisted clear never sets or lowers a best. */
  record(id: string, moves: number, assisted: boolean): TrialProgress;
}

interface Stored {
  cleared: boolean;
  best: number | null;
}
type Table = Record<string, Stored>;

const isStored = (v: unknown): v is Stored => {
  if (typeof v !== "object" || v === null) return false;
  const s = v as Record<string, unknown>;
  return typeof s.cleared === "boolean" && (s.best === null || (Number.isInteger(s.best) && (s.best as number) >= 0));
};
const isTable = (v: unknown): v is Table =>
  typeof v === "object" && v !== null && !Array.isArray(v) && Object.values(v).every(isStored);

const view = (s: Stored | undefined): TrialProgress =>
  s ? { cleared: s.cleared, assisted: s.cleared && s.best === null, best: s.best } : { cleared: false, assisted: false, best: null };

/** Set once a browser's progress has Chapter 4's levels 4 to 8 under their present ids. */
export const CH4_ORDER_KEY = "crete-progress-ch4-order";
/** Chapter 4's levels 4 to 8 were put in a new order: each room's new id, from its old one. */
const CH4_MOVED: Readonly<Record<string, string>> = { "ch4-4": "ch4-5", "ch4-5": "ch4-4", "ch4-6": "ch4-7", "ch4-7": "ch4-8", "ch4-8": "ch4-6" };

/** Moves a clear kept under a Chapter 4 room's old id to its new one, once per browser. */
function reorderChapter4(table: Pref<Table>, storage: StorageLike | null): void {
  try {
    if (!storage || storage.getItem(CH4_ORDER_KEY) !== null) return;
    const all = table.get();
    const next: Table = { ...all };
    for (const [from, to] of Object.entries(CH4_MOVED)) {
      if (Object.hasOwn(all, from)) next[to] = all[from]!;
      else delete next[to];
    }
    if (Object.keys(CH4_MOVED).some(id => Object.hasOwn(all, id))) table.set(next);
    storage.setItem(CH4_ORDER_KEY, "1");
  } catch {
    // Storage refused: the next load tries again.
  }
}

export function createProgress(storage: StorageLike | null): Progress {
  const table = pref<Table>(PROGRESS_KEY, {}, json(isTable), storage);
  reorderChapter4(table, storage);
  return {
    get: (id) => view(Object.hasOwn(table.get(), id) ? table.get()[id] : undefined),
    record(id, moves, assisted) {
      const all = table.get();
      const was = Object.hasOwn(all, id) ? all[id] : undefined;
      let best = was?.best ?? null;
      if (!assisted && (best === null || moves < best)) best = moves;
      const next: Stored = { cleared: true, best };
      table.set({ ...all, [id]: next });
      return view(next);
    },
  };
}
