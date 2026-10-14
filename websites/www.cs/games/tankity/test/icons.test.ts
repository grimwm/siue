// The shell icons (src/ui/icons.ts) with a picture of their own: a tracer's
// dashed path ending in its mark, a plasma ring's rings, a digger's drill and
// a dirt gun's clod.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { importTsx } from '../../_kit/test/tsx.ts';
import type { Weapon } from '../src/sim.ts';

const { icons } = await importTsx<{ icons: typeof import('../src/ui/icons.ts') }>(import.meta.dirname, { icons: '../src/ui/icons.ts' });
/** game.json, as far as these cases read it: the arsenal's gun rows. */
const GAME: { arsenal: { ammo: Weapon[] } } = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));

/** One drawing call the stub context recorded: the method (or `=prop` for a write) and its arguments. */
type Call = [string, ...unknown[]];
/** The first gun row `pred` picks, which must be there. */
function gun(pred: (w: Weapon) => boolean): Weapon {
  const w = GAME.arsenal.ammo.find(pred);
  assert.ok(w, 'no such gun in game.json');
  return w;
}
/** The painter a gun's row names; every row of the arsenal has a gfx. */
function painterOf(w: Weapon): string | undefined {
  assert.ok(w.gfx, `${w.key} has no gfx`);
  return w.gfx.painter;
}
/** The last item of a list the case reads, which must be there. */
function last<T>(list: readonly T[]): T {
  const v = list[list.length - 1];
  assert.ok(v !== undefined, 'the list is empty');
  return v;
}
/** The argument list of a recorded call, which the cases read for its length. */
const argsOf = (c: Call): unknown[] => c[1] as unknown[];

/** A canvas whose context records what is drawn. */
function canvas() {
  const calls: Call[] = [];
  const grad = { addColorStop() {} };
  const ctx = new Proxy({ calls } as Record<string | symbol, unknown>, {
    get(t, k) {
      if (k in t) return t[k];
      if (k === 'createRadialGradient' || k === 'createLinearGradient') return () => grad;
      return (...a: unknown[]) => { calls.push([String(k), ...a]); };
    },
    set(_t, k, v) { calls.push(['=' + String(k), v]); return true; },
  });
  // as unknown as: the icon painter only calls getContext on the canvas.
  return { cv: { getContext: () => ctx } as unknown as HTMLCanvasElement, calls };
}

test('a tracer\'s icon is a dashed path that ends in a cross', () => {
  for (const w of GAME.arsenal.ammo.filter(a => a.effect === 'tracer')) {
    const { cv, calls } = canvas();
    icons.drawShellIcon(cv, w);
    const dashes = calls.filter(c => c[0] === 'setLineDash');
    assert.ok(dashes.some(c => argsOf(c).length > 0), `${w.key} draws dashes`);
    assert.ok(argsOf(last(dashes)).length === 0, `${w.key} leaves the dash off after`);
    assert.ok(calls.filter(c => c[0] === 'lineTo').length >= 2, `${w.key} draws its cross`);
  }
});

test('a plasma gun\'s icon is rings around a core', () => {
  const w = gun(a => a.effect === 'plasma');
  const { cv, calls } = canvas();
  icons.drawShellIcon(cv, w);
  assert.ok(calls.filter(c => c[0] === 'arc').length >= 4, 'rings and a core');
});

test('a digger\'s icon is a drill: a body and a pointed bit with a spiral flute', () => {
  const ws = GAME.arsenal.ammo.filter(a => painterOf(a) === 'drill');
  assert.ok(ws.length >= 6, 'the diggers and sandhogs paint drills');
  for (const w of ws) {
    const { cv, calls } = canvas();
    icons.drawShellIcon(cv, w);
    assert.ok(calls.some(c => c[0] === 'closePath'), `${w.key} draws the bit's point`);
    assert.ok(calls.filter(c => c[0] === 'lineTo').length >= 6, `${w.key} draws the bit and its flute`);
  }
});

test('a dirt gun\'s icon is a clod: a lumpy ball of several lumps and crumbs', () => {
  const ws = GAME.arsenal.ammo.filter(a => painterOf(a) === 'clod');
  assert.ok(ws.length >= 5, 'the dirt guns paint clods');
  for (const w of ws) {
    const { cv, calls } = canvas();
    icons.drawShellIcon(cv, w);
    assert.ok(calls.filter(c => c[0] === 'arc').length >= 6, `${w.key} draws lumps and crumbs`);
  }
});

test('a napalm gun\'s icon is a flame: a burning drop with tongues of flame licking up off it', () => {
  const ws = GAME.arsenal.ammo.filter(a => painterOf(a) === 'flame');
  assert.ok(ws.length >= 2, 'the napalm guns paint flames');
  for (const w of ws) {
    const { cv, calls } = canvas();
    icons.drawShellIcon(cv, w);
    assert.ok(calls.filter(c => c[0] === 'quadraticCurveTo').length >= 6, `${w.key} draws its tongues of flame`);
    assert.ok(calls.some(c => c[0] === 'arc'), `${w.key} draws its burning drop`);
  }
});
