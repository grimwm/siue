// The renderer reads and paints; it never writes. src/render.ts is driven with a
// recording canvas stub and a view that is frozen all the way down. Any assignment
// to the view (a tank, a boom, the terrain) throws in module code, so a frame that
// tried to advance or change game state fails here without a browser.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHUTE_OPEN, SMOKE_PUFFS_MAX, chuteFrame, createRenderer, drawChassis } from '../src/render.ts';
import { fitField, visibleWorld } from '../src/field.ts';
import { sceneryY } from '../src/scenery.ts';
import { skyMarks } from '../src/camera.ts';
import { ROOM_W as W, H, facing, isGroundUnit, muzzle, surfY, hashSeed, mulberry32, gauss } from '../src/sim.ts';
import type { BattleView, DrawPool, DrawTank, FxApi, FxSystem, PreviewView, RenderDeps, SpriteSheet } from '../src/render.ts';
import type { Mark } from '../src/marks.ts';

/** A canvas as the stubs build it: its size and a context that may be missing. */
interface CanvasStub { width: number; height: number; getContext: () => object | null }
// The stand-ins below answer only what render.ts reads, so they are not the DOM types they stand in for.
const asCanvas = (c: CanvasStub): HTMLCanvasElement => c as unknown as HTMLCanvasElement;
const asContext = (c: object): CanvasRenderingContext2D => c as unknown as CanvasRenderingContext2D;
const asImage = (i: object): CanvasImageSource => i as unknown as CanvasImageSource;


function deepFreeze<T>(o: T): T {
  if (o && typeof o === 'object' && !Object.isFrozen(o) && !(o instanceof Function)) {
    Object.freeze(o);
    for (const v of Object.values(o)) deepFreeze(v);
  }
  return o;
}

/* A canvas context that accepts every call and every property, and counts the calls. */
interface Calls { n: number; fills: number; texts: unknown[]; by: Record<PropertyKey, number | undefined> }
function stubContext(): { ctx: CanvasRenderingContext2D; calls: Calls } {
  const calls: Calls = { n: 0, fills: 0, texts: [], by: {} };
  const ctx = new Proxy({}, {
    get(t, p) {
      if (p in t) return Reflect.get(t, p);
      if (p === 'measureText') return (s: unknown) => ({ width: String(s).length * 6 });
      return (...a: unknown[]) => { calls.n++; calls.by[p] = (calls.by[p] || 0) + 1; if (p === 'fill' || p === 'fillRect') calls.fills++; if (p === 'fillText') calls.texts.push(a[0]); return ctx; };
    },
    set(t, p, v) { Reflect.set(t, p, v); return true; },
  });
  return { ctx: asContext(ctx), calls };
}
function stubCanvas() {
  const { ctx, calls } = stubContext();
  return { canvas: asCanvas({ width: 1440, height: 920, getContext: () => ctx }), calls };
}

const fxSystem: FxSystem = { draw() {}, drawFlash() {} };
const fxApi: FxApi = { reduced: false, sheets: {}, glow() {}, drawBody() {} };
const shownAngle = (t: DrawTank) => (t.showA === undefined ? t.angle : t.showA);
const deps: RenderDeps = {
  fx: fxApi,
  sim: { facing, isGroundUnit, muzzle, surfY, hashSeed, mulberry32, gauss, fitField, visibleWorld, sceneryY, skyMarks },
  shownAngle,
  look: () => ({ shell: '#ffe27a', blast: ['#ffb13c', '#fff3c4'] }),
  fxBody: () => ({}),
  reducedMotion: () => false,
  random: () => 0.5,
};

const terrain = Array.from({ length: W }, (_, x) => 300 + 20 * Math.sin(x / 40));
const tank = (id: string, x: number, extra: Partial<DrawTank>): DrawTank => ({ id, isPlayer: false, x, y: terrain[x]!, angle: 50, power: 60, hp: 80, maxHp: 100, fuel: 0, color: '#ff00ff', ...extra });
const view: BattleView = deepFreeze({
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
  marks: [],
  wind: -5, textScale: 1.1,
  turnClock: { left: 2.4, myTurn: true },
  preview: null,
});
// The turn marker, the menu badge and the aim arm need the same tank objects the view lists.
const live = deepFreeze({ ...view, turnUnit: view.tanks[1]!, aim: { unit: view.tanks[2]!, length: 30 } });

{
  const { canvas, calls } = stubCanvas();
  const r = createRenderer(canvas, deps);
  let threw = '';
  try {
    r.frame(view);
    r.frame(live);
  } catch (e) { threw = String(e); }
  await test('frame-paints-a-frozen-view', () => { assert.ok(!threw && calls.n > 200 && calls.fills > 20, threw || `calls=${calls.n}`); });
  // A player who left: the bot driving the unit is tagged, and only that unit.
  await test('bot-unit-is-tagged', () => { assert.ok(calls.texts.includes('BOT') && calls.texts.filter(t => t === 'BOT').length === 2, calls.texts.join(',')); });
}

{
  // Tracer marks: a line is a dashed path ending in its cross; smoke is puffs
  // along the path, drifting with the wind as it ages.
  const pts = [100, 300, 160, 250, 220, 230, 280, 250, 340, 300];
  const marks: Mark[] = [{ by: 0, wkey: 'tracer', kind: 'line', pts, landed: true, age: 1 }, { by: 1, wkey: 'smoke', kind: 'smoke', pts, landed: true, age: 6 }];
  const none = stubCanvas(), lines = stubCanvas();
  createRenderer(none.canvas, deps).frame(view);
  createRenderer(lines.canvas, deps).frame(deepFreeze({ ...view, marks }));
  await test('marks-draw-a-dashed-line', () => { assert.ok((lines.calls.by.setLineDash || 0) >= 2 && !none.calls.by.setLineDash, JSON.stringify(lines.calls.by.setLineDash)); });
  await test('marks-draw-smoke-puffs', () => { assert.ok((lines.calls.by.arc || 0) >= (none.calls.by.arc || 0) + 5, `${lines.calls.by.arc} vs ${none.calls.by.arc}`); });
  // A round crowded with long smoke trails draws at most SMOKE_PUFFS_MAX puffs (two fills each) a frame.
  const long: number[] = []; for (let x = 0; x <= 1400; x += 7) long.push(x, 200 + 60 * Math.sin(x / 90));
  const crowd = Array.from({ length: 30 }, (_, i): Mark => ({ by: i, wkey: 'smoke', kind: 'smoke', pts: long, landed: true, age: 1 + i }));
  const busy = stubCanvas();
  createRenderer(busy.canvas, deps).frame(deepFreeze({ ...view, marks: crowd }));
  await test('marks-smoke-is-capped-per-frame', () => { assert.ok((busy.calls.by.arc || 0) - (none.calls.by.arc || 0) <= 2 * SMOKE_PUFFS_MAX + 2 && Number(busy.calls.by.arc) > Number(none.calls.by.arc) + 400, `${busy.calls.by.arc} arcs`); });
}

{
  // The preview paints on its own canvas, from a frozen snapshot too.
  const main = stubCanvas(), small = stubCanvas();
  // No sy or ty: the shooter and dummy heights were added to PreviewView after this fixture, which only counts the calls.
  const partial: Omit<PreviewView, 'sy' | 'ty'> = {
    canvas: small.canvas, width: 360, height: 200, terr: Array.from({ length: 360 }, () => 150),
    sx: 44, tx: 296, angle: 60, foeHp: 30, foeHpMax: 60, wkey: 'shell', wind: 3,
    booms: [], shells: [{ x: 100, y: 100, vx: 1, vy: 1, wkey: 'shell' }], fx: fxSystem, result: 'Clean miss.', resultT: 1,
    trace: { kind: 'line', pts: [50, 140, 90, 100, 130, 120], landed: true, age: 0.5 },
  };
  const pv = deepFreeze(partial as PreviewView);
  let threw = '';
  try { createRenderer(main.canvas, deps).frame(deepFreeze({ ...view, preview: pv })); } catch (e) { threw = String(e); }
  await test('preview-paints-its-own-canvas', () => { assert.ok(!threw && small.calls.n > 30 && main.calls.n > 200, threw || `small=${small.calls.n}`); });
}

{
  // No 2D context (an old browser, a lost canvas): a frame is a quiet no-op.
  const r = createRenderer(asCanvas({ width: 720, height: 460, getContext: () => null }), deps);
  let threw = '';
  try { r.frame(view); } catch (e) { threw = String(e); }
  await test('no-context-is-a-no-op', () => { assert.ok(!threw, threw); });
}

{
  // The unit picker draws each body with the same painter the battlefield uses.
  const { ctx, calls } = stubContext();
  for (const body of ['tank', 'hover', 'walker', 'buggy']) drawChassis(ctx, body, '#d7a800', 0, false);
  await test('chassis-painter-draws-every-body', () => { assert.ok(calls.n > 40, `calls=${calls.n}`); });
}

// A new match key redraws the sky; the same key reuses it (no second build).
{
  let builds = 0;
  const counting: RenderDeps = { ...deps, sim: { ...deps.sim, hashSeed: s => { builds++; return hashSeed(s); } } };
  const { canvas } = stubCanvas();
  const r = createRenderer(canvas, counting);
  r.frame(view); r.frame(view);
  r.frame(deepFreeze({ ...view, skyKey: 'another-seed' }));
  await test('sky-builds-once-per-match-key', () => { assert.ok(builds === 2, `builds=${builds}`); });
}

/* A context that keeps the path and style of each fill: [style, alpha, xs, ys] per fill,
   [style, x, y, w, h] per fillRect, and each ellipse's centre with the alpha it is drawn at. */
/** A gradient as tracingContext makes it. */
interface Gradient { gradient: true; addColorStop(): void }
type Style = string | Gradient;
interface Trace {
  fills: [Style, number, number[], number[]][];
  rects: [Style, number, number, number, number][];
  ellipses: [number, number, number][];
}
function tracingContext() {
  const t: Trace = { fills: [], rects: [], ellipses: [] };
  let xs: number[] = [], ys: number[] = [];
  const state: { globalAlpha: number; fillStyle: Style } = { globalAlpha: 1, fillStyle: '#000' };
  const ctx = new Proxy(state, {
    get(o, p) {
      if (p in o) return Reflect.get(o, p);
      if (p === 'measureText') return (s: unknown) => ({ width: String(s).length * 6 });
      if (p === 'beginPath') return () => { xs = []; ys = []; };
      if (p === 'moveTo' || p === 'lineTo') return (x: number, y: number) => { xs.push(x); ys.push(y); };
      if (p === 'ellipse') return (x: number, y: number) => { t.ellipses.push([x, y, o.globalAlpha]); };
      if (p === 'fill') return () => { t.fills.push([o.fillStyle, o.globalAlpha, xs, ys]); };
      if (p === 'fillRect') return (x: number, y: number, w: number, h: number) => { t.rects.push([o.fillStyle, x, y, w, h]); };
      if (p === 'createLinearGradient' || p === 'createRadialGradient') return () => ({ gradient: true, addColorStop() {} });
      return () => ctx;
    },
    set(o, p, v) { Reflect.set(o, p, v); return true; },
  });
  return { ctx: asContext(ctx), t };
}
const frameAt = (cam: BattleView['cam'], extra: Partial<BattleView> = {}) => {
  const { ctx, t } = tracingContext();
  createRenderer(asCanvas({ width: 1440, height: 920, getContext: () => ctx }), deps).frame(deepFreeze({ ...view, cam, ...extra }));
  return t;
};
const camAt = (z: number) => ({ z, cx: W / 2, cy: H + 8 - H / 2 / z });

// The scenery runs under the field's edge columns (no hairline seam where the two meet).
{
  const t = frameAt(camAt(0.5));
  const scenery = t.fills.filter(f => typeof f[0] !== 'string' && f[0].gradient && f[2].length > 3);
  const left = scenery.find(f => Math.min(...f[2]) < 0), right = scenery.find(f => Math.max(...f[2]) > W);
  await test('scenery-overlaps-the-field-edges', () => { assert.ok(left && right && Math.max(...left[2]) >= 2 && Math.min(...right[2]) <= W - 3, `left to ${left && Math.max(...left[2])}, right from ${right && Math.min(...right[2])}`); });
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
    await test('dirt-covers-the-shake-at-z-' + z, () => { assert.ok(dirt && dirt[1] <= x0 - slack && dirt[1] + dirt[3] >= x1 + slack && dirt[2] + dirt[4] >= y1 + slack, JSON.stringify(dirt)); });
  }
}

// The high cloud layer is part of the world and fades in with the zoom: no pop, no slide.
{
  const cl = view.clouds[0]!;
  let last: number | null = null, worst = 0;
  const ys = new Set<number>();
  for (let z = 1; z >= 0.35; z -= 0.01) {
    const high = frameAt(camAt(z)).ellipses.filter(e => e[1] < cl.y - 100);
    const a = high.length ? Math.max(...high.map(e => e[2])) : 0;
    for (const e of high) ys.add(Math.round(e[1]));
    if (last !== null) worst = Math.max(worst, Math.abs(a - last));
    last = a;
  }
  await test('high-clouds-fade-in-with-the-zoom', () => { assert.ok(last !== null); assert.ok(worst <= 0.08 && last > 0.3, `largest alpha step ${worst.toFixed(3)}, at the floor ${last}`); });
  await test('high-clouds-stay-put-in-the-world', () => { assert.ok(ys.size <= 2, [...ys].join(',')); });
}

{
  // The parachute sheet: the opening frames once, then the sway frames on a loop.
  const seq = Array.from({ length: 40 }, (_, i) => chuteFrame(i / 12, 16));
  await test('chute-opens-once-then-sways', () => { assert.ok(seq.slice(0, CHUTE_OPEN).join() === '0,1,2,3,4,5'
    && seq.slice(CHUTE_OPEN, CHUTE_OPEN + 10).join() === '6,7,8,9,10,11,12,13,14,15'
    && seq[CHUTE_OPEN + 10] === 6 && seq.every(f => f >= 0 && f < 16), seq.join()); });
}

{
  // A unit under an open parachute: the sheet when it has loaded, the drawn canopy until then.
  const chuteView = deepFreeze({ ...view, tanks: [tank('wraith', 400, { chuteOpen: true, drawY: 250 }), tank('tank', 100, { isPlayer: true, chuteOpen: true }), tank('spotter', 500, { chute: true, chuteArmed: true })] });
  const drawn: unknown[][] = [];
  const sheetCtx = () => {
    const { ctx, calls } = stubContext();
    return { ctx: new Proxy(ctx, { get: (t, p) => (p === 'drawImage' ? (...a: unknown[]) => { drawn.push(a); } : Reflect.get(t, p)) }), calls };
  };
  const loaded: SpriteSheet = { img: asImage({ tag: 'parachute' }), fw: 64, fh: 64, cols: 4, frames: 16, ready: true };
  const a = sheetCtx();
  createRenderer(asCanvas({ width: 1440, height: 920, getContext: () => a.ctx }), { ...deps, fx: { ...fxApi, sheets: { parachute: loaded } } }).frame(chuteView);
  await test('chute-draws-from-the-sheet', () => { assert.ok(drawn.filter(d => d[0] === loaded.img).length === 2, String(drawn.length)); });
  drawn.length = 0;
  const b = sheetCtx();
  let threw = '';
  try {
    createRenderer(asCanvas({ width: 1440, height: 920, getContext: () => b.ctx }), { ...deps, fx: { ...fxApi, sheets: { parachute: { ...loaded, ready: false } } } }).frame(chuteView);
  } catch (e) { threw = String(e); }
  await test('chute-falls-back-to-a-drawn-canopy', () => { assert.ok(!threw && drawn.filter(d => d[0] === loaded.img).length === 0 && b.calls.n > a.calls.n, threw || `${b.calls.n} vs ${a.calls.n}`); });
}

{
  // Units are drawn at their drawn height while they fall, not the rules' height, and
  // a wreck that is still falling is drawn whole until it lands.
  const labels: [unknown, number][] = [];
  const { ctx } = stubContext();
  const rec = new Proxy(ctx, { get: (t, p) => (p === 'fillText' ? (txt: unknown, x: number, y: number) => { labels.push([txt, y]); } : Reflect.get(t, p)) });
  const falling = deepFreeze({ ...view, tanks: [tank('tank', 100, { isPlayer: true, drawY: 200 }), tank('wraith', 400, { hp: 0, shownHp: 20, drawY: 150 })] });
  createRenderer(asCanvas({ width: 1440, height: 920, getContext: () => rec }), deps).frame(falling);
  const at = (name: string) => (labels.find(l => l[0] === name) || [])[1];
  await test('a falling unit is drawn at its drawn height', () => { assert.ok(at('TANK') === 200 - 38, String(at('TANK'))); });
  await test('a wreck in mid-fall is drawn whole until it lands', () => { assert.ok(at('WRAITH') === 150 - 56, String(at('WRAITH'))); });
}

{
  // A ground unit under the dirt is drawn faint inside a dashed outline; a
  // drone at the same depth (it rides the ground, so never) and a unit on its
  // ground draw no outline.
  const deep = Array.from(terrain);
  for (let x = 230; x <= 270; x++) deep[x] = terrain[x]! - 30;
  const dug = deepFreeze({ ...view, terrain: deep, marks: [] });
  const plain = stubCanvas(), buried = stubCanvas();
  createRenderer(plain.canvas, deps).frame(view);
  createRenderer(buried.canvas, deps).frame(dug);
  await test('a buried unit is drawn in a dashed outline', () => { assert.ok((buried.calls.by.roundRect || 0) > (plain.calls.by.roundRect || 0)
    && (buried.calls.by.setLineDash || 0) > (plain.calls.by.setLineDash || 0), JSON.stringify([plain.calls.by.setLineDash, buried.calls.by.setLineDash])); });
}

{
  // Burning pools: the liquid and its glow under the units, then the heat
  // shimmer and the flames over them. Reduced motion holds the flames still
  // and leaves the shimmer out; Screen flashes off leaves out the additive glow.
  const pool: DrawPool = { wkey: 'napalm', x0: 300, x1: 380, level: 290, flame: 18, heat: 1, t: 1 };
  function poolCanvas() {
    const { ctx, calls } = stubContext();
    const sets: [string | symbol, unknown][] = [];
    const rec = new Proxy(ctx, {
      get: (t, p) => (p === 'getTransform' ? () => ({ a: 2, b: 0, c: 0, d: 2, e: 10, f: 20 }) : Reflect.get(t, p)),
      set: (t, p, v) => { sets.push([p, v]); Reflect.set(t, p, v); return true; },
    });
    return { canvas: asCanvas({ width: 1440, height: 920, getContext: () => rec }), calls, sets };
  }
  const draw = (over: Partial<RenderDeps> = {}, fx: FxApi = fxApi) => {
    const s = poolCanvas();
    createRenderer(s.canvas, { ...deps, fx, ...over }).frame(deepFreeze({ ...view, fires: [pool] }));
    return s;
  };
  const none = stubCanvas();
  createRenderer(none.canvas, deps).frame(deepFreeze({ ...view, fires: [] }));
  const lit = draw();
  await test('pools-draw-liquid-and-flames', () => { assert.ok((lit.calls.by.quadraticCurveTo || 0) >= 20 && lit.calls.fills > none.calls.fills + 10, JSON.stringify(lit.calls.by.quadraticCurveTo)); });
  await test('pools-shimmer-the-air-over-them', () => { assert.ok((lit.calls.by.drawImage || 0) >= 8, String(lit.calls.by.drawImage)); });
  await test('pools-glow-additively', () => { assert.ok(lit.sets.some(([p, v]) => p === 'globalCompositeOperation' && v === 'lighter')); });
  const calm = draw({ reducedMotion: () => true });
  await test('pools-hold-still-under-reduced-motion', () => { assert.ok(!(Number(calm.calls.by.drawImage) > 0), String(calm.calls.by.drawImage)); });
  const t2 = poolCanvas(), t3 = poolCanvas();
  createRenderer(t2.canvas, { ...deps, reducedMotion: () => true }).frame(deepFreeze({ ...view, time: 1, fires: [pool] }));
  createRenderer(t3.canvas, { ...deps, reducedMotion: () => true }).frame(deepFreeze({ ...view, time: 2.37, fires: [pool] }));
  await test('pools-flames-do-not-flicker-under-reduced-motion', () => { assert.ok(JSON.stringify(t2.calls.by) === JSON.stringify(t3.calls.by)); });
  const dim = draw({}, { ...fxApi, flashes: false });
  await test('pools-no-additive-glow-with-flashes-off', () => { assert.ok(!dim.sets.some(([p, v]) => p === 'globalCompositeOperation' && v === 'lighter')); });
  const out = draw();
  await test('pools-a-dead-pool-draws-nothing', () => { assert.ok((() => { const s = poolCanvas(); createRenderer(s.canvas, deps).frame(deepFreeze({ ...view, fires: [{ ...pool, heat: 0, t: 9 }] })); return s.calls.fills <= none.calls.fills + 1; })() && out.calls.n > 0); });
}

{
  // The shimmer never reads outside the canvas: a pool at the field's left edge, the camera pushed left.
  const { ctx } = stubContext();
  const reads: unknown[][] = [];
  const rec = new Proxy(ctx, {
    get: (t, p) => (p === 'getTransform' ? () => ({ a: 2, b: 0, c: 0, d: 2, e: -60, f: 20 })
      : p === 'drawImage' ? (...a: unknown[]) => { reads.push(a); return rec; } : Reflect.get(t, p)),
    set: (t, p, v) => { Reflect.set(t, p, v); return true; },
  });
  const canvas = asCanvas({ width: 1440, height: 920, getContext: () => rec });
  createRenderer(canvas, deps).frame(deepFreeze({ ...view, fires: [{ wkey: 'napalm', x0: 0, x1: 60, level: 290, flame: 18, heat: 1, t: 1 }] }));
  const own = reads.filter(a => a[0] === canvas);
  await test('pools-shimmer-reads-inside-the-canvas', () => { assert.ok(own.length > 0 && own.every(a => Number(a[1]) >= 0 && Number(a[1]) + Number(a[3]) <= canvas.width && Number(a[2]) >= 0 && Number(a[2]) + Number(a[4]) <= canvas.height), JSON.stringify(own.slice(0, 3))); });
}
