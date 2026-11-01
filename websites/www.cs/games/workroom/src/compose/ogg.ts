// Good To The Ear for a vocal take: Opus packets in an Ogg file (RFC 7845), as the page writes them from WebCodecs'
// encoder, and the samples each Opus packet holds, read from its TOC byte (RFC 6716 §3.1). The server counts a take's
// length the same way. DOM-free.

/** Opus always runs at 48 kHz: granule positions and pre-skip count 48 kHz samples. */
export const OPUS_RATE = 48000;
/** libopus's lookahead at 48 kHz, the pre-skip when the encoder does not say. */
export const DEFAULT_PRE_SKIP = 312;

let table: Uint32Array | null = null;
/** Ogg's CRC-32: polynomial 0x04C11DB7, not reflected, starting at zero. */
export function oggCrc(bytes: Uint8Array): number {
  if (!table) {
    table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i << 24;
      for (let k = 0; k < 8; k++) c = c & 0x80000000 ? (c << 1) ^ 0x04c11db7 : c << 1;
      table[i] = c >>> 0;
    }
  }
  let c = 0;
  for (const b of bytes) c = ((c << 8) ^ table[((c >>> 24) ^ b) & 0xff]!) >>> 0;
  return c;
}

/** The 48 kHz samples in one Opus packet, or 0 for a packet that is not one. */
export function opusPacketSamples(packet: Uint8Array): number {
  if (packet.length < 1) return 0;
  const toc = packet[0]!;
  const config = toc >> 3;
  // Frame lengths in 48 kHz samples: SILK 10/20/40/60 ms, hybrid 10/20 ms, CELT 2.5/5/10/20 ms.
  const frame = config < 12 ? [480, 960, 1920, 2880][config & 3]! : config < 16 ? [480, 960][config & 1]! : [120, 240, 480, 960][config & 3]!;
  const code = toc & 3;
  const frames = code === 0 ? 1 : code < 3 ? 2 : packet.length < 2 ? 0 : packet[1]! & 0x3f;
  const total = frame * frames;
  return total > 5760 ? 0 : total; // a packet holds at most 120 ms
}

const u16 = (v: number): number[] => [v & 0xff, (v >> 8) & 0xff];
const u32 = (v: number): number[] => [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff];
const u64 = (v: number): number[] => [...u32(v % 2 ** 32), ...u32(Math.floor(v / 2 ** 32))];

/** One Ogg page holding `segments` (each at most 255 bytes, a 255 meaning the packet goes on). */
function page(flags: number, granule: number, serial: number, seq: number, lacing: number[], body: Uint8Array): Uint8Array {
  const head = [0x4f, 0x67, 0x67, 0x53, 0, flags, ...u64(granule), ...u32(serial), ...u32(seq), 0, 0, 0, 0, lacing.length, ...lacing];
  const out = new Uint8Array(head.length + body.length);
  out.set(head);
  out.set(body, head.length);
  const crc = oggCrc(out);
  out.set(u32(crc), 22);
  return out;
}

/** The OpusHead packet for one channel. */
export function opusHead(preSkip: number, inputRate: number): Uint8Array {
  return Uint8Array.from([...new TextEncoder().encode('OpusHead'), 1, 1, ...u16(preSkip), ...u32(inputRate), 0, 0, 0]);
}

/**
 * Opus `packets` (one channel) as an Ogg Opus file: OpusHead, OpusTags, then audio pages of up to about 1 second each.
 * The last page's granule position is pre-skip plus `samples`, the take's length at 48 kHz, so players trim the end.
 */
export function muxOggOpus(packets: readonly Uint8Array[], preSkip: number, inputRate: number, samples: number, serial = 0x5149554f): Uint8Array {
  const parts: Uint8Array[] = [];
  let seq = 0;
  parts.push(page(2, 0, serial, seq++, [19], opusHead(preSkip, inputRate)));
  const vendor = new TextEncoder().encode('siue music');
  const tags = Uint8Array.from([...new TextEncoder().encode('OpusTags'), ...u32(vendor.length), ...vendor, ...u32(0)]);
  parts.push(page(0, 0, serial, seq++, [tags.length], tags));
  let granule = 0;
  const end = preSkip + samples;
  let lacing: number[] = [];
  let body: number[] = [];
  let pageSamples = 0;
  const flush = (last: boolean) => {
    parts.push(page(last ? 4 : 0, last ? end : Math.min(granule, end), serial, seq++, lacing, Uint8Array.from(body)));
    lacing = []; body = []; pageSamples = 0;
  };
  packets.forEach((p, i) => {
    const segs = Math.floor(p.length / 255) + 1;
    if (lacing.length + segs > 255) flush(false);
    for (let k = 0; k < segs - 1; k++) lacing.push(255);
    lacing.push(p.length % 255);
    body.push(...p);
    granule += opusPacketSamples(p);
    pageSamples += opusPacketSamples(p);
    if (i === packets.length - 1) flush(true);
    else if (pageSamples >= OPUS_RATE) flush(false);
  });
  if (!packets.length) flush(true);
  return concat(parts);
}

export function concat(parts: readonly Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}

/** The pages of an Ogg file, each checked against its CRC; throws on a bad one. For the tests and the page's own checks. */
export function readOggPackets(bytes: Uint8Array): { packets: Uint8Array[]; granule: number } {
  const packets: Uint8Array[] = [];
  let pending: number[] = [];
  let at = 0, granule = 0;
  while (at < bytes.length) {
    if (bytes[at] !== 0x4f || bytes[at + 1] !== 0x67 || bytes[at + 2] !== 0x67 || bytes[at + 3] !== 0x53) throw new Error('lost the Ogg page sync');
    const n = bytes[at + 26]!;
    const lacing = [...bytes.subarray(at + 27, at + 27 + n)];
    const size = 27 + n + lacing.reduce((a, b) => a + b, 0);
    const pg = bytes.slice(at, at + size);
    const crc = pg[22]! | (pg[23]! << 8) | (pg[24]! << 16) | (pg[25]! << 24);
    pg.fill(0, 22, 26);
    if (oggCrc(pg) !== crc >>> 0) throw new Error('an Ogg page CRC is wrong');
    granule = bytes[at + 6]! + bytes[at + 7]! * 2 ** 8 + bytes[at + 8]! * 2 ** 16 + bytes[at + 9]! * 2 ** 24 + bytes[at + 10]! * 2 ** 32;
    let p = at + 27 + n;
    for (const l of lacing) {
      pending.push(...bytes.subarray(p, p + l));
      p += l;
      if (l < 255) { packets.push(Uint8Array.from(pending)); pending = []; }
    }
    at += size;
  }
  return { packets, granule };
}
