// The editor's document: a music piece's parts, their notes in beats (beats.ts), and the score it came from. A score is
// opened into a document and the document saved back as a renderable schema-1 score that keeps everything the editor
// does not change: sections, characters, motifs, the glossary, the changes and the energy line. DOM-free.
import { beatClock } from './beats.ts';
import type { Entry } from '../catalogue.ts';
import type { Family, Lane, Mix, Score, ScoreNote, Section, Tempo } from '../score.ts';

/** A note in beats from the start of the piece. `id` is the document's own, for selection; it is never saved. */
export interface EditNote { id: number; start: number; length: number; pitch: number; velocity: number; motif: string | null }
/** One part: a lane of the score, its instrument's sound settings and its notes. */
export interface Part {
  id: string; name: string; color: string; family: Family; icon: Family;
  instrument: string; gain_db: number; attack: number; release: number; notes: EditNote[];
}
export interface EditDoc { title: string; tempo: Tempo[]; bars: number; parts: Part[]; base: Score | null; nextId: number }

/** Where and as what a document is saved. */
export interface SaveAs { piece: { id: string; title: string }; project: { id: string; name: string }; draft: number; made: string }

export const NEW_TEMPO: Tempo = { bar: 1, bpm: 92, beats: 4, unit: 4 };
export const NEW_BARS = 4;
export const NEW_VELOCITY = 90;
const DEFAULT_MIX: Mix = { style: 'lofi', loudness: -20 };
const WHOLE: Section = { id: 'whole', name: 'The Whole Piece', color: '#5a6b7a' };
const NEW_ENERGY = 0.5;
/** The instrument a lane without a sound (a draft from before renderable scores) opens with, by its family. */
const FAMILY_INSTRUMENT: Partial<Record<Family, string>> = {
  strings: 'cello', brass: 'horn', woodwinds: 'flute', percussion: 'timpani', choir: 'choir', keys: 'piano', harp: 'harp', bells: 'bells',
};
const round = (x: number): number => Math.round(x * 1e6) / 1e6;

/** A music score as a document. Throws for a sound piece, which has no bars to edit in. */
export function docFromScore(score: Score, entries: readonly Entry[]): EditDoc {
  if (score.kind !== 'music' || !score.tempo || !score.bars) throw new Error('Only a music piece can be composed in the editor.');
  const clock = beatClock(score.tempo);
  let nextId = 1;
  const parts = score.lanes.map((lane): Part => {
    const instrument = lane.sound?.instrument ?? FAMILY_INSTRUMENT[lane.family] ?? 'piano';
    const entry = entries.find(e => e.id === instrument);
    const sound = lane.sound ?? { instrument, gain_db: 0, attack: entry?.attack ?? 0.05, release: entry?.release ?? 0.3 };
    return {
      id: lane.id, name: lane.name, color: lane.color, family: lane.family, icon: lane.icon,
      instrument, gain_db: sound.gain_db, attack: sound.attack, release: sound.release,
      notes: score.notes.filter(n => n.lane === lane.id).map(n => {
        const start = round(clock.beat(n.start));
        return { id: nextId++, start, length: round(clock.beat(n.start + n.length) - start), pitch: n.pitch, velocity: n.velocity, motif: n.motif };
      }),
    };
  });
  return { title: score.piece.title, tempo: score.tempo.map(t => ({ ...t })), bars: score.bars, parts, base: score, nextId };
}

/** A new piece: 92 BPM in 4/4, four bars, no parts yet. */
export function newDoc(title: string): EditDoc {
  return { title, tempo: [{ ...NEW_TEMPO }], bars: NEW_BARS, parts: [], base: null, nextId: 1 };
}

/** The bars a document needs: its own, and enough to hold its last note. Never fewer than the score it came from. */
export function barsNeeded(doc: EditDoc): number {
  const clock = beatClock(doc.tempo);
  const end = Math.max(0, ...doc.parts.flatMap(p => p.notes.map(n => n.start + n.length)));
  let bars = Math.max(doc.bars, doc.base?.bars ?? 1);
  while (clock.barStartBeat(bars + 1) < end - 1e-9) bars++;
  return bars;
}

/** The document as a renderable schema-1 music score. */
export function scoreFromDoc(doc: EditDoc, at: SaveAs): Score {
  const base = doc.base;
  const clock = beatClock(doc.tempo);
  const bars = barsNeeded(doc);
  const fullEnd = round(clock.seconds(clock.barStartBeat(bars + 1)));
  const notes: ScoreNote[] = doc.parts.flatMap(p => p.notes.map(n => {
    const start = round(clock.seconds(n.start));
    return { lane: p.id, start, length: round(clock.seconds(n.start + n.length)) - start, pitch: n.pitch, velocity: n.velocity, motif: n.motif };
  })).map(n => ({ ...n, length: round(n.length) }));
  const notesEnd = Math.max(0, ...notes.map(n => n.start + n.length));
  const duration = base && base.bars === bars ? round(Math.max(base.duration, notesEnd)) : fullEnd;

  const laneIds = new Set(doc.parts.map(p => p.id));
  const lanes: Lane[] = doc.parts.map(p => ({ id: p.id, name: p.name, family: p.family, icon: p.icon, color: p.color,
    sound: { instrument: p.instrument, gain_db: p.gain_db, attack: p.attack, release: p.release } }));
  const motifs = (base?.motifs ?? []).map(m => ({ ...m, spans: m.spans.filter(s => laneIds.has(s.lane)) }));
  const motifIds = new Set(motifs.map(m => m.id));
  const sections = base
    ? base.sections.map((s, i, all) => (i === all.length - 1 ? { ...s, to_bar: bars } : { ...s }))
    : [{ ...WHOLE, from_bar: 1, to_bar: bars }];
  const stretch = base ? duration / base.duration : 1;
  const energy: [number, number][] = base
    ? base.energy.map(([t, v], i, all): [number, number] => [i === all.length - 1 ? duration : round(t * stretch), v])
    : [[0, NEW_ENERGY], [duration, NEW_ENERGY]];

  const score: Score = {
    schema: 1, kind: 'music', project: { ...at.project }, piece: { ...at.piece }, draft: at.draft, made: at.made, duration,
    bars, tempo: doc.tempo.filter(t => t.bar <= bars).map(t => ({ ...t })),
    sections, lanes, characters: base ? base.characters.map(c => ({ ...c })) : [], motifs,
    notes: notes.map(n => ({ ...n, motif: n.motif !== null && motifIds.has(n.motif) ? n.motif : null }))
      .sort((a, b) => a.start - b.start || a.pitch - b.pitch),
    energy, glossary: base ? base.glossary.map(g => ({ ...g })) : [], audio: [],
    mix: base?.mix ? { ...base.mix } : { ...DEFAULT_MIX }, musicxml: 'score.musicxml',
    changes: (base?.changes ?? []).map(c => ({ ...c, lane: c.lane !== null && laneIds.has(c.lane) ? c.lane : null, answers: [...c.answers] })),
  };
  return score;
}
