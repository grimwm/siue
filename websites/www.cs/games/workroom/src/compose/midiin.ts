// Plugged-in keyboards and drum pads (Web MIDI). MIDI carries notes, not sound: each key's velocity, the sustain pedal
// (CC64) and drum pads on channel 10, read here into the editor's own key-down and key-up, which play Studio Sounds and
// record as the on-screen keys do. A key let go under the pedal ends only when the pedal comes up, the way a piano holds
// it; pressing it again ends the held note first. Program changes are the only thing ever sent. DOM-free.

export type MidiMessage =
  | { kind: 'on'; channel: number; pitch: number; velocity: number }
  | { kind: 'off'; channel: number; pitch: number }
  | { kind: 'sustain'; channel: number; down: boolean };

/** The drum channel, counted from 1. */
export const DRUM_CHANNEL = 10;
const SUSTAIN = 64;

/** One MIDI message as the editor reads it: notes and the sustain pedal; null for everything else (clocks, other controls, SysEx). */
export function parseMidi(data: ArrayLike<number>): MidiMessage | null {
  if (data.length < 3) return null;
  const status = data[0]! & 0xf0;
  const channel = (data[0]! & 0x0f) + 1;
  const a = data[1]! & 0x7f;
  const b = data[2]! & 0x7f;
  if (status === 0x90 && b > 0) return { kind: 'on', channel, pitch: a, velocity: b };
  if (status === 0x80 || status === 0x90) return { kind: 'off', channel, pitch: a };
  if (status === 0xb0 && a === SUSTAIN) return { kind: 'sustain', channel, down: b >= 64 };
  return null;
}

export interface MidiKeyOut {
  /** A key went down: `key` names it until its up; `drum` is a pad on channel 10. */
  down(key: string, pitch: number, velocity: number, drum: boolean): void;
  up(key: string): void;
}

/** Turns each device's messages into key downs and ups, holding released keys while that device's pedal is down. */
export function createMidiKeys(out: MidiKeyOut) {
  /** Keys that are sounding: whether the finger is still on them. */
  const sounding = new Map<string, { device: string; physical: boolean }>();
  const pedals = new Set<string>();
  const keyOf = (device: string, channel: number, pitch: number): string => `midi:${device}:${channel}:${pitch}`;
  const end = (key: string): void => { sounding.delete(key); out.up(key); };
  return {
    message(device: string, m: MidiMessage): void {
      if (m.kind === 'sustain') {
        if (m.down) { pedals.add(device); return; }
        pedals.delete(device);
        for (const [key, s] of [...sounding]) if (s.device === device && !s.physical) end(key);
        return;
      }
      const key = keyOf(device, m.channel, m.pitch);
      const s = sounding.get(key);
      if (m.kind === 'on') {
        if (s?.physical) return;
        if (s) end(key);
        sounding.set(key, { device, physical: true });
        out.down(key, m.pitch, m.velocity, m.channel === DRUM_CHANNEL);
        return;
      }
      if (!s?.physical) return;
      if (pedals.has(device)) s.physical = false;
      else end(key);
    },
    /** The device went away (unplugged, or no longer chosen): its keys end and its pedal is let go. */
    lost(device: string): void {
      pedals.delete(device);
      for (const [key, s] of [...sounding]) if (s.device === device) end(key);
    },
    pedal: (): boolean => pedals.size > 0,
  };
}

/** A device's name as the browser reports it, its maker in front once ("Yamaha P-125"). */
export function deviceLabel(name: string | null, manufacturer: string | null): string {
  const n = (name ?? '').trim();
  const m = (manufacturer ?? '').trim();
  if (!n) return m || 'A MIDI Device';
  if (!m || n.toLowerCase().includes(m.toLowerCase())) return n;
  return `${m} ${n}`;
}

/** The program change that picks General MIDI program `gm` (counted from 1) on `channel` (from 1). */
export function programChange(gm: number, channel = 1): number[] {
  const ch = Math.min(16, Math.max(1, Math.round(channel))) - 1;
  return [0xc0 | ch, Math.min(128, Math.max(1, Math.round(gm))) - 1];
}

/** The General MIDI percussion names, by key (channel 10). */
export const GM_DRUMS: Readonly<Record<number, string>> = {
  35: 'Acoustic Bass Drum', 36: 'Bass Drum 1', 37: 'Side Stick', 38: 'Acoustic Snare', 39: 'Hand Clap', 40: 'Electric Snare',
  41: 'Low Floor Tom', 42: 'Closed Hi-Hat', 43: 'High Floor Tom', 44: 'Pedal Hi-Hat', 45: 'Low Tom', 46: 'Open Hi-Hat',
  47: 'Low-Mid Tom', 48: 'Hi-Mid Tom', 49: 'Crash Cymbal 1', 50: 'High Tom', 51: 'Ride Cymbal 1', 52: 'Chinese Cymbal',
  53: 'Ride Bell', 54: 'Tambourine', 55: 'Splash Cymbal', 56: 'Cowbell', 57: 'Crash Cymbal 2', 58: 'Vibraslap',
  59: 'Ride Cymbal 2', 60: 'Hi Bongo', 61: 'Low Bongo', 62: 'Mute Hi Conga', 63: 'Open Hi Conga', 64: 'Low Conga',
  65: 'High Timbale', 66: 'Low Timbale', 67: 'High Agogo', 68: 'Low Agogo', 69: 'Cabasa', 70: 'Maracas',
  71: 'Short Whistle', 72: 'Long Whistle', 73: 'Short Guiro', 74: 'Long Guiro', 75: 'Claves', 76: 'Hi Wood Block',
  77: 'Low Wood Block', 78: 'Mute Cuica', 79: 'Open Cuica', 80: 'Mute Triangle', 81: 'Open Triangle',
};

export const drumName = (pitch: number): string => GM_DRUMS[pitch] ?? `Drum ${pitch}`;
