/* The Island of Crete: the page's side of Endless's workers (src/endless-worker.ts). `make(request)` asks for a
 * run's level and returns a job: its progress, its answer, and `cancel()`. A run's first level is the bank's, from
 * one worker. A later level's search is cut into parts (src/endless/generate.ts's partsOf): the client hands them
 * out in order to as many workers as `size()` allows, and settles on the lowest part that finds a level, once every
 * part below it has come back empty (`settle`), so the answer is the one a single worker would give. A part above a
 * part that has found one is no longer needed, and its worker is ended. When no part finds one, a worker answers
 * from the bank. `size()` may change while a job runs (`resize`): a smaller size ends the workers of the highest
 * parts, which run again later, and 0 holds the job until it grows. The parts a request has finished are kept, so
 * the same request asked again, after a cancel or a reload (`keep`), goes on where it stopped. A part runs straight through, so cancelling
 * a job ends its workers at once and rejects the answer with CancelledError. One job runs at a time: a new one
 * cancels the one before it. A worker that fails rejects its job; the next job starts fresh workers. The page never
 * waits on the search. */
import { partsOf, settle } from './generate.ts';
import type { Made, Part, Progress, Request } from './generate.ts';
import type { FromEndless, ToEndless } from './host.ts';

export interface WorkerLike {
  postMessage(m: unknown): void;
  onmessage: ((e: { data: unknown }) => void) | null;
  onerror?: ((e: unknown) => void) | null;
  terminate(): void;
}

export class CancelledError extends Error {
  constructor() { super('the search was cancelled'); this.name = 'CancelledError'; }
}

export interface MakeJob {
  progress(cb: (p: Progress) => void): void;
  cancel(): void;
  result: Promise<Made>;
}

export interface EndlessClient {
  make(request: Request): MakeJob;
  /** Cancels the job under way, if any. */
  cancel(): void;
  /** `size()` may have changed: workers past it are ended (the highest parts first, run again later), and the job
   *  under way takes up any more it allows. A size of 0 holds the job until it grows. */
  resize(): void;
}

/** How many workers to search with: one fewer than the device's cores (the page keeps one), at most MOST_WORKERS,
 *  and one alone on a battery that is low and not charging. */
export const MOST_WORKERS = 3;
export function workersFor(cores: number | undefined, battery: { level: number; charging: boolean } | null): number {
  if (battery && !battery.charging && battery.level < LOW_BATTERY) return 1;
  return Math.max(1, Math.min(MOST_WORKERS, (cores ?? 2) - 1));
}
const LOW_BATTERY = 0.2;

/** Where the page stands for Endless's workers. */
export interface Standing {
  /** The player is in an Endless run: its level is open, or Next Level waits on the next. */
  run: boolean;
  /** The page has loaded and been quiet for a few seconds. */
  warm: boolean;
  shown: boolean;
  /** The solver's worker has a search going (the editor's Check, a shared level's rating). */
  solving: boolean;
  battery: { level: number; charging: boolean } | null;
}

/** How many workers search now: a run's `full` share; else one in the background, once the page is warm, while it
 *  shows, the solver is idle and the battery is not low and draining; else none, and the search waits. */
export function workersNow(s: Standing, full: number): number {
  if (s.run) return full;
  const draining = !!s.battery && !s.battery.charging && s.battery.level < LOW_BATTERY;
  return s.warm && s.shown && !s.solving && !draining ? 1 : 0;
}

interface Slot { worker: WorkerLike; busy: number | null }

/** What a job needs of the client between messages. */
interface Live { pump(): void; drop(part: number): void }

/** Where the parts a request has finished are kept over a reload (src/endless/saved.ts's partStore). */
export interface PartStore {
  load(key: string): (Part | undefined)[] | null;
  save(key: string, results: readonly (Part | undefined)[]): void;
}

export function createEndlessClient(spawn: () => WorkerLike, size: () => number = () => 1, keep: PartStore | null = null): EndlessClient {
  const slots: Slot[] = [];
  let current: { id: number; stop: (e: Error) => void; live: Live } | null = null;
  /** The job under way's handlers: a worker outlives a job, so its messages go to whichever job is current. */
  let onMessage: ((s: Slot, m: FromEndless) => void) | null = null;
  let onError: ((s: Slot) => void) | null = null;
  /** The parts a request's search has finished, kept past a cancel or a narrowing, so the same request goes on
   *  where it stopped: a part's answer depends on the request alone. */
  let memo: { key: string; results: (Part | undefined)[] } = { key: '', results: [] };
  let nextId = 1;
  const end = (s: Slot) => {
    try { s.worker.terminate(); } catch { /* gone either way */ }
    slots.splice(slots.indexOf(s), 1);
  };
  const endAll = () => { for (const s of [...slots]) end(s); };
  const busyCount = () => slots.filter(s => s.busy !== null).length;
  const cancel = () => {
    if (!current) return;
    const c = current;
    current = null;
    endAll();
    c.stop(new CancelledError());
  };
  return {
    cancel,
    resize() {
      const most = Math.max(0, size());
      const busy = slots.filter(s => s.busy !== null).sort((a, b) => b.busy! - a.busy!);
      while (busy.length > most) {
        const s = busy.shift()!;
        const part = s.busy!;
        end(s);
        current?.live.drop(part);
      }
      for (const s of slots.filter(s => s.busy === null)) if (slots.length > most) end(s);
      current?.live.pump();
    },
    make(request) {
      cancel();
      const id = nextId++;
      const listeners: ((p: Progress) => void)[] = [];
      let settleJob: { resolve: (m: Made) => void; reject: (e: Error) => void } = { resolve: () => {}, reject: () => {} };
      const result = new Promise<Made>((resolve, reject) => { settleJob = { resolve, reject }; });
      result.catch(() => {});
      const mine = () => current?.id === id;
      const finish = (f: () => void) => { if (!mine()) return; current = null; for (const s of slots) s.busy = null; f(); };
      const fail = (message: string) => finish(() => { endAll(); settleJob.reject(new Error(message)); });

      const first = request.depth <= 1 || request.run.length === 0;
      const { parts, budget } = partsOf(request);
      const key = JSON.stringify(request);
      if (memo.key !== key) memo = { key, results: keep?.load(key) ?? [] };
      const results = memo.results;
      /** Each running part's progress, and what the finished ones spent. */
      const live = new Map<number, Progress>();
      const running = new Set<number>();
      /** The bank's answer is due (a first level, or no part found one), and whether a worker has it. */
      let bankDue = first, bankSent = false;
      /** The lowest part that has found a level so far. */
      let found = results.findIndex(r => r?.found);
      if (found < 0) found = Infinity;

      const report = () => {
        let spent = 0, tries = 0;
        results.forEach(r => { if (r) { spent += r.spent; tries += r.tries; } });
        for (const p of live.values()) { spent += p.spent; tries += p.tries; }
        const p: Progress = { tries, spent, budget: parts * budget };
        for (const cb of listeners) cb(p);
      };
      const slot = (): Slot | null => {
        if (busyCount() >= Math.max(0, size())) return null;
        const idle = slots.find(s => s.busy === null);
        if (idle) return idle;
        let worker: WorkerLike;
        try { worker = spawn(); } catch (e) {
          if (slots.length) return null;
          fail(`the level worker could not start: ${e instanceof Error ? e.message : String(e)}`);
          return null;
        }
        const s: Slot = { worker, busy: null };
        slots.push(s);
        worker.onmessage = e => onMessage?.(s, e.data as FromEndless);
        worker.onerror = () => onError?.(s);
        return s;
      };
      const send = (s: Slot, m: ToEndless, busy: number) => { s.busy = busy; s.worker.postMessage(m); };
      /** Hands the bank's answer or the next parts to idle workers, while one could still be the answer. */
      const pump = () => {
        if (!mine()) return;
        if (bankDue) {
          if (bankSent) return;
          const s = slot();
          if (!s) return;
          let tries = 0, spent = 0;
          results.forEach(r => { if (r) { tries += r.tries; spent += r.spent; } });
          bankSent = true;
          send(s, { type: 'bank', id, request, tries, spent }, -1);
          return;
        }
        for (let k = 0; k < Math.min(parts, found); k++) {
          if (results[k] || running.has(k)) continue;
          const s = slot();
          if (!s) return;
          running.add(k);
          send(s, { type: 'part', id, request, part: k }, k);
        }
      };
      const drop = (part: number) => {
        if (part < 0) bankSent = false;
        running.delete(part);
        live.delete(part);
      };
      /** Settles the job once the parts back decide it: its level, or the bank's when none found one. */
      const decide = (): boolean => {
        const settled = settle(results, parts);
        if (settled.made) { const made = settled.made; finish(() => settleJob.resolve(made)); return true; }
        if (settled.done) bankDue = true;
        return false;
      };
      function receive(s: Slot, m: FromEndless): void {
        if (!mine() || m.id !== id) return;
        if (m.type === 'progress') { if (s.busy !== null && s.busy >= 0) { live.set(s.busy, m.progress); report(); } return; }
        if (m.type === 'failed') { fail(m.message); return; }
        if (m.type === 'made') { finish(() => settleJob.resolve(m.made)); return; }
        s.busy = null;
        drop(m.part);
        results[m.part] = m.result;
        keep?.save(key, results);
        if (m.result.found && m.part < found) {
          found = m.part;
          // The parts above it can no longer be the answer: their workers are ended.
          for (const o of [...slots]) if (o.busy !== null && o.busy > found) { drop(o.busy); end(o); }
        }
        report();
        if (decide()) return;
        pump();
      }

      current = { id, stop: e => settleJob.reject(e), live: { pump, drop } };
      onMessage = receive;
      onError = s => { if (s.busy !== null && mine()) fail('the level worker failed'); };
      if (!first && decide()) return { progress: () => {}, cancel: () => {}, result };
      pump();
      return {
        progress: cb => { listeners.push(cb); },
        cancel: () => { if (mine()) cancel(); },
        result,
      };
    },
  };
}
