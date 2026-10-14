// The renderer reads and paints; it never writes. src/render.ts is driven with a
// recording canvas stub and a view that is frozen all the way down: any assignment
// to the view (a tank, a boom, the terrain) throws in module code, so a frame that
// tried to advance or change game state fails here without a browser.
import { check } from '../../_kit/test/check.ts';
import { CHUTE_OPEN, chuteFrame, createRenderer, drawChassis } from '../src/render.ts';
import { fitField, visibleWorld } from '../src/field.ts';
import { sceneryY } from '../src/scenery.ts';
import { skyMarks } from '../src/camera.ts';
import { ROOM_W as W, H, facing, isGroundUnit, muzzle, surfY, hashSeed, mulberry32, gauss } from '../src/sim.ts';


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
  sim: { facing, isGroundUnit, muzzle, surfY, hashSeed, mulberry32, gauss, fitField, visibleWorld, sceneryY, skyMarks },
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
  terrain, field: { w: W, h: H }, hills: { a: [30, 16, 8], p: [1, 2, 3], f: [0.005, 0.01, 0.025] },
  clouds: [{ x: 100, y: 60, s: 1.2, v: 4 }],
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
  ghosts: [{ x: 760, y: 200, vx: 200, vy: 20, wkey: 'shell' }],
  sparks: [{ x: 50, y: 50, life: 0.3, color: '#fff' }],
  wind: -5, textScale: 1.1,
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

/* A context that keeps the path and style of each fill: [style, alpha, xs, ys] per fill,
   [style, x, y, w, h] per fillRect, and each ellipse's centre with the alpha it is drawn at. */
function tracingContext() {
  const t = { fills: [], rects: [], ellipses: [] };
  let xs = [], ys = [];
  const state = { globalAlpha: 1, fillStyle: '#000' };
  const ctx = new Proxy(state, {
    get(o, p) {
      if (p in o) return o[p];
      if (p === 'measureText') return s => ({ width: String(s).length * 6 });
      if (p === 'beginPath') return () => { xs = []; ys = []; };
      if (p === 'moveTo' || p === 'lineTo') return (x, y) => { xs.push(x); ys.push(y); };
      if (p === 'ellipse') return (x, y) => { t.ellipses.push([x, y, o.globalAlpha]); };
      if (p === 'fill') return () => { t.fills.push([o.fillStyle, o.globalAlpha, xs, ys]); };
      if (p === 'fillRect') return (x, y, w, h) => { t.rects.push([o.fillStyle, x, y, w, h]); };
      if (p === 'createLinearGradient' || p === 'createRadialGradient') return () => ({ gradient: true, addColorStop() {} });
      return () => ctx;
    },
    set(o, p, v) { o[p] = v; return true; },
  });
  return { ctx, t };
}
const frameAt = (cam, extra = {}) => {
  const { ctx, t } = tracingContext();
  createRenderer({ width: 1440, height: 920, getContext: () => ctx }, deps).frame(deepFreeze({ ...view, cam, ...extra }));
  return t;
};
const camAt = z => ({ z, cx: W / 2, cy: H + 8 - H / 2 / z });

// The scenery runs under the field's edge columns (no hairline seam where the two meet).
{
  const t = frameAt(camAt(0.5));
  const scenery = t.fills.filter(f => f[0] && f[0].gradient && f[2].length > 3);
  const left = scenery.find(f => Math.min(...f[2]) < 0), right = scenery.find(f => Math.max(...f[2]) > W);
  check('scenery-overlaps-the-field-edges', left && right && Math.max(...left[2]) >= 2 && Math.min(...right[2]) <= W - 3,
    `left to ${left && Math.max(...left[2])}, right from ${right && Math.min(...right[2])}`);
}

// At a low zoom with the screen shaking, the dirt still reaches past every edge the shake can uncover.
{
  for (const z of [1, 0.6, 0.35]) {
    const cam = camAt(z);
    const t = frameAt(cam, { shake: 1 });
    const dirt = t.rects.find(r => r[0] === '#2e1a08');
    const box = { w: 1440, h: 920 }, rect = visibleWorld(fitField(box, { w: W, h: H }), box);
    const x0 = cam.cx + (rect.x0 - W / 2) / z, x1 = cam.cx + (rect.x1 - W / 2) / z, y1 = cam.cy + (rect.y1 - H / 2) / z;
    const slack = 4 / z; // the shake moves the picture up to 4 field units, before the camera's zoom
    check('dirt-covers-the-shake-at-z-' + z, dirt && dirt[1] <= x0 - slack && dirt[1] + dirt[3] >= x1 + slack && dirt[2] + dirt[4] >= y1 + slack,
      JSON.stringify(dirt));
  }
}

// The high cloud layer is part of the world and fades in with the zoom: no pop, no slide.
{
  const cl = view.clouds[0];
  let last = null, worst = 0;
  const ys = new Set();
  for (let z = 1; z >= 0.35; z -= 0.01) {
    const high = frameAt(camAt(z)).ellipses.filter(e => e[1] < cl.y - 100);
    const a = high.length ? Math.max(...high.map(e => e[2])) : 0;
    for (const e of high) ys.add(Math.round(e[1]));
    if (last !== null) worst = Math.max(worst, Math.abs(a - last));
    last = a;
  }
  check('high-clouds-fade-in-with-the-zoom', worst <= 0.08 && last > 0.3, `largest alpha step ${worst.toFixed(3)}, at the floor ${last}`);
  check('high-clouds-stay-put-in-the-world', ys.size <= 2, [...ys].join(','));
}

{
  // The parachute sheet: the opening frames once, then the sway frames on a loop.
  const seq = Array.from({ length: 40 }, (_, i) => chuteFrame(i / 12, 16));
  check('chute-opens-once-then-sways', seq.slice(0, CHUTE_OPEN).join() === '0,1,2,3,4,5'
    && seq.slice(CHUTE_OPEN, CHUTE_OPEN + 10).join() === '6,7,8,9,10,11,12,13,14,15'
    && seq[CHUTE_OPEN + 10] === 6 && seq.every(f => f >= 0 && f < 16), seq.join());
}

{
  // A unit under an open parachute: the sheet when it has loaded, the drawn canopy until then.
  const chuteView = deepFreeze({ ...view, tanks: [tank('wraith', 400, { chuteOpen: true, drawY: 250 }), tank('tank', 100, { isPlayer: true, chuteOpen: true }), tank('spotter', 500, { chute: true, chuteArmed: true })] });
  const drawn = [];
  const sheetCtx = () => {
    const { ctx, calls } = stubContext();
    return { ctx: new Proxy(ctx, { get: (t, p) => (p === 'drawImage' ? (...a) => { drawn.push(a); } : t[p]) }), calls };
  };
  const loaded = { img: { tag: 'parachute' }, fw: 64, fh: 64, cols: 4, frames: 16, ready: true };
  const a = sheetCtx();
  createRenderer({ width: 1440, height: 920, getContext: () => a.ctx }, { ...deps, fx: { ...fxApi, sheets: { parachute: loaded } } }).frame(chuteView);
  check('chute-draws-from-the-sheet', drawn.filter(d => d[0] === loaded.img).length === 2, String(drawn.length));
  drawn.length = 0;
  const b = sheetCtx();
  let threw = '';
  try {
    createRenderer({ width: 1440, height: 920, getContext: () => b.ctx }, { ...deps, fx: { ...fxApi, sheets: { parachute: { ...loaded, ready: false } } } }).frame(chuteView);
  } catch (e) { threw = String(e); }
  check('chute-falls-back-to-a-drawn-canopy', !threw && drawn.filter(d => d[0] === loaded.img).length === 0 && b.calls.n > a.calls.n, threw || `${b.calls.n} vs ${a.calls.n}`);
}

{
  // Units are drawn at their drawn height while they fall, not the rules' height, and
  // a wreck that is still falling is drawn whole until it lands.
  const labels = [];
  const { ctx } = stubContext();
  const rec = new Proxy(ctx, { get: (t, p) => (p === 'fillText' ? (txt, x, y) => { labels.push([txt, y]); } : t[p]) });
  const falling = deepFreeze({ ...view, tanks: [tank('tank', 100, { isPlayer: true, drawY: 200 }), tank('wraith', 400, { hp: 0, shownHp: 20, drawY: 150 })] });
  createRenderer({ width: 1440, height: 920, getContext: () => rec }, deps).frame(falling);
  const at = name => (labels.find(l => l[0] === name) || [])[1];
  check('a falling unit is drawn at its drawn height', at('TANK') === 200 - 38, String(at('TANK')));
  check('a wreck in mid-fall is drawn whole until it lands', at('WRAITH') === 150 - 56, String(at('WRAITH')));
}
