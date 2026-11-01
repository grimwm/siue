// Perfect quality for a vocal take: 16-bit mono PCM as FLAC, encoded in the page. Each block of 4096 samples is a
// constant subframe when it is one value (silence), else the best of FLAC's fixed predictors (orders 0 to 4) with its
// residual Rice-coded in the best of a few partition orders. The STREAMINFO's MD5 is left zero, which FLAC reads as
// "unknown". `decodeFlac` reads back exactly this subset (constant, verbatim and fixed subframes), for the tests and
// for checking a take before it is sent. DOM-free.

export const FLAC_BLOCK = 4096;
const MAX_ORDER = 4;
const MAX_PARTITION_ORDER = 6;
const MAX_RICE = 14;

/** CRC-8, polynomial x^8 + x^2 + x + 1, as FLAC frame headers use. */
export function crc8(bytes: Uint8Array, from = 0, to = bytes.length): number {
  let c = 0;
  for (let i = from; i < to; i++) {
    c ^= bytes[i]!;
    for (let k = 0; k < 8; k++) c = c & 0x80 ? ((c << 1) ^ 0x07) & 0xff : (c << 1) & 0xff;
  }
  return c;
}

/** CRC-16, polynomial x^16 + x^15 + x^2 + 1, over a whole FLAC frame. */
export function crc16(bytes: Uint8Array, from = 0, to = bytes.length): number {
  let c = 0;
  for (let i = from; i < to; i++) {
    c ^= bytes[i]! << 8;
    for (let k = 0; k < 8; k++) c = c & 0x8000 ? ((c << 1) ^ 0x8005) & 0xffff : (c << 1) & 0xffff;
  }
  return c;
}

/** Bits written most significant first into a growing buffer. */
class BitWriter {
  buf = new Uint8Array(1 << 16);
  len = 0; // bytes complete
  private acc = 0;
  private n = 0; // bits waiting in acc
  private grow(extra: number): void {
    if (this.len + extra <= this.buf.length) return;
    let size = this.buf.length * 2;
    while (size < this.len + extra) size *= 2;
    const b = new Uint8Array(size);
    b.set(this.buf.subarray(0, this.len));
    this.buf = b;
  }
  /** Writes the low `bits` (at most 24) of `v`. */
  write(v: number, bits: number): void {
    if (bits > 24) { this.write(Math.floor(v / 2 ** 24), bits - 24); this.write(v % 2 ** 24, 24); return; }
    this.acc = (this.acc << bits) | (v & ((1 << bits) - 1));
    this.n += bits;
    this.grow(4);
    while (this.n >= 8) {
      this.n -= 8;
      this.buf[this.len++] = (this.acc >>> this.n) & 0xff;
    }
    this.acc &= (1 << this.n) - 1;
  }
  writeSigned(v: number, bits: number): void { this.write(v < 0 ? v + 2 ** bits : v, bits); }
  /** `q` zero bits then a one. */
  unary(q: number): void {
    while (q >= 24) { this.write(0, 24); q -= 24; }
    this.write(1, q + 1);
  }
  align(): void { if (this.n) this.write(0, 8 - this.n); }
  bytes(): Uint8Array { return this.buf.slice(0, this.len); }
}

const zigzag = (r: number): number => (r >= 0 ? 2 * r : -2 * r - 1);

/** The residual of fixed predictor `order` for samples `x` (first `order` are warm-up). */
function residual(x: Int32Array, order: number): Int32Array {
  const n = x.length;
  const out = new Int32Array(Math.max(0, n - order));
  for (let i = order; i < n; i++) {
    let p = 0;
    if (order === 1) p = x[i - 1]!;
    else if (order === 2) p = 2 * x[i - 1]! - x[i - 2]!;
    else if (order === 3) p = 3 * x[i - 1]! - 3 * x[i - 2]! + x[i - 3]!;
    else if (order === 4) p = 4 * x[i - 1]! - 6 * x[i - 2]! + 4 * x[i - 3]! - x[i - 4]!;
    out[i - order] = x[i]! - p;
  }
  return out;
}

/** The best Rice parameter for `sum` of zigzagged values over `count` values, and the bits it costs. */
function riceFor(values: Int32Array, from: number, to: number): { k: number; bits: number } {
  let sum = 0;
  for (let i = from; i < to; i++) sum += zigzag(values[i]!);
  const count = to - from;
  let best = { k: 0, bits: Infinity };
  for (let k = 0; k <= MAX_RICE; k++) {
    // Each value costs k + 1 bits plus its quotient; the quotients sum to about sum / 2^k.
    let q = 0;
    for (let i = from; i < to; i++) q += zigzag(values[i]!) >>> k;
    const bits = count * (k + 1) + q;
    if (bits < best.bits) best = { k, bits };
    if (Math.floor(sum / 2 ** k) === 0) break;
  }
  return best;
}

/** The partition order and parameters that code `res` (of a block of `size` with predictor `order`) in fewest bits. */
function partitions(res: Int32Array, size: number, order: number): { porder: number; ks: number[]; bits: number } {
  let best = { porder: 0, ks: [0], bits: Infinity };
  for (let po = 0; po <= MAX_PARTITION_ORDER; po++) {
    if (size % (1 << po) !== 0 || size >> po <= order) break;
    const per = size >> po;
    const ks: number[] = [];
    let bits = 6;
    let at = 0;
    for (let p = 0; p < 1 << po; p++) {
      const n = p === 0 ? per - order : per;
      const r = riceFor(res, at, at + n);
      ks.push(r.k);
      bits += 4 + r.bits;
      at += n;
    }
    if (bits < best.bits) best = { porder: po, ks, bits };
  }
  return best;
}

/** The frame number as FLAC's UTF-8-like code: a lead byte of n + 1 ones for n continuation bytes of 6 bits each. */
function utf8Number(w: BitWriter, v: number): void {
  if (v < 0x80) { w.write(v, 8); return; }
  const cont: number[] = [];
  while (v >= 2 ** (6 - cont.length)) {
    cont.unshift(0x80 | (v & 0x3f));
    v = Math.floor(v / 64);
  }
  w.write(((0xff00 >> (cont.length + 1)) & 0xff) | v, 8);
  for (const b of cont) w.write(b, 8);
}

const RATE_CODE: Record<number, number> = { 44100: 0b1001, 48000: 0b1010, 32000: 0b1000, 96000: 0b1011, 22050: 0b0110, 24000: 0b0111, 16000: 0b0101, 8000: 0b0100 };

/** One frame of the block `x`, frame number `index`. */
function frame(w: BitWriter, x: Int32Array, index: number, rate: number): void {
  const start = w.len;
  const size = x.length;
  w.write(0b11111111111110, 14);
  w.write(0, 1); // reserved
  w.write(0, 1); // fixed block size
  const sizeCode = size === FLAC_BLOCK ? 0b1100 : 0b0111;
  w.write(sizeCode, 4);
  w.write(RATE_CODE[rate] ?? 0, 4);
  w.write(0, 4); // one channel
  w.write(0b100, 3); // 16 bits a sample
  w.write(0, 1);
  utf8Number(w, index);
  if (sizeCode === 0b0111) w.write(size - 1, 16);
  w.write(crc8(w.buf, start, w.len), 8);
  // The subframe.
  let constant = true;
  for (let i = 1; i < size && constant; i++) constant = x[i] === x[0];
  if (constant) {
    w.write(0, 1); w.write(0b000000, 6); w.write(0, 1);
    w.writeSigned(x[0]!, 16);
  } else {
    let best = { order: 0, res: residual(x, 0), part: partitions(residual(x, 0), size, 0) };
    for (let order = 1; order <= Math.min(MAX_ORDER, size - 1); order++) {
      const res = residual(x, order);
      const part = partitions(res, size, order);
      if (part.bits + order * 16 < best.part.bits + best.order * 16) best = { order, res, part };
    }
    if (best.part.bits + best.order * 16 >= size * 16) {
      w.write(0, 1); w.write(0b000001, 6); w.write(0, 1);
      for (let i = 0; i < size; i++) w.writeSigned(x[i]!, 16);
    } else {
      w.write(0, 1); w.write(0b001000 | best.order, 6); w.write(0, 1);
      for (let i = 0; i < best.order; i++) w.writeSigned(x[i]!, 16);
      w.write(0b00, 2); // Rice, 4-bit parameters
      w.write(best.part.porder, 4);
      const per = size >> best.part.porder;
      let at = 0;
      best.part.ks.forEach((k, p) => {
        w.write(k, 4);
        const n = p === 0 ? per - best.order : per;
        for (let i = at; i < at + n; i++) {
          const u = zigzag(best.res[i]!);
          w.unary(u >>> k);
          if (k) w.write(u & ((1 << k) - 1), k);
        }
        at += n;
      });
    }
  }
  w.align();
  w.write(crc16(w.buf, start, w.len), 16);
}

/** `pcm` (16-bit mono at `rate`) as a FLAC file. */
export function encodeFlac(pcm: Int16Array, rate: number): Uint8Array {
  const w = new BitWriter();
  w.write(0x664c6143, 32); // "fLaC"
  w.write(1, 1); // the last metadata block
  w.write(0, 7); // STREAMINFO
  w.write(34, 24);
  const block = pcm.length < FLAC_BLOCK ? Math.max(16, pcm.length) : FLAC_BLOCK;
  w.write(block, 16);
  w.write(block, 16);
  const sizesAt = w.len; // min and max frame size, filled in after
  w.write(0, 24); w.write(0, 24);
  w.write(rate, 20);
  w.write(0, 3); // one channel
  w.write(15, 5); // 16 bits
  w.write(pcm.length, 36);
  for (let i = 0; i < 4; i++) w.write(0, 32); // MD5: unknown
  let minFrame = Infinity, maxFrame = 0;
  for (let at = 0, index = 0; at < pcm.length; at += FLAC_BLOCK, index++) {
    const end = Math.min(pcm.length, at + FLAC_BLOCK);
    const x = Int32Array.from(pcm.subarray(at, end));
    const before = w.len;
    frame(w, x, index, rate);
    minFrame = Math.min(minFrame, w.len - before);
    maxFrame = Math.max(maxFrame, w.len - before);
  }
  const out = w.bytes();
  const put24 = (at: number, v: number) => { out[at] = (v >> 16) & 0xff; out[at + 1] = (v >> 8) & 0xff; out[at + 2] = v & 0xff; };
  if (maxFrame) { put24(sizesAt, minFrame); put24(sizesAt + 3, maxFrame); }
  return out;
}

/** Bits read most significant first. */
class BitReader {
  pos = 0; // in bits
  private readonly b: Uint8Array;
  constructor(b: Uint8Array) { this.b = b; }
  read(bits: number): number {
    let v = 0;
    for (let i = 0; i < bits; i++) {
      const byte = this.b[this.pos >> 3];
      if (byte === undefined) throw new Error('the FLAC file ends early');
      v = v * 2 + ((byte >> (7 - (this.pos & 7))) & 1);
      this.pos++;
    }
    return v;
  }
  signed(bits: number): number { const v = this.read(bits); return v >= 2 ** (bits - 1) ? v - 2 ** bits : v; }
  unary(): number { let q = 0; while (this.read(1) === 0) q++; return q; }
  align(): void { this.pos = (this.pos + 7) & ~7; }
}

/** The samples of a FLAC file `encodeFlac` wrote (one channel, 16 bits); throws on anything else or a bad CRC. */
export function decodeFlac(bytes: Uint8Array): { pcm: Int16Array; rate: number } {
  const r = new BitReader(bytes);
  if (r.read(32) !== 0x664c6143) throw new Error('not a FLAC file');
  let rate = 0, total = 0, last = false;
  while (!last) {
    last = r.read(1) === 1;
    const type = r.read(7), length = r.read(24);
    const at = r.pos;
    if (type === 0) {
      r.read(16); r.read(16); r.read(24); r.read(24);
      rate = r.read(20);
      if (r.read(3) !== 0 || r.read(5) !== 15) throw new Error('not 16-bit mono');
      total = r.read(36);
    }
    r.pos = at + length * 8;
  }
  const pcm = new Int16Array(total);
  let done = 0;
  while (done < total) {
    const start = r.pos >> 3;
    if (r.read(14) !== 0b11111111111110) throw new Error('lost the frame sync');
    r.read(2);
    const sizeCode = r.read(4);
    r.read(4); r.read(4); r.read(3); r.read(1);
    let first = r.read(8);
    while ((first & 0xc0) === 0xc0) { r.read(8); first = (first << 1) & 0xff; }
    const size = sizeCode === 0b1100 ? FLAC_BLOCK : sizeCode === 0b0111 ? r.read(16) + 1 : sizeCode === 0b0110 ? r.read(8) + 1 : 0;
    if (!size) throw new Error('a block size this reader does not know');
    const headerEnd = r.pos >> 3;
    if (r.read(8) !== crc8(bytes, start, headerEnd)) throw new Error('a frame header CRC is wrong');
    r.read(1);
    const type = r.read(6);
    r.read(1);
    const x = new Int32Array(size);
    if (type === 0) x.fill(r.signed(16));
    else if (type === 1) for (let i = 0; i < size; i++) x[i] = r.signed(16);
    else if ((type & 0b111000) === 0b001000) {
      const order = type & 7;
      for (let i = 0; i < order; i++) x[i] = r.signed(16);
      if (r.read(2) !== 0) throw new Error('only 4-bit Rice parameters');
      const po = r.read(4);
      const per = size >> po;
      let i = order;
      for (let p = 0; p < 1 << po; p++) {
        const k = r.read(4);
        const n = p === 0 ? per - order : per;
        for (let j = 0; j < n; j++, i++) {
          const u = r.unary() * 2 ** k + (k ? r.read(k) : 0);
          const res = u % 2 === 0 ? u / 2 : -(u + 1) / 2;
          let pred = 0;
          if (order === 1) pred = x[i - 1]!;
          else if (order === 2) pred = 2 * x[i - 1]! - x[i - 2]!;
          else if (order === 3) pred = 3 * x[i - 1]! - 3 * x[i - 2]! + x[i - 3]!;
          else if (order === 4) pred = 4 * x[i - 1]! - 6 * x[i - 2]! + 4 * x[i - 3]! - x[i - 4]!;
          x[i] = pred + res;
        }
      }
    } else throw new Error('a subframe type this reader does not know');
    r.align();
    const end = r.pos >> 3;
    if (r.read(16) !== crc16(bytes, start, end)) throw new Error('a frame CRC is wrong');
    pcm.set(x, done);
    done += size;
  }
  return { pcm, rate };
}
