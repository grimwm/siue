// The new pieces in a real browser: a small level with a Harpy and Daedalus's snare, opened through the test hook.
// The Harpy moves when the player waits; Theseus held in the snare stays put after an arrow key.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const PAGE = 'games/crete/';

interface Cell { r: number; c: number }
interface PiecesTest {
  game: { run: { now: { player: Cell; moves: number; hazards: { kind: string; at: Cell }[] } } };
  parse(text: string): unknown;
  playLevel(level: unknown): void;
}
declare global {
  interface Window { __creteTest: PiecesTest }
}

const LEVEL = [
  'title: Snare and Harpy',
  'intro: A Harpy flies; a snare waits.',
  'facing: right',
  '',
  '#######',
  '#P&...#',
  '#.....#',
  '#..w..#',
  '#-...E#',
  '#######',
  '',
].join('\n');

/** Opens the level on the real page and closes its start card. */
async function open(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(PAGE);
  await page.locator('#title-play').click();
  await page.locator('#chapter-enter').click();
  await expect(page.locator('#start-veil')).toBeVisible();
  await page.evaluate(text => {
    const t = window.__creteTest;
    t.playLevel(t.parse(text));
  }, LEVEL);
  await expect(page.locator('#start-veil')).toBeVisible();
  await page.locator('#start-begin').click();
  await expect(page.locator('#start-veil')).toBeHidden();
  await page.waitForSelector('#stage[data-cell]');
  return errors;
}

const now = (page: Page) => page.evaluate(() => {
  const s = window.__creteTest.game.run.now;
  return { moves: s.moves, player: s.player, harpy: s.hazards[0]!.at };
});
const canvas = (page: Page) => page.evaluate(() => (document.getElementById('stage') as HTMLCanvasElement).toDataURL());

test('Wait moves the Harpy, and the board shows it', async ({ page }) => {
  const errors = await open(page);
  const before = await now(page);
  expect(before.harpy).toEqual({ r: 3, c: 3 });
  const picture = await canvas(page);
  await page.locator('#btn-wait').click();
  const after = await now(page);
  expect(after.moves).toBe(1);
  expect(after.harpy, 'the Harpy flew one cell right').toEqual({ r: 3, c: 4 });
  // Only proves the board redrew; the Harpy's cell above is what proves where it flew.
  await expect.poll(() => canvas(page)).not.toBe(picture);
  expect(errors).toEqual([]);
});

test("Theseus held in Daedalus's snare stays put after an arrow key", async ({ page }) => {
  const errors = await open(page);
  await page.keyboard.press('ArrowRight');
  expect((await now(page)).player, 'he stepped into the snare').toEqual({ r: 1, c: 2 });
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  const held = await now(page);
  expect(held.player, 'the snare holds him').toEqual({ r: 1, c: 2 });
  expect(held.moves, 'a bump costs no turn').toBe(1);
  expect(errors).toEqual([]);
});
