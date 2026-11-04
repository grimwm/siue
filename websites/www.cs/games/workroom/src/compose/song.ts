// The Song settings: the time signature (4/4, 3/4 or 6/8) for the whole piece, tempo changes that hold from a bar on,
// and the metronome's clicks. Adding and removing bars is sections.ts's (insertBar, removeBar), since a bar taken out
// or put in moves every timed thing after it. DOM-free.
import { beatClock, quarterClock } from './beats.ts';
import type { BeatClock } from './beats.ts';
import { barsNeeded, beatOfBarPos } from './doc.ts';
import type { EditDoc, EditSection } from './doc.ts';
import { clampBpm, lineOf, setStepTempo, setTempoLine, tidyLine } from './speed.ts';
import { pos } from './djclips.ts';
import type { FxClip, Tempo, TempoMark } from '../score.ts';

export type MeterId = '4/4' | '3/4' | '6/8';
export const METERS: readonly { id: MeterId; beats: number; unit: 4 | 8; words: string }[] = [
  { id: '4/4', beats: 4, unit: 4, words: 'Four beats in a bar, the most common' },
  { id: '3/4', beats: 3, unit: 4, words: 'Three beats in a bar, as in a waltz' },
  { id: '6/8', beats: 6, unit: 8, words: 'Six quick beats in a bar, felt in two, as in a jig' },
];

/** The piece's time signature when one of the three holds throughout; null for anything else (an imported piece). */
export function meterOf(doc: EditDoc): MeterId | null {
  const ids = new Set(doc.tempo.map(t => `${t.beats}/${t.unit}`));
  if (ids.size !== 1) return null;
  const id = [...ids][0]!;
  return METERS.some(m => m.id === id) ? (id as MeterId) : null;
}

const round = (x: number): number => Math.round(x * 1e6) / 1e6;

/**
 * The whole piece in time signature `id`. The music keeps sounding the same: notes, regions and markers keep their
 * place in time and the bars are drawn again around them. A beat is the signature's own (an eighth note in 6/8), so the
 * tempo counts those: 92 quarter notes a minute is 184 eighths in 6/8. Everything kept by bar (effect clips, sections,
 * the tempo line, loudness lines) moves to the bar that now holds the same moment.
 */
export function setMeter(doc: EditDoc, id: MeterId): EditDoc {
  const m = METERS.find(x => x.id === id);
  if (!m || meterOf(doc) === id) return doc;
  const oldQ = quarterClock(doc.tempo);
  const oldClock = beatClock(doc.tempo);
  const scale = m.unit / 4;
  const beatOf = (oldBeat: number): number => round(oldQ.quarters(oldBeat) * scale);
  const barQ = (m.beats * 4) / m.unit;
  /** An old bar position as the new one holding the same moment. */
  const barAt = (oldPos: number): number => round(oldQ.quarters(beatOfBarPos(oldClock, oldPos)) / barQ + 1);
  const wholeBar = (oldBar: number): number => Math.max(1, Math.round(barAt(oldBar)));
  // As many bars as the music needs, and about as long as the song was (rounded, so 4/4 → 3/4 → 4/4 comes back to the
  // same bars).
  const endBeat = Math.max(0,
    ...doc.parts.flatMap(p => p.notes.map(n => n.start + n.length)),
    ...doc.parts.flatMap(p => (p.regions ?? []).map(r => r.start + r.length)),
    ...doc.parts.flatMap(p => (p.vocal?.clips ?? []).map(c => oldClock.beat(c.at + c.to - c.from))),
    ...(doc.markers ?? []).map(k => k.beat + 1e-6),
    ...(doc.fxClips ?? []).map(c => beatOfBarPos(oldClock, c.to_bar) - 1e-6));
  const totalQ = oldQ.quarters(oldClock.barStartBeat(barsNeeded(doc) + 1));
  const bars = Math.max(1, Math.ceil(oldQ.quarters(endBeat) / barQ - 1e-9), Math.round(totalQ / barQ));

  // The tempo: each change goes to the bar now holding its moment, its speed counted in the new beats.
  const tempo: Tempo[] = [];
  for (const t of doc.tempo) {
    const bar = wholeBar(t.bar);
    const bpm = clampBpm((t.bpm * 4) / t.unit * scale);
    const last = tempo[tempo.length - 1];
    if (last && last.bar === bar) { last.bpm = bpm; continue; }
    if (last && last.bpm === bpm) continue;
    tempo.push({ bar, bpm, beats: m.beats, unit: m.unit });
  }
  if (tempo[0]) tempo[0].bar = 1;
  const tempoLine: TempoMark[] | null = doc.tempoLine
    ? tidyLine(doc.tempoLine.map(t => ({ ...t, bar: wholeBar(t.bar), bpm: clampBpm((t.bpm * 4) / (oldClock.tempoAt(t.bar).unit) * scale) })))
    : null;

  const parts = doc.parts.map(p => {
    if (p.vocal) return p;
    const q = { ...p, notes: p.notes.map(n => { const s = beatOf(n.start); return { ...n, start: s, length: Math.max(1e-3, round(beatOf(n.start + n.length) - s)) }; }) };
    if (p.regions) q.regions = p.regions.map(r => {
      const s = beatOf(r.start);
      const out = { ...r, start: s, length: round(beatOf(r.start + r.length) - s) };
      if (r.loop) out.loop = round(r.loop * (4 / oldClock.tempoAt(oldClock.barOfBeat(r.start)).unit) * scale);
      return out;
    });
    if (p.dynamics) q.dynamics = dedupe(p.dynamics.map(d => ({ ...d, bar: wholeBar(d.bar) })));
    return q;
  });
  const fxClips = doc.fxClips?.map((c): FxClip => {
    const from = pos(barAt(c.from_bar));
    const to = pos(Math.max(from + 0.25, barAt(c.to_bar)));
    const out: FxClip = { ...c, from_bar: from, to_bar: to };
    if (c.points) out.points = c.points.map(pt => [pos(barAt(pt[0]!)), ...pt.slice(1)]);
    return out;
  });
  const sections = doc.sections?.map((s): EditSection => ({ ...s, from: wholeBar(s.from), to: Math.max(wholeBar(s.from), wholeBar(s.to + 1) - 1) }));
  const out: EditDoc = {
    ...doc, tempo, tempoLine, bars, parts,
    base: doc.base ? { ...doc.base, bars } : null,
  };
  if (fxClips) out.fxClips = fxClips;
  if (sections) out.sections = sections;
  if (doc.markers) out.markers = doc.markers.map(k => ({ ...k, beat: beatOf(k.beat) }));
  if (tempoLine) return setTempoLine(out, tempoLine);
  return out;
}

function dedupe<M extends { bar: number }>(marks: M[]): M[] {
  return marks.filter((m, i) => marks.findIndex(x => x.bar === m.bar) === i);
}

/** The tempo changes after the start: from which bar, at what speed. */
export function tempoChanges(doc: EditDoc): { bar: number; bpm: number }[] {
  return lineOf(doc).filter(m => m.bar > 1).map(m => ({ bar: m.bar, bpm: m.bpm }));
}

/**
 * A tempo change at bar `bar` that holds from there on (null takes it away). Bar 1's speed is the transport's tempo,
 * so a change there sets that. A piece without a tempo line keeps its steps; one with a line gets a steady mark.
 */
export function setTempoAt(doc: EditDoc, bar: number, bpm: number | null): EditDoc {
  const b = Math.max(1, Math.round(bar));
  if (doc.tempoLine) {
    const marks = lineOf(doc).filter(m => m.bar !== b);
    if (bpm !== null) marks.push({ bar: b, bpm: clampBpm(bpm), shape: 'steady' });
    if (b === 1 && bpm === null) return doc;
    return setTempoLine(doc, marks);
  }
  const bars = Math.max(barsNeeded(doc), b);
  const clock = beatClock(doc.tempo);
  const next = doc.tempo.find(t => t.bar > b)?.bar ?? bars + 1;
  const speed = bpm === null ? clock.tempoAt(Math.max(1, b - 1)).bpm : clampBpm(bpm);
  const steps: Tempo[] = [];
  for (let k = 1; k <= bars; k++) {
    const t = clock.tempoAt(k);
    const v = k >= b && k < next ? speed : t.bpm;
    const last = steps[steps.length - 1];
    if (!last || last.bpm !== v || last.beats !== t.beats || last.unit !== t.unit) steps.push({ bar: k, bpm: v, beats: t.beats, unit: t.unit });
  }
  return setStepTempo(doc, steps);
}

/** One metronome click: on a beat, the first of each bar accented. */
export interface Click { beat: number; accent: boolean }

/** The clicks on whole beats from `from` (included) to `to` (left out), each bar's first accented. */
export function clicksBetween(clock: BeatClock, from: number, to: number): Click[] {
  const out: Click[] = [];
  for (let b = Math.max(0, Math.ceil(from - 1e-9)); b < to - 1e-9; b++) {
    const bar = clock.barOfBeat(b + 1e-9);
    out.push({ beat: b, accent: Math.abs(clock.barStartBeat(bar) - b) < 1e-6 });
  }
  return out;
}
