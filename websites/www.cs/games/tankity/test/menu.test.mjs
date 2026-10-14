// The settings-only menu: seed with Play this seed, unit, text size,
// Difficulty, sound, music, fullscreen, scores, and Leave room in a room;
// nothing that starts a different kind of game.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { document, makeEl, click, submit, fire } from '../../_kit/test/dom-stub.mjs';
import { importTsx } from '../../_kit/test/tsx.ts';

globalThis.document = document;
const { menu } = await importTsx(import.meta.dirname, { menu: '../src/ui/menu.tsx' });
const walk = (el, out = []) => { for (const c of el.children || []) { out.push(c); walk(c, out); } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);
const KEYS = { 'global:new': 'N', 'global:sound': 'E', 'global:music': 'M', 'global:fullscreen': 'F', 'global:report': 'R' };
const UNITS = [{ key: 'tank', name: 'Tank' }, { key: 'hover', name: 'Hover' }, { key: 'walker', name: 'Walker' }, { key: 'buggy', name: 'Buggy' }];
const SIZES = [{ key: 's', name: 'Small', scale: 0.9 }, { key: 'm', name: 'Normal', scale: 1 }, { key: 'l', name: 'Large', scale: 1.15 }, { key: 'xl', name: 'Huge', scale: 1.3 }];
const LEVELS = [{ key: 'easy', name: 'Easy' }, { key: 'normal', name: 'Normal' }, { key: 'hard', name: 'Hard' }];

function draw(over = {}) {
  const section = makeEl('menu-overlay');
  section.hidden = false;
  const calls = { close: 0, playSeed: 0, submit: 0, unit: [], size: [], difficulty: [], sound: 0, music: 0, fs: 0, scores: 0, leave: 0 };
  const props = {
    keyHint: (c, a) => KEYS[`${c}:${a}`] ?? '', onClose: () => { calls.close++; },
    onPlaySeed: () => { calls.playSeed++; }, onSubmit: () => { calls.submit++; },
    units: UNITS, unit: 'tank', drawUnit() {}, onPickUnit: k => calls.unit.push(k),
    sizes: SIZES, size: 'm', onPickSize: k => calls.size.push(k),
    difficulties: LEVELS, difficulty: 'normal', onPickDifficulty: k => calls.difficulty.push(k),
    sound: true, music: true, fullscreen: false,
    onSound: () => { calls.sound++; }, onMusic: () => { calls.music++; }, onFullscreen: () => { calls.fs++; },
    onScores: () => { calls.scores++; }, inRoom: false, onLeave: () => { calls.leave++; }, ...over,
  };
  menu.renderMenu(section, props);
  return { section, calls, props };
}

test('the menu is titled Settings and offers no other kind of game', () => {
  const { section } = draw();
  assert.equal(byId(section, 'menu-h').textContent, 'Settings');
  for (const gone of ['random-run', 'rooms-open', 'tutorial-open']) assert.equal(byId(section, gone), undefined, gone);
});

test('Play this seed and Enter in the seed box both report', () => {
  const { section, calls } = draw();
  const play = byId(section, 'new-game');
  assert.equal(play.textContent, 'Play this seed N');
  click(play);
  submit(byId(section, 'seed-form'));
  assert.deepEqual([calls.playSeed, calls.submit], [1, 1]);
});

test('unit, text size, the toggles and Scores report; Leave room shows only in a room', () => {
  const { section, calls, props } = draw();
  click(byId(section, 'unit-picker').children[2]);
  click(byId(section, 'text-picker').children[3]);
  for (const id of ['btn-sound', 'btn-music', 'fullscreen', 'scores-open']) click(byId(section, id));
  assert.deepEqual(calls.unit, ['walker']);
  assert.deepEqual(calls.size, ['xl']);
  assert.deepEqual([calls.sound, calls.music, calls.fs, calls.scores], [1, 1, 1, 1]);
  assert.equal(byId(section, 'menu-leave').hidden, true);
  menu.renderMenu(section, { ...props, inRoom: true });
  click(byId(section, 'menu-leave'));
  assert.equal(byId(section, 'menu-leave').hidden, false);
  assert.equal(calls.leave, 1);
});

test('Difficulty stays a setting: three choices, the saved one pressed, a click reports it', () => {
  const { section, calls } = draw();
  const tiles = byId(section, 'difficulty-picker').children;
  assert.deepEqual(tiles.map(t => t.textContent), ['Easy', 'Normal', 'Hard']);
  assert.deepEqual(tiles.map(t => t.getAttribute('aria-pressed')), ['false', 'true', 'false']);
  assert.equal(byId(section, 'difficulty-label').textContent, 'Difficulty');
  assert.match(byId(section, 'difficulty-hint').textContent, /next match/);
  click(tiles[2]);
  assert.deepEqual(calls.difficulty, ['hard']);
});

test('the seed box keeps what was typed across a redraw, and the scroll stays put', () => {
  const { section, props } = draw();
  const seed = byId(section, 'seed-input');
  seed.value = 'bam-bam-01';
  section.scrollTop = 90;
  fire(section, 'scroll');
  section.scrollTop = 0;
  menu.renderMenu(section, { ...props, size: 'l' });
  assert.equal(byId(section, 'seed-input'), seed);
  assert.equal(seed.value, 'bam-bam-01');
  assert.equal(section.scrollTop, 90);
});

test('the close button reports, and the toggles and thumbnails follow the props', () => {
  const drawn = [];
  const { section, calls, props } = draw({ drawUnit: (cv, key) => drawn.push(key) });
  click(byId(section, 'menu-close'));
  assert.equal(calls.close, 1);
  assert.deepEqual(drawn, ['tank', 'hover', 'walker', 'buggy']);
  const toggles = ['btn-sound', 'btn-music', 'fullscreen'].map(id => byId(section, id));
  assert.deepEqual(toggles.map(t => t.getAttribute('aria-pressed')), ['true', 'true', 'false']);
  assert.deepEqual(toggles.map(t => t.textContent), ['Sound E', 'Music M', 'Fullscreen F']);
  menu.renderMenu(section, { ...props, sound: false, fullscreen: true });
  assert.deepEqual(toggles.map(t => t.getAttribute('aria-pressed')), ['false', 'true', 'true']);
  assert.deepEqual(drawn, ['tank', 'hover', 'walker', 'buggy']); // thumbnails are drawn once
});

test('the pickers mark the chosen tile; text sizes label and grow', () => {
  const { section } = draw();
  const units = byId(section, 'unit-picker').children;
  assert.deepEqual(units.map(t => t.getAttribute('aria-pressed')), ['true', 'false', 'false', 'false']);
  const sizes = byId(section, 'text-picker').children;
  assert.deepEqual(sizes.map(t => t.getAttribute('aria-pressed')), ['false', 'true', 'false', 'false']);
  assert.equal(sizes[0].getAttribute('title'), 'Small text');
  assert.notEqual(sizes[3].children[0].style.fontSize, sizes[0].children[0].style.fontSize);
});

test('key labels follow the table, and no key means no cap', () => {
  const { section, props } = draw();
  menu.renderMenu(section, { ...props, keyHint: (c, a) => (KEYS[`${c}:${a}`] ?? '').toLowerCase() });
  assert.equal(byId(section, 'new-game').textContent, 'Play this seed n');
  const bare = makeEl('menu-touch');
  menu.renderMenu(bare, { ...props, keyHint: () => '' });
  assert.equal(byId(bare, 'new-game').textContent, 'Play this seed ');
});

test('phones get Next song, Radio and Help in the menu, each saying whether its panel is open', () => {
  const calls = { song: 0, radio: 0, help: 0 };
  const { section } = draw({
    onNextSong: () => { calls.song++; }, onRadio: () => { calls.radio++; }, onHelp: () => { calls.help++; },
    radioOpen: false, helpOpen: true,
  });
  const extras = walk(section).find(n => String(n.className || '').split(' ').includes('phone-extras'));
  assert.ok(extras);
  for (const id of ['menu-track', 'menu-radio', 'menu-help']) click(byId(extras, id));
  assert.deepEqual(calls, { song: 1, radio: 1, help: 1 });
  assert.equal(byId(section, 'menu-radio').getAttribute('aria-expanded'), 'false');
  assert.equal(byId(section, 'menu-help').getAttribute('aria-expanded'), 'true');
});

test('Quit is always in the menu and reports a press', () => {
  let quits = 0;
  const { section } = draw({ onQuit: () => { quits++; } });
  const quit = byId(section, 'menu-quit');
  assert.equal(quit.localName, 'button');
  assert.equal(quit.textContent, 'Quit');
  assert.equal(quit.className, 'btn-leave');
  click(quit);
  assert.equal(quits, 1);
});

test('Standings shows only in a room and reports a press', () => {
  let shown = 0;
  const { section, props } = draw({ onStandings: () => { shown++; } });
  assert.equal(byId(section, 'menu-standings').hidden, true);
  menu.renderMenu(section, { ...props, inRoom: true });
  const standings = byId(section, 'menu-standings');
  assert.equal(standings.hidden, false);
  assert.equal(standings.textContent, 'Standings');
  click(standings);
  assert.equal(shown, 1);
});

test('in a room the host gets the turn-time slider and everyone else its label; outside a room neither', () => {
  const host = draw({ inRoom: true, turn: { secs: 600, host: true }, onTurn: () => {} });
  const turns = [];
  const h = draw({ inRoom: true, turn: { secs: 600, host: true }, onTurn: s => turns.push(s) });
  const range = byId(h.section, 'menu-turn');
  assert.equal(range.getAttribute('type'), 'range');
  range.value = '4';
  fire(range, 'input');
  assert.deepEqual(turns, [28800]);
  assert.ok(byId(host.section, 'menu-turn'));
  const guest = draw({ inRoom: true, turn: { secs: 600, host: false }, onTurn: () => {} });
  assert.equal(byId(guest.section, 'menu-turn'), undefined);
  assert.equal(byId(guest.section, 'menu-turn-label').textContent, 'Turn time: 10 min');
  const solo = draw({ inRoom: false, turn: null, onTurn: () => {} });
  assert.equal(byId(solo.section, 'menu-turn'), undefined);
  assert.equal(byId(solo.section, 'menu-turn-label'), undefined);
});

test('Quit says the room seat waits when in a room', () => {
  const room = draw({ inRoom: true, turn: { secs: 120, host: false }, onTurn() {} });
  assert.match(byId(room.section, 'menu-quit').getAttribute('title'), /your room seat waits/);
  const solo = draw({ inRoom: false });
  assert.equal(byId(solo.section, 'menu-quit').getAttribute('title'), 'End this match and leave the game');
});

test('in a room the menu has the Turn alerts button', () => {
  let n = 0;
  const { section } = draw({ inRoom: true, turn: { secs: 120, host: true }, onTurn() {}, alerts: { state: 'off', onClick: () => { n++; } } });
  const btn = byId(section, 'menu-alerts');
  assert.equal(btn.textContent, 'Turn alerts: off');
  click(btn);
  assert.equal(n, 1);
  assert.equal(byId(draw({ inRoom: false, alerts: { state: 'off', onClick() {} } }).section, 'menu-alerts'), undefined);
});

test('Enter in the seed box during a room match asks the leave question, never leaves outright', async () => {
  const { menuMod } = await importTsx(import.meta.dirname, { menuMod: '../src/menu.ts' });
  const section = makeEl('menu-overlay');
  const calls = { leave: 0, ask: 0, fresh: 0 };
  const m = menuMod.createMenu({
    G: { body: 'tank', tanks: [] }, $: id => (id === 'menu-overlay' ? section : null),
    net: { on: true, sendBody() {}, turnSecs: 120, isHost: false },
    sfx: { play() {} }, difficulty: { get: () => 'normal', set() {} }, unlock() {}, isSoundMuted: () => false, isMusicMuted: () => false,
    keyHint: () => '', myTank: () => null, netLeave: () => { calls.leave++; }, openLeaveVeil: () => { calls.ask++; },
    placeLogBelowStatus() {}, freshMatchFromSeedBox: () => { calls.fresh++; }, toggleFullscreen() {}, quit() {}, openStandings() {},
    turnTime() {}, alerts: () => ({ state: 'off', onClick() {} }), toggleMusic() {}, toggleOverlay() {}, toggleSound() {}, nextSong() {},
  });
  m.renderMenu();
  submit(byId(section, 'seed-form'));
  assert.deepEqual(calls, { leave: 0, ask: 1, fresh: 0 });
});
