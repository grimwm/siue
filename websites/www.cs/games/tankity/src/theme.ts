/* Operation Tankity: the colour theme, as the player picks and keeps it.
 *
 * A theme is the page's accent palette (game.css: `[data-theme="..."]` sets
 * --accent, --accent-hover, --accent-ink, --accent-rgb and --focus); the
 * battlefield's own colours never change. The choice is one word per browser
 * under `tankity-theme`, set on <html data-theme>; Orange is the default for
 * a player who never chose. "custom" is the player's own colour: one #rrggbb
 * under `tankity-theme-custom`, from which deriveCustomPalette() builds the
 * same five tokens in OKLCH, set as inline properties on <html>. The derived
 * palette is saved beside the colour (`tankity-theme-custom-palette`) so
 * index.html's head can apply it before the first paint without a copy of the
 * derivation, and the page never flashes the default. */
import type { StorageLike } from '../../_kit/ports.ts';
import { oneOf, pref, text } from '../../_kit/prefs.ts';

export const THEMES = [
  { key: 'yellow', name: 'Yellow' },
  { key: 'lime', name: 'Lime' },
  { key: 'cyan', name: 'Cyan' },
  { key: 'orange', name: 'Orange' },
  { key: 'magenta', name: 'Magenta' },
] as const;

export const CUSTOM = 'custom';
export type ThemeKey = (typeof THEMES)[number]['key'] | typeof CUSTOM;

/** What a player who never chose gets (index.html's data-theme says the same). */
export const DEFAULT_THEME: ThemeKey = 'orange';
/** The colour the picker starts on: Orange's fill. */
export const DEFAULT_CUSTOM = '#ff9f43';

export const THEME_PREF = 'tankity-theme';
export const CUSTOM_PREF = 'tankity-theme-custom';
export const CUSTOM_PALETTE_PREF = 'tankity-theme-custom-palette';

export function isTheme(v: unknown): v is ThemeKey {
  return v === CUSTOM || (typeof v === 'string' && THEMES.some(t => t.key === v));
}

export function isHex(v: unknown): v is string {
  return typeof v === 'string' && /^#[0-9a-f]{6}$/.test(v);
}

/* ---------- the custom palette ---------- */

/** The five tokens every theme sets (game.css). */
export interface Palette {
  accent: string;
  accentHover: string;
  accentInk: string;
  /** "r, g, b" of the accent, for translucent tints. */
  accentRgb: string;
  focus: string;
}

const INK_DARK = '#111111';
const INK_LIGHT = '#ffffff';
/** Accent text sits on near-black panels, so the fill stays in this lightness band. */
const L_MIN = 0.72;
const L_MAX = 0.86;

function srgbToLinear(c: number): number { return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }
function linearToSrgb(c: number): number { return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055; }

function hexToRgb(hex: string): [number, number, number] {
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

/** WCAG 2 contrast ratio of two #rrggbb colours. */
export function contrastRatio(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = hexToRgb(hex).map(v => srgbToLinear(v / 255)) as [number, number, number];
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

function hexToOklch(hex: string): { L: number; C: number; h: number } {
  const [r, g, b] = hexToRgb(hex).map(v => srgbToLinear(v / 255)) as [number, number, number];
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), h: Math.atan2(B, A) };
}

/** OKLCH to #rrggbb; a colour outside sRGB loses chroma until it fits. */
function oklchToHex(L: number, C: number, h: number): string {
  const at = (chroma: number): [number, number, number] => {
    const A = chroma * Math.cos(h);
    const B = chroma * Math.sin(h);
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
    const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
    const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
    return [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
  };
  const fits = (c: [number, number, number]) => c.every(v => v >= -0.0005 && v <= 1.0005);
  let lin = at(C);
  if (!fits(lin)) {
    let lo = 0;
    let hi = C;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (fits(at(mid))) lo = mid; else hi = mid;
    }
    lin = at(lo);
  }
  return '#' + lin.map(v => Math.round(Math.min(1, Math.max(0, linearToSrgb(Math.min(1, Math.max(0, v))))) * 255).toString(16).padStart(2, '0')).join('');
}

/** The whole accent palette from one colour: the fill keeps the colour's hue
 *  and chroma at a lightness the dark panels can carry, hover and the focus
 *  ring are lighter steps of it, and the ink is dark or light, whichever
 *  reads better on the fill and its hover. If neither reaches 4.5:1 the fill
 *  moves a step toward the side that helps until one does. */
export function deriveCustomPalette(hex: string): Palette {
  const src = isHex(hex) ? hex : DEFAULT_CUSTOM;
  const { L, C, h } = hexToOklch(src);
  let level = Math.min(L_MAX, Math.max(L_MIN, L));
  let accent = '';
  let accentHover = '';
  let focus = '';
  let accentInk = INK_DARK;
  for (let i = 0; i < 40; i++) {
    accent = oklchToHex(level, C, h);
    accentHover = oklchToHex(Math.min(0.95, level + 0.07), C, h);
    focus = oklchToHex(Math.min(0.97, level + 0.14), C * 0.7, h);
    const worst = (ink: string) => Math.min(contrastRatio(ink, accent), contrastRatio(ink, accentHover));
    const dark = worst(INK_DARK);
    const light = worst(INK_LIGHT);
    accentInk = dark >= light ? INK_DARK : INK_LIGHT;
    if (Math.max(dark, light) >= 4.5) break;
    level = Math.min(0.98, Math.max(0.05, level + (accentInk === INK_DARK ? 0.02 : -0.02)));
  }
  return { accent, accentHover, accentInk, accentRgb: hexToRgb(accent).join(', '), focus };
}

/** The palette as the custom properties game.css themes set. */
export function paletteProps(p: Palette): Record<string, string> {
  return { '--accent': p.accent, '--accent-hover': p.accentHover, '--accent-ink': p.accentInk, '--accent-rgb': p.accentRgb, '--focus': p.focus };
}

/** Inline-style text for the saved palette, which index.html's head applies. */
export function paletteCss(p: Palette): string {
  return Object.entries(paletteProps(p)).map(([k, v]) => `${k}:${v};`).join('');
}

/* ---------- the saved choice ---------- */

/** The element that carries data-theme (document.documentElement). */
export interface ThemeRoot {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  style?: { setProperty(name: string, value: string): void; removeProperty(name: string): unknown };
}

export interface ThemeSetting {
  get(): ThemeKey;
  /** Saves the choice and shows it at once; "custom" wears the saved custom colour. */
  set(key: ThemeKey): void;
  /** The custom colour: the saved one, else Orange's fill. */
  custom(): string;
  /** Saves a custom colour, makes Custom the theme and shows it at once. */
  setCustom(hex: string): void;
  /** Shows the saved choice, at start: the head script painted it only if
   *  its saved palette was there and well formed. Custom also saves its
   *  palette again (derived from the saved colour), so the next page paints it. */
  apply(): void;
}

/** The saved theme; a missing or unknown word reads as Orange. */
export function themeSetting(storage: StorageLike | null, root: ThemeRoot | null): ThemeSetting {
  const saved = pref<ThemeKey>(THEME_PREF, DEFAULT_THEME, oneOf<ThemeKey>([...THEMES.map(t => t.key), CUSTOM], DEFAULT_THEME), storage);
  const colour = pref<string>(CUSTOM_PREF, DEFAULT_CUSTOM, text, storage);
  const palette = pref<string>(CUSTOM_PALETTE_PREF, '', text, storage);
  const custom = () => { const v = colour.get(); return isHex(v) ? v : DEFAULT_CUSTOM; };
  function show(key: ThemeKey): void {
    root?.setAttribute('data-theme', key);
    const props = paletteProps(deriveCustomPalette(custom()));
    for (const [k, v] of Object.entries(props)) {
      if (key === CUSTOM) root?.style?.setProperty(k, v); else root?.style?.removeProperty(k);
    }
  }
  return {
    get: saved.get,
    set(key) {
      if (!isTheme(key)) return;
      if (key === CUSTOM) { colour.set(custom()); palette.set(paletteCss(deriveCustomPalette(custom()))); }
      saved.set(key);
      show(key);
    },
    custom,
    apply() {
      const key = this.get();
      if (key === CUSTOM) this.set(CUSTOM);
      else show(key);
    },
    setCustom(hex) {
      const h = typeof hex === 'string' ? hex.toLowerCase() : '';
      if (!isHex(h)) return;
      colour.set(h);
      palette.set(paletteCss(deriveCustomPalette(h)));
      saved.set(CUSTOM);
      show(CUSTOM);
    },
  };
}
