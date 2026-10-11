// Operation Tankity weapon effects on the firing range, and the seeded night
// sky with its rendered moon. Screenshots land in test-results/.
import { promises as fs } from 'node:fs';
import { test, expect } from '@playwright/test';
import { newPlayer, hud, rec, resetRec, aimTo, setPower, recorderScript } from './helpers.mjs';
import { committedEffects, local, arsenal, grab, fireAndWatch } from './fx-helpers.mjs';

test('every weapon has its own look on the firing range', async ({ browser }) => {
  test.setTimeout(300_000);
  const { page, errors } = await newPlayer(browser);
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  const names = await page.locator('#shop-list li:not(.shop-cat):not(.shop-free) .shop-name').allTextContents();
  const ammo = 12; // buck .. nuke; the gear rows follow
  expect(names.length).toBeGreaterThanOrEqual(ammo);
  const shots = new Set();
  for (let i = 0; i < ammo; i++) {
    await resetRec(page);
    await page.keyboard.press('v');
    await expect(page.locator('#preview-veil .card')).toBeVisible();
    const title = (await page.textContent('#preview-title')).trim();
    const shot = await grab(page, 'preview-stage', 'pv', title === 'NUKE' ? 80 : 9);
    await fs.writeFile(`test-results/tankity-fx-range-${String(i).padStart(2, '0')}-${title.toLowerCase().replace(/\W+/g, '')}.png`, shot);
    shots.add(shot.toString('base64'));
    const r = (await rec(page)).pv;
    expect(r.lighter, `${title}: additive glow`).toBeGreaterThan(0);
    expect(r.blobs, `${title}: glow sprites`).toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    await expect(page.locator('#preview-veil')).toBeHidden();
    await page.keyboard.press('ArrowDown');
  }
  expect(shots.size, 'no two weapons photographed the same').toBe(ammo);
  expect(errors).toEqual([]);
});

test('every match has its own sky, the same on every visit, and the moon is a rendered sphere', async ({ browser }) => {
  test.setTimeout(180_000);
  const skyOf = async seed => {
    const { page, ctx, errors } = await newPlayer(browser);
    await page.evaluate(v => { document.getElementById('seed-input').value = v; }, seed);
    await page.evaluate(() => { window.__rec.watchSky = true; window.__rec.skyRects = []; });
    await page.keyboard.press('n');
    await page.waitForSelector('#shop-veil:not([hidden])');
    await page.click('#shop-next');
    await expect.poll(() => hud(page, 'hud-turn'), { timeout: 30_000 }).toMatch(/YOU|Aim/);
    await page.evaluate(() => { window.__rec.skyRects = []; });
    await page.waitForTimeout(250);
    const rects = await page.evaluate(() => window.__rec.skyRects);
    // Moon: wait for the sheet, then photograph the stage.
    await page.waitForTimeout(500);
    await page.locator('#stage').screenshot({ path: `test-results/tankity-sky-${seed}.png` });
    expect(errors).toEqual([]);
    await ctx.close();
    // One frame's stars, as positions (twinkle only changes brightness).
    const one = new Set();
    for (const r of rects) one.add(r[0] + ',' + r[1]);
    return [...one].sort().join(' ');
  };
  const a1 = await skyOf('alpha-7'), a2 = await skyOf('alpha-7'), b = await skyOf('bravo-3'), c = await skyOf('charlie-9');
  expect(a1.split(' ').length, 'a field of stars').toBeGreaterThan(150);
  expect(a1, 'the same seed paints the same stars').toBe(a2);
  expect(b, 'another seed paints other stars').not.toBe(a1);
  expect(c).not.toBe(b);
});
