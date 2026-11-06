// The site's `make crete-levels` (websites/www.cs/Makefile): its memory cap fails closed. Where systemd-run --user
// cannot cap the run it refuses to start, before the token is read, unless ALLOW_UNCAPPED=yes; where it can, the run
// goes under it. `node` and `systemd-run` are stand-ins here that only say how they were called, so nothing is made
// and nothing is posted.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '../../..');

/** Runs `make crete-levels` with stand-in `node` and `systemd-run` (which can cap when `caps`). */
function run(caps: boolean, vars: string[]) {
  const bin = mkdtempSync(join(tmpdir(), 'crete-levels-make-'));
  try {
    const stub = (name: string, body: string) => { writeFileSync(join(bin, name), `#!/bin/sh\n${body}\n`); chmodSync(join(bin, name), 0o755); };
    stub('node', 'echo "node $*"');
    stub('systemd-run', caps ? 'echo "systemd-run $*" >&2' : 'exit 1');
    stub('op', 'exit 1');
    const r = spawnSync('make', ['--no-print-directory', 'crete-levels', ...vars], {
      cwd: SITE, encoding: 'utf8',
      env: { PATH: `${bin}:/usr/bin:/bin`, HOME: bin, CRETE_BANK_VERIFIER_TOKEN: 'stand-in-token-not-a-secret' },
    });
    return { code: r.status, out: r.stdout, err: r.stderr };
  } finally { rmSync(bin, { recursive: true, force: true }); }
}

test('without a working systemd-run the run refuses to start, unless ALLOW_UNCAPPED=yes', () => {
  const no = run(false, ['COUNT_PER_DIFFICULTY=1']);
  assert.equal(no.code, 2, no.out + no.err);
  assert.match(no.err, /systemd-run --user cannot cap this run at 8G here; nothing done \(ALLOW_UNCAPPED=yes runs it uncapped\)/);
  assert.ok(!/--stats-file/.test(no.out), 'the generator never ran');
  const yes = run(false, ['COUNT_PER_DIFFICULTY=1', 'ALLOW_UNCAPPED=yes']);
  assert.equal(yes.code, 0, yes.out + yes.err);
  assert.match(yes.out, /going on uncapped \(ALLOW_UNCAPPED=yes\)/);
  assert.match(yes.out, /^node games\/crete\/tools\/generate-bank\.ts --memory-mb 8192 .*--stats-file /m, 'the generator ran, sized for the limit');
  for (const v of ['no', 'YES', '1']) assert.equal(run(false, ['COUNT_PER_DIFFICULTY=1', `ALLOW_UNCAPPED=${v}`]).code, 2, `ALLOW_UNCAPPED=${v} is not yes`);
});

test('with a working systemd-run the run goes under its cap', () => {
  const r = run(true, ['COUNT_PER_DIFFICULTY=1', 'MEMORY_LIMIT=6g']);
  assert.equal(r.code, 0, r.out + r.err);
  assert.match(r.err, /^systemd-run --user --scope -q -p MemoryMax=6G -p MemorySwapMax=0 node games\/crete\/tools\/generate-bank\.ts --memory-mb 6144 /m);
  assert.ok(!/uncapped/.test(r.out + r.err));
});
