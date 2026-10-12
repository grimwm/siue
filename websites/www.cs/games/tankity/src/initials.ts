/* Operation Tankity: a player's three-letter initials.
 *
 * One set per browser, shared by solo and rooms: exactly three letters, shown
 * uppercase, never a blocked word (the list mirrors the score server's). A
 * browser that never chose any gets three random letters, saved once. */
import { pref } from '../../_kit/prefs.ts';
import type { Codec, Pref } from '../../_kit/prefs.ts';
import type { Rng, StorageLike } from '../../_kit/ports.ts';

export const BLOCKED_INITIALS = Object.freeze([
  'ASS',
  'FUK', 'FUC', 'FCK', 'FUX', 'FUQ',
  'SHT', 'SHI',
  'DIK', 'DIC', 'DCK',
  'COK', 'COC', 'COQ',
  'CUM', 'JIZ',
  'CNT', 'PUS', 'VAG', 'CLT',
  'SEX', 'XXX', 'TIT',
  'FAG', 'FGT',
  'NIG', 'NGR',
  'WTF', 'FFS',
  'POO', 'PEE',
  'KKK',
]);

/** Three letters in either case, as uppercase; null for anything else or a blocked word. */
export function validInitials(raw: unknown): string | null {
  const s = String(raw ?? '').trim();
  if (!/^[A-Za-z]{3}$/.test(s)) return null;
  const up = s.toUpperCase();
  return BLOCKED_INITIALS.includes(up) ? null : up;
}

/** Three random letters that are not a blocked word. A generator that keeps
 *  landing on one gives up after a while rather than spinning. */
export function randomInitials(rng: Rng): string {
  for (let tries = 0; tries < 64; tries++) {
    const s = Array.from({ length: 3 }, () => String.fromCharCode(65 + Math.floor(rng() * 26))).join('');
    if (!BLOCKED_INITIALS.includes(s)) return s;
  }
  return 'TNK';
}

const INITIALS: Codec<string> = {
  parse(raw) {
    const v = validInitials(raw);
    if (v === null) throw new Error('not initials');
    return v;
  },
  stringify: v => v,
};

/** The saved initials. A browser with none, or with a value that is not valid
 *  initials, gets random ones now and keeps them. */
export function initialsPref(storage: StorageLike | null, rng: Rng): Pref<string> {
  const p = pref('tankity-initials', '', INITIALS, storage);
  if (p.get() === '') p.set(randomInitials(rng));
  return p;
}
