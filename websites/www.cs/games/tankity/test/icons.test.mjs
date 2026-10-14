// The shell icons (src/ui/icons.ts) with a picture of their own: a tracer's
// dashed path ending in its mark, a plasma ring's rings, a digger's drill and
// a dirt gun's clod.
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

test('a digger\'s icon is a drill: a body and a pointed bit with a spiral flute', () => {
  const ws = GAME.arsenal.ammo.filter(a => a.gfx.painter === 'drill');
  assert.ok(ws.length >= 6, 'the diggers and sandhogs paint drills');
  for (const w of ws) {
    const { cv, calls } = canvas();
    icons.drawShellIcon(cv, w);
    assert.ok(calls.some(c => c[0] === 'closePath'), `${w.key} draws the bit's point`);
    assert.ok(calls.filter(c => c[0] === 'lineTo').length >= 6, `${w.key} draws the bit and its flute`);
  }
});

test('a dirt gun\'s icon is a clod: a lumpy ball of several lumps and crumbs', () => {
  const ws = GAME.arsenal.ammo.filter(a => a.gfx.painter === 'clod');
  assert.ok(ws.length >= 5, 'the dirt guns paint clods');
  for (const w of ws) {
    const { cv, calls } = canvas();
    icons.drawShellIcon(cv, w);
    assert.ok(calls.filter(c => c[0] === 'arc').length >= 6, `${w.key} draws lumps and crumbs`);
  }
});

test('a napalm gun\'s icon is a flame: a burning drop with tongues of flame licking up off it', () => {
  const ws = GAME.arsenal.ammo.filter(a => a.gfx.painter === 'flame');
  assert.ok(ws.length >= 2, 'the napalm guns paint flames');
  for (const w of ws) {
    const { cv, calls } = canvas();
    icons.drawShellIcon(cv, w);
    assert.ok(calls.filter(c => c[0] === 'quadraticCurveTo').length >= 6, `${w.key} draws its tongues of flame`);
    assert.ok(calls.some(c => c[0] === 'arc'), `${w.key} draws its burning drop`);
  }
});
