/* The Island of Crete: finished search results, kept by the SHA-256 of the exact level text, the search kind and
 * the solver's version (a hash of the build that searched), so the same level is never searched twice by one build
 * and never answered by another's rules. A line is kept as move letters. `safeResults` turns any failure of a
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
  /** Drops the entries the store should no longer keep (see `evictions`); a store that never grows has none. */
  trim?(): Promise<void>;
}

/** The most entries a store keeps after a trim. */
export const RESULT_LIMIT = 256;

/** The keys to remove: every entry of another version (or none) first, then the oldest by `modified` until
 *  `limit` remain. An unknown version (null) matches no entry's version, so nothing goes for that reason. */
export function evictions(entries: readonly { key: string; modified: number }[], version: string | null, limit = RESULT_LIMIT): string[] {
  const versionOf = (key: string) => {
    const parts = key.split('-');
    return parts.length === 3 ? parts[1] : null;
  };
  const gone: string[] = [];
  const kept: { key: string; modified: number }[] = [];
  for (const e of entries) {
    if (version !== null && versionOf(e.key) !== version) gone.push(e.key);
    else kept.push(e);
  }
  kept.sort((a, b) => b.modified - a.modified);
  for (const e of kept.slice(limit)) gone.push(e.key);
  return gone;
}

/** SHA-256 of the text's UTF-8 bytes, in hex. */
export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** The cache key: the kind, the version (letters and digits only) when there is one, then the text's SHA-256. */
export async function resultKey(levelText: string, kind: string, version = ''): Promise<string> {
  const v = version.replace(/[^A-Za-z0-9]/g, '');
  return `${kind}-${v ? `${v}-` : ''}${await sha256Hex(levelText)}`;
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
    async trim() {
      try { await store.trim?.(); } catch { /* the store stays as large as it was */ }
    },
  };
}
