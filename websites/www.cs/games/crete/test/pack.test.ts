// Packing a situation is lossless and exact: what unpacks plays like what was packed, two situations pack alike
// exactly when the reference's key calls them the same, and each field reads back where the layout says. Level 10
// packs at a tenth of the reference's size.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { get, layoutOf, pack, unpack } from '../src/puzzle/pack.ts';
import { initial } from '../src/puzzle/state.ts';
import type { State } from '../src/puzzle/state.ts';
import { step } from '../src/puzzle/step.ts';
import type { Action } from '../src/puzzle/step.ts';
import { stateKey } from './reference-solver.ts';
import { DIRS, KEY_COLORS } from '../src/puzzle/tiles.ts';
import type { Tool } from '../src/puzzle/tiles.ts';
import type { Level } from '../src/puzzle/level.ts';
import { TRIALS, trialLevel } from '../src/puzzle/trials.ts';
import { corpus } from './corpus.ts';

const ACTIONS: Action[] = [
  { kind: 'wait' }, ...DIRS.map(dir => ({ kind: 'move', dir }) as Action),
  { kind: 'tool', tool: 'mirror' }, { kind: 'tool', tool: 'cake' }, { kind: 'tool', tool: 'cow' },
];

const TOOL_LIST: readonly Tool[] = ['mirror', 'cake', 'cow'];

/** Every situation breadth-first search reaches from the start, up to `cap`. */
function reachable(level: Level, cap: number): State[] {
  const start = initial(level);
  const seen = new Set([stateKey(start)]);
  const out = [start];
  for (let head = 0; head < out.length && out.length < cap; head++) {
    for (const a of ACTIONS) {
      const n = step(out[head]!, a).state;
      if (n === out[head] || n.outcome === 'lost') continue;
      const k = stateKey(n);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(n);
      if (out.length >= cap) break;
    }
  }
  return out;
}

function checkLevel(level: Level): void {
  const layout = layoutOf(level);
  const w = new Uint32Array(layout.words);
  const byKey = new Map<string, string>();
  const byWords = new Map<string, string>();
  for (const s of reachable(level, 20_000)) {
    pack(s, layout, w, 0);
    const u = unpack(w, 0, layout, level);
    const key = stateKey(s);
    assert.equal(stateKey(u), key);
    assert.equal(u.moves, 0);
    assert.equal(unpack(w, 0, layout, level, 7).moves, 7);
    assert.equal(get(w, 0, layout.heartAt, layout.heartBits), s.hearts);
    assert.equal(get(w, 0, layout.pageAt, layout.pageBits), s.pages);
    KEY_COLORS.forEach((k, i) => assert.equal(get(w, 0, layout.keyAt[i]!, layout.keyBits[i]!), s.keys[k]));
    TOOL_LIST.forEach((t, i) => assert.equal(get(w, 0, layout.toolAt[i]!, layout.toolBits[i]!), s.tools[t]));
    layout.gear.forEach((g, i) => assert.equal(get(w, 0, layout.gearAt + i, 1), s.gear.includes(g) ? 1 : 0));
    assert.equal(u.outcome, 'playing');
    const packed = Array.from(w).join(',');
    assert.equal(byKey.get(key) ?? packed, packed, 'one key, two packings');
    assert.equal(byWords.get(packed) ?? key, key, 'one packing, two keys');
    byKey.set(key, packed);
    byWords.set(packed, key);
  }
}

test('every trial level packs losslessly and exactly', () => {
  TRIALS.forEach((_, i) => checkLevel(trialLevel(i)));
});

test('the generated corpus packs losslessly and exactly', () => {
  for (const lv of corpus(2, 100)) checkLevel(lv);
});

test('a situation packs at an offset inside a larger array without touching its neighbours', () => {
  const level = trialLevel(9);
  const layout = layoutOf(level);
  const all = new Uint32Array(layout.words * 3).fill(0xffffffff);
  const s = initial(level);
  pack(s, layout, all, layout.words);
  assert.ok(all.slice(0, layout.words).every(x => x === 0xffffffff));
  assert.ok(all.slice(layout.words * 2).every(x => x === 0xffffffff));
  assert.equal(stateKey(unpack(all, layout.words, layout, level)), stateKey(s));
});

test('level 10 packs into a tenth of the reference key and set entry', () => {
  const level = trialLevel(9);
  const states = reachable(level, 20_000);
  const mean = states.reduce((n, s) => n + stateKey(s).length * 2 + 48, 0) / states.length;
  const bytes = layoutOf(level).words * 4;
  assert.ok(bytes * 10 <= mean, `${bytes} bytes against ${mean.toFixed(0)}`);
});
