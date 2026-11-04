// Endless's parts that need no long search: the seeded randomness, the bands of the climb, the teaching numbers the
// gate reads, the piece tier, the saved run, the worker's messages (host and client), the mode that opens levels, and
// the levels it makes ahead in the background.
// test/endless-gate.test.ts runs the generator and the gate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rngOf, hash, cleanSeed, newSeed } from '../src/endless/random.ts';
import { bandAfter, chapterOf, floorOf, hiddenBand, tidyProblems, TEACHING, CLIMB, FLOOR, GRADE_BANDS, HIDDEN_EVERY } from '../src/endless/gate.ts';
import { draft, familiesOf, textOf, mutate, FAMILY_CHAPTER } from '../src/endless/draft.ts';
import { tierOf } from '../src/endless/tier.ts';
import { createEndlessSaved, gradePref, partStore, endlessKey, OLD_ENDLESS_KEY, PARTS_KEY, AHEAD, UPCOMING } from '../src/endless/saved.ts';
import { createEndlessHost, PROGRESS_MS } from '../src/endless/host.ts';
import type { FromEndless } from '../src/endless/host.ts';
import { createEndlessClient, CancelledError, workersFor, workersNow, MOST_WORKERS } from '../src/endless/client.ts';
import type { WorkerLike } from '../src/endless/client.ts';
import { createEndlessMode, introOf, gradeFrom } from '../src/endless/mode.ts';
import type { EndlessAbout, EndlessDeps } from '../src/endless/mode.ts';
import { endlessName, endlessKicker, tierWords, readyWords } from '../src/endless/name.ts';
import { CAMPAIGN_TEXTS } from '../src/endless/campaign.ts';
import type { BankLevel, Made, Request } from '../src/endless/generate.ts';
import { ln, expNeg, settle, generate, placeOf } from '../src/endless/generate.ts';
import { openness } from '../src/puzzle/rating.ts';
import type { Grade } from '../src/puzzle/rating.ts';
import type { Level } from '../src/puzzle/level.ts';
import { CHAPTERS, LEVEL_IDS, levelById } from '../src/campaign/chapters.ts';
import { measure, RAMP } from '../src/puzzle/difficulty.ts';
import { parse } from '../src/puzzle/level.ts';
import type { StorageLike } from '../../_kit/ports.ts';

/** Small chapter-1 levels standing in for each grade's bank, so these tests never wait on the real one. */
const tiny = (row: string, score: number): BankLevel => ({ text: `title: \nintro: \n\n#######\n#P.${row}.E#\n#M....#\n#######\n`, explored: 9000, shortest: 30, score, chapter: 1, line: 'rrrr' });
const ONE: BankLevel[] = [tiny('.', 30), tiny('#', 36), tiny('*', 42), tiny('c', 50), tiny('z', 60), tiny('O', 75), tiny('r', 90)];
const BANKS: Record<Grade, BankLevel[]> = { easy: ONE, medium: ONE, hard: ONE };
const BANK = ONE;

/** Steps from `a` to `b` over every cell but walls (Infinity when none reach). */
function stepsTo(lv: Level, a: { r: number; c: number }, b: { r: number; c: number }): number {
  const dist = new Map<number, number>([[a.r * lv.cols + a.c, 0]]);
  const queue = [a.r * lv.cols + a.c];
  for (let k = 0; k < queue.length; k++) {
    const i = queue[k]!, r = Math.floor(i / lv.cols), c = i % lv.cols;
    if (r === b.r && c === b.c) return dist.get(i)!;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nr = r + dr, nc = c + dc, j = nr * lv.cols + nc;
      if (nr < 0 || nc < 0 || nr >= lv.rows || nc >= lv.cols || dist.has(j) || lv.terrain[j] === 'wall') continue;
      dist.set(j, dist.get(i)! + 1);
      queue.push(j);
    }
  }
  return Infinity;
}

const memory = (init: Record<string, string> = {}): StorageLike & { data: Record<string, string> } => {
  const data = { ...init };
  return { data, getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, removeItem: k => { delete data[k]; } };
};

test('the same seed parts draw the same numbers; other parts draw others', () => {
  const a = rngOf('endless', 'abc', 3, 2), b = rngOf('endless', 'abc', 3, 2), c = rngOf('endless', 'abc', 3, 3);
  const draw = (r: ReturnType<typeof rngOf>) => Array.from({ length: 20 }, () => r.next());
  const da = draw(a);
  assert.deepEqual(da, draw(b));
  assert.notDeepEqual(da, draw(c));
  assert.ok(da.every(x => x >= 0 && x < 1));
  assert.equal(hash('x', 1), hash('x', 1));
  assert.notEqual(hash('x', 1), hash('x', 2));
  assert.deepEqual(rngOf('s').shuffle([1, 2, 3, 4, 5]).sort(), [1, 2, 3, 4, 5]);
});

test('seeds: typed ones are cleaned, new ones are six readable characters', () => {
  assert.equal(cleanSeed('  Ab-C 12! '), 'ab-c12');
  assert.equal(cleanSeed('***'), null);
  assert.equal(cleanSeed('x'.repeat(40))!.length, 32);
  let i = 0;
  const s = newSeed(() => (i++ % 7) / 7);
  assert.match(s, /^[a-hj-np-z2-9]{6}$/);
});

test('a draft is a maze: drawn the same from the same seed, corridors on a lattice, tidy, the exit far from Theseus', () => {
  const plan = { rows: 13, cols: 15, families: familiesOf(9).slice(0, 3), relics: 2, winding: 0.6, braid: 0.5, chambers: 0 };
  let drawn = 0;
  for (let k = 0; k < 20; k++) {
    const one = draft(rngOf('t', k), plan), two = draft(rngOf('t', k), plan);
    assert.deepEqual(one && textOf(one, 'x'), two && textOf(two, 'x'));
    if (!one) continue;
    drawn++;
    const lv = parse(textOf(one, 'x'));
    assert.ok(lv.minotaur);
    assert.equal(lv.terrain.filter(t => t === 'exit').length, 1);
    assert.deepEqual(tidyProblems(lv), [], 'no lone wall, no bare nub');
    assert.ok(openness(lv).share <= 0.5, `corridors, not rooms: ${openness(lv).share}`);
    // Every corner of the lattice (even row and column) inside the border is wall.
    for (let r = 2; r < lv.rows - 1; r += 2) for (let c = 2; c < lv.cols - 1; c += 2) assert.equal(lv.terrain[r * lv.cols + c], 'wall');
    const exit = lv.terrain.indexOf('exit');
    const near = stepsTo(lv, lv.player, { r: Math.floor(exit / lv.cols), c: exit % lv.cols });
    assert.ok(near >= 8, `the exit is far from Theseus: ${near} steps`);
    const m = mutate(rngOf('m', k), one);
    assert.doesNotThrow(() => parse(textOf(m, 'x')), 'a changed draft is still a level');
    assert.deepEqual(tidyProblems(parse(textOf(m, 'x'))).filter(p => p.startsWith('a lone')), [], 'a change leaves no wall alone');
  }
  assert.ok(drawn >= 15, `${drawn} of 20 seeds drew a draft`);
});

test('each family comes in at its chapter; a tier offers the families up to it', () => {
  assert.deepEqual(familiesOf(1).map(f => FAMILY_CHAPTER[f]).filter(n => n > 1), []);
  assert.ok(familiesOf(9).includes('clone') && !familiesOf(8).includes('clone'));
  assert.deepEqual(familiesOf(10), familiesOf(9));
});

test('the chapter a level belongs to is the latest whose pieces it holds', () => {
  const lv = (row: string, head = '') => parse(`title: t\nintro: i\n${head}\n#######\n#P.${row}.E#\n#M....#\n#######\n`);
  assert.equal(chapterOf(lv('.')), 1);
  assert.equal(chapterOf(lv(':')), 2);
  assert.equal(chapterOf(lv('W')), 4);
  assert.equal(chapterOf(lv('@')), 6);
  assert.equal(chapterOf(lv('o', 'facing: up')), 7);
  assert.equal(chapterOf(lv('w', 'facing: up')), 8);
  assert.equal(chapterOf(lv('!')), 9);
  for (const id of LEVEL_IDS) {
    const n = Number(/^ch(\d+)-/.exec(id)?.[1] ?? 1);
    assert.ok(chapterOf(levelById(id)) <= Math.min(9, n), `${id} holds nothing from a later chapter`);
  }
});

test('the gate reads each chapter\'s teaching levels as they measure', () => {
  for (const c of CHAPTERS.slice(0, 9)) {
    const ds = c.levelIds.slice(0, c.teaching).map(id => measure(levelById(id)));
    assert.deepEqual(TEACHING[c.n - 1], {
      explored: Math.max(...ds.map(d => d.explored)),
      shortest: Math.max(...ds.map(d => d.shortest as number)),
    }, `Chapter ${c.n}`);
  }
  assert.deepEqual(floorOf(1), { explored: FLOOR, shortest: 36 });
  assert.deepEqual(floorOf(6), { explored: FLOOR, shortest: 30 });
});

test('the climb: each grade\'s first band, then 1.1 to 1.35 times the last plain level\'s score, then its plateau', () => {
  assert.ok(CLIMB.least >= 1 && CLIMB.most < RAMP.most, 'no cliff');
  assert.deepEqual(bandAfter(null, 'medium'), { least: 35, most: 55, plateau: false });
  assert.deepEqual(bandAfter(40, 'medium'), { least: 44, most: 54, plateau: false });
  assert.deepEqual(bandAfter(80, 'medium'), { least: 70, most: 110, plateau: true }, 'once on the plateau, it stays');
  assert.deepEqual(bandAfter(60, 'medium'), { least: 66, most: 81, plateau: false });
  assert.deepEqual(bandAfter(64, 'medium'), { least: 70, most: 110, plateau: true }, 'a climb whose low end passes the plateau\'s start is on it');
  assert.deepEqual(bandAfter(30, 'easy'), { least: 33, most: 40, plateau: false });
  for (const g of ['easy', 'medium', 'hard'] as const) {
    assert.ok(GRADE_BANDS[g].first[0] < GRADE_BANDS[g].plateau[0]);
    assert.ok(bandAfter(1_000, g).plateau);
  }
  assert.ok(GRADE_BANDS.easy.plateau[1] <= GRADE_BANDS.medium.plateau[1] && GRADE_BANDS.medium.plateau[1] <= GRADE_BANDS.hard.plateau[0], 'Hard climbs past Medium');
  assert.deepEqual(hiddenBand({ least: 70, most: 110, plateau: true }), { least: 49, most: 63, plateau: true }, 'set easier than its place');
});

test('one depth in five hides walls once the tier has them, set easier; the climb goes on from the last plain level', () => {
  const plain: Request = { seed: 'hides', tier: 9, grade: 'medium', depth: 2, run: [{ text: LEVEL_A, explored: 9000, score: 40 }] };
  let hidden = 0;
  for (let depth = 2; depth < 402; depth++) {
    const p = placeOf({ ...plain, depth });
    if (p.hides) { hidden++; assert.deepEqual(p.band, hiddenBand(bandAfter(40, 'medium'))); }
  }
  assert.ok(hidden >= 400 / HIDDEN_EVERY * 0.7 && hidden <= 400 / HIDDEN_EVERY * 1.3, `${hidden} of 400`);
  for (let depth = 2; depth < 60; depth++) assert.equal(placeOf({ ...plain, tier: 3, depth }).hides, false, 'not before the tier has hidden walls');
  const hiding = 'title: \nintro: \n\n#######\n#P.W.E#\n#M....#\n#######\n';
  const after = placeOf({ ...plain, depth: 3, tier: 3, run: [...plain.run, { text: hiding, explored: 3000, score: 30 }] });
  assert.deepEqual(after.band, bandAfter(40, 'medium'), 'the level after a hidden one climbs from the plain one before it');
});

test('a tidy maze: a dead-end corridor is tidy, a one-cell nub off a hall is not', () => {
  const lv = (rows: string) => parse(`title: \nintro: \n\n${rows}\n`);
  assert.deepEqual(tidyProblems(lv('#######\n#P....E\n###.###\n###.###\n#M....#\n#######')), []);
  assert.deepEqual(tidyProblems(lv('#######\n#P....E\n#M....#\n###.###\n#######')), ['a bare pocket at row 4, column 4']);
});

test('the worker holds every released level\'s text for the new-layout check', () => {
  assert.deepEqual(CAMPAIGN_TEXTS.map(t => t.id), [...LEVEL_IDS]);
});

test('the tier: Chapter 1 always, each chapter whose teaching levels are all cleared in order, all once everything is', () => {
  const none = new Set<string>();
  assert.equal(tierOf(CHAPTERS, id => none.has(id)), 1);
  const ch = (n: number, k: number) => CHAPTERS[n - 1]!.levelIds.slice(0, k);
  const some = new Set([...ch(2, 3), ...ch(3, 3), ...ch(5, 3)]);
  assert.equal(tierOf(CHAPTERS, id => some.has(id)), 3, 'Chapter 4 not taught yet, so 5 waits too');
  assert.equal(tierOf(CHAPTERS, id => new Set(ch(2, 2)).has(id)), 1, 'a chapter half taught does not count');
  assert.equal(tierOf(CHAPTERS, () => true), 10);
});

test('names and words: the same seed and depth name the same hall; the cards\' kickers', () => {
  assert.equal(endlessName('abc', 2), endlessName('abc', 2));
  assert.match(endlessName('abc', 2), /^The [A-Z][a-z]+ [A-Z][a-z]+$/);
  assert.equal(endlessKicker(3), 'Endless · Level 3');
  assert.equal(tierWords(1), "Chapter 1's pieces");
  assert.equal(tierWords(4), 'the pieces of Chapters 1 to 4');
  assert.equal(tierWords(10), 'every piece');
});

const made = (text: string, explored = 10_000, shortest = 40, from: Made['from'] = 'bank'): Made => ({ text, explored, shortest, score: Math.round(explored / 250), line: 'rr', from, tries: 0, spent: 0 });
const LEVEL_A = 'title: \nintro: \n\n######\n#P..E#\n#M...#\n######\n';
const LEVEL_B = 'title: \nintro: \n\n######\n#P...#\n#M..E#\n######\n';

test('the saved run: started, cleared once per level, advanced only when the next is made and this one cleared', () => {
  const st = memory();
  const s = createEndlessSaved(st, 'medium');
  assert.equal(s.run(), null);
  s.start('abc', 3, made(LEVEL_A));
  assert.equal(s.advance(), null, 'nothing made yet');
  s.addMade('abc', 2, made(LEVEL_B, 13_000));
  assert.equal(s.advance(), null, 'not cleared yet');
  s.addMade('zzz', 3, made(LEVEL_A));
  s.addMade('abc', 4, made(LEVEL_A));
  assert.equal(s.run()!.next!.text, LEVEL_B, 'another run\'s level, or one out of order, is ignored');
  assert.equal(s.queued().length, 1);
  // The workers stay AHEAD levels in front: level 3 and 4 queue behind level 2, and no more.
  s.addMade('abc', 3, made(LEVEL_A, 16_000));
  s.addMade('abc', 4, made(LEVEL_B, 20_000));
  s.addMade('abc', 5, made(LEVEL_A, 25_000));
  assert.deepEqual(s.queued().map(l => l.explored), [13_000, 16_000, 20_000]);
  assert.deepEqual(s.played().map(p => p.explored), [10_000, 13_000, 16_000, 20_000], 'the next level to make follows those queued');
  s.won(30, false);
  s.won(25, false);
  assert.equal(s.run()!.cleared, 1, 'a level counts once');
  assert.equal(s.run()!.moves, 30, 'its first clear\'s moves');
  assert.equal(s.run()!.best, 25);
  assert.deepEqual(s.best(), { depth: 1, seed: 'abc', moves: 30 });
  const r = s.advance()!;
  assert.equal(r.depth, 2);
  assert.equal(r.levels.length, 2);
  assert.equal(r.next!.explored, 16_000, 'the queue moves up');
  assert.deepEqual(s.queued().map(l => l.explored), [16_000, 20_000]);
  assert.deepEqual(createEndlessSaved(st, 'medium').queued().length, 2, 'the queue is kept over a reload');
  s.won(20, true);
  assert.equal(s.run()!.assisted, true);
  assert.deepEqual(s.best(), { depth: 1, seed: 'abc', moves: 30 }, 'a run with help sets no best');
  assert.deepEqual(createEndlessSaved(st, 'medium').run(), s.run(), 'kept in storage');
});

test('blocked or corrupt Endless storage reads as no run and never throws', () => {
  const throwing: StorageLike = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() {} };
  for (const st of [null, throwing, memory({ [endlessKey('medium')]: '{oops' }), memory({ [endlessKey('medium')]: '{"run":{"seed":"x"},"best":null}' })]) {
    const s = createEndlessSaved(st, 'medium');
    assert.equal(s.run(), null);
    assert.doesNotThrow(() => { s.start('abc', 1, made(LEVEL_A)); s.won(3, false); });
  }
});

/** A worker in the page's thread: the host answers on the next turn. */
function fakeWorker(): WorkerLike & { terminated: boolean; posted: unknown[] } {
  let t = 0;
  const w: WorkerLike & { terminated: boolean; posted: unknown[] } = {
    terminated: false, posted: [], onmessage: null, onerror: null,
    terminate() { w.terminated = true; },
    postMessage(m) {
      w.posted.push(m);
      const host = createEndlessHost({ post: r => queueMicrotask(() => { if (!w.terminated) w.onmessage?.({ data: r }); }), banks: BANKS, known: () => ({ features: [] }), now: () => (t += 100) });
      setTimeout(() => host.receive(m as never), 0);
    },
  };
  return w;
}

test('the host answers from the bank, runs a part of a search, and meets a request it cannot with a failure', () => {
  const out: FromEndless[] = [];
  const host = createEndlessHost({ post: m => out.push(m), banks: BANKS, known: () => ({ features: [] }), now: () => 0 });
  host.receive({ type: 'bank', id: 7, request: { seed: 'abc', tier: 1, grade: 'medium', depth: 1, run: [] }, tries: 0, spent: 0 });
  const last = out.at(-1)!;
  assert.equal(last.type, 'made');
  if (last.type === 'made') {
    assert.equal(last.id, 7);
    assert.equal(last.made.from, 'bank');
    assert.ok(BANK.some(b => b.text === last.made.text));
  }
  const prev = BANK[0]!;
  host.receive({ type: 'part', id: 9, part: 0, request: { seed: 'abc', tier: 1, grade: 'medium', depth: 2, run: [{ text: prev.text, explored: prev.explored, score: prev.score }], budget: 100_000 } });
  const part = out.at(-1)!;
  assert.equal(part.type, 'part');
  if (part.type === 'part') assert.ok(part.result.spent >= 100_000 / 12 || part.result.found, 'a part spends its share of the budget or finds a level');
  host.receive({ type: 'part', id: 10, part: 1, request: { seed: 'abc', tier: 1, grade: 'medium', depth: 2, run: [{ text: prev.text, explored: prev.explored, score: prev.score }], budget: 100_000 } });
  assert.equal(out.at(-1)!.type, 'part');
  host.receive({ type: 'part', id: 11, part: 12, request: { seed: 'abc', tier: 1, grade: 'medium', depth: 2, run: [{ text: prev.text, explored: prev.explored, score: prev.score }], budget: 100_000 } });
  assert.equal(out.at(-1)!.type, 'failed', 'a search has no part past its last');
  const empty = createEndlessHost({ post: m => out.push(m), banks: { easy: [], medium: [], hard: [] }, known: () => ({ features: [] }), now: () => 0 });
  empty.receive({ type: 'bank', id: 8, request: { seed: 'abc', tier: 1, grade: 'medium', depth: 1, run: [] }, tries: 0, spent: 0 });
  assert.deepEqual(out.at(-1), { type: 'failed', id: 8, message: 'the bank is empty' });
});

test('the host spaces its progress reports', () => {
  const out: FromEndless[] = [];
  let t = 0;
  const host = createEndlessHost({ post: m => out.push(m), banks: BANKS, known: () => ({ features: [] }), now: () => (t += PROGRESS_MS / 4) });
  const prev = BANK[0]!;
  host.receive({ type: 'part', id: 1, part: 0, request: { seed: 'abc', tier: 1, grade: 'medium', depth: 2, run: [{ text: prev.text, explored: prev.explored, score: prev.score }], budget: 12 * 300_000 } });
  const reports = out.filter(m => m.type === 'progress');
  assert.ok(reports.length >= 1);
  assert.ok(out.at(-1)!.type === 'part');
  for (const r of reports) if (r.type === 'progress') assert.equal(r.progress.budget, 300_000);
});

test('the workers: how many a device searches with', () => {
  assert.equal(workersFor(8, null), MOST_WORKERS);
  assert.equal(workersFor(4, null), 3);
  assert.equal(workersFor(2, null), 1);
  assert.equal(workersFor(undefined, null), 1);
  assert.equal(workersFor(8, { level: 0.1, charging: false }), 1, 'a low battery searches with one');
  assert.equal(workersFor(8, { level: 0.1, charging: true }), MOST_WORKERS);
});

test('settle: the lowest part that found a level, once every part below it is back; the bank when none did', () => {
  const none = { found: null, tries: 5, spent: 100 };
  const hit = (n: number) => ({ found: made(LEVEL_A, n, 40, 'made'), tries: 2, spent: 50 });
  assert.deepEqual(settle([undefined, hit(1)], 3), { made: null, done: false }, 'part 0 may still find one');
  assert.equal(settle([none, hit(1), hit(2)], 3).made!.explored, 1);
  assert.deepEqual([settle([none, hit(1)], 3).made!.tries, settle([none, hit(1)], 3).made!.spent], [7, 150], 'what the parts up to it spent');
  assert.equal(settle([hit(9), undefined], 3).made!.explored, 9, 'part 0 wins without the rest');
  assert.deepEqual(settle([none, none, none], 3), { made: null, done: true });
});

test('the client: a job\'s answer comes back; a new job or cancel ends the worker and rejects the old one', async () => {
  const workers: ReturnType<typeof fakeWorker>[] = [];
  const client = createEndlessClient(() => { const w = fakeWorker(); workers.push(w); return w; });
  const req: Request = { seed: 'abc', tier: 2, grade: 'medium', depth: 1, run: [] };
  const m = await client.make(req).result;
  assert.equal(m.from, 'bank');
  const one = client.make(req);
  const two = client.make(req);
  await assert.rejects(one.result, CancelledError);
  assert.equal(workers[0]!.terminated, true, 'the old search ends with its worker');
  assert.equal((await two.result).text, m.text, 'the same request, the same level');
  const three = client.make(req);
  three.cancel();
  await assert.rejects(three.result, CancelledError);
  const broken = createEndlessClient(() => { throw new Error('no workers here'); });
  await assert.rejects(broken.make(req).result, /could not start/);
});

test('the client: parts run side by side, and three workers settle on the level one worker makes', async () => {
  const prev = BANK[0]!;
  const req: Request = { seed: 'side', tier: 1, grade: 'medium', depth: 2, run: [{ text: prev.text, explored: prev.explored, score: prev.score }], budget: 12 * 10_000 };
  const workers: ReturnType<typeof fakeWorker>[] = [];
  const three = createEndlessClient(() => { const w = fakeWorker(); workers.push(w); return w; }, () => 3);
  const one = createEndlessClient(() => fakeWorker(), () => 1);
  const a = await three.make(req).result, b = await one.make(req).result;
  assert.deepEqual(a, b);
  assert.deepEqual(a, generate(req, BANKS, { features: [] }));
  assert.ok(workers.length <= 3, 'three workers at most at once');
  const firsts = workers.slice(0, 3).map(w => (w.posted[0] as { part?: number }).part);
  assert.deepEqual(firsts, [0, 1, 2], 'the first three parts at once, one to each worker');
});

test('the mode: a new run opens its first level, the next is made meanwhile, and Next Level opens it', async () => {
  const st = memory();
  const saved = createEndlessSaved(st, 'medium');
  const opened: EndlessAbout[] = [];
  // Every job the mode starts, so the test waits on its answer, not on the clock.
  const base = createEndlessClient(() => fakeWorker());
  const jobs: Promise<unknown>[] = [];
  const client = { ...base, make: (r: Request) => { const j = base.make(r); jobs.push(j.result.then(() => {}, () => {})); return j; } };
  const settled = async () => { for (let n = 0; n < jobs.length; n++) await jobs[n]; await new Promise(r => setTimeout(r, 0)); };
  let changes = 0;
  const mode = createEndlessMode({ saved: () => saved, grade: () => 'medium', setGrade: () => {}, client, tier: () => 1, newSeed: () => 'fresh1', play: (_, about) => opened.push(about), changed: () => { changes++; }, budget: () => 100_000 });
  mode.newRun();
  assert.ok(mode.view().finding, 'waiting for the first level');
  await settled();
  assert.equal(opened.length, 1);
  assert.equal(opened[0]!.depth, 1);
  assert.equal(opened[0]!.seed, 'fresh1');
  assert.equal(mode.view().finding, null);
  // The workers make levels 2 to 4 while level 1 is played (here, at once: the budget is small).
  await settled();
  assert.ok(saved.run()!.next, 'level 2 is made during level 1');
  assert.equal(saved.queued().length, AHEAD, 'the workers stay AHEAD levels in front');
  mode.next();
  assert.equal(opened.length, 1, 'Next Level waits for a win');
  mode.won(40, false);
  mode.next();
  assert.equal(opened.length, 2);
  assert.equal(opened[1]!.depth, 2);
  assert.ok(changes > 0);
  mode.link('Fresh1', 1);
  assert.equal(mode.view().linked, null, 'a link to the saved run\'s own seed offers nothing new');
  mode.link('other', 4);
  assert.deepEqual(mode.view().linked, { seed: 'other', tier: 4, grade: 'medium' }, 'a link that names no grade plays Medium');
  mode.cancel();
  assert.equal(mode.view().linked, null);
});

test('the search\'s log and exp, made of + - * / alone, agree with Math\'s', () => {
  for (const x of [0.001, 0.3, 1, 1.5, 2, 7.25, 1e6]) assert.ok(Math.abs(ln(x) - Math.log(x)) < 1e-12, `ln ${x}`);
  for (const y of [0, 0.1, 0.25, 1, 4, 20]) assert.ok(Math.abs(expNeg(y) - Math.exp(-y)) < 1e-12, `exp -${y}`);
  assert.equal(expNeg(100), 0);
});

test('the start card says when a level comes from the level bank, and says nothing of it for a made one', () => {
  const l = { text: LEVEL_A, explored: 7000, shortest: 31, score: 40, line: '', from: 'bank' as const };
  assert.equal(introOf('abcdef', l, 'hard'), 'Seed abcdef, Hard. The fewest moves are 31. From the level bank.');
  assert.equal(introOf('abcdef', { ...l, from: 'made' }, 'medium'), 'Seed abcdef, Medium. The fewest moves are 31.');
});

test('a run saved before levels were made ahead (no ahead list) still reads, and queues behind its next', () => {
  const { tries: _t, spent: _s, ...first } = made(LEVEL_A);
  const old = { seed: 'abc', tier: 1, depth: 1, levels: [first], next: null, cleared: 0, moves: 0, assisted: false, best: null };
  const s = createEndlessSaved(memory({ [endlessKey('medium')]: JSON.stringify({ run: old, best: null }) }), 'medium');
  assert.equal(s.run()!.seed, 'abc');
  assert.deepEqual(s.queued(), []);
  s.addMade('abc', 2, made(LEVEL_B));
  s.addMade('abc', 3, made(LEVEL_A));
  assert.equal(s.queued().length, 2);
});

test('the workers in the background: one, once the page is warm, shown, the solver idle and the battery not draining', () => {
  const at = { run: false, warm: true, shown: true, solving: false, battery: null };
  assert.equal(workersNow(at, 3), 1, 'one in the background');
  assert.equal(workersNow({ ...at, run: true }, 3), 3, 'a run takes its full share');
  assert.equal(workersNow({ ...at, run: true, shown: false, solving: true, warm: false }, 3), 3, 'a run goes on as ever');
  assert.equal(workersNow({ ...at, warm: false }, 3), 0, 'not before the page is warm');
  assert.equal(workersNow({ ...at, shown: false }, 3), 0, 'not while the tab is hidden');
  assert.equal(workersNow({ ...at, solving: true }, 3), 0, 'not while the solver works');
  assert.equal(workersNow({ ...at, battery: { level: 0.1, charging: false } }, 3), 0, 'not on a low battery that is draining');
  assert.equal(workersNow({ ...at, battery: { level: 0.1, charging: true } }, 3), 1);
});

test('the client: a size of 0 holds a job, a larger one goes on with it, a smaller one ends the extra workers', async () => {
  const prev = BANK[0]!;
  const req: Request = { seed: 'held', tier: 1, grade: 'medium', depth: 2, run: [{ text: prev.text, explored: prev.explored, score: prev.score }], budget: 12 * 10_000 };
  const workers: ReturnType<typeof fakeWorker>[] = [];
  let size = 0;
  const client = createEndlessClient(() => { const w = fakeWorker(); workers.push(w); return w; }, () => size);
  const job = client.make(req);
  assert.equal(workers.length, 0, 'no worker while the size is 0');
  size = 3;
  client.resize();
  assert.equal(workers.length, 3);
  size = 1;
  client.resize();
  assert.equal(workers.filter(w => !w.terminated).length, 1, 'narrowed to one worker');
  assert.deepEqual(await job.result, generate(req, BANKS, { features: [] }), 'the same level, however the size moved');
});

test('the client: the same request after a cancel goes on from the parts it finished', async () => {
  const prev = BANK[0]!;
  const req: Request = { seed: 'resume', tier: 1, grade: 'medium', depth: 2, run: [{ text: prev.text, explored: prev.explored, score: prev.score }], budget: 12 * 10_000 };
  const parts: number[] = [];
  const spawn = () => { const w = fakeWorker(); const post = w.postMessage; w.postMessage = m => { parts.push((m as { part: number }).part); post(m); }; return w; };
  const client = createEndlessClient(spawn, () => 1);
  const whole = generate(req, BANKS, { features: [] });
  const first = client.make(req);
  // Waits for part 0 to come back, then cancels part 1 under way.
  await until(() => parts.length >= 2, 'part 1 to be handed out (part 0 found nothing)');
  first.cancel();
  await assert.rejects(first.result, CancelledError);
  const again = client.make(req);
  assert.deepEqual(await again.result, whole);
  assert.equal(parts.filter(k => k === 0).length, 1, 'part 0 is not run again');
});

test('the upcoming run: its seed chosen ahead, its levels kept in order up to UPCOMING, dropped when a run starts', () => {
  const st = memory();
  const s = createEndlessSaved(st, 'medium');
  assert.equal(s.upcoming(), null);
  s.plan('next1', 2, null);
  s.addUpcoming('next1', 2, made(LEVEL_B));
  assert.equal(s.upcoming()!.levels.length, 0, 'level 1 comes first');
  for (let d = 1; d <= UPCOMING + 1; d++) s.addUpcoming('next1', d, made(d % 2 ? LEVEL_A : LEVEL_B, 10_000 + d));
  s.addUpcoming('other', 1, made(LEVEL_A));
  assert.deepEqual(s.upcoming()!.levels.map(l => l.explored), [10_001, 10_002, 10_003, 10_004], 'no more than UPCOMING');
  assert.deepEqual(createEndlessSaved(st, 'medium').upcoming(), s.upcoming(), 'kept over a reload');
  s.won(3, false);
  assert.equal(s.upcoming()!.levels.length, UPCOMING, 'a best kept leaves it');
  const [one, ...after] = s.upcoming()!.levels;
  const run = s.start('next1', 2, one!, after);
  assert.equal(run.next!.explored, 10_002);
  assert.deepEqual(s.queued().map(l => l.explored), [10_002, 10_003, 10_004]);
  assert.equal(s.upcoming(), null, 'starting a run drops it');
  s.plan('next2', 1, 5_000);
  assert.equal(s.plan('next2', 3, null).levels.length, 0);
  assert.equal(createEndlessSaved(memory({ [endlessKey('medium')]: JSON.stringify({ run: null, best: null, upcoming: { seed: 'x', tier: 1, budget: null, levels: new Array(UPCOMING + 1).fill(run.levels[0]) } }) }), 'medium').upcoming(), null, 'too many reads as none');
});

/** Waits until `done()` holds, failing with `what` rather than hanging. */
async function until(done: () => boolean, what: string): Promise<void> {
  const end = Date.now() + 30_000;
  while (!done()) {
    if (Date.now() > end) throw new Error(`timed out waiting for ${what}`);
    await new Promise(r => setTimeout(r, 1));
  }
}

/** A mode on fresh storage, with a client whose jobs the test can wait on. */
function harness(over: Partial<EndlessDeps> = {}) {
  const saved = createEndlessSaved(memory(), 'medium');
  const base = createEndlessClient(() => fakeWorker());
  const jobs: Promise<unknown>[] = [];
  const client = { ...base, make: (r: Request) => { const j = base.make(r); jobs.push(j.result.then(() => {}, () => {})); return j; } };
  const settled = async () => { for (let n = 0; n < jobs.length; n++) await jobs[n]; await new Promise(r => setTimeout(r, 0)); };
  const opened: EndlessAbout[] = [];
  const mode = createEndlessMode({ saved: () => saved, grade: () => 'medium', setGrade: () => {}, client, tier: () => 1, newSeed: () => 'early1', play: (_, about) => opened.push(about), changed: () => {}, budget: () => 12 * 10_000, ...over });
  return { saved, mode, settled, opened, jobs };
}

test('levels made ahead in the background are the levels the same seed makes on demand', async () => {
  const early = harness();
  early.mode.ahead();
  await early.settled();
  const up = early.saved.upcoming()!;
  assert.equal(up.seed, 'early1');
  assert.equal(up.levels.length, UPCOMING, 'level 1 and the AHEAD after it, made before the run starts');
  assert.equal(early.mode.view().ready, UPCOMING);
  const asked = early.jobs.length;
  early.mode.newRun();
  assert.equal(early.opened.length, 1, 'New Run opens level 1 at once, on the seed chosen ahead');
  assert.equal(early.opened[0]!.seed, 'early1');
  assert.equal(early.mode.view().finding, null);
  assert.equal(early.saved.queued().length, AHEAD, 'levels 2 to 4 are ready');
  assert.equal(early.saved.upcoming(), null);
  await early.settled();
  assert.equal(early.jobs.length, asked, 'the queue is full: nothing more to make until a level is played');

  // The same seed on demand, as a `?seed=` link plays it: the same levels, in the same order.
  const later = harness({ newSeed: () => 'unused' });
  later.mode.newRun('early1');
  await later.settled();
  await later.settled();
  const texts = (h: ReturnType<typeof harness>) => [...h.saved.run()!.levels, ...h.saved.queued()].map(l => [l.text, l.explored, l.shortest, l.score, l.line, l.from]);
  assert.deepEqual(texts(early).slice(0, 1 + AHEAD), texts(later).slice(0, 1 + AHEAD));
});

test('the background makes the saved run\'s next levels; a new tier or budget remakes the upcoming run\'s on its seed', async () => {
  const h = harness();
  h.mode.newRun('mine');
  await h.settled();
  h.mode.ahead();
  await h.settled();
  assert.equal(h.saved.upcoming(), null, 'with a run, nothing upcoming');
  assert.equal(h.saved.queued().length, AHEAD);
  let tier = 1;
  const g = harness({ tier: () => tier });
  g.mode.ahead();
  await g.settled();
  tier = 2;
  g.mode.ahead();
  assert.equal(g.saved.upcoming()!.tier, 2);
  assert.equal(g.saved.upcoming()!.seed, 'early1', 'the seed stays');
  assert.equal(g.mode.view().ready, 0);
  await g.settled();
  assert.equal(g.saved.upcoming()!.levels.length, UPCOMING);
  // A typed seed starts on demand and drops the upcoming run.
  g.mode.newRun('typed');
  assert.ok(g.mode.view().finding);
  await g.settled();
  assert.equal(g.opened[0]!.seed, 'typed');
  assert.equal(g.saved.upcoming(), null);
});

test('the card says which levels are ready', () => {
  const run = { depth: 3 } as Parameters<typeof readyWords>[0]['run'];
  assert.equal(readyWords({ run, ready: 0 }), null);
  assert.equal(readyWords({ run, ready: 1 }), 'Level 4 is ready.');
  assert.equal(readyWords({ run, ready: 3 }), 'Levels 4 to 6 are ready.');
  assert.equal(readyWords({ run: null, ready: 1 }), null, 'a new run\'s first level is always at once');
  assert.equal(readyWords({ run: null, ready: 4 }), 'Levels 1 to 4 of a new run are ready.');
});

test('the parts a search finished are kept over a reload, for that request alone', async () => {
  const prev = BANK[0]!;
  const req: Request = { seed: 'reload', tier: 1, grade: 'medium', depth: 2, run: [{ text: prev.text, explored: prev.explored, score: prev.score }], budget: 12 * 10_000 };
  const st = memory();
  const parts: number[] = [];
  const spawn = () => { const w = fakeWorker(); const post = w.postMessage; w.postMessage = m => { parts.push((m as { part: number }).part); post(m); }; return w; };
  const before = createEndlessClient(spawn, () => 1, partStore(st));
  const job = before.make(req);
  await until(() => parts.length >= 2, 'part 1 to be handed out (part 0 found nothing)');
  job.cancel();
  assert.ok(st.data[PARTS_KEY], 'kept in storage');
  // A new page: a new client on the same storage.
  const after = createEndlessClient(spawn, () => 1, partStore(st));
  assert.deepEqual(await after.make(req).result, generate(req, BANKS, { features: [] }));
  assert.equal(parts.filter(k => k === 0).length, 1, 'part 0 is not run again after the reload');
  assert.equal(partStore(st).load(JSON.stringify({ ...req, seed: 'other' })), null, 'another request finds nothing kept');
  assert.equal(partStore(memory({ [PARTS_KEY]: '{oops' })).load(JSON.stringify(req)), null, 'corrupt storage reads as nothing');
});

test('a level the background was making for an old tier is not kept in the upcoming run remade for the new one', async () => {
  let tier = 1;
  const g = harness({ tier: () => tier });
  g.mode.ahead();
  tier = 2;
  g.mode.ahead();
  await g.settled();
  const up = g.saved.upcoming()!;
  assert.equal(up.tier, 2);
  const fresh = harness({ tier: () => 2 });
  fresh.mode.ahead();
  await fresh.settled();
  assert.deepEqual(up.levels.map(l => l.text), fresh.saved.upcoming()!.levels.map(l => l.text), 'the levels the new tier makes, from level 1');
});

test('each grade keeps its own run and best; the best from before there were grades becomes Easy\'s once', () => {
  const st = memory({ [OLD_ENDLESS_KEY]: JSON.stringify({ run: { seed: 'old' }, best: { depth: 7, seed: 'old', moves: 300 } }) });
  const easy = createEndlessSaved(st, 'easy'), medium = createEndlessSaved(st, 'medium'), hard = createEndlessSaved(st, 'hard');
  assert.deepEqual(easy.best(), { depth: 7, seed: 'old', moves: 300 }, 'the old best is Easy\'s');
  assert.equal(easy.run(), null, 'the old run is dropped');
  assert.equal(medium.best(), null);
  hard.start('hh', 2, made(LEVEL_A));
  assert.equal(medium.run(), null, 'Hard\'s run is its own');
  hard.won(20, false);
  assert.deepEqual(hard.best(), { depth: 1, seed: 'hh', moves: 20 });
  assert.equal(st.data[endlessKey('hard')] !== undefined, true);
  easy.start('ee', 1, made(LEVEL_B));
  easy.won(5, false);
  assert.deepEqual(createEndlessSaved(st, 'easy').best(), { depth: 7, seed: 'old', moves: 300 }, 'a shallower run keeps the deeper best');
  const g = gradePref(st);
  assert.equal(g.get(), 'medium', 'Medium until one is chosen');
  g.set('hard');
  assert.equal(gradePref(st).get(), 'hard');
  assert.equal(gradePref(memory({ 'crete-endless-grade': '"impossible"' })).get(), 'medium');
});

test('a link\'s difficulty: Easy, Medium or Hard by name, Medium for anything else', () => {
  assert.equal(gradeFrom('hard'), 'hard');
  assert.equal(gradeFrom(' Easy '), 'easy');
  assert.equal(gradeFrom(null), null);
  assert.equal(gradeFrom('nightmare'), null);
  const st = memory();
  const saves = { easy: createEndlessSaved(st, 'easy'), medium: createEndlessSaved(st, 'medium'), hard: createEndlessSaved(st, 'hard') };
  let grade: Grade = 'easy';
  const mode = createEndlessMode({ saved: g => saves[g], grade: () => grade, setGrade: g => { grade = g; }, client: createEndlessClient(() => fakeWorker()), tier: () => 3, newSeed: () => 'x', play: () => {}, changed: () => {} });
  mode.link('abc', 2, 'hard');
  assert.equal(grade, 'hard', 'the card shows the link\'s grade');
  assert.deepEqual(mode.view().linked, { seed: 'abc', tier: 2, grade: 'hard' });
  mode.link('abc', 2, 'nightmare');
  assert.equal(grade, 'medium');
  mode.choose('easy');
  assert.equal(mode.view().grade, 'easy');
  assert.equal(mode.view().linked!.grade, 'easy', 'choosing a grade plays the link at it');
});

test('a run in play keeps its grade for its wins and Next Level while the card shows another', async () => {
  const st = memory();
  const saves = { easy: createEndlessSaved(st, 'easy'), medium: createEndlessSaved(st, 'medium'), hard: createEndlessSaved(st, 'hard') };
  let grade: Grade = 'hard';
  const opened: EndlessAbout[] = [];
  const base = createEndlessClient(() => fakeWorker());
  const jobs: Promise<unknown>[] = [];
  const requests: Request[] = [];
  const client = { ...base, make: (r: Request) => { requests.push(r); const j = base.make(r); jobs.push(j.result.then(() => {}, () => {})); return j; } };
  const settled = async () => { for (let n = 0; n < jobs.length; n++) await jobs[n]; await new Promise(r => setTimeout(r, 0)); };
  const mode = createEndlessMode({ saved: g => saves[g], grade: () => grade, setGrade: g => { grade = g; }, client, tier: () => 1, newSeed: () => 'hrun', play: (_, a) => opened.push(a), changed: () => {}, budget: () => 12 * 10_000 });
  mode.newRun();
  await settled();
  assert.equal(opened[0]!.grade, 'hard');
  assert.ok(requests.every(r => r.grade === 'hard'), 'Hard\'s levels are asked for at Hard');
  await settled();
  mode.choose('easy');
  mode.won(12, false);
  assert.equal(saves.hard.run()!.cleared, 1, 'the win is Hard\'s');
  assert.equal(saves.easy.run(), null);
  mode.next();
  assert.equal(opened.at(-1)!.grade, 'hard');
  assert.equal(opened.at(-1)!.depth, 2);
});
