// The title card: the kit dialog with its buttons, the initials boxes that
// show the saved letters and report a typed set uppercase, and Settings
// saying whether the menu is open.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asElement, byId, click, elementOf, fire, installDocument, makeEl, maybeById, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import { manualClock } from '../../_kit/test/clock.ts';
import type { TitleProps } from '../src/ui/title.tsx';

installDocument();
const { title } = await importTsx<{ title: typeof import('../src/ui/title.tsx') }>(import.meta.dirname, { title: '../src/ui/title.tsx' });
const render = (root: StubElement, props: TitleProps) => title.renderTitle(asElement(root), props);
const KEYS: Record<string, string> = { 'global:new': 'N', 'global:rooms': 'O', 'global:tutorial': 'U', 'global:back': 'Q' };

function draw(over: Partial<TitleProps> = {}) {
  const root = makeEl('title-root');
  const calls = { initials: [] as string[], play: 0, friends: 0, tutorial: 0, settings: 0, share: 0, closeShare: 0 };
  const props: TitleProps = {
    keyHint: (c, a) => KEYS[`${c}:${a}`] ?? '', open: true, initials: 'BDJ', problem: '', hint: '', settingsOpen: false,
    onInitials: w => { calls.initials.push(w); }, onPlay: () => { calls.play++; }, onFriends: () => { calls.friends++; },
    onTutorial: () => { calls.tutorial++; }, onSettings: () => { calls.settings++; }, shareState: 'idle', shareUrl: '', onShare: () => { calls.share++; },
    onCloseShare: () => { calls.closeShare++; }, ...over,
  };
  render(root, props);
  return { root, calls, props };
}
const type = (box: StubElement, value: string) => { box.value = value; fire(box, 'input'); };
/** Item `i` of a list the case reads, which must be there. */
function nth<T>(list: readonly T[], i: number): T {
  const v = list[i];
  assert.ok(v !== undefined, `no item ${i} of ${list.length}`);
  return v;
}

test('the card is the kit dialog: a veil around a panel labelled and described by its own text', () => {
  const { root } = draw();
  const veil = byId(root, 'title-card');
  assert.equal(veil.className, 'title-veil');
  assert.equal(veil.hidden, false);
  const card = elementOf(nth(veil.children, 0));
  assert.equal(card.className, 'title-card');
  assert.equal(card.getAttribute('role'), 'dialog');
  assert.equal(card.getAttribute('aria-modal'), 'true');
  assert.equal(card.getAttribute('aria-labelledby'), 'title-h');
  assert.equal(card.getAttribute('aria-describedby'), 'title-tag');
  assert.equal(byId(root, 'title-h').textContent, 'Operation Tankity');
});

test('Play, Play with friends, Tutorial and Settings, each with its key chip', () => {
  const { root } = draw();
  assert.match(byId(root, 'title-play').textContent, /^▶ Play/);
  assert.match(byId(root, 'rooms-open').textContent, /^Play with Friends/);
  assert.match(byId(root, 'tutorial-open').textContent, /^🎓Tutorial/);
  assert.match(byId(root, 'title-settings').textContent, /^Settings/);
  const chip = walk(byId(root, 'title-play')).find(n => n.localName === 'kbd');
  assert.ok(chip, 'a key chip');
  assert.equal(chip.className, 'kit-key-tab key');
  assert.equal(chip.getAttribute('data-keyhint'), 'global:new');
  assert.equal(chip.getAttribute('aria-hidden'), 'true');
  assert.equal(chip.textContent, 'N');
});

test('a closed card stays in the page, hidden; opening it focuses Play', () => {
  const { root, props } = draw({ open: false });
  assert.equal(byId(root, 'title-card').hidden, true);
  globalThis.__focused = null;
  const focused = (): StubElement | null | undefined => globalThis.__focused;
  render(root, { ...props, open: true });
  assert.equal(byId(root, 'title-card').hidden, false);
  const took = focused();
  assert.ok(took, 'something took focus');
  assert.equal(took.id, 'title-play');
});

test('every button reports to the game', () => {
  const { root, calls } = draw();
  for (const id of ['title-play', 'rooms-open', 'tutorial-open', 'title-settings']) click(byId(root, id));
  assert.deepEqual([calls.play, calls.friends, calls.tutorial, calls.settings], [1, 1, 1, 1]);
});

test('the boxes show the saved initials, one letter each', () => {
  const { root } = draw({ initials: 'ZED' });
  assert.deepEqual([1, 2, 3].map(n => byId(root, `title-initial-${n}`).value), ['Z', 'E', 'D']);
  assert.equal(byId(root, 'title-initial-1').getAttribute('aria-label'), 'Initial 1 of 3');
});

test('typed letters show uppercase and a full set is reported; a non-letter is dropped', () => {
  const { root, calls } = draw({ initials: '' }); // empty boxes: a lone letter is not yet a set
  const [a, b, c] = [1, 2, 3].map(n => byId(root, `title-initial-${n}`)) as [StubElement, StubElement, StubElement];
  type(a, 'z');
  assert.equal(a.value, 'Z');
  type(b, '1');
  assert.equal(b.value, '');
  assert.deepEqual(calls.initials, []);
  type(b, 'e');
  type(c, 'd');
  assert.deepEqual(calls.initials, ['ZED']);
});

test('a refused set says why, and Settings follows the menu', () => {
  const { root } = draw({ problem: 'Those initials are not allowed. Pick others.', settingsOpen: true });
  assert.equal(byId(root, 'title-initials-note').textContent, 'Those initials are not allowed. Pick others.');
  assert.equal(byId(root, 'title-initials-note').getAttribute('role'), 'status');
  assert.equal(byId(root, 'title-settings').getAttribute('aria-expanded'), 'true');
});

test('retyping the last letter of a saved set reports it at once; retyping the first starts over', () => {
  const { root, calls } = draw({ initials: 'BDJ' });
  type(byId(root, 'title-initial-3'), 'x');
  assert.deepEqual(calls.initials, ['BDX']);
  type(byId(root, 'title-initial-1'), 'z');
  assert.equal(byId(root, 'title-initial-2').value, '');
  assert.deepEqual(calls.initials, ['BDX']);
});

test('an installed app that could not close says how, on the card, and only when asked', () => {
  const { root } = draw();
  assert.equal(maybeById(root, 'title-hint'), undefined);
  const shown = draw({ hint: 'Swipe the app away to close it.' });
  assert.equal(byId(shown.root, 'title-hint').textContent, 'Swipe the app away to close it.');
  assert.equal(byId(shown.root, 'title-hint').getAttribute('role'), 'status');
});

test('the hint belongs to the open card: gone when a match starts, not shown on a closed card', async () => {
  const { title: card } = await importTsx<{ title: typeof import('../src/title.ts') }>(import.meta.dirname, { title: '../src/title.ts' });
  const root = makeEl('title-root');
  const t = card.createTitle({
    $: id => (id === 'title-root' ? asElement(root) as HTMLElement : null), keyHint: () => '', initials: { get: () => 'BDJ', set() {}, subscribe: () => () => {} },
    play() {}, friends() {}, tutorial() {}, settings() {}, settingsOpen: () => false,
    games: () => ({ rows: [], alerts: 'off', age: 0, onOpen() {}, onAlerts() {} }),
    shareEnv: { share: null, copy: null, timers: manualClock().timers }, shareUrl: 'https://site.test/play/tankity/',
  });
  t.showHint('nobody sees this');
  assert.equal(maybeById(root, 'title-hint'), undefined, 'a closed card shows nothing');
  t.openTitle();
  t.showHint('Swipe the app away to close it.');
  assert.equal(byId(root, 'title-hint').textContent, 'Swipe the app away to close it.');
  t.closeTitle();
  t.openTitle();
  assert.equal(maybeById(root, 'title-hint'), undefined, 'the next card starts clean');
});

test('Tutorial is a secondary button of its own: the accent outline and a 🎓 the screen reader skips', () => {
  const { root } = draw();
  const tut = byId(root, 'tutorial-open');
  assert.equal(tut.className, 'title-tutorial');
  assert.doesNotMatch(String(tut.className), /btn-primary/);
  const icon = walk(tut).find(n => n.className === 'title-tutorial-icon');
  assert.ok(icon, 'an icon');
  assert.equal(icon.getAttribute('aria-hidden'), 'true');
  assert.equal(icon.textContent, '🎓');
});

test('Share sits beside Play in one row: a labelled icon button that reports, and shows the shared icon', () => {
  const { root, calls } = draw();
  const play = byId(root, 'title-play');
  const share = byId(root, 'title-share');
  assert.equal(play.parentElement, share.parentElement, 'one row');
  assert.equal(share.getAttribute('aria-label'), 'Share');
  assert.equal(share.getAttribute('title'), 'Share a link to this game');
  assert.equal(share.textContent, '');
  const paths = walk(share).filter(n => n.localName === 'path').map(n => n.getAttribute('d'));
  assert.equal(paths[0], 'M12 15V3M7 8l5-5 5 5');
  click(share);
  assert.equal(calls.share, 1);
});

test('after Share: "Link copied" in a status line, or the address in a field that Q closes', () => {
  assert.equal(byId(draw({ shareState: 'copied' }).root, 'title-share-status').textContent, 'Link copied');
  assert.equal(byId(draw().root, 'title-share-status').textContent, '');
  assert.equal(maybeById(draw().root, 'title-share-url'), undefined);
  const { root, calls } = draw({ shareState: 'field', shareUrl: 'https://site.test/play/tankity/' });
  const field = byId(root, 'title-share-url');
  assert.equal(field.value, 'https://site.test/play/tankity/');
  fire(field, 'keydown', { key: 'q', stopPropagation: () => {} });
  assert.equal(calls.closeShare, 1);
});

test('the card\'s Share goes through the kit\'s share helper: the sheet gets the game\'s /play/tankity/ address', async () => {
  const { title: card } = await importTsx<{ title: typeof import('../src/title.ts') }>(import.meta.dirname, { title: '../src/title.ts' });
  const root = makeEl('title-root');
  const shared: Array<{ title: string; url: string }> = [];
  card.createTitle({
    $: id => (id === 'title-root' ? asElement(root) as HTMLElement : null), keyHint: () => '', initials: { get: () => 'BDJ', set() {}, subscribe: () => () => {} },
    play() {}, friends() {}, tutorial() {}, settings() {}, settingsOpen: () => false,
    games: () => ({ rows: [], alerts: 'off', age: 0, onOpen() {}, onAlerts() {} }),
    shareEnv: { share: async d => { shared.push(d); }, copy: null, timers: manualClock().timers }, shareUrl: 'https://site.test/play/tankity/',
  }).openTitle();
  click(byId(root, 'title-share'));
  await Promise.resolve();
  assert.deepEqual(shared, [{ title: 'Operation Tankity', url: 'https://site.test/play/tankity/' }]);
});
