// Operation Tankity on a phone: no keyboard, so no keys at all.
import { test, expect, devices } from '@playwright/test';
import { recorderScript } from './helpers.mjs';

test.use({ ...devices['Pixel 7'], channel: 'chrome' });

test('touch screens get no key labels and no key bindings', async ({ page }) => {
  await page.addInitScript(recorderScript);
  const errors = [];
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
  await expect(page.locator('#shop-next')).toHaveText(/^Start round 1$/);
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
const scrollHintsShown = page => page.evaluate(() => [...document.querySelectorAll('.scroll-keys, [data-keyhint^="scroll:"]')]
  .filter(el => el.getClientRects().length > 0).length);
const openHelp = async (page, tap) => {
  const press = loc => (tap ? loc.tap() : loc.click());
  await page.goto('games/tankity/');
  await press(page.locator('#title-settings'));
  await press(page.locator('#new-game'));
  await page.waitForSelector('#shop-veil:not([hidden])');
  await press(page.locator('#shop-next'));
  await press(page.locator('#btn-help'));
  await expect(page.locator('#help-overlay .help')).toBeVisible();
};

/** A page in its own context shaped like `profile` (the file's channel stays). */
async function pageOn(browser, baseURL, profile) {
  const { defaultBrowserType: _ignored, ...opts } = profile;
  const ctx = await browser.newContext({ ...opts, baseURL });
  return { ctx, page: await ctx.newPage() };
}

for (const [name, profile] of [['phone', devices['Pixel 7']], ['tablet', devices['iPad Pro 11 landscape']]]) {
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
const withStylus = page => page.addInitScript(() => {
  const real = window.matchMedia.bind(window);
  window.matchMedia = q => {
    const mql = real(q);
    return /any-pointer:\s*fine/.test(q) ? new Proxy(mql, { get: (t, k) => (k === 'matches' ? true : Reflect.get(t, k) instanceof Function ? Reflect.get(t, k).bind(t) : Reflect.get(t, k)) }) : mql;
  };
});
const startShop = async page => {
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
