// The sound picture drawn from rendered audio: rows run high at the top to low at the bottom on a log scale, and a
// tone lights the row its pitch maps to, in the column where it sounds.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPECTRUM_RANGE, rowHz, spectrum } from '../src/render/spectrum.ts';

const RATE = 48000;
const tone = (hz: number, seconds: number, from = 0, to = seconds): Float32Array => {
  const out = new Float32Array(Math.round(seconds * RATE));
  for (let i = Math.round(from * RATE); i < Math.round(to * RATE); i++) out[i] = 0.5 * Math.sin((2 * Math.PI * hz * i) / RATE);
  return out;
};
/** The brightness of a pixel: its red, green and blue summed. */
const bright = (p: { width: number; data: Uint8ClampedArray }, x: number, y: number): number => {
  const i = (y * p.width + x) * 4;
  return p.data[i]! + p.data[i + 1]! + p.data[i + 2]!;
};

test('a picture with no spectrogram in its score spans 20 Hz to 12 kHz', () => {
  assert.deepEqual(SPECTRUM_RANGE, { low_hz: 20, high_hz: 12000 });
});

test('rows map high at the top to low at the bottom on a log scale', () => {
  const rows = 200;
  assert.ok(Math.abs(rowHz(-0.5, rows, 20, 12000) - 12000) < 1e-6, 'the top edge is high_hz');
  assert.ok(Math.abs(rowHz(rows - 0.5, rows, 20, 12000) - 20) < 1e-6, 'the bottom edge is low_hz');
  assert.ok(Math.abs(rowHz(rows / 2 - 0.5, rows, 20, 12000) - Math.sqrt(20 * 12000)) < 1e-6, 'the middle is the geometric mean');
  // Equal steps down are equal ratios.
  const ratio = rowHz(10, rows, 20, 12000) / rowHz(11, rows, 20, 12000);
  assert.ok(Math.abs(ratio - rowHz(150, rows, 20, 12000) / rowHz(151, rows, 20, 12000)) < 1e-9);
});

test('a tone lights the row its pitch maps to, only while it sounds', () => {
  const rows = 100;
  const pic = spectrum([tone(1000, 2, 0, 1)], RATE, { width: 20, height: rows, low_hz: 20, high_hz: 12000 });
  assert.equal(pic.width, 20);
  assert.equal(pic.height, rows);
  assert.equal(pic.data.length, 20 * rows * 4);
  // The row whose centre is nearest 1 kHz on the log scale.
  const want = Math.round(rows * (1 - Math.log(1000 / 20) / Math.log(12000 / 20)) - 0.5);
  const column = (x: number): number[] => Array.from({ length: rows }, (_, y) => bright(pic, x, y));
  const lit = column(4);
  const top = lit.indexOf(Math.max(...lit));
  assert.ok(Math.abs(top - want) <= 1, `the brightest row ${top} is near row ${want}`);
  assert.ok(lit[top]! > lit[10]! && lit[top]! > lit[90]!, 'brighter than rows far from the tone');
  assert.ok(Math.max(...column(16)) < lit[top]!, 'the silent second is darker');
  assert.ok(pic.data.every((v, i) => i % 4 !== 3 || v === 255), 'every pixel is opaque');
});

test('the score\'s own range moves the tone: a narrower range puts 1 kHz in the middle', () => {
  const rows = 50;
  const pic = spectrum([tone(1000, 1)], RATE, { width: 4, height: rows, low_hz: 100, high_hz: 10000 });
  const lit = Array.from({ length: rows }, (_, y) => bright(pic, 2, y));
  const top = lit.indexOf(Math.max(...lit));
  assert.ok(Math.abs(top - (rows / 2 - 0.5)) <= 1, `1 kHz sits mid-way between 100 Hz and 10 kHz, at row ${top}`);
});

test('stereo is drawn as its mix', () => {
  const l = tone(2000, 1);
  const pic = spectrum([l, new Float32Array(l.length)], RATE, { width: 4, height: 40, low_hz: 20, high_hz: 12000 });
  const mono = spectrum([l.map(v => v / 2)], RATE, { width: 4, height: 40, low_hz: 20, high_hz: 12000 });
  assert.deepEqual(pic.data, mono.data);
});

test('one channel is drawn as it is, with no copy of it made', () => {
  const x = tone(1000, 1);
  const F32 = Float32Array;
  let big = 0;
  globalThis.Float32Array = new Proxy(F32, {
    construct(target, args, newTarget) {
      const made = Reflect.construct(target, args, newTarget) as Float32Array;
      if (made.length >= x.length) big++;
      return made;
    },
  });
  let picture;
  try {
    picture = spectrum([x], RATE, { width: 8, height: 32, low_hz: 20, high_hz: 12000 });
  } finally {
    globalThis.Float32Array = F32;
  }
  assert.equal(big, 0);
  assert.deepEqual(picture, spectrum([x, x], RATE, { width: 8, height: 32, low_hz: 20, high_hz: 12000 }), 'the same picture as its stereo pair');
});
