// The editor's clock: a music piece's beats (each bar's own beat, its tempo's `unit`) to seconds and back, through every
// tempo change. Bars past the score's last keep the last tempo, so a part may grow past the end. DOM-free.
import type { Tempo } from '../score.ts';

export interface BeatClock {
  /** Seconds from the start of the piece at `beat`. */
  seconds(beat: number): number;
  /** The beat playing at `seconds`. */
  beat(seconds: number): number;
  /** The beat on which bar `bar` (1-based) starts. */
  barStartBeat(bar: number): number;
  /** The bar (1-based) holding `beat`. */
  barOfBeat(beat: number): number;
  /** The tempo in force in bar `bar`. */
  tempoAt(bar: number): Tempo;
  /** How many beats make a quarter note in bar `bar`: unit / 4 (1 in 4/4, 2 in 6/8, ½ in 2/2). */
  quarter(bar: number): number;
}

interface Segment { bar: number; beat: number; seconds: number; t: Tempo }

export function beatClock(tempo: readonly Tempo[]): BeatClock {
  const segments: Segment[] = [];
  for (const t of tempo) {
    const prev = segments[segments.length - 1];
    if (!prev) segments.push({ bar: t.bar, beat: 0, seconds: 0, t });
    else {
      const beats = (t.bar - prev.bar) * prev.t.beats;
      segments.push({ bar: t.bar, beat: prev.beat + beats, seconds: prev.seconds + (beats * 60) / prev.t.bpm, t });
    }
  }
  const last = (ok: (s: Segment) => boolean): Segment => {
    let at = segments[0]!;
    for (const s of segments) if (ok(s)) at = s;
    return at;
  };
  const byBeat = (beat: number): Segment => last(s => s.beat <= beat + 1e-9);
  const byBar = (bar: number): Segment => last(s => s.bar <= bar);
  const bySeconds = (sec: number): Segment => last(s => s.seconds <= sec + 1e-9);
  return {
    seconds: beat => { const s = byBeat(beat); return s.seconds + ((beat - s.beat) * 60) / s.t.bpm; },
    beat: sec => { const s = bySeconds(sec); return s.beat + ((sec - s.seconds) * s.t.bpm) / 60; },
    barStartBeat: bar => { const s = byBar(bar); return s.beat + (bar - s.bar) * s.t.beats; },
    barOfBeat: beat => { const s = byBeat(beat); return s.bar + Math.floor((beat - s.beat) / s.t.beats + 1e-9); },
    tempoAt: bar => byBar(bar).t,
    quarter: bar => byBar(bar).t.unit / 4,
  };
}
