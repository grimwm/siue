// The short tune each effect's Hear plays: four bars at 100 BPM of piano chords and a tune over a drum beat, played
// plain at first so the effect is heard arriving. An effect that is a sound of its own (a riser, a snare roll) builds
// into bar 4 where the beat lands, an impact lands on bar 3, a crossfade fades the piano into a marimba, and any other
// effect changes the piano from halfway through bar 2. Made with the real instruments and renderer. DOM-free.
import type { Entry } from '../catalogue.ts';
import type { FxClip, FxClipEffect, Score } from '../score.ts';
import { newDoc, scoreFromDoc } from './doc.ts';
import type { EditDoc } from './doc.ts';
import { addNotes, addPart } from './edit.ts';

const CHORDS = [[48, 60, 64, 67], [45, 57, 60, 64], [41, 57, 60, 65], [43, 55, 59, 62]];
const TUNE = [72, 74, 76, 79, 76, 74, 72, 71, 69, 72, 76, 77, 76, 74, 71, 74];
const KICK = 36;
const SNARE = 38;
const HAT = 42;

/** The demo tune with `effect` placed on it, as a score ready to render; null when the library lacks a piano. */
export function fxDemoScore(effect: FxClipEffect, entries: readonly Entry[]): Score | null {
  const piano = entries.find(e => e.id === 'piano');
  const kit = entries.find(e => e.id === 'kit');
  const marimba = entries.find(e => e.id === 'marimba');
  if (!piano) return null;
  let doc: EditDoc = { ...newDoc('Effect Demo'), tempo: [{ bar: 1, bpm: 100, beats: 4, unit: 4 }] };
  const p = addPart(doc, piano)!;
  doc = p.doc;
  doc = addNotes(doc, p.id, CHORDS.flatMap((ch, bar) => ch.map(pitch => ({ start: bar * 4, length: 4, pitch, velocity: 70 })))).doc;
  doc = addNotes(doc, p.id, TUNE.map((pitch, i) => ({ start: i, length: 1, pitch, velocity: 96 }))).doc;
  if (kit) {
    const k = addPart(doc, kit)!;
    doc = k.doc;
    const hits = Array.from({ length: 16 }, (_, b) => [
      ...(b % 2 === 0 ? [{ start: b, pitch: KICK }] : [{ start: b, pitch: SNARE }]),
      { start: b, pitch: HAT }, { start: b + 0.5, pitch: HAT },
    ]).flat();
    doc = addNotes(doc, k.id, hits.map(h => ({ ...h, length: 0.25, velocity: h.pitch === HAT ? 70 : 105 }))).doc;
  }
  let other: string | null = null;
  if ((effect === 'crossfader' || effect === 'vocoder') && marimba) {
    const m = addPart(doc, marimba)!;
    doc = addNotes(m.doc, m.id, TUNE.map((pitch, i) => ({ start: i, length: 1, pitch: pitch - 12, velocity: 96 }))).doc;
    other = m.id;
  }
  doc = { ...doc, fxClips: [demoClip(effect, p.id, other)] };
  return scoreFromDoc(doc, { piece: { id: 'effect-demo', title: 'Effect Demo' }, project: { id: 'demo', name: 'Demo' }, draft: 1, made: '2026-01-01T00:00:00Z' });
}

/** Where the effect sits in the demo. */
function demoClip(effect: FxClipEffect, piano: string, other: string | null): FxClip {
  switch (effect) {
    case 'riser': case 'snare_roll': return { effect, lane: null, from_bar: 2, to_bar: 4 };
    case 'impact': return { effect, lane: null, from_bar: 3, to_bar: 3.25 };
    case 'vinyl': return { effect, lane: null, from_bar: 2, to_bar: 5 };
    case 'crossfader': return { effect, lane: null, from_bar: 2, to_bar: 4, settings: { a: [piano], b: other ? [other] : [], fade: true, silent: true } };
    case 'looper': return { effect, lane: null, from_bar: 3, to_bar: 5, settings: { bars: [2] } };
    case 'hot_cue': return { effect, lane: null, from_bar: 3, to_bar: 4, settings: { cue_bar: 1 } };
    case 'vocoder': return { effect, lane: piano, from_bar: 2.5, to_bar: 5, ...(other ? { settings: { carrier: other } } : {}) };
    default: return { effect, lane: piano, from_bar: 2.5, to_bar: 5 };
  }
}
