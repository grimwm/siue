// Lets a PASS/FAIL check script run under node:test unchanged: each
// check(name, ok, detail) becomes one test. New tests use node:test directly.
import { test } from 'node:test';
import assert from 'node:assert/strict';

export function check(name: string, ok: boolean, detail = ''): void {
  test(name, () => assert.ok(ok, detail || name));
}
