// Demo: the title card's Demo plays Endless at Medium by itself, level after level, under no card, banner or tip
// (even for a player who has met nothing yet); a quiet strip says which level plays; a key or a tap goes back to the
// title card and does nothing else; and the player's saved Endless runs, progress and met entries are as they were.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const PAGE = 'games/crete/';

interface CreteHook {
  demo: { active(): boolean; setPace(p: { step?: number; begin?: number; next?: number }): void };
  endless: { setBudget(n: number): void; saves: { medium: { run(): unknown } } };
  game: { playing: boolean; run: { now: { moves: number } } | null };
}
type Hooked = Window & { __creteTest: CreteHook; __demoSeen: string[] };

/** What this browser keeps of the player: every key of the game's but the levels Endless makes ahead in the
 *  background (its upcoming run and the parts of its search), which go on whatever Demo does. */
const kept = (page: Page) => page.evaluate(() => Object.fromEntries(Object.keys(localStorage)
  .filter(k => k.startsWith('crete-') && k !== 'crete-endless-parts').sort()
  .map(k => {
    const v = localStorage.getItem(k)!;
    if (!/^crete-endless-(easy|medium|hard)$/.test(k)) return [k, v];
    const { run = null, best = null } = JSON.parse(v) as { run?: unknown; best?: unknown };
    return [k, run === null && best === null ? null : JSON.stringify({ run, best })];
  })
  .filter(([, v]) => v !== null)));

/** A fast pace and a short search for the spec, and a watch on every card, banner and tip that shows from now on. */
async function prepare(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as Hooked;
    w.__creteTest.endless.setBudget(20_000);
    w.__creteTest.demo.setPace({ step: 40, begin: 150, next: 400 });
    w.__demoSeen = [];
    const look = () => {
      if (!w.__creteTest.demo.active()) return;
      for (const v of document.querySelectorAll<HTMLElement>('.veil:not([hidden])')) w.__demoSeen.push(v.id);
      if (document.querySelector('.banner-box, #tip')) w.__demoSeen.push('banner or tip');
    };
    new MutationObserver(look).observe(document.body, { subtree: true, childList: true, attributes: true });
    setInterval(look, 50);
  });
}

test('Demo plays level after level by itself under no card, and a key goes back to the title card, keeping nothing', async ({ page }) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => localStorage.setItem('crete-look', 'classic'));
  await page.goto(PAGE);
  await expect(page.locator('#title-veil')).toBeVisible();
  await expect(page.locator('#title-demo')).toHaveText(/Demo/);
  await prepare(page);
  const before = await kept(page);
  await page.locator('#title-demo').click();
  await expect(page.locator('#title-veil')).toBeHidden();
  await expect(page.locator('#demo-line')).toHaveText('Demo · Endless Medium · Level 1', { timeout: 30_000 });
  await expect(page.locator('#demo-strip')).toContainText('Tap or press any key to play');
  await expect(page.locator('#hud-trial')).toHaveText('Endless • Level 1');
  // It plays by itself, and goes on to level 2 and then 3 with no press.
  await expect.poll(() => page.evaluate(() => (window as unknown as Hooked).__creteTest.game.run?.now.moves ?? 0), { timeout: 30_000 }).toBeGreaterThan(0);
  await expect(page.locator('#hud-trial')).toHaveText('Endless • Level 2', { timeout: 90_000 });
  await expect(page.locator('#demo-line')).toHaveText('Demo · Endless Medium · Level 2');
  await expect(page.locator('#hud-trial')).toHaveText('Endless • Level 3', { timeout: 90_000 });
  expect(await page.evaluate(() => (window as unknown as Hooked).__demoSeen), 'no card, banner or tip').toEqual([]);
  // A key ends it, and does nothing more: N here would open the new-game card.
  await page.keyboard.press('n');
  await expect(page.locator('#title-veil')).toBeVisible();
  await expect(page.locator('#look-veil')).toBeHidden();
  await expect(page.locator('#demo-strip')).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as Hooked).__creteTest.demo.active())).toBe(false);
  expect(await page.evaluate(() => (window as unknown as Hooked).__creteTest.game.playing)).toBe(false);
  expect(await page.evaluate(() => document.scrollingElement!.scrollTop)).toBe(0);
  // The player's saved runs, progress, met entries and tips are as they were.
  expect(await kept(page)).toEqual(before);
  expect(await page.evaluate(() => (window as unknown as Hooked).__creteTest.endless.saves.medium.run())).toBeNull();
  // The title card works as before: its keys act again.
  await page.keyboard.press('n');
  await expect(page.locator('#look-veil')).toBeVisible();
  expect(errors).toEqual([]);
});

test('on a phone, in Modern, the Demo button starts it and a tap on the board goes back to the title card', async ({ browser }) => {
  test.setTimeout(120_000);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  try {
    const page = await ctx.newPage();
    await page.goto(PAGE);
    await expect(page.locator('#title-veil')).toBeVisible();
    await prepare(page);
    const before = await kept(page);
    await page.locator('#title-demo').tap();
    await expect(page.locator('#demo-line')).toHaveText('Demo · Endless Medium · Level 1', { timeout: 30_000 });
    const strip = await page.locator('#demo-strip').boundingBox();
    expect(strip!.x).toBeGreaterThanOrEqual(0);
    expect(strip!.x + strip!.width).toBeLessThanOrEqual(390);
    await expect.poll(() => page.evaluate(() => (window as unknown as Hooked).__creteTest.game.run?.now.moves ?? 0), { timeout: 30_000 }).toBeGreaterThan(0);
    expect(await page.evaluate(() => (window as unknown as Hooked).__demoSeen), 'no card, banner, tip or touch tour').toEqual([]);
    await expect(page.locator('.tour')).toHaveCount(0);
    // A bare tap at the board's middle: Demo takes the whole press, so Playwright's own checks on it would not see it.
    const board = (await page.locator('#board').boundingBox())!;
    await page.touchscreen.tap(board.x + board.width / 2, board.y + board.height / 2);
    await expect(page.locator('#title-veil')).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as Hooked).__creteTest.demo.active())).toBe(false);
    expect(await kept(page)).toEqual(before);
  } finally {
    await ctx.close();
  }
});
