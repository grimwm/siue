// Sheet music on a piece's page for a draft that stores none (the editor's drafts, and every score-only studio's): the
// score engraved in the page from its notes, as the editor's Sheet Music view does, with the catalogue read once from
// the shared library. A draft that stores its MusicXML keeps showing that file. DOM-free but for the fetch port.
import { catalogue } from '../catalogue.ts';
import type { Entry } from '../catalogue.ts';
import type { Library } from '../render/plan.ts';
import { isRenderable } from '../score.ts';
import type { Score } from '../score.ts';
import { docFromScore } from './doc.ts';
import { toMusicXml } from './toxml.ts';

/** Where a piece page's sheet music comes from: its stored file, engraved from its notes, or nowhere (a sound, or a score the page cannot play). */
export function sheetSource(score: Score, stored: boolean): 'stored' | 'engraved' | null {
  if (score.kind !== 'music') return null;
  if (stored) return 'stored';
  return isRenderable(score) && score.notes.length > 0 ? 'engraved' : null;
}

let entries: Promise<Entry[]> | null = null;

/** The score's MusicXML, engraved; `library` fetches library.json (the page's own by default), once per page. */
export async function engraveScore(score: Score, library: () => Promise<Library> = defaultLibrary): Promise<string> {
  entries ??= library().then(catalogue, (e: unknown) => { entries = null; throw e; });
  const list = await entries;
  return toMusicXml(docFromScore(score, list), list, { colours: false });
}

async function defaultLibrary(): Promise<Library> {
  const reply = await fetch('library/library.json');
  if (!reply.ok) throw new Error(`The instruments could not be loaded (${reply.status}), so the sheet music cannot be written.`);
  return (await reply.json()) as Library;
}
