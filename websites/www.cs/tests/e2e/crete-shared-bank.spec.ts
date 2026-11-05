// Endless's shared bank: with the bank's endpoint answering two served levels (routed here, so the spec needs no
// stored bank), opening the Endless card tops up the page's cache, and New Run opens a shared level at once, its start
// card saying so. A seed typed in plays the seed's own level, never a shared one.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const PAGE = 'games/crete/';

/** Two Medium bank levels that fit a Medium run's first place, as the bank serves them. */
const LEVELS = [
  { text: 'title: \nintro: \n\n#####E#######\n#....|..#...#\n#.###*#.#.#.#\n#...#.#...#.#\n###.#.###TG.#\n#.#gG.....#.#\n#.#.###.###.#\n#.#....O...*#\n#.#.#.#.#.###\n#P..#.#_#...#\n#.#######.#t#\n#.........#M#\n#############\n', line: 'wdduurruuuurruuudddrrdddurrrruuullulluullu', shortest: 42, score: 35, explored: 4979, chapter: 1, hides: false, h: '1111111111111111' },
  { text: 'title: \nintro: \n\n#####E#######\n#...t.#.....#\n#M###.#.#.#.#\n#.....#.#.#.#\n#.###.#.#.#.#\n#....*#.._..#\n#T#####.##.##\n#....P......#\n#.#.###.###.#\n#.#..c#...#.#\n#.###.#.#.#.#\n#.......#...#\n#############\n', line: 'rruurrllddllllddrrlluulcluuuurrrrdduuuuu', shortest: 40, score: 42, explored: 3314, chapter: 1, hides: false, h: '2222222222222222' },
];

interface Hooked { __creteTest: { endless: { shared: { size(g: string): number } } } }

async function routeBank(page: Page): Promise<string[]> {
  const asked: string[] = [];
  await page.route('**/games/crete/endless-bank.php**', async route => {
    const req = route.request();
    asked.push(`${req.method()} ${req.url()}`);
    const body = req.method() === 'GET' ? { csrf: 'c'.repeat(32), levels: new URL(req.url()).searchParams.get('n') === '0' ? [] : LEVELS } : { ok: true };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
  return asked;
}

async function openEndless(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { localStorage.setItem('crete-met', '["*"]'); localStorage.setItem('crete-look', 'classic'); });
  await page.goto(PAGE);
  await expect(page.locator('#title-veil')).toBeVisible();
  await page.locator('#title-endless').click();
  await expect(page.locator('#endless-veil')).toBeVisible();
}

test('New Run opens a level from the shared bank at once, and says so', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  const asked = await routeBank(page);
  await openEndless(page);
  // The open card tops up the cache from the bank.
  await page.waitForFunction(() => (window as unknown as Hooked).__creteTest.endless.shared.size('medium') > 0);
  expect(asked.some(a => a.startsWith('GET') && a.includes('grade=medium'))).toBe(true);
  await page.locator('#endless-new').click();
  await expect(page.locator('#start-veil')).toBeVisible({ timeout: 2_000 });
  await expect(page.locator('#start-veil .kicker')).toHaveText('Endless · Level 1');
  await expect(page.locator('#start-veil')).toContainText('From the shared bank.');
  await expect(page.locator('#start-veil')).toContainText(/The fewest moves are (42|40)\./);
  expect(errors).toEqual([]);
});

test('a seed typed in plays its own level, never a shared one', async ({ page }) => {
  await routeBank(page);
  await openEndless(page);
  await page.waitForFunction(() => (window as unknown as Hooked).__creteTest.endless.shared.size('medium') > 0);
  await page.locator('#endless-seed-box').fill('e2e-seeded');
  await page.locator('#endless-seed-play').click();
  await expect(page.locator('#start-veil')).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('#start-veil')).toContainText('From the level bank.');
  await expect(page.locator('#start-veil')).not.toContainText('From the shared bank.');
});
