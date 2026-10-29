// The Island of Crete's music in a real browser: the title theme streams under the title card, the story cut takes
// over on Chapter 1's card, a level fades it out, and the Music switch is remembered.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

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

/** The tracks playing now ('title' or 'story'), each once, and the furthest any of them has got, in seconds. */
const sounding = (page: Page) => page.evaluate(() => {
  const on = window.__media.filter(e => !e.paused);
  const names = [...new Set(on.map(e => (/\/(title|story)\.(webm|m4a)/.exec(e.src) ?? [])[1] ?? e.src))].sort();
  return { names, t: Math.max(0, ...on.map(e => e.currentTime)) };
});

test('the title theme plays on the title card, the story cut on the chapter card, and a level fades it out', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(mediaProbe);
  await page.goto(PAGE);
  await expect(page.locator('#title-veil')).toBeVisible();
  // A gesture: a browser that blocks autoplay starts the music on it.
  await page.locator('#title-veil .kicker').click();
  await expect.poll(async () => (await sounding(page)).names, { timeout: 10_000 }).toEqual(['title']);
  await expect.poll(async () => (await sounding(page)).t, { message: 'the theme streams' }).toBeGreaterThan(0.5);
  expect(await page.evaluate(() => window.__media.filter(e => /\/title\./.test(e.src)).length),
    'the loop point\'s second element is readied in the gesture, long before the seam').toBe(2);

  await page.locator('#title-play').click();
  await expect(page.locator('#chapter-veil')).toBeVisible();
  await expect.poll(async () => (await sounding(page)).names, { timeout: 10_000, message: 'the cut takes over and the theme stops' })
    .toEqual(['story']);
  const story = await page.evaluate(() => window.__media.find(e => /story\./.test(e.src))?.currentTime ?? 0);
  expect(story, 'the cut starts where the theme was, not at its beginning').toBeGreaterThan(1);

  await page.locator('#chapter-enter').click();
  await expect(page.locator('#start-veil')).toBeVisible();
  await expect.poll(async () => (await sounding(page)).names, { timeout: 10_000, message: 'a level fades the music out' }).toEqual([]);
  expect(errors).toEqual([]);
});

test('Music off is remembered and plays nothing on the title card; Sound stays on', async ({ page }) => {
  await page.addInitScript(mediaProbe);
  await page.goto(PAGE);
  await expect(page.locator('#title-veil')).toBeVisible();
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
  await expect(page.locator('#music')).toHaveText('🎶 Music');
  await page.locator('#music').click();
  await expect(page.locator('#music')).toHaveText('🎶 Music off');
  await expect(page.locator('#mute')).toContainText('Sound');
  expect(await page.evaluate(() => localStorage.getItem('crete-music'))).toBe('off');
  await expect.poll(async () => (await sounding(page)).names, { timeout: 5_000 }).toEqual([]);

  await page.reload();
  await expect(page.locator('#title-veil')).toBeVisible();
  await page.locator('#title-veil .kicker').click();
  await page.waitForTimeout(1500);
  expect((await sounding(page)).names).toEqual([]);
  await page.keyboard.press('q');
  await expect(page.locator('#music')).toHaveText('🎶 Music off');
});
