// One saved setting per key, in the raw form the games already store, so a
// player's settings survive. Storage that throws or is missing degrades to a
// value that lives for the session; nothing here ever throws.
import type { StorageLike } from './ports.ts';

export interface Codec<T> {
  parse(raw: string): T;
  stringify(v: T): string;
}

export const text: Codec<string> = { parse: raw => raw, stringify: v => v };

/** One of a fixed set of words; any other stored word reads as `fallback`. The stored form is the word itself. */
export function oneOf<T extends string>(values: readonly T[], fallback: T): Codec<T> {
  return {
    parse: raw => values.find(v => v === raw) ?? fallback,
    stringify: v => v,
  };
}

/** JSON values; a parsed value the guard rejects counts as malformed. */
export function json<T>(guard: (v: unknown) => v is T): Codec<T> {
  return {
    parse(raw) {
      const v: unknown = JSON.parse(raw);
      if (!guard(v)) throw new Error('unexpected shape');
      return v;
    },
    stringify: v => JSON.stringify(v),
  };
}

export interface Pref<T> {
  get(): T;
  set(v: T): void;
  subscribe(fn: (v: T) => void): () => void;
}

export function pref<T>(key: string, fallback: T, codec: Codec<T>, storage: StorageLike | null): Pref<T> {
  const subscribers = new Set<(v: T) => void>();
  let session: { v: T } | null = null;

  function read(): T {
    if (session) return session.v;
    try {
      const raw = storage?.getItem(key);
      return raw == null ? fallback : codec.parse(raw);
    } catch {
      return fallback;
    }
  }

  return {
    get: read,
    set(v) {
      let saved = false;
      try {
        if (storage) {
          storage.setItem(key, codec.stringify(v));
          saved = true;
        }
      } catch {
        // Storage refused the write; the session copy below answers instead.
      }
      session = saved ? null : { v };
      for (const fn of subscribers) fn(v);
    },
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
  };
}
