// build_music.sh's modes that need no ffmpeg: the licence reader and the SHA-256 pin.
// A pin that does not match must stop the build before anything is written.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SCRIPT = join(import.meta.dirname, '..', 'audio', 'music', 'build_music.sh');
const run = (args, env = {}) => spawnSync('bash', [SCRIPT, ...args], { encoding: 'utf8', env: { ...process.env, ...env } });

/** The part of an OpenGameArt page the reader looks at, in the page's own markup. */
const page = (licenses, tags = ['chiptune']) => `<html><head><title>Level One | OpenGameArt.org</title></head><body>
<div class="field field-name-field-art-tags field-type-taxonomy-term-reference field-label-above"><div class="field-label">Tags:&nbsp;</div><div class="field-items">${tags.map(t => `<div class="field-item even"><a href="/art-search-advanced?field_art_tags_tid=${t}">${t}</a></div>`).join('')}</div></div>
<div class="field field-name-field-art-licenses field-type-taxonomy-term-reference field-label-above"><div class="field-label">License(s):&nbsp;</div><div class="field-items">${licenses.map(l => `<div class="field-item even"><div class='license-icon'><a href='http://example.org/l'><div class='license-name'>${l}</div></a></div></div>`).join('')}</div></div><div class="field field-name-collect field-type-ds field-label-above"><div class='license-name'>CC0</div></div>
<div class="field field-name-field-art-files field-type-file field-label-above"><div class="field-items"><a href="https://opengameart.org/sites/default/files/level%20one.ogg" type="audio/ogg">level one.ogg</a></div></div>
</body></html>`;

function vet(html) {
  const dir = mkdtempSync(join(tmpdir(), 'vet-'));
  try {
    const file = join(dir, 'page.html');
    writeFileSync(file, html);
    return run(['--vet-html', file]);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test('a page whose License(s) field is CC0 passes and prints its facts', () => {
  const r = vet(page(['CC0']));
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^title: Level One$/m);
  assert.match(r.stdout, /^license: CC0$/m);
  assert.match(r.stdout, /^tags: chiptune$/m);
  assert.match(r.stdout, /^file: https:\/\/opengameart\.org\/sites\/default\/files\/level%20one\.ogg$/m);
});

test('CC0 among several licences passes; the whole field is printed', () => {
  const r = vet(page(['CC-BY 3.0', 'CC0']));
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^license: CC-BY 3\.0, CC0$/m);
});

test('a page without CC0 in its field is rejected, even if CC0 appears elsewhere on the page', () => {
  const r = vet(page(['CC-BY 3.0']));
  assert.equal(r.status, 3);
  assert.match(r.stdout, /^license: CC-BY 3\.0$/m);
});

test('a page with no License(s) field is rejected', () => {
  const r = vet('<html><title>x | OpenGameArt.org</title><body>CC0 everywhere</body></html>');
  assert.equal(r.status, 3);
});

test('only opengameart.org/content pages can be vetted', () => {
  assert.equal(run(['--vet', 'https://example.org/track']).status, 2);
});

/** A one-source table whose "download" is a local file, so no network is needed. */
function pinned(sha) {
  const dir = mkdtempSync(join(tmpdir(), 'pin-'));
  const src = join(dir, 'track.ogg');
  writeFileSync(src, 'not really audio');
  const real = createHash('sha256').update('not really audio').digest('hex');
  const env = { MUSIC_CACHE: join(dir, 'cache'), MUSIC_SOURCES: `t|file://${src}|${sha ?? real}|` };
  return { dir, env, real };
}

test('--verify accepts a source whose SHA-256 matches, and reuses the cache', () => {
  const p = pinned();
  try {
    const first = run(['--verify'], p.env);
    assert.equal(first.status, 0, first.stderr);
    assert.match(first.stdout, /^ok t$/m);
    assert.deepEqual(readdirSync(join(p.dir, 'cache')), [p.real]);
    rmSync(join(p.dir, 'track.ogg')); // a second run must not need the network or the file
    assert.equal(run(['--verify'], p.env).status, 0);
  } finally { rmSync(p.dir, { recursive: true, force: true }); }
});

test('--verify stops on a SHA-256 that does not match and caches nothing', () => {
  const p = pinned('0'.repeat(64));
  try {
    const r = run(['--verify'], p.env);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /checksum mismatch/);
    assert.deepEqual(readdirSync(join(p.dir, 'cache')), []);
  } finally { rmSync(p.dir, { recursive: true, force: true }); }
});

test('a cached file that no longer matches its pin is not trusted', () => {
  const p = pinned();
  try {
    assert.equal(run(['--verify'], p.env).status, 0);
    writeFileSync(join(p.dir, 'cache', p.real), 'tampered');
    const r = run(['--verify'], p.env); // re-downloads from the file:// URL and succeeds again
    assert.equal(r.status, 0, r.stderr);
    rmSync(join(p.dir, 'track.ogg'));
    writeFileSync(join(p.dir, 'cache', p.real), 'tampered');
    assert.equal(run(['--verify'], p.env).status, 1);
  } finally { rmSync(p.dir, { recursive: true, force: true }); }
});
