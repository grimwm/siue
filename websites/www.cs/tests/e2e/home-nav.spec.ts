// The home page nav on a phone: every control stays on screen, none overlaps
// another, each is a thumb-sized box, and the page never scrolls sideways,
// with the game off and with it on. On a wide screen it stays one row.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

interface NavCheck { vw: number; scrollW: number; offScreen: string[]; overlaps: string[]; small: string[]; rows: number }

const checkNav = (page: Page) => page.evaluate((): NavCheck => {
  const vw = innerWidth;
  const name = (el: Element) => el.id || el.className.toString();
  const shown = [...document.querySelectorAll('.site-nav a, .site-nav button, .site-nav .cylon-score')].filter(el => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && Number(cs.opacity) > 0;
  });
  const boxes = shown.map(el => ({ el, r: el.getBoundingClientRect() }));
  const offScreen = boxes.filter(({ r }) => r.left < -0.5 || r.right > vw + 0.5).map(({ el, r }) => `${name(el)} ${Math.round(r.left)}..${Math.round(r.right)}`);
  const overlaps: string[] = [];
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]!, b = boxes[j]!;
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      if (a.r.left < b.r.right - 0.5 && b.r.left < a.r.right - 0.5 && a.r.top < b.r.bottom - 0.5 && b.r.top < a.r.bottom - 0.5) {
        overlaps.push(`${name(a.el)} / ${name(b.el)}`);
      }
    }
  }
  const small = boxes.filter(({ el, r }) => !el.classList.contains('site-brand') && el.matches('a, button') && r.height < 39.5).map(({ el, r }) => `${name(el)} ${Math.round(r.height)}px`);
  // Rows: control midlines more than 6px apart.
  const mids = boxes.map(({ r }) => r.top + r.height / 2).sort((a, b) => a - b);
  const rows = mids.filter((m, i) => i === 0 || m - mids[i - 1]! > 6).length;
  return { vw, scrollW: document.documentElement.scrollWidth, offScreen, overlaps, small, rows };
});

const gameOn = async (page: Page) => {
  await page.goto('./?game=cylon');
  await expect.poll(() => page.evaluate(() => document.body.classList.contains('cylon-nav-combat')), { timeout: 15_000 }).toBe(true);
  await expect.poll(() => page.evaluate(() => document.body.classList.contains('cylon-intro-hero')), { timeout: 15_000 }).toBe(false);
  // The nav fades between its civil and combat looks.
  await expect.poll(() => page.evaluate(() => document.querySelector('.site-nav-inner')!.classList.contains('is-nav-fading'))).toBe(false);
  await expect(page.locator('#site-nav-game')).toHaveCSS('opacity', '1');
  await expect(page.locator('#site-brand')).toHaveCSS('opacity', '1');
};

for (const width of [320, 360, 390, 412]) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 }, hasTouch: true, isMobile: true });

    test('with the game off, every nav control is on screen and tappable', async ({ page }) => {
      await page.goto('./');
      await page.waitForLoadState('load');
      const nav = await checkNav(page);
      expect(nav.rows, 'civil nav rows').toBe(width === 320 ? 3 : 2);
      expect(nav.offScreen, 'controls past the edge').toEqual([]);
      expect(nav.overlaps, 'controls on top of each other').toEqual([]);
      expect(nav.small, 'controls under 40px tall').toEqual([]);
      expect(nav.scrollW).toBeLessThanOrEqual(nav.vw);
      for (const id of ['#site-brand', '#cic-enter-btn', '#cylon-game-toggle', '#theme-toggle']) await expect(page.locator(id)).toBeInViewport({ ratio: 1 });
    });

    test('with the game on, every nav control is on screen and tappable', async ({ page }) => {
      await gameOn(page);
      const nav = await checkNav(page);
      expect(nav.rows, 'combat nav rows').toBe(2);
      expect(nav.offScreen, 'controls past the edge').toEqual([]);
      expect(nav.overlaps, 'controls on top of each other').toEqual([]);
      expect(nav.small, 'controls under 40px tall').toEqual([]);
      expect(nav.scrollW).toBeLessThanOrEqual(nav.vw);
      for (const id of ['#cylon-grenade-btn', '#cylon-raptor-btn', '#cylon-help-btn', '#cylon-game-toggle', '#cylon-settings-toggle']) await expect(page.locator(id)).toBeInViewport({ ratio: 1 });
    });
  });
}

test('on a wide screen the nav stays one row, game off and on', async ({ page }) => {
  await page.goto('./');
  await page.waitForLoadState('load');
  let nav = await checkNav(page);
  expect(nav.rows).toBe(1);
  expect(nav.offScreen).toEqual([]);
  await gameOn(page);
  nav = await checkNav(page);
  expect(nav.rows).toBe(1);
  expect(nav.offScreen).toEqual([]);
  expect(nav.overlaps).toEqual([]);
});
