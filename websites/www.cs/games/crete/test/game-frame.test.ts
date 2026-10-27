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
import { act, step } from '../src/puzzle/step.ts';
import { grid, icedPages, mv } from './puzzle-grid.ts';

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
  assert.deepEqual(f.figures, { player: game.run!.now.player, minotaur: game.run!.now.minotaur, hazards: [] });
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

/* One slide right over two story pages on ice: a at column 2, b at column 4; it stops at column 5, by the exit. */
function sliding(reduced = false) {
  const m = manualClock();
  const changes: (string | null)[] = [];
  const level = icedPages(['P=p=p.E'], 'a b');
  const game = createGame({
    sfx() {}, say() {}, progress: createProgress(null), pages: createFoundPages(null), timers: m.timers, clock: m.clock,
    reducedMotion: () => reduced, changed: () => changes.push(game.anim?.paused?.id ?? null),
    levels: { count: 1, id: () => 'iced', level: () => level },
  });
  game.open(0);
  return { game, m, changes };
}

test('the animation pauses where the figure reaches each page, holds that frame while the clock runs, and goes on from it', () => {
  const { game, m, changes } = sliding();
  const pausedAt = (): string | null => game.anim?.paused?.id ?? null;
  game.press({ kind: 'move', dir: 'right' });
  assert.deepEqual(game.anim!.stops, [{ id: 'a', ms: 2 * SLIDE_MS }, { id: 'b', ms: 4 * SLIDE_MS }]);
  m.advance(SLIDE_MS);
  assert.equal(game.animMs(), SLIDE_MS);
  assert.equal(pausedAt(), null, 'it plays');
  m.advance(SLIDE_MS * 1.5);
  changes.length = 0;
  assert.equal(game.animMs(), 2 * SLIDE_MS, 'it stops at the page, not past it');
  assert.equal(pausedAt(), 'a');
  assert.deepEqual(changes, ['a'], 'the page is told once');
  m.advance(5000);
  assert.equal(game.animMs(), 2 * SLIDE_MS, 'the frame holds while the page is read');
  const held = frameOf(game, game.animMs())!;
  assert.equal(held.done, false);
  assert.deepEqual(held.figures.player, { r: 0, c: 2 });
  assert.equal(held.state.objects[2], null, 'the page taken is gone');
  assert.equal(held.state.objects[4], 'page', 'the page ahead is still there');
  game.resume();
  assert.equal(game.animMs(), 2 * SLIDE_MS, 'no jump on resuming');
  m.advance(SLIDE_MS / 2);
  assert.equal(game.animMs(), 2.5 * SLIDE_MS);
  assert.equal(pausedAt(), null, 'it plays');
  m.advance(5000);
  assert.equal(game.animMs(), 4 * SLIDE_MS);
  assert.equal(pausedAt(), 'b');
  assert.equal(frameOf(game, game.animMs())!.state.objects[4], null);
  game.resume();
  m.advance(5000);
  const end = frameOf(game, game.animMs())!;
  assert.equal(end.done, true);
  assert.equal(end.state, game.run!.now);
});

test('just after a page taken mid-slide the board no longer draws it, and before it still does', () => {
  const { game } = sliding();
  game.press({ kind: 'move', dir: 'right' });
  assert.equal(frameOf(game, 2 * SLIDE_MS - 1)!.state.objects[2], 'page');
  assert.equal(frameOf(game, 2 * SLIDE_MS + 1)!.state.objects[2], null);
  assert.equal(frameOf(game, 2 * SLIDE_MS + 1)!.state.objects[4], 'page');
});

test('with reduced motion a slide over pages plays no animation and never pauses', () => {
  const { game } = sliding(true);
  game.press({ kind: 'move', dir: 'right' });
  assert.equal(game.anim, null);
  assert.equal(game.animMs(), 0);
  game.resume();
  assert.deepEqual(game.run!.now.player, { r: 0, c: 5 });
});

test('a play-out waits while its turn has a page to reach or is paused at one, and goes on once it ends', () => {
  const { game, m } = sliding();
  game.auto();
  m.advance(SLIDE_MS * 3);
  assert.equal(game.run!.now.moves, 1, 'the play-out slides over the pages');
  m.advance(SLIDE_MS * 30);
  assert.equal(game.run!.now.moves, 1, 'it waits for the figure to reach the pages');
  assert.equal(game.animMs(), 2 * SLIDE_MS);
  game.resume();
  m.advance(SLIDE_MS * 30);
  assert.equal(game.animMs(), 4 * SLIDE_MS);
  assert.equal(game.run!.now.moves, 1, 'and while it is paused at one');
  game.resume();
  game.finishAnim();
  m.advance(SLIDE_MS * 3);
  assert.equal(game.run!.now.outcome, 'won');
});

test('while the hazards move, the board draws the state once the player has acted, not the turn\'s end', () => {
  const before = grid(['P.o!..', '......', '.....M'], 'facing: right');
  const r = step(before, mv('down'));
  const mid = act(before, mv('down')).state;
  const tl = timeline(before, r.events, false, r.state);
  const g = { run: { now: r.state }, anim: { timeline: tl, started: 0, before, mid } } as unknown as Parameters<typeof frameOf>[0];
  const bomb = 3;
  assert.equal(frameOf(g, tl.playerEnd - 1)!.state, before);
  const moving = frameOf(g, tl.playerEnd + SLIDE_MS / 2)!.state;
  assert.equal(moving, mid);
  assert.equal(moving.terrain[bomb], 'bomb', 'the bomb waits for the ball');
  assert.deepEqual(moving.player, { r: 1, c: 0 });
  assert.equal(frameOf(g, tl.hazardEnd)!.state, r.state);
  assert.equal(r.state.terrain[bomb], 'floor');
});
