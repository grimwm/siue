// The solo referee (src/solo.ts) without a page: the deal, a round's muster,
// settling a volley, the turn order and 1-ups.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, SPAWN_GAP, TUNE, surfY } from '../src/sim.ts';
import { soloAim, soloDeal, soloMuster, soloSettle, soloNextTurn, soloOneUps, snapTanks } from '../src/solo.ts';

const GAME = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);
const fresh = (seed, level = 'normal', w = 720) => { const G = { body: 'tank' }; soloDeal(G, arsenal, seed, level, w); return G; };
const round1 = (seed, level = 'normal', w = 720) => { const G = fresh(seed, level, w); G.round = 1; soloMuster(G, arsenal); return G; };

test('a deal keeps its width; a wide field is the same hills with the units spread over it', () => {
  const a = round1('alpha'), b = round1('alpha', 'normal', 1440);
  assert.equal(b.w, 1440);
  assert.equal(b.terrain.length, 1440);
  assert.deepEqual(b.terrain.slice(0, 720), a.terrain);
  const xs = b.tanks.map(t => t.x).sort((x, y) => x - y);
  assert.ok(xs[0] >= 30 && xs.at(-1) <= 1410);
  for (let i = 1; i < xs.length; i++) assert.ok(xs[i] - xs[i - 1] >= SPAWN_GAP, 'nobody starts inside another\'s blast');
  assert.throws(() => soloDeal({ body: 'tank' }, arsenal, 'x', 'normal', 1000), RangeError);
});

test('a deal is the stake, three lives and full armor', () => {
  const G = fresh('alpha');
  assert.equal(G.cash, 600);
  assert.equal(G.lives, TUNE.lives);
  assert.equal(G.armor, 100);
  assert.equal(G.ammo.shell, Infinity);
  assert.equal(G.ammo.buck, 1);
  assert.equal(G.round, 0);
});

test('the same seed musters the same round', () => {
  const a = round1('alpha'), b = round1('alpha'), c = round1('beta');
  assert.deepEqual(a.terrain, b.terrain);
  assert.deepEqual(a.tanks.map(t => [t.x, t.s]), b.tanks.map(t => [t.x, t.s]));
  assert.equal(a.wind, b.wind);
  assert.notDeepEqual(a.terrain, c.terrain);
  assert.equal(a.tanks.length, 4);
  assert.equal(a.tanks[0].hp, 100);
  assert.equal(a.tanks[1].hp, TUNE.droneArmor);
});

test('a round won pays the bonus and carries the armor', () => {
  const G = round1('alpha');
  G.tanks[0].hp = 64;
  for (const t of G.tanks.slice(1)) t.hp = 0;
  const end = soloSettle(G);
  assert.deepEqual(end, { kind: 'roundWon', bonus: 900, prize: 600 });
  assert.equal(G.score, 900);
  assert.equal(G.armor, 64);
  assert.equal(G.roundsWon, 1);
});

test('a wreck costs a life and re-musters at full max; the last life ends the match', () => {
  const G = round1('alpha');
  G.plate = 1;
  G.tanks[0].hp = 0;
  G.tanks[1].hp = 0; G.tanks[2].hp = 0;
  assert.deepEqual(soloSettle(G), { kind: 'tankLost' });
  assert.equal(G.lives, 2);
  assert.equal(G.armor, 125);
  G.lives = 1;
  G.tanks[0].hp = 0;
  assert.deepEqual(soloSettle(G), { kind: 'matchLost' });
  assert.equal(G.lives, 0);
});

test('play goes on, the wind shifts, and the turn skips the wrecked', () => {
  const G = round1('alpha');
  G.turn = 0;
  G.tanks[1].hp = 0;
  assert.deepEqual(soloSettle(G), { kind: 'next' });
  assert.equal(G.turn, 2);
  G.turn = 3; soloNextTurn(G);
  assert.equal(G.turn, 0);
});

test('with the player down the drones get WATCH_TURNS settles', () => {
  const G = round1('alpha');
  G.tanks[0].hp = 0;
  let end;
  for (let i = 0; i < 40 && (!end || end.kind === 'next'); i++) end = soloSettle(G);
  assert.deepEqual(end, { kind: 'tankLost' });
  assert.equal(G.watchTurns, 40);
});

test('the deal keeps its difficulty, and the drones aim with it', () => {
  assert.equal(fresh('alpha', 'hard').difficulty, 'hard');
  const easy = round1('alpha', 'easy'), hard = round1('alpha', 'hard');
  const aim = G => { const t = G.tanks[1]; const c = soloAim(G, arsenal, t); return [c.wkey, c.angle, c.power]; };
  assert.notDeepEqual(aim(easy), aim(hard));
});

test('1-ups: a life per 3000, or 500 points at five lives', () => {
  const G = fresh('alpha');
  G.score = 6100;
  G.lives = 3;
  assert.deepEqual(soloOneUps(G), [{ kind: 'life', lives: 4 }, { kind: 'life', lives: 5 }]);
  assert.equal(G.lives, 5);
  G.score = 12000;
  assert.deepEqual(soloOneUps(G), [{ kind: 'points', lives: 5 }, { kind: 'points', lives: 5 }]);
  assert.equal(G.score, 13000);
});

test('snapTanks puts standing tanks on the ground and leaves wrecks where they hang', () => {
  const G = round1('alpha');
  const [a, b] = G.tanks;
  a.y = surfY(G.terrain, a.x) - 0.3; a.vy = 2;
  b.hp = 0; b.y = 5; b.vy = 3;
  snapTanks(G);
  assert.equal(a.y, surfY(G.terrain, a.x));
  assert.equal(a.vy, 0);
  assert.equal(b.y, 5);
  assert.equal(b.vy, 3);
});
