// websites/www.cs/games/tankity/test/fullscreen.test.ts
// Esc never takes the player out of full screen, so no game ever asks for it:
// Safari and Firefox always leave full screen on Esc, whatever the page does,
// so Q is the back key everywhere and Esc does nothing in any game. Only two
// things may leave full screen: the Fullscreen toggle (menu tile, F key) and
// Menu → Quit. These checks read the source of the games and the games kit,
// so a new exitFullscreen anywhere, a second fullscreen element, a Q handler
// that reaches the toggle or Quit, or a key binding or visible hint that names
// Esc fails here before it ships. Behaviour: smoke.test.ts
// 'esc-keeps-fullscreen' (the whole run in full screen), _kit/test/app.test.ts
// (the Esc lock) and tests/e2e/tankity-fullscreen-esc.spec.ts (a real
// browser, on /play/).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import type { KeyDefs } from '../src/input.ts';

const GAMES = path.join(import.meta.dirname, '..', '..');
const SKIP = new Set(['test', 'build', 'node_modules', 'dist', 'fixture']);

function sources(dir: string): string[] {
  const out: string[] = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) { if (!SKIP.has(ent.name)) out.push(...sources(path.join(dir, ent.name))); continue; }
    if (/\.tsx?$/.test(ent.name) && !ent.name.endsWith('.check.ts')) out.push(path.join(dir, ent.name));
  }
  return out;
}
const FILES = [...sources(path.join(GAMES, 'tankity', 'src')), ...sources(path.join(GAMES, '_kit'))]
    .map(f => ({ rel: path.relative(GAMES, f).split(path.sep).join('/'), src: fs.readFileSync(f, 'utf8') }));
/** A scanned source file by its path, which must be there. */
function fileOf(rel: string): { rel: string; src: string } {
  const f = FILES.find(x => x.rel === rel);
  assert.ok(f, `${rel} is not among the scanned sources`);
  return f;
}

/** The top-level function a position sits in (the last `function NAME(` starting a line up to it). */
function enclosing(src: string, at: number): string {
  let name = '(top level)';
  const eol = src.indexOf('\n', at);
  for (const m of src.slice(0, eol < 0 ? src.length : eol).matchAll(/^(?:export )?(?:async )?function (\w+)/gm)) name = m[1] as string;
  return name;
}
/** Every match of re, as "file:function". */
function sites(re: RegExp): string[] {
  const out: string[] = [];
  for (const { rel, src } of FILES) for (const m of src.matchAll(re)) out.push(`${rel}:${enclosing(src, Number(m.index))}`);
  return [...new Set(out)].sort();
}
/** The body of a top-level function (to the next top-level function). */
function body(rel: string, name: string): string {
  const { src } = fileOf(rel);
  const start = src.search(new RegExp(`^(?:export )?(?:async )?function ${name}\\b`, 'm'));
  assert.ok(start >= 0, `${rel} has no function ${name}`);
  const next = src.slice(start + 1).search(/^(?:export )?(?:async )?function \w+/m);
  return next < 0 ? src.slice(start) : src.slice(start, start + 1 + next);
}
/** A `key: () => { ... }` handler inside a body, up to its matching brace. */
function handler(src: string, key: string): string {
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
  assert.match(fileOf('tankity/src/menu.ts').src, /onFullscreen: toggleFullscreen,/);
});

test('one fullscreen element (#frame), so a preview or dialog never replaces it', () => {
  // Requesting full screen on another element swaps the fullscreen element and drops the Esc lock.
  // (withWebkitFullscreen hands a standard request on to the kit's own port.)
  assert.deepEqual(sites(/\.requestFullscreen\s*\(/g), ['_kit/app.ts:browserAppEnv', '_kit/app.ts:enterFullscreen', 'tankity/src/play-fullscreen.ts:withWebkitFullscreen']);
  // The one request outside the toggle is a touch device's Play tap (src/play-fullscreen.ts), on the same frame.
  assert.deepEqual(sites(/\benterFullscreen\s*\(/g), ['_kit/app.ts:enterFullscreen', 'tankity/src/main.ts:toggleFullscreen', 'tankity/src/play-fullscreen.ts:fullscreenForPlay']);
  assert.match(body('tankity/src/main.ts', 'playFullscreen'), /\$\('frame'\)/);
  // The top layer (<dialog>.showModal, popovers) answers Esc itself, before the game.
  assert.deepEqual(sites(/\.showModal\s*\(|\.showPopover\s*\(|\bpopover=/g), []);
});

test('Esc is held in full screen through the kit, from the top-level page, and never let go elsewhere', () => {
  // keyboard.lock() from inside a frame (the /play/ pages) is refused, so the lock is the top page's.
  assert.deepEqual(sites(/\.lock\s*\(\s*\[/g), ['_kit/app.ts:holdEscape']);
  assert.deepEqual(sites(/\b(?:kb|keyboard)\??\.unlock\s*\(/g), ['_kit/app.ts:holdEscape']);
  const lockFn = body('tankity/src/main.ts', 'lockEscapeInFullscreen');
  assert.match(lockFn, /holdEscape\(!!document\.fullscreenElement, topKeyLock\(window\)/);
  assert.match(fileOf('tankity/src/main.ts').src,
    /addEventListener\('fullscreenchange', lockEscapeInFullscreen\)/);
  // A refusal is reported, not swallowed by an empty catch.
  assert.doesNotMatch(body('_kit/app.ts', 'holdEscape'), /catch\s*\(\s*\(\)\s*=>\s*\{\s*\}\s*\)/);
});

test('the Q handlers shut panels and previews and never reach the toggle or Quit', () => {
  const LEAVE = /toggleFullscreen|quitGame|exitApp|exitFullscreen|requestFullscreen|\.quit\b/;
  const keys = body('tankity/src/main.ts', 'bindKeys');
  for (const k of ['close', 'back', 'modalBack']) assert.doesNotMatch(handler(keys, k), LEAVE, k);
  // The shop's Q answers the same open things as the global back: Menu -> Standings
  // can sit over a room's shop, and Q must close that card before it opens the menu.
  assert.match(handler(keys, 'close'), /endVeilBack\(\)/, 'shop Q reaches the end card');
  for (const fn of ['openPreview', 'closePreview', 'togglePreview']) assert.doesNotMatch(body('tankity/src/main.ts', fn), LEAVE, fn);
  assert.doesNotMatch(fileOf('tankity/src/preview.ts').src, LEAVE, 'preview.ts');
  for (const rel of ['_kit/ui/dialog.tsx', '_kit/ui/install-bar.tsx']) {
    assert.doesNotMatch(fileOf(rel).src, LEAVE, rel);
  }
  // In game.json, Esc is bound nowhere, and Q only to the closing commands.
  const game: { keys: KeyDefs } = JSON.parse(fs.readFileSync(path.join(GAMES, 'tankity', 'game.json'), 'utf8'));
  const escBound: string[] = [], qBound: string[] = [];
  for (const [ctx, actions] of Object.entries(game.keys)) {
    for (const [action, tokens] of Object.entries(actions)) {
      if (tokens.some(t => /(^|\+)(Escape|Esc)$/i.test(t))) escBound.push(`${ctx}:${action}`);
      if (tokens.some(t => /^(KeyQ|q)$/i.test(t))) qBound.push(`${ctx}:${action}`);
    }
  }
  assert.deepEqual(escBound, [], 'Esc is bound');
  assert.deepEqual(qBound.sort(), ['global:back', 'shop:close']);
});

/* Every game's code and pages, outside tests and builds. */
function gameFiles() {
  const out: string[] = [];
  for (const game of fs.readdirSync(GAMES, { withFileTypes: true })) {
    if (!game.isDirectory() || SKIP.has(game.name)) continue;
    const dir = path.join(GAMES, game.name);
    const src = path.join(dir, game.name === '_kit' ? '.' : 'src');
    if (fs.existsSync(src)) out.push(...sources(src));
    for (const f of ['index.html']) if (fs.existsSync(path.join(dir, f))) out.push(path.join(dir, f));
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.css')) out.push(path.join(dir, f));
    const play = path.join(GAMES, '..', 'play', game.name, 'index.html');
    if (fs.existsSync(play)) out.push(play);
  }
  // The hub page that hosts Cylon's markup, and the /play/ page's own script and styles.
  const www = path.join(GAMES, '..');
  for (const f of ['index.html', 'play/play.js', 'play/play.css']) out.push(path.join(www, f));
  return out.map(f => ({ rel: path.relative(GAMES, f).split(path.sep).join('/'), src: fs.readFileSync(f, 'utf8') }));
}
/* The code and text of a file with its comments gone (they may explain why Esc is never used). */
const uncommented = (src: string) => src.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');

test('no game listens for Esc, and no button, hint or help text names it', () => {
  const files = gameFiles();
  for (const g of ['tankity/src/main.ts', 'cylon/src/main.ts', 'crete/src/ui.ts', '_kit/ui/dialog.tsx', '_kit/ui/install-bar.tsx', 'tankity/index.html', '../play/tankity/index.html',
    '../index.html', '../play/play.js', '../play/play.css', 'tankity/game.css', 'crete/game.css']) {
    assert.ok(files.some(f => f.rel === g), `${g} is scanned`);
  }
  const hits: string[] = [];
  for (const { rel, src } of files) {
    for (const m of uncommented(src).matchAll(/\bEsc\b|\bESC\b|['"`]Escape['"`]|\bEscape key\b/g)) hits.push(`${rel}: ${m[0]}`);
  }
  // Nor does any code test for Escape by its key code.
  const codes: string[] = [];
  for (const { rel, src } of files) {
    for (const m of uncommented(src).matchAll(/\b(?:keyCode|which|charCode)\s*[=!]==?\s*27\b|\b27\s*[=!]==?\s*\w+\.(?:keyCode|which)\b|\bcase\s+27\s*:/g)) codes.push(`${rel}: ${m[0]}`);
  }
  assert.deepEqual(codes, [], 'a key code 27 test');
  // What is left is the Keyboard Lock that keeps Chrome from leaving full
  // screen on Esc, and its console warning when the lock is refused.
  assert.deepEqual(hits.sort(), ["_kit/app.ts: 'Escape'", '_kit/app.ts: Esc']);
  assert.match(body('_kit/app.ts', 'holdEscape'), /warn\(`Keyboard Lock refused, so Esc will leave full screen/);
  assert.match(body('_kit/app.ts', 'holdEscape'), /lock\(\['Escape'\]\)/);
});
