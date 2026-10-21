// The solver off the page: the client (solver-client.ts) talking to the worker's side (solver-host.ts) in-process,
// through a stand-in for the Worker. Progress, stop and resume, the result cache, a new search replacing a stopped
// one, a node file that fails or is missing, and the disk file over a sync access handle.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { startSearch } from '../src/solver-client.ts';
import type { WorkerLike } from '../src/solver-client.ts';
import { createSolverHost, searchLimits, MEMORY_CEILING } from '../src/solver-host.ts';
import type { NodeFile, Report } from '../src/solver-host.ts';
import { memoryResults } from '../src/puzzle/cache.ts';
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
function inProcess(opts: { results?: ResultStore; open?: () => Promise<NodeFile>; every?: number; spill?: boolean } = {}): WorkerLike {
  const worker: WorkerLike = {
    onmessage: null,
    postMessage(m) { const copy = structuredClone(m); setImmediate(() => host.receive(copy as never)); },
  };
  const host = createSolverHost({
    post: m => { const copy = structuredClone(m); setImmediate(() => worker.onmessage?.({ data: copy })); },
    results: opts.results ?? memoryResults(),
    openFile: opts.open ?? noDisk,
    pause: tick,
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
