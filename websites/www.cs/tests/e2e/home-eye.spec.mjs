// The home page's scanner eye: at rest until the game starts, then hunting.
import { test, expect } from '@playwright/test';

const eyeBox = page => page.evaluate(() => {
  const eye = document.getElementById('cylon-eye').getBoundingClientRect();
  const bar = document.getElementById('cylon-eye').parentElement.getBoundingClientRect();
  return { center: (eye.left + eye.width / 2 - bar.left) / bar.width, width: eye.width / bar.width };
});

test('the eye rests wide open in the middle, then narrows and sweeps once the game starts', async ({ page }) => {
  await page.goto('./');
  await page.waitForSelector('#cylon-eye');
  const a = await eyeBox(page);
  await page.waitForTimeout(1200);
  const b = await eyeBox(page);
  expect(Math.abs(a.center - 0.5)).toBeLessThan(0.01);
  expect(Math.abs(b.center - a.center)).toBeLessThan(0.002); // frozen
  expect(a.width).toBeGreaterThan(0.85);
  await page.screenshot({ path: 'test-results/home-eye-rest.png', clip: { x: 0, y: 0, width: 1280, height: 120 } });

  await page.goto('./?game=cylon');
  await expect.poll(() => page.evaluate(() => document.body.classList.contains('cylon-game-live'))).toBe(true);
  // Narrowing starts from the middle: no jump to an end of the bar.
  const first = await eyeBox(page);
  expect(Math.abs(first.center - 0.5)).toBeLessThan(0.2);
  await page.waitForTimeout(1000);
  const hunting = await eyeBox(page);
  expect(hunting.width).toBeLessThan(0.34);
  const later = [];
  for (let i = 0; i < 6; i++) { await page.waitForTimeout(250); later.push((await eyeBox(page)).center); }
  expect(Math.max(...later) - Math.min(...later)).toBeGreaterThan(0.05); // moving
});
