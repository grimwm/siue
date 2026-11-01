// A zip file of stored (uncompressed) entries, for Export With Vocals: the takes are FLAC or Opus already, so
// squeezing them again saves nothing. CRC-32 as zip uses it (reflected, polynomial 0xEDB88320). DOM-free.

let table: Uint32Array | null = null;
export function crc32(bytes: Uint8Array): number {
  if (!table) {
    table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[i] = c >>> 0;
    }
  }
  let c = 0xffffffff;
  for (const b of bytes) c = table[(c ^ b) & 0xff]! ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** `files` (name => bytes, in order) as a zip of stored entries. */
export function writeZip(files: ReadonlyMap<string, Uint8Array>): Uint8Array {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  const u16 = (v: number) => [v & 0xff, (v >> 8) & 0xff];
  const u32 = (v: number) => [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff];
  for (const [name, data] of files) {
    const n = enc.encode(name);
    const crc = crc32(data);
    // Version 2.0, UTF-8 names (bit 11), stored, a fixed 1980-01-01 time so the same piece zips the same.
    const common = [...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(n.length), ...u16(0)];
    const local = Uint8Array.from([...u32(0x04034b50), ...common, ...n]);
    parts.push(local, data);
    central.push(Uint8Array.from([...u32(0x02014b50), ...u16(20), ...common, ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset), ...n]));
    offset += local.length + data.length;
  }
  const size = central.reduce((s, c) => s + c.length, 0);
  const end = Uint8Array.from([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.size), ...u16(files.size), ...u32(size), ...u32(offset), ...u16(0)]);
  const all = [...parts, ...central, end];
  const out = new Uint8Array(all.reduce((s, p) => s + p.length, 0));
  let at = 0;
  for (const p of all) { out.set(p, at); at += p.length; }
  return out;
}
