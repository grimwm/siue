// Operation Tankity rooms: the between-rounds shop closes when everyone is
// ready (or after 90 s), and Ready is a toggle until the last player presses it.
import { test, expect } from '@playwright/test';
import { roomPair, lastRoom } from './helpers.mjs';
import { shopOpen, reachShop, loseRound } from './rooms-shop-helpers.mjs';

test('the shop starts the next round when everyone is ready, and Ready can be taken back until then', async ({ browser }) => {
  test.setTimeout(300_000);
  const { host, guest, roomState, code } = await roomPair(browser, {
    // Seat 3 open: one drone to beat.
    beforeStart: async ({ host }) => { await host.page.locator('#lobby-seats .seat-tile').nth(3).click(); },
  });
  // Each client's seat token rides on its state polls.
  for (const pl of [host, guest]) {
    pl.page.on('request', r => { const m = r.url().match(/action=state.*[?&]token=([0-9a-f]+)/); if (m) pl.token = m[1]; });
  }
  await expect.poll(() => host.token && guest.token, { timeout: 15_000 }).toBeTruthy();
  await reachShop(host, guest, code, roomState);
  const btn = p => p.locator('#shop-next');
  const line = p => p.locator('#shop-ready');
  const sentReady = [];
  guest.page.on('request', r => { if (r.url().includes('action=ready')) sentReady.push(JSON.parse(r.postData()).ready); });

  // Both see Ready, the head count and the clock.
  for (const p of [host.page, guest.page]) {
    await expect(btn(p)).toHaveText(/^Ready( \(N\))?$/);
    await expect(btn(p)).toHaveAttribute('aria-pressed', 'false');
    await expect(line(p)).toContainText(/^0\/2 ready · shop closes in \d:\d\d · ABC {2}ZED/);
  }
    await host.page.locator('#shop-veil .card').screenshot({ path: 'test-results/tankity-shop-ready.png' });

  // One readies: the other sees it, the shop stays. Un-readying takes it back.
  await btn(host.page).click();
  await expect(btn(host.page)).toHaveText(/^Ready ✓/);
  await expect(btn(host.page)).toHaveAttribute('aria-pressed', 'true');
  await expect(line(guest.page)).toContainText(/^1\/2 ready · shop closes in \d:\d\d · ABC ✓ {2}ZED/, { timeout: 10_000 });
  await btn(host.page).click();
  await expect(btn(host.page)).toHaveAttribute('aria-pressed', 'false');
  await expect(line(guest.page)).toContainText(/^0\/2 ready/, { timeout: 10_000 });
  await host.page.waitForTimeout(2500);
  expect(await shopOpen(host.page) && await shopOpen(guest.page), 'the shop stays open').toBe(true);
  expect(lastRoom(roomState.host).phase).toBe('shop');

  // A mashed button settles on the last press, in order.
  await btn(host.page).click(); await btn(host.page).click(); await btn(host.page).click();
  await expect(btn(host.page)).toHaveAttribute('aria-pressed', 'true');
  await expect(line(guest.page)).toContainText(/^1\/2 ready/, { timeout: 10_000 });

  // The last player readies: the round starts for both at once.
  const round = lastRoom(roomState.host).round;
  await btn(guest.page).click();
  await expect.poll(() => lastRoom(roomState.host).phase, { timeout: 15_000 }).toBe('play');
  expect(lastRoom(roomState.host).round).toBe(round + 1);
  await expect.poll(() => lastRoom(roomState.guest).phase, { timeout: 15_000 }).toBe('play');
  for (const p of [host.page, guest.page]) await expect(p.locator('#shop-veil')).toBeHidden();

  // An unready that arrives after the start neither reopens the shop nor
  // un-starts the round; the reply is a plain snapshot, not an error.
  const late = await guest.page.evaluate(async ({ code, token, csrf }) => {
    const res = await fetch('rooms.php?action=ready', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      body: JSON.stringify({ code, token, csrf, ready: false }),
    });
    const d = await res.json();
    return { status: res.status, phase: d.room.phase, round: d.room.round };
  }, { code, token: guest.token, csrf: lastRoom(roomState.guest).csrf });
  expect(late).toEqual({ status: 200, phase: 'play', round: round + 1 });
  await host.page.waitForTimeout(2500);
  expect(await shopOpen(host.page) || await shopOpen(guest.page), 'the shop stays closed').toBe(false);
  expect(lastRoom(roomState.host).round).toBe(round + 1);
  expect(sentReady, 'the guest sent its one ready, then the late unready').toEqual([true, false]);
  expect(host.errors).toEqual([]);
  expect(guest.errors).toEqual([]);
  await host.ctx.close(); await guest.ctx.close();
});


test('a lost round goes through the shop too: a life gone, then everyone ready starts the next', async ({ browser }) => {
  test.setTimeout(300_000);
  const { host, guest, roomState, code } = await roomPair(browser, {
    beforeStart: async ({ host }) => { await host.page.locator('#lobby-seats .seat-tile').nth(3).click(); },
  });
  for (const pl of [host, guest]) {
    pl.page.on('request', r => { const m = r.url().match(/action=state.*[?&]token=([0-9a-f]+)/); if (m) pl.token = m[1]; });
  }
  await expect.poll(() => host.token && guest.token, { timeout: 15_000 }).toBeTruthy();
  const round = lastRoom(roomState.host).round;
  await loseRound(host, guest, code, roomState);
  for (const p of [host.page, guest.page]) await expect(p.locator('#shop-veil')).toBeVisible();
  expect(lastRoom(roomState.host).you.lives).toBe(2);
  await expect(host.page.locator('#log')).toContainText('goes to the battery');
  for (const p of [host.page, guest.page]) await p.locator('#shop-next').click();
  await expect.poll(() => lastRoom(roomState.host).phase, { timeout: 15_000 }).toBe('play');
  expect(lastRoom(roomState.host).round).toBe(round + 1);
  expect(host.errors).toEqual([]);
  expect(guest.errors).toEqual([]);
  await host.ctx.close(); await guest.ctx.close();
});
