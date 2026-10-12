// Operation Tankity's start: the title card over the demo, its buttons and
// initials, and the settings-only menu that Esc toggles.
import { test, expect } from '@playwright/test';
import { newPlayer } from './helpers.mjs';

test('the title card greets the player over the demo, and Play deals a solo match', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  const card = page.locator('#title-card');
  await expect(card).toBeVisible();
  await expect(page.locator('#title-play')).toBeFocused();
  for (const id of ['#rooms-open', '#tutorial-open', '#title-settings']) await expect(page.locator(id)).toBeVisible();
  await page.click('#title-play');
  await expect(card).toBeHidden();
  await expect(page.locator('#shop-veil')).toBeVisible({ timeout: 10_000 });
  expect(errors).toEqual([]);
});

test('Esc opens the settings menu over the card and closes it, and focus comes back', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  const menu = page.locator('#menu-overlay');
  await page.keyboard.press('Escape');
  await expect(menu).toBeVisible();
  await expect(page.locator('#menu-close')).toBeFocused();
  await expect(page.locator('#btn-menu')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#menu-h')).toHaveText('Settings');
  await expect(page.locator('#new-game')).toHaveText(/^Play this seed/);
  await expect(page.locator('#scores-open')).toBeVisible();
  await expect(page.locator('#difficulty-picker')).toBeVisible();
  for (const gone of ['#random-run', '#menu-overlay #rooms-open', '#menu-overlay #tutorial-open']) {
    await expect(page.locator(gone)).toHaveCount(0);
  }
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(page.locator('#title-card')).toBeVisible();
  await page.click('#title-settings');
  await expect(menu).toBeVisible();
  await expect(page.locator('#title-settings')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(page.locator('#title-settings')).toBeFocused();
  await expect(page.locator('#title-settings')).toHaveAttribute('aria-expanded', 'false');
  expect(errors).toEqual([]);
});

test('initials: random until chosen, typed in either case, shown and kept uppercase, blocked words refused', async ({ browser }) => {
  const { page, ctx, errors } = await newPlayer(browser);
  const saved = () => page.evaluate(() => localStorage.getItem('tankity-initials'));
  const first = await saved();
  expect(first).toMatch(/^[A-Z]{3}$/);
  await page.reload();
  expect(await saved()).toBe(first);
  await page.click('#title-initial-1');
  await page.keyboard.type('zed');
  await expect.poll(saved).toBe('ZED');
  await expect(page.locator('#title-initial-1')).toHaveValue('Z');
  await expect(page.locator('#title-initial-3')).toHaveValue('D');
  const again = await ctx.newPage();
  await again.goto('games/tankity/');
  await expect(again.locator('#title-initial-2')).toHaveValue('E');
  await page.click('#title-initial-1');
  await page.keyboard.type('ass');
  await expect(page.locator('#title-initials-note')).toContainText('not allowed');
  expect(await saved()).toBe('ZED');
  expect(errors).toEqual([]);
});

test('Play with friends opens the rooms; closing them shows the card again', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await page.click('#rooms-open');
  await expect(page.locator('#lobby-veil')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#lobby-veil')).toBeHidden();
  await expect(page.locator('#title-card')).toBeVisible();
  await page.click('#tutorial-open');
  await expect(page.locator('#title-card')).toBeHidden();
  await expect(page.locator('#shop-veil')).toBeVisible({ timeout: 10_000 });
  expect(errors).toEqual([]);
});
