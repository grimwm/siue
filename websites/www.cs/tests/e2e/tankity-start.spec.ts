// Operation Tankity's start: the title card over the demo, its buttons and
// initials, and the settings-only menu that Q toggles.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { newPlayer } from './helpers.ts';

test('the title card greets the player over the demo, and Play deals a solo match', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  const card = page.locator('#title-card');
  await expect(card).toBeVisible();
  await expect(page.locator('#title-play')).toBeFocused();
  for (const id of ['#rooms-open', '#tutorial-open', '#title-settings']) await expect(page.locator(id)).toBeVisible();
  await page.click('#title-play');
  await expect(card).toBeHidden();
  await expect(page.locator('#shop-veil')).toBeVisible({ timeout: 10_000 });
  expect(errors).toEqual([]);
});

test('Q opens the settings menu over the card and closes it, and focus comes back', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  const menu = page.locator('#menu-overlay');
  await page.keyboard.press('q');
  await expect(menu).toBeVisible();
  await expect(page.locator('#menu-close')).toBeFocused();
  await expect(page.locator('#btn-menu')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#menu-h')).toHaveText('Settings');
  await expect(page.locator('#new-game')).toHaveText(/^Play this seed/);
  await expect(page.locator('#scores-open')).toBeVisible();
  await expect(page.locator('#difficulty-picker')).toBeVisible();
  for (const gone of ['#random-run', '#menu-overlay #rooms-open', '#menu-overlay #tutorial-open']) {
    await expect(page.locator(gone)).toHaveCount(0);
  }
  await page.keyboard.press('q');
  await expect(menu).toBeHidden();
  await expect(page.locator('#title-card')).toBeVisible();
  await page.click('#title-settings');
  await expect(menu).toBeVisible();
  await expect(page.locator('#title-settings')).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('q');
  await expect(menu).toBeHidden();
  await expect(page.locator('#title-settings')).toBeFocused();
  await expect(page.locator('#title-settings')).toHaveAttribute('aria-expanded', 'false');
  expect(errors).toEqual([]);
});

test('initials: random until chosen, typed in either case, shown and kept uppercase, blocked words refused', async ({ browser }) => {
  const { page, ctx, errors } = await newPlayer(browser);
  const saved = () => page.evaluate(() => localStorage.getItem('tankity-initials'));
  const first = await saved();
  expect(first).toMatch(/^[A-Z]{3}$/);
  await page.reload();
  expect(await saved()).toBe(first);
  await page.click('#title-initial-1');
  await page.keyboard.type('zed');
  await expect.poll(saved).toBe('ZED');
  await expect(page.locator('#title-initial-1')).toHaveValue('Z');
  await expect(page.locator('#title-initial-3')).toHaveValue('D');
  const again = await ctx.newPage();
  await again.goto('games/tankity/');
  await expect(again.locator('#title-initial-2')).toHaveValue('E');
  await page.click('#title-initial-1');
  await page.keyboard.type('ass');
  await expect(page.locator('#title-initials-note')).toContainText('not allowed');
  expect(await saved()).toBe('ZED');
  expect(errors).toEqual([]);
});

test('Play with friends opens the rooms; closing them shows the card again', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await page.click('#rooms-open');
  await expect(page.locator('#lobby-veil')).toBeVisible();
  await page.keyboard.press('q');
  await expect(page.locator('#lobby-veil')).toBeHidden();
  await expect(page.locator('#title-card')).toBeVisible();
  await page.click('#tutorial-open');
  await expect(page.locator('#title-card')).toBeHidden();
  await expect(page.locator('#shop-veil')).toBeVisible({ timeout: 10_000 });
  expect(errors).toEqual([]);
});

test('Ctrl alone never starts a match from the card; in an initials box Q is a letter and Esc does nothing', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await expect(page.locator('#title-play')).toBeFocused();
  await page.keyboard.press('Control');
  await page.waitForTimeout(300);
  await expect(page.locator('#title-card')).toBeVisible();
  await expect(page.locator('#shop-veil')).toBeHidden();
  await page.click('#title-initial-2');
  await page.keyboard.press('q');
  await expect(page.locator('#title-initial-2')).toHaveValue('Q');
  await expect(page.locator('#menu-overlay')).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(page.locator('#menu-overlay')).toBeHidden();
  await expect(page.locator('#title-card')).toBeVisible();
  expect(errors).toEqual([]);
});

// What a finger touches is whatever is on top at the control's centre, so the
// test asks the page, not the control's box: a toolbar over the card fails it.
const topAtCentre = (page: Page, sel: string) => page.locator(sel).evaluate(el => {
  const r = el.getBoundingClientRect();
  const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  return !!hit && (hit === el || el.contains(hit));
});

for (const [width, height, touch] of [[375, 667, false], [390, 844, true], [844, 390, true]] as [number, number, boolean][]) {
  test(`on a ${width}x${height} phone every card control is on top, and Settings opens over the card`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('games/tankity/');
    await expect(page.locator('#title-card')).toBeVisible();
    for (const id of ['#title-play', '#rooms-open', '#tutorial-open', '#title-initial-1', '#title-initial-2', '#title-initial-3', '#title-settings']) {
      expect(await topAtCentre(page, id), `${id} is covered at ${width}x${height}`).toBe(true);
    }
    expect(await page.locator('#title-card').evaluate(el => el.scrollHeight > el.clientHeight + 1), 'the card scrolls').toBe(false);
    await page.locator('#title-settings').click();
    await expect(page.locator('#menu-overlay')).toBeVisible();
    expect(await topAtCentre(page, '#menu-close'), 'the menu opens under the card').toBe(true);
    expect(errors).toEqual([]);
    await ctx.close();
  });
}

/* Play is the card's primary button at every size: most of the row beside Share, thumb tall, with its word and ▶ inside. */
const SCREENS: [number, number, boolean][] = [[412, 915, true], [915, 412, true], [360, 740, true], [740, 360, true], [393, 852, true], [852, 393, true],
  [820, 1180, true], [1180, 820, true], [1024, 640, false], [1280, 720, false]];
for (const [width, height, touch] of SCREENS) {
  test(`Play and Share share one row, Play the primary, at ${width}x${height}`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
    const page = await ctx.newPage();
    await page.goto('games/tankity/');
    await expect(page.locator('#title-card')).toBeVisible();
    const m = await page.evaluate(() => {
      const btn = document.getElementById('title-play')!;
      const share = document.getElementById('title-share')!;
      const b = btn.getBoundingClientRect();
      const s = share.getBoundingClientRect();
      const row = btn.parentElement!.getBoundingClientRect();
      const card = document.querySelector('.title-card')!;
      const cs = getComputedStyle(card);
      const content = card.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const range = document.createRange();
      range.selectNodeContents(btn);
      const t = range.getBoundingClientRect();
      return { b, s, rowW: row.width, rowL: row.left, rowR: row.right, content, scroll: btn.scrollWidth, client: btn.clientWidth,
        pageScroll: document.documentElement.scrollWidth, inner: innerWidth,
        textL: t.left - b.left, textR: b.right - t.right, textT: t.top - b.top, textB: b.bottom - t.bottom };
    });
    expect(m.rowW, 'the row spans the card content box').toBeGreaterThanOrEqual(m.content - 1);
    expect(m.b.width / m.rowW, 'Play keeps at least 60% of the row').toBeGreaterThanOrEqual(0.6);
    expect(Math.abs(m.b.top - m.s.top), 'one row, tops level').toBeLessThanOrEqual(1);
    expect(m.s.left, 'Share is beside Play, not under or over it').toBeGreaterThanOrEqual(m.b.right - 0.5);
    expect(m.b.left, 'Play stays in the row').toBeGreaterThanOrEqual(m.rowL - 0.5);
    expect(m.s.right, 'Share stays in the row').toBeLessThanOrEqual(m.rowR + 0.5);
    expect(m.s.right, 'inside the screen').toBeLessThanOrEqual(m.inner);
    expect(m.pageScroll).toBeLessThanOrEqual(m.inner);
    expect(m.s.width, 'Share is thumb wide').toBeGreaterThanOrEqual(44);
    expect(m.s.height, 'Share is thumb tall').toBeGreaterThanOrEqual(44);
    expect(Math.abs(m.s.height - m.b.height), 'Share is as tall as Play').toBeLessThanOrEqual(1);
    expect(m.scroll, 'nothing overflows Play').toBeLessThanOrEqual(m.client);
    for (const side of ['textL', 'textR', 'textT', 'textB'] as const) expect(m[side], `the ▶ and word sit inside Play (${side})`).toBeGreaterThanOrEqual(-0.5);
    expect(m.b.height, 'Play is thumb tall').toBeGreaterThanOrEqual(44);
    await ctx.close();
  });
}

declare global {
  interface Window { __shared: { url: string; title: string }[]; __linksCopied: string[] }
}

test('Share is named, reachable by Tab, and hands the /play/tankity/ address to the share sheet', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  await ctx.addInitScript(() => {
    window.__shared = [];
    Object.defineProperty(Navigator.prototype, 'share', { value: (data: { url: string; title: string }) => { window.__shared.push(data); return Promise.resolve(); }, configurable: true });
  });
  const page = await ctx.newPage();
  await page.goto('games/tankity/');
  const share = page.locator('#title-share');
  await expect(share).toBeVisible();
  await expect(share).toHaveAttribute('aria-label', 'Share');
  await expect(share).toHaveAttribute('title', /.+/);
  await expect(page.locator('#title-play')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(share).toBeFocused();
  await share.click();
  const shared = await page.evaluate(() => window.__shared);
  expect(shared).toHaveLength(1);
  expect(new URL(shared[0]!.url).pathname).toMatch(/\/play\/tankity\/$/);
  expect(shared[0]!.title).toBe('Operation Tankity');
  await expect(page.locator('#title-card')).toBeVisible();
  await ctx.close();
});

test('without Web Share, Share copies the address and says "Link copied"', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  await ctx.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'share', { value: undefined, configurable: true });
    window.__linksCopied = [];
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: (t: string) => { window.__linksCopied.push(t); return Promise.resolve(); } }, configurable: true });
  });
  const page = await ctx.newPage();
  await page.goto('games/tankity/');
  await page.locator('#title-share').click();
  await expect(page.locator('#title-share-status')).toHaveText('Link copied');
  expect((await page.evaluate(() => window.__linksCopied))[0]).toMatch(/\/play\/tankity\/\?v=[0-9a-f]{10}$/);
  await ctx.close();
});

test('R opens Scores over the title card and Q closes it', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await page.keyboard.press('r');
  await expect(page.locator('#report-overlay')).toBeVisible();
  await expect(page.locator('#score-h')).toContainText(/Scores/i);
  await page.keyboard.press('q');
  await expect(page.locator('#report-overlay')).toBeHidden();
  expect(errors).toEqual([]);
});

const TITLE_SCREENS: [string, number, number, boolean][] = [
  ['phone', 393, 852, true], ['tablet', 820, 1180, true], ['desktop', 1280, 720, false],
];

for (const [name, width, height, touch] of TITLE_SCREENS) {
  test(`title card on a ${name}: Settings is styled like Play with friends, Tutorial stands apart, Scores opens above Settings, Q goes back, labels fit`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('games/tankity/');
    await page.waitForSelector('#title-card:not([hidden])');
    const look = (sel: string) => page.locator(sel).evaluate(el => {
      const c = getComputedStyle(el);
      return { bg: c.backgroundColor, border: c.borderTopColor, width: c.borderTopWidth, radius: c.borderTopLeftRadius, deco: c.textDecorationLine, font: c.fontFamily };
    });
    expect(await look('#title-settings')).toEqual(await look('#rooms-open'));
    // Tutorial is secondary but its own: the accent outline, not Play's fill
    // and not the plain buttons beside it.
    const [tut, play, friends] = [await look('#tutorial-open'), await look('#title-play'), await look('#rooms-open')];
    expect(tut.bg).not.toBe(play.bg);
    expect(tut.border).toBe(play.bg); // the accent, as an outline
    expect(tut.border).not.toBe(friends.border);
    expect(tut.bg).not.toBe(friends.bg);
    // The topmost thing at an overlay's centre is inside it.
    const topmostIn = (id: string) => page.evaluate((sel: string) => {
      const r = document.querySelector(sel)!.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !!hit && !!hit.closest(sel);
    }, '#' + id);
    const press = async (sel: string) => { const l = page.locator(sel); await (touch ? l.tap() : l.click()); };
    await press('#title-settings');
    await expect(page.locator('#menu-overlay')).toBeVisible();
    // Every Settings button's label fits inside it.
    const clipped = await page.evaluate(() => [...document.querySelectorAll('#menu-overlay button')]
      .filter(b => b.getBoundingClientRect().width > 0)
      .filter(b => [b, ...b.querySelectorAll('span')].some(e => e.scrollWidth > e.clientWidth))
      .map(b => b.id || b.textContent));
    expect(clipped).toEqual([]);
    await press('#scores-open');
    await expect(page.locator('#report-overlay')).toBeVisible();
    expect(await topmostIn('report-overlay')).toBe(true);
    // Q on a keyboard, the close button on a touch screen (keys do nothing there).
    if (touch) await press('#report-close'); else await page.keyboard.press('q');
    await expect(page.locator('#report-overlay')).toBeHidden();
    await expect(page.locator('#title-card')).toBeVisible();
    await ctx.close();
    expect(errors).toEqual([]);
  });
}

test('Help opened from the Settings menu on the title card sits on top', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  await page.click('#title-settings');
  await expect(page.locator('#menu-overlay')).toBeVisible();
  await page.keyboard.press('h');
  await expect(page.locator('#help-overlay')).toBeVisible();
  const top = await page.evaluate(() => {
    const r = document.querySelector('#help-overlay')!.getBoundingClientRect();
    return !!document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest('#help-overlay');
  });
  expect(top).toBe(true);
  expect(errors).toEqual([]);
});
