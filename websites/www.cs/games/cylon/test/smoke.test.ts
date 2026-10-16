// Static checks on what ships: the entry's export and theme hook, the mount and
// score fetches, no name clashes with the site's main.js, and no stale "Monday".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const GAME = join(import.meta.dirname, '..');
const read = (...p: string[]) => readFileSync(join(GAME, ...p), 'utf8');
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const main = read('src/main.ts');

test('the entry exports initializeCylonEffects with an options object', () => {
  assert.match(main, /^export async function initializeCylonEffects\(options\b/m);
  assert.match(read('dist/main.js'), /initializeCylonEffects/);
});

test('the entry finds its files by its own URL', () => {
  assert.doesNotMatch(main, /data-cylon-base|data-cylon-api|cylonAsset/);
  assert.ok(main.includes('import.meta.url'));
});

test('the theme reaches the site only through options.onTheme', () => {
  assert.match(main, /options\.onTheme/);
});

test('mount.html is fetched with its build-time version', () => {
  assert.match(main, /new URL\(`\.\.\/mount\.html\?v=\$\{MOUNT_HTML_V\}`, import\.meta\.url\)/);
  assert.doesNotMatch(read('dist/main.js'), /MOUNT_HTML_V/);
});

test('the scores endpoint is found next to the game folder, not the bundle', () => {
  assert.match(main, /new URL\('\.\.\/scores\.php', import\.meta\.url\)/);
});

test('the site page imports the bundle with a version', () => {
  assert.match(read('..', '..', 'index.html'), /import\('\.\/games\/cylon\/dist\/main\.js\?v=[0-9a-f]+'\)/);
});

// Games do not know the site: nothing the site's scripts define may appear in
// the game. Skipped when the game is copied out of the site.
const siteMain = join(GAME, '..', '..', 'main.js');
const gameCode = () => strip([
  ...readdirSync(join(GAME, 'src')).filter(f => f.endsWith('.ts')).map(f => read('src', f)),
  ...readdirSync(join(GAME, 'src', 'ui')).filter(f => f.endsWith('.tsx')).map(f => read('src', 'ui', f)),
].join('\n'));

test('the game reaches no function the site script defines', { skip: !existsSync(siteMain) }, () => {
  const names = [...readFileSync(siteMain, 'utf8').matchAll(/^(?:async )?function (\w+)\(/gm)].map(m => m[1]);
  assert.ok(names.length > 5, String(names));
  const code = gameCode();
  assert.deepEqual(names.filter(n => new RegExp(`\\b${n}\\b`).test(code)), []);
});

test('the game reaches no variable the site script defines', { skip: !existsSync(siteMain) }, () => {
  const names = [...readFileSync(siteMain, 'utf8').matchAll(/^(?:const|let|var) (\w+)\s*=/gm)].map(m => m[1]);
  const code = gameCode();
  assert.deepEqual(names.filter(n => new RegExp(`\\b${n}\\b`).test(code)), []);
});

// The board resets on Sunday; no page, manifest or description may still say Monday.
test('no Cylon file says Monday', () => {
  const files = {
    'metadata.yaml': read('metadata.yaml'),
    'manifest.webmanifest': read('manifest.webmanifest'),
    'mount.html': read('mount.html'),
    'src/ui/settings.tsx': read('src', 'ui', 'settings.tsx'),
    'src/gameover.ts': read('src', 'gameover.ts'),
    'play/cylon/index.html': read('..', '..', 'play', 'cylon', 'index.html'),
  };
  const stale = Object.entries(files).filter(([, body]) => /\bMonday\b/.test(body)).map(([name]) => name);
  assert.deepEqual(stale, []);
});

test('the site page keeps an empty settings panel for the game to draw into', () => {
  assert.match(read('..', '..', 'index.html'), /<div class="cylon-settings-panel" id="cylon-settings-panel" hidden><\/div>/);
});

test('opening How to Play focuses its button first, so closing can return focus on Safari', () => {
  const found = strip(main).match(/function openHelp\(\) \{[\s\S]*?\n    \}\n/);
  assert.ok(found);
  const open = found[0];
  const focusAt = open.indexOf('helpBtn?.focus()');
  assert.ok(focusAt > 0 && focusAt < open.indexOf('helpOpen = true'));
});

test('the drones are buttons a screen reader can reach: no container of theirs is aria-hidden', () => {
  const mount = read('mount.html');
  for (const id of ['cylon-battlefield', 'cylon-ambush-under']) {
    const tag = new RegExp(`<div[^>]*id="${id}"[^>]*>`).exec(mount);
    assert.ok(tag, id);
    assert.doesNotMatch(tag[0], /aria-hidden/, id);
    assert.match(tag[0], /role="group" aria-label="[^"]+"/, id);
  }
});

test('the ability keys skip a text box through the kit\'s typesText, and Esc is never bound', () => {
  assert.match(main, /import \{ typesText \} from '\.\.\/\.\.\/_kit\/keys\.ts'/);
  assert.match(main, /if \(typesText\(e\.target\)\) return;/);
  assert.doesNotMatch(main, /isTypingTarget/);
  assert.doesNotMatch(strip(main), /['"]Escape['"]|['"]Esc['"]|keyCode\s*===?\s*27/);
});
