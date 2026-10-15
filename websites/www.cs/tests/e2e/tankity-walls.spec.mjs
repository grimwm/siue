// Operation Tankity's arena walls. Solo, Settings keeps a Walls pick in the
// browser and the next round plays it: with Rubber, a shot fired at the near
// wall bounces back and comes down on the field. In a room the host picks in
// the lobby (or between rounds) and every player sees the pick and plays it.
import { test, expect } from '@playwright/test';
import { newPlayer, hud, aimTo, setPower, rec, resetRec, shellTrack, roomPair, lastRoom } from './helpers.mjs';

test('solo with Rubber walls: a shot fired at the wall bounces back onto the field', async ({ browser }) => {
  test.setTimeout(240_000);
  const { ctx, page, errors } = await newPlayer(browser);
  await page.keyboard.press('q');
  const tile = name => page.locator('#walls-picker button', { hasText: name });
  await expect(tile('None')).toHaveAttribute('aria-pressed', 'true');
  await tile('Rubber').click();
  await expect(tile('Rubber')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => localStorage.getItem('tankity-walls'))).toBe('rubber');
  await page.keyboard.press('q');
  await expect(page.locator('#menu-overlay')).toBeHidden();

  await page.evaluate(() => { document.getElementById('seed-input').value = 'walls-rubber'; });
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  await page.click('#shop-next');
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 90_000 }).toBe('YOU. Aim!');
  await expect.poll(() => hud(page, 'log')).toMatch(/Round 1\. Wind [^.]*\. Walls: Rubber\./);

  // Away from the drones, at the wall behind the tank: up and back, full power.
  await aimTo(page, 140);
  await setPower(page, 100);
  await resetRec(page);
  await page.keyboard.press('Space');
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 10_000, intervals: [25] }).toBe('you fired…');
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 60_000, intervals: [50] }).not.toBe('you fired…');
  const track = shellTrack((await rec(page)).shells);
  expect(track.length, 'the shell was drawn in flight').toBeGreaterThan(10);
  // It heads for the wall, turns round there, and flies back across the field.
  const out = Math.sign(track[3][0] - track[0][0]);
  const xs = track.map(p => p[0]);
  const turn = out < 0 ? xs.indexOf(Math.min(...xs)) : xs.indexOf(Math.max(...xs));
  expect(turn, 'it turned round in mid-flight').toBeGreaterThan(2);
  expect(turn).toBeLessThan(track.length - 3);
  const wallX = xs[turn];
  if (out < 0) expect(wallX, 'at the left wall, never past it').toBeGreaterThanOrEqual(-0.5);
  const back = xs[xs.length - 1] - wallX;
  expect(back * out, `it came back ${Math.abs(back).toFixed(0)} px onto the field`).toBeLessThan(-40);
  expect(errors).toEqual([]);
  await ctx.close();
});

test('rooms: the host sets Wraparound in the lobby, the guest sees it, and the round plays it', async ({ browser }) => {
  test.setTimeout(180_000);
  const { host, guest, roomState } = await roomPair(browser, {
    async beforeStart({ host, guest }) {
      // The guest sees the room's pick, not buttons.
      await expect(guest.page.locator('#room-walls-label')).toHaveText('Walls: None (the host picks)');
      await expect(guest.page.locator('#room-walls')).toHaveCount(0);
      await host.page.locator('#room-walls button[data-walls="wrap"]').click();
      await expect(host.page.locator('#room-walls button[data-walls="wrap"]')).toHaveAttribute('aria-pressed', 'true');
      await expect(guest.page.locator('#room-walls-label')).toHaveText('Walls: Wraparound (the host picks)', { timeout: 15_000 });
      await expect.poll(() => hud(guest.page, 'log'), { timeout: 15_000 }).toMatch(/ABC set the walls to Wraparound, from the next round\./);
    },
  });
  // The round plays it, on both screens.
  await expect.poll(() => (lastRoom(roomState.guest) || {}).wallsNow, { timeout: 15_000 }).toBe('wrap');
  await expect.poll(() => hud(guest.page, 'log'), { timeout: 15_000 }).toMatch(/Walls: Wraparound\./);
  // Mid-round the host's Walls show as a label: they change between rounds.
  await host.page.keyboard.press('q');
  await expect(host.page.locator('#walls-picker-label')).toHaveText('Walls: Wraparound (the host picks between rounds)');
  await host.page.keyboard.press('q');
  await guest.page.keyboard.press('q');
  await expect(guest.page.locator('#walls-picker-label')).toHaveText('Walls: Wraparound (the host picks)');
  await guest.page.keyboard.press('q');
  expect(host.errors).toEqual([]);
  expect(guest.errors).toEqual([]);
  await host.ctx.close(); await guest.ctx.close();
});
