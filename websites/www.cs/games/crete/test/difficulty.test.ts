// The difficulty measure on small hand-made levels, and the campaign gate: every released level clears the bar,
// every piece on it matters, its beast is a threat, and a chapter's challenge levels are a real fight.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { measure, measuring, hardPieces, challengeProblems, catchProblems, rampProblems, rampOf, hiddenProblems, hidesWalls, HIDDEN, RAMP, BAR, canCatch, plainWalk, sharedProblems, SHARED_BAR, uselessProblems, pieceUnits, USEFUL, threatOf, threatProblems, THREAT, startProblems } from '../src/puzzle/difficulty.ts';
import { CAMPAIGN_TEXTS } from '../src/endless/campaign.ts';
import type { Difficulty } from '../src/puzzle/difficulty.ts';
import { CHAPTERS, levelById } from '../src/campaign/chapters.ts';
import type { Level } from '../src/puzzle/level.ts';
import { parse, serialize } from '../src/puzzle/level.ts';
import { initial } from '../src/puzzle/state.ts';
import { lineOf } from '../src/puzzle/cache.ts';
import type { State } from '../src/puzzle/state.ts';
import { step } from '../src/puzzle/step.ts';
import type { Action } from '../src/puzzle/step.ts';
import { DIRS } from '../src/puzzle/tiles.ts';
import { stateKey } from './reference-solver.ts';
import { corpus } from './corpus.ts';

const level = (rows: readonly string[], header = '') => parse(`title: t\nintro: i\n${header}\n${rows.join('\n')}\n`);

/** The beast is walled off in his own hall: he never touches the route. */
const WALLED = level([
  '#######',
  '#P...E#',
  '#######',
  '#M....#',
  '#######',
]);
/** Walking straight up to the exit runs into the beast; the only win spends a catch. */
const CHASED = level([
  '########',
  '#..SM.E#',
  '#......#',
  '#......#',
  '#.....P#',
  '########',
], 'hearts: 2');

test('a walled-off Minotaur adds nothing: delta 0, the line that ignores him wins, and the bar says so', () => {
  const d = measure(WALLED);
  assert.deepEqual(d, { solved: true, shortest: 4, explored: d.explored, withoutMinotaur: 4, minotaurDelta: 0, greedyWins: true, catchFree: 4, catches: 0, label: 'solo', naiveWins: true, line: 'rrrr' });
  assert.match(challengeProblems(d).join(), /does not matter/);
});

test('a level without a Minotaur: no Minotaur-free search, delta 0, the line wins', () => {
  const d = measure({ ...WALLED, minotaur: null });
  assert.equal(d.withoutMinotaur, null);
  assert.equal(d.minotaurDelta, 0);
  assert.equal(d.greedyWins, true);
  assert.deepEqual(challengeProblems(d), []);
  assert.match(challengeProblems(d, BAR, { teaching: [] }).join(), /has a Minotaur/);
});

test('a Minotaur in the way: ignoring him loses, he adds moves, and the only win takes a catch', () => {
  const d = measure(CHASED);
  assert.equal(d.shortest, 6);
  assert.equal(d.withoutMinotaur, 3);
  assert.equal(d.minotaurDelta, 3);
  assert.equal(d.greedyWins, false);
  assert.equal(d.catches, 1);
  assert.equal(d.catchFree, 'none', 'proved: no win without a catch');
  assert.deepEqual(challengeProblems(d), ['no win without a catch: no level may need one']);
  const free = measure(WALLED);
  assert.equal(free.catchFree, free.shortest, 'a catch-free win is the shortest when nothing chases');
});

test('no level needs a catch: not to win, and not for the fewest moves', () => {
  const d = measure(CHASED);
  assert.deepEqual(catchProblems(d), ['no win without a catch: no level may need one']);
  assert.deepEqual(catchProblems({ ...d, catchFree: 9 }), ['the fewest moves take a catch (6, against 9 without one): no level may need one']);
  assert.deepEqual(catchProblems({ ...d, catchFree: 6 }), ['the shortest line takes a catch, though a line as short takes none: no level may need one']);
  assert.deepEqual(catchProblems({ ...d, catchFree: 6, catches: 0 }), []);
  assert.deepEqual(catchProblems({ ...d, catchFree: 'unknown' }), ['the catch-free search hit its cap']);
  assert.deepEqual(catchProblems(measure(WALLED)), []);
  assert.match(challengeProblems(d, BAR, { teaching: [] }).join(), /no level may need one/, 'a challenge level too');
});

test('the challenge rules: against the teaching levels and the bar', () => {
  const d = measure(CHASED);
  const easy = { ...d, explored: 1, shortest: 2 };
  assert.match(challengeProblems(d, BAR, { teaching: [easy] }).join(), /adds 3 moves, the bar is 8/);
  // CHASED's only win takes a catch; these checks look past that rule (catchProblems has its own test).
  const free = { ...d, catches: 0, catchFree: d.shortest };
  assert.deepEqual(challengeProblems(free, { minotaurDelta: 3, exploredTimes: 1 }, { teaching: [easy] }), []);
  const hard = { ...d, explored: d.explored, shortest: 7 };
  const p = challengeProblems(free, { minotaurDelta: 3, exploredTimes: 2 }, { teaching: [easy, hard] });
  assert.equal(p.length, 2, p.join('; '));
  assert.match(p[0]!, /stored \d+ situations/);
  assert.match(p[1]!, /shorter than the longest teaching level's 7/);
  assert.match(challengeProblems(measure(WALLED), { minotaurDelta: 0, exploredTimes: 0 }, { teaching: [] }).join(), /must lose/);
});

test('the ramp: each challenge level stores 1.2 to 2.2 times the situations of the one before it', () => {
  const d = measure(CHASED);
  const at = (explored: number) => ({ ...d, explored });
  assert.deepEqual(RAMP, { least: 1.2, most: 2.2 });
  assert.deepEqual(rampProblems(at(1000), at(1200)), []);
  assert.deepEqual(rampProblems(at(1000), at(2200)), []);
  assert.match(rampProblems(at(1000), at(1100)).join(), /1\.10 × the challenge level before it \(1000\); the ramp asks at least 1\.2 ×/);
  assert.match(rampProblems(at(1000), at(900)).join(), /at least 1\.2 ×/, 'easier than the one before');
  assert.match(rampProblems(at(1000), at(2300)).join(), /2\.30 × .*the ramp allows at most 2\.2 ×/, 'a cliff');
});

test('a capped search is unknown, never none; an exhausted one is none', () => {
  const capped = measure(CHASED, 5);
  assert.equal(capped.solved, false);
  assert.equal(capped.shortest, 'unknown');
  assert.equal(capped.catchFree, 'unknown');
  assert.equal(capped.minotaurDelta, null);
  assert.match(challengeProblems(capped).join(), /hit its cap/);
  const sealed = measure(level(['#####', '#P#E#', '#####']));
  assert.equal(sealed.shortest, 'none');
  assert.equal(sealed.catchFree, 'none');
  assert.deepEqual(challengeProblems(sealed), ['the level cannot be won']);
});

/** An open corridor: the beast runs at Theseus from the start. */
const CORRIDOR = level([
  '#########',
  '#P.....E#',
  '#.......#',
  '#......M#',
  '#########',
]);
/** The beast paces behind a river he cannot cross, and nothing can fill it. */
const RIVER = level([
  '#######',
  '#P...E#',
  '#~~~~~#',
  '#M....#',
  '#######',
]);
/** The beast is behind a red door whose key is sealed in the wall: only the search can prove he never gets out. */
const LOCKED = level([
  '######r',
  '#P...E#',
  '###R###',
  '#M....#',
  '#######',
]);

test('canCatch: a search that stops at the first catch; false when proved none, null when capped', () => {
  assert.equal(canCatch(CORRIDOR), true);
  assert.equal(canCatch(CHASED), true);
  assert.equal(canCatch(RIVER), false);
  assert.equal(canCatch(WALLED), false);
  assert.equal(canCatch(LOCKED), false, 'proved by exhausting every situation');
  assert.equal(canCatch({ ...CORRIDOR, minotaur: null }), false, 'no Minotaur, no catch');
  assert.equal(canCatch(CORRIDOR, 1), null, 'capped is unknown, never no');
});

/** An n × n room cut in two by a wall with a green door. Theseus starts beside the exit in the top half, among
 *  relics he need not take (they multiply the situations), and the beast paces the bottom half. With `key`, a green
 *  key lies sealed in the wall, where nobody can reach it. */
function doorPen(n: number, key = false): Level {
  const half = Math.floor(n / 2);
  const rows = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c): string => {
    if (r === 0 || c === 0 || r === n - 1 || c === n - 1) return '#';
    if (r === half) return c === half ? 'G' : '#';
    if (r === 1 && c === 1) return 'P';
    if (r === 1 && c === 2) return 'E';
    if (r === n - 2 && c === 1) return 'M';
    return r < half && r > 1 && (r * 7 + c * 3) % 11 === 0 ? '*' : '.';
  }));
  if (key) rows[0]![n - 1] = 'g';
  return level(rows.map(r => r.join('')), 'relics: 0');
}

test('a beast penned behind a door whose key is not on the board is proved solo by the flood, without a search', () => {
  const room = doorPen(30);
  assert.equal(canCatch(room, 1), false, 'proved before a single situation is stored');
  assert.equal(measure(room).label, 'solo');
  const river = level(['#######', '#P...E#', '#~~~~~#', '#M....#', '#######']);
  assert.equal(canCatch(river, 1), false, 'water with no block to fill it pens him');
  assert.equal(canCatch({ ...river, objects: river.objects.map((o, i) => (i === 10 ? 'block' : o)) }, 1), null,
    'a block could fill the water: the flood cannot prove it');
});

test('the flood counts a fake wall, a bomb, a block machine and a teleport as ways through', () => {
  // Each pen holds the Minotaur only while the piece is walled up; with the piece the flood proves nothing, so a
  // search of one situation gives up.
  const pens: [string, string[], string][] = [
    ['fake wall', ['#######', '#P...E#', '###W###', '#M....#', '#######'], ''],
    ['bomb', ['#######', '#P...E#', '###!###', '#M....#', '#######'], ''],
    ['block machine', ['#######', '#P+.C.#', '#~~~~~#', '#M...E#', '#######'], 'machines: block-down'],
    ['teleport', ['#######', '#P.@.E#', '#######', '#M.@..#', '#######'], ''],
  ];
  for (const [name, rows, header] of pens) {
    assert.equal(canCatch(level(rows, header), 1), null, `${name}: not proved apart`);
    const walled = rows.map(r => r.replace(/[W!C@]/g, '#'));
    assert.equal(canCatch(level(walled, header.startsWith('machines') ? '' : header), 1), false, `${name} walled: proved apart`);
  }
});

test('a long catch search yields its progress, and stops when its caller does', () => {
  const room = doorPen(14, true);
  const batches = measuring(room, 2_000_000, { every: 64 });
  const seen: number[] = [];
  let n = batches.next();
  for (; !n.done; n = batches.next()) seen.push(n.value.expanded);
  assert.equal(n.value.label, 'solo', 'proved by exhausting every situation');
  assert.ok(seen.length >= 5, `the catch search reports as it goes (${seen.length} reports)`);
  for (let i = 1; i < seen.length; i++) assert.ok(seen[i]! > seen[i - 1]!);
  const stopped = measuring(doorPen(30, true), 2_000_000, { every: 64 });
  for (let i = 0; i < 3; i++) assert.equal(stopped.next().done, false);
  assert.equal(stopped.return(undefined as never).done, true, 'abandoned between batches');
});

/** The plain way to ask: every situation from the start, keyed by the reference's string, until the Minotaur
 *  catches. */
function catchByStrings(lv: Level): boolean | null {
  const seen = new Set<string>();
  const queue: State[] = [initial(lv)];
  seen.add(stateKey(queue[0]!));
  const actions: Action[] = [{ kind: 'wait' }, ...DIRS.map((dir): Action => ({ kind: 'move', dir })),
    ...(['mirror', 'cake', 'cow'] as const).map((tool): Action => ({ kind: 'tool', tool }))];
  for (let k = 0; k < queue.length; k++) {
    const s = queue[k]!;
    for (const a of actions) {
      if (a.kind === 'tool' && s.tools[a.tool] <= 0) continue;
      const x = step(s, a);
      if (x.events.some(e => e.kind === 'caught' && e.by === 'minotaur')) return true;
      if (x.state === s || x.state.outcome !== 'playing') continue;
      const key = stateKey(x.state);
      if (seen.has(key)) continue;
      if (seen.size >= 20_000) return null;
      seen.add(key);
      queue.push(x.state);
    }
  }
  return false;
}

test('canCatch agrees with a plain search over every situation, on generated levels', () => {
  let solo = 0, chase = 0;
  // Each level as generated, and again with safe ground around the beast (he may stay penned, or a door, a river
  // or a toggle wall beside him may let him out).
  const penned = (lv: Level): Level => {
    const m = lv.minotaur!;
    const terrain = lv.terrain.map((t, i) => {
      const r = Math.floor(i / lv.cols), c = i % lv.cols;
      return Math.abs(r - m.r) + Math.abs(c - m.c) === 1 && t === 'floor' && !lv.objects[i] ? 'safe' as const : t;
    });
    return { ...lv, terrain };
  };
  for (const lv of corpus(4, 60).filter(l => l.minotaur).flatMap(l => [l, penned(l)])) {
    const want = catchByStrings(lv);
    if (want === null) continue;
    assert.equal(canCatch(lv), want, serialize(lv));
    if (want) chase++; else solo++;
  }
  assert.ok(solo > 0 && chase > 0, `${solo} solo, ${chase} chase`);
});

test('the label: chase when a catch is reachable, solo when none is or there is no Minotaur', () => {
  assert.equal(measure(CORRIDOR).label, 'chase');
  assert.equal(measure(CHASED).label, 'chase');
  assert.equal(measure(RIVER).label, 'solo');
  assert.equal(measure(LOCKED).label, 'solo');
  assert.equal(measure({ ...WALLED, minotaur: null }).label, 'solo');
  assert.equal(measure(LOCKED, 1).label, 'unknown');
});

test('a level where only a hazard catches is solo', () => {
  // The Minotaur is penned behind a toggle wall with no button: the floods meet, so only the search can tell.
  const lv = level([
    '#########',
    '#P..o...#',
    '#.......#',
    '#......E#',
    '####T####',
    '#...M...#',
    '#########',
  ], 'facing: left');
  let s = initial(lv);
  for (let i = 0; i < 2; i++) s = step(s, { kind: 'wait' }).state;
  const { events } = step(s, { kind: 'wait' });
  assert.ok(events.some(e => e.kind === 'caught' && e.by === 'hazard'), 'the ball catches Theseus');
  assert.equal(canCatch(lv), false);
  assert.equal(measure(lv).label, 'solo');
});

test('naiveWins: the plain walk to the exit, ignoring every piece, played on the real level', () => {
  assert.equal(measure(level(['#######', '#P...E#', '#.....#', '#######'])).naiveWins, true, 'an open room');
  const door = level([
    '#######',
    '#P.R.E#',
    '#.###.#',
    '#r....#',
    '#######',
  ]);
  const d = measure(door);
  assert.equal(d.solved, true);
  assert.equal(d.naiveWins, false, 'the plain walk runs into the door without its key');
  assert.equal(measure(level(['#######', '#P.~.E#', '#######'])).naiveWins, false, 'water stops the plain walk');
  assert.equal(measure(CHASED).naiveWins, false, 'the beast stops the plain walk');
  const relics = level([
    '########',
    '#*.P.|E#',
    '########',
  ]);
  assert.equal(measure(relics).naiveWins, true, 'the walk takes the relics the gate needs first');
  assert.equal(measure(level(['#####', '#P#E#', '#####'])).naiveWins, false, 'no plain path at all');
});

test('plainWalk: the shortest plain path through the relics the gate needs, then the nearest exit', () => {
  const some = level(['##########', '#*..P.*.*#', '#####|####', '#####E####', '##########'], 'relics: 2');
  assert.equal(plainWalk(some)!.length, 2 + 2 + 3 + 2, 'the two relics to the right, back, then down through the gate');
  assert.equal(measure(some).naiveWins, true);
  const row = level([`${'#'.repeat(23)}`, `#P${'*'.repeat(18)}|E#`, `${'#'.repeat(23)}`]);
  assert.equal(plainWalk(row)!.length, 20, 'past the exact limit the walk takes the nearest relic each time');
  assert.equal(measure(row).naiveWins, true);
});

test('a level that hides walls is held to a lower band: a gentler ramp and a ceiling on its search', () => {
  assert.deepEqual(HIDDEN, { ramp: { least: 1.1, most: 1.5 }, most: 20_000 });
  const plain = level(['#####', '#P.E#', '#####']);
  const fake = level(['#####', '#PWE#', '#####']);
  const unseen = level(['######', '#P.IE#', '######']);
  assert.equal(hidesWalls(plain), false);
  assert.ok(hidesWalls(fake) && hidesWalls(unseen));
  assert.equal(rampOf(plain), RAMP);
  assert.equal(rampOf(fake), HIDDEN.ramp);
  assert.ok(HIDDEN.ramp.most < RAMP.most, 'a smaller step up than a plain level may take');
  const at = (explored: number) => ({ ...measure(plain), explored });
  assert.deepEqual(rampProblems(at(10_000), at(16_000), rampOf(plain)), [], 'a plain level may climb 1.6 ×');
  assert.match(rampProblems(at(10_000), at(16_000), rampOf(fake)).join(), /at most 1\.5 ×/, 'one that hides walls may not');
  assert.deepEqual(hiddenProblems(plain, at(40_000)), [], 'no ceiling on a plain level');
  assert.deepEqual(hiddenProblems(fake, at(HIDDEN.most)), []);
  assert.match(hiddenProblems(unseen, at(HIDDEN.most + 1)).join(), /hides walls: stored 20001 situations, the ceiling .* is 20000/);
});

test('the shared bar: never needs a Minotaur; a chase level may trade puzzle numbers for the chase checks', () => {
  const solo: Difficulty = {
    solved: true, shortest: SHARED_BAR.shortest, explored: SHARED_BAR.explored, withoutMinotaur: null, minotaurDelta: 0,
    greedyWins: true, catchFree: SHARED_BAR.shortest, catches: 0, label: 'solo', naiveWins: false, line: '',
  };
  assert.deepEqual(sharedProblems(solo), [], 'a solo level clears it on puzzle difficulty alone');
  assert.match(sharedProblems({ ...solo, shortest: SHARED_BAR.shortest - 1 }).join(), /moves/);
  assert.match(sharedProblems({ ...solo, explored: SHARED_BAR.explored - 1 }).join(), /situations/);
  assert.match(sharedProblems({ ...solo, naiveWins: true }).join(), /walk/);
  assert.match(sharedProblems({ ...solo, solved: false, shortest: 'none' }).join(), /cannot be won/);
  assert.match(sharedProblems({ ...solo, solved: false, shortest: 'unknown' }).join(), /cap/);
  const chase: Difficulty = {
    ...solo, shortest: SHARED_BAR.chaseShortest, catchFree: SHARED_BAR.chaseShortest, explored: SHARED_BAR.chaseExplored, withoutMinotaur: SHARED_BAR.chaseShortest - BAR.minotaurDelta,
    minotaurDelta: BAR.minotaurDelta, greedyWins: false, label: 'chase',
  };
  assert.deepEqual(sharedProblems(chase), [], 'the chase checks lower the puzzle bar');
  assert.ok(sharedProblems({ ...chase, greedyWins: true }).length > 0, 'not when ignoring him wins');
  assert.ok(sharedProblems({ ...chase, minotaurDelta: BAR.minotaurDelta - 1 }).length > 0, 'not when he adds too little');
  assert.ok(sharedProblems({ ...chase, label: 'solo' }).length > 0, 'not without a chase');
  assert.ok(sharedProblems({ ...chase, explored: SHARED_BAR.chaseExplored - 1 }).length > 0);
  assert.deepEqual(sharedProblems({ ...chase, shortest: SHARED_BAR.shortest, catchFree: SHARED_BAR.shortest, explored: SHARED_BAR.explored, greedyWins: true, minotaurDelta: 0 }), [],
    'a chase level clears it on puzzle numbers alone too');
});

/** A red key on the way to the exit, and a red door that opens on a dead end: the player can ignore both. */
const DECOY = level([
  '#########',
  '#P...rE.#',
  '###R#####',
  '###.#####',
  '#########',
]);

test('every piece matters: a key and a door the player can ignore fail the level', () => {
  const d = measure(DECOY);
  assert.deepEqual(uselessProblems(DECOY, d), [
    'the red keys: ignoring it changes nothing (still 5 moves, and the search no 1.3 × smaller)',
    'the red doors: ignoring it changes nothing (still 5 moves, and the search no 1.3 × smaller)',
  ]);
  assert.deepEqual(USEFUL, { explored: 1.3 }, 'a piece that only grows the search grows it by the ramp\'s aimed step');
});

test('a key and door the line needs matter, and so does a door that holds the beast back', () => {
  const needed = level(['######', '#PrRE#', '######']);
  assert.deepEqual(uselessProblems(needed, measure(needed)), [], 'without the key the level is lost; shut, the door seals the exit');
  // No key opens this door, and the line never touches it; as floor, it lets the beast out onto the line.
  const holds = level(['#########', '#P....E.#', '###.#####', '###R#####', '###M#####', '#########']);
  assert.deepEqual(uselessProblems(holds, measure(holds)), []);
});

test('a block nobody pushes and that holds nothing back fails; a honey cake and a page are never counted', () => {
  const block = level(['#######', '#P..E.#', '#..O..#', '#######']);
  assert.match(uselessProblems(block, measure(block)).join(), /^the block at row 3, column 4: ignoring it changes nothing/);
  const extras = level(['#######', '#P.x.E#', '#..p..#', '#######'], 'pages: ch1-chalk');
  assert.deepEqual(pieceUnits(extras), []);
  assert.deepEqual(uselessProblems(extras, measure(extras)), []);
});

test('pieceUnits: each piece with the ways it can be taken out', () => {
  const lv = level(['##########', '#PrR:~fO.#', '#..S;.W.E#', '##########']);
  assert.deepEqual(pieceUnits(lv).map(u => [u.name, u.ignored.length]), [
    ['the red keys', 1], ['the red doors', 2], ['the flippers at row 2, column 7', 1], ['the block at row 2, column 8', 2],
    ['the gravel', 2], ['the marked stones', 2], ['the pop-up walls', 2], ['the water', 2], ['the fake wall at row 3, column 7', 2],
  ]);
  // A clone machine taken out takes its `machines:` entry with it, so the level still parses.
  const cloning = level(['#######', '#P+.C.#', '#~~~~~#', '#M...E#', '#######'], 'machines: block-down');
  const machine = pieceUnits(cloning).find(u => u.name.startsWith('the clone machine'))!;
  assert.equal(machine.ignored[0]!.machines.length, 0);
});

/** The beast stands in the short way, between two stones he cannot tread: he never moves, and the long way round
 *  never comes near him. */
const PENNED = level([
  '#########',
  '#P.:M:.E#',
  '#.#####.#',
  '#.......#',
  '#########',
]);
/** The beast runs at Theseus down the open middle of the hall. */
const RUNNING = level([
  '#########',
  '#P......#',
  '#.##.##.#',
  '#.#M..#.#',
  '#.##.##.#',
  '#......E#',
  '#########',
]);

test('the beast must be a threat: a penned beast fails though he adds moves, a running one passes', () => {
  assert.deepEqual(THREAT, { reach: 8, challenge: { share: 1 / 3, quiet: 1 / 3 }, teaching: { share: 1 / 4, quiet: 1 } });
  const d = measure(PENNED);
  assert.equal(d.minotaurDelta, 4, 'he adds moves: the line must go round');
  assert.deepEqual(threatOf(PENNED, d), { turns: 10, live: 0, quiet: 10 });
  assert.deepEqual(threatProblems(PENNED, d, 'challenge'), ['the beast is live on 0 of 10 turns; the bar is 4', 'the beast is quiet for 10 turns in a row; the bar is 3']);
  assert.deepEqual(threatProblems(PENNED, d, 'teaching'), ['the beast is live on 0 of 10 turns; the bar is 3'], 'a teaching level has no quiet limit');
  const run = measure(RUNNING);
  const t = threatOf(RUNNING, run);
  assert.ok(t.live >= t.turns / 3 && t.quiet <= t.turns / 3, JSON.stringify(t));
  assert.deepEqual(threatProblems(RUNNING, run, 'challenge'), []);
});

test('the beast must add a move: a beast-free route that wins as quickly fails, teaching or challenge', () => {
  const d = measure(WALLED);
  for (const kind of ['teaching', 'challenge'] as const) {
    assert.ok(threatProblems(WALLED, d, kind).includes('the beast adds no moves: a route that ignores him wins as quickly'), kind);
  }
  assert.deepEqual(threatProblems({ ...WALLED, minotaur: null }, measure({ ...WALLED, minotaur: null }), 'challenge'), [], 'no beast, nothing to check');
});

// The campaign gate. Each released chapter's levels are measured once.
const measured = new Map<string, Difficulty>();
const of = (id: string) => { if (!measured.has(id)) measured.set(id, measure(levelById(id))); return measured.get(id)!; };

/** Teaching levels held to every rule but the live beast's share of the turns: each teaches a piece whose lesson is
 *  keeping the beast away, so he is meant to be out of reach once the lesson is shown. Each still needs its beast to
 *  add a move. */
const THREAT_EXEMPT: Readonly<Record<string, string>> = {
  'ch3-2': 'Stones He Will Not Tread: two pop-up walls pen the beast in the lower hall, and the lesson is to leave him there',
  'ch5-2': 'The Brown Button: the beast keeps the high way, and the lesson is the low way, through a snare the block holds open',
};
const threatFor = (id: string, kind: 'teaching' | 'challenge') =>
  threatProblems(levelById(id), of(id), kind).filter(p => !(id in THREAT_EXEMPT && /^the beast is live on/.test(p)));

test('each live-beast exemption is a teaching level that still needs it', () => {
  for (const id of Object.keys(THREAT_EXEMPT)) {
    const chapter = CHAPTERS.find(c => c.levelIds.includes(id))!;
    assert.ok(chapter.levelIds.indexOf(id) < chapter.teaching, `${id} is a teaching level`);
    assert.match(threatProblems(levelById(id), of(id), 'teaching').join(), /^the beast is live on/, `${id} still falls short of the share`);
  }
});

for (const chapter of CHAPTERS.filter(c => c.released)) {
  const teaching = chapter.levelIds.slice(0, chapter.teaching);
  const challenges = chapter.levelIds.slice(chapter.teaching);
  test(`chapter ${chapter.n}: a teaching stretch, then at least one challenge level`, () => {
    assert.ok(teaching.length > 0 && challenges.length > 0);
  });
  for (const id of teaching) {
    test(`${id} clears the bar: its Minotaur shapes the route and is a threat`, () => {
      assert.deepEqual([...challengeProblems(of(id)), ...threatFor(id, 'teaching')], [], id);
    });
  }
  for (const id of chapter.levelIds) {
    test(`${id}: every piece matters`, () => {
      assert.deepEqual(uselessProblems(levelById(id), of(id)), [], id);
    });
  }
  // The shared bar is set by Chapter 1: its challenge levels clear it and its teaching levels do not.
  for (const id of chapter.n === 1 ? chapter.levelIds : challenges) {
    const clears = challenges.includes(id);
    test(`${id} ${clears ? 'clears' : 'falls short of'} the shared bar`, () => {
      const problems = sharedProblems(of(id));
      assert.equal(problems.length === 0, clears, `${id}: ${problems.join('; ')}`);
    });
  }
  challenges.forEach((id, k) => {
    test(`${id} is a challenge level: a real fight, a steady step up from the one before`, () => {
      const problems = [
        ...challengeProblems(of(id), BAR, { teaching: teaching.map(of) }),
        ...(k > 0 ? rampProblems(of(challenges[k - 1]!), of(id), rampOf(levelById(id))) : []),
        ...hiddenProblems(levelById(id), of(id)),
        ...threatFor(id, 'challenge'),
      ];
      assert.deepEqual(problems, [], id);
    });
  });
}

test('measure keeps the shortest line', () => {
  for (const id of ['trial-1', 'trial-9', 'trial-10']) {
    const d = of(id);
    const line = lineOf(d.line);
    assert.ok(line, id);
    let s = initial(levelById(id));
    for (const a of line) s = step(s, a).state;
    assert.equal(s.outcome, 'won', id);
    assert.equal(line.length, d.shortest, id);
  }
});

test('an unsolved measure has an empty line', () => {
  const d = measure(level(['#####', '#P#E#', '#####']));
  assert.equal(d.solved, false);
  assert.equal(d.line, '');
});

test('hardPieces names the pieces by how many there are', () => {
  const lv = level([
    '#########',
    '#P.OOO.E#',
    '#rrRRCw.#',
    '#.......#',
    '#########',
  ], 'machines: block-down\nfacing: right');
  assert.deepEqual(hardPieces(lv), ['4 blocks', '2 keys and 2 doors', '1 hazard']);
});

test('hardPieces skips what the level does not have', () => {
  assert.deepEqual(hardPieces(level(['#####', '#P.E#', '#####'])), []);
});

test('hardPieces names only the present half of keys and doors', () => {
  assert.deepEqual(hardPieces(level(['#####', '#PRR#', '#..E#', '#####'])), ['2 doors']);
  assert.deepEqual(hardPieces(level(['#####', '#Pr.#', '#..E#', '#####'])), ['1 key']);
});

test('hardPieces is singular for one of each', () => {
  const lv = level(['##########', '#PO.rRtwE#', '#..-.....#', '##########'], 'facing: right');
  assert.deepEqual(hardPieces(lv), ['1 key and 1 door', '1 block', '1 toggle wall', '1 hazard', '1 button']);
});

test('hardPieces counts a hazard-template machine as a hazard, and breaks ties in the stated order', () => {
  // Two hazards (one a ball machine) tie with two blocks: blocks come first. Two buttons come last.
  const lv = level(['#########', '#POOCw.E#', '#..-+...#', '#########'], 'machines: ball-down\nfacing: right');
  assert.deepEqual(hardPieces(lv), ['2 blocks', '2 hazards', '2 buttons']);
});

test('nothing starts under a figure: every campaign level, and a level built with a relic under the beast fails', () => {
  for (const { id, text } of CAMPAIGN_TEXTS) assert.deepEqual(startProblems(parse(text)), [], id);
  const lv = parse(`title: t\nintro: i\n\n#######\n#P.*.M#\n####E##\n`);
  assert.deepEqual(startProblems(lv), []);
  const objects = [...lv.objects];
  objects[lv.minotaur!.r * lv.cols + lv.minotaur!.c] = 'relic';
  const terrain = [...lv.terrain];
  terrain[lv.player.r * lv.cols + lv.player.c] = 'button';
  const bad = startProblems({ ...lv, objects, terrain });
  assert.equal(bad.length, 2);
  assert.match(bad[0]!, /Theseus starts on button/);
  assert.match(bad[1]!, /the Minotaur starts on relic/);
});
