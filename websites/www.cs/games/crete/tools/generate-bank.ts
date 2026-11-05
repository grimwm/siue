/* The Island of Crete: the shared Endless bank's trusted generator, run by .github/workflows/crete-verify.yml after
 * tools/verify-bank.ts has checked the waiting levels. For the rest of its time (`--minutes`) it makes new Endless
 * levels with this checkout's generator on every core the runner has, and posts each straight into the served pool
 * (`trusted-add`) with its provenance tuple: the runner is our own code on our own machine, as trusted as its
 * verdicts. It asks the bank first how full each grade is (`trusted-counts`) and makes what is scarcest: Hard's
 * plateau first, large boards especially, which a run's own search seldom finds in time, then Medium and Easy as
 * Hard fills. It never makes more than fits under a grade's cap, counting the levels waiting in quarantine.
 *
 * A full grade still turns over: each run makes up to TURNOVER_SHARE of its cap and posts each with `replace`, so the
 * server retires one served level (its own weighted pick, old and often-served first) for each one it takes in. Only
 * what this run actually made goes in, so a slow run retires fewer and the grade never drops below its cap.
 *
 * Each level is one part of a search (generate.ts's makePart, PART_BUDGET situations), from a tuple of its own: a
 * fresh seed, a tier, the grade, a depth and a part, and a run memory of one level from the grade's bundled bank
 * that sets the place (on the plateau, or on the climb). Anyone can make the level again from that tuple.
 *
 * Over HTTPS only (never ssh or sftp); the CRETE_BANK_VERIFIER_TOKEN secret goes in the X-Crete-Verifier header and is
 * never printed. It always exits 0: a failed run only leaves the bank as it was.
 *
 *   CRETE_BANK_VERIFIER_TOKEN=… node tools/generate-bank.ts [--minutes 35] [--workers n] [--url <endpoint>] */
import { availableParallelism, totalmem } from 'node:os';
import { pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';
import { ENDLESS_VERSION, requestOf } from '../src/endless/provenance.ts';
import type { SharedMade, Tuple } from '../src/endless/provenance.ts';
import { PARTS, SIDES, placeOf, planOf, reachOf } from '../src/endless/generate.ts';
import type { BankLevel } from '../src/endless/generate.ts';
import { GRADE_BANDS, hidesWalls } from '../src/endless/gate.ts';
import { rngOf } from '../src/endless/random.ts';
import { BANKS } from '../src/endless/bank.ts';
import { parse } from '../src/puzzle/level.ts';
import type { Grade } from '../src/puzzle/rating.ts';
import { BANK_URL, TOKEN_HEADER } from './verify-bank.ts';

/** How much each grade's empty room counts: Hard's first, then Medium's, then Easy's. */
export const GRADE_WEIGHT: Readonly<Record<Grade, number>> = { hard: 3, medium: 2, easy: 1 };
/** The share of a grade's served levels that should be on the plateau, where a run spends most of its levels. */
export const PLATEAU_SHARE = 0.75;
/** The share of a grade's plateau levels that should be large boards. */
export const LARGE_SHARE: Readonly<Record<Grade, number>> = { hard: 0.5, medium: 0.35, easy: 0.25 };
/** While large boards are wanted, one part in LARGE_EVERY of a grade's plateau parts leans large: a part finds a
 *  large board far less often than a plain one, so the rest keep the plateau filling. */
export const LARGE_EVERY = 3;
/** A board is large when its long side reaches the top of its grade's plateau sides (Hard 21, Medium 19, Easy 17). */
export const LARGE_SIDE: Readonly<Record<Grade, number>> = { hard: SIDES.hard.plateau[1], medium: SIDES.medium.plateau[1], easy: SIDES.easy.plateau[1] };
/** The share of a full grade's cap each run replaces with fresh levels: 1.5%, 22 levels at a cap of 1,500. */
export const TURNOVER_SHARE = 0.015;
/** Memory a worker may use: its heap limit, and what the planner keeps free for the rest of the runner. */
export const WORKER_HEAP_MB = 1536;
const WORKER_MB = 2048;
const RESERVE_MB = 2048;

/** A grade's shelf as trusted-counts reports it: each served level as [score, chapter, rows, cols, hides]. */
export interface Shelf { served: number; pending: number; cap: number; levels: readonly (readonly number[])[] }
export type Counts = Record<Grade, Shelf>;
/** What the planner keeps for a grade: room left under the cap (or, for a full grade, the levels to replace), whether
 *  its levels replace served ones, and the served levels by place and size. */
export interface Tally { cap: number; room: number; replace: boolean; total: number; plateau: number; large: number; asked: number }
/** A level to make: its grade, on the plateau or on the climb, and whether a large board is wanted. */
export interface Want { grade: Grade; plateau: boolean; large: boolean }

const GRADES: readonly Grade[] = ['hard', 'medium', 'easy'];

/** Whether a level of `grade` with this score sits on its plateau; whether its board is large. */
export const onPlateau = (grade: Grade, score: number, hides: boolean) => !hides && score >= GRADE_BANDS[grade].plateau[0];
export const isLarge = (grade: Grade, rows: number, cols: number) => Math.max(rows, cols) >= LARGE_SIDE[grade];

export function tallyOf(counts: Counts): Record<Grade, Tally> {
  const out = {} as Record<Grade, Tally>;
  for (const g of GRADES) {
    const s = counts[g];
    let plateau = 0, large = 0;
    for (const [score = 0, , rows = 0, cols = 0, hides = 0] of s.levels) {
      if (!onPlateau(g, score, hides === 1)) continue;
      plateau++;
      if (isLarge(g, rows, cols)) large++;
    }
    const room = Math.max(0, s.cap - s.served - s.pending);
    const replace = room === 0 && s.served > 0;
    out[g] = { cap: s.cap, room: replace ? Math.max(1, Math.floor(s.cap * TURNOVER_SHARE)) : room, replace, total: s.served, plateau, large, asked: 0 };
  }
  return out;
}

/** The scarcest level to make next, or null when no grade has room or turnover left: the grade whose weighted share
 *  of empty room is largest, and once no grade has empty room, the full grade whose weighted turnover is (Hard first
 *  on a tie); on the plateau until PLATEAU_SHARE of the grade is, and a large board until LARGE_SHARE of its plateau
 *  is, on every LARGE_EVERY-th part the grade is asked for. */
export function nextWant(t: Readonly<Record<Grade, Tally>>): Want | null {
  let grade: Grade | null = null, best = 0;
  for (const replace of [false, true]) {
    for (const g of GRADES) {
      const p = t[g].cap > 0 ? GRADE_WEIGHT[g] * t[g].room / t[g].cap : 0;
      if (t[g].replace === replace && t[g].room > 0 && p > best) { grade = g; best = p; }
    }
    if (grade) break;
  }
  if (!grade) return null;
  const s = t[grade];
  const plateau = s.total === 0 || s.plateau / s.total < PLATEAU_SHARE;
  const large = plateau && s.asked % LARGE_EVERY === 0 && (s.plateau === 0 || s.large / s.plateau < LARGE_SHARE[grade]);
  return { grade, plateau, large };
}

/** The bundled bank's plain levels of `grade` that set a place: on the plateau, or on its climb. */
function memoryPool(grade: Grade, plateau: boolean): BankLevel[] {
  const g = GRADE_BANDS[grade];
  const plain = BANKS[grade].filter(b => !hidesWalls(parse(b.text)));
  const fits = plain.filter(b => (plateau ? b.score >= g.plateau[0] : b.score >= g.first[0] && b.score < g.plateau[0]));
  return fits.length ? fits : plain;
}

const SEED_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789';

/** A tuple for `want`, drawn from `random`. For a large board it tries seeds until the first rounds' drafts are large
 *  (the plan alone, no search), which leans the part toward a large level. */
export function tupleFor(want: Want, random: () => number): Tuple {
  const int = (n: number) => Math.floor(random() * n);
  const pool = memoryPool(want.grade, want.plateau);
  const before = pool[int(pool.length)]!;
  const tier = 1 + int(10);
  const depth = want.plateau ? 6 + int(25) : 2 + int(4);
  const k = int(PARTS);
  const draw = (): Tuple => {
    let seed = 'ci-';
    for (let i = 0; i < 8; i++) seed += SEED_CHARS[int(SEED_CHARS.length)]!;
    return { v: ENDLESS_VERSION, seed, tier, grade: want.grade, depth, k, run: [{ text: before.text, explored: before.explored, score: before.score }] };
  };
  let t = draw();
  if (!want.large) return t;
  for (let i = 0; i < 200; i++, t = draw()) {
    const { band, hides } = placeOf(requestOf(t));
    const reach = reachOf(band, t.grade);
    let large = true;
    for (let round = 0; round < 3 && large; round++) {
      const plan = planOf(rngOf('endless', t.seed, t.tier, t.grade, t.depth, 'part', t.k, round), t.tier, t.grade, hides, null, reach);
      large = isLarge(t.grade, plan.rows, plan.cols);
    }
    if (large) return t;
  }
  return t;
}

export type Upload = 'ok' | 'duplicate' | 'full' | 'rate' | 'error';

export interface GenerateDeps {
  /** Each grade's shelf, or null when the bank would not say. */
  counts(): Promise<Counts | null>;
  /** How many parts run at once. */
  workers: number;
  /** Runs a tuple's part: the level it made, or null. */
  make(t: Tuple): Promise<SharedMade | null>;
  /** Posts a level; with `replace`, a full grade retires one served level for it. */
  upload(t: Tuple, made: SharedMade, replace: boolean): Promise<Upload>;
  tupleFor(w: Want): Tuple;
  now(): number;
  /** Resolves after `ms`. */
  wait(ms: number): Promise<void>;
  /** Ends the parts still running. */
  stop(): void;
  log(line: string): void;
}

export interface Made { tried: number; added: Record<Grade, number>; empty: number; refused: number }

/** Makes and posts levels until `ms` have passed or every grade is full; what it did. Never throws. */
export async function generateAll(deps: GenerateDeps, limits: { ms: number }): Promise<Made> {
  const out: Made = { tried: 0, added: { easy: 0, medium: 0, hard: 0 }, empty: 0, refused: 0 };
  let counts: Counts | null;
  try { counts = await deps.counts(); } catch { counts = null; }
  if (!counts) { deps.log('could not read the bank\'s counts; nothing made'); return out; }
  const tally = tallyOf(counts);
  for (const g of GRADES) deps.log(`${g}: ${counts[g].served} served, ${counts[g].pending} waiting, ${tally[g].replace ? `full, replacing up to ${tally[g].room}` : `room for ${tally[g].room}`}; ${tally[g].plateau} on the plateau, ${tally[g].large} of them large`);
  const deadline = deps.now() + limits.ms;
  let halted = false, errors = 0;
  const running = new Set<Promise<void>>();

  const finish = async (want: Want, t: Tuple, made: SharedMade | null): Promise<void> => {
    if (!made) { out.empty++; tally[want.grade].room++; return; }
    const s = tally[want.grade];
    const sent = halted ? 'error' : await deps.upload(t, made, s.replace).catch((): Upload => 'error');
    if (sent === 'ok') {
      errors = 0;
      out.added[want.grade]++;
      s.total++;
      if (onPlateau(want.grade, made.score, made.hides)) {
        s.plateau++;
        const rows = made.text.split('\n').filter((l, i, all) => i > all.indexOf('') && l !== '');
        if (isLarge(want.grade, rows.length, rows[0]?.length ?? 0)) s.large++;
      }
      return;
    }
    out.refused++;
    s.room++;
    if (sent === 'full') { s.room = 0; deps.log(`${want.grade} is full`); }
    if (sent === 'rate') { halted = true; deps.log('the bank\'s hourly share for this runner is spent; stopping'); }
    if (sent === 'error' && !halted && ++errors >= 3) { halted = true; deps.log('the bank keeps failing; stopping'); }
  };

  for (;;) {
    while (!halted && running.size < deps.workers && deps.now() < deadline) {
      const want = nextWant(tally);
      if (!want) break;
      tally[want.grade].room--;
      tally[want.grade].asked++;
      const t = deps.tupleFor(want);
      out.tried++;
      const job: Promise<void> = deps.make(t).catch(() => null).then(m => finish(want, t, m)).finally(() => { running.delete(job); });
      running.add(job);
    }
    if (!running.size) break;
    const left = deadline - deps.now();
    // Past the deadline, parts that already came back still post their levels; the rest are ended.
    const timedOut = left <= 0
      ? (await new Promise(r => setImmediate(r)), running.size > 0)
      : await Promise.race([...running].map(p => p.then(() => false)).concat(deps.wait(left).then(() => true)));
    if (timedOut) {
      deps.log('stopping: this run\'s time is spent');
      deps.stop();
      // Levels already being posted get a moment to arrive.
      await Promise.race([Promise.allSettled([...running]), deps.wait(15_000)]);
      break;
    }
  }
  return out;
}

/** Up to `n` worker threads, each running one part at a time with a heap limit; one that dies is replaced. */
export function workerPool(n: number): { make(t: Tuple): Promise<SharedMade | null>; stop(): void } {
  const url = new URL('./generate-bank-worker.ts', import.meta.url);
  const idle: Worker[] = [];
  const all = new Set<Worker>();
  const queue: (() => void)[] = [];
  let id = 0, stopped = false;
  const spawn = () => {
    const w = new Worker(url, { resourceLimits: { maxOldGenerationSizeMb: WORKER_HEAP_MB } });
    all.add(w);
    return w;
  };
  for (let i = 0; i < n; i++) idle.push(spawn());
  const take = (): Promise<Worker> => (idle.length ? Promise.resolve(idle.pop()!) : new Promise(r => queue.push(() => r(idle.pop()!))));
  const give = (w: Worker) => { idle.push(w); queue.shift()?.(); };
  return {
    async make(t) {
      if (stopped) return null;
      const w = await take();
      const mine = ++id;
      return new Promise(resolve => {
        const done = (found: SharedMade | null, dead: boolean) => {
          w.off('message', onMessage); w.off('error', onError); w.off('exit', onExit);
          if (dead) { all.delete(w); if (!stopped) give(spawn()); } else give(w);
          resolve(found);
        };
        const onMessage = (m: { id: number; found: SharedMade | null }) => { if (m.id === mine) done(m.found, false); };
        const onError = () => { void w.terminate(); done(null, true); };
        const onExit = () => done(null, true);
        w.on('message', onMessage); w.on('error', onError); w.on('exit', onExit);
        w.postMessage({ id: mine, tuple: t });
      });
    },
    stop() { stopped = true; for (const w of all) void w.terminate(); },
  };
}

/** The workers this machine can hold: one per core, as memory allows. */
export function workersHere(): number {
  const mb = totalmem() / 2 ** 20;
  return Math.max(1, Math.min(availableParallelism(), Math.floor((mb - RESERVE_MB) / WORKER_MB)));
}

/** The bank's endpoint, when it is one this script may post to: HTTPS, or plain HTTP to this machine (a local dry run). */
export function safeUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    if (u.protocol === 'https:' || (u.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(u.hostname))) return u.href;
  } catch { /* not a URL */ }
  return null;
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const log = (line: string) => console.log(`generate-bank: ${line}`);
  const token = process.env.CRETE_BANK_VERIFIER_TOKEN ?? '';
  const url = safeUrl(arg('url') ?? BANK_URL);
  const minutes = Number(arg('minutes') ?? 35);
  if (!token) {
    log('no CRETE_BANK_VERIFIER_TOKEN; skipping (it comes from the bank-verifier field of the "Crete Config" item in 1Password)');
  } else if (!url) {
    log('the bank\'s URL must be HTTPS; nothing made');
  } else {
    const workers = Math.max(1, Math.min(workersHere(), Number(arg('workers')) || Infinity));
    const post = async (body: Record<string, unknown>): Promise<{ status: number; body: unknown }> => {
      const res = await fetch(url, {
        method: 'POST', signal: AbortSignal.timeout(60_000),
        headers: { 'Content-Type': 'application/json', [TOKEN_HEADER]: token },
        body: JSON.stringify(body),
      });
      return { status: res.status, body: await res.json().catch(() => null) };
    };
    const pool = workerPool(workers);
    log(`${workers} worker(s) for ${minutes} minute(s)`);
    const started = Date.now();
    try {
      const made = await generateAll({
        workers,
        async counts() {
          const r = await post({ op: 'trusted-counts' });
          if (r.status !== 200) { log(`the bank answered ${r.status} for its counts`); return null; }
          return (r.body as { grades: Counts }).grades;
        },
        make: t => pool.make(t),
        async upload(tuple, made, replace) {
          const r = await post(replace ? { op: 'trusted-add', tuple, made, replace } : { op: 'trusted-add', tuple, made });
          const error = (r.body as { error?: unknown } | null)?.error;
          if (r.status === 200) {
            const { h, retired } = r.body as { h: string; retired?: string };
            log(`${tuple.grade}: added ${h} (score ${made.score})${retired ? `, retired ${retired}` : ''}`);
            return 'ok';
          }
          if (r.status === 409 && (error === 'duplicate' || error === 'full')) return error;
          if (r.status === 429) return 'rate';
          log(`${tuple.grade}: the bank answered ${r.status}`);
          return 'error';
        },
        tupleFor: w => tupleFor(w, Math.random),
        now: () => Date.now(),
        wait: ms => new Promise(r => setTimeout(r, ms).unref()),
        stop: () => pool.stop(),
        log,
      }, { ms: Math.max(1, minutes) * 60_000 });
      const hours = (Date.now() - started) / 3_600_000;
      const rate = (n: number) => (hours > 0 ? Math.round(n / hours) : 0);
      log(`tried ${made.tried}, none found ${made.empty}, refused ${made.refused}; added hard ${made.added.hard}, medium ${made.added.medium}, easy ${made.added.easy} (per hour: ${rate(made.added.hard)}, ${rate(made.added.medium)}, ${rate(made.added.easy)})`);
    } catch (e) {
      log(`stopped: ${e instanceof Error ? e.message : String(e)}`);
    }
    pool.stop();
  }
  process.exit(0);
}
