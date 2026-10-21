/* The Island of Crete: a file of bytes read and written at offsets, where the search keeps the nodes that do not
 * fit in memory (store.ts). `memoryFile` keeps it in an array; `handleFile` in a file opened for synchronous access
 * (the origin private file system's sync access handle, in the solver's worker). Any method may throw (no room, no
 * access). DOM-free. */

export interface PagedFile {
  /** Fills `into` from `offset`; bytes past the end read as zero. The store never reads past the end: a file shorter
   *  than what it wrote is a failure of the file. */
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

/** The part of a sync access handle (FileSystemSyncAccessHandle) the search uses. */
export interface SyncHandle {
  read(buffer: Uint8Array, options: { at: number }): number;
  write(buffer: Uint8Array, options: { at: number }): number;
  getSize(): number;
  truncate(size: number): void;
}

/** A file over a sync access handle. Its size is the handle's; a read that returns fewer bytes than the file holds
 *  there, or a write that takes fewer than it was given, throws. */
export function handleFile(h: SyncHandle): PagedFile {
  return {
    read(offset, into) {
      const want = Math.max(0, Math.min(into.length, h.getSize() - offset));
      const got = want > 0 ? h.read(into.subarray(0, want), { at: offset }) : 0;
      if (got !== want) throw new Error(`short read: ${got} of ${want} bytes at ${offset}`);
      into.fill(0, want);
    },
    write(offset, from) {
      const put = h.write(from, { at: offset });
      if (put !== from.length) throw new Error(`short write: ${put} of ${from.length} bytes at ${offset}`);
    },
    size: () => h.getSize(),
    truncate: n => h.truncate(n),
  };
}
