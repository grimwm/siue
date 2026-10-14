// The turn toast queue (src/toasts.ts): one per room, the newest few, and a
// countdown that runs only while the page is visible.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createToastQueue, TOAST_MS, TOAST_MAX } from '../src/toasts.ts';

function rig() {
  const r = { hidden: false, timers: new Map(), next: 1, lists: [] };
  r.q = createToastQueue({
    setTimeout: (fn, ms) => { const id = r.next++; r.timers.set(id, { fn, ms }); return id; },
    clearTimeout: id => { r.timers.delete(id); },
    hidden: () => r.hidden,
    onChange: list => r.lists.push(list.map(t => t.code)),
  });
  r.fire = () => { for (const [id, t] of [...r.timers]) { r.timers.delete(id); t.fn(); } };
  return r;
}

test('a toast on a visible page closes itself after TOAST_MS', () => {
  const r = rig();
  r.q.push('AAAA', 'Your turn in AAAA');
  assert.deepEqual(r.q.list().map(t => t.text), ['Your turn in AAAA']);
  assert.equal([...r.timers.values()][0].ms, TOAST_MS);
  r.fire();
  assert.deepEqual(r.q.list(), []);
});

test('a toast raised while hidden waits, and its countdown starts once the page is seen', () => {
  const r = rig();
  r.hidden = true;
  r.q.push('AAAA', 'Your turn in AAAA');
  assert.equal(r.timers.size, 0);
  r.hidden = false;
  r.q.shown();
  assert.equal(r.timers.size, 1);
  r.q.shown(); // a second visibility event arms nothing more
  assert.equal(r.timers.size, 1);
  r.fire();
  assert.deepEqual(r.q.list(), []);
});

test('one toast per room, newest last, at most TOAST_MAX; close drops it and its timer', () => {
  const r = rig();
  for (const c of ['AAAA', 'BBBB', 'CCCC', 'DDDD']) r.q.push(c, c);
  r.q.push('BBBB', 'again');
  assert.equal(TOAST_MAX, 3);
  assert.deepEqual(r.q.list().map(t => t.code), ['CCCC', 'DDDD', 'BBBB']);
  const id = r.q.list()[0].id;
  r.q.close(id);
  assert.deepEqual(r.q.list().map(t => t.code), ['DDDD', 'BBBB']);
  assert.equal(r.timers.size, 2);
  assert.ok(r.lists.length > 0);
});
