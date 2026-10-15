// Every gun's firing-range preview, run on the real sim for three volleys:
// it stays inside the preview's frame, it does what the gun advertises on or
// around the dummy, and a gun whose power is indirect declares a scenario
// (game.yaml preview) whose demo really exercises that mechanic. The range's
// wind is pinned and the demo draws no random numbers, so a preview cannot
// miss by chance.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal } from '../src/sim.ts';
import type { Weapon } from '../src/sim.ts';
import { PV_W, PV_WIND, createPreview, stepPreview } from '../src/preview.ts';
import type { PreviewEnv, PreviewSeen, PreviewState } from '../src/preview.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);
assert.ok(arsenal, 'game.json has an arsenal');

/** The mechanic each indirect effect must show, as a measure of the volley (PreviewSeen) or the dummy. */
interface Volley { seen: PreviewSeen; dmg: number; dropped: number; buriedBy: number; result: string; trace: PreviewState['trace']; tx: number }
const MECHANIC: Record<string, [string, (v: Volley) => number]> = {
  hop: ['hops onto the dummy', v => v.seen.hops],
  roller: ['rolls down into the dummy', v => v.seen.rolled],
  dig: ['burrows under the dummy', v => v.seen.dug * v.dropped],
  pour: ['flows from where it lands to the dummy', v => v.seen.flowed],
  napalm: ['flows from where it lands to the dummy', v => v.seen.flowed],
  scatter: ['flings its bomblets', v => v.seen.split],
  cluster: ['splits into bomblets', v => v.seen.split],
  seeker: ['bends onto the dummy', v => v.seen.bend],
  proximity: ['bursts in the air', v => v.seen.air],
  beam: ['dips below level', v => v.seen.dip],
  tracer: ['draws an arc', v => v.seen.rise],
  riot: ['clears dirt round its gunner', v => v.seen.cleared],
  slump: ['drops the dummy off its ridge', v => v.dropped],
};
/** What the gun advertises doing to the dummy (or, for a riot charge, its gunner). */
function advertised(w: Readonly<Weapon>, v: Volley): [string, boolean] {
  if (w.effect === 'tracer') {
    const end = v.trace && v.trace.landed ? v.trace.pts.slice(-2) : null;
    return ['marks a landing on the dummy', !!end && Math.abs(end[0]! - v.tx) < 20];
  }
  if (w.effect === 'riot') return ['digs its gunner out', v.seen.cleared > 0 && /Dug out/.test(v.result)];
  if (w.effect === 'dirt' && w.dmg === 0) return ['buries the dummy', v.buriedBy > 0];
  if (w.effect === 'pour') return ['buries the dummy', v.buriedBy > 0];
  if (w.dmg > 0 || (w.subDmg || 0) > 0) return ['damages the dummy', v.dmg > 0];
  return ['drops the dummy', v.dropped > 0 && v.dmg > 0];
}

const env: PreviewEnv = {
  weapon: key => arsenal.weapons[key],
  muzzle: () => {}, impact: () => {}, special: () => {}, trail: () => {}, showResult: () => {},
};
/** Three volleys of gun k's demo, each as it stood when its result came up. */
function volleys(k: string): Volley[] {
  const pv = createPreview(k, env, null, null);
  assert.ok(pv, k);
  const out: Volley[] = [];
  for (let f = 0; f < 60 * 60 && out.length < 3; f++) {
    const showing = pv.phase === 'show';
    stepPreview(pv, 1 / 60, env);
    assert.equal(pv.wind, PV_WIND, `${k}: the range's wind is pinned`);
    if (!showing && pv.phase === 'show') {
      out.push({ seen: { ...pv.seen }, dmg: pv.volleyDmg, dropped: pv.dropped, buriedBy: pv.buriedBy, result: pv.result, trace: pv.trace && { ...pv.trace, pts: pv.trace.pts.slice() }, tx: pv.tx });
    }
  }
  assert.equal(out.length, 3, `${k}: three volleys in a minute`);
  return out;
}

const runs = new Map(arsenal.order.map(k => [k, volleys(k)]));

test('every gun whose power is indirect declares a preview scenario', () => {
  for (const k of arsenal.order) {
    const w = arsenal.weapons[k]!;
    if (MECHANIC[w.effect]) assert.ok(w.preview, `${w.name} (${w.effect}) needs a preview scenario in game.yaml`);
  }
});

for (const k of arsenal.order) {
  const w = arsenal.weapons[k]!;
  test(`${w.name}'s preview stays in the frame, ${advertised(w, runs.get(k)![0]!)[0]}${MECHANIC[w.effect] ? ' and ' + MECHANIC[w.effect]![0] : ''}`, () => {
    runs.get(k)!.forEach((v, i) => {
      assert.ok(!v.seen.escaped, `${w.name}, volley ${i + 1}: a shell left the ${PV_W} px frame (${v.result})`);
      const [what, ok] = advertised(w, v);
      assert.ok(ok, `${w.name}, volley ${i + 1}: never ${what} (${v.result})`);
      const m = MECHANIC[w.effect];
      if (m) assert.ok(m[1](v) > 0, `${w.name}, volley ${i + 1}: never ${m[0]} (${v.result}, ${JSON.stringify(v.seen)})`);
    });
  });
}

test('a preview draws no random numbers: the same gun plays the same volleys', () => {
  for (const k of arsenal.order) assert.deepEqual(volleys(k), runs.get(k), k);
});
