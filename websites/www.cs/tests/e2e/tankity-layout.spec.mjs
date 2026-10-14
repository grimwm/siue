// Operation Tankity on eight screens, measured with the widest values the
// bars can show (the approach of the design's layout-measure.mjs): nothing in
// the status bar wraps or clips, the deck fits, the page fits the screen,
// chips in a row line up, and phone targets are thumb-sized.
import { test, expect } from '@playwright/test';
import { recorderScript, newPlayer, groundProbe } from './helpers.mjs';

const DEVICES = [
  ['Desktop', 1280, 720, false], ['Laptop, small window', 1024, 640, false],
  ['Tablet, landscape', 1180, 820, true], ['Tablet, portrait', 820, 1180, true],
  ['iPhone 15, portrait', 393, 852, true], ['Small Android, portrait', 360, 740, true],
  ['iPhone 15, landscape', 852, 393, true], ['Small Android, landscape', 740, 360, true],
];
const phone = ([, w, h]) => Math.min(w, h) < 600;
const landscapePhone = ([, w, h]) => phone([0, w, h]) && w > h;

/* The width each screen deals (spec 6.6): a device's portrait and landscape give the same. */
const DEALT = { '1280x720': 1200, '1024x640': 1344, '1180x820': 984, '820x1180': 984, '393x852': 1224, '852x393': 1224, '360x740': 1176, '740x360': 1176 };
/* The landscape box src/field.ts computes for a viewport, which the measured box must match. */
function landscapeBox(vw, vh) {
  const long = Math.max(vw, vh), short = Math.min(vw, vh);
  return short <= 500 ? { w: long - 10, h: short - 75 } : { w: Math.min(long - 18, 1118), h: short - 294 };
}

/* The battlefield as drawn: no band of page between the bars, and where the field sits. */
function battlefield() {
  const cv = document.getElementById('stage');
  const box = document.getElementById('field').getBoundingClientRect();
  const r = cv.getBoundingClientRect();
  const bar = document.getElementById('hud-bar').getBoundingClientRect();
  const deck = document.getElementById('deck');
  const floating = getComputedStyle(deck).position === 'absolute';
  const probs = [];
  if (Math.abs(r.left - box.left) > 0.5 || Math.abs(r.right - box.right) > 0.5 || Math.abs(r.top - box.top) > 0.5 || Math.abs(r.bottom - box.bottom) > 0.5) {
    probs.push('the canvas does not fill the battlefield');
  }
  if (Math.abs(box.top - bar.bottom) > 0.5) probs.push(`${Math.round(box.top - bar.bottom)}px between the status bar and the battlefield`);
  if (!floating && Math.abs(deck.getBoundingClientRect().top - box.bottom) > 0.5) probs.push(`${Math.round(deck.getBoundingClientRect().top - box.bottom)}px between the battlefield and the deck`);
  const holder = getComputedStyle(document.querySelector('.canvas-holder')).backgroundColor.match(/\d+/g).map(Number);
  const c = cv.getContext('2d'), W = cv.width, H = cv.height;
  const px = c.getImageData(0, 0, W, H).data;
  const at = (x, y) => { const i = (y * W + x) * 4; return [px[i], px[i + 1], px[i + 2], px[i + 3]]; };
  for (let y = 0; y < H; y += 2) {
    let band = true;
    for (let x = 0; x < W && band; x += 7) {
      const [r0, g0, b0, a0] = at(x, y);
      band = a0 < 255 || (r0 === holder[0] && g0 === holder[1] && b0 === holder[2]);
    }
    if (band) { probs.push(`a band of background at canvas row ${y}`); break; }
  }
  const [fx, fy, fw, fh] = cv.dataset.field.split(',').map(Number);
  return { probs, w: Number(cv.dataset.w), field: { x: fx, y: fy, w: fw, h: fh }, canvas: { w: r.width, h: r.height }, box: { w: box.width, h: box.height } };
}

async function open(browser, [, width, height, touch], { text } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
  await ctx.addInitScript(recorderScript);
  if (text) await ctx.addInitScript(t => { try { localStorage.setItem('tankity-text', t); } catch (_) { /* fine */ } }, text);
  const page = await ctx.newPage();
  await page.clock.install();
  await page.goto('games/tankity/');
  await page.waitForSelector('#hud-score > span');
  // Hold the frames still so no repaint undoes the values set below.
  await page.clock.pauseAt(Date.now() + 2000);
  return { ctx, page };
}

/* The worst case the spec names: angle 162°, power 100, fuel 100, ♥ 5,
   $12,450, round 13, 98,760 pts; a room badge is ROOM ABCD | YOU P2 | RND 13. */
function setWorst(room) {
  const put = (sel, v) => { document.querySelector(sel).textContent = v; };
  put('#hud-angle', '162°'); put('#hud-power', '100'); put('#hud-fuel', '100');
  put('#hud-ammo', '×12'); put('#hud-armor', '175'); put('#hud-lives .v', '5'); put('#hud-wind', '← 12');
  const segs = document.querySelectorAll('#hud-score > span');
  if (room) {
    segs[0].innerHTML = '<span class="k">ROOM</span> <span class="v">ABCD</span><span class="dot on"></span>';
    segs[1].innerHTML = '<span class="k">YOU</span> <span class="v">P2</span>';
  } else {
    segs[0].querySelector('.v').textContent = '$12,450';
    segs[2].querySelector('.v').textContent = '98,760';
  }
  segs[1].parentElement.children[room ? 2 : 1].querySelector('.v').textContent = '13';
}

function measure() {
  const probs = [];
  const clipped = el => el.getClientRects().length > 1 || el.scrollWidth > el.clientWidth + 0.5;
  const bar = document.querySelector('#hud-bar .hud');
  if (bar.scrollWidth > bar.clientWidth + 0.5) probs.push(`status bar overflows by ${bar.scrollWidth - bar.clientWidth}px`);
  const stacked = getComputedStyle(bar).flexDirection === 'column';
  const rows = new Map();
  for (const el of bar.querySelectorAll('.menu-btn, .stat, .pill, .seg')) {
    if (!el.getClientRects().length) continue;
    const key = stacked ? el.closest('.hud-row').className : 'one row';
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push(el);
  }
  for (const [name, els] of rows) {
    const mids = els.map(el => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; });
    if (Math.max(...mids) - Math.min(...mids) > 1) probs.push(`status ${name} wraps`);
    const box = (stacked ? els[0].closest('.hud-row') : bar).getBoundingClientRect();
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (clipped(el)) probs.push(`${el.className} clipped`);
      if (r.left < box.left - 0.5 || r.right > box.right + 0.5) probs.push(`${el.className} sticks out of ${name}`);
    }
  }
  const deck = document.getElementById('deck');
  if (getComputedStyle(deck).position !== 'absolute' && deck.scrollWidth > deck.clientWidth + 0.5) {
    probs.push(`deck overflows by ${deck.scrollWidth - deck.clientWidth}px`);
  }
  for (const el of deck.querySelectorAll('button')) {
    if (!el.getClientRects().length) continue;
    const r = el.getBoundingClientRect();
    if (clipped(el)) probs.push(`${el.id || el.dataset.aim} clipped`);
    if (r.bottom > innerHeight + 0.5 || r.right > innerWidth + 0.5 || r.left < -0.5) probs.push(`${el.id || el.dataset.aim} off screen`);
  }
  const doc = document.documentElement;
  if (doc.scrollHeight > innerHeight + 0.5) probs.push(`page taller than the screen by ${doc.scrollHeight - innerHeight}px`);
  if (doc.scrollWidth > innerWidth + 0.5) probs.push(`page wider than the screen by ${doc.scrollWidth - innerWidth}px`);
  return probs;
}

/* Spread of chip centres among buttons of one row (same top and height). */
function chipSpreads() {
  const rows = new Map();
  for (const k of document.querySelectorAll('#deck kbd.key, #hud-bar kbd.key')) {
    if (!k.getClientRects().length) continue;
    const b = k.closest('button').getBoundingClientRect();
    const key = `${Math.round(b.top)}|${Math.round(b.height)}`;
    const r = k.getBoundingClientRect();
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push(r.top + r.height / 2);
  }
  const menu = document.querySelector('#btn-menu'), chip = menu.querySelector('kbd.key');
  const m = menu.getBoundingClientRect(), c = chip ? chip.getBoundingClientRect() : null;
  return { rows: [...rows.values()].map(v => Math.max(...v) - Math.min(...v)), menu: c ? Math.abs((c.top + c.height / 2) - (m.top + m.height / 2)) : null };
}

function smallTargets() {
  return [...document.querySelectorAll('#hud-bar button, #deck button, #field .rotate-x')]
    .filter(el => el.getClientRects().length)
    .map(el => [el.id || el.dataset.aim, el.getBoundingClientRect()])
    .filter(([, r]) => r.width < 43.5 || r.height < 43.5)
    .map(([id, r]) => `${id} ${Math.round(r.width)}×${Math.round(r.height)}`);
}

/* The Next song toast, shown with a long title while a chatter line shows: it
   must sit inside the battlefield, below the chatter, on one line, and over
   neither bar nor any deck button. */
/* The Next song toast while the menu is open (a phone's Next song is a menu
   row): every point of it is the toast, not the menu card above it. */
function toastOverMenu() {
  const toast = document.getElementById('track-toast');
  toast.textContent = '♫ Battle Theme A · cynicmusic';
  toast.hidden = false;
  toast.style.pointerEvents = 'auto'; // elementFromPoint passes through pointer-events: none
  const r = toast.getBoundingClientRect();
  const probs = [];
  for (const [x, y] of [[r.left + 4, r.top + 4], [(r.left + r.right) / 2, (r.top + r.bottom) / 2], [r.right - 4, r.bottom - 4]]) {
    const hit = document.elementFromPoint(x, y);
    if (hit !== toast) probs.push(`${Math.round(x)},${Math.round(y)} is ${hit ? hit.id || hit.className || hit.tagName : 'nothing'}`);
  }
  toast.style.pointerEvents = '';
  toast.hidden = true;
  return probs;
}

function toastProblems() {
  const probs = [];
  const dlg = document.getElementById('dialogue');
  dlg.hidden = false;
  document.getElementById('dlg-name').textContent = 'REAPER';
  document.getElementById('dlg-line').textContent = 'Wind check: hold that barrel steady and wait for it.';
  const toast = document.getElementById('track-toast');
  toast.textContent = '♫ Battle Theme A (Extended Mix) · A Composer With A Long Name';
  toast.hidden = false;
  const r = toast.getBoundingClientRect();
  const over = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
  const field = document.getElementById('field').getBoundingClientRect();
  if (r.top < field.top - 0.5 || r.bottom > field.bottom + 0.5 || r.left < field.left - 0.5 || r.right > field.right + 0.5) probs.push('toast leaves the battlefield');
  if (r.top < dlg.getBoundingClientRect().bottom - 0.5) probs.push('toast is not below the chatter');
  if (toast.getClientRects().length > 1 || getComputedStyle(toast).whiteSpace !== 'nowrap') probs.push('toast wraps');
  if (over(r, document.getElementById('hud-bar').getBoundingClientRect())) probs.push('toast over the status bar');
  for (const b of document.querySelectorAll('#deck button')) {
    if (b.getClientRects().length && over(r, b.getBoundingClientRect())) probs.push(`toast over ${b.id || b.dataset.aim}`);
  }
  toast.hidden = true;
  dlg.hidden = true;
  return probs;
}

for (const dev of DEVICES) {
  test(`${dev[0]} ${dev[1]}×${dev[2]}: solo and room bars fit, the deck fits, the page fits`, async ({ browser }) => {
    const { ctx, page } = await open(browser, dev);
    for (const room of [false, true]) {
      await page.evaluate(setWorst, room);
      expect(await page.evaluate(measure), room ? 'room' : 'solo').toEqual([]);
      await page.screenshot({ path: `test-results/tankity-layout-${dev[1]}x${dev[2]}-${room ? 'room' : 'solo'}.png` });
    }
    expect(await page.evaluate(toastProblems), 'track toast').toEqual([]);
    // The battlefield fills the screen between the bars, the ground meets both
    // edges, and the field's width is the one this device deals either way up.
    const bf = await page.evaluate(battlefield);
    expect(bf.probs).toEqual([]);
    const gp = await page.evaluate(groundProbe);
    expect(gp.probs, 'the drawn ground at the edges and the seams').toEqual([]);
    expect(bf.w).toBe(DEALT[`${dev[1]}x${dev[2]}`]);
    if (dev[1] > dev[2]) {
      const want = landscapeBox(dev[1], dev[2]);
      expect(Math.abs(bf.box.w - want.w), 'box width vs src/field.ts').toBeLessThanOrEqual(2);
      expect(Math.abs(bf.box.h - want.h), 'box height vs src/field.ts').toBeLessThanOrEqual(2);
    } else {
      // Portrait: the field spans the full width, with sky above and dirt below.
      expect(Math.abs(bf.field.x)).toBeLessThanOrEqual(1);
      expect(Math.abs(bf.field.w - bf.canvas.w)).toBeLessThanOrEqual(1);
      expect(bf.field.y).toBeGreaterThan(0);
      expect(bf.field.y + bf.field.h).toBeLessThan(bf.canvas.h);
      // And the pixels agree: the field's own ground (#7a4a1e, not scenery's dimmed fill) meets both screen edges.
      expect(gp.seams, 'no scenery in portrait').toBe(0);
      for (const e of gp.edge) {
        expect(e.body[0], `ground fill at column ${e.x}`).toBeGreaterThanOrEqual(105);
        expect(e.y, 'inside the drawn field').toBeGreaterThan(bf.field.y);
        expect(e.y).toBeLessThan(bf.field.y + bf.field.h);
      }
    }
    const chips = await page.evaluate(chipSpreads);
    if (!dev[3]) {
      expect(chips.rows.length).toBeGreaterThan(0);
      for (const s of chips.rows) expect(s).toBeLessThanOrEqual(1);
      expect(chips.menu).toBeLessThanOrEqual(1);
      const h = await page.evaluate(() => ['btn-weapon', 'btn-help', 'btn-drive-l', 'btn-cannon'].map(id => document.getElementById(id).getBoundingClientRect().height));
      for (const x of h) expect(Math.abs(x - 55)).toBeLessThan(0.6);
    } else {
      expect(chips.rows, 'no chips on a touch screen').toEqual([]);
    }
    // Weapon sits on FIRE: stacked 4-16px apart on phones, side by side and
    // bottom-aligned elsewhere; FIRE is a rounded rectangle, never a circle.
    const pair = await page.evaluate(() => {
      const w = document.getElementById('btn-weapon').getBoundingClientRect();
      const fb = document.getElementById('btn-cannon');
      const f = fb.getBoundingClientRect();
      return { gapY: f.top - w.bottom, gapX: f.left - w.right, bottomDiff: Math.abs(f.bottom - w.bottom), overlapX: Math.min(w.right, f.right) - Math.max(w.left, f.left),
        fireW: f.width, fireH: f.height, radius: parseFloat(getComputedStyle(fb).borderTopLeftRadius) };
    });
    if (phone(dev)) {
      expect(pair.gapY, 'Weapon above FIRE').toBeGreaterThanOrEqual(4);
      expect(pair.gapY, 'Weapon above FIRE').toBeLessThanOrEqual(16);
      expect(pair.overlapX, 'Weapon is over FIRE').toBeGreaterThan(40);
    } else {
      expect(pair.gapX, 'Weapon beside FIRE').toBeGreaterThanOrEqual(4);
      expect(pair.bottomDiff).toBeLessThanOrEqual(1);
    }
    expect(pair.fireW).toBeGreaterThan(pair.fireH);
    expect(pair.radius).toBeGreaterThanOrEqual(4);
    expect(pair.radius).toBeLessThan(pair.fireH * 0.4);
    const up = await page.locator('#deck [data-aim="up"]').evaluate(b => [getComputedStyle(b).backgroundColor, getComputedStyle(b).color]);
    if (!landscapePhone(dev)) expect(up).toEqual(['rgb(255, 201, 60)', 'rgb(17, 17, 17)']);
    if (phone(dev)) {
      await expect(page.locator('.topbar')).toBeHidden();
      expect(await page.evaluate(smallTargets)).toEqual([]);
      await expect(page.locator('#btn-track')).toBeHidden();
      if (landscapePhone(dev)) {
        await expect(page.locator('#btn-log')).toBeHidden();
        await expect(page.locator('#btn-help')).toBeHidden();
      }
      await page.locator('#btn-menu').tap();
      await expect(page.locator('#menu-track')).toBeVisible();
      // Next song is a menu row here and the menu stays open: the toast must show over it.
      expect(await page.evaluate(toastOverMenu), 'track toast over the open menu').toEqual([]);
      for (const id of ['#menu-radio', '#menu-help']) {
        if (landscapePhone(dev)) await expect(page.locator(id)).toBeVisible();
        else await expect(page.locator(id)).toBeHidden();
      }
    } else {
      await expect(page.locator('.phone-extras')).toBeHidden();
    }
    await ctx.close();
  });
}

const lin = c => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const over = (fg, alpha, bg) => fg.map((c, i) => c * alpha + bg[i] * (1 - alpha));

test('the translucent landscape arrow keys keep white words readable; other buttons stay solid', async ({ browser }) => {
  const { ctx, page } = await open(browser, DEVICES[6]);
  const [bg, color, shadow] = await page.locator('#deck [data-aim="up"]').evaluate(b => { const c = getComputedStyle(b); return [c.backgroundColor, c.color, c.textShadow]; });
  const rgba = v => { const m = v.match(/[\d.]+/g).map(Number); return { rgb: m.slice(0, 3), a: m.length > 3 ? m[3] : 1 }; };
  const fill = rgba(bg), text = rgba(color);
  expect(fill.a, 'translucent').toBeLessThan(1);
  expect(fill.a, 'not invisible').toBeGreaterThan(0.3);
  expect(text.rgb).toEqual([255, 255, 255]);
  expect(shadow, 'a dark halo').toContain('rgb(0, 0, 0)');
  // Over the night sky the fill alone gives 4.5:1; over the hills the dark halo carries the words.
  expect(contrast(text.rgb, over(fill.rgb, fill.a, [0, 0, 11]))).toBeGreaterThanOrEqual(4.5);
  expect(await page.locator('#btn-drive-l').evaluate(b => getComputedStyle(b).backgroundColor)).toBe('rgb(10, 13, 38)');
  await ctx.close();
});

test('the Huge text size leaves the bars fitting on the smallest phone', async ({ browser }) => {
  const { ctx, page } = await open(browser, DEVICES[5], { text: 'xl' });
  expect(await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize))).toBeCloseTo(20.8, 1);
  await page.evaluate(setWorst, false);
  expect(await page.evaluate(measure)).toEqual([]);
  await ctx.close();
});

test('chatter is a one-line toast inside the battlefield, never over the status bar', async ({ browser }) => {
  const { page, ctx, errors } = await newPlayer(browser, undefined, { clock: true });
  await page.keyboard.press('n');
  await expect.poll(async () => { await page.clock.runFor(500); return page.locator('#dialogue').isVisible(); }, { timeout: 10_000 }).toBe(true);
  const [d, h, f] = [await page.locator('#dialogue').boundingBox(), await page.locator('#hud-bar').boundingBox(), await page.locator('#field').boundingBox()];
  expect(d.y).toBeGreaterThanOrEqual(h.y + h.height);
  expect(d.y).toBeGreaterThanOrEqual(f.y);
  expect(d.height).toBeLessThan(32);
  expect(await page.locator('#dialogue').evaluate(e => getComputedStyle(e).whiteSpace)).toBe('nowrap');
  expect(errors).toEqual([]);
  await ctx.close();
});

/* The between-rounds shop: nothing is wider than the screen, and each row's
   Preview and Buy sit under the description, in the text column. */
const SHOP_SCREENS = [
  ['Small Android, 320 px', 320, 640, true, true], ['iPhone 15, portrait', 393, 852, true, true],
  ['iPhone 15, landscape', 852, 393, true, false], ['Desktop', 1280, 720, false, false],
];

for (const [name, width, height, touch, narrow] of SHOP_SCREENS) {
  test(`the shop fits ${name} and keeps Preview and Buy under the text`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
    const page = await ctx.newPage();
    await page.goto('games/tankity/');
    await page.waitForSelector('#hud-score > span');
    if (touch) { // keys do nothing on a touch screen: the title card's Settings holds New game
      await page.locator('#title-settings').tap();
      await page.locator('#new-game').tap();
    } else {
      await page.keyboard.press('n');
    }
    await page.waitForSelector('#shop-veil:not([hidden])');
    const m = await page.evaluate(() => {
      const box = el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, r: r.right, b: r.bottom, w: r.width }; };
      const wide = [...document.querySelectorAll('#shop-veil *')].filter(e => e.getBoundingClientRect().right > innerWidth + 0.5)
        .map(e => `${e.tagName}.${e.className}`);
      const rows = [...document.querySelectorAll('#shop-list li:not(.shop-cat)')].map(li => {
        const col = li.querySelector('.shop-item');
        const subs = [...col.querySelectorAll('.shop-sub')];
        const buttons = [...li.querySelectorAll('.acts button')].map(box);
        return { shell: li.classList.contains('shop-free'), col: box(col), desc: box(subs[subs.length - 1]), buttons };
      });
      return { scroll: document.documentElement.scrollWidth, inner: innerWidth, wide, rows };
    });
    expect(m.scroll).toBeLessThanOrEqual(m.inner);
    expect(m.wide).toEqual([]);
    // The free Shell, every priced gun and every trick in game.json.
    const data = await page.evaluate(() => fetch('game.json').then(r => r.json()));
    expect(m.rows.length).toBe(1 + data.arsenal.ammo.filter(a => a.pack > 0).length + data.arsenal.gear.length);
    for (const row of m.rows) {
      expect(row.buttons.length).toBe(row.shell ? 1 : row.buttons.length);
      for (const b of row.buttons) {
        expect(b.y).toBeGreaterThanOrEqual(row.desc.b - 1);
        expect(b.x).toBeGreaterThanOrEqual(row.col.x - 1);
        expect(b.r).toBeLessThanOrEqual(row.col.r + 1);
      }
      const [first, second] = row.buttons;
      if (second) expect(Math.abs(first.y - second.y)).toBeLessThan(2); // side by side
      if (narrow) {
        if (second) {
          expect(first.w).toBeGreaterThan(row.col.w * 0.45);
          expect(first.w).toBeLessThan(row.col.w * 0.55);
          expect(Math.abs(first.w - second.w)).toBeLessThan(2);
        } else if (row.shell) {
          expect(first.w).toBeGreaterThan(row.col.w * 0.95);
        }
      } else {
        for (const b of row.buttons) expect(b.w).toBeLessThan(row.col.w * 0.6);
        expect(first.x).toBeLessThan(row.col.x + 2); // start-aligned
      }
    }
    // Start sits in a footer below the scrolling list, and the last row's buttons
    // are reachable by scrolling and not covered by it.
    const foot = await page.evaluate(() => {
      const list = document.querySelector('#shop-list');
      const lastLi = [...list.querySelectorAll('li:not(.shop-cat)')].pop();
      list.scrollTop = list.scrollHeight;
      const covered = [...lastLi.querySelectorAll('.acts button')].map(b => {
        const r = b.getBoundingClientRect();
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        return hit === b || b.contains(hit) ? null : `${hit && hit.tagName}#${hit && hit.id}`;
      });
      const next = document.querySelector('#shop-next').getBoundingClientRect();
      return { listBottom: list.getBoundingClientRect().bottom, listLeft: list.getBoundingClientRect().left,
        nextTop: next.top, nextBottom: next.bottom, nextRight: next.right,
        covered, scrolls: list.scrollHeight > list.clientHeight };
    });
    // One column: Start sits below the list. Two columns: it sits in the left column, beside the list.
    if (narrow) expect(foot.nextTop).toBeGreaterThanOrEqual(foot.listBottom);
    else expect(foot.nextRight).toBeLessThanOrEqual(foot.listLeft + 1);
    expect(foot.nextBottom).toBeLessThanOrEqual(height);
    expect(foot.scrolls).toBe(true);
    expect(foot.covered.length).toBeGreaterThan(0);
    expect(foot.covered.filter(Boolean)).toEqual([]);
    // Rows with a Preview and a Buy are the ones the halves rule is about.
    expect(m.rows.some(r => r.buttons.length === 2)).toBe(true);
    await ctx.close();
  });
}

test('the width holds through a resize and the next match takes the new one', async ({ browser }) => {
  const { ctx, page } = await open(browser, DEVICES[0]);
  await page.locator('.title-play').click();
  await page.clock.runFor(200);
  expect(Number(await page.locator('#stage').getAttribute('data-w'))).toBe(1200);
  await page.setViewportSize({ width: 1024, height: 640 });
  await page.clock.runFor(200);
  expect(Number(await page.locator('#stage').getAttribute('data-w')), 'mid-match: rescaled, not re-dealt').toBe(1200);
  expect((await page.evaluate(battlefield)).probs).toEqual([]);
  await page.keyboard.press('q');
  await page.getByRole('button', { name: /Play this seed/ }).click(); // a new deal (Menu, Task 14)
  await page.clock.runFor(200);
  expect(Number(await page.locator('#stage').getAttribute('data-w'))).toBe(1344);
  await ctx.close();
});

test('the rotate hint: portrait only, in a match, gone once dismissed', async ({ browser }) => {
  const { ctx, page } = await open(browser, DEVICES[4]);
  expect(await page.locator('.rotate-hint').count(), 'not over the demo').toBe(0);
  await page.locator('.title-play').click();
  await page.clock.runFor(200);
  await expect(page.locator('.rotate-hint')).toContainText('Turn sideways for the full battlefield');
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page.locator('.rotate-hint')).toHaveCount(0);
  await page.reload();
  await page.waitForSelector('#hud-score > span');
  await page.locator('.title-play').click();
  await page.clock.runFor(200);
  expect(await page.locator('.rotate-hint').count(), 'remembered').toBe(0);
  await ctx.close();
});

/* In portrait the field's ground melts into the dirt: down the foot of the field, the
   median luminance of a row (so a stray spark or crater cannot hide or fake an edge)
   differs from the next row's by no more than SEAM_STEP levels of 255. The old hard line was 50. */
const SEAM_STEP = 8;
function seamSteps() {
  const cv = document.getElementById('stage');
  const c = cv.getContext('2d'), W = cv.width, H = cv.height;
  const dpr = W / cv.getBoundingClientRect().width;
  const [, fy, , fh] = cv.dataset.field.split(',').map(Number);
  const floor = Math.round((fy + fh) * dpr); // the field's bottom edge in canvas pixels
  const unit = (fh / 460) * dpr; // a world unit in canvas pixels; the lowest hills sit 45 units above the floor
  const y0 = Math.max(0, floor - Math.round(30 * unit)), y1 = Math.min(H - 1, floor + Math.round(70 * unit));
  const px = c.getImageData(0, y0, W, y1 - y0 + 1).data;
  const median = y => {
    const v = [];
    for (let x = 0; x < W; x += 3) { const i = ((y - y0) * W + x) * 4; v.push(0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]); }
    return v.sort((a, b) => a - b)[v.length >> 1];
  };
  let worst = 0, at = 0, prev = median(y0);
  for (let y = y0 + 1; y <= y1; y++) {
    const m = median(y);
    if (Math.abs(m - prev) > worst) { worst = Math.abs(m - prev); at = y - floor; }
    prev = m;
  }
  return { worst, at };
}

for (const dev of DEVICES.filter(d => d[2] > d[1])) {
  test(`portrait ${dev[1]}×${dev[2]}: the ground melts into the dirt with no straight edge across the width`, async ({ browser }) => {
    const { ctx, page } = await open(browser, dev);
    const { worst, at } = await page.evaluate(seamSteps);
    expect(worst, `largest luminance step ${worst.toFixed(1)} at ${at}px from the field's floor`).toBeLessThanOrEqual(SEAM_STEP);
    await ctx.close();
  });
}
