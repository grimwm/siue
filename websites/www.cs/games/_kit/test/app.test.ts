// websites/www.cs/games/_kit/test/app.test.ts
// Installed-app detection, full screen, and the three ways a game is left:
// an installed app that can close, one that cannot, and a browser tab.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isInstalled, enterFullscreen, exitApp, EXIT_HINT, CLOSE_WAIT_MS, topKeyLock, holdEscape } from '../app.ts';
import type { AppEnv, KeyLock, LockWindow } from '../app.ts';
import { manualClock } from './clock.ts';

// The fixtures are deliberately partial: the code under test reads only what is built here.
const FRAME = { id: 'frame' } as Element;
const NO_ELEMENT = {} as Element;

function fakeEnv({ modes = [], ios = false, full = false, closes = false, refuse = false }: { modes?: string[]; ios?: boolean; full?: boolean; closes?: boolean; refuse?: boolean } = {}) {
  const clock = manualClock();
  const log: string[] = [];
  let closed = false;
  let inFull = full;
  const env: AppEnv = {
    matches: q => modes.some(m => q === `(display-mode: ${m})`),
    iosStandalone: () => ios,
    fullscreenElement: () => (inFull ? FRAME : null),
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
  assert.equal(await enterFullscreen(off.env, NO_ELEMENT), true);
  assert.deepEqual(off.log, ['enter']);
  const on = fakeEnv({ full: true });
  assert.equal(await enterFullscreen(on.env, NO_ELEMENT), true);
  assert.deepEqual(on.log, []);
  const refused = fakeEnv({ refuse: true });
  assert.equal(await enterFullscreen(refused.env, NO_ELEMENT), false);
});

// Keyboard Lock (Chromium) keeps a tap of Esc for the game in full screen.
// Chromium refuses lock() from inside a frame, and the site's /play/ pages run
// every game in one: the lock must come from the top-level page.
function fakeLock({ refuse = false } = {}): KeyLock & { log: string[][] } {
  const log: string[][] = [];
  return {
    log,
    lock: async (keys: string[]) => { log.push(['lock', ...keys]); if (refuse) throw new Error('lock() must be called from a primary top-level browsing context.'); },
    unlock: () => { log.push(['unlock']); },
  };
}

/** A window that is its own top, as a top-level page is. */
function topLevel(navigator: object): LockWindow {
  const win = { top: null as LockWindow | null, navigator };
  win.top = win;
  return win;
}

test('the lock is the top-level page\'s, also for a game inside a same-origin frame', () => {
  const top = fakeLock();
  const own = fakeLock();
  const topWin = topLevel({ keyboard: top });
  assert.equal(topKeyLock({ top: topWin, navigator: { keyboard: own } }), top, 'in a frame: the top page\'s lock');
  assert.equal(topKeyLock(topWin), top, 'top-level: its own');
});

test('a frame whose top page is out of reach, or a browser without Keyboard Lock, has no lock', () => {
  const crossOrigin: LockWindow = { top: null, get navigator(): object { throw new Error('SecurityError'); } };
  assert.equal(topKeyLock({ top: crossOrigin, navigator: { keyboard: fakeLock() } }), null);
  const noKb = topLevel({});
  assert.equal(topKeyLock(noKb), null);
  const noLockFn = topLevel({ keyboard: { unlock() {} } });
  assert.equal(topKeyLock(noLockFn), null);
});

test('in full screen Esc is claimed, out of it released, and without Keyboard Lock nothing happens', async () => {
  const kb = fakeLock();
  const warn: string[] = [];
  assert.equal(await holdEscape(true, kb, m => warn.push(m)), 'locked');
  assert.equal(await holdEscape(false, kb, m => warn.push(m)), 'released');
  assert.deepEqual(kb.log, [['lock', 'Escape'], ['unlock']]);
  assert.equal(await holdEscape(true, null, m => warn.push(m)), 'unsupported');
  assert.deepEqual(warn, []);
});

test('a refused lock is reported, never swallowed', async () => {
  const warn: string[] = [];
  assert.equal(await holdEscape(true, fakeLock({ refuse: true }), m => warn.push(m)), 'refused');
  assert.equal(warn.length, 1);
  assert.ok(warn[0] !== undefined);
  assert.match(warn[0], /Esc will leave full screen.*top-level browsing context/);
});
