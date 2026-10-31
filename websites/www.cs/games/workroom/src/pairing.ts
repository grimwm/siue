// The pairing code an AI's MCP shows and the person types on Your studio: the first 80 bits of its sealing key's
// fingerprint (the SHA-256 of its SPKI DER) in Crockford's base32, as XXXX-XXXX-XXXX-XXXX (music/lib/Pairing.php and the
// Python tool's studio.py make the same code).
export const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const CHARS = 16;

/** The pairing code of a 64-hex fingerprint. */
export function pairingCode(fingerprint: string): string {
  let n = BigInt(`0x${fingerprint.slice(0, 20)}`);
  let out = '';
  for (let i = 0; i < CHARS; i++) {
    out = ALPHABET[Number(n & 31n)]! + out;
    n >>= 5n;
  }
  return out.match(/..../g)!.join('-');
}

/** A typed code as pairingCode writes it, or null: case, spaces and hyphens do not matter, I and L read as 1, O as 0. */
export function normalizeCode(typed: string): string | null {
  const plain = typed.replace(/[\s-]+/gu, '').toUpperCase().replace(/[IL]/g, '1').replace(/O/g, '0');
  if (plain.length !== CHARS || [...plain].some(c => !ALPHABET.includes(c))) return null;
  return plain.match(/..../g)!.join('-');
}
