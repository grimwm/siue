// The item bubble in a real browser, in both looks: while the Minotaur stands on an item a small thought bubble by his
// head shows it, and it goes once he steps off; Theseus never has one, since he picks up whatever he steps on. Read
// from the test hook's `bubbles()` (src/item-bubble.ts) and the bubble's own element over the board.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const allMet = (): void => localStorage.setItem('crete-met', '["*"]');
test.beforeEach(async ({ context }) => { await context.addInitScript(allMet); });

const PAGE = 'games/crete/';

interface Cell { r: number; c: number }
interface Shown { kind: string; c: number; r: number; by: string }
interface BubbleTest {
  game: { run: { now: { player: Cell; minotaur: Cell | null; objects: (string | null)[]; moves: number } } };
  parse(text: string): unknown;
  playLevel(level: unknown): void;
  modern: { active: boolean; frames(): number; bubbles(): Shown[]; at(c: number, r: number): { x: number; y: number } | null };
  classic: { bubbles(): Shown[]; at(c: number, r: number): { x: number; y: number } | null };
}
type Hooked = { __creteTest: BubbleTest };

// One Wait walks the Minotaur two steps left onto the relic; Theseus then steps down onto the red key, and the
// Minotaur's next two steps take him off it.
const LEVEL = ['title: Under the hoof', 'intro: Wait.', '', '#########', '#P..*.M.#', '#r......#', '#......E#', '#########', ''].join('\n');

async function open(page: Page, look: 'classic' | 'modern'): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(l => localStorage.setItem('crete-look', l), look);
  await page.goto(PAGE);
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await page.locator('#chapter-enter').click();
  await expect(page.locator('#start-veil')).toBeVisible();
  await page.evaluate(t => {
    const h = (window as unknown as Hooked).__creteTest;
    h.playLevel(h.parse(t));
  }, LEVEL);
  await page.locator('#start-begin').click();
  await expect(page.locator('#start-veil')).toBeHidden();
  if (look === 'modern') {
    await expect.poll(() => page.evaluate(() => (window as unknown as Hooked).__creteTest.modern.active)).toBe(true);
    // A headless runner draws Modern slowly: wait for its first frame.
    await expect.poll(() => page.evaluate(() => (window as unknown as Hooked).__creteTest.modern.frames()), { timeout: 30_000 }).toBeGreaterThan(0);
  } else await page.waitForSelector('#stage[data-cell]');
  return errors;
}

const shown = (page: Page, look: 'classic' | 'modern') => page.evaluate(l => (window as unknown as Hooked).__creteTest[l].bubbles(), look);
const now = (page: Page) => page.evaluate(() => {
  const s = (window as unknown as Hooked).__creteTest.game.run.now;
  return { player: s.player, minotaur: s.minotaur, moves: s.moves };
});
/** The bubble element showing, in the look's own layer. */
const cloud = (page: Page, look: 'classic' | 'modern') => page.locator(`.item-bubbles[data-look="${look}"] .item-bubble.shown .item-bubble-cloud`);

for (const look of ['classic', 'modern'] as const) {
  test(`${look}: a bubble shows the item under the Minotaur, goes when he steps off, and never shows for Theseus`, async ({ page }) => {
    const errors = await open(page, look);
    expect(await shown(page, look), 'nothing at the start').toEqual([]);
    await expect(cloud(page, look)).toHaveCount(0);

    await page.locator('#btn-wait').click();
    await expect.poll(() => now(page).then(s => s.minotaur)).toEqual({ r: 1, c: 4 });
    await expect.poll(() => shown(page, look), { message: 'the relic under the Minotaur' })
      .toEqual([{ kind: 'relic', c: 4, r: 1, by: 'minotaur', place: expect.any(Number), x: expect.any(Number), y: expect.any(Number), size: expect.any(Number) }]);
    await expect(cloud(page, look)).toHaveCount(1);
    await expect(cloud(page, look)).toBeVisible();
    // It sits by the Minotaur's head: its middle near his square, above or beside it, on the board.
    const box = (await cloud(page, look).boundingBox())!;
    const foot = (await page.evaluate(l => (window as unknown as Hooked).__creteTest[l].at(4, 1), look))!;
    const mx = box.x + box.width / 2, my = box.y + box.height / 2;
    expect(Math.abs(mx - foot.x), 'beside his square').toBeLessThan(box.width * 2.5);
    expect(my, 'by his head, not his feet').toBeLessThan(foot.y);
    expect(box.width, 'readable').toBeGreaterThanOrEqual(28);

    await page.keyboard.press('ArrowDown');
    await expect.poll(() => now(page).then(s => s.player)).toEqual({ r: 2, c: 1 });
    await expect.poll(() => now(page).then(s => s.minotaur)).toEqual({ r: 1, c: 2 });
    await expect.poll(() => shown(page, look), { message: 'gone once he steps off; none for Theseus on the key' }).toEqual([]);
    await expect(page.locator('.item-bubble')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test('reduced motion: the bubble appears and goes at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = await open(page, 'classic');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#btn-wait').click();
  await expect(cloud(page, 'classic')).toHaveCount(1);
  const fade = await page.locator('.item-bubble.shown').evaluate(e => getComputedStyle(e).transitionDuration);
  expect(fade).toBe('0s');
  expect(errors).toEqual([]);
});
