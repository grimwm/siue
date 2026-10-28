/* The Island of Crete: the solver's Web Worker (dist/solver-worker.js), started by solver-client.ts. It runs
 * solver-host.ts with the search's node file and the result cache in the origin private file system, written
 * through sync access handles; the cache's version is a hash of this bundle, and the cache is trimmed to RESULT_LIMIT
 * entries (another version's first) after each put. Where the file system is missing or
 * refused (a private window, no quota) the nodes stay in memory and the cache reads as empty. */
import { createSolverHost } from './solver-host.ts';
import type { NodeFile, ToHost } from './solver-host.ts';
import { handleFile } from './puzzle/paged.ts';
import { evictions, sha256Hex } from './puzzle/cache.ts';
import type { CachedResult, ResultStore } from './puzzle/cache.ts';

/** A node file older than this was left by a tab that closed mid-search, and is deleted. */
const STALE_MS = 6 * 3600_000;

const folder = async (name: string) => (await navigator.storage.getDirectory()).getDirectoryHandle(name, { create: true });

/** A new node file, named by when it was made; stale ones go first (one another worker holds open refuses to). */
async function openNodeFile(): Promise<NodeFile> {
  const dir = await folder('crete-nodes');
  const now = Date.now();
  for await (const name of dir.keys()) {
    const made = parseInt(name, 36);
    if (!(now - made < STALE_MS)) await dir.removeEntry(name).catch(() => {});
  }
  const name = `${now.toString(36)}-${Math.random().toString(36).slice(2)}.bin`;
  const handle = await (await dir.getFileHandle(name, { create: true })).createSyncAccessHandle();
  return {
    file: handleFile(handle),
    close() {
      handle.close();
      void dir.removeEntry(name).catch(() => {});
    },
  };
}

let trimming = false;
let trimAgain = false;

/** One pass of the trim: lists the entries and evicts. */
async function trimOnce(): Promise<void> {
  const dir = await folder('crete-results');
  const entries: { key: string; modified: number }[] = [];
  for await (const [name, handle] of dir.entries()) {
    if (handle.kind !== 'file' || !name.endsWith('.json')) continue;
    entries.push({ key: name.slice(0, -5), modified: (await (handle as FileSystemFileHandle).getFile()).lastModified });
  }
  for (const key of evictions(entries, await version)) await dir.removeEntry(`${key}.json`).catch(() => {});
}

/** Finished results, one JSON file each. */
const diskResults: ResultStore = {
  async get(key) {
    const file = await (await (await folder('crete-results')).getFileHandle(`${key}.json`)).getFile();
    return JSON.parse(await file.text()) as CachedResult;
  },
  async put(key, r) {
    const handle = await (await (await folder('crete-results')).getFileHandle(`${key}.json`, { create: true })).createSyncAccessHandle();
    try {
      const bytes = new TextEncoder().encode(JSON.stringify(r));
      handle.truncate(0);
      if (handle.write(bytes, { at: 0 }) !== bytes.length) throw new Error('short write');
      handle.flush();
    } finally {
      handle.close();
    }
  },
  /** Removes other versions' entries and the oldest beyond RESULT_LIMIT; one trim at a time, a trim asked for
   *  while one runs makes it pass again once it finishes, so an entry written after it listed is seen. */
  async trim() {
    if (trimming) { trimAgain = true; return; }
    trimming = true;
    try {
      do {
        trimAgain = false;
        await trimOnce();
      } while (trimAgain);
    } finally {
      trimming = false;
    }
  },
};

/** The solver's version: a hash of this worker's own bundle, which holds every rule and the solver, so a
 *  result cached by another build is never served. Unknown (nothing cached) when the bundle cannot be read. */
const version = fetch(self.location.href)
  .then(r => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
  .then(text => sha256Hex(text))
  .then(hex => hex.slice(0, 16))
  .catch(() => null);

/** A message to itself: whatever arrived during the batch (stop, a new search) is handled before it. */
const channel = new MessageChannel();
const waiting: (() => void)[] = [];
channel.port1.onmessage = () => waiting.shift()?.();

const host = createSolverHost({
  post: m => self.postMessage(m),
  results: diskResults,
  openFile: openNodeFile,
  pause: () => new Promise<void>(r => { waiting.push(r); channel.port2.postMessage(0); }),
  version,
});
self.onmessage = (e: MessageEvent<ToHost>) => host.receive(e.data);
