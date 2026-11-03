// Chapter 8, "The Harpies' Den": ten levels that bring in the Harpy and Talos's fire and nothing else new. Every
// level parses, is won by the exact solver, keeps to the pieces released so far, and on each one the hazards matter:
// taken away, the level is lost, won in another number of moves, or far easier to search. The teaching levels each
// teach one thing about the two, and the two pages lie off the shortest line, on a harder route. The challenge bar
// and the ramp are gated in test/difficulty.test.ts, and the new layouts in test/layouts.test.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WINDS, windLevel } from '../src/puzzle/winds.ts';
import { CHAPTERS, LEVEL_IDS, levelById, pageHome, chapterOf } from '../src/campaign/chapters.ts';
import { CHAPTER_8 } from '../src/campaign/chapter-8.ts';
import { initial } from '../src/puzzle/state.ts';
import { solve, SOLVER_CAP } from '../src/puzzle/solver.ts';
import type { SolveResult } from '../src/puzzle/solver.ts';
import { step } from '../src/puzzle/step.ts';
import type { Action, GameEvent } from '../src/puzzle/step.ts';
import { parse, serialize } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';
import type { Terrain } from '../src/puzzle/tiles.ts';

/** Each level's shortest line, pinned: a rule change that alters a level fails here. */
const SHORTEST: number[] = [25, 17, 19, 38, 31, 31, 36, 46, 37, 40];
/** Level 10 is larger than the screen; its proofs may search further than the in-game cap. */
const BIG_CAP = 6_000_000;
const capOf = (i: number) => (i === 9 ? BIG_CAP : SOLVER_CAP);

/** The pieces Chapter 9 brings in: none may appear here. */
const LATER_TERRAIN: readonly Terrain[] = ['thief', 'bomb', 'clone', 'button-red'];

const noHazards = (lv: Level): Level => ({ ...lv, hazards: [] });
const unwinnable = (r: SolveResult) => !r.solved && !r.capped;
const count = (lv: Level, kind: string) => lv.hazards.filter(h => h.kind === kind).length;

function play(lv: Level, line: readonly Action[]): { events: GameEvent[]; flippedAway: number; throughFire: number } {
  const events: GameEvent[] = [];
  let s = initial(lv);
  let flippedAway = 0, throughFire = 0;
  for (const a of line) {
    const x = step(s, a);
    // A flip on a turn Theseus ends off every button was pressed by a hazard.
    if (x.events.some(e => e.kind === 'flipped') && x.state.terrain[x.state.player.r * lv.cols + x.state.player.c] !== 'button') flippedAway++;
    for (const e of x.events) {
      if (e.kind === 'moved' && e.who === 'hazard' && e.hazard === 'fireball' && lv.terrain[e.to.r * lv.cols + e.to.c] === 'fire') throughFire++;
    }
    s = x.state;
    events.push(...x.events);
  }
  assert.equal(s.outcome, 'won');
  return { events, flippedAway, throughFire };
}

function played(i: number) {
  const r = solve(initial(windLevel(i)), capOf(i));
  assert.ok(r.solved, `ch8-${i + 1} unsolved (explored ${r.explored})`);
  const { events, flippedAway, throughFire } = play(windLevel(i), r.line);
  return {
    line: r.line,
    explored: r.explored,
    took: new Set(events.flatMap(e => (e.kind === 'took' ? [e.what] : []))),
    caught: events.some(e => e.kind === 'caught'),
    waits: r.line.filter(a => a.kind === 'wait').length,
    flippedAway,
    throughFire,
  };
}
const memo = new Map<number, ReturnType<typeof played>>();
const once = (i: number) => { if (!memo.has(i)) memo.set(i, played(i)); return memo.get(i)!; };

test("Chapter 8 is The Harpies' Den: released, ten levels ch8-1 to ch8-10, three teaching, its lore", () => {
  const eight = CHAPTERS[7]!;
  assert.equal(eight.n, 8);
  assert.equal(eight.name, "The Harpies' Den");
  assert.equal(eight.released, true);
  assert.deepEqual(eight.levelIds, Array.from({ length: 10 }, (_, i) => `ch8-${i + 1}`));
  assert.equal(eight.teaching, 3);
  assert.equal(eight.lore, CHAPTER_8);
  assert.deepEqual(WINDS.map(w => w.id), eight.levelIds);
});

test("the earlier chapters' progress keys stay stable: Chapter 8's levels come after them", () => {
  assert.deepEqual(LEVEL_IDS.slice(0, 10), Array.from({ length: 10 }, (_, i) => `trial-${i + 1}`));
  for (let n = 1; n < 7; n++) assert.deepEqual(LEVEL_IDS.slice(10 * n, 10 * n + 10), CHAPTERS[n]!.levelIds);
  assert.deepEqual(LEVEL_IDS.slice(70, 80), CHAPTERS[7]!.levelIds);
  assert.deepEqual(chapterOf(70), { chapter: CHAPTERS[7], within: 0 });
  assert.deepEqual(chapterOf(79), { chapter: CHAPTERS[7], within: 9 });
});

test("levelById finds Chapter 8's levels, and refuses an unknown id", () => {
  WINDS.forEach((w, i) => assert.equal(levelById(w.id), windLevel(i)));
  assert.throws(() => levelById('ch8-11'));
});

test('every level parses to canonical text, has a title, an intro and a Minotaur; levels 1 to 9 fit 12 by 12', () => {
  assert.equal(WINDS.length, 10);
  WINDS.forEach((w, i) => {
    assert.equal(serialize(parse(w.text)), w.text, w.id);
    const lv = windLevel(i);
    assert.ok(lv.title && lv.intro, w.id);
    assert.ok(lv.minotaur, `${w.id} has a Minotaur`);
    if (i < 9) assert.ok(lv.rows <= 12 && lv.cols <= 12, w.id);
  });
  const big = windLevel(9);
  assert.ok(big.cols > 12 || big.rows > 12, 'level 10 is larger than the screen');
  assert.ok(big.cols <= 20 && big.rows <= 20, 'level 10 fits in 20 by 20');
});

test("the Harpy and Talos's fire are the new pieces: every level has one, its intro counts them, and none has a later piece", () => {
  const harpies = ['', 'one Harpy', 'two Harpies', 'three Harpies'];
  const fires = ['', "Talos's fire", "two of Talos's fires", "three of Talos's fires"];
  const balls = ['', 'one bronze ball', 'two bronze balls', 'three bronze balls'];
  WINDS.forEach((w, i) => {
    const lv = windLevel(i);
    const h = count(lv, 'glider'), f = count(lv, 'fireball'), b = count(lv, 'ball');
    assert.ok(h + f >= 1, `${w.id} has a Harpy or Talos's fire`);
    for (const [n, words, what] of [[h, harpies, 'Harpies'], [f, fires, "Talos's fires"], [b, balls, 'bronze balls']] as const) {
      if (n > 0) assert.ok(lv.intro.toLowerCase().includes(words[n]!.toLowerCase()), `${w.id}: the intro names its ${n} ${what}`);
    }
    if (f === 0) assert.doesNotMatch(lv.intro, /Talos's fire/, `${w.id} names no fire it does not have`);
    if (h === 0) assert.doesNotMatch(lv.intro, /Harp/, `${w.id} names no Harpy it does not have`);
    for (const t of LATER_TERRAIN) assert.ok(!lv.terrain.includes(t), `${w.id} has no ${t}`);
    assert.equal(lv.machines.length, 0, `${w.id} has no clone machines`);
    assert.ok(!lv.terrain.includes('fake-wall') && !lv.terrain.includes('invisible-wall'), `${w.id} hides no wall`);
  });
  // Both new pieces meet the earlier ones in the challenge levels.
  const later = WINDS.slice(3).map((_, k) => windLevel(k + 3));
  assert.ok(later.some(lv => count(lv, 'glider') > 0) && later.some(lv => count(lv, 'fireball') > 0));
});

test('each shortest line is pinned and takes no catch, and on each level the hazards matter', () => {
  assert.deepEqual(WINDS.map((_, i) => once(i).line.length), SHORTEST);
  WINDS.forEach((w, i) => {
    assert.ok(!once(i).caught, `${w.id}: the shortest line is never caught`);
    // As the gate's every-piece rule has it: lost, won in another number of moves, or a search at least 1.3 times
    // smaller.
    const without = solve(initial(noHazards(windLevel(i))), capOf(i));
    assert.ok(!without.solved || without.line.length !== once(i).line.length || once(i).explored >= 1.3 * without.explored,
      `${w.id}: without the hazards, the level plays another way`);
  });
});

test("the teaching levels each teach one thing about the Harpy and Talos's fire", () => {
  // Level 1: the Harpy flies straight and turns at walls: wait while it passes. Without it, the way is shorter.
  const free = solve(initial(noHazards(windLevel(0))));
  assert.ok(once(0).waits > 0, 'ch8-1: the shortest line waits for the Harpy');
  assert.ok(free.solved && free.line.length < once(0).line.length, 'ch8-1: without the Harpy the way is shorter');
  // Level 2: the Harpy flies over water, to a button Theseus cannot reach, and the toggle wall opens and shuts.
  // Without it the level is lost; with the pool walled up, it cannot fly there and the level is lost too.
  const two = windLevel(1);
  assert.ok(once(1).flippedAway > 0, 'ch8-2: the Harpy flips the wall on the shortest line');
  assert.ok(unwinnable(solve(initial(noHazards(two)))), 'ch8-2: without the Harpy, the wall never opens');
  const walled = parse(serialize({ ...two, terrain: two.terrain.map(t => (t === 'water' ? 'wall' : t)) }));
  assert.ok(unwinnable(solve(initial(walled))), 'ch8-2: with the pool walled up, the Harpy cannot cross it');
  assert.ok(!two.objects.includes('flippers'), 'ch8-2: Theseus cannot swim to the button');
  // Level 3: Talos's fire runs through fire: it crosses the burning hall Theseus needs boots for. Without it, the
  // way is shorter.
  const three = windLevel(2);
  assert.ok(once(2).throughFire > 0, "ch8-3: Talos's fire runs through the fire on the shortest line");
  assert.ok(once(2).took.has('fire-boots'), 'ch8-3: the shortest line takes the fire boots');
  const cool = solve(initial(noHazards(three)));
  assert.ok(cool.solved && cool.line.length < once(2).line.length, "ch8-3: without Talos's fire the way is shorter");
});

test('the two pages: Storm-Swift in level 9 and Melted Lead in level 10, each off the shortest line but on a winning one', () => {
  assert.deepEqual(CHAPTER_8.pages.map(p => p.id), ['ch8-storm', 'ch8-lead']);
  assert.deepEqual(CHAPTER_8.pages.map(p => p.title), ['Storm-Swift', 'Melted Lead']);
  assert.deepEqual(pageHome('ch8-storm'), [78]);
  assert.deepEqual(pageHome('ch8-lead'), [79]);
  for (const i of [8, 9]) {
    const lv = windLevel(i);
    assert.equal(lv.pageIds.length, 1);
    assert.ok(!once(i).took.has('page'), `ch8-${i + 1}: the page lies off the shortest line`);
    const copy = { ...lv, objects: lv.objects.map(o => (o === 'page' ? 'relic' as const : o)), relics: lv.relics + 1, pageIds: [], pageCells: [] };
    const r = solve(initial(copy), capOf(i));
    assert.ok(r.solved && r.line.length > once(i).line.length, `ch8-${i + 1}: the page is on a longer, winning route`);
  }
});

test('level 10 has both new pieces, and ends at a gate', () => {
  const lv = windLevel(9);
  assert.ok(lv.terrain.includes('gate') && lv.terrain.includes('exit') && lv.relics > 0);
  assert.ok(count(lv, 'glider') > 0 && count(lv, 'fireball') > 0);
});
