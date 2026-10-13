// websites/www.cs/tests/e2e/tankity-fullscreen-esc.spec.mjs
// Esc never takes the player out of full screen: in Tankity's /play/ page,
// where the game runs in a frame, full screen holds through a weapon preview
// opened from the shop and one opened over the gun picker, each shut with Esc.
// Chrome only leaves full screen on a real Esc unless the page holds Esc with
// Keyboard Lock, and a frame's lock() is refused, so this checks that the
// lock is taken, and granted, on the top-level page. (A test's Esc never
// reaches the browser's own full-screen handling, so the lock is the proof.)
// Unit guards: games/tankity/test/fullscreen.test.mjs, games/_kit/test/app.test.mjs.
import { test, expect } from '@playwright/test';
import { recorderScript } from './helpers.mjs';

/* Every frame records its Keyboard Lock calls and how each ended. A browser
   without Keyboard Lock gets a stand-in that grants, so the calls still show. */
function lockRecorder() {
  window.__locks = [];
  if (!navigator.keyboard || typeof navigator.keyboard.lock !== 'function') {
    Object.defineProperty(navigator, 'keyboard', { configurable: true, value: { lock: async () => {}, unlock() {} } });
  }
  const kb = navigator.keyboard;
  const lock = kb.lock.bind(kb), unlock = kb.unlock.bind(kb);
  kb.lock = keys => {
    const call = { keys, outcome: 'pending' };
    window.__locks.push(call);
    const p = lock(keys);
    p.then(() => { call.outcome = 'granted'; }, e => { call.outcome = `refused: ${e.message}`; });
    return p;
  };
  kb.unlock = () => { window.__locks.push({ unlock: true }); unlock(); };
}

test('Esc on a weapon preview, from the shop and over the gun picker, keeps the /play/ page full screen', async ({ browser }) => {
  test.setTimeout(30_000);
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  await ctx.addInitScript(recorderScript); // tutorial off
  await ctx.addInitScript(lockRecorder);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (/Keyboard Lock refused/.test(m.text())) errors.push(m.text()); });
  await page.goto('play/tankity/');
  const game = page.frameLocator('#play-frame');
  const frame = () => page.frames().find(f => /games\/tankity\//.test(f.url()));
  await expect(game.locator('#title-play')).toBeVisible();

  const full = () => frame().evaluate(() => (document.fullscreenElement ? document.fullscreenElement.id : null));
  const topLocks = () => page.evaluate(() => window.__locks);

  // Deal in; the shop opens. F (a real key press, so a user gesture) goes full screen.
  await game.locator('#title-play').click();
  await expect(game.locator('#shop-veil')).toBeVisible();
  await page.keyboard.press('f');
  await expect.poll(full).toBe('frame');
  expect(await page.evaluate(() => document.fullscreenElement && document.fullscreenElement.id)).toBe('play-frame');
  await expect.poll(async () => (await topLocks()).some(c => c.keys && c.keys.join() === 'Escape' && c.outcome === 'granted'),
    { message: 'the top-level page holds Esc with Keyboard Lock' }).toBe(true);

  // The shop's Preview button, then Esc.
  await game.locator('#shop-list li:not(.shop-cat):not(.shop-free) button', { hasText: 'Preview' }).first().click();
  await expect(game.locator('#preview-veil')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(game.locator('#preview-veil')).toBeHidden();
  await expect(game.locator('#shop-veil')).toBeVisible();
  expect(await full()).toBe('frame');

  // Into the battle: the gun picker (G), V previews the loaded gun over it, then Esc twice.
  await game.locator('#shop-next').click();
  await expect(game.locator('#shop-veil')).toBeHidden();
  await page.keyboard.press('g');
  await expect(game.locator('#gun-overlay')).toBeVisible();
  await page.keyboard.press('v');
  await expect(game.locator('#preview-veil')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(game.locator('#preview-veil')).toBeHidden();
  expect(await full()).toBe('frame');
  await page.keyboard.press('Escape');
  await expect(game.locator('#gun-overlay')).toBeHidden();
  expect(await full()).toBe('frame');

  // No lock was asked of the frame (Chrome refuses it there), and none was refused anywhere.
  expect(await frame().evaluate(() => window.__locks.filter(c => c.keys))).toEqual([]);
  expect((await topLocks()).filter(c => c.keys && c.outcome !== 'granted')).toEqual([]);
  expect((await topLocks()).some(c => c.unlock)).toBe(false);

  // The Fullscreen toggle still leaves, and lets go of Esc.
  await page.keyboard.press('f');
  await expect.poll(full).toBe(null);
  await expect.poll(async () => (await topLocks()).some(c => c.unlock)).toBe(true);
  expect(errors).toEqual([]);
  await ctx.close();
});
