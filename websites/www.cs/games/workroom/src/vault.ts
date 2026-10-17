// The unlocked notes keys, in the memory of this page view only. Nothing here is stored anywhere.
export interface Vault {
  keyring(): ReadonlyMap<string, CryptoKey>;
  has(fp: string): boolean;
  /** The fingerprints in fps with no key (a note sealed to a key the keyring does not hold). */
  missing(fps: readonly string[]): string[];
  /** Replaces the keyring with the unlocked keys. Throws on an extractable key. Nothing is stored anywhere. */
  load(keys: ReadonlyMap<string, CryptoKey>): void;
  /** Empties the keyring. */
  clear(): void;
}

export function createVault(): Vault {
  let ring: ReadonlyMap<string, CryptoKey> = new Map();
  return {
    keyring: () => ring,
    has: (fp) => ring.has(fp),
    missing: (fps) => fps.filter((fp) => !ring.has(fp)),
    load(keys) {
      for (const [fp, key] of keys) if (key.extractable) throw new Error(`the key ${fp} is extractable; the vault holds only non-extractable keys`);
      ring = new Map(keys);
    },
    clear() { ring = new Map(); },
  };
}
