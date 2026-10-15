// Operation Tankity's game speed: the FF button under the status bar. Solo,
// a tap cycles 1× → 2× → 4× and the same volley lands in about a half and a
// quarter of the wall time; the pick is kept in the browser. In a room the
// host's pick reaches every player, and a guest sees it but cannot change it.
import { test, expect } from '@playwright/test';
import { newPlayer, hud, roomPair, lastRoom } from './helpers.mjs';

const ff = page => page.locator('#btn-speed');

/* The same first turn every time: a fresh deal of one seed (the same hills,
   wind and drones), the barrel at full power. */
async function seededTurn(page) {
  await page.evaluate(() => { document.getElementById('seed-input').value = 'ff-speed'; });
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  await page.click('#shop-next');
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 90_000 }).toBe('YOU. Aim!');
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(1500); await page.keyboard.up('ArrowUp');
  await expect.poll(async () => Number(await hud(page, 'hud-power'))).toBe(100);
}

/* Fires and answers the wall-clock seconds until the turn passes (the HUD
   stops saying "you fired…"). */
async function volleySeconds(page) {
  const t0 = Date.now();
  await page.keyboard.press('Space');
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 10_000, intervals: [25] }).toBe('you fired…');
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 60_000, intervals: [25] }).not.toBe('you fired…');
  return (Date.now() - t0) / 1000;
}

test('solo: FF cycles 1×, 2×, 4×, plays the same volley that much faster, and is kept', async ({ browser }) => {
  test.setTimeout(240_000);
  const { ctx, page, errors } = await newPlayer(browser);
  await expect(ff(page)).toBeHidden(); // never over the demo
  await seededTurn(page);
  await expect(ff(page)).toBeVisible();
  await expect(ff(page)).toHaveText(/1×/);
  await expect(ff(page)).toHaveAttribute('aria-label', 'Game speed 1×. Tap for 2×.');
  const one = await volleySeconds(page);

  await page.reload();
  await seededTurn(page);
  await ff(page).click();
  await expect(ff(page)).toHaveText(/2×/);
  await expect(page.locator('#speed-live')).toHaveText('Game speed 2×');
  const two = await volleySeconds(page);

  // A new page keeps the pick; the key turns it on.
  await page.reload();
  await seededTurn(page);
  await expect(ff(page)).toHaveText(/2×/);
  await page.keyboard.press('x');
  await expect(ff(page)).toHaveText(/4×/);
  expect(await page.evaluate(() => localStorage.getItem('tankity-speed'))).toBe('4');
  const four = await volleySeconds(page);

  console.log(`volley wall time: 1× ${one.toFixed(2)} s, 2× ${two.toFixed(2)} s, 4× ${four.toFixed(2)} s`);
  expect(one, 'the 1× volley takes a while').toBeGreaterThan(1.5);
  expect(two / one, '2× is about half').toBeLessThan(0.7);
  expect(two / one).toBeGreaterThan(0.3);
  expect(four / one, '4× is about a quarter').toBeLessThan(0.45);

  // A tap from 4× comes back to 1×.
  await ff(page).click();
  await expect(ff(page)).toHaveText(/1×/);
  expect(errors).toEqual([]);
  await ctx.close();
});

test('rooms: the host sets the speed for everyone, and a guest sees it but cannot change it', async ({ browser }) => {
  const { host, guest, roomState } = await roomPair(browser);
  await expect(ff(host.page)).toHaveText(/1×/);
  await expect(ff(guest.page)).toHaveText(/1×/);
  await expect(ff(guest.page)).toHaveAttribute('aria-disabled', 'true');
  await expect(ff(guest.page)).toHaveAttribute('title', /The host sets the room's speed/);

  await ff(host.page).click();
  await expect(ff(host.page)).toHaveText(/2×/);
  await expect(ff(guest.page)).toHaveText(/2×/, { timeout: 15_000 });
  await expect.poll(() => hud(guest.page, 'log'), { timeout: 15_000 }).toMatch(/ABC set the game speed to 2×/);
  await expect.poll(() => hud(host.page, 'log'), { timeout: 15_000 }).toMatch(/ABC set the game speed to 2×/);

  // The guest's tap changes nothing and says why.
  await ff(guest.page).click({ force: true }); // aria-disabled: Playwright would wait for it to be enabled
  await expect.poll(() => hud(guest.page, 'log')).toMatch(/Only the host sets the game speed/);
  await guest.page.waitForTimeout(1500);
  await expect(ff(guest.page)).toHaveText(/2×/);
  await expect.poll(() => (lastRoom(roomState.guest) || {}).speed, { timeout: 10_000 }).toBe(2);

  // The host's key turns it too, mid-match.
  await host.page.keyboard.press('x');
  await expect(ff(guest.page)).toHaveText(/4×/, { timeout: 15_000 });
  expect(host.errors).toEqual([]);
  expect(guest.errors).toEqual([]);
  await host.ctx.close(); await guest.ctx.close();
});
