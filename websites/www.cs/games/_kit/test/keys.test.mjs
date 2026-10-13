// websites/www.cs/games/_kit/test/keys.test.mjs
// The back key: Q in either case, never with Ctrl, Cmd or Alt, never Escape;
// and which targets type Q as a letter.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BACK_KEY, isBackKey, typesText } from '../keys.ts';

test('Q is the back key, in either case', () => {
  assert.equal(BACK_KEY, 'Q');
  assert.equal(isBackKey({ key: 'q' }), true);
  assert.equal(isBackKey({ key: 'Q' }), true);
});

test('Escape is never the back key', () => {
  assert.equal(isBackKey({ key: 'Escape' }), false);
  assert.equal(isBackKey({ key: 'Esc' }), false);
});

test('Q with a modifier, or mid-composition, is not the back key', () => {
  for (const mod of ['ctrlKey', 'metaKey', 'altKey', 'isComposing']) assert.equal(isBackKey({ key: 'q', [mod]: true }), false, mod);
});

test('boxes that take letters type Q; a read-only field and a button do not', () => {
  assert.equal(typesText({ tagName: 'INPUT' }), true);
  assert.equal(typesText({ tagName: 'TEXTAREA' }), true);
  assert.equal(typesText({ tagName: 'SELECT' }), true);
  assert.equal(typesText({ tagName: 'DIV', isContentEditable: true }), true);
  assert.equal(typesText({ tagName: 'INPUT', readOnly: true }), false);
  assert.equal(typesText({ tagName: 'BUTTON' }), false);
  for (const type of ['range', 'checkbox', 'radio', 'button', 'submit', 'color', 'file']) {
    assert.equal(typesText({ tagName: 'INPUT', type }), false, type);
  }
  for (const type of ['text', 'search', 'number', 'email', 'password', 'url', 'tel', undefined]) {
    assert.equal(typesText({ tagName: 'INPUT', type }), true, String(type));
  }
  assert.equal(typesText(null), false);
});
