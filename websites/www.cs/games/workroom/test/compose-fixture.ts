// Shared by the composer's conversion tests: the real library's catalogue, and a document built from a few notes.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { catalogue } from '../src/catalogue.ts';
import type { Entry } from '../src/catalogue.ts';
import { newDoc } from '../src/compose/doc.ts';
import type { EditDoc, EditNote, Part } from '../src/compose/doc.ts';
import { addPart } from '../src/compose/edit.ts';
import type { Library } from '../src/render/plan.ts';
import type { Tempo } from '../src/score.ts';

export const ENTRIES: readonly Entry[] = catalogue(JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', '..', 'music', 'library', 'library.json'), 'utf8')) as Library);
export const entry = (id: string): Entry => ENTRIES.find(e => e.id === id)!;

type N = [start: number, length: number, pitch: number];
/** A document with one part per [instrument, notes in beats]. */
export function docWith(parts: [string, N[]][], tempo?: Tempo[]): EditDoc {
  let doc = newDoc('Test Tune');
  if (tempo) doc = { ...doc, tempo };
  let id = 1;
  for (const [inst, notes] of parts) {
    const made = addPart(doc, entry(inst))!;
    doc = { ...made.doc, parts: made.doc.parts.map((p): Part => (p.id === made.id ? { ...p, notes: notes.map(([start, length, pitch]): EditNote => ({ id: id++, start, length, pitch, velocity: 90, motif: null })) } : p)) };
  }
  return { ...doc, nextId: id };
}

