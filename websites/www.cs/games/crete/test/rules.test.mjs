// The rules the bots lean on: waiting, the jammer's check, and a route that
// crosses barriers the player holds fuses for.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.ts';
import { manualClock } from '../../_kit/test/clock.ts';

function harness() {
  const log = [];
  const { timers } = manualClock();
  const game = E.createGame({ say: text => log.push(text), sfx() {}, render() {}, showEnd() {}, timers });
  game.newRun('rules');
  return { game, G: game.G, log };
}
/** Border walls only: no safe zones, barriers or loot. */
function arena(G, player, foe) {
  G.walls = Array.from({ length: E.ROWS }, (_, r) => Array.from({ length: E.COLS }, (_, c) => r === 0 || c === 0 || r === E.ROWS - 1 || c === E.COLS - 1));
  G.safe = new Set();
  G.barriers = new Set();
  G.pickups = new Map();
  G.player = { ...player };
  G.foe = { ...foe };
  G.fuses = 0;
}
const wallAcross = (G, c) => { for (let r = 1; r < E.ROWS - 1; r++) G.walls[r][c] = true; };

test('waiting spends a turn in place, the creature moves, and the run counts it', () => {
  const h = harness();
  arena(h.G, { r: 5, c: 5 }, { r: 5, c: 11 });
  h.game.wait();
  assert.deepEqual(h.G.player, { r: 5, c: 5 });
  assert.equal(h.G.turns, 1);
  assert.equal(E.manhattan(h.G.foe, h.G.player), 4);
  assert.equal(h.G.stillTurns, 1);
  h.game.wait();
  assert.equal(h.G.stillTurns, 2);
  h.game.tryMove(0, -1);
  assert.equal(h.G.stillTurns, 0);
});

test('waiting is refused once the run is over', () => {
  const h = harness();
  h.G.over = true;
  h.game.wait();
  assert.equal(h.G.turns, 0);
  assert.ok(h.log.some(t => /Run over/.test(t)));
});

test('the jammer check finds a far cell without drawing from the run', () => {
  const h = harness();
  arena(h.G, { r: 5, c: 5 }, { r: 13, c: 13 });
  const probe = E.mulberry32(1);
  h.G.rng = () => { throw new Error('drew'); };
  assert.equal(h.game.canJam(), true);
  h.G.walls = h.G.walls.map((row, r) => row.map((_, c) => !(r >= 4 && r <= 6 && c >= 4 && c <= 6)));
  assert.equal(h.game.canJam(), false);
  h.G.rng = probe;
});

test('the jammer is refused, at no cost, when nowhere is far enough', () => {
  const h = harness();
  arena(h.G, { r: 5, c: 5 }, { r: 5, c: 6 });
  h.G.walls = h.G.walls.map((row, r) => row.map((_, c) => !(r >= 4 && r <= 6 && c >= 4 && c <= 6)));
  h.G.inv.jammer = 1;
  h.game.useItem('jammer');
  assert.equal(h.G.inv.jammer, 1);
  assert.equal(h.G.turns, 0);
});

test('a route crosses a barrier the player holds a fuse for', () => {
  const h = harness();
  arena(h.G, { r: 7, c: 3 }, { r: 1, c: 1 });
  wallAcross(h.G, 7);
  h.G.walls[7][7] = true;
  h.G.barriers.add(E.key(7, 7));
  h.G.exit = { r: 7, c: 11 };
  assert.deepEqual(h.game.goalPath(), [], 'no fuse held and none to fetch: no route');
  h.G.fuses = 1;
  const route = h.game.goalPath();
  assert.deepEqual(route[0], { r: 7, c: 3 });
  assert.deepEqual(route.at(-1), { r: 7, c: 11 });
  assert.ok(route.some(p => p.r === 7 && p.c === 7), 'through the barrier');
});

test('without enough fuses the route goes to the nearest fuse first', () => {
  const h = harness();
  arena(h.G, { r: 7, c: 3 }, { r: 1, c: 1 });
  wallAcross(h.G, 7);
  h.G.walls[7][7] = true;
  h.G.barriers.add(E.key(7, 7));
  h.G.exit = { r: 7, c: 11 };
  h.G.pickups.set(E.key(2, 2), 'fuse');
  assert.deepEqual(h.game.goalPath().at(-1), { r: 2, c: 2 });
});

test('an open way to the exit is preferred to one through a barrier', () => {
  const h = harness();
  arena(h.G, { r: 7, c: 3 }, { r: 1, c: 1 });
  h.G.walls[7][7] = true;
  h.G.barriers.add(E.key(7, 7));
  h.G.exit = { r: 7, c: 11 };
  h.G.fuses = 1;
  assert.ok(!h.game.goalPath().some(p => p.r === 7 && p.c === 7));
});

test('each attempt has its own maze stream and run stream, derived from the seed', () => {
  const a = E.mazeRng('stefan-1984', 3);
  const b = E.mulberry32(E.hashSeed('stefan-1984:maze:3'));
  assert.deepEqual([a(), a(), a()], [b(), b(), b()]);
  const r = E.runRng('stefan-1984', 3);
  const s = E.mulberry32(E.hashSeed('stefan-1984:run:3'));
  assert.deepEqual([r(), r()], [s(), s()]);
});

test('an attempt always lays out the same maze, as a fresh copy', () => {
  const one = E.layoutFor('lay', 2);
  const two = E.layoutFor('lay', 2);
  assert.deepEqual(one.walls, two.walls);
  assert.notEqual(one.walls, two.walls);
  assert.notDeepEqual(E.layoutFor('lay', 3).walls, one.walls);
});

test('starting a run on an attempt plays that maze from that run stream', () => {
  const h = harness();
  h.game.startRun('lay', 2);
  assert.equal(h.G.seed, 'lay');
  assert.deepEqual(h.G.walls, E.layoutFor('lay', 2).walls);
  const stream = E.runRng('lay', 2);
  assert.equal(h.G.snackHeal, 4 + Math.floor(stream() * 3));
  assert.equal(h.G.rng(), stream());
  assert.deepEqual([h.G.turns, h.G.hp, h.G.over], [0, E.MAX_HP, false]);
});
