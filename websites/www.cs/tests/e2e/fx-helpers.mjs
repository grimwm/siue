// Shared by the tankity-fx-*.spec.mjs files: reading the committed effects,
// spotting a local site, the arsenal, and grabbing effect draws off a canvas.
import { promises as fs } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { hud, rec, resetRec, aimTo, setPower } from './helpers.mjs';

/* The effects: block at the end of game.yaml, as committed. */
export async function committedEffects() {
  const text = await fs.readFile(fileURLToPath(new URL('../../games/tankity/game.yaml', import.meta.url)), 'utf8');
  return text.slice(text.search(/^effects:$/m));
}

export const local = base => /^https?:\/\/(127\.0\.0\.1|localhost)[:/]/.test(base || '');

export async function arsenal(page) {
  const data = await page.evaluate(() => fetch('game.json').then(r => r.json()));
  return Object.fromEntries(data.arsenal.ammo.map(a => [a.key, a]));
}

/* The canvas as drawn `frames` animation frames after the first sprite frame
   (a blast landing), read inside the page so the photo is of the blast at its
   peak rather than of whatever a slow screenshot catches. */
export function grab(page, canvasId, counter, frames) {
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
export async function fireAndWatch(page, name) {
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
