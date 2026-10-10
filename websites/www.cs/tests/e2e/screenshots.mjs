// Recaptures each game's Games-page screenshot (games/<id>/screenshot.jpg,
// named by `screenshot:` in its metadata.yaml) from the running site.
//   make screenshots   (E2E_BASE_URL picks the site; default: local docker)
// Each game is played a little first so the picture shows it in action;
// each play step leaves the page ready for a viewport shot.
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
    await page.keyboard.press('Control');
    await page.waitForTimeout(1100); // a shell in the air
    return null;
  },
  async crete(page) {
    await page.goto('games/crete/');
    await page.waitForTimeout(800);
    return null;
  },
  async cylon(page) {
    await page.goto('./?game=cylon');
    await page.waitForFunction(() => document.body.classList.contains('cylon-game-live'));
    // Give the drones time to arrive, with the eye glaring at the cursor.
    for (let i = 0; i < 40; i++) { await page.mouse.move(380 + (i % 10) * 30, 470 - (i % 10) * 6); await page.waitForTimeout(200); }
    return null;
  },
};

const browser = await chromium.launch({ channel: 'chrome' });
for (const [id, play] of Object.entries(SHOTS)) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, baseURL: base.endsWith('/') ? base : base + '/' });
  await ctx.addInitScript(() => { try { localStorage.setItem('tankity-tutorial', 'done'); } catch (_) { /* fine */ } });
  const page = await ctx.newPage();
  await play(page);
  const png = path.join(games, id, 'screenshot.png');
  await page.screenshot({ path: png }); // the 1280x720 viewport: already 16:9
  // 800x450 JPEG keeps each card picture small.
  const jpg = path.join(games, id, 'screenshot.jpg');
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '78', '-z', '450', '800', png, '--out', jpg], { stdio: 'ignore' });
  execFileSync('rm', [png]);
  console.log(`screenshot: games/${id}/screenshot.jpg`);
  await ctx.close();
}
await browser.close();
