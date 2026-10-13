// The kit's Preact components in the DOM stub: the dialog's structure, focus
// and dismissal; the button's blur, chip and click; the panel; the key chip.
import { test, afterEach, mock } from 'node:test';
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
// Every root a test renders into is unmounted afterwards, so no dialog's
// document listeners outlive its test.
const roots = [];
const mount = () => { const root = makeEl('root'); roots.push(root); return root; };
afterEach(() => {
  for (const root of roots.splice(0)) render(null, root);
  document.activeElement = null;
  globalThis.__focused = null;
  globalThis.__blurred = null;
});
const dialog = (props, children) => h(Dialog, {
  id: 'veil', veilClass: 'veil', panelClass: 'card', titleId: 'dlg-title', title: 'Ending', ...props,
}, children);

test('a closed dialog is in the page, hidden, and names itself by its title', () => {
  const root = mount();
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

test('the title class lands on the heading; a null kicker renders no paragraph', () => {
  const root = mount();
  render(dialog({ open: false, titleClass: 'big', kicker: null, kickerId: 'dlg-kicker' }), root);
  assert.equal(byId(root, 'dlg-title').className, 'big');
  assert.equal(byId(root, 'dlg-kicker'), undefined);
  render(dialog({ open: false, titleClass: 'big', kicker: false, kickerId: 'dlg-kicker' }), root);
  assert.equal(byId(root, 'dlg-kicker'), undefined);
});

test('opening focuses the named element; closing gives focus back', () => {
  const root = mount();
  const opener = makeEl('opener');
  document.activeElement = opener;
  const children = h(Button, { id: 'again', onClick() {} }, 'Again');
  render(dialog({ open: false, focusId: 'again' }, children), root);
  render(dialog({ open: true, focusId: 'again' }, children), root);
  assert.equal(byId(root, 'veil').hidden, false);
  assert.equal(globalThis.__focused?.id, 'again');
  render(dialog({ open: false, focusId: 'again' }, children), root);
  assert.equal(globalThis.__focused, opener);
});

test('a dialog opened by a kit Button gives focus back to that Button', () => {
  const trigger = mount();
  const host = mount();
  const content = h(Button, { id: 'again', onClick() {} }, 'Again');
  const open = isOpen => render(dialog({ open: isOpen, focusId: 'again' }, content), host);
  open(false);
  render(h(Button, { id: 'opener', onClick: () => open(true) }, 'Open'), trigger);
  const opener = byId(trigger, 'opener');
  opener.focus();
  click(opener);
  assert.equal(document.activeElement?.id, 'again');
  open(false);
  assert.equal(globalThis.__focused, opener);
});

test('a dialog the game opens after a press does not return focus to that Button', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    const trigger = mount();
    const host = mount();
    render(h(Button, { id: 'used', onClick() {} }, 'Use'), trigger);
    const used = byId(trigger, 'used');
    used.focus();
    click(used);
    mock.timers.tick(0);
    const content = h(Button, { id: 'again', onClick() {} }, 'Again');
    render(dialog({ open: false, focusId: 'again' }, content), host);
    render(dialog({ open: true, focusId: 'again' }, content), host);
    assert.equal(document.activeElement?.id, 'again');
    render(dialog({ open: false, focusId: 'again' }, content), host);
    assert.notEqual(globalThis.__focused, used);
    assert.notEqual(document.activeElement, used);
  } finally {
    mock.timers.reset();
  }
});

test('unmounting an open dialog gives focus back too', () => {
  const root = mount();
  const opener = makeEl('opener');
  document.activeElement = opener;
  render(dialog({ open: true }, h(Button, { id: 'in', onClick() {} }, 'In')), root);
  assert.equal(globalThis.__focused?.id, 'in');
  render(null, root);
  assert.equal(globalThis.__focused, opener);
});

test('without a focus id, opening focuses the first button', () => {
  const root = mount();
  render(dialog({ open: true }, [h('p', null, 'text'), h(Button, { id: 'first', onClick() {} }, 'One'), h(Button, { id: 'second', onClick() {} }, 'Two')]), root);
  assert.equal(globalThis.__focused?.id, 'first');
});

test('the fallback skips hidden and disabled buttons', () => {
  const root = mount();
  render(dialog({ open: true }, [
    h('button', { id: 'gone', hidden: true }, 'Gone'),
    h('button', { id: 'off', disabled: true }, 'Off'),
    h(Button, { id: 'ok', onClick() {} }, 'Ok'),
  ]), root);
  assert.equal(globalThis.__focused?.id, 'ok');
});

test('a dialog with no usable button focuses its panel', () => {
  const root = mount();
  render(dialog({ open: true }, h('button', { id: 'gone', hidden: true }, 'Gone')), root);
  const panel = byId(root, 'veil').children[0];
  assert.equal(globalThis.__focused, panel);
  assert.equal(panel.getAttribute('tabIndex'), '-1');
});

test('Escape and a click on the veil dismiss; a click inside does not', () => {
  const root = mount();
  let dismissed = 0;
  render(dialog({ open: true, onDismiss: () => { dismissed++; } }), root);
  fireDocument('keydown', { key: 'Escape' });
  assert.equal(dismissed, 1);
  fireDocument('keydown', { key: 'Enter' });
  assert.equal(dismissed, 1);
  const veil = byId(root, 'veil');
  const panel = veil.children[0];
  fire(veil, 'pointerdown', { target: panel });
  fire(veil, 'click', { target: panel });
  assert.equal(dismissed, 1);
  fire(veil, 'pointerdown');
  fire(veil, 'click');
  assert.equal(dismissed, 2);
});

test('a drag that starts in the panel and ends on the veil does not dismiss', () => {
  const root = mount();
  let dismissed = 0;
  render(dialog({ open: true, onDismiss: () => { dismissed++; } }), root);
  const veil = byId(root, 'veil');
  fire(veil, 'pointerdown', { target: veil.children[0] });
  fire(veil, 'click');
  assert.equal(dismissed, 0);
});

test('Escape during text composition is left to the input method', () => {
  const root = mount();
  let dismissed = 0;
  render(dialog({ open: true, onDismiss: () => { dismissed++; } }), root);
  fireDocument('keydown', { key: 'Escape', isComposing: true });
  assert.equal(dismissed, 0);
});

test('Escape dismisses a dialog without leaving full screen', () => {
  const root = mount();
  let exits = 0;
  document.fullscreenElement = root;
  document.exitFullscreen = async () => { exits++; };
  try {
    let dismissed = 0;
    render(dialog({ open: true, onDismiss: () => { dismissed++; } }), root);
    fireDocument('keydown', { key: 'Escape' });
    assert.equal(dismissed, 1);
    assert.equal(exits, 0);
    assert.equal(document.fullscreenElement, root);
  } finally {
    delete document.fullscreenElement;
    delete document.exitFullscreen;
  }
});

test('a closed dialog ignores Escape', () => {
  const root = mount();
  let dismissed = 0;
  render(dialog({ open: false, onDismiss: () => { dismissed++; } }), root);
  fireDocument('keydown', { key: 'Escape' });
  assert.equal(dismissed, 0);
});

test('an alert dialog says so, and can point at its description', () => {
  const root = mount();
  render(dialog({ open: true, role: 'alertdialog', describedBy: 'why' }), root);
  const panel = byId(root, 'veil').children[0];
  assert.equal(panel.getAttribute('role'), 'alertdialog');
  assert.equal(panel.getAttribute('aria-describedby'), 'why');
});

test('a button blurs itself, then calls back; a key label becomes a chip', () => {
  const root = mount();
  let pressed = 0;
  let blurredFirst = false;
  const onClick = () => { blurredFirst = globalThis.__blurred === byId(root, 'b'); pressed++; };
  render(h(Button, { id: 'b', class: 'go', title: 'Use it', keyLabel: 'Z', onClick }, 'Use'), root);
  const b = byId(root, 'b');
  assert.equal(b.localName, 'button');
  assert.equal(b.getAttribute('type'), 'button');
  assert.equal(b.className, 'go');
  assert.equal(b.getAttribute('title'), 'Use it');
  click(b);
  assert.equal(pressed, 1);
  assert.equal(blurredFirst, true);
  const chip = walk(b).find(n => n.localName === 'kbd');
  assert.equal(chip.getAttribute('aria-hidden'), 'true');
  assert.equal(chip.className, 'key-chip');
  assert.equal(chip.textContent, 'Z');
});

test('a disabled button says so; a label names a symbol-only button', () => {
  const root = mount();
  render(h(Button, { id: 'x', disabled: true, label: 'Close', onClick() {} }, '×'), root);
  const b = byId(root, 'x');
  assert.equal(b.disabled, true);
  assert.equal(b.getAttribute('aria-label'), 'Close');
});

test('a toggle button reports whether it is pressed', () => {
  const root = mount();
  render(h(Button, { id: 't', pressed: true, onClick() {} }, 'Sound'), root);
  assert.equal(byId(root, 't').getAttribute('aria-pressed'), 'true');
  render(h(Button, { id: 't', pressed: false, onClick() {} }, 'Sound'), root);
  assert.equal(byId(root, 't').getAttribute('aria-pressed'), 'false');
});

test('a panel is a section named by its heading', () => {
  const root = mount();
  render(h(Panel, { id: 'inv', class: 'panel', titleId: 'inv-h', title: 'Inventory', titleClass: 'ph' }, h('ul', { id: 'list' })), root);
  const section = root.children[0];
  assert.equal(section.localName, 'section');
  assert.equal(section.className, 'panel');
  assert.equal(section.id, 'inv');
  assert.equal(byId(root, 'inv-h').className, 'ph');
  assert.equal(section.getAttribute('aria-labelledby'), 'inv-h');
  assert.equal(byId(root, 'inv-h').textContent, 'Inventory');
  assert.ok(byId(root, 'list'));
});

test('a key chip shows its key, with the default class or the given one', () => {
  const root = mount();
  render(h('p', null, h(KeyChip, { label: 'Space' }), h(KeyChip, { label: 'N', class: 'cap' })), root);
  const [a, b] = walk(root).filter(n => n.localName === 'kbd');
  assert.deepEqual([a.className, a.textContent, b.className, b.textContent], ['key-chip', 'Space', 'cap', 'N']);
  assert.equal(a.getAttribute('aria-hidden'), undefined);
  assert.equal(a.getAttribute('data-keyhint'), undefined);
});

test('a chip can name its key-table slot and stay out of the accessible name', () => {
  const root = mount();
  render(h(KeyChip, { label: 'N', class: 'key', at: 'global:new', decorative: true }), root);
  const chip = root.children[0];
  assert.equal(chip.className, 'key');
  assert.equal(chip.getAttribute('data-keyhint'), 'global:new');
  assert.equal(chip.getAttribute('aria-hidden'), 'true');
});
