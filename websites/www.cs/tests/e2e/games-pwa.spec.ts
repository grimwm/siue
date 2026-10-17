// Installable games: each game's web manifest and icons, and the offline
// service worker of the page games.
import { test, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

const GAMES = ['cylon', 'tankity', 'crete'];
const PAGE_GAMES = ['tankity', 'crete'];
const RENDERED: Record<string, string> = { tankity: '#stage', crete: '#stage' };
// The entry script each page loads: both games' bundles.
const ENTRY: Record<string, string> = { tankity: 'dist/main.js', crete: 'dist/main.js' };

async function manifestOf(request: APIRequestContext, baseURL: string | undefined, id: string) {
  // A page game links its manifest from its own page; Cylon, which runs in
  // the site page, from the site's play/cylon/ page.
  const page = new URL(PAGE_GAMES.includes(id) ? `games/${id}/` : `play/${id}/`, baseURL);
  const html = await (await request.get(page.href, { maxRedirects: 0 })).text();
  const href = (html.match(/<link rel="manifest" href="([^"]+)"/) || [])[1];
  return { html, url: href && new URL(href, page).href };
}

for (const id of GAMES) {
  test(`${id} links a valid manifest`, async ({ request, baseURL }) => {
    const { html, url: manifestUrl } = await manifestOf(request, baseURL, id);
    expect(manifestUrl, 'the page links a manifest').toBeTruthy();
    const url = manifestUrl!;
    expect(html).toMatch(/<meta name="theme-color" content="#[0-9a-f]{3,6}">/);
    expect(html).toMatch(/<link rel="apple-touch-icon" sizes="180x180" href="[^"]*icon-apple-180\.png"/);
    expect(html).toContain('<meta name="apple-mobile-web-app-capable" content="yes">');

    const res = await request.get(url);
    expect(res.status()).toBe(200);
    const m = await res.json();
    for (const key of ['name', 'short_name', 'start_url', 'scope', 'display', 'background_color', 'theme_color']) {
      expect(m[key], key).toBeTruthy();
    }
    expect(m.display).toBe('standalone');
    expect(m.display_override).toEqual(['fullscreen', 'standalone']);

    // start_url must lie within scope, on this origin.
    const start = new URL(m.start_url, url);
    const scope = new URL(m.scope, url);
    expect(start.origin).toBe(new URL(url).origin);
    expect((await request.get(start.href)).status(), 'the start URL answers').toBe(200);
    expect(start.pathname.startsWith(scope.pathname)).toBe(true);
    // A page game starts at its own folder; The CIC at the site page that hosts it.
    expect(start.pathname).toBe(scope.pathname);
    if (id === 'cylon') {
      expect(start.search).toBe('?game=cylon&app=1');
      expect(scope.pathname).toMatch(/\/index\.html$/);
    } else {
      expect(scope.pathname).toMatch(new RegExp(`/games/${id}/$`));
    }

    // Icons: any, maskable and monochrome, each a PNG of its stated size.
    expect(m.icons.map((i: { purpose: string; sizes: string }) => `${i.purpose} ${i.sizes}`)).toEqual(
      ['any 192x192', 'any 512x512', 'maskable 192x192', 'maskable 512x512', 'monochrome 512x512']);
    for (const icon of m.icons) {
      const r = await request.get(new URL(icon.src, url).href);
      expect(r.status(), icon.src).toBe(200);
      expect(r.headers()['content-type']).toMatch(/image\/png/);
      const body = await r.body();
      expect(body.readUInt32BE(16) + 'x' + body.readUInt32BE(20)).toBe(icon.sizes);
    }
    const apple = html.match(/<link rel="apple-touch-icon" sizes="180x180" href="([^"]+)"/)![1]!;
    const appleRes = await request.get(new URL(apple, new URL(PAGE_GAMES.includes(id) ? `games/${id}/` : `play/${id}/`, baseURL)).href);
    expect(appleRes.status()).toBe(200);
    const appleBody = await appleRes.body();
    expect(appleBody.readUInt32BE(16) + 'x' + appleBody.readUInt32BE(20)).toBe('180x180');
  });
}

test('the site manifest has a 192 icon', async ({ request }) => {
  const m = await (await request.get('site.webmanifest')).json();
  const icon = m.icons.find((i: { sizes: string }) => i.sizes === '192x192');
  expect(icon).toBeTruthy();
  expect((await request.get(icon.src)).status()).toBe(200);
});

test('launching The CIC links its own manifest', async ({ page }) => {
  await page.goto('./?game=cylon');
  await expect.poll(() => page.evaluate(() => document.querySelector('link[rel=manifest]')!.getAttribute('href')))
    .toBe('games/cylon/manifest.webmanifest');
});

for (const id of PAGE_GAMES) {
  test(`${id} registers a service worker and opens offline`, async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`games/${id}/`);

    // The worker installs, precaches and takes control of the open page.
    await expect.poll(() => page.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      return !!(reg && reg.active && navigator.serviceWorker.controller);
    }), { timeout: 20_000 }).toBe(true);
    const scope = await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())!.scope);
    expect(new URL(scope).pathname).toMatch(new RegExp(`/games/${id}/$`));
    const cached = await page.evaluate(async () => {
      const [name] = await caches.keys();
      const keys = await (await caches.open(name!)).keys();
      return { name, urls: keys.map(r => new URL(r.url).pathname.split('/').pop()!) };
    });
    expect(cached.name).toMatch(new RegExp(`^game-${id}-[0-9a-f]{12}$`));
    expect(cached.urls).toEqual(expect.arrayContaining([ENTRY[id]!.split('/').pop(), 'game.css', 'index.html', 'icon-512.png']));
    expect(cached.urls.some(u => u.endsWith('.php'))).toBe(false);
    if (id === 'tankity') {
      // The effects engine bundle, its sprite manifest and game.json are precached with the main bundle.
      expect(cached.urls).toEqual(expect.arrayContaining(['fx.js', 'main.js', 'sprites.json', 'game.json']));
    }

    // Offline: the page still loads and renders.
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator(RENDERED[id]!).first()).toBeVisible();
    await expect(page.locator(`script[src^="${ENTRY[id]}"]`)).toHaveCount(1);
    expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    expect(errors).toEqual([]);
    if (id === 'tankity') {
      // Offline, the precached main bundle (Preact and the overlays are inside it) draws the overlays.
      await expect(page.locator('#help-overlay ul.help li').first()).toBeAttached();
      await expect(page.locator('#help-overlay #help-close')).toBeAttached();
    }
    // Proof the browser is really offline for the worker too: a file it never
    // cached has no answer.
    expect(await page.evaluate(() => fetch('not-cached.txt').then(() => 'answered', () => 'failed'))).toBe('failed');

    // A server API is never answered from the cache.
    if (id === 'tankity') {
      const status = await page.evaluate(() => fetch('scores.php').then(r => r.status, () => 'network-error'));
      expect(status).toBe('network-error');
    }
    await context.close();
  });

  test(`${id} fetches fresh files while online (network first)`, async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(`games/${id}/`);
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller), { timeout: 20_000 }).toBe(true);

    // Plant a stale copy of the stylesheet in the game's cache, then reload
    // online: the page must be served from the network, which also replaces
    // the planted copy.
    const probe = await page.evaluate(async () => {
      const href = (document.querySelector('link[rel=stylesheet]') as HTMLLinkElement).href;
      const [name] = await caches.keys();
      await (await caches.open(name!)).put(href, new Response('/* stale */', { headers: { 'Content-Type': 'text/css' } }));
      return { name: name!, href };
    });
    await page.reload();
    await expect.poll(() => page.evaluate(async ({ name, href }) => {
      const hit = await (await caches.open(name)).match(href);
      return hit ? (await hit.text()).includes('/* stale */') : 'missing';
    }, probe)).toBe(false);
    await context.close();
  });
}
