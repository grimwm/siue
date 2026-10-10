// Operation Tankity weapon effects: the particle engine on the battlefield and
// firing range, reduced motion, and the dev-only effects editor (local only).
// Screenshots land in test-results/ (tankity-fx-*.png).
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test, expect } from '@playwright/test';
import { newPlayer, hud, rec, resetRec, aimTo, setPower, recorderScript } from './helpers.mjs';

/* The effects: block at the end of game.yaml, as committed. */
async function committedEffects() {
  const text = await fs.readFile(fileURLToPath(new URL('../../games/tankity/game.yaml', import.meta.url)), 'utf8');
  return text.slice(text.search(/^effects:$/m));
}

const local = base => /^https?:\/\/(127\.0\.0\.1|localhost)[:/]/.test(base || '');

async function arsenal(page) {
  const data = await page.evaluate(() => fetch('game.json').then(r => r.json()));
  return Object.fromEntries(data.arsenal.ammo.map(a => [a.key, a]));
}

/* The canvas as drawn `frames` animation frames after the first sprite frame
   (a blast landing), read inside the page so the photo is of the blast at its
   peak rather than of whatever a slow screenshot catches. */
function grab(page, canvasId, counter, frames) {
  return page.evaluate(({ id, key, n }) => new Promise((resolve, reject) => {
    const cv = document.getElementById(id), r = key === 'pv' ? window.__rec.pv : window.__rec;
    let seen = 0, waited = 0;
    const tick = () => {
      if (r.sheets > 0) seen++;
      if (seen > n) return resolve(cv.toDataURL('image/png').split(',')[1]);
      if (++waited > 1500) return reject(new Error('no blast on ' + id));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { id: canvasId, key: counter, n: frames }).then(b64 => Buffer.from(b64, 'base64'));
}

/* Fire what is loaded, photograph the blast, and let it play out. */
async function fireAndWatch(page, name) {
  // The drones' blasts from the last turn may still be playing: wait for quiet,
  // so the sprites counted below are this shot's.
  for (let quiet = 0, last = -1; quiet < 2;) {
    const n = (await rec(page)).sheets;
    quiet = n === last ? quiet + 1 : 0;
    last = n;
    await page.waitForTimeout(450);
  }
  await resetRec(page);
  await page.evaluate(() => { window.__rec.watchRings = true; });
  await page.keyboard.press('Control');
  const png = await grab(page, 'stage', 'main', 9);
  await fs.writeFile(`test-results/tankity-fx-${name}.png`, png);
  await page.waitForTimeout(1400);
  const r = await rec(page);
  await page.evaluate(() => { window.__rec.watchRings = false; });
  return r;
}

test('shell, mortar and rail light up the battlefield and the blast disc keeps its radius', async ({ browser }) => {
  test.setTimeout(240_000);
  const { page, errors } = await newPlayer(browser);
  const W = await arsenal(page);
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  await page.keyboard.press('2'); // mortar
  await page.keyboard.press('3'); // rail
  await page.click('#shop-next');
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 30_000 }).toMatch(/YOU|Aim/);
  // Near, steep lobs so every shot lands on the hills (the rail's speed is 140 + 3.2 per power point, so only the lowest power stays close).
  for (const [key, angle, power] of [['shell', 80, 40], ['mortar', 80, 40], ['rail', 80, 10]]) {
    // A shot can fly off the map or be lost to a busy turn: a pack holds two, so allow one retry.
    let r, radii = [];
    for (let attempt = 0; attempt < 2 && !radii.length; attempt++) {
      await expect.poll(() => hud(page, 'hud-turn'), { timeout: 90_000 }).toMatch(/YOU|Aim/);
      // Q loads the next gun; stop on the one the HUD names first.
      for (let i = 0; i < 8 && !(await hud(page, 'hud-weapon')).trim().startsWith(W[key].name); i++) await page.keyboard.press('q');
      await expect(page.locator('#hud-weapon'), `${key} is loaded`).toContainText(W[key].name);
      await aimTo(page, angle);
      await setPower(page, power);
      r = await fireAndWatch(page, key);
      radii = r.rings.filter(p => p[2] === W[key].gfx.blast[1]).map(p => p[1]);
    }
    expect(r.lighter, `${key}: additive glow was drawn`).toBeGreaterThan(0);
    expect(r.blobs, `${key}: soft glow sprites were drawn`).toBeGreaterThan(0);
    // The blast disc is the crater and damage radius: effects never change it.
    const rr = W[key].radius;
    expect(radii.length, `${key}: blast disc drawn (rings seen: ${JSON.stringify([...new Set(r.rings.map(p => p[2] + '@' + Math.round(p[1])))].slice(0, 12))}, sheets ${r.sheets})`).toBeGreaterThan(0);
    expect(Math.max(...radii), `${key}: disc never beyond the blast radius`).toBeLessThanOrEqual(rr + 0.01);
    if (key !== 'rail') expect(Math.max(...radii), `${key}: disc reaches the blast radius`).toBeGreaterThan(rr * 0.9);
  }
  expect(errors).toEqual([]);
});

test('every weapon has its own look on the firing range', async ({ browser }) => {
  test.setTimeout(300_000);
  const { page, errors } = await newPlayer(browser);
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  const names = await page.locator('#shop-list li:not(.shop-cat):not(.shop-free) .shop-name').allTextContents();
  const ammo = 11; // buck .. nuke; the gear rows follow
  expect(names.length).toBeGreaterThanOrEqual(ammo);
  const shots = new Set();
  for (let i = 0; i < ammo; i++) {
    await resetRec(page);
    await page.keyboard.press('v');
    await expect(page.locator('#preview-veil .card')).toBeVisible();
    const title = (await page.textContent('#preview-title')).trim();
    const shot = await grab(page, 'preview-stage', 'pv', title === 'NUKE' ? 80 : 9);
    await fs.writeFile(`test-results/tankity-fx-range-${String(i).padStart(2, '0')}-${title.toLowerCase().replace(/\W+/g, '')}.png`, shot);
    shots.add(shot.toString('base64'));
    const r = (await rec(page)).pv;
    expect(r.lighter, `${title}: additive glow`).toBeGreaterThan(0);
    expect(r.blobs, `${title}: glow sprites`).toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    await expect(page.locator('#preview-veil')).toBeHidden();
    await page.keyboard.press('ArrowDown');
  }
  expect(shots.size, 'no two weapons photographed the same').toBe(ammo);
  expect(errors).toEqual([]);
});

test('reduced motion thins the effects and drops the screen flash', async ({ browser }) => {
  test.setTimeout(120_000);
  const perFrame = async reduced => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
    await ctx.addInitScript(recorderScript);
    const page = await ctx.newPage();
    await page.goto('games/tankity/');
    await page.waitForTimeout(600);
    await page.keyboard.press('n');
    await page.waitForSelector('#shop-veil:not([hidden])');
    await page.keyboard.press('ArrowDown'); // mortar: a big, busy blast
    await resetRec(page);
    const f0 = (await rec(page)).frame;
    await page.keyboard.press('v');
    await expect.poll(async () => (await rec(page)).pv.sheets, { timeout: 25_000 }).toBeGreaterThan(0);
    await page.waitForTimeout(2500);
    const r = await rec(page);
    await ctx.close();
    return (r.pv.lighter + r.pv.blobs + r.pv.sheets) / Math.max(1, r.frame - f0);
  };
  const full = await perFrame(false);
  const calm = await perFrame(true);
  expect(full, 'normal motion draws effects').toBeGreaterThan(0.2);
  expect(calm, `reduced motion draws fewer (${calm.toFixed(2)} vs ${full.toFixed(2)} per frame)`).toBeLessThan(full * 0.8);
});

/* ---------- the night sky ---------- */
test('every match has its own sky, the same on every visit, and the moon is a rendered sphere', async ({ browser }) => {
  test.setTimeout(180_000);
  const skyOf = async seed => {
    const { page, ctx, errors } = await newPlayer(browser);
    await page.evaluate(v => { document.getElementById('seed-input').value = v; }, seed);
    await page.evaluate(() => { window.__rec.watchSky = true; window.__rec.skyRects = []; });
    await page.keyboard.press('n');
    await page.waitForSelector('#shop-veil:not([hidden])');
    await page.click('#shop-next');
    await expect.poll(() => hud(page, 'hud-turn'), { timeout: 30_000 }).toMatch(/YOU|Aim/);
    await page.evaluate(() => { window.__rec.skyRects = []; });
    await page.waitForTimeout(250);
    const rects = await page.evaluate(() => window.__rec.skyRects);
    // Moon: wait for the sheet, then photograph the stage.
    await page.waitForTimeout(500);
    await page.locator('#stage').screenshot({ path: `test-results/tankity-sky-${seed}.png` });
    expect(errors).toEqual([]);
    await ctx.close();
    // One frame's stars, as positions (twinkle only changes brightness).
    const one = new Set();
    for (const r of rects) one.add(r[0] + ',' + r[1]);
    return [...one].sort().join(' ');
  };
  const a1 = await skyOf('alpha-7'), a2 = await skyOf('alpha-7'), b = await skyOf('bravo-3'), c = await skyOf('charlie-9');
  expect(a1.split(' ').length, 'a field of stars').toBeGreaterThan(150);
  expect(a1, 'the same seed paints the same stars').toBe(a2);
  expect(b, 'another seed paints other stars').not.toBe(a1);
  expect(c).not.toBe(b);
});

/* ---------- the dev-only editor (never deployed: local docker only) ---------- */
test.describe('effects editor', () => {
  test.skip(({ baseURL }) => !local(baseURL), 'the editor is dev-only and not deployed');

  async function openEditor(browser) {
    const ctx = await browser.newContext({ viewport: { width: 1500, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('games/tankity/fx-editor.html');
    await expect(page.locator('#weapon option')).toHaveCount(13);
    await page.evaluate(() => { document.getElementById('loop').checked = false; });
    return { ctx, page, errors };
  }
  const settle = page => page.waitForFunction(() => window.fxEditor.phase === 'done', null, { timeout: 40_000 });
  const spawned = async page => {
    await page.click('#fire');
    await settle(page);
    return page.evaluate(() => window.fxEditor.sys.stats.spawned);
  };
  const resetStats = page => page.evaluate(() => { const s = window.fxEditor.sys.stats; s.spawned = 0; s.recycled = 0; s.peak = 0; });

  test('the effects: block committed in game.yaml is exactly what the editor exports', async ({ browser }) => {
    const { page, errors } = await openEditor(browser);
    const exported = await page.evaluate(async () => {
      const FX = window.TankityFX;
      const data = await fetch('game.json').then(r => r.json());
      return FX.toYaml(FX.dress(data.effects));
    });
    expect(exported, 'game.json round-trips through the editor to the YAML block byte for byte').toBe(await committedEffects());
    expect(errors).toEqual([]);
  });

  test('unsaved edits survive a reload until Reload file drops them', async ({ browser }) => {
    const { page, errors } = await openEditor(browser);
    await page.selectOption('#weapon', 'mortar');
    await page.click('#slots button[data-slot="impact"]');
    await page.click('#emitters li[data-i="4"] .label');
    await page.locator('[data-field="count"] input[type="number"]').fill('3');
    await page.reload();
    await expect(page.locator('#weapon option')).toHaveCount(13);
    await expect(page.locator('#status')).toContainText('Restored your unsaved edits');
    expect(await page.evaluate(() => window.fxEditor.defs.mortar.impact.emitters[4].count)).toBe(3);
    await page.click('#reload');
    await expect(page.locator('#status')).toContainText('Loaded the effects from game.json');
    expect(await page.evaluate(() => window.fxEditor.defs.mortar.impact.emitters[4].count)).toBe(26);
    await page.reload();
    await expect(page.locator('#status')).toContainText('Loaded the effects from game.json');
    expect(errors).toEqual([]);
  });

  test('picks a weapon and slot, changes a parameter, and the preview and export follow', async ({ browser }) => {
    test.setTimeout(180_000);
    const { page, errors } = await openEditor(browser);
    await page.selectOption('#weapon', 'mortar');
    await page.click('#slots button[data-slot="impact"]');
    await expect(page.locator('#emitters li')).toHaveCount(8);
    await page.screenshot({ path: 'test-results/tankity-fx-editor.png' });
    const before = await spawned(page);
    // Emitter 5 is the dirt shower: zero it and the blast throws less.
    await page.click('#emitters li[data-i="4"] .label');
    await expect(page.locator('#param-title')).toContainText('Emitter #5');
    const own = await page.evaluate(() => window.fxEditor.defs.mortar.impact.emitters[4].count);
    expect(own).toBe(26);
    await resetStats(page);
    await page.locator('[data-field="count"] input[type="number"]').fill('0');
    await page.waitForTimeout(400); // the preview restarts itself after an edit
    await settle(page);
    const after = await page.evaluate(() => window.fxEditor.sys.stats.spawned);
    expect(after, `a smaller blast spawns fewer particles (${after} < ${before})`).toBeLessThan(before - 15);
    await page.locator('#stage').screenshot({ path: 'test-results/tankity-fx-editor-edited.png' });
    // The export carries the edit; untouched weapons are byte for byte as loaded.
    await page.click('#copy');
    await expect(page.locator('#status')).toContainText('Copied');
    const copied = (await page.evaluate(() => navigator.clipboard.readText())).split('\n');
    const committed = (await committedEffects()).split('\n');
    expect(copied[0]).toBe('effects:');
    expect(copied.length).toBe(committed.length);
    const changed = committed.map((line, i) => [line, copied[i]]).filter(([a, b]) => a !== b);
    expect(changed.length, 'only the edited emitter line differs').toBe(1);
    expect(changed[0][0]).toContain('count: 26');
    expect(changed[0][1]).not.toContain('count:');
    // Add, duplicate, remove, mute.
    await page.selectOption('#new-shape', 'ring');
    await page.click('#em-add');
    await expect(page.locator('#emitters li')).toHaveCount(9);
    await page.locator('#emitters li[aria-current="true"] button[aria-label^="Duplicate "]').click();
    await expect(page.locator('#emitters li')).toHaveCount(10);
    await page.locator('#emitters li[aria-current="true"] button[aria-label^="Remove "]').click();
    await page.locator('#emitters li[aria-current="true"] button[aria-label^="Remove "]').click();
    await expect(page.locator('#emitters li')).toHaveCount(8);
    await page.locator('#emitters li[data-i="0"] button[aria-label^="Mute "]').click();
    await expect(page.locator('#emitters li[data-i="0"]')).toHaveClass(/muted/);
    // Download saves the same block as a file.
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#download')]);
    expect(dl.suggestedFilename()).toBe('effects.yaml');
    expect(errors).toEqual([]);
  });

  test('every emitter parameter has a control, and edits keep the file lean', async ({ browser }) => {
    const { page, errors } = await openEditor(browser);
    await page.selectOption('#weapon', 'emp');
    await page.click('#slots button[data-slot="impact"]');
    await page.click('#emitters li[data-i="0"] .label'); // a sprite emitter shows every group
    const shown = await page.locator('#params [data-field]').evaluateAll(els => els.map(e => e.dataset.field));
    const all = await page.evaluate(() => Object.keys(window.TankityFX.DEFAULTS));
    expect(shown.sort()).toEqual(all.filter(n => n !== 'round' && n !== 'length' && n !== 'width').sort());
    // Setting a value to its default drops the field from the export.
    await page.locator('[data-field="glow"] input').check();
    await page.locator('[data-field="glow"] input').uncheck();
    const em = await page.evaluate(() => Object.keys(window.fxEditor.defs.emp.impact.emitters[0]));
    expect(em).not.toContain('glow');
    expect(errors).toEqual([]);
  });

  test('the particle budget holds under a runaway effect, and reduced motion thins it', async ({ browser }) => {
    test.setTimeout(120_000);
    const { page, errors } = await openEditor(browser);
    await page.selectOption('#weapon', 'shell');
    await page.click('#slots button[data-slot="impact"]');
    await page.evaluate(() => {
      const ef = window.fxEditor.defs.shell.impact;
      for (let i = 0; i < 12; i++) ef.emitters.push(window.TankityFX.adopt({ count: 80, life: [2, 3], speed: [10, 60], glow: true }));
      window.fxEditor.fire();
    });
    await settle(page);
    const stats = await page.evaluate(() => ({ ...window.fxEditor.sys.stats, max: window.fxEditor.sys.max }));
    expect(stats.peak).toBeLessThanOrEqual(stats.max);
    expect(stats.recycled, 'a full pool recycles slots instead of growing').toBeGreaterThan(0);
    await resetStats(page);
    const full = await spawned(page);
    await page.check('#reduced');
    await page.waitForTimeout(300);
    await resetStats(page);
    const calm = await spawned(page);
    expect(calm, `reduced motion spawns fewer (${calm} < ${full})`).toBeLessThan(full * 0.6);
    expect(errors).toEqual([]);
  });

  test('screenshots of the nuke and the lightning in the editor', async ({ browser }) => {
    test.setTimeout(120_000);
    const { page, errors } = await openEditor(browser);
    for (const w of ['nuke', 'emp', 'rail']) {
      await page.selectOption('#weapon', w);
      await page.click('#slots button[data-slot="impact"]');
      if (w !== 'nuke') await page.check('#slow');
      await page.click('#fire');
      await page.waitForFunction(() => window.fxEditor.phase === 'settle', null, { timeout: 60_000 });
      await page.waitForTimeout(w === 'nuke' ? 1800 : 500);
      await page.locator('#stage').screenshot({ path: `test-results/tankity-fx-editor-${w}.png` });
      await page.uncheck('#slow');
    }
    expect(errors).toEqual([]);
  });
});
