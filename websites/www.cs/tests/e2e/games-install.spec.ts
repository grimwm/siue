// websites/www.cs/tests/e2e/games-install.spec.ts
// Install and Share on each game: Install appears when the browser offers to
// install and prompts on a click; on an iPhone it opens the Add to Home Screen
// steps on the game's own page; Share falls back to copying the link.
import { test, expect } from '@playwright/test';
import type { BrowserContext, Page } from '@playwright/test';

declare global {
  interface Window { __prompted?: number; __copied?: string }
}

const PAGE_GAMES = ['crete', 'tankity'];
const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

/** Chrome's install offer, as a page sees it: a beforeinstallprompt whose prompt() is counted. */
const offerInstall = (page: Page) => page.evaluate(() => {
  const ev = new Event('beforeinstallprompt', { cancelable: true }) as Event & { prompt: () => Promise<void> };
  ev.prompt = () => { window.__prompted = (window.__prompted ?? 0) + 1; return Promise.resolve(); };
  window.dispatchEvent(ev);
});

/** Chrome's own install offers are kept from the page, so only the test's offer counts. */
const onlyTestOffers = (target: Page | BrowserContext) => target.addInitScript(() => {
  window.addEventListener('beforeinstallprompt', e => {
    if (!e.isTrusted) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  });
});

/** No Web Share, and a clipboard that records what it is given. */
const noShareSheet = (context: BrowserContext) => context.addInitScript(() => {
  Object.defineProperty(Navigator.prototype, 'share', { value: undefined, configurable: true });
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: (text: string) => { window.__copied = text; return Promise.resolve(); } },
    configurable: true,
  });
});

function watchErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  return errors;
}

for (const id of PAGE_GAMES) {
  test(`${id}: the site page shows Install when the browser offers it, and Share copies its address`, async ({ browser, baseURL }) => {
    const context = await browser.newContext();
    await onlyTestOffers(context);
    await noShareSheet(context);
    const page = await context.newPage();
    const errors = watchErrors(page);
    await page.goto(`play/${id}/`);
    const bar = page.locator('#play-install');
    await expect(bar.locator('#share-btn')).toBeVisible();
    await expect(bar.locator('#install-btn'), 'no offer yet, no Install').toHaveCount(0);
    await offerInstall(page);
    await expect(bar.locator('#install-btn')).toBeVisible();
    await bar.locator('#share-btn').click();
    await expect(bar.locator('#share-status')).toHaveText('Link copied');
    expect(await page.evaluate(() => window.__copied)).toBe(new URL(`play/${id}/`, baseURL).href);
    expect(errors).toEqual([]);
    await context.close();
  });
}

test('the game page asked to install (?install) highlights Install, and a click prompts', async ({ page }) => {
  await onlyTestOffers(page);
  const errors = watchErrors(page);
  await page.goto('games/crete/?install');
  await expect(page.locator('.kit-install-corner #share-btn')).toBeVisible();
  const install = page.locator('.kit-install-corner #install-btn');
  await expect(install, 'no offer yet, no Install').toHaveCount(0);
  await offerInstall(page);
  await expect(install).toBeVisible();
  await expect(install).toHaveClass(/kit-install-asked/);
  await install.click();
  expect(await page.evaluate(() => window.__prompted)).toBe(1);
  await expect(install).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('on an iPhone, Install opens the game page with the Add to Home Screen steps; Q closes them', async ({ browser }) => {
  const context = await browser.newContext({ userAgent: IPHONE });
  const page = await context.newPage();
  const errors = watchErrors(page);
  await page.goto('play/crete/');
  await page.locator('#play-install #install-btn').click();
  // Crete adds its run's seed to the address (and writes a bare ?install as ?install=).
  await expect(page).toHaveURL(/\/games\/crete\/\?install=?(&|$)/);
  await expect(page.locator('#install-steps')).toBeVisible();
  await expect(page.locator('#install-steps-text')).toHaveText('Tap Share, then Add to Home Screen.');
  await expect(page.locator('#install-steps-done')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#install-steps')).toBeVisible();
  // The steps own Q: it closes them, and Crete's own Q (the menu) never sees it.
  const titleShown = await page.locator('#title-veil').isVisible();
  await page.keyboard.press('q');
  await expect(page.locator('#install-steps')).toBeHidden();
  expect(await page.locator('#title-veil').isVisible()).toBe(titleShown);
  expect(errors).toEqual([]);
  await context.close();
});

test('The CIC: Share is there, Install comes with the browser\'s offer, and the page links the game\'s manifest', async ({ page }) => {
  await onlyTestOffers(page);
  const errors = watchErrors(page);
  await page.goto('./?game=cylon');
  await expect(page.locator('#cylon-install-root #share-btn')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('#cylon-install-root #install-btn'), 'no offer yet, no Install').toHaveCount(0);
  await offerInstall(page);
  await expect(page.locator('#cylon-install-root #install-btn')).toBeVisible();
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', /games\/cylon\/manifest\.webmanifest$/);
  expect(errors).toEqual([]);
});
