// The shell icons (src/ui/icons.ts) for the guns that do not burst: a
// tracer's dashed path ending in its mark, and a plasma ring's rings.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { importTsx } from '../../_kit/test/tsx.ts';

const { icons } = await importTsx(import.meta.dirname, { icons: '../src/ui/icons.ts' });
const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));

/** A canvas whose context records what is drawn. */
function canvas() {
  const calls = [];
  const grad = { addColorStop() {} };
  const ctx = new Proxy({ calls }, {
    get(t, k) {
      if (k in t) return t[k];
      if (k === 'createRadialGradient' || k === 'createLinearGradient') return () => grad;
      return (...a) => { calls.push([k, ...a]); };
    },
    set(t, k, v) { calls.push(['=' + String(k), v]); return true; },
  });
  return { cv: { getContext: () => ctx }, calls };
}

test('a tracer\'s icon is a dashed path that ends in a cross', () => {
  for (const w of GAME.arsenal.ammo.filter(a => a.effect === 'tracer')) {
    const { cv, calls } = canvas();
    icons.drawShellIcon(cv, w);
    const dashes = calls.filter(c => c[0] === 'setLineDash');
    assert.ok(dashes.some(c => c[1].length > 0), `${w.key} draws dashes`);
    assert.ok(dashes.at(-1)[1].length === 0, `${w.key} leaves the dash off after`);
    assert.ok(calls.filter(c => c[0] === 'lineTo').length >= 2, `${w.key} draws its cross`);
  }
});

test('a plasma gun\'s icon is rings around a core', () => {
  const w = GAME.arsenal.ammo.find(a => a.effect === 'plasma');
  const { cv, calls } = canvas();
  icons.drawShellIcon(cv, w);
  assert.ok(calls.filter(c => c[0] === 'arc').length >= 4, 'rings and a core');
});
