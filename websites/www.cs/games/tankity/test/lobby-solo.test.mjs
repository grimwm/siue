// A room match taking over the field lets go of the solo run (src/lobby.ts
// startNetMatch → stopSolo): the run is not left held, and its card no longer
// takes the run's later outcome. Drives the real createLobby with stubbed surroundings.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { importTsx } from '../../_kit/test/tsx.ts';

const { lobby } = await importTsx(import.meta.dirname, { lobby: '../src/lobby.ts' });

test('a room match starting from the lobby lets go of the solo run first', async () => {
  const order = [];
  const net = {
    code: 'ABCD', on: false, seat: 0, seats: [], maps: [], map: '', isHost: false,
    loadMaps: async () => {}, ping: async () => ({ ok: true, rooms: { used: 1, max: 10 } }),
    watchLobby: (_open, cb) => cb({ phase: 'playing', seats: [], hostSeat: 0, events: [] }),
    beginMatch: () => order.push('beginMatch'), apply: () => {},
  };
  const base = {
    G: { demo: false, over: true, body: 'tank' }, net,
    MATCH: {}, HUD: { online: '' }, END: { buttons: 'solo', board: null, filed: null }, replay: { clear() {} },
    difficulty: { get: () => 'normal' }, $: () => null, keyHint: () => '', seatName: () => 'ABC',
    stopSolo: () => order.push('stopSolo'),
  };
  const deps = new Proxy(base, { get: (t, k) => (k in t ? t[k] : () => undefined) });
  const l = lobby.createLobby(deps);
  await l.openLobby();
  assert.deepEqual(order, ['stopSolo', 'beginMatch']);
});
