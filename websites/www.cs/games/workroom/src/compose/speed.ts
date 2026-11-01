// Speed in the editor: the piece's tempo line written out as the score's step tempo a bar at a time, and each part's
// speed (Follow Piece, a ratio of the piece, or its own BPM). Notes are kept on the piece's beats; a part's speed is
// the rhythm it keeps when the speed changes: a change of speed moves its notes, never the other way round. DOM-free.
import type { Speed, Tempo, TempoMark } from '../score.ts';
import { tempoLineBpm } from '../score.ts';
import { beatClock } from './beats.ts';
import type { BeatClock } from './beats.ts';
import { barsNeeded } from './doc.ts';
import type { EditDoc, Part } from './doc.ts';

/** The piece's named speeds. */
export const PIECE_SPEEDS: readonly { label: string; bpm: number }[] = [
  { label: 'Slow', bpm: 66 }, { label: 'Walking', bpm: 92 }, { label: 'Quick', bpm: 128 },
];
/** A part's ratios to the piece, as DAWs sync tracks. */
export const RATIOS: readonly { label: string; ratio: number }[] = [
  { label: '½×', ratio: 0.5 }, { label: '⅔×', ratio: 0.666667 }, { label: '1×', ratio: 1 }, { label: '1½×', ratio: 1.5 }, { label: '2×', ratio: 2 },
];
export const MIN_BPM = 20;
export const MAX_BPM = 400;
export const clampBpm = (bpm: number): number => Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(bpm * 100) / 100));

/**
 * The score's step tempo for bars 1 to `bars` from a tempo line, keeping each bar's beats and unit from `meter`: one
 * entry wherever the BPM or the time signature changes.
 */
export function stepTempo(marks: readonly TempoMark[], meter: readonly Tempo[], bars: number): Tempo[] {
  const out: Tempo[] = [];
  for (let bar = 1; bar <= bars; bar++) {
    let m = meter[0]!;
    for (const t of meter) if (t.bar <= bar) m = t;
    const bpm = tempoLineBpm(marks, bar);
    const last = out[out.length - 1];
    if (!last || last.bpm !== bpm || last.beats !== m.beats || last.unit !== m.unit) out.push({ bar, bpm, beats: m.beats, unit: m.unit });
  }
  return out;
}

/** The bars a step tempo must cover so every mark of the line is in it. */
export const lineBars = (marks: readonly TempoMark[], bars: number): number => Math.max(bars, ...marks.map(m => m.bar));

/**
 * A tempo line that is valid as the schema says: in bar order, the last steady, and each ramp heading the way its
 * next mark lies (a ramp to an equal speed holds).
 */
export function tidyLine(marks: readonly TempoMark[]): TempoMark[] {
  const sorted = [...marks].sort((a, b) => a.bar - b.bar).filter((m, i, all) => i === 0 || m.bar !== all[i - 1]!.bar);
  if (sorted[0] && sorted[0].bar !== 1) sorted[0] = { ...sorted[0], bar: 1 };
  return sorted.map((m, i) => {
    const next = sorted[i + 1];
    if (!next) return { ...m, shape: 'steady' };
    if (m.shape === 'steady') return { ...m };
    return { ...m, shape: next.bpm > m.bpm ? 'speed_up' : next.bpm < m.bpm ? 'slow_down' : 'steady' };
  });
}

/** Where a part's own rhythm is at a piece beat: its beats run at the piece's, at a ratio of them, or at its own BPM. */
export function partBeat(speed: Speed, clock: BeatClock, pieceBeat: number): number {
  if (speed === 'follow') return pieceBeat;
  if ('ratio' in speed) return pieceBeat * speed.ratio;
  return (clock.seconds(pieceBeat) * speed.bpm) / 60;
}

/** The piece beat at which a part's own beat falls. */
export function pieceBeat(speed: Speed, clock: BeatClock, beat: number): number {
  if (speed === 'follow') return beat;
  if ('ratio' in speed) return beat / speed.ratio;
  return clock.beat((beat * 60) / speed.bpm);
}

export const sameSpeed = (a: Speed, b: Speed): boolean => JSON.stringify(a) === JSON.stringify(b);

export const speedWords = (s: Speed): string =>
  s === 'follow' ? 'Follows the piece' : 'ratio' in s ? `${RATIOS.find(r => Math.abs(r.ratio - s.ratio) < 1e-6)?.label ?? `${s.ratio}×`} the piece's speed` : `Its own ${s.bpm} BPM`;

const round = (x: number): number => Math.round(x * 1e6) / 1e6;

/** A part's notes moved from the rhythm of speed `from` on clock `was` to the same rhythm at `to` on clock `now`. */
function retimeNotes(part: Part, from: Speed, to: Speed, was: BeatClock, now: BeatClock): Part {
  return {
    ...part,
    notes: part.notes.map(n => {
      const a = partBeat(from, was, n.start);
      const b = partBeat(from, was, n.start + n.length);
      const start = round(pieceBeat(to, now, a));
      return { ...n, start, length: round(pieceBeat(to, now, b) - start) };
    }),
  };
}

/** A part at another speed: its notes keep their rhythm and move to the new speed. */
export function setPartSpeed(doc: EditDoc, partId: string, speed: Speed): EditDoc {
  const clock = beatClock(doc.tempo);
  return { ...doc, parts: doc.parts.map(p => (p.id === partId ? { ...retimeNotes(p, p.speed, speed, clock, clock), speed } : p)) };
}

/**
 * The piece at a new tempo: `line` (or, with null, the step tempo `tempo` as given). Parts that follow the piece or
 * keep a ratio to it stay on their beats and so move with it; a part at its own BPM stays where it sounds.
 */
function withTempo(doc: EditDoc, tempo: Tempo[], line: TempoMark[] | null): EditDoc {
  const was = beatClock(doc.tempo);
  const now = beatClock(tempo);
  return {
    ...doc, tempo, tempoLine: line,
    parts: doc.parts.map(p => (p.speed !== 'follow' && 'bpm' in p.speed ? retimeNotes(p, p.speed, p.speed, was, now) : p)),
  };
}

/** The tempo line `marks` (tidied), written out as the step tempo. */
export function setTempoLine(doc: EditDoc, marks: readonly TempoMark[]): EditDoc {
  const line = tidyLine(marks.map(m => ({ ...m, bpm: clampBpm(m.bpm) })));
  return withTempo(doc, stepTempo(line, doc.tempo, lineBars(line, barsNeeded(doc))), line);
}

/**
 * The piece's starting speed. With a tempo line it is the line's first mark; without one, the first tempo of the score
 * (a score with sudden changes keeps them), so a piece that never uses the line stays schema 1.
 */
export function setPieceSpeed(doc: EditDoc, bpm: number): EditDoc {
  const b = clampBpm(bpm);
  if (doc.tempoLine) return setTempoLine(doc, doc.tempoLine.map((m, i) => (i === 0 ? { ...m, bpm: b } : m)));
  return withTempo(doc, doc.tempo.map((t, i) => (i === 0 ? { ...t, bpm: b } : { ...t })), null);
}

/** The line a document's tempo already makes: one mark wherever the step tempo changes, each held to the next. */
export function lineOf(doc: EditDoc): TempoMark[] {
  return doc.tempoLine ? doc.tempoLine.map(m => ({ ...m })) : doc.tempo.map(t => ({ bar: t.bar, bpm: t.bpm, shape: 'steady' as const }));
}
