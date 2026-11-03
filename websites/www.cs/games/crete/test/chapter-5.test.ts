// Chapter 5, "The Snares of Daedalus": ten levels that bring in Daedalus's snare and its brown button and nothing
// else new. Every level parses, is won by the exact solver, keeps to the pieces released so far, and on each one the
// snares matter: as plain floor, the level is lost or won another way. The teaching levels each teach one thing
// about them, and the two pages lie off the shortest line, on a harder route. The challenge bar and the ramp are
// gated in test/difficulty.test.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SNARES, snareLevel } from '../src/puzzle/snares.ts';
import { CHAPTERS, LEVEL_IDS, levelById, pageHome, chapterOf } from '../src/campaign/chapters.ts';
import { CHAPTER_5 } from '../src/campaign/chapter-5.ts';
import { initial } from '../src/puzzle/state.ts';
import { solve, SOLVER_CAP } from '../src/puzzle/solver.ts';
import type { SolveResult } from '../src/puzzle/solver.ts';
import { step } from '../src/puzzle/step.ts';
import type { Action, GameEvent } from '../src/puzzle/step.ts';
import { parse, serialize } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';
import type { ObjectKind, Terrain } from '../src/puzzle/tiles.ts';

/** Each level's shortest line, pinned: a rule change that alters a level fails here. */
const SHORTEST: number[] = [18, 18, 17, 56, 53, 71, 44, 49, 64, 75];
/** Level 10 is larger than the screen; its proofs may search further than the in-game cap. */
const BIG_CAP = 6_000_000;
const capOf = (i: number) => (i === 9 ? BIG_CAP : SOLVER_CAP);

/** The pieces later chapters bring in (Chapters 6 to 9): none may appear here. */
const LATER_TERRAIN: readonly Terrain[] = ['teleport', 'thief', 'bomb', 'clone', 'button-red'];

/** The level with every `from` cell made `to`, parsed again so the buttons' links follow. */
const retile = (lv: Level, from: Terrain, to: Terrain): Level => parse(serialize({ ...lv, terrain: lv.terrain.map(t => (t === from ? to : t)) }));
const withoutObjects = (lv: Level, kinds: readonly ObjectKind[]): Level => ({ ...lv, objects: lv.objects.map(o => (o && kinds.includes(o) ? null : o)) });
const unwinnable = (r: SolveResult) => !r.solved && !r.capped;

function play(lv: Level, line: readonly Action[]): GameEvent[] {
  const events: GameEvent[] = [];
  let s = initial(lv);
  for (const a of line) {
    const x = step(s, a);
    s = x.state;
    events.push(...x.events);
  }
  assert.equal(s.outcome, 'won');
  return events;
}

function played(i: number) {
  const r = solve(initial(snareLevel(i)), capOf(i));
  assert.ok(r.solved, `ch5-${i + 1} unsolved (explored ${r.explored})`);
  const events = play(snareLevel(i), r.line);
  return {
    line: r.line,
    took: new Set(events.flatMap(e => (e.kind === 'took' ? [e.what] : []))),
    beastHeld: events.some(e => e.kind === 'held' && e.who === 'minotaur'),
  };
}
const memo = new Map<number, ReturnType<typeof played>>();
const once = (i: number) => { if (!memo.has(i)) memo.set(i, played(i)); return memo.get(i)!; };

test('Chapter 5 is The Snares of Daedalus: released, ten levels ch5-1 to ch5-10, three teaching, its lore', () => {
  const five = CHAPTERS[4]!;
  assert.equal(five.n, 5);
  assert.equal(five.name, 'The Snares of Daedalus');
  assert.equal(five.released, true);
  assert.deepEqual(five.levelIds, Array.from({ length: 10 }, (_, i) => `ch5-${i + 1}`));
  assert.equal(five.teaching, 3);
  assert.equal(five.lore, CHAPTER_5);
  assert.deepEqual(SNARES.map(w => w.id), five.levelIds);
});

test("the earlier chapters' progress keys stay stable: Chapter 5's levels come after them", () => {
  assert.deepEqual(LEVEL_IDS.slice(0, 10), Array.from({ length: 10 }, (_, i) => `trial-${i + 1}`));
  for (let n = 1; n < 4; n++) assert.deepEqual(LEVEL_IDS.slice(10 * n, 10 * n + 10), CHAPTERS[n]!.levelIds);
  assert.deepEqual(LEVEL_IDS.slice(40, 50), CHAPTERS[4]!.levelIds);
  assert.deepEqual(chapterOf(40), { chapter: CHAPTERS[4], within: 0 });
  assert.deepEqual(chapterOf(49), { chapter: CHAPTERS[4], within: 9 });
});

test("levelById finds Chapter 5's levels, and refuses an unknown id", () => {
  SNARES.forEach((w, i) => assert.equal(levelById(w.id), snareLevel(i)));
  assert.throws(() => levelById('ch5-11'));
});

test('every level parses to canonical text, has a title, an intro and a Minotaur; levels 1 to 9 fit 12 by 12', () => {
  assert.equal(SNARES.length, 10);
  SNARES.forEach((w, i) => {
    assert.equal(serialize(parse(w.text)), w.text, w.id);
    const lv = snareLevel(i);
    assert.ok(lv.title && lv.intro, w.id);
    assert.ok(lv.minotaur, `${w.id} has a Minotaur`);
    if (i < 9) assert.ok(lv.rows <= 12 && lv.cols <= 12, w.id);
  });
  const big = snareLevel(9);
  assert.ok(big.cols > 12 || big.rows > 12, 'level 10 is larger than the screen');
  assert.ok(big.cols <= 20 && big.rows <= 20, 'level 10 fits in 20 by 20');
});

test('the snare is the new piece: every level has one, a level with a brown button links it, and none has a later piece', () => {
  SNARES.forEach((w, i) => {
    const lv = snareLevel(i);
    assert.ok(lv.terrain.includes('trap'), `${w.id} has a snare`);
    lv.terrain.forEach((t, j) => {
      if (t === 'button-brown') assert.equal(lv.terrain[lv.links[j]!], 'trap', `${w.id}: the button at ${j} holds a snare`);
    });
    for (const t of LATER_TERRAIN) assert.ok(!lv.terrain.includes(t), `${w.id} has no ${t}`);
    assert.equal(lv.hazards.length, 0, `${w.id} has no hazards`);
    assert.equal(lv.machines.length, 0, `${w.id} has no clone machines`);
  });
});

test('each shortest line is pinned, and on each level the snares matter', () => {
  assert.deepEqual(SNARES.map((_, i) => once(i).line.length), SHORTEST);
  SNARES.forEach((w, i) => {
    const plain = solve(initial(retile(snareLevel(i), 'trap', 'floor')), capOf(i));
    assert.ok(!plain.solved || plain.line.length !== once(i).line.length, `${w.id}: with the snares as plain floor, the level plays another way`);
  });
});

test('the teaching levels each teach one thing about the snares', () => {
  // Level 1: the snare holds the beast. Led into it, he is held; as plain floor, the level is lost.
  assert.ok(once(0).beastHeld, 'ch5-1: the beast is held');
  assert.ok(unwinnable(solve(initial(retile(snareLevel(0), 'trap', 'floor')))), 'ch5-1: without the snare the beast cannot be passed');
  // Level 2: a block on the brown button opens the snare in Theseus's way. Without the button, or the block, it holds
  // him for good.
  assert.ok(unwinnable(solve(initial(retile(snareLevel(1), 'button-brown', 'floor')))), 'ch5-2: the button opens the snare');
  assert.ok(unwinnable(solve(initial(withoutObjects(snareLevel(1), ['block'])))), 'ch5-2: the block holds the button down');
  // Level 3: the button looses whatever its snare holds, the beast too. The snare is needed; the button only costs
  // the long way round.
  assert.ok(once(2).beastHeld, 'ch5-3: the beast is held');
  assert.ok(unwinnable(solve(initial(retile(snareLevel(2), 'trap', 'floor')))), 'ch5-3: without the snare the beast cannot be passed');
  const loose = solve(initial(retile(snareLevel(2), 'button-brown', 'floor')));
  assert.ok(loose.solved && loose.line.length < once(2).line.length, 'ch5-3: the button would free him, so the way round it is longer');
});

test('the two pages: The Kinsman in level 9 and The Gate in level 10, each off the shortest line but on a winning one', () => {
  assert.deepEqual(CHAPTER_5.pages.map(p => p.id), ['ch5-kinsman', 'ch5-gate']);
  assert.deepEqual(CHAPTER_5.pages.map(p => p.title), ['The Kinsman', 'The Gate']);
  assert.deepEqual(pageHome('ch5-kinsman'), [48]);
  assert.deepEqual(pageHome('ch5-gate'), [49]);
  for (const i of [8, 9]) {
    const lv = snareLevel(i);
    assert.equal(lv.pageIds.length, 1);
    assert.ok(!once(i).took.has('page'), `ch5-${i + 1}: the page lies off the shortest line`);
    const copy = { ...lv, objects: lv.objects.map(o => (o === 'page' ? 'relic' as const : o)), relics: lv.relics + 1, pageIds: [], pageCells: [] };
    const r = solve(initial(copy), capOf(i));
    assert.ok(r.solved && r.line.length > once(i).line.length, `ch5-${i + 1}: the page is on a longer, winning route`);
  }
});

test('level 10 has more than one way through: the red door, or the snares', () => {
  const lv = snareLevel(9);
  assert.ok(lv.terrain.includes('gate') && lv.terrain.includes('exit') && lv.relics > 0);
  assert.ok(lv.terrain.includes('door-red') && lv.objects.includes('key-red'));
  // The snares' way alone: without the key the door stays shut, and the level is still won.
  assert.ok(solve(initial(withoutObjects(lv, ['key-red'])), BIG_CAP).solved, 'won without the red key');
  // The door alone: with every snare a wall, the key and the door still win it.
  const walled = retile(lv, 'trap', 'wall');
  assert.ok(solve(initial(walled), BIG_CAP).solved, 'won with the snares walled up');
  assert.ok(unwinnable(solve(initial(withoutObjects(walled, ['key-red'])), BIG_CAP)), 'level 10 needs one of its two ways');
});
