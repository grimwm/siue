// Operation Tankity rooms: the you're-out card and Menu -> Standings, while the others fight on.
// A real room is played to round 1; the guest's snapshots are then rewritten to say it has no
// lives left, the drone seat is a second living human (a real elimination in a two-human room
// ends the match), and an 'eliminated' event arrives, as in real play. The server's own
// elimination is covered by RoomStandingsTest. Esc on each card never exits full screen.
import { test, expect } from '@playwright/test';
import { roomPair } from './helpers.mjs';

test("a player out of lives sees the you're-out card once; Menu → Standings brings it back, and shows the others Standings", async ({ browser }) => {
  test.setTimeout(90_000);
  const { host, guest } = await roomPair(browser, {
    beforeStart: async ({ host }) => { await host.page.locator('#lobby-seats .seat-tile').nth(3).click(); },
  });
  let out = false, told = false;
  const countExits = page => page.evaluate(() => { window.__exits = 0; const x = document.exitFullscreen; document.exitFullscreen = function () { window.__exits++; return x ? x.call(document) : Promise.resolve(); }; });
  const exits = page => page.evaluate(() => window.__exits);
  await countExits(host.page); await countExits(guest.page);
  await guest.page.route(/rooms\.php/, async route => {
    const res = await route.fetch();
    let body = await res.text();
    try {
      const j = JSON.parse(body);
      if (out && j.room && j.room.you) {
        j.room.you.lives = 0;
        // Seat 3 is a living human, so the host and it are still in: the match goes on.
        for (const s of j.room.seats || []) {
          if (s.seat === j.room.you.seat) s.lives = 0;
          if (s.seat === 3) Object.assign(s, { human: true, bot: false, name: 'FAK', lives: 3 });
        }
        if (!told) {
          told = true;
          // The next seq after the newest real event, so the client's cursor is at most one event ahead.
          let since = 0; // the client's cursor, from the request
          const m = route.request().url().match(/[?&]since=(\d+)/);
          if (m) since = +m[1]; else { try { since = JSON.parse(route.request().postData() || '{}').since || 0; } catch (_) { /* no body */ } }
          const top = Math.max(since, ...(j.room.events || []).map(e => e.seq || 0));
          j.room.events = [...(j.room.events || []), { seq: top + 1, t: 'eliminated', seat: j.room.you.seat }];
        }
        body = JSON.stringify(j);
      }
    } catch (_) { /* not JSON */ }
    await route.fulfill({ response: res, body });
  });
  const gveil = guest.page.locator('#end-veil');
  out = true;
  await expect(gveil).toBeVisible({ timeout: 10_000 });
  await expect(gveil.locator('#end-title')).toHaveText("You're out");
  await expect(gveil.locator('#end-watch')).toHaveText('Watch the finish');
  await expect(gveil.locator('#end-leave')).toBeVisible();
  await expect(guest.page.locator('#log')).toContainText('for good this time'); // the event path, not a reload

  // Watch the finish closes it, and later polls leave it closed.
  await gveil.locator('#end-watch').click();
  await expect(gveil).toBeHidden();
  await guest.page.waitForTimeout(3500);
  await expect(gveil).toBeHidden();

  // Esc closes it the same way; Menu → Standings brings it back as "You're out".
  await guest.page.click('#btn-menu');
  await guest.page.click('#menu-standings');
  await expect(gveil.locator('#end-title')).toHaveText("You're out");
  await guest.page.keyboard.press('Escape');
  await expect(gveil).toBeHidden();
  expect(await exits(guest.page)).toBe(0);

  // The host is still in: Menu → Standings is a look, up across polls until Back to the battle or Esc.
  const hveil = host.page.locator('#end-veil');
  await host.page.click('#btn-menu');
  await host.page.click('#menu-standings');
  await expect(hveil.locator('#end-title')).toHaveText('Standings');
  await expect(hveil.locator('#end-watch')).toHaveText('Back to the battle');
  await expect(hveil.locator('#end-leave')).toBeVisible();
  await host.page.waitForTimeout(3500);
  await expect(hveil).toBeVisible();
  await hveil.locator('#end-watch').click();
  await expect(hveil).toBeHidden();
  await host.page.click('#btn-menu');
  await host.page.click('#menu-standings');
  await expect(hveil).toBeVisible();
  await host.page.keyboard.press('Escape');
  await expect(hveil).toBeHidden();
  expect(await exits(host.page)).toBe(0);

  // Leave room on an end card (the over card's button is the same one) lands on the title card.
  await guest.page.click('#btn-menu');
  await guest.page.click('#menu-standings');
  await expect(gveil.locator('#end-leave')).toBeVisible();
  await gveil.locator('#end-leave').click();
  await expect(guest.page.locator('#title-card')).toBeVisible({ timeout: 5_000 });
  await expect(gveil).toBeHidden();
  expect(host.errors).toEqual([]);
  expect(guest.errors).toEqual([]);
  await host.ctx.close(); await guest.ctx.close();
});
