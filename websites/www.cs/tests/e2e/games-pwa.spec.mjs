// Installable games: each game's web manifest and icons, and the offline
// service worker of the page games.
import { test, expect } from '@playwright/test';

const GAMES = ['cylon', 'tankity', 'crete'];
const PAGE_GAMES = ['tankity', 'crete'];
const RENDERED = { tankity: '#stage', crete: 'h1' };

async function manifestOf(request, baseURL, id) {
  // A page game links its manifest from its own page; Cylon, which runs in
  // the site page, from the site's play/cylon/ page.
  const page = new URL(PAGE_GAMES.includes(id) ? `games/${id}/` : `play/${id}/`, baseURL);
  const html = await (await request.get(page.href, { maxRedirects: 0 })).text();
  const href = (html.match(/<link rel="manifest" href="([^"]+)"/) || [])[1];
  return { html, url: href && new URL(href, page).href };
}

for (const id of GAMES) {
  test(`${id} links a valid manifest`, async ({ request, baseURL }) => {
    const { html, url } = await manifestOf(request, baseURL, id);
    expect(url, 'the page links a manifest').toBeTruthy();
    expect(html).toMatch(/<meta name="theme-color" content="#[0-9a-f]{3,6}">/);
    expect(html).toMatch(/<link rel="apple-touch-icon" [^>]*href="[^"]*icon-192\.png"/);
    expect(html).toContain('<meta name="apple-mobile-web-app-capable" content="yes">');

    const res = await request.get(url);
    expect(res.status()).toBe(200);
    const m = await res.json();
    for (const key of ['name', 'short_name', 'start_url', 'scope', 'display', 'background_color', 'theme_color']) {
      expect(m[key], key).toBeTruthy();
    }
    expect(m.display).toBe('standalone');

    // start_url must lie within scope, on this origin.
    const start = new URL(m.start_url, url);
    const scope = new URL(m.scope, url);
    expect(start.origin).toBe(new URL(url).origin);
    expect(start.pathname.startsWith(scope.pathname)).toBe(true);
    // A page game starts at its own folder; The CIC at the site page that hosts it.
    expect(start.pathname).toBe(scope.pathname);
    if (id === 'cylon') expect(start.search).toBe('?game=cylon');
    else expect(scope.pathname).toMatch(new RegExp(`/games/${id}/$`));

    // Icons: 192 and 512 exist and are PNGs of the stated size.
    const sizes = m.icons.map(i => i.sizes);
    expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']));
    for (const icon of m.icons) {
      const r = await request.get(new URL(icon.src, url).href);
      expect(r.status(), icon.src).toBe(200);
      expect(r.headers()['content-type']).toMatch(/image\/png/);
      const body = await r.body();
      expect(body.readUInt32BE(16) + 'x' + body.readUInt32BE(20)).toBe(icon.sizes);
    }
  });
}

test('the site manifest has a 192 icon', async ({ request }) => {
  const m = await (await request.get('site.webmanifest')).json();
  const icon = m.icons.find(i => i.sizes === '192x192');
  expect(icon).toBeTruthy();
  expect((await request.get(icon.src)).status()).toBe(200);
});

test('launching The CIC links its own manifest', async ({ page }) => {
  await page.goto('./?game=cylon');
  await expect.poll(() => page.evaluate(() => document.querySelector('link[rel=manifest]').getAttribute('href')))
    .toBe('games/cylon/manifest.webmanifest');
});

for (const id of PAGE_GAMES) {
  test(`${id} registers a service worker and opens offline`, async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`games/${id}/`);

    // The worker installs, precaches and takes control of the open page.
    await expect.poll(() => page.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      return !!(reg && reg.active && navigator.serviceWorker.controller);
    }), { timeout: 20_000 }).toBe(true);
    const scope = await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).scope);
    expect(new URL(scope).pathname).toMatch(new RegExp(`/games/${id}/$`));
    const cached = await page.evaluate(async () => {
      const [name] = await caches.keys();
      const keys = await (await caches.open(name)).keys();
      return { name, urls: keys.map(r => new URL(r.url).pathname.split('/').pop()) };
    });
    expect(cached.name).toMatch(new RegExp(`^game-${id}-[0-9a-f]{12}$`));
    expect(cached.urls).toEqual(expect.arrayContaining(['game.js', 'game.css', 'index.html', 'icon-512.png']));
    expect(cached.urls.some(u => u.endsWith('.php'))).toBe(false);
    if (id === 'tankity') {
      // The vendored Preact and the overlay modules that import it are precached too.
      expect(cached.urls).toEqual(expect.arrayContaining(['preact.module.js', 'hooks.module.js', 'jsx-runtime.module.js', 'chrome.js', 'help.js', 'shop.js']));
    }

    // Offline: the page still loads and renders.
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator(RENDERED[id]).first()).toBeVisible();
    await expect(page.locator('script[src^="game.js"]')).toHaveCount(1);
    expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    expect(errors).toEqual([]);
    if (id === 'tankity') {
      // Offline, the import map and the vendored Preact answer from the cache and draw the overlays.
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
      const href = document.querySelector('link[rel=stylesheet]').href;
      const [name] = await caches.keys();
      await (await caches.open(name)).put(href, new Response('/* stale */', { headers: { 'Content-Type': 'text/css' } }));
      return { name, href };
    });
    await page.reload();
    await expect.poll(() => page.evaluate(async ({ name, href }) => {
      const hit = await (await caches.open(name)).match(href);
      return hit ? (await hit.text()).includes('/* stale */') : 'missing';
    }, probe)).toBe(false);
    await context.close();
  });
}
