// How the earth guns play (src/earth-fx.ts): one impact per burst, and a cue for liquid that runs off.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { playEarthOp } from '../src/earth-fx.ts';
import { createEarthShow } from '../src/earth-show.ts';
import type { EarthFxDeps } from '../src/earth-fx.ts';
import type { EarthOp } from '../src/earth.ts';
import type { EarthShow } from '../src/earth-show.ts';

function deps() {
  const log: { impact: unknown[][]; special: [string, string, number, number, number, number | undefined][]; sound: string[]; said: string[] } = { impact: [], special: [], sound: [], said: [] };
  const d: EarthFxDeps & { show: EarthShow } = {
    fxImpact: (k, x, y, r) => { log.impact.push([k, x, y, r]); return undefined; },
    fxSpecial: (k, name, x, y, ang, len) => log.special.push([k, name, x, y, ang, len]),
    sound: n => log.sound.push(n), shake() {}, show: createEarthShow(), say: t => log.said.push(t),
  };
  return { log, d };
}
const flat = (): number[] => Array(100).fill(400);

test('dirt that does no damage plays its impact and a thud once', () => {
  const { log, d } = deps();
  playEarthOp({ t: 'dirt', w: 'clod', x: 50, y: 400, r: 20 }, flat(), flat(), 30, 70, d, false);
  assert.equal(log.impact.length, 1);
  assert.deepEqual(log.sound, ['thud']);
});

test('dirt whose burst did damage leaves the impact and the boom to its blast: only the mound rises', () => {
  const { log, d } = deps();
  playEarthOp({ t: 'dirt', w: 'charge', x: 50, y: 400, r: 45 }, flat(), flat(), 5, 95, d, true);
  assert.equal(log.impact.length, 0);
  assert.deepEqual(log.sound, []);
  assert.ok(d.show.busy(), 'the mound still rises');
});

test('liquid dirt that leaves no pool runs off the field: a spill at the edge it ran to, and a line', () => {
  const { log, d } = deps();
  const slope = Array.from({ length: 100 }, (_, x) => 300 + x);
  playEarthOp({ t: 'pour', w: 'mud', x: 60, v: 4000 } as EarthOp, slope, slope, 60, 59, d, false);
  const spill = log.special.find(s => s[1] === 'pour');
  assert.ok(spill && spill[2] + Number(spill[5]) === 99, `spilled at the right edge: ${JSON.stringify(log.special)}`);
  assert.equal(log.said.length, 1);
});
