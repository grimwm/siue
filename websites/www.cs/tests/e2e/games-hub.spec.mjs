// The Games page, share links, and link previews.
import { test, expect } from '@playwright/test';

const GAMES = ['cylon', 'tankity', 'crete'];

test('the Games page builds a card per metadata.yaml, each with a share link', async ({ page }) => {
  await page.goto('./');
  await page.click('#cic-enter-btn');
  const cards = page.locator('#games-hub-list .games-hub-card');
  await expect(cards).toHaveCount(GAMES.length);
  expect(await cards.evaluateAll(els => els.map(e => e.dataset.game))).toEqual(GAMES);
  // Every card leads with its game's screenshot, loaded and 16:9.
  const shots = await page.locator('.games-hub-card-shot').evaluateAll(imgs => Promise.all(imgs.map(i => i.decode().then(() => [i.naturalWidth, i.naturalHeight]))));
  expect(shots).toEqual(GAMES.map(() => [800, 450]));
  const shares = await page.locator('.games-share-btn').evaluateAll(els => els.map(e => e.title));
  for (const id of GAMES) expect(shares.some(u => u.endsWith(`/play/${id}/`))).toBe(true);
  await page.screenshot({ path: 'test-results/games-hub.png', fullPage: true });
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
    const og = name => (html.match(new RegExp(`<meta property="og:${name}" content="([^"]*)"`)) || [])[1];
    expect(og('title')).toBeTruthy();
    expect(og('title')).not.toMatch(/William Grim/);
    expect(og('url')).toMatch(new RegExp(`/play/${id}/$`));
    const img = og('image');
    expect(img).toMatch(/og\.png$/);
    // The picture itself is served from this host.
    const local = new URL(img).pathname.replace(/^.*?\/games\//, 'games/');
    const res = await request.get(local);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/image\/png/);
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
    const f = document.getElementById('play-frame').getBoundingClientRect();
    const n = document.querySelector('.play-nav').getBoundingClientRect();
    return Math.abs(f.top - n.bottom) < 2 && Math.abs(f.bottom - innerHeight) < 2;
  });
  expect(fills).toBe(true);
  await page.waitForTimeout(500);
  await page.keyboard.press('c');
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
  await expect.poll(() => page.locator('#play-frame').evaluate(f => new URL(f.src).search)).toBe('?code=ZZ99');
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
  expect(g.x + g.width).toBeLessThanOrEqual(games.x);
  expect(Math.abs((g.y + g.height / 2) - (games.y + games.height / 2))).toBeLessThan(2);
  expect(Math.round(g.height)).toBe(Math.round(games.height));
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
  expect(g.x + g.width).toBeLessThanOrEqual(games.x);
});
