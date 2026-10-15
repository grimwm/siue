// The room volley replay without a browser. src/replay.ts plays recorded volleys
// through an environment of callbacks, so each case steps the replay on a clock
// the test moves by hand and checks what the room would show: the shell's place at
// fixed times against the path points the server recorded
// (protocol/play-after-fire.json), the blasts and hits at the moments the events
// say, the catch-up for a hidden tab, and the 3x replay of the volley it keeps.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createReplay, shellAt, shellVel, parsePath, PATH_HZ, FAST_SPEED } from '../src/replay.ts';
import { anyTankFalling, beamCarve, buildArsenal, carveCrater, fallTanks, fireBeam, fireWeapon, stepShells } from '../src/sim.ts';
import { applyEarth, digCarve, digHeading } from '../src/earth.ts';
import type { Replay, ReplayEnv, ReplayShot } from '../src/replay.ts';
import type { Arsenal, Gear, StepEvent, Tank, Weapon, World } from '../src/sim.ts';
import type { EarthOp } from '../src/earth.ts';
import type { BeamEvent, BurnEvent, HitEvent, RingEvent, RoomEvent, RoomSnapshot, ShotEvent } from '../src/protocol.ts';

/** Item `i` of a list the case reads, which must be there. */
function nth<T>(list: readonly T[], i: number): T {
  const v = list[i];
  assert.ok(v !== undefined, `no item ${i} of ${list.length}`);
  return v;
}
/** A value the case expects to be there (a find that must succeed). */
function must<T>(v: T | null | undefined, what: string): T {
  assert.ok(v !== null && v !== undefined, `no ${what}`);
  return v;
}
/** Point i of a recorded path, as [x, y]. */
const xy = (pts: number[][], i: number): [number, number] => { const q = nth(pts, i); return [nth(q, 0), nth(q, 1)]; };
type EventType = RoomEvent['t'];
/** An event as the cases write it: the replay never reads the room's running `seq`. */
type Unsequenced = { [K in EventType]: Omit<Extract<RoomEvent, { t: K }>, 'seq'> }[EventType];
const event = (e: Unsequenced): RoomEvent => e as RoomEvent;
// The fixtures below are deliberately partial: only what the replay, the fall and the guns read.
const snap = (room: Partial<RoomSnapshot>): RoomSnapshot => room as RoomSnapshot;
/** A unit as the host holds it: the replay finds it by seat. */
type HostTank = Tank & { seat: number; showA?: number; showP?: number };
const unit = <T extends Partial<HostTank>>(t: T): Tank & T => t as Tank & T;
/** These guns draw no random numbers, so the war has no rng. */
const warOf = (w: Omit<World, 'rng'>): World => w as World;
/** The host's env: the beam, ring, mark, earth and burn callbacks are set by the cases that need them. */
type Late = 'beam' | 'ring' | 'mark' | 'earth' | 'burn';
type HostEnv = Omit<ReplayEnv, Late> & Partial<Pick<ReplayEnv, Late>>;
const fullEnv = (env: HostEnv): ReplayEnv => env as ReplayEnv;
const table = (t: Record<string, string>) => (key: string): string | undefined => t[key];
/** game.json, as far as these cases read it. */
interface GameJson { arsenal: { ammo: Weapon[]; gear?: Gear[] } }
const arsenalOf = (game: GameJson): Arsenal => must(buildArsenal(game.arsenal), 'arsenal');

const fixture: RoomSnapshot = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'protocol', 'play-after-fire.json'), 'utf8')).body.room;
const EVENTS = fixture.events;
const byT = <K extends EventType>(t: K) => EVENTS.filter((e): e is Extract<RoomEvent, { t: K }> => e.t === t);
const shotA = nth(byT('shot'), 0), shotB = nth(byT('shot'), 1);

const near = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) < eps;

const DT = 1 / 64; // a binary fraction, so frame sums are exact

/** The path point at fractional index k, straight from the recorded string. */
function pathAt(shot: ShotEvent, k: number): [number, number] {
  const pts = shot.p.split(' ').map(s => s.split(',').map(Number));
  const i = Math.min(pts.length - 1, Math.floor(k)), j = Math.min(pts.length - 1, i + 1), f = k - i;
  return [xy(pts, i)[0] + (xy(pts, j)[0] - xy(pts, i)[0]) * f, xy(pts, i)[1] + (xy(pts, j)[1] - xy(pts, i)[1]) * f];
}

interface HostLog {
  events: RoomEvent[]; launches: number;
  blasts: { x: number; y: number; r: number; w: string }[];
  muzzles: { w: string; x: number; y: number; ang: number }[];
  specials: { w: string; name: string; x: number; y: number; ang: number }[];
  trails: { shot: ReplayShot; dt: number; x: number; y: number; vx: number; vy: number; w: string }[];
}
/** A host that records everything the replay asks of it. Tanks stand as the opening events say, so each aim is a still one. */
function makeHost() {
  const tanks: HostTank[] = [
    unit({ seat: 0, x: 251, y: 324, angle: 20, power: 45, hp: 100 }),
    unit({ seat: 1, x: 415.1, y: 342, angle: nth(byT('aifire'), 0).a, power: nth(byT('aifire'), 0).pw, hp: 100 }),
  ];
  const log: HostLog = { events: [], launches: 0, blasts: [], muzzles: [], specials: [], trails: [] };
  const env: HostEnv = {
    tank: seat => tanks.find(t => t.seat === seat),
    effect: table({ emp: 'emp' }),
    event: e => log.events.push(e),
    launch: () => { log.launches++; },
    blast: (x, y, r, w) => log.blasts.push({ x, y, r, w }),
    muzzle: (w, x, y, ang) => log.muzzles.push({ w, x, y, ang }),
    special: (w, name, x, y, ang) => log.specials.push({ w, name, x, y, ang }),
    trail: (shot, dt, x, y, vx, vy, w) => log.trails.push({ shot, dt, x, y, vx, vy, w }),
  };
  return { tanks, log, env };
}

/** Step `n` frames, returning the shells on screen after the last. */
function frames(rp: Replay, n: number) {
  for (let i = 0; i < n; i++) rp.step(DT);
  return rp.flying();
}

/* ---- the path helpers ---- */
{
  // shellAt reads only the shot's start time and landing spot.
  const s = { e: { t0: 0, x1: 9, y1: 9 } as ShotEvent, pts: parsePath('0,0 12,6 36,18') };
  await test('a path string parses to number pairs', () => { assert.ok(JSON.stringify(parsePath('1,2 3.5,4')) === '[[1,2],[3.5,4]]' && parsePath('').length === 0); });
  await test('shellAt interpolates between the points 1/12 s apart', () => { assert.ok(near(shellAt(s, 0.5 / PATH_HZ)[0], 6) && near(shellAt(s, 1.5 / PATH_HZ)[1], 12) && shellAt(s, 1.5 / PATH_HZ)[2] === 1); });
  await test('shellAt holds the last point after the path ends', () => { assert.ok(shellAt(s, 5)[0] === 36 && shellAt(s, -1)[0] === 0); });
  await test('shellAt of an empty path is the landing spot', () => { assert.ok(JSON.stringify(shellAt({ e: { t0: 0, x1: 9, y1: 8 } as ShotEvent, pts: [] }, 1)) === '[9,8,0]'); });
  await test('shellVel is the step to the next point at path rate', () => { assert.ok(JSON.stringify(shellVel(s, 0)) === '[144,72]' && JSON.stringify(shellVel(s, 2)) === '[0,0]'); });
}

/* ---- the host's volley: position at fixed times ---- */
{
  const host = makeHost();
  const rp = createReplay(fullEnv(host.env));
  await test('a new replay is idle', () => { assert.ok(rp.idle() && rp.queue.length === 0 && rp.shooter() === null && rp.flying().length === 0); });
  rp.push(EVENTS.slice(0, 4)); // round, fire, shot, hit
  await test('the queue holds what was pushed', () => { assert.ok(rp.queue.length === 4 && !rp.idle()); });
  rp.step(0);
  await test('the round event is logged at once and the volley starts', () => { assert.ok(host.log.events.length === 2 && nth(host.log.events, 1).t === 'fire' && rp.shooter() === host.tanks[0]!); });

  // The barrel is still (the fixture opener matches the tank), so the aim eases for 0.15 s.
  const aimFrames = Math.ceil(0.15 / DT);
  let shells = frames(rp, aimFrames - 1);
  await test('no shell flies while the barrel eases', () => { assert.ok(shells.length === 0 && host.log.launches === 0); });
  const t0Frames = aimFrames - 1;
  let tau = DT * t0Frames;
  const at = (ft: number) => {
    const want = Math.max(0, Math.round((ft + 0.15 - tau) / DT));
    shells = frames(rp, want);
    tau += want * DT;
    return { ft: tau - 0.15, shell: shells[0] };
  };
  for (const target of [0.1, 0.25, 0.5, 0.75, 1.0]) {
    const { ft, shell } = at(target);
    const [x, y] = pathAt(shotA, ft * PATH_HZ);
    await test(`the shell is on the recorded path ${ft.toFixed(4)} s into flight`, () => { assert.ok(shell && near(shell.x, x) && near(shell.y, y) && shell.wkey === 'shell', shell ? `${shell.x},${shell.y} vs ${x},${y}` : 'no shell'); });
  }
  const exact = at(0.5);
  const pts = shotA.p.split(' ').map(s => s.split(',').map(Number));
  const k = exact.ft * PATH_HZ, i = Math.floor(k);
  await test('its velocity is the path step at path rate', () => { assert.ok(near(must(exact.shell, 'shell').vx, (xy(pts, i + 1)[0] - xy(pts, i)[0]) * PATH_HZ) && near(must(exact.shell, 'shell').vy, (xy(pts, i + 1)[1] - xy(pts, i)[1]) * PATH_HZ)); });
  await test('the launch sounded once and the muzzle flashed at the barrel', () => { assert.ok(host.log.launches === 1 && host.log.muzzles.length === 1
    && nth(host.log.muzzles, 0).w === 'shell' && nth(host.log.muzzles, 0).x === xy(pts, 0)[0] && nth(host.log.muzzles, 0).y === xy(pts, 0)[1]); });
  await test('the trail dripped along the path with the frame time', () => { assert.ok(host.log.trails.length > 0 && host.log.trails.every(t => t.dt === DT && t.w === 'shell') && nth(host.log.trails, 0).shot.e === shotA); });
  await test('nothing has landed yet', () => { assert.ok(host.log.blasts.length === 0 && host.tanks[1]!.hp === 100); });

  // Landing at t1 = 1.15: the blast, then the hit's damage and log line.
  while (rp.flying().length) rp.step(DT);
  await test('the shell lands where the server said, with its radius', () => { assert.ok(host.log.blasts.length === 1
    && nth(host.log.blasts, 0).x === shotA.x1 && nth(host.log.blasts, 0).y === shotA.y1 && nth(host.log.blasts, 0).r === shotA.r && nth(host.log.blasts, 0).w === 'shell'); });
  await test('it was not drawn after landing', () => { assert.ok(rp.flying().length === 0); });
  const hit = nth(byT('hit'), 0);
  await test('the hit took its damage when its time came', () => { assert.ok(host.tanks[1]!.hp === 100 - hit.dmg && host.log.events.some(e => e.t === 'hit')); });
  let guard = 0;
  while (!rp.idle() && guard++ < 1000) rp.step(DT);
  await test('the volley ends and the replay goes idle', () => { assert.ok(rp.idle() && rp.shooter() === null && guard < 1000); });
  await test('shot events are flown, never logged', () => { assert.ok(!host.log.events.some(e => e.t === 'shot')); });
}

/* ---- the whole fixture, in order ---- */
{
  const host = makeHost();
  const rp = createReplay(fullEnv(host.env));
  rp.push(EVENTS);
  let t = 0;
  while (!rp.idle() && t < 20) { rp.step(DT); t += DT; }
  await test('both volleys play out', () => { assert.ok(rp.idle() && host.log.blasts.length === 2 && host.log.launches === 2, `${host.log.blasts.length} blasts`); });
  await test('their log lines come in the server order', () => { assert.ok(host.log.events.map(e => e.t).join() === 'round,fire,hit,aifire'); });
  await test('the second blast is the drone shell\'s landing', () => { assert.ok(nth(host.log.blasts, 1).x === shotB.x1 && nth(host.log.blasts, 1).y === shotB.y1); });
  // 0.15 s aim + the later of the shot landings (1.983) + 0.6 s tail, per volley; the second volley starts the frame the first one ends.
  await test('the two volleys take their recorded time', () => { assert.ok(t > (0.15 + 1.15 + 0.6) + (0.15 + 1.983 + 0.6) - 0.1 && t < 5.5, `${t}`); });
}

/* ---- aim easing: a tank that must swing waits for its barrel ---- */
{
  const host = makeHost();
  host.tanks[0]!.angle = 62; host.tanks[0]!.power = 55; host.tanks[0]!.x = 200; // opener: 20 degrees, 45 power, x 251
  const rp = createReplay(fullEnv(host.env));
  rp.push(EVENTS.slice(1, 3));
  rp.step(0);
  const swing = Math.max(42, 10, 51);
  const aimDur = Math.min(1.4, Math.max(0.5, 0.45 + swing / 110));
  const half = Math.floor((aimDur / 2) / DT);
  frames(rp, half);
  const u = half * DT / aimDur, e = u * u * (3 - 2 * u);
  await test('the barrel eases (smoothstep) toward the shot\'s aim', () => { assert.ok(near(host.tanks[0]!.angle, 62 + (20 - 62) * e, 0.05) && host.tanks[0]!.showA === host.tanks[0]!.angle); });
  await test('no shell leaves until the barrel is there', () => { assert.ok(host.log.launches === 0); });
  frames(rp, Math.ceil(aimDur / DT));
  await test('then the barrel rests at the recorded aim and the shell is off', () => { assert.ok(near(host.tanks[0]!.angle, 20) && near(host.tanks[0]!.power, 45) && near(host.tanks[0]!.x, 251) && host.log.launches === 1); });
}

/* ---- catch-up ---- */
{
  const host = makeHost();
  const rp = createReplay(fullEnv(host.env));
  rp.push(EVENTS);
  const turnIsDrone = snap({ phase: 'play', turn: 1 });
  const skipped = rp.catchUp(turnIsDrone, 0);
  await test('a catch-up with two volleys waiting skips the first', () => { assert.ok(skipped && skipped.map(e => e.t).join() === 'round,fire,shot,hit', skipped?.map(e => e.t).join()); });
  await test('the newest volley stays queued', () => { assert.ok(rp.queue.length === 2 && nth(rp.queue, 0).t === 'aifire'); });
  await test('the skipped events are for the caller to log; the replay logs none', () => { assert.ok(host.log.events.length === 0); });
  await test('a lone volley is not caught up', () => { assert.ok(rp.catchUp(turnIsDrone, 0) === null); });

  // The kept volley plays at three times speed.
  rp.step(0);
  await test('the kept volley starts', () => { assert.ok(rp.shooter() === host.tanks[1]!); });
  const aimFrames = Math.ceil(0.15 / (DT * FAST_SPEED));
  frames(rp, aimFrames - 1);
  let tau = DT * FAST_SPEED * (aimFrames - 1);
  const check3 = async (wallFrames: number, label: string) => {
    const shells = frames(rp, wallFrames);
    tau += wallFrames * DT * FAST_SPEED;
    const ft = tau - 0.15;
    const [x, y] = pathAt(shotB, ft * PATH_HZ);
    await test(label, () => { assert.ok(shells.length === 1 && near(nth(shells, 0).x, x) && near(nth(shells, 0).y, y), shells[0] ? `${shells[0].x},${shells[0].y} vs ${x},${y}` : 'no shell'); });
    return ft;
  };
  const f1 = await check3(8, 'at 3x, the drone shell is on its recorded path');
  const f2 = await check3(8, 'and still on it 8 frames later');
  await test('flight time ran at three times the wall clock', () => { assert.ok(near(f2 - f1, 8 * DT * 3)); });
  let wall = 0;
  while (rp.flying().length) { rp.step(DT); wall += DT; }
  await test('it lands, at three times speed, where the server said', () => { assert.ok(host.log.blasts.length === 1 && nth(host.log.blasts, 0).x === shotB.x1
    && nth(host.log.blasts, 0).y === shotB.y1 && wall < (shotB.t1 / 3) + 0.2, `${wall}`); });
  let guard = 0;
  while (!rp.idle() && guard++ < 2000) rp.step(DT);
  await test('the kept volley finishes and the replay idles', () => { assert.ok(rp.idle()); });

  // The fast flag is spent: the next volley plays at real speed.
  rp.push(EVENTS.slice(4));
  rp.step(0);
  frames(rp, Math.ceil(0.15 / DT) + 16);
  const slow = rp.flying()[0];
  const ft = (Math.ceil(0.15 / DT) + 16) * DT - 0.15;
  const [x, y] = pathAt(shotB, ft * PATH_HZ);
  await test('a later volley plays at 1x again', () => { assert.ok(slow && near(slow.x, x, 1e-6) && near(slow.y, y, 1e-6), slow ? `${slow.x} vs ${x}` : 'no shell'); });

  // It is already the player's turn: skip every volley.
  const mine = makeHost();
  const r2 = createReplay(fullEnv(mine.env));
  r2.push(EVENTS);
  const all = r2.catchUp(snap({ phase: 'play', turn: 0 }), 0);
  await test('when the next turn is ours, every volley is skipped and nothing plays fast', () => { assert.ok(all); assert.ok(all.length === EVENTS.length && r2.idle()); });
  r2.push(EVENTS.slice(1, 3));
  r2.step(0);
  frames(r2, Math.ceil(0.15 / DT) + 16);
  const s2 = r2.flying()[0];
  const ft2 = (Math.ceil(0.15 / DT) + 16) * DT - 0.15;
  const [x2] = pathAt(shotA, ft2 * PATH_HZ);
  await test('the next volley after that plays at real speed', () => { assert.ok(s2 && near(s2.x, x2, 1e-6)); });

  // A volley on screen counts as waiting.
  const mid = makeHost();
  const r3 = createReplay(fullEnv(mid.env));
  r3.push(EVENTS.slice(1, 4));
  r3.step(0);
  frames(r3, 20);
  r3.push(EVENTS.slice(4));
  const dropped = r3.catchUp(snap({ phase: 'play', turn: 1 }), 0);
  await test('the volley on screen is dropped for the newer one', () => { assert.ok(dropped && dropped.length === 0 && r3.shooter() === null && r3.flying().length === 0 && nth(r3.queue, 0).t === 'aifire', dropped ? dropped.map(e => e.t).join() : 'null'); });
}

/* ---- clear ---- */
{
  const host = makeHost();
  const rp = createReplay(fullEnv(host.env));
  rp.push(EVENTS);
  rp.step(DT);
  rp.clear();
  await test('clear forgets the queue and the volley', () => { assert.ok(rp.idle() && rp.shooter() === null && rp.flying().length === 0); });
}

/* ---- drones fighting on with no human standing: the volley plays at 3x ---- */
{
  const wallFrames = (events: RoomEvent[]) => {
    const host = makeHost();
    const rp = createReplay(fullEnv(host.env));
    rp.push(events);
    let n = 0;
    while (n < 5000) { rp.step(DT); n++; if (rp.idle()) break; }
    return { n, host };
  };
  const volley = EVENTS.filter(e => e.t !== 'round').slice(0, 3); // opener, shot, hit
  const normal = wallFrames(volley.map(e => ({ ...e })));
  const watched = wallFrames(volley.map((e, i) => (i === 0 ? { ...e, watch: true } : { ...e })));
  await test('a watch volley still plays every event', () => { assert.ok(watched.host.log.events.length === normal.host.log.events.length
    && watched.host.log.launches === normal.host.log.launches && watched.host.log.blasts.length === normal.host.log.blasts.length); });
  await test('a watch volley plays in a third of the frames', () => { assert.ok(Math.abs(watched.n - normal.n / FAST_SPEED) <= 2, `normal ${normal.n} watched ${watched.n}`); });
  // The next volley is back to normal speed: watch is per volley, not sticky.
  const host = makeHost();
  const rp = createReplay(fullEnv(host.env));
  const opener = nth(volley, 0);
  assert.ok(opener.t === 'fire' || opener.t === 'aifire' || opener.t === 'auto', opener.t);
  rp.push([{ ...opener, watch: true }, ...volley.slice(1), ...volley.map(e => ({ ...e }))]);
  let n = 0, firstDone = 0;
  while (n < 5000) { rp.step(DT); n++; if (!firstDone && host.log.events.filter(e => e.t === 'fire').length === 2) firstDone = n; if (rp.idle()) break; }
  await test('the volley after a watch volley plays at normal speed', () => { assert.ok(Math.abs((n - firstDone) - normal.n) <= 3, `${n - firstDone} vs ${normal.n}`); });
}


/* ---- a hop gun's leaps and a scatter gun's bomblets play their special once per burst ---- */
{
  const host = makeHost();
  host.env.effect = table({ leapfrog: 'hop', funky: 'scatter' });
  const rp = createReplay(fullEnv(host.env));
  const shot = (w: string, t0: number, t1: number, p: string, r: number) => {
    const pts = parsePath(p), [x0, y0] = nth(pts, 0), [x1, y1] = nth(pts, pts.length - 1);
    return event({ t: 'shot', by: 0, w, x0, y0, x1, y1, t0, t1, r, p, at: t0 });
  };
  rp.push([
    event({ t: 'fire', seat: 0, w: 'leapfrog', x: 251, a: 20, pw: 45, at: 0 }),
    shot('leapfrog', 0, 0.5, '270,324 300,320 330,326', 26),
    shot('leapfrog', 0.5, 1, '330,325 345,318 360,326', 22),
    shot('leapfrog', 1, 1.5, '360,325 368,320 376,326', 22),
  ]);
  for (let i = 0; i < 200 && !rp.idle(); i++) rp.step(DT);
  const hops = host.log.specials.filter(s => s.name === 'hop');
  await test('each leap of a hop gun plays its hop special at the leap', () => { assert.ok(hops.length === 2 && nth(hops, 0).x === 330 && nth(hops, 0).y === 325
    && nth(hops, 1).x === 360 && hops.every(s => s.w === 'leapfrog' && s.ang < 0), JSON.stringify(hops)); });
  await test('a hop gun\'s first shot leaves the barrel with a muzzle flash, its leaps do not', () => { assert.ok(host.log.muzzles.length === 1); });

  host.log.specials.length = 0;
  rp.push([
    event({ t: 'fire', seat: 0, w: 'funky', x: 251, a: 20, pw: 45, at: 0 }),
    shot('funky', 0, 0.5, '270,324 300,320 330,326', 24),
    ...[-30, -10, 10, 30].map(dx => shot('funky', 0.5, 1, `330,324 ${330 + dx / 2},300 ${330 + dx},326`, 18)),
  ]);
  for (let i = 0; i < 200 && !rp.idle(); i++) rp.step(DT);
  const scatters = host.log.specials.filter(s => s.name === 'scatter');
  await test('a scatter gun\'s bomblets play the scatter special once, straight up from the burst', () => { assert.ok(scatters.length === 1
    && nth(scatters, 0).x === 330 && nth(scatters, 0).y === 324 && near(nth(scatters, 0).ang, -Math.PI / 2), JSON.stringify(scatters)); });
}

/* ---- a parachute armed by its volley opens when the unit's ground goes, in real frames ---- */
{
  const host = makeHost();
  const rp = createReplay(fullEnv(host.env));
  const fire = nth(byT('fire'), 0);
  const terrain: number[] = new Array(720).fill(0).map((_, x) => (x < 360 ? 324 : 342));
  const world = { tanks: host.tanks, terrain };
  rp.push([fire, event({ t: 'fall', seat: 1, dmg: 0, by: 0, chute: true, under: false, at: 0.8 })]);
  rp.step(0);
  await test('a chute fall arms its parachute as the volley starts, and opens nothing', () => { assert.ok(host.tanks[1]!.chuteArmed === true && !host.tanks[1]!.chuteOpen && !host.tanks[0]!.chuteArmed); });
  let atRest = 0;
  for (let f = 0; f < 60; f++) { rp.step(DT); fallTanks(world, DT); if (host.tanks[1]!.chuteOpen) atRest++; }
  await test('no canopy over the unit while its ground holds', () => { assert.ok(atRest === 0 && host.tanks[1]!.drawY === undefined && host.tanks[1]!.y === 342, `${atRest}`); });
  // The replay carves the pit: the unit floats down under the canopy, and folds it on the floor.
  for (let x = 395; x <= 435; x++) terrain[x] = 462;
  let falling = 0, open = 0, last = host.tanks[1]!.y;
  for (let f = 0; f < 2000 && anyTankFalling(world); f++) {
    rp.step(DT);
    fallTanks(world, DT);
    const now = host.tanks[1]!.drawY ?? host.tanks[1]!.y;
    if (now > last && now < 461.5) { falling++; if (host.tanks[1]!.chuteOpen) open++; }
    last = now;
  }
  await test('under the canopy every frame it falls', () => { assert.ok(falling > 30 && open === falling, `${open} of ${falling}`); });
  let rested = 0;
  for (let f = 0; f < 30; f++) { fallTanks(world, DT); if (host.tanks[1]!.chuteOpen) rested++; }
  await test('no canopy once it rests', () => { assert.ok(rested === 0 && !host.tanks[1]!.chuteArmed); });
  const plain = makeHost();
  const rp2 = createReplay(fullEnv(plain.env));
  rp2.push([fire, event({ t: 'fall', seat: 1, dmg: 12, by: 0, chute: false, under: false, at: 0.8 })]);
  rp2.step(0);
  await test('a fall without a parachute arms none', () => { assert.ok(!plain.tanks[1]!.chuteArmed); });
}

/* ---- guns with no flight, and tracers ---- */
{
  // A beam: the server's event, at the volley's start, carves the client's
  // hills exactly as the war's own beam does (sim.ts beamCarve on the
  // event's line), and each unit it hits shows the beam passing through.
  const GAME: GameJson = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
  const arsenal = arsenalOf(GAME);
  const BEAM = must(GAME.arsenal.ammo.find(a => a.effect === 'beam'), 'beam').key;
  const RING = must(GAME.arsenal.ammo.find(a => a.effect === 'plasma'), 'plasma').key;
  const TRACER = must(GAME.arsenal.ammo.find(a => a.effect === 'tracer'), 'tracer').key;
  const hills = () => Array.from({ length: 720 }, (_, x) => (x >= 200 && x <= 280 ? 320 : 400));
  const gunner: Tank = { id: 'P', isPlayer: true, x: 100, y: 400, angle: 14, power: 100, hp: 100, fuel: 80, dirS: 1 };
  const war = warOf({ tanks: [gunner, unit({ id: 'D', isPlayer: false, x: 600, y: 400, hp: 100, fuel: 80 })], terrain: hills(), wind: 0, round: 1, shells: [],
    score: 0, cash: 0, ammo: {}, selected: 'shell', shield: false, bunker: 0, laststand: false, jammer: 0 });
  const shot = fireBeam(war, arsenal, gunner, BEAM);
  const host = makeHost();
  const terrain = hills();
  const beams: BeamEvent[] = [];
  host.env.effect = w => GAME.arsenal.ammo.find(a => a.key === w)?.effect;
  host.env.beam = e => { beams.push(e); beamCarve(terrain, e.x0, e.y0, e.x1, e.y1, must(arsenal.weapons[e.w], e.w).radius); };
  host.env.ring = () => {};
  host.env.mark = () => {};
  const rp = createReplay(fullEnv(host.env));
  const beamEv = event({ t: 'beam', by: 0, w: BEAM, x0: shot.x0, y0: shot.y0, x1: shot.x1, y1: shot.y1, at: 0 });
  rp.push([event({ t: 'fire', seat: 0, w: BEAM, x: 251, a: 20, pw: 45, at: 0 }), beamEv, event({ t: 'hit', seat: 1, dmg: 45, by: 0, direct: false, at: 0 })]);
  rp.step(0);
  await test('a beam waits for the barrel to ease, as a shot does', () => { assert.ok(beams.length === 0); });
  for (let i = 0; i < 200 && !rp.idle(); i++) rp.step(DT);
  await test('a beam event plays once and carves the client terrain exactly as fireBeam did', () => { assert.ok(beams.length === 1 && nth(beams, 0) === beamEv
    && JSON.stringify(terrain) === JSON.stringify(war.terrain) && JSON.stringify(terrain) !== JSON.stringify(hills())); });
  await test('the beam and its line are flown by the replay, not logged as events', () => { assert.ok(!host.log.events.some(e => e.t === 'beam')); });
  const through = host.log.specials.filter(s => s.name === 'pierce');
  await test('a drone the beam hits shows it passing through its body, up in the air', () => { assert.ok(through.length === 1 && nth(through, 0).y === host.tanks[1]!.y - 30, JSON.stringify(through)); });
  await test('a unit the beam hits shows it passing through, along the beam', () => { assert.ok(through.length === 1 && nth(through, 0).w === BEAM
    && near(nth(through, 0).ang, Math.atan2(shot.y1 - shot.y0, shot.x1 - shot.x0)), JSON.stringify(through)); });

  // A hit another seat owns (a last-stand blast the beam's victim set off) is not the beam passing.
  const piercedBefore = host.log.specials.filter(s => s.name === 'pierce').length;
  rp.push([event({ t: 'fire', seat: 0, w: BEAM, x: 251, a: 20, pw: 45, at: 0 }), { ...beamEv, at: 0 }, event({ t: 'hit', seat: 1, dmg: 5, by: 0, direct: true, at: 0 }), event({ t: 'hit', seat: 0, dmg: 5, by: 1, direct: false, at: 0 })]);
  for (let i = 0; i < 200 && !rp.idle(); i++) rp.step(DT);
  await test('only the beam owner\'s hits draw a pierce', () => { assert.ok(host.log.specials.filter(s => s.name === 'pierce').length === piercedBefore + 1, JSON.stringify(host.log.specials)); });

  // A ring: played once at its moment; no shot, no blast disc.
  const rings: RingEvent[] = [];
  host.env.ring = e => rings.push(e);
  rp.push([event({ t: 'aifire', seat: 1, w: RING, x: 415.1, a: host.tanks[1]!.angle, pw: 100, at: 0 }), event({ t: 'ring', by: 1, w: RING, x: 415.1, y: 312, r: 90, at: 0 })]);
  for (let i = 0; i < 200 && !rp.idle(); i++) rp.step(DT);
  await test('a ring event plays once', () => { assert.ok(rings.length === 1 && nth(rings, 0).r === 90); });

  // A tracer: its shot lands with radius 0 and leaves a mark, no blast.
  const marks: ReplayShot[] = [];
  host.env.mark = s => marks.push(s);
  const blasts = host.log.blasts.length;
  rp.push([event({ t: 'fire', seat: 0, w: TRACER, x: 251, a: 20, pw: 45, at: 0 }),
    event({ t: 'shot', by: 0, w: TRACER, x0: 270, y0: 320, x1: 330, y1: 326, t0: 0, t1: 0.5, r: 0, p: '270,320 300,310 330,326', at: 0 })]);
  for (let i = 0; i < 200 && !rp.idle(); i++) rp.step(DT);
  await test('a tracer lands with its mark and no blast', () => { assert.ok(marks.length === 1 && nth(marks, 0).e.w === TRACER && host.log.blasts.length === blasts); });
}

/* ---- the server's own beam and ring volleys (protocol/play-after-beam.json, play-after-ring.json) ---- */
const served: [string, 'beam' | 'ring'][] = [['play-after-beam.json', 'beam'], ['play-after-ring.json', 'ring']];
for (const [file, t] of served) {
  const evs: RoomEvent[] = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'protocol', file), 'utf8')).body.room.events;
  const at = evs.findIndex(e => e.t === t);
  const own = evs[at], next = evs[at + 1];
  await test(`${file}: the ${t} is followed by its hit on the drone at the same moment`, () => { assert.ok(own && next && next.t === 'hit' && next.seat === 1 && next.by === 0
    && next.at === own.at && own.at === 0 && !evs.slice(0, evs.findIndex(e => e.t === 'aifire')).some(e => e.t === 'shot'), JSON.stringify(evs.slice(at, at + 3))); });
  const host = makeHost();
  const seen: string[] = [];
  host.env.effect = () => undefined;
  host.env.beam = e => seen.push(e.t);
  host.env.ring = e => seen.push(e.t);
  host.env.mark = () => {};
  const rp = createReplay(fullEnv(host.env));
  rp.push(evs.slice(evs.findIndex(e => e.t === 'fire'), evs.findIndex(e => e.t === 'aifire')));
  for (let i = 0; i < 400 && !rp.idle(); i++) rp.step(DT);
  await test(`${file}: the replay plays the ${t} once and logs its hit`, () => { assert.ok(seen.length === 1 && nth(seen, 0) === t && host.log.events.some(e => e.t === 'hit')); });
}

/* ---- the earth guns: each event moves the client's ground exactly as the war's own shot did ---- */
{
  const GAME: GameJson = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
  const arsenal = arsenalOf(GAME);
  const earthGuns = GAME.arsenal.ammo.filter(a => ['dirt', 'pour', 'dig', 'riot', 'slump'].includes(a.effect));
  const hills = (): number[] => Array.from({ length: 720 }, (_, x) => 380 + 50 * Math.sin(x / 30) + (x > 300 && x < 340 ? -40 : 0));
  for (const w of earthGuns) {
    const gunner: Tank = { id: 'P', isPlayer: true, x: 120, y: 0, angle: 40, power: 62, hp: 500, fuel: 80, dirS: 1 };
    const war = warOf({ tanks: [gunner, unit({ id: 'D', isPlayer: false, x: 600, y: 0, hp: 500, fuel: 80 })], terrain: hills(), wind: 0, round: 1, shells: [],
      score: 0, cash: 0, ammo: { [w.key]: 3 }, selected: w.key, shield: false, bunker: 0, laststand: false, jammer: 0 });
    for (const t of war.tanks) t.y = war.terrain[t.x]!;
    // The wire events the war's shot makes: earth ops as they are, a dig's warheads as bursts at their exact points.
    type DigStart = { t: 'dig0'; x: number; y: number; ang: number };
    const wire: (EarthOp | DigStart | { t: 'crater'; x: number; y: number; r: number })[] = [];
    const take = (evs: StepEvent[]) => {
      for (const e of evs) {
        if (e.kind === 'earth') wire.push({ ...e.op });
        else if (e.kind === 'dig' && e.step === 0) wire.push({ t: 'dig0', x: e.x, y: e.y, ang: e.ang });
        else if (e.kind === 'blast' && w.effect === 'dig') wire.push({ t: 'crater', x: e.blast.x, y: e.blast.y, r: e.blast.r });
      }
    };
    const launch = must(fireWeapon(war, arsenal, gunner, w.key), 'launch');
    take(launch.now);
    let steps = 0;
    for (let f = 0; war.shells.length && f < 5000; f++) {
      const before = war.shells.find(s => s.digging);
      take(stepShells(war, arsenal, 1 / 60));
      if (before) steps = must(before.dl, 'dl');
    }
    const terrain = hills();
    for (const e of wire) {
      if (e.t === 'dig0') applyEarth(terrain, { t: 'dig', w: w.key, x: e.x, y: e.y, ux: Math.cos(e.ang), uy: Math.sin(e.ang), n: 0, r: must(w.digR, 'digR') });
      else if (e.t === 'crater') carveCrater(terrain, e.x, e.y, e.r, 456);
      else applyEarth(terrain, e);
    }
    if (w.effect === 'dig') {
      const start = must(wire.find((e): e is DigStart => e.t === 'dig0'), 'dig0');
      const shell = { vx: Math.cos(start.ang), vy: Math.sin(start.ang) };
      const [ux, uy] = digHeading(shell.vx, shell.vy);
      digCarve(terrain, start.x, start.y, ux, uy, steps, must(w.digR, 'digR'));
    }
    await test(`${w.key}: replaying its events moves the client's ground to exactly the war's`, () => { assert.ok(JSON.stringify(terrain) === JSON.stringify(war.terrain)
      && JSON.stringify(terrain) !== JSON.stringify(hills()), `${wire.map(e => e.t).join()} steps ${steps}`); });
  }
}

/* ---- the server's own earth volleys (protocol/play-after-earth.json) ---- */
{
  const evs: RoomEvent[] = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'protocol', 'play-after-earth.json'), 'utf8')).body.room.events;
  const host = makeHost();
  const seen: string[] = [];
  host.env.effect = () => undefined;
  host.env.beam = () => {};
  host.env.ring = () => {};
  host.env.mark = () => {};
  host.env.earth = e => seen.push(e.t);
  const rp = createReplay(fullEnv(host.env));
  rp.push(evs.slice(evs.findIndex(e => e.t === 'fire')));
  for (let i = 0; i < 4000 && !rp.idle(); i++) rp.step(DT);
  await test('play-after-earth.json: the replay plays each earth event once, in order', () => { assert.ok(seen.join() === 'dig,dirt,pour,riot,slump', seen.join()); });
  await test('play-after-earth.json: no earth event is logged as a plain event', () => { assert.ok(!host.log.events.some(e => ['dig', 'dirt', 'pour', 'riot', 'slump'].includes(e.t))); });
  const dig = evs.findIndex(e => e.t === 'dig');
  await test('play-after-earth.json: a dig comes before its warheads\' bursts, which follow in time order', () => {
    // `at` is optional on the wire; Number() keeps a missing one failing the comparison as before.
    const d = nth(evs, dig), b1 = nth(evs, dig + 1), b2 = nth(evs, dig + 2);
    assert.ok(d.t === 'dig');
    assert.ok(b1.t === 'burst' && Number(b1.at) >= Number(d.at)
    && Number(b2.at) >= Number(b1.at) && d.t1 >= Number(d.at)); });
}

/* ---- the replay's speed, for what plays beside it (a trench cut step by step) ---- */
{
  const host = makeHost();
  host.env.effect = () => undefined;
  host.env.beam = () => {};
  host.env.ring = () => {};
  host.env.mark = () => {};
  host.env.earth = () => {};
  const rp = createReplay(fullEnv(host.env));
  await test('an idle replay plays at 1', () => { assert.ok(rp.speed() === 1); });
  rp.push([event({ t: 'aifire', seat: 1, w: 'shell', x: 400, a: 45, pw: 50, at: 0, watch: true }), event({ t: 'fizzle', by: 1, w: 'shell', at: 0.5 })]);
  rp.step(DT);
  await test('a watched or caught-up volley plays at FAST_SPEED', () => { assert.ok(rp.speed() === FAST_SPEED); });
}

/* ---- the server's own napalm volley (protocol/play-after-burn.json) ---- */
{
  const evs: RoomEvent[] = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'protocol', 'play-after-burn.json'), 'utf8')).body.room.events;
  const host = makeHost();
  const lit: { e: BurnEvent; t: number }[] = [];
  let t = 0, closed: number | null = null;
  host.env.effect = () => undefined;
  host.env.beam = () => {};
  host.env.ring = () => {};
  host.env.mark = () => {};
  host.env.earth = () => {};
  host.env.burn = e => lit.push({ e, t });
  const rp = createReplay(fullEnv(host.env));
  const from = evs.findIndex(e => e.t === 'fire'), next = evs.findIndex(e => e.t === 'aifire');
  rp.push(evs.slice(from, next));
  for (let i = 0; i < 4000 && !rp.idle(); i++) {
    rp.step(DT);
    t += DT;
    if (closed === null && rp.idle()) closed = t;
  }
  const burn = must(evs.find((e): e is BurnEvent => e.t === 'burn'), 'burn');
  const hits = host.log.events.filter((e): e is HitEvent => e.t === 'hit');
  await test('play-after-burn.json: the replay lights the pool once, with the server\'s numbers', () => { assert.ok(lit.length === 1 && nth(lit, 0).e === burn && burn.x0 <= burn.x1, JSON.stringify(lit.map(l => l.e))); });
  await test('play-after-burn.json: the burn is not logged as a plain event', () => { assert.ok(!host.log.events.some(e => e.t === 'burn')); });
  await test('play-after-burn.json: every tick\'s hit plays, each after the pool lit', () => { assert.ok(hits.length === evs.filter(e => e.t === 'hit').length && hits.length > 1
    && hits.every(h => Number(h.at) > Number(burn.at) && Number(h.at) <= burn.t1)); });
  await test('play-after-burn.json: the volley stays open until the last tick has burned', () => { assert.ok(closed !== null && closed >= burn.t1, `${closed} vs ${burn.t1}`); });
  await test('play-after-burn.json: the shot has no blast (r 0) and the ground does not change', () => { assert.ok(must(evs.find((e): e is ShotEvent => e.t === 'shot' && e.by === 0), 'shot').r === 0
    && !evs.some(e => ['dirt', 'pour', 'dig', 'riot', 'slump', 'burst'].includes(e.t))); });
}
