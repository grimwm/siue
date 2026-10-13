// Operation Tankity rooms: the lobby's own initials boxes. A friend who
// arrives on an invite link lands in the lobby, never on the title card, so
// the lobby shows the saved set (random letters until one is chosen), lets
// them change it before joining, and the title card shows the same set.
import { test, expect } from '@playwright/test';
import { newPlayer, hud } from './helpers.mjs';

const boxes = page => [1, 2, 3].map(n => page.locator(`#lobby-initial-${n}`));
const shown = page => Promise.all(boxes(page).map(b => b.inputValue())).then(v => v.join(''));
const saved = page => page.evaluate(() => localStorage.getItem('tankity-initials'));

/* A room to join: one player hosts it and stays. */
async function hostedRoom(browser) {
  const host = await newPlayer(browser);
  await host.page.click('#rooms-open');
  await host.page.click('#host-go');
  await host.page.waitForSelector('#lobby-room:not([hidden])');
  await expect.poll(() => hud(host.page, 'lobby-code')).toMatch(/^[A-Z0-9]{4}$/);
  return { host, code: (await hud(host.page, 'lobby-code')).trim() };
}

test('an invite link in a fresh browser opens the lobby with three random letters in its initials boxes', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser, 'games/tankity/?code=ZZ99');
  await expect(page.locator('#lobby-veil')).toBeVisible();
  await expect(page.locator('#join-code')).toHaveValue('ZZ99');
  for (const b of boxes(page)) await expect(b).toBeVisible();
  await expect.poll(() => shown(page)).toMatch(/^[A-Z]{3}$/);
  expect(await shown(page)).toBe(await saved(page));
  expect(errors).toEqual([]);
});

test('with initials saved, an invite link shows them; changed in the lobby, the room and the title card use the new set', async ({ browser }) => {
  const { host, code } = await hostedRoom(browser);
  const { page, errors } = await newPlayer(browser);
  await page.evaluate(() => localStorage.setItem('tankity-initials', 'ABC'));
  await page.goto(`games/tankity/?code=${code}`);
  await expect(page.locator('#lobby-veil')).toBeVisible();
  await expect.poll(() => shown(page)).toBe('ABC');

  // Typing in a box is typing: Q, N and F are letters there, not the game's keys.
  await boxes(page)[0].click();
  await page.keyboard.type('qnf');
  await expect.poll(() => shown(page)).toBe('QNF');
  await expect(page.locator('#lobby-veil')).toBeVisible();
  expect(await page.evaluate(() => !!document.fullscreenElement)).toBe(false);

  // Half-typed boxes stop Join with a line, and the player lands in the empty box.
  await boxes(page)[0].click();
  await page.keyboard.type('x');
  await page.click('#join-go');
  await expect(page.locator('#lobby-initials-note')).toContainText('all three');
  await expect(boxes(page)[1]).toBeFocused();
  await expect(page.locator('#lobby-room')).toBeHidden();

  // A blocked set is refused at once, and Join stays refused while it shows.
  await boxes(page)[0].click();
  await page.keyboard.type('ass');
  await expect(page.locator('#lobby-initials-note')).toContainText('not allowed');
  await page.click('#join-go');
  await expect(page.locator('#lobby-initials-note')).toContainText('not allowed');
  await expect(page.locator('#lobby-room')).toBeHidden();
  expect(await saved(page)).toBe('QNF');

  await boxes(page)[0].click();
  await page.keyboard.type('xyz');
  await expect.poll(() => saved(page)).toBe('XYZ');
  await expect(page.locator('#lobby-initials-note')).toHaveText('');
  await page.click('#join-go');
  await page.waitForSelector('#lobby-room:not([hidden])');
  await expect(page.locator('#lobby-initials')).toBeHidden();
  const names = p => p.locator('#lobby-seats .seat-name').allTextContents();
  await expect.poll(() => names(page)).toContain('XYZ');
  await expect.poll(() => names(host.page), { timeout: 10_000 }).toContain('XYZ');

  // Out of the room, Q (focus not in a box) closes the lobby; the title card shows the same set.
  await page.click('#lobby-leave');
  await expect(page.locator('#lobby-rows')).toBeVisible();
  await expect.poll(() => shown(page)).toBe('XYZ');
  await page.locator('#lobby-title').click();
  await page.keyboard.press('q');
  await expect(page.locator('#lobby-veil')).toBeHidden();
  await expect(page.locator('#title-card')).toBeVisible();
  for (const [i, ch] of ['X', 'Y', 'Z'].entries()) await expect(page.locator(`#title-initial-${i + 1}`)).toHaveValue(ch);
  expect(errors).toEqual([]);
  await host.ctx.close();
});

test('on a phone the lobby initials boxes are on top and reachable', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto('games/tankity/?code=ZZ99');
  await expect(page.locator('#lobby-veil')).toBeVisible();
  for (const b of boxes(page)) {
    await b.scrollIntoViewIfNeeded();
    const top = await b.evaluate(el => {
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return !!hit && (hit === el || el.contains(hit));
    });
    expect(top).toBe(true);
  }
  await ctx.close();
});
