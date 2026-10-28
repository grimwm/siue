// Crete's Preact overlays in the DOM stub: the ids the page's CSS and the
// browser specs use, the text each shows, and that each button calls back.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { render as preactRender } from 'preact';
import type { ComponentChildren } from 'preact';
import { importTsx } from '../../_kit/test/tsx.ts';
import { asElement, byId, childEl, click, document, installDocument, makeEl, maybeById, renderTarget, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import type { EndCardProps } from '../src/ui/end.tsx';
import type { TitleCardProps } from '../src/ui/title.tsx';
import { KEYS } from '../src/keys.ts';
import { manualClock } from '../../_kit/test/clock.ts';
import { fireDocument } from '../../_kit/test/dom-stub.ts';
import { createGame } from '../src/game.ts';
import type { Game } from '../src/game.ts';
import { createFoundPages } from '../src/pages.ts';
import { initial } from '../src/puzzle/state.ts';
import { solve } from '../src/puzzle/solver.ts';
import { trialLevel } from '../src/puzzle/trials.ts';
import { step } from '../src/puzzle/step.ts';
import type { Action } from '../src/puzzle/step.ts';
import { DIRS } from '../src/puzzle/tiles.ts';
import { stateKey } from './reference-solver.ts';
import { CAMPAIGN_LEVELS, LEVEL_IDS } from '../src/campaign/chapters.ts';
import type { Level } from '../src/puzzle/level.ts';
import type { Levels, OutsideLevel } from '../src/campaign/chapters.ts';
import { icedPages } from './puzzle-grid.ts';
import { SLIDE_MS } from '../src/board-plan.ts';
import { frameOf } from '../src/game.ts';
import type { Progress } from '../src/progress.ts';
import type { Atlas } from '../src/board-plan.ts';
import type { Board } from '../src/board.ts';

installDocument();
const ui = await importTsx<{
  end: typeof import('../src/ui/end.tsx');
  title: typeof import('../src/ui/title.tsx');
  page: typeof import('../src/ui.ts');
}>(import.meta.dirname, { end: '../src/ui/end.tsx', title: '../src/ui/title.tsx', page: '../src/ui.ts' });
(globalThis as { getComputedStyle?: unknown }).getComputedStyle = () => ({ paddingLeft: '0', paddingRight: '0', paddingTop: '0', paddingBottom: '0', display: 'block' });
// The overlays render into a DOM Element; the stub stands in for one.
const renderEndCard = (root: StubElement, props: EndCardProps): void => ui.end.renderEndCard(asElement(root), props);
const renderTitleCard = (root: StubElement, props: TitleCardProps): void => ui.title.renderTitleCard(asElement(root), props);
const render = (vnode: ComponentChildren, root: StubElement): void => preactRender(vnode, renderTarget(root));

const WON = { won: true, hasNext: true, hasLevels: true, pages: [] as string[], kicker: 'Level 1 cleared', title: 'The Mouth of the Labyrinth', text: 'You found the way on your own.', score: '14 moves · best 14' };
const LOST = { won: false, hasNext: false, hasLevels: false, pages: [] as string[], kicker: 'Level failed', title: 'The Minotaur has you', text: 'Your last heart is gone.', score: '9 moves' };
const calls = (seen: string[]) => ({
  onNext: () => seen.push('next'), onRetry: () => seen.push('retry'), onTrials: () => seen.push('trials'),
  onUndo: () => seen.push('undo'), onRestart: () => seen.push('restart'),
});

// Unmounting each root keeps one test's dialog from holding focus for the next.
const roots: StubElement[] = [];
const mount = () => { const root = makeEl('root'); roots.push(root); return root; };
afterEach(() => {
  for (const root of roots.splice(0)) render(null, root);
  document.activeElement = null;
  globalThis.__focused = null;
});

test('a won card names the pages found in this win, and shows no such line without any', () => {
  const root = mount();
  renderEndCard(root, { open: true, ...WON, pages: ["A note in Daedalus's hand"], ...calls([]) });
  assert.equal(byId(root, 'end-pages').textContent, "You found a page: A note in Daedalus's hand. It is in the Lore book.");
  renderEndCard(root, { open: true, ...WON, pages: ['One', 'Two'], ...calls([]) });
  assert.equal(byId(root, 'end-pages').textContent, 'You found pages: One, Two. They are in the Lore book.');
  renderEndCard(root, { open: true, ...WON, pages: [], ...calls([]) });
  assert.equal(maybeById(root, 'end-pages'), undefined);
});

test('the Levels button on a won card is worded Levels', () => {
  const root = mount();
  renderEndCard(root, { open: true, ...WON, ...calls([]) });
  assert.ok(byId(root, 'end-trials').textContent.startsWith('Levels'));
  assert.ok(byId(root, 'end-next').textContent.includes('Next level'));
});

test('the ending card waits hidden until a trial ends', () => {
  const root = mount();
  renderEndCard(root, { open: false, ...WON, ...calls([]) });
  assert.equal(byId(root, 'end-veil').hidden, true);
  assert.equal(byId(root, 'end-veil').className, 'veil');
});

test('a won level offers Next level, Retry and Levels, and focuses Next level', () => {
  const root = mount();
  const seen: string[] = [];
  renderEndCard(root, { open: false, ...WON, ...calls(seen) });
  renderEndCard(root, { open: true, ...WON, ...calls(seen) });
  assert.equal(byId(root, 'end-veil').hidden, false);
  const card = childEl(byId(root, 'end-veil'));
  assert.equal(card.className, 'card');
  assert.equal(card.getAttribute('aria-labelledby'), 'end-title');
  assert.deepEqual(['end-kicker', 'end-title', 'end-text', 'end-score'].map(id => byId(root, id).textContent),
    [WON.kicker, WON.title, WON.text, WON.score]);
  assert.equal(byId(root, 'end-score').className, 'runstats');
  assert.equal(document.activeElement?.id, 'end-next');
  for (const id of ['end-next', 'end-retry', 'end-trials']) click(byId(root, id));
  assert.deepEqual(seen, ['next', 'retry', 'trials']);
  assert.equal(maybeById(root, 'end-undo'), undefined);
  assert.equal(maybeById(root, 'end-restart'), undefined);
});

test('after the last level there is no Next level, and Retry takes the focus', () => {
  const root = mount();
  renderEndCard(root, { open: true, ...WON, hasNext: false, ...calls([]) });
  assert.equal(maybeById(root, 'end-next'), undefined);
  assert.equal(document.activeElement?.id, 'end-retry');
});

test('a lost level offers Undo and Restart only', () => {
  const root = mount();
  const seen: string[] = [];
  renderEndCard(root, { open: true, ...LOST, ...calls(seen) });
  assert.equal(byId(root, 'end-title').textContent, 'The Minotaur has you');
  assert.equal(document.activeElement?.id, 'end-undo');
  click(byId(root, 'end-undo'));
  click(byId(root, 'end-restart'));
  assert.deepEqual(seen, ['undo', 'restart']);
  for (const id of ['end-next', 'end-retry', 'end-trials']) assert.equal(maybeById(root, id), undefined, id);
});

test('the title card names the game and focuses Play; Play calls back', () => {
  const root = makeEl('title-root');
  let played = 0;
  renderTitleCard(root, { open: false, hint: false, onPlay: () => { played++; } });
  assert.equal(byId(root, 'title-veil').hidden, true);
  renderTitleCard(root, { open: true, hint: false, onPlay: () => { played++; } });
  assert.equal(byId(root, 'title-veil').hidden, false);
  assert.equal(byId(root, 'title-name').textContent, 'The Island of Crete');
  assert.equal(maybeById(root, 'title-hint'), undefined);
  assert.equal(globalThis.__focused?.id, 'title-play');
  // The key is the kit's keycap after the words, never written into them.
  const play = byId(root, 'title-play');
  assert.deepEqual(walk(play).filter(n => n.localName === 'kbd').map(k => [k.className, k.textContent]),
    [['kit-key-tab kit-key-inline', KEYS.new.label]]);
  assert.ok(!play.textContent.includes('('), play.textContent);
  click(byId(root, 'title-play'));
  assert.equal(played, 1);
});

test('Story and Settings appear when the page gives them, and call back', () => {
  const root = makeEl('title-root');
  renderTitleCard(root, { open: true, hint: false, onPlay() {} });
  assert.equal(maybeById(root, 'title-story'), undefined);
  assert.equal(maybeById(root, 'title-settings'), undefined);
  const seen: string[] = [];
  renderTitleCard(root, { open: true, hint: false, onPlay() {}, onStory: () => seen.push('story'), onSettings: () => seen.push('settings') });
  const caps = (id: string) => walk(byId(root, id)).filter(n => n.localName === 'kbd').map(k => k.textContent);
  assert.equal(byId(root, 'title-story').textContent, `Story${KEYS.story.label}`);
  assert.equal(byId(root, 'title-settings').textContent, `Settings${KEYS.menu.label}`);
  assert.deepEqual(caps('title-story'), ['I']);
  assert.deepEqual(caps('title-settings'), ['Q']);
  click(byId(root, 'title-story'));
  click(byId(root, 'title-settings'));
  assert.deepEqual(seen, ['story', 'settings']);
});

test('the title card keeps a slot for the kit install bar', () => {
  const root = makeEl('title-root');
  renderTitleCard(root, { open: true, hint: false, onPlay() {} });
  assert.equal(byId(root, 'title-install').className, 'title-install');
});

test('an installed app that could not close says how to', () => {
  const root = makeEl('title-root');
  renderTitleCard(root, { open: true, hint: true, onPlay() {} });
  assert.equal(byId(root, 'title-hint').textContent, 'Swipe the app away to close it.');
});

test('the title card reads its kicker from Chapter 1', () => {
  const root = makeEl('title-root');
  renderTitleCard(root, { open: true, hint: false, onPlay() {} });
  const kicker = walk(byId(root, 'title-veil')).find(n => n.className === 'kicker');
  assert.equal(kicker?.textContent, 'Chapter 1 · The Outer Halls');
  assert.doesNotMatch(byId(root, 'title-veil').textContent, /Eight/);
});

// ---- the title -> chapter card -> level flow, on the real page and game ----
const cleared = new Set<string>();
const progress: Progress = {
  get: id => ({ cleared: cleared.has(id), assisted: false, best: cleared.has(id) ? 20 : null }),
  record: id => { cleared.add(id); return progress.get(id); },
};
const m = manualClock();
const heard: string[] = [];
const found = createFoundPages(null);
/* A test may animate its turns, may serve its own level in place of level 1, and may make level `outsideAt` one from
   outside the campaign. */
let reduced = true;
let ownLevel: Level | null = null;
let outsideAt = -1;
let ownOutside: OutsideLevel | null = null;
let outsideLevel: Level | null = null;
const levels: Levels = {
  count: CAMPAIGN_LEVELS.count, id: CAMPAIGN_LEVELS.id,
  level: i => (i === outsideAt && outsideLevel) || (i === 0 && ownLevel) || CAMPAIGN_LEVELS.level(i),
  scratch: i => i === outsideAt, outside: i => (i === outsideAt ? ownOutside : null),
};
const flow = ui.page.createUi({ atlas: { cell: 16, rise: 8, sprites: {} } as Atlas, board: { size() {}, paint() {} } as Board, progress, pages: found, levels, sfx: n => heard.push(n) });
const game: Game = createGame({
  sfx() {}, say() {}, progress, pages: found, timers: m.timers, clock: m.clock, levels,
  reducedMotion: () => reduced, changed: () => flow.render(game),
});
let toggled = 0;
let backs = 0;
/* The editor as the page sees it: what it was asked to do, and every key it was handed. */
const edits: string[] = [];
const editorKeys: string[] = [];
const editor = {
  open: () => { edits.push('open'); },
  close: () => { edits.push('close'); },
  key: (ev: KeyboardEvent) => { editorKeys.push(ev.key); return false; },
};
flow.bindControls({
  game, toggleMute() {}, toggleFullscreen() { toggled++; }, wake() {}, quit() {}, play: () => flow.showChapter(1, false), backToEditor: () => { backs++; },
  editor, leftEditor: () => { edits.push('left'); },
});
const key = (k: string) => fireDocument('keydown', { key: k, target: { tagName: 'DIV' } });
const pick = (n: number) => click(byId(document.getElementById('levels-root'), `level-${n}`));
const reset = () => { cleared.clear(); heard.length = 0; flow.closeLayers(); game.stop(); reduced = true; ownLevel = null; outsideAt = -1; ownOutside = null; outsideLevel = null; backs = 0; edits.length = 0; editorKeys.length = 0; };
// Elements of unmounted overlay tests linger in the stub by id, so a page element is looked up inside its root.
const rootOf = (id: string) => document.getElementById(`${id.split('-')[0]}-root`)!;
const el = (id: string) => maybeById(rootOf(id), id);
const text = (id: string) => byId(rootOf(id), id).textContent;
/** Opens level `i`, closes its start card and plays the solver's line to the win. */
function win(i: number): void {
  game.open(i);
  key('Enter');
  const r = solve(initial(trialLevel(i)));
  assert.ok(r.solved);
  for (const a of r.line) game.press(a);
  assert.equal(game.run!.now.outcome, 'won');
}

test('in the levels list, up and down (or j and k) move between levels and Enter opens the one chosen', () => {
  reset();
  game.open(0);
  flow.closeLayers();
  key('n');
  assert.equal(flow.top(), 'levels');
  const at = () => document.activeElement?.id;
  assert.equal(at(), 'level-1');
  key('ArrowDown');
  assert.equal(at(), 'level-2');
  key('j');
  assert.equal(at(), 'level-3');
  key('k');
  assert.equal(at(), 'level-2');
  key('ArrowUp');
  key('ArrowUp');
  assert.equal(at(), 'level-1', 'the first level stays chosen at the top');
  for (let i = 0; i < 15; i++) key('ArrowDown');
  assert.equal(at(), 'level-10', 'the last level stays chosen at the bottom');
  key('k');
  key('Enter');
  assert.equal(game.trial, 8);
  assert.equal(flow.top(), 'start');
});

test('I on the title opens the story card and Q opens the menu; Q again returns to the title', () => {
  reset();
  flow.showTitle(false);
  key('i');
  assert.equal(flow.top(), 'story');
  key('q');
  assert.equal(flow.top(), 'title');
  key('q');
  assert.equal(flow.top(), 'menu');
  key('q');
  assert.equal(flow.top(), 'title');
});

test('F toggles full screen and L opens the Lore book while the menu is up, and neither does anything in play', () => {
  reset();
  toggled = 0;
  game.open(0);
  key('Enter');
  key('f');
  key('l');
  key('i');
  assert.equal(toggled, 0);
  assert.equal(flow.top(), null);
  key('q');
  assert.equal(flow.top(), 'menu');
  key('i');
  assert.equal(flow.top(), 'menu', 'I is the title card key');
  key('f');
  assert.equal(toggled, 1);
  key('l');
  assert.equal(flow.top(), 'lore');
  key('f');
  assert.equal(toggled, 1, 'F does nothing on the Lore book');
});

test('in the menu, down and up (or j and k) move the focus through its buttons and Enter presses the focused one', () => {
  reset();
  toggled = 0;
  key('q');
  const at = () => document.activeElement?.id;
  const order = ['menu-close', 'mute', 'fullscreen', 'menu-lore', 'quit'];
  const first = order.indexOf(at() ?? '');
  assert.ok(first >= 0, `focus is on a menu button, not ${at()}`);
  for (let i = 0; i < 6; i++) key('ArrowUp');
  assert.equal(at(), 'menu-close', 'clamped at the top');
  key('ArrowDown');
  assert.equal(at(), 'mute');
  key('j');
  assert.equal(at(), 'fullscreen');
  key('s');
  assert.equal(at(), 'menu-lore');
  key('k');
  assert.equal(at(), 'fullscreen');
  key('Enter');
  assert.equal(toggled, 1);
  for (let i = 0; i < 6; i++) key('ArrowDown');
  assert.equal(at(), 'quit', 'clamped at the bottom');
});

test('left and right in the levels list keep the one released chapter shown', () => {
  reset();
  key('n');
  assert.equal(flow.top(), 'levels');
  key('ArrowRight');
  key('d');
  key('ArrowLeft');
  key('a');
  assert.equal(flow.top(), 'levels');
  assert.equal(byId(rootOf('levels-tab-1'), 'levels-tab-1').getAttribute('aria-pressed'), 'true');
  assert.ok(byId(document.getElementById('levels-root'), 'level-1'));
});

test('Enter on the end card with the focus moved to Levels opens the list, not the next level', () => {
  reset();
  win(0);
  assert.equal(flow.top(), 'end');
  assert.equal(document.activeElement?.id, 'end-next');
  key('ArrowDown');
  key('ArrowDown');
  assert.equal(document.activeElement?.id, 'end-trials');
  key('Enter');
  assert.equal(flow.top(), 'levels');
  assert.equal(game.trial, 0);
});

test('N on the title card does what Play does, and elsewhere still opens the list', () => {
  reset();
  flow.showTitle(false);
  key('n');
  assert.equal(flow.top(), 'chapter');
  reset();
  key('n');
  assert.equal(flow.top(), 'levels');
});

test('a held Enter repeats nothing: it does not close the start card or start a level', () => {
  reset();
  flow.showChapter(1, false);
  const rep = (k: string) => fireDocument('keydown', { key: k, repeat: true, target: { tagName: 'DIV' } });
  const ev = rep('Enter');
  assert.equal(ev.prevented, true);
  assert.equal(flow.top(), 'chapter');
  key('Enter');
  assert.equal(flow.top(), 'start');
  rep('Enter');
  assert.equal(flow.top(), 'start');
});

test('a held Enter after level 10 closes the closing card once and does not restart the level', () => {
  reset();
  win(9);
  const opens = game.opens;
  key('Enter');
  assert.equal(flow.top(), 'end');
  fireDocument('keydown', { key: 'Enter', repeat: true, target: { tagName: 'DIV' } });
  assert.equal(game.opens, opens);
});

test('Play opens the chapter card, and Enter on it starts level 1 when nothing is cleared', () => {
  reset();
  flow.showTitle(false);
  flow.showChapter(1, false);
  assert.equal(flow.top(), 'chapter');
  key('Enter');
  assert.equal(game.trial, 0);
  assert.equal(flow.top(), 'start');
});

test('Enter on the chapter card starts the first level this browser has not cleared', () => {
  reset();
  for (const id of LEVEL_IDS.slice(0, 3)) cleared.add(id);
  flow.showChapter(1, false);
  key('Enter');
  assert.equal(game.trial, 3);
  assert.equal(flow.top(), 'start');
});

test('with every level cleared, Enter starts level 1', () => {
  reset();
  for (const id of LEVEL_IDS) cleared.add(id);
  flow.showChapter(1, false);
  key('Enter');
  assert.equal(game.trial, 0);
});

test('Q closes the chapter card and Levels on it opens the list', () => {
  reset();
  flow.showChapter(1, false);
  key('q');
  assert.equal(flow.top(), null);
  flow.showChapter(1, false);
  key('n');
  assert.equal(flow.top(), 'levels');
  key('q');
  assert.equal(flow.top(), 'chapter');
});

test('picking level 1 from the list shows the chapter card first, and Enter then opens level 1', () => {
  reset();
  for (const id of LEVEL_IDS.slice(0, 3)) cleared.add(id);
  key('n');
  assert.equal(flow.top(), 'levels');
  pick(1);
  assert.equal(flow.top(), 'chapter');
  key('Enter');
  assert.equal(game.trial, 0);
  assert.equal(flow.top(), 'start');
});

test('picking any other level opens it directly', () => {
  reset();
  key('n');
  pick(5);
  assert.equal(game.trial, 4);
  assert.equal(flow.top(), 'start');
});

test('N opens the levels list over a level in play', () => {
  reset();
  game.open(2);
  key('Enter');
  assert.equal(flow.top(), null);
  key('n');
  assert.equal(flow.top(), 'levels');
});

test('the closing card takes Enter as Continue, and does not start a level', () => {
  reset();
  const opened = game.opens;
  flow.showChapter(1, true);
  assert.equal(flow.top(), 'chapter');
  assert.match(byId(document.getElementById('chapter-root'), 'chapter-veil').textContent, /Chapter 2 is not yet released/);
  key('Enter');
  assert.equal(flow.top(), null);
  assert.equal(game.opens, opened);
});

test('the end card words a win as Level N cleared and a loss as Level failed', () => {
  reset();
  win(0);
  assert.equal(flow.top(), 'end');
  assert.equal(text('end-kicker'), 'Level 1 cleared');
  assert.ok(text('end-next').includes('Next level'));
  assert.ok(text('end-trials').startsWith('Levels'));
});

test('Next level carries the Enter tab, and Enter on a won card opens the next level', () => {
  reset();
  win(0);
  const tabs = walk(el('end-next')!).filter(n => n.localName === 'kbd');
  assert.deepEqual(tabs.map(t => t.textContent), [KEYS.begin.label]);
  key('Enter');
  assert.equal(game.trial, 1);
  assert.equal(flow.top(), 'start');
});

test('Retry carries the R tab, and R on a won card plays the level again', () => {
  reset();
  win(0);
  const tabs = walk(el('end-retry')!).filter(n => n.localName === 'kbd');
  assert.deepEqual(tabs.map(t => t.textContent), [KEYS.restart.label]);
  const before = game.opens;
  key('r');
  assert.equal(game.trial, 0);
  assert.equal(game.opens, before + 1);
  assert.equal(game.run!.now.moves, 0);
});

/** A shortest line that loses level `i`: breadth-first until a turn ends the try lost. */
function losingLine(i: number): Action[] {
  const start = initial(trialLevel(i));
  const queue: { s: typeof start; line: Action[] }[] = [{ s: start, line: [] }];
  const seen = new Set<string>([stateKey(start)]);
  const acts: Action[] = [{ kind: 'wait' }, ...DIRS.map(dir => ({ kind: 'move', dir }) as Action)];
  for (let h = 0; h < queue.length && h < 200_000; h++) {
    const { s, line } = queue[h]!;
    for (const a of acts) {
      const n = step(s, a).state;
      if (n === s) continue;
      if (n.outcome === 'lost') return [...line, a];
      const k = stateKey(n);
      if (n.outcome === 'won' || seen.has(k)) continue;
      seen.add(k);
      queue.push({ s: n, line: [...line, a] });
    }
  }
  throw new Error(`level ${i + 1} has no losing line`);
}

test('on a lost card U undoes and R restarts, as their tabs say', () => {
  reset();
  const lose = () => {
    game.open(8);
    key('Enter');
    for (const a of losingLine(8)) game.press(a);
    assert.equal(game.run!.now.outcome, 'lost');
    assert.equal(flow.top(), 'end');
  };
  lose();
  key('u');
  assert.equal(game.run!.now.outcome, 'playing');
  assert.notEqual(flow.top(), 'end');
  lose();
  key('r');
  assert.equal(game.run!.now.outcome, 'playing');
  assert.equal(game.run!.now.moves, 0);
});

test('Enter on a won card with Retry focused retries rather than going on', () => {
  reset();
  win(0);
  fireDocument('keydown', { key: 'Enter', target: { tagName: 'BUTTON', id: 'end-retry' } });
  assert.equal(game.trial, 0);
});

test('taking a story page opens its Lore entry over the board; Enter closes it and play goes on; the book lists the page only after the win', () => {
  reset();
  const lv = trialLevel(8);
  const copy = { ...lv, objects: lv.objects.map(o => (o === 'page' ? 'relic' as const : o)), relics: lv.relics + 1, pageIds: [], pageCells: [] };
  const r = solve(initial(copy));
  assert.ok(r.solved);
  const id = lv.pageIds[0]!;
  // The found pages are kept for the whole file, so the test reads what was already found rather than relying on order.
  const foundBefore = found.has(id);
  game.open(8);
  key('Enter');
  let i = 0;
  while (flow.top() !== 'lore' && i < r.line.length) game.press(r.line[i++]!);
  assert.equal(flow.top(), 'lore', 'taking the page opens the Lore book');
  assert.equal(text('lore-entry-title'), "A Tribute's Marks");
  assert.ok(el('lore-entry-text'));
  const tabs = walk(el('lore-back')!).filter(n => n.localName === 'kbd').map(t => t.textContent);
  assert.deepEqual(tabs, [KEYS.menu.label]);
  const moves = game.run!.now.moves;
  key('ArrowUp');
  assert.equal(game.run!.now.moves, moves, 'the game waits while the entry is open');
  key('Enter');
  assert.notEqual(flow.top(), 'lore');
  game.press(r.line[i++]!);
  assert.equal(game.run!.now.moves, moves + 1, 'the next move plays');
  assert.notEqual(flow.top(), 'lore', 'the page does not open twice');
  // The book still counts the page as not found until the level is won.
  assert.equal(found.has(id), foundBefore, 'taking the page records nothing before the win');
  key('q');
  click(byId(rootOf('menu-lore'), 'menu-lore'));
  if (!foundBefore) assert.ok(text(`lore-page-${id}`).includes('? ? ?'));
  flow.closeLayers();
  for (; i < r.line.length; i++) game.press(r.line[i]!);
  assert.equal(game.run!.now.outcome, 'won');
  flow.closeLayers();
  key('q');
  click(byId(rootOf('menu-lore'), 'menu-lore'));
  assert.ok(text(`lore-page-${id}`).includes("A Tribute's Marks"));
});

test('a win that takes a page names it on the end card, and a replayed win still does', () => {
  reset();
  // Level 9 with its page made a relic: the solver's line must take it, and the same line wins the real level.
  const lv = trialLevel(8);
  const copy = { ...lv, objects: lv.objects.map(o => (o === 'page' ? 'relic' as const : o)), relics: lv.relics + 1, pageIds: [], pageCells: [] };
  const r = solve(initial(copy));
  assert.ok(r.solved);
  for (let round = 0; round < 2; round++) {
    game.open(8);
    key('Enter');
    for (const a of r.line) {
      game.press(a);
      if (flow.top() === 'lore') key('Enter');
    }
    assert.equal(game.run!.now.outcome, 'won');
    assert.equal(flow.top(), 'end');
    assert.equal(text('end-pages'), "You found a page: A Tribute's Marks. It is in the Lore book.");
  }
});

test('Q closes a page entry, and undoing back over the pickup shows it again only when retaken', () => {
  reset();
  const lv = trialLevel(8);
  const copy = { ...lv, objects: lv.objects.map(o => (o === 'page' ? 'relic' as const : o)), relics: lv.relics + 1, pageIds: [], pageCells: [] };
  const r = solve(initial(copy));
  assert.ok(r.solved);
  game.open(8);
  key('Enter');
  let i = 0;
  while (flow.top() !== 'lore' && i < r.line.length) game.press(r.line[i++]!);
  key('q');
  assert.equal(flow.top(), null);
  game.press('undo');
  assert.equal(flow.top(), null);
  game.press(r.line[i - 1]!);
  assert.equal(flow.top(), 'lore');
});

/* Level 1 swapped for one slide right over two of Chapter 1's pages on ice. */
function slideOverPages(animated: boolean): void {
  reset();
  reduced = !animated;
  ownLevel = icedPages(['#########', '#P=p=p.E#', '#########'], 'ch1-tribute-marks ch1-chalk');
  game.open(0);
  key('Enter');
  assert.equal(flow.top(), null);
  key('ArrowRight');
}
/** What the page's loop does each frame: reads the animation's time, and ends a finished animation. */
function frame(): void {
  const f = frameOf(game, game.animMs());
  if (game.anim && f?.done) game.finishAnim();
}

test('a slide over two pages pauses at each as the figure reaches it, opens it, and goes on when it closes', () => {
  slideOverPages(true);
  assert.ok(game.anim, 'the turn animates');
  frame();
  assert.equal(flow.top(), null, 'no page opens before the figure reaches it');
  m.advance(2 * SLIDE_MS);
  frame();
  assert.equal(flow.top(), 'lore', 'the figure reached the first page');
  assert.equal(text('lore-entry-title'), "A Tribute's Marks");
  assert.equal(game.anim?.paused?.id, 'ch1-tribute-marks');
  const moves = game.run!.now.moves;
  key('ArrowUp');
  key('t');
  assert.equal(game.run!.now.moves, moves, 'the game waits while the page is read');
  m.advance(5000);
  frame();
  assert.equal(game.animMs(), 2 * SLIDE_MS, 'the animation holds while the page is read');
  key('Enter');
  assert.equal(flow.top(), null, 'the page closes');
  assert.equal(game.anim?.paused, null, 'and the slide goes on');
  m.advance(SLIDE_MS);
  frame();
  assert.equal(game.animMs(), 3 * SLIDE_MS, 'from where it paused');
  assert.equal(flow.top(), null);
  m.advance(SLIDE_MS);
  frame();
  assert.equal(flow.top(), 'lore', 'the figure reached the second page');
  assert.equal(text('lore-entry-title'), 'Chalk');
  key('q');
  assert.equal(flow.top(), null);
  m.advance(5000);
  frame();
  assert.equal(game.anim, null, 'the animation ends');
  assert.equal(flow.top(), null, 'no page opens twice');
  assert.deepEqual(game.run!.now.player, { r: 1, c: 6 });
});

test('with reduced motion the pages a slide takes open one after the other once the turn has landed', () => {
  slideOverPages(false);
  assert.equal(game.anim, null);
  assert.equal(flow.top(), 'lore');
  assert.equal(text('lore-entry-title'), "A Tribute's Marks");
  key('Enter');
  assert.equal(flow.top(), 'lore');
  assert.equal(text('lore-entry-title'), 'Chalk');
  key('Enter');
  assert.equal(flow.top(), null);
});

test('a win that takes no page has no page line', () => {
  reset();
  win(0);
  assert.equal(el('end-pages'), undefined);
});

test('winning level 10 opens the closing card over the end card, and the end card waits until Continue', () => {
  reset();
  win(9);
  assert.equal(flow.top(), 'chapter');
  assert.match(text('chapter-text'), /Labyrinth begins here/);
  assert.equal(byId(rootOf('end-veil'), 'end-veil').hidden, true);
  key('Enter');
  assert.equal(flow.top(), 'end');
  assert.equal(el('end-next'), undefined);
  assert.equal(text('end-kicker'), 'Level 10 cleared');
});

test('Q also puts the closing card away and shows the end card', () => {
  reset();
  win(9);
  key('q');
  assert.equal(flow.top(), 'end');
});

test('a chapter card opening makes the chapter sound once', () => {
  reset();
  flow.showChapter(1, false);
  assert.deepEqual(heard, ['chapter']);
  key('Enter');
  assert.deepEqual(heard, ['chapter']);
  win(9);
  assert.equal(heard.filter(n => n === 'chapter').length, 2, 'the closing card makes it once more');
});

test('the menu opens the Lore book; Q leaves an open entry for the list, and Q again closes the book', () => {
  reset();
  key('q');
  assert.equal(flow.top(), 'menu');
  click(byId(rootOf('menu-lore'), 'menu-lore'));
  assert.equal(flow.top(), 'lore');
  assert.ok(text('lore-veil').includes('Lore book'));
  click(byId(rootOf('lore-opening-1'), 'lore-opening-1'));
  assert.equal(text('lore-entry-title'), 'The Outer Halls');
  key('q');
  assert.equal(flow.top(), 'lore');
  assert.ok(el('lore-opening-1'), 'back on the list');
  key('q');
  assert.equal(flow.top(), 'menu');
});

test('the Lore book lists the closing card once level 10 is cleared', () => {
  reset();
  key('q');
  click(byId(rootOf('menu-lore'), 'menu-lore'));
  assert.equal(el('lore-closing-1'), undefined);
  flow.closeLayers();
  win(9);
  flow.closeLayers();
  key('q');
  click(byId(rootOf('menu-lore'), 'menu-lore'));
  assert.ok(el('lore-closing-1'));
});

// ---- a level from outside the campaign: a try from the editor, or a shared link ----
/** Makes level 10 (a chapter's last, whose win opens the closing card) an outside level. */
function outside(o: OutsideLevel): void {
  outsideAt = 9;
  ownOutside = o;
}
const startKicker = () => walk(byId(rootOf('start-veil'), 'start-veil')).find(n => n.className === 'kicker')?.textContent;

test('the start and end cards name an outside level', () => {
  reset();
  outside({ kind: 'try', name: 'My maze', best: null });
  game.open(9);
  assert.equal(flow.top(), 'start');
  assert.equal(startKicker(), 'Your level');
  assert.equal(text('start-title'), 'My maze');
  assert.equal(el('start-best'), undefined);
  assert.equal(byId(document.getElementById('status-root')!, 'hud-trial').textContent, '–', 'the status bar gives no place in a chapter');
  win(9);
  assert.equal(flow.top(), 'end');
  assert.equal(text('end-kicker'), 'Your level');
  assert.equal(text('end-title'), 'My maze');
  reset();
  outside({ kind: 'shared', name: 'Level K7QD by ABC', best: 54 });
  game.open(9);
  assert.equal(startKicker(), 'Shared level');
  assert.equal(text('start-title'), 'Level K7QD by ABC');
  assert.equal(text('start-best'), 'beat 54');
  assert.doesNotMatch(byId(rootOf('start-veil'), 'start-veil').textContent, /Chapter/);
});

test('a shared win says whether it beat the author', () => {
  const r = solve(initial(trialLevel(9)));
  assert.ok(r.solved);
  const moves = r.line.length;
  reset();
  outside({ kind: 'shared', name: 'Level K7QD by ABC', best: moves + 1 });
  win(9);
  assert.equal(text('end-kicker'), 'Shared level');
  assert.equal(text('end-text'), `You found the way on your own. You beat the author's ${moves + 1}.`);
  reset();
  outside({ kind: 'shared', name: 'Level K7QD by ABC', best: moves });
  win(9);
  assert.equal(text('end-text'), `You found the way on your own. The author's best is ${moves}.`, 'a tie does not beat it');
});

test('an outside level offers no next level and no levels list', () => {
  reset();
  outside({ kind: 'shared', name: 'Level K7QD by ABC', best: null });
  game.open(9);
  assert.equal(flow.top(), 'start');
  assert.equal(el('start-best'), undefined, 'a shared level with no best names none');
  win(9);
  assert.equal(flow.top(), 'end', 'no closing card opens over it');
  for (const id of ['end-next', 'end-trials', 'end-pages']) assert.equal(el(id), undefined, id);
  assert.ok(el('end-retry'));
  key('Enter');
  assert.equal(game.trial, 9, 'Enter does not go on to another level');
});

test('a level from outside the campaign with a story page takes it with no Lore entry and no pause', () => {
  reset();
  // Level 9 with its page made a relic: the solver's line must take it, and the same line wins the real level.
  const lv = trialLevel(8);
  const copy = { ...lv, objects: lv.objects.map(o => (o === 'page' ? 'relic' as const : o)), relics: lv.relics + 1, pageIds: [], pageCells: [] };
  const r = solve(initial(copy));
  assert.ok(r.solved);
  assert.ok(lv.pageIds.length > 0, 'the level has a page');
  reduced = false;
  outsideLevel = lv;
  outside({ kind: 'try', name: 'Your level', best: null });
  game.open(9);
  key('Enter');
  for (const a of r.line) {
    game.press(a);
    m.advance(5000);
    frame();
    assert.notEqual(flow.top(), 'lore', 'no Lore entry opens');
    assert.equal(game.anim?.paused ?? null, null, 'the animation is never paused at a page');
  }
  assert.equal(game.run!.now.outcome, 'won');
  assert.equal(flow.top(), 'end');
  assert.equal(game.found.length, 0, 'no page is recorded');
});

test('an outside win records no progress', () => {
  reset();
  outside({ kind: 'try', name: 'Your level', best: null });
  win(9);
  assert.equal(cleared.size, 0);
  assert.doesNotMatch(text('end-score'), /best/);
});

test('Back to the editor shows in the menu and on the end card only for a try', () => {
  reset();
  const menuEditor = () => {
    flow.closeLayers();
    click(byId(document.getElementById('status-root')!, 'btn-menu'));
    assert.equal(flow.top(), 'menu');
    return el('menu-editor');
  };
  win(9);
  assert.equal(el('end-editor'), undefined, 'not after a campaign level');
  assert.equal(menuEditor(), undefined);
  reset();
  outside({ kind: 'shared', name: 'Level K7QD by ABC', best: null });
  win(9);
  assert.equal(el('end-editor'), undefined, 'not after a shared level');
  assert.equal(menuEditor(), undefined);
  reset();
  outside({ kind: 'try', name: 'Your level', best: null });
  win(9);
  assert.match(text('end-editor'), /Back to the editor/);
  click(el('end-editor')!);
  assert.equal(backs, 1);
  const button = menuEditor();
  assert.ok(button);
  assert.match(button.textContent, /Back to the editor/);
  click(button);
  assert.equal(backs, 2);
});

test('the title card offers Make a level when the page gives it, with its key', () => {
  const root = makeEl('title-root');
  renderTitleCard(root, { open: true, hint: false, onPlay() {} });
  assert.equal(maybeById(root, 'title-editor'), undefined);
  let made = 0;
  renderTitleCard(root, { open: true, hint: false, onPlay() {}, onEditor: () => { made++; } });
  assert.equal(byId(root, 'title-editor').textContent, `Make a level${KEYS.editor.label}`);
  click(byId(root, 'title-editor'));
  assert.equal(made, 1);
});

test('Make a level on the title card opens the editor layer', () => {
  reset();
  flow.showTitle(false);
  click(byId(rootOf('title-editor'), 'title-editor'));
  assert.equal(flow.top(), 'editor');
  assert.deepEqual(edits, ['open']);
  reset();
  flow.showTitle(false);
  key('e');
  assert.equal(flow.top(), 'editor', 'E on the title card');
  assert.deepEqual(edits, ['open']);
  reset();
  game.open(0);
  key('Enter');
  key('e');
  assert.equal(flow.top(), null, 'E is a title card key only');
  assert.deepEqual(edits, []);
});

test('game keys do nothing while the editor is open', () => {
  reset();
  game.open(0);
  key('Enter');
  const at = game.run!.now.player;
  flow.showEditor();
  for (const k of ['ArrowRight', 'ArrowDown', 'd', 's', 'n', 'm', 'h', '.']) key(k);
  assert.deepEqual(game.run!.now.player, at, 'an arrow key moves no figure');
  assert.equal(game.run!.now.moves, 0);
  assert.equal(flow.top(), 'editor', 'N opens no level list over the editor');
  assert.deepEqual(editorKeys, ['ArrowRight', 'ArrowDown', 'd', 's', 'n', 'm', 'h', '.']);
});

test('Q in the editor closes it to the title card', () => {
  reset();
  flow.showEditor();
  edits.length = 0;
  const ev = key('q');
  assert.equal(ev.prevented, true);
  assert.equal(flow.top(), 'title');
  assert.deepEqual(edits, ['close', 'left']);
  assert.deepEqual(editorKeys, ['q'], 'the editor sees Q first, to close a dialog of its own');
  fireDocument('keydown', { key: 'q', repeat: true, target: { tagName: 'DIV' } });
  assert.equal(flow.top(), 'title', 'a held Q does not go on to open the menu');
});
