// The Island of Crete on ten screens: the title card over its picture (the wide framing on a desktop, the tall one
// on a phone, its buttons on top and working), the frame fills the window, nothing scrolls, every control is on screen
// and not clipped, no control covers the board, the board keeps at least 8 px per cell, and key tabs show only
// where a keyboard is at hand (a mouse, and a frame at least 760 px wide). The move pad is a connected cross on every screen; on a
// phone nothing else stands within 12 px of an arrow, at either edge the Arrows setting puts the pad, and Hint, Route
// and Auto wait behind the Thread button. The new-game card, the chapter card, the level list, the start card and the menu are
// checked too, and level 8 at the smallest phone sizes. Every Chapter 1 level shows whole on every screen, without
// scrolling; zoomed in, a step keeps the zoom and pans to keep Theseus in view, and Reset shows the whole level again.
import { test, expect } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';

/** Every Dictionary entry met before the page loads, so no first card (src/ui/meet.tsx) stops these specs' levels. */
const allMet = (): void => localStorage.setItem('crete-met', '["*"]');

test.beforeEach(async ({ context }) => { await context.addInitScript(allMet); });

/** These specs read the classic board's pixels and cells, so they pin the Look setting before the page loads. */
const pinClassic = (): void => localStorage.setItem('crete-look', 'classic');

type Device = [name: string, width: number, height: number, touch: boolean];
const DEVICES: Device[] = [
  ['Desktop', 1280, 720, false], ['Laptop, small window', 1024, 640, false],
  ['Tablet, landscape', 1180, 820, true], ['Tablet, portrait', 820, 1180, true],
  ['iPhone 15, portrait', 393, 852, true], ['Small Android, portrait', 360, 740, true],
  ['iPhone SE, portrait', 320, 568, true],
  ['iPhone 15, landscape', 852, 393, true], ['Small Android, landscape', 740, 360, true],
  ['iPhone SE, landscape', 568, 320, true],
];
const TABS = 15; // every control carries a key tab with a keyboard at hand

async function open(browser: Browser, [, width, height, touch]: Device, pad?: 'left' | 'right') {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
  await ctx.addInitScript(allMet);
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(pinClassic);
  if (pad) await page.addInitScript((side: string) => localStorage.setItem('crete-pad', side), pad);
  await page.goto('games/crete/');
  return { ctx, page, errors };
}

/** A dialog's close button sits on the title's row: its vertical centre is inside the title's box, and it ends to the title's right. */
async function closeOnTitleRow(page: Page, dialog: string): Promise<void> {
  await expect(page.locator(`#${dialog}-title`), `${dialog}: title shown`).toBeVisible();
  await expect(page.locator(`#${dialog}-close`), `${dialog}: close shown`).toBeVisible();
  const row = await page.evaluate((d) => {
    const t = document.querySelector(`#${d}-title`)!.getBoundingClientRect();
    const c = document.querySelector(`#${d}-close`)!.getBoundingClientRect();
    return { mid: (c.top + c.bottom) / 2, top: t.top, bottom: t.bottom, gap: c.left - t.right };
  }, dialog);
  expect(row.mid, `${dialog}: close centre inside the title's line`).toBeGreaterThanOrEqual(row.top);
  expect(row.mid, `${dialog}: close centre inside the title's line`).toBeLessThanOrEqual(row.bottom);
  expect(row.gap, `${dialog}: close beside the title, not over it`).toBeGreaterThanOrEqual(-0.5);
}

/** The widest values the status bar can show. */
function setWorst() {
  const put = (id: string, v: string) => { document.getElementById(id)!.textContent = v; };
  put('hud-trial', 'Ch. 10 • Level 12/12'); put('hud-hearts', '♥ 99'); put('hud-relics', '99/99'); put('hud-keys', '9 9 9 9');
  put('hud-gear', 'fire ice water'); put('hud-moves', '99999');
}

function measure() {
  const probs: string[] = [];
  const doc = document.documentElement;
  if (doc.scrollHeight > innerHeight + 0.5) probs.push(`page taller than the screen by ${doc.scrollHeight - innerHeight}px`);
  if (doc.scrollWidth > innerWidth + 0.5) probs.push(`page wider than the screen by ${doc.scrollWidth - innerWidth}px`);
  const inside = (r: DOMRect) => r.left >= -0.5 && r.top >= -0.5 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5;
  const shown = (el: Element) => el.getClientRects().length > 0;
  // The board's own box on the screen (the turned, tilted level and its figures' headroom), not its canvas's margin.
  const box = (window as unknown as { __creteTest: { classic: { box(): { left: number; top: number; right: number; bottom: number } | null } } }).__creteTest.classic.box();
  if (!box) return ['no board'];
  const stage = new DOMRect(box.left, box.top, box.right - box.left, box.bottom - box.top);
  if (!inside(stage)) probs.push('the board is off screen');
  const cell = Number(document.getElementById('stage')!.dataset.cell);
  if (!(cell >= 8)) probs.push(`cells are ${cell}px`);
  // A phone's Thread panel, shut, keeps Hint, Route and Auto out of sight: the Thread button stands for them.
  // Menu stands in the status bar, or, on a portrait phone, in the strip's bottom row: exactly one of the two shows.
  const menus = ['btn-menu', 'btn-menu-strip'].filter(id => { const m = document.getElementById(id); return m !== null && shown(m); });
  if (menus.length !== 1) probs.push(`${menus.length} Menu buttons show`);
  const controls = [...document.querySelectorAll<HTMLElement>('#status-root button, #strip-root button')]
    .filter(b => !b.closest('[hidden]') && !(b.id.startsWith('btn-menu') && !shown(b)));
  const want = document.getElementById('btn-thread') ? 13 : 15;
  if (controls.length !== want) probs.push(`${controls.length} controls, not ${want}`);
  const strip = document.getElementById('strip-root')!;
  if (strip.scrollWidth > strip.clientWidth + 0.5) probs.push(`the strip is wider than its row by ${strip.scrollWidth - strip.clientWidth}px`);
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

/** The look pictures in `sel`: two, each loaded, side by side, the same size, each above its name. */
const lookTiles = (sel: string) => {
  const probs: string[] = [];
  const tiles = [...document.querySelectorAll<HTMLElement>(`${sel} .look-tile`)];
  if (tiles.length !== 2) return [`${tiles.length} tiles`];
  const boxes = tiles.map(t => t.getBoundingClientRect());
  if (Math.abs(boxes[0]!.top - boxes[1]!.top) > 0.5 || boxes[0]!.right > boxes[1]!.left + 0.5) probs.push('tiles not side by side');
  if (Math.abs(boxes[0]!.width - boxes[1]!.width) > 0.5) probs.push('tiles differ in width');
  for (const t of tiles) {
    const img = t.querySelector('img')!;
    if (!img.complete || img.naturalWidth === 0) probs.push(`${t.id}: picture not loaded`);
    const name = t.querySelector('.look-name')!.getBoundingClientRect();
    if (name.top < img.getBoundingClientRect().bottom - 0.5) probs.push(`${t.id}: name not under the picture`);
  }
  return probs;
};

/** The menu: nothing clipped or wider than the card, every switch row the full width of its list, and every picked
 *  control's text a different colour from its fill. */
const menuTidy = () => {
  const probs: string[] = [];
  const card = document.querySelector('#menu-veil .card')!;
  if (card.scrollWidth > card.clientWidth + 0.5) probs.push('menu scrolls sideways');
  for (const b of card.querySelectorAll<HTMLElement>('button')) {
    if (b.scrollWidth > b.clientWidth + 0.5) probs.push(`${b.id} clipped`);
    const cs = getComputedStyle(b);
    if ((b.getAttribute('aria-pressed') === 'true' || b.classList.contains('seg-opt')) && cs.color === cs.backgroundColor) probs.push(`${b.id}: text the colour of its fill`);
  }
  for (const row of card.querySelectorAll<HTMLElement>('.menu-row')) {
    const list = row.closest('.menu-list')!.getBoundingClientRect();
    if (Math.abs(row.getBoundingClientRect().width - list.width) > 2.5) probs.push(`${row.id} not full width`);
  }
  return probs;
};

/** Play, Enter the halls on the new-game card, the chapter card's Levels, then level `n`; level 1 shows the chapter
 *  card first, so Enter the halls follows. */
async function openLevel(page: Page, n: number): Promise<void> {
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await page.locator('#chapter-levels').click();
  await page.locator(`#level-${n}`).click();
  if (n === 1) await page.locator('#chapter-enter').click();
}

for (const device of DEVICES) {
  const [name, width, , touch] = device;
  test(`${name}: the frame fits, the board keeps 8 px cells, tabs follow the keyboard`, async ({ browser }) => {
    const { ctx, page, errors } = await open(browser, device);
    // The title card first: its card and its buttons are on screen.
    await expect(page.locator('#title-veil')).toBeVisible();
    expect(await page.evaluate(cardFits, '#title-veil .card'), 'title card on screen').toBe(true);
    for (const id of ['title-play', 'title-story', 'title-settings']) await expect(page.locator(`#${id}`)).toBeVisible();
    await page.locator('#title-play').click();
    // New Game opens the new-game card: both looks as loaded pictures above their names, Classic picked here.
    await expect(page.locator('#look-veil')).toBeVisible();
    expect(await page.evaluate(cardFits, '#look-veil .card'), 'new-game card on screen').toBe(true);
    await expect(page.locator('#pick-classic')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#pick-modern')).toHaveAttribute('aria-pressed', 'false');
    expect(await page.evaluate(lookTiles, '#look-veil'), 'new-game card pictures').toEqual([]);
    await page.locator('#pick-enter').click();
    // Enter the halls opens Chapter 1's card, with both its buttons on screen; Levels opens the list over it.
    await expect(page.locator('#chapter-veil')).toBeVisible();
    expect(await page.evaluate(cardFits, '#chapter-veil .card'), 'chapter card on screen').toBe(true);
    for (const id of ['chapter-enter', 'chapter-levels']) await expect(page.locator(`#${id}`)).toBeVisible();
    await page.locator('#chapter-levels').click();
    await expect(page.locator('#levels-veil')).toBeVisible();
    expect(await page.evaluate(cardFits, '#levels-veil .card'), 'level list on screen').toBe(true);
    await closeOnTitleRow(page, 'levels');
    for (let n = 1; n <= 10; n++) await expect(page.locator(`#levels-tab-${n}`)).toBeVisible();
    for (let i = 1; i <= 10; i++) await expect(page.locator(`#level-${i}`)).toBeVisible();
    // Level 1 from the list shows the chapter card first; Enter the halls opens it.
    await page.locator('#level-1').click();
    await expect(page.locator('#levels-veil')).toBeHidden();
    await expect(page.locator('#chapter-veil')).toBeVisible();
    await page.locator('#chapter-enter').click();
    await expect(page.locator('#chapter-veil')).toBeHidden();

    // The start card sits over the board with its Begin button on screen.
    await expect(page.locator('#start-veil')).toBeVisible();
    expect(await page.evaluate(cardFits, '#start-veil .card'), 'start card on screen').toBe(true);
    await expect(page.locator('#start-begin')).toBeVisible();
    await page.locator('#start-begin').click();
    await expect(page.locator('#start-veil')).toBeHidden();

    await page.waitForSelector('#stage[data-cell]');
    await page.evaluate(setWorst);
    // The longest status text can reflow the bars; the board is framed again for the room it leaves on the next frame.
    await expect.poll(() => page.evaluate(measure)).toEqual([]);
    const tabs = await page.evaluate(tabsShown);
    if (touch || width < 760) expect(tabs, 'no key tabs without a keyboard or under 760 px').toBe(0);
    else expect(tabs).toBe(TABS);

    // The menu is a card that fits and scrolls inside itself, never the page.
    await page.locator('#btn-menu:visible, #btn-menu-strip:visible').first().click();
    await expect(page.locator('#menu-veil')).toBeVisible();
    expect(await page.evaluate(cardFits, '#menu-veil .card'), 'menu on screen').toBe(true);
    await closeOnTitleRow(page, 'menu');
    await expect(page.locator('#menu-veil #look-modern'), 'no Look setting in the menu').toHaveCount(0);
    expect(await page.evaluate(menuTidy), 'menu laid out').toEqual([]);
    // Two columns where there is room, one on a phone.
    const cols = await page.evaluate(() => getComputedStyle(document.querySelector('.menu-cols')!).gridTemplateColumns.split(' ').length);
    expect(cols, 'menu columns').toBe(width >= 760 ? 2 : 1);
    await page.locator('#menu-lore').click();
    await expect(page.locator('#lore-veil')).toBeVisible();
    await closeOnTitleRow(page, 'lore');
    await page.locator('#lore-close').click();
    expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 0.5)).toBe(true);
    expect(errors).toEqual([]);
    await ctx.close();
  });
}

/** The move pad is one connected cross: up over down, left and right level with each other, and all four arms touch
 *  an inert centre square (no button, no gap); `side` names the half of the screen the pad stands in, `min` the
 *  smallest arm. */
function plusPad({ side, min }: { side: string | null; min: number }) {
  const probs: string[] = [];
  const box = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
  const [up, left, right, down] = ['.mv-up', '.mv-left', '.mv-right', '.mv-down'].map(box) as [DOMRect, DOMRect, DOMRect, DOMRect];
  const hubEl = document.querySelector('.pad-hub') as HTMLElement | null;
  if (!hubEl) return ['no centre square'];
  const hub = hubEl.getBoundingClientRect();
  if (getComputedStyle(hubEl).visibility !== 'visible') probs.push('the centre is not visible');
  const cx = (r: DOMRect) => (r.left + r.right) / 2;
  const cy = (r: DOMRect) => (r.top + r.bottom) / 2;
  if (Math.abs(cx(up) - cx(down)) > 1) probs.push('up is not over down');
  if (Math.abs(cy(left) - cy(right)) > 1) probs.push('left and right are not level');
  if (Math.abs(cx(up) - cx(hub)) > 1 || Math.abs(cy(left) - cy(hub)) > 1) probs.push('the centre is off centre');
  if (Math.abs(hub.top - up.bottom) > 1) probs.push(`up is ${hub.top - up.bottom}px from the centre`);
  if (Math.abs(down.top - hub.bottom) > 1) probs.push(`down is ${down.top - hub.bottom}px from the centre`);
  if (Math.abs(hub.left - left.right) > 1) probs.push(`left is ${hub.left - left.right}px from the centre`);
  if (Math.abs(right.left - hub.right) > 1) probs.push(`right is ${right.left - hub.right}px from the centre`);
  for (const r of [up, left, right, down]) {
    if (r.width < min - 0.5 || r.height < min - 0.5) probs.push(`an arm is ${r.width}x${r.height}, under ${min}px`);
  }
  if (hubEl.tagName === 'BUTTON' || hubEl.closest('button') || hubEl.getAttribute('aria-hidden') !== 'true') probs.push('the centre is not an inert, hidden square');
  const centre = document.elementFromPoint(cx(hub), cy(hub));
  if (centre?.closest('button')) probs.push(`a button sits in the centre: ${centre.closest('button')!.className}`);
  if (side === 'left' && cx(up) > innerWidth / 2) probs.push('the pad is not on the left');
  if (side === 'right' && cx(up) < innerWidth / 2) probs.push('the pad is not on the right');
  return probs;
}

/** No button but an arrow, shown in the strip (or the Thread panel), touches an arrow or stands within 12 px of one. */
function clearOfArrows() {
  const probs: string[] = [];
  const shown = (el: Element) => el.getClientRects().length > 0;
  const arrows = [...document.querySelectorAll('.mv')].map(b => b.getBoundingClientRect());
  for (const b of document.querySelectorAll<HTMLElement>('#strip-root button:not(.mv), #status-root button')) {
    if (!shown(b)) continue;
    const r = b.getBoundingClientRect();
    for (const a of arrows) {
      const dx = Math.max(a.left - r.right, r.left - a.right, 0);
      const dy = Math.max(a.top - r.bottom, r.top - a.bottom, 0);
      if (Math.hypot(dx, dy) < 12) probs.push(`${b.id || b.className} is ${Math.hypot(dx, dy).toFixed(1)}px from an arrow`);
    }
  }
  const strip = document.getElementById('strip-root')!;
  if (strip.scrollWidth > strip.clientWidth + 0.5) probs.push(`the strip overflows sideways by ${strip.scrollWidth - strip.clientWidth}px`);
  if (document.documentElement.scrollWidth > innerWidth + 0.5) probs.push('the page is wider than the screen');
  return [...new Set(probs)];
}

const PHONES = DEVICES.filter(d => /iPhone|Android/.test(d[0]));
for (const device of PHONES) {
  for (const side of ['left', 'right'] as const) {
    test(`${device[0]}, arrows on the ${side}: a connected cross pad clear of every other button, the thread behind Hints`, async ({ browser }) => {
      const { ctx, page, errors } = await open(browser, device, side);
      await openLevel(page, 1);
      await page.locator('#start-begin').click();
      await expect(page.locator('#start-veil')).toBeHidden();
      await page.waitForSelector('#stage[data-cell]');
      expect(await page.evaluate(() => document.getElementById('frame')!.classList.contains('pad-right'))).toBe(side === 'right');
      expect(await page.evaluate(plusPad, { side, min: 44 })).toEqual([]);
      expect(await page.evaluate(clearOfArrows)).toEqual([]);
      // Hint, Route and Auto wait behind Hints, which stands left of the look swap on either side.
      for (const id of ['btn-hint', 'btn-route', 'btn-auto']) await expect(page.locator(`#${id}`)).toBeHidden();
      const thread = page.locator('#btn-thread');
      await expect(thread).toBeVisible();
      await expect(thread).toHaveAttribute('aria-expanded', 'false');
      if (device[0].includes('portrait')) {
        // The bottom row reads Hints, Menu, look swap on either side; Menu has left the status bar for it.
        await expect(page.locator('#btn-menu-strip')).toBeVisible();
        await expect(page.locator('#btn-menu')).toBeHidden();
        const order = await page.evaluate(() => ['btn-thread', 'btn-menu-strip', 'btn-look']
          .map(id => document.getElementById(id)!.getBoundingClientRect().left));
        expect(order, 'Hints, Menu, look swap from left to right').toEqual([...order].sort((a, b) => a - b));
      } else {
        await expect(page.locator('#btn-menu-strip')).toBeHidden();
        await expect(page.locator('#btn-menu')).toBeVisible();
      }
      await thread.click();
      await expect(thread).toHaveAttribute('aria-expanded', 'true');
      for (const id of ['btn-hint', 'btn-route', 'btn-auto']) await expect(page.locator(`#${id}`)).toBeVisible();
      expect(await page.evaluate(clearOfArrows), 'the open panel stays clear of the arrows').toEqual([]);
      expect(await page.evaluate(() => {
        const r = document.getElementById('thread-panel')!.getBoundingClientRect();
        return r.left >= -0.5 && r.top >= -0.5 && r.right <= innerWidth + 0.5 && r.bottom <= innerHeight + 0.5;
      }), 'the panel is on screen').toBe(true);
      // A tap outside shuts it; a choice acts, shuts it and gives the focus back to Thread.
      await page.locator('#status-root .stat').first().click();
      await expect(page.locator('#thread-panel')).toBeHidden();
      await thread.click();
      await page.locator('#btn-hint').click();
      await expect(page.locator('#thread-panel')).toBeHidden();
      await expect.poll(() => page.evaluate(runState)).toMatchObject({ moves: 1 });
      await expect(thread).toBeFocused();
      expect(errors).toEqual([]);
      await ctx.close();
    });
  }
}

/** The title card's picture: the file the veil's background names, and whether that file loads as an image. */
const titleArt = async () => {
  const bg = getComputedStyle(document.getElementById('title-veil')!).backgroundImage;
  const url = /url\("?([^")]*title-(?:wide|tall)\.webp)"?\)/.exec(bg)?.[1];
  if (!url) return { file: null, w: 0, h: 0 };
  const img = new Image();
  img.src = url;
  try { await img.decode(); } catch { return { file: url.split('/').pop(), w: 0, h: 0 }; }
  return { file: url.split('/').pop(), w: img.naturalWidth, h: img.naturalHeight };
};

/** Every button on the title card is the topmost thing at its own centre, so a tap there reaches it. */
const titleButtonsOnTop = () => [...document.querySelectorAll<HTMLElement>('#title-veil .title-actions button')]
  .filter(b => {
    const r = b.getBoundingClientRect();
    return !b.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
  }).map(b => b.id);

for (const [name, file, w, h] of [['Desktop', 'title-wide.webp', 1920, 1080], ['iPhone 15, portrait', 'title-tall.webp', 1080, 1920]] as const) {
  test(`${name}: the title card stands over the Labyrinth's entrance, its buttons on screen and working`, async ({ browser }) => {
    const { ctx, page, errors } = await open(browser, DEVICES.find(d => d[0] === name)!);
    try {
      // One level cleared, so Continue shows too.
      await page.evaluate(() => localStorage.setItem('crete-progress', JSON.stringify({ 'trial-1': { cleared: true, best: 9 } })));
      await page.reload();
      await expect(page.locator('#title-veil')).toBeVisible();
      // The framing that fits the screen: landscape for a desktop, portrait for a phone, and it loads.
      expect(await page.evaluate(titleArt)).toEqual({ file, w, h });
      expect(await page.evaluate(cardFits, '#title-veil .card'), 'title card on screen').toBe(true);
      for (const id of ['title-continue', 'title-play', 'title-story', 'title-editor', 'title-settings']) await expect(page.locator(`#${id}`)).toBeVisible();
      expect(await page.evaluate(titleButtonsOnTop), 'buttons covered by something').toEqual([]);
      // The card's title sits in the picture's upper half (its dark sky), so the door shows below it.
      const head = (await page.locator('#title-name').boundingBox())!;
      expect(head.y + head.height).toBeLessThan((await page.evaluate(() => innerHeight)) / 2);
      // The buttons still do what they did: Settings opens the menu, Q closes it, New Game opens the new-game card.
      await page.locator('#title-settings').click();
      await expect(page.locator('#menu-veil')).toBeVisible();
      await page.keyboard.press('q');
      await expect(page.locator('#menu-veil')).toBeHidden();
      await page.locator('#title-play').click();
      await expect(page.locator('#look-veil')).toBeVisible();
      expect(await page.evaluate(lookTiles, '#look-veil'), 'new-game card pictures').toEqual([]);
      await page.locator('#pick-back').click();
      await page.locator('#title-continue').click();
      await expect(page.locator('#chapter-veil')).toBeVisible();
      expect(errors).toEqual([]);
    } finally {
      await ctx.close();
    }
  });
}

test('iPhone 15, portrait: H, V and T still work, and Thread shows the route and the play-out', async ({ browser }) => {
  const { ctx, page, errors } = await open(browser, DEVICES.find(d => d[0] === 'iPhone 15, portrait')!);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openLevel(page, 1);
  await page.locator('#start-begin').click();
  await page.waitForSelector('#stage[data-cell]');
  await page.keyboard.press('h');
  await expect.poll(() => page.evaluate(runState)).toMatchObject({ moves: 1 });
  await expect(page.locator('#btn-thread')).not.toHaveClass(/\bon\b/);
  await page.keyboard.press('v');
  await expect(page.locator('#btn-thread')).toHaveClass(/\bon\b/);
  await page.locator('#btn-thread').click();
  await expect(page.locator('#btn-route')).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('q');
  await expect(page.locator('#thread-panel'), 'Q shuts the panel').toBeHidden();
  await expect(page.locator('#menu-veil'), 'and opens no menu').toBeHidden();
  await expect(page.locator('#btn-thread')).toBeFocused();
  await page.keyboard.press('t');
  await expect.poll(() => page.evaluate(runState)).toMatchObject({ outcome: 'won' });
  expect(errors).toEqual([]);
  await ctx.close();
});

test('Desktop: the pad is a connected cross on the left, and Hint, Route and Auto stand in the strip with no Thread button', async ({ browser }) => {
  const { ctx, page, errors } = await open(browser, DEVICES[0]!);
  await openLevel(page, 1);
  await page.locator('#start-begin').click();
  await page.waitForSelector('#stage[data-cell]');
  expect(await page.evaluate(plusPad, { side: 'left', min: 44 })).toEqual([]);
  for (const id of ['btn-hint', 'btn-route', 'btn-auto']) await expect(page.locator(`#${id}`)).toBeVisible();
  await expect(page.locator('#btn-thread')).toHaveCount(0);
  expect(errors).toEqual([]);
  await ctx.close();
});

test('iPhone SE, portrait: Arrows in the menu moves the pad at once, and the choice survives a reload', async ({ browser }) => {
  const { ctx, page, errors } = await open(browser, DEVICES.find(d => d[0] === 'iPhone SE, portrait')!);
  await openLevel(page, 1);
  await page.locator('#start-begin').click();
  await page.waitForSelector('#stage[data-cell]');
  expect(await page.evaluate(plusPad, { side: 'left', min: 44 })).toEqual([]);
  await page.locator('#btn-menu:visible, #btn-menu-strip:visible').first().click();
  await expect(page.locator('#pad-left')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#pad-right').click();
  await expect(page.locator('#pad-right')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#menu-close').click();
  expect(await page.evaluate(plusPad, { side: 'right', min: 44 })).toEqual([]);
  expect(await page.evaluate(clearOfArrows)).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem('crete-pad'))).toBe('right');
  await page.reload();
  await expect(page.locator('#title-veil')).toBeVisible();
  expect(await page.evaluate(() => document.getElementById('frame')!.classList.contains('pad-right')), 'mirrored from the start').toBe(true);
  await openLevel(page, 1);
  await page.locator('#start-begin').click();
  await page.waitForSelector('#stage[data-cell]');
  expect(await page.evaluate(plusPad, { side: 'right', min: 44 })).toEqual([]);
  expect(errors).toEqual([]);
  await ctx.close();
});

// Level 8 (12 x 10) keeps 8 px cells and every control on the smallest phone.
for (const device of DEVICES.filter(d => d[0].startsWith('iPhone SE'))) {
  test(`${device[0]}: level 8 keeps 8 px cells and every control on screen`, async ({ browser }) => {
    const { ctx, page, errors } = await open(browser, device);
    await openLevel(page, 8);
    await page.locator('#start-begin').click();
    await expect(page.locator('#start-veil')).toBeHidden();
    await page.waitForSelector('#stage[data-cell]');
    await page.evaluate(setWorst);
    await expect.poll(() => page.evaluate(measure)).toEqual([]);
    expect(Number(await page.locator('#stage').getAttribute('data-cell'))).toBeGreaterThanOrEqual(8);
    expect(errors).toEqual([]);
    await ctx.close();
  });
}

/** The classic board as the test hook reads it (src/main.ts). */
type ClassicHook = {
  at(c: number, r: number): { x: number; y: number } | null;
  under(x: number, y: number): { c: number; r: number } | null;
  box(): { left: number; top: number; right: number; bottom: number } | null;
};

/** Problems with the classic board at its default: the view does not scroll and the whole level, with the figures'
 *  headroom above it, is inside it. */
const wholeShown = () => {
  const out: string[] = [];
  const v = document.getElementById('stage-view')!;
  if (v.scrollLeft !== 0 || v.scrollTop !== 0) out.push('the view scrolls');
  const r = (window as unknown as { __creteTest: { classic: ClassicHook } }).__creteTest.classic.box();
  const b = v.getBoundingClientRect();
  if (!r) out.push('no board');
  else if (r.left < b.left - 0.5 || r.top < b.top - 0.5 || r.right > b.right + 0.5 || r.bottom > b.bottom + 0.5) out.push('the level is cut off');
  return out;
};

// Every level of Chapter 1, level 10 (20 x 13) included, shows whole at the start, with nothing scrolling, on every device,
// at 9 px a cell or more (the opening 75° view's lens widens the near edge a little: level 10 takes 9 px cells on an
// iPhone SE held sideways).
for (const device of DEVICES) {
  test(`${device[0]}: levels 1 to 10 show whole, unscrolled`, async ({ browser }) => {
    const { ctx, page, errors } = await open(browser, device);
    for (let i = 1; i <= 10; i++) {
      await page.goto('games/crete/');
      await openLevel(page, i);
      await expect(page.locator('#start-veil .kicker')).toHaveText(`Chapter 1 · Level ${i}`);
      await page.locator('#start-begin').click();
      await expect(page.locator('#start-veil')).toBeHidden();
      await page.waitForSelector('#stage[data-cell]');
      expect(await page.evaluate(wholeShown), `level ${i}`).toEqual([]);
      expect(Number(await page.locator('#stage').getAttribute('data-cell')), `level ${i} cells`).toBeGreaterThanOrEqual(9);
    }
    expect(errors).toEqual([]);
    await ctx.close();
  });
}

/** The turn count and outcome of the run. */
const runState = () => {
  const t = (window as unknown as { __creteTest: { game: { run: { now: { moves: number; outcome: string } } } } }).__creteTest;
  return { moves: t.game.run.now.moves, outcome: t.game.run.now.outcome };
};

/** The player's square is inside the board's visible rect: its centre, half a cell in from every edge. */
const playerVisible = () => {
  const t = (window as unknown as { __creteTest: { game: { run: { now: { player: { r: number; c: number } } } }; classic: ClassicHook } }).__creteTest;
  const p = t.game.run.now.player;
  const at = t.classic.at(p.c, p.r);
  const half = Number(document.getElementById('stage')!.dataset.cell) / 2;
  const b = document.getElementById('stage-view')!.getBoundingClientRect();
  return !!at && at.x - half >= b.left - 0.5 && at.y - half >= b.top - 0.5 && at.x + half <= b.right + 0.5 && at.y + half <= b.bottom + 0.5;
};

const cellOf = (page: Page) => page.locator('#stage').getAttribute('data-cell').then(Number);

/** Clicks a zoom button, opening the View button first where it stands for them (a narrow touch screen). */
async function zoomButton(page: Page, id: string): Promise<void> {
  const view = page.locator('#classic-cam .modern-viewbtn');
  if (await view.isVisible() && await view.getAttribute('aria-expanded') === 'false') await view.click();
  await page.locator(`#${id}`).click();
}

/** Two fingers spread apart over the middle of the board, as pointer events. */
const pinchOut = () => {
  const v = document.getElementById('stage-view')!;
  const r = v.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  const fire = (type: string, id: number, x: number) =>
    v.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', clientX: x, clientY: cy, bubbles: true, isPrimary: id === 1 }));
  fire('pointerdown', 1, cx - 20);
  fire('pointerdown', 2, cx + 20);
  for (let d = 20; d <= 60; d += 10) {
    fire('pointermove', 1, cx - d);
    fire('pointermove', 2, cx + d);
  }
  fire('pointerup', 1, cx - 60);
  fire('pointerup', 2, cx + 60);
};

// Level 10 (20 x 13) is wider than a phone: it shows whole at the start; zoomed in, its board pans inside the view,
// never the page, keeps the zoom at every step and follows Theseus; Reset shows the whole level again.
const MOVE: Record<string, string> = { up: '.mv-up', down: '.mv-down', left: '.mv-left', right: '.mv-right', wait: '#btn-wait' };
for (const device of DEVICES.filter(d => d[0].startsWith('iPhone SE, portrait') || d[0].startsWith('iPhone 15, portrait'))) {
  test(`${device[0]}: level 10 shows whole; zoomed in, every step keeps the zoom and Theseus in view`, async ({ browser }) => {
    const { ctx, page, errors } = await open(browser, device);
    await openLevel(page, 10);
    await page.locator('#start-begin').click();
    await expect(page.locator('#start-veil')).toBeHidden();
    await page.waitForSelector('#stage[data-cell]');
    expect(await page.evaluate(wholeShown), 'the whole level at the start').toEqual([]);
    const whole = await cellOf(page);
    expect(whole).toBeGreaterThanOrEqual(15);

    // A pinch zooms in; Reset shows the whole level again.
    await page.evaluate(pinchOut);
    await expect.poll(() => cellOf(page), 'a pinch zooms in').toBeGreaterThan(whole);
    await zoomButton(page, 'classic-reset');
    await expect.poll(() => cellOf(page), 'Reset').toBe(whole);
    expect(await page.evaluate(wholeShown), 'the whole level after Reset').toEqual([]);

    // + zooms in twice; the board is then wider than the view, and the page never scrolls.
    await zoomButton(page, 'classic-zoom-in');
    await zoomButton(page, 'classic-zoom-in');
    const zoomed = await cellOf(page);
    expect(zoomed).toBeGreaterThan(whole * 1.3);
    const probs = await page.evaluate(() => {
      const out: string[] = [];
      const doc = document.documentElement;
      if (doc.scrollHeight > innerHeight + 0.5) out.push('page taller than the screen');
      if (doc.scrollWidth > innerWidth + 0.5) out.push('page wider than the screen');
      const v = document.getElementById('stage-view')!;
      const r = (window as unknown as { __creteTest: { classic: ClassicHook } }).__creteTest.classic.box()!;
      if (!(r.right - r.left > v.clientWidth)) out.push('the zoomed board is not wider than the view');
      if (v.scrollLeft !== 0 || v.scrollTop !== 0) out.push('the view scrolls');
      return out;
    });
    expect(probs).toEqual([]);
    expect(await page.evaluate(playerVisible), 'visible once zoomed').toBe(true);

    const steps = await page.evaluate(() => {
      const t = (window as unknown as { __creteTest: { game: { run: { now: unknown } }; solve(s: unknown): { solved: boolean; line: { kind: string; dir?: string; tool?: string }[] } } }).__creteTest;
      const r = t.solve(t.game.run.now);
      return r.solved ? r.line.map(a => (a.kind === 'move' ? a.dir! : a.kind === 'tool' ? `tool-${a.tool}` : a.kind)) : [];
    });
    expect(steps.length).toBeGreaterThan(0);
    let flipped = false;
    let toasted = false;
    for (const [i, s] of steps.entries()) {
      const before = await page.evaluate(runState);
      await page.locator(MOVE[s] ?? `#${s}`).click();
      await expect.poll(() => page.evaluate(runState), `step ${i + 1} (${s}) is a turn`).toMatchObject({ moves: before.moves + 1 });
      expect(await page.evaluate(playerVisible), `step ${i + 1} (${s})`).toBe(true);
      expect(await cellOf(page), `step ${i + 1} (${s}) keeps the zoom`).toBe(zoomed);
      // Undo keeps the zoom too.
      if (i === 0) {
        await page.locator('#btn-undo').click();
        await expect.poll(() => page.evaluate(runState), 'undone').toMatchObject({ moves: before.moves });
        expect(await cellOf(page), 'Undo keeps the zoom').toBe(zoomed);
        await page.locator(MOVE[s] ?? `#${s}`).click();
        await expect.poll(() => page.evaluate(runState), 'step 1 again').toMatchObject({ moves: before.moves + 1 });
      }
      // Once the board has panned, a toast is still inside the board's visible rect (it does not move with it).
      if (!toasted && device[0].startsWith('iPhone 15') && i > 0) {
        toasted = true;
        const inside = await page.evaluate(() => {
          const t = document.getElementById('toast')!;
          t.textContent = 'Relic taken';
          t.className = 'toast show good';
          const r = t.getBoundingClientRect();
          const b = document.getElementById('stage-view')!.getBoundingClientRect();
          return r.width > 0 && r.left >= b.left - 0.5 && r.top >= b.top - 0.5 && r.right <= b.right + 0.5 && r.bottom <= b.bottom + 0.5;
        });
        expect(inside, 'the toast stays on the visible board after it scrolled').toBe(true);
      }
      // Half way through, a phone turned sideways and back keeps the player in view and the zoom.
      if (!flipped && i >= steps.length / 2 && device[0].startsWith('iPhone 15')) {
        flipped = true;
        await page.setViewportSize({ width: 852, height: 393 });
        await expect.poll(() => page.evaluate(playerVisible), 'landscape').toBe(true);
        await page.setViewportSize({ width: 393, height: 852 });
        await expect.poll(() => page.evaluate(playerVisible), 'back to portrait').toBe(true);
        await expect.poll(() => cellOf(page), 'back to portrait, the same zoom').toBe(zoomed);
      }
    }
    await expect.poll(() => page.evaluate(runState), 'the route ends in a win').toMatchObject({ outcome: 'won' });
    if (device[0].startsWith('iPhone 15')) expect(toasted, 'the board panned, so the toast was checked').toBe(true);
    expect(errors).toEqual([]);
    await ctx.close();
  });
}

// With a mouse: the wheel zooms toward the pointer, the zoom buttons stand at the board's top-right, and a double
// click and Restart show the whole level again.
test('Desktop: the wheel zooms the classic board; a double click and Restart show the whole level', async ({ browser }) => {
  const { ctx, page, errors } = await open(browser, DEVICES[0]!);
  await openLevel(page, 10);
  await page.locator('#start-begin').click();
  await expect(page.locator('#start-veil')).toBeHidden();
  await page.waitForSelector('#stage[data-cell]');
  const whole = await cellOf(page);
  await expect(page.locator('#classic-zoom-in')).toBeVisible();
  await expect(page.locator('#classic-cam .modern-viewbtn')).toBeHidden();
  const box = (await page.locator('#stage-view').boundingBox())!;
  const px = box.x + box.width * 0.7, py = box.y + box.height * 0.6;
  const under = () => page.evaluate(([x, y]) => (window as unknown as { __creteTest: { classic: ClassicHook } }).__creteTest.classic.under(x!, y!)!, [px, py]);
  const before = await under();
  await page.mouse.move(px, py);
  await page.mouse.wheel(0, -400);
  await expect.poll(() => cellOf(page), 'the wheel zooms in').toBeGreaterThan(whole);
  expect(await cellOf(page)).toBeLessThanOrEqual(64);
  const after = await under();
  expect(Math.hypot(after.c - before.c, after.r - before.r), 'toward the pointer: the same square stays under it').toBeLessThan(0.5);
  await page.locator('#stage-view').dblclick();
  await expect.poll(() => cellOf(page), 'a double click').toBe(whole);
  expect(await page.evaluate(wholeShown)).toEqual([]);
  // Restart begins the level again at the whole level.
  await page.locator('#classic-zoom-in').click();
  await expect.poll(() => cellOf(page), '+').toBeGreaterThan(whole);
  await page.locator('#btn-wait').click();
  await expect.poll(() => page.evaluate(runState)).toMatchObject({ moves: 1 });
  await page.locator('#btn-restart').click();
  await expect.poll(() => cellOf(page), 'Restart shows the whole level').toBe(whole);
  expect(errors).toEqual([]);
  await ctx.close();
});
