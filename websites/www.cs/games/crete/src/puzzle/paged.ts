/* The Island of Crete: a file of bytes read and written at offsets, where the search keeps the nodes that do not
 * fit in memory (store.ts). The page backs it with the Origin Private File System; `memoryFile` keeps it in an
 * array, for tests and wherever no disk is at hand. Any method may throw (no room, no access). DOM-free. */

export interface PagedFile {
  /** Fills `into` from `offset`; bytes past the end read as zero. */
  read(offset: number, into: Uint8Array): void;
  /** Writes `from` at `offset`, growing the file (with zeros in any gap) as needed. */
  write(offset: number, from: Uint8Array): void;
  size(): number;
  /** Cuts the file to `size` bytes, or grows it with zeros. */
  truncate(size: number): void;
}

/** A file in memory: one array that grows by doubling. */
export function memoryFile(): PagedFile {
  let bytes = new Uint8Array(0);
  let size = 0;
  const room = (n: number) => {
    if (n <= bytes.length) return;
    const b = new Uint8Array(Math.max(n, bytes.length * 2, 4096));
    b.set(bytes.subarray(0, size));
    bytes = b;
  };
  return {
    read(offset, into) {
      const n = Math.max(0, Math.min(into.length, size - offset));
      into.set(bytes.subarray(offset, offset + n));
      into.fill(0, n);
    },
    write(offset, from) {
      room(offset + from.length);
      bytes.set(from, offset);
      size = Math.max(size, offset + from.length);
    },
    size: () => size,
    truncate(n) {
      if (n > size) room(n);
      bytes.fill(0, Math.min(n, size), Math.max(n, size));
      size = n;
    },
  };
}
