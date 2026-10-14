// Operation Tankity's camera under a high lob (src/camera.ts): the camera pulls
// back and up so the shell's whole arc and every unit stay on screen, and at
// the zoom floor the battlefield shows ground along its whole bottom edge, never
// sky. Positions and the zoom are read in canvas pixels through each draw
// call's transform. Chrome always; with E2E_WEBKIT=1 playwright.config.mjs adds a
// WebKit project for this spec (CI installs Chrome only).
import { test, expect } from '@playwright/test';
import { recorderScript, startSolo, aimTo, setPower } from './helpers.mjs';

/* Injected after the recorder: while __sky.on, every shell core (the 1.5 px
   white dot) and unit name tag drawn on the battlefield, in canvas pixels,
   how many sky marks (the yellow arrow's height on the top edge) were drawn,
   and the TANK tag's scale (canvas pixels per world unit: the fit times the zoom). */
function skyCamScript() {
  const P = CanvasRenderingContext2D.prototype;
  const cap = { on: false, shells: [], labels: [], marks: 0, scale: 0 };
  window.__sky = cap;
  const arc = P.arc, fillText = P.fillText;
  const px = (c, x, y) => { const m = c.getTransform(); return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; };
  P.arc = function (x, y, r, ...rest) {
    if (cap.on && this.canvas.id === 'stage' && r === 1.5 && this.fillStyle === '#ffffff') cap.shells.push([x, y, ...px(this, x, y)]);
    return arc.call(this, x, y, r, ...rest);
  };
  P.fillText = function (t, x, y, ...rest) {
    if (this.canvas.id === 'stage') {
      if (t === 'TANK') cap.scale = this.getTransform().a;
      if (cap.on && this.fillStyle === '#ffe27a') cap.marks++;
      else if (cap.on && /^[A-Z0-9-]{2,}$/.test(t)) cap.labels.push([t, ...px(this, x, y)]);
    }
    return fillText.call(this, t, x, y, ...rest);
  };
}

const WIDE = { width: 1280, height: 860 }, PORTRAIT = { width: 393, height: 852 };

async function player(browser, viewport, { speed } = {}) {
  const ctx = await browser.newContext({ viewport });
  await ctx.addInitScript(recorderScript);
  await ctx.addInitScript(skyCamScript);
  const page = await ctx.newPage();
  // A faster Shell climbs past what the zoom floor can show (test-only arsenal).
  if (speed) {
    await page.route(/\/game\.json/, async route => {
      const body = await (await route.fetch()).json();
      for (const w of body.arsenal.ammo) if (w.key === 'shell') w.speed = speed;
      await route.fulfill({ json: body });
    });
  }
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('games/tankity/');
  await page.waitForTimeout(600);
  return { ctx, page, errors };
}

/* The canvas, the field's width, the top row an unzoomed view shows, and the camera's zoom now. */
const stage = page => page.evaluate(() => {
  const cv = document.getElementById('stage');
  const [, fy, , fh] = cv.dataset.field.split(',').map(Number);
  const dpr = cv.width / cv.clientWidth, fit = (fh / 460) * dpr; // canvas pixels per world unit at zoom 1
  return { w: cv.width, h: cv.height, field: Number(cv.dataset.w), top: -fy / (fh / 460), z: window.__sky.scale / fit };
});

/* Fire a near-vertical full-power Shell; capture until it has landed (or, with untilFloor, until the camera is at the floor). */
async function lob(page, { untilFloor = false } = {}) {
  await startSolo(page);
  await aimTo(page, 88);
  await setPower(page, 100);
  await page.evaluate(() => { window.__sky.on = true; });
  await page.keyboard.press('Space');
  await expect.poll(() => page.evaluate(() => window.__sky.shells.length), { timeout: 10_000 }).toBeGreaterThan(5);
  if (untilFloor) {
    await expect.poll(async () => (await stage(page)).z, { timeout: 10_000, message: 'the camera reaches the zoom floor' }).toBeLessThan(0.36);
    return;
  }
  let last = -1;
  await expect.poll(async () => {
    const n = await page.evaluate(() => window.__sky.shells.length);
    const still = n === last;
    last = n;
    return still;
  }, { timeout: 30_000, intervals: [700] }).toBe(true);
  await page.evaluate(() => { window.__sky.on = false; });
}

function unitsOnScreen(labels, cv) {
  expect(labels.length, 'units were drawn').toBeGreaterThan(0);
  for (const [t, x, y] of labels) {
    expect(x, `${t} on screen`).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThanOrEqual(cv.w);
    expect(y, `${t} on screen`).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThanOrEqual(cv.h);
  }
}

/* Earth (dirt, the field's ground or the scenery hills), not the night sky: brown has red well over blue. */
const groundScan = page => page.evaluate(() => {
  const cv = document.getElementById('stage');
  const c = cv.getContext('2d');
  const earth = (d, i) => d[i] > 30 && d[i] > d[i + 2] + 12;
  const row = c.getImageData(0, cv.height - 1, cv.width, 1).data;
  const skyAt = [];
  for (let x = 0; x < cv.width; x++) if (!earth(row, x * 4)) skyAt.push(x);
  const columns = [];
  for (let k = 0; k <= 8; k++) {
    const x = Math.min(cv.width - 1, Math.round((k / 8) * (cv.width - 1)));
    const d = c.getImageData(x, 0, 1, cv.height).data;
    let run = 0;
    for (let y = cv.height - 1; y >= 0 && earth(d, y * 4); y--) run++;
    columns.push([x, run / cv.height]);
  }
  return { skyAt: skyAt.slice(0, 12), skyCount: skyAt.length, columns };
});

async function highLob(browser, viewport, opts) {
  const { ctx, page, errors } = await player(browser, viewport, opts);
  await lob(page);
  const cv = await stage(page);
  const cap = await page.evaluate(() => window.__sky);
  const apex = Math.min(...cap.shells.map(s => s[1]));
  expect(apex, `the arc climbs above the top an unzoomed view shows (${cv.top.toFixed(0)})`).toBeLessThan(cv.top - 20);
  for (const [wx, , x, y] of cap.shells) {
    if (wx < 0 || wx > cv.field) continue; // past the edge it flies on over the scenery, draw only, and lets the camera go
    expect(y, `shell at world x ${wx.toFixed(0)}: on screen`).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThanOrEqual(cv.h);
    expect(x).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThanOrEqual(cv.w);
  }
  unitsOnScreen(cap.labels, cv);
  expect(errors).toEqual([]);
  await ctx.close();
}

async function pastTheFloor(browser, viewport, opts) {
  const { ctx, page, errors } = await player(browser, viewport, opts);
  await lob(page, { untilFloor: true });
  const cv = await stage(page);
  expect(cv.z, 'at the zoom floor').toBeGreaterThan(0.34);
  const g = await groundScan(page);
  expect(g.skyCount, `sky at the bottom edge at x ${g.skyAt.join(',')}`).toBe(0);
  for (const [x, share] of g.columns) expect(share, `column ${x}: ground from the bottom up`).toBeGreaterThan(0.03);
  const cap = await page.evaluate(() => window.__sky);
  unitsOnScreen(cap.labels.slice(-20), cv);
  if (viewport === WIDE) {
    await expect.poll(() => page.evaluate(() => window.__sky.marks), { timeout: 10_000, message: 'the shell climbs above the floor view: its mark shows' }).toBeGreaterThan(0);
  }
  expect(errors).toEqual([]);
  await ctx.close();
}

// [name, viewport, Shell speed for the high lob (0: as dealt), for the floor]. Portrait shows a
// tall sky already, so its Shells are made faster to climb past it and then past the floor.
const CASES = [['wide', WIDE, 0, 1.7], ['portrait', PORTRAIT, 1.6, 3.2]];

for (const [name, vp, lobSpeed] of CASES) {
  test(`${name}: a high lob keeps every unit and the shell on screen`, async ({ browser }) => {
    test.setTimeout(120_000);
    await highLob(browser, vp, { speed: lobSpeed });
  });
}
for (const [name, vp, , speed] of CASES) {
  test(`${name}: at the zoom floor units stay on screen and the whole bottom edge is ground`, async ({ browser }) => {
    test.setTimeout(120_000);
    await pastTheFloor(browser, vp, { speed });
  });
}
