// Spilling the search's nodes to a paged file: the in-memory file, a store that keeps only its first nodes in
// memory and the rest in the file (same answers as the reference), and a file that fails, which ends the search
// "capped" with a reason, never "no win".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryFile } from '../src/puzzle/paged.ts';
import type { PagedFile } from '../src/puzzle/paged.ts';
import { memoryStore, spillingStore } from '../src/puzzle/store.ts';
import type { SpillOptions } from '../src/puzzle/store.ts';
import { astar } from '../src/puzzle/astar.ts';
import { pruneFor } from '../src/puzzle/prune.ts';
import { layoutOf } from '../src/puzzle/pack.ts';
import { initial } from '../src/puzzle/state.ts';
import type { State } from '../src/puzzle/state.ts';
import type { Refuse } from '../src/puzzle/solver.ts';
import { TRIALS, trialLevel } from '../src/puzzle/trials.ts';
import { corpus, CORPUS_CAP } from './corpus.ts';
import { sameAnswers } from './same-answers.ts';

/** Small pages and a small cache, so a search reads its nodes back from the file. */
const SMALL: SpillOptions = { pageBytes: 512, cachePages: 4 };

function spilled(file: () => PagedFile, budget: number, options?: SpillOptions) {
  return (s: State, refuse: Refuse | null, cap: number) => {
    const layout = layoutOf(s.level);
    return astar(s, { cap, refuse, prune: pruneFor(s.level, layout), store: spillingStore(layout.words, file(), budget, options) });
  };
}

test('the memory file reads back what was written, grows, and truncates', () => {
  const f = memoryFile();
  assert.equal(f.size(), 0);
  f.write(0, new Uint8Array([1, 2, 3]));
  f.write(10, new Uint8Array([9, 8]));
  assert.equal(f.size(), 12);
  const out = new Uint8Array(12);
  f.read(0, out);
  assert.deepEqual([...out], [1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 9, 8]);
  const big = new Uint8Array(100_000).map((_, i) => i & 0xff);
  f.write(5, big);
  assert.equal(f.size(), 100_005);
  const back = new Uint8Array(100_000);
  f.read(5, back);
  assert.deepEqual(back, big);
  f.truncate(4);
  assert.equal(f.size(), 4);
  const tail = new Uint8Array(6);
  f.read(0, tail);
  assert.deepEqual([...tail], [1, 2, 3, 0, 0, 0], 'bytes past the end read as zero');
  f.truncate(8);
  assert.equal(f.size(), 8);
  const grown = new Uint8Array(8);
  f.read(0, grown);
  assert.deepEqual([...grown], [1, 2, 3, 0, 0, 0, 0, 0], 'a truncate that grows fills with zero');
});

test('the spilling store keeps the memory store\'s answers, in memory and in the file', () => {
  const W = 3;
  const mem = memoryStore(W);
  const spill = spillingStore(W, memoryFile(), 50, SMALL);
  const w = new Uint32Array(W);
  let seed = 7;
  const rand = (n: number) => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return (seed >>> 8) % n; };
  for (let i = 0; i < 20_000; i++) {
    const k = rand(6000);
    w[0] = k; w[1] = Math.imul(k, 2654435761) >>> 0; w[2] = k & 0xff;
    const parent = mem.size ? rand(mem.size) : -1;
    const action = rand(8), g = rand(400);
    assert.equal(spill.add(w, 0, parent, action, g), mem.add(w, 0, parent, action, g), `add ${i}`);
  }
  assert.equal(spill.size, mem.size);
  assert.ok(spill.size > 3000, `${spill.size} nodes`);
  const a = new Uint32Array(W + 1), b = new Uint32Array(W + 1);
  for (let id = 0; id < mem.size; id++) {
    spill.words(id, a, 1);
    mem.words(id, b, 1);
    assert.deepEqual(a, b);
    assert.equal(spill.parent(id), mem.parent(id));
    assert.equal(spill.action(id), mem.action(id));
    assert.equal(spill.g(id), mem.g(id));
  }
});

test('a node in the file takes a shorter route, and a duplicate there is refused', () => {
  const st = spillingStore(1, memoryFile(), 2, SMALL);
  for (let i = 0; i < 200; i++) assert.equal(st.add(new Uint32Array([i]), 0, i - 1, 1, i + 10), i);
  assert.equal(st.add(new Uint32Array([150]), 0, 3, 2, 500), -1);
  assert.equal(st.add(new Uint32Array([150]), 0, 3, 2, 4), 150);
  assert.equal(st.parent(150), 3);
  assert.equal(st.action(150), 2);
  assert.equal(st.g(150), 4);
  assert.equal(st.parent(0), -1);
  assert.equal(st.size, 200);
});

test('A* spilling past 50 nodes gets the reference answer on every trial level', () => {
  TRIALS.forEach((_, i) => sameAnswers(trialLevel(i), CORPUS_CAP, spilled(memoryFile, 50, SMALL)));
});

test('A* spilling past 50 nodes, through small pages and a small cache, gets the reference answer on a corpus', () => {
  let reads = 0;
  const counted = (): PagedFile => {
    const f = memoryFile();
    return { read(o, into) { reads++; f.read(o, into); }, write: (o, from) => f.write(o, from), size: () => f.size(), truncate: n => f.truncate(n) };
  };
  for (const lv of corpus(4, 100)) sameAnswers(lv, CORPUS_CAP, spilled(counted, 50, SMALL));
  assert.ok(reads > 1000, `${reads} pages read back from the file`);
});

/** A memory file whose write or read throws once it has been called `after` times. */
function failing(kind: 'write' | 'read', after: number): PagedFile {
  const f = memoryFile();
  let calls = 0;
  const fail = () => { if (++calls > after) throw new Error(kind === 'write' ? 'QuotaExceededError: no room' : 'NotReadableError'); };
  return {
    read(offset, into) { if (kind === 'read') fail(); f.read(offset, into); },
    write(offset, from) { if (kind === 'write') fail(); f.write(offset, from); },
    size: () => f.size(),
    truncate: n => f.truncate(n),
  };
}

test('a file that cannot be written or read ends the search capped, with a reason, never "no win"', () => {
  const s = initial(trialLevel(9));
  for (const [kind, after] of [['write', 0], ['write', 3], ['read', 0]] as const) {
    const r = spilled(() => failing(kind, after), 50, SMALL)(s, null, CORPUS_CAP);
    assert.equal(r.solved, false, `${kind} after ${after}`);
    assert.ok(!r.solved && r.capped, `${kind} after ${after}: capped`);
    assert.ok(!r.solved && r.reason && /file/.test(r.reason), `${kind} after ${after}: reason ${!r.solved && r.reason}`);
  }
});

test('a file that loses what was written ends the search capped, with a reason', () => {
  const s = initial(trialLevel(9));
  const truncated = (): PagedFile => {
    const f = memoryFile();
    let writes = 0;
    return {
      read: (o, into) => f.read(o, into),
      write(o, from) { f.write(o, from); if (++writes === 20) f.truncate(0); },
      size: () => f.size(),
      truncate: n => f.truncate(n),
    };
  };
  const shrunk = (): PagedFile => {
    const f = memoryFile();
    return { read: (o, into) => f.read(o, into), write: (o, from) => f.write(o, from), size: () => Math.floor(f.size() / 2), truncate: n => f.truncate(n) };
  };
  for (const [name, file] of [['truncated mid-search', truncated], ['size under-reported', shrunk]] as const) {
    const r = spilled(file, 50, SMALL)(s, null, CORPUS_CAP);
    assert.ok(!r.solved && r.capped, `${name}: capped`);
    assert.ok(!r.solved && r.reason && /file/.test(r.reason) && /missing/.test(r.reason), `${name}: reason ${!r.solved && r.reason}`);
  }
});
