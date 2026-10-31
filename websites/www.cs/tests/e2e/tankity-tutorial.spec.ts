// Operation Tankity's tutorial as coach marks, on a phone and on a desktop:
// each step spotlights the real control (on top at its centre, ringed), a
// small bubble beside it stays on screen and takes focus, and doing the thing
// moves on, through the shop (a gun row, a pack, Buy, Preview, Start) and the
// battle (barrel, power, drive, a gun, FIRE, the wind). Also the colour
// theme: Orange by default, Settings switches the accent (a preset or a
// colour of the player's own), and a reload keeps it.
import { test, expect } from '@playwright/test';
import type { Browser, Locator, Page } from '@playwright/test';
import { recorderScript } from './helpers.ts';

const STEPS = 11;

interface ScreenSpec { width: number; height: number; touch: boolean }

async function player(browser: Browser, { width, height, touch }: ScreenSpec) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
  await ctx.addInitScript(recorderScript); // the lesson counts as seen; asking for it runs it anyway
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.text().startsWith('tankity flow:')) errors.push(m.text()); });
  await page.goto('games/tankity/');
  await expect(page.locator('#title-card')).toBeVisible();
  return { ctx, page, errors };
}

/* The marks for step n: the bubble shows, on screen; the marked control is on
   top at its centre and wears the focus ring. Focus lands on the bubble as a
   step begins (`focus: false` for a later look at the same step). */
async function expectMarks(page: Page, n: number, { focus = true } = {}) {
  await expect(page.locator('#tutorial-count'), `step ${n}`).toHaveText(new RegExp(`${n} of ${STEPS}$`), { timeout: 30_000 });
  await expect(page.locator('.coach-bubble'), `step ${n}: the bubble shows`).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const t = document.querySelector('[data-coach-target]');
    if (!t) return 'no target';
    const r = t.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    if (!hit || !(hit === t || t.contains(hit))) return `covered by ${hit && (hit.id || hit.className)}`;
    const b = document.querySelector('.coach-bubble')!.getBoundingClientRect();
    if (b.left < 0 || b.top < 0 || b.right > innerWidth + 0.5 || b.bottom > innerHeight + 0.5) return `bubble off screen ${JSON.stringify(b)}`;
    const ring = getComputedStyle(t);
    if (ring.outlineStyle !== 'solid' || parseFloat(ring.outlineWidth) < 2) return 'no focus ring';
    return 'ok';
  }), { message: `step ${n}: marks` }).toBe('ok');
  if (focus) {
    await expect.poll(() => page.evaluate(() => document.activeElement?.classList.contains('coach-bubble')),
      { message: `step ${n}: focus on the bubble` }).toBe(true);
  }
}

/* Holds a pad button with the pointer for ms. */
async function hold(page: Page, sel: string, ms: number) {
  const box = (await page.locator(sel).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(ms);
  await page.mouse.up();
}

/* In the weapon picker: a gun in stock that is not the loaded one. */
async function pickAnotherGun(page: Page, touch: boolean) {
  const tile = page.locator('#gun-grid button[aria-pressed="false"]:not([aria-disabled="true"])').first();
  await (touch ? tile.tap() : tile.click());
}

const SCREENS: [string, ScreenSpec][] = [
  ['phone', { width: 390, height: 844, touch: true }],
  ['desktop', { width: 1280, height: 800, touch: false }],
];

for (const [name, screen] of SCREENS) {
  test(`tutorial on a ${name}: coach marks through the shop and the battle`, async ({ browser }) => {
    test.setTimeout(150_000);
    const { ctx, page, errors } = await player(browser, screen);
    const press = async (loc: Locator) => (screen.touch ? loc.tap() : loc.click());
    const target = page.locator('[data-coach-target]').first();
    const next = page.locator('#tutorial-next');

    await press(page.locator('#tutorial-open'));
    await expect(page.locator('#shop-veil')).toBeVisible();
    // 1: a gun row. The keys line shows only on a keyboard device.
    await expectMarks(page, 1);
    await expect(target).toHaveAttribute('data-kind', 'gun');
    await expect(page.locator('#tutorial-keys')).toHaveCount(screen.touch ? 0 : 1);
    await expect(page.locator('.coach-bubble .key:visible')).toHaveCount(screen.touch ? 0 : 1);
    if (screen.touch) await press(next);
    else await page.keyboard.press('ArrowDown'); // moving the selection is doing it
    // 2: a pack (Next).
    await expectMarks(page, 2);
    await expect(target).toHaveClass(/shop-vals/);
    await press(next);
    // 3: Buy. Buying moves on.
    await expectMarks(page, 3);
    await expect(target).toHaveAttribute('data-act', 'buy');
    await press(target);
    // 4: Preview. Opening it moves on; Start waits, hidden, under the firing range.
    await expectMarks(page, 4);
    await expect(target).toHaveAttribute('data-act', 'preview');
    await press(target);
    await expect(page.locator('#preview-veil')).toBeVisible();
    await expect(page.locator('#tutorial-count')).toHaveText(new RegExp(`5 of ${STEPS}$`));
    await expect(page.locator('.coach-bubble')).toBeHidden();
    if (screen.touch) await press(page.locator('#preview-close'));
    else await page.keyboard.press('q'); // Q shuts the firing range first, the lesson runs on
    await expect(page.locator('#preview-veil')).toBeHidden();
    // 5: Start.
    await expectMarks(page, 5);
    await expect(target).toHaveId('shop-next');
    await press(target);
    // 6: the barrel, on the player's aim.
    await expectMarks(page, 6);
    if (screen.touch) {
      // Turning the phone moves the marks and keeps the bubble on screen.
      await page.setViewportSize({ width: 844, height: 390 });
      await expectMarks(page, 6, { focus: false });
      await page.setViewportSize({ width: screen.width, height: screen.height });
      await expectMarks(page, 6, { focus: false });
      await hold(page, '[data-aim="left"]', 500);
    } else {
      await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(500); await page.keyboard.up('ArrowLeft');
    }
    // 7: power.
    await expectMarks(page, 7);
    if (screen.touch) await hold(page, '[data-aim="up"]', 500);
    else { await page.keyboard.down('ArrowUp'); await page.waitForTimeout(500); await page.keyboard.up('ArrowUp'); }
    // 8: drive.
    await expectMarks(page, 8);
    const x0 = await page.textContent('#hud-fuel');
    if (screen.touch) await hold(page, '#btn-drive-l', 600);
    else { await page.keyboard.down('Shift'); await page.keyboard.down('ArrowLeft'); await page.waitForTimeout(600); await page.keyboard.up('ArrowLeft'); await page.keyboard.up('Shift'); }
    if (await page.locator('#tutorial-count').textContent().then(t => /8 of/.test(t!))) {
      // At the field's edge: the other way.
      if (screen.touch) await hold(page, '#btn-drive-r', 600);
      else { await page.keyboard.down('Shift'); await page.keyboard.down('ArrowRight'); await page.waitForTimeout(600); await page.keyboard.up('ArrowRight'); await page.keyboard.up('Shift'); }
    }
    expect(await page.textContent('#hud-fuel')).not.toBe(x0);
    // 9: a gun. The picker open, the marks move onto its tiles.
    await expectMarks(page, 9);
    if (screen.touch) await press(page.locator('#btn-weapon'));
    else await page.keyboard.press('g');
    await expect(page.locator('#gun-overlay')).toBeVisible();
    await expectMarks(page, 9, { focus: false });
    await expect(target).toHaveId('gun-grid');
    await pickAnotherGun(page, screen.touch);
    // 10: FIRE.
    await expectMarks(page, 10);
    if (screen.touch) await press(page.locator('#btn-cannon'));
    else await page.keyboard.press('Space');
    // 11: the wind, while the shot flies.
    await expectMarks(page, 11);
    await expect(target).toHaveClass(/wind/);
    if (screen.touch) {
      await expect(next).toHaveText('Done');
      await press(next);
    } else {
      await page.keyboard.press('q'); // Q closes the lesson
    }
    await expect(page.locator('#tutorial-overlay')).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem('tankity-tutorial'))).toBe('done');
    expect(errors).toEqual([]);
    await ctx.close();
  });
}

test('Skip ends the lesson at once, and the bubble never names Esc', async ({ browser }) => {
  const { ctx, page, errors } = await player(browser, { width: 1280, height: 800, touch: false });
  await page.click('#tutorial-open');
  await expectMarks(page, 1);
  await expect(page.locator('.coach-bubble')).not.toContainText(/esc/i);
  await expect(page.locator('#tutorial-skip')).toHaveText(/^Skip\s*Q$/);
  await page.click('#tutorial-skip');
  await expect(page.locator('#tutorial-overlay')).toBeHidden();
  await expect(page.locator('#shop-veil')).toBeVisible();
  expect(errors).toEqual([]);
  await ctx.close();
});

for (const [name, screen] of SCREENS) {
  test(`theme on a ${name}: Settings switches the accent, and a reload keeps it`, async ({ browser }) => {
    const { ctx, page, errors } = await player(browser, screen);
    const press = async (loc: Locator) => (screen.touch ? loc.tap() : loc.click());
    const accent = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim());
    expect(await accent()).toBe('#ff9f43');
    await press(page.locator('#title-settings'));
    await expect(page.locator('#theme-picker')).toBeVisible();
    await expect(page.locator('[data-pick-theme="orange"]')).toHaveAttribute('aria-pressed', 'true');
    await press(page.locator('[data-pick-theme="lime"]'));
    expect(await accent()).toBe('#a3e635');
    await expect(page.locator('[data-pick-theme="lime"]')).toHaveAttribute('aria-pressed', 'true');
    // Play wears it: the primary fill follows the accent.
    expect(await page.locator('#title-play').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(163, 230, 53)');
    await page.reload();
    await expect(page.locator('#title-card')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('lime');
    expect(await accent()).toBe('#a3e635');
    expect(await page.evaluate(() => localStorage.getItem('tankity-theme'))).toBe('lime');
    // The in-world palette stays: the deck's FIRE keeps its red.
    expect(await page.locator('#btn-cannon').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(196, 34, 34)');
    expect(errors).toEqual([]);
    await ctx.close();
  });
}

/** WCAG 2 contrast of two "rgb(r, g, b)" strings. */
function contrastOf(a: string, b: string) {
  const lum = (c: string) => {
    const [r, g, bl] = c.match(/\d+/g)!.slice(0, 3).map(v => { const x = Number(v) / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

for (const [name, screen] of SCREENS) {
  test(`theme on a ${name}: a fresh profile gets Orange, with nothing stored`, async ({ browser }) => {
    const { ctx, page, errors } = await player(browser, screen);
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('orange');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim())).toBe('#ff9f43');
    expect(await page.evaluate(() => localStorage.getItem('tankity-theme'))).toBeNull();
    expect(await page.locator('#title-play').evaluate((el) => getComputedStyle(el).backgroundColor)).toBe('rgb(255, 159, 67)');
    expect(errors).toEqual([]);
    await ctx.close();
  });

  test(`theme on a ${name}: Custom with #3366ff changes the accent, keeps readable button text, and survives a reload`, async ({ browser }) => {
    const { ctx, page, errors } = await player(browser, screen);
    const press = async (loc: Locator) => (screen.touch ? loc.tap() : loc.click());
    const accent = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim());
    await press(page.locator('#title-settings'));
    await expect(page.locator('#theme-picker')).toBeVisible();
    await expect(page.locator('[data-pick-theme="custom"]')).toHaveText('Custom');
    await expect(page.locator('.theme-custom-pick')).toContainText('Pick a Colour');
    await page.locator('#theme-custom-input').fill('#3366ff');
    await expect(page.locator('[data-pick-theme="custom"]')).toHaveAttribute('aria-pressed', 'true');
    const custom = await accent();
    expect(custom).toMatch(/^#[0-9a-f]{6}$/);
    expect(custom).not.toBe('#ff9f43');
    expect(await page.evaluate(() => localStorage.getItem('tankity-theme'))).toBe('custom');
    expect(await page.evaluate(() => localStorage.getItem('tankity-theme-custom'))).toBe('#3366ff');
    // The label of every Settings button still fits its control.
    const clipped = await page.evaluate(() => [...document.querySelectorAll('#menu-overlay button')]
      .filter(b => b.getBoundingClientRect().width > 0)
      .filter(b => [b, ...b.querySelectorAll('span')].some(e => e.scrollWidth > e.clientWidth))
      .map(b => b.id || b.textContent));
    expect(clipped).toEqual([]);
    // The picker takes keyboard focus, and Q closes the menu from it.
    if (!screen.touch) {
      await page.locator('#theme-custom-input').focus();
      await expect(page.locator('#theme-custom-input')).toBeFocused();
      await page.keyboard.press('q');
    } else {
      await page.locator('#menu-close').tap();
    }
    await expect(page.locator('#menu-overlay')).toBeHidden();
    const play = await page.locator('#title-play').evaluate(el => { const c = getComputedStyle(el); return [c.color, c.backgroundColor]; });
    expect(contrastOf(play[0]!, play[1]!)).toBeGreaterThanOrEqual(4.5);
    await page.reload();
    await expect(page.locator('#title-card')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.getAttribute('data-theme'))).toBe('custom');
    expect(await accent()).toBe(custom);
    expect(errors).toEqual([]);
    await ctx.close();
  });
}
