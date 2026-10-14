// Operation Tankity's camera under a high lob (src/camera.ts): the camera pulls
// back and up so the shell's whole arc and every unit stay on screen, and at
// the zoom floor the battlefield's edges still show ground, never empty sky.
// Positions are read in canvas pixels through each draw call's transform.
import { test, expect } from '@playwright/test';
import { recorderScript, startSolo, aimTo, setPower } from './helpers.mjs';

/* Injected after the recorder: while __sky.on, every shell core (the 1.5 px
   white dot) and unit name tag drawn on the battlefield, in canvas pixels,
   and how many sky marks (the yellow arrow's height on the top edge) were drawn. */
function skyCamScript() {
  const P = CanvasRenderingContext2D.prototype;
  const cap = { on: false, shells: [], labels: [], marks: 0 };
  window.__sky = cap;
  const arc = P.arc, fillText = P.fillText;
  const px = (c, x, y) => { const m = c.getTransform(); return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; };
  P.arc = function (x, y, r, ...rest) {
    if (cap.on && this.canvas.id === 'stage' && r === 1.5 && this.fillStyle === '#ffffff') cap.shells.push([x, y, ...px(this, x, y)]);
    return arc.call(this, x, y, r, ...rest);
  };
  P.fillText = function (t, x, y, ...rest) {
    if (cap.on && this.canvas.id === 'stage') {
      if (this.fillStyle === '#ffe27a') cap.marks++;
      else if (/^[A-Z0-9-]{2,}$/.test(t)) cap.labels.push([t, ...px(this, x, y)]);
    }
    return fillText.call(this, t, x, y, ...rest);
  };
}

async function player(browser, { speed } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 } });
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

/* Fire a near-vertical full-power Shell; capture until it has landed. */
async function lob(page, { untilMarks = false } = {}) {
  await startSolo(page);
  await aimTo(page, 88);
  await setPower(page, 100);
  await page.evaluate(() => { window.__sky.on = true; });
  await page.keyboard.press('Space');
  await expect.poll(() => page.evaluate(() => window.__sky.shells.length), { timeout: 10_000 }).toBeGreaterThan(5);
  if (untilMarks) {
    await expect.poll(() => page.evaluate(() => window.__sky.marks), { timeout: 10_000 }).toBeGreaterThan(0);
    return;
  }
  // Landed: no new shell core for a while.
  let last = -1;
  await expect.poll(async () => {
    const n = await page.evaluate(() => window.__sky.shells.length);
    const still = n === last;
    last = n;
    return still;
  }, { timeout: 30_000, intervals: [700] }).toBe(true);
  await page.evaluate(() => { window.__sky.on = false; });
}

const size = page => page.evaluate(() => { const cv = document.getElementById('stage'); return { w: cv.width, h: cv.height, field: Number(cv.dataset.w) }; });

test('a high lob keeps every unit and the shell on screen', async ({ browser }) => {
  test.setTimeout(120_000);
  const { ctx, page, errors } = await player(browser);
  await lob(page);
  const cv = await size(page);
  const cap = await page.evaluate(() => window.__sky);
  const apex = Math.min(...cap.shells.map(s => s[1]));
  expect(apex, 'the arc climbs well above the top of an unzoomed field').toBeLessThan(-60);
  for (const [wx, , x, y] of cap.shells) {
    expect(y, `shell at world x ${wx.toFixed(0)}: on screen vertically`).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThanOrEqual(cv.h);
    if (wx >= 0 && wx <= cv.field) { // the wind may carry it past the field's edge, over the scenery
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(cv.w);
    }
  }
  expect(cap.labels.length, 'units were drawn').toBeGreaterThan(0);
  for (const [t, x, y] of cap.labels) {
    expect(x, `${t} on screen`).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThanOrEqual(cv.w);
    expect(y, `${t} on screen`).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThanOrEqual(cv.h);
  }
  expect(cap.marks, 'the whole arc fit: no sky mark needed').toBe(0);
  expect(errors).toEqual([]);
  await ctx.close();
});

test('past the zoom floor: a sky mark tracks the shell, units stay on screen, the edges show ground', async ({ browser }) => {
  test.setTimeout(120_000);
  const { ctx, page, errors } = await player(browser, { speed: 1.7 });
  await lob(page, { untilMarks: true });
  await page.waitForTimeout(1200); // the camera settles at the floor while the shell climbs on
  const cv = await size(page);
  // The bottom of both canvas edges: earth (dirt, the field's ground or the scenery hills), not sky.
  const edges = await page.evaluate(() => {
    const cv = document.getElementById('stage');
    const c = cv.getContext('2d');
    const out = [];
    for (const x of [1, cv.width - 2]) {
      const d = c.getImageData(x, 0, 1, cv.height).data;
      let earth = 0;
      for (let y = cv.height - 1; y >= 0; y--) {
        const r = d[y * 4], b = d[y * 4 + 2];
        if (r > 30 && r > b + 12) earth++; else break;
      }
      out.push({ x, earth, sky: [d[4], d[5], d[6]] });
    }
    return out;
  });
  for (const e of edges) {
    expect(e.earth / cv.h, `column ${e.x}: ground from the bottom up`).toBeGreaterThan(0.05);
  }
  const cap = await page.evaluate(() => window.__sky);
  expect(cap.marks).toBeGreaterThan(0);
  const recent = cap.labels.slice(-20);
  expect(recent.length).toBeGreaterThan(0);
  for (const [t, x, y] of recent) {
    expect(x, `${t} on screen`).toBeGreaterThanOrEqual(0);
    expect(x).toBeLessThanOrEqual(cv.w);
    expect(y, `${t} on screen`).toBeGreaterThanOrEqual(0);
    expect(y).toBeLessThanOrEqual(cv.h);
  }
  expect(errors).toEqual([]);
  await ctx.close();
});
