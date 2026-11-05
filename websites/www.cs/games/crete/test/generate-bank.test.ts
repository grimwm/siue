// The trusted generator's script (tools/generate-bank.ts): it shares its time among the grades with room (Hard first,
// never starving Medium and Easy), makes what is scarcest within one (the plateau, large boards especially), never
// more than fits under a grade's cap, turns a full grade
// over by replacing a small share of it with what it made, stops when its time is spent, posts with its token in the
// header only, and fails quietly.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateAll, nextWant, safeUrl, tallyOf, tupleFor, isLarge, LARGE_SIDE } from '../tools/generate-bank.ts';
import type { Counts, GenerateDeps, Shelf, Want } from '../tools/generate-bank.ts';
import { ENDLESS_VERSION, requestOf, sharedOf } from '../src/endless/provenance.ts';
import type { SharedMade } from '../src/endless/provenance.ts';
import { placeOf, planOf, reachOf } from '../src/endless/generate.ts';
import { rngOf } from '../src/endless/random.ts';
import { BANKS } from '../src/endless/bank.ts';
import { tupleShape } from '../src/endless/verifier.ts';

const shelf = (served: number, over: Partial<Shelf> = {}, plateau = 0, large = 0): Shelf => ({
  served, pending: 0, cap: 1500,
  levels: Array.from({ length: served }, (_, i) => (i < large ? [140, 9, 23, 21, 0] : i < plateau ? [140, 9, 15, 15, 0] : [60, 3, 13, 13, 0])),
  ...over,
});
const counts = (easy: Shelf, medium: Shelf, hard: Shelf): Counts => ({ easy, medium, hard });

test('Hard\'s plateau comes first, large boards especially, and each grade with room gets its share of the time', () => {
  assert.deepEqual(nextWant(tallyOf(counts(shelf(0), shelf(0), shelf(0)))), { grade: 'hard', plateau: true, large: true });
  // Half of Hard's plateau is large: a plain plateau level next.
  assert.deepEqual(nextWant(tallyOf(counts(shelf(0), shelf(0), shelf(80, {}, 40, 20)))), { grade: 'hard', plateau: true, large: false });
  // Large boards are found far less often: while they are wanted, one plateau part in three leans large.
  const t = tallyOf(counts(shelf(0), shelf(0), shelf(0)));
  const leans = [0, 1, 2, 3, 4, 5].map(asked => { t.hard.asked = asked; return nextWant(t)!.large; });
  assert.deepEqual(leans, [true, false, false, true, false, false]);
  // Three quarters of Hard is on the plateau: a level of its climb next.
  assert.deepEqual(nextWant(tallyOf(counts(shelf(0), shelf(0), shelf(40, {}, 30, 15)))), { grade: 'hard', plateau: false, large: false });
  // Time shares: the grade furthest behind its share goes next, running parts counting, Hard first on a tie.
  const shares = tallyOf(counts(shelf(0), shelf(0), shelf(0)));
  const order: string[] = [];
  for (let i = 0; i < 10; i++) { const w = nextWant(shares)!; order.push(w.grade); shares[w.grade].running++; }
  assert.deepEqual(order, ['hard', 'medium', 'easy', 'hard', 'medium', 'hard', 'easy', 'hard', 'medium', 'hard']);
  // Hard's slow parts use up its share: Medium and Easy are not starved.
  shares.hard.running = 0; shares.medium.running = 0; shares.easy.running = 0;
  Object.assign(shares.hard, { spent: 600_000, done: 2 });
  Object.assign(shares.medium, { spent: 300_000, done: 10 });
  Object.assign(shares.easy, { spent: 100_000, done: 10 });
  assert.equal(nextWant(shares)!.grade, 'easy');
  shares.easy.room = 0;
  assert.equal(nextWant(shares)!.grade, 'medium', 'a grade without room passes its time on');
  // Pending levels take room too; a full grade only turns over once the others have no room.
  assert.equal(nextWant(tallyOf(counts(shelf(0), shelf(0), shelf(1200, { pending: 300 }))))!.grade, 'medium');
  const full = tallyOf(counts(shelf(1500), shelf(1500), shelf(1500)));
  assert.equal(nextWant(full)!.grade, 'hard', 'turnover keeps Hard first');
  for (const g of ['easy', 'medium', 'hard'] as const) assert.deepEqual([full[g].replace, full[g].room], [true, 22]);
  assert.equal(nextWant(tallyOf(counts(shelf(1500), shelf(1499), shelf(1500))))!.grade, 'medium', 'room before turnover');
  assert.equal(tallyOf(counts(shelf(1499), shelf(0), shelf(0))).easy.replace, false);
  assert.equal(tallyOf(counts(shelf(10, { cap: 10 }), shelf(0), shelf(0))).easy.room, 1, 'a small full grade still turns one over');
  for (const g of ['easy', 'medium', 'hard'] as const) full[g].room = 0;
  assert.equal(nextWant(full), null);
});

test('a tuple is a real request the generator takes, at the place wanted, and a large want leans to large drafts', () => {
  let s = 1;
  const random = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (const want of [{ grade: 'hard', plateau: true, large: true }, { grade: 'medium', plateau: false, large: false }, { grade: 'easy', plateau: true, large: false }] as Want[]) {
    const t = tupleFor(want, random);
    assert.ok(tupleShape(t), 'the shape the bank checks');
    assert.equal(t.v, ENDLESS_VERSION);
    assert.equal(t.grade, want.grade);
    assert.match(t.seed, /^ci-[a-z0-9]{8}$/);
    assert.ok(BANKS[want.grade].some(b => b.text === t.run[0]!.text), 'its run memory is a bundled bank level');
    assert.equal(placeOf(requestOf(t)).band.plateau, want.plateau);
    if (want.large) {
      const { band, hides } = placeOf(requestOf(t));
      const plan = planOf(rngOf('endless', t.seed, t.tier, t.grade, t.depth, 'part', t.k, 0), t.tier, t.grade, hides, null, reachOf(band, t.grade));
      assert.ok(isLarge(t.grade, plan.rows, plan.cols), `its first draft is ${plan.rows}x${plan.cols}, under ${LARGE_SIDE.hard}`);
    }
  }
});

const TOKEN = 'secret-token-abcdefghijklmnopqrstuvwxyz-0123';
const level = (i: number): SharedMade => sharedOf(BANKS.hard[i]!);

/** Deps on a fake clock: each part takes `partMs` and makes a level unless `empty` says not. */
function fake(over: Partial<GenerateDeps> & { partMs?: number; empty?: (n: number) => boolean } = {}) {
  let t = 0, n = 0, stopped = 0;
  const posted: unknown[] = [];
  const lines: string[] = [];
  const deps: GenerateDeps = {
    workers: 2,
    counts: async () => counts(shelf(0), shelf(0), shelf(0)),
    make: async () => { const i = n++; t += over.partMs ?? 1000; return over.empty?.(i) ? null : level(i % BANKS.hard.length); },
    upload: async (tuple, made, replace) => { posted.push({ tuple, made, replace }); return 'ok'; },
    tupleFor: w => tupleFor(w, Math.random),
    now: () => t,
    wait: () => new Promise(() => {}),
    stop: () => { stopped++; },
    log: l => lines.push(l),
    ...over,
  };
  return { deps, posted, lines, stopped: () => stopped, parts: () => n };
}

test('it stops starting parts once its time is spent, and ends the ones still running', async () => {
  const f = fake({ partMs: 1000 });
  const made = await generateAll(f.deps, { ms: 4500 });
  // Two at a time, each a second: parts start at 0, 0, 1, 2, 3, 4 seconds... none at or after 4.5 s.
  assert.ok(f.parts() >= 4 && f.parts() <= 6, `${f.parts()} parts`);
  assert.equal(made.tried, f.parts());
  assert.equal(made.added.hard + made.added.medium + made.added.easy, f.parts());
  // A part that never ends: the wait for the deadline stops the pool.
  let release: () => void = () => {};
  let waits = 0;
  const hung = fake({ make: () => new Promise(() => {}), wait: () => (waits++ ? Promise.resolve() : new Promise<void>(r => { release = r; })) });
  const run = generateAll(hung.deps, { ms: 1000 });
  await new Promise(r => setImmediate(r));
  release();
  const out = await run;
  assert.equal(out.tried, 2, 'one part per worker');
  assert.equal(hung.stopped(), 1, 'the running parts are ended');
  assert.ok(hung.lines.some(l => /time is spent/.test(l)));
});

test('it never makes more than fits, and stops for a full grade or a spent hourly share', async () => {
  const turnover = 22;
  const f = fake({ counts: async () => counts(shelf(1500), shelf(1499), shelf(1497, { pending: 1 })) });
  const made = await generateAll(f.deps, { ms: 60_000 });
  assert.deepEqual(made.added, { easy: turnover, medium: 1, hard: 2 });
  const posted = f.posted as { tuple: { grade: string }; replace: boolean }[];
  assert.equal(posted.length, 3 + turnover);
  assert.ok(posted.every(p => p.replace === (p.tuple.grade === 'easy')), 'only the full grade replaces');
  // A part that makes nothing gives its room back.
  const g = fake({ counts: async () => counts(shelf(1500), shelf(1500), shelf(1499)), empty: i => i === 0 });
  assert.deepEqual((await generateAll(g.deps, { ms: 60_000 })).added.hard, 1);
  // The bank says full: that grade is done.
  const full = fake({ counts: async () => counts(shelf(1500), shelf(1500), shelf(1000)), upload: async () => 'full' });
  const r = await generateAll(full.deps, { ms: 60_000 });
  assert.ok(r.tried <= 6 && r.refused === r.tried, 'at most one round of two parts per grade');
  const rate = fake({ upload: async () => 'rate' });
  assert.ok((await generateAll(rate.deps, { ms: 60_000 })).tried <= 2, 'a spent share stops the run');
});

test('a full grade is replaced only with what the run made: a slow run retires fewer', async () => {
  const turnover = 22;
  const full = () => counts(shelf(1500), shelf(1500), shelf(1500, {}, 1125, 563));
  const f = fake({ counts: async () => full() });
  const made = await generateAll(f.deps, { ms: 3_600_000 });
  assert.deepEqual(made.added, { easy: turnover, medium: turnover, hard: turnover });
  const posted = f.posted as { tuple: { grade: string }; replace: boolean }[];
  assert.ok(posted.every(p => p.replace), 'every level replaces one');
  assert.equal(posted[0]!.tuple.grade, 'hard', 'Hard first');
  // Hard's plateau is rare: one part in four makes a level, and time runs out; only what was made goes in.
  const slow = fake({ counts: async () => full(), partMs: 1000, empty: i => i % 4 !== 0 });
  const few = await generateAll(slow.deps, { ms: 10_000 });
  const sent = slow.posted as { replace: boolean }[];
  assert.ok(few.added.hard < turnover && few.added.hard > 0, `${few.added.hard} replaced`);
  assert.equal(sent.length, few.added.hard + few.added.medium + few.added.easy, 'one post, one retirement, per level made');
  assert.equal(few.empty, few.tried - sent.length);
});

test('from an empty bank a run makes levels for every grade, however slow Hard is', async () => {
  // As the first live run found: Hard's parts slow and mostly empty (7 Hard levels in 47 minutes) must not take the
  // whole run. Hard's parts take ten minutes and one in four makes a level; Medium's and Easy's take two.
  let t = 0, n = 0;
  const f = fake({
    workers: 4,
    now: () => t,
    make: async tuple => { const i = n++; t += tuple.grade === 'hard' ? 600_000 : 120_000; return tuple.grade === 'hard' && i % 4 !== 0 ? null : level(i % BANKS.hard.length); },
  });
  const made = await generateAll(f.deps, { ms: 47 * 60_000 });
  assert.ok(made.added.hard > 0 && made.added.medium > 0 && made.added.easy > 0, JSON.stringify(made.added));
  assert.ok(made.added.medium >= made.added.easy, 'Medium\'s share is larger than Easy\'s');
});

test('it fails quietly, posts to HTTPS only, and never prints its token', async () => {
  const f = fake({ counts: async () => { throw new Error('offline'); } });
  assert.equal((await generateAll(f.deps, { ms: 1000 })).tried, 0);
  assert.match(f.lines[0]!, /could not read/);
  assert.equal(safeUrl('https://www.cs.siue.edu/~wgrim/games/crete/endless-bank.php'), 'https://www.cs.siue.edu/~wgrim/games/crete/endless-bank.php');
  assert.equal(safeUrl('http://localhost:8080/games/crete/endless-bank.php'), 'http://localhost:8080/games/crete/endless-bank.php');
  assert.equal(safeUrl('http://www.cs.siue.edu/x'), null);
  assert.equal(safeUrl('sftp://www.cs.siue.edu/x'), null);
  const g = fake({ upload: async () => 'error' });
  await generateAll(g.deps, { ms: 60_000 });
  assert.ok(g.lines.some(l => /keeps failing/.test(l)));
  assert.ok(!g.lines.join('\n').includes(TOKEN));
});
