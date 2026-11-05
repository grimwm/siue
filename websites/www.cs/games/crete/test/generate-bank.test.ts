// The trusted generator's script (tools/generate-bank.ts): it makes what is scarcest (Hard's plateau first, large
// boards especially, then Medium and Easy as Hard fills), never more than fits under a grade's cap, stops when its
// time is spent, posts with its token in the header only, and fails quietly.
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

test('Hard\'s plateau comes first, large boards especially, then Medium and Easy as Hard fills', () => {
  assert.deepEqual(nextWant(tallyOf(counts(shelf(0), shelf(0), shelf(0)))), { grade: 'hard', plateau: true, large: true });
  // Half of Hard's plateau is large: a plain plateau level next.
  assert.deepEqual(nextWant(tallyOf(counts(shelf(0), shelf(0), shelf(80, {}, 40, 20)))), { grade: 'hard', plateau: true, large: false });
  // Large boards are found far less often: while they are wanted, one plateau part in three leans large.
  const t = tallyOf(counts(shelf(0), shelf(0), shelf(0)));
  const leans = [0, 1, 2, 3, 4, 5].map(asked => { t.hard.asked = asked; return nextWant(t)!.large; });
  assert.deepEqual(leans, [true, false, false, true, false, false]);
  // Three quarters of Hard is on the plateau: a level of its climb next.
  assert.deepEqual(nextWant(tallyOf(counts(shelf(0), shelf(0), shelf(40, {}, 30, 15)))), { grade: 'hard', plateau: false, large: false });
  // Hard a third full weighs the same as Medium empty; past that, Medium.
  assert.equal(nextWant(tallyOf(counts(shelf(0), shelf(0), shelf(500))))!.grade, 'hard');
  assert.equal(nextWant(tallyOf(counts(shelf(0), shelf(0), shelf(501))))!.grade, 'medium');
  assert.equal(nextWant(tallyOf(counts(shelf(0), shelf(800), shelf(1100))))!.grade, 'easy');
  // Pending levels take room too; a full grade is never asked for.
  assert.equal(nextWant(tallyOf(counts(shelf(0), shelf(0), shelf(1200, { pending: 300 }))))!.grade, 'medium');
  assert.equal(nextWant(tallyOf(counts(shelf(1500), shelf(1500), shelf(1500)))), null);
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
    upload: async (tuple, made) => { posted.push({ tuple, made }); return 'ok'; },
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
  assert.equal(made.added.hard, f.parts());
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
  const f = fake({ counts: async () => counts(shelf(1500), shelf(1499), shelf(1497, { pending: 1 })) });
  const made = await generateAll(f.deps, { ms: 60_000 });
  assert.deepEqual(made.added, { easy: 0, medium: 1, hard: 2 });
  assert.equal(f.posted.length, 3);
  // A part that makes nothing gives its room back.
  const g = fake({ counts: async () => counts(shelf(1500), shelf(1500), shelf(1499)), empty: i => i === 0 });
  assert.deepEqual((await generateAll(g.deps, { ms: 60_000 })).added.hard, 1);
  // The bank says full: that grade is done.
  const full = fake({ counts: async () => counts(shelf(1500), shelf(1500), shelf(1000)), upload: async () => 'full' });
  const r = await generateAll(full.deps, { ms: 60_000 });
  assert.ok(r.tried <= 2 && r.refused === r.tried);
  const rate = fake({ upload: async () => 'rate' });
  assert.ok((await generateAll(rate.deps, { ms: 60_000 })).tried <= 2, 'a spent share stops the run');
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
