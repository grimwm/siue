// Tapping Play on a phone or tablet asks for full screen in the same gesture,
// so the browser's own bars do not eat the bottom of a landscape screen. A
// desktop never asks, and a refusal changes nothing. (The webkit-prefixed
// fallback is the kit's: _kit/test/app.test.ts.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AppEnv } from '../../_kit/app.ts';
import { manualClock } from '../../_kit/test/clock.ts';
import { fullscreenForPlay } from '../src/play-fullscreen.ts';

const FRAME = { id: 'frame' } as Element;

function fakeEnv({ refuse = false, full = false }: { refuse?: boolean; full?: boolean } = {}) {
  const log: string[] = [];
  const env: AppEnv = {
    matches: () => false,
    iosStandalone: () => false,
    fullscreenSupported: () => true,
    fullscreenElement: () => (full ? FRAME : null),
    requestFullscreen: () => { log.push('request'); return refuse ? Promise.reject(new Error('denied')) : Promise.resolve(); },
    exitFullscreen: () => Promise.resolve(),
    closeWindow() {},
    closed: () => false,
    timers: manualClock().timers,
  };
  return { env, log };
}

test('Play on a touch device requests full screen on the frame, before the handler returns', () => {
  const { env, log } = fakeEnv();
  fullscreenForPlay(() => true, env, FRAME);
  assert.deepEqual(log, ['request'], 'the request is made synchronously, inside the tap');
});

test('Play on a desktop does not ask', () => {
  const { env, log } = fakeEnv();
  fullscreenForPlay(() => false, env, FRAME);
  assert.deepEqual(log, []);
});

test('a missing frame asks for nothing', () => {
  const { env, log } = fakeEnv();
  fullscreenForPlay(() => true, env, null);
  assert.deepEqual(log, []);
});

test('a refusal is swallowed', async () => {
  const { env, log } = fakeEnv({ refuse: true });
  const unhandled: unknown[] = [];
  const onUnhandled = (e: unknown) => unhandled.push(e);
  process.on('unhandledRejection', onUnhandled);
  assert.doesNotThrow(() => fullscreenForPlay(() => true, env, FRAME));
  await new Promise(r => setImmediate(r));
  process.off('unhandledRejection', onUnhandled);
  assert.deepEqual(log, ['request']);
  assert.deepEqual(unhandled, []);
});

test('a synchronous throw from the browser is swallowed too', () => {
  const { env } = fakeEnv();
  env.requestFullscreen = () => { throw new Error('not allowed'); };
  assert.doesNotThrow(() => fullscreenForPlay(() => true, env, FRAME));
});

test('already full screen is left alone', () => {
  const { env, log } = fakeEnv({ full: true });
  fullscreenForPlay(() => true, env, FRAME);
  assert.deepEqual(log, []);
});

test('the player leaving full screen is not undone: only a tap asks again', () => {
  const { env, log } = fakeEnv();
  fullscreenForPlay(() => true, env, FRAME); // the first Play tap
  // ...the player leaves full screen; nothing runs until the next tap.
  assert.deepEqual(log, ['request']);
  fullscreenForPlay(() => true, env, FRAME); // the next Play tap
  assert.deepEqual(log, ['request', 'request']);
});
