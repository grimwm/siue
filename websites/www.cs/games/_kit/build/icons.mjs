#!/usr/bin/env node
// Renders a game's install icons from one drawing, <game>/tools/icon.svg:
//   node _kit/build/icons.mjs <game>      (from websites/www.cs/games)
// The drawing is 512x512 with two groups: id="bg", the full-bleed backdrop,
// and id="art", which stays within 256 px of the centre. Maskable and
// monochrome icons scale the art by 0.8 into the safe zone (radius 204.8).
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

export const ICONS = [
  { file: 'icon-192.png', size: 192, look: 'full' },
  { file: 'icon-512.png', size: 512, look: 'full' },
  { file: 'icon-maskable-192.png', size: 192, look: 'safe' },
  { file: 'icon-maskable-512.png', size: 512, look: 'safe' },
  { file: 'icon-monochrome-512.png', size: 512, look: 'mono' },
  { file: 'icon-apple-180.png', size: 180, look: 'full' },
];

const SAFE_ART = '<g transform="translate(51.2 51.2) scale(0.8)"><use href="#art"/></g>';
const WHITE = '<filter id="icon-mono" filterUnits="userSpaceOnUse" x="0" y="0" width="512" height="512">'
  + '<feFlood flood-color="#fff"/><feComposite in2="SourceAlpha" operator="in"/></filter>';

/** One variant: the source's groups become definitions, placed per look. */
export function iconSvg(source, look) {
  if (!/id="bg"/.test(source) || !/id="art"/.test(source)) {
    throw new Error('icon.svg needs a group id="bg" and a group id="art"');
  }
  const inner = source.replace(/^[\s\S]*?<svg\b[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const body = look === 'full' ? '<use href="#bg"/><use href="#art"/>'
    : look === 'safe' ? `<use href="#bg"/>${SAFE_ART}`
    : `${WHITE}<g filter="url(#icon-mono)">${SAFE_ART}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512"><defs>${inner}</defs>${body}</svg>`;
}

function render(svg, size) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: size }, font: { loadSystemFonts: false } }).render();
}

/** RGBA pixels, for tests. */
export function rasterize(svg, size) {
  const img = render(svg, size);
  return { width: img.width, height: img.height, pixels: img.pixels };
}

export function renderPng(svg, size) {
  return render(svg, size).asPng();
}

export function writeIcons(gameDir) {
  const source = readFileSync(join(gameDir, 'tools', 'icon.svg'), 'utf8');
  for (const icon of ICONS) writeFileSync(join(gameDir, icon.file), renderPng(iconSvg(source, icon.look), icon.size));
  return ICONS.map(i => i.file);
}

if (resolve(process.argv[1] ?? '') === resolve(import.meta.filename)) {
  const name = process.argv[2];
  if (!name) {
    console.error('usage: node _kit/build/icons.mjs <game>');
    process.exit(1);
  }
  for (const f of writeIcons(resolve(import.meta.dirname, '..', '..', name))) console.log(`icons: wrote ${name}/${f}`);
}
