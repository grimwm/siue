// Recaptures every game's pictures from the running site, each named in its
// games/<id>/metadata.yaml:
//   screenshot.jpg  800x450 still on the Games-page card (`screenshot:`)
//   preview.webp    4.5 s looping animation on that card (`preview:`)
//   og.png          1200x630 link preview: the still under the game's name (`image:`)
//   preview.mp4     5-8 s silent 1280x720 H.264 clip of the same play, the
//                   link preview's og:video for apps that play one (`video:`)
// Each game is played a little first so the pictures show it in action, the
// way a player sees it now. Run it whenever a game's look changes:
//   make screenshots                    every game, against local docker
//   make screenshots GAMES="crete"      only those games
//   E2E_BASE_URL=https://www.cs.siue.edu/~wgrim/ make screenshots   the live site
// then `php tools/site-game-pages.php` (the share pages version og.png) and
// commit the pictures. Needs Chrome and ffmpeg (with libwebp, and libx264 or
// libopenh264) on the PATH;
// works on macOS and Linux.
//
// Each game is played twice: once for the still (taken at the moment its
// play step marks) and once recorded through Chrome's screencast for the
// animation and the clip, so taking the still never stalls the recording.
// The card animation is 4.5 s of the recording around the still's moment;
// the clip is all of it (up to 8 s).
import { chromium } from '@playwright/test';
import type { Browser, Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const games = path.resolve(here, '../../games');
const base = process.env.E2E_BASE_URL;
if (!base) throw new Error('Set E2E_BASE_URL to the site root');
const root = base.endsWith('/') ? base : base + '/';

/** The 16:9 part of the 1280x720 viewport the pictures show, or null for all of it. */
type Clip = { x: number; y: number; width: number; height: number } | null;

/** One game's play: `ready` sets the scene and returns the clip; `act` plays
 *  the recorded few seconds, calling `mark` at the moment the still shows. */
interface Shot {
  ready(page: Page): Promise<Clip>;
  act(page: Page, mark: () => Promise<void>): Promise<void>;
  /** Whether the play went wrong (the game ended mid-act), so it is played again. */
  spoiled?(page: Page): Promise<boolean>;
}

/** Tries before a game whose play keeps going wrong is given up on. */
const TRIES = 4;

// Page globals the tankity step reads: its impact counter (the effects engine, TankityFX, is declared in fx-helpers.ts).
declare global {
  interface Window {
    __impacts: number;
  }
}

/** Crete's test hook, as far as these steps read it (the browser specs
 *  declare their own; a global declaration here would clash with them). */
type CreteHook = {
  solve(s: unknown): { solved: boolean; line: { kind: string; dir?: string; tool?: string }[] };
  game: { run: { now: unknown } };
  modern?: { frames(): number; active: boolean };
};

/** The CIC's nuke flies at the cursor and ends the run if it lands within
 *  64 px of it: while one is in flight the cursor keeps to the far corner
 *  from it. Whether it dodged. */
async function dodge(page: Page): Promise<boolean> {
  const nuke = await page.evaluate(() => {
    const el = document.getElementById('cylon-nuke-missile');
    if (!el || !el.classList.contains('is-flying')) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  if (!nuke) return false;
  await page.mouse.move(nuke.x < 640 ? 1250 : 30, nuke.y < 360 ? 700 : 80);
  return true;
}

/** Moves the cursor to (x, y) unless a nuke needs dodging. */
async function aim(page: Page, x: number, y: number): Promise<void> {
  if (!(await dodge(page))) await page.mouse.move(x, y, { steps: 4 });
}

/** Waits `ms`, dodging any nuke on the way. */
async function hold(page: Page, ms: number): Promise<void> {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    await dodge(page);
    await page.waitForTimeout(Math.min(40, Math.max(0, end - Date.now())));
  }
}

const SHOTS: Record<string, Shot> = {
  tankity: {
    async ready(page) {
      await page.goto('games/tankity/');
      await page.keyboard.press('n');
      await page.waitForSelector('#shop-veil:not([hidden])');
      await page.click('#shop-next');
      await page.waitForFunction(() => /YOU|Aim/.test(document.getElementById('hud-turn')!.textContent!), null, { timeout: 30_000 });
      await page.evaluate(() => {
        const play = window.TankityFX.play, impact = play.impact;
        window.__impacts = 0;
        play.impact = (...a: unknown[]) => { window.__impacts++; return impact(...a); };
      });
      await page.waitForTimeout(400);
      // The game frame, widened to 16:9 around its centre.
      const f = (await page.locator('#frame').boundingBox())!;
      const w = Math.max(f.width, f.height * 16 / 9), h = w * 9 / 16;
      return { x: Math.max(0, f.x + f.width / 2 - w / 2), y: Math.max(0, f.y + f.height / 2 - h / 2), width: w, height: h };
    },
    async act(page, mark) {
      // Nudge the barrel, fire, follow the shell down and catch the blast
      // as it blooms.
      await page.keyboard.down('ArrowLeft');
      await page.waitForTimeout(450);
      await page.keyboard.up('ArrowLeft');
      await page.waitForTimeout(200);
      await page.keyboard.press('Control');
      await page.waitForFunction(() => window.__impacts > 0, null, { timeout: 15_000 });
      await page.waitForTimeout(120);
      await mark();
      // The drones answer.
      await page.waitForTimeout(3300);
    },
  },
  crete: {
    async ready(page) {
      // Chapter 1's level 9 from the levels list (no title or chapter card),
      // the Minotaur, relics and HUD on the board.
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('games/crete/');
      await page.click('#title-play');
      await page.click('#chapter-enter');
      await page.waitForSelector('#start-veil:not([hidden])');
      await page.keyboard.press('n');
      await page.click('#level-9');
      await page.click('#start-begin');
      await page.waitForSelector('#start-veil[hidden]', { state: 'attached' });
      // The modern board loads on demand: wait until it has drawn.
      await page.waitForFunction(() => {
        const m = (window as unknown as { __creteTest: CreteHook }).__creteTest.modern;
        return !!m && m.active && m.frames() > 0;
      }, null, { timeout: 30_000 });
      // One step out, so the shot shows more of the level and less of the dark beyond it.
      await page.click('#cam-zoom-out');
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
      return null;
    },
    async act(page, mark) {
      // The opening of the solver's line (from the game's test hook): the
      // hero moves, the Minotaur gives chase, a relic is taken.
      const line = await page.evaluate(() => {
        const t = (window as unknown as { __creteTest: CreteHook }).__creteTest;
        const r = t.solve(t.game.run.now);
        return r.solved ? r.line.map(a => (a.kind === 'move' ? a.dir! : a.kind === 'tool' ? a.tool! : a.kind)) : [];
      });
      if (line.length < 10) throw new Error('crete: the solver found no line for level 9');
      // Moves, waits and the tools' keys (TOOLS in src/puzzle/tiles.ts).
      const KEY: Record<string, string> = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', wait: '.', mirror: 'z', cake: 'x', cow: 'c' };
      await page.waitForTimeout(300);
      for (const [i, step] of line.slice(0, 20).entries()) {
        const key = KEY[step];
        if (!key) throw new Error(`crete: no key for the solver's ${step}`);
        await page.keyboard.press(key);
        await page.waitForTimeout(300);
        if (i === 9) await mark();
      }
      await page.waitForTimeout(300);
    },
  },
  cylon: {
    async ready(page) {
      // A live battle: drones marching, the eye glaring at the cursor. A run
      // that ends early is replayed.
      for (let tries = 0; tries < 4; tries++) {
        await page.goto('./?game=cylon');
        await page.waitForFunction(() => document.body.classList.contains('cylon-game-live'));
        for (let i = 0; i < 180; i++) {
          await aim(page, 420 + Math.sin(i / 6) * 220, 470 + Math.cos(i / 9) * 80);
          await hold(page, 150);
          if (i % 12 === 11) {
            const bot = page.locator('.cylon-bot.is-marching').first();
            if (await bot.count()) await bot.click({ force: true, timeout: 1000 }).catch(() => {});
          }
          if (i > 40 && await page.locator('.cylon-bot.is-marching').count() >= 3) break;
        }
        if (!(await page.locator('#cylon-gameover').isVisible())) return null;
      }
      throw new Error('cylon: every run ended in game over; no pictures taken');
    },
    // A nuke that lands anyway ends the run.
    spoiled: page => page.locator('#cylon-gameover').isVisible(),
    async act(page, mark) {
      // The eye tracks the cursor across the field, a drone is shot down
      // (the still), and a grenade lands on another.
      for (let i = 0; i < 14; i++) {
        await aim(page, 640 + Math.sin(i / 3) * 300, 430 + Math.cos(i / 4) * 120);
        await hold(page, 90);
      }
      const shoot = page.locator('.cylon-bot.is-marching').first();
      if (await shoot.count()) await shoot.click({ force: true, timeout: 1000 }).catch(() => {});
      await hold(page, 350);
      await mark();
      await hold(page, 150);
      const bot = page.locator('.cylon-bot.is-marching').first();
      const box = (await bot.count()) ? await bot.boundingBox() : null;
      await page.keyboard.press('g');
      await page.mouse.click(box ? box.x + box.width / 2 : 640, box ? box.y + box.height / 2 : 360);
      await aim(page, box ? box.x - 120 : 520, box ? box.y + 140 : 480);
      await hold(page, 1360);
      for (let i = 0; i < 12; i++) {
        await aim(page, 640 + Math.cos(i / 3) * 320, 400 + Math.sin(i / 4) * 140);
        await hold(page, 90);
      }
      const last = page.locator('.cylon-bot.is-marching').first();
      if (await last.count()) await last.click({ force: true, timeout: 1000 }).catch(() => {});
      await hold(page, 600);
    },
  },
};

/** The Games-page cards (games.php): each game's name, kicker and colours, for its share picture. */
type Card = { id: string; title: string; kicker: string; background_color: string; accent_color: string };

function ffmpeg(args: string[]): void {
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });
}

/** A fresh 1280x720 page on the site, ready for a game. */
async function openPage(browser: Browser): Promise<Page> {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, baseURL: root });
  await ctx.addInitScript(() => { try { localStorage.setItem('tankity-tutorial', 'done'); } catch (_) { /* fine */ } });
  return ctx.newPage();
}

const esc = (s: string): string => s.replace(/[&<>"]/g, c => `&#${c.charCodeAt(0)};`);

/** The 1200x630 share picture: the game filling the frame, its name and
 *  kicker on a band shaded from the game's own background colour. */
async function sharePicture(browser: Browser, card: Card, still: string, out: string): Promise<void> {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 } });
  const page = await ctx.newPage();
  const img = `data:image/png;base64,${readFileSync(still).toString('base64')}`;
  await page.setContent(`<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Source+Sans+3:wght@600&display=block" rel="stylesheet">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: ${card.background_color}; }
  img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .band { position: absolute; left: 0; right: 0; bottom: 0; padding: 70px 48px 30px;
    background: linear-gradient(to bottom, transparent, ${card.background_color}e6 45%, ${card.background_color}); }
  .band::before { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 6px; background: ${card.accent_color}; }
  h1 { margin: 0; font: 700 54px/1.05 Orbitron, "Segoe UI", sans-serif; color: #fff; letter-spacing: 0.02em;
    text-transform: uppercase; text-shadow: 0 2px 12px #000a; }
  p { margin: 8px 0 0; font: 600 26px/1.2 "Source Sans 3", "Segoe UI", sans-serif; color: ${card.accent_color};
    letter-spacing: 0.04em; text-shadow: 0 1px 8px #000c; }
</style></head><body><img src="${img}" alt=""><div class="band"><h1>${esc(card.title)}</h1>${card.kicker ? `<p>${esc(card.kicker)}</p>` : ''}</div></body></html>`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const raw = out.replace(/\.png$/, '.raw.png');
  await page.screenshot({ path: raw });
  await ctx.close();
  // A 256-colour palette keeps the PNG a fraction of its full-colour size.
  ffmpeg(['-i', raw, '-vf', 'split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a', out]);
  rmSync(raw);
}

type Frame = { t: number; data: string };

/** Plays `shot.act` while Chrome's screencast records the page; the frames, timed, and
 *  the seconds into the recording at which the act marked its still moment. */
async function record(page: Page, shot: Shot): Promise<{ frames: Frame[]; marked: number }> {
  const cdp = await page.context().newCDPSession(page);
  const frames: Frame[] = [];
  cdp.on('Page.screencastFrame', f => {
    frames.push({ t: f.metadata.timestamp ?? Date.now() / 1000, data: f.data });
    cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1280, maxHeight: 720 });
  let markedAt = -1;
  await shot.act(page, async () => { markedAt = frames.length; });
  await cdp.send('Page.stopScreencast');
  await cdp.detach();
  const first = frames[0]?.t ?? 0;
  return { frames, marked: markedAt >= 0 ? (frames[Math.min(markedAt, frames.length - 1)]?.t ?? first) - first : 0 };
}

/** Card animation: size, rate and length (sharp on the ~760 px card, small to
 *  send); its last `fade` seconds fade into its first, so the loop has no
 *  hard cut. */
const ANIM = { width: 640, height: 360, fps: 15, seconds: 4.5, fade: 0.5 };
/** Link-preview clip: size, rate and the longest it may run. */
const CLIP = { width: 1280, height: 720, fps: 30, seconds: 8 };

/** The H.264 encoder this ffmpeg has: libx264 (Homebrew, most builds) or
 *  libopenh264 (Fedora's ffmpeg-free). */
function h264(): string[] {
  const list = execFileSync('ffmpeg', ['-hide_banner', '-encoders'], { encoding: 'utf8' });
  if (/\blibx264\b/.test(list)) return ['-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-maxrate', '1600k', '-bufsize', '3200k', '-profile:v', 'high'];
  if (/\blibopenh264\b/.test(list)) return ['-c:v', 'libopenh264', '-b:v', '1400k', '-maxrate', '1800k', '-profile:v', 'high'];
  throw new Error('ffmpeg has no H.264 encoder (libx264 or libopenh264)');
}

/**
 * Writes the recorded frames for ffmpeg in a temporary folder, as an
 * ffconcat list that shows each frame until the next one arrived, and
 * hands `encode` the list, the recording's length and the crop filter.
 */
function withFrames(frames: Frame[], clip: Clip, encode: (list: string, total: number, crop: string) => void): void {
  if (frames.length < 10) throw new Error(`only ${frames.length} frames recorded`);
  const dir = mkdtempSync(path.join(tmpdir(), 'siue-anim-'));
  try {
    const name = (i: number): string => `f${String(i).padStart(4, '0')}.jpg`;
    const lines = ['ffconcat version 1.0'];
    frames.forEach((f, i) => {
      writeFileSync(path.join(dir, name(i)), Buffer.from(f.data, 'base64'));
      const next = frames[i + 1]?.t ?? f.t + 1 / 30;
      lines.push(`file ${name(i)}`, `duration ${Math.max(0.001, next - f.t).toFixed(4)}`);
    });
    lines.push(`file ${name(frames.length - 1)}`);
    writeFileSync(path.join(dir, 'list.txt'), lines.join('\n') + '\n');
    const total = frames.at(-1)!.t - frames[0]!.t + 1 / 30;
    const c = clip ?? { x: 0, y: 0, width: 1280, height: 720 };
    // Crop in the frame's own pixels (the viewport is 1280 wide).
    const crop = `crop=iw*${c.width / 1280}:iw*${c.height / 1280}:iw*${c.x / 1280}:iw*${c.y / 1280}`;
    encode(path.join(dir, 'list.txt'), total, crop);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** The card's looping animated WebP: ANIM.seconds of the recording around the
 *  still moment (`marked`, which falls about two thirds in), steady rate,
 *  ends faded together. */
function animation(list: string, total: number, crop: string, marked: number, out: string): void {
  const len = Math.min(ANIM.seconds, total), d = ANIM.fade;
  const from = Math.max(0, Math.min(marked - len * 0.65, total - len));
  const graph = [
    `[0]trim=${from.toFixed(3)}:${(from + len).toFixed(3)},setpts=PTS-STARTPTS,fps=${ANIM.fps},${crop},scale=${ANIM.width}:${ANIM.height}:flags=lanczos,format=yuv420p,split=3[a][b][c]`,
    `[a]trim=0:${d},setpts=PTS-STARTPTS[head]`,
    `[b]trim=${d}:${(len - d).toFixed(3)},setpts=PTS-STARTPTS[mid]`,
    `[c]trim=${(len - d).toFixed(3)}:${len.toFixed(3)},setpts=PTS-STARTPTS[tail]`,
    `[tail][head]xfade=transition=fade:duration=${d}:offset=0[x]`,
    '[x][mid]concat=n=2:v=1[out]',
  ].join(';');
  ffmpeg(['-f', 'concat', '-safe', '0', '-i', list, '-filter_complex', graph, '-map', '[out]',
    '-an', '-c:v', 'libwebp_anim', '-q:v', '62', '-compression_level', '6', '-loop', '0', out]);
}

/** The link preview's silent MP4: the whole recording (up to CLIP.seconds), H.264, streamable. */
function previewVideo(list: string, total: number, crop: string, out: string): void {
  if (total < 5) throw new Error(`the recording ran ${total.toFixed(1)} s; the link-preview clip needs 5`);
  const len = Math.min(CLIP.seconds, total);
  ffmpeg(['-f', 'concat', '-safe', '0', '-i', list,
    '-vf', `trim=0:${len.toFixed(3)},fps=${CLIP.fps},${crop},scale=${CLIP.width}:${CLIP.height}:flags=lanczos,format=yuv420p`,
    '-an', ...h264(), '-movflags', '+faststart', out]);
}

/** A metadata.yaml value (top-level `key: value` only, enough for file names). */
function metaFile(id: string, key: string, fallback: string): string {
  const yaml = readFileSync(path.join(games, id, 'metadata.yaml'), 'utf8');
  const m = yaml.match(new RegExp(`^${key}:\\s*([^\\s#]+)`, 'm'));
  return m?.[1] ?? fallback;
}

/** Plays `shot` on a fresh page through `run`, again while it comes out spoiled. */
async function attempt(id: string, shot: Shot, run: (page: Page, clip: Clip) => Promise<void>): Promise<void> {
  for (let i = 0; i < TRIES; i++) {
    const page = await openPage(browser);
    const clip = await shot.ready(page);
    await run(page, clip);
    const spoiled = shot.spoiled ? await shot.spoiled(page) : false;
    await page.context().close();
    if (!spoiled) return;
    console.log(`${id}: the play went wrong; playing again`);
  }
  throw new Error(`${id}: every play went wrong; no pictures taken`);
}

const cards = ((await (await fetch(new URL('games.php', root))).json()) as { games: Card[] }).games;
const browser = await chromium.launch({ channel: 'chrome' });
const only = process.argv.slice(2);
for (const [id, shot] of Object.entries(SHOTS)) {
  if (only.length && !only.includes(id)) continue;
  const card = cards.find(c => c.id === id);
  if (!card) throw new Error(`${id}: not on the Games page (games.php)`);
  const dir = path.join(games, id);

  // The still: the 1280x720 viewport (or the game's 16:9 clip) as a PNG,
  // then the card's 800x450 JPEG and the 1200x630 share picture from it.
  const png = path.join(dir, 'screenshot.png');
  await attempt(id, shot, async (page, clip) => {
    await shot.act(page, async () => { await page.screenshot({ path: png, ...(clip ? { clip } : {}) }); });
  });
  const jpg = path.join(dir, metaFile(id, 'screenshot', 'screenshot.jpg'));
  ffmpeg(['-i', png, '-vf', 'scale=800:450:flags=lanczos', '-q:v', '4', jpg]);
  console.log(`screenshot: ${path.relative(games, jpg)}`);
  const og = path.join(dir, metaFile(id, 'image', 'og.png'));
  await sharePicture(browser, card, png, og);
  rmSync(png);
  console.log(`share picture: ${path.relative(games, og)}`);

  // The animation and the clip, from a second play of the same scene.
  let rec: { frames: Frame[]; marked: number } = { frames: [], marked: 0 }, at: Clip = null;
  await attempt(id, shot, async (page, clip) => { rec = await record(page, shot); at = clip; });
  const webp = path.join(dir, metaFile(id, 'preview', 'preview.webp'));
  const mp4 = path.join(dir, metaFile(id, 'video', 'preview.mp4'));
  withFrames(rec.frames, at, (list, total, crop) => {
    animation(list, total, crop, rec.marked, webp);
    previewVideo(list, total, crop, mp4);
  });
  console.log(`animation: ${path.relative(games, webp)}, clip: ${path.relative(games, mp4)}`);
}
await browser.close();
