// Mute and Unmute, Mute All and Unmute All: a part's mute is its fx.mute; a piece saved with a solo is heard as it was
// until a mute change turns the solo into plain mutes; the status line says who will play.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { docWith } from './compose-fixture.ts';
import type { EditDoc } from '../src/compose/doc.ts';
import { setLaneFx } from '../src/compose/sound.ts';
import { isMuted, muteStatus, setAllMuted, setMuted } from '../src/compose/mutes.ts';
import { newDoc } from '../src/compose/doc.ts';

const three = (): EditDoc => {
  const d = docWith([['piano', []], ['cello', []], ['bass', []]]);
  return { ...d, parts: d.parts.map((p, i) => ({ ...p, name: ['Piano', 'Drum Kit', 'Bass'][i]! })) };
};
const ids = (d: EditDoc): string[] => d.parts.map(p => p.id);

test('the status line says who will play', () => {
  assert.equal(muteStatus(newDoc('x')), '');
  const d = three();
  assert.equal(muteStatus(d), 'All tracks will play.');
  const bass = setMuted(d, ids(d)[2]!, true);
  assert.equal(muteStatus(bass), 'Playing: Piano, Drum Kit. Muted: Bass.');
  assert.equal(isMuted(bass.parts[2]!), true);
  assert.deepEqual(bass.parts[2]!.fx, { mute: true });
  assert.equal(muteStatus(setAllMuted(d, true)), 'All tracks are muted. Press Unmute on each track you want to hear.');
  const back = setAllMuted(setAllMuted(d, true), false);
  assert.equal(muteStatus(back), 'All tracks will play.');
  assert.ok(back.parts.every(p => p.fx === undefined), 'unmuted parts keep no setting');
  assert.equal(muteStatus(setMuted(bass, ids(d)[2]!, false)), 'All tracks will play.');
});

test('a solo from an old piece mutes the others until a mute change makes it plain mutes', () => {
  const d = three();
  const solo = setLaneFx(d, ids(d)[1]!, fx => ({ ...fx, solo: true }));
  assert.deepEqual(solo.parts.map(p => isMuted(p, solo)), [true, false, true]);
  assert.equal(isMuted(solo.parts[0]!), false, 'without the piece only its own mute counts');
  assert.equal(muteStatus(solo), 'Playing: Drum Kit. Muted: Piano, Bass.');
  const unmuted = setMuted(solo, ids(d)[0]!, false);
  assert.ok(unmuted.parts.every(p => !p.fx?.solo), 'no solo is left');
  assert.equal(muteStatus(unmuted), 'Playing: Piano, Drum Kit. Muted: Bass.');
  assert.ok(setAllMuted(solo, false).parts.every(p => !p.fx));
});
