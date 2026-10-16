// websites/www.cs/games/_kit/initials.ts
// A player's three-letter initials and the words nobody may file: one list for
// every game, `blocked-initials.json`, which the kit's PHP ScoreGuard reads too
// (`test/initials.test.ts` fails when the two disagree).
import blocked from './blocked-initials.json' with { type: 'json' };

/** Matched on the uppercase form. */
export const BLOCKED_INITIALS: readonly string[] = Object.freeze([...blocked]);

/** Exactly three letters in either case. */
export const INITIALS_RULE = /^[A-Za-z]{3}$/;

/** Three letters in either case, as uppercase; null for anything else or a blocked word. */
export function validInitials(raw: unknown): string | null {
  const s = String(raw ?? '').trim();
  if (!INITIALS_RULE.test(s)) return null;
  const up = s.toUpperCase();
  return BLOCKED_INITIALS.includes(up) ? null : up;
}
