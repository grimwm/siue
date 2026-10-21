// A level far past the campaign's size: 40 × 40, three halls behind a red and a blue door, both keys, two blocks
// (one standing in the red doorway) and a Minotaur in the last hall. The solver proves it within 20 seconds and
// agrees with the reference.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../src/puzzle/level.ts';
import { initial } from '../src/puzzle/state.ts';
import { solve } from '../src/puzzle/solver.ts';
import { step } from '../src/puzzle/step.ts';
import { solveBfs } from './reference-solver.ts';

/** mulberry32: a small seeded generator. */
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const N = 40;

/** The level for `seed`: a quarter of the cells walls at random; rows 13 and 27 walls but for a red and a blue
 *  door; Theseus, the red key and a block in the first hall, a block in the red doorway's far side, the blue key in
 *  the second hall, the exit and the Minotaur in the third. */
function bigLevel(seed: number): string {
  const rand = prng(seed);
  const pick = (n: number) => Math.floor(rand() * n);
  const g = Array.from({ length: N }, () => Array<string>(N).fill('.'));
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (rand() < 0.25) g[r]![c] = '#';
  const doors: number[] = [];
  for (const [row, door] of [[13, 'R'], [27, 'B']] as const) {
    g[row]!.fill('#');
    const c = 1 + pick(N - 2);
    g[row]![c] = door;
    doors.push(c);
  }
  g[14]![doors[0]!] = 'O';
  g[15]![doors[0]!] = '.';
  const put = (ch: string, top: number, bottom: number) => {
    for (;;) {
      const r = top + pick(bottom - top), c = pick(N);
      if (g[r]![c] === '.') { g[r]![c] = ch; return; }
    }
  };
  put('P', 0, 13); put('r', 0, 13); put('O', 0, 13);
  put('b', 14, 27);
  put('E', 28, N); put('M', 28, N);
  return `title: the great maze\nintro: generated\n\n${g.map(row => row.join('')).join('\n')}\n`;
}

const SEED = 5;
const SHORTEST = 145;

test('a generated 40 × 40 level with keys, doors and two blocks is proved within 20 seconds', () => {
  const level = parse(bigLevel(SEED));
  assert.equal(level.rows, N);
  assert.equal(level.cols, N);
  const pieces = level.objects.filter(o => o !== null);
  assert.deepEqual(pieces.sort(), ['block', 'block', 'key-blue', 'key-red']);
  assert.ok(level.minotaur);

  const t0 = performance.now();
  const r = solve(initial(level));
  const ms = performance.now() - t0;
  assert.ok(r.solved, 'proved winnable');
  assert.equal(r.line.length, SHORTEST);
  assert.ok(ms < 20_000, `proved in ${Math.round(ms)} ms`);

  // The line wins, takes both keys, opens both doors and pushes the block out of the red doorway.
  let s = initial(level);
  const kinds = new Set<string>();
  for (const a of r.line) { const x = step(s, a); for (const e of x.events) kinds.add(e.kind); s = x.state; }
  assert.equal(s.outcome, 'won');
  for (const k of ['took', 'opened', 'pushed']) assert.ok(kinds.has(k), `the line has a ${k} event`);

  // The reference finishes this one (about 107,000 states): the same answer.
  const ref = solveBfs(initial(level), 400_000);
  assert.ok(ref.solved, 'the reference finishes');
  assert.equal(ref.line.length, r.line.length);
});
