// Operation Tankity rooms: the between-rounds shop closes when everyone is
// ready (or after 90 s), and Ready is a toggle until the last player presses it.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { roomPair } from './helpers.ts';
import { shopOpen, reachShop, loseRound, roomView, seatedPair } from './rooms-shop-helpers.ts';

test('the shop starts the next round when everyone is ready, and Ready can be taken back until then', async ({ browser }) => {
  test.setTimeout(300_000);
  const { host, guest, roomState, code } = seatedPair(await roomPair(browser, {
    // Seat 3 open: one drone to beat.
    beforeStart: async ({ host }) => { await host.page.locator('#lobby-seats .seat-tile').nth(3).click(); },
  }));
  // Each client's seat token rides on its state polls.
  for (const pl of [host, guest]) {
    pl.page.on('request', r => { const m = r.url().match(/action=state.*[?&]token=([0-9a-f]+)/); if (m) pl.token = m[1]; });
  }
  await expect.poll(() => host.token && guest.token, { timeout: 15_000 }).toBeTruthy();
  await reachShop(host, guest, code, roomState);
  const btn = (p: Page) => p.locator('#shop-next');
  const line = (p: Page) => p.locator('#shop-ready');
  const sentReady: boolean[] = [];
  guest.page.on('request', r => { if (r.url().includes('action=ready')) sentReady.push(JSON.parse(r.postData()!).ready); });

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
  expect(roomView(roomState.host).phase).toBe('shop');

  // A mashed button settles on the last press, in order.
  await btn(host.page).click(); await btn(host.page).click(); await btn(host.page).click();
  await expect(btn(host.page)).toHaveAttribute('aria-pressed', 'true');
  await expect(line(guest.page)).toContainText(/^1\/2 ready/, { timeout: 10_000 });

  // The last player readies: the round starts for both at once.
  const round = roomView(roomState.host).round;
  await btn(guest.page).click();
  await expect.poll(() => roomView(roomState.host).phase, { timeout: 15_000 }).toBe('play');
  expect(roomView(roomState.host).round).toBe(round + 1);
  await expect.poll(() => roomView(roomState.guest).phase, { timeout: 15_000 }).toBe('play');
  for (const p of [host.page, guest.page]) await expect(p.locator('#shop-veil')).toBeHidden();

  // An unready that arrives after the start neither reopens the shop nor
  // un-starts the round; the reply is a plain snapshot, not an error.
  const late = await guest.page.evaluate(async ({ code, token, csrf }: { code: string; token?: string; csrf: string }) => {
    const res = await fetch('rooms.php?action=ready', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      body: JSON.stringify({ code, token, csrf, ready: false }),
    });
    const d = await res.json();
    return { status: res.status, phase: d.room.phase, round: d.room.round };
  }, { code, token: guest.token, csrf: roomView(roomState.guest).csrf });
  expect(late).toEqual({ status: 200, phase: 'play', round: round + 1 });
  await host.page.waitForTimeout(2500);
  expect(await shopOpen(host.page) || await shopOpen(guest.page), 'the shop stays closed').toBe(false);
  expect(roomView(roomState.host).round).toBe(round + 1);
  expect(sentReady, 'the guest sent its one ready, then the late unready').toEqual([true, false]);
  expect(host.errors).toEqual([]);
  expect(guest.errors).toEqual([]);
  await host.ctx.close(); await guest.ctx.close();
});


test('a lost round goes through the shop too: a life gone, then everyone ready starts the next', async ({ browser }) => {
  test.setTimeout(300_000);
  const { host, guest, roomState, code } = seatedPair(await roomPair(browser, {
    beforeStart: async ({ host }) => { await host.page.locator('#lobby-seats .seat-tile').nth(3).click(); },
  }));
  for (const pl of [host, guest]) {
    pl.page.on('request', r => { const m = r.url().match(/action=state.*[?&]token=([0-9a-f]+)/); if (m) pl.token = m[1]; });
  }
  await expect.poll(() => host.token && guest.token, { timeout: 15_000 }).toBeTruthy();
  const round = roomView(roomState.host).round;
  await loseRound(host, guest, code, roomState);
  for (const p of [host.page, guest.page]) await expect(p.locator('#shop-veil')).toBeVisible();
  expect(roomView(roomState.host).you.lives).toBe(2);
  await expect(host.page.locator('#log')).toContainText('goes to the battery');
  // The shop opens under a populated scoreboard. On a phone either way up and
  // on a desktop it never scrolls sideways or past the screen, shows the
  // board's player rows and Start, keeps the highlighted row in its list, and a
  // tap on that row's Preview or Buy lands on the button, not on whatever
  // covers it. Walking the list leaves the title and the board where they are.
  const fits = () => host.page.evaluate(() => {
    const inView = (r: DOMRect) => r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth;
    const within = (r: DOMRect, box: DOMRect) => r.top >= box.top - 1 && r.bottom <= box.bottom + 1;
    const sideways = [document.documentElement, document.body, ...document.querySelectorAll('#shop-veil, #shop-veil .card')]
      .some(el => el.scrollWidth > el.clientWidth);
    const card = document.querySelector('#shop-veil .card')!;
    const board = document.querySelector('#shop-veil .board')!;
    const boardBox = board.getBoundingClientRect();
    const row = document.querySelector('#shop-list li.sel')!;
    const list = document.getElementById('shop-list')!.getBoundingClientRect();
    const tapped = [...row.querySelectorAll('.acts button')].every(b => {
      const r = b.getBoundingClientRect();
      return b.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
    });
    const next = document.getElementById('shop-next')!.getBoundingClientRect();
    const leave = document.getElementById('shop-leave')!.getBoundingClientRect();
    const listEl = document.getElementById('shop-list')!;
    const rowH = Math.max(...[...listEl.querySelectorAll<HTMLElement>('li:not(.shop-cat)')].map(li => li.offsetHeight));
    return {
      sideways,
      // Wide screens put the board beside the list; portrait phones stack them.
      twoColumns: list.left >= boardBox.right,
      // A desktop's list shows several whole rows, not one.
      rows: Math.min(3, Math.floor(listEl.clientHeight / rowH)),
      buttonsSideBySide: Math.abs(next.top - leave.top) < 4 && leave.left >= next.right,
      // The key hints wrap; none is cut off.
      hintsWhole: [...document.querySelectorAll('#nav-shop > span')].every(sp => sp.scrollWidth <= sp.clientWidth + 1),
      cardFits: card.scrollHeight <= card.clientHeight + 1 && inView(card.getBoundingClientRect()),
      rowShown: within(row.getBoundingClientRect(), list),
      tapped,
      startShown: inView(document.getElementById('shop-next')!.getBoundingClientRect()),
      titleShown: inView(document.getElementById('shop-title')!.getBoundingClientRect()),
      boardRowsShown: [...board.querySelectorAll('tbody tr')]
        .every(tr => { const r = tr.getBoundingClientRect(); return within(r, boardBox) && inView(r); }),
    };
  });
  const rows = await host.page.locator('#shop-list li:not(.shop-cat)').count();
  const base = { sideways: false, buttonsSideBySide: true, hintsWhole: true, cardFits: true, rowShown: true, tapped: true, startShown: true, titleShown: true, boardRowsShown: true };
  for (const [width, height, shape] of [[852, 393, { twoColumns: true, rows: 2 }], [393, 852, { twoColumns: false, rows: 1 }], [1280, 720, { twoColumns: true, rows: 3 }]] as const) {
    const all = { ...base, ...shape };
    await host.page.setViewportSize({ width, height });
    await expect(host.page.locator('#shop-veil .board .board-table tbody tr')).toHaveCount(2);
    for (let i = 0; i < rows; i++) await host.page.keyboard.press('ArrowUp');
    await expect(host.page.locator('#shop-list li.sel')).toHaveClass(/shop-free/);
    // The resize event reaches the page a moment after the viewport changes.
    await expect.poll(fits, { message: `${width}x${height} at the first row` }).toEqual(all);
    for (let i = 0; i < rows >> 1; i++) await host.page.keyboard.press('ArrowDown');
    expect(await fits(), `${width}x${height} at the middle row`).toEqual(all);
    for (let i = 0; i < rows; i++) await host.page.keyboard.press('ArrowDown');
    expect(await fits(), `${width}x${height} at the last row`).toEqual(all);
    for (let i = 0; i < rows; i++) await host.page.keyboard.press('ArrowUp');
    await host.page.screenshot({ path: `test-results/tankity-shop-${width}x${height}.png` });
  }
  await host.page.setViewportSize({ width: 1280, height: 860 });
  await expect(host.page.locator('#log')).toContainText('goes to the battery');
  for (const p of [host.page, guest.page]) await p.locator('#shop-next').click();
  await expect.poll(() => roomView(roomState.host).phase, { timeout: 15_000 }).toBe('play');
  expect(roomView(roomState.host).round).toBe(round + 1);
  expect(host.errors).toEqual([]);
  expect(guest.errors).toEqual([]);
  await host.ctx.close(); await guest.ctx.close();
});
