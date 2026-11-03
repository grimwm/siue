// The title card: its buttons line up in one column at a phone's width and a desktop's, in both looks; and every
// card it opens (the new-game card, the chapter card a new game opens, Endless) goes back to it by its Back button
// and by Escape, with the campaign's progress and Endless's saved run as they were; in an Endless run the menu names
// the seed.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const PAGE = 'games/crete/';
const allMet = (): void => localStorage.setItem('crete-met', '["*"]');
const cleared = (): void => localStorage.setItem('crete-progress', JSON.stringify({ 'trial-1': { cleared: true, best: 9 } }));

interface CreteHook { endless: { saved: { run(): unknown } } }
type Hooked = Window & { __creteTest: CreteHook };
const savedRun = (page: Page) => page.evaluate(() => JSON.stringify((window as unknown as Hooked).__creteTest.endless.saved.run()));

/** Each title button's box, in order. */
async function boxes(page: Page): Promise<{ id: string; x: number; w: number; right: number; h: number }[]> {
  return page.locator('#title-veil .title-menu button').evaluateAll(bs => bs.map(b => {
    const r = b.getBoundingClientRect();
    return { id: b.id, x: r.left, w: r.width, right: r.right, h: r.height };
  }));
}

for (const [name, viewport, touch] of [['a 360 px phone', { width: 360, height: 740 }, true], ['a 412 px phone', { width: 412, height: 915 }, true], ['a desktop', { width: 1280, height: 800 }, false]] as const) {
  for (const look of ['modern', 'classic'] as const) {
    test(`${name}, ${look}: the title buttons share one column, the way in across it and the rest in even halves`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport, hasTouch: touch, isMobile: touch });
      try {
        const page = await ctx.newPage();
        await ctx.addInitScript(l => localStorage.setItem('crete-look', l), look);
        for (const progress of [false, true]) {
          if (progress) await page.evaluate(cleared);
          await page.goto(PAGE);
          await expect(page.locator('#title-veil')).toBeVisible();
          const all = await boxes(page);
          const first = progress ? 'title-continue' : 'title-play';
          expect(all[0]!.id, 'the way in comes first').toBe(first);
          await expect(page.locator(`#${first}`)).toHaveClass('title-primary');
          const wide = all.filter(b => b.id === 'title-continue' || b.id === 'title-play');
          const halves = all.filter(b => !wide.includes(b));
          expect(halves.map(b => b.id)).toEqual(['title-endless', 'title-story', 'title-editor', 'title-settings']);
          const left = all[0]!.x, right = all[0]!.right;
          for (const b of wide) {
            expect(Math.abs(b.x - left), `${b.id}'s left edge`).toBeLessThanOrEqual(1);
            expect(Math.abs(b.w - all[0]!.w), `${b.id}'s width`).toBeLessThanOrEqual(1);
          }
          for (const [i, b] of halves.entries()) {
            expect(Math.abs(b.w - halves[0]!.w), `${b.id}'s width`).toBeLessThanOrEqual(1);
            if (i % 2 === 0) expect(Math.abs(b.x - left), `${b.id}'s left edge`).toBeLessThanOrEqual(1);
            else expect(Math.abs(b.right - right), `${b.id}'s right edge`).toBeLessThanOrEqual(1);
          }
          for (const b of all) expect(b.h, `${b.id} is a finger's size`).toBeGreaterThanOrEqual(44);
          expect(right, 'inside the screen').toBeLessThanOrEqual(viewport.width);
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no sideways scroll').toBe(true);
        }
      } finally {
        await ctx.close();
      }
    });
  }
}

test('Back and Escape from the new-game card and the chapter card return to the title card, Continue still there', async ({ page }) => {
  await page.addInitScript(allMet);
  await page.addInitScript(cleared);
  await page.goto(PAGE);
  await expect(page.locator('#title-continue')).toBeVisible();
  await page.locator('#title-play').click();
  await expect(page.locator('#look-veil')).toBeVisible();
  await page.locator('#pick-back').click();
  await expect(page.locator('#title-veil')).toBeVisible();
  await page.keyboard.press('n');
  await expect(page.locator('#look-veil')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#title-veil'), 'Escape on the new-game card').toBeVisible();
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await expect(page.locator('#chapter-veil')).toBeVisible();
  await page.locator('#chapter-back').click();
  await expect(page.locator('#title-veil'), 'Back on the chapter card').toBeVisible();
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await page.keyboard.press('Escape');
  await expect(page.locator('#title-veil'), 'Escape on the chapter card').toBeVisible();
  await expect(page.locator('#start-veil'), 'no level opened').toBeHidden();
  await expect(page.locator('#title-continue')).toHaveAttribute('title', 'Continue at Chapter 1, Level 2');
  expect(await page.evaluate(() => localStorage.getItem('crete-progress'))).toContain('trial-1');
});

test('Back and Escape from the Endless card return to the title card with the saved run as it was', async ({ page }) => {
  test.setTimeout(60_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(allMet);
  await page.addInitScript(() => localStorage.setItem('crete-look', 'classic'));
  await page.goto(PAGE);
  await page.locator('#title-endless').click();
  await page.locator('#endless-new').click();
  await expect(page.locator('#start-veil')).toBeVisible({ timeout: 20_000 });
  await page.reload();
  const run = await savedRun(page);
  expect(run).not.toBe('null');
  await page.locator('#title-endless').click();
  await expect(page.locator('#endless-continue')).toBeVisible();
  await page.locator('#endless-back').click();
  await expect(page.locator('#title-veil'), 'Back').toBeVisible();
  await page.keyboard.press('o');
  await expect(page.locator('#endless-veil')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#title-veil'), 'Escape').toBeVisible();
  await page.keyboard.press('o');
  await page.locator('#endless-seed-box').fill('abc');
  await page.keyboard.press('Escape');
  await expect(page.locator('#title-veil'), 'Escape from the seed box').toBeVisible();
  expect(await savedRun(page), 'the saved run is untouched').toBe(run);
  await page.keyboard.press('o');
  await expect(page.locator('#endless-run')).toContainText('Level 1');
  // In play, the menu names the run's seed, with Copy Seed Link; a campaign level's menu has neither.
  const seed = (JSON.parse(run) as { seed: string }).seed;
  await page.locator('#endless-continue').click();
  await expect(page.locator('#start-veil')).toBeVisible();
  await page.keyboard.press('q');
  await page.keyboard.press('q');
  await expect(page.locator('#menu-seed')).toHaveText(`Seed: ${seed}`);
  await expect(page.locator('#menu-copy-seed')).toHaveText('Copy Seed Link');
  await page.locator('#quit').click();
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await page.locator('#chapter-enter').click();
  await page.keyboard.press('q');
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
  await expect(page.locator('#menu-seed')).toHaveCount(0);
});
