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

test('Ctrl alone never starts a match from the card, and Esc works from an initials box', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await expect(page.locator('#title-play')).toBeFocused();
  await page.keyboard.press('Control');
  await page.waitForTimeout(300);
  await expect(page.locator('#title-card')).toBeVisible();
  await expect(page.locator('#shop-veil')).toBeHidden();
  await page.click('#title-initial-2');
  await page.keyboard.press('Escape');
  await expect(page.locator('#menu-overlay')).toBeVisible();
  expect(errors).toEqual([]);
});

// What a finger touches is whatever is on top at the control's centre, so the
// test asks the page, not the control's box: a toolbar over the card fails it.
const topAtCentre = (page, sel) => page.locator(sel).evaluate(el => {
  const r = el.getBoundingClientRect();
  const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  return !!hit && (hit === el || el.contains(hit));
});

for (const [width, height, touch] of [[375, 667, false], [390, 844, true], [844, 390, true]]) {
  test(`on a ${width}x${height} phone every card control is on top, and Settings opens over the card`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('games/tankity/');
    await expect(page.locator('#title-card')).toBeVisible();
    for (const id of ['#title-play', '#rooms-open', '#tutorial-open', '#title-initial-1', '#title-initial-2', '#title-initial-3', '#title-settings']) {
      expect(await topAtCentre(page, id), `${id} is covered at ${width}x${height}`).toBe(true);
    }
    expect(await page.locator('#title-card').evaluate(el => el.scrollHeight > el.clientHeight + 1), 'the card scrolls').toBe(false);
    await page.locator('#title-settings').click();
    await expect(page.locator('#menu-overlay')).toBeVisible();
    expect(await topAtCentre(page, '#menu-close'), 'the menu opens under the card').toBe(true);
    expect(errors).toEqual([]);
    await ctx.close();
  });
}
