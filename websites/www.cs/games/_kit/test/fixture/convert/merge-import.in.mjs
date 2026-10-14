import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { check } from '../../_kit/test/check.ts';

describe('d', () => { it('i', () => assert.ok(true)); });
check('after', true);
