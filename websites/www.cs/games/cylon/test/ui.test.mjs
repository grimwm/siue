// Cylon's Preact overlays in the DOM stub: the ids and classes css/*.css and
// the browser specs use, what each shows, and that every control calls back.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importTsx } from '../../_kit/test/tsx.ts';
import { document, makeEl } from '../../_kit/test/dom-stub.mjs';

globalThis.document = document;
const ui = await importTsx(import.meta.dirname, { board: '../src/ui/board.tsx' });
const { renderHsRows } = ui.board;

const walk = (el, out = []) => { for (const c of el.children) if (c.nodeType === 1) { out.push(c); walk(c, out); } return out; };
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
