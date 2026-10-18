// Building the notes the owner sends: what they mean, where in the piece, and
// which draft they were made on. Music notes name bars and seconds; sound notes
// seconds only. The limits are refused here, in plain words. DOM-free.
import { formatSeconds } from './axis.ts';
import type { Span } from './hit.ts';
import { MAX_AUDIO_SECONDS, MAX_CURVE_POINTS, MAX_TEXT, REACTION_IDS } from './note.ts';
import type { NoteBody, NoteKind, Reaction } from './note.ts';
import type { Score, Section } from './score.ts';
import { sectionTimes } from './tempo.ts';
import type { TempoMap } from './tempo.ts';

export const REACTION_LABELS: Readonly<Record<Reaction, string>> = {
  'more-epic': 'More epic', calmer: 'Calmer', darker: 'Darker', brighter: 'Brighter',
  longer: 'Longer', shorter: 'Shorter', 'love-it': 'Love it', 'not-this': 'Not this',
};
export const REACTIONS: readonly { id: Reaction; label: string }[] = REACTION_IDS.map(id => ({ id, label: REACTION_LABELS[id] }));
export const KIND_LABELS: Readonly<Record<NoteKind, string>> = { text: 'Typed note', speech: 'Spoken note', hum: 'Humming', react: 'Reaction', energy: 'Energy shape' };

export class NoteEmpty extends Error {}
export class NoteTooLong extends Error {}
export interface Context { piece: string; draft: number; now: () => Date }
export interface Audio { mime: string; seconds: number }
export interface NoteMark { id: string; n: number; from: number; to: number; lane: string | null; kind: NoteKind; draft: number }

function base(c: Context, kind: NoteKind, from: number, to: number, fromBar: number | null, toBar: number | null, lane: string | null): NoteBody {
  return { v: 1, kind, piece: c.piece, draft: c.draft, from, to, fromBar, toBar, lane, text: null, reaction: null, curve: null, audio: null, made: c.now().toISOString() };
}

function checkAudio(a: Audio): Audio {
  if (!(a.seconds > 0)) throw new NoteEmpty('The recording is empty. Record it again.');
  if (a.seconds > MAX_AUDIO_SECONDS) throw new NoteTooLong('A recording is at most one minute long.');
  return { mime: a.mime, seconds: a.seconds };
}

export function textNote(c: Context, span: Span, text: string): NoteBody {
  const t = text.trim();
  if (t === '') throw new NoteEmpty('Type a note first.');
  if (t.length > MAX_TEXT) throw new NoteTooLong(`A note holds up to ${MAX_TEXT.toLocaleString('en-US')} characters. Shorten this one by ${(t.length - MAX_TEXT).toLocaleString('en-US')}.`);
  return { ...base(c, 'text', span.from, span.to, span.fromBar, span.toBar, span.laneId), text: t };
}

export function speechNote(c: Context, span: Span, audio: Audio): NoteBody {
  return { ...base(c, 'speech', span.from, span.to, span.fromBar, span.toBar, span.laneId), audio: checkAudio(audio) };
}

export function humNote(c: Context, at: { time: number; bar: number | null; laneId: string | null }, audio: Audio): NoteBody {
  return { ...base(c, 'hum', at.time, at.time, at.bar, at.bar, at.laneId), audio: checkAudio(audio) };
}

export function reactNote(c: Context, section: Section, tempo: TempoMap, duration: number, reaction: Reaction): NoteBody {
  const { from, to } = sectionTimes(section, tempo, duration);
  const bars = tempo.metric ? [section.from_bar ?? 1, section.to_bar ?? 1] as const : [null, null] as const;
  return { ...base(c, 'react', from, to, bars[0], bars[1], null), reaction };
}

/** A curve of at most `max` points: one with more is resampled at evenly spaced times between its first and last, interpolating between its points, so a long drawing or a finely sampled energy line still fits a note. */
export function resampleCurve(curve: readonly [number, number][], max: number = MAX_CURVE_POINTS): [number, number][] {
  const pts = curve.map(([t, v]): [number, number] => [t, v]).sort((a, b) => a[0] - b[0]);
  if (pts.length <= max) return pts;
  const t0 = pts[0]![0];
  const t1 = pts[pts.length - 1]![0];
  const out: [number, number][] = [];
  let j = 0;
  for (let i = 0; i < max; i++) {
    const t = i === max - 1 ? t1 : t0 + ((t1 - t0) * i) / (max - 1);
    while (j < pts.length - 2 && pts[j + 1]![0] < t) j++;
    const [ta, va] = pts[j]!;
    const [tb, vb] = pts[j + 1]!;
    const v = tb > ta ? va + ((vb - va) * (Math.min(Math.max(t, ta), tb) - ta)) / (tb - ta) : vb;
    out.push([t, Math.min(1, Math.max(0, v))]);
  }
  return out;
}

export function energyNote(c: Context, curve: readonly [number, number][], duration: number, bars: number | null): NoteBody {
  return { ...base(c, 'energy', 0, duration, bars === null ? null : 1, bars, null), curve: resampleCurve(curve) };
}

/** A section spanning the whole piece, for a reaction when no section is under the playhead (a sound may have none). */
export function wholePiece(score: Score): Section {
  const color = score.sections[0]?.color ?? score.lanes[0]!.color;
  return score.kind === 'music'
    ? { id: 'whole-piece', name: 'The whole piece', color, from_bar: 1, to_bar: score.bars ?? 1 }
    : { id: 'whole-piece', name: 'The whole piece', color, from: 0, to: score.duration };
}

/** "Bars 5–7 · 8 s – 13.6 s", "Bar 5 · 8 s", "20 ms – 200 ms", "80 ms". */
export function spanLabel(s: { from: number; to: number; fromBar: number | null; toBar: number | null }): string {
  const time = s.from === s.to ? formatSeconds(s.from) : `${formatSeconds(s.from)} – ${formatSeconds(s.to)}`;
  if (s.fromBar === null || s.toBar === null) return time;
  const bars = s.fromBar === s.toBar ? `Bar ${s.fromBar}` : `Bars ${s.fromBar}–${s.toBar}`;
  return `${bars} · ${time}`;
}

/** Minutes and whole seconds: "0:07", "1:00". */
export function recordClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
