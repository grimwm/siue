import { test } from 'node:test';
import assert from 'node:assert/strict';
import { manualClock } from './clock.ts';

test('timeouts and intervals fire in time order as the clock advances', () => {
  const c = manualClock();
  const log: string[] = [];
  c.timers.setTimeout(() => log.push(`t@${c.clock.now()}`), 50);
  const id = c.timers.setInterval(() => log.push(`i@${c.clock.now()}`), 30);
  c.advance(100);
  c.timers.clearInterval(id);
  c.advance(100);
  assert.deepEqual(log, ['i@30', 't@50', 'i@60', 'i@90']);
  assert.equal(c.clock.now(), 200);
  assert.equal(c.pending(), 0);
});

test('a cleared timeout never fires', () => {
  const c = manualClock();
  let fired = false;
  c.timers.clearTimeout(c.timers.setTimeout(() => { fired = true; }, 10));
  c.advance(20);
  assert.equal(fired, false);
});
