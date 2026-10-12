// How The Island of Crete plays today, driven through its own test hook. Any
// change to Crete must keep this green.
import { test, expect } from '@playwright/test';

const WIN_SEED = 'play-1'; // the play-through (the strategist) wins every maze; this one is pinned so a failure replays
const PAGE = 'games/crete/';

async function open(page, seed) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.clock.install();
  await page.goto(`${PAGE}?seed=${encodeURIComponent(seed)}`);
  await page.waitForFunction(() => !!window.__mazeTest && window.__mazeTest.G.seed !== '');
  return errors;
}

test('the play-through wins a pinned seed and shows the ending', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  await page.keyboard.press('t');
  await page.clock.runFor(250_000);
  const G = await page.evaluate(() => ({ over: window.__mazeTest.G.over, won: window.__mazeTest.G.won }));
  expect(G).toEqual({ over: true, won: true });
  await expect(page.locator('#end-veil')).toBeVisible();
  await expect(page.locator('#end-title')).not.toHaveText('');
  expect(errors).toEqual([]);
});

test('the creature catching you ends the run as a loss', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  await page.evaluate(() => {
    const t = window.__mazeTest;
    const { G } = t;
    // Put the creature on an open cell next to the player, outside any safe zone.
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const spot = dirs.map(([dr, dc]) => ({ r: G.player.r + dr, c: G.player.c + dc }))
      .find(p => !G.walls[p.r][p.c] && !G.safe.has(t.key(p.r, p.c)));
    G.foe.r = spot.r; G.foe.c = spot.c;
    t.creaturePhase(0);
  });
  const G = await page.evaluate(() => ({ over: window.__mazeTest.G.over, won: window.__mazeTest.G.won }));
  expect(G).toEqual({ over: true, won: false });
  await expect(page.locator('#end-veil')).toBeVisible();
  expect(errors).toEqual([]);
});

test('items, bash, mute and a new run answer their keys', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  const inv = () => page.evaluate(() => ({ ...window.__mazeTest.G.inv, frozen: window.__mazeTest.G.frozen }));
  const before = await inv();
  await page.keyboard.press('z'); // Mirror Shard: freezes the creature, no turn spent
  const afterShard = await inv();
  expect(afterShard.shard).toBe(before.shard - 1);
  expect(afterShard.frozen).toBe(1);

  const turns0 = await page.evaluate(() => window.__mazeTest.G.turns);
  await page.keyboard.press('Space'); // nothing adjacent: a message, no turn
  expect(await page.evaluate(() => window.__mazeTest.G.turns)).toBe(turns0);

  const muteText = await page.locator('#mute').textContent();
  await page.keyboard.press('m');
  await expect(page.locator('#mute')).not.toHaveText(muteText ?? '');

  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('n');
  await expect.poll(() => page.evaluate(() => window.__mazeTest.G.turns)).toBe(0);
  expect(errors).toEqual([]);
});

test('Quit (Q) ends the run and shows the title card in a browser tab; Play starts a new run', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  await page.keyboard.press('q');
  await expect(page.locator('#title-veil')).toBeVisible();
  await expect(page.locator('#title-hint')).toHaveCount(0);
  expect(await page.evaluate(() => window.__mazeTest.G.over)).toBe(true);
  await page.locator('#title-play').click();
  await expect(page.locator('#title-veil')).toBeHidden();
  expect(await page.evaluate(() => ({ over: window.__mazeTest.G.over, turns: window.__mazeTest.G.turns }))).toEqual({ over: false, turns: 0 });
  expect(errors).toEqual([]);
});
