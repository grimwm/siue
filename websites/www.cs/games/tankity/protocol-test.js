// The client's protocol types against the server and its fixtures. Run here:
// `node protocol-test.js`.
// src/protocol-fixtures.check.ts (run by tools/ts-build.mjs) holds the fixtures'
// shapes to src/protocol.ts, but a JSON import types every string as `string`,
// so the literal unions are checked here: the compiler reads them out of
// protocol.ts, and they are compared with the fixtures, with the action, phase
// and event names rooms.php spells out, and with the events game.js handles.
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const __dirname = import.meta.dirname;
const read = file => fs.readFileSync(path.join(__dirname, file), 'utf8');
const php = read('rooms.php');
const game = read('game.js');

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${detail}`}`);
  if (!ok) failed++;
};

// ---- the literal unions, as the compiler sees them ----
const file = path.join(__dirname, 'src', 'protocol.ts');
const program = ts.createProgram([file], { target: ts.ScriptTarget.ES2022, strict: true, noEmit: true, skipLibCheck: true });
const checker = program.getTypeChecker();
const sf = program.getSourceFile(file);
const problems = ts.getPreEmitDiagnostics(program);
check('protocol-types-compile', problems.length === 0, problems.map(d => ts.flattenDiagnosticMessageText(d.messageText, ' ')).join('; '));

function declared(name) {
  const node = sf.statements.find(st => (ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st)) && st.name.text === name);
  if (!node) throw new Error(`protocol.ts declares no ${name}`);
  return checker.getTypeAtLocation(node.name);
}
function literals(type) {
  const parts = type.isUnion() ? type.types : [type];
  return parts.map(t => { if (!t.isStringLiteral()) throw new Error('not a string-literal union: ' + checker.typeToString(type)); return t.value; });
}
const PHASES = literals(declared('RoomPhase'));
const SEAT_MODES = literals(declared('SeatMode'));
const EVENT_TYPES = literals(declared('RoomEventType'));
const tankKinds = literals(checker.getTypeOfSymbol(declared('RoomTank').getProperty('kind')));
const POST_ACTIONS = declared('PostBodies').getProperties().map(p => p.name);

// ---- every fixture's literals ----
const dir = path.join(__dirname, 'protocol');
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
// A seq-less `join` is stored but never sent in a snapshot (see protocol.ts).
const unsent = new Set(['join']);
const phpEvents = set(/'t' => '(\w+)'/g);
const missing = [...phpEvents].filter(t => !EVENT_TYPES.includes(t) && !unsent.has(t));
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
const typos = [...handled].filter(t => !EVENT_TYPES.includes(t) && !unsent.has(t));
check('client-handles-only-real-events', typos.length === 0, typos.join());

if (failed) { console.log(`\n${failed} check(s) failed`); process.exit(1); }
console.log('\nPROTOCOL-OK');
