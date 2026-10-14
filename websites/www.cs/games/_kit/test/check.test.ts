import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';

// The outer runner marks its children; a nested run that inherits it reports to the parent instead of exiting nonzero.
const envWithoutRunner = () => Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== 'NODE_TEST_CONTEXT'));

test('check registers one passing or failing test per call', t => {
  const dir = mkdtempSync(join(import.meta.dirname, '.tmp-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const file = join(dir, 'x.test.mjs');
  writeFileSync(file, `import { check } from '../check.ts';\ncheck('good', true);\ncheck('bad', false, 'because');\n`);
  const r = spawnSync(process.execPath, ['--test', '--test-reporter=tap', file], { encoding: 'utf8', env: envWithoutRunner() });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /^ok \d+ - good$/m);
  assert.match(r.stdout, /^not ok \d+ - bad$/m);
  assert.match(r.stdout, /because/);
});
