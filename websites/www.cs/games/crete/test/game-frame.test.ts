// What the board draws while a turn animates: the state before the turn and the figures between cells, then the state after it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame, frameOf } from '../src/game.ts';
import { createFoundPages } from '../src/pages.ts';
import { CAMPAIGN_LEVELS } from '../src/campaign/chapters.ts';
import { createProgress } from '../src/progress.ts';
import { manualClock } from '../../_kit/test/clock.ts';
import { DELTA } from '../src/puzzle/tiles.ts';
import { SLIDE_MS, timeline } from '../src/board-plan.ts';
import { step } from '../src/puzzle/step.ts';
import { grid, mv } from './puzzle-grid.ts';

function opened(reduced = false) {
  const m = manualClock();
  const game = createGame({
    sfx() {}, say() {}, progress: createProgress(null), pages: createFoundPages(null), levels: CAMPAIGN_LEVELS, timers: m.timers, clock: m.clock, reducedMotion: () => reduced, changed() {},
  });
  game.open(0);
  return game;
}

test('nothing is drawn before a trial opens', () => {
  const m = manualClock();
  const game = createGame({ sfx() {}, say() {}, progress: createProgress(null), pages: createFoundPages(null), levels: CAMPAIGN_LEVELS, timers: m.timers, clock: m.clock, reducedMotion: () => false, changed() {} });
  assert.equal(frameOf(game, 0), null);
});

test('with no turn animating, the state now and the figures at rest', () => {
  const game = opened();
  const f = frameOf(game, 0)!;
  assert.equal(f.state, game.run!.now);
  assert.deepEqual(f.figures, { player: game.run!.now.player, minotaur: game.run!.now.minotaur });
  assert.equal(f.done, true);
});

test('while a turn animates the state before it is drawn, with the figures between cells; after it, the state after', () => {
  const game = opened();
  const start = game.run!.now;
  const dir = (['up', 'down', 'left', 'right'] as const).find(d => {
    const p = start.player;
    const [dr, dc] = DELTA[d];
    return start.terrain[(p.r + dr) * start.level.cols + p.c + dc] !== 'wall';
  })!;
  game.press({ kind: 'move', dir });
  assert.ok(game.anim);
  const mid = frameOf(game, SLIDE_MS / 2)!;
  assert.equal(mid.state, start);
  assert.equal(mid.done, false);
  assert.notDeepEqual(mid.figures.player, start.player);
  assert.notDeepEqual(mid.figures.player, game.run!.now.player);
  const end = frameOf(game, game.anim!.timeline.duration)!;
  assert.equal(end.state, game.run!.now);
  assert.equal(end.done, true);
});

test('reduced motion plays no animation', () => {
  const game = opened(true);
  game.press({ kind: 'wait' });
  assert.equal(game.anim, null);
});

test('the state after is drawn the moment the player\'s segments end, while the Minotaur still walks', () => {
  const before = grid(['P....', '.....', '....M']);
  const r = step(before, mv('right'));
  const tl = timeline(before, r.events, false, r.state);
  const g = { run: { now: r.state }, anim: { timeline: tl, started: 0, before } } as unknown as Parameters<typeof frameOf>[0];
  const during = frameOf(g, SLIDE_MS / 2)!;
  assert.equal(during.state, before);
  const walking = frameOf(g, SLIDE_MS * 1.5)!;
  assert.equal(walking.state, r.state);
  assert.equal(walking.done, false);
  assert.deepEqual(walking.figures.player, r.state.player);
  assert.notDeepEqual(walking.figures.minotaur, r.state.minotaur);
});

test('mid-push the block is between cells and the player is not drawn on a block at its old cell', () => {
  const before = grid(['PO...', '.....', '....M']);
  const r = step(before, mv('right'));
  const tl = timeline(before, r.events, false, r.state);
  const g = { run: { now: r.state }, anim: { timeline: tl, started: 0, before } } as unknown as Parameters<typeof frameOf>[0];
  const f = frameOf(g, SLIDE_MS / 2)!;
  assert.equal(f.state, before);
  assert.deepEqual(f.figures.blocks?.[0]?.at, { r: 0, c: 1.5 });
});
