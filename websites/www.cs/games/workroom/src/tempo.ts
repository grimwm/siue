// The tempo map: where each bar of a music piece starts in seconds, and the
// seconds a section covers. A sound piece has no bars. DOM-free.
import type { Score, Section } from './score.ts';

export interface TempoMap {
  /** true for a music piece (bars and tempo); false for a sound piece, which has seconds only. */
  readonly metric: boolean;
  /** Seconds at which bar n (1-based) starts; a bar past the last (n > score.bars) is the end of the piece, score.duration. A sound piece has no bars: 0 for n <= 1, else score.duration. */
  barStart(bar: number): number;
  /** The bar (1-based integer) playing at t seconds; clamped to [1, bars]. null for a sound piece. */
  barAt(t: number): number | null;
}

export function tempoMap(score: Score): TempoMap {
  const duration = score.duration;
  const bars = score.bars;
  const tempo = score.tempo;
  if (score.kind !== 'music' || bars === undefined || tempo === undefined) {
    return { metric: false, barStart: n => (n <= 1 ? 0 : duration), barAt: () => null };
  }
  // starts[i] is the start of bar i + 1.
  const starts: number[] = [];
  let at = 0;
  let segment = 0;
  for (let bar = 1; bar <= bars; bar++) {
    while (segment + 1 < tempo.length && tempo[segment + 1]!.bar <= bar) segment++;
    starts.push(at);
    const t = tempo[segment]!;
    at += (t.beats * 60) / t.bpm;
  }
  return {
    metric: true,
    barStart: n => (n > bars ? duration : starts[Math.max(1, Math.floor(n)) - 1]!),
    barAt: t => {
      let lo = 0;
      let hi = bars - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (starts[mid]! <= t) lo = mid;
        else hi = mid - 1;
      }
      return lo + 1;
    },
  };
}

/** The seconds a section covers: a music section from the start of from_bar to the start of the bar after to_bar (so the last ends at score.duration); a sound section its own from and to. */
export function sectionTimes(section: Section, tempo: TempoMap, duration: number): { from: number; to: number } {
  if (tempo.metric) return { from: tempo.barStart(section.from_bar ?? 1), to: tempo.barStart((section.to_bar ?? 0) + 1) };
  return { from: section.from ?? 0, to: section.to ?? duration };
}
