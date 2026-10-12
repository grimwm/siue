// importTsx bundles .tsx for a test and shares Node's one preact with it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { h, render } from 'preact';
import { importTsx } from './tsx.ts';
import { document, makeEl } from './dom-stub.mjs';

globalThis.document = document;
const { hello } = await importTsx(import.meta.dirname, { hello: './fixture/hello.tsx' });

test('a .tsx module loads and renders with the preact the test imported', () => {
  const root = makeEl('root');
  render(h(hello.Hello, { name: 'Crete' }), root);
  const p = root.children[0];
  assert.equal(p.localName, 'p');
  assert.equal(p.className, 'greet');
  assert.equal(p.textContent, 'Hello, Crete');
});
