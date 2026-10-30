// A session nobody has played in: no level has opened, so the game holds no run. This lives in its own file so
// that no other test can have opened a level first; node runs each test file in its own process.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byId, click, document, fireDocument, installDocument } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import { manualClock } from '../../_kit/test/clock.ts';
import { createGame } from '../src/game.ts';
import type { Game } from '../src/game.ts';
import { createFoundPages } from '../src/pages.ts';
import { CAMPAIGN_LEVELS } from '../src/campaign/chapters.ts';
import type { Progress } from '../src/progress.ts';
import type { Atlas } from '../src/board-plan.ts';
import type { Board } from '../src/board.ts';

installDocument();
const ui = await importTsx<{ page: typeof import('../src/ui.ts') }>(import.meta.dirname, { page: '../src/ui.ts' });
(globalThis as { getComputedStyle?: unknown }).getComputedStyle = () => ({ paddingLeft: '0', paddingRight: '0', paddingTop: '0', paddingBottom: '0', display: 'block' });

const progress: Progress = { get: () => ({ cleared: false, assisted: false, best: null }), record: () => ({ cleared: true, assisted: false, best: 20 }) };
const m = manualClock();
const found = createFoundPages(null);
const flow = ui.page.createUi({ atlas: { cell: 16, rise: 8, sprites: {} } as Atlas, board: { size() {}, paint() {} } as Board, progress, pages: found, sfx() {} });
const game: Game = createGame({
  sfx() {}, say() {}, progress, pages: found, levels: CAMPAIGN_LEVELS, timers: m.timers, clock: m.clock,
  reducedMotion: () => true, changed: () => flow.render(game),
});
flow.bindControls({ game, toggleMute() {}, toggleFullscreen() {}, wake() {}, quit() {}, play: () => flow.showChapter(1, false) });
const key = (k: string) => fireDocument('keydown', { key: k, target: { tagName: 'DIV' } });

test('Q on the chapter card reached by picking level 1 in a fresh session shows the title, never a blank screen', () => {
  assert.equal(game.run, null);
  flow.showTitle(false);
  key('n'); // the title's Play is worded N: it opens the new-game card, and Enter there the chapter card
  assert.equal(flow.top(), 'look');
  key('Enter');
  assert.equal(flow.top(), 'chapter');
  key('n');
  assert.equal(flow.top(), 'levels');
  click(byId(document.getElementById('levels-root'), 'level-1'));
  assert.equal(flow.top(), 'chapter');
  key('q');
  assert.equal(flow.top(), 'title');
  assert.equal(game.run, null);
});
