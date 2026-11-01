// DJ & Effects' edits on the document: place an effect over bars, move a clip, drag or step its end, change where it
// plays and its settings, remove it, and land a recorded performance as clips in one step. Positions are bar
// positions to 1/1000 of a bar, kept inside the piece; a clip's settings left at the effect's defaults are left out.
// DOM-free.
import { barsNeeded } from './doc.ts';
import type { EditDoc } from './doc.ts';
import { fxInfo } from './djcatalogue.ts';
import { FX_DEFAULTS } from '../render/djfx.ts';
import { MIN_CLIP_BARS, WHOLE_PIECE_EFFECTS } from '../score.ts';
import type { FxClip, FxClipEffect } from '../score.ts';

export const pos = (x: number): number => Math.round(x * 1000) / 1000;

/** The document's clips. */
export const clipsOf = (doc: EditDoc): FxClip[] => doc.fxClips ?? [];

const withClips = (doc: EditDoc, clips: FxClip[]): EditDoc => ({ ...doc, fxClips: clips });

/** The last bar position a clip may reach: the end of the piece. */
const endOf = (doc: EditDoc): number => barsNeeded(doc) + 1;

/** A clip kept inside the piece, at least MIN_CLIP_BARS long. */
function fit(doc: EditDoc, c: FxClip): FxClip {
  const end = endOf(doc);
  const len = Math.max(MIN_CLIP_BARS, c.to_bar - c.from_bar);
  const from = pos(Math.min(Math.max(1, c.from_bar), end - Math.min(len, end - 1)));
  const to = pos(Math.min(end, Math.max(from + MIN_CLIP_BARS, from + len)));
  const points = c.points?.map(p => [pos(Math.min(to, Math.max(from, p[0]!))), ...p.slice(1)]);
  return { ...c, from_bar: from, to_bar: to, ...(points ? { points } : {}) };
}

/** The settings an effect starts with on a new clip: none, except what it needs (a carrier, the fader's sides, a cue, a bar to loop). */
function needed(doc: EditDoc, effect: FxClipEffect, lane: string | null, at: number): Record<string, unknown> | undefined {
  const ids = doc.parts.map(p => p.id);
  switch (effect) {
    case 'vocoder': {
      const carrier = ids.find(id => id !== lane);
      return carrier ? { carrier } : undefined;
    }
    case 'crossfader': {
      const half = Math.max(1, Math.floor(ids.length / 2));
      return { a: ids.slice(0, half), b: ids.slice(half) };
    }
    case 'hot_cue': return { cue_bar: 1 };
    case 'looper': return { bars: [Math.max(1, Math.floor(at) - 1)] };
    default: return undefined;
  }
}

/** Whether the effect can be placed now: a vocoder needs another part, the Crossfader two parts. */
export function canPlace(doc: EditDoc, effect: FxClipEffect, lane: string | null): boolean {
  if (effect === 'vocoder') return lane !== null && doc.parts.some(p => p.id !== lane);
  if (effect === 'crossfader') return doc.parts.length >= 2;
  return true;
}

/** `effect` placed from bar position `at` for its usual length, on `lane` (null: the whole piece). */
export function placeClip(doc: EditDoc, effect: FxClipEffect, lane: string | null, at: number, bars = fxInfo(effect).bars): EditDoc {
  const onLane = WHOLE_PIECE_EFFECTS.includes(effect) ? null : lane;
  const clip: FxClip = { effect, lane: onLane, from_bar: pos(at), to_bar: pos(at + bars) };
  const s = needed(doc, effect, onLane, at);
  if (s) clip.settings = s;
  return withClips(doc, [...clipsOf(doc), fit(doc, clip)]);
}

/** Clip `i` moved to start at `at`, keeping its length (its recorded moves move with it). */
export function moveClip(doc: EditDoc, i: number, at: number): EditDoc {
  const c = clipsOf(doc)[i];
  if (!c) return doc;
  const d = at - c.from_bar;
  const moved: FxClip = { ...c, from_bar: c.from_bar + d, to_bar: c.to_bar + d, ...(c.points ? { points: c.points.map(p => [p[0]! + d, ...p.slice(1)]) } : {}) };
  return withClips(doc, clipsOf(doc).map((x, j) => (j === i ? fit(doc, moved) : x)));
}

/** Clip `i`'s end dragged to `to`. */
export function resizeClip(doc: EditDoc, i: number, to: number): EditDoc {
  const c = clipsOf(doc)[i];
  if (!c) return doc;
  // The start stays put: the end alone is held inside the piece.
  const end = Math.min(endOf(doc), Math.max(c.from_bar + MIN_CLIP_BARS, to));
  return withClips(doc, clipsOf(doc).map((x, j) => (j === i ? fit(doc, { ...c, to_bar: end }) : x)));
}

/** Clip `i` one beat shorter (`by` −1) or longer (+1); never shorter than a beat's worth that is left. */
export function stepClip(doc: EditDoc, i: number, by: 1 | -1): EditDoc {
  const c = clipsOf(doc)[i];
  if (!c) return doc;
  let meter = doc.tempo[0]!;
  for (const t of doc.tempo) if (t.bar <= c.from_bar) meter = t;
  const beat = 1 / meter.beats;
  const to = by > 0 ? c.to_bar + beat : Math.max(c.from_bar + Math.min(beat, c.to_bar - c.from_bar), c.to_bar - beat);
  return resizeClip(doc, i, to);
}

export function removeClip(doc: EditDoc, i: number): EditDoc {
  return withClips(doc, clipsOf(doc).filter((_, j) => j !== i));
}

/** Clip `i`'s setting `key` set to `value`; back at its default, it is left out. */
export function setClipSetting(doc: EditDoc, i: number, key: string, value: unknown): EditDoc {
  const c = clipsOf(doc)[i];
  if (!c) return doc;
  const s = { ...(c.settings ?? {}), [key]: value };
  if (JSON.stringify(FX_DEFAULTS[c.effect][key]) === JSON.stringify(value)) delete s[key];
  const { settings: _, ...rest } = c;
  const next: FxClip = Object.keys(s).length ? { ...rest, settings: s } : rest;
  return withClips(doc, clipsOf(doc).map((x, j) => (j === i ? next : x)));
}

/** Clip `i` played on `lane` instead (null: the whole piece); the whole-piece tools stay on the whole piece. */
export function setClipLane(doc: EditDoc, i: number, lane: string | null): EditDoc {
  const c = clipsOf(doc)[i];
  if (!c || WHOLE_PIECE_EFFECTS.includes(c.effect)) return doc;
  if (c.effect === 'vocoder' && (lane === null || c.settings?.['carrier'] === lane)) return doc;
  return withClips(doc, clipsOf(doc).map((x, j) => (j === i ? { ...c, lane } : x)));
}

/** A performance's clips added at once: one Undo step. */
export function addClips(doc: EditDoc, clips: readonly FxClip[]): EditDoc {
  if (!clips.length) return doc;
  return withClips(doc, [...clipsOf(doc), ...clips.map(c => fit(doc, c))]);
}

/** Clips without a part: its own go, a vocoder it carried goes, and it leaves a crossfader's sides (an empty side drops the fader). */
export function forgetPart(clips: readonly FxClip[], part: string): FxClip[] {
  return clips.flatMap((c): FxClip[] => {
    if (c.lane === part || (c.effect === 'vocoder' && c.settings?.['carrier'] === part)) return [];
    if (c.effect !== 'crossfader') return [c];
    const a = (c.settings?.['a'] as string[] ?? []).filter(x => x !== part);
    const b = (c.settings?.['b'] as string[] ?? []).filter(x => x !== part);
    return a.length && b.length ? [{ ...c, settings: { ...c.settings, a, b } }] : [];
  });
}

/**
 * The clips a score can keep: each on a part that is still there, a vocoder's carrier another part, a crossfader's
 * sides parts of the piece (a side left empty drops the clip), inside the piece's bars.
 */
export function savedClips(clips: readonly FxClip[], laneIds: ReadonlySet<string>, bars: number): FxClip[] {
  const out: FxClip[] = [];
  for (const c of clips) {
    if (c.lane !== null && !laneIds.has(c.lane)) continue;
    const s = c.settings;
    if (c.effect === 'vocoder' && (!laneIds.has(s?.['carrier'] as string) || s?.['carrier'] === c.lane)) continue;
    let settings = s ? { ...s } : undefined;
    if (c.effect === 'crossfader') {
      const a = (s?.['a'] as string[] ?? []).filter(x => laneIds.has(x));
      const b = (s?.['b'] as string[] ?? []).filter(x => laneIds.has(x) && !a.includes(x));
      if (!a.length || !b.length) continue;
      settings = { ...settings, a, b };
    }
    if (c.effect === 'hot_cue' && (s?.['cue_bar'] as number) >= bars + 1) continue;
    if (c.effect === 'looper') {
      const bs = (s?.['bars'] as number[] ?? []).filter(b => b <= bars);
      if (!bs.length) continue;
      settings = { ...settings, bars: bs };
    }
    const from = pos(Math.min(c.from_bar, bars + 1 - MIN_CLIP_BARS));
    const to = pos(Math.min(c.to_bar, bars + 1));
    if (to - from < MIN_CLIP_BARS - 1e-9) continue;
    const clip: FxClip = { effect: c.effect, lane: c.lane, from_bar: from, to_bar: to };
    if (settings && Object.keys(settings).length) clip.settings = settings;
    if (c.points?.length) {
      const pts = c.points.filter(p => p[0]! >= from && p[0]! <= to);
      if (pts.length >= 2) clip.points = pts.map(p => [...p]);
    }
    out.push(clip);
  }
  return out;
}
