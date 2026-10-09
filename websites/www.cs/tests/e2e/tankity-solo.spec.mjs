// Operation Tankity, solo, in a real browser.
import { test, expect } from '@playwright/test';
import { newPlayer, startSolo, hud, aimTo, setPower, rec, resetRec } from './helpers.mjs';

test('the keyboard drives the tank and burns fuel', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await startSolo(page);
  const fuel0 = Number(await hud(page, 'hud-fuel'));
  await page.keyboard.down('d');
  await page.waitForTimeout(700);
  await page.keyboard.up('d');
  await page.keyboard.down('a');
  await page.waitForTimeout(700);
  await page.keyboard.up('a');
  expect(Number(await hud(page, 'hud-fuel'))).toBeLessThan(fuel0);
  expect(errors).toEqual([]);
});

test('a tank falls smoothly into the crater under it', async ({ browser }) => {
  const { page } = await newPlayer(browser);
  // A Mortar's wide blast digs under our own hull even when the wind drifts
  // the shell: buy one in the pre-match shop and load it.
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  await page.keyboard.press('2');
  await page.click('#shop-next');
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 30_000 }).toMatch(/YOU|Aim/);
  let best = { drop: 0, moving: 0, maxStep: 0 };
  for (let attempt = 0; attempt < 3 && best.drop <= 1; attempt++) {
    await expect.poll(() => hud(page, 'hud-turn'), { timeout: 60_000 }).toMatch(/YOU|Aim/);
    await page.keyboard.press('3');
    await aimTo(page, 90);
    await setPower(page, 15);
    await resetRec(page);
    await page.keyboard.press('Control');
    await page.waitForTimeout(5000);
    const ys = (await rec(page)).tankY.map(p => p[1]);
    let moving = 0, maxStep = 0;
    for (let i = 1; i < ys.length; i++) {
      const d = ys[i] - ys[i - 1];
      if (d > 0.01) moving++;
      maxStep = Math.max(maxStep, d);
    }
    const drop = ys.length ? ys[ys.length - 1] - ys[0] : 0;
    if (drop > best.drop) best = { drop, moving, maxStep };
  }
  // The old bug moved a tank one small step per turn; what matters is that
  // the fall is spread over frames, however deep the crater.
  expect(best.drop, 'a crater lowered the tank').toBeGreaterThan(1);
  expect(best.moving, 'the fall spans several frames').toBeGreaterThanOrEqual(3);
  expect(best.maxStep, 'no single-frame hop').toBeLessThan(best.drop);
});

test('drones show an aim arm that swings smoothly before firing', async ({ browser }) => {
  const { page } = await newPlayer(browser);
  await startSolo(page);
  await resetRec(page);
  await page.keyboard.press('Control');
  await expect.poll(async () => (await rec(page)).arms.length, { timeout: 30_000 }).toBeGreaterThan(20);
  await page.waitForTimeout(1500);
  const arms = (await rec(page)).arms;
  const byFrame = new Map(arms.map(a => [a[0], a]));
  const angles = [...byFrame.values()].map(([, x0, y0, x1, y1]) => Math.atan2(y0 - y1, Math.abs(x1 - x0)) * 180 / Math.PI);
  const lengths = [...byFrame.values()].map(([, x0, y0, x1, y1]) => Math.hypot(x1 - x0, y1 - y0));
  let maxStep = 0;
  for (let i = 1; i < angles.length; i++) maxStep = Math.max(maxStep, Math.abs(angles[i] - angles[i - 1]));
  expect(maxStep, 'no snapping').toBeLessThan(6);
  for (const l of lengths) expect(l).toBeGreaterThan(13.9), expect(l).toBeLessThan(50.1);
});

test('the menu is a compact card and Menu is the only primary on the navbar', async ({ browser }) => {
  const { page } = await newPlayer(browser);
  await page.keyboard.press('c');
  const card = page.locator('#menu-overlay');
  await expect(card).toBeVisible();
  const frame = await page.locator('#frame').boundingBox();
  const box = await card.boundingBox();
  expect(box.width).toBeLessThan(frame.width * 0.6);
  expect(box.y).toBeGreaterThanOrEqual(frame.y);
  expect(box.y + box.height).toBeLessThanOrEqual(frame.y + frame.height);
  // Buttons inside the card never overlap one another.
  const rects = await page.locator('#menu-overlay button').evaluateAll(bs => bs.map(b => b.getBoundingClientRect()).map(r => [r.left, r.top, r.right, r.bottom]));
  for (let i = 0; i < rects.length; i++) {
    for (let j = i + 1; j < rects.length; j++) {
      const [a, b] = [rects[i], rects[j]];
      const overlap = a[0] < b[2] - 1 && b[0] < a[2] - 1 && a[1] < b[3] - 1 && b[1] < a[3] - 1;
      expect(overlap, `menu buttons ${i} and ${j} overlap`).toBe(false);
    }
  }
  // Gold means primary: only Menu on the navbar, the aim pad stays gold.
  const navbar = await page.locator('.guide-actions button').evaluateAll(bs => bs.map(b => [b.id, getComputedStyle(b).backgroundColor]));
  const gold = navbar.filter(([, bg]) => bg === 'rgb(255, 201, 60)').map(([id]) => id);
  expect(gold).toEqual(['btn-menu']);
  await expect(page.locator('#btn-pause')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/tankity-menu.png' });
  // The footer never repeats the Close button's key.
  expect(await page.textContent('#nav-menu')).not.toMatch(/closes/);
});

test('the unit picker changes the body and remembers it', async ({ browser }) => {
  const { page, ctx } = await newPlayer(browser);
  await page.keyboard.press('c');
  await page.click('#unit-picker button[title=Buggy]');
  await expect(page.locator('#unit-picker button[title=Buggy]')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => localStorage.getItem('tankity-body'))).toBe('buggy');
  const again = await ctx.newPage();
  await again.goto('games/tankity/');
  await again.keyboard.press('c');
  await expect(again.locator('#unit-picker button[title=Buggy]')).toHaveAttribute('aria-pressed', 'true');
});

test('the log hint offers scroll keys only when the log scrolls', async ({ browser }) => {
  const { page } = await newPlayer(browser);
  await page.keyboard.press('l');
  await expect(page.locator('#log-overlay')).toBeVisible();
  const state = await page.evaluate(() => {
    const ov = document.getElementById('log-overlay');
    const keys = document.querySelector('#nav-log .scroll-keys');
    return { scrolls: ov.scrollHeight > ov.clientHeight + 1, shown: getComputedStyle(keys).display !== 'none' };
  });
  expect(state.shown).toBe(state.scrolls);
});
