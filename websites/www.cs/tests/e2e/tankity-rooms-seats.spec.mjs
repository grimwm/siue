// Operation Tankity rooms: seat modes in the lobby, and leaving a running match.
import { test, expect } from '@playwright/test';
import { roomPair, hud, lastRoom } from './helpers.mjs';

const myTurn = page => hud(page, 'hud-turn').then(t => /YOU\. Aim!/.test(t));
const used = async request => (await (await request.get('games/tankity/rooms.php?action=ping')).json()).rooms.used;
const modes = page => page.locator('#lobby-seats .seat-tile').evaluateAll(ts => ts.map(t => t.getAttribute('data-mode')));

/* Menu, then Leave room, then the in-page question (shot taken when asked). */
async function leaveFromMenu(page, shot) {
  await page.keyboard.press('c');
  await page.click('#menu-leave');
  await expect(page.locator('#leave-veil')).toBeVisible();
  if (shot) await page.screenshot({ path: shot });
  await page.click('#leave-go');
}

test('host opens a seat, the guest sees it, and the match fields only the right tanks', async ({ browser }) => {
  const { host, guest, roomState } = await roomPair(browser, {
    beforeStart: async ({ host, guest }) => {
      // Host sees four tiles with initials and AI, no lives or points.
      const tiles = host.page.locator('#lobby-seats .seat-tile');
      await expect(tiles).toHaveCount(4);
      await expect(tiles.nth(0)).toContainText('ABC');
      await expect(tiles.nth(1)).toContainText('ZED');
      await expect(tiles.nth(2)).toContainText('AI');
      expect(await host.page.locator('#lobby-room').innerText()).not.toMatch(/lives|pts/i);
      // Host flips seat 3 to Open; the guest's own lobby shows it, read-only.
      await tiles.nth(3).click();
      await expect(tiles.nth(3)).toContainText('Open');
      await expect.poll(() => modes(guest.page), { timeout: 10_000 }).toEqual(['human', 'human', 'ai', 'open']);
      await expect(guest.page.locator('#lobby-seats .seat-tile').nth(2)).toHaveAttribute('aria-disabled', 'true');
      await guest.page.locator('#lobby-seats .seat-tile').nth(2).click({ force: true });
      await guest.page.waitForTimeout(2500);
      expect(await modes(guest.page)).toEqual(['human', 'human', 'ai', 'open']);
      await host.page.screenshot({ path: 'test-results/tankity-lobby-seats-host.png' });
      await guest.page.screenshot({ path: 'test-results/tankity-lobby-seats-guest.png' });
    },
  });
  // Seats 0, 1 and 2 field tanks; the open seat 3 fields none.
  const room = lastRoom(roomState.host);
  expect(room.tanks.map(t => t.seat).sort()).toEqual([0, 1, 2]);
  expect(room.seats[3].mode).toBe('open');
  expect(host.errors).toEqual([]);
  expect(guest.errors).toEqual([]);
  await host.ctx.close();
  await guest.ctx.close();
});

test('a guest leaves mid-match from the menu and lands in solo; the host plays on', async ({ browser, request }) => {
  const { host, guest, roomState } = await roomPair(browser);
  const inRooms = await used(request);
  await leaveFromMenu(guest.page, 'test-results/tankity-leave-confirm.png');
  // Solo hills: the room panels are gone and the leave buttons hide again.
  await expect(guest.page.locator('#leave-veil')).toBeHidden();
  await expect(guest.page.locator('#lobby-veil')).toBeHidden();
  await guest.page.keyboard.press('c');
  await expect(guest.page.locator('#menu-leave')).toBeHidden();
  await guest.page.keyboard.press('Escape');
  // A fresh solo match deals in: banner, then the pre-match shop (no room button there).
  await expect(guest.page.locator('#shop-veil')).toBeVisible({ timeout: 15_000 });
  await expect(guest.page.locator('#shop-title')).toHaveText('Pre-match shop');
  await expect(guest.page.locator('#shop-leave')).toBeHidden();
  await guest.page.click('#shop-next');
  // The HUD shows the solo battery, not the room's players.
  await expect.poll(() => hud(guest.page, 'hud-armor'), { timeout: 30_000 }).not.toMatch(/abc/);
  await expect.poll(() => hud(guest.page, 'hud-turn'), { timeout: 30_000 }).toMatch(/YOU\. Aim!|aiming…/);
  // The guest's seat flew to the battery; the room stays for the host.
  await expect.poll(() => lastRoom(roomState.host)?.seats?.[1]?.mode, { timeout: 10_000 }).toBe('ai');
  expect(await used(request)).toBe(inRooms);
  // The host fires and the game keeps turning over (battery, then host again).
  await expect.poll(() => myTurn(host.page), { timeout: 30_000 }).toBe(true);
  await host.page.keyboard.press('Control');
  await expect.poll(() => myTurn(host.page), { timeout: 60_000 }).toBe(true);
  expect(host.errors).toEqual([]);
  expect(guest.errors).toEqual([]);
  await host.ctx.close();
  await guest.ctx.close();
});

test('the host leaves mid-match: the guest keeps playing, the room goes with the last player', async ({ browser, request }) => {
  const { host, guest, roomState } = await roomPair(browser);
  const inRooms = await used(request);
  await leaveFromMenu(host.page);
  await expect(host.page.locator('#lobby-veil')).toBeHidden();
  expect(await used(request)).toBe(inRooms);
  // The host's tank is now a drone, and turns still reach the guest.
  await expect.poll(() => myTurn(guest.page), { timeout: 60_000 }).toBe(true);
  const room = lastRoom(roomState.guest);
  expect(room.seats[0].mode).toBe('ai');
  expect(room.tanks.find(t => t.seat === 0).kind).toBe('ai');
  await guest.page.keyboard.press('Control');
  await expect.poll(() => roomState.guest.flatMap(r => r.events || []).some(e => e.t === 'aifire' && e.seat === 0), { timeout: 30_000 }).toBe(true);
  await expect.poll(() => myTurn(guest.page), { timeout: 60_000 }).toBe(true);
  expect(await used(request)).toBe(inRooms);
  // The last human out closes the room.
  await leaveFromMenu(guest.page);
  await expect.poll(() => used(request), { timeout: 10_000 }).toBe(inRooms - 1);
  expect(host.errors).toEqual([]);
  expect(guest.errors).toEqual([]);
  await host.ctx.close();
  await guest.ctx.close();
});

test('ESC on the leave question means stay, and the match goes on', async ({ browser }) => {
  const { host, guest } = await roomPair(browser);
  // Open the question from the menu, ESC keeps the match.
  await host.page.keyboard.press('c');
  await host.page.click('#menu-leave');
  await expect(host.page.locator('#leave-veil')).toBeVisible();
  await host.page.keyboard.press('Escape');
  await expect(host.page.locator('#leave-veil')).toBeHidden();
  expect(await hud(host.page, 'hud-turn')).toMatch(/YOU|aiming/);
  await host.ctx.close();
  await guest.ctx.close();
});
