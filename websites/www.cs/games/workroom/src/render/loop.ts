// A sustained sample's loop, crossfaded the way the composing pipeline's SFZ plays it under sfizz (loop_crossfade=1.0,
// music/compose/siue_compose/sfz.py). An AudioBufferSourceNode jumps from the loop's end straight back to its start;
// a recorded note's waveform and level do not match across that jump, so a held note clicks and lurches every time the
// loop comes round (every 2 to 6 seconds). Here the last stretch before the loop's end is faded into the stretch just
// before its start, so the sample reaching the end runs on into the start without a seam. DOM-free.

/** sfizz's loop_crossfade, in seconds, as the SFZ instruments set it. */
export const LOOP_CROSSFADE = 1;

/**
 * A copy of `ch` whose samples [end - n, end) are faded from themselves into the samples [start - n, start) on sfizz's
 * default S-shaped curve, (1 - cos(pi t)) / 2, whose two gains sum to 1 so a steady tone keeps its level through the
 * fade. Playing up to `end` and jumping to `start` is then seamless. `start` and `end` are sample indices; n is `fade` samples,
 * cut to what fits before `start` and inside the loop. A loop with no room for a fade comes back as a plain copy.
 */
export function crossfadeLoop(ch: Float32Array, start: number, end: number, fade: number): Float32Array<ArrayBuffer> {
  const out = Float32Array.from(ch);
  const last = Math.min(end, ch.length);
  const n = Math.floor(Math.min(fade, start, last - start));
  if (n < 1) return out;
  for (let k = 0; k < n; k++) {
    const t = (k + 1) / n;
    const i = last - n + k;
    const into = (1 - Math.cos(Math.PI * t)) / 2;
    out[i] = ch[i]! * (1 - into) + ch[start - n + k]! * into;
  }
  return out;
}

export type MakeBuffer = (channels: number, length: number, rate: number) => AudioBuffer;

const made = new WeakMap<AudioBuffer, Map<string, AudioBuffer>>();

/** `buffer` with its loop `[start, end]` (seconds) crossfaded, made once for each buffer and loop and kept with it. */
export function loopedBuffer(buffer: AudioBuffer, loop: readonly [number, number], make: MakeBuffer): AudioBuffer {
  const key = `${loop[0]}:${loop[1]}`;
  let byLoop = made.get(buffer);
  if (!byLoop) made.set(buffer, (byLoop = new Map()));
  const have = byLoop.get(key);
  if (have) return have;
  const rate = buffer.sampleRate;
  const out = make(buffer.numberOfChannels, buffer.length, rate);
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    out.copyToChannel(crossfadeLoop(buffer.getChannelData(c), Math.round(loop[0] * rate), Math.round(loop[1] * rate), LOOP_CROSSFADE * rate), c);
  }
  byLoop.set(key, out);
  return out;
}
