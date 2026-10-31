// The visitor statistics end to end (make stats-e2e): a visit to a game records a page view that the signed-in
// dashboard then shows; Do Not Track and Global Privacy Control send nothing; and without signing in the
// numbers are out of reach: the dashboard redirects, the endpoint only takes writes and answers 204, and the
// library and the database are never served.
import { test, expect, type Browser, type BrowserContext } from '@playwright/test';
import { signInAt } from './music-mail.ts';

// Playwright's Chrome says it is automated (navigator.webdriver, "HeadlessChrome"), which the beacon and the
// endpoint rightly ignore; these visits pose as a person's browser.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

async function visitor(browser: Browser, privacy: string = ''): Promise<BrowserContext> {
  const context = await browser.newContext({ userAgent: UA });
  await context.addInitScript(`Object.defineProperty(navigator, 'webdriver', { get: () => false });${privacy}`);
  return context;
}

test('a visit to a game is counted and the signed-in dashboard shows it', async ({ browser, baseURL }) => {
  const context = await visitor(browser);
  const page = await context.newPage();
  // Playwright does not show a beacon's body; the dashboard below shows what arrived.
  const posts: string[] = [];
  page.on('request', r => { if (r.url().includes('/stats/')) posts.push(`${r.method()} ${new URL(r.url()).pathname}`); });
  const answered = page.waitForResponse(r => r.url().endsWith('/stats/collect.php'));
  await page.goto(`${baseURL}play/crete/`);
  expect((await answered).status()).toBe(204);
  // The framed game hands its events to the play page: no second view from the frame.
  await page.waitForTimeout(2000);
  expect(posts).toEqual([`POST ${new URL(baseURL!).pathname}stats/collect.php`]);
  await context.close();

  const admin = await browser.newContext();
  const dash = await admin.newPage();
  const errors: string[] = [];
  dash.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await signInAt(dash, baseURL!, 'admin', 'wgrim@siue.edu');
  await dash.goto(`${baseURL}admin/stats.php?page=crete&range=7d`);
  const tile = dash.locator('.kpi').filter({ hasText: 'Unique visitors' });
  await expect(tile.locator('.kpi-value')).toHaveText('1');
  await expect(dash.locator('.kpi').filter({ hasText: 'Visits' }).locator('.kpi-value')).toHaveText('1');
  await expect(dash.locator('[data-chart="daily"] svg')).toBeVisible();
  await expect(dash.locator('[data-chart="devices"] svg')).toBeVisible();
  // A tooltip on hover, with the day's visitors.
  const plot = dash.locator('[data-chart="daily"] svg .hit');
  const box = (await plot.boundingBox())!;
  await dash.mouse.move(box.x + box.width - 2, box.y + box.height / 2);
  await expect(dash.locator('.tip')).toBeVisible();
  await expect(dash.locator('.tip')).toContainText('Visitors');
  // The overview counts the same visit.
  await dash.goto(`${baseURL}admin/stats.php`);
  await expect(dash.locator('.kpi').filter({ hasText: 'Unique visitors' }).locator('.kpi-value')).toHaveText('1');
  await expect(dash.locator('[data-chart="byPage"] .legend button')).toHaveCount(4);
  // A year charts by week; picking a number of years shows that range at once.
  await dash.getByRole('link', { name: '1 Year', exact: true }).click();
  await expect(dash).toHaveURL(/range=1y/);
  await expect(dash.locator('.range')).toContainText('charts by week');
  await expect(dash.locator('[data-chart="byPage"] svg')).toBeVisible();
  await expect(dash.locator('.kpi').filter({ hasText: 'Unique visitors' }).locator('.kpi-value')).toHaveText('1');
  await expect(dash.locator('form.years button')).toBeHidden();
  await dash.locator('form.years select').selectOption('2y');
  await expect(dash).toHaveURL(/range=2y/);
  await expect(dash.locator('form.years.on select')).toHaveValue('2y');
  expect(errors).toEqual([]);
  await admin.close();
});

for (const [why, privacy] of [
  ['Do Not Track', `Object.defineProperty(navigator, 'doNotTrack', { get: () => '1' });`],
  ['Global Privacy Control', `Object.defineProperty(navigator, 'globalPrivacyControl', { get: () => true });`],
] as const) {
  test(`with ${why} nothing is sent`, async ({ browser, baseURL }) => {
    const context = await visitor(browser, privacy);
    const page = await context.newPage();
    const posts: string[] = [];
    page.on('request', r => { if (r.url().includes('/stats/')) posts.push(r.url()); });
    await page.goto(`${baseURL}play/crete/`);
    await page.waitForLoadState('load');
    await page.goto(`${baseURL}`);
    await page.waitForTimeout(1500);
    await page.goto('about:blank');
    expect(posts).toEqual([]);
    await context.close();
  });
}

test('the numbers are out of reach without signing in', async ({ browser, baseURL, request }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${baseURL}admin/stats.php?page=crete`);
  await expect(page).toHaveURL(/admin\/login\.php\?next=stats\.php/);
  await expect(page.locator('body')).not.toContainText('Unique visitors');
  await context.close();

  const read = await request.get(`${baseURL}stats/collect.php`);
  expect(read.status()).toBe(405);
  expect(await read.text()).toBe('');
  const write = await request.post(`${baseURL}stats/collect.php`, { data: '{"t":"v","p":"crete"}', headers: { 'Content-Type': 'text/plain' } });
  expect(write.status()).toBe(204);
  expect(await write.text()).toBe('');
  for (const path of ['stats/lib/Report.php', 'stats/lib/bootstrap.php', 'admin/data/stats.sqlite']) {
    const res = await request.get(`${baseURL}${path}`);
    expect([403, 404], path).toContain(res.status());
    expect(await res.text(), path).not.toContain('<?php');
  }
});
