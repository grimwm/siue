/* Operation Tankity: a player's three-letter initials.
 *
 * One set per browser, shared by solo and rooms: exactly three letters, shown
 * uppercase, never a blocked word (the kit's list, `_kit/blocked-initials.json`, which the score server reads too). A
 * browser that never chose any gets three random letters, saved once. */
import { pref } from '../../_kit/prefs.ts';
import type { Codec, Pref } from '../../_kit/prefs.ts';
import type { Rng, StorageLike } from '../../_kit/ports.ts';
import { BLOCKED_INITIALS, validInitials } from '../../_kit/initials.ts';

export { BLOCKED_INITIALS, validInitials };

/** Three random letters that are not a blocked word. A generator that keeps
 *  landing on one gives up after a while rather than spinning. */
export function randomInitials(rng: Rng): string {
  for (let tries = 0; tries < 64; tries++) {
    const s = Array.from({ length: 3 }, () => String.fromCharCode(65 + Math.floor(rng() * 26))).join('');
    if (!BLOCKED_INITIALS.includes(s)) return s;
  }
  return 'TNK';
}

/** What the initials line says about a typed set the blocked list refuses. */
export const INITIALS_REFUSED = 'Those initials are not allowed. Pick others.';
/** What it says when Host or Join meets boxes that are not all filled. */
export const INITIALS_SHORT = 'Fill in all three initials first.';

/** What the three boxes hold (a space for an empty box), read as a set: the
 *  set, uppercase, or why not and the box (0-based) to put the player in. */
export function readInitials(letters: string): { initials: string } | { problem: string; box: number } {
  for (let i = 0; i < 3; i++) if (!/^[A-Za-z]$/.test(letters[i] ?? '')) return { problem: INITIALS_SHORT, box: i };
  const ok = validInitials(letters.slice(0, 3));
  return ok === null ? { problem: INITIALS_REFUSED, box: 0 } : { initials: ok };
}

/** Saves a typed set when it is allowed. Returns the line to show: empty when
 *  saved, INITIALS_REFUSED when not (the saved set stays). */
export function saveInitials(saved: Pref<string>, word: string): string {
  const ok = validInitials(word);
  if (ok === null) return INITIALS_REFUSED;
  saved.set(ok);
  return '';
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
