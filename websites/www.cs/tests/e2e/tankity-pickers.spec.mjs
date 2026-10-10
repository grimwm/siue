// Operation Tankity picture buttons: shop icons, HUD shells, hills tiles, menu toggles.
import { test, expect, devices } from '@playwright/test';
import { newPlayer, hud } from './helpers.mjs';

test('every shop row carries a painted icon, and the HUD shows the loaded shell', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  const icons = page.locator('#shop-list li .shop-icon');
  const rows = await page.locator('#shop-list li .shop-item').count();
  expect(rows).toBeGreaterThanOrEqual(15);
  expect(await icons.count()).toBe(rows);
  const pics = await icons.evaluateAll(els => els.map(el => {
    const c = el.getContext('2d');
    const d = c.getImageData(0, 0, el.width, el.height).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
    return { n, sig: el.toDataURL(), hidden: el.getAttribute('aria-hidden') };
  }));
  for (const p of pics) {
    expect(p.n, 'icon is not blank').toBeGreaterThan(80);
    expect(p.hidden).toBe('true');
  }
  expect(new Set(pics.map(p => p.sig)).size, 'each row has its own picture').toBe(pics.length);
  await page.setViewportSize({ width: 1280, height: 1900 }); // tall enough to see every row
  await page.locator('#shop-list').evaluate(el => { el.style.maxHeight = 'none'; });
  await page.locator('#shop-veil .card').screenshot({ path: 'test-results/tankity-shop-icons.png' });
  await page.setViewportSize({ width: 1280, height: 860 });

  // Buy Buckshot, play on: Q cycles the loaded shell and the HUD icon follows.
  const buck = page.locator('#shop-list li', { hasText: 'Buckshot' });
  await buck.getByRole('button', { name: /^Buy/ }).click();
  await page.click('#shop-next');
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 30_000 }).toMatch(/YOU|Aim/);
  const loaded = () => page.evaluate(() => {
    const chip = document.querySelector('#hud-weapon .chip'); // only the loaded gun shows
    const cv = chip && chip.querySelector('canvas');
    if (!cv) return null;
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let n = 0;
    for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
    return { text: chip.textContent, n, sig: cv.toDataURL() };
  });
  const before = await loaded();
  expect(before.text).toMatch(/^Shell/);
  expect(before.n).toBeGreaterThan(80);
  await page.keyboard.press('q');
  await expect.poll(async () => (await loaded()).text).toMatch(/^Buckshot/);
  const after = await loaded();
  expect(after.sig).not.toBe(before.sig);
  expect(after.n).toBeGreaterThan(80);
  // The words stay in the HUD for readers and tests; the status bar has no favorites row.
  expect(await hud(page, 'hud-weapon')).toMatch(/^Buckshot ×\d+ · also Shell ∞/);
  expect(await page.locator('#hud-favs').count()).toBe(0);
  await page.locator('.hudbar').first().screenshot({ path: 'test-results/tankity-hud-icons.png' });
  expect(errors).toEqual([]);
});

test('the lobby offers Random plus every server map as a silhouette tile, and picking one sets the room map', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  const maps = await (await page.request.get('games/tankity/rooms.php?action=maps')).json();
  expect(maps.ok).toBe(true);
  expect(maps.maps.length).toBeGreaterThanOrEqual(2);
  for (const m of maps.maps) {
    expect(m.profile).toHaveLength(48);
    for (const h of m.profile) { expect(h).toBeGreaterThanOrEqual(0); expect(h).toBeLessThanOrEqual(1); }
  }
  await page.keyboard.press('o');
  const tiles = page.locator('#lobby-map-picker button');
  await expect(tiles).toHaveCount(maps.maps.length + 1);
  const names = await tiles.evaluateAll(els => els.map(e => e.textContent.trim()));
  expect(names).toEqual(['Random hills', ...maps.maps.map(m => m.name)]);
  const pics = await page.locator('#lobby-map-picker canvas').evaluateAll(els => els.map(el => {
    const d = el.getContext('2d').getImageData(0, 0, el.width, el.height).data;
    let green = 0, brown = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i] < 20 && d[i + 1] > 140 && d[i + 2] < 20) green++;
      if (d[i] > 100 && d[i + 1] < 90 && d[i + 2] < 50) brown++;
    }
    return { green, brown, sig: el.toDataURL(), hidden: el.getAttribute('aria-hidden') };
  }));
  for (const p of pics) {
    expect(p.green, 'a grass line is drawn').toBeGreaterThan(30);
    expect(p.brown, 'ground is filled').toBeGreaterThan(100);
    expect(p.hidden).toBe('true');
  }
  expect(new Set(pics.map(p => p.sig)).size, 'every tile is its own picture').toBe(pics.length);
  await expect(tiles.nth(0)).toHaveAttribute('aria-pressed', 'true');

  // Pick hills, host, then change them: the server's room map follows.
  const seen = [];
  page.on('response', async r => {
    if (!r.url().includes('rooms.php')) return;
    try { const b = await r.json(); if (b && b.room) seen.push({ url: r.url(), room: b.room }); } catch (_) { /* not json */ }
  });
  await tiles.nth(2).click();
  await expect(tiles.nth(2)).toHaveAttribute('aria-pressed', 'true');
  await expect(tiles.nth(0)).toHaveAttribute('aria-pressed', 'false');
  await page.fill('#host-initials', 'abc');
  await page.click('#host-go');
  await page.waitForSelector('#lobby-room:not([hidden])');
  await expect.poll(() => seen.at(-1)?.room.map).toBe(maps.maps[1].id);
  await tiles.nth(1).click();
  await expect.poll(() => seen.at(-1)?.room.map).toBe(maps.maps[0].id);
  await expect.poll(() => hud(page, 'lobby-hills')).toContain(maps.maps[0].name);
  await tiles.nth(0).click();
  await expect.poll(() => seen.at(-1)?.room.map).toBeNull();
  await expect.poll(() => hud(page, 'lobby-hills')).toContain('Random hills');
  await tiles.nth(3).click();
  await expect.poll(() => seen.at(-1)?.room.map).toBe(maps.maps[2].id);
  await page.locator('#lobby-veil .card').screenshot({ path: 'test-results/tankity-lobby-tiles.png' });
  expect(errors).toEqual([]);
});

test('menu toggles are icon tiles that flip aria-pressed and keep their keys', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await page.keyboard.press('c');
  await expect(page.locator('#menu-overlay')).toBeVisible();
  const sound = page.locator('#btn-sound');
  const music = page.locator('#btn-music');
  const full = page.locator('#fullscreen');
  for (const t of [sound, music, full]) {
    await expect(t).toBeVisible();
    expect(await t.locator('svg').count()).toBe(1);
    await expect(t.locator('.key')).toBeVisible();
  }
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await expect(music).toHaveAttribute('aria-pressed', 'true');
  await expect(full).toHaveAttribute('aria-pressed', 'false');
  await sound.click();
  await expect(sound).toHaveAttribute('aria-pressed', 'false');
  await expect(music).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('m');
  await expect(music).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('e');
  await expect(sound).toHaveAttribute('aria-pressed', 'true');
  await music.click();
  await expect(music).toHaveAttribute('aria-pressed', 'true');
  // Only one of each on/off glyph shows at a time.
  await sound.click();
  expect(await sound.locator('.on-only').evaluate(e => getComputedStyle(e).display)).toBe('none');
  expect(await sound.locator('.off-only').evaluate(e => getComputedStyle(e).display)).not.toBe('none');
  await sound.click();
  // The unit, text and toggle rows share one grid: same left edge and tile width.
  const edges = await page.evaluate(() => ['unit-picker', 'text-picker', 'toggle-picker'].map(id => {
    const kids = [...document.getElementById(id).children];
    const b = kids[0].getBoundingClientRect();
    return { left: Math.round(b.left), w: Math.round(b.width) };
  }));
  expect(new Set(edges.map(e => e.left)).size, JSON.stringify(edges)).toBe(1);
  expect(new Set(edges.map(e => e.w)).size, JSON.stringify(edges)).toBe(1);
  await page.locator('#menu-overlay').screenshot({ path: 'test-results/tankity-menu-tiles.png' });
  expect(errors).toEqual([]);
});

test('on a touch screen the toggle tiles drop their key caps', async ({ browser }) => {
  const ctx = await browser.newContext({ ...devices['Pixel 7'] });
  const page = await ctx.newPage();
  await page.goto('games/tankity/');
  await expect(page.locator('html')).toHaveClass(/touch/);
  await page.locator('#btn-menu').tap();
  await expect(page.locator('#menu-overlay')).toBeVisible();
  await expect(page.locator('#btn-sound')).toBeVisible();
  await expect(page.locator('#btn-sound .key')).toBeHidden();
  await expect(page.locator('#fullscreen .key')).toBeHidden();
  await page.locator('#btn-sound').tap();
  await expect(page.locator('#btn-sound')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#menu-overlay').screenshot({ path: 'test-results/tankity-menu-tiles-touch.png' });
  await ctx.close();
});
