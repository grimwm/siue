/* Operation Tankity: sending a solo run to the score server.
 *
 * A run is started on the server when its first round is sent, each round goes
 * as it ends (the server plays it and keeps the result), and the run files
 * when the match is over. Everything waits in this browser's storage until
 * scores.php takes it, in order. The server's answers fall in five kinds:
 *   - taken: the next step goes on;
 *   - wait: offline, rate-limited (429) or busy (503). No try is spent,
 *     however long it lasts: a class behind one address must not lose its runs;
 *   - fail: any other 5xx, an unreadable reply, a CSRF token not given or stale. A try is
 *     spent, and the run is dropped after MAX_TRIES in a row;
 *   - gone: the server expired or forgot the run (410/404). Every round is kept,
 *     so the run starts again and replays them, at most MAX_RESTARTS times;
 *   - refused: voided or malformed. The run is dropped with the reason.
 * After a pass that waited or failed, flush() sends nothing until nextTry()
 * has passed. That time is stored with the queue, so a reload or another tab
 * cannot spend tries faster, and a short outage cannot use them all. A filing
 * asked twice names the same run, and the server answers the stored reply, so a
 * retry never files a second score; a run that may have filed is never started
 * again. Every tab holds the whole queue; with Web Locks one pass runs at a time.
 * Fetch, storage, locks, clock and rng arrive as arguments. */
import type { Clock, Rng, StorageLike } from '../../_kit/ports.ts';
import { isDifficulty } from './difficulty.ts';
import { fieldWidthOk } from './sim.ts';
import type { Difficulty } from './sim.ts';
import { isRoundLog } from './solo-log.ts';
import type { SoloRoundLog } from './solo-log.ts';

export interface PendingRun {
  id: string; seed: string; difficulty: Difficulty; w: number;
  /** The server's run; null before the first start and after a restart. */
  run: string | null;
  /** Every round played, kept so an expired run can be replayed; the first `sent` went to `run`. */
  rounds: SoloRoundLog[]; sent: number;
  initials: string | null; tries: number; restarts: number;
  /** A file request went out for `run`: a later 410/404 may mean filed and aged out, so no restart. */
  fileAsked: boolean;
  /** The server told this run to wait (429/503) since it last went on: a restart after that is not counted. */
  waited?: boolean;
}
export type FileOutcome =
  | { id: string; kind: 'filed'; score: number; rank: number | null; difficulty: Difficulty }
  /** `detail` is the server's own error text, for the console, not the player. */
  | { id: string; kind: 'refused'; why: string; detail?: string }
  /** The filing went out but its answer never came back, and the server has since let the run go. */
  | { id: string; kind: 'sent' }
  | { id: string; kind: 'waiting' };
interface FetchLike { method?: string; headers?: Record<string, string>; body?: string; credentials?: 'same-origin'; signal?: unknown }
/** navigator.locks, or a stand-in: an exclusive lock held while `fn` runs. */
export interface LocksLike { request<T>(name: string, fn: () => Promise<T>): Promise<T> }
export interface FilerEnv {
  fetch(url: string, init?: FetchLike): Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;
  storage: StorageLike | null;
  locks?: LocksLike | null;
  clock?: Clock;
  rng?: Rng;
}
/** Why the next try waits: offline (wake() may cut it short), told to wait (429/503), or failing. */
type Cause = 'offline' | 'busy' | 'fail' | null;
interface Timing { dueAt: number; lag: number; cause: Cause }
const NO_WAIT: Timing = { dueAt: 0, lag: 0, cause: null };

export const PENDING_KEY = 'tankity-pending-runs';
export const PENDING_MAX = 5;
/** Backed-off tries in a row before a failing run is dropped: about four minutes of failures. */
export const MAX_TRIES = 8;
export const MAX_RESTARTS = 2;
/** The pause, in ms, after the first pass that waited or failed; it doubles up to the cap, then ±25%. */
export const BACKOFF_FIRST = 2000;
export const BACKOFF_MAX = 5 * 60 * 1000;
/** The longest pause there can be: the cap with its jitter. A stored next try further off than this is clamped. */
export const BACKOFF_LONGEST = BACKOFF_MAX * 1.25;
/** How long one request may take before it counts as no answer (offline). */
export const FETCH_TIMEOUT = 30_000;
/** Outcomes kept in the shared queue, by id, so the tab whose card a run belongs to hears how it went. */
const ENDS_KEEP = 20;
const URL = 'scores.php';

const count = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0;
function isPendingRun(r: any): r is PendingRun {
  return !!r && typeof r === 'object' && typeof r.id === 'string' && typeof r.seed === 'string'
    && isDifficulty(r.difficulty) && fieldWidthOk(r.w) && (r.run === null || typeof r.run === 'string')
    && Array.isArray(r.rounds) && r.rounds.every(isRoundLog) && count(r.sent) && r.sent <= r.rounds.length
    && (r.initials === null || typeof r.initials === 'string') && count(r.tries) && count(r.restarts)
    && typeof r.fileAsked === 'boolean' && (r.waited === undefined || typeof r.waited === 'boolean');
}
/** An outcome another tab may be waiting for, with when it came. */
interface Ended { o: FileOutcome; at: number }
const isEnded = (e: any): e is Ended => !!e && typeof e === 'object' && Number.isFinite(e.at) && !!e.o && typeof e.o === 'object'
  && typeof e.o.id === 'string' && ['filed', 'refused', 'sent'].includes(e.o.kind);
type Queue = { runs: PendingRun[]; ends: Ended[] } & Timing;
/* The stored queue: its runs (one unreadable run is left out, not the rest), the latest outcomes, and when
   the next try is due, never further off than the longest pause (a clock that jumped back, a stray value). */
function parseQueue(raw: string, now: number): Queue | null {
  const v: any = JSON.parse(raw);
  if (!v || typeof v !== 'object' || !Array.isArray(v.runs)) return null;
  const cause: Cause = ['offline', 'busy', 'fail'].includes(v.cause) ? v.cause : null;
  return {
    runs: v.runs.filter(isPendingRun), ends: Array.isArray(v.ends) ? v.ends.filter(isEnded) : [],
    dueAt: Number.isFinite(v.dueAt) ? Math.min(v.dueAt, now + BACKOFF_LONGEST) : 0, lag: count(v.lag) ? v.lag : 0, cause,
  };
}

/** `fetch` with a deadline on every request: AbortSignal.timeout, or an AbortController and a timer where
    that is missing (older Safari). A request past it is aborted, which the filer reads as no answer (offline). */
export function timedFetch(fetch: FilerEnv['fetch'], ms = FETCH_TIMEOUT): FilerEnv['fetch'] {
  const g = globalThis as any;
  if (typeof g.AbortSignal?.timeout === 'function') return (url, init) => fetch(url, { ...init, signal: g.AbortSignal.timeout(ms) });
  if (typeof g.AbortController !== 'function') return fetch;
  return (url, init) => {
    const ctl = new g.AbortController();
    const timer = g.setTimeout(() => ctl.abort(), ms);
    return fetch(url, { ...init, signal: ctl.signal }).finally(() => g.clearTimeout(timer));
  };
}

/** Why the server dropped a run, in the end card's words; null when it did not. */
function why(status: number, op: string, data: Record<string, unknown>): string | null {
  if (status === 422 && data['error'] === 'void') return 'the server played that round differently';
  if (status === 409 && data['error'] === 'void') return 'the server played a round differently';
  if (status === 410) return 'it waited too long to reach the score server';
  if (status === 404) return 'the score server no longer has it';
  if (status === 413) return 'it was too big to send';
  if (status === 400) return 'the score server could not read it';
  if (status === 422) return op === 'file' ? 'the score server would not take those initials' : 'the score server would not take it';
  return null;
}

/** The server (or the network) said wait: nothing is spent. `net`: no answer came at all. */
class Wait extends Error {
  readonly net: boolean;
  constructor(why: string, net = false) {
    super(why);
    this.net = net;
  }
}
/** A try failed and counts. */
class Fail extends Error {}
/** The run is over for good. */
class Refused extends Error {
  readonly detail: string | undefined;
  constructor(why: string, detail?: string) {
    super(why);
    this.detail = detail;
  }
}
/** The server no longer holds the run (410/404); a run that never asked to file may start again. */
class Gone extends Refused {}

/* Two copies of one run (this tab's and storage's) to one: rounds only grow, so
   the longer list wins; the server-side progress comes from the copy further on.
   Two tabs that started the same run at once agree on the smaller run id. */
function mergeRun(a: PendingRun, b: PendingRun): PendingRun {
  const rank = (r: PendingRun): number[] => [r.restarts, r.run ? 1 : 0, r.sent, r.fileAsked ? 1 : 0];
  const ra = rank(a);
  const rb = rank(b);
  const i = ra.findIndex((v, k) => v !== rb[k]);
  const ahead = i >= 0 ? (ra[i]! > rb[i]! ? a : b) : (b.run ?? '') < (a.run ?? '') ? b : a;
  return { ...ahead, rounds: a.rounds.length >= b.rounds.length ? a.rounds : b.rounds, initials: a.initials ?? b.initials };
}

export function createFiler(env: FilerEnv) {
  const now = (): number => (env.clock ? env.clock.now() : Date.now());
  const rng = env.rng ?? Math.random;
  /* Storage is read again before every write and merged by id, so two tabs
     never erase each other's runs; the kit's pref keeps one copy per tab. */
  function readDisk(): Queue | null {
    if (!env.storage) return null;
    try {
      const raw = env.storage.getItem(PENDING_KEY);
      return raw == null ? { runs: [], ends: [], ...NO_WAIT } : parseQueue(raw, now());
    } catch {
      return null;
    }
  }
  function writeDisk(runs: PendingRun[]): boolean {
    if (!env.storage) return false;
    try {
      env.storage.setItem(PENDING_KEY, JSON.stringify({ runs, ...timing, ends }));
      return true;
    } catch {
      return false;
    }
  }

  // Runs in hand stay here too, so blocked storage still sends this session's runs.
  const first = readDisk();
  let held: PendingRun[] = first?.runs ?? [];
  let timing: Timing = first ? { dueAt: first.dueAt, lag: first.lag, cause: first.cause } : NO_WAIT;
  let kept = env.storage !== null;
  let ends: Ended[] = first?.ends ?? [];
  const seen = new Set(held.map(r => r.id)); // ids storage has held
  const live = new Set<string>(); // begun here and still being played
  /* Filed here: never taken back from storage. A run evicted or dropped is not
     tombstoned, so a tab still playing it puts it back and files it. */
  const gone = new Set<string>();
  let busy: Promise<FileOutcome[]> | null = null;

  function save(change: (runs: PendingRun[]) => PendingRun[] = r => r, retime?: (t: Timing) => Timing): void {
    const disk = readDisk();
    if (disk) {
      timing = { dueAt: disk.dueAt, lag: disk.lag, cause: disk.cause };
      ends = mergeEnds(disk.ends, ends);
      const ours = new Map(held.map(r => [r.id, r]));
      const next: PendingRun[] = [];
      for (const d of disk.runs) {
        seen.add(d.id);
        if (gone.has(d.id)) continue;
        const h = ours.get(d.id);
        next.push(h ? mergeRun(h, d) : d);
        ours.delete(d.id);
      }
      // Held here, missing from storage: new here, or another tab filed or dropped it.
      for (const h of ours.values()) if (live.has(h.id) || !seen.has(h.id)) next.push(h);
      held = next;
    }
    held = change(held);
    if (retime) timing = retime(timing);
    kept = writeDisk(held);
    if (kept) for (const r of held) seen.add(r.id);
  }
  const update = (id: string, fn: (r: PendingRun) => PendingRun): void => save(runs => runs.map(r => (r.id === id ? fn(r) : r)));
  const remove = (id: string, filed = false): void => {
    if (filed) gone.add(id);
    live.delete(id);
    save(runs => runs.filter(r => r.id !== id));
  };
  const find = (id: string): PendingRun | undefined => held.find(r => r.id === id);
  /* Both lists of outcomes as one: one per id, the latest ENDS_KEEP. */
  function mergeEnds(a: Ended[], b: Ended[]): Ended[] {
    const byId = new Map<string, Ended>();
    for (const e of [...a, ...b]) byId.set(e.o.id, e);
    return [...byId.values()].sort((x, y) => x.at - y.at).slice(-ENDS_KEEP);
  }

  /** Holds a new run. False when it is not held (the id is taken, or every slot holds a
      finished run still to file): the caller says so before the match, as it will not be filed. */
  function begin(id: string, seed: string, difficulty: Difficulty, w: number): boolean {
    let ok = false;
    save(runs => {
      if (gone.has(id) || runs.some(r => r.id === id)) return runs;
      // Only a run nobody can finish may make room: no initials, not being played here.
      const abandoned = runs.filter(r => r.initials === null && !live.has(r.id));
      const evict = abandoned.slice(0, Math.max(0, runs.length + 1 - PENDING_MAX));
      if (runs.length - evict.length >= PENDING_MAX) return runs;
      ok = true;
      live.add(id);
      return [...runs.filter(r => !evict.includes(r)),
        { id, seed, difficulty, w, run: null, rounds: [], sent: 0, initials: null, tries: 0, restarts: 0, fileAsked: false }];
    });
    return ok;
  }
  function round(id: string, log: SoloRoundLog): void {
    update(id, r => ({ ...r, rounds: [...r.rounds, log] }));
  }
  function finish(id: string, initials: string): void {
    update(id, r => ({ ...r, initials }));
    live.delete(id);
  }
  /** Lets go of a run that will never finish (quit, Play again mid-match). A finished run is
      never dropped: false then, and for an id not held. A tab still playing it keeps it. */
  function drop(id: string): boolean {
    const r = find(id);
    if (!r || r.initials !== null) return false;
    remove(id);
    return true;
  }

  /** Held runs nobody can finish here: no initials and not being played by this page. At load
      that is every unfinished run, as the page that played it is gone. */
  function abandoned(): string[] {
    save();
    return held.filter(r => r.initials === null && !live.has(r.id)).map(r => r.id);
  }

  /* One POST: its body when the server took it; otherwise it throws what the
     answer means. `skip` says a 409 out of order that the run is already past. */
  async function post(csrf: string, body: { op: string } & Record<string, unknown>, skip?: (data: Record<string, unknown>) => boolean): Promise<Record<string, unknown>> {
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
      throw new Wait('offline', true);
    }
    if (status === 429 || status === 503) throw new Wait(String(status));
    if (status === 200) return data;
    if (status === 409 && data['error'] === 'out of order' && skip?.(data)) return data;
    const refused = why(status, body.op, data);
    const detail = typeof data['error'] === 'string' ? data['error'] : undefined;
    if (refused) throw status === 410 || status === 404 ? new Gone(refused, detail) : new Refused(refused, detail);
    throw new Fail(String(status));
  }

  /* Takes one run as far as the server allows. Null: it has nothing to report
     (still being played, all sent, or gone from this tab). Throws Wait, Fail or Refused. */
  async function sendOne(id: string, csrf: string): Promise<FileOutcome | null> {
    for (;;) {
      let r = find(id);
      if (!r) return null;
      if (!r.rounds.length) {
        if (r.initials) throw new Refused('no round of it was played');
        return null;
      }
      try {
        if (!r.run) {
          let started: Record<string, unknown>;
          try {
            started = await post(csrf, { op: 'start', seed: r.seed, difficulty: r.difficulty, w: r.w });
          } catch (e) {
            // A run not yet started has nothing to lose to a restart.
            throw e instanceof Gone ? new Refused(e.message, e.detail) : e;
          }
          if (typeof started['run'] !== 'string') throw new Fail('start');
          update(id, x => ({ ...x, run: started['run'] as string, sent: 0, fileAsked: false, tries: 0, waited: false }));
          r = find(id);
          if (!r) return null;
        }
        while (r.sent < r.rounds.length) {
          const { run, sent } = r;
          const next = r.rounds[sent]!;
          await post(csrf, { op: 'round', run, ...next }, data => Number(data['round']) >= next.n);
          update(id, x => (x.run === run ? { ...x, sent: Math.max(x.sent, sent + 1), tries: 0, waited: false } : x));
          r = find(id);
          if (!r) return null;
        }
        if (!r.initials) return null;
        const { run, fileAsked: asked } = r;
        if (!asked) update(id, x => (x.run === run ? { ...x, fileAsked: true } : x));
        // The save merged storage: another tab may have moved the run on. File what is held now.
        r = find(id);
        if (!r) return null;
        if (r.run !== run || !r.initials) continue;
        let filed: Record<string, unknown>;
        try {
          filed = await post(csrf, { op: 'file', run, initials: r.initials });
        } catch (e) {
          if (e instanceof Gone && asked) {
            remove(id, true);
            return { id, kind: 'sent' };
          }
          throw e;
        }
        if (!filed['ok']) throw new Fail('file');
        remove(id, true);
        return {
          id, kind: 'filed', score: Number(filed['score']),
          rank: typeof filed['rank'] === 'number' ? filed['rank'] : null,
          difficulty: isDifficulty(filed['difficulty']) ? filed['difficulty'] : r.difficulty,
        };
      } catch (e) {
        if (!(e instanceof Gone)) throw e;
        const cur = find(id);
        // Another tab filed or dropped it during this pass: nothing to report here.
        if (!cur) return null;
        // A run told to wait first (429/503) was let go for waiting, not lost: that restart is not counted.
        if (!cur.waited && cur.restarts >= MAX_RESTARTS) throw new Refused('the score server kept losing it', e.detail);
        // Start again from round 1 in this same pass; no try is spent.
        update(id, x => ({ ...x, run: null, sent: 0, fileAsked: false, restarts: x.waited ? x.restarts : x.restarts + 1, waited: false }));
      }
    }
  }

  /* The CSRF token for this pass: Wait when there is no answer or the server says wait (429/503), Fail otherwise. */
  async function token(): Promise<string> {
    let res: Awaited<ReturnType<FilerEnv['fetch']>>;
    try {
      res = await env.fetch(URL, { credentials: 'same-origin' });
    } catch (_) {
      throw new Wait('offline', true);
    }
    const data = (await res.json().catch(() => null)) as { csrf?: unknown } | null;
    if (res.status === 429 || res.status === 503) throw new Wait(String(res.status));
    if (!res.ok || !data || typeof data.csrf !== 'string') throw new Fail(`csrf ${res.status}`);
    return data.csrf;
  }

  /** Whether a run has a request to make: a start, a round, or its filing. */
  const due = (r: PendingRun): boolean => (r.run ? r.sent < r.rounds.length || r.initials !== null : r.rounds.length > 0 || r.initials !== null);
  /* The outcome a run answers when its pass was cut short: nothing for a run
     still being played, waiting for one that is over. */
  const pending = (id: string): FileOutcome | null => (find(id)?.initials ? { id, kind: 'waiting' } : null);

  async function flushNow(): Promise<FileOutcome[]> {
    save();
    const ids = held.filter(due).map(r => r.id);
    if (!ids.length) return [];
    if (now() < timing.dueAt) return ids.map(pending).filter(o => o !== null);
    const out: FileOutcome[] = [];
    let waited = false;
    let told = false; // a wait the server asked for, not just no answer
    let failed = false;
    let csrf = '';
    let noToken = false; // the GET failed: every run's try fails with it
    try {
      csrf = await token();
    } catch (e) {
      if (e instanceof Wait) {
        waited = true;
        told = !e.net;
      } else noToken = true;
    }
    for (const id of ids) {
      let o: FileOutcome | null;
      if (waited) {
        // The server said wait: the other runs share its address, so none asks again this pass.
        o = pending(id);
      } else {
        try {
          if (noToken) throw new Fail('csrf');
          o = await sendOne(id, csrf);
        } catch (e) {
          if (e instanceof Refused) {
            remove(id);
            o = { id, kind: 'refused', why: e.message, ...(e.detail ? { detail: e.detail } : {}) };
          } else if (e instanceof Wait) {
            waited = true;
            told ||= !e.net;
            o = pending(id);
          } else if ((find(id)?.tries ?? 0) + 1 >= MAX_TRIES) {
            remove(id);
            o = { id, kind: 'refused', why: 'the score server kept failing' };
          } else {
            failed = true;
            update(id, x => ({ ...x, tries: x.tries + 1 }));
            o = pending(id);
          }
        }
      }
      if (o) out.push(o);
      // How it ended stays in the shared queue a while, for a tab whose card is waiting on it.
      if (o && o.kind !== 'waiting') ends.push({ o, at: now() });
    }
    // Told to wait: a restart of these runs before they go on again is not counted against them.
    const mark = (runs: PendingRun[]): PendingRun[] => (told ? runs.map(r => (ids.includes(r.id) ? { ...r, waited: true } : r)) : runs);
    if (waited || failed) {
      save(mark, t => {
        const lag = t.lag + 1;
        // Jitter after the cap, so clients that reached it together still spread out.
        const pause = Math.min(BACKOFF_MAX, BACKOFF_FIRST * 2 ** Math.min(lag - 1, 20)) * (0.75 + 0.5 * rng());
        return { dueAt: now() + pause, lag, cause: failed ? 'fail' : told ? 'busy' : 'offline' };
      });
    } else {
      save(mark, () => NO_WAIT);
    }
    return out;
  }

  /** Sends everything due; concurrent calls share one attempt, and with locks one tab's pass at a time.
      Before nextTry() it sends nothing. */
  function flush(): Promise<FileOutcome[]> {
    if (!busy) busy = (env.locks ? env.locks.request(PENDING_KEY, flushNow) : flushNow()).finally(() => { busy = null; });
    return busy;
  }

  /** Ms until the next flush() can do anything; null when no run has a request to make. The one retry signal. */
  function nextTry(): number | null {
    const disk = readDisk();
    if (disk) timing = { dueAt: disk.dueAt, lag: disk.lag, cause: disk.cause };
    return held.some(due) ? Math.min(BACKOFF_LONGEST, Math.max(0, timing.dueAt - now())) : null;
  }

  /** The network is back (online, the page shown again): ends a wait that came from no answer at
      all. A 429, 503 or failing server keeps its pause, or every tab of a busy class would retry at once. */
  function wake(): void {
    save(undefined, t => (t.cause === 'offline' ? { ...t, dueAt: 0 } : t));
  }

  return {
    begin, round, finish, drop, abandoned, flush, nextTry, wake,
    /** How a run that has left the queue ended, by id, whichever tab sent it; null when not known. */
    outcome(id: string): FileOutcome | null {
      const all = mergeEnds(readDisk()?.ends ?? [], ends);
      return all.find(e => e.o.id === id)?.o ?? null;
    },
    /** Whether the queue (this tab's or the shared one) still holds a run. */
    holds(id: string): boolean {
      save();
      return !!find(id);
    },
    waiting: () => held.length,
    /** False when the last save did not reach storage: the runs then last only as long as this page. */
    stored: () => kept,
  };
}
