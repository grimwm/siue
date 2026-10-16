import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BLOCKED_INITIALS, validInitials } from '../initials.ts';

const JSON_FILE = new URL('../blocked-initials.json', import.meta.url);

test('the blocked list is the JSON file, every entry three uppercase letters, no repeats', () => {
  const list: unknown = JSON.parse(readFileSync(JSON_FILE, 'utf8'));
  assert.deepEqual([...BLOCKED_INITIALS], list);
  assert.ok(BLOCKED_INITIALS.every((w) => /^[A-Z]{3}$/.test(w)));
  assert.equal(new Set(BLOCKED_INITIALS).size, BLOCKED_INITIALS.length);
});

test('the PHP score guard and the TS list are the same list', () => {
  // A script file, not `php -r`: the guard 404s unless a script other than itself included it.
  const dir = mkdtempSync(join(tmpdir(), 'kit-initials-'));
  try {
    const script = join(dir, 'list.php');
    writeFileSync(script, `<?php require ${JSON.stringify(new URL('../php/score-guard.php', import.meta.url).pathname)}; echo json_encode(Kit\\ScoreGuard::defaultBlockedInitials());`);
    const fromPhp: unknown = JSON.parse(execFileSync('php', [script], { encoding: 'utf8' }));
    assert.deepEqual(fromPhp, [...BLOCKED_INITIALS]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('validInitials takes three letters in either case, uppercases, and refuses blocked words', () => {
  assert.equal(validInitials(' zed '), 'ZED');
  for (const bad of ['ab', 'abcd', 'a1c', '', null, undefined, 123, 'ass', 'KkK']) assert.equal(validInitials(bad), null, String(bad));
});
