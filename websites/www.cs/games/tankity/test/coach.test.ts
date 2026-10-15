// The tutorial's lesson as data (src/coach.ts): every step's shape, each
// completion test against the game before and after the move it asks for,
// where a lesson starts and how it moves on, and the bubble's geometry: on
// screen and off the target's centre at phone, tablet and desktop sizes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { COACH_STEPS, advance, firstStep, keyTokens, placeBubble, spotlight, stepCount, stepFits, union } from '../src/coach.ts';
import type { CoachSnap, Rect, Size } from '../src/coach.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8')) as {
  keys: Record<string, Record<string, unknown>>;
  arsenal: { ammo: { key: string }[] };
};

const base: CoachSnap = { phase: 'shop', angle: 62, power: 55, x: 300, selected: 'shell', fired: 0, cash: 900, preview: false, shopSel: 0, shopQty: 1 };
const snap = (over: Partial<CoachSnap> = {}): CoachSnap => ({ ...base, ...over });
const step = (id: string) => {
  const s = COACH_STEPS.find(x => x.id === id);
  assert.ok(s, `no step ${id}`);
  return s;
};

test('the lesson: the shop first (row, pack, Buy, Preview, Start), then the battle', () => {
  assert.deepEqual(COACH_STEPS.map(s => s.id),
    ['shop-row', 'shop-pack', 'shop-buy', 'shop-preview', 'shop-start', 'barrel', 'power', 'drive', 'weapon', 'fire', 'wind']);
  const firstWar = COACH_STEPS.findIndex(s => s.when !== 'shop');
  assert.ok(COACH_STEPS.slice(0, firstWar).every(s => s.when === 'shop'));
  assert.ok(COACH_STEPS.slice(firstWar).every(s => s.when !== 'shop'));
});

test('every step has a target, short plain words, and keys only in its keys line', () => {
  for (const s of COACH_STEPS) {
    assert.ok(s.target.length > 0 && s.target.every(t => t.trim().length > 0), s.id);
    assert.ok(s.text.length > 0 && s.text.length <= 60, `${s.id} is short: ${s.text.length}`);
    assert.doesNotMatch(s.text, /[{}]/, `${s.id} names no key in its text`);
    assert.doesNotMatch(s.text + (s.keys ?? ''), /\besc(ape)?\b/i, `${s.id} never mentions Esc`);
  }
});

test('every key a step names is in the key table', () => {
  for (const s of COACH_STEPS) {
    for (const tok of keyTokens(s.keys ?? '')) {
      const [ctx = '', action = ''] = tok.split(':');
      assert.ok(GAME.keys[ctx] && action in GAME.keys[ctx]!, `${s.id}: ${tok}`);
    }
  }
});

test('no step names a weapon: the lesson holds whatever the shelf sells', () => {
  // "shell" is also the plain word for a round; every other key is one weapon.
  const words = GAME.arsenal.ammo.map(a => a.key).filter(k => k !== 'shell');
  for (const s of COACH_STEPS) {
    const all = [s.text, s.keys ?? '', ...s.target].join(' ').toLowerCase();
    for (const w of words) assert.ok(!new RegExp(`\\b${w}\\b`).test(all), `${s.id} names ${w}`);
    for (const t of s.target) assert.doesNotMatch(t, /data-weapon|shell/, `${s.id} targets no gun by key`);
  }
});

test('keyTokens reads the {context:action} tokens in order', () => {
  assert.deepEqual(keyTokens('Keys: {aim:barrelLeft} {aim:barrelRight}'), ['aim:barrelLeft', 'aim:barrelRight']);
  assert.deepEqual(keyTokens('{shop:buy:1} then {global:fire}'), ['shop:buy:1', 'global:fire']);
  assert.deepEqual(keyTokens('no keys'), []);
});

test('each step is done by doing it, and not before', () => {
  const cases: [string, Partial<CoachSnap>, Partial<CoachSnap>][] = [
    ['shop-row', {}, { shopSel: 1 }],
    ['shop-pack', {}, { shopQty: 2 }],
    ['shop-buy', {}, { cash: 800 }],
    ['shop-preview', {}, { preview: true }],
    ['shop-start', {}, { phase: 'banner' }],
    ['barrel', { phase: 'aim' }, { phase: 'aim', angle: 70 }],
    ['power', { phase: 'aim' }, { phase: 'aim', power: 60 }],
    ['drive', { phase: 'aim' }, { phase: 'aim', x: 310 }],
    ['weapon', { phase: 'aim' }, { phase: 'aim', selected: 'other' }],
    ['fire', { phase: 'aim' }, { phase: 'fly', fired: 1 }],
    ['wind', { phase: 'fly', fired: 1 }, { phase: 'aim', fired: 1 }],
  ];
  for (const [id, before, after] of cases) {
    const s = step(id);
    const start = snap(before);
    assert.equal(s.done(start, start), false, `${id} is not done as it begins`);
    assert.equal(s.done(snap({ ...before, ...after }), start), true, `${id} is done after the move`);
  }
  // Two pixels of drift is not a drive, a cheaper buy than nothing is not a buy.
  assert.equal(step('drive').done(snap({ x: 302 }), snap()), false);
  assert.equal(step('shop-buy').done(snap({ cash: 950 }), snap()), false);
});

test('a step shows only where it can be done', () => {
  assert.ok(stepFits(step('shop-buy'), 'shop') && !stepFits(step('shop-buy'), 'aim'));
  assert.ok(stepFits(step('barrel'), 'aim') && !stepFits(step('barrel'), 'think') && !stepFits(step('barrel'), 'banner'));
  for (const p of ['aim', 'think', 'fly', 'settle']) assert.ok(stepFits(step('wind'), p), p);
  assert.ok(!stepFits(step('wind'), 'shop') && !stepFits(step('wind'), 'banner'));
});

test('a lesson starts at the shop in the shop, and at the battle steps mid-battle', () => {
  assert.equal(firstStep(COACH_STEPS, 'shop'), 0);
  assert.equal(COACH_STEPS[firstStep(COACH_STEPS, 'aim')]!.id, 'barrel');
  assert.equal(COACH_STEPS[firstStep(COACH_STEPS, 'fly')]!.id, 'barrel');
});

test('advance: next step when done, the battle when the round starts early, and the end', () => {
  const i = COACH_STEPS.findIndex(s => s.id === 'barrel');
  assert.equal(advance(COACH_STEPS, i, snap({ phase: 'aim' }), snap({ phase: 'aim' })), i);
  assert.equal(advance(COACH_STEPS, i, snap({ phase: 'aim', angle: 61 }), snap({ phase: 'aim' })), i + 1);
  // Not the player's aim: the barrel step waits, whatever moved.
  assert.equal(advance(COACH_STEPS, i, snap({ phase: 'think', angle: 61 }), snap({ phase: 'aim' })), i);
  // Start pressed on the first shop step: on to the battle's first step.
  assert.equal(advance(COACH_STEPS, 0, snap({ phase: 'banner' }), snap()), i);
  assert.equal(advance(COACH_STEPS, 1, snap({ phase: 'aim' }), snap()), i);
  const last = COACH_STEPS.length - 1;
  assert.equal(advance(COACH_STEPS, last, snap({ phase: 'aim' }), snap({ phase: 'fly' })), COACH_STEPS.length);
  assert.equal(advance(COACH_STEPS, COACH_STEPS.length, snap(), snap()), COACH_STEPS.length);
  assert.equal(stepCount(COACH_STEPS, 0), `1 of ${COACH_STEPS.length}`);
});

// ---- the bubble's geometry ----
const SCREENS: [string, Size][] = [
  ['phone portrait', { w: 390, h: 844 }], ['phone landscape', { w: 844, h: 390 }],
  ['small phone', { w: 320, h: 568 }], ['tablet', { w: 820, h: 1180 }], ['desktop', { w: 1280, h: 800 }],
];
const BUBBLES: Size[] = [{ w: 220, h: 90 }, { w: 288, h: 120 }, { w: 304, h: 150 }];
const inside = (p: { x: number; y: number }, b: Size, view: Size) =>
  p.x >= 8 - 1e-6 && p.y >= 8 - 1e-6 && p.x + b.w <= view.w - 8 + 1e-6 && p.y + b.h <= view.h - 8 + 1e-6;
const covers = (p: { x: number; y: number }, b: Size, x: number, y: number) => x >= p.x && x <= p.x + b.w && y >= p.y && y <= p.y + b.h;

test('the bubble stays on screen and off the target centre at every size', () => {
  for (const [name, view] of SCREENS) {
    for (const b of BUBBLES) {
      if (b.w > view.w - 16) continue;
      // Targets across the screen, small (a button) to wide (a deck row) to tall (a list).
      for (const [tw, th] of [[48, 44], [120, 55], [view.w * 0.9, 60], [200, view.h * 0.5]] as const) {
        for (let fx = 0; fx <= 1; fx += 0.25) {
          for (let fy = 0; fy <= 1; fy += 0.25) {
            const t: Rect = { left: fx * (view.w - tw), top: fy * (view.h - th), width: tw, height: th };
            const p = placeBubble(t, b, view);
            const where = `${name} bubble ${b.w}x${b.h} target ${JSON.stringify(t)} -> ${JSON.stringify(p)}`;
            assert.ok(inside(p, b, view), `on screen: ${where}`);
            assert.ok(!covers(p, b, t.left + tw / 2, t.top + th / 2), `off the centre: ${where}`);
          }
        }
      }
    }
  }
});

test('the bubble sits beside its target with the arrow pointing at it', () => {
  const view = { w: 390, h: 844 };
  const b = { w: 260, h: 100 };
  // A FIRE button at the foot: the bubble above it, the arrow over its centre.
  const fire: Rect = { left: 250, top: 760, width: 120, height: 46 };
  const up = placeBubble(fire, b, view);
  assert.equal(up.side, 'above');
  assert.equal(up.y + b.h, fire.top - 12);
  assert.equal(up.x + up.arrow, 310);
  // The wind pill at the top: below it.
  const wind: Rect = { left: 300, top: 40, width: 70, height: 22 };
  const down = placeBubble(wind, b, view);
  assert.equal(down.side, 'below');
  assert.equal(down.y, 62 + 12);
  assert.ok(down.arrow >= 14 && down.arrow <= b.w - 14);
  // A tall list on a short landscape screen: to its side.
  const list: Rect = { left: 20, top: 20, width: 380, height: 350 };
  assert.equal(placeBubble(list, b, { w: 844, h: 390 }).side, 'right');
});

test('a target as big as the screen puts the bubble at the edge away from its centre', () => {
  const view = { w: 390, h: 844 };
  const p = placeBubble({ left: 0, top: 0, width: 390, height: 844 }, { w: 260, h: 100 }, view);
  assert.equal(p.side, 'none');
  assert.ok(p.y + 100 <= 844 / 2 || p.y >= 844 / 2);
});

test('the spotlight grows the target and stays on screen; union spans every match', () => {
  assert.deepEqual(spotlight({ left: 2, top: 100, width: 50, height: 40 }, { w: 390, h: 844 }), { left: 0, top: 94, width: 58, height: 52 });
  assert.deepEqual(union([{ left: 10, top: 10, width: 10, height: 10 }, { left: 40, top: 5, width: 10, height: 10 }]), { left: 10, top: 5, width: 40, height: 15 });
  assert.equal(union([]), null);
});
