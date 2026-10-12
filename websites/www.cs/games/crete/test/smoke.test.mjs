// Static checks on what ships: the page loads the bundle as a module with a
// version, the rules never name the page, and the test hook is exposed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
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

test('the rules never name the page', () => {
  for (const file of ['engine.ts', 'grid.ts', 'bots.ts']) {
    assert.doesNotMatch(strip(read('src/' + file)), /\b(document|window|navigator|localStorage|AudioContext)\b/, file);
  }
});

test('the entry hands the browser specs their test hook, and the bundle ships it', () => {
  assert.match(read('src/main.ts'), /window\.__mazeTest = \{/);
  assert.match(read('dist/main.js'), /__mazeTest/);
});

// Games do not know the site: nothing the site's script defines may appear in
// the game. Skipped when the game is copied out of the site.
const siteMain = join(GAME, '..', '..', 'main.js');
test('the game reaches no function the site script defines', { skip: !existsSync(siteMain) }, () => {
  const names = [...readFileSync(siteMain, 'utf8').matchAll(/^(?:async )?function (\w+)\(/gm)].map(m => m[1]);
  assert.ok(names.length > 5, String(names));
  const code = strip(readdirSync(join(GAME, 'src')).filter(f => f.endsWith('.ts')).map(f => read('src', f)).join('\n'));
  const reached = names.filter(n => new RegExp(`\\b${n}\\b`).test(code));
  assert.deepEqual(reached, []);
});
