// Tankity's volume: the perceptual curve, what an old on/off key becomes, a
// mute that keeps the level, and the levels reaching the buses (the kit's fake
// context). Storage that throws never breaks it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_LEVEL, LEGACY_KEYS, VOLUME_KEY, clampLevel, createVolume, gainFor, parseVolume } from '../src/volume.ts';
import * as audio from '../src/audio.ts';
import { MUSIC_HEADROOM } from '../src/audio.ts';
import { fakeAudioContext } from '../../_kit/test/audio.ts';
import type { StorageLike } from '../../_kit/ports.ts';

const ctx = fakeAudioContext();
Reflect.set(globalThis, 'AudioContext', function AudioContext() { return ctx; });
const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;

function memory(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: k => (k in data ? data[k]! : null),
    setItem: (k, v) => { data[k] = v; },
    removeItem: k => { delete data[k]; },
  };
}
const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
/** The sound and music buses: the two gains wired to the destination, in creation order. */
function buses() {
  const found = ctx.nodes.filter(n => n.kind === 'gain' && n.to.includes(ctx.destination));
  const [sound, mus] = found;
  assert.ok(sound?.kind === 'gain' && mus?.kind === 'gain', 'both buses exist');
  return { sound: sound.gain.value, music: mus.gain.value };
}

test('the curve is the square: 0 is silent, 100 is unity, 50 is 12 dB down', () => {
  assert.equal(gainFor(0), 0);
  assert.equal(gainFor(100), 1);
  assert.ok(near(gainFor(50), 0.25));
  assert.ok(Math.abs(20 * Math.log10(gainFor(50)) + 12.04) < 0.01);
  assert.ok(gainFor(30) < gainFor(31) && gainFor(99) < gainFor(100), 'strictly rising');
});

test('the curve and the slider clamp anything out of range', () => {
  assert.equal(gainFor(-5), 0);
  assert.equal(gainFor(250), 1);
  assert.equal(gainFor(Number.NaN), 0);
  assert.deepEqual([clampLevel(-1), clampLevel(49.6), clampLevel(101), clampLevel(Number.NaN)], [0, 50, 100, 0]);
});

test('a fresh browser starts at the defaults, unmuted', () => {
  assert.deepEqual(parseVolume(null), {
    sound: { level: DEFAULT_LEVEL.sound, muted: false }, music: { level: DEFAULT_LEVEL.music, muted: false },
  });
  assert.deepEqual(DEFAULT_LEVEL, { sound: 80, music: 80 });
});

test('migration: an old music "off" is muted at the default level; "on" and other values are not', () => {
  const m = parseVolume(null, { sound: null, music: 'off' });
  assert.deepEqual(m.music, { level: DEFAULT_LEVEL.music, muted: true });
  assert.deepEqual(m.sound, { level: DEFAULT_LEVEL.sound, muted: false });
  assert.equal(parseVolume(null, { sound: 'off', music: 'on' }).sound.muted, true);
  assert.equal(parseVolume(null, { sound: 'on', music: 'on' }).music.muted, false);
  // And the real store: createVolume reads the old keys when the new one is absent.
  const store = memory({ [LEGACY_KEYS.music]: 'off' });
  const v = createVolume(store, nullAudio());
  assert.equal(v.muted('music'), true);
  assert.equal(v.level('music'), DEFAULT_LEVEL.music);
});

test('a saved value wins over old keys; damaged or odd values fall back per channel', () => {
  const saved = JSON.stringify({ sound: { level: 30, muted: true }, music: { level: 'loud', muted: 'yes' } });
  assert.deepEqual(parseVolume(saved, { sound: 'on', music: 'off' }), {
    sound: { level: 30, muted: true }, music: { level: DEFAULT_LEVEL.music, muted: false },
  });
  for (const bad of ['{', 'null', '7', '[]', '"x"']) assert.deepEqual(parseVolume(bad), parseVolume(null), bad);
  assert.equal(parseVolume(JSON.stringify({ sound: { level: 400 } })).sound.level, 100);
});

function nullAudio() {
  let sm = false, mm = false;
  return {
    setSoundLevel() {}, setMusicLevel() {}, setSoundMuted: (m: boolean) => { sm = m; }, setMusicMuted: (m: boolean) => { mm = m; },
    isSoundMuted: () => sm, isMusicMuted: () => mm,
  };
}

test('mute keeps the level, unmute restores it, and the level survives a reload', () => {
  const store = memory();
  const v = createVolume(store, nullAudio());
  v.setLevel('music', 30);
  v.toggleMute('music');
  assert.deepEqual([v.muted('music'), v.level('music')], [true, 30]);
  v.toggleMute('music');
  assert.deepEqual([v.muted('music'), v.level('music')], [false, 30]);
  v.toggleMute('sound');
  const again = createVolume(store, nullAudio());
  assert.deepEqual([again.level('music'), again.muted('music'), again.muted('sound'), again.level('sound')], [30, false, true, DEFAULT_LEVEL.sound]);
  assert.equal(JSON.parse(store.data[VOLUME_KEY]!).music.level, 30);
});

test('storage that throws never breaks it; the session keeps the choice', () => {
  const broken: StorageLike = {
    getItem() { throw new Error('denied'); }, setItem() { throw new Error('full'); }, removeItem() { throw new Error('denied'); },
  };
  const v = createVolume(broken, nullAudio());
  assert.equal(v.level('sound'), DEFAULT_LEVEL.sound);
  assert.doesNotThrow(() => { v.setLevel('sound', 10); v.toggleMute('music'); });
  assert.deepEqual([v.level('sound'), v.muted('music')], [10, true]);
});

test('levels reach the buses through the curve, the music under its headroom', async () => {
  audio.initAudio({ sfx: {}, music: [] });
  audio.noteGesture(false);
  const v = createVolume(memory(), audio);
  assert.ok(near(buses().sound, gainFor(DEFAULT_LEVEL.sound)));
  assert.ok(near(buses().music, gainFor(DEFAULT_LEVEL.music) * MUSIC_HEADROOM));
  v.setLevel('sound', 100);
  v.setLevel('music', 100);
  assert.deepEqual(buses(), { sound: 1, music: MUSIC_HEADROOM });
  v.setLevel('music', 30);
  v.setLevel('sound', 50);
  assert.ok(near(buses().music, 0.09 * MUSIC_HEADROOM));
  assert.ok(near(buses().sound, 0.25));
  audio.music.stop();
});

test('muting zeroes the bus and unmuting brings the slider\'s level back, not the default', async () => {
  const v = createVolume(memory(), audio);
  v.setLevel('music', 30);
  v.setLevel('sound', 60);
  v.toggleMute('sound');
  assert.equal(buses().sound, 0);
  v.toggleMute('music');
  await wait(450); // the music fades out before its bus goes silent
  assert.equal(buses().music, 0);
  v.toggleMute('sound');
  v.toggleMute('music');
  assert.ok(near(buses().sound, 0.36));
  assert.ok(near(buses().music, 0.09 * MUSIC_HEADROOM));
  audio.music.stop();
});

test('moving a muted slider changes the level it will return to, not the bus', async () => {
  const v = createVolume(memory(), audio);
  v.toggleMute('sound');
  v.setLevel('sound', 20);
  assert.equal(buses().sound, 0);
  v.toggleMute('sound');
  assert.ok(near(buses().sound, 0.04));
});

test('a muted state saved earlier is applied at load, before any sound', async () => {
  const v = createVolume(memory({ [VOLUME_KEY]: JSON.stringify({ sound: { level: 70, muted: true }, music: { level: 40, muted: true } }) }), audio);
  assert.deepEqual([audio.isSoundMuted(), audio.isMusicMuted()], [true, true]);
  assert.deepEqual([v.level('sound'), v.level('music')], [70, 40]);
  await wait(450);
  assert.deepEqual(buses().sound, 0);
  createVolume(memory(), audio); // leave it unmuted for any later test
  audio.music.stop();
});
