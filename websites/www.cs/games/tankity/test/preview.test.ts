// The firing-range preview without a browser. src/preview.ts takes its weapons,
// effects and result line as an environment, so each case steps the demo on a
// clock the test moves by hand (fixed 1/60 s frames) and records what the
// environment was asked to do. The arsenal is the real one, from game.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, stepBallistic, launchSpeed } from '../src/sim.ts';
import {
  PV_W, PV_H, PV_FOE_HP, PV_WIND, createPreview, stepPreview, solvePreview, previewShot, previewAir, makePreviewTerrain, previewGround,
} from '../src/preview.ts';
import type { PreviewEnv, PreviewFx, PreviewShell, PreviewState } from '../src/preview.ts';
import type { Gear, Weapon } from '../src/sim.ts';

/** Item `i` of a list the case reads, which must be there. */
function nth<T>(list: readonly T[], i: number): T {
  const v = list[i];
  assert.ok(v !== undefined, `no item ${i} of ${list.length}`);
  return v;
}
// Number() on an optional field keeps a missing one failing its comparison, as it did untyped.
/** A value the case expects to be there (a find that must succeed, a weapon's own field). */
function must<T>(v: T | null | undefined, what: string): T {
  assert.ok(v !== null && v !== undefined, `no ${what}`);
  return v;
}

/** game.json, as far as these cases read it. */
interface GameJson { arsenal: { ammo: Weapon[]; gear?: Gear[] } }
const GAME: GameJson = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = must(buildArsenal(GAME.arsenal), 'arsenal');
/** A weapon of the real arsenal, which the case names. */
const weapon = (key: string): Readonly<Weapon> => must(arsenal.weapons[key], key);


const DT = 1 / 60;

/** An environment that records every hook call, with a counting fake effects system. */
/** The counting fake effects system. */
interface FakeFx extends PreviewFx { steps: number; cleared: number; lastDt?: number }
interface EnvLog {
  muzzle: { f: FakeFx | null; wkey: string; x: number; y: number; ang: number }[];
  impact: { f: FakeFx | null; wkey: string; x: number; y: number; r: number }[];
  special: { f: FakeFx | null; wkey: string; name: string; x: number; y: number; ang: number; len: number | undefined }[];
  trail: number;
  results: string[];
}
function makeEnv() {
  const log: EnvLog = { muzzle: [], impact: [], special: [], trail: 0, results: [] };
  const fx: FakeFx = { wind: 0, steps: 0, cleared: 0, step(dt) { this.steps++; this.lastDt = dt; }, clear() { this.cleared++; } };
  const env: PreviewEnv<FakeFx> = {
    weapon: key => arsenal.weapons[key],
    muzzle: (f, wkey, x, y, ang) => log.muzzle.push({ f, wkey, x, y, ang }),
    impact: (f, wkey, x, y, r) => log.impact.push({ f, wkey, x, y, r }),
    special: (f, wkey, name, x, y, ang, len) => log.special.push({ f, wkey, name, x, y, ang, len }),
    trail: () => { log.trail++; },
    showResult: text => log.results.push(text),
  };
  return { env, log, fx };
}

/** A demo of a gun the arsenal has. */
function open<C>(wkey: string, env: PreviewEnv<FakeFx>, fx: FakeFx | null, cv: C) {
  return must(createPreview(wkey, env, fx, cv), wkey);
}

/** The demo's clock: a frame at a time, until `done(pv)` or the time limit. */
function run(pv: PreviewState, env: PreviewEnv<FakeFx>, seconds: number, done: (pv: PreviewState) => boolean = () => false) {
  let t = 0;
  while (t < seconds - 1e-9 && !done(pv)) { stepPreview(pv, DT, env); t += DT; }
  return t;
}

/* ---- opening ---- */
{
  const { env, fx } = makeEnv();
  await test('an unknown weapon opens nothing', () => { assert.ok(createPreview('no-such-gun', env, fx, 'canvas') === null); });
  const pv = open('shell', env, fx, 'canvas');
  await test('a new demo waits to aim', () => { assert.ok(pv.phase === 'aim' && Math.abs(pv.t - 0.6) < 1e-12 && pv.shells.length === 0); });
  await test('it starts at full dummy health with the stage wind', () => { assert.ok(pv.foeHp === PV_FOE_HP && pv.wind === PV_WIND && pv.volleys === 0); });
  await test('it keeps the stage and system it was given', () => { assert.ok(pv.cv === 'canvas' && pv.fx === fx); });
  await test('the field is the preview size', () => { assert.ok(pv.terr.length === PV_W && PV_H === 200 && pv.sx === 44 && pv.tx === 296); });
  const a = makePreviewTerrain(), b = makePreviewTerrain();
  await test('each terrain is its own array of the same hills', () => { assert.ok(a !== b && a.every((v, i) => v === b[i])); });
  await test('a demo with no effects system opens too', () => { assert.ok(open('shell', env, null, null).fx === null); });
}

/* ---- the clock: aim, fly, show, aim again ---- */
{
  const { env, log, fx } = makeEnv();
  const pv = open('shell', env, fx, null);
  run(pv, env, 0.5);
  await test('still aiming at 0.5 s', () => { assert.ok(pv.phase === 'aim' && log.muzzle.length === 0); });
  run(pv, env, 0.2);
  await test('fires once the 0.6 s wait is up', () => { assert.ok(pv.phase === 'fly' && log.muzzle.length === 1 && pv.shells.length === 1); });
  const m = nth(log.muzzle, 0);
  await test('the muzzle flash is at the barrel, along the solved angle', () => { assert.ok(m.wkey === 'shell' && m.x === pv.sx && m.y === nth(pv.terr, pv.sx) - 12
    && Math.abs(m.ang - Math.atan2(-Math.sin(pv.angle * Math.PI / 180), Math.cos(pv.angle * Math.PI / 180))) < 1e-12); });
  await test('the effects system steps every frame with the demo wind', () => { assert.ok(fx.steps > 0 && fx.wind === PV_WIND && Math.abs(Number(fx.lastDt) - DT) < 1e-12); });

  const t = run(pv, env, 10, p => p.phase === 'show');
  await test('the shell lands and the result shows', () => { assert.ok(pv.phase === 'show' && t < 5, `phase ${pv.phase} after ${t}`); });
  await test('the result is posted once, as a line', () => { assert.ok(log.results.length === 1 && nth(log.results, 0) === pv.result && pv.result.length > 0); });
  await test('the result holds for 1.6 s then the next volley aims for 0.5 s', () => { assert.ok(Math.abs(pv.resultT - 1.6) < 1e-9 && Math.abs(pv.t - 1.6) < 1e-9); });
  run(pv, env, 1.5);
  await test('still showing at 1.5 s', () => { assert.ok(pv.phase === 'show' && pv.volleys === 0); });
  run(pv, env, 0.2);
  await test('then aims again', () => { assert.ok(pv.phase === 'aim' && pv.volleys === 1 && pv.t <= 0.5 && pv.t > 0.3); });
  await test('the result line fades out', () => { assert.ok(pv.resultT <= 0); });
}

/* ---- every gun's first volley ends; and the demo flies the war's ballistics ---- */
{
  const { env } = makeEnv();
  for (const key of arsenal.order) {
    const pv = open(key, env, null, null);
    run(pv, env, 12, p => p.phase === 'show');
    await test(`${key}: the first volley ends with a result`, () => { assert.ok(pv.phase === 'show' && pv.result.length > 0, `phase ${pv.phase}`); });
    // The solver aims an unsteered shot; the seeker bends its own way, so only it may miss.
    // A tracer hurts nothing: its mark comes down by the dummy. The earth guns
    // (and a harmless crater) bury the dummy or drop it; a riot charge digs its
    // buried shooter out.
    const w = weapon(key);
    if (w.effect === 'tracer') {
      const end = pv.trace && must(pv.trace, 'trace').pts.slice(-2);
      await test(`${key}: the first volley comes down by the dummy`, () => { assert.ok(!!end && Math.abs(nth(end, 0) - pv.tx) < 14 && pv.foeHp === PV_FOE_HP, JSON.stringify(end)); });
    } else if (w.effect === 'riot') {
      await test(`${key}: the buried shooter digs itself out`, () => { assert.ok(nth(pv.terr, pv.sx) >= pv.sy - 2 && /^Dug out/.test(pv.result), `${nth(pv.terr, pv.sx)} vs ${pv.sy}: ${pv.result}`); });
    } else if (w.effect === 'dirt' || w.effect === 'pour') {
      await test(`${key}: the first volley buries the dummy`, () => { assert.ok(pv.buriedBy > 2 && /^Buried the dummy/.test(pv.result), pv.result); });
    } else if (w.effect === 'dig' || w.effect === 'slump' || w.dmg === 0) {
      await test(`${key}: the first volley drops the dummy, for fall damage`, () => { assert.ok(pv.dropped > 10 && pv.foeHp < PV_FOE_HP && /^Dropped the dummy/.test(pv.result), pv.result); });
    } else if (key !== 'seeker') {
      await test(`${key}: the first volley lands on the dummy`, () => { assert.ok(pv.volleyDmg > 0 && pv.foeHp < PV_FOE_HP, `hits ${pv.volleyHits}, hp ${pv.foeHp}`); });
    }
  }
  // The solved shot, replayed with sim.js alone, comes down on the target.
  const pv = open('mortar', env, null, null);
  solvePreview(pv, env);
  const w = weapon('mortar');
  const rad = pv.angle * Math.PI / 180;
  const st = { x: pv.sx, y: nth(pv.terr, pv.sx) - 12, vx: Math.cos(rad) * launchSpeed(w, pv.power), vy: -Math.sin(rad) * launchSpeed(w, pv.power) };
  let landed: number | null = null;
  for (let i = 0; i < 720 && !landed; i++) {
    stepBallistic(st, 1 / 60, previewAir(pv, w));
    if (st.x < 0 || st.x >= PV_W || st.y >= PV_H || (i >= 6 && st.y >= Number(pv.terr[Math.max(0, Math.min(PV_W - 1, Math.round(st.x)))]))) landed = st.x;
  }
  await test('the solved mortar lob comes down on the target column', () => { assert.ok(landed !== null && Math.abs(landed - pv.tx) < 8, `landed ${landed}`); });
  await test('previewShot agrees with that replay', () => { assert.ok(Math.abs(previewShot(pv, env, pv.angle, pv.power) - Number(landed)) < 1e-9); });
  await test('the solution stays inside the angle and power limits', () => { assert.ok(pv.angle >= 5 && pv.angle <= 85 && pv.power >= 10 && pv.power <= 100); });
}

/* ---- leaping, scattering and apex guns: the war's own sub-munitions ---- */
{
  const lf = makeEnv();
  const leap = open('leapfrog', lf.env, lf.fx, null);
  leap.tx = 180; // room on the stage for both leaps
  run(leap, lf.env, 15, p => p.phase === 'show');
  const w = weapon('leapfrog');
  await test('Leapfrog bursts three times, the leaps with its sub blast', () => { assert.ok(lf.log.impact.length === w.hops
    && nth(lf.log.impact, 0).r === w.radius && lf.log.impact.slice(1).every(i => i.r === w.subRadius), JSON.stringify(lf.log.impact)); });
  await test('each leap plays the hop special', () => { assert.ok(lf.log.special.filter(s => s.name === 'hop').length === Number(w.hops) - 1); });
  await test('the leaps walk on the way it flew', () => { assert.ok(nth(lf.log.impact, 1).x > nth(lf.log.impact, 0).x && nth(lf.log.impact, 2).x > nth(lf.log.impact, 1).x); });
  const edge = makeEnv();
  // Aimed straight at the dummy (no scenario), its leaps run on past the stage's edge.
  edge.env.weapon = key => key === 'leapfrog' ? { ...weapon(key), preview: undefined } : arsenal.weapons[key];
  const far = open('leapfrog', edge.env, edge.fx, null);
  run(far, edge.env, 15, p => p.phase === 'show');
  await test('a leap off the stage ends the chain, as in the war', () => { assert.ok(edge.log.impact.length < Number(w.hops) && nth(edge.log.impact, edge.log.impact.length - 1).x >= 360, JSON.stringify(edge.log.impact.map(i => i.x))); });

  const fk = makeEnv();
  const funky = open('funky', fk.env, fk.fx, null);
  run(funky, fk.env, 15, p => p.phase === 'show');
  const f = weapon('funky');
  await test('Funky bursts once, then each of its bomblets', () => { assert.ok(fk.log.impact.length === 1 + Number(f.split)
    && nth(fk.log.impact, 0).r === f.radius && fk.log.impact.slice(1).every(i => i.r === f.subRadius), JSON.stringify(fk.log.impact.map(i => i.r))); });
  const sc = fk.log.special.filter(s => s.name === 'scatter');
  await test('the bomblets go up with one scatter special at the burst', () => { assert.ok(sc.length === 1 && Math.abs(nth(sc, 0).ang + Math.PI / 2) < 1e-12
    && nth(sc, 0).x === nth(fk.log.impact, 0).x); });

  const dh = makeEnv();
  const skull = open('deathshead', dh.env, dh.fx, null);
  const tops: number[] = [];
  dh.env.special = (fx, wkey, name, x, y, ang) => { if (name === 'split') tops.push(Math.sin(ang)); };
  run(skull, dh.env, 15, p => p.phase === 'show');
  await test('Death\'s Head splits at the top of its arc, heading level or down', () => { assert.ok(tops.length === 1 && nth(tops, 0) >= 0 && nth(tops, 0) < 0.1, JSON.stringify(tops)); });
  await test('into its nine warheads', () => { assert.ok(dh.log.impact.length === weapon('deathshead').split, String(dh.log.impact.length)); });
}

/* ---- guns with no flight, and tracers ---- */
{
  const byEffect = (e: string) => must(GAME.arsenal.ammo.find(a => a.effect === e), e).key;
  const bm = makeEnv();
  const beamKey = byEffect('beam');
  const beam = open(beamKey, bm.env, bm.fx, null);
  run(beam, bm.env, 4, p => p.phase === 'show');
  const lines = bm.log.special.filter(s => s.name === 'beam');
  await test('a beam is one straight line from the barrel through the dummy', () => { assert.ok(lines.length === 1 && Number(nth(lines, 0).len) > 200 && beam.shells.length === 0, JSON.stringify(lines)); });
  await test('the beam strikes the dummy once for its flat damage', () => { assert.ok(beam.volleyHits === 1 && beam.foeHp === PV_FOE_HP - weapon(beamKey).dmg, `hits ${beam.volleyHits}, hp ${beam.foeHp}`); });
  await test('the beam passes through the dummy, and bursts where it stops', () => { assert.ok(bm.log.special.some(s => s.name === 'pierce')
    && bm.log.impact.length === 1 && nth(bm.log.impact, 0).r === weapon(beamKey).radius); });
  await test('a beam result reads as a beam', () => { assert.ok(/beam/i.test(beam.result), beam.result); });
  const lim = weapon(beamKey).aimMin ?? 10;
  await test('the range aims its beam inside the gun\'s own limits, as the war does', () => { assert.ok(beam.angle >= lim && beam.angle <= 180 - lim, String(beam.angle)); });

  const rg = makeEnv();
  const ringKey = byEffect('plasma');
  const ring = open(ringKey, rg.env, rg.fx, null);
  await test('a plasma demo stands the dummy within the ring', () => { assert.ok(ring.tx - ring.sx < weapon(ringKey).radius); });
  run(ring, rg.env, 4, p => p.phase === 'show');
  await test('the ring plays around the gunner at its full radius', () => { assert.ok(rg.log.impact.length === 1 && nth(rg.log.impact, 0).x === ring.sx
    && nth(rg.log.impact, 0).r === weapon(ringKey).radius && ring.shells.length === 0, JSON.stringify(rg.log.impact)); });
  await test('the ring burns the dummy, with falloff', () => { assert.ok(ring.volleyHits === 1 && ring.foeHp > PV_FOE_HP - weapon(ringKey).dmg && ring.foeHp < PV_FOE_HP, `hp ${ring.foeHp}`); });
  await test('a ring cuts no crater', () => { assert.ok(ring.terr.every((v, i) => v === makePreviewTerrain()[i])); });

  for (const key of GAME.arsenal.ammo.filter(a => a.effect === 'tracer').map(a => a.key)) {
    const tr = makeEnv();
    const pv = open(key, tr.env, tr.fx, null);
    run(pv, tr.env, 12, p => p.phase === 'show');
    await test(`${key}: a tracer leaves its path, not a blast`, () => { assert.ok(tr.log.impact.every(i => i.r < 20) && pv.booms.length === 0
      && pv.terr.every((v, i) => v === makePreviewTerrain()[i]) && must(pv.trace, 'trace').pts.length > 10 && must(pv.trace, 'trace').kind === must(weapon(key).gfx, 'gfx').mark, JSON.stringify(tr.log.impact)); });
    await test(`${key}: the result says where it came down`, () => { assert.ok(/mark/i.test(pv.result), pv.result); });
    run(pv, tr.env, 4, p => p.phase === 'fly');
    await test(`${key}: the next volley starts a new path`, () => { assert.ok(must(pv.trace, 'trace').pts.length < 10, String(must(pv.trace, 'trace').pts.length)); });
  }
}

/* ---- weapons with their own behaviour ---- */
{
  const { env, fx } = makeEnv();
  const buck = open('buck', env, fx, null);
  run(buck, env, 0.7);
  await test('buckshot fires its whole pellet fan', () => { assert.ok(buck.shells.length === weapon('buck').pellets, `${buck.shells.length}`); });

  const cl = makeEnv();
  const cluster = open('cluster', cl.env, cl.fx, null);
  run(cluster, cl.env, 0.7);
  run(cluster, cl.env, 10, p => p.phase === 'show');
  await test('a cluster shell blooms into bomblets', () => { assert.ok(cl.log.special.some(s => s.name === 'split')); });
  await test('the bomblets blast with their own damage and radius', () => { assert.ok(cl.log.impact.some(i => i.r === (weapon('cluster').subRadius || weapon('cluster').radius))); });

  await test('trails drip while shells fly', () => { assert.ok(buck.phase === 'fly' && cl.log.trail > 0); });

  // A roller touches down, rolls on along the hills, and bursts at the dummy.
  const rl = makeEnv();
  const roller = open('roller', rl.env, rl.fx, null);
  run(roller, rl.env, 0.7);
  run(roller, rl.env, 15, p => p.phase === 'show');
  await test('a roller demo lands a hit on the dummy', () => { assert.ok(rl.log.impact.length === 1 && roller.volleyHits === 1, JSON.stringify(rl.log.impact)); });
  // A roller dropped short of the dummy rolls toward it and bursts there.
  const rr = makeEnv();
  const short = open('roller', rr.env, rr.fx, null);
  short.phase = 'fly';
  short.tx = 55;
  short.shells.push({ x: 100, y: nth(short.terr, 100) - 2, vx: 40, vy: 30, wkey: 'roller', age: 0.5, pierced: false, split: false });
  let rolled = 0;
  run(short, rr.env, 15, p => { if (p.shells.some(s => s.rolling)) rolled++; return p.phase === 'show'; });
  await test('a roller rolls after it lands', () => { assert.ok(rolled > 10, `${rolled} frames rolling`); });
  await test('a roller bursts once, on the dummy', () => { assert.ok(rr.log.impact.length === 1 && Math.abs(nth(rr.log.impact, 0).x - 55) < 12 && short.volleyHits === 1, JSON.stringify(rr.log.impact)); });
}

/* ---- the dummy and the hills reset ---- */
{
  const { env, fx } = makeEnv();
  const pv = open('nuke', env, fx, null);
  const hills = pv.terr;
  run(pv, env, 12, p => p.phase === 'show');
  await test('a blast carves the hills', () => { assert.ok(pv.terr === hills && pv.terr.some((v, i) => v !== makePreviewTerrain()[i])); });
  await test('a hurt dummy stays hurt through the result', () => { assert.ok(pv.foeHp < PV_FOE_HP); });
  pv.foeHp = 0;
  run(pv, env, 4, p => p.phase === 'aim');
  await test('a downed dummy and a scarred field are reset for the next volley', () => { assert.ok(pv.foeHp === PV_FOE_HP && pv.terr !== hills && pv.terr.every((v, i) => v === makePreviewTerrain()[i])); });

  const q = open('shell', env, fx, null);
  q.foeHp = 50;
  q.volleys = 1; q.phase = 'show'; q.t = 0.01;
  stepPreview(q, DT, env);
  await test('the second volley leaves the field and the dummy alone', () => { assert.ok(q.volleys === 2 && q.foeHp === 50); });
  q.phase = 'show'; q.t = 0.01;
  stepPreview(q, DT, env);
  await test('the third volley resets the field even though the dummy lives', () => { assert.ok(q.volleys === 3 && q.foeHp === PV_FOE_HP && q.terr.every((v, i) => v === makePreviewTerrain()[i])); });
}

/* ---- the same clock, the same demo ---- */
{
  const a = makeEnv(), b = makeEnv();
  const pa = open('seeker', a.env, null, null), pb = open('seeker', b.env, null, null);
  run(pa, a.env, 8);
  run(pb, b.env, 8);
  const pick = (p: PreviewState) => JSON.stringify([p.phase, p.angle, p.power, p.foeHp, p.volleys, p.shells, p.booms, p.result]);
  await test('two demos on the same frames end in the same state', () => { assert.ok(pick(pa) === pick(pb)); });
}


/* ---- earth on the range settles on screen as in the war: liquid dirt flows out ---- */
{
  const { env } = makeEnv();
  const pv = open(must(arsenal.order.find(k => weapon(k).effect === 'pour'), 'pour'), env, null, null);
  run(pv, env, 12, p => p.phase === 'show');
  let flowing = 0;
  run(pv, env, 1, p => {
    const shown = previewGround(p);
    if (shown !== p.terr && shown.some((v, i) => v !== p.terr[i])) flowing++;
    return false;
  });
  await test('liquid dirt on the range flows out over several frames before it is the ground', () => { assert.ok(flowing > 10, `${flowing} frames flowing`); });
  run(pv, env, 1.6);
  await test('then the drawn ground is the ground', () => { assert.ok(previewGround(pv) === pv.terr); });
}

/* ---- napalm on the range: a pool in the dip under the dummy burns it tick by tick ---- */
for (const wkey of arsenal.order.filter(k => weapon(k).effect === 'napalm')) {
  const w = weapon(wkey);
  const { env, log } = makeEnv();
  const pv = open(wkey, env, null, null);
  const ground = pv.terr.slice();
  let burningFrames = 0, hpWhileBurning: number[] = [];
  run(pv, env, 15, p => {
    if (p.burn) { burningFrames++; hpWhileBurning.push(p.foeHp); }
    return p.phase === 'show';
  });
  const ticks = Math.floor(Number(w.burn) / Number(w.tick) + 1e-9);
  await test(`${wkey} on the range lights its pool (the burn special along it)`, () => { assert.ok(log.special.some(s => s.name === 'burn' && Number(s.len) > 0) && !!pv.pool); });
  await test(`${wkey} on the range burns for its burn seconds, the volley open until it is out`, () => { assert.ok(Math.abs(burningFrames - Number(w.burn) * 60) <= 3, `${burningFrames} frames`); });
  await test(`${wkey} on the range burns the dummy every tick`, () => { assert.ok(PV_FOE_HP - pv.foeHp === Math.min(PV_FOE_HP, w.dmg * ticks)
    && new Set(hpWhileBurning).size >= Math.min(ticks, Math.ceil(PV_FOE_HP / w.dmg)), `${pv.foeHp} hp`); });
  await test(`${wkey} on the range never changes the ground`, () => { assert.ok(JSON.stringify(pv.terr) === JSON.stringify(ground)); });
  await test(`${wkey} on the range says what it burned`, () => { assert.ok(/^Burned the dummy: \d+ damage/.test(pv.result), pv.result); });
}

/* ---- a digger stops at the dummy, as the war's does ---- */
{
  const { env, fx } = makeEnv();
  const hogKey = Object.keys(arsenal.weapons).find(k => weapon(k).effect === 'dig' && Number(weapon(k).digLen) >= 100) || 'heavydigger';
  const w = weapon(hogKey);
  const pv = open(hogKey, env, fx, null);
  pv.phase = 'fly';
  const s: PreviewShell = { x: pv.tx - 60, y: pv.ty - 10, vx: 1, vy: 0, wkey: hogKey, age: 0, pierced: false, split: false, digging: true, dux: 1, duy: 0, dl: 0, dk: 0, dn: Math.ceil(must(w.digLen, 'digLen') / 4) };
  pv.shells = [s];
  const startX = s.x;
  for (let i = 0; i < 400 && !s.dead; i++) stepPreview(pv, DT, env);
  await test('a preview digger stops at the dummy and bursts its warheads there', () => { assert.ok(s.dead && s.x < pv.tx && s.x > startX && s.dk === (w.warheads || 0), `x ${s.x} dk ${s.dk}`); });
}
