// websites/www.cs/games/tankity/test/fullscreen.test.mjs
// Esc never takes the player out of full screen. Only two things may: the
// Fullscreen toggle (menu tile, F key) and Menu → Quit. These checks read the
// source of Tankity and the games kit, so a new exitFullscreen anywhere, a
// second fullscreen element, or an Esc handler that reaches the toggle or Quit
// fails here before it ships. Behaviour: smoke.test.mjs 'esc-keeps-fullscreen'
// (the whole run in full screen), _kit/test/app.test.mjs (the Esc lock) and
// tests/e2e/tankity-fullscreen-esc.spec.mjs (a real browser, on /play/).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const GAMES = path.join(import.meta.dirname, '..', '..');
const SKIP = new Set(['test', 'build', 'node_modules', 'dist', 'fixture']);

function sources(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) { if (!SKIP.has(ent.name)) out.push(...sources(path.join(dir, ent.name))); continue; }
    if (/\.tsx?$/.test(ent.name) && !ent.name.endsWith('.check.ts')) out.push(path.join(dir, ent.name));
  }
  return out;
}
const FILES = [...sources(path.join(GAMES, 'tankity', 'src')), ...sources(path.join(GAMES, '_kit'))]
  .map(f => ({ rel: path.relative(GAMES, f).split(path.sep).join('/'), src: fs.readFileSync(f, 'utf8') }));

/** The top-level function a position sits in (the last `function NAME(` starting a line up to it). */
function enclosing(src, at) {
  let name = '(top level)';
  const eol = src.indexOf('\n', at);
  for (const m of src.slice(0, eol < 0 ? src.length : eol).matchAll(/^(?:export )?(?:async )?function (\w+)/gm)) name = m[1];
  return name;
}
/** Every match of re, as "file:function". */
function sites(re) {
  const out = [];
  for (const { rel, src } of FILES) for (const m of src.matchAll(re)) out.push(`${rel}:${enclosing(src, m.index)}`);
  return [...new Set(out)].sort();
}
/** The body of a top-level function (to the next top-level function). */
function body(rel, name) {
  const { src } = FILES.find(f => f.rel === rel);
  const start = src.search(new RegExp(`^(?:export )?(?:async )?function ${name}\\b`, 'm'));
  assert.ok(start >= 0, `${rel} has no function ${name}`);
  const next = src.slice(start + 1).search(/^(?:export )?(?:async )?function \w+/m);
  return next < 0 ? src.slice(start) : src.slice(start, start + 1 + next);
}
/** A `key: () => { ... }` handler inside a body, up to its matching brace. */
function handler(src, key) {
  const at = src.search(new RegExp(`\\n\\s*${key}: (?:\\w+ )?=>|\\n\\s*${key}: \\(\\) =>`));
  assert.ok(at >= 0, `no ${key} handler`);
  let depth = 0;
  for (let i = src.indexOf('{', at); i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}' && --depth === 0) return src.slice(at, i + 1);
  }
  throw new Error(`unbalanced ${key} handler`);
}

test('the sources were found', () => {
  assert.ok(FILES.some(f => f.rel === 'tankity/src/main.ts') && FILES.some(f => f.rel === 'tankity/src/preview.ts'));
  assert.ok(FILES.some(f => f.rel === '_kit/app.ts') && FILES.some(f => f.rel === '_kit/ui/dialog.tsx'));
});

test('only the Fullscreen toggle and Quit leave full screen', () => {
  assert.deepEqual(sites(/\.exitFullscreen\s*\(/g), [
    '_kit/app.ts:browserAppEnv', // the port itself
    '_kit/app.ts:exitApp', // Menu → Quit
    'tankity/src/main.ts:toggleFullscreen',
  ]);
  assert.deepEqual(sites(/webkitExitFullscreen|webkitCancelFullScreen|mozCancelFullScreen|msExitFullscreen/g), []);
  // exitApp is Quit's alone, and the toggle is the F key's and the menu tile's.
  assert.deepEqual(sites(/\bexitApp\s*\(/g), ['_kit/app.ts:exitApp', 'tankity/src/main.ts:quitGame']);
  const quitLines = FILES.flatMap(f => f.src.split('\n').filter(l => /\bquitGame\s*\(/.test(l)).map(l => l.trim())).sort();
  assert.deepEqual(quitLines, ['async function quitGame(): Promise<void> {', 'quit: () => { void quitGame(); },'].sort());
  // menu.ts only declares it: the menu's Fullscreen tile is handed the function (onFullscreen).
  assert.deepEqual(sites(/\btoggleFullscreen\s*\(/g),
    ['tankity/src/main.ts:bindKeys', 'tankity/src/main.ts:toggleFullscreen', 'tankity/src/menu.ts:(top level)']);
  assert.match(FILES.find(f => f.rel === 'tankity/src/menu.ts').src, /onFullscreen: toggleFullscreen,/);
});

test('one fullscreen element (#frame), so a preview or dialog never replaces it', () => {
  // Requesting full screen on another element swaps the fullscreen element and drops the Esc lock.
  assert.deepEqual(sites(/\.requestFullscreen\s*\(/g), ['_kit/app.ts:browserAppEnv', '_kit/app.ts:enterFullscreen']);
  assert.deepEqual(sites(/\benterFullscreen\s*\(/g), ['_kit/app.ts:enterFullscreen', 'tankity/src/main.ts:toggleFullscreen']);
  // The top layer (<dialog>.showModal, popovers) answers Esc itself, before the game.
  assert.deepEqual(sites(/\.showModal\s*\(|\.showPopover\s*\(|\bpopover=/g), []);
});

test('Esc is held in full screen through the kit, from the top-level page, and never let go elsewhere', () => {
  // keyboard.lock() from inside a frame (the /play/ pages) is refused, so the lock is the top page's.
  assert.deepEqual(sites(/\.lock\s*\(\s*\[/g), ['_kit/app.ts:holdEscape']);
  assert.deepEqual(sites(/\b(?:kb|keyboard)\??\.unlock\s*\(/g), ['_kit/app.ts:holdEscape']);
  const lockFn = body('tankity/src/main.ts', 'lockEscapeInFullscreen');
  assert.match(lockFn, /holdEscape\(!!document\.fullscreenElement, topKeyLock\(window\)/);
  assert.match(FILES.find(f => f.rel === 'tankity/src/main.ts').src,
    /addEventListener\('fullscreenchange', lockEscapeInFullscreen\)/);
  // A refusal is reported, not swallowed by an empty catch.
  assert.doesNotMatch(body('_kit/app.ts', 'holdEscape'), /catch\s*\(\s*\(\)\s*=>\s*\{\s*\}\s*\)/);
});

test('the Esc handlers shut panels and previews and never reach the toggle or Quit', () => {
  const LEAVE = /toggleFullscreen|quitGame|exitApp|exitFullscreen|requestFullscreen|\.quit\b/;
  const keys = body('tankity/src/main.ts', 'bindKeys');
  for (const k of ['close', 'escape', 'modalEscape']) assert.doesNotMatch(handler(keys, k), LEAVE, k);
  for (const fn of ['openPreview', 'closePreview', 'togglePreview']) assert.doesNotMatch(body('tankity/src/main.ts', fn), LEAVE, fn);
  assert.doesNotMatch(FILES.find(f => f.rel === 'tankity/src/preview.ts').src, LEAVE, 'preview.ts');
  for (const rel of ['_kit/ui/dialog.tsx', '_kit/ui/install-bar.tsx']) {
    assert.doesNotMatch(FILES.find(f => f.rel === rel).src, LEAVE, rel);
  }
  // In game.json, Esc is bound to the closing commands only.
  const game = JSON.parse(fs.readFileSync(path.join(GAMES, 'tankity', 'game.json'), 'utf8'));
  const escBound = [];
  for (const [ctx, actions] of Object.entries(game.keys)) {
    for (const [action, tokens] of Object.entries(actions)) if (tokens.includes('Escape')) escBound.push(`${ctx}:${action}`);
  }
  assert.ok(escBound.length > 0, 'Esc is bound somewhere');
  for (const b of escBound) assert.match(b, /:(close|escape)$/, `Esc is bound to ${b}`);
});
