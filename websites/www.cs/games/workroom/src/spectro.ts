// The sound picture's frequency axis: where a pitch sits on the spectrogram and
// the plain-words labels beside it. DOM-free.
import type { Spectrogram } from './score.ts';


const TICKS: readonly { hz: number; text: string }[] = [
  { hz: 10000, text: '10 kHz' },
  { hz: 1000, text: '1 kHz' },
  { hz: 100, text: '100 Hz' },
];

/** Pixels down from the top: low_hz is at height, high_hz at 0. */
export function freqToY(spec: Spectrogram, hz: number, height: number): number {
  const frac = spec.scale === 'log'
    ? Math.log(hz / spec.low_hz) / Math.log(spec.high_hz / spec.low_hz)
    : (hz - spec.low_hz) / (spec.high_hz - spec.low_hz);
  return height * (1 - frac);
}

/** "high" at the top, "low" at the bottom, and Hz ticks (100 Hz, 1 kHz, 10 kHz) that fall inside the range. */
export function spectroAxis(spec: Spectrogram, height: number): { y: number; text: string }[] {
  const inside = TICKS.filter(t => t.hz > spec.low_hz && t.hz < spec.high_hz)
    .map(t => ({ y: freqToY(spec, t.hz, height), text: t.text }));
  return [{ y: 0, text: 'high' }, ...inside, { y: height, text: 'low' }];
}

/** The sound picture's drawing height. */
export const PICTURE_H = 200;
