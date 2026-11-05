/* Cylon Defense: the arithmetic behind the drawn debris letters (src/glyphs.ts).
 *
 * The embed draws the page's scattered letters on one canvas instead of one
 * element per letter. To look the same, each letter has to move the way the
 * stylesheet moved its element: the same timing curves (CSS cubic-bezier
 * transitions), the same transforms inherited from the blocks and the panel
 * it sits in (2D affine matrices about each box's centre), and the same
 * blown-out colour (color-mix with the ash grey). Those are here, free of the
 * page, so test/glyph-math.test.ts pins them. */

/** A 2D affine matrix, CSS order: x' = a·x + c·y + e, y' = b·x + d·y + f. */
export interface Affine { a: number; b: number; c: number; d: number; e: number; f: number }

export const IDENTITY: Affine = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

/** m · n: n applies first, then m. */
export function multiply(m: Affine, n: Affine): Affine {
  return {
    a: m.a * n.a + m.c * n.b,
    b: m.b * n.a + m.d * n.b,
    c: m.a * n.c + m.c * n.d,
    d: m.b * n.c + m.d * n.d,
    e: m.a * n.e + m.c * n.f + m.e,
    f: m.b * n.e + m.d * n.f + m.f,
  };
}

export function invert(m: Affine): Affine {
  const det = m.a * m.d - m.b * m.c || 1e-12;
  return {
    a: m.d / det,
    b: -m.b / det,
    c: -m.c / det,
    d: m.a / det,
    e: (m.c * m.f - m.d * m.e) / det,
    f: (m.b * m.e - m.a * m.f) / det,
  };
}

export function apply(m: Affine, x: number, y: number): { x: number; y: number } {
  return { x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f };
}

/** An element's own transform as the page sees it: about its transform origin (ox, oy). */
export function aboutOrigin(m: Affine, ox: number, oy: number): Affine {
  return multiply(multiply({ ...IDENTITY, e: ox, f: oy }, m), { ...IDENTITY, e: -ox, f: -oy });
}

/** translate(x, y) rotate(deg), the letters' own transform. */
export function translateRotate(x: number, y: number, deg: number): Affine {
  const r = (deg * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  return { a: cos, b: sin, c: -sin, d: cos, e: x, f: y };
}

/** A CSS cubic-bezier timing function: progress in [0, 1] to eased progress. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (t: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (s: number): number => ((ax * s + bx) * s + cx) * s;
  const sampleY = (s: number): number => ((ay * s + by) * s + cy) * s;
  const slopeX = (s: number): number => (3 * ax * s + 2 * bx) * s + cx;
  return (t: number): number => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    // Newton's method, then bisection where the slope is too flat.
    let s = t;
    for (let i = 0; i < 8; i++) {
      const err = sampleX(s) - t;
      if (Math.abs(err) < 1e-6) return sampleY(s);
      const slope = slopeX(s);
      if (Math.abs(slope) < 1e-6) break;
      s -= err / slope;
    }
    let lo = 0;
    let hi = 1;
    s = t;
    for (let i = 0; i < 30; i++) {
      const x = sampleX(s);
      if (Math.abs(x - t) < 1e-6) break;
      if (x < t) lo = s; else hi = s;
      s = (lo + hi) / 2;
    }
    return sampleY(s);
  };
}

/** The curves world.css gives the letters: a weapon's kick, the opening blow, and plain `ease`. */
export const EASE_KICK = cubicBezier(0.22, 0.7, 0.2, 1);
export const EASE_BLOW = cubicBezier(0.15, 0.85, 0.25, 1);
export const EASE = cubicBezier(0.25, 0.1, 0.25, 1);

/** One value moving from `from` to `to`, like a CSS transition started at `t0`. */
export interface Tween { from: number; to: number; t0: number; ms: number; ease: (t: number) => number }

export function tweenAt(tw: Tween, now: number): number {
  if (tw.ms <= 0 || now >= tw.t0 + tw.ms) return tw.to;
  if (now <= tw.t0) return tw.from;
  return tw.from + (tw.to - tw.from) * tw.ease((now - tw.t0) / tw.ms);
}

/** Restarts a tween toward `to` from wherever it is at `now`, as a CSS transition does when its value changes mid-flight. */
export function retarget(tw: Tween, to: number, now: number, ms: number, ease: (t: number) => number): Tween {
  return { from: tweenAt(tw, now), to, t0: now, ms, ease };
}

export const still = (v: number): Tween => ({ from: v, to: v, t0: 0, ms: 0, ease: EASE });

/** True while the tween still moves at `now`. */
export function moving(tw: Tween, now: number): boolean {
  return tw.ms > 0 && now < tw.t0 + tw.ms && tw.from !== tw.to;
}

export interface Rgba { r: number; g: number; b: number; a: number }

/** Parses the forms a canvas hands back for a fillStyle: `#rrggbb` or `rgba(r, g, b, a)`. */
export function parseCanvasColor(s: string): Rgba | null {
  const hex = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(s.trim());
  if (hex) return { r: parseInt(hex[1]!, 16), g: parseInt(hex[2]!, 16), b: parseInt(hex[3]!, 16), a: 1 };
  const rgb = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)$/i.exec(s.trim());
  if (!rgb) return null;
  const alpha = rgb[4] === undefined ? 1 : rgb[4].endsWith('%') ? parseFloat(rgb[4]) / 100 : parseFloat(rgb[4]);
  return { r: +rgb[1]!, g: +rgb[2]!, b: +rgb[3]!, a: alpha };
}

/** color-mix(in srgb, c p, other 1-p), premultiplied as CSS mixes. */
export function mixSrgb(c: Rgba, other: Rgba, p: number): Rgba {
  const a = c.a * p + other.a * (1 - p);
  if (a <= 0) return { r: 0, g: 0, b: 0, a: 0 };
  const ch = (x: number, y: number): number => Math.round((x * c.a * p + y * other.a * (1 - p)) / a);
  return { r: ch(c.r, other.r), g: ch(c.g, other.g), b: ch(c.b, other.b), a };
}

export const cssColor = (c: Rgba): string => `rgba(${c.r}, ${c.g}, ${c.b}, ${+c.a.toFixed(3)})`;

/** A CSS time (`2.85s`, `320ms`) in milliseconds, or the fallback. */
export function parseCssTime(s: string, fallback: number): number {
  const m = /^\s*([\d.]+)(ms|s)\s*$/.exec(s);
  if (!m) return fallback;
  return m[2] === 's' ? parseFloat(m[1]!) * 1000 : parseFloat(m[1]!);
}
