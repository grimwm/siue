// Crete's Chapter 1 flow: Play shows the chapter card, a win that takes a story page names it on the end card,
// and the menu's Lore book lists it. The page-taking line is solved in the page from a copy of level 9 whose page
// is a relic, so the solver's win must take it; the same line then wins the real level through the strip.
import { test, expect } from '@playwright/test';

const PAGE = 'games/crete/';
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
  for (const s of steps) await page.locator(BUTTON[s]!).click();

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
