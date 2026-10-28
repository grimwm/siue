// The editor's Check: the checker's state (a search per text, edits cancelling it, stop and resume, a done result
// reused or gone stale) with a fake job whose answer comes on demand, and the lines the panel shows for each answer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createChecker, checkLines, checkSummary } from '../src/editor/check.ts';
import type { CheckState } from '../src/editor/check.ts';
import { hardPieces, measure, sharedProblems } from '../src/puzzle/difficulty.ts';
import type { Difficulty } from '../src/puzzle/difficulty.ts';
import { parse } from '../src/puzzle/level.ts';
import { TRIALS } from '../src/puzzle/trials.ts';
import { ANSWER, REPORT, fakeSearches } from './editor-fakes.ts';

function fakes() {
  const f = fakeSearches();
  let changes = 0;
  return { start: f.start, jobs: f.searches, changes: () => changes, onChange: () => { changes++; } };
}
const DIFF = ANSWER;
const tick = () => new Promise<void>(r => setImmediate(r));

test('a check runs the search, shows its progress, and keeps the answer', async () => {
  const f = fakes();
  const c = createChecker(f.start, f.onChange);
  assert.deepEqual(c.state, { kind: 'none' });
  const p = c.check('A');
  assert.deepEqual(c.state, { kind: 'running', text: 'A', report: null, stopped: false });
  f.jobs[0]!.report(REPORT);
  assert.deepEqual(c.state, { kind: 'running', text: 'A', report: REPORT, stopped: false });
  f.jobs[0]!.answer(DIFF);
  assert.equal(await p, DIFF);
  assert.deepEqual(c.state, { kind: 'done', text: 'A', d: DIFF });
  assert.ok(f.changes() >= 3);
});

test('an edit cancels the running check and its answer is dropped', async () => {
  const f = fakes();
  const c = createChecker(f.start, f.onChange);
  const p = c.check('A');
  c.edited('B');
  assert.deepEqual(f.jobs[0]!.calls, ['cancel']);
  assert.deepEqual(c.state, { kind: 'none' });
  assert.equal(await p, null);
  assert.deepEqual(c.state, { kind: 'none' });
  // A late answer from the cancelled job changes nothing.
  f.jobs[0]!.answer(DIFF);
  await tick();
  assert.deepEqual(c.state, { kind: 'none' });
});

test('a check superseded by a newer check resolves null, whatever error the old job rejects with', async () => {
  const f = fakes();
  const c = createChecker(f.start, f.onChange);
  const first = c.check('A');
  const second = c.check('B');
  assert.equal(await first, null);
  assert.equal(c.state.kind, 'running');
  assert.equal((c.state as { text: string }).text, 'B');
  f.jobs[1]!.answer(DIFF);
  assert.equal(await second, DIFF);
});

test('an edit back to the running text leaves the search running', async () => {
  const f = fakes();
  const c = createChecker(f.start, f.onChange);
  const p = c.check('A');
  c.edited('A');
  assert.deepEqual(f.jobs[0]!.calls, []);
  f.jobs[0]!.answer(DIFF);
  assert.equal(await p, DIFF);
});

test('undo to the checked text makes the result current', async () => {
  const f = fakes();
  const c = createChecker(f.start, f.onChange);
  const p = c.check('A');
  f.jobs[0]!.answer(DIFF);
  await p;
  c.edited('B');
  assert.equal(c.state.kind, 'done');
  assert.equal(checkLines(c.state, 'B', parse(TRIALS[8]!.text)).stale, true);
  c.edited('A');
  assert.equal(checkLines(c.state, 'A', parse(TRIALS[8]!.text)).stale, false);
});

test('stop pauses; keep searching resumes', async () => {
  const f = fakes();
  const c = createChecker(f.start, f.onChange);
  const p = c.check('A');
  c.stop();
  assert.deepEqual(f.jobs[0]!.calls, ['stop']);
  assert.equal((c.state as { stopped: boolean }).stopped, true);
  c.stop();
  assert.deepEqual(f.jobs[0]!.calls, ['stop']);
  c.keepSearching();
  assert.deepEqual(f.jobs[0]!.calls, ['stop', 'resume']);
  assert.equal((c.state as { stopped: boolean }).stopped, false);
  c.keepSearching();
  assert.deepEqual(f.jobs[0]!.calls, ['stop', 'resume']);
  f.jobs[0]!.answer(DIFF);
  await p;
  c.stop();
  c.keepSearching();
  assert.deepEqual(f.jobs[0]!.calls, ['stop', 'resume']);
});

test('a second check of the same text reuses the result, and a running one is shared', async () => {
  const f = fakes();
  const c = createChecker(f.start, f.onChange);
  const p = c.check('A');
  const again = c.check('A');
  assert.equal(f.jobs.length, 1);
  f.jobs[0]!.answer(DIFF);
  assert.equal(await p, DIFF);
  assert.equal(await again, DIFF);
  assert.equal(await c.check('A'), DIFF);
  assert.equal(f.jobs.length, 1);
  void c.check('B');
  assert.equal(f.jobs.length, 2);
});

test('a failed search shows its message and resolves null', async () => {
  const f = fakes();
  const c = createChecker(f.start, f.onChange);
  const p = c.check('A');
  f.jobs[0]!.fail('the solver worker failed to run');
  assert.equal(await p, null);
  assert.deepEqual(c.state, { kind: 'failed', text: 'A', message: 'the solver worker failed to run' });
  assert.deepEqual(checkLines(c.state, 'A', parse(TRIALS[8]!.text)).lines, ['The solver stopped: the solver worker failed to run']);
});

test('a search that cannot start fails at once', async () => {
  const c = createChecker(() => { throw new Error('no worker'); }, () => {});
  assert.equal(await c.check('A'), null);
  assert.deepEqual(c.state, { kind: 'failed', text: 'A', message: 'no worker' });
});

/* ---------- the lines ---------- */
const level = (rows: readonly string[], header = '') => parse(`title: t\nintro: i\n${header}\n${rows.join('\n')}\n`);
const L9 = parse(TRIALS[8]!.text);
const done = (d: Difficulty): CheckState => ({ kind: 'done', text: 'T', d });

test('a winnable chase level reads out its numbers and is shareable', () => {
  const d = measure(L9);
  const r = checkLines(done(d), 'T', L9);
  assert.deepEqual(r.lines.slice(0, 3), [
    'Winnable: quickest win 54 moves',
    `Situations searched: ${d.explored.toLocaleString('en-US')}`,
    `Chase: the Minotaur adds ${d.minotaurDelta} moves; ignoring him ${d.greedyWins ? 'wins' : 'loses'}`,
  ]);
  assert.equal(r.lines[0], 'Winnable: quickest win 54 moves');
});

test('the lines of a hand-made chase answer are exact, down to the thousands separator', () => {
  const r = checkLines(done(DIFF), 'T', L9);
  assert.deepEqual(r.lines.slice(0, 3), [
    'Winnable: quickest win 54 moves',
    'Situations searched: 24,086',
    'Chase: the Minotaur adds 22 moves; ignoring him loses',
  ]);
  assert.equal(r.stale, false);
  const wins = checkLines(done({ ...DIFF, greedyWins: true }), 'T', L9);
  assert.equal(wins.lines[2], 'Chase: the Minotaur adds 22 moves; ignoring him wins');
});

test('a level that clears the shared bar ends with Shareable', () => {
  const d: Difficulty = { ...DIFF, shortest: 60, explored: 900000 };
  assert.deepEqual(sharedProblems(d), []);
  const r = checkLines(done(d), 'T', L9);
  assert.equal(r.lines.at(-1), 'Shareable');
  assert.equal(r.shareable, true);
});

test('a solo level says no Minotaur can reach you, or that there is none', () => {
  const solo: Difficulty = { ...DIFF, label: 'solo', withoutMinotaur: 54, minotaurDelta: 0, greedyWins: true };
  assert.equal(checkLines(done(solo), 'T', L9).lines[2], 'Solo: no Minotaur can reach you');
  const none = level(['#####', '#P.E#', '#####']);
  assert.equal(checkLines(done({ ...solo, withoutMinotaur: null }), 'T', none).lines[2], 'Solo: no Minotaur');
});

test('an unknown chase label says the search hit its cap', () => {
  const r = checkLines(done({ ...DIFF, label: 'unknown' }), 'T', L9);
  assert.equal(r.lines[2], 'Chase or solo: not known (the search hit its cap)');
});

test('an unwinnable level cannot be won', () => {
  const r = checkLines(done({ ...DIFF, solved: false, shortest: 'none', line: '' }), 'T', L9);
  assert.deepEqual(r.lines, ['This level cannot be won.']);
  assert.equal(r.shareable, false);
});

test('a capped search names what makes the level hard, and blocks lead only when they do', () => {
  const capped: Difficulty = { ...DIFF, solved: false, shortest: 'unknown', line: '' };
  const withBlocks = level(['#########', '#P.OOO.E#', '#rrRRCw.#', '#.......#', '#########'], 'machines: block-down\nfacing: right');
  assert.deepEqual(hardPieces(withBlocks).slice(0, 3), ['4 blocks', '2 keys and 2 doors', '1 hazard']);
  assert.deepEqual(checkLines(done(capped), 'T', withBlocks).lines, [
    'The solver could not finish. What makes it hard here: 4 blocks, 2 keys and 2 doors, 1 hazard. Fewer blocks help most.',
  ]);
  const keys = level(['#####', '#PRR#', '#..E#', '#####']);
  assert.deepEqual(checkLines(done(capped), 'T', keys).lines, ['The solver could not finish. What makes it hard here: 2 doors.']);
  const bare = level(['#####', '#P.E#', '#####']);
  assert.deepEqual(checkLines(done(capped), 'T', bare).lines, ['The solver could not finish.']);
});

test('a winnable but easy level lists what keeps it from being shared', () => {
  const easy: Difficulty = { ...DIFF, shortest: 5, explored: 20, naiveWins: true, label: 'solo', minotaurDelta: 0, greedyWins: true };
  const r = checkLines(done(easy), 'T', L9);
  const at = r.lines.indexOf('Not shareable yet:');
  assert.ok(at > 0);
  assert.deepEqual(r.lines.slice(at + 1), sharedProblems(easy));
  assert.ok(sharedProblems(easy).length >= 2);
  assert.equal(r.shareable, false);
});

test('a result of other text is stale; nothing running or checked has no lines', () => {
  assert.equal(checkLines(done(DIFF), 'other', L9).stale, true);
  assert.deepEqual(checkLines({ kind: 'none' }, 'x', L9), { lines: [], stale: false, shareable: false });
});

test('checking a stopped search again resumes it', async () => {
  const f = fakes();
  const c = createChecker(f.start, f.onChange);
  const p = c.check('A');
  c.stop();
  const again = c.check('A');
  assert.equal(f.jobs.length, 1);
  assert.deepEqual(f.jobs[0]!.calls, ['stop', 'resume']);
  assert.equal((c.state as { stopped: boolean }).stopped, false);
  f.jobs[0]!.answer(DIFF);
  assert.equal(await p, DIFF);
  assert.equal(await again, DIFF);
});

test('the one-line summary', () => {
  assert.equal(checkSummary({ kind: 'none' }, 'T'), '');
  assert.equal(checkSummary({ kind: 'running', text: 'T', report: null, stopped: false }, 'T'), '');
  const shareable: Difficulty = { ...DIFF, shortest: 60, explored: 900000 };
  assert.equal(checkSummary(done(shareable), 'T'), 'Winnable in 60 · Shareable');
  assert.equal(checkSummary(done({ ...DIFF, shortest: 5, explored: 20, naiveWins: true }), 'T'), 'Winnable in 5 · Not shareable yet');
  assert.equal(checkSummary(done({ ...DIFF, solved: false, shortest: 'none', line: '' }), 'T'), 'Cannot be won');
  assert.equal(checkSummary(done({ ...DIFF, solved: false, shortest: 'unknown', line: '' }), 'T'), 'The solver could not finish');
  assert.equal(checkSummary(done(DIFF), 'other'), 'Out of date: press Check.');
  assert.equal(checkSummary({ kind: 'failed', text: 'T', message: 'boom' }, 'T'), 'The solver stopped: boom');
});
