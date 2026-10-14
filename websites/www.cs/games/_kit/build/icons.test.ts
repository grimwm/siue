// websites/www.cs/games/_kit/build/icons.test.ts
// The icon renderer: the variant drawings, what each looks like in pixels,
// and the six files a game gets.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ICONS, iconSvg, rasterize, renderPng, writeIcons, checkIcons } from './icons.mjs';

const SOURCE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">'
  + '<g id="bg"><rect width="512" height="512" fill="#112233"/></g>'
  + '<g id="art"><circle cx="256" cy="256" r="100" fill="#ff0000"/></g></svg>';
const at = (img, x, y) => Array.from(img.pixels.slice((y * img.width + x) * 4, (y * img.width + x) * 4 + 4));
const pngSize = png => [png.readUInt32BE(16), png.readUInt32BE(20)];

test('a game gets six icons: any, maskable, monochrome and Apple', () => {
  assert.deepEqual(ICONS.map(i => [i.file, i.size, i.look]), [
    ['icon-192.png', 192, 'full'], ['icon-512.png', 512, 'full'],
    ['icon-maskable-192.png', 192, 'safe'], ['icon-maskable-512.png', 512, 'safe'],
    ['icon-monochrome-512.png', 512, 'mono'], ['icon-apple-180.png', 180, 'full'],
  ]);
});

test('a drawing without its two groups is refused', () => {
  assert.throws(() => iconSvg('<svg><rect/></svg>', 'full'), /id="bg".*id="art"/);
});

test('the full look is the drawing as drawn', () => {
  const img = rasterize(iconSvg(SOURCE, 'full'), 512);
  assert.deepEqual(at(img, 2, 2), [0x11, 0x22, 0x33, 255]);
  assert.deepEqual(at(img, 256, 256), [255, 0, 0, 255]);
  assert.deepEqual(at(img, 256 + 95, 256), [255, 0, 0, 255]);
});

test('the safe look keeps the backdrop full-bleed and shrinks the art into the safe zone', () => {
  const img = rasterize(iconSvg(SOURCE, 'safe'), 512);
  assert.deepEqual(at(img, 2, 2), [0x11, 0x22, 0x33, 255]);
  assert.deepEqual(at(img, 256, 256), [255, 0, 0, 255]);
  assert.deepEqual(at(img, 256 + 95, 256), [0x11, 0x22, 0x33, 255], 'the 100 px circle is 80 px now');
});

test('the mono look is the safe-zone art in white on transparent', () => {
  const img = rasterize(iconSvg(SOURCE, 'mono'), 512);
  assert.equal(at(img, 2, 2)[3], 0);
  assert.deepEqual(at(img, 256, 256), [255, 255, 255, 255]);
  assert.equal(at(img, 256 + 95, 256)[3], 0);
});

test('a rendered icon is a PNG of its size', () => {
  assert.deepEqual(pngSize(renderPng(iconSvg(SOURCE, 'full'), 180)), [180, 180]);
});

test('writeIcons renders a game folder\'s six icons from tools/icon.svg', () => {
  const dir = mkdtempSync(join(tmpdir(), 'icons-'));
  try {
    mkdirSync(join(dir, 'tools'));
    writeFileSync(join(dir, 'tools', 'icon.svg'), SOURCE);
    assert.deepEqual(writeIcons(dir), ICONS.map(i => i.file));
    for (const icon of ICONS) assert.deepEqual(pngSize(readFileSync(join(dir, icon.file))), [icon.size, icon.size], icon.file);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('install-core.php checks exactly the icons this renders', () => {
  const php = readFileSync(join(import.meta.dirname, '..', 'php', 'install-core.php'), 'utf8');
  const listed = [...php.matchAll(/\['file' => '([^']+)', 'size' => (\d+)/g)].map(m => [m[1], Number(m[2])]);
  assert.deepEqual(listed, ICONS.map(i => [i.file, i.size]));
});

test('--check passes on fresh icons, names a changed drawing or a missing icon, and writes nothing', () => {
  const dir = mkdtempSync(join(tmpdir(), 'icons-check-'));
  try {
    mkdirSync(join(dir, 'tools'));
    writeFileSync(join(dir, 'tools', 'icon.svg'), SOURCE);
    assert.match(checkIcons(dir)[0], /tools\/icons\.json is missing/);
    writeIcons(dir);
    assert.deepEqual(checkIcons(dir), []);
    const before = readFileSync(join(dir, 'icon-512.png'));
    writeFileSync(join(dir, 'tools', 'icon.svg'), SOURCE.replace('#ff0000', '#00ff00'));
    assert.match(checkIcons(dir).join('\n'), /icon\.svg changed since the icons were rendered/);
    assert.deepEqual(readFileSync(join(dir, 'icon-512.png')), before, 'checking rewrites nothing');
    writeFileSync(join(dir, 'tools', 'icon.svg'), SOURCE);
    rmSync(join(dir, 'icon-apple-180.png'));
    assert.deepEqual(checkIcons(dir), ['icon-apple-180.png is missing']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('--check names icons rendered by another renderer version', () => {
  const dir = mkdtempSync(join(tmpdir(), 'icons-version-'));
  try {
    mkdirSync(join(dir, 'tools'));
    writeFileSync(join(dir, 'tools', 'icon.svg'), SOURCE);
    writeIcons(dir);
    const record = JSON.parse(readFileSync(join(dir, 'tools', 'icons.json'), 'utf8'));
    writeFileSync(join(dir, 'tools', 'icons.json'), JSON.stringify({ ...record, resvg: '0.0.1' }));
    assert.match(checkIcons(dir).join('\n'), /rendered with @resvg\/resvg-js 0\.0\.1/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
