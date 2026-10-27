/* The Island of Crete: the solver's worker side, as a message handler. It takes a level's text and a search kind
 * (solve: the shortest line; measure: difficulty.ts's numbers), answers from the result cache when it can (an
 * entry of this solver's version; a cached line only when it still wins), and
 * otherwise searches in batches, reporting progress between them. Past a memory budget the search's nodes go to a
 * node file on disk (the origin private file system, in the worker); without one they stay in memory and the
 * progress says so. Stop pauses between batches and resume goes on with the same search; a new search cancels the
 * one under way or stopped, as does a cancel, and every search closes its node file when it ends. solver-worker.ts wires it to the
 * Worker; the tests run it in-process. DOM-free. */
import { parse } from './puzzle/level.ts';
import type { Level } from './puzzle/level.ts';
import { initial } from './puzzle/state.ts';
import { step } from './puzzle/step.ts';
import type { Action } from './puzzle/step.ts';
import { layoutOf } from './puzzle/pack.ts';
import { memoryStore, spillingStore } from './puzzle/store.ts';
import type { NodeStore } from './puzzle/store.ts';
import type { PagedFile } from './puzzle/paged.ts';
import type { Progress } from './puzzle/astar.ts';
import { solving, SOLVER_CAP } from './puzzle/solver.ts';
import type { SolveResult } from './puzzle/solver.ts';
import { measuring } from './puzzle/difficulty.ts';
import type { Difficulty } from './puzzle/difficulty.ts';
import { lineOf, lineText, resultKey, safeResults } from './puzzle/cache.ts';
import type { CachedResult, ResultStore } from './puzzle/cache.ts';

export type SearchKind = 'solve' | 'measure';
export type Storage = 'disk' | 'memory';
export interface Report extends Progress { storage: Storage }
export type Answer = SolveResult | Difficulty;

export type ToHost =
  | { type: 'start'; id: number; text: string; kind: SearchKind }
  | { type: 'stop'; id: number }
  | { type: 'resume'; id: number }
  | { type: 'cancel'; id: number };
export type FromHost =
  | { type: 'progress'; id: number; report: Report }
  | { type: 'result'; id: number; result: Answer }
  | { type: 'failed'; id: number; message: string };

/** A search's node file; `close` lets it go and deletes it. */
export interface NodeFile { file: PagedFile; close(): void }

export interface HostDeps {
  post(m: FromHost): void;
  results: ResultStore;
  /** A new, empty node file; it throws or rejects when there is no disk. */
  openFile(): Promise<NodeFile>;
  /** Lets the messages that arrived during a batch in. */
  pause(): Promise<void>;
  /** The solver's version, part of every cache key so another build's results are never served; null when it is
   *  unknown, and then nothing is cached. */
  version: string | null | Promise<string | null>;
  /** Expansions per batch; BATCH by default. */
  every?: number;
  /** Nodes kept in memory before the node file, its page size and pages cached; searchLimits' and PAGE_BYTES and
   *  CACHE_PAGES by default. */
  spill?: { memoryNodes: number; pageBytes: number; cachePages: number };
}

/** Expansions per batch: tens of milliseconds, so stop answers quickly and progress comes several times a second. */
export const BATCH = 4096;
/** Bytes per page of the node file, and pages cached in memory (4 MiB). */
export const PAGE_BYTES = 65_536;
export const CACHE_PAGES = 64;
/** Nodes kept whole in memory before the rest go to the node file. */
export const MEMORY_NODES = 65_536;
/** The most the search's arrays may hold in memory at its cap. */
export const MEMORY_CEILING = 384 * 2 ** 20;

/** The cap and memory budget for a level whose situations pack into `words` words. Every array the search grows
 *  (by doubling, so to at most twice what it holds) stays within MEMORY_CEILING up to the cap: per stored node the
 *  A* arrays and heap take 19 bytes, pruning's index at most 8 × words + 20, and the store 12 (hash and table) on
 *  disk, or 4 × words + 21 (the whole node) in memory; on disk the first MEMORY_NODES nodes (4 × words + 9 each)
 *  and the page cache come on top. `bytes(n)` is that total for n nodes. */
export function searchLimits(words: number, storage: Storage): { cap: number; memoryNodes: number; bytes: (nodes: number) => number } {
  const prune = 8 * words + 20;
  const perNode = 2 * (19 + prune + (storage === 'disk' ? 12 : 4 * words + 21));
  const fixed = storage === 'disk' ? MEMORY_NODES * (4 * words + 9) + PAGE_BYTES * CACHE_PAGES : 0;
  const cap = Math.min(SOLVER_CAP, Math.floor((MEMORY_CEILING - fixed) / perNode));
  return { cap, memoryNodes: Math.min(MEMORY_NODES, cap), bytes: n => fixed + n * perNode };
}

/** A search a newer one replaced, or a cancel ended. */
class Cancelled extends Error {}

interface Job { id: number; stopped: boolean; cancelled: boolean; wake: (() => void) | null }

export function createSolverHost(deps: HostDeps): { receive(m: ToHost): void } {
  const every = deps.every ?? BATCH;
  const results = safeResults(deps.results);
  let current: Job | null = null;

  const wake = (job: Job) => {
    const w = job.wake;
    job.wake = null;
    w?.();
  };

  async function run(job: Job, text: string, kind: SearchKind): Promise<void> {
    try {
      deps.post({ type: 'result', id: job.id, result: await search(job, text, kind) });
    } catch (e) {
      const message = e instanceof Cancelled ? 'the search was cancelled: a newer search replaced it or it was cancelled'
        : e instanceof Error ? e.message : String(e);
      deps.post({ type: 'failed', id: job.id, message });
    } finally {
      if (current === job) current = null;
    }
  }

  async function search(job: Job, text: string, kind: SearchKind): Promise<Answer> {
    const level = parse(text);
    const version = await deps.version;
    const key = version === null ? null : await resultKey(text, kind, version);
    const hit = key === null ? null : await results.get(key);
    if (job.cancelled) throw new Cancelled();
    const cached = hit && fromCache(hit, kind, level);
    if (cached) return cached;
    let disk: NodeFile | null = null;
    try { disk = await deps.openFile(); } catch { disk = null; }
    try {
      if (job.cancelled) throw new Cancelled();
      const storage: Storage = disk ? 'disk' : 'memory';
      const limits = searchLimits(layoutOf(level).words, storage);
      const file = disk?.file;
      const spill = deps.spill ?? { memoryNodes: limits.memoryNodes, pageBytes: PAGE_BYTES, cachePages: CACHE_PAGES };
      const store = (words: number): NodeStore => (file
        ? spillingStore(words, file, spill.memoryNodes, spill)
        : memoryStore(words));
      const solveStore = kind === 'solve' ? store(layoutOf(level).words) : null;
      const batches = solveStore
        ? solving(initial(level), null, limits.cap, { store: solveStore, every })
        : measuring(level, limits.cap, { store, every });
      let answer: Answer;
      for (;;) {
        let n: IteratorResult<Progress, Answer>;
        try {
          n = batches.next();
        } catch (e) {
          // Memory ran out below the ceiling: a solve ends capped, as any search that cannot go on.
          if (!(e instanceof RangeError) || kind !== 'solve') throw e;
          n = { done: true, value: { solved: false, explored: solveStore!.size, capped: true, reason: `out of memory: ${e.message}` } };
        }
        if (n.done) { answer = n.value; break; }
        deps.post({ type: 'progress', id: job.id, report: { ...n.value, storage } });
        await deps.pause();
        while (job.stopped && !job.cancelled) await new Promise<void>(r => { job.wake = r; });
        if (job.cancelled) throw new Cancelled();
      }
      const keep = toCache(answer);
      if (keep && key !== null) {
        await results.put(key, keep);
        void results.trim?.();
      }
      return answer;
    } finally {
      try { disk?.close(); } catch { /* the file is gone either way */ }
    }
  }

  return {
    receive(m) {
      if (m.type === 'start') {
        if (current) { current.cancelled = true; wake(current); }
        const job: Job = { id: m.id, stopped: false, cancelled: false, wake: null };
        current = job;
        void run(job, m.text, m.kind);
      } else if (current && current.id === m.id) {
        if (m.type === 'cancel') { current.cancelled = true; wake(current); return; }
        current.stopped = m.type === 'stop';
        if (!current.stopped) wake(current);
      }
    },
  };
}

const isDifficulty = (a: Answer): a is Difficulty => 'shortest' in a;

/** A finished answer as the cache keeps it; null for one that hit its cap (it may finish another time). */
function toCache(a: Answer): CachedResult | null {
  if (isDifficulty(a)) {
    const open = [a.shortest, a.catchFree, a.withoutMinotaur, a.label].includes('unknown');
    return open ? null : { solved: a.solved, line: '', explored: a.explored, difficulty: a };
  }
  if (a.solved) return { solved: true, line: lineText(a.line), explored: a.explored };
  return a.capped ? null : { solved: false, line: '', explored: a.explored };
}

/** The cached answer for `kind` on `level`, or null when the entry does not read as one, or its line does not win
 *  `level` on its last move. */
function fromCache(c: CachedResult, kind: SearchKind, level: Level): Answer | null {
  if (kind === 'measure') {
    const d = c.difficulty;
    return typeof d === 'object' && d !== null && 'shortest' in d && 'label' in d ? (d as Difficulty) : null;
  }
  if (!c.solved) return { solved: false, explored: c.explored, capped: false };
  const line = lineOf(c.line);
  return line && wins(level, line) ? { solved: true, line, explored: c.explored } : null;
}

/** `line` played from the start wins on its last move, and not before. */
function wins(level: Level, line: readonly Action[]): boolean {
  let s = initial(level);
  for (const a of line) {
    if (s.outcome !== 'playing') return false;
    s = step(s, a).state;
  }
  return s.outcome === 'won';
}
