// How the Cylon game plays today on the home page: a KO scores, the grenade
// cools down, stopping a scored run opens the game over panel, and filing
// initials puts the run on the board. Any change to Cylon must keep this green.
import { test, expect } from '@playwright/test';

test('a scored run reaches the board', async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('./?game=cylon');
  // The intro hero runs first; the server refuses a score from a run shorter than minRunSec.
  await expect(page.locator('body')).toHaveClass(/cylon-intro-hero/, { timeout: 30_000 });
  await expect(page.locator('body')).toHaveClass(/cylon-game-live/, { timeout: 30_000 });
  await expect(page.locator('body')).not.toHaveClass(/cylon-intro-hero/, { timeout: 30_000 });

  const score = async () => Number((await page.locator('#cylon-score-value').textContent()) || '0');
  // Bots mid-KO keep their class for a moment, so aim at a live one on every try.
  const ko = async () => {
    const before = await score();
    await expect.poll(async () => {
      await page.locator('.cylon-bot.is-marching:not([data-ko="1"])').first()
        .dispatchEvent('pointerdown', { pointerType: 'mouse', button: 0, isPrimary: true }, { timeout: 1_000 })
        .catch(() => {});
      return score();
    }, { timeout: 20_000 }).toBeGreaterThan(before);
  };
  await expect(page.locator('.cylon-bot.is-marching').first()).toBeVisible({ timeout: 20_000 });
  await ko();

  // The button arms the grenade; the next pointerdown anywhere throws it and starts the cooldown.
  await page.locator('#cylon-grenade-btn').click();
  await expect(page.locator('body')).toHaveClass(/cylon-grenade-armed/);
  await page.evaluate(() => {
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0, pointerType: 'mouse', clientX: 300, clientY: 300 }));
  });
  await expect(page.locator('#cylon-grenade-cd')).not.toHaveText('', { timeout: 3_000 });

  // A full board only takes a score above its lowest row, and the store persists between runs
  // (and weeks), so a run can qualify weekly yet miss the all-time board. Play on until this run
  // beats both cutoffs. The server caps a run at koBurst + elapsed * maxKosPerSec KOs (8 + 2/s),
  // so a threshold past REACHABLE cannot be met inside this test's budget.
  const REACHABLE = 12;
  const board = await (await page.request.get('games/cylon/scores.php')).json();
  const max = Number(board.config.maxScores);
  const cutoff = (list: { score: number | string }[]) => (list.length >= max ? Math.min(...list.map(s => Number(s.score))) : 0);
  const weeklyLowest = cutoff(board.scores);
  const allTimeLowest = cutoff(board.alltime);
  const lowest = Math.max(weeklyLowest, allTimeLowest);
  if (lowest + 1 > REACHABLE) {
    test.info().annotations.push({ type: 'board', description: 'full board beyond reach: checked the non-qualifying game over instead' });
    await page.locator('#cylon-game-toggle').click();
    await expect(page.locator('#cylon-gameover')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('#cylon-gameover-entry')).toBeHidden();
    await expect(page.locator('#cylon-gameover-board')).toBeVisible();
    await expect(page.locator('#cylon-gameover-scores li .cylon-hs-score').first()).toBeVisible();
    await expect(page.getByRole('tab', { name: 'This week' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tab', { name: 'All time' })).toHaveAttribute('aria-selected', 'false');
    expect(errors).toEqual([]);
    return;
  }
  while ((await score()) <= lowest) {
    await expect(page.locator('.cylon-bot.is-marching').first()).toBeVisible({ timeout: 20_000 });
    await ko();
  }

  const final = await score();
  await page.locator('#cylon-game-toggle').click();
  await expect(page.locator('#cylon-gameover')).toBeVisible({ timeout: 5_000 });
  await expect(page.locator('#cylon-gameover-entry')).toBeVisible();
  const filed = page.waitForResponse(r => r.url().includes('scores.php') && r.request().method() === 'POST' && (r.request().postData() || '').includes('"op":"score"'));
  await page.locator('#cylon-score-submit').click();
  const res = await filed;
  expect(res.status(), `scores.php refused the run: ${await res.text()}`).toBe(200);
  await expect(page.locator('#cylon-gameover-board')).toBeVisible({ timeout: 5_000 });
  // The default initials are what gets filed; the score cell reads "<n> KOs".
  const row = page.locator('#cylon-gameover-scores li')
    .filter({ has: page.locator('.cylon-hs-initials', { hasText: /^AAA$/ }) })
    .filter({ has: page.locator('.cylon-hs-score', { hasText: new RegExp(`^${final} KOs$`) }) });
  await expect(row.first()).toBeVisible({ timeout: 5_000 });
  // The run beat both cutoffs above, so it is on the all-time board too and says so.
  await page.getByRole('tab', { name: 'All time' }).click();
  await expect(page.getByRole('tab', { name: 'All time' })).toHaveAttribute('aria-selected', 'true');
  await expect(row.first()).toBeVisible({ timeout: 5_000 });
  await expect(page.locator('#cylon-gameover-alltime')).toHaveText(/^New all-time #\d+!$/);
  expect(errors).toEqual([]);
});
