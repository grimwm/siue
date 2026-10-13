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
    await expect(btn(p)).toHaveText(/^Ready( N)?$/);
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
  // The shop opens under a populated scoreboard, and on a phone (both ways up)
  // it never scrolls sideways, keeps the highlighted row and Start in sight,
  // and walking to the last row leaves the title and the board where they are.
  const fits = () => host.page.evaluate(() => {
    const inView = r => r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth;
    const sideways = [document.documentElement, document.body, ...document.querySelectorAll('#shop-veil, #shop-veil .card, #shop-veil .board')]
      .some(el => el.scrollWidth > el.clientWidth);
    const sel = document.querySelector('#shop-list li.sel').getBoundingClientRect();
    const list = document.getElementById('shop-list').getBoundingClientRect();
    return {
      sideways,
      rowShown: sel.top >= list.top - 1 && sel.bottom <= list.bottom + 1,
      startShown: inView(document.getElementById('shop-next').getBoundingClientRect()),
      titleShown: inView(document.getElementById('shop-title').getBoundingClientRect()),
      // The board's own box must have room for its title and a line, not just sit at a visible coordinate.
      boardShown: inView(document.querySelector('#shop-veil .board').getBoundingClientRect())
        && document.querySelector('#shop-veil .board').clientHeight >= 48,
    };
  });
  for (const [width, height] of [[393, 852], [852, 393]]) {
    await host.page.setViewportSize({ width, height });
    await expect(host.page.locator('#shop-veil .board .board-table tbody tr')).toHaveCount(2);
    const all = { sideways: false, rowShown: true, startShown: true, titleShown: true, boardShown: true };
    // The resize event reaches the page a moment after the viewport changes.
    await expect.poll(fits, { message: `${width}x${height} on open` }).toEqual(all);
    for (let i = 0; i < 30; i++) await host.page.keyboard.press('ArrowDown');
    expect(await fits(), `${width}x${height} at the last row`).toEqual(all);
    for (let i = 0; i < 30; i++) await host.page.keyboard.press('ArrowUp');
    expect(await fits(), `${width}x${height} at the first row`).toEqual(all);
  }
  await host.page.setViewportSize({ width: 1280, height: 860 });
  await expect(host.page.locator('#log')).toContainText('goes to the battery');
  for (const p of [host.page, guest.page]) await p.locator('#shop-next').click();
  await expect.poll(() => lastRoom(roomState.host).phase, { timeout: 15_000 }).toBe('play');
  expect(lastRoom(roomState.host).round).toBe(round + 1);
  expect(host.errors).toEqual([]);
  expect(guest.errors).toEqual([]);
  await host.ctx.close(); await guest.ctx.close();
});
