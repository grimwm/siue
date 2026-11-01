// Compressed MusicXML (.mxl): read in memory, stored or deflated; refused when it points outside itself, has no
// container, or would unzip past 20 MB.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateRawSync } from 'node:zlib';
import { browserInflate, MXL_LIMIT, unzipMusicXml } from '../src/compose/mxl.ts';
import { ImportError } from '../src/compose/music-file.ts';

const SCORE = readFileSync(join(import.meta.dirname, 'fixtures', 'import', 'musescore-quartet.musicxml'), 'utf8');
const container = (path: string): string =>
  `<?xml version="1.0" encoding="UTF-8"?><container><rootfiles><rootfile full-path="${path}" media-type="application/vnd.recordare.musicxml+xml"/></rootfiles></container>`;

/** A zip of the files, each stored (method 0) or deflated (8). CRCs are left 0: the reader does not check them. */
export function zip(files: { name: string; data: Uint8Array | string; deflate?: boolean }[]): Uint8Array {
  const enc = new TextEncoder();
  const locals: number[] = [];
  const central: number[] = [];
  const u16 = (n: number) => [n & 255, (n >> 8) & 255];
  const u32 = (n: number) => [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255];
  for (const f of files) {
    const raw = typeof f.data === 'string' ? enc.encode(f.data) : f.data;
    const body = f.deflate ? new Uint8Array(deflateRawSync(raw)) : raw;
    const name = [...enc.encode(f.name)];
    const offset = locals.length;
    const common = [...u16(20), ...u16(0), ...u16(f.deflate ? 8 : 0), ...u16(0), ...u16(0), ...u32(0), ...u32(body.length), ...u32(raw.length), ...u16(name.length)];
    locals.push(...u32(0x04034b50), ...common, ...u16(0), ...name, ...body);
    central.push(...u32(0x02014b50), ...u16(20), ...common, ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset), ...name);
  }
  const end = [...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(central.length), ...u32(locals.length), ...u16(0)];
  return new Uint8Array([...locals, ...central, ...end]);
}

test('reads a stored and a deflated .mxl alike', async () => {
  for (const deflate of [false, true]) {
    const bytes = zip([{ name: 'META-INF/container.xml', data: container('score.xml'), deflate }, { name: 'score.xml', data: SCORE, deflate }]);
    assert.equal(await unzipMusicXml(bytes, browserInflate), SCORE);
  }
});

test('refuses a path outside the file, an absolute path, and a missing container', async () => {
  const bad = async (bytes: Uint8Array, why: RegExp) => assert.rejects(unzipMusicXml(bytes, browserInflate), (e: unknown) => e instanceof ImportError && why.test(e.message));
  await bad(zip([{ name: 'META-INF/container.xml', data: container('../evil.xml') }, { name: 'score.xml', data: SCORE }]), /outside/);
  await bad(zip([{ name: 'META-INF/container.xml', data: container('/etc/score.xml') }, { name: 'score.xml', data: SCORE }]), /outside/);
  await bad(zip([{ name: 'score.xml', data: SCORE }]), /container/);
  await bad(zip([{ name: 'META-INF/container.xml', data: container('missing.xml') }]), /missing\.xml/);
  await bad(new TextEncoder().encode('PK not really a zip'), /damaged|not a/);
});

test('refuses one that would unzip past 20 MB', async () => {
  const huge = new Uint8Array(MXL_LIMIT + 1024);
  const bytes = zip([{ name: 'META-INF/container.xml', data: container('score.xml'), deflate: true }, { name: 'score.xml', data: huge, deflate: true }]);
  assert.ok(bytes.length < 100_000, 'the zip itself is small');
  await assert.rejects(unzipMusicXml(bytes, browserInflate), (e: unknown) => e instanceof ImportError && /20 MB/.test(e.message));
  // A lying header (claiming a small size) is caught while inflating.
  const lying = zip([{ name: 'META-INF/container.xml', data: container('score.xml') }, { name: 'score.xml', data: huge, deflate: true }]);
  const view = new DataView(lying.buffer);
  for (let i = 0; i + 4 <= lying.length; i++) if (view.getUint32(i, true) === 0x02014b50 && i > 0) view.setUint32(i + 24, 100, true);
  await assert.rejects(unzipMusicXml(lying, browserInflate), (e: unknown) => e instanceof ImportError && /20 MB/.test(e.message));
});
