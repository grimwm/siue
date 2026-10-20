// Recaptures each game's Games-page screenshot (games/<id>/screenshot.jpg,
// named by `screenshot:` in its metadata.yaml) from the running site.
//   make screenshots   (E2E_BASE_URL picks the site; default: local docker)
//   make screenshots GAMES="cylon tankity"   only those games
// Each game is played a little first so the picture shows it in action;
// each play step leaves the page ready and may return a 16:9 clip.
import { chromium } from '@playwright/test';
import type { Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const games = path.resolve(here, '../../games');
const base = process.env.E2E_BASE_URL;
if (!base) throw new Error('Set E2E_BASE_URL to the site root');

/** The clip to screenshot, or null for the whole viewport. */
type Clip = { x: number; y: number; width: number; height: number } | null;

// Page globals the tankity step reads: its impact counter (the effects engine, TankityFX, is declared in fx-helpers.ts).
declare global {
  interface Window {
    __impacts: number;
  }
}

const SHOTS: Record<string, (page: Page) => Promise<Clip>> = {
  async tankity(page: Page): Promise<Clip> {
    await page.goto('games/tankity/');
    await page.keyboard.press('n');
    await page.waitForSelector('#shop-veil:not([hidden])');
    await page.click('#shop-next');
    await page.waitForFunction(() => /YOU|Aim/.test(document.getElementById('hud-turn')!.textContent!), null, { timeout: 30_000 });
    // Catch the blast: count impacts, fire, wait for the shell to land, then
    // for its effects to bloom.
    await page.evaluate(() => {
      const play = window.TankityFX.play, impact = play.impact;
      window.__impacts = 0;
      play.impact = (...a: unknown[]) => { window.__impacts++; return impact(...a); };
    });
    await page.keyboard.press('Control');
    await page.waitForFunction(() => window.__impacts > 0, null, { timeout: 15_000 });
    await page.waitForTimeout(250);
    // The game frame, widened to 16:9 around its centre.
    const f = (await page.locator('#frame').boundingBox())!;
    const w = Math.max(f.width, f.height * 16 / 9), h = w * 9 / 16;
    return { x: Math.max(0, f.x + f.width / 2 - w / 2), y: Math.max(0, f.y + f.height / 2 - h / 2), width: w, height: h };
  },
  async crete(page: Page): Promise<Clip> {
    // Chapter 1 in action: through the title and chapter cards, into level 9
    // from the levels list, then the opening of the solver's line (from the
    // game's test hook), so the picture shows the labyrinth mid-game, a relic
    // already taken, instead of the title card the page opens on.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('games/crete/');
    await page.click('#title-play');
    await page.click('#chapter-enter');
    await page.waitForSelector('#start-veil:not([hidden])');
    await page.keyboard.press('n');
    await page.click('#level-9');
    await page.click('#start-begin');
    await page.waitForSelector('#start-veil[hidden]', { state: 'attached' });
    const line = await page.evaluate(() => {
      // Crete's test hook, as far as this step reads it (the browser specs
      // declare their own; a global declaration here would clash with them).
      const t = (window as unknown as {
        __creteTest: {
          solve(s: unknown): { solved: boolean; line: { kind: string; dir?: string }[] };
          game: { run: { now: unknown } };
        };
      }).__creteTest;
      const r = t.solve(t.game.run.now);
      return r.solved ? r.line.map(a => (a.kind === 'move' ? a.dir! : a.kind)) : [];
    });
    const KEY: Record<string, string> = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', wait: '.' };
    for (const step of line.slice(0, 10)) {
      const key = KEY[step];
      if (key) await page.keyboard.press(key);
      await page.waitForTimeout(160);
    }
    await page.waitForTimeout(350);
    return null;
  },
  async cylon(page: Page): Promise<Clip> {
    // A live battle: several drones marching, a few already knocked out, the
    // eye glaring at the cursor. A run that ends early is replayed.
    for (let tries = 0; tries < 4; tries++) {
      await page.goto('./?game=cylon');
      await page.waitForFunction(() => document.body.classList.contains('cylon-game-live'));
      for (let i = 0; i < 180; i++) {
        await page.mouse.move(420 + Math.sin(i / 6) * 220, 470 + Math.cos(i / 9) * 80);
        await page.waitForTimeout(150);
        if (i % 12 === 11) {
          const bot = page.locator('.cylon-bot.is-marching').first();
          if (await bot.count()) await bot.click({ force: true, timeout: 1000 }).catch(() => {});
        }
        const bots = await page.locator('.cylon-bot.is-marching').count();
        if (i > 40 && bots >= 3) break;
      }
      if (await page.locator('#cylon-gameover').isVisible()) continue;
      // A grenade on the nearest drone, caught mid-blast.
      const bot = page.locator('.cylon-bot.is-marching').first();
      const box = (await bot.count()) ? await bot.boundingBox() : null;
      await page.keyboard.press('g');
      await page.mouse.click(box ? box.x + box.width / 2 : 640, box ? box.y + box.height / 2 : 360);
      await page.mouse.move(box ? box.x - 120 : 520, box ? box.y + 140 : 480);
      await page.waitForTimeout(260);
      if (!(await page.locator('#cylon-gameover').isVisible())) return null;
    }
    throw new Error('cylon: every run ended in game over; no screenshot taken');
  },
};

const browser = await chromium.launch({ channel: 'chrome' });
const only = process.argv.slice(2);
for (const [id, play] of Object.entries(SHOTS)) {
  if (only.length && !only.includes(id)) continue;
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, baseURL: base.endsWith('/') ? base : base + '/' });
  await ctx.addInitScript(() => { try { localStorage.setItem('tankity-tutorial', 'done'); } catch (_) { /* fine */ } });
  const page = await ctx.newPage();
  const clip = await play(page);
  const png = path.join(games, id, 'screenshot.png');
  // A 16:9 clip from the game, or the 1280x720 viewport (already 16:9).
  await page.screenshot({ path: png, ...(clip ? { clip } : {}) });
  // 800x450 JPEG keeps each card picture small.
  const jpg = path.join(games, id, 'screenshot.jpg');
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '78', '-z', '450', '800', png, '--out', jpg], { stdio: 'ignore' });
  execFileSync('rm', [png]);
  console.log(`screenshot: games/${id}/screenshot.jpg`);
  await ctx.close();
}
await browser.close();
