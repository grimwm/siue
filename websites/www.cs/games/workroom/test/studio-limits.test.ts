// The studio's limits as the page shell states them, and the byte sizes said
// as the server says them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MAX_NOTE_BYTES } from '../src/note.ts';
import { humanBytes, readLimits } from '../src/studio-limits.ts';

const body = (dataset: Record<string, string>): HTMLElement => ({ dataset }) as unknown as HTMLElement;

test('limits come from the body', () => {
  assert.deepEqual(readLimits(body({ noteMax: '1048576', room: '123456', named: '1' })), { noteMax: 1_048_576, room: 123_456, named: true });
  assert.deepEqual(readLimits(body({ noteMax: '2097152', room: '0', named: '0' })), { noteMax: 2_097_152, room: 0, named: false });
});

test('without the attributes the note max is the constant and the room is unlimited', () => {
  assert.deepEqual(readLimits(body({})), { noteMax: MAX_NOTE_BYTES, room: Infinity, named: false });
  assert.deepEqual(readLimits(body({ noteMax: 'x', room: '-3' })), { noteMax: MAX_NOTE_BYTES, room: Infinity, named: false });
});

test('humanBytes matches the server', () => {
  const server: [number, string][] = [
    [0, '0 KB'], [1, '0 KB'], [511, '0 KB'], [512, '1 KB'], [513, '1 KB'], [1024, '1 KB'], [1536, '2 KB'],
    [1_048_575, '1024 KB'], [1_048_576, '1 MB'], [1_258_291, '1.2 MB'], [1_363_149, '1.3 MB'],
    [1_310_720, '1.2 MB'], [1_835_008, '1.8 MB'], [2_097_152, '2 MB'], [3_198_157, '3.1 MB'], [5_242_880, '5 MB'], [10_485_760, '10 MB'],
  ];
  for (const [n, text] of server) assert.equal(humanBytes(n), text, String(n));
  assert.equal(humanBytes(-5), '0 KB');
});
