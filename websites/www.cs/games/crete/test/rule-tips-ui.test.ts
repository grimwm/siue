// The rule tips on the real page and game in the DOM stub, on Chapter 1, Level 1 for a new player: how the Minotaur
// moves once the start card has gone, what he just did after the first move, Wait and Undo, then the exit. Each holds
// play until Got It, Enter or Space puts it away, none shows under a card, and a try from the editor shows none.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importTsx } from '../../_kit/test/tsx.ts';
import { byId, click, document, fireDocument, installDocument, maybeById } from '../../_kit/test/dom-stub.ts';
import { manualClock } from '../../_kit/test/clock.ts';
import { createGame } from '../src/game.ts';
import type { Game } from '../src/game.ts';
import { createFoundPages } from '../src/pages.ts';
import { createMet } from '../src/met.ts';
import { CAMPAIGN_LEVELS } from '../src/campaign/chapters.ts';
import type { Levels } from '../src/campaign/chapters.ts';
import type { Atlas } from '../src/board-plan.ts';
import type { SheetBoard } from '../src/sheet-board.ts';
import type { Progress } from '../src/progress.ts';
import { tipText } from '../src/rule-tips.ts';
import type { StorageLike } from '../../_kit/ports.ts';

installDocument();
const ui = await importTsx<{ page: typeof import('../src/ui.ts') }>(import.meta.dirname, { page: '../src/ui.ts' });
(globalThis as { getComputedStyle?: unknown }).getComputedStyle = () => ({ paddingLeft: '0', paddingRight: '0', paddingTop: '0', paddingBottom: '0', display: 'block' });

const data: Record<string, string> = {};
const storage: StorageLike = { getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, removeItem: k => { delete data[k]; } };
const progress: Progress = { get: () => ({ cleared: false, assisted: false, best: null }), record: () => ({ cleared: true, assisted: false, best: 1 }) };
const m = manualClock();
let tryAt = -1;
const levels: Levels = {
  count: CAMPAIGN_LEVELS.count, id: CAMPAIGN_LEVELS.id, level: i => CAMPAIGN_LEVELS.level(i),
  outside: i => (i === tryAt ? { kind: 'try', name: 'Mine', best: null } : null),
};
const flow = ui.page.createUi({
  atlas: { cell: 16, rise: 8, sprites: {} } as Atlas, board: { size() {}, frame() {}, paint() {} } as SheetBoard, progress, pages: createFoundPages(null), levels,
  met: createMet(storage),
  timers: { setTimeout: (fn, ms) => m.timers.setTimeout(fn, ms), clearTimeout: id => m.timers.clearTimeout(id) },
});
const game: Game = createGame({
  sfx() {}, say() {}, progress, pages: createFoundPages(null), timers: m.timers, clock: m.clock, levels,
  reducedMotion: () => true, changed: () => flow.render(game), isFirst: id => flow.isFirst(id),
});
flow.bindControls({ game, toggleMute() {}, toggleFullscreen() {}, wake() {}, quit() {}, play: () => flow.showChapter(1, false) });

const key = (k: string) => fireDocument('keydown', { key: k, target: { tagName: 'DIV' } });
const banner = () => document.getElementById('banner-root');
const tip = () => maybeById(banner(), 'tip-text')?.textContent ?? null;
const moves = () => game.run!.now.moves;

const WALLS = 'He went right, then a wall stopped him. He never steps away from you, so a wall in his way can trap him.';

test('Chapter 1, Level 1 teaches the rules a tip at a time, and each holds play until it is put away', () => {
  game.open(0);
  assert.equal(flow.top(), 'start');
  m.advance(1);
  assert.equal(tip(), null, 'nothing over the start card');
  key('Enter');
  m.advance(1);
  assert.equal(tip(), tipText('tip-beast'), 'once the board is in view: how the Minotaur moves');
  assert.equal(maybeById(banner(), 'tip-ok')?.textContent, 'Got It');
  assert.equal(document.activeElement?.id, 'tip-ok', 'the keyboard lands on Got It');
  key('q');
  assert.equal(flow.top(), 'menu', 'the menu still opens');
  assert.equal(tip(), null, 'a card hides it');
  key('q');
  assert.equal(tip(), tipText('tip-beast'), 'and it stands again once the card closes');

  for (const k of ['ArrowRight', 'd', '.', 'u', 'r', 'h', 'z']) {
    assert.equal(key(k).prevented, true, k);
    assert.equal(moves(), 0, `${k} waits while the tip stands`);
  }
  assert.match(byId(banner(), 'tip').getAttribute('class') ?? '', /nudge/, 'and nudges it');
  assert.equal(tip(), tipText('tip-beast'), 'the tip stays');
  key('Enter');
  assert.equal(tip(), null, 'Enter puts it away');
  key('ArrowRight');
  assert.equal(moves(), 1, 'then the next move goes');
  assert.equal(tip(), WALLS, 'the first move: what he just did, and that walls hold him');
  key('ArrowUp');
  assert.equal(moves(), 1, 'held by the new tip');
  click(maybeById(banner(), 'tip-ok')!);
  assert.equal(tip(), null, 'Got It puts it away');
  key('ArrowUp');
  assert.equal(moves(), 2);
  assert.equal(tip(), null, 'nothing new until the third move');
  key('ArrowRight');
  assert.equal(moves(), 3);
  assert.equal(tip(), tipText('tip-undo'));
  for (let i = 0; i < 6; i++) key('ArrowLeft');
  assert.equal(moves(), 3, 'it never goes by itself: there are no turns while it stands');
  key(' ');
  assert.equal(tip(), null, 'Space puts it away too');
  key('u');
  assert.equal(moves(), 2, 'Undo goes through');
  key('ArrowRight');
  key('.');
  assert.equal(moves(), 4, 'Wait is a turn');
  key('.');
  assert.equal(moves(), 5);
  assert.equal(tip(), tipText('tip-exit'));

  flow.closeLayers();
  game.open(0);
  key('Enter');
  m.advance(1);
  assert.equal(tip(), null, 'each shows once: the level again shows none');
  assert.deepEqual(JSON.parse(data['crete-met-cards']!), ['tip-beast', 'tip-walls', 'tip-undo', 'tip-exit']);
});

test('a try from the editor shows no tip', () => {
  delete data['crete-met-cards'];
  flow.closeLayers();
  tryAt = 0;
  game.open(0);
  key('Enter');
  m.advance(1);
  key('ArrowRight');
  assert.equal(tip(), null);
  tryAt = -1;
});

test('Enter puts the tip away, as Got It does, and is no turn; with no tip it is nothing; Escape puts one away too', () => {
  delete data['crete-met-cards'];
  flow.closeLayers();
  game.open(0);
  key('Enter');
  m.advance(1);
  assert.equal(tip(), tipText('tip-beast'));
  const ev = key('Enter');
  assert.equal(ev.prevented, true, 'no focused button presses too');
  assert.equal(tip(), null, 'Enter puts it away');
  assert.equal(moves(), 0, 'and Wait never ran');
  assert.equal(flow.top(), null, 'nor did a card open');
  key('Enter');
  assert.equal(moves(), 0, 'with no tip Enter does nothing in play');
  key('ArrowRight');
  assert.equal(tip(), WALLS);
  key('Escape');
  assert.equal(tip(), null, 'Escape puts it away');
  assert.equal(moves(), 1);
  assert.equal(flow.top(), null, 'and opens nothing');
});
