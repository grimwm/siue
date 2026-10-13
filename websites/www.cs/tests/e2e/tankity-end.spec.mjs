// Operation Tankity: a solo match played to its end, and the end-of-match veil.
import { test, expect } from '@playwright/test';
import { newPlayer, hud, dealSolo, loseMatch } from './helpers.mjs';

test('a lost match shows the end card: result, scoreboard, score, and Continue back to the title card', async ({ browser }) => {
  test.setTimeout(180_000);
  const { page, errors } = await newPlayer(browser, undefined, { clock: true });
  await dealSolo(page);
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

  // The run filed itself and the card says how it went: always a line, never a blank, and never still "Filing".
  await expect(page.locator('#end-filed')).toBeVisible();
  await expect(page.locator('#end-filed')).toHaveText(/^(Filed ·|Couldn't file your score: )/);

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
  await page.locator('#again').focus();
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

  // Scores: the board switcher at phone width has no sideways scroll, 44 px targets, and works from the keyboard.
  await page.setViewportSize({ width: 393, height: 852 });
  await page.click('#btn-menu');
  await page.click('#scores-open');
  await expect(page.locator('#report-overlay')).toBeVisible();
  await expect(page.locator('#scores-level-normal')).toHaveAttribute('aria-pressed', 'true');
  const sw = await page.evaluate(() => {
    const de = document.documentElement;
    const hs = ['easy', 'normal', 'hard'].map(l => document.getElementById('scores-level-' + l).getBoundingClientRect());
    const o = document.getElementById('report-overlay');
    return { sideways: de.scrollWidth > de.clientWidth || o.scrollWidth > o.clientWidth, minH: Math.min(...hs.map(r => r.height)), minW: Math.min(...hs.map(r => r.width)) };
  });
  expect(sw.sideways).toBe(false);
  expect(sw.minH).toBeGreaterThanOrEqual(44);
  expect(sw.minW).toBeGreaterThanOrEqual(44);
  await page.locator('#scores-level-easy').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#scores-level-easy')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#scores-level-normal')).toHaveAttribute('aria-pressed', 'false');
  expect(errors).toEqual([]);
});
