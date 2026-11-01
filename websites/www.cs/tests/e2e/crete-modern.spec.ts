// The Island of Crete's modern look: the 3D board is the default, opens at 75° and north up, draws nothing at rest, turns to any
// heading and tilts under a drag, two fingers or a drag on the compass and stays there, shows the view on the compass, resets on a
// tap of it (a real touch through CDP, or the mouse), zooms
// under the wheel and its buttons, moves Theseus the way the screen shows, ignores the camera while a card is up,
// keeps the Walls choice, opens on the whole level, follows the mini map (a setting, off by default) once zoomed, floats a marker over each
// figure and item, and hands the board back to the classic look and takes it again with the Map button,
// from the menu or the strip's look button and its B key.
// A block pushed into water floats there, and undo takes it out. Without WebGL the classic board shows. A new player
// who leaves the camera alone sees a short hint by the compass, on at most two visits, until they first move the camera.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/** Every Dictionary entry met before the page loads, so no first card (src/ui/meet.tsx) stops these specs' levels. */
const allMet = (): void => localStorage.setItem('crete-met', '["*"]');

/** The first-time view hint (src/modern/hint.ts) already done, so it never covers what these specs look at; only its
 *  own specs, named "the first-time hint", start fresh. */
const hintDone = (): void => localStorage.setItem('crete-view-hint', '{"shows":0,"moved":true}');

test.beforeEach(async ({ context }, info) => {
  await context.addInitScript(allMet);
  if (!info.title.startsWith('the first-time hint')) await context.addInitScript(hintDone);
});

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
    game: { run: { now: { player: { r: number; c: number } } }; thread: { r: number; c: number; jump?: true }[] | null };
    parse(text: string): unknown;
    playLevel(level: unknown): void;
    modern?: {
      frames(): number; yaw(): number; zoom(): number; pitch(): number; following(): boolean; floating(): number[]; splashing(): number[]; active: boolean;
      markers(): { kind: string; at: [number, number]; foot: [number, number]; cell: number }[];
      routeNext(): { dir: string; scale: number } | null;
    };
  };
}

type Dir = 'up' | 'down' | 'left' | 'right';
/** src/modern/screen-move.ts screenToGrid, as the spec expects it to behave: up is the grid direction closest to away
 *  from the camera (the specs keep clear of the hysteresis near 45° boundaries). */
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
/** The camera's pitch and heading, in whole degrees. */
const cam = (page: Page) => page.evaluate(() => {
  const m = (window as unknown as Hooked).__creteTest.modern!;
  return { pitch: Math.round(m.pitch()), yaw: Math.round(m.yaw()) };
});
/** What the compass shows: the heading and pitch it was last given, and how full its tilt ring is (0 to 1). */
const compass = (page: Page) => page.locator('#cam-compass').evaluate(el => {
  const b = el as HTMLElement;
  return { heading: Number(b.dataset.heading), pitch: Number(b.dataset.pitch), tilt: Number(b.style.getPropertyValue('--tilt')) };
});
/** A press on the compass by a finger, a pen or the mouse, dragged (dx, dy) CSS pixels in steps, then lifted; (0, 0)
 *  is a tap. */
async function dragCompass(page: Page, type: 'touch' | 'pen' | 'mouse', dx: number, dy: number): Promise<void> {
  await page.locator('#cam-compass').evaluate((el, [type, dx, dy]) => {
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const ev = (kind: string, px: number, py: number) => el.dispatchEvent(new PointerEvent(kind, {
      pointerId: 31, pointerType: type as string, isPrimary: true, clientX: px, clientY: py, bubbles: true, cancelable: true, button: 0,
    }));
    ev('pointerdown', x, y);
    for (let i = 1; i <= 8; i++) ev('pointermove', x + (dx as number) * i / 8, y + (dy as number) * i / 8);
    ev('pointerup', x + (dx as number), y + (dy as number));
  }, [type, dx, dy] as const);
}

/** A real finger tap at the middle of `sel` through CDP Input.dispatchTouchEvent (the browser makes the pointer and
 *  click events), wobbling `wobble` CSS px between down and up as a fingertip does. Checks first that the point is
 *  on `sel` itself, not something over it. */
async function touchTap(page: Page, sel: string, wobble = 0): Promise<void> {
  const box = (await page.locator(sel).boundingBox())!;
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  expect(await page.evaluate(([sel, x, y]) => !!document.elementFromPoint(x as number, y as number)?.closest(sel as string), [sel, x, y] as const),
    `${sel} is what a finger at its middle touches`).toBe(true);
  const cdp = await page.context().newCDPSession(page);
  const at = (px: number, py: number) => [{ x: px, y: py, radiusX: 8, radiusY: 8, force: 1, id: 1 }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: at(x, y) });
  if (wobble) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: at(x + wobble * 0.6, y + wobble * 0.8) });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

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

/** Zooms in with the button `n` times, past the whole-level view the board opens at, and waits for the board to rest. */
async function zoomIn(page: Page, n = 4): Promise<void> {
  for (let i = 0; i < n; i++) await page.locator('#cam-zoom-in').click();
  await settled(page);
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

/** Two fingers on the modern board, `gap` px apart side by side about its centre, turned together by `deg` (clockwise
 *  on the screen) about their midpoint, or slid `dx` and `dy` px together; then lifted. */
async function twoFingers(page: Page, how: { deg?: number; dx?: number; dy?: number }): Promise<void> {
  await page.evaluate(({ deg, dx, dy }) => {
    const el = document.getElementById('stage3d')!;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2, half = 80;
    const ev = (type: string, id: number, x: number, y: number) => el.dispatchEvent(new PointerEvent(type, {
      pointerId: id, pointerType: 'touch', isPrimary: id === 21, clientX: x, clientY: y, bubbles: true, button: 0,
    }));
    const at = (t: number): [[number, number], [number, number]] => {
      const a = ((deg ?? 0) * Math.PI / 180) * t, x = (dx ?? 0) * t, y = (dy ?? 0) * t;
      const c = Math.cos(a), s = Math.sin(a);
      return [[cx - half * c + x, cy - half * s + y], [cx + half * c + x, cy + half * s + y]];
    };
    const [a0, b0] = at(0);
    ev('pointerdown', 21, ...a0);
    ev('pointerdown', 22, ...b0);
    for (let i = 1; i <= 12; i++) {
      const [a, b] = at(i / 12);
      ev('pointermove', 21, ...a);
      ev('pointermove', 22, ...b);
    }
    const [a1, b1] = at(1);
    ev('pointerup', 21, ...a1);
    ev('pointerup', 22, ...b1);
  }, { deg: how.deg ?? 0, dx: how.dx ?? 0, dy: how.dy ?? 0 });
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

test('the Route\'s next step is a bigger gold arrow on Theseus\'s square, drawn over him, and it breathes', async ({ page }) => {
  const errors = await openHall(page, HALL, 'no-preference');
  await page.keyboard.press('v');
  const next = () => page.evaluate(() => (window as unknown as Hooked).__creteTest.modern!.routeNext());
  await expect.poll(next, 'a next step').not.toBeNull();
  const way = await page.evaluate(() => {
    const t = (window as unknown as Hooked).__creteTest.game.thread!;
    const a = t[0]!, b = t[1]!;
    return b.r < a.r ? 'up' : b.r > a.r ? 'down' : b.c < a.c ? 'left' : 'right';
  });
  expect((await next())!.dir, 'it points along the thread').toBe(way);
  const sizes = new Set<number>();
  await expect.poll(async () => { sizes.add(Math.round((await next())!.scale * 100)); return sizes.size; },
    { message: 'it breathes between 1.4× and a tenth more', intervals: [100], timeout: 5000 }).toBeGreaterThan(2);
  for (const s of sizes) expect(s).toBeGreaterThanOrEqual(140), expect(s).toBeLessThanOrEqual(154);
  await page.keyboard.press('v');
  await expect.poll(next, 'Route off: no next step').toBeNull();
  expect(errors).toEqual([]);
});

test('a drag turns the board, and Up then moves Theseus the way the screen shows', async ({ page }) => {
  const errors = await openHall(page);
  const yaw0 = (await modern(page))!.yaw;
  await drag(page, 200);
  await settled(page);
  const yaw = (await modern(page))!.yaw;
  expect(yaw - yaw0, 'a 200 px drag right turns the view -70°, and letting go leaves it there').toBeCloseTo(-70, 3);

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
  await page.locator('#btn-look').click();
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await player(page)).c, 'Theseus pushes the block in').toBe(3);
  // No hook shows the classic board's turn while the modern one is hidden, so the turn's length is waited out.
  await page.waitForTimeout(1500);
  await page.locator('#btn-look').click();
  await expect.poll(async () => (await modern(page))!.active).toBe(true);
  await expect.poll(() => page.evaluate(() => (window as unknown as Hooked).__creteTest.modern!.floating())).toEqual([POOL_CELL]);
  expect(await page.evaluate(() => (window as unknown as Hooked).__creteTest.modern!.splashing()), 'no late splash').toEqual([]);
  expect(errors).toEqual([]);
});

test('the movement pad\'s middle shows Theseus in the look that shows, and swaps with the Map button', async ({ page }) => {
  const errors = await openHall(page);
  const hub = () => page.locator('.pad-hub').evaluate(el => {
    const cs = getComputedStyle(el);
    return { image: cs.backgroundImage, rendering: cs.imageRendering };
  });
  await expect.poll(async () => (await hub()).image, 'the modern face on the modern board').toContain('theseus-face-modern.png');
  expect((await hub()).rendering, 'drawn smooth').not.toBe('pixelated');
  const loaded = await page.evaluate(async () => {
    const img = new Image();
    img.src = 'fx/sprites/theseus-face-modern.png';
    await img.decode();
    return img.naturalWidth;
  });
  expect(loaded, 'the modern face loads').toBeGreaterThan(0);
  await page.locator('#btn-look').click();
  await expect.poll(async () => (await hub()).image, 'the classic sprite on the classic board').toMatch(/theseus-face\.png/);
  expect((await hub()).rendering).toBe('pixelated');
  await page.locator('#btn-look').click();
  await expect.poll(async () => (await hub()).image, 'and back').toContain('theseus-face-modern.png');
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

test('the mini map is off by default; the menu\'s Mini map switch (Modern only) shows it, and Classic never does', async ({ page }) => {
  const errors = await openHall(page);
  await expect(page.locator('#minimap-view'), 'off by default').toBeHidden();
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
  const sw = page.locator('#minimap-switch');
  await expect(sw).toHaveAttribute('aria-checked', 'false');
  await sw.click();
  await expect(sw).toHaveAttribute('aria-checked', 'true');
  expect(await page.evaluate(() => localStorage.getItem('crete-minimap'))).toBe('on');
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeHidden();
  await expect(page.locator('#minimap-view'), 'shown once switched on').toBeVisible();
  // Classic hides the modern board, the mini map with it, and its menu has no switch.
  await page.keyboard.press('b');
  await expect(page.locator('#stage')).toBeVisible();
  await expect(page.locator('#minimap-view')).toBeHidden();
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
  await expect(page.locator('#minimap-switch')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('a tap on the mini map moves the camera there', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('crete-minimap', 'on'));
  const errors = await openHall(page);
  await zoomIn(page);
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
  await page.addInitScript(() => localStorage.setItem('crete-minimap', 'on'));
  const errors = await openHall(page);
  const following = () => page.evaluate(() => (window as unknown as Hooked).__creteTest.modern!.following());
  await zoomIn(page);
  expect(await following(), 'zoomed in, the camera is on Theseus').toBe(true);
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

test('the board opens on the whole level, and Theseus\'s steps leave it there until the player zooms', async ({ page }) => {
  const errors = await openHall(page);
  const z0 = await zoom(page);
  const frames = (await modern(page))!.frames;
  const from = await player(page);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => player(page)).not.toEqual(from);
  await settled(page);
  expect(await zoom(page), 'the zoom holds').toBe(z0);
  expect((await modern(page))!.frames, 'a step draws').toBeGreaterThan(frames);
  // The whole hall fits across the board.
  const box = (await page.locator('#stage3d').boundingBox())!;
  const cellPx = box.height / z0;
  expect(21 * cellPx, 'the hall\'s width fits the board').toBeLessThanOrEqual(box.width);
  await page.locator('#cam-zoom-in').click();
  await expect.poll(() => zoom(page)).toBeLessThan(z0);
  await page.locator('#cam-reset').click();
  await expect.poll(() => zoom(page), 'Reset returns to the whole level').toBeCloseTo(z0, 3);
  expect(errors).toEqual([]);
});

test('level 1 at the opening 75°: one small marker over each figure and item, the Minotaur\'s over its own cell', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(PAGE);
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await page.locator('#chapter-enter').click();
  await page.locator('#start-begin').click();
  await expect(page.locator('#start-veil')).toBeHidden();
  await page.waitForFunction(() => (window as unknown as Hooked).__creteTest.modern?.active === true);
  await settled(page);
  expect(await page.evaluate(() => Math.round((window as unknown as Hooked).__creteTest.modern!.pitch()))).toBe(75);
  const marks = await page.evaluate(() => (window as unknown as Hooked).__creteTest.modern!.markers());
  const want = await page.evaluate(() => {
    const s = (window as unknown as { __creteTest: { game: { run: { now: { objects: (string | null)[]; hazards: unknown[]; minotaur: unknown } } } } }).__creteTest.game.run.now;
    return { item: s.objects.filter(o => o && o !== 'block').length, hazard: s.hazards.length, minotaur: s.minotaur ? 1 : 0, theseus: 1 };
  });
  const count = (k: string) => marks.filter(m => m.kind === k).length;
  expect({ item: count('item'), hazard: count('hazard'), minotaur: count('minotaur'), theseus: count('theseus') }).toEqual(want);
  expect(marks.length).toBe(want.item + want.hazard + want.minotaur + want.theseus);
  const half = Math.sin((75 * Math.PI) / 180) / 2;
  for (const m of marks.filter(x => x.kind === 'minotaur' || x.kind === 'theseus')) {
    expect(Math.abs(m.at[0] - m.foot[0]), `${m.kind}: straight over its piece`).toBeLessThan(m.cell * 0.1);
    const up = (m.foot[1] - m.at[1]) / m.cell;
    expect(up, `${m.kind}: above its foot`).toBeGreaterThan(0);
    expect(up, `${m.kind}: its point inside its own cell`).toBeLessThan(half);
  }
  expect(errors).toEqual([]);
});

test.describe('on a touch phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('a two-finger twist turns the view and leaves it there, and the compass shows it; a swipe up then goes away from the camera; a finger tap on the compass resets', async ({ page }) => {
    const errors = await openHall(page);
    expect(await cam(page)).toEqual({ pitch: 75, yaw: 0 });
    await expect(page.locator('#cam-compass')).toBeVisible();
    const box = (await page.locator('#cam-compass').boundingBox())!;
    expect(Math.min(box.width, box.height), 'the compass is a finger-sized target').toBeGreaterThanOrEqual(44);
    await twoFingers(page, { deg: 70 });
    await settled(page);
    const { yaw } = await cam(page);
    expect(yaw, `the view stays where the twist left it, no quarter turn: ${yaw}`).toBe(70);
    expect(await compass(page), 'the compass turns with the view').toMatchObject({ heading: yaw, pitch: 75 });
    expect((await compass(page)).tilt).toBeCloseTo(1 / 3, 2);

    const from = await player(page);
    await swipe(page, '#stage3d', 0, -80);
    const step = STEP[screenToGrid('up', yaw)];
    await expect.poll(() => player(page), 'a swipe up goes away from the camera').toEqual({ r: from.r + step.r, c: from.c + step.c });

    // Two fingers sliding up together lean the view toward 45°, as on a map app, and the compass leans with it.
    await twoFingers(page, { dy: -120 });
    await settled(page);
    const tilted = await cam(page);
    expect(tilted.pitch, 'tilted').toBeLessThan(65);
    const face = await compass(page);
    expect(face.pitch, 'the compass shows the tilt').toBe(tilted.pitch);
    expect(face.tilt).toBeGreaterThan(0.6);

    await touchTap(page, '#cam-compass', 10);
    await expect.poll(() => cam(page), 'a real finger tap on the compass, wobbling 10 px, brings the starting view back').toEqual({ pitch: 75, yaw: 0 });
    await expect.poll(async () => (await compass(page)).tilt, 'and the compass shows it').toBeCloseTo(1 / 3, 2);
    expect(errors).toEqual([]);
  });

  test('a finger dragging the compass across turns the view, up leans it toward 45°, and a tap resets it', async ({ page }) => {
    const errors = await openHall(page);
    // Zoomed in and looking elsewhere, so the tap's re-centring shows. On a phone the zoom buttons are behind View.
    await page.locator('[aria-controls="cam-buttons"]').click();
    await zoomIn(page);
    await twoFingers(page, { dx: 60 });
    await settled(page);
    expect(await page.evaluate(() => (window as unknown as Hooked).__creteTest.modern!.following()), 'looking away from Theseus').toBe(false);
    await dragCompass(page, 'touch', 50, 0);
    await settled(page);
    const turned = await cam(page);
    expect(turned.yaw, 'across turns 0.6° a pixel, and stays there').toBe(-30);
    expect(turned.pitch, 'across alone does not tilt').toBe(75);
    await dragCompass(page, 'touch', 0, -50);
    await settled(page);
    expect((await cam(page)).pitch, 'up leans toward 45°').toBe(55);
    await dragCompass(page, 'touch', 0, -400);
    await settled(page);
    expect((await cam(page)).pitch, 'no further than 45°').toBe(45);
    expect((await compass(page)).tilt, 'the ring is full').toBe(1);
    await dragCompass(page, 'touch', 0, 400);
    await settled(page);
    expect((await cam(page)).pitch, 'down tilts as far as straight down').toBe(90);
    expect((await compass(page)).tilt, 'the ring is empty').toBe(0);
    expect((await cam(page)).yaw, 'and the heading stays').toBe(-30);
    await touchTap(page, '#cam-compass');
    await expect.poll(() => cam(page), 'a finger tap: 75°, north up').toEqual({ pitch: 75, yaw: 0 });
    expect(await page.evaluate(() => (window as unknown as Hooked).__creteTest.modern!.following()), 'following Theseus again').toBe(true);
    expect(errors).toEqual([]);
  });
});

test('with a mouse, a left drag turns across and tilts up and down, the wheel zooms, and a double click resets', async ({ page }) => {
  const errors = await openHall(page);
  const z0 = await zoom(page);
  const box = (await page.locator('#stage3d').boundingBox())!;
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(x, y - 8 * i);
  await page.mouse.up();
  await settled(page);
  expect((await cam(page)).pitch, 'dragging up leans toward 45°, as on a map app').toBeLessThan(60);
  expect((await cam(page)).yaw).toBe(0);
  expect((await compass(page)).pitch, 'the compass shows the tilt').toBe((await cam(page)).pitch);
  const z1 = await zoom(page);
  await page.mouse.wheel(0, -400);
  await expect.poll(() => zoom(page), 'the wheel zooms in').toBeLessThan(z1);
  await page.mouse.dblclick(x, y);
  await expect.poll(() => cam(page), 'a double click resets the heading and tilt').toEqual({ pitch: 75, yaw: 0 });
  await expect.poll(() => zoom(page), 'and the zoom').toBeCloseTo(z0, 3);
  expect(errors).toEqual([]);
});

test('with a mouse the compass turns and tilts the view, a click on it eases back to the start, its arrow keys steer, and Enter on it resets', async ({ page }) => {
  const errors = await openHall(page, HALL, 'no-preference');
  await dragCompass(page, 'mouse', -100, -40);
  // Every move here eases, a step a frame, and a headless browser without a GPU can draw only a few frames a second.
  const eased = { timeout: 20_000 };
  await expect.poll(() => cam(page), { ...eased, message: 'turned 60° the other way and leaned toward 45°, and left there' }).toEqual({ pitch: 59, yaw: 60 });
  expect(await compass(page)).toMatchObject({ heading: 60, pitch: 59 });
  // A click (no drag) resets, eased: the view passes through the angles between on its way back.
  const seen: number[] = [];
  await page.locator('#cam-compass').click();
  await expect.poll(async () => { const c = await cam(page); seen.push(c.yaw); return c; }, { ...eased, intervals: [16] }).toEqual({ pitch: 75, yaw: 0 });
  expect(seen.some(y => y > 0 && y < 60), `eased, not a jump: ${seen.join(' ')}`).toBe(true);
  await dragCompass(page, 'pen', 50, 0);
  await expect.poll(() => cam(page), { ...eased, message: 'a pen turns it too' }).toEqual({ pitch: 75, yaw: -30 });
  await page.locator('#cam-compass').focus();
  const from = await player(page);
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => cam(page), { ...eased, message: 'the arrow keys on the compass tilt 10° and turn 15°' }).toEqual({ pitch: 65, yaw: -45 });
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowDown');
  await expect.poll(() => cam(page), { ...eased, message: 'Down tilts as far as straight down' }).toEqual({ pitch: 90, yaw: -45 });
  expect(await player(page), 'and do not move Theseus').toEqual(from);
  await page.keyboard.press('Enter');
  await expect.poll(() => cam(page), { ...eased, message: 'Enter on the compass resets' }).toEqual({ pitch: 75, yaw: 0 });
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

test('every player starts at 75° and north up, with the turn buttons, the compass and the Walls choice; there is no View choice', async ({ page }) => {
  // A player from before the one camera kept a view and a heading: neither is read any more.
  await page.addInitScript(() => {
    localStorage.setItem('crete-view', 'angled');
    localStorage.setItem('crete-cam', JSON.stringify({ heading: 90, tilt: 50 }));
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(PAGE);
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await page.locator('#chapter-enter').click();
  await page.locator('#start-begin').click();
  await page.waitForFunction(() => (window as unknown as Hooked).__creteTest.modern?.active === true);
  await expect.poll(() => cam(page)).toEqual({ pitch: 75, yaw: 0 });
  await expect(page.locator('#cam-left')).toBeVisible();
  await expect(page.locator('#cam-compass')).toBeVisible();
  await page.keyboard.press('q');
  await expect(page.locator('#view-top')).toHaveCount(0);
  await expect(page.locator('#view-angled')).toHaveCount(0);
  await expect(page.locator('#walls-solid')).toBeVisible();
  await page.keyboard.press('q');
  // A turn is not kept into the next level: every level opens at 75°, north up.
  await drag(page, 200);
  await settled(page);
  expect((await cam(page)).yaw).toBe(-70);
  await page.evaluate(text => { const t = (window as unknown as Hooked).__creteTest; t.playLevel(t.parse(text)); }, HALL);
  await page.locator('#start-begin').click();
  await expect.poll(() => cam(page), 'the next level opens at 75°, north up').toEqual({ pitch: 75, yaw: 0 });
});

test('the menu has no Look setting; the Map button shows the classic board, and back', async ({ page }) => {
  const errors = await openHall(page);
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
  await expect(page.locator('#look-classic')).toHaveCount(0);
  await page.keyboard.press('q');
  await page.locator('#btn-look').click();
  await expect(page.locator('#stage')).toBeVisible();
  await expect(page.locator('#stage3d')).toBeHidden();
  await expect.poll(() => classicPainted(page), 'the classic board paints').toBe(true);
  expect((await modern(page))!.active).toBe(false);
  await page.locator('#btn-look').click();
  await expect(page.locator('#stage3d')).toBeVisible();
  await expect(page.locator('#stage')).toBeHidden();
  await expect.poll(async () => (await modern(page))!.active).toBe(true);
  expect(errors).toEqual([]);
});

test('the Map button swaps to Classic mid-level and back, keeps the moves and the choice, wears the other look, and B swaps too', async ({ page }) => {
  const errors = await openHall(page);
  await page.keyboard.press('ArrowRight');
  await expect.poll(async () => (await player(page)).c, 'Theseus moves').toBe(11);
  const moves = await page.locator('#hud-moves').textContent();
  await expect(page.locator('#btn-look')).toHaveText(/^Map/);
  await expect(page.locator('#btn-look')).toHaveAttribute('aria-label', 'Switch to Classic');
  /** Whether the button's face has been painted (any opaque, non-background pixel). */
  const facePainted = () => page.evaluate(() => {
    const c = document.querySelector('#btn-look canvas') as HTMLCanvasElement | null;
    if (!c) return false;
    const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    let lit = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i]! + d[i + 1]! + d[i + 2]! > 120) lit++;
    return lit > d.length / 40;
  });
  await expect.poll(facePainted, 'the Map face shows the classic tiles').toBe(true);
  const facePixels = () => page.evaluate(() => {
    const c = document.querySelector('#btn-look canvas') as HTMLCanvasElement | null;
    return c ? Array.from(c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data) : [];
  });
  const classicFace = await facePixels();
  await page.locator('#btn-look').click();
  await expect(page.locator('#stage')).toBeVisible();
  await expect(page.locator('#stage3d')).toBeHidden();
  await expect.poll(() => classicPainted(page), 'the classic board paints').toBe(true);
  await expect(page.locator('#btn-look')).toHaveText(/^3D/);
  await expect(page.locator('#btn-look')).toHaveAttribute('aria-label', 'Switch to Modern');
  await expect(page.locator('#hud-moves')).toHaveText(moves!);
  await expect.poll(async () => {
    const now = await facePixels();
    return now.length === classicFace.length && now.some((v, i) => v !== classicFace[i]) && await facePainted();
  }, 'the face changes to a painted modern board').toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('crete-look'))).toBe('classic');
  // The arrows still move Theseus after the press.
  await page.keyboard.press('ArrowLeft');
  await expect.poll(async () => (await player(page)).c, 'Theseus moves back').toBe(10);
  await page.keyboard.press('b');
  await expect(page.locator('#stage3d')).toBeVisible();
  await expect(page.locator('#stage')).toBeHidden();
  await expect.poll(async () => (await modern(page))!.active).toBe(true);
  await expect(page.locator('#btn-look')).toHaveText(/^Map/);
  expect(await page.evaluate(() => localStorage.getItem('crete-look'))).toBe('modern');
  await page.keyboard.press('b');
  await page.reload();
  expect(await page.evaluate(() => localStorage.getItem('crete-look')), 'the choice is kept through a reload').toBe('classic');
  await page.locator('#title-play').click();
  await expect(page.locator('#pick-classic')).toHaveAttribute('aria-pressed', 'true');
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
  await page.locator('#btn-look').click();
  await expect(page.locator('#toast')).not.toHaveClass(/\bshow\b/, { timeout: 10_000 }); // the "Classic look." toast has gone
  await lose();
  await page.waitForTimeout(1000);
  await expect(page.locator('#toast')).not.toContainText('stopped working');
  await page.locator('#btn-look').click();
  await expect(page.locator('#toast')).toContainText('stopped working');
  expect(errors).toEqual([]);
});

test('the first-time hint shows by the compass after a quiet moment, and a drag on the board takes it away for good', async ({ page }) => {
  const errors = await openHall(page);
  const pill = page.locator('#view-hint');
  await expect(pill, 'a new player sees the hint once the board is quiet').toBeVisible({ timeout: 10_000 });
  await expect(pill).toHaveText('Drag to turn and tilt · Right-drag to pan · Tap the compass to reset');
  await drag(page, 120);
  await expect(pill, 'the first turn takes it away').toBeHidden();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('crete-view-hint')!))).toEqual({ shows: 1, moved: true });
  // The next visit: the player has moved the camera, so it never shows again.
  await openHall(page);
  await page.waitForTimeout(4000);
  await expect(pill).toBeHidden();
  expect(errors).toEqual([]);
});

test('the first-time hint waits while a card covers the board, closes on a tap, shows on a second visit, and not a third', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(PAGE);
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await page.locator('#chapter-enter').click();
  await expect(page.locator('#start-veil')).toBeVisible();
  await page.waitForTimeout(3000);
  const pill = page.locator('#view-hint');
  await expect(pill, 'not while the start card covers the board').toBeHidden();
  await page.locator('#start-begin').click();
  await expect(pill, 'the first visit').toBeVisible({ timeout: 10_000 });
  await pill.click();
  await expect(pill, 'a tap on it closes it').toBeHidden();
  await openHall(page);
  await expect(pill, 'the second visit').toBeVisible({ timeout: 10_000 });
  await pill.click();
  await expect(pill).toBeHidden();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('crete-view-hint')!))).toEqual({ shows: 2, moved: false });
  await openHall(page);
  await page.waitForTimeout(4000);
  await expect(pill, 'no third visit').toBeHidden();
  expect(errors).toEqual([]);
});
