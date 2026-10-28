/* The Island of Crete: the name a shared level goes by. Players write no free text for a shared level, so its name
 * is made from a short code of the level text and the author's initials. DOM-free. */
import { sha256Hex } from '../puzzle/cache.ts';

/** Thirty-two characters with no I, O, 0 or 1, five bits each. */
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Four characters from the first 20 bits of the text's SHA-256, high bits first. */
export async function levelCode(text: string): Promise<string> {
  const bits = parseInt((await sha256Hex(text)).slice(0, 5), 16);
  let code = '';
  for (let shift = 15; shift >= 0; shift -= 5) code += CODE_ALPHABET[(bits >> shift) & 31];
  return code;
}

export function sharedName(code: string, initials: string): string {
  return `Level ${code} by ${initials}`;
}
