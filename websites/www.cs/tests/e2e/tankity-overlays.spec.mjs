// Operation Tankity overlays: title bars, close buttons, steady sizes, text size.
import { test, expect } from '@playwright/test';
import { newPlayer } from './helpers.mjs';

const CLOSABLE = [
  ['h', 'help-overlay', 'help-close'],
  ['r', 'report-overlay', 'report-close'],
  ['q', 'menu-overlay', 'menu-close'],
  ['l', 'log-overlay', 'log-close'],
];

test('each panel has a title bar whose × closes it and shows Q, never Esc', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  for (const [key, ov, x] of CLOSABLE) {
    await page.keyboard.press(key);
    await expect(page.locator('#' + ov)).toBeVisible();
    const close = page.locator(`#${ov} .ov-head #${x}`);
    await expect(close).toBeVisible();
    await expect(close).toContainText('Q');
    await expect(close).not.toContainText('Esc');
    await expect(close).toHaveAttribute('title', 'Close (Q)');
    await close.click();
    await expect(page.locator('#' + ov)).toBeHidden();
  }
  // No old-style close buttons anywhere.
  expect(await page.locator('button', { hasText: /^Close/ }).count()).toBe(0);
  expect(errors).toEqual([]);
});

test('a scrolling panel keeps its title bar pinned, keys in one row of three', async ({ browser }) => {
  const { page } = await newPlayer(browser);
  await page.setViewportSize({ width: 1000, height: 640 });
  await page.keyboard.press('h');
  const head = page.locator('#help-overlay .ov-head');
  const cells = page.locator('#nav-help .scroll-keys');
  await expect(cells.first()).toBeVisible();
  const boxes = await cells.evaluateAll(els => els.map(e => e.getBoundingClientRect()).map(r => [r.left, r.top]));
  expect(boxes.length).toBe(3);
  expect(new Set(boxes.map(b => Math.round(b[1]))).size).toBe(1);
  expect(boxes[0][0]).toBeLessThan(boxes[1][0]);
  expect(boxes[1][0]).toBeLessThan(boxes[2][0]);
  const before = await head.boundingBox();
  await page.keyboard.press('PageDown');
  await expect.poll(() => page.locator('#help-overlay').evaluate(el => el.scrollTop)).toBeGreaterThan(50);
  const after = await head.boundingBox();
  expect(Math.abs(after.y - before.y)).toBeLessThan(1);
  await page.screenshot({ path: 'test-results/tankity-help-scrolled.png' });
});

test('the firing range never changes size while it plays', async ({ browser }) => {
  const { page } = await newPlayer(browser);
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  await page.keyboard.press('v');
  const card = page.locator('#preview-veil .card');
  await expect(card).toBeVisible();
  const sizes = new Set();
  let sawResult = false;
  for (let i = 0; i < 70; i++) {
    const b = await card.boundingBox();
    sizes.add(`${Math.round(b.width)}x${Math.round(b.height)}`);
    if ((await page.textContent('#preview-result')).trim()) sawResult = true;
    await page.waitForTimeout(100);
  }
  expect(sawResult, 'a verdict appeared during the run').toBe(true);
  expect([...sizes]).toHaveLength(1);
});

test('text size is a menu setting that this browser remembers', async ({ browser }) => {
  const { page, ctx } = await newPlayer(browser);
  const rootPx = p => p.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
  expect(await rootPx(page)).toBe(16);
  await page.keyboard.press('q');
  await page.click('#text-picker button[title="Huge text"]');
  await expect(page.locator('#text-picker button[title="Huge text"]')).toHaveAttribute('aria-pressed', 'true');
  expect(await rootPx(page)).toBeCloseTo(20.8, 1);
  const again = await ctx.newPage();
  await again.goto('games/tankity/');
  await expect.poll(() => rootPx(again)).toBeCloseTo(20.8, 1);
  await page.click('#text-picker button[title="Normal text"]');
  expect(await rootPx(page)).toBe(16);
});

test('Shift+J and Shift+K scroll half a panel (the browser keeps Ctrl+D and Ctrl+U)', async ({ browser }) => {
  const { page } = await newPlayer(browser);
  await page.setViewportSize({ width: 1000, height: 640 });
  await page.keyboard.press('h');
  const top = () => page.locator('#help-overlay').evaluate(el => el.scrollTop);
  await page.keyboard.press('Shift+J');
  await expect.poll(top).toBeGreaterThan(40);
  const half = await top();
  await page.keyboard.press('Shift+K');
  await expect.poll(top).toBeLessThan(half);
  await expect(page.locator('#nav-help')).toContainText('Shift+K/Shift+J half page');
});

test('the lobby shows the hills first, hosts under the saved initials, then shows only the room', async ({ browser }) => {
  const { page } = await newPlayer(browser);
  await page.keyboard.press('o');
  await expect(page.locator('#lobby-veil')).toBeVisible();
  const box = sel => page.locator(sel).boundingBox();
  const [hills, host] = [await box('#lobby-map-picker'), await box('#host-go')];
  expect(hills.y + hills.height).toBeLessThanOrEqual(host.y);
  const saved = await page.evaluate(() => localStorage.getItem('tankity-initials'));
  const boxes = [1, 2, 3].map(n => page.locator(`#lobby-initial-${n}`));
  for (const [i, b] of boxes.entries()) await expect(b).toHaveValue(saved[i]);
  await expect(page.locator('#host-initials')).toHaveCount(0);
  await page.click('#host-go');
  await expect(page.locator('#lobby-room')).toBeVisible();
  await expect(page.locator('#lobby-rows')).toBeHidden();
  await expect(page.locator('#lobby-initials')).toBeHidden();
  await expect(page.locator('#lobby-intro')).toBeHidden();
  await page.locator('#lobby-veil .card').screenshot({ path: 'test-results/tankity-lobby-hosted.png' });
  // Leaving brings the forms back.
  await page.click('#lobby-leave');
  await expect(page.locator('#lobby-rows')).toBeVisible();
});

test('scrolled panels stay where the player left them when they redraw', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await page.setViewportSize({ width: 1000, height: 500 });
  const top = sel => page.locator(sel).evaluate(el => el.scrollTop);
  // The menu: scroll it, then flip a toggle and the text size (each redraws it).
  await page.keyboard.press('q');
  await page.locator('#menu-overlay').hover();
  // Short of the end: the text size below shrinks the menu, which would clamp a scroll taken to the end.
  await page.mouse.wheel(0, 120);
  await expect.poll(() => top('#menu-overlay')).toBeGreaterThan(20);
  const menuAt = await top('#menu-overlay');
  await page.click('#btn-sound');
  await page.click('#text-picker button:nth-child(2)');
  expect(await top('#menu-overlay')).toBe(menuAt);
  await page.click('#btn-sound');
  await page.keyboard.press('q');
  // Closed and reopened it starts at the top, and a redraw keeps it there.
  await page.keyboard.press('q');
  await expect(page.locator('#menu-overlay')).toBeVisible();
  await page.click('#btn-sound');
  expect(await top('#menu-overlay')).toBe(0);
  await page.click('#btn-sound');
  await page.keyboard.press('q');
  // The lobby: the veil scrolls; the status line changing redraws it.
  await page.setViewportSize({ width: 420, height: 700 });
  await page.keyboard.press('o');
  await expect(page.locator('#lobby-veil')).toBeVisible();
  await page.locator('#lobby-veil').hover();
  await page.mouse.wheel(0, 400);
  await expect.poll(() => top('#lobby-veil')).toBeGreaterThan(20);
  const lobbyAt = await top('#lobby-veil');
  await page.fill('#join-code', '!!!!!!'); // six characters, but not a room code
  await page.keyboard.press('Enter'); // the status line says so: a redraw
  await expect(page.locator('#lobby-status')).toContainText('6 letters or digits');
  expect(await top('#lobby-veil')).toBe(lobbyAt);
  expect(errors).toEqual([]);
});

test('Menu → Quit ends the match and returns to the title card in a browser tab', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await page.click('#title-play');
  await page.waitForSelector('#shop-veil:not([hidden])');
  await expect(page.locator('#title-card')).toBeHidden();
  await page.evaluate(() => document.getElementById('btn-menu').click());
  await expect(page.locator('#menu-overlay')).toBeVisible();
  await page.evaluate(() => document.getElementById('menu-quit').click());
  await expect(page.locator('#menu-overlay')).toBeHidden();
  await expect(page.locator('#shop-veil')).toBeHidden();
  await expect(page.locator('#title-card')).toBeVisible();
  await expect(page.locator('#log-overlay')).toContainText('You left the match.');
  await expect(page.locator('#log-overlay')).not.toContainText('Swipe the app away');
  expect(errors).toEqual([]);
});

/* The Sound and Music sliders. Records the two buses (the gains wired to the
   destination: sound first, then music) so a test reads what the speakers get. */
function busProbe() {
  window.__buses = [];
  const connect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (to, ...a) {
    if (this instanceof GainNode && to instanceof AudioDestinationNode && !window.__buses.includes(this)) window.__buses.push(this);
    return connect.call(this, to, ...a);
  };
}
async function volumePlayer(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, serviceWorkers: 'block' });
  await ctx.addInitScript(busProbe);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('games/tankity/');
  await page.waitForTimeout(600);
  return { ctx, page, errors };
}
const bus = (page, i) => page.evaluate(n => (window.__buses[n] ? window.__buses[n].gain.value : null), i);
const SOUND = 0, MUSIC = 1, HEADROOM = 0.4;

test('the music slider is remembered; mute zeroes the bus and unmute brings the level back', async ({ browser }) => {
  const { ctx, page, errors } = await volumePlayer(browser);
  await page.keyboard.press('q'); // the key press is the gesture that starts the audio
  await expect(page.locator('#menu-overlay')).toBeVisible();
  const slider = page.locator('#vol-music');
  await expect(slider).toHaveValue('80');
  await expect(slider).toHaveAttribute('aria-valuetext', 'Music 80%');
  await slider.fill('30');
  await expect(page.locator('output[for="vol-music"]')).toHaveText('30%');
  await expect(slider).toHaveAttribute('aria-valuetext', 'Music 30%');
  await expect.poll(() => bus(page, MUSIC)).toBeCloseTo(0.09 * HEADROOM, 5);

  // The arrow keys move a focused slider; M mutes from it; Q still leaves the menu.
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveValue('31');
  await page.keyboard.press('ArrowLeft');
  await expect(slider).toHaveValue('30');
  await page.keyboard.press('m');
  await expect(page.locator('#btn-music')).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => bus(page, MUSIC)).toBe(0);
  await expect(slider).toHaveValue('30');
  await page.locator('#btn-music').click();
  await expect(page.locator('#btn-music')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => bus(page, MUSIC)).toBeCloseTo(0.09 * HEADROOM, 5);
  await expect(slider).toHaveValue('30');
  await slider.focus();
  await page.keyboard.press('q');
  await expect(page.locator('#menu-overlay')).toBeHidden();

  // Sound is its own bus: the toggle mutes it and the slider's level returns.
  await page.keyboard.press('q');
  await page.locator('#vol-sound').fill('50');
  await expect.poll(() => bus(page, SOUND)).toBeCloseTo(0.25, 5);
  await page.locator('#btn-sound').click();
  await expect.poll(() => bus(page, SOUND)).toBe(0);
  await page.locator('#btn-sound').click();
  await expect.poll(() => bus(page, SOUND)).toBeCloseTo(0.25, 5);

  // Mute the music, reload: the level and the mute are both still there.
  await page.locator('#btn-music').click();
  await page.reload();
  await page.waitForTimeout(600);
  await page.keyboard.press('q');
  await expect(page.locator('#vol-music')).toHaveValue('30');
  await expect(page.locator('#vol-sound')).toHaveValue('50');
  await expect(page.locator('#btn-music')).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('#btn-sound')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => bus(page, MUSIC)).toBe(0);
  await page.locator('#btn-music').click();
  await expect.poll(() => bus(page, MUSIC)).toBeCloseTo(0.09 * HEADROOM, 5);
  expect(errors).toEqual([]);
  await ctx.close();
});

const VOLUME_SCREENS = [['phone 320', 320, 640, true], ['phone 393', 393, 852, true], ['tablet', 820, 1180, true], ['desktop', 1280, 800, false]];
for (const [name, width, height, touch] of VOLUME_SCREENS) {
  test(`the volume rows fit their controls on a ${name}, with thumb-sized targets on touch`, async ({ browser }) => {
    test.setTimeout(40_000);
    const { ctx, page } = await volumePlayer(browser);
    await page.setViewportSize({ width, height });
    await page.keyboard.press('q');
    await expect(page.locator('#menu-overlay')).toBeVisible();
    // Huge text on the narrowest phone overflows the menu's older rows too; the volume rows are held to it from 393 up.
    for (const text of width >= 393 ? ['xl', 'm'] : ['m']) {
      await page.evaluate(t => { document.documentElement.style.fontSize = t === 'xl' ? '130%' : '100%'; }, text);
      await page.locator('#vol-music').scrollIntoViewIfNeeded();
      await page.locator('#vol-music').fill('100'); // the widest percent
      const probs = await page.evaluate(() => {
        const out = [];
        for (const row of document.querySelectorAll('#menu-overlay .vol-row')) {
          const r = row.getBoundingClientRect();
          const parts = [...row.children];
          for (const el of parts) {
            const b = el.getBoundingClientRect();
            const what = el.id || el.className || el.tagName;
            if (b.left < r.left - 0.5 || b.right > r.right + 0.5) out.push(`${what} leaves its row`);
            if (el.scrollWidth > el.clientWidth + 0.5 && el.tagName !== 'INPUT') out.push(`${what} clips its words`);
            if (b.top < r.top - 0.5 || b.bottom > r.bottom + 0.5) out.push(`${what} spills out of its row vertically`);
          }
          const tops = parts.map(el => Math.round(el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2));
          if (Math.max(...tops) - Math.min(...tops) > 12) out.push(`${row.className} wraps onto two lines`);
          const slider = row.querySelector('input').getBoundingClientRect();
          if (slider.width < 70) out.push(`slider only ${Math.round(slider.width)}px wide`);
        }
        const o = document.getElementById('menu-overlay');
        if (o.scrollWidth > o.clientWidth + 0.5) out.push('menu scrolls sideways');
        return out;
      });
      expect(probs, `${name} at ${text}`).toEqual([]);
      if (touch) {
        for (const id of ['btn-sound', 'btn-music', 'vol-sound', 'vol-music']) {
          const b = await page.locator('#' + id).boundingBox();
          expect(b.height, `${id} height`).toBeGreaterThanOrEqual(43.5);
          if (id.startsWith('btn')) expect(b.width, `${id} width`).toBeGreaterThanOrEqual(43.5);
        }
      }
    }
    await page.locator('#menu-overlay').screenshot({ path: `test-results/tankity-volume-${width}.png` });
    await ctx.close();
  });
}
