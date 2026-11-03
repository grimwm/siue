// Chapter 9, "Daedalus's Workshop": ten levels that bring in the thief, the bomb and the clone machine with its red
// button, and nothing else new. Every level parses, is won by the exact solver and keeps to the pieces released so
// far. The teaching levels each teach one of the three, and the two pages lie off the shortest line, on a harder
// route. That every piece matters, the challenge bar and the ramp are gated in test/difficulty.test.ts, and the new
// layouts in test/layouts.test.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WORKSHOP, workshopLevel } from '../src/puzzle/workshop.ts';
import { CHAPTERS, LEVEL_IDS, levelById, pageHome, chapterOf } from '../src/campaign/chapters.ts';
import { CHAPTER_9 } from '../src/campaign/chapter-9.ts';
import { initial } from '../src/puzzle/state.ts';
import { solve, SOLVER_CAP } from '../src/puzzle/solver.ts';
import { measure } from '../src/puzzle/difficulty.ts';
import type { SolveResult } from '../src/puzzle/solver.ts';
import { step } from '../src/puzzle/step.ts';
import type { Action, GameEvent } from '../src/puzzle/step.ts';
import { parse, serialize } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';
import type { Terrain } from '../src/puzzle/tiles.ts';

/** Each level's shortest line, pinned: a rule change that alters a level fails here. */
const SHORTEST: number[] = [18, 16, 16];
/** Level 10 is larger than the screen; its proofs may search further than the in-game cap. */
const BIG_CAP = 6_000_000;
const capOf = (i: number) => (i === 9 ? BIG_CAP : SOLVER_CAP);

const unwinnable = (r: SolveResult) => !r.solved && !r.capped;
/** `lv` with every cell of terrain `from` made `to`. */
const swapped = (lv: Level, from: Terrain, to: Terrain): Level =>
  parse(serialize({ ...lv, terrain: lv.terrain.map(t => (t === from ? to : t)) }));
const has = (lv: Level, t: Terrain) => lv.terrain.includes(t);

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
  const r = solve(initial(workshopLevel(i)), capOf(i));
  assert.ok(r.solved, `ch9-${i + 1} unsolved (explored ${r.explored})`);
  const events = play(workshopLevel(i), r.line);
  return {
    line: r.line,
    events,
    took: new Set(events.flatMap(e => (e.kind === 'took' ? [e.what] : []))),
    caught: events.some(e => e.kind === 'caught'),
  };
}
const memo = new Map<number, ReturnType<typeof played>>();
const once = (i: number) => { if (!memo.has(i)) memo.set(i, played(i)); return memo.get(i)!; };

test("Chapter 9 is Daedalus's Workshop: released, ten levels ch9-1 to ch9-10, three teaching, its lore", () => {
  const nine = CHAPTERS[8]!;
  assert.equal(nine.n, 9);
  assert.equal(nine.name, "Daedalus's Workshop");
  assert.equal(nine.released, true);
  assert.deepEqual(nine.levelIds, Array.from({ length: 10 }, (_, i) => `ch9-${i + 1}`));
  assert.equal(nine.teaching, 3);
  assert.equal(nine.lore, CHAPTER_9);
  assert.deepEqual(WORKSHOP.map(w => w.id), nine.levelIds);
});

test("the earlier chapters' progress keys stay stable: Chapter 9's levels come after them", () => {
  assert.deepEqual(LEVEL_IDS.slice(0, 10), Array.from({ length: 10 }, (_, i) => `trial-${i + 1}`));
  for (let n = 1; n < 8; n++) assert.deepEqual(LEVEL_IDS.slice(10 * n, 10 * n + 10), CHAPTERS[n]!.levelIds);
  assert.deepEqual(LEVEL_IDS.slice(80, 90), CHAPTERS[8]!.levelIds);
  assert.deepEqual(chapterOf(80), { chapter: CHAPTERS[8], within: 0 });
  assert.deepEqual(chapterOf(89), { chapter: CHAPTERS[8], within: 9 });
});

test("levelById finds Chapter 9's levels, and refuses an unknown id", () => {
  WORKSHOP.forEach((w, i) => assert.equal(levelById(w.id), workshopLevel(i)));
  assert.throws(() => levelById('ch9-11'));
});

test('every level parses to canonical text, has a title, an intro and a Minotaur; levels 1 to 9 fit 12 by 12', () => {
  assert.equal(WORKSHOP.length, 10);
  WORKSHOP.forEach((w, i) => {
    assert.equal(serialize(parse(w.text)), w.text, w.id);
    const lv = workshopLevel(i);
    assert.ok(lv.title && lv.intro, w.id);
    assert.ok(lv.minotaur, `${w.id} has a Minotaur`);
    if (i < 9) assert.ok(lv.rows <= 12 && lv.cols <= 12, w.id);
  });
  const big = workshopLevel(9);
  assert.ok(big.cols > 12 || big.rows > 12, 'level 10 is larger than the screen');
  assert.ok(big.cols <= 20 && big.rows <= 20, 'level 10 fits in 20 by 20');
});

test('the thief, the bomb and the clone machine are the new pieces: every level has one, its intro names them, and none hides a wall', () => {
  WORKSHOP.forEach((w, i) => {
    const lv = workshopLevel(i);
    const thief = has(lv, 'thief'), bomb = has(lv, 'bomb'), clone = has(lv, 'clone');
    assert.ok(thief || bomb || clone, `${w.id} has a thief, a bomb or a clone machine`);
    const intro = lv.intro.toLowerCase();
    if (thief) assert.match(intro, /thie(f|ves)/, `${w.id}: the intro names its thief`);
    if (bomb) assert.match(intro, /bomb/, `${w.id}: the intro names its bombs`);
    if (clone) assert.match(intro, /clone machine/, `${w.id}: the intro names its clone machine`);
    if (clone) assert.ok(has(lv, 'button-red'), `${w.id}: a clone machine has its red button`);
    assert.ok(!has(lv, 'fake-wall') && !has(lv, 'invisible-wall'), `${w.id} hides no wall`);
  });
  // Each teaching level shows one of the three alone; the challenge levels bring each one back.
  const only = (i: number) => (['thief', 'bomb', 'clone'] as const).filter(t => has(workshopLevel(i), t));
  assert.deepEqual([0, 1, 2].map(only), [['thief'], ['bomb'], ['clone']]);
  const later = WORKSHOP.slice(3).map((_, k) => workshopLevel(k + 3));
  for (const t of ['thief', 'bomb', 'clone'] as const) assert.ok(later.some(lv => has(lv, t)), `a challenge level has a ${t}`);
});

test('each shortest line is pinned and takes no catch', () => {
  assert.deepEqual(WORKSHOP.map((_, i) => once(i).line.length), SHORTEST);
  WORKSHOP.forEach((w, i) => assert.ok(!once(i).caught, `${w.id}: the shortest line is never caught`));
});

test('the teaching levels each teach one of the new pieces', () => {
  // Level 1: the thief takes your gear. The shortest line takes the flippers and goes round it, never robbed; with
  // the thief gone, the way is shorter.
  const one = workshopLevel(0);
  assert.ok(once(0).took.has('flippers'), 'ch9-1: the shortest line takes the flippers');
  assert.ok(!once(0).events.some(e => e.kind === 'robbed'), 'ch9-1: the shortest line is never robbed');
  const free = solve(initial(swapped(one, 'thief', 'floor')));
  assert.ok(free.solved && free.line.length < once(0).line.length, 'ch9-1: without the thief the way is shorter');
  // Level 2: a block pushed onto a bomb bursts it. The shortest line does; with the bomb gone the way is shorter, and
  // without the block only a catch gets past it.
  const two = workshopLevel(1);
  assert.ok(once(1).events.some(e => e.kind === 'exploded' && e.who === 'block'), 'ch9-2: a block bursts the bomb');
  const clear = solve(initial(swapped(two, 'bomb', 'floor')));
  assert.ok(clear.solved && clear.line.length < once(1).line.length, 'ch9-2: without the bomb the way is shorter');
  const noBlock = parse(serialize({ ...two, objects: two.objects.map(o => (o === 'block' ? null : o)) }));
  assert.equal(measure(noBlock).catchFree, 'none', 'ch9-2: without the block, only a catch gets past the bomb');
  // Level 3: the red button makes the clone machine turn out a block, which fills the moat. Without the button the
  // level is lost.
  const three = workshopLevel(2);
  assert.ok(once(2).events.some(e => e.kind === 'cloned' && e.what === 'block'), 'ch9-3: the machine makes a block');
  assert.ok(once(2).events.some(e => e.kind === 'sank'), 'ch9-3: the block fills the water');
  assert.ok(unwinnable(solve(initial(swapped(three, 'button-red', 'floor')))), 'ch9-3: without the red button the moat stays');
});

test('the two pages: The Backward Tracks in level 9 and The First Inventor in level 10, each off the shortest line but on a winning one', () => {
  assert.deepEqual(CHAPTER_9.pages.map(p => p.id), ['ch9-tracks', 'ch9-inventor']);
  assert.deepEqual(CHAPTER_9.pages.map(p => p.title), ['The Backward Tracks', 'The First Inventor']);
  assert.deepEqual(pageHome('ch9-tracks'), [88]);
  assert.deepEqual(pageHome('ch9-inventor'), [89]);
  for (const i of [8, 9]) {
    const lv = workshopLevel(i);
    assert.equal(lv.pageIds.length, 1);
    assert.ok(!once(i).took.has('page'), `ch9-${i + 1}: the page lies off the shortest line`);
    const copy = { ...lv, objects: lv.objects.map(o => (o === 'page' ? 'relic' as const : o)), relics: lv.relics + 1, pageIds: [], pageCells: [] };
    const r = solve(initial(copy), capOf(i));
    assert.ok(r.solved && r.line.length > once(i).line.length, `ch9-${i + 1}: the page is on a longer, winning route`);
  }
});

test('level 10 has all three new pieces, and ends at a gate', () => {
  const lv = workshopLevel(9);
  assert.ok(lv.terrain.includes('gate') && lv.terrain.includes('exit') && lv.relics > 0);
  for (const t of ['thief', 'bomb', 'clone'] as const) assert.ok(has(lv, t), `level 10 has a ${t}`);
});
