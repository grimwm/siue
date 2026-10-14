// The soundtrack is described in four places that must agree: game.yaml (what plays),
// audio/CREDITS.md (who made it, where, under what licence), audio/music/ (the files)
// and build_music.sh (how each file is made, pinned by SHA-256). game.json is read
// instead of parsing YAML: tools/game-json.php --check keeps it identical to game.yaml.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, openSync, readSync, closeSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const GAME = join(import.meta.dirname, '..');
const MUSIC = join(GAME, 'audio', 'music');
function must<T>(v: T | null | undefined, what: string): T {
  assert.ok(v !== null && v !== undefined, `${what} is missing`);
  return v;
}

interface Track { file: string; title: string; credit: string; volume?: number }
const game: { audio: { music: Track[] } } = JSON.parse(readFileSync(join(GAME, 'game.json'), 'utf8'));
const tracks = game.audio.music;
const yaml = readFileSync(join(GAME, 'game.yaml'), 'utf8');
const credits = readFileSync(join(GAME, 'audio', 'CREDITS.md'), 'utf8');
const script = readFileSync(join(MUSIC, 'build_music.sh'), 'utf8');

const slugOf = (file: string) => file.replace(/^audio\/music\//, '').replace(/\.mp3$/, '');

/** The Music table's rows by file name. */
function creditRows() {
  const section = credits.split(/^## Music/m)[1] ?? '';
  const rows = new Map<string, { title: string; author: string; page: string; license: string; sha: string }>();
  for (const line of section.split('\n')) {
    if (!line.startsWith('| `')) continue;
    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    assert.equal(cells.length, 6, `six cells in: ${line}`);
    // Six cells, as just asserted, so no default is ever used.
    const [file = '', title = '', author = '', page = '', license = '', sha = ''] = cells;
    const name = file.replaceAll('`', '');
    assert.ok(!rows.has(name), `${name} is listed twice in CREDITS.md`);
    rows.set(name, { title, author, page, license, sha });
  }
  return rows;
}

/** build_music.sh's pins by slug. */
function pins() {
  const block = script.split('# BEGIN SOURCES\n')[1]?.split('# END SOURCES')[0] ?? '';
  const out = new Map<string, { url: string; sha: string; member: string | undefined }>();
  for (const line of block.split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const [slug = '', url, sha, member] = line.split('|');
    assert.match(slug, /^[a-z0-9-]+$/, `slug: ${line}`);
    assert.ok(url !== undefined && sha !== undefined, `url and sha: ${line}`);
    assert.match(url, /^https:\/\/opengameart\.org\/sites\/default\/files\/\S+$/, `url: ${line}`);
    assert.match(sha, /^[0-9a-f]{64}$/, `sha: ${line}`);
    assert.ok(!out.has(slug), `${slug} is pinned twice`);
    out.set(slug, { url, sha, member });
  }
  return out;
}

test('Battle Theme A is first: it is the theme the demo and intro play', () => {
  const first = must(tracks[0], 'the first track');
  assert.equal(first.file, 'audio/music/battle-theme-a.mp3');
  assert.equal(first.title, 'Battle Theme A');
});

test('every track names an mp3 in audio/music/, a title and an author, and carries no volume', () => {
  for (const t of tracks) {
    assert.match(t.file, /^audio\/music\/[a-z0-9-]+\.mp3$/, t.file);
    assert.ok(t.title && t.title.length <= 60, `title: ${t.file}`);
    assert.ok(t.credit && t.credit.trim(), `credit: ${t.file}`);
    assert.doesNotMatch(t.credit, /CC0|licen[cs]e/i, `credit is the author, not the licence: ${t.file}`);
    assert.equal(t.volume ?? 1, 1, `${t.file} has a volume`);
  }
  const musicYaml = yaml.split(/^ {2}music:\n/m)[1]?.split(/^\S/m)[0] ?? '';
  assert.doesNotMatch(musicYaml, /^\s*volume:/m, 'game.yaml sets a per-track volume');
  assert.equal(new Set(tracks.map(t => t.file)).size, tracks.length, 'a file is listed twice');
  assert.equal(new Set(tracks.map(t => t.title)).size, tracks.length, 'a title is used twice');
});

test('audio/music/ holds exactly the listed mp3 files and the build script (dotfiles aside)', () => {
  const onDisk = readdirSync(MUSIC).filter(f => !f.startsWith('.')).sort(); // Finder's .DS_Store is not the soundtrack
  const want = [...tracks.map(t => t.file.replace('audio/music/', '')), 'build_music.sh'].sort();
  assert.deepEqual(onDisk, want);
  let total = 0;
  for (const t of tracks) {
    const size = statSync(join(GAME, t.file)).size;
    assert.ok(size > 100_000 && size <= 2_500_000, `${t.file} is ${size} bytes`);
    total += size;
  }
  assert.ok(total <= 18_000_000, `the soundtrack is ${total} bytes`);
});

test('CREDITS.md has one row per track, with the same title and author as game.yaml', () => {
  const rows = creditRows();
  assert.deepEqual([...rows.keys()].sort(), tracks.map(t => t.file.replace('audio/music/', '')).sort());
  for (const t of tracks) {
    const row = must(rows.get(t.file.replace('audio/music/', '')), `the row of ${t.file}`);
    assert.equal(row.title, t.title, `title of ${t.file}`);
    assert.equal(row.author, t.credit, `author of ${t.file}`);
  }
});

test('every CREDITS.md row states CC0 in the page licence field and links the page', () => {
  for (const [file, row] of creditRows()) {
    assert.match(row.page, /^https:\/\/opengameart\.org\/content\/[a-z0-9-]+$/, `page of ${file}`);
    assert.match(row.license, /(^|, )CC0(,|$)/, `License(s) text of ${file}: ${row.license}`);
    assert.match(row.sha, /^[0-9a-f]{64}$/, `SHA-256 of ${file}`);
  }
});

test('build_music.sh pins exactly the listed tracks, with the SHA-256 CREDITS.md records', () => {
  const pinned = pins();
  assert.deepEqual([...pinned.keys()].sort(), tracks.map(t => slugOf(t.file)).sort());
  const rows = creditRows();
  for (const [slug, pin] of pinned) {
    assert.equal(must(rows.get(`${slug}.mp3`), `the row of ${slug}`).sha, pin.sha, `SHA-256 of ${slug}`);
  }
});

test('the files carry no ID3 tags', () => {
  for (const t of tracks) {
    const fd = openSync(join(GAME, t.file), 'r');
    try {
      const head = Buffer.alloc(3);
      readSync(fd, head, 0, 3, 0);
      assert.notEqual(head.toString('latin1'), 'ID3', `${t.file} starts with an ID3v2 tag`);
      const size = statSync(join(GAME, t.file)).size;
      const tail = Buffer.alloc(3);
      readSync(fd, tail, 0, 3, size - 128);
      assert.notEqual(tail.toString('latin1'), 'TAG', `${t.file} ends with an ID3v1 tag`);
    } finally { closeSync(fd); }
  }
});

test('the soundtrack is sixteen tracks', () => {
  assert.equal(tracks.length, 16);
});

test('no author supplies more than four of the sixteen', () => {
  const byAuthor = new Map<string, number>();
  for (const t of tracks) byAuthor.set(t.credit, (byAuthor.get(t.credit) ?? 0) + 1);
  for (const [author, n] of byAuthor) assert.ok(n <= 4, `${author} has ${n} tracks`);
});

/** ffmpeg and ffprobe are dev tools: the audio checks run where they exist (a developer's machine) and skip elsewhere. */
const haveFfmpeg = spawnSync('ffmpeg', ['-version']).status === 0 && spawnSync('ffprobe', ['-version']).status === 0;
const targetLufs = Number(script.match(/^TARGET_LUFS=(-?[0-9.]+)/m)?.[1]);

test('the files are 80 kbps stereo mp3, 40 to 240 s, with no tags', { skip: !haveFfmpeg && 'ffmpeg is not installed' }, () => {
  for (const t of tracks) {
    const r = spawnSync('ffprobe', ['-v', 'error', '-of', 'json', '-show_entries', 'format=duration,bit_rate,format_name:format_tags:stream=channels,codec_name', join(GAME, t.file)], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const info: { streams: { codec_name: string; channels: number }[]; format: { bit_rate: string; duration: string; tags?: unknown } } = JSON.parse(r.stdout);
    const stream = must(info.streams[0], `${t.file}'s stream`);
    assert.equal(stream.codec_name, 'mp3', t.file);
    assert.equal(stream.channels, 2, `${t.file} is not stereo`);
    assert.ok(Math.abs(Number(info.format.bit_rate) - 80_000) < 4_000, `${t.file} bit rate ${info.format.bit_rate}`);
    const seconds = Number(info.format.duration);
    assert.ok(seconds >= 40 && seconds <= 240, `${t.file} lasts ${seconds} s`);
    assert.equal(info.format.tags, undefined, `${t.file} carries tags`);
  }
});

test('every track sits within 1 LU of the one loudness target', { skip: !haveFfmpeg && 'ffmpeg is not installed' }, () => {
  assert.ok(Number.isFinite(targetLufs), 'TARGET_LUFS not found in build_music.sh');
  for (const t of tracks) {
    const r = spawnSync('ffmpeg', ['-nostdin', '-hide_banner', '-nostats', '-i', join(GAME, t.file), '-af', 'ebur128=framelog=quiet', '-f', 'null', '-'], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const lufs = Number(r.stderr.match(/Integrated loudness:\s*I:\s*(-?[0-9.]+) LUFS/)?.[1]);
    assert.ok(Number.isFinite(lufs), `no loudness for ${t.file}`);
    assert.ok(Math.abs(lufs - targetLufs) <= 1, `${t.file} is ${lufs} LUFS; the target is ${targetLufs}`);
  }
});
