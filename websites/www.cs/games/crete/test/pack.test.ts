// Packing a situation is lossless and exact: what unpacks plays like what was packed, two situations pack alike
// exactly when the reference's key calls them the same, each field reads back where the layout says, and every
// block and hazard lies on a cell the layout encodes it on, every piece in play. Level 10 packs at a tenth of the
// reference's size, and Chapter 1 packs into as few words as it ever has.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { get, layoutOf, pack, unpack } from '../src/puzzle/pack.ts';
import { initial } from '../src/puzzle/state.ts';
import { parse } from '../src/puzzle/level.ts';
import type { State } from '../src/puzzle/state.ts';
import { step } from '../src/puzzle/step.ts';
import type { Action } from '../src/puzzle/step.ts';
import { stateKey } from './reference-solver.ts';
import { DIRS, KEY_COLORS } from '../src/puzzle/tiles.ts';
import type { Tool } from '../src/puzzle/tiles.ts';
import type { Level } from '../src/puzzle/level.ts';
import { TRIALS, trialLevel } from '../src/puzzle/trials.ts';
import { corpus, prng } from './corpus.ts';
import { PIECE_LEVELS } from './piece-levels.ts';

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
  const blockCells = new Set([...layout.blockOnly, ...layout.blockOrObject]);
  const hazardCells = new Set(layout.hazardCells);
  for (const s of reachable(level, 20_000)) {
    s.objects.forEach((o, i) => {
      if (o === 'block') assert.ok(blockCells.has(i), `a block at cell ${i}, outside the cells pack.ts gives blocks`);
    });
    if (layout.hazardSlots === 0) {
      for (const h of s.hazards) {
        const i = h.at.r * level.cols + h.at.c;
        assert.ok(hazardCells.has(i), `a hazard at cell ${i}, outside the cells pack.ts gives hazards`);
      }
    }
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

test('every piece level packs losslessly and exactly', () => {
  for (const [name, lv] of Object.entries(PIECE_LEVELS)) {
    assert.ok(lv.rows <= 8 && lv.cols <= 8, `${name} is small`);
    checkLevel(lv);
  }
});

test('pack and unpack round-trip with every piece in play', () => {
  const random = prng(7);
  for (const [name, level] of Object.entries(PIECE_LEVELS)) {
    const layout = layoutOf(level);
    const w = new Uint32Array(layout.words);
    const again = new Uint32Array(layout.words);
    let checked = 0;
    for (let line = 0; line < 40; line++) {
      let s = initial(level);
      for (let turn = 0; turn < 60 && s.outcome === 'playing'; turn++) {
        pack(s, layout, w, 0);
        const u = unpack(w, 0, layout, level);
        pack(u, layout, again, 0);
        assert.deepEqual(Array.from(again), Array.from(w), `${name}: unpacking and packing again changes the words`);
        assert.equal(stateKey(u), stateKey(s), `${name}: unpacking changes the situation`);
        checked++;
        s = step(s, ACTIONS[Math.floor(random() * ACTIONS.length)]!).state;
      }
    }
    assert.ok(checked > 100, `${name}: ${checked} situations`);
  }
});

test('two situations pack alike exactly when their keys match, across the piece levels', () => {
  const random = prng(11);
  for (const [name, level] of Object.entries(PIECE_LEVELS)) {
    const layout = layoutOf(level);
    const w = new Uint32Array(layout.words);
    const byKey = new Map<string, string>();
    const byWords = new Map<string, string>();
    const seen = [...reachable(level, 5_000)];
    for (let line = 0; line < 40; line++) {
      let s = initial(level);
      for (let turn = 0; turn < 60 && s.outcome === 'playing'; turn++) {
        seen.push(s);
        s = step(s, ACTIONS[Math.floor(random() * ACTIONS.length)]!).state;
      }
    }
    for (const s of seen) {
      pack(s, layout, w, 0);
      const key = stateKey(s);
      const packed = Array.from(w).join(',');
      assert.equal(byKey.get(key) ?? packed, packed, `${name}: one key, two packings`);
      assert.equal(byWords.get(packed) ?? key, key, `${name}: one packing, two keys`);
      byKey.set(key, packed);
      byWords.set(packed, key);
    }
  }
});

test("the reference's key tells hazards and changed pieces apart", () => {
  const ball = initial(PIECE_LEVELS.ball!);
  const h = ball.hazards[0]!;
  assert.notEqual(stateKey({ ...ball, hazards: [{ ...h, dir: 'left' }] }), stateKey(ball), 'facing');
  assert.notEqual(stateKey({ ...ball, hazards: [{ ...h, home: 1 }] }), stateKey(ball), 'home');
  assert.notEqual(stateKey({ ...ball, hazards: [] }), stateKey(ball), 'gone');
  for (const [name, from, to] of [['popup', 'popup', 'wall'], ['fake-wall', 'fake-wall', 'floor'],
    ['invisible-wall', 'invisible-wall', 'wall'], ['bomb', 'bomb', 'floor']] as const) {
    const s = initial(PIECE_LEVELS[name]!);
    const i = s.terrain.indexOf(from);
    const changed = { ...s, terrain: s.terrain.map((t, j) => (j === i ? to : t)) };
    assert.notEqual(stateKey(changed), stateKey(s), name);
  }
});

test('hazards pack as slots when nothing clones one', () => {
  for (const name of ['ball', 'glider', 'fireball', 'throw-back', 'hazard-snare', 'hazard-toggle', 'hazard-bomb']) {
    const layout = layoutOf(PIECE_LEVELS[name]!);
    assert.equal(layout.hazardSlots, PIECE_LEVELS[name]!.hazards.length, name);
    assert.equal(layout.hazardCells.length, 0, name);
  }
  const block = layoutOf(PIECE_LEVELS['clone-block']!);
  assert.equal(block.hazardSlots, 0, 'a block machine clones no hazard');
  assert.equal(block.hazardCells.length, 0);
});

test('cloned hazards pack per cell', () => {
  for (const name of ['clone-ball', 'two-clones', 'hazard-bomb-clone', 'hazard-door']) {
    const level = PIECE_LEVELS[name]!;
    const layout = layoutOf(level);
    assert.equal(layout.hazardSlots, 0, name);
    assert.ok(layout.hazardCells.length > 0, name);
  }
  const level = PIECE_LEVELS['clone-ball']!;
  const layout = layoutOf(level);
  // Theseus steps on the red button three times: more than one ball stands at once.
  let s = initial(level);
  for (const dir of ['right', 'right', 'left', 'right', 'left', 'right'] as const) s = step(s, { kind: 'move', dir }).state;
  assert.ok(s.hazards.length >= 2, `${s.hazards.length} balls`);
  const w = new Uint32Array(layout.words);
  pack(s, layout, w, 0);
  const u = unpack(w, 0, layout, level);
  assert.deepEqual(u.hazards, s.hazards);
  // Out of cell order, a hazard would be passed over: packing refuses it.
  assert.throws(() => pack({ ...s, hazards: [...s.hazards].reverse() }, layout, w, 0), /hazard/);
});

test("Chapter 1's levels pack into as many words as they always have", () => {
  assert.deepEqual(TRIALS.map((_, i) => layoutOf(trialLevel(i)).words), [1, 1, 2, 2, 1, 2, 2, 3, 3, 3]);
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

test('the hearts field holds every count a try can reach: the starting hearts plus one a honey cake', () => {
  const lv = parse('title: t\n\n########\n#Pxxx.E#\n########\n');
  let s = initial(lv);
  for (let i = 0; i < 3; i++) s = step(s, { kind: 'move', dir: 'right' }).state;
  for (let i = 0; i < 3; i++) s = step(s, { kind: 'tool', tool: 'cake' }).state;
  assert.equal(s.hearts, 6);
  assert.equal(layoutOf(lv).heartBits, 3, '3 + 3 cakes = 6 fits in 3 bits');
  const l = layoutOf(lv);
  const words = new Uint32Array(l.words);
  pack(s, l, words, 0);
  const back = unpack(words, 0, l, lv, s.moves);
  assert.equal(back.hearts, 6);
  assert.equal(stateKey(back), stateKey(s));
});
