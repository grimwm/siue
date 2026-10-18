// The guide's built-in sounds: counted clicks with a stronger first beat, a
// pair of notes up then down, one note from soft to loud; short and quiet.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEMOS, demoLength, scheduleDemo, STOP_FADE } from '../src/demo.ts';

test('clicks: two bars of four, the first beat of each higher and louder', () => {
  const c = DEMOS.clicks;
  assert.equal(c.length, 8);
  for (const [i, t] of c.entries()) {
    const strong = i % 4 === 0;
    assert.equal(t.freq > 1200, strong, `click ${i}`);
    assert.equal(t.vol > 0.15, strong, `click ${i}`);
  }
});

test('updown: up a fifth, then down again', () => {
  const [a, b, c, d] = DEMOS.updown;
  assert.ok(b!.freq > a!.freq && d!.freq < c!.freq);
});

test('swell: one note whose volume rises from soft to loud', () => {
  const s = DEMOS.swell;
  assert.equal(s.length, 1);
  assert.ok(s[0]!.volTo! > s[0]!.vol * 5);
});

test('ticks: evenly spaced and all the same', () => {
  const t = DEMOS.ticks;
  assert.equal(t.length, 8);
  assert.ok(t.every((x, i) => Math.abs(x.at - i * 0.25) < 1e-9 && x.freq === t[0]!.freq && x.vol === t[0]!.vol));
});

test('every demo is short, in time order and never loud', () => {
  for (const id of ['clicks', 'ticks', 'updown', 'swell'] as const) {
    assert.ok(demoLength(id) <= 4.5, id);
    assert.ok(DEMOS[id].every(t => Math.max(t.vol, t.volTo ?? 0) <= 0.3), id);
    assert.ok(DEMOS[id].every((t, i, all) => i === 0 || t.at >= all[i - 1]!.at), id);
  }
});

// A stub context records what scheduleDemo asks of it.
interface Voice { type: string; freq: number; start: number; stop: number; ramps: [string, number, number][]; gainNow: number }
function stubContext(): { ctx: Parameters<typeof scheduleDemo>[0]; voices: Voice[]; connected: string[] } {
  const voices: Voice[] = [];
  const connected: string[] = [];
  const dest = { connect: () => undefined };
  const ctx = {
    destination: dest,
    currentTime: 5,
    createOscillator: () => {
      const v: Voice = { type: '', freq: 0, start: -1, stop: -1, ramps: [], gainNow: 0.1 };
      voices.push(v);
      const osc = {
        frequency: { set value(f: number) { v.freq = f; } },
        set type(t: string) { v.type = t; },
        connect: () => { connected.push('osc'); },
        start: (at: number) => { v.start = at; },
        stop: (at: number) => { v.stop = at; },
      };
      return osc as unknown as ReturnType<Parameters<typeof scheduleDemo>[0]['createOscillator']>;   // the stub implements only what scheduleDemo calls
    },
    createGain: () => {
      const v = voices[voices.length - 1]!;
      return {
        gain: {
          get value() { return 0.1; },
          cancelScheduledValues: (at: number) => { v.ramps.push(['cancel', 0, at]); },
          setValueAtTime: (value: number, at: number) => { v.ramps.push(['set', value, at]); },
          linearRampToValueAtTime: (value: number, at: number) => { v.ramps.push(['ramp', value, at]); },
        },
        connect: () => { connected.push('gain'); },
      };
    },
  };
  return { ctx, voices, connected };
}

test('scheduleDemo: each tone sounds at its frequency and time, peaking at its volume', () => {
  for (const id of ['clicks', 'ticks', 'updown', 'swell'] as const) {
    const { ctx, voices, connected } = stubContext();
    const { end } = scheduleDemo(ctx, id, 10);
    assert.equal(voices.length, DEMOS[id].length, id);
    assert.equal(end, 10 + demoLength(id), id);
    for (const [i, t] of DEMOS[id].entries()) {
      const v = voices[i]!;
      assert.equal(v.type, t.wave);
      assert.equal(v.freq, t.freq);
      assert.equal(v.start, 10 + t.at);
      assert.ok(Math.abs(v.stop - (10 + t.at + t.dur)) < 1e-9);
      assert.deepEqual(v.ramps.map(r => r[1]), [0, t.vol, t.vol, t.volTo ?? t.vol, 0], 'silent, up to its volume, then to its end volume, back to silent');
      assert.ok(v.ramps.every((r, k, all) => k === 0 || r[2] >= all[k - 1]![2]), 'ramps in time order');
    }
    assert.equal(connected.length, 2 * DEMOS[id].length);
  }
});

test('scheduleDemo is deterministic', () => {
  const a = stubContext();
  const b = stubContext();
  scheduleDemo(a.ctx, 'updown', 1);
  scheduleDemo(b.ctx, 'updown', 1);
  assert.deepEqual(a.voices, b.voices);
});

test('stop() fades every gain to 0 within 30 ms and stops the oscillators', () => {
  const { ctx, voices } = stubContext();
  const run = scheduleDemo(ctx, 'clicks', 10);
  for (const v of voices) v.ramps.length = 0;
  run.stop();
  for (const v of voices) {
    assert.deepEqual(v.ramps, [['cancel', 0, 5], ['set', 0.1, 5], ['ramp', 0, 5 + STOP_FADE]]);
    assert.equal(v.stop, 5 + STOP_FADE);
  }
  assert.ok(STOP_FADE <= 0.03);
});
