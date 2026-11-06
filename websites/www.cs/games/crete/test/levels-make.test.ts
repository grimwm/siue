// The site's `make crete-levels` (websites/www.cs/Makefile): its memory cap fails closed. Where systemd-run --user
// cannot cap the run it refuses to start, before the token is read, unless ALLOW_UNCAPPED=yes; where it can, the run
// goes under it. `node` and `systemd-run` are stand-ins here that only say how they were called, so nothing is made
// and nothing is posted.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
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

// Where the targets find the token: CRETE_BANK_VERIFIER_TOKEN, then the file CRETE_BANK_TOKEN_FILE (default
// ~/.config/crete/bank-token), then op. `node` here only says whether the token reached it, and `op` only that it ran.
const TOKEN = 'stand-in-token-not-a-secret';

/** Runs `make crete-bank-status` with HOME a fresh folder; `file` (and its mode) puts the token file there. */
function status(opts: { env?: Record<string, string>; file?: { body: string; mode: number }; op?: boolean }) {
  const home = mkdtempSync(join(tmpdir(), 'crete-token-make-'));
  try {
    const bin = join(home, 'bin');
    mkdirSync(bin);
    const stub = (name: string, body: string) => { writeFileSync(join(bin, name), `#!/bin/sh\n${body}\n`); chmodSync(join(bin, name), 0o755); };
    stub('node', `[ "$CRETE_BANK_VERIFIER_TOKEN" = "${TOKEN}" ] && echo "node has the token" || echo "node has no token"`);
    if (opts.op) stub('op', ': > "$HOME/op-ran"; exit 1');
    for (const tool of ['stat', 'cat']) symlinkSync(`/usr/bin/${tool}`, join(bin, tool));
    if (opts.file) {
      mkdirSync(join(home, '.config/crete'), { recursive: true });
      const path = join(home, '.config/crete/bank-token');
      writeFileSync(path, opts.file.body);
      chmodSync(path, opts.file.mode);
    }
    // PATH is the stand-ins alone, so the machine's own op is never found.
    const r = spawnSync('/usr/bin/make', ['--no-print-directory', 'crete-bank-status'], {
      cwd: SITE, encoding: 'utf8', env: { PATH: bin, HOME: home, ...opts.env },
    });
    return { code: r.status, out: r.stdout, err: r.stderr, opRan: existsSync(join(home, 'op-ran')) };
  } finally { rmSync(home, { recursive: true, force: true }); }
}

test('the token file is read when the environment has none, without op, its newline dropped', () => {
  const r = status({ file: { body: `${TOKEN}\n`, mode: 0o600 }, op: true });
  assert.equal(r.code, 0, r.out + r.err);
  assert.match(r.out, /node has the token/);
  assert.ok(!r.opRan, 'op was never asked');
  assert.ok(!/warning/.test(r.err), r.err);
});

test('a token file open to others still works, with a warning that never shows the token', () => {
  const r = status({ file: { body: TOKEN, mode: 0o644 }, op: true });
  assert.equal(r.code, 0, r.out + r.err);
  assert.match(r.out, /node has the token/);
  assert.match(r.err, /crete-bank-status: warning: .*bank-token has mode 644, open to more than its owner \(chmod 600 it\)/);
  assert.ok(!(r.out + r.err).includes(TOKEN), 'the token is never printed');
});

test('CRETE_BANK_VERIFIER_TOKEN wins over the file, and CRETE_BANK_TOKEN_FILE moves the file', () => {
  const env = status({ env: { CRETE_BANK_VERIFIER_TOKEN: TOKEN }, file: { body: 'the-file-token', mode: 0o600 }, op: true });
  assert.equal(env.code, 0, env.out + env.err);
  assert.match(env.out, /node has the token/);
  const moved = status({ env: { CRETE_BANK_TOKEN_FILE: '/nonexistent/bank-token' }, file: { body: TOKEN, mode: 0o600 }, op: true });
  assert.equal(moved.code, 2, 'the default file is not read when the variable names another');
  assert.ok(moved.opRan, 'op was asked');
});

test('with no token anywhere the target stops with its one line', () => {
  const noOp = status({});
  assert.equal(noOp.code, 2);
  assert.match(noOp.err, /^crete-bank-status: needs the 1Password CLI \(op\), signed in, to read the bank's token$/m);
  assert.ok(!/node has/.test(noOp.out), 'nothing ran');
  const op = status({ op: true });
  assert.equal(op.code, 2);
  assert.ok(op.opRan, 'op was asked');
  assert.match(op.err, /crete-bank-status: could not read the token from 1Password/);
});
