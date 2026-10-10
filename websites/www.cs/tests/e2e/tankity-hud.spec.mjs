// Operation Tankity status bar, wind gauge, and weapon picker.
import { test, expect } from '@playwright/test';
import { newPlayer, startSolo, hud } from './helpers.mjs';

test('the status bar is one calm row; wind rides the battlefield', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await startSolo(page);
  const tops = await page.locator('.hudbar .hud > div:not(.sr-only)').evaluateAll(els =>
    els.map(e => e.getBoundingClientRect()).filter(r => r.width > 0).map(r => Math.round(r.top + r.height / 2)));
  expect(new Set(tops).size, `row centres ${tops}`).toBe(1);
  const shown = await page.locator('.hudbar').evaluate(el => {
    const out = [];
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) if (!walk.currentNode.parentElement.closest('.sr-only')) out.push(walk.currentNode.textContent);
    return out.join(' ');
  });
  expect(shown).not.toMatch(/reaper:|wraith:|spotter:|1-up|online|offline|Wind/i);
  // Screen readers still get rivals' armor and the wind.
  expect(await hud(page, 'hud-armor')).toMatch(/you \d+ · .*reaper:\d+/);
  expect(await hud(page, 'hud-wind')).toMatch(/^(· 0|[←→] \d+)$/);
  // The gauge paints its yellow arrow (or "calm") just under the menu strip.
  const painted = await page.evaluate(() => {
    const cv = document.getElementById('stage');
    const c = cv.getContext('2d');
    const bar = document.getElementById('menubar').getBoundingClientRect();
    const st = cv.getBoundingClientRect();
    const y0 = Math.round((bar.bottom - st.top) * cv.height / st.height);
    const d = c.getImageData(Math.round(cv.width * 0.38), y0, Math.round(cv.width * 0.24), 50).data;
    let bright = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] > 200 && d[i + 1] > 200) bright++;
    return bright;
  });
  expect(painted).toBeGreaterThan(20);
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

test('the arrow pad sits centred over its label', async ({ browser }) => {
  const { page } = await newPlayer(browser);
  const centre = sel => page.locator(sel).evaluate(el => { const r = el.getBoundingClientRect(); return r.left + r.width / 2; });
  const pad = await centre('.pad-aim .pad-grid');
  const note = await centre('.pad-aim .pad-note');
  const box = await centre('.pad-aim');
  expect(Math.abs(pad - note)).toBeLessThan(1.5);
  expect(Math.abs(pad - box)).toBeLessThan(1.5);
});
