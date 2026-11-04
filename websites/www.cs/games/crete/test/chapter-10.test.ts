// Chapter 10, "The Heart of the Labyrinth", the campaign's last: ten levels that bring in nothing new. Every level
// parses, is won by the exact solver and keeps to the pieces released so far. The teaching levels each join two
// earlier pieces in a new way, the challenge levels mix pieces from across the campaign, and the two pages lie off
// the shortest line, on a harder route. That every piece matters, the challenge bar and the ramp are gated in
// test/difficulty.test.ts, and the new layouts in test/layouts.test.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HEART, heartLevel } from '../src/puzzle/heart.ts';
import { CHAPTERS, LEVEL_IDS, levelById, pageHome, chapterOf, nextChapter } from '../src/campaign/chapters.ts';
import { CHAPTER_10 } from '../src/campaign/chapter-10.ts';
import { endingFor } from '../src/campaign/lore.ts';
import { initial } from '../src/puzzle/state.ts';
import { solve, SOLVER_CAP } from '../src/puzzle/solver.ts';
import type { SolveResult } from '../src/puzzle/solver.ts';
import { step } from '../src/puzzle/step.ts';
import type { Action, GameEvent } from '../src/puzzle/step.ts';
import { parse, serialize } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';
import type { ObjectKind, Terrain } from '../src/puzzle/tiles.ts';

/** Each level's shortest line, pinned: a rule change that alters a level fails here. */
const SHORTEST: number[] = [20, 16, 22, 50, 42, 42, 54, 55, 42, 48];
/** Level 10 is larger than the screen; its proofs may search further than the in-game cap. */
const BIG_CAP = 6_000_000;
const capOf = (i: number) => (i === 9 ? BIG_CAP : SOLVER_CAP);

const unwinnable = (r: SolveResult) => !r.solved && !r.capped;
const has = (lv: Level, t: Terrain) => lv.terrain.includes(t);
const holds = (lv: Level, o: ObjectKind) => lv.objects.includes(o);
/** `lv` with every cell of terrain `from` made `to`. */
const swapped = (lv: Level, from: Terrain, to: Terrain): Level =>
  parse(serialize({ ...lv, terrain: lv.terrain.map(t => (t === from ? to : t)) }));
/** `lv` without its objects of kind `o`. */
const without = (lv: Level, o: ObjectKind): Level =>
  parse(serialize({ ...lv, objects: lv.objects.map(x => (x === o ? null : x)) }));
const lengthOf = (lv: Level) => { const r = solve(initial(lv)); return r.solved ? r.line.length : Infinity; };

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
  const r = solve(initial(heartLevel(i)), capOf(i));
  assert.ok(r.solved, `ch10-${i + 1} unsolved (explored ${r.explored})`);
  const events = play(heartLevel(i), r.line);
  return {
    line: r.line,
    events,
    took: new Set(events.flatMap(e => (e.kind === 'took' ? [e.what] : []))),
    caught: events.some(e => e.kind === 'caught'),
    used: (tool: 'mirror' | 'cow') => r.line.some(a => a.kind === 'tool' && a.tool === tool),
  };
}
const memo = new Map<number, ReturnType<typeof played>>();
const once = (i: number) => { if (!memo.has(i)) memo.set(i, played(i)); return memo.get(i)!; };

test('Chapter 10 is The Heart of the Labyrinth: released, ten levels ch10-1 to ch10-10, three teaching, its lore', () => {
  const ten = CHAPTERS[9]!;
  assert.equal(ten.n, 10);
  assert.equal(ten.name, 'The Heart of the Labyrinth');
  assert.equal(ten.released, true);
  assert.deepEqual(ten.levelIds, Array.from({ length: 10 }, (_, i) => `ch10-${i + 1}`));
  assert.equal(ten.teaching, 3);
  assert.equal(ten.lore, CHAPTER_10);
  assert.deepEqual(HEART.map(w => w.id), ten.levelIds);
  assert.equal(nextChapter(10), null, 'the last chapter');
});

test("the earlier chapters' progress keys stay stable: Chapter 10's levels come last", () => {
  assert.deepEqual(LEVEL_IDS.slice(0, 10), Array.from({ length: 10 }, (_, i) => `trial-${i + 1}`));
  for (let n = 1; n < 9; n++) assert.deepEqual(LEVEL_IDS.slice(10 * n, 10 * n + 10), CHAPTERS[n]!.levelIds);
  assert.deepEqual(LEVEL_IDS.slice(90), CHAPTERS[9]!.levelIds);
  assert.equal(LEVEL_IDS.length, 100);
  assert.deepEqual(chapterOf(90), { chapter: CHAPTERS[9], within: 0 });
  assert.deepEqual(chapterOf(99), { chapter: CHAPTERS[9], within: 9 });
});

test("levelById finds Chapter 10's levels, and refuses an unknown id", () => {
  HEART.forEach((w, i) => assert.equal(levelById(w.id), heartLevel(i)));
  assert.throws(() => levelById('ch10-11'));
});

test('every level parses to canonical text, has a title, an intro and a Minotaur; levels 1 to 9 fit 12 by 12', () => {
  assert.equal(HEART.length, 10);
  HEART.forEach((w, i) => {
    assert.equal(serialize(parse(w.text)), w.text, w.id);
    const lv = heartLevel(i);
    assert.ok(lv.title && lv.intro, w.id);
    assert.ok(lv.minotaur, `${w.id} has a Minotaur`);
    if (i < 9) assert.ok(lv.rows <= 12 && lv.cols <= 12, w.id);
  });
  const big = heartLevel(9);
  assert.ok(big.cols > 12 || big.rows > 12, 'level 10 is larger than the screen');
  assert.ok(big.cols <= 20 && big.rows <= 20, 'level 10 fits in 20 by 20');
});

test('nothing new: no level hides a wall, and every intro names the tools it holds', () => {
  HEART.forEach((w, i) => {
    const lv = heartLevel(i);
    assert.ok(!has(lv, 'fake-wall') && !has(lv, 'invisible-wall'), `${w.id} hides no wall`);
    const intro = lv.intro.toLowerCase();
    if (holds(lv, 'cow')) assert.match(intro, /cow/, `${w.id}: the intro names the cow`);
    if (holds(lv, 'mirror')) assert.match(intro, /mirror/, `${w.id}: the intro names the mirror`);
    if (has(lv, 'trap')) assert.match(intro, /snare/, `${w.id}: the intro names the snare`);
    if (has(lv, 'bomb')) assert.match(intro, /bomb/, `${w.id}: the intro names the bomb`);
    if (has(lv, 'thief')) assert.match(intro, /thie(f|ves)/, `${w.id}: the intro names the thief`);
    if (has(lv, 'teleport')) assert.match(intro, /teleport/, `${w.id}: the intro names the teleports`);
    if (has(lv, 'clone')) assert.match(intro, /clone machine/, `${w.id}: the intro names the clone machine`);
  });
});

test('each shortest line is pinned and takes no catch', () => {
  assert.deepEqual(HEART.map((_, i) => once(i).line.length), SHORTEST);
  HEART.forEach((w, i) => assert.ok(!once(i).caught, `${w.id}: the shortest line is never caught`));
});

test('the teaching levels each join two earlier pieces in a new way', () => {
  // Level 1: the wooden cow lures the beast, and a snare holds him. The shortest line sets the cow down and the beast,
  // turning back from it, walks into the snare and is held; without the cow the way is longer, or lost.
  const one = heartLevel(0);
  assert.ok(once(0).used('cow'), 'ch10-1: the shortest line sets the cow down');
  assert.ok(once(0).events.some(e => e.kind === 'held' && e.who === 'minotaur'), 'ch10-1: the snare holds the beast');
  assert.ok(lengthOf(without(one, 'cow')) > once(0).line.length, 'ch10-1: without the cow the way is longer, or lost');
  // Level 2: Medusa's mirror stills the beast but not Talos's fire. The shortest line holds the mirror up; without it
  // the way is longer or lost, and without the fire it is shorter.
  const two = heartLevel(1);
  assert.ok(once(1).used('mirror'), 'ch10-2: the shortest line holds the mirror up');
  assert.ok(lengthOf(without(two, 'mirror')) > once(1).line.length, 'ch10-2: without the mirror the way is longer, or lost');
  assert.ok(lengthOf({ ...two, hazards: [] }) < once(1).line.length, "ch10-2: without Talos's fire the way is shorter");
  // Level 3: a block pushed through a teleport bursts the bomb on the far side. Without the bomb the way is shorter;
  // without the block only a catch gets past it.
  const three = heartLevel(2);
  assert.ok(once(2).events.some(e => e.kind === 'teleported' && e.who === 'block'), 'ch10-3: the block goes through the teleport');
  assert.ok(once(2).events.some(e => e.kind === 'exploded' && e.who === 'block'), 'ch10-3: the block bursts the bomb');
  assert.ok(lengthOf(swapped(three, 'bomb', 'floor')) < once(2).line.length, 'ch10-3: without the bomb the way is shorter');
  assert.ok(unwinnable(solve(initial(without(three, 'block')))) || lengthOf(without(three, 'block')) > once(2).line.length,
    'ch10-3: without the block the way is longer, or lost');
});

test('the challenge levels bring back pieces from across the campaign', () => {
  const later = HEART.slice(3).map((_, k) => heartLevel(k + 3));
  const kinds: [string, (lv: Level) => boolean][] = [
    ['a snare', lv => has(lv, 'trap')], ['the cow', lv => holds(lv, 'cow')], ['the mirror', lv => holds(lv, 'mirror')],
    ['a teleport', lv => has(lv, 'teleport')], ['a bomb', lv => has(lv, 'bomb')], ['a thief', lv => has(lv, 'thief')],
    ['a clone machine', lv => has(lv, 'clone')], ['gravel', lv => has(lv, 'gravel')], ['ice', lv => has(lv, 'ice')],
    ['fire', lv => has(lv, 'fire')], ['a moving hazard', lv => lv.hazards.length > 0],
  ];
  for (const [what, found] of kinds) assert.ok(later.some(found), `a challenge level has ${what}`);
});

test('the two pages: The Last Part in level 9 and The Fallen Oak in level 10, each off the shortest line but on a winning one', () => {
  assert.deepEqual(CHAPTER_10.pages.map(p => p.id), ['ch10-last-part', 'ch10-oak']);
  assert.deepEqual(CHAPTER_10.pages.map(p => p.title), ['The Last Part', 'The Fallen Oak']);
  assert.deepEqual(pageHome('ch10-last-part'), [98]);
  assert.deepEqual(pageHome('ch10-oak'), [99]);
  for (const i of [8, 9]) {
    const lv = heartLevel(i);
    assert.equal(lv.pageIds.length, 1);
    assert.ok(!once(i).took.has('page'), `ch10-${i + 1}: the page lies off the shortest line`);
    const copy = { ...lv, objects: lv.objects.map(o => (o === 'page' ? 'relic' as const : o)), relics: lv.relics + 1, pageIds: [], pageCells: [] };
    const r = solve(initial(copy), capOf(i));
    assert.ok(r.solved && r.line.length > once(i).line.length, `ch10-${i + 1}: the page is on a longer, winning route`);
  }
});

test('level 10 ends at a gate, and its shortest line holds the beast in a snare', () => {
  const lv = heartLevel(9);
  assert.ok(lv.terrain.includes('gate') && lv.terrain.includes('exit') && lv.relics > 0);
  assert.ok(has(lv, 'trap'), 'level 10 has a snare');
  assert.ok(once(9).events.some(e => e.kind === 'held' && e.who === 'minotaur'), 'the snare holds the beast on the way out');
});

test('the campaign ends by the pages found: every one, some, or none', () => {
  const endings = CHAPTER_10.closing.endings!;
  assert.deepEqual(endings.map(e => e.pages), ['all', 'some', 'none']);
  assert.equal(endingFor(endings, 20, 20)!.pages, 'all');
  assert.equal(endingFor(endings, 7, 20)!.pages, 'some');
  assert.equal(endingFor(endings, 0, 20)!.pages, 'none');
  CHAPTERS.slice(0, 9).forEach(c => assert.equal(c.lore!.closing.endings, undefined, `chapter ${c.n} has no ending`));
});
