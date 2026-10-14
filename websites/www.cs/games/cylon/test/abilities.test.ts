// The grenade and the raptor: arming, cooldowns and effects, on a fake clock.
// src/abilities.ts touches no element, so a fake clock and fake timers drive it.
import * as ab from '../src/abilities.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';


interface FakeTimer { id: number; at: number; fn: () => void }

// A harness: a clock, a timer queue that fires on advance(), a Schedule's two fields, and a log.
class Harness {
  t = 1_000;
  live: boolean;
  raptor: boolean;
  ready: Record<ab.Ability, number> = { grenade: 0, raptor: 0 };
  log: string[] = [];
  timers: FakeTimer[] = [];
  nextId = 1;
  a: ab.Abilities;
  constructor(live: boolean, raptor: boolean) {
    this.live = live;
    this.raptor = raptor;
    this.a = ab.createAbilities({
      now: () => this.t,
      setTimer: (fn, ms) => { const id = this.nextId++; this.timers.push({ id, at: this.t + ms, fn }); return id; },
      clearTimer: (id) => { this.timers = this.timers.filter((x) => x.id !== id); },
      isLive: () => this.live,
      readyAt: (w) => this.ready[w],
      setReadyAt: (w, at) => { this.ready[w] = at; },
      sfx: (n) => this.log.push(`sfx:${n}`),
      changed: () => this.log.push('changed'),
      grenadeBlast: (x, y) => this.log.push(`blast:${x},${y}`),
      raptorAvailable: () => this.raptor,
      raptorLaunch: () => this.log.push('launch'),
      raptorStrike: () => this.log.push('strike'),
      raptorClear: () => this.log.push('clear'),
    });
  }
  advance(ms: number): void {
    const end = this.t + ms;
    for (;;) {
      const due = this.timers.filter((x) => x.at <= end).sort((a, b) => a.at - b.at)[0];
      if (!due) break;
      this.timers = this.timers.filter((x) => x !== due);
      this.t = due.at;
      due.fn();
    }
    this.t = end;
  }
}

function harness({ live = true, raptor = true } = {}): Harness {
  return new Harness(live, raptor);
}

// Pure cooldown helpers.
await test('cooldown-remaining-never-negative', () => { assert.ok(ab.cooldownRemaining(500, 900) === 0 && ab.cooldownRemaining(900, 500) === 400, ''); });
await test('cooldown-seconds-round-up', () => { assert.ok(ab.cooldownSeconds(10_000, 0) === 10 && ab.cooldownSeconds(1_001, 0) === 2 && ab.cooldownSeconds(1, 0) === 1, ''); });
await test('cooldown-seconds-zero-when-ready', () => { assert.ok(ab.cooldownSeconds(0, 5) === 0 && ab.cooldownSeconds(5, 5) === 0, ''); });

// Grenade: press arms, a second press disarms, the click throws and starts the cooldown.
{
  const h = harness();
  await test('grenade-press-arms', () => { assert.ok(h.a.readyGrenade() === true && h.a.grenadeArmed(), ''); });
  await test('grenade-arm-plays-the-arm-sound', () => { assert.ok(h.log.join() === 'sfx:grenadeArm,changed', h.log.join()); });
  await test('grenade-second-press-disarms', () => { assert.ok(h.a.readyGrenade() === false && !h.a.grenadeArmed(), ''); });
  h.a.readyGrenade();
  h.log.length = 0;
  await test('grenade-click-throws', () => { assert.ok(h.a.throwGrenadeAt(40, 60) === true && !h.a.grenadeArmed(), ''); });
  await test('grenade-throw-order', () => { assert.ok(h.log.join() === 'changed,sfx:grenade,blast:40,60', h.log.join()); });
  await test('grenade-cooldown-is-ten-seconds', () => { assert.ok(h.ready.grenade === 1_000 + ab.GRENADE_COOLDOWN_MS && ab.GRENADE_COOLDOWN_MS === 10_000, String(h.ready.grenade)); });
  await test('grenade-cannot-arm-while-cooling', () => { assert.ok(h.a.readyGrenade() === false && !h.a.grenadeArmed(), ''); });
  h.advance(9_999);
  await test('grenade-still-cooling-just-before', () => { assert.ok(h.a.readyGrenade() === false, ''); });
  h.advance(1);
  await test('grenade-ready-again-at-the-cooldown', () => { assert.ok(h.a.readyGrenade() === true, ''); });
}
// A throw with nothing armed does nothing.
{
  const h = harness();
  await test('throw-needs-arming', () => { assert.ok(h.a.throwGrenadeAt(1, 2) === false && h.log.length === 0 && h.ready.grenade === 0, h.log.join()); });
}
// Armed, then the cooldown arrives (a pause pushed it out): the throw disarms instead.
{
  const h = harness();
  h.a.readyGrenade();
  h.ready.grenade = h.t + 500;
  h.log.length = 0;
  await test('armed-throw-into-a-cooldown-disarms', () => { assert.ok(h.a.throwGrenadeAt(1, 2) === false && !h.a.grenadeArmed() && h.log.join() === 'changed', h.log.join()); });
}
// Nothing works outside a live run.
{
  const h = harness({ live: false });
  await test('grenade-needs-a-live-run', () => { assert.ok(h.a.readyGrenade() === false && h.a.callRaptor() === false && h.log.length === 0, h.log.join()); });
}

// Raptor: call, strike at 700 ms, land at 1900 ms, 60 s cooldown.
{
  const h = harness();
  await test('raptor-call', () => { assert.ok(h.a.callRaptor() === true && h.a.raptorInbound(), ''); });
  await test('raptor-call-order', () => { assert.ok(h.log.join() === 'clear,changed,sfx:raptor,launch', h.log.join()); });
  await test('raptor-cooldown-is-a-minute', () => { assert.ok(h.ready.raptor === 1_000 + 60_000 && ab.RAPTOR_COOLDOWN_MS === 60_000, String(h.ready.raptor)); });
  await test('raptor-cannot-be-called-twice', () => { assert.ok(h.a.callRaptor() === false, ''); });
  h.advance(ab.RAPTOR_STRIKE_AT_MS - 1);
  await test('raptor-strike-waits', () => { assert.ok(!h.log.includes('strike') && ab.RAPTOR_STRIKE_AT_MS === 700, h.log.join()); });
  h.advance(1);
  await test('raptor-strikes-at-700ms', () => { assert.ok(h.log.at(-1) === 'strike' && h.a.raptorInbound(), h.log.join()); });
  h.advance(ab.RAPTOR_LANDS_AT_MS - ab.RAPTOR_STRIKE_AT_MS - 1);
  await test('raptor-still-inbound-before-landing', () => { assert.ok(h.a.raptorInbound() && ab.RAPTOR_LANDS_AT_MS === 1_900, h.log.join()); });
  h.advance(1);
  await test('raptor-lands-at-1900ms', () => { assert.ok(!h.a.raptorInbound() && h.log.slice(-2).join() === 'clear,changed', h.log.join()); });
  await test('raptor-cooling-after-landing', () => { assert.ok(h.a.callRaptor() === false, ''); });
  h.advance(60_000 - ab.RAPTOR_LANDS_AT_MS);
  await test('raptor-ready-after-a-minute', () => { assert.ok(h.a.callRaptor() === true, ''); });
}
// A page with no raptor refuses the call, and starts no cooldown.
{
  const h = harness({ raptor: false });
  await test('raptor-refused-without-a-sprite', () => { assert.ok(h.a.callRaptor() === false && h.ready.raptor === 0 && h.log.length === 0, h.log.join()); });
}
// The run ends while the raptor is inbound: the strike does not fire.
{
  const h = harness();
  h.a.callRaptor();
  h.live = false;
  h.log.length = 0;
  h.advance(ab.RAPTOR_STRIKE_AT_MS);
  await test('raptor-strike-skipped-when-not-live', () => { assert.ok(!h.log.includes('strike'), h.log.join()); });
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
  await test('reset-zeroes-both-cooldowns', () => { assert.ok(h.ready.grenade === 0 && h.ready.raptor === 0, JSON.stringify(h.ready)); });
  await test('reset-disarms-and-clears-the-raptor', () => { assert.ok(!h.a.grenadeArmed() && !h.a.raptorInbound() && h.log.join() === 'clear' && h.timers.length === 0, `${h.log} ${h.timers.length}`); });
  h.advance(5_000);
  await test('reset-cancels-the-pending-strike', () => { assert.ok(!h.log.includes('strike'), h.log.join()); });
}
{
  // The keys: R calls the raptor, G arms the grenade, Q (the kit's back key) disarms it.
  // Esc does nothing: Safari and Firefox always leave full screen on it.
  const k = (key: string, mods: Partial<Parameters<typeof ab.abilityKey>[0]> = {}) => ab.abilityKey({ key, ...mods });
  await test('key-r-and-g', () => { assert.ok(k('r') === 'raptor' && k('R') === 'raptor' && k('g') === 'grenade' && k('G') === 'grenade'); });
  await test('key-q-disarms', () => { assert.ok(k('q') === 'disarm' && k('Q') === 'disarm'); });
  await test('key-q-held-disarms-once', () => { assert.ok(k('q', { repeat: true }) === null); });
  await test('key-escape-does-nothing', () => { assert.ok(k('Escape') === null); });
  await test('key-modifiers-are-the-browser-s', () => { assert.ok(k('r', { ctrlKey: true }) === null && k('q', { metaKey: true }) === null && k('g', { altKey: true }) === null); });
}
