// The loader's WebGL probe: false only when neither context can be made.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { webglAvailable } from '../src/modern-loader.ts';

const canvas = (ok: Record<string, boolean>) => () => ({ getContext: (k: string) => (ok[k] ? {} : null) });

test('no context at all means no WebGL', () => {
  assert.equal(webglAvailable(canvas({})), false);
});

test('either context is enough', () => {
  assert.equal(webglAvailable(canvas({ webgl2: true })), true);
  assert.equal(webglAvailable(canvas({ webgl: true })), true);
});

test('a canvas that throws means no WebGL', () => {
  assert.equal(webglAvailable(() => { throw new Error('no'); }), false);
});
