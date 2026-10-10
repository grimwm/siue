// Cylon: opening How to Play mid-flight pauses the nuke; closing it resumes.
import { test, expect } from '@playwright/test';

test('How to Play during the intro nuke pauses it, and closing it finishes the intro', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('./?game=cylon');
  const nuke = page.locator('#cylon-nuke-missile');
  await expect(nuke).toHaveClass(/is-flying/, { timeout: 5000 });
  // A player can hit the button while it is still animating in, which
  // Playwright's click would wait out: press it directly.
  await page.evaluate(() => document.getElementById('cylon-help-btn').click());
  await expect(page.locator('#cylon-help')).toBeVisible();
  // Paused: the nuke holds still in the air, and nothing throws.
  const y0 = await nuke.evaluate(el => el.style.top);
  await page.waitForTimeout(800);
  expect(await nuke.evaluate(el => el.style.top)).toBe(y0);
  await expect(nuke).toHaveClass(/is-flying/);
  expect(errors).toEqual([]);
  await page.click('#cylon-help-close');
  // The nuke lands and combat begins.
  await expect(nuke).not.toHaveClass(/is-flying/, { timeout: 10_000 });
  await expect.poll(() => page.evaluate(() => document.body.classList.contains('cylon-intro-hero')), { timeout: 10_000 }).toBe(false);
  expect(errors).toEqual([]);
});
