// How the Cylon game plays today on the home page: a KO scores, the grenade
// cools down, stopping a scored run opens the game over panel, and filing
// initials puts the run on the board. Any change to Cylon must keep this green.
import { test, expect } from '@playwright/test';

test('a scored run reaches the board', async ({ page }) => {
  test.setTimeout(60_000);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('./?game=cylon');
  await expect(page.locator('body')).toHaveClass(/cylon-game-live/, { timeout: 30_000 });
  await expect(page.locator('body')).not.toHaveClass(/cylon-intro-hero/, { timeout: 30_000 });

  const score = async () => Number((await page.locator('#cylon-score-value').textContent()) || '0');
  const start = await score();
  const bot = page.locator('.cylon-bot.is-marching').first();
  await expect(bot).toBeVisible({ timeout: 20_000 });
  await bot.dispatchEvent('pointerdown', { pointerType: 'mouse', button: 0, isPrimary: true });
  await expect.poll(score, { timeout: 5_000 }).toBeGreaterThan(start);

  // The button arms the grenade; the next pointerdown anywhere throws it and starts the cooldown.
  await page.locator('#cylon-grenade-btn').click();
  await expect(page.locator('body')).toHaveClass(/cylon-grenade-armed/);
  await page.evaluate(() => {
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0, pointerType: 'mouse', clientX: 300, clientY: 300 }));
  });
  await expect(page.locator('#cylon-grenade-cd')).not.toHaveText('', { timeout: 3_000 });

  const final = await score();
  await page.locator('#cylon-game-toggle').click();
  await expect(page.locator('#cylon-gameover')).toBeVisible({ timeout: 5_000 });
  await page.locator('#cylon-score-submit').click();
  await expect(page.locator('#cylon-gameover-board')).toBeVisible({ timeout: 5_000 });
  // The default initials are what gets filed; the row reads "<n> KOs".
  await expect(page.locator('#cylon-gameover-scores li').filter({ hasText: 'AAA' }).filter({ hasText: `${final} KOs` }).first()).toBeVisible({ timeout: 5_000 });
  expect(errors).toEqual([]);
});
