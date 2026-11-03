// Muting tracks: Mute and Unmute on each track, and Mute All / Unmute All. There is no Solo; a piece saved with one
// soloed is heard as it was (the others muted), and the first mute change turns that into plain mutes. The status line
// says in words who will play. DOM-free.
import type { EditDoc, Part } from './doc.ts';
import { setLaneFx } from './sound.ts';

/** Whether the part is silent: muted, or (in a piece saved with a solo) another part is soloed and it is not. */
export function isMuted(part: Part, doc?: Pick<EditDoc, 'parts'>): boolean {
  if (part.fx?.mute) return true;
  return !part.fx?.solo && (doc?.parts.some(p => p.fx?.solo) ?? false);
}

/** Every solo replaced by the mutes it meant, so the same parts are heard. */
function unsolo(doc: EditDoc): EditDoc {
  if (!doc.parts.some(p => p.fx?.solo)) return doc;
  return doc.parts.reduce((d, p) => {
    const muted = isMuted(p, doc);
    return setLaneFx(d, p.id, fx => ({ ...fx, mute: muted, solo: false }));
  }, doc);
}

/** The part muted or unmuted; any solo in the piece becomes plain mutes first. */
export function setMuted(doc: EditDoc, part: string, muted: boolean): EditDoc {
  return setLaneFx(unsolo(doc), part, fx => ({ ...fx, mute: muted }));
}

/** Every part muted or unmuted; no solo is left. */
export function setAllMuted(doc: EditDoc, muted: boolean): EditDoc {
  return doc.parts.reduce((d, p) => setLaneFx(d, p.id, fx => ({ ...fx, mute: muted, solo: false })), doc);
}

/** Who will play, in a sentence or two; empty with no parts. */
export function muteStatus(doc: EditDoc): string {
  if (!doc.parts.length) return '';
  const playing = doc.parts.filter(p => !isMuted(p, doc)).map(p => p.name);
  const muted = doc.parts.filter(p => isMuted(p, doc)).map(p => p.name);
  if (!muted.length) return 'All tracks will play.';
  if (!playing.length) return 'All tracks are muted. Press Unmute on each track you want to hear.';
  return `Playing: ${playing.join(', ')}. Muted: ${muted.join(', ')}.`;
}
