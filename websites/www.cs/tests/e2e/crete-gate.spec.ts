// The Daedalus Gate and the sinking doors in a real browser, in both looks, with motion on: the gate is a bare pit
// until the last relic is taken, then its bronze bars slide over it; Theseus crosses it with the Minotaur beside it,
// who never steps onto it; a door sinks into the floor as Theseus walks into it and leaves its sill. Classic is read
// from the board's own pixels; Modern from the test hook's `opening()`, what its last frame drew moving (a headless
// Chrome draws Modern slowly, so a frame count would say more about the machine than the board).
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const allMet = (): void => localStorage.setItem('crete-met', '["*"]');
test.beforeEach(async ({ context }) => { await context.addInitScript(allMet); });

const PAGE = 'games/crete/';

interface Cell { r: number; c: number }
interface GateTest {
  game: { run: { now: { player: Cell; minotaur: Cell | null; relicsLeft: number; terrain: string[]; moves: number } } };
  parse(text: string): unknown;
  playLevel(level: unknown): void;
  modern: { opening(): { bars: number[]; doors: number[]; hoof: number }; active: boolean };
}
type Hooked = { __creteTest: GateTest };

const GATE = ['title: The grid', 'intro: Take the relic.', '', '#########', '#P*..|ME#', '#########', ''].join('\n');
const DOOR = ['title: The door', 'intro: Take the key.', '', '########', '#Pr.R.E#', '########', ''].join('\n');

async function open(page: Page, look: 'classic' | 'modern', text: string): Promise<string[]> {
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
  }, text);
  await page.locator('#start-begin').click();
  await expect(page.locator('#start-veil')).toBeHidden();
  if (look === 'classic') {
    await page.waitForSelector('#stage[data-cell]');
    await page.waitForFunction(() => {
      const stage = document.getElementById('stage') as HTMLCanvasElement;
      const d = stage.getContext('2d')!.getImageData(0, 0, stage.width, stage.height).data;
      for (let i = 3; i < d.length; i += 4 * 97) if (d[i]! > 0) return true;
      return false;
    });
  } else {
    await expect.poll(() => page.evaluate(() => (window as unknown as Hooked).__creteTest.modern.active)).toBe(true);
  }
  return errors;
}

const now = (page: Page) => page.evaluate(() => {
  const s = (window as unknown as Hooked).__creteTest.game.run.now;
  return { player: s.player, minotaur: s.minotaur, relicsLeft: s.relicsLeft, terrain: s.terrain, moves: s.moves };
});

/** Board cell (r, c) of the classic sheet as pixel counts: bronze (the bars), dark (the pit) and `rgb`, a colour test. */
const cellOf = (page: Page, r: number, c: number) => page.evaluate(([r, c]) => {
  const stage = document.getElementById('stage') as HTMLCanvasElement;
  const cell = Math.round(Number(stage.dataset.cell) * (window.devicePixelRatio || 1));
  const top = Math.round((24 / 64) * cell);
  const d = stage.getContext('2d')!.getImageData(top + c * cell, top + r * cell, cell, cell).data;
  let bronze = 0, dark = 0, red = 0;
  for (let i = 0; i < d.length; i += 4) {
    const [R, G, B] = [d[i]!, d[i + 1]!, d[i + 2]!];
    if (R > 140 && G > 80 && G < R - 30 && B < G - 20) bronze++;
    if (R + G + B < 150) dark++;
    if (R > 160 && G < 80 && B < 80) red++;
  }
  return { bronze, dark, red, all: d.length / 4 };
}, [r, c] as const);

test('Classic: the gate is a pit until the last relic, then its bars slide over it; Theseus crosses beside the Minotaur', async ({ page }) => {
  const errors = await open(page, 'classic', GATE);
  const shut = await cellOf(page, 1, 5);
  const floor = await cellOf(page, 1, 4);
  expect(shut.dark / shut.all, 'the shut gate is a dark pit').toBeGreaterThan(floor.dark / floor.all + 0.1);
  await page.keyboard.press('ArrowRight');
  expect((await now(page)).relicsLeft).toBe(0);
  // The bars take most of a second to meet: early on there is less bronze than once they rest.
  const early = (await cellOf(page, 1, 5)).bronze;
  await page.waitForTimeout(1500);
  const grid = await cellOf(page, 1, 5);
  expect(grid.bronze, 'the bars lie across the pit').toBeGreaterThan(early);
  expect(grid.bronze / grid.all, 'bronze covers much of the open gate').toBeGreaterThan(shut.bronze / shut.all + 0.06);
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  const s = await now(page);
  expect(s.player, 'Theseus stands on the grid').toEqual({ r: 1, c: 5 });
  expect(s.minotaur, 'the Minotaur stays at its kerb').toEqual({ r: 1, c: 6 });
  expect(errors).toEqual([]);
});

test('Classic: a door sinks into the floor as Theseus walks into it, and leaves its sill', async ({ page }) => {
  const errors = await open(page, 'classic', DOOR);
  const shut = await cellOf(page, 1, 4);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(900);
  expect((await now(page)).terrain[1 * 8 + 4], 'the door is open').toBe('floor');
  const sill = await cellOf(page, 1, 4);
  expect(sill.red, 'a strip of the key\'s colour stays in the floor').toBeGreaterThan(0);
  expect(sill.red, 'the door itself has gone').toBeLessThan(shut.red);
  expect(errors).toEqual([]);
});

const opening = (page: Page) => page.evaluate(() => (window as unknown as Hooked).__creteTest.modern.opening());

test('Modern: the bars slide once the last relic is taken, and the Minotaur tries them; Theseus crosses beside him', async ({ page }) => {
  const errors = await open(page, 'modern', GATE);
  expect((await opening(page)).bars, 'nothing moves at the start').toEqual([]);
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await opening(page)).bars.length, { message: 'the bars slide' }).toBeGreaterThan(0);
  await expect.poll(async () => (await opening(page)).hoof, { message: 'he leans in to test them', timeout: 8000 }).toBeGreaterThan(0);
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await now(page)).player).toEqual({ r: 1, c: 5 });
  expect((await now(page)).minotaur, 'the Minotaur stays at its kerb').toEqual({ r: 1, c: 6 });
  expect(errors).toEqual([]);
});

test('Modern: a door sinks as Theseus walks into it', async ({ page }) => {
  const errors = await open(page, 'modern', DOOR);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await now(page)).moves).toBe(2);
  expect((await opening(page)).doors).toEqual([]);
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await opening(page)).doors.length, { message: 'the door sinks' }).toBeGreaterThan(0);
  await expect.poll(async () => (await now(page)).terrain[1 * 8 + 4]).toBe('floor');
  expect(errors).toEqual([]);
});
