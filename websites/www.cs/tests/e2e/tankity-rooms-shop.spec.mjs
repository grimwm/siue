// Operation Tankity rooms: the between-rounds shop closes when everyone is
// ready (or after 90 s), and Ready is a toggle until the last player presses it.
import { test, expect } from '@playwright/test';
import { roomPair, lastRoom } from './helpers.mjs';

const shopOpen = page => page.evaluate(() => !document.getElementById('shop-veil').hidden);

/* Where a shell lands: rooms.php's room_sim_shot, ported (gravity 95, wind
   push 2.2, speed 40 + 2.4 * power, fired from 20 px out along the barrel). */
function landing(room, tank, angle, power) {
  const rad = angle * Math.PI / 180;
  const speed = 40 + power * 2.4;
  let x = tank.x + Math.cos(rad) * 20 * tank.dirS, y = tank.y - 14 - Math.sin(rad) * 20;
  let vx = Math.cos(rad) * speed * tank.dirS, vy = -Math.sin(rad) * speed;
  const dt = 1 / 60;
  for (let i = 0; i < 720; i++) {
    vx += room.wind * 2.2 * dt; vy += 95 * dt;
    x += vx * dt; y += vy * dt;
    if (x < -20 || x > 740 || y > 500) return null;
    if (i >= 6 && y >= room.terrain[Math.max(0, Math.min(719, Math.round(x)))]) return x;
  }
  return null;
}

/* The aim whose shell lands closest to the first living drone. */
function bestAim(room, seat) {
  const me = room.tanks.find(t => t.seat === seat);
  const foe = room.tanks.find(t => t.kind === 'ai' && t.hp > 0);
  let best = null;
  for (let a = 10; a <= 170; a++) {
    for (let p = 10; p <= 100; p++) {
      const x = landing(room, me, a, p);
      const miss = x === null ? 1e9 : Math.abs(x - foe.x);
      if (!best || miss < best.miss) best = { angle: a, power: p, miss };
    }
  }
  return best;
}

/* Play both players' turns (straight to the room server, as the keyboard
   would) until the round is won and each sees the shop. */
async function reachShop(host, guest, code, roomState) {
  const seats = [[host, 'host', 0], [guest, 'guest', 1]];
  for (let i = 0; i < 80; i++) {
    if (await shopOpen(host.page) && await shopOpen(guest.page)) return;
    for (const [pl, name, seat] of seats) {
      const room = lastRoom(roomState[name]);
      if (!room || room.phase !== 'play' || room.turn !== seat || !room.csrf) continue;
      const aim = bestAim(room, seat);
      await pl.page.evaluate(async ({ code, token, csrf, angle, power }) => {
        await fetch('rooms.php?action=act', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
          body: JSON.stringify({ code, token, csrf, kind: 'fire', angle, power }),
        });
      }, { code, token: pl.token, csrf: room.csrf, angle: aim.angle, power: aim.power });
    }
    await host.page.waitForTimeout(1500);
  }
  throw new Error('nobody won the round');
}

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
