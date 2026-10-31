// Hearts between levels, on the real page and game in the DOM stub: honey cakes take a try past its starting hearts,
// nothing carries to the next level or survives a Restart, and going on from inside the game (the end card's Next,
// or a chapter's closing card going on) shows the hearts line once the new level's cards have closed; a new game or a
// level picked from the list does not. The lines vary and never repeat back to back.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importTsx } from '../../_kit/test/tsx.ts';
import { byId, click, document, fireDocument, installDocument, maybeById } from '../../_kit/test/dom-stub.ts';
import { manualClock } from '../../_kit/test/clock.ts';
import { createGame } from '../src/game.ts';
import type { Game } from '../src/game.ts';
import { createFoundPages } from '../src/pages.ts';
import { createMet, ALL_MET, MET_KEY } from '../src/met.ts';
import { parse } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';
import { CAMPAIGN_LEVELS } from '../src/campaign/chapters.ts';
import type { Levels } from '../src/campaign/chapters.ts';
import type { Atlas } from '../src/board-plan.ts';
import type { Board } from '../src/board.ts';
import type { Progress } from '../src/progress.ts';
import { BANNER_MS } from '../src/notices.ts';
import { HEARTS_LINES, nextLine } from '../src/hearts-lines.ts';
import type { StorageLike } from '../../_kit/ports.ts';

installDocument();
const ui = await importTsx<{ page: typeof import('../src/ui.ts') }>(import.meta.dirname, { page: '../src/ui.ts' });
(globalThis as { getComputedStyle?: unknown }).getComputedStyle = () => ({ paddingLeft: '0', paddingRight: '0', paddingTop: '0', paddingBottom: '0', display: 'block' });

const data: Record<string, string> = { [MET_KEY]: JSON.stringify([ALL_MET]) };
const storage: StorageLike = { getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, removeItem: k => { delete data[k]; } };
const progress: Progress = { get: () => ({ cleared: false, assisted: false, best: null }), record: () => ({ cleared: true, assisted: false, best: 1 }) };
const m = manualClock();
/** Two cakes on the way to the exit: won with 5 hearts in 3 moves. */
const CAKES: Level = parse('title: Cakes\n\n#######\n#Pxx.E#\n#######\n');
let ownAt = -1;
const levels: Levels = {
  count: CAMPAIGN_LEVELS.count, id: CAMPAIGN_LEVELS.id,
  level: i => (i === ownAt ? CAKES : CAMPAIGN_LEVELS.level(i)),
};
/** The randomness the hearts line is picked with: the values it hands out, in turn. */
let draws: number[] = [];
const flow = ui.page.createUi({
  atlas: { cell: 16, rise: 8, sprites: {} } as Atlas, board: { size() {}, paint() {} } as Board, progress, pages: createFoundPages(null), levels,
  met: createMet(storage), rng: () => draws.shift() ?? 0,
  timers: { setTimeout: (fn, ms) => m.timers.setTimeout(fn, ms), clearTimeout: id => m.timers.clearTimeout(id) },
});
const game: Game = createGame({
  sfx() {}, say() {}, progress, pages: createFoundPages(null), timers: m.timers, clock: m.clock, levels,
  reducedMotion: () => true, changed: () => flow.render(game), isFirst: id => flow.isFirst(id),
});
flow.bindControls({ game, toggleMute() {}, toggleFullscreen() {}, wake() {}, quit() {}, play: () => flow.showChapter(1, false) });

const key = (k: string) => fireDocument('keydown', { key: k, target: { tagName: 'DIV' } });
const hearts = () => byId(document.getElementById('status-root'), 'hud-hearts').textContent;
const line = () => maybeById(document.getElementById('banner-root'), 'banner-hearts')?.textContent.replace(/^♥/, '') ?? null;
const right = () => game.press({ kind: 'move', dir: 'right' });

/** Opens the cakes' level at campaign index `at`, eats both cakes and wins with 5 hearts; the end card is up. */
function winWithFive(at: number): void {
  flow.closeLayers();
  m.advance(BANNER_MS);
  ownAt = at;
  game.open(at);
  key('Enter');
  right();
  right();
  game.press({ kind: 'tool', tool: 'cake' });
  game.press({ kind: 'tool', tool: 'cake' });
  assert.equal(hearts(), '♥ 5', 'two cakes: 3 to 4 to 5');
  right();
  right();
  assert.equal(game.run!.now.outcome, 'won');
  assert.ok(flow.top() === 'end' || flow.top() === 'chapter', 'the end card, or a closing card over it');
}

test('Next from the end card: the next level starts at three hearts, and the hearts line waits for its start card', () => {
  draws = [0.35];
  winWithFive(0);
  key('Enter');
  assert.equal(game.trial, 1);
  assert.equal(hearts(), '♥ 3', 'nothing carries over');
  assert.equal(flow.top(), 'start');
  assert.equal(line(), null, 'not while the start card is open');
  key('Enter');
  assert.equal(flow.top(), null);
  assert.equal(line(), HEARTS_LINES[3], 'after Begin, the line drawn');
  assert.match(line()!, /three hearts/i);
  m.advance(BANNER_MS);
  assert.equal(line(), null, 'and it fades on its own');
});

test('a chapter\'s closing card going on: the hearts line shows once the next chapter\'s card and the start card close', () => {
  draws = [0];
  winWithFive(9);
  assert.equal(flow.top(), 'chapter', 'Chapter 1\'s closing card');
  key('Enter');
  assert.equal(flow.top(), 'chapter', 'Chapter 2\'s opening card');
  assert.equal(line(), null);
  key('Enter');
  assert.equal(flow.top(), 'start');
  assert.equal(hearts(), '♥ 3');
  assert.equal(line(), null);
  key('Enter');
  assert.ok(line(), 'the line, with the board in view');
});

test('Restart, Retry, a level from the list and a new game start at three hearts with no hearts line', () => {
  winWithFive(0);
  key('r');
  assert.equal(game.run!.now.hearts, 3, 'Retry');
  key('Enter');
  assert.equal(line(), null);
  right();
  right();
  game.press({ kind: 'tool', tool: 'cake' });
  assert.equal(hearts(), '♥ 4');
  game.press('restart');
  assert.equal(hearts(), '♥ 3', 'Restart');
  assert.equal(line(), null);
  flow.closeLayers();
  flow.showLevels();
  click(byId(document.getElementById('levels-root'), 'level-3'));
  key('Enter');
  assert.equal(game.trial, 2);
  assert.equal(line(), null, 'a level from the list');
  flow.showChapter(1, false);
  key('Enter');
  key('Enter');
  assert.equal(game.trial, 0);
  assert.equal(line(), null, 'a new game');
});

test('the hearts line varies, never twice in a row, and every line says the hearts are three', () => {
  assert.ok(HEARTS_LINES.length >= 8 && HEARTS_LINES.length <= 12);
  for (const l of HEARTS_LINES) assert.match(l, /three hearts/i, l);
  assert.equal(nextLine(() => 0.35, -1), 3);
  assert.equal(nextLine(() => 0.35, 3), 4, 'the last one steps aside');
  assert.equal(nextLine(() => 0.99, HEARTS_LINES.length - 1), 0, 'round to the first');
  let last = -1;
  for (const r of [0, 0, 0.5, 0.5, 0.99, 0.99]) {
    const i = nextLine(() => r, last);
    assert.notEqual(i, last);
    last = i;
  }
});
