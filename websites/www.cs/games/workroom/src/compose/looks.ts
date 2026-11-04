// The composer's look: its colors (a palette), its style (shapes, lettering, buttons, the readout and the meters) and
// its lights (dark or light), chosen apart, so any colors go with any style. Tape & Valve colors and style, dark, unless
// the person chose otherwise. The choice is remembered for the account (the studio's settings) and on the device
// (localStorage), so it shows at once and follows the person to another device. DOM-free.
import type { StorageLike } from '../../../_kit/ports.ts';

export type ColorsId = 'tape' | 'rack' | 'night' | 'site' | 'original';
export type StyleId = 'tape' | 'rack' | 'night' | 'site' | 'plain';
export type Mode = 'dark' | 'light';
export interface Look { colors: ColorsId; style: StyleId; mode: Mode }

export const DEFAULT_LOOK: Look = { colors: 'tape', style: 'tape', mode: 'dark' };
/** Where the device keeps the look. */
export const LOOK_KEY = 'workroom-composer-look';

export const COLOR_OPTIONS: readonly { id: ColorsId; name: string; about: string }[] = [
  { id: 'tape', name: 'Tape & Valve', about: 'Warm charcoal and cream, with an amber glow.' },
  { id: 'rack', name: 'Studio Rack', about: 'Graphite and signal orange, with a green LED.' },
  { id: 'night', name: 'Night Synth', about: 'Blue-black with luminous patch-cable colors.' },
  { id: 'site', name: 'Site Match', about: 'The site\'s crimson and steel.' },
  { id: 'original', name: 'Original', about: 'Amber on slate, as the composer first looked.' },
];
export const STYLE_OPTIONS: readonly { id: StyleId; name: string; about: string }[] = [
  { id: 'tape', name: 'Tape & Valve', about: 'Serif labels, walnut cheeks, needle meters and a turning reel on Play.' },
  { id: 'rack', name: 'Studio Rack', about: 'Metal caps, screw heads, an LED readout and segment meters.' },
  { id: 'night', name: 'Night Synth', about: 'Rounded, glowing outlines and a CRT readout.' },
  { id: 'site', name: 'Site Match', about: 'Orbitron lettering, lit edges and the scanner sweep.' },
  { id: 'plain', name: 'Original', about: 'Plain, flat buttons, as the composer first looked.' },
];
export const MODES: readonly { id: Mode; name: string }[] = [{ id: 'dark', name: 'Dark' }, { id: 'light', name: 'Light' }];

/** "tape tape dark": the look as the studio and the device keep it. */
export const lookText = (l: Look): string => `${l.colors} ${l.style} ${l.mode}`;

const pick = <T extends string>(word: string | undefined, ok: readonly { id: T }[], fallback: T): T => ok.find(o => o.id === word)?.id ?? fallback;

/** A kept look read back; each word that is missing or unknown is the default's alone. */
export function parseLook(text: string | null | undefined): Look {
  const [colors, style, mode] = (text ?? '').trim().split(/\s+/);
  return {
    colors: pick(colors, COLOR_OPTIONS, DEFAULT_LOOK.colors),
    style: pick(style, STYLE_OPTIONS, DEFAULT_LOOK.style),
    mode: pick(mode, MODES, DEFAULT_LOOK.mode),
  };
}

/** Whether `text` is a whole, valid kept look. */
export const validLook = (text: string | null | undefined): text is string =>
  typeof text === 'string' && /^(tape|rack|night|site|original) (tape|rack|night|site|plain) (dark|light)$/.test(text);

/** The look the composer opens with, and how a new choice is kept. */
export interface LookPorts { initial: Look; save(l: Look): void }

/**
 * The account's look (the page's data-composer-look) when it has one, else the device's, else the default. A choice
 * is written on the device at once and sent to the studio; a failed send leaves the device's copy.
 */
export function createLookPorts(o: { account: string | undefined; storage: StorageLike | null; send?(text: string): Promise<void> }): LookPorts {
  let device: string | null = null;
  try { device = o.storage?.getItem(LOOK_KEY) ?? null; } catch { device = null; }
  const initial = validLook(o.account) ? parseLook(o.account) : validLook(device) ? parseLook(device) : { ...DEFAULT_LOOK };
  return {
    initial,
    save(l) {
      const text = lookText(l);
      try { o.storage?.setItem(LOOK_KEY, text); } catch { /* the device keeps nothing; the studio still does */ }
      if (o.send) o.send(text).catch(() => { /* kept on the device */ });
    },
  };
}
