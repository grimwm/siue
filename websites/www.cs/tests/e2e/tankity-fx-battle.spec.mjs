// Operation Tankity weapon effects on the battlefield: the particle engine
// under real shots, and reduced motion. Screenshots land in test-results/.
import { promises as fs } from 'node:fs';
import { test, expect } from '@playwright/test';
import { newPlayer, hud, rec, resetRec, aimTo, setPower, recorderScript } from './helpers.mjs';
import { committedEffects, local, arsenal, grab, fireAndWatch } from './fx-helpers.mjs';

test('shell, mortar and rail light up the battlefield and the blast disc keeps its radius', async ({ browser }) => {
  test.setTimeout(240_000);
  const { page, errors } = await newPlayer(browser);
  const W = await arsenal(page);
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  await page.keyboard.press('2'); // mortar
  await page.keyboard.press('3'); // rail
  await page.click('#shop-next');
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 30_000 }).toMatch(/YOU|Aim/);
  // Near, steep lobs so every shot lands on the hills (the rail's speed is 140 + 3.2 per power point, so only the lowest power stays close).
  for (const [key, angle, power] of [['shell', 80, 40], ['mortar', 80, 40], ['rail', 80, 10]]) {
    // A shot can fly off the map or be lost to a busy turn: a pack holds two, so allow one retry.
    let r, radii = [];
    for (let attempt = 0; attempt < 2 && !radii.length; attempt++) {
      await expect.poll(() => hud(page, 'hud-turn'), { timeout: 90_000 }).toMatch(/YOU|Aim/);
      // Q loads the next gun; stop on the one the HUD names first.
      for (let i = 0; i < 8 && !(await hud(page, 'hud-weapon')).trim().startsWith(W[key].name); i++) await page.keyboard.press('q');
      await expect(page.locator('#hud-weapon'), `${key} is loaded`).toContainText(W[key].name);
      await aimTo(page, angle);
      await setPower(page, power);
      r = await fireAndWatch(page, key);
      radii = r.rings.filter(p => p[2] === W[key].gfx.blast[1]).map(p => p[1]);
    }
    expect(r.lighter, `${key}: additive glow was drawn`).toBeGreaterThan(0);
    expect(r.blobs, `${key}: soft glow sprites were drawn`).toBeGreaterThan(0);
    // The blast disc is the crater and damage radius: effects never change it.
    const rr = W[key].radius;
    expect(radii.length, `${key}: blast disc drawn (rings seen: ${JSON.stringify([...new Set(r.rings.map(p => p[2] + '@' + Math.round(p[1])))].slice(0, 12))}, sheets ${r.sheets})`).toBeGreaterThan(0);
    expect(Math.max(...radii), `${key}: disc never beyond the blast radius`).toBeLessThanOrEqual(rr + 0.01);
    if (key !== 'rail') expect(Math.max(...radii), `${key}: disc reaches the blast radius`).toBeGreaterThan(rr * 0.9);
  }
  expect(errors).toEqual([]);
});

test('reduced motion thins the effects and drops the screen flash', async ({ browser }) => {
  test.setTimeout(120_000);
  const perFrame = async reduced => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
    await ctx.addInitScript(recorderScript);
    const page = await ctx.newPage();
    await page.goto('games/tankity/');
    await page.waitForTimeout(600);
    await page.keyboard.press('n');
    await page.waitForSelector('#shop-veil:not([hidden])');
    await page.keyboard.press('ArrowDown'); // mortar: a big, busy blast
    await resetRec(page);
    const f0 = (await rec(page)).frame;
    await page.keyboard.press('v');
    await expect.poll(async () => (await rec(page)).pv.sheets, { timeout: 25_000 }).toBeGreaterThan(0);
    await page.waitForTimeout(2500);
    const r = await rec(page);
    await ctx.close();
    return (r.pv.lighter + r.pv.blobs + r.pv.sheets) / Math.max(1, r.frame - f0);
  };
  const full = await perFrame(false);
  const calm = await perFrame(true);
  expect(full, 'normal motion draws effects').toBeGreaterThan(0.2);
  expect(calm, `reduced motion draws fewer (${calm.toFixed(2)} vs ${full.toFixed(2)} per frame)`).toBeLessThan(full * 0.8);
});
