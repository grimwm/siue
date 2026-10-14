// The rooms lobby's logic (src/lobby.ts) on a real RoomClient over a fake
// server and fake timers, in the Node DOM stub: the status line keeps a
// refusal while the lobby polls, a lobby closed with Q keeps its heartbeat,
// and a room that closes or a seat given up elsewhere lands back in the
// lobby with a line saying so.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { document, click } from '../../_kit/test/dom-stub.mjs';
import { importTsx } from '../../_kit/test/tsx.ts';

globalThis.document = document;
const m = await importTsx(import.meta.dirname, { lobby: '../src/lobby.ts', net: '../src/net.ts', seats: '../src/seats.ts' });

const lobbyRoom = (over = {}) => ({
  code: 'AB3D', phase: 'lobby', seats: [{ seat: 0, human: true, name: 'ABC', mode: 'human' }, { seat: 1, human: false, name: 'REAPER', mode: 'ai' }],
  hostSeat: 0, events: [], turnSecs: 120, closesIn: 600, you: { seat: 0 }, map: null, mapName: 'Random hills', difficulty: 'normal', ...over,
});

function rig(respond) {
  const intervals = new Map();
  let next = 1;
  const env = {
    fetch: async (url, init) => {
      const r = await respond(url, init);
      return { ok: r.status >= 200 && r.status < 300, status: r.status, json: async () => r.body };
    },
    setTimeout: (fn) => { queueMicrotask(fn); return 0; },
    setInterval: (fn, ms) => { const id = next++; intervals.set(id, { fn, ms }); return id; },
    clearInterval: id => { intervals.delete(id); },
    now: () => 0,
    beacon: () => true,
  };
  const storage = new Map();
  const seats = m.seats.createSeatStore({ getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v), removeItem: k => storage.delete(k) }, () => 0);
  const said = [];
  let lobby;
  const net = new m.net.RoomClient(env, {
    onReachable() {}, onSnapshot() {}, onReadyChange() {}, onError() {},
    onGone: (code, why) => lobby.netGone(code, why),
  });
  const $ = id => document.getElementById(id);
  lobby = m.lobby.createLobby({
    G: { body: 'tank', demo: true, over: false }, $, net,
    MATCH: { myTurn: false, initials: '' }, HUD: { online: false }, END: {}, replay: { clear() {} }, sfx: { play() {} },
    difficulty: { get: () => 'normal' }, unlock() {}, say: (t) => said.push(t), keyHint: () => '', seats,
    games: () => ({ rows: [], alerts: 'unsupported', age: 0, onOpen() {}, onAlerts() {} }), steppedOut() {},
    netEvent() {}, seatName: () => 'ABC', closeLobbyVeil: () => { $('lobby-veil').hidden = true; return true; },
    closeOverlays: () => false, closePreview() {}, endTutorial() {}, closeTitle() {}, backToTitle() {},
    initials: { get: () => 'ABC', set() {}, subscribe: () => () => {} }, initialsSaved() {},
    hideShop() {}, paintHud() {}, refreshNavHints() {}, renderMenu() {}, renderShop() {},
  });
  seats.remember({ code: 'AB3D', seat: 0, token: 'tok', csrf: 'c', initials: 'ABC' });
  const tick = async () => { for (const { fn } of [...intervals.values()]) fn(); for (let i = 0; i < 20; i++) await new Promise(r => setImmediate(r)); };
  return { net, lobby, seats, said, intervals, tick, $ };
}
const ok = body => ({ status: 200, body });

test('a refusal stays on the status line while the lobby polls; the roster line lives apart', async () => {
  const r = rig(url => {
    if (url.includes('action=start')) return { status: 409, body: { ok: false, error: 'A match needs at least two tanks. Switch a seat to AI so there is someone to battle.' } };
    if (url.includes('action=ping')) return ok({ ok: true, rooms: { used: 1, max: 50 } });
    if (url.includes('action=maps')) return ok({ ok: true, maps: [] });
    return ok({ ok: true, room: lobbyRoom() });
  });
  assert.equal(await r.lobby.resumeRoom('AB3D'), true);
  click(r.$('lobby-start'));
  await r.tick();
  await r.tick();
  assert.match(r.$('lobby-status').textContent, /at least two tanks/);
  assert.match(r.$('room-hint').textContent, /You host/);
});

test('a lobby closed with Q keeps polling (its heartbeat), so the room stays open', async () => {
  let polls = 0;
  const r = rig(url => {
    if (url.includes('action=state')) polls++;
    if (url.includes('action=ping')) return ok({ ok: true, rooms: { used: 1, max: 50 } });
    if (url.includes('action=maps')) return ok({ ok: true, maps: [] });
    return ok({ ok: true, room: lobbyRoom() });
  });
  await r.lobby.resumeRoom('AB3D');
  r.$('lobby-veil').hidden = true;
  const before = polls;
  await r.tick();
  assert.ok(polls > before, 'the lobby watch still asks');
  assert.equal(r.net.code, 'AB3D');
});

test('a room swept while its lobby shows: the seat is dropped and the lobby says so', async () => {
  let gone = false;
  const r = rig(url => {
    if (url.includes('action=ping')) return ok({ ok: true, rooms: { used: 0, max: 50 } });
    if (url.includes('action=maps')) return ok({ ok: true, maps: [] });
    if (gone && url.includes('action=state')) return { status: 404, body: { ok: false, error: 'no such room' } };
    return ok({ ok: true, room: lobbyRoom() });
  });
  await r.lobby.resumeRoom('AB3D');
  gone = true;
  await r.tick();
  assert.equal(r.net.code, '');
  assert.equal(r.seats.get('AB3D'), null);
  assert.equal(r.intervals.size, 0, 'nothing polls the dead room');
  assert.match(r.$('lobby-status').textContent, /Room AB3D has closed/);
  assert.equal(r.$('lobby-veil').hidden, false, 'back in the lobby, out of the room');
});
