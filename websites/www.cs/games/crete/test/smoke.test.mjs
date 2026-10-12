// Static checks on what ships: the page loads the bundle as a module with a
// version, the engine never names the page, and the test hook is exposed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const GAME = join(import.meta.dirname, '..');
const read = (...p) => readFileSync(join(GAME, ...p), 'utf8');
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

test('the page loads the bundle as a versioned module', () => {
  assert.match(read('index.html'), /<script type="module" src="dist\/main\.js\?v=[0-9a-f]{10}"><\/script>/);
});

test('the page versions its stylesheet', () => {
  assert.match(read('index.html'), /href="game\.css\?v=[0-9a-f]{10}"/);
});

test('the engine never names the page', () => {
  assert.doesNotMatch(strip(read('src/engine.ts')), /\b(document|window|navigator|localStorage|AudioContext)\b/);
});

test('the bundle exposes the browser specs\' test hook', () => {
  assert.match(read('dist/main.js'), /__mazeTest/);
});
