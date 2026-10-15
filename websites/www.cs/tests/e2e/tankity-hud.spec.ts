// Operation Tankity status bar and weapon picker.
import { test, expect } from '@playwright/test';

declare global { interface Window { __sizes: Set<string> } }
import { newPlayer, startSolo, hud } from './helpers.ts';

test('the status bar runs Menu, the aim numbers, AMMO, ARMOR, lives, WIND and the badge, in one row', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await startSolo(page);
  const IDS = ['btn-menu', 'hud-angle', 'hud-power', 'hud-fuel', 'hud-ammo', 'hud-armor', 'hud-lives', 'hud-wind', 'hud-score'];
  const boxes = await page.evaluate(ids => ids.map(id => { const r = document.getElementById(id)!.getBoundingClientRect(); return [r.left, r.top + r.height / 2] as [number, number]; }), IDS);
  const lefts = boxes.map(b => b[0]);
  expect([...lefts].sort((a, b) => a - b)).toEqual(lefts);
  const mids = boxes.map(b => b[1]);
  expect(Math.max(...mids) - Math.min(...mids)).toBeLessThanOrEqual(1);
  expect(await hud(page, 'hud-lives')).toBe('♥ 3');
  await expect(page.locator('#hud-lives')).toHaveAttribute('aria-label', '3 lives');
  expect(await hud(page, 'hud-armor')).toMatch(/^\d+$/);
  await expect(page.locator('.pill.armor')).toHaveAttribute('aria-label', /^Armor \d+ of \d+, .*REAPER \d+ of \d+/i);
  await expect(page.locator('.pill.armor')).toHaveAttribute('title', /^\d+ of \d+$/);
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
  await page.keyboard.press('3'); // EMP
  await page.click('#shop-next');
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 30_000 }).toMatch(/YOU|Aim/);
  await page.keyboard.press('g');
  const tiles = page.locator('#gun-grid .gun-choice');
  await expect(page.locator('#gun-overlay')).toBeVisible();
  // Every gun shows; past Shell, Buckshot, Mortar and EMP none are in stock.
  expect(await tiles.count()).toBeGreaterThan(4);
  expect(await page.locator('#gun-grid .gun-choice:not([aria-disabled="true"])').count()).toBe(4);
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
  expect(await hud(page, 'hud-weapon')).toMatch(/^EMP /);
  // And a click on a tile.
  await page.click('#hud-weapon');
  await page.click('#gun-grid .gun-choice >> nth=0');
  expect(await hud(page, 'hud-weapon')).toMatch(/^Shell /);
  await expect(page.locator('#gun-overlay')).toBeHidden();
  expect(errors).toEqual([]);
});

test('the weapon picker greys out guns with none in stock, and I shows only the ones in stock', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await startSolo(page);
  await page.keyboard.press('g');
  await expect(page.locator('#gun-overlay')).toBeVisible();
  const tiles = page.locator('#gun-grid .gun-choice');
  const all = await tiles.count();
  const empty = page.locator('#gun-grid .gun-choice[aria-disabled="true"]');
  expect(await empty.count()).toBeGreaterThan(0);
  await expect(page.locator('#gun-stock')).toHaveText(/^Show: All/);
  // The cursor walks every tile, greyed ones included.
  const cursorAt = () => tiles.evaluateAll(els => els.findIndex(e => e.classList.contains('cursor')));
  for (let i = 1; i < all; i++) {
    await page.keyboard.press('j');
    expect(await cursorAt()).toBe(i);
  }
  // Enter on a greyed gun loads nothing and says why; the picker stays open.
  const firstEmpty = await tiles.evaluateAll(els => els.findIndex(e => e.getAttribute('aria-disabled') === 'true'));
  for (let i = all - 1; i > firstEmpty; i--) await page.keyboard.press('k');
  expect(await cursorAt()).toBe(firstEmpty);
  await page.keyboard.press('Enter');
  await expect(page.locator('#gun-overlay')).toBeVisible();
  expect(await page.locator('#log').textContent()).toMatch(/None in stock: /);
  expect(await hud(page, 'hud-weapon')).toMatch(/^Shell /);
  // A pointer reaches it too, to read its note, and a click does nothing more.
  await empty.first().hover();
  await expect(empty.first()).toHaveAttribute('title', /None in stock\./);
  await empty.first().click({ force: true }); // Playwright counts aria-disabled as not clickable; a pointer still can
  await expect(page.locator('#gun-overlay')).toBeVisible();
  // I (or the button) shows only the guns in stock, and the choice is remembered.
  await page.keyboard.press('i');
  await expect(page.locator('#gun-stock')).toHaveText(/^Show: In stock/);
  await expect(empty).toHaveCount(0);
  const stocked = await tiles.count();
  expect(stocked).toBeLessThan(all);
  const box = await page.locator('#gun-stock').boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await page.keyboard.press('q');
  await expect(page.locator('#gun-overlay')).toBeHidden();
  await page.reload();
  await startSolo(page);
  await page.keyboard.press('g');
  await expect(page.locator('#gun-stock')).toHaveText(/^Show: In stock/);
  await expect(tiles).toHaveCount(stocked);
  await page.click('#gun-stock');
  await expect(page.locator('#gun-stock')).toHaveText(/^Show: All/);
  await expect(tiles).toHaveCount(all);
  expect(errors).toEqual([]);
});

test('holding the aim keys never changes the status bar or the canvas size', async ({ browser }) => {
  const { page } = await newPlayer(browser);
  await page.setViewportSize({ width: 1180, height: 720 });
  await startSolo(page);
  await page.evaluate(() => {
    window.__sizes = new Set();
    const tick = () => {
      const s = document.getElementById('stage')!.getBoundingClientRect();
      const h = document.getElementById('hud-bar')!.getBoundingClientRect();
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
