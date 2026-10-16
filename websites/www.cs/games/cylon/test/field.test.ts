// The terrain holes: hold and fade timing, the cap, and pause. Run by
// `node --test` (games/cylon/test.sh). src/field.ts is handed fake
// elements, a fake clock and fake timers, so nothing needs a browser.
import * as f from '../src/field.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { last, nth } from '../../_kit/test/nth.ts';


class FakeStyle {
  props: Record<string, string> = {};
  left?: string;
  top?: string;
  width?: string;
  height?: string;
  setProperty(k: string, v: string): void { this.props[k] = v; }
}

/** The few element members src/field.ts touches. */
class FakeEl {
  className = '';
  style = new FakeStyle();
  attrs: Record<string, string> = {};
  children: FakeEl[] = [];
  connected = false;
  classes = new Set<string>();
  classList = { add: (c: string) => this.classes.add(c), remove: (c: string) => this.classes.delete(c) };
  setAttribute(k: string, v: string): void { this.attrs[k] = v; }
  appendChild(c: FakeEl): void { this.children.push(c); c.connected = true; }
  remove(): void { this.connected = false; }
  querySelectorAll(): FakeEl[] { return []; }
  get isConnected(): boolean { return this.connected; }
}
// The deps take real elements; src/field.ts reads only what FakeEl has.
const asHTMLElement = (el: FakeEl): HTMLElement => el as unknown as HTMLElement;

interface FakeTimer { id: number; at: number; fn: () => void }

class Harness {
  t = 0;
  live: boolean;
  paused = false;
  timers: FakeTimer[] = [];
  nextId = 1;
  vp = { width: 1000, height: 800 };
  field = new FakeEl();
  holes: f.Holes;
  constructor(live: boolean) {
    this.live = live;
    this.holes = f.createHoles({
      field: asHTMLElement(this.field),
      isLive: () => this.live,
      paused: () => this.paused,
      viewport: () => this.vp,
      create: () => asHTMLElement(new FakeEl()),
      now: () => this.t,
      setTimer: (fn, ms) => { const id = this.nextId++; this.timers.push({ id, at: this.t + ms, fn }); return id; },
      clearTimer: (id) => { this.timers = this.timers.filter((x) => x.id !== id); },
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

function harness({ live = true } = {}): Harness {
  return new Harness(live);
}

await test('presets-keep-their-timings', () => { assert.ok(f.HOLE_PRESETS.small.holdMs === 800 && f.HOLE_PRESETS.small.fadeMs === 1000
  && f.HOLE_PRESETS.medium.holdMs === 2500 && f.HOLE_PRESETS.medium.fadeMs === 2000 && f.HOLE_PRESETS.medium.radius === 165
  && f.HOLE_PRESETS.large.holdMs === 4000 && f.HOLE_PRESETS.large.fadeMs === 3000 && f.MAX_HOLES === 24, ''); });

// A hole holds, fades, then goes: medium is 2500 ms of hold and 2000 ms of fade.
{
  const h = harness();
  h.holes.punch(10, 20, f.HOLE_PRESETS.medium);
  const el = nth(h.field.children, 0);
  await test('punch-appends-a-sized-hole', () => { assert.ok(h.holes.count() === 1 && el.className === 'cylon-hole'
    && el.style.left === '10px' && el.style.top === '20px' && el.style.width === '330px' && nth(el.children, 0).className === 'cylon-hole-glitch', JSON.stringify(el.style)); });
  h.advance(2_499);
  await test('hole-holds-for-holdMs', () => { assert.ok(h.holes.count() === 1 && !el.classes.has('is-fading'), ''); });
  h.advance(1);
  await test('hole-starts-fading-after-hold', () => { assert.ok(el.classes.has('is-fading') && el.style.props['--hole-fade-ms'] === '2000ms' && h.holes.count() === 1, ''); });
  h.advance(1_999);
  await test('hole-fades-for-fadeMs', () => { assert.ok(h.holes.count() === 1 && el.connected, ''); });
  h.advance(1);
  await test('hole-is-removed-after-fade', () => { assert.ok(h.holes.count() === 0 && !el.connected, ''); });
}
// Defaults: no preset means the small hold and fade and a viewport-sized radius.
{
  const h = harness();
  h.holes.punch(0, 0);
  const el = nth(h.field.children, 0);
  await test('default-radius-is-the-large-crater', () => { assert.ok(h.holes.largeRadius() === 800 * 0.42 && el.style.width === `${800 * 0.42 * 2}px`, el.style.width); });
  h.advance(800);
  await test('default-hold-is-the-small-preset', () => { assert.ok(el.classes.has('is-fading') && el.style.props['--hole-fade-ms'] === '1000ms', ''); });
}
// No hole outside a live run, or without a field.
{
  const h = harness({ live: false });
  h.holes.punch(1, 1, f.HOLE_PRESETS.small);
  await test('no-hole-when-not-live', () => { assert.ok(h.holes.count() === 0 && h.field.children.length === 0, ''); });
}
// The cap: the 25th hole fades the oldest, which is then dropped to stay at the cap.
{
  const h = harness();
  for (let i = 0; i < f.MAX_HOLES; i++) h.holes.punch(i, 0, f.HOLE_PRESETS.large);
  await test('holds-up-to-the-cap', () => { assert.ok(h.holes.count() === 24, String(h.holes.count())); });
  const oldest = nth(h.field.children, 0);
  h.holes.punch(99, 0, f.HOLE_PRESETS.large);
  await test('cap-makes-room-by-dropping-the-oldest', () => { assert.ok(h.holes.count() === 24 && !oldest.connected && last(h.field.children).connected, String(h.holes.count())); });
}
// clearAll removes everything and cancels the timers.
{
  const h = harness();
  h.holes.punch(0, 0, f.HOLE_PRESETS.small);
  h.holes.punch(1, 1, f.HOLE_PRESETS.medium);
  h.holes.clearAll();
  await test('clearAll-removes-holes-and-timers', () => { assert.ok(h.holes.count() === 0 && h.field.children.every((c) => !c.connected) && h.timers.length === 0, String(h.timers.length)); });
}
// Pause: timers stop; resuming pushes a hold still ahead of the pause out by the pause.
{
  const h = harness();
  h.holes.punch(0, 0, f.HOLE_PRESETS.medium); // hold due at 2500
  const el = nth(h.field.children, 0);
  h.advance(1_000);
  const pausedAt = h.t;
  h.paused = true;
  h.holes.pause();
  await test('pause-stops-the-timers', () => { assert.ok(h.timers.length === 0, String(h.timers.length)); });
  h.advance(5_000);
  await test('nothing-happens-while-paused', () => { assert.ok(h.holes.count() === 1 && !el.classes.has('is-fading'), ''); });
  h.paused = false;
  h.holes.resume(pausedAt, 5_000);
  await test('resume-rearms-the-remaining-hold', () => { assert.ok(h.timers.length === 1 && nth(h.timers, 0).at === h.t + 1_500, JSON.stringify(h.timers.map((x) => x.at))); });
  h.advance(1_499);
  await test('hold-resumes-where-it-left-off', () => { assert.ok(!el.classes.has('is-fading'), ''); });
  h.advance(1);
  await test('hold-ends-after-the-skewed-wait', () => { assert.ok(el.classes.has('is-fading'), ''); });
}
// Pause during a fade: the fade is pushed out too.
{
  const h = harness();
  h.holes.punch(0, 0, f.HOLE_PRESETS.small);
  h.advance(800); // fading, due at 1800
  const el = nth(h.field.children, 0);
  h.advance(300);
  const pausedAt = h.t;
  h.holes.pause();
  h.advance(2_000);
  h.holes.resume(pausedAt, 2_000);
  await test('resume-rearms-the-remaining-fade', () => { assert.ok(h.timers.length === 1 && nth(h.timers, 0).at === h.t + 700, JSON.stringify(h.timers.map((x) => x.at))); });
  h.advance(700);
  await test('fade-completes-after-resume', () => { assert.ok(h.holes.count() === 0 && !el.connected, ''); });
}
// A timer that comes due while paused (before pause() cleared it) does nothing.
{
  const h = harness();
  h.holes.punch(0, 0, f.HOLE_PRESETS.small);
  h.paused = true;
  h.advance(800);
  await test('a-due-timer-is-ignored-while-paused', () => { assert.ok(h.holes.count() === 1 && !nth(h.field.children, 0).classes.has('is-fading'), ''); });
}
