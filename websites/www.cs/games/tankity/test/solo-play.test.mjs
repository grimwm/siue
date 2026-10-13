// Solo runs without a page: a bot plays the browser's rules round by round,
// every round's claim is what soloRound (the server's round) reaches, a
// tampered or garbled round is refused with its reason, and nothing throws.
// Long runs are recorded in protocol/solo-runs.json, not played here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, fireWeapon, fallTanks, stepShells, anyTankFalling } from '../src/sim.ts';
import { playSolo, replaySolo, soloRound, makeBot, blankSolo, flyVolley, playerFire } from '../src/solo-play.ts';
import { soloDeal, soloMuster, SOLO_STEP } from '../src/solo.ts';
import { ROUND_MAX_BUYS, ROUND_MAX_SHOTS } from '../src/solo-log.ts';
import { runFixed } from '../src/flow.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);

// Short runs, played once and shared. Each stops aiming after a few rounds so it ends.
const RUNS = [['t-1', 0, 0, 'easy'], ['t-2', 0.6, 3, 'normal'], ['t-3', 1, 3, 'hard']].map(([seed, skill, until, level]) =>
  playSolo(seed, arsenal, makeBot(seed, skill, until), level));
const [easy, normal] = RUNS;
const freshG = () => {
  const G = blankSolo();
  soloDeal(G, arsenal, 'garbage', 'normal', 720);
  return G;
};

test('every round of a played run replays to its claim, at every difficulty', () => {
  for (const run of RUNS) {
    assert.equal(run.rounds.at(-1).claim.end, 'matchLost');
    const back = replaySolo(JSON.parse(JSON.stringify(run)), arsenal);
    assert.deepEqual(back, { ok: true, score: run.score, roundsWon: run.roundsWon, rounds: run.rounds.length }, run.seed);
  }
});

test('the short runs still cover a won round, a lost tank, a lost match, a 1-up, another gun and a drive', () => {
  const rounds = RUNS.flatMap(r => r.rounds);
  const ends = new Set(rounds.map(r => r.claim.end));
  for (const end of ['roundWon', 'tankLost', 'matchLost']) assert.ok(ends.has(end), end);
  assert.ok(rounds.some((r, k) => k > 0 && r.n > 1 && r.claim.lives > rounds[k - 1].claim.lives), 'a life was gained');
  const shots = rounds.flatMap(r => r.shots);
  assert.ok(shots.some(x => x.w !== 'shell'), 'a gun other than the Shell');
  assert.ok(rounds.some(r => r.shots.some((x, k) => k > 0 && x.x !== r.shots[k - 1].x)), 'the tank drove between shots');
});

test('the same seed and bot play the same run', () => {
  const a = playSolo('same', arsenal, makeBot('same', 0.5, 1), 'normal');
  const b = playSolo('same', arsenal, makeBot('same', 0.5, 1), 'normal');
  assert.deepEqual(a, b);
});

test('a run replayed at another difficulty does not reach its claims', () => {
  assert.equal(replaySolo({ ...easy, difficulty: 'hard' }, arsenal).ok, false);
});

test('a run plays and replays at its width, and at no other', () => {
  const run = playSolo('wide', arsenal, makeBot('wide', 0.6, 3), 'normal', 1440);
  assert.equal(run.w, 1440);
  assert.equal(replaySolo(JSON.parse(JSON.stringify(run)), arsenal).ok, true);
  assert.equal(replaySolo({ ...run, w: 720 }, arsenal).ok, false);
});

test('a volley flown in jittered frames lands, and drops its tanks, where fixed steps do', () => {
  const setup = () => {
    const G = blankSolo();
    soloDeal(G, arsenal, 'jitter', 'normal', 720);
    G.round = 1;
    soloMuster(G, arsenal);
    const me = G.tanks[0];
    me.angle = 52.3; me.power = 71.9;
    fireWeapon(G, arsenal, me, 'buck');
    return G;
  };
  const snap = G => ({ hp: G.tanks.map(t => t.hp), y: G.tanks.map(t => t.y), terrain: G.terrain.slice(0) });
  const volley = () => { const G = setup(); flyVolley(G, arsenal); return snap(G); };
  const fly = frames => {
    const G = setup();
    let acc = 0;
    for (const dt of frames) {
      if (!G.shells.length && !anyTankFalling(G)) break;
      acc = runFixed(acc, dt, SOLO_STEP, h => { fallTanks(G, h); if (G.shells.length) stepShells(G, arsenal, h); return true; });
    }
    return { hp: G.tanks.map(t => t.hp), y: G.tanks.map(t => t.y), terrain: G.terrain.slice(0) };
  };
  const steady = fly(Array(3000).fill(1 / 60));
  const r = [0.004, 0.05, 0.017, 0.033, 0.009];
  const jitter = fly(Array.from({ length: 6000 }, (_, i) => r[i % r.length]));
  assert.deepEqual(jitter, steady);
  assert.deepEqual(volley(), steady, 'the server\'s volley flies the same');
});

test('flyVolley drops tanks between shell steps, not after the volley', () => {
  const G = blankSolo();
  soloDeal(G, arsenal, 'pit', 'normal', 720);
  G.round = 1;
  soloMuster(G, arsenal);
  G.terrain = Array(720).fill(400);
  G.tanks.forEach((t, i) => { t.x = 120 + i * 160; t.y = 400; });
  G.tanks[1].y = 330; // hanging over a pit already: it must fall while the shell flies
  const ys = [];
  fireWeapon(G, arsenal, G.tanks[0], 'shell');
  flyVolley(G, arsenal, w => { if (w.shells.length) ys.push(w.tanks[1].y); });
  assert.ok(ys.length > 3 && ys[0] < ys[2], 'the tank moved while the shell was in the air');
  assert.equal(G.tanks[1].y, 400);
});

test('a tampered round is refused, with its reason', () => {
  const tamper = (edit) => { const run = structuredClone(normal); edit(run.rounds[0]); return replaySolo(run, arsenal); };
  const r1 = normal.rounds[0];
  assert.ok(r1.shots.length > 0);
  const last = r1.shots.at(-1);
  assert.deepEqual(tamper(r => r.shots.pop()), { ok: false, round: 1, error: 'unfinished' });
  assert.deepEqual(tamper(r => { r.shots[0].a = 200; }), { ok: false, round: 1, error: 'out of range' });
  assert.deepEqual(tamper(r => { r.claim.score += 100; }), { ok: false, round: 1, error: 'mismatch' });
  assert.deepEqual(tamper(r => r.shots.push({ ...last })), { ok: false, round: 1, error: 'shots after the end' });
  assert.deepEqual(tamper(r => r.buys.push({ i: 'nope', q: 1 })), { ok: false, round: 1, error: 'bad buy' });
  assert.deepEqual(tamper(r => { r.buys = Array.from({ length: ROUND_MAX_BUYS + 1 }, () => ({ i: 'mortar', q: 1 })); }), { ok: false, round: 1, error: 'bad buys' });
  assert.deepEqual(tamper(r => { r.shots = Array.from({ length: ROUND_MAX_SHOTS + 1 }, () => ({ ...last })); }), { ok: false, round: 1, error: 'too many shots' });
  assert.deepEqual(tamper(r => { r.n = 2; }), { ok: false, round: 2, error: 'out of order' });
});

test('a volley still flying when the steps run out is refused, not settled', () => {
  const probe = freshG();
  assert.equal(soloRound(probe, arsenal, [], []).error, 'unfinished');
  const shot = { w: 'shell', a: 80, p: 100, x: probe.tanks[0].x }; // where the muster put the player, so no drive
  assert.deepEqual(soloRound(freshG(), arsenal, [], [shot], 5), { ok: false, error: 'too slow' });
  assert.notEqual(soloRound(freshG(), arsenal, [], [shot]).error, 'too slow', 'the full budget lands it');
});

test('a claim with its keys in another order is the same claim', () => {
  const run = structuredClone(easy);
  const c = run.rounds[0].claim;
  run.rounds[0].claim = { roundsWon: c.roundsWon, lives: c.lives, cash: c.cash, score: c.score, end: c.end };
  assert.equal(replaySolo(run, arsenal).ok, true);
});

// Records come off the wire as JSON: whatever they hold, the round answers with
// the reason the PHP gives and never throws.
test('garbage buys are refused as the server refuses them', () => {
  const buy = (b) => soloRound(freshG(), arsenal, [b], []);
  for (const q of ['abc', '2', 0, 1.5, -3, null, true, NaN, undefined]) assert.deepEqual(buy({ i: 'mortar', q }), { ok: false, error: 'bad buy' }, `q ${String(q)}`);
  for (const i of [null, 5, undefined, 'nope', '__proto__', {}]) assert.deepEqual(buy({ i, q: 1 }), { ok: false, error: 'bad buy' }, `i ${String(i)}`);
  for (const b of [null, 5, 'x', undefined]) assert.deepEqual(buy(b), { ok: false, error: 'bad buy' }, `buy ${String(b)}`);
  for (const buys of [null, undefined, 5, 'x', {}]) assert.deepEqual(soloRound(freshG(), arsenal, buys, []), { ok: false, error: 'bad buys' }, `buys ${String(buys)}`);
});

test('garbage shots are refused as the server refuses them', () => {
  const shot = (m) => { const G = freshG(); return soloRound(G, arsenal, [], [m]); };
  const ok = { w: 'shell', a: 45, p: 50, x: 100 };
  for (const m of [null, 5, 'x', undefined, {}, { ...ok, a: '45' }, { ...ok, p: null }, { ...ok, x: '100' }, { ...ok, a: NaN }, { ...ok, x: Infinity }, { ...ok, w: 5 }, { ...ok, w: null }])
    assert.deepEqual(shot(m), { ok: false, error: 'bad move' }, JSON.stringify(m));
  for (const w of ['__proto__', 'toString', 'constructor', 'hasOwnProperty', 'nope']) assert.deepEqual(shot({ ...ok, w }), { ok: false, error: 'no such weapon' }, w);
  for (const shots of [null, undefined, 5, 'x', {}]) assert.deepEqual(soloRound(freshG(), arsenal, [], shots), { ok: false, error: 'too many shots' }, `shots ${String(shots)}`);
});

test('a garbled run is a refusal, not a crash', () => {
  const round = { n: 1, buys: [], shots: [], claim: { end: 'matchLost', score: 0, cash: 0, lives: 0, roundsWon: 0 } };
  const run = (over) => ({ seed: 'g', difficulty: 'normal', w: 720, rounds: [round], ...over });
  const cases = [
    [null, 'bad run'], [5, 'bad run'], [run({ seed: null }), 'bad run'], [run({ seed: 7 }), 'bad run'], [run({ difficulty: 'brutal' }), 'bad run'],
    [run({ rounds: null }), 'bad run'], [run({ rounds: {} }), 'bad run'], [run({ w: 700 }), 'bad width'],
    [run({ rounds: [null] }), 'bad round'], [run({ rounds: [5] }), 'bad round'], [run({ rounds: [{ ...round, claim: null }] }), 'bad round'],
    [run({ rounds: [{ ...round, buys: null }] }), 'bad buys'], [run({ rounds: [{ ...round, buys: 5 }] }), 'bad buys'],
    [run({ rounds: [{ ...round, buys: [null] }] }), 'bad buy'], [run({ rounds: [{ ...round, shots: null }] }), 'too many shots'],
    [run({ rounds: [{ ...round, shots: [null] }] }), 'bad move'], [run({ rounds: [{ ...round, n: 'one' }] }), 'out of order'],
  ];
  for (const [r, error] of cases) {
    const got = replaySolo(r, arsenal);
    assert.equal(got.ok, false, JSON.stringify(r));
    assert.equal(got.error, error, JSON.stringify(r));
  }
});

test('the shooter is landed before a shot fires, as the page lands it while aiming', () => {
  const setup = hang => {
    const G = blankSolo();
    soloDeal(G, arsenal, 'land', 'normal', 720);
    G.round = 1;
    soloMuster(G, arsenal);
    const me = G.tanks[0];
    me.y -= hang; // left hanging over the ground
    return G;
  };
  const shot = { w: 'shell', a: 60, p: 70, x: 0 };
  const run = hang => {
    const G = setup(hang);
    shot.x = G.tanks[0].x;
    assert.equal(playerFire(G, arsenal, shot), null);
    flyVolley(G, arsenal);
    return { hp: G.tanks.map(t => t.hp), y: G.tanks.map(t => t.y), terrain: G.terrain.slice(0) };
  };
  assert.deepEqual(run(40), run(0));
});
