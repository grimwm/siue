// The Island of Crete on ten screens: the frame fills the window, nothing scrolls, every control is on screen
// and not clipped, no control covers the board, the board keeps at least 8 px per cell, and key tabs show only
// where a keyboard is at hand (a mouse, and a frame at least 760 px wide). The trial list and the start card are
// checked too, and trial 8, the largest board, at the smallest phone sizes.
import { test, expect } from '@playwright/test';
import type { Browser } from '@playwright/test';

type Device = [name: string, width: number, height: number, touch: boolean];
const DEVICES: Device[] = [
  ['Desktop', 1280, 720, false], ['Laptop, small window', 1024, 640, false],
  ['Tablet, landscape', 1180, 820, true], ['Tablet, portrait', 820, 1180, true],
  ['iPhone 15, portrait', 393, 852, true], ['Small Android, portrait', 360, 740, true],
  ['iPhone SE, portrait', 320, 568, true],
  ['iPhone 15, landscape', 852, 393, true], ['Small Android, landscape', 740, 360, true],
  ['iPhone SE, landscape', 568, 320, true],
];
const TABS = 14; // every control carries a key tab with a keyboard at hand

async function open(browser: Browser, [, width, height, touch]: Device) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('games/crete/');
  return { ctx, page, errors };
}

/** The widest values the status bar can show. */
function setWorst() {
  const put = (id: string, v: string) => { document.getElementById(id)!.textContent = v; };
  put('hud-trial', '8/8'); put('hud-hearts', '♥ 99'); put('hud-relics', '99/99'); put('hud-keys', '9 9 9 9');
  put('hud-gear', 'fire ice water'); put('hud-moves', '99999');
}

function measure() {
  const probs: string[] = [];
  const doc = document.documentElement;
  if (doc.scrollHeight > innerHeight + 0.5) probs.push(`page taller than the screen by ${doc.scrollHeight - innerHeight}px`);
  if (doc.scrollWidth > innerWidth + 0.5) probs.push(`page wider than the screen by ${doc.scrollWidth - innerWidth}px`);
  const inside = (r: DOMRect) => r.left >= -0.5 && r.top >= -0.5 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5;
  const shown = (el: Element) => el.getClientRects().length > 0;
  const stage = document.getElementById('stage')!.getBoundingClientRect();
  if (!inside(stage)) probs.push('the board is off screen');
  const cell = Number(document.getElementById('stage')!.dataset.cell);
  if (!(cell >= 8)) probs.push(`cells are ${cell}px`);
  const controls = [...document.querySelectorAll<HTMLElement>('#status-root button, #strip-root button')];
  if (controls.length !== 14) probs.push(`${controls.length} controls`);
  for (const el of controls) {
    const name = el.id || el.className;
    if (!shown(el)) { probs.push(`${name} hidden`); continue; }
    const r = el.getBoundingClientRect();
    if (!inside(r)) probs.push(`${name} off screen`);
    if (el.scrollWidth > el.clientWidth + 0.5) probs.push(`${name} clipped`);
    const overlaps = r.left < stage.right - 0.5 && r.right > stage.left + 0.5 && r.top < stage.bottom - 0.5 && r.bottom > stage.top + 0.5;
    if (overlaps) probs.push(`${name} covers the board`);
  }
  for (const stat of document.querySelectorAll<HTMLElement>('#status-root .stat')) {
    if (!inside(stat.getBoundingClientRect())) probs.push(`${stat.querySelector('dd')!.id} off screen`);
    if (stat.scrollWidth > stat.clientWidth + 0.5) probs.push(`${stat.querySelector('dd')!.id} clipped`);
  }
  return probs;
}

const tabsShown = () => [...document.querySelectorAll('.kit-key-tab')].filter(el => el.getClientRects().length > 0).length;
const cardFits = (sel: string) => {
  const card = document.querySelector(sel)!.getBoundingClientRect();
  return card.left >= -0.5 && card.top >= -0.5 && card.right <= innerWidth + 0.5 && card.bottom <= innerHeight + 0.5;
};

for (const device of DEVICES) {
  const [name, width, , touch] = device;
  test(`${name}: the frame fits, the board keeps 8 px cells, tabs follow the keyboard`, async ({ browser }) => {
    const { ctx, page, errors } = await open(browser, device);
    // The title card first: its card and its buttons are on screen.
    await expect(page.locator('#title-veil')).toBeVisible();
    expect(await page.evaluate(cardFits, '#title-veil .card'), 'title card on screen').toBe(true);
    for (const id of ['title-play', 'title-story', 'title-settings']) await expect(page.locator(`#${id}`)).toBeVisible();
    await page.locator('#title-play').click();
    await expect(page.locator('#trials-veil')).toBeVisible();
    expect(await page.evaluate(cardFits, '#trials-veil .card'), 'trial list on screen').toBe(true);
    for (let i = 1; i <= 8; i++) await expect(page.locator(`#trial-${i}`)).toBeVisible();
    await page.locator('#trial-1').click();
    await expect(page.locator('#trials-veil')).toBeHidden();

    // The start card sits over the board with its Begin button on screen.
    await expect(page.locator('#start-veil')).toBeVisible();
    expect(await page.evaluate(cardFits, '#start-veil .card'), 'start card on screen').toBe(true);
    await expect(page.locator('#start-begin')).toBeVisible();
    await page.locator('#start-begin').click();
    await expect(page.locator('#start-veil')).toBeHidden();

    await page.waitForSelector('#stage[data-cell]');
    await page.evaluate(setWorst);
    expect(await page.evaluate(measure)).toEqual([]);
    const tabs = await page.evaluate(tabsShown);
    if (touch || width < 760) expect(tabs, 'no key tabs without a keyboard or under 760 px').toBe(0);
    else expect(tabs).toBe(TABS);

    // The menu is a card that fits and scrolls inside itself, never the page.
    await page.locator('#btn-menu').click();
    await expect(page.locator('#menu-veil')).toBeVisible();
    expect(await page.evaluate(cardFits, '#menu-veil .card'), 'menu on screen').toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 0.5)).toBe(true);
    expect(errors).toEqual([]);
    await ctx.close();
  });
}

// Trial 8 is the largest board (12 x 10): it must still keep 8 px cells and every control on the smallest phone.
for (const device of DEVICES.filter(d => d[0].startsWith('iPhone SE'))) {
  test(`${device[0]}: trial 8, the largest board, keeps 8 px cells and every control on screen`, async ({ browser }) => {
    const { ctx, page, errors } = await open(browser, device);
    await page.locator('#title-play').click();
    await page.locator('#trial-8').click();
    await page.locator('#start-begin').click();
    await expect(page.locator('#start-veil')).toBeHidden();
    await page.waitForSelector('#stage[data-cell]');
    await page.evaluate(setWorst);
    expect(await page.evaluate(measure)).toEqual([]);
    expect(Number(await page.locator('#stage').getAttribute('data-cell'))).toBeGreaterThanOrEqual(8);
    expect(errors).toEqual([]);
    await ctx.close();
  });
}
