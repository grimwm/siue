// Both solvers give the breadth-first reference's answers on a small level built around each trap and trick piece
// and on the interactions the spec names (test/piece-levels.ts). Each level's answer is pinned too, plain and
// refusing catches, so a rule change that moves it is seen here; and each interaction level is checked to play
// the interaction it is named for.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, solveRefusing, caught } from '../src/puzzle/solver.ts';
import type { SolveResult } from '../src/puzzle/solver.ts';
import { initial } from '../src/puzzle/state.ts';
import { CORPUS_CAP } from './corpus.ts';
import { sameAnswers } from './same-answers.ts';
import { PIECE_LEVELS } from './piece-levels.ts';
import { mv, play, WAIT } from './puzzle-grid.ts';

/** Each level's shortest line, plain and refusing catches; null when there is none. */
const ANSWERS: Record<string, readonly [number | null, number | null]> = {
  trap: [7, 7],
  popup: [5, 5],
  gravel: [11, 11],
  'fake-wall': [5, null],
  'invisible-wall': [11, 11],
  teleport: [14, null],
  thief: [5, 5],
  bomb: [8, 9],
  'clone-block': [7, 7],
  ball: [6, 6],
  glider: [5, 5],
  fireball: [5, 5],
  'clone-ball': [7, 7],
  'two-clones': [7, 7],
  'throw-back': [5, 5],
  'hazard-snare': [7, 7],
  'hazard-toggle': [5, 5],
  'hazard-bomb': [6, 6],
  'hazard-bomb-clone': [7, 7],
  'hazard-door': [13, 13],
  'minotaur-trap': [3, 3],
  'block-teleport': [3, 3],
  'thief-keys': [10, 10],
  'clone-blocked': [10, 10],
  'hazard-order': [7, 7],
  'hazard-first': [6, null],
  'clone-keep': [18, 18],
};

const shortest = (r: SolveResult): number | null => {
  assert.ok(r.solved || !r.capped, 'the search finished');
  return r.solved ? r.line.length : null;
};

test('every piece level has a pinned answer', () => {
  assert.deepEqual(Object.keys(ANSWERS).sort(), Object.keys(PIECE_LEVELS).sort());
});

for (const [name, level] of Object.entries(PIECE_LEVELS)) {
  test(`${name}: the solvers give the reference's answer`, () => {
    sameAnswers(level, CORPUS_CAP);
    const s = initial(level);
    assert.deepEqual([shortest(solve(s)), shortest(solveRefusing(s, caught))], ANSWERS[name]);
  });
}

const at = (r: number, c: number) => ({ r, c });

test('the Minotaur walks into the snare and is held there', () => {
  const { events } = play(initial(PIECE_LEVELS['minotaur-trap']!), mv('down'));
  assert.ok(events.some(e => e.kind === 'held' && e.who === 'minotaur'));
});

test('a hazard reaches the bomb within a few waits, made by the level or by a machine', () => {
  const exploded = (events: ReturnType<typeof play>['events']) => events.some(e => e.kind === 'exploded' && e.who === 'hazard');
  assert.ok(exploded(play(initial(PIECE_LEVELS['hazard-bomb']!), WAIT, WAIT, WAIT).events));
  assert.ok(exploded(play(initial(PIECE_LEVELS['hazard-bomb-clone']!), mv('right'), mv('right'), WAIT, WAIT, WAIT).events));
});

test('a block teleports into the water beyond the exit teleport', () => {
  const { kinds } = play(initial(PIECE_LEVELS['block-teleport']!), mv('right'));
  assert.deepEqual(kinds, ['pushed', 'teleported', 'sank', 'moved']);
});

test('the thief takes the flippers and leaves the key', () => {
  const { state, events } = play(initial(PIECE_LEVELS['thief-keys']!), mv('right'), mv('right'), mv('right'), mv('right'));
  assert.ok(events.some(e => e.kind === 'robbed'));
  assert.deepEqual([state.gear, state.keys.red], [[], 1]);
});

test('no clone while a block stands in front of the machine', () => {
  // On and off the button three times: the first block sinks, the second stops on the dirt, the third stands on
  // the ice in front of the machine, and the fourth press makes nothing.
  const presses = [mv('right'), mv('right'), mv('left'), mv('right'), mv('left'), mv('right'), mv('left'), mv('right')];
  const { state, events } = play(initial(PIECE_LEVELS['clone-blocked']!), ...presses);
  assert.equal(events.filter(e => e.kind === 'cloned').length, 3);
  assert.deepEqual([2, 3].map(c => state.objects[3 * state.level.cols + c]), ['block', 'block']);
});

test('the hazard first in reading order moves first: the ball behind is blocked and stays', () => {
  const { state } = play(initial(PIECE_LEVELS['hazard-order']!), WAIT);
  assert.deepEqual(state.hazards.map(h => h.at), [at(3, 1), at(3, 3)]);
});

test("a hazard's catch ends the turn before the Minotaur's steps, which would have caught him too", () => {
  const s = play(initial(PIECE_LEVELS['hazard-first']!), WAIT, mv('right')).state;
  const { events } = play(s, mv('right'));
  assert.deepEqual(events.filter(e => e.kind === 'caught').map(e => e.kind === 'caught' && e.by), ['hazard']);
  assert.ok(!events.some(e => e.kind === 'moved' && e.who === 'minotaur'), 'the Minotaur never steps');
  const alone = play({ ...s, hazards: [] }, mv('right')).events;
  assert.deepEqual(alone.filter(e => e.kind === 'caught').map(e => e.kind === 'caught' && e.by), ['minotaur']);
});

test('a block pushed onto the red button clones nothing onto the cell Theseus steps into', () => {
  const s = initial(PIECE_LEVELS['clone-keep']!);
  const pushed = play(s, mv('right'));
  assert.deepEqual(pushed.state.player, at(2, 2));
  assert.ok(!pushed.events.some(e => e.kind === 'cloned'));
  const stepped = play(pushed.state, mv('up'), mv('right'), mv('down'), mv('down'));
  assert.ok(stepped.events.some(e => e.kind === 'cloned'), 'pushing it off and stepping on clones');
});
