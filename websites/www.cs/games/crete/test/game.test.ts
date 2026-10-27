// The controller: a press during a slide finishes it and acts once; the thread marks the try assisted;
// a win records progress; undo and restart go through; sounds follow the events.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/game.ts';
import { createFoundPages } from '../src/pages.ts';
import { CAMPAIGN_LEVELS } from '../src/campaign/chapters.ts';
import { createProgress } from '../src/progress.ts';
import { manualClock } from '../../_kit/test/clock.ts';
import { solve } from '../src/puzzle/solver.ts';
import { stateKey } from './reference-solver.ts';
import { step } from '../src/puzzle/step.ts';
import type { State } from '../src/puzzle/state.ts';
import { initial } from '../src/puzzle/state.ts';
import { trialLevel, TRIALS } from '../src/puzzle/trials.ts';
import { parse } from '../src/puzzle/level.ts';
import { mv } from './puzzle-grid.ts';
import { DELTA } from '../src/puzzle/tiles.ts';
import type { Action } from '../src/puzzle/step.ts';

function harness() {
  const sounds: string[] = [];
  const m = manualClock();
  const progress = createProgress(null);
  const game = createGame({
    sfx: n => sounds.push(n), say() {}, progress, pages: createFoundPages(null), levels: CAMPAIGN_LEVELS, timers: m.timers, clock: m.clock, reducedMotion: () => false, changed() {},
  });
  return { game, sounds, progress, advance: m.advance };
}
function line(i: number): Action[] {
  const r = solve(initial(trialLevel(i)));
  assert.ok(r.solved);
  return r.line;
}

test('a press during a slide finishes it and acts exactly once', () => {
  const h = harness();
  h.game.open(0);
  const [a, b] = line(0);
  h.game.press(a!);
  assert.ok(h.game.anim, 'the first move is animating');
  h.game.press(b!);
  assert.equal(h.game.run!.now.moves, 2);
  assert.equal(h.game.run!.past.length, 2);
});

test('the hint plays one step and marks the try assisted; a played-out win records it as assisted', () => {
  const h = harness();
  h.game.open(0);
  h.game.hint();
  assert.equal(h.game.run!.now.moves, 1);
  assert.equal(h.game.run!.assisted, true);
  h.game.auto();
  h.advance(600_000);
  assert.equal(h.game.run!.now.outcome, 'won');
  assert.equal(h.game.playing, false);
  assert.deepEqual(h.progress.get(TRIALS[0]!.id), { cleared: true, assisted: true, best: null });
});

test('an unassisted win records the best; opening the trial again clears the assisted mark', () => {
  const h = harness();
  h.game.open(0);
  for (const a of line(0)) h.game.press(a);
  assert.equal(h.game.run!.now.outcome, 'won');
  assert.equal(h.progress.get(TRIALS[0]!.id).best, h.game.run!.now.moves);
  h.game.open(0);
  h.game.hint();
  assert.equal(h.game.run!.assisted, true);
  h.game.open(0);
  assert.equal(h.game.run!.assisted, false);
});

test('a bump sounds bump and changes nothing; undo and restart go through', () => {
  const h = harness();
  h.game.open(0);
  const start = h.game.run!;
  const walls = (['up', 'down', 'left', 'right'] as const).filter(dir => {
    const p = start.now.player;
    const [dr, dc] = DELTA[dir];
    return start.now.terrain[(p.r + dr) * start.now.level.cols + p.c + dc] === 'wall';
  });
  assert.ok(walls.length > 0, 'trial 1 starts beside a wall');
  h.game.press({ kind: 'move', dir: walls[0]! });
  assert.equal(h.game.run, start);
  assert.deepEqual(h.sounds, ['bump']);
  h.game.press(line(0)[0]!);
  h.game.press('undo');
  assert.equal(h.game.run!.now, start.now);
  h.game.press(line(0)[0]!);
  h.game.press('restart');
  assert.equal(h.game.run!.now.moves, 0);
});

test('V keeps drawing the line through a turn, undo and restart, from the new state', () => {
  const h = harness();
  h.game.open(0);
  h.game.route();
  assert.ok(h.game.thread && h.game.thread.length > 1);
  h.game.press(line(0)[0]!);
  const p = h.game.run!.now.player;
  assert.ok(h.game.thread, 'still drawn after a move');
  assert.deepEqual(h.game.thread![0], p);
  h.game.press('undo');
  assert.deepEqual(h.game.thread![0], h.game.run!.now.player);
  h.game.press(line(0)[0]!);
  h.game.press('restart');
  assert.deepEqual(h.game.thread![0], h.game.run!.now.player);
});

/** A shortest line of the first trial that loses the try, found by breadth-first search. */
function losingLine(): Action[] {
  const dirs = ['up', 'down', 'left', 'right'] as const;
  const moves: Action[] = [{ kind: 'wait' }, ...dirs.map((dir): Action => ({ kind: 'move', dir }))];
  let frontier: { s: State; line: Action[] }[] = [{ s: initial(trialLevel(0)), line: [] }];
  const seen = new Set<string>();
  for (let depth = 0; depth < 40; depth++) {
    const next: typeof frontier = [];
    for (const f of frontier) {
      for (const a of moves) {
        const r = step(f.s, a);
        if (r.state === f.s) continue;
        if (r.state.outcome === 'lost') return [...f.line, a];
        const k = stateKey(r.state);
        if (seen.has(k)) continue;
        seen.add(k);
        next.push({ s: r.state, line: [...f.line, a] });
      }
    }
    frontier = next;
  }
  throw new Error('no losing line');
}

test('V turns off when a turn ends the try', () => {
  const m = manualClock();
  const game = createGame({
    sfx() {}, say() {}, progress: createProgress(null), pages: createFoundPages(null), levels: CAMPAIGN_LEVELS, timers: m.timers, clock: m.clock, reducedMotion: () => false, changed() {},
  });
  game.open(0);
  game.route();
  assert.ok(game.thread);
  for (const act of losingLine()) game.press(act);
  assert.equal(game.run!.now.outcome, 'lost');
  assert.equal(game.thread, null);
  game.press('undo');
  assert.equal(game.thread, null, 'V stays off after it turned off');
});

test('a goes-slack press neither assists nor draws; a finished try ignores Hint, Route and Auto', () => {
  const h = harness();
  h.game.open(0);
  for (const a of line(0)) h.game.press(a);
  assert.equal(h.game.run!.now.outcome, 'won');
  const run = h.game.run;
  h.game.hint();
  h.game.route();
  h.game.auto();
  assert.equal(h.game.run, run);
  assert.equal(h.game.thread, null);
  assert.equal(h.game.playing, false);
  assert.equal(run!.assisted, false);
});

/* A two-page level served through a stub `levels`: a is on the short way to the exit, b is off it. */
const PAGED = parse('title: t\nintro: i\npages: a b\n\n######\n#Pp.E#\n#...p#\n######\n');
const R = mv('right'), D = mv('down'), U = mv('up');
function paged() {
  const m = manualClock();
  const added: string[][] = [];
  const store = createFoundPages(null);
  const game = createGame({
    sfx() {}, say() {}, progress: createProgress(null), timers: m.timers, clock: m.clock, reducedMotion: () => true, changed() {},
    pages: { has: store.has, all: store.all, add: ids => { added.push([...ids]); return store.add(ids); } },
    levels: { count: 1, id: () => 'paged', level: () => PAGED },
  });
  game.open(0);
  return { game, added };
}

test('winning with one page taken records it once and exposes it as found', () => {
  const { game, added } = paged();
  for (const a of [R, R, R]) game.press(a);
  assert.equal(game.run!.now.outcome, 'won');
  assert.deepEqual(added, [['a']]);
  assert.deepEqual(game.found, ['a']);
});

test('a page taken and then undone away records nothing; restart and open clear found', () => {
  const { game, added } = paged();
  game.press(R);
  game.press('undo');
  for (const a of [D, R, R, U, R]) game.press(a);
  assert.equal(game.run!.now.outcome, 'won');
  assert.deepEqual(added, [[]]);
  assert.deepEqual(game.found, []);
  const w = paged();
  for (const a of [R, R, R]) w.game.press(a);
  assert.deepEqual(w.game.found, ['a']);
  w.game.press('restart');
  assert.deepEqual(w.game.found, []);
  for (const a of [R, R, R]) w.game.press(a);
  assert.deepEqual(w.game.found, [], 'already kept, so not new');
  w.game.open(0);
  assert.deepEqual(w.game.found, []);
});

test('a win with the thread used still records the page', () => {
  const { game, added } = paged();
  game.press(R);
  game.hint();
  assert.equal(game.run!.assisted, true);
  game.stop();
  while (game.run!.now.outcome === 'playing') game.press(R);
  assert.equal(game.run!.now.outcome, 'won');
  assert.deepEqual(added.flat(), ['a']);
});

test('a lost try records nothing', () => {
  const m = manualClock();
  const added: string[][] = [];
  const game = createGame({
    sfx() {}, say() {}, progress: createProgress(null), timers: m.timers, clock: m.clock, reducedMotion: () => true, changed() {},
    pages: { has: () => false, all: () => [], add: ids => { added.push([...ids]); return [...ids]; } },
    levels: { count: 1, id: () => 'doomed', level: () => parse('title: t\nintro: i\npages: a\n\n#####\n#PpM#\n#####\n') },
  });
  game.open(0);
  for (let i = 0; i < 30 && game.run!.now.outcome === 'playing'; i++) game.press({ kind: 'wait' });
  assert.equal(game.run!.now.outcome, 'lost');
  assert.deepEqual(added, []);
  assert.deepEqual(game.found, []);
});

/** A game on one level, recording the sounds and the lines said. */
function lone(rows: string[], header = '') {
  const sounds: string[] = [];
  const said: string[] = [];
  const m = manualClock();
  const game = createGame({
    sfx: n => sounds.push(n), say: t => said.push(t), progress: createProgress(null), pages: createFoundPages(null),
    timers: m.timers, clock: m.clock, reducedMotion: () => true, changed() {},
    levels: { count: 1, id: () => 'lone', level: () => parse(`title: t\nintro: i\n${header}\n${rows.join('\n')}\n`) },
  });
  game.open(0);
  return { game, sounds, said };
}
const R_ = mv('right');

test('a win on a scratch level records no progress and finds no pages', () => {
  const added: string[][] = [];
  const progress = createProgress(null);
  const m = manualClock();
  const game = createGame({
    sfx() {}, say() {}, progress, timers: m.timers, clock: m.clock, reducedMotion: () => true, changed() {},
    pages: { has: () => false, all: () => [], add: ids => { added.push([...ids]); return [...ids]; } },
    levels: { count: 1, id: () => 'test-level', scratch: () => true, level: () => parse('title: t\nintro: i\npages: a\n\n#####\n#PpE#\n#####\n') },
  });
  game.open(0);
  game.press(R_);
  game.press(R_);
  assert.equal(game.run!.now.outcome, 'won');
  assert.equal(progress.get('test-level').cleared, false);
  assert.deepEqual(added, []);
  assert.deepEqual(game.found, []);
});

test('a catch names the hazard on a teleport exit and on a ride onto one', () => {
  const exit = lone(['P@..', '..@w'], 'facing: left');
  exit.game.press(R_);
  assert.deepEqual(exit.said, ['The Harpy caught you! 2 hearts left.']);
  const ride = lone(['P=@.', '..@e'], 'facing: up');
  ride.game.press(R_);
  assert.deepEqual(ride.said, ["Talos's fire caught you! 2 hearts left."]);
});

test('every new event has a sound', () => {
  const cases: [name: string, rows: string[], header: string, actions: Action[], sound: string][] = [
    ['held', ['-.P&.'], '', [R_], 'snap'],
    ['revealed', ['PW...M'], '', [R_], 'reveal'],
    ['rose', ['P;.'], '', [R_, R_], 'rise'],
    ['teleported', ['P@..', '..@.'], '', [R_], 'warp'],
    ['robbed', ['Pfkrz$.'], '', [R_, R_, R_, R_, R_], 'thief'],
    ['exploded', ['PO!.'], '', [R_], 'boom'],
    ['cloned', ['P+C.'], 'machines: block-right', [R_], 'clone'],
    ['sent-home', ['Po.'], 'facing: left', [{ kind: 'wait' }], 'home'],
    ['hazard catch', ['P.o...M'], 'facing: left', [R_], 'caught'],
  ];
  for (const [name, rows, header, actions, sound] of cases) {
    const h = lone(rows, header);
    for (const a of actions) h.game.press(a);
    assert.ok(h.sounds.includes(sound), `${name} plays ${sound}: ${h.sounds.join(' ')}`);
  }
});

test('a catch names what caught Theseus', () => {
  const ball = lone(['P.o...M'], 'facing: left');
  ball.game.press(R_);
  assert.deepEqual(ball.said, ['The Bronze ball caught you! 2 hearts left.']);
  const harpy = lone(['P.w...M'], 'facing: left');
  harpy.game.press(R_);
  assert.deepEqual(harpy.said, ['The Harpy caught you! 2 hearts left.']);
  const fire = lone(['P.e...M'], 'facing: left');
  fire.game.press(R_);
  assert.deepEqual(fire.said, ["Talos's fire caught you! 2 hearts left."]);
  const walked = lone(['.Po..M'], 'facing: up');
  walked.game.press(R_);
  assert.deepEqual(walked.said, ['The Bronze ball caught you! 2 hearts left.']);
  const minotaur = lone(['PM'], '');
  minotaur.game.press({ kind: 'wait' });
  assert.deepEqual(minotaur.said, ['Caught! 2 hearts left.']);
});

test('a bomb, a snare, a thief and a revealed wall each get one line; hazard steps get none', () => {
  const bomb = lone(['P!...M'], '');
  bomb.game.press(R_);
  assert.deepEqual(bomb.said, ['A bomb! 2 hearts left.']);
  const snare = lone(['-.P&.'], '');
  snare.game.press(R_);
  assert.deepEqual(snare.said, ["Daedalus's snare holds you."]);
  const thief = lone(['Pf$.'], '');
  thief.game.press(R_);
  thief.game.press(R_);
  assert.deepEqual(thief.said, ['The thief took your gear.']);
  const wall = lone(['PW...M'], '');
  wall.game.press(R_);
  assert.deepEqual(wall.said, ['A hidden wall!']);
  const steps = lone(['P....o'], 'facing: left');
  steps.game.press({ kind: 'wait' });
  assert.deepEqual(steps.said, []);
});
