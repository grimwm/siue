// How The Island of Crete plays today, driven through its own test hook. Any
// change to Crete must keep this green.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// The game's own test hook (games/crete), as far as this spec reads it.
interface MazeTest {
  G: {
    seed: string; over: boolean; won: boolean; turns: number; frozen: number;
    player: { r: number; c: number }; foe: { r: number; c: number };
    walls: boolean[][]; safe: Set<string>; hint: string | null; inv: { shard: number };
  };
  key(r: number, c: number): string;
  creaturePhase(n: number): void;
}
declare global {
  interface Window { __mazeTest: MazeTest }
}

const WIN_SEED = 'play-1'; // the play-through (the strategist) wins every maze; this one is pinned so a failure replays
const PAGE = 'games/crete/';

async function open(page: Page, seed: string): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.clock.install();
  await page.goto(`${PAGE}?seed=${encodeURIComponent(seed)}`);
  await page.waitForFunction(() => !!window.__mazeTest && window.__mazeTest.G.seed !== '');
  // The page opens on the title card over the maze; Play starts that maze.
  await expect(page.locator('#title-veil')).toBeVisible();
  await page.locator('#title-play').click();
  await expect(page.locator('#title-veil')).toBeHidden();
  return errors;
}

const gameState = (page: Page) => page.evaluate(() => ({ over: window.__mazeTest.G.over, won: window.__mazeTest.G.won }));

test('the play-through wins a pinned seed and shows the ending over the title card', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  await page.keyboard.press('t');
  await page.clock.runFor(250_000);
  expect(await gameState(page)).toEqual({ over: true, won: true });
  await expect(page.locator('#end-veil')).toBeVisible();
  await expect(page.locator('#end-title')).not.toHaveText('');
  await expect(page.locator('#title-veil'), 'the title card waits under the ending').toBeHidden();
  // Q closes the ending and reveals the title card, not the menu.
  await page.keyboard.press('q');
  await expect(page.locator('#end-veil')).toBeHidden();
  await expect(page.locator('#title-veil')).toBeVisible();
  await expect(page.locator('#menu-veil')).toBeHidden();
  expect(errors).toEqual([]);
});

test('the creature catching you ends the run as a loss', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  await page.evaluate(() => {
    const t = window.__mazeTest;
    const { G } = t;
    // Put the creature on an open cell next to the player, outside any safe zone.
    const dirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const spot = dirs.map(([dr, dc]) => ({ r: G.player.r + dr, c: G.player.c + dc }))
      .find(p => !G.walls[p.r]![p.c] && !G.safe.has(t.key(p.r, p.c)))!;
    G.foe.r = spot.r; G.foe.c = spot.c;
    t.creaturePhase(0);
  });
  expect(await gameState(page)).toEqual({ over: true, won: false });
  await expect(page.locator('#end-veil')).toBeVisible();
  expect(errors).toEqual([]);
});

test('the strip drives a run: pad, Hint, a tool, and the toast shows the newest log line', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  const turns0 = await page.evaluate(() => window.__mazeTest.G.turns);
  // The pad moves or bumps; either way the page answers with a toast.
  for (const dir of ['right', 'down', 'left', 'up']) await page.locator(`.mv-${dir}`).click();
  await page.locator('#btn-hint').click();
  expect(await page.evaluate(() => window.__mazeTest.G.hint)).not.toBeNull();
  const shard0 = await page.evaluate(() => window.__mazeTest.G.inv.shard);
  await page.locator('#tool-shard').click();
  expect(await page.evaluate(() => window.__mazeTest.G.inv.shard)).toBe(shard0 - 1);
  await page.keyboard.press('Space');
  await expect(page.locator('#toast')).toHaveClass(/show/);
  const toast = await page.locator('#toast').textContent();
  expect(toast).not.toBe('');
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
  await expect(page.locator('#log li').last()).toHaveText(toast ?? '');
  expect(await page.evaluate(() => window.__mazeTest.G.turns)).toBeGreaterThanOrEqual(turns0);
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

  await page.keyboard.press('q'); // the menu holds the Sound button
  const muteText = await page.locator('#mute').textContent();
  await page.keyboard.press('m');
  await expect(page.locator('#mute')).not.toHaveText(muteText ?? '');
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeHidden();

  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('n');
  await expect.poll(() => page.evaluate(() => window.__mazeTest.G.turns)).toBe(0);
  expect(errors).toEqual([]);
});

test('Q layers: Q opens the menu and closes it; game keys wait under it; Esc does nothing', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
  const turns0 = await page.evaluate(() => window.__mazeTest.G.turns);
  await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(() => window.__mazeTest.G.turns)).toBe(turns0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#menu-veil')).toBeVisible();
  // A q typed into the seed box is a letter.
  await page.locator('#seed-input').fill('');
  await page.locator('#seed-input').press('q');
  await expect(page.locator('#seed-input')).toHaveValue('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
  await page.locator('#menu-close').click();
  await expect(page.locator('#menu-veil')).toBeHidden();
  expect(errors).toEqual([]);
});

test('Quit in the menu ends the run and shows the title card in a browser tab; Play starts a new run', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  await page.keyboard.press('q');
  await page.locator('#quit').click();
  await expect(page.locator('#title-veil')).toBeVisible();
  await expect(page.locator('#menu-veil')).toBeHidden();
  await expect(page.locator('#title-hint')).toHaveCount(0);
  expect(await page.evaluate(() => window.__mazeTest.G.over)).toBe(true);
  await page.locator('#title-play').click();
  await expect(page.locator('#title-veil')).toBeHidden();
  expect(await page.evaluate(() => ({ over: window.__mazeTest.G.over, turns: window.__mazeTest.G.turns }))).toEqual({ over: false, turns: 0 });
  expect(errors).toEqual([]);
});

test('the title card opens Story and Settings, and Q returns to it', async ({ page }) => {
  await page.clock.install();
  await page.goto(`${PAGE}?seed=${WIN_SEED}`);
  await page.locator('#title-story').click();
  await expect(page.locator('#story-veil')).toBeVisible();
  await expect(page.locator('#title-veil')).toBeHidden();
  await page.keyboard.press('q');
  await expect(page.locator('#story-veil')).toBeHidden();
  await expect(page.locator('#title-veil')).toBeVisible();
  await page.locator('#title-settings').click();
  await expect(page.locator('#menu-veil')).toBeVisible();
  await page.keyboard.press('q');
  await expect(page.locator('#title-veil')).toBeVisible();
  // Q under the title card does nothing.
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeHidden();
});

test('sound is remembered in this browser', async ({ page }) => {
  const errors = await open(page, WIN_SEED);
  await page.keyboard.press('m');
  await page.keyboard.press('q');
  await expect(page.locator('#mute')).toContainText('Muted');
  await page.reload();
  await page.locator('#title-settings').click();
  await expect(page.locator('#mute')).toContainText('Muted');
  expect(errors).toEqual([]);
});

type LockCall = { keys?: string[]; outcome?: string; unlock?: boolean };
declare global {
  interface Window { __locks: LockCall[] }
}
/** Records Keyboard Lock calls and how each ended; a browser without Keyboard Lock gets a stand-in that grants. */
function lockRecorder() {
  window.__locks = [];
  const nav = navigator as any;
  if (!nav.keyboard || typeof nav.keyboard.lock !== 'function') {
    Object.defineProperty(navigator, 'keyboard', { configurable: true, value: { lock: async () => {}, unlock() {} } });
  }
  const kb = nav.keyboard;
  const lock = kb.lock.bind(kb), unlock = kb.unlock.bind(kb);
  kb.lock = (keys: string[]) => {
    const call: LockCall = { keys, outcome: 'pending' };
    window.__locks.push(call);
    const p = lock(keys);
    p.then(() => { call.outcome = 'granted'; }, (e: Error) => { call.outcome = `refused: ${e.message}`; });
    return p;
  };
  kb.unlock = () => { window.__locks.push({ unlock: true }); unlock(); };
}

test('Full screen from the menu takes the Esc lock; Esc changes nothing and the cards stay', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(lockRecorder);
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (/Keyboard Lock refused/.test(m.text())) errors.push(m.text()); });
  await page.goto(`${PAGE}?seed=${WIN_SEED}`);
  await page.locator('#title-play').click();
  await page.keyboard.press('q');
  await page.locator('#fullscreen').click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null)).toBe('frame');
  await expect(page.locator('#fullscreen')).toContainText('Leave full screen');
  await expect(page.locator('#menu-veil'), 'the cards are inside the full screen frame').toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__locks.filter(l => l.keys?.includes('Escape') && l.outcome === 'granted').length)).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#menu-veil')).toBeVisible();
  expect(await page.evaluate(() => document.fullscreenElement?.id ?? null)).toBe('frame');
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeHidden();
  expect(await page.evaluate(() => document.fullscreenElement?.id ?? null)).toBe('frame');
  expect(errors).toEqual([]);
  await ctx.close();
});
