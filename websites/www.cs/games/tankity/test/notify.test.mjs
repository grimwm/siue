// Turn alerts (src/notify.ts) against a stubbed Notification: missing,
// promise-style and callback-style permission (old Safari), the opt-in pref,
// and the notification a turn raises.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { notifyPermission, askNotify, showTurnNotification, alertsPref, ALERTS_KEY } from '../src/notify.ts';

const real = globalThis.Notification;
afterEach(() => { if (real === undefined) delete globalThis.Notification; else globalThis.Notification = real; });

function stub(permission, request) {
  const made = [];
  class N {
    constructor(title, opts) { this.title = title; this.opts = opts; this.closed = false; made.push(this); }
    close() { this.closed = true; }
    static get permission() { return N.state; }
    static requestPermission(cb) { return request(cb, N); }
  }
  N.state = permission;
  globalThis.Notification = N;
  return made;
}

test('no Notification: unsupported, and asking resolves unsupported', async () => {
  delete globalThis.Notification;
  assert.equal(notifyPermission(), 'unsupported');
  assert.equal(await askNotify(), 'unsupported');
  assert.equal(showTurnNotification({ code: '7K2Q', others: ['ZED'] }, true, () => {}), false);
});

test('a promise-style request resolves with the answer', async () => {
  stub('default', (_cb, N) => { N.state = 'granted'; return Promise.resolve('granted'); });
  assert.equal(notifyPermission(), 'default');
  assert.equal(await askNotify(), 'granted');
  assert.equal(notifyPermission(), 'granted');
});

test('a callback-style request (old Safari) resolves through its callback', async () => {
  stub('default', (cb, N) => { N.state = 'denied'; setTimeout(() => cb('denied'), 0); return undefined; });
  assert.equal(await askNotify(), 'denied');
});

test('a request that throws reads as the current permission', async () => {
  stub('default', () => { throw new Error('nope'); });
  assert.equal(await askNotify(), 'default');
});

test('a turn notification needs alerts on and permission granted', () => {
  const made = stub('granted', () => Promise.resolve('granted'));
  assert.equal(showTurnNotification({ code: '7K2Q', others: ['ZED'] }, false, () => {}), false);
  assert.equal(made.length, 0);
  globalThis.Notification.state = 'default';
  assert.equal(showTurnNotification({ code: '7K2Q', others: ['ZED'] }, true, () => {}), false);
  assert.equal(made.length, 0);
  globalThis.Notification.state = 'granted';
  let clicked = 0;
  assert.equal(showTurnNotification({ code: '7K2Q', others: ['ZED', 'QRS'] }, true, () => { clicked++; }), true);
  assert.equal(made.length, 1);
  assert.equal(made[0].title, 'Your turn in Operation Tankity');
  assert.equal(made[0].opts.tag, 'tankity-turn-7K2Q');
  assert.equal(made[0].opts.body, 'Room 7K2Q · vs ZED, QRS');
  made[0].onclick();
  assert.equal(clicked, 1);
  assert.equal(made[0].closed, true);
});

test('the alerts pref is off by default and remembers on', () => {
  const m = new Map();
  const storage = { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) };
  const p = alertsPref(storage);
  assert.equal(p.get(), 'off');
  p.set('on');
  assert.equal(m.get(ALERTS_KEY), 'on');
  assert.equal(alertsPref(storage).get(), 'on');
  m.set(ALERTS_KEY, 'maybe');
  assert.equal(alertsPref(storage).get(), 'off');
  assert.equal(alertsPref(null).get(), 'off');
});
