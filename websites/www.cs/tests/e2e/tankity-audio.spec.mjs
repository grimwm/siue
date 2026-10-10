// Operation Tankity audio files and game.json, in a real browser.
import { test, expect } from '@playwright/test';
import { recorderScript, hud } from './helpers.mjs';

/* Wraps Audio so tests can reach the playlist's element, and counts decoded
   sound-effect buffers actually started (the synth's 1 s noise buffer is not
   one of them). */
function audioProbe() {
  window.__audios = [];
  const Orig = window.Audio;
  window.Audio = function (...a) {
    const el = new Orig(...a);
    window.__audios.push(el);
    return el;
  };
  window.__samples = 0;
  const start = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (...a) {
    if (this.buffer && this.buffer.length !== this.buffer.sampleRate) window.__samples++;
    return start.apply(this, a);
  };
}

/* A fresh player whose audio-file requests are recorded from the first byte.
   `block` makes every audio file answer 404. */
async function open(browser, { block = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, serviceWorkers: 'block' });
  await ctx.addInitScript(recorderScript);
  await ctx.addInitScript(audioProbe);
  const page = await ctx.newPage();
  const errors = [];
  const files = [];
  const data = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => {
    const u = new URL(r.url()).pathname;
    if (/\/audio\/(sfx|music)\//.test(u)) files.push(u.replace(/^.*\/audio\//, 'audio/'));
    if (/\/(game|weapons|keys)\.json$/.test(u)) data.push(u.replace(/^.*\//, ''));
  });
  if (block) await page.route(/\/audio\/(sfx|music)\//, route => route.fulfill({ status: 404, body: 'gone' }));
  await page.goto('games/tankity/');
  await page.waitForTimeout(700);
  const config = await (await page.request.get('games/tankity/game.json')).json();
  return { ctx, page, errors, files, data, config };
}

const sfxFiles = config => Object.values(config.audio.sfx).map(e => e.file);
const musicFiles = config => config.audio.music.map(t => t.file);

test('the page loads game.json for arsenal, keys and audio, and nothing else', async ({ browser }) => {
  const { page, errors, data, config } = await open(browser);
  expect(data).toContain('game.json');
  expect(data.filter(d => d !== 'game.json')).toEqual([]);
  expect(Object.keys(config)).toEqual(expect.arrayContaining(['arsenal', 'keys', 'audio']));
  expect(config.arsenal.ammo.length).toBe(12);
  // The arsenal in the shop and the key labels in the help both came from it.
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  await expect.poll(() => page.locator('#shop-list li').count()).toBeGreaterThan(15);
  expect(await page.locator('#shop-list').textContent()).toContain('Heavy');
  expect(await page.locator('[data-keyhint="global:fullscreen"]').first().textContent()).toBe('F');
  expect(errors).toEqual([]);
});

test('no sound file is requested before a gesture; the first key press starts music and effects load on use', async ({ browser }) => {
  const { page, errors, files, config } = await open(browser);
  await page.waitForTimeout(800);
  expect(files).toEqual([]);
  await page.keyboard.press('n'); // opens the shop: a click effect plays
  await page.waitForSelector('#shop-veil:not([hidden])');
  await expect.poll(() => files.filter(f => f.startsWith('audio/sfx/')).length, { timeout: 15_000 }).toBe(sfxFiles(config).length);
  expect(new Set(files.filter(f => f.startsWith('audio/sfx/')))).toEqual(new Set(sfxFiles(config)));
  await expect.poll(() => files.includes(musicFiles(config)[0])).toBe(true);
  // Once decoded, effects play from the files, not the synth.
  await page.click('#shop-next');
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 30_000 }).toMatch(/YOU|Aim/);
  await page.keyboard.press('Control');
  await expect.poll(() => page.evaluate(() => window.__samples), { timeout: 15_000 }).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('with sound and music muted by the first tap, no sound file is requested; unmuting fetches them', async ({ browser }) => {
  const { page, errors, files, config } = await open(browser);
  await page.keyboard.press('m'); // the very first gesture turns the music off
  await page.keyboard.press('e');
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  await page.click('#shop-next');
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 30_000 }).toMatch(/YOU|Aim/);
  await page.keyboard.press('Control'); // fire: launch and boom would play
  await page.waitForTimeout(2500);
  expect(files).toEqual([]);
  await page.keyboard.press('m');
  await expect.poll(() => files.includes(musicFiles(config)[0])).toBe(true);
  expect(files.some(f => f.startsWith('audio/sfx/'))).toBe(false);
  await page.keyboard.press('e');
  await page.keyboard.press('c');
  await page.keyboard.press('Escape');
  await expect.poll(() => files.some(f => f.startsWith('audio/sfx/')), { timeout: 15_000 }).toBe(true);
  expect(errors).toEqual([]);
});

test('a missing sound file falls back to the built-in sounds without errors', async ({ browser }) => {
  const { page, errors, files, config } = await open(browser, { block: true });
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  await page.click('#shop-next');
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 30_000 }).toMatch(/YOU|Aim/);
  // Every track is tried once, then the synth songs take over for good.
  await expect.poll(() => new Set(files.filter(f => f.startsWith('audio/music/'))).size, { timeout: 15_000 }).toBe(musicFiles(config).length);
  await page.waitForTimeout(1500);
  const tries = files.filter(f => f.startsWith('audio/music/')).length;
  await page.waitForTimeout(1500);
  expect(files.filter(f => f.startsWith('audio/music/')).length).toBe(tries);
  expect(await page.evaluate(() => window.__samples)).toBe(0);
  // The game still plays: a shot flies and lands.
  await page.keyboard.press('Control');
  await expect.poll(() => page.evaluate(() => window.__rec.shells.length), { timeout: 10_000 }).toBeGreaterThan(0);
  await expect.poll(() => hud(page, 'hud-turn'), { timeout: 30_000 }).toMatch(/aiming|thinking|YOU|Aim|moves/i);
  expect(errors).toEqual([]);
});

test('the playlist advances to the next track when one ends and loops at the end', async ({ browser }) => {
  const { page, errors, config } = await open(browser);
  const tracks = musicFiles(config);
  expect(tracks.length).toBeGreaterThan(1);
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  const state = () => page.evaluate(() => {
    const el = window.__audios[0];
    return el ? { src: new URL(el.src).pathname, paused: el.paused, t: el.currentTime, d: el.duration, vol: el.volume } : null;
  });
  await expect.poll(async () => (await state())?.paused === false && (await state()).t > 0, { timeout: 20_000 }).toBe(true);
  const first = await state();
  expect(first.src.endsWith(tracks[0])).toBe(true);
  expect(first.vol).toBeCloseTo(config.audio.music[0].volume, 2);
  for (let i = 1; i <= tracks.length; i++) {
    // Seek close to the end; the element fires `ended` and the next track starts.
    await page.evaluate(() => { const el = window.__audios[0]; el.currentTime = Math.max(0, el.duration - 0.6); });
    const want = tracks[i % tracks.length];
    await expect.poll(async () => (await state()).src.endsWith(want), { timeout: 20_000 }).toBe(true);
    await expect.poll(async () => { const s = await state(); return !s.paused && s.t > 0; }, { timeout: 20_000 }).toBe(true);
  }
  // The log names what is playing.
  await page.keyboard.press('l');
  expect(await page.locator('#log-overlay').textContent()).toContain(`Now playing: ${config.audio.music[0].title}`);
  expect(errors).toEqual([]);
});

test('the Music toggle pauses and resumes the playlist', async ({ browser }) => {
  const { page, errors } = await open(browser);
  await page.keyboard.press('n');
  await page.waitForSelector('#shop-veil:not([hidden])');
  const paused = () => page.evaluate(() => !window.__audios[0] || window.__audios[0].paused);
  await expect.poll(async () => !(await paused()), { timeout: 20_000 }).toBe(true);
  await page.keyboard.press('m');
  await expect.poll(paused).toBe(true);
  await page.keyboard.press('m');
  await expect.poll(async () => !(await paused()), { timeout: 20_000 }).toBe(true);
  expect(errors).toEqual([]);
});
