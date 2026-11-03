// Endless: the title card's Endless opens its card; New Run opens a level made for the run, which plays like any
// other; the worker makes the next level meanwhile and the page stays responsive; a win offers Next Level, which
// opens level 2; the run is saved, and Continue comes back to it after a reload.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const PAGE = 'games/crete/';
const allMet = (): void => localStorage.setItem('crete-met', '["*"]');

interface CreteHook {
  game: { run: { now: { moves: number; outcome: string } } | null; press(a: string): void };
  endless: { setBudget(n: number): void; saved: { run(): { depth: number; next: unknown; cleared: number } | null } };
}
/** The page's window as the hook types it. */
type Hooked = Window & { __creteTest: CreteHook };

/** The longest the page's main thread went without running a timer over `ms`, sampled every 16 ms. */
async function longestStall(page: Page, ms: number): Promise<number> {
  return page.evaluate(ms => new Promise<number>(resolve => {
    let last = performance.now(), worst = 0;
    const end = last + ms;
    const tick = () => {
      const now = performance.now();
      worst = Math.max(worst, now - last);
      last = now;
      if (now < end) setTimeout(tick, 16);
      else resolve(worst);
    };
    setTimeout(tick, 16);
  }), ms);
}

async function openEndless(page: Page, look: 'classic' | 'modern'): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(allMet);
  await page.addInitScript(l => localStorage.setItem('crete-look', l), look);
  await page.goto(PAGE);
  await expect(page.locator('#title-veil')).toBeVisible();
  // The specs' budget keeps a search short: past it the level is the bank's.
  await page.evaluate(() => (window as unknown as Hooked).__creteTest.endless.setBudget(1_500_000));
  await page.locator('#title-endless').click();
  await expect(page.locator('#endless-veil')).toBeVisible();
  await expect(page.locator('#endless-title')).toHaveText('Endless');
  return errors;
}

for (const look of ['classic', 'modern'] as const) {
  test(`Endless in ${look}: a new run, a move, a win, Next Level, and the page responsive while the next level is made`, async ({ page }) => {
    test.setTimeout(120_000);
    const errors = await openEndless(page, look);
    await page.locator('#endless-new').click();
    await expect(page.locator('#start-veil')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('#start-veil .kicker')).toHaveText('Endless · Level 1');
    await expect(page.locator('#hud-trial')).toHaveText('Endless • Level 1');
    await page.locator('#start-begin').click();
    // The board settles first (Modern builds its scene once); then, while the worker is still making level 2,
    // the page keeps answering.
    await page.waitForTimeout(2_000);
    expect(await page.evaluate(() => (window as unknown as Hooked).__creteTest.endless.saved.run()!.next), 'the worker is still searching').toBeNull();
    expect(await longestStall(page, 1500), 'no long stall on the page while the worker searches').toBeLessThan(250);
    const before = await page.evaluate(() => (window as unknown as Hooked).__creteTest.game.run!.now.moves);
    for (const key of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) {
      await page.keyboard.press(key);
      if (await page.evaluate(b => (window as unknown as Hooked).__creteTest.game.run!.now.moves > b, before)) break;
    }
    expect(await page.evaluate(() => (window as unknown as Hooked).__creteTest.game.run!.now.moves)).toBeGreaterThan(before);
    // Ariadne's thread plays the rest out.
    await page.keyboard.press('r');
    await page.keyboard.press('t');
    await expect(page.locator('#end-veil')).toBeVisible({ timeout: 60_000 });
    await expect(page.locator('#end-kicker')).toHaveText('Endless · Level 1 cleared');
    await expect(page.locator('#end-score')).toContainText('best possible');
    await page.locator('#end-next').click();
    await expect(page.locator('#start-veil .kicker')).toHaveText('Endless · Level 2', { timeout: 60_000 });
    expect(await page.evaluate(() => (window as unknown as Hooked).__creteTest.endless.saved.run()!.depth)).toBe(2);
    expect(errors).toEqual([]);
  });
}

test('the run is saved: after a reload the Endless card offers Continue, and Q goes back to the title card', async ({ page }) => {
  test.setTimeout(60_000);
  await openEndless(page, 'classic');
  await page.locator('#endless-new').click();
  await expect(page.locator('#start-veil')).toBeVisible({ timeout: 20_000 });
  await page.reload();
  await page.locator('#title-endless').click();
  await expect(page.locator('#endless-run')).toContainText('Level 1');
  await expect(page.locator('#endless-continue')).toBeFocused();
  await page.keyboard.press('q');
  await expect(page.locator('#title-veil')).toBeVisible();
  await page.keyboard.press('o');
  await expect(page.locator('#endless-veil')).toBeVisible();
  await page.locator('#endless-continue').click();
  await expect(page.locator('#start-veil .kicker')).toHaveText('Endless · Level 1');
});

test('Endless on a phone: the card fits the screen and the touch pad moves Theseus', async ({ browser }) => {
  test.setTimeout(60_000);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await openEndless(page, 'classic');
  const box = await page.locator('#endless-veil .card').boundingBox();
  expect(box!.width).toBeLessThanOrEqual(390);
  await page.locator('#endless-new').tap();
  await expect(page.locator('#start-veil')).toBeVisible({ timeout: 20_000 });
  await page.locator('#start-begin').tap();
  const before = await page.evaluate(() => (window as unknown as Hooked).__creteTest.game.run!.now.moves);
  for (const arm of ['.mv-up', '.mv-down', '.mv-left', '.mv-right']) {
    await page.locator(arm).tap();
    if (await page.evaluate(b => (window as unknown as Hooked).__creteTest.game.run!.now.moves > b, before)) break;
  }
  expect(await page.evaluate(() => (window as unknown as Hooked).__creteTest.game.run!.now.moves)).toBeGreaterThan(before);
  await context.close();
});
