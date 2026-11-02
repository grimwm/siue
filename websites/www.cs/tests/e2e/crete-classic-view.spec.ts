// The Island of Crete's classic look turns and tilts as a flat sheet: it opens at 75° and north up, its compass
// turns and tilts it under a drag and resets it on a tap, its buttons turn it a quarter, the arrows move Theseus the
// way the screen shows, the figures stand on their squares however it is turned, a new level opens north up again,
// the heading and tilt go across to the modern look and back with the Map button, and the classic look never loads
// the 3D board (src/sheet.ts, src/sheet-board.ts).
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/** Every Dictionary entry met before the page loads, and the Classic look, so the specs start on the sheet. */
const setUp = (): void => {
  localStorage.setItem('crete-met', '["*"]');
  localStorage.setItem('crete-look', 'classic');
  localStorage.setItem('crete-view-hint', '{"shows":0,"moved":true}');
};
test.beforeEach(async ({ context }) => { await context.addInitScript(setUp); });

/* A wide open hall, Theseus in its middle, so a move in any direction is free. */
const HALL = [
  'title: The Open Hall',
  'intro: Room to look about.',
  '',
  '###############',
  '#.............#',
  '#.............#',
  '#.............#',
  '#......P......#',
  '#.............#',
  '#.............#',
  '#............E#',
  '###############',
  '',
].join('\n');

interface Hooked {
  __creteTest: {
    game: { run: { now: { player: { r: number; c: number } } } };
    parse(text: string): unknown;
    playLevel(level: unknown): void;
    modern?: { yaw(): number; pitch(): number; active: boolean };
    classic: {
      view(): { yaw: number; pitch: number };
      at(c: number, r: number): { x: number; y: number } | null;
    };
  };
}

type Dir = 'up' | 'down' | 'left' | 'right';
/** src/modern/screen-move.ts, as the spec expects it: up is the grid direction nearest away from the viewer. */
function screenToGrid(dir: Dir, yaw: number): Dir {
  const UP: Dir[] = ['up', 'left', 'down', 'right'];
  const OFFSET: Record<Dir, number> = { up: 0, left: 1, down: 2, right: 3 };
  const q = ((Math.round(yaw / 90) % 4) + 4) % 4;
  return UP[(q + OFFSET[dir]) % 4]!;
}
const STEP: Record<Dir, { r: number; c: number }> = { up: { r: -1, c: 0 }, down: { r: 1, c: 0 }, left: { r: 0, c: -1 }, right: { r: 0, c: 1 } };
const KEY: Record<Dir, string> = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };

const view = (page: Page) => page.evaluate(() => {
  const v = (window as unknown as Hooked).__creteTest.classic.view();
  return { yaw: Math.round(v.yaw), pitch: Math.round(v.pitch) };
});
const player = (page: Page) => page.evaluate(() => ({ ...(window as unknown as Hooked).__creteTest.game.run.now.player }));
const compass = (page: Page) => page.locator('#classic-compass').evaluate(el => {
  const b = el as HTMLElement;
  return { heading: Number(b.dataset.heading), pitch: Number(b.dataset.pitch) };
});

/** A mouse press on the classic compass dragged (dx, dy) CSS px in steps, then lifted; (0, 0) is a tap. */
async function dragCompass(page: Page, dx: number, dy: number): Promise<void> {
  await page.locator('#classic-compass').evaluate((el, [dx, dy]) => {
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const ev = (kind: string, px: number, py: number) => el.dispatchEvent(new PointerEvent(kind, {
      pointerId: 41, pointerType: 'mouse', isPrimary: true, clientX: px, clientY: py, bubbles: true, cancelable: true, button: 0,
    }));
    ev('pointerdown', x, y);
    for (let i = 1; i <= 8; i++) ev('pointermove', x + dx! * i / 8, y + dy! * i / 8);
    ev('pointerup', x + dx!, y + dy!);
  }, [dx, dy] as const);
}

async function openHall(page: Page): Promise<{ errors: string[]; modernJs: string[] }> {
  const errors: string[] = [];
  const modernJs: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => { if (/\/dist\/modern\.js/.test(r.url())) modernJs.push(r.url()); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('games/crete/');
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await page.locator('#chapter-enter').click();
  await expect(page.locator('#start-veil')).toBeVisible();
  await page.evaluate(text => { const t = (window as unknown as Hooked).__creteTest; t.playLevel(t.parse(text)); }, HALL);
  await page.locator('#start-begin').click();
  await expect(page.locator('#start-veil')).toBeHidden();
  await page.waitForSelector('#stage[data-cell]');
  return { errors, modernJs };
}

test('the classic sheet opens at 75° and north up, turns and tilts on the compass and its buttons, and a tap resets it', async ({ page }) => {
  const { errors } = await openHall(page);
  expect(await view(page)).toEqual({ yaw: 0, pitch: 75 });
  expect(await compass(page)).toEqual({ heading: 0, pitch: 75 });
  await expect(page.locator('#stage')).toHaveCSS('transform', /matrix3d/);
  // Across turns it (0.6° a pixel, as on the modern compass); down tilts it back toward straight down.
  await dragCompass(page, -100, 0);
  await expect.poll(() => view(page)).toEqual({ yaw: 60, pitch: 75 });
  await dragCompass(page, 0, -50);
  await expect.poll(() => view(page)).toEqual({ yaw: 60, pitch: 55 });
  await dragCompass(page, 0, -200);
  await expect.poll(() => view(page), 'held at 45°').toEqual({ yaw: 60, pitch: 45 });
  expect(await compass(page)).toEqual({ heading: 60, pitch: 45 });
  // The turn buttons turn a quarter.
  const turnRight = page.locator('#classic-right');
  if (!(await turnRight.isVisible())) await page.locator('#classic-cam .modern-viewbtn').click();
  await turnRight.click();
  await expect.poll(() => view(page)).toEqual({ yaw: 150, pitch: 45 });
  // A tap on the compass goes back to the opening view, by the nearest way round.
  await dragCompass(page, 0, 0);
  await expect.poll(() => view(page)).toEqual({ yaw: 0, pitch: 75 });
  expect(errors).toEqual([]);
});

test('turned, the arrows move Theseus the way the screen shows and the figures stand on their squares', async ({ page }) => {
  const { errors } = await openHall(page);
  // Drags of 100, 150 and 150 px leftward turn the view by 60°, 90° and 90°.
  for (const [turn, yaw] of [[-100, 60], [-150, 150], [-150, 240]] as const) {
    await dragCompass(page, turn, 0);
    await expect.poll(() => view(page)).toEqual({ yaw, pitch: 75 });
    for (const dir of ['up', 'right', 'down', 'left'] as const) {
      const from = await player(page);
      await page.keyboard.press(KEY[dir]);
      const step = STEP[screenToGrid(dir, yaw)];
      await expect.poll(() => player(page), `${dir} at ${yaw}°`).toEqual({ r: from.r + step.r, c: from.c + step.c });
    }
    // Theseus's square's centre shows inside the board, and where his figure stands: the overlay has his pixels
    // near it.
    const at = await page.evaluate(() => {
      const t = (window as unknown as Hooked).__creteTest;
      const p = t.game.run.now.player;
      return t.classic.at(p.c, p.r);
    });
    const box = (await page.locator('#stage-view').boundingBox())!;
    expect(at!.x).toBeGreaterThan(box.x);
    expect(at!.x).toBeLessThan(box.x + box.width);
    const lit = await page.evaluate(([x, y]) => {
      const o = document.querySelector('.stage-figures') as HTMLCanvasElement;
      const r = o.getBoundingClientRect();
      const k = o.width / r.width;
      const d = o.getContext('2d')!.getImageData(Math.round((x! - r.left) * k) - 4, Math.round((y! - r.top) * k) - 30, 8, 30).data;
      let n = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i]! > 200) n++;
      return n;
    }, [at!.x, at!.y]);
    expect(lit, `Theseus stands on his square at ${yaw}°`).toBeGreaterThan(20);
  }
  expect(errors).toEqual([]);
});

test('a new level opens the classic sheet north up again', async ({ page }) => {
  const { errors } = await openHall(page);
  await dragCompass(page, -150, 60);
  await expect.poll(() => view(page)).not.toEqual({ yaw: 0, pitch: 75 });
  await page.evaluate(text => { const t = (window as unknown as Hooked).__creteTest; t.playLevel(t.parse(text)); }, HALL);
  await page.locator('#start-begin').click();
  await expect.poll(() => view(page)).toEqual({ yaw: 0, pitch: 75 });
  expect(errors).toEqual([]);
});

test('Classic never loads the 3D board, however long it is played', async ({ page }) => {
  const { errors, modernJs } = await openHall(page);
  for (const k of ['ArrowRight', 'ArrowUp', 'ArrowLeft']) {
    const before = (await player(page)).r * 100 + (await player(page)).c;
    await page.keyboard.press(k);
    await expect.poll(async () => { const p = await player(page); return p.r * 100 + p.c; }, `${k} moves`).not.toBe(before);
  }
  // The Map button's face shows the Modern look without it.
  const facePainted = () => page.evaluate(() => {
    const c = document.querySelector('#btn-look canvas') as HTMLCanvasElement | null;
    if (!c) return false;
    const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data;
    let lit = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i]! + d[i + 1]! + d[i + 2]! > 120) lit++;
    return lit > d.length / 40;
  });
  await expect.poll(facePainted, 'the Map face shows the Modern look').toBe(true);
  // A negative check needs a span to watch: the face once loaded the 3D board after 2.5 s at rest, so rest past it.
  await page.waitForTimeout(3000);
  expect(modernJs, 'no request for the 3D board').toEqual([]);
  expect(await page.evaluate(() => (window as unknown as Hooked).__creteTest.modern === undefined || !(window as unknown as Hooked).__creteTest.modern!.active)).toBe(true);
  expect(errors).toEqual([]);
});

test('the heading and tilt go across to the modern look and back with the Map button', async ({ page }) => {
  const { errors } = await openHall(page);
  await dragCompass(page, -200, -40);
  await expect.poll(() => view(page)).toEqual({ yaw: 120, pitch: 59 });
  await page.keyboard.press('b');
  await expect(page.locator('#stage3d')).toBeVisible();
  await page.waitForFunction(() => (window as unknown as Hooked).__creteTest.modern?.active === true);
  const modernView = () => page.evaluate(() => {
    const m = (window as unknown as Hooked).__creteTest.modern!;
    return { yaw: Math.round(m.yaw()), pitch: Math.round(m.pitch()) };
  });
  await expect.poll(modernView, 'Modern takes up the classic view').toEqual({ yaw: 120, pitch: 59 });
  // Turned in Modern, the view comes back to Classic.
  await page.locator('#cam-compass').evaluate(el => {
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const ev = (kind: string, px: number, py: number) => el.dispatchEvent(new PointerEvent(kind, {
      pointerId: 42, pointerType: 'mouse', isPrimary: true, clientX: px, clientY: py, bubbles: true, cancelable: true, button: 0,
    }));
    ev('pointerdown', x, y);
    for (let i = 1; i <= 8; i++) ev('pointermove', x - 50 * i / 8, y + 25 * i / 8);
    ev('pointerup', x - 50, y + 25);
  });
  await expect.poll(modernView).toEqual({ yaw: 150, pitch: 69 });
  await page.keyboard.press('b');
  await expect(page.locator('#stage')).toBeVisible();
  await expect.poll(() => view(page), 'Classic takes up the modern view').toEqual({ yaw: 150, pitch: 69 });
  expect(await compass(page)).toEqual({ heading: 150, pitch: 69 });
  // The moves follow the view that shows.
  const from = await player(page);
  await page.keyboard.press('ArrowUp');
  const step = STEP[screenToGrid('up', 150)];
  await expect.poll(() => player(page)).toEqual({ r: from.r + step.r, c: from.c + step.c });
  expect(errors).toEqual([]);
});
