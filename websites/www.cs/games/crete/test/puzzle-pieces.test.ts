// websites/www.cs/games/crete/test/puzzle-pieces.test.ts
// The trap and trick pieces, one `describe` per piece: what Theseus, a pushed block and the Minotaur do on each.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { step, noTurn } from '../src/puzzle/step.ts';
import { terrainAt } from '../src/puzzle/state.ts';
import type { State } from '../src/puzzle/state.ts';
import { heldAt, released } from '../src/puzzle/pieces.ts';
import { caught } from '../src/puzzle/catch.ts';
import { work } from '../src/puzzle/work.ts';
import type { GameEvent, Work } from '../src/puzzle/work.ts';
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
  test('walking into a fake wall opens it and steps through, on that one move', () => {
    const r = step(grid(['PW...M']), mv('right'));
    assert.equal(terrainAt(r.state, at(0, 1)), 'floor');
    assert.deepEqual(r.state.player, at(0, 1), 'Theseus steps through');
    assert.equal(r.state.moves, 1);
    assert.deepEqual(r.state.minotaur, at(0, 3), 'the Minotaur takes his two steps, as on any move');
    assert.deepEqual(r.events.slice(0, 2), [
      { kind: 'revealed', at: at(0, 1), what: 'fake-wall' },
      { kind: 'moved', who: 'player', from: at(0, 0), to: at(0, 1) },
    ]);
  });

  test('bumping an invisible wall shows it and costs no turn: the move count stays and nothing else moves', () => {
    const s = grid(['P.I..M', '......']);
    const r = step(s, mv('right'));
    const one = r.state;
    const shown = step(one, mv('right'));
    assert.deepEqual(shown.events, [{ kind: 'revealed', at: at(0, 2), what: 'invisible-wall' }]);
    assert.equal(terrainAt(shown.state, at(0, 2)), 'wall');
    assert.deepEqual(shown.state.player, one.player);
    assert.deepEqual(shown.state.minotaur, one.minotaur, 'the Minotaur does not move');
    assert.equal(shown.state.moves, one.moves, 'no move is counted');
    assert.ok(noTurn(one, shown.state), 'the searches skip it');
    assert.deepEqual(shown.state.terrain.map((t, i) => (i === 2 ? 'invisible-wall' : t)), one.terrain, 'only that cell changed');
    assert.equal(step(shown.state, mv('right')).state, shown.state, 'once shown it is a plain bump');
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

describe("Daedalus's snare", () => {
  /** The state after `f` has edited a copy of it. */
  const put = (s: State, f: (w: Work) => void): State => {
    const w = work(s);
    f(w);
    return w as unknown as State;
  };
  const BUTTON = 0;
  const onButton = (w: Work) => { w.objects[BUTTON] = 'block'; };

  test('Theseus in a snare cannot move until a block stands on its button', () => {
    const held = step(grid(['-.P&.']), mv('right')).state;
    assert.deepEqual(held.player, at(0, 3));
    assert.equal(step(held, mv('right')).state, held);
    assert.equal(step(held, mv('left')).state, held);
    const freed = step(put(held, onButton), mv('right')).state;
    assert.deepEqual(freed.player, at(0, 4));
  });

  test('waiting while held is a turn', () => {
    const held = step(grid(['-.P&.']), mv('right')).state;
    const r = step(held, WAIT);
    assert.notEqual(r.state, held);
    assert.equal(r.state.moves, held.moves + 1);
    assert.deepEqual(r.state.player, at(0, 3));
  });

  test('a move while held is a bump', () => {
    const held = step(grid(['-.P&.#']), mv('right')).state;
    const r = step(held, mv('right'));
    assert.equal(r.state, held);
    assert.deepEqual(r.events, []);
  });

  test('the Minotaur in a snare is pinned', () => {
    const s = put(grid(['-..&..P']), w => { w.minotaur = at(0, 3); });
    assert.deepEqual(step(s, WAIT).state.minotaur, at(0, 3));
    assert.deepEqual(step(put(s, onButton), WAIT).state.minotaur, at(0, 5));
  });

  test('a block in a held snare cannot be pushed', () => {
    const s2 = grid(['-.PO&.']);
    assert.deepEqual(step(s2, mv('right')).state.player, at(0, 3), 'a block outside is pushed into it');
    const inTrap = put(grid(['-.P&.']), w => { w.objects[3] = 'block'; });
    assert.equal(step(inTrap, mv('right')).state, inTrap);
    assert.deepEqual(step(put(inTrap, onButton), mv('right')).state.player, at(0, 3));
  });

  test('anything walks through a snare whose button is held', () => {
    const s = put(grid(['-.P&.']), onButton);
    const r = play(s, mv('right'), mv('right'));
    assert.deepEqual(r.state.player, at(0, 4));
    assert.ok(!r.kinds.includes('held'));
  });

  test('stepping off the button holds the snare again', () => {
    const s = grid(['.P-.&']);
    const w = work(s);
    assert.equal(released(w, 4), false);
    const on = work(step(s, mv('right')).state);
    assert.equal(released(on, 4), true);
    assert.equal(heldAt(on, at(0, 4)), false);
    const off = work(step(step(s, mv('right')).state, mv('right')).state);
    assert.equal(heldAt(off, at(0, 4)), true);
    assert.equal(heldAt(off, at(0, 1)), false, 'only a snare is ever held');
    const hazardOn = work(s);
    hazardOn.hazards.push({ kind: 'ball', at: at(0, 2), dir: 'left', home: 0 });
    assert.equal(released(hazardOn, 4), true, 'a hazard on the button releases it');
  });

  test('a catch throws Theseus out of a snare', () => {
    const s = put(grid(['-.P&.']), w => { w.player = at(0, 3); w.throwBack = at(0, 1); w.hearts = 3; });
    const w = work(s);
    assert.equal(heldAt(w, w.player), true);
    caught(w, [], 'minotaur');
    assert.deepEqual(w.player, at(0, 1));
  });

  test('the Minotaur standing on a brown button does not release it', () => {
    const s = put(grid(['-.P&.']), w => { w.player = at(0, 3); w.minotaur = at(0, 0); });
    assert.equal(released(work(s), 3), false);
    assert.equal(step(s, mv('right')).state, s);
  });

  test('a snare emits held when it closes on someone', () => {
    const held = (e: GameEvent[]) => e.filter(x => x.kind === 'held');
    assert.deepEqual(held(step(grid(['-.P&.']), mv('right')).events), [{ kind: 'held', who: 'player', at: at(0, 3) }]);
    assert.deepEqual(held(step(grid(['-.PO&']), mv('right')).events), [{ kind: 'held', who: 'block', at: at(0, 4) }]);
    assert.deepEqual(held(step(grid(['-M&..P']), WAIT).events), [{ kind: 'held', who: 'minotaur', at: at(0, 2) }]);
  });
});

describe('clone machine', () => {
  const cloned = (e: readonly GameEvent[]) => e.filter(x => x.kind === 'cloned');

  test('a red button clones a block out of its machine', () => {
    const r = step(grid(['P+C.'], 'machines: block-right'), mv('right'));
    assert.deepEqual(cloned(r.events), [{ kind: 'cloned', what: 'block', at: at(0, 3) }]);
    assert.equal(r.state.objects[3], 'block');
    assert.equal(terrainAt(r.state, at(0, 2)), 'clone', 'the machine stays: it is a template');
  });

  test('a clone into a blocked cell is not made', () => {
    for (const [rows, head] of [
      [['P+CO'], 'machines: block-right'],
      [['P+C#'], 'machines: ball-right'],
      [['P+Co'], 'machines: block-right\nfacing: left'],
      [['P+CM'], 'machines: glider-right'],
    ] as [string[], string][]) {
      const r = step(grid(rows, head), mv('right'));
      assert.deepEqual(cloned(r.events), [], rows.join('/'));
    }
    const twice = play(grid(['P+C.'], 'machines: block-right'), mv('right'), mv('left'), mv('right'));
    assert.equal(cloned(twice.events).length, 1, 'the first clone fills the cell in front');
  });

  test('a cloned hazard never appears on Theseus', () => {
    const on = step(grid(['P+C'], 'machines: ball-left'), mv('right'));
    assert.deepEqual(cloned(on.events), []);
    assert.deepEqual(on.state.hazards, []);
    const off = step(grid(['P+C', '...'], 'machines: ball-down'), mv('right'));
    assert.deepEqual(off.state.hazards, [{ kind: 'ball', at: at(1, 2), dir: 'down', home: 0 }]);
  });

  test('nothing is cloned onto the cell Theseus is stepping into', () => {
    for (const tpl of ['block', 'ball']) {
      const r = step(grid(['.PO+', '..C.'], `machines: ${tpl}-up`), mv('right'));
      assert.deepEqual(r.state.player, at(0, 2));
      assert.deepEqual(cloned(r.events), [], tpl);
      assert.equal(r.state.objects[2], null);
      assert.deepEqual(r.state.hazards, []);
    }
  });

  test('the Minotaur never presses the red button', () => {
    const r = step(grid(['P..+.M', '.....C', '......'], 'machines: block-down'), WAIT);
    assert.deepEqual(r.state.minotaur, at(0, 3));
    assert.deepEqual(cloned(r.events), []);
  });

  test('a machine cell is wall to everyone', () => {
    const m = 'machines: block-right';
    const s = grid(['PC.'], m);
    assert.equal(step(s, mv('right')).state, s, 'Theseus');
    const b = grid(['POC.'], m);
    assert.equal(step(b, mv('right')).state, b, 'a pushed block');
    assert.deepEqual(step(grid(['P.CM'], m), WAIT).state.minotaur, at(0, 3), 'the Minotaur');
    const h = step(grid(['P..', 'oC.'], `${m}\nfacing: right`), WAIT);
    assert.deepEqual(h.state.hazards.map(x => x.at), [at(1, 0)], 'a hazard');
  });

  test('two firings in one turn make two clones in order', () => {
    const s = grid(['P+C###', '#....#', '#.o+C#'], 'facing: right\nmachines: ball-down glider-up');
    const r1 = step(s, mv('right'));
    assert.deepEqual(cloned(r1.events), [
      { kind: 'cloned', what: 'ball', at: at(1, 2) },
      { kind: 'cloned', what: 'glider', at: at(1, 4) },
    ]);
    assert.deepEqual(r1.state.hazards, [
      { kind: 'ball', at: at(1, 2), dir: 'down', home: 1 },
      { kind: 'glider', at: at(1, 4), dir: 'up', home: 2 },
      { kind: 'ball', at: at(2, 3), dir: 'right', home: 0 },
    ], 'the hazard clone made in the phase has not moved; the list is sorted by cell');
    const r2 = step(r1.state, WAIT);
    assert.deepEqual(r2.state.hazards.map(x => x.at), [at(1, 3), at(2, 2), at(2, 3)], 'next turn both clones move');
  });

  test('a cloned block on ice slides', () => {
    const r = step(grid(['P+C==.'], 'machines: block-right'), mv('right'));
    assert.equal(r.state.objects[5], 'block');
    assert.deepEqual(r.events.filter(e => e.kind === 'cloned' || e.kind === 'slid').map(e => e.kind), ['cloned', 'slid', 'slid']);
  });

  test('a clone that presses a red button fires again, and the chain ends', () => {
    const r = step(grid(['P+C=+.'], 'machines: block-right'), mv('right'));
    assert.deepEqual(cloned(r.events).map(e => e.kind === 'cloned' && e.at), [at(0, 3), at(0, 3)]);
    assert.deepEqual(r.state.objects.slice(3, 5), ['block', 'block']);
  });

  test('a cloned hazard meets a bomb and presses buttons on its cell', () => {
    const bomb = step(grid(['P+C!'], 'machines: ball-right'), mv('right'));
    assert.deepEqual(bomb.state.hazards, []);
    assert.equal(terrainAt(bomb.state, at(0, 3)), 'floor');
    assert.deepEqual(bomb.events.filter(e => e.kind === 'exploded'), [{ kind: 'exploded', who: 'hazard', at: at(0, 3) }]);
    const toggle = step(grid(['P+C_t'], 'machines: ball-right'), mv('right'));
    assert.equal(terrainAt(toggle.state, at(0, 4)), 'toggle-closed');
  });

  test('a block clone onto water sinks', () => {
    const r = step(grid(['P+C~'], 'machines: block-right'), mv('right'));
    assert.deepEqual(r.events.filter(e => e.kind === 'sank'), [{ kind: 'sank', at: at(0, 3) }]);
    assert.equal(terrainAt(r.state, at(0, 3)), 'dirt');
    assert.equal(r.state.objects[3], null);
  });

  test('a hazard clone onto a snare is held', () => {
    const r = step(grid(['P+C&'], 'machines: ball-right'), mv('right'));
    assert.deepEqual(r.events.filter(e => e.kind === 'held'), [{ kind: 'held', who: 'hazard', at: at(0, 3) }]);
    assert.deepEqual(r.state.hazards.map(h => h.at), [at(0, 3)]);
  });

  test("a red button on the machine's own front cell makes exactly one clone", () => {
    for (const tpl of ['block', 'ball']) {
      const r = step(grid(['P++', '..C'], `machines: ${tpl}-up`), mv('right'));
      assert.deepEqual(cloned(r.events), [{ kind: 'cloned', what: tpl, at: at(0, 2) }], tpl);
    }
  });

  test("a hazard clone made in Theseus's action moves in that turn's hazard phase", () => {
    const s = grid(['P+C..'], 'machines: ball-right');
    const r = step(s, mv('right'));
    assert.deepEqual(r.state.hazards, [{ kind: 'ball', at: at(0, 4), dir: 'right', home: 0 }]);
    assert.ok(r.events.some(e => e.kind === 'moved' && e.who === 'hazard'));
    assert.deepEqual(Object.keys(r.state).sort(), Object.keys(s).sort(), 'the turn adds no key to the state');
  });
});
