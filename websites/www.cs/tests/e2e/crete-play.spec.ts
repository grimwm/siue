// How The Island of Crete plays, through its own buttons and keys and the test hook. Any change to Crete
// must keep this green.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const PAGE = 'games/crete/';
const BUTTON: Record<string, string> = { up: '.mv-up', down: '.mv-down', left: '.mv-left', right: '.mv-right', wait: '#btn-wait' };
const KEY: Record<string, string> = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', wait: '.' };

// The game's own test hook, as far as this spec reads it.
interface Act { kind: string; dir?: string }
interface CreteTest {
  game: { run: { now: { moves: number; hearts: number; outcome: string } } };
  solve(s: unknown): { solved: boolean; line: Act[] };
  initial(level: unknown): unknown;
  trialLevel(i: number): Record<string, unknown>;
}
declare global {
  interface Window { __creteTest: CreteTest }
}

/** Title card, Play, the chapter card, Enter the halls: level 1's start card is up when this returns. */
async function openTrial1(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(PAGE);
  await expect(page.locator('#title-veil')).toBeVisible();
  await page.locator('#title-play').click();
  await expect(page.locator('#chapter-veil'), 'Play opens the chapter card').toBeVisible();
  await expect(page.locator('#chapter-title')).toHaveText('The Outer Halls');
  await page.locator('#chapter-enter').click();
  await expect(page.locator('#chapter-veil')).toBeHidden();
  await expect(page.locator('#start-veil'), 'a level opens on its start card').toBeVisible();
  await expect(page.locator('#start-veil .kicker')).toHaveText('Chapter 1 · Level 1');
  await expect(page.locator('#start-intro')).not.toHaveText('');
  return errors;
}

/** N, then level 1 from the list: the chapter card shows first, and Enter the halls opens level 1. */
async function openLevel1FromList(page: Page): Promise<void> {
  await page.keyboard.press('n');
  await page.locator('#level-1').click();
  await expect(page.locator('#chapter-veil')).toBeVisible();
  await page.locator('#chapter-enter').click();
}

/** Opens level 1 and closes its start card with Begin. */
async function beginTrial1(page: Page): Promise<string[]> {
  const errors = await openTrial1(page);
  await page.locator('#start-begin').click();
  await expect(page.locator('#start-veil')).toBeHidden();
  return errors;
}

/** The winning line from the game's own solver, as action names. */
const line = (page: Page) => page.evaluate(() => {
  const t = window.__creteTest;
  const r = t.solve(t.game.run.now);
  return r.solved ? r.line.map(a => (a.kind === 'move' ? a.dir! : a.kind)) : [];
});
const now = (page: Page) => page.evaluate(() => {
  const s = window.__creteTest.game.run.now;
  return { moves: s.moves, hearts: s.hearts, outcome: s.outcome };
});

test('trial 1 is won through the strip, with an undo on the way', async ({ page }) => {
  const errors = await beginTrial1(page);
  const steps = await line(page);
  expect(steps.length).toBeGreaterThan(0);
  await page.locator(BUTTON[steps[0]!]!).click();
  await page.locator('#btn-undo').click();
  expect((await now(page)).moves).toBe(0);
  for (const s of steps) await page.locator(BUTTON[s]!).click();
  expect((await now(page)).outcome).toBe('won');
  await expect(page.locator('#end-veil')).toBeVisible();
  await expect(page.locator('#hud-moves')).toHaveText(String(steps.length));
  expect(errors).toEqual([]);
});

test('the ending card shows on a win; Q closes it and nothing else opens', async ({ page }) => {
  const errors = await beginTrial1(page);
  for (const s of await line(page)) await page.keyboard.press(KEY[s]!);
  expect((await now(page)).outcome).toBe('won');
  await expect(page.locator('#end-veil')).toBeVisible();
  await expect(page.locator('#end-title')).not.toHaveText('');
  await expect(page.locator('#end-next')).toBeVisible();
  await page.keyboard.press('q');
  await expect(page.locator('#end-veil')).toBeHidden();
  await expect(page.locator('#menu-veil')).toBeHidden();
  expect(errors).toEqual([]);
});

test('walking straight at the exit gets you caught once: a heart lost, thrown back', async ({ page }) => {
  await beginTrial1(page);
  const path = await page.evaluate(() => {
    const t = window.__creteTest;
    const lv = t.trialLevel(0);
    const free = t.solve(t.initial({ ...lv, minotaur: null }));
    return free.line.map(a => a.dir as string);
  });
  for (const d of path) {
    await page.locator(BUTTON[d]!).click();
    if ((await now(page)).hearts < 3) break;
  }
  const s = await now(page);
  expect(s.hearts).toBe(2);
  expect(s.outcome).toBe('playing');
  await expect(page.locator('#hud-hearts')).toHaveText('♥ 2');
});

test('the start card: Begin, Enter, a move key and Q each close it; a move key also moves', async ({ page }) => {
  await openTrial1(page);
  await page.keyboard.press('Enter');
  await expect(page.locator('#start-veil')).toBeHidden();
  expect((await now(page)).moves).toBe(0);

  await page.locator('#btn-restart').click();
  await openLevel1FromList(page);
  await expect(page.locator('#start-veil')).toBeVisible();
  const step = (await line(page)).find(s => s !== 'wait' && s !== 'tool')!; // a move key, not a wait
  await page.keyboard.press(KEY[step]!);
  await expect(page.locator('#start-veil')).toBeHidden();
  expect((await now(page)).moves).toBe(1);

  await openLevel1FromList(page);
  await expect(page.locator('#start-veil')).toBeVisible();
  await page.keyboard.press('q');
  await expect(page.locator('#start-veil')).toBeHidden();
  await expect(page.locator('#menu-veil'), 'Q closes the start card and nothing more').toBeHidden();
});

test('keys: arrows move, U undoes, Q opens the menu and Escape does nothing', async ({ page }) => {
  await beginTrial1(page);
  const steps = await line(page);
  await page.keyboard.press(KEY[steps[0]!]!);
  expect((await now(page)).moves).toBe(1);
  await page.keyboard.press('u');
  expect((await now(page)).moves).toBe(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#menu-veil')).toBeHidden();
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
  const moves0 = (await now(page)).moves;
  await page.keyboard.press(KEY[steps[0]!]!);
  expect((await now(page)).moves, 'game keys wait under the menu').toBe(moves0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#menu-veil')).toBeVisible();
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeHidden();
});

test('Hint, Route, Auto and a tool answer; Restart begins the level again', async ({ page }) => {
  const errors = await beginTrial1(page);
  await page.locator('#btn-hint').click();
  await expect.poll(async () => (await now(page)).moves).toBe(1);
  await page.locator('#btn-route').click();
  await expect(page.locator('#btn-route')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#btn-restart').click();
  expect((await now(page)).moves).toBe(0);
  await page.locator('#btn-auto').click();
  await expect.poll(async () => (await now(page)).outcome).toBe('won');
  await expect(page.locator('#end-veil')).toBeVisible();
  expect(errors).toEqual([]);
});

test('N opens the level list, which has ten levels and ten chapter tabs; M mutes and the menu remembers it', async ({ page }) => {
  const errors = await beginTrial1(page);
  await page.keyboard.press('n');
  await expect(page.locator('#levels-veil')).toBeVisible();
  for (let i = 1; i <= 10; i++) await expect(page.locator(`#level-${i}`)).toBeVisible();
  for (let n = 1; n <= 10; n++) await expect(page.locator(`#levels-tab-${n}`)).toBeVisible();
  await expect(page.locator('#levels-tab-2')).toBeDisabled();
  await page.keyboard.press('q');
  await expect(page.locator('#levels-veil')).toBeHidden();
  await page.keyboard.press('m');
  await page.keyboard.press('q');
  await expect(page.locator('#mute')).toContainText('Muted');
  await page.reload();
  await page.locator('#title-settings').click();
  await expect(page.locator('#mute')).toContainText('Muted');
  expect(errors).toEqual([]);
});

test('a ?seed= link opens Chapter 1\'s card with no title card, and Enter starts level 1', async ({ page }) => {
  await page.goto(`${PAGE}?seed=stefan-1984`);
  await expect(page.locator('#title-veil')).toBeHidden();
  await expect(page.locator('#chapter-veil')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('#chapter-veil')).toBeHidden();
  await expect(page.locator('#hud-trial')).toHaveText('1/10');
  await expect(page.locator('#start-veil')).toBeVisible();
});

test('Enter the halls starts the first level this browser has not cleared', async ({ page }) => {
  await page.goto(PAGE);
  await page.evaluate(() => localStorage.setItem('crete-progress', JSON.stringify({ 'trial-1': { cleared: true, best: 20 }, 'trial-2': { cleared: true, best: null } })));
  await page.reload();
  await page.locator('#title-play').click();
  await page.locator('#chapter-enter').click();
  await expect(page.locator('#hud-trial')).toHaveText('3/10');
  await expect(page.locator('#start-veil')).toBeVisible();
});

test('a win leads on: Next level shows level 2\'s start card, and the list keeps "cleared · best N" through a reload', async ({ page }) => {
  const errors = await beginTrial1(page);
  const steps = await line(page);
  for (const s of steps) await page.keyboard.press(KEY[s]!);
  expect((await now(page)).outcome).toBe('won');
  await expect(page.locator('#end-veil')).toBeVisible();
  await page.locator('#end-next').click();
  await expect(page.locator('#end-veil')).toBeHidden();
  await expect(page.locator('#start-veil')).toBeVisible();
  await expect(page.locator('#hud-trial')).toHaveText('2/10');
  const cleared = `cleared · best ${steps.length}`;
  await page.keyboard.press('n');
  await expect(page.locator('#level-1')).toContainText(cleared);
  await page.reload();
  await page.locator('#title-play').click();
  await page.locator('#chapter-levels').click();
  await expect(page.locator('#level-1')).toContainText(cleared);
  expect(errors).toEqual([]);
});

test('the board paints: the canvas holds drawn pixels', async ({ page }) => {
  await beginTrial1(page);
  await page.waitForSelector('#stage[data-cell]');
  await expect.poll(() => page.evaluate(() => {
    const cv = document.getElementById('stage') as HTMLCanvasElement;
    const px = cv.getContext('2d')!.getImageData(0, 0, cv.width, cv.height).data;
    for (let i = 3; i < px.length; i += 4) if (px[i]! > 0) return true;
    return false;
  })).toBe(true);
});

test('a missing tiles.png says so, loudly, instead of leaving a blank board', async ({ page }) => {
  const logged: string[] = [];
  page.on('console', m => { if (m.type() === 'error') logged.push(m.text()); });
  await page.route('**/fx/sprites/tiles.png*', route => route.abort());
  await page.goto(PAGE);
  await expect(page.locator('#atlas-error')).toHaveText(/did not load/);
  expect(logged.some(t => /tiles\.png/.test(t))).toBe(true);
});

test('Quit in the menu ends the try and shows the title card in a browser tab; Play opens Chapter 1\'s card', async ({ page }) => {
  const errors = await beginTrial1(page);
  await page.keyboard.press('q');
  await page.locator('#quit').click();
  await expect(page.locator('#title-veil')).toBeVisible();
  await expect(page.locator('#menu-veil')).toBeHidden();
  await expect(page.locator('#title-hint')).toHaveCount(0);
  await page.locator('#title-play').click();
  await expect(page.locator('#chapter-veil')).toBeVisible();
  expect(errors).toEqual([]);
});

test('the title card opens Story and Settings, and Q returns to it', async ({ page }) => {
  await page.goto(PAGE);
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
  await page.goto(PAGE);
  await page.locator('#title-play').click();
  await page.locator('#chapter-enter').click();
  await page.keyboard.press('q'); // closes the start card
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
