// Cylon: opening How to Play mid-flight pauses the nuke; closing it resumes.
import { test, expect } from '@playwright/test';

test('How to Play during the intro nuke pauses it, and closing it finishes the intro', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('./?game=cylon');
  const nuke = page.locator('#cylon-nuke-missile');
  await expect(nuke).toHaveClass(/is-flying/, { timeout: 5000 });
  // A player can hit the button while it is still animating in, which
  // Playwright's click would wait out: press it directly.
  await page.evaluate(() => document.getElementById('cylon-help-btn')!.click());
  await expect(page.locator('#cylon-help')).toBeVisible();
  // Paused: the nuke holds still in the air, and nothing throws.
  const y0 = await nuke.evaluate(el => (el as HTMLElement).style.top);
  await page.waitForTimeout(800);
  expect(await nuke.evaluate(el => (el as HTMLElement).style.top)).toBe(y0);
  await expect(nuke).toHaveClass(/is-flying/);
  expect(errors).toEqual([]);
  await page.click('#cylon-help-close');
  // The nuke lands and combat begins.
  await expect(nuke).not.toHaveClass(/is-flying/, { timeout: 10_000 });
  await expect.poll(() => page.evaluate(() => document.body.classList.contains('cylon-intro-hero')), { timeout: 10_000 }).toBe(false);
  expect(errors).toEqual([]);
});

test('Game Off in a browser tab ends the session and leaves the page as it was', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('./?game=cylon');
  await expect(page.locator('#cylon-game-toggle')).toHaveAttribute('aria-pressed', 'true', { timeout: 10_000 });
  await page.locator('#cylon-game-toggle').click();
  await expect(page.locator('#cylon-game-toggle')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#cylon-game-toggle-label')).toHaveText('Game Off');
  await expect(page.locator('#cylon-gameover')).toBeHidden();
  await expect(page.locator('#cylon-exit-hint')).toBeHidden();
  await expect(page.locator('#cylon-exit-hint')).toHaveCount(1);
  expect(errors).toEqual([]);
});
