/* The Island of Crete: the search's nodes, kept in typed arrays, and past a budget in a paged file (paged.ts). A
 * node is a packed situation (pack.ts) with the node it was reached from, the action that reached it and its moves
 * from the start; no State object is kept. DOM-free. */
import type { PagedFile } from './paged.ts';

export interface NodeStore {
  readonly size: number;
  /** Adds unless an equal packed situation is stored; returns its id, or -1 when it was already there. A shorter
   *  route (smaller `g`) to a stored situation replaces its parent, action and g, and returns its id. */
  add(words: Uint32Array, at: number, parent: number, action: number, g: number): number;
  words(id: number, out: Uint32Array, at: number): void;
  parent(id: number): number;
  action(id: number): number;
  g(id: number): number;
}

/** A store that cannot go on (its file failed); the search ends capped with the message as its reason. */
export class StoreError extends Error {}

const FIRST = 1024;

/** murmur3's 32-bit mix over the words. */
export function hashOf(words: Uint32Array, at: number, n: number): number {
  let h = 0x9747b28c;
  for (let i = 0; i < n; i++) {
    let k = Math.imul(words[at + i]!, 0xcc9e2d51);
    k = Math.imul((k << 15) | (k >>> 17), 0x1b873593);
    h ^= k;
    h = Math.imul((h << 13) | (h >>> 19), 5) + 0xe6546b64;
  }
  h ^= n;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

/** Every node in memory: open addressing (linear probing) over a hash of the words; the arrays grow by doubling. */
export function memoryStore(wordsPerNode: number): NodeStore {
  const W = wordsPerNode;
  let room = FIRST;
  let data = new Uint32Array(room * W);
  let hashes = new Uint32Array(room);
  let parents = new Int32Array(room);
  let actions = new Uint8Array(room);
  let gs = new Uint32Array(room);
  let size = 0;
  /** Slots hold node id + 1; 0 is empty. Kept at most half full. */
  let table = new Int32Array(FIRST * 2);
  let mask = table.length - 1;

  function grow(): void {
    room *= 2;
    const d = new Uint32Array(room * W); d.set(data); data = d;
    const h = new Uint32Array(room); h.set(hashes); hashes = h;
    const p = new Int32Array(room); p.set(parents); parents = p;
    const a = new Uint8Array(room); a.set(actions); actions = a;
    const g = new Uint32Array(room); g.set(gs); gs = g;
    table = new Int32Array(room * 2);
    mask = table.length - 1;
    for (let id = 0; id < size; id++) {
      let slot = hashes[id]! & mask;
      while (table[slot] !== 0) slot = (slot + 1) & mask;
      table[slot] = id + 1;
    }
  }

  function equal(id: number, words: Uint32Array, at: number): boolean {
    const base = id * W;
    for (let i = 0; i < W; i++) if (data[base + i] !== words[at + i]) return false;
    return true;
  }

  return {
    get size() { return size; },
    add(words, at, parent, action, g) {
      const h = hashOf(words, at, W);
      let slot = h & mask;
      for (let e = table[slot]!; e !== 0; slot = (slot + 1) & mask, e = table[slot]!) {
        const id = e - 1;
        if (hashes[id] !== h || !equal(id, words, at)) continue;
        if (g >= gs[id]!) return -1;
        parents[id] = parent;
        actions[id] = action;
        gs[id] = g;
        return id;
      }
      if (size === room) {
        grow();
        slot = h & mask;
        while (table[slot] !== 0) slot = (slot + 1) & mask;
      }
      const id = size++;
      data.set(words.subarray(at, at + W), id * W);
      hashes[id] = h;
      parents[id] = parent;
      actions[id] = action;
      gs[id] = g;
      table[slot] = id + 1;
      return id;
    },
    words(id, out, at) { out.set(data.subarray(id * W, id * W + W), at); },
    parent: id => parents[id]!,
    action: id => actions[id]!,
    g: id => gs[id]!,
  };
}

export interface SpillOptions {
  /** Bytes per page of the file (rounded down to whole nodes); 64 KiB by default. */
  pageBytes?: number;
  /** Pages held in memory, the most recently used; 64 by default. */
  cachePages?: number;
}

/** The first `memoryBudgetNodes` nodes in memory, as memoryStore keeps them; every later one in `file`, in fixed-size
 *  records (the words, then parent, g and action, one word each) on fixed-size pages, of which a few are cached.
 *  Only each node's hash and the hash table stay in memory for those; a hash match is confirmed against the
 *  record read back, so duplicates are exact. A file that throws, or is shorter than what was written to it, throws
 *  a StoreError. */
export function spillingStore(wordsPerNode: number, file: PagedFile, memoryBudgetNodes: number, options: SpillOptions = {}): NodeStore {
  const W = wordsPerNode;
  const budget = Math.max(0, Math.floor(memoryBudgetNodes));
  const R = W + 3;
  const perPage = Math.max(1, Math.floor((options.pageBytes ?? 65_536) / (R * 4)));
  const pageBytes = perPage * R * 4;
  const cachePages = Math.max(1, options.cachePages ?? 64);

  // The nodes in memory.
  let room = Math.min(FIRST, budget);
  let data = new Uint32Array(room * W);
  let parents = new Int32Array(room);
  let actions = new Uint8Array(room);
  let gs = new Uint32Array(room);
  // Every node: its hash, and the table (slots hold node id + 1; 0 is empty; kept at most half full).
  let hashes = new Uint32Array(FIRST);
  let table = new Int32Array(FIRST * 2);
  let mask = table.length - 1;
  let size = 0;

  // The cached pages: which page each slot holds (-1 none), its words, whether it changed, when last used.
  const held = new Int32Array(cachePages).fill(-1);
  const pages = Array.from({ length: cachePages }, () => new Uint32Array(pageBytes / 4));
  const raw = pages.map(p => new Uint8Array(p.buffer));
  const dirty = new Uint8Array(cachePages);
  const used = new Float64Array(cachePages);
  const slotOf = new Map<number, number>();
  let clock = 0;
  /** Pages begun so far; every one not cached is in the file. */
  let begun = 0;

  const failed = (e: unknown) => new StoreError(`the search's node file failed: ${e instanceof Error ? e.message : String(e)}`);

  /** The cache slot holding page `p`, read from the file or begun empty. */
  function page(p: number): number {
    let s = slotOf.get(p);
    if (s === undefined) {
      s = 0;
      for (let i = 1; i < cachePages; i++) if (used[i]! < used[s]!) s = i;
      const old = held[s]!;
      if (old >= 0) {
        if (dirty[s]) {
          try { file.write(old * pageBytes, raw[s]!); } catch (e) { throw failed(e); }
        }
        slotOf.delete(old);
      }
      if (p < begun) {
        try {
          // Pages are written whole, so a file that does not hold this one has lost what was written.
          if (file.size() < (p + 1) * pageBytes) throw new Error(`page ${p} is missing (${file.size()} bytes)`);
          file.read(p * pageBytes, raw[s]!);
        } catch (e) { throw failed(e); }
      } else {
        pages[s]!.fill(0);
        begun = p + 1;
      }
      held[s] = p;
      dirty[s] = 0;
      slotOf.set(p, s);
    }
    used[s] = ++clock;
    return s;
  }

  // A spilled node's record: `at` is set to its first word in `rec`, the page holding it.
  let rec = pages[0]!;
  let at = 0;
  let slot = 0;
  function record(id: number): void {
    const k = id - budget;
    slot = page(Math.floor(k / perPage));
    rec = pages[slot]!;
    at = (k % perPage) * R;
  }

  function grow(): void {
    const n = hashes.length * 2;
    const h = new Uint32Array(n); h.set(hashes); hashes = h;
    table = new Int32Array(n * 2);
    mask = table.length - 1;
    for (let id = 0; id < size; id++) {
      let t = hashes[id]! & mask;
      while (table[t] !== 0) t = (t + 1) & mask;
      table[t] = id + 1;
    }
  }

  function growMemory(): void {
    room = Math.min(budget, room * 2);
    const d = new Uint32Array(room * W); d.set(data); data = d;
    const p = new Int32Array(room); p.set(parents); parents = p;
    const a = new Uint8Array(room); a.set(actions); actions = a;
    const g = new Uint32Array(room); g.set(gs); gs = g;
  }

  function equal(id: number, words: Uint32Array, from: number): boolean {
    if (id < budget) {
      const base = id * W;
      for (let i = 0; i < W; i++) if (data[base + i] !== words[from + i]) return false;
      return true;
    }
    record(id);
    for (let i = 0; i < W; i++) if (rec[at + i] !== words[from + i]) return false;
    return true;
  }

  function set(id: number, parent: number, action: number, g: number): void {
    if (id < budget) {
      parents[id] = parent;
      actions[id] = action;
      gs[id] = g;
      return;
    }
    record(id);
    rec[at + W] = parent;
    rec[at + W + 1] = g;
    rec[at + W + 2] = action;
    dirty[slot] = 1;
  }

  const gOf = (id: number): number => {
    if (id < budget) return gs[id]!;
    record(id);
    return rec[at + W + 1]!;
  };

  return {
    get size() { return size; },
    add(words, from, parent, action, g) {
      const h = hashOf(words, from, W);
      let t = h & mask;
      for (let e = table[t]!; e !== 0; t = (t + 1) & mask, e = table[t]!) {
        const id = e - 1;
        if (hashes[id] !== h || !equal(id, words, from)) continue;
        if (g >= gOf(id)) return -1;
        set(id, parent, action, g);
        return id;
      }
      if (size === hashes.length) {
        grow();
        t = h & mask;
        while (table[t] !== 0) t = (t + 1) & mask;
      }
      const id = size;
      if (id < budget) {
        if (id === room) growMemory();
        data.set(words.subarray(from, from + W), id * W);
      } else {
        record(id);
        rec.set(words.subarray(from, from + W), at);
      }
      set(id, parent, action, g);
      size++;
      hashes[id] = h;
      table[t] = id + 1;
      return id;
    },
    words(id, out, to) {
      if (id < budget) { out.set(data.subarray(id * W, id * W + W), to); return; }
      record(id);
      out.set(rec.subarray(at, at + W), to);
    },
    parent(id) {
      if (id < budget) return parents[id]!;
      record(id);
      return rec[at + W]! | 0;
    },
    action(id) {
      if (id < budget) return actions[id]!;
      record(id);
      return rec[at + W + 2]!;
    },
    g: gOf,
  };
}
