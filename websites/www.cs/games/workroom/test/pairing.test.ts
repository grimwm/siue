// The pairing code: the same vectors as music/lib/Pairing.php (MusicPairingTest) and the Python tool (test_studio.py).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { normalizeCode, pairingCode } from '../src/pairing.ts';

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');

test('the code is the first 60 bits of the fingerprint in Crockford base32', () => {
  assert.equal(pairingCode(sha('siue')), 'BH16-EYT6-88ZR');
  assert.equal(pairingCode(sha('pair')), '8ZCB-THM7-F0RW');
  assert.equal(pairingCode('0'.repeat(64)), '0000-0000-0000');
  assert.equal(pairingCode('f'.repeat(64)), 'ZZZZ-ZZZZ-ZZZZ');
});

test('a typed code ignores case, spaces and hyphens, and reads look-alikes', () => {
  assert.equal(normalizeCode(' bh16 eyt6-88zr '), 'BH16-EYT6-88ZR');
  assert.equal(normalizeCode('BHI6EYT688ZR'), 'BH16-EYT6-88ZR');
  assert.equal(normalizeCode('OOOO-IlIL-oooo'), '0000-1111-0000');
  assert.equal(normalizeCode('BH16-EYT6-88Z'), null);
  assert.equal(normalizeCode('BH16-EYT6-88ZU'), null);
  assert.equal(normalizeCode(''), null);
});
