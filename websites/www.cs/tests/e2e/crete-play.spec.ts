// How The Island of Crete plays, through its own buttons and keys and the test hook. Any change to Crete
// must keep this green.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/** Every Dictionary entry met before the page loads, so no first card (src/ui/meet.tsx) stops these specs' levels. */
const allMet = (): void => localStorage.setItem('crete-met', '["*"]');
/** The Dictionary's specs (tagged @firsts) start with nothing met. */
test.beforeEach(async ({ context }, info) => { if (!info.tags.includes('@firsts')) await context.addInitScript(allMet); });

/** These specs read the classic board's pixels and cells, so they pin the Look setting before the page loads. */
const pinClassic = (): void => localStorage.setItem('crete-look', 'classic');

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

/** Title card, New Game, the chapter card, Enter the Halls: level 1's start card is up when this returns. */
async function openTrial1(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(pinClassic);
  await page.goto(PAGE);
  await expect(page.locator('#title-veil')).toBeVisible();
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await expect(page.locator('#chapter-veil'), 'New Game opens the chapter card').toBeVisible();
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
/** A one-finger touch swipe of (dx, dy) CSS pixels across the middle of `sel`, as pointer events. */
async function swipe(page: Page, sel: string, dx: number, dy: number): Promise<void> {
  await page.evaluate(([sel, dx, dy]) => {
    const el = document.querySelector(sel as string)!;
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const ev = (type: string, px: number, py: number) => el.dispatchEvent(new PointerEvent(type, {
      pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: px, clientY: py, bubbles: true, button: 0,
    }));
    ev('pointerdown', x, y);
    for (let i = 1; i <= 5; i++) ev('pointermove', x + (dx as number) * i / 5, y + (dy as number) * i / 5);
    ev('pointerup', x + (dx as number), y + (dy as number));
  }, [sel, dx, dy] as const);
}

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
  await expect(page.locator('#levels-tab-3')).toBeEnabled();
  await expect(page.locator('#levels-tab-4')).toBeDisabled();
  await page.keyboard.press('q');
  await expect(page.locator('#levels-veil')).toBeHidden();
  await page.keyboard.press('m');
  await page.keyboard.press('q');
  await expect(page.locator('#mute')).toHaveAttribute('aria-checked', 'false');
  await page.reload();
  await page.locator('#title-settings').click();
  await expect(page.locator('#mute')).toHaveAttribute('aria-checked', 'false');
  expect(errors).toEqual([]);
});

test('a ?seed= link opens Chapter 1\'s card with no title card, and Enter starts level 1', async ({ page }) => {
  await page.addInitScript(pinClassic);
  await page.goto(`${PAGE}?seed=stefan-1984`);
  await expect(page.locator('#title-veil')).toBeHidden();
  await expect(page.locator('#chapter-veil')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('#chapter-veil')).toBeHidden();
  await expect(page.locator('#hud-trial')).toHaveText('Ch. 1 • Level 1/10');
  await expect(page.locator('#start-veil')).toBeVisible();
});

test('a new game starts at Chapter 1, Level 1 whatever is cleared; Levels starts Chapter 2, Level 3 there', async ({ page }) => {
  await page.addInitScript(pinClassic);
  await page.goto(PAGE);
  const ch1 = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`trial-${i + 1}`, { cleared: true, best: 30 }]));
  await page.evaluate(p => localStorage.setItem('crete-progress', JSON.stringify(p)), { ...ch1, 'ch2-1': { cleared: true, best: 12 } });
  await page.reload();
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await expect(page.locator('#chapter-kicker')).toHaveText('Chapter 1 of 10');
  await expect(page.locator('#chapter-title')).toHaveText('The Outer Halls');
  await page.locator('#chapter-enter').click();
  await expect(page.locator('#hud-trial')).toHaveText('Ch. 1 • Level 1/10');
  await expect(page.locator('#start-veil')).toBeVisible();
  await page.keyboard.press('n');
  await page.locator('#levels-tab-2').click();
  await page.locator('#level-3').click();
  await expect(page.locator('#hud-trial')).toHaveText('Ch. 2 • Level 3/10');
  await expect(page.locator('#start-veil')).toBeVisible();
});

test('Continue on the title card goes to the first level not cleared, and is not offered on a fresh browser', async ({ page }) => {
  await page.addInitScript(pinClassic);
  await page.goto(PAGE);
  await expect(page.locator('#title-continue')).toHaveCount(0);
  const ch1 = Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`trial-${i + 1}`, { cleared: true, best: 30 }]));
  await page.evaluate(p => localStorage.setItem('crete-progress', JSON.stringify(p)), { ...ch1, 'ch2-1': { cleared: true, best: 12 }, 'ch2-2': { cleared: true, best: 17 } });
  await page.reload();
  await expect(page.locator('#title-continue')).toContainText('Continue');
  await expect(page.locator('#title-continue')).toHaveAttribute('aria-label', 'Continue at Chapter 2, Level 3');
  await page.keyboard.press('Enter');
  await expect(page.locator('#chapter-title')).toHaveText('The Winding Ways');
  await page.keyboard.press('Enter');
  await expect(page.locator('#hud-trial')).toHaveText('Ch. 2 • Level 3/10');
  await expect(page.locator('#hud-trial')).toHaveAttribute('aria-label', /^Chapter 2, Level 3: /);
  await page.keyboard.press('Enter');
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil .kicker')).toHaveText('Ch. 2 • Level 3/10');
});

test('a win on the shortest line is perfect; Next Level shows level 2\'s start card, and the list keeps the best through a reload', async ({ page }) => {
  const errors = await beginTrial1(page);
  const steps = await line(page);
  for (const s of steps) await page.keyboard.press(KEY[s]!);
  expect((await now(page)).outcome).toBe('won');
  await expect(page.locator('#end-veil')).toBeVisible();
  await expect(page.locator('#end-score')).toHaveText(`${steps.length} moves · best possible ${steps.length} · perfect`);
  await page.locator('#end-next').click();
  await expect(page.locator('#end-veil')).toBeHidden();
  await expect(page.locator('#start-veil')).toBeVisible();
  await expect(page.locator('#hud-trial')).toHaveText('Ch. 1 • Level 2/10');
  const cleared = `cleared · your best ${steps.length} · best possible ${steps.length} · perfect`;
  await page.keyboard.press('n');
  await expect(page.locator('#level-1')).toContainText(cleared);
  await page.reload();
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
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

test('the Route steps one square at a time, with an arrow on each square pointing the way and the next step\'s in gold', async ({ page }) => {
  const errors = await beginTrial1(page);
  await page.waitForSelector('#stage[data-cell]');
  await page.keyboard.press('v');
  await expect.poll(() => page.evaluate(() => {
    const t = (window.__creteTest.game as unknown as { thread: { r: number; c: number }[] | null }).thread;
    return t ? t.length : 0;
  })).toBeGreaterThan(1);
  const seen = await page.evaluate(() => {
    const g = window.__creteTest.game as unknown as { thread: { r: number; c: number; jump?: true }[]; run: { now: { level: { cols: number; rows: number } } } };
    const t = g.thread;
    const { cols, rows } = g.run.now.level;
    const cv = document.getElementById('stage') as HTMLCanvasElement;
    const cell = cv.width / cols;
    const top = cv.height - rows * cell;
    const px = cv.getContext('2d')!.getImageData(0, 0, cv.width, cv.height).data;
    const bad: string[] = [];
    let arrows = 0, gold = 0;
    const near = (o: number, rgb: number[]) => rgb.every((v, k) => Math.abs(px[o + k]! - v) < 12);
    for (let i = 0; i + 1 < t.length; i++) {
      const a = t[i]!, b = t[i + 1]!;
      if (!b.jump && Math.abs(a.r - b.r) + Math.abs(a.c - b.c) !== 1) bad.push(`${a.r},${a.c} → ${b.r},${b.c}`);
      if (b.jump) continue;
      // The arrow's fill covers the point a fifth of a cell from its square's centre toward the next square: gold
      // over Theseus for the next step, the held-back red on every square after it.
      const y = (a.r + 0.5 + (b.r - a.r) * 0.2) * cell + top, x = (a.c + 0.5 + (b.c - a.c) * 0.2) * cell;
      const o = (Math.floor(y) * cv.width + Math.floor(x)) * 4;
      if (i === 0 ? near(o, [0xff, 0xd2, 0x3f]) : near(o, [0xbb, 0x41, 0x31])) i === 0 ? gold++ : arrows++;
    }
    return { bad, arrows, gold, steps: t.length - 1 };
  });
  expect(seen.bad, 'every step is to a neighbouring square').toEqual([]);
  expect(seen.gold, 'the next step\'s arrow is gold, over Theseus').toBe(1);
  expect(seen.arrows, 'an arrow on every square after it that steps on').toBe(seen.steps - 1);
  expect(errors).toEqual([]);
});

test('a missing tiles.png says so, loudly, instead of leaving a blank board', async ({ page }) => {
  const logged: string[] = [];
  page.on('console', m => { if (m.type() === 'error') logged.push(m.text()); });
  await page.route('**/fx/sprites/tiles.png*', route => route.abort());
  await page.addInitScript(pinClassic);
  await page.goto(PAGE);
  await expect(page.locator('#atlas-error')).toHaveText(/did not load/);
  expect(logged.some(t => /tiles\.png/.test(t))).toBe(true);
});

test('Quit in the menu ends the try and shows the title card in a browser tab; New Game opens Chapter 1\'s card', async ({ page }) => {
  const errors = await beginTrial1(page);
  await page.keyboard.press('q');
  await page.locator('#quit').click();
  await expect(page.locator('#title-veil')).toBeVisible();
  await expect(page.locator('#menu-veil')).toBeHidden();
  await expect(page.locator('#title-hint')).toHaveCount(0);
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await expect(page.locator('#chapter-veil')).toBeVisible();
  expect(errors).toEqual([]);
});

test('the title card opens Story and Settings, and Q returns to it', async ({ page }) => {
  await page.addInitScript(pinClassic);
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
  // I and Q do what the Story and Settings buttons do; Q leaves the menu again.
  await page.keyboard.press('i');
  await expect(page.locator('#story-veil')).toBeVisible();
  await page.keyboard.press('q');
  await expect(page.locator('#title-veil')).toBeVisible();
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeHidden();
  await expect(page.locator('#title-veil')).toBeVisible();
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
  await ctx.addInitScript(allMet);
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (/Keyboard Lock refused/.test(m.text())) errors.push(m.text()); });
  await page.addInitScript(pinClassic);
  await page.goto(PAGE);
  await page.locator('#title-play').click();
  await page.locator('#pick-enter').click();
  await page.locator('#chapter-enter').click();
  await page.keyboard.press('q'); // closes the start card
  await page.keyboard.press('q');
  await page.locator('#fullscreen').click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.id ?? null)).toBe('frame');
  await expect(page.locator('#fullscreen')).toHaveAttribute('aria-checked', 'true');
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

test('a finger swipe on the classic board moves Theseus that way', async ({ page }) => {
  const errors = await beginTrial1(page);
  const from = await now(page);
  for (const [dx, dy] of [[60, 0], [-60, 0], [0, 60], [0, -60]]) {
    await swipe(page, '#stage', dx!, dy!);
    if ((await now(page)).moves > from.moves) break;
  }
  expect((await now(page)).moves, 'one swipe, one move').toBe(from.moves + 1);
  expect(errors).toEqual([]);
});

/* ---- the first cards, the banner and the Dictionary, from nothing met ---- */
/** Two mirrors in a hall, played as a shared level (a try from the editor shows no first cards). */
const MIRRORS = ['title: Two Mirrors', 'intro: Two mirrors lie on the floor.', '', '#########', '#P.z.z.E#', '#########', ''].join('\n');
type FirstsHook = { __creteTest: { parse(text: string): unknown; playLevel(level: unknown, opts: unknown): void } };

/** The mirrors' level open on the real page, its start card begun. */
async function openMirrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(pinClassic);
  await page.goto(PAGE);
  await expect(page.locator('#title-veil')).toBeVisible();
  await page.evaluate(text => {
    const t = (window as unknown as FirstsHook).__creteTest;
    t.playLevel(t.parse(text), { outside: { kind: 'shared', name: 'Two Mirrors', best: null } });
  }, MIRRORS);
  await expect(page.locator('#start-veil'), 'the level opens on its start card').toBeVisible();
  await expect(page.locator('#meet-veil'), 'and no card for the exit').toBeHidden();
  await page.locator('#start-begin').click();
  return errors;
}

test('the first mirror taken shows its card; the second, a banner; the Dictionary\'s Backpack lists both', { tag: '@firsts' }, async ({ page }) => {
  const errors = await openMirrors(page);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#meet-veil'), 'the first mirror stops play with its card').toBeVisible();
  await expect(page.locator('#meet-title')).toHaveText("Medusa's Mirror");
  await expect(page.locator('#meet-effect')).toContainText('Press Z to use it.');
  await expect(page.locator('#meet-veil .sprite-layer').first(), 'its picture is drawn from the atlas').toBeVisible();
  await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(() => (window as unknown as { __creteTest: CreteTest }).__creteTest.game.run.now.moves), 'play waits while the card is up').toBe(2);
  await page.keyboard.press('Enter');
  await expect(page.locator('#meet-veil')).toBeHidden();
  await expect(page.locator('#banner .banner-row')).toHaveCount(0);

  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#meet-veil'), 'no card for the second mirror').toBeHidden();
  await expect(page.locator('#banner .banner-row[data-entry="mirror"]'), 'a banner for it').toBeVisible();
  await expect(page.locator('#banner')).toContainText("Medusa's Mirror");
  await expect(page.locator('#banner .banner-row'), 'the banner goes on its own').toHaveCount(0, { timeout: 5000 });

  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
  await page.locator('#menu-dictionary').click();
  await expect(page.locator('#dict-veil')).toBeVisible();
  await expect(page.locator('#dict-tab-backpack')).toHaveAttribute('aria-pressed', 'true');
  const held = page.locator('#dict-backpack .dict-row');
  await expect(held).toHaveCount(1);
  await expect(held.first()).toHaveAttribute('data-entry', 'mirror');
  await expect(held.first()).toContainText('× 2');
  await page.locator('#dict-tab-entries').click();
  await expect(page.locator('#dict-entries .dict-row[data-entry="mirror"]:not(.locked)')).toHaveCount(1);
  await expect(page.locator('#dict-entries .dict-row[data-entry="water"]:not(.locked)'), 'a hazard is readable unmet').toHaveCount(1);
  await expect(page.locator('#dict-entries .dict-row[data-entry="fake-wall"].locked'), 'a hidden wall is not').toHaveCount(1);
  await expect(page.locator('#dict-entries .dict-row.locked').first()).toHaveText('???');
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil'), 'Q goes back to the menu').toBeVisible();
  expect(errors).toEqual([]);
});
