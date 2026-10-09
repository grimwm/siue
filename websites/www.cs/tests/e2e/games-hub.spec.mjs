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
  for (const id of GAMES) expect(shares.some(u => u.endsWith(`/games/${id}/`))).toBe(true);
  await page.screenshot({ path: 'test-results/games-hub.png', fullPage: true });
});

test('a page game opens from its card', async ({ page }) => {
  await page.goto('./');
  await page.click('#cic-enter-btn');
  await page.click('li[data-game=tankity] a.games-enter-btn');
  await expect(page).toHaveURL(/games\/tankity\/$/);
  await expect(page.locator('#stage')).toBeVisible();
});

test('?game= deep links launch their game', async ({ page }) => {
  await page.goto('./?game=tankity');
  await expect(page).toHaveURL(/games\/tankity\/$/);
  await page.goto('./?game=cylon');
  await expect.poll(() => page.evaluate(() => document.body.classList.contains('cylon-game-live'))).toBe(true);
});

test('the CIC share page forwards to the game', async ({ page }) => {
  await page.goto('games/cylon/');
  await expect(page).toHaveURL(/\?game=cylon$/);
  await expect.poll(() => page.evaluate(() => document.body.classList.contains('cylon-game-live'))).toBe(true);
});

for (const id of GAMES) {
  test(`${id} has its own link preview`, async ({ request, baseURL }) => {
    const html = await (await request.get(`games/${id}/`, { maxRedirects: 0 })).text();
    const og = name => (html.match(new RegExp(`<meta property="og:${name}" content="([^"]*)"`)) || [])[1];
    expect(og('title')).toBeTruthy();
    expect(og('title')).not.toMatch(/William Grim/);
    expect(og('url')).toMatch(new RegExp(`/games/${id}/$`));
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
