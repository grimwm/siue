// The two bots that judge a maze, rule by rule, on small hand-made boards.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.ts';
import { dasher, strategist, WAIT_LIMIT } from '../src/bots.ts';
import { manualClock } from '../../_kit/test/clock.ts';

function board(player: E.Cell, foe: E.Cell, setup: (G: E.State) => void = () => {}) {
  const game = E.createGame({ say() {}, sfx() {}, render() {}, showEnd() {}, timers: manualClock().timers });
  game.newRun('bots');
  const G = game.G;
  G.walls = Array.from({ length: E.ROWS }, (_, r) => Array.from({ length: E.COLS }, (_, c) => r === 0 || c === 0 || r === E.ROWS - 1 || c === E.COLS - 1));
  G.safe = new Set();
  G.barriers = new Set();
  G.pickups = new Map();
  G.player = { ...player };
  G.foe = { ...foe };
  G.exit = { r: 5, c: 13 };
  G.fuses = 0;
  setup(G);
  return game;
}

test('the strategist bashes a creature beside it when bash is ready', () => {
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 5, c: 6 })), { kind: 'bash' });
});

test('beside it with bash recharging, the strategist raises a shard if it has one and the creature is not frozen', () => {
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 4, c: 5 }, G => { G.bashCd = 2; })), { kind: 'item', item: 'shard' });
  const frozen = strategist(board({ r: 5, c: 5 }, { r: 4, c: 5 }, G => { G.bashCd = 2; G.frozen = 1; }));
  assert.notDeepEqual(frozen, { kind: 'item', item: 'shard' });
  const none = strategist(board({ r: 5, c: 5 }, { r: 4, c: 5 }, G => { G.bashCd = 2; G.inv.shard = 0; }));
  assert.notDeepEqual(none, { kind: 'item', item: 'shard' });
});

test('the strategist throws the jammer at a creature two steps ahead on its route', () => {
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 5, c: 7 })), { kind: 'item', item: 'jammer' });
});

test('no jammer for a creature behind, or more than two steps ahead, or with no jammer left', () => {
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 5, c: 3 })), { kind: 'move', dr: 0, dc: 1 });
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 5, c: 8 })), { kind: 'move', dr: 0, dc: 1 });
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 5, c: 7 }, G => { G.inv.jammer = 0; })), { kind: 'move', dr: 0, dc: 1 });
});

test('the strategist eats a snack at 8 HP, not at 9', () => {
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 12, c: 2 }, G => { G.hp = 8; })), { kind: 'item', item: 'snack' });
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 12, c: 2 }, G => { G.hp = 9; })), { kind: 'move', dr: 0, dc: 1 });
});

test('in a safe zone with the creature ahead, the strategist waits, but not more than six turns in a row', () => {
  const safeAhead = (G: E.State) => { G.safe.add(E.key(5, 5)); G.inv.jammer = 0; };
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 5, c: 9 }, safeAhead)), { kind: 'wait' });
  assert.equal(WAIT_LIMIT, 6);
  const tired = strategist(board({ r: 5, c: 5 }, { r: 5, c: 9 }, G => { safeAhead(G); G.stillTurns = 6; }));
  assert.deepEqual(tired, { kind: 'move', dr: 0, dc: 1 });
});

test('otherwise the strategist steps along the route, and says so when there is none', () => {
  assert.deepEqual(strategist(board({ r: 5, c: 5 }, { r: 12, c: 2 })), { kind: 'move', dr: 0, dc: 1 });
  const walled = board({ r: 5, c: 5 }, { r: 12, c: 2 }, G => { G.walls[5]![13] = true; });
  assert.deepEqual(strategist(walled), { kind: 'stuck' });
});

test('the dasher only ever steps along the route, even beside the creature', () => {
  assert.deepEqual(dasher(board({ r: 5, c: 5 }, { r: 5, c: 6 })), { kind: 'move', dr: 0, dc: 1 });
  assert.deepEqual(dasher(board({ r: 5, c: 5 }, { r: 5, c: 7 }, G => { G.hp = 1; })), { kind: 'move', dr: 0, dc: 1 });
  assert.deepEqual(dasher(board({ r: 5, c: 5 }, { r: 12, c: 2 }, G => { G.walls[5]![13] = true; })), { kind: 'stuck' });
});
