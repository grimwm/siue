// The Island of Crete's modern look: the 3D board is the default, draws nothing at rest, turns under a drag, zooms
// under the wheel and its buttons, moves Theseus the way the screen shows, ignores the camera while a card is up,
// keeps the Walls choice, follows the mini map, and hands the board back to the classic look and takes it again.
// Without WebGL the classic board shows.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const PAGE = 'games/crete/';

/* A wide open hall, Theseus in its middle, so a move in any direction is free and the camera has room to look
   about. */
const HALL = [
  'title: The Open Hall',
  'intro: Room to look about.',
  '',
  '#####################',
  '#...................#',
  '#...................#',
  '#...................#',
  '#...................#',
  '#...................#',
  '#...................#',
  '#.........P.........#',
  '#...................#',
  '#...................#',
  '#...................#',
  '#...................#',
  '#..................E#',
  '#####################',
  '',
].join('\n');

interface Hooked {
  __creteTest: {
    game: { run: { now: { player: { r: number; c: number } } } };
    parse(text: string): unknown;
    playLevel(level: unknown): void;
    modern?: { frames(): number; yaw(): number; zoom(): number; active: boolean };
  };
}

type Dir = 'up' | 'down' | 'left' | 'right';
/** src/modern/screen-move.ts screenToGrid, as the spec expects it to behave. */
function screenToGrid(dir: Dir, yaw: number): Dir {
  const UP: Dir[] = ['up', 'left', 'down', 'right'];
  const OFFSET: Record<Dir, number> = { up: 0, left: 1, down: 2, right: 3 };
  const q = ((Math.round(yaw / 90) % 4) + 4) % 4;
  return UP[(q + OFFSET[dir]) % 4]!;
}
const STEP: Record<Dir, { r: number; c: number }> = { up: { r: -1, c: 0 }, down: { r: 1, c: 0 }, left: { r: 0, c: -1 }, right: { r: 0, c: 1 } };

const modern = (page: Page) => page.evaluate(() => {
  const m = (window as unknown as Hooked).__creteTest.modern;
  return m ? { frames: m.frames(), yaw: m.yaw(), active: m.active } : null;
});
const zoom = (page: Page) => page.evaluate(() => (window as unknown as Hooked).__creteTest.modern!.zoom());
const player = (page: Page) => page.evaluate(() => ({ ...(window as unknown as Hooked).__creteTest.game.run.now.player }));

/** Waits until the board has drawn and then held still for a moment. */
async function settled(page: Page): Promise<number> {
  let last = -1;
  for (let i = 0; i < 60; i++) {
    const m = await modern(page);
    if (m && m.frames > 0 && m.frames === last) return last;
    last = m?.frames ?? -1;
    await page.waitForTimeout(250);
  }
  throw new Error('the modern board never came to rest');
}

/** Opens the hall on the real page, in the modern look, and closes its start card. */
async function openHall(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(PAGE);
  await page.locator('#title-play').click();
  await page.locator('#chapter-enter').click();
  await expect(page.locator('#start-veil')).toBeVisible();
  await page.evaluate(text => {
    const t = (window as unknown as Hooked).__creteTest;
    t.playLevel(t.parse(text));
  }, HALL);
  await page.locator('#start-begin').click();
  await expect(page.locator('#start-veil')).toBeHidden();
  await page.waitForFunction(() => (window as unknown as Hooked).__creteTest.modern?.active === true);
  await settled(page);
  return errors;
}

/** A left-button mouse drag of `dx` pixels across the middle of the modern board. */
async function drag(page: Page, dx: number): Promise<void> {
  const box = (await page.locator('#stage3d').boundingBox())!;
  const x = box.x + box.width / 2 - dx / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(x + (dx * i) / 10, y);
  await page.mouse.up();
}

/** True when the classic canvas has drawn anything. */
const classicPainted = (page: Page) => page.evaluate(() => {
  const stage = document.getElementById('stage') as HTMLCanvasElement;
  if (!stage.width || !stage.height) return false;
  const d = stage.getContext('2d')!.getImageData(0, 0, stage.width, stage.height).data;
  for (let i = 3; i < d.length; i += 4 * 97) if (d[i]! > 0) return true;
  return false;
});

test('the modern board is the default and draws nothing at rest', async ({ page }) => {
  const errors = await openHall(page);
  await expect(page.locator('#stage3d')).toBeVisible();
  await expect(page.locator('#stage')).toBeHidden();
  const before = (await modern(page))!.frames;
  await page.waitForTimeout(1500);
  expect((await modern(page))!.frames, 'no frame is drawn at rest').toBe(before);
  expect(errors).toEqual([]);
});

test('a drag turns the board, and Up then moves Theseus the way the screen shows', async ({ page }) => {
  const errors = await openHall(page);
  const yaw0 = (await modern(page))!.yaw;
  await drag(page, 200);
  await settled(page);
  const yaw = (await modern(page))!.yaw;
  expect(yaw - yaw0, 'a 200 px drag right turns the view by about -70°').toBeGreaterThan(-80);
  expect(yaw - yaw0).toBeLessThan(-60);

  const from = await player(page);
  await page.keyboard.press('ArrowUp');
  const step = STEP[screenToGrid('up', yaw)];
  await expect.poll(() => player(page), 'Up moves along the screen').toEqual({ r: from.r + step.r, c: from.c + step.c });

  // The pad's Up does the same.
  const at = await player(page);
  await page.locator('.mv-up').click();
  await expect.poll(() => player(page), 'the pad follows the screen too').toEqual({ r: at.r + step.r, c: at.c + step.c });
  expect(errors).toEqual([]);
});

test('with the menu open the camera stays where it is', async ({ page }) => {
  const errors = await openHall(page);
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
  const yaw = (await modern(page))!.yaw;
  // Straight at the canvas, under the card, as a stray touch would come.
  const strayDrag = () => page.evaluate(() => {
    const c = document.getElementById('stage3d')!;
    const r = c.getBoundingClientRect();
    const at = (type: string, x: number) => c.dispatchEvent(new PointerEvent(type, {
      bubbles: true, pointerId: 7, pointerType: 'mouse', button: 0, buttons: type === 'pointerup' ? 0 : 1, isPrimary: true,
      clientX: r.left + x, clientY: r.top + r.height / 2,
    }));
    at('pointerdown', 100);
    for (let x = 120; x <= 300; x += 20) at('pointermove', x);
    at('pointerup', 300);
  });
  await strayDrag();
  await page.waitForTimeout(300);
  expect((await modern(page))!.yaw, 'a drag under the menu turns nothing').toBe(yaw);
  // The same drag with the menu closed does turn it.
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeHidden();
  await strayDrag();
  await expect.poll(async () => (await modern(page))!.yaw).not.toBe(yaw);
  expect(errors).toEqual([]);
});

test('the wheel zooms toward the pointer and the buttons zoom too; with the menu open the wheel does nothing', async ({ page }) => {
  const errors = await openHall(page);
  const z0 = await zoom(page);
  const box = (await page.locator('#stage3d').boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(0, 300);
  await expect.poll(() => zoom(page), 'a wheel down zooms out').toBeGreaterThan(z0);
  const out = await zoom(page);
  await page.mouse.wheel(0, -600);
  await expect.poll(() => zoom(page), 'a wheel up zooms in').toBeLessThan(out);

  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
  const held = await zoom(page);
  // Straight at the canvas, under the card.
  const prevented = await page.evaluate(() => {
    const c = document.getElementById('stage3d')!;
    const r = c.getBoundingClientRect();
    const e = new WheelEvent('wheel', { bubbles: true, cancelable: true, deltaY: 400, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 });
    c.dispatchEvent(e);
    return e.defaultPrevented;
  });
  await page.waitForTimeout(300);
  expect(await zoom(page), 'a wheel under the menu zooms nothing').toBe(held);
  expect(prevented, 'and leaves the wheel to the page').toBe(false);
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeHidden();

  await page.locator('#cam-zoom-out').click();
  await expect.poll(() => zoom(page), 'Zoom out').toBeGreaterThan(held);
  await page.locator('#cam-reset').click();
  await expect.poll(() => zoom(page), 'Reset view brings the default back').toBeCloseTo(z0, 3);
  await page.locator('#cam-zoom-in').click();
  await expect.poll(() => zoom(page), 'Zoom in').toBeLessThan(z0);
  expect(errors).toEqual([]);
});

test('Walls: Ghosted is kept through a reload', async ({ page }) => {
  await openHall(page);
  await page.keyboard.press('q');
  await page.locator('#walls-ghosted').click();
  await expect(page.locator('#walls-ghosted')).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await page.locator('#title-settings').click();
  await expect(page.locator('#walls-ghosted')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#walls-solid')).toHaveAttribute('aria-pressed', 'false');
});

test('a tap on the mini map moves the camera there', async ({ page }) => {
  const errors = await openHall(page);
  const view = page.locator('#minimap-view');
  await expect(view).toBeVisible();
  const before = await view.screenshot();
  const box = (await view.boundingBox())!;
  const frames = (await modern(page))!.frames;
  await page.mouse.click(box.x + 4, box.y + 4);
  await settled(page);
  expect((await modern(page))!.frames, 'the board draws the new view').toBeGreaterThan(frames);
  expect((await view.screenshot()).equals(before), 'the view outline moved').toBe(false);
  expect(errors).toEqual([]);
});

test('switching to Classic shows the classic board, and back', async ({ page }) => {
  const errors = await openHall(page);
  await page.keyboard.press('q');
  await page.locator('#look-classic').click();
  await expect(page.locator('#stage')).toBeVisible();
  await expect(page.locator('#stage3d')).toBeHidden();
  await expect.poll(() => classicPainted(page), 'the classic board paints').toBe(true);
  expect((await modern(page))!.active).toBe(false);
  await page.locator('#look-modern').click();
  await expect(page.locator('#stage3d')).toBeVisible();
  await expect(page.locator('#stage')).toBeHidden();
  await expect.poll(async () => (await modern(page))!.active).toBe(true);
  expect(errors).toEqual([]);
});

test('without WebGL the classic board shows and the choice stays modern', async ({ page }) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, ...rest: unknown[]) {
      return kind.startsWith('webgl') ? null : (get as (...a: unknown[]) => unknown).call(this, kind, ...rest);
    } as typeof get;
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(PAGE);
  await expect(page.locator('#toast')).toHaveText('The modern look needs WebGL, which this browser does not have; showing Classic.');
  await page.locator('#title-play').click();
  await page.locator('#chapter-enter').click();
  await page.locator('#start-begin').click();
  await expect(page.locator('#stage')).toBeVisible();
  await expect(page.locator('#stage3d')).toBeHidden();
  await expect.poll(() => classicPainted(page)).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('crete-look'))).not.toBe('classic');
});
