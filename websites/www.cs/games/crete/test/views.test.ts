// Crete's frame views in the DOM stub: the ids the CSS and the browser specs use, the order of the menu, that
// every key tab prints what the key table says, and that each control calls back.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { render as preactRender } from 'preact';
import type { ComponentChildren } from 'preact';
import { importTsx } from '../../_kit/test/tsx.ts';
import { asElement, byId, click, document, fire, installDocument, makeEl, maybeById, renderTarget, submit, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { TOOLS } from '../src/puzzle/tiles.ts';
import type { Tool } from '../src/puzzle/tiles.ts';
import { KEYS } from '../src/keys.ts';
import type { Action } from '../src/keys.ts';
import { statusView } from '../src/status.ts';
import { helpLines } from '../src/help.ts';
import type { StatusProps } from '../src/ui/status.tsx';
import type { StripProps, ToolRow } from '../src/ui/strip.tsx';
import type { MenuProps } from '../src/ui/menu.tsx';
import type { LevelsProps } from '../src/ui/levels.tsx';
import type { ChapterCardProps } from '../src/ui/chapter.tsx';
import type { StartProps } from '../src/ui/start.tsx';
import type { LoreProps, LoreEntry } from '../src/ui/lore.tsx';
import { CHAPTERS, nextChapter } from '../src/campaign/chapters.ts';

installDocument();
const views = await importTsx<{
  status: typeof import('../src/ui/status.tsx');
  strip: typeof import('../src/ui/strip.tsx');
  menu: typeof import('../src/ui/menu.tsx');
  levels: typeof import('../src/ui/levels.tsx');
  chapter: typeof import('../src/ui/chapter.tsx');
  start: typeof import('../src/ui/start.tsx');
  lore: typeof import('../src/ui/lore.tsx');
}>(import.meta.dirname, {
  status: '../src/ui/status.tsx', strip: '../src/ui/strip.tsx', menu: '../src/ui/menu.tsx', levels: '../src/ui/levels.tsx',
  chapter: '../src/ui/chapter.tsx', start: '../src/ui/start.tsx', lore: '../src/ui/lore.tsx',
});
const renderStatus = (root: StubElement, p: StatusProps): void => views.status.renderStatus(asElement(root), p);
const renderStrip = (root: StubElement, p: StripProps): void => views.strip.renderStrip(asElement(root), p);
const renderLevels = (root: StubElement, p: LevelsProps): void => views.levels.renderLevels(asElement(root), p);
const renderChapter = (root: StubElement, p: ChapterCardProps): void => views.chapter.renderChapterCard(asElement(root), p);
const renderLore = (root: StubElement, p: LoreProps): void => views.lore.renderLore(asElement(root), p);
const renderStart = (root: StubElement, p: StartProps): void => views.start.renderStart(asElement(root), p);
const renderMenu = (root: StubElement, p: MenuProps): void => views.menu.renderMenu(asElement(root), p);
const render = (vnode: ComponentChildren, root: StubElement): void => preactRender(vnode, renderTarget(root));

const roots: StubElement[] = [];
const mount = () => { const root = makeEl('root'); roots.push(root); return root; };
afterEach(() => {
  for (const root of roots.splice(0)) render(null, root);
  document.activeElement = null;
  globalThis.__focused = null;
});
const noop = () => {};
const tabsOf = (el: StubElement) => walk(el).filter(n => n.localName === 'kbd');

// ---- status bar ----
const VIEW = statusView({ trial: 'Ch. 1 • Level 3/10', trialNote: 'Chapter 1, Level 3: The Doors of Daedalus', hearts: 2, relicsLeft: 1, keys: { red: 1, blue: 0, yellow: 0, green: 2 }, gear: ['flippers'], moves: 12, stone: 0 });

test('the status bar shows Level, Hearts, Relics, Keys, Gear and Moves, and a Menu button with its Q tab', () => {
  const root = mount();
  let opened = 0;
  renderStatus(root, { view: VIEW, menuKey: KEYS.menu.label, onMenu: () => { opened++; } });
  assert.deepEqual(['hud-trial', 'hud-hearts', 'hud-relics', 'hud-keys', 'hud-gear', 'hud-moves'].map(id => byId(root, id).textContent),
    ['Ch. 1 • Level 3/10', '♥ 2', '1', '🔴1 🟢2', 'flippers', '12']);
  assert.equal(byId(root, 'hud-trial').getAttribute('aria-label'), 'Chapter 1, Level 3: The Doors of Daedalus');
  assert.equal((byId(root, 'hud-trial').parentNode as StubElement).getAttribute('title'), 'Chapter 1, Level 3: The Doors of Daedalus');
  const menu = byId(root, 'btn-menu');
  const trialStat = byId(root, 'hud-trial').parentNode as StubElement;
  assert.equal(trialStat.textContent.startsWith('Level'), true, 'the first stat is labelled Level, for a screen reader');
  assert.equal(walk(trialStat).find(n => n.localName === 'dt')?.className, 'sr', 'and only for a screen reader');
  assert.equal(menu.className, 'menu-btn');
  const [tab] = tabsOf(menu);
  assert.ok(tab);
  assert.equal(tab.className, 'kit-key-tab');
  assert.equal(tab.textContent, KEYS.menu.label);
  assert.equal(tab.getAttribute('aria-hidden'), 'true');
  click(menu);
  assert.equal(opened, 1);
});

test('hearts and keys carry their long form as a tooltip; nothing held shows a dash', () => {
  const root = mount();
  renderStatus(root, { view: statusView({ trial: '1/8', hearts: 1, relicsLeft: 0, keys: { red: 0, blue: 0, yellow: 0, green: 0 }, gear: [], moves: 0, stone: 2 }), menuKey: 'Q', onMenu: noop });
  const stat = (id: string) => byId(root, id).parentNode as StubElement;
  assert.match(stat('hud-hearts').getAttribute('title') ?? '', /1 heart left; the Minotaur is stone for 2 turns/);
  assert.equal(stat('hud-keys').getAttribute('title'), 'no keys');
  assert.equal(byId(root, 'hud-keys').textContent, '–');
  assert.equal(byId(root, 'hud-gear').textContent, '–');
});

// ---- control strip ----
const TOOL_KINDS = Object.keys(TOOLS) as Tool[];
const ROWS: ToolRow[] = TOOL_KINDS.map((kind, i) => ({
  kind, emoji: '·', name: TOOLS[kind].name, key: TOOLS[kind].key, count: i, desc: TOOLS[kind].desc, disabled: i === 0,
}));
function stripProps(over: Partial<StripProps> = {}): StripProps {
  return {
    tools: ROWS, playing: false, route: false, over: false, look: 'modern', compact: false, threadOpen: false,
    onThread: noop, onMove: noop, onWait: noop, onUndo: noop, onRestart: noop, onHint: noop, onRoute: noop, onAuto: noop, onTool: noop, onLook: noop, onMenu: noop, ...over,
  };
}

test('every strip button wears a tab that prints what the key table says', () => {
  const root = mount();
  renderStrip(root, stripProps());
  const expected: [string, Action][] = [
    ['wait', 'wait'], ['undo', 'undo'], ['restart', 'restart'], ['hint', 'hint'], ['route', 'route'], ['auto', 'auto'], ['look', 'look'],
  ];
  for (const [id, action] of expected) {
    const tab = tabsOf(byId(root, `btn-${id}`))[0];
    assert.ok(tab, id);
    assert.equal(tab.textContent, KEYS[action].label, id);
    assert.equal(tab.getAttribute('data-keyhint'), action);
  }
  const pad = walk(root).filter(n => n.className.startsWith('mv mv-'));
  assert.deepEqual(pad.map(b => b.className), ['mv mv-up', 'mv mv-left', 'mv mv-right', 'mv mv-down']);
  const padActions: Action[] = ['up', 'left', 'right', 'down'];
  pad.forEach((b, i) => assert.equal(tabsOf(b)[0]?.textContent, KEYS[padActions[i]!].label));
  for (const row of ROWS) assert.equal(tabsOf(byId(root, `tool-${row.kind}`))[0]?.textContent, row.key);
  assert.equal(maybeById(root, 'btn-bash'), undefined);
});

test('the Map button wears Map in Modern and 3D in Classic, is named for the look it swaps to, asks for it, and holds the face it is given', () => {
  const root = mount();
  const asked: string[] = [];
  const face = document.createElement('canvas') as unknown as HTMLCanvasElement;
  const held = () => (face.parentNode as unknown as { parentNode: unknown } | null)?.parentNode === btn();
  renderStrip(root, stripProps({ look: 'modern', thumb: face, onLook: l => asked.push(l) }));
  const btn = () => byId(root, 'btn-look');
  assert.match(btn().textContent, /^Map/);
  assert.equal(btn().getAttribute('aria-label'), 'Switch to Classic');
  assert.ok(held(), 'the face sits in the button');
  click(btn());
  renderStrip(root, stripProps({ look: 'classic', thumb: face, onLook: l => asked.push(l) }));
  assert.match(btn().textContent, /^3D/);
  assert.equal(btn().getAttribute('aria-label'), 'Switch to Modern');
  assert.ok(held(), 'still there after a redraw');
  click(btn());
  assert.deepEqual(asked, ['classic', 'modern']);
});

test('the pad, Wait, Undo, Restart, the thread and the tools call back', () => {
  const root = mount();
  const seen: string[] = [];
  renderStrip(root, stripProps({
    onMove: d => seen.push(`move:${d}`), onWait: () => seen.push('wait'), onUndo: () => seen.push('undo'), onRestart: () => seen.push('restart'),
    onHint: () => seen.push('hint'), onRoute: () => seen.push('route'), onAuto: () => seen.push('auto'), onTool: k => seen.push(`tool:${k}`),
  }));
  for (const b of walk(root).filter(n => n.className.startsWith('mv '))) click(b);
  for (const id of ['btn-wait', 'btn-undo', 'btn-restart', 'btn-hint', 'btn-route', 'btn-auto']) click(byId(root, id));
  click(byId(root, 'tool-cake'));
  assert.deepEqual(seen, ['move:up', 'move:left', 'move:right', 'move:down', 'wait', 'undo', 'restart', 'hint', 'route', 'auto', 'tool:cake']);
});

test('an unusable tool cannot be pressed, Route and Auto show when on, and a finished try keeps Undo and Restart', () => {
  const root = mount();
  renderStrip(root, stripProps({ playing: true, route: true, over: true }));
  assert.equal(byId(root, 'tool-mirror').disabled, true);
  assert.equal(byId(root, 'tool-cake').disabled, false);
  assert.equal(byId(root, 'btn-auto').getAttribute('aria-pressed'), 'true');
  assert.equal(byId(root, 'btn-route').getAttribute('aria-pressed'), 'true');
  assert.equal(byId(root, 'btn-wait').disabled, true);
  assert.equal(byId(root, 'btn-undo').disabled, false);
  assert.equal(byId(root, 'btn-restart').disabled, false);
  assert.equal(walk(root).filter(n => n.className.startsWith('mv ')).every(b => b.disabled), true);
});

test('the pad is a plus: up, then left and right on one row with an empty centre between them, then down', () => {
  const root = mount();
  renderStrip(root, stripProps());
  const pad = walk(root).find(n => n.className === 'pad')!;
  const cells = pad.children.map(c => (c as StubElement).className);
  assert.deepEqual(cells, ['mv mv-up', 'mv mv-left', 'pad-hub', 'mv mv-right', 'mv mv-down']);
  const hub = walk(pad).find(n => n.className === 'pad-hub')!;
  assert.equal(hub.localName, 'span');
  assert.equal(hub.getAttribute('aria-hidden'), 'true');
});

test('on a wide strip Hint, Route and Auto stand in the strip and there is no Thread button', () => {
  const root = mount();
  renderStrip(root, stripProps({ compact: false }));
  for (const id of ['btn-hint', 'btn-route', 'btn-auto']) assert.ok(maybeById(root, id), id);
  assert.equal(maybeById(root, 'btn-thread'), undefined);
  assert.equal(maybeById(root, 'thread-panel'), undefined);
});

test('on a phone the thread is one Hints button whose panel, shut until asked, holds Hint, Route and Auto', () => {
  const root = mount();
  const asked: boolean[] = [];
  renderStrip(root, stripProps({ compact: true, onThread: o => asked.push(o) }));
  const thread = byId(root, 'btn-thread');
  assert.equal(thread.textContent?.trim(), 'Hints');
  assert.match(thread.getAttribute('aria-label') ?? '', /^Hints/);
  assert.equal(thread.getAttribute('aria-expanded'), 'false');
  assert.equal(thread.getAttribute('aria-controls'), 'thread-panel');
  assert.equal(byId(root, 'thread-panel').hidden, true);
  click(thread);
  assert.deepEqual(asked, [true]);
  renderStrip(root, stripProps({ compact: true, threadOpen: true, onThread: o => asked.push(o) }));
  assert.equal(byId(root, 'btn-thread').getAttribute('aria-expanded'), 'true');
  const panel = byId(root, 'thread-panel');
  assert.equal(panel.hidden, false);
  for (const id of ['btn-hint', 'btn-route', 'btn-auto']) {
    assert.equal(walk(panel).includes(byId(root, id)), true, `${id} is in the panel`);
    assert.equal(tabsOf(byId(root, id))[0]?.textContent, KEYS[id.slice(4) as Action].label);
  }
  click(byId(root, 'btn-thread'));
  assert.deepEqual(asked, [true, false], 'a second tap shuts it');
});

test('a choice in the Thread panel acts, shuts the panel and gives the focus back to Thread', () => {
  const root = mount();
  const seen: string[] = [];
  renderStrip(root, stripProps({
    compact: true, threadOpen: true, onThread: o => seen.push(`open:${o}`),
    onHint: () => seen.push('hint'), onRoute: () => seen.push('route'), onAuto: () => seen.push('auto'),
  }));
  for (const id of ['btn-hint', 'btn-route', 'btn-auto']) {
    globalThis.__focused = null;
    click(byId(root, id));
    assert.equal(globalThis.__focused, byId(root, 'btn-thread'), id);
  }
  assert.deepEqual(seen, ['hint', 'open:false', 'route', 'open:false', 'auto', 'open:false']);
});

test('the Thread button shows on while the route is drawn or the play-out runs, and the panel shows which', () => {
  const root = mount();
  renderStrip(root, stripProps({ compact: true }));
  assert.equal(byId(root, 'btn-thread').className, 'thread-btn');
  renderStrip(root, stripProps({ compact: true, route: true }));
  assert.equal(byId(root, 'btn-thread').className, 'thread-btn on');
  assert.match(byId(root, 'btn-thread').getAttribute('aria-label') ?? '', /drawn/);
  renderStrip(root, stripProps({ compact: true, playing: true, threadOpen: true }));
  assert.equal(byId(root, 'btn-thread').className, 'thread-btn on');
  assert.match(byId(root, 'btn-thread').getAttribute('aria-label') ?? '', /playing/);
  assert.equal(byId(root, 'btn-auto').getAttribute('aria-pressed'), 'true');
  assert.equal(byId(root, 'btn-route').getAttribute('aria-pressed'), 'false');
});

test('a tool names itself, its count and what it does to a screen reader', () => {
  const root = mount();
  renderStrip(root, stripProps());
  const row = ROWS[1]!;
  assert.equal(byId(root, `tool-${row.kind}`).getAttribute('aria-label'), `${row.name} × ${row.count}. ${row.desc}`);
  assert.equal(byId(root, `tool-${row.kind}`).getAttribute('title'), row.desc);
});

// ---- menu ----
function menuProps(over: Partial<MenuProps> = {}): MenuProps {
  return {
    open: true, muted: false, music: true, background: true, fullscreen: false, look: 'modern', walls: 'solid', pad: 'left', minimap: false,
    log: [{ text: 'The Mouth of the Labyrinth', tone: 'info' }, { text: 'Taken: a relic.', tone: 'good' }],
    help: helpLines(KEYS, TOOLS),
    onSound: noop, onMusic: noop, onBackground: noop, onFullscreen: noop, onWalls: noop, onPad: noop, onMinimap: noop, onViewTips: noop, onLore: noop, onDictionary: noop, onQuit: noop, onClose: noop, ...over,
  };
}

test('the menu holds sound and full screen, the story log, how to play and Quit, in that order, and no seed box', () => {
  const root = mount();
  renderMenu(root, menuProps());
  const veil = byId(root, 'menu-veil');
  assert.equal(veil.hidden, false);
  assert.equal(byId(root, 'menu-title').textContent, 'Menu');
  assert.deepEqual(walk(veil).map(n => n.getAttribute('data-section')).filter(Boolean), ['audio', 'look', 'walls', 'pad', 'lore', 'dictionary', 'log', 'help', 'quit']);
  for (const gone of ['seed-form', 'seed-input', 'random-run', 'run-stats']) assert.equal(maybeById(root, gone), undefined, gone);
  assert.equal(walk(veil).some(n => n.className === 'menu-empty'), false, 'a log with lines says nothing of being empty');
  renderMenu(root, menuProps({ log: [] }));
  assert.equal(walk(byId(root, 'menu-veil')).some(n => n.className === 'menu-empty'), true, 'an empty log says so');
});

test('the menu\'s kicker names the level\'s place, and its name stands under the title; with neither it names the game', () => {
  const root = mount();
  const kicker = () => walk(byId(root, 'menu-veil')).find(n => n.className === 'kicker')?.textContent;
  renderMenu(root, menuProps({ place: 'Ch. 1 • Level 3/10', levelName: 'The Doors of Daedalus' }));
  assert.equal(kicker(), 'Ch. 1 • Level 3/10');
  assert.equal(byId(root, 'menu-level').textContent, 'The Doors of Daedalus');
  renderMenu(root, menuProps({ place: 'Shared level', levelName: 'Level K7QD by ABC' }));
  assert.equal(kicker(), 'Shared level');
  assert.equal(byId(root, 'menu-level').textContent, 'Level K7QD by ABC');
  renderMenu(root, menuProps());
  assert.equal(kicker(), 'The Island of Crete');
  assert.equal(maybeById(byId(root, 'menu-veil'), 'menu-level'), undefined);
});

test('the menu has no Look setting, and offers Solid, Ghosted and Low only while the look is modern', () => {
  const root = mount();
  const seen: string[] = [];
  renderMenu(root, menuProps({ look: 'modern', walls: 'ghosted', onWalls: w => seen.push(w) }));
  const pressed = (id: string) => byId(root, id).getAttribute('aria-pressed');
  assert.equal(maybeById(root, 'look-modern'), undefined);
  assert.equal(maybeById(root, 'look-classic'), undefined);
  assert.deepEqual(['walls-solid', 'walls-ghosted', 'walls-low'].map(pressed), ['false', 'true', 'false']);
  click(byId(root, 'walls-low'));
  assert.deepEqual(seen, ['low']);
  renderMenu(root, menuProps({ look: 'classic' }));
  assert.equal(maybeById(root, 'walls-solid'), undefined);
});

test('the menu has no View choice: the modern camera is one free camera, and Walls shows whenever the look is modern', () => {
  const root = mount();
  renderMenu(root, menuProps());
  assert.equal(maybeById(root, 'view-angled'), undefined);
  assert.equal(maybeById(root, 'view-top'), undefined);
  assert.ok(maybeById(root, 'walls-solid'), 'Walls shows in Modern');
  renderMenu(root, menuProps({ look: 'classic' }));
  assert.equal(maybeById(root, 'walls-solid'), undefined, 'Classic has no walls to choose');
});

test('the menu has a Mini map switch, off by default, only while the look is modern', () => {
  const root = mount();
  let flips = 0;
  renderMenu(root, menuProps({ onMinimap: () => flips++ }));
  assert.equal(byId(root, 'minimap-switch').getAttribute('aria-checked'), 'false');
  click(byId(root, 'minimap-switch'));
  assert.equal(flips, 1);
  renderMenu(root, menuProps({ minimap: true }));
  assert.equal(byId(root, 'minimap-switch').getAttribute('aria-checked'), 'true');
  renderMenu(root, menuProps({ look: 'classic', minimap: true }));
  assert.equal(maybeById(root, 'minimap-switch'), undefined, 'Classic never shows it');
});

test('the menu has Show View Tips, with its key, only while the look is modern', () => {
  const root = mount();
  let asked = 0;
  renderMenu(root, menuProps({ onViewTips: () => asked++ }));
  const b = byId(root, 'menu-view-tips');
  assert.match(b.textContent ?? '', /Show View Tips/);
  assert.equal(tabsOf(b)[0]?.textContent, KEYS.tips.label);
  click(b);
  assert.equal(asked, 1);
  renderMenu(root, menuProps({ look: 'classic' }));
  assert.equal(maybeById(root, 'menu-view-tips'), undefined, 'Classic has no view tips');
});

test('the menu has a Lore Book button that calls back', () => {
  const root = mount();
  let opened = 0;
  renderMenu(root, menuProps({ onLore: () => { opened++; } }));
  assert.ok(byId(root, 'menu-lore').textContent.includes('Lore Book'));
  click(byId(root, 'menu-lore'));
  assert.equal(opened, 1);
});

test('the menu waits hidden until opened, and a first button takes focus so Q still closes it', () => {
  const root = mount();
  renderMenu(root, menuProps({ open: false }));
  assert.equal(byId(root, 'menu-veil').hidden, true);
  renderMenu(root, menuProps({ open: true }));
  assert.equal(globalThis.__focused?.id, 'menu-close');
});

test('Sound shows its state and key; Full screen, Quit and Close call back', () => {
  const root = mount();
  const seen: string[] = [];
  renderMenu(root, menuProps({ muted: true, onSound: () => seen.push('sound'), onFullscreen: () => seen.push('full'), onQuit: () => seen.push('quit'), onClose: () => seen.push('close') }));
  assert.equal(byId(root, 'mute').getAttribute('role'), 'switch');
  assert.equal(byId(root, 'mute').getAttribute('aria-checked'), 'false', 'muted: the Sound switch is off');
  assert.equal(tabsOf(byId(root, 'mute'))[0]?.textContent, KEYS.mute.label);
  assert.equal(tabsOf(byId(root, 'menu-close'))[0]?.textContent, KEYS.menu.label);
  for (const id of ['mute', 'fullscreen', 'quit', 'menu-close']) click(byId(root, id));
  assert.deepEqual(seen, ['sound', 'full', 'quit', 'close']);
  renderMenu(root, menuProps({ fullscreen: true }));
  assert.equal(byId(root, 'fullscreen').getAttribute('aria-checked'), 'true');
});

test('the story log lists every line; how to play comes from the help lines', () => {
  const root = mount();
  renderMenu(root, menuProps());
  const lines = byId(root, 'log').children.map(c => (c as StubElement).textContent);
  assert.deepEqual(lines, ['The Mouth of the Labyrinth', 'Taken: a relic.']);
  const help = walk(byId(root, 'menu-veil')).filter(n => n.className === 'help');
  assert.equal(help.length, 1);
  assert.equal(help[0]!.children.length, helpLines(KEYS, TOOLS).length);
});

// ---- chapter card ----
const CH1 = CHAPTERS[0]!;
function chapterProps(over: Partial<ChapterCardProps> = {}): ChapterCardProps {
  return { open: true, chapter: CH1, closing: false, next: nextChapter(1), onEnter: noop, onLevels: noop, onClose: noop, ...over };
}

test('the opening chapter card shows the kicker, name, words and quotation, with Enter the Halls and Levels', () => {
  const root = mount();
  const seen: string[] = [];
  renderChapter(root, chapterProps({ open: false }));
  assert.equal(byId(root, 'chapter-veil').hidden, true);
  renderChapter(root, chapterProps({ onEnter: () => seen.push('enter'), onLevels: () => seen.push('levels') }));
  assert.equal(byId(root, 'chapter-veil').hidden, false);
  assert.equal(byId(root, 'chapter-kicker').textContent, 'Chapter 1 of 10');
  assert.equal(byId(root, 'chapter-title').textContent, 'The Outer Halls');
  assert.equal(byId(root, 'chapter-text').textContent, CH1.lore!.opening.text);
  const quote = walk(byId(root, 'chapter-veil')).find(n => n.localName === 'blockquote');
  assert.ok(quote, 'a blockquote');
  assert.ok(quote.textContent.includes(CH1.lore!.opening.quote!.text));
  const cite = walk(quote).find(n => n.localName === 'cite');
  assert.equal(cite?.textContent, CH1.lore!.opening.quote!.cite);
  assert.equal(globalThis.__focused?.id, 'chapter-enter');
  assert.equal(tabsOf(byId(root, 'chapter-enter'))[0]?.textContent, KEYS.begin.label);
  assert.equal(tabsOf(byId(root, 'chapter-levels'))[0]?.textContent, KEYS.new.label);
  assert.ok(byId(root, 'chapter-enter').textContent.includes('Enter the Halls'));
  assert.ok(byId(root, 'chapter-levels').textContent.includes('Levels'));
  click(byId(root, 'chapter-enter'));
  click(byId(root, 'chapter-levels'));
  assert.deepEqual(seen, ['enter', 'levels']);
  assert.equal(maybeById(root, 'chapter-continue'), undefined);
  assert.equal(maybeById(root, 'chapter-next'), undefined);
  renderChapter(root, chapterProps({ score: 'Level 10 cleared: 76 moves' }));
  assert.equal(maybeById(root, 'chapter-score'), undefined, 'the opening card has no score line');
});

test('the closing chapter card says it is the end of the chapter, with its words and only On to Chapter 2; the next chapter, released, gets no line', () => {
  const root = mount();
  let closed = 0;
  renderChapter(root, chapterProps({ closing: true, onClose: () => { closed++; } }));
  assert.equal(byId(root, 'chapter-kicker').textContent, 'End of Chapter 1');
  assert.equal(byId(root, 'chapter-title').textContent, 'The Outer Halls');
  assert.ok(byId(root, 'chapter-continue').textContent.includes('On to Chapter 2'));
  assert.equal(tabsOf(byId(root, 'chapter-continue'))[0]?.textContent, KEYS.begin.label);
  assert.equal(byId(root, 'chapter-text').textContent, CH1.lore!.closing.text);
  const quote = walk(byId(root, 'chapter-veil')).find(n => n.localName === 'blockquote');
  assert.ok(quote?.textContent.includes(CH1.lore!.closing.quote!.text));
  assert.equal(maybeById(root, 'chapter-next'), undefined, 'Chapter 2 is released');
  assert.equal(maybeById(root, 'chapter-enter'), undefined);
  assert.equal(maybeById(root, 'chapter-levels'), undefined);
  assert.equal(globalThis.__focused?.id, 'chapter-continue');
  assert.equal(maybeById(root, 'chapter-score'), undefined, 'no win, no score line');
  renderChapter(root, chapterProps({ closing: true, score: 'Level 10 cleared: 80 moves · best possible 76 (4 over)', onClose: () => { closed++; } }));
  assert.equal(byId(root, 'chapter-score').textContent, 'Level 10 cleared: 80 moves · best possible 76 (4 over)');
  click(byId(root, 'chapter-continue'));
  assert.equal(closed, 1);
});

test("Chapter 2's closing card says Chapter 3 is not yet released, and its button is Continue", () => {
  const root = mount();
  const two = CHAPTERS[1]!;
  renderChapter(root, chapterProps({ chapter: two, closing: true, next: nextChapter(2) }));
  assert.equal(byId(root, 'chapter-kicker').textContent, 'End of Chapter 2');
  assert.equal(byId(root, 'chapter-title').textContent, 'The Winding Ways');
  assert.equal(byId(root, 'chapter-text').textContent, two.lore!.closing.text);
  assert.equal(byId(root, 'chapter-next').textContent, 'Chapter 3 is not yet released');
  assert.ok(byId(root, 'chapter-continue').textContent.includes('Continue'));
  assert.doesNotMatch(byId(root, 'chapter-continue').textContent, /On to/);
});

// ---- levels list ----
const LEVEL_ROWS = [
  { title: 'The Mouth of the Labyrinth', status: 'cleared · best 14' },
  { title: 'The Tribute Relics', status: 'cleared with help' },
  { title: 'The Doors of Daedalus', status: 'not yet' },
];
function levelsProps(over: Partial<LevelsProps> = {}): LevelsProps {
  return { open: true, chapters: CHAPTERS, shown: 1, rows: LEVEL_ROWS, current: -1, onPick: noop, onTab: noop, onClose: noop, ...over };
}

test('the levels list has a button per level with its title and standing, and picking one reports its index', () => {
  const root = mount();
  const seen: number[] = [];
  renderLevels(root, levelsProps({ onPick: i => seen.push(i) }));
  assert.equal(byId(root, 'levels-veil').hidden, false);
  assert.equal(byId(root, 'levels-title').textContent, 'Levels');
  LEVEL_ROWS.forEach((r, i) => {
    const b = byId(root, `level-${i + 1}`);
    assert.ok(b.textContent.includes(r.title), r.title);
    assert.ok(b.textContent.includes(r.status), r.status);
    assert.equal(b.disabled, false);
    click(b);
  });
  assert.deepEqual(seen, [0, 1, 2]);
});

test('the levels list has ten chapter tabs: chapter 1 pressed, chapter 2 open, the rest disabled and marked soon', () => {
  const root = mount();
  const seen: number[] = [];
  renderLevels(root, levelsProps({ onTab: n => seen.push(n) }));
  for (let n = 1; n <= 10; n++) {
    const tab = byId(root, `levels-tab-${n}`);
    assert.equal(tab.getAttribute('aria-pressed'), n === 1 ? 'true' : 'false', `tab ${n}`);
    assert.equal(tab.disabled, n > 2, `tab ${n}`);
    assert.equal(tab.textContent, n <= 2 ? `Ch ${n}` : `Ch ${n} · soon`, `tab ${n}`);
  }
  click(byId(root, 'levels-tab-1'));
  click(byId(root, 'levels-tab-2'));
  assert.deepEqual(seen, [1, 2]);
});

test('the levels list waits hidden, focuses the level in play, and closes with a button tabbed with Q', () => {
  const root = mount();
  let closed = 0;
  renderLevels(root, levelsProps({ open: false }));
  assert.equal(byId(root, 'levels-veil').hidden, true);
  renderLevels(root, levelsProps({ current: 1, onClose: () => { closed++; } }));
  assert.equal(globalThis.__focused?.id, 'level-2');
  assert.equal(byId(root, 'level-2').getAttribute('aria-pressed'), 'true');
  assert.equal(byId(root, 'level-1').getAttribute('aria-pressed'), 'false');
  assert.equal(tabsOf(byId(root, 'levels-close'))[0]?.textContent, KEYS.menu.label);
  click(byId(root, 'levels-close'));
  assert.equal(closed, 1);
});

// ---- start card ----
test('the start card names the chapter and the level in its kicker', () => {
  const root = mount();
  renderStart(root, { open: true, chapter: 1, number: 3, title: 'The Doors of Daedalus', intro: 'Doors.', onBegin: noop });
  assert.equal(byId(root, 'start-veil').hidden, false);
  assert.equal(walk(byId(root, 'start-veil')).find(n => n.className === 'kicker')?.textContent, 'Chapter 1 · Level 3');
  assert.equal(byId(root, 'start-title').textContent, 'The Doors of Daedalus');
});

// ---- story ----
test('the story card tells the myth, closes with a button, and waits hidden until opened', async () => {
  const story = await importTsx<{ s: typeof import('../src/ui/story.tsx') }>(import.meta.dirname, { s: '../src/ui/story.tsx' });
  const root = mount();
  let closed = 0;
  story.s.renderStoryCard(asElement(root), { open: false, onClose: () => { closed++; } });
  assert.equal(byId(root, 'story-veil').hidden, true);
  story.s.renderStoryCard(asElement(root), { open: true, onClose: () => { closed++; } });
  assert.equal(byId(root, 'story-veil').hidden, false);
  assert.equal(byId(root, 'story-title').textContent, 'The Labyrinth');
  const text = walk(byId(root, 'story-veil')).filter(n => n.className === 'story-text').map(n => n.textContent).join(' ');
  for (const word of ['Minos', 'Labyrinth', 'ship']) assert.ok(text.includes(word), word);
  assert.equal(globalThis.__focused?.id, 'story-close');
  click(byId(root, 'story-close'));
  assert.equal(closed, 1);
});

// ---- lore book ----
function loreProps(over: Partial<LoreProps> = {}): LoreProps {
  return { open: true, chapters: CHAPTERS, found: () => false, closingSeen: () => false, shown: null, onShow: noop, onClose: noop, ...over };
}
const PAGES = CH1.lore!.pages;

test('the Lore Book lists Chapters 1 and 2 with their opening cards, and chapters 3 to 10 as not yet released', () => {
  const root = mount();
  renderLore(root, loreProps({ open: false }));
  assert.equal(byId(root, 'lore-veil').hidden, true);
  renderLore(root, loreProps());
  assert.equal(byId(root, 'lore-title').textContent, 'Lore Book');
  const text = byId(root, 'lore-veil').textContent;
  assert.ok(text.includes('Chapter 1'));
  assert.ok(text.includes('The Outer Halls'));
  assert.ok(byId(root, 'lore-opening-1').textContent.includes('Opening'));
  assert.equal(maybeById(root, 'lore-closing-1'), undefined, 'the closing card waits until it has been seen');
  assert.ok(text.includes('Chapter 2 · The Winding Ways'));
  assert.ok(byId(root, 'lore-opening-2').textContent.includes('Opening'));
  assert.ok(byId(root, 'lore-page-ch2-lots').textContent.includes('hides in level 9'));
  assert.ok(byId(root, 'lore-page-ch2-black-sail').textContent.includes('hides in level 10'));
  const soon = walk(byId(root, 'lore-veil')).filter(n => n.className === 'lore-soon');
  assert.equal(soon.length, 8);
  assert.ok(soon.every(n => n.textContent.includes('Not yet released')));
});

test('a found page shows its title and where it was found; a missing one shows ? ? ? and where it hides', () => {
  const root = mount();
  renderLore(root, loreProps({ found: id => id === PAGES[0]!.id }));
  const got = byId(root, `lore-page-${PAGES[0]!.id}`);
  assert.ok(got.textContent.includes(PAGES[0]!.title));
  assert.ok(got.textContent.includes('found in level 9'));
  const lost = byId(root, `lore-page-${PAGES[1]!.id}`);
  assert.ok(lost.textContent.includes('? ? ?'));
  assert.ok(lost.textContent.includes('hides in level 10'));
  assert.ok(!lost.textContent.includes(PAGES[1]!.title));
  assert.equal(lost.disabled, true, 'a page not yet found cannot be opened');
});

test('the closing card is listed once it has been seen', () => {
  const root = mount();
  renderLore(root, loreProps({ closingSeen: n => n === 1 }));
  assert.ok(byId(root, 'lore-closing-1').textContent.includes('Closing'));
});

test('picking an entry reports it', () => {
  const root = mount();
  const seen: (LoreEntry | null)[] = [];
  renderLore(root, loreProps({ found: () => true, closingSeen: () => true, onShow: e => seen.push(e) }));
  click(byId(root, 'lore-opening-1'));
  click(byId(root, 'lore-closing-1'));
  click(byId(root, `lore-page-${PAGES[0]!.id}`));
  assert.deepEqual(seen, [
    { kind: 'card', which: 'opening', chapter: 1 },
    { kind: 'card', which: 'closing', chapter: 1 },
    { kind: 'page', id: PAGES[0]!.id },
  ]);
});

test('an open entry shows its full text, quotation and citation, with a Back button to the list', () => {
  const root = mount();
  const seen: (LoreEntry | null)[] = [];
  renderLore(root, loreProps({ found: () => true, shown: { kind: 'page', id: PAGES[0]!.id }, onShow: e => seen.push(e) }));
  assert.equal(byId(root, 'lore-entry-title').textContent, PAGES[0]!.title);
  assert.equal(byId(root, 'lore-entry-text').textContent, PAGES[0]!.text);
  const quote = walk(byId(root, 'lore-veil')).find(n => n.localName === 'blockquote');
  assert.ok(quote?.textContent.includes(PAGES[0]!.quote!.text));
  assert.equal(walk(quote!).find(n => n.localName === 'cite')?.textContent, PAGES[0]!.quote!.cite);
  assert.equal(maybeById(root, 'lore-opening-1'), undefined, 'the list is not shown under an entry');
  assert.deepEqual(tabsOf(byId(root, 'lore-back')).map(t => t.textContent), [KEYS.menu.label]);
  click(byId(root, 'lore-back'));
  assert.deepEqual(seen, [null]);
  renderLore(root, loreProps({ found: () => true, fromPickup: true, shown: { kind: 'page', id: PAGES[0]!.id }, onShow: () => {} }));
  assert.deepEqual(tabsOf(byId(root, 'lore-back')).map(t => t.textContent), [KEYS.begin.label], 'a page taken mid-level goes on with Enter');
  assert.match(byId(root, 'lore-back').textContent, /Go On/);
  renderLore(root, loreProps({ shown: { kind: 'card', which: 'closing', chapter: 1 } }));
  assert.equal(byId(root, 'lore-entry-text').textContent, CH1.lore!.closing.text);
});

test('the Lore Book closes with a button tabbed with Q', () => {
  const root = mount();
  let closed = 0;
  renderLore(root, loreProps({ onClose: () => { closed++; } }));
  assert.equal(tabsOf(byId(root, 'lore-close'))[0]?.textContent, KEYS.menu.label);
  click(byId(root, 'lore-close'));
  assert.equal(closed, 1);
});

test('a compact strip carries Menu between Hints and the look swap; a wide strip leaves Menu to the status bar', () => {
  const root = mount();
  let opened = 0;
  renderStrip(root, stripProps({ compact: true, onMenu: () => { opened++; } }));
  const menu = byId(root, 'btn-menu-strip');
  assert.equal(menu.textContent?.trim(), 'Menu');
  click(menu);
  assert.equal(opened, 1);
  const view = menu.parentElement!;
  assert.deepEqual([...view.children].map(c => (c as { id?: string }).id), ['btn-menu-strip', 'btn-look'], 'Menu sits left of the look swap');
  renderStrip(root, stripProps({ compact: false }));
  assert.equal(maybeById(root, 'btn-menu-strip'), undefined);
});
