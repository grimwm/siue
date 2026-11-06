// A game embedded in another site's page goes quiet when the reader clicks out of it and comes back when they click
// in again (games/_kit/audio-focus.ts). Crete and Tankity are framed by a stand-in blog post on another origin, as
// the blog's click-to-play facade frames them; the CIC is the script embed on a long post, where leaving the game or
// hiding the tab stops its sound.
import { test, expect } from '@playwright/test';
import type { Frame, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// A routed page counts as public to Chrome, which then refuses the local site (Local Network Access); the real blog
// and site are both public. The project's own flags (muted, no autoplay) stay.
test.use({ launchOptions: { args: ['--mute-audio', '--autoplay-policy=user-gesture-required', '--disable-features=LocalNetworkAccessChecks,PrivateNetworkAccessRespectPreflightResults,BlockInsecurePrivateNetworkRequests'] } });

declare global {
  interface Window { __soundCtx?: AudioContext; __soundMedia: HTMLMediaElement[]; __soundResumes: number }
}

/* In every frame: keeps the game's audio context and every media element it plays. */
function audioProbe() {
  window.__soundMedia = [];
  window.__soundResumes = 0;
  const resume = AudioContext.prototype.resume;
  AudioContext.prototype.resume = function (this: AudioContext) { window.__soundResumes++; return resume.call(this); };
  const gain = AudioContext.prototype.createGain;
  AudioContext.prototype.createGain = function (this: AudioContext) { window.__soundCtx = this; return gain.apply(this); };
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
    if (!window.__soundMedia.includes(this)) window.__soundMedia.push(this);
    return play.call(this);
  };
}

/** The post's origin: the site's host swapped between localhost and 127.0.0.1, another origin on loopback. */
function blogOrigin(baseURL: string): string {
  const u = new URL(baseURL);
  u.hostname = u.hostname === 'localhost' ? '127.0.0.1' : 'localhost';
  return u.origin;
}

/** A long post with the game framed in its middle, as the blog's facade leaves it once pressed. */
async function serveFramePost(page: Page, baseURL: string, game: string): Promise<string> {
  const src = new URL(`games/${game}/`, baseURL).href;
  const p = '<p>The words around the game: a reader may scroll, select, and click here without playing.</p>';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>A post</title>
<style>body{margin:0;font:18px/1.6 Georgia,serif} main{max-width:1100px;margin:0 auto;padding:24px}
iframe.hs-game{display:block;width:960px;height:600px;border:0}</style></head>
<body><main><h1 id="post-title">A post with a game</h1>${p.repeat(3)}
<iframe class="hs-game" src="${src}" title="${game}" allow="fullscreen; autoplay; keyboard-lock; clipboard-write" allowfullscreen></iframe>
${p.repeat(40)}</main></body></html>`;
  const url = `${blogOrigin(baseURL)}/blog-example/${game}/`;
  await page.route(`${blogOrigin(baseURL)}/blog-example/**`, route => route.fulfill({ contentType: 'text/html', body: html }));
  return url;
}

/** The game's frame, once its document has loaded. */
async function gameFrame(page: Page, game: string): Promise<Frame> {
  await expect.poll(() => page.frames().some(f => f.url().includes(`/games/${game}/`))).toBe(true);
  const frame = page.frames().find(f => f.url().includes(`/games/${game}/`))!;
  await frame.waitForLoadState('load');
  return frame;
}

const resumes = (frame: Frame) => frame.evaluate(() => window.__soundResumes);
/** Two of the frame's animation frames: long enough for a press or a focus there to have been handled. */
const settled = (frame: Frame) => frame.evaluate(() => new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r()))));
const ctxState = (frame: Frame) => frame.evaluate(() => window.__soundCtx?.state ?? 'none');
const mediaPlaying = (frame: Frame) => frame.evaluate(() => window.__soundMedia.filter(e => !e.paused).length);

/** Clicks the post's own words, well below the frame: focus leaves the frame for the host page. */
async function clickPost(page: Page) {
  await page.locator('#post-title').click();
  await expect.poll(() => page.evaluate(() => document.hasFocus())).toBe(true);
}

test.beforeEach(async ({ context, baseURL }) => {
  test.skip(new URL(baseURL!).protocol !== 'http:', 'the stand-in post is served over http, next to a local site');
  await context.addInitScript(audioProbe);
  // Every Dictionary entry met: no first card stops Crete.
  await context.addInitScript(() => { try { localStorage.setItem('crete-met', '["*"]'); } catch { /* another origin's frame */ } });
});

test('Crete in a frame: clicking the post suspends its sound and pauses the theme; clicking back in brings both back', async ({ page, baseURL }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(await serveFramePost(page, baseURL!, 'crete'));
  const frame = await gameFrame(page, 'crete');
  await expect(frame.locator('#title-veil')).toBeVisible();
  // A gesture in the frame starts the theme.
  await frame.locator('#title-veil .kicker').click();
  await expect.poll(() => ctxState(frame), { timeout: 10_000 }).toBe('running');
  await expect.poll(() => mediaPlaying(frame), { timeout: 10_000, message: 'the theme plays' }).toBeGreaterThan(0);

  await clickPost(page);
  await expect.poll(() => ctxState(frame), { message: 'clicked out: the context is suspended' }).toBe('suspended');
  await expect.poll(() => mediaPlaying(frame), { message: 'and the theme is paused' }).toBe(0);
  const out = await resumes(frame);
  await page.mouse.wheel(0, 300); // the reader reads on
  await settled(frame);
  expect(await resumes(frame), 'nothing asks the context to resume while the reader reads').toBe(out);
  expect(await ctxState(frame)).toBe('suspended');

  await frame.locator('#title-veil .kicker').click();
  await expect.poll(() => ctxState(frame), { message: 'clicked back in: running again' }).toBe('running');
  await expect.poll(() => mediaPlaying(frame), { message: 'and the theme goes on' }).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('Tankity in a frame: clicking the post suspends its sound; clicking back in resumes it', async ({ page, baseURL }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  const config = page.waitForResponse(r => /\/games\/tankity\/game\.json/.test(r.url()));
  await page.goto(await serveFramePost(page, baseURL!, 'tankity'));
  const frame = await gameFrame(page, 'tankity');
  await config; // the game has its settings, so the gesture below starts its music
  // A click in the frame and a key: the gesture that starts the music.
  await page.locator('iframe.hs-game').click({ position: { x: 8, y: 8 } });
  await page.keyboard.press('Control');
  await expect.poll(() => ctxState(frame), { timeout: 10_000 }).toBe('running');

  await clickPost(page);
  await expect.poll(() => ctxState(frame), { message: 'clicked out: the context is suspended' }).toBe('suspended');
  const out = await resumes(frame);
  await page.keyboard.press('Control'); // a key on the host page reaches nothing in the frame
  await settled(frame);
  expect(await resumes(frame), 'a key on the post resumes nothing').toBe(out);
  expect(await ctxState(frame)).toBe('suspended');

  await page.locator('iframe.hs-game').click({ position: { x: 8, y: 8 } });
  await expect.poll(() => ctxState(frame), { message: 'clicked back in: running again' }).toBe('running');
  expect(errors).toEqual([]);
});

/** The stand-in WordPress post with the CIC's script embed, made long. */
async function serveScriptPost(page: Page, baseURL: string): Promise<string> {
  const p = '<p>The fleet came over the ridge at dawn. This paragraph is here to make the post long.</p>';
  const fixture = readFileSync(join(import.meta.dirname, 'fixtures', 'wp-post.html'), 'utf8');
  for (const mark of ['EMBED_SRC', '<p>Thanks for reading.']) expect(fixture, `wp-post.html holds ${mark}`).toContain(mark);
  const html = fixture
    .replace('EMBED_SRC', new URL('games/cylon/dist/embed.js', baseURL).href)
    .replace('<p>Thanks for reading.', `${p.repeat(200)}\n<p>Thanks for reading.`);
  const url = `${blogOrigin(baseURL)}/blog-example/2026/11/a-small-game/`;
  await page.route(`${blogOrigin(baseURL)}/blog-example/**`, route => route.fulfill({ contentType: 'text/html', body: html }));
  return url;
}

const setVisibility = (page: Page, state: 'hidden' | 'visible') => page.evaluate((s: string) => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => s });
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => s === 'hidden' });
  document.dispatchEvent(new Event('visibilitychange'));
}, state);

test('the CIC script embed: silent while the post is read, quiet in a hidden tab, and Leave ends its sound', async ({ page, baseURL }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(await serveScriptPost(page, baseURL!));
  await page.mouse.wheel(0, 1500);
  await expect.poll(() => page.evaluate(() => window.scrollY), { message: 'the reader scrolls the post' }).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__soundCtx?.state ?? 'none'), 'reading the post makes no sound').toBe('none');

  await page.locator('#cic-embed-launch').click();
  await expect(page.locator('body')).toHaveClass(/cylon-game-live/, { timeout: 15_000 });
  await expect.poll(() => page.evaluate(() => window.__soundCtx?.state ?? 'none'), { timeout: 15_000 }).toBe('running');

  await setVisibility(page, 'hidden');
  await expect.poll(() => page.evaluate(() => window.__soundCtx!.state), { message: 'a hidden tab is quiet' }).toBe('suspended');
  await setVisibility(page, 'visible');
  await expect.poll(() => page.evaluate(() => window.__soundCtx!.state), { message: 'shown again, it plays' }).toBe('running');

  // Leave gives the post back, and with it the silence.
  await page.locator('#cic-embed-leave').click();
  await expect(page.locator('#cic-embed #cic-embed-launch')).toBeVisible({ timeout: 10_000 });
  expect(await page.evaluate(() => window.__soundCtx?.state ?? 'none'), 'the post plays nothing after Leave').toBe('none');
  expect(errors).toEqual([]);
});
