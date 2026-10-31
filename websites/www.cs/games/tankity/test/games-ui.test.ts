// Your games (src/ui/games.tsx), the turn toasts (src/ui/toast.tsx) and where
// the list shows (the title card, the rooms lobby), in the Node DOM stub.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asElement, byId, click, installDocument, makeEl, maybeById, walk } from '../../_kit/test/dom-stub.ts';
import type { StubElement } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import type { LiveRow } from '../src/games.ts';
import type { AlertsState, GamesView, YourGamesProps } from '../src/ui/games.tsx';
import type { TitleProps } from '../src/ui/title.tsx';
import { nth } from '../../_kit/test/nth.ts';

installDocument();
const { games, toast, title } = await importTsx<{
  games: typeof import('../src/ui/games.tsx');
  toast: typeof import('../src/ui/toast.tsx');
  title: typeof import('../src/ui/title.tsx');
}>(import.meta.dirname, {
  games: '../src/ui/games.tsx', toast: '../src/ui/toast.tsx', title: '../src/ui/title.tsx',
});

// walk, byId and maybeById are the stub's: elements only, which is all an id or tag can match.
const byTag = (el: StubElement, tag: string) => walk(el).filter(n => n.localName === tag);

const row = (code: string, over: Partial<LiveRow> = {}): LiveRow => ({
  code, gone: false, seat: 1, phase: 'play', round: 3, turnSecs: 28800, turn: 0, yourTurn: false, turnKey: null,
  turnLeft: null, shopLeft: null, players: ['ABC', 'ZED'], hostSeat: 0, turnName: 'ABC', expiresAt: 1, closesIn: 50_000, ...over,
});
const ROWS = [
  row('7K2Q', { yourTurn: true, turnKey: '3:1:0', turn: 1, turnLeft: 28799 }),
  row('AB3D'),
  row('SH0P', { phase: 'shop', turn: null, shopLeft: 500 }),
  row('L0BY', { phase: 'lobby', round: 0, turn: null }),
  row('0VER', { phase: 'over', turn: null }),
  row('SOON', { yourTurn: true, turnKey: '1:1:0', turn: 1, turnLeft: 80000, closesIn: 540 }),
  row('DRON', { turn: 2, turnName: 'REAPER' }),
];
function draw(over: Partial<YourGamesProps> = {}) {
  const box = makeEl('box');
  const calls: { open: string[]; alerts: number } = { open: [], alerts: 0 };
  games.renderYourGames(asElement(box), {
    id: 'your-games', rows: ROWS, alerts: 'off', age: 0,
    onOpen: c => { calls.open.push(c); }, onAlerts: () => { calls.alerts++; }, ...over,
  });
  return { box, calls };
}

test('one row per room, saying where it stands, each with Open', () => {
  const { box, calls } = draw();
  const list = byId(box, 'your-games');
  const items = byTag(list, 'li');
  assert.equal(items.length, ROWS.length);
  const texts = items.map(li => li.textContent);
  assert.match(nth(texts, 0), /^7K2Q · ABC, ZED · Round 3 · Your turn, 7h 59m left/);
  assert.match(nth(texts, 1), /AB3D · ABC, ZED · Round 3 · ABC's turn/);
  assert.match(nth(texts, 2), /Shop open/);
  assert.match(nth(texts, 3), /^L0BY · ABC, ZED · Waiting in the lobby/);
  assert.match(nth(texts, 4), /Match over/);
  // A room that closes before the turn ends says so.
  assert.match(nth(texts, 5), /Your turn · room closes in 9:00 unless someone plays/);
  assert.match(nth(texts, 6), /REAPER's turn/);
  const open = byTag(nth(items, 0), 'button').find(b => /Open/.test(b.textContent));
  assert.ok(open, 'the first row has an Open button');
  assert.equal(open.getAttribute('aria-label'), 'Open room 7K2Q');
  click(open);
  assert.deepEqual(calls.open, ['7K2Q']);
});

test('the clocks count down from when the rows arrived, not from any wall clock', () => {
  const { box } = draw({ rows: [nth(ROWS, 0), nth(ROWS, 5)], age: 60 });
  const texts = byTag(byId(box, 'your-games'), 'li').map(li => li.textContent);
  assert.match(nth(texts, 0), /Your turn, 7h 58m left/);
  assert.match(nth(texts, 1), /room closes in 8:00 unless someone plays/);
});

test('the Turn alerts button says its state, hides where unsupported, and reports a click', () => {
  const alertsText = (state: AlertsState) => { const { box } = draw({ alerts: state }); const b = maybeById(box, 'your-games-alerts'); return b ? b.textContent : null; };
  assert.equal(alertsText('off'), 'Turn Alerts: Off');
  assert.equal(alertsText('on'), 'Turn Alerts: On');
  assert.equal(alertsText('blocked'), 'Turn Alerts: Blocked in This Browser');
  assert.equal(alertsText('unsupported'), null);
  const { box, calls } = draw();
  const btn = byId(box, 'your-games-alerts');
  assert.equal(btn.getAttribute('aria-pressed'), 'false');
  click(btn);
  assert.equal(calls.alerts, 1);
});

test('toasts: the text, Go and a dismiss button; nothing when empty', () => {
  const root = makeEl('toast-root');
  const calls = { go: 0, close: 0 };
  toast.renderToasts(asElement(root), [{ id: 1, text: 'Your turn in 7K2Q · vs ZED', onGo: () => { calls.go++; }, onClose: () => { calls.close++; } }]);
  // The root is the live region; a toast is not a second one.
  const items = walk(root).filter(n => String(n.className || '') === 'toast');
  assert.equal(items.length, 1);
  assert.ok(nth(items, 0).getAttribute('role') == null);
  assert.match(nth(items, 0).textContent, /^Your turn in 7K2Q · vs ZED/);
  const buttons = byTag(nth(items, 0), 'button');
  const go = buttons.find(b => b.textContent === 'Go');
  const x = buttons.find(b => b.getAttribute('aria-label') === 'Dismiss');
  assert.ok(go && x, 'the toast has Go and Dismiss');
  click(go);
  click(x);
  assert.deepEqual(calls, { go: 1, close: 1 });
  toast.renderToasts(asElement(root), []);
  assert.equal(walk(root).filter(n => String(n.className || '') === 'toast').length, 0);
});

test('the title card shows Your games only when there are rooms', () => {
  const base: Omit<TitleProps, 'games'> = {
    keyHint: () => '', open: true, initials: 'BDJ', problem: '', hint: '', settingsOpen: false,
    onInitials() {}, onPlay() {}, onFriends() {}, onTutorial() {}, onSettings() {},
    shareState: 'idle', shareUrl: '', onShare() {}, onCloseShare() {},
  };
  const games0: GamesView = { rows: [], alerts: 'off', age: 0, onOpen() {}, onAlerts() {} };
  const empty = makeEl('title-root');
  title.renderTitle(asElement(empty), { ...base, games: games0 });
  assert.equal(maybeById(empty, 'your-games'), undefined);
  const full = makeEl('title-root');
  title.renderTitle(asElement(full), { ...base, games: { ...games0, rows: [nth(ROWS, 0)] } });
  assert.ok(maybeById(full, 'your-games'));
});
