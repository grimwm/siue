/* The Island of Crete: Endless's saved run and best, on the kit's prefs under `crete-endless`, like the campaign's
 * progress. A run is its seed, its piece tier, the level it is on (`depth`), its last levels (for the generator's
 * ramp and new-layout checks), the next level once the worker has made it, and what it has cleared. The best is the
 * deepest level any run cleared without Ariadne's thread, with that run's seed. Storage that is blocked or holds
 * anything unexpected reads as no run and no best. DOM-free. */
import { pref, json } from '../../../_kit/prefs.ts';
import type { StorageLike } from '../../../_kit/ports.ts';
import { RUN_MEMORY } from './generate.ts';
import type { Made, Played } from './generate.ts';

export const ENDLESS_KEY = 'crete-endless';

/** One of a run's levels: what the generator made, and how its clear went (null moves while not cleared). */
export interface RunLevel {
  text: string;
  explored: number;
  shortest: number;
  from: 'made' | 'bank';
}

export interface EndlessRun {
  seed: string;
  tier: number;
  /** The level the run is on, 1 for its first. */
  depth: number;
  /** The run's last levels, oldest first; the last is the level at `depth`. */
  levels: RunLevel[];
  /** The level after `depth`, once made. */
  next: RunLevel | null;
  /** Levels cleared, and their moves added up. */
  cleared: number;
  moves: number;
  /** Some level of the run was cleared with Ariadne's thread: the run sets no best. */
  assisted: boolean;
  /** The fewest moves of an unassisted clear of the level at `depth`, while the run is on it. */
  best: number | null;
}

/** The deepest level a run cleared without the thread. */
export interface EndlessBest { depth: number; seed: string; moves: number }

interface Stored { run: EndlessRun | null; best: EndlessBest | null }

const isText = (v: unknown, most = 20_000): v is string => typeof v === 'string' && v.length <= most;
const isCount = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0;
const isLevel = (v: unknown): v is RunLevel => {
  if (typeof v !== 'object' || v === null) return false;
  const l = v as Record<string, unknown>;
  return isText(l.text) && isCount(l.explored) && isCount(l.shortest) && (l.from === 'made' || l.from === 'bank');
};
const isRun = (v: unknown): v is EndlessRun => {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return isText(r.seed, 32) && /^[a-z0-9-]+$/.test(r.seed as string) && Number.isInteger(r.tier) && (r.tier as number) >= 1 && (r.tier as number) <= 10
    && Number.isInteger(r.depth) && (r.depth as number) >= 1 && Array.isArray(r.levels) && r.levels.length >= 1 && r.levels.every(isLevel)
    && (r.next === null || isLevel(r.next)) && isCount(r.cleared) && isCount(r.moves) && typeof r.assisted === 'boolean'
    && (r.best === null || isCount(r.best));
};
const isBest = (v: unknown): v is EndlessBest => {
  if (typeof v !== 'object' || v === null) return false;
  const b = v as Record<string, unknown>;
  return isCount(b.depth) && isText(b.seed, 32) && isCount(b.moves);
};
const isStored = (v: unknown): v is Stored => {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
  const s = v as Record<string, unknown>;
  return (s.run === null || isRun(s.run)) && (s.best === null || isBest(s.best));
};

export interface EndlessSaved {
  run(): EndlessRun | null;
  best(): EndlessBest | null;
  /** A new run on `seed` and `tier`, at its first level. */
  start(seed: string, tier: number, first: Made): EndlessRun;
  /** The level after the run's current one, made. Ignored unless the run is still on `depth`. */
  setNext(seed: string, depth: number, made: Made): void;
  /** The run's level was won in `moves`, with the thread's help or not: the clear is counted (once per level, the
   *  first win) and the best kept. */
  won(moves: number, assisted: boolean): EndlessRun | null;
  /** Goes on to the next level, once it is made; null when it is not. */
  advance(): EndlessRun | null;
  /** The run's levels as the generator reads them. */
  played(): Played[];
}

const level = (m: Made): RunLevel => ({ text: m.text, explored: m.explored, shortest: m.shortest, from: m.from });

export function createEndlessSaved(storage: StorageLike | null): EndlessSaved {
  const table = pref<Stored>(ENDLESS_KEY, { run: null, best: null }, json(isStored), storage);
  const save = (run: EndlessRun | null, best = table.get().best) => table.set({ run, best });
  return {
    run: () => table.get().run,
    best: () => table.get().best,
    start(seed, tier, first) {
      const run: EndlessRun = { seed, tier, depth: 1, levels: [level(first)], next: null, cleared: 0, moves: 0, assisted: false, best: null };
      save(run);
      return run;
    },
    setNext(seed, depth, made) {
      const run = table.get().run;
      if (!run || run.seed !== seed || run.depth !== depth) return;
      save({ ...run, next: level(made) });
    },
    won(moves, assisted) {
      const run = table.get().run;
      if (!run) return null;
      const first = run.cleared < run.depth;
      const next: EndlessRun = {
        ...run,
        cleared: first ? run.cleared + 1 : run.cleared,
        moves: first ? run.moves + moves : run.moves,
        assisted: run.assisted || (first && assisted),
        best: assisted ? run.best : run.best === null ? moves : Math.min(run.best, moves),
      };
      let best = table.get().best;
      if (!next.assisted && (best === null || next.depth > best.depth || (next.depth === best.depth && next.moves < best.moves))) {
        best = { depth: next.depth, seed: next.seed, moves: next.moves };
      }
      save(next, best);
      return next;
    },
    advance() {
      const run = table.get().run;
      if (!run?.next || run.cleared < run.depth) return null;
      const next: EndlessRun = { ...run, depth: run.depth + 1, levels: [...run.levels, run.next].slice(-RUN_MEMORY), next: null, best: null };
      save(next);
      return next;
    },
    played: () => (table.get().run?.levels ?? []).map(l => ({ text: l.text, explored: l.explored })),
  };
}
