// Operation Tankity on eight screens, measured with the widest values the
// bars can show (the approach of the design's layout-measure.mjs): nothing in
// the status bar wraps or clips, the deck fits, the page fits the screen,
// chips in a row line up, and phone targets are thumb-sized.
import { test, expect } from '@playwright/test';
import { recorderScript, newPlayer } from './helpers.mjs';

const DEVICES = [
  ['Desktop', 1280, 720, false], ['Laptop, small window', 1024, 640, false],
  ['Tablet, landscape', 1180, 820, true], ['Tablet, portrait', 820, 1180, true],
  ['iPhone 15, portrait', 393, 852, true], ['Small Android, portrait', 360, 740, true],
  ['iPhone 15, landscape', 852, 393, true], ['Small Android, landscape', 740, 360, true],
];
const phone = ([, w, h]) => Math.min(w, h) < 600;
const landscapePhone = ([, w, h]) => phone([0, w, h]) && w > h;

async function open(browser, [, width, height, touch], { text } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
  await ctx.addInitScript(recorderScript);
  if (text) await ctx.addInitScript(t => { try { localStorage.setItem('tankity-text', t); } catch (_) { /* fine */ } }, text);
  const page = await ctx.newPage();
  await page.clock.install();
  await page.goto('games/tankity/');
  await page.waitForSelector('#hud-score > span');
  // Hold the frames still so no repaint undoes the values set below.
  await page.clock.pauseAt(Date.now() + 2000);
  return { ctx, page };
}

/* The worst case the spec names: angle 162°, power 100, fuel 100, ♥ 5,
   $12,450, round 13, 98,760 pts; a room badge is ROOM ABCD | YOU P2 | RND 13. */
function setWorst(room) {
  const put = (sel, v) => { document.querySelector(sel).textContent = v; };
  put('#hud-angle', '162°'); put('#hud-power', '100'); put('#hud-fuel', '100');
  put('#hud-ammo', '×12'); put('#hud-armor', '175'); put('#hud-lives .v', '5'); put('#hud-wind', '← 12');
  const segs = document.querySelectorAll('#hud-score > span');
  if (room) {
    segs[0].innerHTML = '<span class="k">ROOM</span> <span class="v">ABCD</span><span class="dot on"></span>';
    segs[1].innerHTML = '<span class="k">YOU</span> <span class="v">P2</span>';
  } else {
    segs[0].querySelector('.v').textContent = '$12,450';
    segs[2].querySelector('.v').textContent = '98,760';
  }
  segs[1].parentElement.children[room ? 2 : 1].querySelector('.v').textContent = '13';
}

function measure() {
  const probs = [];
  const clipped = el => el.getClientRects().length > 1 || el.scrollWidth > el.clientWidth + 0.5;
  const bar = document.querySelector('#hud-bar .hud');
  if (bar.scrollWidth > bar.clientWidth + 0.5) probs.push(`status bar overflows by ${bar.scrollWidth - bar.clientWidth}px`);
  const stacked = getComputedStyle(bar).flexDirection === 'column';
  const rows = new Map();
  for (const el of bar.querySelectorAll('.menu-btn, .stat, .pill, .seg')) {
    if (!el.getClientRects().length) continue;
    const key = stacked ? el.closest('.hud-row').className : 'one row';
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push(el);
  }
  for (const [name, els] of rows) {
    const mids = els.map(el => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; });
    if (Math.max(...mids) - Math.min(...mids) > 1) probs.push(`status ${name} wraps`);
    const box = (stacked ? els[0].closest('.hud-row') : bar).getBoundingClientRect();
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (clipped(el)) probs.push(`${el.className} clipped`);
      if (r.left < box.left - 0.5 || r.right > box.right + 0.5) probs.push(`${el.className} sticks out of ${name}`);
    }
  }
  const deck = document.getElementById('deck');
  if (getComputedStyle(deck).position !== 'absolute' && deck.scrollWidth > deck.clientWidth + 0.5) {
    probs.push(`deck overflows by ${deck.scrollWidth - deck.clientWidth}px`);
  }
  for (const el of deck.querySelectorAll('button')) {
    if (!el.getClientRects().length) continue;
    const r = el.getBoundingClientRect();
    if (clipped(el)) probs.push(`${el.id || el.dataset.aim} clipped`);
    if (r.bottom > innerHeight + 0.5 || r.right > innerWidth + 0.5 || r.left < -0.5) probs.push(`${el.id || el.dataset.aim} off screen`);
  }
  const doc = document.documentElement;
  if (doc.scrollHeight > innerHeight + 0.5) probs.push(`page taller than the screen by ${doc.scrollHeight - innerHeight}px`);
  if (doc.scrollWidth > innerWidth + 0.5) probs.push(`page wider than the screen by ${doc.scrollWidth - innerWidth}px`);
  return probs;
}

/* Spread of chip centres among buttons of one row (same top and height). */
function chipSpreads() {
  const rows = new Map();
  for (const k of document.querySelectorAll('#deck kbd.key, #hud-bar kbd.key')) {
    if (!k.getClientRects().length) continue;
    const b = k.closest('button').getBoundingClientRect();
    const key = `${Math.round(b.top)}|${Math.round(b.height)}`;
    const r = k.getBoundingClientRect();
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push(r.top + r.height / 2);
  }
  const menu = document.querySelector('#btn-menu'), chip = menu.querySelector('kbd.key');
  const m = menu.getBoundingClientRect(), c = chip ? chip.getBoundingClientRect() : null;
  return { rows: [...rows.values()].map(v => Math.max(...v) - Math.min(...v)), menu: c ? Math.abs((c.top + c.height / 2) - (m.top + m.height / 2)) : null };
}

function smallTargets() {
  return [...document.querySelectorAll('#hud-bar button, #deck button')]
    .filter(el => el.getClientRects().length)
    .map(el => [el.id || el.dataset.aim, el.getBoundingClientRect()])
    .filter(([, r]) => r.width < 43.5 || r.height < 43.5)
    .map(([id, r]) => `${id} ${Math.round(r.width)}×${Math.round(r.height)}`);
}

for (const dev of DEVICES) {
  test(`${dev[0]} ${dev[1]}×${dev[2]}: solo and room bars fit, the deck fits, the page fits`, async ({ browser }) => {
    const { ctx, page } = await open(browser, dev);
    for (const room of [false, true]) {
      await page.evaluate(setWorst, room);
      expect(await page.evaluate(measure), room ? 'room' : 'solo').toEqual([]);
      await page.screenshot({ path: `test-results/tankity-layout-${dev[1]}x${dev[2]}-${room ? 'room' : 'solo'}.png` });
    }
    const chips = await page.evaluate(chipSpreads);
    if (!dev[3]) {
      expect(chips.rows.length).toBeGreaterThan(0);
      for (const s of chips.rows) expect(s).toBeLessThanOrEqual(1);
      expect(chips.menu).toBeLessThanOrEqual(1);
      const h = await page.evaluate(() => ['btn-weapon', 'btn-help', 'btn-drive-l', 'btn-cannon'].map(id => document.getElementById(id).getBoundingClientRect().height));
      for (const x of h) expect(Math.abs(x - 55)).toBeLessThan(0.6);
    } else {
      expect(chips.rows, 'no chips on a touch screen').toEqual([]);
    }
    const up = await page.locator('#deck [data-aim="up"]').evaluate(b => [getComputedStyle(b).backgroundColor, getComputedStyle(b).color]);
    if (!landscapePhone(dev)) expect(up).toEqual(['rgb(255, 201, 60)', 'rgb(17, 17, 17)']);
    if (phone(dev)) {
      await expect(page.locator('.topbar')).toBeHidden();
      expect(await page.evaluate(smallTargets)).toEqual([]);
      await expect(page.locator('#btn-track')).toBeHidden();
      if (landscapePhone(dev)) {
        await expect(page.locator('#btn-log')).toBeHidden();
        await expect(page.locator('#btn-help')).toBeHidden();
      }
      await page.locator('#btn-menu').tap();
      await expect(page.locator('#menu-track')).toBeVisible();
      for (const id of ['#menu-radio', '#menu-help']) {
        if (landscapePhone(dev)) await expect(page.locator(id)).toBeVisible();
        else await expect(page.locator(id)).toBeHidden();
      }
    } else {
      await expect(page.locator('.phone-extras')).toBeHidden();
    }
    await ctx.close();
  });
}

const lin = c => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const over = (fg, alpha, bg) => fg.map((c, i) => c * alpha + bg[i] * (1 - alpha));

test('the translucent landscape arrow keys keep white words readable; other buttons stay solid', async ({ browser }) => {
  const { ctx, page } = await open(browser, DEVICES[6]);
  const [bg, color, shadow] = await page.locator('#deck [data-aim="up"]').evaluate(b => { const c = getComputedStyle(b); return [c.backgroundColor, c.color, c.textShadow]; });
  expect(bg).toBe('rgba(255, 201, 60, 0.55)');
  expect(color).toBe('rgb(255, 255, 255)');
  expect(shadow).toContain('rgb(0, 0, 0)');
  // Over the night sky the fill alone gives 4.5:1; over the hills the dark halo carries the words.
  expect(contrast([255, 255, 255], over([255, 201, 60], 0.55, [0, 0, 11]))).toBeGreaterThanOrEqual(4.5);
  expect(await page.locator('#btn-drive-l').evaluate(b => getComputedStyle(b).backgroundColor)).toBe('rgb(10, 13, 38)');
  await ctx.close();
});

test('the Huge text size leaves the bars fitting on the smallest phone', async ({ browser }) => {
  const { ctx, page } = await open(browser, DEVICES[5], { text: 'xl' });
  expect(await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize))).toBeCloseTo(20.8, 1);
  await page.evaluate(setWorst, false);
  expect(await page.evaluate(measure)).toEqual([]);
  await ctx.close();
});

test('chatter is a one-line toast inside the battlefield, never over the status bar', async ({ browser }) => {
  const { page, ctx, errors } = await newPlayer(browser, undefined, { clock: true });
  await page.keyboard.press('n');
  await expect.poll(async () => { await page.clock.runFor(500); return page.locator('#dialogue').isVisible(); }, { timeout: 10_000 }).toBe(true);
  const [d, h, f] = [await page.locator('#dialogue').boundingBox(), await page.locator('#hud-bar').boundingBox(), await page.locator('#field').boundingBox()];
  expect(d.y).toBeGreaterThanOrEqual(h.y + h.height);
  expect(d.y).toBeGreaterThanOrEqual(f.y);
  expect(d.height).toBeLessThan(32);
  expect(await page.locator('#dialogue').evaluate(e => getComputedStyle(e).whiteSpace)).toBe('nowrap');
  expect(errors).toEqual([]);
  await ctx.close();
});
