// Spec section 4: a maze is kept only if a route-runner meets the creature and
// a careful player still escapes. Choice and fallback use an injected judge;
// the last tests play real mazes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as E from '../src/engine.ts';
import { dasher, strategist } from '../src/bots.ts';
import { manualClock } from '../../_kit/test/clock.ts';

/** A judge that plays nothing: each attempt's verdict comes from `table(attempt)`. */
function judge(table) {
  return (seed, attempt, bot) => {
    const row = table(attempt);
    return bot === dasher ? { won: false, met: row.met, closest: row.closest } : { won: row.won, met: false, closest: 99 };
  };
}

function harness() {
  const log = [];
  const { timers, advance, pending } = manualClock();
  const game = E.createGame({ say: text => log.push(text), sfx() {}, render() {}, showEnd() {}, timers });
  return { game, G: game.G, log, advance, pending };
}

test('the first attempt the dasher meets and the strategist wins is the maze', () => {
  const pick = E.generateRun('s', judge(a => ({ met: a >= 2, closest: a >= 2 ? 1 : 5, won: a !== 2 })));
  assert.deepEqual([pick.attempt, pick.fallback], [3, false]);
});

test('with no passing attempt, it falls back to the winnable one whose dasher came closest, earliest on a tie', () => {
  const closest = { 4: 3, 9: 2, 12: 2, 30: 5 };
  const pick = E.generateRun('s', judge(a => ({ met: false, closest: closest[a] ?? 1, won: a in closest })));
  assert.deepEqual([pick.attempt, pick.fallback], [9, true]);
});

test('it keeps drawing past 80 until the strategist wins, and never returns a maze it loses', () => {
  const pick = E.generateRun('s', judge(a => ({ met: true, closest: 0, won: a === 85 })));
  assert.deepEqual([pick.attempt, pick.fallback], [85, true]);
  assert.equal(E.MAX_ATTEMPTS, 80);
});

test('a seed nothing wins by attempt 399 is an error, not a losing maze', () => {
  assert.throws(() => E.generateRun('s', judge(() => ({ met: true, closest: 0, won: false }))), /no winnable maze/);
});

test('the pick carries its attempt\'s layout and run stream', () => {
  const pick = E.generateRun('seed-x', judge(a => ({ met: true, closest: 1, won: a === 5 })));
  assert.deepEqual(pick.layout.walls, E.layoutFor('seed-x', 5).walls);
  assert.equal(pick.rng(), E.runRng('seed-x', 5)());
});

test('real mazes: the strategist wins each one, and the dasher meets the creature unless it fell back', () => {
  for (let i = 0; i < 40; i++) {
    const seed = `rule-${i}`;
    const pick = E.generateRun(seed);
    assert.ok(E.trial(seed, pick.attempt, strategist).won, `${seed}: strategist`);
    if (!pick.fallback) assert.ok(E.trial(seed, pick.attempt, dasher).met, `${seed}: dasher`);
  }
});

test('a new run plays the picked attempt', () => {
  const h = harness();
  h.game.newRun('stefan-1984');
  assert.deepEqual(h.G.walls, E.generateRun('stefan-1984').layout.walls);
});

test('the play-through (T) wins a fresh run', () => {
  for (const seed of ['t-1', 't-2', 't-3']) {
    const h = harness();
    h.game.newRun(seed);
    h.game.toggleAuto();
    h.advance(350 * 700);
    assert.equal(h.G.won, true, seed);
    assert.equal(h.pending(), 0, `${seed}: no timer left`);
  }
});

test('T stops when there is no route, instead of spinning', () => {
  const h = harness();
  h.game.newRun('x');
  h.G.walls = Array.from({ length: E.ROWS }, (_, r) => Array.from({ length: E.COLS }, (_, c) => r === 0 || c === 0 || r === E.ROWS - 1 || c === E.COLS - 1));
  h.G.safe = new Set();
  h.G.barriers = new Set();
  h.G.pickups = new Map();
  h.G.player = { r: 5, c: 5 };
  h.G.foe = { r: 12, c: 2 };
  h.G.walls[E.EXIT.r][E.EXIT.c] = true;
  h.game.toggleAuto();
  h.advance(350);
  assert.equal(h.G.auto, false);
  assert.equal(h.pending(), 0);
  assert.ok(h.log.some(t => /Play-through is stuck/.test(t)));
});

/** Border walls only, exit at (5, 13): the board the bot tests use. */
function openBoard(h, player, foe) {
  const G = h.G;
  G.walls = Array.from({ length: E.ROWS }, (_, r) => Array.from({ length: E.COLS }, (_, c) => r === 0 || c === 0 || r === E.ROWS - 1 || c === E.COLS - 1));
  G.safe = new Set();
  G.barriers = new Set();
  G.pickups = new Map();
  G.player = { ...player };
  G.foe = { ...foe };
  G.exit = { r: 5, c: 13 };
  G.fuses = 0;
  G.inv.jammer = 0;
}

test('T started mid-run, with the way shut, stops as stuck and leaves no timer', () => {
  const h = harness();
  h.game.newRun('mid-1');
  h.game.tryMove(0, 1);
  h.game.tryMove(1, 0);
  assert.ok(h.G.turns > 0);
  openBoard(h, { r: 5, c: 5 }, { r: 12, c: 2 });
  h.G.walls[5][13] = true;
  h.game.toggleAuto();
  h.advance(350 * 3);
  assert.equal(h.G.auto, false);
  assert.equal(h.pending(), 0);
  assert.ok(h.log.some(t => /Play-through is stuck/.test(t)));
});

test('T started mid-run never waits more than six turns in a row, even if the creature will not come', () => {
  const h = harness();
  h.game.newRun('mid-2');
  h.game.tryMove(0, 1);
  openBoard(h, { r: 5, c: 5 }, { r: 5, c: 9 });
  h.G.safe.add(E.key(5, 5));
  // A creature that holds its ground: waiting would never end on its own.
  h.G.foe = { r: 5, c: 9 };
  let longest = 0;
  h.game.toggleAuto();
  for (let i = 0; i < 12 && h.G.auto && !h.G.over; i++) {
    h.G.foe = { r: 5, c: 9 };
    h.G.dazed = 0;
    h.advance(350);
    longest = Math.max(longest, h.G.stillTurns);
    if (h.G.player.c !== 5) break;
  }
  assert.equal(longest, 6, 'it waits, but gives up at six');
  assert.ok(h.G.player.c !== 5, 'it moved on after waiting');
  h.game.stopAuto();
});

test('a candidate whose barrier seals off the loot or the creature is not a maze', () => {
  // seed-13's first layout leaves 7 pickups and the creature on the exit.
  assert.equal(E.trial('seed-13', 0, strategist).won, false);
  assert.notEqual(E.generateRun('seed-13').attempt, 0);
});

test('every maze a player gets is a judged one: newRun, Play again and T all go through generateRun', () => {
  // seed-13's attempt 0 is a broken layout the judge rejects; a run on that seed must not be it.
  const h = harness();
  h.game.newRun('seed-13');
  assert.notDeepEqual(h.G.walls, E.layoutFor('seed-13', 0).walls);
  assert.deepEqual(h.G.walls, E.generateRun('seed-13').layout.walls);
  // Play again is newRun on the same seed; the result is the same judged maze.
  h.game.newRun('seed-13');
  assert.deepEqual(h.G.walls, E.generateRun('seed-13').layout.walls);
  // T plays the run it is given and never lays out another.
  h.game.toggleAuto();
  h.advance(350 * 50);
  h.game.stopAuto();
  assert.equal(h.G.seed, 'seed-13');
  // The page never reaches the unjudged entry points.
  const here = import.meta.dirname;
  for (const file of ['main.ts', 'ui.ts']) {
    const text = readFileSync(join(here, '..', 'src', file), 'utf8');
    assert.doesNotMatch(text, /\b(startRun|layoutFor)\b/, file);
  }
  // In the engine only the judge itself (trial) and the pick it returns use them.
  const engine = readFileSync(join(here, '..', 'src', 'engine.ts'), 'utf8');
  assert.equal([...engine.matchAll(/\.startRun\(/g)].length, 1, 'one caller of game.startRun: trial');
  assert.equal([...engine.matchAll(/\blayoutFor\(/g)].length, 3, 'definition, pick, startRun');
});
