// Sections: the piece divided into named stretches of whole bars (Intro, Verse, Chorus …), which always tile it from
// bar 1 to its last bar. Add one over some bars (the others make room), rename it, remove it (its bars join a
// neighbour, the music stays), move it with everything in it to another section boundary, or duplicate it straight
// after itself. A move or a duplicate is one reordering of bars applied to every timed thing in the piece: notes and
// regions, effect clips and their moves, markers, the tempo list and tempo line, each part's loudness line, vocal clips
// and the sections themselves. A thing moves with the bar it starts in and keeps its place inside that bar. DOM-free.
import { beatClock } from './beats.ts';
import type { BeatClock } from './beats.ts';
import { clipsOf, pos } from './djclips.ts';
import { WHOLE, barsNeeded, fitSections } from './doc.ts';
import type { EditDoc, EditMarker, EditNote, EditSection, Part, Region } from './doc.ts';
import { regionAt, splitRegion } from './regions.ts';
import { stepTempo, tidyLine } from './speed.ts';
import { MAX_CLIPS, MIN_CLIP_BARS, tempoLineBpm } from '../score.ts';
import type { DynMark, FxClip, Tempo, TempoMark, VocalClip } from '../score.ts';

export const SECTION_NAMES = ['Intro', 'Verse', 'Chorus', 'Bridge', 'Outro'] as const;
const COLOURS: Readonly<Record<string, string>> = { Intro: '#6b8fb3', Verse: '#7a9a5a', Chorus: '#c98b3a', Bridge: '#9a7ac0', Outro: '#a0603a' };
const round = (x: number): number => Math.round(x * 1e6) / 1e6;
const EPS = 1e-6;

/** A fixed colour for each of the five usual names, and one more for any other name. */
export function sectionColor(name: string): string {
  return COLOURS[name] ?? WHOLE.color;
}

/** The document's sections fitted to its bars; one section, The Whole Piece, when it has none. */
export function sectionsOf(doc: EditDoc): EditSection[] {
  const bars = barsNeeded(doc);
  const fitted = doc.sections?.length ? fitSections(doc.sections, bars) : [];
  return fitted.length ? fitted : [{ id: WHOLE.id, name: WHOLE.name, color: WHOLE.color, from: 1, to: bars }];
}

const cleanName = (name: string): string => name.trim().slice(0, 60) || 'Section';
/** A section id from its name that no section in `taken` has; it is added to `taken`. */
function newId(name: string, taken: Set<string>): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'section';
  let id = base;
  for (let k = 2; taken.has(id); k++) id = `${base}-${k}`;
  taken.add(id);
  return id;
}

/**
 * A new section named `name` over bars `from` to `to` (the piece grows to hold them); the sections it overlaps are
 * trimmed, and one it cuts in two keeps its name on both sides, the right-hand side with a new id. The new id.
 */
export function addSection(doc: EditDoc, name: string, from: number, to: number): { doc: EditDoc; id: string } {
  const clean = cleanName(name);
  const a = Math.max(1, Math.round(from));
  const b = Math.max(a, Math.round(to));
  const d = b > barsNeeded(doc) ? { ...doc, bars: b } : doc;
  const list = sectionsOf(d);
  const taken = new Set(list.map(s => s.id));
  const id = newId(clean, taken);
  const out: EditSection[] = [{ id, name: clean, color: sectionColor(clean), from: a, to: b }];
  for (const s of list) {
    if (s.to < a || s.from > b) { out.push(s); continue; }
    const before = s.from < a;
    if (before) out.push({ ...s, to: a - 1 });
    if (s.to > b) out.push({ ...s, id: before ? newId(s.name, taken) : s.id, from: b + 1 });
  }
  return { doc: { ...d, sections: out.sort((x, y) => x.from - y.from) }, id };
}

/** Section `id` renamed, with the colour of its new name. */
export function renameSection(doc: EditDoc, id: string, name: string): EditDoc {
  const list = sectionsOf(doc);
  if (!list.some(s => s.id === id)) return doc;
  const clean = cleanName(name);
  return { ...doc, sections: list.map(s => (s.id === id ? { ...s, name: clean, color: sectionColor(clean) } : s)) };
}

/** Section `id` gone: its bars join the section before it (the first's join the one after). The music stays; the last section cannot go. */
export function removeSection(doc: EditDoc, id: string): EditDoc {
  const list = sectionsOf(doc);
  const i = list.findIndex(s => s.id === id);
  if (i < 0 || list.length < 2) return doc;
  const s = list[i]!;
  const out = list.map((x, j) => (i > 0 && j === i - 1 ? { ...x, to: s.to } : i === 0 && j === 1 ? { ...x, from: 1 } : x));
  out.splice(i, 1);
  return { ...doc, sections: out };
}

/**
 * Section `id`'s bars, with everything in them, moved to start where bar `before` starts (a section boundary outside
 * it, or the bar after the last for the end); the rest close up. Any other `before` changes nothing.
 */
export function moveSection(doc: EditDoc, id: string, before: number): EditDoc {
  const bars = barsNeeded(doc);
  const list = sectionsOf(doc);
  const s = list.find(x => x.id === id);
  if (!s || !(before === bars + 1 || list.some(x => x.from === before)) || (before >= s.from && before <= s.to + 1)) return doc;
  const order: number[] = [];
  for (let b = 1; b <= bars + 1; b++) {
    if (b === before) for (let m = s.from; m <= s.to; m++) order.push(m);
    if (b <= bars && (b < s.from || b > s.to)) order.push(b);
  }
  return reorder(doc, order, [s.from, s.to + 1, before], list);
}

/** A copy of section `id`'s bars and everything in them straight after it; the bars after it move on. */
export function duplicateSection(doc: EditDoc, id: string): EditDoc {
  const bars = barsNeeded(doc);
  const list = sectionsOf(doc);
  const s = list.find(x => x.id === id);
  if (!s) return doc;
  const order: number[] = [];
  for (let b = 1; b <= s.to; b++) order.push(b);
  for (let b = s.from; b <= s.to; b++) order.push(b);
  for (let b = s.to + 1; b <= bars; b++) order.push(b);
  return reorder(doc, order, [s.from, s.to + 1], list);
}

/**
 * An empty bar put in before bar `before` (the bar after the last for the end), with that bar's tempo and section;
 * everything from `before` on moves a bar later.
 */
export function insertBar(doc: EditDoc, before: number): EditDoc {
  const bars = barsNeeded(doc);
  const at = Math.max(1, Math.min(bars + 1, Math.round(before)));
  if (at > bars) return { ...doc, bars: bars + 1 };
  const order: number[] = [];
  for (let b = 1; b <= bars; b++) { if (b === at) order.push(b); order.push(b); }
  return reorder(doc, order, [at], sectionsOf(doc), new Set([at - 1]));
}

/**
 * Bar `bar` taken out with everything that starts in it; the bars after it move a bar earlier. A piece keeps at least
 * one bar.
 */
export function removeBar(doc: EditDoc, bar: number): EditDoc {
  const bars = barsNeeded(doc);
  const at = Math.round(bar);
  if (bars <= 1 || at < 1 || at > bars) return doc;
  const order: number[] = [];
  for (let b = 1; b <= bars; b++) if (b !== at) order.push(b);
  const out = reorder(doc, order, [at, at + 1], sectionsOf(doc));
  const n = bars - 1;
  return out.base && (out.base.bars ?? 0) > n ? { ...out, base: { ...out.base, bars: n } } : out;
}

/** The step tempo of bars in `order`: each new bar keeps its old bar's tempo, one entry wherever it changes. */
function tempoOf(old: BeatClock, order: readonly number[]): Tempo[] {
  const out: Tempo[] = [];
  order.forEach((b, i) => {
    const t = old.tempoAt(b);
    const last = out[out.length - 1];
    if (!last || last.bpm !== t.bpm || last.beats !== t.beats || last.unit !== t.unit) out.push({ bar: i + 1, bpm: t.bpm, beats: t.beats, unit: t.unit });
  });
  return out;
}

/**
 * A loudness line's marks on the reordered bars: each mark goes with its bar, and wherever the new order jumps to a
 * bar without one, a copy of the mark in force there carries it on (so bar 1 always has one). Steady marks that repeat
 * the one before are dropped.
 */
function reorderMarks<M extends { bar: number; shape: string }>(marks: readonly M[], order: readonly number[], carry: (bar: number) => M): M[] {
  const out: M[] = [];
  order.forEach((b, i) => {
    const own = marks.find(m => m.bar === b);
    if (own) out.push({ ...own, bar: i + 1 });
    else if (i === 0 || order[i - 1] !== b - 1) out.push({ ...carry(b), bar: i + 1 });
  });
  return out.filter((m, i) => {
    const prev = out[i - 1];
    return !prev || prev.shape !== 'steady' || m.shape !== 'steady' || JSON.stringify({ ...prev, bar: 0 }) !== JSON.stringify({ ...m, bar: 0 });
  });
}

/**
 * The tempo line on the reordered bars. A mark goes with its bar; a ramp whose bars no longer follow each other once,
 * in order, up to its next mark becomes a steady mark on each of its bars at the speed that bar had; and wherever the
 * order jumps, a steady mark carries on the speed there. So every bar keeps its speed.
 */
function reorderLine(line: readonly TempoMark[], order: readonly number[], where: ReadonlyMap<number, number[]>): TempoMark[] {
  const intact = (m: TempoMark): boolean => {
    const next = line[line.indexOf(m) + 1];
    if (m.shape === 'steady' || !next) return true;
    const first = where.get(m.bar);
    if (first?.length !== 1) return false;
    for (let k = m.bar + 1; k <= next.bar; k++) {
      const at = where.get(k);
      if (at?.length !== 1 || at[0] !== first[0]! + (k - m.bar)) return false;
    }
    return true;
  };
  const out: TempoMark[] = [];
  order.forEach((b, i) => {
    const own = line.find(m => m.bar === b);
    const steady: TempoMark = { bar: i + 1, bpm: tempoLineBpm(line, b), shape: 'steady' };
    if (own && intact(own)) out.push({ ...own, bar: i + 1 });
    else if (own || !intact(markAt(line, b)) || i === 0 || order[i - 1] !== b - 1) out.push(steady);
  });
  return tidyLine(out.filter((m, i) => {
    const prev = out[i - 1];
    return !prev || prev.shape !== 'steady' || m.shape !== 'steady' || prev.bpm !== m.bpm;
  }));
}

/** The mark of a line in force at `bar`. */
const markAt = <M extends { bar: number }>(marks: readonly M[], bar: number): M => {
  let at = marks[0]!;
  for (const m of marks) if (m.bar <= bar) at = m;
  return at;
};

/** A loudness line valid as the schema says: the last mark steady, each ramp heading the way its next mark lies. */
function tidyDynamics(marks: DynMark[]): DynMark[] {
  return marks.map((m, i) => {
    const next = marks[i + 1];
    if (!next) return { ...m, shape: 'steady' };
    if (m.shape === 'steady') return m;
    return { ...m, shape: next.level > m.level ? 'louder' : next.level < m.level ? 'softer' : 'steady' };
  });
}

/**
 * The document with its bars in a new order: new bar i+1 is old bar `order[i]` (a bar may come twice: a copy). Regions
 * are first cut at the bar lines in `cuts`, so each one lies in a block that moves together. The first copy of a note,
 * region or clip keeps its id; later copies get new ones.
 */
function reorder(doc: EditDoc, order: readonly number[], cuts: readonly number[], sections: readonly EditSection[], blank: ReadonlySet<number> = new Set()): EditDoc {
  const bars = barsNeeded(doc);
  const old = beatClock(doc.tempo);
  let d = doc;
  for (const p of doc.parts) {
    if (p.vocal) continue;
    for (const c of cuts) {
      if (c <= 1 || c > bars) continue;
      const beat = old.barStartBeat(c);
      const part = d.parts.find(x => x.id === p.id)!;
      const r = regionAt(part, beat);
      if (r && r.start < beat - EPS) d = splitRegion(d, p.id, r.id, beat)!.doc;
    }
  }
  const n = order.length;
  const where = new Map<number, number[]>();
  order.forEach((b, i) => { if (!blank.has(i)) where.set(b, [...(where.get(b) ?? []), i + 1]); });
  /** The new bars an old bar became; a bar past the end stays past the new end. */
  const barsFor = (b: number): number[] => where.get(b) ?? (b > bars ? [n + b - bars] : []);

  let tempo = tempoOf(old, order);
  let tempoLine: TempoMark[] | null = null;
  if (d.tempoLine?.length) {
    tempoLine = reorderLine(d.tempoLine, order, where);
    tempo = stepTempo(tempoLine, tempo, n);
  }
  const now = beatClock(tempo);
  const beatsFor = (beat: number): number[] => {
    const b = old.barOfBeat(beat);
    const off = beat - old.barStartBeat(b);
    return barsFor(b).map(nb => round(now.barStartBeat(nb) + off));
  };
  let nextId = d.nextId;
  /** Copies of `items` at each new place of their start: the first keeps its id. */
  const copies = <T extends { id: number }>(items: readonly T[], startOf: (x: T) => number, place: (x: T, at: number) => T): T[] =>
    items.flatMap(x => beatsFor(startOf(x)).map((at, k) => ({ ...place(x, at), id: k === 0 ? x.id : nextId++ })));

  const parts = d.parts.map((p): Part => {
    const q: Part = { ...p };
    if (!p.vocal) {
      q.notes = copies<EditNote>(p.notes, n0 => n0.start, (n0, at) => ({ ...n0, start: at })).sort((a, b) => a.start - b.start || a.pitch - b.pitch);
      if (p.regions) q.regions = copies<Region>(p.regions, r => r.start, (r, at) => ({ ...r, start: at })).sort((a, b) => a.start - b.start);
    }
    if (p.dynamics?.length) {
      const dyn = p.dynamics;
      q.dynamics = tidyDynamics(reorderMarks(dyn, order, b => ({ ...markAt(dyn, b), bar: b })));
    }
    if (p.vocal) {
      const clips = p.vocal.clips.flatMap(c => beatsFor(old.beat(c.at)).map((at): VocalClip => ({ ...c, at: Math.round(now.seconds(at) * 1000) / 1000 })));
      q.vocal = { ...p.vocal, clips: clips.sort((a, b) => a.at - b.at).slice(0, MAX_CLIPS) };
    }
    return q;
  });

  const posFor = (p: number): number[] => {
    const b = Math.floor(p + 1e-9);
    return barsFor(b).map(nb => pos(nb + (p - b)));
  };
  const fxClips = clipsOf(d).flatMap(c => posFor(c.from_bar).map((from): FxClip => {
    const shift = from - c.from_bar;
    const to = pos(Math.min(n + 1, c.to_bar + shift));
    const clip: FxClip = { ...c, from_bar: Math.min(from, pos(to - MIN_CLIP_BARS)), to_bar: to };
    if (c.points) clip.points = c.points.map(pt => [pos(Math.min(to, pt[0]! + shift)), ...pt.slice(1)]);
    const s = c.settings;
    if (c.effect === 'hot_cue' && typeof s?.['cue_bar'] === 'number') clip.settings = { ...s, cue_bar: posFor(s['cue_bar'])[0] ?? s['cue_bar'] };
    if (c.effect === 'looper' && Array.isArray(s?.['bars'])) clip.settings = { ...s, bars: (s['bars'] as number[]).map(b => barsFor(b)[0] ?? b) };
    return clip;
  }));
  const markers: EditMarker[] = (d.markers ?? []).flatMap(m => beatsFor(m.beat).map(beat => ({ ...m, beat }))).sort((a, b) => a.beat - b.beat);

  const ofBar = (b: number): EditSection => sections.find(s => b >= s.from && b <= s.to) ?? sections[sections.length - 1]!;
  const taken = new Set(sections.map(s => s.id));
  const seen = new Map<number, number>();
  const newSections: EditSection[] = [];
  let lastKey = '';
  order.forEach((b, i) => {
    const k = seen.get(b) ?? 0;
    if (!blank.has(i)) seen.set(b, k + 1);
    const s = ofBar(b);
    const key = `${s.id} ${k}`;
    if (key === lastKey) newSections[newSections.length - 1]!.to = i + 1;
    else newSections.push({ ...s, id: k === 0 ? s.id : newId(s.name, taken), from: i + 1, to: i + 1 });
    lastKey = key;
  });

  const out: EditDoc = { ...d, tempo, tempoLine, bars: n, parts, markers, sections: newSections, nextId };
  if (d.fxClips) out.fxClips = fxClips;
  if (!d.markers) delete out.markers;
  return out;
}
