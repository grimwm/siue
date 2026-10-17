// Crete's frame views in the DOM stub: the ids the CSS and the browser specs use, the order of the menu, that
// every key tab prints what the key table says, and that each control calls back.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { render as preactRender } from 'preact';
import type { ComponentChildren } from 'preact';
import { importTsx } from '../../_kit/test/tsx.ts';
import { asElement, byId, click, document, fire, installDocument, makeEl, maybeById, renderTarget, submit, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { ITEMS } from '../src/engine.ts';
import { KEYS } from '../src/keys.ts';
import type { Action } from '../src/keys.ts';
import { statusView } from '../src/status.ts';
import { helpLines } from '../src/help.ts';
import type { StatusProps } from '../src/ui/status.tsx';
import type { StripProps, ToolRow } from '../src/ui/strip.tsx';
import type { MenuProps } from '../src/ui/menu.tsx';

installDocument();
const views = await importTsx<{
  status: typeof import('../src/ui/status.tsx');
  strip: typeof import('../src/ui/strip.tsx');
  menu: typeof import('../src/ui/menu.tsx');
}>(import.meta.dirname, { status: '../src/ui/status.tsx', strip: '../src/ui/strip.tsx', menu: '../src/ui/menu.tsx' });
const renderStatus = (root: StubElement, p: StatusProps): void => views.status.renderStatus(asElement(root), p);
const renderStrip = (root: StubElement, p: StripProps): void => views.strip.renderStrip(asElement(root), p);
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
const VIEW = statusView({ hp: 7, maxHp: 10, turns: 12, pages: 1, totalPages: 3, score: 340, fuses: 2, bashCd: 0, frozen: 0, inSafe: false, foeDist: 6 });

test('the status bar shows HP, Turns, Pages, Score, Fuses, Bash and the Minotaur, and a Menu button with its Q tab', () => {
  const root = mount();
  let opened = 0;
  renderStatus(root, { view: VIEW, menuKey: KEYS.menu.label, onMenu: () => { opened++; } });
  assert.deepEqual(['hud-hp', 'hud-turns', 'hud-pages', 'hud-score', 'hud-fuses', 'hud-bash', 'hud-dist'].map(id => byId(root, id).textContent),
    ['7/10', '12', '1/3', '340', '2', 'ready', '6']);
  const menu = byId(root, 'btn-menu');
  assert.equal(menu.className, 'menu-btn');
  const [tab] = tabsOf(menu);
  assert.ok(tab);
  assert.equal(tab.className, 'kit-key-tab');
  assert.equal(tab.textContent, KEYS.menu.label);
  assert.equal(tab.getAttribute('aria-hidden'), 'true');
  click(menu);
  assert.equal(opened, 1);
});

// ---- control strip ----
const TOOLS: ToolRow[] = (Object.keys(ITEMS) as (keyof typeof ITEMS)[]).map((kind, i) => ({
  kind, emoji: '·', name: ITEMS[kind].name, key: ITEMS[kind].key, count: i, desc: ITEMS[kind].desc, disabled: i === 0,
}));
function stripProps(over: Partial<StripProps> = {}): StripProps {
  return { tools: TOOLS, auto: false, route: false, over: false, onMove: noop, onHint: noop, onRoute: noop, onAuto: noop, onBash: noop, onTool: noop, ...over };
}

test('every strip button wears a tab that prints what the key table says', () => {
  const root = mount();
  renderStrip(root, stripProps());
  const expected: [string, string][] = [
    ['hint', KEYS.hint.label], ['route', KEYS.route.label], ['auto', KEYS.auto.label], ['bash', KEYS.bash.label],
  ];
  for (const [action, label] of expected) {
    const tab = tabsOf(byId(root, `btn-${action}`))[0];
    assert.ok(tab, action);
    assert.equal(tab.textContent, label, action);
    assert.equal(tab.getAttribute('data-keyhint'), action);
  }
  const pad = walk(root).filter(n => n.className.startsWith('mv mv-'));
  assert.deepEqual(pad.map(b => b.className), ['mv mv-up', 'mv mv-left', 'mv mv-down', 'mv mv-right']);
  const padActions: Action[] = ['up', 'left', 'down', 'right'];
  pad.forEach((b, i) => assert.equal(tabsOf(b)[0]?.textContent, KEYS[padActions[i]!].label));
  for (const row of TOOLS) assert.equal(tabsOf(byId(root, `tool-${row.kind}`))[0]?.textContent, row.key);
});

test('the pad, the actions and the tools call back', () => {
  const root = mount();
  const seen: string[] = [];
  renderStrip(root, stripProps({
    onMove: d => seen.push(`move:${d}`), onHint: () => seen.push('hint'), onRoute: () => seen.push('route'),
    onAuto: () => seen.push('auto'), onBash: () => seen.push('bash'), onTool: k => seen.push(`tool:${k}`),
  }));
  for (const b of walk(root).filter(n => n.className.startsWith('mv '))) click(b);
  for (const id of ['btn-hint', 'btn-route', 'btn-auto', 'btn-bash']) click(byId(root, id));
  click(byId(root, 'tool-snack'));
  assert.deepEqual(seen, ['move:up', 'move:left', 'move:down', 'move:right', 'hint', 'route', 'auto', 'bash', 'tool:snack']);
});

test('an unusable tool cannot be pressed, Route and Auto show when on, and moves stop with the run', () => {
  const root = mount();
  renderStrip(root, stripProps({ auto: true, route: true, over: true }));
  assert.equal(byId(root, 'tool-shard').disabled, true);
  assert.equal(byId(root, 'tool-snack').disabled, false);
  assert.equal(byId(root, 'btn-auto').getAttribute('aria-pressed'), 'true');
  assert.equal(byId(root, 'btn-route').getAttribute('aria-pressed'), 'true');
  assert.equal(byId(root, 'btn-bash').disabled, true);
  assert.equal(walk(root).filter(n => n.className.startsWith('mv ')).every(b => b.disabled), true);
});

test('a tool names itself, its count and what it does to a screen reader', () => {
  const root = mount();
  renderStrip(root, stripProps());
  const row = TOOLS[1]!;
  assert.equal(byId(root, `tool-${row.kind}`).getAttribute('aria-label'), `${row.name} × ${row.count}. ${row.desc}`);
  assert.equal(byId(root, `tool-${row.kind}`).getAttribute('title'), row.desc);
});

// ---- menu ----
function menuProps(over: Partial<MenuProps> = {}): MenuProps {
  return {
    open: true, seed: 'stefan-1984', runInfo: 'Seed stefan-1984 · optimal route 31 moves', muted: false, fullscreen: false,
    log: [{ text: 'Seed stefan-1984.', tone: 'info' }, { text: 'Picked up: Sugar Puffs.', tone: 'good' }],
    help: helpLines(KEYS, ['Z', 'X', 'C']),
    onSeed: noop, onPlaySeed: noop, onRandom: noop, onSound: noop, onFullscreen: noop, onQuit: noop, onClose: noop, ...over,
  };
}

test('the menu holds the seed box, sound and full screen, the story log, how to play and Quit, in that order', () => {
  const root = mount();
  renderMenu(root, menuProps());
  const veil = byId(root, 'menu-veil');
  assert.equal(veil.hidden, false);
  assert.equal(byId(root, 'menu-title').textContent, 'Menu');
  assert.deepEqual(walk(veil).map(n => n.getAttribute('data-section')).filter(Boolean), ['seed', 'audio', 'log', 'help', 'quit']);
});

test('the menu waits hidden until opened, and a first button takes focus so Q still closes it', () => {
  const root = mount();
  renderMenu(root, menuProps({ open: false }));
  assert.equal(byId(root, 'menu-veil').hidden, true);
  renderMenu(root, menuProps({ open: true }));
  assert.equal(globalThis.__focused?.id, 'menu-close', 'not the seed box: a letter typed there is only a letter');
});

test('the seed box shows the seed, reports typing, plays it on Enter or the button, and Random ignores it', () => {
  const root = mount();
  const seen: string[] = [];
  renderMenu(root, menuProps({ onSeed: t => seen.push(`seed:${t}`), onPlaySeed: () => seen.push('play'), onRandom: () => seen.push('random') }));
  const input = byId(root, 'seed-input');
  assert.equal(input.value, 'stefan-1984');
  input.value = 'abc';
  fire(input, 'input');
  submit(byId(root, 'seed-form'));
  click(byId(root, 'seed-play'));
  click(byId(root, 'random-run'));
  assert.deepEqual(seen, ['seed:abc', 'play', 'play', 'random']);
  assert.equal(byId(root, 'run-stats').textContent, 'Seed stefan-1984 · optimal route 31 moves');
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
  assert.deepEqual(lines, ['Seed stefan-1984.', 'Picked up: Sugar Puffs.']);
  const help = walk(byId(root, 'menu-veil')).filter(n => n.className === 'help');
  assert.equal(help.length, 1);
  assert.equal(help[0]!.children.length, helpLines(KEYS, ['Z']).length);
  assert.equal(maybeById(root, 'inventory'), undefined);
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
