/* The Island of Crete: share links. A link carries a whole level, a line that wins it and its author's initials in
 * the URL fragment, `L1.<payload>`: base64url (no padding) of the deflate-raw bytes of this UTF-8 text.
 *
 *   by: ABC
 *   best: 54            (only when the author has a best)
 *   line: udlrwzxc      (move letters, see cache.ts)
 *   <blank line>
 *   <the level text, as serialize writes it, with an empty title and intro and no pages>
 *
 * Link text is untrusted: `decodeLink` never throws, caps what it reads (ENCODED_MAX characters before it
 * decompresses, DECODED_MAX characters while it does, board sides 3 to 64 before `parse` runs) and names each
 * refusal. It does not replay the line; the caller does, as replaying needs the engine. DOM-free. */
import { parse, LevelError } from '../puzzle/level.ts';
import type { Level } from '../puzzle/level.ts';
import { lineText, lineOf } from '../puzzle/cache.ts';
import type { Action } from '../puzzle/step.ts';
import { validInitials } from '../../../_kit/initials.ts';

// Streams, TextEncoder and TextDecoder, present in pages, workers and Node alike; declared here, as this program has no DOM.
type Chunks<T> = { getReader(): { read(): Promise<{ done: boolean; value?: T }>; cancel(): Promise<void> } };
type Sink = { getWriter(): { write(chunk: Uint8Array): Promise<void>; close(): Promise<void>; abort(): Promise<void> } };
declare const CompressionStream: new (format: 'deflate-raw') => { readable: Chunks<Uint8Array>; writable: Sink };
declare const DecompressionStream: new (format: 'deflate-raw') => { readable: Chunks<Uint8Array>; writable: Sink };
declare const setTimeout: (run: () => void, ms: number) => unknown;
declare const TextEncoder: new () => { encode(text: string): Uint8Array };
declare const TextDecoder: new (label: 'utf-8', options: { fatal: true }) => {
  decode(bytes?: Uint8Array, options?: { stream: boolean }): string;
};

export const LINK_VERSION = 'L1';
/** The most characters of payload after `L1.`; checked before anything is decompressed. */
export const ENCODED_MAX = 16_384;
/** The most characters the payload may decompress to. */
export const DECODED_MAX = 32_768;
/** The most moves in a link's line: a random line of this length on a random 64 x 64 board still fits ENCODED_MAX (deflate's literal codes cost about 3.6 bits a move there, not the 3 a packing would). */
export const MAX_LINE = 18_000;

/** Bytes of compressed input written to the decompressor at a time. */
const PIECE = 1024;
/** The longest the next piece waits for output from the last. */
const PAUSE_MS = 20;
const SIDE_MIN = 3;
const SIDE_MAX = 64;

export interface Shared {
  /** The level text as the link carries it. */
  text: string;
  level: Level;
  line: Action[];
  initials: string;
  /** The author's best, in moves; null when the author has none. */
  best: number | null;
}

export type LinkError = 'damaged' | 'too-long' | 'too-large' | 'newer' | 'not-a-link';

export const LINK_MESSAGES: Record<LinkError, string> = {
  damaged: 'This level link is damaged. Ask for the link again.',
  'too-long': 'This level link is too long to open.',
  'too-large': 'This level link is too long to open.',
  newer: 'This level was made by a newer version of the game. Reload the page and try again.',
  'not-a-link': 'This is not a level link.',
};

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const B64_RULE = /^[A-Za-z0-9_-]*$/;

function toBase64Url(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i]! << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += B64[(n >> 18) & 63]! + B64[(n >> 12) & 63]!;
    if (i + 1 < bytes.length) out += B64[(n >> 6) & 63]!;
    if (i + 2 < bytes.length) out += B64[n & 63]!;
  }
  return out;
}

/** The bytes of unpadded base64url `text`, or null when it is not. */
function fromBase64Url(text: string): Uint8Array | null {
  if (!B64_RULE.test(text) || text.length % 4 === 1) return null;
  const out = new Uint8Array(Math.floor((text.length * 3) / 4));
  let n = 0;
  let bits = 0;
  let at = 0;
  for (const ch of text) {
    n = (n << 6) | B64.indexOf(ch);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out[at++] = (n >> bits) & 255;
      n &= (1 << bits) - 1;
    }
  }
  return out;
}

async function deflate(text: string): Promise<Uint8Array> {
  const cs = new CompressionStream('deflate-raw');
  const writer = cs.writable.getWriter();
  const reader = cs.readable.getReader();
  const writing = writer.write(new TextEncoder().encode(text)).then(() => writer.close());
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value!);
    size += value!.length;
  }
  await writing;
  const out = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) { out.set(c, at); at += c.length; }
  return out;
}

/** The text `bytes` inflate to, or why not: a stream that ends early or is corrupt, or text that is not UTF-8, is
 *  damaged; more than DECODED_MAX characters is too-large. The input goes in pieces of PIECE bytes, and the next
 *  piece waits (up to PAUSE_MS) for the output of the last to be read and counted, because a stream accepts writes
 *  long before it has inflated them. So only a few pieces of work follow the count passing DECODED_MAX; then no
 *  more is written and the stream is cancelled. */
async function inflate(bytes: Uint8Array): Promise<{ text: string } | { error: 'damaged' | 'too-large' }> {
  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  const reader = ds.readable.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let stop = false;
  let chunks = 0;
  let wake: (() => void) | null = null;
  // A corrupt stream rejects the write, the close and the read alike; the read reports it.
  const writing = (async () => {
    try {
      for (let at = 0; at < bytes.length && !stop; at += PIECE) {
        const seen = chunks;
        await writer.write(bytes.subarray(at, at + PIECE));
        if (chunks === seen && !stop) await new Promise<void>(done => { wake = done; setTimeout(done, PAUSE_MS); });
      }
      if (!stop) await writer.close();
    } catch {
      // reported by the read
    }
  })();
  let text = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      chunks++;
      wake?.();
      if (text.length > DECODED_MAX) {
        stop = true;
        await reader.cancel().catch(() => undefined);
        await writer.abort().catch(() => undefined);
        return { error: 'too-large' };
      }
    }
    text += decoder.decode();
  } catch {
    stop = true;
    await writer.abort().catch(() => undefined);
    return { error: 'damaged' };
  } finally {
    await writing;
  }
  return text.length > DECODED_MAX ? { error: 'too-large' } : { text };
}

/** The fragment (without `#`) for a level text, a line, the author's initials and best. Nothing is checked: the
 *  caller shares only what it has proven, and `decodeLink` refuses a link past a limit. */
export async function encodeLink(s: { text: string; line: readonly Action[]; initials: string; best: number | null }): Promise<string> {
  const head = [`by: ${s.initials}`];
  if (s.best !== null) head.push(`best: ${s.best}`);
  head.push(`line: ${lineText(s.line)}`);
  return `${LINK_VERSION}.${toBase64Url(await deflate(`${head.join('\n')}\n\n${s.text}`))}`;
}

/** The raw grid's row count and widest row, or null when it has no row; read without parsing. */
function gridShape(text: string): { rows: number; widest: number; narrowest: number } | null {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  let i = 0;
  while (i < lines.length && /^[a-z]+: /.test(lines[i]!)) i++;
  while (i < lines.length && lines[i] === '') i++;
  let rows = 0;
  let widest = 0;
  let narrowest = Infinity;
  for (; i < lines.length && lines[i] !== ''; i++) {
    rows++;
    widest = Math.max(widest, lines[i]!.length);
    narrowest = Math.min(narrowest, lines[i]!.length);
  }
  return rows === 0 ? null : { rows, widest, narrowest };
}

const fail = (error: LinkError) => ({ ok: false, error }) as const;

/** The level, line, initials and best a fragment (without `#`) carries, or why it cannot be opened. Never throws. */
export async function decodeLink(fragment: string): Promise<{ ok: true; shared: Shared } | { ok: false; error: LinkError }> {
  try {
    const dot = fragment.indexOf('.');
    const version = dot < 0 ? fragment : fragment.slice(0, dot);
    if (!/^L[0-9]+$/.test(version)) return fail('not-a-link');
    if (version !== LINK_VERSION) return fail(dot < 0 ? 'not-a-link' : 'newer');
    if (dot < 0) return fail('not-a-link');
    const encoded = fragment.slice(dot + 1);
    if (encoded.length > ENCODED_MAX) return fail('too-long');
    const bytes = fromBase64Url(encoded);
    if (!bytes) return fail('damaged');
    const inflated = await inflate(bytes);
    if ('error' in inflated) return fail(inflated.error);

    const split = inflated.text.indexOf('\n\n');
    if (split < 0) return fail('damaged');
    const head = inflated.text.slice(0, split).split('\n');
    const text = inflated.text.slice(split + 2);
    const by = /^by: ([A-Za-z]{3})$/.exec(head[0] ?? '');
    const best = head.length === 3 ? /^best: ([0-9]{1,9})$/.exec(head[1] ?? '') : null;
    const letters = /^line: (.*)$/.exec(head[head.length - 1] ?? '');
    if (!by || !letters || head.length < 2 || head.length > 3 || (head.length === 3 && !best)) return fail('damaged');
    const initials = validInitials(by[1]);
    if (initials !== by[1]) return fail('damaged');

    const shape = gridShape(text);
    if (!shape || shape.rows < SIDE_MIN || shape.rows > SIDE_MAX || shape.narrowest < SIDE_MIN || shape.widest > SIDE_MAX) return fail('damaged');
    let level: Level;
    try {
      level = parse(text);
    } catch (e) {
      if (e instanceof LevelError) return fail('damaged');
      throw e;
    }
    if (level.title !== '' || level.intro !== '' || level.pageIds.length > 0 || level.objects.includes('page')) return fail('damaged');

    if (letters[1]!.length > MAX_LINE) return fail('too-long');
    const line = lineOf(letters[1]!);
    if (!line) return fail('damaged');
    const bestMoves = best ? Number(best[1]) : null;
    if (bestMoves !== null && bestMoves < line.length) return fail('damaged');
    return { ok: true, shared: { text, level, line, initials, best: bestMoves } };
  } catch {
    return fail('damaged');
  }
}
