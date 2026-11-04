// The composer's own switches, remembered on this device rather than in the piece: the metronome's Click, a bar of
// count-in before Play, and whether Type Notes keeps to the key. DOM-free: the page passes its storage.
import { json, pref } from '../../../_kit/prefs.ts';
import type { Pref } from '../../../_kit/prefs.ts';
import type { StorageLike } from '../../../_kit/ports.ts';

export interface SongPrefs { click: boolean; countIn: boolean; inKey: boolean }
export const SONG_PREFS_KEY = 'workroom-composer-song';
export const DEFAULT_SONG_PREFS: SongPrefs = { click: false, countIn: false, inKey: false };

const isPrefs = (v: unknown): v is Partial<SongPrefs> => typeof v === 'object' && v !== null && !Array.isArray(v);
const full = (v: Partial<SongPrefs>): SongPrefs => ({ click: v.click === true, countIn: v.countIn === true, inKey: v.inKey === true });

/** The remembered switches; anything missing or unreadable is off. */
export function songPrefs(storage: StorageLike | null): Pref<SongPrefs> {
  const p = pref<Partial<SongPrefs>>(SONG_PREFS_KEY, DEFAULT_SONG_PREFS, json(isPrefs), storage);
  return { get: () => full(p.get()), set: v => p.set(full(v)), subscribe: fn => p.subscribe(v => fn(full(v))) };
}
