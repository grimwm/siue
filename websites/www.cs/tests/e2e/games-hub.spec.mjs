// The Games page, share links, and link previews.
import { test, expect } from '@playwright/test';

const GAMES = ['cylon', 'tankity', 'crete'];

test('the Games page builds a card per metadata.yaml, each with a share link', async ({ page }) => {
  await page.goto('./');
  await page.click('#cic-enter-btn');
  const cards = page.locator('#games-hub-list .games-hub-card');
  await expect(cards).toHaveCount(GAMES.length);
  expect(await cards.evaluateAll(els => els.map(e => e.dataset.game))).toEqual(GAMES);
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
