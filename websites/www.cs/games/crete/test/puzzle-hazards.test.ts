// The moving hazards: the bronze ball, the harpy and Talos's fire. How each turns, what it crosses, slides and
// carries, what it meets on arrival, the order of the phase, and how it shares the board with everyone else.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { step } from '../src/puzzle/step.ts';
import { terrainAt } from '../src/puzzle/state.ts';
import type { State } from '../src/puzzle/state.ts';
import type { Hazard } from '../src/puzzle/tiles.ts';
import { grid, mv, play, WAIT } from './puzzle-grid.ts';

const at = (r: number, c: number) => ({ r, c });
/** Where each hazard stands and faces after the actions. */
const where = (s: State) => s.hazards.map(h => ({ at: h.at, dir: h.dir }));
const after = (rows: string[], facing: string) => where(step(grid(rows, `facing: ${facing}`), WAIT).state);

describe('turning', () => {
  test('a bronze ball goes straight and turns back when blocked', () => {
    const s = grid(['P.o.#'], 'facing: right');
    const one = step(s, WAIT);
    assert.deepEqual(where(one.state), [{ at: at(0, 3), dir: 'right' }]);
    assert.deepEqual(one.events, [{ kind: 'moved', who: 'hazard', hazard: 'ball', from: at(0, 2), to: at(0, 3) }]);
    assert.deepEqual(where(step(one.state, WAIT).state), [{ at: at(0, 2), dir: 'left' }]);
    assert.deepEqual(after(['P#.', '.o#', '...'], 'right'), [{ at: at(1, 0), dir: 'left' }], 'a ball never turns aside');
  });

  test('a harpy turns left, then right, then back', () => {
    assert.deepEqual(after(['P....', '.w#..', '.....'], 'right'), [{ at: at(0, 1), dir: 'up' }]);
    assert.deepEqual(after(['P#...', '.w#..', '.....'], 'right'), [{ at: at(2, 1), dir: 'down' }]);
    assert.deepEqual(after(['P#...', '.w#..', '.#...'], 'right'), [{ at: at(1, 0), dir: 'left' }]);
  });

  test("Talos's fire turns right, then left, then back", () => {
    assert.deepEqual(after(['P....', '.e#..', '.....'], 'right'), [{ at: at(2, 1), dir: 'down' }]);
    assert.deepEqual(after(['P....', '.e#..', '.#...'], 'right'), [{ at: at(0, 1), dir: 'up' }]);
    assert.deepEqual(after(['P#...', '.e#..', '.#...'], 'right'), [{ at: at(1, 0), dir: 'left' }]);
  });

  test('a hazard boxed in on every side stays', () => {
    for (const kind of ['o', 'w', 'e']) {
      const s = grid(['P#.', `#${kind}#`, '.#.'], 'facing: up');
      const r = step(s, WAIT);
      assert.equal(r.state.hazards, s.hazards, `${kind} stays and keeps its facing`);
      assert.deepEqual(r.events, []);
    }
  });
});

test("a harpy crosses water and Talos's fire crosses fire; neither crosses the other's", () => {
  assert.deepEqual(after(['P.w~.'], 'right'), [{ at: at(0, 3), dir: 'right' }]);
  assert.deepEqual(after(['P.eF.'], 'right'), [{ at: at(0, 3), dir: 'right' }]);
  assert.deepEqual(after(['P.wF.'], 'right'), [{ at: at(0, 1), dir: 'left' }]);
  assert.deepEqual(after(['P.e~.'], 'right'), [{ at: at(0, 1), dir: 'left' }]);
  assert.deepEqual(after(['P.o~.'], 'right'), [{ at: at(0, 1), dir: 'left' }], 'the ball crosses neither');
});

describe('ice and force floors', () => {
  test('a hazard slides on ice and is carried by a force floor, facing the way it was carried', () => {
    const ice = step(grid(['P.o==.'], 'facing: right'), WAIT);
    assert.deepEqual(where(ice.state), [{ at: at(0, 5), dir: 'right' }]);
    assert.deepEqual(ice.events.map(e => e.kind), ['moved', 'slid', 'slid']);
    assert.deepEqual(ice.events[1], { kind: 'slid', who: 'hazard', hazard: 'ball', from: at(0, 3), to: at(0, 4) });
    assert.deepEqual(after(['P.ov.', '.....'], 'right'), [{ at: at(1, 3), dir: 'down' }]);
    assert.deepEqual(after(['P.ov.', '...#.'], 'right'), [{ at: at(0, 3), dir: 'down' }], 'carried nowhere, it still faces the carry');
  });

  test('a stopped slide does not turn', () => {
    const r = step(grid(['P.o=#'], 'facing: right'), WAIT);
    assert.deepEqual(where(r.state), [{ at: at(0, 3), dir: 'right' }]);
    assert.deepEqual(r.events.map(e => e.kind), ['moved']);
  });
});

describe('arrival', () => {
  test('a hazard moving onto Theseus is a catch and the Minotaur does not move that turn', () => {
    const r = step(grid(['P.o...M'], 'facing: left'), mv('right'));
    assert.deepEqual(r.state.player, at(0, 0), 'thrown back');
    assert.equal(r.state.hearts, 2);
    assert.deepEqual(r.state.minotaur, at(0, 6));
    assert.deepEqual(where(r.state), [{ at: at(0, 1), dir: 'left' }]);
    const c = r.events.find(e => e.kind === 'caught');
    assert.deepEqual(c, { kind: 'caught', at: at(0, 1), hearts: 2, by: 'hazard' });
  });

  test('a hazard catches Theseus standing on his own cow, and the cow is lost', () => {
    const base = grid(['Po.'], 'facing: left');
    const r = step({ ...base, tools: { ...base.tools, cow: 1 } }, { kind: 'tool', tool: 'cow' });
    assert.equal(r.state.hearts, 2);
    assert.equal(r.state.cow, null);
    assert.ok(r.events.some(e => e.kind === 'caught' && e.by === 'hazard'));
  });

  test('a hazard catching Theseus on his throw-back cell is sent home when he lands there', () => {
    const r = step(grid(['Po.'], 'facing: left'), WAIT);
    assert.deepEqual(r.events.map(e => e.kind), ['moved', 'caught', 'sent-home']);
    assert.equal(r.state.hearts, 2);
    assert.deepEqual(r.state.player, at(0, 0));
    assert.deepEqual(r.state.hazards.map(h => h.at), [at(0, 1)]);
  });

  test('a catch partway through a slide ends it there', () => {
    const s = { ...grid(['P.o==..M'], 'facing: right'), player: at(0, 4) };
    const hit = step(s, WAIT);
    assert.deepEqual(where(hit.state), [{ at: at(0, 4), dir: 'right' }]);
    assert.deepEqual(hit.state.player, at(0, 0));
    assert.equal(hit.state.hearts, 2);
    assert.deepEqual(hit.state.minotaur, at(0, 7));
  });

  test('Theseus moving into a hazard is a catch and he does not move', () => {
    const s = { ...grid(['P.o..M'], 'facing: up'), player: at(0, 1) };
    const r = step(s, mv('right'));
    assert.deepEqual(r.state.player, at(0, 0), 'thrown back from where he stood');
    assert.equal(r.state.hearts, 2);
    assert.equal(r.state.moves, 1);
    assert.deepEqual(r.state.minotaur, at(0, 5), 'the turn ended at the catch');
    assert.deepEqual(r.events.map(e => e.kind), ['caught']);
    assert.deepEqual(where(r.state), [{ at: at(0, 2), dir: 'up' }]);
  });

  test('a hazard beyond a teleport exit catches Theseus on the teleport he entered', () => {
    const r = step(grid(['P@.', '.@o'], 'facing: down'), mv('right'));
    assert.deepEqual(r.state.player, at(0, 0));
    assert.equal(r.state.hearts, 2);
    assert.deepEqual(r.events.find(e => e.kind === 'caught'), { kind: 'caught', at: at(0, 1), hearts: 2, by: 'hazard' });
    assert.ok(!r.events.some(e => e.kind === 'teleported'));
  });

  test('Theseus cannot reach a hazard on water without flippers: a bump', () => {
    const s = grid(['P~.'], '');
    const withHarpy = { ...s, hazards: [{ kind: 'glider', at: at(0, 1), dir: 'up', home: 0 } as Hazard] };
    assert.equal(step(withHarpy, mv('right')).state, withHarpy);
  });

  test('a hazard on a bomb is destroyed with it', () => {
    const r = step(grid(['P.o!.'], 'facing: right'), WAIT);
    assert.deepEqual(r.state.hazards, []);
    assert.equal(terrainAt(r.state, at(0, 3)), 'floor');
    assert.deepEqual(r.events.at(-1), { kind: 'exploded', who: 'hazard', at: at(0, 3) });
  });

  test('hazards press the toggle button', () => {
    const r = step(grid(['P.o_tT'], 'facing: right'), WAIT);
    assert.ok(r.events.some(e => e.kind === 'flipped'));
    assert.equal(terrainAt(r.state, at(0, 4)), 'toggle-closed');
    assert.equal(terrainAt(r.state, at(0, 5)), 'toggle-open');
  });

  test('a snare holds a hazard', () => {
    const r = play(grid(['P.o&.'], 'facing: right'), WAIT, WAIT);
    assert.deepEqual(where(r.state), [{ at: at(0, 3), dir: 'right' }]);
    assert.ok(r.events.some(e => e.kind === 'held' && e.who === 'hazard'));
  });

  test("a hazard moving onto a brown button releases Theseus's snare", () => {
    const s = { ...grid(['P&...', '.o-..'], 'facing: right'), player: at(0, 1) };
    assert.equal(step(s, mv('right')).state, s, 'held');
    const r = play(s, WAIT, mv('right'));
    assert.deepEqual(r.state.player, at(0, 2));
  });
});

describe('the order of the phase', () => {
  test('hazards move in reading order of where they stood when the phase began', () => {
    assert.deepEqual(after(['.o.o.', 'P....'], 'right left'),
      [{ at: at(0, 2), dir: 'right' }, { at: at(0, 4), dir: 'right' }], 'the earlier one takes the cell they race for');
    assert.deepEqual(after(['oo..', '....', 'P...'], 'down left'),
      [{ at: at(0, 0), dir: 'left' }, { at: at(1, 0), dir: 'down' }], 'a later hazard enters a cell an earlier one just left');
  });

  test('a moved hazard does not move again in the same phase', () => {
    const r = step(grid(['o.o.', '....', 'P...'], 'facing: right right'), WAIT);
    assert.deepEqual(where(r.state), [{ at: at(0, 1), dir: 'right' }, { at: at(0, 3), dir: 'right' }]);
    assert.equal(r.events.length, 2);
  });
});

describe('the Minotaur', () => {
  test('the Minotaur and a hazard never share a cell', () => {
    assert.deepEqual(play(grid(['P.oM'], 'facing: up'), WAIT).state.minotaur, at(0, 3), 'he never enters a hazard');
    const r = step(grid(['P..oM'], 'facing: right'), WAIT);
    assert.deepEqual(where(r.state), [{ at: at(0, 2), dir: 'left' }], 'a hazard never enters him');
    assert.deepEqual(r.state.minotaur, at(0, 3));
    const stone = { ...grid(['P..oM'], 'facing: right'), stone: 3 };
    const rs = step(stone, WAIT);
    assert.deepEqual(where(rs.state), [{ at: at(0, 2), dir: 'left' }], 'nor him as stone');
    assert.deepEqual(rs.state.minotaur, at(0, 4));
  });

  test('hazards keep moving while the Minotaur is stone', () => {
    const base = grid(['P...o.M'], 'facing: left');
    const s = { ...base, tools: { ...base.tools, mirror: 1 } };
    const raised = step(s, { kind: 'tool', tool: 'mirror' });
    assert.deepEqual(where(raised.state), [{ at: at(0, 3), dir: 'left' }], 'on the turn the mirror is raised');
    assert.deepEqual(raised.state.minotaur, at(0, 6));
    const then = step(raised.state, WAIT);
    assert.deepEqual(where(then.state), [{ at: at(0, 2), dir: 'left' }]);
    assert.deepEqual(then.state.minotaur, at(0, 6));
  });
});

describe('sharing the board', () => {
  test('hazards do not enter blocks, objects, the cow or each other', () => {
    assert.deepEqual(after(['P.oO.'], 'right'), [{ at: at(0, 1), dir: 'left' }], 'a block');
    assert.deepEqual(after(['P.or.'], 'right'), [{ at: at(0, 1), dir: 'left' }], 'an object');
    const cow = { ...grid(['P.o..'], 'facing: right'), cow: at(0, 3) };
    assert.deepEqual(where(step(cow, WAIT).state), [{ at: at(0, 1), dir: 'left' }], 'the cow');
    assert.deepEqual(after(['P.oo'], 'right up'), [{ at: at(0, 1), dir: 'left' }, { at: at(0, 3), dir: 'up' }], 'each other');
  });

  test('a turn that moves no hazard shares the hazards array', () => {
    const s = grid(['P#o'], 'facing: left');
    assert.equal(step(s, WAIT).state.hazards, s.hazards);
  });
});

describe('sent home', () => {
  /** The level's first hazard moved onto (0,0), where a catch throws Theseus. */
  const thrown = (rows: string[], header: string, objects: Record<number, 'block'> = {}) => {
    const base = grid(rows, header);
    return {
      ...base, throwBack: at(0, 0),
      hazards: [{ ...base.hazards[0]!, at: at(0, 0) }],
      objects: base.objects.map((o, i) => objects[i] ?? o),
    };
  };

  test('a catch that throws Theseus onto a hazard sends it home', () => {
    const r = play(thrown(['.P.M..o'], 'facing: up'), WAIT);
    assert.deepEqual(r.state.player, at(0, 0));
    assert.deepEqual(r.state.hazards.map(h => h.at), [at(0, 6)]);
    assert.ok(r.events.some(e => e.kind === 'sent-home' && e.from.c === 0 && e.to?.c === 6));
  });

  test('a hazard whose start is taken goes to the nearest free cell', () => {
    const r = play(thrown(['.P.M.o.', '#......'], 'facing: up', { 5: 'block' }), WAIT);
    assert.deepEqual(r.state.hazards.map(h => h.at), [at(0, 4)], 'ties go in reading order');
    assert.ok(r.events.some(e => e.kind === 'sent-home' && e.to?.c === 4));
    const walled = thrown(['.P.M#o#', '#######'], 'facing: up', { 5: 'block' });
    assert.deepEqual(play(walled, WAIT).state.hazards.map(h => h.at), [at(0, 3)], 'through walls to the nearest free cell');
  });

  test('a hazard with no cell on the whole board is removed, reported with to: null', () => {
    const s = thrown(['.PM#o#'], 'facing: up', { 4: 'block' });
    const packed = { ...s, terrain: s.terrain.map((t, i) => (i === 2 ? 'wall' as const : t)) };
    const r = play(packed, WAIT);
    assert.deepEqual(r.state.hazards, []);
    assert.ok(r.events.some(e => e.kind === 'sent-home' && e.to === null));
  });

  test('a Minotaur sent home onto a hazard on his start sends it home', () => {
    const base = grid(['P.w#M'], 'facing: up');
    const s = { ...base, minotaur: at(0, 2), hazards: [{ ...base.hazards[0]!, at: at(0, 4) }] };
    const r = play(s, WAIT);
    assert.deepEqual(r.state.minotaur, at(0, 4));
    assert.deepEqual(r.state.player, at(0, 0));
    assert.deepEqual(r.state.hazards.map(h => h.at), [at(0, 2)]);
    assert.ok(r.events.some(e => e.kind === 'sent-home' && e.from.c === 4 && e.to?.c === 2));
  });
});
