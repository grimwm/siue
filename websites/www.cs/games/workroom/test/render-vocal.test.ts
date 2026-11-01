// A Vocal Track in the renderer: each clip's stretch of its take lands where it is placed, at its level, faded; its
// Voice Effects change it on playback while the take stays untouched; a score with one takes the parts' road.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RATE, renderScore, usesSound } from '../src/render/engine.ts';
import type { RenderDeps } from '../src/render/engine.ts';
import type { Library } from '../src/render/plan.ts';
import { vocalBuffer } from '../src/render/vocal.ts';
import { parseScore } from '../src/score.ts';
import type { Lane, Score } from '../src/score.ts';

const LIBRARY: Library = JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', '..', 'music', 'library', 'library.json'), 'utf8'));
const T = `vocal-${'a'.repeat(64)}.flac`;
const R = 1000;
const lane = (clips: Lane['vocal'] extends infer V ? V extends { clips: infer C } ? C : never : never, gain_db = 0): Lane => ({
  id: 'voice', name: 'My Voice', family: 'voice', icon: 'voice', color: '#c0392b', sound: { instrument: 'vocal', gain_db, attack: 0, release: 0 },
  vocal: { takes: [{ file: T, seconds: 2 }], clips },
});
const ramp = Float32Array.from({ length: 2 * R }, (_, i) => i / (2 * R));

test('a clip copies its stretch of the take to its place, at its level', () => {
  const out = vocalBuffer(lane([{ take: T, at: 0.5, from: 1, to: 1.5, gain_db: -6.0206, fade_in: 0, fade_out: 0 }]), new Map([[T, ramp]]), 3 * R, R);
  assert.equal(out[499], 0);
  assert.ok(Math.abs(out[500]! - ramp[1000]! / 2) < 1e-6);
  assert.ok(Math.abs(out[999]! - ramp[1499]! / 2) < 1e-6);
  assert.equal(out[1000], 0, 'and nothing after it');
});

test('fades rise from silence and fall back to it; two clips add', () => {
  const ones = new Float32Array(2 * R).fill(1);
  const out = vocalBuffer(lane([
    { take: T, at: 0, from: 0, to: 1, gain_db: 0, fade_in: 0.5, fade_out: 0.25 },
    { take: T, at: 0.9, from: 0, to: 0.2, gain_db: 0, fade_in: 0, fade_out: 0 },
  ]), new Map([[T, ones]]), 2 * R, R);
  assert.equal(out[0], 0);
  assert.ok(Math.abs(out[250]! - 0.5) < 1e-6);
  assert.ok(Math.abs(out[600]! - 1) < 1e-6);
  assert.ok(out[950]! > 1, 'the second clip adds over the first one\'s fade');
  assert.ok(out[1050]! === 1, 'only the second clip is left');
});

test('the lane\'s own level is heard too, and a missing take says so', () => {
  const out = vocalBuffer(lane([{ take: T, at: 0, from: 0, to: 1, gain_db: 0, fade_in: 0, fade_out: 0 }], 6.0206), new Map([[T, new Float32Array(2 * R).fill(0.25)]]), R, R);
  assert.ok(Math.abs(out[10]! - 0.5) < 1e-5);
  assert.throws(() => vocalBuffer(lane([{ take: T, at: 0, from: 0, to: 1, gain_db: 0, fade_in: 0, fade_out: 0 }]), new Map(), R, R), /could not be loaded/);
});

/** A score with only a vocal lane, rendered through fakes: the bus that goes to the master is read back. */
async function renderVoice(voice: Score['lanes'][number]['voice']): Promise<{ bus: Float32Array; asked: string[] }> {
  const base = parseScore(JSON.parse(readFileSync(join(import.meta.dirname, 'fixtures', 'score-renderable-v1.json'), 'utf8')));
  assert.ok(base.ok);
  const v = lane([{ take: T, at: 0.5, from: 0, to: 1, gain_db: 0, fade_in: 0, fade_out: 0 }]);
  if (voice) v.voice = voice;
  const s: Score = { ...base.score, schema: 2, lanes: [v], notes: [], motifs: [] };
  let bus: Float32Array | null = null;
  const asked: string[] = [];
  const sine = Float32Array.from({ length: 2 * RATE }, (_, i) => 0.5 * Math.sin((2 * Math.PI * 233 * i) / RATE));
  const fakeCtx = (channels: number, length: number) => ({
    destination: {}, createGain: () => ({ gain: { value: 1 }, connect: (x: unknown) => x }),
    createWaveShaper: () => ({ connect: (x: unknown) => x }), createDelay: () => ({ delayTime: { value: 0 }, connect: (x: unknown) => x }),
    createOscillator: () => ({ frequency: { value: 0 }, connect: (x: unknown) => x, start() {} }),
    createBiquadFilter: () => ({ frequency: { value: 0 }, Q: { value: 0 }, connect: (x: unknown) => x }),
    createBuffer: (c: number, n: number) => { const d = Array.from({ length: c }, () => new Float32Array(n)); return { copyToChannel: (src: Float32Array, k: number) => { d[k]!.set(src); if (k === 0) bus = d[0]!; } }; },
    createBufferSource: () => ({ connect: (x: unknown) => x, start() {} }),
    startRendering: async () => { const d = Array.from({ length: channels }, () => new Float32Array(length)); return { numberOfChannels: channels, getChannelData: (k: number) => d[k]! }; },
  });
  const deps: RenderDeps = {
    context: (c, n) => fakeCtx(c, n) as unknown as OfflineAudioContext,
    fetchBytes: async () => new ArrayBuffer(8), decode: async () => ({}) as AudioBuffer, cache: new Map(),
    take: async file => { asked.push(file); return { numberOfChannels: 1, getChannelData: () => sine } as unknown as AudioBuffer; },
  };
  assert.ok(usesSound(s), 'a vocal track takes the parts\' road');
  await renderScore(s, LIBRARY, deps);
  return { bus: bus!, asked };
}

test('the renderer plays the take where its clip is, asking for it once', async () => {
  const { bus, asked } = await renderVoice(undefined);
  assert.deepEqual(asked, [T]);
  assert.equal(bus[RATE * 0.5 - 10], 0);
  assert.ok(Math.abs(bus[RATE * 0.5 + 1000]! - 0.5 * Math.sin((2 * Math.PI * 233 * 1000) / RATE)) < 1e-4);
});

test('Robot changes the voice on playback, and the take it came from is untouched', async () => {
  const dry = (await renderVoice(undefined)).bus;
  const wet = (await renderVoice([{ effect: 'robot', mix: 1 }])).bus;
  let diff = 0;
  for (let i = RATE * 0.5; i < RATE * 1.5; i++) diff += Math.abs(wet[i]! - dry[i]!);
  assert.ok(diff > 100, `Robot changed the sound: ${diff}`);
});
