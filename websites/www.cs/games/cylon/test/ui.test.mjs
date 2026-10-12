// Cylon's Preact overlays in the DOM stub: the ids and classes css/*.css and
// the browser specs use, what each shows, and that every control calls back.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importTsx } from '../../_kit/test/tsx.ts';
import { document, makeEl, click, fire } from '../../_kit/test/dom-stub.mjs';

globalThis.document = document;
const ui = await importTsx(import.meta.dirname, { board: '../src/ui/board.tsx', help: '../src/ui/help.tsx', gameover: '../src/ui/gameover.tsx' });
const { renderHsRows } = ui.board;
const { renderHelp } = ui.help;
const { renderGameOver } = ui.gameover;

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

function gameOver(over = {}) {
  const calls = [];
  const props = {
    open: true, reason: 'A nuke landed on you. Frak.', kos: 7, hp: 12, mode: 'entry',
    initials: ['W', 'A', 'A'], active: 0, error: '', submitting: false,
    board: 'week', rows: ROWS, allTimeRank: null, resetText: 'Play often — scores reset every Sunday at midnight Central.', quit: false,
    onSpin: (i, d) => calls.push(['spin', i, d]), onPick: i => calls.push(['pick', i]), onSubmit: () => calls.push(['submit']),
    onSkip: () => calls.push(['skip']), onTab: (b, f) => calls.push(['tab', b, f]), onDismiss: () => calls.push(['dismiss']),
    ...over,
  };
  const root = makeEl('cylon-gameover-root');
  renderGameOver(root, props);
  return { root, calls };
}

test('a qualifying run opens on the initials, with its reason and stats', () => {
  const { root } = gameOver();
  assert.equal(byId(root, 'cylon-gameover').hidden, false);
  assert.equal(byId(root, 'cylon-gameover-title').textContent, 'Game Over');
  assert.equal(byId(root, 'cylon-gameover-reason').textContent, 'A nuke landed on you. Frak.');
  assert.deepEqual([byId(root, 'cylon-gameover-kos').textContent, byId(root, 'cylon-gameover-hits').textContent], ['7', '12']);
  assert.equal(byId(root, 'cylon-gameover-entry').hidden, false);
  assert.equal(byId(root, 'cylon-gameover-board').hidden, true);
  assert.deepEqual([0, 1, 2].map(i => byId(root, `cylon-initial-${i}`).textContent), ['W', 'A', 'A']);
  assert.equal(byId(root, 'cylon-initial-0').className, 'cylon-initial is-active');
  assert.equal(byId(root, 'cylon-initials-error').hidden, true);
  assert.equal(globalThis.__focused?.id, 'cylon-initial-0');
});

test('the initials answer the spinners, the wheel and the keys', () => {
  const { root, calls } = gameOver();
  const spins = byClass(root, 'cylon-initial-spin');
  click(spins[0]);
  click(spins[3]);
  fire(byClass(root, 'cylon-initial-slot')[2], 'wheel', { deltaY: 40 });
  const letter = byId(root, 'cylon-initial-1');
  for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter']) fire(letter, 'keydown', { key });
  click(byId(root, 'cylon-initial-2'));
  assert.deepEqual(calls, [
    ['spin', 0, 1], ['spin', 1, -1], ['spin', 2, -1],
    ['spin', 1, 1], ['spin', 1, -1], ['pick', 0], ['pick', 2], ['submit'],
    ['pick', 2],
  ]);
});

test('an error shows; a submit in flight cannot be sent twice; Skip calls back', () => {
  const { root, calls } = gameOver({ error: "Those initials aren't valid — choose another.", submitting: true });
  assert.equal(byId(root, 'cylon-initials-error').hidden, false);
  assert.equal(byId(root, 'cylon-initials-error').textContent, "Those initials aren't valid — choose another.");
  assert.equal(byId(root, 'cylon-score-submit').disabled, true);
  click(byId(root, 'cylon-score-skip'));
  assert.deepEqual(calls, [['skip']]);
});

test('the board shows the chosen tab, its rows, the reset note, and a new all-time rank', () => {
  const { root, calls } = gameOver({ mode: 'board', board: 'alltime', allTimeRank: 3 });
  assert.equal(byId(root, 'cylon-gameover-entry').hidden, true);
  assert.equal(byId(root, 'cylon-gameover-board').hidden, false);
  assert.deepEqual(['cylon-tab-week', 'cylon-tab-alltime'].map(id => byId(root, id).getAttribute('aria-selected')), ['false', 'true']);
  assert.equal(byId(root, 'cylon-gameover-panel').getAttribute('aria-labelledby'), 'cylon-tab-alltime');
  assert.equal(byId(root, 'cylon-gameover-scores').children.length, 2);
  assert.equal(byId(root, 'cylon-gameover-alltime').hidden, false);
  assert.equal(byId(root, 'cylon-gameover-alltime').textContent, 'New all-time #3!');
  assert.equal(byId(root, 'cylon-gameover-reset').textContent, 'Play often — scores reset every Sunday at midnight Central.');
  assert.equal(byId(root, 'cylon-play-again').textContent, 'Play Again');
  click(byId(root, 'cylon-tab-week'));
  fire(byId(root, 'cylon-tab-week'), 'keydown', { key: 'ArrowRight' });
  fire(byId(root, 'cylon-tab-alltime'), 'keydown', { key: 'Home' });
  click(byId(root, 'cylon-play-again'));
  assert.deepEqual(calls, [['tab', 'week', false], ['tab', 'alltime', true], ['tab', 'week', true], ['dismiss']]);
});

test('after a quit, the dismiss button closes instead of starting a run', () => {
  const { root } = gameOver({ mode: 'board', quit: true });
  assert.equal(byId(root, 'cylon-play-again').textContent, 'Close');
  assert.equal(byId(root, 'cylon-gameover-alltime').hidden, true);
});
