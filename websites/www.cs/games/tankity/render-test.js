// The renderer reads and paints; it never writes. Run here: `node render-test.js`.
// js/render.js (compiled from src/render.ts) is driven with a recording canvas
// stub and a view that is frozen all the way down: any assignment to the view
// (a tank, a boom, the terrain) throws in module code, so a frame that tried to
// advance or change game state fails here without a browser.
import { createRenderer, drawChassis } from './js/render.js';
import { W, H, facing, isGroundUnit, muzzle, surfY, hashSeed, mulberry32, gauss } from './js/sim.js';

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${detail}`}`);
  if (!ok) failed++;
};

function deepFreeze(o) {
  if (o && typeof o === 'object' && !Object.isFrozen(o) && !(o instanceof Function)) {
    Object.freeze(o);
    for (const v of Object.values(o)) deepFreeze(v);
  }
  return o;
}

/* A canvas context that accepts every call and every property, and counts the calls. */
function stubContext() {
  const calls = { n: 0, fills: 0, texts: [] };
  const ctx = new Proxy({}, {
    get(t, p) {
      if (p in t) return t[p];
      if (p === 'measureText') return s => ({ width: String(s).length * 6 });
      return (...a) => { calls.n++; if (p === 'fill' || p === 'fillRect') calls.fills++; if (p === 'fillText') calls.texts.push(a[0]); return ctx; };
    },
    set(t, p, v) { t[p] = v; return true; },
  });
  return { ctx, calls };
}
function stubCanvas() {
  const { ctx, calls } = stubContext();
  return { canvas: { width: 1440, height: 920, getContext: () => ctx }, calls };
}

const fxSystem = { draw() {}, drawFlash() {} };
const fxApi = { reduced: false, sheets: {}, glow() {}, drawBody() {} };
const shownAngle = t => (t.showA === undefined ? t.angle : t.showA);
const deps = {
  fx: fxApi,
  size: { w: W, h: H },
  sim: { facing, isGroundUnit, muzzle, surfY, hashSeed, mulberry32, gauss },
  shownAngle,
  look: () => ({ shell: '#ffe27a', blast: ['#ffb13c', '#fff3c4'] }),
  fxBody: () => ({}),
  reducedMotion: () => false,
  random: () => 0.5,
};

const terrain = Array.from({ length: W }, (_, x) => 300 + 20 * Math.sin(x / 40));
const tank = (id, x, extra) => ({ id, isPlayer: false, x, y: terrain[x], angle: 50, power: 60, hp: 80, maxHp: 100, fuel: 0, color: '#ff00ff', ...extra });
const view = deepFreeze({
  time: 3.2, shake: 0.4, cam: { z: 0.8, cx: 360, cy: 230 }, skyKey: 'test-seed',
  terrain, clouds: [{ x: 100, y: 60, s: 1.2, v: 4 }],
  tanks: [
    tank('tank', 100, { isPlayer: true, color: undefined, body: 'walker', moving: true }),
    tank('guest', 250, { human: true, body: 'buggy', menu: true, showA: 61.5 }),
    tank('wraith', 400, {}),
    tank('spotter', 500, {}),
    tank('abc', 650, { name: 'abc', bot: true }),
    tank('reaper', 600, { hp: 0 }),
  ],
  turnUnit: null, online: true, aim: null,
  booms: [{ x: 300, y: 310, r: 26, wkey: 'shell', t: 0.2, life: 0.5 }],
  fx: fxSystem,
  shells: [{ x: 200, y: 200, vx: 30, vy: -40, wkey: 'mortar' }],
  replay: [{ x: 220, y: 210, vx: 10, vy: 10, wkey: 'nuke' }],
  sparks: [{ x: 50, y: 50, life: 0.3, color: '#fff' }],
  wind: -5, windGauge: true, windTop: 30, textScale: 1.1,
  turnClock: { left: 2.4, myTurn: true },
  preview: null,
});
// The turn marker, the menu badge and the aim arm need the same tank objects the view lists.
const live = deepFreeze({ ...view, turnUnit: view.tanks[1], aim: { unit: view.tanks[2], length: 30 } });

{
  const { canvas, calls } = stubCanvas();
  const r = createRenderer(canvas, deps);
  let threw = '';
  try {
    r.frame(view);
    r.frame(live);
  } catch (e) { threw = String(e); }
  check('frame-paints-a-frozen-view', !threw && calls.n > 200 && calls.fills > 20, threw || `calls=${calls.n}`);
  // A player who left: the bot driving the unit is tagged, and only that unit.
  check('bot-unit-is-tagged', calls.texts.includes('BOT') && calls.texts.filter(t => t === 'BOT').length === 2, calls.texts.join(','));
}

{
  // The preview paints on its own canvas, from a frozen snapshot too.
  const main = stubCanvas(), small = stubCanvas();
  const pv = deepFreeze({
    canvas: small.canvas, width: 360, height: 200, terr: Array.from({ length: 360 }, () => 150),
    sx: 44, tx: 296, angle: 60, foeHp: 30, foeHpMax: 60, wkey: 'shell', wind: 3,
    booms: [], shells: [{ x: 100, y: 100, vx: 1, vy: 1, wkey: 'shell' }], fx: fxSystem, result: 'Clean miss.', resultT: 1,
  });
  let threw = '';
  try { createRenderer(main.canvas, deps).frame(deepFreeze({ ...view, preview: pv })); } catch (e) { threw = String(e); }
  check('preview-paints-its-own-canvas', !threw && small.calls.n > 30 && main.calls.n > 200, threw || `small=${small.calls.n}`);
}

{
  // No 2D context (an old browser, a lost canvas): a frame is a quiet no-op.
  const r = createRenderer({ width: 720, height: 460, getContext: () => null }, deps);
  let threw = '';
  try { r.frame(view); } catch (e) { threw = String(e); }
  check('no-context-is-a-no-op', !threw, threw);
}

{
  // The unit picker draws each body with the same painter the battlefield uses.
  const { ctx, calls } = stubContext();
  for (const body of ['tank', 'hover', 'walker', 'buggy']) drawChassis(ctx, body, '#d7a800', 0, false);
  check('chassis-painter-draws-every-body', calls.n > 40, `calls=${calls.n}`);
}

// A new match key redraws the sky; the same key reuses it (no second build).
{
  let builds = 0;
  const counting = { ...deps, sim: { ...deps.sim, hashSeed: s => { builds++; return hashSeed(s); } } };
  const { canvas } = stubCanvas();
  const r = createRenderer(canvas, counting);
  r.frame(view); r.frame(view);
  r.frame(deepFreeze({ ...view, skyKey: 'another-seed' }));
  check('sky-builds-once-per-match-key', builds === 2, `builds=${builds}`);
}

if (failed) { console.log(`RENDER-FAILED: ${failed}`); process.exit(1); }
console.log('RENDER-OK');
