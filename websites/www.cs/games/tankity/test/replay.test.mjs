// The room volley replay without a browser. src/replay.ts plays recorded volleys
// through an environment of callbacks, so each case steps the replay on a clock
// the test moves by hand and checks what the room would show: the shell's place at
// fixed times against the path points the server recorded
// (protocol/play-after-fire.json), the blasts and hits at the moments the events
// say, the catch-up for a hidden tab, and the 3x replay of the volley it keeps.
import { check } from '../../_kit/test/check.ts';
import fs from 'node:fs';
import path from 'node:path';
import { createReplay, shellAt, shellVel, parsePath, PATH_HZ, FAST_SPEED } from '../src/replay.ts';
import { anyTankFalling, beamCarve, buildArsenal, carveCrater, fallTanks, fireBeam, fireWeapon, stepShells } from '../src/sim.ts';
import { applyEarth, digCarve, digHeading } from '../src/earth.ts';

const fixture = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'protocol', 'play-after-fire.json'), 'utf8')).body.room;
const EVENTS = fixture.events;
const byT = t => EVENTS.filter(e => e.t === t);
const [shotA, shotB] = byT('shot');

const near = (a, b, eps = 1e-9) => Math.abs(a - b) < eps;

const DT = 1 / 64; // a binary fraction, so frame sums are exact

/** The path point at fractional index k, straight from the recorded string. */
function pathAt(shot, k) {
  const pts = shot.p.split(' ').map(s => s.split(',').map(Number));
  const i = Math.min(pts.length - 1, Math.floor(k)), j = Math.min(pts.length - 1, i + 1), f = k - i;
  return [pts[i][0] + (pts[j][0] - pts[i][0]) * f, pts[i][1] + (pts[j][1] - pts[i][1]) * f];
}

/** A host that records everything the replay asks of it. Tanks stand as the opening events say, so each aim is a still one. */
function makeHost() {
  const tanks = [
    { seat: 0, x: 251, y: 324, angle: 20, power: 45, hp: 100 },
    { seat: 1, x: 415.1, y: 342, angle: byT('aifire')[0].a, power: byT('aifire')[0].pw, hp: 100 },
  ];
  const log = { events: [], launches: 0, blasts: [], muzzles: [], specials: [], trails: [] };
  const env = {
    tank: seat => tanks.find(t => t.seat === seat),
    effect: wkey => ({ emp: 'emp', lance: 'pierce' })[wkey],
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
function frames(rp, n) {
  for (let i = 0; i < n; i++) rp.step(DT);
  return rp.flying();
}

/* ---- the path helpers ---- */
{
  const s = { e: { t0: 0, x1: 9, y1: 9 }, pts: parsePath('0,0 12,6 36,18') };
  check('a path string parses to number pairs', JSON.stringify(parsePath('1,2 3.5,4')) === '[[1,2],[3.5,4]]' && parsePath('').length === 0);
  check('shellAt interpolates between the points 1/12 s apart', near(shellAt(s, 0.5 / PATH_HZ)[0], 6) && near(shellAt(s, 1.5 / PATH_HZ)[1], 12) && shellAt(s, 1.5 / PATH_HZ)[2] === 1);
  check('shellAt holds the last point after the path ends', shellAt(s, 5)[0] === 36 && shellAt(s, -1)[0] === 0);
  check('shellAt of an empty path is the landing spot', JSON.stringify(shellAt({ e: { t0: 0, x1: 9, y1: 8 }, pts: [] }, 1)) === '[9,8,0]');
  check('shellVel is the step to the next point at path rate', JSON.stringify(shellVel(s, 0)) === '[144,72]' && JSON.stringify(shellVel(s, 2)) === '[0,0]');
}

/* ---- the host's volley: position at fixed times ---- */
{
  const host = makeHost();
  const rp = createReplay(host.env);
  check('a new replay is idle', rp.idle() && rp.queue.length === 0 && rp.shooter() === null && rp.flying().length === 0);
  rp.push(EVENTS.slice(0, 4)); // round, fire, shot, hit
  check('the queue holds what was pushed', rp.queue.length === 4 && !rp.idle());
  rp.step(0);
  check('the round event is logged at once and the volley starts', host.log.events.length === 2 && host.log.events[1].t === 'fire' && rp.shooter() === host.tanks[0]);

  // The barrel is still (the fixture opener matches the tank), so the aim eases for 0.15 s.
  const aimFrames = Math.ceil(0.15 / DT);
  let shells = frames(rp, aimFrames - 1);
  check('no shell flies while the barrel eases', shells.length === 0 && host.log.launches === 0);
  const t0Frames = aimFrames - 1;
  let tau = DT * t0Frames;
  const at = ft => {
    const want = Math.max(0, Math.round((ft + 0.15 - tau) / DT));
    shells = frames(rp, want);
    tau += want * DT;
    return { ft: tau - 0.15, shell: shells[0] };
  };
  for (const target of [0.1, 0.25, 0.5, 0.75, 1.0]) {
    const { ft, shell } = at(target);
    const [x, y] = pathAt(shotA, ft * PATH_HZ);
    check(`the shell is on the recorded path ${ft.toFixed(4)} s into flight`, shell && near(shell.x, x) && near(shell.y, y) && shell.wkey === 'shell',
      shell ? `${shell.x},${shell.y} vs ${x},${y}` : 'no shell');
  }
  const exact = at(0.5);
  const pts = shotA.p.split(' ').map(s => s.split(',').map(Number));
  const k = exact.ft * PATH_HZ, i = Math.floor(k);
  check('its velocity is the path step at path rate',
    near(exact.shell.vx, (pts[i + 1][0] - pts[i][0]) * PATH_HZ) && near(exact.shell.vy, (pts[i + 1][1] - pts[i][1]) * PATH_HZ));
  check('the launch sounded once and the muzzle flashed at the barrel', host.log.launches === 1 && host.log.muzzles.length === 1
    && host.log.muzzles[0].w === 'shell' && host.log.muzzles[0].x === pts[0][0] && host.log.muzzles[0].y === pts[0][1]);
  check('the trail dripped along the path with the frame time', host.log.trails.length > 0 && host.log.trails.every(t => t.dt === DT && t.w === 'shell') && host.log.trails[0].shot.e === shotA);
  check('nothing has landed yet', host.log.blasts.length === 0 && host.tanks[1].hp === 100);

  // Landing at t1 = 1.15: the blast, then the hit's damage and log line.
  while (rp.flying().length) rp.step(DT);
  check('the shell lands where the server said, with its radius', host.log.blasts.length === 1
    && host.log.blasts[0].x === shotA.x1 && host.log.blasts[0].y === shotA.y1 && host.log.blasts[0].r === shotA.r && host.log.blasts[0].w === 'shell');
  check('it was not drawn after landing', rp.flying().length === 0);
  const hit = byT('hit')[0];
  check('the hit took its damage when its time came', host.tanks[1].hp === 100 - hit.dmg && host.log.events.some(e => e.t === 'hit'));
  let guard = 0;
  while (!rp.idle() && guard++ < 1000) rp.step(DT);
  check('the volley ends and the replay goes idle', rp.idle() && rp.shooter() === null && guard < 1000);
  check('shot events are flown, never logged', !host.log.events.some(e => e.t === 'shot'));
}

/* ---- the whole fixture, in order ---- */
{
  const host = makeHost();
  const rp = createReplay(host.env);
  rp.push(EVENTS);
  let t = 0;
  while (!rp.idle() && t < 20) { rp.step(DT); t += DT; }
  check('both volleys play out', rp.idle() && host.log.blasts.length === 2 && host.log.launches === 2, `${host.log.blasts.length} blasts`);
  check('their log lines come in the server order', host.log.events.map(e => e.t).join() === 'round,fire,hit,aifire');
  check('the second blast is the drone shell\'s landing', host.log.blasts[1].x === shotB.x1 && host.log.blasts[1].y === shotB.y1);
  // 0.15 s aim + the later of the shot landings (1.983) + 0.6 s tail, per volley; the second volley starts the frame the first one ends.
  check('the two volleys take their recorded time', t > (0.15 + 1.15 + 0.6) + (0.15 + 1.983 + 0.6) - 0.1 && t < 5.5, `${t}`);
}

/* ---- aim easing: a tank that must swing waits for its barrel ---- */
{
  const host = makeHost();
  host.tanks[0].angle = 62; host.tanks[0].power = 55; host.tanks[0].x = 200; // opener: 20 degrees, 45 power, x 251
  const rp = createReplay(host.env);
  rp.push(EVENTS.slice(1, 3));
  rp.step(0);
  const swing = Math.max(42, 10, 51);
  const aimDur = Math.min(1.4, Math.max(0.5, 0.45 + swing / 110));
  const half = Math.floor((aimDur / 2) / DT);
  frames(rp, half);
  const u = half * DT / aimDur, e = u * u * (3 - 2 * u);
  check('the barrel eases (smoothstep) toward the shot\'s aim', near(host.tanks[0].angle, 62 + (20 - 62) * e, 0.05) && host.tanks[0].showA === host.tanks[0].angle);
  check('no shell leaves until the barrel is there', host.log.launches === 0);
  frames(rp, Math.ceil(aimDur / DT));
  check('then the barrel rests at the recorded aim and the shell is off',
    near(host.tanks[0].angle, 20) && near(host.tanks[0].power, 45) && near(host.tanks[0].x, 251) && host.log.launches === 1);
}

/* ---- catch-up ---- */
{
  const host = makeHost();
  const rp = createReplay(host.env);
  rp.push(EVENTS);
  const turnIsDrone = { phase: 'play', turn: 1 };
  const skipped = rp.catchUp(turnIsDrone, 0);
  check('a catch-up with two volleys waiting skips the first', skipped && skipped.map(e => e.t).join() === 'round,fire,shot,hit', skipped && skipped.map(e => e.t).join());
  check('the newest volley stays queued', rp.queue.length === 2 && rp.queue[0].t === 'aifire');
  check('the skipped events are for the caller to log; the replay logs none', host.log.events.length === 0);
  check('a lone volley is not caught up', rp.catchUp(turnIsDrone, 0) === null);

  // The kept volley plays at three times speed.
  rp.step(0);
  check('the kept volley starts', rp.shooter() === host.tanks[1]);
  const aimFrames = Math.ceil(0.15 / (DT * FAST_SPEED));
  frames(rp, aimFrames - 1);
  let tau = DT * FAST_SPEED * (aimFrames - 1);
  const check3 = (wallFrames, label) => {
    const shells = frames(rp, wallFrames);
    tau += wallFrames * DT * FAST_SPEED;
    const ft = tau - 0.15;
    const [x, y] = pathAt(shotB, ft * PATH_HZ);
    check(label, shells.length === 1 && near(shells[0].x, x) && near(shells[0].y, y), shells[0] ? `${shells[0].x},${shells[0].y} vs ${x},${y}` : 'no shell');
    return ft;
  };
  const f1 = check3(8, 'at 3x, the drone shell is on its recorded path');
  const f2 = check3(8, 'and still on it 8 frames later');
  check('flight time ran at three times the wall clock', near(f2 - f1, 8 * DT * 3));
  let wall = 0;
  while (rp.flying().length) { rp.step(DT); wall += DT; }
  check('it lands, at three times speed, where the server said', host.log.blasts.length === 1 && host.log.blasts[0].x === shotB.x1
    && host.log.blasts[0].y === shotB.y1 && wall < (shotB.t1 / 3) + 0.2, `${wall}`);
  let guard = 0;
  while (!rp.idle() && guard++ < 2000) rp.step(DT);
  check('the kept volley finishes and the replay idles', rp.idle());

  // The fast flag is spent: the next volley plays at real speed.
  rp.push(EVENTS.slice(4));
  rp.step(0);
  frames(rp, Math.ceil(0.15 / DT) + 16);
  const slow = rp.flying()[0];
  const ft = (Math.ceil(0.15 / DT) + 16) * DT - 0.15;
  const [x, y] = pathAt(shotB, ft * PATH_HZ);
  check('a later volley plays at 1x again', slow && near(slow.x, x, 1e-6) && near(slow.y, y, 1e-6), slow ? `${slow.x} vs ${x}` : 'no shell');

  // It is already the player's turn: skip every volley.
  const mine = makeHost();
  const r2 = createReplay(mine.env);
  r2.push(EVENTS);
  const all = r2.catchUp({ phase: 'play', turn: 0 }, 0);
  check('when the next turn is ours, every volley is skipped and nothing plays fast', all.length === EVENTS.length && r2.idle());
  r2.push(EVENTS.slice(1, 3));
  r2.step(0);
  frames(r2, Math.ceil(0.15 / DT) + 16);
  const s2 = r2.flying()[0];
  const ft2 = (Math.ceil(0.15 / DT) + 16) * DT - 0.15;
  const [x2] = pathAt(shotA, ft2 * PATH_HZ);
  check('the next volley after that plays at real speed', s2 && near(s2.x, x2, 1e-6));

  // A volley on screen counts as waiting.
  const mid = makeHost();
  const r3 = createReplay(mid.env);
  r3.push(EVENTS.slice(1, 4));
  r3.step(0);
  frames(r3, 20);
  r3.push(EVENTS.slice(4));
  const dropped = r3.catchUp({ phase: 'play', turn: 1 }, 0);
  check('the volley on screen is dropped for the newer one', dropped && dropped.length === 0 && r3.shooter() === null && r3.flying().length === 0 && r3.queue[0].t === 'aifire',
    dropped ? dropped.map(e => e.t).join() : 'null');
}

/* ---- clear ---- */
{
  const host = makeHost();
  const rp = createReplay(host.env);
  rp.push(EVENTS);
  rp.step(DT);
  rp.clear();
  check('clear forgets the queue and the volley', rp.idle() && rp.shooter() === null && rp.flying().length === 0);
}

/* ---- drones fighting on with no human standing: the volley plays at 3x ---- */
{
  const wallFrames = events => {
    const host = makeHost();
    const rp = createReplay(host.env);
    rp.push(events);
    let n = 0;
    while (n < 5000) { rp.step(DT); n++; if (rp.idle()) break; }
    return { n, host };
  };
  const volley = EVENTS.filter(e => e.t !== 'round').slice(0, 3); // opener, shot, hit
  const normal = wallFrames(volley.map(e => ({ ...e })));
  const watched = wallFrames(volley.map((e, i) => (i === 0 ? { ...e, watch: true } : { ...e })));
  check('a watch volley still plays every event', watched.host.log.events.length === normal.host.log.events.length
    && watched.host.log.launches === normal.host.log.launches && watched.host.log.blasts.length === normal.host.log.blasts.length);
  check('a watch volley plays in a third of the frames', Math.abs(watched.n - normal.n / FAST_SPEED) <= 2,
    `normal ${normal.n} watched ${watched.n}`);
  // The next volley is back to normal speed: watch is per volley, not sticky.
  const host = makeHost();
  const rp = createReplay(host.env);
  rp.push([{ ...volley[0], watch: true }, ...volley.slice(1), ...volley.map(e => ({ ...e }))]);
  let n = 0, firstDone = 0;
  while (n < 5000) { rp.step(DT); n++; if (!firstDone && host.log.events.filter(e => e.t === 'fire').length === 2) firstDone = n; if (rp.idle()) break; }
  check('the volley after a watch volley plays at normal speed', Math.abs((n - firstDone) - normal.n) <= 3, `${n - firstDone} vs ${normal.n}`);
}


/* ---- a hop gun's leaps and a scatter gun's bomblets play their special once per burst ---- */
{
  const host = makeHost();
  host.env.effect = wkey => ({ leapfrog: 'hop', funky: 'scatter' })[wkey];
  const rp = createReplay(host.env);
  const shot = (w, t0, t1, p, r) => {
    const pts = parsePath(p), [x0, y0] = pts[0], [x1, y1] = pts[pts.length - 1];
    return { t: 'shot', by: 0, w, x0, y0, x1, y1, t0, t1, r, p, at: t0 };
  };
  rp.push([
    { t: 'fire', seat: 0, w: 'leapfrog', x: 251, a: 20, pw: 45, at: 0 },
    shot('leapfrog', 0, 0.5, '270,324 300,320 330,326', 26),
    shot('leapfrog', 0.5, 1, '330,325 345,318 360,326', 22),
    shot('leapfrog', 1, 1.5, '360,325 368,320 376,326', 22),
  ]);
  for (let i = 0; i < 200 && !rp.idle(); i++) rp.step(DT);
  const hops = host.log.specials.filter(s => s.name === 'hop');
  check('each leap of a hop gun plays its hop special at the leap', hops.length === 2 && hops[0].x === 330 && hops[0].y === 325
    && hops[1].x === 360 && hops.every(s => s.w === 'leapfrog' && s.ang < 0), JSON.stringify(hops));
  check('a hop gun\'s first shot leaves the barrel with a muzzle flash, its leaps do not', host.log.muzzles.length === 1);

  host.log.specials.length = 0;
  rp.push([
    { t: 'fire', seat: 0, w: 'funky', x: 251, a: 20, pw: 45, at: 0 },
    shot('funky', 0, 0.5, '270,324 300,320 330,326', 24),
    ...[-30, -10, 10, 30].map(dx => shot('funky', 0.5, 1, `330,324 ${330 + dx / 2},300 ${330 + dx},326`, 18)),
  ]);
  for (let i = 0; i < 200 && !rp.idle(); i++) rp.step(DT);
  const scatters = host.log.specials.filter(s => s.name === 'scatter');
  check('a scatter gun\'s bomblets play the scatter special once, straight up from the burst', scatters.length === 1
    && scatters[0].x === 330 && scatters[0].y === 324 && near(scatters[0].ang, -Math.PI / 2), JSON.stringify(scatters));
}

/* ---- a parachute armed by its volley opens when the unit's ground goes, in real frames ---- */
{
  const host = makeHost();
  const rp = createReplay(host.env);
  const fire = byT('fire')[0];
  const terrain = new Array(720).fill(0).map((_, x) => (x < 360 ? 324 : 342));
  const world = { tanks: host.tanks, terrain };
  rp.push([fire, { t: 'fall', seat: 1, dmg: 0, by: 0, chute: true, under: false, at: 0.8 }]);
  rp.step(0);
  check('a chute fall arms its parachute as the volley starts, and opens nothing', host.tanks[1].chuteArmed === true && !host.tanks[1].chuteOpen && !host.tanks[0].chuteArmed);
  let atRest = 0;
  for (let f = 0; f < 60; f++) { rp.step(DT); fallTanks(world, DT); if (host.tanks[1].chuteOpen) atRest++; }
  check('no canopy over the unit while its ground holds', atRest === 0 && host.tanks[1].drawY === undefined && host.tanks[1].y === 342, `${atRest}`);
  // The replay carves the pit: the unit floats down under the canopy, and folds it on the floor.
  for (let x = 395; x <= 435; x++) terrain[x] = 462;
  let falling = 0, open = 0, last = host.tanks[1].y;
  for (let f = 0; f < 2000 && anyTankFalling(world); f++) {
    rp.step(DT);
    fallTanks(world, DT);
    const now = host.tanks[1].drawY ?? host.tanks[1].y;
    if (now > last && now < 461.5) { falling++; if (host.tanks[1].chuteOpen) open++; }
    last = now;
  }
  check('under the canopy every frame it falls', falling > 30 && open === falling, `${open} of ${falling}`);
  let rested = 0;
  for (let f = 0; f < 30; f++) { fallTanks(world, DT); if (host.tanks[1].chuteOpen) rested++; }
  check('no canopy once it rests', rested === 0 && !host.tanks[1].chuteArmed);
  const plain = makeHost();
  const rp2 = createReplay(plain.env);
  rp2.push([fire, { t: 'fall', seat: 1, dmg: 12, by: 0, chute: false, under: false, at: 0.8 }]);
  rp2.step(0);
  check('a fall without a parachute arms none', !plain.tanks[1].chuteArmed);
}

/* ---- guns with no flight, and tracers ---- */
{
  // A beam: the server's event, at the volley's start, carves the client's
  // hills exactly as the war's own beam does (sim.ts beamCarve on the
  // event's line), and each unit it hits shows the beam passing through.
  const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
  const arsenal = buildArsenal(GAME.arsenal);
  const BEAM = GAME.arsenal.ammo.find(a => a.effect === 'beam').key;
  const RING = GAME.arsenal.ammo.find(a => a.effect === 'plasma').key;
  const TRACER = GAME.arsenal.ammo.find(a => a.effect === 'tracer').key;
  const hills = () => Array.from({ length: 720 }, (_, x) => (x >= 200 && x <= 280 ? 320 : 400));
  const gunner = { id: 'P', isPlayer: true, x: 100, y: 400, angle: 14, power: 100, hp: 100, fuel: 80, dirS: 1 };
  const war = { tanks: [gunner, { id: 'D', isPlayer: false, x: 600, y: 400, hp: 100, fuel: 80 }], terrain: hills(), wind: 0, round: 1, shells: [],
    score: 0, cash: 0, ammo: {}, selected: 'shell', shield: false, bunker: 0, laststand: false, jammer: 0 };
  const shot = fireBeam(war, arsenal, gunner, BEAM);
  const host = makeHost();
  const terrain = hills();
  const beams = [];
  host.env.effect = w => GAME.arsenal.ammo.find(a => a.key === w)?.effect;
  host.env.beam = e => { beams.push(e); beamCarve(terrain, e.x0, e.y0, e.x1, e.y1, arsenal.weapons[e.w].radius); };
  host.env.ring = () => {};
  host.env.mark = () => {};
  const rp = createReplay(host.env);
  const beamEv = { t: 'beam', by: 0, w: BEAM, x0: shot.x0, y0: shot.y0, x1: shot.x1, y1: shot.y1, at: 0 };
  rp.push([{ t: 'fire', seat: 0, w: BEAM, x: 251, a: 20, pw: 45, at: 0 }, beamEv, { t: 'hit', seat: 1, dmg: 45, by: 0, direct: false, at: 0 }]);
  rp.step(0);
  check('a beam waits for the barrel to ease, as a shot does', beams.length === 0);
  for (let i = 0; i < 200 && !rp.idle(); i++) rp.step(DT);
  check('a beam event plays once and carves the client terrain exactly as fireBeam did', beams.length === 1 && beams[0] === beamEv
    && JSON.stringify(terrain) === JSON.stringify(war.terrain) && JSON.stringify(terrain) !== JSON.stringify(hills()));
  check('the beam and its line are flown by the replay, not logged as events', !host.log.events.some(e => e.t === 'beam'));
  const through = host.log.specials.filter(s => s.name === 'pierce');
  check('a drone the beam hits shows it passing through its body, up in the air', through.length === 1 && through[0].y === host.tanks[1].y - 30,
    JSON.stringify(through));
  check('a unit the beam hits shows it passing through, along the beam', through.length === 1 && through[0].w === BEAM
    && near(through[0].ang, Math.atan2(shot.y1 - shot.y0, shot.x1 - shot.x0)), JSON.stringify(through));

  // A hit another seat owns (a last-stand blast the beam's victim set off) is not the beam passing.
  const piercedBefore = host.log.specials.filter(s => s.name === 'pierce').length;
  rp.push([{ t: 'fire', seat: 0, w: BEAM, x: 251, a: 20, pw: 45, at: 0 }, { ...beamEv, at: 0 }, { t: 'hit', seat: 1, dmg: 5, by: 0, direct: true, at: 0 }, { t: 'hit', seat: 0, dmg: 5, by: 1, direct: false, at: 0 }]);
  for (let i = 0; i < 200 && !rp.idle(); i++) rp.step(DT);
  check('only the beam owner\'s hits draw a pierce', host.log.specials.filter(s => s.name === 'pierce').length === piercedBefore + 1,
    JSON.stringify(host.log.specials));

  // A ring: played once at its moment; no shot, no blast disc.
  const rings = [];
  host.env.ring = e => rings.push(e);
  rp.push([{ t: 'aifire', seat: 1, w: RING, x: 415.1, a: host.tanks[1].angle, pw: 100, at: 0 }, { t: 'ring', by: 1, w: RING, x: 415.1, y: 312, r: 90, at: 0 }]);
  for (let i = 0; i < 200 && !rp.idle(); i++) rp.step(DT);
  check('a ring event plays once', rings.length === 1 && rings[0].r === 90);

  // A tracer: its shot lands with radius 0 and leaves a mark, no blast.
  const marks = [];
  host.env.mark = s => marks.push(s);
  const blasts = host.log.blasts.length;
  rp.push([{ t: 'fire', seat: 0, w: TRACER, x: 251, a: 20, pw: 45, at: 0 },
    { t: 'shot', by: 0, w: TRACER, x0: 270, y0: 320, x1: 330, y1: 326, t0: 0, t1: 0.5, r: 0, p: '270,320 300,310 330,326', at: 0 }]);
  for (let i = 0; i < 200 && !rp.idle(); i++) rp.step(DT);
  check('a tracer lands with its mark and no blast', marks.length === 1 && marks[0].e.w === TRACER && host.log.blasts.length === blasts);
}

/* ---- the server's own beam and ring volleys (protocol/play-after-beam.json, play-after-ring.json) ---- */
for (const [file, t] of [['play-after-beam.json', 'beam'], ['play-after-ring.json', 'ring']]) {
  const evs = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'protocol', file), 'utf8')).body.room.events;
  const at = evs.findIndex(e => e.t === t);
  const own = evs[at], next = evs[at + 1];
  check(`${file}: the ${t} is followed by its hit on the drone at the same moment`, own && next && next.t === 'hit' && next.seat === 1 && next.by === 0
    && next.at === own.at && own.at === 0 && !evs.slice(0, evs.findIndex(e => e.t === 'aifire')).some(e => e.t === 'shot'), JSON.stringify(evs.slice(at, at + 3)));
  const host = makeHost();
  const seen = [];
  host.env.effect = () => undefined;
  host.env.beam = e => seen.push(e.t);
  host.env.ring = e => seen.push(e.t);
  host.env.mark = () => {};
  const rp = createReplay(host.env);
  rp.push(evs.slice(evs.findIndex(e => e.t === 'fire'), evs.findIndex(e => e.t === 'aifire')));
  for (let i = 0; i < 400 && !rp.idle(); i++) rp.step(DT);
  check(`${file}: the replay plays the ${t} once and logs its hit`, seen.length === 1 && seen[0] === t && host.log.events.some(e => e.t === 'hit'));
}

/* ---- the earth guns: each event moves the client's ground exactly as the war's own shot did ---- */
{
  const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
  const arsenal = buildArsenal(GAME.arsenal);
  const earthGuns = GAME.arsenal.ammo.filter(a => ['dirt', 'pour', 'dig', 'riot', 'slump'].includes(a.effect));
  const hills = () => Array.from({ length: 720 }, (_, x) => 380 + 50 * Math.sin(x / 30) + (x > 300 && x < 340 ? -40 : 0));
  for (const w of earthGuns) {
    const gunner = { id: 'P', isPlayer: true, x: 120, y: 0, angle: 40, power: 62, hp: 500, fuel: 80, dirS: 1 };
    const war = { tanks: [gunner, { id: 'D', isPlayer: false, x: 600, y: 0, hp: 500, fuel: 80 }], terrain: hills(), wind: 0, round: 1, shells: [],
      score: 0, cash: 0, ammo: { [w.key]: 3 }, selected: w.key, shield: false, bunker: 0, laststand: false, jammer: 0 };
    for (const t of war.tanks) t.y = war.terrain[t.x];
    // The wire events the war's shot makes: earth ops as they are, a dig's warheads as bursts at their exact points.
    const wire = [];
    const take = evs => {
      for (const e of evs) {
        if (e.kind === 'earth') wire.push({ ...e.op });
        else if (e.kind === 'dig' && e.step === 0) wire.push({ t: 'dig0', x: e.x, y: e.y, ang: e.ang });
        else if (e.kind === 'blast' && w.effect === 'dig') wire.push({ t: 'crater', x: e.blast.x, y: e.blast.y, r: e.blast.r });
      }
    };
    const launch = fireWeapon(war, arsenal, gunner, w.key);
    take(launch.now);
    let steps = 0;
    for (let f = 0; war.shells.length && f < 5000; f++) {
      const before = war.shells.find(s => s.digging);
      take(stepShells(war, arsenal, 1 / 60));
      if (before) steps = before.dl;
    }
    const terrain = hills();
    for (const e of wire) {
      if (e.t === 'dig0') applyEarth(terrain, { t: 'dig', w: w.key, x: e.x, y: e.y, ux: Math.cos(e.ang), uy: Math.sin(e.ang), n: 0, r: w.digR });
      else if (e.t === 'crater') carveCrater(terrain, e.x, e.y, e.r, 456);
      else applyEarth(terrain, e);
    }
    if (w.effect === 'dig') {
      const start = wire.find(e => e.t === 'dig0');
      const shell = { vx: Math.cos(start.ang), vy: Math.sin(start.ang) };
      const [ux, uy] = digHeading(shell.vx, shell.vy);
      digCarve(terrain, start.x, start.y, ux, uy, steps, w.digR);
    }
    check(`${w.key}: replaying its events moves the client's ground to exactly the war's`, JSON.stringify(terrain) === JSON.stringify(war.terrain)
      && JSON.stringify(terrain) !== JSON.stringify(hills()), `${wire.map(e => e.t).join()} steps ${steps}`);
  }
}

/* ---- the server's own earth volleys (protocol/play-after-earth.json) ---- */
{
  const evs = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'protocol', 'play-after-earth.json'), 'utf8')).body.room.events;
  const host = makeHost();
  const seen = [];
  host.env.effect = () => undefined;
  host.env.beam = () => {};
  host.env.ring = () => {};
  host.env.mark = () => {};
  host.env.earth = e => seen.push(e.t);
  const rp = createReplay(host.env);
  rp.push(evs.slice(evs.findIndex(e => e.t === 'fire')));
  for (let i = 0; i < 4000 && !rp.idle(); i++) rp.step(DT);
  check('play-after-earth.json: the replay plays each earth event once, in order', seen.join() === 'dig,dirt,pour,riot,slump', seen.join());
  check('play-after-earth.json: no earth event is logged as a plain event', !host.log.events.some(e => ['dig', 'dirt', 'pour', 'riot', 'slump'].includes(e.t)));
  const dig = evs.findIndex(e => e.t === 'dig');
  check('play-after-earth.json: a dig comes before its warheads\' bursts, which follow in time order', evs[dig + 1].t === 'burst' && evs[dig + 1].at >= evs[dig].at
    && evs[dig + 2].at >= evs[dig + 1].at && evs[dig].t1 >= evs[dig].at);
}

/* ---- the server's own napalm volley (protocol/play-after-burn.json) ---- */
{
  const evs = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'protocol', 'play-after-burn.json'), 'utf8')).body.room.events;
  const host = makeHost();
  const lit = [];
  let t = 0, closed = null;
  host.env.effect = () => undefined;
  host.env.beam = () => {};
  host.env.ring = () => {};
  host.env.mark = () => {};
  host.env.earth = () => {};
  host.env.burn = e => lit.push({ e, t });
  const rp = createReplay(host.env);
  const from = evs.findIndex(e => e.t === 'fire'), next = evs.findIndex(e => e.t === 'aifire');
  rp.push(evs.slice(from, next));
  for (let i = 0; i < 4000 && !rp.idle(); i++) {
    rp.step(DT);
    t += DT;
    if (closed === null && rp.idle()) closed = t;
  }
  const burn = evs.find(e => e.t === 'burn');
  const hits = host.log.events.filter(e => e.t === 'hit');
  check('play-after-burn.json: the replay lights the pool once, with the server\'s numbers', lit.length === 1 && lit[0].e === burn && burn.x0 <= burn.x1, JSON.stringify(lit.map(l => l.e)));
  check('play-after-burn.json: the burn is not logged as a plain event', !host.log.events.some(e => e.t === 'burn'));
  check('play-after-burn.json: every tick\'s hit plays, each after the pool lit', hits.length === evs.filter(e => e.t === 'hit').length && hits.length > 1
    && hits.every(h => h.at > burn.at && h.at <= burn.t1));
  check('play-after-burn.json: the volley stays open until the last tick has burned', closed !== null && closed >= burn.t1, `${closed} vs ${burn.t1}`);
  check('play-after-burn.json: the shot has no blast (r 0) and the ground does not change', evs.find(e => e.t === 'shot' && e.by === 0).r === 0
    && !evs.some(e => ['dirt', 'pour', 'dig', 'riot', 'slump', 'burst'].includes(e.t)));
}
