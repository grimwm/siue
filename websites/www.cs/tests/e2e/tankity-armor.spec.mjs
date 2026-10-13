// Operation Tankity: armor between rounds, as the shop and the ARMOR pill show it.
import { test, expect } from '@playwright/test';
import { newPlayer, dealSolo, hud } from './helpers.mjs';

test('Repair greys out at full armor, a plate raises max and armor, and the pill reads armor of max', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser, undefined, { clock: true });
  await dealSolo(page);
  const row = name => page.locator('#shop-list li', { hasText: name });
  const buy = name => row(name).locator('.acts button').last();
  await expect(row('Repair')).toContainText('Armor full (100 of 100).');
  await expect(buy('Repair')).toBeDisabled();
  await buy('Hull plate').click();
  await expect(row('Hull plate')).toContainText('Max armor 125 (1 fitted)');
  await expect(row('Repair')).toContainText('Armor full (125 of 125).');
  // The page clock is fake, so the HUD only repaints as the test ticks it.
  await expect.poll(async () => {
    await page.clock.runFor(500);
    return [await page.locator('.pill.armor').getAttribute('title'), await hud(page, 'hud-armor')];
  }, { timeout: 5_000 }).toEqual(['125 of 125', '125']);
  await page.click('#shop-next');
  await expect.poll(async () => {
    await page.clock.runFor(1000);
    return page.locator('.pill.armor').getAttribute('title');
  }, { timeout: 10_000 }).toBe('125 of 125');
  expect(errors).toEqual([]);
});
