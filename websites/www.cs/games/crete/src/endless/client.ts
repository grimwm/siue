/* The Island of Crete: the page's side of Endless's workers (src/endless-worker.ts). `make(request)` asks for a
 * run's level and returns a job: its progress, its answer, and `cancel()`. A run's first level is the bank's, from
 * one worker. A later level's search is cut into parts (src/endless/generate.ts's partsOf): the client hands them
 * out in order to as many workers as `size()` allows, and settles on the lowest part that finds a level, once every
 * part below it has come back empty (`settle`), so the answer is the one a single worker would give. A part above a
 * part that has found one is no longer needed, and its worker is ended. When no part finds one, a worker answers
 * from the bank. A part runs straight through, so cancelling a job ends its workers at once and rejects the answer
 * with CancelledError. One job runs at a time: a new one cancels the one before it. A worker that fails rejects its
 * job; the next job starts fresh workers. The page never waits on the search. */
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
}

/** How many workers to search with: one fewer than the device's cores (the page keeps one), at most MOST_WORKERS,
 *  and one alone on a battery that is low and not charging. */
export const MOST_WORKERS = 3;
export function workersFor(cores: number | undefined, battery: { level: number; charging: boolean } | null): number {
  if (battery && !battery.charging && battery.level < 0.2) return 1;
  return Math.max(1, Math.min(MOST_WORKERS, (cores ?? 2) - 1));
}

interface Slot { worker: WorkerLike; busy: number | null }

export function createEndlessClient(spawn: () => WorkerLike, size: () => number = () => 1): EndlessClient {
  const slots: Slot[] = [];
  let current: { id: number; stop: (e: Error) => void } | null = null;
  /** The job under way's handlers: a worker outlives a job, so its messages go to whichever job is current. */
  let onMessage: ((s: Slot, m: FromEndless) => void) | null = null;
  let onError: ((s: Slot) => void) | null = null;
  let nextId = 1;
  const end = (s: Slot) => {
    try { s.worker.terminate(); } catch { /* gone either way */ }
    slots.splice(slots.indexOf(s), 1);
  };
  const endAll = () => { for (const s of [...slots]) end(s); };
  const cancel = () => {
    if (!current) return;
    const c = current;
    current = null;
    endAll();
    c.stop(new CancelledError());
  };
  return {
    cancel,
    make(request) {
      cancel();
      const id = nextId++;
      const listeners: ((p: Progress) => void)[] = [];
      let settleJob: { resolve: (m: Made) => void; reject: (e: Error) => void } = { resolve: () => {}, reject: () => {} };
      const result = new Promise<Made>((resolve, reject) => { settleJob = { resolve, reject }; });
      result.catch(() => {});
      const mine = () => current?.id === id;
      const finish = (f: () => void) => { if (!mine()) return; current = null; for (const s of slots) s.busy = null; f(); };
      current = { id, stop: e => settleJob.reject(e) };
      const fail = (message: string) => finish(() => { endAll(); settleJob.reject(new Error(message)); });

      const first = request.depth <= 1 || request.run.length === 0;
      const { parts, budget } = partsOf(request);
      const results: (Part | undefined)[] = [];
      /** Each running part's progress, and what the finished ones spent. */
      const live = new Map<number, Progress>();
      let nextPart = 0;
      /** The lowest part that has found a level so far. */
      let found = Infinity;

      const report = () => {
        let spent = 0, tries = 0;
        results.forEach(r => { if (r) { spent += r.spent; tries += r.tries; } });
        for (const p of live.values()) { spent += p.spent; tries += p.tries; }
        const p: Progress = { tries, spent, budget: parts * budget };
        for (const cb of listeners) cb(p);
      };
      const slot = (): Slot | null => {
        const idle = slots.find(s => s.busy === null);
        if (idle) return idle;
        if (slots.length >= Math.max(1, size())) return null;
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
      const bank = () => {
        const s = slot();
        if (!s) return;
        let tries = 0, spent = 0;
        results.forEach(r => { if (r) { tries += r.tries; spent += r.spent; } });
        send(s, { type: 'bank', id, request, tries, spent }, -1);
      };
      /** Hands the next parts to idle workers, while one could still be the answer. */
      const pump = () => {
        if (!mine()) return;
        while (nextPart < Math.min(parts, found)) {
          const s = slot();
          if (!s) return;
          send(s, { type: 'part', id, request, part: nextPart }, nextPart);
          nextPart++;
        }
      };
      function receive(s: Slot, m: FromEndless): void {
        if (!mine() || m.id !== id) return;
        if (m.type === 'progress') { if (s.busy !== null && s.busy >= 0) { live.set(s.busy, m.progress); report(); } return; }
        if (m.type === 'failed') { fail(m.message); return; }
        if (m.type === 'made') { finish(() => settleJob.resolve(m.made)); return; }
        s.busy = null;
        live.delete(m.part);
        results[m.part] = m.result;
        if (m.result.found && m.part < found) {
          found = m.part;
          // The parts above it can no longer be the answer: their workers are ended.
          for (const o of [...slots]) if (o.busy !== null && o.busy > found) { live.delete(o.busy); end(o); }
        }
        report();
        const settled = settle(results, parts);
        if (settled.made) { const made = settled.made; finish(() => settleJob.resolve(made)); return; }
        if (settled.done) { bank(); return; }
        pump();
      }

      onMessage = receive;
      onError = s => { if (s.busy !== null && mine()) fail('the level worker failed'); };
      if (first) bank();
      else pump();
      return {
        progress: cb => { listeners.push(cb); },
        cancel: () => { if (mine()) cancel(); },
        result,
      };
    },
  };
}
