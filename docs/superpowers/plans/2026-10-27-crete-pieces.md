# Crete Pieces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Chip's Challenge's nine trap and trick pieces to Crete — rules in the pure step function, support in both solvers, Blender art, sounds and help — so the level editor launches with every piece.

**Architecture:** The pieces join the tile data and the level text; their rules live in the step function, split by responsibility (`step.ts` for Theseus and blocks, a new `hazards.ts` for the hazard phase, a new `pieces.ts` for traps, teleports and clone machines, a new `catch.ts` for the shared catch). Everything that changes during a try becomes part of `State`, the reference solver's `stateKey` and the fast solver's packing; the estimate and the pruning are re-proved for each piece by the same-answers corpus. Then the art pipeline, the board, the sounds and the help text.

**Tech Stack:** TypeScript 7 on `node --test`, esbuild through `games/_kit/build/build.mjs`, Blender 5.2.3 (`blender` on PATH) with Python + Pillow, Playwright for one browser spec.

**Spec:** `docs/superpowers/specs/2026-10-21-crete-pieces-design.md` (vision: `2026-10-16-crete-redesign-vision.md`; engine: `2026-10-17-crete-engine-design.md`).

All paths are relative to `websites/www.cs/games/crete/` unless they start with `websites/` or `docs/`.

## Global Constraints

- Turn order is fixed: Theseus's action, then moving hazards in reading order, then the Minotaur's two steps; the turn stops at its first catch.
- The Minotaur never dies, never loses anything and never presses a button.
- **Same answers:** `solve`/`solveRefusing` agree with the breadth-first reference (`test/reference-solver.ts`) on every trial level, the corpus and every new piece test level. Chapter 1's pinned `SHORTEST` and every Chapter 1 difficulty result stay as they are; no existing level uses the new pieces.
- Myth names appear in the game and the help text: **Daedalus's snare** (bear trap), **Bronze ball** (rolling ball), **Harpy** (glider), **Talos's fire** (fireball). Plain names stay in code: `trap`, `ball`, `glider`, `fireball`, `teleport`, `thief`, `bomb`, `clone`, `popup`, `gravel`, `fake-wall`, `invisible-wall`.
- Docs and comments describe current state, never history. Esc is never bound.
- After any change under `src/`, `game.css`, `index.html` or `build.json`: from `websites/www.cs/games` run `node _kit/build/build.mjs crete`; in `games/crete` run `php tools/install-files.php`; in `websites/www.cs` run `php tools/site-versions.php && php tools/site-game-pages.php`. Commit generated files with the source.
- Unit tests: from `websites/www.cs/games`, `node --test crete/test/<file>.test.ts`; all with `bash units.sh`; type and build check with `sh crete/test.sh`. Agents run `make test`-level suites plus at most two browser specs; CI runs the rest.
- Blender is `blender` (5.2.3), not the macOS path in `fx/blender/render_tiles.py`'s docstring; `docker` is Podman. Never bind ports 3000, 5173, 8000 or 8080.
- `test/pieces.test.ts` (the solver tripwire) goes red in Task 1 and stays red until Task 9 lists the new pieces; every other test passes after every task. Until Task 10 renders them, new terrain draws with existing sprites (`floor`), so `test/tiles-atlas.test.ts` stays green in PR 1.

## Rulings made while planning

These are the "left to the builder" choices, plus one change to a settled call.

- **Legend.** Terrain: snare `&`, brown button `-`, red button `+`, pop-up wall `;`, gravel `:`, fake wall `W`, invisible wall `I`, teleport `@`, thief `$`, bomb `!`, clone machine `C`. Hazards: ball `o`, glider `w`, fireball `e`. A hazard stands on floor; a clone machine's cell is terrain `clone` with no object.
- **Headers.** `facing:` lists one direction word (`up`, `down`, `left`, `right`) per hazard on the grid, in reading order, and is required exactly when the grid has a hazard. `machines:` lists one `<template>-<dir>` per `C`, in reading order (`template` is `block`, `ball`, `glider` or `fireball`), required exactly when the grid has a `C`. A count mismatch or bad word is a `LevelError` at the header, as for `pages:`.
- **Links** follow Chip's Challenge's reading-order rule and are never written: each brown button controls the first snare after it in reading order (wrapping to the first), each red button the first clone machine after it (wrapping). A button with nothing to control does nothing. `parse` derives `Level.links`.
- **The trap holds nothing as state.** A snare is *released* while some brown button linked to it is occupied by Theseus, a block or a hazard (never the Minotaur or the cow); a figure on an unreleased snare cannot leave it. Theseus's move while held is a bump (no turn); waiting and tools are turns. A block on an unreleased snare cannot be pushed.
- **Throw-back onto a hazard.** As the spec says: when a catch throws Theseus onto a hazard's cell, or throws the Minotaur home onto one, that hazard is sent back to its own start (event `sent-home`). A level hazard's start is its cell in the level; a clone's start is the cell in front of the machine that made it. If its start is taken (anything a hazard may not enter, or Theseus), it goes to the nearest free cell it may stand on, breadth-first from its start over every cell of the board (walls included), ties in reading order; only when no such cell exists is it removed. Each hazard carries `home` (an index into the level's homes: its hazards' cells in reading order, then its hazard-cloning machines' front cells).
- **Hazards and the toggle button.** Hazards press the toggle button (`_`) too, as Chip's Challenge's monsters press green buttons.
- **Teleports.** A teleport beyond an exit counts as a blocked exit (no chains). Theseus's step out of a teleport may push a block only when he entered the teleport by his own step, not on a ride. Theseus whose every exit is blocked stays on the teleport he entered; the Minotaur and hazards treat that cell as wall, as every teleport.
- **Bomb catches.** A bomb on Theseus is a catch (`caught` with `by: 'bomb'`), so `caught` refuses it and the turn stops there. `canCatch` (the chase/solo label) counts only `by: 'minotaur'`.
- **Clones arrive in full.** A cloned block settles like a pushed block (sinks, slides, presses, explodes); a cloned hazard presses buttons and meets bombs on its cell but does not move until its next phase. A red button pressed by a clone's arrival fires again; every firing needs a free cell, so it ends.
- **Packing hazards.** When no clone machine clones a hazard, hazards are a list of as many slots as the level has hazards, each `cell, kind (2 bits), dir (2 bits), home` sorted by cell, empty slots `none`; otherwise per cell a hazard could ever stand on, 0 empty or 1 + (kind × dir × home). `State.hazards` is always kept sorted by cell, so equal situations pack alike.

## Review Focus

1. A hazard and the Minotaur both heading for the same cell, or a hazard entering the Minotaur's cell while he is stone: neither may enter the other's cell, stone or not (Task 5 test `the Minotaur and a hazard never share a cell`).
2. A teleport level where a key or flippers decide which exit is blocked: pruning must not let a richer situation dominate (Task 8 test `a key a teleport exit could meet never dominates`).
3. A red button pressed twice in one turn (Theseus and then a hazard): two clones, made in that order, the hazard clone moving only next turn (Task 6 test `two firings in one turn make two clones in order`).
4. A catch while Theseus stands on a pop-up wall or a snare: the pop-up rises behind him and the snare lets him go, since he left by being thrown (Task 4 test `a catch throws Theseus out of a snare` and Task 3 test `a pop-up rises when Theseus is thrown off it`).
5. Undo after a reveal, a bomb or a clone: the earlier state comes back whole, with the wall hidden, the bomb back and the clone gone (Task 6 test `undo restores the board after a reveal, a bomb and a clone`).

---

# Pull request 1: the rules and the solvers (`crete/pieces-engine`)

### Task 1: The pieces as data and the level text

**Files:**
- Modify: `src/puzzle/tiles.ts`, `src/puzzle/level.ts`
- Test: `test/puzzle-level.test.ts`

**Interfaces:**
- Produces in `tiles.ts`:
  ```ts
  export type Terrain = /* existing */ | 'trap' | 'button-brown' | 'button-red' | 'popup' | 'gravel'
    | 'fake-wall' | 'invisible-wall' | 'teleport' | 'thief' | 'bomb' | 'clone';
  export type HazardKind = 'ball' | 'glider' | 'fireball';
  export interface Hazard { readonly kind: HazardKind; readonly at: Cell; readonly dir: Dir; readonly home: number }
  export const HAZARDS: Record<HazardKind, { char: string; name: string; sprite: string; turns: readonly ('ahead' | 'left' | 'right' | 'back')[]; crosses?: Terrain }>;
  // ball: turns ['back'], name 'Bronze ball'; glider: ['left','right','back'], 'Harpy', crosses 'water';
  // fireball: ['right','left','back'], "Talos's fire", crosses 'fire'.
  export type Template = 'block' | HazardKind;
  export const PIECE_NAMES: Partial<Record<Terrain, string>>; // trap: "Daedalus's snare", the rest plain ("Pop-up wall", …)
  ```
  `TerrainDef` gains `hazard: boolean` (a hazard may stand on it). New entries' flags (`minotaur`, `block`, `hazard`): trap, both buttons, thief: all true; bomb: false, true, true; popup, gravel, fake-wall, invisible-wall, teleport, clone: all false. Existing terrain's `hazard` equals its `minotaur`. Sprites: fake-wall `['wall']`, invisible-wall `['floor']`; the others `['floor']` until Task 10 renders their own. `HAZARDS[k].sprite` is set in Task 10; until then hazards are not in `SPRITE_NAMES`.
- Produces in `level.ts`: `Level` gains `hazards: readonly Hazard[]` (reading order), `machines: readonly { at: Cell; template: Template; dir: Dir }[]` (reading order) and `links: Readonly<Record<number, number>>` (button cell index → trap or clone cell index). `serialize` writes `facing:` and `machines:` after `pages:` when non-empty.

- [ ] **Step 1: Write the failing tests** in `test/puzzle-level.test.ts`:
  - `every new piece round-trips`: a level holding each new char, two hazards with `facing: up left` and two machines with `machines: block-right fireball-down`; `deepEqual(parse(serialize(lv)), lv)`, and `lv.hazards[1]` is `{ kind: 'glider', at: …, dir: 'left' }`.
  - `buttons link to the next trap or machine in reading order, wrapping`: grid `&-&-` → links map button 1 → trap 2, button 3 → trap 0; a red button with no `C` has no link.
  - `facing and machines must match the grid`: missing `facing:` with a hazard, an extra word, `facing: north`, `machines: rock-up` each throw `LevelError` naming the header's line.
- [ ] **Step 2:** Run `node --test crete/test/puzzle-level.test.ts` — Expected: FAIL.
- [ ] **Step 3:** Implement the types, the table entries, `parse`/`serialize` and the link derivation.
- [ ] **Step 4:** Run `bash units.sh` — Expected: PASS except `test/pieces.test.ts` (Task 9 closes it). Run `sh crete/test.sh` — Expected: PASS.
- [ ] **Step 5: Commit** `feat(crete): the nine new pieces in the tile data and the level text`

### Task 2: State, the turn's vocabulary, and the shared catch

**Files:**
- Modify: `src/puzzle/state.ts`, `src/puzzle/work.ts`, `src/puzzle/minotaur.ts`, `src/puzzle/step.ts`
- Create: `src/puzzle/catch.ts`
- Modify: `tsconfig.json` (`files` gains new src files, here and in later tasks)
- Test: `test/puzzle-step.test.ts`

**Interfaces:**
- Produces: `State.hazards: readonly Hazard[]` (sorted by cell; `initial` copies `level.hazards`); `Work.hazards: Hazard[]` (`work()` copies it).
- `GameEvent` gains: `moved`/`slid` `who` adds `'hazard'` (with `hazard?: HazardKind`); `{ kind: 'caught'; at; hearts; by: 'minotaur' | 'hazard' | 'bomb' }`; `{ kind: 'revealed'; at; what: 'fake-wall' | 'invisible-wall' }`; `{ kind: 'rose'; at }`; `{ kind: 'teleported'; who: 'player' | 'block'; from: Cell; via: Cell; to: Cell }`; `{ kind: 'held'; who: 'player' | 'minotaur' | 'block' | 'hazard'; at }`; `{ kind: 'robbed'; at; gear: Gear[] }`; `{ kind: 'exploded'; who: 'player' | 'block' | 'hazard'; at }`; `{ kind: 'cloned'; what: Template; at }`; `{ kind: 'sent-home'; from: Cell; to: Cell }`.
- `catch.ts`: `caught(w: Work, ev: GameEvent[], by: 'minotaur' | 'hazard' | 'bomb'): void` — moved out of `minotaur.ts`, plus: Theseus leaves his cell through `leave` (Task 3 fills it in; here a no-op export `leave(w, from, ev)`), a hazard on the throw-back cell or on the Minotaur's start when he is sent home is sent home (the throw-back ruling) with `sent-home`. `turnOver(w, ev): boolean` — the outcome is no longer `playing` or a `caught` is in `ev`.
- `step()` runs `hazardPhase(w, ev)` (a no-op export in a new `src/puzzle/hazards.ts`, filled in by Task 5) between the player's action and `minotaurPhase`, skipping both when `turnOver`; a raised mirror skips only the Minotaur.

- [ ] **Step 1: Write the failing tests**: `a Minotaur catch reports by: 'minotaur'`; `initial copies the level's hazards sorted by cell`; existing step tests still pass unchanged.
- [ ] **Step 2:** Run `node --test crete/test/puzzle-step.test.ts` — Expected: FAIL.
- [ ] **Step 3:** Implement. Keep `step`'s array-sharing for unchanged terrain/objects, and share `s.hazards` when unchanged.
- [ ] **Step 4:** Run `bash units.sh` (tripwire only red) — Expected: PASS.
- [ ] **Step 5: Commit** `refactor(crete): hazards in the state, the new events, and one catch for every cause`

### Task 3: Static pieces for Theseus and blocks: pop-up, gravel, fake and invisible walls, thief, bomb, teleport

**Files:**
- Modify: `src/puzzle/step.ts`, `src/puzzle/catch.ts`
- Create: `src/puzzle/pieces.ts` (`teleportExit`, used by Theseus and blocks)
- Test: `test/puzzle-pieces.test.ts` (new; one `describe` per piece in later tasks too)

**Interfaces:**
- `leave(w: Work, from: Cell, ev: GameEvent[]): void` in `catch.ts` — a `popup` at `from` becomes `wall` with `rose`. Every change of `w.player` goes through it (step, slide, carry, throw-back, teleport).
- `teleportExit(w: Work, entry: Cell, d: Dir, mayEnter: (beyond: Cell) => boolean): { via: Cell; to: Cell } | null` in `pieces.ts` — the teleports after `entry` in reading order, wrapping, `entry` excluded; the first whose cell beyond in `d` passes `mayEnter` and is not a teleport. `null` when none (a lone teleport always).

- [ ] **Step 1: Write the failing tests** (grids via `test/puzzle-grid.ts`):
  - `a pop-up wall rises behind Theseus`, `a pop-up rises when Theseus is thrown off it`, `blocks, the Minotaur and hazards never enter a pop-up`.
  - `gravel lets Theseus through and stops a pushed block and the Minotaur`.
  - `bumping a fake wall opens it and costs a move`: terrain becomes `floor`, `moves` +1, the Minotaur steps, Theseus stays; `bumping an invisible wall shows it and costs a move`: terrain becomes `wall`; `a slide, a pushed block and a teleport exit treat both as wall and reveal nothing`.
  - `a thief takes all gear and leaves keys and tools`.
  - `a bomb under Theseus costs a heart, throws him back and is gone`, with `by: 'bomb'`, and the Minotaur does not move that turn; `a bomb with one heart left loses the try`; `a block pushed onto a bomb is destroyed with it`.
  - `Theseus teleports to the next teleport in reading order and steps on`; `a blocked exit is skipped, wrapping`; `every exit blocked: Theseus stays on the teleport he entered`; `a lone teleport is wall`; `arriving out of a teleport takes items and rides ice`; `a block teleports the same way; with every exit blocked the push is refused`; `the Minotaur treats a teleport as wall`.
- [ ] **Step 2:** Run `node --test crete/test/puzzle-pieces.test.ts` — Expected: FAIL.
- [ ] **Step 3:** Implement in `step.ts`: `enterAsPlayer` handles gravel (open), popup (open), fake/invisible (a bump that is a turn: return a third outcome, e.g. `'revealed'`), teleport (resolve the exit, then enter the cell beyond as a step or ride per the rulings); `arrive` handles thief and bomb; `blockMayEnter`/`settleBlock` handle bomb and teleport. `minotaurMayEnter` keeps reading `TERRAIN[t].minotaur`.
- [ ] **Step 4:** Run `bash units.sh` (tripwire only red) and `sh crete/test.sh` — Expected: PASS.
- [ ] **Step 5: Commit** `feat(crete): pop-up walls, gravel, fake and invisible walls, the thief, bombs and teleports`

### Task 4: Daedalus's snare and the brown button

**Files:**
- Modify: `src/puzzle/pieces.ts`, `src/puzzle/step.ts`, `src/puzzle/minotaur.ts`
- Test: `test/puzzle-pieces.test.ts`

**Interfaces:**
- `released(w: Work, trap: number): boolean` in `pieces.ts` — some button `b` with `level.links[b] === trap` and terrain `button-brown` holds Theseus, a block or a hazard.
- `heldAt(w: Work, x: Cell): boolean` — `x` is a `trap` and not released. Theseus's move, a block's push and the Minotaur's step start by checking it; Task 5's hazards do too.

- [ ] **Step 1: Write the failing tests**: `Theseus in a snare cannot move until a block stands on its button`; `waiting while held is a turn`; `a move while held is a bump`; `the Minotaur in a snare is pinned`; `a block in a held snare cannot be pushed`; `anything walks through a snare whose button is held`; `stepping off the button holds the snare again`; `a catch throws Theseus out of a snare`; `the Minotaur standing on a brown button does not release it`; `a snare emits held when it closes on someone`.
- [ ] **Step 2:** Run — Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `bash units.sh` (tripwire only red) — Expected: PASS.
- [ ] **Step 5: Commit** `feat(crete): Daedalus's snare and its brown button`

### Task 5: Moving hazards

**Files:**
- Modify: `src/puzzle/hazards.ts`, `src/puzzle/minotaur.ts`, `src/puzzle/step.ts`
- Test: `test/puzzle-hazards.test.ts` (new)

**Interfaces:**
- `hazardMayEnter(w: Work, h: Hazard, x: Cell): boolean` — inside; `TERRAIN[t].hazard` or `t === HAZARDS[h.kind].crosses`; no object, cow, Minotaur (stone or not) or other hazard on `x`; not held; Theseus's cell allowed (a catch).
- `hazardPhase(w: Work, ev: GameEvent[]): void` — lists the hazards once by reading order of their cells; each in turn: held → stays; else tries `ahead` then its `turns` (relative to its facing), takes the first enterable, faces it, arrives; on ice/force floors slides like the Minotaur (a stopped slide ends without turning; a force floor sets its facing). Arrival: Theseus's cell → `caught(w, ev, 'hazard')` and the phase ends; bomb → hazard and bomb gone, `exploded`; buttons press (toggle flips, red fires — Task 6). Clones made during the phase are appended and do not move. Finally sorts `w.hazards` by cell.
- `minotaurMayEnter` refuses a hazard's cell. `enterAsPlayer` into a hazard's cell is `caught(w, ev, 'hazard')` with Theseus not moving; a pushed block may not enter a hazard's cell.

- [ ] **Step 1: Write the failing tests**:
  - `a bronze ball goes straight and turns back when blocked`; `a harpy turns left, then right, then back`; `Talos's fire turns right, then left, then back`; `a hazard boxed in on every side stays`.
  - `a harpy crosses water and Talos's fire crosses fire; neither crosses the other's`.
  - `a hazard slides on ice and is carried by a force floor, facing the way it was carried`; `a stopped slide does not turn`.
  - `a hazard moving onto Theseus is a catch and the Minotaur does not move that turn`; `Theseus moving into a hazard is a catch and he does not move`; `a hazard on a bomb is destroyed with it`; `hazards press the toggle button`.
  - `hazards move in reading order of where they stood when the phase began`: two hazards racing for one cell — the earlier one takes it; a later hazard enters a cell an earlier one just left.
  - `the Minotaur and a hazard never share a cell`, stone or not; `hazards keep moving while the Minotaur is stone`.
  - `a catch that throws Theseus onto a hazard sends it home`; `a hazard whose start is taken goes to the nearest free cell`.
  - `hazards do not enter blocks, objects, the cow or each other`.
- [ ] **Step 2:** Run `node --test crete/test/puzzle-hazards.test.ts` — Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `bash units.sh` (tripwire only red) — Expected: PASS.
- [ ] **Step 5: Commit** `feat(crete): the bronze ball, the harpy and Talos's fire`

### Task 6: Clone machines and the red button

**Files:**
- Modify: `src/puzzle/pieces.ts`, `src/puzzle/step.ts`, `src/puzzle/hazards.ts`
- Test: `test/puzzle-pieces.test.ts`, `test/puzzle-run.test.ts`

**Interfaces:**
- `fireRed(w: Work, button: number, ev: GameEvent[]): void` in `pieces.ts` — the linked machine's template appears on the cell in front of it if free for that kind (a block: `blockMayEnter` and no hazard; a hazard: `hazardMayEnter` and not Theseus's cell), with `cloned`; a block then settles as pushed in the machine's direction; a hazard takes the machine's direction and is appended to `w.hazards`. Called on every arrival on a `button-red` (Theseus, a block, a hazard, a clone).

- [ ] **Step 1: Write the failing tests**: `a red button clones a block out of its machine`; `a clone into a blocked cell is not made`; `a cloned hazard never appears on Theseus`; `the Minotaur never presses the red button`; `a machine cell is wall to everyone`; `two firings in one turn make two clones in order` (Theseus presses, then a hazard presses; the hazard clone moves only next turn); `a cloned block on ice slides`; `undo restores the board after a reveal, a bomb and a clone` (in `puzzle-run.test.ts`).
- [ ] **Step 2:** Run — Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `bash units.sh` (tripwire only red) — Expected: PASS.
- [ ] **Step 5: Commit** `feat(crete): clone machines and the red button`

### Task 7: The reference key and the packing

**Files:**
- Modify: `test/reference-solver.ts`, `src/puzzle/pack.ts`
- Test: `test/pack.test.ts`

**Interfaces:**
- `stateKey` adds the hazards (`cell:kind:dir`, sorted) and treats `popup`, `fake-wall`, `invisible-wall` and `bomb` as changing cells.
- `Layout` gains the hazard fields per the packing ruling (`hazardSlots: number` or `hazardCells: Int32Array`, one of them used); `changing` adds pop-ups, fake and invisible walls and bombs; `unpack` maps a changed cell by its level terrain: water → dirt, door → floor, popup → wall, fake-wall → floor, invisible-wall → wall, bomb → floor. `blockCells` seeds from block machines' front cells too; a block that can reach a cell next to a teleport reaches every block-enterable cell beyond any teleport; a bomb cell is enterable.

- [ ] **Step 1: Write the failing tests**: `pack and unpack round-trip with every piece in play` (play random legal lines on piece levels, `unpack(pack(s))` packs equal and has the same `stateKey`); `two situations pack alike exactly when their keys match` on the piece levels; `cloned hazards pack per cell`; `hazards pack as slots when nothing clones one`.
- [ ] **Step 2:** Run `node --test crete/test/pack.test.ts` — Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `bash units.sh` (tripwire only red) — Expected: PASS.
- [ ] **Step 5: Commit** `feat(crete): the solvers' situation holds every new piece`

### Task 8: The estimate and the pruning

**Files:**
- Modify: `src/puzzle/heuristic.ts`, `src/puzzle/prune.ts`
- Test: `test/heuristic.test.ts`, `test/prune.test.ts`

**Interfaces:**
- `moveEnds` treats `clone` and `invisible-wall` as wall and every other new terrain as open; a step onto a teleport heading `d` may end on the teleport itself or on the cell beyond any other teleport in `d`, each followed by its slide.
- `dominance` also leaves out a key colour or free gear (flippers, fire boots) that a teleport exit could meet: some teleport's neighbour is that colour's door or needs that gear, in a level with two or more teleports.

- [ ] **Step 1: Write the failing tests**: `the estimate never exceeds the true distance on piece levels` (every situation the reference visits on the Task 9 piece levels: `estimate(s) <= ` BFS distance to a win, and drops by at most one per action); `a teleport shortens the estimate`; `a key a teleport exit could meet never dominates`; `flippers a teleport exit could need never dominate`.
- [ ] **Step 2:** Run — Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `bash units.sh` — Expected: PASS but the tripwire.
- [ ] **Step 5: Commit** `feat(crete): the estimate and pruning know the new pieces`

### Task 9: Same answers on every piece, the tripwire, the label, and the docs

**Files:**
- Modify: `test/corpus.ts`, `test/pieces.test.ts`, `src/puzzle/difficulty.ts`, `README.md`
- Create: `test/pieces-solver.test.ts`
- Test: `test/same-answers.test.ts`, `test/difficulty.test.ts`

**Interfaces:**
- `SCATTER` gains every new char at low counts (hazards 1–2, machines 1, teleports 2–3); `candidate` writes `facing:` and `machines:` headers, pairs `&` with `-` and `C` with `+` most of the time. If the corpus's mix assertions fail, raise `count`, never lower a threshold.
- `canCatch` stops only at a `caught` with `by: 'minotaur'`; `apart` counts a fake wall as ever-open to the Minotaur, and lets Theseus's flood through pop-ups, gravel, fake walls and from any teleport to every teleport's neighbours.

- [ ] **Step 1: Write the failing tests** in `test/pieces-solver.test.ts`: one small level per piece built around it (each solvable only by using the piece), and the spec's interaction levels — Minotaur in a trap, hazard on a bomb, block through a teleport, thief and keys, clone into a blocked cell, hazards whose order decides a catch, a button press and a clone's cell, clones made in the same turn — each passed through `sameAnswers(level, CORPUS_CAP)` and asserting its expected `solved` and line length. In `difficulty.test.ts`: `a level where only a hazard catches is solo`.
- [ ] **Step 2:** Run `node --test crete/test/pieces-solver.test.ts crete/test/difficulty.test.ts` — Expected: FAIL where the solvers or the label disagree.
- [ ] **Step 3:** Fix what disagrees (in the engine, `pack`, `heuristic` or `prune`, never the reference unless the rule is wrong there); extend `SCATTER` and `candidate`; list the new kinds in `pieces.test.ts`.
- [ ] **Step 4:** Run `bash units.sh` and `sh crete/test.sh` — Expected: all PASS. Note `units.sh` wall time against `main`'s in the report.
- [ ] **Step 5:** README: a "Pieces" section with the legend table, the headers, the link rule, each piece's rule in a line, and the turn order; the solver section names what the situation now holds. `docs/superpowers/roadmap.md`: Crete step 1 names this plan.
- [ ] **Step 6: Commit** `test(crete): every new piece gets the reference's answers`

Then: open PR 1, `foundry:pr-fix-loop`, merge on green, deploy, light live check.

# Pull request 2: the look and the sound (`crete/pieces-art`)

### Task 10: Blender art for the new pieces

**Files:**
- Modify: `fx/blender/render_tiles.py` (build functions, `SPRITES`, docstring's run line uses `blender`), `fx/sprites/tiles.{png,json}`, `fx/blender/*.blend` (new, Git LFS), `fx/blender/preview-16.png`, `board-preview.png`
- Modify: `src/puzzle/tiles.ts` (real sprite names), `test/tiles-atlas.test.ts`

**Interfaces:**
- New sprites: `trap`, `button-brown`, `button-red`, `popup`, `gravel`, `teleport` (loop), `thief`, `bomb`, `clone-up`, `clone-down`, `clone-left`, `clone-right`, `ball` (loop, rolling), `glider` (loop, wingbeat), `fireball` (loop, flicker). `TERRAIN.clone.sprites` lists the four clone sprites in `DIRS` order; `HAZARDS[k].sprite` names the hazard's. `SPRITE_NAMES` includes `HAZARDS` sprites.
- Look: painted Bronze Age Crete like the existing set — a bronze-jawed snare in the floor, buttons as inlaid discs (brown, red), a pop-up as a floor slab with a raised lip, gravel as loose scree, a teleport as a swirling labyrinth-pattern disc, the thief as a hooded figure's mosaic or an open grasping hand inlay (terrain, no figure), a bomb as a clay pot with a lit wick, a clone machine as a bronze casting mould with an arrow, the ball as a bronze sphere, the harpy as a winged woman-bird, Talos's fire as a molten bronze flame.

- [ ] **Step 1:** Update `tiles-atlas.test.ts`: loops list adds `teleport`, `ball`, `glider`, `fireball` — run it, Expected: FAIL.
- [ ] **Step 2:** Write the build functions; preview with `blender -b -P render_tiles.py -- --only trap,ball,…` and look at each strip (Read the PNGs).
- [ ] **Step 3:** Render the full atlas: `cd fx/blender && blender -b -P render_tiles.py -- --out ../sprites`. Expected: exit 0, the 16 px check passes.
- [ ] **Step 4:** Run `node --test crete/test/tiles-atlas.test.ts` and `bash units.sh` — Expected: PASS. Rebuild and re-version per Global Constraints.
- [ ] **Step 5: Commit** `feat(crete): Blender art for the new pieces`

### Task 11: The board draws and animates the pieces

**Files:**
- Modify: `src/board-plan.ts`, `src/tiles-page.ts` (its level holds every piece)
- Test: `test/board-plan.test.ts`

**Interfaces:**
- `Figures` gains `hazards: { kind: HazardKind; at: Pos }[]`. `drawList` draws a clone machine's sprite by its direction with its template's sprite over it, and hazards after the objects of their row, before the Minotaur.
- `timeline`: segments run player (with pushed blocks and teleports: a jump from the entry teleport to `via`, then the step to `to`), then each hazard's moves and slides (in event order, `SLIDE_MS` a cell, hazards of one phase moving together in one slot), then the Minotaur. `playerEnd` is unchanged in meaning.

- [ ] **Step 1: Write the failing tests**: `hazards are drawn in their row`; `a clone machine draws its template`; `the timeline moves hazards after the player and before the Minotaur`; `a teleport jumps without passing the cells between`.
- [ ] **Step 2:** Run `node --test crete/test/board-plan.test.ts` — Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run `bash units.sh`, rebuild — Expected: PASS.
- [ ] **Step 5: Commit** `feat(crete): the board draws hazards, clone machines and teleports`

### Task 12: Sounds, the log, the help text, and a browser check

**Files:**
- Modify: `src/game.ts` (`SfxName`, event voicing, log lines), `src/audio.ts` (`VOICES`), `src/help.ts`, `src/main.ts` (test hook, if needed), `README.md`
- Create: `websites/www.cs/tests/e2e/crete-pieces.spec.ts`
- Test: `test/game.test.ts`, `test/audio.test.ts`, `test/help.test.ts`

**Interfaces:**
- `SfxName` gains `snap` (held), `reveal`, `rise`, `warp` (teleported), `thief`, `boom` (exploded), `clone`, `home`. A hazard catch voices `caught`; its log says who caught Theseus by myth name ("The harpy caught you! 2 hearts left."); a bomb says "A bomb! …".
- `helpLines` gains one line per family, with myth names: the snare and its button; pop-up, fake and invisible walls and gravel; teleports and the thief; bombs and clone machines with the red button; the three hazards and the turn order.
- `window.__creteTest` gains `parse` and `playLevel(level: Level)` if `Game` cannot already open a level outside the campaign.

- [ ] **Step 1: Write the failing tests**: `every new event has a sound` (game.test with recording `sfx`); `audio voices every SfxName`; `help names Daedalus's snare, the bronze ball, the harpy and Talos's fire`.
- [ ] **Step 2:** Run — Expected: FAIL.
- [ ] **Step 3:** Implement; write `crete-pieces.spec.ts`: open a small level with a harpy and a snare through `__creteTest`, press Wait, and check on the canvas (the `helpers.ts` recorder) that the harpy moved and, via `game.run.now`, that Theseus held in the snare stays after an arrow key.
- [ ] **Step 4:** Run `bash units.sh`, rebuild, and `make e2e` for `crete-pieces.spec.ts` and `crete-play.spec.ts` only — Expected: PASS.
- [ ] **Step 5: Commit** `feat(crete): sounds, log lines and help for the new pieces`

Then: open PR 2, `foundry:pr-fix-loop`, merge on green, deploy, light live check (`crete-pieces.spec.ts` against the live site), report with the cache-busted play link; update `docs/superpowers/roadmap.md` (Crete step 1 done) in PR 2.
