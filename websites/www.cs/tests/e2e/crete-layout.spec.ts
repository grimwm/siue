// The Island of Crete on ten screens: the frame fills the window, nothing scrolls, every control is on screen
// and not clipped, no control covers the maze, the maze keeps at least 8 px per cell, and key tabs show only
// where a keyboard is at hand (a mouse, and a frame at least 760 px wide).
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
const CONTROLS = 12; // Menu, four pad buttons, Hint, Route, Auto, Bash, three tools

async function open(browser: Browser, [, width, height, touch]: Device) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('games/crete/?seed=play-1');
  await page.waitForSelector('#stage .cell');
  return { ctx, page, errors };
}

/** The widest values the status bar can show. */
function setWorst() {
  const put = (id: string, v: string) => { document.getElementById(id)!.textContent = v; };
  put('hud-hp', '100/100'); put('hud-turns', '99999'); put('hud-pages', '3/3'); put('hud-score', '-98760');
  put('hud-fuses', '99'); put('hud-bash', 'ready'); put('hud-dist', '❄ 9');
}

function measure() {
  const probs: string[] = [];
  const doc = document.documentElement;
  if (doc.scrollHeight > innerHeight + 0.5) probs.push(`page taller than the screen by ${doc.scrollHeight - innerHeight}px`);
  if (doc.scrollWidth > innerWidth + 0.5) probs.push(`page wider than the screen by ${doc.scrollWidth - innerWidth}px`);
  const inside = (r: DOMRect) => r.left >= -0.5 && r.top >= -0.5 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5;
  const shown = (el: Element) => el.getClientRects().length > 0;
  const stage = document.getElementById('stage')!.getBoundingClientRect();
  if (!inside(stage)) probs.push('the maze is off screen');
  const cell = document.querySelector('#stage .cell')!.getBoundingClientRect();
  if (cell.width < 8) probs.push(`cells are ${cell.width}px`);
  const controls = [...document.querySelectorAll<HTMLElement>('#status-root button, #strip-root button')];
  if (controls.length !== 12) probs.push(`${controls.length} controls`);
  for (const el of controls) {
    const name = el.id || el.className;
    if (!shown(el)) { probs.push(`${name} hidden`); continue; }
    const r = el.getBoundingClientRect();
    if (!inside(r)) probs.push(`${name} off screen`);
    if (el.scrollWidth > el.clientWidth + 0.5) probs.push(`${name} clipped`);
    const overlaps = r.left < stage.right - 0.5 && r.right > stage.left + 0.5 && r.top < stage.bottom - 0.5 && r.bottom > stage.top + 0.5;
    if (overlaps) probs.push(`${name} covers the maze`);
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
  test(`${name}: the frame fits, the maze keeps 8 px cells, tabs follow the keyboard`, async ({ browser }) => {
    const { ctx, page, errors } = await open(browser, device);
    // The title card first: its card and its buttons are on screen.
    await expect(page.locator('#title-veil')).toBeVisible();
    expect(await page.evaluate(cardFits, '#title-veil .card'), 'title card on screen').toBe(true);
    for (const id of ['title-play', 'title-story', 'title-settings']) await expect(page.locator(`#${id}`)).toBeVisible();
    await page.locator('#title-play').click();
    await expect(page.locator('#title-veil')).toBeHidden();

    await page.evaluate(setWorst);
    expect(await page.evaluate(measure)).toEqual([]);
    const tabs = await page.evaluate(tabsShown);
    if (touch || width < 760) expect(tabs, 'no key tabs without a keyboard or under 760 px').toBe(0);
    else expect(tabs).toBe(CONTROLS);

    // The menu is a card that fits and scrolls inside itself, never the page.
    await page.locator('#btn-menu').click();
    await expect(page.locator('#menu-veil')).toBeVisible();
    expect(await page.evaluate(cardFits, '#menu-veil .card'), 'menu on screen').toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 0.5)).toBe(true);
    expect(errors).toEqual([]);
    await ctx.close();
  });
}
