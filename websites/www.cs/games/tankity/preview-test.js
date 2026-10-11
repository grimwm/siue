// The firing-range preview without a browser. Run here: `node preview-test.js`.
// js/preview.js (compiled from src/preview.ts) takes its weapons, effects and
// result line as an environment, so each case steps the demo on a clock the
// test moves by hand (fixed 1/60 s frames) and records what the environment
// was asked to do. The arsenal is the real one, from game.json.
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, stepBallistic, shotSpeed, GRAV, FLAT_GRAV } from './js/sim.js';
import {
  PV_W, PV_H, PV_FOE_HP, PV_WIND, createPreview, stepPreview, solvePreview, previewShot, makePreviewTerrain,
} from './js/preview.js';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${detail}`}`);
  if (!ok) failed++;
};

const DT = 1 / 60;

/** An environment that records every hook call, with a counting fake effects system. */
function makeEnv() {
  const log = { muzzle: [], impact: [], special: [], trail: 0, results: [] };
  const fx = { wind: 0, steps: 0, cleared: 0, step(dt) { this.steps++; this.lastDt = dt; }, clear() { this.cleared++; } };
  const env = {
    weapon: key => arsenal.weapons[key],
    muzzle: (f, wkey, x, y, ang) => log.muzzle.push({ f, wkey, x, y, ang }),
    impact: (f, wkey, x, y, r) => log.impact.push({ f, wkey, x, y, r }),
    special: (f, wkey, name, x, y, ang) => log.special.push({ f, wkey, name, x, y, ang }),
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
    if (key !== 'seeker') {
      check(`${key}: the first volley lands on the dummy`, pv.volleyHits >= 1 && pv.foeHp < PV_FOE_HP, `hits ${pv.volleyHits}, hp ${pv.foeHp}`);
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
  check('a hurt dummy stays hurt through the result', pv.foeHp > 0 && pv.foeHp < PV_FOE_HP);
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

if (failed) { console.log(`\n${failed} failed`); process.exit(1); }
console.log('\npreview-test: ok');
