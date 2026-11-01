// The score.json model, schemas 1 and 2: what a draft's score file holds, and the validator that every rule of the
// schema table goes through. Schema 2 adds, all optional, the tempo line, each part's speed, loudness line, sound
// settings and voice effects, note bends, and the piece's room and limiter; schema 1 refuses them. DOM-free.
import { term } from './glossary.ts';

export const SCHEMA = 1;
/** The schemas this page reads. */
export const SCHEMAS: readonly number[] = [1, 2];
export const ID_RE = /^[a-z0-9][a-z0-9-]{0,47}$/;
export const COLOR_RE = /^#[0-9a-f]{6}$/;
export const KINDS = ['music', 'sound'] as const;
export type Kind = (typeof KINDS)[number];
/** The shortest sound piece, in seconds. */
export const MIN_SOUND_SECONDS = 0.05;
export const FAMILIES = ['strings', 'brass', 'woodwinds', 'percussion', 'choir', 'keys', 'synth', 'harp', 'bells', 'impact', 'whoosh', 'ambience', 'voice', 'electronic', 'foley', 'ui'] as const;
export type Family = (typeof FAMILIES)[number];
export interface Project { id: string; name: string }
export interface Tempo { bar: number; bpm: number; beats: number; unit: 1 | 2 | 4 | 8 | 16 }
/** A music section spans bars (from_bar, to_bar); a sound section is a named moment in seconds (from, to). parseScore guarantees the pair that fits the score's kind and none of the other. */
export interface Section { id: string; name: string; color: string; from_bar?: number; to_bar?: number; from?: number; to?: number }
/** How the browser renders a lane: an instrument of the shared library, its level and its envelope in seconds. */
export interface Sound { instrument: string; gain_db: number; attack: number; release: number }
/** A mark of the tempo line: from `bar`, Steady holds `bpm`; Slow Down and Speed Up move to the next mark's BPM a bar at a time. */
export interface TempoMark { bar: number; bpm: number; shape: 'steady' | 'slow_down' | 'speed_up' }
/** A part's speed: the piece's, a ratio of it (½, ⅔, 1, 1½ or 2), or a fixed BPM of its own. */
export type Speed = 'follow' | { ratio: number } | { bpm: number };
export const SPEED_RATIOS: readonly number[] = [0.5, 0.666667, 1, 1.5, 2];
/** The six loudness levels, Very Soft (pp) to Very Loud (ff), as velocities; Fairly Loud (mf, 80) leaves a note as it is. */
export const LEVELS: readonly number[] = [32, 48, 64, 80, 100, 120];
/** A mark of a loudness line: from `bar`, Steady holds `level`; Get Louder and Get Softer move to the next mark's level. */
export interface DynMark { bar: number; level: number; shape: 'steady' | 'louder' | 'softer' }
export const SWEEPS = ['off', 'slow', 'fast'] as const;
/** A part's Sound settings; every one is optional, and an absent one is its default (no change). */
export interface LaneFx {
  volume_db?: number; pan?: number; eq?: { bass?: number; middle?: number; treble?: number };
  echo?: { amount?: number; repeats?: number; beats?: number }; shimmer?: number; warmth?: number;
  brightness?: { cutoff?: number; sweep?: (typeof SWEEPS)[number] }; even_out?: number; room?: number; mute?: boolean; solo?: boolean;
}
export const HARMONY_VOICES = ['third', 'fifth', 'octave_up', 'octave_down'] as const;
/** One Voice Effect of a lane's chain. `carrier` names another lane. */
export type VoiceFx =
  | { effect: 'vocoder'; carrier: string; bands: number }
  | { effect: 'autotune'; strength: number; retune_ms: number }
  | { effect: 'harmonizer'; voices: (typeof HARMONY_VOICES)[number][]; mix: number }
  | { effect: 'pitch'; semitones: number; formant: number }
  | { effect: 'talkbox'; carrier: string; mix: number }
  | { effect: 'robot'; mix: number }
  | { effect: 'whisper'; mix: number };
export const VOICE_EFFECTS = ['vocoder', 'autotune', 'harmonizer', 'pitch', 'talkbox', 'robot', 'whisper'] as const;
export const MAX_VOICE_FX = 4;
export interface Lane {
  id: string; name: string; family: Family; icon: Family; color: string; sound?: Sound;
  speed?: Speed; dynamics?: DynMark[]; fx?: LaneFx; voice?: VoiceFx[];
}
export const MIX_STYLES = ['lofi'] as const;
export const ROOMS = ['dry', 'small_room', 'concert_hall', 'cathedral', 'cave'] as const;
export interface Room { preset: (typeof ROOMS)[number]; amount: number }
export interface Limiter { on: boolean; ceiling_db: number }
export interface Mix { style: (typeof MIX_STYLES)[number]; loudness: number; room?: Room; limiter?: Limiter }
/** A character belongs to the score: the page has none built in. */
export interface Character { id: string; name: string; color: string }
export interface MotifSpan { lane: string; from: number; to: number }
/** `character` is the id of an entry of the score's characters; the motif is drawn in that character's colour. */
export interface Motif { id: string; character: string; spans: MotifSpan[] }
/** `bend` (schema 2) is Exact Pitch's curve: [seconds from the note's start, cents] pairs, 2 to 64 of them. */
export interface ScoreNote { lane: string; start: number; length: number; pitch: number; velocity: number; motif: string | null; bend?: [number, number][] }
export const MAX_BEND_POINTS = 64;
export interface GlossaryUse { term: string; from: number; to: number }
export interface AudioSource { file: 'audio.webm' | 'audio.m4a'; type: string }
export interface Spectrogram { file: 'spectrogram.png'; low_hz: number; high_hz: number; scale: 'log' | 'linear' }
/** A music change names bars (from_bar, to_bar); a sound change names seconds (from, to). */
export interface Change { from_bar?: number; to_bar?: number; from?: number; to?: number; lane: string | null; text: string; answers: string[] }
export interface Score {
  schema: 1 | 2; kind: Kind; project: Project; piece: { id: string; title: string }; draft: number; made: string; duration: number;
  bars?: number; tempo?: Tempo[];                          // music only; absent for sound
  piece_tempo?: TempoMark[];                               // schema 2, music only: the tempo line `tempo` is written from
  sections: Section[]; lanes: Lane[]; characters: Character[]; motifs: Motif[]; notes: ScoreNote[];
  energy: [number, number][]; glossary: GlossaryUse[];
  audio: AudioSource[];                                    // empty only when the score is renderable
  spectrogram?: Spectrogram;                               // required unless the score is renderable
  mix?: Mix;                                               // with a sound on every lane, the score is renderable
  musicxml?: 'score.musicxml';                             // required for music, optional for sound
  changes: Change[];
}
/** A renderable score has a sound on every lane and a mix: the page can play it without an audio file. */
export const isRenderable = (s: Pick<Score, 'lanes' | 'mix'>): boolean => s.mix !== undefined && s.lanes.every(l => l.sound !== undefined);
export type Parsed = { ok: true; score: Score } | { ok: false; error: string };

/** The tempo line's BPM in bar `bar`: a ramp moves linearly by bar toward the next mark, rounded to 0.01 BPM. */
export function tempoLineBpm(marks: readonly TempoMark[], bar: number): number {
  let i = 0;
  while (i + 1 < marks.length && marks[i + 1]!.bar <= bar) i++;
  const m = marks[i]!;
  const next = marks[i + 1];
  if (m.shape === 'steady' || !next) return m.bpm;
  return Math.round((m.bpm + ((next.bpm - m.bpm) * (bar - m.bar)) / (next.bar - m.bar)) * 100) / 100;
}

/** Whether a score uses anything schema 1 does not have, and so must be saved as schema 2. */
export function needsSchema2(s: Score): boolean {
  return s.piece_tempo !== undefined || s.mix?.room !== undefined || s.mix?.limiter !== undefined
    || s.lanes.some(l => l.speed !== undefined || l.dynamics !== undefined || l.fx !== undefined || l.voice !== undefined)
    || s.notes.some(n => n.bend !== undefined);
}

export function unknownSchemaMessage(n: unknown): string {
  return `This draft uses score schema ${String(n)}, which this page does not know. Reload the page; if it still says so, the page needs an update.`;
}

/** The colour of the motif's character, from the score's own characters. */
export function motifColor(score: Score, motif: Motif): string {
  const c = score.characters.find(x => x.id === motif.character);
  if (!c) throw new Error(`motif ${motif.id} names character ${motif.character}, which the score does not have`);
  return c.color;
}

// A broken rule is thrown as a Fail and turned into the error of the Parsed result.
class Fail extends Error {}
const fail = (path: string, rule: string): never => { throw new Fail(`${path}: ${rule}`); };

type Obj = Record<string, unknown>;
const EPS = 1e-9;
const UNITS: readonly number[] = [1, 2, 4, 8, 16];
const AUDIO_TYPES: Record<string, string> = { 'audio.webm': 'audio/webm; codecs=opus', 'audio.m4a': 'audio/mp4; codecs=mp4a.40.2' };
const ANSWER_RE = /^[0-9a-f]{32}$/;
const MADE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

const obj = (v: unknown, path: string): Obj => (typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Obj) : fail(path, 'must be an object'));
const arr = (v: unknown, path: string, min = 0): unknown[] => (Array.isArray(v) && v.length >= min ? v : fail(path, min > 0 ? `must be a list of at least ${min}` : 'must be a list'));
const num = (v: unknown, path: string): number => (typeof v === 'number' && Number.isFinite(v) ? v : fail(path, 'must be a number'));
const int = (v: unknown, path: string, min: number, max = Infinity): number => {
  const n = num(v, path);
  return Number.isInteger(n) && n >= min && n <= max ? n : fail(path, `must be a whole number${max === Infinity ? ` of at least ${min}` : ` from ${min} to ${max}`}`);
};
const text = (v: unknown, path: string, max: number): string => (typeof v === 'string' && v.length >= 1 && v.length <= max ? v : fail(path, `must be 1 to ${max} characters`));
const id = (v: unknown, path: string): string => (typeof v === 'string' && ID_RE.test(v) ? v : fail(path, 'must be lowercase letters, digits and hyphens (up to 48)'));
const color = (v: unknown, path: string): string => (typeof v === 'string' && COLOR_RE.test(v) ? v : fail(path, 'must be a colour like #1a2b3c'));
const oneOf = <T extends string>(v: unknown, path: string, allowed: readonly T[]): T => (allowed.includes(v as T) ? (v as T) : fail(path, `must be one of ${allowed.join(', ')}`));
const absent = (o: Obj, key: string, path: string, why: string): void => { if (key in o && o[key] !== undefined) fail(path === '' ? key : `${path}.${key}`, why); };

function uniqueIds<T extends { id: string }>(items: T[], path: string): void {
  const seen = new Set<string>();
  items.forEach((it, i) => {
    if (seen.has(it.id)) fail(`${path}[${i}].id`, `duplicates the id ${it.id}`);
    seen.add(it.id);
  });
}

/**
 * Validates every rule in the plan's schema table; the first broken rule is the error, naming its path (e.g. "sections[1].from_bar").
 * `instruments` is the library's instrument ids. The page has not fetched the library before it parses a score, so
 * without it `sound.instrument` is checked only for the id format; the renderer refuses an instrument the library lacks.
 */
export function parseScore(raw: unknown, instruments?: ReadonlySet<string>): Parsed {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return { ok: false, error: 'score: must be an object' };
  const schema = (raw as Obj)['schema'];
  if (typeof schema !== 'number' || !SCHEMAS.includes(schema)) return { ok: false, error: unknownSchemaMessage(schema) };
  try {
    return { ok: true, score: build(raw as Obj, instruments) };
  } catch (e) {
    if (e instanceof Fail) return { ok: false, error: e.message };
    throw e;
  }
}

function build(r: Obj, instruments: ReadonlySet<string> | undefined): Score {
  const schema = r['schema'] as 1 | 2;
  /** A schema 2 field on a schema 1 score is refused, so a writer that uses one says schema 2. */
  const v2 = (o: Obj, key: string, path: string): boolean => {
    if (o[key] === undefined) return false;
    if (schema !== 2) fail(path === '' ? key : `${path}.${key}`, 'needs schema 2');
    return true;
  };
  const kind = oneOf(r['kind'], 'kind', KINDS);
  const music = kind === 'music';
  const pr = obj(r['project'], 'project');
  const project: Project = { id: id(pr['id'], 'project.id'), name: text(pr['name'], 'project.name', 80) };
  const pi = obj(r['piece'], 'piece');
  const piece = { id: id(pi['id'], 'piece.id'), title: text(pi['title'], 'piece.title', 120) };
  const draft = int(r['draft'], 'draft', 1);
  const made = typeof r['made'] === 'string' && MADE_RE.test(r['made']) && !Number.isNaN(Date.parse(r['made'])) ? r['made'] : fail('made', 'must be an ISO 8601 UTC time ending in Z');
  const duration = num(r['duration'], 'duration');
  if (duration <= 0) fail('duration', 'must be above 0 seconds');
  if (!music && duration < MIN_SOUND_SECONDS) fail('duration', `must be at least ${MIN_SOUND_SECONDS} seconds for a sound piece`);

  let bars: number | undefined;
  let tempo: Tempo[] | undefined;
  if (music) {
    bars = int(r['bars'], 'bars', 1);
    tempo = arr(r['tempo'], 'tempo', 1).map((t, i): Tempo => {
      const p = `tempo[${i}]`;
      const o = obj(t, p);
      const bpm = num(o['bpm'], `${p}.bpm`);
      if (bpm <= 0) fail(`${p}.bpm`, 'must be above 0');
      return { bar: int(o['bar'], `${p}.bar`, 1, bars), bpm, beats: int(o['beats'], `${p}.beats`, 1, 16), unit: UNITS.includes(o['unit'] as Tempo['unit']) ? (o['unit'] as Tempo['unit']) : fail(`${p}.unit`, 'must be one of 1, 2, 4, 8, 16') };
    });
    tempo.forEach((t, i) => {
      if (i === 0 ? t.bar !== 1 : t.bar <= tempo![i - 1]!.bar) fail(`tempo[${i}].bar`, i === 0 ? 'the first tempo must start at bar 1' : 'bars must increase');
    });
    // The last bar starts inside the piece: the tempo map and the duration agree.
    let lastBarStart = 0;
    tempo.forEach((t, i) => {
      const lastBefore = Math.min(i + 1 < tempo!.length ? tempo![i + 1]!.bar - 1 : bars!, bars! - 1);
      lastBarStart += Math.max(0, lastBefore - t.bar + 1) * ((t.beats * 60) / t.bpm);
    });
    if (lastBarStart >= duration - EPS) fail('duration', `must run past the start of the last bar (${lastBarStart} seconds)`);
  } else {
    absent(r, 'bars', '', 'a sound piece has no bars');
    absent(r, 'tempo', '', 'a sound piece has no tempo');
    absent(r, 'piece_tempo', '', 'a sound piece has no tempo');
  }
  let pieceTempo: TempoMark[] | undefined;
  if (music && v2(r, 'piece_tempo', '')) pieceTempo = tempoLineOf(r['piece_tempo'], bars!, tempo!);

  const sections = sectionsOf(r['sections'], music, bars, duration);
  const lanes = arr(r['lanes'], 'lanes', 1).map((l, i): Lane => {
    const p = `lanes[${i}]`;
    const o = obj(l, p);
    const lane: Lane = { id: id(o['id'], `${p}.id`), name: text(o['name'], `${p}.name`, 60), family: oneOf(o['family'], `${p}.family`, FAMILIES), icon: oneOf(o['icon'], `${p}.icon`, FAMILIES), color: color(o['color'], `${p}.color`) };
    if (o['sound'] != null) lane.sound = soundOf(o['sound'], `${p}.sound`, instruments);
    if (v2(o, 'speed', p)) lane.speed = speedOf(o['speed'], `${p}.speed`);
    if (v2(o, 'dynamics', p)) {
      if (!music) fail(`${p}.dynamics`, 'a sound piece has no bars for a loudness line');
      lane.dynamics = dynamicsOf(o['dynamics'], `${p}.dynamics`, bars!);
    }
    if (v2(o, 'fx', p)) lane.fx = fxOf(o['fx'], `${p}.fx`);
    if (v2(o, 'voice', p)) lane.voice = voiceOf(o['voice'], `${p}.voice`);
    return lane;
  });
  uniqueIds(lanes, 'lanes');
  lanes.forEach((l, i) => l.voice?.forEach((v, j) => {
    if ((v.effect === 'vocoder' || v.effect === 'talkbox') && (v.carrier === l.id || !lanes.some(x => x.id === v.carrier))) {
      fail(`lanes[${i}].voice[${j}].carrier`, 'must be the id of another lane');
    }
  }));
  let mix: Mix | undefined;
  if (r['mix'] != null) {
    const mo = obj(r['mix'], 'mix');
    mix = { style: oneOf(mo['style'], 'mix.style', MIX_STYLES), loudness: inRange(mo['loudness'], 'mix.loudness', -30, -10) };
    if (v2(mo, 'room', 'mix')) {
      const ro = obj(mo['room'], 'mix.room');
      mix.room = { preset: oneOf(ro['preset'], 'mix.room.preset', ROOMS), amount: inRange(ro['amount'], 'mix.room.amount', 0, 1) };
    }
    if (v2(mo, 'limiter', 'mix')) {
      const lo = obj(mo['limiter'], 'mix.limiter');
      mix.limiter = { on: bool(lo['on'], 'mix.limiter.on'), ceiling_db: inRange(lo['ceiling_db'], 'mix.limiter.ceiling_db', -12, 0) };
    }
  }
  const renderable = isRenderable({ lanes, mix });
  const laneIds = new Set(lanes.map(l => l.id));

  const characters = arr(r['characters'], 'characters').map((c, i): Character => {
    const p = `characters[${i}]`;
    const o = obj(c, p);
    return { id: id(o['id'], `${p}.id`), name: text(o['name'], `${p}.name`, 60), color: color(o['color'], `${p}.color`) };
  });
  uniqueIds(characters, 'characters');
  const characterIds = new Set(characters.map(c => c.id));

  const within = (from: number, to: number, path: string): void => {
    if (!(from >= 0 && from < to && to <= duration + EPS)) fail(path, `must satisfy 0 <= from < to <= ${duration}`);
  };
  const motifs = arr(r['motifs'], 'motifs').map((m, i): Motif => {
    const p = `motifs[${i}]`;
    const o = obj(m, p);
    const mid = id(o['id'], `${p}.id`);
    const character = typeof o['character'] === 'string' && characterIds.has(o['character']) ? o['character'] : fail(`${p}.character`, 'must be the id of one of the score\'s characters');
    const spans = arr(o['spans'], `${p}.spans`).map((s, j): MotifSpan => {
      const q = `${p}.spans[${j}]`;
      const so = obj(s, q);
      const lane = typeof so['lane'] === 'string' && laneIds.has(so['lane']) ? so['lane'] : fail(`${q}.lane`, 'must be the id of a lane');
      const from = num(so['from'], `${q}.from`);
      const to = num(so['to'], `${q}.to`);
      within(from, to, q);
      return { lane, from, to };
    });
    return { id: mid, character, spans };
  });
  uniqueIds(motifs, 'motifs');
  const motifIds = new Set(motifs.map(m => m.id));

  const notes = arr(r['notes'], 'notes').map((n, i): ScoreNote => {
    const p = `notes[${i}]`;
    const o = obj(n, p);
    const lane = typeof o['lane'] === 'string' && laneIds.has(o['lane']) ? o['lane'] : fail(`${p}.lane`, 'must be the id of a lane');
    const start = num(o['start'], `${p}.start`);
    const length = num(o['length'], `${p}.length`);
    if (start < 0 || length <= 0 || start + length > duration + EPS) fail(p, `must start at 0 or later, have a length above 0 and end by ${duration} seconds`);
    const pitch = int(o['pitch'], `${p}.pitch`, 0, 127);
    const velocity = int(o['velocity'], `${p}.velocity`, 1, 127);
    const motif = o['motif'] === null ? null : typeof o['motif'] === 'string' && motifIds.has(o['motif']) ? o['motif'] : fail(`${p}.motif`, 'must be a motif id or null');
    const note: ScoreNote = { lane, start, length, pitch, velocity, motif };
    if (v2(o, 'bend', p)) note.bend = bendOf(o['bend'], `${p}.bend`, length);
    return note;
  });

  const energy = arr(r['energy'], 'energy', 2).map((pt, i): [number, number] => {
    const p = `energy[${i}]`;
    if (!Array.isArray(pt) || pt.length !== 2) return fail(p, 'must be a [seconds, value] pair');
    const t = num(pt[0], `${p}[0]`);
    const v = num(pt[1], `${p}[1]`);
    if (v < 0 || v > 1) fail(p, 'the value must be between 0 and 1');
    return [t, v];
  });
  energy.forEach(([t], i) => {
    if (i > 0 && t <= energy[i - 1]![0]) fail(`energy[${i}]`, 'times must increase');
  });
  if (energy[0]![0] !== 0) fail('energy[0]', 'the first time must be 0');
  if (Math.abs(energy[energy.length - 1]![0] - duration) > EPS) fail(`energy[${energy.length - 1}]`, `the last time must be the duration, ${duration}`);

  const glossary = arr(r['glossary'], 'glossary').map((g, i): GlossaryUse => {
    const p = `glossary[${i}]`;
    const o = obj(g, p);
    const t = typeof o['term'] === 'string' && term(o['term']) ? o['term'] : fail(`${p}.term`, 'must be an id in the glossary');
    const from = num(o['from'], `${p}.from`);
    const to = num(o['to'], `${p}.to`);
    within(from, to, p);
    if (to - from > 15 + EPS) fail(p, 'a clip is at most 15 seconds');
    return { term: t, from, to };
  });

  const audio = arr(r['audio'], 'audio', renderable ? 0 : 1).map((a, i): AudioSource => {
    const p = `audio[${i}]`;
    const o = obj(a, p);
    const file = oneOf(o['file'], `${p}.file`, ['audio.webm', 'audio.m4a']);
    if (o['type'] !== AUDIO_TYPES[file]) fail(`${p}.type`, `must be ${AUDIO_TYPES[file]} for ${file}`);
    return { file, type: AUDIO_TYPES[file]! };
  });

  let spectrogram: Spectrogram | undefined;
  if (r['spectrogram'] != null || !renderable) spectrogram = spectrogramOf(r['spectrogram']);

  let musicxml: 'score.musicxml' | undefined;
  if (r['musicxml'] !== undefined) musicxml = r['musicxml'] === 'score.musicxml' ? 'score.musicxml' : fail('musicxml', 'must be score.musicxml');
  else if (music) fail('musicxml', 'a music piece requires score.musicxml');

  const changes = arr(r['changes'], 'changes').map((c, i): Change => {
    const p = `changes[${i}]`;
    const o = obj(c, p);
    const ch: Change = { lane: null, text: '', answers: [] };
    if (music) {
      for (const k of ['from', 'to']) absent(o, k, p, 'a music change names bars (from_bar, to_bar)');
      const a = int(o['from_bar'], `${p}.from_bar`, 1, bars);
      const b = int(o['to_bar'], `${p}.to_bar`, a, bars);
      ch.from_bar = a;
      ch.to_bar = b;
    } else {
      for (const k of ['from_bar', 'to_bar']) absent(o, k, p, 'a sound change names seconds (from, to)');
      const a = num(o['from'], `${p}.from`);
      const b = num(o['to'], `${p}.to`);
      if (!(a >= 0 && a < b)) fail(`${p}.from`, 'must be 0 or later and before to');
      if (b > duration + EPS) fail(`${p}.to`, `must be at most ${duration}`);
      ch.from = a;
      ch.to = b;
    }
    ch.lane = o['lane'] === null ? null : typeof o['lane'] === 'string' && laneIds.has(o['lane']) ? o['lane'] : fail(`${p}.lane`, 'must be a lane id or null');
    ch.text = text(o['text'], `${p}.text`, 500);
    ch.answers = arr(o['answers'], `${p}.answers`).map((x, j) => (typeof x === 'string' && ANSWER_RE.test(x) ? x : fail(`${p}.answers[${j}]`, 'must be a note id (32 hex digits)')));
    return ch;
  });

  const score: Score = { schema, kind, project, piece, draft, made, duration, sections, lanes, characters, motifs, notes, energy, glossary, audio, changes };
  if (pieceTempo !== undefined) score.piece_tempo = pieceTempo;
  if (spectrogram !== undefined) score.spectrogram = spectrogram;
  if (mix !== undefined) score.mix = mix;
  if (bars !== undefined) score.bars = bars;
  if (tempo !== undefined) score.tempo = tempo;
  if (musicxml !== undefined) score.musicxml = musicxml;
  return score;
}

const bool = (v: unknown, path: string): boolean => (typeof v === 'boolean' ? v : fail(path, 'must be true or false'));

/** Marks in bar order from bar 1, each with a value and a shape; a moving shape needs the next mark to move that way, the last holds. */
function marksOf<S extends string>(v: unknown, path: string, bars: number, value: (x: unknown, p: string) => number, key: string,
  shapes: readonly S[], up: S, down: S): { bar: number; value: number; shape: S }[] {
  const list = arr(v, path, 1).map((m, i) => {
    const p = `${path}[${i}]`;
    const o = obj(m, p);
    return { bar: int(o['bar'], `${p}.bar`, 1, bars), value: value(o[key], `${p}.${key}`), shape: oneOf(o['shape'], `${p}.shape`, shapes) };
  });
  list.forEach((m, i) => {
    const next = list[i + 1];
    if (i === 0 ? m.bar !== 1 : m.bar <= list[i - 1]!.bar) fail(`${path}[${i}].bar`, i === 0 ? 'the first mark must be at bar 1' : 'bars must increase');
    if (!next && m.shape !== shapes[0]) fail(`${path}[${i}].shape`, `the last mark must be ${shapes[0]}`);
    if (next && m.shape === up && !(next.value > m.value)) fail(`${path}[${i}].shape`, `${up} needs the next mark above it`);
    if (next && m.shape === down && !(next.value < m.value)) fail(`${path}[${i}].shape`, `${down} needs the next mark below it`);
  });
  return list;
}

function tempoLineOf(v: unknown, bars: number, tempo: readonly Tempo[]): TempoMark[] {
  const marks = marksOf(v, 'piece_tempo', bars, (x, p) => inRange(x, p, 20, 400), 'bpm', ['steady', 'speed_up', 'slow_down'] as const, 'speed_up', 'slow_down')
    .map(m => ({ bar: m.bar, bpm: m.value, shape: m.shape }));
  for (let bar = 1; bar <= bars; bar++) {
    const want = tempoLineBpm(marks, bar);
    let t = tempo[0]!;
    for (const x of tempo) if (x.bar <= bar) t = x;
    if (Math.abs(t.bpm - want) > 0.005) fail('tempo', `must be ${want} BPM in bar ${bar}, as piece_tempo says`);
  }
  return marks;
}

function dynamicsOf(v: unknown, path: string, bars: number): DynMark[] {
  const level = (x: unknown, p: string): number => (typeof x === 'number' && LEVELS.includes(x) ? x : fail(p, `must be one of ${LEVELS.join(', ')}`));
  return marksOf(v, path, bars, level, 'level', ['steady', 'louder', 'softer'] as const, 'louder', 'softer')
    .map(m => ({ bar: m.bar, level: m.value, shape: m.shape }));
}

function speedOf(v: unknown, path: string): Speed {
  if (v === 'follow') return 'follow';
  const o = typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Obj) : fail(path, 'must be "follow", {ratio} or {bpm}');
  if ('ratio' in o && !('bpm' in o)) {
    const r = num(o['ratio'], `${path}.ratio`);
    return SPEED_RATIOS.some(x => Math.abs(x - r) < 1e-6) ? { ratio: r } : fail(`${path}.ratio`, `must be one of ${SPEED_RATIOS.join(', ')}`);
  }
  if ('bpm' in o && !('ratio' in o)) return { bpm: inRange(o['bpm'], `${path}.bpm`, 20, 400) };
  return fail(path, 'must be "follow", {ratio} or {bpm}');
}

function bendOf(v: unknown, path: string, length: number): [number, number][] {
  const list = arr(v, path, 2);
  if (list.length > MAX_BEND_POINTS) fail(path, `must have at most ${MAX_BEND_POINTS} points`);
  const pts = list.map((pt, i): [number, number] => {
    const p = `${path}[${i}]`;
    if (!Array.isArray(pt) || pt.length !== 2) return fail(p, 'must be a [seconds, cents] pair');
    return [num(pt[0], `${p}[0]`), inRange(pt[1], `${p}[1]`, -1200, 1200)];
  });
  pts.forEach(([t], i) => {
    if (i === 0 ? t !== 0 : t <= pts[i - 1]![0]) fail(`${path}[${i}][0]`, i === 0 ? 'the first time must be 0' : 'times must increase');
    if (t > length + EPS) fail(`${path}[${i}][0]`, `must be within the note (${length} seconds)`);
  });
  return pts;
}

/** An object of only the keys listed; each present one checked by its own rule. */
function settings<T extends object>(v: unknown, path: string, rules: Record<string, (x: unknown, p: string) => unknown>): T {
  const o = obj(v, path);
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(o)) {
    const rule = rules[k];
    if (!rule) fail(`${path}.${k}`, `is not a setting (${Object.keys(rules).join(', ')})`);
    if (o[k] !== undefined) out[k] = rule!(o[k], `${path}.${k}`);
  }
  return out as T;
}
const span = (min: number, max: number) => (x: unknown, p: string): number => inRange(x, p, min, max);
const whole = (min: number, max: number) => (x: unknown, p: string): number => int(x, p, min, max);

function fxOf(v: unknown, path: string): LaneFx {
  return settings<LaneFx>(v, path, {
    volume_db: span(-60, 12), pan: span(-1, 1),
    eq: (x, p) => settings(x, p, { bass: span(-12, 12), middle: span(-12, 12), treble: span(-12, 12) }),
    echo: (x, p) => settings(x, p, { amount: span(0, 1), repeats: whole(1, 8), beats: span(0.25, 2) }),
    shimmer: span(0, 1), warmth: span(0, 1),
    brightness: (x, p) => settings(x, p, { cutoff: span(0, 1), sweep: (y, q) => oneOf(y, q, SWEEPS) }),
    even_out: span(0, 1), room: span(0, 1), mute: bool, solo: bool,
  });
}

function voiceOf(v: unknown, path: string): VoiceFx[] {
  const list = arr(v, path);
  if (list.length > MAX_VOICE_FX) fail(path, `must have at most ${MAX_VOICE_FX} effects`);
  return list.map((e, i): VoiceFx => {
    const p = `${path}[${i}]`;
    const o = obj(e, p);
    const effect = oneOf(o['effect'], `${p}.effect`, VOICE_EFFECTS);
    const carrier = (x: unknown, q: string): string => id(x, q);
    const voices = (x: unknown, q: string): string[] => {
      const vs = arr(x, q, 1).map((y, j) => oneOf(y, `${q}[${j}]`, HARMONY_VOICES));
      if (vs.length > 3 || new Set(vs).size !== vs.length) fail(q, 'must be 1 to 3 different voices');
      return vs;
    };
    const rules: Record<string, Record<string, (x: unknown, q: string) => unknown>> = {
      vocoder: { carrier, bands: whole(8, 32) },
      autotune: { strength: span(0, 1), retune_ms: span(0, 400) },
      harmonizer: { voices, mix: span(0, 1) },
      pitch: { semitones: span(-12, 12), formant: span(-12, 12) },
      talkbox: { carrier, mix: span(0, 1) },
      robot: { mix: span(0, 1) },
      whisper: { mix: span(0, 1) },
    };
    const { effect: _, ...rest } = o;
    const got = settings<Record<string, unknown>>(rest, p, rules[effect]!);
    for (const k of Object.keys(rules[effect]!)) if (got[k] === undefined) fail(`${p}.${k}`, `is needed for ${effect}`);
    return { effect, ...got } as VoiceFx;
  });
}

function inRange(v: unknown, path: string, min: number, max: number): number {
  const n = num(v, path);
  return n >= min && n <= max ? n : fail(path, `must be from ${min} to ${max}`);
}

function soundOf(v: unknown, path: string, instruments: ReadonlySet<string> | undefined): Sound {
  const o = obj(v, path);
  const instrument = id(o['instrument'], `${path}.instrument`);
  if (instruments && !instruments.has(instrument)) fail(`${path}.instrument`, 'must be an instrument id in the sample library');
  return { instrument, gain_db: inRange(o['gain_db'], `${path}.gain_db`, -40, 20), attack: inRange(o['attack'], `${path}.attack`, 0, 10), release: inRange(o['release'], `${path}.release`, 0, 20) };
}

function spectrogramOf(v: unknown): Spectrogram {
  const so = obj(v, 'spectrogram');
  const low_hz = num(so['low_hz'], 'spectrogram.low_hz');
  const high_hz = num(so['high_hz'], 'spectrogram.high_hz');
  if (!(low_hz > 0)) fail('spectrogram.low_hz', 'must be above 0');
  if (!(high_hz > low_hz)) fail('spectrogram.high_hz', 'must be above low_hz');
  return { file: so['file'] === 'spectrogram.png' ? 'spectrogram.png' : fail('spectrogram.file', 'must be spectrogram.png'), low_hz, high_hz, scale: oneOf(so['scale'], 'spectrogram.scale', ['log', 'linear']) };
}

function sectionsOf(v: unknown, music: boolean, bars: number | undefined, duration: number): Section[] {
  const list = arr(v, 'sections', music ? 1 : 0);
  const out = list.map((s, i): Section => {
    const p = `sections[${i}]`;
    const o = obj(s, p);
    const base = { id: id(o['id'], `${p}.id`), name: text(o['name'], `${p}.name`, 60), color: color(o['color'], `${p}.color`) };
    if (music) {
      for (const k of ['from', 'to']) absent(o, k, p, 'a music section spans bars (from_bar, to_bar)');
      return { ...base, from_bar: int(o['from_bar'], `${p}.from_bar`, 1), to_bar: int(o['to_bar'], `${p}.to_bar`, 1) };
    }
    for (const k of ['from_bar', 'to_bar']) absent(o, k, p, 'a sound section is a moment in seconds (from, to)');
    return { ...base, from: num(o['from'], `${p}.from`), to: num(o['to'], `${p}.to`) };
  });
  uniqueIds(out, 'sections');
  out.forEach((s, i) => {
    const prev = out[i - 1];
    if (music) {
      const from = s.from_bar!;
      const to = s.to_bar!;
      const want = prev ? prev.to_bar! + 1 : 1;
      if (from !== want) fail(`sections[${i}].from_bar`, prev ? `must start at bar ${want}, one after the previous section` : 'the first section must start at bar 1');
      if (to < from) fail(`sections[${i}].to_bar`, 'must not be before from_bar');
      if (i === out.length - 1 && to !== bars) fail(`sections[${i}].to_bar`, `the last section must end at bar ${bars}`);
    } else {
      const from = s.from!;
      const to = s.to!;
      if (from < 0 || (prev && from < prev.to! - EPS)) fail(`sections[${i}].from`, prev ? 'must not start before the previous moment ends' : 'must be 0 or later');
      if (!(from < to)) fail(`sections[${i}].to`, 'must be after from');
      if (to > duration + EPS) fail(`sections[${i}].to`, `must be at most ${duration}`);
    }
  });
  return out;
}
