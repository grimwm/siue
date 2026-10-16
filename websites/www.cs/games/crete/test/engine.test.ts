// The Island of Crete's rules, with no page: seeded generation, the chase, items,
// the hint and play-through timers. Run by `node --test`.
// src/engine.ts takes everything it shows or plays through hooks, so the test
// hands it recording ones and a manual clock.
import * as E from '../src/engine.ts';
import crypto from 'node:crypto';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { manualClock } from '../../_kit/test/clock.ts';

/** A game wired to recorders and a manual clock. */
function harness() {
  const log: { text: string; tone: E.LogTone | undefined }[] = [];
  const sounds: E.SfxName[] = [];
  const ends: boolean[] = [];
  let renders = 0;
  const { timers, advance, pending } = manualClock();
  const game = E.createGame({
    say: (text, tone) => log.push({ text, tone }),
    sfx: name => sounds.push(name),
    render: () => { renders++; },
    showEnd: won => ends.push(won),
    timers,
  });
  return { game, G: game.G, log, sounds, ends, advance, pending, renders: () => renders };
}

/** An empty arena: walls on the border only, no safe zones, barriers or loot. */
function arena(G: E.State, player: E.Cell, foe: E.Cell) {
  G.walls = Array.from({ length: E.ROWS }, (_, r) => Array.from({ length: E.COLS }, (_, c) => r === 0 || c === 0 || r === E.ROWS - 1 || c === E.COLS - 1));
  G.safe = new Set();
  G.barriers = new Set();
  G.pickups = new Map();
  G.player = { ...player };
  G.foe = { ...foe };
}
const said = (h: ReturnType<typeof harness>, re: RegExp) => h.log.some(l => re.test(l.text));
const dist = (a: E.Cell, b: E.Cell) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
/** grid[r][c], failing where the old untyped indexing would have thrown on a missing row. */
function cellAt<T>(g: readonly (readonly T[])[], r: number, c: number): T {
  const row = g[r];
  assert.ok(row, `row ${r}`);
  const v = row[c];
  assert.ok(v !== undefined, `cell ${r},${c}`);
  return v;
}
/** list[i], failing where the old untyped indexing would have thrown on a missing element. */
function nth<T>(list: readonly T[], i: number): T {
  const v = list[i];
  assert.ok(v !== undefined, `element ${i}`);
  return v;
}
/** The [row, column] of a cell key. */
function parseKey(k: string): [number, number] {
  const [r, c] = k.split(',').map(Number);
  assert.ok(r !== undefined && c !== undefined, k);
  return [r, c];
}

// ---- seeded randomness ----
await test('hash-is-pinned', () => { assert.ok(E.hashSeed('stefan-1984') === 1737770012, String(E.hashSeed('stefan-1984'))); });
await test('rng-is-pinned', () => { assert.ok(E.mulberry32(E.hashSeed('stefan-1984'))() === 0.33325220248661935, ''); });
const a = E.mulberry32(7), b = E.mulberry32(7);
await test('rng-replays-per-seed', () => { assert.ok([a(), a(), a()].join() === [b(), b(), b()].join(), ''); });
await test('rng-in-unit-interval', () => { assert.ok(Array.from({ length: 1000 }, a).every(v => v >= 0 && v < 1), ''); });

// ---- generation ----
const wallsHash = (walls: boolean[][]) => crypto.createHash('sha256').update(walls.map(r => r.map(w => (w ? '#' : '.')).join('')).join('\n')).digest('hex').slice(0, 12);
const g1 = E.generateRun('stefan-1984').layout;
const PIN = {"walls":"2b4c9d3a4f99","optimal":34,"foeDist":21,"foe":{"r":2,"c":13}}; // generateRun('stefan-1984') under the maze rule (spec section 4)
await test('maze-is-pinned-per-seed', () => { assert.ok(wallsHash(g1.walls) === PIN.walls && g1.optimal === PIN.optimal && g1.foeDist === PIN.foeDist
  && g1.foe.r === PIN.foe.r && g1.foe.c === PIN.foe.c, `${wallsHash(g1.walls)} ${g1.optimal} ${g1.foeDist} ${JSON.stringify(g1.foe)}`); });
await test('same-seed-same-maze', () => { assert.ok(wallsHash(E.generateRun('stefan-1984').layout.walls) === wallsHash(g1.walls), ''); });
await test('other-seed-other-maze', () => { assert.ok(wallsHash(E.generateRun('shot-1').layout.walls) !== wallsHash(g1.walls), ''); });
await test('blank-seed-is-random-but-named', () => { assert.ok(/^stefan-\d{4}$/.test(E.chooseSeed('  ')) && E.chooseSeed('  abc ') === 'abc', E.chooseSeed('')); });

// Every maze, over many seeds, is a fair board.
const problems: string[] = [];
for (let i = 0; i < 60; i++) {
  const { layout: l } = E.generateRun(`seed-${i}`);
  const open = (r: number, c: number) => !cellAt(l.walls, r, c);
  const fromStart = E.bfsDist(l.walls, E.START);
  // The route to the exit may cross a barrier; with every barrier open it must exist.
  const opened = l.walls.map(row => row.slice());
  for (const k of l.barriers) { const [r, c] = parseKey(k); nth(opened, r)[c] = false; }
  const toExit = cellAt(E.bfsDist(opened, E.START), E.EXIT.r, E.EXIT.c);
  if (!open(E.START.r, E.START.c) || !open(E.EXIT.r, E.EXIT.c)) problems.push(`${i}: start or exit walled`);
  if (toExit !== l.optimal || toExit < 1) problems.push(`${i}: optimal ${l.optimal} vs ${toExit}`);
  if (l.barriers.size !== 2) problems.push(`${i}: ${l.barriers.size} barriers`);
  if ([...l.barriers].some(k => { const [r, c] = parseKey(k); return open(r, c); })) problems.push(`${i}: barrier not closed`);
  if (l.pickups.size !== 8) problems.push(`${i}: ${l.pickups.size} pickups`);
  for (const k of l.pickups.keys()) { const [r, c] = parseKey(k); if (cellAt(fromStart, r, c) === -1) problems.push(`${i}: loot ${k} unreachable`); }
  const kinds = [...l.pickups.values()].sort().join();
  if (kinds !== 'fuse,fuse,jammer,page,page,page,shard,snack') problems.push(`${i}: loot ${kinds}`);
  if (l.safe.has(E.key(E.START.r, E.START.c)) || l.safe.has(E.key(E.EXIT.r, E.EXIT.c))) problems.push(`${i}: safe zone on start or exit`);
  if (l.safe.has(E.key(l.foe.r, l.foe.c)) || !open(l.foe.r, l.foe.c)) problems.push(`${i}: creature in a safe zone or wall`);
  if (l.foe.r === E.EXIT.r && l.foe.c === E.EXIT.c) problems.push(`${i}: creature on the exit`);
  if (E.spawnDistance(l) < E.MIN_SPAWN) problems.push(`${i}: creature ${E.spawnDistance(l)} steps from the start`);
}
await test('every-generated-maze-is-fair', () => { assert.ok(problems.length === 0, problems.slice(0, 3).join('; ')); });

// ---- search ----
const room = Array.from({ length: E.ROWS }, (_, r) => Array.from({ length: E.COLS }, (_, c) => r === 0 || c === 0 || r === E.ROWS - 1 || c === E.COLS - 1));
const path = E.bfsPath(room, { r: 1, c: 1 }, { r: 3, c: 4 });
await test('path-is-shortest-and-inclusive', () => { assert.ok(path.length === 6 && nth(path, 0).r === 1 && nth(path, 5).r === 3 && nth(path, 5).c === 4, String(path.length)); });
await test('path-steps-are-adjacent', () => { assert.ok(path.every((p, i) => i === 0 || dist(p, nth(path, i - 1)) === 1), ''); });
const split = room.map(r => r.slice());
for (let r = 0; r < E.ROWS; r++) nth(split, r)[7] = true;
await test('no-path-through-a-wall', () => { assert.ok(E.bfsPath(split, { r: 1, c: 1 }, { r: 1, c: 13 }).length === 0, ''); });
await test('distance-from-a-wall-is-unreachable', () => { assert.ok(E.bfsDist(room, { r: 0, c: 0 }).every(row => row.every(v => v === -1)), ''); });
await test('distance-is-manhattan-in-the-open', () => { assert.ok(cellAt(E.bfsDist(room, { r: 1, c: 1 }), 13, 13) === 24, String(cellAt(E.bfsDist(room, { r: 1, c: 1 }), 13, 13))); });

// ---- a run ----
{
  const h = harness();
  h.game.newRun('stefan-1984');
  const G = h.G;
  await test('run-starts-fresh', () => { assert.ok(G.seed === 'stefan-1984' && G.hp === E.MAX_HP && G.turns === 0 && G.pages === 0 && !G.over
    && G.player.r === 1 && G.player.c === 1 && G.optimal === PIN.optimal && G.foeSpawnDist === PIN.foeDist && G.stillTurns === 0, JSON.stringify([G.seed, G.hp, G.optimal, G.foeSpawnDist])); });
  await test('snack-heal-is-rolled-4-to-6', () => { assert.ok(G.snackHeal >= 4 && G.snackHeal <= 6, String(G.snackHeal)); });
  await test('start-inventory', () => { assert.ok(JSON.stringify(G.inv) === '{"shard":1,"snack":1,"jammer":1}', JSON.stringify(G.inv)); });
  await test('hud-distance-matches-search', () => { assert.ok(h.game.foeDistance() === cellAt(E.bfsDist(G.walls, G.player), G.foe.r, G.foe.c), ''); });
}

// Walls cost nothing; a step costs a turn and the creature moves twice.
{
  const h = harness();
  h.game.newRun('x');
  arena(h.G, { r: 1, c: 1 }, { r: 13, c: 13 });
  h.game.tryMove(-1, 0);
  await test('wall-costs-no-turn', () => { assert.ok(h.G.turns === 0 && h.G.player.r === 1 && said(h, /Wall\. The Labyrinth declines/) && h.sounds.includes('bump'), ''); });
  h.game.tryMove(0, 1);
  await test('step-costs-a-turn', () => { assert.ok(h.G.turns === 1 && h.G.player.c === 2 && h.sounds.includes('move'), ''); });
  // 24 apart, you step toward it (23), it takes two steps (21).
  await test('creature-takes-two-steps-per-turn', () => { assert.ok(dist(h.G.foe, h.G.player) === 24 - 1 - 2 + 0, `${dist(h.G.foe, h.G.player)}`); });
  await test('every-action-redraws', () => { assert.ok(h.renders() >= 1, String(h.renders())); });
}

// A frozen creature skips its turn.
{
  const h = harness();
  h.game.newRun('x');
  arena(h.G, { r: 1, c: 1 }, { r: 13, c: 13 });
  h.G.frozen = 1;
  h.game.tryMove(0, 1);
  await test('frozen-creature-stays', () => { assert.ok(h.G.foe.r === 13 && h.G.foe.c === 13 && h.G.frozen === 0 && said(h, /judders/), JSON.stringify(h.G.foe)); });
}

// Barriers and fuses.
{
  const h = harness();
  h.game.newRun('x');
  arena(h.G, { r: 5, c: 5 }, { r: 13, c: 13 });
  h.G.barriers.add(E.key(5, 6)); nth(h.G.walls, 5)[6] = true;
  h.game.tryMove(0, 1);
  await test('barrier-blocks-without-a-fuse', () => { assert.ok(h.G.player.c === 5 && h.G.turns === 0 && cellAt(h.G.walls, 5, 6) && said(h, /wants a 🔌 fuse/), ''); });
  h.G.fuses = 1;
  h.game.tryMove(0, 1);
  await test('fuse-opens-the-barrier', () => { assert.ok(h.G.player.c === 6 && h.G.fuses === 0 && h.G.opened === 1 && h.G.score === 40
    && !cellAt(h.G.walls, 5, 6) && !h.G.barriers.has(E.key(5, 6)) && h.sounds.includes('open'), JSON.stringify([h.G.player, h.G.fuses, h.G.score])); });
}

// Pickups.
{
  const h = harness();
  h.game.newRun('x');
  arena(h.G, { r: 5, c: 5 }, { r: 13, c: 13 });
  h.G.pickups.set(E.key(5, 6), 'page');
  h.G.pickups.set(E.key(5, 7), 'fuse');
  h.G.pickups.set(E.key(5, 8), 'jammer');
  h.game.tryMove(0, 1); h.game.tryMove(0, 1); h.game.tryMove(0, 1);
  await test('pickups-score-and-stock', () => { assert.ok(h.G.pages === 1 && h.G.fuses === 1 && h.G.inv.jammer === 2 && h.G.score === 120 && h.G.pickups.size === 0, JSON.stringify([h.G.pages, h.G.fuses, h.G.inv, h.G.score])); });
  await test('pickups-sound-and-say', () => { assert.ok(h.sounds.includes('page') && h.sounds.includes('pickup') && said(h, /Script page 1\/3/) && said(h, /Picked up: Signal Jammer/), ''); });
}

// Items.
{
  const h = harness();
  h.game.newRun('x');
  arena(h.G, { r: 5, c: 5 }, { r: 13, c: 13 });
  h.game.useItem('snack');
  await test('snack-at-full-health-costs-nothing', () => { assert.ok(h.G.inv.snack === 1 && h.G.turns === 0 && said(h, /Already at full health/), ''); });
  h.G.hp = 5;
  h.game.useItem('snack');
  await test('snack-heals-and-costs-a-turn', () => { assert.ok(h.G.hp === 5 + h.G.snackHeal && h.G.inv.snack === 0 && h.G.turns === 1, JSON.stringify([h.G.hp, h.G.snackHeal])); });
  h.game.useItem('snack');
  await test('empty-stock-says-so', () => { assert.ok(said(h, /No Sugar Puffs left/) && h.G.turns === 1, ''); });
  h.game.useItem('shard');
  await test('shard-freezes-and-is-free', () => { assert.ok(h.G.frozen === 1 && h.G.inv.shard === 0 && h.G.turns === 1, ''); });
  const t = h.G.turns;
  h.game.useItem('jammer');
  await test('jammer-hurls-the-creature-far', () => { assert.ok(h.G.inv.jammer === 0 && h.G.turns === t + 1 && cellAt(E.bfsDist(h.G.walls, h.G.player), h.G.foe.r, h.G.foe.c) >= 4, JSON.stringify(h.G.foe)); });
}

// Bash.
{
  const h = harness();
  h.game.newRun('x');
  arena(h.G, { r: 5, c: 5 }, { r: 9, c: 9 });
  h.game.bash();
  await test('bash-needs-the-creature-adjacent', () => { assert.ok(h.G.turns === 0 && said(h, /Nothing in reach/), ''); });
  arena(h.G, { r: 5, c: 5 }, { r: 5, c: 6 });
  h.G.hp = E.MAX_HP;
  h.game.bash();
  // Shoved from (5,6) to (5,9), dazed so it takes one step back: (5,8). The cooldown of 3 ticks once.
  await test('bash-shoves-it-three-cells-and-dazes-it', () => { assert.ok(h.G.foe.r === 5 && h.G.foe.c === 8 && h.G.bashCd === 2, JSON.stringify([h.G.foe, h.G.bashCd])); });
  await test('bash-costs-a-turn', () => { assert.ok(h.G.turns === 1 && h.sounds.includes('bash'), ''); });
  h.game.bash();
  await test('bash-recharges', () => { assert.ok(said(h, /Bash is recharging/), ''); });
}

// Safe zones keep the creature out; the aura burns beside it.
{
  const h = harness();
  h.game.newRun('x');
  arena(h.G, { r: 5, c: 5 }, { r: 5, c: 8 });
  for (const c of [4, 5, 6]) h.G.safe.add(E.key(5, c));
  h.game.tryMove(0, 1);
  await test('creature-cannot-enter-a-safe-zone', () => { assert.ok(!h.G.safe.has(E.key(h.G.foe.r, h.G.foe.c)) && !h.G.over, JSON.stringify(h.G.foe)); });
  arena(h.G, { r: 5, c: 5 }, { r: 5, c: 7 });
  const hp = h.G.hp;
  h.game.tryMove(0, -1); // 3 apart; it takes two steps and ends beside you
  await test('aura-burns-two-hp', () => { assert.ok(h.G.hp === hp - 2 && dist(h.G.foe, h.G.player) === 1 && said(h, /proximity burns/) && !h.G.over, JSON.stringify([h.G.hp, h.G.foe])); });
}

// Death and the win.
{
  const h = harness();
  h.game.newRun('x');
  arena(h.G, { r: 5, c: 5 }, { r: 5, c: 7 });
  h.game.tryMove(0, -1);
  h.game.tryMove(0, -1);
  await test('caught-ends-the-run', () => { assert.ok(h.G.over && !h.G.won && h.ends.join() === 'false' && h.sounds.includes('lose') && h.G.deathCause === 'It found you between the frames. The screen goes white.', h.G.deathCause); });
  const t = h.G.turns;
  h.game.tryMove(0, 1);
  await test('nothing-moves-after-the-end', () => { assert.ok(h.G.turns === t && said(h, /Run over — press N/), ''); });

  const w = harness();
  w.game.newRun('x');
  arena(w.G, { r: E.EXIT.r, c: E.EXIT.c - 1 }, { r: 1, c: 1 });
  w.G.pages = 2;
  w.game.tryMove(0, 1);
  await test('reaching-the-exit-wins', () => { assert.ok(w.G.over && w.G.won && w.ends.join() === 'true' && w.sounds.includes('win'), ''); });

  const k = harness();
  k.game.newRun('x');
  arena(k.G, { r: 5, c: 5 }, { r: 13, c: 13 });
  k.G.hp = 1;
  k.G.foe = { r: 5, c: 7 };
  k.game.tryMove(0, -1); // it ends beside you; the burn takes the last hit point
  await test('hp-zero-ends-the-run', () => { assert.ok(k.G.over && k.G.hp === 0 && k.G.deathCause === 'The static wore you down to nothing.' && k.ends.join() === 'false', JSON.stringify([k.G.hp, k.G.deathCause])); });
}

// Hint, answer, play-through: the timers go through the hooks.
{
  const h = harness();
  h.game.newRun('stefan-1984');
  h.game.hint();
  const route = h.game.goalPath();
  await test('hint-marks-the-next-cell', () => { assert.ok(h.G.hint === E.key(nth(route, 1).r, nth(route, 1).c) && h.sounds.includes('hint') && said(h, /^Hint: head (north|south|west|east)/), String(h.G.hint)); });
  h.advance(1599);
  await test('hint-lingers-1600ms', () => { assert.ok(h.G.hint !== null, ''); });
  h.advance(2);
  await test('hint-fades', () => { assert.ok(h.G.hint === null, ''); });
  h.game.toggleAnswer();
  await test('answer-on', () => { assert.ok(h.G.showRoute && h.sounds.includes('answerOn'), ''); });
  h.game.toggleAnswer();
  await test('answer-off', () => { assert.ok(!h.G.showRoute && h.sounds.includes('answerOff'), ''); });

  const route0 = h.game.goalPath().length;
  h.game.toggleAuto();
  await test('auto-starts-on-a-timer', () => { assert.ok(h.G.auto && h.pending() === 1 && h.G.autoTimer > 0, ''); });
  h.game.tryMove(0, 1);
  await test('player-input-waits-for-the-take-over', () => { assert.ok(said(h, /Play-through is running/), ''); });
  h.advance(350 * 5);
  await test('auto-walks-the-route', () => { assert.ok(h.G.turns >= 3 || h.G.over, String(h.G.turns)); });
  h.game.toggleAuto();
  await test('auto-pauses-on-a-second-press', () => { assert.ok(!h.G.auto && h.pending() === 0 && said(h, /Play-through paused/), ''); });
  h.game.toggleAuto();
  h.advance(350 * 700);
  await test('auto-plays-the-run-to-an-end', () => { assert.ok(h.G.over && !h.G.auto && h.pending() === 0 && route0 > 0 && h.ends.length === 1, JSON.stringify([h.G.over, h.G.turns, h.G.deathCause])); });
}

// A hidden page stops the play-through and the hint fade; showing it re-arms them.
{
  const h = harness();
  h.game.newRun('stefan-1984');
  h.game.toggleAuto();
  h.advance(350 * 2);
  const turns = h.G.turns;
  h.game.pause();
  h.game.pause();
  await test('pause-stops-the-auto-timer', () => { assert.ok(h.pending() === 0 && h.G.auto && h.G.autoTimer === 0, String(h.pending())); });
  h.advance(350 * 50);
  await test('a-hidden-page-takes-no-auto-steps', () => { assert.ok(h.G.turns === turns, `${h.G.turns} vs ${turns}`); });
  h.game.resume();
  h.game.resume();
  await test('resume-re-arms-the-auto-timer-once', () => { assert.ok(h.pending() === 1 && h.G.auto && h.G.autoTimer > 0, String(h.pending())); });
  h.advance(350 * 3);
  await test('auto-walks-again-after-resume', () => { assert.ok(h.G.turns > turns || h.G.over, String(h.G.turns)); });
  h.game.stopAuto();
  h.game.pause();
  h.game.resume();
  await test('stopping-the-auto-run-while-hidden-keeps-it-stopped', () => { assert.ok(!h.G.auto && h.pending() === 0, ''); });
  h.game.hint();
  h.game.pause();
  h.advance(5000);
  await test('a-hidden-page-keeps-the-hint', () => { assert.ok(h.G.hint !== null && h.pending() === 0, ''); });
  h.game.resume();
  h.advance(1601);
  await test('the-hint-fades-after-resume', () => { assert.ok(h.G.hint === null && h.pending() === 0, ''); });
  h.game.toggleAuto();
  h.game.pause();
  h.game.quit();
  h.game.resume();
  await test('a-run-ended-while-hidden-stays-over', () => { assert.ok(h.G.over && h.pending() === 0 && !h.G.auto, ''); });
}

// The creature steers toward you by search, breaking ties with the rng only.
{
  const h = harness();
  h.game.newRun('x');
  arena(h.G, { r: 5, c: 5 }, { r: 5, c: 9 });
  h.game.foeStep();
  await test('foe-step-gets-closer', () => { assert.ok(dist(h.G.foe, h.G.player) === 3, JSON.stringify(h.G.foe)); });
}
