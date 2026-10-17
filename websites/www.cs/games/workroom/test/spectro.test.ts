import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BRIGHTNESS_LEGEND, freqToY, spectroAxis } from '../src/spectro.ts';
import type { Spectrogram } from '../src/score.ts';

const spec: Spectrogram = { file: 'spectrogram.png', low_hz: 30, high_hz: 16000, scale: 'log' };

test('low at the bottom, high at the top, log spaced', () => {
  assert.equal(freqToY(spec, 30, 300), 300);
  assert.equal(freqToY(spec, 16000, 300), 0);
  const mid = Math.sqrt(30 * 16000);
  assert.ok(Math.abs(freqToY(spec, mid, 300) - 150) < 1e-9);
});

test('a linear scale spaces evenly', () => {
  const lin: Spectrogram = { ...spec, low_hz: 0, high_hz: 8000, scale: 'linear' };
  assert.equal(freqToY(lin, 4000, 200), 100);
  assert.deepEqual(spectroAxis(lin, 200).map(l => l.text), ['high', '1 kHz', '100 Hz', 'low']);
});

test('labels in plain words and Hz', () => {
  assert.deepEqual(spectroAxis(spec, 300).map(l => l.text), ['high', '10 kHz', '1 kHz', '100 Hz', 'low']);
  assert.deepEqual(BRIGHTNESS_LEGEND, ['dark: quiet', 'bright: loud']);
});

test('ticks outside the range are left out', () => {
  const narrow: Spectrogram = { ...spec, low_hz: 200, high_hz: 5000 };
  assert.deepEqual(spectroAxis(narrow, 300).map(l => l.text), ['high', '1 kHz', 'low']);
});
