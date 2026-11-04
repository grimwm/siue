// Chapter 6, "The Folding Halls": ten levels that bring in the teleport and nothing else new. Every level parses, is
// won by the exact solver, keeps to the pieces released so far, and on each one the teleports matter: walled up, the
// level is lost or won another way, and the shortest line goes through one. The teaching levels each teach one thing
// about them, and the two pages lie off the shortest line, on a harder route. The challenge bar and the ramp are
// gated in test/difficulty.test.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FOLDS, foldLevel } from '../src/puzzle/folds.ts';
import { CHAPTERS, LEVEL_IDS, levelById, pageHome, chapterOf } from '../src/campaign/chapters.ts';
import { CHAPTER_6 } from '../src/campaign/chapter-6.ts';
import { initial } from '../src/puzzle/state.ts';
import { solve, SOLVER_CAP } from '../src/puzzle/solver.ts';
import type { SolveResult } from '../src/puzzle/solver.ts';
import { step } from '../src/puzzle/step.ts';
import type { Action, GameEvent } from '../src/puzzle/step.ts';
import { parse, serialize } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';
import type { ObjectKind, Terrain } from '../src/puzzle/tiles.ts';

/** Each level's shortest line, pinned: a rule change that alters a level fails here. */
const SHORTEST: number[] = [13, 14, 13, 34, 45, 39, 36, 34, 59, 54];
/** Level 10 is larger than the screen; its proofs may search further than the in-game cap. */
const BIG_CAP = 6_000_000;
const capOf = (i: number) => (i === 9 ? BIG_CAP : SOLVER_CAP);

/** The pieces later chapters bring in (Chapters 7 to 9): none may appear here. */
const LATER_TERRAIN: readonly Terrain[] = ['thief', 'bomb', 'clone', 'button-red'];

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
  const r = solve(initial(foldLevel(i)), capOf(i));
  assert.ok(r.solved, `ch6-${i + 1} unsolved (explored ${r.explored})`);
  const events = play(foldLevel(i), r.line);
  const sent = (who: string) => events.some(e => e.kind === 'teleported' && e.who === who);
  return {
    line: r.line,
    took: new Set(events.flatMap(e => (e.kind === 'took' ? [e.what] : []))),
    theseusSent: sent('player'),
    blockSent: sent('block'),
  };
}
const memo = new Map<number, ReturnType<typeof played>>();
const once = (i: number) => { if (!memo.has(i)) memo.set(i, played(i)); return memo.get(i)!; };

test('Chapter 6 is The Folding Halls: released, ten levels ch6-1 to ch6-10, three teaching, its lore', () => {
  const six = CHAPTERS[5]!;
  assert.equal(six.n, 6);
  assert.equal(six.name, 'The Folding Halls');
  assert.equal(six.released, true);
  assert.deepEqual(six.levelIds, Array.from({ length: 10 }, (_, i) => `ch6-${i + 1}`));
  assert.equal(six.teaching, 3);
  assert.equal(six.lore, CHAPTER_6);
  assert.deepEqual(FOLDS.map(w => w.id), six.levelIds);
});

test("the earlier chapters' progress keys stay stable: Chapter 6's levels come after them", () => {
  assert.deepEqual(LEVEL_IDS.slice(0, 10), Array.from({ length: 10 }, (_, i) => `trial-${i + 1}`));
  for (let n = 1; n < 5; n++) assert.deepEqual(LEVEL_IDS.slice(10 * n, 10 * n + 10), CHAPTERS[n]!.levelIds);
  assert.deepEqual(LEVEL_IDS.slice(50, 60), CHAPTERS[5]!.levelIds);
  assert.deepEqual(chapterOf(50), { chapter: CHAPTERS[5], within: 0 });
  assert.deepEqual(chapterOf(59), { chapter: CHAPTERS[5], within: 9 });
});

test("levelById finds Chapter 6's levels, and refuses an unknown id", () => {
  FOLDS.forEach((w, i) => assert.equal(levelById(w.id), foldLevel(i)));
  assert.throws(() => levelById('ch6-11'));
});

test('every level parses to canonical text, has a title, an intro and a Minotaur; levels 1 to 9 fit 12 by 12', () => {
  assert.equal(FOLDS.length, 10);
  FOLDS.forEach((w, i) => {
    assert.equal(serialize(parse(w.text)), w.text, w.id);
    const lv = foldLevel(i);
    assert.ok(lv.title && lv.intro, w.id);
    assert.ok(lv.minotaur, `${w.id} has a Minotaur`);
    if (i < 9) assert.ok(lv.rows <= 12 && lv.cols <= 12, w.id);
  });
  const big = foldLevel(9);
  assert.ok(big.cols > 12 || big.rows > 12, 'level 10 is larger than the screen');
  assert.ok(big.cols <= 20 && big.rows <= 20, 'level 10 fits in 20 by 20');
});

test('the teleport is the new piece: every level has at least two, its intro counts them, and none has a later piece', () => {
  const words = ['', '', 'two', 'three', 'four', 'five', 'six'];
  FOLDS.forEach((w, i) => {
    const lv = foldLevel(i);
    const n = lv.terrain.filter(t => t === 'teleport').length;
    assert.ok(n >= 2, `${w.id} has a pair of teleports`);
    assert.match(lv.intro, new RegExp(`\\b${words[n]} teleports\\b`, 'i'), `${w.id}: the intro names its ${n} teleports`);
    for (const t of LATER_TERRAIN) assert.ok(!lv.terrain.includes(t), `${w.id} has no ${t}`);
    assert.equal(lv.hazards.length, 0, `${w.id} has no hazards`);
    assert.equal(lv.machines.length, 0, `${w.id} has no clone machines`);
    assert.ok(!lv.terrain.includes('fake-wall') && !lv.terrain.includes('invisible-wall'), `${w.id} hides no wall`);
  });
});

test('each shortest line is pinned and goes through a teleport, and on each level the teleports matter', () => {
  assert.deepEqual(FOLDS.map((_, i) => once(i).line.length), SHORTEST);
  FOLDS.forEach((w, i) => {
    assert.ok(once(i).theseusSent || once(i).blockSent, `${w.id}: the shortest line uses a teleport`);
    const walled = solve(initial(retile(foldLevel(i), 'teleport', 'wall')), capOf(i));
    assert.ok(!walled.solved || walled.line.length !== once(i).line.length, `${w.id}: with the teleports walled up, the level plays another way`);
  });
});

test('the teaching levels each teach one thing about the teleports', () => {
  // Level 1: a teleport carries Theseus. The way out is sealed; walled up, the level is lost.
  assert.ok(once(0).theseusSent, 'ch6-1: Theseus goes through');
  assert.ok(unwinnable(solve(initial(retile(foldLevel(0), 'teleport', 'wall')))), 'ch6-1: without the teleports there is no way out');
  // Level 2: the beast cannot follow. On foot the way runs past him: without the teleports the level is lost, but
  // without the beast it is won on foot, and sooner.
  const walled = retile(foldLevel(1), 'teleport', 'wall');
  assert.ok(once(1).theseusSent, 'ch6-2: Theseus goes through');
  assert.ok(unwinnable(solve(initial(walled))), 'ch6-2: on foot, the beast stops you');
  const alone = solve(initial({ ...walled, minotaur: null }));
  assert.ok(alone.solved && alone.line.length < once(1).line.length, 'ch6-2: without the beast the way on foot is shorter');
  // Level 3: a block goes through too, and fills the pool beyond. Without the block, the level is lost.
  assert.ok(once(2).blockSent, 'ch6-3: the block goes through');
  assert.ok(unwinnable(solve(initial(withoutObjects(foldLevel(2), ['block'])))), 'ch6-3: the block is needed');
});

test('the two pages: The Open Sky in level 9 and Arts Unknown in level 10, each off the shortest line but on a winning one', () => {
  assert.deepEqual(CHAPTER_6.pages.map(p => p.id), ['ch6-sky', 'ch6-arts']);
  assert.deepEqual(CHAPTER_6.pages.map(p => p.title), ['The Open Sky', 'Arts Unknown']);
  assert.deepEqual(pageHome('ch6-sky'), [58]);
  assert.deepEqual(pageHome('ch6-arts'), [59]);
  for (const i of [8, 9]) {
    const lv = foldLevel(i);
    assert.equal(lv.pageIds.length, 1);
    assert.ok(!once(i).took.has('page'), `ch6-${i + 1}: the page lies off the shortest line`);
    const copy = { ...lv, objects: lv.objects.map(o => (o === 'page' ? 'relic' as const : o)), relics: lv.relics + 1, pageIds: [], pageCells: [] };
    const r = solve(initial(copy), capOf(i));
    assert.ok(r.solved && r.line.length > once(i).line.length, `ch6-${i + 1}: the page is on a longer, winning route`);
  }
});

test('level 10 has more than one way round: the teleports, or the long way on foot; the red door is the way to the last relic', () => {
  const lv = foldLevel(9);
  assert.ok(lv.terrain.includes('gate') && lv.terrain.includes('exit') && lv.relics > 0);
  assert.ok(lv.terrain.includes('door-red') && lv.objects.includes('key-red'));
  // The red door is the one way to the last relic: without the key the level is lost.
  assert.ok(unwinnable(solve(initial(withoutObjects(lv, ['key-red'])), BIG_CAP)), 'the key is needed');
  // The teleports are a short cut, not the only way: walled up, the level is still won, in more moves.
  const walled = solve(initial(retile(lv, 'teleport', 'wall')), BIG_CAP);
  assert.ok(walled.solved && walled.line.length > once(9).line.length, 'won the long way round, with the teleports walled up');
});
