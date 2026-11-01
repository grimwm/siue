// Import Music File: read another program's MusicXML (.musicxml, .xml, .mxl) or MIDI (.mid, .midi) in the page, within
// its limits, match each part to the nearest instrument in the catalogue, show the preview's facts, and only on the
// person's say-so put the parts into the piece (Add As New Parts, at the piece's own speed) or make a new piece of
// them (Start A New Piece, at the file's speed). Notes outside an instrument's range come in coloured, never moved.
// DOM-free.
import type { Entry } from '../catalogue.ts';
import type { Tempo } from '../score.ts';
import { quarterClock } from './beats.ts';
import { newDoc } from './doc.ts';
import type { EditDoc, EditNote, Part } from './doc.ts';
import { addPart, MAX_PARTS, renamePart } from './edit.ts';
import { readMusicXml } from './fromxml.ts';
import type { XmlDocument } from './fromxml.ts';
import { readMidi } from './midi.ts';
import { ImportError } from './music-file.ts';
import type { ReadMusic, ReadNote } from './music-file.ts';
import type { Inflate } from './mxl.ts';
import { unzipMusicXml } from './mxl.ts';

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_NOTES = 20_000;
export const MAX_SECONDS = 5;
export const ACCEPT = '.musicxml,.xml,.mxl,.mid,.midi';

export interface ImportPorts {
  parseXml(text: string): XmlDocument;
  inflate: Inflate;
  /** Milliseconds, from any steady clock. */
  now(): number;
}

/** The General MIDI program names, program 1 first. */
export const GM_NAMES: readonly string[] = [
  'Acoustic Grand Piano', 'Bright Acoustic Piano', 'Electric Grand Piano', 'Honky-tonk Piano', 'Electric Piano 1', 'Electric Piano 2', 'Harpsichord', 'Clavinet',
  'Celesta', 'Glockenspiel', 'Music Box', 'Vibraphone', 'Marimba', 'Xylophone', 'Tubular Bells', 'Dulcimer',
  'Drawbar Organ', 'Percussive Organ', 'Rock Organ', 'Church Organ', 'Reed Organ', 'Accordion', 'Harmonica', 'Tango Accordion',
  'Acoustic Guitar (nylon)', 'Acoustic Guitar (steel)', 'Electric Guitar (jazz)', 'Electric Guitar (clean)', 'Electric Guitar (muted)', 'Overdriven Guitar', 'Distortion Guitar', 'Guitar Harmonics',
  'Acoustic Bass', 'Electric Bass (finger)', 'Electric Bass (pick)', 'Fretless Bass', 'Slap Bass 1', 'Slap Bass 2', 'Synth Bass 1', 'Synth Bass 2',
  'Violin', 'Viola', 'Cello', 'Contrabass', 'Tremolo Strings', 'Pizzicato Strings', 'Orchestral Harp', 'Timpani',
  'String Ensemble 1', 'String Ensemble 2', 'Synth Strings 1', 'Synth Strings 2', 'Choir Aahs', 'Voice Oohs', 'Synth Voice', 'Orchestra Hit',
  'Trumpet', 'Trombone', 'Tuba', 'Muted Trumpet', 'French Horn', 'Brass Section', 'Synth Brass 1', 'Synth Brass 2',
  'Soprano Sax', 'Alto Sax', 'Tenor Sax', 'Baritone Sax', 'Oboe', 'English Horn', 'Bassoon', 'Clarinet',
  'Piccolo', 'Flute', 'Recorder', 'Pan Flute', 'Blown Bottle', 'Shakuhachi', 'Whistle', 'Ocarina',
  'Lead 1 (square)', 'Lead 2 (sawtooth)', 'Lead 3 (calliope)', 'Lead 4 (chiff)', 'Lead 5 (charang)', 'Lead 6 (voice)', 'Lead 7 (fifths)', 'Lead 8 (bass + lead)',
  'Pad 1 (new age)', 'Pad 2 (warm)', 'Pad 3 (polysynth)', 'Pad 4 (choir)', 'Pad 5 (bowed)', 'Pad 6 (metallic)', 'Pad 7 (halo)', 'Pad 8 (sweep)',
  'FX 1 (rain)', 'FX 2 (soundtrack)', 'FX 3 (crystal)', 'FX 4 (atmosphere)', 'FX 5 (brightness)', 'FX 6 (goblins)', 'FX 7 (echoes)', 'FX 8 (sci-fi)',
  'Sitar', 'Banjo', 'Shamisen', 'Koto', 'Kalimba', 'Bagpipe', 'Fiddle', 'Shanai',
  'Tinkle Bell', 'Agogo', 'Steel Drums', 'Woodblock', 'Taiko Drum', 'Melodic Tom', 'Synth Drum', 'Reverse Cymbal',
  'Guitar Fret Noise', 'Breath Noise', 'Seashore', 'Bird Tweet', 'Telephone Ring', 'Helicopter', 'Applause', 'Gunshot',
];

/** Words in a part's name, checked in order (so "English Horn" is an oboe before "horn" is a French horn). */
const NAME_WORDS: readonly [RegExp, string][] = [
  [/\bpiccolo\b/i, 'piccolo'], [/\bflute|\bfl\.|recorder|ocarina|whistle/i, 'flute'], [/english horn|cor anglais|\boboe/i, 'oboe'],
  [/\bsax/i, 'clarinet'], [/clarinet|\bcl\./i, 'clarinet'], [/bassoon|fagott/i, 'bassoon'],
  [/trumpet|cornet|flugel|\btpt/i, 'trumpet'], [/trombone|\btbn/i, 'trombone'], [/\btuba|euphonium/i, 'tuba'], [/\bhorn|\bhn\.|\bcor\b/i, 'horn'],
  [/violin|\bvln|fiddle/i, 'violin'], [/viola|\bvla/i, 'viola'], [/cello|violoncell|\bvc\./i, 'cello'],
  [/contrabass|double bass|string bass|upright bass|\bcb\./i, 'bass'], [/\blyre/i, 'lyre'], [/\bharp\b/i, 'harp'], [/guitar|banjo|lute|mandolin|ukulele|sitar|koto/i, 'harp'],
  [/celest/i, 'celesta'], [/glock/i, 'glock'], [/xylo/i, 'xylo'], [/marimba/i, 'marimba'], [/vibra/i, 'vibes'], [/tubular|chimes|\bbells?\b/i, 'bells'],
  [/timpani|\btimp/i, 'timpani'], [/organ|harmonium|accordion/i, 'organ'], [/piano|\bpno|keyboard|keys|harpsichord|clavi/i, 'piano'],
  [/choir|chorus|voice|vocal|soprano|\balto\b|tenor|baritone|aahs|oohs/i, 'choir'], [/\bbass\b/i, 'bass'],
];

/** The catalogue instrument for each General MIDI program, by program (1–128). */
function byProgram(program: number): string {
  const exact: Readonly<Record<number, string>> = {
    9: 'celesta', 10: 'glock', 12: 'vibes', 13: 'marimba', 14: 'xylo', 15: 'bells', 41: 'violin', 42: 'viola', 43: 'cello', 44: 'bass', 45: 'violin',
    46: 'violin', 47: 'harp', 48: 'timpani', 53: 'choir', 54: 'choir', 55: 'choir', 57: 'trumpet', 58: 'trombone', 59: 'tuba', 60: 'trumpet', 61: 'horn',
    69: 'oboe', 70: 'oboe', 71: 'bassoon', 72: 'clarinet', 73: 'piccolo', 74: 'flute', 109: 'marimba', 110: 'oboe', 111: 'violin', 112: 'oboe',
    113: 'glock', 115: 'marimba', 117: 'timpani', 118: 'timpani', 119: 'timpani',
  };
  if (exact[program]) return exact[program]!;
  const family = ['piano', 'vibes', 'organ', 'harp', 'bass', 'violin', 'violin', 'trumpet', 'clarinet', 'flute', 'flute', 'organ', 'organ', 'harp', 'timpani', 'piano'];
  return family[Math.floor((program - 1) / 8)] ?? 'piano';
}

/** The nearest catalogue instrument for a part: a drum part to a kit (or orchestral percussion), else by its name, then its program, else Piano. */
export function matchInstrument(part: { name: string; program: number | null; drums: boolean; notes: readonly ReadNote[] }, entries: readonly Entry[]): string {
  const has = (id: string): boolean => entries.some(e => e.id === id);
  if (part.drums) {
    const orch = entries.find(e => e.id === 'orch');
    if (orch?.pieces && part.notes.length > 0 && part.notes.every(n => orch.pieces!.some(([p]) => p === n.pitch))) return 'orch';
    return has('kit') ? 'kit' : 'piano';
  }
  for (const [re, id] of NAME_WORDS) if (re.test(part.name) && has(id)) return id;
  if (part.program !== null) { const id = byProgram(part.program); if (has(id)) return id; }
  return 'piano';
}

const decodeText = (bytes: Uint8Array): string => {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes.subarray(2));
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes.subarray(2));
  return new TextDecoder().decode(bytes);
};
const mb = (n: number): string => `${Math.round((n / 1024 / 1024) * 10) / 10} MB`;

/** Reads a music file by what it holds (MIDI starts "MThd", an .mxl "PK", anything else is read as MusicXML), within the limits. */
export async function readMusicFile(name: string, bytes: Uint8Array, ports: ImportPorts): Promise<ReadMusic> {
  if (bytes.length > MAX_FILE_BYTES) throw new ImportError(`${name} is ${mb(bytes.length)}; the workroom reads music files of up to 10 MB.`);
  const began = ports.now();
  const check = (): void => {
    if (ports.now() - began > MAX_SECONDS * 1000) throw new ImportError(`Reading ${name} took more than ${MAX_SECONDS} seconds, so the workroom stopped. A score that large is more than a piece can hold.`);
  };
  const head = String.fromCharCode(...bytes.subarray(0, 4));
  let read: ReadMusic;
  if (head === 'MThd') read = readMidi(bytes, check);
  else if (head === 'PK\x03\x04') read = readMusicXml(await unzipMusicXml(bytes, ports.inflate), ports.parseXml, check);
  else read = readMusicXml(decodeText(bytes), ports.parseXml, check);
  check();
  const parts = read.parts.filter(p => p.notes.length > 0);
  const notes = parts.reduce((s, p) => s + p.notes.length, 0);
  if (notes === 0) throw new ImportError(`${name} has no notes in it.`);
  if (parts.length > MAX_PARTS) throw new ImportError(`${name} has ${parts.length} parts with notes; a piece holds at most ${MAX_PARTS}.`);
  if (notes > MAX_NOTES) throw new ImportError(`${name} has ${notes.toLocaleString('en-US')} notes; a piece holds at most ${MAX_NOTES.toLocaleString('en-US')}.`);
  return { ...read, parts };
}

export interface PreviewPart { name: string; from: string; match: string; drums: boolean; notes: readonly ReadNote[] }
export interface ImportPreview {
  file: string; type: 'MusicXML' | 'MIDI'; app: string; bpm: number; tempoWord: string; time: string; key: string; bars: number;
  parts: PreviewPart[]; lost: string[]; tempo: Tempo[]; title: string | null;
}

const MAJOR_KEYS = ['C♭', 'G♭', 'D♭', 'A♭', 'E♭', 'B♭', 'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'C♯'];
const MINOR_KEYS = ['A♭', 'E♭', 'B♭', 'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F♯', 'C♯', 'G♯', 'D♯', 'A♯'];

/** A speed in words: Slow, Walking, Quick. */
export const tempoWord = (bpm: number): string => (bpm < 76 ? 'Slow' : bpm < 108 ? 'Walking' : 'Quick');

/** How many bars the music fills under its tempo map. */
function barsOf(tempo: readonly Tempo[], endQuarters: number): number {
  let bar = 1;
  let q = 0;
  for (;;) {
    const t = [...tempo].reverse().find(x => x.bar <= bar) ?? tempo[0]!;
    q += (t.beats * 4) / t.unit;
    if (q >= endQuarters - 1e-6 || bar >= 10_000) return bar;
    bar++;
  }
}

export function previewOf(read: ReadMusic, file: string, entries: readonly Entry[]): ImportPreview {
  const first = read.tempo[0]!;
  const end = Math.max(0, ...read.parts.flatMap(p => p.notes.map(n => n.start + n.length)));
  const key = read.fifths === null || read.fifths < -7 || read.fifths > 7 ? 'Not In The File'
    : `${(read.mode === 'minor' ? MINOR_KEYS : MAJOR_KEYS)[read.fifths + 7]} ${read.mode === 'minor' ? 'Minor' : 'Major'}`;
  return {
    file, type: read.format, app: read.app ?? (read.format === 'MIDI' ? 'a MIDI program' : 'a notation program'),
    bpm: first.bpm, tempoWord: tempoWord(first.bpm), time: `${first.beats}/${first.unit}`, key, bars: barsOf(read.tempo, end),
    parts: read.parts.map(p => ({
      name: p.name, drums: p.drums, notes: p.notes, match: matchInstrument(p, entries),
      from: p.drums ? 'Channel 10' : p.program !== null ? `GM ${p.program} ${GM_NAMES[p.program - 1] ?? ''}`.trim() : 'No Sound Named',
    })),
    lost: read.lost, tempo: read.tempo, title: read.title,
  };
}

/** The preview's parts added to the piece, each playing the instrument chosen for it, at the piece's own speed. */
export function addAsNewParts(doc: EditDoc, preview: ImportPreview, choice: readonly string[], entries: readonly Entry[]): EditDoc {
  if (doc.parts.length + preview.parts.length > MAX_PARTS) {
    throw new ImportError(`The piece has ${doc.parts.length} parts and the file ${preview.parts.length} parts; a piece holds at most ${MAX_PARTS}. Remove some parts first, or Start A New Piece.`);
  }
  const clock = quarterClock(doc.tempo);
  let next = doc;
  preview.parts.forEach((p, i) => {
    const entry = entries.find(e => e.id === choice[i]) ?? entries.find(e => e.id === p.match) ?? entries.find(e => e.id === 'piano')!;
    const made = addPart(next, entry)!;
    next = renamePart(made.doc, made.id, p.name);
    let id = next.nextId;
    const notes = p.notes.map((n): EditNote => {
      const start = clock.beat(n.start);
      return { id: id++, start: round(start), length: round(clock.beat(n.start + n.length) - start), pitch: n.pitch, velocity: n.velocity, motif: null };
    });
    next = { ...next, nextId: id, parts: next.parts.map((x): Part => (x.id === made.id ? { ...x, notes } : x)) };
  });
  return next;
}
const round = (x: number): number => Math.round(x * 1e6) / 1e6;

/** A new piece of the preview's parts, at the file's own speed and time signatures. */
export function newDocFrom(preview: ImportPreview, choice: readonly string[], entries: readonly Entry[], title: string): EditDoc {
  const doc: EditDoc = { ...newDoc(title), tempo: preview.tempo.map(t => ({ ...t })), bars: preview.bars };
  return addAsNewParts(doc, preview, choice, entries);
}
