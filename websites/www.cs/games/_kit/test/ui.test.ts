// The kit's Preact components in the DOM stub: the dialog's structure, focus
// and dismissal; the button's blur, chip and click; the panel; the key chip.
import { test, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { h, render as preactRender } from 'preact';
import { importTsx } from './tsx.ts';
import type { ComponentChildren } from 'preact';
import type { DialogProps } from '../ui/dialog.tsx';
import { byId, childEl, click, document, fire, fireDocument, installDocument, makeEl, maybeById, renderTarget, walk } from './dom-stub.ts';
import type { StubElement } from './dom-stub.ts';

installDocument();
const ui = await importTsx<{
  dialog: typeof import('../ui/dialog.tsx');
  button: typeof import('../ui/button.tsx');
  panel: typeof import('../ui/panel.tsx');
  chip: typeof import('../ui/key-chip.tsx');
}>(import.meta.dirname, {
  dialog: '../ui/dialog.tsx', button: '../ui/button.tsx', panel: '../ui/panel.tsx', chip: '../ui/key-chip.tsx',
});
const { Dialog } = ui.dialog;
const { Button } = ui.button;
const { Panel } = ui.panel;
const { KeyChip } = ui.chip;

/** The <kbd> chips under an element. */
const chips = (el: StubElement) => walk(el).filter(n => n.localName === 'kbd');
const render = (vnode: ComponentChildren, root: StubElement): void => preactRender(vnode, renderTarget(root));
// Every root a test renders into is unmounted afterwards, so no dialog's
// document listeners outlive its test.
const roots: StubElement[] = [];
const mount = () => { const root = makeEl('root'); roots.push(root); return root; };
afterEach(() => {
  for (const root of roots.splice(0)) render(null, root);
  document.activeElement = null;
  globalThis.__focused = null;
  globalThis.__blurred = null;
});
const dialog = (props: Pick<DialogProps, 'open'> & Partial<DialogProps>, children?: ComponentChildren) => h(Dialog, {
  id: 'veil', veilClass: 'veil', panelClass: 'card', titleId: 'dlg-title', title: 'Ending', ...props,
}, children);

test('a closed dialog is in the page, hidden, and names itself by its title', () => {
  const root = mount();
  render(dialog({ open: false, kicker: 'Run over', kickerId: 'dlg-kicker', kickerClass: 'kicker' }), root);
  const veil = byId(root, 'veil');
  assert.equal(veil.hidden, true);
  assert.equal(veil.className, 'veil');
  const panel = childEl(veil);
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
  assert.equal(maybeById(root, 'dlg-kicker'), undefined);
  render(dialog({ open: false, titleClass: 'big', kicker: false, kickerId: 'dlg-kicker' }), root);
  assert.equal(maybeById(root, 'dlg-kicker'), undefined);
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
  const open = (isOpen: boolean) => render(dialog({ open: isOpen, focusId: 'again' }, content), host);
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
  const panel = childEl(byId(root, 'veil'));
  assert.equal(globalThis.__focused, panel);
  assert.equal(panel.getAttribute('tabIndex'), '-1');
});

test('the fallback skips a button inside something hidden', () => {
  const root = mount();
  render(dialog({ open: true }, [
    h('div', { hidden: true }, h('button', { id: 'tucked' }, 'Tucked')),
    h(Button, { id: 'ok', onClick() {} }, 'Ok'),
  ]), root);
  assert.equal(globalThis.__focused?.id, 'ok');
});

test('Tab stays in an open dialog: it wraps at either end and comes back in from outside', () => {
  const root = mount();
  render(dialog({ open: true }, [
    h('button', { id: 'one' }, 'One'),
    h('div', { hidden: true }, h('button', { id: 'tucked' }, 'Tucked')),
    h('button', { id: 'off', disabled: true }, 'Off'),
    h('button', { id: 'two' }, 'Two'),
  ]), root);
  const tab = (shiftKey = false) => fireDocument('keydown', { key: 'Tab', shiftKey });
  assert.equal(document.activeElement?.id, 'one');
  const back = tab(true);
  assert.equal(back.prevented, true, 'Shift+Tab on the first wraps');
  assert.equal(document.activeElement?.id, 'two');
  const on = tab();
  assert.equal(on.prevented, true, 'Tab on the last wraps');
  assert.equal(document.activeElement?.id, 'one');
  assert.equal(tab().prevented, false, 'between the ends the browser moves focus');
  document.activeElement = makeEl('behind');
  assert.equal(tab().prevented, true);
  assert.equal(document.activeElement?.id, 'one', 'focus behind the veil comes back in');
  document.activeElement = makeEl('behind');
  tab(true);
  assert.equal(document.activeElement?.id, 'two');
  assert.equal(fireDocument('keydown', { key: 'Tab', ctrlKey: true }).prevented, false, 'Ctrl+Tab is the browser\'s');
});

test('Tab in a dialog with nothing to tab to keeps focus on its panel; a closed dialog leaves Tab alone', () => {
  const root = mount();
  render(dialog({ open: true }), root);
  const panel = childEl(byId(root, 'veil'));
  document.activeElement = makeEl('behind');
  assert.equal(fireDocument('keydown', { key: 'Tab' }).prevented, true);
  assert.equal(document.activeElement, panel);
  render(dialog({ open: false }, h('button', { id: 'one' }, 'One')), root);
  assert.equal(fireDocument('keydown', { key: 'Tab' }).prevented, false);
});

test('Q and a click on the veil dismiss; a click inside does not', () => {
  const root = mount();
  let dismissed = 0;
  render(dialog({ open: true, onDismiss: () => { dismissed++; } }), root);
  const q = fireDocument('keydown', { key: 'q' });
  assert.equal(dismissed, 1);
  assert.equal(q.prevented, true);
  // The dialog owns Q: the game's own key router under it never sees it.
  assert.equal(q.stopped, true);
  fireDocument('keydown', { key: 'Q' });
  assert.equal(dismissed, 2, 'Q with Shift or Caps Lock');
  fireDocument('keydown', { key: 'Enter' });
  assert.equal(dismissed, 2);
  const veil = byId(root, 'veil');
  const panel = childEl(veil);
  fire(veil, 'pointerdown', { target: panel });
  fire(veil, 'click', { target: panel });
  assert.equal(dismissed, 2);
  fire(veil, 'pointerdown');
  fire(veil, 'click');
  assert.equal(dismissed, 3);
});

test('Escape does nothing to a dialog: the browser keeps it for full screen', () => {
  const root = mount();
  let dismissed = 0;
  render(dialog({ open: true, onDismiss: () => { dismissed++; } }), root);
  const esc = fireDocument('keydown', { key: 'Escape', code: 'Escape' });
  assert.equal(dismissed, 0);
  assert.equal(esc.prevented, false);
  assert.equal(esc.stopped, false);
});

test('Q with Ctrl, Cmd or Alt is a shortcut, not a dismissal', () => {
  const root = mount();
  let dismissed = 0;
  render(dialog({ open: true, onDismiss: () => { dismissed++; } }), root);
  for (const mod of ['ctrlKey', 'metaKey', 'altKey']) {
    const ev = fireDocument('keydown', { key: 'q', [mod]: true });
    assert.equal(ev.prevented, false, mod);
  }
  assert.equal(dismissed, 0);
});

test('a held Q dismisses once and never reaches the game under the dialog', () => {
  const root = mount();
  let dismissed = 0;
  render(dialog({ open: true, onDismiss: () => { dismissed++; } }), root);
  const rep = fireDocument('keydown', { key: 'q', repeat: true });
  assert.equal(dismissed, 0);
  assert.equal(rep.prevented, true);
  assert.equal(rep.stopped, true);
});

test('Q typed into a box in the dialog is a letter, not a dismissal', () => {
  const root = mount();
  let dismissed = 0;
  render(dialog({ open: true, onDismiss: () => { dismissed++; } }), root);
  for (const tagName of ['INPUT', 'TEXTAREA', 'SELECT']) {
    const ev = fireDocument('keydown', { key: 'q', target: { tagName } });
    assert.equal(ev.prevented, false, tagName);
  }
  fireDocument('keydown', { key: 'q', target: { tagName: 'DIV', isContentEditable: true } });
  assert.equal(dismissed, 0);
});

test('Q during text composition is left to the input method', () => {
  const root = mount();
  let dismissed = 0;
  render(dialog({ open: true, onDismiss: () => { dismissed++; } }), root);
  fireDocument('keydown', { key: 'q', isComposing: true });
  assert.equal(dismissed, 0);
});

test('Q dismisses a dialog without leaving full screen, and so does nothing on Escape', () => {
  const root = mount();
  let exits = 0;
  document.fullscreenElement = root;
  document.exitFullscreen = async () => { exits++; };
  try {
    let dismissed = 0;
    render(dialog({ open: true, onDismiss: () => { dismissed++; } }), root);
    fireDocument('keydown', { key: 'q', code: 'KeyQ' });
    assert.equal(dismissed, 1);
    fireDocument('keydown', { key: 'Escape', code: 'Escape' });
    assert.equal(dismissed, 1);
    assert.equal(exits, 0);
    assert.equal(document.fullscreenElement, root);
  } finally {
    delete document.fullscreenElement;
    delete document.exitFullscreen;
  }
});

test('a closed dialog ignores Q', () => {
  const root = mount();
  let dismissed = 0;
  render(dialog({ open: false, onDismiss: () => { dismissed++; } }), root);
  const ev = fireDocument('keydown', { key: 'q' });
  assert.equal(dismissed, 0);
  assert.equal(ev.stopped, false);
});

test('an alert dialog says so, and can point at its description', () => {
  const root = mount();
  render(dialog({ open: true, role: 'alertdialog', describedBy: 'why' }), root);
  const panel = childEl(byId(root, 'veil'));
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
  const chip = chips(b)[0];
  assert.ok(chip);
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
  const section = childEl(root);
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
  const [a, b] = chips(root);
  assert.ok(a && b);
  assert.deepEqual([a.className, a.textContent, b.className, b.textContent], ['key-chip', 'Space', 'cap', 'N']);
  assert.equal(a.getAttribute('aria-hidden'), undefined);
  assert.equal(a.getAttribute('data-keyhint'), undefined);
});

test('a chip can name its key-table slot and stay out of the accessible name', () => {
  const root = mount();
  render(h(KeyChip, { label: 'N', class: 'key', at: 'global:new', decorative: true }), root);
  const chip = childEl(root);
  assert.equal(chip.className, 'key');
  assert.equal(chip.getAttribute('data-keyhint'), 'global:new');
  assert.equal(chip.getAttribute('aria-hidden'), 'true');
});
