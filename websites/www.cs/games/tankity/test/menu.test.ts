// The settings-only menu: seed with Play this seed, unit, text size,
// Difficulty, sound, music, fullscreen, scores, and Leave room in a room;
// nothing that starts a different kind of game.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asElement, byId, click, elementOf, fire, installDocument, makeEl, maybeById, submit, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import type { MenuProps } from '../src/ui/menu.tsx';

installDocument();
const { menu } = await importTsx<{ menu: typeof import('../src/ui/menu.tsx') }>(import.meta.dirname, { menu: '../src/ui/menu.tsx' });

/** Item `i` of a list the case reads, which must be there. */
function nth<T>(list: readonly T[], i: number): T {
  const v = list[i];
  assert.ok(v !== undefined, `no item ${i} of ${list.length}`);
  return v;
}
/** An element's children, all of which the case knows are elements. */
const kids = (el: StubElement): StubElement[] => el.children.map(c => elementOf(c));
const kid = (el: StubElement, i: number): StubElement => nth(kids(el), i);
const render = (section: StubElement, props: MenuProps) => menu.renderMenu(asElement(section), props);
// walk, byId and maybeById are the stub's: elements only, which is all an id or class can match.
const KEYS: Record<string, string> = { 'global:new': 'N', 'global:sound': 'E', 'global:music': 'M', 'global:fullscreen': 'F', 'global:report': 'R' };
const UNITS = [{ key: 'tank', name: 'Tank' }, { key: 'hover', name: 'Hover' }, { key: 'walker', name: 'Walker' }, { key: 'buggy', name: 'Buggy' }];
const SIZES = [{ key: 's', name: 'Small', scale: 0.9 }, { key: 'm', name: 'Normal', scale: 1 }, { key: 'l', name: 'Large', scale: 1.15 }, { key: 'xl', name: 'Huge', scale: 1.3 }];
const LEVELS = [{ key: 'easy', name: 'Easy' }, { key: 'normal', name: 'Normal' }, { key: 'hard', name: 'Hard' }];

/** The props every case starts from. The extras (flashes, standings, quit and the phone row) are left out on
 *  purpose, so a case that reads one passes it; the partial literal is cast whole in `draw`. */
type Extras = 'flashes' | 'onFlashes' | 'onStandings' | 'onQuit' | 'onNextSong' | 'onRadio' | 'onHelp' | 'radioOpen' | 'helpOpen';

function draw(over: Partial<MenuProps> = {}) {
  const section = makeEl('menu-overlay');
  section.hidden = false;
  const calls = { close: 0, playSeed: 0, submit: 0, unit: [] as string[], size: [] as string[], difficulty: [] as string[], sound: 0, music: 0, fs: 0, scores: 0, leave: 0 };
  const base: Omit<MenuProps, Extras> = {
    keyHint: (c, a) => KEYS[`${c}:${a}`] ?? '', onClose: () => { calls.close++; },
    onPlaySeed: () => { calls.playSeed++; }, onSubmit: () => { calls.submit++; },
    units: UNITS, unit: 'tank', drawUnit() {}, onPickUnit: k => { calls.unit.push(k); },
    sizes: SIZES, size: 'm', onPickSize: k => { calls.size.push(k); },
    difficulties: LEVELS, difficulty: 'normal', onPickDifficulty: k => { calls.difficulty.push(k); },
    sound: true, music: true, fullscreen: false,
    onSound: () => { calls.sound++; }, onMusic: () => { calls.music++; }, onFullscreen: () => { calls.fs++; },
    onScores: () => { calls.scores++; }, inRoom: false, onLeave: () => { calls.leave++; },
  };
  const props = { ...base, ...over } as MenuProps;
  render(section, props);
  return { section, calls, props };
}

test('the menu is titled Settings and offers no other kind of game', () => {
  const { section } = draw();
  assert.equal(byId(section, 'menu-h').textContent, 'Settings');
  for (const gone of ['random-run', 'rooms-open', 'tutorial-open']) assert.equal(maybeById(section, gone), undefined, gone);
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
  click(kid(byId(section, 'unit-picker'), 2));
  click(kid(byId(section, 'text-picker'), 3));
  for (const id of ['btn-sound', 'btn-music', 'fullscreen', 'scores-open']) click(byId(section, id));
  assert.deepEqual(calls.unit, ['walker']);
  assert.deepEqual(calls.size, ['xl']);
  assert.deepEqual([calls.sound, calls.music, calls.fs, calls.scores], [1, 1, 1, 1]);
  assert.equal(byId(section, 'menu-leave').hidden, true);
  render(section, { ...props, inRoom: true });
  click(byId(section, 'menu-leave'));
  assert.equal(byId(section, 'menu-leave').hidden, false);
  assert.equal(calls.leave, 1);
});

test('Difficulty stays a setting: three choices, the saved one pressed, a click reports it', () => {
  const { section, calls } = draw();
  const tiles = kids(byId(section, 'difficulty-picker'));
  assert.deepEqual(tiles.map(t => t.textContent), ['Easy', 'Normal', 'Hard']);
  assert.deepEqual(tiles.map(t => t.getAttribute('aria-pressed')), ['false', 'true', 'false']);
  assert.equal(byId(section, 'difficulty-label').textContent, 'Difficulty');
  assert.match(byId(section, 'difficulty-hint').textContent, /next match/);
  click(nth(tiles, 2));
  assert.deepEqual(calls.difficulty, ['hard']);
});

test('the seed box keeps what was typed across a redraw, and the scroll stays put', () => {
  const { section, props } = draw();
  const seed = byId(section, 'seed-input');
  seed.value = 'bam-bam-01';
  section.scrollTop = 90;
  fire(section, 'scroll');
  section.scrollTop = 0;
  render(section, { ...props, size: 'l' });
  assert.equal(byId(section, 'seed-input'), seed);
  assert.equal(seed.value, 'bam-bam-01');
  assert.equal(section.scrollTop, 90);
});

test('the close button reports, and the toggles and thumbnails follow the props', () => {
  const drawn: string[] = [];
  const { section, calls, props } = draw({ drawUnit: (_cv, key) => { drawn.push(key); } });
  click(byId(section, 'menu-close'));
  assert.equal(calls.close, 1);
  assert.deepEqual(drawn, ['tank', 'hover', 'walker', 'buggy']);
  const toggles = ['btn-sound', 'btn-music', 'fullscreen'].map(id => byId(section, id));
  assert.deepEqual(toggles.map(t => t.getAttribute('aria-pressed')), ['true', 'true', 'false']);
  assert.deepEqual(toggles.map(t => t.textContent), ['Sound E', 'Music M', 'Fullscreen F']);
  render(section, { ...props, sound: false, fullscreen: true });
  assert.deepEqual(toggles.map(t => t.getAttribute('aria-pressed')), ['false', 'true', 'true']);
  assert.deepEqual(drawn, ['tank', 'hover', 'walker', 'buggy']); // thumbnails are drawn once
});

test('the pickers mark the chosen tile; text sizes label and grow', () => {
  const { section } = draw();
  const units = kids(byId(section, 'unit-picker'));
  assert.deepEqual(units.map(t => t.getAttribute('aria-pressed')), ['true', 'false', 'false', 'false']);
  const sizes = kids(byId(section, 'text-picker'));
  assert.deepEqual(sizes.map(t => t.getAttribute('aria-pressed')), ['false', 'true', 'false', 'false']);
  assert.equal(nth(sizes, 0).getAttribute('title'), 'Small text');
  assert.notEqual(kid(nth(sizes, 3), 0).style.fontSize, kid(nth(sizes, 0), 0).style.fontSize);
});

test('key labels follow the table, and no key means no cap', () => {
  const { section, props } = draw();
  render(section, { ...props, keyHint: (c, a) => (KEYS[`${c}:${a}`] ?? '').toLowerCase() });
  assert.equal(byId(section, 'new-game').textContent, 'Play this seed n');
  const bare = makeEl('menu-touch');
  render(bare, { ...props, keyHint: () => '' });
  assert.equal(byId(bare, 'new-game').textContent, 'Play this seed ');
});

test('phones get Next song, Radio and Help in the menu, each saying whether its panel is open', () => {
  const calls = { song: 0, radio: 0, help: 0 };
  const { section } = draw({
    onNextSong: () => { calls.song++; }, onRadio: () => { calls.radio++; }, onHelp: () => { calls.help++; },
    radioOpen: false, helpOpen: true,
  });
  const extras = walk(section).find(n => String(n.className || '').split(' ').includes('phone-extras'));
  assert.ok(extras, 'the phone row');
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
  render(section, { ...props, inRoom: true });
  const standings = byId(section, 'menu-standings');
  assert.equal(standings.hidden, false);
  assert.equal(standings.textContent, 'Standings');
  click(standings);
  assert.equal(shown, 1);
});

test('in a room the host gets the turn-time slider and everyone else its label; outside a room neither', () => {
  const host = draw({ inRoom: true, turn: { secs: 600, host: true }, onTurn: () => {} });
  const turns: number[] = [];
  const h = draw({ inRoom: true, turn: { secs: 600, host: true }, onTurn: s => turns.push(s) });
  const range = byId(h.section, 'menu-turn');
  assert.equal(range.getAttribute('type'), 'range');
  range.value = '4';
  fire(range, 'input');
  assert.deepEqual(turns, [28800]);
  assert.ok(byId(host.section, 'menu-turn'));
  const guest = draw({ inRoom: true, turn: { secs: 600, host: false }, onTurn: () => {} });
  assert.equal(maybeById(guest.section, 'menu-turn'), undefined);
  assert.equal(byId(guest.section, 'menu-turn-label').textContent, 'Turn time: 10 min');
  const solo = draw({ inRoom: false, turn: null, onTurn: () => {} });
  assert.equal(maybeById(solo.section, 'menu-turn'), undefined);
  assert.equal(maybeById(solo.section, 'menu-turn-label'), undefined);
});

test('Quit says the room seat waits when in a room', () => {
  const room = draw({ inRoom: true, turn: { secs: 120, host: false }, onTurn() {} });
  const title = byId(room.section, 'menu-quit').getAttribute('title');
  assert.ok(title, 'Quit has a title');
  assert.match(title, /your room seat waits/);
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
  assert.equal(maybeById(draw({ inRoom: false, alerts: { state: 'off', onClick() {} } }).section, 'menu-alerts'), undefined);
});

test('Enter in the seed box during a room match asks the leave question, never leaves outright', async () => {
  const { menuMod } = await importTsx<{ menuMod: typeof import('../src/menu.ts') }>(import.meta.dirname, { menuMod: '../src/menu.ts' });
  const section = makeEl('menu-overlay');
  const calls = { ask: 0, fresh: 0 };
  const m = menuMod.createMenu({
    G: { body: 'tank', tanks: [] }, $: id => (id === 'menu-overlay' ? asElement(section) as HTMLElement : null),
    net: { on: true, sendBody() {}, turnSecs: 120, isHost: false },
    sfx: { play() {} }, difficulty: { get: () => 'normal', set() {} }, unlock() {}, isSoundMuted: () => false, isMusicMuted: () => false,
    keyHint: () => '', myTank: () => null, openLeaveVeil: () => { calls.ask++; },
    placeLogBelowStatus() {}, freshMatchFromSeedBox: () => { calls.fresh++; }, toggleFullscreen() {}, quit() {}, openStandings() {},
    turnTime() {}, alerts: () => ({ state: 'off', onClick() {} }), setFlashes() {}, toggleMusic() {}, toggleOverlay() {}, toggleSound() {}, nextSong() {},
  });
  m.renderMenu();
  submit(byId(section, 'seed-form'));
  assert.deepEqual(calls, { ask: 1, fresh: 0 });
});

test('Flashes is an Options toggle: on by default, pressed follows the prop, a click reports', () => {
  let flips = 0;
  const { section, props } = draw({ flashes: true, onFlashes: () => { flips++; } });
  const t = byId(section, 'btn-flashes');
  assert.ok(byId(section, 'toggle-picker').children.includes(t), 'sits with Sound, Music and Fullscreen');
  assert.equal(t.getAttribute('aria-pressed'), 'true');
  assert.equal(t.textContent, 'Flashes');
  assert.match(t.getAttribute('title') ?? '', /full-screen flashes/);
  click(t);
  assert.equal(flips, 1);
  render(section, { ...props, flashes: false });
  assert.equal(byId(section, 'btn-flashes').getAttribute('aria-pressed'), 'false');
});
