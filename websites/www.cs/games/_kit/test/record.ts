// Test doubles: call recorders and in-memory storage.
import type { StorageLike } from '../ports.ts';

export function recorder<T extends unknown[]>(): { fn: (...args: T) => void; calls: T[] } {
  const calls: T[] = [];
  return { fn: (...args: T) => { calls.push(args); }, calls };
}

export function memoryStorage(seed: Record<string, string> = {}): StorageLike & { data: Map<string, string> } {
  const data = new Map(Object.entries(seed));
  return {
    data,
    getItem: k => data.get(k) ?? null,
    setItem: (k, v) => { data.set(k, v); },
    removeItem: k => { data.delete(k); },
  };
}

export function throwingStorage(): StorageLike {
  const no = (): never => { throw new Error('storage blocked'); };
  return { getItem: no, setItem: no, removeItem: no };
}
