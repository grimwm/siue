// The music's level against the effects, measured. The bus gains come from the
// real chain (the kit's fake context); the file levels are decoded with ffmpeg
// (skipped where it is not installed), so the check follows the actual files.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MUSIC_HEADROOM, sfx, music, initAudio, noteGesture } from '../src/audio.ts';
import { DEFAULT_LEVEL, gainFor } from '../src/volume.ts';
import { fakeAudioContext } from '../../_kit/test/audio.ts';

const ctx = fakeAudioContext();
Reflect.set(globalThis, 'AudioContext', function AudioContext() { return ctx; });
const dir = fileURLToPath(new URL('..', import.meta.url));
const db = (x: number) => 20 * Math.log10(x);

test('music headroom is a real cut, under the effects bus', () => {
  assert.ok(MUSIC_HEADROOM > 0.2 && MUSIC_HEADROOM < 0.6, String(MUSIC_HEADROOM));
});

test('the buses: at the default levels, sound and music through the curve, music under the headroom (track player and synth alike)', async () => {
  initAudio({ sfx: {}, music: [] }); // no tracks: the synth fallback plays
  noteGesture(false);
  sfx.play('boom');
  await new Promise(r => setTimeout(r, 150)); // the synth scheduler ticks every 60 ms
  music.stop();
  const buses = ctx.nodes.filter(n => n.kind === 'gain' && n.to.includes(ctx.destination));
  assert.equal(buses.length, 2);
  const [sound, mus] = buses;
  assert.ok(sound?.kind === 'gain' && mus?.kind === 'gain');
  assert.equal(sound.gain.value, gainFor(DEFAULT_LEVEL.sound));
  assert.equal(mus.gain.value, gainFor(DEFAULT_LEVEL.music) * MUSIC_HEADROOM);
  // Every synthesized music voice feeds the music bus, every effect the sound bus.
  const feeds = (bus: unknown) => ctx.nodes.filter(n => n.kind === 'gain' && n.to.includes(bus));
  assert.ok(feeds(mus).length > 0 && feeds(sound).length > 0);
});

const ffmpeg = spawnSync('ffmpeg', ['-version']).status === 0;

function pcm(file: string, secs: number): Float32Array {
  const b = execFileSync('ffmpeg', ['-v', 'error', '-t', String(secs), '-i', dir + file, '-ac', '1', '-ar', '22050', '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length));
}
const rms = (a: Float32Array, s: number, e: number): number => {
  let t = 0;
  for (let i = s; i < e; i++) t += a[i]! * a[i]!;
  return Math.sqrt(t / Math.max(1, e - s));
};
/** An effect's loudest quarter second, as the ear catches a burst. */
function burstDb(a: Float32Array): number {
  const w = Math.floor(22050 / 4);
  let m = 0;
  for (let i = 0; i + w <= a.length; i += w >> 2) m = Math.max(m, rms(a, i, i + w));
  return db(m);
}

test('at the default levels the music sits 6 to 10 dB under the loud effects', { skip: !ffmpeg && 'ffmpeg is not installed' }, () => {
  const game = JSON.parse(readFileSync(dir + 'game.json', 'utf8')) as {
    audio: { sfx: Record<string, { file: string; volume: number }>; music: { file: string; volume: number }[] };
  };
  // The shell blast, the launch and the win fanfare: the loud ones.
  const effects = ['boom', 'launch', 'fanfare'].map(n => {
    const e = game.audio.sfx[n]!;
    return burstDb(pcm(e.file, 5)) + db(e.volume) + db(gainFor(DEFAULT_LEVEL.sound));
  });
  const effect = effects.reduce((a, b) => a + b, 0) / effects.length;
  const tracks = game.audio.music.map(t => db(rms(pcm(t.file, 40), 0, 22050 * 40)) + db(t.volume * MUSIC_HEADROOM * gainFor(DEFAULT_LEVEL.music)));
  const mus = tracks.reduce((a, b) => a + b, 0) / tracks.length;
  const gap = effect - mus;
  console.log(`effects ${effect.toFixed(1)} dB (${effects.map(x => x.toFixed(1)).join(', ')}), music ${mus.toFixed(1)} dB, gap ${gap.toFixed(1)} dB`);
  assert.ok(gap >= 6 && gap <= 10, `music is ${gap.toFixed(1)} dB under the effects`);
});
