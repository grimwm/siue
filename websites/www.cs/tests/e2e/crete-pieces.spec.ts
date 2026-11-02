// The new pieces in a real browser: a small level with a Harpy and Daedalus's snare, opened through the test hook.
// The Harpy moves when the player waits; Theseus held in the snare stays put after an arrow key.
// The spec runs with reduced motion, so the hazard animation is covered by the unit tests (board-plan.test.ts), not here.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/** Every Dictionary entry met before the page loads, so no first card (src/ui/meet.tsx) stops these specs' levels. */
const allMet = (): void => localStorage.setItem('crete-met', '["*"]');

test.beforeEach(async ({ context }) => { await context.addInitScript(allMet); });

/** These specs read the classic board's pixels and cells, so they pin the Look setting before the page loads. */
const pinClassic = (): void => localStorage.setItem('crete-look', 'classic');

const PAGE = 'games/crete/';

interface Cell { r: number; c: number }
interface PiecesTest {
  game: { run: { now: { player: Cell; moves: number; hazards: { kind: string; at: Cell }[] } } };
  parse(text: string): unknown;
  playLevel(level: unknown): void;
}
/** The hook's shape as this spec uses it; crete-play.spec.ts declares the global `__creteTest` itself. */
type Hooked = { __creteTest: PiecesTest };

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
  await page.addInitScript(pinClassic);
  await page.goto(PAGE);
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await page.locator('#chapter-enter').click();
  await expect(page.locator('#start-veil')).toBeVisible();
  await page.evaluate(text => {
    const t = (window as unknown as Hooked).__creteTest;
    t.playLevel(t.parse(text));
  }, LEVEL);
  await expect(page.locator('#start-veil')).toBeVisible();
  await page.locator('#start-begin').click();
  await expect(page.locator('#start-veil')).toBeHidden();
  await page.waitForSelector('#stage[data-cell]');
  // data-cell is set when the canvas is sized, before the first paint (which waits for the tile atlas): wait for the
  // board itself, or a cold-cache run reads a blank canvas.
  await page.waitForFunction(() => {
    const stage = document.getElementById('stage') as HTMLCanvasElement;
    const d = stage.getContext('2d')!.getImageData(0, 0, stage.width, stage.height).data;
    for (let i = 3; i < d.length; i += 4 * 97) if (d[i]! > 0) return true;
    return false;
  });
  return errors;
}

const now = (page: Page) => page.evaluate(() => {
  const s = (window as unknown as Hooked).__creteTest.game.run.now;
  return { moves: s.moves, player: s.player, harpy: s.hazards[0]!.at };
});
/** The figures canvas (src/sheet-board.ts) draws the figures upright over the tilted sheet. `keepFigures` keeps what it
 *  shows now; `figuresMoved` gives the mean x of the pixels drawn now and not then, less that of the pixels drawn then
 *  and not now: above zero when the one figure that moved is drawn further right. */
const keepFigures = (page: Page) => page.evaluate(() => {
  const o = document.querySelector('canvas.stage-figures') as HTMLCanvasElement;
  (window as unknown as { kept: Uint8ClampedArray }).kept = o.getContext('2d')!.getImageData(0, 0, o.width, o.height).data;
});
const figuresMoved = (page: Page) => page.evaluate(() => {
  const o = document.querySelector('canvas.stage-figures') as HTMLCanvasElement;
  const now = o.getContext('2d')!.getImageData(0, 0, o.width, o.height).data;
  const then = (window as unknown as { kept: Uint8ClampedArray }).kept;
  let took = 0, tn = 0, left = 0, ln = 0;
  for (let i = 3; i < now.length; i += 4) {
    const x = ((i - 3) / 4) % o.width, a = now[i]! > 128, b = then[i]! > 128;
    if (a && !b) { took += x; tn++; } else if (b && !a) { left += x; ln++; }
  }
  return tn && ln ? took / tn - left / ln : 0;
});

test('Wait moves the Harpy, and the board shows it', async ({ page }) => {
  const errors = await open(page);
  const before = await now(page);
  expect(before.harpy).toEqual({ r: 3, c: 3 });
  await keepFigures(page);
  await page.locator('#btn-wait').click();
  const after = await now(page);
  expect(after.moves).toBe(1);
  expect(after.harpy, 'the Harpy flew one cell right').toEqual({ r: 3, c: 4 });
  // Only the Harpy moved, so the pixels it left and the pixels it took show it drawn one cell further right.
  await expect.poll(() => figuresMoved(page), { message: 'the board draws it further right' }).toBeGreaterThan(0);
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
