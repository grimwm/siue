// Demo (src/demo.ts): it starts a run of its own Endless at Medium with every piece, plays each level out at its
// pace, goes on a beat after a win, waits quietly while the next level is made, holds still while the page is hidden,
// keeps the screen awake and takes a refused wake lock quietly, and leaves no trace when it ends.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_GRADE, DEMO_PACE, DEMO_TRIES, createDemo, demoWords, memoryStorage } from '../src/demo.ts';
import type { DemoGame, WakeLock } from '../src/demo.ts';
import type { EndlessMode, EndlessView } from '../src/endless/mode.ts';
import { createEndlessSaved } from '../src/endless/saved.ts';
import { createEndlessMode } from '../src/endless/mode.ts';
import { createEndlessClient } from '../src/endless/client.ts';
import type { WorkerLike } from '../src/endless/client.ts';
import { createEndlessHost } from '../src/endless/host.ts';
import type { FromEndless, ToEndless } from '../src/endless/host.ts';
import { BANKS } from '../src/endless/bank.ts';
import { CHAPTERS } from '../src/campaign/chapters.ts';

/** Timers run by hand: `run(ms)` moves the clock on and fires what falls due. */
function fakeTimers() {
  let now = 0, seq = 1;
  const due = new Map<number, { at: number; fn: () => void }>();
  return {
    setTimeout: (fn: () => void, ms: number) => { const id = seq++; due.set(id, { at: now + ms, fn }); return id; },
    clearTimeout: (id: number) => { due.delete(id); },
    run(ms: number) {
      const end = now + ms;
      for (;;) {
        const next = [...due.entries()].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        due.delete(next[0]);
        now = next[1].at;
        next[1].fn();
      }
      now = end;
    },
    pending: () => due.size,
  };
}

/** A game whose play-out wins the level the moment it starts. */
function fakeGame() {
  const g = {
    opens: 0,
    playing: false,
    run: null as { now: { outcome: string; moves: number } } | null,
    autos: [] as (number | undefined)[],
    stops: 0,
    win: true,
    open() { g.opens++; g.run = { now: { outcome: 'playing', moves: 0 } }; },
    auto(every?: number) { g.autos.push(every); if (g.win) g.run = { now: { outcome: 'won', moves: 40 } }; },
    stop() { g.stops++; },
  };
  return g satisfies DemoGame;
}

/** Demo's Endless as far as Demo uses it: `newRun` and `next` open a level now, or once `make()` is called. */
function fakeMode(open: () => void, ready: { now: boolean }) {
  const calls: string[] = [];
  let depth = 0, cleared = 0, finding = false;
  const mode = {
    calls,
    make() { finding = false; depth++; open(); },
    view: () => ({ grade: 'medium', run: depth ? { seed: 's', tier: 10, depth, cleared } : null, finding: finding ? { progress: null } : null, error: null }) as unknown as EndlessView,
    newRun(seed?: string, tier?: number, grade?: string) { calls.push(`new ${seed} ${tier} ${grade}`); depth = 0; cleared = 0; if (ready.now) mode.make(); else finding = true; },
    won(moves: number, assisted: boolean) { calls.push(`won ${moves} ${assisted}`); cleared = depth; },
    next() { calls.push('next'); if (ready.now) mode.make(); else finding = true; },
    hurry() { calls.push('hurry'); },
    cancel() { calls.push('cancel'); },
  };
  return mode;
}

/** Lets the promises settled so far run their callbacks. */
const flush = (): Promise<void> => new Promise(resolve => setImmediate(resolve));

function setup(opts: { ready?: boolean; lock?: 'grant' | 'refuse' } = {}) {
  const timers = fakeTimers();
  const game = fakeGame();
  const ready = { now: opts.ready ?? true };
  let shown = true;
  const locks: { released: boolean; release(): void }[] = [];
  let cancelled = 0;
  let mode!: ReturnType<typeof fakeMode>;
  const demo = createDemo({
    timers,
    game,
    mode: () => {
      mode = fakeMode(() => { game.open(); demo.opened(); }, ready);
      return mode as unknown as EndlessMode;
    },
    tier: 10,
    newSeed: () => 'seed1',
    shown: () => shown,
    changed: () => {},
    cancel: () => { cancelled++; },
    wakeLock: () => {
      if (opts.lock === 'refuse') return Promise.reject(new Error('NotAllowedError'));
      const l = { released: false, release() { l.released = true; } };
      locks.push(l);
      return Promise.resolve(l as WakeLock);
    },
  });
  return { demo, timers, game, ready, locks, mode: () => mode, cancelled: () => cancelled, setShown: (v: boolean) => { shown = v; demo.update(); } };
}

test('the strip words name the difficulty and the level, or the level being made', () => {
  assert.equal(demoWords({ grade: 'medium', depth: 7, finding: false }), 'Demo · Endless Medium · Level 7');
  assert.equal(demoWords({ grade: 'medium', depth: 8, finding: true }), 'Demo · Endless Medium · Finding Level 8…');
});

test('memory storage keeps what is set, for the page alone', () => {
  const s = memoryStorage();
  assert.equal(s.getItem('k'), null);
  s.setItem('k', 'v');
  assert.equal(s.getItem('k'), 'v');
  s.removeItem('k');
  assert.equal(s.getItem('k'), null);
  // An Endless save over it works as over the browser's.
  const saved = createEndlessSaved(memoryStorage(), 'medium');
  assert.equal(saved.run(), null);
});

test('Demo starts a Medium run with every piece and plays its level out at a pace a touch slower than Auto', () => {
  const t = setup();
  t.demo.start();
  assert.equal(t.demo.active(), true);
  assert.deepEqual(t.mode().calls, ['new seed1 10 medium']);
  assert.deepEqual(t.demo.view(), { grade: 'medium', depth: 1, finding: false });
  assert.deepEqual(t.game.autos, [], 'the board shows a moment first');
  t.timers.run(DEMO_PACE.begin);
  assert.deepEqual(t.game.autos, [DEMO_PACE.step]);
  assert.ok(DEMO_PACE.step >= 360, 'no faster than Auto');
});

test('a beat after a win, the next level opens and plays, without end', () => {
  const t = setup();
  t.demo.start();
  t.timers.run(DEMO_PACE.begin);
  t.demo.update();
  t.timers.run(DEMO_PACE.next - 1);
  assert.equal(t.game.opens, 1, 'not before the beat');
  t.timers.run(1);
  assert.equal(t.game.opens, 2);
  assert.deepEqual(t.mode().calls.slice(1), ['won 40 true', 'next']);
  for (let i = 0; i < 5; i++) {
    t.timers.run(DEMO_PACE.begin);
    t.demo.update();
    t.timers.run(DEMO_PACE.next);
  }
  assert.equal(t.game.opens, 7);
  assert.equal(t.demo.view()!.depth, 7);
});

test('while the next level is made Demo waits quietly, and plays it once it is in', () => {
  const t = setup();
  t.demo.start();
  t.timers.run(DEMO_PACE.begin);
  t.demo.update();
  t.ready.now = false;
  t.timers.run(DEMO_PACE.next);
  assert.deepEqual(t.demo.view(), { grade: 'medium', depth: 2, finding: true });
  t.timers.run(DEMO_PACE.wait - 1);
  assert.equal(t.game.autos.length, 1, 'nothing plays while it waits');
  assert.ok(!t.mode().calls.includes('hurry'), 'it waits a while');
  t.timers.run(1);
  assert.equal(t.mode().calls.at(-1), 'hurry', 'then asks for the bank\'s level');
  t.mode().make();
  assert.deepEqual(t.demo.view(), { grade: 'medium', depth: 2, finding: false });
  t.timers.run(DEMO_PACE.begin);
  assert.equal(t.game.autos.length, 2);
});

test('a line that will not play goes on to the next level after a few tries', () => {
  const t = setup();
  t.game.win = false;
  t.demo.start();
  for (let i = 0; i < DEMO_TRIES; i++) {
    t.timers.run(DEMO_PACE.begin);
    t.demo.update();
  }
  assert.equal(t.game.autos.length, DEMO_TRIES);
  t.timers.run(DEMO_PACE.begin);
  assert.equal(t.game.opens, 2);
});

test('a hidden page plays nothing, and the play-out starts again once it shows', () => {
  const t = setup();
  t.demo.start();
  t.setShown(false);
  t.timers.run(10_000);
  assert.deepEqual(t.game.autos, []);
  assert.ok(t.game.stops > 0);
  t.setShown(true);
  t.timers.run(DEMO_PACE.begin);
  assert.equal(t.game.autos.length, 1);
});

test('the screen wake lock is held while Demo runs and let go when it ends; a refusal changes nothing', async () => {
  const t = setup();
  t.demo.start();
  await flush();
  assert.equal(t.locks.length, 1);
  assert.equal(t.locks[0]!.released, false);
  // The browser let it go while the page was hidden: showing again asks anew.
  t.locks[0]!.released = true;
  t.demo.update();
  await flush();
  assert.equal(t.locks.length, 2);
  t.demo.stop();
  assert.equal(t.locks[1]!.released, true);

  const r = setup({ lock: 'refuse' });
  r.demo.start();
  await flush();
  r.timers.run(DEMO_PACE.begin);
  assert.equal(r.game.autos.length, 1, 'plays on without the lock');
});

test('ending Demo stops the play-out, its searches and its timers', () => {
  const t = setup({ ready: false });
  t.demo.start();
  assert.deepEqual(t.demo.view(), { grade: 'medium', depth: 1, finding: true });
  t.demo.stop();
  assert.equal(t.demo.active(), false);
  assert.equal(t.demo.view(), null);
  assert.equal(t.cancelled(), 1);
  assert.ok(t.mode().calls.includes('cancel'));
  assert.equal(t.timers.pending(), 0);
  // A level made after it ended opens nothing for it.
  t.demo.opened();
  t.timers.run(10_000);
  assert.deepEqual(t.game.autos, []);
});

/** An Endless worker whose bank answers at once and whose search answers, empty, at once up to `quick` (a level
 *  whose search runs out goes to the bank) and past it never: a search that runs for minutes. */
function searchWorker(quick: number): WorkerLike & { terminated: boolean } {
  const w: WorkerLike & { terminated: boolean } = {
    terminated: false, onmessage: null, onerror: null,
    terminate() { w.terminated = true; },
    postMessage(raw) {
      const m = raw as ToEndless;
      const answer = (r: FromEndless) => queueMicrotask(() => { if (!w.terminated) w.onmessage?.({ data: r }); });
      if (m.type === 'part') {
        if (m.request.depth <= quick) answer({ type: 'part', id: m.id, part: m.part, result: { found: null, tries: 1, spent: 1 } });
        return;
      }
      createEndlessHost({ post: answer, banks: BANKS, known: () => ({ features: [] }), now: () => 0 }).receive(m);
    },
  };
  return w;
}

test('Demo goes on past level 3 at Medium when a level\'s search runs long: it waits a while, then plays the bank\'s', async () => {
  const timers = fakeTimers();
  const game = fakeGame();
  const tier = CHAPTERS.filter(c => c.released).length;
  const client = createEndlessClient(() => searchWorker(3), () => 3);
  const demo = createDemo({
    timers,
    game,
    mode: () => {
      const store = memoryStorage();
      return createEndlessMode({
        saved: g => createEndlessSaved(store, g), grade: () => DEMO_GRADE, setGrade: () => {}, client, tier: () => tier,
        newSeed: () => 'slow23', play: () => { game.open(); demo.opened(); }, changed: () => demo.update(),
      });
    },
    tier, newSeed: () => 'slow23', shown: () => true, changed: () => {},
  });
  demo.start();
  // Five minutes of Demo, a second at a time, the game reporting each win as the page's does.
  for (let s = 0; s < 300 && game.opens < 6; s++) {
    await flush();
    timers.run(1000);
    demo.update();
  }
  assert.ok(game.opens >= 6, `Demo reached level ${game.opens} and stayed: "${demoWords(demo.view()!)}"`);
  demo.stop();
});
