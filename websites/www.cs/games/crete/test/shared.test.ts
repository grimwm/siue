// The shared bank on the page's side (src/endless/shared.ts): uploads with their tuple, the cache and its top-ups,
// taking a level that fits the run's place (never twice, never one like the run's), the checks before a shared level
// is played (its line replayed, the gate's cheap rules), skipping and reporting a bad one, and play from the cache
// offline. The mode's side: a seeded run never takes one, New Run does, made levels go up with their part, and a
// search that ran dry takes a shared level before the bundled bank's. The verifier (src/endless/verifier.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSharedBank, sharedProblems, sharedKey, TAKEN_KEY, DEVICE_KEY, CACHE_LOW, FETCH_GAP_MS } from '../src/endless/shared.ts';
import type { Served } from '../src/endless/shared.ts';
import { createVerifier, mayCheck, IDLE_MS, WAIT_MS } from '../src/endless/verifier.ts';
import type { CheckStanding } from '../src/endless/verifier.ts';
import { ENDLESS_VERSION, sharedOf } from '../src/endless/provenance.ts';
import type { SharedMade, Tuple } from '../src/endless/provenance.ts';
import { createEndlessMode } from '../src/endless/mode.ts';
import type { EndlessAbout } from '../src/endless/mode.ts';
import type { EndlessClient, MadeAt, MakeJob, WorkerLike } from '../src/endless/client.ts';
import { createEndlessSaved } from '../src/endless/saved.ts';
import type { RunLevel } from '../src/endless/saved.ts';
import { BANKS } from '../src/endless/bank.ts';
import type { BankLevel, Made, Request } from '../src/endless/generate.ts';
import { hidesWalls } from '../src/puzzle/difficulty.ts';
import { parse } from '../src/puzzle/level.ts';
import type { StorageLike } from '../../_kit/ports.ts';

const memory = (init: Record<string, string> = {}): StorageLike & { data: Record<string, string> } => {
  const data = { ...init };
  return { data, getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, removeItem: k => { delete data[k]; } };
};

/** Medium's bank levels that fit a Medium run's first place (its score band 35 to 55, no hidden walls, Chapter 1). */
const FIRST: BankLevel[] = BANKS.medium.filter(b => b.chapter === 1 && b.score >= 35 && b.score <= 55 && !hidesWalls(parse(b.text)));
const served = (b: BankLevel, h: string): Served => ({ ...sharedOf(b), h });
const firstReq = (over: Partial<Request> = {}): Request => ({ seed: 'abc', tier: 10, grade: 'medium', depth: 1, run: [], ...over });

/** A fake server: it answers GETs with `levels` and a CSRF token, and records every POST's body. */
function server(levels: Served[] = [], over: { offline?: boolean } = {}) {
  const posts: Record<string, unknown>[] = [];
  const gets: string[] = [];
  let online = !over.offline;
  const fetch = async (url: string, init?: { method?: string; body?: string; headers?: Record<string, string> }) => {
    if (!online) throw new TypeError('offline');
    if (init?.method === 'POST') {
      posts.push(JSON.parse(init.body!) as Record<string, unknown>);
      return { ok: true, status: 200, json: async () => ({ ok: true }) };
    }
    gets.push(url);
    return { ok: true, status: 200, json: async () => ({ csrf: 'c'.repeat(32), levels: url.includes('n=0') ? [] : levels }) };
  };
  return { fetch, posts, gets, goOffline: () => { online = false; } };
}

function bank(levels: Served[] = [], storage = memory(), over: { offline?: boolean } = {}) {
  const srv = server(levels, over);
  let now = 1_000_000;
  const b = createSharedBank({ fetch: srv.fetch, storage, now: () => now, random: () => 0.5, url: 'endless-bank.php' });
  return { b, srv, storage, later: (ms: number) => { now += ms; } };
}
const flush = () => new Promise(r => setTimeout(r, 0));

test('the bank fixture holds levels that pass the checks a shared level must pass', () => {
  assert.ok(FIRST.length >= 3);
  for (const b of FIRST) assert.deepEqual(sharedProblems(sharedOf(b)), [], `bank level ${b.score}`);
});

test('a level the search made goes up with its tuple; a run\'s first level and a spec\'s budget never do', async () => {
  const { b, srv } = bank();
  const run = BANKS.medium.slice(0, 14).map(l => ({ text: l.text, explored: l.explored, score: l.score }));
  const made = BANKS.medium[5]!;
  b.upload({ seed: 'up1', tier: 4, grade: 'medium', depth: 15, run }, 3, made);
  b.upload({ seed: 'up1', tier: 4, grade: 'medium', depth: 1, run: [] }, 0, made);
  b.upload({ seed: 'up1', tier: 4, grade: 'medium', depth: 15, run, budget: 1000 }, 0, made);
  await flush(); await flush();
  assert.equal(srv.posts.length, 1, 'one upload: the others cannot be shared');
  const p = srv.posts[0]! as { op: string; install: string; tuple: Tuple; made: SharedMade };
  assert.equal(p.op, 'submit');
  assert.match(p.install, /^[a-f0-9]{32}$/);
  assert.deepEqual({ ...p.tuple, run: p.tuple.run.length }, { v: ENDLESS_VERSION, seed: 'up1', tier: 4, grade: 'medium', depth: 15, k: 3, run: 12 });
  assert.deepEqual(p.made, sharedOf(made));
});

test('the device keeps one random id', () => {
  const st = memory();
  const a = bank([], st).b.device();
  assert.match(a, /^[a-f0-9]{32}$/);
  assert.equal(bank([], st).b.device(), a);
  assert.equal(JSON.parse(st.data[DEVICE_KEY]!), a);
});

test('a top-up fills the cache once it is low, no more than once a minute; a run takes a level that fits, never twice', async () => {
  const levels = FIRST.slice(0, 3).map((l, i) => served(l, `${i}`.repeat(16)));
  const { b, srv, later } = bank(levels);
  await b.refill('medium', 10);
  assert.equal(b.size('medium'), 3);
  await b.refill('medium', 10);
  assert.equal(srv.gets.length, 1, 'not again within the minute');
  const one = b.take(firstReq())!;
  assert.equal(one.from, 'shared');
  assert.ok(levels.some(l => l.text === one.text), 'a cached level, title and intro blank');
  assert.equal(parse(one.text).title, '');
  const two = b.take(firstReq())!;
  assert.notEqual(two.text, one.text, 'never the same level twice');
  later(FETCH_GAP_MS);
  await b.refill('medium', 10);
  assert.equal(b.size('medium'), 1, 'the levels already taken are not cached again');
  assert.ok(CACHE_LOW > 1);
});

test('a level outside the place\'s band, past the tier, or like one of the run\'s stays in the cache', async () => {
  const lv = FIRST[0]!;
  const { b } = bank([served(lv, 'a'.repeat(16))]);
  await b.refill('medium', 10);
  assert.equal(b.take(firstReq({ grade: 'medium', depth: 2, run: [{ text: FIRST[1]!.text, explored: 9000, score: 200 }] })), null, 'the plateau band is above it');
  const ch5 = BANKS.medium.find(x => x.chapter === 5)!;
  const { b: b5 } = bank([served(ch5, 'b'.repeat(16))]);
  await b5.refill('medium', 10);
  assert.equal(b5.take(firstReq({ tier: 4 })), null, 'its pieces come after the run\'s tier');
  assert.equal(b.take(firstReq({ depth: 1, run: [{ text: lv.text, explored: lv.explored, score: lv.score }] })), null, 'its layout is the run\'s own');
  assert.equal(b.size('medium'), 1);
  assert.equal(b.take(firstReq())!.text.length > 0, true);
});

test('a shared level whose line does not win, or wins in other moves, is skipped and reported; the next is taken', async () => {
  const good = FIRST[1]!;
  const bad = { ...served(FIRST[0]!, 'd'.repeat(16)), line: FIRST[0]!.line.slice(0, -1) + (FIRST[0]!.line.endsWith('u') ? 'd' : 'u') };
  const short = { ...served(FIRST[2]!, 'e'.repeat(16)), shortest: FIRST[2]!.shortest - 1 };
  assert.ok(sharedProblems(bad).length > 0, 'the edited line does not win');
  assert.ok(sharedProblems(short).length > 0, 'a line of other length than its fewest moves');
  const { b, srv } = bank([bad, short, served(good, 'f'.repeat(16))]);
  await b.refill('medium', 10);
  const got = b.take(firstReq())!;
  assert.equal(got.text, good.text);
  await flush(); await flush();
  assert.deepEqual(srv.posts.filter(p => p.op === 'report').map(p => p.h).sort(), ['d'.repeat(16), 'e'.repeat(16)]);
  assert.equal(b.size('medium'), 0, 'the bad levels are dropped from the cache');
});

test('a hand-drawn level the gate\'s cheap rules refuse is never played, whatever its line', () => {
  // A level with a wide open floor: the plain walk wins it and it is far too open.
  const text = 'title: \nintro: \n\n#########\n#P.....E#\n#.......#\n#...M...#\n#########\n';
  const s: SharedMade = { text, line: 'rrrrrr', shortest: 6, score: 40, explored: 3000, chapter: 1, hides: false };
  assert.ok(sharedProblems(s).length > 0);
  assert.ok(sharedProblems({ ...s, text: 'not a level' }).length > 0);
});

test('offline: a top-up fails quietly, uploads too, and the cache still serves', async () => {
  const st = memory();
  const { b, srv } = bank([served(FIRST[0]!, 'a'.repeat(16)), served(FIRST[1]!, 'b'.repeat(16))], st);
  await b.refill('medium', 10);
  srv.goOffline();
  b.upload({ seed: 'x', tier: 1, grade: 'medium', depth: 3, run: [{ text: FIRST[0]!.text, explored: 1, score: 40 }] }, 0, FIRST[0]!);
  await assert.doesNotReject(b.refill('medium', 10));
  const again = bank([], st, { offline: true }).b;
  assert.ok(again.take(firstReq()), 'a cached level plays without the server');
  assert.equal(await again.claim(ENDLESS_VERSION), null);
  assert.ok(JSON.parse(st.data[TAKEN_KEY]!).length === 1);
  assert.ok(st.data[sharedKey('medium')]);
});

/** A client whose every job answers `answer(request)`, recording the requests. */
function scripted(answer: (r: Request) => MadeAt) {
  const asked: Request[] = [];
  const client: EndlessClient = {
    make(r): MakeJob { asked.push(r); return { progress: () => {}, cancel: () => {}, result: Promise.resolve(answer(r)) }; },
    cancel: () => {},
    resize: () => {},
  };
  return { client, asked };
}
const madeOf = (b: BankLevel, from: Made['from'], part?: number): MadeAt => ({ ...b, from, tries: 1, spent: 1, ...(part !== undefined ? { part } : {}) });

function modeWith(answer: (r: Request) => MadeAt, take: (r: Request) => RunLevel | null) {
  const saved = createEndlessSaved(memory(), 'medium');
  const { client, asked } = scripted(answer);
  const opened: { about: EndlessAbout; intro: string }[] = [];
  const uploads: { req: Request; part: number; made: MadeAt }[] = [];
  const takes: Request[] = [];
  const mode = createEndlessMode({
    saved: () => saved, grade: () => 'medium', setGrade: () => {}, client, tier: () => 3, newSeed: () => 'fresh1',
    play: (level, about) => opened.push({ about, intro: level.intro }), changed: () => {},
    shared: { take: r => { takes.push(r); return take(r); } },
    made: (req, part, made) => uploads.push({ req, part, made }),
  });
  return { mode, saved, asked, opened, uploads, takes };
}
const sharedLevel = (b: BankLevel): RunLevel => ({ text: b.text, explored: b.explored, shortest: b.shortest, score: b.score, line: b.line, from: 'shared' });

test('New Run opens a shared level at once; its card says so', async () => {
  const m = modeWith(() => madeOf(FIRST[1]!, 'made', 0), () => sharedLevel(FIRST[0]!));
  m.mode.newRun();
  assert.equal(m.opened.length, 1, 'opened without waiting on a worker');
  assert.match(m.opened[0]!.intro, /From the shared bank\.$/);
  assert.equal(m.saved.run()!.levels[0]!.from, 'shared');
  assert.equal(m.saved.run()!.seeded, undefined);
});

test('a seeded run never takes a shared level, and its made levels still go up with their part', async () => {
  const m = modeWith(r => madeOf(FIRST[r.depth % FIRST.length]!, r.depth === 1 ? 'bank' : 'made', r.depth === 1 ? undefined : 2), () => sharedLevel(FIRST[0]!));
  m.mode.newRun('given');
  await flush(); await flush(); await flush();
  assert.equal(m.takes.length, 0, 'no shared level asked for');
  assert.equal(m.saved.run()!.seeded, true);
  assert.equal(m.saved.run()!.levels[0]!.from, 'bank');
  assert.ok(m.uploads.length >= 1, 'levels 2 on, made ahead, go up');
  assert.equal(m.uploads[0]!.part, 2);
  assert.equal(m.uploads[0]!.req.seed, 'given');
});

test('a search that ran dry takes a shared level before the bundled bank\'s; Next Level with nothing made takes one at once', async () => {
  let shared = 0;
  const m = modeWith(r => madeOf(FIRST[1]!, r.depth === 1 ? 'bank' : 'bank'), r => (r.depth > 1 && shared++ < 1 ? sharedLevel(FIRST[2]!) : null));
  m.mode.newRun();
  await flush(); await flush(); await flush();
  const run = m.saved.run()!;
  assert.equal(run.levels[0]!.from, 'bank', 'no shared level fit the first place');
  assert.equal(run.next!.from, 'shared', 'level 2: the search ran dry, a shared level came in');
  assert.equal(m.uploads.length, 0, 'nothing the search did not make goes up');

  // Next Level with nothing made: a shared level, at once, while the search for it is still going.
  const saved = createEndlessSaved(memory(), 'medium');
  const opened: EndlessAbout[] = [];
  const client: EndlessClient = {
    make: r => ({ progress: () => {}, cancel: () => {}, result: r.depth === 1 ? Promise.resolve(madeOf(FIRST[1]!, 'bank')) : new Promise<MadeAt>(() => {}) }),
    cancel: () => {}, resize: () => {},
  };
  const mode = createEndlessMode({
    saved: () => saved, grade: () => 'medium', setGrade: () => {}, client, tier: () => 3, newSeed: () => 'fresh2',
    play: (_, about) => opened.push(about), changed: () => {},
    shared: { take: r => (r.depth === 2 ? sharedLevel(FIRST[2]!) : null) },
  });
  mode.newRun();
  await flush(); await flush();
  assert.equal(opened.length, 1);
  assert.equal(saved.run()!.next, null, 'level 2 is still being made');
  mode.won(30, false);
  mode.next();
  assert.equal(opened.length, 2, 'level 2 opened at once');
  assert.equal(saved.run()!.levels.at(-1)!.from, 'shared');
  assert.equal(mode.view().finding, null);
});

/** A worker that answers a part message with `found`, or never when `found` is undefined. */
function partWorker(found: Made | null | undefined) {
  const w: WorkerLike & { terminated: boolean; posted: unknown[] } = {
    terminated: false, posted: [], onmessage: null, onerror: null,
    terminate() { w.terminated = true; },
    postMessage(m) {
      w.posted.push(m);
      if (found !== undefined) setTimeout(() => { if (!w.terminated) w.onmessage?.({ data: { type: 'part', id: 1, part: 0, result: { found, tries: 1, spent: 1 } } }); }, 0);
    },
  };
  return w;
}
const TUPLE: Tuple = { v: ENDLESS_VERSION, seed: 'abc', tier: 1, grade: 'easy', depth: 2, k: 4, run: [{ text: FIRST[0]!.text, explored: 3000, score: 30 }] };

function verifierWith(found: Made | null | undefined, claim: () => Promise<{ ticket: string; tuple: Tuple } | null>) {
  let now = 0;
  const sent: { ticket: string; found: SharedMade | null }[] = [];
  const workers: ReturnType<typeof partWorker>[] = [];
  const timers: { at: number; f: () => void }[] = [];
  const v = createVerifier({
    spawn: () => { const w = partWorker(found); workers.push(w); return w; },
    claim, send: async (ticket, f) => { sent.push({ ticket, found: f }); },
    now: () => now, setTimeout: (f, ms) => { const t = { at: now + ms, f }; timers.push(t); return t; },
    clearTimeout: t => { const i = timers.indexOf(t as never); if (i >= 0) timers.splice(i, 1); },
  });
  return { v, sent, workers, timers, later: (ms: number) => { now += ms; for (const t of timers.filter(t => t.at <= now)) { timers.splice(timers.indexOf(t), 1); t.f(); } } };
}

test('the verifier runs the claimed part and sends what it made; it never claims while not allowed', async () => {
  const made: Made = { ...FIRST[0]!, from: 'made', tries: 1, spent: 1 };
  let claims = 0;
  const h = verifierWith(made, async () => { claims++; return { ticket: 't'.repeat(32), tuple: TUPLE }; });
  await flush();
  assert.equal(claims, 0);
  h.v.allow(true);
  for (let i = 0; i < 5; i++) await flush();
  assert.equal(claims, 1);
  assert.deepEqual(h.workers[0]!.posted[0], { type: 'part', id: 1, request: { seed: 'abc', tier: 1, grade: 'easy', depth: 2, run: TUPLE.run }, part: 4 });
  assert.deepEqual(h.sent, [{ ticket: 't'.repeat(32), found: sharedOf(made) }]);
  assert.equal(h.workers[0]!.terminated, true);
  h.later(WAIT_MS - 1);
  await flush();
  assert.equal(claims, 1, 'it waits between claims');
  h.later(1);
  await flush();
  assert.equal(claims, 2);
});

test('the verifier stops its worker when the page needs it, sends nothing, and waits long when there is nothing to check', async () => {
  const h = verifierWith(undefined, async () => ({ ticket: 't'.repeat(32), tuple: TUPLE }));
  h.v.allow(true);
  for (let i = 0; i < 5; i++) await flush();
  assert.equal(h.v.busy(), true);
  h.v.allow(false);
  assert.equal(h.workers[0]!.terminated, true);
  assert.equal(h.v.busy(), false);
  assert.deepEqual(h.sent, []);

  let claims = 0;
  const idle = verifierWith(null, async () => { claims++; return null; });
  idle.v.allow(true);
  await flush(); await flush();
  idle.later(WAIT_MS);
  await flush();
  assert.equal(claims, 1, 'nothing to check: it waits IDLE_MS');
  idle.later(IDLE_MS);
  await flush();
  assert.equal(claims, 2);
});

test('a claimed tuple of another version or shape is never run', async () => {
  const h = verifierWith(null, async () => ({ ticket: 't'.repeat(32), tuple: { ...TUPLE, v: ENDLESS_VERSION + 1 } }));
  h.v.allow(true);
  for (let i = 0; i < 5; i++) await flush();
  assert.equal(h.workers.length, 0);
  const bad = verifierWith(null, async () => ({ ticket: 't'.repeat(32), tuple: { ...TUPLE, seed: 'NO SPACES' } }));
  bad.v.allow(true);
  for (let i = 0; i < 5; i++) await flush();
  assert.equal(bad.workers.length, 0);
});

test('checking runs on any idle page, never while the solver searches (a hint, Check, a rating), and the setting turns it off', () => {
  const idle: CheckStanding = { run: false, warm: true, shown: true, solving: false, battery: null, endlessIdle: true, on: true, sendsNothing: false, specBudget: false };
  assert.equal(mayCheck(idle), true, 'the campaign, the menus, the editor: idle and quiet');
  assert.equal(mayCheck({ ...idle, solving: true }), false, 'the solver is searching');
  assert.equal(mayCheck({ ...idle, on: false }), false, 'Help Check Endless Levels is off');
  assert.equal(mayCheck({ ...idle, endlessIdle: false }), false, 'Endless is making its own levels: they take turns');
  assert.equal(mayCheck({ ...idle, run: true }), false, 'an Endless run takes the workers');
  assert.equal(mayCheck({ ...idle, warm: false }), false, 'not before the quiet start');
  assert.equal(mayCheck({ ...idle, shown: false }), false, 'not while the tab is hidden');
  assert.equal(mayCheck({ ...idle, battery: { level: 0.1, charging: false } }), false, 'not on a low battery that is draining');
  assert.equal(mayCheck({ ...idle, battery: { level: 0.1, charging: true } }), true);
  assert.equal(mayCheck({ ...idle, sendsNothing: true }), false, 'Do Not Track');
});

test('a device keeps its own levels and plays them again in its own runs when no shared level fits, the oldest played first', () => {
  const { b } = bank();
  assert.equal(b.take(firstReq()), null);
  b.keep('medium', FIRST[0]!);
  b.keep('medium', FIRST[1]!);
  const one = b.take(firstReq())!;
  assert.equal(one.from, 'own');
  assert.equal(one.text, FIRST[0]!.text, 'the one played longest ago');
  assert.equal(b.take(firstReq({ run: [{ text: FIRST[1]!.text, explored: 1, score: 40 }] })), null, 'never one of the run\'s own levels');
  b.keep('hard', FIRST[2]!);
  assert.equal(b.take(firstReq({ grade: 'easy' })), null, 'each grade keeps its own');
});
