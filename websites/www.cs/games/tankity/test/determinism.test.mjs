// The rule modules the server's solo play depends on must compute the same
// numbers in the browser and on the server: no wall clock, no Math.random, no
// Math.hypot, no powers, no degree conversion other than rad(), and no libm
// sin, cos or atan2 (src/detmath.ts and server/detmath.php instead). See
// README "Solo determinism".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { rad, dist, powi } from '../src/sim.ts';
import { DIFFICULTIES, DIFFICULTY, aimSkill } from '../src/ai.ts';

const dir = path.join(import.meta.dirname, '..');
// Strips /* */ and // comments only: a PHP # comment naming a banned call fails the test (falsely, never silently).
const read = f => fs.readFileSync(path.join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');

// Files a later task adds are banned from the moment they exist.
const present = files => files.filter(f => fs.existsSync(path.join(dir, f)));
const TS_RULES = present(['src/sim.ts', 'src/ai.ts', 'src/armor.ts', 'src/detmath.ts', 'src/solo.ts', 'src/solo-log.ts', 'src/solo-play.ts']);
const TRANSCENDENTAL_TS = /Math\.(sin|cos|tan|asin|acos|atan|exp|expm1|log|pow|cbrt)\w*\b/;
const TRANSCENDENTAL_PHP = /(?<![\w>$])(sin|cos|tan|asin|acos|atan|atan2|sinh|cosh|tanh|asinh|acosh|atanh|exp|expm1|log|log2|log10|log1p|pow|hypot)\(/;

for (const file of TS_RULES) {
  test(`${file} uses only replay-safe math`, () => {
    const src = read(file);
    for (const banned of [/Math\.random/, /Math\.hypot/, /\*\*/, /Date\.now|performance\.now/, /\* Math\.PI \/ 180/, TRANSCENDENTAL_TS]) {
      assert.doesNotMatch(src, banned, `${file} must not use ${banned}`);
    }
  });
}

for (const file of present(['server/sim.php', 'server/ai.php', 'server/detmath.php', 'server/solo.php', 'server/flight.php'])) {
  test(`${file} uses only replay-safe math`, () => {
    const src = read(file);
    for (const banned of [/\bhypot\(/, /\*\*/, /\bmt_rand|\brand\(|random_int|microtime/, TRANSCENDENTAL_PHP]) {
      assert.doesNotMatch(src, banned, `${file} must not use ${banned}`);
    }
  });
}

// rules.php also runs the live rooms, whose pacing reads the clock and whose
// codes are random; only its shot math is held to the solo rules.
test('server/rules.php fires with replay-safe math', () => {
  const src = read('server/rules.php');
  for (const banned of [/\bhypot\(/, TRANSCENDENTAL_PHP]) {
    assert.doesNotMatch(src, banned, `server/rules.php must not use ${banned}`);
  }
});

test('the bans see what they ban', () => {
  for (const s of ['Math.sin(a)', 'Math.atan2(y, x)', 'Math.cos(r)', 'Math.pow(2, 3)']) assert.match(s, TRANSCENDENTAL_TS, s);
  for (const s of ['sin($a)', ' atan2($y, $x)', '-cos($r)', 'pow(2, 3)']) assert.match(s, TRANSCENDENTAL_PHP, s);
  for (const s of ['det_sin($a)', '$o->cos($r)', 'explode(",", $s)', 'error_log($m)', '$cos($x)']) {
    assert.doesNotMatch(s, TRANSCENDENTAL_PHP, s);
  }
});

test('rad() rounds like PHP deg2rad', () => {
  assert.equal(rad(62), (62 / 180) * Math.PI);
  assert.equal(rad(45.3), (45.3 / 180) * Math.PI);
});

test('dist() is the root of the squares', () => {
  assert.equal(dist(3, 4), 5);
  assert.equal(dist(-1e-3, 2), Math.sqrt(1e-6 + 4));
});

test('powi() is repeated multiplication', () => {
  assert.equal(powi(0.65, 0), 1);
  assert.equal(powi(0.65, 3), 0.65 * 0.65 * 0.65);
});

test('the difficulty table is the same numbers on both sides, and an unknown word aims at normal', () => {
  const php = fs.readFileSync(path.join(dir, 'server/ai.php'), 'utf8');
  for (const level of DIFFICULTIES) {
    const row = php.match(new RegExp(`'${level}' => \\[([^\\]]*)\\]`));
    assert.ok(row, `ROOM_DIFFICULTY has no ${level} row`);
    const got = Object.fromEntries([...row[1].matchAll(/'(\w+)' => (-?[\d.]+)/g)].map(m => [m[1], Number(m[2])]));
    assert.deepEqual(got, { ...DIFFICULTY[level] }, level);
  }
  assert.equal(aimSkill('brutal'), DIFFICULTY.normal);
  assert.equal(aimSkill(undefined), DIFFICULTY.normal);
});
