// Chapter 3, "The Closing Ways": ten levels that bring in the pop-up wall and nothing else new. Every level parses,
// is won by the exact solver, keeps to the pieces released so far, and each shortest line crosses a pop-up that
// rises behind Theseus; the teaching levels each need theirs, and the two pages lie off the shortest line, on a
// harder route. The challenge bar and the ramp are gated in test/difficulty.test.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CLOSING, closingLevel } from '../src/puzzle/closing.ts';
import { CHAPTERS, LEVEL_IDS, levelById, pageHome, chapterOf } from '../src/campaign/chapters.ts';
import { CHAPTER_3 } from '../src/campaign/chapter-3.ts';
import { initial } from '../src/puzzle/state.ts';
import { solve, SOLVER_CAP } from '../src/puzzle/solver.ts';
import type { SolveResult } from '../src/puzzle/solver.ts';
import { step } from '../src/puzzle/step.ts';
import type { GameEvent } from '../src/puzzle/step.ts';
import { parse, serialize } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';
import type { ObjectKind, Terrain } from '../src/puzzle/tiles.ts';

/** Each level's shortest line, pinned: a rule change that alters a level fails here. */
const SHORTEST: number[] = [14, 15, 23, 46, 42, 44, 35, 46, 53, 64];
/** Level 10 is larger than the screen; its proofs may search further than the in-game cap. */
const BIG_CAP = 6_000_000;
const capOf = (i: number) => (i === 9 ? BIG_CAP : SOLVER_CAP);

/** The pieces later chapters bring in (Chapters 4 to 9): none may appear here. */
const LATER_TERRAIN: readonly Terrain[] = ['fake-wall', 'invisible-wall', 'trap', 'button-brown', 'teleport', 'thief', 'bomb', 'clone', 'button-red'];

const retile = (lv: Level, from: Terrain, to: Terrain): Level => ({ ...lv, terrain: lv.terrain.map(t => (t === from ? to : t)) });
const withoutObjects = (lv: Level, kinds: readonly ObjectKind[]): Level => ({ ...lv, objects: lv.objects.map(o => (o && kinds.includes(o) ? null : o)) });
const walled = (lv: Level, r: number, c: number): Level => ({ ...lv, terrain: lv.terrain.map((t, i) => (i === r * lv.cols + c ? 'wall' : t)) });
/** Unwinnable (proved, not capped) or won only by a line longer than `than`. */
const worse = (r: SolveResult, than: number) => (r.solved ? r.line.length > than : !r.capped);
const unwinnable = (r: SolveResult) => !r.solved && !r.capped;

function played(i: number) {
  const r = solve(initial(closingLevel(i)), capOf(i));
  assert.ok(r.solved, `ch3-${i + 1} unsolved (explored ${r.explored})`);
  const events: GameEvent[] = [];
  let s = initial(closingLevel(i));
  for (const a of r.line) {
    const x = step(s, a);
    s = x.state;
    events.push(...x.events);
  }
  assert.equal(s.outcome, 'won');
  return {
    line: r.line,
    rose: events.filter(e => e.kind === 'rose').length,
    took: new Set(events.flatMap(e => (e.kind === 'took' ? [e.what] : []))),
  };
}
const memo = new Map<number, ReturnType<typeof played>>();
const once = (i: number) => { if (!memo.has(i)) memo.set(i, played(i)); return memo.get(i)!; };

test('Chapter 3 is The Closing Ways: released, ten levels ch3-1 to ch3-10, three teaching, its lore', () => {
  const three = CHAPTERS[2]!;
  assert.equal(three.n, 3);
  assert.equal(three.name, 'The Closing Ways');
  assert.equal(three.released, true);
  assert.deepEqual(three.levelIds, Array.from({ length: 10 }, (_, i) => `ch3-${i + 1}`));
  assert.equal(three.teaching, 3);
  assert.equal(three.lore, CHAPTER_3);
  assert.deepEqual(CLOSING.map(w => w.id), three.levelIds);
});

test("the earlier chapters' progress keys stay stable: Chapter 3's levels come after them", () => {
  assert.deepEqual(LEVEL_IDS.slice(0, 10), Array.from({ length: 10 }, (_, i) => `trial-${i + 1}`));
  assert.deepEqual(LEVEL_IDS.slice(10, 20), CHAPTERS[1]!.levelIds);
  assert.deepEqual(LEVEL_IDS.slice(20, 30), CHAPTERS[2]!.levelIds);
  assert.deepEqual(chapterOf(20), { chapter: CHAPTERS[2], within: 0 });
  assert.deepEqual(chapterOf(29), { chapter: CHAPTERS[2], within: 9 });
});

test("levelById finds Chapter 3's levels, and refuses an unknown id", () => {
  CLOSING.forEach((w, i) => assert.equal(levelById(w.id), closingLevel(i)));
  assert.throws(() => levelById('ch3-11'));
});

test('every level parses to canonical text, has a title, an intro and a Minotaur; levels 1 to 9 fit 12 by 12', () => {
  assert.equal(CLOSING.length, 10);
  CLOSING.forEach((w, i) => {
    assert.equal(serialize(parse(w.text)), w.text, w.id);
    const lv = closingLevel(i);
    assert.ok(lv.title && lv.intro, w.id);
    assert.ok(lv.minotaur, `${w.id} has a Minotaur`);
    if (i < 9) assert.ok(lv.rows <= 12 && lv.cols <= 12, w.id);
  });
  const big = closingLevel(9);
  assert.ok(big.cols > 12 || big.rows > 12, 'level 10 is larger than the screen');
  assert.ok(big.cols <= 20 && big.rows <= 20, 'level 10 fits in 20 by 20');
});

test('the pop-up wall is the one new piece: every level has it, and none has a piece from a later chapter', () => {
  CLOSING.forEach((w, i) => {
    const lv = closingLevel(i);
    assert.ok(lv.terrain.includes('popup'), `${w.id} has a pop-up wall`);
    for (const t of LATER_TERRAIN) assert.ok(!lv.terrain.includes(t), `${w.id} has no ${t}`);
    assert.equal(lv.hazards.length, 0, `${w.id} has no hazards`);
    assert.equal(lv.machines.length, 0, `${w.id} has no clone machines`);
  });
});

test('each shortest line is pinned, and on each a pop-up rises behind Theseus', () => {
  assert.deepEqual(CLOSING.map((_, i) => once(i).line.length), SHORTEST);
  CLOSING.forEach((w, i) => assert.ok(once(i).rose > 0, `${w.id}'s shortest line raises a pop-up`));
});

test('the teaching levels each need their pop-up walls', () => {
  for (const i of [0, 1, 2]) {
    assert.ok(unwinnable(solve(initial(retile(closingLevel(i), 'popup', 'wall')))), `ch3-${i + 1}: Theseus has to cross a pop-up`);
  }
  // Level 2: the beast will not tread on them. As floor, he gets out after Theseus, and the level is lost or longer.
  assert.ok(worse(solve(initial(retile(closingLevel(1), 'popup', 'floor'))), once(1).line.length), 'ch3-2: the pop-ups pen the beast');
  // Level 3: the block will not cross one. As floor, the block takes the short way.
  const three = closingLevel(2);
  assert.ok(three.objects.includes('block'));
  const asFloor = solve(initial(retile(three, 'popup', 'floor')));
  assert.ok(asFloor.solved && asFloor.line.length < once(2).line.length, 'ch3-3: as floor, the block goes the short way');
  assert.ok(unwinnable(solve(initial(withoutObjects(three, ['block'])))), 'ch3-3 needs its block');
});

test('the two pages: The Games of Minos in level 9 and The Thread in level 10, each off the shortest line but on a winning one', () => {
  assert.deepEqual(CHAPTER_3.pages.map(p => p.id), ['ch3-games', 'ch3-thread']);
  assert.deepEqual(CHAPTER_3.pages.map(p => p.title), ['The Games of Minos', 'The Thread']);
  assert.deepEqual(pageHome('ch3-games'), [28]);
  assert.deepEqual(pageHome('ch3-thread'), [29]);
  for (const i of [8, 9]) {
    const lv = closingLevel(i);
    assert.equal(lv.pageIds.length, 1);
    assert.ok(!once(i).took.has('page'), `ch3-${i + 1}: the page lies off the shortest line`);
    const copy = { ...lv, objects: lv.objects.map(o => (o === 'page' ? 'relic' as const : o)), relics: lv.relics + 1, pageIds: [], pageCells: [] };
    const r = solve(initial(copy), capOf(i));
    assert.ok(r.solved && r.line.length > once(i).line.length, `ch3-${i + 1}: the page is on a longer, winning route`);
  }
});

test('level 10 has more than one way through: the red door, or the long west hall', () => {
  const lv = closingLevel(9);
  assert.ok(lv.terrain.includes('gate') && lv.terrain.includes('exit') && lv.relics > 0);
  assert.ok(lv.terrain.includes('door-red') && lv.objects.includes('key-red'));
  // The west hall alone: without the key the door stays shut, and the level is still won.
  assert.ok(solve(initial(withoutObjects(lv, ['key-red'])), BIG_CAP).solved, 'won without the red key');
  // The door alone: with the west hall walled, the key and the door still win it.
  assert.ok(solve(initial(walled(lv, 8, 3)), BIG_CAP).solved, 'won with the west hall walled');
  assert.ok(unwinnable(solve(initial(walled(withoutObjects(lv, ['key-red']), 8, 3)), BIG_CAP)), 'level 10 needs one of its two ways');
});
