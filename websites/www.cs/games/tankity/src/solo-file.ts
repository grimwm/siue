/* Operation Tankity: sending a solo run to the score server.
 *
 * A run is started on the server when it is dealt, each round goes as it ends
 * (the server plays it and keeps the result), and the run files when the match
 * is over. Everything waits in this browser's storage until scores.php takes
 * it, in order. The server's answers fall in four kinds:
 *   - taken: the next step goes on;
 *   - wait: offline, rate-limited (429) or busy (503). The run keeps its place
 *     and no try is spent, however long it lasts: a class behind one address
 *     must not lose its runs to a busy hour;
 *   - fail: any other 5xx, an unreadable reply, a stale CSRF token. The run
 *     waits for the next try and is dropped after MAX_TRIES in a row;
 *   - refused: voided, expired, unknown, or a malformed request. The run is
 *     dropped with the reason.
 * A filing asked twice (its reply lost) names the same run, and the server
 * answers the stored reply, so a retry never files a second score.
 * Fetch and storage arrive as arguments. */
import type { StorageLike } from '../../_kit/ports.ts';
import { json, pref } from '../../_kit/prefs.ts';
import { isDifficulty } from './difficulty.ts';
import { fieldWidthOk } from './sim.ts';
import type { Difficulty } from './sim.ts';
import { isRoundLog } from './solo-log.ts';
import type { SoloRoundLog } from './solo-log.ts';

export interface PendingRun {
  id: string; seed: string; difficulty: Difficulty; w: number; run: string | null;
  rounds: SoloRoundLog[]; initials: string | null; tries: number;
}
export type FileOutcome =
  | { id: string; kind: 'filed'; score: number; rank: number | null; difficulty: Difficulty }
  | { id: string; kind: 'refused'; why: string }
  | { id: string; kind: 'waiting' };
interface FetchLike { method?: string; headers?: Record<string, string>; body?: string; credentials?: 'same-origin' }
export interface FilerEnv {
  fetch(url: string, init?: FetchLike): Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;
  storage: StorageLike | null;
}

export const PENDING_KEY = 'tankity-pending-runs';
export const PENDING_MAX = 3;
export const MAX_TRIES = 5;
/** The pause, in ms, before the next try after the server first said wait; it doubles up to the cap. */
export const BACKOFF_FIRST = 2000;
export const BACKOFF_MAX = 5 * 60 * 1000;
const URL = 'scores.php';

function isPendingRuns(v: unknown): v is PendingRun[] {
  return Array.isArray(v) && v.every(r => r && typeof r === 'object' && typeof r.id === 'string' && typeof r.seed === 'string'
    && isDifficulty(r.difficulty) && fieldWidthOk(r.w) && (r.run === null || typeof r.run === 'string') && Array.isArray(r.rounds) && r.rounds.every(isRoundLog)
    && (r.initials === null || typeof r.initials === 'string') && typeof r.tries === 'number');
}

/** Why the server dropped a run, in the end card's words; null when it did not. */
function why(status: number, data: Record<string, unknown>): string | null {
  if (status === 422 && data['error'] === 'void') return 'the server played that round differently';
  if (status === 409 && data['error'] === 'void') return 'the server played a round differently';
  if (status === 410) return 'it waited too long to reach the score server';
  if (status === 404) return 'the score server no longer has it';
  if (status === 400 || status === 413 || status === 422) return String(data['error'] || 'refused');
  return null;
}

/** The server (or the network) said wait: nothing is spent. */
class Wait extends Error {}
/** A try failed and counts. */
class Fail extends Error {}
/** The run is over for good. */
class Refused extends Error {}

export function createFiler(env: FilerEnv) {
  const stored = pref<PendingRun[]>(PENDING_KEY, [], json(isPendingRuns), env.storage);
  // Runs in hand stay here too, so blocked storage still sends this session's run.
  let held: PendingRun[] = stored.get();
  let busy: Promise<FileOutcome[]> | null = null;
  let lag = 0; // passes in a row the server said wait
  const save = (runs: PendingRun[]): void => { held = runs; stored.set(runs); };
  const update = (id: string, fn: (r: PendingRun) => PendingRun): void => save(held.map(r => (r.id === id ? fn(r) : r)));
  const find = (id: string): PendingRun | undefined => held.find(r => r.id === id);

  function begin(id: string, seed: string, difficulty: Difficulty, w: number): void {
    save([...held.filter(r => r.id !== id), { id, seed, difficulty, w, run: null, rounds: [], initials: null, tries: 0 }].slice(-PENDING_MAX));
  }
  function round(id: string, log: SoloRoundLog): void {
    update(id, r => ({ ...r, rounds: [...r.rounds, log] }));
  }
  function finish(id: string, initials: string): void {
    update(id, r => ({ ...r, initials }));
  }

  /* One POST: its body when the server took it; otherwise it throws what the
     answer means. `skip` says a 409 out of order that the run is already past. */
  async function post(csrf: string, body: unknown, skip?: (data: Record<string, unknown>) => boolean): Promise<Record<string, unknown>> {
    let status: number;
    let data: Record<string, unknown>;
    try {
      const res = await env.fetch(URL, {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-Tankity-Csrf': csrf }, body: JSON.stringify(body),
      });
      status = res.status;
      data = ((await res.json().catch(() => null)) || {}) as Record<string, unknown>;
    } catch (_) {
      throw new Wait('offline');
    }
    if (status === 429 || status === 503) throw new Wait(String(status));
    if (status === 200) return data;
    if (status === 409 && data['error'] === 'out of order' && skip?.(data)) return data;
    const refused = why(status, data);
    if (refused) throw new Refused(refused);
    throw new Fail(String(status));
  }

  /* Takes one run as far as the server allows. Null: it has nothing to report
     (still being played, all sent). Throws Wait, Fail or Refused. */
  async function sendOne(id: string, csrf: string): Promise<FileOutcome | null> {
    let r = find(id);
    if (!r) return null;
    // The server expires a run that never played a round within minutes: start it only with a round to send.
    if (!r.run && !r.rounds.length) return null;
    if (!r.run) {
      const started = await post(csrf, { op: 'start', seed: r.seed, difficulty: r.difficulty, w: r.w });
      if (typeof started['run'] !== 'string') throw new Fail('start');
      update(id, x => ({ ...x, run: started['run'] as string, tries: 0 }));
      r = find(id)!;
    }
    while (r.rounds.length) {
      const next = r.rounds[0]!;
      await post(csrf, { op: 'round', run: r.run, ...next }, data => Number(data['round']) >= next.n);
      update(id, x => ({ ...x, rounds: x.rounds.slice(1), tries: 0 }));
      r = find(id)!;
    }
    if (!r.initials) return null;
    const filed = await post(csrf, { op: 'file', run: r.run, initials: r.initials });
    if (!filed['ok']) throw new Fail('file');
    save(held.filter(x => x.id !== id));
    return {
      id, kind: 'filed', score: Number(filed['score']),
      rank: typeof filed['rank'] === 'number' ? filed['rank'] : null,
      difficulty: isDifficulty(filed['difficulty']) ? filed['difficulty'] : r.difficulty,
    };
  }

  /* The CSRF token for this pass; throws Wait when the server cannot give one. */
  async function token(): Promise<string> {
    let res: Awaited<ReturnType<FilerEnv['fetch']>>;
    try {
      res = await env.fetch(URL, { credentials: 'same-origin' });
    } catch (_) {
      throw new Wait('offline');
    }
    const data = (await res.json().catch(() => null)) as { csrf?: unknown } | null;
    if (!res.ok || !data || typeof data.csrf !== 'string') throw new Wait(String(res.status));
    return data.csrf;
  }

  /* The outcome a run answers when its pass was cut short: nothing for a run
     still being played, waiting for one that is over. */
  const pending = (id: string): FileOutcome | null => (find(id)?.initials ? { id, kind: 'waiting' } : null);

  async function flushNow(): Promise<FileOutcome[]> {
    if (!held.length) return [];
    const out: FileOutcome[] = [];
    let waited = false;
    let csrf = '';
    try {
      csrf = await token();
    } catch (_) {
      waited = true;
    }
    for (const { id } of [...held]) {
      let o: FileOutcome | null;
      if (waited) {
        // The server said wait: the other runs share its address, so none asks again this pass.
        o = pending(id);
      } else {
        try {
          o = await sendOne(id, csrf);
        } catch (e) {
          if (e instanceof Refused) {
            save(held.filter(x => x.id !== id));
            o = { id, kind: 'refused', why: e.message };
          } else if (e instanceof Wait) {
            waited = true;
            o = pending(id);
          } else if ((find(id)?.tries ?? 0) + 1 >= MAX_TRIES) {
            save(held.filter(x => x.id !== id));
            o = { id, kind: 'refused', why: 'the score server kept failing' };
          } else {
            update(id, x => ({ ...x, tries: x.tries + 1 }));
            o = pending(id);
          }
        }
      }
      if (o) out.push(o);
    }
    lag = waited ? lag + 1 : 0;
    return out;
  }

  /** Sends everything waiting; concurrent calls share one attempt. */
  function flush(): Promise<FileOutcome[]> {
    if (!busy) busy = flushNow().finally(() => { busy = null; });
    return busy;
  }

  /** Milliseconds to leave before the next flush: 0 when the last pass was not told to wait. */
  function backoff(): number {
    return lag ? Math.min(BACKOFF_MAX, BACKOFF_FIRST * 2 ** Math.min(lag - 1, 20)) : 0;
  }

  return { begin, round, finish, flush, waiting: () => held.length, backoff };
}
