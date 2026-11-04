// Start A Song: starting points made of the library's real instruments. Just A Beat is a drum kit's rock beat; Beat +
// Bass adds a double bass through C, A minor, F and G; Full Band has eight bars of drums with a fill, the bass, piano
// chords and a marimba tune, a Verse and a Chorus, and a Riser that builds into bar 5; Empty Song has no tracks. Each
// is an ordinary document: every note can be changed, and Undo takes the whole start back. Notes are in beats (4/4, so
// a beat is a quarter note). DOM-free.
import type { Entry } from '../catalogue.ts';
import { newDoc } from './doc.ts';
import type { EditDoc } from './doc.ts';
import { addNotes, addPart } from './edit.ts';
import type { NewNote } from './edit.ts';
import { placeTarget, targetFor } from './placement.ts';
import { fitRegions } from './regions.ts';
import { sectionColor } from './sections.ts';

export type TemplateId = 'beat' | 'bass' | 'band' | 'empty';

export interface Template {
  id: TemplateId;
  name: string;
  about: string;
  /** The catalogue entries shown on the template's card, in track order. */
  pictures: string[];
}

export const TEMPLATES: readonly Template[] = [
  { id: 'beat', name: 'Just A Beat', about: 'A drum kit playing a steady rock beat for four bars.', pictures: ['kit'] },
  { id: 'bass', name: 'Beat + Bass', about: 'The beat and a double bass walking through four chords.', pictures: ['kit', 'bass'] },
  { id: 'band', name: 'Full Band', about: 'Drums, bass, piano chords and a marimba tune, with a riser that builds into bar 5.', pictures: ['kit', 'bass', 'piano', 'marimba'] },
  { id: 'empty', name: 'Empty Song', about: 'Nothing yet. Add your first instrument yourself.', pictures: [] },
];

/** Stand-ins when the library lacks an instrument: the first of each list it has. */
const CHOICES: Readonly<Record<string, readonly string[]>> = {
  kit: ['kit', 'orch'],
  bass: ['bass', 'cello', 'tuba', 'bassoon'],
  piano: ['piano', 'organ', 'harp'],
  marimba: ['marimba', 'vibes', 'xylo', 'celesta'],
};

/** The entry a template's instrument plays on: the one named, or its first stand-in the library has. */
export function templateEntry(entries: readonly Entry[], want: string): Entry | null {
  for (const id of CHOICES[want] ?? [want]) {
    const e = entries.find(x => x.id === id);
    if (e) return e;
  }
  return null;
}

const KICK = 36;
const SNARE = 38;
const HAT = 42;
const CRASH = 49;
const TOM_HI = 50;
const TOM_LO = 45;

/** The kit's own pitch for a drum, or its nearest piece when the kit lacks it. */
function drum(kit: Entry, want: number): number {
  const pieces = kit.pieces ?? [];
  if (pieces.some(([p]) => p === want)) return want;
  return pieces.reduce((best, [p]) => (Math.abs(p - want) < Math.abs(best - want) ? p : best), pieces[0]?.[0] ?? want);
}

/** Eighth notes are half a beat. */
const hit = (start: number, pitch: number, velocity: number): NewNote => ({ start, length: 0.5, pitch, velocity });

/** A rock beat over `bars` bars: kick on 1 and 3 (and the "and" of 3), snare on 2 and 4, closed hats on every eighth. */
function rockBeat(kit: Entry, bars: number, fillBar: number | null): NewNote[] {
  const out: NewNote[] = [];
  for (let b = 0; b < bars; b++) {
    const at = b * 4;
    if (fillBar !== null && b === fillBar - 1) {
      // The fill: kick and hats for two beats, then snare and toms down the kit into the next bar.
      out.push(hit(at, drum(kit, KICK), 100), hit(at, drum(kit, HAT), 70), hit(at + 1, drum(kit, SNARE), 96), hit(at + 1, drum(kit, HAT), 70));
      [[2, SNARE], [2.5, SNARE], [3, TOM_HI], [3.5, TOM_LO]].forEach(([s, p]) => out.push(hit(at + s!, drum(kit, p!), 104)));
      continue;
    }
    out.push(hit(at, drum(kit, KICK), 104), hit(at + 2, drum(kit, KICK), 100), hit(at + 2.5, drum(kit, KICK), 84));
    out.push(hit(at + 1, drum(kit, SNARE), 100), hit(at + 3, drum(kit, SNARE), 100));
    for (let e = 0; e < 8; e++) out.push(hit(at + e / 2, drum(kit, HAT), e % 2 ? 58 : 76));
    if (fillBar !== null && b === fillBar) out.push(hit(at, drum(kit, CRASH), 110));
  }
  return out;
}

/** The chords' roots in the bass: C2, A1, F1, G1. */
const BASS_ROOTS = [36, 33, 29, 31];
/** C, A minor, F and G as piano chords around middle C. */
const CHORDS = [[48, 52, 55, 60], [45, 48, 52, 57], [41, 45, 48, 53], [43, 47, 50, 55]];

/** A bass line through the four chords a bar each: the root held, again on the "and" of 2, then the fifth and the octave. */
function bassLine(bass: Entry, bars: number): NewNote[] {
  const lo = bass.range?.[0] ?? 0;
  return Array.from({ length: bars }, (_, b) => {
    let root = BASS_ROOTS[b % 4]!;
    while (root < lo) root += 12;
    const at = b * 4;
    return [
      { start: at, length: 1.5, pitch: root, velocity: 100 }, { start: at + 1.5, length: 1, pitch: root, velocity: 84 },
      { start: at + 2.5, length: 1, pitch: root + 7, velocity: 90 }, { start: at + 3.5, length: 0.5, pitch: root + 12, velocity: 80 },
    ];
  }).flat();
}

/** Held chords in the verse, two hits a bar in the chorus. */
function pianoChords(bars: number): NewNote[] {
  return Array.from({ length: bars }, (_, b) => CHORDS[b % 4]!.flatMap((p): NewNote[] => (b < 4
    ? [{ start: b * 4, length: 4, pitch: p, velocity: 64 }]
    : [{ start: b * 4, length: 1.5, pitch: p, velocity: 76 }, { start: b * 4 + 2, length: 1.5, pitch: p, velocity: 68 }]))).flat();
}

/** A tune over the chords, in [start, length, pitch] beats, played twice: in the verse, then in the chorus an octave up. */
const TUNE: readonly [number, number, number][] = [
  [0, 1, 76], [1, 1, 74], [2, 2, 72], [4, 1, 72], [5, 0.5, 74], [5.5, 0.5, 76], [6, 2, 72],
  [8, 1, 77], [9, 1, 76], [10, 2, 72], [12, 1.5, 74], [13.5, 0.5, 72], [14, 2, 71],
];
function tune(mallet: Entry): NewNote[] {
  const [lo, hi] = mallet.range ?? [0, 127];
  const fit = (p: number): number => { let q = p; while (q < lo) q += 12; while (q > hi) q -= 12; return q; };
  return [...TUNE.map(([s, l, p]) => ({ start: s, length: l, pitch: fit(p), velocity: 92 })),
    ...TUNE.map(([s, l, p]) => ({ start: s + 16, length: l, pitch: fit(p + 12), velocity: 96 }))];
}

/** Adds a part playing `want` (or its stand-in) with `notes`; the document unchanged when the library has neither. */
function withTrack(doc: EditDoc, entries: readonly Entry[], want: string, notes: (e: Entry) => NewNote[]): EditDoc {
  const e = templateEntry(entries, want);
  if (!e) return doc;
  const made = addPart(doc, e);
  if (!made) return doc;
  return addNotes(made.doc, made.id, notes(e)).doc;
}

/** The starting document of template `id`, titled `title`. */
export function templateDoc(id: TemplateId, entries: readonly Entry[], title: string): EditDoc {
  const base = newDoc(title);
  const at = (bpm: number, bars: number): EditDoc => ({ ...base, tempo: [{ bar: 1, bpm, beats: 4, unit: 4 }], bars });
  if (id === 'empty') return at(100, 4);
  if (id === 'beat' || id === 'bass') {
    let doc = withTrack(at(100, 4), entries, 'kit', kit => rockBeat(kit, 4, null));
    if (id === 'bass') doc = withTrack(doc, entries, 'bass', b => bassLine(b, 4));
    return fitRegions(doc);
  }
  let doc = withTrack(at(104, 8), entries, 'kit', kit => rockBeat(kit, 8, 4));
  doc = withTrack(doc, entries, 'bass', b => bassLine(b, 8));
  doc = withTrack(doc, entries, 'piano', () => pianoChords(8));
  doc = withTrack(doc, entries, 'marimba', tune);
  doc = {
    ...doc,
    sections: [
      { id: 'verse', name: 'Verse', color: sectionColor('Verse'), from: 1, to: 4 },
      { id: 'chorus', name: 'Chorus', color: sectionColor('Chorus'), from: 5, to: 8 },
    ],
  };
  // The riser builds into bar 5, where the chorus starts: dropped on the Effects lane at bar 5's first beat.
  const placed = placeTarget(doc, targetFor(doc, 'riser', 'lane', 16));
  return fitRegions(placed ? placed.doc : doc);
}
