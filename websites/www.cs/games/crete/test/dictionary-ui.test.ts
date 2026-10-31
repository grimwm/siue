// The first cards, the banner and the Dictionary on the real page and game, in the DOM stub: a first pickup's card
// shows once and later pickups a banner; a hazard in sight is a card once; the Backpack lists only what is held; the
// Entries lock what has not been met; a try from the editor shows no first card.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importTsx } from '../../_kit/test/tsx.ts';
import { byId, click, document, fireDocument, installDocument, maybeById, walk } from '../../_kit/test/dom-stub.ts';
import { manualClock } from '../../_kit/test/clock.ts';
import { createGame, frameOf } from '../src/game.ts';
import type { Game } from '../src/game.ts';
import { createFoundPages } from '../src/pages.ts';
import { createMet } from '../src/met.ts';
import { parse } from '../src/puzzle/level.ts';
import type { Level } from '../src/puzzle/level.ts';
import { CAMPAIGN_LEVELS } from '../src/campaign/chapters.ts';
import type { Levels, OutsideLevel } from '../src/campaign/chapters.ts';
import { SLIDE_MS } from '../src/board-plan.ts';
import type { Atlas } from '../src/board-plan.ts';
import type { Board } from '../src/board.ts';
import type { Progress } from '../src/progress.ts';
import { ENTRIES } from '../src/dictionary.ts';
import { BANNER_MS } from '../src/notices.ts';
import type { StorageLike } from '../../_kit/ports.ts';

installDocument();
const ui = await importTsx<{ page: typeof import('../src/ui.ts') }>(import.meta.dirname, { page: '../src/ui.ts' });
(globalThis as { getComputedStyle?: unknown }).getComputedStyle = () => ({ paddingLeft: '0', paddingRight: '0', paddingTop: '0', paddingBottom: '0', display: 'block' });

const data: Record<string, string> = {};
const storage: StorageLike = { getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, removeItem: k => { delete data[k]; } };
const met = createMet(storage);
const progress: Progress = { get: () => ({ cleared: false, assisted: false, best: null }), record: () => ({ cleared: true, assisted: false, best: 1 }) };
const m = manualClock();
let reduced = true;
let own: Level | null = null;
let outside: OutsideLevel | null = null;
const levels: Levels = {
  count: CAMPAIGN_LEVELS.count, id: CAMPAIGN_LEVELS.id,
  level: i => (i === 0 && own) || CAMPAIGN_LEVELS.level(i),
  scratch: i => i === 0 && outside !== null, outside: i => (i === 0 ? outside : null),
};
const flow = ui.page.createUi({
  atlas: { cell: 16, rise: 8, sprites: {} } as Atlas, board: { size() {}, paint() {} } as Board, progress, pages: createFoundPages(null), levels, met,
  timers: { setTimeout: (fn, ms) => m.timers.setTimeout(fn, ms), clearTimeout: id => m.timers.clearTimeout(id) },
});
const game: Game = createGame({
  sfx() {}, say() {}, progress, pages: createFoundPages(null), timers: m.timers, clock: m.clock, levels,
  reducedMotion: () => reduced, changed: () => flow.render(game), firstTake: what => flow.firstTake(what),
});
flow.bindControls({ game, toggleMute() {}, toggleFullscreen() {}, wake() {}, quit() {}, play() {} });

const key = (k: string) => fireDocument('keydown', { key: k, target: { tagName: 'DIV' } });
const root = (id: string) => document.getElementById(id);
const text = (rootId: string, id: string) => byId(root(rootId), id).textContent;
const bannerIds = () => walk(byId(root('banner-root'), 'banner')).map(n => n.getAttribute('data-entry')).filter(Boolean);
const right = () => game.press({ kind: 'move', dir: 'right' });

/** Opens `rows` as level 1 with nothing met, closing its start card. */
function open(rows: string[], opts: { animated?: boolean; outside?: OutsideLevel; head?: string } = {}): void {
  flow.closeLayers();
  m.advance(BANNER_MS); // a banner left by the last test goes
  for (const k of Object.keys(data)) delete data[k];
  reduced = !opts.animated;
  outside = opts.outside ?? null;
  own = parse(`title: t\n${opts.head ?? ''}\n${rows.join('\n')}\n`);
  game.open(0);
}

test('a hazard or special tile in sight is a card once, over the start card; later levels show it no more', () => {
  open(['#######', '#P...E#', '#######']);
  assert.equal(flow.top(), 'meet', 'the exit is met at the start');
  assert.equal(text('meet-root', 'meet-title'), 'The exit');
  key('Enter');
  assert.equal(flow.top(), 'start', 'the start card waits under it');
  game.open(0);
  assert.equal(flow.top(), 'start', 'met: no card the second time');
});

test('the first pickup of a kind is a card, once; the next pickup of it is a banner that fades on its own', () => {
  open(['########', '#Pz.zE.#', '########']);
  key('Enter');
  key('Enter');
  assert.equal(flow.top(), null);
  right();
  assert.equal(flow.top(), 'meet', 'the first mirror stops play with its card');
  assert.equal(text('meet-root', 'meet-title'), "Medusa's mirror");
  assert.match(text('meet-root', 'meet-effect'), /Press Z to use it\./);
  const moves = game.run!.now.moves;
  key('ArrowRight');
  assert.equal(game.run!.now.moves, moves, 'play waits while the card is up');
  key('q');
  assert.equal(flow.top(), null, 'Q closes it, as a story card');
  assert.deepEqual(bannerIds(), [], 'a first pickup has no banner');
  right();
  right();
  assert.equal(flow.top(), null, 'the second mirror opens no card');
  assert.deepEqual(bannerIds(), ['mirror'], 'it shows a banner');
  assert.match(byId(root('banner-root'), 'banner').textContent, /Medusa's mirror.*stone/);
  m.advance(BANNER_MS);
  assert.deepEqual(bannerIds(), [], 'the banner goes after BANNER_MS');
});

test('an animated turn stops where the figure takes a first, and goes on when its card closes', () => {
  open(['#########', '#P==z=.E#', '#########'], { animated: true });
  for (let i = 0; i < 3 && flow.top() !== null; i++) key('Enter');
  assert.equal(flow.top(), null, 'ice, the exit and the start card closed');
  right();
  assert.ok(game.anim, 'the turn animates');
  m.advance(10 * SLIDE_MS);
  frameOf(game, game.animMs());
  assert.equal(game.anim?.paused?.kind, 'item');
  assert.equal(flow.top(), 'meet');
  const at = game.animMs();
  m.advance(5000);
  assert.equal(game.animMs(), at, 'the animation holds while the card is read');
  click(byId(root('meet-root'), 'meet-go'));
  assert.equal(flow.top(), null);
  assert.equal(game.anim?.paused ?? null, null, 'and goes on');
  m.advance(10 * SLIDE_MS);
  const f = frameOf(game, game.animMs());
  if (game.anim && f?.done) game.finishAnim();
  assert.deepEqual(bannerIds(), [], 'its landing shows no banner for it');
  assert.equal(flow.top(), null);
});

test('a try from the editor shows no first card and notes nothing as met', () => {
  open(['#######', '#Pz.E.#', '#######'], { outside: { kind: 'try', name: 'Mine', best: null } });
  assert.equal(flow.top(), 'start');
  key('Enter');
  right();
  assert.equal(flow.top(), null);
  assert.deepEqual(bannerIds(), ['mirror'], 'a banner only');
  assert.equal(met.has('mirror'), false);
  assert.equal(met.has('exit'), false);
});

/** Opens the Dictionary from the menu with G. */
function dictionary(): void {
  key('q');
  assert.equal(flow.top(), 'menu');
  key('g');
  assert.equal(flow.top(), 'dictionary');
}

test('the Backpack lists only what is held now, with counts and keys; with nothing held it says so', () => {
  open(['#########', '#Pzzr.cE#', '#########']);
  key('Enter');
  key('Enter');
  dictionary();
  assert.ok(maybeById(root('dict-root'), 'dict-empty'), 'nothing held');
  key('q');
  key('q');
  for (let i = 0; i < 3; i++) {
    right();
    while (flow.top() === 'meet') key('Enter');
  }
  dictionary();
  const rows = walk(byId(root('dict-root'), 'dict-backpack')).filter(n => n.className === 'dict-row');
  assert.deepEqual(rows.map(n => n.getAttribute('data-entry')), ['key-red', 'mirror'], 'the cow lies ahead: not held');
  assert.match(rows[1]!.textContent, /Medusa's mirror × 2Z/);
  assert.equal(maybeById(root('dict-root'), 'dict-entries'), undefined);
  key('ArrowRight');
  assert.ok(maybeById(root('dict-root'), 'dict-entries'), 'right shows Entries');
  key('q');
  assert.equal(flow.top(), 'menu', 'Q goes back to the menu');
});

test('Entries open what has been met and show the rest as a locked "???"', () => {
  open(['#######', '#Pz.E.#', '#######']);
  key('Enter');
  key('Enter');
  right();
  key('Enter');
  dictionary();
  click(byId(root('dict-root'), 'dict-tab-entries'));
  const rows = walk(byId(root('dict-root'), 'dict-entries')).filter(n => n.className.startsWith('dict-row'));
  assert.equal(rows.length, ENTRIES.length);
  const open_ = rows.filter(n => n.getAttribute('data-locked') !== 'true').map(n => n.getAttribute('data-entry'));
  assert.deepEqual(open_, ['mirror', 'exit']);
  const locked = rows.filter(n => n.getAttribute('data-locked') === 'true');
  assert.equal(locked.length, ENTRIES.length - 2);
  for (const n of locked) {
    assert.equal(n.textContent, '???', `${n.getAttribute('data-entry')} gives nothing away`);
  }
  assert.match(byId(root('dict-root'), 'dict-entries').textContent, new RegExp(`2 of ${ENTRIES.length} met`));
});
