// Reading MusicXML (score-partwise, from MuseScore, Sibelius, Finale, Dorico and the rest) into the importer's parts,
// at the pitch each part sounds: written pitch plus its <transpose>; drums by <instrument> to their General MIDI
// note. Chords, <backup> and <forward> (voices and staves), ties joined into one note, changes of divisions, the
// speed, time signatures and the first key. What the score cannot keep (lyrics, chord symbols, grace notes,
// ornaments and articulations, repeats, tablature) is named for the preview. The XML parser is a port: the
// browser's DOMParser, which loads nothing from outside the file. DOM-free.
import { byStart, ImportError, unitOf } from './music-file.ts';
import type { ReadMusic, ReadNote, ReadPart } from './music-file.ts';
import type { Tempo } from '../score.ts';

export interface XmlNode { nodeType: number }
export interface XmlElement extends XmlNode {
  tagName: string;
  childNodes: ArrayLike<XmlNode>;
  getAttribute(name: string): string | null;
  textContent: string | null;
}
export interface XmlDocument { documentElement: XmlElement | null }

const STEPS: Readonly<Record<string, number>> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const DEFAULT_QUARTER_BPM = 120;
const DEFAULT_VELOCITY = 90;

const children = (el: XmlElement): XmlElement[] => {
  const out: XmlElement[] = [];
  for (let i = 0; i < el.childNodes.length; i++) {
    const n = el.childNodes[i]!;
    if (n.nodeType === 1) out.push(n as XmlElement);
  }
  return out;
};
const child = (el: XmlElement | undefined, tag: string): XmlElement | undefined => (el ? children(el).find(c => c.tagName === tag) : undefined);
const all = (el: XmlElement, tag: string): XmlElement[] => children(el).filter(c => c.tagName === tag);
const textOf = (el: XmlElement | undefined, tag: string): string | null => child(el, tag)?.textContent?.trim() ?? null;
const numOf = (el: XmlElement | undefined, tag: string): number | null => {
  const t = textOf(el, tag);
  const n = t === null ? NaN : Number(t);
  return Number.isFinite(n) ? n : null;
};
/** Every descendant with this tag, depth first. */
function deep(el: XmlElement, tag: string, out: XmlElement[] = []): XmlElement[] {
  for (const c of children(el)) { if (c.tagName === tag) out.push(c); deep(c, tag, out); }
  return out;
}

interface Event { at: number; measure: number; measureStart: number; tempo?: number; time?: [number, number] }

/** MusicXML text as the importer's parts. `check` is called now and then, and throws to stop a read that has taken too long. */
export function readMusicXml(text: string, parse: (text: string) => XmlDocument, check: () => void = () => {}): ReadMusic {
  if (/<!ENTITY/i.test(text)) throw new ImportError('This file declares XML entities, which the workroom does not read: a music file never needs them.');
  let root: XmlElement | null;
  try {
    root = parse(text).documentElement;
  } catch {
    root = null;
  }
  if (root && root.tagName === 'score-timewise') throw new ImportError('This MusicXML is laid out by time (score-timewise) rather than by part. Export it again as ordinary (partwise) MusicXML.');
  if (!root || root.tagName !== 'score-partwise') throw new ImportError('This file is not MusicXML: it has no score in it. Export the piece again as MusicXML.');

  const lost: string[] = [];
  let words = 0;
  const symbols = new Set<string>();
  let graces = 0;
  let marks = false;
  let repeats = false;
  let tab = false;
  let microtones = false;

  const title = textOf(child(root, 'work'), 'work-title') ?? textOf(root, 'movement-title');
  const app = textOf(child(child(root, 'identification'), 'encoding'), 'software');

  // The part list: each part's name, program and its drums' notes by instrument id.
  const list = new Map<string, { name: string; program: number | null; unpitched: Map<string, number>; channel10: boolean }>();
  for (const sp of deep(child(root, 'part-list') ?? root, 'score-part')) {
    const id = sp.getAttribute('id') ?? '';
    const unpitched = new Map<string, number>();
    let program: number | null = null;
    let channel10 = false;
    for (const mi of all(sp, 'midi-instrument')) {
      const u = numOf(mi, 'midi-unpitched');
      if (u !== null) unpitched.set(mi.getAttribute('id') ?? '', u - 1);
      program ??= numOf(mi, 'midi-program');
      if (numOf(mi, 'midi-channel') === 10) channel10 = true;
    }
    list.set(id, { name: textOf(sp, 'part-name') ?? id, program, unpitched, channel10 });
  }

  const events: Event[] = [];
  let fifths: number | null = null;
  let mode: 'major' | 'minor' | null = null;
  const parts: ReadPart[] = [];
  let count = 0;

  for (const part of all(root, 'part')) {
    const info = list.get(part.getAttribute('id') ?? '') ?? { name: part.getAttribute('id') ?? 'Part', program: null, unpitched: new Map<string, number>(), channel10: false };
    let divisions = 1;
    let chromatic = 0;
    let percussion = false;
    let velocity = DEFAULT_VELOCITY;
    let measureStart = 0;
    let index = 0;
    const notes: ReadNote[] = [];
    const ties = new Map<string, ReadNote>(); // pitch|voice -> the note a tie carries on
    let lastStart = 0;
    let drumsSeen = false;
    for (const measure of all(part, 'measure')) {
      index++;
      let pos = measureStart;
      let reach = measureStart;
      for (const el of children(measure)) {
        switch (el.tagName) {
          case 'attributes': {
            divisions = numOf(el, 'divisions') ?? divisions;
            const key = child(el, 'key');
            if (key && fifths === null && numOf(key, 'fifths') !== null) { fifths = numOf(key, 'fifths'); mode = textOf(key, 'mode') === 'minor' ? 'minor' : 'major'; }
            const time = child(el, 'time');
            if (time) {
              const beats = (textOf(time, 'beats') ?? '').split('+').reduce((s, x) => s + Number(x), 0);
              const type = numOf(time, 'beat-type');
              if (beats >= 1 && type !== null) events.push({ at: pos, measure: index, measureStart, time: [beats, type] });
            }
            const tr = child(el, 'transpose');
            if (tr) chromatic = (numOf(tr, 'chromatic') ?? 0) + 12 * (numOf(tr, 'octave-change') ?? 0);
            for (const clef of all(el, 'clef')) if (textOf(clef, 'sign') === 'percussion') percussion = true; else if (textOf(clef, 'sign') === 'TAB') tab = true;
            for (const sd of all(el, 'staff-details')) if (child(sd, 'staff-tuning')) tab = true;
            break;
          }
          case 'direction': {
            const sound = child(el, 'sound');
            const tempo = sound ? Number(sound.getAttribute('tempo') ?? NaN) : NaN;
            if (Number.isFinite(tempo) && tempo > 0) events.push({ at: pos, measure: index, measureStart, tempo });
            else {
              const met = deep(el, 'metronome')[0];
              const per = met ? numOf(met, 'per-minute') : null;
              const unit = met ? textOf(met, 'beat-unit') : null;
              const dotted = met ? !!child(met, 'beat-unit-dot') : false;
              const quarters: Readonly<Record<string, number>> = { whole: 4, half: 2, quarter: 1, eighth: 0.5, '16th': 0.25 };
              if (per && unit && quarters[unit]) events.push({ at: pos, measure: index, measureStart, tempo: per * quarters[unit]! * (dotted ? 1.5 : 1) });
            }
            const dyn = sound ? Number(sound.getAttribute('dynamics') ?? NaN) : NaN;
            if (Number.isFinite(dyn)) velocity = Math.max(1, Math.min(127, Math.round((DEFAULT_VELOCITY * dyn) / 100)));
            break;
          }
          case 'sound': {
            const tempo = Number(el.getAttribute('tempo') ?? NaN);
            if (Number.isFinite(tempo) && tempo > 0) events.push({ at: pos, measure: index, measureStart, tempo });
            break;
          }
          case 'harmony': {
            const root = textOf(child(el, 'root'), 'root-step');
            if (root) symbols.add(`${root}${{ '1': '♯', '-1': '♭' }[textOf(child(el, 'root'), 'root-alter') ?? ''] ?? ''}${textOf(el, 'kind') === 'minor' ? 'm' : ''}`);
            break;
          }
          case 'backup': pos -= (numOf(el, 'duration') ?? 0) / divisions; break;
          case 'forward': pos += (numOf(el, 'duration') ?? 0) / divisions; reach = Math.max(reach, pos); break;
          case 'barline': if (child(el, 'repeat') || child(el, 'ending')) repeats = true; break;
          case 'note': {
            if (++count % 1000 === 0) check();
            words += all(el, 'lyric').filter(l => child(l, 'text')).length;
            const notations = child(el, 'notations');
            if (notations && (child(notations, 'ornaments') || child(notations, 'articulations') || child(notations, 'technical') || child(notations, 'fermata'))) {
              marks = true;
              if (child(child(notations, 'technical'), 'fret')) tab = true;
            }
            if (child(el, 'grace')) { graces++; break; }
            if (child(el, 'cue')) break;
            const dur = (numOf(el, 'duration') ?? 0) / divisions;
            const isChord = !!child(el, 'chord');
            const start = isChord ? lastStart : pos;
            if (!isChord) { lastStart = pos; pos += dur; reach = Math.max(reach, pos); }
            if (child(el, 'rest')) break;
            let pitch: number | null = null;
            const p = child(el, 'pitch');
            const u = child(el, 'unpitched');
            if (p) {
              const alter = numOf(p, 'alter') ?? 0;
              if (!Number.isInteger(alter)) microtones = true;
              const step = STEPS[textOf(p, 'step') ?? ''];
              const octave = numOf(p, 'octave');
              if (step !== undefined && octave !== null) pitch = (octave + 1) * 12 + step + Math.round(alter) + chromatic;
            } else if (u) {
              const id = child(el, 'instrument')?.getAttribute('id') ?? '';
              pitch = info.unpitched.get(id) ?? [...info.unpitched.values()][0] ?? 38;
              drumsSeen = true;
            }
            if (pitch === null || pitch < 0 || pitch > 127) break;
            const dynAttr = Number(el.getAttribute('dynamics') ?? NaN);
            const vel = Number.isFinite(dynAttr) ? Math.max(1, Math.min(127, Math.round((DEFAULT_VELOCITY * dynAttr) / 100))) : velocity;
            const tieTypes = all(el, 'tie').map(t => t.getAttribute('type'));
            const key = `${pitch}|${textOf(el, 'voice') ?? '1'}|${textOf(el, 'staff') ?? '1'}`;
            const carried = ties.get(key);
            let note: ReadNote;
            if (tieTypes.includes('stop') && carried && Math.abs(carried.start + carried.length - start) < 1e-6) {
              carried.length += dur;
              note = carried;
            } else {
              note = { start, length: dur, pitch, velocity: vel };
              notes.push(note);
            }
            if (tieTypes.includes('start')) ties.set(key, note); else ties.delete(key);
            break;
          }
        }
      }
      measureStart = reach;
    }
    const drums = percussion || drumsSeen || info.channel10;
    parts.push({ name: info.name, program: drums ? null : info.program, drums, notes: notes.filter(n => n.length > 0).sort(byStart) });
  }

  if (words) lost.push(`Lyrics (${words} ${words === 1 ? 'word' : 'words'}). The workroom has no words in parts yet.`);
  if (symbols.size) lost.push(`Chord symbols (${[...symbols].slice(0, 4).join(', ')}${symbols.size > 4 ? ', …' : ''}). The notes are kept, but the symbols are dropped.`);
  if (graces) lost.push(`Grace notes (${graces}). They are left out; the main notes come across.`);
  if (marks) lost.push('Ornaments and articulations (trills, accents, fermatas and the like). The notes come across plainly.');
  if (repeats) lost.push('Repeat signs. The music comes across as written once, without the repeats.');
  if (tab) lost.push('Guitar tablature. The notes come across; the tab lines don\'t.');
  if (microtones) lost.push('Quarter-tone accidentals, rounded to the nearest note.');

  const tempo = tempoMap(events, lost);
  return { format: 'MusicXML', app, title, tempo, fifths, mode, parts, lost: [...new Set(lost)] };
}

/** Speed and time signature by bar: a change at a bar's start is that bar's; one inside a bar starts at the next. */
function tempoMap(events: readonly Event[], lost: string[]): Tempo[] {
  let quarterBpm = DEFAULT_QUARTER_BPM;
  let beats = 4;
  let unit: Tempo['unit'] = 4;
  const byBar = new Map<number, Event[]>();
  for (const e of events) {
    const mid = e.at > e.measureStart + 1e-6;
    const bar = mid ? e.measure + 1 : e.measure;
    if (mid && e.tempo) lost.push(`A speed change in the middle of bar ${e.measure}. It starts at bar ${e.measure + 1} instead.`);
    (byBar.get(bar) ?? byBar.set(bar, []).get(bar)!).push(e);
  }
  const out: Tempo[] = [];
  for (const bar of [1, ...[...byBar.keys()].filter(b => b !== 1).sort((a, b) => a - b)]) {
    for (const e of byBar.get(bar) ?? []) {
      if (e.tempo) quarterBpm = e.tempo;
      if (e.time) {
        const u = unitOf(e.time[1]);
        if (u && e.time[0] <= 16) { beats = e.time[0]; unit = u; } else lost.push(`The time signature ${e.time[0]}/${e.time[1]}, which the workroom cannot write; those bars keep ${beats}/${unit}.`);
      }
    }
    const bpm = Math.round(((quarterBpm * unit) / 4) * 100) / 100;
    const last = out[out.length - 1];
    if (!last || last.bpm !== bpm || last.beats !== beats || last.unit !== unit) out.push({ bar, bpm, beats, unit });
  }
  return [...new Map(out.map(t => [t.bar, t])).values()];
}
