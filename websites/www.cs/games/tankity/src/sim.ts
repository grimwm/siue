/* Operation Tankity: the game math.
 *
 * The pure part of the sim, shared by the solo game, the demo and the client's
 * own shell flight in main.ts, and kept in step with the room server's sim
 * (rooms.php) by the shared vectors in protocol/sim-vectors.json. Nothing here
 * touches the page, sound, particles or chat: state goes in as arguments, and
 * what happened (a blast's hits, a volley's trails) comes back as data for the
 * caller to show. */

import { datan2, dcos, dsin } from './detmath.ts';

/* ---------- seeded RNG (mulberry32 + string hash) ---------- */
export type Rng = () => number;

export function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}
export function mulberry32(a: number): Rng {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function gauss(rng: Rng): number {
  return (rng() + rng() + rng() - 1.5) * 2;
}

/* ---------- board + physics tuning ---------- */
/** The field is always H tall. A room's is ROOM_W wide; a solo match's is
 *  dealt from the screen (field.ts), a whole number of FIELD_COL columns. */
export const H = 460;
export const ROOM_W = 720;
export const FIELD_W_MIN = 720, FIELD_W_MAX = 1440, FIELD_COL = 24;
/** A shell's longest flight on a room's field, in 1/60 s steps (12 s); a wider field's shells fly
 *  fieldReach(w) times longer. Not a width. */
export const FLIGHT_STEPS = 720;
/** A width a match may be played at: a whole number of columns, in range. */
export function fieldWidthOk(w: unknown): w is number {
  return typeof w === 'number' && Number.isInteger(w) && w >= FIELD_W_MIN && w <= FIELD_W_MAX && w % FIELD_COL === 0;
}
export const GRAV = 95;
export const FLAT_GRAV = 90; // flat bolts arc a little, so short shots and demos still land
export const TUNE = {
  lives: 3, maxLives: 5, oneUpEvery: 3000,
  playerArmor: 100, droneArmor: 60,
  fuel: 80, driveSpeed: 42,
  thinkTime: 0.9, settleTime: 1.1,
  roundWinScore: 750, roundWinCash: 500, killBonus: 300,
};
/* Tuning is read-only: one frozen table means a balance number cannot drift
// halfway through a match. PHP arrays already copy on write, so the server
// side gets the same guarantee for free. */
Object.freeze(TUNE);

export const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, v));
/* Degrees to radians in PHP deg2rad()'s order, (deg / 180) * PI, so the
   server's play and the browser agree to the last bit. */
export function rad(deg: number): number {
  return (deg / 180) * Math.PI;
}
/* A distance as the root of the squares: correctly rounded in every engine,
   where Math.hypot and C's hypot() may differ in the last bit. */
export function dist(dx: number, dy: number): number {
  return Math.sqrt(dx * dx + dy * dy);
}
/* b to a small whole power by repeated multiplication: Math.pow and PHP's **
   may round the last bit differently. */
export function powi(b: number, n: number): number {
  let r = 1;
  for (let i = 0; i < n; i++) r *= b;
  return r;
}

/* ---------- types ---------- */
/* A weapon's paint job: the sim reads the shake; the icons and effects read the colors. */
export interface Gfx {
  shake?: number;
  shell?: string;
  trail?: string;
  blast?: readonly [string, string];
  painter?: string;
  [key: string]: unknown;
}
/* One ammo row of the arsenal (game.yaml, served as game.json). */
export interface Weapon {
  key: string;
  name: string;
  cat?: string;
  dmg: number;
  radius: number;
  price: number;
  pack: number;
  minRound: number;
  ai?: boolean;
  aiRound?: number;
  effect: string;
  speed: number;
  flat?: boolean;
  pellets?: number;
  spread?: number;
  steer?: number;
  split?: number;
  fan?: number;
  fuse?: number;
  prox?: number;
  drain?: number;
  subDmg?: number;
  subRadius?: number;
  friction?: number;
  rollTime?: number;
  note?: string;
  gfx?: Gfx;
}
/* A trick from the shop. */
export interface Gear {
  key: string;
  name: string;
  cat?: string;
  price: number;
  n?: number;
  minRound?: number;
  effect?: string;
  dmg?: number;
  radius?: number;
  note?: string;
}
export interface ShopRow {
  kind: 'ammo' | 'gear';
  w?: string;
  g?: string;
  n: number;
  label: string;
  cat: string;
  minRound: number;
  price: number;
  effect?: string;
}
/* What a drop costs and when a parachute opens (game.yaml arsenal.fall). */
export interface FallRules {
  freePx: number; // pixels a unit drops for free
  perPx: number; // armor lost per pixel past freePx, rounded down
  chuteOver: number; // a parachute opens only on a fall costing more than this
  aiRound: number; // first round each drone carries a parachute
}
export const FALL_RULES: Readonly<FallRules> = Object.freeze({ freePx: 10, perPx: 0.5, chuteOver: 5, aiRound: 3 });
/* The arsenal as the sim and the shop read it, built from game.json's arsenal section. */
export interface Arsenal {
  weapons: Readonly<Record<string, Readonly<Weapon>>>;
  order: readonly string[];
  shop: readonly Readonly<ShopRow>[];
  gear: Readonly<Record<string, Readonly<Gear>>>;
  fall: Readonly<FallRules>;
}
/* Shells left per weapon; the player's gun and the Shell itself are endless (Infinity). */
export type Ammo = Record<string, number>;
export interface Tank {
  id: string;
  isPlayer: boolean;
  human?: boolean; // a person in a room: a ground unit, not a drone
  x: number;
  y: number;
  vy?: number;
  angle: number;
  power: number;
  hp: number;
  fuel: number;
  dirS?: number; // +1 faces right, -1 left
  ammo?: Ammo; // a drone's magazine
  brk?: Bracket; // a drone's memory of its last shot
  s?: string; // a drone's strategy (TACTICS)
  dry?: number; // its own turns in a row that hurt nobody
  dealt?: boolean; // it hurt someone since its last turn
  lastHitBy?: number; // index in world.tanks of whoever last damaged this unit
  kills?: number; // units this drone has wrecked this round
  chutes?: number; // a drone's parachutes (the player's are world.chutes)
  fellBy?: number; // index in world.tanks of whoever carved the most ground from under this unit
  fellDepth?: number; // how far that blast lowered the ground under it
  chute?: boolean; // its parachute opened in the last settle (a room's snapshot says so too)
  drawY?: number; // the height it is drawn at while that differs from y (a fall playing out); missing: y
  chuteArmed?: boolean; // its parachute opens as soon as it starts to drop
  chuteOpen?: boolean; // a parachute is drawn open over it: it is dropping under the canopy
  shownHp?: number; // the armor drawn until its fall is seen to land; missing: hp
}
/* A drone's memory of its last shot, for bracketing a target in. */
export interface Bracket {
  t: number; // target: its index in world.tanks
  a: number; // angle and power fired
  p: number;
  w: string; // weapon fired
  n: number; // corrections so far (0 for a ranging shot)
  tx: number; // target's x then
  ox: number; // own x then
  land: number | null; // where the volley first burst; null until it does
}
/* Anything the ballistic step moves. */
export interface Motion {
  x: number;
  y: number;
  vx: number;
  vy: number;
}
export interface Shell extends Motion {
  wkey: string;
  owner: Tank;
  life: number;
  age: number;
  pierced: Tank | false;
  split: boolean;
  /** Launch order within its volley: the pellet's index, then a bomblet's index. */
  order?: number[];
  dead?: boolean;
  clear?: boolean; // flown clear of its own gunner's hit box
  dw?: number; // a cluster bomblet's own damage and radius
  dr?: number;
  /** A roller on the ground: its speed along the surface (px/s, + is toward the right edge) and the 1/60 s steps it has rolled. */
  rolling?: boolean;
  ru?: number;
  rt?: number;
}
export interface Cloud {
  x: number;
  y: number;
  s: number;
  v: number;
}
/* How well the drones aim; the table behind each word is DIFFICULTY in ai.ts. */
export type Difficulty = 'easy' | 'normal' | 'hard';
/* The slice of the game's state the sim reads and writes (main.ts's G). */
export interface World {
  tanks: Tank[];
  terrain: number[];
  wind: number;
  round: number;
  rng: Rng;
  shells: Shell[];
  score: number;
  cash: number;
  ammo: Ammo | null; // the player's
  selected: string;
  shield: boolean;
  bunker: number;
  laststand: boolean;
  jammer: number;
  chutes?: number; // the player's parachutes
  difficulty?: Difficulty; // the drones' aim this match; missing means normal
}
export interface HitBox {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

/* ---------- the arsenal ---------- */
/* Builds the read-only arsenal from game.json's arsenal section (or the baked
   fallback). Null when it holds no usable ammo row. */
export function buildArsenal(data: { ammo?: Weapon[]; gear?: Gear[]; fall?: Partial<FallRules> } | null | undefined): Arsenal | null {
  const w: Record<string, Weapon> = {};
  const order: string[] = [];
  const shop: ShopRow[] = [];
  const gear: Record<string, Gear> = {};
  for (const a of (data && data.ammo) || []) {
    if (!a || !a.key || !a.name) continue;
    w[a.key] = Object.assign({ effect: 'shot', speed: 1.0, pack: 0, price: 0, minRound: 1 }, a);
    order.push(a.key);
    if ((a.pack || 0) > 0) {
      // Round-1 goods sell everywhere including the pre-match shelf
      // (G.round is 0 there); later unlocks need the round to arrive.
      const openFrom = (a.minRound || 1) <= 1 ? 0 : a.minRound;
      shop.push({ kind: 'ammo', w: a.key, n: a.pack, label: `${a.name} ×${a.pack}`, cat: a.cat || 'Shells', minRound: openFrom, price: a.price || 0 });
    }
  }
  for (const g of (data && data.gear) || []) {
    if (!g || !g.key || !g.name) continue;
    gear[g.key] = g;
    const openFrom = (g.minRound || 1) <= 1 ? 0 : g.minRound!;
    shop.push({ kind: 'gear', g: g.key, n: g.n || 0, label: g.name, cat: g.cat || 'Tricks', minRound: openFrom, price: g.price || 0, effect: g.effect });
  }
  if (!order.length) return null;
  // The arsenal is read-only after the build: every shell, row, and paint
  // job freezes, so a stray write fails loudly instead of bending ballistics
  // mid-match. Hot per-frame state (shells, particles, tanks) stays mutable
  // where freezing would cost real time.
  for (const k of Object.keys(w)) {
    const row = w[k]!;
    if (row.gfx) Object.freeze(row.gfx);
    const blast = row.gfx && row.gfx['blast'];
    if (blast) Object.freeze(blast);
    Object.freeze(row);
  }
  for (const row of shop) Object.freeze(row);
  for (const k of Object.keys(gear)) Object.freeze(gear[k]);
  Object.freeze(order);
  Object.freeze(shop);
  const fall = Object.freeze({ ...FALL_RULES, ...((data && data.fall) || {}) });
  return { weapons: w, order, shop, gear, fall };
}
/* Drone magazine from the data file: shells the battery may load by round. */
export function droneRack(arsenal: Arsenal, round: number): Ammo {
  const rack: Ammo = { shell: Infinity };
  for (const k of arsenal.order) {
    if (k === 'shell') continue;
    const a = arsenal.weapons[k];
    rack[k] = (a && a.ai && round >= (a.aiRound || 99)) ? 2 : 0;
  }
  return rack;
}
/* Parachutes a drone musters with: one from the rules' round on. */
export function droneChutes(arsenal: Pick<Arsenal, 'fall'>, round: number): number {
  return round >= arsenal.fall.aiRound ? 1 : 0;
}

/* ---------- terrain ---------- */
/** A round's hills: three sines' amplitudes, phases and frequencies. */
export interface Hills {
  a: readonly [number, number, number];
  p: readonly [number, number, number];
  f: readonly [number, number, number];
}
/** The nine draws a round's hills are made of, in the order the server draws them. */
export function drawHills(rng: Rng): Hills {
  const a = [20 + rng() * 30, 10 + rng() * 22, 5 + rng() * 12] as const;
  const p = [rng() * 6.28, rng() * 6.28, rng() * 6.28] as const;
  const f = [1 / 260 + rng() / 500, 1 / 120 + rng() / 260, 1 / 47 + rng() / 120] as const;
  return { a, p, f };
}
/** The hills' height at column x, on or past the field (the scenery draws the same hills). */
export function hillY(h: Hills, x: number): number {
  const y = 330
    + h.a[0] * dsin(x * h.f[0] + h.p[0])
    + h.a[1] * dsin(x * h.f[1] + h.p[1])
    + h.a[2] * dsin(x * h.f[2] + h.p[2]);
  return clamp(y, 190, 415);
}
/** The nine numbers as a room snapshot carries them. */
export function hillsWire(h: Hills): number[] {
  return [...h.a, ...h.p, ...h.f];
}
export function hillsFrom(n: unknown): Hills | null {
  if (!Array.isArray(n) || n.length !== 9 || !n.every(v => typeof v === 'number' && Number.isFinite(v))) return null;
  const v = n as number[];
  return { a: [v[0]!, v[1]!, v[2]!], p: [v[3]!, v[4]!, v[5]!], f: [v[6]!, v[7]!, v[8]!] };
}
/* Rolling hills over w columns, and the clouds that drift over them. */
export function genTerrain(rng: Rng, w: number): { terrain: number[]; clouds: Cloud[]; hills: Hills } {
  const hills = drawHills(rng);
  const terrain = new Array<number>(w);
  for (let x = 0; x < w; x++) terrain[x] = hillY(hills, x);
  const clouds: Cloud[] = [];
  for (let i = 0; i < 5; i++) {
    clouds.push({ x: rng() * w, y: 30 + rng() * 90, s: 0.6 + rng() * 0.9, v: 3 + rng() * 5 });
  }
  return { terrain, clouds, hills };
}
export function surfY(terrain: readonly number[], x: number): number {
  const xi = clamp(Math.round(x), 0, terrain.length - 1);
  return terrain[xi]!;
}
/* Cuts a crater: the ground under the blast drops to a 3:4 ellipse around
   (x, y), never below floor. The war, the room replay and the firing range
   all carve with this. */
export function carveCrater(terrain: number[], x: number, y: number, r: number, floor: number): void {
  const x0 = Math.max(0, Math.floor(x - r)), x1 = Math.min(terrain.length - 1, Math.ceil(x + r));
  for (let ix = x0; ix <= x1; ix++) {
    const dx = ix - x;
    const cut = Math.sqrt(Math.max(0, r * r - dx * dx)) * 0.75;
    terrain[ix] = Math.min(floor, Math.max(terrain[ix]!, y + cut));
  }
}

/* ---------- units ---------- */
/* Which way a tank faces: +1 right, -1 left. Angles count from that side. */
export function facing(t: Pick<Tank, 'dirS' | 'isPlayer'>): number {
  return t.dirS || (t.isPlayer ? 1 : -1);
}
export function isGroundUnit(t: Pick<Tank, 'isPlayer' | 'human'>): boolean {
  return t.isPlayer || !!t.human;
}
/* Units keep at least this far apart, centre to centre, so hulls and rotors
   never overlap; fresh rounds spread them wider still. */
export const UNIT_GAP = 44;
export const SPAWN_GAP = 110;
export function spotTaken(tanks: readonly Tank[], t: Tank, x: number): boolean {
  return tanks.some(o => o !== t && o.hp > 0 && Math.abs(o.x - x) < UNIT_GAP);
}
/* n spawn points across the hills, at least SPAWN_GAP apart, in random
   order: nobody owns a side. Falls back to even spacing if sampling fails.
   SPAWN_GAP is more than the largest blast radius plus a hull, so nobody
   starts inside another's blast. */
export function spawnSpots(n: number, rng: Rng, w: number): number[] {
  const lo = 30, hi = w - 30; // over the whole field: the extra hills are part of the fight
  for (let tries = 0; tries < 200; tries++) {
    const xs: number[] = [];
    for (let i = 0; i < n; i++) xs.push(Math.round(lo + rng() * (hi - lo)));
    xs.sort((a, b) => a - b);
    if (xs.every((x, i) => i === 0 || x - xs[i - 1]! >= SPAWN_GAP)) {
      for (let i = xs.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [xs[i], xs[j]] = [xs[j]!, xs[i]!];
      }
      return xs;
    }
  }
  return Array.from({ length: n }, (_, i) => Math.round(lo + (i + 0.5) * (hi - lo) / n));
}
/* Hit boxes match the drawn units: a ground unit's hull and turret, or a
   drone's body up in the air (rooms.php room_unit_box() is the same). */
export function unitHitBox(t: Pick<Tank, 'isPlayer' | 'human' | 'x' | 'y'>): HitBox {
  return isGroundUnit(t)
    ? { cx: t.x, cy: t.y - 10, rx: 20, ry: 13 }
    : { cx: t.x, cy: t.y - 30, rx: 18, ry: 14 };
}
export function inHitBox(t: Pick<Tank, 'isPlayer' | 'human' | 'x' | 'y'>, x: number, y: number): boolean {
  const b = unitHitBox(t);
  const u = (x - b.cx) / b.rx, v = (y - b.cy) / b.ry;
  return u * u + v * v <= 1;
}

/* ---------- firing and flight ---------- */
export function muzzle(t: Pick<Tank, 'angle' | 'dirS' | 'isPlayer' | 'x' | 'y'>): { x: number; y: number } {
  const a = rad(t.angle);
  const s = facing(t);
  return { x: t.x + dcos(a) * 20 * s, y: t.y - 14 - dsin(a) * 20 };
}
/** How much faster shells fly on a field w wide: range and height grow by
 *  w / ROOM_W, so full power still crosses the field and the wind bends a shot
 *  by the same share of its length. Exactly 1 on a room's field. */
export function fieldReach(w: number): number {
  return Math.sqrt(w / ROOM_W);
}
export function shotSpeed(power: number, flat: boolean | undefined, mult: number | undefined, reach = 1): number {
  const m = mult || 1;
  return (flat ? 140 + power * 3.2 : 40 + power * 2.4) * m * reach;
}
/* What a successful shot leaves for the caller to show: where the barrel
   pointed (for the muzzle effect) and whether it spent the player's last
   round of the selected gun. */
export interface Launch {
  x: number;
  y: number;
  ang: number;
  spent: boolean;
}
/* Fires wkey from tank t: spends the round and launches the volley's shells
   into world.shells. Null when t has none left. */
export function fireWeapon(world: World, arsenal: Arsenal, t: Tank, wkey: string): Launch | null {
  const w = arsenal.weapons[wkey]!;
  const store = (t.isPlayer ? world.ammo : t.ammo)!;
  if ((store[wkey] || 0) <= 0) return null;
  if (wkey !== 'shell') store[wkey]! -= 1;
  // The last one fired: the player's gun falls back to the endless Shell.
  let spent = false;
  if (t.isPlayer && wkey !== 'shell' && store[wkey]! <= 0 && world.selected === wkey) {
    world.selected = 'shell';
    spent = true;
  }
  const m = muzzle(t);
  const r0 = rad(t.angle);
  const s = facing(t);
  const shots = w.pellets || 1;
  for (let i = 0; i < shots; i++) {
    const off = shots === 1 ? 0 : (i - (shots - 1) / 2) * (w.spread || 0);
    const a = r0 + off;
    const spd = shotSpeed(t.power, w.flat, w.speed, fieldReach(world.terrain.length));
    world.shells.push({
      x: m.x, y: m.y,
      vx: dcos(a) * spd * s, vy: -dsin(a) * spd,
      wkey, owner: t, life: 12 * fieldReach(world.terrain.length), // flights last as long as the field is wide
      age: 0, pierced: false, split: false, order: [i],
    });
  }
  return { x: m.x, y: m.y, ang: datan2(-dsin(r0), dcos(r0) * s), spent };
}
/* One ballistic step. Shared by the real shells, the AI predictor, the aim
 * guide, and the firing-range preview, so the demo flies exactly like war. */
export function stepBallistic(st: Motion, dt: number, wind: number, grav: number): void {
  st.vx += wind * 2.2 * dt;
  st.vy += grav * dt;
  st.x += st.vx * dt;
  st.y += st.vy * dt;
}
/* ---------- rollers ---------- */
/* A roller that touches down does not burst: it rolls along the ground, a
   ball resting ROLL_LIFT px above the surface, until it reaches a unit, runs
   off the board, comes to rest, or has rolled the weapon's rollTime. Wind
   does not touch it. rooms.php room_ground_at() .. room_roll_out() are the
   same. */
export const ROLL_LIFT = 3; // px the ball's centre rides above the ground
export const ROLL_KEEP = 0.7; // share of its speed along the ground that survives touching down
export const ROLL_DRAG = 10; // px/s^2: the ground's constant drag on a rolling ball, besides the weapon's friction
export const ROLL_STOP = 12; // px/s: slower than this, and ...
export const ROLL_STATIC = 20; // px/s^2: ... pulled by less than this, it stays put
/* The ground's height at a (fractional) column: linear between the columns. */
export function groundAt(terrain: readonly number[], x: number): number {
  const n = terrain.length;
  const xc = clamp(x, 0, n - 1);
  const i = Math.floor(xc);
  const j = Math.min(i + 1, n - 1);
  return terrain[i]! + (terrain[j]! - terrain[i]!) * (xc - i);
}
/* The ground's slope dy/dx at x (positive: it falls away toward the right), over +-3 px. */
export function groundSlope(terrain: readonly number[], x: number): number {
  return (groundAt(terrain, x + 3) - groundAt(terrain, x - 3)) / 6;
}
/* A touching-down shell's speed along the ground at x, from its velocity. */
export function rollStart(terrain: readonly number[], x: number, vx: number, vy: number): number {
  const m = groundSlope(terrain, x);
  return ((vx + vy * m) / Math.sqrt(1 + m * m)) * ROLL_KEEP;
}
/* One rolling step: downhill pulls it on (GRAV along the slope), friction
   (and the ground's constant drag) slow it. r.x moves; r.u is its speed along the ground. False once it has
   come to rest. */
export function rollStep(terrain: readonly number[], r: { x: number; u: number }, friction: number, dt: number): boolean {
  const m = groundSlope(terrain, r.x);
  const n = Math.sqrt(1 + m * m);
  const a = GRAV * m / n;
  r.u += a * dt;
  r.u -= r.u * friction * dt;
  const drag = ROLL_DRAG * dt;
  r.u = Math.abs(r.u) <= drag ? 0 : r.u - Math.sign(r.u) * drag;
  if (Math.abs(r.u) < ROLL_STOP && Math.abs(a) <= ROLL_STATIC) {
    r.u = 0;
    return false;
  }
  r.x += r.u / n * dt;
  return true;
}
/* Where a shell touching down at x with velocity (vx, vy) ends its roll with
   no unit in the way: at rest, off the board edge, or when its time is up.
   `touch` stops it early at the first column it returns true for. */
export function rollOut(terrain: readonly number[], x: number, vx: number, vy: number, w: Pick<Weapon, 'friction' | 'rollTime'>,
  touch?: (x: number) => boolean): { x: number; y: number } {
  const r = { x: clamp(x, 0, terrain.length - 1), u: 0 };
  r.u = rollStart(terrain, r.x, vx, vy);
  const steps = Math.round((w.rollTime || 5) * 60);
  for (let i = 0; i < steps; i++) {
    if (touch && touch(r.x)) break;
    if (r.x <= 0 || r.x >= terrain.length - 1) break;
    if (!rollStep(terrain, r, w.friction || 0.3, 1 / 60)) break;
  }
  r.x = clamp(r.x, 0, terrain.length - 1);
  return { x: r.x, y: groundAt(terrain, r.x) };
}
/* Everything simShot reads from a gun, as one string: guns with the same key
   fly the same planning arc from the same muzzle, so the drones search one of
   them (ai.ts arcGuns). A field simShot starts to read belongs here too;
   test/ai-arcs.test.mjs changes every field of every gun to catch one that
   is missing. server/sim.php room_flight_key is the same. */
export function flightKey(w: Weapon): string {
  const roll = w.effect === 'roller';
  return JSON.stringify([!!w.flat, w.speed, roll, roll ? w.friction || 0.3 : 0, roll ? w.rollTime || 5 : 0]);
}
/* Predict where a shot lands (used by the AI and the aim guide); a roller's
   landing is where its roll ends. `top` is the highest ground (the least
   terrain y): above it a shell cannot touch down, so the search skips the
   ground lookup there. */
export function simShot(world: Pick<World, 'terrain' | 'wind'>, arsenal: Arsenal, x: number, y: number, angle: number,
  power: number, wkey: string, dirS: number, top = -Infinity): { x: number; y: number; oob: boolean } {
  const w = arsenal.weapons[wkey]!;
  const fw = world.terrain.length, reach = fieldReach(fw);
  const r = rad(angle);
  const st: Motion = {
    x, y,
    vx: dcos(r) * shotSpeed(power, w.flat, w.speed, reach) * dirS,
    vy: -dsin(r) * shotSpeed(power, w.flat, w.speed, reach),
  };
  const dt = 1 / 60;
  const grav = w.flat ? FLAT_GRAV : GRAV;
  for (let i = 0, steps = Math.ceil(FLIGHT_STEPS * reach); i < steps; i++) {
    stepBallistic(st, dt, world.wind, grav);
    if (st.x < 0 || st.x >= fw) return { x: st.x, y: st.y, oob: true };
    if (st.y >= H + 40) return { x: st.x, y: st.y, oob: true };
    if (i >= 6 && st.y >= top && st.y >= world.terrain[clamp(Math.round(st.x), 0, fw - 1)]!) {
      if (w.effect === 'roller') return { ...rollOut(world.terrain, st.x, st.vx, st.vy, w), oob: false };
      return { x: st.x, y: st.y, oob: false };
    }
  }
  return { x: st.x, y: st.y, oob: true };
}
/* Seekers bend toward the nearest live rival before the ballistic step. */
export function steerShell(tanks: readonly Tank[], s: Shell, w: Weapon, dt: number): void {
  let best: Tank | null = null, bd = Infinity;
  for (const t of tanks) {
    if (t.hp <= 0 || t === s.owner) continue;
    const d = dist(t.x - s.x, (t.y - 12) - s.y);
    if (d < bd) { bd = d; best = t; }
  }
  // On top of its target a seeker has nowhere to bend (server/sim.php room_seek_push).
  if (!best || bd <= 1) return;
  const push = (w.steer || 70) * dt;
  s.vx += ((best.x - s.x) / bd) * push;
  s.vy += (((best.y - 12) - s.y) / bd) * push;
}
/* Cluster shells split on fuse into a deterministic fan: fixed offsets, no
// random numbers, so the room server replays the exact same bloom. Returns
// the bomblets. */
export function splitShell(s: Shell, w: Weapon, reach = 1): Shell[] {
  const n = Math.max(2, w.split || 4);
  const fan = w.fan || 0.22;
  const sp = dist(s.vx, s.vy) * 0.85;
  const base = datan2(s.vy, s.vx);
  const bomblets: Shell[] = [];
  for (let i = 0; i < n; i++) {
    const a = base + (i - (n - 1) / 2) * fan;
    bomblets.push({
      x: s.x, y: s.y,
      vx: dcos(a) * sp, vy: dsin(a) * sp,
      wkey: s.wkey, owner: s.owner, life: 12 * reach,
      age: 0, pierced: false, split: true, order: [...(s.order || []), i],
      dw: w.subDmg || w.dmg, dr: w.subRadius || w.radius,
    });
  }
  return bomblets;
}
/* The first unit shell s touches anywhere along its step, sampled every
   3 px so a fast shell (or a slow frame) cannot skip through one. The
   muzzle sits inside its gunner's box, so a shell ignores its owner until
   it has flown clear of that box; one that comes back (wind, a lob
   straight up) hits it like anyone else. */
export function sweepHit(tanks: readonly Tank[], s: Pick<Shell, 'owner' | 'pierced' | 'clear'>,
  x0: number, y0: number, x1: number, y1: number): { t: Tank; x: number; y: number } | null {
  const n = Math.max(1, Math.ceil(dist(x1 - x0, y1 - y0) / 3));
  for (let i = 1; i <= n; i++) {
    const px = x0 + (x1 - x0) * i / n, py = y0 + (y1 - y0) * i / n;
    if (!s.clear && !inHitBox(s.owner, px, py)) s.clear = true;
    for (const t of tanks) {
      if (t.hp <= 0 || t === s.pierced || (t === s.owner && !s.clear)) continue;
      if (inHitBox(t, px, py)) return { t, x: px, y: py };
    }
  }
  return null;
}

/* The first unit a rolling shell touches along its step. A ball on the ground
   cannot reach a drone hovering overhead, so a unit counts as touched when the
   ball is within the width of its hit box, at any height. The
   owner-clear rule is sweepHit's: the shell ignores its gunner until it has
   been outside the gunner's real box. rooms.php room_roll_hit() is the same. */
export function rollHit(tanks: readonly Tank[], s: Pick<Shell, 'owner' | 'clear'>,
  x0: number, y0: number, x1: number, y1: number): { t: Tank; x: number; y: number } | null {
  const n = Math.max(1, Math.ceil(dist(x1 - x0, y1 - y0) / 3));
  for (let i = 1; i <= n; i++) {
    const px = x0 + (x1 - x0) * i / n, py = y0 + (y1 - y0) * i / n;
    if (!s.clear && !inHitBox(s.owner, px, py)) s.clear = true;
    for (const t of tanks) {
      if (t.hp <= 0 || (t === s.owner && !s.clear)) continue;
      const b = unitHitBox(t);
      if (inHitBox(t, px, b.cy)) return { t, x: px, y: py };
    }
  }
  return null;
}

/* ---------- blasts ---------- */
/* Damage by distance d from the unit's body: full at the centre, falling to
   30% at the edge of the reach (blast radius plus 14, a unit's own size). */
export function blastDamage(dmg: number, d: number, r: number): number {
  return Math.round(dmg * Math.max(0.3, 1 - d / (r + 14)));
}
/* What a blast did to one unit, in the order it happened. */
export type BlastEvent =
  /** A shield absorbed the hit whole. */
  | { kind: 'shield'; tank: Tank }
  /** An EMP caught the unit: the arcs play over it. */
  | { kind: 'arc'; tank: Tank }
  /** The unit took dmg and kept rolling with hp armor left; direct: the blast came from a direct hit. */
  | { kind: 'wound'; tank: Tank; dmg: number; hp: number; direct: boolean }
  /** The unit was wrecked; a player's last stand blew up the wreck (that blast comes first). */
  | { kind: 'wreck'; tank: Tank; lastStand: Blast | null };
export interface Blast {
  x: number;
  y: number;
  r: number;
  wkey: string;
  fx: string; // the effect to play (the weapon's, unless a trick brings its own)
  shake: number; // screen shake when the effect sets none
  owner: Tank;
  events: BlastEvent[];
}
export interface BlastOverride {
  dmg?: number;
  radius?: number;
  gfx?: Gfx;
  fx?: string;
}
/* A shell bursts at (x, y): carves the crater, then docks armor by distance
   (direct hits pay double) and settles shields, bunkers, EMP fuel drain,
   score, cash and wrecks in world. */
export function explode(world: World, arsenal: Arsenal, x: number, y: number, wkey: string, owner: Tank,
  direct: Tank | null, ov: BlastOverride | null): Blast {
  const w = arsenal.weapons[wkey]!;
  const dmg0 = (ov && ov.dmg) || w.dmg;
  const r = (ov && ov.radius) || w.radius;
  const gfx = (ov && ov.gfx) || w.gfx || {};
  brkLand(owner, x);
  const was = world.tanks.map(t => surfY(world.terrain, t.x));
  carveCrater(world.terrain, x, y, r, H - 4);
  markFalls(world, owner, was);
  const blast: Blast = { x, y, r, wkey, fx: (ov && ov.fx) || wkey, shake: gfx.shake || 0.5, owner, events: [] };
  for (const t of world.tanks) {
    if (t.hp <= 0) continue;
    // Distance from the unit's body (its hit box centre), drone or tank.
    const b = unitHitBox(t);
    const d = dist(b.cx - x, b.cy - y);
    if (d > r + 14) continue;
    // A shield absorbs one hit whole, then it is gone.
    if (t.isPlayer && world.shield) {
      world.shield = false;
      blast.events.push({ kind: 'shield', tank: t });
      continue;
    }
    let dmg = blastDamage(dmg0, d, r);
    if (direct === t) dmg *= 2;
    // A bunker halves everything that gets through.
    if (t.isPlayer && (world.bunker || 0) > 0) dmg = Math.max(1, Math.round(dmg / 2));
    t.hp = Math.max(0, t.hp - dmg);
    // EMP fries fuel as well as armor.
    if (w.effect === 'emp') {
      t.fuel = Math.max(0, (t.fuel || 0) - (w.drain || 0));
      blast.events.push({ kind: 'arc', tank: t });
    }
    credit(world, t, owner, dmg);
    if (t.hp <= 0) blast.events.push(wreck(world, arsenal, t, owner));
    else blast.events.push({ kind: 'wound', tank: t, dmg, hp: t.hp, direct: !!direct });
  }
  return blast;
}
/* What damage t took from owner's shot pays: the player's shots at drones
   score and earn twice the damage; any shot at someone else marks the victim's
   last hit and the shooter's dealt and kills. */
function credit(world: World, t: Tank, owner: Tank, dmg: number): void {
  if (owner.isPlayer && !t.isPlayer) {
    world.score += dmg * 2;
    world.cash += dmg * 2;
  }
  if (t !== owner) {
    t.lastHitBy = world.tanks.indexOf(owner); // an avenger and the shooter's dry spell read these
    owner.dealt = true;
    if (t.hp <= 0) owner.kills = (owner.kills || 0) + 1;
  }
}
/* Of the blasts that lowered the ground under a standing unit, the one that
   lowered it the most owns its fall (the first of equals): `was` is the
   ground under each unit before this crater. */
function markFalls(world: World, owner: Tank, was: readonly number[]): void {
  world.tanks.forEach((t, i) => {
    if (t.hp <= 0) return;
    const now = surfY(world.terrain, t.x);
    const deeper = now - was[i]!;
    if (deeper > 0 && now > t.y + 0.5 && deeper > (t.fellDepth || 0)) {
      t.fellBy = world.tanks.indexOf(owner);
      t.fellDepth = deeper;
    }
  });
}
/* A unit's wreck: only a kill the player's own shot made pays the bonus, never
   one a rival drone made. */
function wreck(world: World, arsenal: Arsenal, t: Tank, owner: Tank): BlastEvent {
  // Last stand: the wreck itself detonates, once, then the trick is spent.
  let lastStand: Blast | null = null;
  if (t.isPlayer && world.laststand) {
    world.laststand = false;
    const ls: Partial<Gear> = arsenal.gear['laststand'] || {};
    lastStand = explode(world, arsenal, t.x, t.y - 12, 'shell', t, null, { dmg: ls.dmg || 50, radius: ls.radius || 44, fx: 'laststand' });
  }
  if (!t.isPlayer && owner.isPlayer) {
    world.score += TUNE.killBonus;
    world.cash += TUNE.killBonus;
  }
  return { kind: 'wreck', tank: t, lastStand };
}

/* ---------- a frame of shells ---------- */
/* What one frame of flight leaves for the caller to show, in order. */
export type StepEvent =
  /** A shell flew: its trail drips along the step it took. */
  | { kind: 'trail'; shell: Shell; x: number; y: number; vx: number; vy: number }
  /** A cluster shell bloomed at its fuse. */
  | { kind: 'split'; wkey: string; x: number; y: number; ang: number }
  /** A lance went through its first victim and flies on. */
  | { kind: 'pierce'; wkey: string; x: number; y: number; ang: number }
  | { kind: 'blast'; blast: Blast };
/* True when a shell launched earlier in the same volley is still in the air. */
function waitsOnEarlier(world: World, s: Shell): boolean {
  const mine = s.order || [];
  return world.shells.some(o => {
    if (o === s || o.dead || o.owner !== s.owner) return false;
    const theirs = o.order || [];
    for (let i = 0; i < Math.min(mine.length, theirs.length); i++) {
      if (theirs[i] !== mine[i]) return theirs[i]! < mine[i]!;
    }
    return theirs.length < mine.length;
  });
}
/* One step of a roller on the ground: it rolls, then bursts on a unit it
   touches, at rest, at the board's edge, or when its roll time is up. Pushes
   the trail, and the blast when it bursts. */
function stepRoller(world: World, arsenal: Arsenal, s: Shell, w: Weapon, dt: number, events: StepEvent[]): void {
  const t = world.terrain;
  const x0 = s.x, y0 = s.y;
  const r = { x: s.x, u: s.ru || 0 };
  let done = (s.rt || 0) >= Math.round((w.rollTime || 5) * 60) || r.x <= 0 || r.x >= t.length - 1;
  let direct: Tank | null = null;
  if (!done) {
    const moving = rollStep(t, r, w.friction || 0.3, dt);
    s.rt = (s.rt || 0) + 1;
    s.x = r.x;
    s.ru = r.u;
    s.y = groundAt(t, r.x) - ROLL_LIFT;
    const m = groundSlope(t, r.x);
    s.vx = r.u / Math.sqrt(1 + m * m);
    s.vy = s.vx * m;
    done = !moving;
    const hit = rollHit(world.tanks, s, x0, y0, s.x, s.y);
    if (hit) {
      direct = hit.t;
      s.x = hit.x;
      done = true;
    }
    if (!done) events.push({ kind: 'trail', shell: s, x: s.x, y: s.y, vx: s.vx, vy: s.vy });
  }
  if (!done) return;
  const bx = clamp(s.x, 0, t.length - 1);
  events.push({ kind: 'blast', blast: explode(world, arsenal, bx, groundAt(t, bx), s.wkey, s.owner, direct, null) });
  s.dead = true;
}
/* Advances every shell dt seconds: flight, fuses, hits and bursts. Bomblets
   born this frame fly this frame too. A volley's shells fly together, but they
   burst in launch order, as the room server resolves them: a shell that
   reaches something to burst on while an earlier one is still flying holds
   where it is, and bursts against the ground that one left once it has landed. */
export function stepShells(world: World, arsenal: Arsenal, dt: number): StepEvent[] {
  const events: StepEvent[] = [];
  for (const s of world.shells) {
    const w = arsenal.weapons[s.wkey]!;
    if (s.rolling) {
      stepRoller(world, arsenal, s, w, dt, events);
      continue;
    }
    s.age = (s.age || 0) + dt;
    if (w.effect === 'seeker') steerShell(world.tanks, s, w, dt);
    const x0 = s.x, y0 = s.y;
    const held = { vx: s.vx, vy: s.vy, age: (s.age || 0) - dt, life: s.life, clear: s.clear };
    stepBallistic(s, dt, world.wind, w.flat ? FLAT_GRAV : GRAV);
    s.life -= dt;
    events.push({ kind: 'trail', shell: s, x: s.x, y: s.y, vx: s.vx, vy: s.vy });
    if (s.life <= 0 || s.x < -20 || s.x > world.terrain.length + 20 || s.y > H + 40) {
      s.dead = true;
      continue;
    }
    // Cluster blooms on fuse, wherever it happens to be.
    if (w.effect === 'cluster' && !s.split && s.age >= (w.fuse || 0.9)) {
      s.split = true;
      events.push({ kind: 'split', wkey: s.wkey, x: s.x, y: s.y, ang: datan2(s.vy, s.vx) });
      world.shells.push(...splitShell(s, w, fieldReach(world.terrain.length)));
      s.dead = true;
      continue;
    }
    // Direct hit on a living tank?
    // A lance that already went through a tank cannot hit that tank again.
    let direct: Tank | null = null;
    const hit = sweepHit(world.tanks, s, x0, y0, s.x, s.y);
    if (hit) {
      // Burst where the shell touched the unit, not past it.
      direct = hit.t;
      s.x = hit.x;
      s.y = hit.y;
    }
    // Flak bursts next to anything it passes, but never its own gunner: the
    // muzzle starts inside the burst radius.
    if (!direct && w.effect === 'proximity') {
      let bd = w.prox || 34;
      for (const t of world.tanks) {
        if (t.hp <= 0 || t === s.owner) continue;
        const d = dist(s.x - t.x, s.y - (t.y - 12));
        if (d < bd) { bd = d; direct = t; }
      }
    }
    const ov = s.dw ? { dmg: s.dw, radius: s.dr } : null;
    // A bomblet may burst on the ground at once; a fresh shell ignores it for
    // 0.1 s (server/sim.php room_fly_arc starts bomblets at age 99).
    const grounded = (s.split || s.age >= 0.1) && s.y >= surfY(world.terrain, s.x);
    const bursts = !!direct || (grounded && w.effect !== 'roller');
    if (bursts && waitsOnEarlier(world, s)) {
      s.x = x0; s.y = y0;
      s.vx = held.vx; s.vy = held.vy;
      s.age = held.age; s.life = held.life; s.clear = held.clear;
      events.pop(); // no trail for a shell standing still
      continue;
    }
    if (direct) {
      // A lance punches through its first victim and keeps flying.
      if (w.effect === 'pierce' && !s.pierced) {
        s.pierced = direct;
        events.push({ kind: 'pierce', wkey: s.wkey, x: s.x, y: s.y, ang: datan2(s.vy, s.vx) });
        events.push({ kind: 'blast', blast: explode(world, arsenal, s.x, s.y, s.wkey, s.owner, direct, ov) });
        continue;
      }
      events.push({ kind: 'blast', blast: explode(world, arsenal, s.x, s.y, s.wkey, s.owner, direct, ov) });
      s.dead = true;
      continue;
    }
    if (grounded && w.effect === 'roller') {
      // Touching down, a roller starts to roll instead of bursting.
      s.rolling = true;
      s.rt = 0;
      s.x = clamp(s.x, 0, world.terrain.length - 1);
      s.ru = rollStart(world.terrain, s.x, s.vx, s.vy);
      s.y = groundAt(world.terrain, s.x) - ROLL_LIFT;
      continue;
    }
    if (grounded) {
      events.push({ kind: 'blast', blast: explode(world, arsenal, s.x, s.y, s.wkey, s.owner, null, ov) });
      s.dead = true;
    }
  }
  world.shells = world.shells.filter(s => !s.dead);
  // No clearing here: every pellet of a volley resolves on its own, so a
  // buckshot spread scores up to three independent hits. The turn advances
  // once the last pellet lands (or fizzles).
  return events;
}

/* ---------- tanks falling ---------- */
/* Units left hanging over a crater drop straight down, never sideways, onto
   the ground or a unit beneath them; ground that rose (a new round, fresh
   hills) takes them straight up. A drop costs armor by its height at rest
   (fallDamage), credited to the blast that lowered the ground under it most.

   The rules and the picture are kept apart. The rules run once a volley, when
   its last shell is down: settleFalls lands every hanging unit at once, the
   same settle the room server runs at the end of each volley
   (server/sim.php room_settle_tanks), so the same shot costs the same armor in
   a solo match and in a room. Until then a unit's rule height (y) stays where
   it stood, for the volley's later hits. fallTanks only moves the drawn
   height (drawY): a unit whose ground goes is seen to fall at once, and after
   the settle it is drawn on to where it rests. It never decides damage,
   parachutes or credit. */
export const FALL_GRAVITY = 700;
/** px/s a unit drifts down under an open parachute. */
export const CHUTE_SPEED = 60;
/** The armor a drop of `drop` px costs: nothing for the first freePx, then
 *  perPx a pixel, rounded down. */
export function fallDamage(drop: number, rules: Readonly<FallRules>): number {
  return drop <= rules.freePx ? 0 : Math.floor(rules.perPx * (drop - rules.freePx));
}
/** The top of a unit: what another unit lands on. */
function unitTop(t: Pick<Tank, 'isPlayer' | 'human' | 'x' | 'y'>): number {
  const b = unitHitBox(t);
  return b.cy - b.ry;
}
/** The live unit t would land on, falling straight down from where it is, or null. */
function unitBeneath(tanks: readonly Tank[], terrain: readonly number[], t: Tank): Tank | null {
  let best: Tank | null = null, top = surfY(terrain, t.x);
  for (const u of tanks) {
    if (u === t || u.hp <= 0) continue;
    if (Math.abs(u.x - t.x) >= unitHitBox(u).rx + unitHitBox(t).rx) continue;
    const ut = unitTop(u);
    if (ut >= t.y - 0.5 && ut < top) { top = ut; best = u; }
  }
  return best;
}
/** Where t comes to rest falling straight down: the ground, or the top of a
 *  live unit beneath it, whichever is higher. */
export function restY(tanks: readonly Tank[], terrain: readonly number[], t: Tank): number {
  const u = unitBeneath(tanks, terrain, t);
  return u ? unitTop(u) : surfY(terrain, t.x);
}
/* What a landing did, in order. */
export type FallEvent =
  /** The unit took dmg (0 when its parachute opened) and has hp left; under: it was landed on. by: whoever dug, null for nobody. */
  | { kind: 'fall'; tank: Tank; dmg: number; hp: number; chute: boolean; under: boolean; by: Tank | null }
  /** The fall wrecked it; a player's last stand blew up the wreck. */
  | { kind: 'wreck'; tank: Tank; by: Tank | null; lastStand: Blast | null };
/* Parachutes t holds: the player's are the world's. */
function chutesOf(world: Pick<World, 'chutes'>, t: Tank): number {
  return (t.isPlayer ? world.chutes : t.chutes) || 0;
}
function spendChute(world: Pick<World, 'chutes'>, t: Tank): void {
  if (t.isPlayer) world.chutes = chutesOf(world, t) - 1;
  else t.chutes = chutesOf(world, t) - 1;
}
/* What a fall of `raw` would really cost t: the bunker halves it as it halves
   a hit; a shield never stops a fall. */
function fallCost(world: World, t: Tank, raw: number): number {
  return t.isPlayer && (world.bunker || 0) > 0 ? Math.max(1, Math.round(raw / 2)) : raw;
}
function fallHurt(world: World, arsenal: Arsenal, t: Tank, raw: number, by: Tank | null, under: boolean, events: FallEvent[]): void {
  const dmg = fallCost(world, t, raw);
  t.hp = Math.max(0, t.hp - dmg);
  if (by) credit(world, t, by, dmg);
  events.push({ kind: 'fall', tank: t, dmg, hp: t.hp, chute: false, under, by });
  if (t.hp <= 0) {
    const w = wreck(world, arsenal, t, by || t);
    events.push({ kind: 'wreck', tank: t, by, lastStand: w.kind === 'wreck' ? w.lastStand : null });
  }
}
/* t has come to rest after dropping `drop` px onto `onto` (null: the ground).
   Spends a parachute when the fall would cost t more than chuteOver; the unit
   beneath takes the full fall either way. True when a parachute opened. */
function land(world: World, arsenal: Arsenal, t: Tank, drop: number, onto: Tank | null, events: FallEvent[]): boolean {
  const raw = fallDamage(drop, arsenal.fall);
  const i = t.fellBy;
  t.fellBy = undefined;
  t.fellDepth = undefined;
  if (raw <= 0) return false;
  const digger = i === undefined ? null : world.tanks[i] || null;
  const by = digger === t ? null : digger;
  const chute = fallCost(world, t, raw) > arsenal.fall.chuteOver && chutesOf(world, t) > 0;
  if (chute) {
    spendChute(world, t);
    events.push({ kind: 'fall', tank: t, dmg: 0, hp: t.hp, chute: true, under: false, by });
  } else {
    fallHurt(world, arsenal, t, raw, by, false, events);
  }
  if (onto && onto.hp > 0) fallHurt(world, arsenal, onto, raw, onto === digger ? null : digger, true, events);
  return chute;
}
/* The live units, lowest first (ties in seat order): a stack lands from the bottom up. */
function lowestFirst(tanks: readonly Tank[]): Tank[] {
  return tanks.filter(t => t.hp > 0)
    .map((t, i) => ({ t, i }))
    .sort((a, b) => (b.t.y - a.t.y) || (a.i - b.i))
    .map(o => o.t);
}
/* Lands every hanging unit at once and returns what the landings did. A last
   stand's blast can open more pits, so it settles until nothing moves. A unit
   that landed keeps `chute` (its parachute opened) until it lands again. */
export function settleFalls(world: World, arsenal: Arsenal): FallEvent[] {
  const events: FallEvent[] = [];
  for (let pass = 0; pass < 8; pass++) {
    let moved = false;
    for (const t of lowestFirst(world.tanks)) {
      if (t.hp <= 0) continue;
      const onto = unitBeneath(world.tanks, world.terrain, t);
      const rest = onto ? unitTop(onto) : surfY(world.terrain, t.x);
      t.vy = 0;
      if (Math.abs(rest - t.y) <= 0.5) { t.y = rest; t.fellBy = undefined; t.fellDepth = undefined; continue; }
      const drop = rest - t.y;
      t.y = rest;
      t.chute = false;
      moved = true;
      if (drop > 0) t.chute = land(world, arsenal, t, drop, onto, events);
      else { t.fellBy = undefined; t.fellDepth = undefined; }
    }
    if (!moved) break;
  }
  return events;
}
/* Arms the parachute of every hanging unit whose fall, as the ground lies
   now, would open one at the settle: it opens as the unit starts to drop. The
   settle decides; this only lets a solo match show the canopy from the first
   frame of the fall. */
export function armChutes(world: World, arsenal: Arsenal): void {
  for (const t of world.tanks) {
    if (t.hp <= 0 || t.chuteArmed) continue;
    const rest = restY(world.tanks, world.terrain, t);
    if (rest <= t.y + 0.5) continue;
    const raw = fallDamage(rest - t.y, arsenal.fall);
    if (raw > 0 && fallCost(world, t, raw) > arsenal.fall.chuteOver && chutesOf(world, t) > 0) t.chuteArmed = true;
  }
}
/** A volley's falls as the page shows them: what one landing did (the faller's
 *  fall, a wreck, the unit it landed on), shown when `tank` is seen to land. */
export interface FallShow { tank: Tank; events: FallEvent[] }
/* Settles a solo volley's falls (settleFalls) once its last shell is down and
   returns what they did, a batch per landing. Each unit keeps being drawn
   where it is (drawY) and falls on to its rest; a parachute the settle opened
   is armed for the fall; and the armor drawn stays what it was (shownHp)
   until its batch is shown (dueFalls). */
export function settleVolley(world: World, arsenal: Arsenal): FallShow[] {
  const drawn = world.tanks.map(t => t.drawY ?? t.y);
  const hp = world.tanks.map(t => t.hp);
  const events = settleFalls(world, arsenal);
  world.tanks.forEach((t, i) => {
    t.drawY = Math.abs(drawn[i]! - t.y) <= 0.5 ? undefined : drawn[i];
    if (t.chute) t.chuteArmed = true;
  });
  const shows: FallShow[] = [];
  for (const e of events) {
    if (e.kind === 'fall' && !e.under) shows.push({ tank: e.tank, events: [] });
    const show = shows[shows.length - 1];
    if (!show) continue;
    show.events.push(e);
    const i = world.tanks.indexOf(e.tank);
    if (i >= 0 && e.tank.shownHp === undefined) e.tank.shownHp = hp[i];
  }
  return shows;
}
/* The batches whose unit has been seen to land (or had landed already), and
   the rest; a shown batch's units show their real armor again. */
export function dueFalls(world: Pick<World, 'tanks' | 'terrain'>, pending: readonly FallShow[]): { due: FallShow[]; pending: FallShow[] } {
  const due: FallShow[] = [], rest: FallShow[] = [];
  for (const show of pending) {
    const t = show.tank;
    if ((t.drawY ?? t.y) < drawTarget(world, t) - 0.5) { rest.push(show); continue; }
    due.push(show);
    for (const e of show.events) e.tank.shownHp = undefined;
  }
  return { due, pending: rest };
}
/* Where t is drawn falling to: where it rests under the rules, or the ground
   under it while the rules still hold it hanging (a wreck: the ground). */
function drawTarget(world: Pick<World, 'tanks' | 'terrain'>, t: Tank): number {
  return t.hp > 0 ? restY(world.tanks, world.terrain, t) : surfY(world.terrain, t.x);
}
/* One frame of the falls' picture. Each unit's drawn height drops under
   gravity (at CHUTE_SPEED once an armed parachute opens, which it does as
   the unit starts to drop) to where it is drawn falling to, and stays there;
   a canopy is never open over a unit on its ground. Ground that rose takes
   it straight up. Returns the units that touched down this frame. */
export function fallTanks(world: Pick<World, 'tanks' | 'terrain'>, dt: number): Tank[] {
  const landed: Tank[] = [];
  for (const t of lowestFirst(world.tanks).concat(world.tanks.filter(u => u.hp <= 0))) {
    const gy = drawTarget(world, t);
    const at = t.drawY ?? t.y;
    if (at < gy - 0.5) {
      if (t.chuteArmed) t.chuteOpen = true;
      t.vy = t.chuteOpen ? CHUTE_SPEED : (t.vy || 0) + FALL_GRAVITY * dt;
      const y = Math.min(gy, at + t.vy * dt);
      if (y < gy - 0.5) { t.drawY = y; continue; }
      landed.push(t);
      t.chuteArmed = false;
      t.chute = false;
    }
    t.vy = 0;
    t.chuteOpen = false;
    t.drawY = Math.abs(gy - t.y) <= 0.5 ? undefined : gy;
  }
  return landed;
}
/* True while a fall is still owed or still playing: a live unit the rules
   hold over a pit, or a unit drawn above where it falls to. */
export function anyTankFalling(world: Pick<World, 'tanks' | 'terrain'>): boolean {
  return world.tanks.some(t => (t.hp > 0 && t.y < restY(world.tanks, world.terrain, t) - 0.5)
    || (t.drawY !== undefined && t.drawY < drawTarget(world, t) - 0.5));
}

/* ---------- drone bracketing memory (the AI proper is in ai.ts) ---------- */
/* A drone's bracket learns where its volley first burst. */
export function brkLand(owner: Tank, x: number): void {
  if (owner.brk && owner.brk.land === null) owner.brk.land = x;
}
