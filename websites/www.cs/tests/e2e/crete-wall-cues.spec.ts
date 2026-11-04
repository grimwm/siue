// The hidden walls' cues in a real browser, in both looks (src/wall-cues.ts): beside an invisible wall Theseus sees a
// sliver of its glass, gone a step away and back a step later, kept across a look switch, and his bump shows the
// whole wall as one move with the Minotaur stepping; an invisible wall Theseus bumps comes
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
interface Shown { found: Cell[]; glass: { at: Cell; face: string }[]; haze: { at: Cell; face: string }[]; strength: number }
interface CuesTest {
  game: { run: { now: { player: Cell; minotaur: Cell | null; terrain: string[]; moves: number } } };
  parse(text: string): unknown;
  playLevel(level: unknown): void;
  modern: { active: boolean; frames(): number };
  cues(): Shown | null;
}
type Hooked = { __creteTest: CuesTest };

// Theseus at (2,2): an invisible wall to his right, a fake wall above (1,2)'s right, at (1,3).
const LEVEL = ['title: Hidden', 'intro: Take the relic.', '', '#######', '#..W.E#', '#.PI*.#', '#.....#', '#######', ''].join('\n');

// Theseus at (2,1), two cells left of an invisible wall at (2,3); the Minotaur far off in the hall below, walled off
// from him, pacing toward him two cells a turn.
const GLASS = ['title: Glass', 'intro: Take the relic.', '', '################', '#.....*.......E#', '#P.I...........#',
  '################', '#.............M#', '################', ''].join('\n');

async function open(page: Page, look: 'classic' | 'modern', level = LEVEL): Promise<string[]> {
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
  }, level);
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
const now = (page: Page) => page.evaluate(() => (window as unknown as Hooked).__creteTest.game.run.now);

for (const look of ['classic', 'modern'] as const) {
  test(`${look}: beside an invisible wall a sliver of its glass shows, a step away it goes, and the bump costs a move`, async ({ page }) => {
    const errors = await open(page, look, GLASS);
    const glass = async () => (await cues(page))?.glass;
    const SLIVER = [{ at: { r: 2, c: 3 }, face: 'left' }];
    expect(await glass(), 'not beside it: nothing').toEqual([]);
    await page.keyboard.press('ArrowRight'); // to (2,2), beside it
    await expect.poll(async () => (await now(page)).player).toEqual({ r: 2, c: 2 });
    await expect.poll(glass).toEqual(SLIVER);
    expect((await now(page)).terrain[2 * 16 + 3], 'only a look: the wall is still unshown').toBe('invisible-wall');
    expect((await cues(page))?.found).toEqual([]);
    // Across a look switch and back, still beside it: still there.
    const other = look === 'classic' ? 'modern' : 'classic';
    for (const want of [other, look]) {
      await page.keyboard.press('b');
      await expect.poll(() => lookNow(page)).toBe(want);
      if (want === 'modern') await expect.poll(() => page.evaluate(() => (window as unknown as Hooked).__creteTest.modern.active), { timeout: 30_000 }).toBe(true);
      await expect.poll(glass, { message: `still sensed in ${want}`, timeout: 15_000 }).toEqual(SLIVER);
    }
    await page.keyboard.press('ArrowLeft'); // a step away
    await expect.poll(async () => (await now(page)).player).toEqual({ r: 2, c: 1 });
    await expect.poll(glass, 'gone a step away').toEqual([]);
    await page.keyboard.press('ArrowRight'); // back beside it
    await expect.poll(glass, 'back beside it').toEqual(SLIVER);
    const before = await now(page);
    await page.keyboard.press('ArrowRight'); // the bump
    await expect.poll(async () => (await now(page)).terrain[2 * 16 + 3]).toBe('wall');
    const after = await now(page);
    expect(after.moves, 'the bump is a move').toBe(before.moves + 1);
    expect(after.player).toEqual(before.player);
    expect(after.minotaur, 'the Minotaur stepped').not.toEqual(before.minotaur);
    await expect(page.locator('#hud-moves')).toHaveText(String(before.moves + 1));
    await expect.poll(async () => (await cues(page))?.found).toEqual([{ r: 2, c: 3 }]);
    await expect.poll(glass, 'found, it is glass no longer').toEqual([]);
    expect(errors).toEqual([]);
  });

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
