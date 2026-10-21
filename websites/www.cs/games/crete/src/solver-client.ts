/* The Island of Crete: the page's side of the solver's worker (solver-worker.ts, running solver-host.ts). Start a
 * search on a level's text, follow its progress, stop and resume it, await its answer; the page never blocks on
 * it. One worker serves every search, and a new search cancels the one before it (its answer rejects). The game's
 * thread help does not use this: it solves in the page (game.ts). */
import type { Answer, FromHost, Report, SearchKind, ToHost } from './solver-host.ts';

export type { SearchKind } from './solver-host.ts';

/** What the client needs of a Worker. */
export interface WorkerLike {
  postMessage(m: unknown): void;
  onmessage: ((e: { data: unknown }) => void) | null;
  onerror?: ((e: unknown) => void) | null;
}

export interface SolverJob {
  progress(cb: (p: Report) => void): void;
  stop(): void;
  resume(): void;
  result: Promise<Answer>;
}

interface Pending { report(p: Report): void; settle(m: FromHost): void }

const routes = new WeakMap<WorkerLike, Map<number, Pending>>();
let nextId = 1;
let shared: WorkerLike | null = null;

/** The worker's bundle sits beside this one (dist/); it carries this bundle's version query. */
function solverWorker(): WorkerLike {
  shared ??= new Worker(new URL(`solver-worker.js${new URL(import.meta.url).search}`, import.meta.url)) as WorkerLike;
  return shared;
}

/** The searches under way on `worker`, by id; the first call takes over its onmessage and onerror. */
function routesOf(worker: WorkerLike): Map<number, Pending> {
  let map = routes.get(worker);
  if (!map) {
    const m = new Map<number, Pending>();
    map = m;
    routes.set(worker, m);
    worker.onmessage = e => {
      const msg = e.data as FromHost;
      const p = m.get(msg.id);
      if (!p) return;
      if (msg.type === 'progress') p.report(msg.report);
      else { m.delete(msg.id); p.settle(msg); }
    };
    if ('onerror' in worker) {
      worker.onerror = () => {
        for (const [id, p] of m) p.settle({ type: 'failed', id, message: 'the solver worker failed to run' });
        m.clear();
      };
    }
  }
  return map;
}

export function startSearch(levelText: string, kind: SearchKind, worker: WorkerLike = solverWorker()): SolverJob {
  const id = nextId++;
  const listeners: ((p: Report) => void)[] = [];
  const send = (m: ToHost) => worker.postMessage(m);
  const result = new Promise<Answer>((resolve, reject) => {
    routesOf(worker).set(id, {
      report: p => { for (const cb of listeners) cb(p); },
      settle: m => {
        if (m.type === 'result') resolve(m.result);
        else if (m.type === 'failed') reject(new Error(m.message));
      },
    });
  });
  // A search nobody awaits (one a newer search cancelled) must not surface as an unhandled rejection.
  result.catch(() => {});
  send({ type: 'start', id, text: levelText, kind });
  return {
    progress: cb => { listeners.push(cb); },
    stop: () => send({ type: 'stop', id }),
    resume: () => send({ type: 'resume', id }),
    result,
  };
}
