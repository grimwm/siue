// The hidden walls' cues in a real browser, in both looks (src/wall-cues.ts): an invisible wall Theseus bumps comes
// into view and stays marked, also after switching looks there and back; a fake wall beside him hazes once he has
// stood still a while, and the haze goes when he moves; the start card says the level hides walls. Each look is read
// from what it last drew (`__creteTest.cues()`, the look showing).
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const allMet = (): void => {
  localStorage.setItem('crete-met', '["*"]');
  localStorage.setItem('crete-met-cards', '["*"]');
};
test.beforeEach(async ({ context }) => { await context.addInitScript(allMet); });

const PAGE = 'games/crete/';

interface Cell { r: number; c: number }
interface Shown { found: Cell[]; haze: { at: Cell; face: string }[]; strength: number }
interface CuesTest {
  game: { run: { now: { player: Cell; terrain: string[]; moves: number } } };
  parse(text: string): unknown;
  playLevel(level: unknown): void;
  modern: { active: boolean; frames(): number };
  cues(): Shown | null;
}
type Hooked = { __creteTest: CuesTest };

// Theseus at (2,2): an invisible wall to his right, a fake wall above (1,2)'s right, at (1,3).
const LEVEL = ['title: Hidden', 'intro: Take the relic.', '', '#######', '#..W.E#', '#.PI*.#', '#.....#', '#######', ''].join('\n');

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
  await expect(page.locator('#start-hint')).toHaveText(/glass|paint|stone/);
  await page.locator('#start-begin').click();
  await expect(page.locator('#start-veil')).toBeHidden();
  if (look === 'modern') {
    await expect.poll(() => page.evaluate(() => (window as unknown as Hooked).__creteTest.modern.active)).toBe(true);
    await expect.poll(() => page.evaluate(() => (window as unknown as Hooked).__creteTest.modern.frames()), { timeout: 30_000 }).toBeGreaterThan(0);
  }
  return errors;
}

const cues = (page: Page) => page.evaluate(() => (window as unknown as Hooked).__creteTest.cues());
const lookNow = (page: Page) => page.evaluate(() => localStorage.getItem('crete-look'));

for (const look of ['classic', 'modern'] as const) {
  test(`${look}: a bumped invisible wall stays shown across two look switches`, async ({ page }) => {
    const errors = await open(page, look);
    expect((await cues(page))?.found).toEqual([]);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => page.evaluate(() => (window as unknown as Hooked).__creteTest.game.run.now.terrain[2 * 7 + 3])).toBe('wall');
    await expect.poll(async () => (await cues(page))?.found).toEqual([{ r: 2, c: 3 }]);
    const other = look === 'classic' ? 'modern' : 'classic';
    for (const want of [other, look]) {
      await page.keyboard.press('b');
      await expect.poll(() => lookNow(page)).toBe(want);
      if (want === 'modern') await expect.poll(() => page.evaluate(() => (window as unknown as Hooked).__creteTest.modern.active), { timeout: 30_000 }).toBe(true);
      await expect.poll(async () => (await cues(page))?.found, { message: `still shown in ${want}`, timeout: 15_000 }).toEqual([{ r: 2, c: 3 }]);
    }
    // Restart hides it again: it is state.
    await page.keyboard.press('r');
    await expect.poll(async () => (await cues(page))?.found).toEqual([]);
    expect(errors).toEqual([]);
  });

  test(`${look}: standing still beside a fake wall hazes its face, and moving ends it`, async ({ page }) => {
    const errors = await open(page, look);
    await page.keyboard.press('ArrowUp'); // to (1,2): the fake wall at (1,3) is to his right
    await expect.poll(() => page.evaluate(() => (window as unknown as Hooked).__creteTest.game.run.now.player)).toEqual({ r: 1, c: 2 });
    expect((await cues(page))?.haze, 'no haze at once').toEqual([]);
    await expect.poll(async () => (await cues(page))?.haze, { timeout: 15_000 }).toEqual([{ at: { r: 1, c: 3 }, face: 'left' }]);
    expect((await cues(page))!.strength).toBeGreaterThan(0);
    // The haze is only a look: Theseus stands where he was and no move was counted.
    expect(await page.evaluate(() => (window as unknown as Hooked).__creteTest.game.run.now)).toMatchObject({ player: { r: 1, c: 2 }, moves: 1 });
    await page.keyboard.press('ArrowDown');
    await expect.poll(async () => (await cues(page))?.haze).toEqual([]);
    expect(errors).toEqual([]);
  });
}
