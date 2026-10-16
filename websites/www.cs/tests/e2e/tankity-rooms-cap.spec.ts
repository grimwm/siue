// Operation Tankity's closed-room notice, as a player sees it: a room the
// server answers with a closed reason says so, and stays in Your games,
// marked, until dismissed.
import { test, expect } from '@playwright/test';
import { roomPair } from './helpers.ts';

test('an evicted room says why and stays in Your games', async ({ browser }) => {
  test.setTimeout(120_000);
  const { host, guest, code } = await roomPair(browser);
  // From here on the server answers this seat as it does once its room was
  // reclaimed: the 404 carries why, for this seat's token only.
  await guest.page.route('**/rooms.php?action=state*', route => route.fulfill({
    status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'no such room', closed: 'space' }),
  }));
  await expect(guest.page.locator('#lobby-status')).toHaveText(`Room ${code} was closed to make space.`, { timeout: 20_000 });
  await expect(guest.page.locator('#lobby-veil')).toBeVisible();
  const row = guest.page.locator('#lobby-games li', { hasText: code });
  await expect(row).toContainText(`${code} · Closed to make space`, { timeout: 20_000 });
  await expect(row.locator('button')).toHaveText('Dismiss');
  const stored = await guest.page.evaluate(c => (JSON.parse(localStorage.getItem('tankity-seats') || '{}').seats || []).find((s: { code: string }) => s.code === c), code);
  expect(stored && stored.closed).toBe('space');
  await row.locator('button').click();
  await expect(guest.page.locator('#lobby-games')).toHaveCount(0);
  const after = await guest.page.evaluate(c => (JSON.parse(localStorage.getItem('tankity-seats') || '{}').seats || []).find((s: { code: string }) => s.code === c) || null, code);
  expect(after).toBeNull();
  expect(guest.errors).toEqual([]);
  await host.ctx.close(); await guest.ctx.close();
});
