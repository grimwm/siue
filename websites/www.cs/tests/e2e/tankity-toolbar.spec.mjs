// Operation Tankity's battle toolbar: icon buttons with styled tips.
import { test, expect } from '@playwright/test';
import { newPlayer } from './helpers.mjs';

test('icon buttons show a styled tip after a moment, and Scores lives in the menu', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  const tools = page.locator('.guide-actions .tool');
  const names = await tools.evaluateAll(bs => bs.map(b => b.getAttribute('aria-label')));
  expect(names).toEqual(['Menu', 'Fire', 'Weapons', 'Drive left', 'Drive right', 'Radio log', 'Next track', 'How to play']);
  // Pure icons: no words on the buttons, only key caps.
  const words = await tools.evaluateAll(bs => bs.map(b => [...b.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('')).join(''));
  expect(words).toBe('');
  await expect(page.locator('#btn-report')).toHaveCount(0);

  const tip = page.locator('#tool-tip');
  await page.hover('#btn-weapon');
  await page.waitForTimeout(300);
  await expect(tip).toBeHidden(); // a passing pointer shows nothing
  await page.waitForTimeout(700);
  await expect(tip).toBeVisible();
  await expect(tip.locator('.tool-tip-name')).toHaveText('Weapons');
  await expect(tip.locator('.tool-tip-desc')).toContainText('(G)');
  // The tip sits under its button and takes its colour.
  const [b, t] = [await page.locator('#btn-weapon').boundingBox(), await tip.boundingBox()];
  expect(t.y).toBeGreaterThan(b.y + b.height - 1);
  expect(await tip.evaluate(el => getComputedStyle(el).borderTopColor)).toBe('rgb(255, 177, 60)');
  await page.locator('.guide-actions').screenshot({ path: 'test-results/tankity-toolbar.png' });
  await page.mouse.move(5, 5);
  await expect(tip).toBeHidden();

  // Scores: a menu tile, and R still opens it.
  await page.keyboard.press('c');
  await page.click('#scores-open');
  await expect(page.locator('#report-overlay')).toBeVisible();
  await expect(page.locator('#score-h')).toHaveText('Scores');
  await page.keyboard.press('Escape');
  await page.keyboard.press('r');
  await expect(page.locator('#report-overlay')).toBeVisible();
  expect(errors).toEqual([]);
});
