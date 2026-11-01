// Hum: a voice's pitch track (pitch.ts) into notes. The track is cut where the voice stops (a breath, a gap) and where
// it settles on a new pitch; a vibrato or a slide never settles, so it stays one note. Each note is snapped Friendly
// (to the piece's key), to All 12 notes, or kept Exact, with its curve in cents as a bend. The notes are then laid on
// the piece's beats from where they go, tidied like Play Live. DOM-free.
import { thinBend } from './doc.ts';
import { inferFifths } from './toxml.ts';
import type { NewNote } from './edit.ts';
import { midiOf, trackPitch } from './pitch.ts';
import type { PitchFrame } from './pitch.ts';
import { gridBeats, snapStart } from './snap.ts';
import type { Grid } from './snap.ts';

export type HumSnap = 'friendly' | 'all12' | 'exact';
export type HumPlace = 'after' | 'replace' | 'line';
export const HUM_SNAPS: readonly { id: HumSnap; label: string }[] = [
  { id: 'friendly', label: 'Friendly Notes' }, { id: 'all12', label: 'All 12 Notes' }, { id: 'exact', label: 'Exact Pitch' },
];
export const HUM_PLACES: readonly { id: HumPlace; label: string }[] = [
  { id: 'after', label: 'After The Part' }, { id: 'replace', label: 'Replace The Part' }, { id: 'line', label: 'At The Dashed Line' },
];

/** One sung note: seconds from the start of the recording, and its pitch curve as [seconds, fractional MIDI]. */
export interface HumSegment { start: number; end: number; curve: [number, number][] }

/** A gap in the voice shorter than this is inside a note (a consonant, a crackle); longer ends it. */
const GAP = 0.05;
/** A note shorter than this is a blip, not a note. */
const SHORTEST = 0.08;
/** How long a stretch of voice is looked at to tell whether it has settled. */
const SETTLE = 0.06;
/** A settled stretch stays within this many semitones. */
const STEADY = 0.6;
/** The voice may take this long to move from one settled pitch to the next. */
const MOVE = 0.03;
/** Settled stretches this far apart are two notes. */
const JUMP = 0.8;
/** A piece cut off by a change of pitch shorter than this is the voice getting there (a scoop), part of the next note. */
const PIECE = 0.12;
/** A bend smaller than this, in cents, is no bend. */
const NO_BEND = 15;

const median = (xs: readonly number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
};

/** The notes in a pitch track. */
export function segmentHum(frames: readonly PitchFrame[]): HumSegment[] {
  if (frames.length < 2) return [];
  const hop = frames[1]!.t - frames[0]!.t;
  // Runs of voice, bridging short gaps.
  const runs: { t: number; m: number }[][] = [];
  let run: { t: number; m: number }[] = [];
  let lastVoiced = -Infinity;
  for (const f of frames) {
    if (f.hz === null) continue;
    if (f.t - lastVoiced > GAP + hop / 2 && run.length) { runs.push(run); run = []; }
    run.push({ t: f.t, m: midiOf(f.hz) });
    lastVoiced = f.t;
  }
  if (run.length) runs.push(run);
  // Each run smoothed (a median of five frames takes out a stray octave jump), then cut where it settles anew.
  const n = Math.max(2, Math.round(SETTLE / hop));
  const g = Math.max(1, Math.round(MOVE / hop));
  const out: HumSegment[] = [];
  for (const r of runs) {
    const m = r.map((_, i) => median(r.slice(Math.max(0, i - 2), i + 3).map(x => x.m)));
    const steady = (from: number, to: number): number | null => {
      if (from < 0 || to > m.length || to - from < n) return null;
      const w = m.slice(from, to);
      return Math.max(...w) - Math.min(...w) <= STEADY ? median(w) : null;
    };
    const cuts = [0];
    // A settled stretch before k, a short move, a settled stretch after it at another pitch: a new note.
    for (let k = n + g; k + g + n <= m.length; k++) {
      const before = steady(k - g - n, k - g);
      const after = steady(k + g, k + g + n);
      if (before !== null && after !== null && Math.abs(after - before) > JUMP && k - g - n >= cuts[cuts.length - 1]!) {
        // The cut goes where the voice crosses halfway between the two pitches.
        let at = k - g;
        const mid = (before + after) / 2;
        while (at < k + g && Math.sign(m[at]! - mid) === Math.sign(before - mid)) at++;
        cuts.push(at);
        k = at + g;
      }
    }
    cuts.push(m.length);
    // A scoop up to a note is part of it: a piece too short to be a note joins the next one (the last, the one before).
    for (let c = 1; c < cuts.length; c++) {
      if ((cuts[c]! - cuts[c - 1]!) * hop >= PIECE || cuts.length === 2) continue;
      cuts.splice(c === cuts.length - 1 ? c - 1 : c, 1);
      c = 0;
    }
    for (let c = 0; c + 1 < cuts.length; c++) {
      const a = cuts[c]!;
      const b = cuts[c + 1]!;
      const start = r[a]!.t - hop / 2;
      const end = r[b - 1]!.t + hop / 2;
      if (end - start < SHORTEST) continue;
      out.push({ start, end, curve: r.slice(a, b).map((x, i): [number, number] => [x.t, m[a + i]!]) });
    }
  }
  return out;
}

const NAMES: Readonly<Record<number, string>> = {
  [-6]: 'G♭', [-5]: 'D♭', [-4]: 'A♭', [-3]: 'E♭', [-2]: 'B♭', [-1]: 'F', 0: 'C', 1: 'G', 2: 'D', 3: 'A', 4: 'E', 5: 'B', 6: 'F♯',
};
const MAJOR = [0, 2, 4, 5, 7, 9, 11];

/** The piece's key, from its notes (C major when it has none): its name and the pitch classes Friendly Notes snaps to. */
export function keyScale(pitches: readonly number[]): { fifths: number; name: string; classes: number[] } {
  const fifths = inferFifths(pitches);
  const tonic = (((fifths * 7) % 12) + 12) % 12;
  return { fifths, name: `${NAMES[fifths]} Major`, classes: MAJOR.map(d => (tonic + d) % 12).sort((a, b) => a - b) };
}

/** A sung note's pitch: in the key (Friendly), the nearest note (All 12), or the nearest note keeping the voice's bend (Exact). */
export function snapSegment(seg: HumSegment, snap: HumSnap, classes: readonly number[]): { pitch: number; bend: [number, number][] | null } {
  const centre = median(seg.curve.map(([, m]) => m));
  if (snap === 'friendly' && classes.length) {
    let best = Math.round(centre);
    let dist = Infinity;
    for (let p = Math.floor(centre) - 6; p <= Math.ceil(centre) + 6; p++) {
      if (!classes.includes(((p % 12) + 12) % 12)) continue;
      const d = Math.abs(p - centre);
      if (d < dist - 1e-9) { best = p; dist = d; }
    }
    return { pitch: clampPitch(best), bend: null };
  }
  const pitch = clampPitch(Math.round(centre));
  if (snap !== 'exact') return { pitch, bend: null };
  const bend = seg.curve.map(([t, m]): [number, number] => [Math.round((t - seg.start) * 1000) / 1000, Math.round((m - pitch) * 1000) / 10]);
  return { pitch, bend: bend.some(([, c]) => Math.abs(c) >= NO_BEND) ? bend : null };
}
const clampPitch = (p: number): number => Math.min(127, Math.max(0, p));

export interface HumOptions { snap: HumSnap; classes: readonly number[]; startBeat: number; bpm: number; tidy: Grid; quarter: number }

/** An Exact Pitch bend (seconds from the sung note's start) as fractions of the sung note, for the editor's note to stretch. */
export function bendFractions(bend: readonly [number, number][], seg: HumSegment): [number, number][] {
  const dur = Math.max(1e-6, seg.end - seg.start);
  return thinBend(bend.map(([t, c]): [number, number] => [Math.round(Math.min(1, t / dur) * 1e6) / 1e6, c]));
}

/** The sung notes on the piece's beats: the first at `startBeat`, the rest as far after it as they were sung, tidied unless Off. */
export function humNotes(segs: readonly HumSegment[], o: HumOptions): { note: NewNote; bend: [number, number][] | null }[] {
  if (segs.length === 0) return [];
  const first = segs[0]!.start;
  const beats = (s: number): number => (s * o.bpm) / 60;
  const step = gridBeats(o.tidy, o.quarter);
  return segs.map(seg => {
    const { pitch, bend } = snapSegment(seg, o.snap, o.classes);
    const rel = beats(seg.start - first);
    const length = beats(seg.end - seg.start);
    const note: NewNote = step === 0
      ? { start: o.startBeat + rel, length: Math.max(length, 1e-3), pitch, velocity: 90 }
      : { start: o.startBeat + snapStart(rel, o.tidy, o.quarter), length: Math.max(step, Math.round(length / step) * step), pitch, velocity: 90 };
    return { note, bend };
  });
}

/** The demo hum: D, E and F♯, then an A scooped up to from below and held with a vibrato, as a voice hums it. */
export function humDemo(rate: number): Float32Array {
  const plan: { at: number; len: number; midi: (t: number) => number }[] = [
    { at: 0.25, len: 0.45, midi: () => 62 },
    { at: 0.8, len: 0.45, midi: () => 64 },
    { at: 1.35, len: 0.45, midi: () => 66 },
    { at: 1.9, len: 0.9, midi: t => (t < 0.12 ? 67 + (2 * t) / 0.12 : 69 + 0.35 * Math.sin(2 * Math.PI * 5.5 * (t - 0.12)) * Math.min(1, (t - 0.12) / 0.2)) },
  ];
  const out = new Float32Array(Math.round(rate * 3.1));
  for (const n of plan) {
    let phase = 0;
    const from = Math.round(n.at * rate);
    const count = Math.round(n.len * rate);
    for (let i = 0; i < count; i++) {
      const t = i / rate;
      phase += (2 * Math.PI * 440 * 2 ** ((n.midi(t) - 69) / 12)) / rate;
      const env = Math.min(1, t / 0.03, (n.len - t) / 0.05);
      out[from + i] = 0.35 * env * (Math.sin(phase) + 0.35 * Math.sin(2 * phase) + 0.15 * Math.sin(3 * phase));
    }
  }
  return out;
}

/** A voice is read at about this rate: high enough for any sung pitch, low enough to read a minute in a second or so. */
const READ_RATE = 22050;

/** The notes in a recording (mono samples at `rate`): halved (averaging pairs) until near READ_RATE, then tracked. */
export function analyseHum(samples: Float32Array, rate: number): HumSegment[] {
  const by = Math.max(1, Math.floor(rate / READ_RATE));
  if (by === 1) return segmentHum(trackPitch(samples, rate));
  const out = new Float32Array(Math.floor(samples.length / by));
  for (let i = 0; i < out.length; i++) {
    let s = 0;
    for (let k = 0; k < by; k++) s += samples[i * by + k]!;
    out[i] = s / by;
  }
  return segmentHum(trackPitch(out, rate / by, { frame: 1024, hop: 128 }));
}
