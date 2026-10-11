// The dev-only Tankity effects editor (local sites only: it is never deployed).
// Screenshots land in test-results/ (tankity-fx-*.png).
import { promises as fs } from 'node:fs';
import { readFileSync } from 'node:fs';
// The committed arsenal: counts follow it, so a new weapon needs no edit here.
const GAME = JSON.parse(readFileSync(new URL('../../games/tankity/game.json', import.meta.url), 'utf8'));
import { test, expect } from '@playwright/test';
import { newPlayer, hud, rec, resetRec, aimTo, setPower, recorderScript } from './helpers.mjs';
import { committedEffects, local, arsenal, grab, fireAndWatch } from './fx-helpers.mjs';

/* ---------- the dev-only editor (never deployed: local docker only) ---------- */
test.describe('effects editor', () => {
  test.skip(({ baseURL }) => !local(baseURL), 'the editor is dev-only and not deployed');

  async function openEditor(browser) {
    const ctx = await browser.newContext({ viewport: { width: 1500, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('games/tankity/fx-editor.html');
    await expect(page.locator('#weapon option')).toHaveCount(Object.keys(GAME.effects).length);
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
    await expect(page.locator('#weapon option')).toHaveCount(Object.keys(GAME.effects).length);
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
