// Operation Tankity on a phone: no keyboard, so no keys at all.
import { test, expect, devices } from '@playwright/test';
import type { Browser, Locator, Page } from '@playwright/test';
import { recorderScript } from './helpers.ts';

test.use({ ...devices['Pixel 7'], channel: 'chrome' });

test('touch screens get no key labels and no key bindings', async ({ page }) => {
  await page.addInitScript(recorderScript);
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('games/tankity/');
  await expect(page.locator('html')).toHaveClass(/touch/);

  // Keys do nothing (Q would open the menu). A script's key event is not a
  // physical key, so it cannot turn them on either.
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'q', code: 'KeyQ', bubbles: true })));
  await page.waitForTimeout(300);
  await expect(page.locator('#menu-overlay')).toBeHidden();

  // The buttons still work, and no label anywhere names a key. The phone's
  // title card covers the toolbar, so the menu opens from the card's Settings.
  await page.locator('#title-settings').tap();
  await expect(page.locator('#menu-overlay')).toBeVisible();
  const noKeys = async () => {
    const shown = await page.evaluate(() => [...document.querySelectorAll('.key, .nav-hint, .keys-only')]
      .filter(el => el.getClientRects().length > 0).map(el => el.id || el.className));
    expect(shown).toEqual([]);
    const text = await page.evaluate(() => document.body.innerText);
    expect(text).not.toMatch(/\((C|N|Esc|ESC|E|M|F|T|O|U|H|L|R|Q|A|D|Ctrl|B|V)\)/);
  };
  await noKeys();
  await page.locator('#new-game').tap();
  await page.waitForSelector('#shop-veil:not([hidden])');
  await expect(page.locator('#shop-next')).toHaveText(/^Start Round 1$/);
  await noKeys();

  // Help explains the touch controls instead.
  await page.locator('#shop-next').tap();
  await page.locator('#btn-help').tap();
  await expect(page.locator('#help-overlay li.touch-only')).toBeVisible();
  await noKeys();
  await page.screenshot({ path: 'test-results/tankity-touch.png' });
  expect(errors).toEqual([]);
});

// The scroll hotkeys (J/K line, PgUp/PgDn page, Shift+J/K half page) are
// keyboard hints. They show in the overlay footers and as Help rows on a
// keyboard device, and nowhere on a phone or tablet, where panels scroll by touch.
const scrollHintsShown = (page: Page) => page.evaluate(() => [...document.querySelectorAll('.scroll-keys, [data-keyhint^="scroll:"]')]
  .filter(el => el.getClientRects().length > 0).length);
const openHelp = async (page: Page, tap: boolean) => {
  const press = (loc: Locator) => (tap ? loc.tap() : loc.click());
  await page.goto('games/tankity/');
  await press(page.locator('#title-settings'));
  await press(page.locator('#new-game'));
  await page.waitForSelector('#shop-veil:not([hidden])');
  await press(page.locator('#shop-next'));
  await press(page.locator('#btn-help'));
  await expect(page.locator('#help-overlay .help')).toBeVisible();
};

/** A page in its own context shaped like `profile` (the file's channel stays). */
async function pageOn(browser: Browser, baseURL: string | undefined, profile: Parameters<Browser['newContext']>[0] & { defaultBrowserType?: string }) {
  const { defaultBrowserType: _ignored, ...opts } = profile;
  const ctx = await browser.newContext({ ...opts, baseURL });
  return { ctx, page: await ctx.newPage() };
}

const profiles: [string, (typeof devices)[string]][] = [['phone', devices['Pixel 7']!], ['tablet', devices['iPad Pro 11 landscape']!]];
for (const [name, profile] of profiles) {
  test(`${name}: no scroll hotkey hint in Help or an overlay footer`, async ({ browser, baseURL }) => {
    const { ctx, page } = await pageOn(browser, baseURL, profile);
    await openHelp(page, true);
    expect(await scrollHintsShown(page)).toBe(0);
    await ctx.close();
  });
}

test('desktop: Help still lists the scroll keys', async ({ browser, baseURL }) => {
  const { ctx, page } = await pageOn(browser, baseURL, { viewport: { width: 1280, height: 860 }, hasTouch: false, isMobile: false, deviceScaleFactor: 1 });
  await openHelp(page, false);
  expect(await scrollHintsShown(page)).toBeGreaterThanOrEqual(6);
  await ctx.close();
});

// An S Pen makes any-pointer: fine match on a phone whose primary pointer is
// coarse (Chrome has no switch for it, so the page's matchMedia reports it).
const withStylus = (page: Page) => page.addInitScript(() => {
  const real = window.matchMedia.bind(window);
  window.matchMedia = q => {
    const mql = real(q);
    return /any-pointer:\s*fine/.test(q) ? new Proxy(mql, { get: (t, k) => (k === 'matches' ? true : Reflect.get(t, k) instanceof Function ? Reflect.get(t, k).bind(t) : Reflect.get(t, k)) }) : mql;
  };
});
const startShop = async (page: Page) => {
  await page.goto('games/tankity/');
  await page.locator('#title-settings').tap();
  await page.locator('#new-game').tap();
  await page.waitForSelector('#shop-veil:not([hidden])');
};

test('a phone with a stylus still counts as touch: no key hints in the shop header or Help', async ({ browser, baseURL }) => {
  const { ctx, page } = await pageOn(browser, baseURL, devices['Pixel 7']);
  await withStylus(page);
  await startShop(page);
  await expect(page.locator('html')).toHaveClass(/touch/);
  expect(await page.evaluate(() => matchMedia('(any-pointer: fine)').matches)).toBe(true);
  await expect(page.locator('#nav-shop')).toBeHidden();
  expect(await scrollHintsShown(page)).toBe(0);
  await page.locator('#shop-next').tap();
  await page.locator('#btn-help').tap();
  await expect(page.locator('#help-overlay .help')).toBeVisible();
  expect(await scrollHintsShown(page)).toBe(0);
  await ctx.close();
});

test('a real keyboard key brings the key hints back on a touch device', async ({ browser, baseURL }) => {
  const { ctx, page } = await pageOn(browser, baseURL, devices['Pixel 7']);
  await startShop(page);
  await expect(page.locator('#nav-shop')).toBeHidden();
  await page.keyboard.press('x');
  await expect(page.locator('html')).not.toHaveClass(/touch/);
  await expect(page.locator('#nav-shop')).toBeVisible();
  await ctx.close();
});

// A phone or tablet goes full screen when the player taps Play: in landscape
// the browser's own bars would otherwise take the bottom of the screen. The
// request is made inside the tap; leaving full screen is not undone mid-match,
// and the next Play tap asks again. A desktop is left as it is.
const fullId = (page: Page) => page.evaluate(() => (document.fullscreenElement ? document.fullscreenElement.id : null));

test('tapping Play on a phone goes full screen, and leaving it sticks until the next Play tap', async ({ page }) => {
  await page.addInitScript(recorderScript);
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('games/tankity/');
  expect(await fullId(page)).toBe(null);
  await page.locator('#title-play').tap();
  await expect.poll(() => fullId(page)).toBe('frame');
  await page.waitForSelector('#shop-veil:not([hidden])');

  // The player leaves full screen: the match does not pull them back.
  await page.evaluate(() => document.exitFullscreen());
  await expect.poll(() => fullId(page)).toBe(null);
  await page.locator('#shop-next').tap();
  await page.waitForTimeout(600);
  expect(await fullId(page)).toBe(null);

  // The next Play tap (from the menu's Play this seed) asks again.
  await page.locator('#btn-menu').tap();
  await page.locator('#new-game').tap();
  await expect.poll(() => fullId(page)).toBe('frame');
  expect(errors).toEqual([]);
});

test('tapping Play with friends on a phone goes full screen', async ({ page }) => {
  await page.addInitScript(recorderScript);
  await page.goto('games/tankity/');
  await page.locator('#rooms-open').tap();
  await expect.poll(() => fullId(page)).toBe('frame');
});

test('clicking Play on a desktop does not ask for full screen', async ({ browser, baseURL }) => {
  const { ctx, page } = await pageOn(browser, baseURL, { viewport: { width: 1280, height: 860 }, hasTouch: false, isMobile: false, deviceScaleFactor: 1 });
  await page.addInitScript(recorderScript);
  await page.goto('games/tankity/');
  await page.locator('#title-play').click();
  await page.waitForSelector('#shop-veil:not([hidden])');
  await page.waitForTimeout(400);
  expect(await fullId(page)).toBe(null);
  await ctx.close();
});
