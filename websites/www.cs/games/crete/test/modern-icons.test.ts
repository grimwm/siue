// The floating icons: who carries one, their size and bob, and how they stay inside the view.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ICON_SIZE, bob, iconFor, keepInView } from '../src/modern/icons.ts';
import { PIECE_MODEL_NAMES, placed } from '../src/modern/model-names.ts';
import { grid } from './puzzle-grid.ts';

const rest = (s: ReturnType<typeof grid>) => ({ player: s.player, minotaur: s.minotaur, hazards: s.hazards.map(h => ({ kind: h.kind, at: h.at })) });

test('the Minotaur, every object but the block, and every hazard carry their sprite; Theseus and blocks do not', () => {
  const s = grid(['P*rbygfhkuzxcpO', 'owe..C.........', '..............M'], 'pages: a\nfacing: up up up\nmachines: ball-up');
  const icons = placed(s, rest(s)).map(p => [p.model, iconFor(p)] as const);
  for (const [model, icon] of icons) {
    if (model === 'block' || model === 'theseus') assert.equal(icon, null, model);
  }
  const shown = icons.map(x => x[1]).filter(Boolean).sort();
  const items = PIECE_MODEL_NAMES.filter(n => n !== 'block' && n !== 'cow-standing');
  assert.deepEqual(shown, [...items, 'minotaur'].sort(), 'each item once; the template on the machine has none');
  assert.equal(iconFor({ model: 'minotaur-stone', r: 0, c: 0, id: 'minotaur' }), 'minotaur-stone');
  assert.equal(iconFor({ model: 'cow-standing', r: 0, c: 0, id: 'cow' }), null);
});

test('the bob is a few hundredths of a cell over about two seconds, and nothing under reduced motion', () => {
  const xs = Array.from({ length: 200 }, (_, i) => bob(i / 100, false));
  assert.ok(Math.max(...xs) > 0.02 && Math.max(...xs) <= 0.05);
  assert.ok(Math.abs(bob(0, false) - bob(2, false)) < 1e-9);
  for (const t of [0, 0.3, 0.5, 1.7]) assert.equal(bob(t, true), 0);
});

test('an icon is about three quarters of a cell wide', () => {
  assert.ok(ICON_SIZE >= 0.7 && ICON_SIZE <= 0.8);
});

test('keepInView: an icon past the top or a side slides back inside the margin; one inside stays', () => {
  // A 10 × 6 view (5 and 3 from the centre), a 0.8 × 1 icon, a 0.1 margin.
  assert.deepEqual(keepInView(0, 0, 0.8, 1, 5, 3, 0.1), [0, 0]);
  const [, dy] = keepInView(1, 2.5, 0.8, 1, 5, 3, 0.1);
  assert.ok(Math.abs(2.5 + dy - 1.9) < 1e-9, 'its top sits 0.1 under the top edge');
  const [dx] = keepInView(4.9, 0, 0.8, 1, 5, 3, 0.1);
  assert.ok(Math.abs(4.9 + dx - 4.5) < 1e-9, 'its right side 0.1 inside the right edge');
  const [dxl] = keepInView(-5, 0, 0.8, 1, 5, 3, 0.1);
  assert.ok(Math.abs(-5 + dxl + 4.5) < 1e-9, 'and the left');
  const [, dyb] = keepInView(0, -3.2, 0.8, 1, 5, 3, 0.1);
  assert.ok(Math.abs(-3.2 + dyb + 2.9) < 1e-9, 'a foot below the bottom comes up');
  assert.deepEqual(keepInView(3, 2, 0.8, 9, 5, 3, 0.1), [0, 0], 'an icon taller than the view is left be');
});
