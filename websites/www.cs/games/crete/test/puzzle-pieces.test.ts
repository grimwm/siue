// websites/www.cs/games/crete/test/puzzle-pieces.test.ts
// The trap and trick pieces, one `describe` per piece: what Theseus, a pushed block and the Minotaur do on each.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { step } from '../src/puzzle/step.ts';
import { terrainAt } from '../src/puzzle/state.ts';
import { caught } from '../src/puzzle/catch.ts';
import { work } from '../src/puzzle/work.ts';
import type { GameEvent } from '../src/puzzle/work.ts';
import { TERRAIN } from '../src/puzzle/tiles.ts';
import { grid, mv, play, WAIT } from './puzzle-grid.ts';

const at = (r: number, c: number) => ({ r, c });

describe('pop-up wall', () => {
  test('a pop-up wall rises behind Theseus', () => {
    const r = play(grid(['P;.']), mv('right'), mv('right'));
    assert.deepEqual(r.state.player, at(0, 2));
    assert.equal(terrainAt(r.state, at(0, 1)), 'wall');
    assert.deepEqual(r.events.filter(e => e.kind === 'rose'), [{ kind: 'rose', at: at(0, 1) }]);
    assert.equal(step(r.state, mv('left')).state, r.state, 'the risen wall is a bump');
  });

  test('a pop-up rises when Theseus is thrown off it', () => {
    const s = play(grid(['P;.']), mv('right')).state;
    const w = work(s);
    const ev: GameEvent[] = [];
    caught(w, ev, 'hazard');
    assert.deepEqual(w.player, at(0, 0));
    assert.equal(w.terrain[1], 'wall');
    assert.deepEqual(ev.map(e => e.kind), ['caught', 'rose']);
  });

  test('a pop-up rises when Theseus teleports off it', () => {
    const r = play(grid(['P;@.', '.@..']), mv('right'), mv('right'));
    assert.deepEqual(r.state.player, at(1, 2));
    assert.equal(terrainAt(r.state, at(0, 1)), 'wall');
  });

  test('blocks, the Minotaur and hazards never enter a pop-up', () => {
    const s = grid(['PO;.']);
    assert.equal(step(s, mv('right')).state, s, 'a block is never pushed onto it');
    assert.deepEqual(play(grid(['P.;M']), WAIT).state.minotaur, at(0, 3));
    assert.equal(TERRAIN.popup.hazard, false);
  });
});

describe('gravel', () => {
  test('gravel lets Theseus through and stops a pushed block and the Minotaur', () => {
    assert.deepEqual(play(grid(['P:.']), mv('right'), mv('right')).state.player, at(0, 2));
    const s = grid(['PO:.']);
    assert.equal(step(s, mv('right')).state, s);
    assert.deepEqual(play(grid(['P.:M']), WAIT).state.minotaur, at(0, 3));
  });
});

describe('fake and invisible walls', () => {
  test('bumping a fake wall opens it and costs a move', () => {
    const r = step(grid(['PW...M']), mv('right'));
    assert.equal(terrainAt(r.state, at(0, 1)), 'floor');
    assert.deepEqual(r.state.player, at(0, 0), 'Theseus stays');
    assert.equal(r.state.moves, 1);
    assert.deepEqual(r.state.minotaur, at(0, 3), 'the Minotaur takes his two steps');
    assert.deepEqual(r.events[0], { kind: 'revealed', at: at(0, 1), what: 'fake-wall' });
    assert.deepEqual(step(r.state, mv('right')).events[0], { kind: 'moved', who: 'player', from: at(0, 0), to: at(0, 1) },
      'then it is floor');
  });

  test('bumping an invisible wall shows it and costs a move', () => {
    const r = step(grid(['PI...M']), mv('right'));
    assert.equal(terrainAt(r.state, at(0, 1)), 'wall');
    assert.deepEqual(r.state.player, at(0, 0));
    assert.equal(r.state.moves, 1);
    assert.deepEqual(r.state.minotaur, at(0, 3));
    assert.deepEqual(r.events[0], { kind: 'revealed', at: at(0, 1), what: 'invisible-wall' });
    const again = step(r.state, mv('right'));
    assert.equal(again.state, r.state, 'once shown it is a plain bump');
  });

  test('a slide, a pushed block and a teleport exit treat both as wall and reveal nothing', () => {
    for (const ch of ['W', 'I']) {
      const what = ch === 'W' ? 'fake-wall' : 'invisible-wall';
      const slide = play(grid([`P=${ch}`]), mv('right'));
      assert.deepEqual(slide.state.player, at(0, 1));
      assert.equal(terrainAt(slide.state, at(0, 2)), what);
      assert.ok(!slide.kinds.includes('revealed'));
      const push = grid([`PO${ch}`]);
      assert.equal(step(push, mv('right')).state, push);
      const tele = play(grid([`P@.@${ch}`]), mv('right'));
      assert.deepEqual(tele.state.player, at(0, 1), 'every exit blocked');
      assert.equal(terrainAt(tele.state, at(0, 4)), what);
      assert.ok(!tele.kinds.includes('revealed'));
    }
  });
});

describe('thief', () => {
  test('a thief takes all gear and leaves keys and tools', () => {
    const r = play(grid(['Pfkrz$.']), mv('right'), mv('right'), mv('right'), mv('right'), mv('right'));
    assert.deepEqual(r.state.gear, []);
    assert.equal(r.state.keys.red, 1);
    assert.equal(r.state.tools.mirror, 1);
    assert.deepEqual(r.events.filter(e => e.kind === 'robbed'), [{ kind: 'robbed', at: at(0, 5), gear: ['flippers', 'skates'] }]);
    assert.ok(!play(r.state, mv('right'), mv('left')).kinds.includes('robbed'), 'with nothing to take, nothing is robbed');
  });
});

describe('bomb', () => {
  test('a bomb under Theseus costs a heart, throws him back and is gone', () => {
    const r = step(grid(['P!..M']), mv('right'));
    assert.deepEqual(r.state.player, at(0, 0));
    assert.equal(r.state.hearts, 2);
    assert.equal(terrainAt(r.state, at(0, 1)), 'floor');
    assert.deepEqual(r.state.minotaur, at(0, 4), 'the turn stops at the catch');
    assert.deepEqual(r.events.map(e => e.kind), ['moved', 'exploded', 'caught']);
    const c = r.events.find(e => e.kind === 'caught');
    assert.equal(c && c.kind === 'caught' && c.by, 'bomb');
    assert.deepEqual(r.events[1], { kind: 'exploded', who: 'player', at: at(0, 1) });
  });

  test('a bomb with one heart left loses the try', () => {
    const r = step(grid(['P!.'], 'hearts: 1'), mv('right'));
    assert.equal(r.state.outcome, 'lost');
    assert.equal(r.state.hearts, 0);
  });

  test('a block pushed onto a bomb is destroyed with it', () => {
    const r = play(grid(['PO!.']), mv('right'));
    assert.deepEqual(r.state.player, at(0, 1));
    assert.equal(r.state.objects[2], null);
    assert.equal(terrainAt(r.state, at(0, 2)), 'floor');
    assert.deepEqual(r.events.find(e => e.kind === 'exploded'), { kind: 'exploded', who: 'block', at: at(0, 2) });
  });

  test('a bomb at the end of a teleport or a slide catches too', () => {
    assert.equal(play(grid(['P@.', '@!.']), mv('right')).state.hearts, 2);
    const slid = play(grid(['P=!']), mv('right'));
    assert.equal(slid.state.hearts, 2);
    assert.deepEqual(slid.state.player, at(0, 0));
  });
});

describe('teleport', () => {
  test('Theseus teleports to the next teleport in reading order and steps on', () => {
    const r = step(grid(['P@..', '..@.']), mv('right'));
    assert.deepEqual(r.state.player, at(1, 3));
    assert.deepEqual(r.events.slice(0, 2), [
      { kind: 'moved', who: 'player', from: at(0, 0), to: at(0, 1) },
      { kind: 'teleported', who: 'player', from: at(0, 1), via: at(1, 2), to: at(1, 3) },
    ]);
  });

  test('a blocked exit is skipped, wrapping', () => {
    const r = step(grid(['.@.', 'P@.', '.@#']), mv('right'));
    assert.deepEqual(r.state.player, at(0, 2));
  });

  test('every exit blocked: Theseus stays on the teleport he entered', () => {
    const r = step(grid(['P@#', '.@#']), mv('right'));
    assert.deepEqual(r.state.player, at(0, 1));
    assert.equal(r.state.moves, 1);
    assert.deepEqual(r.events.map(e => e.kind), ['moved']);
    assert.deepEqual(step(r.state, mv('down')).state.player, at(1, 1), 'he walks on from it');
  });

  test('a lone teleport is wall', () => {
    const s = grid(['P@.']);
    assert.equal(step(s, mv('right')).state, s);
  });

  test('arriving out of a teleport takes items and rides ice', () => {
    assert.equal(play(grid(['P@.', '@r.']), mv('right')).state.keys.red, 1);
    assert.deepEqual(play(grid(['P@..', '@==.']), mv('right')).state.player, at(1, 3));
  });

  test('a step out of a teleport pushes a block only when Theseus stepped in', () => {
    const r = play(grid(['P@..', '@O..']), mv('right'));
    assert.deepEqual(r.state.player, at(1, 1));
    assert.equal(r.state.objects[4 + 2], 'block');
    const ride = play(grid(['P=@.', '@O..']), mv('right'));
    assert.deepEqual(ride.state.player, at(0, 2), 'riding, the block is a blocked exit');
    assert.equal(ride.state.objects[4 + 1], 'block');
  });

  test('a block teleports the same way; with every exit blocked the push is refused', () => {
    const r = play(grid(['PO@.', '.@..']), mv('right'));
    assert.deepEqual(r.state.player, at(0, 1));
    assert.equal(r.state.objects[4 + 2], 'block');
    assert.deepEqual(r.events.find(e => e.kind === 'teleported'),
      { kind: 'teleported', who: 'block', from: at(0, 2), via: at(1, 1), to: at(1, 2) });
    const s = grid(['PO@.', '.@#.']);
    assert.equal(step(s, mv('right')).state, s);
    const lone = grid(['PO@.']);
    assert.equal(step(lone, mv('right')).state, lone);
  });

  test('a block out of a teleport settles: it sinks in water and slides on ice', () => {
    const sink = play(grid(['PO@.', '.@~.']), mv('right'));
    assert.equal(terrainAt(sink.state, at(1, 2)), 'dirt');
    const slide = play(grid(['PO@..', '.@==.']), mv('right'));
    assert.equal(slide.state.objects[5 + 4], 'block');
  });

  test('the Minotaur treats a teleport as wall', () => {
    assert.deepEqual(play(grid(['P.@M', '..@.']), WAIT).state.minotaur, at(0, 3));
  });
});
