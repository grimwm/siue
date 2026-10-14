// games/tankity/test/rotate-hint.test.ts
// "Turn sideways for the full battlefield": in portrait, in a match, until dismissed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importTsx } from '../../_kit/test/tsx.ts';
import { asElement, document, click, installDocument } from '../../_kit/test/dom-stub.ts';

installDocument();
import { ROTATE_HINT_KEY, rotateHintShows } from '../src/rotate-hint.ts';

const { hint } = await importTsx<{ hint: typeof import('../src/ui/rotate-hint.tsx') }>(import.meta.dirname, { hint: '../src/ui/rotate-hint.tsx' });
const { renderRotateHint } = hint;

test('only in portrait, only in a match, only until dismissed', () => {
  assert.equal(rotateHintShows({ portrait: true, dismissed: false, playing: true }), true);
  assert.equal(rotateHintShows({ portrait: false, dismissed: false, playing: true }), false);
  assert.equal(rotateHintShows({ portrait: true, dismissed: true, playing: true }), false);
  assert.equal(rotateHintShows({ portrait: true, dismissed: false, playing: false }), false, 'never over the demo');
  assert.equal(ROTATE_HINT_KEY, 'tankity-rotate-hint');
});

test('the chip says it and closes', () => {
  const root = document.createElement('div');
  let closed = 0;
  renderRotateHint(asElement(root), true, () => { closed++; });
  assert.match(root.textContent, /Turn sideways for the full battlefield/);
  const x = root.querySelector('button');
  assert.ok(x, 'a button');
  assert.equal(x.getAttribute('aria-label'), 'Dismiss');
  click(x);
  assert.equal(closed, 1);
  renderRotateHint(asElement(root), false, () => {});
  assert.equal(root.querySelector('.rotate-hint'), null);
});
