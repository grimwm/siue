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
/**
 * A Vocal Track's recorded voice (schema 2): its takes, each a file the studio holds (`vocal-<sha256>.<ext>`, or in the
 * page a `local-<uuid>` take not yet saved), and its clips, each a stretch of a take placed in the piece. All in seconds.
 */
export interface VocalTake { file: string; seconds: number }
export interface VocalClip { take: string; at: number; from: number; to: number; gain_db: number; fade_in: number; fade_out: number }
export interface VocalTrack { takes: VocalTake[]; clips: VocalClip[] }
/** The reserved instrument of a vocal lane: it plays its takes, not the sample library. */
export const VOCAL_INSTRUMENT = 'vocal';
export const TAKE_RE = /^vocal-[0-9a-f]{64}\.(flac|ogg|webm)$/;
export const LOCAL_TAKE_RE = /^local-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export const MAX_TAKES = 32;
export const MAX_CLIPS = 64;
/** A take is at most 15 minutes. */
export const MAX_TAKE_SECONDS = 900;
export interface Lane {
  id: string; name: string; family: Family; icon: Family; color: string; sound?: Sound;
  speed?: Speed; dynamics?: DynMark[]; fx?: LaneFx; voice?: VoiceFx[]; vocal?: VocalTrack;
}
export const isVocal = (l: Pick<Lane, 'vocal'>): boolean => l.vocal !== undefined;
export const MIX_STYLES = ['lofi'] as const;
export const ROOMS = ['dry', 'small_room', 'concert_hall', 'cathedral', 'cave'] as const;
export interface Room { preset: (typeof ROOMS)[number]; amount: number }
export interface Limiter { on: boolean; ceiling_db: number }
export interface Mix { style: (typeof MIX_STYLES)[number]; loudness: number; room?: Room; limiter?: Limiter }
/** A character belongs to the score: the page has none built in. */
/**
 * DJ & Effects (schema 2, music only): an effect over bars of one lane, or of the whole piece when `lane` is null.
 * Bars are positions (12.5 is halfway through bar 12); `settings` holds only the effect's own keys, a key left out
 * being its default; `points` are a recorded move's [bar, value…] lists (a scratch's rate, the crossfader's position,
 * an XY effect's x and y).
 */
export interface FxClip { effect: FxClipEffect; lane: string | null; from_bar: number; to_bar: number; settings?: Record<string, unknown>; points?: number[][] }
export const FX_CLIP_EFFECTS = [
  'scratch', 'spinback', 'tape_stop', 'tape_start', 'vinyl',
  'riser', 'snare_roll', 'filter_sweep', 'impact', 'sidechain',
  'stutter', 'trance_gate', 'wobble', 'tremolo', 'auto_pan',
  'bitcrusher', 'ring_mod', 'phaser', 'flanger', 'auto_wah', 'rotary',
  'echo_out', 'ping_pong', 'reverse', 'reverse_reverb', 'granular_freeze', 'wide_8d', 'doppler',
  'filter', 'pitch_shift', 'harmonizer', 'vocoder', 'autotune',
  'crossfader', 'hot_cue', 'looper',
] as const;
export type FxClipEffect = (typeof FX_CLIP_EFFECTS)[number];
export const MAX_FX_CLIPS = 256;
export const MAX_FX_POINTS = 512;
/** The shortest clip, in bars. */
export const MIN_CLIP_BARS = 1 / 64;
/** How many values each of a recorded move's points carries after its bar, by effect; an effect not here records none. */
export const FX_POINT_VALUES: Partial<Record<FxClipEffect, { n: number; min: number; max: number }>> = {
  scratch: { n: 1, min: -8, max: 8 }, crossfader: { n: 1, min: 0, max: 1 },
  wobble: { n: 2, min: 0, max: 1 }, bitcrusher: { n: 2, min: 0, max: 1 }, flanger: { n: 2, min: 0, max: 1 },
  ping_pong: { n: 2, min: 0, max: 1 }, filter: { n: 2, min: 0, max: 1 },
};
/** Effects that work on the whole piece only (lane null). */
export const WHOLE_PIECE_EFFECTS: readonly FxClipEffect[] = ['crossfader', 'looper'];

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
  fx_clips?: FxClip[];                                     // schema 2, music only: DJ & Effects on the timeline
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
  return s.piece_tempo !== undefined || s.fx_clips !== undefined || s.mix?.room !== undefined || s.mix?.limiter !== undefined
    || s.lanes.some(l => l.speed !== undefined || l.dynamics !== undefined || l.fx !== undefined || l.voice !== undefined || l.vocal !== undefined)
    || s.notes.some(n => n.bend !== undefined);
}

/** Seconds from the start of the piece at bar position `bar` (12.5 is halfway through bar 12), through every tempo change. */
export function barSeconds(tempo: readonly Tempo[], bar: number): number {
  let sec = 0;
  for (let i = 0; i < tempo.length; i++) {
    const t = tempo[i]!;
    const next = tempo[i + 1]?.bar ?? Infinity;
    if (bar <= t.bar) break;
    const span = Math.min(bar, next) - t.bar;
    sec += (span * t.beats * 60) / t.bpm;
  }
  return Math.round(sec * 1e6) / 1e6;
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
    if (v2(o, 'vocal', p)) lane.vocal = vocalOf(o['vocal'], `${p}.vocal`, duration);
    if ((lane.sound?.instrument === VOCAL_INSTRUMENT) !== (lane.vocal !== undefined)) {
      fail(lane.vocal ? `${p}.sound` : `${p}.sound.instrument`, lane.vocal ? `a vocal track's sound is the instrument ${VOCAL_INSTRUMENT}` : `${VOCAL_INSTRUMENT} is only for a lane with a vocal track`);
    }
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
  let fxClips: FxClip[] | undefined;
  if (v2(r, 'fx_clips', '')) {
    if (!music) fail('fx_clips', 'a sound piece has no bars for effects');
    fxClips = fxClipsOf(r['fx_clips'], bars!, laneIds);
  }

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
    if (lanes.find(l => l.id === lane)?.vocal) fail(`${p}.lane`, 'a vocal track holds takes, not notes');
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
  if (fxClips !== undefined) score.fx_clips = fxClips;
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

function harmonyVoices(x: unknown, q: string): string[] {
  const vs = arr(x, q, 1).map((y, j) => oneOf(y, `${q}[${j}]`, HARMONY_VOICES));
  if (vs.length > 3 || new Set(vs).size !== vs.length) fail(q, 'must be 1 to 3 different voices');
  return vs;
}

function voiceOf(v: unknown, path: string): VoiceFx[] {
  const list = arr(v, path);
  if (list.length > MAX_VOICE_FX) fail(path, `must have at most ${MAX_VOICE_FX} effects`);
  return list.map((e, i): VoiceFx => {
    const p = `${path}[${i}]`;
    const o = obj(e, p);
    const effect = oneOf(o['effect'], `${p}.effect`, VOICE_EFFECTS);
    const carrier = (x: unknown, q: string): string => id(x, q);
    const voices = harmonyVoices;
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

const FX_CHOICES = {
  speed3: ['slow', 'medium', 'fast'], time3: ['fast', 'medium', 'slow'],
} as const;
const choice = (list: readonly string[]) => (x: unknown, p: string): string => oneOf(x, p, list);
const laneList = (x: unknown, p: string): string[] => {
  const ids = arr(x, p, 1).map((y, j) => id(y, `${p}[${j}]`));
  if (new Set(ids).size !== ids.length) fail(p, 'must name each lane once');
  return ids;
};
/** Each effect's settings and their rules; `needed` lists the settings a clip of it must give. */
const FX_CLIP_RULES: Record<FxClipEffect, { rules: Record<string, (x: unknown, q: string) => unknown>; needed?: string[] }> = {
  scratch: { rules: { style: choice(['baby', 'chirp', 'transformer']) } },
  spinback: { rules: { throw: choice(['gentle', 'hard']) } },
  tape_stop: { rules: { time: choice(FX_CHOICES.time3) } },
  tape_start: { rules: { time: choice(FX_CHOICES.time3) } },
  vinyl: { rules: { age: span(0.2, 1) } },
  riser: { rules: { climb: whole(1, 3) } },
  snare_roll: { rules: { level: span(0.3, 1) } },
  filter_sweep: { rules: { mode: choice(['highpass_up', 'lowpass_down']) } },
  impact: { rules: { kind: choice(['impact', 'downlifter']) } },
  sidechain: { rules: { depth: span(0, 1) } },
  stutter: { rules: { slice: (x, q) => (typeof x === 'number' && [0, 4, 8, 16, 32].includes(x) ? x : fail(q, 'must be one of 0, 4, 8, 16, 32')) } },
  trance_gate: { rules: { pattern: choice(['classic', 'offbeat', 'choppy']) } },
  wobble: { rules: { rate: whole(1, 8), depth: span(0, 1) } },
  tremolo: { rules: { rate: (x, q) => (typeof x === 'number' && [4, 8, 12].includes(x) ? x : fail(q, 'must be one of 4, 8, 12')) } },
  auto_pan: { rules: { speed: choice(['bar', 'half_bar', 'beat']) } },
  bitcrusher: { rules: { crunch: span(0.1, 1) } },
  ring_mod: { rules: { tone: span(60, 1500) } },
  phaser: { rules: { speed: choice(FX_CHOICES.speed3) } },
  flanger: { rules: { speed: choice(['slow', 'jet', 'fast']) } },
  auto_wah: { rules: { sensitivity: span(0, 1) } },
  rotary: { rules: { speed: choice(['slow', 'fast']) } },
  echo_out: { rules: { time: choice(['dotted_eighth', 'quarter', 'half']) } },
  ping_pong: { rules: { time: choice(['eighth', 'dotted_eighth', 'quarter']) } },
  reverse: { rules: { length: choice(['beat', 'two_beats', 'bar']) } },
  reverse_reverb: { rules: { swell: choice(['short', 'long']) } },
  granular_freeze: { rules: { mode: choice(['freeze', 'stretch']) } },
  wide_8d: { rules: { circle: choice(['four_bars', 'two_bars', 'bar']) } },
  doppler: { rules: {} },
  filter: { rules: { cutoff: span(0, 1), resonance: span(0, 1) } },
  pitch_shift: { rules: { semitones: span(-12, 12), formant: span(-12, 12) } },
  harmonizer: { rules: { voices: harmonyVoices, mix: span(0, 1) } },
  vocoder: { rules: { carrier: (x, q) => id(x, q), bands: whole(8, 32) }, needed: ['carrier'] },
  autotune: { rules: { strength: span(0, 1), retune_ms: span(0, 400) } },
  crossfader: { rules: { a: laneList, b: laneList }, needed: ['a', 'b'] },
  hot_cue: { rules: { cue_bar: (x, q) => inRange(x, q, 1, 100000) }, needed: ['cue_bar'] },
  looper: {
    rules: {
      bars: (x, q) => {
        const bs = arr(x, q, 1).map((y, j) => int(y, `${q}[${j}]`, 1));
        if (bs.length > 4) fail(q, 'must be 1 to 4 bars');
        return bs;
      },
      mute_deck: bool,
    },
    needed: ['bars'],
  },
};

/** A bar position rounded to 1/1000 of a bar. */
const barPos = (x: number): number => Math.round(x * 1000) / 1000;

/** DJ & Effects' clips: each over bars inside the piece, on a lane or the whole piece, with its own settings and moves. */
function fxClipsOf(v: unknown, bars: number, laneIds: ReadonlySet<string>): FxClip[] {
  const list = arr(v, 'fx_clips');
  if (list.length > MAX_FX_CLIPS) fail('fx_clips', `must have at most ${MAX_FX_CLIPS} clips`);
  return list.map((c, i): FxClip => {
    const p = `fx_clips[${i}]`;
    const o = obj(c, p);
    for (const k of Object.keys(o)) if (!['effect', 'lane', 'from_bar', 'to_bar', 'settings', 'points'].includes(k)) fail(`${p}.${k}`, 'is not part of an effect clip (effect, lane, from_bar, to_bar, settings, points)');
    const effect = oneOf(o['effect'], `${p}.effect`, FX_CLIP_EFFECTS);
    const lane = o['lane'] === null ? null : typeof o['lane'] === 'string' && laneIds.has(o['lane']) ? o['lane'] : fail(`${p}.lane`, 'must be a lane id or null');
    if (lane !== null && WHOLE_PIECE_EFFECTS.includes(effect)) fail(`${p}.lane`, `${effect} works on the whole piece: lane must be null`);
    const from = inRange(o['from_bar'], `${p}.from_bar`, 1, bars + 1);
    const to = inRange(o['to_bar'], `${p}.to_bar`, 1, bars + 1);
    if (barPos(from) !== from) fail(`${p}.from_bar`, 'must be a bar position to 1/1000 of a bar');
    if (barPos(to) !== to) fail(`${p}.to_bar`, 'must be a bar position to 1/1000 of a bar');
    if (to - from < MIN_CLIP_BARS - 1e-9) fail(`${p}.to_bar`, 'must be at least 1/64 of a bar after from_bar');
    const clip: FxClip = { effect, lane, from_bar: from, to_bar: to };
    const spec = FX_CLIP_RULES[effect];
    if (o['settings'] !== undefined) clip.settings = settings<Record<string, unknown>>(o['settings'], `${p}.settings`, spec.rules);
    for (const k of spec.needed ?? []) if (clip.settings?.[k] === undefined) fail(`${p}.settings.${k}`, `is needed for ${effect}`);
    const st = clip.settings ?? {};
    if (effect === 'vocoder' && (st['carrier'] === lane || !laneIds.has(st['carrier'] as string))) fail(`${p}.settings.carrier`, 'must be the id of another lane');
    if (effect === 'crossfader') {
      const a = st['a'] as string[];
      const b = st['b'] as string[];
      [...a, ...b].forEach(x => { if (!laneIds.has(x)) fail(`${p}.settings.${a.includes(x) ? 'a' : 'b'}`, 'must name lanes of the piece'); });
      if (a.some(x => b.includes(x))) fail(`${p}.settings.b`, 'must not share a lane with a');
    }
    if (effect === 'hot_cue' && (st['cue_bar'] as number) >= bars + 1) fail(`${p}.settings.cue_bar`, `must be before the end (bar ${bars + 1})`);
    if (effect === 'looper') (st['bars'] as number[]).forEach((b, j) => { if (b > bars) fail(`${p}.settings.bars[${j}]`, `must be a bar of the piece (1 to ${bars})`); });
    if (o['points'] !== undefined) {
      const shape = FX_POINT_VALUES[effect] ?? fail(`${p}.points`, `${effect} records no moves`);
      const pts = arr(o['points'], `${p}.points`, 2);
      if (pts.length > MAX_FX_POINTS) fail(`${p}.points`, `must have at most ${MAX_FX_POINTS} points`);
      clip.points = pts.map((pt, j): number[] => {
        const q = `${p}.points[${j}]`;
        if (!Array.isArray(pt) || pt.length !== shape.n + 1) return fail(q, `must be [bar, ${shape.n === 1 ? 'value' : 'x, y'}]`);
        const b = inRange(pt[0], `${q}[0]`, from, to);
        return [b, ...pt.slice(1).map((x, k) => inRange(x, `${q}[${k + 1}]`, shape.min, shape.max))];
      });
      clip.points.forEach((pt, j) => { if (j > 0 && pt[0]! < clip.points![j - 1]![0]!) fail(`${p}.points[${j}][0]`, 'bars must not go back'); });
    }
    return clip;
  });
}

/** A Vocal Track: 1 to 32 takes the studio holds, and up to 64 clips of them, each inside its take and the piece. */
function vocalOf(v: unknown, path: string, duration: number): VocalTrack {
  const o = obj(v, path);
  for (const k of Object.keys(o)) if (k !== 'takes' && k !== 'clips') fail(`${path}.${k}`, 'is not part of a vocal track (takes, clips)');
  const takes = arr(o['takes'], `${path}.takes`, 1).map((t, i): VocalTake => {
    const p = `${path}.takes[${i}]`;
    const to = obj(t, p);
    const file = typeof to['file'] === 'string' && TAKE_RE.test(to['file']) ? to['file'] : fail(`${p}.file`, 'must be a saved take, vocal-<sha256>.flac, .ogg or .webm');
    return { file, seconds: inRange(to['seconds'], `${p}.seconds`, 0.01, MAX_TAKE_SECONDS) };
  });
  if (takes.length > MAX_TAKES) fail(`${path}.takes`, `must have at most ${MAX_TAKES} takes`);
  if (new Set(takes.map(t => t.file)).size !== takes.length) fail(`${path}.takes`, 'must name each take once');
  const clips = arr(o['clips'], `${path}.clips`).map((c, i): VocalClip => {
    const p = `${path}.clips[${i}]`;
    const co = obj(c, p);
    const take = takes.find(t => t.file === co['take']) ?? fail(`${p}.take`, 'must be one of the track\'s takes');
    const clip: VocalClip = {
      take: take.file, at: inRange(co['at'], `${p}.at`, 0, duration), from: inRange(co['from'], `${p}.from`, 0, take.seconds),
      to: inRange(co['to'], `${p}.to`, 0, take.seconds), gain_db: inRange(co['gain_db'], `${p}.gain_db`, -24, 12),
      fade_in: inRange(co['fade_in'], `${p}.fade_in`, 0, 10), fade_out: inRange(co['fade_out'], `${p}.fade_out`, 0, 10),
    };
    if (clip.to - clip.from < 0.01) fail(`${p}.to`, 'must be after from');
    if (clip.at + clip.to - clip.from > duration + EPS) fail(p, `must end by the end of the piece (${duration} seconds)`);
    if (clip.fade_in + clip.fade_out > clip.to - clip.from + EPS) fail(p, 'its fades must fit in the clip');
    return clip;
  });
  if (clips.length > MAX_CLIPS) fail(`${path}.clips`, `must have at most ${MAX_CLIPS} clips`);
  return { takes, clips };
}

function inRange(v: unknown, path: string, min: number, max: number): number {
  const n = num(v, path);
  return n >= min && n <= max ? n : fail(path, `must be from ${min} to ${max}`);
}

function soundOf(v: unknown, path: string, instruments: ReadonlySet<string> | undefined): Sound {
  const o = obj(v, path);
  const instrument = id(o['instrument'], `${path}.instrument`);
  if (instruments && instrument !== VOCAL_INSTRUMENT && !instruments.has(instrument)) fail(`${path}.instrument`, 'must be an instrument id in the sample library');
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
