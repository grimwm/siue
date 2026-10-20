// The difficulty measure on small hand-made levels, and the campaign gate: every released level clears the bar,
// and a chapter's challenge levels are a real fight.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { measure, challengeProblems, rampProblems, BAR } from '../src/puzzle/difficulty.ts';
import type { Difficulty } from '../src/puzzle/difficulty.ts';
import { parse } from '../src/puzzle/level.ts';
import { CHAPTERS, levelById } from '../src/campaign/chapters.ts';

const level = (rows: readonly string[], header = '') => parse(`title: t\nintro: i\n${header}\n${rows.join('\n')}\n`);

/** The beast is walled off in his own hall: he never touches the route. */
const WALLED = level([
  '#######',
  '#P...E#',
  '#######',
  '#M....#',
  '#######',
]);
/** Walking straight up to the exit runs into the beast; the only win spends a catch. */
const CHASED = level([
  '########',
  '#..SM.E#',
  '#......#',
  '#......#',
  '#.....P#',
  '########',
], 'hearts: 2');

test('a walled-off Minotaur adds nothing: delta 0, the line that ignores him wins, and the bar says so', () => {
  const d = measure(WALLED);
  assert.deepEqual(d, { solved: true, shortest: 4, explored: d.explored, withoutMinotaur: 4, minotaurDelta: 0, greedyWins: true, catchFree: 4, catches: 0 });
  assert.match(challengeProblems(d).join(), /does not matter/);
});

test('a level without a Minotaur: no Minotaur-free search, delta 0, the line wins', () => {
  const d = measure({ ...WALLED, minotaur: null });
  assert.equal(d.withoutMinotaur, null);
  assert.equal(d.minotaurDelta, 0);
  assert.equal(d.greedyWins, true);
  assert.deepEqual(challengeProblems(d), []);
  assert.match(challengeProblems(d, BAR, { teaching: [] }).join(), /has a Minotaur/);
});

test('a Minotaur in the way: ignoring him loses, he adds moves, and the only win takes a catch', () => {
  const d = measure(CHASED);
  assert.equal(d.shortest, 6);
  assert.equal(d.withoutMinotaur, 3);
  assert.equal(d.minotaurDelta, 3);
  assert.equal(d.greedyWins, false);
  assert.equal(d.catches, 1);
  assert.equal(d.catchFree, 'none', 'proved: no win without a catch');
  assert.deepEqual(challengeProblems(d), []);
  const free = measure(WALLED);
  assert.equal(free.catchFree, free.shortest, 'a catch-free win is the shortest when nothing chases');
});

test('the challenge rules: against the teaching levels and the bar', () => {
  const d = measure(CHASED);
  const easy = { ...d, explored: 1, shortest: 2 };
  assert.match(challengeProblems(d, BAR, { teaching: [easy] }).join(), /adds 3 moves, the bar is 8/);
  assert.deepEqual(challengeProblems(d, { minotaurDelta: 3, exploredTimes: 1 }, { teaching: [easy] }), []);
  const hard = { ...d, explored: d.explored, shortest: 7 };
  const p = challengeProblems(d, { minotaurDelta: 3, exploredTimes: 2 }, { teaching: [easy, hard] });
  assert.equal(p.length, 2, p.join('; '));
  assert.match(p[0]!, /explored/);
  assert.match(p[1]!, /shorter than the longest teaching level's 7/);
  assert.match(challengeProblems(measure(WALLED), { minotaurDelta: 0, exploredTimes: 0 }, { teaching: [] }).join(), /must lose/);
  assert.deepEqual(rampProblems(easy, d), []);
  assert.match(rampProblems(d, easy).join(), /fewer than the challenge level before it/);
});

test('a capped search is unknown, never none; an exhausted one is none', () => {
  const capped = measure(CHASED, 5);
  assert.equal(capped.solved, false);
  assert.equal(capped.shortest, 'unknown');
  assert.equal(capped.catchFree, 'unknown');
  assert.equal(capped.minotaurDelta, null);
  assert.match(challengeProblems(capped).join(), /hit its cap/);
  const sealed = measure(level(['#####', '#P#E#', '#####']));
  assert.equal(sealed.shortest, 'none');
  assert.equal(sealed.catchFree, 'none');
  assert.deepEqual(challengeProblems(sealed), ['the level cannot be won']);
});

// The campaign gate. Each released chapter's levels are measured once.
const measured = new Map<string, Difficulty>();
const of = (id: string) => { if (!measured.has(id)) measured.set(id, measure(levelById(id))); return measured.get(id)!; };

for (const chapter of CHAPTERS.filter(c => c.released)) {
  const teaching = chapter.levelIds.slice(0, chapter.teaching);
  const challenges = chapter.levelIds.slice(chapter.teaching);
  test(`chapter ${chapter.n}: a teaching stretch, then at least one challenge level`, () => {
    assert.ok(teaching.length > 0 && challenges.length > 0);
  });
  for (const id of teaching) {
    test(`${id} clears the bar: its Minotaur shapes the route`, () => {
      assert.deepEqual(challengeProblems(of(id)), [], id);
    });
  }
  challenges.forEach((id, k) => {
    test(`${id} is a challenge level: a real fight, no easier than the one before`, () => {
      const problems = [
        ...challengeProblems(of(id), BAR, { teaching: teaching.map(of) }),
        ...(k > 0 ? rampProblems(of(challenges[k - 1]!), of(id)) : []),
      ];
      assert.deepEqual(problems, [], id);
    });
  });
}
