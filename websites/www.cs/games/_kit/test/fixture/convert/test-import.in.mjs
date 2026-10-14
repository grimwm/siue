import { test } from 'node:test';
import assert from 'node:assert';
import { check } from '../../_kit/test/check.ts';

test('plain', () => assert.ok(true));
check('bridged', 1 + 1 === 2);
