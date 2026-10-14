// The solo match flow without a browser. src/flow.ts is a table of which event is
// legal in which phase; this checks every legal move, that every other pair is
// rejected, and walks a whole match from the demo to the match-over veil.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PHASES, EVENTS, FLOW, transition, WATCH_SPEED, warSpeed } from '../src/flow.ts';
import type { FlowEvent, Phase } from '../src/flow.ts';


// Every legal transition, written out independently of the table.
const LEGAL: [FlowEvent, Phase, Phase][] = [
  ...PHASES.flatMap((p): [FlowEvent, Phase, Phase][] => [['matchStart', p, 'banner'], ['demo', p, 'banner']]),
  ['shopOpen', 'banner', 'shop'],
  ['shopDone', 'shop', 'banner'],
  ['playerUp', 'banner', 'aim'], ['playerUp', 'settle', 'aim'],
  ['foeUp', 'banner', 'think'], ['foeUp', 'settle', 'think'],
  ['fire', 'aim', 'fly'], ['fire', 'think', 'fly'],
  ['shellsLanded', 'fly', 'settle'], ['shellsLanded', 'settle', 'settle'],
  ['roundWon', 'settle', 'banner'],
  ['tankLost', 'settle', 'banner'],
  ['matchWon', 'settle', 'over'],
  ['matchLost', 'settle', 'over'],
];
for (const [ev, from, to] of LEGAL) {
  await test(`${ev}: ${from} -> ${to}`, () => { assert.ok(transition(from, ev) === to, String(transition(from, ev))); });
}

const legalKey = new Set(LEGAL.map(([ev, from]) => `${ev}@${from}`));
let rejected = 0;
const wrongly: string[] = [];
for (const ev of EVENTS) for (const ph of PHASES) {
  if (legalKey.has(`${ev}@${ph}`)) continue;
  if (transition(ph, ev) === null) rejected++; else wrongly.push(`${ev}@${ph}`);
}
await test('every other event/phase pair is rejected', () => { assert.ok(wrongly.length === 0, wrongly.join(', ')); });
await test('the rejections were counted', () => { assert.ok(rejected === EVENTS.length * PHASES.length - LEGAL.length, String(rejected)); });
const PHASE_NAMES: readonly string[] = PHASES;
await test('the table has a row for each event and only known phases', () => { assert.ok(Object.keys(FLOW).length === EVENTS.length
  && EVENTS.every(ev => FLOW[ev] && Object.entries(FLOW[ev]).every(([f, t]) => PHASE_NAMES.includes(f) && PHASE_NAMES.includes(t)))); });

// Spot checks on moves that must never work.
await test('no firing from a name card', () => { assert.ok(transition('banner', 'fire') === null); });
await test('no firing while shells are up', () => { assert.ok(transition('fly', 'fire') === null); });
await test('no leaving the shop by taking a turn', () => { assert.ok(transition('shop', 'playerUp') === null && transition('shop', 'foeUp') === null); });
await test('the shop closes only into a round', () => { assert.ok(transition('shop', 'shellsLanded') === null); });
await test('a finished match takes nothing but a new game', () => { assert.ok(EVENTS.every(ev => ev === 'matchStart' || ev === 'demo' || transition('over', ev) === null)); });
await test('an unknown event or phase is rejected', () => {
  // @ts-expect-error: a phase the table does not know, on purpose
  assert.ok(transition('nowhere', 'fire') === null
    // @ts-expect-error: an event the table does not know, on purpose
    && transition('aim', 'nothing') === null);
});

// A scripted match: the demo, then a new match; one round won, a wrecked
// tank, a second round won, and a last wreck that ends it.
let phase: Phase = 'aim'; // the page before anything has started
const trail: Phase[] = [phase];
const go = async (ev: FlowEvent): Promise<void> => {
  const next = transition(phase, ev);
  if (next === null) { await test(`script: ${ev} from ${phase}`, () => { assert.ok(false, 'rejected'); }); return; }
  phase = next;
  trail.push(phase);
};
const expect = async (name: string, want: Phase): Promise<void> => await test(`script: ${name}`, () => { assert.ok(phase === want, `${phase} != ${want}`); });

await go('demo'); await expect('the demo opens on its name card', 'banner');
await go('foeUp'); await expect('a drone moves first', 'think');
await go('fire'); await go('shellsLanded'); await go('shellsLanded'); await expect('the volley settles', 'settle');
await go('roundWon'); await expect('the demo rolls to the next round', 'banner');
await go('matchStart'); await expect('a new game takes over from the demo', 'banner');
await go('shopOpen'); await expect('the starting stake is spent in the shop', 'shop');
await go('shopDone'); await expect('the shop closes on round 1', 'banner');
await go('playerUp'); await expect('the player opens', 'aim');
await go('fire'); await expect('the shell flies', 'fly');
await go('shellsLanded'); await expect('it lands', 'settle');
await go('foeUp'); await expect('a drone answers', 'think');
await go('fire'); await go('shellsLanded'); await expect('the drone fires and it lands', 'settle');
await go('playerUp'); await go('fire'); await go('shellsLanded'); await expect('the player fires again', 'settle');
await go('roundWon'); await expect('round 1 is won', 'banner');
await go('shopOpen'); await expect('the winnings are spent', 'shop');
await go('shopDone'); await go('foeUp'); await go('fire'); await go('shellsLanded'); await expect('round 2: a drone wrecks the tank', 'settle');
await go('foeUp'); await go('fire'); await go('shellsLanded'); await expect('the drones fight on while the player watches', 'settle');
await go('tankLost'); await expect('the last drone standing ends the round on a name card', 'banner');
await go('shopOpen'); await expect('a lost round goes through the shop too', 'shop');
await go('shopDone'); await go('playerUp'); await go('fire'); await go('shellsLanded'); await go('roundWon'); await go('shopOpen'); await expect('round 3 is won, shop again', 'shop');
await go('shopDone'); await go('foeUp'); await go('fire'); await go('shellsLanded'); await go('matchLost'); await expect('the last tank is lost: match over', 'over');
await go('matchStart'); await expect('a rematch starts over', 'banner');

await test('the script visited every phase', () => { assert.ok(PHASES.every(p => trail.includes(p)), trail.join(' ')); });

// The war speeds up threefold once the player's tank is wrecked.
await test('watch speed is triple', () => { assert.ok(WATCH_SPEED === 3); });
await test('normal speed while the player stands', () => { assert.ok(warSpeed(true, false) === 1); });
await test('triple speed once the player is wrecked', () => { assert.ok(warSpeed(false, false) === 3); });
await test('the demo never speeds up', () => { assert.ok(warSpeed(false, true) === 1 && warSpeed(true, true) === 1); });

