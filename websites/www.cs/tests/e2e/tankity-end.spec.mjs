// Operation Tankity: a solo match played to its end, and the end-of-match veil.
import { test, expect } from '@playwright/test';
import { newPlayer, hud, aimTo, setPower } from './helpers.mjs';

/* Lose on purpose: the only way a solo match ends is the last life going. Lob
   mortar shells at the lowest power straight up, so they come down on our own
   tank, until the veil opens. Six mortars rarely suffice (a lob can miss), so
   the loop goes on with the free shell. Each lob waits on the HUD for our next turn, never
   on a timer; the page clock is driven by hand (page.clock.runFor) so the
   drones' turns play out in a blink instead of seconds. When our tank falls
   the drones fight on (at triple speed) until one is left; the lost round then
   opens the shop, and the loop starts the next round from it. */
async function loseMatch(page) {
  const veil = page.locator('#end-veil');
  const aiming = async () => {
    await page.clock.runFor(4000);
    // A lost round goes through the shop, after the drones have fought it out.
    if (await page.locator('#shop-veil').isVisible()) await page.click('#shop-next');
    return (await veil.isVisible()) || /Aim/.test(await hud(page, 'hud-turn'));
  };
  for (let shot = 0; shot < 30 && await veil.isHidden(); shot++) {
    await expect.poll(aiming, { timeout: 60_000 }).toBe(true);
    if (await veil.isVisible()) break;
    await aimTo(page, 90);
    await setPower(page, 12);
    await page.keyboard.press('Space');
    // The shot is away once the HUD stops asking for our aim. This looks
    // without turning the clock: a whole volley fits in one runFor.
    await expect.poll(() => hud(page, 'hud-turn'), { timeout: 10_000 }).not.toMatch(/Aim/);
  }
}

test('a lost match shows the end card: result, scoreboard, score, and Continue back to the title card', async ({ browser }) => {
  test.setTimeout(180_000);
  const { page, errors } = await newPlayer(browser, undefined, { clock: true });
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  for (let i = 0; i < 3; i++) await page.keyboard.press('2'); // Mortar: the $600 stake buys three packs, six shells
  await page.click('#shop-next');
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 30_000 }).toMatch(/YOU|Aim/);
  await page.keyboard.press('g');
  await page.locator('#gun-grid .gun-choice', { hasText: 'Mortar' }).click();
  expect(await hud(page, 'hud-weapon')).toMatch(/^Mortar /);
  await expect(page.locator('#end-veil')).toBeHidden();

  await loseMatch(page);

  // The result and the score.
  const veil = page.locator('#end-veil');
  await expect(veil).toBeVisible();
  await expect(veil.locator('#end-kicker')).toHaveText('Match lost');
  await expect(veil.locator('#end-title')).toHaveText('Tank down');
  await expect(veil.locator('#end-text')).toContainText('The tank is scrap');
  await expect(veil.locator('#end-score')).toHaveText(/^Score \d+ · \d+ rounds won · \d+ rounds played · seed \S+$/);
  await veil.locator('.card').screenshot({ path: 'test-results/tankity-end-veil.png' });

  // The scoreboard heads the card; no callsign form, no rematch.
  await expect(veil.locator('.board-table')).toBeVisible();
  await expect(veil.locator('#end-score-form')).toHaveCount(0);
  await expect(veil.locator('#rematch')).toHaveCount(0);
  await expect(veil.locator('#end-leave')).toHaveCount(0);

  // Keyboard: focus lands on Continue, and Esc leaves the card (and fullscreen) alone.
  await expect(page.locator('#again')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(veil).toBeVisible();

  // Both phone shapes: no sideways scroll, and Continue stays in view without scrolling the page.
  for (const size of [{ width: 852, height: 393 }, { width: 393, height: 852 }]) {
    await page.setViewportSize(size);
    const fit = await page.evaluate(() => {
      const r = document.getElementById('again').getBoundingClientRect();
      const de = document.documentElement;
      return { sideways: de.scrollWidth > de.clientWidth, bottom: r.bottom, top: r.top, h: window.innerHeight };
    });
    expect(fit.sideways, `sideways scroll at ${size.width}x${size.height}`).toBe(false);
    expect(fit.top).toBeGreaterThanOrEqual(0);
    expect(fit.bottom).toBeLessThanOrEqual(fit.h);
  }

  // Space presses the focused Continue (it is not the fire key over a card),
  // which goes back to the title card over the demo; Play deals a fresh
  // match: the shop comes back with the result gone, and once the first
  // round starts all three lives are back.
  await expect(page.locator('#again')).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator('#title-card')).toBeVisible();
  await page.click('#title-play');
  await expect.poll(async () => {
    await page.clock.runFor(1000);
    return page.locator('#shop-veil').isVisible();
  }, { timeout: 15_000 }).toBe(true);
  await expect(veil).toBeHidden();
  await page.click('#shop-next');
  await expect.poll(async () => {
    await page.clock.runFor(1000);
    return hud(page, 'hud-turn');
  }, { timeout: 30_000 }).toMatch(/YOU|Aim/);
  expect(await hud(page, 'hud-lives')).toBe('♥ 3');
  await expect(veil).toBeHidden();
  expect(errors).toEqual([]);
});
