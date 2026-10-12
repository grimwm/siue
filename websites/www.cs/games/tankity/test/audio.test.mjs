// Tankity's sound without a browser: the loop-point trim, which track a level
// plays, silence without Web Audio, and the track hand-off against the kit's
// fake context and a fetch whose loads land when the test says.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trimSilence, trackForLevel, sfx, music, initAudio, noteGesture, setSoundMuted } from '../src/audio.ts';
import { fakeAudioContext } from '../../_kit/test/audio.ts';

const near = (a, b) => Math.abs(a - b) < 1e-9;
// The module makes its one context the first time a sound needs it after
// AudioContext exists; every test after the hand-off shares this fake.
const ctx = fakeAudioContext();

test('trim keeps a track from its first sound to its last', () => {
  const loud = new Float32Array(100);
  loud.fill(0.5, 20, 80);
  loud[10] = 0.003; // under the floor: still silence
  const t = trimSilence({ sampleRate: 100, getChannelData: () => loud });
  assert.ok(near(t.start, 0.2) && near(t.end, 0.8), JSON.stringify(t));
});

test('trim of pure silence keeps the last sample; of no silence keeps all', () => {
  const quiet = trimSilence({ sampleRate: 100, getChannelData: () => new Float32Array(50) });
  assert.ok(near(quiet.start, 0.49) && near(quiet.end, 0.5), JSON.stringify(quiet));
  const whole = trimSilence({ sampleRate: 10, getChannelData: () => new Float32Array(10).fill(0.1) });
  assert.ok(near(whole.start, 0) && near(whole.end, 1), JSON.stringify(whole));
});

test('the demo plays the theme; rounds walk the other tracks and wrap', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6].map(l => trackForLevel(l, 4)), [0, 1, 2, 3, 1, 2, 3]);
  assert.equal(trackForLevel(0, 1), 0);
  assert.equal(trackForLevel(5, 1), 0);
});

test('with no AudioContext (this is Node) nothing throws and nothing plays', () => {
  assert.doesNotThrow(() => { sfx.play('boom'); sfx.turnPing(); music.start(); music.stop(); });
});

test('a skipped or stopped track that is still loading never keeps playing', async () => {
  globalThis.AudioContext = function AudioContext() { return ctx; };
  const pending = {};
  globalThis.fetch = file => new Promise(res => {
    pending[file] = () => res({ ok: true, arrayBuffer: () => Promise.resolve({ file }) });
  });
  const settle = async () => { for (let i = 0; i < 10; i++) await new Promise(r => setTimeout(r, 0)); };
  const land = async file => { pending[file](); await settle(); };
  const heard = () => ctx.nodes.filter(n => n.kind === 'source' && n.started !== null && n.stopped === null && n.buffer?.file).map(n => n.buffer.file);

  initAudio({ sfx: {}, music: [{ file: 'a.mp3' }, { file: 'b.mp3' }, { file: 'c.mp3' }] });
  noteGesture(false); // starts the theme, a.mp3
  await land('a.mp3');
  assert.deepEqual(heard(), ['a.mp3']);
  music.next(); // b.mp3 starts loading...
  music.next(); // ...and is skipped for c.mp3 before it arrives
  await land('b.mp3');
  await land('c.mp3');
  assert.deepEqual(heard(), ['c.mp3']);
  music.next(); // a.mp3 again (cached), then stop while it settles
  music.stop();
  await settle();
  assert.deepEqual(heard(), []);
});

test('muting sound silences effects', () => {
  setSoundMuted(true);
  const before = ctx.nodes.length;
  sfx.play('boom');
  sfx.turnPing();
  assert.equal(ctx.nodes.length, before);
  setSoundMuted(false);
});
