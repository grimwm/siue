// The editor's document: a music piece's parts, their notes and regions in beats (beats.ts), its markers, key and
// sections, and the score it came from. A score is opened into a document and the document saved back as a renderable
// score that keeps everything the editor does not change: characters, motifs, the glossary, the changes and the energy
// line. A looped region's repeats are saved as real notes, so every reader of the score hears them; opening the score
// drops them again while they are exact copies. It is saved as schema 1 unless it uses a schema 2 field (a tempo line,
// a part's speed, loudness, sound or voice effects, a bend, regions other than the ones its notes make, markers, a
// key). DOM-free.
import { beatClock } from './beats.ts';
import type { BeatClock } from './beats.ts';
import type { Entry } from '../catalogue.ts';
import { MAX_BEND_POINTS, MAX_MARKER_NAME, needsSchema2 } from '../score.ts';
import type { DynMark, Family, FxClip, Lane, LaneFx, Mix, Score, ScoreNote, ScoreRegion, Section, Speed, Tempo, TempoMark, VocalTrack, VoiceFx } from '../score.ts';
import { savedClips } from './djclips.ts';
import { autoRegions, expandLoops, fitRegions, sameRegions } from './regions.ts';

/**
 * A note in beats from the start of the piece. `id` is the document's own, for selection; it is never saved. `bend` is
 * Exact Pitch's curve as [fraction of the note's length, cents], so it stretches with the note.
 */
export interface EditNote { id: number; start: number; length: number; pitch: number; velocity: number; motif: string | null; bend?: [number, number][] }
/**
 * A block of a part's notes on the timeline, in beats. Every note's start lies in exactly one region; regions never
 * overlap. A looped region repeats its first `loop` beats until start + length; its notes live only in that first
 * stretch. Ids come from the document's `nextId`, shared with notes.
 */
export interface Region { id: number; start: number; length: number; loop?: number }
/** A named point on the ruler, in beats; the name is 1 to 24 characters. */
export interface EditMarker { beat: number; name: string }
/** The piece's key: its tonic, 0 to 11 from C, and whether it is minor. */
export interface EditKey { tonic: number; minor: boolean }
/** A section of the piece over whole bars, 1-based and inclusive; a document's sections tile bar 1 to its last. */
export interface EditSection { id: string; name: string; color: string; from: number; to: number }
/**
 * One part: a lane of the score, its instrument's sound settings, its notes, its speed and loudness line, and (kept as
 * the score had them until the Sound panel edits them) its sound settings and voice effects.
 */
export interface Part {
  id: string; name: string; color: string; family: Family; icon: Family;
  instrument: string; gain_db: number; attack: number; release: number; notes: EditNote[];
  speed: Speed; dynamics: DynMark[] | null; fx?: LaneFx; voice?: VoiceFx[];
  /** A Vocal Track's takes and clips, in seconds (vocal.ts); its instrument is `vocal` and it has no notes. */
  vocal?: VocalTrack;
  /** The part's regions in start order (regions.ts); a part with notes has them after fitRegions, a vocal part never. */
  regions?: Region[];
}
/**
 * `tempoLine` is the piece's tempo line, or null for the step tempo alone; `tempo` is always written from it when it is
 * set. `mix` is The Whole Piece's sound (loudness, Room, limiter) once the Sound panel sets it; until then the score's own.
 * `fxClips` are DJ & Effects' clips, in bar positions (djclips.ts). `markers` are sorted by beat; no `key` is no key
 * chosen; no `sections` is one section over the whole piece (sections.ts).
 */
export interface EditDoc {
  title: string; tempo: Tempo[]; tempoLine: TempoMark[] | null; bars: number; parts: Part[]; base: Score | null; nextId: number;
  mix?: Mix; fxClips?: FxClip[]; markers?: EditMarker[]; key?: EditKey; sections?: EditSection[];
}

/** Where and as what a document is saved. */
export interface SaveAs { piece: { id: string; title: string }; project: { id: string; name: string }; draft: number; made: string }

export const NEW_TEMPO: Tempo = { bar: 1, bpm: 92, beats: 4, unit: 4 };
export const NEW_BARS = 4;
export const NEW_VELOCITY = 90;
export const DEFAULT_MIX: Mix = { style: 'lofi', loudness: -20 };
/** The one section of a piece that has not been divided. */
export const WHOLE: Section = { id: 'whole', name: 'The Whole Piece', color: '#5a6b7a' };
const NEW_ENERGY = 0.5;
/** The instrument a lane without a sound (a draft from before renderable scores) opens with, by its family. */
const FAMILY_INSTRUMENT: Partial<Record<Family, string>> = {
  strings: 'cello', brass: 'horn', woodwinds: 'flute', percussion: 'timpani', choir: 'choir', keys: 'piano', harp: 'harp', bells: 'bells',
};
const round = (x: number): number => Math.round(x * 1e6) / 1e6;
/** A deep copy of plain score data. */
const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x)) as T;
/** A bar position rounded to 1/1000 of a bar, as the score keeps them. */
const barRound = (x: number): number => Math.round(x * 1000) / 1000;

/** The beat at bar position `pos` (12.5 is halfway through bar 12), through every tempo change. */
export function beatOfBarPos(clock: BeatClock, pos: number): number {
  const bar = Math.floor(pos + 1e-9);
  return clock.barStartBeat(bar) + (pos - bar) * clock.tempoAt(bar).beats;
}

/** The bar position of `beat`. */
export function barPosOfBeat(clock: BeatClock, beat: number): number {
  const bar = clock.barOfBeat(beat);
  return bar + (beat - clock.barStartBeat(bar)) / clock.tempoAt(bar).beats;
}

/**
 * The beat a saved bar position stands for: the nearest 1/48 of a beat when that is within the 1/1000-bar rounding the
 * score applies, so a position on the editor's grid comes back exactly.
 */
function beatOfSaved(clock: BeatClock, pos: number): number {
  const beat = beatOfBarPos(clock, pos);
  const snapped = Math.round(beat * 48) / 48;
  const slack = clock.tempoAt(Math.floor(pos + 1e-9)).beats / 2000 + 1e-9;
  return Math.abs(snapped - beat) <= slack ? snapped : round(beat);
}

/**
 * The beat at a saved note time: the nearest 1/48 of a beat when the score's rounding to a microsecond is all that
 * separates them, so notes on the editor's grid come back exactly.
 */
function beatOfSeconds(clock: BeatClock, seconds: number): number {
  const beat = clock.beat(seconds);
  const snapped = Math.round(beat * 48) / 48;
  return Math.abs(snapped - beat) < 1e-5 ? snapped : round(beat);
}

/** A note's identity apart from its id, to 1/1000 of a beat. */
const noteSig = (n: Omit<EditNote, 'id'>): string =>
  `${Math.round(n.start * 1000)} ${Math.round(n.length * 1000)} ${n.pitch} ${n.velocity} ${n.motif} ${JSON.stringify(n.bend ?? null)}`;

/**
 * A part's notes as read from a score, with each looped region's repeats dropped when every repeat is an exact copy of
 * its first stretch (expandLoops wrote them); a region whose repeats differ is read as not looped, every note kept.
 */
function readLoops(notes: EditNote[], regions: Region[]): { notes: EditNote[]; regions: Region[] } {
  let kept = notes;
  const out = regions.map((r): Region => {
    if (!r.loop) return r;
    const loop = r.loop;
    const end = r.start + r.length;
    const inBase = (n: EditNote) => n.start >= r.start - 1e-6 && n.start < r.start + loop - 1e-6;
    const inRepeats = (n: EditNote) => n.start >= r.start + loop - 1e-6 && n.start < end - 1e-6;
    const want: string[] = [];
    for (const n of kept.filter(inBase)) {
      for (let at = n.start + loop; at < end - 1e-6; at += loop) want.push(noteSig({ ...n, start: at, length: Math.min(n.length, end - at) }));
    }
    const have = kept.filter(inRepeats).map(noteSig);
    if (want.sort().join('|') !== have.sort().join('|')) {
      const { loop: _, ...plain } = r;
      return plain;
    }
    kept = kept.filter(n => !inRepeats(n));
    return r;
  });
  return { notes: kept, regions: out };
}

/** A music score as a document. Throws for a sound piece, which has no bars to edit in. */
export function docFromScore(score: Score, entries: readonly Entry[]): EditDoc {
  if (score.kind !== 'music' || !score.tempo || !score.bars) throw new Error('Only a music piece can be composed in the editor.');
  const clock = beatClock(score.tempo);
  let nextId = 1;
  const parts = score.lanes.map((lane): Part => {
    const instrument = lane.sound?.instrument ?? FAMILY_INSTRUMENT[lane.family] ?? 'piano';
    const entry = entries.find(e => e.id === instrument);
    const sound = lane.sound ?? { instrument, gain_db: 0, attack: entry?.attack ?? 0.05, release: entry?.release ?? 0.3 };
    const part: Part = {
      id: lane.id, name: lane.name, color: lane.color, family: lane.family, icon: lane.icon,
      instrument, gain_db: sound.gain_db, attack: sound.attack, release: sound.release,
      notes: score.notes.filter(n => n.lane === lane.id).map(n => {
        const start = beatOfSeconds(clock, n.start);
        const note: EditNote = { id: nextId++, start, length: round(beatOfSeconds(clock, n.start + n.length) - start), pitch: n.pitch, velocity: n.velocity, motif: n.motif };
        if (n.bend) note.bend = n.bend.map(([t, c]): [number, number] => [round(t / n.length), c]);
        return note;
      }),
      speed: lane.speed ?? 'follow', dynamics: lane.dynamics ? lane.dynamics.map(d => ({ ...d })) : null,
    };
    if (lane.fx) part.fx = clone(lane.fx);
    if (lane.voice) part.voice = clone(lane.voice);
    if (lane.vocal) part.vocal = clone(lane.vocal);
    else {
      let regions: Region[];
      if (lane.regions) {
        regions = lane.regions.map((r): Region => {
          const start = beatOfSaved(clock, r.from_bar);
          const region: Region = { id: nextId++, start, length: round(beatOfSaved(clock, r.to_bar) - start) };
          if (r.loop_bars) region.loop = round(beatOfSaved(clock, r.from_bar + r.loop_bars) - start);
          return region;
        });
        const read = readLoops(part.notes, regions);
        part.notes = read.notes;
        regions = read.regions;
      } else {
        regions = autoRegions(clock, part.notes).map(r => ({ ...r, id: nextId++ }));
      }
      if (regions.length) part.regions = regions;
    }
    return part;
  });
  const doc: EditDoc = {
    title: score.piece.title, tempo: score.tempo.map(t => ({ ...t })), tempoLine: score.piece_tempo ? score.piece_tempo.map(m => ({ ...m })) : null,
    bars: score.bars, parts, base: score, nextId,
  };
  if (score.mix) doc.mix = clone(score.mix);
  if (score.fx_clips) doc.fxClips = clone(score.fx_clips);
  if (score.markers) doc.markers = score.markers.map(m => ({ beat: beatOfSaved(clock, m.bar), name: m.name }));
  if (score.key) doc.key = { tonic: score.key.tonic, minor: score.key.mode === 'minor' };
  doc.sections = score.sections.map(s => ({ id: s.id, name: s.name, color: s.color, from: s.from_bar!, to: s.to_bar! }));
  return fitRegions(doc);
}

/** A new piece: 92 BPM in 4/4, four bars, no parts yet. */
export function newDoc(title: string): EditDoc {
  return { title, tempo: [{ ...NEW_TEMPO }], tempoLine: null, bars: NEW_BARS, parts: [], base: null, nextId: 1 };
}

/**
 * The bars a document needs: its own, enough to hold its last note and region, every mark of its tempo and loudness
 * lines, every effect clip and marker. Never fewer than the score it came from.
 */
export function barsNeeded(doc: EditDoc): number {
  const clock = beatClock(doc.tempo);
  const end = Math.max(0, ...doc.parts.flatMap(p => p.notes.map(n => n.start + n.length)),
    ...doc.parts.flatMap(p => (p.regions ?? []).map(r => r.start + r.length)),
    ...doc.parts.flatMap(p => (p.vocal?.clips ?? []).map(c => clock.beat(c.at + c.to - c.from))));
  const marks = [...(doc.tempoLine ?? []), ...doc.parts.flatMap(p => p.dynamics ?? [])].map(m => m.bar)
    .concat((doc.fxClips ?? []).map(c => Math.ceil(c.to_bar - 1e-9) - 1))
    .concat((doc.markers ?? []).map(m => clock.barOfBeat(m.beat)));
  let bars = Math.max(doc.bars, doc.base?.bars ?? 1, ...marks);
  while (clock.barStartBeat(bars + 1) < end - 1e-9) bars++;
  return bars;
}

/**
 * The document as a renderable music score: schema 2 when it uses a schema 2 field, schema 1 otherwise. Its regions are
 * fitted to its notes first, and a looped region's repeats are written as notes.
 */
export function scoreFromDoc(given: EditDoc, at: SaveAs): Score {
  const doc = fitRegions(given);
  const base = doc.base;
  const clock = beatClock(doc.tempo);
  const bars = barsNeeded(doc);
  const fullEnd = round(clock.seconds(clock.barStartBeat(bars + 1)));
  const notes: ScoreNote[] = doc.parts.flatMap(p => expandLoops(p).map(n => {
    const start = round(clock.seconds(n.start));
    const length = round(round(clock.seconds(n.start + n.length)) - start);
    const note: ScoreNote = { lane: p.id, start, length, pitch: n.pitch, velocity: n.velocity, motif: n.motif };
    if (n.bend) note.bend = bendSeconds(n.bend, length);
    return note;
  }));
  const notesEnd = Math.max(0, ...notes.map(n => n.start + n.length), ...doc.parts.flatMap(p => (p.vocal?.clips ?? []).map(c => round(c.at + c.to - c.from))));
  const duration = base && base.bars === bars ? round(Math.max(base.duration, notesEnd)) : fullEnd;

  // A vocal part with no takes yet holds nothing to keep.
  const parts = doc.parts.filter(p => !p.vocal || p.vocal.takes.length > 0);
  const laneIds = new Set(parts.map(p => p.id));
  const lanes: Lane[] = parts.map(p => {
    const lane: Lane = { id: p.id, name: p.name, family: p.family, icon: p.icon, color: p.color,
      sound: { instrument: p.instrument, gain_db: p.gain_db, attack: p.attack, release: p.release } };
    if (p.speed !== 'follow') lane.speed = clone(p.speed);
    if (p.dynamics?.length) lane.dynamics = p.dynamics.map(d => ({ ...d }));
    if (p.fx && Object.keys(p.fx).length) lane.fx = clone(p.fx);
    if (p.voice?.length) lane.voice = p.voice.filter(v => !('carrier' in v) || laneIds.has(v.carrier)).map(v => clone(v));
    if (lane.voice?.length === 0) delete lane.voice;
    if (p.vocal) lane.vocal = clone(p.vocal);
    const regions = savedRegions(clock, p);
    if (regions) lane.regions = regions;
    return lane;
  });
  const motifs = (base?.motifs ?? []).map(m => ({ ...m, spans: m.spans.filter(s => laneIds.has(s.lane)) }));
  const motifIds = new Set(motifs.map(m => m.id));
  const sections = doc.sections?.length
    ? fitSections(doc.sections, bars).map(s => ({ id: s.id, name: s.name, color: s.color, from_bar: s.from, to_bar: s.to }))
    : base
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
    mix: clone(doc.mix ?? base?.mix ?? DEFAULT_MIX), musicxml: 'score.musicxml',
    changes: (base?.changes ?? []).map(c => ({ ...c, lane: c.lane !== null && laneIds.has(c.lane) ? c.lane : null, answers: [...c.answers] })),
  };
  if (doc.tempoLine?.length) score.piece_tempo = doc.tempoLine.map(m => ({ ...m }));
  const clips = savedClips(doc.fxClips ?? [], laneIds, bars);
  if (clips.length) score.fx_clips = clips;
  const markers = (doc.markers ?? []).map(m => ({ bar: barRound(barPosOfBeat(clock, m.beat)), name: m.name.slice(0, MAX_MARKER_NAME) }))
    .filter(m => m.bar < bars + 1 && m.name.length > 0).sort((a, b) => a.bar - b.bar);
  if (markers.length) score.markers = markers;
  if (doc.key) score.key = { tonic: doc.key.tonic, mode: doc.key.minor ? 'minor' : 'major' };
  if (needsSchema2(score)) score.schema = 2;
  return score;
}

/**
 * A part's regions as the score keeps them, in bar positions; none when they are just the ones its notes make (one
 * over each run of bars that hold notes), so a piece that never edits its regions is saved as it was.
 */
function savedRegions(clock: BeatClock, p: Part): ScoreRegion[] | undefined {
  if (p.vocal || !p.regions?.length) return undefined;
  if (sameRegions(p.regions, autoRegions(clock, p.notes))) return undefined;
  const out: ScoreRegion[] = [];
  for (const r of p.regions) {
    const from = barRound(barPosOfBeat(clock, r.start));
    const to = barRound(barPosOfBeat(clock, r.start + r.length));
    if (to <= from || (out.length && from < out[out.length - 1]!.to_bar)) continue;
    const region: ScoreRegion = { from_bar: from, to_bar: to };
    if (r.loop) {
      const loop = barRound(barPosOfBeat(clock, r.start + r.loop) - from);
      if (loop > 0 && loop < to - from - 1e-9) region.loop_bars = loop;
    }
    out.push(region);
  }
  return out.length ? out : undefined;
}

/** Sections fitted to `bars`: none starting past the end, the first from bar 1, each straight after the one before, the last to the end. */
export function fitSections(sections: readonly EditSection[], bars: number): EditSection[] {
  const out: EditSection[] = [];
  for (const s of sections) {
    const from = out.length ? out[out.length - 1]!.to + 1 : 1;
    if (from > bars) break;
    out.push({ ...s, from, to: Math.min(bars, Math.max(from, s.to)) });
  }
  if (out.length) out[out.length - 1] = { ...out[out.length - 1]!, to: bars };
  return out;
}

/**
 * A bend from fractions of a note to seconds within its `length`: at most MAX_BEND_POINTS points, the first at 0, each
 * after the last, none past the note; fewer than two left is no bend.
 */
export function bendSeconds(bend: readonly [number, number][], length: number): [number, number][] | undefined {
  const pts: [number, number][] = [];
  for (const [f, c] of bend) {
    const t = round(Math.min(1, Math.max(0, f)) * length);
    if (pts.length === 0 && t !== 0) pts.push([0, c]);
    if (pts.length && t <= pts[pts.length - 1]![0]) continue;
    pts.push([t, Math.round(Math.min(1200, Math.max(-1200, c)) * 10) / 10]);
  }
  return pts.length >= 2 ? thinBend(pts) : undefined;
}

/** A bend of at most MAX_BEND_POINTS points: evenly chosen along the curve, the first and last kept. */
export function thinBend(bend: readonly [number, number][]): [number, number][] {
  if (bend.length <= MAX_BEND_POINTS) return bend.map(([t, c]): [number, number] => [t, c]);
  const n = MAX_BEND_POINTS;
  return Array.from({ length: n }, (_, i): [number, number] => {
    const [t, c] = bend[Math.round((i * (bend.length - 1)) / (n - 1))]!;
    return [t, c];
  });
}
