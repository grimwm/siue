// Crete's chapter flow: Play shows the chapter card, a win that takes a story page names it on the end card,
// and the menu's Lore book lists it. The page-taking line is solved in the page from a copy of level 9 whose page
// is a relic, so the solver's win must take it; the same line then wins the real level through the strip. Then
// level 10's win opens Chapter 1's closing card, whose Continue goes on to Chapter 2.
import { test, expect } from '@playwright/test';

/** Every Dictionary entry met before the page loads, so no first card (src/ui/meet.tsx) stops these specs' levels. */
const allMet = (): void => localStorage.setItem('crete-met', '["*"]');

test.beforeEach(async ({ context }) => { await context.addInitScript(allMet); });

const PAGE = 'games/crete/';
/* These specs walk the rules, not the look: the classic board keeps the page quick on a software-GL runner. */
const pinClassic = (): void => localStorage.setItem('crete-look', 'classic');

test.beforeEach(async ({ page }) => { await page.addInitScript(pinClassic); });
const BUTTON: Record<string, string> = { up: '.mv-up', down: '.mv-down', left: '.mv-left', right: '.mv-right', wait: '#btn-wait' };

interface Act { kind: string; dir?: string }
interface Lv { objects: (string | null)[]; relics: number; pageIds: string[]; pageCells: number[] }
interface CreteTest {
  solve(s: unknown): { solved: boolean; line: Act[] };
  initial(level: unknown): unknown;
  trialLevel(i: number): Lv;
}

test('Play shows the chapter card; a page-taking win names the page, and the Lore book lists it', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(PAGE);
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await expect(page.locator('#chapter-veil')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('#start-veil')).toBeVisible();
  await expect(page.locator('#start-veil .kicker')).toHaveText('Chapter 1 · Level 1');

  // Level 9 (index 8) with its page as a relic: any win of the copy has taken the page's cell.
  const steps = await page.evaluate(() => {
    const t = (window as unknown as { __creteTest: CreteTest }).__creteTest;
    const lv = t.trialLevel(8);
    const copy = { ...lv, objects: lv.objects.map(o => (o === 'page' ? 'relic' : o)), relics: lv.relics + 1, pageIds: [], pageCells: [] };
    const r = t.solve(t.initial(copy));
    return r.solved ? r.line.map(a => (a.kind === 'move' ? a.dir! : a.kind)) : [];
  });
  expect(steps.length).toBeGreaterThan(0);

  await page.keyboard.press('n');
  await page.locator('#level-9').click();
  await expect(page.locator('#start-veil')).toBeVisible();
  await page.locator('#start-begin').click();
  let opened = 0;
  for (const s of steps) {
    await page.locator(BUTTON[s]!).click();
    // Taking the page opens its Lore entry over the board; Enter puts it away and the walk goes on.
    if (await page.locator('#lore-veil').isVisible()) {
      opened++;
      await expect(page.locator('#lore-entry-title')).toHaveText("A Tribute's Marks");
      await page.keyboard.press('Enter');
      await expect(page.locator('#lore-veil')).toBeHidden();
    }
  }
  expect(opened, 'the page opened its entry once').toBe(1);

  await expect(page.locator('#end-veil')).toBeVisible();
  await expect(page.locator('#end-kicker')).toHaveText('Level 9 cleared');
  await expect(page.locator('#end-pages')).toHaveText("You found a page: A Tribute's Marks. It is in the Lore book.");

  // The menu's Lore book lists the page by title, and opening it shows its words.
  await page.locator('#end-trials').click();
  await page.keyboard.press('q');
  await page.keyboard.press('q');
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
  await page.locator('#menu-lore').click();
  await expect(page.locator('#lore-veil')).toBeVisible();
  const entry = page.locator('#lore-page-ch1-tribute-marks');
  await expect(entry).toContainText("A Tribute's Marks");
  await expect(entry).toContainText('found in level 9');
  await expect(page.locator('#lore-page-ch1-chalk')).toContainText('? ? ?');
  await entry.click();
  await expect(page.locator('#lore-entry-text')).toContainText('He does not tire');
  await page.keyboard.press('q');
  await expect(page.locator('#lore-entry-title')).toHaveCount(0);
  await expect(page.locator('#lore-veil')).toBeVisible();
  await page.keyboard.press('q');
  await expect(page.locator('#lore-veil')).toBeHidden();
  expect(errors).toEqual([]);
});

test("Chapter 1's closing card goes on to Chapter 2: its opening card, then its first level", async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(PAGE);
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await expect(page.locator('#chapter-veil')).toBeVisible();
  await page.keyboard.press('n');
  await page.locator('#level-10').click();
  await expect(page.locator('#start-veil')).toBeVisible();
  await page.locator('#start-begin').click();
  // Level 10 won through the controller: its closing card opens over the end card.
  await page.evaluate(() => {
    const t = (window as unknown as { __creteTest: CreteTest & { game: { press(a: Act): void } } }).__creteTest;
    const r = t.solve(t.initial(t.trialLevel(9)));
    for (const a of r.line) t.game.press(a);
  });
  await expect(page.locator('#chapter-veil')).toBeVisible();
  await expect(page.locator('#chapter-kicker')).toHaveText('Chapter 1 of 10');
  await expect(page.locator('#chapter-next')).toHaveCount(0);
  await page.locator('#chapter-continue').click();
  await expect(page.locator('#chapter-kicker')).toHaveText('Chapter 2 of 10');
  await expect(page.locator('#chapter-title')).toHaveText('The Winding Ways');
  await expect(page.locator('#chapter-text')).toContainText('loose stone');
  await page.keyboard.press('Enter');
  await expect(page.locator('#start-veil')).toBeVisible();
  await expect(page.locator('#start-veil .kicker')).toHaveText('Chapter 2 · Level 1');
  await expect(page.locator('#start-title')).toHaveText('The Loose Stone');
  // The level list shows Chapter 2, with level 10 of Chapter 1 cleared behind it.
  await page.keyboard.press('n');
  await expect(page.locator('#levels-tab-2')).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#level-10')).toContainText('cleared');
  expect(errors).toEqual([]);
});
