// Operation Tankity status bar and weapon picker.
import { test, expect } from '@playwright/test';
import { newPlayer, startSolo, hud } from './helpers.mjs';

test('the status bar runs Menu, the aim numbers, AMMO, ARMOR, lives, WIND and the badge, in one row', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await startSolo(page);
  const IDS = ['btn-menu', 'hud-angle', 'hud-power', 'hud-fuel', 'hud-ammo', 'hud-armor', 'hud-lives', 'hud-wind', 'hud-score'];
  const boxes = await page.evaluate(ids => ids.map(id => { const r = document.getElementById(id).getBoundingClientRect(); return [r.left, r.top + r.height / 2]; }), IDS);
  const lefts = boxes.map(b => b[0]);
  expect([...lefts].sort((a, b) => a - b)).toEqual(lefts);
  const mids = boxes.map(b => b[1]);
  expect(Math.max(...mids) - Math.min(...mids)).toBeLessThanOrEqual(1);
  expect(await hud(page, 'hud-lives')).toBe('♥ 3');
  await expect(page.locator('#hud-lives')).toHaveAttribute('aria-label', '3 lives');
  expect(await hud(page, 'hud-armor')).toMatch(/^\d+$/);
  await expect(page.locator('.pill.armor')).toHaveAttribute('aria-label', /^Armor \d+ of \d+, .*REAPER \d+ of \d+/i);
  expect(await hud(page, 'hud-wind')).toMatch(/^(· 0|[←→] \d+)$/);
  expect(await page.locator('#hud-score > span').count()).toBe(3);
  await page.locator('#frame').screenshot({ path: 'test-results/tankity-hud.png' });
  expect(errors).toEqual([]);
});
test('the weapon picker shows the whole rack and loads with keys or clicks', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  await page.keyboard.press('2'); // Mortar
  await page.keyboard.press('3'); // Rail
  await page.click('#shop-next');
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 30_000 }).toMatch(/YOU|Aim/);
  await page.keyboard.press('g');
  const tiles = page.locator('#gun-grid .gun-choice');
  await expect(page.locator('#gun-overlay')).toBeVisible();
  expect(await tiles.count()).toBe(4); // Shell, Buckshot, Mortar, Rail
  await expect(tiles.first()).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('j');
  await page.keyboard.press('Enter');
  await expect(page.locator('#gun-overlay')).toBeHidden();
  expect(await hud(page, 'hud-weapon')).toMatch(/^Mortar /);
  // The Weapons button opens it too; a digit loads that tile.
  await page.click('#btn-weapon');
  await expect(page.locator('#gun-overlay')).toBeVisible();
  await page.locator('#gun-overlay').screenshot({ path: 'test-results/tankity-guns.png' });
  await page.keyboard.press('4');
  expect(await hud(page, 'hud-weapon')).toMatch(/^Rail /);
  // And a click on a tile.
  await page.click('#hud-weapon');
  await page.click('#gun-grid .gun-choice >> nth=0');
  expect(await hud(page, 'hud-weapon')).toMatch(/^Shell /);
  await expect(page.locator('#gun-overlay')).toBeHidden();
  expect(errors).toEqual([]);
});

test('holding the aim keys never changes the status bar or the canvas size', async ({ browser }) => {
  const { page } = await newPlayer(browser);
  await page.setViewportSize({ width: 1180, height: 720 });
  await startSolo(page);
  await page.evaluate(() => {
    window.__sizes = new Set();
    const tick = () => {
      const s = document.getElementById('stage').getBoundingClientRect();
      const h = document.getElementById('hud-bar').getBoundingClientRect();
      window.__sizes.add(`${Math.round(s.bottom)}|${Math.round(h.height)}|${Math.round(h.top)}`);
      requestAnimationFrame(tick);
    };
    tick();
  });
  for (const k of ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight']) {
    await page.keyboard.down(k); await page.waitForTimeout(2200); await page.keyboard.up(k);
  }
  expect(await page.evaluate(() => [...window.__sizes])).toHaveLength(1);
});
