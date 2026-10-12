// websites/www.cs/games/_kit/test/install-bar.test.mjs
// The Install and Share bar in the DOM stub: what each view draws, the iOS
// steps dialog's focus and Escape, and the address field.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { importTsx } from './tsx.ts';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { document, makeEl, click, fire, fireDocument } from './dom-stub.mjs';

globalThis.document = document;
const { bar } = await importTsx(import.meta.dirname, { bar: '../ui/install-bar.tsx' });
const { InstallBar } = bar;

const walk = (el, out = []) => { for (const c of el.children) if (c.nodeType === 1) { out.push(c); walk(c, out); } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);
const VIEW = { off: false, install: false, highlight: false, steps: false, share: 'idle', shareIcon: 'dots' };
const calls = [];
const roots = [];
afterEach(() => {
  for (const root of roots.splice(0)) render(null, root);
  calls.length = 0;
  document.activeElement = null;
  globalThis.__focused = null;
});
function draw(view, root = makeEl('root')) {
  if (!roots.includes(root)) roots.push(root);
  render(h(InstallBar, {
    view: { ...VIEW, ...view }, shareUrl: 'https://site.test/play/crete/',
    onInstall: () => calls.push('install'), onShare: () => calls.push('share'),
    onCloseSteps: () => calls.push('close-steps'), onCloseShare: () => calls.push('close-share'),
  }), root);
  return root;
}

test('Install is drawn only when the view offers it; Share always', () => {
  const root = draw({});
  assert.equal(byId(root, 'install-btn'), undefined);
  assert.equal(byId(root, 'share-btn').textContent, 'Share');
  draw({ install: true }, root);
  const install = byId(root, 'install-btn');
  assert.equal(install.textContent, 'Install');
  assert.equal(install.className, 'kit-install-btn');
  click(install);
  click(byId(root, 'share-btn'));
  assert.deepEqual(calls, ['install', 'share']);
});

test('?install draws Install highlighted', () => {
  assert.equal(byId(draw({ install: true, highlight: true }), 'install-btn').className, 'kit-install-btn kit-install-asked');
});

test('a framed page draws nothing', () => {
  assert.equal(draw({ off: true, install: true }).children.length, 0);
});

test('"Link copied" is said in a status line', () => {
  const root = draw({});
  const status = byId(root, 'share-status');
  assert.equal(status.getAttribute('role'), 'status');
  assert.equal(status.textContent, '');
  draw({ share: 'copied' }, root);
  assert.equal(byId(root, 'share-status').textContent, 'Link copied');
});

test('a blocked clipboard shows the address in a focused field; Escape closes it', () => {
  const root = draw({ share: 'field' });
  const field = byId(root, 'share-url');
  assert.equal(field.value, 'https://site.test/play/crete/');
  assert.equal(globalThis.__focused, field);
  fire(field, 'keydown', { type: 'keydown', key: 'Escape' });
  assert.deepEqual(calls, ['close-share']);
});

test('iOS steps: a dialog with the Share glyph; Done is focused; Escape and Done close it', () => {
  const root = draw({ install: true });
  assert.equal(byId(root, 'install-steps').hidden, true);
  draw({ install: true, steps: true }, root);
  const veil = byId(root, 'install-steps');
  assert.equal(veil.hidden, false);
  assert.equal(veil.children[0].getAttribute('role'), 'dialog');
  assert.equal(byId(root, 'install-steps-title').textContent, 'Add to Home Screen');
  assert.equal(byId(root, 'install-steps-text').textContent, 'Tap Share, then Add to Home Screen.');
  assert.equal(walk(byId(root, 'install-steps-text')).some(n => n.localName === 'svg'), true);
  assert.equal(globalThis.__focused?.id, 'install-steps-done');
  fireDocument('keydown', { key: 'Escape' });
  click(byId(root, 'install-steps-done'));
  assert.deepEqual(calls, ['close-steps', 'close-steps']);
});

test('the "Link copied" status line is always in the page, and its empty state hides it visually, never with display: none', () => {
  const root = draw({});
  assert.ok(byId(root, 'share-status'), 'present while idle, so a screen reader hears the text arrive');
  assert.equal(byId(root, 'share-status').hidden, false);
  const css = readFileSync(join(import.meta.dirname, '..', 'ui', 'install-bar.tsx'), 'utf8');
  const empty = css.match(/\.kit-install-status:empty \{([^}]*)\}/)[1];
  assert.doesNotMatch(empty, /display\s*:\s*none/);
  assert.match(empty, /clip-path/);
});

const svgOf = el => walk(el).find(n => n.localName === 'svg');
const pathsOf = el => walk(svgOf(el)).map(n => n.localName).join(',');

test('Install and Share each carry an icon (hidden from screen readers) beside their word, which a phone hides visually, not with display: none', () => {
  const root = draw({ install: true });
  for (const [id, word, title] of [['install-btn', 'Install', 'Install this game as an app'], ['share-btn', 'Share', 'Share a link to this game']]) {
    const btn = byId(root, id);
    assert.ok(svgOf(btn), `${id} has an icon`);
    assert.equal(svgOf(btn).getAttribute('aria-hidden'), 'true');
    const txt = walk(btn).find(n => n.className === 'kit-install-txt');
    assert.equal(txt.textContent, word, `${id}'s word stays in the page, so it is the accessible name`);
    assert.equal(btn.textContent, word);
    assert.equal(btn.getAttribute('title'), title);
  }
  const src = readFileSync(join(import.meta.dirname, '..', 'ui', 'install-bar.tsx'), 'utf8');
  const phone = src.match(/@media \(max-width: 600px\) \{([\s\S]*?)\n\}/)[1];
  const txtRule = phone.match(/\.kit-install-txt \{([^}]*)\}/)[1];
  assert.match(txtRule, /clip-path/);
  assert.doesNotMatch(txtRule, /display\s*:\s*none/);
  assert.match(phone, /\.kit-install-btn \{[^}]*width: 2\.5rem/);
});

test('Share draws the box on an Apple platform and the three dots elsewhere', () => {
  const dots = pathsOf(byId(draw({ shareIcon: 'dots' }), 'share-btn'));
  const box = pathsOf(byId(draw({ shareIcon: 'box' }), 'share-btn'));
  assert.notEqual(dots, box);
  assert.match(dots, /circle/);
  assert.doesNotMatch(box, /circle/);
});
