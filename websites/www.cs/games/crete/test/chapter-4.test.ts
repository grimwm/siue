// Chapter 4, "The False Walls": ten levels that bring in the fake wall and the invisible wall and nothing else new.
// Every level parses, is won by the exact solver, keeps to the pieces released so far, and on each one the false
// walls matter: drawn as what they look like, the level is lost or won another way. The teaching levels each need
// theirs, and the two pages lie off the shortest line, on a harder route. The challenge bar and the ramp are gated
// in test/difficulty.test.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FALSE_WALLS, falseWallLevel } from '../src/puzzle/false-walls.ts';
import { CHAPTERS, LEVEL_IDS, levelById, pageHome, chapterOf } from '../src/campaign/chapters.ts';
import { CHAPTER_4 } from '../src/campaign/chapter-4.ts';
import { initial } from '../src/puzzle/state.ts';
import { solve, SOLVER_CAP } from '../src/puzzle/solver.ts';
import type { SolveResult } from '../src/puzzle/solver.ts';
import { step } from '../src/puzzle/step.ts';
import type { GameEvent } from '../src/puzzle/step.ts';
import { parse, serialize } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';
import type { ObjectKind, Terrain } from '../src/puzzle/tiles.ts';

/** Each level's shortest line, pinned: a rule change that alters a level fails here. */
const SHORTEST: number[] = [16, 12, 13, 53, 53, 56, 44, 48, 55, 82];
/** Level 10 is larger than the screen; its proofs may search further than the in-game cap. */
const BIG_CAP = 6_000_000;
const capOf = (i: number) => (i === 9 ? BIG_CAP : SOLVER_CAP);

/** The pieces later chapters bring in (Chapters 5 to 9): none may appear here. */
const LATER_TERRAIN: readonly Terrain[] = ['trap', 'button-brown', 'teleport', 'thief', 'bomb', 'clone', 'button-red'];

const retile = (lv: Level, from: Terrain, to: Terrain): Level => ({ ...lv, terrain: lv.terrain.map(t => (t === from ? to : t)) });
/** The level as it looks: every fake wall a wall and every invisible wall floor. */
const asSeen = (lv: Level): Level => retile(retile(lv, 'fake-wall', 'wall'), 'invisible-wall', 'floor');
const withoutObjects = (lv: Level, kinds: readonly ObjectKind[]): Level => ({ ...lv, objects: lv.objects.map(o => (o && kinds.includes(o) ? null : o)) });
const unwinnable = (r: SolveResult) => !r.solved && !r.capped;

function played(i: number) {
  const r = solve(initial(falseWallLevel(i)), capOf(i));
  assert.ok(r.solved, `ch4-${i + 1} unsolved (explored ${r.explored})`);
  const events: GameEvent[] = [];
  let s = initial(falseWallLevel(i));
  for (const a of r.line) {
    const x = step(s, a);
    s = x.state;
    events.push(...x.events);
  }
  assert.equal(s.outcome, 'won');
  return {
    line: r.line,
    took: new Set(events.flatMap(e => (e.kind === 'took' ? [e.what] : []))),
  };
}
const memo = new Map<number, ReturnType<typeof played>>();
const once = (i: number) => { if (!memo.has(i)) memo.set(i, played(i)); return memo.get(i)!; };

test('Chapter 4 is The False Walls: released, ten levels ch4-1 to ch4-10, three teaching, its lore', () => {
  const four = CHAPTERS[3]!;
  assert.equal(four.n, 4);
  assert.equal(four.name, 'The False Walls');
  assert.equal(four.released, true);
  assert.deepEqual(four.levelIds, Array.from({ length: 10 }, (_, i) => `ch4-${i + 1}`));
  assert.equal(four.teaching, 3);
  assert.equal(four.lore, CHAPTER_4);
  assert.deepEqual(FALSE_WALLS.map(w => w.id), four.levelIds);
});

test("the earlier chapters' progress keys stay stable: Chapter 4's levels come after them", () => {
  assert.deepEqual(LEVEL_IDS.slice(0, 10), Array.from({ length: 10 }, (_, i) => `trial-${i + 1}`));
  assert.deepEqual(LEVEL_IDS.slice(10, 20), CHAPTERS[1]!.levelIds);
  assert.deepEqual(LEVEL_IDS.slice(20, 30), CHAPTERS[2]!.levelIds);
  assert.deepEqual(LEVEL_IDS.slice(30, 40), CHAPTERS[3]!.levelIds);
  assert.deepEqual(chapterOf(30), { chapter: CHAPTERS[3], within: 0 });
  assert.deepEqual(chapterOf(39), { chapter: CHAPTERS[3], within: 9 });
});

test("levelById finds Chapter 4's levels, and refuses an unknown id", () => {
  FALSE_WALLS.forEach((w, i) => assert.equal(levelById(w.id), falseWallLevel(i)));
  assert.throws(() => levelById('ch4-11'));
});

test('every level parses to canonical text, has a title, an intro and a Minotaur; levels 1 to 9 fit 12 by 12', () => {
  assert.equal(FALSE_WALLS.length, 10);
  FALSE_WALLS.forEach((w, i) => {
    assert.equal(serialize(parse(w.text)), w.text, w.id);
    const lv = falseWallLevel(i);
    assert.ok(lv.title && lv.intro, w.id);
    assert.ok(lv.minotaur, `${w.id} has a Minotaur`);
    if (i < 9) assert.ok(lv.rows <= 12 && lv.cols <= 12, w.id);
  });
  const big = falseWallLevel(9);
  assert.ok(big.cols > 12 || big.rows > 12, 'level 10 is larger than the screen');
  assert.ok(big.cols <= 20 && big.rows <= 20, 'level 10 fits in 20 by 20');
});

test('the fake and the invisible wall are the new pieces: every level has one, and none has a piece from a later chapter', () => {
  FALSE_WALLS.forEach((w, i) => {
    const lv = falseWallLevel(i);
    assert.ok(lv.terrain.includes('fake-wall') || lv.terrain.includes('invisible-wall'), `${w.id} has a false wall`);
    for (const t of LATER_TERRAIN) assert.ok(!lv.terrain.includes(t), `${w.id} has no ${t}`);
    assert.equal(lv.hazards.length, 0, `${w.id} has no hazards`);
    assert.equal(lv.machines.length, 0, `${w.id} has no clone machines`);
  });
});

test('each shortest line is pinned, and on each level the false walls matter', () => {
  assert.deepEqual(FALSE_WALLS.map((_, i) => once(i).line.length), SHORTEST);
  FALSE_WALLS.forEach((w, i) => {
    const seen = solve(initial(asSeen(falseWallLevel(i))), capOf(i));
    assert.ok(!seen.solved || seen.line.length !== once(i).line.length, `${w.id}: drawn as it looks, the level plays another way`);
  });
});

test('the teaching levels each need their false walls', () => {
  // Level 1: the painted stone is the way; as a true wall the level is lost.
  assert.ok(unwinnable(solve(initial(retile(falseWallLevel(0), 'fake-wall', 'wall')))), 'ch4-1: Theseus has to open the fake wall');
  // Level 2: the unseen wall keeps the beast in his hall; as floor he gets through, and the level is lost.
  assert.ok(unwinnable(solve(initial(retile(falseWallLevel(1), 'invisible-wall', 'floor')))), 'ch4-2: the invisible wall pens the beast');
  // Level 3: both. The fake wall is the way, and the invisible wall shuts the near way to it.
  const three = falseWallLevel(2);
  assert.ok(unwinnable(solve(initial(retile(three, 'fake-wall', 'wall')))), 'ch4-3: Theseus has to open the fake wall');
  const open = solve(initial(retile(three, 'invisible-wall', 'floor')));
  assert.ok(open.solved && open.line.length < once(2).line.length, 'ch4-3: as floor, the invisible wall would be the short way');
});

test('the two pages: Taurus in level 9 and The Queen in level 10, each off the shortest line but on a winning one', () => {
  assert.deepEqual(CHAPTER_4.pages.map(p => p.id), ['ch4-taurus', 'ch4-queen']);
  assert.deepEqual(CHAPTER_4.pages.map(p => p.title), ['Taurus', 'The Queen']);
  assert.deepEqual(pageHome('ch4-taurus'), [38]);
  assert.deepEqual(pageHome('ch4-queen'), [39]);
  for (const i of [8, 9]) {
    const lv = falseWallLevel(i);
    assert.equal(lv.pageIds.length, 1);
    assert.ok(!once(i).took.has('page'), `ch4-${i + 1}: the page lies off the shortest line`);
    const copy = { ...lv, objects: lv.objects.map(o => (o === 'page' ? 'relic' as const : o)), relics: lv.relics + 1, pageIds: [], pageCells: [] };
    const r = solve(initial(copy), capOf(i));
    assert.ok(r.solved && r.line.length > once(i).line.length, `ch4-${i + 1}: the page is on a longer, winning route`);
  }
});

const walled = (lv: Level, r: number, c: number): Level => ({ ...lv, terrain: lv.terrain.map((t, i) => (i === r * lv.cols + c ? 'wall' : t)) });

test('level 10 has more than one way through: the red door, or the painted wall in the east', () => {
  const lv = falseWallLevel(9);
  assert.ok(lv.terrain.includes('gate') && lv.terrain.includes('exit') && lv.relics > 0);
  assert.ok(lv.terrain.includes('door-red') && lv.objects.includes('key-red'));
  assert.equal(lv.terrain[5 * lv.cols + 17], 'fake-wall');
  // The painted wall alone: without the key the door stays shut, and the level is still won.
  assert.ok(solve(initial(withoutObjects(lv, ['key-red'])), BIG_CAP).solved, 'won without the red key');
  // The door alone: with the painted wall a true wall, the key and the door still win it.
  assert.ok(solve(initial(walled(lv, 5, 17)), BIG_CAP).solved, 'won with the painted wall a true wall');
  assert.ok(unwinnable(solve(initial(walled(withoutObjects(lv, ['key-red']), 5, 17)), BIG_CAP)), 'level 10 needs one of its two ways');
});
