// A Vocal Track's edits, each a pure function from one document to the next (history.ts keeps them for Undo): a vocal
// part, its takes, and clips of them placed, trimmed, split, made louder or softer and faded. All in seconds: a voice
// does not stretch when the piece's speed changes. The takes themselves are never altered. DOM-free.
import type { EditDoc, Part } from './doc.ts';
import { MAX_CLIPS, MAX_TAKES, VOCAL_INSTRUMENT } from '../score.ts';
import type { VocalClip, VocalTake } from '../score.ts';

/** The shortest clip a trim or a split leaves. */
export const MIN_CLIP = 0.05;
export const CLIP_GAIN: readonly [number, number] = [-24, 12];
export const MAX_FADE = 10;

const round = (x: number): number => Math.round(x * 1000) / 1000;
const clamp = (x: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, x));

function withVocal(doc: EditDoc, partId: string, change: (p: Part & { vocal: NonNullable<Part['vocal']> }) => Part): EditDoc {
  return { ...doc, parts: doc.parts.map(p => (p.id === partId && p.vocal ? change(p as Part & { vocal: NonNullable<Part['vocal']> }) : p)) };
}
const sortClips = (clips: VocalClip[]): VocalClip[] => [...clips].sort((a, b) => a.at - b.at);

/** A clip's fades kept inside it: each at most MAX_FADE, together no longer than the clip. */
function fitFades(c: VocalClip): VocalClip {
  const len = c.to - c.from;
  let fade_in = clamp(c.fade_in, 0, MAX_FADE), fade_out = clamp(c.fade_out, 0, MAX_FADE);
  if (fade_in + fade_out > len) {
    const k = len / (fade_in + fade_out);
    fade_in = round(fade_in * k * 0.999);
    fade_out = round(fade_out * k * 0.999);
  }
  return { ...c, fade_in, fade_out };
}

/** A vocal part with no takes yet; `id` must be new to the document. */
export function newVocalPart(id: string, name: string, color: string): Part {
  return {
    id, name, color, family: 'voice', icon: 'voice', instrument: VOCAL_INSTRUMENT, gain_db: 0, attack: 0, release: 0, notes: [],
    speed: 'follow', dynamics: null, vocal: { takes: [], clips: [] },
  };
}

export const isVocalPart = (p: Pick<Part, 'vocal'>): boolean => p.vocal !== undefined;

/** Adds `take` to the part and a clip of all of it starting `at` seconds into the piece. Ignored past the limits. */
export function addTake(doc: EditDoc, partId: string, take: VocalTake, at: number): EditDoc {
  return withVocal(doc, partId, p => {
    if (p.vocal.takes.length >= MAX_TAKES || p.vocal.clips.length >= MAX_CLIPS || p.vocal.takes.some(t => t.file === take.file)) return p;
    const clip: VocalClip = { take: take.file, at: round(Math.max(0, at)), from: 0, to: round(take.seconds), gain_db: 0, fade_in: 0, fade_out: 0 };
    return { ...p, vocal: { takes: [...p.vocal.takes, { ...take }], clips: sortClips([...p.vocal.clips, clip]) } };
  });
}

/** Moves clip `i` to start `at` seconds into the piece (never before it). */
export function moveClip(doc: EditDoc, partId: string, i: number, at: number): EditDoc {
  return withVocal(doc, partId, p => ({ ...p, vocal: { ...p.vocal, clips: sortClips(p.vocal.clips.map((c, j) => (j === i ? { ...c, at: round(Math.max(0, at)) } : c))) } }));
}

/**
 * Trims clip `i` to the stretch `from`–`to` of its take, kept inside the take and at least MIN_CLIP long. Trimming the
 * start keeps the rest where it was heard, so the clip's `at` moves with it.
 */
export function trimClip(doc: EditDoc, partId: string, i: number, from: number, to: number): EditDoc {
  return withVocal(doc, partId, p => ({
    ...p, vocal: {
      ...p.vocal, clips: sortClips(p.vocal.clips.map((c, j) => {
        if (j !== i) return c;
        const seconds = p.vocal.takes.find(t => t.file === c.take)?.seconds ?? c.to;
        const f = round(clamp(from, 0, seconds - MIN_CLIP));
        const t = round(clamp(to, f + MIN_CLIP, seconds));
        return fitFades({ ...c, from: f, to: t, at: round(Math.max(0, c.at + (f - c.from))) });
      })),
    },
  }));
}

/** Splits clip `i` at `at` seconds into the piece; a split within MIN_CLIP of either end does nothing. */
export function splitClip(doc: EditDoc, partId: string, i: number, at: number): EditDoc {
  return withVocal(doc, partId, p => {
    const c = p.vocal.clips[i];
    if (!c || p.vocal.clips.length >= MAX_CLIPS) return p;
    const cut = c.from + (at - c.at);
    if (cut < c.from + MIN_CLIP || cut > c.to - MIN_CLIP) return p;
    const first = fitFades({ ...c, to: round(cut), fade_out: 0 });
    const second = fitFades({ ...c, at: round(at), from: round(cut), fade_in: 0 });
    return { ...p, vocal: { ...p.vocal, clips: sortClips([...p.vocal.clips.slice(0, i), first, second, ...p.vocal.clips.slice(i + 1)]) } };
  });
}

export function setClipGain(doc: EditDoc, partId: string, i: number, gain_db: number): EditDoc {
  return withVocal(doc, partId, p => ({ ...p, vocal: { ...p.vocal, clips: p.vocal.clips.map((c, j) => (j === i ? { ...c, gain_db: round(clamp(gain_db, CLIP_GAIN[0], CLIP_GAIN[1])) } : c)) } }));
}

export function setClipFades(doc: EditDoc, partId: string, i: number, fade_in: number, fade_out: number): EditDoc {
  return withVocal(doc, partId, p => ({ ...p, vocal: { ...p.vocal, clips: p.vocal.clips.map((c, j) => (j === i ? fitFades({ ...c, fade_in: round(fade_in), fade_out: round(fade_out) }) : c)) } }));
}

/** Clip `i` plays take `file` instead, from its start, as long as the clip was or the take is. */
export function pickTake(doc: EditDoc, partId: string, i: number, file: string): EditDoc {
  return withVocal(doc, partId, p => {
    const take = p.vocal.takes.find(t => t.file === file);
    if (!take) return p;
    return { ...p, vocal: { ...p.vocal, clips: p.vocal.clips.map((c, j) => (j === i ? fitFades({ ...c, take: file, from: 0, to: round(Math.min(take.seconds, Math.max(MIN_CLIP, c.to - c.from))) }) : c)) } };
  });
}

export function removeClip(doc: EditDoc, partId: string, i: number): EditDoc {
  return withVocal(doc, partId, p => ({ ...p, vocal: { ...p.vocal, clips: p.vocal.clips.filter((_, j) => j !== i) } }));
}

/** Removes a take and every clip of it; the last take stays (remove the part instead). */
export function removeTake(doc: EditDoc, partId: string, file: string): EditDoc {
  return withVocal(doc, partId, p => (p.vocal.takes.length <= 1 ? p : {
    ...p, vocal: { takes: p.vocal.takes.filter(t => t.file !== file), clips: p.vocal.clips.filter(c => c.take !== file) },
  }));
}

/** Every vocal part's references to take `from` become `to`, with `seconds` (a local take once it is saved). */
export function renameTake(doc: EditDoc, from: string, to: string, seconds?: number): EditDoc {
  if (!doc.parts.some(p => p.vocal?.takes.some(t => t.file === from))) return doc;
  return {
    ...doc, parts: doc.parts.map(p => (!p.vocal?.takes.some(t => t.file === from) ? p : {
      ...p, vocal: {
        takes: p.vocal.takes.map(t => (t.file === from ? { file: to, seconds: seconds ?? t.seconds } : t)),
        clips: p.vocal.clips.map(c => (c.take === from ? { ...c, take: to, to: seconds === undefined ? c.to : Math.min(c.to, seconds) } : c)),
      },
    })),
  };
}

/** The takes a document names, once each, in part order. */
export const takesOf = (doc: EditDoc): string[] => [...new Set(doc.parts.flatMap(p => p.vocal?.takes.map(t => t.file) ?? []))];
