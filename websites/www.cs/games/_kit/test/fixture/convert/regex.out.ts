import { test } from 'node:test';
import assert from 'node:assert/strict';

const said = (h, re) => re.test(h);
const h = 'ran left';
await test('turns', () => { assert.ok(said(h, /ran (left|right)/), 'no, turn'); });
await test('slash-class', () => { assert.ok(/[/,)]x/.test(h) === false, 'a / b'); });
await test('ratio', () => { assert.ok(h.length / 2 > 1); });
