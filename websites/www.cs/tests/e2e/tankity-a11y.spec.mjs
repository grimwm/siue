// Operation Tankity's accessibility: axe-core over the title card, the status
// bar, the deck and the open menu; every panel opener says whether its panel
// is open; and each control's visible words are part of its name.
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { newPlayer } from './helpers.mjs';

const scan = async (page, include) => (await new AxeBuilder({ page }).include(include)
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations
  .map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`);

test('axe finds nothing on the title card, the status bar, the deck or the open menu', async ({ browser }) => {
  const { page, errors } = await newPlayer(browser);
  for (const part of ['#title-card', '#hud-bar', '#deck']) expect(await scan(page, part), part).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.locator('#menu-overlay')).toBeVisible();
  expect(await scan(page, '#menu-overlay')).toEqual([]);
  expect(errors).toEqual([]);
});

test('every panel opener carries aria-expanded and it follows the panel', async ({ browser }) => {
  const { page } = await newPlayer(browser);
  for (const id of ['btn-menu', 'btn-log', 'btn-help', 'btn-weapon', 'title-settings']) {
    await expect(page.locator('#' + id)).toHaveAttribute('aria-expanded', 'false');
  }
  for (const [btn, key, panel] of [['btn-log', 'l', 'log-overlay'], ['btn-help', 'h', 'help-overlay'], ['btn-menu', 'Escape', 'menu-overlay']]) {
    await page.keyboard.press(key);
    await expect(page.locator('#' + panel)).toBeVisible();
    await expect(page.locator('#' + btn)).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press(key === 'Escape' ? 'Escape' : key);
    await expect(page.locator('#' + btn)).toHaveAttribute('aria-expanded', 'false');
  }
});

test('each control\'s visible words are part of its accessible name', async ({ browser }) => {
  const { page } = await newPlayer(browser);
  const misses = await page.evaluate(() => {
    const out = [];
    for (const b of document.querySelectorAll('#hud-bar button, #deck button, #title-card button')) {
      if (!b.getClientRects().length) continue;
      // Visible words: text a sighted player can see (not the clipped sr-only spans).
      // Name from content: every text node not hidden from the accessibility tree.
      const collect = (n, onlyVisible, out) => {
        for (const c of n.childNodes) {
          if (c.nodeType === 3) out.push(c.textContent);
          else if (c.nodeType === 1 && c.getAttribute('aria-hidden') !== 'true') {
            if (onlyVisible && (!c.getClientRects().length || c.getBoundingClientRect().width <= 1)) continue;
            collect(c, onlyVisible, out);
          }
        }
        return out;
      };
      const norm = t => t.join(' ').replace(/\s+/g, ' ').trim().toLowerCase();
      const visible = norm(collect(b, true, []));
      const name = (b.getAttribute('aria-label') || norm(collect(b, false, []))).replace(/\s+/g, ' ').trim().toLowerCase();
      if (visible && !name.includes(visible)) out.push(`${b.id || b.dataset.aim}: "${visible}" not in "${name}"`);
    }
    return out;
  });
  expect(misses).toEqual([]);
});
