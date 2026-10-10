// The room volley replay without a browser. Run here: `node replay-test.js`.
// js/replay.js (compiled from src/replay.ts) plays recorded volleys through an
// environment of callbacks, so each case steps the replay on a clock the test
// moves by hand and checks what the room would show: the shell's place at
// fixed times against the path points the server recorded (protocol/play-after-fire.json),
// the blasts and hits at the moments the events say, the catch-up for a hidden
// tab, and the 3x replay of the volley it keeps.
import fs from 'node:fs';
import path from 'node:path';
import { createReplay, shellAt, shellVel, parsePath, PATH_HZ, FAST_SPEED } from './js/replay.js';

const fixture = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'protocol', 'play-after-fire.json'), 'utf8')).body.room;
const EVENTS = fixture.events;
const byT = t => EVENTS.filter(e => e.t === t);
const [shotA, shotB] = byT('shot');

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${detail}`}`);
  if (!ok) failed++;
};
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
    { seat: 1, x: 415.1, y: 342, angle: 45, power: 39, hp: 100 },
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

if (failed) { console.log(`\n${failed} failed`); process.exit(1); }
console.log('\nreplay-test: ok');
