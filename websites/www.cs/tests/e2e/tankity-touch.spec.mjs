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

  // Keys do nothing: C would open the menu.
  await page.keyboard.press('c');
  await page.waitForTimeout(300);
  await expect(page.locator('#menu-overlay')).toBeHidden();

  // The buttons still work, and no label anywhere names a key.
  await page.locator('#btn-menu').tap();
  await expect(page.locator('#menu-overlay')).toBeVisible();
  const noKeys = async () => {
    const shown = await page.evaluate(() => [...document.querySelectorAll('.key, .nav-hint, .pad-note, .keys-only')]
      .filter(el => el.getClientRects().length > 0).map(el => el.id || el.className));
    expect(shown).toEqual([]);
    const text = await page.evaluate(() => document.body.innerText);
    expect(text).not.toMatch(/\((C|N|ESC|E|M|F|T|O|U|H|L|R|Q|A|D|Ctrl|B|V)\)/);
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
