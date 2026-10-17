// Colour arithmetic for contrast (WCAG 2 relative luminance and contrast
// ratio) and the nudge that keeps a score's own colours readable on the
// current theme's drawing surface. DOM-free.
import { TOKENS } from './tokens.ts';
import type { Theme } from './tokens.ts';

/** The floor for a mark (a note, a star, a line): 3:1. */
export const MARK_MIN = 3;
/** The floor for text: 4.5:1. */
export const TEXT_MIN = 4.5;

const channels = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lin = (c: number): number => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

export function luminance(hex: string): number {
  const [r, g, b] = channels(hex);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrast(a: string, b: string): number {
  const x = luminance(a);
  const y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/** hex moved toward `toward` by `amount` (0 keeps it, 1 is `toward`), each channel rounded. */
export function mix(hex: string, toward: string, amount: number): string {
  const a = channels(hex);
  const b = channels(toward);
  return `#${a.map((c, i) => Math.round(c + (b[i]! - c) * amount).toString(16).padStart(2, '0')).join('')}`;
}

/** color unchanged when it reaches `min` against bg; otherwise mixed in 5% steps toward white or black (whichever stands out more from bg) until it does. */
export function readable(color: string, bg: string, min: number): string {
  if (contrast(color, bg) >= min) return color;
  const toward = contrast('#ffffff', bg) >= contrast('#000000', bg) ? '#ffffff' : '#000000';
  for (let step = 1; step <= 20; step++) {
    const c = mix(color, toward, step / 20);
    if (contrast(c, bg) >= min) return c;
  }
  return toward;
}

/**
 * A score colour made readable on this theme's drawing surfaces: 3:1 for a
 * mark, 4.5:1 for text, against the well and against the lane (where marks and
 * labels are drawn; the lane is the harder of the two). Both surfaces sit on
 * the same side of the colour, so the second nudge goes the same way as the
 * first and keeps what the first achieved.
 */
export function readableOn(theme: Theme, color: string, use: 'mark' | 'text'): string {
  const min = use === 'mark' ? MARK_MIN : TEXT_MIN;
  return readable(readable(color, TOKENS[theme].well, min), TOKENS[theme].lane, min);
}
