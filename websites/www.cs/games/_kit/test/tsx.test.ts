// importTsx bundles .tsx for a test and shares Node's one preact with it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { importTsx } from './tsx.ts';
import { childEl, installDocument, makeEl, renderTarget } from './dom-stub.ts';

installDocument();
const { hello } = await importTsx<{ hello: typeof import('./fixture/hello.tsx') }>(import.meta.dirname, { hello: './fixture/hello.tsx' });

test('a .tsx module loads and renders with the preact the test imported', () => {
  const root = makeEl('root');
  render(h(hello.Hello, { name: 'Crete' }), renderTarget(root));
  const p = childEl(root);
  assert.equal(p.localName, 'p');
  assert.equal(p.className, 'greet');
  assert.equal(p.textContent, 'Hello, Crete');
});
