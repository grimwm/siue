// Operation Tankity rooms: a Leave by one of the last two humans ends the match as a forfeit, the
// remaining human wins and files, Play again then makes them the host, and after leaving the lobby the next solo match has its own card,
// whose filed line says the run is saved in this browser while the score server asks it to wait. A solo run the server
// plays differently (void) ends on a card that says it was not filed.
import { test, expect } from '@playwright/test';
import { dealSolo, hud, lastRoom, loseMatch, newPlayer } from './helpers.mjs';
import { endPair, lobUntil, LOB, WIDE } from './rooms-end-helpers.mjs';

test('when one of the last two humans leaves, the other wins the match; a solo match after it ends on the solo card', async ({ browser }) => {
  test.setTimeout(360_000); // a room match, then a whole solo match lost shot by shot (tankity-end's 180 s on its own)
  const pair = await endPair(browser);
  const { host, guest, roomState } = pair;
  const down = seat => () => { const t = lastRoom(roomState.guest).tanks.find(k => k.seat === seat); return !t || t.hp <= 0; };

  // The host's tank is scrap; the host walks out. The round carries on without them.
  await lobUntil(pair, { host: LOB, guest: WIDE }, down(0));
  await host.page.click('#btn-menu');
  await host.page.click('#menu-leave');
  await host.page.click('#leave-go');
  await expect(host.page.locator('#title-card')).toBeVisible();
  await expect(guest.page.locator('#log')).toContainText(/left|battery/i, { timeout: 10_000 });
  await expect(guest.page.locator('#end-veil')).toBeHidden();

  // The guest's round ends the match: the one human left wins, by forfeit.
  // (If the guest's own shots had already won the round, the shop is open: ready up, the leaver's seat is a bot now.)
  await lobUntil(pair, { guest: LOB }, async () => {
    if (await guest.page.locator('#shop-veil').isVisible()) await guest.page.locator('#shop-next').click();
    return guest.page.evaluate(() => !document.getElementById('end-veil').hidden);
  });
  const veil = guest.page.locator('#end-veil');
  await expect(veil.locator('#end-title')).toContainText('♛ ZED wins');
  await expect(veil.locator('#again')).toHaveText('Play again (same room)');
  const room = lastRoom(roomState.guest);
  expect(room.phase).toBe('over');
  expect(room.winner).toBe(1);
  expect(room.winBonus).toBeGreaterThan(0);
  await expect(veil.locator('.board-table')).toContainText(`+${room.winBonus.toLocaleString('en-US')} win`);
  await expect(veil.locator('#end-filed')).toHaveText(/^Filed · /, { timeout: 10_000 });

  // The host left, so Play again makes the one who stayed the host: Start is theirs. Not wanting another match,
  // they leave from the lobby and land on the title card, not on the finished field.
  await veil.locator('#again').click();
  await expect(guest.page.locator('#lobby-veil')).toBeVisible();
  await expect(guest.page.locator('#lobby-start')).toBeVisible();
  await guest.page.click('#lobby-leave');
  await expect(guest.page.locator('#title-card')).toBeVisible({ timeout: 5_000 });
  await expect(guest.page.locator('#lobby-veil')).toBeHidden();
  await expect(veil).toBeHidden();

  // The next solo match ends on the solo card (Continue, no room buttons), and a run the score server
  // asks to wait for (429) stays saved in this browser and says so.
  await guest.page.clock.install();
  await guest.page.route(/scores\.php/, route => (route.request().method() === 'POST'
    ? route.fulfill({ status: 429, contentType: 'application/json', body: '{"error":"slow down"}' })
    : route.continue()));
  await guest.page.click('#title-play');
  await guest.page.waitForSelector('#shop-veil:not([hidden])');
  for (let i = 0; i < 3; i++) await guest.page.keyboard.press('2');
  await guest.page.click('#shop-next');
  await expect.poll(async () => { await guest.page.clock.runFor(1000); return hud(guest.page, 'hud-turn'); }, { timeout: 30_000 }).toMatch(/YOU|Aim/);
  await guest.page.keyboard.press('g');
  await guest.page.locator('#gun-grid .gun-choice', { hasText: 'Mortar' }).click();
  await loseMatch(guest.page);
  await expect(veil.locator('#again')).toHaveText('Continue');
  await expect(veil.locator('#end-leave')).toHaveCount(0);
  await expect(veil.locator('#end-watch')).toHaveCount(0);
  await expect(veil.locator('#end-filed')).toHaveText(/^Saved in this browser; it files itself when the score server answers\.$/, { timeout: 10_000 });
  expect(host.errors).toEqual([]);
  expect(guest.errors.filter(e => !/429/.test(e))).toEqual([]);
  await host.ctx.close(); await guest.ctx.close();
});

test('a solo run the score server voids ends on a card that says it was not filed', async ({ browser }) => {
  test.setTimeout(240_000); // a whole solo match lost shot by shot, as in tankity-end, on a slow runner too
  const { ctx, page, errors } = await newPlayer(browser, undefined, { clock: true });
  // Every round comes back void, as if the server played it differently; the rest goes to the real server.
  await page.route(/scores\.php/, route => {
    const body = route.request().method() === 'POST' ? route.request().postDataJSON() : null;
    return body && body.op === 'round'
      ? route.fulfill({ status: 422, contentType: 'application/json', body: '{"error":"void"}' })
      : route.continue();
  });
  await dealSolo(page);
  for (let i = 0; i < 3; i++) await page.keyboard.press('2');
  await page.click('#shop-next');
  await expect.poll(async () => { await page.clock.runFor(1000); return hud(page, 'hud-turn'); }, { timeout: 30_000 }).toMatch(/YOU|Aim/);
  await page.keyboard.press('g');
  await page.locator('#gun-grid .gun-choice', { hasText: 'Mortar' }).click();
  await loseMatch(page);
  const veil = page.locator('#end-veil');
  await expect(veil.locator('#again')).toHaveText('Continue');
  await expect(veil.locator('#end-filed')).toHaveText(/^Not filed: /, { timeout: 10_000 });
  expect(errors.filter(e => !/422/.test(e))).toEqual([]);
  await ctx.close();
});
