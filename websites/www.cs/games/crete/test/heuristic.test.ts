// The relaxed-graph estimate never overestimates the moves a win still needs, and it is consistent: one action
// lowers it by at most one. Checked on every situation breadth-first search reaches (up to 20,000 per level) on the
// trial levels and a generated corpus, and on hand-built levels for a catch, a long slide, a carry round corners
// and a `relics:` header below the grid count.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimateFor } from '../src/puzzle/heuristic.ts';
import type { Estimate } from '../src/puzzle/heuristic.ts';
import { initial } from '../src/puzzle/state.ts';
import type { State } from '../src/puzzle/state.ts';
import { step } from '../src/puzzle/step.ts';
import type { Action } from '../src/puzzle/step.ts';
import { solveBfs, stateKey } from './reference-solver.ts';
import { DIRS } from '../src/puzzle/tiles.ts';
import { parse, serialize } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';
import { TRIALS, trialLevel } from '../src/puzzle/trials.ts';
import { corpus } from './corpus.ts';

const ACTIONS: Action[] = [
  { kind: 'wait' }, ...DIRS.map(dir => ({ kind: 'move', dir }) as Action),
  { kind: 'tool', tool: 'mirror' }, { kind: 'tool', tool: 'cake' }, { kind: 'tool', tool: 'cow' },
];
const CAP = 20_000;
/** States checked against the reference one by one when a level's situations outnumber CAP. */
const SAMPLES = 4;
const SAMPLE_CAP = 20_000;

/** Every situation breadth-first search reaches from the start, up to `cap`, with the edges between them. On the
 *  way it checks that no action from a reached situation lowers the estimate by more than one. `whole` says no
 *  situation was left out, so the distances over these edges are the reference's. */
function explore(level: Level, estimate: Estimate, cap: number) {
  const start = initial(level);
  const ids = new Map([[stateKey(start), 0]]);
  const states: State[] = [start];
  const preds: number[][] = [[]];
  let whole = true;
  for (let head = 0; head < states.length; head++) {
    const s = states[head]!;
    const h = estimate(s);
    for (const a of ACTIONS) {
      const n = step(s, a).state;
      if (h > 1 + estimate(n)) assert.fail(`estimate ${h} then ${estimate(n)} after ${JSON.stringify(a)} on\n${serialize(level)}\nat ${stateKey(s)}`);
      if (n === s || n.outcome === 'lost' || s.outcome === 'won') continue;
      const k = stateKey(n);
      let id = ids.get(k);
      if (id === undefined) {
        if (states.length >= cap) { whole = false; continue; }
        ids.set(k, id = states.length);
        states.push(n);
        preds.push([]);
      }
      preds[id]!.push(head);
    }
  }
  return { states, preds, whole };
}

/** The shortest line's length from each situation, over a whole graph: breadth-first back from every win. */
function distances(states: readonly State[], preds: readonly number[][]): number[] {
  const d = states.map(s => (s.outcome === 'won' ? 0 : Infinity));
  const queue = states.flatMap((s, i) => (s.outcome === 'won' ? [i] : []));
  for (let h = 0; h < queue.length; h++) {
    const x = queue[h]!;
    for (const p of preds[x]!) if (d[p] === Infinity) { d[p] = d[x]! + 1; queue.push(p); }
  }
  return d;
}

/** The estimate is consistent from every situation reached, and a lower bound on the reference's shortest line
 *  from each: all of them when the level's situations fit in CAP, else a sample solved one by one. */
function check(level: Level): void {
  const estimate = estimateFor(level);
  const g = explore(level, estimate, CAP);
  const bound = (s: State, shortest: number) => {
    if (estimate(s) > shortest) assert.fail(`estimate ${estimate(s)} > shortest ${shortest} on\n${serialize(level)}\nat ${stateKey(s)}`);
  };
  if (g.whole) {
    const d = distances(g.states, g.preds);
    g.states.forEach((s, i) => bound(s, d[i]!));
    return;
  }
  const every = Math.floor(g.states.length / SAMPLES);
  for (let i = 0; i < g.states.length; i += every) {
    const r = solveBfs(g.states[i]!, SAMPLE_CAP);
    if (r.solved) bound(g.states[i]!, r.line.length);
  }
}

const shortest = (level: Level): number => {
  const r = solveBfs(initial(level));
  assert.ok(r.solved);
  return r.line.length;
};
const level = (rows: string[], head = '') => parse(`title: t\nintro: i\n${head}\n${rows.join('\n')}\n`);

test('every trial level: a lower bound, consistent', () => {
  TRIALS.forEach((_, i) => check(trialLevel(i)));
});

test('the generated corpus: a lower bound, consistent', () => {
  for (const lv of corpus(3, 200)) check(lv);
});

test('an exit walled off: no win, even relaxed', () => {
  const lv = level(['#####', '#P#E#', '#####']);
  assert.equal(estimateFor(lv)(initial(lv)), Infinity);
});

test('a relic walled off: no win, even relaxed', () => {
  const lv = level(['#######', '#P.E#*#', '#######']);
  assert.equal(estimateFor(lv)(initial(lv)), Infinity);
});

test('no relic needed: the moves to the exit', () => {
  const lv = level(['#######', '#P...E#', '#######']);
  assert.equal(estimateFor(lv)(initial(lv)), 4);
  check(lv);
});

test('a catch that throws Theseus to a safe zone beside the exit counts as one move', () => {
  // The carry down the right drops Theseus on the relic, a trap only the Minotaur's catch gets him out of.
  const lv = level([
    '##############',
    '#ES..........#',
    '#P##########v#',
    '##########M#v#',
    '##########*<<#',
    '##############',
  ], 'hearts: 2\n');
  const r = solveBfs(initial(lv));
  assert.ok(r.solved);
  assert.equal(r.line.length, 14);
  const estimate = estimateFor(lv);
  let s = initial(lv);
  let catches = 0;
  r.line.forEach((a, i) => {
    assert.ok(estimate(s) <= r.line.length - i, `estimate ${estimate(s)} with ${r.line.length - i} to go`);
    const t = step(s, a);
    s = t.state;
    catches += t.events.filter(e => e.kind === 'caught').length;
  });
  assert.equal(catches, 1, 'the shortest line uses a catch');
  check(lv);
});

test('a 10-cell ice slide is one move', () => {
  const lv = level(['##############', '#P==========E#', '##############']);
  assert.equal(shortest(lv), 1);
  assert.equal(estimateFor(lv)(initial(lv)), 1);
  check(lv);
});

test('an ice slide stopped early by a block, and a carry round corners, are one move each', () => {
  const stopped = level(['##############', '#P=====O====E#', '##############']);
  check(stopped);
  const carry = level(['#######', '#P>>>v#', '#####v#', '#E<<<<#', '#######']);
  assert.equal(shortest(carry), 1);
  assert.equal(estimateFor(carry)(initial(carry)), 1);
  check(carry);
});

test('a `relics:` header below the grid count: the nearest relic, not the farthest', () => {
  const lv = level(['#############', '#*.....*P..E#', '#############'], 'relics: 1\n');
  const start = initial(lv);
  assert.equal(shortest(lv), 5);
  assert.equal(estimateFor(lv)(start), 3);
  check(lv);
  const all = level(['#############', '#*.....*P..E#', '#############']);
  assert.equal(estimateFor(all)(initial(all)), 7);
  check(all);
});

test('a relic taken changes which relics count', () => {
  const lv = level(['#############', '#*.....*P..E#', '#############']);
  const estimate = estimateFor(lv);
  const s = step(initial(lv), { kind: 'move', dir: 'left' }).state;
  assert.equal(s.relicsLeft, 1);
  assert.equal(estimate(s), 6);
});
