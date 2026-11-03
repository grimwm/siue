// Regions: blocks of a part's notes on the timeline, the way GarageBand shows them. Every note's start lies in exactly
// one region of its part and regions never overlap; a looped region repeats its first stretch to its end, and its notes
// live only in that first stretch (the repeats are heard, and saved as notes, but never stored). Each edit is a pure
// function from one document to the next: fit regions to notes, split, join, move (within a part or to another), copy
// and paste, duplicate, loop and delete. Positions are beats. DOM-free.
import { beatClock } from './beats.ts';
import type { BeatClock } from './beats.ts';
import { barsNeeded } from './doc.ts';
import type { EditDoc, EditNote, Part, Region } from './doc.ts';

const EPS = 1e-6;
const round = (x: number): number => Math.round(x * 1e6) / 1e6;
const endOf = (r: Region): number => r.start + r.length;
/** Whether `beat` lies in the region. */
const holds = (r: Region, beat: number): boolean => beat >= r.start - EPS && beat < endOf(r) - EPS;
const byStart = (a: { start: number }, b: { start: number }): number => a.start - b.start;
const sortNotes = (notes: EditNote[]): EditNote[] => [...notes].sort((a, b) => a.start - b.start || a.pitch - b.pitch);

/** A copied region: its length and loop, and its notes with starts from the region's start. */
export interface RegionClip { kind: 'region'; drums: boolean; length: number; loop?: number; notes: Omit<EditNote, 'id'>[] }

function withPart(doc: EditDoc, id: string, change: (p: Part) => Part): EditDoc {
  return { ...doc, parts: doc.parts.map(p => (p.id === id ? change(p) : p)) };
}
/** The document with its bars grown to hold everything in it. */
const grow = (doc: EditDoc): EditDoc => {
  const bars = barsNeeded(doc);
  return bars > doc.bars ? { ...doc, bars } : doc;
};
const partOf = (doc: EditDoc, id: string): Part | undefined => doc.parts.find(p => p.id === id);
const regionsOf = (p: Part): Region[] => [...(p.regions ?? [])].sort(byStart);

/** The regions a part's notes make with nothing else to go by: one over each run of consecutive bars that hold note starts. */
export function autoRegions(clock: BeatClock, notes: readonly EditNote[]): Omit<Region, 'id'>[] {
  const bars = [...new Set(notes.map(n => clock.barOfBeat(n.start)))].sort((a, b) => a - b);
  const out: Omit<Region, 'id'>[] = [];
  for (let i = 0; i < bars.length;) {
    let j = i;
    while (j + 1 < bars.length && bars[j + 1] === bars[j]! + 1) j++;
    const start = round(clock.barStartBeat(bars[i]!));
    out.push({ start, length: round(clock.barStartBeat(bars[j]! + 1) - start) });
    i = j + 1;
  }
  return out;
}

/** Whether two lists of regions cover the same beats with the same loops (ids aside). */
export function sameRegions(a: readonly Omit<Region, 'id'>[], b: readonly Omit<Region, 'id'>[]): boolean {
  return a.length === b.length && a.every((r, i) => {
    const s = b[i]!;
    return Math.abs(r.start - s.start) < EPS && Math.abs(r.length - s.length) < EPS && (r.loop ?? 0) === (s.loop ?? 0);
  });
}

/**
 * Every music part's regions fitted to its notes. A note in a looped region's repeat moves into the first stretch (a
 * copy of a note already there goes); a note outside every region extends the region before it when that ends in the
 * note's bar, else the one after when that starts in the note's bar, else gets a new region over its bar; none of them
 * reaches over a neighbour, and a looped region is never stretched this way. A region left with no notes is kept: an
 * empty region is the person's. A vocal part has no regions. The document itself when nothing changed.
 */
export function fitRegions(doc: EditDoc): EditDoc {
  const clock = beatClock(doc.tempo);
  let nextId = doc.nextId;
  let changed = false;
  const parts = doc.parts.map((p): Part => {
    if (p.vocal) {
      if (!p.regions) return p;
      changed = true;
      const { regions: _, ...rest } = p;
      return rest;
    }
    if (!p.notes.length && !p.regions?.length) return p;
    const regions = regionsOf(p);
    let notes = p.notes;
    let moved = false;
    notes = notes.map(n => {
      const r = regions.find(x => x.loop && holds(x, n.start) && n.start >= x.start + x.loop - EPS);
      if (!r) return n;
      moved = true;
      const into = (n.start - r.start) % r.loop!;
      return { ...n, start: round(r.start + (into > r.loop! - EPS ? 0 : into)) };
    });
    if (moved) {
      const seen = new Set<string>();
      notes = sortNotes(notes).filter(n => {
        const k = `${Math.round(n.start * 1000)} ${n.pitch}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    }
    let grew = false;
    for (const n of sortNotes(notes)) {
      if (regions.some(r => holds(r, n.start))) continue;
      grew = true;
      const bar = clock.barOfBeat(n.start);
      const bs = clock.barStartBeat(bar);
      const be = clock.barStartBeat(bar + 1);
      let i = regions.findIndex(r => r.start > n.start);
      if (i < 0) i = regions.length;
      const prev = regions[i - 1];
      const next = regions[i];
      const prevEnd = prev ? endOf(prev) : 0;
      const nextStart = next ? next.start : Infinity;
      if (prev && !prev.loop && prevEnd >= bs - EPS) regions[i - 1] = { ...prev, length: round(Math.min(be, nextStart) - prev.start) };
      else if (next && !next.loop && next.start <= be + EPS) {
        const s = Math.max(bs, prevEnd);
        regions[i] = { ...next, start: round(s), length: round(endOf(next) - s) };
      } else {
        const s = Math.max(bs, prevEnd);
        regions.splice(i, 0, { id: nextId++, start: round(s), length: round(Math.min(be, nextStart) - s) });
      }
    }
    const fresh = !p.regions && regions.length > 0;
    if (!moved && !grew && !fresh) return p;
    changed = true;
    return { ...p, notes: moved ? notes : p.notes, regions };
  });
  return changed ? { ...doc, parts, nextId } : doc;
}

/** The notes a part plays: its own, and each looped region's repeats marked `ghost` (cut off at the region's end). */
export function heardNotes(part: Part): (EditNote & { ghost?: true })[] {
  const out: (EditNote & { ghost?: true })[] = [...part.notes];
  for (const r of part.regions ?? []) {
    if (!r.loop) continue;
    const end = endOf(r);
    const base = part.notes.filter(n => n.start >= r.start - EPS && n.start < r.start + r.loop! - EPS);
    for (let k = 1; r.start + k * r.loop < end - EPS; k++) {
      for (const n of base) {
        const at = n.start + k * r.loop;
        if (at >= end - EPS) continue;
        out.push({ ...n, start: round(at), length: round(Math.min(n.length, end - at)), ghost: true });
      }
    }
  }
  return out.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
}

/** Every note that sounds, a loop's repeats as plain notes (what the score holds). */
export function expandLoops(part: Part): EditNote[] {
  return heardNotes(part).map(({ ghost: _, ...n }) => n);
}

/** The part's region holding `beat`, or null. */
export function regionAt(part: Part, beat: number): Region | null {
  return (part.regions ?? []).find(r => holds(r, beat)) ?? null;
}

/** A part with region `id`'s repeats made real notes (new ids) and the region no longer looped. */
function bake(p: Part, id: number, nextId: number): { part: Part; nextId: number } {
  const r = (p.regions ?? []).find(x => x.id === id);
  if (!r?.loop) return { part: p, nextId };
  const ghosts = heardNotes({ ...p, regions: [r] }).filter(n => n.ghost).map(({ ghost: _, ...n }) => ({ ...n, id: nextId++ }));
  const { loop: _, ...plain } = r;
  return { part: { ...p, notes: sortNotes([...p.notes, ...ghosts]), regions: (p.regions ?? []).map(x => (x.id === id ? plain : x)) }, nextId };
}

/** Region `region` cut in two at `at` (a loop is made real notes first); the right-hand part's id, or null when `at` is not inside it. */
export function splitRegion(doc: EditDoc, part: string, region: number, at: number): { doc: EditDoc; id: number } | null {
  const p = partOf(doc, part);
  const r = p?.regions?.find(x => x.id === region);
  if (!p || !r || at <= r.start + EPS || at >= endOf(r) - EPS) return null;
  let { part: q, nextId } = bake(p, region, doc.nextId);
  const id = nextId++;
  const regions = regionsOf(q).flatMap(x => (x.id === region
    ? [{ id: x.id, start: x.start, length: round(at - x.start) }, { id, start: round(at), length: round(endOf(x) - at) }]
    : [x]));
  q = { ...q, regions };
  return { doc: { ...withPart(doc, part, () => q), nextId }, id };
}

/** Region `region` joined with the next region (else the one before) into one over both and the gap between; loops are made real notes. */
export function joinRegion(doc: EditDoc, part: string, region: number): EditDoc | null {
  const p = partOf(doc, part);
  if (!p) return null;
  const list = regionsOf(p);
  const i = list.findIndex(x => x.id === region);
  if (i < 0) return null;
  const j = i + 1 < list.length ? i + 1 : i - 1;
  if (j < 0) return null;
  const [a, b] = i < j ? [list[i]!, list[j]!] : [list[j]!, list[i]!];
  let { part: q, nextId } = bake(p, a.id, doc.nextId);
  ({ part: q, nextId } = bake(q, b.id, nextId));
  const merged: Region = { id: a.id, start: a.start, length: round(endOf(b) - a.start) };
  q = { ...q, regions: regionsOf(q).filter(x => x.id !== b.id).map(x => (x.id === a.id ? merged : x)) };
  return { ...withPart(doc, part, () => q), nextId };
}

/**
 * The part with the beats from `from` to `to` cleared: regions inside go, regions over an edge are cut there (a loop
 * whose start would move is made real notes first), and every note starting inside goes.
 */
function clearSpan(p: Part, from: number, to: number, nextId: number): { part: Part; nextId: number } {
  let q = p;
  for (const r of regionsOf(p)) {
    if (!(r.start < to - EPS && endOf(r) > from + EPS)) continue;
    if (r.loop && endOf(r) > to + EPS) ({ part: q, nextId } = bake(q, r.id, nextId));
  }
  const regions: Region[] = [];
  for (const r of regionsOf(q)) {
    const end = endOf(r);
    if (!(r.start < to - EPS && end > from + EPS)) { regions.push(r); continue; }
    if (r.start < from - EPS) {
      const length = round(from - r.start);
      const left: Region = { ...r, length };
      if (left.loop !== undefined && left.loop >= length - EPS) delete left.loop;
      regions.push(left);
    }
    if (end > to + EPS) regions.push({ id: r.start < from - EPS ? nextId++ : r.id, start: round(to), length: round(end - to) });
  }
  const notes = q.notes.filter(n => !(n.start >= from - EPS && n.start < to - EPS));
  return { part: { ...q, notes, regions: regions.sort(byStart) }, nextId };
}

/** The part with region `r` and its notes laid in at `at`, the span it covers cleared first; the notes keep their ids. */
function layIn(doc: EditDoc, part: string, r: Region, notes: readonly EditNote[], at: number): EditDoc {
  const p = partOf(doc, part)!;
  const { part: q, nextId } = clearSpan(p, at, at + r.length, doc.nextId);
  const d = at - r.start;
  const placed: Region = { ...r, start: round(at) };
  const moved = notes.map(n => ({ ...n, start: round(n.start + d) }));
  const next: Part = { ...q, notes: sortNotes([...q.notes, ...moved]), regions: [...(q.regions ?? []), placed].sort(byStart) };
  return grow({ ...withPart(doc, part, () => next), nextId });
}

/**
 * Region `region` of part `from` moved to start at `at` on part `to` (which may be `from`), its notes and loop with it.
 * Whatever was in the target span is cleared first: regions over its edges are cut there and their notes inside go.
 */
export function moveRegion(doc: EditDoc, from: string, region: number, to: string, at: number): EditDoc {
  const src = partOf(doc, from);
  const dst = partOf(doc, to);
  const r = src?.regions?.find(x => x.id === region);
  if (!src || !dst || !r || dst.vocal) return doc;
  const start = Math.max(0, at);
  if (from === to && Math.abs(start - r.start) < EPS) return doc;
  const notes = src.notes.filter(n => holds(r, n.start));
  const ids = new Set(notes.map(n => n.id));
  const without = withPart(doc, from, p => ({ ...p, notes: p.notes.filter(n => !ids.has(n.id)), regions: regionsOf(p).filter(x => x.id !== region) }));
  return layIn(without, to, r, notes, start);
}

/** The first bar line at or after `beat` where `length` beats are free of the part's regions. */
function freePlace(clock: BeatClock, p: Part, beat: number, length: number): number {
  let bar = clock.barOfBeat(beat);
  if (clock.barStartBeat(bar) < beat - EPS) bar++;
  const busy = (s: number) => (p.regions ?? []).some(r => r.start < s + length - EPS && endOf(r) > s + EPS);
  while (busy(clock.barStartBeat(bar))) bar++;
  return clock.barStartBeat(bar);
}

/** A copy of region `region` and its notes in the next free place after it that starts on a bar line; the copy's id. */
export function duplicateRegion(doc: EditDoc, part: string, region: number): { doc: EditDoc; id: number } {
  const p = partOf(doc, part);
  const r = p?.regions?.find(x => x.id === region);
  if (!p || !r) return { doc, id: region };
  const at = freePlace(beatClock(doc.tempo), p, endOf(r), r.length);
  return pasteRegion(doc, part, copyRegion(doc, part, region, false), at);
}

/** Region `region` as a clip to paste: its length, loop and notes. */
export function copyRegion(doc: EditDoc, part: string, region: number, drums: boolean): RegionClip {
  const p = partOf(doc, part);
  const r = p?.regions?.find(x => x.id === region);
  if (!p || !r) return { kind: 'region', drums, length: 0, notes: [] };
  const clip: RegionClip = {
    kind: 'region', drums, length: r.length,
    notes: p.notes.filter(n => holds(r, n.start)).map(({ id: _, ...n }) => ({ ...n, start: round(n.start - r.start) })),
  };
  if (r.loop) clip.loop = r.loop;
  return clip;
}

/** A copied region pasted at `at` (the span cleared first), its notes new; the new region's id. */
export function pasteRegion(doc: EditDoc, part: string, clip: RegionClip, at: number): { doc: EditDoc; id: number } {
  const p = partOf(doc, part);
  if (!p || p.vocal || clip.length <= 0) return { doc, id: -1 };
  let nextId = doc.nextId;
  const start = Math.max(0, at);
  const r: Region = { id: nextId++, start: round(start), length: clip.length };
  if (clip.loop && clip.loop < clip.length - EPS) r.loop = clip.loop;
  const notes = clip.notes.map((n): EditNote => ({ ...n, id: nextId++, start: round(start + n.start) }));
  return { doc: layIn({ ...doc, nextId }, part, r, notes, start), id: r.id };
}

/**
 * Region `region` looped: its first stretch (its loop, or all of it) repeats until beat `to`, never over the next
 * region. A `to` at or before the first stretch's end unloops it.
 */
export function loopRegion(doc: EditDoc, part: string, region: number, to: number): EditDoc {
  const p = partOf(doc, part);
  const list = p ? regionsOf(p) : [];
  const i = list.findIndex(x => x.id === region);
  const r = list[i];
  if (!p || !r) return doc;
  const base = r.loop ?? r.length;
  const limit = list[i + 1]?.start ?? Infinity;
  const end = Math.min(to, limit);
  const next: Region = end <= r.start + base + EPS ? { id: r.id, start: r.start, length: base } : { id: r.id, start: r.start, length: round(end - r.start), loop: base };
  return grow(withPart(doc, part, q => ({ ...q, regions: list.map(x => (x.id === region ? next : x)) })));
}

/** Region `region` and its notes gone. */
export function deleteRegion(doc: EditDoc, part: string, region: number): EditDoc {
  const p = partOf(doc, part);
  const r = p?.regions?.find(x => x.id === region);
  if (!p || !r) return doc;
  return withPart(doc, part, q => ({ ...q, notes: q.notes.filter(n => !holds(r, n.start)), regions: regionsOf(q).filter(x => x.id !== region) }));
}
