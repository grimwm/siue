// The habit players, the difficulty score, openness and the tools' rules (src/puzzle/habits.ts, src/puzzle/rating.ts):
// what Endless's gate and the editor's Check both rate a level by.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../src/puzzle/level.ts';
import { measure, naiveWalkWins, purposeProblems, purposing } from '../src/puzzle/difficulty.ts';
import { finish } from '../src/puzzle/astar.ts';
import { habitWins, HABIT_LIST } from '../src/puzzle/habits.ts';
import { bandOf, gradeOf, habitProblems, openness, openProblems, scoring, toolProblems, walledIn, OPEN, WEIGHTS } from '../src/puzzle/rating.ts';
import { levelById, CHAPTERS } from '../src/campaign/chapters.ts';

/** A level of rooms where setting the cow down at once and walking wins. */
const COW = parse('title: \nintro: \n\n##############\n#FFF#...#....#\n#FFF|...#....#\n##.####.####.E\n#...u...#....#\n#.P....c#....#\n#.......#....#\n#....>>>.....#\n###.##.##.####\n#...#...#....#\n#..M#........#\n#...#...#...*#\n#.......#....#\n##############\n');
/** A level that every habit wins, the walk round the Minotaur included, though the walk through him loses. */
const WALK = parse('title: \nintro: \nfacing: left\n\n#######E####\n#..........#\n#*....#....#\n#....w#....#\n#~~~~~....M#\n#;###.#.####\n#.....#...P#\n#.....#....#\n#*....#f...#\n#...*.#....#\n#..........#\n############\n');
/** A level no habit wins. */
const NONE = parse('title: \nintro: \n\n##############\n#...P..#.....#\n#..*......*..#\n####.##.##.###\n#..O..h.*....#\n#............#\n#............#\n######.###.###\n#......#.FF..#\n#........FF..#\n#......#.FF..#\n#...M..#.FF..#\n###E##########\n');

test('the habits: the cow set down at once wins one level, every habit another, none a third', () => {
  assert.deepEqual(habitWins(COW, measure(COW).shortest as number), ['cowAtOnce', 'cowNear', 'toolsNear', 'carefulTools', 'cowStuck', 'cowStuckCareful']);
  assert.deepEqual(habitWins(WALK, measure(WALK).shortest as number), HABIT_LIST);
  assert.equal(naiveWalkWins(WALK), false, 'the walk through the Minotaur loses where the walk round him wins');
  assert.deepEqual(habitWins(NONE, measure(NONE).shortest as number), []);
  const words = habitProblems(COW, measure(COW)).map(p => p.words);
  assert.ok(words.includes('The cow habit wins: setting the cow down at once and walking clears it'));
});

test('the score: its parts weighed by WEIGHTS; the detour is the moves the Minotaur adds; the waits are the line\'s', () => {
  for (const id of ['ch8-7', 'ch5-10', 'trial-10']) {
    const lv = levelById(id), d = measure(lv);
    const s = finish(scoring(lv, d));
    assert.equal(s.total, WEIGHTS.detour * s.detour + WEIGHTS.offRoute * s.offRoute + WEIGHTS.away * s.away + WEIGHTS.waits * s.waits + WEIGHTS.traps * s.traps + WEIGHTS.forced * s.forced, id);
    assert.equal(s.detour, d.minotaurDelta, id);
    assert.equal(s.waits, [...d.line].filter(c => c === 'w').length, id);
    assert.ok(s.offRoute <= d.shortest as number, id);
  }
});

test('openness: a room of open 2 × 2 blocks is one area, and walled into corridors it has none, its cells still joined', () => {
  const lv = parse('title: \nintro: \n\n#########\n#P......#\n#.......#\n#.......#\n#.......#\n#######E#\n');
  const o = openness(lv);
  assert.equal(o.areas.length, 1);
  assert.ok(o.share > OPEN.most);
  const walled = walledIn(lv, o.areas[0]!.cells);
  assert.equal(openness(walled).areas.length, 0);
  assert.ok(measure(walled).solved, 'still a level');
  const problems = finish(openProblems(lv, finish(scoring(lv, measure(lv))), 200_000));
  assert.ok(problems.some(p => p.words.startsWith('Too open: ')), JSON.stringify(problems));
});

test('the tools: a cow no one needs is named, with the level without it as its mend; a needed one is not', () => {
  const lv = parse('title: \nintro: \n\n#########\n#P.c...E#\n#.......#\n#########\n#M......#\n#########\n');
  const problems = finish(toolProblems(lv, measure(lv), 'medium', 200_000));
  assert.equal(problems.length, 1);
  assert.match(problems[0]!.words, /^The cow is not needed: without it the level is won in \d+ moves$/);
  assert.equal(problems[0]!.mended!.objects.includes('cow'), false);
  assert.deepEqual(finish(toolProblems(NONE, measure(NONE), 'hard', 200_000)), []);
});

test('purposing gives purposeProblems\'s answer, a piece at a time', () => {
  for (const id of CHAPTERS[1]!.levelIds.slice(3, 6)) {
    const lv = levelById(id), d = measure(lv);
    assert.deepEqual(finish(purposing(lv, d)), purposeProblems(lv, d), id);
  }
});

test('the bands: Too Easy under 25, Easy, Medium from 70, Hard from 110 to 170, Beyond Hard past it', () => {
  assert.deepEqual([24, 25, 69, 70, 109, 110, 170, 171].map(bandOf), ['Too Easy', 'Easy', 'Easy', 'Medium', 'Medium', 'Hard', 'Hard', 'Beyond Hard']);
  assert.deepEqual((['Too Easy', 'Easy', 'Medium', 'Hard', 'Beyond Hard'] as const).map(gradeOf), ['easy', 'easy', 'medium', 'hard', 'hard']);
});
