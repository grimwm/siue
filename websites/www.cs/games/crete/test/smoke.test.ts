// Static checks on what ships: the page loads the bundle as a module with a
// version, the rules never name the page, and the test hook is exposed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const GAME = join(import.meta.dirname, '..');
const read = (...p: string[]) => readFileSync(join(GAME, ...p), 'utf8');
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

test('the page loads the bundle as a versioned module', () => {
  assert.match(read('index.html'), /<script type="module" src="dist\/main\.js\?v=[0-9a-f]{10}"><\/script>/);
});

test('the page versions its stylesheet', () => {
  assert.match(read('index.html'), /href="game\.css\?v=[0-9a-f]{10}"/);
});

// The DOM-free program lists the rules; none of its files may name the page.
const domFree = (): string[] => (JSON.parse(strip(read('tsconfig.json'))) as { files: string[] }).files;
test('the rules never name the page', () => {
  const files = domFree();
  assert.ok(files.includes('src/puzzle/step.ts') && files.includes('src/game.ts'), String(files));
  for (const file of files) {
    assert.doesNotMatch(strip(read(file)), /\b(document|window|navigator|localStorage|AudioContext)\b/, file);
  }
});

test('the entry hands the browser specs their test hook, and the bundle ships it', () => {
  assert.match(read('src/main.ts'), /window\.__creteTest = \{ game, TRIALS, solve, initial, trialLevel, LEVEL_IDS, CHAPTERS, solveInWorker, playLevel, parse, editor: editorHook \};/);
  assert.match(read('dist/main.js'), /__creteTest/);
  assert.doesNotMatch(read('dist/main.js'), /__mazeTest/);
});

test('the bundle starts the solver worker, which ships beside it and is precached', () => {
  const workerV = createHash('sha256').update(read('dist/solver-worker.js')).digest('hex').slice(0, 10);
  assert.match(read('dist/main.js'), new RegExp(`new Worker\\(new URL\\(["\`]solver-worker\\.js\\?v=${workerV}["\`]`), 'versioned by its own content hash');
  assert.match(read('dist/solver-worker.js'), /createSyncAccessHandle/);
  assert.match(read('sw.js'), /"dist\/solver-worker\.js"/);
});

// Games do not know the site: nothing the site's script defines may appear in
// the game. Skipped when the game is copied out of the site.
// Every .ts and .tsx file under src/, in its folders too.
const sources = (dir: string): string[] => readdirSync(dir, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? sources(join(dir, e.name)) : /\.tsx?$/.test(e.name) ? [join(dir, e.name)] : []);
const siteMain = join(GAME, '..', '..', 'main.js');
test('the game reaches no function the site script defines', { skip: !existsSync(siteMain) }, () => {
  const names = [...readFileSync(siteMain, 'utf8').matchAll(/^(?:async )?function (\w+)\(/gm)].map(m => m[1]);
  assert.ok(names.length > 5, String(names));
  const code = strip(sources(join(GAME, 'src')).map(f => readFileSync(f, 'utf8')).join('\n'));
  const reached = names.filter(n => new RegExp(`\\b${n}\\b`).test(code));
  assert.deepEqual(reached, []);
});

test("Play opens the card of the chapter to play on, and a ?seed= link Chapter 1's", () => {
  const main = read('src/main.ts');
  assert.match(main, /function play\(\)[^}]*ui\.showChapter\(ui\.playChapter\(\), false\)/);
  assert.match(main, /if \(direct\) \{[^}]*ui\.showChapter\(1, false\)/);
});

test('the entry follows the page: hidden ends the play-out and holds the music, shown goes on with the music', () => {
  const main = read('src/main.ts');
  assert.match(main, /followPage\(\{ doc: document, win: window \}, \{\s*hide: \(\) => \{\s*game\.stop\(\);\s*music\.hold\(\);\s*\},\s*show: music\.release,\s*\}\)/);
});

test('the page is one frame: no header, side panels or seed form, the board is a canvas, and the cards are inside it', () => {
  const html = read('index.html');
  for (const gone of ['class="topbar"', 'class="side"', 'id="seed-form"', 'id="hud-hp"', '<div\n          id="stage"', 'id="inventory-root"', '<h1']) {
    assert.ok(!html.includes(gone), gone);
  }
  const frame = html.slice(html.indexOf('<div id="frame"'), html.indexOf('<script type="module"'));
  assert.ok(frame.length > 0, 'a #frame');
  assert.match(frame, /<canvas id="stage" class="stage" role="img" aria-label="The labyrinth"><\/canvas>/);
  for (const id of ['status-root', 'board', 'stage', 'toast', 'strip-root', 'title-root', 'menu-root', 'levels-root', 'chapter-root', 'start-root', 'story-root', 'end-root']) {
    assert.ok(frame.includes(`id="${id}"`), `${id} inside #frame`);
  }
});

test('the frame is a size container, so the kit key tabs and the phone layouts can ask its size', () => {
  assert.match(read('game.css'), /#frame\s*\{[^}]*container:\s*frame\s*\/\s*size/);
});
