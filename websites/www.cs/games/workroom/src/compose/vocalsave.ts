// Save To Studio for vocal takes: each take on this device made both ways for real, Perfect (FLAC) and Good To The
// Ear (Opus), so the person sees their exact sizes and what each leaves of the studio before choosing; then the chosen
// bytes named by their SHA-256 (vocal-<sha256>.<ext>) and the score's local names changed to them. The encoders and
// the hash are injected, so the tests hand in fakes. DOM-free.
import type { EditDoc } from './doc.ts';
import { encodeFlac } from './flac.ts';
import type { OpusFile } from './opus.ts';
import { renameTake } from './vocal.ts';

export type Quality = 'perfect' | 'ear';
export const QUALITY_LABELS: Record<Quality, string> = { perfect: 'Perfect', ear: 'Good To The Ear' };

export interface Encoded { bytes: Uint8Array; ext: 'flac' | 'ogg' | 'webm' }
export interface TakeSizes { perfect: Encoded; ear: Encoded | null; seconds: number }

export interface SavePorts {
  /** Good To The Ear from 16-bit samples at `rate`; null where the browser cannot make Opus. */
  opus(pcm: Int16Array, rate: number): Promise<OpusFile | null>;
  sha256(bytes: Uint8Array): Promise<string>;
}

/** A take made both ways. */
export async function sizesFor(pcm: Int16Array, rate: number, ports: Pick<SavePorts, 'opus'>): Promise<TakeSizes> {
  const perfect: Encoded = { bytes: encodeFlac(pcm, rate), ext: 'flac' };
  const opus = await ports.opus(pcm, rate);
  return { perfect, ear: opus ? { bytes: opus.bytes, ext: opus.ext } : null, seconds: pcm.length / rate };
}

/** What a choice leaves: bytes of studio room, and about how many minutes more of singing that is at the same quality. */
export function leaves(room: number, enc: Encoded, seconds: number): { bytes: number; minutes: number } {
  const left = room - enc.bytes.length;
  const perMinute = seconds > 0 ? (enc.bytes.length / seconds) * 60 : Infinity;
  return { bytes: left, minutes: left > 0 && Number.isFinite(perMinute) ? Math.floor((left / perMinute) * 10) / 10 : 0 };
}

/** A size as the studio says it ("1.2 MB", "926 KB"): music/lib/Usage.php's human(). */
export function humanBytes(bytes: number): string {
  const b = Math.max(0, bytes);
  if (b >= 1_048_576) {
    const mb = (b / 1_048_576).toFixed(1);
    return `${mb.endsWith('.0') ? mb.slice(0, -2) : mb} MB`;
  }
  return `${Math.round(b / 1024)} KB`;
}

export const takeFile = (hash: string, ext: Encoded['ext']): string => `vocal-${hash}.${ext}`;

/** The document with each chosen local take renamed to its studio file, and those files' bytes for the bundle. */
export async function withSavedTakes(doc: EditDoc, chosen: ReadonlyMap<string, { enc: Encoded; seconds: number }>, ports: Pick<SavePorts, 'sha256'>):
  Promise<{ doc: EditDoc; files: Record<string, Uint8Array>; names: Map<string, string> }> {
  let next = doc;
  const files: Record<string, Uint8Array> = {};
  const names = new Map<string, string>();
  for (const [local, { enc, seconds }] of chosen) {
    const name = takeFile(await ports.sha256(enc.bytes), enc.ext);
    files[name] = enc.bytes;
    names.set(local, name);
    next = renameTake(next, local, name, Math.round(seconds * 1000) / 1000);
  }
  return { doc: next, files, names };
}
