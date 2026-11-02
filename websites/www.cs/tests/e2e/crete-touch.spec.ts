// The Island of Crete on a touch phone: the move pad held and slid (src/pad.ts), the board under one finger and two
// (src/modern/gestures.ts), never moving Theseus, the touch tour that shows once (src/tour.ts), and Reset Tips. Real
// touches come through the DevTools protocol, so the page sees the pointer events a phone sends, captures and all.
import { test, expect } from '@playwright/test';
import type { CDPSession, Page } from '@playwright/test';

const PAGE = 'games/crete/';

interface Cell { r: number; c: number }
interface Hooked {
  __creteTest: {
    game: { run: { now: { player: Cell; moves: number } } };
    parse(text: string): unknown;
    playLevel(level: unknown, opts?: { outside: { kind: 'shared'; name: string; best: null } }): void;
    classic: { view(): { yaw: number; pitch: number } };
  };
}

/** An open room, Theseus in its middle, nothing to meet and no Minotaur. */
const ROOM = ['title: The room', 'intro: Walk about.', '', '###########', '#.........#', '#.........#', '#....P....#', '#.........#', '#........E#', '###########', ''].join('\n');
/** A long hall to hold an arrow down. */
const HALL = ['title: The hall', 'intro: Walk on.', '', '#################', '#P.............E#', '#################', ''].join('\n');
/** Medusa's mirror one step to the right. */
const MIRROR = ['title: The mirror', 'intro: Take it.', '', '#######', '#Pz..E#', '#######', ''].join('\n');

const allMet = (): void => localStorage.setItem('crete-met', '["*"]');
const pinClassic = (): void => localStorage.setItem('crete-look', 'classic');

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });

/** Opens `text` on the real page, past its start card: as a shared level, which shows first cards as the campaign does. */
async function open(page: Page, text: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(PAGE);
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await page.locator('#chapter-enter').click();
  await expect(page.locator('#start-veil')).toBeVisible();
  await page.evaluate(t => {
    const h = (window as unknown as Hooked).__creteTest;
    h.playLevel(h.parse(t), { outside: { kind: 'shared', name: 'Touch', best: null } });
  }, text);
  await page.locator('#start-begin').click();
  await expect(page.locator('#start-veil')).toBeHidden();
  return errors;
}

const now = (page: Page) => page.evaluate(() => {
  const s = (window as unknown as Hooked).__creteTest.game.run.now;
  return { player: { ...s.player }, moves: s.moves };
});
const view = (page: Page) => page.evaluate(() => {
  const v = (window as unknown as Hooked).__creteTest.classic.view();
  return { yaw: Math.round(v.yaw), pitch: Math.round(v.pitch) };
});
const centre = async (page: Page, sel: string) => {
  const b = (await page.locator(sel).boundingBox())!;
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
};

/** Touches as a phone sends them: `points` down, moved along `path` (one list of points per step), then lifted. */
async function touch(cdp: CDPSession, steps: { x: number; y: number }[][], holdMs = 0): Promise<void> {
  const pts = (ps: { x: number; y: number }[]) => ps.map((p, id) => ({ x: p.x, y: p.y, id }));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(steps[0]!) });
  for (const s of steps.slice(1)) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pts(s) });
  if (holdMs) await new Promise(r => setTimeout(r, holdMs));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

test.describe('with every tip seen', () => {
  test.beforeEach(async ({ context }) => { await context.addInitScript(allMet); });

  test('holding an arrow walks on, a step at a time, until the finger lifts', async ({ page }) => {
    const errors = await open(page, HALL);
    const cdp = await page.context().newCDPSession(page);
    const right = await centre(page, '.pad .mv-right');
    await touch(cdp, [[right]], 1000);
    const walked = (await now(page)).moves;
    expect(walked, `a press and ${walked - 1} repeats`).toBeGreaterThanOrEqual(3);
    expect(walked, 'never ahead of the moves it played').toBeLessThanOrEqual(8);
    await page.waitForTimeout(400);
    expect((await now(page)).moves, 'lifting stops it').toBe(walked);
    expect((await now(page)).player).toEqual({ r: 1, c: 1 + walked });
    expect(errors).toEqual([]);
  });

  test('a finger slid from one arrow to another moves each way once, and the centre moves nowhere', async ({ page }) => {
    const errors = await open(page, ROOM);
    const cdp = await page.context().newCDPSession(page);
    const from = (await now(page)).player;
    const [right, up, hub] = [await centre(page, '.pad .mv-right'), await centre(page, '.pad .mv-up'), await centre(page, '.pad .pad-hub')];
    await touch(cdp, [[hub], [right], [{ x: (right.x + up.x) / 2 + 2, y: (right.y + up.y) / 2 - 2 }], [up], [hub]]);
    const after = await now(page);
    const east = after.player.c - from.c, north = from.r - after.player.r;
    // A slow machine may hold a finger past HOLD_MS on an arrow, which walks on: at least one step each way, nothing else.
    expect(east, 'it went right').toBeGreaterThanOrEqual(1);
    expect(north, 'then up').toBeGreaterThanOrEqual(1);
    expect(after.moves, 'and no other way').toBe(east + north);
    const tap = await centre(page, '.pad .mv-left');
    await touch(cdp, [[tap]]);
    await page.waitForTimeout(100);
    expect((await now(page)).moves, 'a tap is one move, its click no second').toBe(after.moves + 1);
    expect(errors).toEqual([]);
  });

  test('on the classic board one finger turns and tilts and two fingers twist, and no finger moves Theseus', async ({ page }) => {
    await page.addInitScript(pinClassic);
    const errors = await open(page, ROOM);
    await page.waitForSelector('#stage[data-cell]');
    const cdp = await page.context().newCDPSession(page);
    const c = await centre(page, '#stage-view');
    const before = await now(page);
    await touch(cdp, [[c], [{ x: c.x + 30, y: c.y }], [{ x: c.x + 80, y: c.y }]]);
    await expect.poll(async () => (await view(page)).yaw, 'one finger across turns').not.toBe(0);
    const turned = await view(page);
    await touch(cdp, [[c], [{ x: c.x, y: c.y - 20 }], [{ x: c.x, y: c.y - 50 }]]);
    await expect.poll(async () => (await view(page)).pitch, 'one finger up tilts toward the lowest').toBeLessThan(turned.pitch);
    const tilted = await view(page);
    const twist = (deg: number) => {
      const a = (deg * Math.PI) / 180;
      return [{ x: c.x - 60 * Math.cos(a), y: c.y - 60 * Math.sin(a) }, { x: c.x + 60 * Math.cos(a), y: c.y + 60 * Math.sin(a) }];
    };
    await touch(cdp, [twist(0), twist(10), twist(20), twist(30)]);
    await expect.poll(async () => (await view(page)).yaw, 'two fingers twist').not.toBe(tilted.yaw);
    expect(await now(page), 'Theseus never moved').toEqual(before);
    expect(errors).toEqual([]);
  });
});

test('the touch tour shows once when play starts on a touch screen, and Show View Tips brings it back', async ({ page }) => {
  const errors = await open(page, ROOM);
  await expect(page.locator('#tour'), 'it shows by itself once the start card has gone').toBeVisible();
  await expect(page.locator('#tour-caption')).toHaveText('Tap an arrow to take a step');
  await expect(page.locator('#tour .tour-dot').first()).toBeVisible();
  const before = await now(page);
  await page.locator('.pad .mv-right').tap({ force: true });
  await expect(page.locator('#tour'), 'a tap anywhere closes it').toBeHidden();
  expect(await now(page), 'and moves nothing').toEqual(before);
  await page.reload();
  await open(page, ROOM);
  await page.waitForTimeout(300);
  await expect(page.locator('#tour'), 'once only').toHaveCount(0);
  await page.locator('#btn-menu-strip:visible, #btn-menu:visible').first().tap();
  await page.locator('#menu-view-tips').tap();
  await expect(page.locator('#tour')).toBeVisible();
  await page.locator('#tour-next').tap();
  await expect(page.locator('#tour-caption'), 'with reduced motion it steps on Next').toHaveText('Hold an arrow to keep walking');
  await page.locator('#tour-done').tap();
  await expect(page.locator('#tour')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('Reset Tips shows a first card again on the next pickup, and the Dictionary keeps the entry open', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('crete-met', '["mirror","touch-tour"]');
  });
  const errors = await open(page, MIRROR);
  await page.locator('#btn-menu-strip:visible, #btn-menu:visible').first().tap();
  await page.locator('#menu-reset-tips').tap();
  await expect(page.locator('#menu-reset-ask')).toBeVisible();
  await page.locator('#menu-reset-yes').tap();
  await expect(page.locator('#menu-reset-tips'), 'the question goes once answered').toBeVisible();
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeHidden();
  await expect(page.locator('#tour'), 'the touch tour shows again too').toBeVisible();
  await page.locator('#tour-done').tap();
  await page.locator('.pad .mv-right').tap();
  await expect(page.locator('#meet-veil'), 'the mirror\'s first card shows again').toBeVisible();
  await page.locator('#meet-go').tap();
  await expect(page.locator('#meet-veil')).toBeHidden();
  await page.locator('#btn-menu-strip:visible, #btn-menu:visible').first().tap();
  await page.locator('#menu-dictionary').tap();
  await page.locator('#dict-tab-entries').tap();
  await expect(page.locator('.dict-row[data-entry="mirror"]')).not.toHaveAttribute('data-locked', 'true');
  expect(JSON.parse((await page.evaluate(() => localStorage.getItem('crete-met')))!), 'nothing met was forgotten').toEqual(expect.arrayContaining(['mirror']));
  expect(errors).toEqual([]);
});

test.describe('a finger tap on the compass', () => {
  test.beforeEach(async ({ context }) => { await context.addInitScript(allMet); });
  test.use({ reducedMotion: 'no-preference' });

  /** A finger tap on `sel` that wobbles `wobble` px upward before it lifts. */
  async function wobblyTap(page: Page, cdp: CDPSession, sel: string, wobble: number): Promise<void> {
    const c = await centre(page, sel);
    await touch(cdp, [[c], [{ x: c.x, y: c.y - wobble / 2 }], [{ x: c.x, y: c.y - wobble }]]);
  }

  test('resets the classic view to 75° and north up, even with 10 px of wobble, right after a look switch', async ({ page }) => {
    const errors = await open(page, ROOM);
    const cdp = await page.context().newCDPSession(page);
    const c = await centre(page, '#stage3d');
    await touch(cdp, [[c], [{ x: c.x + 40, y: c.y }], [{ x: c.x + 60, y: c.y - 60 }]]);
    await page.keyboard.press('b');
    await expect(page.locator('#classic-compass')).toBeVisible();
    await wobblyTap(page, cdp, '#classic-compass', 10);
    await expect.poll(() => view(page), 'the tap reset the view').toEqual({ yaw: 0, pitch: 75 });
    await wobblyTap(page, cdp, '#classic-compass', 0);
    await expect.poll(() => view(page), 'and a second tap keeps it there').toEqual({ yaw: 0, pitch: 75 });
    expect(errors).toEqual([]);
  });

  test('resets the classic view while it is still easing from a turn', async ({ page }) => {
    await page.addInitScript(pinClassic);
    const errors = await open(page, ROOM);
    const cdp = await page.context().newCDPSession(page);
    const left = page.locator('#classic-left');
    if (!(await left.isVisible())) await page.locator('#classic-cam .modern-viewbtn').tap();
    await left.tap();
    await wobblyTap(page, cdp, '#classic-compass', 10);
    await expect.poll(() => view(page), 'the tap mid-turn reset the view').toEqual({ yaw: 0, pitch: 75 });
    expect(errors).toEqual([]);
  });
});
