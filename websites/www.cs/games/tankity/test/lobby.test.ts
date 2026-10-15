// The rooms lobby's logic (src/lobby.ts) on a real RoomClient over a fake
// server and fake timers, in the Node DOM stub: the status line keeps a
// refusal while the lobby polls, a lobby closed with Q keeps its heartbeat,
// and a room that closes or a seat given up elsewhere lands back in the
// lobby with a line saying so.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asElement, click, document, installDocument } from '../../_kit/test/dom-stub.ts';
import { importTsx } from '../../_kit/test/tsx.ts';
import type { StorageLike } from '../../_kit/ports.ts';
import type { MatchState } from '../src/game-types.ts';
import type { EndState } from '../src/match.ts';
import type { LobbyDeps } from '../src/lobby.ts';
import type { RoomEnv } from '../src/net.ts';
import type { Replay } from '../src/replay.ts';

installDocument();
const m = await importTsx<{
  lobby: typeof import('../src/lobby.ts');
  net: typeof import('../src/net.ts');
  seats: typeof import('../src/seats.ts');
}>(import.meta.dirname, { lobby: '../src/lobby.ts', net: '../src/net.ts', seats: '../src/seats.ts' });

/** What the fake server answers: a status and the JSON body. */
interface Answer { status: number; body: unknown }

const lobbyRoom = (over: Record<string, unknown> = {}) => ({
  code: 'AB3D', phase: 'lobby', seats: [{ seat: 0, human: true, name: 'ABC', mode: 'human' }, { seat: 1, human: false, name: 'REAPER', mode: 'ai' }],
  hostSeat: 0, events: [], turnSecs: 120, closesIn: 600, you: { seat: 0 }, map: null, mapName: 'Random hills', difficulty: 'normal', ...over,
});

function rig(respond: (url: string, init?: { method?: string; body?: string }) => Answer | Promise<Answer>) {
  const intervals = new Map<number, { fn: () => void; ms: number }>();
  let next = 1;
  const env: RoomEnv = {
    fetch: async (url, init) => {
      const r = await respond(url, init);
      return { ok: r.status >= 200 && r.status < 300, status: r.status, json: async () => r.body };
    },
    setTimeout: (fn) => { queueMicrotask(fn); return 0; },
    setInterval: (fn, ms) => { const id = next++; intervals.set(id, { fn, ms }); return id; },
    clearInterval: id => { intervals.delete(Number(id)); },
    now: () => 0,
    beacon: () => true,
  };
  const storage = new Map<string, string>();
  const store: StorageLike = { getItem: k => storage.get(k) ?? null, setItem: (k, v) => { storage.set(k, v); }, removeItem: k => { storage.delete(k); } };
  const seats = m.seats.createSeatStore(store, () => 0);
  const said: string[] = [];
  const G = { body: 'tank', demo: true, over: false };
  const titled: number[] = [];
  const locals: { difficulty: string; speed: number }[] = [];
  const net = new m.net.RoomClient(env, {
    onReachable() {}, onSnapshot() {}, onReadyChange() {}, onError() {},
    onGone: (code, why) => lobby.netGone(code, why),
  });
  const $ = (id: string) => document.getElementById(id);
  // The cases read these elements' own fields; the lobby is handed them as the DOM's.
  const el = (id: string) => asElement($(id)) as HTMLElement;
  const lobby = m.lobby.createLobby({
    G, $: el, net,
    // The lobby reads only the fields given for these three, so each partial literal stands for the whole object.
    MATCH: { myTurn: false, initials: '' } as MatchState, HUD: { online: false }, END: {} as EndState, replay: { clear() {} } as Replay, sfx: { play() {} },
    difficulty: { get: () => 'normal' }, unlock() {}, say: (t) => { said.push(t); }, keyHint: () => '', seats,
    games: () => ({ rows: [], alerts: 'unsupported', age: 0, onOpen() {}, onAlerts() {} }), steppedOut() {},
    netEvent() {}, seatName: () => 'ABC', closeLobbyVeil: () => { $('lobby-veil').hidden = true; return true; },
    closeOverlays: () => false, closePreview() {}, endTutorial() {}, closeTitle() {}, backToTitle() { titled.push(1); G.demo = true; },
    initials: { get: () => 'ABC', set() {}, subscribe: () => () => {} }, initialsSaved() {},
    hideShop() {}, paintHud() {}, refreshNavHints() {}, renderMenu() {}, renderShop() {},
    startLocal: local => { locals.push(local); G.demo = false; },
  } satisfies LobbyDeps);
  seats.remember({ code: 'AB3D', seat: 0, token: 'tok', csrf: 'c', initials: 'ABC' });
  const tick = async () => { for (const { fn } of [...intervals.values()]) fn(); for (let i = 0; i < 20; i++) await new Promise(r => setImmediate(r)); };
  return { net, lobby, seats, said, G, titled, locals, intervals, tick, $ };
}
const ok = (body: unknown): Answer => ({ status: 200, body });

const withGuest = lobbyRoom({ seats: [{ seat: 0, human: true, name: 'ABC', mode: 'human' }, { seat: 1, human: true, name: 'ZED', mode: 'human' }] });

test('a refusal stays on the status line while the lobby polls; the roster line lives apart', async () => {
  const r = rig(url => {
    if (url.includes('action=start')) return { status: 409, body: { ok: false, error: 'A match needs at least two tanks. Switch a seat to AI so there is someone to battle.' } };
    if (url.includes('action=ping')) return ok({ ok: true, rooms: { used: 1, max: 50 } });
    if (url.includes('action=maps')) return ok({ ok: true, maps: [] });
    return ok({ ok: true, room: withGuest });
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

test('a room swept under a running match ends the match before the lobby opens: no ghost field', async () => {
  let gone = false;
  const playing = lobbyRoom({ phase: 'play' });
  const r = rig(url => {
    if (url.includes('action=ping')) return ok({ ok: true, rooms: { used: 0, max: 50 } });
    if (url.includes('action=maps')) return ok({ ok: true, maps: [] });
    if (gone && url.includes('action=state')) return { status: 404, body: { ok: false, error: 'no such room' } };
    if (url.includes('action=start')) return ok({ ok: true, room: playing });
    return ok({ ok: true, room: lobbyRoom() });
  });
  await r.lobby.resumeRoom('AB3D');
  click(r.$('lobby-start'));
  await r.tick();
  assert.equal(r.G.demo, false, 'the net match is running');
  assert.equal(r.net.on, true);
  gone = true;
  await r.tick();
  assert.equal(r.net.on, false);
  assert.equal(r.titled.length, 1, 'the match is torn down (title/demo) so the solo engine has no room tanks');
  assert.equal(r.G.demo, true);
  assert.match(r.$('lobby-status').textContent, /Room AB3D has closed/);
  assert.equal(r.$('lobby-veil').hidden, false);
});

test('a match closed to make space: back to the title, the line says why, and the seat stays listed as closed', async () => {
  let gone = false;
  const playing = lobbyRoom({ phase: 'play' });
  const r = rig(url => {
    if (url.includes('action=ping')) return ok({ ok: true, rooms: { used: 50, max: 50 }, lobbies: { used: 3, max: 100 } });
    if (url.includes('action=maps')) return ok({ ok: true, maps: [] });
    if (gone && url.includes('action=state')) return { status: 404, body: { ok: false, error: 'no such room', closed: 'space' } };
    if (url.includes('action=start')) return ok({ ok: true, room: playing });
    return ok({ ok: true, room: lobbyRoom() });
  });
  await r.lobby.resumeRoom('AB3D');
  click(r.$('lobby-start'));
  await r.tick();
  assert.equal(r.net.on, true);
  gone = true;
  await r.tick();
  assert.equal(r.net.on, false);
  assert.equal(r.titled.length, 1);
  assert.match(r.$('lobby-status').textContent, /^Room AB3D was closed to make space\.$/);
  assert.equal(r.seats.get('AB3D')?.closed, 'space', 'kept, marked closed');
  assert.equal(r.intervals.size, 0, 'nothing polls the closed room');
});

test('resuming a room that was closed to make space marks the seat and says why', async () => {
  const r = rig(url => {
    if (url.includes('action=ping')) return ok({ ok: true, rooms: { used: 3, max: 50 }, lobbies: { used: 12, max: 100 } });
    if (url.includes('action=maps')) return ok({ ok: true, maps: [] });
    if (url.includes('action=state')) return { status: 404, body: { ok: false, error: 'no such room', closed: 'space' } };
    return ok({ ok: true });
  });
  assert.equal(await r.lobby.resumeRoom('AB3D'), false);
  assert.equal(r.seats.get('AB3D')?.closed, 'space');
  assert.match(r.$('lobby-status').textContent, /Room AB3D was closed to make space\./);
});

test('the occupancy line counts matches running and lobbies open', async () => {
  const r = rig(url => {
    if (url.includes('action=ping')) return ok({ ok: true, rooms: { used: 3, max: 50 }, lobbies: { used: 12, max: 100 } });
    if (url.includes('action=maps')) return ok({ ok: true, maps: [] });
    return ok({ ok: true, room: lobbyRoom() });
  });
  await r.lobby.resumeRoom('AB3D');
  assert.match(r.$('lobby-count').textContent, /^3 \/ 50 matches running · 12 lobbies open$/);
});

test('the host alone is told Start plays here; with a guest, the usual line', async () => {
  let room = lobbyRoom();
  const r = rig(url => {
    if (url.includes('action=ping')) return ok({ ok: true, rooms: { used: 0, max: 50 } });
    if (url.includes('action=maps')) return ok({ ok: true, maps: [] });
    return ok({ ok: true, room });
  });
  await r.lobby.resumeRoom('AB3D');
  assert.equal(r.$('room-hint').textContent, 'With only you seated, Start plays here on your device.');
  room = withGuest;
  await r.tick();
  assert.equal(r.$('room-hint').textContent, 'You host. Start when your crew is in.');
});

test('a host alone starts: the lobby closes, the seat is forgotten and the match plays here', async () => {
  let polls = 0;
  const r = rig(url => {
    if (url.includes('action=start')) return ok({ ok: true, local: { difficulty: 'easy', speed: 4 } });
    if (url.includes('action=state')) polls++;
    if (url.includes('action=ping')) return ok({ ok: true, rooms: { used: 0, max: 50 } });
    if (url.includes('action=maps')) return ok({ ok: true, maps: [] });
    return ok({ ok: true, room: lobbyRoom() });
  });
  await r.lobby.resumeRoom('AB3D');
  click(r.$('lobby-start'));
  await r.tick();
  assert.deepEqual(r.locals, [{ difficulty: 'easy', speed: 4 }]);
  assert.equal(r.net.code, '', 'no room session');
  assert.equal(r.net.on, false);
  assert.equal(r.seats.get('AB3D'), null, 'not in Your games');
  assert.equal(r.$('lobby-veil').hidden, true);
  assert.equal(r.intervals.size, 0, 'nothing polls the closed lobby');
  const before = polls;
  await r.tick();
  assert.equal(polls, before);
  assert.ok(r.said.includes('Nobody else joined, so this match plays here on your device.'), r.said.join(' | '));
});

test('a Start the server says this tab is too old for: the reload line, and the tab stays in its lobby', async () => {
  const r = rig(url => {
    if (url.includes('action=start')) return { status: 426, body: { error: 'Tankity was updated. Reload the page to keep playing.', reload: true } };
    if (url.includes('action=ping')) return ok({ ok: true, rooms: { used: 0, max: 50 } });
    if (url.includes('action=maps')) return ok({ ok: true, maps: [] });
    return ok({ ok: true, room: lobbyRoom() });
  });
  await r.lobby.resumeRoom('AB3D');
  click(r.$('lobby-start'));
  await r.tick();
  assert.equal(r.$('lobby-status').textContent, 'Tankity was updated. Reload the page to keep playing.');
  assert.equal(r.net.code, 'AB3D');
  assert.deepEqual(r.locals, []);
});
