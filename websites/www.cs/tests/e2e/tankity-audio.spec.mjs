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
  // Round 1 plays the second track (the first is the demo's theme).
  await expect.poll(() => files.includes(musicFiles(config)[1])).toBe(true);
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
  await expect.poll(() => files.includes(musicFiles(config)[1])).toBe(true);
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

/* A short stand-in for a music file: 0.5 s of silence, a 3 s tone at
   `freq` Hz, 0.5 s of silence, so loops come round in seconds and the
   trimming of silence at both ends is visible. */
function toneWav(freq) {
  const rate = 22050, pad = rate / 2, tone = rate * 3, n = pad * 2 + tone;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < tone; i++) buf.writeInt16LE(Math.round(Math.sin(2 * Math.PI * freq * i / rate) * 12000), 44 + (pad + i) * 2);
  return buf;
}

/* Records every music pass: which file's buffer (by its tone length), and
   the start(when, offset, duration) it was given. */
function passProbe() {
  window.__passes = [];
  const start = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (when, offset, dur) {
    if (this.buffer && this.buffer.duration > 3.5) {
      window.__passes.push({ len: this.buffer.duration, ch: this.buffer.getChannelData(0)[Math.floor(this.buffer.sampleRate * 0.5) + 10], when, offset, dur, at: this.context.currentTime });
    }
    return start.apply(this, arguments);
  };
}

async function openWithTones(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 860 }, serviceWorkers: 'block' });
  await ctx.addInitScript(recorderScript);
  await ctx.addInitScript(passProbe);
  const page = await ctx.newPage();
  const errors = [];
  const music = [];
  page.on('pageerror', e => errors.push(e.message));
  const config = await (await page.request.get('games/tankity/game.json')).json();
  const tracks = musicFiles(config);
  await page.route(/\/audio\/music\//, route => {
    const file = new URL(route.request().url()).pathname.replace(/^.*\/audio\//, 'audio/');
    music.push(file);
    route.fulfill({ status: 200, contentType: 'audio/wav', body: toneWav(220 + 110 * tracks.indexOf(file)) });
  });
  await page.goto('games/tankity/');
  await page.waitForTimeout(700);
  return { ctx, page, errors, music, config, tracks };
}
const logText = page => page.locator('#log').textContent();

test('the demo plays the theme, loops it without a seam, and a round picks the next track', async ({ browser }) => {
  const { page, errors, music, config, tracks } = await openWithTones(browser);
  // Any key in the demo starts the music: always the first track, the theme.
  await page.keyboard.press('l');
  await expect.poll(() => music[0], { timeout: 15_000 }).toBe(tracks[0]);
  await expect.poll(() => logText(page), { timeout: 15_000 }).toContain(`Now playing: ${config.audio.music[0].title}`);
  // Two passes of the same track overlap: the second starts before the first
  // ends, and both skip the silent lead-in and tail.
  await expect.poll(() => page.evaluate(() => window.__passes.length), { timeout: 15_000 }).toBeGreaterThanOrEqual(2);
  const [a, b] = await page.evaluate(() => window.__passes.slice(0, 2));
  expect(b.len).toBe(a.len);
  expect(a.offset).toBeGreaterThan(0.45);
  expect(a.dur).toBeLessThan(3.2);
  expect(b.when).toBeLessThan(a.when + a.dur);
  expect(b.when).toBeGreaterThan(a.when + a.dur - 2.1);
  // A new match's round 1 switches to the next track.
  await page.keyboard.press('n');
  await expect.poll(() => music.includes(tracks[1]), { timeout: 15_000 }).toBe(true);
  await expect.poll(() => logText(page), { timeout: 15_000 }).toContain(`Now playing: ${config.audio.music[1].title}`);
  expect(errors).toEqual([]);
});

test('Next track steps through the soundtrack from the toolbar or the ] key', async ({ browser }) => {
  const { page, errors, music, config, tracks } = await openWithTones(browser);
  await page.keyboard.press('l');
  await expect.poll(() => music[0], { timeout: 15_000 }).toBe(tracks[0]);
  await page.click('#btn-track');
  await expect.poll(() => logText(page), { timeout: 15_000 }).toContain(`Now playing: ${config.audio.music[1].title}`);
  await page.keyboard.press(']');
  await expect.poll(() => logText(page), { timeout: 15_000 }).toContain(`Now playing: ${config.audio.music[2].title}`);
  expect(errors).toEqual([]);
});

test('the Music toggle stops the soundtrack and brings it back', async ({ browser }) => {
  const { page, errors } = await openWithTones(browser);
  await page.keyboard.press('l');
  await expect.poll(() => page.evaluate(() => window.__passes.length), { timeout: 15_000 }).toBeGreaterThanOrEqual(1);
  await page.keyboard.press('m');
  const muted = await page.evaluate(() => window.__passes.length);
  await page.waitForTimeout(4000); // longer than a pass: no new passes start
  expect(await page.evaluate(() => window.__passes.length)).toBe(muted);
  await page.keyboard.press('m');
  await expect.poll(() => page.evaluate(() => window.__passes.length), { timeout: 15_000 }).toBeGreaterThan(muted);
  expect(errors).toEqual([]);
});
