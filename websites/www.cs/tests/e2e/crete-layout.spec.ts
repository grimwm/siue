// The Island of Crete on ten screens: the frame fills the window, nothing scrolls, every control is on screen
// and not clipped, no control covers the board, the board keeps at least 8 px per cell, and key tabs show only
// where a keyboard is at hand (a mouse, and a frame at least 760 px wide). The chapter card, the level list and the start card are
// checked too, and level 8, the largest board, at the smallest phone sizes.
import { test, expect } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';

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
  put('hud-trial', '10/10'); put('hud-hearts', '♥ 99'); put('hud-relics', '99/99'); put('hud-keys', '9 9 9 9');
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

/** Play, the chapter card's Levels, then level `n`; level 1 shows the chapter card first, so Enter the halls follows. */
async function openLevel(page: Page, n: number): Promise<void> {
  await page.locator('#title-play').click();
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
    // Play opens Chapter 1's card, with both its buttons on screen; Levels opens the list over it.
    await expect(page.locator('#chapter-veil')).toBeVisible();
    expect(await page.evaluate(cardFits, '#chapter-veil .card'), 'chapter card on screen').toBe(true);
    for (const id of ['chapter-enter', 'chapter-levels']) await expect(page.locator(`#${id}`)).toBeVisible();
    await page.locator('#chapter-levels').click();
    await expect(page.locator('#levels-veil')).toBeVisible();
    expect(await page.evaluate(cardFits, '#levels-veil .card'), 'level list on screen').toBe(true);
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

// Level 8 is the largest board of the first eight (12 x 10): it must still keep 8 px cells and every control on the smallest phone.
for (const device of DEVICES.filter(d => d[0].startsWith('iPhone SE'))) {
  test(`${device[0]}: level 8, the largest board, keeps 8 px cells and every control on screen`, async ({ browser }) => {
    const { ctx, page, errors } = await open(browser, device);
    await openLevel(page, 8);
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

// Levels up to 12 x 12 fit their board exactly: #board never scrolls, on every device.
for (const device of DEVICES) {
  test(`${device[0]}: levels 1 to 9 keep the board unscrolled`, async ({ browser }) => {
    const { ctx, page, errors } = await open(browser, device);
    for (let i = 1; i <= 9; i++) {
      await page.goto('games/crete/');
      await openLevel(page, i);
      await expect(page.locator('#start-veil .kicker')).toHaveText(`Chapter 1 · Level ${i}`);
      await page.locator('#start-begin').click();
      await expect(page.locator('#start-veil')).toBeHidden();
      await page.waitForSelector('#stage[data-cell]');
      const board = await page.evaluate(() => {
        const b = document.getElementById('board')!;
        return { sw: b.scrollWidth - b.clientWidth, sh: b.scrollHeight - b.clientHeight, scrolls: b.classList.contains('scrolls') };
      });
      expect(board, `level ${i}`).toEqual({ sw: expect.any(Number), sh: expect.any(Number), scrolls: false });
      expect(board.sw, `level ${i} wide`).toBeLessThanOrEqual(0);
      expect(board.sh, `level ${i} tall`).toBeLessThanOrEqual(0);
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

/** The player's cell is inside the board's visible rect. */
const playerVisible = () => {
  const t = (window as unknown as { __creteTest: { game: { run: { now: { player: { r: number; c: number } } } } } }).__creteTest;
  const p = t.game.run.now.player;
  const stage = document.getElementById('stage')!;
  const sr = stage.getBoundingClientRect();
  const cell = Number(stage.dataset.cell);
  const rows = (window as unknown as { __creteTest: { game: { run: { now: { level: { rows: number } } } } } }).__creteTest.game.run.now.level.rows;
  const rise = sr.height - rows * cell;
  const left = sr.left + p.c * cell;
  const top = sr.top + rise + p.r * cell;
  const b = document.getElementById('board')!.getBoundingClientRect();
  return left >= b.left - 0.5 && top >= b.top - 0.5 && left + cell <= b.right + 0.5 && top + cell <= b.bottom + 0.5;
};

// Level 10 (18 x 11) is wider than a phone: it scrolls inside #board, never the page, and follows Theseus.
const MOVE: Record<string, string> = { up: '.mv-up', down: '.mv-down', left: '.mv-left', right: '.mv-right', wait: '#btn-wait' };
for (const device of DEVICES.filter(d => d[0].startsWith('iPhone SE, portrait') || d[0].startsWith('iPhone 15, portrait'))) {
  test(`${device[0]}: level 10 scrolls inside the board and keeps Theseus in view`, async ({ browser }) => {
    const { ctx, page, errors } = await open(browser, device);
    await openLevel(page, 10);
    await page.locator('#start-begin').click();
    await expect(page.locator('#start-veil')).toBeHidden();
    await page.waitForSelector('#stage[data-cell]');
    const probs = await page.evaluate(() => {
      const out: string[] = [];
      const doc = document.documentElement;
      if (doc.scrollHeight > innerHeight + 0.5) out.push('page taller than the screen');
      if (doc.scrollWidth > innerWidth + 0.5) out.push('page wider than the screen');
      const b = document.getElementById('board')!;
      if (!(b.scrollWidth > b.clientWidth)) out.push('the board does not scroll sideways');
      return out;
    });
    expect(probs).toEqual([]);
    expect(await page.evaluate(playerVisible), 'visible at the start').toBe(true);

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
      // Once the board has scrolled, a toast is still inside the board's visible rect (it does not scroll away).
      if (!toasted && device[0].startsWith('iPhone 15') && await page.evaluate(() => document.getElementById('board')!.scrollLeft > 0)) {
        toasted = true;
        const inside = await page.evaluate(() => {
          const t = document.getElementById('toast')!;
          t.textContent = 'Relic taken';
          t.className = 'toast show good';
          const r = t.getBoundingClientRect();
          const b = document.getElementById('board')!.getBoundingClientRect();
          return r.width > 0 && r.left >= b.left - 0.5 && r.top >= b.top - 0.5 && r.right <= b.right + 0.5 && r.bottom <= b.bottom + 0.5;
        });
        expect(inside, 'the toast stays on the visible board after it scrolled').toBe(true);
      }
      // Half way through, a phone turned sideways and back keeps the player in view.
      if (!flipped && i >= steps.length / 2 && device[0].startsWith('iPhone 15')) {
        flipped = true;
        await page.setViewportSize({ width: 852, height: 393 });
        await expect.poll(() => page.evaluate(playerVisible), 'landscape').toBe(true);
        await page.setViewportSize({ width: 393, height: 852 });
        await expect.poll(() => page.evaluate(playerVisible), 'back to portrait').toBe(true);
      }
    }
    await expect.poll(() => page.evaluate(runState), 'the route ends in a win').toMatchObject({ outcome: 'won' });
    if (device[0].startsWith('iPhone 15')) expect(toasted, 'the board scrolled, so the toast was checked').toBe(true);
    expect(errors).toEqual([]);
    await ctx.close();
  });
}
