// websites/www.cs/tests/e2e/play-nav.spec.mjs
// The /play/<id>/ top bar: one line on a phone (left the plain site links, right the game's group of
// Games, picture, Install and Share), icon-only buttons there, icon beside word on a desktop.
import { test, expect } from '@playwright/test';

// Cylon is mounted in the site page, so its /play/cylon/ only forwards there.
const GAMES = ['crete', 'tankity'];
const PHONES = [[360, 780], [384, 854], [412, 915]];

const offerInstall = page => page.evaluate(() => {
  const ev = new Event('beforeinstallprompt', { cancelable: true });
  ev.prompt = () => Promise.resolve();
  window.dispatchEvent(ev);
});

/** Chrome's own install offers are kept from the page, so only the test's offer counts. */
const onlyTestOffers = context => context.addInitScript(() => {
  window.addEventListener('beforeinstallprompt', e => {
    if (!e.isTrusted) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  });
});

const box = async loc => (await loc.boundingBox());
const mid = async loc => { const b = await box(loc); return b.y + b.height / 2; };

async function open(browser, id, width, height, touch) {
  const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
  await onlyTestOffers(context);
  await context.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'share', { value: undefined, configurable: true });
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.resolve() }, configurable: true });
  });
  const page = await context.newPage();
  await page.goto(`play/${id}/`);
  await expect(page.locator('#share-btn')).toBeVisible();
  await expect(page.locator('#share-btn svg path').first(), 'the kit\'s Share icon: arrow up out of a tray').toHaveAttribute('d', 'M12 15V3M7 8l5-5 5 5');
  await offerInstall(page);
  await expect(page.locator('#install-btn')).toBeVisible();
  return { context, page };
}

const oneLine = async page => {
  const parts = page.locator('.play-brand, .play-github, .play-games, .play-now, #install-btn, #share-btn');
  const mids = [];
  for (const p of await parts.all()) mids.push(await mid(p));
  expect(Math.max(...mids) - Math.min(...mids), `centres ${mids}`).toBeLessThanOrEqual(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
};

for (const id of GAMES) {
  for (const [w, h] of PHONES) {
    test(`${id} at ${w}x${h}: the bar is one line of icon buttons`, async ({ browser }) => {
      const { context, page } = await open(browser, id, w, h, true);
      await oneLine(page);
      // Home and Contact are gone; the game shows only its picture.
      await expect(page.locator('.play-link').first()).toBeHidden();
      await expect(page.locator('.play-link').last()).toBeHidden();
      const name = await box(page.locator('.play-now-name'));
      expect(name.width).toBeLessThanOrEqual(1);
      await expect(page.locator('.play-now img')).toBeVisible();
      // Games, Install and Share: squares of icon alone, named for a screen reader.
      for (const [btn, label] of [[page.getByRole('link', { name: 'Games' }), 'Games'], [page.getByRole('button', { name: 'Install' }), 'Install'], [page.getByRole('button', { name: 'Share' }), 'Share']]) {
        const b = await box(btn);
        expect(b.width, label).toBeGreaterThanOrEqual(40);
        expect(b.width, label).toBeLessThanOrEqual(48);
        expect(b.height, label).toBeGreaterThanOrEqual(40);
        expect(await btn.getAttribute('title'), label).toBeTruthy();
        await expect(btn.locator('svg')).toBeVisible();
      }
      // The left group: brand then GitHub; the right group sits at the right edge.
      const brand = await box(page.locator('.play-brand'));
      const gh = await box(page.locator('.play-github'));
      const games = await box(page.locator('.play-games'));
      const share = await box(page.locator('#share-btn'));
      expect(gh.x).toBeGreaterThan(brand.x + brand.width - 1);
      expect(gh.x + gh.width).toBeLessThanOrEqual(games.x);
      expect(w - (share.x + share.width), 'Share keeps the nav\'s right padding').toBeGreaterThanOrEqual(8);
      expect(w - (share.x + share.width), 'right edge').toBeLessThanOrEqual(16);
      expect(Math.abs(gh.height - games.height), 'GitHub is as tall as the buttons').toBeLessThanOrEqual(1);
      expect(Math.abs(await mid(page.locator('.play-github')) - await mid(page.locator('#share-btn')))).toBeLessThanOrEqual(2);
      expect(gh.width).toBeGreaterThanOrEqual(40);
      // 44 px to hit: a tap 2 px beyond GitHub's square still lands on it.
      const hit = await page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest('.play-github') !== null, [gh.x - 2, gh.y + gh.height / 2]);
      expect(hit, 'touch target').toBe(true);
      expect(await page.locator('.play-github').getAttribute('aria-label')).toBe('Source on GitHub');
      expect(await page.locator('.play-github').getAttribute('title')).toBe('Source on GitHub');
      // "Link copied" fits too.
      await page.locator('#share-btn').click();
      await expect(page.locator('#share-status')).toHaveText('Link copied');
      const st = await box(page.locator('#share-status'));
      expect(st.x).toBeGreaterThanOrEqual(0);
      expect(st.x + st.width).toBeLessThanOrEqual(w);
      await oneLine(page);
      await context.close();
    });
  }

  test(`${id} at 1280x720: each icon sits beside its word`, async ({ browser }) => {
    const { context, page } = await open(browser, id, 1280, 720, false);
    await oneLine(page);
    for (const [btn, label] of [[page.getByRole('link', { name: 'Games' }), 'Games'], [page.getByRole('button', { name: 'Install' }), 'Install'], [page.getByRole('button', { name: 'Share' }), 'Share']]) {
      await expect(btn.locator('svg'), label).toBeVisible();
      const word = await box(btn.locator('.play-txt, .kit-install-txt'));
      expect(word.width, label).toBeGreaterThan(20);
    }
    await expect(page.locator('.play-link').first()).toBeVisible();
    await expect(page.locator('.play-link').last()).toBeVisible();
    await expect(page.locator('.play-now-name')).toBeVisible();
    const share = await box(page.locator('#share-btn'));
    expect(1280 - (share.x + share.width), 'right edge').toBeLessThanOrEqual(16);
    // "Link copied" floats under the buttons: Share does not move and the bar does not widen.
    await page.locator('#share-btn').click();
    await expect(page.locator('#share-status')).toHaveText('Link copied');
    const after = await box(page.locator('#share-btn'));
    expect(Math.abs(after.x - share.x), 'Share stays put').toBeLessThanOrEqual(1);
    const st = await box(page.locator('#share-status'));
    expect(st.y, 'under the buttons').toBeGreaterThanOrEqual(share.y + share.height);
    await oneLine(page);
    await context.close();
  });
}

test('Cylon\'s corner pill: icon and word on a desktop, the icon alone on a phone', async ({ browser }) => {
  for (const [w, h, touch] of [[1280, 720, false], [412, 915, true]]) {
    const context = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch });
    await onlyTestOffers(context);
    const page = await context.newPage();
    await page.goto('./?game=cylon');
    const pill = page.locator('#cylon-install-root');
    await expect(pill.locator('#share-btn')).toBeVisible({ timeout: 10_000 });
    await offerInstall(page);
    await expect(pill.locator('#install-btn')).toBeVisible();
    for (const id of ['install-btn', 'share-btn']) {
      const btn = pill.locator(`#${id}`);
      await expect(btn.locator('svg')).toBeVisible();
      const word = await box(btn.locator('.kit-install-txt'));
      if (touch) {
        expect((await box(btn)).width).toBeLessThanOrEqual(48);
        expect(word.width).toBeLessThanOrEqual(1);
        expect(await btn.getAttribute('title')).toBeTruthy();
      } else {
        expect(word.width).toBeGreaterThan(20);
      }
    }
    await context.close();
  }
});
