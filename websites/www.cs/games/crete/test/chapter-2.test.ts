// Chapter 2, "The Winding Ways": ten levels that bring in gravel and nothing else new. Every level parses, is won
// by the exact solver, keeps to the pieces released so far, and each teaching level needs its gravel; the two pages
// lie off the shortest line, on a harder route. The challenge bar itself is gated in test/difficulty.test.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WAYS, wayLevel } from '../src/puzzle/ways.ts';
import { CHAPTERS, LEVEL_IDS, levelById, pageHome, chapterOf } from '../src/campaign/chapters.ts';
import { CHAPTER_2 } from '../src/campaign/chapter-2.ts';
import { initial } from '../src/puzzle/state.ts';
import { solve, SOLVER_CAP } from '../src/puzzle/solver.ts';
import type { SolveResult } from '../src/puzzle/solver.ts';
import { step } from '../src/puzzle/step.ts';
import type { GameEvent } from '../src/puzzle/step.ts';
import { parse, serialize } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';
import type { ObjectKind, Terrain } from '../src/puzzle/tiles.ts';

/** Each level's shortest line, pinned: a rule change that alters a level fails here. */
const SHORTEST: number[] = [12, 17, 25, 52, 52, 62, 64, 58, 61, 82];
/** Level 10 is larger than the screen; its proofs may search further than the in-game cap. */
const BIG_CAP = 6_000_000;
const capOf = (i: number) => (i === 9 ? BIG_CAP : SOLVER_CAP);
/** Level 10's routes to the inner gate: water with the flippers, fire with the fire boots; either will do. */
const ROUTES: ObjectKind[] = ['flippers', 'fire-boots'];

/** The pieces later chapters bring in (Chapters 3 to 9): none may appear here. */
const LATER_TERRAIN: readonly Terrain[] = ['popup', 'fake-wall', 'invisible-wall', 'trap', 'button-brown', 'teleport', 'thief', 'bomb', 'clone', 'button-red'];

const retile = (lv: Level, from: Terrain, to: Terrain): Level => ({ ...lv, terrain: lv.terrain.map(t => (t === from ? to : t)) });
const withoutObjects = (lv: Level, kinds: readonly ObjectKind[]): Level => ({ ...lv, objects: lv.objects.map(o => (o && kinds.includes(o) ? null : o)) });
/** Unwinnable (proved, not capped) or won only by a line longer than `than`. */
const worse = (r: SolveResult, than: number) => (r.solved ? r.line.length > than : !r.capped);
const unwinnable = (r: SolveResult) => !r.solved && !r.capped;

function played(i: number) {
  const r = solve(initial(wayLevel(i)), capOf(i));
  assert.ok(r.solved, `ch2-${i + 1} unsolved (explored ${r.explored})`);
  const events: GameEvent[] = [];
  let s = initial(wayLevel(i));
  let gravel = 0;
  for (const a of r.line) {
    const x = step(s, a);
    s = x.state;
    events.push(...x.events);
    if (s.terrain[s.player.r * s.level.cols + s.player.c] === 'gravel') gravel++;
  }
  assert.equal(s.outcome, 'won');
  return { line: r.line, explored: r.explored, gravel, took: new Set(events.flatMap(e => (e.kind === 'took' ? [e.what] : []))) };
}
const memo = new Map<number, ReturnType<typeof played>>();
const once = (i: number) => { if (!memo.has(i)) memo.set(i, played(i)); return memo.get(i)!; };

test('Chapter 2 is The Winding Ways: released, ten levels ch2-1 to ch2-10, three teaching, its lore', () => {
  const two = CHAPTERS[1]!;
  assert.equal(two.n, 2);
  assert.equal(two.name, 'The Winding Ways');
  assert.equal(two.released, true);
  assert.deepEqual(two.levelIds, Array.from({ length: 10 }, (_, i) => `ch2-${i + 1}`));
  assert.equal(two.teaching, 3);
  assert.equal(two.lore, CHAPTER_2);
  assert.deepEqual(WAYS.map(w => w.id), two.levelIds);
});

test("Chapter 1's progress keys stay stable: its levels come first, under their trial-N ids", () => {
  assert.deepEqual(LEVEL_IDS.slice(0, 10), Array.from({ length: 10 }, (_, i) => `trial-${i + 1}`));
  assert.deepEqual(LEVEL_IDS.slice(10, 20), CHAPTERS[1]!.levelIds);
  assert.deepEqual(chapterOf(10), { chapter: CHAPTERS[1], within: 0 });
  assert.deepEqual(chapterOf(19), { chapter: CHAPTERS[1], within: 9 });
});

test('levelById finds both chapters\' levels, and refuses an unknown id', () => {
  assert.equal(levelById('trial-1').title, 'The Mouth of the Labyrinth');
  WAYS.forEach((w, i) => assert.equal(levelById(w.id), wayLevel(i)));
  assert.throws(() => levelById('ch2-11'));
});

test('every level parses to canonical text, has a title, an intro and a Minotaur; levels 1 to 9 fit 12 by 12', () => {
  assert.equal(WAYS.length, 10);
  WAYS.forEach((w, i) => {
    assert.equal(serialize(parse(w.text)), w.text, w.id);
    const lv = wayLevel(i);
    assert.ok(lv.title && lv.intro, w.id);
    assert.ok(lv.minotaur, `${w.id} has a Minotaur`);
    if (i < 9) assert.ok(lv.rows <= 12 && lv.cols <= 12, w.id);
  });
  const big = wayLevel(9);
  assert.ok(big.cols > 12 || big.rows > 12, 'level 10 is larger than the screen');
  assert.ok(big.cols <= 20 && big.rows <= 20, 'level 10 fits in 20 by 20');
});

test('gravel is the one new piece: every level has it, and none has a piece from a later chapter', () => {
  WAYS.forEach((w, i) => {
    const lv = wayLevel(i);
    assert.ok(lv.terrain.includes('gravel'), `${w.id} has gravel`);
    for (const t of LATER_TERRAIN) assert.ok(!lv.terrain.includes(t), `${w.id} has no ${t}`);
    assert.equal(lv.hazards.length, 0, `${w.id} has no hazards`);
    assert.equal(lv.machines.length, 0, `${w.id} has no clone machines`);
  });
});

test('each shortest line is pinned, and each crosses gravel', () => {
  assert.deepEqual(WAYS.map((_, i) => once(i).line.length), SHORTEST);
  WAYS.forEach((w, i) => assert.ok(once(i).gravel > 0, `${w.id}'s shortest line crosses gravel`));
});

test('the teaching levels each need their gravel', () => {
  for (const i of [0, 1, 2]) {
    const lv = wayLevel(i);
    const L = once(i).line.length;
    assert.ok(worse(solve(initial(retile(lv, 'gravel', 'wall'))), L), `ch2-${i + 1}: Theseus needs to cross the gravel`);
  }
  // Level 2: the beast cannot follow across it. As floor, he does, and the level is lost or longer.
  assert.ok(worse(solve(initial(retile(wayLevel(1), 'gravel', 'floor'))), once(1).line.length), 'ch2-2: the gravel holds the beast');
  // Level 3: the block will not cross it. As floor, the block takes the short way.
  const three = wayLevel(2);
  assert.ok(three.objects.includes('block'));
  const asFloor = solve(initial(retile(three, 'gravel', 'floor')));
  assert.ok(asFloor.solved && asFloor.line.length < once(2).line.length, 'ch2-3: as floor, the block goes the short way');
  assert.ok(unwinnable(solve(initial(withoutObjects(three, ['block'])))), 'ch2-3 needs its block');
});

test('the two pages: The Lots in level 9 and The Black Sail in level 10, each off the shortest line but on a winning one', () => {
  assert.deepEqual(CHAPTER_2.pages.map(p => p.id), ['ch2-lots', 'ch2-black-sail']);
  assert.deepEqual(CHAPTER_2.pages.map(p => p.title), ['The Lots', 'The Black Sail']);
  assert.deepEqual(pageHome('ch2-lots'), [18]);
  assert.deepEqual(pageHome('ch2-black-sail'), [19]);
  for (const i of [8, 9]) {
    const lv = wayLevel(i);
    assert.equal(lv.pageIds.length, 1);
    assert.ok(!once(i).took.has('page'), `ch2-${i + 1}: the page lies off the shortest line`);
    const copy = { ...lv, objects: lv.objects.map(o => (o === 'page' ? 'relic' as const : o)), relics: lv.relics + 1, pageIds: [], pageCells: [] };
    const r = solve(initial(copy), capOf(i));
    assert.ok(r.solved && r.line.length > once(i).line.length, `ch2-${i + 1}: the page is on a longer, winning route`);
  }
});

test('level 10 ends at the inner gate and has more than one route', () => {
  const lv = wayLevel(9);
  assert.ok(lv.terrain.includes('gate') && lv.terrain.includes('exit') && lv.relics > 0);
  for (const k of ROUTES) assert.ok(solve(initial(withoutObjects(lv, [k])), BIG_CAP).solved, `level 10 is won without the ${k}`);
  assert.ok(unwinnable(solve(initial(withoutObjects(lv, ROUTES)), BIG_CAP)), 'level 10 needs one of its routes');
});
