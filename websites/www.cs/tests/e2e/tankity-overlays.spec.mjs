// Operation Tankity overlays: title bars, close buttons, steady sizes, text size.
import { test, expect } from '@playwright/test';
import { newPlayer } from './helpers.mjs';

const CLOSABLE = [
  ['h', 'help-overlay', 'help-close'],
  ['r', 'report-overlay', 'report-close'],
  ['c', 'menu-overlay', 'menu-close'],
  ['l', 'log-overlay', 'log-close'],
];

test('each panel has a title bar whose × closes it and shows ESC', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  for (const [key, ov, x] of CLOSABLE) {
    await page.keyboard.press(key);
    await expect(page.locator('#' + ov)).toBeVisible();
    const close = page.locator(`#${ov} .ov-head #${x}`);
    await expect(close).toBeVisible();
    await expect(close).toContainText('ESC');
    await close.click();
    await expect(page.locator('#' + ov)).toBeHidden();
  }
  // No old-style close buttons anywhere.
  expect(await page.locator('button', { hasText: /^Close/ }).count()).toBe(0);
  expect(errors).toEqual([]);
});

test('a scrolling panel keeps its title bar pinned, keys in one row of three', async ({ browser }) => {
  const { page } = await newPlayer(browser);
  await page.setViewportSize({ width: 1000, height: 640 });
  await page.keyboard.press('h');
  const head = page.locator('#help-overlay .ov-head');
  const cells = page.locator('#nav-help .scroll-keys');
  await expect(cells.first()).toBeVisible();
  const boxes = await cells.evaluateAll(els => els.map(e => e.getBoundingClientRect()).map(r => [r.left, r.top]));
  expect(boxes.length).toBe(3);
  expect(new Set(boxes.map(b => Math.round(b[1]))).size).toBe(1);
  expect(boxes[0][0]).toBeLessThan(boxes[1][0]);
  expect(boxes[1][0]).toBeLessThan(boxes[2][0]);
  const before = await head.boundingBox();
  await page.keyboard.press('PageDown');
  await expect.poll(() => page.locator('#help-overlay').evaluate(el => el.scrollTop)).toBeGreaterThan(50);
  const after = await head.boundingBox();
  expect(Math.abs(after.y - before.y)).toBeLessThan(1);
  await page.screenshot({ path: 'test-results/tankity-help-scrolled.png' });
});

test('the firing range never changes size while it plays', async ({ browser }) => {
  const { page } = await newPlayer(browser);
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  await page.keyboard.press('v');
  const card = page.locator('#preview-veil .card');
  await expect(card).toBeVisible();
  const sizes = new Set();
  let sawResult = false;
  for (let i = 0; i < 70; i++) {
    const b = await card.boundingBox();
    sizes.add(`${Math.round(b.width)}x${Math.round(b.height)}`);
    if ((await page.textContent('#preview-result')).trim()) sawResult = true;
    await page.waitForTimeout(100);
  }
  expect(sawResult, 'a verdict appeared during the run').toBe(true);
  expect([...sizes]).toHaveLength(1);
});

test('text size is a menu setting that this browser remembers', async ({ browser }) => {
  const { page, ctx } = await newPlayer(browser);
  const rootPx = p => p.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
  expect(await rootPx(page)).toBe(16);
  await page.keyboard.press('c');
  await page.click('#text-picker button[title="Huge text"]');
  await expect(page.locator('#text-picker button[title="Huge text"]')).toHaveAttribute('aria-pressed', 'true');
  expect(await rootPx(page)).toBeCloseTo(20.8, 1);
  const again = await ctx.newPage();
  await again.goto('games/tankity/');
  await expect.poll(() => rootPx(again)).toBeCloseTo(20.8, 1);
  await page.click('#text-picker button[title="Normal text"]');
  expect(await rootPx(page)).toBe(16);
});
