// The controller: a press during a slide finishes it and acts once; the thread marks the try assisted;
// a win records progress; undo and restart go through; sounds follow the events.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/game.ts';
import { createProgress } from '../src/progress.ts';
import { manualClock } from '../../_kit/test/clock.ts';
import { solve, stateKey } from '../src/puzzle/solver.ts';
import { step } from '../src/puzzle/step.ts';
import type { State } from '../src/puzzle/state.ts';
import { initial } from '../src/puzzle/state.ts';
import { trialLevel, TRIALS } from '../src/puzzle/trials.ts';
import { DELTA } from '../src/puzzle/tiles.ts';
import type { Action } from '../src/puzzle/step.ts';

function harness() {
  const sounds: string[] = [];
  const m = manualClock();
  const progress = createProgress(null);
  const game = createGame({
    sfx: n => sounds.push(n), say() {}, progress, timers: m.timers, clock: m.clock, reducedMotion: () => false, changed() {},
  });
  return { game, sounds, progress, advance: m.advance };
}
function line(i: number): Action[] {
  const r = solve(initial(trialLevel(i)));
  assert.ok(r.solved);
  return r.line;
}

test('a press during a slide finishes it and acts exactly once', () => {
  const h = harness();
  h.game.open(0);
  const [a, b] = line(0);
  h.game.press(a!);
  assert.ok(h.game.anim, 'the first move is animating');
  h.game.press(b!);
  assert.equal(h.game.run!.now.moves, 2);
  assert.equal(h.game.run!.past.length, 2);
});

test('the hint plays one step and marks the try assisted; a played-out win records it as assisted', () => {
  const h = harness();
  h.game.open(0);
  h.game.hint();
  assert.equal(h.game.run!.now.moves, 1);
  assert.equal(h.game.run!.assisted, true);
  h.game.auto();
  h.advance(600_000);
  assert.equal(h.game.run!.now.outcome, 'won');
  assert.equal(h.game.playing, false);
  assert.deepEqual(h.progress.get(TRIALS[0]!.id), { cleared: true, assisted: true, best: null });
});

test('an unassisted win records the best; opening the trial again clears the assisted mark', () => {
  const h = harness();
  h.game.open(0);
  for (const a of line(0)) h.game.press(a);
  assert.equal(h.game.run!.now.outcome, 'won');
  assert.equal(h.progress.get(TRIALS[0]!.id).best, h.game.run!.now.moves);
  h.game.open(0);
  h.game.hint();
  assert.equal(h.game.run!.assisted, true);
  h.game.open(0);
  assert.equal(h.game.run!.assisted, false);
});

test('a bump sounds bump and changes nothing; undo and restart go through', () => {
  const h = harness();
  h.game.open(0);
  const start = h.game.run!;
  const walls = (['up', 'down', 'left', 'right'] as const).filter(dir => {
    const p = start.now.player;
    const [dr, dc] = DELTA[dir];
    return start.now.terrain[(p.r + dr) * start.now.level.cols + p.c + dc] === 'wall';
  });
  assert.ok(walls.length > 0, 'trial 1 starts beside a wall');
  h.game.press({ kind: 'move', dir: walls[0]! });
  assert.equal(h.game.run, start);
  assert.deepEqual(h.sounds, ['bump']);
  h.game.press(line(0)[0]!);
  h.game.press('undo');
  assert.equal(h.game.run!.now, start.now);
  h.game.press(line(0)[0]!);
  h.game.press('restart');
  assert.equal(h.game.run!.now.moves, 0);
});

test('V keeps drawing the line through a turn, undo and restart, from the new state', () => {
  const h = harness();
  h.game.open(0);
  h.game.route();
  assert.ok(h.game.thread && h.game.thread.length > 1);
  h.game.press(line(0)[0]!);
  const p = h.game.run!.now.player;
  assert.ok(h.game.thread, 'still drawn after a move');
  assert.deepEqual(h.game.thread![0], p);
  h.game.press('undo');
  assert.deepEqual(h.game.thread![0], h.game.run!.now.player);
  h.game.press(line(0)[0]!);
  h.game.press('restart');
  assert.deepEqual(h.game.thread![0], h.game.run!.now.player);
});

/** A shortest line of the first trial that loses the try, found by breadth-first search. */
function losingLine(): Action[] {
  const dirs = ['up', 'down', 'left', 'right'] as const;
  const moves: Action[] = [{ kind: 'wait' }, ...dirs.map((dir): Action => ({ kind: 'move', dir }))];
  let frontier: { s: State; line: Action[] }[] = [{ s: initial(trialLevel(0)), line: [] }];
  const seen = new Set<string>();
  for (let depth = 0; depth < 40; depth++) {
    const next: typeof frontier = [];
    for (const f of frontier) {
      for (const a of moves) {
        const r = step(f.s, a);
        if (r.state === f.s) continue;
        if (r.state.outcome === 'lost') return [...f.line, a];
        const k = stateKey(r.state);
        if (seen.has(k)) continue;
        seen.add(k);
        next.push({ s: r.state, line: [...f.line, a] });
      }
    }
    frontier = next;
  }
  throw new Error('no losing line');
}

test('V turns off when a turn ends the try', () => {
  const m = manualClock();
  const game = createGame({
    sfx() {}, say() {}, progress: createProgress(null), timers: m.timers, clock: m.clock, reducedMotion: () => false, changed() {},
  });
  game.open(0);
  game.route();
  assert.ok(game.thread);
  for (const act of losingLine()) game.press(act);
  assert.equal(game.run!.now.outcome, 'lost');
  assert.equal(game.thread, null);
  game.press('undo');
  assert.equal(game.thread, null, 'V stays off after it turned off');
});

test('a goes-slack press neither assists nor draws; a finished try ignores Hint, Route and Auto', () => {
  const h = harness();
  h.game.open(0);
  for (const a of line(0)) h.game.press(a);
  assert.equal(h.game.run!.now.outcome, 'won');
  const run = h.game.run;
  h.game.hint();
  h.game.route();
  h.game.auto();
  assert.equal(h.game.run, run);
  assert.equal(h.game.thread, null);
  assert.equal(h.game.playing, false);
  assert.equal(run!.assisted, false);
});
