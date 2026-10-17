// Crete's Preact overlays in the DOM stub: the ids the page's CSS and the
// browser specs use, the text each shows, and that each button calls back.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { render as preactRender } from 'preact';
import type { ComponentChildren } from 'preact';
import { importTsx } from '../../_kit/test/tsx.ts';
import { asElement, byId, childEl, click, document, installDocument, makeEl, maybeById, renderTarget } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import type { EndCardProps } from '../src/ui/end.tsx';
import type { TitleCardProps } from '../src/ui/title.tsx';
import { KEYS } from '../src/keys.ts';

installDocument();
const ui = await importTsx<{
  end: typeof import('../src/ui/end.tsx');
  title: typeof import('../src/ui/title.tsx');
}>(import.meta.dirname, { end: '../src/ui/end.tsx', title: '../src/ui/title.tsx' });
// The overlays render into a DOM Element; the stub stands in for one.
const renderEndCard = (root: StubElement, props: EndCardProps): void => ui.end.renderEndCard(asElement(root), props);
const renderTitleCard = (root: StubElement, props: TitleCardProps): void => ui.title.renderTitleCard(asElement(root), props);
const render = (vnode: ComponentChildren, root: StubElement): void => preactRender(vnode, renderTarget(root));

const END = { kicker: 'You escaped', title: 'True Ending: Shut Down the Maze', text: 'Every page recovered.', score: 'Score 340 · 31 turns' };

// Unmounting each root keeps one test's dialog from holding focus for the next.
const roots: StubElement[] = [];
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
  const card = childEl(byId(root, 'end-veil'));
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

test('the title card names the game and focuses Play; Play calls back', () => {
  const root = makeEl('title-root');
  let played = 0;
  renderTitleCard(root, { open: false, hint: false, onPlay: () => { played++; } });
  assert.equal(byId(root, 'title-veil').hidden, true);
  renderTitleCard(root, { open: true, hint: false, onPlay: () => { played++; } });
  assert.equal(byId(root, 'title-veil').hidden, false);
  assert.equal(byId(root, 'title-name').textContent, 'The Island of Crete');
  assert.equal(maybeById(root, 'title-hint'), undefined);
  assert.equal(globalThis.__focused?.id, 'title-play');
  assert.equal(byId(root, 'title-play').textContent, `▶ Play (${KEYS.new.label})`);
  click(byId(root, 'title-play'));
  assert.equal(played, 1);
});

test('Story and Settings appear when the page gives them, and call back', () => {
  const root = makeEl('title-root');
  renderTitleCard(root, { open: true, hint: false, onPlay() {} });
  assert.equal(maybeById(root, 'title-story'), undefined);
  assert.equal(maybeById(root, 'title-settings'), undefined);
  const seen: string[] = [];
  renderTitleCard(root, { open: true, hint: false, onPlay() {}, onStory: () => seen.push('story'), onSettings: () => seen.push('settings') });
  assert.equal(byId(root, 'title-story').textContent, 'Story');
  assert.equal(byId(root, 'title-settings').textContent, 'Settings');
  click(byId(root, 'title-story'));
  click(byId(root, 'title-settings'));
  assert.deepEqual(seen, ['story', 'settings']);
});

test('the title card keeps a slot for the kit install bar', () => {
  const root = makeEl('title-root');
  renderTitleCard(root, { open: true, hint: false, onPlay() {} });
  assert.equal(byId(root, 'title-install').className, 'title-install');
});

test('an installed app that could not close says how to', () => {
  const root = makeEl('title-root');
  renderTitleCard(root, { open: true, hint: true, onPlay() {} });
  assert.equal(byId(root, 'title-hint').textContent, 'Swipe the app away to close it.');
});
