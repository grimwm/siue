// Operation Tankity: a solo match played to its end, and the end-of-match veil.
import { test, expect } from '@playwright/test';
import { newPlayer, hud, aimTo, setPower } from './helpers.mjs';
import { local } from './fx-helpers.mjs';

/* Lose on purpose: the only way a solo match ends is the last life going. Lob
   mortar shells at the lowest power straight up, so they come down on our own
   tank, until the veil opens. Six mortars rarely suffice (a lob can miss), so
   the loop goes on with the free shell. Each lob waits on the HUD for our next turn, never
   on a timer; the page clock is driven by hand (page.clock.runFor) so the
   drones' turns play out in a blink instead of seconds. */
async function loseMatch(page) {
  const veil = page.locator('#end-veil');
  const aiming = async () => {
    await page.clock.runFor(4000);
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

test('a lost match shows the end veil: result, score, callsign form, and a fresh deal on Play again', async ({ browser, baseURL }) => {
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
  await expect(veil.locator('#rematch')).toBeHidden(); // rematch is for rooms
  await veil.locator('.card').screenshot({ path: 'test-results/tankity-end-veil.png' });

  // The score form: a blank callsign is refused, a typed one is filed. Filing
  // writes a real score, so only the local site gets it; the live leaderboard
  // is left alone.
  const form = page.locator('#end-score-form');
  await expect(form).toBeVisible();
  const send = form.getByRole('button');
  await expect(send).toHaveText('File score');
  await expect(send).toBeEnabled();
  if (local(baseURL)) {
    await page.locator('#end-name').fill('');
    await send.click();
    await expect(send).toHaveText('File score'); // nothing filed without a callsign
    await page.locator('#end-name').fill('e2e-ace');
    const filed = page.waitForResponse(r => r.url().includes('scores.php') && r.request().method() === 'POST');
    await send.click();
    expect((await filed).ok()).toBe(true);
    await expect(send).toHaveText('Filed');
    await expect(send).toBeDisabled();
    expect(await page.evaluate(() => localStorage.getItem('tankity-callsign'))).toBe('e2e-ace');
    await expect(page.locator('#end-name')).toHaveValue('e2e-ace');
  }

  // Play again deals a fresh match: the shop comes back with the result gone
  // at once, and once the first round starts all three lives are back.
  await page.click('#again');
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
  expect(await hud(page, 'hud-lives')).toBe('♥♥♥');
  await expect(veil).toBeHidden();
  expect(errors).toEqual([]);
});
