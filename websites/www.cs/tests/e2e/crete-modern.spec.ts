// The Island of Crete's modern look: the 3D board is the default, draws nothing at rest, turns under a drag, zooms
// under the wheel and its buttons, moves Theseus the way the screen shows, ignores the camera while a card is up,
// keeps the Walls choice, follows the mini map, and hands the board back to the classic look and takes it again.
// A block pushed into water floats there, and undo takes it out. Without WebGL the classic board shows.
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

/* A block beside a pool: Right pushes it in. */
const POOL = [
  'title: The Pool',
  'intro: A block and a pool.',
  '',
  '#######',
  '#.....#',
  '#.PO~.#',
  '#....E#',
  '#######',
  '',
].join('\n');
const POOL_CELL = 2 * 7 + 4;

interface Hooked {
  __creteTest: {
    game: { run: { now: { player: { r: number; c: number } } } };
    parse(text: string): unknown;
    playLevel(level: unknown): void;
    modern?: { frames(): number; yaw(): number; zoom(): number; pitch(): number; following(): boolean; floating(): number[]; splashing(): number[]; active: boolean };
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
  await expect.poll(async () => {
    const m = await modern(page);
    const rested = !!m && m.frames > 0 && m.frames === last;
    last = m?.frames ?? -1;
    return rested;
  }, { message: 'the modern board comes to rest', intervals: [250], timeout: 15_000 }).toBe(true);
  return last;
}

/** Opens a level (the hall by default) on the real page, in the modern look, and closes its start card. */
async function openHall(page: Page, text = HALL, reducedMotion: 'reduce' | 'no-preference' = 'reduce'): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion });
  // These specs turn the camera, so they start Angled unless a test has chosen a view.
  await page.addInitScript(() => { if (localStorage.getItem('crete-view') === null) localStorage.setItem('crete-view', 'angled'); });
  await page.goto(PAGE);
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await page.locator('#chapter-enter').click();
  await expect(page.locator('#start-veil')).toBeVisible();
  await page.evaluate(text => {
    const t = (window as unknown as Hooked).__creteTest;
    t.playLevel(t.parse(text));
  }, text);
  await page.locator('#start-begin').click();
  await expect(page.locator('#start-veil')).toBeHidden();
  await page.waitForFunction(() => (window as unknown as Hooked).__creteTest.modern?.active === true);
  // With motion on, the water's loop keeps drawing, so the board never rests.
  if (reducedMotion === 'reduce') await settled(page);
  else await expect.poll(async () => (await modern(page))!.frames).toBeGreaterThan(0);
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

/** A one-finger touch swipe of (dx, dy) CSS pixels across the middle of `sel`, as pointer events. */
async function swipe(page: Page, sel: string, dx: number, dy: number): Promise<void> {
  await page.evaluate(([sel, dx, dy]) => {
    const el = document.querySelector(sel as string)!;
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const ev = (type: string, px: number, py: number) => el.dispatchEvent(new PointerEvent(type, {
      pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: px, clientY: py, bubbles: true, button: 0,
    }));
    ev('pointerdown', x, y);
    for (let i = 1; i <= 5; i++) ev('pointermove', x + (dx as number) * i / 5, y + (dy as number) * i / 5);
    ev('pointerup', x + (dx as number), y + (dy as number));
  }, [sel, dx, dy] as const);
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

test('a block pushed into water splashes in and floats there; undo takes it out', async ({ page }) => {
  const floating = () => page.evaluate(() => (window as unknown as Hooked).__creteTest.modern!.floating());
  const errors = await openHall(page, POOL, 'no-preference');
  expect(await floating()).toEqual([]);
  await page.keyboard.press('ArrowRight');
  await expect.poll(floating, 'the block floats in the pool').toEqual([POOL_CELL]);
  await expect.poll(() => page.evaluate(() => (window as unknown as Hooked).__creteTest.modern!.splashing()), 'the splash ends').toEqual([]);
  await page.keyboard.press('u');
  await expect.poll(floating, 'undo empties the pool').toEqual([]);
  await page.keyboard.press('ArrowRight');
  await expect.poll(floating).toEqual([POOL_CELL]);
  expect(errors).toEqual([]);
});

test('a block sunk while the modern look is hidden floats at once when it returns', async ({ page }) => {
  const errors = await openHall(page, POOL, 'no-preference');
  await page.keyboard.press('q');
  await page.locator('#look-classic').click();
  await page.keyboard.press('q');
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await player(page)).c, 'Theseus pushes the block in').toBe(3);
  // No hook shows the classic board's turn while the modern one is hidden, so the turn's length is waited out.
  await page.waitForTimeout(1500);
  await page.keyboard.press('q');
  await page.locator('#look-modern').click();
  await expect.poll(async () => (await modern(page))!.active).toBe(true);
  await expect.poll(() => page.evaluate(() => (window as unknown as Hooked).__creteTest.modern!.floating())).toEqual([POOL_CELL]);
  expect(await page.evaluate(() => (window as unknown as Hooked).__creteTest.modern!.splashing()), 'no late splash').toEqual([]);
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

test('after a look elsewhere on the mini map, Theseus\'s next step brings the camera back to him', async ({ page }) => {
  const errors = await openHall(page);
  const following = () => page.evaluate(() => (window as unknown as Hooked).__creteTest.modern!.following());
  expect(await following(), 'the camera starts on Theseus').toBe(true);
  const box = (await page.locator('#minimap-view').boundingBox())!;
  await page.mouse.click(box.x + 4, box.y + 4);
  await settled(page);
  expect(await following(), 'the mini map looks elsewhere').toBe(false);
  const from = await player(page);
  for (const k of ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp']) {
    await page.keyboard.press(k);
    if (JSON.stringify(await player(page)) !== JSON.stringify(from)) break;
  }
  expect(await player(page), 'Theseus stepped').not.toEqual(from);
  await expect.poll(following, { message: 'the step brings the camera back' }).toBe(true);
  expect(errors).toEqual([]);
});

test('a finger swipe moves Theseus and leaves the camera\'s turn alone', async ({ page }) => {
  const errors = await openHall(page);
  const yaw0 = (await modern(page))!.yaw;
  const from = await player(page);
  for (const [dx, dy] of [[80, 0], [-80, 0], [0, 80], [0, -80]]) {
    await swipe(page, '#stage3d', dx!, dy!);
    if (JSON.stringify(await player(page)) !== JSON.stringify(from)) break;
  }
  expect(await player(page), 'Theseus moved').not.toEqual(from);
  expect((await modern(page))!.yaw, 'one finger never turns').toBe(yaw0);
  expect(errors).toEqual([]);
});

test('a new player starts in Top-down: 75°, square to the board, no turn buttons and no Walls choice', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(PAGE);
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await page.locator('#chapter-enter').click();
  await page.locator('#start-begin').click();
  await page.waitForFunction(() => (window as unknown as Hooked).__creteTest.modern?.active === true);
  await expect.poll(() => page.evaluate(() => { const m = (window as unknown as Hooked).__creteTest.modern!; return { pitch: Math.round(m.pitch()), yaw: Math.round(m.yaw()) }; })).toEqual({ pitch: 75, yaw: 0 });
  await expect(page.locator('#cam-left')).toBeHidden();
  await page.keyboard.press('q');
  await expect(page.locator('#view-top')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#walls-solid')).toHaveCount(0);
});

test('Top-down tips the camera to 75° and squares it to the board; Angled tips it back, and the choice is kept', async ({ page }) => {
  const errors = await openHall(page);
  const cam = () => page.evaluate(() => { const m = (window as unknown as Hooked).__creteTest.modern!; return { pitch: Math.round(m.pitch()), yaw: Math.round(m.yaw()) }; });
  expect(await cam()).toEqual({ pitch: 45, yaw: 15 });
  await page.keyboard.press('q');
  await expect(page.locator('#view-angled')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#walls-solid')).toBeVisible();
  await page.locator('#view-top').click();
  await expect(page.locator('#view-top')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#walls-solid'), 'no Walls choice from above').toHaveCount(0);
  await page.keyboard.press('q');
  await expect.poll(cam).toEqual({ pitch: 75, yaw: 0 });
  // Top-down does not turn: no turn buttons, and a mouse drag leaves it square.
  await expect(page.locator('#cam-left')).toBeHidden();
  await drag(page, 120);
  expect(await cam()).toEqual({ pitch: 75, yaw: 0 });
  await page.reload();
  await page.locator('#title-settings').click();
  await expect(page.locator('#view-top')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#view-angled').click();
  await expect(page.locator('#walls-solid')).toBeVisible();
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
  await page.locator('#pick-enter').click();
  await page.locator('#chapter-enter').click();
  await page.locator('#start-begin').click();
  await expect(page.locator('#stage')).toBeVisible();
  await expect(page.locator('#stage3d')).toBeHidden();
  await expect.poll(() => classicPainted(page)).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('crete-look'))).not.toBe('classic');
});

test('a lost WebGL context warns only when the player chose the modern look', async ({ page }) => {
  const lose = () => page.evaluate(() => {
    const gl = (document.getElementById('stage3d') as HTMLCanvasElement).getContext('webgl2') ?? (document.getElementById('stage3d') as HTMLCanvasElement).getContext('webgl');
    gl!.getExtension('WEBGL_lose_context')!.loseContext();
  });
  const errors = await openHall(page);
  await page.keyboard.press('q');
  await page.locator('#look-classic').click();
  await expect(page.locator('#toast')).not.toHaveClass(/\bshow\b/, { timeout: 10_000 }); // the "Classic look." toast has gone
  await lose();
  await page.waitForTimeout(1000);
  await expect(page.locator('#toast')).not.toContainText('stopped working');
  await page.locator('#look-modern').click();
  await expect(page.locator('#toast')).toContainText('stopped working');
  expect(errors).toEqual([]);
});
