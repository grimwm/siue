// A Vocal Track's clips played into one mono buffer, as the renderer hears them before the lane's Voice Effects and
// Sound: each clip copies its stretch of the take to its place in the piece at the lane's level and its own, with
// linear fades in and out. The take's samples are never changed. DOM-free.
import type { Lane } from '../score.ts';

/** `lane`'s clips as `length` samples at `rate`; `takes` holds each take's samples at that rate. */
export function vocalBuffer(lane: Lane, takes: ReadonlyMap<string, Float32Array>, length: number, rate: number): Float32Array<ArrayBuffer> {
  const out = new Float32Array(length);
  const laneGain = 10 ** ((lane.sound?.gain_db ?? 0) / 20);
  for (const c of lane.vocal?.clips ?? []) {
    const take = takes.get(c.take);
    if (!take) throw new Error(`the take ${c.take} of ${lane.name} could not be loaded`);
    const gain = laneGain * 10 ** (c.gain_db / 20);
    const from = Math.round(c.from * rate), to = Math.min(take.length, Math.round(c.to * rate));
    const at = Math.round(c.at * rate);
    const fadeIn = Math.round(c.fade_in * rate), fadeOut = Math.round(c.fade_out * rate);
    const n = to - from;
    for (let i = 0; i < n; i++) {
      const j = at + i;
      if (j >= length) break;
      let g = gain;
      if (i < fadeIn) g *= i / fadeIn;
      if (i >= n - fadeOut) g *= (n - i) / fadeOut;
      out[j] = out[j]! + take[from + i]! * g;
    }
  }
  return out;
}
