/* The Island of Crete: the search's nodes, kept in typed arrays. A node is a packed situation (pack.ts) with the
 * node it was reached from, the action that reached it and its moves from the start; no State object is kept.
 * DOM-free. */

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

const FIRST = 1024;

/** murmur3's 32-bit mix over the words. */
function hashOf(words: Uint32Array, at: number, n: number): number {
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
