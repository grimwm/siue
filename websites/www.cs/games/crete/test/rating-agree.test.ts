// The editor's rating (src/endless/gate.ts's rating, which the editor's Check shows) and Endless's gate agree: on
// every level of every grade's bank the rating finds nothing wrong, gives the score the bank wrote, and puts the level
// in a band; and on levels the gate turns away, the rating names the same first cause.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BANKS } from '../src/endless/bank.ts';
import { gateProblems, knownOf, levelChecks, rating } from '../src/endless/gate.ts';
import { campaignLevels } from '../src/endless/campaign.ts';
import { finish } from '../src/puzzle/astar.ts';
import { measure } from '../src/puzzle/difficulty.ts';
import { bandOf, gradeOf, GRADES } from '../src/puzzle/rating.ts';
import { parse } from '../src/puzzle/level.ts';

const known = knownOf(campaignLevels());
const anyBand = { least: 0, most: Number.MAX_SAFE_INTEGER, plateau: true };

test('every bank level: the gate passes it at its grade, and the editor\'s rating finds nothing wrong and gives its score', () => {
  for (const g of GRADES) {
    BANKS[g].forEach((b, i) => {
      const level = parse(b.text), d = measure(level);
      assert.deepEqual(gateProblems(level, d, { grade: g, band: anyBand, previous: null }, known), [], `${g} ${i}: the gate`);
      const r = finish(rating(level, d));
      assert.deepEqual(r.problems.map(p => p.words), [], `${g} ${i}: the rating`);
      assert.equal(r.score!.total, b.score, `${g} ${i}: the score`);
      assert.equal(r.band, bandOf(b.score));
    });
  }
});

test('levels the gate turns away: the rating names the same first cause', () => {
  const levels = [
    // The cow set down at once wins.
    'title: \nintro: \n\n##############\n#FFF#...#....#\n#FFF|...#....#\n##.####.####.E\n#...u...#....#\n#.P....c#....#\n#.......#....#\n#....>>>.....#\n###.##.##.####\n#...#...#....#\n#..M#........#\n#...#...#...*#\n#.......#....#\n##############\n',
    // Rooms, too open.
    'title: \nintro: \n\n##############\n#...P..#.....#\n#..*......*..#\n####.##.##.###\n#..O..h.*....#\n#............#\n#............#\n######.###.###\n#......#.FF..#\n#........FF..#\n#......#.FF..#\n#...M..#.FF..#\n###E##########\n',
  ].map(t => parse(t));
  for (const level of levels) {
    const d = measure(level);
    const r = finish(rating(level, d));
    assert.ok(r.problems.length > 0);
    const grade = r.score ? gradeOf(bandOf(r.score.total)) : 'medium';
    const gate = finish(levelChecks(level, d, grade, false));
    assert.equal(gate.problems[0]!.words, r.problems[0]!.words);
    assert.deepEqual(gateProblems(level, d, { grade, band: anyBand, previous: null }, { features: [] })[0], r.problems[0]!.words);
  }
});
