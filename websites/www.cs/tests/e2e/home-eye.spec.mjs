// The scanner eye: it sweeps the bar on the home page, and in The CIC it keeps
// sweeping while its glare beam stays on the player's cursor.
import { test, expect } from '@playwright/test';

const eyeCentre = page => page.evaluate(() => {
  const e = document.getElementById('cylon-eye').getBoundingClientRect();
  return e.left + e.width / 2;
});

test('the home page eye sweeps the bar', async ({ page }) => {
  await page.goto('./');
  await page.waitForSelector('#cylon-eye');
  const xs = [];
  for (let i = 0; i < 6; i++) { xs.push(await eyeCentre(page)); await page.waitForTimeout(250); }
  expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(60);
});

test('in the game the eye keeps sweeping while its glare points at the cursor', async ({ page }) => {
  await page.goto('./?game=cylon');
  await expect.poll(() => page.evaluate(() => document.body.classList.contains('cylon-game-live'))).toBe(true);
  // Let the intro finish, then move the mouse so the eye starts tracking.
  await expect.poll(() => page.evaluate(() => document.body.classList.contains('cylon-intro-hero')), { timeout: 10_000 }).toBe(false);
  const target = { x: 300, y: 520 };
  // Combat begins a beat after the blast; keep nudging the mouse until the
  // eye locks on.
  let nudge = 0;
  await expect.poll(async () => {
    await page.mouse.move(target.x + (nudge++ % 2), target.y);
    return page.evaluate(() => document.getElementById('cylon-glare').classList.contains('is-active'));
  }, { timeout: 15_000 }).toBe(true);
  const ends = [];
  const eyes = [];
  for (let i = 0; i < 8; i++) {
    await page.mouse.move(target.x + i, target.y);
    await page.waitForTimeout(200);
    const s = await page.evaluate(() => {
      const g = document.getElementById('cylon-glare');
      const e = document.getElementById('cylon-eye').getBoundingClientRect();
      const r = g.getBoundingClientRect();
      // The beam's far end: the corner of its box away from the eye.
      const eyeX = e.left + e.width / 2;
      const farX = Math.abs(r.left - eyeX) > Math.abs(r.right - eyeX) ? r.left : r.right;
      return { active: g.classList.contains('is-active'), eyeX, farX, farY: r.bottom, nearY: r.top };
    });
    if (s.active) { ends.push(s); eyes.push(s.eyeX); }
  }
  expect(ends.length, 'the glare switched on while the cursor moved').toBeGreaterThan(4);
  // The eye kept moving...
  expect(Math.max(...eyes) - Math.min(...eyes)).toBeGreaterThan(30);
  // ...while the far end of the beam stayed on the cursor.
  for (const s of ends) {
    expect(Math.abs(s.farY - target.y)).toBeLessThan(12);
    expect(Math.abs(s.farX - target.x)).toBeLessThan(20);
  }
  await page.screenshot({ path: 'test-results/cylon-glare.png' });
});
