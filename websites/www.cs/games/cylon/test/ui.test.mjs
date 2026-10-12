// Cylon's Preact overlays in the DOM stub: the ids and classes css/*.css and
// the browser specs use, what each shows, and that every control calls back.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importTsx } from '../../_kit/test/tsx.ts';
import { document, makeEl, click, fire } from '../../_kit/test/dom-stub.mjs';

globalThis.document = document;
const ui = await importTsx(import.meta.dirname, { board: '../src/ui/board.tsx', help: '../src/ui/help.tsx' });
const { renderHsRows } = ui.board;
const { renderHelp } = ui.help;

const walk = (el, out = []) => { for (const c of el.children) if (c.nodeType === 1) { out.push(c); walk(c, out); } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);
const byClass = (el, name) => walk(el).filter(n => String(n.className).split(' ').includes(name));
const ROWS = [
  { rank: 1, initials: 'WMG', date: 'Oct 5, 2026', score: 12 },
  { rank: 2, initials: 'AAA', date: '', score: 3 },
];

test('rows show rank, initials, date and score', () => {
  const list = makeEl('cylon-high-scores');
  renderHsRows(list, ROWS);
  assert.equal(list.children.length, 2);
  assert.deepEqual(byClass(list, 'cylon-hs-rank').map(n => n.textContent), ['#1', '#2']);
  assert.deepEqual(byClass(list, 'cylon-hs-initials').map(n => n.textContent), ['WMG', 'AAA']);
  assert.deepEqual(byClass(list, 'cylon-hs-date').map(n => n.textContent), ['Oct 5, 2026', '']);
  assert.deepEqual(byClass(list, 'cylon-hs-score').map(n => n.textContent), ['12 KOs', '3 KOs']);
});

test('an empty board says so', () => {
  const list = makeEl('cylon-high-scores');
  renderHsRows(list, []);
  assert.equal(list.children.length, 1);
  assert.equal(list.children[0].className, 'cylon-hs-empty');
  assert.equal(list.children[0].textContent, 'No scores yet');
});

test('rows show initials as text, never as markup', () => {
  const list = makeEl('cylon-high-scores');
  renderHsRows(list, [{ rank: 1, initials: '<B>', date: '', score: 1 }]);
  const cell = byClass(list, 'cylon-hs-initials')[0];
  assert.equal(cell.textContent, '<B>');
  assert.equal(walk(cell).length, 0);
});

test('How to Play shows the mouse steps on a desktop', () => {
  const root = makeEl('cylon-help-root');
  renderHelp(root, { open: true, touch: false, onClose() {} });
  const veil = byId(root, 'cylon-help');
  assert.equal(veil.hidden, false);
  assert.equal(veil.className, 'cylon-help');
  assert.equal(veil.children[0].className, 'cylon-help-panel');
  assert.equal(byId(root, 'cylon-help-title').textContent, 'How to Play');
  assert.equal(byId(root, 'cylon-help-platform').textContent, 'Desktop controls');
  assert.ok(byId(root, 'cylon-help-desktop'));
  assert.equal(byId(root, 'cylon-help-mobile'), undefined);
  assert.equal(walk(byId(root, 'cylon-help-desktop')).filter(n => n.localName === 'li').length, 10);
  assert.equal(document.activeElement?.id, 'cylon-help-close');
});

test('How to Play shows the touch steps on a phone', () => {
  const root = makeEl('cylon-help-root');
  renderHelp(root, { open: true, touch: true, onClose() {} });
  assert.equal(byId(root, 'cylon-help-platform').textContent, 'Touch controls');
  assert.ok(byId(root, 'cylon-help-mobile'));
  assert.match(byId(root, 'cylon-help-mobile').textContent, /Drag the green reticle/);
});

test('Got it and a press-and-click on the veil close How to Play', () => {
  const root = makeEl('cylon-help-root');
  let closed = 0;
  renderHelp(root, { open: true, touch: false, onClose: () => { closed++; } });
  click(byId(root, 'cylon-help-close'));
  const veil = byId(root, 'cylon-help');
  fire(veil, 'pointerdown');
  fire(veil, 'click');
  assert.equal(closed, 2);
});

test('a click on the veil that did not start there does not close How to Play', () => {
  const root = makeEl('cylon-help-root');
  let closed = 0;
  renderHelp(root, { open: true, touch: false, onClose: () => { closed++; } });
  fire(byId(root, 'cylon-help'), 'click');
  assert.equal(closed, 0);
});

test('a closed How to Play is hidden', () => {
  const root = makeEl('cylon-help-root');
  renderHelp(root, { open: false, touch: false, onClose() {} });
  assert.equal(byId(root, 'cylon-help').hidden, true);
});
