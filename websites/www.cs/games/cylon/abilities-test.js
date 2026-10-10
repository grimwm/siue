// The grenade and the raptor: arming, cooldowns and effects, on a fake clock.
// Run here: `node abilities-test.js`. js/abilities.js (compiled from
// src/abilities.ts) touches no element, so a fake clock and fake timers drive it.
import * as ab from './js/abilities.js';

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${detail}`}`);
  if (!ok) failed++;
};

// A harness: a clock, a timer queue that fires on advance(), a Schedule's two fields, and a log.
function harness({ live = true, raptor = true } = {}) {
  const h = { t: 1_000, live, raptor, ready: { grenade: 0, raptor: 0 }, log: [], timers: [], nextId: 1 };
  h.advance = (ms) => {
    const end = h.t + ms;
    for (;;) {
      const due = h.timers.filter((x) => x.at <= end).sort((a, b) => a.at - b.at)[0];
      if (!due) break;
      h.timers = h.timers.filter((x) => x !== due);
      h.t = due.at;
      due.fn();
    }
    h.t = end;
  };
  h.a = ab.createAbilities({
    now: () => h.t,
    setTimer: (fn, ms) => { const id = h.nextId++; h.timers.push({ id, at: h.t + ms, fn }); return id; },
    clearTimer: (id) => { h.timers = h.timers.filter((x) => x.id !== id); },
    isLive: () => h.live,
    readyAt: (w) => h.ready[w],
    setReadyAt: (w, at) => { h.ready[w] = at; },
    sfx: (n) => h.log.push(`sfx:${n}`),
    changed: () => h.log.push('changed'),
    grenadeBlast: (x, y) => h.log.push(`blast:${x},${y}`),
    raptorAvailable: () => h.raptor,
    raptorLaunch: () => h.log.push('launch'),
    raptorStrike: () => h.log.push('strike'),
    raptorClear: () => h.log.push('clear'),
  });
  return h;
}

// Pure cooldown helpers.
check('cooldown-remaining-never-negative', ab.cooldownRemaining(500, 900) === 0 && ab.cooldownRemaining(900, 500) === 400, '');
check('cooldown-seconds-round-up', ab.cooldownSeconds(10_000, 0) === 10 && ab.cooldownSeconds(1_001, 0) === 2 && ab.cooldownSeconds(1, 0) === 1, '');
check('cooldown-seconds-zero-when-ready', ab.cooldownSeconds(0, 5) === 0 && ab.cooldownSeconds(5, 5) === 0, '');

// Grenade: press arms, a second press disarms, the click throws and starts the cooldown.
{
  const h = harness();
  check('grenade-press-arms', h.a.readyGrenade() === true && h.a.grenadeArmed(), '');
  check('grenade-arm-plays-the-arm-sound', h.log.join() === 'sfx:grenadeArm,changed', h.log.join());
  check('grenade-second-press-disarms', h.a.readyGrenade() === false && !h.a.grenadeArmed(), '');
  h.a.readyGrenade();
  h.log.length = 0;
  check('grenade-click-throws', h.a.throwGrenadeAt(40, 60) === true && !h.a.grenadeArmed(), '');
  check('grenade-throw-order', h.log.join() === 'changed,sfx:grenade,blast:40,60', h.log.join());
  check('grenade-cooldown-is-ten-seconds', h.ready.grenade === 1_000 + ab.GRENADE_COOLDOWN_MS && ab.GRENADE_COOLDOWN_MS === 10_000, String(h.ready.grenade));
  check('grenade-cannot-arm-while-cooling', h.a.readyGrenade() === false && !h.a.grenadeArmed(), '');
  h.advance(9_999);
  check('grenade-still-cooling-just-before', h.a.readyGrenade() === false, '');
  h.advance(1);
  check('grenade-ready-again-at-the-cooldown', h.a.readyGrenade() === true, '');
}
// A throw with nothing armed does nothing.
{
  const h = harness();
  check('throw-needs-arming', h.a.throwGrenadeAt(1, 2) === false && h.log.length === 0 && h.ready.grenade === 0, h.log.join());
}
// Armed, then the cooldown arrives (a pause pushed it out): the throw disarms instead.
{
  const h = harness();
  h.a.readyGrenade();
  h.ready.grenade = h.t + 500;
  h.log.length = 0;
  check('armed-throw-into-a-cooldown-disarms', h.a.throwGrenadeAt(1, 2) === false && !h.a.grenadeArmed() && h.log.join() === 'changed', h.log.join());
}
// Nothing works outside a live run.
{
  const h = harness({ live: false });
  check('grenade-needs-a-live-run', h.a.readyGrenade() === false && h.a.callRaptor() === false && h.log.length === 0, h.log.join());
}

// Raptor: call, strike at 700 ms, land at 1900 ms, 60 s cooldown.
{
  const h = harness();
  check('raptor-call', h.a.callRaptor() === true && h.a.raptorInbound(), '');
  check('raptor-call-order', h.log.join() === 'clear,changed,sfx:raptor,launch', h.log.join());
  check('raptor-cooldown-is-a-minute', h.ready.raptor === 1_000 + 60_000 && ab.RAPTOR_COOLDOWN_MS === 60_000, String(h.ready.raptor));
  check('raptor-cannot-be-called-twice', h.a.callRaptor() === false, '');
  h.advance(ab.RAPTOR_STRIKE_AT_MS - 1);
  check('raptor-strike-waits', !h.log.includes('strike') && ab.RAPTOR_STRIKE_AT_MS === 700, h.log.join());
  h.advance(1);
  check('raptor-strikes-at-700ms', h.log.at(-1) === 'strike' && h.a.raptorInbound(), h.log.join());
  h.advance(ab.RAPTOR_LANDS_AT_MS - ab.RAPTOR_STRIKE_AT_MS - 1);
  check('raptor-still-inbound-before-landing', h.a.raptorInbound() && ab.RAPTOR_LANDS_AT_MS === 1_900, h.log.join());
  h.advance(1);
  check('raptor-lands-at-1900ms', !h.a.raptorInbound() && h.log.slice(-2).join() === 'clear,changed', h.log.join());
  check('raptor-cooling-after-landing', h.a.callRaptor() === false, '');
  h.advance(60_000 - ab.RAPTOR_LANDS_AT_MS);
  check('raptor-ready-after-a-minute', h.a.callRaptor() === true, '');
}
// A page with no raptor refuses the call, and starts no cooldown.
{
  const h = harness({ raptor: false });
  check('raptor-refused-without-a-sprite', h.a.callRaptor() === false && h.ready.raptor === 0 && h.log.length === 0, h.log.join());
}
// The run ends while the raptor is inbound: the strike does not fire.
{
  const h = harness();
  h.a.callRaptor();
  h.live = false;
  h.log.length = 0;
  h.advance(ab.RAPTOR_STRIKE_AT_MS);
  check('raptor-strike-skipped-when-not-live', !h.log.includes('strike'), h.log.join());
}
// Reset: cooldowns zero, disarmed, the raptor's timers dropped and its effects cleared.
{
  const h = harness();
  h.a.readyGrenade();
  h.a.throwGrenadeAt(1, 1);
  h.a.readyGrenade();
  h.a.callRaptor();
  h.log.length = 0;
  h.a.reset();
  check('reset-zeroes-both-cooldowns', h.ready.grenade === 0 && h.ready.raptor === 0, JSON.stringify(h.ready));
  check('reset-disarms-and-clears-the-raptor', !h.a.grenadeArmed() && !h.a.raptorInbound() && h.log.join() === 'clear' && h.timers.length === 0, `${h.log} ${h.timers.length}`);
  h.advance(5_000);
  check('reset-cancels-the-pending-strike', !h.log.includes('strike'), h.log.join());
}

console.log(failed ? `ABILITIES-FAIL ${failed}` : 'ABILITIES-OK');
process.exit(failed ? 1 : 0);
