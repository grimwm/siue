// "How to read this": for each view, the numbered parts the guide walks
// through: where each sits on the view (a spot in the drawing's own pixels, or
// a control), a plain explanation, an everyday comparison and what Hear it
// plays (a short clip of the piece at that part, or a built-in demo). Parts
// with nothing to show on this piece are left out. Also the per-view "seen"
// flags that open the guide by itself on a first visit. DOM-free.
import { pref, text } from '../../_kit/prefs.ts';
import type { Pref } from '../../_kit/prefs.ts';
import type { StorageLike } from '../../_kit/ports.ts';
import { AXIS_H } from './axis.ts';
import { layoutConstellations } from './constellation.ts';
import type { DemoId } from './demo.ts';
import { demoLength } from './demo.ts';
import { layoutRoll, ROLL_H } from './pianoroll.ts';
import type { Kind, Score } from './score.ts';
import { PICTURE_H } from './spectro.ts';
import type { Tab } from './tabs.ts';
import { sectionTimes } from './tempo.ts';
import type { TempoMap } from './tempo.ts';
import { layoutTimeline } from './timeline.ts';
import type { Rect } from './timeline.ts';
import { timeToX } from './zoom.ts';
import type { View } from './zoom.ts';

/** The longest piece clip, in seconds. */
export const CLIP_MAX = 4;
export type GuideClip = { kind: 'piece'; from: number; to: number } | { kind: 'demo'; id: DemoId };
export type GuideAnchor = 'view' | 'lane-picker' | 'sheet';
/** rect is in the anchor element's own pixels (the drawing's, for 'view'); null lights the whole element. */
export interface GuideSpot { anchor: GuideAnchor; rect: Rect | null }
export interface GuidePart { id: string; title: string; what: string; like: string; spot: GuideSpot; clip: GuideClip }
export interface GuideInput { tab: Tab; score: Score; tempo: TempoMap; view: View; time: number; lanes?: ReadonlySet<string> }

/** A clip of the piece from `from`, at most CLIP_MAX long, inside 0..duration; an empty one becomes the CLIP_MAX (or less) before the end. */
export function pieceClip(from: number, to: number, duration: number): GuideClip {
  let a = Math.min(Math.max(0, from), duration);
  let b = Math.min(to, a + CLIP_MAX, duration);
  if (b <= a) { b = duration; a = Math.max(0, duration - CLIP_MAX); }
  return { kind: 'piece', from: a, to: b };
}

export function clipLength(clip: GuideClip): number {
  return clip.kind === 'piece' ? clip.to - clip.from : demoLength(clip.id);
}

const PAD = 6;
/** r grown by PAD and clamped to 0..w by 0..h; null when nothing of it is left. */
function onDrawing(r: Rect, w: number, h: number): Rect | null {
  const x = Math.max(0, r.x - PAD);
  const y = Math.max(0, r.y - PAD);
  const x2 = Math.min(w, r.x + r.w + PAD);
  const y2 = Math.min(h, r.y + r.h + PAD);
  return x2 > x && y2 > y ? { x, y, w: x2 - x, h: y2 - y } : null;
}
const view = (rect: Rect | null): GuideSpot => ({ anchor: 'view', rect });

function ruler(score: Score, width: number, top: number): GuidePart {
  return score.kind === 'music'
    ? { id: 'ruler', title: 'Bar numbers', what: 'The numbers along the bottom are the music’s ruler. A bar is a short group of counted beats, often four: one, two, three, four. Musicians say “bar 13” the way you would say “page 13”. Your notes can point at bars.', like: 'Like page numbers, so we can both point at the same moment.', spot: view({ x: 0, y: top, w: width, h: AXIS_H }), clip: { kind: 'demo', id: 'clicks' } }
    : { id: 'ruler', title: 'Seconds', what: 'The numbers along the bottom are the sound’s ruler, in seconds, or thousandths of a second (ms) for a very short sound. Your notes can point at a time.', like: 'Like the timer on a stopwatch.', spot: view({ x: 0, y: top, w: width, h: AXIS_H }), clip: { kind: 'demo', id: 'ticks' } };
}

function playhead(i: GuideInput, height: number): GuidePart {
  const x = Math.min(Math.max(0, timeToX(i.view, i.time)), i.view.width);
  const word = i.score.kind === 'music' ? 'music' : 'sound';
  return {
    id: 'playhead', title: 'The playhead',
    what: `The amber line is where the ${word} is right now. It moves as the ${word} plays. Tap anywhere on the view to jump there.`,
    like: 'Like the cursor in a video player.',
    spot: view(onDrawing({ x, y: 0, w: 0, h: height }, i.view.width, height)),
    clip: pieceClip(i.time, i.time + CLIP_MAX, i.score.duration),
  };
}

function story(i: GuideInput): GuidePart[] {
  const { score, view: v } = i;
  const music = score.kind === 'music';
  const layout = layoutTimeline(score, i.tempo, v);
  const w = v.width;
  const h = layout.height;
  const parts: GuidePart[] = [];
  const firstSection = score.sections[0];
  const sectionRect = layout.sections.map(s => onDrawing(s.rect, w, h)).find(r => r !== null);
  if (firstSection && sectionRect) {
    const t = sectionTimes(firstSection, i.tempo, score.duration);
    parts.push(music
      ? { id: 'sections', title: 'Sections', what: 'The coloured blocks across the top split the piece into chapters, the way a film has scenes. Each one has a plain name for what is happening in the story.', like: 'Like chapter titles in a book.', spot: view(sectionRect), clip: pieceClip(t.from, t.to, score.duration) }
      : { id: 'sections', title: 'Moments', what: 'The coloured blocks across the top name the moments of the sound, one after another, such as the start and the fade-out.', like: 'Like the steps of a recipe, in order.', spot: view(sectionRect), clip: pieceClip(t.from, t.to, score.duration) });
  }
  const lane = layout.lanes[0];
  if (lane) {
    const firstNote = score.notes.filter(n => n.lane === lane.id).sort((a, b) => a.start - b.start)[0];
    const clip = pieceClip(firstNote?.start ?? 0, (firstNote?.start ?? 0) + CLIP_MAX, score.duration);
    parts.push(music
      ? { id: 'lanes', title: 'Instrument lanes', what: 'Each shaded row belongs to one group of instruments. Anything drawn inside a row is that group playing. An empty stretch means those instruments are silent.', like: 'Like tracks on a recording, one per musician.', spot: view(onDrawing(lane.rect, w, h)), clip }
      : { id: 'lanes', title: 'Layers', what: 'Each shaded row is one layer of the sound. A layer can be a part of the sound, such as the first hit or a rush of air. Anything drawn inside a row is that layer sounding.', like: 'Like the layers of a cake, each with its own taste.', spot: view(onDrawing(lane.rect, w, h)), clip });
  }
  const shownNote = layout.notes.map(n => ({ n, r: onDrawing(n.rect, w, h) })).find(x => x.r !== null);
  if (shownNote) {
    const note = score.notes[shownNote.n.index]!;
    parts.push({ id: 'notes', title: 'Note blocks', what: 'Each small block is one note. Left to right is when it plays. A longer block is a note held longer. A block drawn a little higher in its row is a higher note.', like: 'Like the holes in a music-box roll: where each one sits says when it sounds and how high.', spot: view(shownNote.r), clip: pieceClip(note.start, note.start + CLIP_MAX, score.duration) });
  }
  const tune = layoutConstellations(score, layout, v).find(c => c.stars.length > 0);
  if (tune) {
    const xs = tune.stars.map(s => s.x);
    const ys = tune.stars.map(s => s.y);
    const box = onDrawing({ x: Math.min(...xs), y: Math.min(...ys) - 10, w: Math.max(...xs) - Math.min(...xs) + 60, h: Math.max(...ys) - Math.min(...ys) + 14 }, w, h);
    if (box) parts.push({ id: 'stars', title: "A character's tune as stars", what: 'The joined stars are one character’s tune. Each star marks one note on that lane. Higher on the screen is a higher note, and a bigger star is louder. The line shows the shape of the tune at a glance.', like: 'Like a line drawn through the tune’s notes: when it climbs, the tune climbs.', spot: view(box), clip: pieceClip(tune.from, tune.to, score.duration) });
  }
  const peak = score.energy.reduce((best, e) => (e[1] > best[1] ? e : best), score.energy[0] ?? [0, 0]);
  parts.push({ id: 'energy', title: 'The energy glow', what: `The soft green band shows ${music ? 'how intense the music feels. Low and thin is calm; high is tense or exciting.' : 'how strong the sound is over time. Low is faint; high is strong.'}`, like: music ? 'Like the volume and pace of a scene building to its climax.' : 'Like the needle on a volume meter.', spot: view({ x: 0, y: 0, w, h }), clip: pieceClip(peak[0] - CLIP_MAX / 2, peak[0] + CLIP_MAX / 2, score.duration) });
  parts.push(playhead(i, h));
  parts.push(ruler(score, w, h));
  return parts;
}

function roll(i: GuideInput): GuidePart[] {
  const { score, view: v } = i;
  const r = layoutRoll(score, v, ROLL_H, i.lanes);
  const w = v.width;
  const h = r.height;
  const shown = r.notes.map(n => ({ n, rect: onDrawing(n.rect, w, h) })).filter((x): x is { n: (typeof r.notes)[number]; rect: Rect } => x.rect !== null);
  const first = shown[0];
  if (!first) return [ruler(score, w, h)];
  const longest = shown.reduce((a, b) => (b.n.rect.w > a.n.rect.w ? b : a));
  const at = (k: number) => score.notes[k]!;
  return [
    { id: 'note', title: 'A note', what: 'Each block is one note. Left to right is when it plays.', like: 'Like one key pressed on a piano.', spot: view(first.rect), clip: pieceClip(at(first.n.index).start, at(first.n.index).start + CLIP_MAX, score.duration) },
    { id: 'pitch', title: 'Higher is higher', what: 'A block higher up is a higher note. The names at the left, such as C3 and C4, are note names, from low to high.', like: 'Like the keys of a piano stood on end: the low keys at the bottom.', spot: view({ x: 0, y: 0, w: Math.min(w, 32), h }), clip: { kind: 'demo', id: 'updown' } },
    { id: 'length', title: 'Longer is held longer', what: 'A longer block is a note held for longer.', like: 'Like holding a key down instead of tapping it.', spot: view(longest.rect), clip: pieceClip(at(longest.n.index).start, at(longest.n.index).start + at(longest.n.index).length, score.duration) },
    { id: 'colour', title: 'Colour is the instrument', what: 'Each colour is one instrument group, or the character whose tune it is. The buttons above the roll show or hide each group.', like: 'Like coloured pens, one per musician.', spot: { anchor: 'lane-picker', rect: null }, clip: pieceClip(at(first.n.index).start, at(first.n.index).start + CLIP_MAX, score.duration) },
    ruler(score, w, h),
  ];
}

function soundPicture(i: GuideInput): GuidePart[] {
  const w = i.view.width;
  return [
    { id: 'height', title: 'Low and high', what: 'Low sounds sit at the bottom of the picture and high sounds at the top. The labels at the left give the pitch in hertz (Hz).', like: 'Like a building: the rumble lives on the ground floor, the hiss on the top floor.', spot: view({ x: 0, y: 0, w: Math.min(w, 60), h: PICTURE_H }), clip: { kind: 'demo', id: 'updown' } },
    { id: 'brightness', title: 'Brighter is louder', what: 'The brighter a spot, the louder that sound is at that moment. Dark means quiet.', like: 'Like a heat map, where the hot spots are the loud parts.', spot: view({ x: 0, y: 0, w, h: PICTURE_H }), clip: { kind: 'demo', id: 'swell' } },
    playhead(i, PICTURE_H),
    ruler(i.score, w, PICTURE_H),
  ];
}

function sheetMusic(i: GuideInput): GuidePart[] {
  const start = pieceClip(0, CLIP_MAX, i.score.duration);
  return [
    { id: 'pick', title: 'Pick an instrument', what: 'Sheet music shows one instrument group at a time. Pick it here.', like: 'Like choosing one singer’s part from a choir book.', spot: { anchor: 'lane-picker', rect: null }, clip: start },
    { id: 'staff', title: 'Each set of five lines is a staff', what: 'Each set of five lines is a staff. Notes sit on the lines or in the gaps between them, and you read them left to right.', like: 'Like lines of text on a page.', spot: { anchor: 'sheet', rect: null }, clip: start },
    { id: 'higher', title: 'Higher on the staff is higher', what: 'A note drawn higher on the staff is a higher note.', like: 'Like a ladder: each step up is a higher note.', spot: { anchor: 'sheet', rect: null }, clip: { kind: 'demo', id: 'updown' } },
    { id: 'bars', title: 'Bar numbers', what: 'The small number at the start of a line is the bar it begins with. A bar is a short group of counted beats.', like: 'Like page numbers in a book.', spot: { anchor: 'sheet', rect: null }, clip: { kind: 'demo', id: 'clicks' } },
  ];
}

export function guideParts(i: GuideInput): GuidePart[] {
  switch (i.tab) {
    case 'story': return story(i);
    case 'roll': return roll(i);
    case 'sound': return soundPicture(i);
    case 'sheet': return sheetMusic(i);
  }
}

export interface GuideStore { seen(tab: Tab, kind: Kind): boolean; markSeen(tab: Tab, kind: Kind): void }
export const GUIDE_KEY_PREFIX = 'workroom-guide-';

/** Whether this browser has seen each view's guide for a kind of piece (localStorage `workroom-guide-<tab>` for music, `workroom-guide-sound-<tab>` for sound = `seen`); broken storage holds the flag for this page view. */
export function guideStore(storage: StorageLike | null): GuideStore {
  const flags = new Map<string, Pref<string>>();
  const flag = (tab: Tab, kind: Kind) => {
    const key = `${GUIDE_KEY_PREFIX}${kind === 'sound' ? 'sound-' : ''}${tab}`;
    let f = flags.get(key);
    if (!f) { f = pref(key, '', text, storage); flags.set(key, f); }
    return f;
  };
  return { seen: (tab, kind) => flag(tab, kind).get() === 'seen', markSeen: (tab, kind) => flag(tab, kind).set('seen') };
}

/** A store for which every guide is already seen: nothing opens by itself. */
export const ALWAYS_SEEN: GuideStore = { seen: () => true, markSeen: () => {} };
