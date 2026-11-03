/* The Island of Crete: the page's side of Endless's worker (src/endless-worker.ts). `make(request)` asks for a run's
 * level and returns a job: its progress, its answer, and `cancel()`, which ends the worker at once (the generator
 * runs straight through, so it cannot be told to stop) and rejects the answer with CancelledError. One job runs at a
 * time: a new one cancels the one before it. A worker that fails rejects its job; the next job starts a fresh
 * worker. The page never waits on the search. */
import type { Made, Progress, Request } from './generate.ts';
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

export function createEndlessClient(spawn: () => WorkerLike): EndlessClient {
  let worker: WorkerLike | null = null;
  let current: { id: number; reject: (e: Error) => void } | null = null;
  let nextId = 1;
  const end = () => {
    try { worker?.terminate(); } catch { /* gone either way */ }
    worker = null;
  };
  const cancel = () => {
    if (!current) return;
    const c = current;
    current = null;
    end();
    c.reject(new CancelledError());
  };
  return {
    cancel,
    make(request) {
      cancel();
      const id = nextId++;
      const listeners: ((p: Progress) => void)[] = [];
      let settle: { resolve: (m: Made) => void; reject: (e: Error) => void } = { resolve: () => {}, reject: () => {} };
      const result = new Promise<Made>((resolve, reject) => { settle = { resolve, reject }; });
      result.catch(() => {});
      current = { id, reject: e => settle.reject(e) };
      try {
        worker ??= spawn();
      } catch (e) {
        current = null;
        settle.reject(new Error(`the level worker could not start: ${e instanceof Error ? e.message : String(e)}`));
        return { progress() {}, cancel() {}, result };
      }
      const w = worker;
      w.onmessage = e => {
        const m = e.data as FromEndless;
        if (!current || m.id !== current.id || m.id !== id) return;
        if (m.type === 'progress') { for (const cb of listeners) cb(m.progress); return; }
        current = null;
        if (m.type === 'made') settle.resolve(m.made);
        else settle.reject(new Error(m.message));
      };
      w.onerror = () => {
        if (current?.id !== id) return;
        current = null;
        end();
        settle.reject(new Error('the level worker failed'));
      };
      w.postMessage({ type: 'make', id, request } satisfies ToEndless);
      return {
        progress: cb => { listeners.push(cb); },
        cancel: () => { if (current?.id === id) cancel(); },
        result,
      };
    },
  };
}
