// Shared helpers for the www.cs end-to-end checks.
import { expect } from '@playwright/test';

/* Injected before any page script: records what the battlefield canvas
   draws, per animation frame, so tests can check motion without hooks in
   the game. Markers:
   - shells: the 1.5 px white core every shell in flight has;
   - arms:   drone aim arms (stroked at alpha 0.75, width 2);
   Neither counts what the effects engine draws (a particle can match either
   look), so the recorder wraps each TankityFX system's draw to know when
   it is inside one.
   - tankY:  the player label's height (the unit's height on the hills).
   Effects (see tankity-fx.spec.mjs), counted on the battlefield ('stage') and
   the firing range ('preview-stage') separately:
   - lighter: times the canvas switched to additive compositing;
   - sheets:  effect sprite-sheet frames drawn (nine-argument drawImage; the
              moon's 192 px frames are the sky and not counted);
   - blobs:   soft glow sprites drawn (five-argument drawImage);
   - rings:   stroked 2 px arcs in a hex colour (the blast disc), kept only
              while rec.watchRings is set: [frame, radius, strokeStyle];
   - skyRects: small (3 px or less) rects painted above y 420 on the battlefield,
              kept while rec.watchSky is set: [x, y, w]; the stars. */
export function recorderScript() {
  try { localStorage.setItem('tankity-tutorial', 'done'); } catch (_) { /* fine */ }
  const rec = {
    frame: 0, shells: [], arms: [], tankY: [],
    lighter: 0, sheets: 0, blobs: 0, pv: { lighter: 0, sheets: 0, blobs: 0 }, rings: [], watchRings: false,
    skyRects: [], watchSky: false,
  };
  window.__rec = rec;
  const raf = window.requestAnimationFrame.bind(window);
  rec.times = {}; // frame number -> its timestamp, so motion can be judged per second
  window.requestAnimationFrame = cb => raf(ts => { rec.frame++; rec.times[rec.frame] = ts; cb(ts); });
  const P = CanvasRenderingContext2D.prototype;
  const onStage = c => c.canvas && c.canvas.id === 'stage';
  const where = c => (c.canvas && c.canvas.id === 'stage' ? rec : c.canvas && c.canvas.id === 'preview-stage' ? rec.pv : null);
  // Effects-engine draws, told apart by wrapping each system's draw.
  let inFx = 0, fxApi;
  Object.defineProperty(window, 'TankityFX', {
    configurable: true,
    get() { return fxApi; },
    set(api) {
      const create = api.createSystem;
      api.createSystem = function (...a) {
        const sys = create.apply(this, a), draw = sys.draw;
        sys.draw = function (...b) { inFx++; try { return draw.apply(this, b); } finally { inFx--; } };
        return sys;
      };
      fxApi = api;
    },
  });
  const arc = P.arc, moveTo = P.moveTo, lineTo = P.lineTo, fillText = P.fillText, drawImage = P.drawImage, fillRect = P.fillRect;
  P.fillRect = function (x, y, w, h) {
    if (rec.watchSky && onStage(this) && w <= 3 && h <= 3 && y < 420 && rec.skyRects.length < 4000) rec.skyRects.push([x, y, w]);
    return fillRect.call(this, x, y, w, h);
  };
  const gco = Object.getOwnPropertyDescriptor(P, 'globalCompositeOperation');
  Object.defineProperty(P, 'globalCompositeOperation', {
    configurable: true,
    get() { return gco.get.call(this); },
    set(v) { const w = where(this); if (w && v === 'lighter') w.lighter++; gco.set.call(this, v); },
  });
  P.drawImage = function (img, ...a) {
    const w = where(this);
    if (w) { if (a.length === 8) { if (a[2] !== 192) w.sheets++; } else if (a.length === 4) w.blobs++; } // 192 px frames are the moon, not an effect
    return drawImage.call(this, img, ...a);
  };
  let from = null;
  P.arc = function (x, y, r, ...rest) {
    if (!inFx && onStage(this) && r === 1.5 && this.fillStyle === '#ffffff') rec.shells.push([rec.frame, x, y]);
    if (rec.watchRings && onStage(this) && this.lineWidth === 2 && /^#/.test(this.strokeStyle)) rec.rings.push([rec.frame, r, this.strokeStyle]);
    return arc.call(this, x, y, r, ...rest);
  };
  P.moveTo = function (x, y) { from = [x, y]; return moveTo.call(this, x, y); };
  P.lineTo = function (x, y) {
    if (!inFx && onStage(this) && this.globalAlpha === 0.75 && this.lineWidth === 2 && from) rec.arms.push([rec.frame, from[0], from[1], x, y]);
    return lineTo.call(this, x, y);
  };
  P.fillText = function (t, x, y, ...rest) {
    if (onStage(this) && t === 'TANK') rec.tankY.push([rec.frame, y]);
    return fillText.call(this, t, x, y, ...rest);
  };
}

export async function newPlayer(browser, path = 'games/tankity/') {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  await ctx.addInitScript(recorderScript);
  const page = await ctx.newPage();
  // E2E_CPU_THROTTLE=4 runs the page at a quarter speed, like a busy CI
  // runner, to shake out timing assumptions.
  const slow = Number(process.env.E2E_CPU_THROTTLE || 0);
  if (slow > 1) await (await ctx.newCDPSession(page)).send('Emulation.setCPUThrottlingRate', { rate: slow });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(path);
  await page.waitForTimeout(600);
  return { ctx, page, errors };
}

export const hud = (page, id) => page.textContent('#' + id);

/* Solo match: deal in, leave the shop, wait for our first aim. */
export async function startSolo(page) {
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  await page.click('#shop-next');
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 30_000 }).toMatch(/YOU|Aim/);
}

/* Hold the barrel keys until the HUD shows the wanted angle. */
export async function aimTo(page, angle) {
  for (let i = 0; i < 40; i++) {
    const now = parseInt(await hud(page, 'hud-angle'), 10);
    if (Math.abs(now - angle) <= 2) return now;
    // Which key raises the angle depends on the way the tank faces, so try
    // one and keep it if it moved the right way.
    const key = i % 2 === 0 ? 'ArrowLeft' : 'ArrowRight';
    await page.keyboard.down(key);
    await page.waitForTimeout(Math.min(400, Math.abs(now - angle) * 22));
    await page.keyboard.up(key);
    const after = parseInt(await hud(page, 'hud-angle'), 10);
    if (Math.abs(after - angle) < Math.abs(now - angle)) i--; // keep this key next round
  }
  return parseInt(await hud(page, 'hud-angle'), 10);
}

export async function setPower(page, power) {
  for (let i = 0; i < 30; i++) {
    const now = parseInt(await hud(page, 'hud-power'), 10);
    if (Math.abs(now - power) <= 2) return now;
    const key = now < power ? 'ArrowUp' : 'ArrowDown';
    await page.keyboard.down(key);
    await page.waitForTimeout(Math.min(400, Math.abs(now - power) * 20));
    await page.keyboard.up(key);
  }
  return parseInt(await hud(page, 'hud-power'), 10);
}

export const rec = page => page.evaluate(() => window.__rec);
export const resetRec = page => page.evaluate(() => {
  const r = window.__rec;
  r.shells = []; r.arms = []; r.tankY = []; r.rings = []; r.skyRects = [];
  r.lighter = r.sheets = r.blobs = 0;
  r.pv.lighter = r.pv.sheets = r.pv.blobs = 0;
});

/* Per-frame positions of the first moving shell core. Small white dots that
   sit still across frames (stars) are not shells and drop out. */
export function shellTrack(shells) {
  const seen = new Map();
  for (const [, x, y] of shells) {
    const k = `${Math.round(x)},${Math.round(y)}`;
    seen.set(k, (seen.get(k) || 0) + 1);
  }
  const byFrame = new Map();
  for (const [f, x, y] of shells) {
    if (seen.get(`${Math.round(x)},${Math.round(y)}`) > 3) continue;
    if (!byFrame.has(f)) byFrame.set(f, [x, y]);
  }
  return [...byFrame.entries()].sort((a, b) => a[0] - b[0]).map(([, p]) => p);
}

/* Largest distance of any track point from the straight chord between its
   ends: a ballistic arc bows well away from it, a straight tracer does not. */
export function bowFromChord(track) {
  if (track.length < 3) return 0;
  const [x0, y0] = track[0], [x1, y1] = track[track.length - 1];
  const len = Math.hypot(x1 - x0, y1 - y0) || 1;
  return Math.max(...track.map(([x, y]) => Math.abs((x1 - x0) * (y0 - y) - (x0 - x) * (y1 - y0)) / len));
}

/* Two players in one room, host first; returns both pages started.
   beforeStart({host, guest, roomState, code}) runs in the lobby, before the host starts. */
export async function roomPair(browser, { beforeStart } = {}) {
  const host = await newPlayer(browser);
  const guest = await newPlayer(browser);
  const roomState = { host: [], guest: [] };
  for (const [name, p] of [['host', host.page], ['guest', guest.page]]) {
    p.on('response', async r => {
      if (!r.url().includes('rooms.php')) return;
      try { const b = await r.json(); if (b && b.room) roomState[name].push(b.room); } catch (_) { /* not json */ }
    });
  }
  await host.page.keyboard.press('o');
  await host.page.fill('#host-initials', 'abc');
  await host.page.click('#host-go');
  await host.page.waitForSelector('#lobby-room:not([hidden])');
  await expect.poll(() => hud(host.page, 'lobby-code')).toMatch(/^[A-Z0-9]{4}$/);
  const code = (await hud(host.page, 'lobby-code')).trim();
  await guest.page.keyboard.press('o');
  await guest.page.fill('#join-code', code);
  await guest.page.fill('#join-initials', 'zed');
  await guest.page.click('#join-go');
  await guest.page.waitForSelector('#lobby-room:not([hidden])');
  // The host hears about the guest on its next poll.
  await expect.poll(() => hud(host.page, 'log'), { timeout: 10_000 }).toMatch(/zed rolled into the room/i);
  if (beforeStart) await beforeStart({ host, guest, roomState, code });
  await host.page.click('#lobby-start');
  // Both clients are in the match once each shows the host's turn; events
  // from before a client's first sync are history and never replay.
  await expect.poll(() => hud(host.page, 'hud-turn'), { timeout: 30_000 }).toMatch(/YOU\. Aim!/);
  await expect.poll(() => hud(guest.page, 'hud-turn'), { timeout: 30_000 }).toMatch(/abc aiming/);
  // Told once in the lobby, never again when the match starts.
  expect(((await hud(host.page, 'log')) || '').match(/zed rolled into the room/gi) || []).toHaveLength(1);
  return { host, guest, roomState, code };
}

export const lastRoom = list => list[list.length - 1];

/* Hold one barrel key for at least ms, then on until the barrel reaches a
   stop (a slow machine swings it fewer degrees per wall-clock second), up to
   15 s; samples the HUD angle throughout. */
export async function holdBarrel(page, key, ms) {
  const read = async () => parseInt(await hud(page, 'hud-angle'), 10);
  const seen = [await read()];
  await page.keyboard.down(key);
  const start = Date.now();
  while (Date.now() - start < 15_000) {
    await page.waitForTimeout(80);
    const a = await read();
    seen.push(a);
    if (Date.now() - start >= ms && (a === 10 || a === 170)) break;
  }
  await page.keyboard.up(key);
  seen.push(await read());
  return seen;
}

/* A held key swings one way only, all the way to a stop (10 or 170). */
export function expectFullSwing(seen) {
  const dir = Math.sign(seen[seen.length - 1] - seen[0]);
  expect(dir, `the barrel moved: ${seen.join(' ')}`).not.toBe(0);
  for (let i = 1; i < seen.length; i++) {
    expect((seen[i] - seen[i - 1]) * dir, `no snap back: ${seen.join(' ')}`).toBeGreaterThanOrEqual(0);
  }
  expect([10, 170], `reached a stop: ${seen.join(' ')}`).toContain(seen[seen.length - 1]);
}
