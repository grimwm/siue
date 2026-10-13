// The rule modules the server's solo play depends on must compute the same
// numbers in the browser and on the server: no wall clock, no Math.random, no
// Math.hypot, no powers, no degree conversion other than rad(). See README
// "Solo determinism".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { rad, dist, powi } from '../src/sim.ts';
import { DIFFICULTIES, DIFFICULTY, aimSkill } from '../src/ai.ts';

const dir = path.join(import.meta.dirname, '..');
const read = f => fs.readFileSync(path.join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');

for (const file of ['src/sim.ts', 'src/ai.ts', 'src/armor.ts']) {
  test(`${file} uses only replay-safe math`, () => {
    const src = read(file);
    for (const banned of [/Math\.random/, /Math\.hypot/, /\*\*/, /Date\.now|performance\.now/, /\* Math\.PI \/ 180/]) {
      assert.doesNotMatch(src, banned, `${file} must not use ${banned}`);
    }
  });
}

for (const file of ['server/sim.php', 'server/ai.php']) {
  test(`${file} uses only replay-safe math`, () => {
    const src = read(file);
    for (const banned of [/\bhypot\(/, /\*\*/, /\bmt_rand|\brand\(|random_int|microtime/]) {
      assert.doesNotMatch(src, banned, `${file} must not use ${banned}`);
    }
  });
}

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
