// The solo match flow without a browser. Run here: `node flow-test.js`.
// js/flow.js (compiled from src/flow.ts) is a table of which event is legal in
// which phase; this checks every legal move, that every other pair is
// rejected, and walks a whole match from the demo to the match-over veil.
import { PHASES, EVENTS, FLOW, transition, WATCH_SPEED, warSpeed, runWar } from './js/flow.js';

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${detail}`}`);
  if (!ok) failed++;
};

// Every legal transition, written out independently of the table.
const LEGAL = [
  ...PHASES.flatMap(p => [['matchStart', p, 'banner'], ['demo', p, 'banner']]),
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
  check(`${ev}: ${from} -> ${to}`, transition(from, ev) === to, String(transition(from, ev)));
}

const legalKey = new Set(LEGAL.map(([ev, from]) => `${ev}@${from}`));
let rejected = 0;
const wrongly = [];
for (const ev of EVENTS) for (const ph of PHASES) {
  if (legalKey.has(`${ev}@${ph}`)) continue;
  if (transition(ph, ev) === null) rejected++; else wrongly.push(`${ev}@${ph}`);
}
check('every other event/phase pair is rejected', wrongly.length === 0, wrongly.join(', '));
check('the rejections were counted', rejected === EVENTS.length * PHASES.length - LEGAL.length, String(rejected));
check('the table has a row for each event and only known phases',
  Object.keys(FLOW).length === EVENTS.length
  && EVENTS.every(ev => FLOW[ev] && Object.entries(FLOW[ev]).every(([f, t]) => PHASES.includes(f) && PHASES.includes(t))));

// Spot checks on moves that must never work.
check('no firing from a name card', transition('banner', 'fire') === null);
check('no firing while shells are up', transition('fly', 'fire') === null);
check('no leaving the shop by taking a turn', transition('shop', 'playerUp') === null && transition('shop', 'foeUp') === null);
check('the shop closes only into a round', transition('shop', 'shellsLanded') === null);
check('a finished match takes nothing but a new game', EVENTS.every(ev => ev === 'matchStart' || ev === 'demo' || transition('over', ev) === null));
check('an unknown event or phase is rejected', transition('nowhere', 'fire') === null && transition('aim', 'nothing') === null);

// A scripted match: the demo, then a new match; one round won, a wrecked
// tank, a second round won, and a last wreck that ends it.
let phase = 'aim'; // the page before anything has started
const trail = [phase];
const go = ev => {
  const next = transition(phase, ev);
  if (next === null) { check(`script: ${ev} from ${phase}`, false, 'rejected'); return; }
  phase = next;
  trail.push(phase);
};
const expect = (name, want) => check(`script: ${name}`, phase === want, `${phase} != ${want}`);

go('demo'); expect('the demo opens on its name card', 'banner');
go('foeUp'); expect('a drone moves first', 'think');
go('fire'); go('shellsLanded'); go('shellsLanded'); expect('the volley settles', 'settle');
go('roundWon'); expect('the demo rolls to the next round', 'banner');
go('matchStart'); expect('a new game takes over from the demo', 'banner');
go('shopOpen'); expect('the starting stake is spent in the shop', 'shop');
go('shopDone'); expect('the shop closes on round 1', 'banner');
go('playerUp'); expect('the player opens', 'aim');
go('fire'); expect('the shell flies', 'fly');
go('shellsLanded'); expect('it lands', 'settle');
go('foeUp'); expect('a drone answers', 'think');
go('fire'); go('shellsLanded'); expect('the drone fires and it lands', 'settle');
go('playerUp'); go('fire'); go('shellsLanded'); expect('the player fires again', 'settle');
go('roundWon'); expect('round 1 is won', 'banner');
go('shopOpen'); expect('the winnings are spent', 'shop');
go('shopDone'); go('foeUp'); go('fire'); go('shellsLanded'); expect('round 2: a drone wrecks the tank', 'settle');
go('foeUp'); go('fire'); go('shellsLanded'); expect('the drones fight on while the player watches', 'settle');
go('tankLost'); expect('the last drone standing ends the round on a name card', 'banner');
go('shopOpen'); expect('a lost round goes through the shop too', 'shop');
go('shopDone'); go('playerUp'); go('fire'); go('shellsLanded'); go('roundWon'); go('shopOpen'); expect('round 3 is won, shop again', 'shop');
go('shopDone'); go('foeUp'); go('fire'); go('shellsLanded'); go('matchLost'); expect('the last tank is lost: match over', 'over');
go('matchStart'); expect('a rematch starts over', 'banner');

check('the script visited every phase', PHASES.every(p => trail.includes(p)), trail.join(' '));

// The war speeds up once the player's tank is wrecked: three sub-steps a
// frame, each the normal step, until the phase leaves think/fly/settle.
check('watch speed is triple', WATCH_SPEED === 3);
check('normal speed while the player stands', warSpeed(true, false) === 1);
check('triple speed once the player is wrecked', warSpeed(false, false) === 3);
check('the demo never speeds up', warSpeed(false, true) === 1 && warSpeed(true, true) === 1);
{
  // A fake clock: 60 frames of 1/60 s. A drone that needs 2 s of think time
  // fires after 120 frames at normal speed and after 40 when watched.
  const frames = speed => {
    let thinkT = 2, f = 0;
    while (thinkT > 0 && f < 1000) { f++; runWar(1 / 60, speed, d => { thinkT -= d; return thinkT > 0; }); }
    return f;
  };
  check('a think delay takes 120 frames at normal speed', Math.abs(frames(1) - 120) <= 1, String(frames(1)));
  check('a think delay takes a third of the frames when watched', Math.abs(frames(warSpeed(false, false)) - 40) <= 1, String(frames(3)));
  let steps = 0;
  check('runWar runs speed sub-steps of the same dt', runWar(0.05, 3, d => { steps += d; return true; }) === 3 && Math.abs(steps - 0.15) < 1e-9);
  check('runWar stops when the phase leaves the war', runWar(0.05, 3, () => false) === 1);
}

console.log(failed ? `${failed} failed` : 'all passed');
process.exit(failed ? 1 : 0);
