/* The Island of Crete: checking shared Endless levels in the background. While the page is otherwise idle (`allow`),
 * the verifier claims one level waiting on the shared bank, runs the one part of the search its tuple names in an
 * Endless worker of its own (src/endless/host.ts's 'part' message), and sends back what that part made; the server
 * compares it with what the uploader sent (src/endless/provenance.ts). It stops at once, ending its worker, when the
 * page stops allowing it; the claim's ticket then simply expires. It waits WAIT_MS between claims, and IDLE_MS after
 * the bank has nothing to check. DOM-free. */
import { workersNow } from './client.ts';
import type { Standing, WorkerLike } from './client.ts';
import type { FromEndless, ToEndless } from './host.ts';
import type { Part } from './generate.ts';
import { ENDLESS_VERSION, requestOf, sharedOf } from './provenance.ts';
import type { SharedMade, Tuple } from './provenance.ts';

export const WAIT_MS = 60_000;
export const IDLE_MS = 10 * 60_000;

/** Where the page stands for checking others' levels: Endless's background terms, whether Endless's own levels are
 *  all made, the Help Check Endless Levels setting, Do Not Track, and a browser spec's budget. */
export interface CheckStanding extends Standing { endlessIdle: boolean; on: boolean; sendsNothing: boolean; specBudget: boolean }

/** A check may run: the setting is on, the page sends, outside an Endless run, on the background worker's terms (one
 *  worker, after the quiet start, while the tab shows, the solver idle, the battery not low and draining), and only
 *  once Endless has nothing of its own to make, so the two take turns and never run together. */
export function mayCheck(s: CheckStanding): boolean {
  return s.on && !s.sendsNothing && !s.specBudget && !s.run && s.endlessIdle && workersNow(s, 1) > 0;
}

export interface VerifierDeps {
  spawn(): WorkerLike;
  claim(version: number): Promise<{ ticket: string; tuple: Tuple } | null>;
  send(ticket: string, found: SharedMade | null): Promise<void>;
  now(): number;
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(id: unknown): void;
}

export interface Verifier {
  /** Whether the page leaves room for a check now; checks start or stop to match. */
  allow(ok: boolean): void;
  /** A check is under way (claiming, or its part running). */
  busy(): boolean;
}

/** A tuple in the shape the generator takes, or null for anything else (the server checks it too). */
export function tupleShape(v: unknown): Tuple | null {
  if (typeof v !== 'object' || v === null) return null;
  const t = v as Record<string, unknown>;
  const int = (x: unknown, a: number, b: number) => Number.isInteger(x) && (x as number) >= a && (x as number) <= b;
  const played = (p: unknown) => typeof p === 'object' && p !== null && typeof (p as Record<string, unknown>).text === 'string'
    && int((p as Record<string, unknown>).explored, 0, 1e7) && int((p as Record<string, unknown>).score, 0, 1e4);
  if (!int(t.v, 1, 1e6) || typeof t.seed !== 'string' || !/^[a-z0-9-]{1,32}$/.test(t.seed) || !int(t.tier, 1, 10)
    || !['easy', 'medium', 'hard'].includes(t.grade as string) || !int(t.depth, 2, 1e5) || !int(t.k, 0, 63)
    || !Array.isArray(t.run) || t.run.length < 1 || t.run.length > 13 || !t.run.every(played)) return null;
  return t as unknown as Tuple;
}

export function createVerifier(deps: VerifierDeps): Verifier {
  let allowed = false;
  /** The check under way: its worker once its part runs. */
  let current: { worker: WorkerLike | null; stopped: boolean } | null = null;
  let nextAt = 0;
  let timer: unknown = null;

  const wake = () => {
    if (timer !== null) { deps.clearTimeout(timer); timer = null; }
    if (!allowed || current) return;
    const wait = nextAt - deps.now();
    if (wait > 0) { timer = deps.setTimeout(() => { timer = null; wake(); }, wait); return; }
    void check();
  };
  const stop = () => {
    if (!current) return;
    current.stopped = true;
    try { current.worker?.terminate(); } catch { /* gone either way */ }
    current = null;
  };
  async function check(): Promise<void> {
    const mine = { worker: null as WorkerLike | null, stopped: false };
    current = mine;
    nextAt = deps.now() + WAIT_MS;
    const claimed = await deps.claim(ENDLESS_VERSION);
    if (mine.stopped) return;
    const tuple = tupleShape(claimed?.tuple);
    if (!claimed || !tuple || tuple.v !== ENDLESS_VERSION) {
      if (!claimed) nextAt = deps.now() + IDLE_MS;
      current = null;
      wake();
      return;
    }
    let found: SharedMade | null | undefined;
    try {
      found = await new Promise<SharedMade | null | undefined>(resolve => {
        const worker = deps.spawn();
        mine.worker = worker;
        worker.onmessage = e => {
          const m = e.data as FromEndless;
          if (m.type === 'part') {
            const f = (m.result as Part).found;
            try { resolve(f ? sharedOf(f) : null); } catch { resolve(null); }
          } else if (m.type === 'failed') resolve(undefined);
        };
        worker.onerror = () => resolve(undefined);
        const msg: ToEndless = { type: 'part', id: 1, request: requestOf(tuple), part: tuple.k };
        worker.postMessage(msg);
      });
    } catch { found = undefined; }
    if (mine.stopped) return;
    try { mine.worker?.terminate(); } catch { /* gone either way */ }
    current = null;
    // A worker that broke or failed says nothing about the level: no verdict, and the ticket expires.
    if (found !== undefined) await deps.send(claimed.ticket, found);
    wake();
  }

  return {
    allow(ok) {
      allowed = ok;
      if (!ok) { stop(); if (timer !== null) { deps.clearTimeout(timer); timer = null; } return; }
      wake();
    },
    busy: () => current !== null,
  };
}
