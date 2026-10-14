// Weapons diverge by their data, never by name: no logic in the game or the
// room server compares a weapon to a key, or lists weapon keys, except the
// Shell, the free gun every player always holds. Looks (linger, body size),
// starting ammo and unlock messages come from game.yaml.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, gfxLinger, startAmmo } from '../src/sim.ts';
import type { FallRules, Gear, Weapon } from '../src/sim.ts';

function must<T>(v: T | null | undefined, what: string): T {
  assert.ok(v !== null && v !== undefined, `${what} is missing`);
  return v;
}
function nth<T>(list: readonly T[], i: number): T {
  return must(list[i], `item ${i}`);
}

const dir = path.join(import.meta.dirname, '..');
const GAME: {
  arsenal: { ammo: Weapon[]; gear?: Gear[]; fall?: Partial<FallRules> };
  effects: Record<string, { body: { size: number; sprite: string } }>;
} = JSON.parse(fs.readFileSync(path.join(dir, 'game.json'), 'utf8'));
const arsenal = must(buildArsenal(GAME.arsenal), 'the arsenal');
const gun = (k: string): Readonly<Weapon> => must(arsenal.weapons[k], `the ${k} row`);
const body = (k: string) => must(GAME.effects[k], `${k}'s effects`).body;
const KEYS = GAME.arsenal.ammo.map(a => a.key).filter(k => k !== 'shell');

const files = [
  ...fs.readdirSync(path.join(dir, 'src')).filter(f => f.endsWith('.ts')).map(f => 'src/' + f),
  ...fs.readdirSync(path.join(dir, 'src/ui')).filter(f => /\.tsx?$/.test(f)).map(f => 'src/ui/' + f),
  ...fs.readdirSync(path.join(dir, 'server')).filter(f => f.endsWith('.php')).map(f => 'server/' + f),
  'rooms.php',
];

test('no logic compares a weapon to a key or lists weapon keys', () => {
  const keys = KEYS.join('|');
  const bans = [
    new RegExp(`[=!]==?\\s*['"](${keys})['"]`), // w === 'nuke'
    new RegExp(`['"](${keys})['"]\\s*[=!]==?`), // 'nuke' === w
    new RegExp(`['"](${keys})['"]\\s*=>\\s*-?\\d`), // ['buck' => 1]
    new RegExp(`[{,]\\s*(${keys}):\\s*-?\\d`), // { buck: 1 }
    new RegExp(`['"](${keys})['"]\\s*,\\s*['"](${keys})['"]`), // ['nuke', 'babynuke'].includes(w)
  ];
  // Some effects share a name with a gun (`effect === 'roller'`): a compare that reads an effect is not about a key.
  const aboutEffect = (line: string, at: number) => /effect/.test(line.slice(Math.max(0, at - 40), at + 40));
  for (const f of files) {
    fs.readFileSync(path.join(dir, f), 'utf8').split('\n').forEach((line, i) => {
      for (const ban of bans) {
        const m = new RegExp(ban.source, 'g');
        for (let hit; (hit = m.exec(line));) {
          assert.ok(aboutEffect(line, hit.index), `${f}:${i + 1} names a weapon in its logic: ${line.trim()}`);
        }
      }
    });
  }
});

test('how long a blast lingers comes from its gfx, and how big a shell flies from its body', () => {
  assert.equal(gfxLinger(gun('nuke').gfx), 0.8);
  assert.equal(gfxLinger(gun('babynuke').gfx), 0.7);
  assert.equal(gfxLinger(gun('shell').gfx), 0.5, 'the default');
  for (const k of arsenal.order) assert.ok(body(k).size > 0 && /^p_/.test(body(k).sprite), `${k} flies a rendered body`);
  assert.ok(body('babynuke').size < body('nuke').size && body('babynuke').size > body('mortar').size);
});

test('every player starts a match with the rows\' start shells and an endless Shell', () => {
  assert.deepEqual(startAmmo(arsenal), { shell: Infinity, buck: 1 });
});

test('the weapon picker shows each category together, the Rollers side by side', () => {
  const shelf = arsenal.shelf;
  assert.equal(shelf.length, arsenal.order.length);
  assert.equal(shelf[0], 'shell');
  const cats = shelf.map(k => gun(k).cat || 'Shells');
  for (let i = 1; i < cats.length; i++) {
    if (cats[i] !== cats[i - 1]) assert.ok(!cats.slice(0, i).includes(must(cats[i], `category ${i}`)), `${cats[i]} comes back after another category`);
  }
  const at = (k: string) => shelf.indexOf(k);
  assert.deepEqual([at('babyroller') - at('roller'), at('heavyroller') - at('babyroller')], [1, 1]);
  assert.deepEqual(arsenal.order, GAME.arsenal.ammo.map(a => a.key), 'the rack keeps game.yaml order');
});
