// The Mix meters: a track reads loud as a note starts, less while it is held, nothing between notes or when muted, and
// its Volume scales it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { docWith } from './compose-fixture.ts';
import { levelAt, levelTrack } from '../src/compose/levels.ts';
import { setMuted } from '../src/compose/mutes.ts';
import { setLaneFx } from '../src/compose/sound.ts';

test('a note is loudest as it starts, dies away while held, and is gone after it ends', () => {
  const d = docWith([['piano', [[0, 2, 60], [4, 1, 64]]]]);
  const t = levelTrack(d.parts[0]!, d);
  assert.ok(levelAt(t, 0) > levelAt(t, 1.5));
  assert.ok(levelAt(t, 1.5) > 0);
  assert.equal(levelAt(t, 3), 0);
  assert.ok(levelAt(t, 4) > 0);
  assert.ok(levelAt(t, 0) <= 1);
});

test('muted reads zero; a lower Volume reads lower', () => {
  const d = docWith([['piano', [[0, 2, 60]]]]);
  const id = d.parts[0]!.id;
  assert.equal(levelAt(levelTrack(setMuted(d, id, true).parts[0]!, setMuted(d, id, true)), 0.5), 0);
  const quiet = setLaneFx(d, id, fx => ({ ...fx, volume_db: -12 }));
  assert.ok(levelAt(levelTrack(quiet.parts[0]!, quiet), 0.5) < levelAt(levelTrack(d.parts[0]!, d), 0.5));
});
