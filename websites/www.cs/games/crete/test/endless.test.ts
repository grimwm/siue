// Endless's parts that need no long search: the seeded randomness, the bands of the climb, the teaching numbers the
// gate reads, the piece tier, the saved run, the worker's messages (host and client), and the mode that opens levels.
// test/endless-gate.test.ts runs the generator and the gate.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rngOf, hash, cleanSeed, newSeed } from '../src/endless/random.ts';
import { bandAfter, chapterOf, floorOf, tidyProblems, TEACHING, CLIMB, PLATEAU, FLOOR } from '../src/endless/gate.ts';
import { draft, familiesOf, textOf, mutate, FAMILY_CHAPTER } from '../src/endless/draft.ts';
import { tierOf } from '../src/endless/tier.ts';
import { createEndlessSaved, ENDLESS_KEY, AHEAD } from '../src/endless/saved.ts';
import { createEndlessHost, PROGRESS_MS } from '../src/endless/host.ts';
import type { FromEndless } from '../src/endless/host.ts';
import { createEndlessClient, CancelledError, workersFor, MOST_WORKERS } from '../src/endless/client.ts';
import type { WorkerLike } from '../src/endless/client.ts';
import { createEndlessMode, introOf } from '../src/endless/mode.ts';
import type { EndlessAbout } from '../src/endless/mode.ts';
import { endlessName, endlessKicker, tierWords } from '../src/endless/name.ts';
import { CAMPAIGN_TEXTS } from '../src/endless/campaign.ts';
import { BANK } from '../src/endless/bank.ts';
import type { Made, Request } from '../src/endless/generate.ts';
import { ln, expNeg, settle, generate } from '../src/endless/generate.ts';
import { CHAPTERS, LEVEL_IDS, levelById } from '../src/campaign/chapters.ts';
import { measure, HIDDEN, RAMP } from '../src/puzzle/difficulty.ts';
import { parse } from '../src/puzzle/level.ts';
import type { StorageLike } from '../../_kit/ports.ts';

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

test('a draft is drawn the same from the same seed, as rooms and halls with a start, a beast and an exit', () => {
  const plan = { rows: 12, cols: 12, roomRows: 3, roomCols: 3, families: familiesOf(9).slice(0, 3), relics: 2, hall: 0.2, loop: 0.35 };
  let drawn = 0;
  for (let k = 0; k < 20; k++) {
    const one = draft(rngOf('t', k), plan), two = draft(rngOf('t', k), plan);
    assert.deepEqual(one && textOf(one, 'x'), two && textOf(two, 'x'));
    if (!one) continue;
    drawn++;
    const lv = parse(textOf(one, 'x'));
    assert.ok(lv.minotaur);
    assert.equal(lv.terrain.filter(t => t === 'exit').length, 1);
    assert.ok(Array.isArray(tidyProblems(lv)), 'the gate reads its layout (an untidy draft is climbed away from)');
    const m = mutate(rngOf('m', k), one);
    assert.doesNotThrow(() => parse(textOf(m, 'x')), 'a changed draft is still a level');
  }
  assert.ok(drawn >= 10, `${drawn} of 20 seeds drew a draft`);
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
  assert.deepEqual(floorOf(1), { explored: 12_280, shortest: 36 });
  assert.deepEqual(floorOf(6), { explored: FLOOR, shortest: 30 });
});

test('the climb: each band after the one before by the ramp, inside the campaign\'s, then the plateau', () => {
  const first = bandAfter(null, false)!;
  assert.equal(first.least, FLOOR);
  assert.ok(CLIMB.least >= RAMP.least && CLIMB.most <= RAMP.most);
  const b = bandAfter(10_000, false)!;
  assert.deepEqual(b, { least: 12_000, most: 16_000, plateau: false });
  assert.deepEqual(bandAfter(28_000, false), { least: 33_600, most: 44_800, plateau: false });
  const top = bandAfter(45_000, false)!;
  assert.deepEqual(top, { least: PLATEAU.least, most: PLATEAU.most, plateau: true });
  assert.deepEqual(bandAfter(PLATEAU.least, false), { least: PLATEAU.least, most: PLATEAU.most, plateau: true }, 'once on the plateau, it stays');
  const hidden = bandAfter(10_000, true)!;
  assert.deepEqual(hidden, { least: 11_000, most: 15_000, plateau: false });
  assert.equal(bandAfter(19_000, true), null, 'no hidden wall past HIDDEN.most');
  assert.ok(bandAfter(null, true)!.most <= HIDDEN.most);
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

const made = (text: string, explored = 10_000, shortest = 40, from: Made['from'] = 'bank'): Made => ({ text, explored, shortest, line: 'rr', from, tries: 0, spent: 0 });
const LEVEL_A = 'title: \nintro: \n\n######\n#P..E#\n#M...#\n######\n';
const LEVEL_B = 'title: \nintro: \n\n######\n#P...#\n#M..E#\n######\n';

test('the saved run: started, cleared once per level, advanced only when the next is made and this one cleared', () => {
  const st = memory();
  const s = createEndlessSaved(st);
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
  assert.deepEqual(createEndlessSaved(st).queued().length, 2, 'the queue is kept over a reload');
  s.won(20, true);
  assert.equal(s.run()!.assisted, true);
  assert.deepEqual(s.best(), { depth: 1, seed: 'abc', moves: 30 }, 'a run with help sets no best');
  assert.deepEqual(createEndlessSaved(st).run(), s.run(), 'kept in storage');
});

test('blocked or corrupt Endless storage reads as no run and never throws', () => {
  const throwing: StorageLike = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() {} };
  for (const st of [null, throwing, memory({ [ENDLESS_KEY]: '{oops' }), memory({ [ENDLESS_KEY]: '{"run":{"seed":"x"},"best":null}' })]) {
    const s = createEndlessSaved(st);
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
      const host = createEndlessHost({ post: r => queueMicrotask(() => { if (!w.terminated) w.onmessage?.({ data: r }); }), bank: BANK, known: () => ({ features: [] }), now: () => (t += 100) });
      setTimeout(() => host.receive(m as never), 0);
    },
  };
  return w;
}

test('the host answers from the bank, runs a part of a search, and meets a request it cannot with a failure', () => {
  const out: FromEndless[] = [];
  const host = createEndlessHost({ post: m => out.push(m), bank: BANK, known: () => ({ features: [] }), now: () => 0 });
  host.receive({ type: 'bank', id: 7, request: { seed: 'abc', tier: 1, depth: 1, run: [] }, tries: 0, spent: 0 });
  const last = out.at(-1)!;
  assert.equal(last.type, 'made');
  if (last.type === 'made') {
    assert.equal(last.id, 7);
    assert.equal(last.made.from, 'bank');
    assert.ok(BANK.some(b => b.text === last.made.text && b.chapter === 1));
  }
  const prev = BANK.find(b => b.chapter === 1)!;
  host.receive({ type: 'part', id: 9, part: 0, request: { seed: 'abc', tier: 1, depth: 2, run: [{ text: prev.text, explored: prev.explored }], budget: 100_000 } });
  const part = out.at(-1)!;
  assert.equal(part.type, 'part');
  if (part.type === 'part') assert.ok(part.result.spent >= 100_000 / 12 || part.result.found, 'a part spends its share of the budget or finds a level');
  host.receive({ type: 'part', id: 10, part: 1, request: { seed: 'abc', tier: 1, depth: 2, run: [{ text: prev.text, explored: prev.explored }], budget: 100_000 } });
  assert.equal(out.at(-1)!.type, 'part');
  host.receive({ type: 'part', id: 11, part: 12, request: { seed: 'abc', tier: 1, depth: 2, run: [{ text: prev.text, explored: prev.explored }], budget: 100_000 } });
  assert.equal(out.at(-1)!.type, 'failed', 'a search has no part past its last');
  const empty = createEndlessHost({ post: m => out.push(m), bank: [], known: () => ({ features: [] }), now: () => 0 });
  empty.receive({ type: 'bank', id: 8, request: { seed: 'abc', tier: 1, depth: 1, run: [] }, tries: 0, spent: 0 });
  assert.deepEqual(out.at(-1), { type: 'failed', id: 8, message: 'the bank is empty' });
});

test('the host spaces its progress reports', () => {
  const out: FromEndless[] = [];
  let t = 0;
  const host = createEndlessHost({ post: m => out.push(m), bank: BANK, known: () => ({ features: [] }), now: () => (t += PROGRESS_MS / 4) });
  const prev = BANK.find(b => b.chapter === 1)!;
  host.receive({ type: 'part', id: 1, part: 0, request: { seed: 'abc', tier: 1, depth: 2, run: [{ text: prev.text, explored: prev.explored }], budget: 12 * 300_000 } });
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
  const req: Request = { seed: 'abc', tier: 2, depth: 1, run: [] };
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
  const prev = BANK.find(b => b.chapter === 1)!;
  const req: Request = { seed: 'side', tier: 1, depth: 2, run: [{ text: prev.text, explored: prev.explored }], budget: 12 * 10_000 };
  const workers: ReturnType<typeof fakeWorker>[] = [];
  const three = createEndlessClient(() => { const w = fakeWorker(); workers.push(w); return w; }, () => 3);
  const one = createEndlessClient(() => fakeWorker(), () => 1);
  const a = await three.make(req).result, b = await one.make(req).result;
  assert.deepEqual(a, b);
  assert.deepEqual(a, generate(req, BANK, { features: [] }));
  assert.ok(workers.length <= 3, 'three workers at most at once');
  const firsts = workers.slice(0, 3).map(w => (w.posted[0] as { part?: number }).part);
  assert.deepEqual(firsts, [0, 1, 2], 'the first three parts at once, one to each worker');
});

test('the mode: a new run opens its first level, the next is made meanwhile, and Next Level opens it', async () => {
  const st = memory();
  const saved = createEndlessSaved(st);
  const opened: EndlessAbout[] = [];
  // Every job the mode starts, so the test waits on its answer, not on the clock.
  const base = createEndlessClient(() => fakeWorker());
  const jobs: Promise<unknown>[] = [];
  const client = { ...base, make: (r: Request) => { const j = base.make(r); jobs.push(j.result.then(() => {}, () => {})); return j; } };
  const settled = async () => { for (let n = 0; n < jobs.length; n++) await jobs[n]; await new Promise(r => setTimeout(r, 0)); };
  let changes = 0;
  const mode = createEndlessMode({ saved, client, tier: () => 1, newSeed: () => 'fresh1', play: (_, about) => opened.push(about), changed: () => { changes++; }, budget: () => 100_000 });
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
  assert.deepEqual(mode.view().linked, { seed: 'other', tier: 4 });
  mode.cancel();
  assert.equal(mode.view().linked, null);
});

test('the search\'s log and exp, made of + - * / alone, agree with Math\'s', () => {
  for (const x of [0.001, 0.3, 1, 1.5, 2, 7.25, 1e6]) assert.ok(Math.abs(ln(x) - Math.log(x)) < 1e-12, `ln ${x}`);
  for (const y of [0, 0.1, 0.25, 1, 4, 20]) assert.ok(Math.abs(expNeg(y) - Math.exp(-y)) < 1e-12, `exp -${y}`);
  assert.equal(expNeg(100), 0);
});

test('the start card says when a level comes from the level bank, and says nothing of it for a made one', () => {
  const l = { text: LEVEL_A, explored: 7000, shortest: 31, line: '', from: 'bank' as const };
  assert.equal(introOf('abcdef', l), 'Seed abcdef. The fewest moves are 31. From the level bank.');
  assert.equal(introOf('abcdef', { ...l, from: 'made' }), 'Seed abcdef. The fewest moves are 31.');
});

test('a run saved before levels were made ahead (no ahead list) still reads, and queues behind its next', () => {
  const { tries: _t, spent: _s, ...first } = made(LEVEL_A);
  const old = { seed: 'abc', tier: 1, depth: 1, levels: [first], next: null, cleared: 0, moves: 0, assisted: false, best: null };
  const s = createEndlessSaved(memory({ [ENDLESS_KEY]: JSON.stringify({ run: old, best: null }) }));
  assert.equal(s.run()!.seed, 'abc');
  assert.deepEqual(s.queued(), []);
  s.addMade('abc', 2, made(LEVEL_B));
  s.addMade('abc', 3, made(LEVEL_A));
  assert.equal(s.queued().length, 2);
});
