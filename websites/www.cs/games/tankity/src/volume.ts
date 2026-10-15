/* Operation Tankity: the volume settings.
 *
 * Sound and Music each have a level (0 to 100 percent, the slider) and a mute
 * (the small toggle beside it). Muting never touches the level, so unmuting
 * brings back exactly what the slider shows. Both are remembered in this
 * browser under one key. Pure but for the storage and the audio it is handed:
 * nothing here reaches for the page. */
import { pref, text } from '../../_kit/prefs.ts';
import type { StorageLike } from '../../_kit/ports.ts';

export type Channel = 'sound' | 'music';
export interface ChannelState { level: number; muted: boolean }
export type VolumeState = Record<Channel, ChannelState>;

/** Where a fresh browser starts. Equal levels keep the measured balance between
 *  the effects and the music (test/audio-levels.test.ts): the music bus already
 *  sits MUSIC_HEADROOM under the sound bus. */
export const DEFAULT_LEVEL: Record<Channel, number> = { sound: 80, music: 80 };

export const VOLUME_KEY = 'tankity-volume';
/** The earlier on/off keys: 'off' meant muted. */
export const LEGACY_KEYS: Record<Channel, string> = { sound: 'tankity-sound', music: 'tankity-music' };

/** The gain for a slider position: perceived loudness is roughly logarithmic, so
 *  the square keeps the lower half of the slider useful (50% is -12 dB, 10% is
 *  -40 dB) instead of crowding all the change into the first few percent. */
export function gainFor(level: number): number {
  const v = Math.min(100, Math.max(0, Number.isFinite(level) ? level : 0)) / 100;
  return v * v;
}

/** A level as the slider holds it: a whole percent from 0 to 100. */
export function clampLevel(level: number): number {
  return Number.isFinite(level) ? Math.min(100, Math.max(0, Math.round(level))) : 0;
}

function defaults(): VolumeState {
  return {
    sound: { level: DEFAULT_LEVEL.sound, muted: false },
    music: { level: DEFAULT_LEVEL.music, muted: false },
  };
}

function channelFrom(v: unknown, ch: Channel): ChannelState {
  const o = (v && typeof v === 'object' ? v : {}) as { level?: unknown; muted?: unknown };
  return {
    level: typeof o.level === 'number' ? clampLevel(o.level) : DEFAULT_LEVEL[ch],
    muted: o.muted === true,
  };
}

/** The saved state, tolerating anything: a missing or damaged value is the
 *  defaults for that channel; with nothing saved at all, an old 'off' key means
 *  muted at the default level. */
export function parseVolume(raw: string | null, legacy: Record<Channel, string | null> = { sound: null, music: null }): VolumeState {
  if (raw !== null && raw !== '') {
    let v: unknown = null;
    try { v = JSON.parse(raw); } catch { /* damaged: defaults */ }
    const o = (v && typeof v === 'object' ? v : {}) as Record<string, unknown>;
    return { sound: channelFrom(o.sound, 'sound'), music: channelFrom(o.music, 'music') };
  }
  const s = defaults();
  for (const ch of ['sound', 'music'] as const) s[ch].muted = legacy[ch] === 'off';
  return s;
}

/** The slice of audio.ts the volume drives. */
export interface VolumeAudio {
  setSoundLevel(level: number): void;
  setMusicLevel(level: number): void;
  setSoundMuted(muted: boolean): void;
  setMusicMuted(muted: boolean): void;
  isSoundMuted(): boolean;
  isMusicMuted(): boolean;
}

export interface Volume {
  level(ch: Channel): number;
  muted(ch: Channel): boolean;
  setLevel(ch: Channel, level: number): void;
  toggleMute(ch: Channel): void;
}

/** Loads the saved volume, applies it to the audio, and returns the controls.
 *  Every change is applied and saved; storage that refuses keeps the session's copy. */
export function createVolume(storage: StorageLike | null, audio: VolumeAudio): Volume {
  const saved = pref(VOLUME_KEY, '', text, storage);
  const read = (key: string): string | null => {
    try { return storage?.getItem(key) ?? null; } catch { return null; }
  };
  const state = parseVolume(saved.get() || null, { sound: read(LEGACY_KEYS.sound), music: read(LEGACY_KEYS.music) });

  const apply = (ch: Channel): void => {
    if (ch === 'sound') {
      audio.setSoundLevel(state.sound.level);
      if (audio.isSoundMuted() !== state.sound.muted) audio.setSoundMuted(state.sound.muted);
    } else {
      audio.setMusicLevel(state.music.level);
      if (audio.isMusicMuted() !== state.music.muted) audio.setMusicMuted(state.music.muted);
    }
  };
  const save = (): void => saved.set(JSON.stringify(state));
  apply('sound');
  apply('music');

  return {
    level: ch => state[ch].level,
    muted: ch => state[ch].muted,
    setLevel(ch, level) {
      state[ch].level = clampLevel(level);
      apply(ch);
      save();
    },
    toggleMute(ch) {
      state[ch].muted = !state[ch].muted;
      apply(ch);
      save();
    },
  };
}
