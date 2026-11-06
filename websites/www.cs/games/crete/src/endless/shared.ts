/* The Island of Crete: the shared Endless bank on the page's side (games/crete/endless-bank.php on the server). Every
 * level a device's search makes goes up with its provenance tuple (src/endless/provenance.ts), fire and forget. The
 * server serves a level only once two other devices have made it again from that tuple. The page keeps a small cache
 * of served levels per grade in local storage, tops it up now and then, and plays from it offline. Before a shared
 * level is played it is checked here, cheaply, since the bank is open to anyone: its line is replayed on the engine and
 * must win in exactly its fewest moves with no catch, and the gate's cheap rules must hold. A level that fails is
 * skipped and reported. The device's id is a random number kept in local storage, nothing more. DOM-free. */
import { parse, serialize } from '../puzzle/level.ts';
import type { Level } from '../puzzle/level.ts';
import { initial } from '../puzzle/state.ts';
import { step } from '../puzzle/step.ts';
import { caught } from '../puzzle/solver.ts';
import { lineOf } from '../puzzle/cache.ts';
import { naiveWalkWins, neverLive, startProblems } from '../puzzle/difficulty.ts';
import { habitWins } from '../puzzle/habits.ts';
import { openness, OPEN } from '../puzzle/rating.ts';
import type { Grade } from '../puzzle/rating.ts';
import type { StorageLike } from '../../../_kit/ports.ts';
import { placeOf, RUN_MEMORY } from './generate.ts';
import type { Made, Request } from './generate.ts';
import { chapterOf, hidesWalls, newProblems, tidyProblems } from './gate.ts';
import { sharedOf, tupleOf } from './provenance.ts';
import type { SharedMade, Tuple } from './provenance.ts';
import type { RunLevel } from './saved.ts';
import { hash } from './random.ts';

/** A level the bank served: what the search made, with its layout's hash. */
export interface Served extends SharedMade { h: string }

/** Where the cache, the levels taken and the device's id are kept. */
export const sharedKey = (grade: Grade): string => `crete-endless-shared-${grade}`;
export const TAKEN_KEY = 'crete-endless-shared-taken';
export const DEVICE_KEY = 'crete-endless-device';
/** The levels this device's own search made, per grade: trusted here without any check, played again in its own
 *  runs when no shared level fits. */
export const ownKey = (grade: Grade): string => `crete-endless-own-${grade}`;
/** The most of its own levels a device keeps per grade. */
export const OWN_MOST = 150;
/** The most levels the cache holds per grade, the count under which it is topped up, how many one top-up asks for,
 *  and the least time between top-ups. */
export const CACHE_MOST = 40;
export const CACHE_LOW = 10;
export const FETCH_MOST = 16;
export const FETCH_GAP_MS = 60_000;
/** How many of the shared levels this device took it remembers, so it never takes one twice. */
export const TAKEN_MOST = 300;
/** The header that carries the CSRF token. */
export const CSRF_HEADER = 'X-Crete-CSRF';

type FetchLike = (url: string, init?: { method?: string; headers?: Record<string, string>; body?: string; keepalive?: boolean; credentials?: 'same-origin' }) =>
  Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;

export interface SharedDeps {
  fetch: FetchLike;
  storage: StorageLike | null;
  now(): number;
  random(): number;
  /** The endpoint's address. */
  url: string;
  /** Nothing that carries the device's id is sent (no uploads, reports or checks), asked each time: the player has
   *  not turned Help Build Endless Levels on, or Do Not Track or Global Privacy Control is set. Shared levels still
   *  come in. */
  quiet?(): boolean;
}

export interface SharedBank {
  /** This install's random id. */
  device(): string;
  /** Keeps a level this device's search made, for its own later runs. */
  keep(grade: Grade, made: Pick<Made, 'text' | 'line' | 'shortest' | 'score' | 'explored'>): void;
  /** Sends a level the search made, with its tuple, fire and forget: nothing when it cannot be shared. */
  upload(req: Request, part: number, made: Pick<Made, 'text' | 'line' | 'shortest' | 'score' | 'explored'>): void;
  /** Tops up `grade`'s cache with levels for `tier`, when it is low and the last top-up is a while ago. */
  refill(grade: Grade, tier: number): Promise<void>;
  /** A cached shared level that fits the run's place in `req`, checked, and taken: never again. Else one of this
   *  device's own levels that fits, the one played longest ago (`from: 'own'`); else null. */
  take(req: Request): RunLevel | null;
  /** How many levels `grade`'s cache holds. */
  size(grade: Grade): number;
  /** A level waiting for verification: its ticket and tuple, or null when the bank has none (or cannot be reached). */
  claim(version: number): Promise<{ ticket: string; tuple: Tuple } | null>;
  /** What this device made from a claimed tuple. */
  verdict(ticket: string, found: SharedMade | null): Promise<void>;
}

/** What a shared level fails of the checks a device runs before playing it: empty when it passes. Its line, replayed
 *  on the engine, wins in exactly its fewest moves with no catch; the maze is tidy; nothing is wrong at the start; the
 *  plain walk does not win and the Minotaur is no prisoner; no habit player wins; and the open floor is under the
 *  ceiling. */
export function sharedProblems(s: SharedMade): string[] {
  let level: Level;
  try { level = blank(parse(s.text)); } catch { return ['the text is no level']; }
  const line = lineOf(s.line);
  if (!line) return ['the line is not moves'];
  if (line.length !== s.shortest) return [`the line is ${line.length} moves, not ${s.shortest}`];
  let state = initial(level), catches = 0;
  for (let i = 0; i < line.length; i++) {
    const x = step(state, line[i]!);
    state = x.state;
    if (caught(x.events, state)) catches++;
    if (state.outcome !== 'playing' && i < line.length - 1) return ['the line ends before its last move'];
  }
  const out: string[] = [];
  if (state.outcome !== 'won') out.push('the line does not win');
  if (catches) out.push('the line takes a catch');
  out.push(...tidyProblems(level), ...startProblems(level));
  if (naiveWalkWins(level)) out.push('the plain walk wins');
  if (neverLive(level)) out.push('the Minotaur is penned');
  if (habitWins(level, s.shortest).length) out.push('a habit player wins');
  if (openness(level).share > OPEN.most) out.push('too open');
  return out;
}

/** `level` with no title and no intro: a shared level's words are never shown. */
const blank = (level: Level): Level => ({ ...level, title: '', intro: '' });

const isInt = (v: unknown, least: number, most: number): v is number => Number.isInteger(v) && (v as number) >= least && (v as number) <= most;
/** A served level as the server sends it, or null for anything else. */
function servedOf(v: unknown): Served | null {
  if (typeof v !== 'object' || v === null) return null;
  const o = v as Record<string, unknown>;
  if (typeof o.h !== 'string' || !/^[a-f0-9]{16}$/.test(o.h) || typeof o.text !== 'string' || o.text.length > 4000
    || typeof o.line !== 'string' || !/^[a-z]{1,2000}$/.test(o.line) || !isInt(o.shortest, 1, 2000) || !isInt(o.score, 0, 10_000)
    || !isInt(o.explored, 0, 10_000_000) || !isInt(o.chapter, 1, 10) || typeof o.hides !== 'boolean') return null;
  return { h: o.h, text: o.text, line: o.line, shortest: o.shortest, score: o.score, explored: o.explored, chapter: o.chapter, hides: o.hides };
}

export function createSharedBank(deps: SharedDeps): SharedBank {
  let csrf: string | null = null;
  /** The grades whose last take found nothing to fit: their cache is topped up even when it is not low. */
  const starved = new Set<Grade>();
  const read = <T>(key: string, fallback: T, ok: (v: unknown) => v is T): T => {
    try {
      const raw = deps.storage?.getItem(key);
      if (!raw) return fallback;
      const v: unknown = JSON.parse(raw);
      return ok(v) ? v : fallback;
    } catch { return fallback; }
  };
  const write = (key: string, v: unknown) => { try { deps.storage?.setItem(key, JSON.stringify(v)); } catch { /* kept nowhere: the cache is a convenience */ } };

  interface Cache { at: number; levels: Served[] }
  const isCache = (v: unknown): v is Cache => typeof v === 'object' && v !== null && typeof (v as Cache).at === 'number'
    && Array.isArray((v as Cache).levels) && (v as Cache).levels.every(l => servedOf(l) !== null);
  const cacheOf = (grade: Grade): Cache => read(sharedKey(grade), { at: 0, levels: [] }, isCache);
  const isTaken = (v: unknown): v is number[] => Array.isArray(v) && v.every(n => Number.isInteger(n));
  const taken = (): number[] => read(TAKEN_KEY, [], isTaken);
  const keyOf = (text: string) => hash('shared', text);
  interface Own { text: string; line: string; shortest: number; score: number; explored: number; used: number }
  const isOwn = (v: unknown): v is Own[] => Array.isArray(v) && v.every(o => typeof o === 'object' && o !== null
    && typeof (o as Own).text === 'string' && typeof (o as Own).line === 'string' && isInt((o as Own).shortest, 1, 2000)
    && isInt((o as Own).score, 0, 10_000) && isInt((o as Own).explored, 0, 10_000_000) && typeof (o as Own).used === 'number');
  const ownOf = (grade: Grade): Own[] => read(ownKey(grade), [], isOwn);
  /** One of the device's own levels that fits `req`'s place, the one played longest ago, now marked played. */
  const takeOwn = (req: Request, band: { least: number; most: number }, hides: boolean, run: readonly Level[]): RunLevel | null => {
    const own = ownOf(req.grade);
    const inRun = new Set(req.run.map(p => p.text));
    let best = -1;
    own.forEach((o, i) => {
      if (inRun.has(o.text) || o.score < band.least || o.score > band.most) return;
      let level: Level;
      try { level = parse(o.text); } catch { return; }
      if (chapterOf(level) > req.tier || hidesWalls(level) !== hides || newProblems(level, { features: [] }, run).length) return;
      if (best < 0 || o.used < own[best]!.used) best = i;
    });
    if (best < 0) return null;
    const o = own[best]!;
    own[best] = { ...o, used: deps.now() };
    write(ownKey(req.grade), own);
    return { text: o.text, explored: o.explored, shortest: o.shortest, score: o.score, line: o.line, from: 'own' };
  };

  let id: string | null = null;
  const device = (): string => {
    if (id) return id;
    const kept = read(DEVICE_KEY, '', (v): v is string => typeof v === 'string' && /^[a-f0-9]{32}$/.test(v));
    if (kept) return (id = kept);
    let made = '';
    for (let i = 0; i < 32; i++) made += Math.floor(deps.random() * 16).toString(16);
    write(DEVICE_KEY, made);
    return (id = made);
  };

  const get = async (query: string): Promise<unknown> => {
    const res = await deps.fetch(`${deps.url}?${query}`, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`the shared bank answered ${res.status}`);
    const body = await res.json() as { csrf?: unknown };
    if (typeof body.csrf === 'string' && /^[a-f0-9]{32}$/.test(body.csrf)) csrf = body.csrf;
    return body;
  };
  const post = async (body: Record<string, unknown>, keepalive = false): Promise<unknown> => {
    if (!csrf) await get('n=0');
    const send = () => deps.fetch(deps.url, {
      method: 'POST', credentials: 'same-origin', keepalive,
      headers: { 'Content-Type': 'application/json', [CSRF_HEADER]: csrf ?? '' },
      body: JSON.stringify({ ...body, install: device() }),
    });
    let res = await send();
    // A token the server no longer knows (its cookie expired): fetch a new one, once.
    if (res.status === 403) { csrf = null; await get('n=0'); res = await send(); }
    return res.json();
  };
  const report = (grade: Grade, h: string) => { if (!deps.quiet?.()) void post({ op: 'report', grade, h }, true).catch(() => {}); };

  return {
    device,
    keep(grade, made) {
      const own = ownOf(grade).filter(o => o.text !== made.text);
      own.push({ text: made.text, line: made.line, shortest: made.shortest, score: made.score, explored: made.explored, used: deps.now() });
      write(ownKey(grade), own.slice(-OWN_MOST));
    },
    upload(req, part, made) {
      const tuple = deps.quiet?.() ? null : tupleOf(req, part);
      if (!tuple) return;
      let shared: SharedMade;
      try { shared = sharedOf(made); } catch { return; }
      void post({ op: 'submit', tuple, made: shared }, true).catch(() => {});
    },
    async refill(grade, tier) {
      const cache = cacheOf(grade);
      if ((cache.levels.length >= CACHE_LOW && !starved.has(grade)) || deps.now() - cache.at < FETCH_GAP_MS) return;
      starved.delete(grade);
      write(sharedKey(grade), { ...cache, at: deps.now() });
      let body: unknown;
      try { body = await get(`grade=${grade}&tier=${tier}&n=${FETCH_MOST}`); } catch { return; }
      const got = Array.isArray((body as { levels?: unknown }).levels) ? (body as { levels: unknown[] }).levels : [];
      const now = cacheOf(grade);
      const had = new Set(now.levels.map(l => l.h));
      const done = new Set(taken());
      for (const v of got) {
        const s = servedOf(v);
        if (s && !had.has(s.h) && !done.has(keyOf(s.text))) { now.levels.push(s); had.add(s.h); }
      }
      write(sharedKey(grade), { at: deps.now(), levels: now.levels.slice(-CACHE_MOST) });
    },
    take(req) {
      const cache = cacheOf(req.grade);
      const { band, hides } = placeOf(req);
      const run = req.run.slice(-RUN_MEMORY).map(p => parse(p.text));
      if (!cache.levels.length) { starved.add(req.grade); return takeOwn(req, band, hides, run); }
      const done = new Set(taken());
      const keep: Served[] = [];
      let found: RunLevel | null = null;
      for (const s of cache.levels) {
        if (done.has(keyOf(s.text))) continue;
        if (found) { keep.push(s); continue; }
        let level: Level;
        try { level = blank(parse(s.text)); } catch { report(req.grade, s.h); continue; }
        // The level's own pieces, not what the server says of them, decide where it fits.
        if (chapterOf(level) > req.tier || hidesWalls(level) !== hides || s.score < band.least || s.score > band.most
          || newProblems(level, { features: [] }, run).length) { keep.push(s); continue; }
        if (sharedProblems(s).length) { report(req.grade, s.h); continue; }
        found = { text: serialize(level), explored: s.explored, shortest: s.shortest, score: s.score, line: s.line, from: 'shared' };
        write(TAKEN_KEY, [...taken(), keyOf(s.text)].slice(-TAKEN_MOST));
      }
      write(sharedKey(req.grade), { ...cache, levels: keep });
      if (found) starved.delete(req.grade); else starved.add(req.grade);
      return found ?? takeOwn(req, band, hides, run);
    },
    size: grade => cacheOf(grade).levels.length,
    async claim(version) {
      if (deps.quiet?.()) return null;
      try {
        const body = await post({ op: 'claim', v: version }) as { ticket?: unknown; tuple?: unknown };
        if (typeof body.ticket !== 'string' || !/^[a-f0-9]{32}$/.test(body.ticket) || typeof body.tuple !== 'object' || body.tuple === null) return null;
        return { ticket: body.ticket, tuple: body.tuple as Tuple };
      } catch { return null; }
    },
    async verdict(ticket, found) {
      try { await post({ op: 'verify', ticket, found }); } catch { /* the ticket expires on the server */ }
    },
  };
}
