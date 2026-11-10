import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';
import { createSettings, FULLSCREEN_KEY, HELP_BUILD, HELP_BUILD_KEY, HELP_CHECK_KEY, helpsBuild, LOOK_KEY, MINIMAP_KEY, MUSIC_HIDDEN_KEY, MUSIC_KEY, PAD_KEY, SOUND_KEY, WALLS_KEY } from '../src/settings.ts';

test('defaults: sound on, music on, music in the background on, fullscreen off', () => {
  const s = createSettings(memoryStorage());
  assert.deepEqual([s.sound.get(), s.music.get(), s.musicHidden.get(), s.fullscreen.get()], ['on', 'on', 'on', 'off']);
});

test('music is its own setting, kept apart from sound', () => {
  const storage = memoryStorage();
  createSettings(storage).music.set('off');
  assert.equal(storage.data.get(MUSIC_KEY), 'off');
  assert.equal(MUSIC_KEY, 'crete-music');
  const again = createSettings(storage);
  assert.deepEqual([again.sound.get(), again.music.get()], ['on', 'off']);
  assert.equal(createSettings(memoryStorage({ [MUSIC_KEY]: 'quiet' })).music.get(), 'on');
});

test('a choice survives a new page', () => {
  const storage = memoryStorage();
  const first = createSettings(storage);
  first.sound.set('off');
  first.fullscreen.set('on');
  assert.equal(storage.data.get(SOUND_KEY), 'off');
  assert.equal(storage.data.get(FULLSCREEN_KEY), 'on');
  const second = createSettings(storage);
  assert.deepEqual([second.sound.get(), second.fullscreen.get()], ['off', 'on']);
});

test('a stored word that is neither on nor off reads as the default', () => {
  const s = createSettings(memoryStorage({ [SOUND_KEY]: 'loud', [FULLSCREEN_KEY]: '1' }));
  assert.deepEqual([s.sound.get(), s.fullscreen.get()], ['on', 'off']);
});

test('storage that throws, or none at all, never throws back and still remembers for the session', () => {
  for (const storage of [throwingStorage(), null]) {
    const s = createSettings(storage);
    assert.equal(s.sound.get(), 'on');
    s.sound.set('off');
    assert.equal(s.sound.get(), 'off');
  }
});

test('music in the background is its own setting and defaults to on', () => {
  const storage = memoryStorage();
  createSettings(storage).musicHidden.set('off');
  assert.equal(storage.data.get(MUSIC_HIDDEN_KEY), 'off');
  assert.equal(MUSIC_HIDDEN_KEY, 'crete-music-hidden');
  const again = createSettings(storage);
  assert.deepEqual([again.music.get(), again.musicHidden.get()], ['on', 'off']);
  assert.equal(createSettings(memoryStorage({ [MUSIC_HIDDEN_KEY]: 'sometimes' })).musicHidden.get(), 'on');
});

test('the look is modern and the walls ghosted until chosen; a stored choice reads back, an unknown word reads the default', () => {
  assert.deepEqual([createSettings(null).look.get(), createSettings(null).walls.get()], ['modern', 'ghosted']);
  const storage = memoryStorage();
  const s = createSettings(storage);
  s.look.set('classic');
  s.walls.set('low');
  assert.deepEqual([storage.data.get(LOOK_KEY), storage.data.get(WALLS_KEY)], ['classic', 'low']);
  assert.deepEqual([createSettings(storage).look.get(), createSettings(storage).walls.get()], ['classic', 'low']);
  const odd = createSettings(memoryStorage({ [LOOK_KEY]: 'flat', [WALLS_KEY]: 'glass' }));
  assert.deepEqual([odd.look.get(), odd.walls.get()], ['modern', 'ghosted']);
});

test('the arrows stand on the left until chosen; Right is kept under crete-pad and reads back; an unknown word reads Left', () => {
  assert.equal(PAD_KEY, 'crete-pad');
  assert.equal(createSettings(null).pad.get(), 'left');
  const storage = memoryStorage();
  createSettings(storage).pad.set('right');
  assert.equal(storage.data.get(PAD_KEY), 'right');
  assert.equal(createSettings(storage).pad.get(), 'right');
  assert.equal(createSettings(memoryStorage({ [PAD_KEY]: 'middle' })).pad.get(), 'left');
});

test('the mini map is off until chosen; On is kept under crete-minimap and reads back; an unknown word reads Off', () => {
  assert.equal(MINIMAP_KEY, 'crete-minimap');
  assert.equal(createSettings(null).minimap.get(), 'off');
  const storage = memoryStorage();
  createSettings(storage).minimap.set('on');
  assert.equal(storage.data.get(MINIMAP_KEY), 'on');
  assert.equal(createSettings(storage).minimap.get(), 'on');
  assert.equal(createSettings(memoryStorage({ [MINIMAP_KEY]: 'maybe' })).minimap.get(), 'off');
});

test('Help Build Endless Levels is unset until the player answers, and an answer is kept', () => {
  const storage = memoryStorage();
  assert.equal(HELP_BUILD_KEY, 'crete-help-build');
  assert.equal(createSettings(storage).helpBuild.get(), 'unset');
  createSettings(storage).helpBuild.set('on');
  assert.equal(createSettings(storage).helpBuild.get(), 'on');
  createSettings(storage).helpBuild.set('off');
  assert.equal(createSettings(storage).helpBuild.get(), 'off');
});

test('the old Help Check switch: its default "on" is no answer, an "off" the player chose stays off', () => {
  const on = memoryStorage({ [HELP_CHECK_KEY]: 'on' });
  assert.equal(createSettings(on).helpBuild.get(), 'unset');
  assert.equal(on.data.has(HELP_CHECK_KEY), false);
  const off = memoryStorage({ [HELP_CHECK_KEY]: 'off' });
  assert.equal(createSettings(off).helpBuild.get(), 'off');
  assert.equal(off.data.get(HELP_BUILD_KEY), 'off');
  assert.equal(off.data.has(HELP_CHECK_KEY), false);
  // A later answer is never overwritten by the old key.
  const both = memoryStorage({ [HELP_CHECK_KEY]: 'off', [HELP_BUILD_KEY]: 'on' });
  assert.equal(createSettings(both).helpBuild.get(), 'on');
  assert.equal(createSettings(throwingStorage()).helpBuild.get(), 'unset');
});

test('players are not asked to help build Endless levels: with HELP_BUILD off no answer helps, and the answer is kept', () => {
  assert.equal(HELP_BUILD, false);
  for (const answer of ['on', 'off', 'unset'] as const) assert.equal(helpsBuild(answer), false, answer);
  const storage = memoryStorage({ [HELP_BUILD_KEY]: 'on' });
  assert.equal(helpsBuild(createSettings(storage).helpBuild.get()), false);
  assert.equal(storage.data.get(HELP_BUILD_KEY), 'on', 'the stored answer stays for when asking is on again');
});

test('with asking on, only a yes helps build Endless levels', () => {
  assert.equal(helpsBuild('on', true), true);
  assert.equal(helpsBuild('off', true), false);
  assert.equal(helpsBuild('unset', true), false);
});
