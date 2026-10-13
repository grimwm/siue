// Operation Tankity rooms: Play again on the end card takes everyone back to the room's lobby.
// Both humans lose all three lives (a lost round each, three times), so the match ends with no winner.
import { test, expect } from '@playwright/test';
import { hud, lastRoom } from './helpers.mjs';
import { endPair, playToOver, phaseOf } from './rooms-end-helpers.mjs';

test('Play again from the end card brings both players to the same lobby, and the host starts a fresh match', async ({ browser }) => {
  test.setTimeout(240_000);
  const pair = await endPair(browser);
  const { host, guest, roomState, code } = pair;
  const start = lastRoom(roomState.guest).you;
  await playToOver(pair);

  // 1. Both see the over card; Q and Esc leave it up and never exit full screen.
  for (const pl of [host, guest]) {
    const veil = pl.page.locator('#end-veil');
    await expect(veil.locator('#end-title')).toContainText('Match over');
    await expect(veil.locator('#again')).toHaveText('Play again (same room)');
    await expect(veil.locator('#end-leave')).toBeVisible();
    await pl.page.evaluate(() => { window.__exits = 0; const x = document.exitFullscreen; document.exitFullscreen = function () { window.__exits++; return x ? x.call(document) : Promise.resolve(); }; });
    await pl.page.keyboard.press('q');
    await expect(veil).toBeVisible();
    await pl.page.keyboard.press('Escape');
    await expect(veil).toBeVisible();
    expect(await pl.page.evaluate(() => window.__exits)).toBe(0);
  }
  // The room table fits both phone shapes: no sideways scroll on the page or inside the table's box, Play again in view.
  for (const size of [{ width: 393, height: 852 }, { width: 852, height: 393 }, { width: 1280, height: 860 }]) {
    await host.page.setViewportSize(size);
    await expect.poll(() => host.page.evaluate(() => {
      const de = document.documentElement, b = document.querySelector('#end-veil .end-board'), r = document.getElementById('again').getBoundingClientRect();
      return { page: de.scrollWidth > de.clientWidth, table: b.scrollWidth > b.clientWidth, shown: r.top >= 0 && r.bottom <= innerHeight };
    }), { message: `room end card at ${size.width}x${size.height}` }).toEqual({ page: false, table: false, shown: true });
  }
  const lastMatch = /goes to the battery|out of lives|for good this time|wins the match/gi;
  const radioBefore = ((await hud(host.page, 'log')) || '').match(lastMatch) || [];
  expect(radioBefore.length, 'the last match left lines to not replay').toBeGreaterThan(0);

  // 2. The guest presses Play again; both land in the lobby of the same room, the host without pressing anything.
  await guest.page.locator('#again').click();
  await expect(guest.page.locator('#lobby-veil')).toBeVisible();
  await expect(guest.page.locator('#lobby-code')).toHaveText(code);
  await expect(guest.page.locator('#end-veil')).toBeHidden();
  await expect(host.page.locator('#lobby-veil')).toBeVisible({ timeout: 5_000 });
  await expect(host.page.locator('#lobby-code')).toHaveText(code);
  await expect(host.page.locator('#end-veil')).toBeHidden();

  // 3. A match poll that was in flight cannot put either end card back over the lobby.
  await guest.page.waitForTimeout(4500);
  for (const pl of [host, guest]) {
    await expect(pl.page.locator('#end-veil')).toBeHidden();
    await expect(pl.page.locator('#lobby-veil')).toBeVisible();
  }

  // 4. Only the host can start: the guest sees "Hang tight", and its start is refused.
  await expect(host.page.locator('#lobby-start')).toBeVisible();
  await expect(guest.page.locator('#lobby-start')).toBeHidden();
  await expect(guest.page.locator('#lobby-status')).toContainText('Hang tight');
  const refused = await guest.page.evaluate(async ({ code, token, csrf }) => {
    const res = await fetch('rooms.php?action=start', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, body: JSON.stringify({ code, token, csrf }) });
    return res.status;
  }, { code, token: guest.token, csrf: [...roomState.guest].reverse().find(r => r.csrf).csrf });
  expect(refused).toBe(403);

  // 5. The host starts: a fresh match for both, every life back, nothing from the last one.
  await host.page.click('#lobby-start');
  await expect.poll(() => phaseOf(roomState, 'guest'), { timeout: 20_000 }).toBe('play');
  for (const pl of [host, guest]) {
    await expect(pl.page.locator('#lobby-veil')).toBeHidden({ timeout: 10_000 });
    await expect(pl.page.locator('#end-veil')).toBeHidden();
    await expect(pl.page.locator('#shop-veil')).toBeHidden();
  }
  await expect.poll(() => hud(host.page, 'hud-lives'), { timeout: 10_000 }).toBe('♥ 3');
  expect(await hud(guest.page, 'hud-lives')).toBe('♥ 3');
  const fresh = lastRoom(roomState.guest);
  expect(fresh.round).toBe(1);
  expect(fresh.you.lives).toBe(3);
  expect(fresh.you.score).toBe(0);
  expect(fresh.you.cash).toBe(start.cash);
  expect(fresh.winBonus).toBe(0);
  expect(fresh.winner ?? null).toBeNull();
  await host.page.waitForTimeout(2500); // a stale card or a replayed event would show by now
  for (const pl of [host, guest]) await expect(pl.page.locator('#end-veil')).toBeHidden();
  expect(((await hud(host.page, 'log')) || '').match(lastMatch) || []).toHaveLength(radioBefore.length);

  expect(host.errors).toEqual([]);
  expect(guest.errors).toEqual([]);
  await host.ctx.close(); await guest.ctx.close();
});
