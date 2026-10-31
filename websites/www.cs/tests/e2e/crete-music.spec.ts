// The Island of Crete's music in a real browser: the title theme streams under the title card and goes on, without a
// restart or a second track, over Chapter 1's card and into a level, and the Music switch is remembered.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/** Every Dictionary entry met before the page loads, so no first card (src/ui/meet.tsx) stops these specs' levels. */
const allMet = (): void => localStorage.setItem('crete-met', '["*"]');

test.beforeEach(async ({ context }) => { await context.addInitScript(allMet); });

const PAGE = 'games/crete/';

declare global {
  interface Window { __media: HTMLMediaElement[] }
}

/* Keeps every media element the page plays, so the spec can read what is sounding. */
function mediaProbe() {
  window.__media = [];
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
    if (!window.__media.includes(this)) window.__media.push(this);
    return play.call(this);
  };
}

/** The tracks playing now (their file names), each once, and the furthest any of them has got, in seconds. */
const sounding = (page: Page) => page.evaluate(() => {
  const on = window.__media.filter(e => !e.paused);
  const names = [...new Set(on.map(e => (/\/(title)\.(webm|m4a)/.exec(e.src) ?? [])[1] ?? e.src))].sort();
  return { names, t: Math.max(0, ...on.map(e => e.currentTime)) };
});

test('the title theme plays on the title card and goes on over the chapter card and into a level', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(mediaProbe);
  await page.goto(PAGE);
  await expect(page.locator('#title-veil')).toBeVisible();
  // A gesture: a browser that blocks autoplay starts the music on it.
  await page.locator('#title-veil .kicker').click();
  await expect.poll(async () => (await sounding(page)).names, { timeout: 10_000 }).toEqual(['title']);
  await expect.poll(async () => (await sounding(page)).t, { message: 'the theme streams' }).toBeGreaterThan(1);
  const onTitle = (await sounding(page)).t;
  expect(await page.evaluate(() => window.__media.filter(e => /\/title\./.test(e.src)).length),
    'the loop point\'s second element is readied in the gesture, long before the seam').toBe(2);

  await page.locator('#title-play').click();

  await page.locator('#pick-enter').click();
  await expect(page.locator('#chapter-veil')).toBeVisible();
  const onCard = await sounding(page);
  expect(onCard.names, 'the same theme goes on under the chapter card').toEqual(['title']);
  expect(onCard.t, 'and was not restarted by the card').toBeGreaterThanOrEqual(onTitle);

  await page.locator('#chapter-enter').click();
  await expect(page.locator('#start-veil')).toBeVisible();
  await page.locator('#start-begin').click();
  const inLevel = await sounding(page);
  expect(inLevel.names, 'the theme goes on in a level').toEqual(['title']);
  expect(inLevel.t, 'without stopping or starting again').toBeGreaterThanOrEqual(onCard.t);
  expect(await page.evaluate(() => window.__media.length), 'no other track was ever played').toBe(2);
  expect(errors).toEqual([]);
});

test('Music off is remembered and plays nothing on the title card; Sound stays on', async ({ page }) => {
  await page.addInitScript(mediaProbe);
  await page.goto(PAGE);
  await expect(page.locator('#title-veil')).toBeVisible();
  // Q is a gesture too: the theme starts, so turning Music off has something to stop.
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
  await expect(page.locator('#music')).toHaveAttribute('aria-checked', 'true');
  await expect.poll(async () => (await sounding(page)).names, { timeout: 10_000, message: 'the theme plays over the menu' }).toEqual(['title']);
  await page.locator('#music').click();
  await expect(page.locator('#music')).toHaveAttribute('aria-checked', 'false');
  await expect(page.locator('#mute')).toHaveAttribute('aria-checked', 'true');
  expect(await page.evaluate(() => localStorage.getItem('crete-music'))).toBe('off');
  expect((await sounding(page)).names, 'Music off stops it at once').toEqual([]);

  await page.reload();
  await expect(page.locator('#title-veil')).toBeVisible();
  await page.locator('#title-veil .kicker').click();
  // Two frames after the gesture its handlers have all run: with Music off no element was ever played.
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  expect(await page.evaluate(() => window.__media.length), 'no music element plays while Music is off').toBe(0);
  await page.keyboard.press('q');
  await expect(page.locator('#music')).toHaveAttribute('aria-checked', 'false');
});
