// The kit's Preact components in the DOM stub: the dialog's structure, focus
// and dismissal; the button's blur, chip and click; the panel; the key chip.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { importTsx } from './tsx.ts';
import { document, makeEl, click, fire, fireDocument } from './dom-stub.mjs';

globalThis.document = document;
const ui = await importTsx(import.meta.dirname, {
  dialog: '../ui/dialog.tsx', button: '../ui/button.tsx', panel: '../ui/panel.tsx', chip: '../ui/key-chip.tsx',
});
const { Dialog } = ui.dialog;
const { Button } = ui.button;
const { Panel } = ui.panel;
const { KeyChip } = ui.chip;

const walk = (el, out = []) => { for (const c of el.children) if (c.nodeType === 1) { out.push(c); walk(c, out); } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);
const dialog = (props, children) => h(Dialog, {
  id: 'veil', veilClass: 'veil', panelClass: 'card', titleId: 'dlg-title', title: 'Ending', ...props,
}, children);

test('a closed dialog is in the page, hidden, and names itself by its title', () => {
  const root = makeEl('root');
  render(dialog({ open: false, kicker: 'Run over', kickerId: 'dlg-kicker', kickerClass: 'kicker' }), root);
  const veil = byId(root, 'veil');
  assert.equal(veil.hidden, true);
  assert.equal(veil.className, 'veil');
  const panel = veil.children[0];
  assert.equal(panel.className, 'card');
  assert.equal(panel.getAttribute('role'), 'dialog');
  assert.equal(panel.getAttribute('aria-modal'), 'true');
  assert.equal(panel.getAttribute('aria-labelledby'), 'dlg-title');
  assert.equal(byId(root, 'dlg-kicker').textContent, 'Run over');
  assert.equal(byId(root, 'dlg-title').localName, 'h2');
  assert.equal(byId(root, 'dlg-title').textContent, 'Ending');
});

test('opening focuses the named element; closing gives focus back', () => {
  const root = makeEl('root');
  const opener = makeEl('opener');
  document.activeElement = opener;
  const children = h(Button, { id: 'again', onClick() {} }, 'Again');
  render(dialog({ open: false, focusId: 'again' }, children), root);
  render(dialog({ open: true, focusId: 'again' }, children), root);
  assert.equal(byId(root, 'veil').hidden, false);
  assert.equal(globalThis.__focused?.id, 'again');
  render(dialog({ open: false, focusId: 'again' }, children), root);
  assert.equal(globalThis.__focused, opener);
  document.activeElement = null;
});

test('without a focus id, opening focuses the first button', () => {
  const root = makeEl('root');
  render(dialog({ open: true }, [h('p', null, 'text'), h(Button, { id: 'first', onClick() {} }, 'One'), h(Button, { id: 'second', onClick() {} }, 'Two')]), root);
  assert.equal(globalThis.__focused?.id, 'first');
});

test('Escape and a click on the veil dismiss; a click inside does not', () => {
  const root = makeEl('root');
  let dismissed = 0;
  render(dialog({ open: true, onDismiss: () => { dismissed++; } }), root);
  fireDocument('keydown', { key: 'Escape' });
  assert.equal(dismissed, 1);
  fireDocument('keydown', { key: 'Enter' });
  assert.equal(dismissed, 1);
  const veil = byId(root, 'veil');
  fire(veil, 'click', { target: veil.children[0] });
  assert.equal(dismissed, 1);
  fire(veil, 'click');
  assert.equal(dismissed, 2);
});

test('a closed dialog ignores Escape', () => {
  const root = makeEl('root');
  let dismissed = 0;
  render(dialog({ open: false, onDismiss: () => { dismissed++; } }), root);
  fireDocument('keydown', { key: 'Escape' });
  assert.equal(dismissed, 0);
});

test('an alert dialog says so, and can point at its description', () => {
  const root = makeEl('root');
  render(dialog({ open: true, role: 'alertdialog', describedBy: 'why' }), root);
  const panel = byId(root, 'veil').children[0];
  assert.equal(panel.getAttribute('role'), 'alertdialog');
  assert.equal(panel.getAttribute('aria-describedby'), 'why');
});

test('a button blurs itself, then calls back; a key label becomes a chip', () => {
  const root = makeEl('root');
  let pressed = 0;
  render(h(Button, { id: 'b', class: 'go', title: 'Use it', keyLabel: 'Z', onClick: () => { pressed++; } }, 'Use'), root);
  const b = byId(root, 'b');
  assert.equal(b.localName, 'button');
  assert.equal(b.getAttribute('type'), 'button');
  assert.equal(b.className, 'go');
  assert.equal(b.getAttribute('title'), 'Use it');
  click(b);
  assert.equal(pressed, 1);
  const chip = walk(b).find(n => n.localName === 'kbd');
  assert.equal(chip.className, 'key-chip');
  assert.equal(chip.textContent, 'Z');
});

test('a disabled button says so; a label names a symbol-only button', () => {
  const root = makeEl('root');
  render(h(Button, { id: 'x', disabled: true, label: 'Close', onClick() {} }, '×'), root);
  const b = byId(root, 'x');
  assert.equal(b.disabled, true);
  assert.equal(b.getAttribute('aria-label'), 'Close');
});

test('a panel is a section named by its heading', () => {
  const root = makeEl('root');
  render(h(Panel, { class: 'panel', titleId: 'inv-h', title: 'Inventory' }, h('ul', { id: 'list' })), root);
  const section = root.children[0];
  assert.equal(section.localName, 'section');
  assert.equal(section.className, 'panel');
  assert.equal(section.getAttribute('aria-labelledby'), 'inv-h');
  assert.equal(byId(root, 'inv-h').textContent, 'Inventory');
  assert.ok(byId(root, 'list'));
});

test('a key chip shows its key, with the default class or the given one', () => {
  const root = makeEl('root');
  render(h('p', null, h(KeyChip, { label: 'Space' }), h(KeyChip, { label: 'N', class: 'cap' })), root);
  const [a, b] = walk(root).filter(n => n.localName === 'kbd');
  assert.deepEqual([a.className, a.textContent, b.className, b.textContent], ['key-chip', 'Space', 'cap', 'N']);
  assert.equal(a.getAttribute('aria-hidden'), undefined);
  assert.equal(a.getAttribute('data-keyhint'), undefined);
});

test('a chip can name its key-table slot and stay out of the accessible name', () => {
  const root = makeEl('root');
  render(h(KeyChip, { label: 'N', class: 'key', at: 'global:new', decorative: true }), root);
  const chip = root.children[0];
  assert.equal(chip.className, 'key');
  assert.equal(chip.getAttribute('data-keyhint'), 'global:new');
  assert.equal(chip.getAttribute('aria-hidden'), 'true');
});
