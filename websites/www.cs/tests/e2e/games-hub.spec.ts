// The Games page, share links, and link previews.
import { test, expect } from '@playwright/test';

declare global {
  interface Window { __same: number }
}

const GAMES = ['cylon', 'tankity', 'crete'];

test('the Games page builds a card per metadata.yaml, each with a share link', async ({ page }) => {
  await page.goto('./');
  await page.click('#cic-enter-btn');
  const cards = page.locator('#games-hub-list .games-hub-card');
  await expect(cards).toHaveCount(GAMES.length);
  expect(await cards.evaluateAll(els => els.map(e => (e as HTMLElement).dataset.game))).toEqual(GAMES);
  // Every card leads with its game in motion: the looping preview, loaded and 16:9, named for the game.
  const shots = page.locator('.games-hub-card-shot');
  await shots.evaluateAll(imgs => imgs.forEach(i => { (i as HTMLImageElement).loading = 'eager'; }));
  const moving = await shots.evaluateAll(imgs => Promise.all(imgs.map(i => (i as HTMLImageElement).decode().then(() => {
    const img = i as HTMLImageElement;
    return [new URL(img.currentSrc).pathname.split('/').pop(), img.naturalWidth, img.naturalHeight, img.alt];
  }))));
  expect(moving).toEqual(GAMES.map(() => ['preview.webp', 640, 360, expect.stringMatching(/ in play$/)]));
  const markup = await page.locator('.games-hub-card picture').evaluateAll(pics => pics.map(p => {
    const src = p.querySelector('source')!;
    return [src.type, src.media, /\?v=[0-9a-f]{10}$/.test(src.srcset), p.querySelector('img')!.getAttribute('src')!.includes('screenshot.jpg')];
  }));
  expect(markup).toEqual(GAMES.map(() => ['image/webp', '(prefers-reduced-motion: no-preference)', true, true]));
  const shares = await page.locator('.games-share-btn').evaluateAll(els => els.map(e => (e as HTMLElement).title));
  for (const id of GAMES) expect(shares.some(u => u.endsWith(`/play/${id}/`))).toBe(true);
  await page.screenshot({ path: 'test-results/games-hub.png', fullPage: true });
});

test('with reduced motion the cards show the still screenshots, lazily', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ baseURL, reducedMotion: 'reduce', viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  await page.goto('./#games');
  await expect(page.locator('#games-hub-list .games-hub-card')).toHaveCount(GAMES.length);
  const shots = page.locator('.games-hub-card-shot');
  expect(await shots.evaluateAll(imgs => imgs.map(i => i.getAttribute('loading')))).toEqual(GAMES.map(() => 'lazy'));
  await shots.evaluateAll(imgs => imgs.forEach(i => { (i as HTMLImageElement).loading = 'eager'; }));
  const still = await shots.evaluateAll(imgs => Promise.all(imgs.map(i => (i as HTMLImageElement).decode().then(() => {
    const img = i as HTMLImageElement;
    return [new URL(img.currentSrc).pathname.split('/').pop(), img.naturalWidth, img.naturalHeight];
  }))));
  expect(still).toEqual(GAMES.map(() => ['screenshot.jpg', 800, 450]));
  await ctx.close();
});

// Pages revalidate on every visit, so a browser never keeps a page that names
// files a deploy removed (nginx here, .htaccess on the host).
test('pages answer with Cache-Control: no-cache', async ({ request }) => {
  for (const path of ['./', 'play/tankity/', 'games/crete/']) {
    const res = await request.get(path);
    expect(res.ok(), path).toBe(true);
    expect(res.headers()['cache-control'] ?? '', path).toContain('no-cache');
  }
});

test('a page game opens from its card, framed under the site navbar', async ({ page }) => {
  await page.goto('./');
  await page.click('#cic-enter-btn');
  await page.click('li[data-game=tankity] a.games-enter-btn');
  await expect(page).toHaveURL(/play\/tankity\/$/);
  await expect(page.locator('.play-nav')).toBeVisible();
  await expect(page.frameLocator('#play-frame').locator('#stage')).toBeVisible();
});

test('?game= deep links launch their game', async ({ page }) => {
  await page.goto('./?game=tankity');
  await expect(page).toHaveURL(/play\/tankity\/$/);
  await page.goto('./?game=cylon');
  await expect.poll(() => page.evaluate(() => document.body.classList.contains('cylon-game-live'))).toBe(true);
});

test('the CIC share page forwards to the game', async ({ page }) => {
  await page.goto('play/cylon/');
  await expect(page).toHaveURL(/\?game=cylon$/);
  await expect.poll(() => page.evaluate(() => document.body.classList.contains('cylon-game-live'))).toBe(true);
});

for (const id of GAMES) {
  test(`${id} has its own link preview`, async ({ request, baseURL }) => {
    const html = await (await request.get(`play/${id}/`, { maxRedirects: 0 })).text();
    const og = (name: string) => (html.match(new RegExp(`<meta property="og:${name}" content="([^"]*)"`)) || [])[1];
    expect(og('title')).toBeTruthy();
    expect(og('title')).not.toMatch(/William Grim/);
    // og:url carries the game's version, so each release is a fresh Facebook preview; canonical stays bare.
    expect(og('url')).toMatch(new RegExp(`/play/${id}/\\?v=[0-9a-f]{10}$`));
    expect(html).toMatch(new RegExp(`<link rel="canonical" href="[^"]*/play/${id}/">`));
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image">');
    expect(html).toMatch(/<meta name="description" content="[^"]{20,160}">/);
    const img = og('image');
    expect(img).toMatch(/^https:\/\/.*\/games\/[a-z]+\/og\.png\?v=[0-9a-f]{10}$/);
    expect(html).toContain(`<meta name="twitter:image" content="${img}">`);
    expect(og('image:width')).toBe('1200');
    expect(og('image:height')).toBe('630');
    expect(og('image:alt')).toMatch(/ in play/);
    const video = og('video');
    expect(video).toMatch(/^https:\/\/.*\/games\/[a-z]+\/preview\.mp4\?v=[0-9a-f]{10}$/);
    expect(og('video:secure_url')).toBe(video);
    expect(og('video:type')).toBe('video/mp4');
    expect([og('video:width'), og('video:height')]).toEqual(['1280', '720']);
    const ld = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1]!);
    expect(ld).toMatchObject({ '@type': ['VideoGame', 'WebApplication'], image: img, isAccessibleForFree: true, offers: { price: '0' } });
    // The picture and clip themselves are served from this host, with their types.
    for (const [url, type] of [[img!, /image\/png/], [video!, /video\/mp4/]] as const) {
      const local = new URL(url).pathname.replace(/^.*?\/games\//, 'games/');
      const res = await request.get(local);
      expect(res.status(), local).toBe(200);
      expect(res.headers()['content-type']).toMatch(type);
    }
    expect(baseURL).toBeTruthy();
  });
}

for (const id of ['tankity', 'crete']) {
  test(`${id}'s own page knows nothing about the site`, async ({ request }) => {
    const html = await (await request.get(`games/${id}/`)).text();
    expect(html).not.toMatch(/og:|twitter:|wgrim|play-nav|\.\.\//);
  });
}

test('the wrapper navbar takes the game colours and leads back to the site', async ({ page }) => {
  await page.goto('play/tankity/');
  const nav = page.locator('.play-nav');
  await expect(nav).toBeVisible();
  // Painted from games/tankity/metadata.yaml: its accent edges the bar.
  expect(await nav.evaluate(el => getComputedStyle(el).borderBottomColor)).toBe('rgb(255, 201, 60)');
  await expect(page.locator('.play-now')).toContainText('Operation Tankity');
  // The game fills the rest of the window and has the keyboard.
  const frame = page.frameLocator('#play-frame');
  await expect(frame.locator('#stage')).toBeVisible();
  const fills = await page.evaluate(() => {
    const f = document.getElementById('play-frame')!.getBoundingClientRect();
    const n = document.querySelector('.play-nav')!.getBoundingClientRect();
    return Math.abs(f.top - n.bottom) < 2 && Math.abs(f.bottom - innerHeight) < 2;
  });
  expect(fills).toBe(true);
  await page.waitForTimeout(500);
  await page.keyboard.press('q');
  await expect(frame.locator('#menu-overlay')).toBeVisible();
  await page.screenshot({ path: 'test-results/play-tankity.png' });
  // Contact and Games open those panels on the home page.
  await page.click('.play-nav >> text=Contact');
  await expect(page).toHaveURL(/#contact$/);
  await expect(page.locator('#nav-contact')).toHaveClass(/is-active/);
  await page.goto('play/crete/');
  await page.click('.play-nav >> text=Games');
  await expect(page.locator('#nav-games')).toHaveClass(/is-active/);
  await expect(page.locator('#games-hub-list .games-hub-card')).toHaveCount(3);
});

test('a room invite on the wrapper reaches the game', async ({ page }) => {
  await page.goto('play/tankity/?code=ZZ99');
  await expect.poll(() => page.locator('#play-frame').evaluate(f => new URL((f as HTMLIFrameElement).src).search)).toBe('?code=ZZ99');
});

test('navbar panels keep the page but put themselves in the address', async ({ page, context }) => {
  await page.goto('./');
  const active = () => page.evaluate(() => document.querySelector('[id^="nav-"].is-active')?.id);
  await page.click('#cic-enter-btn');
  await expect(page).toHaveURL(/#games$/);
  expect(await active()).toBe('nav-games');
  await page.click('.site-link >> text=Contact');
  await expect(page).toHaveURL(/#contact$/);
  expect(await active()).toBe('nav-contact');
  // Back and Forward step between panels without reloading.
  const marker = await page.evaluate(() => (window.__same = Math.random()));
  await page.goBack();
  await expect.poll(active).toBe('nav-games');
  await page.goForward();
  await expect.poll(active).toBe('nav-contact');
  expect(await page.evaluate(() => window.__same)).toBe(marker);
  // Home is the bare address.
  await page.click('.site-link >> text=Home');
  await expect.poll(() => page.url()).toMatch(/\/$/);
  expect(await active()).toBe('nav-main');
  // A pasted address opens its panel.
  const fresh = await context.newPage();
  await fresh.goto('./#games');
  await expect.poll(() => fresh.evaluate(() => document.querySelector('[id^="nav-"].is-active')?.id)).toBe('nav-games');
  await fresh.goto('./#contact');
  await expect.poll(() => fresh.evaluate(() => document.querySelector('[id^="nav-"].is-active')?.id)).toBe('nav-contact');
});

// The GitHub mark links the repository, left of Games, on the home navbar and
// on each game's wrapper navbar.
test('the home navbar links the repository just left of Games', async ({ page }) => {
  await page.goto('./');
  const gh = page.locator('.site-nav a.site-github');
  await expect(gh).toBeVisible();
  await expect(gh).toHaveAttribute('href', 'https://github.com/grimwm/siue');
  await expect(gh).toHaveAttribute('target', '_blank');
  await expect(gh).toHaveAttribute('rel', /noopener/);
  await expect(gh).toHaveAttribute('aria-label', 'Source on GitHub');
  await expect(gh).toHaveAttribute('title', 'Source on GitHub');
  await expect(gh.locator('svg')).toBeVisible();
  const [g, games] = await Promise.all([gh.boundingBox(), page.locator('#cic-enter-btn').boundingBox()]);
  expect(g!.x + g!.width).toBeLessThanOrEqual(games!.x);
  expect(Math.abs((g!.y + g!.height / 2) - (games!.y + games!.height / 2))).toBeLessThan(2);
  expect(Math.round(g!.height)).toBe(Math.round(games!.height));
  // Coloured like the nav buttons in both themes.
  for (const theme of ['dark', 'light']) {
    await page.evaluate(t => document.documentElement.setAttribute('data-bs-theme', t), theme);
    const [ghColor, btnColor] = await Promise.all([
      gh.evaluate(el => getComputedStyle(el).color),
      page.locator('#cic-enter-btn').evaluate(el => getComputedStyle(el).color),
    ]);
    expect(ghColor).toBe(btnColor);
  }
});

test('the wrapper navbar links the repository just left of Games', async ({ page }) => {
  await page.goto('play/crete/');
  const gh = page.locator('.play-nav a.play-github');
  await expect(gh).toBeVisible();
  await expect(gh).toHaveAttribute('href', 'https://github.com/grimwm/siue');
  await expect(gh).toHaveAttribute('rel', /noopener/);
  await expect(gh).toHaveAttribute('aria-label', 'Source on GitHub');
  const [g, games] = await Promise.all([gh.boundingBox(), page.locator('.play-nav .play-games').boundingBox()]);
  expect(g!.x + g!.width).toBeLessThanOrEqual(games!.x);
});
