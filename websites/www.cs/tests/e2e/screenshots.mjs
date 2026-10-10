// Recaptures each game's Games-page screenshot (games/<id>/screenshot.jpg,
// named by `screenshot:` in its metadata.yaml) from the running site.
//   make screenshots   (E2E_BASE_URL picks the site; default: local docker)
//   make screenshots GAMES="cylon tankity"   only those games
// Each game is played a little first so the picture shows it in action;
// each play step leaves the page ready and may return a 16:9 clip.
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const games = path.resolve(here, '../../games');
const base = process.env.E2E_BASE_URL;
if (!base) throw new Error('Set E2E_BASE_URL to the site root');

const SHOTS = {
  async tankity(page) {
    await page.goto('games/tankity/');
    await page.keyboard.press('n');
    await page.waitForSelector('#shop-veil:not([hidden])');
    await page.click('#shop-next');
    await page.waitForFunction(() => /YOU|Aim/.test(document.getElementById('hud-turn').textContent), null, { timeout: 30_000 });
    // Catch the blast: count impacts, fire, wait for the shell to land, then
    // for its effects to bloom.
    await page.evaluate(() => {
      const play = window.TankityFX.play, impact = play.impact;
      window.__impacts = 0;
      play.impact = (...a) => { window.__impacts++; return impact(...a); };
    });
    await page.keyboard.press('Control');
    await page.waitForFunction(() => window.__impacts > 0, null, { timeout: 15_000 });
    await page.waitForTimeout(250);
    // The game frame, widened to 16:9 around its centre.
    const f = await page.locator('#frame').boundingBox();
    const w = Math.max(f.width, f.height * 16 / 9), h = w * 9 / 16;
    return { x: Math.max(0, f.x + f.width / 2 - w / 2), y: Math.max(0, f.y + f.height / 2 - h / 2), width: w, height: h };
  },
  async crete(page) {
    await page.goto('games/crete/');
    await page.waitForTimeout(800);
    return null;
  },
  async cylon(page) {
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
    return null;
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
