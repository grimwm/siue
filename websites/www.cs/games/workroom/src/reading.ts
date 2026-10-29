// The sheet-music reading lesson: what one lane's notation holds (its clef,
// time signature, key signature and every note bar by bar), and six short steps
// that teach reading it with this lane's own bars as the examples. A step whose
// example the lane lacks keeps its plain explanation and points at no bar.
// DOM-free.
import type { Clip } from './player.ts';
import type { TempoMap } from './tempo.ts';

export type Clef = 'treble' | 'bass' | 'alto' | 'tenor' | 'percussion';
export interface NoteFact {
  /** The bar (MusicXML measure number) the note is in. */
  bar: number;
  rest: boolean;
  /** A rest that fills its whole bar (drawn as one block, whatever the bar's length). */
  wholeBar: boolean;
  /** MusicXML's note type (whole, half, quarter, eighth, 16th…); null when not written. */
  type: string | null;
  dots: number;
  /** Step, sharp or flat sign and octave, as the piano roll names notes (C4 is middle C); '' for a rest. */
  name: string;
  /** The sign drawn beside the note (sharp, flat, natural…), or null. */
  accidental: string | null;
  /** Raised (+) or lowered (−) in half steps. */
  alter: number;
  tieStart: boolean;
  tieStop: boolean;
}
export interface LaneFacts { clef: Clef | null; time: { beats: number; beatType: number } | null; fifths: number | null; notes: NoteFact[] }

/** A run of a step's text: plain words, or words that open a glossary card. */
export type Run = { text: string } | { term: string; text: string };
export const STEP_IDS = ['staff', 'lengths', 'bars', 'accidentals', 'ties', 'follow'] as const;
export type StepId = (typeof STEP_IDS)[number];
export interface ReadingStep {
  id: StepId;
  title: string;
  text: Run[];
  /** The bar the step points at in the notation; null when this lane has no example. */
  bar: number | null;
  /** The moment Hear it plays; null when there is nothing to hear for this step. */
  clip: Clip | null;
  /** Reading along: the lit bar follows the playhead instead of staying on `bar`. */
  follow?: boolean;
}

const first = (re: RegExp, s: string): string | undefined => re.exec(s)?.[1];
const CLEFS: Record<string, Clef> = { G2: 'treble', F4: 'bass', C3: 'alto', C4: 'tenor' };
const SIGNS: Record<number, string> = { [-2]: '𝄫', [-1]: '♭', 0: '', 1: '♯', 2: '𝄪' };

/** The facts of a MusicXML score's first part (onlyLane's output for a lane): the first clef, time and key, and each note in order. Grace and cue notes are left out, and a chord counts once, by its first note. */
export function readLane(musicxml: string): LaneFacts {
  const part = first(/<part\b[^>]*>([\s\S]*?)<\/part\s*>/, musicxml) ?? '';
  const clefXml = first(/<clef\b[^>]*>([\s\S]*?)<\/clef\s*>/, part);
  const sign = clefXml ? first(/<sign>\s*(\w+)\s*<\/sign>/, clefXml) : undefined;
  const clef: Clef | null = sign === 'percussion' ? 'percussion' : sign ? CLEFS[`${sign}${first(/<line>\s*(\d+)\s*<\/line>/, clefXml!) ?? (sign === 'G' ? '2' : sign === 'F' ? '4' : '3')}`] ?? null : null;
  const timeXml = first(/<time\b[^>]*>([\s\S]*?)<\/time\s*>/, part);
  const beats = timeXml ? parseInt(first(/<beats>\s*(\d+)/, timeXml) ?? '', 10) : NaN;
  const beatType = timeXml ? parseInt(first(/<beat-type>\s*(\d+)/, timeXml) ?? '', 10) : NaN;
  const fifths = first(/<fifths>\s*(-?\d+)\s*<\/fifths>/, part);
  const notes: NoteFact[] = [];
  let index = 0;
  for (const m of part.matchAll(/<measure\b([^>]*)>([\s\S]*?)<\/measure\s*>/g)) {
    index++;
    const number = parseInt(first(/\snumber\s*=\s*["'](\d+)["']/, m[1] ?? '') ?? '', 10);
    const bar = Number.isFinite(number) && number > 0 ? number : index;
    for (const n of (m[2] ?? '').matchAll(/<note\b[^>]*>([\s\S]*?)<\/note\s*>/g)) {
      const x = n[1] ?? '';
      if (/<(grace|cue|chord)\b/.test(x)) continue;
      const restTag = first(/<rest\b([^>]*)\/?>/, x);
      const rest = restTag !== undefined;
      const type = first(/<type\b[^>]*>\s*([^<\s]+)\s*<\/type>/, x) ?? null;
      const alter = Math.round(parseFloat(first(/<alter>\s*(-?[\d.]+)\s*<\/alter>/, x) ?? '0')) || 0;
      const step = first(/<step>\s*([A-G])\s*<\/step>/, x);
      const octave = first(/<octave>\s*(\d+)\s*<\/octave>/, x);
      notes.push({
        bar, rest,
        wholeBar: rest && (/measure\s*=\s*["']yes["']/.test(restTag ?? '') || type === null),
        type, dots: (x.match(/<dot\b/g) ?? []).length,
        name: !rest && step && octave ? `${step}${SIGNS[alter] ?? ''}${octave}` : '',
        accidental: first(/<accidental\b[^>]*>\s*([^<\s]+)\s*<\/accidental>/, x) ?? null,
        alter,
        tieStart: /<tie\b[^>]*type\s*=\s*["']start["']/.test(x),
        tieStop: /<tie\b[^>]*type\s*=\s*["']stop["']/.test(x),
      });
    }
  }
  return {
    clef,
    time: Number.isFinite(beats) && Number.isFinite(beatType) ? { beats, beatType } : null,
    fifths: fifths === undefined ? null : parseInt(fifths, 10),
    notes,
  };
}

/** "{id|shown words}" opens the glossary card id; the rest is plain text. */
function runs(s: string): Run[] {
  const out: Run[] = [];
  let at = 0;
  for (const m of s.matchAll(/\{([a-z-]+)\|([^}]+)\}/g)) {
    if (m.index > at) out.push({ text: s.slice(at, m.index) });
    out.push({ term: m[1]!, text: m[2]! });
    at = m.index + m[0].length;
  }
  if (at < s.length) out.push({ text: s.slice(at) });
  return out;
}

const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const say = (n: number): string => NUMBERS[n] ?? String(n);
const LENGTHS: Record<string, string> = { breve: 'double whole', whole: 'whole', half: 'half', quarter: 'quarter', eighth: 'eighth', '16th': 'sixteenth', '32nd': 'thirty-second' };
const BEAT_NOTE: Record<number, string> = { 1: 'whole note', 2: 'half note', 4: 'quarter note', 8: 'eighth note', 16: 'sixteenth note' };
const CLEF_SAYS: Record<Clef, string> = {
  treble: 'this part uses a treble clef, the curly sign that puts the G above middle C on the second line from the bottom',
  bass: 'this part uses a bass clef, the sign whose two dots sit either side of the fourth line up, the F below middle C',
  alto: 'this part uses an alto clef, which puts middle C on the middle line',
  tenor: 'this part uses a tenor clef, which puts middle C on the fourth line up',
  percussion: 'this part uses a percussion clef, so each line stands for a drum rather than a note',
};
const list = (xs: string[]): string => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const article = (word: string): string => (/^[aeiou]/.test(word) ? 'an' : 'a');
/** "an E", "an F", "a G": letter names said aloud. */
const letterArticle = (letter: string): string => ('AEF'.includes(letter) ? 'an' : 'a');

/** One kind of written length in a bar ("dotted half note", "quarter rest"); null for a length this lesson does not name. */
function kind(n: NoteFact): string | null {
  if (n.wholeBar) return 'rest that fills the bar';
  const length = n.type ? LENGTHS[n.type] : undefined;
  if (!length) return null;
  return `${n.dots === 1 ? 'dotted ' : n.dots >= 2 ? 'double-dotted ' : ''}${length} ${n.rest ? 'rest' : 'note'}`;
}

/** The bar with the most kinds of written length among the bars this lane plays in (the earliest on a tie), and what it holds in words. */
function lengthsExample(notes: NoteFact[]): { bar: number; says: string } | null {
  const bars = [...new Set(notes.filter(n => !n.rest).map(n => n.bar))];
  let best: { bar: number; kinds: Map<string, number> } | null = null;
  for (const bar of bars) {
    const kinds = new Map<string, number>();
    for (const n of notes) {
      if (n.bar !== bar) continue;
      const k = kind(n);
      if (k) kinds.set(k, (kinds.get(k) ?? 0) + 1);
    }
    if (kinds.size > 0 && (!best || kinds.size > best.kinds.size)) best = { bar, kinds };
  }
  if (!best) return null;
  const parts = [...best.kinds].map(([k, count]) => (count === 1 ? `${article(k)} ${k}` : `${say(count)} ${k}s`));
  return { bar: best.bar, says: list(parts) };
}

/** The first tied note, preferring one tied across a bar line, and the bar its tie ends in. */
function tieExample(notes: NoteFact[]): { bar: number; to: number; name: string } | null {
  const ties: { bar: number; to: number; name: string }[] = [];
  notes.forEach((n, i) => {
    if (n.rest || !n.tieStart || n.tieStop) return;
    let to = n.bar;
    for (let j = i + 1; j < notes.length; j++) {
      const m = notes[j]!;
      if (m.rest || m.name !== n.name || !m.tieStop) continue;
      to = m.bar;
      if (!m.tieStart) break;
    }
    ties.push({ bar: n.bar, to, name: n.name });
  });
  return ties.find(t => t.to > t.bar) ?? ties[0] ?? null;
}

const SIGN_NAMES: Record<string, string> = { flat: 'flat', sharp: 'sharp', 'flat-flat': 'double flat', 'double-sharp': 'double sharp', 'sharp-sharp': 'double sharp' };

/** A sharp or flat drawn in the lane, else one the key signature makes, else a natural sign; what it is in words. */
function accidentalExample(notes: NoteFact[]): { bar: number; says: string } | null {
  const sounding = notes.filter(n => !n.rest && n.name !== '');
  const drawn = sounding.find(n => n.accidental !== null && SIGN_NAMES[n.accidental] !== undefined && n.alter !== 0);
  if (drawn) return { bar: drawn.bar, says: `${drawn.name}, ${letterArticle(drawn.name[0]!)} ${drawn.name[0]} ${drawn.alter < 0 ? 'lowered' : 'raised'} ${drawn.alter === -1 || drawn.alter === 1 ? 'a half step' : 'two half steps'} by the sign beside it` };
  const keyed = sounding.find(n => n.alter !== 0);
  if (keyed) return { bar: keyed.bar, says: `${keyed.name}, made ${keyed.alter < 0 ? 'flat' : 'sharp'} by the key signature` };
  const natural = sounding.find(n => n.accidental === 'natural');
  if (natural) return { bar: natural.bar, says: `a natural sign on ${natural.name}: a plain ${natural.name[0]}, neither sharp nor flat` };
  return null;
}

/** The six steps of the lesson for one lane. Each clip runs from the start of its bar, at most `cap` seconds and never past the end of the piece; a piece with no bars has none. */
export function readingSteps(lane: LaneFacts, tempo: TempoMap, duration: number): ReadingStep[] {
  const clip = (from: number, to: number, cap: number): Clip | null => {
    if (!tempo.metric) return null;
    const a = tempo.barStart(from);
    const b = Math.min(tempo.barStart(to + 1), a + cap, duration);
    return b > a ? { from: a, to: b } : null;
  };
  const opening = lane.notes.find(n => !n.rest && n.name !== '') ?? null;

  const staffText = `Music is written on a {staff|staff}: five lines read left to right, where a note drawn higher sounds higher. The sign at the start of each line is the {clef|clef}: ${lane.clef ? CLEF_SAYS[lane.clef] : 'it says which note each line and gap stands for'}.`
    + (opening ? ` The first note here, in bar ${opening.bar}, is ${opening.name} (C4 is middle C).` : '');

  const lengths = lengthsExample(lane.notes);
  const lengthsText = 'A note’s shape says how long it lasts: a {whole-note|whole note} (an open oval) lasts four beats, a {half-note|half note} (open, with a stem) two, a {quarter-note|quarter note} (filled in) one, and an {eighth-note|eighth note} (with a flag or a beam) half a beat. A {dotted-note|dot} after a note makes it half as long again, and a {rest|rest} is a silence with the same lengths, drawn as a small block or squiggle.'
    + (lengths ? ` Bar ${lengths.bar} holds ${lengths.says}.` : '');

  const t = lane.time;
  const barsText = 'Upright lines cut the staff into {bar|bars}, and the small numbers above the staff count them, the same bar numbers as on the timeline. '
    + (t
      ? `The two stacked numbers at the start, ${t.beats} over ${t.beatType}, are the {time-signature|time signature}: each bar holds ${t.beats} {beat|beats}, and ${article(BEAT_NOTE[t.beatType] ?? 'note')} ${BEAT_NOTE[t.beatType] ?? `1/${t.beatType} note`} lasts one beat.`
      : 'Two stacked numbers at the start, the {time-signature|time signature}, say how many {beat|beats} each bar holds.')
    + (opening ? ` Bar ${opening.bar} is the first where this part plays: tap Hear it and count ${t && t.beats <= 12 ? Array.from({ length: t.beats }, (_, i) => say(i + 1)).join(', ') : 'the beats'}.` : '');

  const key = lane.fifths ?? 0;
  const acc = accidentalExample(lane.notes);
  const accText = 'Sharps (♯), flats (♭) and naturals (♮) are {accidental|accidentals}: a sharp raises a note a {half-step|half step}, a flat lowers it a half step, and a natural undoes either. '
    + (key !== 0
      ? `The ${Math.abs(key) === 1 ? (key < 0 ? 'flat' : 'sharp') : `${Math.abs(key)} ${key < 0 ? 'flats' : 'sharps'}`} right after the clef ${Math.abs(key) === 1 ? 'is' : 'are'} the {key-signature|key signature}: ${Math.abs(key) === 1 ? 'it holds' : 'they hold'} for every note on that line or gap, all piece long.`
      : 'This part has no {key-signature|key signature} (signs right after the clef), so each sign sits beside its own note and lasts to the end of the bar.')
    + (acc ? ` Bar ${acc.bar} has ${acc.says}.` : '');

  const tie = tieExample(lane.notes);
  const tieText = 'A curved line joining two notes of the same pitch is a {tie|tie}: play the first and hold it through the second, without playing again. Ties let a note last across a bar line, or for a length no single note shape has.'
    + (tie ? (tie.to > tie.bar ? ` In bar ${tie.bar}, the ${tie.name} is tied into bar ${tie.to}, so it sounds as one long note.` : ` In bar ${tie.bar}, two ${tie.name} notes are tied, so they sound as one longer note.`) : '');

  const followText = 'Tap Play above and watch the amber box: it marks the bar playing now, as the playhead does on the timeline. Follow the notes inside it, and at the end of a line go on to the start of the next, as when reading a book.';

  return [
    { id: 'staff', title: 'The staff and the clef', text: runs(staffText), bar: opening?.bar ?? null, clip: opening ? clip(opening.bar, opening.bar, 10) : null },
    { id: 'lengths', title: 'How long a note lasts', text: runs(lengthsText), bar: lengths?.bar ?? null, clip: lengths ? clip(lengths.bar, lengths.bar, 10) : null },
    { id: 'bars', title: 'Bars and the time signature', text: runs(barsText), bar: opening?.bar ?? null, clip: opening ? clip(opening.bar, opening.bar, 10) : null },
    { id: 'accidentals', title: 'Sharps, flats and naturals', text: runs(accText), bar: acc?.bar ?? null, clip: acc ? clip(acc.bar, acc.bar, 10) : null },
    { id: 'ties', title: 'Ties: holding a note', text: runs(tieText), bar: tie?.bar ?? null, clip: tie ? clip(tie.bar, tie.to, 10) : null },
    { id: 'follow', title: 'Reading along', text: runs(followText), bar: opening?.bar ?? null, clip: opening ? clip(opening.bar, opening.bar + 3, 16) : null, follow: true },
  ];
}
