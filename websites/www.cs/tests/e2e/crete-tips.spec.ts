// The rule tips (src/rule-tips.ts) on Chapter 1, Level 1 for a new player: how the Minotaur moves once the start card
// has gone, then what he just did after the first move. Neither stops play: keys and the pad move Theseus with a tip
// up. On a touch phone the touch tour goes first, and the first tip waits for it to end.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const PAGE = 'games/crete/';
const BEAST = 'The Minotaur takes two steps for each of yours, always toward you: across if he can, else up or down.';
const WALLS = 'He went right, then a wall stopped him. He never steps away from you, so a wall in his way can trap him.';

interface Hooked { __creteTest: { game: { run: { now: { moves: number } } } } }
const moves = (page: Page) => page.evaluate(() => (window as unknown as Hooked).__creteTest.game.run.now.moves);

/** A new player's way in: New Game, the look, the chapter card; Chapter 1, Level 1's start card is up. */
async function newGame(page: Page, look: 'modern' | 'classic'): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(l => localStorage.setItem('crete-look', l), look);
  await page.goto(PAGE);
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await page.locator('#chapter-enter').click();
  await expect(page.locator('#start-veil .kicker')).toHaveText('Chapter 1 · Level 1');
  return errors;
}

for (const look of ['classic', 'modern'] as const) {
  test(`${look}: the Minotaur's tip shows as play starts, the next after a move, and neither stops a key`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors = await newGame(page, look);
    await expect(page.locator('#tip'), 'nothing over the start card').toHaveCount(0);
    await page.keyboard.press('Enter');
    await expect(page.locator('#tip-text'), 'how the Minotaur moves').toHaveText(BEAST);
    await expect(page.locator('#tip-ok')).toHaveText('Got It');
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => moves(page), 'the key moves with the tip up').toBe(1);
    await expect(page.locator('#tip-text'), 'what he just did, and that walls hold him').toHaveText(WALLS);
    await page.keyboard.press('ArrowUp');
    await expect.poll(() => moves(page), 'and again').toBe(2);
    await page.locator('#tip-ok').click();
    await expect(page.locator('#tip'), 'Got It puts it away').toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test.describe('on a touch phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });

  test('the first tip waits for the touch tour, and a tap on the pad moves with a tip up', async ({ page }) => {
    const errors = await newGame(page, 'classic');
    await page.locator('#start-begin').tap();
    await expect(page.locator('#tour'), 'the touch tour goes first').toBeVisible();
    await expect(page.locator('#tip'), 'no tip on top of it').toHaveCount(0);
    await page.locator('#tour-done').tap();
    await expect(page.locator('#tour')).toHaveCount(0);
    await expect(page.locator('#tip-text'), 'then how the Minotaur moves').toHaveText(BEAST);
    const box = (await page.locator('#tip').boundingBox())!;
    expect(box.x, 'inside a phone\'s width').toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    await page.locator('.pad .mv-right').tap();
    await expect.poll(() => moves(page), 'the pad moves with the tip up').toBe(1);
    await expect(page.locator('#tip-text')).toHaveText(WALLS);
    await page.locator('#tip-ok').tap();
    await expect(page.locator('#tip')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});
