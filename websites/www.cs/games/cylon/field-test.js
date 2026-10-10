// The terrain holes: hold and fade timing, the cap, and pause. Run here:
// `node field-test.js`. js/field.js (compiled from src/field.ts) is handed fake
// elements, a fake clock and fake timers, so nothing needs a browser.
import * as f from './js/field.js';

let failed = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${detail}`}`);
  if (!ok) failed++;
};

function fakeEl() {
  const el = {
    className: '', style: { props: {}, setProperty(k, v) { this.props[k] = v; } },
    attrs: {}, children: [], connected: false, classes: new Set(),
    setAttribute(k, v) { this.attrs[k] = v; },
    appendChild(c) { this.children.push(c); c.connected = true; },
    remove() { this.connected = false; },
    classList: null,
    get isConnected() { return this.connected; },
  };
  el.classList = { add: (c) => el.classes.add(c), remove: (c) => el.classes.delete(c) };
  return el;
}

function harness({ live = true } = {}) {
  const h = { t: 0, live, paused: false, timers: [], nextId: 1, vp: { width: 1000, height: 800 } };
  h.field = fakeEl();
  h.field.querySelectorAll = () => [];
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
  h.holes = f.createHoles({
    field: h.field,
    isLive: () => h.live,
    paused: () => h.paused,
    viewport: () => h.vp,
    create: () => fakeEl(),
    now: () => h.t,
    setTimer: (fn, ms) => { const id = h.nextId++; h.timers.push({ id, at: h.t + ms, fn }); return id; },
    clearTimer: (id) => { h.timers = h.timers.filter((x) => x.id !== id); },
  });
  return h;
}

check('presets-keep-their-timings', f.HOLE_PRESETS.small.holdMs === 800 && f.HOLE_PRESETS.small.fadeMs === 1000
  && f.HOLE_PRESETS.medium.holdMs === 2500 && f.HOLE_PRESETS.medium.fadeMs === 2000 && f.HOLE_PRESETS.medium.radius === 165
  && f.HOLE_PRESETS.large.holdMs === 4000 && f.HOLE_PRESETS.large.fadeMs === 3000 && f.MAX_HOLES === 24, '');

// A hole holds, fades, then goes: medium is 2500 ms of hold and 2000 ms of fade.
{
  const h = harness();
  h.holes.punch(10, 20, f.HOLE_PRESETS.medium);
  const el = h.field.children[0];
  check('punch-appends-a-sized-hole', h.holes.count() === 1 && el.className === 'cylon-hole'
    && el.style.left === '10px' && el.style.top === '20px' && el.style.width === '330px' && el.children[0].className === 'cylon-hole-glitch', JSON.stringify(el.style));
  h.advance(2_499);
  check('hole-holds-for-holdMs', h.holes.count() === 1 && !el.classes.has('is-fading'), '');
  h.advance(1);
  check('hole-starts-fading-after-hold', el.classes.has('is-fading') && el.style.props['--hole-fade-ms'] === '2000ms' && h.holes.count() === 1, '');
  h.advance(1_999);
  check('hole-fades-for-fadeMs', h.holes.count() === 1 && el.connected, '');
  h.advance(1);
  check('hole-is-removed-after-fade', h.holes.count() === 0 && !el.connected, '');
}
// Defaults: no preset means the small hold and fade and a viewport-sized radius.
{
  const h = harness();
  h.holes.punch(0, 0);
  const el = h.field.children[0];
  check('default-radius-is-the-large-crater', h.holes.largeRadius() === 800 * 0.42 && el.style.width === `${800 * 0.42 * 2}px`, el.style.width);
  h.advance(800);
  check('default-hold-is-the-small-preset', el.classes.has('is-fading') && el.style.props['--hole-fade-ms'] === '1000ms', '');
}
// No hole outside a live run, or without a field.
{
  const h = harness({ live: false });
  h.holes.punch(1, 1, f.HOLE_PRESETS.small);
  check('no-hole-when-not-live', h.holes.count() === 0 && h.field.children.length === 0, '');
}
// The cap: the 25th hole fades the oldest, which is then dropped to stay at the cap.
{
  const h = harness();
  for (let i = 0; i < f.MAX_HOLES; i++) h.holes.punch(i, 0, f.HOLE_PRESETS.large);
  check('holds-up-to-the-cap', h.holes.count() === 24, String(h.holes.count()));
  const oldest = h.field.children[0];
  h.holes.punch(99, 0, f.HOLE_PRESETS.large);
  check('cap-makes-room-by-dropping-the-oldest', h.holes.count() === 24 && !oldest.connected && h.field.children.at(-1).connected, String(h.holes.count()));
}
// clearAll removes everything and cancels the timers.
{
  const h = harness();
  h.holes.punch(0, 0, f.HOLE_PRESETS.small);
  h.holes.punch(1, 1, f.HOLE_PRESETS.medium);
  h.holes.clearAll();
  check('clearAll-removes-holes-and-timers', h.holes.count() === 0 && h.field.children.every((c) => !c.connected) && h.timers.length === 0, String(h.timers.length));
}
// Pause: timers stop; resuming pushes a hold still ahead of the pause out by the pause.
{
  const h = harness();
  h.holes.punch(0, 0, f.HOLE_PRESETS.medium); // hold due at 2500
  const el = h.field.children[0];
  h.advance(1_000);
  const pausedAt = h.t;
  h.paused = true;
  h.holes.pause();
  check('pause-stops-the-timers', h.timers.length === 0, String(h.timers.length));
  h.advance(5_000);
  check('nothing-happens-while-paused', h.holes.count() === 1 && !el.classes.has('is-fading'), '');
  h.paused = false;
  h.holes.resume(pausedAt, 5_000);
  check('resume-rearms-the-remaining-hold', h.timers.length === 1 && h.timers[0].at === h.t + 1_500, JSON.stringify(h.timers.map((x) => x.at)));
  h.advance(1_499);
  check('hold-resumes-where-it-left-off', !el.classes.has('is-fading'), '');
  h.advance(1);
  check('hold-ends-after-the-skewed-wait', el.classes.has('is-fading'), '');
}
// Pause during a fade: the fade is pushed out too.
{
  const h = harness();
  h.holes.punch(0, 0, f.HOLE_PRESETS.small);
  h.advance(800); // fading, due at 1800
  const el = h.field.children[0];
  h.advance(300);
  const pausedAt = h.t;
  h.holes.pause();
  h.advance(2_000);
  h.holes.resume(pausedAt, 2_000);
  check('resume-rearms-the-remaining-fade', h.timers.length === 1 && h.timers[0].at === h.t + 700, JSON.stringify(h.timers.map((x) => x.at)));
  h.advance(700);
  check('fade-completes-after-resume', h.holes.count() === 0 && !el.connected, '');
}
// A timer that comes due while paused (before pause() cleared it) does nothing.
{
  const h = harness();
  h.holes.punch(0, 0, f.HOLE_PRESETS.small);
  h.paused = true;
  h.advance(800);
  check('a-due-timer-is-ignored-while-paused', h.holes.count() === 1 && !h.field.children[0].classes.has('is-fading'), '');
}

console.log(failed ? `FIELD-FAIL ${failed}` : 'FIELD-OK');
process.exit(failed ? 1 : 0);
