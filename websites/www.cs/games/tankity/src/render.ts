/* Operation Tankity: the battlefield, drawn.
 *
 * Everything that paints the 2D canvas: the night sky and its moon, clouds,
 * hills, the units (tank bodies, drones, name tags, turn marker, menu badge),
 * the aim arm, blast discs, shells, particles, wind streaks and gauge, the
 * turn clock, and the firing-range preview. game.js builds a BattleView each
 * frame and calls `frame(view)`; this module reads it and paints, and never
 * changes game state. Anything that advances (a boom's age, the shake decay,
 * a unit's last x) is stepped by game.js before the frame is built.
 *
 * It reaches the page only through its canvases and the RenderDeps it is
 * built with: the effects engine (a typed slice of window.TankityFX), the sim
 * helpers it shares with game.js, the page's reduced-motion setting and its
 * random numbers. Like the other modules it imports nothing at run time (the
 * ?v= lives on game.js's imports), so the sim helpers arrive as dependencies. */
import type { Cloud, Rng, Tank } from './sim.js';

/* ---------- what game.js hands over ---------- */

/** A tank as drawn: the sim's Tank plus the look and the aim the page keeps on it. */
export interface DrawTank extends Tank {
  maxHp: number;
  color?: string;
  name?: string;
  body?: string; // 'tank' | 'hover' | 'walker' | 'buggy'
  menu?: boolean; // a room player who is in a menu
  bot?: boolean; // a room player who left: a bot drives the unit now
  showA?: number; // eased angle a rival's barrel glides to
  moving?: boolean; // moved since the last frame (walker legs, buggy wheels)
}

/** Anything that flies as a shell: its place, its velocity and what it is. */
export interface Flying { x: number; y: number; vx: number; vy: number; wkey: string }

/** A blast disc growing and fading over `life` seconds, `t` in. */
export interface Boom { x: number; y: number; r: number; wkey: string; t: number; life: number }

/** A spark of debris. */
export interface Spark { x: number; y: number; life: number; color: string }

/** The slice of an effects system (fx.js createSystem) the battlefield draws with. */
export interface FxSystem {
  draw(c: CanvasRenderingContext2D): void;
  drawFlash(c: CanvasRenderingContext2D, w: number, h: number): void;
}

/** A sprite sheet fx.js loads (the moon's phases). */
export interface SpriteSheet {
  img: CanvasImageSource;
  fw: number;
  fh: number;
  cols: number;
  frames: number;
  ready: boolean;
}

/** The slice of window.TankityFX this module calls. */
export interface FxApi {
  reduced: boolean;
  sheets: { moon?: SpriteSheet };
  glow(c: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, alpha: number): void;
  drawBody(c: CanvasRenderingContext2D, x: number, y: number, vx: number, vy: number,
    body: unknown, color: string, time: number): void;
}

/** A weapon's paint job as the battlefield reads it. */
export interface Look { shell?: string; blast?: readonly string[] }

/** The aim arm to draw: the unit whose turn it is, and the arm's length in world units. */
export interface AimArm { unit: DrawTank; length: number }

/** The firing range, drawn on its own small canvas. */
export interface PreviewView {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  terr: readonly number[];
  sx: number; // shooter and target columns
  tx: number;
  angle: number;
  foeHp: number;
  foeHpMax: number;
  wkey: string;
  wind: number;
  booms: readonly Boom[];
  shells: readonly Flying[];
  fx: FxSystem | null;
  result: string;
  resultT: number;
}

/** Everything a frame shows. Read-only: render.ts never writes to it. */
export interface BattleView {
  time: number;
  shake: number; // seconds of screen shake left
  cam: { readonly z: number; readonly cx: number; readonly cy: number };
  skyKey: string; // the match key the stars are drawn from
  terrain: readonly number[];
  clouds: readonly Cloud[];
  tanks: readonly DrawTank[];
  turnUnit: DrawTank | null; // whose turn marker shows
  online: boolean; // a room match (shows the menu badge)
  aim: AimArm | null;
  booms: readonly Boom[];
  fx: FxSystem | null;
  shells: readonly Flying[];
  replay: readonly Flying[]; // shells of a room replay, at their place now
  sparks: readonly Spark[];
  wind: number;
  windGauge: boolean; // the gauge shows (a match is on, not the shop)
  windTop: number | undefined; // the gauge's top in world units, under the menu strip
  textScale: number;
  turnClock: { left: number; myTurn: boolean } | null; // the on-canvas count-down, when it shows
  preview: PreviewView | null;
}

/** The sim helpers the battlefield shares with game.js. */
export interface RenderSim {
  facing(t: Tank): number;
  isGroundUnit(t: Tank): boolean;
  muzzle(t: Tank): { x: number; y: number };
  surfY(terrain: readonly number[], x: number): number;
  hashSeed(str: string): number;
  mulberry32(seed: number): Rng;
  gauss(rng: Rng): number;
}

/** What createRenderer needs from its host. */
export interface RenderDeps {
  fx: FxApi | null;
  size: { w: number; h: number }; // the world, in world units
  sim: RenderSim;
  shownAngle(t: DrawTank): number;
  look(wkey: string): Look;
  fxBody(wkey: string): unknown; // the effect set's shell body, handed back to fx.drawBody
  reducedMotion(): boolean;
  random(): number;
}

export interface Renderer {
  /** Paints one frame of the battlefield (and the firing range, if open). */
  frame(view: BattleView): void;
}

/* ---------- painters with no environment ---------- */

/** A #rrggbb colour with every channel scaled by k. */
export function shade(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number): number => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${ch(n >> 16)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
}

/** A ground unit's chassis about its own origin (also the unit picker's drawing). */
export function drawChassis(c: CanvasRenderingContext2D, body: string, hull: string, time: number, moving: boolean): void {
  c.strokeStyle = '#000000';
  c.lineWidth = 1.5;
  if (body === 'hover') {
    // Air skirt with a flickering cushion under a low wedge hull.
    c.fillStyle = Math.floor(time * 12) % 2 ? 'rgba(111,195,255,0.55)' : 'rgba(111,195,255,0.3)';
    c.beginPath();
    c.ellipse(0, 1, 19, 3.5, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#1b1d26';
    c.beginPath();
    c.roundRect(-18, -4, 36, 5, 2.5);
    c.fill();
    c.fillStyle = hull;
    c.beginPath();
    c.moveTo(-16, -4);
    c.lineTo(16, -4);
    c.lineTo(11, -14);
    c.lineTo(-11, -14);
    c.closePath();
    c.fill();
    c.stroke();
    return;
  }
  if (body === 'walker') {
    // Two jointed legs that shuffle while the walker drives.
    const step = moving ? Math.sin(time * 14) * 3 : 0;
    c.strokeStyle = '#101208';
    c.lineWidth = 3;
    for (const [hx, ph] of [[-7, 1], [7, -1]] as const) {
      c.beginPath();
      c.moveTo(hx, -8);
      c.lineTo(hx + 4 + step * ph, -3);
      c.lineTo(hx + step * ph, 2);
      c.stroke();
      c.fillStyle = '#101208';
      c.fillRect(hx - 3 + step * ph, 1, 7, 2.5);
    }
    c.strokeStyle = '#000000';
    c.lineWidth = 1.5;
    c.fillStyle = hull;
    c.beginPath();
    c.roundRect(-12, -17, 24, 11, 4);
    c.fill();
    c.stroke();
    return;
  }
  if (body === 'buggy') {
    // Two big spoked wheels under an open frame.
    const spin = moving ? time * 10 : 0;
    for (const wx of [-11, 11]) {
      c.fillStyle = '#101208';
      c.beginPath();
      c.arc(wx, -1, 6, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#5a5f48';
      c.lineWidth = 1.2;
      for (let k = 0; k < 3; k++) {
        const a = spin + k * Math.PI / 3;
        c.beginPath();
        c.moveTo(wx - Math.cos(a) * 5, -1 - Math.sin(a) * 5);
        c.lineTo(wx + Math.cos(a) * 5, -1 + Math.sin(a) * 5);
        c.stroke();
      }
    }
    c.strokeStyle = '#000000';
    c.lineWidth = 1.5;
    c.fillStyle = hull;
    c.beginPath();
    c.moveTo(-17, -6);
    c.lineTo(17, -6);
    c.lineTo(13, -13);
    c.lineTo(-9, -13);
    c.closePath();
    c.fill();
    c.stroke();
    return;
  }
  // Tank: treads with road wheels, flat black, under a rounded hull.
  c.fillStyle = '#101208';
  c.beginPath();
  c.roundRect(-18, -3, 36, 7, 3.5);
  c.fill();
  for (let i = -12; i <= 12; i += 8) {
    c.fillStyle = '#3a3f2a';
    c.beginPath();
    c.arc(i, 0.5, 2.8, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#000000';
    c.beginPath();
    c.arc(i, 0.5, 1.2, 0, Math.PI * 2);
    c.fill();
  }
  c.fillStyle = hull;
  c.beginPath();
  c.roundRect(-15, -15, 30, 13, 5);
  c.fill();
  c.stroke();
  c.fillStyle = shade(hull.startsWith('#') ? hull : '#d7a800', 0.64);
  c.beginPath();
  c.ellipse(-6, -9, 6, 3, 0.4, 0, Math.PI * 2);
  c.fill();
}

/** A ground unit about its feet: shadow, chassis, turret barrel at `angle` degrees
 *  on the `face` side (+1 right, -1 left), antenna on the other. */
function drawGroundUnit(c: CanvasRenderingContext2D, t: DrawTank, time: number, angle: number, face: number): void {
  const hull = t.isPlayer ? '#d7a800' : shade(t.color || '#c9c9c9', 0.85);
  c.save();
  c.translate(t.x, t.y);
  c.fillStyle = 'rgba(0,0,0,0.3)';
  c.beginPath();
  c.ellipse(0, 3, 20, 5, 0, 0, Math.PI * 2);
  c.fill();
  drawChassis(c, t.body || 'tank', hull, time, !!t.moving);
  // Turret on the shared pivot, barrel to the shown angle on the facing side.
  const rad = angle * Math.PI / 180;
  const bx = Math.cos(rad) * 26 * face, by = -Math.sin(rad) * 26;
  c.strokeStyle = '#1a1a00';
  c.lineWidth = 5;
  c.beginPath();
  c.moveTo(0, -12);
  c.lineTo(bx, -12 + by);
  c.stroke();
  c.fillStyle = hull;
  c.beginPath();
  c.arc(0, -12, 8, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = '#000000';
  c.lineWidth = 1.5;
  c.stroke();
  // Antenna with blinking tip, on the side away from the barrel.
  c.beginPath();
  c.moveTo(-8 * face, -16);
  c.lineTo(-12 * face, -26);
  c.stroke();
  c.fillStyle = Math.floor(time * 3) % 2 === 0 ? '#ff5a5a' : '#7a2020';
  c.beginPath();
  c.arc(-12 * face, -26, 1.8, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

/** How far a drone bobs from its rest height at `time`. */
function droneHover(t: DrawTank, time: number): number {
  return Math.sin(time * 2.2 + t.x) * 3;
}

/** Tip of a drone's slung barrel, from a body centre at (x, y). */
function droneBarrelTip(angle: number, face: number, x: number, y: number): { x: number; y: number; rad: number; s: number } {
  const rad = angle * Math.PI / 180;
  return { x: x + Math.cos(rad) * 22 * face, y: y + 4 - Math.sin(rad) * 22, rad, s: face };
}

/** Wraith: a domed disc with chasing rim lights. Drawn about the drone's
 *  body centre, which the caller has translated to. */
function drawSaucer(c: CanvasRenderingContext2D, t: DrawTank, time: number): void {
  c.fillStyle = '#2b2e36';
  c.beginPath();
  c.ellipse(0, 1, 15, 4.5, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = t.color ?? '';
  c.lineWidth = 1.5;
  c.stroke();
  c.fillStyle = 'rgba(160,240,255,0.55)';
  c.beginPath();
  c.ellipse(0, -2, 7, 5, 0, Math.PI, 0);
  c.fill();
  for (let k = 0; k < 6; k++) {
    const a = time * 3 + k * Math.PI / 3;
    if (Math.sin(a) < 0) continue; // only the near side of the rim shows
    c.fillStyle = k % 2 ? (t.color ?? '') : '#ffffff';
    c.beginPath();
    c.arc(Math.cos(a) * 13, 1 + Math.sin(a) * 2.5, 1.2, 0, Math.PI * 2);
    c.fill();
  }
}

function drawGunDrone(c: CanvasRenderingContext2D, t: DrawTank, time: number, angle: number, face: number): void {
  const hover = droneHover(t, time);
  const y = t.y - 30 + hover;
  c.save();
  c.translate(t.x, y);
  c.fillStyle = 'rgba(0,0,0,0.25)';
  c.beginPath();
  c.ellipse(0, 34 - hover, 14, 4, 0, 0, Math.PI * 2);
  c.fill();
  // Aiming barrel slung below, tracking its own angle.
  const tip = droneBarrelTip(angle, face, 0, 0);
  c.strokeStyle = '#0a0a0c';
  c.lineWidth = 4;
  c.beginPath();
  c.moveTo(0, 4);
  c.lineTo(tip.x, tip.y);
  c.stroke();
  // Each battery drone has its own frame: Wraith a saucer, Spotter a
  // tri-rotor with a big eye, everyone else the classic quad.
  if (t.id === 'wraith') {
    drawSaucer(c, t, time);
    c.restore();
    return;
  }
  const arms = t.id === 'spotter' ? [[0, -1.25], [-1.1, 0.8], [1.1, 0.8]] : [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  let i = 0;
  for (const [sx = 0, sy = 0] of arms) {
    c.strokeStyle = '#2b2e36';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(sx * 11, sy * 8);
    c.stroke();
    c.save();
    c.translate(sx * 11, sy * 8);
    c.rotate(time * 26 + i * 1.7);
    c.fillStyle = 'rgba(225,232,245,0.4)';
    c.beginPath();
    c.ellipse(0, 0, 8, 2, 0, 0, Math.PI * 2);
    c.fill();
    c.restore();
    i++;
  }
  // Armoured body with ID colour + camera eye.
  c.fillStyle = '#24242e';
  c.beginPath();
  c.roundRect(-8, -6, 16, 12, 5);
  c.fill();
  c.strokeStyle = t.color ?? '';
  c.lineWidth = 2;
  c.beginPath();
  c.roundRect(-8, -6, 16, 12, 5);
  c.stroke();
  c.fillStyle = '#ffffff';
  c.beginPath();
  c.arc(0, 0, t.id === 'spotter' ? 4 : 2.6, 0, Math.PI * 2);
  c.fill();
  if (t.id === 'spotter') {
    c.fillStyle = t.color ?? '';
    c.beginPath();
    c.arc(Math.cos(time * 1.3) * 1.5, 0, 1.8, 0, Math.PI * 2);
    c.fill();
  }
  // Blinking strobe.
  if (Math.floor(time * 2 + t.x) % 2 === 0) {
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.arc(0, -8, 1.6, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

/** A small "in a menu" card beside a player whose turn it is, so the others
 *  know why the battle is waiting. */
function drawMenuBadge(c: CanvasRenderingContext2D, t: DrawTank, time: number, ground: boolean): void {
  const x = t.x + 24, y = t.y - (ground ? 40 : 58) - 2 * Math.abs(Math.sin(time * 3));
  c.save();
  c.globalAlpha = 0.95;
  c.fillStyle = 'rgba(4, 4, 32, 0.92)';
  c.strokeStyle = '#ffff55';
  c.lineWidth = 1.2;
  c.beginPath();
  if (c.roundRect) c.roundRect(x, y - 10, 20, 15, 4); else c.rect(x, y - 10, 20, 15);
  c.fill();
  c.stroke();
  c.fillStyle = '#ffff55';
  for (let i = 0; i < 3; i++) c.fillRect(x + 5, y - 6 + i * 3.5, 10, 1.6);
  c.beginPath(); // the card's little tail toward the unit
  c.moveTo(x + 2, y + 5); c.lineTo(x - 3, y + 9); c.lineTo(x + 7, y + 5);
  c.fill();
  c.restore();
}

/** A pulsing glow under the unit and a bobbing chevron over its name. */
function drawTurnMarker(c: CanvasRenderingContext2D, t: DrawTank, time: number, ground: boolean): void {
  const color = t.isPlayer ? '#ffff55' : (t.color || '#ffffff');
  const pulse = 0.5 + 0.5 * Math.sin(time * 5);
  const cy = ground ? t.y + 2 : t.y - 30 + droneHover(t, time) + 6;
  c.save();
  c.globalAlpha = 0.25 + 0.35 * pulse;
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(t.x, cy, 24 + 4 * pulse, 6 + pulse, 0, 0, Math.PI * 2);
  c.fill();
  c.globalAlpha = 0.9;
  c.strokeStyle = color;
  c.lineWidth = 1.5;
  c.stroke();
  const top = t.y - (ground ? 34 : 52) - 16 - 3 * Math.abs(Math.sin(time * 4));
  c.globalAlpha = 1;
  c.fillStyle = color;
  c.beginPath();
  c.moveTo(t.x - 6, top - 6);
  c.lineTo(t.x + 6, top - 6);
  c.lineTo(t.x, top);
  c.closePath();
  c.fill();
  c.strokeStyle = '#000000';
  c.lineWidth = 1;
  c.stroke();
  c.restore();
}

/** One explosion: the disc its weapon destroys, growing and fading. */
function drawBoom(c: CanvasRenderingContext2D, bm: Boom, look: Look): void {
  const p = Math.min(1, bm.t / bm.life);
  const rr = Math.max(0.1, bm.r * (1 - Math.pow(1 - p, 3)));
  const blast = look.blast || [];
  c.globalAlpha = 0.4 * (1 - p);
  c.fillStyle = blast[0] || '#ffb13c';
  c.beginPath();
  c.arc(bm.x, bm.y, rr, 0, Math.PI * 2);
  c.fill();
  c.globalAlpha = 0.9 * (1 - p);
  c.strokeStyle = blast[1] || '#fff3c4';
  c.lineWidth = 2;
  c.beginPath();
  c.arc(bm.x, bm.y, rr, 0, Math.PI * 2);
  c.stroke();
  c.globalAlpha = 0.8 * (1 - p);
  c.fillStyle = '#fff';
  c.beginPath();
  c.arc(bm.x, bm.y, Math.max(0.1, rr * 0.35), 0, Math.PI * 2);
  c.fill();
  c.globalAlpha = 1;
}

/* ---------- the night sky ---------- */
/* Every match has its own sky, drawn from the match key (the solo seed, or
   the room code) through a generator of its own, so it never touches the
   sim's random numbers and every client of a room sees the same stars. Square
   pixel stars in sizes, brightnesses and a few tints; a faint milky band and
   a few clusters; a quiet twinkle on some (none under reduced motion); and a
   moon phase from the rendered sheet (fx/sprites/moon.png). */
const SKY_TINTS = ['#ffe2b0', '#b8d0ff'];
const SKY_PHASES = [0, 0, 1, 6, 2, 5, 3, 4]; // frames of moon.png, full and gibbous favoured
interface Star { x: number; y: number; s: number; a: number; c: string; tw: number; ph: number }
interface Sky { key: string; stars: Star[]; band: { x: number; y: number; ang: number }; phase: number }

/** Wind speed at which the gauge's arrow is longest. */
const WIND_MAX = 12;

/* ---------- the renderer ---------- */

export function createRenderer(cv: HTMLCanvasElement, deps: RenderDeps): Renderer {
  const { fx: FX, sim } = deps;
  const { w: W, h: H } = deps.size;
  const SKY_X0 = -20, SKY_W = W + 40, SKY_Y0 = -20, SKY_H = 420; // the sky rides the screen, not the camera
  let sky: Sky | null = null; // drawn from view.skyKey, rebuilt when the key changes

  function buildSky(key: string): Sky {
    const r = sim.mulberry32(sim.hashSeed('sky:' + key));
    const stars: Star[] = [];
    const add = (x: number, y: number, bright: number): void => {
      const pick = r();
      const size = pick < 0.72 ? 1.2 : pick < 0.93 ? 2 : 3;
      const tint = r() < 0.22 ? (SKY_TINTS[Math.floor(r() * 2)] ?? '#ffffff') : '#ffffff';
      stars.push({ x: Math.round(x), y: Math.round(y), s: size, a: Math.min(1, bright * (size > 2 ? 1.2 : 1)), c: tint, tw: r() < 0.3 ? 0.6 + r() * 2.2 : 0, ph: r() * 6.28 });
    };
    for (let i = 0; i < 130; i++) add(SKY_X0 + r() * SKY_W, SKY_Y0 + r() * SKY_H, 0.3 + r() * 0.7);
    // The milky band: a slanted strip of faint dust, with its glow drawn behind it.
    const ang = -0.5 + r() * 1.0, cx = SKY_X0 + SKY_W * (0.3 + r() * 0.4), cy = SKY_Y0 + SKY_H * (0.25 + r() * 0.35);
    for (let i = 0; i < 130; i++) {
      const along = (r() - 0.5) * 1.3 * W, across = sim.gauss(r) * 30;
      add(cx + Math.cos(ang) * along - Math.sin(ang) * across, cy + Math.sin(ang) * along + Math.cos(ang) * across, 0.18 + r() * 0.4);
    }
    for (let k = 0; k < 3; k++) {
      const kx = SKY_X0 + r() * SKY_W, ky = SKY_Y0 + r() * SKY_H;
      for (let i = 0; i < 9; i++) add(kx + sim.gauss(r) * 16, ky + sim.gauss(r) * 12, 0.35 + r() * 0.6);
    }
    return { key, stars, band: { x: cx, y: cy, ang }, phase: SKY_PHASES[Math.floor(r() * SKY_PHASES.length)] ?? 0 };
  }

  function drawSky(c: CanvasRenderingContext2D, view: BattleView): void {
    if (!sky || sky.key !== view.skyKey) sky = buildSky(view.skyKey);
    const calm = FX && FX.reduced;
    // The band's glow: three broad, faint ellipses along its slant.
    c.fillStyle = '#7f86d8';
    for (let i = 0; i < 3; i++) {
      c.globalAlpha = 0.03;
      c.beginPath();
      c.ellipse(sky.band.x, sky.band.y, 520 - i * 120, 52 - i * 12, sky.band.ang, 0, Math.PI * 2);
      c.fill();
    }
    for (const st of sky.stars) {
      let a = st.a;
      if (st.tw && !calm) a *= 0.72 + 0.28 * Math.sin(view.time * st.tw + st.ph);
      c.globalAlpha = a;
      c.fillStyle = st.c;
      c.fillRect(st.x, st.y, st.s, st.s);
      if (st.s > 2.5) { // the brightest ones get a cross glint
        c.fillRect(st.x - 2, st.y + 1, st.s + 4, 1);
        c.fillRect(st.x + 1, st.y - 2, 1, st.s + 4);
      }
    }
    c.globalAlpha = 1;
  }

  function drawMoon(c: CanvasRenderingContext2D): void {
    const mx = 600, my = 90, mr = 32;
    const sh = FX && FX.sheets.moon;
    if (!FX || !sh || !sh.ready || !sky) {
      c.fillStyle = '#e8e8e8';
      c.beginPath();
      c.arc(mx, my, 26, 0, Math.PI * 2);
      c.fill();
      return;
    }
    FX.glow(c, mx, my, mr * 3.2, '#a8b8ff', 0.26);
    const f = sky.phase % sh.frames;
    c.drawImage(sh.img, (f % sh.cols) * sh.fw, ((f / sh.cols) | 0) * sh.fh, sh.fw, sh.fh, mx - mr, my - mr, mr * 2, mr * 2);
  }

  /* ---------- shells ---------- */
  function drawShellBody(c: CanvasRenderingContext2D, wkey: string, x: number, y: number, vx: number, vy: number, time: number): void {
    if (!FX) return;
    FX.drawBody(c, x, y, vx, vy, deps.fxBody(wkey), deps.look(wkey).shell || '#ffe27a', time);
  }

  /** A shell in flight: its glow body, a coloured ball (bigger for the big ones) and a white core. */
  function drawShell(c: CanvasRenderingContext2D, s: Flying, time: number): void {
    drawShellBody(c, s.wkey, s.x, s.y, s.vx, s.vy, time);
    c.fillStyle = deps.look(s.wkey).shell || '#ffe27a';
    c.beginPath();
    c.arc(s.x, s.y, s.wkey === 'nuke' ? 7 : s.wkey === 'mortar' ? 4.5 : 3.5, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#fff';
    c.beginPath();
    c.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
    c.fill();
  }

  /* ---------- wind ---------- */
  /* Wind lives on the battlefield, not in the status bar: faint streaks
     drift across the sky at the wind's speed, and a gauge just under the menu
     strip points the way it blows, longer the stronger it is. */
  function drawWindStreaks(c: CanvasRenderingContext2D, view: BattleView): void {
    const wind = view.wind;
    if (!wind) return;
    const speed = wind * 9;
    c.save();
    c.strokeStyle = '#cfe3ff';
    c.lineWidth = 1;
    for (let i = 0; i < 16; i++) {
      const span = W + 160;
      const x = ((((i * 97) + view.time * speed) % span) + span) % span - 80;
      const y = 40 + ((i * 53) % 190);
      const len = 10 + Math.abs(wind) * 2.2;
      c.globalAlpha = 0.06 + 0.05 * ((i % 3) / 2);
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x - Math.sign(wind) * len, y);
      c.stroke();
    }
    c.restore();
  }

  function drawWindGauge(c: CanvasRenderingContext2D, view: BattleView): void {
    if (!view.windGauge) return;
    const wind = view.wind;
    c.save();
    c.scale((cv.width || W) / W || 1, (cv.height || H) / H || 1);
    const s = view.textScale;
    const w = 128 * s, h = 22 * s, x = W / 2 - w / 2, y = view.windTop || 10;
    c.globalAlpha = 0.85;
    c.fillStyle = 'rgba(4, 4, 32, 0.8)';
    c.strokeStyle = 'rgba(85, 85, 255, 0.55)';
    c.lineWidth = 1;
    c.beginPath();
    if (c.roundRect) c.roundRect(x, y, w, h, h / 2); else c.rect(x, y, w, h);
    c.fill();
    c.stroke();
    c.globalAlpha = 1;
    c.font = `bold ${Math.round(9 * s)}px sans-serif`;
    c.textBaseline = 'middle';
    c.fillStyle = '#aaaaaa';
    c.fillText('WIND', x + 9 * s, y + h / 2);
    const mid = x + w / 2 + 6 * s, cy = y + h / 2;
    const dir = Math.sign(wind);
    if (!dir) {
      c.fillStyle = '#ffffff';
      c.textAlign = 'center';
      c.fillText('calm', mid + 8 * s, cy);
    } else {
      // Arrow length tracks strength; chevrons crawl along it with the wind.
      const len = (14 + 34 * Math.min(1, Math.abs(wind) / WIND_MAX)) * s;
      const x0 = mid - dir * len / 2, x1 = mid + dir * len / 2;
      c.strokeStyle = '#ffff55';
      c.fillStyle = '#ffff55';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(x0, cy);
      c.lineTo(x1, cy);
      c.stroke();
      c.beginPath();
      c.moveTo(x1 + dir * 5 * s, cy);
      c.lineTo(x1 - dir * 2 * s, cy - 5 * s);
      c.lineTo(x1 - dir * 2 * s, cy + 5 * s);
      c.closePath();
      c.fill();
      const step = 9 * s;
      const phase = ((view.time * Math.abs(wind) * 3) % step) * dir;
      c.globalAlpha = 0.55;
      for (let k = -1; k * step < len; k++) {
        const px = x0 + dir * k * step + phase;
        if ((px - x0) * dir < 0 || (x1 - px) * dir < 3 * s) continue;
        c.beginPath();
        c.moveTo(px - dir * 2.5 * s, cy - 3 * s);
        c.lineTo(px + dir * 0.5 * s, cy);
        c.lineTo(px - dir * 2.5 * s, cy + 3 * s);
        c.stroke();
      }
      c.globalAlpha = 1;
      c.fillStyle = '#ffffff';
      c.textAlign = 'right';
      c.fillText(String(Math.abs(wind)), x + w - 9 * s, cy);
    }
    c.textAlign = 'left';
    c.textBaseline = 'alphabetic';
    c.restore();
  }

  /* ---------- the turn clock ---------- */
  function drawTurnClock(c: CanvasRenderingContext2D, view: BattleView): void {
    const clock = view.turnClock;
    if (!clock) return;
    const n = Math.ceil(clock.left);
    const frac = clock.left - Math.floor(clock.left); // pulses once a second
    const s = view.textScale;
    c.save();
    c.scale((cv.width || W) / W || 1, (cv.height || H) / H || 1);
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.globalAlpha = 0.25 + 0.6 * frac;
    c.fillStyle = n <= 3 ? '#ff5a5a' : '#ffff55';
    c.font = `bold ${Math.round(72 * s)}px sans-serif`;
    c.fillText(String(n), W / 2, H * 0.42);
    c.globalAlpha = 0.9;
    c.font = `bold ${Math.round(12 * s)}px sans-serif`;
    c.fillStyle = '#ffffff';
    c.fillText(clock.myTurn ? 'Fire now, or the crew fires for you' : 'The crew fires if the clock runs out', W / 2, H * 0.42 + 46 * s);
    c.restore();
  }

  /* ---------- the firing range ---------- */
  function drawPreview(pv: PreviewView, time: number): void {
    const c = pv.canvas.getContext('2d');
    if (!c) return;
    const PV_W = pv.width, PV_H = pv.height;
    const terr = (x: number): number => pv.terr[x] ?? 0;
    c.fillStyle = '#00000b';
    c.fillRect(0, 0, PV_W, PV_H);
    c.fillStyle = '#e8e8e8';
    c.beginPath();
    c.arc(320, 30, 10, 0, Math.PI * 2);
    c.fill();
    // Mini terrain with a flat green rim.
    c.fillStyle = '#7a4a1e';
    c.beginPath();
    c.moveTo(0, PV_H);
    for (let x = 0; x < PV_W; x += 4) c.lineTo(x, terr(x));
    c.lineTo(PV_W, PV_H);
    c.fill();
    c.strokeStyle = '#00aa00';
    c.lineWidth = 2;
    c.beginPath();
    for (let x = 0; x < PV_W; x += 4) {
      if (x === 0) c.moveTo(x, terr(x));
      else c.lineTo(x, terr(x));
    }
    c.stroke();
    // Demo shooter + barrel at the solved angle.
    const sy = terr(pv.sx);
    c.fillStyle = '#d7a800';
    c.fillRect(pv.sx - 10, sy - 8, 20, 8);
    const rad = pv.angle * Math.PI / 180;
    c.strokeStyle = '#1a1a00';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(pv.sx, sy - 10);
    c.lineTo(pv.sx + Math.cos(rad) * 16, sy - 10 - Math.sin(rad) * 16);
    c.stroke();
    // Demo target with hp bar.
    const ty = terr(pv.tx);
    c.fillStyle = '#24242e';
    c.beginPath();
    c.arc(pv.tx, ty - 12, 7, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = '#ff0000';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(pv.tx, ty - 12, 7, 0, Math.PI * 2);
    c.stroke();
    c.fillStyle = '#ffffff';
    c.beginPath();
    c.arc(pv.tx, ty - 12, 2.5, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = 'rgba(0,0,0,0.55)';
    c.fillRect(pv.tx - 15, ty - 28, 30, 4);
    c.fillStyle = '#00aa00';
    c.fillRect(pv.tx - 14, ty - 27, 28 * (pv.foeHp / pv.foeHpMax), 2);
    // Shells + debris.
    for (const bm of pv.booms) drawBoom(c, bm, deps.look(bm.wkey));
    if (pv.fx) pv.fx.draw(c);
    for (const s of pv.shells) {
      drawShellBody(c, pv.wkey, s.x, s.y, s.vx, s.vy, time);
      c.fillStyle = deps.look(pv.wkey).shell || '#ffe27a';
      c.beginPath();
      c.arc(s.x, s.y, 3, 0, Math.PI * 2);
      c.fill();
    }
    if (pv.fx) pv.fx.drawFlash(c, PV_W, PV_H);
    // Wind readout + last-shot verdict.
    c.fillStyle = '#fff';
    c.font = 'bold 10px sans-serif';
    c.fillText(`wind → ${pv.wind}`, PV_W - 62, 14);
    if (pv.resultT > 0) {
      c.font = 'bold 12px sans-serif';
      c.fillStyle = 'rgba(8,10,6,0.85)';
      c.fillRect(30, PV_H - 26, PV_W - 60, 18);
      c.fillStyle = '#ffff00';
      c.fillText(pv.result, 38, PV_H - 13);
    }
  }

  /* ---------- the frame ---------- */
  function frame(view: BattleView): void {
    const c = cv.getContext('2d');
    if (!c) return;
    const time = view.time;
    const terrain = (x: number): number => view.terrain[x] ?? 0;
    c.save();
    // The backing store outgrew the 720x460 world for a bigger, crisper
    // viewport; every world unit below rides this scale, sim untouched.
    c.scale((cv.width || W) / W || 1, (cv.height || H) / H || 1);
    if (view.shake > 0 && !deps.reducedMotion()) {
      c.translate((deps.random() - 0.5) * 8 * view.shake, (deps.random() - 0.5) * 8 * view.shake);
    }
    // Night sky, painted well past the world edge so a pulled-back camera never
    // reveals unpainted void at the sides or in the extra headroom above.
    c.fillStyle = '#00000b';
    c.fillRect(-W - 10, -2 * H - 10, 3 * W + 20, 3 * H + 20);
    drawSky(c, view);
    // Dirt base under the extended sky, so the ground reads as one continuous
    // hillside even past the world edge.
    c.fillStyle = '#2e1a08';
    c.fillRect(-W - 10, H - 2, 3 * W + 20, 2 * H + 12);
    // Moon (a rendered sphere, phase chosen per match) + dark drifting clouds.
    drawMoon(c);
    // Slow camera: everything below rides the zoom so every tank stays seen.
    c.translate(W / 2, H / 2);
    c.scale(view.cam.z, view.cam.z);
    c.translate(-view.cam.cx, -view.cam.cy);
    c.fillStyle = '#23233f';
    for (const cl of view.clouds) {
      c.beginPath();
      c.ellipse(cl.x, cl.y, 30 * cl.s, 10 * cl.s, 0, 0, Math.PI * 2);
      c.ellipse(cl.x + 22 * cl.s, cl.y + 3, 20 * cl.s, 8 * cl.s, 0, 0, Math.PI * 2);
      c.fill();
    }
    // Far dunes.
    c.fillStyle = '#3a2408';
    c.beginPath();
    c.moveTo(-10, H);
    for (let x = -10; x <= W + 10; x += 24) {
      c.lineTo(x, 396 - 18 * Math.sin(x / 190 + 2));
    }
    c.lineTo(W + 10, H);
    c.fill();
    // Terrain with a flat green rim.
    c.fillStyle = '#7a4a1e';
    c.beginPath();
    c.moveTo(-10, H + 10);
    for (let x = -10; x <= W + 10; x += 4) {
      c.lineTo(x, x < 0 || x >= W ? H : terrain(x));
    }
    c.lineTo(W + 10, H + 10);
    c.fill();
    c.strokeStyle = '#00aa00';
    c.lineWidth = 3;
    c.beginPath();
    for (let x = 0; x < W; x += 4) {
      const y = terrain(x);
      if (x === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
    // Combatants (dead ones leave a smoking wreck marker).
    for (const t of view.tanks) {
      if (t.hp <= 0) {
        const gy = sim.surfY(view.terrain, t.x);
        c.fillStyle = 'rgba(20,20,20,0.8)';
        c.beginPath();
        c.roundRect(t.x - 12, gy - 8, 24, 8, 3);
        c.fill();
        c.fillStyle = 'rgba(120,120,120,0.5)';
        c.fillRect(t.x - 3, gy - 26, 6, 18);
        continue;
      }
      const ground = sim.isGroundUnit(t);
      if (t === view.turnUnit) drawTurnMarker(c, t, time, ground);
      if (view.online && t.menu && !t.isPlayer && t === view.turnUnit) drawMenuBadge(c, t, time, ground);
      if (ground) drawGroundUnit(c, t, time, deps.shownAngle(t), sim.facing(t));
      else drawGunDrone(c, t, time, deps.shownAngle(t), sim.facing(t));
      // Health bar + name.
      const w = 40;
      const barY = t.y - (ground ? 34 : 52);
      c.fillStyle = 'rgba(0,0,0,0.55)';
      c.fillRect(t.x - w / 2, barY, w, 6);
      c.fillStyle = t.isPlayer ? '#00ff00' : (t.color ?? '');
      c.fillRect(t.x - w / 2 + 1, barY + 1, (w - 2) * Math.min(1, t.hp / t.maxHp), 4);
      c.fillStyle = '#fff';
      c.font = `bold ${Math.round(9 * view.textScale)}px sans-serif`;
      c.textAlign = 'center';
      const label = t.isPlayer ? 'TANK' : (ground ? String(t.name || t.id).toUpperCase() : t.id.toUpperCase());
      c.fillText(label, t.x, barY - 4);
      // A player who left: a bot drives the unit now, and a tag says so.
      if (t.bot) {
        const lw = c.measureText(label).width;
        const s = view.textScale;
        c.font = `bold ${Math.round(7 * s)}px sans-serif`;
        const tw = c.measureText('BOT').width + 6 * s;
        const tx = t.x + lw / 2 + 4 * s, ty = barY - 4 - 9 * s;
        c.fillStyle = '#7fdbff';
        c.fillRect(tx, ty, tw, 10 * s);
        c.fillStyle = '#04121c';
        c.textAlign = 'left';
        c.fillText('BOT', tx + 3 * s, ty + 8 * s);
      }
      c.textAlign = 'left';
    }
    // Aim arm: a stub out of the shooter's barrel showing launch direction,
    // longer with more power. Drones show theirs too, so everyone can watch
    // a shot line up. No dots, no landing marker: reading the hills, the
    // wind, and the shell's legs is the game.
    if (view.aim) {
      const t = view.aim.unit;
      const len = view.aim.length;
      let x0: number, y0: number, rad: number, ds: number;
      if (sim.isGroundUnit(t)) {
        const m = sim.muzzle(t);
        x0 = m.x; y0 = m.y;
        rad = deps.shownAngle(t) * Math.PI / 180;
        ds = sim.facing(t);
      } else {
        const tip = droneBarrelTip(deps.shownAngle(t), sim.facing(t), t.x, t.y - 30 + droneHover(t, time));
        x0 = tip.x; y0 = tip.y; rad = tip.rad; ds = tip.s;
      }
      c.strokeStyle = t.isPlayer ? 'rgba(255,255,255,0.7)' : (t.color ?? '');
      c.globalAlpha = t.isPlayer ? 1 : 0.75;
      c.lineWidth = t.isPlayer ? 3 : 2;
      c.beginPath();
      c.moveTo(x0, y0);
      c.lineTo(x0 + Math.cos(rad) * len * ds, y0 - Math.sin(rad) * len);
      c.stroke();
      c.globalAlpha = 1;
    }
    // Blast discs: each explosion draws exactly the circle its weapon destroys,
    // under the effects (trails, muzzle and blast particles), shells on top.
    for (const bm of view.booms) drawBoom(c, bm, deps.look(bm.wkey));
    if (view.fx) view.fx.draw(c);
    // Shells in flight, then (in a room) the shells of the replay, which fly the
    // paths the server simulated.
    for (const s of view.shells) drawShell(c, s, time);
    for (const s of view.replay) drawShell(c, s, time);
    c.globalAlpha = 1;
    drawWindStreaks(c, view);
    if (view.preview) drawPreview(view.preview, time);
    // Particles.
    for (const q of view.sparks) {
      c.globalAlpha = Math.max(0, Math.min(1, q.life * 1.8));
      c.fillStyle = q.color;
      c.fillRect(q.x - 2, q.y - 2, 4, 4);
    }
    c.globalAlpha = 1;
    c.restore();
    if (view.fx) view.fx.drawFlash(c, cv.width || W, cv.height || H);
    drawWindGauge(c, view);
    drawTurnClock(c, view);
  }

  return { frame };
}
