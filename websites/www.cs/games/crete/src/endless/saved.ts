/* The Island of Crete: Endless's saved run and best, on the kit's prefs under `crete-endless`, like the campaign's
 * progress. A run is its seed, its piece tier, the level it is on (`depth`), its last levels (for the generator's
 * ramp and new-layout checks), the levels the workers have made ahead of it (up to AHEAD, so a reload loses none),
 * and what it has cleared. The best is the deepest level any run cleared without Ariadne's thread, with that run's
 * seed. While there is no run, the next new run's seed is chosen ahead of time (`upcoming`), and its first levels
 * are made in the background, up to UPCOMING of them, so New Run starts on them; starting any run drops it. Storage
 * that is blocked or holds anything unexpected reads as no run and no best. DOM-free. */
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
  /** Its shortest line, as move letters. */
  line: string;
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
  /** The levels made after `next`, in order, up to AHEAD - 1 of them; absent in a run saved before there were any. */
  ahead?: RunLevel[];
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

/** The next new run, chosen ahead of time: its seed, tier and budget (null for the generator's own), and its first
 *  levels made so far, in order from level 1. */
export interface Upcoming { seed: string; tier: number; budget: number | null; levels: RunLevel[] }

interface Stored { run: EndlessRun | null; best: EndlessBest | null; upcoming?: Upcoming | null }

const isText = (v: unknown, most = 20_000): v is string => typeof v === 'string' && v.length <= most;
const isCount = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0;
const isLevel = (v: unknown): v is RunLevel => {
  if (typeof v !== 'object' || v === null) return false;
  const l = v as Record<string, unknown>;
  return isText(l.text) && isCount(l.explored) && isCount(l.shortest) && isText(l.line, 4_000) && (l.from === 'made' || l.from === 'bank');
};
const isRun = (v: unknown): v is EndlessRun => {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return isText(r.seed, 32) && /^[a-z0-9-]+$/.test(r.seed as string) && Number.isInteger(r.tier) && (r.tier as number) >= 1 && (r.tier as number) <= 10
    && Number.isInteger(r.depth) && (r.depth as number) >= 1 && Array.isArray(r.levels) && r.levels.length >= 1 && r.levels.every(isLevel)
    && (r.next === null || isLevel(r.next))
    && (r.ahead === undefined || (Array.isArray(r.ahead) && r.ahead.length < AHEAD && r.ahead.every(isLevel) && (r.ahead.length === 0 || r.next !== null)))
    && isCount(r.cleared) && isCount(r.moves) && typeof r.assisted === 'boolean'
    && (r.best === null || isCount(r.best));
};
const isSeed = (v: unknown): v is string => isText(v, 32) && /^[a-z0-9-]+$/.test(v);
const isUpcoming = (v: unknown): v is Upcoming => {
  if (typeof v !== 'object' || v === null) return false;
  const u = v as Record<string, unknown>;
  return isSeed(u.seed) && Number.isInteger(u.tier) && (u.tier as number) >= 1 && (u.tier as number) <= 10
    && (u.budget === null || (Number.isInteger(u.budget) && (u.budget as number) > 0))
    && Array.isArray(u.levels) && u.levels.length <= UPCOMING && u.levels.every(isLevel);
};
const isBest = (v: unknown): v is EndlessBest => {
  if (typeof v !== 'object' || v === null) return false;
  const b = v as Record<string, unknown>;
  return isCount(b.depth) && isText(b.seed, 32) && isCount(b.moves);
};
const isStored = (v: unknown): v is Stored => {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
  const s = v as Record<string, unknown>;
  return (s.run === null || isRun(s.run)) && (s.best === null || isBest(s.best))
    && (s.upcoming === undefined || s.upcoming === null || isUpcoming(s.upcoming));
};

export interface EndlessSaved {
  run(): EndlessRun | null;
  best(): EndlessBest | null;
  /** A new run on `seed` and `tier`, at its first level; the levels after it, made ahead, queue behind it. The
   *  upcoming run is dropped. */
  start(seed: string, tier: number, first: Made | RunLevel, after?: readonly RunLevel[]): EndlessRun;
  /** The next new run chosen ahead of time, while there is no run. */
  upcoming(): Upcoming | null;
  /** Chooses the next new run: `seed`, `tier` and `budget`, with no level made yet. */
  plan(seed: string, tier: number, budget: number | null): Upcoming;
  /** The upcoming run's level at `depth`, made ahead: kept when it is the one after the last made, while it has
   *  fewer than UPCOMING. */
  addUpcoming(seed: string, depth: number, made: Made): void;
  /** The levels made ahead of the one being played: `next`, then `ahead`. */
  queued(): RunLevel[];
  /** The run's level at `depth`, made ahead: kept when it is the one after the last made (the level being played and
   *  those queued), and the queue holds fewer than AHEAD. */
  addMade(seed: string, depth: number, made: Made): void;
  /** The run's level was won in `moves`, with the thread's help or not: the clear is counted (once per level, the
   *  first win) and the best kept. */
  won(moves: number, assisted: boolean): EndlessRun | null;
  /** Goes on to the next level, once it is made; null when it is not. */
  advance(): EndlessRun | null;
  /** The run's levels as the generator reads them for the next level to make: those played and those queued. */
  played(): Played[];
}

/** The most levels made ahead of the one being played. */
export const AHEAD = 3;
/** The most levels of the upcoming run made ahead: its first, from the bank, and AHEAD after it. */
export const UPCOMING = 1 + AHEAD;

const queuedOf = (run: EndlessRun | null): RunLevel[] => (run?.next ? [run.next, ...(run.ahead ?? [])] : []);

const level = (m: Made | RunLevel): RunLevel => ({ text: m.text, explored: m.explored, shortest: m.shortest, line: m.line, from: m.from });

export function createEndlessSaved(storage: StorageLike | null): EndlessSaved {
  const table = pref<Stored>(ENDLESS_KEY, { run: null, best: null, upcoming: null }, json(isStored), storage);
  const save = (run: EndlessRun | null, best = table.get().best) => table.set({ ...table.get(), run, best });
  return {
    run: () => table.get().run,
    best: () => table.get().best,
    start(seed, tier, first, after = []) {
      const [next = null, ...ahead] = after.slice(0, AHEAD).map(level);
      const run: EndlessRun = { seed, tier, depth: 1, levels: [level(first)], next, ahead, cleared: 0, moves: 0, assisted: false, best: null };
      table.set({ ...table.get(), run, upcoming: null });
      return run;
    },
    upcoming: () => table.get().upcoming ?? null,
    plan(seed, tier, budget) {
      const upcoming: Upcoming = { seed, tier, budget, levels: [] };
      table.set({ ...table.get(), upcoming });
      return upcoming;
    },
    addUpcoming(seed, depth, made) {
      const up = table.get().upcoming;
      if (!up || up.seed !== seed || depth !== up.levels.length + 1 || up.levels.length >= UPCOMING) return;
      table.set({ ...table.get(), upcoming: { ...up, levels: [...up.levels, level(made)] } });
    },
    queued: () => queuedOf(table.get().run),
    addMade(seed, depth, made) {
      const run = table.get().run;
      if (!run || run.seed !== seed) return;
      const queued = queuedOf(run);
      if (depth !== run.depth + 1 + queued.length || queued.length >= AHEAD) return;
      const [next, ...ahead] = [...queued, level(made)];
      save({ ...run, next: next!, ahead });
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
      const [after = null, ...ahead] = run.ahead ?? [];
      const next: EndlessRun = { ...run, depth: run.depth + 1, levels: [...run.levels, run.next].slice(-RUN_MEMORY), next: after, ahead, best: null };
      save(next);
      return next;
    },
    played: () => {
      const run = table.get().run;
      return run ? [...run.levels, ...queuedOf(run)].slice(-RUN_MEMORY).map(l => ({ text: l.text, explored: l.explored })) : [];
    },
  };
}
