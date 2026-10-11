// Operation Tankity rooms: a player who walks out never holds up the ones left.
// Leaving at the shop between rounds: the next round starts without them.
import { test, expect } from '@playwright/test';
import { roomPair, lastRoom } from './helpers.mjs';
import { reachShop } from './rooms-shop-helpers.mjs';

test('when the host leaves at the shop, the players left start the next round on their own', async ({ browser }) => {
  test.setTimeout(300_000);
  const { host, guest, roomState, code } = await roomPair(browser, {
    beforeStart: async ({ host }) => { await host.page.locator('#lobby-seats .seat-tile').nth(3).click(); },
  });
  for (const pl of [host, guest]) {
    pl.page.on('request', r => { const m = r.url().match(/action=state.*[?&]token=([0-9a-f]+)/); if (m) pl.token = m[1]; });
  }
  await expect.poll(() => host.token && guest.token, { timeout: 15_000 }).toBeTruthy();
  await reachShop(host, guest, code, roomState);
  const round = lastRoom(roomState.guest).round;
  await host.page.click('#shop-leave');
  await host.page.click('#leave-go');
  await expect(guest.page.locator('#shop-ready')).toContainText(/^0\/1 ready/, { timeout: 15_000 });
  await guest.page.locator('#shop-next').click();
  await expect.poll(() => lastRoom(roomState.guest).phase, { timeout: 15_000 }).toBe('play');
  expect(lastRoom(roomState.guest).round).toBe(round + 1);
  expect(lastRoom(roomState.guest).seats[0].mode).toBe('ai');
  expect(guest.errors).toEqual([]);
  await host.ctx.close(); await guest.ctx.close();
});

test('when the others are ready and the host leaves the shop, the next round starts at once', async ({ browser }) => {
  test.setTimeout(300_000);
  const { host, guest, roomState, code } = await roomPair(browser, {
    beforeStart: async ({ host }) => { await host.page.locator('#lobby-seats .seat-tile').nth(3).click(); },
  });
  for (const pl of [host, guest]) {
    pl.page.on('request', r => { const m = r.url().match(/action=state.*[?&]token=([0-9a-f]+)/); if (m) pl.token = m[1]; });
  }
  await expect.poll(() => host.token && guest.token, { timeout: 15_000 }).toBeTruthy();
  await reachShop(host, guest, code, roomState);
  const round = lastRoom(roomState.guest).round;
  await guest.page.locator('#shop-next').click(); // ready, waiting on the host
  await expect(guest.page.locator('#shop-ready')).toContainText(/^1\/2 ready/, { timeout: 10_000 });
  await host.page.click('#shop-leave');
  await host.page.click('#leave-go');
  // Nobody is left to wait on: the round starts without another press.
  await expect.poll(() => lastRoom(roomState.guest).phase, { timeout: 15_000 }).toBe('play');
  expect(lastRoom(roomState.guest).round).toBe(round + 1);
  await expect(guest.page.locator('#shop-veil')).toBeHidden({ timeout: 15_000 });
  expect(guest.errors).toEqual([]);
  await host.ctx.close(); await guest.ctx.close();
});
