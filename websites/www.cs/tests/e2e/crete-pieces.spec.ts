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
  classic: { at(c: number, r: number): { x: number; y: number } | null };
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
/** How many dark pixels the figure standing on board cell (r, c) shows. The figures stand upright on the
 *  `.stage-figures` canvas over the tilted sheet, so the box read is a cell wide and a cell high above the square's
 *  projected centre. Figures carry a dark outline and an empty square shows none, so the cell a figure stands on holds
 *  far more than its neighbour, whatever frame of its loop is showing. */
const darkIn = (page: Page, r: number, c: number) => page.evaluate(([r, c]) => {
  const at = (window as unknown as Hooked).__creteTest.classic.at(c, r)!;
  const o = document.querySelector('.stage-figures') as HTMLCanvasElement;
  const box = o.getBoundingClientRect();
  const k = o.width / box.width;
  const cell = Number((document.getElementById('stage') as HTMLElement).dataset.cell) * k;
  const d = o.getContext('2d')!.getImageData(Math.round((at.x - box.left) * k - cell / 2), Math.round((at.y - box.top) * k - cell), Math.round(cell), Math.round(cell)).data;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) if (d[i + 3]! > 200 && d[i]! + d[i + 1]! + d[i + 2]! < 180) n++;
  return n;
}, [r, c] as const);

test('Wait moves the Harpy, and the board shows it', async ({ page }) => {
  const errors = await open(page);
  const before = await now(page);
  expect(before.harpy).toEqual({ r: 3, c: 3 });
  expect(await darkIn(page, 3, 3), 'the Harpy is drawn at its start').toBeGreaterThan(await darkIn(page, 3, 4));
  await page.locator('#btn-wait').click();
  const after = await now(page);
  expect(after.moves).toBe(1);
  expect(after.harpy, 'the Harpy flew one cell right').toEqual({ r: 3, c: 4 });
  await expect.poll(async () => (await darkIn(page, 3, 4)) - (await darkIn(page, 3, 3)), { message: 'the board draws it in its new cell' })
    .toBeGreaterThan(0);
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
