// The turn toast queue (src/toasts.ts): one per room, the newest few, and a
// countdown that runs only while the page is visible.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createToastQueue, TOAST_MS, TOAST_MAX } from '../src/toasts.ts';

/** Item `i` of a list the case reads, which must be there. */
function nth<T>(list: readonly T[], i: number): T {
  const v = list[i];
  assert.ok(v !== undefined, `no item ${i} of ${list.length}`);
  return v;
}

function rig() {
  const timers = new Map<number, { fn: () => void; ms: number }>();
  const lists: string[][] = [];
  const r = { hidden: false, timers, next: 1, lists };
  const q = createToastQueue({
    setTimeout: (fn, ms) => { const id = r.next++; timers.set(id, { fn, ms }); return id; },
    clearTimeout: id => { timers.delete(Number(id)); },
    hidden: () => r.hidden,
    onChange: list => lists.push(list.map(t => t.code)),
  });
  const fire = () => { for (const [id, t] of [...timers]) { timers.delete(id); t.fn(); } };
  return Object.assign(r, { q, fire });
}

test('a toast on a visible page closes itself after TOAST_MS', () => {
  const r = rig();
  r.q.push('AAAA', 'Your turn in AAAA');
  assert.deepEqual(r.q.list().map(t => t.text), ['Your turn in AAAA']);
  assert.equal(nth([...r.timers.values()], 0).ms, TOAST_MS);
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
  const id = nth(r.q.list(), 0).id;
  r.q.close(id);
  assert.deepEqual(r.q.list().map(t => t.code), ['DDDD', 'BBBB']);
  assert.equal(r.timers.size, 2);
  assert.ok(r.lists.length > 0);
});
