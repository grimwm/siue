// The rule tips (src/rule-tips.ts) on Chapter 1, Level 1 for a new player: how the Minotaur moves once the start card
// has gone, then what he just did after the first move. Each holds play until it is put away: keys and the pad wait
// (the tip is nudged), Enter, Space or Got It puts it away, and the camera still turns. On a touch phone the touch tour
// goes first, and the first tip waits for it to end.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { helpAnswered } from './crete-answered.ts';

const PAGE = 'games/crete/';
const BEAST = 'The Minotaur takes two steps for each of yours, always toward you: across if he can, else up or down.';
const WALLS = 'He went right, then a wall stopped him. He never steps away from you, so a wall in his way can trap him.';

interface Hooked { __creteTest: { game: { run: { now: { moves: number } } } } }
const moves = (page: Page) => page.evaluate(() => (window as unknown as Hooked).__creteTest.game.run.now.moves);

/** A new player's way in: New Game, the look, the chapter card; Chapter 1, Level 1's start card is up. */
async function newGame(page: Page, look: 'modern' | 'classic'): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(l => localStorage.setItem('crete-look', l), look);
  await page.goto(PAGE);
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await page.locator('#chapter-enter').click();
  await expect(page.locator('#start-veil .kicker')).toHaveText('Chapter 1 · Level 1');
  return errors;
}

for (const look of ['classic', 'modern'] as const) {
  test(`${look}: the Minotaur's tip shows as play starts and holds the keys until Enter; the next comes after a move`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors = await newGame(page, look);
    await expect(page.locator('#tip'), 'nothing over the start card').toHaveCount(0);
    await page.keyboard.press('Enter');
    await expect(page.locator('#tip-text'), 'how the Minotaur moves').toHaveText(BEAST);
    await expect(page.locator('#tip-ok')).toHaveText('Got It');
    await expect(page.locator('#tip-ok'), 'the keyboard lands on Got It').toBeFocused();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);
    expect(await moves(page), 'an arrow waits while the tip stands').toBe(0);
    await expect(page.locator('#tip'), 'and nudges it').toHaveClass(/nudge/);
    await page.keyboard.press('Enter');
    await expect(page.locator('#tip'), 'Enter puts it away').toHaveCount(0);
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => moves(page), 'then the next arrow moves').toBe(1);
    await expect(page.locator('#tip-text'), 'what he just did, and that walls hold him').toHaveText(WALLS);
    await page.locator('#tip-ok').click();
    await expect(page.locator('#tip'), 'Got It puts it away').toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test.describe('on a touch phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });

  test('the first tip waits for the touch tour; the pad waits while it stands and moves once Got It is tapped', async ({ page }) => {
    const errors = await newGame(page, 'classic');
    await page.locator('#start-begin').tap();
    await expect(page.locator('#tour'), 'the touch tour goes first').toBeVisible();
    await expect(page.locator('#tip'), 'no tip on top of it').toHaveCount(0);
    await page.locator('#tour-done').tap();
    await expect(page.locator('#tour')).toHaveCount(0);
    await expect(page.locator('#tip-text'), 'then how the Minotaur moves').toHaveText(BEAST);
    const box = (await page.locator('#tip').boundingBox())!;
    expect(box.x, 'inside a phone\'s width').toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(390);
    await page.locator('.pad .mv-right').tap();
    await page.waitForTimeout(300);
    expect(await moves(page), 'the pad waits while the tip stands').toBe(0);
    await page.locator('#tip-ok').tap();
    await expect(page.locator('#tip')).toHaveCount(0);
    await page.locator('.pad .mv-right').tap();
    await expect.poll(() => moves(page), 'then the pad moves').toBe(1);
    await expect(page.locator('#tip-text')).toHaveText(WALLS);
    expect(errors).toEqual([]);
  });

  test('Enter skips the touch tour and does nothing more; the first tip then shows, and Enter puts it away', async ({ page }) => {
    const errors = await newGame(page, 'classic');
    await page.locator('#start-begin').tap();
    await expect(page.locator('#tour')).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(page.locator('#tour'), 'Enter is Skip Tour').toHaveCount(0);
    expect(await moves(page)).toBe(0);
    await expect(page.locator('#tip-text')).toHaveText(BEAST);
    await page.keyboard.press('Enter');
    await expect(page.locator('#tip')).toHaveCount(0);
    expect(await moves(page)).toBe(0);
    expect(errors).toEqual([]);
  });
});

test('Enter puts a tip away, as Got It does, and Enter or Space is no Wait even with Wait focused; Tab reaches Got It', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = await newGame(page, 'classic');
  await page.keyboard.press('Enter');
  await expect(page.locator('#tip-text')).toHaveText(BEAST);
  let reached = false;
  for (let i = 0; i < 60 && !reached; i++) {
    await page.keyboard.press('Tab');
    reached = await page.evaluate(() => document.activeElement?.id === 'tip-ok');
  }
  expect(reached, 'Tab reaches Got It').toBe(true);
  await page.locator('#btn-wait').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#tip'), 'Enter puts it away').toHaveCount(0);
  expect(await moves(page), 'and Wait never ran').toBe(0);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#tip-text')).toHaveText(WALLS);
  await page.locator('#btn-wait').focus();
  await page.keyboard.press(' ');
  await expect(page.locator('#tip'), 'Space puts it away').toHaveCount(0);
  expect(await moves(page), 'and the focused Wait never ran').toBe(1);
  await page.keyboard.press('ArrowUp');
  await expect.poll(() => moves(page)).toBe(2);
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => moves(page)).toBe(3);
  await expect(page.locator('#tip-text'), 'the Wait and Undo tip').toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#tip'), 'Escape puts one away too').toHaveCount(0);
  await expect(page.locator('#menu-veil')).toBeHidden();
  expect(await moves(page)).toBe(3);
  expect(errors).toEqual([]);
});

test('the camera still turns while a tip holds play', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors = await newGame(page, 'classic');
  await page.keyboard.press('Enter');
  await expect(page.locator('#tip-text')).toHaveText(BEAST);
  const heading = () => page.locator('#classic-compass').evaluate(el => Number((el as HTMLElement).dataset.heading));
  const before = await heading();
  await page.locator('#classic-compass').evaluate(el => {
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const ev = (kind: string, px: number) => el.dispatchEvent(new PointerEvent(kind, {
      pointerId: 41, pointerType: 'mouse', isPrimary: true, clientX: px, clientY: y, bubbles: true, cancelable: true, button: 0,
    }));
    ev('pointerdown', x);
    for (let i = 1; i <= 8; i++) ev('pointermove', x - 100 * i / 8);
    ev('pointerup', x - 100);
  });
  await expect.poll(heading, 'the compass turns the view').not.toBe(before);
  await expect(page.locator('#tip-text'), 'the tip still stands').toHaveText(BEAST);
  expect(await moves(page)).toBe(0);
  expect(errors).toEqual([]);
});

for (const [name, viewport] of [['a 360 px phone', { width: 360, height: 740 }], ['a desktop', { width: 1280, height: 800 }]] as const) {
  test(`${name}: retracing a step is an undo, said "Back to move N"; Best fits the status bar and turns amber past the fewest`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce', storageState: helpAnswered() });
    try {
      await ctx.addInitScript(() => localStorage.setItem('crete-met', '["*"]'));
      const page = await ctx.newPage();
      const errors = await newGame(page, 'classic');
      await page.keyboard.press('Enter');
      await expect(page.locator('#hud-best'), "Chapter 1, Level 1's fewest").toHaveText('10');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowUp');
      await expect(page.locator('#hud-moves')).toHaveText('2');
      await page.keyboard.press('ArrowDown');
      await expect(page.locator('#hud-moves'), 'the step back retraces the step up').toHaveText('1');
      await expect(page.locator('#toast')).toHaveText('↶ Back to move 1');
      await expect(page.locator('#toast')).toHaveClass(/show/);
      // Every stat shows inside the screen, with no sideways scroll.
      for (const id of ['hud-trial', 'hud-hearts', 'hud-relics', 'hud-keys', 'hud-gear', 'hud-moves', 'hud-best']) {
        const b = (await page.locator(`#${id}`).boundingBox())!;
        expect(b.x, id).toBeGreaterThanOrEqual(0);
        expect(b.x + b.width, id).toBeLessThanOrEqual(viewport.width);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      // A level whose fewest is 5, walked the long way round: past 5 the stat says by how many, in amber; Undo back to
      // 5 clears the cue.
      await page.evaluate(() => {
        const t = (window as unknown as { __creteTest: { parse(s: string): unknown; playLevel(l: unknown, o: unknown): void } }).__creteTest;
        const mv = (dir: string) => ({ kind: 'move', dir });
        t.playLevel(t.parse('title: Long Way\nintro: t\n\nP...\n....\n...E\n'), { line: [mv('down'), mv('down'), mv('right'), mv('right'), mv('right')] });
      });
      await page.keyboard.press('Enter');
      await expect(page.locator('#hud-best')).toHaveText('5');
      for (const k of ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowRight']) await page.keyboard.press(k);
      await expect(page.locator('#hud-moves')).toHaveText('6');
      await expect(page.locator('#hud-best')).toHaveText('5 +1');
      await expect(page.locator('.stat-best')).toHaveClass(/over/);
      await page.keyboard.press('u');
      await expect(page.locator('#hud-best')).toHaveText('5');
      await expect(page.locator('.stat-best')).not.toHaveClass(/over/);
      expect(errors).toEqual([]);
    } finally {
      await ctx.close();
    }
  });
}
