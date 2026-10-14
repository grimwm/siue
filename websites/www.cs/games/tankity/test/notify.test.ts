// Turn alerts (src/notify.ts) against a stubbed Notification: missing,
// promise-style and callback-style permission (old Safari), the opt-in pref,
// and the notification a turn raises.
import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import type { StorageLike } from '../../_kit/ports.ts';
import { notifyPermission, askNotify, showTurnNotification, alertsPref, ALERTS_KEY } from '../src/notify.ts';

/** The scope's Notification, which the cases replace with a stub class; the lib types it as always there. */
const scope = globalThis as { Notification?: unknown };
const real = scope.Notification;
afterEach(() => { if (real === undefined) delete scope.Notification; else scope.Notification = real; });

/** What the stub raises: a title, its options, a close, and the click handler the code sets. */
interface Made { title: string; opts: { tag?: string; body?: string }; closed: boolean; onclick?: () => void; close(): void }
type Answer = 'default' | 'granted' | 'denied';
/** The stub class: its `state` is the permission, and a test sets it to move the permission. */
interface StubCtor { state: Answer }

function stub(permission: Answer, request: (cb: (answer: string) => void, N: StubCtor) => Promise<string> | undefined): { made: Made[]; N: StubCtor } {
  const made: Made[] = [];
  class N {
    static state: Answer = permission;
    title: string;
    opts: { tag?: string; body?: string };
    closed = false;
    onclick?: () => void;
    constructor(title: string, opts: { tag?: string; body?: string }) { this.title = title; this.opts = opts; made.push(this); }
    close() { this.closed = true; }
    static get permission() { return N.state; }
    static requestPermission(cb: (answer: string) => void) { return request(cb, N); }
  }
  scope.Notification = N;
  return { made, N };
}

test('no Notification: unsupported, and asking resolves unsupported', async () => {
  delete scope.Notification;
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
  const { made, N } = stub('granted', () => Promise.resolve('granted'));
  assert.equal(showTurnNotification({ code: '7K2Q', others: ['ZED'] }, false, () => {}), false);
  assert.equal(made.length, 0);
  N.state = 'default';
  assert.equal(showTurnNotification({ code: '7K2Q', others: ['ZED'] }, true, () => {}), false);
  assert.equal(made.length, 0);
  N.state = 'granted';
  let clicked = 0;
  assert.equal(showTurnNotification({ code: '7K2Q', others: ['ZED', 'QRS'] }, true, () => { clicked++; }), true);
  assert.equal(made.length, 1);
  const note = made[0];
  assert.ok(note, 'a notification was raised');
  assert.equal(note.title, 'Your turn in Operation Tankity');
  assert.equal(note.opts.tag, 'tankity-turn-7K2Q');
  assert.equal(note.opts.body, 'Room 7K2Q · vs ZED, QRS');
  assert.ok(note.onclick, 'the notification handles a click');
  note.onclick();
  assert.equal(clicked, 1);
  assert.equal(note.closed, true);
});

test('the alerts pref is off by default and remembers on', () => {
  const m = new Map<string, string>();
  const storage: StorageLike = { getItem: k => m.get(k) ?? null, setItem: (k, v) => { m.set(k, v); }, removeItem: k => { m.delete(k); } };
  const p = alertsPref(storage);
  assert.equal(p.get(), 'off');
  p.set('on');
  assert.equal(m.get(ALERTS_KEY), 'on');
  assert.equal(alertsPref(storage).get(), 'on');
  m.set(ALERTS_KEY, 'maybe');
  assert.equal(alertsPref(storage).get(), 'off');
  assert.equal(alertsPref(null).get(), 'off');
});
