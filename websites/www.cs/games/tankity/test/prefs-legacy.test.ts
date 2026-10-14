// Settings saved by the code before the prefs move, in the raw form it wrote
// them, must read back unchanged through today's prefs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoryStorage, throwingStorage } from '../../_kit/test/record.ts';
import { pref, text } from '../../_kit/prefs.ts';
import { LEGACY_KEY, localBoard } from '../src/local-board.ts';

const saved = memoryStorage({
  'tankity-body': 'walker',
  'tankity-text': 'xl',
  'tankity-tutorial': 'done',
  'tankity-callsign': 'BAM',
});

await test('legacy-body-reads-back', () => { assert.ok(pref('tankity-body', 'tank', text, saved).get() === 'walker'); });
await test('legacy-text-size-reads-back', () => { assert.ok(pref('tankity-text', 'm', text, saved).get() === 'xl'); });
await test('legacy-tutorial-done-reads-back', () => { assert.ok(pref('tankity-tutorial', '', text, saved).get() === 'done'); });
await test('legacy-callsign-reads-back', () => { assert.ok(pref('tankity-callsign', '', text, saved).get() === 'BAM'); });

const empty = memoryStorage();
await test('fresh-body-is-the-default', () => { assert.ok(pref('tankity-body', 'tank', text, empty).get() === 'tank'); });
await test('fresh-text-size-is-normal', () => { assert.ok(pref('tankity-text', 'm', text, empty).get() === 'm'); });
await test('fresh-tutorial-is-unseen', () => { assert.ok(pref('tankity-tutorial', '', text, empty).get() === ''); });

const written = memoryStorage();
pref('tankity-body', 'tank', text, written).set('hover');
await test('body-is-written-as-the-bare-key', () => { assert.ok(written.data.get('tankity-body') === 'hover'); });
await test('blocked-storage-gives-the-default', () => { assert.ok(pref('tankity-body', 'tank', text, throwingStorage()).get() === 'tank'); });

// Main's tankity-local (runs its filer could not file), in the raw form it wrote, moves onto this browser's board.
const mainLocal = memoryStorage({ [LEGACY_KEY]: '[{"name":"WGR","score":8240,"banked":3,"won":false,"seed":"scorched-1234","difficulty":"hard"},{"name":"BAM","score":100,"banked":0,"won":false,"seed":"x"}]' });
const moved = localBoard(mainLocal);
await test('legacy-local-rows-move', () => { assert.ok(moved.migrate() === 2); });
await test('legacy-local-hard-row-reads-back', () => { assert.ok(moved.rows('hard')?.[0]?.score === 8240 && moved.rows('hard')?.[0]?.initials === 'WGR'); });
await test('legacy-local-row-without-difficulty-is-normal', () => { assert.ok(moved.rows('normal')?.[0]?.initials === 'BAM'); });
await test('legacy-local-key-removed', () => { assert.ok(mainLocal.data.has(LEGACY_KEY) === false); });
