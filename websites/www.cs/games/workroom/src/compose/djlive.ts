// DJ Mode's deck: the piece, rendered once, played sample by sample through the same processors the renderer uses
// (render/djfx.ts), so a held pad sounds as its clip will. The deck's clock always runs on in the piece's time: a
// scratch, a hot cue or a stutter reads elsewhere while it lasts and lets go back in time ("carry on in time"). The
// Crossfader moves between two stems (side A's parts and side B's); the Looper loops bars of the piece. With Record
// To Timeline on, everything played lands as clips in bar positions, ready for the timeline in one Undo step. The deck
// goes round: at the end of the piece it plays on from bar 1, letting go of what is held there.
// DOM-free: the audio callback calls `process`.
import { makeClip } from '../render/djfx.ts';
import type { BarMap, ClipProc } from '../render/djfx.ts';
import { MAX_FX_POINTS } from '../score.ts';
import type { FxClip, FxClipEffect } from '../score.ts';
import { pos } from './djclips.ts';

/** A Performance Pad: its effect and settings, its two-line label, and the key that plays it. */
export interface Pad { effect: FxClipEffect; settings: Record<string, unknown>; top: string; bottom: string; key: string }
export const PADS: readonly Pad[] = [
  { effect: 'stutter', settings: { slice: 4 }, top: 'Repeat', bottom: '1/4', key: '1' },
  { effect: 'stutter', settings: { slice: 8 }, top: 'Repeat', bottom: '1/8', key: '2' },
  { effect: 'stutter', settings: { slice: 16 }, top: 'Repeat', bottom: '1/16', key: '3' },
  { effect: 'stutter', settings: { slice: 32 }, top: 'Repeat', bottom: '1/32', key: '4' },
  { effect: 'tape_stop', settings: { time: 'fast' }, top: 'Tape', bottom: 'Stop', key: 'q' },
  { effect: 'spinback', settings: { throw: 'hard' }, top: 'Spin', bottom: 'Back', key: 'w' },
  { effect: 'reverse', settings: { length: 'beat' }, top: 'Reverse', bottom: 'Hold', key: 'e' },
  { effect: 'echo_out', settings: { time: 'dotted_eighth' }, top: 'Echo', bottom: 'Out', key: 'r' },
  { effect: 'riser', settings: { climb: 2 }, top: 'Riser', bottom: 'Hold', key: 'a' },
  { effect: 'filter_sweep', settings: { mode: 'highpass_up' }, top: 'Filter', bottom: 'Up', key: 's' },
  { effect: 'sidechain', settings: { depth: 0.9 }, top: 'Pump', bottom: 'Duck', key: 'd' },
  { effect: 'trance_gate', settings: { pattern: 'classic' }, top: 'Trance', bottom: 'Gate', key: 'f' },
  { effect: 'bitcrusher', settings: { crunch: 0.75 }, top: 'Bit', bottom: 'Crush', key: 'z' },
  { effect: 'flanger', settings: { speed: 'jet' }, top: 'Flanger', bottom: 'Jet', key: 'x' },
  { effect: 'wide_8d', settings: { circle: 'bar' }, top: '8D', bottom: 'Circle', key: 'c' },
  { effect: 'impact', settings: { kind: 'impact' }, top: 'Impact', bottom: 'Hit', key: 'v' },
];
/** The XY Pad's modes: the effect it plays, and what X and Y move. */
export const XY_MODES: readonly { effect: FxClipEffect; name: string; x: string; y: string }[] = [
  { effect: 'filter', name: 'Filter', x: 'Cutoff', y: 'Resonance' },
  { effect: 'ping_pong', name: 'Echo', x: 'Amount', y: 'Feedback' },
  { effect: 'bitcrusher', name: 'Crush', x: 'Bits', y: 'Sample Rate' },
  { effect: 'flanger', name: 'Flanger', x: 'Mix', y: 'Speed' },
  { effect: 'wobble', name: 'Wobble', x: 'Speed', y: 'Depth' },
];

/** Pads that start on the sixteenth-note grid, so a repeat or a gate lands in time. */
const ON_GRID: readonly FxClipEffect[] = ['stutter', 'trance_gate', 'reverse', 'echo_out'];
/** Pads that build to the end of the next bar and stop there by themselves if still held. */
const TO_BAR_END: readonly FxClipEffect[] = ['riser', 'filter_sweep', 'snare_roll', 'tape_stop'];
/** A recorded move keeps a point this often, in seconds. */
const MOVE_EVERY = 0.03;

export interface DeckSound { rate: number; full: readonly Float32Array[]; a?: readonly Float32Array[]; b?: readonly Float32Array[] }
/** What the deck's owner is told: a clip landed in the recording, or the looper or playing state changed. */
export interface DeckEvents { changed?(): void }

interface Running { proc: ClipProc; clip: FxClip; from: number }

export interface Deck {
  readonly rate: number;
  playing(): boolean;
  /** The bar position the deck is at. */
  bar(): number;
  play(fromBar?: number): void;
  stop(): void;
  /** Fills one block of output from the deck's clock on. */
  process(l: Float32Array, r: Float32Array): void;
  padDown(id: string, effect: FxClipEffect, settings: Record<string, unknown>): void;
  padUp(id: string): void;
  /** The platter's speed while a hand is on it (1 is normal, negative is backwards); null when let go. */
  platter(rate: number | null): void;
  /** The Crossfader's position, 0 (A) to 1 (B); null puts the whole piece back. */
  fader(pos: number | null): void;
  /** The XY Pad: its effect, and x and y from 0 to 1 while touched; null when let go. */
  xy(effect: FxClipEffect, x: number, y: number): void;
  xyUp(): void;
  /** Sets hot cue k at the bar now (to the beat). */
  setCue(k: number): void;
  cues(): readonly (number | null)[];
  cueDown(k: number): void;
  cueUp(k: number): void;
  /** The Looper: Record 1 Bar (on the next bar), Layer (another bar on top), Mute Deck, Clear. */
  loopRecord(): void;
  loopLayer(): void;
  loopMute(): void;
  loopClear(): void;
  looper(): { bars: number[]; mute: boolean; waiting: boolean };
  /** Record To Timeline: on starts a recording; off ends it and gives back what was played, as clips. */
  record(on: boolean): FxClip[];
  recording(): boolean;
}

export function createDeck(sound: DeckSound, bars: BarMap, sides: { a: string[]; b: string[] } | null, events: DeckEvents = {}): Deck {
  const { rate, full } = sound;
  const n = full[0]!.length;
  let t = 0;
  let on = false;
  let rec: FxClip[] | null = null;
  const running = new Map<string, Running>();
  const cues: (number | null)[] = [null, null, null, null];
  let platterRate: number | null = null;
  let faderPos: number | null = null;
  let faderPts: number[][] | null = null;
  let faderFrom = 0;
  let xyNow: [number, number] = [0.5, 0.5];
  let loop: { bars: number[]; mute: boolean; pending: 'record' | 'layer' | null; pendingBar: number } = { bars: [], mute: false, pending: null, pendingBar: 0 };
  let lastMove = -Infinity;
  const env = { rate, src: full, bars };
  const barNow = (): number => pos(bars.bar(t));
  /** What a running effect has played so far, as a clip in bar positions; null when too short to keep. */
  const asClip = (r: Running, end: number): FxClip | null => {
    const clip: FxClip = { ...r.clip, from_bar: pos(bars.bar(r.proc.start)), to_bar: pos(bars.bar(end)) };
    if (clip.to_bar - clip.from_bar < 1 / 64 - 1e-9) return null;
    if (clip.points) {
      const pts = thin(clip.points.filter(p => p[0]! >= clip.from_bar && p[0]! <= clip.to_bar));
      if (pts.length < 2) delete clip.points;
      else clip.points = pts.map(p => [...p]);
    }
    if (clip.effect === 'scratch' && !clip.points) return null;
    return clip;
  };
  const close = (id: string, at = t) => {
    const r = running.get(id);
    if (!r) return;
    r.proc.end = Math.min(r.proc.end, at);
    running.delete(id);
    const clip = rec ? asClip(r, r.proc.end) : null;
    if (clip) rec!.push(clip);
    tails.push(r.proc);
  };
  /** Processors let go and still ringing (an echo's tail). */
  const tails: ClipProc[] = [];
  const open = (id: string, clip: FxClip, start: number, end: number, mv?: (i: number, k: number) => number) => {
    close(id);
    const proc = makeClip(clip, env, { start, end, ...(mv ? { mv } : {}) });
    running.set(id, { proc, clip, from: start });
  };
  const nextBarStart = (): number => Math.round(bars.sample(Math.floor(bars.bar(t) + 1e-9) + 1));
  const startLoop = (at: number) => {
    if (!loop.bars.length) return;
    open('looper', { effect: 'looper', lane: null, from_bar: 1, to_bar: 2, settings: { bars: [...loop.bars], mute_deck: loop.mute } }, at, Infinity);
  };
  const deck: Deck = {
    rate,
    playing: () => on,
    bar: barNow,
    play(fromBar = 1) { t = Math.max(0, Math.round(bars.sample(fromBar))); on = true; events.changed?.(); },
    stop() {
      for (const id of [...running.keys()]) close(id);
      on = false;
      events.changed?.();
    },
    process(l, r) {
      const x = [0, 0];
      for (let k = 0; k < l.length; k++) {
        if (!on) { l[k] = 0; r[k] = 0; continue; }
        // The deck goes round: at the end of the piece what is held lets go there, and it plays on from bar 1.
        if (t >= n) {
          for (const id of [...running.keys()]) close(id, n);
          tails.length = 0;
          if (faderPos !== null) { const keep = faderPos; deck.fader(null); deck.fader(keep); }
          t = 0;
        }
        if (loop.pending && t >= loop.pendingBar) {
          // The bar starting now is the one recorded; it loops from the bar after it.
          const b = Math.floor(bars.bar(loop.pendingBar) + 1e-9);
          loop = { ...loop, bars: loop.pending === 'record' ? [b] : [...loop.bars, b].slice(-4), pending: null };
          startLoop(Math.round(bars.sample(b + 1)));
          events.changed?.();
        }
        if (faderPos !== null && sound.a && sound.b) {
          const ga = Math.min(1, Math.max(0, 2 - 2 * faderPos));
          const gb = Math.min(1, Math.max(0, 2 * faderPos));
          x[0] = sound.a[0]![t]! * ga + sound.b[0]![t]! * gb;
          x[1] = sound.a[1]![t]! * ga + sound.b[1]![t]! * gb;
        } else {
          x[0] = full[0]![t]!;
          x[1] = full[1]![t]!;
        }
        for (const p of tails) if (t < p.end + p.tail) p.tick(t, x);
        for (const { proc } of running.values()) proc.tick(t, x);
        // A pad that stops by itself (a riser at the end of its bar) is let go there.
        for (const [id, r] of [...running]) if (t + 1 >= r.proc.end) close(id, r.proc.end);
        l[k] = x[0]!;
        r[k] = x[1]!;
        if (rec && t - lastMove >= MOVE_EVERY * rate) {
          lastMove = t;
          const b = barNow();
          const pl = running.get('platter');
          if (pl && platterRate !== null) pl.clip.points!.push([b, Math.max(-8, Math.min(8, Math.round(platterRate * 1000) / 1000))]);
          const xr = running.get('xy');
          if (xr) xr.clip.points!.push([b, Math.round(xyNow[0] * 1000) / 1000, Math.round(xyNow[1] * 1000) / 1000]);
          if (faderPts && faderPos !== null) faderPts.push([b, Math.round(faderPos * 1000) / 1000]);
        }
        t++;
      }
      for (let k = tails.length - 1; k >= 0; k--) if (t >= tails[k]!.end + tails[k]!.tail) tails.splice(k, 1);
    },
    padDown(id, effect, settings) {
      if (!on) return;
      const sixteenth = (bars.beatSeconds(barNow()) * rate) / 4;
      const start = ON_GRID.includes(effect) ? Math.floor(t / sixteenth) * sixteenth : t;
      const end = TO_BAR_END.includes(effect) ? Math.round(bars.sample(Math.floor(bars.bar(t) + 1e-9) + 2)) : Infinity;
      open(`pad:${id}`, { effect, lane: null, from_bar: 1, to_bar: 2, settings: { ...settings } }, Math.round(start), end);
    },
    padUp(id) { close(`pad:${id}`); },
    platter(r) {
      if (!on) return;
      if (r === null) { platterRate = null; close('platter'); return; }
      platterRate = r;
      if (!running.has('platter')) open('platter', { effect: 'scratch', lane: null, from_bar: 1, to_bar: 2, points: [[barNow(), r]] }, t, Infinity, () => platterRate ?? 1);
    },
    fader(p) {
      if (p === null) {
        if (rec && faderPts && faderPts.length >= 2 && sides) {
          rec.push({ effect: 'crossfader', lane: null, from_bar: faderFrom, to_bar: Math.max(barNow(), faderFrom + 1 / 64), settings: { a: [...sides.a], b: [...sides.b] }, points: thin(faderPts) });
        }
        faderPos = null;
        faderPts = null;
        return;
      }
      if (faderPos === null) { faderFrom = barNow(); faderPts = rec ? [[faderFrom, Math.round(p * 1000) / 1000]] : null; }
      faderPos = p;
    },
    xy(effect, x, y) {
      xyNow = [x, y];
      const cur = running.get('xy');
      if (cur && cur.clip.effect === effect) return;
      if (!on) return;
      open('xy', { effect, lane: null, from_bar: 1, to_bar: 2, points: [[barNow(), x, y]] }, t, Infinity, (_i, k) => xyNow[k]!);
    },
    xyUp() { close('xy'); },
    setCue(k) {
      const beatBars = 1 / bars.beats(barNow());
      cues[k] = pos(Math.round(barNow() / beatBars) * beatBars);
      events.changed?.();
    },
    cues: () => cues,
    cueDown(k) {
      const c = cues[k];
      if (!on || c == null) return;
      open(`cue:${k}`, { effect: 'hot_cue', lane: null, from_bar: 1, to_bar: 2, settings: { cue_bar: c } }, t, Infinity);
    },
    cueUp(k) { close(`cue:${k}`); },
    loopRecord() { if (on) { close('looper'); loop = { bars: [], mute: loop.mute, pending: 'record', pendingBar: nextBarStart() }; events.changed?.(); } },
    loopLayer() { if (on && loop.bars.length && loop.bars.length < 4) { loop = { ...loop, pending: 'layer', pendingBar: nextBarStart() }; events.changed?.(); } },
    loopMute() {
      loop = { ...loop, mute: !loop.mute };
      if (running.has('looper')) { close('looper'); startLoop(t); }
      events.changed?.();
    },
    loopClear() { close('looper'); loop = { bars: [], mute: false, pending: null, pendingBar: 0 }; events.changed?.(); },
    looper: () => ({ bars: [...loop.bars], mute: loop.mute, waiting: loop.pending !== null }),
    record(want) {
      if (want) {
        rec = [];
        // Whatever is already held is recorded from now.
        for (const r of running.values()) r.proc.start = t;
        if (faderPos !== null) { faderFrom = barNow(); faderPts = [[faderFrom, Math.round(faderPos * 1000) / 1000]]; }
        return [];
      }
      if (!rec) return [];
      // What is still held is kept up to now and carries on unrecorded.
      for (const r of running.values()) { const c = asClip(r, t); if (c) rec.push(c); }
      if (faderPos !== null && faderPts && faderPts.length >= 2 && sides) {
        rec.push({ effect: 'crossfader', lane: null, from_bar: faderFrom, to_bar: Math.max(barNow(), faderFrom + 1 / 64), settings: { a: [...sides.a], b: [...sides.b] }, points: thin(faderPts) });
      }
      faderPts = null;
      const out = rec;
      rec = null;
      return out.sort((a, b) => a.from_bar - b.from_bar);
    },
    recording: () => rec !== null,
  };
  return deck;
}

/** At most MAX_FX_POINTS points, evenly chosen, the first and last kept. */
function thin(pts: number[][]): number[][] {
  if (pts.length <= MAX_FX_POINTS) return pts;
  return Array.from({ length: MAX_FX_POINTS }, (_, i) => pts[Math.round((i * (pts.length - 1)) / (MAX_FX_POINTS - 1))]!);
}
