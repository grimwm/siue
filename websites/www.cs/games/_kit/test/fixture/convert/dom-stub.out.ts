import { test } from 'node:test';
import assert from 'node:assert/strict';
import { els, makeEl } from '../../_kit/test/dom-stub.ts';
import { local } from './dom-stub.mjs';

await test('stubbed', () => { assert.ok(makeEl('div') !== els.none && local !== undefined); });
