/* The Island of Crete: finished search results, kept by the SHA-256 of the exact level text and the search kind,
 * so the same level is never searched twice. A line is kept as move letters. `safeResults` turns any failure of a
 * store (no storage, a full disk, a corrupt entry) into a miss; nothing it does throws. DOM-free. */
import { DIRS } from './tiles.ts';
import type { Dir, Tool } from './tiles.ts';
import type { Action } from './step.ts';

// Web Crypto and TextEncoder, present in pages, workers and Node alike; declared here, as this program has no DOM.
declare const crypto: { subtle: { digest(algorithm: 'SHA-256', data: Uint8Array): Promise<ArrayBuffer> } };
declare const TextEncoder: new () => { encode(text: string): Uint8Array };

export interface CachedResult {
  solved: boolean;
  /** The line as move letters (lineText); empty for a measure. */
  line: string;
  explored: number;
  /** A measure's numbers (difficulty.ts's Difficulty). */
  difficulty?: unknown;
}

export interface ResultStore {
  get(key: string): Promise<CachedResult | null>;
  put(key: string, r: CachedResult): Promise<void>;
}

/** The cache key: the kind, then the SHA-256 of the text's UTF-8 bytes in hex. */
export async function resultKey(levelText: string, kind: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(levelText));
  return `${kind}-${[...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')}`;
}

const DIR_LETTER: Record<Dir, string> = { up: 'u', down: 'd', left: 'l', right: 'r' };
/** A tool by the letter of its pickup in the level text. */
const TOOL_LETTER: Record<Tool, string> = { mirror: 'z', cake: 'x', cow: 'c' };

export function lineText(line: readonly Action[]): string {
  return line.map(a => (a.kind === 'move' ? DIR_LETTER[a.dir] : a.kind === 'wait' ? 'w' : TOOL_LETTER[a.tool])).join('');
}

/** The actions `text` spells, or null when a letter is none. */
export function lineOf(text: string): Action[] | null {
  const out: Action[] = [];
  for (const ch of text) {
    const dir = DIRS.find(d => DIR_LETTER[d] === ch);
    const tool = (Object.keys(TOOL_LETTER) as Tool[]).find(t => TOOL_LETTER[t] === ch);
    if (dir) out.push({ kind: 'move', dir });
    else if (ch === 'w') out.push({ kind: 'wait' });
    else if (tool) out.push({ kind: 'tool', tool });
    else return null;
  }
  return out;
}

export function isCachedResult(x: unknown): x is CachedResult {
  if (typeof x !== 'object' || x === null) return false;
  const r = x as Record<string, unknown>;
  return typeof r.solved === 'boolean' && typeof r.line === 'string' && typeof r.explored === 'number';
}

/** Results in a Map, for this page's life. */
export function memoryResults(): ResultStore {
  const map = new Map<string, CachedResult>();
  return {
    get: async key => map.get(key) ?? null,
    put: async (key, r) => { map.set(key, r); },
  };
}

/** `store`, where a get that throws, rejects or finds a malformed entry is a miss and a failed put is dropped. */
export function safeResults(store: ResultStore): ResultStore {
  return {
    async get(key) {
      try {
        const r = await store.get(key);
        return isCachedResult(r) ? r : null;
      } catch {
        return null;
      }
    },
    async put(key, r) {
      try { await store.put(key, r); } catch { /* not cached: the next run searches again */ }
    },
  };
}
