/* Operation Tankity: the room puzzle, solved in the browser.
 *
 * Hosting or joining a room costs a small proof of work (server/pow.php has
 * the whole scheme). The server hands out a signed challenge with a
 * difficulty in bits; a solution is `count` distinct nonces, each with
 * PBKDF2-HMAC-SHA256(challenge, "tankity-pow|<nonce>", `iter` iterations)
 * starting with `bits` zero bits. WebCrypto's deriveBits runs each guess's 200
 * compressions natively, off the page's thread in the browsers we serve, so
 * solving leaves the page responsive; this module only keeps a few guesses in
 * flight and counts zeros. protocol/pow-vectors.json pins it to the server.
 *
 * DOM-free: WebCrypto arrives as an argument (the page passes crypto.subtle,
 * the tests node's), so this compiles in the DOM-free program. */

/** A challenge as action=challenge answers it. */
export interface PowChallenge { challenge: string; bits: number; count: number; iter: number }

/** The slice of WebCrypto's SubtleCrypto the solver uses. */
export interface Subtle {
  importKey(format: 'raw', keyData: Uint8Array<ArrayBuffer>, algorithm: 'PBKDF2', extractable: false, keyUsages: ['deriveBits']): Promise<unknown>;
  deriveBits(algorithm: { name: 'PBKDF2'; hash: 'SHA-256'; salt: Uint8Array<ArrayBuffer>; iterations: number }, baseKey: never, length: number): Promise<ArrayBuffer>;
}

/** What a solve can be cancelled with (an AbortSignal). */
export interface PowSignal { readonly aborted: boolean }

/** Guesses kept in flight: enough to keep WebCrypto's threads busy on a phone. */
export const POW_IN_FLIGHT = 4;

/** Thrown when the player cancelled the solve. */
export class PowCancelled extends Error {
  constructor() { super('Cancelled.'); this.name = 'PowCancelled'; }
}

/** Leading zero bits of a 32-bit big-endian word. */
export function leadingZeros(word: number): number {
  return Math.clz32(word >>> 0);
}

/** The bytes of an ASCII string (a challenge and a salt are nothing else). */
function ascii(s: string): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0x7f;
  return out;
}

/** The leading zero bits of one guess: what server/pow.php room_pow_lead counts. */
export async function powLead(subtle: Subtle, key: unknown, nonce: number, iter: number): Promise<number> {
  const bits = await subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: ascii('tankity-pow|' + nonce), iterations: iter }, key as never, 32);
  return leadingZeros(new DataView(bits).getUint32(0));
}

/** The challenge as a PBKDF2 key. */
export function powKey(subtle: Subtle, challenge: string): Promise<unknown> {
  return subtle.importKey('raw', ascii(challenge), 'PBKDF2', false, ['deriveBits']);
}

/** The `count` smallest solving nonces, `inFlight` guesses at a time. Lanes
 * finish out of order, so the search stops only once `count` are found and
 * every nonce below the largest of the smallest `count` has answered; the
 * answer is then the same on every engine, which the vectors pin. The server
 * accepts any distinct solving set. Rejects with PowCancelled once `signal`
 * is aborted. */
export async function solvePow(c: PowChallenge, subtle: Subtle, opts: { inFlight?: number; signal?: PowSignal } = {}): Promise<number[]> {
  const key = await powKey(subtle, c.challenge);
  const found: number[] = [];
  const answered = new Set<number>();
  let next = 0;
  let below = 0; // every nonce under this has answered
  const settled = (): boolean => {
    if (found.length < c.count) return false;
    const cut = [...found].sort((a, b) => a - b)[c.count - 1]!;
    return below > cut;
  };
  const lane = async (): Promise<void> => {
    while (!settled()) {
      if (opts.signal?.aborted) throw new PowCancelled();
      const n = next++;
      if ((await powLead(subtle, key, n, c.iter)) >= c.bits) found.push(n);
      answered.add(n);
      while (answered.has(below)) answered.delete(below++);
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, opts.inFlight ?? POW_IN_FLIGHT) }, lane));
  if (opts.signal?.aborted) throw new PowCancelled();
  return found.sort((a, b) => a - b).slice(0, c.count);
}
