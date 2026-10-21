// The node store and the A* search behind the solver: duplicates, growth and round trips in the store; short
// lines, the cap and progress reports in the search.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStore } from '../src/puzzle/store.ts';
import { astar } from '../src/puzzle/astar.ts';
import type { Progress } from '../src/puzzle/astar.ts';
import { caught } from '../src/puzzle/solver.ts';
import { solveBfs } from '../src/puzzle/solver-bfs.ts';
import { step } from '../src/puzzle/step.ts';
import { grid, mv } from './puzzle-grid.ts';

const opts = (cap: number) => ({ cap, refuse: null, prune: null });

test('the store refuses a duplicate and round-trips words, parent, action and g', () => {
  const st = memoryStore(2);
  const w = new Uint32Array([7, 0xffffffff, 1, 2]);
  assert.equal(st.add(w, 0, -1, 0, 0), 0);
  assert.equal(st.add(w, 2, 0, 5, 1), 1);
  assert.equal(st.add(w, 0, 1, 3, 2), -1, 'an equal situation with no shorter route is a duplicate');
  assert.equal(st.add(new Uint32Array([1, 2]), 0, 0, 1, 9), -1, 'equal words at another offset');
  assert.equal(st.size, 2);
  const out = new Uint32Array(3);
  st.words(0, out, 1);
  assert.deepEqual([...out], [0, 7, 0xffffffff]);
  assert.equal(st.parent(1), 0);
  assert.equal(st.action(1), 5);
  assert.equal(st.g(1), 1);
  assert.equal(st.parent(0), -1);
});

test('a shorter route to a stored situation takes its place', () => {
  const st = memoryStore(1);
  const w = new Uint32Array([42]);
  st.add(new Uint32Array([1]), 0, -1, 0, 0);
  assert.equal(st.add(w, 0, 0, 2, 5), 1);
  assert.equal(st.add(w, 0, 0, 3, 3), 1, 'returned again: the route is shorter');
  assert.equal(st.g(1), 3);
  assert.equal(st.action(1), 3);
  assert.equal(st.size, 2);
});

test('the store grows past its first capacity and keeps every node', () => {
  const st = memoryStore(3);
  const w = new Uint32Array(3);
  const n = 100_000;
  for (let i = 0; i < n; i++) {
    w[0] = i; w[1] = i * 7919; w[2] = ~i;
    assert.equal(st.add(w, 0, i - 1, i & 7, i), i);
  }
  assert.equal(st.size, n);
  for (let i = 0; i < n; i += 997) {
    w[0] = i; w[1] = i * 7919; w[2] = ~i;
    assert.equal(st.add(w, 0, 0, 0, i), -1);
    const out = new Uint32Array(3);
    st.words(i, out, 0);
    assert.deepEqual([...out], [...w]);
    assert.equal(st.parent(i), i - 1);
    assert.equal(st.action(i), i & 7);
    assert.equal(st.g(i), i);
  }
});

test('A* on a 1 by 3 corridor: one move', () => {
  const r = astar(grid(['.PE']), opts(100));
  assert.ok(r.solved);
  assert.deepEqual(r.line, [mv('right')]);
});

test('A* finds a shortest line where a greedy one is longer, and wins on the start', () => {
  // The exit is two steps away as the crow flies, but the wall sends the line round.
  const s = grid(['P#E', '.#.', '...']);
  const r = astar(s, opts(1000));
  const want = solveBfs(s);
  assert.ok(r.solved && want.solved);
  assert.equal(r.line.length, want.line.length);
  let st = s;
  for (const a of r.line) st = step(st, a).state;
  assert.equal(st.outcome, 'won');
  const won = { ...s, outcome: 'won' as const };
  assert.deepEqual(astar(won, opts(10)), { solved: true, line: [], explored: 0 });
});

test('A*: no way out, a tiny cap, and refusing catches', () => {
  const none = astar(grid(['P#E']), opts(100));
  assert.ok(!none.solved && !none.capped);
  const capped = astar(grid(['P........E']), opts(3));
  assert.ok(!capped.solved && capped.capped);
  assert.equal(capped.explored, 3);
  const one = astar(grid(['P.E']), opts(1));
  assert.ok(!one.solved && one.capped);
  assert.equal(one.explored, 1);
  // The only win runs through the beast: refusing catches, there is none.
  const rows = ['########', '#..SM.E#', '#......#', '#......#', '#.....P#', '########'];
  assert.ok(astar(grid(rows, 'hearts: 2'), opts(100_000)).solved);
  const refused = astar(grid(rows, 'hearts: 2'), { cap: 100_000, refuse: caught, prune: null });
  assert.ok(!refused.solved && !refused.capped);
});

test('progress is reported with non-decreasing expansions', () => {
  const seen: Progress[] = [];
  const r = astar(grid(['P.........', '..........', '..........', '.........E']), {
    cap: 100_000, refuse: null, prune: null, progressEvery: 2, onProgress: p => seen.push({ ...p }),
  });
  assert.ok(r.solved);
  assert.ok(seen.length >= 2, `${seen.length} reports`);
  for (let i = 1; i < seen.length; i++) assert.ok(seen[i]!.expanded >= seen[i - 1]!.expanded);
  assert.ok(seen.every(p => p.startH === 12 && p.bestF >= 12 && p.stored >= 1));
});
