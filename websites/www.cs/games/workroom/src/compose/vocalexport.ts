// Export With Vocals: the piece's notes as MusicXML (when it has parts with notes), its vocal takes at the quality each was saved in (a take still
// only on this device as Perfect FLAC), and vocals.json saying which take each clip plays and where, in one zip that
// other apps and people can open. DOM-free.
import type { Entry } from '../catalogue.ts';
import type { EditDoc } from './doc.ts';
import { encodeFlac } from './flac.ts';
import { toMusicXml } from './toxml.ts';
import { takesOf } from './vocal.ts';
import { writeZip } from './zip.ts';
import { LOCAL_TAKE_RE } from '../score.ts';

export interface ExportPorts {
  /** A saved take's bytes, as stored. */
  saved(file: string): Promise<Uint8Array>;
  /** A take on this device: its 16-bit samples and their rate. */
  local(id: string): Promise<{ pcm: Int16Array; rate: number } | null>;
}

/** The document without its vocal parts, for MusicXML and MIDI, which hold notes only. */
export const notesOnly = (doc: EditDoc): EditDoc => ({ ...doc, parts: doc.parts.filter(p => !p.vocal) });

export async function exportWithVocals(doc: EditDoc, entries: readonly Entry[], slug: string, ports: ExportPorts): Promise<Uint8Array> {
  const files = new Map<string, Uint8Array>();
  const notes = notesOnly(doc);
  if (notes.parts.length) files.set(`${slug}.musicxml`, new TextEncoder().encode(toMusicXml(notes, entries, { colours: false })));
  const names = new Map<string, string>();
  for (const take of takesOf(doc)) {
    if (LOCAL_TAKE_RE.test(take)) {
      const t = await ports.local(take);
      if (!t) throw new Error('a take is no longer on this device');
      const name = `vocals/${take}.flac`;
      files.set(name, encodeFlac(t.pcm, t.rate));
      names.set(take, name);
    } else {
      const name = `vocals/${take}`;
      files.set(name, await ports.saved(take));
      names.set(take, name);
    }
  }
  const tracks = doc.parts.filter(p => p.vocal).map(p => ({
    part: p.name,
    clips: p.vocal!.clips.map(c => ({ file: names.get(c.take)!, starts_at: c.at, from: c.from, to: c.to, gain_db: c.gain_db, fade_in: c.fade_in, fade_out: c.fade_out })),
  }));
  files.set('vocals.json', new TextEncoder().encode(JSON.stringify({ about: 'Each clip plays its file from `from` to `to` seconds, starting `starts_at` seconds into the piece.', tracks }, null, 1)));
  return writeZip(files);
}
