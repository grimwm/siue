// Crete's Preact overlays in the DOM stub: the ids the page's CSS and the
// browser specs use, the text each shows, and that each button calls back.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { render } from 'preact';
import { importTsx } from '../../_kit/test/tsx.ts';
import { document, makeEl, click } from '../../_kit/test/dom-stub.mjs';

globalThis.document = document;
const ui = await importTsx(import.meta.dirname, { end: '../src/ui/end.tsx' });
const { renderEndCard } = ui.end;

const walk = (el, out = []) => { for (const c of el.children) if (c.nodeType === 1) { out.push(c); walk(c, out); } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);
const END = { kicker: 'You escaped', title: 'True Ending: Shut Down the Maze', text: 'Every page recovered.', score: 'Score 340 · 31 turns' };

// Unmounting each root keeps one test's dialog from holding focus for the next.
const roots = [];
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
  const card = byId(root, 'end-veil').children[0];
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
