// Crete's Preact overlays in the DOM stub: the ids the page's CSS and the
// browser specs use, the text each shows, and that each button calls back.
import { test, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { render } from 'preact';
import { importTsx } from '../../_kit/test/tsx.ts';
import { document, makeEl, click } from '../../_kit/test/dom-stub.mjs';

globalThis.document = document;
const ui = await importTsx(import.meta.dirname, { end: '../src/ui/end.tsx', inventory: '../src/ui/inventory.tsx', title: '../src/ui/title.tsx' });
const { renderEndCard } = ui.end;
const { renderInventory } = ui.inventory;
const { renderTitleCard } = ui.title;

const walk = (el, out = []) => { for (const c of el.children) if (c.nodeType === 1) { out.push(c); walk(c, out); } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);
const END = { kicker: 'You escaped', title: 'True Ending: Shut Down the Maze', text: 'Every page recovered.', score: 'Score 340 · 31 turns' };

// Unmounting each root keeps one test's dialog from holding focus for the next.
const roots = [];
const mount = () => { const root = makeEl('root'); roots.push(root); return root; };
afterEach(() => {
  for (const root of roots.splice(0)) render(null, root);
  document.activeElement = null;
  globalThis.__focused = null;
});

test('the ending card waits hidden until the run ends', () => {
  const root = mount();
  renderEndCard(root, { open: false, kicker: '', title: '', text: '', score: '', onAgain() {} });
  assert.equal(byId(root, 'end-veil').hidden, true);
  assert.equal(byId(root, 'end-veil').className, 'veil');
});

test('the ending card shows the result and focuses Play again', () => {
  const root = mount();
  renderEndCard(root, { open: false, ...END, onAgain() {} });
  renderEndCard(root, { open: true, ...END, onAgain() {} });
  assert.equal(byId(root, 'end-veil').hidden, false);
  const card = byId(root, 'end-veil').children[0];
  assert.equal(card.className, 'card');
  assert.equal(card.getAttribute('aria-labelledby'), 'end-title');
  assert.deepEqual(['end-kicker', 'end-title', 'end-text', 'end-score'].map(id => byId(root, id).textContent),
    [END.kicker, END.title, END.text, END.score]);
  assert.equal(byId(root, 'end-score').className, 'runstats');
  assert.equal(byId(root, 'again').textContent, 'Play again (N)');
  assert.equal(document.activeElement?.id, 'again');
});

test('Play again calls back', () => {
  const root = mount();
  let again = 0;
  renderEndCard(root, { open: true, ...END, onAgain: () => { again++; } });
  click(byId(root, 'again'));
  assert.equal(again, 1);
});

const ROWS = [
  { kind: 'shard', emoji: '🔮', name: 'Mirror Shard', key: 'Z', count: 1, desc: 'Freeze the creature for one full turn. Move right after.', disabled: false },
  { kind: 'snack', emoji: '🥣', name: 'Sugar Puffs', key: 'X', count: 0, desc: 'Heal 5 HP. Using it costs your turn.', disabled: true },
  { kind: 'jammer', emoji: '📻', name: 'Signal Jammer', key: 'C', count: 2, desc: 'Hurl the creature far away. Using it costs your turn.', disabled: false },
];

test('the inventory is a panel with one row per item: name, count, key and what it does', () => {
  const root = mount();
  renderInventory(root, { rows: ROWS, onUse() {} });
  const section = root.children[0];
  assert.equal(section.localName, 'section');
  assert.equal(section.className, 'panel');
  assert.equal(section.getAttribute('aria-labelledby'), 'inv-h');
  assert.equal(byId(root, 'inv-h').textContent, 'Inventory — use with Z / X / C');
  const list = byId(root, 'inventory');
  assert.equal(list.className, 'inv');
  const items = list.children;
  assert.equal(items.length, 3);
  assert.equal(walk(items[0]).find(n => n.className === 'name').textContent, '🔮 Mirror Shard × 1 Z');
  assert.equal(walk(items[0]).find(n => n.localName === 'kbd').textContent, 'Z');
  assert.equal(walk(items[1]).find(n => n.className === 'desc').textContent, 'Heal 5 HP. Using it costs your turn.');
  assert.deepEqual(items.map(li => walk(li).find(n => n.localName === 'button').textContent), ['Use (Z)', 'Use (X)', 'Use (C)']);
});

test('an empty or unusable item cannot be pressed; a usable one calls back with its kind', () => {
  const root = mount();
  const used = [];
  renderInventory(root, { rows: ROWS, onUse: kind => used.push(kind) });
  const buttons = byId(root, 'inventory').children.map(li => walk(li).find(n => n.localName === 'button'));
  assert.deepEqual(buttons.map(b => b.disabled), [false, true, false]);
  click(buttons[2]);
  assert.deepEqual(used, ['jammer']);
});

test('closing the ending card after a Use click leaves focus off the inventory buttons', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const inv = mount();
    const end = mount();
    renderInventory(inv, { rows: ROWS, onUse() {} });
    renderEndCard(end, { open: false, ...END, onAgain() {} });
    const use = walk(byId(inv, 'inventory').children[0]).find(n => n.localName === 'button');
    use.focus();
    click(use);
    mock.timers.tick(0);
    renderEndCard(end, { open: true, ...END, onAgain() {} });
    assert.equal(document.activeElement?.id, 'again');
    renderEndCard(end, { open: false, ...END, onAgain() {} });
    const buttons = walk(inv).filter(n => n.localName === 'button');
    assert.ok(!buttons.includes(document.activeElement));
  } finally {
    mock.timers.reset();
  }
});

test('the title card names the game and focuses Play; Play calls back', () => {
  const root = makeEl('title-root');
  let played = 0;
  renderTitleCard(root, { open: false, hint: false, onPlay: () => { played++; } });
  assert.equal(byId(root, 'title-veil').hidden, true);
  renderTitleCard(root, { open: true, hint: false, onPlay: () => { played++; } });
  assert.equal(byId(root, 'title-veil').hidden, false);
  assert.equal(byId(root, 'title-name').textContent, 'The Island of Crete');
  assert.equal(byId(root, 'title-hint'), undefined);
  assert.equal(globalThis.__focused?.id, 'title-play');
  click(byId(root, 'title-play'));
  assert.equal(played, 1);
});

test('an installed app that could not close says how to', () => {
  const root = makeEl('title-root');
  renderTitleCard(root, { open: true, hint: true, onPlay() {} });
  assert.equal(byId(root, 'title-hint').textContent, 'Swipe the app away to close it.');
});
