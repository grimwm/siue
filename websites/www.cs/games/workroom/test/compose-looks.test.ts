// The composer's look: colors, style and lights chosen apart; Tape & Valve dark by default; the account's choice wins
// over the device's, a choice is kept on both, and a bad or missing word falls back alone.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COLOR_OPTIONS, createLookPorts, DEFAULT_LOOK, LOOK_KEY, lookText, parseLook, STYLE_OPTIONS, validLook } from '../src/compose/looks.ts';
import type { StorageLike } from '../../_kit/ports.ts';

const memory = (init: Record<string, string> = {}): StorageLike & { data: Record<string, string> } => {
  const data = { ...init };
  return { data, getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, removeItem: k => { delete data[k]; } };
};

test('the default is Tape & Valve colors and style, dark', () => {
  assert.deepEqual(DEFAULT_LOOK, { colors: 'tape', style: 'tape', mode: 'dark' });
  assert.deepEqual(COLOR_OPTIONS.map(o => o.id), ['tape', 'rack', 'night', 'site', 'original']);
  assert.deepEqual(STYLE_OPTIONS.map(o => o.id), ['tape', 'rack', 'night', 'site', 'plain']);
  assert.equal(STYLE_OPTIONS.find(o => o.id === 'plain')!.name, 'Original');
});

test('a look is kept as three words and read back', () => {
  const l = { colors: 'night', style: 'rack', mode: 'light' } as const;
  assert.equal(lookText(l), 'night rack light');
  assert.deepEqual(parseLook('night rack light'), l);
  assert.ok(validLook('site plain dark'));
  assert.ok(!validLook('site plain'));
  assert.ok(!validLook('neon rack dark'));
  assert.ok(!validLook(undefined));
});

test('each missing or unknown word falls back to the default alone', () => {
  assert.deepEqual(parseLook(null), DEFAULT_LOOK);
  assert.deepEqual(parseLook(''), DEFAULT_LOOK);
  assert.deepEqual(parseLook('rack'), { colors: 'rack', style: 'tape', mode: 'dark' });
  assert.deepEqual(parseLook('neon site light'), { colors: 'tape', style: 'site', mode: 'light' });
  assert.deepEqual(parseLook('original plain dim'), { colors: 'original', style: 'plain', mode: 'dark' });
});

test('the account\'s look wins, then the device\'s, then the default', () => {
  assert.deepEqual(createLookPorts({ account: 'rack night light', storage: memory({ [LOOK_KEY]: 'site site dark' }) }).initial,
    { colors: 'rack', style: 'night', mode: 'light' });
  assert.deepEqual(createLookPorts({ account: undefined, storage: memory({ [LOOK_KEY]: 'site site dark' }) }).initial,
    { colors: 'site', style: 'site', mode: 'dark' });
  assert.deepEqual(createLookPorts({ account: 'garbage', storage: memory({ [LOOK_KEY]: 'also garbage' }) }).initial, DEFAULT_LOOK);
  assert.deepEqual(createLookPorts({ account: undefined, storage: null }).initial, DEFAULT_LOOK);
});

test('a choice is written on the device and sent to the studio; a failed send or a broken storage is quiet', async () => {
  const store = memory();
  const sent: string[] = [];
  const ports = createLookPorts({ account: undefined, storage: store, send: async t => { sent.push(t); } });
  ports.save({ colors: 'night', style: 'plain', mode: 'light' });
  assert.equal(store.data[LOOK_KEY], 'night plain light');
  assert.deepEqual(sent, ['night plain light']);

  const broken: StorageLike = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); }, removeItem: () => {} };
  const quiet = createLookPorts({ account: undefined, storage: broken, send: () => Promise.reject(new Error('offline')) });
  assert.deepEqual(quiet.initial, DEFAULT_LOOK);
  assert.doesNotThrow(() => quiet.save(DEFAULT_LOOK));
  await new Promise(r => setTimeout(r, 0));
});
