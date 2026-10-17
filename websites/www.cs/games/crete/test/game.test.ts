// The controller: a press during a slide finishes it and acts once; the thread marks the try assisted;
// a win records progress; undo and restart go through; sounds follow the events.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/game.ts';
import { createProgress } from '../src/progress.ts';
import { manualClock } from '../../_kit/test/clock.ts';
import { solve } from '../src/puzzle/solver.ts';
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
  h.game.route();
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
