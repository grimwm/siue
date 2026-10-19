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
import { CHAPTERS, nextChapter } from '../src/campaign/chapters.ts';

installDocument();
const views = await importTsx<{
  status: typeof import('../src/ui/status.tsx');
  strip: typeof import('../src/ui/strip.tsx');
  menu: typeof import('../src/ui/menu.tsx');
  levels: typeof import('../src/ui/levels.tsx');
  chapter: typeof import('../src/ui/chapter.tsx');
  start: typeof import('../src/ui/start.tsx');
}>(import.meta.dirname, {
  status: '../src/ui/status.tsx', strip: '../src/ui/strip.tsx', menu: '../src/ui/menu.tsx', levels: '../src/ui/levels.tsx',
  chapter: '../src/ui/chapter.tsx', start: '../src/ui/start.tsx',
});
const renderStatus = (root: StubElement, p: StatusProps): void => views.status.renderStatus(asElement(root), p);
const renderStrip = (root: StubElement, p: StripProps): void => views.strip.renderStrip(asElement(root), p);
const renderLevels = (root: StubElement, p: LevelsProps): void => views.levels.renderLevels(asElement(root), p);
const renderChapter = (root: StubElement, p: ChapterCardProps): void => views.chapter.renderChapterCard(asElement(root), p);
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
const VIEW = statusView({ trial: '3/8', hearts: 2, relicsLeft: 1, keys: { red: 1, blue: 0, yellow: 0, green: 2 }, gear: ['flippers'], moves: 12, stone: 0 });

test('the status bar shows Level, Hearts, Relics, Keys, Gear and Moves, and a Menu button with its Q tab', () => {
  const root = mount();
  let opened = 0;
  renderStatus(root, { view: VIEW, menuKey: KEYS.menu.label, onMenu: () => { opened++; } });
  assert.deepEqual(['hud-trial', 'hud-hearts', 'hud-relics', 'hud-keys', 'hud-gear', 'hud-moves'].map(id => byId(root, id).textContent),
    ['3/8', '♥ 2', '1', '🔴1 🟢2', 'flippers', '12']);
  const menu = byId(root, 'btn-menu');
  assert.equal((byId(root, 'hud-trial').parentNode as StubElement).textContent.startsWith('Level'), true, 'the first stat is labelled Level');
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
    tools: ROWS, playing: false, route: false, over: false,
    onMove: noop, onWait: noop, onUndo: noop, onRestart: noop, onHint: noop, onRoute: noop, onAuto: noop, onTool: noop, ...over,
  };
}

test('every strip button wears a tab that prints what the key table says', () => {
  const root = mount();
  renderStrip(root, stripProps());
  const expected: [string, Action][] = [
    ['wait', 'wait'], ['undo', 'undo'], ['restart', 'restart'], ['hint', 'hint'], ['route', 'route'], ['auto', 'auto'],
  ];
  for (const [id, action] of expected) {
    const tab = tabsOf(byId(root, `btn-${id}`))[0];
    assert.ok(tab, id);
    assert.equal(tab.textContent, KEYS[action].label, id);
    assert.equal(tab.getAttribute('data-keyhint'), action);
  }
  const pad = walk(root).filter(n => n.className.startsWith('mv mv-'));
  assert.deepEqual(pad.map(b => b.className), ['mv mv-up', 'mv mv-left', 'mv mv-down', 'mv mv-right']);
  const padActions: Action[] = ['up', 'left', 'down', 'right'];
  pad.forEach((b, i) => assert.equal(tabsOf(b)[0]?.textContent, KEYS[padActions[i]!].label));
  for (const row of ROWS) assert.equal(tabsOf(byId(root, `tool-${row.kind}`))[0]?.textContent, row.key);
  assert.equal(maybeById(root, 'btn-bash'), undefined);
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
  assert.deepEqual(seen, ['move:up', 'move:left', 'move:down', 'move:right', 'wait', 'undo', 'restart', 'hint', 'route', 'auto', 'tool:cake']);
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
    open: true, muted: false, fullscreen: false,
    log: [{ text: 'The Mouth of the Labyrinth', tone: 'info' }, { text: 'Taken: a relic.', tone: 'good' }],
    help: helpLines(KEYS, TOOLS),
    onSound: noop, onFullscreen: noop, onQuit: noop, onClose: noop, ...over,
  };
}

test('the menu holds sound and full screen, the story log, how to play and Quit, in that order, and no seed box', () => {
  const root = mount();
  renderMenu(root, menuProps());
  const veil = byId(root, 'menu-veil');
  assert.equal(veil.hidden, false);
  assert.equal(byId(root, 'menu-title').textContent, 'Menu');
  assert.deepEqual(walk(veil).map(n => n.getAttribute('data-section')).filter(Boolean), ['audio', 'log', 'help', 'quit']);
  for (const gone of ['seed-form', 'seed-input', 'random-run', 'run-stats']) assert.equal(maybeById(root, gone), undefined, gone);
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
  assert.match(byId(root, 'mute').textContent, /Muted/);
  assert.equal(tabsOf(byId(root, 'mute'))[0]?.textContent, KEYS.mute.label);
  assert.equal(tabsOf(byId(root, 'menu-close'))[0]?.textContent, KEYS.menu.label);
  for (const id of ['mute', 'fullscreen', 'quit', 'menu-close']) click(byId(root, id));
  assert.deepEqual(seen, ['sound', 'full', 'quit', 'close']);
  renderMenu(root, menuProps({ fullscreen: true }));
  assert.match(byId(root, 'fullscreen').textContent, /Leave full screen/);
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

test('the opening chapter card shows the kicker, name, words and quotation, with Enter the halls and Levels', () => {
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
  assert.ok(byId(root, 'chapter-enter').textContent.includes('Enter the halls'));
  assert.ok(byId(root, 'chapter-levels').textContent.includes('Levels'));
  click(byId(root, 'chapter-enter'));
  click(byId(root, 'chapter-levels'));
  assert.deepEqual(seen, ['enter', 'levels']);
  assert.equal(maybeById(root, 'chapter-continue'), undefined);
  assert.equal(maybeById(root, 'chapter-next'), undefined);
});

test('the closing chapter card shows the closing words, says the next chapter is not yet released, and has only Continue', () => {
  const root = mount();
  let closed = 0;
  renderChapter(root, chapterProps({ closing: true, onClose: () => { closed++; } }));
  assert.equal(byId(root, 'chapter-text').textContent, CH1.lore!.closing.text);
  const quote = walk(byId(root, 'chapter-veil')).find(n => n.localName === 'blockquote');
  assert.ok(quote?.textContent.includes(CH1.lore!.closing.quote!.text));
  assert.equal(byId(root, 'chapter-next').textContent, 'Chapter 2 is not yet released');
  assert.equal(maybeById(root, 'chapter-enter'), undefined);
  assert.equal(maybeById(root, 'chapter-levels'), undefined);
  assert.equal(globalThis.__focused?.id, 'chapter-continue');
  click(byId(root, 'chapter-continue'));
  assert.equal(closed, 1);
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

test('the levels list has ten chapter tabs: chapter 1 pressed, the rest disabled and marked soon', () => {
  const root = mount();
  const seen: number[] = [];
  renderLevels(root, levelsProps({ onTab: n => seen.push(n) }));
  for (let n = 1; n <= 10; n++) {
    const tab = byId(root, `levels-tab-${n}`);
    assert.equal(tab.getAttribute('aria-pressed'), n === 1 ? 'true' : 'false', `tab ${n}`);
    assert.equal(tab.disabled, n !== 1, `tab ${n}`);
    assert.equal(tab.textContent, n === 1 ? 'Ch 1' : `Ch ${n} · soon`, `tab ${n}`);
  }
  click(byId(root, 'levels-tab-1'));
  assert.deepEqual(seen, [1]);
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
