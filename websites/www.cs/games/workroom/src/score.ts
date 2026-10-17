// The score.json model, schema 1: what a draft's score file holds, and the
// validator that every rule of the schema table goes through. DOM-free.
import { term } from './glossary.ts';

export const SCHEMA = 1;
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
export interface Lane { id: string; name: string; family: Family; icon: Family; color: string }
/** A character belongs to the score: the page has none built in. */
export interface Character { id: string; name: string; color: string }
export interface MotifSpan { lane: string; from: number; to: number }
/** `character` is the id of an entry of the score's characters; the motif is drawn in that character's colour. */
export interface Motif { id: string; character: string; spans: MotifSpan[] }
export interface ScoreNote { lane: string; start: number; length: number; pitch: number; velocity: number; motif: string | null }
export interface GlossaryUse { term: string; from: number; to: number }
export interface AudioSource { file: 'audio.webm' | 'audio.m4a'; type: string }
export interface Spectrogram { file: 'spectrogram.png'; low_hz: number; high_hz: number; scale: 'log' | 'linear' }
/** A music change names bars (from_bar, to_bar); a sound change names seconds (from, to). */
export interface Change { from_bar?: number; to_bar?: number; from?: number; to?: number; lane: string | null; text: string; answers: string[] }
export interface Score {
  schema: 1; kind: Kind; project: Project; piece: { id: string; title: string }; draft: number; made: string; duration: number;
  bars?: number; tempo?: Tempo[];                          // music only; absent for sound
  sections: Section[]; lanes: Lane[]; characters: Character[]; motifs: Motif[]; notes: ScoreNote[];
  energy: [number, number][]; glossary: GlossaryUse[]; audio: AudioSource[]; spectrogram: Spectrogram;
  musicxml?: 'score.musicxml';                             // required for music, optional for sound
  changes: Change[];
}
export type Parsed = { ok: true; score: Score } | { ok: false; error: string };

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

/** Validates every rule in the plan's schema table; the first broken rule is the error, naming its path (e.g. "sections[1].from_bar"). */
export function parseScore(raw: unknown): Parsed {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return { ok: false, error: 'score: must be an object' };
  const schema = (raw as Obj)['schema'];
  if (schema !== SCHEMA) return { ok: false, error: unknownSchemaMessage(schema) };
  try {
    return { ok: true, score: build(raw as Obj) };
  } catch (e) {
    if (e instanceof Fail) return { ok: false, error: e.message };
    throw e;
  }
}

function build(r: Obj): Score {
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
  } else {
    absent(r, 'bars', '', 'a sound piece has no bars');
    absent(r, 'tempo', '', 'a sound piece has no tempo');
  }

  const sections = sectionsOf(r['sections'], music, bars, duration);
  const lanes = arr(r['lanes'], 'lanes', 1).map((l, i): Lane => {
    const p = `lanes[${i}]`;
    const o = obj(l, p);
    return { id: id(o['id'], `${p}.id`), name: text(o['name'], `${p}.name`, 60), family: oneOf(o['family'], `${p}.family`, FAMILIES), icon: oneOf(o['icon'], `${p}.icon`, FAMILIES), color: color(o['color'], `${p}.color`) };
  });
  uniqueIds(lanes, 'lanes');
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
    return { lane, start, length, pitch, velocity, motif };
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

  const audio = arr(r['audio'], 'audio', 1).map((a, i): AudioSource => {
    const p = `audio[${i}]`;
    const o = obj(a, p);
    const file = oneOf(o['file'], `${p}.file`, ['audio.webm', 'audio.m4a']);
    if (o['type'] !== AUDIO_TYPES[file]) fail(`${p}.type`, `must be ${AUDIO_TYPES[file]} for ${file}`);
    return { file, type: AUDIO_TYPES[file]! };
  });

  const so = obj(r['spectrogram'], 'spectrogram');
  const low_hz = num(so['low_hz'], 'spectrogram.low_hz');
  const high_hz = num(so['high_hz'], 'spectrogram.high_hz');
  if (!(low_hz > 0)) fail('spectrogram.low_hz', 'must be above 0');
  if (!(high_hz > low_hz)) fail('spectrogram.high_hz', 'must be above low_hz');
  const spectrogram: Spectrogram = { file: so['file'] === 'spectrogram.png' ? 'spectrogram.png' : fail('spectrogram.file', 'must be spectrogram.png'), low_hz, high_hz, scale: oneOf(so['scale'], 'spectrogram.scale', ['log', 'linear']) };

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

  const score: Score = { schema: 1, kind, project, piece, draft, made, duration, sections, lanes, characters, motifs, notes, energy, glossary, audio, spectrogram, changes };
  if (bars !== undefined) score.bars = bars;
  if (tempo !== undefined) score.tempo = tempo;
  if (musicxml !== undefined) score.musicxml = musicxml;
  return score;
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
