// The Sound panel's edits: a part's Sound settings and Voice Effects, and The Whole Piece's loudness, Room and
// limiter. A setting put back to its default is left out of the score, so a piece that never uses the panel stays as
// it was. DOM-free.
import type { LaneFx, Mix, VoiceFx } from '../score.ts';
import { DEFAULT_ROOM_SEND } from '../render/fx.ts';
import { DEFAULT_MIX } from './doc.ts';
import type { EditDoc } from './doc.ts';

/** The defaults of a part's Sound settings: each one here is no change, and is left out when saved. */
export const FX_DEFAULTS = {
  volume_db: 0, pan: 0, bass: 0, middle: 0, treble: 0, echo: 0, repeats: 3, beats: 1, shimmer: 0, warmth: 0, cutoff: 1, even_out: 0, room: DEFAULT_ROOM_SEND,
} as const;

/** `fx` without the settings at their defaults (and empty groups dropped), or undefined when nothing is left. */
export function tidyFx(fx: LaneFx): LaneFx | undefined {
  const out: LaneFx = {};
  if (fx.volume_db) out.volume_db = fx.volume_db;
  if (fx.pan) out.pan = fx.pan;
  const eq = { ...(fx.eq?.bass ? { bass: fx.eq.bass } : {}), ...(fx.eq?.middle ? { middle: fx.eq.middle } : {}), ...(fx.eq?.treble ? { treble: fx.eq.treble } : {}) };
  if (Object.keys(eq).length) out.eq = eq;
  // Echo Repeats or its beat may be set before Echo Amount: the group is kept while any of them is off its default.
  const echo = { amount: fx.echo?.amount ?? FX_DEFAULTS.echo, repeats: fx.echo?.repeats ?? FX_DEFAULTS.repeats, beats: fx.echo?.beats ?? FX_DEFAULTS.beats };
  if (echo.amount !== FX_DEFAULTS.echo || echo.repeats !== FX_DEFAULTS.repeats || echo.beats !== FX_DEFAULTS.beats) out.echo = echo;
  if (fx.shimmer) out.shimmer = fx.shimmer;
  if (fx.warmth) out.warmth = fx.warmth;
  const cutoff = fx.brightness?.cutoff ?? 1;
  const sweep = fx.brightness?.sweep ?? 'off';
  if (cutoff < 1 || sweep !== 'off') out.brightness = { cutoff, sweep };
  if (fx.even_out) out.even_out = fx.even_out;
  if (fx.room !== undefined && fx.room !== FX_DEFAULTS.room) out.room = fx.room;
  if (fx.mute) out.mute = true;
  if (fx.solo) out.solo = true;
  return Object.keys(out).length ? out : undefined;
}

/** A part's Sound settings changed by `change` (merged over what it has). */
export function setLaneFx(doc: EditDoc, partId: string, change: (fx: LaneFx) => LaneFx): EditDoc {
  return {
    ...doc,
    parts: doc.parts.map(p => {
      if (p.id !== partId) return p;
      const fx = tidyFx(change(p.fx ?? {}));
      const { fx: _, ...rest } = p;
      return fx ? { ...rest, fx } : rest;
    }),
  };
}

/** A part's Voice Effects chain (at most four, in order); an empty chain is none. */
export function setVoice(doc: EditDoc, partId: string, chain: readonly VoiceFx[]): EditDoc {
  return {
    ...doc,
    parts: doc.parts.map(p => {
      if (p.id !== partId) return p;
      const { voice: _, ...rest } = p;
      return chain.length ? { ...rest, voice: chain.slice(0, 4).map(v => ({ ...v })) } : rest;
    }),
  };
}

/** The piece's mix as the document has it now. */
export const mixOf = (doc: EditDoc): Mix => doc.mix ?? doc.base?.mix ?? DEFAULT_MIX;

/** The Whole Piece changed: its loudness, Room (Dry is none) and limiter (off is none). */
export function setMix(doc: EditDoc, change: (m: Mix) => Mix): EditDoc {
  const next = change(JSON.parse(JSON.stringify(mixOf(doc))) as Mix);
  if (next.room && (next.room.preset === 'dry' || next.room.amount === 0)) delete next.room;
  if (next.limiter && !next.limiter.on) delete next.limiter;
  return { ...doc, mix: next };
}

/** A new effect for a chain, with its usual settings; a carrier is the first other part. */
export function newVoiceFx(effect: VoiceFx['effect'], carrier: string): VoiceFx {
  switch (effect) {
    case 'vocoder': return { effect, carrier, bands: 16 };
    case 'talkbox': return { effect, carrier, mix: 0.8 };
    case 'autotune': return { effect, strength: 0.5, retune_ms: 50 };
    case 'harmonizer': return { effect, voices: ['third'], mix: 0.5 };
    case 'pitch': return { effect, semitones: 0, formant: 0 };
    case 'robot': return { effect, mix: 1 };
    case 'whisper': return { effect, mix: 0.7 };
  }
}
