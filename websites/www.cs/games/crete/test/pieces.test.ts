// The tripwire for new pieces. The solver's packing (pack.ts: blockCells and the field widths), estimate
// (heuristic.ts: moveEnds) and pruning (prune.ts: rideMeets and the dominance fields) are written for exactly
// these terrains and objects, and the generated corpus (test/corpus.ts) scatters every one of them. A new piece
// fails here until each of those has been checked for it and the piece is added to the lists below.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OBJECTS, TERRAIN } from '../src/puzzle/tiles.ts';
import { SCATTER } from './corpus.ts';

const TERRAINS = [
  'floor', 'wall', 'exit', 'gate', 'water', 'fire', 'ice', 'force-up', 'force-down', 'force-left', 'force-right',
  'dirt', 'safe', 'button', 'toggle-open', 'toggle-closed', 'door-red', 'door-blue', 'door-yellow', 'door-green',
];
const OBJECT_KINDS = [
  'relic', 'key-red', 'key-blue', 'key-yellow', 'key-green', 'flippers', 'fire-boots', 'skates', 'suction',
  'mirror', 'cake', 'cow', 'page', 'block',
];
const NEW_PIECE = 'new piece: update pack.ts, heuristic.ts, prune.ts and test/corpus.ts for it, then list it here';

test('the solver has been checked for every terrain and object: a new one fails here', () => {
  assert.deepEqual(Object.keys(TERRAIN).sort(), [...TERRAINS].sort(), NEW_PIECE);
  assert.deepEqual(Object.keys(OBJECTS).sort(), [...OBJECT_KINDS].sort(), NEW_PIECE);
});

test('the corpus scatters every piece: floor, the exit and the figures it places itself, pages never', () => {
  const placed = new Set(['.', 'E', ...SCATTER.map(([ch]) => ch)]);
  // A page needs its id in the level's header; pages only add a set field, which pack.test's trial levels cover.
  const unscattered = new Set(['page']);
  for (const [kind, def] of [...Object.entries(TERRAIN), ...Object.entries(OBJECTS)]) {
    if (unscattered.has(kind)) continue;
    assert.ok(placed.has(def.char), `${kind} (${def.char}) is not in test/corpus.ts's SCATTER: ${NEW_PIECE}`);
  }
});
