// The floating icons: who carries one, and their bob.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bob, iconFor } from '../src/modern/icons.ts';
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
