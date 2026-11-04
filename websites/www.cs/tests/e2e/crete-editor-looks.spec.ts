// The Crete level editor in both looks: on a phone in Modern, one finger paints the 3D board, a drag paints a run and
// two fingers move the camera without painting; in Classic the tilted sheet paints and the 3D engine never loads, and
// the bar's Classic and Modern buttons (and B) switch between them, keeping the draft, its undo history and the view's
// heading and tilt and setting the game's look; a turned Classic view paints the square under the pointer. Real
// touches come through the DevTools protocol, so the page sees what a phone sends.
import { test, expect } from '@playwright/test';
import type { CDPSession, Page } from '@playwright/test';

const PAGE = 'games/crete/';

interface Pt { x: number; y: number }
interface Hooked {
  __creteTest: {
    editor: {
      draft: { rows: number; cols: number; cells: string[] };
      modern: {
        cellAt(c: number, r: number): [number, number]; yaw(): number; pitch(): number; zoom(): number; hovered(): { r: number; c: number } | null;
        setView(yaw: number, pitch: number): void;
      } | null;
      classic: { at(c: number, r: number): Pt | null; view(): { yaw: number; pitch: number } } | null;
    };
  };
}

const allMet = (): void => localStorage.setItem('crete-met', '["*"]');

/** The draft's rows, as the level text writes its grid. */
const grid = (page: Page) => page.evaluate(() => {
  const d = (window as unknown as Hooked).__creteTest.editor.draft;
  return Array.from({ length: d.rows }, (_, r) => d.cells.slice(r * d.cols, (r + 1) * d.cols).join(''));
});

/** Where cell (r, c)'s floor shows on the editor's Modern board, in page pixels. */
async function modernCell(page: Page, r: number, c: number): Promise<Pt> {
  const box = (await page.locator('#editor-stage3d').boundingBox())!;
  const [x, y] = await page.evaluate(([rr, cc]) => (window as unknown as Hooked).__creteTest.editor.modern!.cellAt(cc!, rr!), [r, c]);
  return { x: box.x + x, y: box.y + y };
}

/** Where cell (r, c)'s centre shows on the editor's Classic board, the turned and tilted sheet, in page pixels. */
async function classicCell(page: Page, r: number, c: number): Promise<Pt> {
  return (await page.evaluate(([rr, cc]) => (window as unknown as Hooked).__creteTest.editor.classic!.at(cc!, rr!), [r, c]))!;
}

/** The view's heading and tilt as each look and its compass show it. */
const classicView = (page: Page) => page.evaluate(() => (window as unknown as Hooked).__creteTest.editor.classic!.view());
const modernView = (page: Page) => page.evaluate(() => {
  const m = (window as unknown as Hooked).__creteTest.editor.modern!;
  return { yaw: m.yaw(), pitch: m.pitch() };
});
const compass = async (page: Page, id: string) => {
  const c = page.locator(`#editor-board #${id}`);
  return { yaw: Number(await c.getAttribute('data-heading')), pitch: Number(await c.getAttribute('data-pitch')) };
};

/** Sends touches: each step lists the fingers down then, in order (a finger's id is its place in the list). */
async function touch(cdp: CDPSession, steps: Pt[][]): Promise<void> {
  const pts = (ps: Pt[]) => ps.map((p, id) => ({ x: p.x, y: p.y, id }));
  let held = 0;
  for (const s of steps) {
    await cdp.send('Input.dispatchTouchEvent', { type: s.length > held ? 'touchStart' : 'touchMove', touchPoints: pts(s) });
    held = s.length;
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

const modernReady = (page: Page) => expect.poll(() => page.evaluate(() => (window as unknown as Hooked).__creteTest.editor.modern !== null), { timeout: 20000 }).toBe(true);

test('on a phone in Modern, one finger paints the 3D board and a drag paints a run; two fingers move the camera and paint nothing', async ({ browser }) => {
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  await phone.addInitScript(allMet);
  await phone.addInitScript(() => localStorage.setItem('crete-look', 'modern'));
  try {
    const page = await phone.newPage();
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${PAGE}#edit`);
    await expect(page.locator('#editor-root')).toBeVisible();
    await modernReady(page);
    await expect(page.locator('#editor-stage3d')).toBeVisible();
    await expect(page.locator('#editor-stage')).toBeHidden();
    await expect(page.locator('#editor-look-modern')).toHaveAttribute('aria-pressed', 'true');
    const before = await grid(page);
    const cdp = await page.context().newCDPSession(page);

    // A tap paints the wall brush on one cell.
    await touch(cdp, [[await modernCell(page, 2, 2)]]);
    await expect.poll(async () => (await grid(page))[2]![2]).toBe('#');
    // A drag paints every cell it crosses.
    await touch(cdp, [[await modernCell(page, 5, 2)], [await modernCell(page, 5, 4)], [await modernCell(page, 5, 6)]]);
    await expect.poll(async () => (await grid(page))[5]!.slice(2, 7)).toBe('#####');
    const painted = await grid(page);

    // A second finger turns the stroke into a camera move: nothing is painted, and the view zooms.
    const zoom = await page.evaluate(() => (window as unknown as Hooked).__creteTest.editor.modern!.zoom());
    const a = await modernCell(page, 8, 3), b = await modernCell(page, 8, 8);
    await touch(cdp, [[a], [{ x: a.x + 6, y: a.y }], [{ x: a.x + 6, y: a.y }, b], [{ x: a.x - 30, y: a.y }, { x: b.x + 30, y: b.y }]]);
    expect(await grid(page), 'two fingers paint nothing').toEqual(painted);
    expect(await page.evaluate(() => (window as unknown as Hooked).__creteTest.editor.modern!.zoom()), 'spreading two fingers zooms in').toBeLessThan(zoom);

    // The level text: the cells painted and nothing else.
    const want = before.map((row, r) => [...row].map((ch, c) => ((r === 2 && c === 2) || (r === 5 && c >= 2 && c <= 6) ? '#' : ch)).join(''));
    expect(painted).toEqual(want);
    expect(errors).toEqual([]);
  } finally {
    await phone.close();
  }
});

test('Classic paints the tilted sheet and never loads the 3D engine; Modern and B switch looks, keeping the draft and its undo', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(allMet);
  await page.addInitScript(() => localStorage.setItem('crete-look', 'classic'));
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  const modernLoads: string[] = [];
  page.on('request', r => { if (/\/dist\/modern\.js/.test(r.url())) modernLoads.push(r.url()); });
  await page.goto(`${PAGE}#edit`);
  await expect(page.locator('#editor-root')).toBeVisible();
  await expect(page.locator('#editor-look-classic')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#editor-stage')).toBeVisible();
  await expect(page.locator('#editor-help')).toContainText('Two fingers, the right button and the wheel move the view');
  await expect(page.locator('#editor-compass')).toBeVisible();
  expect(await classicView(page), 'Classic opens at 75° and north up').toEqual({ yaw: 0, pitch: 75 });

  for (const [r, c] of [[2, 3], [2, 4], [3, 3]] as const) {
    const p = await classicCell(page, r, c);
    await page.mouse.click(p.x, p.y);
  }
  await expect.poll(async () => (await grid(page)).slice(2, 4).map(row => row.slice(3, 5))).toEqual(['##', '#.']);
  expect(modernLoads, 'Classic never loads the modern bundle').toEqual([]);

  await page.locator('#editor-look-modern').click();
  await modernReady(page);
  expect(modernLoads.length).toBe(1);
  expect(await page.evaluate(() => localStorage.getItem('crete-look')), 'the editor sets the game\'s look').toBe('modern');
  expect((await grid(page)).slice(2, 4).map(row => row.slice(3, 5)), 'the draft is kept').toEqual(['##', '#.']);

  // The mouse hovers a cell (framed) and a drag with the left button paints a run.
  const from = await modernCell(page, 7, 3), to = await modernCell(page, 7, 7);
  await page.mouse.move(from.x, from.y);
  await expect.poll(() => page.evaluate(() => (window as unknown as Hooked).__creteTest.editor.modern!.hovered())).toEqual({ r: 7, c: 3 });
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 6 });
  await page.mouse.up();
  await expect.poll(async () => (await grid(page))[7]!.slice(3, 8)).toBe('#####');
  // The right button turns the view and paints nothing.
  const yaw = await page.evaluate(() => (window as unknown as Hooked).__creteTest.editor.modern!.yaw());
  const g = await grid(page);
  await page.mouse.move(from.x, from.y + 60);
  await page.mouse.down({ button: 'right' });
  await page.mouse.move(from.x + 120, from.y + 60, { steps: 5 });
  await page.mouse.up({ button: 'right' });
  expect(await grid(page)).toEqual(g);
  expect(await page.evaluate(() => (window as unknown as Hooked).__creteTest.editor.modern!.yaw())).not.toBe(yaw);

  // B back to Classic: the run is there, and U undoes it, one step.
  await page.keyboard.press('b');
  await expect(page.locator('#editor-look-classic')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#editor-stage')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('crete-look'))).toBe('classic');
  await page.keyboard.press('u');
  await expect.poll(async () => (await grid(page))[7]!.slice(3, 8)).toBe('.....');
  expect((await grid(page)).slice(2, 4).map(row => row.slice(3, 5))).toEqual(['##', '#.']);
  expect(errors).toEqual([]);
});

test('switching looks keeps the view\'s heading and tilt both ways, and a turned Classic view paints the square under the pointer', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 860 });
  await page.addInitScript(allMet);
  await page.addInitScript(() => localStorage.setItem('crete-look', 'modern'));
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${PAGE}#edit`);
  await modernReady(page);

  // Set in Modern, the heading and tilt show in Classic, on its sheet and its compass.
  await page.evaluate(() => (window as unknown as Hooked).__creteTest.editor.modern!.setView(130, 40));
  expect(await modernView(page)).toEqual({ yaw: 130, pitch: 40 });
  await page.locator('#editor-look-classic').click();
  await expect(page.locator('#editor-view')).toBeVisible();
  expect(await classicView(page)).toEqual({ yaw: 130, pitch: 40 });
  expect(await compass(page, 'editor-compass')).toEqual({ yaw: 130, pitch: 40 });
  await expect(page.locator('#editor-stage')).toHaveAttribute('style', /rotateX\(50(\.0+)?deg\) rotateZ\(130(\.0+)?deg\)/);

  // The right button turns and tilts the Classic view and paints nothing; back in Modern the view is the same.
  const before = await grid(page);
  const mid = await classicCell(page, 6, 6);
  await page.mouse.move(mid.x, mid.y);
  await page.mouse.down({ button: 'right' });
  await page.mouse.move(mid.x + 100, mid.y + 40, { steps: 5 });
  await page.mouse.up({ button: 'right' });
  expect(await grid(page), 'the right button paints nothing').toEqual(before);
  const turned = await classicView(page);
  expect(turned.yaw).not.toBe(130);
  expect(turned.pitch).not.toBe(40);
  await page.keyboard.press('b');
  await modernReady(page);
  const back = await modernView(page);
  expect(back.yaw).toBeCloseTo(turned.yaw, 6);
  expect(back.pitch).toBeCloseTo(turned.pitch, 6);
  expect(await compass(page, 'cam-compass')).toEqual({ yaw: Math.round(turned.yaw), pitch: Math.round(turned.pitch) });

  // Turned to 215° and tilted to 30° in Modern, Classic paints the square under the pointer.
  await page.evaluate(() => (window as unknown as Hooked).__creteTest.editor.modern!.setView(215, 30));
  await page.keyboard.press('b');
  await expect(page.locator('#editor-look-classic')).toHaveAttribute('aria-pressed', 'true');
  expect(await classicView(page)).toEqual({ yaw: 215, pitch: 30 });
  await page.locator('#brush-wall').click();
  for (const [r, c] of [[2, 3], [8, 9]] as const) {
    const p = await classicCell(page, r, c);
    await page.mouse.click(p.x, p.y);
  }
  const want = before.map((row, r) => [...row].map((ch, c) => ((r === 2 && c === 3) || (r === 8 && c === 9) ? '#' : ch)).join(''));
  await expect.poll(() => grid(page)).toEqual(want);

  // A tap on the compass goes back to 75° and the nearest north up.
  await page.locator('#editor-compass').click();
  const home = await classicView(page);
  expect(home.pitch).toBe(75);
  expect(((home.yaw % 360) + 360) % 360).toBe(0);
  expect(errors).toEqual([]);
});
