// A solo match played to its end is saved once on this browser's board, under
// the difficulty it was dealt, and the end card says where it went. Drives the
// real createMatch with stubbed surroundings.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Difficulty } from '../src/sim.ts';
import type { GameState } from '../src/game-types.ts';
import type { LocalRow } from '../src/local-board.ts';
import type { Phase } from '../src/flow.ts';
import { arsenal, harness, must, nth, surfY } from './match-harness.ts';
import type { Match } from './match-harness.ts';

/** The frame until the match is over. The player fires straight up, softly. */
function playOut(G: GameState, match: Match) {
  for (let i = 0; i < 3_000_000 && !G.over; i++) {
    match.checkOneUps();
    if (G.phase === 'banner') match.tickBanner(10);
    else if (G.phase === 'shop') match.nextRound();
    else if (G.phase === 'aim') { nth(G.tanks, 0).angle = 90; nth(G.tanks, 0).power = 12; match.playerFire(); }
    else { match.fallTanks(1 / 60); match.stepWar(1 / 60); }
  }
  assert.ok(G.over, 'the match ended');
}

test('a finished solo match is saved once, on its dealt difficulty, and the card reads the local line', () => {
  const saves: [Difficulty, LocalRow][] = [];
  const { G, match } = harness({
    difficulty: { get: () => 'hard' }, initials: () => 'WGR',
    saveLocal: (level, row) => { saves.push([level, row]); return { place: 3, kept: true }; },
  });
  match.startSolo('local-1');
  playOut(G, match);
  assert.equal(saves.length, 1);
  const [level, row] = nth(saves, 0);
  assert.equal(level, 'hard');
  assert.equal(row.initials, 'WGR');
  assert.equal(row.score, G.score);
  assert.equal(row.rounds, G.roundsWon);
  assert.equal(row.seed, 'local-1');
  assert.equal(row.kind, 'solo');
  assert.match(row.at, /^\d{4}-\d\d-\d\dT/);
  assert.equal(row.ref, `solo:local-1:${row.at}`);
  assert.equal(match.END.filed, "Saved on this browser's board · #3 on Hard");
  // The settle that ended it never ends it twice.
  match.checkOneUps();
  assert.equal(saves.length, 1);
});

test('blocked storage: the card says this browser cannot keep scores', () => {
  const { G, match } = harness({
    difficulty: { get: () => 'normal' }, initials: () => 'WGR', saveLocal: () => ({ place: null, kept: false }),
  });
  match.startSolo('local-2');
  playOut(G, match);
  assert.equal(match.END.filed, "This browser can't keep scores (storage is blocked).");
});

test('the demo saves nothing', () => {
  const saves: unknown[] = [];
  const { G, match } = harness({ difficulty: { get: () => 'normal' }, initials: () => 'WGR', saveLocal: (...a) => { saves.push(a); return { place: 1, kept: true }; } });
  match.startDemo();
  for (let i = 0; i < 200000; i++) {
    if (G.phase === 'banner') match.tickBanner(10);
    else if (G.phase === 'shop') match.nextRound();
    else { match.fallTanks(1 / 60); match.stepWar(1 / 60); }
  }
  assert.deepEqual(saves, []);
});

test('a fall still playing out when a match is left never speaks in the next one', () => {
  const said: string[] = [];
  const { G, match } = harness({ say: t => said.push(t), difficulty: { get: () => 'normal' } });
  const toFirstTurn = () => {
    for (let i = 0; i < 10_000 && G.phase !== 'aim'; i++) {
      if (G.phase === 'banner') match.tickBanner(10);
      else if (G.phase === 'shop') match.nextRound();
      else { match.fallTanks(1 / 60); match.stepWar(1 / 60); }
    }
    assert.equal(G.phase, 'aim');
  };
  match.startSolo('falls');
  toFirstTurn();
  // A drone hangs over a pit when its volley's last shell goes off the board.
  const foe = nth(G.tanks, 1);
  foe.y -= 120;
  foe.fellBy = 0;
  G.shells = [{ x: -100, y: 100, vx: -50, vy: 0, wkey: 'shell', owner: nth(G.tanks, 0), life: 1, age: 1, pierced: false, split: false, order: [0] }];
  G.phase = 'fly';
  match.stepWar(1 / 60);
  assert.equal(match.fallsPending(), 1, 'its landing waits to be seen');
  said.length = 0;
  match.startSolo('next');
  assert.equal(match.fallsPending(), 0, 'a new match starts with none');
  toFirstTurn();
  for (let i = 0; i < 600; i++) match.fallTanks(1 / 60);
  assert.ok(!said.some(t => /falls|crater/.test(t)), said.join(' | '));
});

test('the turn does not pass while a napalm pool burns, and its ticks land on the drone in it', () => {
  const said: string[] = [];
  const { G, match } = harness({ say: t => said.push(t), difficulty: { get: () => 'normal' } });
  match.startSolo('napalm');
  for (let i = 0; i < 10_000 && G.phase !== 'aim'; i++) {
    if (G.phase === 'banner') match.tickBanner(10);
    else if (G.phase === 'shop') match.nextRound();
    else { match.fallTanks(1 / 60); match.stepWar(1 / 60); }
  }
  assert.equal(G.phase, 'aim');
  // A narrow valley under the first drone; everyone else on the flat around it.
  const foe = nth(G.tanks, 1), cx = Math.round(foe.x);
  G.terrain = G.terrain.map((_, ix) => 330 + 90 * Math.max(0, 1 - Math.abs(ix - cx) / 60));
  for (const t of G.tanks) t.y = surfY(G.terrain, t.x);
  const hp = foe.hp, turn = G.turn;
  // The player's napalm comes straight down into the valley.
  G.shells = [{ x: cx, y: 380, vx: 0, vy: 80, wkey: 'napalm', owner: nth(G.tanks, 0), life: 5, age: 1, pierced: false, split: false, order: [0], clear: true }];
  G.phase = 'fly' as Phase; // as Phase: stepWar moves it on, which tsc cannot see
  let burning = 0;
  for (let i = 0; i < 2000 && (G.shells.length || (G.fires || []).length); i++) {
    match.fallTanks(1 / 60);
    match.stepWar(1 / 60);
    if ((G.fires || []).length) {
      burning++;
      assert.equal(G.phase, 'settle', 'a burning pool holds the volley open');
      assert.equal(G.turn, turn, 'the turn waits for the fire');
    }
  }
  const w = must(arsenal.weapons.napalm, 'the napalm row');
  const burn = must(w.burn, 'its burn'), tick = must(w.tick, 'its tick');
  assert.ok(Math.abs(burning - burn * 60) <= 2, `it burned ${burning} steps`);
  assert.equal(hp - foe.hp, w.dmg * Math.floor(burn / tick), 'every tick burned the drone in the pool');
  assert.ok(said.some(t => /burn/i.test(t)), said.join(' | '));
  for (let i = 0; i < 600 && G.phase === 'settle'; i++) { match.fallTanks(1 / 60); match.stepWar(1 / 60); }
  assert.notEqual(G.phase, 'settle', 'once it is out, the turn passes');
});
