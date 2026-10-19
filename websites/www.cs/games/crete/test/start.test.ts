// A trial's start card, on the real game: opening a trial shows it; Begin, a move key or Q closes it; the
// first move key also moves; restart does not show it again; the status bar and the strip are not blocked.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { importTsx } from '../../_kit/test/tsx.ts';
import { fireDocument, installDocument } from '../../_kit/test/dom-stub.ts';
import { manualClock } from '../../_kit/test/clock.ts';
import { createGame } from '../src/game.ts';
import type { Game } from '../src/game.ts';
import { createFoundPages } from '../src/pages.ts';
import { CAMPAIGN_LEVELS } from '../src/campaign/chapters.ts';
import { createProgress } from '../src/progress.ts';
import { solve } from '../src/puzzle/solver.ts';
import { initial } from '../src/puzzle/state.ts';
import { trialLevel } from '../src/puzzle/trials.ts';
import type { Atlas } from '../src/board-plan.ts';
import type { Board } from '../src/board.ts';

installDocument();
(globalThis as { getComputedStyle?: unknown }).getComputedStyle = () => ({ paddingLeft: '0', paddingRight: '0', paddingTop: '0', paddingBottom: '0', display: 'block' });
const { ui } = await importTsx<{ ui: typeof import('../src/ui.ts') }>(import.meta.dirname, { ui: '../src/ui.ts' });

const m = manualClock();
const said: string[] = [];
let game: Game;
const page = ui.createUi({
  atlas: { cell: 16, rise: 8, sprites: {} } as Atlas,
  board: { size() {}, paint() {} } as Board,
  progress: createProgress(null),
  pages: createFoundPages(null),
});
game = createGame({
  sfx() {}, say: t => said.push(t), progress: createProgress(null), pages: createFoundPages(null), levels: CAMPAIGN_LEVELS, timers: m.timers, clock: m.clock, reducedMotion: () => true,
  changed: () => page.render(game),
});
page.bindControls({ game, toggleMute() {}, toggleFullscreen() {}, wake() {}, quit() {}, play() {} });

const press = (key: string) => fireDocument('keydown', { key, target: { tagName: 'DIV' } });
const firstMove = (): string => {
  const r = solve(initial(trialLevel(0)));
  assert.ok(r.solved);
  const a = r.line.find(x => x.kind === 'move');
  assert.ok(a && a.kind === 'move');
  return { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }[a.dir];
};

beforeEach(() => { page.closeLayers(); said.length = 0; game.open(0); });

test('opening a trial shows the start card, and says nothing in the toast', () => {
  assert.equal(page.top(), 'start');
  assert.deepEqual(said, []);
});

test('Begin (Enter or Space) closes it without a move', () => {
  const ev = press('Enter');
  assert.equal(page.top(), null);
  assert.equal(ev.prevented, true);
  assert.equal(game.run!.now.moves, 0);
  game.open(0);
  press(' ');
  assert.equal(page.top(), null);
  assert.equal(game.run!.now.moves, 0);
});

test('the first move key closes it and moves exactly once', () => {
  press(firstMove());
  assert.equal(page.top(), null);
  assert.equal(game.run!.now.moves, 1);
  assert.equal(game.run!.past.length, 1);
});

test('Q closes it and does not open the menu on that press', () => {
  press('q');
  assert.equal(page.top(), null);
  press('q');
  assert.equal(page.top(), 'menu');
});

test('restart does not show it again; opening the same trial again does', () => {
  press('Enter');
  press('r');
  assert.equal(page.top(), null);
  game.open(0);
  assert.equal(page.top(), 'start');
});

test('the strip and keys stay usable under it: undo and hint act without closing it', () => {
  press('h');
  assert.equal(game.run!.now.moves, 1);
  assert.equal(page.top(), 'start');
  press('u');
  assert.equal(game.run!.now.moves, 0);
  assert.equal(page.top(), 'start');
});
