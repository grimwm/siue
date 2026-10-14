// The client's protocol types against the server and its fixtures.
// src/protocol-fixtures.check.ts holds the fixtures' shapes to src/protocol.ts
// (the check program, type-checked below), but a JSON import types every string as
// `string`, so the literal unions are read out of protocol.ts here and compared
// with the fixtures, with the action, phase and event names rooms.php spells out,
// and with the events the client handles (src/*.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const GAME_DIR = path.join(import.meta.dirname, '..');
const read = (file: string): string => fs.readFileSync(path.join(GAME_DIR, file), 'utf8');
// The room server is rooms.php plus the files it requires from server/.
const php = ['rooms.php', ...['settings', 'store', 'sim', 'ai', 'rules', 'protocol'].map(f => `server/${f}.php`)].map(read).join('\n');
const srcFiles = (dir => fs.readdirSync(path.join(GAME_DIR, dir), { recursive: true, encoding: 'utf8' }).filter(f => /\.tsx?$/.test(f)).map(f => `${dir}/${f}`))('src');
const game = srcFiles.map(read).join('\n');

// ---- the check program: fixtures assigned to the protocol types ----
/** A field of execFileSync's error (it carries the child's stdout and stderr). */
const outputOf = (e: unknown, key: 'stdout' | 'stderr'): unknown => (typeof e === 'object' && e !== null ? Reflect.get(e, key) : undefined);
let tscOut = '';
try {
  execFileSync(path.join(GAME_DIR, '..', 'node_modules', '.bin', 'tsc'), ['-p', 'src/tsconfig.check.json', '--noEmit'], { cwd: GAME_DIR, encoding: 'utf8', stdio: 'pipe' });
} catch (e) {
  tscOut = String(outputOf(e, 'stdout') || '') + String(outputOf(e, 'stderr') || '') || String(e);
}
await test('protocol-types-compile', () => { assert.ok(tscOut === '', tscOut.trim()); });

// ---- the literal unions, read from protocol.ts ----
const proto = read('src/protocol.ts');
/** A regex match's group `i`, which every pattern in this file always captures. */
function group(m: RegExpMatchArray | null, what: string, i = 1): string {
  const g = m?.[i];
  if (g === undefined) throw new Error(`no match for ${what}`);
  return g;
}
const quoted = (text: string): string[] => [...text.matchAll(/'(\w+)'/g)].map(m => group(m, 'a quoted name'));
function aliasBody(name: string): string {
  const m = proto.match(new RegExp(`export type ${name}\\s*=\\s*([^;]+);`));
  if (!m) throw new Error(`protocol.ts declares no type ${name}`);
  return group(m, name);
}
function blockOf(name: string): string {
  const m = proto.match(new RegExp(`export interface ${name}\\b[^{]*\\{([\\s\\S]*?)\\n\\}`));
  if (!m) throw new Error(`protocol.ts declares no interface ${name}`);
  return group(m, name);
}
const PHASES = quoted(aliasBody('RoomPhase'));
const SEAT_MODES = quoted(aliasBody('SeatMode'));
const tankKinds = quoted(group(blockOf('RoomTank').match(/\bkind: ([^;]+);/), 'RoomTank kind'));
const POST_ACTIONS = [...blockOf('PostBodies').matchAll(/^  (\w+):/gm)].map(m => group(m, 'a PostBodies key'));
// Each event interface names its tag; the volley openers share one generic.
const tagOf = new Map<string, string>();
for (const m of proto.matchAll(/export interface (\w+) extends EventBase \{ t: '(\w+)'/g)) tagOf.set(group(m, 'an event interface'), group(m, 'an event tag', 2));
for (const m of proto.matchAll(/export type (\w+) = VolleyOpener<'(\w+)'>/g)) tagOf.set(group(m, 'an event interface'), group(m, 'an event tag', 2));
const ShotBlock = proto.match(/export interface (ShotEvent) extends EventBase \{\s*t: '(\w+)'/);
if (ShotBlock) tagOf.set(group(ShotBlock, 'ShotEvent'), group(ShotBlock, 'ShotEvent tag', 2));
const EVENT_TYPES = aliasBody('RoomEvent').split('|').map(n => n.trim()).filter(Boolean).map(n => {
  const tag = tagOf.get(n);
  if (tag === undefined) throw new Error(`RoomEvent member ${n} has no t tag`);
  return tag;
});

// ---- every fixture's literals ----
const dir = path.join(GAME_DIR, 'protocol');
/** A fixture as JSON.parse reads it: every literal is a plain string, which is what these checks are for. */
interface Fixture { body?: { room?: { phase: string; seats: { mode: string }[]; tanks: { kind: string }[]; events: { t: string }[] } } }
const fixtures = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'sim-vectors.json');
const inFixtures = new Set<string>();
for (const f of fixtures) {
  const body = (JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as Fixture).body;
  const room = body && body.room;
  if (!room) continue;
  await test(`fixture-phase ${f}`, () => { assert.ok(PHASES.includes(room.phase), room.phase); });
  await test(`fixture-seat-modes ${f}`, () => { assert.ok(room.seats.every(s => SEAT_MODES.includes(s.mode)), JSON.stringify(room.seats.map(s => s.mode))); });
  await test(`fixture-tank-kinds ${f}`, () => { assert.ok(room.tanks.every(t => tankKinds.includes(t.kind))); });
  const bad = room.events.filter(e => !EVENT_TYPES.includes(e.t)).map(e => e.t);
  await test(`fixture-event-types ${f}`, () => { assert.ok(bad.length === 0, bad.join()); });
  for (const e of room.events) inFixtures.add(e.t);
}
await test('fixtures-exercise-the-core-events', () => { assert.ok(['round', 'fire', 'shot', 'hit', 'kill', 'aifire', 'roundwin'].every(t => inFixtures.has(t)), [...inFixtures].join()); });

// ---- what rooms.php spells out ----
const set = (re: RegExp): Set<string> => new Set([...php.matchAll(re)].map(m => group(m, String(re))));
const phpEvents = set(/'t' => '(\w+)'/g);
const missing = [...phpEvents].filter(t => !EVENT_TYPES.includes(t));
const unused = EVENT_TYPES.filter(t => !phpEvents.has(t));
await test('events-in-rooms-php-are-typed', () => { assert.ok(missing.length === 0, missing.join()); });
await test('typed-events-exist-in-rooms-php', () => { assert.ok(unused.length === 0, unused.join()); });

const phpPhases = new Set([...php.matchAll(/'phase'(?:\] =| =>) '(\w+)'/g)].map(m => group(m, 'a name')));
// 'play' is set through a ternary (`count(tanks) ? 'play' : 'over'`), so each typed phase is looked for as a quoted name.
await test('phases-match-rooms-php', () => { assert.ok(PHASES.every(p => php.includes(`'${p}'`)) && [...phpPhases].every(p => PHASES.includes(p)), [...phpPhases].join()); });

const phpPosts = new Set([...php.matchAll(/\$action === '(\w+)' && \$method === 'POST'/g)].map(m => group(m, 'a name')));
// create/join carry their own origin check rather than the shared gate but are POSTs like the rest.
await test('post-actions-match-rooms-php', () => { assert.ok(POST_ACTIONS.every(a => phpPosts.has(a)) && [...phpPosts].every(a => POST_ACTIONS.includes(a)), `typed ${POST_ACTIONS.join()} vs rooms.php ${[...phpPosts].join()}`); });

const phpSeatModes = new Set([...php.matchAll(/'mode' => '(\w+)'/g)].map(m => group(m, 'a name')));
await test('seat-modes-in-rooms-php', () => { assert.ok([...phpSeatModes].every(m => SEAT_MODES.includes(m)), [...phpSeatModes].join()); });

// ---- what the client handles ----
const handled = new Set([...game.matchAll(/\be\.t === '(\w+)'/g)].map(m => group(m, 'a name')));
const typos = [...handled].filter(t => !EVENT_TYPES.includes(t));
await test('client-handles-events', () => { assert.ok(handled.size > 0, 'no \'e.t === ...\' branches found in the client source'); });
await test('client-handles-only-real-events', () => { assert.ok(typos.length === 0, typos.join()); });

