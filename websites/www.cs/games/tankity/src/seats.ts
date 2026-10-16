/* Operation Tankity: the seats this browser holds.
 *
 * Every room seat this browser hosted or joined, so closing the tab never
 * gives one up: the room link or Your games brings the player back to it.
 * Only an explicit Leave, or the server saying the room is gone, forgets one.
 * A seat's token drives that one game seat and nothing else, so it is kept in
 * this origin's storage with its CSRF token. Newest first, at most SEATS_MAX;
 * storage that is missing, malformed or refuses writes never throws (the
 * kit's pref keeps a session copy instead). */
import { pref } from '../../_kit/prefs.ts';
import type { Codec } from '../../_kit/prefs.ts';
import type { StorageLike } from '../../_kit/ports.ts';

export interface StoredSeat { code: string; seat: number; token: string; csrf: string; initials: string; at: number }
export const SEATS_KEY = 'tankity-seats';
export const SEATS_MAX = 12;
interface Saved { v: 1; seats: StoredSeat[] }

function isSeat(s: unknown): s is StoredSeat {
  if (!s || typeof s !== 'object') return false;
  const x = s as Record<string, unknown>;
  return typeof x.code === 'string' && /^[A-Z0-9]{4}$|^[A-Z0-9]{6}$/.test(x.code)
    && typeof x.seat === 'number' && Number.isInteger(x.seat) && x.seat >= 0
    && typeof x.token === 'string' && x.token !== '' && typeof x.csrf === 'string'
    && typeof x.initials === 'string' && typeof x.at === 'number';
}
/* A list read leniently: a malformed entry (a hand edit, an older shape) is
   dropped on its own, so it can never wipe the seats beside it. */
const seatsCodec: Codec<Saved> = {
  parse(raw) {
    const v: unknown = JSON.parse(raw);
    if (!v || typeof v !== 'object' || (v as Saved).v !== 1 || !Array.isArray((v as Saved).seats)) throw new Error('unexpected shape');
    return { v: 1, seats: (v as { seats: unknown[] }).seats.filter(isSeat) };
  },
  stringify: v => JSON.stringify(v),
};

export interface SeatStore {
  /** Newest first. */
  list(): StoredSeat[];
  get(code: string): StoredSeat | null;
  /** Saves a seat (stamped now), replacing and moving first any earlier one for the code. */
  remember(s: Omit<StoredSeat, 'at'>): void;
  forget(code: string): void;
  subscribe(fn: () => void): () => void;
}

export function createSeatStore(storage: StorageLike | null, now: () => number): SeatStore {
  const p = pref<Saved>(SEATS_KEY, { v: 1, seats: [] }, seatsCodec, storage);
  const list = (): StoredSeat[] => p.get().seats;
  return {
    list,
    get: code => list().find(s => s.code === code) ?? null,
    remember(s) {
      const rest = list().filter(x => x.code !== s.code);
      p.set({ v: 1, seats: [{ ...s, at: now() }, ...rest].slice(0, SEATS_MAX) });
    },
    forget(code) {
      const seats = list();
      if (seats.some(x => x.code === code)) p.set({ v: 1, seats: seats.filter(x => x.code !== code) });
    },
    subscribe(fn) { return p.subscribe(() => fn()); },
  };
}
