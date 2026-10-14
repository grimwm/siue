// The firing-range preview without a browser. src/preview.ts takes its weapons,
// effects and result line as an environment, so each case steps the demo on a
// clock the test moves by hand (fixed 1/60 s frames) and records what the
// environment was asked to do. The arsenal is the real one, from game.json.
import { check } from '../../_kit/test/check.ts';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, stepBallistic, shotSpeed, GRAV, FLAT_GRAV } from '../src/sim.ts';
import {
  PV_W, PV_H, PV_FOE_HP, PV_WIND, createPreview, stepPreview, solvePreview, previewShot, makePreviewTerrain, previewGround,
} from '../src/preview.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);


const DT = 1 / 60;

/** An environment that records every hook call, with a counting fake effects system. */
function makeEnv() {
  const log = { muzzle: [], impact: [], special: [], trail: 0, results: [] };
  const fx = { wind: 0, steps: 0, cleared: 0, step(dt) { this.steps++; this.lastDt = dt; }, clear() { this.cleared++; } };
  const env = {
    weapon: key => arsenal.weapons[key],
    muzzle: (f, wkey, x, y, ang) => log.muzzle.push({ f, wkey, x, y, ang }),
    impact: (f, wkey, x, y, r) => log.impact.push({ f, wkey, x, y, r }),
    special: (f, wkey, name, x, y, ang, len) => log.special.push({ f, wkey, name, x, y, ang, len }),
    trail: () => { log.trail++; },
    showResult: text => log.results.push(text),
  };
  return { env, log, fx };
}

/** The demo's clock: a frame at a time, until `done(pv)` or the time limit. */
function run(pv, env, seconds, done = () => false) {
  let t = 0;
  while (t < seconds - 1e-9 && !done(pv)) { stepPreview(pv, DT, env); t += DT; }
  return t;
}

/* ---- opening ---- */
{
  const { env, fx } = makeEnv();
  check('an unknown weapon opens nothing', createPreview('no-such-gun', env, fx, 'canvas') === null);
  const pv = createPreview('shell', env, fx, 'canvas');
  check('a new demo waits to aim', pv.phase === 'aim' && Math.abs(pv.t - 0.6) < 1e-12 && pv.shells.length === 0);
  check('it starts at full dummy health with the stage wind', pv.foeHp === PV_FOE_HP && pv.wind === PV_WIND && pv.volleys === 0);
  check('it keeps the stage and system it was given', pv.cv === 'canvas' && pv.fx === fx);
  check('the field is the preview size', pv.terr.length === PV_W && PV_H === 200 && pv.sx === 44 && pv.tx === 296);
  const a = makePreviewTerrain(), b = makePreviewTerrain();
  check('each terrain is its own array of the same hills', a !== b && a.every((v, i) => v === b[i]));
  check('a demo with no effects system opens too', createPreview('shell', env, null, null).fx === null);
}

/* ---- the clock: aim, fly, show, aim again ---- */
{
  const { env, log, fx } = makeEnv();
  const pv = createPreview('shell', env, fx, null);
  run(pv, env, 0.5);
  check('still aiming at 0.5 s', pv.phase === 'aim' && log.muzzle.length === 0);
  run(pv, env, 0.2);
  check('fires once the 0.6 s wait is up', pv.phase === 'fly' && log.muzzle.length === 1 && pv.shells.length === 1);
  const m = log.muzzle[0];
  check('the muzzle flash is at the barrel, along the solved angle',
    m.wkey === 'shell' && m.x === pv.sx && m.y === pv.terr[pv.sx] - 12
    && Math.abs(m.ang - Math.atan2(-Math.sin(pv.angle * Math.PI / 180), Math.cos(pv.angle * Math.PI / 180))) < 1e-12);
  check('the effects system steps every frame with the demo wind', fx.steps > 0 && fx.wind === PV_WIND && Math.abs(fx.lastDt - DT) < 1e-12);

  const t = run(pv, env, 10, p => p.phase === 'show');
  check('the shell lands and the result shows', pv.phase === 'show' && t < 5, `phase ${pv.phase} after ${t}`);
  check('the result is posted once, as a line', log.results.length === 1 && log.results[0] === pv.result && pv.result.length > 0);
  check('the result holds for 1.6 s then the next volley aims for 0.5 s',
    Math.abs(pv.resultT - 1.6) < 1e-9 && Math.abs(pv.t - 1.6) < 1e-9);
  run(pv, env, 1.5);
  check('still showing at 1.5 s', pv.phase === 'show' && pv.volleys === 0);
  run(pv, env, 0.2);
  check('then aims again', pv.phase === 'aim' && pv.volleys === 1 && pv.t <= 0.5 && pv.t > 0.3);
  check('the result line fades out', pv.resultT <= 0);
}

/* ---- every gun's first volley ends; and the demo flies the war's ballistics ---- */
{
  const { env } = makeEnv();
  for (const key of arsenal.order) {
    const pv = createPreview(key, env, null, null);
    run(pv, env, 12, p => p.phase === 'show');
    check(`${key}: the first volley ends with a result`, pv.phase === 'show' && pv.result.length > 0, `phase ${pv.phase}`);
    // The solver aims an unsteered shot; the seeker bends its own way, so only it may miss.
    // A tracer hurts nothing: its mark comes down by the dummy. The earth guns
    // (and a harmless crater) bury the dummy or drop it; a riot charge digs its
    // buried shooter out.
    const w = arsenal.weapons[key];
    if (w.effect === 'tracer') {
      const end = pv.trace && pv.trace.pts.slice(-2);
      check(`${key}: the first volley comes down by the dummy`, !!end && Math.abs(end[0] - pv.tx) < 14 && pv.foeHp === PV_FOE_HP, JSON.stringify(end));
    } else if (w.effect === 'riot') {
      check(`${key}: the buried shooter digs itself out`, pv.terr[pv.sx] >= pv.sy - 2 && /^Dug out/.test(pv.result), `${pv.terr[pv.sx]} vs ${pv.sy}: ${pv.result}`);
    } else if (w.effect === 'dirt' || w.effect === 'pour') {
      check(`${key}: the first volley buries the dummy`, pv.buriedBy > 2 && /^Buried the dummy/.test(pv.result), pv.result);
    } else if (w.effect === 'dig' || w.effect === 'slump' || w.dmg === 0) {
      check(`${key}: the first volley drops the dummy, for fall damage`, pv.dropped > 10 && pv.foeHp < PV_FOE_HP && /^Dropped the dummy/.test(pv.result), pv.result);
    } else if (key !== 'seeker') {
      check(`${key}: the first volley lands on the dummy`, pv.volleyDmg > 0 && pv.foeHp < PV_FOE_HP, `hits ${pv.volleyHits}, hp ${pv.foeHp}`);
    }
  }
  // The solved shot, replayed with sim.js alone, comes down on the target.
  const pv = createPreview('mortar', env, null, null);
  solvePreview(pv, env);
  const w = arsenal.weapons.mortar;
  const rad = pv.angle * Math.PI / 180;
  const st = { x: pv.sx, y: pv.terr[pv.sx] - 12, vx: Math.cos(rad) * shotSpeed(pv.power, w.flat, w.speed), vy: -Math.sin(rad) * shotSpeed(pv.power, w.flat, w.speed) };
  let landed = null;
  for (let i = 0; i < 720 && !landed; i++) {
    stepBallistic(st, 1 / 60, pv.wind, w.flat ? FLAT_GRAV : GRAV);
    if (st.x < 0 || st.x >= PV_W || st.y >= PV_H || (i >= 6 && st.y >= pv.terr[Math.max(0, Math.min(PV_W - 1, Math.round(st.x)))])) landed = st.x;
  }
  check('the solved mortar lob comes down on the target column', landed !== null && Math.abs(landed - pv.tx) < 8, `landed ${landed}`);
  check('previewShot agrees with that replay', Math.abs(previewShot(pv, env, pv.angle, pv.power) - landed) < 1e-9);
  check('the solution stays inside the angle and power limits', pv.angle >= 5 && pv.angle <= 85 && pv.power >= 10 && pv.power <= 100);
}

/* ---- leaping, scattering and apex guns: the war's own sub-munitions ---- */
{
  const lf = makeEnv();
  const leap = createPreview('leapfrog', lf.env, lf.fx, null);
  leap.tx = 180; // room on the stage for both leaps
  run(leap, lf.env, 15, p => p.phase === 'show');
  const w = arsenal.weapons.leapfrog;
  check('Leapfrog bursts three times, the leaps with its sub blast', lf.log.impact.length === w.hops
    && lf.log.impact[0].r === w.radius && lf.log.impact.slice(1).every(i => i.r === w.subRadius), JSON.stringify(lf.log.impact));
  check('each leap plays the hop special', lf.log.special.filter(s => s.name === 'hop').length === w.hops - 1);
  check('the leaps walk on the way it flew', lf.log.impact[1].x > lf.log.impact[0].x && lf.log.impact[2].x > lf.log.impact[1].x);
  const edge = makeEnv();
  const far = createPreview('leapfrog', edge.env, edge.fx, null);
  run(far, edge.env, 15, p => p.phase === 'show');
  check('a leap off the stage ends the chain, as in the war', edge.log.impact.length < w.hops && edge.log.impact.at(-1).x >= 360,
    JSON.stringify(edge.log.impact.map(i => i.x)));

  const fk = makeEnv();
  const funky = createPreview('funky', fk.env, fk.fx, null);
  run(funky, fk.env, 15, p => p.phase === 'show');
  const f = arsenal.weapons.funky;
  check('Funky bursts once, then each of its bomblets', fk.log.impact.length === 1 + f.split
    && fk.log.impact[0].r === f.radius && fk.log.impact.slice(1).every(i => i.r === f.subRadius), JSON.stringify(fk.log.impact.map(i => i.r)));
  const sc = fk.log.special.filter(s => s.name === 'scatter');
  check('the bomblets go up with one scatter special at the burst', sc.length === 1 && Math.abs(sc[0].ang + Math.PI / 2) < 1e-12
    && sc[0].x === fk.log.impact[0].x);

  const dh = makeEnv();
  const skull = createPreview('deathshead', dh.env, dh.fx, null);
  const tops = [];
  dh.env.special = (fx, wkey, name, x, y, ang) => { if (name === 'split') tops.push(Math.sin(ang)); };
  run(skull, dh.env, 15, p => p.phase === 'show');
  check('Death\'s Head splits at the top of its arc, heading level or down', tops.length === 1 && tops[0] >= 0 && tops[0] < 0.1, JSON.stringify(tops));
  check('into its nine warheads', dh.log.impact.length === arsenal.weapons.deathshead.split, String(dh.log.impact.length));
}

/* ---- guns with no flight, and tracers ---- */
{
  const byEffect = e => GAME.arsenal.ammo.find(a => a.effect === e).key;
  const bm = makeEnv();
  const beamKey = byEffect('beam');
  const beam = createPreview(beamKey, bm.env, bm.fx, null);
  run(beam, bm.env, 4, p => p.phase === 'show');
  const lines = bm.log.special.filter(s => s.name === 'beam');
  check('a beam is one straight line from the barrel through the dummy', lines.length === 1 && lines[0].len > 200 && beam.shells.length === 0,
    JSON.stringify(lines));
  check('the beam strikes the dummy once for its flat damage', beam.volleyHits === 1 && beam.foeHp === PV_FOE_HP - arsenal.weapons[beamKey].dmg,
    `hits ${beam.volleyHits}, hp ${beam.foeHp}`);
  check('the beam passes through the dummy, and bursts where it stops', bm.log.special.some(s => s.name === 'pierce')
    && bm.log.impact.length === 1 && bm.log.impact[0].r === arsenal.weapons[beamKey].radius);
  check('a beam result reads as a beam', /beam/i.test(beam.result), beam.result);
  const lim = arsenal.weapons[beamKey].aimMin ?? 10;
  check('the range aims its beam inside the gun\'s own limits, as the war does', beam.angle >= lim && beam.angle <= 180 - lim, String(beam.angle));

  const rg = makeEnv();
  const ringKey = byEffect('plasma');
  const ring = createPreview(ringKey, rg.env, rg.fx, null);
  check('a plasma demo stands the dummy within the ring', ring.tx - ring.sx < arsenal.weapons[ringKey].radius);
  run(ring, rg.env, 4, p => p.phase === 'show');
  check('the ring plays around the gunner at its full radius', rg.log.impact.length === 1 && rg.log.impact[0].x === ring.sx
    && rg.log.impact[0].r === arsenal.weapons[ringKey].radius && ring.shells.length === 0, JSON.stringify(rg.log.impact));
  check('the ring burns the dummy, with falloff', ring.volleyHits === 1 && ring.foeHp > PV_FOE_HP - arsenal.weapons[ringKey].dmg && ring.foeHp < PV_FOE_HP,
    `hp ${ring.foeHp}`);
  check('a ring cuts no crater', ring.terr.every((v, i) => v === makePreviewTerrain()[i]));

  for (const key of GAME.arsenal.ammo.filter(a => a.effect === 'tracer').map(a => a.key)) {
    const tr = makeEnv();
    const pv = createPreview(key, tr.env, tr.fx, null);
    run(pv, tr.env, 12, p => p.phase === 'show');
    check(`${key}: a tracer leaves its path, not a blast`, tr.log.impact.every(i => i.r < 20) && pv.booms.length === 0
      && pv.terr.every((v, i) => v === makePreviewTerrain()[i]) && pv.trace.pts.length > 10 && pv.trace.kind === arsenal.weapons[key].gfx.mark,
      JSON.stringify(tr.log.impact));
    check(`${key}: the result says where it came down`, /mark/i.test(pv.result), pv.result);
    run(pv, tr.env, 4, p => p.phase === 'fly');
    check(`${key}: the next volley starts a new path`, pv.trace.pts.length < 10, String(pv.trace.pts.length));
  }
}

/* ---- weapons with their own behaviour ---- */
{
  const { env, fx } = makeEnv();
  const buck = createPreview('buck', env, fx, null);
  run(buck, env, 0.7);
  check('buckshot fires its whole pellet fan', buck.shells.length === arsenal.weapons.buck.pellets, `${buck.shells.length}`);

  const cl = makeEnv();
  const cluster = createPreview('cluster', cl.env, cl.fx, null);
  run(cluster, cl.env, 0.7);
  run(cluster, cl.env, 10, p => p.phase === 'show');
  check('a cluster shell blooms into bomblets', cl.log.special.some(s => s.name === 'split'));
  check('the bomblets blast with their own damage and radius',
    cl.log.impact.some(i => i.r === (arsenal.weapons.cluster.subRadius || arsenal.weapons.cluster.radius)));

  const lance = makeEnv();
  const l = createPreview('lance', lance.env, lance.fx, null);
  run(l, lance.env, 0.7);
  run(l, lance.env, 10, p => p.phase === 'show');
  check('a lance pierces the dummy and keeps flying', lance.log.special.some(s => s.name === 'pierce') && l.volleyHits >= 1);
  check('trails drip while shells fly', buck.phase === 'fly' && lance.log.trail > 0);

  // A roller touches down, rolls on along the hills, and bursts at the dummy.
  const rl = makeEnv();
  const roller = createPreview('roller', rl.env, rl.fx, null);
  run(roller, rl.env, 0.7);
  run(roller, rl.env, 15, p => p.phase === 'show');
  check('a roller demo lands a hit on the dummy', rl.log.impact.length === 1 && roller.volleyHits === 1, JSON.stringify(rl.log.impact));
  // A roller dropped short of the dummy rolls toward it and bursts there.
  const rr = makeEnv();
  const short = createPreview('roller', rr.env, rr.fx, null);
  short.phase = 'fly';
  short.tx = 55;
  short.shells.push({ x: 100, y: short.terr[100] - 2, vx: 40, vy: 30, wkey: 'roller', age: 0.5, pierced: false, split: false });
  let rolled = 0;
  run(short, rr.env, 15, p => { if (p.shells.some(s => s.rolling)) rolled++; return p.phase === 'show'; });
  check('a roller rolls after it lands', rolled > 10, `${rolled} frames rolling`);
  check('a roller bursts once, on the dummy', rr.log.impact.length === 1 && Math.abs(rr.log.impact[0].x - 55) < 12 && short.volleyHits === 1,
    JSON.stringify(rr.log.impact));
}

/* ---- the dummy and the hills reset ---- */
{
  const { env, fx } = makeEnv();
  const pv = createPreview('nuke', env, fx, null);
  const hills = pv.terr;
  run(pv, env, 12, p => p.phase === 'show');
  check('a blast carves the hills', pv.terr === hills && pv.terr.some((v, i) => v !== makePreviewTerrain()[i]));
  check('a hurt dummy stays hurt through the result', pv.foeHp < PV_FOE_HP);
  pv.foeHp = 0;
  run(pv, env, 4, p => p.phase === 'aim');
  check('a downed dummy and a scarred field are reset for the next volley',
    pv.foeHp === PV_FOE_HP && pv.terr !== hills && pv.terr.every((v, i) => v === makePreviewTerrain()[i]));

  const q = createPreview('shell', env, fx, null);
  q.foeHp = 50;
  q.volleys = 1; q.phase = 'show'; q.t = 0.01;
  stepPreview(q, DT, env);
  check('the second volley leaves the field and the dummy alone', q.volleys === 2 && q.foeHp === 50);
  q.phase = 'show'; q.t = 0.01;
  stepPreview(q, DT, env);
  check('the third volley resets the field even though the dummy lives', q.volleys === 3 && q.foeHp === PV_FOE_HP && q.terr.every((v, i) => v === makePreviewTerrain()[i]));
}

/* ---- the same clock, the same demo ---- */
{
  const a = makeEnv(), b = makeEnv();
  const pa = createPreview('seeker', a.env, null, null), pb = createPreview('seeker', b.env, null, null);
  run(pa, a.env, 8);
  run(pb, b.env, 8);
  const pick = p => JSON.stringify([p.phase, p.angle, p.power, p.foeHp, p.volleys, p.shells, p.booms, p.result]);
  check('two demos on the same frames end in the same state', pick(pa) === pick(pb));
}


/* ---- earth on the range settles on screen as in the war: liquid dirt flows out ---- */
{
  const { env } = makeEnv();
  const pv = createPreview(arsenal.order.find(k => arsenal.weapons[k].effect === 'pour'), env, null, null);
  run(pv, env, 12, p => p.phase === 'show');
  let flowing = 0;
  run(pv, env, 1, p => {
    const shown = previewGround(p);
    if (shown !== p.terr && shown.some((v, i) => v !== p.terr[i])) flowing++;
    return false;
  });
  check('liquid dirt on the range flows out over several frames before it is the ground', flowing > 10, `${flowing} frames flowing`);
  run(pv, env, 1.6);
  check('then the drawn ground is the ground', previewGround(pv) === pv.terr);
}

/* ---- napalm on the range: a pool in the dip under the dummy burns it tick by tick ---- */
for (const wkey of arsenal.order.filter(k => arsenal.weapons[k].effect === 'napalm')) {
  const w = arsenal.weapons[wkey];
  const { env, log } = makeEnv();
  const pv = createPreview(wkey, env, null, null);
  const ground = pv.terr.slice();
  let burningFrames = 0, hpWhileBurning = [];
  run(pv, env, 15, p => {
    if (p.burn) { burningFrames++; hpWhileBurning.push(p.foeHp); }
    return p.phase === 'show';
  });
  const ticks = Math.floor(w.burn / w.tick + 1e-9);
  check(`${wkey} on the range lights its pool (the burn special along it)`, log.special.some(s => s.name === 'burn' && s.len > 0) && !!pv.pool);
  check(`${wkey} on the range burns for its burn seconds, the volley open until it is out`, Math.abs(burningFrames - w.burn * 60) <= 3, `${burningFrames} frames`);
  check(`${wkey} on the range burns the dummy every tick`, PV_FOE_HP - pv.foeHp === Math.min(PV_FOE_HP, w.dmg * ticks)
    && new Set(hpWhileBurning).size >= Math.min(ticks, Math.ceil(PV_FOE_HP / w.dmg)), `${pv.foeHp} hp`);
  check(`${wkey} on the range never changes the ground`, JSON.stringify(pv.terr) === JSON.stringify(ground));
  check(`${wkey} on the range says what it burned`, /^Burned the dummy: \d+ damage/.test(pv.result), pv.result);
}
