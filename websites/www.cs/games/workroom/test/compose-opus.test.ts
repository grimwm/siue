// Good To The Ear: Ogg pages and their CRCs, Opus packet lengths from the TOC, and the encoder's two roads.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { muxOggOpus, oggCrc, opusHead, opusPacketSamples, readOggPackets, OPUS_RATE } from '../src/compose/ogg.ts';
import { preSkipOf, recorderMime, webCodecsOpus } from '../src/compose/opus.ts';
import type { CodecPorts } from '../src/compose/opus.ts';

const fixture = (name: string) => new Uint8Array(readFileSync(join(import.meta.dirname, 'fixtures', 'takes', name)));

test('Ogg\'s CRC-32 of "123456789" is 0x89A1897F', () => {
  assert.equal(oggCrc(new TextEncoder().encode('123456789')), 0x89a1897f);
});

test('a TOC byte gives the packet\'s samples: one 20 ms CELT frame, two 10 ms SILK frames, a code 3 count', () => {
  assert.equal(opusPacketSamples(Uint8Array.of((31 << 3) | 0)), 960);
  assert.equal(opusPacketSamples(Uint8Array.of((0 << 3) | 1)), 960);
  assert.equal(opusPacketSamples(Uint8Array.of((16 << 3) | 3, 6)), 720);
  assert.equal(opusPacketSamples(Uint8Array.of((3 << 3) | 3, 3)), 0, 'three 60 ms frames is past 120 ms');
  assert.equal(opusPacketSamples(new Uint8Array(0)), 0);
});

test('a real Ogg Opus file reads back page by page, and its packets add up to its length', () => {
  const { packets, granule } = readOggPackets(fixture('sine-1.5s.opus'));
  assert.equal(new TextDecoder().decode(packets[0]!.subarray(0, 8)), 'OpusHead');
  const pre = preSkipOf(packets[0]!);
  const samples = packets.slice(2).reduce((n, p) => n + opusPacketSamples(p), 0);
  assert.ok(samples >= granule, 'the packets hold at least what the last granule says');
  assert.ok(Math.abs((granule - pre) / OPUS_RATE - 1.5) < 0.01, `about 1.5 s: ${(granule - pre) / OPUS_RATE}`);
});

test('the page\'s own muxing of those packets is a file ffmpeg reads as 1.5 s of Opus', () => {
  const { packets } = readOggPackets(fixture('sine-1.5s.opus'));
  const pre = preSkipOf(packets[0]!);
  const ours = muxOggOpus(packets.slice(2), pre, OPUS_RATE, 72000);
  const back = readOggPackets(ours);
  assert.equal(back.granule, pre + 72000);
  assert.deepEqual(back.packets.slice(2).map(p => p.length), packets.slice(2).map(p => p.length));
  const dir = mkdtempSync(join(tmpdir(), 'ogg-'));
  writeFileSync(join(dir, 'a.opus'), ours);
  let probe = '';
  try { probe = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name:format=duration', '-of', 'csv=p=0', join(dir, 'a.opus')]).toString(); } catch { return; /* no ffprobe here */ }
  assert.match(probe, /opus/);
  assert.ok(Math.abs(Number(probe.trim().split('\n').pop()) - 1.5) < 0.01, probe);
});

test('OpusHead names one channel, the pre-skip and the input rate; a description without it gives 312', () => {
  const h = opusHead(312, 44100);
  assert.equal(new TextDecoder().decode(h.subarray(0, 8)), 'OpusHead');
  assert.equal(h[9], 1);
  assert.equal(preSkipOf(h), 312);
  assert.equal(preSkipOf(undefined), 312);
  assert.equal(preSkipOf(new Uint8Array([1, 2, 3])), 312);
});

test('MediaRecorder prefers Ogg Opus, then WebM Opus, else none', () => {
  assert.deepEqual(recorderMime(m => m.startsWith('audio/ogg')), { mime: 'audio/ogg;codecs=opus', ext: 'ogg' });
  assert.deepEqual(recorderMime(m => m.startsWith('audio/webm')), { mime: 'audio/webm;codecs=opus', ext: 'webm' });
  assert.equal(recorderMime(() => false), null);
});

test('WebCodecs gets mono 48 kHz at 96 kbps in 20 ms frames, and its packets come back as Ogg', async () => {
  const configs: unknown[] = [];
  const frames: number[] = [];
  class FakeData { numberOfFrames: number; constructor(o: { numberOfFrames: number }) { this.numberOfFrames = o.numberOfFrames; } close() {} }
  class FakeEncoder {
    out: (c: { byteLength: number; copyTo(b: Uint8Array): void }, m?: unknown) => void;
    constructor(o: { output: FakeEncoder['out'] }) { this.out = o.output; }
    configure(c: unknown) { configs.push(c); }
    encode(d: FakeData) { frames.push(d.numberOfFrames); this.out({ byteLength: 3, copyTo: b => b.set([(31 << 3), 1, 2]) }, frames.length === 1 ? { decoderConfig: { description: opusHead(200, 48000) } } : undefined); }
    async flush() {}
    close() {}
  }
  const ports = { AudioEncoder: FakeEncoder, AudioData: FakeData } as unknown as CodecPorts;
  const file = await webCodecsOpus(new Float32Array(2400), ports);
  assert.deepEqual(configs, [{ codec: 'opus', sampleRate: 48000, numberOfChannels: 1, bitrate: 96000 }]);
  assert.deepEqual(frames, [960, 960, 480]);
  const back = readOggPackets(file.bytes);
  assert.equal(file.ext, 'ogg');
  assert.equal(preSkipOf(back.packets[0]), 200, 'the encoder\'s own pre-skip');
  assert.equal(back.granule, 200 + 2400);
});
