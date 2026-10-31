// Crete's title card picture: both framings are on disk as WebP at their rendered sizes, each small enough for a
// phone, and game.css shows the wide one on a landscape frame and the tall one on a portrait frame.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

/** A lossy WebP's canvas size, from its VP8 frame header. */
function webpSize(file: string): { w: number; h: number } {
  const b = readFileSync(file);
  assert.equal(b.toString('ascii', 0, 4), 'RIFF', `${file} is a RIFF file`);
  assert.equal(b.toString('ascii', 8, 12), 'WEBP', `${file} is a WebP`);
  assert.equal(b.toString('ascii', 12, 16), 'VP8 ', `${file} is lossy WebP`);
  return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
}

for (const [frame, w, h] of [['wide', 1920, 1080], ['tall', 1080, 1920]] as const) {
  test(`the ${frame} title picture is a ${w}x${h} WebP under 250 KB`, () => {
    const file = `${root}fx/title/title-${frame}.webp`;
    assert.deepEqual(webpSize(file), { w, h });
    assert.ok(statSync(file).size < 250 * 1024, `${file} is ${statSync(file).size} bytes`);
  });
}

test('game.css puts the wide picture behind the title card, and the tall one on a portrait frame', () => {
  const css = readFileSync(`${root}game.css`, 'utf8');
  const base = /#title-veil \{[^}]*url\("fx\/title\/title-wide\.webp"\)/.exec(css);
  assert.ok(base, 'the title veil names the wide picture');
  const portrait = /@container frame \(orientation: portrait\) \{\s*#title-veil \{[^}]*url\("fx\/title\/title-tall\.webp"\)/.exec(css);
  assert.ok(portrait, 'a portrait frame swaps in the tall picture');
});
