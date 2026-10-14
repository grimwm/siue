// Your games (src/ui/games.tsx), the turn toasts (src/ui/toast.tsx) and where
// the list shows (the title card, the rooms lobby), in the Node DOM stub.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { document, makeEl, click } from '../../_kit/test/dom-stub.mjs';
import { importTsx } from '../../_kit/test/tsx.ts';

globalThis.document = document;
const { games, toast, title } = await importTsx(import.meta.dirname, {
  games: '../src/ui/games.tsx', toast: '../src/ui/toast.tsx', title: '../src/ui/title.tsx',
});
const walk = (el, out = []) => { for (const c of el.children || []) { out.push(c); walk(c, out); } return out; };
const byId = (el, id) => walk(el).find(n => n.id === id);
const byTag = (el, tag) => walk(el).filter(n => n.localName === tag);

const row = (code, over = {}) => ({
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
function draw(over = {}) {
  const box = makeEl('box');
  const calls = { open: [], alerts: 0 };
  games.renderYourGames(box, {
    id: 'your-games', rows: ROWS, alerts: 'off', age: 0,
    onOpen: c => calls.open.push(c), onAlerts: () => { calls.alerts++; }, ...over,
  });
  return { box, calls };
}

test('one row per room, saying where it stands, each with Open', () => {
  const { box, calls } = draw();
  const list = byId(box, 'your-games');
  const items = byTag(list, 'li');
  assert.equal(items.length, ROWS.length);
  const texts = items.map(li => li.textContent);
  assert.match(texts[0], /^7K2Q · ABC, ZED · Round 3 · Your turn, 7h 59m left/);
  assert.match(texts[1], /AB3D · ABC, ZED · Round 3 · ABC's turn/);
  assert.match(texts[2], /Shop open/);
  assert.match(texts[3], /^L0BY · ABC, ZED · Waiting in the lobby/);
  assert.match(texts[4], /Match over/);
  // A room that closes before the turn ends says so.
  assert.match(texts[5], /Your turn · room closes in 9:00 unless someone plays/);
  assert.match(texts[6], /REAPER's turn/);
  const open = byTag(items[0], 'button').find(b => /Open/.test(b.textContent));
  click(open);
  assert.deepEqual(calls.open, ['7K2Q']);
});

test('the clocks count down from when the rows arrived, not from any wall clock', () => {
  const { box } = draw({ rows: [ROWS[0], ROWS[5]], age: 60 });
  const texts = byTag(byId(box, 'your-games'), 'li').map(li => li.textContent);
  assert.match(texts[0], /Your turn, 7h 58m left/);
  assert.match(texts[1], /room closes in 8:00 unless someone plays/);
});

test('the Turn alerts button says its state, hides where unsupported, and reports a click', () => {
  const alertsText = state => { const { box } = draw({ alerts: state }); const b = byId(box, 'your-games-alerts'); return b ? b.textContent : null; };
  assert.equal(alertsText('off'), 'Turn alerts: off');
  assert.equal(alertsText('on'), 'Turn alerts: on');
  assert.equal(alertsText('blocked'), 'Turn alerts: blocked in this browser');
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
  toast.renderToasts(root, [{ id: 1, text: 'Your turn in 7K2Q · vs ZED', onGo: () => { calls.go++; }, onClose: () => { calls.close++; } }]);
  const items = walk(root).filter(n => n.getAttribute && n.getAttribute('role') === 'status');
  assert.equal(items.length, 1);
  assert.match(items[0].textContent, /^Your turn in 7K2Q · vs ZED/);
  const buttons = byTag(items[0], 'button');
  const go = buttons.find(b => b.textContent === 'Go');
  const x = buttons.find(b => b.getAttribute('aria-label') === 'Dismiss');
  click(go);
  click(x);
  assert.deepEqual(calls, { go: 1, close: 1 });
  toast.renderToasts(root, []);
  assert.equal(walk(root).filter(n => n.getAttribute && n.getAttribute('role') === 'status').length, 0);
});

test('the title card shows Your games only when there are rooms', () => {
  const base = {
    keyHint: () => '', open: true, initials: 'BDJ', problem: '', hint: '', settingsOpen: false,
    onInitials() {}, onPlay() {}, onFriends() {}, onTutorial() {}, onSettings() {},
  };
  const games0 = { rows: [], alerts: 'off', age: 0, onOpen() {}, onAlerts() {} };
  const empty = makeEl('title-root');
  title.renderTitle(empty, { ...base, games: games0 });
  assert.equal(byId(empty, 'your-games'), undefined);
  const full = makeEl('title-root');
  title.renderTitle(full, { ...base, games: { ...games0, rows: [ROWS[0]] } });
  assert.ok(byId(full, 'your-games'));
});
