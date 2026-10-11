// Replays the shared sim vectors (protocol/sim-vectors.json) through the
// browser sim, js/sim.js (compiled from src/sim.ts). Run here: `node sim-vectors-test.js`.
// The vectors are written by `php protocol/sim-vectors.php` from rooms.php, so
// a change to the browser sim or the room server's that the other side does
// not follow fails here (or in the generator's --check) until they agree.
// Exit 0 when every case matches or is a marked known difference.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = import.meta.dirname;
const VECTORS = JSON.parse(fs.readFileSync(path.join(dir, 'protocol', 'sim-vectors.json'), 'utf8'));
const GAME = JSON.parse(fs.readFileSync(path.join(dir, 'game.json'), 'utf8'));
const TOL = VECTORS.tolerance;

/* ---- where the sim comes from ----
   The only place that reaches for it: the compiled module, which takes its
   state as arguments, so the cases below pass a plain state object G. */
const sim = await import(pathToFileURL(path.join(dir, 'js', 'sim.js')).href);
const arsenal = sim.buildArsenal(GAME.arsenal);

/* ---- state the cases run over ---- */
const G = {};
function buildTerrain(spec) {
  const t = [];
  for (let ix = 0; ix < sim.W; ix++) {
    let y;
    if (spec.flat !== undefined) y = spec.flat;
    else if (spec.slope) y = spec.slope[0] + (spec.slope[1] - spec.slope[0]) * ix / (sim.W - 1);
    else y = spec.hills[0] + spec.hills[1] * Math.sin(ix * 2 * Math.PI / spec.hills[2]);
    for (const [x0, x1, sy] of spec.set || []) if (ix >= x0 && ix <= x1) y = sy;
    t.push(Math.round(y * 1000) / 1000);
  }
  return t;
}
const tankOf = (spec, i) => ({
  id: 'T' + i, isPlayer: spec.kind === 'human', x: spec.x, y: spec.y, hp: spec.hp === undefined ? 100 : spec.hp,
  angle: spec.angle === undefined ? 45 : spec.angle, power: spec.power === undefined ? 50 : spec.power,
  dirS: spec.dirS === undefined ? 1 : spec.dirS, fuel: spec.fuel === undefined ? 80 : spec.fuel, ammo: Object.assign({}, spec.ammo), vy: 0,
});
/* A fresh world for a case: the tanks, the ground, the wind, and the human's tricks (G.shield and friends are the player's). */
function world(c) {
  for (const k of Object.keys(G)) delete G[k];
  const human = (c.tanks || []).find(t => t.kind === 'human') || {};
  Object.assign(G, {
    tanks: (c.tanks || []).map(tankOf), terrain: buildTerrain(c.terrain || { flat: 400 }), wind: c.wind || 0, round: c.round || 1,
    shells: [], booms: [], clouds: [], fx: {}, ammo: {}, selected: 'shell', score: 0, cash: 0, shake: 0, shopSel: 0,
    shield: !!human.shield, bunker: human.bunker || 0, laststand: !!human.laststand, jammer: human.jammer || 0,
  });
  return G;
}
function outcome(before) {
  let first = null, last = null;
  G.terrain.forEach((y, ix) => {
    if (Math.abs(y - before[ix]) > 1e-9) { if (first === null) first = ix; last = ix; }
  });
  return {
    tanks: G.tanks.map(t => ({ hp: t.hp, fuel: t.fuel })),
    crater: first === null ? null : { x0: first, y: G.terrain.slice(first, last + 1) },
    score: G.score, cash: G.cash, shield: G.shield, laststand: G.laststand,
  };
}

/* ---- one runner per group: the case's inputs in, what the sim says out ---- */
const RUN = {
  constants() {
    const st = { x: 0, y: 0, vx: 0, vy: 0 };
    sim.stepBallistic(st, 1, 1, 0);
    return { grav: sim.GRAV, flatGrav: sim.FLAT_GRAV, windK: st.vx, unitGap: sim.UNIT_GAP, spawnGap: sim.SPAWN_GAP };
  },
  rng(c) {
    const hash = sim.hashSeed(c.seed), r = sim.mulberry32(hash);
    return { hash, stream: [0, 1, 2, 3, 4, 5].map(() => r()) };
  },
  'terrain-gen'(c) {
    const { terrain } = sim.genTerrain(sim.mulberry32(sim.hashSeed(c.seed)));
    const samples = [];
    for (let x = 0; x < sim.W; x += 60) samples.push(terrain[x]);
    return { samples, min: Math.min(...terrain), max: Math.max(...terrain) };
  },
  'spawn-spots'(c) {
    const r = sim.mulberry32(c.seed);
    return { spots: sim.spawnSpots(c.n, r), next: r() };
  },
  'shot-speed': c => sim.shotSpeed(c.power, c.flat, c.mult),
  muzzle(c) {
    const m = sim.muzzle(c);
    return [m.x, m.y];
  },
  'hit-box'(c) {
    const b = sim.unitHitBox({ isPlayer: c.kind === 'human', x: c.x, y: c.y });
    return [b.cx, b.cy, b.rx, b.ry];
  },
  'in-box': c => sim.inHitBox({ isPlayer: c.kind === 'human', x: c.x, y: c.y }, c.px, c.py),
  'sweep-hit'(c) {
    world(c);
    const s = { owner: G.tanks[c.owner], pierced: c.skip === null ? false : G.tanks[c.skip], clear: c.clear };
    const hit = sim.sweepHit(G.tanks, s, ...c.seg);
    return { hit: hit ? [G.tanks.indexOf(hit.t), hit.x, hit.y] : null, clear: s.clear };
  },
  'seek-push'(c) {
    world(c);
    const s = { x: c.sx, y: c.sy, vx: 0, vy: 0, owner: G.tanks[c.owner] };
    sim.steerShell(G.tanks, s, { steer: c.steer }, c.dt);
    return s.vx === 0 && s.vy === 0 ? null : [s.vx, s.vy];
  },
  'split-fan'(c) {
    return sim.splitShell({ x: 0, y: 0, vx: c.vx, vy: c.vy, wkey: 'shell', owner: null }, { split: c.n, fan: c.fan })
      .map(s => [s.vx, s.vy]);
  },
  blast(c) {
    world(c);
    const before = G.terrain.slice();
    const direct = c.direct === undefined || c.direct === null ? null : G.tanks[c.direct];
    sim.explode(G, arsenal, c.x, c.y, c.wkey, G.tanks[c.owner], direct, c.ov || null);
    return outcome(before);
  },
  'sim-shot'(c) {
    world(c);
    return sim.simShot(G, arsenal, c.x, c.y, c.angle, c.power, c.wkey, c.dirS);
  },
  'roll-out'(c) {
    const r = sim.rollOut(buildTerrain(c.terrain), c.x, c.vx, c.vy, arsenal.weapons[c.wkey]);
    return { x: r.x, y: r.y };
  },
  volley(c) {
    world(c);
    const before = G.terrain.slice(), shooter = G.tanks[c.shooter];
    shooter.angle = c.angle;
    shooter.power = c.power;
    (shooter.isPlayer ? G.ammo : shooter.ammo)[c.wkey] = 99;
    sim.fireWeapon(G, arsenal, shooter, c.wkey);
    // 1/60 s frames, as the room server steps; a volley ends when its last shell has burst.
    for (let frame = 0; G.shells.length && frame < 5000; frame++) sim.stepShells(G, arsenal, 1 / 60);
    return outcome(before);
  },
  'ai-aim'(c) {
    world(c);
    G.rng = sim.mulberry32(c.seed);
    const t = G.tanks[c.shooter], x0 = t.x;
    const choice = sim.aiChoose(G, arsenal, t);
    return { wkey: choice.wkey, angle: choice.angle, power: choice.power, moved: t.x - x0 };
  },
  'ai-bracket'(c) {
    world(c);
    G.rng = sim.mulberry32(c.seed);
    const t = G.tanks[c.shooter], steps = [];
    for (let k = 0; k < c.shots; k++) {
      if (c.driveAt === k) G.tanks[c.target].x += c.driveBy;
      const choice = sim.aiChoose(G, arsenal, t);
      t.angle = choice.angle;
      t.power = choice.power;
      t.ammo.shell = 99;
      sim.fireWeapon(G, arsenal, t, choice.wkey);
      for (let frame = 0; G.shells.length && frame < 5000; frame++) sim.stepShells(G, arsenal, 1 / 60);
      const b = t.brk;
      steps.push({ wkey: choice.wkey, angle: choice.angle, power: choice.power, x: t.x, n: b.n, target: b.t, land: b.land });
    }
    return steps;
  },
  settle(c) {
    world({ terrain: c.terrain, tanks: [{ kind: 'ai', x: c.x, y: c.y, hp: c.hp }] });
    for (let i = 0; i < 5000 && sim.anyTankFalling(G); i++) sim.fallTanks(G, 1 / 60);
    sim.fallTanks(G, 1 / 60);
    return G.tanks[0].y;
  },
};
/* The server reports where a drone wanted to shuffle; the browser moves it (inside the board, unless another unit is in the way). */
function expectedFor(group, c, out) {
  if (group !== 'ai-aim') return out;
  const x0 = c.tanks[c.shooter].x;
  const moved = out.dx === 0 ? 0 : Math.max(12, Math.min(sim.W - 12, x0 + out.dx)) - x0;
  return { wkey: out.wkey, angle: out.angle, power: out.power, moved };
}

/* ---- compare and report ---- */
function diff(want, got, at, out) {
  if (typeof want === 'number' && typeof got === 'number') {
    if (!(Math.abs(want - got) <= TOL)) out.push(`${at}: expected ${want}, got ${got}`);
  } else if (Array.isArray(want) && Array.isArray(got)) {
    if (want.length !== got.length) out.push(`${at}: expected ${want.length} items, got ${got.length}`);
    for (let i = 0; i < Math.min(want.length, got.length); i++) diff(want[i], got[i], `${at}[${i}]`, out);
  } else if (want && got && typeof want === 'object' && typeof got === 'object' && !Array.isArray(want) && !Array.isArray(got)) {
    for (const k of new Set([...Object.keys(want), ...Object.keys(got)])) diff(want[k], got[k], `${at}.${k}`, out);
  } else if (want !== got) {
    out.push(`${at}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`);
  }
  return out;
}
const clip = (v, n) => { const s = JSON.stringify(v); return s.length > n ? s.slice(0, n) + '...' : s; };

let failed = 0, known = 0, total = 0;
const failures = [];
const wl = JSON.stringify(VECTORS.weapons), loaded = JSON.stringify(arsenal.order);
if (wl !== loaded) {
  failures.push(`weapons: the vectors cover ${wl} but the sim loads ${loaded} from game.json; run make sim-vectors`);
}
for (const [group, cases] of Object.entries(VECTORS.groups)) {
  if (!RUN[group]) { failures.push(`${group}: no runner for this group in sim-vectors-test.js`); continue; }
  for (const c of cases) {
    total++;
    let got, bad;
    try {
      got = RUN[group](c.in);
      bad = diff(expectedFor(group, c.in, c.out), got, 'out', []);
    } catch (e) {
      bad = [`threw ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e}`];
    }
    if (c.known) {
      // Only the fields the known difference names may disagree.
      const norm = b => b.split(':')[0].replace(/\[\d+\]/g, '[]');
      const allowed = b => c.knownPaths.some(p => norm(b) === p || norm(b).startsWith(p + '.') || norm(b).startsWith(p + '['));
      const other = bad.filter(b => !allowed(b));
      if (other.length) {
        failures.push(`${group}/${c.name}: known difference (${c.knownPaths.join(', ')}), but other fields disagree too\n  ${other.slice(0, 6).join('\n  ')}`);
      } else if (bad.length) { known++; console.log(`KNOWN ${group}/${c.name} :: ${c.known}`); }
      else failures.push(`${group}/${c.name}: marked as a known difference but client and server now agree; drop its reason in protocol/sim-vectors.php`);
    } else if (bad.length) {
      failures.push(`${group}/${c.name}\n  ${bad.slice(0, 6).join('\n  ')}\n  inputs:   ${clip(c.in, 700)}\n  expected: ${clip(c.out, 700)}\n  actual:   ${clip(got, 700)}`);
    }
  }
}
failed = failures.length;
for (const f of failures) console.log('FAIL ' + f);
if (failed) {
  console.error(`SIM-VECTORS-FAILED ${failed} of ${total}: client (js/sim.js) and server (rooms.php) disagree; fix the side that is wrong, then run make sim-vectors`);
  process.exit(1);
}
console.log(`SIM-VECTORS-OK ${total} cases (${known} known differences)`);
