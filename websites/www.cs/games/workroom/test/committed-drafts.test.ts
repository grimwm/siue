// Every committed draft (music/pieces/<piece>/v<N>/score.json) is a valid
// score whose piece id and draft number match its folder.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseScore } from '../src/score.ts';

const PIECES = join(import.meta.dirname, '..', '..', '..', 'music', 'pieces');
assert.ok(existsSync(PIECES), 'music/pieces/ exists');
const drafts = readdirSync(PIECES, { withFileTypes: true }).filter(d => d.isDirectory())
  .flatMap(piece => readdirSync(join(PIECES, piece.name)).filter(n => /^v\d+$/.test(n)).map(v => ({ piece: piece.name, v })));

// A skipped test names why, so the empty folder is visible in the report instead of a green test that checked nothing.
test('every committed draft validates', { skip: drafts.length === 0 ? 'no draft is committed under music/pieces/ yet' : false }, () => {
  for (const { piece, v } of drafts) {
    const r = parseScore(JSON.parse(readFileSync(join(PIECES, piece, v, 'score.json'), 'utf8')));
    assert.ok(r.ok, `${piece}/${v}: ${r.ok ? '' : r.error}`);
    if (r.ok) assert.deepEqual([r.score.piece.id, `v${r.score.draft}`], [piece, v]);
  }
});
