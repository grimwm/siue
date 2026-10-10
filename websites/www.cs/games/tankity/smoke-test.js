// Headless smoke for the Scorched Earth rewrite. Run here: `node smoke-test.js`.
// Exercises the exact shipped script with a dependency-free DOM + canvas stub,
// driving only public inputs (keydown/keyup). Fails loudly on any exception,
// a stuck turn loop, an unscrolled Space, or a silent battlefield.
'use strict';
const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'game.js'), 'utf8');

function makeCallable() {
  const fn = function () { return proxy; };
  const proxy = new Proxy(fn, {
    get: () => proxy,
    set: () => true,
    apply: () => proxy,
  });
  return proxy;
}

const listeners = {}; // type -> [fn] on window
function makeEl(id) {
  const el = {
    id, textContent: '', innerHTML: '', hidden: true, value: '',
    disabled: false, style: {}, className: '', scrollTop: 0, scrollHeight: 0,
    children: [],
    scrollIntoView() { globalThis.__scrolledTo = this; },
    querySelector(sel) {
      const want = sel.startsWith('.') ? sel.slice(1) : null;
      const wid = sel.startsWith('#') ? sel.slice(1) : null;
      const walk = (node) => {
        for (const c of node.children || []) {
          if (!c || typeof c !== 'object') continue;
          if ((want && String(c.className || '').split(' ').includes(want)) || (wid && c.id === wid)) return c;
          const d = walk(c);
          if (d) return d;
        }
        return null;
      };
      return walk(this);
    },
    append(...nodes) { for (const n of nodes) this.children.push(n); return this; },
    get firstChild() { return this.children[0]; },
    appendChild(c) { this.children.push(c); return c; },
    removeChild(c) { this.children.splice(this.children.indexOf(c), 1); return c; },
    addEventListener(t, f) { (this._l = this._l || {})[t] = ((this._l)[t] || []).concat(f); },
    setAttribute(k, v) { (this._attrs = this._attrs || {})[k] = String(v); },
    getAttribute(k) { return (this._attrs || {})[k]; },
    getBoundingClientRect: () => ({ width: 720, height: 460 }),
    getContext: () => makeCallable(),
    blur: () => {},
  };
  return el;
}
function click(el) {
  for (const f of ((el._l || {}).click || [])) f({ currentTarget: el, preventDefault: () => {} });
}
const els = {};
global.document = {
  readyState: 'complete',
  getElementById: id => (els[id] = els[id] || makeEl(id)),
  createElement: tag => makeEl(tag),
  createTextNode: t => ({ textContent: String(t), children: [] }),
  querySelectorAll: () => [],
  addEventListener: () => {},
};
global.window = {
  addEventListener: (t, f) => { (listeners[t] = listeners[t] || []).push(f); },
  matchMedia: () => ({ matches: false }),
  localStorage: { _m: {}, getItem(k) { return this._m[k] || null; }, setItem(k, v) { this._m[k] = String(v); } },
};
global.fetch = async (url) => {
  if (/keys\.json$/.test(String(url))) {
    return { ok: true, json: async () => JSON.parse(fs.readFileSync(path.join(__dirname, 'keys.json'), 'utf8')) };
  }
  return { ok: true, json: async () => ({ scores: [] }) };
};
global.location = { origin: 'http://localhost:8000', pathname: '/operation-tankity/index.html', search: '' };
// A friend arrives on an invite link: the boot consumes ?code= once.
global.location.search = '?code=zz99';
Object.defineProperty(globalThis, 'navigator',
  { value: { clipboard: { writeText: async t => { globalThis.__copied = t; } } }, configurable: true });
global.requestAnimationFrame = cb => { global.__raf = cb; return 1; };
// Fake WebAudio: proves the synth + scheduler run without a browser, and lets
// the test jump the clock forward like a background tab would.
const AC_TIME = { t: 0 };
const FAKE_STATS = { notes: 0 };
function fakeParam() { return { setValueAtTime() {}, exponentialRampToValueAtTime() {} }; }
class FakeNode {
  constructor() { this.frequency = fakeParam(); this.gain = fakeParam(); }
  connect() {}
  start() { FAKE_STATS.notes++; }
  stop() {}
}
global.window.AudioContext = class {
  constructor() { this.sampleRate = 44100; this.destination = {}; }
  get state() { return globalThis.__acState || 'running'; }
  get currentTime() { return AC_TIME.t; }
  // Like a real pre-gesture context, resume stays pending until the test
  // flips __acState itself, so the suspend gate can be observed.
  resume() {}
  createOscillator() { return new FakeNode(); }
  createGain() { return new FakeNode(); }
  createBuffer(ch, len) { return { getChannelData: () => new Float32Array(len) }; }
  createBufferSource() { return new FakeNode(); }
  createBiquadFilter() { return new FakeNode(); }
};

// ---- boot the exact shipped script ----
els['seed-input'] = makeEl('seed-input');
els['seed-input'].value = 'scorch-01';
eval(src);

// ---- driver: every press below comes from keys.json, so the suite proves the
// file and the shipped bindings agree instead of hardcoding keys twice ----
const KEYS = JSON.parse(fs.readFileSync(path.join(__dirname, 'keys.json'), 'utf8'));
for (const ctx of ['aim', 'shop', 'global', 'scroll']) {
  if (!KEYS[ctx]) throw new Error('keys.json is missing context ' + ctx);
}
function pressToken(t) {
  t = String(t).replace(/^Ctrl\+/, '');
  let m = /^Key([A-Z])$/.exec(t);
  if (m) return [m[1].toLowerCase(), 'Key' + m[1]];
  m = /^Digit([0-9])$/.exec(t);
  if (m) return [m[1], 'Digit' + m[1]];
  if (t === 'Space' || t === ' ') return [' ', 'Space'];
  if (t === 'ControlLeft' || t === 'ControlRight') return ['Control', t];
  if (t === 'Control') return ['Control', 'ControlLeft'];
  return [t, /^[A-Z][A-Za-z]*$/.test(t) ? t : undefined];
}
const KB = (ctx, a, i) => pressToken((KEYS[ctx][a] || [])[i || 0]);
const KBD = (ctx, a, n) => pressToken((KEYS[ctx][a] || [])[n - 1]);
const KD = (ctx, a, i, extra) => keyDown(...KB(ctx, a, i), extra);
const KU = (ctx, a, i) => keyUp(...KB(ctx, a, i));
const TAP = (ctx, a, i, extra) => { KD(ctx, a, i, extra); KU(ctx, a, i); };
const TAPD = (ctx, a, n, extra) => { const t = KBD(ctx, a, n); keyDown(...t, extra); keyUp(...t); };
function keyDown(k, code, extra) {
  for (const f of listeners['keydown'] || []) f(Object.assign({ key: k, code, preventDefault: () => {}, repeat: false }, extra));
}
function keyUp(k, code) {
  for (const f of listeners['keyup'] || []) f({ key: k, code });
}
let ts = 0;
function frames(n) {
  for (let i = 0; i < n; i++) { ts += 16.7; global.__raf(ts); }
}
const logText = () => els['log'].children.map(li => li.textContent).join('\n');
const errors = [];
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra !== undefined ? ' :: ' + extra : ''));
  if (!cond) errors.push(name);
}

// Boot runs a demo battle: no veils, no ambush shop, crew drives every tank.
for (const id of ['new-game', 'round-banner', 'round-banner-text', 'preview-result']) {
  void document.getElementById(id);
}
frames(30);
check('demo-plays', els['shop-veil'].hidden === true && /you 100/.test(els['hud-armor'].textContent),
  els['hud-armor'].textContent);
check('no-ambush-shop', els['shop-veil'].hidden === true);
function change(el) {
  for (const f of ((el._l || {}).change || [])) f({ preventDefault: () => {} });
}

// Space must always preventDefault (no page scroll), both binding paths
let pd = 0;
for (const f of listeners['keydown'] || []) {
  f({ code: 'Space', key: 'x', preventDefault: () => { pd++; }, repeat: false });
  f({ key: ' ', preventDefault: () => { pd++; }, repeat: false });
}
check('keys-no-scroll', pd === 2, `prevented=${pd}/2`);
// Fullscreen degrades honestly where the API is absent (as in this stub).
TAP('global', 'fullscreen'); frames(2);
check('fullscreen-fallback', /Fullscreen is not supported/.test(logText()));
// Sound and music mute separately, by button or by key, without touching each other.
click(els['btn-sound']);
check('sound-off', els['btn-sound'].textContent === 'Sound: off (E)', els['btn-sound'].textContent);
check('sound-spares-music', els['btn-music'].textContent === '', JSON.stringify(els['btn-music'].textContent));
TAP('global', 'music');
check('music-off', els['btn-music'].textContent === 'Music: off (M)', els['btn-music'].textContent);
check('music-spares-sound', els['btn-sound'].textContent === 'Sound: off (E)', els['btn-sound'].textContent);
click(els['btn-sound']);
check('sound-on', els['btn-sound'].textContent === 'Sound: on (E)', els['btn-sound'].textContent);
TAP('global', 'sound');
check('sound-key-off', els['btn-sound'].textContent === 'Sound: off (E)', els['btn-sound'].textContent);
TAP('global', 'music');
check('music-on', els['btn-music'].textContent === 'Music: on (M)', els['btn-music'].textContent);
TAP('global', 'sound');
click(els['btn-music']); click(els['btn-music']); // end unmuted with a fresh scheduler
// ---- game rooms: lobby + net play against a scripted server ----
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'game.css'), 'utf8');
const php = fs.readFileSync(path.join(__dirname, 'rooms.php'), 'utf8');
for (const id of ['rooms-open', 'lobby-veil', 'host-form', 'host-initials', 'join-form',
  'join-code', 'join-initials', 'lobby-status', 'lobby-room', 'lobby-code',
  'lobby-seats', 'lobby-start', 'lobby-leave', 'lobby-close',
  'lobby-map', 'lobby-hills', 'lobby-count', 'rematch',
  'new-game', 'round-banner', 'round-banner-text', 'preview-result']) {
  check('lobby-markup-' + id, html.includes('id="' + id + '"'));
}
check('no-status-codes', !/server said no/.test(src));
check('room-cap', /ROOM_MAX_ROOMS/.test(php) && /room_max_rooms/.test(php) && /every room is taken/.test(php));
check('no-seed-leak', (() => {
  const start = php.indexOf('function room_snapshot');
  const end = php.indexOf('function room_find_seat', start);
  const body = php.slice(start, end);
  return !/'seed'/.test(body) && !/'rng'/.test(body) && !/'token'/.test(body);
})());
check('lobby-css-acts-right', /\.card \.acts\s*\{[^}]*justify-content:\s*flex-end/.test(css));
for (const id of ['btn-sound', 'btn-music']) check('audio-markup-' + id, html.includes('id="' + id + '"'));
check('css-fit-windowed', /\.canvas-holder\s*\{[^}]*100vh/.test(css));
check('css-fit-fullscreen', /#frame:fullscreen\s*\{[^}]*overflow:\s*hidden/.test(css));
check('css-actions-grid', /\.guide-actions\s*\{[^}]*display:\s*grid/.test(css));
check('css-menu-top', /\.menubar\s*\{[^}]*top:\s*0\.5rem/.test(css));
check('css-menu-centered', /\.menubar\s*\{[^}]*justify-content:\s*center/.test(css));
check('css-menu-row', /\.menubar\s*\{[^}]*flex-wrap:\s*nowrap/.test(css));
check('css-menu-block', /\.menubar\s*\{[^}]*background/.test(css));
check('css-stats-strip', /\.hudbar\s*\{[^}]*position:\s*static/.test(css));
check('pad-note', html.includes('class="pad-note"') && html.includes('barrel'));
check('key-hints', html.includes('data-keyhint="global:menu">(C)<') && html.includes('data-keyhint="global:fire">(Ctrl)<'));
check('key-style', /button \.key\s*\{[^}]*background/.test(css));
// Panels live over the battle, never beside it; L/H/R flip them without pausing.
check('no-side-panels', !/<aside/.test(html));
for (const id of ['log-overlay', 'help-overlay', 'report-overlay', 'btn-log', 'btn-help', 'btn-report']) {
  check('overlay-markup-' + id, html.includes('id="' + id + '"'));
}
check('overlays-in-frame', ['log-overlay', 'help-overlay', 'report-overlay']
  .every(id => html.indexOf('id="' + id + '"') > html.indexOf('id="frame"')));
TAP('global', 'log');
check('log-toggle', els['log-overlay'].hidden === false);
TAP('global', 'log');
check('log-untoggle', els['log-overlay'].hidden === true);
TAP('global', 'help');
check('help-toggle', els['help-overlay'].hidden === false);
click(els['help-close']);
check('help-close', els['help-overlay'].hidden === true);
TAP('global', 'help');
TAP('global', 'escape');
check('help-esc', els['help-overlay'].hidden === true);
check('banner-centered', /\.banner\s*\{[^}]*top:\s*50%/.test(css) && /translateY\(-50%\)/.test(css));
TAP('global', 'report');
check('report-toggle', els['report-overlay'].hidden === false);
click(els['report-close']);
check('report-close', els['report-overlay'].hidden === true);
// New Game, seed, sound, music, fullscreen, and rooms live in the in-frame menu.
for (const id of ['menu-overlay', 'btn-menu', 'menu-close', 'seed-form', 'new-game', 'rooms-open']) {
  check('menu-markup-' + id, html.includes('id="' + id + '"'));
}
check('menu-in-frame', html.indexOf('id="seed-form"') > html.indexOf('id="frame"'));
check('menu-grid', html.includes('menu-grid'));
check('menu-buttons', /#frame button\s*\{[^}]*font-size:\s*0\.75rem/.test(css));
check('menu-grid-cols', /\.menu-grid\s*\{[^}]*repeat\(3, 1fr\)/.test(css));
// Secondary is the default (navbar style); gold is opt-in via .btn-primary.
check('buttons-secondary-default', /\nbutton\s*\{[^}]*background:\s*var\(--panel\)/.test(css) && /\nbutton\s*\{[^}]*border:\s*1px solid var\(--line\)/.test(css));
check('buttons-primary-gold', /button\.btn-primary[^{]*\{[^}]*background:\s*var\(--accent\)/.test(css));
const menubarHtml = html.slice(html.indexOf('id="menubar"'), html.indexOf('id="log-overlay"'));
check('menubar-one-primary', (menubarHtml.match(/btn-primary/g) || []).length === 1 && /id="btn-menu" class="btn-primary"/.test(menubarHtml));
TAP('global', 'menu');
check('menu-toggle', els['menu-overlay'].hidden === false && els['btn-menu'].getAttribute('aria-expanded') === 'true');
click(els['menu-close']);
check('menu-close', els['menu-overlay'].hidden === true);
// C opens the menu but never closes it; ESC does the closing.
TAP('global', 'menu');
check('menu-reopen', els['menu-overlay'].hidden === false);
TAP('global', 'menu');
check('menu-c-stays', els['menu-overlay'].hidden === false);
TAP('global', 'escape');
check('menu-esc', els['menu-overlay'].hidden === true);
  // Tutorial: the menu carries a replay button (pressed for real at the end).
  check('menu-tutorial', !!els['tutorial-open'] && !!els['tutorial-overlay'] && !!els['tutorial-skip']);
  // Four 32-step songs; the round picks the song.
  const songNames = (src.match(/name: '[^']+'/g) || []).filter(n => /Rollout|High Ground|Crater Blues|Last Tank/.test(n));
  check('songs', songNames.length === 4 && /songIdx = \(G\.round - 1\) % SONGS\.length/.test(src), songNames.join(','));
// Every scrollable panel shows its keys, dimmed while everything fits.
const navCount = (html.match(/class="nav-hint[" ]/g) || []).length;
check('nav-hints', navCount === 9, `hints=${navCount}`);
TAP('global', 'help');
check('nav-disabled', els['nav-help'].getAttribute('aria-disabled') === 'true');
els['help-overlay'].scrollHeight = 500;
KD('scroll', 'lineDown');
check('scroll-line', els['help-overlay'].scrollTop === 40, `top=${els['help-overlay'].scrollTop}`);
check('nav-enabled', els['nav-help'].getAttribute('aria-disabled') === 'false');
KD('scroll', 'pageDown');
check('scroll-page', els['help-overlay'].scrollTop === 240, `top=${els['help-overlay'].scrollTop}`);
KD('scroll', 'lineUp');
check('scroll-up', els['help-overlay'].scrollTop === 200, `top=${els['help-overlay'].scrollTop}`);
KD('scroll', 'halfDown', 0, { ctrlKey: true });
check('scroll-half-down', els['help-overlay'].scrollTop === 300, `top=${els['help-overlay'].scrollTop}`);
KD('scroll', 'halfUp', 0, { ctrlKey: true });
check('scroll-half-up', els['help-overlay'].scrollTop === 200, `top=${els['help-overlay'].scrollTop}`);
TAP('global', 'help');
const idleTop = els['help-overlay'].scrollTop;
KD('scroll', 'lineDown');
check('scroll-idle', els['help-overlay'].scrollTop === idleTop, `top=${els['help-overlay'].scrollTop}`);
// The camera pins the ground to the viewport floor: no void below the world.
check('cam-pins-ground', /H \+ 8 - halfView/.test(src));
check('cam-wide-sky', /fillRect\(-W - 10, -2 \* H - 10, 3 \* W/.test(src));
// (invite-prefill runs inside the async block below: openLobby unhides late)
// The clean-initials list must match the server copy exactly (cylon rule).
function blockedOf(src) {
  const start = src.indexOf('BLOCKED_INITIALS = [');
  const end = src.indexOf('];', start);
  return [...src.slice(start, end).matchAll(/'([A-Z]{3})'/g)].map(m => m[1]).sort().join(',');
}
check('blocked-parity',
  blockedOf(php) === blockedOf(src),
  blockedOf(src).split(',').length + ' entries');
for (const [f, text] of [['game.js', src], ['index.html', html], ['game.css', css], ['rooms.php', php]]) {
  check('no-dashes-' + f, !/[—–]/.test(text));
}
check('net-round-event', /e\.t === 'round'/.test(src) && /'t' => 'round'/.test(php));
function submit(el) {
  for (const f of ((el._l || {}).submit || [])) f({ preventDefault: () => {} });
}
const tick = async (n) => {
  for (let i = 0; i < (n || 6); i++) { await new Promise(r => setImmediate(r)); frames(2); }
};
let SEQ = 10;
const nx = () => ++SEQ;
let curTurn = 0;
const terr720 = () => new Array(720).fill(300);
function scriptTank(seat, x, name, kind) {
  return {
    seat, kind, name, x, y: 300, angle: 60, power: 55,
    hp: kind === 'human' ? 100 : 60, maxHp: kind === 'human' ? 100 : 60,
    dirS: seat === 0 ? 1 : -1,
  };
}
function scriptSeats() {
  // Server shape: humans arrive as name=initials, drones as name=AI name.
  return [
    { seat: 0, human: true, name: 'abc', lives: 3, score: 0 },
    { seat: 1, human: false, name: 'REAPER', lives: 0, score: 0 },
  ];
}
function scriptYou() {
  return {
    ammo: { shell: -1, buck: 1, mortar: 0, rail: 0, nuke: 0 },
    cash: 600, score: 0, lives: 3, fuel: 80, weapon: 'shell', nextUp: 3000,
  };
}
function playRoom(turn, events) {
  return Object.assign({
    code: 'TST1', phase: NET_SHOP ? 'shop' : 'play', round: 1, wind: 2, turn,
    terrain: terr720(),
    tanks: [scriptTank(0, 100, 'abc', 'human'), scriptTank(1, 600, 'REAPER', 'ai')],
    seats: scriptSeats(), events: events || [], you: scriptYou(), csrf: 'cs0',
  }, mapFields());
}
const okJson = d => ({ ok: true, json: async () => d });
let createdMap = '';
let failCreate = '';
let failMode = '';
let sawFire = false;
const mapFields = () => ({
  map: createdMap || null,
  mapName: createdMap ? 'Canyon 3' : 'Random hills',
});
global.fetch = async (url, opts) => {
  const u = String(url);
  const body = opts && opts.body ? JSON.parse(opts.body) : {};
  if (u.includes('action=maps')) {
    return okJson({
      ok: true,
      maps: [{ id: 'canyon 3', name: 'Canyon 3' }, { id: 'twin hills', name: 'Twin Hills' }],
    });
  }
  if (u.includes('action=ping')) {
    return okJson({ ok: true, game: 'operation-tankity', rooms: { used: 3, max: 10 } });
  }
  if (u.includes('action=create')) {
    if (failMode === 'down') throw new Error('conn refused');
    if (failMode === 'page') return { ok: true, json: async () => { throw new Error('Unexpected token <'); } };
    if (failMode === 'stumble') return { ok: false, json: async () => { throw new Error('Unexpected token <'); } };
    if (failCreate) return { ok: false, json: async () => ({ error: failCreate }) };
    createdMap = body.map || '';
    return okJson({ ok: true, code: 'TST1', seat: 0, token: 'tok0', csrf: 'cs0' });
  }
  if (u.includes('action=map')) {
    createdMap = body.map || '';
    return okJson({ ok: true, room: lobbyRoom() });
  }
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
  if (u.includes('action=buy') || u.includes('action=next')) {
    return okJson({ ok: true, room: playRoom(curTurn, []) });
  }
  if (u.includes('action=join')) {
    return okJson({ ok: true, code: 'TST1', seat: 1, token: 'tok1', csrf: 'cs0' });
  }
  return okJson({ ok: true, scores: [] });
};
let NET_LOBBY = true;
let NET_SHOP = false;
let extraGuest = false;
function lobbyRoom() {
  const seats = extraGuest
    ? [scriptSeats()[0], { seat: 1, human: true, name: 'def', lives: 3, score: 0 }]
    : [scriptSeats()[0]];
  return Object.assign(
    { code: 'TST1', phase: 'lobby', seats, events: [] },
    mapFields(),
  );
}
// Freeze regression: ten minutes in a background tab must not backlog the
// music scheduler into scheduling thousands of catch-up notes at once.
function change(el) {
  for (const f of ((el._l || {}).change || [])) f();
}
(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  // ?code=zz99 was set before boot: the lobby opens with the code filled in
  await tick(10);
  check('invite-prefill', els['join-code'].value === 'ZZ99' && els['lobby-veil'].hidden === false,
    `${els['join-code'].value} | hidden=${els['lobby-veil'] && els['lobby-veil'].hidden}`);
  els['lobby-veil'].hidden = true;
  // The log trims old lines at its cap, so match only the last few lines and
  // check after every press instead of anchoring on an absolute index.
  const logTail = () => els['log'].children.slice(-4).map(li => li.textContent).join('\n');
  // Match the rack marker, never the log: interleaved battle lines and the
  // trim cap make absolute log positions lie about what is loaded now. The
  // marker must sit in the same rack segment, so a later gun cannot fake it.
  const selIs = name => new RegExp(name + ' [^·]*◀').test(els['hud-weapon'].textContent);
  const loadGun = name => {
    for (let i = 0; i < 6 && !selIs(name); i++) {
      TAP('global', 'cycle'); frames(3);
    }
  };
  const waitAim = async () => {
    let g = 0;
    while (g++ < 40 && !/YOU\. Aim!/.test(els['hud-turn'].textContent)) {
      await sleep(300); frames(10);
    }
  };
  // The battle may have cleared a round behind a preview veil; spend the
  // winnings and roll on so there is always a live aiming phase ahead. The
  // shop veil is ground truth: HUD text goes stale across round resets.
  const ensureAim = async () => {
    await waitAim();
    if (els['shop-veil'].hidden === false) {
      click(els['shop-next']);
      frames(120);
      await waitAim();
    }
  };
  // Demo battle first: the crew fires on its own, controls stay locked.
  frames(600);
  check('demo-fires', /fires Shell/.test(logText()));
  TAP('global', 'fire'); frames(3);
  check('demo-locked', /Demo mode/.test(logText()));
  const feudMark = els['log'].children.length;
  frames(7000);
  const feudNew = els['log'].children.slice(feudMark).map(li => li.textContent).join('\n');
  check('ai-feuds', /(reaper|wraith|spotter) hits (reaper|wraith|spotter)/.test(feudNew));
  // T deals random hills and O opens the lobby, both from the keyboard.
  TAP('global', 'rooms'); await tick(10);
  check('rooms-hotkey', els['lobby-veil'].hidden === false);
  TAP('global', 'escape');
  check('lobby-esc', els['lobby-veil'].hidden === true);
  TAP('global', 'random'); frames(120);
  check('random-hotkey', els['shop-veil'].hidden === false);
  els['seed-input'].value = 'scorch-01';
  // New Game rolls the fanfare and the Round 1 card, then the pre-match shop.
  // It also takes the whole frame: an open menu shuts instead of sitting
  // over the briefing and the shop that follows it.
  TAP('global', 'menu');
  check('menu-open-before-newgame', els['menu-overlay'].hidden === false);
  click(els['new-game']);
  check('new-game-closes-menu', els['menu-overlay'].hidden === true);
  check('newgame-banner', els['round-banner'].hidden === false && /Round 1/.test(els['round-banner-text'].textContent),
    els['round-banner-text'].textContent);
  // No wall-clock wait: the card runs on sim time, so frames alone finish it.
  // (This is the refocus-freeze regression in miniature.)
  frames(120);
  check('banner-done', els['round-banner'].hidden === true);
  const shopOpen = els['shop-veil'].hidden === false;
  const shopCash0 = els['shop-cash'].textContent;
  // ESC in the shop shuts panels before it ever rolls out: with the menu
  // open above the shop, ESC closes the menu and the shop stays open.
  TAP('global', 'menu');
  TAP('shop', 'close'); frames(3);
  check('shop-esc-closes-menu', els['menu-overlay'].hidden === true && els['shop-veil'].hidden === false);
  // Stock up: Buckshot ($80), Mortar ($200), Rail ($140) of the $600 stake.
  // (Each render appends, so read the last eight list items: two category
  // headers plus six rows. Each row holds an info div then an acts span.)
  const shopLis = () => els['shop-list'].children.slice(-8);
  const shopRows = () => shopLis().filter(li => li.children.length === 2);
  const rowName = li => li.children[0].children[0].textContent;
  const buyRow = label => {
    const row = shopRows().find(li => rowName(li).includes(label));
    const acts = row.children[1];
    click(acts.children[acts.children.length - 1]);
  };
  buyRow('Buckshot');
  // Categories group the shelf, and even the locked NUKE shows its damage.
  const catNames = shopLis().filter(li => li.className === 'shop-cat').map(li => li.textContent);
  const nukeRow = shopRows().find(li => rowName(li).includes('NUKE'));
  const nukeStats = nukeRow.children[0].children[1].textContent + ' ' + nukeRow.children[0].children[2].textContent;
  check('shop-cats', catNames.join('|') === 'Shells|Hull and fuel', catNames.join('|'));
  check('nuke-stats', /95 damage/.test(nukeStats) && /round 4/.test(nukeStats), nukeStats);
  // The arsenal file is a second source the game reads at boot: it must
  // parse, hold 20 items, and speak only effects and painters the code has.
  const arsenal = JSON.parse(fs.readFileSync(path.join(__dirname, 'weapons.json'), 'utf8'));
  check('arsenal-count', arsenal.ammo.length === 12 && arsenal.gear.length === 8,
    `ammo=${arsenal.ammo.length} gear=${arsenal.gear.length}`);
  const FX = ['shot', 'pellets', 'cluster', 'proximity', 'seeker', 'pierce', 'emp'];
  const PAINT = ['disc', 'beam', 'spark'];
  const TRICKS = ['repair', 'fuel', 'plate', 'shield', 'extralife', 'jammer', 'bunker', 'laststand'];
  check('arsenal-fx', arsenal.ammo.every(a => FX.includes(a.effect) && a.gfx && PAINT.includes(a.gfx.painter)
    && typeof a.dmg === 'number' && typeof a.radius === 'number' && typeof a.price === 'number'
    && typeof a.pack === 'number' && typeof a.minRound === 'number' && Array.isArray(a.gfx.blast)));
  check('arsenal-gear', arsenal.gear.every(g => TRICKS.includes(g.effect) && typeof g.price === 'number' && typeof g.n === 'number'));
  const cats = [];
  for (const r of arsenal.ammo.filter(a => a.pack > 0).concat(arsenal.gear)) {
    if (!cats.includes(r.cat)) cats.push(r.cat);
  }
  check('arsenal-cats', cats.join('|') === 'Shells|Hull and fuel|Tricks', cats.join('|'));
  for (const k of ['shell', 'buck', 'mortar', 'rail', 'nuke', 'repair', 'fuel']) {
    check('arsenal-keeps-' + k, arsenal.ammo.some(a => a.key === k) || arsenal.gear.some(g => g.key === k));
  }
  // Keyboard alone can shop: arrows highlight, Enter buys, digits buy outright.
  TAP('shop', 'selDown'); frames(3);
  check('shop-keys', shopRows()[1].className === 'sel', shopRows().map(li => li.className).join(','));
  check('shop-scroll-follows', globalThis.__scrolledTo && globalThis.__scrolledTo.className === 'sel',
    globalThis.__scrolledTo && globalThis.__scrolledTo.className);
  check('keys-file-drives', KEYS.shop.buy[0] === 'b' && KEYS.global.fire[0] === 'ControlLeft' && KEYS.aim.barrelLeft[0] === 'ArrowLeft' && KB('shop', 'buy')[0] === 'b',
    `${KEYS.shop.buy[0]}|${KEYS.global.fire[0]}|${KEYS.aim.barrelLeft[0]}`);
  {
    const ammoActs = shopRows().find(li => rowName(li).includes('Buckshot')).children[1].children;
    check('shop-btn-hints', ammoActs[0].children[1].textContent === '(V)' && ammoActs[1].children[1].textContent === '(B)',
      `${ammoActs[0].children[1].textContent}|${ammoActs[1].children[1].textContent}`);
  }
  TAP('shop', 'buy'); frames(3);
  TAPD('shop', 'buyRow', 3); frames(3);
  const shopCash1 = els['shop-cash'].textContent;
  // Bulk packs: Right raises the count, capped by the chest; B buys them all
  // and the count falls back to what is still affordable on every row.
  const buyBtn = li => { const acts = li.children[1]; return acts.children[acts.children.length - 1]; };
  for (let i = 0; i < 4; i++) { TAP('shop', 'selDown'); frames(3); }
  const fuelRow = () => shopRows().find(li => rowName(li).includes('Fuel'));
  TAP('shop', 'qtyUp'); frames(3);
  check('shop-qty-2', /×2 packs = \$120/.test(rowName(fuelRow())), rowName(fuelRow()));
  TAP('shop', 'qtyUp'); frames(3);
  TAP('shop', 'qtyUp'); frames(3); // $180 left after the three guns: three packs is all the chest covers
  check('shop-qty-cap', /×3 packs = \$180/.test(rowName(fuelRow())), rowName(fuelRow()));
  TAP('shop', 'buy'); frames(3);
  check('shop-bulk', /\$0\b/.test(els['shop-cash'].textContent), els['shop-cash'].textContent);
  check('shop-bulk-said', /Bought 3 × Fuel/.test(logTail()), logTail());
  check('shop-bulk-reset', !/×[2-9] packs/.test(rowName(fuelRow())), rowName(fuelRow()));
  const buckRow = () => shopRows().find(li => rowName(li).includes('Buckshot'));
  check('shop-bulk-disabled', buyBtn(fuelRow()).disabled === true && buyBtn(buckRow()).disabled === true,
    `fuel=${buyBtn(fuelRow()).disabled} buck=${buyBtn(buckRow()).disabled}`);
  for (let i = 0; i < 4; i++) { TAP('shop', 'selUp'); frames(3); }
  TAP('shop', 'preview'); frames(3);
  check('shop-preview-p', els['preview-veil'].hidden === false);
  TAP('shop', 'close'); frames(3);
  check('shop-preview-esc', els['preview-veil'].hidden === true && els['shop-veil'].hidden === false,
    `preview=${els['preview-veil'].hidden} shop=${els['shop-veil'].hidden}`);
  click(els['preview-close']); frames(3);
  check('shop-preview-shut', els['preview-veil'].hidden === true);
  TAPD('shop', 'buyRow', 4); frames(3);
  check('shop-locked', /round 4/.test(logTail()), logTail());
  click(els['shop-next']);
  frames(120); // round card runs on sim time before the shooting
  // round 1, player's opening turn
  const turn0 = els['hud-turn'].textContent;
  const angle0 = els['hud-angle'].textContent;
  const wind0 = els['hud-wind'].textContent;
  const armor0 = els['hud-armor'].textContent;
  check('shop-bulk-banked', els['hud-fuel'].textContent === '260', els['hud-fuel'].textContent);

  // Every demo lands its verdict with damage, never a clean miss.
  await ensureAim();
  // The keyboard drives: holding the drive key burns fuel (it used to set an
  // action name the drive code never read).
  const fuelBeforeDrive = Number(els['hud-fuel'].textContent);
  KD('aim', 'driveRight'); frames(30); KU('aim', 'driveRight'); frames(2);
  KD('aim', 'driveLeft'); frames(30); KU('aim', 'driveLeft'); frames(2);
  const fuelAfterDrive = Number(els['hud-fuel'].textContent);
  check('keyboard-drives', fuelAfterDrive < fuelBeforeDrive, `fuel ${fuelBeforeDrive} -> ${fuelAfterDrive}`);
  // Digits load favorite shells; Shift plus a digit pins the loaded one.
  TAPD('global', 'fav', 3); frames(3);
  check('fav-hotkey', /Mortar [^·]*◀/.test(els['hud-weapon'].textContent), els['hud-weapon'].textContent);
  TAPD('global', 'fav', 4); frames(3);
  KD('global', 'fav', 0, { shiftKey: true }); KU('global', 'fav', 0); frames(3);
  check('fav-assign', els['hud-favs'].textContent.startsWith('1 Rail'), els['hud-favs'].textContent);
  TAPD('global', 'fav', 2); frames(3);
  TAPD('global', 'fav', 1); frames(3);
  check('fav-recall', /Rail [^·]*◀/.test(els['hud-weapon'].textContent), els['hud-weapon'].textContent);
  loadGun('Rail');
  TAP('global', 'battlePreview'); frames(5);
  frames(300);
  TAP('global', 'battlePreview'); frames(5);
  const railVerdict = els['preview-result'].textContent;
  const railSel = els['hud-weapon'].textContent;
  check('rail-selected', /Rail [^·]*◀/.test(railSel), railSel);
  await ensureAim();
  loadGun('Mortar');
  TAP('global', 'battlePreview'); frames(5);
  frames(300);
  TAP('global', 'battlePreview'); frames(5);
  const mortarVerdict = els['preview-result'].textContent;
  const mortarSel = els['hud-weapon'].textContent;
  loadGun('Buckshot');
  check('rail-hits', /damage|hits/.test(railVerdict) && !/Clean miss/.test(railVerdict), railVerdict + ' | ' + railSel);
  check('mortar-selected', /Mortar [^·]*◀/.test(mortarSel), mortarSel);
  check('mortar-hits', /damage|hits/.test(mortarVerdict) && !/Clean miss/.test(mortarVerdict), mortarVerdict + ' | ' + mortarSel);

  // aim: Left/Right swing the barrel, Up/Down work power; hold then release
  KD('aim', 'barrelLeft');
  frames(30);
  KU('aim', 'barrelLeft');
  const angle1 = els['hud-angle'].textContent;
  const power0 = els['hud-power'].textContent;
  KD('aim', 'powerUp');
  frames(30);
  KU('aim', 'powerUp');
  const power1 = els['hud-power'].textContent;

  // Freeze regression probe (runs now, while it is still the player's aim
  // phase): defocus must not pause the match nor eat held keys.
  for (const f of listeners['blur'] || []) f();
  frames(10);
  const angleB = els['hud-angle'].textContent;
  KD('aim', 'barrelLeft');
  frames(10);
  KU('aim', 'barrelLeft');
  const angleC = els['hud-angle'].textContent;

  // Q -> Buckshot (1 in the rack); cycle right round to prove the NUKE stays
  // gated on round 1 while every affordable gun comes up.
  TAP('global', 'cycle'); frames(3);
  const qLog = logText();
  for (let i = 0; i < 4; i++) { TAP('global', 'cycle'); frames(3); }
  const cycleNames = [...logText().matchAll(/Loaded: (\w+)\./g)].map(m => m[1]);
  // Watch the canvas: blast discs must match their weapon radii exactly,
  // and the camera zoom must stay inside its sane range.
  const boomR = [];
  const zoomZ = [];
  let lastFill = '';
  // Drone aim arms: the only strokes drawn at alpha 0.75, width 2.
  const arms = [];
  let armAlpha = 1, armWidth = 1, armFrom = null;
  {
    const rec = new Proxy(function () {}, {
      get(t, p) {
        if (p === 'moveTo') return (x, y) => { armFrom = [x, y]; return rec; };
        if (p === 'lineTo') return (x, y) => {
          if (armAlpha === 0.75 && armWidth === 2 && armFrom) arms.push({ x0: armFrom[0], y0: armFrom[1], x1: x, y1: y });
          return rec;
        };
        if (p === 'arc') return (x, y, r) => { if (lastFill === '#ffb13c') boomR.push(r); };
        if (p === 'scale') return (x, y) => { zoomZ.push(x); };
        if (p === 'fillStyle') return lastFill;
        if (p === 'createLinearGradient') return () => ({ addColorStop() {} });
        return (...a) => rec;
      },
      set(t, p, v) {
        if (p === 'fillStyle') lastFill = v;
        if (p === 'globalAlpha') armAlpha = v;
        if (p === 'lineWidth') armWidth = v;
        return true;
      },
      apply() { return rec; },
    });
    els['stage'].getContext = () => rec;
  }
  // The firing-range preview gets its own disc recorder: the demo must show
  // the same exact-radius explosion the warhead would carve in the war.
  const pvBoomR = [];
  let pvLastFill = '';
  {
    const pvrec = new Proxy(function () {}, {
      get(t, p) {
        if (p === 'arc') return (x, y, r) => { if (pvLastFill === '#ffb13c') pvBoomR.push(r); };
        if (p === 'fillStyle') return pvLastFill;
        if (p === 'createLinearGradient') return () => ({ addColorStop() {} });
        return (...a) => pvrec;
      },
      set(t, p, v) { if (p === 'fillStyle') pvLastFill = v; return true; },
      apply() { return pvrec; },
    });
    els['preview-stage'].getContext = () => pvrec;
  }
  await ensureAim();
  loadGun('Buckshot');
  // Fire the spread: the turn must advance only after all three pellets land,
  // proving each resolves instead of the volley counting as one hit.
  const volleyTurn = els['hud-turn'].textContent;
  const volleyGun = els['hud-weapon'].textContent;
  // Match only lines said after the press: full-history matches exit on the
  // first frame and the pellets never land.
  const freshFrom = mark => els['log'].children.slice(mark).map(li => li.textContent).join('\n');
  let mark = els['log'].children.length;
  TAP('global', 'fire');
  let guard = 0;
  while (guard++ < 1500 && !/You fire Buckshot/.test(freshFrom(mark))) frames(10);
  const spreadLog = logText();
  guard = 0;
  mark = els['log'].children.length;
  while (guard++ < 4000 && !/(is aiming…|Your turn)/.test(freshFrom(mark))) frames(10);
  // A drone's turn: its aim arm must show, swing in small steps rather than
  // snapping, and stay within the power-scaled length (14..50). Step single
  // frames and keep the first unbroken run of arm frames. Fire first so the
  // battery gets its turn.
  {
    TAP('global', 'fire');
    const seen = [];
    for (let i = 0; i < 3000; i++) {
      arms.length = 0;
      frames(1);
      if (arms.length) seen.push(arms[arms.length - 1]);
      else if (seen.length) break;
    }
    const ang = seen.map(a => Math.atan2(a.y0 - a.y1, Math.abs(a.x1 - a.x0)) * 180 / Math.PI);
    const len = seen.map(a => Math.hypot(a.x1 - a.x0, a.y1 - a.y0));
    let maxStep = 0;
    for (let i = 1; i < ang.length; i++) maxStep = Math.max(maxStep, Math.abs(ang[i] - ang[i - 1]));
    check('drone-aim-arm-shows', seen.length >= 20, `frames=${seen.length}`);
    check('drone-aim-arm-glides', seen.length >= 20 && maxStep < 6, `max step=${maxStep.toFixed(2)}°`);
    check('drone-aim-arm-power-length', seen.length > 0 && len.every(l => l >= 13.9 && l <= 50.1),
      len.length ? `len ${Math.min(...len).toFixed(1)}..${Math.max(...len).toFixed(1)}` : 'none');
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
  const dlg = els['dlg-line'].textContent;

  check('preshop', shopOpen && /\$600/.test(shopCash0), shopCash0);
  check('shop-buy', /\$180/.test(shopCash1), shopCash1);
  check('boot-turn', /YOU/.test(turn0), turn0);
  check('boot-hud', /62°/.test(angle0) && wind0.length > 0 && /you 100/.test(armor0),
    `${angle0} | ${wind0} | ${armor0}`);
  // Firing range: V opens the demo with its damage stats, frames render it,
  // V closes it again. Roll into a live aiming phase with a Shell loaded so
  // the demo plays the same shell the rack shows, whatever phase came before.
  await ensureAim();
  loadGun('Shell');
  TAP('global', 'battlePreview'); frames(5);
  const pvTitle = els['preview-title'].textContent + ' | ' + els['preview-stats'].textContent;
  const pvOpen = els['preview-veil'].hidden === false;
  let pvDraws = 0;
  {
    const pvEl = els['preview-stage'];
    const orig = pvEl.getContext;
    pvEl.getContext = () => { pvDraws++; return orig(); };
  }
  frames(240); // ~4s: aim, fly, boom, verdict on the mini hill
  TAP('global', 'battlePreview'); frames(5);
  check('preview-open', pvOpen && /^Shell \| 34 damage · blast 26/.test(pvTitle),
    `${pvTitle} | turn=${els['hud-turn'].textContent} | ${els['hud-weapon'].textContent}`);
  check('preview-runs', pvDraws > 100, `frames=${pvDraws}`);
  check('preview-close', els['preview-veil'].hidden === true);
  // The Shell demo (26 radius) must paint its disc at exactly warhead size.
  const pvBoomMax = pvBoomR.length ? Math.max(...pvBoomR) : -1;
  const pvBoomOk = pvBoomR.length >= 3 && Math.abs(pvBoomMax - 26) < 1.5;
  check('preview-boom', pvBoomOk, `n=${pvBoomR.length} max=${pvBoomMax.toFixed(1)}`);
  check('aim-hold', angle1 !== angle0, `${angle0} -> ${angle1}`);
  check('power-hold', power1 !== power0, `${power0} -> ${power1}`);
  check('blur-no-pause', !/Paused\./.test(logText()) && angleB !== angleC, `${angleB} -> ${angleC}`);
  check('q-cycle', /Loaded: Buckshot/.test(qLog));
  check('nuke-gated', !cycleNames.includes('NUKE') && cycleNames.includes('Buckshot') && cycleNames.includes('Shell'),
    cycleNames.join(','));
  check('buckshot-volley', /You fire Buckshot/.test(spreadLog), `${volleyTurn} | ${volleyGun}`);
  // Discs start tiny and grow to exactly their weapon radius, never beyond.
  // (The battery answers with its own mortars, so 44 is a legal max too.)
  const boomMax = boomR.length ? Math.max(...boomR) : -1;
  const boomOk = boomR.length >= 3 &&
    Math.min(...[17, 26, 44].map(r => Math.abs(boomMax - r))) < 1.5;
  check('boom-exact', boomOk, `n=${boomR.length} max=${boomMax.toFixed(1)}`);
  check('camera-sane', zoomZ.length > 0 && zoomZ.every(z => z >= 0.45 && z <= 1),
    `n=${zoomZ.length}`);
  check('player-fired', /You fire/.test(firedLog));
  check('battery-answers', /(is aiming…|fires )/.test(midLog));
  check('dialogue-shown', dlg.length > 0, dlg);
  check('log-alive', els['log'].children.length > 5, `lines=${els['log'].children.length}`);
  // The stub only knows elements the game asked for; ask for the lobby ones.
  for (const id of ['host-initials', 'host-form', 'lobby-status', 'lobby-code',
    'lobby-room', 'lobby-seats', 'lobby-start']) void document.getElementById(id);
  // the hills picker fills from the server catalog, seeds never attached
  for (const id of ['rooms-open', 'lobby-map', 'lobby-hills', 'lobby-count']) {
    void document.getElementById(id);
  }
  click(els['rooms-open']); await tick(10);
  check('maps-catalog', els['lobby-map'].children.length === 3,
    `options=${els['lobby-map'].children.length}`);
  check('room-occupancy', els['lobby-count'].textContent === '3 / 10 rooms occupied',
    els['lobby-count'].textContent);
  check('room-dot-green', els['net-dot'].className.includes('on') && els['hud-server'].textContent === 'online',
    `${els['net-dot'].className} | ${els['hud-server'].textContent}`);
  // a full shelf says so in plain words, never a status code
  failCreate = 'every room is taken (10 / 10). Try again later.';
  els['host-initials'].value = 'abc';
  submit(els['host-form']); await tick(10);
  check('room-full', els['lobby-status'].textContent === failCreate,
    els['lobby-status'].textContent);
  failCreate = '';
  // transport trouble arrives in human words, never a status code
  for (const [mode, want] of [['down', 'Could not reach'], ['page', 'page instead of game data'], ['stumble', 'stumbled']]) {
    failMode = mode;
    els['host-initials'].value = 'abc';
    submit(els['host-form']); await tick(10);
    check('room-err-' + mode, els['lobby-status'].textContent.includes(want), els['lobby-status'].textContent);
    if (mode === 'down') {
      check('room-dot-red', els['net-dot'].className.includes('off') && els['hud-server'].textContent === 'offline',
        `${els['net-dot'].className} | ${els['hud-server'].textContent}`);
    }
  }
  failMode = '';
  // invalid + blocked initials never reach the server
  els['host-initials'].value = 'AB';
  submit(els['host-form']); await tick();
  const badShort = els['lobby-status'].textContent;
  els['host-initials'].value = 'ass';
  submit(els['host-form']); await tick();
  const badBlocked = els['lobby-status'].textContent;
  check('lobby-initials-gated', /3 letters/.test(badShort) && /3 letters/.test(badBlocked),
    `${badShort} | ${badBlocked}`);
  // host a room on picked hills: code shows, roster opens, hills named
  els['host-initials'].value = 'abc';
  els['lobby-map'].value = 'canyon 3';
  submit(els['host-form']); await tick(10);
  check('room-hosted', els['lobby-code'].textContent === 'TST1' && els['lobby-room'].hidden === false,
    els['lobby-code'].textContent);
  check('room-roster', els['lobby-seats'].children.length === 4,
    `rows=${els['lobby-seats'].children.length}`);
  check('room-hills', els['lobby-hills'].textContent === 'Hills: Canyon 3',
    els['lobby-hills'].textContent);
  // the host can swap back to a random draw before starting
  els['lobby-map'].value = '';
  change(els['lobby-map']); await tick(10);
  check('map-change', els['lobby-hills'].textContent === 'Hills: Random hills',
    els['lobby-hills'].textContent);
  // a guest joining shows both initials on the roster, never undefined
  extraGuest = true;
  void document.getElementById('join-code');
  void document.getElementById('join-initials');
  els['join-code'].value = 'TST1';
  els['join-initials'].value = 'def';
  submit(els['join-form']); await tick(10);
  const guestNames = els['lobby-seats'].children.map(li => li.textContent).join('|');
  check('guest-seat', /abc/.test(guestNames) && /def/.test(guestNames) && !/undefined/.test(guestNames),
    guestNames);
  // back to hosting so the match can start
  extraGuest = false;
  els['host-initials'].value = 'abc';
  submit(els['host-form']); await tick(10);
  // the invite link carries the room code, and copy hands it over
  void document.getElementById('join-link');
  void document.getElementById('copy-link');
  check('invite-link', els['join-link'].value === 'http://localhost:8000/operation-tankity/index.html?code=TST1',
    els['join-link'].value);
  click(els['copy-link']); await tick(10);
  check('invite-copy', global.__copied === els['join-link'].value, String(global.__copied));
  // single-use invite: the boot already consumed ?code=zz99 above
  global.location.search = '';
  // start: the hills render from the server snapshot, first turn is ours
  NET_LOBBY = false;
  click(els['lobby-start']); await tick(10);
  check('net-turn', /YOU/.test(els['hud-turn'].textContent), els['hud-turn'].textContent);
  check('net-hud', /Shell.*∞/.test(els['hud-weapon'].textContent) && /\$600/.test(els['hud-score'].textContent),
    els['hud-weapon'].textContent + ' | ' + els['hud-score'].textContent);
  // fire over the same public key as solo play; the server settles it
  sawFire = false;
  TAP('global', 'fire'); await tick(10);
  check('net-fire', sawFire, 'intent sent');
  frames(180); // the turn passes once the replay of the shot has played out
  check('net-turn-passes', /REAPER aiming/.test(els['hud-turn'].textContent), els['hud-turn'].textContent);
  // Between rounds the room shops; V opens the firing range, and it stays
  // open through the polls that keep the shop fresh.
  NET_SHOP = true;
  await sleep(1800); await tick(10);
  check('net-shop', els['shop-veil'].hidden === false, `shop hidden=${els['shop-veil'].hidden}`);
  TAP('shop', 'preview'); await tick(5);
  const pvOpened = els['preview-veil'].hidden === false;
  await sleep(3400); await tick(10);
  check('net-preview-stays', pvOpened && els['preview-veil'].hidden === false,
    `opened=${pvOpened} open-after-polls=${els['preview-veil'].hidden === false}`);
  TAP('global', 'escape'); await tick(5);
  NET_SHOP = false;
  await sleep(1800); await tick(10);
  // typing in a box is typing, not playing
  const logLen = els['log'].children.length;
  for (const f of listeners['keydown'] || []) {
    f({ key: 'q', code: 'KeyQ', target: { tagName: 'INPUT' }, preventDefault: () => {}, repeat: false });
    f({ key: 'a', code: 'KeyA', target: { tagName: 'INPUT' }, preventDefault: () => {}, repeat: false });
  }
  frames(5);
  check('input-guard', els['log'].children.length === logLen, `lines=${els['log'].children.length}`);
  // A suspended context (fresh refresh, no gesture yet) schedules nothing;
  // the first ticks after resume play instead of sitting silent.
  click(els['btn-music']); click(els['btn-music']); // end unmuted with a fresh scheduler
  globalThis.__acState = 'suspended';
  const notesCalm = FAKE_STATS.notes;
  AC_TIME.t += 5;
  await new Promise(r => setTimeout(r, 200));
  check('music-idles-suspended', FAKE_STATS.notes === notesCalm, `scheduled=${FAKE_STATS.notes - notesCalm}`);
  globalThis.__acState = 'running';
  AC_TIME.t += 0.3;
  await new Promise(r => setTimeout(r, 200));
  check('music-resumes', FAKE_STATS.notes > notesCalm, `scheduled=${FAKE_STATS.notes - notesCalm}`);
  // The watchdog must never churn the timer: with a stale tick and steady
  // frames, steps still fire the moment the context runs again.
  click(els['btn-music']); click(els['btn-music']); // end unmuted with a fresh scheduler
  globalThis.__acState = 'suspended';
  const stale0 = Date.now();
  while (Date.now() - stale0 < 1700) { frames(5); AC_TIME.t += 0.08; await new Promise(r => setTimeout(r, 25)); }
  globalThis.__acState = 'running';
  AC_TIME.t += 0.3;
  const rec0 = FAKE_STATS.notes;
  const recT = Date.now();
  while (Date.now() - recT < 600) { frames(5); AC_TIME.t += 0.08; await new Promise(r => setTimeout(r, 25)); }
  check('music-after-watchdog', FAKE_STATS.notes > rec0, `scheduled=${FAKE_STATS.notes - rec0}`);
  const preJump = FAKE_STATS.notes;
  AC_TIME.t += 600;
  await new Promise(r => setTimeout(r, 400));
  check('no-audio-backlog', FAKE_STATS.notes - preJump < 300, `scheduled=${FAKE_STATS.notes - preJump}`);
  // Tutorial replay from a live battle: leave the room the net tests
  // started, shut the lobby, deal in, walk out of the shop, wait out any
  // banner, then U coaches and Skip hides and remembers.
  click(els['again']); await tick(10); frames(5);
  TAP('global', 'escape'); frames(5);
  TAP('global', 'new'); frames(150);
  for (let i = 0; i < 6 && (els['shop-veil'].hidden === false || els['round-banner'].hidden === false); i++) {
    if (els['shop-veil'].hidden === false) click(els['shop-next']);
    frames(60);
  }
  TAP('global', 'tutorial'); frames(5);
  check('tutorial-opens', els['tutorial-overlay'].hidden === false);
  check('tutorial-step', /Move 1 of 5/.test(els['tutorial-text'].textContent), els['tutorial-text'].textContent);
  click(els['tutorial-skip']); frames(3);
  check('tutorial-skips', els['tutorial-overlay'].hidden === true);
  check('tutorial-remembered', window.localStorage.getItem('tankity-tutorial') === 'done');
  if (errors.length) { console.error('SMOKE-FAILED: ' + errors.join(',')); process.exit(1); }
  console.log('SMOKE-OK turn=' + els['hud-turn'].textContent + ' score=' + els['hud-score'].textContent);
  process.exit(0);
})();
