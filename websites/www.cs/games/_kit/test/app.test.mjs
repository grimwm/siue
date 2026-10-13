// websites/www.cs/games/_kit/test/app.test.mjs
// Installed-app detection, full screen, and the three ways a game is left:
// an installed app that can close, one that cannot, and a browser tab.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isInstalled, enterFullscreen, exitApp, EXIT_HINT, CLOSE_WAIT_MS, topKeyLock, holdEscape } from '../app.ts';
import { manualClock } from './clock.ts';

function fakeEnv({ modes = [], ios = false, full = false, closes = false, refuse = false } = {}) {
  const clock = manualClock();
  const log = [];
  let closed = false;
  let inFull = full;
  const env = {
    matches: q => modes.some(m => q === `(display-mode: ${m})`),
    iosStandalone: () => ios,
    fullscreenElement: () => (inFull ? { id: 'frame' } : null),
    requestFullscreen: async () => { log.push('enter'); if (refuse) throw new Error('denied'); inFull = true; },
    exitFullscreen: async () => { log.push('leave'); if (refuse) throw new Error('denied'); inFull = false; },
    closeWindow: () => { log.push('close'); if (closes) closed = true; },
    closed: () => closed,
    timers: clock.timers,
  };
  return { env, log, clock };
}

test('an app runs installed in any app display mode, or as an iOS home-screen app', () => {
  for (const m of ['fullscreen', 'standalone', 'minimal-ui']) assert.equal(isInstalled(fakeEnv({ modes: [m] }).env), true, m);
  assert.equal(isInstalled(fakeEnv({ ios: true }).env), true);
  assert.equal(isInstalled(fakeEnv({ modes: ['browser'] }).env), false);
  assert.equal(isInstalled(fakeEnv().env), false);
});

test('an installed app that may close its window closes it', async () => {
  const { env, log, clock } = fakeEnv({ modes: ['fullscreen'], closes: true });
  const out = exitApp(env);
  clock.advance(CLOSE_WAIT_MS);
  assert.equal(await out, 'closed');
  assert.deepEqual(log, ['close']);
});

test('an installed app that cannot close falls back to its title card, out of full screen, with the hint', async () => {
  const { env, log, clock } = fakeEnv({ modes: ['standalone'], full: true });
  let settled = false;
  const out = exitApp(env).then(v => { settled = true; return v; });
  clock.advance(CLOSE_WAIT_MS - 1);
  await new Promise(r => setImmediate(r));
  assert.equal(settled, false, 'it gives the window its moment to close');
  clock.advance(1);
  assert.equal(await out, 'title-with-hint');
  assert.deepEqual(log, ['close', 'leave']);
  assert.equal(EXIT_HINT, 'Swipe the app away to close it');
});

test('a browser tab is never asked to close: it leaves full screen and shows the title card', async () => {
  const { env, log, clock } = fakeEnv({ full: true });
  assert.equal(await exitApp(env), 'title');
  assert.deepEqual(log, ['leave']);
  assert.equal(clock.pending(), 0);
  const plain = fakeEnv();
  assert.equal(await exitApp(plain.env), 'title');
  assert.deepEqual(plain.log, []);
});

test('a browser that refuses to leave full screen still gets the title card', async () => {
  const { env } = fakeEnv({ full: true, refuse: true });
  assert.equal(await exitApp(env), 'title');
});

test('entering full screen asks once, and says whether it worked', async () => {
  const off = fakeEnv();
  assert.equal(await enterFullscreen(off.env, {}), true);
  assert.deepEqual(off.log, ['enter']);
  const on = fakeEnv({ full: true });
  assert.equal(await enterFullscreen(on.env, {}), true);
  assert.deepEqual(on.log, []);
  const refused = fakeEnv({ refuse: true });
  assert.equal(await enterFullscreen(refused.env, {}), false);
});

// Keyboard Lock (Chromium) keeps a tap of Esc for the game in full screen.
// Chromium refuses lock() from inside a frame, and the site's /play/ pages run
// every game in one: the lock must come from the top-level page.
function fakeLock({ refuse = false } = {}) {
  const log = [];
  return {
    log,
    lock: async keys => { log.push(['lock', ...keys]); if (refuse) throw new Error('lock() must be called from a primary top-level browsing context.'); },
    unlock: () => { log.push(['unlock']); },
  };
}

test('the lock is the top-level page\'s, also for a game inside a same-origin frame', () => {
  const top = fakeLock();
  const own = fakeLock();
  const topWin = { navigator: { keyboard: top } };
  topWin.top = topWin;
  assert.equal(topKeyLock({ top: topWin, navigator: { keyboard: own } }), top, 'in a frame: the top page\'s lock');
  assert.equal(topKeyLock(topWin), top, 'top-level: its own');
});

test('a frame whose top page is out of reach, or a browser without Keyboard Lock, has no lock', () => {
  const crossOrigin = { get navigator() { throw new Error('SecurityError'); } };
  assert.equal(topKeyLock({ top: crossOrigin, navigator: { keyboard: fakeLock() } }), null);
  const noKb = { navigator: {} };
  noKb.top = noKb;
  assert.equal(topKeyLock(noKb), null);
  const noLockFn = { navigator: { keyboard: { unlock() {} } } };
  noLockFn.top = noLockFn;
  assert.equal(topKeyLock(noLockFn), null);
});

test('in full screen Esc is claimed, out of it released, and without Keyboard Lock nothing happens', async () => {
  const kb = fakeLock();
  const warn = [];
  assert.equal(await holdEscape(true, kb, m => warn.push(m)), 'locked');
  assert.equal(await holdEscape(false, kb, m => warn.push(m)), 'released');
  assert.deepEqual(kb.log, [['lock', 'Escape'], ['unlock']]);
  assert.equal(await holdEscape(true, null, m => warn.push(m)), 'unsupported');
  assert.deepEqual(warn, []);
});

test('a refused lock is reported, never swallowed', async () => {
  const warn = [];
  assert.equal(await holdEscape(true, fakeLock({ refuse: true }), m => warn.push(m)), 'refused');
  assert.equal(warn.length, 1);
  assert.match(warn[0], /Esc will leave full screen.*top-level browsing context/);
});
