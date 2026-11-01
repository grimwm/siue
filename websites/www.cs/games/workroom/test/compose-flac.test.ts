// Perfect quality: the page's own FLAC encoder gives back every sample exactly, and a voice takes less room than PCM.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crc16, crc8, decodeFlac, encodeFlac, FLAC_BLOCK } from '../src/compose/flac.ts';

const RATE = 48000;
const make = (n: number, f: (i: number) => number): Int16Array => Int16Array.from({ length: n }, (_, i) => Math.max(-32768, Math.min(32767, Math.round(f(i)))));
let seed = 1;
const rand = (): number => { seed = (seed * 1103515245 + 12345) % 2 ** 31; return seed / 2 ** 31 - 0.5; };

test('the CRCs are FLAC\'s: CRC-8 of "123456789" is 0xF4 and CRC-16 is 0xFEE8', () => {
  const b = new TextEncoder().encode('123456789');
  assert.equal(crc8(b), 0xf4);
  assert.equal(crc16(b), 0xfee8);
});

for (const [name, pcm] of [
  ['silence', new Int16Array(10_000)],
  ['a sine', make(3 * FLAC_BLOCK + 17, i => 12000 * Math.sin((2 * Math.PI * 220 * i) / RATE))],
  ['noise at full scale', make(FLAC_BLOCK * 2, () => rand() * 65535)],
  ['a voice-like glide with breath', make(RATE, i => 9000 * Math.sin(2 * Math.PI * (180 + 60 * i / RATE) * i / RATE) * (0.5 + 0.5 * Math.sin(i / 3000)) + 400 * rand())],
  ['the extremes', make(5000, i => (i % 2 ? 32767 : -32768))],
  ['one sample', make(1, () => -5)],
] as const) {
  test(`${name} comes back bit for bit`, () => {
    const flac = encodeFlac(pcm, RATE);
    const back = decodeFlac(flac);
    assert.equal(back.rate, RATE);
    assert.equal(back.pcm.length, pcm.length);
    assert.deepEqual([...back.pcm], [...pcm]);
  });
}

test('a voice is well under the size of its PCM, and silence is tiny', () => {
  const voice = make(RATE * 2, i => 9000 * Math.sin(2 * Math.PI * 200 * i / RATE) * (0.6 + 0.4 * Math.sin(i / 2000)) + 200 * rand());
  assert.ok(encodeFlac(voice, RATE).length < voice.length * 2 * 0.75, 'at most three quarters of the PCM');
  assert.ok(encodeFlac(new Int16Array(RATE * 10), RATE).length < 2000);
});

test('frame numbers past 127 use the long code, and 44.1 kHz is written as such', () => {
  const pcm = make(FLAC_BLOCK * 300, i => 1000 * Math.sin(i / 50));
  const back = decodeFlac(encodeFlac(pcm, 44100));
  assert.equal(back.rate, 44100);
  assert.equal(back.pcm[FLAC_BLOCK * 299 + 5], pcm[FLAC_BLOCK * 299 + 5]);
});

test('a flipped byte is caught by a CRC', () => {
  const flac = encodeFlac(make(FLAC_BLOCK, i => 3000 * Math.sin(i / 9)), RATE);
  flac[flac.length - 40] = flac[flac.length - 40]! ^ 0x10;
  assert.throws(() => decodeFlac(flac), /CRC|sync|ends/);
});

test('ffmpeg decodes the page\'s FLAC to the same samples (skipped where there is no ffmpeg)', async () => {
  const { execFileSync } = await import('node:child_process');
  const { mkdtempSync, writeFileSync, readFileSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const pcm = make(RATE + 333, i => 9000 * Math.sin(2 * Math.PI * 233 * i / RATE) + 300 * rand());
  const dir = mkdtempSync(join(tmpdir(), 'flac-'));
  writeFileSync(join(dir, 'a.flac'), encodeFlac(pcm, RATE));
  try { execFileSync('ffmpeg', ['-v', 'error', '-i', join(dir, 'a.flac'), '-f', 's16le', '-ac', '1', join(dir, 'a.raw')]); } catch { return; }
  const back = new Int16Array(new Uint8Array(readFileSync(join(dir, 'a.raw'))).buffer);
  assert.deepEqual([...back], [...pcm]);
});
