// The client's protocol types against the server and its fixtures.
// src/protocol-fixtures.check.ts holds the fixtures' shapes to src/protocol.ts
// (the check program, type-checked below), but a JSON import types every string as
// `string`, so the literal unions are read out of protocol.ts here and compared
// with the fixtures, with the action, phase and event names rooms.php spells out,
// and with the events the client handles (src/*.ts).
import { check } from '../../_kit/test/check.ts';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const GAME_DIR = path.join(import.meta.dirname, '..');
const read = file => fs.readFileSync(path.join(GAME_DIR, file), 'utf8');
// The room server is rooms.php plus the files it requires from server/.
const php = ['rooms.php', ...['settings', 'store', 'sim', 'ai', 'rules', 'protocol'].map(f => `server/${f}.php`)].map(read).join('\n');
const srcFiles = (dir => fs.readdirSync(path.join(GAME_DIR, dir), { recursive: true }).filter(f => /\.tsx?$/.test(f)).map(f => `${dir}/${f}`))('src');
const game = srcFiles.map(read).join('\n');

// ---- the check program: fixtures assigned to the protocol types ----
let tscOut = '';
try {
  execFileSync(path.join(GAME_DIR, '..', 'node_modules', '.bin', 'tsc'), ['-p', 'src/tsconfig.check.json', '--noEmit'], { cwd: GAME_DIR, encoding: 'utf8', stdio: 'pipe' });
} catch (e) {
  tscOut = String(e.stdout || '') + String(e.stderr || '') || String(e);
}
check('protocol-types-compile', tscOut === '', tscOut.trim());

// ---- the literal unions, read from protocol.ts ----
const proto = read('src/protocol.ts');
const quoted = text => [...text.matchAll(/'(\w+)'/g)].map(m => m[1]);
function aliasBody(name) {
  const m = proto.match(new RegExp(`export type ${name}\\s*=\\s*([^;]+);`));
  if (!m) throw new Error(`protocol.ts declares no type ${name}`);
  return m[1];
}
function blockOf(name) {
  const m = proto.match(new RegExp(`export interface ${name}\\b[^{]*\\{([\\s\\S]*?)\\n\\}`));
  if (!m) throw new Error(`protocol.ts declares no interface ${name}`);
  return m[1];
}
const PHASES = quoted(aliasBody('RoomPhase'));
const SEAT_MODES = quoted(aliasBody('SeatMode'));
const tankKinds = quoted(blockOf('RoomTank').match(/\bkind: ([^;]+);/)[1]);
const POST_ACTIONS = [...blockOf('PostBodies').matchAll(/^  (\w+):/gm)].map(m => m[1]);
// Each event interface names its tag; the volley openers share one generic.
const tagOf = new Map();
for (const m of proto.matchAll(/export interface (\w+) extends EventBase \{ t: '(\w+)'/g)) tagOf.set(m[1], m[2]);
for (const m of proto.matchAll(/export type (\w+) = VolleyOpener<'(\w+)'>/g)) tagOf.set(m[1], m[2]);
const ShotBlock = proto.match(/export interface (ShotEvent) extends EventBase \{\s*t: '(\w+)'/);
if (ShotBlock) tagOf.set(ShotBlock[1], ShotBlock[2]);
const EVENT_TYPES = aliasBody('RoomEvent').split('|').map(n => n.trim()).filter(Boolean).map(n => {
  if (!tagOf.has(n)) throw new Error(`RoomEvent member ${n} has no t tag`);
  return tagOf.get(n);
});

// ---- every fixture's literals ----
const dir = path.join(GAME_DIR, 'protocol');
const fixtures = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'sim-vectors.json');
const inFixtures = new Set();
for (const f of fixtures) {
  const body = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).body;
  const room = body && body.room;
  if (!room) continue;
  check(`fixture-phase ${f}`, PHASES.includes(room.phase), room.phase);
  check(`fixture-seat-modes ${f}`, room.seats.every(s => SEAT_MODES.includes(s.mode)), JSON.stringify(room.seats.map(s => s.mode)));
  check(`fixture-tank-kinds ${f}`, room.tanks.every(t => tankKinds.includes(t.kind)));
  const bad = room.events.filter(e => !EVENT_TYPES.includes(e.t)).map(e => e.t);
  check(`fixture-event-types ${f}`, bad.length === 0, bad.join());
  for (const e of room.events) inFixtures.add(e.t);
}
check('fixtures-exercise-the-core-events', ['round', 'fire', 'shot', 'hit', 'kill', 'aifire', 'roundwin'].every(t => inFixtures.has(t)), [...inFixtures].join());

// ---- what rooms.php spells out ----
const set = re => new Set([...php.matchAll(re)].map(m => m[1]));
const phpEvents = set(/'t' => '(\w+)'/g);
const missing = [...phpEvents].filter(t => !EVENT_TYPES.includes(t));
const unused = EVENT_TYPES.filter(t => !phpEvents.has(t));
check('events-in-rooms-php-are-typed', missing.length === 0, missing.join());
check('typed-events-exist-in-rooms-php', unused.length === 0, unused.join());

const phpPhases = new Set([...php.matchAll(/'phase'(?:\] =| =>) '(\w+)'/g)].map(m => m[1]));
// 'play' is set through a ternary (`count(tanks) ? 'play' : 'over'`), so each typed phase is looked for as a quoted name.
check('phases-match-rooms-php', PHASES.every(p => php.includes(`'${p}'`)) && [...phpPhases].every(p => PHASES.includes(p)), [...phpPhases].join());

const phpPosts = new Set([...php.matchAll(/\$action === '(\w+)' && \$method === 'POST'/g)].map(m => m[1]));
// create/join carry their own origin check rather than the shared gate but are POSTs like the rest.
check('post-actions-match-rooms-php', POST_ACTIONS.every(a => phpPosts.has(a)) && [...phpPosts].every(a => POST_ACTIONS.includes(a)),
  `typed ${POST_ACTIONS.join()} vs rooms.php ${[...phpPosts].join()}`);

const phpSeatModes = new Set([...php.matchAll(/'mode' => '(\w+)'/g)].map(m => m[1]));
check('seat-modes-in-rooms-php', [...phpSeatModes].every(m => SEAT_MODES.includes(m)), [...phpSeatModes].join());

// ---- what the client handles ----
const handled = new Set([...game.matchAll(/\be\.t === '(\w+)'/g)].map(m => m[1]));
const typos = [...handled].filter(t => !EVENT_TYPES.includes(t));
check('client-handles-events', handled.size > 0, 'no \'e.t === ...\' branches found in the client source');
check('client-handles-only-real-events', typos.length === 0, typos.join());

