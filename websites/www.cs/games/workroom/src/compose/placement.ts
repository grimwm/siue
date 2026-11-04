// Where a dragged or tapped effect lands on the timeline. Effects that are their own sound (a riser, a snare roll, an
// impact, vinyl crackle) sit on the Effects row over the whole piece; every other effect changes a track's sound, on
// the track it is dropped on or, dropped on the Effects row, on the whole song. A riser builds into the bar line
// nearest the drop; the rest start on the beat. The target says in words where it will go, or why it cannot. Also what
// each track row and the Effects row draw. DOM-free.
import { beatClock } from './beats.ts';
import { clipsOf, placeClip, pos } from './djclips.ts';
import { fxInfo } from './djcatalogue.ts';
import { barPosOfBeat, barsNeeded, beatOfBarPos } from './doc.ts';
import type { EditDoc } from './doc.ts';
import { WHOLE_PIECE_EFFECTS } from '../score.ts';
import type { FxClip, FxClipEffect } from '../score.ts';

export type FxRow = 'lane' | 'track';
/** Where an effect would land: on `lane` (null: the whole piece) over bars `from_bar` to `to_bar`; `bad` says why it cannot. */
export interface Target { effect: FxClipEffect; lane: string | null; from_bar: number; to_bar: number; label: string; bad: string | null }

/** The effects that are a sound of their own rather than a change to a track's sound. */
const OWN_SOUND: readonly FxClipEffect[] = ['riser', 'snare_roll', 'impact', 'vinyl'];
/** Track effects that make no sense on the whole song, and what to say when one is dropped there. */
const NEEDS_TRACK: Partial<Record<FxClipEffect, string>> = {
  crossfader: 'A crossfade goes on the track that fades out',
  vocoder: 'A vocoder goes on the track that sings the words',
  pitch_shift: 'Pitch Shift goes on the track it moves',
  harmonizer: 'The Harmonizer goes on the track it sings with',
  autotune: 'Pitch Correction goes on the track it corrects',
};

/** The row an effect belongs on: 'lane' (the Effects row) for an effect that is its own sound, else 'track'. */
export function fxRow(effect: FxClipEffect): FxRow {
  return OWN_SOUND.includes(effect) ? 'lane' : 'track';
}

/** "bar 3", or "bar 2 beat 3" off the bar line. */
function when(doc: EditDoc, at: number): string {
  const clock = beatClock(doc.tempo);
  const bar = Math.floor(at + 1e-9);
  const beat = Math.floor(beatOfBarPos(clock, at) - clock.barStartBeat(bar) + 1e-6) + 1;
  return beat === 1 ? `bar ${bar}` : `bar ${bar} beat ${beat}`;
}

/**
 * Where `effect` dropped on `row` ('lane' for the Effects row, else a part's id) at `beat` would land, for its usual
 * length and inside the piece.
 */
export function targetFor(doc: EditDoc, effect: FxClipEffect, row: 'lane' | string, beat: number): Target {
  const clock = beatClock(doc.tempo);
  const end = barsNeeded(doc) + 1;
  const len = Math.min(fxInfo(effect).bars, end - 1);
  const name = fxInfo(effect).name;
  let lane: string | null = null;
  let where = 'Whole Song';
  let bad: string | null = null;
  const part = row === 'lane' ? undefined : doc.parts.find(p => p.id === row);
  if (fxRow(effect) === 'lane') where = 'Effects';
  else if (row === 'lane') bad = NEEDS_TRACK[effect] ?? null;
  else if (!part) bad = 'That track is no longer in the piece';
  else if (effect === 'crossfader' || !WHOLE_PIECE_EFFECTS.includes(effect)) {
    lane = part.id;
    where = part.name;
    if (effect === 'vocoder' && !doc.parts.some(p => p.id !== part.id)) bad = 'A vocoder needs another track to sing through';
  }
  const at = barPosOfBeat(clock, Math.max(0, beat));
  let from: number;
  let to: number;
  let said: string;
  if (effect === 'riser') {
    to = Math.min(end, Math.max(1 + len, Math.round(at)));
    from = pos(to - len);
    said = `builds into bar ${to}`;
  } else {
    from = pos(Math.max(1, Math.min(end - len, barPosOfBeat(clock, Math.floor(Math.max(0, beat) + 1e-6)))));
    to = pos(from + len);
    said = when(doc, from);
  }
  return { effect, lane, from_bar: from, to_bar: to, label: `${name} · ${where} · ${said}`, bad };
}

/**
 * The effect placed where the target says, with what it needs; its index among the clips, or null when the target is
 * bad. A crossfader on a track fades that track out: { a: [the track], b: [], fade: true, silent: true }. A vocoder
 * sings through the first other part.
 */
export function placeTarget(doc: EditDoc, t: Target): { doc: EditDoc; index: number } | null {
  if (t.bad) return null;
  const fader = t.effect === 'crossfader';
  if (fader && t.lane === null) return null;
  const placed = placeClip(doc, t.effect, fader ? null : t.lane, t.from_bar, t.to_bar - t.from_bar);
  const index = clipsOf(placed).length - 1;
  if (!fader) return { doc: placed, index };
  const clips = clipsOf(placed).map((c, i): FxClip => (i === index ? { ...c, settings: { a: [t.lane!], b: [], fade: true, silent: true } } : c));
  return { doc: { ...placed, fxClips: clips }, index };
}

type Shape = 'down' | 'up' | 'block';
const shapeOf = (c: FxClip): Shape => (c.effect === 'filter_sweep' ? ((c.settings?.['mode'] ?? 'highpass_up') === 'highpass_up' ? 'up' : 'down') : 'block');

/**
 * What a track row draws: the part's own track effects, the whole song's track effects (on every part), and each
 * crossfader as a fall on its A parts and a rise on its B parts. A Filter Sweep rises (Highpass Up) or falls (Lowpass
 * Down); everything else is a block.
 */
export function clipsOnPart(doc: EditDoc, part: string): { index: number; clip: FxClip; shape: Shape }[] {
  return clipsOf(doc).flatMap((clip, index) => {
    if (clip.effect === 'crossfader') {
      const a = (clip.settings?.['a'] as string[] | undefined) ?? [];
      const b = (clip.settings?.['b'] as string[] | undefined) ?? [];
      if (a.includes(part)) return [{ index, clip, shape: 'down' as const }];
      if (b.includes(part)) return [{ index, clip, shape: 'up' as const }];
      return [];
    }
    if (fxRow(clip.effect) === 'lane') return [];
    return clip.lane === part || clip.lane === null ? [{ index, clip, shape: shapeOf(clip) }] : [];
  });
}

/** The Effects row's clips (the ones that are their own sound), stacked into rows so overlapping clips never cover each other. */
export function laneClips(doc: EditDoc): { index: number; clip: FxClip; row: number }[] {
  const own = clipsOf(doc).map((clip, index) => ({ clip, index })).filter(x => fxRow(x.clip.effect) === 'lane')
    .sort((a, b) => a.clip.from_bar - b.clip.from_bar || a.index - b.index);
  const ends: number[] = [];
  return own.map(({ clip, index }) => {
    let row = ends.findIndex(e => e <= clip.from_bar + 1e-9);
    if (row < 0) row = ends.length;
    ends[row] = clip.to_bar;
    return { index, clip, row };
  }).sort((a, b) => a.index - b.index);
}
