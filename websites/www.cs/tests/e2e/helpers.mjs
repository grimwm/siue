// Shared helpers for the www.cs end-to-end checks.
import { expect } from '@playwright/test';

/* Injected before any page script: records what the battlefield canvas
   draws, per animation frame, so tests can check motion without hooks in
   the game. Markers:
   - shells: every shell in flight on the battlefield: its body drawn by
             TankityFX.drawBody (the rendered sprite), or the 1.5 px white
             core of the plain disc drawn before the sprite has loaded;
   - arms:   drone aim arms (stroked at alpha 0.75, width 2);
   Neither counts what the effects engine draws (a particle can match either
   look), so the recorder wraps each TankityFX system's draw to know when
   it is inside one.
   - tankY:  the player label's height (the unit's height on the hills).
   Effects (see tankity-fx-battle.spec.mjs), counted on the battlefield ('stage') and
   the firing range ('preview-stage') separately:
   - lighter: times the canvas switched to additive compositing;
   - sheets:  effect sprite-sheet frames drawn (nine-argument drawImage; the
              moon's 192 px frames are the sky and a shell's own body
              sprite is the shell, so neither is counted);
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
  let inFx = 0, inBody = 0, fxApi;
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
      const drawBody = api.drawBody;
      api.drawBody = function (c, x, y, ...rest) {
        inBody++;
        try {
          const drew = drawBody.call(this, c, x, y, ...rest);
          if (drew && onStage(c)) rec.shells.push([rec.frame, x, y]);
          return drew;
        } finally { inBody--; }
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
    if (w) { if (a.length === 8) { if (a[2] !== 192 && !inBody) w.sheets++; } else if (a.length === 4) w.blobs++; } // 192 px frames are the moon, not an effect
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

/* A fresh player on the game page. { clock: true } installs Playwright's
   clock before the page loads, as it requires, so a spec can fast-forward
   the game with page.clock.runFor() (time still flows on its own). */
export async function newPlayer(browser, path = 'games/tankity/', { clock = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  // Closing a tab keeps its room seats, so a player's context gives them up
  // (Leave, as the game's own button does) when a spec closes it: the suite
  // creates far more rooms than the cap, and they would otherwise sit until
  // their idle limit.
  const close = ctx.close.bind(ctx);
  ctx.close = async (...args) => {
    await leaveStoredSeats(ctx);
    return close(...args);
  };
  await ctx.addInitScript(recorderScript);
  const page = await ctx.newPage();
  if (clock) await page.clock.install();
  // E2E_CPU_THROTTLE=4 runs the page at a quarter speed, like a busy CI
  // runner, to shake out timing assumptions.
  const slow = Number(process.env.E2E_CPU_THROTTLE || 0);
  if (slow > 1) await (await ctx.newCDPSession(page)).send('Emulation.setCPUThrottlingRate', { rate: slow });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  // A phase move the turn-flow table rejects is a bug, whatever spec meets it.
  page.on('console', m => { if (m.text().startsWith('tankity flow:')) errors.push(m.text()); });
  await page.goto(path);
  await page.waitForTimeout(600);
  return { ctx, page, errors };
}

export const hud = (page, id) => page.textContent('#' + id);

/* Solo match from the title card: Play deals in and the pre-match shop opens. */
export async function dealSolo(page) {
  await page.click('#title-play');
  await page.waitForSelector('#shop-veil:not([hidden])');
}

/* Solo match: deal in, leave the shop, wait for our first aim. */
export async function startSolo(page) {
  await dealSolo(page);
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

/** Types a player's initials into the title card's three boxes, as a player would. */
/* Every seat this context's browser stored (localStorage tankity-seats), left. */
export async function leaveStoredSeats(ctx) {
  const state = await ctx.storageState();
  for (const origin of state.origins || []) {
    const item = (origin.localStorage || []).find(e => e.name === 'tankity-seats');
    if (!item) continue;
    let seats = [];
    try { seats = JSON.parse(item.value).seats || []; } catch (_) { continue; }
    for (const s of seats) {
      const res = await ctx.request.post(`${origin.origin}/games/tankity/rooms.php?action=leave`, {
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': s.csrf },
        data: { code: s.code, token: s.token, csrf: s.csrf },
        failOnStatusCode: false,
      });
      // Left, or already gone (no such room, no such seat). Anything else means the cleanup broke.
      if (![200, 401, 404].includes(res.status())) throw new Error(`leaving room ${s.code} answered ${res.status()}`);
    }
  }
}

export async function setInitials(page, word) {
  await page.click('#title-initial-1');
  await page.keyboard.type(word);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('tankity-initials'))).toBe(word.toUpperCase());
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
  await setInitials(host.page, 'abc');
  await host.page.click('#rooms-open');
  await host.page.click('#host-go');
  await host.page.waitForSelector('#lobby-room:not([hidden])');
  await expect.poll(() => hud(host.page, 'lobby-code')).toMatch(/^[A-Z0-9]{4}$/);
  const code = (await hud(host.page, 'lobby-code')).trim();
  await setInitials(guest.page, 'zed');
  await guest.page.click('#rooms-open');
  await guest.page.fill('#join-code', code);
  await guest.page.click('#join-go');
  await guest.page.waitForSelector('#lobby-room:not([hidden])');
  // The host hears about the guest on its next poll.
  await expect.poll(() => hud(host.page, 'log'), { timeout: 10_000 }).toMatch(/zed rolled into the room/i);
  if (beforeStart) await beforeStart({ host, guest, roomState, code });
  await host.page.click('#lobby-start');
  // Both clients are in the match once each shows the host's turn; events
  // from before a client's first sync are history and never replay.
  await expect.poll(() => hud(host.page, 'hud-turn'), { timeout: 30_000 }).toMatch(/YOU\. Aim!/);
  await expect.poll(() => hud(guest.page, 'hud-turn'), { timeout: 30_000 }).toMatch(/ABC aiming/);
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

/* The drawn ground, read from the pixels: the terrain's green rim is the lowest green pixel in a
   column (units, tags and tanks sit above it; the far dunes, the dirt and the sky are never green).
   It must reach both outer screen edges and continue across the field/scenery seams without a step
   beyond the hills' own slope (at most about 1.4 px a px, over the 8 px sampled). */
export function groundProbe() {
  const cv = document.getElementById('stage'), c = cv.getContext('2d'), W = cv.width, H = cv.height;
  const dpr = W / cv.getBoundingClientRect().width;
  const px = c.getImageData(0, 0, W, H).data;
  const at = (x, y) => { const i = (y * W + x) * 4; return [px[i], px[i + 1], px[i + 2]]; };
  const rim = x => { for (let y = H - 1; y >= 0; y--) { const p = at(x, y); if (p[1] > p[0] + 25 && p[1] > p[2] + 25) return { y, p }; } return null; };
  const [fx, fy, fw, fh] = cv.dataset.field.split(',').map(Number);
  const probs = [], edge = [];
  for (const x of [1, W - 2]) {
    const r = rim(x);
    if (!r) probs.push(`no ground at canvas column ${x}`);
    else edge.push({ x, y: r.y / dpr, body: at(x, Math.min(H - 1, r.y + Math.round(8 * dpr))) }); // the ground's own fill, a little below its rim
  }
  let seams = 0;
  for (const sx of [fx, fx + fw].map(v => Math.round(v * dpr))) {
    if (sx < 8 * dpr || sx > W - 8 * dpr) continue; // the field meets the screen edge: no seam to cross
    seams++;
    const a = rim(sx - Math.round(4 * dpr)), b = rim(sx + Math.round(4 * dpr));
    if (!a || !b) probs.push(`no ground at the seam, canvas column ${sx}`);
    else if (Math.abs(a.y - b.y) > 8 * dpr * 1.4 + 3 * dpr) probs.push(`the ground steps ${Math.abs(a.y - b.y)} px across the seam at canvas column ${sx}`);
  }
  return { probs, seams, edge, field: { x: fx, y: fy, w: fw, h: fh } };
}

/* Lose on purpose: the only way a solo match ends is the last life going. Lob
   mortar shells at the lowest power straight up, so they come down on our own
   tank, until the veil opens. Six mortars rarely suffice (a lob can miss), so
   the loop goes on with the free shell. Each lob waits on the HUD for our next turn, never
   on a timer; the page clock is driven by hand (page.clock.runFor) so the
   drones' turns play out in a blink instead of seconds. When our tank falls
   the drones fight on (at triple speed) until one is left; the lost round then
   opens the shop, and the loop starts the next round from it. */
export async function loseMatch(page) {
  const veil = page.locator('#end-veil');
  const aiming = async () => {
    await page.clock.runFor(4000);
    // A lost round goes through the shop, after the drones have fought it out.
    if (await page.locator('#shop-veil').isVisible()) await page.click('#shop-next');
    return (await veil.isVisible()) || /Aim/.test(await hud(page, 'hud-turn'));
  };
  for (let shot = 0; shot < 60 && await veil.isHidden(); shot++) {
    await expect.poll(aiming, { timeout: 60_000 }).toBe(true);
    if (await veil.isVisible()) break;
    await aimTo(page, 90);
    await setPower(page, 12);
    await page.keyboard.press('Space');
    // The shot is away once the HUD stops asking for our aim. This looks
    // without turning the clock: a whole volley fits in one runFor.
    await expect.poll(() => hud(page, 'hud-turn'), { timeout: 10_000 }).not.toMatch(/Aim/);
  }
}


/* Injected into every WebKit page (it has no mute flag): audio keeps running,
   so contexts still resume and suspend, but nothing reaches the speakers.
   Everything an AudioContext sends to its destination goes through a
   zero-gain node, and media elements play muted. */
export function muteScript() {
  const muteGain = new WeakMap();
  const connect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (dest, ...rest) {
    if (dest instanceof AudioDestinationNode) {
      let g = muteGain.get(dest.context);
      if (!g) {
        g = dest.context.createGain();
        g.gain.value = 0;
        connect.call(g, dest);
        muteGain.set(dest.context, g);
      }
      connect.call(this, g, ...rest);
      return dest;
    }
    return connect.call(this, dest, ...rest);
  };
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function (...a) {
    this.muted = true;
    return play.apply(this, a);
  };
}
