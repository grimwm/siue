// websites/www.cs/games/_kit/test/dom-stub.test.ts
// The stub DOM in a failing assertion: node:assert prints a value with its
// getters, 1000 levels deep, so a stub node must print as its own subtree
// rather than as every path through the tree. Otherwise one failing assert
// on an element of a rendered page grows its message without bound and the
// test process takes all the machine's memory.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { installDocument, makeEl, makeText, renderTarget } from './dom-stub.ts';
import type { StubElement } from './dom-stub.ts';

installDocument();

/** A root with two children, each with two children, each holding a text. */
function tree(): StubElement {
  const root = makeEl('root');
  for (let i = 0; i < 2; i++) {
    const c = makeEl(`c${i}`);
    root.appendChild(c);
    for (let j = 0; j < 2; j++) {
      const g = makeEl(`g${i}${j}`);
      c.appendChild(g);
      g.appendChild(makeText(`t${i}${j}`));
    }
  }
  return root;
}

/** The message of a failing `assert.equal(value, undefined)`. */
function failure(value: unknown): string {
  try {
    assert.equal(value, undefined);
  } catch (err) {
    return (err as Error).message;
  }
  throw new Error('the assert passed');
}

test('a failing assert on a stub element prints its subtree, not every path through the tree', () => {
  const message = failure(tree().children[1]);
  assert.ok(message.length < 20_000, `the message is ${message.length} characters`);
  assert.match(message, /'g10'/, 'the subtree is in the message');
});

test('a failing assert on a stub text node stays short', () => {
  const root = tree();
  const text = (root.children[1] as StubElement).children[0]!.children[0]!;
  assert.ok(failure(text).length < 2_000);
});

test('a failing assert on a root Preact rendered into stays short', () => {
  const root = makeEl('root');
  const rows = [];
  for (let i = 0; i < 2; i++) rows.push(h('div', { id: `d${i}` }, h('span', null, h('b', null, `x${i}`)), h('p', null, 'y')));
  render(h('section', null, rows), renderTarget(root));
  const message = failure(root);
  assert.ok(message.length < 20_000, `the message is ${message.length} characters`);
  assert.match(message, /'d1'/, 'the rendered subtree is in the message');
});

test('the hidden tree links still read', () => {
  const root = tree();
  const c1 = root.children[1] as StubElement;
  assert.equal(c1.parentNode, root);
  assert.equal(c1.parentElement, root);
  assert.equal(c1.nextSibling, null);
  assert.equal((root.children[0] as StubElement).nextSibling, c1);
  assert.equal(root.firstChild, root.children[0]);
  assert.equal(c1.childNodes, c1.children);
  assert.equal(c1.textContent, 't10t11');
  assert.equal(c1.children[0]!.children[0]!.parentNode, c1.children[0]);
});
