// Operation Tankity's room puzzle, as players meet it: hosting and joining
// say "Setting up the room…" while the browser solves a small proof of work
// (WebCrypto PBKDF2, games/tankity/src/pow.ts), Cancel stops it, codes have
// six characters and may be typed back with a space, and a tab from before
// the puzzle is told to reload. The server half (the order of checks, replay,
// stale and rebound puzzles, guessing) is covered at the handler level in
// games/tankity/test/php/RoomPowGateTest.php and RoomPowTest.php. The last
// case measures the solver, which is what README "Room slots" sets the
// difficulty from. Chrome runs it; E2E_WEBKIT=1 and E2E_FIREFOX=1 add WebKit
// and Firefox (tests/e2e/playwright.config.mjs).
import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { hud, newPlayer, setInitials } from './helpers.mjs';

const CODE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/;
const SETTINGS = readFileSync(new URL('../../games/tankity/server/settings.php', import.meta.url), 'utf8');
/** The join difficulty at rest (a create is one bit harder; load adds up to two). */
const BASE_BITS = Number(/const ROOM_POW_BITS = (\d+);/.exec(SETTINGS)?.[1]);

/** Holds every puzzle request until release() is called. */
async function holdPuzzles(page) {
  let release = () => {};
  const held = new Promise(r => { release = r; });
  await page.route('**/rooms.php?action=challenge*', async route => { await held; await route.continue(); });
  return () => release();
}

/** A player with initials set and the lobby open; no service worker, so the
    cases' page.route sees the room requests on every engine. */
async function inLobby(browser, initials) {
  const p = await newPlayer(browser, undefined, { serviceWorkers: 'block' });
  expect(await p.page.evaluate(() => window.isSecureContext),
    'WebCrypto needs a secure context: E2E_BASE_URL must be https or http://127.0.0.1 (make url prints that)').toBe(true);
  await setInitials(p.page, initials);
  await p.page.click('#rooms-open');
  return p;
}

test('hosting shows Setting up the room… and gets a 6-character code', async ({ browser }) => {
  const host = await inLobby(browser, 'abc');
  const release = await holdPuzzles(host.page);
  await host.page.click('#host-go');
  const status = host.page.locator('#lobby-status');
  await expect(status).toHaveText('Setting up the room…');
  await expect(status).toHaveAttribute('aria-live', 'polite');
  await expect(host.page.locator('#host-go')).toHaveAttribute('aria-disabled', 'true');
  await expect(host.page.locator('#join-go')).toHaveAttribute('aria-disabled', 'true');
  await expect(host.page.locator('#lobby-cancel')).toBeVisible();
  release();
  await host.page.waitForSelector('#lobby-room:not([hidden])');
  const code = ((await hud(host.page, 'lobby-code')) || '').trim();
  expect(code).toMatch(CODE);
  await expect(host.page.locator('#lobby-code .code-half')).toHaveText([code.slice(0, 3), code.slice(3)]);
  await expect(host.page.locator('#join-link')).toHaveValue(new RegExp(`\\?code=${code}$`));
  expect(host.errors).toEqual([]);
  await host.ctx.close();
});

test('Cancel stops setting up the room, and nothing is created', async ({ browser }) => {
  const host = await inLobby(browser, 'abc');
  const creates = [];
  host.page.on('request', r => { if (r.url().includes('action=create')) creates.push(r.url()); });
  const release = await holdPuzzles(host.page);
  await host.page.click('#host-go');
  await expect(host.page.locator('#lobby-status')).toHaveText('Setting up the room…');
  await host.page.click('#lobby-cancel');
  await expect(host.page.locator('#lobby-status')).toHaveText('Stopped. Nothing was set up.');
  await expect(host.page.locator('#lobby-cancel')).toBeHidden();
  await expect(host.page.locator('#host-go')).toBeFocused();
  await expect(host.page.locator('#host-go')).not.toHaveAttribute('aria-disabled', 'true');
  release();
  await host.page.waitForTimeout(1500);
  expect(creates).toEqual([]);
  await expect(host.page.locator('#lobby-room')).toBeHidden();
  expect(host.errors).toEqual([]);
  await host.ctx.close();
});

test('a friend joins with the code typed with a space', async ({ browser }) => {
  const host = await inLobby(browser, 'abc');
  await host.page.click('#host-go');
  await host.page.waitForSelector('#lobby-room:not([hidden])');
  const code = ((await hud(host.page, 'lobby-code')) || '').trim();
  const guest = await inLobby(browser, 'zed');
  const release = await holdPuzzles(guest.page);
  await guest.page.fill('#join-code', `${code.slice(0, 3).toLowerCase()} ${code.slice(3)}`);
  await guest.page.click('#join-go');
  await expect(guest.page.locator('#lobby-status')).toHaveText('Setting up your seat…');
  release();
  await guest.page.waitForSelector('#lobby-room:not([hidden])');
  await expect(guest.page.locator('#lobby-code')).toHaveText(code);
  await expect.poll(() => hud(host.page, 'log'), { timeout: 10_000 }).toMatch(/zed rolled into the room/i);
  expect(host.errors).toEqual([]);
  expect(guest.errors).toEqual([]);
  await host.ctx.close(); await guest.ctx.close();
});

test('an old tab is told to reload', async ({ browser }) => {
  const host = await inLobby(browser, 'abc');
  // What a bundle from before the puzzle sends: no protocol, no puzzle.
  await host.page.route('**/rooms.php?action=create*', async route => {
    const body = JSON.parse(route.request().postData() || '{}');
    delete body.proto;
    delete body.pow;
    await route.fulfill({ response: await route.fetch({ postData: JSON.stringify(body) }) });
  });
  await host.page.click('#host-go');
  await expect(host.page.locator('#lobby-status')).toHaveText('Tankity was updated. Reload the page to keep playing.');
  await expect(host.page.locator('#lobby-room')).toBeHidden();
  await host.ctx.close();
});

/* The solver on this engine, at the shipped difficulty: 20 puzzles each for a
   join and a create, and on Chrome again at a quarter of the CPU (DevTools'
   CPU throttling, the usual stand-in for a mid phone), where a join's 95th
   percentile must stay within a second. Also the longest the page's thread
   was held up while solving. A measurement for a developer machine: a shared
   CI runner under throttling is no phone. */
test('the puzzle solves within a second on a mid phone', async ({ browser, browserName }, testInfo) => {
  test.skip(!!process.env.CI, 'a measurement for a developer machine, not a shared CI runner');
  test.setTimeout(300_000);
  expect(BASE_BITS).toBeGreaterThan(0);
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('games/tankity/tools/pow-bench.html?manual');
  await page.waitForFunction(() => typeof window.powBench === 'function');
  const rows = [];
  const run = async (label, bits) => {
    const r = await page.evaluate(b => window.powBench(b, 20), bits);
    rows.push(`${label.padEnd(34)} bits ${String(bits).padStart(2)}  mean ${r.mean.toFixed(0).padStart(5)} ms  p95 ${r.p95.toFixed(0).padStart(5)} ms  longest stall ${r.maxLagMs.toFixed(0).padStart(3)} ms`);
    return r;
  };
  const join = await run(`${browserName} join`, BASE_BITS);
  await run(`${browserName} create`, BASE_BITS + 1);
  await run(`${browserName} join, +2 under load`, BASE_BITS + 2);
  let phone = null;
  if (browserName === 'chromium') {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    phone = await run('chromium 4x throttled join', BASE_BITS);
    await run('chromium 4x throttled create', BASE_BITS + 1);
    await run('chromium 4x throttled join, +2', BASE_BITS + 2);
  }
  const table = rows.join('\n');
  console.log(table);
  testInfo.annotations.push({ type: 'pow-bench', description: table });
  expect(join.p95, table).toBeLessThanOrEqual(1000);
  if (phone) expect(phone.p95, table).toBeLessThanOrEqual(1000);
  // Solving never holds the page's thread long enough to drop more than a few frames.
  expect(join.maxLagMs, table).toBeLessThan(100);
  await ctx.close();
});
