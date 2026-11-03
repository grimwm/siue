// Chapter 7, "The Bronze Guard": ten levels that bring in the bronze ball and nothing else new. Every level parses,
// is won by the exact solver, keeps to the pieces released so far, and on each one the balls matter: taken away, the
// level is lost, won in another number of moves, or far easier to search. The teaching levels each teach one thing about them, and the two pages lie off
// the shortest line, on a harder route. The challenge bar and the ramp are gated in test/difficulty.test.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROUNDS, roundLevel } from '../src/puzzle/rounds.ts';
import { CHAPTERS, LEVEL_IDS, levelById, pageHome, chapterOf } from '../src/campaign/chapters.ts';
import { CHAPTER_7 } from '../src/campaign/chapter-7.ts';
import { initial } from '../src/puzzle/state.ts';
import { solve, SOLVER_CAP } from '../src/puzzle/solver.ts';
import type { SolveResult } from '../src/puzzle/solver.ts';
import { step } from '../src/puzzle/step.ts';
import type { Action, GameEvent } from '../src/puzzle/step.ts';
import { parse, serialize } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';
import type { Terrain } from '../src/puzzle/tiles.ts';

/** Each level's shortest line, pinned: a rule change that alters a level fails here. */
const SHORTEST: number[] = [18, 8, 18, 33, 41, 41, 35, 30, 40, 47];
/** Level 10 is larger than the screen; its proofs may search further than the in-game cap. */
const BIG_CAP = 6_000_000;
const capOf = (i: number) => (i === 9 ? BIG_CAP : SOLVER_CAP);

/** The pieces later chapters bring in (Chapters 8 and 9): none may appear here. */
const LATER_TERRAIN: readonly Terrain[] = ['thief', 'bomb', 'clone', 'button-red'];

const noBalls = (lv: Level): Level => ({ ...lv, hazards: [] });
const unwinnable = (r: SolveResult) => !r.solved && !r.capped;

function play(lv: Level, line: readonly Action[]): { events: GameEvent[]; flippedAway: number } {
  const events: GameEvent[] = [];
  let s = initial(lv);
  let flippedAway = 0;
  for (const a of line) {
    const x = step(s, a);
    // A flip on a turn Theseus ends off every button was pressed by a ball.
    if (x.events.some(e => e.kind === 'flipped') && x.state.terrain[x.state.player.r * lv.cols + x.state.player.c] !== 'button') flippedAway++;
    s = x.state;
    events.push(...x.events);
  }
  assert.equal(s.outcome, 'won');
  return { events, flippedAway };
}

function played(i: number) {
  const r = solve(initial(roundLevel(i)), capOf(i));
  assert.ok(r.solved, `ch7-${i + 1} unsolved (explored ${r.explored})`);
  const { events, flippedAway } = play(roundLevel(i), r.line);
  return {
    line: r.line,
    explored: r.explored,
    took: new Set(events.flatMap(e => (e.kind === 'took' ? [e.what] : []))),
    caught: events.some(e => e.kind === 'caught'),
    waits: r.line.filter(a => a.kind === 'wait').length,
    flippedAway,
  };
}
const memo = new Map<number, ReturnType<typeof played>>();
const once = (i: number) => { if (!memo.has(i)) memo.set(i, played(i)); return memo.get(i)!; };

test('Chapter 7 is The Bronze Guard: released, ten levels ch7-1 to ch7-10, three teaching, its lore', () => {
  const seven = CHAPTERS[6]!;
  assert.equal(seven.n, 7);
  assert.equal(seven.name, 'The Bronze Guard');
  assert.equal(seven.released, true);
  assert.deepEqual(seven.levelIds, Array.from({ length: 10 }, (_, i) => `ch7-${i + 1}`));
  assert.equal(seven.teaching, 3);
  assert.equal(seven.lore, CHAPTER_7);
  assert.deepEqual(ROUNDS.map(w => w.id), seven.levelIds);
});

test("the earlier chapters' progress keys stay stable: Chapter 7's levels come after them", () => {
  assert.deepEqual(LEVEL_IDS.slice(0, 10), Array.from({ length: 10 }, (_, i) => `trial-${i + 1}`));
  for (let n = 1; n < 6; n++) assert.deepEqual(LEVEL_IDS.slice(10 * n, 10 * n + 10), CHAPTERS[n]!.levelIds);
  assert.deepEqual(LEVEL_IDS.slice(60, 70), CHAPTERS[6]!.levelIds);
  assert.deepEqual(chapterOf(60), { chapter: CHAPTERS[6], within: 0 });
  assert.deepEqual(chapterOf(69), { chapter: CHAPTERS[6], within: 9 });
});

test("levelById finds Chapter 7's levels, and refuses an unknown id", () => {
  ROUNDS.forEach((w, i) => assert.equal(levelById(w.id), roundLevel(i)));
  assert.throws(() => levelById('ch7-11'));
});

test('every level parses to canonical text, has a title, an intro and a Minotaur; levels 1 to 9 fit 12 by 12', () => {
  assert.equal(ROUNDS.length, 10);
  ROUNDS.forEach((w, i) => {
    assert.equal(serialize(parse(w.text)), w.text, w.id);
    const lv = roundLevel(i);
    assert.ok(lv.title && lv.intro, w.id);
    assert.ok(lv.minotaur, `${w.id} has a Minotaur`);
    if (i < 9) assert.ok(lv.rows <= 12 && lv.cols <= 12, w.id);
  });
  const big = roundLevel(9);
  assert.ok(big.cols > 12 || big.rows > 12, 'level 10 is larger than the screen');
  assert.ok(big.cols <= 20 && big.rows <= 20, 'level 10 fits in 20 by 20');
});

test('the bronze ball is the new piece: every level has one, its intro counts them, and none has a later piece', () => {
  const words = ['', 'one bronze ball', 'two bronze balls', 'three bronze balls'];
  ROUNDS.forEach((w, i) => {
    const lv = roundLevel(i);
    const n = lv.hazards.length;
    assert.ok(n >= 1, `${w.id} has a bronze ball`);
    assert.ok(lv.hazards.every(h => h.kind === 'ball'), `${w.id}: its hazards are bronze balls, and no other`);
    assert.match(lv.intro, new RegExp(`\\b${words[n]}\\b`, 'i'), `${w.id}: the intro names its ${n} bronze balls`);
    for (const t of LATER_TERRAIN) assert.ok(!lv.terrain.includes(t), `${w.id} has no ${t}`);
    assert.equal(lv.machines.length, 0, `${w.id} has no clone machines`);
    assert.ok(!lv.terrain.includes('fake-wall') && !lv.terrain.includes('invisible-wall'), `${w.id} hides no wall`);
  });
});

test('each shortest line is pinned and takes no catch, and on each level the balls matter', () => {
  assert.deepEqual(ROUNDS.map((_, i) => once(i).line.length), SHORTEST);
  ROUNDS.forEach((w, i) => {
    assert.ok(!once(i).caught, `${w.id}: the shortest line is never caught`);
    // As the gate's every-piece rule has it: lost, won in another number of moves, or a search at least 1.3 times
    // smaller.
    const without = solve(initial(noBalls(roundLevel(i))), capOf(i));
    assert.ok(!without.solved || without.line.length !== once(i).line.length || once(i).explored >= 1.3 * without.explored,
      `${w.id}: without the balls, the level plays another way`);
  });
});

test('the teaching levels each teach one thing about the bronze ball', () => {
  // Level 1: the ball rolls straight and turns back: wait in a side niche while it passes. Without it, the way is
  // shorter.
  const free = solve(initial(noBalls(roundLevel(0))));
  assert.ok(once(0).waits > 0, 'ch7-1: the shortest line waits for the ball');
  assert.ok(free.solved && free.line.length < once(0).line.length, 'ch7-1: without the ball the way is shorter');
  // Level 2: the ball and the beast block each other. Rolling in his hall's one way out, it holds him: without the
  // ball the level is lost, and without the beast as well it is won.
  assert.ok(unwinnable(solve(initial(noBalls(roundLevel(1))))), 'ch7-2: without the ball, the beast gets out');
  assert.ok(solve(initial({ ...noBalls(roundLevel(1)), minotaur: null })).solved, 'ch7-2: without the beast too, the way is open');
  // Level 3: the ball presses the button as it rolls over it, and the toggle walls open and shut. Theseus cannot
  // reach the button: without the ball the level is lost.
  assert.ok(once(2).flippedAway > 0, 'ch7-3: the ball flips the walls on the shortest line');
  assert.ok(unwinnable(solve(initial(noBalls(roundLevel(2))))), 'ch7-3: without the ball, the walls never open');
});

test('the two pages: The Brazen Man in level 9 and The Bronze Nail in level 10, each off the shortest line but on a winning one', () => {
  assert.deepEqual(CHAPTER_7.pages.map(p => p.id), ['ch7-brazen', 'ch7-vein']);
  assert.deepEqual(CHAPTER_7.pages.map(p => p.title), ['The Brazen Man', 'The Bronze Nail']);
  assert.deepEqual(pageHome('ch7-brazen'), [68]);
  assert.deepEqual(pageHome('ch7-vein'), [69]);
  for (const i of [8, 9]) {
    const lv = roundLevel(i);
    assert.equal(lv.pageIds.length, 1);
    assert.ok(!once(i).took.has('page'), `ch7-${i + 1}: the page lies off the shortest line`);
    const copy = { ...lv, objects: lv.objects.map(o => (o === 'page' ? 'relic' as const : o)), relics: lv.relics + 1, pageIds: [], pageCells: [] };
    const r = solve(initial(copy), capOf(i));
    assert.ok(r.solved && r.line.length > once(i).line.length, `ch7-${i + 1}: the page is on a longer, winning route`);
  }
});

test('level 10: the red door is the one way to the last relic, and the ball rolls through the middle hall', () => {
  const lv = roundLevel(9);
  assert.ok(lv.terrain.includes('gate') && lv.terrain.includes('exit') && lv.relics > 0);
  assert.ok(lv.terrain.includes('door-red') && lv.objects.includes('key-red'));
  const withoutKey = { ...lv, objects: lv.objects.map(o => (o === 'key-red' ? null : o)) };
  assert.ok(unwinnable(solve(initial(withoutKey), BIG_CAP)), 'the key is needed');
});
