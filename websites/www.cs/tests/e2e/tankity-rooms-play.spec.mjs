// Operation Tankity rooms: what players do between and around their turns.
import { test, expect } from '@playwright/test';
import { roomPair, hud, lastRoom } from './helpers.mjs';

const myTurn = page => hud(page, 'hud-turn').then(t => /YOU\. Aim!/.test(t));

test("a player loads a weapon during other players' turns", async ({ browser }) => {
  const { host, guest, roomState } = await roomPair(browser);
  await expect.poll(() => myTurn(host.page), { timeout: 30_000 }).toBe(true);
  await host.page.keyboard.press('Control');
  await expect.poll(() => myTurn(host.page), { timeout: 10_000 }).toBe(false);
  await host.page.keyboard.press('g');
  await host.page.locator('#gun-grid .gun-choice', { hasText: 'Buckshot' }).click();
  await expect.poll(() => hud(host.page, 'hud-weapon')).toMatch(/^Buckshot/);
  await expect.poll(() => lastRoom(roomState.host).you.weapon, { timeout: 10_000 }).toBe('buck');
  expect(await host.page.locator('#log').textContent()).not.toContain('not your turn');
  await host.ctx.close(); await guest.ctx.close();
});

test('a tab that was hidden catches up at once and hands over the controls', async ({ browser }) => {
  const { host, guest } = await roomPair(browser);
  await expect.poll(() => myTurn(host.page), { timeout: 30_000 }).toBe(true);
  // Hide the guest's tab the way a browser does: no frames, document.hidden.
  await guest.page.evaluate(() => {
    window.__held = [];
    window.__hide = true;
    const raf = window.requestAnimationFrame;
    window.requestAnimationFrame = cb => (window.__hide ? window.__held.push(cb) : raf(cb));
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => window.__hide });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await host.page.keyboard.press('Control');
  // While hidden, the host's shot and the drones' volleys pile up for the guest.
  await expect.poll(() => host.page.evaluate(() => document.getElementById('hud-turn').textContent), { timeout: 60_000 }).toMatch(/zed aiming/);
  await guest.page.waitForTimeout(2500); // a poll or two lands while hidden
  const shown = Date.now();
  await guest.page.evaluate(() => {
    window.__hide = false;
    document.dispatchEvent(new Event('visibilitychange'));
    const held = window.__held; window.__held = [];
    held.forEach(cb => requestAnimationFrame(cb));
  });
  await expect.poll(() => myTurn(guest.page), { timeout: 15_000 }).toBe(true);
  expect(Date.now() - shown, 'the guest is not made to sit through every replay').toBeLessThan(8000);
  const a0 = await hud(guest.page, 'hud-angle');
  await guest.page.keyboard.down('ArrowLeft'); await guest.page.waitForTimeout(500); await guest.page.keyboard.up('ArrowLeft');
  expect(await hud(guest.page, 'hud-angle')).not.toBe(a0);
  expect(guest.errors).toEqual([]);
  await host.ctx.close(); await guest.ctx.close();
});

test('everyone sees when the player whose turn it is sits in a menu', async ({ browser }) => {
  const { host, guest, roomState } = await roomPair(browser);
  await expect.poll(() => myTurn(host.page), { timeout: 30_000 }).toBe(true);
  await host.page.keyboard.press('c');
  const hostMenu = () => { const r = lastRoom(roomState.guest); const t = r && r.tanks.find(x => x.seat === 0); return t && t.menu; };
  await expect.poll(hostMenu, { timeout: 10_000 }).toBe(true);
  await guest.page.locator('#stage').screenshot({ path: 'test-results/tankity-menu-badge.png' });
  await host.page.keyboard.press('Escape');
  await expect.poll(hostMenu, { timeout: 10_000 }).toBe(false);
  // The menu never holds up the match: the host can still fire after it.
  await host.page.keyboard.press('Control');
  await expect.poll(() => myTurn(host.page), { timeout: 10_000 }).toBe(false);
  await host.ctx.close(); await guest.ctx.close();
});

test('a room invite made on the site page points back to the site page', async ({ page }) => {
  await page.goto('play/tankity/');
  const game = page.frameLocator('#play-frame');
  await game.locator('#stage').waitFor();
  await page.waitForTimeout(500);
  await page.keyboard.press('o');
  await game.locator('#host-initials').fill('abc');
  await game.locator('#host-go').click();
  await expect(game.locator('#join-link')).toHaveValue(/\/play\/tankity\/\?code=[A-Z0-9]{4}$/);
  // Opening it lands in the site page with the code handed to the game.
  const link = await game.locator('#join-link').inputValue();
  const guest = await page.context().newPage();
  await guest.goto(link);
  await expect(guest.locator('.play-nav')).toBeVisible();
  await expect(guest.frameLocator('#play-frame').locator('#join-code')).toHaveValue(new URL(link).searchParams.get('code'));
});
