/* The Island of Crete: which levels this browser has cleared, on the kit's
 * prefs. `assisted` is derived: cleared with no unassisted best. Storage that
 * is blocked or holds anything unexpected reads as empty. */
import { pref, json } from "../../_kit/prefs.ts";
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

export function createProgress(storage: StorageLike | null): Progress {
  const table = pref<Table>(PROGRESS_KEY, {}, json(isTable), storage);
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
