// The CIC embedded in another site's page (games/cylon/README.md, "Embedding on
// another site"): a WordPress-like post on its own origin includes
// games/cylon/dist/embed.js. Until Play is pressed the post keeps its own look;
// pressed, the game takes the post over and destroys it; Leave gives it back.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// A routed page counts as public to Chrome, which then refuses the local site's
// script (Local Network Access); the real blog and site are both public. The
// project's own flags (muted, no autoplay) stay.
test.use({ launchOptions: { args: ['--mute-audio', '--autoplay-policy=user-gesture-required', '--disable-features=LocalNetworkAccessChecks,PrivateNetworkAccessRespectPreflightResults,BlockInsecurePrivateNetworkRequests'] } });

/**
 * The post's address: the site's own host swapped between localhost and
 * 127.0.0.1, which makes it another origin that Chrome still lets load from a
 * loopback address (a public origin may not). The route answers it; nothing
 * on the site serves it.
 */
function blogUrl(baseURL: string): string {
  const u = new URL(baseURL);
  u.hostname = u.hostname === 'localhost' ? '127.0.0.1' : 'localhost';
  u.pathname = '/blog-example/2026/11/a-small-game/';
  return u.href;
}

/** A post's worth of paragraphs, `n` times over: a long read. */
function longText(n: number): string {
  const p = '<p>The fleet came over the ridge at dawn, and every word on this page became something to hide behind, '
    + 'something to knock over, something to throw. This paragraph is here to make the post long.</p>';
  return Array.from({ length: n }, (_, i) => p.replace('<p>', `<p data-n="${i}">`)).join('\n');
}

async function serveBlog(page: Page, baseURL: string, opts: { slot: boolean; paragraphs?: number }): Promise<string> {
  let html = readFileSync(join(import.meta.dirname, 'fixtures', 'wp-post.html'), 'utf8')
    .replace('EMBED_SRC', new URL('games/cylon/dist/embed.js', baseURL).href);
  if (!opts.slot) html = html.replace('<div id="cic-embed"></div>', '');
  if (opts.paragraphs) html = html.replace('<p>Thanks for reading.', `${longText(opts.paragraphs)}\n<p>Thanks for reading.`);
  const blog = blogUrl(baseURL);
  await page.route(`${new URL(blog).origin}/blog-example/**`, (route) => route.fulfill({ contentType: 'text/html', body: html }));
  return blog;
}

test('the embed takes over a post on another origin and Leave puts it back', async ({ page, baseURL }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const scoreCalls: string[] = [];
  page.on('request', (r) => { if (r.url().includes('scores.php')) scoreCalls.push(r.url()); });
  test.skip(new URL(baseURL!).protocol !== 'http:', 'the stand-in post is served over http, next to a local site');
  await page.goto(await serveBlog(page, baseURL!, { slot: true }));

  // Before Play: one button in the post's slot, and nothing of the game's styles the post.
  const launch = page.locator('#cic-embed #cic-embed-launch');
  await expect(launch).toHaveText('Play The CIC');
  const titleColor = () => page.locator('.entry-title').evaluate((el) => getComputedStyle(el).color);
  const before = await titleColor();
  expect(await page.evaluate(() => document.styleSheets.length)).toBe(1);
  expect(await page.evaluate(() => document.body.className)).toBe('post-template-default single single-post');

  await launch.click();
  const body = page.locator('body');
  await expect(body).toHaveClass(/cylon-game-live/, { timeout: 15_000 });
  await expect(page.locator('#cic-embed-bar')).toBeVisible();
  await expect(page.locator('#cylon-game-toggle')).toHaveText(/Game On/);
  // The intro nuke lands and the post's own words become debris.
  await expect(body).toHaveClass(/cylon-world-ended/, { timeout: 30_000 });
  await expect(body).toHaveClass(/cylon-glyphs-blown/, { timeout: 10_000 });
  // The letters are drawn on one canvas over the post's own (now unpainted) text, not one element each.
  await expect(page.locator('canvas.cylon-glyph-layer')).toHaveCount(1);
  await expect(page.locator('.cylon-scatter-char')).toHaveCount(0);
  expect(await page.locator('.cylon-glyph-src').count()).toBeGreaterThan(5);
  await expect(page.locator('#page.page-panel.cylon-scatter-panel')).toHaveCount(1);
  await expect(page.locator('.wp-block-image.cylon-scatter-block')).toHaveCount(1);
  // The drones fly over the post, the admin bar and the sticky header included.
  const score = async () => Number((await page.locator('#cylon-score-value').textContent()) || '0');
  await expect(page.locator('.cylon-bot.is-marching').first()).toBeVisible({ timeout: 20_000 });
  await expect.poll(async () => {
    await page.locator('.cylon-bot.is-marching:not([data-ko="1"])').first()
      .dispatchEvent('pointerdown', { pointerType: 'mouse', button: 0, isPrimary: true }, { timeout: 1_000 })
      .catch(() => {});
    return score();
  }, { timeout: 20_000 }).toBeGreaterThan(0);
  const z = await page.evaluate(() => ({
    bar: Number(getComputedStyle(document.getElementById('cic-embed-bar')!).zIndex),
    adminBar: Number(getComputedStyle(document.getElementById('wpadminbar')!).zIndex),
    field: Number(getComputedStyle(document.getElementById('cylon-battlefield')!).zIndex),
  }));
  expect(z.adminBar).toBeLessThan(z.field);
  expect(z.field).toBeLessThan(z.bar);

  // Leave reloads the post: no game, no debris, the post's own look.
  await page.locator('#cic-embed-leave').click();
  await expect(page.locator('#cic-embed #cic-embed-launch')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('#cic-embed-bar')).toHaveCount(0);
  await expect(page.locator('.cylon-glyph-src, .cylon-glyph-layer')).toHaveCount(0);
  expect(await page.evaluate(() => document.body.className)).toBe('post-template-default single single-post');
  expect(await titleColor()).toBe(before);
  expect(scoreCalls).toEqual([]);
  expect(errors).toEqual([]);
});

test('a long post stays within a node budget while it is torn apart', async ({ page, baseURL }) => {
  test.setTimeout(90_000);
  test.skip(new URL(baseURL!).protocol !== 'http:', 'the stand-in post is served over http, next to a local site');
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  // 600 paragraphs: about 120,000 letters, which one element per letter would turn into as many nodes.
  await page.goto(await serveBlog(page, baseURL!, { slot: true, paragraphs: 600 }));
  const elements = () => page.evaluate(() => document.getElementsByTagName('*').length);
  const before = await elements();
  await page.locator('#cic-embed-launch').click();
  const body = page.locator('body');
  await expect(body).toHaveClass(/cylon-glyphs-blown/, { timeout: 40_000 });
  // Shots and blasts kick the drawn letters; none of it may throw.
  for (let i = 0; i < 6; i++) await page.mouse.click(300 + i * 90, 420 + (i % 2) * 120);
  await page.waitForTimeout(600);
  const added = (await elements()) - before;
  // The game's own markup is a few hundred elements; the post's text adds one wrapper per text node near the screen.
  expect(added).toBeLessThan(1000);
  await expect(page.locator('.cylon-scatter-char')).toHaveCount(0);
  await expect(page.locator('canvas.cylon-glyph-layer')).toHaveCount(1);
  // Only text in or near the viewport became letters; the rest of the post is untouched.
  const wrapped = await page.locator('.entry-content p[data-n] .cylon-glyph-src').count();
  expect(wrapped).toBeGreaterThan(0);
  expect(wrapped).toBeLessThan(200);
  expect(errors).toEqual([]);
});

test('without a slot the launcher waits in a corner', async ({ page, baseURL }) => {
  test.skip(new URL(baseURL!).protocol !== 'http:', 'the stand-in post is served over http, next to a local site');
  await page.goto(await serveBlog(page, baseURL!, { slot: false }));
  const launch = page.locator('body > #cic-embed-launch');
  await expect(launch).toBeVisible();
  expect(await launch.evaluate((el) => getComputedStyle(el).position)).toBe('fixed');
});
