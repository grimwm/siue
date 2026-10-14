// websites/www.cs/games/_kit/test/install-bar.test.ts
// The Install and Share bar in the DOM stub: what each view draws, the iOS
// steps dialog's focus and Q, and the address field.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { importTsx } from './tsx.ts';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { InstallView } from '../install.ts';
import { byId, childEl, click, document, fire, fireDocument, installDocument, makeEl, maybeById, renderTarget, walk } from './dom-stub.ts';
import type { StubElement } from './dom-stub.ts';

installDocument();
const { bar } = await importTsx<{ bar: typeof import('../ui/install-bar.tsx') }>(import.meta.dirname, { bar: '../ui/install-bar.tsx' });
const { InstallBar } = bar;

/** The first capture group of a match the test knows succeeded. */
const group = (m: RegExpMatchArray | null): string => {
  assert.ok(m, 'no match');
  assert.ok(m[1] !== undefined);
  return m[1];
};
const VIEW: InstallView = { off: false, install: false, highlight: false, steps: false, share: 'idle', shareIcon: 'dots' };
const calls: string[] = [];
const roots: StubElement[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) render(null, renderTarget(root));
  calls.length = 0;
  document.activeElement = null;
  globalThis.__focused = null;
});
function draw(view: Partial<InstallView>, root: StubElement = makeEl('root')): StubElement {
  if (!roots.includes(root)) roots.push(root);
  render(h(InstallBar, {
    view: { ...VIEW, ...view }, shareUrl: 'https://site.test/play/crete/',
    onInstall: () => calls.push('install'), onShare: () => calls.push('share'),
    onCloseSteps: () => calls.push('close-steps'), onCloseShare: () => calls.push('close-share'),
  }), renderTarget(root));
  return root;
}

test('Install is drawn only when the view offers it; Share always', () => {
  const root = draw({});
  assert.equal(maybeById(root, 'install-btn'), undefined);
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

test('a blocked clipboard shows the address in a focused field; Q closes it, Escape does nothing', () => {
  const root = draw({ share: 'field' });
  const field = byId(root, 'share-url');
  assert.equal(field.value, 'https://site.test/play/crete/');
  assert.equal(globalThis.__focused, field);
  fire(field, 'keydown', { type: 'keydown', key: 'Escape' });
  assert.deepEqual(calls, []);
  fire(field, 'keydown', { type: 'keydown', key: 'q', ctrlKey: true });
  assert.deepEqual(calls, []);
  fire(field, 'keydown', { type: 'keydown', key: 'q', repeat: true });
  assert.deepEqual(calls, []);
  fire(field, 'keydown', { type: 'keydown', key: 'Q' });
  assert.deepEqual(calls, ['close-share']);
});

test('iOS steps: a dialog with the Share glyph; Done is focused; Q and Done close it, Escape does nothing', () => {
  const root = draw({ install: true });
  assert.equal(byId(root, 'install-steps').hidden, true);
  draw({ install: true, steps: true }, root);
  const veil = byId(root, 'install-steps');
  assert.equal(veil.hidden, false);
  assert.equal(childEl(veil).getAttribute('role'), 'dialog');
  assert.equal(byId(root, 'install-steps-title').textContent, 'Add to Home Screen');
  assert.equal(byId(root, 'install-steps-text').textContent, 'Tap Share, then Add to Home Screen.');
  assert.equal(walk(byId(root, 'install-steps-text')).some(n => n.localName === 'svg'), true);
  assert.equal(globalThis.__focused?.id, 'install-steps-done');
  fireDocument('keydown', { key: 'Escape' });
  assert.deepEqual(calls, []);
  fireDocument('keydown', { key: 'q' });
  click(byId(root, 'install-steps-done'));
  assert.deepEqual(calls, ['close-steps', 'close-steps']);
});

test('the "Link copied" status line is always in the page, and its empty state hides it visually, never with display: none', () => {
  const root = draw({});
  assert.ok(byId(root, 'share-status'), 'present while idle, so a screen reader hears the text arrive');
  assert.equal(byId(root, 'share-status').hidden, false);
  const css = readFileSync(join(import.meta.dirname, '..', 'ui', 'install-bar.tsx'), 'utf8');
  const empty = group(css.match(/\.kit-install-status:empty \{([^}]*)\}/));
  assert.doesNotMatch(empty, /display\s*:\s*none/);
  assert.match(empty, /clip-path/);
});

const maybeSvg = (el: StubElement) => walk(el).find(n => n.localName === 'svg');
const svgOf = (el: StubElement): StubElement => {
  const svg = maybeSvg(el);
  assert.ok(svg, 'no svg');
  return svg;
};
const pathsOf = (el: StubElement) => walk(svgOf(el)).map(n => n.localName).join(',');

test('Install and Share each carry an icon (hidden from screen readers) beside their word, which a phone hides visually, not with display: none', () => {
  const root = draw({ install: true });
  const buttons: Array<[id: string, word: string, title: string]> = [['install-btn', 'Install', 'Install this game as an app'], ['share-btn', 'Share', 'Share a link to this game']];
  for (const [id, word, title] of buttons) {
    const btn = byId(root, id);
    const icon = maybeSvg(btn);
    assert.ok(icon, `${id} has an icon`);
    assert.equal(icon.getAttribute('aria-hidden'), 'true');
    const txt = walk(btn).find(n => n.className === 'kit-install-txt');
    assert.ok(txt);
    assert.equal(txt.textContent, word, `${id}'s word stays in the page, so it is the accessible name`);
    assert.equal(btn.textContent, word);
    assert.equal(btn.getAttribute('title'), title);
  }
  const src = readFileSync(join(import.meta.dirname, '..', 'ui', 'install-bar.tsx'), 'utf8');
  const phone = group(src.match(/@media \(max-width: 600px\) \{([\s\S]*?)\n\}/));
  const txtRule = group(phone.match(/\.kit-install-txt \{([^}]*)\}/));
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
