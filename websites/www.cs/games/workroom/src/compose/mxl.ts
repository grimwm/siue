// Compressed MusicXML (.mxl): a zip whose META-INF/container.xml names the score inside it. Read in memory and never
// written anywhere: the central directory is read, only container.xml and the one file it names are unzipped, and
// unzipping stops at 20 MB however small the file says it is. A path that is absolute or climbs out with ".." is
// refused, as are encryption and any compression but stored and deflate. Inflating is a port (the browser's
// DecompressionStream). DOM-free.
import { ImportError } from './music-file.ts';

/** The most an .mxl may unzip to, in bytes. */
export const MXL_LIMIT = 20 * 1024 * 1024;
const CONTAINER = 'META-INF/container.xml';

export type Inflate = (raw: Uint8Array, limit: number) => Promise<Uint8Array>;

interface ZipEntry { name: string; method: number; flags: number; compressed: number; size: number; offset: number }

const damaged = (): ImportError => new ImportError('This .mxl file is damaged or is not a zip of MusicXML. Export the piece again.');

function entries(bytes: Uint8Array): ZipEntry[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  // The end of central directory record: within the last 64 KB (its comment can be that long).
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65535); i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw damaged();
  const total = view.getUint16(eocd + 10, true);
  const start = view.getUint32(eocd + 16, true);
  if (total === 0xffff || start === 0xffffffff) throw new ImportError('This .mxl file is far larger than any score, so the workroom will not open it.');
  const out: ZipEntry[] = [];
  let at = start;
  for (let n = 0; n < total; n++) {
    if (at + 46 > bytes.length || view.getUint32(at, true) !== 0x02014b50) throw damaged();
    const nameLength = view.getUint16(at + 28, true);
    const skip = nameLength + view.getUint16(at + 30, true) + view.getUint16(at + 32, true);
    if (at + 46 + nameLength > bytes.length) throw damaged();
    out.push({
      flags: view.getUint16(at + 8, true), method: view.getUint16(at + 10, true), compressed: view.getUint32(at + 20, true), size: view.getUint32(at + 24, true),
      name: new TextDecoder().decode(bytes.subarray(at + 46, at + 46 + nameLength)), offset: view.getUint32(at + 42, true),
    });
    at += 46 + skip;
  }
  return out;
}

async function contents(bytes: Uint8Array, e: ZipEntry, inflate: Inflate, room: number): Promise<Uint8Array> {
  if (e.flags & 1) throw new ImportError('This .mxl file is password-protected, so the workroom cannot read it.');
  if (e.method !== 0 && e.method !== 8) throw new ImportError('This .mxl file is compressed in a way the workroom cannot unzip. Export it again from your notation program.');
  if (e.size > room) throw new ImportError('This .mxl file would unzip to more than 20 MB, far more than any score needs.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (e.offset + 30 > bytes.length || view.getUint32(e.offset, true) !== 0x04034b50) throw damaged();
  const data = e.offset + 30 + view.getUint16(e.offset + 26, true) + view.getUint16(e.offset + 28, true);
  if (data + e.compressed > bytes.length) throw damaged();
  const raw = bytes.subarray(data, data + e.compressed);
  if (e.method === 0) return raw;
  return inflate(raw, room);
}

function decode(bytes: Uint8Array): string {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder('utf-16le').decode(bytes.subarray(2));
  if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder('utf-16be').decode(bytes.subarray(2));
  return new TextDecoder().decode(bytes);
}

/** The MusicXML text of the score an .mxl's container names. Throws ImportError, in words for the page, when it cannot. */
export async function unzipMusicXml(bytes: Uint8Array, inflate: Inflate): Promise<string> {
  const list = entries(bytes);
  const container = list.find(e => e.name === CONTAINER);
  if (!container) throw new ImportError('This .mxl file has no container (META-INF/container.xml), so the score in it cannot be found.');
  let room = MXL_LIMIT;
  const head = await contents(bytes, container, inflate, room);
  room -= head.length;
  const path = /<rootfile\b[^>]*\bfull-path\s*=\s*(["'])(.*?)\1/.exec(decode(head))?.[2];
  if (!path) throw new ImportError('This .mxl file\'s container names no score.');
  if (/^[\\/]|^[a-z]:/i.test(path) || path.includes('\\') || path.split('/').some(s => s === '..')) throw new ImportError('This .mxl file points to a score outside itself, which the workroom will not follow.');
  const score = list.find(e => e.name === path);
  if (!score) throw new ImportError(`This .mxl file names its score ${path}, but that file is not in it.`);
  return decode(await contents(bytes, score, inflate, room));
}

/** Inflates raw deflate data with the browser's DecompressionStream, stopping as soon as it passes `limit` bytes. */
export async function browserInflate(raw: Uint8Array, limit: number): Promise<Uint8Array> {
  const stream = new Blob([raw as Uint8Array<ArrayBuffer>]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  const reader = stream.getReader();
  const parts: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) { void reader.cancel(); throw new ImportError('This .mxl file would unzip to more than 20 MB, far more than any score needs.'); }
      parts.push(value);
    }
  } catch (e) {
    if (e instanceof ImportError) throw e;
    throw damaged();
  }
  const out = new Uint8Array(size);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}
