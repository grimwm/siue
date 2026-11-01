// Headless smoke for the Scorched Earth rewrite. Exercises the exact shipped
// bundle (dist/fx.js, then dist/main.js) with a small DOM + canvas stub
// (games/_kit/test/dom-stub.ts), driving only public inputs (keydown/keyup). The stub is a
// real tree because the Preact overlays render into it. Also holds the static
// checks on the page, CSS, source and PHP. Fails loudly on any exception, a stuck
// turn loop, an unscrolled Space, or a silent battlefield.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { sweepHit } from '../src/sim.ts';
import type { Gear, Tank, Weapon } from '../src/sim.ts';
import type { KeyContext, KeyDefs } from '../src/input.ts';
import type { RoomSnapshot } from '../src/protocol.ts';
import type { FxSetData, FxSys } from '../src/fx/types.ts';
import { els, click, submit, fire, document, installDocument, childEl, elementOf } from '../../_kit/test/dom-stub.ts';
import type { Callable, StubElement, StubNode } from '../../_kit/test/dom-stub.ts';

/** A value the check expects to be there (a find that must succeed, a file the game has). */
function must<T>(v: T | null | undefined, what: string): T {
  assert.ok(v !== null && v !== undefined, `no ${what}`);
  return v;
}
/** The i-th item of a list the check expects to hold it. */
function nth<T>(list: readonly T[], i: number): T {
  const v = list[i];
  assert.ok(v !== undefined, `no item ${i} of ${list.length}`);
  return v;
}
/** The element the game made with that id, which the check expects to be there. */
function E(id: string): StubElement {
  return must(els[id], '#' + id);
}
/** A fake 2D context as the engine's draw calls take it: the fake holds only the members those calls use. */
function asContext(c: object): CanvasRenderingContext2D {
  return c as unknown as CanvasRenderingContext2D;
}
/** Every child of a list the check knows holds only elements (rows, tiles). */
function kids(el: StubElement): StubElement[] {
  return el.children.map(elementOf);
}
/** The i-th child node (element or text), which the check expects to be there. */
function nodeAt(el: StubNode, i: number): StubNode {
  return nth(el.children, i);
}

const GAME_DIR = path.join(import.meta.dirname, '..');
const read = (file: string) => fs.readFileSync(path.join(GAME_DIR, file), 'utf8');
const mainSrc = read('src/main.ts');
// The page's code is src/main.ts and the typed modules it wires (src/*.ts); the checks that read
// the source for a rule look at all of it, so they hold wherever a function lives.
const moduleFiles = fs.readdirSync(path.join(GAME_DIR, 'src')).filter(f => f.endsWith('.ts') && f !== 'main.ts' && !f.endsWith('.check.ts')).sort();
const moduleSrc = Object.fromEntries(moduleFiles.map(f => [f, read('src/' + f)]));
const moduleOf = (f: string) => must(moduleSrc[f], 'src/' + f);
const src = [mainSrc, ...Object.values(moduleSrc)].join('\n');
const audioSrc = read('src/audio.ts');
const renderSrc = read('src/render.ts');
// Closing the tab keeps every seat: only an explicit Leave tells the server.
await test('no-leave-on-close', () => { assert.ok(!/pagehide[^\n]*sendLeave|pagehide[^\n]*leave\(/.test(mainSrc)); });

// The game and its audio keep timers running for good; remember every one so the
// run can end by clearing them instead of by killing the process.
const liveTimers = new Set<NodeJS.Timeout>();
for (const name of ['setTimeout', 'setInterval'] as const) {
  const real: (fn: () => void, ms?: number) => NodeJS.Timeout = globalThis[name];
  Reflect.set(globalThis, name, (...args: Parameters<typeof real>) => { const h = real(...args); liveTimers.add(h); return h; });
}

/** What the test hands a window listener: a key press's fields, or nothing (a blur). */
interface WinEvent { key?: string; code?: string; repeat?: boolean; shiftKey?: boolean; target?: { tagName: string }; preventDefault?: () => void }
type WinListener = (ev?: WinEvent) => void;
const listeners: Record<string, WinListener[]> = {}; // type -> [fn] on window
installDocument();
// Node has a BroadcastChannel, which would keep the run alive: the page takes
// the localStorage fallback here, as in a browser without one.
Reflect.set(globalThis, 'BroadcastChannel', undefined);
const stubStorage: { _m: Record<string, string>; getItem(k: string): string | null; setItem(k: string, v: unknown): void } = {
  _m: {}, getItem(k) { return this._m[k] || null; }, setItem(k, v) { this._m[k] = String(v); },
};
Reflect.set(globalThis, 'window', {
  addEventListener: (t: string, f: WinListener) => { (listeners[t] = listeners[t] || []).push(f); },
  matchMedia: () => ({ matches: false }),
  localStorage: stubStorage,
});
// Importing a module takes a turn of the event loop, so the boot's own requests
// would answer before the checks below start. They wait here until the async
// block opens the gate, as they did when the script was evaluated in place.
let openBootGate: () => void = () => {};
const bootGate = new Promise<void>(r => { openBootGate = r; });
Reflect.set(globalThis, 'fetch', async (url: unknown) => {
  await bootGate;
  if (/game\.json$/.test(String(url))) {
    // Real keys, audio and effects; the arsenal section is withheld so the shop checks
    // below keep exercising the baked fallback arsenal (the file's own arsenal
    // is validated separately from disk).
    return { ok: true, json: async () => {
      const g: { arsenal?: unknown } = JSON.parse(read('game.json'));
      delete g.arsenal;
      return g;
    } };
  }
  return { ok: true, json: async () => ({ scores: [] }) };
});
Reflect.set(globalThis, 'location', { origin: 'http://localhost:8000', pathname: '/operation-tankity/index.html', search: '' });
// A friend arrives on an invite link: the boot consumes ?code= once.
global.location.search = '?code=zz99';
// What the page's clipboard copy handed over, the frame callback it asked for,
// and the state the fake AudioContext reports: kept here, where the test reads them.
let copied: string | undefined;
let rafCb: FrameRequestCallback | undefined;
let acState: AudioContextState | undefined;
Object.defineProperty(globalThis, 'navigator',
  { value: { clipboard: { writeText: async (t: string) => { copied = t; } } }, configurable: true });
// The room puzzle's WebCrypto, answered at once. Node's real PBKDF2 settles on its thread pool, after however many
// ticks a busy runner takes, so a host or join could land after the checks that wait for it with tick(). A key
// derived as all zero bits solves any puzzle; test/pow.test.ts checks the real solve.
const realCrypto = globalThis.crypto;
Object.defineProperty(globalThis, 'crypto', { value: {
  getRandomValues: realCrypto.getRandomValues.bind(realCrypto),
  randomUUID: realCrypto.randomUUID.bind(realCrypto),
  subtle: { importKey: async () => ({}), deriveBits: async () => new ArrayBuffer(32) },
}, configurable: true });
global.requestAnimationFrame = cb => { rafCb = cb; return 1; };
// Fake WebAudio: proves the synth + scheduler run without a browser, and lets
// the test jump the clock forward like a background tab would.
const AC_TIME = { t: 0 };
const FAKE_STATS = { notes: 0 };
function fakeParam() { return { setValueAtTime() {}, exponentialRampToValueAtTime() {} }; }
class FakeNode {
  frequency = fakeParam();
  gain = fakeParam();
  connect() {}
  start() { FAKE_STATS.notes++; }
  stop() {}
}
// The audio module reaches WebAudio through globalThis, as a browser's window is.
Reflect.set(globalThis, 'AudioContext', class {
  sampleRate = 44100;
  destination = {};
  get state() { return acState || 'running'; }
  get currentTime() { return AC_TIME.t; }
  // Like a real pre-gesture context, resume stays pending until the test
  // flips acState itself, so the suspend gate can be observed.
  resume() { return new Promise(() => {}); }
  createOscillator() { return new FakeNode(); }
  createGain() { return new FakeNode(); }
  createBuffer(_ch: number, len: number) { return { getChannelData: () => new Float32Array(len) }; }
  createBufferSource() { return new FakeNode(); }
  createBiquadFilter() { return new FakeNode(); }
});

// ---- boot the exact shipped module ----
// The whole run plays in full screen: Q on previews, the shop, the gun
// picker and the menu, and Esc anywhere, must never leave it (checked at the
// end, 'esc-keeps-fullscreen').
const fsExits: (string | undefined)[] = [];
document.fullscreenElement = document.getElementById('frame');
document.exitFullscreen = async () => { fsExits.push(new Error('exitFullscreen').stack); };
eval(read('dist/fx.js'));
await import(pathToFileURL(path.join(GAME_DIR, 'dist/main.js')).href);

// ---- driver: every press below comes from game.json's keys, so the suite proves the
// file and the shipped bindings agree instead of hardcoding keys twice ----
/** game.json, as far as these checks read it. */
interface GameJson { keys: KeyDefs; arsenal: { ammo: Weapon[]; gear: Gear[] }; effects: Record<string, FxSetData> }
const GAME: GameJson = JSON.parse(read('game.json'));
const KEYS = GAME.keys;
for (const ctx of ['aim', 'shop', 'global', 'scroll'] as const) {
  if (!KEYS[ctx]) throw new Error('game.json is missing keys context ' + ctx);
}
type Mods = { shiftKey?: boolean };
function pressToken(t: string | undefined): [string, string | undefined, Mods] {
  t = String(t);
  const mods: Mods = /^Shift\+/.test(t) ? { shiftKey: true } : {};
  t = t.replace(/^(Ctrl|Shift)\+/, '');
  let m = /^Key([A-Z])$/.exec(t);
  if (m) return [must(m[1], 'key letter').toLowerCase(), 'Key' + m[1], mods];
  m = /^Digit([0-9])$/.exec(t);
  if (m) return [must(m[1], 'digit'), 'Digit' + m[1], mods];
  if (t === 'Space' || t === ' ') return [' ', 'Space', mods];
  if (t === 'ControlLeft' || t === 'ControlRight') return ['Control', t, mods];
  if (t === 'Control') return ['Control', 'ControlLeft', mods];
  return [t, /^[A-Z][A-Za-z]*$/.test(t) ? t : undefined, mods];
}
/** The keys game.json binds to an action, which the check expects it to bind. */
const keyList = (ctx: KeyContext, a: string) => must(KEYS[ctx][a], `keys.${ctx}.${a}`);
const KB = (ctx: KeyContext, a: string, i?: number) => pressToken((KEYS[ctx][a] || [])[i || 0]);
const KBD = (ctx: KeyContext, a: string, n: number) => pressToken((KEYS[ctx][a] || [])[n - 1]);
const KD = (ctx: KeyContext, a: string, i?: number, extra?: WinEvent) => { const [k, c, mods] = KB(ctx, a, i); keyDown(k, c, { ...mods, ...extra }); };
const KU = (ctx: KeyContext, a: string, i?: number) => { const [k, c] = KB(ctx, a, i); keyUp(k, c); };
const TAP = (ctx: KeyContext, a: string, i?: number, extra?: WinEvent) => { KD(ctx, a, i, extra); KU(ctx, a, i); };
const TAPD = (ctx: KeyContext, a: string, n: number, extra?: WinEvent) => { const [k, c, mods] = KBD(ctx, a, n); keyDown(k, c, { ...mods, ...extra }); keyUp(k, c); };
function keyDown(k: string, code: string | undefined, extra?: WinEvent) {
  for (const f of listeners['keydown'] || []) f(Object.assign({ key: k, code, preventDefault: () => {}, repeat: false }, extra));
}
function keyUp(k: string, code: string | undefined) {
  for (const f of listeners['keyup'] || []) f({ key: k, code });
}
let ts = 0;
function frames(n: number) {
  for (let i = 0; i < n; i++) { ts += 16.7; must(rafCb, 'frame callback')(ts); }
}
const logText = () => E('log').children.map(li => li.textContent).join('\n');

// Boot runs a demo battle: no veils, no ambush shop, crew drives every tank.
for (const id of ['new-game', 'round-banner', 'round-banner-text', 'preview-result']) {
  void document.getElementById(id);
}
frames(30);
await test('demo-plays', () => { assert.ok(E('shop-veil').hidden === true && E('hud-armor').textContent === '100', E('hud-armor').textContent); });
const rendered = (id: string) => { const el = els[id]; return !!el && !!el.localName; };
const titleVeil = () => childEl(E('title-root'), 0);
await test('no-ambush-shop', () => { assert.ok(E('shop-veil').hidden === true); });
await test('title-card-over-the-demo', () => { assert.ok(titleVeil().id === 'title-card' && titleVeil().hidden === false && rendered('title-play') && rendered('rooms-open') && rendered('tutorial-open')); });

// Space must always preventDefault (no page scroll), both binding paths
let pd = 0;
for (const f of listeners['keydown'] || []) {
  f({ code: 'Space', key: 'x', preventDefault: () => { pd++; }, repeat: false });
  f({ key: ' ', preventDefault: () => { pd++; }, repeat: false });
}
await test('keys-no-scroll', () => { assert.ok(pd === 2, `prevented=${pd}/2`); });
// Fullscreen degrades honestly where the API is absent (as in this stub).
TAP('global', 'fullscreen'); frames(2);
// The kit's toggle answers asynchronously: wait, a bounded number of turns, for its message.
for (let turn = 0; turn < 50 && !/Fullscreen is not supported/.test(logText()); turn++) await new Promise(r => setImmediate(r));
await test('fullscreen-fallback', () => { assert.ok(/Fullscreen is not supported/.test(logText())); });
// Sound and music mute separately, by button or by key, without touching each other.
const pressed = (id: string) => E(id).getAttribute('aria-pressed');
click(E('btn-sound'));
await test('sound-off', () => { assert.ok(pressed('btn-sound') === 'false', pressed('btn-sound')); });
await test('sound-spares-music', () => { assert.ok(pressed('btn-music') === 'true', String(pressed('btn-music'))); });
TAP('global', 'music');
await test('music-off', () => { assert.ok(pressed('btn-music') === 'false', pressed('btn-music')); });
await test('music-spares-sound', () => { assert.ok(pressed('btn-sound') === 'false', pressed('btn-sound')); });
click(E('btn-sound'));
await test('sound-on', () => { assert.ok(pressed('btn-sound') === 'true', pressed('btn-sound')); });
TAP('global', 'sound');
await test('sound-key-off', () => { assert.ok(pressed('btn-sound') === 'false', pressed('btn-sound')); });
TAP('global', 'music');
await test('music-on', () => { assert.ok(pressed('btn-music') === 'true', pressed('btn-music')); });
TAP('global', 'sound');
click(E('btn-music')); click(E('btn-music')); // end unmuted with a fresh scheduler
// ---- game rooms: lobby + net play against a scripted server ----
const html = fs.readFileSync(path.join(GAME_DIR, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(GAME_DIR, 'game.css'), 'utf8');
// The room server is rooms.php plus the files it requires from server/.
const phpFiles = ['rooms.php', ...['settings', 'store', 'sim', 'ai', 'rules', 'protocol', 'guard', 'board'].map(f => `server/${f}.php`)];
const phpText = Object.fromEntries(phpFiles.map(f => [f, fs.readFileSync(path.join(GAME_DIR, f), 'utf8')]));
const php = Object.values(phpText).join('\n');
// The lobby and the menu are Preact components (src/ui): their ids exist once
// the game has drawn them, not in index.html (ui.test.ts checks their shape).
for (const id of ['lobby-veil', 'round-banner', 'round-banner-text', 'preview-result']) {
  await test('lobby-markup-' + id, () => { assert.ok(html.includes('id="' + id + '"')); });
}
for (const id of ['rooms-open', 'host-form', 'lobby-initials', 'join-form',
  'join-code', 'lobby-status', 'lobby-room', 'lobby-code',
  'lobby-seats', 'lobby-start', 'lobby-leave', 'lobby-close',
  'lobby-map', 'lobby-hills', 'lobby-count', 'new-game']) {
  await test('lobby-rendered-' + id, () => { assert.ok(rendered(id)); });
}
// The field's width is set where a match is dealt and nowhere else (spec 6.6).
const widthWrites = [...src.matchAll(/\bG\.w\s*=(?!=)/g)].length;
await test('field-width-written-only-at-the-deal', () => { assert.ok(widthWrites === 2 && /G\.w = w;/.test(moduleOf('solo.ts')) && /G\.w = ROOM_W/.test(moduleOf('room.ts'))
  && /soloDeal\(G, tables\.arsenal!, seed, level \?\? difficulty\.get\(\), field\.deal\(\)\)/.test(moduleOf('match.ts')), `writes=${widthWrites}`); });
await test('no-module-imports-a-fixed-width', () => { assert.ok(!/import\s*\{[^}]*\bW\b[^}]*\}\s*from\s*'\.\/sim\.ts'/.test(src), 'a module still imports W from sim.ts'); });
await test('no-status-codes', () => { assert.ok(!/server said no/.test(src)); });
// The page loads the effects bundle, then the game bundle, and nothing else:
// no import map, and the game bundle carries Preact so it has no bare imports.
await test('page-loads-fx-then-the-game-bundle', () => { assert.ok(/<script src="dist\/fx\.js\?v=[0-9a-f]{10}" defer><\/script>\s*<script type="module" src="dist\/main\.js\?v=[0-9a-f]{10}"><\/script>/.test(html), ''); });
await test('page-has-no-import-map', () => { assert.ok(!/type="importmap"/.test(html), ''); });
await test('bundle-has-no-bare-imports', () => { assert.ok(!/\bfrom\s*["'](?!\.)/.test(read('dist/main.js')), ''); });
await test('fx-bundle-sets-the-global', () => { assert.ok(/TankityFX/.test(read('dist/fx.js')), ''); });
for (const f of ['dist/main.js', 'game.css', 'dist/fx.js']) {
  await test('page-versions-' + f, () => { assert.ok(new RegExp('(?:src|href)="' + f.replace(/[./]/g, '\\$&') + '\\?v=[0-9a-f]+"').test(html)); });
}
await test('room-cap', () => { assert.ok(/room_db_max_mb/.test(php) && /The server is full\. Try again later\./.test(php) && /room_lobbies_per_address/.test(php) && !/room_max_rooms|room_max_lobbies|Every match slot|Every lobby is busy/.test(php)); });
await test('no-seed-leak', () => { assert.ok((() => {
  const proto = must(phpText['server/protocol.php'], 'server/protocol.php');
  const body = proto.slice(proto.indexOf('function room_snapshot'));
  return !/'seed'/.test(body) && !/'rng'/.test(body) && !/'token'/.test(body);
})()); });
await test('lobby-css-acts-right', () => { assert.ok(/\.card \.acts\s*\{[^}]*justify-content:\s*flex-end/.test(css)); });
for (const id of ['btn-sound', 'btn-music']) await test('audio-rendered-' + id, () => { assert.ok(rendered(id)); });
await test('css-fit-windowed', () => { assert.ok(/\nbody\s*\{[^}]*height:\s*100dvh/.test(css) && /\n\.field\s*\{[^}]*flex:\s*1/.test(css)); });
await test('css-breakpoints', () => { assert.ok(['@container (max-width: 1100px)', '@container (max-width: 860px)', '@container (max-width: 760px)'].every(q => css.includes(q))); });
await test('css-fit-fullscreen', () => { assert.ok(/#frame:fullscreen\s*\{[^}]*overflow:\s*hidden/.test(css)); });
await test('key-hints', () => { assert.ok(html.includes('data-keyhint="global:fire" aria-hidden="true">Space<') && html.includes('data-keyhint="aim:driveLeft" aria-hidden="true">Shift+←<')); });
await test('key-style', () => { assert.ok(read('dist/kit.css').includes('--kit-key-tab-bg, #14183a') && /\n\.key\s*\{[^}]*display:\s*none/.test(css) && /@media \(hover: hover\) and \(pointer: fine\)/.test(css)); });
// Panels live over the battle, never beside it; L/H/R flip them without pausing.
await test('no-side-panels', () => { assert.ok(!/<aside/.test(html)); });
for (const id of ['log-overlay', 'help-overlay', 'report-overlay', 'btn-log', 'btn-help']) {
  await test('overlay-markup-' + id, () => { assert.ok(html.includes('id="' + id + '"')); });
}
await test('overlay-rendered-scores-open', () => { assert.ok(rendered('scores-open')); });
await test('overlays-in-frame', () => { assert.ok(['log-overlay', 'help-overlay', 'report-overlay']
  .every(id => html.indexOf('id="' + id + '"') > html.indexOf('id="frame"'))); });
TAP('global', 'log');
await test('log-toggle', () => { assert.ok(E('log-overlay').hidden === false); });
TAP('global', 'log');
await test('log-untoggle', () => { assert.ok(E('log-overlay').hidden === true); });
TAP('global', 'help');
await test('help-toggle', () => { assert.ok(E('help-overlay').hidden === false); });
click(E('help-close'));
await test('help-close', () => { assert.ok(E('help-overlay').hidden === true); });
TAP('global', 'help');
TAP('global', 'back');
await test('help-q', () => { assert.ok(E('help-overlay').hidden === true); });
await test('banner-centered', () => { assert.ok(/\.banner\s*\{[^}]*top:\s*50%/.test(css) && /translateY\(-50%\)/.test(css)); });
TAP('global', 'report');
await test('report-toggle', () => { assert.ok(E('report-overlay').hidden === false); });
click(E('report-close'));
await test('report-close', () => { assert.ok(E('report-overlay').hidden === true); });
// Seed, sound, music and fullscreen live in the in-frame settings menu.
for (const id of ['menu-overlay', 'deck', 'hud-bar', 'field']) {
  await test('menu-markup-' + id, () => { assert.ok(html.includes('id="' + id + '"')); });
}
await test('menu-button-in-the-status-bar', () => { assert.ok(rendered('btn-menu')); });
for (const id of ['menu-close', 'seed-form', 'new-game']) {
  await test('menu-rendered-' + id, () => { assert.ok(rendered(id)); });
}
await test('menu-in-frame', () => { assert.ok(html.indexOf('id="menu-overlay"') > html.indexOf('id="frame"')); });
await test('menu-grid', () => { assert.ok(E('seed-form').className === 'menu-grid'); });
await test('menu-buttons', () => { assert.ok(/#frame button\s*\{[^}]*font-size:\s*0\.75rem/.test(css)); });
await test('menu-grid-cols', () => { assert.ok(/\.menu-grid\s*\{[^}]*repeat\(3, 1fr\)/.test(css)); });
// Secondary is the default (navbar style); gold is opt-in via .btn-primary.
await test('buttons-secondary-default', () => { assert.ok(/\nbutton\s*\{[^}]*background:\s*var\(--panel\)/.test(css) && /\nbutton\s*\{[^}]*border:\s*1px solid var\(--line\)/.test(css)); });
await test('buttons-primary-gold', () => { assert.ok(/button\.btn-primary[^{]*\{[^}]*background:\s*var\(--accent\)/.test(css)); });
const deckHtml = html.slice(html.indexOf('id="deck"'), html.indexOf('id="log-overlay"'));
await test('deck-groups', () => { assert.ok(['grp-aim', 'grp-drive', 'grp-more', 'grp-weapon', 'grp-fire'].every(g => deckHtml.includes(g)) && !/btn-primary/.test(deckHtml)); });
TAP('global', 'back');
await test('menu-toggle', () => { assert.ok(E('menu-overlay').hidden === false && E('btn-menu').getAttribute('aria-expanded') === 'true'); });
click(E('menu-close'));
await test('menu-close', () => { assert.ok(E('menu-overlay').hidden === true); });
// Q toggles the menu: once opens it, again closes it.
TAP('global', 'back');
await test('menu-reopen', () => { assert.ok(E('menu-overlay').hidden === false); });
TAP('global', 'back');
await test('menu-q', () => { assert.ok(E('menu-overlay').hidden === true); });
// Esc does nothing: it neither opens the menu nor closes it.
const ESC = () => { keyDown('Escape', 'Escape', {}); keyUp('Escape', 'Escape'); };
ESC();
await test('esc-does-not-open-the-menu', () => { assert.ok(E('menu-overlay').hidden === true); });
TAP('global', 'back');
ESC();
await test('esc-does-not-close-the-menu', () => { assert.ok(E('menu-overlay').hidden === false); });
TAP('global', 'back');
await test('menu-q-again', () => { assert.ok(E('menu-overlay').hidden === true); });
  // Tutorial: the title card carries a replay button (pressed for real at the end); the coach marks draw only while a lesson runs.
  await test('title-tutorial', () => { assert.ok(!!els['tutorial-open'] && !!els['tutorial-overlay'] && E('tutorial-overlay').hidden === true); });
  // Four 32-step songs; the round picks the song.
  const songNames = (audioSrc.match(/name: '[^']+'/g) || []).filter(n => /Rollout|High Ground|Crater Blues|Last Tank/.test(n));
  await test('songs', () => { assert.ok(songNames.length === 4 && /songIdx = \(round - 1\) % SONGS\.length/.test(audioSrc)
    && /if \(G\.demo\) music\.playTheme\(\); else music\.forRound\(G\.round\)/.test(src), songNames.join(',')); });
// Every scrollable panel shows its keys, dimmed while everything fits.
// (The overlays in src/ui draw theirs: one OverlayHead per navId.)
const uiFile = (f: string) => fs.readFileSync(path.join(GAME_DIR, 'src', 'ui', f + '.tsx'), 'utf8');
const uiNavs = ['help', 'shop', 'lobby', 'menu', 'guns', 'scores', 'log', 'endveil'].flatMap(f => uiFile(f).match(/navId="/g) || []).length;
const navCount = (html.match(/class="nav-hint[" ]/g) || []).length + uiNavs;
await test('nav-hints', () => { assert.ok(navCount === 9, `hints=${navCount}`); });
TAP('global', 'help');
await test('nav-disabled', () => { assert.ok(E('nav-help').getAttribute('aria-disabled') === 'true'); });
E('help-overlay').scrollHeight = 500;
KD('scroll', 'lineDown');
await test('scroll-line', () => { assert.ok(E('help-overlay').scrollTop === 40, `top=${E('help-overlay').scrollTop}`); });
await test('nav-enabled', () => { assert.ok(E('nav-help').getAttribute('aria-disabled') === 'false'); });
KD('scroll', 'pageDown');
await test('scroll-page', () => { assert.ok(E('help-overlay').scrollTop === 240, `top=${E('help-overlay').scrollTop}`); });
KD('scroll', 'lineUp');
await test('scroll-up', () => { assert.ok(E('help-overlay').scrollTop === 200, `top=${E('help-overlay').scrollTop}`); });
KD('scroll', 'halfDown', 0, { shiftKey: true });
await test('scroll-half-down', () => { assert.ok(E('help-overlay').scrollTop === 300, `top=${E('help-overlay').scrollTop}`); });
KD('scroll', 'halfUp', 0, { shiftKey: true });
await test('scroll-half-up', () => { assert.ok(E('help-overlay').scrollTop === 200, `top=${E('help-overlay').scrollTop}`); });
TAP('global', 'help');
const idleTop = E('help-overlay').scrollTop;
KD('scroll', 'lineDown');
await test('scroll-idle', () => { assert.ok(E('help-overlay').scrollTop === idleTop, `top=${E('help-overlay').scrollTop}`); });
// The camera pins the ground to the viewport floor: no void below the world (test/camera.test.ts checks the numbers).
await test('cam-pins-ground', () => { assert.ok(/const floorY = h \+ FLOOR_SLACK/.test(src) && /bottom - \(h \+ FLOOR_SLACK\)/.test(src)); });
await test('cam-wide-sky', () => { assert.ok(/fillRect\(rect\.x0 - 20, rect\.y0 - 20, rect\.x1 - rect\.x0 \+ 40/.test(renderSrc)); }); // the sky covers everything the canvas shows
// (invite-prefill runs inside the async block below: openLobby unhides late)
const textFiles: [string, string][] = [['src/main.ts', mainSrc], ...moduleFiles.map((m): [string, string] => ['src/' + m, moduleOf(m)]), ['index.html', html], ['game.css', css], ...phpFiles.map((f): [string, string] => [f, must(phpText[f], f)])];
for (const [f, text] of textFiles) {
  await test('no-dashes-' + f, () => { assert.ok(!/[—–]/.test(text)); });
}
await test('net-round-event', () => { assert.ok(/e\.t === 'round'/.test(src) && /'t' => 'round'/.test(php)); });
const tick = async (n?: number) => {
  for (let i = 0; i < (n || 6); i++) { await new Promise(r => setImmediate(r)); frames(2); }
};
let SEQ = 10;
const nx = () => ++SEQ;
let curTurn = 0;
const terr720 = () => new Array(720).fill(300);
// ---- protocol fixtures: real server replies (protocol/*.json) ----
// The hand-written snapshots below must keep the shape the server really
// sends, and a later phase feeds the client the fixtures themselves.
const FX_DIR = path.join(GAME_DIR, 'protocol');
/** A fixture as these checks read it: a real reply's status and body. */
interface Fixture { status: number; body: { room?: RoomSnapshot; code?: string; error?: string } }
const fx = (name: string): Fixture => JSON.parse(fs.readFileSync(path.join(FX_DIR, name + '.json'), 'utf8'));
const fxReply = (f: Fixture) => ({ ok: f.status < 400, status: f.status, json: async () => f.body });
const PFX = { on: false, room: 'lobby-host', actError: '', delta: 0, full: 0 };
/** A request body the client posts, as the fake server reads it. */
interface Posted { have?: number; full?: boolean; kind?: string; map?: string; initials?: string; difficulty?: string; seat?: number; mode?: string; ready?: boolean; item?: string; token?: string }
// The server's delta rule on a fixture: a request that names the hills
// revision the room is at (`have`, in the query or the body) gets the room
// without its hills, as rooms.php answers it; `full` or any other revision
// gets the hills.
function fxDelta(f: Fixture, u: string, body: Posted) {
  const room = f.body && f.body.room;
  if (!room || !Array.isArray(room.terrain) || !room.terrain.length) return fxReply(f);
  const q = new URLSearchParams(u.split('?')[1] || '');
  const have = q.has('have') ? Number(q.get('have')) : body.have;
  const full = q.get('full') === '1' || body.full === true;
  if (!full && have === room.terrainRev) {
    PFX.delta++;
    const lean: Fixture = JSON.parse(JSON.stringify(f));
    delete must(lean.body.room, 'room').terrain;
    return fxReply(lean);
  }
  PFX.full++;
  return fxReply(f);
}
/** A room puzzle at 0 bits, which every four nonces solve at once. */
const EASY_PUZZLE = { ok: true, challenge: 'v1.1800000000.c.0.smoke-rand.smoke-mac', bits: 0, count: 4, iter: 100, expiresIn: 120 };
function fxServe(u: string, body: Posted) {
  if (u.includes('action=challenge')) return { ok: true, status: 200, json: async () => EASY_PUZZLE };
  if (u.includes('action=create')) return fxReply(fx('create-reply'));
  if (u.includes('action=state')) return fxDelta(fx(PFX.room), u, body);
  if (u.includes('action=start')) { PFX.room = 'play-my-turn'; return fxReply(fx('play-my-turn')); }
  if (u.includes('action=act')) {
    if (body.kind !== 'fire') return fxDelta(fx(PFX.room), u, body);
    if (PFX.actError) return fxReply(fx(PFX.actError));
    PFX.room = 'play-after-fire';
    return fxDelta(fx('play-after-fire'), u, body);
  }
  return null;
}
// Keys and types of a hand-written value against the server's: same keys,
// same types; null on either side is open (the server sends null for a
// drone's body or the turn at the shop). Events may omit keys but never
// invent them.
/** A JSON object (not an array, not null), whose fields can be read by name. */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
/** v[k] as JavaScript reads it: a throw on null or undefined, undefined on any other non-object. */
function fieldOf(v: unknown, k: string): unknown {
  if (v === null || v === undefined) throw new TypeError(`Cannot read properties of ${v} (reading '${k}')`);
  return isRecord(v) ? v[k] : undefined;
}
function driftOf(actual: unknown, want: unknown, p: string, out: Set<string>, loose: boolean): void {
  if (want === null || actual === null) return;
  const ta = Array.isArray(actual) ? 'array' : typeof actual;
  const tw = Array.isArray(want) ? 'array' : typeof want;
  if (ta !== tw) { out.add(`${p}: is ${ta}, the server sends ${tw}`); return; }
  // ta === tw from here, so an array or an object on one side is one on the other too.
  if (Array.isArray(actual)) {
    const items: unknown[] = actual;
    const refs: unknown[] = Array.isArray(want) ? want : [];
    const evs = /events$/.test(p);
    for (const item of items) {
      const ref = evs ? refs.find(w => fieldOf(w, 't') === fieldOf(item, 't')) : refs[0];
      if (!ref) { if (evs) out.add(`${p}: event ${fieldOf(item, 't')} is not one the server sends`); continue; }
      driftOf(item, ref, p + '[]', out, evs);
    }
  } else if (isRecord(actual) && isRecord(want)) {
    for (const k of Object.keys(want)) if (!(k in actual) && !loose) out.add(`${p}.${k}: missing, the server sends it`);
    for (const k of Object.keys(actual)) {
      if (!(k in want)) out.add(`${p}.${k}: the server does not send it`);
      else driftOf(actual[k], want[k], p + '.' + k, out, loose);
    }
  }
}
const FX_DRIFT = new Set<string>();
function fxConform<T extends { phase: string }>(room: T): T {
  const name = room.phase === 'lobby' ? 'lobby-host' : room.phase === 'shop' ? 'shop-after-win' : 'play-after-fire';
  const want: RoomSnapshot = JSON.parse(JSON.stringify(fx(name).body.room));
  if (room.phase !== 'lobby') {
    want.events = must(fx('play-after-fire').body.room, 'play-after-fire room').events.concat(must(fx('shop-after-win').body.room, 'shop-after-win room').events);
  }
  driftOf(room, want, name, FX_DRIFT, false);
  return room;
}
function scriptTank(seat: number, x: number, name: string, kind: string) {
  return {
    seat, kind, name, x, y: 300, angle: 60, power: 55,
    hp: kind === 'human' ? 100 : 60, maxHp: kind === 'human' ? 100 : 60,
    dirS: seat === 0 ? 1 : -1,
    body: kind === 'human' ? 'tank' : null, menu: false, chute: false,
  };
}
function scriptSeats() {
  // Server shape: humans arrive as name=initials, drones as name=AI name.
  return [
    { seat: 0, human: true, name: 'abc', mode: 'human', persona: null, bot: false, lives: 3, score: 0, roundsWon: 0, kills: 0, gain: 0, out: null, ready: NET_SHOP && mockReady },
    { seat: 1, human: false, name: 'REAPER', mode: 'ai', persona: null, bot: false, lives: 0, score: 0, roundsWon: 0, kills: 0, gain: 0, out: null, ready: false },
  ];
}
function scriptYou() {
  return {
    ammo: { shell: -1, buck: 1 },
    cash: 600, score: 0, lives: 3, fuel: 80, weapon: 'shell', nextUp: 3000,
    seat: 0, shield: false, jammer: 0, bunker: 0, laststand: false, chutes: 0, plate: 0, armor: seatArmor, maxArmor: 100, filed: false, filedRank: null, filedFailed: false, filedLocal: false,
  };
}
function playRoom(turn: number, events: object[]) {
  return fxConform(Object.assign({
    code: 'TST1', phase: NET_SHOP ? 'shop' : 'play', round: 1, wind: 2, turn, turnSecs: 120, speed: 1, walls: 'none', wallsNow: 'none', expiresAt: 1800000600, closesIn: 600, turnLeft: NET_SHOP ? null : 120, shopLeft: NET_SHOP ? 90 : null,
    terrain: terr720(), terrainRev: 1, hills: [40, 20, 10, 1, 2, 3, 0.004, 0.008, 0.02],
    tanks: [scriptTank(0, 100, 'abc', 'human'), scriptTank(1, 600, 'REAPER', 'ai')],
    seats: scriptSeats(), events: events || [], you: scriptYou(), csrf: 'cs0',
  }, mapFields()));
}
const okJson = (d: unknown) => ({ ok: true, json: async () => d });
let createdMap = '';
let createdInitials = '';
let createdDifficulty: string | undefined;
let failCreate = '';
let failMode = '';
let sawFire = false;
const mapFields = () => ({
  map: createdMap || null,
  mapName: createdMap ? 'Canyon 3' : 'Random hills',
  difficulty: createdDifficulty === 'easy' || createdDifficulty === 'hard' ? createdDifficulty : 'normal',
  hostSeat: 0,
  startHumans: 1, matchId: null,
  winner: null,
  winBonus: 0,
});
Reflect.set(globalThis, 'fetch', async (url: unknown, opts?: { body?: string }) => {
  const u = String(url);
  const body: Posted = opts && opts.body ? JSON.parse(opts.body) : {};
  if (PFX.on) {
    const served = fxServe(u, body);
    if (served) return served;
  }
  if (u.includes('action=maps')) {
    return okJson({
      ok: true,
      maps: [
        { id: 'canyon 3', name: 'Canyon 3', profile: Array.from({ length: 48 }, (_, i) => 0.3 + 0.2 * Math.sin(i / 5)) },
        { id: 'twin hills', name: 'Twin Hills', profile: Array.from({ length: 48 }, (_, i) => 0.4 + 0.2 * Math.cos(i / 7)) },
      ],
    });
  }
  if (u.includes('action=ping')) {
    return okJson({ ok: true, game: 'operation-tankity', rooms: { used: 3 }, lobbies: { used: 4 } });
  }
  if (u.includes('action=challenge')) return okJson(EASY_PUZZLE);
  if (u.includes('action=create')) {
    if (failMode === 'down') throw new Error('conn refused');
    if (failMode === 'page') return { ok: true, json: async () => { throw new Error('Unexpected token <'); } };
    if (failMode === 'stumble') return { ok: false, json: async () => { throw new Error('Unexpected token <'); } };
    if (failCreate) return { ok: false, json: async () => ({ error: failCreate }) };
    createdMap = body.map || '';
    createdInitials = body.initials || '';
    createdDifficulty = body.difficulty;
    return okJson({ ok: true, code: 'TST1', seat: 0, token: 'tok0', csrf: 'cs0' });
  }
  if (u.includes('action=map')) {
    createdMap = body.map || '';
    return okJson({ ok: true, room: lobbyRoom() });
  }
  if (u.includes('action=seatmode')) {
    seatModeSent = body;
    seatModes[String(body.seat)] = body.mode;
    return okJson({ ok: true, room: lobbyRoom() });
  }
  if (u.includes('action=state')) stateCalls++;
  if (u.includes('action=leave')) { leaveSent++; return okJson({ ok: true }); }
  if (u.includes('action=start')) { curTurn = 0; return okJson({ ok: true, room: playRoom(0, []) }); }
  if (u.includes('action=state')) {
    if (!body.token && u.includes('token=')) {
      // lobby watch passes an empty token before joining; stay quiet
    }
    return okJson({ ok: true, room: curTurn === 0 && NET_LOBBY ? lobbyRoom() : playRoom(curTurn, []) });
  }
  if (u.includes('action=act')) {
    if (body.kind === 'fire') {
      sawFire = true;
      curTurn = 1;
      return okJson({
        ok: true,
        room: playRoom(1, [
          { seq: nx(), t: 'fire', seat: 0, w: 'shell' },
          { seq: nx(), t: 'shot', by: 0, w: 'shell', x0: 120, y0: 280, x1: 400, y1: 300 },
          { seq: nx(), t: 'hit', seat: 1, dmg: 20, by: 0, direct: false },
        ]),
      });
    }
    return okJson({ ok: true, room: playRoom(curTurn, []) });
  }
  if (u.includes('action=ready')) {
    readySent.push(body.ready);
    mockReady = body.ready;
    return okJson({ ok: true, room: playRoom(curTurn, []) });
  }
  if (u.includes('action=buy')) {
    buysSent.push(body.item);
    return okJson({ ok: true, room: playRoom(curTurn, []) });
  }
  if (u.includes('action=join')) {
    return okJson({ ok: true, code: 'TST1', seat: 1, token: 'tok1', csrf: 'cs0' });
  }
  return okJson({ ok: true, scores: [] });
});
let NET_LOBBY = true;
let NET_SHOP = false;
let seatArmor = 100;
const buysSent: (string | undefined)[] = [];
let mockReady: boolean | undefined = false;
const readySent: (boolean | undefined)[] = [];
let extraGuest = false;
// Lobby seats as the server sends them: all four from the start, each human,
// AI or open; the host's seatmode requests flip the stored mode.
const seatModes: Record<string, string | undefined> = { 1: 'ai', 2: 'ai', 3: 'ai' };
let seatModeSent: Posted | null = null;
let leaveSent = 0;
let stateCalls = 0;
function lobbyRoom() {
  const aiNames: Record<string, string> = { 1: 'REAPER', 2: 'WRAITH', 3: 'SPOTTER' };
  const seats = [0, 1, 2, 3].map(i => {
    if (i === 0) return { seat: 0, human: true, name: 'abc', mode: 'human', persona: null, bot: false, lives: 3, score: 0, roundsWon: 0, kills: 0, gain: 0, out: null, ready: false };
    if (i === 1 && extraGuest) return { seat: 1, human: true, name: 'def', mode: 'human', persona: null, bot: false, lives: 3, score: 0, roundsWon: 0, kills: 0, gain: 0, out: null, ready: false };
    return { seat: i, human: false, name: aiNames[i], mode: seatModes[i], persona: null, bot: false, lives: 0, score: 0, roundsWon: 0, kills: 0, gain: 0, out: null, ready: false };
  });
  return fxConform(Object.assign(
    { code: 'TST1', phase: 'lobby', seats, events: [], tanks: [], terrain: [], terrainRev: 1, hills: null, round: 0, wind: 0, turn: null, turnSecs: 120, speed: 1, walls: 'none', wallsNow: 'none', expiresAt: 1800000600, closesIn: 600, turnLeft: null, shopLeft: null, you: scriptYou(), csrf: 'cs0' },
    mapFields(),
  ));
}
// Freeze regression: ten minutes in a background tab must not backlog the
// music scheduler into scheduling thousands of catch-up notes at once.
await (async () => {
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  // Waits for what a real poll timer delivers, however slowly the machine runs
  // it: returns the moment `cond` holds, and fails only after a generous bound.
  const until = async (what: string, cond: () => boolean, ms = 30_000) => {
    for (const end = Date.now() + ms; !cond(); await sleep(25)) {
      if (Date.now() > end) assert.fail(`timed out waiting for ${what}`);
    }
    await tick(10);
  };
  // ?code=zz99 was set before boot: the lobby opens with the code filled in
  openBootGate();
  await tick(10);
  await test('invite-prefill', () => { assert.ok(E('join-code').value === 'ZZ99' && E('lobby-veil').hidden === false, `${E('join-code').value} | hidden=${els['lobby-veil'] && els['lobby-veil'].hidden}`); });
  E('lobby-veil').hidden = true;
  // The log trims old lines at its cap, so match only the last few lines and
  // check after every press instead of anchoring on an absolute index.
  const logTail = () => E('log').children.slice(-4).map(li => li.textContent).join('\n');
  // Match the rack marker, never the log: interleaved battle lines and the
  // trim cap make absolute log positions lie about what is loaded now. The
  // marker must sit in the same rack segment, so a later gun cannot fake it.
  const selIs = (name: string) => new RegExp('^' + name + ' ').test(E('hud-weapon').textContent);
  const loadGun = (name: string) => {
    // G opens the rack; a digit loads that tile and shuts it. Try each in turn.
    for (let n = 1; n <= 6 && !selIs(name); n++) {
      TAP('global', 'guns'); frames(2);
      keyDown(String(n), 'Digit' + n); keyUp(String(n), 'Digit' + n); frames(3);
    }
  };
  const waitAim = async () => {
    let g = 0;
    while (g++ < 40 && !/YOU\. Aim!/.test(E('hud-turn').textContent)) {
      await sleep(300); frames(10);
    }
  };
  // The battle may have cleared a round behind a preview veil; spend the
  // winnings and roll on so there is always a live aiming phase ahead. The
  // shop veil is ground truth: HUD text goes stale across round resets.
  const ensureAim = async () => {
    await waitAim();
    if (E('shop-veil').hidden === false) {
      click(E('shop-next'));
      frames(120);
      await waitAim();
    }
  };
  // Demo battle first: the crew fires on its own, controls stay locked.
  frames(600);
  await test('demo-fires', () => { assert.ok(/fires Shell/.test(logText())); });
  TAP('global', 'fire'); frames(3);
  await test('demo-locked', () => { assert.ok(/Demo mode/.test(logText())); });
  const feudMark = E('log').children.length;
  // Long enough for a drone to hit a drone: with drag, a ranging shot across the field lands near less often.
  // The demo's drones now shop with their own money, so how soon one grazes another depends on what they bought: give them a few more minutes.
  const FEUD = /(reaper|wraith|spotter) hits (reaper|wraith|spotter)/;
  let feudNew = '';
  for (let minutes = 0; minutes < 6 && !FEUD.test(feudNew); minutes++) {
    frames(14000);
    feudNew += '\n' + E('log').children.slice(feudMark).map(li => li.textContent).join('\n');
  }
  await test('ai-feuds', () => { assert.ok(FEUD.test(feudNew), feudNew); });
  // T deals random hills and O opens the lobby, both from the keyboard.
  TAP('global', 'rooms'); await tick(10);
  await test('rooms-hotkey', () => { assert.ok(E('lobby-veil').hidden === false); });
  TAP('global', 'back');
  await test('lobby-esc', () => { assert.ok(E('lobby-veil').hidden === true); });
  TAP('global', 'random'); frames(120);
  await test('random-hotkey', () => { assert.ok(E('shop-veil').hidden === false); });
  await test('a-match-closes-the-card', () => { assert.ok(titleVeil().hidden === true); });
  E('seed-input').value = 'scorch-01';
  // New Game rolls the fanfare and the Round 1 card, then the pre-match shop.
  // It also takes the whole frame: an open menu shuts instead of sitting
  // over the briefing and the shop that follows it.
  TAP('global', 'back');
  await test('menu-open-before-newgame', () => { assert.ok(E('menu-overlay').hidden === false); });
  click(E('new-game'));
  await test('new-game-closes-menu', () => { assert.ok(E('menu-overlay').hidden === true); });
  await test('newgame-banner', () => { assert.ok(E('round-banner').hidden === false && /Round 1/.test(E('round-banner-text').textContent), E('round-banner-text').textContent); });
  // No wall-clock wait: the card runs on sim time, so frames alone finish it.
  // (This is the refocus-freeze regression in miniature.)
  frames(120);
  await test('banner-done', () => { assert.ok(E('round-banner').hidden === true); });
  const shopOpen = E('shop-veil').hidden === false;
  // The pre-match shop has no tank: the aim, power, wind and fuel read '-', not the demo's last values.
  await test('shop-prematch-hud-dashes', () => { assert.ok(['hud-angle', 'hud-power', 'hud-wind', 'hud-fuel'].every(id => E(id).textContent === '-'), ['hud-angle', 'hud-power', 'hud-wind', 'hud-fuel'].map(id => E(id).textContent).join('|')); });
  const shopCash0 = E('shop-cash').textContent;
  // Esc in the shop shuts panels first and, with none open, opens the menu: it never starts the round (N does).
  TAP('global', 'back');
  TAP('shop', 'close'); frames(3);
  await test('shop-esc-closes-menu', () => { assert.ok(E('menu-overlay').hidden === true && E('shop-veil').hidden === false); });
  // Stock up: Buckshot, Mortar and Needle of the $600 stake, at game.json's prices.
  // The page shops from its baked fallback arsenal here (the stub withholds game.json's
  // arsenal), whose rows test/fallback-arsenal.test.ts keeps equal to game.json's.
  const arsenal = GAME.arsenal;
  const STAKE = 600;
  const rowData = (key: string): Weapon | Gear => must([...arsenal.ammo, ...arsenal.gear].find(r => r.key === key), 'game.json row ' + key);
  const shelfKeys = ['shell', 'buck', 'mortar', 'needle', 'nuke', 'repair', 'fuel'];
  const shelfCats = shelfKeys.map(k => rowData(k).cat).filter((c, i, all) => all.indexOf(c) === i);
  const nukeRec = rowData('nuke') as Weapon;
  const gunsCost = ['buck', 'mortar', 'needle'].reduce((sum, k) => sum + rowData(k).price, 0);
  const cashAfterGuns = STAKE - gunsCost;
  const fuelRec = rowData('fuel') as Gear;
  const fuelPacks = Math.floor(cashAfterGuns / fuelRec.price);
  // (Each render appends, so read the last list items: a header per category, the free
  // Shell row, and a row to buy for each other shelf entry. Each row holds an icon
  // canvas and a text div whose last child is the acts row.)
  const shopLis = () => kids(E('shop-list')).slice(-(shelfCats.length + shelfKeys.length));
  const shopRows = () => shopLis().filter(li => li.children.length === 2 && !String(li.className).split(' ').includes('shop-free'));
  const rowName = (li: StubElement) => nodeAt(nodeAt(li, 1), 0).textContent;
  const actsOf = (li: StubElement) => childEl(childEl(li, 1), 3); // the text column's fourth child, under the description
  const buyRow = (label: string) => {
    const row = must(shopRows().find(li => rowName(li).includes(label)), label + ' row');
    const acts = actsOf(row);
    click(childEl(acts, acts.children.length - 1));
  };
  buyRow('Buckshot');
  // Categories group the shelf, and NUKE shows its damage.
  const catNames = shopLis().filter(li => li.className === 'shop-cat').map(li => li.textContent);
  const nukeRow = must(shopRows().find(li => rowName(li).includes('NUKE')), 'NUKE row');
  const nukeStats = nodeAt(nodeAt(nukeRow, 1), 1).textContent + ' ' + nodeAt(nodeAt(nukeRow, 1), 2).textContent;
  await test('shop-cats', () => { assert.ok(catNames.join('|') === shelfCats.join('|'), catNames.join('|')); });
  const freeRow = shopLis().find(li => li.className === 'shop-free');
  await test('shop-shell-row', () => { assert.ok(!!freeRow && /^Shell ∞/.test(rowName(freeRow)), freeRow ? rowName(freeRow) : 'missing'); });
  await test('shop-icons', () => { assert.ok(shopRows().length === shelfKeys.length - 1 && shopRows().every(li => childEl(li, 0).className === 'shop-icon' && childEl(li, 0).getAttribute('aria-hidden') === 'true'), shopRows().map(li => childEl(li, 0).className).join()); });
  await test('nuke-stats', () => { assert.ok(nukeStats.includes(`${nukeRec.dmg} damage`), nukeStats); });
  // The arsenal section of game.json is a second source the game reads at
  // boot: it must hold every row and speak only effects and painters the code has.
  // Every ammo row has its effects (plus the wreck's, laststand): the count comes from game.json itself.
  await test('arsenal-count', () => { assert.ok(arsenal.ammo.length >= 30 && arsenal.ammo.length === Object.keys(GAME.effects || {}).length - 1 && arsenal.gear.length === 9, `ammo=${arsenal.ammo.length} gear=${arsenal.gear.length}`); });
  const FX = ['shot', 'pellets', 'cluster', 'proximity', 'seeker', 'pierce', 'emp', 'roller', 'hop', 'scatter', 'beam', 'plasma', 'tracer', 'dirt', 'pour', 'dig', 'riot', 'slump', 'napalm'];
  const PAINT: readonly (string | undefined)[] = ['disc', 'beam', 'spark', 'ball', 'dash', 'drill', 'clod', 'flame'];
  const TRICKS: readonly (string | undefined)[] = ['repair', 'fuel', 'plate', 'shield', 'extralife', 'jammer', 'bunker', 'laststand', 'parachute'];
  await test('arsenal-fx', () => { assert.ok(arsenal.ammo.every(a => FX.includes(a.effect) && a.gfx && PAINT.includes(a.gfx.painter)
    && typeof a.dmg === 'number' && typeof a.radius === 'number' && typeof a.price === 'number'
    && typeof a.pack === 'number' && Array.isArray(a.gfx.blast))); });
  await test('arsenal-gear', () => { assert.ok(arsenal.gear.every(g => TRICKS.includes(g.effect) && typeof g.price === 'number' && typeof g.n === 'number')); });
  const cats: (string | undefined)[] = [];
  for (const r of [...arsenal.ammo.filter(a => a.pack > 0), ...arsenal.gear]) {
    if (!cats.includes(r.cat)) cats.push(r.cat);
  }
  // Each cat's rows sit together in game.json, so the shop's headings follow the file.
  const runs = [...arsenal.ammo.filter(a => a.pack > 0), ...arsenal.gear].map(r => r.cat).filter((c, i, all) => i === 0 || c !== all[i - 1]);
  await test('arsenal-cats', () => { assert.ok(cats.length >= 8 && runs.join('|') === cats.join('|'), runs.join('|')); });
  for (const k of ['shell', 'buck', 'mortar', 'needle', 'nuke', 'repair', 'fuel']) {
    await test('arsenal-keeps-' + k, () => { assert.ok(arsenal.ammo.some(a => a.key === k) || arsenal.gear.some(g => g.key === k)); });
  }
  // A full hull has nothing to repair: the Repair row greys out and says so.
  {
    const repairRow = must(shopRows().find(li => rowName(li).includes('Repair')), 'Repair row');
    const acts = actsOf(repairRow);
    await test('shop-repair-greyed-at-full', () => { assert.ok(childEl(acts, acts.children.length - 1).disabled === true && /Armor full \(100 of 100\)/.test(repairRow.textContent), repairRow.textContent); });
  }
  // The keys reach every row: Up from the first priced row (Buckshot) lands
  // on the free Shell, where V previews it and B only says it is free.
  const freeLi = () => must(shopLis().find(li => String(li.className).split(' ').includes('shop-free')), 'Shell row');
  await test('shop-opens-on-first-row', () => { assert.ok(nth(shopRows(), 0).className === 'sel', shopRows().map(li => li.className).join(',')); });
  TAP('shop', 'selUp'); frames(3);
  await test('shop-up-reaches-shell', () => { assert.ok(freeLi().className === 'shop-free sel' && shopRows().every(li => li.className === ''), freeLi().className); });
  TAP('shop', 'selUp'); frames(3);
  await test('shop-up-stops-at-shell', () => { assert.ok(freeLi().className === 'shop-free sel'); });
  const cashAtShell = E('shop-cash').textContent;
  TAP('shop', 'buy'); frames(3);
  await test('shop-shell-buy-says-free', () => { assert.ok(/free and always loaded/.test(logTail()) && E('shop-cash').textContent === cashAtShell, logTail()); });
  TAP('shop', 'preview'); frames(3);
  await test('shop-shell-preview', () => { assert.ok(E('preview-veil').hidden === false); });
  TAP('shop', 'close'); frames(3);
  TAP('shop', 'selDown'); frames(3);
  await test('shop-down-back-to-first-row', () => { assert.ok(nth(shopRows(), 0).className === 'sel' && freeLi().className === 'shop-free'); });
  // Keyboard alone can shop: arrows highlight, Enter buys, digits buy outright.
  TAP('shop', 'selDown'); frames(3);
  await test('shop-keys', () => { assert.ok(nth(shopRows(), 1).className === 'sel', shopRows().map(li => li.className).join(',')); });
  await test('shop-scroll-follows', () => { assert.ok((() => { const li = nth(shopRows(), 1), list = E('shop-list'); return li.offsetTop >= list.scrollTop && li.offsetTop + Number(li.offsetHeight) <= list.scrollTop + Number(list.clientHeight); })()); });
  await test('keys-file-drives', () => { assert.ok(keyList('shop', 'buy')[0] === 'b' && keyList('global', 'fire')[0] === 'Space' && keyList('aim', 'barrelLeft')[0] === 'ArrowLeft' && KB('shop', 'buy')[0] === 'b', `${keyList('shop', 'buy')[0]}|${keyList('global', 'fire')[0]}|${keyList('aim', 'barrelLeft')[0]}`); });
  {
    const ammoActs = actsOf(must(shopRows().find(li => rowName(li).includes('Buckshot')), 'Buckshot row')).children;
    await test('shop-btn-hints', () => { assert.ok(nodeAt(nth(ammoActs, 0), 1).textContent === 'V' && nodeAt(nth(ammoActs, 1), 1).textContent === 'B', `${nodeAt(nth(ammoActs, 0), 1).textContent}|${nodeAt(nth(ammoActs, 1), 1).textContent}`); });
  }
  TAP('shop', 'buy'); frames(3);
  TAPD('shop', 'buyRow', 3); frames(3);
  const shopCash1 = E('shop-cash').textContent;
  // Bulk packs: Right raises the count, capped by the chest; B buys them all
  // and the count falls back to what is still affordable on every row.
  const buyBtn = (li: StubElement) => { const acts = actsOf(li); return childEl(acts, acts.children.length - 1); };
  for (let i = 0; i < 4; i++) { TAP('shop', 'selDown'); frames(3); }
  const fuelRow = () => must(shopRows().find(li => rowName(li).includes('Fuel')), 'Fuel row');
  TAP('shop', 'qtyUp'); frames(3);
  await test('shop-qty-2', () => { assert.ok(fuelPacks >= 2 && rowName(fuelRow()).includes(`×2 = $${2 * fuelRec.price}`), rowName(fuelRow())); });
  for (let i = 0; i < fuelPacks; i++) { TAP('shop', 'qtyUp'); frames(3); } // one press past the cap: what is left after the three guns is all the chest covers
  await test('shop-qty-cap', () => { assert.ok(rowName(fuelRow()).includes(`×${fuelPacks} = $${fuelPacks * fuelRec.price}`), rowName(fuelRow())); });
  TAP('shop', 'buy'); frames(3);
  await test('shop-bulk', () => { assert.ok(E('shop-cash').textContent.includes(`$${cashAfterGuns - fuelPacks * fuelRec.price}`), E('shop-cash').textContent); });
  await test('shop-bulk-said', () => { assert.ok(logTail().includes(`Bought ${fuelPacks} × Fuel`), logTail()); });
  await test('shop-bulk-reset', () => { assert.ok(!/×[2-9] packs/.test(rowName(fuelRow())), rowName(fuelRow())); });
  const buckRow = () => must(shopRows().find(li => rowName(li).includes('Buckshot')), 'Buckshot row');
  await test('shop-bulk-disabled', () => { assert.ok(buyBtn(fuelRow()).disabled === true && buyBtn(buckRow()).disabled === true, `fuel=${buyBtn(fuelRow()).disabled} buck=${buyBtn(buckRow()).disabled}`); });
  for (let i = 0; i < 4; i++) { TAP('shop', 'selUp'); frames(3); }
  TAP('shop', 'preview'); frames(3);
  await test('shop-preview-p', () => { assert.ok(E('preview-veil').hidden === false); });
  TAP('shop', 'close'); frames(3);
  await test('shop-preview-esc', () => { assert.ok(E('preview-veil').hidden === true && E('shop-veil').hidden === false, `preview=${E('preview-veil').hidden} shop=${E('shop-veil').hidden}`); });
  click(E('preview-close')); frames(3);
  await test('shop-preview-shut', () => { assert.ok(E('preview-veil').hidden === true); });
  TAPD('shop', 'buyRow', 4); frames(3);
  await test('shop-nuke-needs-cash', () => { assert.ok(logTail().includes(`That costs $${nukeRec.price}`), logTail()); });
  click(E('shop-next'));
  frames(120); // round card runs on sim time before the shooting
  // round 1, player's opening turn
  const turn0 = E('hud-turn').textContent;
  const angle0 = E('hud-angle').textContent;
  const wind0 = E('hud-wind').textContent;
  const armor0 = E('hud-armor').textContent;
  await test('shop-bulk-banked', () => { assert.ok(E('hud-fuel').textContent === String(80 + fuelPacks * must(fuelRec.n, "fuel n")), E('hud-fuel').textContent); });

  // Every demo lands its verdict with damage, never a clean miss.
  await ensureAim();
  // The keyboard drives: holding the drive key burns fuel (it used to set an
  // action name the drive code never read).
  const fuelBeforeDrive = Number(E('hud-fuel').textContent);
  KD('aim', 'driveRight'); frames(30); KU('aim', 'driveRight'); frames(2);
  KD('aim', 'driveLeft'); frames(30); KU('aim', 'driveLeft'); frames(2);
  const fuelAfterDrive = Number(E('hud-fuel').textContent);
  await test('keyboard-drives', () => { assert.ok(fuelAfterDrive < fuelBeforeDrive, `fuel ${fuelBeforeDrive} -> ${fuelAfterDrive}`); });
  loadGun('Needle');
  TAP('global', 'battlePreview'); frames(5);
  frames(300);
  TAP('global', 'battlePreview'); frames(5);
  const needleVerdict = E('preview-result').textContent;
  const needleSel = E('hud-weapon').textContent;
  await test('needle-selected', () => { assert.ok(/^Needle /.test(needleSel), needleSel); });
  await ensureAim();
  loadGun('Mortar');
  TAP('global', 'battlePreview'); frames(5);
  frames(300);
  TAP('global', 'battlePreview'); frames(5);
  const mortarVerdict = E('preview-result').textContent;
  const mortarSel = E('hud-weapon').textContent;
  loadGun('Buckshot');
  await test('needle-hits', () => { assert.ok(/damage|hits/.test(needleVerdict) && !/Clean miss/.test(needleVerdict), needleVerdict + ' | ' + needleSel); });
  await test('mortar-selected', () => { assert.ok(/^Mortar /.test(mortarSel), mortarSel); });
  await test('mortar-hits', () => { assert.ok(/damage|hits/.test(mortarVerdict) && !/Clean miss/.test(mortarVerdict), mortarVerdict + ' | ' + mortarSel); });

  // aim: Left/Right swing the barrel, Up/Down work power; hold then release
  KD('aim', 'barrelLeft');
  frames(30);
  KU('aim', 'barrelLeft');
  const angle1 = E('hud-angle').textContent;
  const power0 = E('hud-power').textContent;
  KD('aim', 'powerUp');
  frames(30);
  KU('aim', 'powerUp');
  const power1 = E('hud-power').textContent;

  // Freeze regression probe (runs now, while it is still the player's aim
  // phase): defocus must not pause the match nor eat held keys.
  for (const f of listeners['blur'] || []) f();
  frames(10);
  const angleB = E('hud-angle').textContent;
  KD('aim', 'barrelLeft');
  frames(10);
  KU('aim', 'barrelLeft');
  const angleC = E('hud-angle').textContent;

  // G then 2 loads the rack's second gun (Buckshot); loading every tile in
  // turn proves the NUKE stays off the round-1 rack while each bought gun is on it.
  const pickTile = (n: number) => { TAP('global', 'guns'); frames(2); keyDown(String(n), 'Digit' + n); keyUp(String(n), 'Digit' + n); frames(3); };
  pickTile(2);
  const qLog = logText();
  for (let n = 1; n <= 4; n++) pickTile(n);
  const cycleNames = [...logText().matchAll(/Loaded: (\w+)\./g)].map(m => m[1]);
  // The picker shows every gun, the empty ones greyed out (aria-disabled);
  // loading one only says none are in stock. I shows just the guns in stock.
  {
    TAP('global', 'guns'); frames(2);
    const tiles = () => kids(E('gun-grid'));
    const nuke = () => tiles().find(t => /NUKE/.test(t.textContent));
    const all = tiles().length;
    await test('guns-show-all', () => { assert.ok(!!nuke() && must(nuke(), 'NUKE tile').getAttribute('aria-disabled') === 'true'
      && nth(tiles(), 0).getAttribute('aria-disabled') === undefined, `${all} tiles`); });
    const nukeTile = nuke();
    const n = (nukeTile ? tiles().indexOf(nukeTile) : -1) + 1;
    if (n <= 9) { keyDown(String(n), 'Digit' + n); keyUp(String(n), 'Digit' + n); frames(2); }
    else click(must(nuke(), 'NUKE tile'));
    await test('guns-empty-pick-says-none', () => { assert.ok(E('gun-overlay').hidden === false && /None in stock: NUKE/.test(logText()), logTail()); });
    TAP('global', 'gunStock'); frames(2);
    await test('guns-in-stock-only', () => { assert.ok(tiles().length < all && !nuke() && tiles().every(t => t.getAttribute('aria-disabled') === undefined)
      && /In Stock/.test(E('gun-stock').textContent), `${tiles().length}`); });
    TAP('global', 'gunStock'); frames(2);
    await test('guns-show-all-again', () => { assert.ok(tiles().length === all && /All/.test(E('gun-stock').textContent)); });
    TAP('global', 'guns'); frames(2);
    await test('guns-closed', () => { assert.ok(E('gun-overlay').hidden === true); });
  }
  // Watch the canvas: blast discs must match their weapon radii exactly,
  // and the camera zoom must stay inside its sane range.
  const boomR: number[] = [];
  const zoomZ: number[] = [];
  let lastFill: unknown = '';
  // Drone aim arms: the only strokes drawn at alpha 0.75, width 2.
  const arms: { x0: number; y0: number; x1: number; y1: number }[] = [];
  let armAlpha: unknown = 1, armWidth: unknown = 1, armFrom: [number, number] | null = null;
  {
    // A recording 2D context: the traps answer every member, so the bare function is a Callable through them.
    const rec = new Proxy(function () {}, {
      get(_t, p) {
        if (p === 'moveTo') return (x: number, y: number) => { armFrom = [x, y]; return rec; };
        if (p === 'lineTo') return (x: number, y: number) => {
          if (armAlpha === 0.75 && armWidth === 2 && armFrom) arms.push({ x0: armFrom[0], y0: armFrom[1], x1: x, y1: y });
          return rec;
        };
        if (p === 'arc') return (_x: number, _y: number, r: number) => { if (lastFill === '#ffb13c') boomR.push(r); };
        if (p === 'scale') return (x: number, _y: number) => { zoomZ.push(x); };
        if (p === 'fillStyle') return lastFill;
        if (p === 'createLinearGradient') return () => ({ addColorStop() {} });
        return (..._a: unknown[]) => rec;
      },
      set(_t, p, v) {
        if (p === 'fillStyle') lastFill = v;
        if (p === 'globalAlpha') armAlpha = v;
        if (p === 'lineWidth') armWidth = v;
        return true;
      },
      apply() { return rec; },
    }) as Callable;
    E('stage').getContext = () => rec;
  }
  // The firing-range preview gets its own disc recorder: the demo must show
  // the same exact-radius explosion the warhead would carve in the war.
  const pvBoomR: number[] = [];
  let pvLastFill: unknown = '';
  {
    // The same kind of recording context as the battlefield's, above.
    const pvrec = new Proxy(function () {}, {
      get(_t, p) {
        if (p === 'arc') return (_x: number, _y: number, r: number) => { if (pvLastFill === '#ffb13c') pvBoomR.push(r); };
        if (p === 'fillStyle') return pvLastFill;
        if (p === 'createLinearGradient') return () => ({ addColorStop() {} });
        return (..._a: unknown[]) => pvrec;
      },
      set(_t, p, v) { if (p === 'fillStyle') pvLastFill = v; return true; },
      apply() { return pvrec; },
    }) as Callable;
    E('preview-stage').getContext = () => pvrec;
  }
  await ensureAim();
  loadGun('Buckshot');
  // Fire the spread: the turn must advance only after all three pellets land,
  // proving each resolves instead of the volley counting as one hit.
  const volleyTurn = E('hud-turn').textContent;
  const volleyGun = E('hud-weapon').textContent;
  // Match only lines said after the press: full-history matches exit on the
  // first frame and the pellets never land.
  const freshFrom = (mark: number) => E('log').children.slice(mark).map(li => li.textContent).join('\n');
  let mark = E('log').children.length;
  TAP('global', 'fire');
  let guard = 0;
  while (guard++ < 1500 && !/You fire Buckshot/.test(freshFrom(mark))) frames(10);
  const spreadLog = logText();
  guard = 0;
  mark = E('log').children.length;
  while (guard++ < 4000 && !/(is aiming…|Your turn)/.test(freshFrom(mark))) frames(10);
  // A drone's turn: its aim arm must show, swing in small steps rather than
  // snapping, and stay within the power-scaled length (14..50). Step single
  // frames and keep the first unbroken run of arm frames. Fire first so the
  // battery gets its turn.
  {
    TAP('global', 'fire');
    const seen: typeof arms = [];
    for (let i = 0; i < 3000; i++) {
      arms.length = 0;
      frames(1);
      if (arms.length) seen.push(nth(arms, arms.length - 1));
      else if (seen.length) break;
    }
    const ang = seen.map(a => Math.atan2(a.y0 - a.y1, Math.abs(a.x1 - a.x0)) * 180 / Math.PI);
    const len = seen.map(a => Math.hypot(a.x1 - a.x0, a.y1 - a.y0));
    let maxStep = 0;
    for (let i = 1; i < ang.length; i++) maxStep = Math.max(maxStep, Math.abs(nth(ang, i) - nth(ang, i - 1)));
    await test('drone-aim-arm-shows', () => { assert.ok(seen.length >= 20, `frames=${seen.length}`); });
    await test('drone-aim-arm-glides', () => { assert.ok(seen.length >= 20 && maxStep < 6, `max step=${maxStep.toFixed(2)}°`); });
    await test('drone-aim-arm-power-length', () => { assert.ok(seen.length > 0 && len.every(l => l >= 13.9 && l <= 50.1), len.length ? `len ${Math.min(...len).toFixed(1)}..${Math.max(...len).toFixed(1)}` : 'none'); });
  }
  // Fresh match, then a single Shell for the battery-exchange checks.
  TAP('global', 'new'); frames(120);
  TAP('global', 'fire');
  guard = 0;
  while (guard++ < 1500 && !/You fire Shell/.test(logText())) frames(10);
  const firedLog = logText();
  guard = 0;
  while (guard++ < 3000 && !/(is aiming…|Your turn|Direct hit|destroyed!|wrecked!|won!)/.test(logText())) frames(10);
  const midLog = logText();

  // dialogue must have spoken at least once by now
  const dlg = E('dlg-line').textContent;

  await test('preshop', () => { assert.ok(shopOpen && /\$600/.test(shopCash0), shopCash0); });
  await test('shop-buy', () => { assert.ok(shopCash1.includes(`$${cashAfterGuns}`), shopCash1); });
  await test('boot-turn', () => { assert.ok(/YOU/.test(turn0), turn0); });
  await test('boot-hud', () => { assert.ok(/62°/.test(angle0) && wind0.length > 0 && armor0 === '100', `${angle0} | ${wind0} | ${armor0}`); });
  // Firing range: V opens the demo with its damage stats, frames render it,
  // V closes it again. Roll into a live aiming phase with a Shell loaded so
  // the demo plays the same shell the rack shows, whatever phase came before.
  await ensureAim();
  loadGun('Shell');
  TAP('global', 'battlePreview'); frames(5);
  const pvTitle = E('preview-title').textContent + ' | ' + E('preview-stats').textContent;
  const pvOpen = E('preview-veil').hidden === false;
  let pvDraws = 0;
  {
    const pvEl = E('preview-stage');
    const orig = pvEl.getContext;
    pvEl.getContext = () => { pvDraws++; return orig(); };
  }
  frames(240); // ~4s: aim, fly, boom, verdict on the mini hill
  TAP('global', 'battlePreview'); frames(5);
  await test('preview-open', () => { assert.ok(pvOpen && /^Shell \| 34 damage, blast 26\. Direct hits count double\.$/.test(pvTitle), `${pvTitle} | turn=${E('hud-turn').textContent} | ${E('hud-weapon').textContent}`); });
  await test('preview-runs', () => { assert.ok(pvDraws > 100, `frames=${pvDraws}`); });
  await test('preview-close', () => { assert.ok(E('preview-veil').hidden === true); });
  // Q shuts the firing range too, and stays in full screen; Esc leaves it open.
  TAP('global', 'battlePreview'); frames(5);
  await test('preview-reopen', () => { assert.ok(E('preview-veil').hidden === false); });
  ESC(); frames(3);
  await test('preview-ignores-esc', () => { assert.ok(E('preview-veil').hidden === false && fsExits.length === 0, `exits=${fsExits.length}`); });
  TAP('global', 'back'); frames(3);
  await test('preview-q', () => { assert.ok(E('preview-veil').hidden === true && fsExits.length === 0, `exits=${fsExits.length}`); });
  // The Shell demo (26 radius) must paint its disc at exactly warhead size.
  const pvBoomMax = pvBoomR.length ? Math.max(...pvBoomR) : -1;
  const pvBoomOk = pvBoomR.length >= 3 && Math.abs(pvBoomMax - 26) < 1.5;
  await test('preview-boom', () => { assert.ok(pvBoomOk, `n=${pvBoomR.length} max=${pvBoomMax.toFixed(1)}`); });
  await test('aim-hold', () => { assert.ok(angle1 !== angle0, `${angle0} -> ${angle1}`); });
  await test('power-hold', () => { assert.ok(power1 !== power0, `${power0} -> ${power1}`); });
  await test('blur-no-pause', () => { assert.ok(!/Paused\./.test(logText()) && angleB !== angleC, `${angleB} -> ${angleC}`); });
  await test('picker-loads-a-tile', () => { assert.ok(/Loaded: Buckshot/.test(qLog)); });
  await test('nuke-gated', () => { assert.ok(!cycleNames.includes('NUKE') && cycleNames.includes('Buckshot') && cycleNames.includes('Shell'), cycleNames.join(',')); });
  await test('buckshot-volley', () => { assert.ok(/You fire Buckshot/.test(spreadLog), `${volleyTurn} | ${volleyGun}`); });
  // Discs start tiny and grow to exactly their weapon radius, never beyond.
  // (The battery answers with whatever it bought, so any gun a drone may use is a legal max too.)
  const droneRadii = (JSON.parse(read('game.json')) as { arsenal: { ammo: { ai?: boolean; radius: number }[] } }).arsenal.ammo.filter(a => a.ai).map(a => a.radius);
  const boomMax = boomR.length ? Math.max(...boomR) : -1;
  const boomOk = boomR.length >= 3 &&
    Math.min(...[17, 26, 44, ...droneRadii].map(r => Math.abs(boomMax - r))) < 1.5;
  await test('boom-exact', () => { assert.ok(boomOk, `n=${boomR.length} max=${boomMax.toFixed(1)}`); });
  await test('camera-sane', () => { assert.ok(zoomZ.length > 0 && zoomZ.every(z => z >= 0.45 && z <= 1), `n=${zoomZ.length}`); });
  await test('player-fired', () => { assert.ok(/You fire/.test(firedLog)); });
  await test('battery-answers', () => { assert.ok(/(is aiming…|fires )/.test(midLog)); });
  await test('dialogue-shown', () => { assert.ok(dlg.length > 0, dlg); });
  await test('log-alive', () => { assert.ok(E('log').children.length > 5, `lines=${E('log').children.length}`); });
  // Solo: the player lobs shells straight up onto their own tank. A round ends
  // only with one unit standing, so after the wreck the drones fight on (the
  // log keeps showing their shots) until one is left, the round goes to the
  // battery, a life is gone, and the shop opens before the next round. A match
  // is replayed until the tank falls with at least two drones still standing.
  {
    let verdict: { log: string[]; scrap: number; left: number; lobs: number } | null = null;
    const droneKills = (ls: string[]) => ls.filter(l => /wrecks? \w+! \(\+/.test(l)).length;
    for (let attempt = 0; attempt < 12 && !verdict; attempt++) {
      E('seed-input').value = 'lob-' + attempt; // each attempt deals different hills
      TAP('global', 'new'); frames(120);
      if (E('shop-veil').hidden === false) { click(E('shop-next')); frames(120); }
      // The log keeps only its newest lines, so collect them as they arrive.
      const all: string[] = [];
      let tail = E('log').children.map(li => li.textContent);
      const lines = () => {
        const now = E('log').children.map(li => li.textContent);
        let at = 0;
        for (let n = Math.min(tail.length, now.length); n > 0; n--) {
          if (tail.slice(-n).join('\n') === now.slice(0, n).join('\n')) { at = n; break; }
        }
        all.push(...now.slice(at));
        tail = now;
        return all;
      };
      const angleNow = () => parseInt(E('hud-angle').textContent, 10);
      let lobs = 0;
      for (let g = 0; g < 4000 && !lines().some(l => /goes to the battery/.test(l)); g++) {
        if (/YOU\. Aim!/.test(E('hud-turn').textContent) && lobs < 60) {
          for (let k = 0; k < 200 && Math.abs(angleNow() - 90) > 2; k++) {
            const key = angleNow() < 90 ? 'barrelLeft' : 'barrelRight';
            const before = angleNow();
            KD('aim', key); frames(2); KU('aim', key);
            if (k === 5 && Math.abs(angleNow() - 90) > Math.abs(before - 90)) {
              const other = key === 'barrelLeft' ? 'barrelRight' : 'barrelLeft';
              KD('aim', other); frames(20); KU('aim', other);
            }
          }
          KD('aim', 'powerDown'); frames(120); KU('aim', 'powerDown');
          TAP('global', 'fire'); lobs++;
        }
        frames(30);
      }
      const log = lines();
      const scrap = log.findIndex(l => /Your tank is scrap metal/.test(l));
      const left = scrap < 0 ? 0 : 3 - droneKills(log.slice(0, scrap));
      if (scrap >= 0 && left >= 2) verdict = { log, scrap, left, lobs };
    }
    await test('solo-self-lob-wrecks-the-tank-with-drones-standing', () => { assert.ok(verdict !== null); });
    if (verdict) {
      const { log, scrap, left } = verdict;
      const after = log.slice(scrap + 1);
      await test('solo-drones-fight-on', () => { assert.ok(after.some(l => / fires /.test(l)), after.join(' | ')); });
      await test('solo-drones-fight-to-one', () => { assert.ok(droneKills(after) === left - 1, `left=${left} kills=${droneKills(after)}`); });
      await test('solo-round-ends-after-the-last-wreck', () => { assert.ok(/goes to the battery.*2 lives left/.test(after[after.length - 1] || ''), after.slice(-2).join(' | ')); });
      frames(600); // the name card runs on sim time, then the shop opens
      await test('solo-lost-round-opens-the-shop', () => { assert.ok(E('shop-veil').hidden === false); });
      await test('solo-lost-round-costs-a-life', () => { assert.ok(/^♥ 2$/.test(E('hud-lives').textContent), E('hud-lives').textContent); });
    }
  }
  // The stub only knows elements the game asked for; ask for the lobby ones.
  for (const id of ['lobby-initials', 'host-form', 'lobby-status', 'lobby-code',
    'lobby-room', 'lobby-seats', 'lobby-start']) void document.getElementById(id);
  // the hills picker fills from the server catalog, seeds never attached
  for (const id of ['rooms-open', 'lobby-map', 'lobby-hills', 'lobby-drones', 'lobby-count', 'difficulty-picker']) {
    void document.getElementById(id);
  }
  // The host's Menu Difficulty goes with the create and the lobby shows it.
  const difficultyTile = (key: string) => must(kids(E('difficulty-picker')).find(t => t.getAttribute('data-difficulty') === key), key + ' tile');
  click(difficultyTile('hard'));
  await test('difficulty-pick-saved', () => { assert.ok(window.localStorage.getItem('tankity-difficulty') === 'hard'
    && difficultyTile('hard').getAttribute('aria-pressed') === 'true', window.localStorage.getItem('tankity-difficulty') ?? undefined); });
  click(E('rooms-open')); await tick(10);
  const tiles = () => kids(E('lobby-map-picker'));
  const tileOn = () => tiles().filter(t => t.getAttribute('aria-pressed') === 'true').map(t => t.getAttribute('data-map'));
  await test('maps-catalog', () => { assert.ok(tiles().length === 3 && tiles().map(t => t.getAttribute('title')).join('|') === 'Random Hills|Canyon 3|Twin Hills', tiles().map(t => t.getAttribute('title')).join('|')); });
  await test('maps-tiles-are-buttons', () => { assert.ok(tiles().every(t => t.getAttribute('type') === 'button' && t.children.length === 2
    && childEl(t, 0).getAttribute('aria-hidden') === 'true' && nodeAt(t, 1).textContent === t.getAttribute('title'))); });
  await test('maps-random-selected', () => { assert.ok(tileOn().join() === '', tileOn().join()); });
  await test('room-occupancy', () => { assert.ok(E('lobby-count').textContent === '3 matches running · 4 lobbies open', E('lobby-count').textContent); });
  await test('room-dot-green', () => { assert.ok(E('net-dot').className.includes('on') && E('hud-server').textContent === 'online', `${E('net-dot').className} | ${E('hud-server').textContent}`); });
  // a full server says so in plain words, never a status code
  failCreate = 'The server is full. Try again later.';
  submit(E('host-form')); await until('the full-server line', () => E('lobby-status').textContent === failCreate, 5_000);
  await test('room-full', () => { assert.ok(E('lobby-status').textContent === failCreate, E('lobby-status').textContent); });
  failCreate = '';
  // transport trouble arrives in human words, never a status code
  for (const [mode, want] of [['down', 'Could not reach'], ['page', 'page instead of game data'], ['stumble', 'stumbled']] as const) {
    failMode = mode;
    submit(E('host-form')); await until(`the ${mode} line`, () => E('lobby-status').textContent.includes(want), 5_000);
    await test('room-err-' + mode, () => { assert.ok(E('lobby-status').textContent.includes(want), E('lobby-status').textContent); });
    if (mode === 'down') {
      await test('room-dot-red', () => { assert.ok(E('net-dot').className.includes('off') && E('hud-server').textContent === 'offline', `${E('net-dot').className} | ${E('hud-server').textContent}`); });
    }
  }
  failMode = '';
  // The lobby has its own initials boxes, the saved set in them (the title card's too).
  const lobbyBox = (n: number) => E(`lobby-initial-${n}`);
  const typeBox = (n: number, v: string) => { lobbyBox(n).value = v; fire(lobbyBox(n), 'input'); };
  await test('lobby-no-per-form-initials', () => { assert.ok(!rendered('host-initials') && !rendered('join-initials')); });
  await test('lobby-initials-prefilled', () => { assert.ok([1, 2, 3].map(n => lobbyBox(n).value).join('') === window.localStorage.getItem('tankity-initials'), [1, 2, 3].map(n => lobbyBox(n).value).join('')); });
  // Half-typed boxes stop Host with a line and put the player in the empty box; nothing is sent.
  createdInitials = ''; // set again only by a create that reaches the server
  typeBox(1, 'k');
  submit(E('host-form')); await tick(10);
  await test('lobby-half-typed-refused', () => { assert.ok(/all three/.test(E('lobby-initials-note').textContent) && createdInitials === ''
    && globalThis.__focused === lobbyBox(2), E('lobby-initials-note').textContent); });
  // A blocked set says so at once and stops Host too; the saved set stays.
  const savedBefore = window.localStorage.getItem('tankity-initials');
  typeBox(1, 'a'); typeBox(2, 's'); typeBox(3, 's');
  await test('lobby-blocked-said-at-once', () => { assert.ok(/not allowed/.test(E('lobby-initials-note').textContent)
    && window.localStorage.getItem('tankity-initials') === savedBefore, E('lobby-initials-note').textContent); });
  submit(E('host-form')); await tick(10);
  await test('lobby-blocked-refused', () => { assert.ok(/not allowed/.test(E('lobby-initials-note').textContent) && createdInitials === ''
    && globalThis.__focused === lobbyBox(1)); });
  // An allowed set is saved as it is typed, for the title card too, and the line clears.
  typeBox(1, 'k'); typeBox(2, 'e'); typeBox(3, 'n');
  await test('lobby-initials-saved', () => { assert.ok(window.localStorage.getItem('tankity-initials') === 'KEN' && E('lobby-initials-note').textContent === '', window.localStorage.getItem('tankity-initials') ?? undefined); });
  await test('lobby-initials-on-the-title-card', () => { assert.ok([1, 2, 3].map(n => E(`title-initial-${n}`).value).join('') === 'KEN', [1, 2, 3].map(n => E(`title-initial-${n}`).value).join('')); });
  // host a room on picked hills: code shows, roster opens, hills named
  click(nth(tiles(), 1)); // before hosting, a tile only sets the value
  submit(E('host-form')); await tick(10);
  await test('room-hosted', () => { assert.ok(E('lobby-code').textContent === 'TST1' && E('lobby-room').hidden === false, E('lobby-code').textContent); });
  await test('room-hosted-with-saved-initials', () => { assert.ok(createdInitials === window.localStorage.getItem('tankity-initials'), createdInitials); });
  await test('room-hides-forms', () => { assert.ok(E('lobby-rows').hidden === true && E('lobby-intro').hidden === true, `rows=${E('lobby-rows').hidden} intro=${E('lobby-intro').hidden}`); });
  const seatTiles = () => kids(E('lobby-seats'));
  const tileText = (t: StubElement) => t.children.map(c => c.textContent).join(' ');
  /** The listeners an element holds for an event type (none: an empty list). */
  const handlersOf = (t: StubElement, type: string) => { const l: Record<string, unknown[]> = t._l || {}; return l[type] || []; };
  await test('room-roster', () => { assert.ok(seatTiles().length === 4 && seatTiles().every(t => t.getAttribute('type') === 'button' && t.className.includes('unit-choice')), `tiles=${seatTiles().length}`); });
  // The grid shows initials for people, AI for drones; no lives or points.
  await test('seat-grid-labels', () => { assert.ok(seatTiles().map(t => nodeAt(t, 0).textContent).join('|') === 'ABC|AI|AI|AI'
    && !seatTiles().some(t => /lives|pts|x3/.test(tileText(t))), seatTiles().map(tileText).join('|')); });
  await test('seat-grid-host-flips', () => { assert.ok(nth(seatTiles(), 0).getAttribute('aria-disabled') === 'true'
    && seatTiles().slice(1).every(t => t.getAttribute('aria-disabled') === undefined && handlersOf(t, 'click').length > 0), seatTiles().map(t => t.getAttribute('aria-disabled')).join()); });
  // The host flips a drone seat to Open and back; the request carries both.
  click(nth(seatTiles(), 2)); await tick(10);
  await test('seat-open-sent', () => { assert.ok(seatModeSent && seatModeSent.seat === 2 && seatModeSent.mode === 'open', JSON.stringify(seatModeSent)); });
  await test('seat-open-shown', () => { assert.ok(nodeAt(nth(seatTiles(), 2), 0).textContent === 'Open' && nth(seatTiles(), 2).className.includes('seat-open')
    && nodeAt(nth(seatTiles(), 1), 0).textContent === 'AI', seatTiles().map(t => nodeAt(t, 0).textContent).join('|')); });
  click(nth(seatTiles(), 2)); await tick(10);
  await test('seat-back-to-ai', () => { assert.ok(must(seatModeSent, 'seatmode request').mode === 'ai' && nodeAt(nth(seatTiles(), 2), 0).textContent === 'AI'); });
  click(nth(seatTiles(), 3)); await tick(10); // leave one open for the guest's view below
  await test('seats-hint-host', () => { assert.ok(/Tap a seat/.test(E('seats-hint').textContent), E('seats-hint').textContent); });
  await test('room-hills', () => { assert.ok(E('lobby-hills').textContent === 'Hills: Canyon 3', E('lobby-hills').textContent); });
  await test('room-difficulty-sent', () => { assert.ok(createdDifficulty === 'hard', String(createdDifficulty)); });
  await test('room-difficulty-shown', () => { assert.ok(E('lobby-drones').textContent === "Drones: Hard (the host's Difficulty)" && !E('lobby-drones').hidden, E('lobby-drones').textContent); });
  click(difficultyTile('normal'));
  await test('map-tile-pressed', () => { assert.ok(tileOn().join() === 'canyon 3', tileOn().join()); });
  // the host can swap back to a random draw before starting
  click(nth(tiles(), 0)); await tick(10);
  await test('map-change', () => { assert.ok(E('lobby-hills').textContent === 'Hills: Random hills', E('lobby-hills').textContent); });
  // tapping a tile picks that map through the same request
  click(nth(tiles(), 2)); await tick(10);
  await test('map-tile-pick', () => { assert.ok(E('lobby-map').value === 'twin hills' && tileOn().join() === 'twin hills', `${E('lobby-map').value} | ${tileOn().join()}`); });
  await test('map-tile-sent', () => { assert.ok(createdMap === 'twin hills', createdMap); });
  click(nth(tiles(), 0)); await tick(10);
  await test('map-tile-random', () => { assert.ok(E('lobby-map').value === '' && createdMap === '' && E('lobby-hills').textContent === 'Hills: Random hills', `${E('lobby-map').value} | ${E('lobby-hills').textContent}`); });
  // a guest joining shows both initials on the roster, never undefined
  extraGuest = true;
  void document.getElementById('join-code');
  E('join-code').value = 'TST1';
  submit(E('join-form')); await tick(10);
  const guestNames = seatTiles().map(tileText).join('|');
  await test('guest-seat', () => { assert.ok(/ABC/.test(guestNames) && /DEF/.test(guestNames) && !/undefined/.test(guestNames), guestNames); });
  // A guest sees the host's choices but cannot change them.
  await test('guest-sees-open', () => { assert.ok(seatTiles().map(t => t.getAttribute('data-mode')).join() === 'human,human,ai,open', seatTiles().map(t => t.getAttribute('data-mode')).join()); });
  await test('guest-cannot-flip', () => { assert.ok(seatTiles().every(t => t.getAttribute('aria-disabled') === 'true' && !handlersOf(t, 'click').length)
    && /host decides/.test(E('seats-hint').textContent), E('seats-hint').textContent); });
  seatModes[3] = 'ai';
  // back to hosting so the match can start
  extraGuest = false;
  submit(E('host-form')); await tick(10);
  // the invite link carries the room code, and copy hands it over
  void document.getElementById('join-link');
  void document.getElementById('copy-link');
  await test('invite-link', () => { assert.ok(E('join-link').value === 'http://localhost:8000/operation-tankity/index.html?code=TST1', E('join-link').value); });
  click(E('copy-link')); await tick(10);
  await test('invite-copy', () => { assert.ok(copied === E('join-link').value, String(copied)); });
  // single-use invite: the boot already consumed ?code=zz99 above
  global.location.search = '';
  // start: the hills render from the server snapshot, first turn is ours
  NET_LOBBY = false;
  click(E('lobby-start')); await tick(10);
  await test('net-turn', () => { assert.ok(/YOU/.test(E('hud-turn').textContent), E('hud-turn').textContent); });
  await test('net-hud', () => { assert.ok(/Shell.*∞/.test(E('hud-weapon').textContent) && /ROOM/.test(E('hud-score').textContent), E('hud-weapon').textContent + ' | ' + E('hud-score').textContent); });
  // fire over the same public key as solo play; the server settles it
  sawFire = false;
  TAP('global', 'fire'); await tick(10);
  await test('net-fire', () => { assert.ok(sawFire, 'intent sent'); });
  frames(180); // the turn passes once the replay of the shot has played out
  await test('net-turn-passes', () => { assert.ok(/REAPER aiming/.test(E('hud-turn').textContent), E('hud-turn').textContent); });
  // Between rounds the room shops; V opens the firing range, and it stays
  // open through the polls that keep the shop fresh.
  NET_SHOP = true;
  seatArmor = 60;
  await until('the shop', () => E('shop-veil').hidden === false);
  await test('net-shop', () => { assert.ok(E('shop-veil').hidden === false, `shop hidden=${E('shop-veil').hidden}`); });
  // A damaged seat's Repair reads the room's armor, so it is enabled and asks the server.
  {
    const repairRow = must(shopRows().find(li => rowName(li).includes('Repair')), 'Repair row');
    const buy = childEl(actsOf(repairRow), actsOf(repairRow).children.length - 1);
    await test('net-shop-repair-enabled-when-damaged', () => { assert.ok(buy.disabled === false && !/Armor full/.test(repairRow.textContent), repairRow.textContent); });
    // A repair is priced and labelled by the packs the hull needs, however many are dialled in.
    TAP('shop', 'qtyUp'); TAP('shop', 'qtyUp'); frames(3);
    const dialled = must(shopRows().find(li => rowName(li).includes('Repair')), 'Repair row');
    await test('net-shop-repair-priced-by-need', () => { assert.ok(!/×/.test(dialled.textContent), dialled.textContent); });
    await test('net-shop-armor-pill', () => { assert.ok(E('hud-armor').textContent === '60', E('hud-armor').textContent); });
    click(buy); await tick(10);
    await test('net-shop-repair-goes-to-server', () => { assert.ok(buysSent.includes('repair'), buysSent.join()); });
  }
  // The shop button is the Ready toggle: it shows who is ready and the clock,
  // sends the wanted state in click order, and a fast double click ends unready.
  await test('net-ready-idle', () => { assert.ok(/^Ready/.test(E('shop-next').textContent) && !/✓/.test(E('shop-next').textContent)
    && E('shop-next').getAttribute('aria-pressed') === 'false'
    && /^0\/1 ready · shop closes in 1:\d\d/.test(E('shop-ready').textContent), E('shop-next').textContent + ' | ' + E('shop-ready').textContent); });
  click(E('shop-next')); await tick(10);
  await test('net-ready-on', () => { assert.ok(readySent.join() === 'true' && /^Ready ✓/.test(E('shop-next').textContent)
    && E('shop-next').getAttribute('aria-pressed') === 'true' && /^1\/1 ready/.test(E('shop-ready').textContent), readySent.join() + ' | ' + E('shop-next').textContent + ' | ' + E('shop-ready').textContent); });
  click(E('shop-next')); click(E('shop-next')); await tick(10);
  await test('net-ready-double-click-ordered', () => { assert.ok(readySent.join() === 'true,false,true' && mockReady === true, readySent.join()); });
  click(E('shop-next')); await tick(10);
  await test('net-ready-off', () => { assert.ok(readySent.join() === 'true,false,true,false' && !/✓/.test(E('shop-next').textContent)
    && E('shop-next').getAttribute('aria-pressed') === 'false', readySent.join() + ' | ' + E('shop-next').textContent); });
  TAP('shop', 'preview'); await tick(5);
  const pvOpened = E('preview-veil').hidden === false;
  await sleep(3400); await tick(10);
  await test('net-preview-stays', () => { assert.ok(pvOpened && E('preview-veil').hidden === false, `opened=${pvOpened} open-after-polls=${E('preview-veil').hidden === false}`); });
  TAP('global', 'back'); await tick(5);
  NET_SHOP = false;
  seatArmor = 100;
  await sleep(1800); await tick(10);
  // typing in a box is typing, not playing
  const logLen = E('log').children.length;
  for (const f of listeners['keydown'] || []) {
    f({ key: 'q', code: 'KeyQ', target: { tagName: 'INPUT' }, preventDefault: () => {}, repeat: false });
    f({ key: 'a', code: 'KeyA', target: { tagName: 'INPUT' }, preventDefault: () => {}, repeat: false });
  }
  frames(5);
  await test('input-guard', () => { assert.ok(E('log').children.length === logLen, `lines=${E('log').children.length}`); });
  // A suspended context (fresh refresh, no gesture yet) schedules nothing;
  // the first ticks after resume play instead of sitting silent.
  click(E('btn-music')); click(E('btn-music')); // end unmuted with a fresh scheduler
  acState = 'suspended';
  const notesCalm = FAKE_STATS.notes;
  AC_TIME.t += 5;
  await new Promise(r => setTimeout(r, 200));
  await test('music-idles-suspended', () => { assert.ok(FAKE_STATS.notes === notesCalm, `scheduled=${FAKE_STATS.notes - notesCalm}`); });
  acState = 'running';
  AC_TIME.t += 0.3;
  await new Promise(r => setTimeout(r, 200));
  await test('music-resumes', () => { assert.ok(FAKE_STATS.notes > notesCalm, `scheduled=${FAKE_STATS.notes - notesCalm}`); });
  // The watchdog must never churn the timer: with a stale tick and steady
  // frames, steps still fire the moment the context runs again.
  click(E('btn-music')); click(E('btn-music')); // end unmuted with a fresh scheduler
  acState = 'suspended';
  const stale0 = Date.now();
  while (Date.now() - stale0 < 1700) { frames(5); AC_TIME.t += 0.08; await new Promise(r => setTimeout(r, 25)); }
  acState = 'running';
  AC_TIME.t += 0.3;
  const rec0 = FAKE_STATS.notes;
  const recT = Date.now();
  while (Date.now() - recT < 600) { frames(5); AC_TIME.t += 0.08; await new Promise(r => setTimeout(r, 25)); }
  await test('music-after-watchdog', () => { assert.ok(FAKE_STATS.notes > rec0, `scheduled=${FAKE_STATS.notes - rec0}`); });
  const preJump = FAKE_STATS.notes;
  AC_TIME.t += 600;
  await new Promise(r => setTimeout(r, 400));
  await test('no-audio-backlog', () => { assert.ok(FAKE_STATS.notes - preJump < 300, `scheduled=${FAKE_STATS.notes - preJump}`); });
  // Tutorial replay from a live battle: leave the room the net tests
  // started, shut the lobby, deal in, walk out of the shop, wait out any
  // banner, then U coaches and Skip hides and remembers.
  // Leaving a running match: only the menu and shop show the button, it asks
  // first in the page, ESC and Stay keep the match, Leave room returns to solo.
  void document.getElementById('menu-leave'); void document.getElementById('shop-leave');
  void document.getElementById('leave-veil'); void document.getElementById('leave-go');
  void document.getElementById('leave-stay');
  // (shop-leave is in the shop component, src/ui/shop.tsx; the rest are in the page.)
  const shopSrc = fs.readFileSync(path.join(GAME_DIR, 'src', 'ui', 'shop.tsx'), 'utf8');
  await test('leave-markup', () => { assert.ok(html.includes('id="leave-veil"') && ['leave-go', 'leave-stay', 'again'].every(rendered) && rendered('menu-leave')
    && shopSrc.includes('id="shop-leave"')); });
  await test('leave-buttons-in-room', () => { assert.ok(E('menu-leave').hidden === false && E('shop-leave').hidden === false, `${E('menu-leave').hidden} ${E('shop-leave').hidden}`); });
  TAP('global', 'back'); frames(2);
  click(E('menu-leave')); frames(2);
  await test('leave-asks-first', () => { assert.ok(E('leave-veil').hidden === false && leaveSent === 0); });
  TAP('global', 'back'); frames(2);
  await test('leave-esc-stays', () => { assert.ok(E('leave-veil').hidden === true && leaveSent === 0 && /YOU|aiming/.test(E('hud-turn').textContent)
    && E('menu-overlay').hidden === false, E('hud-turn').textContent); });
  click(E('menu-leave')); frames(2);
  click(E('leave-stay')); frames(2);
  await test('leave-stay-stays', () => { assert.ok(E('leave-veil').hidden === true && leaveSent === 0); });
  // Hosting remembered the seat in this browser; Leave forgets it.
  const storedCodes = (): string[] => { try { const held: { seats: { code: string }[] } = JSON.parse(window.localStorage.getItem('tankity-seats') || '{}'); return held.seats.map(s => s.code); } catch (_) { return []; } };
  const heldBefore = storedCodes();
  click(E('menu-leave')); frames(2);
  click(E('leave-go')); await tick(10); frames(5);
  await test('leave-sent', () => { assert.ok(leaveSent === 1, 'leaves=' + leaveSent); });
  await test('seat-remembered-then-forgotten', () => { assert.ok(heldBefore.length > 0 && storedCodes().length === heldBefore.length - 1, heldBefore.join() + ' -> ' + storedCodes().join()); });
  await test('leave-cleaned-up', () => { assert.ok(E('leave-veil').hidden === true && E('menu-overlay').hidden === true
    && E('shop-veil').hidden === true && E('lobby-veil').hidden === true
    && E('menu-leave').hidden === true && E('shop-leave').hidden === true, `leave=${E('leave-veil').hidden} menu=${E('menu-overlay').hidden} shop=${E('shop-veil').hidden}`); });
  await test('leave-back-to-title', () => { assert.ok(/Back from the room/.test(logText()) && titleVeil().hidden === false, logText().split('\n').slice(-1)[0]); });
  const polls0 = stateCalls;
  await sleep(3600); frames(5); // a stopped poll never drags the old room back
  await test('leave-polling-stopped', () => { assert.ok(stateCalls === polls0, `extra polls=${stateCalls - polls0}`); });
  // The client against the server's real replies (protocol/*.json): a room
  // from create to the shop, and the two errors a player can hit mid-match.
  PFX.on = true; PFX.room = 'lobby-host';
  const fxRoomOf = (name: string) => must(fx(name).body.room, name + ' room');
  TAP('global', 'rooms'); await tick(10);
  submit(E('host-form')); await tick(10);
  await test('fx-lobby-code', () => { assert.ok(E('lobby-code').textContent === fx('create-reply').body.code && E('lobby-room').hidden === false, E('lobby-code').textContent); });
  await test('fx-lobby-seats', () => { assert.ok(E('lobby-seats').children.map(t => nodeAt(t, 0).textContent).join('|') === 'ABC|DEF|AI|Open', E('lobby-seats').children.map(t => nodeAt(t, 0).textContent).join('|')); });
  click(E('lobby-start')); await tick(10);
  await test('fx-play-turn', () => { assert.ok(/YOU/.test(E('hud-turn').textContent) && E('lobby-veil').hidden === true && E('shop-veil').hidden === true, E('hud-turn').textContent); });
  await test('fx-play-hud', () => { assert.ok(E('hud-armor').textContent === String(nth(fxRoomOf('play-my-turn').tanks, 0).hp) && /ROOM/.test(E('hud-score').textContent), E('hud-armor').textContent + ' | ' + E('hud-score').textContent); });
  // 429 (retried, then said kindly) and 409 (the server's own words).
  PFX.actError = 'error-too-fast';
  TAP('global', 'fire'); await until('the kind 429 line', () => /Easy on the trigger/.test(logText()));
  await test('fx-429-kind', () => { assert.ok(/Easy on the trigger/.test(logText()), logText().split('\n').slice(-1)[0]); });
  PFX.actError = 'error-not-your-turn';
  TAP('global', 'fire'); await tick(10);
  await test('fx-409-said', () => { assert.ok(logText().includes(must(fx('error-not-your-turn').body.error, 'error text')), logText().split('\n').slice(-1)[0]); });
  PFX.actError = '';
  // A real turn: shot and hits replay, then the drone's answer flies (and
  // hits us if the server says it did) and the turn is ours again with the
  // armor the server settled.
  TAP('global', 'fire'); await tick(10);
  frames(600);
  const after = fxRoomOf('play-after-fire');
  const hitMe = after.events.some(e => e.t === 'hit' && e.seat === 0 && e.by === 1);
  await test('fx-fire-replayed', () => { assert.ok(/ABC hits REAPER for \d+/.test(logText()) && /REAPER fires/.test(logText()) &&
    /REAPER hits YOU for \d+/.test(logText()) === hitMe, logText().split('\n').slice(-3).join(' | ')); });
  await test('fx-fire-turn-back', () => { assert.ok(/YOU/.test(E('hud-turn').textContent) && E('hud-armor').textContent === String(nth(after.tanks, 0).hp), E('hud-turn').textContent + ' | armor ' + E('hud-armor').textContent); });
  // The round is won: the room moves to the shop with the prize paid.
  PFX.room = 'shop-after-win';
  await until('the shop after the win', () => E('shop-veil').hidden === false);
  await test('fx-shop-opens', () => { assert.ok(E('shop-veil').hidden === false, `shop hidden=${E('shop-veil').hidden}`); });
  await test('fx-shop-cash', () => { assert.ok(E('shop-cash').textContent.includes(String(must(fxRoomOf('shop-after-win').you, 'you').cash)), E('shop-cash').textContent); });
  // The server's own shop with the host readied and a second human waiting.
  PFX.room = 'shop-ready';
  await until('the shop with the host ready', () => /^Ready ✓/.test(E('shop-next').textContent) && /^1\/2 ready/.test(E('shop-ready').textContent));
  await test('fx-shop-ready', () => { assert.ok(/^Ready ✓/.test(E('shop-next').textContent) && /^1\/2 ready · shop closes in 1:/.test(E('shop-ready').textContent), E('shop-next').textContent + ' | ' + E('shop-ready').textContent); });
  PFX.on = false;
  // The server's delta replies reached the client as complete rooms: polls
  // that held the current hills got them left out, and everything above held.
  await test('fx-delta-polls-omit-the-hills', () => { assert.ok(PFX.delta > 0 && PFX.full > 0, `delta ${PFX.delta}, full ${PFX.full}`); });
  await test('fx-hand-snapshots-match', () => { assert.ok(FX_DRIFT.size === 0, [...FX_DRIFT].slice(0, 6).join('; ')); });
  click(E('shop-leave')); frames(2);
  click(E('leave-go')); await tick(10); frames(5);
  TAP('global', 'new'); frames(150);
  for (let i = 0; i < 6 && (E('shop-veil').hidden === false || E('round-banner').hidden === false); i++) {
    if (E('shop-veil').hidden === false) click(E('shop-next'));
    frames(60);
  }
  TAP('global', 'tutorial'); frames(5);
  await test('tutorial-opens', () => { assert.ok(E('tutorial-overlay').hidden === false); });
  // Mid-battle the lesson starts at the battle's first step, the barrel.
  await test('tutorial-step', () => { assert.ok(/6 of 11$/.test(E('tutorial-count').textContent) && /barrel/.test(E('tutorial-text').textContent), E('tutorial-count').textContent); });
  // The coach sends the player into the gun picker: Q there shuts the picker
  // and leaves the tutorial running; a second Q skips it.
  TAP('global', 'guns'); frames(3);
  await test('esc-picker-open', () => { assert.ok(E('gun-overlay').hidden === false); });
  TAP('global', 'back'); frames(3);
  await test('esc-closes-picker-first', () => { assert.ok(E('gun-overlay').hidden === true && E('tutorial-overlay').hidden === false
    && window.localStorage.getItem('tankity-tutorial') !== 'done'); });
  TAP('global', 'back'); frames(3);
  await test('esc-then-skips-tutorial', () => { assert.ok(E('tutorial-overlay').hidden === true && window.localStorage.getItem('tankity-tutorial') === 'done'); });
  TAP('global', 'tutorial'); frames(5);
  await test('tutorial-reopens', () => { assert.ok(E('tutorial-overlay').hidden === false); });
  click(E('tutorial-skip')); frames(3);
  await test('tutorial-skips', () => { assert.ok(E('tutorial-overlay').hidden === true); });
  await test('tutorial-remembered', () => { assert.ok(window.localStorage.getItem('tankity-tutorial') === 'done'); });
  // ---- weapon effects: data, engine caps, reduced motion ----
  {
    const FX = window.TankityFX;
    await test('fx-engine-loaded', () => { assert.ok(!!FX && typeof FX.createSystem === 'function'); });
    assert.ok(FX, 'no window.TankityFX');
    const built: GameJson = JSON.parse(read('game.json'));
    const defs = FX.dress(built.effects);
    const setOf = (k: string) => must(defs[k], 'effects for ' + k);
    const impactOf = (k: string) => must(setOf(k).impact, k + '.impact');
    const arsenal = built.arsenal;
    const keys = arsenal.ammo.map(a => a.key).concat('laststand');
    await test('fx-file-valid', () => { assert.ok(FX.validate(defs, keys).length === 0, FX.validate(defs, keys).slice(0, 3).join(' | ')); });
    // game.yaml ends with the effects: block, written exactly as the editor exports it.
    const yaml = fs.readFileSync(path.join(GAME_DIR, 'game.yaml'), 'utf8');
    const at = yaml.search(/^effects:$/m);
    await test('fx-yaml-canonical', () => { assert.ok(at >= 0 && yaml.slice(at) === FX.toYaml(defs), 'the effects: block of game.yaml is not what FX.toYaml writes'); });
    const missing: string[] = [];
    for (const k of keys) {
      const w = defs[k];
      for (const slot of ['muzzle', 'trail', 'impact'] as const) if (!w || !w[slot] || !w[slot].emitters.length) missing.push(k + '.' + slot);
      if (w && !must(w.trail, k + '.trail').emitters.some(e => e.rate > 0)) missing.push(k + '.trail has no rate emitter');
      if (w && !must(w.impact, k + '.impact').emitters.some(e => e.unit === 'r')) missing.push(k + '.impact has nothing sized by the blast radius');
    }
    await test('fx-every-weapon-has-muzzle-trail-impact', () => { assert.ok(missing.length === 0, missing.join(', ')); });
    // Blast-sized shapes stay near the damage radius: nothing sized in r runs past 2r.
    const big: string[] = [];
    for (const k of keys) {
      for (const e of impactOf(k).emitters) {
        if (e.unit !== 'r' || !['ring', 'sprite', 'dot', 'smoke', 'spark'].includes(e.shape)) continue;
        const reach = e.size[1] * (e.shape === 'sprite' ? e.scale : Math.max(1, e.sizeEnd));
        if (reach > 2) big.push(k + ' ' + e.shape + ' ' + reach.toFixed(2) + 'r');
      }
    }
    await test('fx-blast-sized-effects-stay-near-radius', () => { assert.ok(big.length === 0, big.join(', ')); });
    // Specials the mechanics need exist where the weapon has the mechanic.
    const needs: Record<string, string> = { cluster: 'split', seeker: 'steer', laser: 'pierce', emp: 'arc' };
    const hasSpecial = (k: string) => { const sp = setOf(k).special; return sp && sp[must(needs[k], 'the special ' + k + ' needs')]; };
    await test('fx-specials', () => { assert.ok(Object.keys(needs).every(k => hasSpecial(k)), JSON.stringify(Object.keys(needs).filter(k => !hasSpecial(k)))); });
    // The pool is a hard cap, and a full pool recycles instead of growing.
    const sys = FX.createSystem({ max: 60 });
    for (let i = 0; i < 40; i++) sys.emit(setOf('nuke').impact, 100, 100, 0, 70);
    sys.step(0.016);
    await test('fx-budget-caps', () => { assert.ok(sys.live <= 60 && sys.stats.peak <= 60 && sys.stats.recycled > 0, `live=${sys.live} peak=${sys.stats.peak} recycled=${sys.stats.recycled}`); });
    // Reduced motion thins the same blast.
    const count = (reduced: boolean) => {
      const s2 = FX.createSystem({ max: 5000 });
      s2.reduced = reduced;
      s2.emit(setOf('mortar').impact, 100, 100, 0, 42);
      s2.step(0.2);
      return s2.stats.spawned;
    };
    const full = count(false), calm = count(true);
    await test('fx-reduced-motion-thins', () => { assert.ok(calm < full * 0.6 && calm > 0, `reduced ${calm} vs ${full}`); });
    // A trail drips along the path travelled, not once per frame.
    const sys2 = FX.createSystem({ max: 400 }), shellFx = { fx: null, fxs: null };
    FX.play.trail(sys2, setOf('shell'), shellFx, 0.016, 0, 0, 100, 0);
    FX.play.trail(sys2, setOf('shell'), shellFx, 0.016, 90, 0, 100, 0);
    await test('fx-trail-follows-path', () => { assert.ok(sys2.live >= 1, 'live=' + sys2.live); });
    // A burst in the air leaves out the ground layers (dirt thrown up, burn marks).
    const onGround = impactOf('mortar').emitters.filter(e => e.ground);
    await test('fx-ground-layers-marked', () => { assert.ok(onGround.length >= 2 && onGround.every(e => e.shape === 'sprite'), onGround.map(e => e.sheet).join(',')); });
    const spawned = (ground: boolean | undefined) => { const s3 = FX.createSystem({ max: 5000 }); s3.emit(setOf('mortar').impact, 100, 100, 0, 42, ground); s3.step(0.5); return s3.stats.spawned; };
    await test('fx-air-burst-skips-ground', () => { assert.ok(spawned(false) < spawned(true) && spawned(undefined) === spawned(true), `air ${spawned(false)} ground ${spawned(true)}`); });
    // Every shell names a rendered body; until its sheet loads the caller draws the plain disc.
    const spriteBody = (k: string) => { const body = setOf(k).body; return body && /^p_/.test(body.sprite || ''); };
    const noBody = arsenal.ammo.filter(a => !spriteBody(a.key)).map(a => a.key);
    await test('fx-every-shell-has-a-body-sprite', () => { assert.ok(noBody.length === 0, noBody.join(',')); });
    const ctx = { save() {}, restore() {}, translate() {}, rotate() {}, drawImage() {}, globalCompositeOperation: '', globalAlpha: 1 };
    // The screen flash ramps in over 80 ms and never passes 0.35, whatever an effect asks.
    const flashAt = (sys4: FxSys, t: number) => { const seen: number[] = []; const c4 = { set globalAlpha(v: number) { seen.push(v); }, get globalAlpha() { return 1; }, fillRect() {}, fillStyle: '' }; sys4.step(t); sys4.drawFlash(asContext(c4), 10, 10); return seen.length ? nth(seen, 0) : 0; };
    const fs1 = FX.createSystem({ max: 400 });
    fs1.emit({ emitters: [], screen: { flash: { color: '#ffffff', alpha: 1, dur: 0.6 } } }, 0, 0, 0, 1);
    const a0 = flashAt(fs1, 0.01), a1 = flashAt(fs1, 0.09);
    await test('fx-flash-ramps-in', () => { assert.ok(a0 > 0 && a0 < 0.1, 'at 10 ms ' + a0); });
    await test('fx-flash-capped', () => { assert.ok(a1 > 0.2 && a1 <= 0.35, 'at 100 ms ' + a1); });
    const nukeFlash = () => must(must(impactOf('nuke').screen, 'nuke.impact.screen').flash, 'nuke.impact.screen.flash');
    await test('fx-nuke-flash-warm', () => { assert.ok(nukeFlash().alpha <= 0.35 && nukeFlash().color === '#ffb070', JSON.stringify(nukeFlash())); });
    // Screen flashes off: no flash at all, and the big bright additive layers stay out.
    const fs2 = FX.createSystem({ max: 5000 });
    FX.flashes = false;
    fs2.emit(setOf('nuke').impact, 100, 100, 0, 70, true);
    fs2.step(0.3);
    const calmFlash = flashAt(fs2, 0.05), calmSpawned = fs2.stats.spawned;
    FX.flashes = true;
    const fs3 = FX.createSystem({ max: 5000 });
    fs3.emit(setOf('nuke').impact, 100, 100, 0, 70, true);
    fs3.step(0.3);
    await test('fx-flashes-off-drops-flash', () => { assert.ok(calmFlash === 0, 'alpha ' + calmFlash); });
    const bright = impactOf('nuke').emitters.filter(e => FX.isBright(e));
    await test('fx-flashes-off-drops-bright-layers', () => { assert.ok(bright.length >= 2 && calmSpawned < fs3.stats.spawned, `bright ${bright.length}, ${calmSpawned} vs ${fs3.stats.spawned}`); });
    // Screen flashes off also drops any additive dot or sprite 36 px or more in radius as it plays,
    // however it is sized: a plasma ring at full power (r 90) keeps no large white core.
    for (const key of arsenal.ammo.filter(a => a.effect === 'plasma').map(a => a.key)) {
      const big = impactOf(key).emitters.filter(e => e.glow && ['dot', 'smoke', 'sprite'].includes(e.shape)
        && e.size[1] * (e.unit === 'r' ? 90 : 1) * (e.shape === 'sprite' ? e.scale : Math.max(1, e.sizeEnd)) >= 36);
      await test(`fx-flashes-off-filters-${key}-by-size`, () => { assert.ok(big.length >= 1 && big.every(e => FX.isBright(e, e.unit === 'r' ? 90 : 1)), String(big.length)); });
      // What stays and is sizeable (15 px or more) is coloured: no white dot, no untinted or near-white sprite.
      const kept = impactOf(key).emitters.filter(e => !FX.isBright(e, e.unit === 'r' ? 90 : 1) && e.glow && ['dot', 'smoke', 'sprite'].includes(e.shape)
        && e.size[1] * (e.unit === 'r' ? 90 : 1) * (e.shape === 'sprite' ? e.scale : 1) >= 15);
      await test(`fx-${key}-keeps-no-white-core`, () => { assert.ok(kept.length >= 1 && kept.every(e => (e.shape === 'sprite'
        ? /^#/.test(e.tint || '') && !/^#f[0-9a-f]f[0-9a-f]f/i.test(e.tint) : !e.colors.includes('#ffffff'))), JSON.stringify(kept.map(e => [e.colors, e.tint]))); });
      const off = FX.createSystem({ max: 5000 }), on = FX.createSystem({ max: 5000 });
      FX.flashes = false;
      off.emit(setOf(key).impact, 100, 100, 0, 90, true);
      FX.flashes = true;
      on.emit(setOf(key).impact, 100, 100, 0, 90, true);
      await test(`fx-flashes-off-thins-${key}`, () => { assert.ok(off.stats.spawned < on.stats.spawned, `${off.stats.spawned} vs ${on.stats.spawned}`); });
    }
    // Preloading: a weapon's every sheet (body, muzzle, trail, impact, specials), and the
    // engine never fetches mushroom any more.
    const nukeSheets = FX.sheetsOf(defs.nuke);
    await test('fx-sheets-of-a-weapon', () => { assert.ok(nukeSheets.includes('nuke') && nukeSheets.includes('p_nuke') && nukeSheets.includes('blast') && nukeSheets.includes('muzzle'), nukeSheets.join(',')); });
    await test('fx-no-mushroom-sheet', () => { assert.ok(!('mushroom' in JSON.parse(read('fx/sprites/sprites.json'))) && !fs.existsSync(path.join(GAME_DIR, 'fx/sprites/mushroom.png'))); });
    await test('fx-body-falls-back-before-load', () => { assert.ok(FX.drawBody(asContext(ctx), 0, 0, 10, 0, { halo: 0, sprite: 'p_shell', size: 15 }, '#ffffff', 0) === false); });
  }
  {
    // A shell leaves the muzzle inside its gunner's box: it ignores its
    // gunner until it is clear of that box, then hits it if it comes back.
    // Deliberately partial tanks: sweepHit reads only the position and armor.
    const drone = { x: 300, y: 400, hp: 50 } as Tank, foe = { x: 600, y: 400, hp: 50, isPlayer: true } as Tank;
    type Sweep = Parameters<typeof sweepHit>[1];
    const hits = (shell: Sweep, ...seg: [number, number, number, number]) => sweepHit([drone, foe], shell, ...seg);
    const a = 62 * Math.PI / 180, mx = 300 + Math.cos(a) * 20, my = 386 - Math.sin(a) * 20;
    const s: Sweep = { owner: drone, pierced: false };
    await test('own-shell-passes-out-of-gunner', () => { assert.ok(hits(s, mx, my, 330, 360) === null && s.clear === true); });
    await test('own-shell-hits-gunner-coming-back', () => { assert.ok((hits(s, 330, 360, 300, 370) || {}).t === drone); });
  }
  await test('esc-keeps-fullscreen', () => { assert.ok(fsExits.length === 0 && document.fullscreenElement === els['frame'], `exitFullscreen called ${fsExits.length}x: ${fsExits[0] || ''}`); });
})().catch((err: unknown) => {
  // A throw outside a subtest (a failed must(), a guard that tripped) would otherwise only
  // reject this top-level await: node:test absorbs the rejection, the game's own timers keep
  // the event loop alive, and the run hangs until CI's timeout. Fail now instead.
  console.error(err);
  process.exit(1);
}).finally(() => {
  for (const h of liveTimers) { clearTimeout(h); clearInterval(h); }
});
