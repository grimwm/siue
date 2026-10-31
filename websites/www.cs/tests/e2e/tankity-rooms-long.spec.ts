// Operation Tankity long games: seats that outlive the tab, Your games and its
// turn toast, and the host's turn time reaching everyone.
import { test, expect } from '@playwright/test';
import type { Page, APIRequestContext } from '@playwright/test';
import { roomPair, hud, stateToken } from './helpers.ts';
import { roomView } from './rooms-shop-helpers.ts';

const storedSeat = (page: Page, code: string) => page.evaluate((c: string) => {
  const raw = localStorage.getItem('tankity-seats');
  return raw ? (JSON.parse(raw).seats || []).find((s: { code: string }) => s.code === c) || null : null;
}, code);
const used = async (request: APIRequestContext) => (await (await request.get('games/tankity/rooms.php?action=ping')).json()).rooms.used;

test('the room link brings a closed tab back to its seat', async ({ browser, request }) => {
  test.setTimeout(180_000);
  const { host, guest, code } = await roomPair(browser);
  const seat = await storedSeat(guest.page, code);
  expect(seat && seat.token).toBeTruthy();
  const before = await used(request);
  await guest.page.close();
  expect(await used(request)).toBe(before);

  const page = await guest.ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  const tokens: (string | null)[] = [];
  page.on('request', r => { const t = stateToken(r); if (t !== null) tokens.push(t); });
  await page.goto(`games/tankity/?code=${code}`);
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 30_000 }).toMatch(/ABC aiming|YOU\. Aim!/);
  await expect(page.locator('#join-form')).toBeHidden();
  expect(tokens[0]).toBe(seat.token);
  expect(errors).toEqual([]);
  expect(host.errors).toEqual([]);
  await host.ctx.close(); await guest.ctx.close();
});

test('Step out lists the room, and a turn there raises a toast that goes back in', async ({ browser }) => {
  test.setTimeout(180_000);
  const { host, guest, code } = await roomPair(browser, {
    // One drone (a match needs one), the last seat open: the guest's turn comes round quickly.
    beforeStart: async ({ host: h }) => {
      const tile = h.page.locator('#lobby-seats [data-seat="3"]');
      if ((await tile.getAttribute('data-mode')) === 'ai') await tile.click();
      await expect(tile).toHaveAttribute('data-mode', 'open');
    },
  });
  await guest.page.keyboard.press('q');
  await guest.page.click('#menu-leave');
  await guest.page.click('#leave-step');
  await expect(guest.page.locator('#your-games')).toContainText(code, { timeout: 20_000 });
  await expect(guest.page.locator('#your-games')).toContainText("ABC's turn");
  await host.page.keyboard.press('Control');
  await expect(guest.page.locator('#toast-root')).toContainText(`Your turn in ${code}`, { timeout: 40_000 });
  await guest.page.locator('#toast-root .toast-go').click();
  await expect.poll(() => hud(guest.page, 'hud-turn'), { timeout: 30_000 }).toMatch(/YOU\. Aim!/);
  expect(guest.errors).toEqual([]);
  await host.ctx.close(); await guest.ctx.close();
});

test('a lobby closed with Q while seated is listed in Your games', async ({ browser }) => {
  test.setTimeout(120_000);
  const { host, guest, code } = await roomPair(browser, {
    beforeStart: async ({ guest: g, code: c }) => {
      await g.page.keyboard.press('q');
      await expect(g.page.locator('#lobby-veil')).toBeHidden();
      await expect(g.page.locator('#your-games')).toContainText(`${c} · ABC, ZED · Waiting in the lobby`, { timeout: 20_000 });
      // Open takes it back to the room's lobby.
      await g.page.locator('#your-games .game-open').click();
      await expect(g.page.locator('#lobby-code')).toHaveText(c);
    },
  });
  expect(code).toMatch(/^[A-Z0-9]{6}$/);
  await host.ctx.close(); await guest.ctx.close();
});

test('the host sets the turn time; a mid-game change reaches everyone', async ({ browser }) => {
  test.setTimeout(180_000);
  const { host, guest, roomState } = await roomPair(browser, {
    beforeStart: async ({ host: h, guest: g }) => {
      await h.page.focus('#room-turn');
      await h.page.keyboard.press('ArrowRight');
      await expect(h.page.locator('#lobby-room output')).toHaveText('10 min');
      await expect(g.page.locator('#room-turn-label')).toHaveText('Turn Time: 10 min', { timeout: 10_000 });
    },
  });
  await host.page.keyboard.press('q');
  await expect(host.page.locator('#menu-turn')).toBeVisible();
  await host.page.focus('#menu-turn');
  await host.page.keyboard.press('ArrowRight');
  await host.page.keyboard.press('ArrowRight');
  await expect(host.page.locator('#menu-turn-row output')).toHaveText('8 h');
  for (const p of [host.page, guest.page]) {
    await expect.poll(() => hud(p, 'log'), { timeout: 15_000 }).toMatch(/set the turn time to 8 h, from the next turn/);
  }
  await expect.poll(() => roomView(roomState.guest).turnSecs, { timeout: 10_000 }).toBe(28800);
  await host.page.keyboard.press('q');
  await guest.page.keyboard.press('q');
  await expect(guest.page.locator('#menu-turn-label')).toHaveText('Turn Time: 8 h');
  await host.ctx.close(); await guest.ctx.close();
});
