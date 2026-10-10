// Tests for tools/vendor.mjs (the copy of Preact in vendor/preact and its
// --check) against a scratch game folder, plus that this folder's own copy is
// current. Run: node vendor-test.js. Exit 0 when every check passes.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const errors = [];
function check(name, cond, extra) {
  console.log((cond ? 'PASS' : 'FAIL') + ' ' + name + (extra !== undefined && !cond ? ' :: ' + extra : ''));
  if (!cond) errors.push(name);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vendor-test-'));
const game = path.join(tmp, 'game');
const put = (rel, text) => { fs.mkdirSync(path.dirname(path.join(game, rel)), { recursive: true }); fs.writeFileSync(path.join(game, rel), text); };
const read = rel => fs.readFileSync(path.join(game, rel), 'utf8');
const SOURCES = {
  'dist/preact.mjs': 'export const core = 1;\n',
  'hooks/dist/hooks.mjs': 'export const hooks = 1;\n',
  'jsx-runtime/dist/jsxRuntime.mjs': 'export const jsx = 1;\n',
  LICENSE: 'MIT\n',
};
function scaffold(version = '9.9.9') {
  fs.rmSync(game, { recursive: true, force: true });
  put('package.json', JSON.stringify({ dependencies: { preact: version } }));
  put('package-lock.json', JSON.stringify({ packages: { 'node_modules/preact': { version } } }));
  put('node_modules/preact/package.json', JSON.stringify({ version }));
  for (const [rel, text] of Object.entries(SOURCES)) put(`node_modules/preact/${rel}`, text);
  fs.mkdirSync(path.join(game, 'tools'), { recursive: true });
  fs.copyFileSync(path.join(import.meta.dirname, 'tools', 'vendor.mjs'), path.join(game, 'tools', 'vendor.mjs'));
}
/** Runs the tool in the scratch folder: [exit code, stdout + stderr]. */
function run(...args) {
  try {
    return [0, execFileSync(process.execPath, [path.join(game, 'tools', 'vendor.mjs'), ...args], { encoding: 'utf8', stdio: 'pipe' })];
  } catch (e) {
    return [e.status, String(e.stdout) + String(e.stderr)];
  }
}

try {
  scaffold();
  let [code, out] = run('--check');
  check('check-fails-before-the-first-copy', code === 1 && /preact\.module\.js is missing/.test(out) && /LICENSE is missing/.test(out), out);
  [code, out] = run();
  check('write-copies-the-three-builds-and-the-licence', code === 0
    && read('vendor/preact/preact.module.js') === SOURCES['dist/preact.mjs']
    && read('vendor/preact/hooks.module.js') === SOURCES['hooks/dist/hooks.mjs']
    && read('vendor/preact/jsx-runtime.module.js') === SOURCES['jsx-runtime/dist/jsxRuntime.mjs']
    && read('vendor/preact/LICENSE') === SOURCES.LICENSE, out);
  [code, out] = run('--check');
  check('check-passes-after-a-copy', code === 0 && out === '', out);
  [code, out] = run();
  check('a-second-write-changes-nothing', code === 0 && out === '', out);

  put('vendor/preact/hooks.module.js', '// edited by hand\n');
  [code, out] = run('--check');
  check('check-sees-a-hand-edit', code === 1 && /vendor\/preact\/hooks\.module\.js differs from node_modules\/preact/.test(out), out);
  [code] = run();
  check('write-restores-a-hand-edit', code === 0 && read('vendor/preact/hooks.module.js') === SOURCES['hooks/dist/hooks.mjs']);

  fs.unlinkSync(path.join(game, 'vendor/preact/jsx-runtime.module.js'));
  [code, out] = run('--check');
  check('check-sees-a-missing-file', code === 1 && /jsx-runtime\.module\.js is missing/.test(out), out);
  run();

  put('vendor/preact/compat.module.js', 'export {};\n');
  [code, out] = run('--check');
  check('check-sees-an-extra-file', code === 1 && /compat\.module\.js is not a vendored Preact file/.test(out), out);
  run();
  check('write-removes-an-extra-file', !fs.existsSync(path.join(game, 'vendor/preact/compat.module.js')));

  // The pin: exact in package.json, the same in the lockfile and in node_modules.
  scaffold('^9.9.9');
  [code, out] = run('--check');
  check('check-refuses-a-range', code === 1 && /must pin preact to an exact version/.test(out), out);
  scaffold();
  put('package-lock.json', JSON.stringify({ packages: { 'node_modules/preact': { version: '9.9.8' } } }));
  [code, out] = run('--check');
  check('check-refuses-a-lockfile-that-disagrees', code === 1 && /package-lock\.json has preact 9\.9\.8, package\.json pins 9\.9\.9/.test(out), out);
  scaffold();
  put('node_modules/preact/package.json', JSON.stringify({ version: '9.9.8' }));
  [code, out] = run('--check');
  check('check-refuses-an-installed-version-that-disagrees', code === 1 && /node_modules\/preact is 9\.9\.8, package\.json pins 9\.9\.9/.test(out), out);
  [code, out] = run();
  check('write-refuses-too', code === 1 && !fs.existsSync(path.join(game, 'vendor')), out);
  scaffold();
  fs.rmSync(path.join(game, 'node_modules'), { recursive: true });
  [code, out] = run('--check');
  check('check-asks-for-npm-ci', code === 1 && /node_modules\/preact is missing; run npm ci/.test(out), out);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

// This folder's own copy is what node_modules holds, at the version package.json pins.
try {
  execFileSync(process.execPath, [path.join(import.meta.dirname, 'tools', 'vendor.mjs'), '--check'], { stdio: 'pipe', encoding: 'utf8' });
  check('repo-vendor-is-current', true);
} catch (e) {
  check('repo-vendor-is-current', false, String(e.stderr) + ' (run npm ci, then node tools/vendor.mjs)');
}

console.log(errors.length ? 'VENDOR-FAILED: ' + errors.join(',') : 'VENDOR-OK');
process.exit(errors.length ? 1 : 0);
