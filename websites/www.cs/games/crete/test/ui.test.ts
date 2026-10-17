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

const WON = { won: true, hasNext: true, kicker: 'Trial 1 cleared', title: 'The Mouth of the Labyrinth', text: 'You found the way on your own.', score: '14 moves · best 14' };
const LOST = { won: false, hasNext: false, kicker: 'Trial failed', title: 'The Minotaur has you', text: 'Your last heart is gone.', score: '9 moves' };
const calls = (seen: string[]) => ({
  onNext: () => seen.push('next'), onRetry: () => seen.push('retry'), onTrials: () => seen.push('trials'),
  onUndo: () => seen.push('undo'), onRestart: () => seen.push('restart'),
});

// Unmounting each root keeps one test's dialog from holding focus for the next.
const roots: StubElement[] = [];
const mount = () => { const root = makeEl('root'); roots.push(root); return root; };
afterEach(() => {
  for (const root of roots.splice(0)) render(null, root);
  document.activeElement = null;
  globalThis.__focused = null;
});

test('the ending card waits hidden until a trial ends', () => {
  const root = mount();
  renderEndCard(root, { open: false, ...WON, ...calls([]) });
  assert.equal(byId(root, 'end-veil').hidden, true);
  assert.equal(byId(root, 'end-veil').className, 'veil');
});

test('a won trial offers Next trial, Retry and Trials, and focuses Next trial', () => {
  const root = mount();
  const seen: string[] = [];
  renderEndCard(root, { open: false, ...WON, ...calls(seen) });
  renderEndCard(root, { open: true, ...WON, ...calls(seen) });
  assert.equal(byId(root, 'end-veil').hidden, false);
  const card = childEl(byId(root, 'end-veil'));
  assert.equal(card.className, 'card');
  assert.equal(card.getAttribute('aria-labelledby'), 'end-title');
  assert.deepEqual(['end-kicker', 'end-title', 'end-text', 'end-score'].map(id => byId(root, id).textContent),
    [WON.kicker, WON.title, WON.text, WON.score]);
  assert.equal(byId(root, 'end-score').className, 'runstats');
  assert.equal(document.activeElement?.id, 'end-next');
  for (const id of ['end-next', 'end-retry', 'end-trials']) click(byId(root, id));
  assert.deepEqual(seen, ['next', 'retry', 'trials']);
  assert.equal(maybeById(root, 'end-undo'), undefined);
  assert.equal(maybeById(root, 'end-restart'), undefined);
});

test('after the last trial there is no Next trial, and Retry takes the focus', () => {
  const root = mount();
  renderEndCard(root, { open: true, ...WON, hasNext: false, ...calls([]) });
  assert.equal(maybeById(root, 'end-next'), undefined);
  assert.equal(document.activeElement?.id, 'end-retry');
});

test('a lost trial offers Undo and Restart only', () => {
  const root = mount();
  const seen: string[] = [];
  renderEndCard(root, { open: true, ...LOST, ...calls(seen) });
  assert.equal(byId(root, 'end-title').textContent, 'The Minotaur has you');
  assert.equal(document.activeElement?.id, 'end-undo');
  click(byId(root, 'end-undo'));
  click(byId(root, 'end-restart'));
  assert.deepEqual(seen, ['undo', 'restart']);
  for (const id of ['end-next', 'end-retry', 'end-trials']) assert.equal(maybeById(root, id), undefined, id);
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
