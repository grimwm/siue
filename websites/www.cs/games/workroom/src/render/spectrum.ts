// The sound picture of rendered audio, the way the composing pipeline draws spectrogram.png (ffmpeg's showspectrumpic
// with a log frequency axis, log intensity and the intensity palette): a short-time Fourier transform of the mix, one
// column per stretch of time, the rows high at the top to low at the bottom on a log scale. DOM-free: the page puts
// the pixels in an ImageData.

/** The range drawn when the score names none, the pipeline's own (music/compose/siue_compose/export.py). */
export const SPECTRUM_RANGE = { low_hz: 20, high_hz: 12000 } as const;

export interface SpectrumSize { width: number; height: number; low_hz: number; high_hz: number }
/** RGBA pixels, row by row from the top, as an ImageData holds them. */
export interface Picture { width: number; height: number; data: Uint8ClampedArray<ArrayBuffer> }

const FFT_SIZE = 4096; // 11.7 Hz bins at 48 kHz, fine enough to tell the lowest rows apart
const FLOOR_DB = -90; // quieter than this is black; 0 dBFS is white

/** The frequency at `row` (0 the top row's centre, -0.5 its top edge) of `height` rows from high_hz down to low_hz. */
export function rowHz(row: number, height: number, low: number, high: number): number {
  return low * (high / low) ** (1 - (row + 0.5) / height);
}

/** ffmpeg's intensity palette as RGB stops: black through violet and red to yellow and white. */
const PALETTE: readonly [number, number, number, number][] = [
  [0, 0, 0, 0], [0.13, 30, 8, 70], [0.3, 106, 10, 110], [0.6, 224, 74, 26], [0.73, 245, 178, 32], [1, 255, 255, 255],
];
function paint(level: number, out: Uint8ClampedArray, at: number): void {
  let i = 1;
  while (i < PALETTE.length - 1 && level > PALETTE[i]![0]) i++;
  const [a, ar, ag, ab] = PALETTE[i - 1]!;
  const [b, br, bg, bb] = PALETTE[i]!;
  const f = Math.min(1, Math.max(0, (level - a) / (b - a)));
  out[at] = ar + (br - ar) * f;
  out[at + 1] = ag + (bg - ag) * f;
  out[at + 2] = ab + (bb - ab) * f;
  out[at + 3] = 255;
}

/** The FFT's twiddle factors, cos and sin of -2πk/FFT_SIZE for k below FFT_SIZE / 2. */
const COS = Float64Array.from({ length: FFT_SIZE / 2 }, (_, k) => Math.cos((-2 * Math.PI * k) / FFT_SIZE));
const SIN = Float64Array.from({ length: FFT_SIZE / 2 }, (_, k) => Math.sin((-2 * Math.PI * k) / FFT_SIZE));

/** An in-place radix-2 FFT of `re`/`im`, FFT_SIZE long. */
function fft(re: Float64Array, im: Float64Array): void {
  const n = FFT_SIZE;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j]!, re[i]!];
      [im[i], im[j]] = [im[j]!, im[i]!];
    }
  }
  for (let size = 2; size <= n; size <<= 1) {
    const stride = n / size;
    for (let start = 0; start < n; start += size) {
      for (let k = 0; k < size / 2; k++) {
        const wr = COS[k * stride]!;
        const wi = SIN[k * stride]!;
        const a = start + k;
        const b = a + size / 2;
        const tr = re[b]! * wr - im[b]! * wi;
        const ti = re[b]! * wi + im[b]! * wr;
        re[b] = re[a]! - tr;
        im[b] = im[a]! - ti;
        re[a] = re[a]! + tr;
        im[a] = im[a]! + ti;
      }
    }
  }
}

/**
 * The picture of `channels` (their mix) at `rate`: `width` columns, each a Hann-windowed frame centred on its stretch
 * of time, and `height` rows between low_hz and high_hz, each the loudest bin its band covers, in dB from FLOOR_DB to 0.
 */
export function spectrum(channels: readonly Float32Array[], rate: number, size: SpectrumSize): Picture {
  const { width, height, low_hz, high_hz } = size;
  const length = channels[0]?.length ?? 0;
  const mono = new Float32Array(length);
  for (const c of channels) for (let i = 0; i < length; i++) mono[i]! += c[i]! / channels.length;
  const window = Float64Array.from({ length: FFT_SIZE }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / FFT_SIZE));
  // A full-scale sine through the Hann window peaks at FFT_SIZE / 4.
  const full = FFT_SIZE / 4;
  const binHz = rate / FFT_SIZE;
  const top = FFT_SIZE / 2;
  const bands = Array.from({ length: height }, (_, y) => {
    const lo = Math.min(top, Math.max(0, Math.round(rowHz(y + 0.5, height, low_hz, high_hz) / binHz)));
    const hi = Math.min(top, Math.max(lo, Math.round(rowHz(y - 0.5, height, low_hz, high_hz) / binHz)));
    return [lo, hi] as const;
  });
  const data = new Uint8ClampedArray(width * height * 4);
  const re = new Float64Array(FFT_SIZE);
  const im = new Float64Array(FFT_SIZE);
  const mag = new Float64Array(top + 1);
  for (let x = 0; x < width; x++) {
    const from = Math.round(((x + 0.5) / width) * length) - FFT_SIZE / 2;
    for (let i = 0; i < FFT_SIZE; i++) {
      const at = from + i;
      re[i] = at >= 0 && at < length ? mono[at]! * window[i]! : 0;
      im[i] = 0;
    }
    fft(re, im);
    for (let k = 0; k <= top; k++) mag[k] = Math.hypot(re[k]!, im[k]!) / full;
    for (let y = 0; y < height; y++) {
      const [lo, hi] = bands[y]!;
      let peak = 0;
      for (let k = lo; k <= hi; k++) peak = Math.max(peak, mag[k]!);
      const db = peak > 0 ? 20 * Math.log10(peak) : FLOOR_DB;
      paint(Math.min(1, Math.max(0, 1 - db / FLOOR_DB)), data, (y * width + x) * 4);
    }
  }
  return { width, height, data };
}
