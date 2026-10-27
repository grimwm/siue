// The solver off the page: the client (solver-client.ts) talking to the worker's side (solver-host.ts) in-process,
// through a stand-in for the Worker. Progress, stop, resume and cancel, the result cache, a new search replacing a stopped
// one, a node file that fails or is missing, and the disk file over a sync access handle.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CancelledError, startSearch } from '../src/solver-client.ts';
import type { WorkerLike } from '../src/solver-client.ts';
import { createSolverHost, searchLimits, MEMORY_CEILING } from '../src/solver-host.ts';
import type { NodeFile, Report } from '../src/solver-host.ts';
import { memoryResults, resultKey } from '../src/puzzle/cache.ts';
import type { ResultStore } from '../src/puzzle/cache.ts';
import { handleFile, memoryFile } from '../src/puzzle/paged.ts';
import type { PagedFile, SyncHandle } from '../src/puzzle/paged.ts';
import { measure } from '../src/puzzle/difficulty.ts';
import type { Difficulty } from '../src/puzzle/difficulty.ts';
import type { SolveResult } from '../src/puzzle/solver.ts';
import { SOLVER_CAP } from '../src/puzzle/solver.ts';
import { TRIALS, trialLevel } from '../src/puzzle/trials.ts';

const L9 = TRIALS[8]!.text;
const L9_SHORTEST = 54;
const tick = () => new Promise<void>(r => setImmediate(r));

interface Disk { opened: number; closed: number; written: number; open(): Promise<NodeFile> }
/** A disk whose node files live in memory, counting the files opened and closed and the bytes written. */
function memoryDisk(make: () => PagedFile = memoryFile): Disk {
  const d: Disk = {
    opened: 0, closed: 0, written: 0,
    async open() {
      d.opened++;
      const file = make();
      const counted: PagedFile = { ...file, write(offset, from) { file.write(offset, from); d.written += from.length; } };
      return { file: counted, close: () => { d.closed++; } };
    },
  };
  return d;
}
const noDisk = (): Promise<NodeFile> => Promise.reject(new Error('SecurityError: no origin private file system'));

/** The worker's side behind a stand-in for the Worker: every message is cloned and arrives a turn later. */
function inProcess(opts: { results?: ResultStore; open?: () => Promise<NodeFile>; every?: number; spill?: boolean; version?: string } = {}): WorkerLike {
  const worker: WorkerLike = {
    onmessage: null,
    postMessage(m) { const copy = structuredClone(m); setImmediate(() => host.receive(copy as never)); },
  };
  const host = createSolverHost({
    post: m => { const copy = structuredClone(m); setImmediate(() => worker.onmessage?.({ data: copy })); },
    results: opts.results ?? memoryResults(),
    openFile: opts.open ?? noDisk,
    pause: tick,
    version: opts.version ?? 'test',
    every: opts.every ?? 512,
    // Spilling: 2,000 nodes in memory, the rest on 4 KiB pages of which 4 are cached.
    spill: opts.spill ? { memoryNodes: 2_000, pageBytes: 4096, cachePages: 4 } : undefined,
  });
  return worker;
}

const lengthOf = (r: SolveResult | Difficulty) => {
  assert.ok('line' in r, 'a solve result');
  return r.line.length;
};

test('a search reports progress and resolves with the shortest line', async () => {
  const disk = memoryDisk();
  const job = startSearch(L9, 'solve', inProcess({ open: () => disk.open(), spill: true }));
  const seen: Report[] = [];
  job.progress(p => seen.push(p));
  const r = await job.result;
  assert.equal(r.solved, true);
  assert.equal(lengthOf(r), L9_SHORTEST);
  assert.ok(seen.length >= 2, `progress arrives (${seen.length} reports)`);
  assert.ok(seen.every(p => p.storage === 'disk'), 'the progress says the nodes go to disk');
  assert.ok(disk.written > 0, 'nodes past the memory budget went to the node file');
  for (let i = 1; i < seen.length; i++) assert.ok(seen[i]!.expanded >= seen[i - 1]!.expanded);
  assert.equal(disk.opened, 1);
  assert.equal(disk.closed, 1, 'the node file is closed when the search ends');
});

test('without the disk the search keeps its nodes in memory and says so', async () => {
  const job = startSearch(L9, 'solve', inProcess());
  const seen: Report[] = [];
  job.progress(p => seen.push(p));
  assert.equal(lengthOf(await job.result), L9_SHORTEST);
  assert.ok(seen.length > 0 && seen.every(p => p.storage === 'memory'));
});

test('stop pauses the search between batches; resume finishes the same search', async () => {
  const job = startSearch(L9, 'solve', inProcess());
  const seen: Report[] = [];
  let stoppedAt = -1;
  job.progress(p => {
    seen.push(p);
    if (stoppedAt < 0 && p.expanded > 0) { stoppedAt = seen.length; job.stop(); }
  });
  let done = false;
  void job.result.then(() => { done = true; });
  while (stoppedAt < 0) await tick();
  for (let i = 0; i < 50; i++) await tick();
  assert.equal(done, false, 'no answer while stopped');
  assert.ok(seen.length <= stoppedAt + 1, 'at most the batch under way reports while stopped');
  const before = seen.at(-1)!.expanded;
  job.resume();
  const r = await job.result;
  assert.equal(lengthOf(r), L9_SHORTEST);
  assert.ok(seen.at(-1)!.expanded > before, 'the search went on from where it stopped');
});

/** Theseus beside the exit among relics he need not take; the beast behind a green door whose key is sealed in the
 *  wall. Every line from the start is a quick win, but proving the beast never gets out takes the catch search
 *  every situation. */
const PENNED = `title: t\nintro: i\nrelics: 0\n\n${[
  '#############g', '#PE..........#', '#.........*..#', '#...*........#', '#........*...#', '#..*.........#',
  '#.......*....#', '#######G######', '#............#', '#............#', '#............#', '#............#',
  '#M...........#', '##############',
].join('\n')}\n`;

test('a measure reports progress through its catch search, and stop pauses it there', async () => {
  const job = startSearch(PENNED, 'measure', inProcess({ every: 64 }));
  const seen: Report[] = [];
  let stoppedAt = -1;
  job.progress(p => {
    seen.push(p);
    if (stoppedAt < 0) { stoppedAt = seen.length; job.stop(); }
  });
  let done = false;
  void job.result.then(() => { done = true; });
  while (stoppedAt < 0 && !done) await tick();
  assert.ok(stoppedAt > 0, 'progress came before the answer');
  for (let i = 0; i < 50; i++) await tick();
  assert.equal(done, false, 'no answer while stopped');
  assert.ok(seen.length <= stoppedAt + 1, 'at most the batch under way reports while stopped');
  job.resume();
  const d = await job.result as Difficulty;
  assert.equal(d.label, 'solo');
  assert.equal(d.shortest, 1);
  assert.ok(seen.length >= 5, `the catch search reported as it went (${seen.length} reports)`);
});

test('a finished search is cached: the second run answers at once, without progress', async () => {
  const results = memoryResults();
  const worker = inProcess({ results });
  const first = startSearch(L9, 'solve', worker);
  const r1 = await first.result;
  const job = startSearch(L9, 'solve', worker);
  const seen: Report[] = [];
  job.progress(p => seen.push(p));
  const r2 = await job.result;
  assert.equal(seen.length, 0, 'no progress: the answer came from the cache');
  assert.equal(lengthOf(r2), L9_SHORTEST);
  assert.deepEqual(r2, r1, 'the same line, from the cached letters');
});

test('the host trims after it caches a result', async () => {
  let trims = 0;
  const results: ResultStore = { ...memoryResults(), trim: async () => { trims++; } };
  await startSearch(L9, 'solve', inProcess({ results })).result;
  assert.equal(trims, 1);
});

test('a cache entry from another build is a miss: the search runs again', async () => {
  const results = memoryResults();
  await startSearch(L9, 'solve', inProcess({ results, version: 'old' })).result;
  const job = startSearch(L9, 'solve', inProcess({ results, version: 'new' }));
  const seen: Report[] = [];
  job.progress(p => seen.push(p));
  assert.equal(lengthOf(await job.result), L9_SHORTEST);
  assert.ok(seen.length > 0, 'searched, not answered from the old build\'s entry');
});

test('a cached line that does not win is a miss: the search runs again', async () => {
  const results = memoryResults();
  const key = await resultKey(L9, 'solve', 'test');
  for (const line of ['w'.repeat(L9_SHORTEST), 'uq', 'u']) {
    await results.put(key, { solved: true, line, explored: 5 });
    const job = startSearch(L9, 'solve', inProcess({ results }));
    const seen: Report[] = [];
    job.progress(p => seen.push(p));
    const r = await job.result;
    assert.equal(lengthOf(r), L9_SHORTEST, line);
    assert.ok(seen.length > 0, `${line}: searched`);
  }
});

test('a cached measure with no line is a miss; one with its line is served', async () => {
  const d = measure(trialLevel(0));
  const { line: _line, ...old } = d;
  const key = await resultKey(TRIALS[0]!.text, 'measure', 'test');
  const run = async (difficulty: unknown) => {
    const results = memoryResults();
    await results.put(key, { solved: d.solved, line: '', explored: d.explored, difficulty: difficulty as Difficulty });
    const job = startSearch(TRIALS[0]!.text, 'measure', inProcess({ results, every: 1 }));
    const seen: Report[] = [];
    job.progress(p => seen.push(p));
    return { answer: await job.result, searched: seen.length > 0 };
  };
  const stale = await run(old);
  assert.equal(stale.searched, true, 'no line: searched again');
  assert.deepEqual(stale.answer, d);
  const fresh = await run(d);
  assert.equal(fresh.searched, false, 'with its line: served from the cache');
  assert.deepEqual(fresh.answer, d);
});

/** A worker that never answers, whose error can be fired; it records whether it was terminated. */
function failingWorker() {
  const w = {
    onmessage: null as WorkerLike['onmessage'],
    onerror: null as ((e: unknown) => void) | null,
    sent: [] as unknown[],
    terminated: false,
    postMessage(m: unknown) { w.sent.push(m); },
    terminate() { w.terminated = true; },
  };
  return w;
}

test('a worker that errors rejects the search under way, is terminated, and later searches on it reject at once', async () => {
  const w = failingWorker();
  const job = startSearch(L9, 'solve', w);
  w.onerror?.(new Error('404'));
  await assert.rejects(job.result, /solver worker failed/);
  assert.ok(w.terminated, 'the worker is terminated, so it runs nothing on');
  await assert.rejects(startSearch(L9, 'solve', w).result, /solver worker failed/);
});

test('without a Worker to start the search rejects, every time, instead of hanging', async () => {
  // Node has no Worker: the default worker cannot be made.
  await assert.rejects(startSearch(L9, 'solve').result, /solver worker/);
  await assert.rejects(startSearch(L9, 'solve').result, /solver worker/);
});

test('a store that fails reads as a miss: the search runs and nothing throws', async () => {
  const broken: ResultStore = { get: () => Promise.reject(new Error('quota')), put() { throw new Error('quota'); } };
  const job = startSearch(L9, 'solve', inProcess({ results: broken }));
  assert.equal(lengthOf(await job.result), L9_SHORTEST);
});

test('a new search replaces a stopped one: the old one is cancelled and its file closed', async () => {
  const disk = memoryDisk();
  const worker = inProcess({ open: () => disk.open() });
  const old = startSearch(L9, 'solve', worker);
  let stopped = false;
  old.progress(p => { if (!stopped && p.expanded > 0) { stopped = true; old.stop(); } });
  while (!stopped) await tick();
  const next = startSearch(TRIALS[0]!.text, 'solve', worker);
  await assert.rejects(old.result, /cancelled/);
  assert.equal(lengthOf(await next.result), 10);
  assert.equal(disk.opened, 2);
  assert.equal(disk.closed, 2, 'both node files are closed');
});

test('a node file that fails ends the search capped with a reason, never "no win"', async () => {
  const failing = (): PagedFile => ({ ...memoryFile(), write() { throw new Error('QuotaExceededError'); } });
  const disk = memoryDisk(failing);
  const job = startSearch(L9, 'solve', inProcess({ open: () => disk.open(), spill: true }));
  const r = await job.result as SolveResult;
  assert.equal(r.solved, false);
  assert.ok(!r.solved && r.capped && /QuotaExceededError/.test(r.reason ?? ''), JSON.stringify(r));
  assert.equal(disk.closed, 1);
});

test('measure runs in the worker too, its searches sharing one node file, and gives measure\'s numbers', async () => {
  const disk = memoryDisk();
  const job = startSearch(L9, 'measure', inProcess({ open: () => disk.open(), spill: true }));
  const seen: Report[] = [];
  job.progress(p => seen.push(p));
  const d = await job.result as Difficulty;
  assert.deepEqual(d, measure(trialLevel(8)));
  assert.equal(d.shortest, L9_SHORTEST);
  assert.ok(seen.length > 0);
  assert.ok(disk.written > 0);
  assert.equal(disk.closed, 1);
});

test('a level that does not parse rejects with the parser\'s message', async () => {
  const job = startSearch('title: x\n\nP?E\n', 'solve', inProcess());
  await assert.rejects(job.result, /line 3, column 2/);
});

test('the worker\'s limits keep every in-memory array within the ceiling before the cap', () => {
  const small = searchLimits(4, 'disk');
  assert.equal(small.cap, SOLVER_CAP, 'a campaign-sized level gets the full cap');
  for (let words = 1; words <= 160; words++) {
    for (const storage of ['disk', 'memory'] as const) {
      const { cap, memoryNodes, bytes } = searchLimits(words, storage);
      assert.ok(cap > 0 && cap <= SOLVER_CAP);
      assert.ok(memoryNodes <= cap);
      assert.ok(bytes(cap) <= MEMORY_CEILING, `${words} words on ${storage}: ${bytes(cap)} bytes at the cap`);
    }
  }
});

/** A sync access handle over an array, as OPFS gives one in a worker; `short` makes reads or writes come up short. */
function fakeHandle(short: { read?: boolean; write?: boolean } = {}): SyncHandle {
  const f = memoryFile();
  return {
    read(buffer, { at }) {
      f.read(at, buffer);
      return Math.max(0, Math.min(buffer.length, f.size() - at)) - (short.read ? 1 : 0);
    },
    write(buffer, { at }) {
      f.write(at, short.write ? buffer.subarray(1) : buffer);
      return buffer.length - (short.write ? 1 : 0);
    },
    getSize: () => f.size(),
    truncate: n => f.truncate(n),
  };
}

test('the disk file reports its size truthfully and throws on a short read or write', () => {
  const file = handleFile(fakeHandle());
  file.write(8, new Uint8Array([1, 2, 3]));
  assert.equal(file.size(), 11);
  const into = new Uint8Array(6);
  file.read(7, into);
  assert.deepEqual([...into], [0, 1, 2, 3, 0, 0], 'bytes past the end read as zero');
  file.truncate(9);
  assert.equal(file.size(), 9);
  const shortRead = handleFile(fakeHandle({ read: true }));
  shortRead.write(0, new Uint8Array(16));
  assert.throws(() => shortRead.read(0, new Uint8Array(16)), /short read/);
  assert.throws(() => handleFile(fakeHandle({ write: true })).write(0, new Uint8Array(4)), /short write/);
});

test('cancel rejects the result with CancelledError at once', async () => {
  const job = startSearch(TRIALS[9]!.text, 'solve', inProcess());
  job.cancel();
  await assert.rejects(job.result, CancelledError);
});

test('a cancelled search reports no more progress', async () => {
  const job = startSearch(L9, 'solve', inProcess());
  let count = 0;
  let cancelled = false;
  let late = 0;
  job.progress(() => { count++; if (cancelled) late++; });
  while (count === 0) await tick();
  job.cancel();
  cancelled = true;
  await assert.rejects(job.result, CancelledError);
  for (let i = 0; i < 20; i++) await tick();
  assert.equal(late, 0);
});

test('cancel closes the node file', async () => {
  const disk = memoryDisk();
  const job = startSearch(L9, 'solve', inProcess({ open: () => disk.open() }));
  let seen = false;
  job.progress(() => { seen = true; });
  while (!seen) await tick();
  job.cancel();
  await assert.rejects(job.result, CancelledError);
  for (let i = 0; i < 20 && disk.closed === 0; i++) await tick();
  assert.equal(disk.opened, 1);
  assert.equal(disk.closed, 1);
});

test('a stopped search can be cancelled: it rejects with CancelledError and its file closes once', async () => {
  const disk = memoryDisk();
  const job = startSearch(L9, 'solve', inProcess({ open: () => disk.open() }));
  let stopped = false;
  job.progress(p => { if (!stopped && p.expanded > 0) { stopped = true; job.stop(); } });
  while (!stopped) await tick();
  for (let i = 0; i < 20; i++) await tick();
  job.cancel();
  await assert.rejects(job.result, CancelledError);
  for (let i = 0; i < 20 && disk.closed === 0; i++) await tick();
  for (let i = 0; i < 20; i++) await tick();
  assert.equal(disk.opened, 1);
  assert.equal(disk.closed, 1);
});

test('a search started after a cancel runs', async () => {
  const worker = inProcess();
  const first = startSearch(L9, 'solve', worker);
  first.cancel();
  await assert.rejects(first.result, CancelledError);
  const r = await startSearch(L9, 'solve', worker).result;
  assert.equal(r.solved, true);
});
