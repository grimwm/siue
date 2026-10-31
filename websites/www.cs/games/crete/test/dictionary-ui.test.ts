// The first cards, the banner and the Dictionary on the real page and game, in the DOM stub: a level opens on its start
// card alone; a first pickup's card, and a first touch of an active tile's (Chapter 1 level 6's toggle button), shows
// once and later ones a banner; a story page opens only its story; the Backpack lists only what is held; Entries open
// every hazard but the hidden walls until found, and lock items not picked up; the Modern look draws Modern icons; a
// try from the editor shows no first card.
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
import { ENTRIES, HIDDEN } from '../src/dictionary.ts';
import { solve } from '../src/puzzle/solver.ts';
import { initial } from '../src/puzzle/state.ts';
import { trialLevel } from '../src/puzzle/trials.ts';
import type { Action } from '../src/puzzle/step.ts';
import type { IconSheet } from '../src/icons-models.ts';
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
const icons: IconSheet = { cell: 128, width: 1024, height: 768, icons: Object.fromEntries(ENTRIES.map((e, i) => [e.id, { x: (i % 8) * 128, y: Math.floor(i / 8) * 128 }])) };
const flow = ui.page.createUi({
  icons,
  atlas: { cell: 16, rise: 8, sprites: {} } as Atlas, board: { size() {}, paint() {} } as Board, progress, pages: createFoundPages(null), levels, met,
  timers: { setTimeout: (fn, ms) => m.timers.setTimeout(fn, ms), clearTimeout: id => m.timers.clearTimeout(id) },
});
const game: Game = createGame({
  sfx() {}, say() {}, progress, pages: createFoundPages(null), timers: m.timers, clock: m.clock, levels,
  reducedMotion: () => reduced, changed: () => flow.render(game), isFirst: id => flow.isFirst(id),
});
flow.bindControls({ game, toggleMute() {}, toggleFullscreen() {}, wake() {}, quit() {}, play() {} });

const key = (k: string) => fireDocument('keydown', { key: k, target: { tagName: 'DIV' } });
const root = (id: string) => document.getElementById(id);
const text = (rootId: string, id: string) => byId(root(rootId), id).textContent;
const bannerIds = () => walk(byId(root('banner-root'), 'banner')).map(n => n.getAttribute('data-entry')).filter(Boolean);
const right = () => game.press({ kind: 'move', dir: 'right' });

/** Opens `rows` as level 1 with nothing met, closing its start card. */
function open(rows: string[], opts: { animated?: boolean; outside?: OutsideLevel; head?: string; at?: number } = {}): void {
  flow.closeLayers();
  m.advance(BANNER_MS); // a banner left by the last test goes
  for (const k of Object.keys(data)) delete data[k];
  reduced = !opts.animated;
  outside = opts.outside ?? null;
  own = rows.length ? parse(`title: t\n${opts.head ?? ''}\n${rows.join('\n')}\n`) : null;
  game.open(opts.at ?? 0);
}
/** Closes every card up, as Enter does. */
function closeAll(): void {
  for (let i = 0; i < 6 && flow.top() !== null; i++) key('Enter');
  assert.equal(flow.top(), null);
}

test('a level opens on its start card alone: no card for the Minotaur, the exit or any tile in sight', () => {
  open([], { at: 0 });
  assert.deepEqual(flow.top(), 'start');
  key('Enter');
  assert.equal(flow.top(), null, 'nothing waited under the start card');
  open(['#########', '#P~=>:OE#', '#M......#', '#########']);
  assert.deepEqual(flow.top(), 'start');
});

test('the first pickup of a kind is a card, once; the next pickup of it is a banner that fades on its own', () => {
  open(['########', '#Pz.zE.#', '########']);
  closeAll();
  right();
  assert.equal(flow.top(), 'meet', 'the first mirror stops play with its card');
  assert.equal(text('meet-root', 'meet-title'), "Medusa's mirror");
  assert.match(byId(root('meet-root'), 'meet-veil').textContent, /A first find/);
  assert.match(text('meet-root', 'meet-effect'), /Press Z to use it\./);
  const go = walk(byId(root('meet-root'), 'meet-go')).filter(n => n.localName === 'kbd').map(n => n.textContent);
  assert.deepEqual(go, ['↵'], 'Go on shows Enter');
  const moves = game.run!.now.moves;
  key('ArrowRight');
  assert.equal(game.run!.now.moves, moves, 'play waits while the card is up');
  key('Enter');
  assert.equal(flow.top(), null, 'Enter closes it');
  assert.deepEqual(bannerIds(), [], 'a first pickup has no banner');
  right();
  right();
  assert.equal(flow.top(), null, 'the second mirror opens no card');
  assert.deepEqual(bannerIds(), ['mirror'], 'it shows a banner');
  assert.match(byId(root('banner-root'), 'banner').textContent, /Medusa's mirror.*stone/);
  m.advance(BANNER_MS);
  assert.deepEqual(bannerIds(), [], 'the banner goes after BANNER_MS');
});

/** Chapter 1 level 6's line to its toggle button: the solver's, on a copy whose button is the way out. */
function toButton(): Action[] {
  const lv = trialLevel(5);
  const at = lv.terrain.indexOf('button');
  const copy = { ...lv, relics: 0, terrain: lv.terrain.map((t, i) => (i === at ? 'exit' : t === 'exit' ? 'wall' : t)) as typeof lv.terrain };
  const r = solve(initial(copy));
  assert.ok(r.solved);
  return r.line;
}

test('the toggle button on Chapter 1 level 6: its first press is a card, once; a later press is a banner', () => {
  open([], { at: 5 });
  closeAll();
  const line = toButton();
  for (const a of line.slice(0, -1)) game.press(a);
  assert.equal(flow.top(), null, 'nothing on the way stops play');
  game.press(line.at(-1)!);
  assert.equal(flow.top(), 'meet', 'the first press shows its card');
  assert.equal(text('meet-root', 'meet-title'), 'Toggle button');
  assert.match(byId(root('meet-root'), 'meet-veil').textContent, /A first touch/);
  key('Enter');
  assert.equal(flow.top(), null);
  game.press({ kind: 'move', dir: 'left' });
  game.press({ kind: 'move', dir: 'right' });
  assert.equal(game.run!.now.outcome, 'playing');
  assert.equal(flow.top(), null, 'the second press shows no card');
  assert.deepEqual(bannerIds(), ['button'], 'but a banner');
  assert.match(byId(root('banner-root'), 'banner').textContent, /Opens or shuts the toggle walls/);
  game.open(5);
  closeAll();
  for (const a of line) game.press(a);
  assert.equal(flow.top(), null, 'met in this browser: never a card again');
});

test('an animated turn stops where the figure takes a first, and goes on when its card closes', () => {
  open(['#########', '#P==z=.E#', '#########'], { animated: true });
  closeAll();
  right();
  assert.ok(game.anim, 'the turn animates');
  m.advance(10 * SLIDE_MS);
  frameOf(game, game.animMs());
  assert.equal(game.anim?.paused?.kind, 'meet');
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

test('a story page opens only its story, with Go on (Enter); it unlocks the page entry silently', () => {
  open(['#########', '#P.p..E.#', '#########'], { head: 'pages: ch1-tribute-marks' });
  closeAll();
  right();
  right();
  assert.equal(flow.top(), 'lore', 'the story opens');
  const go = walk(byId(root('lore-root'), 'lore-back')).filter(n => n.localName === 'kbd').map(n => n.textContent);
  assert.deepEqual(go, ['↵']);
  key('Enter');
  assert.equal(flow.top(), null, 'and nothing after it');
  assert.deepEqual(bannerIds(), []);
  dictionary();
  click(byId(root('dict-root'), 'dict-tab-entries'));
  const page = walk(byId(root('dict-root'), 'dict-entries')).find(n => n.getAttribute('data-entry') === 'page')!;
  assert.notEqual(page.getAttribute('data-locked'), 'true', 'the page entry is open');
});

test('a try from the editor shows no first card and notes nothing as met', () => {
  open(['#######', '#Pz_E.#', '#######'], { outside: { kind: 'try', name: 'Mine', best: null } });
  closeAll();
  right();
  assert.equal(flow.top(), null);
  assert.deepEqual(bannerIds(), ['mirror'], 'a banner only');
  right();
  assert.equal(flow.top(), null);
  assert.deepEqual(bannerIds(), ['button']);
  assert.equal(met.has('mirror'), false);
  assert.equal(met.has('touch-button'), false);
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
  closeAll();
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
  key('ArrowRight');
  assert.ok(maybeById(root('dict-root'), 'dict-entries'), 'right shows Entries');
  key('q');
  assert.equal(flow.top(), 'menu', 'Q goes back to the menu');
});

/** The Entries rows, by entry id: whether each is locked. */
function entries(): Record<string, boolean> {
  dictionary();
  click(byId(root('dict-root'), 'dict-tab-entries'));
  const rows = walk(byId(root('dict-root'), 'dict-entries')).filter(n => n.className.startsWith('dict-row'));
  assert.equal(rows.length, ENTRIES.length);
  for (const n of rows.filter(r => r.getAttribute('data-locked') === 'true')) assert.equal(n.textContent, '???', 'a locked row gives nothing away');
  const out = Object.fromEntries(rows.map(n => [n.getAttribute('data-entry')!, n.getAttribute('data-locked') === 'true']));
  key('q');
  key('q');
  return out;
}

test('Entries: every hazard and tile open from the start but the hidden walls, until found; items until picked up', () => {
  open(['########', '#PzWI.E#', '########']);
  closeAll();
  let locks = entries();
  for (const e of ENTRIES) assert.equal(locks[e.id], e.kind === 'item' || HIDDEN.has(e.id), `${e.id} at the start`);
  for (const id of ['block', 'water', 'ice', 'glider', 'minotaur', 'teleport', 'button']) assert.equal(locks[id], false, `${id} is readable unmet`);
  right();
  key('Enter');
  right();
  assert.equal(flow.top(), 'meet', 'finding the fake wall is a first touch');
  assert.equal(text('meet-root', 'meet-title'), 'Fake wall');
  key('Enter');
  locks = entries();
  assert.equal(locks.mirror, false, 'the mirror, picked up');
  assert.equal(locks['fake-wall'], false, 'the fake wall, found');
  assert.equal(locks['invisible-wall'], true, 'the invisible wall, not yet');
  assert.equal(locks.cake, true);
});

test('pictures follow the look: Classic draws the atlas sprite, Modern the pre-rendered Modern icon', () => {
  open(['#######', '#Pz.E.#', '#######']);
  closeAll();
  flow.setLook('classic', 'solid');
  right();
  const looks = () => walk(byId(root('meet-root'), 'meet-veil')).filter(n => n.className.split(' ').includes('sprite')).map(n => n.getAttribute('data-look'));
  assert.deepEqual(looks(), ['classic']);
  flow.setLook('modern', 'solid');
  assert.deepEqual(looks(), ['modern'], 'the same card in Modern');
  const layer = walk(byId(root('meet-root'), 'meet-veil')).find(n => n.className.includes('modern-layer'))!;
  assert.ok(layer, 'drawn from the Modern icon sheet');
  key('Enter');
  dictionary();
  click(byId(root('dict-root'), 'dict-tab-entries'));
  const pics = walk(byId(root('dict-root'), 'dict-entries')).filter(n => n.className.split(' ').includes('sprite')).map(n => n.getAttribute('data-look'));
  assert.equal(pics.length, ENTRIES.length);
  assert.ok(pics.every(l => l === 'modern'), 'every Entries picture is Modern');
});
