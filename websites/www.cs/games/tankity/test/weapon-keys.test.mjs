// Weapons diverge by their data, never by name: no logic in the game or the
// room server compares a weapon to a key, or lists weapon keys, except the
// Shell, the free gun every player always holds. Looks (linger, body size),
// starting ammo and unlock messages come from game.yaml.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildArsenal, gfxLinger, gfxSize, startAmmo } from '../src/sim.ts';

const dir = path.join(import.meta.dirname, '..');
const GAME = JSON.parse(fs.readFileSync(path.join(dir, 'game.json'), 'utf8'));
const arsenal = buildArsenal(GAME.arsenal);
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
  ];
  // Some effects share a name with a gun (`effect === 'roller'`): a compare that reads an effect is not about a key.
  const aboutEffect = (line, at) => /effect/.test(line.slice(Math.max(0, at - 40), at + 40));
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

test('how long a blast lingers and how big a shell flies come from its gfx', () => {
  const w = arsenal.weapons;
  assert.equal(gfxLinger(w.nuke.gfx), 0.8);
  assert.equal(gfxLinger(w.babynuke.gfx), 0.7);
  assert.equal(gfxLinger(w.shell.gfx), 0.5, 'the default');
  assert.equal(gfxSize(w.nuke.gfx), 7);
  assert.equal(gfxSize(w.mortar.gfx), 4.5);
  assert.ok(gfxSize(w.babynuke.gfx) > gfxSize(w.mortar.gfx) && gfxSize(w.babynuke.gfx) < gfxSize(w.nuke.gfx));
  assert.equal(gfxSize(w.shell.gfx), 3.5, 'the default');
});

test('every player starts a match with the rows\' start shells and an endless Shell', () => {
  assert.deepEqual(startAmmo(arsenal), { shell: Infinity, buck: 1 });
});
