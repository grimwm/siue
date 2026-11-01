// The editor's document engraved as MusicXML 4.0 (score-partwise): what the Sheet Music view draws, what Export MusicXML
// saves, and the sheet a piece page shows for a draft that stores none. Each staff is written as chords: at every
// start and end in a bar the notes sounding are one chord, notes carrying on are tied, and rests fill the gaps, so any
// overlap of notes can be written and every bar adds up. Notes land on a grid of 24 divisions to the quarter. Parts
// are written as their players read them (written = sounding + the instrument's `written`) with a <transpose> that
// says how they sound, unless `concert`. The key is the major key that holds the most notes. DOM-free.
import { rangeClass } from '../catalogue.ts';
import type { Clef, Entry } from '../catalogue.ts';
import { beatClock, quarterClock } from './beats.ts';
import { channels, DRUM_CHANNEL } from './channels.ts';
import { barsNeeded } from './doc.ts';
import type { EditDoc, Part } from './doc.ts';

/** Divisions of a quarter note: fine enough for sixteenth triplets and thirty-seconds. */
export const DIVISIONS = 24;
export const AMBER = '#D08A00';
export const RED = '#C4372C';

export interface XmlOptions {
  /** Only these parts, in the document's order. */
  parts?: readonly string[];
  /** Write how every part sounds, with no transposition. */
  concert?: boolean;
  /** Colour expert-only notes amber and out-of-range notes red (default true). */
  colours?: boolean;
}

/** Note values in divisions, largest first: [divisions, type, dotted]. */
const VALUES: readonly [number, string, boolean][] = [
  [96, 'whole', false], [72, 'half', true], [48, 'half', false], [36, 'quarter', true], [24, 'quarter', false],
  [18, 'eighth', true], [12, 'eighth', false], [9, '16th', true], [6, '16th', false], [3, '32nd', false],
];
const BEAT_UNIT: Readonly<Record<number, string>> = { 1: 'whole', 2: 'half', 4: 'quarter', 8: 'eighth', 16: '16th' };
const SHARPS: readonly [string, number][] = [['C', 0], ['C', 1], ['D', 0], ['D', 1], ['E', 0], ['F', 0], ['F', 1], ['G', 0], ['G', 1], ['A', 0], ['A', 1], ['B', 0]];
const FLATS: readonly [string, number][] = [['C', 0], ['D', -1], ['D', 0], ['E', -1], ['E', 0], ['F', 0], ['G', -1], ['G', 0], ['A', -1], ['A', 0], ['B', -1], ['B', 0]];
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
/** Diatonic steps of an interval of n semitones. */
const DIATONIC = [0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6];
const CLEF_SIGNS: Readonly<Record<Exclude<Clef, 'grand'>, [string, number]>> = { treble: ['G', 2], alto: ['C', 3], bass: ['F', 4], percussion: ['percussion', 2] };

/** Where each General MIDI drum sits on the percussion staff, and its notehead. */
export const DRUM_DISPLAY: Readonly<Record<number, [string, number, string]>> = {
  35: ['E', 4, 'normal'], 36: ['F', 4, 'normal'], 38: ['C', 5, 'normal'], 40: ['C', 5, 'normal'], 41: ['G', 4, 'normal'], 43: ['G', 4, 'normal'],
  45: ['A', 4, 'normal'], 47: ['B', 4, 'normal'], 48: ['D', 5, 'normal'], 50: ['E', 5, 'normal'],
  42: ['G', 5, 'x'], 44: ['D', 4, 'x'], 46: ['G', 5, 'circle-x'], 49: ['A', 5, 'x'], 51: ['F', 5, 'x'], 52: ['A', 5, 'x'], 53: ['F', 5, 'diamond'],
  54: ['E', 5, 'x'], 55: ['A', 5, 'x'], 56: ['F', 5, 'triangle'], 57: ['B', 5, 'x'], 59: ['F', 5, 'x'], 81: ['A', 5, 'triangle'],
};
const OTHER_DRUM: [string, number, string] = ['B', 4, 'x'];

const esc = (t: string): string => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const mod12 = (n: number): number => ((n % 12) + 12) % 12;

/** The major key (fifths, −6 to 6) whose scale holds the most of these notes; ties go to fewer sharps or flats. */
export function inferFifths(pitches: readonly number[]): number {
  if (pitches.length === 0) return 0;
  const count = new Array<number>(12).fill(0);
  for (const p of pitches) count[mod12(p)]!++;
  let best = 0;
  let bestHeld = -1;
  for (const f of [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6]) {
    const tonic = mod12(f * 7);
    const held = MAJOR.reduce((s, d) => s + count[mod12(tonic + d)]!, 0);
    if (held > bestHeld) { best = f; bestHeld = held; }
  }
  return best;
}

/** The key change a transposition of `semitones` makes: +2 adds two sharps, +7 one. */
export function transposeFifths(semitones: number): number {
  const f = mod12(mod12(semitones) * 7);
  return f > 6 ? f - 12 : f;
}
const keyIn = (f: number): number => (f > 6 ? f - 12 : f < -6 ? f + 12 : f);

/** MusicXML's <transpose> for a part written `written` semitones from how it sounds: the interval from written to sounding. */
function transposeXml(written: number): string {
  const r = -written;
  const octaves = Math.trunc(r / 12);
  const rest = r - 12 * octaves;
  const diatonic = Math.sign(rest) * DIATONIC[Math.abs(rest)]!;
  return `<transpose><diatonic>${diatonic}</diatonic><chromatic>${rest}</chromatic>${octaves !== 0 ? `<octave-change>${octaves}</octave-change>` : ''}</transpose>`;
}

function pitchXml(midi: number, sharps: boolean): string {
  const [step, alter] = (sharps ? SHARPS : FLATS)[mod12(midi)]!;
  // Spelled from a black key's lower or upper white key; the octave follows the written step.
  return `<pitch><step>${step}</step>${alter !== 0 ? `<alter>${alter}</alter>` : ''}<octave>${Math.floor(midi / 12) - 1}</octave></pitch>`;
}

/** A length in divisions as note values, largest first; what no value fits (under a thirty-second) is added to the last. */
function split(d: number): { dur: number; type: string; dot: boolean }[] {
  const out: { dur: number; type: string; dot: boolean }[] = [];
  let rest = d;
  for (const [v, type, dot] of VALUES) while (rest >= v) { out.push({ dur: v, type, dot }); rest -= v; }
  if (rest > 0) {
    const last = out[out.length - 1];
    if (last) last.dur += rest;
    else out.push({ dur: rest, type: '32nd', dot: false });
  }
  return out;
}

const FALLBACK: Entry = {
  id: 'piano', name: 'Piano', category: 'keys', range: null, expert: null, home: 60, clef: 'treble', written: 0, gm: 1, gmName: 'Piano',
  pieces: null, standin: null, standinNote: null, icon: 'keys', attack: 0.01, release: 0.3,
};

interface Item { start: number; end: number; key: number; staff: number; colour: string | null }

/** The document as a MusicXML score-partwise document. Throws when it has no parts (a score needs at least one). */
export function toMusicXml(doc: EditDoc, entries: readonly Entry[], opts: XmlOptions = {}): string {
  const parts = opts.parts ? doc.parts.filter(p => opts.parts!.includes(p.id)) : doc.parts;
  if (parts.length === 0) throw new Error('The piece has no parts to write.');
  const concert = opts.concert === true;
  const colours = opts.colours !== false;
  const clock = beatClock(doc.tempo);
  const bars = barsNeeded(doc);
  const entryOf = (p: Part): Entry => entries.find(e => e.id === p.instrument) ?? FALLBACK;
  const chan = channels(doc, entries);

  // Each bar's start in divisions; one past the last, for notes ending on the final bar line.
  const q = quarterClock(doc.tempo);
  const barStart: number[] = [0];
  for (let b = 1; b <= bars + 1; b++) barStart[b] = Math.round(q.quarters(clock.barStartBeat(b)) * DIVISIONS);
  const at = (beat: number): number => Math.round(q.quarters(beat) * DIVISIONS);

  const concertFifths = inferFifths(doc.parts.filter(p => !entryOf(p).pieces).flatMap(p => p.notes.map(n => n.pitch)));
  const out: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">',
    '<score-partwise version="4.0">',
    `<work><work-title>${esc(doc.title)}</work-title></work>`,
    `<movement-title>${esc(doc.title)}</movement-title>`,
    '<identification><encoding><software>SIUE Music Workroom</software></encoding></identification>',
    '<part-list>',
  ];
  for (const p of parts) {
    const e = entryOf(p);
    const ch = (chan.get(p.id) ?? 0) + 1;
    out.push(`<score-part id="${esc(p.id)}">`, `<part-name>${esc(p.name)}</part-name>`);
    if (e.pieces) {
      const keys = [...new Set([...e.pieces.map(([n]) => n), ...p.notes.map(n => n.pitch)])];
      for (const k of keys) out.push(`<score-instrument id="${esc(p.id)}-I${k + 1}">`, `<instrument-name>${esc(e.pieces.find(([n]) => n === k)?.[1] ?? `Drum ${k}`)}</instrument-name>`, '</score-instrument>');
      for (const k of keys) out.push(`<midi-instrument id="${esc(p.id)}-I${k + 1}"><midi-channel>${DRUM_CHANNEL + 1}</midi-channel><midi-program>${e.gm}</midi-program><midi-unpitched>${k + 1}</midi-unpitched></midi-instrument>`);
    } else {
      out.push(`<score-instrument id="${esc(p.id)}-I1">`, `<instrument-name>${esc(e.gmName)}</instrument-name>`, '</score-instrument>',
        `<midi-instrument id="${esc(p.id)}-I1"><midi-channel>${ch}</midi-channel><midi-program>${e.gm}</midi-program></midi-instrument>`);
    }
    out.push('</score-part>');
  }
  out.push('</part-list>');

  parts.forEach((p, partIndex) => {
    const e = entryOf(p);
    const drums = e.pieces !== null;
    const written = concert || drums ? 0 : e.written;
    const fifths = drums ? 0 : keyIn(concertFifths + transposeFifths(written));
    const sharps = fifths >= 0;
    const staves = e.clef === 'grand' ? 2 : 1;
    const items: Item[] = p.notes.map(n => {
      const start = at(n.start);
      const key = drums ? n.pitch : n.pitch + written;
      const cls = rangeClass(e, n.pitch);
      return {
        start, end: Math.max(start + 1, at(n.start + n.length)), key, staff: staves === 2 && key < 60 ? 2 : 1,
        colour: !colours || e === FALLBACK ? null : cls === 'out' ? RED : cls === 'expert' ? AMBER : null,
      };
    });
    out.push(`<part id="${esc(p.id)}">`);
    for (let bar = 1; bar <= bars; bar++) {
      const t = clock.tempoAt(bar);
      const prev = bar > 1 ? clock.tempoAt(bar - 1) : null;
      const b0 = barStart[bar]!;
      const b1 = barStart[bar + 1]!;
      out.push(`<measure number="${bar}">`);
      const timeXml = `<time><beats>${t.beats}</beats><beat-type>${t.unit}</beat-type></time>`;
      if (bar === 1) {
        const clefs = staves === 2
          ? '<clef number="1"><sign>G</sign><line>2</line></clef><clef number="2"><sign>F</sign><line>4</line></clef>'
          : `<clef><sign>${CLEF_SIGNS[e.clef as Exclude<Clef, 'grand'>][0]}</sign><line>${CLEF_SIGNS[e.clef as Exclude<Clef, 'grand'>][1]}</line></clef>`;
        out.push(`<attributes><divisions>${DIVISIONS}</divisions><key><fifths>${fifths}</fifths><mode>major</mode></key>${timeXml}${staves === 2 ? '<staves>2</staves>' : ''}${clefs}${written !== 0 ? transposeXml(written) : ''}</attributes>`);
      } else if (prev && (prev.beats !== t.beats || prev.unit !== t.unit)) out.push(`<attributes>${timeXml}</attributes>`);
      const mark = doc.tempo.find(x => x.bar === bar);
      if (partIndex === 0 && mark) {
        out.push(`<direction placement="above"><direction-type><metronome><beat-unit>${BEAT_UNIT[mark.unit]}</beat-unit>`,
          `<per-minute>${Math.round(mark.bpm * 100) / 100}</per-minute></metronome></direction-type><sound tempo="${Math.round(((mark.bpm * 4) / mark.unit) * 100) / 100}"/></direction>`);
      }
      for (let staff = 1; staff <= staves; staff++) {
        if (staff > 1) out.push(`<backup><duration>${b1 - b0}</duration></backup>`);
        const voice = staff === 1 ? 1 : 5;
        const tail = `<voice>${voice}</voice>`;
        const staffXml = staves === 2 ? `<staff>${staff}</staff>` : '';
        const here = items.filter(n => n.staff === staff && n.start < b1 && n.end > b0);
        if (here.length === 0) {
          out.push(`<note><rest measure="yes"/><duration>${b1 - b0}</duration>${tail}${staffXml}</note>`);
          continue;
        }
        const cuts = [...new Set([b0, b1, ...here.flatMap(n => [n.start, n.end]).filter(x => x > b0 && x < b1)])].sort((a, b) => a - b);
        // Consecutive empty spans join into one rest.
        const spans: { x: number; y: number; notes: Item[] }[] = [];
        for (let i = 0; i + 1 < cuts.length; i++) {
          const x = cuts[i]!;
          const y = cuts[i + 1]!;
          const notes = here.filter(n => n.start <= x && n.end >= y).sort((a, b) => a.key - b.key);
          const last = spans[spans.length - 1];
          if (notes.length === 0 && last && last.notes.length === 0) last.y = y;
          else spans.push({ x, y, notes });
        }
        for (const s of spans) {
          const pieces = split(s.y - s.x);
          pieces.forEach((v, i) => {
            const shape = `<type>${v.type}</type>${v.dot ? '<dot/>' : ''}`;
            if (s.notes.length === 0) { out.push(`<note><rest/><duration>${v.dur}</duration>${tail}${shape}${staffXml}</note>`); return; }
            s.notes.forEach((n, j) => {
              const stop = n.start < s.x || i > 0;
              const start = n.end > s.y || i < pieces.length - 1;
              const ties = `${stop ? '<tie type="stop"/>' : ''}${start ? '<tie type="start"/>' : ''}`;
              const tied = stop || start ? `<notations>${stop ? '<tied type="stop"/>' : ''}${start ? '<tied type="start"/>' : ''}</notations>` : '';
              const colour = n.colour ? ` color="${n.colour}"` : '';
              let body: string;
              if (drums) {
                const [step, octave, head] = DRUM_DISPLAY[n.key] ?? OTHER_DRUM;
                body = `<unpitched><display-step>${step}</display-step><display-octave>${octave}</display-octave></unpitched><duration>${v.dur}</duration>${ties}<instrument id="${esc(p.id)}-I${n.key + 1}"/>${tail}${shape}${head !== 'normal' || n.colour ? `<notehead${colour}>${head}</notehead>` : ''}`;
              } else {
                body = `${pitchXml(n.key, sharps)}<duration>${v.dur}</duration>${ties}${tail}${shape}${n.colour ? `<notehead${colour}>normal</notehead>` : ''}`;
              }
              out.push(`<note${colour}>${j > 0 ? '<chord/>' : ''}${body}${staffXml}${tied}</note>`);
            });
          });
        }
      }
      out.push('</measure>');
    }
    out.push('</part>');
  });
  out.push('</score-partwise>', '');
  return out.join('\n');
}
