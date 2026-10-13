// games/tankity/test/solo-play.test.mjs
// Solo runs without a page: a bot plays the browser's rules round by round,
// every round's claim is what soloRound (the server's round) reaches, and a
// tampered round does not.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, fireWeapon, fallTanks, stepShells, anyTankFalling } from '../src/sim.ts';
import { playSolo, replaySolo, makeBot, blankSolo, flyVolley, playerFire } from '../src/solo-play.ts';
import { soloDeal, soloMuster, SOLO_STEP } from '../src/solo.ts';
import { runFixed } from '../src/flow.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);

test('every round of a played run replays to its claim, at every difficulty', () => {
  for (const [seed, skill, until, level] of [['t-1', 0, 99, 'easy'], ['t-2', 0.6, 99, 'normal'], ['t-3', 1, 4, 'hard']]) {
    const run = playSolo(seed, arsenal, makeBot(seed, skill, until), level);
    assert.equal(run.rounds.at(-1).claim.end, 'matchLost');
    const back = replaySolo(JSON.parse(JSON.stringify(run)), arsenal);
    assert.deepEqual(back, { ok: true, score: run.score, roundsWon: run.roundsWon, rounds: run.rounds.length }, seed);
  }
});

test('the same seed and bot play the same run', () => {
  const a = playSolo('same', arsenal, makeBot('same', 0.5, 99), 'normal');
  const b = playSolo('same', arsenal, makeBot('same', 0.5, 99), 'normal');
  assert.deepEqual(a, b);
});

test('a run replayed at another difficulty does not reach its claims', () => {
  const run = playSolo('level', arsenal, makeBot('level', 0.6, 99), 'easy');
  assert.equal(replaySolo({ ...run, difficulty: 'hard' }, arsenal).ok, false);
});

test('a run plays and replays at its width, and at no other', () => {
  const run = playSolo('wide', arsenal, makeBot('wide', 0.6, 99), 'normal', 1440);
  assert.equal(run.w, 1440);
  assert.equal(replaySolo(JSON.parse(JSON.stringify(run)), arsenal).ok, true);
  assert.equal(replaySolo({ ...run, w: 720 }, arsenal).ok, false);
});

test('a volley flown in jittered frames lands, and drops its tanks, where fixed steps do', () => {
  const fly = frames => {
    const G = blankSolo();
    soloDeal(G, arsenal, 'jitter', 'normal', 720);
    G.round = 1;
    soloMuster(G, arsenal);
    const me = G.tanks[0];
    me.angle = 52.3; me.power = 71.9;
    fireWeapon(G, arsenal, me, 'buck');
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

test('a tampered round does not reach its claim', () => {
  const run = playSolo('tamper', arsenal, makeBot('tamper', 0.3, 99), 'normal');
  const short = structuredClone(run);
  short.rounds[0].shots.pop();
  assert.equal(replaySolo(short, arsenal).ok, false);
  const wild = structuredClone(run);
  wild.rounds[0].shots[0].a = 200;
  assert.deepEqual(replaySolo(wild, arsenal), { ok: false, round: 1, error: 'out of range' });
  const lying = structuredClone(run);
  lying.rounds[0].claim.score += 100;
  assert.deepEqual(replaySolo(lying, arsenal), { ok: false, round: 1, error: 'mismatch' });
  const extra = structuredClone(run);
  extra.rounds.at(-1).shots.push({ w: 'shell', a: 45, p: 50, x: extra.rounds.at(-1).shots.at(-1)?.x ?? 100 });
  assert.equal(replaySolo(extra, arsenal).ok, false);
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

