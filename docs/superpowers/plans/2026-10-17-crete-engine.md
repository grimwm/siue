# Crete Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Crete's seeded chase with a tile-puzzle engine (Chip's Challenge pieces, a Theseus-rule Minotaur, undo and an exact solver), a Blender-rendered board, and eight hand-made trials.

**Architecture:** A pure, DOM-free engine in `crete/src/puzzle/` (`step(state, action) → { state, events }`, immutable states, undo as the list of earlier states, BFS solver). A DOM-free draw planner turns a state and its events into a timed list of sprites; a small canvas module paints it from one atlas that `fx/blender/render_tiles.py` renders. The existing part 1 shell (status bar, strip, layers, title card, menu) is rewired onto the engine, and the old chase is deleted.

**Tech Stack:** TypeScript 7 (`erasableSyntaxOnly`, `.ts` import suffixes), Preact views, esbuild through `games/_kit/build/build.mjs`, `node:test` units, Playwright e2e, Blender 4.2+ (tested on 5.2) for the art, Pillow for the atlas checks.

**Spec:** `docs/superpowers/specs/2026-10-17-crete-engine-design.md`

## Global Constraints

- Work only in a worktree; the root checkout stays on `main`. Never use a bare `git stash`.
- Three PRs, each green on its own: **PR A engine** (Tasks 1–5), **PR B art** (Tasks 6–7), **PR C game** (Tasks 8–11). PR B branches from `main` after PR A merges; PR C after PR B merges.
- Do not change CI: no edits to `.github/workflows/*`, `tests/e2e/select.ts` or `tests/e2e/playwright.config.*`. No new e2e spec files; PR C rewrites the two existing Crete specs.
- Never bind ports 3000, 5173, 8000 or 8080. Docker runs use a unique `COMPOSE_PROJECT_NAME` and are torn down with `docker compose -p <that name> down`; never touch the `siue` project, never prune.
- Never `ssh`, `sftp`, `scp` or `nc` to www.cs.siue.edu, and never run `make deploy`. Deploys happen on merge.
- Escape is never bound and never leaves full screen. Q is back (the kit's `isBackKey`).
- Every key a button prints comes from the key table (`src/keys.ts`) or the tool definition (`TOOLS` in `src/puzzle/tiles.ts`); no key letter is hard-coded in logic or views.
- Docs and comments describe the current state, never history ("was", "used to", "now", dates).
- DOM-free modules are listed in `crete/tsconfig.json` `files`; DOM modules in `crete/src/tsconfig.dom.json` `files`.
- Unit tests are `crete/test/*.test.ts` (flat: `games/units.sh` globs only that folder); helpers that are not tests use another suffix.
- Gates before every push: `bash websites/www.cs/games/units.sh`, `make test` in `websites/www.cs`, and for PR C `make e2e E2E_ARGS="crete-play.spec.ts crete-layout.spec.ts"`.
- After any change under `crete/src`, `crete/game.css`, `crete/index.html` or `crete/fx/sprites`: from `games/` run `node _kit/build/build.mjs crete`; in `games/crete` run `php tools/install-files.php`; in `websites/www.cs` run `php tools/site-versions.php` and `php tools/site-game-pages.php`. Commit `dist/`, `sw.js` and the changed pages.
- Spec values used verbatim: Minotaur takes **2** steps per turn; Medusa's mirror stones it for **3** turns; default hearts **3**; solver cap **2,000,000** states; slide **≈120 ms** per cell; readability at **14 to 24 px** a cell with a silhouette check at **16 px**; tool keys **Z** (mirror), **X** (cake), **C** (cow); Wait **.**, Undo **U**, Restart **R**, thread **H / V / T**.
- Commits end with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
  ```

## Rulings the spec leaves open

These are decided here so every task agrees:

1. **Level legend.** One character per cell; an object or figure stands on floor. Terrain: `.` floor, `#` wall, `E` exit, `|` gate, `~` water, `F` fire, `=` ice, `^ v < >` force floors, `%` dirt, `S` safe zone, `_` button, `T` toggle wall closed, `t` toggle wall open, `R B Y G` doors (red, blue, yellow, green). Objects: `*` relic, `r b y g` keys, `f` flippers, `h` fire boots, `k` skates, `u` suction boots, `z` mirror, `x` honey cake, `c` cow, `p` story page, `O` block. Figures: `P` Theseus (exactly one), `M` Minotaur (at most one).
2. **Level text.** Header lines `name: value` (names `title`, `intro`, `hearts`, `relics`), one blank line, then the grid rows, then a final newline. The canonical form writes `title` and `intro` always, `hearts` only when not 3, `relics` only when not the number of `*` in the grid.
3. **An opened door becomes floor.** The gate stays `gate` terrain and is open while no relic is left; the exit wins only when no relic is left (before that it is walkable like floor).
4. **The player cannot step onto the Minotaur** (a bump, no turn). A stone Minotaur is a wall to everyone.
5. **Slides and carries never push blocks**; they do open a door whose key you hold, pick things up, press buttons and mark safe zones. A ride ends when the next cell is closed, when the ride leaves ice or force floor, or when it would enter a cell it already crossed this turn (a force-floor loop stops on the last new cell).
6. **A block** may enter floor, dirt, water (it sinks: the cell becomes dirt and the block is gone), ice (it slides on), force floor (it is carried) and a button (it presses it). Anything else — another block, any object, a figure, the cow, walls, doors, gate, exit, fire, safe zone, toggle walls — stops it, and the push is a bump.
7. **Caught at the throw-back cell.** When the player is thrown back to a cell the Minotaur stands on, the Minotaur goes back to its own start cell.
8. **Tools.** A tool with count 0 is a bump. Honey cake at full hearts is a bump. Daedalus's cow while a cow stands is a bump. Every tool use is a turn (the Minotaur then moves, unless stone).
9. **Moves** count every turn-taking action (move, wait, tool). Bumps, undo and restart do not.
10. **Assisted** sticks to the trial for as long as the player stays in it: restart does not clear it; opening the trial again from the list does.
11. **Progress.** Per trial: `cleared` once any clear happens; `best` is the fewest moves of an unassisted clear (null if every clear was assisted); `assisted` is true while `cleared && best === null`.
12. **Files.** The art lives in `crete/fx/blender/` (script and `.blend` files) and `crete/fx/sprites/` (`tiles.png`, `tiles.json`), the paths `deploy.sh` and nginx already handle. The art test page is `crete/tiles-test.html` with entry `dist/tiles-test.js`, which `deploy.sh`'s `games/*-test.*` pattern keeps off the site.
13. **N** opens the trial list (from the title card and in play). `?seed=<anything>` opens trial 1 with the title card closed.

## Review Focus

1. **A force-floor loop or an ice ring** — the turn ends and the player can walk off; it never hangs. Pinned in Task 2 (`a force-floor loop stops on the last new cell`).
2. **Thrown back onto the Minotaur** (caught while standing on the start, which is the throw-back cell) — the Minotaur goes home, nobody overlaps. Pinned in Task 3.
3. **A key press in the middle of a slide** — the slide finishes at once and the press acts exactly once; nothing is lost or doubled. Pinned in Task 7 (`timeline` tests) and Task 10 (`input queue`).
4. **Acting after the try ended** (won, or zero hearts) — every action is a bump except undo and restart; undo from a loss works. Pinned in Task 4.
5. **Blocked or corrupt browser storage** — the trial list opens with nothing cleared and play works; a garbage value never throws. Pinned in Task 9.

---

## PR A — Engine (no page change)

Branch `crete/engine` from `main`, worktree `.claude/worktrees/crete-engine`. Nothing under `crete/src/` outside `puzzle/` changes, so `dist/` must not change (`node _kit/build/build.mjs crete --check` stays green without a rebuild).

### Task 1: Pieces and the level format

**Files:**
- Create: `websites/www.cs/games/crete/src/puzzle/tiles.ts`
- Create: `websites/www.cs/games/crete/src/puzzle/level.ts`
- Modify: `websites/www.cs/games/crete/tsconfig.json` (add both to `files`)
- Test: `websites/www.cs/games/crete/test/puzzle-level.test.ts`

**Interfaces:**
- Produces (tiles.ts): `Dir`, `DIRS`, `DELTA`, `KeyColor`, `KEY_COLORS`, `Gear`, `GEAR`, `Tool`, `TOOLS: Record<Tool, { name: string; key: string; desc: string }>`, `Terrain`, `TERRAIN: Record<Terrain, TerrainDef>`, `ObjectKind`, `OBJECTS: Record<ObjectKind, { char: string; sprite: string; name: string }>`, `SPRITE_NAMES: readonly string[]`, `Cell`.
- Produces (level.ts): `Level`, `LevelError` (`line`, `col`), `parse(text: string): Level`, `serialize(level: Level): string`.

- [ ] **Step 1: Write the failing test**

```ts
// websites/www.cs/games/crete/test/puzzle-level.test.ts
// The level text: every legend character parses, a bad level names its line and column,
// and the canonical text survives a round trip.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse, serialize, LevelError } from '../src/puzzle/level.ts';
import { TERRAIN, OBJECTS, SPRITE_NAMES } from '../src/puzzle/tiles.ts';

const SAMPLE = [
  'title: The first gate',
  'intro: Count the walls before it counts you.',
  'hearts: 4',
  '',
  '#########',
  '#P.*..rR#',
  '#~F=^v<>#',
  '#%S_Tt|E#',
  '#BYGbygf#',
  '#hkuzxcp#',
  '#O.....M#',
  '#########',
  '',
].join('\n');

test('every legend character parses to its piece', () => {
  const lv = parse(SAMPLE);
  assert.equal(lv.title, 'The first gate');
  assert.equal(lv.hearts, 4);
  assert.equal(lv.relics, 1);
  assert.equal(lv.rows, 8);
  assert.equal(lv.cols, 9);
  assert.deepEqual(lv.player, { r: 1, c: 1 });
  assert.deepEqual(lv.minotaur, { r: 6, c: 7 });
  const at = (r: number, c: number) => ({ t: lv.terrain[r * lv.cols + c], o: lv.objects[r * lv.cols + c] });
  assert.deepEqual(at(1, 3), { t: 'floor', o: 'relic' });
  assert.deepEqual(at(1, 7), { t: 'door-red', o: null });
  assert.deepEqual(at(2, 4), { t: 'force-up', o: null });
  assert.deepEqual(at(3, 6), { t: 'gate', o: null });
  assert.deepEqual(at(5, 7), { t: 'floor', o: 'cow' });
  assert.deepEqual(at(6, 1), { t: 'floor', o: 'block' });
  assert.deepEqual(at(1, 1), { t: 'floor', o: null }, 'a figure stands on floor');
});

test('the canonical text round-trips exactly', () => {
  assert.equal(serialize(parse(SAMPLE)), SAMPLE);
});

test('hearts and relics default to 3 and the relics on the grid, and are not written then', () => {
  const lv = parse('title: t\nintro: i\n\nP*E\n');
  assert.equal(lv.hearts, 3);
  assert.equal(lv.relics, 1);
  assert.equal(serialize(lv), 'title: t\nintro: i\n\nP*E\n');
});

test('a bad level names its line and column', () => {
  const cases: [string, number, number, RegExp][] = [
    ['title: t\nintro: i\n\nP.Q\n', 4, 3, /unknown tile 'Q'/],
    ['title: t\nintro: i\n\nP..\n..\n', 5, 1, /row is 2 wide, expected 3/],
    ['title: t\nintro: i\n\n...\n', 4, 1, /no player/],
    ['title: t\nintro: i\n\nPP.\n', 4, 2, /second player/],
    ['title: t\nintro: i\n\nPMM\n', 4, 3, /second Minotaur/],
    ['title: t\nsize: 4\n\nP\n', 2, 1, /unknown header 'size'/],
    ['title: t\nhearts: 0\n\nP\n', 2, 9, /hearts must be 1 to 99/],
    ['title: t\nrelics: 2\n\nP*\n', 2, 9, /relics: 2 but the grid has 1/],
  ];
  for (const [text, line, col, msg] of cases) {
    assert.throws(() => parse(text), (e: unknown) => {
      assert.ok(e instanceof LevelError, String(e));
      assert.equal(e.line, line, text);
      assert.equal(e.col, col, text);
      assert.match(e.message, msg);
      assert.match(e.message, new RegExp(`^line ${line}, column ${col}: `));
      return true;
    });
  }
});

test('every piece has a distinct legend character and a sprite on the list', () => {
  const chars = [...Object.values(TERRAIN).map(t => t.char), ...Object.values(OBJECTS).map(o => o.char), 'P', 'M'];
  assert.equal(new Set(chars).size, chars.length);
  for (const t of Object.values(TERRAIN)) for (const s of t.sprites) assert.ok(SPRITE_NAMES.includes(s), s);
  for (const o of Object.values(OBJECTS)) assert.ok(SPRITE_NAMES.includes(o.sprite), o.sprite);
  for (const fig of ['theseus', 'minotaur', 'minotaur-stone', 'cow-standing']) assert.ok(SPRITE_NAMES.includes(fig), fig);
});
```

- [ ] **Step 2: Run it to see it fail**

Run (from `websites/www.cs/games`): `node --test crete/test/puzzle-level.test.ts`
Expected: FAIL, `Cannot find module '../src/puzzle/level.ts'`.

- [ ] **Step 3: Write tiles.ts**

```ts
// websites/www.cs/games/crete/src/puzzle/tiles.ts
/* The Island of Crete: the puzzle's pieces as data. Each terrain and object, the
 * character the level text uses for it, who may enter it, and the sprites the
 * board draws. DOM-free. */
export interface Cell { readonly r: number; readonly c: number }

export type Dir = 'up' | 'down' | 'left' | 'right';
export const DIRS: readonly Dir[] = ['up', 'down', 'left', 'right'];
export const DELTA: Record<Dir, readonly [number, number]> = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };

export type KeyColor = 'red' | 'blue' | 'yellow' | 'green';
export const KEY_COLORS: readonly KeyColor[] = ['red', 'blue', 'yellow', 'green'];

export type Gear = 'flippers' | 'fire-boots' | 'skates' | 'suction';
export const GEAR: readonly Gear[] = ['flippers', 'fire-boots', 'skates', 'suction'];

export type Tool = 'mirror' | 'cake' | 'cow';
export const TOOLS: Record<Tool, { name: string; key: string; desc: string }> = {
  mirror: { name: "Medusa's mirror", key: 'Z', desc: 'Turns the Minotaur to stone for 3 turns; stone blocks everyone.' },
  cake: { name: 'Honey cake', key: 'X', desc: 'Gives back one heart.' },
  cow: { name: "Daedalus's cow", key: 'C', desc: 'Set down where you stand; the Minotaur goes for it first.' },
};

export type Terrain =
  | 'floor' | 'wall' | 'exit' | 'gate' | 'water' | 'fire' | 'ice'
  | 'force-up' | 'force-down' | 'force-left' | 'force-right'
  | 'dirt' | 'safe' | 'button' | 'toggle-open' | 'toggle-closed'
  | 'door-red' | 'door-blue' | 'door-yellow' | 'door-green';

export interface TerrainDef {
  char: string;
  /** The sprites it can show: the gate's first is closed, its second open. */
  sprites: readonly string[];
  /** The Minotaur may stand on it. */
  minotaur: boolean;
  /** A pushed block may enter it. */
  block: boolean;
  /** Gear the player needs to enter it. */
  needs?: Gear;
  /** It slides whoever enters, unless the player wears this gear. */
  slides?: Gear;
  /** It carries whoever enters this way, unless the player wears suction boots. */
  carries?: Dir;
  /** A door: the key colour that opens it. */
  door?: KeyColor;
}

const t = (char: string, minotaur: boolean, block: boolean, more: Partial<TerrainDef> = {}, sprites?: string[]) =>
  ({ char, minotaur, block, ...more, sprites: sprites ?? [] });

export const TERRAIN: Record<Terrain, TerrainDef> = {
  floor: t('.', true, true, {}, ['floor']),
  wall: t('#', false, false, {}, ['wall']),
  exit: t('E', false, false, {}, ['exit']),
  gate: t('|', false, false, {}, ['gate-closed', 'gate-open']),
  water: t('~', false, true, { needs: 'flippers' }, ['water']),
  fire: t('F', false, false, { needs: 'fire-boots' }, ['fire']),
  ice: t('=', true, true, { slides: 'skates' }, ['ice']),
  'force-up': t('^', true, true, { carries: 'up' }, ['force-up']),
  'force-down': t('v', true, true, { carries: 'down' }, ['force-down']),
  'force-left': t('<', true, true, { carries: 'left' }, ['force-left']),
  'force-right': t('>', true, true, { carries: 'right' }, ['force-right']),
  dirt: t('%', true, true, {}, ['dirt']),
  safe: t('S', false, false, {}, ['safe']),
  button: t('_', true, true, {}, ['button']),
  'toggle-open': t('t', true, false, {}, ['toggle-open']),
  'toggle-closed': t('T', false, false, {}, ['toggle-closed']),
  'door-red': t('R', false, false, { door: 'red' }, ['door-red']),
  'door-blue': t('B', false, false, { door: 'blue' }, ['door-blue']),
  'door-yellow': t('Y', false, false, { door: 'yellow' }, ['door-yellow']),
  'door-green': t('G', false, false, { door: 'green' }, ['door-green']),
};

export type ObjectKind = 'relic' | `key-${KeyColor}` | Gear | Tool | 'page' | 'block';

export const OBJECTS: Record<ObjectKind, { char: string; sprite: string; name: string }> = {
  relic: { char: '*', sprite: 'relic', name: 'relic' },
  'key-red': { char: 'r', sprite: 'key-red', name: 'red key' },
  'key-blue': { char: 'b', sprite: 'key-blue', name: 'blue key' },
  'key-yellow': { char: 'y', sprite: 'key-yellow', name: 'yellow key' },
  'key-green': { char: 'g', sprite: 'key-green', name: 'green key' },
  flippers: { char: 'f', sprite: 'flippers', name: 'flippers' },
  'fire-boots': { char: 'h', sprite: 'fire-boots', name: 'fire boots' },
  skates: { char: 'k', sprite: 'skates', name: 'skates' },
  suction: { char: 'u', sprite: 'suction', name: 'suction boots' },
  mirror: { char: 'z', sprite: 'mirror', name: TOOLS.mirror.name },
  cake: { char: 'x', sprite: 'cake', name: TOOLS.cake.name },
  cow: { char: 'c', sprite: 'cow', name: TOOLS.cow.name },
  page: { char: 'p', sprite: 'page', name: 'story page' },
  block: { char: 'O', sprite: 'block', name: 'block' },
};

/** The figures: drawn over the grid, never part of it. */
export const FIGURE_SPRITES = ['theseus', 'minotaur', 'minotaur-stone', 'cow-standing'] as const;

/** Every sprite the board can ask the atlas for. */
export const SPRITE_NAMES: readonly string[] = [
  ...new Set([
    ...Object.values(TERRAIN).flatMap(d => d.sprites),
    ...Object.values(OBJECTS).map(o => o.sprite),
    ...FIGURE_SPRITES,
  ]),
];
```

- [ ] **Step 4: Write level.ts**

```ts
// websites/www.cs/games/crete/src/puzzle/level.ts
/* The Island of Crete: the level text. A header of `name: value` lines, a blank
 * line, then the grid, one legend character per cell (src/puzzle/tiles.ts).
 * `parse` reports a bad level by line and column; `serialize` writes the
 * canonical text back. The level editor writes this format. DOM-free. */
import { TERRAIN, OBJECTS } from './tiles.ts';
import type { Cell, Terrain, ObjectKind } from './tiles.ts';

export interface Level {
  readonly title: string;
  readonly intro: string;
  /** Hearts at the start, and the most a honey cake gives back to. */
  readonly hearts: number;
  /** Relics to take before the gate opens. */
  readonly relics: number;
  readonly rows: number;
  readonly cols: number;
  /** Row-major, `rows * cols` long. */
  readonly terrain: readonly Terrain[];
  readonly objects: readonly (ObjectKind | null)[];
  readonly player: Cell;
  readonly minotaur: Cell | null;
}

export class LevelError extends Error {
  readonly line: number;
  readonly col: number;
  constructor(line: number, col: number, what: string) {
    super(`line ${line}, column ${col}: ${what}`);
    this.line = line;
    this.col = col;
  }
}

const TERRAIN_BY_CHAR = new Map(Object.entries(TERRAIN).map(([k, d]) => [d.char, k as Terrain]));
const OBJECT_BY_CHAR = new Map(Object.entries(OBJECTS).map(([k, d]) => [d.char, k as ObjectKind]));
const HEADER = /^([a-z]+): (.*)$/;
const NAMES = ['title', 'intro', 'hearts', 'relics'] as const;
type Name = typeof NAMES[number];

export function parse(text: string): Level {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const head: Partial<Record<Name, { value: string; line: number; col: number }>> = {};
  let i = 0;
  for (; i < lines.length; i++) {
    const m = HEADER.exec(lines[i]!);
    if (!m) break;
    if (!(NAMES as readonly string[]).includes(m[1]!)) throw new LevelError(i + 1, 1, `unknown header '${m[1]}'`);
    head[m[1] as Name] = { value: m[2]!, line: i + 1, col: m[1]!.length + 3 };
  }
  while (i < lines.length && lines[i] === '') i++;
  const first = i;
  const rows: string[] = [];
  for (; i < lines.length && lines[i] !== ''; i++) rows.push(lines[i]!);
  if (rows.length === 0) throw new LevelError(first + 1, 1, 'no grid');
  const cols = rows[0]!.length;
  const terrain: Terrain[] = [];
  const objects: (ObjectKind | null)[] = [];
  let player: Cell | null = null;
  let minotaur: Cell | null = null;
  let relicsOnGrid = 0;
  rows.forEach((row, r) => {
    const line = first + r + 1;
    if (row.length !== cols) throw new LevelError(line, 1, `row is ${row.length} wide, expected ${cols}`);
    [...row].forEach((ch, c) => {
      const col = c + 1;
      if (ch === 'P' || ch === 'M') {
        if (ch === 'P' && player) throw new LevelError(line, col, 'second player');
        if (ch === 'M' && minotaur) throw new LevelError(line, col, 'second Minotaur');
        if (ch === 'P') player = { r, c }; else minotaur = { r, c };
        terrain.push('floor');
        objects.push(null);
        return;
      }
      const tk = TERRAIN_BY_CHAR.get(ch);
      const ok = OBJECT_BY_CHAR.get(ch);
      if (!tk && !ok) throw new LevelError(line, col, `unknown tile '${ch}'`);
      terrain.push(tk ?? 'floor');
      objects.push(ok ?? null);
      if (ok === 'relic') relicsOnGrid++;
    });
  });
  if (!player) throw new LevelError(first + 1, 1, 'no player');
  const num = (name: 'hearts' | 'relics', fallback: number, min: number, max: number): number => {
    const h = head[name];
    if (!h) return fallback;
    const n = Number(h.value);
    if (!Number.isInteger(n) || n < min) throw new LevelError(h.line, h.col, `${name} must be ${min} to ${max}`);
    if (n > max) {
      const why = name === 'relics' ? `relics: ${h.value} but the grid has ${max}` : `${name} must be ${min} to ${max}`;
      throw new LevelError(h.line, h.col, why);
    }
    return n;
  };
  const hearts = num('hearts', 3, 1, 99);
  const relics = num('relics', relicsOnGrid, 0, relicsOnGrid);
  return {
    title: head.title?.value ?? '', intro: head.intro?.value ?? '', hearts, relics,
    rows: rows.length, cols, terrain, objects, player, minotaur,
  };
}

export function serialize(lv: Level): string {
  const relicsOnGrid = lv.objects.filter(o => o === 'relic').length;
  const head = [`title: ${lv.title}`, `intro: ${lv.intro}`];
  if (lv.hearts !== 3) head.push(`hearts: ${lv.hearts}`);
  if (lv.relics !== relicsOnGrid) head.push(`relics: ${lv.relics}`);
  const grid: string[] = [];
  for (let r = 0; r < lv.rows; r++) {
    let row = '';
    for (let c = 0; c < lv.cols; c++) {
      const i = r * lv.cols + c;
      if (lv.player.r === r && lv.player.c === c) row += 'P';
      else if (lv.minotaur && lv.minotaur.r === r && lv.minotaur.c === c) row += 'M';
      else row += lv.objects[i] ? OBJECTS[lv.objects[i]!].char : TERRAIN[lv.terrain[i]!].char;
    }
    grid.push(row);
  }
  return `${head.join('\n')}\n\n${grid.join('\n')}\n`;
}
```

- [ ] **Step 5: Add both files to `crete/tsconfig.json` `files`** (keep the existing entries; append `"src/puzzle/tiles.ts", "src/puzzle/level.ts"`).

- [ ] **Step 6: Run the tests and the type check**

Run (from `websites/www.cs/games`): `node --test crete/test/puzzle-level.test.ts && node _kit/build/build.mjs crete --check`
Expected: PASS, and the build check reports no change to `dist/`.

- [ ] **Step 7: Commit**

```bash
git add websites/www.cs/games/crete/src/puzzle websites/www.cs/games/crete/test/puzzle-level.test.ts websites/www.cs/games/crete/tsconfig.json
git commit -m "Crete engine: the pieces and the level text"
```

### Task 2: State and the player's turn

**Files:**
- Create: `websites/www.cs/games/crete/src/puzzle/state.ts`
- Create: `websites/www.cs/games/crete/src/puzzle/work.ts`
- Create: `websites/www.cs/games/crete/src/puzzle/step.ts`
- Create: `websites/www.cs/games/crete/test/puzzle-grid.ts` (test helper)
- Modify: `websites/www.cs/games/crete/tsconfig.json` (add both sources)
- Test: `websites/www.cs/games/crete/test/puzzle-step.test.ts`

**Interfaces:**
- Consumes: Task 1's `Level`, `parse`, `TERRAIN`, `DELTA`, `Cell`, `Dir`, `Gear`, `KeyColor`, `Tool`, `ObjectKind`.
- Produces (state.ts): `Outcome`, `State`, `initial(level: Level): State`, `index(s: { level: Level }, cell: Cell): number`, `inside(level: Level, cell: Cell): boolean`, `terrainAt(s: State, cell: Cell): Terrain` (`'wall'` outside), `same(a: Cell, b: Cell | null): boolean`, `next(cell: Cell, d: Dir): Cell`, `gateOpen(s: State): boolean`.
- Produces (work.ts): `Action`, `GameEvent`, `Work` (the mutable copy one turn edits), `work(s: State): Work`, `tAt(w: Work, x: Cell): Terrain`, `oAt(w: Work, x: Cell): ObjectKind | null`. Task 3's `minotaur.ts` imports these, so step.ts and minotaur.ts never import each other in a cycle.
- Produces (step.ts): `step(s: State, a: Action): StepResult`, `StepResult { state: State; events: GameEvent[] }`, and re-exports `Action`, `GameEvent`. A bump returns `{ state: s, events: [] }` with the **same** state object.

- [ ] **Step 1: Write the helper and the failing test**

```ts
// websites/www.cs/games/crete/test/puzzle-grid.ts
// Builds a try from grid rows alone, for the rule tests. Not a test file.
import { parse } from '../src/puzzle/level.ts';
import { initial } from '../src/puzzle/state.ts';
import type { State } from '../src/puzzle/state.ts';
import { step } from '../src/puzzle/step.ts';
import type { Action } from '../src/puzzle/step.ts';
import type { Dir } from '../src/puzzle/tiles.ts';

export function grid(rows: string[], header = ''): State {
  return initial(parse(`title: t\nintro: i\n${header}\n${rows.join('\n')}\n`));
}
export const mv = (dir: Dir): Action => ({ kind: 'move', dir });
export const WAIT: Action = { kind: 'wait' };
/** Plays the actions in order and returns the last result with every event seen. */
export function play(s: State, ...actions: Action[]) {
  const events = [];
  let state = s;
  for (const a of actions) {
    const r = step(state, a);
    state = r.state;
    events.push(...r.events);
  }
  return { state, events, kinds: events.map(e => e.kind) };
}
```

```ts
// websites/www.cs/games/crete/test/puzzle-step.test.ts
// The player's half of a turn, with no Minotaur on the grid: moving and bumping, keys and doors,
// relics, the gate and the exit, gear, ice and force floors, blocks, buttons and safe zones.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { step } from '../src/puzzle/step.ts';
import { terrainAt } from '../src/puzzle/state.ts';
import { grid, mv, play } from './puzzle-grid.ts';

test('a move takes a turn; a bump returns the same state and costs nothing', () => {
  const s = grid(['P.#']);
  const a = step(s, mv('right'));
  assert.deepEqual(a.state.player, { r: 0, c: 1 });
  assert.equal(a.state.moves, 1);
  assert.deepEqual(a.events.map(e => e.kind), ['moved']);
  const b = step(a.state, mv('right'));
  assert.equal(b.state, a.state);
  assert.deepEqual(b.events, []);
  assert.equal(step(s, mv('up')).state, s, 'the grid edge is a wall');
});

test('a coloured key opens its door and is used up; a green key opens every green door', () => {
  const red = play(grid(['PrR.']), mv('right'), mv('right'));
  assert.deepEqual(red.state.player, { r: 0, c: 2 });
  assert.equal(terrainAt(red.state, { r: 0, c: 2 }), 'floor');
  assert.equal(red.state.keys.red, 0);
  assert.deepEqual(red.kinds, ['moved', 'took', 'opened', 'moved']);
  const green = play(grid(['PgGG.']), mv('right'), mv('right'), mv('right'));
  assert.deepEqual(green.state.player, { r: 0, c: 3 });
  assert.equal(green.state.keys.green, 1);
  const s = grid(['PR']);
  assert.equal(step(s, mv('right')).state, s, 'no key, no way through');
});

test('the gate opens when every relic is taken, and the exit wins only then', () => {
  const s = grid(['P*|E']);
  assert.equal(s.relicsLeft, 1);
  const won = play(s, mv('right'), mv('right'), mv('right'));
  assert.equal(won.state.outcome, 'won');
  assert.ok(won.kinds.includes('won'));
  const shut = grid(['P|*']);
  assert.equal(step(shut, mv('right')).state, shut, 'the closed gate is a bump');
  const early = play(grid(['PE*']), mv('right'));
  assert.equal(early.state.outcome, 'playing', 'the exit before the relics is only a cell');
  assert.equal(play(grid(['P|E']), mv('right'), mv('right')).state.outcome, 'won', 'no relics: the gate is open');
});

test('water and fire turn you back without their gear and let you through with it', () => {
  for (const [rows, gear] of [[['P~.'], 'f'], [['PF.'], 'h']] as const) {
    const s = grid(rows);
    assert.equal(step(s, mv('right')).state, s);
    const geared = play(grid([`P${gear}${rows[0].slice(1)}`]), mv('right'), mv('right'), mv('right'));
    assert.deepEqual(geared.state.player, { r: 0, c: 3 });
  }
});

test('ice slides you on until you leave it or meet something; skates stop the slide', () => {
  assert.deepEqual(play(grid(['P===.#']), mv('right')).state.player, { r: 0, c: 4 });
  assert.deepEqual(play(grid(['P==#']), mv('right')).state.player, { r: 0, c: 2 });
  const r = play(grid(['P==O.']), mv('right'));
  assert.deepEqual(r.state.player, { r: 0, c: 2 }, 'a slide never pushes a block');
  assert.ok(r.kinds.includes('slid'));
  assert.deepEqual(play(grid(['Pk==.']), mv('right'), mv('right')).state.player, { r: 0, c: 2 });
});

test('a force floor carries you along its chain; suction boots stand still on it', () => {
  assert.deepEqual(play(grid(['P>>.', '....']), mv('right')).state.player, { r: 0, c: 3 });
  assert.deepEqual(play(grid(['Pv.', '.v.', '.#.']), mv('down')).state.player, { r: 1, c: 0 }, 'not this column');
  assert.deepEqual(play(grid(['P.', 'v.', 'v.', '#.']), mv('down')).state.player, { r: 2, c: 0 });
  assert.deepEqual(play(grid(['Pu>>.']), mv('right'), mv('right')).state.player, { r: 0, c: 2 });
});

test('a force-floor loop stops on the last new cell, and you can walk off it', () => {
  const r = play(grid(['P>v', '.^<']), mv('right'));
  assert.equal(r.state.outcome, 'playing');
  assert.deepEqual(r.state.player, { r: 1, c: 1 });
  assert.deepEqual(play(r.state, mv('left')).state.player, { r: 1, c: 0 });
});

test('a block is pushed one cell; it sinks in water, slides on ice and presses a button', () => {
  const push = play(grid(['PO.']), mv('right'));
  assert.deepEqual(push.state.player, { r: 0, c: 1 });
  assert.equal(push.state.objects[2], 'block');
  assert.ok(push.kinds.includes('pushed'));
  for (const rows of [['PO#'], ['POO.'], ['PO*.'], ['POF.'], ['POS.'], ['POE.']]) {
    const s = grid(rows);
    assert.equal(step(s, mv('right')).state, s, rows[0]);
  }
  const sink = play(grid(['PO~.']), mv('right'));
  assert.equal(terrainAt(sink.state, { r: 0, c: 2 }), 'dirt');
  assert.equal(sink.state.objects[2], null);
  assert.ok(sink.kinds.includes('sank'));
  assert.equal(play(grid(['PO==.']), mv('right')).state.objects[4], 'block');
  const press = play(grid(['PO_T.']), mv('right'));
  assert.equal(terrainAt(press.state, { r: 0, c: 3 }), 'toggle-open');
  assert.ok(press.kinds.includes('flipped'));
});

test('stepping on a button flips every toggle wall; a closed one is a wall', () => {
  const s = grid(['P_T.', '..t.']);
  const r = play(s, mv('right'));
  assert.equal(terrainAt(r.state, { r: 0, c: 2 }), 'toggle-open');
  assert.equal(terrainAt(r.state, { r: 1, c: 2 }), 'toggle-closed');
  assert.deepEqual(play(r.state, mv('right'), mv('right')).state.player, { r: 0, c: 3 });
});

test('things are taken by walking onto them, and a safe zone becomes the throw-back cell', () => {
  const r = play(grid(['Pfhkuzxcp*S']), ...Array(10).fill(mv('right')));
  assert.deepEqual([...r.state.gear].sort(), ['fire-boots', 'flippers', 'skates', 'suction']);
  assert.deepEqual(r.state.tools, { mirror: 1, cake: 1, cow: 1 });
  assert.equal(r.state.pages, 1);
  assert.equal(r.state.relicsLeft, 0);
  assert.deepEqual(r.state.throwBack, { r: 0, c: 10 });
});

test('a step never changes the state it was given', () => {
  const s = grid(['PO~rR.']);
  const before = JSON.stringify(s);
  play(s, mv('right'), mv('right'));
  assert.equal(JSON.stringify(s), before);
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test crete/test/puzzle-step.test.ts`
Expected: FAIL, `Cannot find module '../src/puzzle/state.ts'`.

- [ ] **Step 3: Write state.ts**

```ts
// websites/www.cs/games/crete/src/puzzle/state.ts
/* The Island of Crete: the state of one try at a level. Immutable: a turn
 * (src/puzzle/step.ts) returns a new state and never edits the one it was
 * given. DOM-free. */
import { DELTA } from './tiles.ts';
import type { Cell, Dir, Gear, KeyColor, ObjectKind, Terrain, Tool } from './tiles.ts';
import type { Level } from './level.ts';

export type Outcome = 'playing' | 'won' | 'lost';

export interface State {
  readonly level: Level;
  readonly terrain: readonly Terrain[];
  readonly objects: readonly (ObjectKind | null)[];
  readonly player: Cell;
  readonly hearts: number;
  readonly keys: Readonly<Record<KeyColor, number>>;
  /** Gear held, each once, in the order taken. */
  readonly gear: readonly Gear[];
  readonly tools: Readonly<Record<Tool, number>>;
  readonly pages: number;
  /** Where a catch throws the player: the last safe zone stood on, or the start. */
  readonly throwBack: Cell;
  readonly minotaur: Cell | null;
  /** Minotaur turns left as stone. */
  readonly stone: number;
  /** Where Daedalus's cow stands, while it stands. */
  readonly cow: Cell | null;
  readonly relicsLeft: number;
  readonly moves: number;
  readonly outcome: Outcome;
}

export function initial(level: Level): State {
  return {
    level,
    terrain: level.terrain,
    objects: level.objects,
    player: level.player,
    hearts: level.hearts,
    keys: { red: 0, blue: 0, yellow: 0, green: 0 },
    gear: [],
    tools: { mirror: 0, cake: 0, cow: 0 },
    pages: 0,
    throwBack: level.player,
    minotaur: level.minotaur,
    stone: 0,
    cow: null,
    relicsLeft: level.relics,
    moves: 0,
    outcome: 'playing',
  };
}

export const inside = (lv: Level, x: Cell): boolean => x.r >= 0 && x.c >= 0 && x.r < lv.rows && x.c < lv.cols;
export const index = (s: { level: Level }, x: Cell): number => x.r * s.level.cols + x.c;
export const terrainAt = (s: State, x: Cell): Terrain => (inside(s.level, x) ? s.terrain[index(s, x)]! : 'wall');
export const same = (a: Cell, b: Cell | null): boolean => !!b && a.r === b.r && a.c === b.c;
export const next = (x: Cell, d: Dir): Cell => ({ r: x.r + DELTA[d][0], c: x.c + DELTA[d][1] });
export const gateOpen = (s: Pick<State, 'relicsLeft'>): boolean => s.relicsLeft === 0;
```

- [ ] **Step 4: Write work.ts and step.ts (the player's half; Task 3 adds the Minotaur's)**

```ts
// websites/www.cs/games/crete/src/puzzle/work.ts
/* The Island of Crete: the vocabulary of a turn. The actions, the events a
 * turn reports, and the working copy a turn edits before it is frozen into
 * the next state. DOM-free. */
import type { Cell, Dir, Gear, KeyColor, ObjectKind, Terrain, Tool } from './tiles.ts';
import { index, inside } from './state.ts';
import type { State } from './state.ts';

export type Action = { kind: 'move'; dir: Dir } | { kind: 'wait' } | { kind: 'tool'; tool: Tool };

export type GameEvent =
  | { kind: 'moved'; who: 'player' | 'minotaur'; from: Cell; to: Cell }
  | { kind: 'slid'; who: 'player' | 'minotaur' | 'block'; from: Cell; to: Cell }
  | { kind: 'pushed'; from: Cell; to: Cell }
  | { kind: 'opened'; color: KeyColor; at: Cell }
  | { kind: 'took'; what: ObjectKind; at: Cell }
  | { kind: 'sank'; at: Cell }
  | { kind: 'flipped' }
  | { kind: 'caught'; at: Cell; hearts: number }
  | { kind: 'stoned'; turns: number }
  | { kind: 'won' }
  | { kind: 'lost' };

type Mutable<T> = { -readonly [K in keyof T]: T[K] };
export interface Work extends Mutable<Omit<State, 'terrain' | 'objects' | 'keys' | 'tools' | 'gear'>> {
  terrain: Terrain[];
  objects: (ObjectKind | null)[];
  keys: Record<KeyColor, number>;
  tools: Record<Tool, number>;
  gear: Gear[];
}

export const work = (s: State): Work => ({
  ...s, terrain: [...s.terrain], objects: [...s.objects], keys: { ...s.keys }, tools: { ...s.tools }, gear: [...s.gear],
});
export const tAt = (w: Work, x: Cell): Terrain => (inside(w.level, x) ? w.terrain[index(w, x)]! : 'wall');
export const oAt = (w: Work, x: Cell): ObjectKind | null => (inside(w.level, x) ? w.objects[index(w, x)]! : null);
```

```ts
// websites/www.cs/games/crete/src/puzzle/step.ts
/* The Island of Crete: one turn. `step(state, action)` plays the player's
 * action and then the Minotaur's two steps, and returns the new state and
 * what happened, for the log, the sounds and the board's animation. A bump
 * (an action that cannot happen) returns the same state object and no
 * events, and costs no turn. DOM-free. */
import { TERRAIN } from './tiles.ts';
import type { Cell, Dir, Gear, KeyColor } from './tiles.ts';
import { index, inside, same, next, gateOpen } from './state.ts';
import type { State } from './state.ts';
import { work, tAt, oAt } from './work.ts';
import type { Action, GameEvent, Work } from './work.ts';

export type { Action, GameEvent } from './work.ts';
export interface StepResult { state: State; events: GameEvent[] }

function flip(w: Work, ev: GameEvent[]): void {
  w.terrain = w.terrain.map(t => (t === 'toggle-open' ? 'toggle-closed' : t === 'toggle-closed' ? 'toggle-open' : t));
  ev.push({ kind: 'flipped' });
}

/** A pushed block may enter this cell. */
function blockMayEnter(w: Work, x: Cell): boolean {
  return inside(w.level, x) && TERRAIN[tAt(w, x)].block && !oAt(w, x)
    && !same(x, w.player) && !same(x, w.minotaur) && !same(x, w.cow);
}

/** A block has just entered `at` heading `d`: it sinks, presses, slides or is carried. */
function settleBlock(w: Work, at: Cell, d: Dir, ev: GameEvent[]): void {
  let here = at;
  let dir = d;
  const seen = new Set<number>([index(w, here)]);
  for (;;) {
    const t = tAt(w, here);
    if (t === 'water') {
      w.objects[index(w, here)] = null;
      w.terrain[index(w, here)] = 'dirt';
      ev.push({ kind: 'sank', at: here });
      return;
    }
    if (t === 'button') flip(w, ev);
    const def = TERRAIN[t];
    if (def.carries) dir = def.carries;
    else if (!def.slides) return;
    const to = next(here, dir);
    if (!blockMayEnter(w, to) || seen.has(index(w, to))) return;
    w.objects[index(w, here)] = null;
    w.objects[index(w, to)] = 'block';
    ev.push({ kind: 'slid', who: 'block', from: here, to });
    seen.add(index(w, to));
    here = to;
  }
}

/** Whether the player may enter `to` heading `d`. When they may, a door on the way opens and a block is pushed
 *  (never while riding ice or a force floor). Every refusal happens before anything is changed. */
function enterAsPlayer(w: Work, to: Cell, d: Dir, riding: boolean, ev: GameEvent[]): boolean {
  if (!inside(w.level, to) || same(to, w.minotaur)) return false;
  const t = tAt(w, to);
  const def = TERRAIN[t];
  if (t === 'wall' || t === 'toggle-closed') return false;
  if (t === 'gate' && !gateOpen(w)) return false;
  if (def.needs && !w.gear.includes(def.needs)) return false;
  if (def.door && w.keys[def.door] <= 0) return false;
  const pushing = oAt(w, to) === 'block';
  if (pushing && (riding || !blockMayEnter(w, next(to, d)))) return false;
  if (def.door) {
    if (def.door !== 'green') w.keys[def.door]--;
    w.terrain[index(w, to)] = 'floor';
    ev.push({ kind: 'opened', color: def.door, at: to });
  }
  if (pushing) {
    const beyond = next(to, d);
    w.objects[index(w, to)] = null;
    w.objects[index(w, beyond)] = 'block';
    ev.push({ kind: 'pushed', from: to, to: beyond });
    settleBlock(w, beyond, d, ev);
  }
  return true;
}

/** The player is on `at`: take what lies there, press, mark the safe zone, win. */
function arrive(w: Work, at: Cell, ev: GameEvent[]): void {
  w.player = at;
  const o = oAt(w, at);
  if (o && o !== 'block') {
    w.objects[index(w, at)] = null;
    ev.push({ kind: 'took', what: o, at });
    if (o === 'relic') w.relicsLeft--;
    else if (o === 'page') w.pages++;
    else if (o.startsWith('key-')) w.keys[o.slice(4) as KeyColor]++;
    else if (o === 'mirror' || o === 'cake' || o === 'cow') w.tools[o]++;
    else if (!w.gear.includes(o as Gear)) w.gear.push(o as Gear);
  }
  const t = tAt(w, at);
  if (t === 'safe') w.throwBack = at;
  if (t === 'button') flip(w, ev);
  if (t === 'exit' && gateOpen(w)) {
    w.outcome = 'won';
    ev.push({ kind: 'won' });
  }
}

/** Ice and force floors under the player move them on, until the ride ends or would cross itself. */
function ridePlayer(w: Work, d: Dir, ev: GameEvent[]): void {
  let dir = d;
  const seen = new Set<number>([index(w, w.player)]);
  while (w.outcome === 'playing') {
    const def = TERRAIN[tAt(w, w.player)];
    if (def.carries && !w.gear.includes('suction')) dir = def.carries;
    else if (!def.slides || w.gear.includes(def.slides)) return;
    const to = next(w.player, dir);
    if (seen.has(index(w, to)) || !enterAsPlayer(w, to, dir, true, ev)) return;
    ev.push({ kind: 'slid', who: 'player', from: w.player, to });
    seen.add(index(w, to));
    arrive(w, to, ev);
  }
}

export function step(s: State, a: Action): StepResult {
  if (s.outcome !== 'playing') return { state: s, events: [] };
  const w = work(s);
  const ev: GameEvent[] = [];
  if (a.kind === 'move') {
    const from = w.player;
    const to = next(from, a.dir);
    if (!enterAsPlayer(w, to, a.dir, false, ev)) return { state: s, events: [] };
    ev.push({ kind: 'moved', who: 'player', from, to });
    arrive(w, to, ev);
    ridePlayer(w, a.dir, ev);
  } else if (a.kind === 'tool') {
    return { state: s, events: [] }; // Task 3 adds the tools.
  }
  w.moves++;
  return { state: w, events: ev };
}
```

The order of events in one move is: `opened` or `pushed` (and what the block did), then `moved`, then `took` / `flipped` / `won` on arrival, then each `slid` with its own arrivals.

- [ ] **Step 5: Add `src/puzzle/state.ts`, `src/puzzle/work.ts` and `src/puzzle/step.ts` to `crete/tsconfig.json` `files`.**

- [ ] **Step 6: Run the tests**

Run: `node --test crete/test/puzzle-step.test.ts crete/test/puzzle-level.test.ts && node _kit/build/build.mjs crete --check`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add websites/www.cs/games/crete
git commit -m "Crete engine: the player's turn"
```

### Task 3: The Minotaur, catches, hearts and the three tools

**Files:**
- Create: `websites/www.cs/games/crete/src/puzzle/minotaur.ts`
- Modify: `websites/www.cs/games/crete/src/puzzle/step.ts` (import the phase; tools)
- Modify: `websites/www.cs/games/crete/tsconfig.json`
- Test: `websites/www.cs/games/crete/test/puzzle-minotaur.test.ts`

**Interfaces:**
- Consumes: `Work`, `GameEvent`, `tAt`, `oAt` from work.ts; `next`, `same`, `index`, `inside` from state.ts; `TERRAIN`.
- Produces: `minotaurPhase(w: Work, ev: GameEvent[]): void`, `minotaurStep(w: Work, ev: GameEvent[]): boolean`, `minotaurMayEnter(w: Work, x: Cell): boolean`. `step` handles `{ kind: 'tool' }`.

- [ ] **Step 1: Write the failing test**

```ts
// websites/www.cs/games/crete/test/puzzle-minotaur.test.ts
// The Minotaur's rule (two steps, the horizontal gap first, else the vertical, else stay), what stops it,
// catches and the throw-back, hearts, and the three tools.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { step } from '../src/puzzle/step.ts';
import { terrainAt } from '../src/puzzle/state.ts';
import { grid, mv, play, WAIT } from './puzzle-grid.ts';

const tool = (t: 'mirror' | 'cake' | 'cow') => ({ kind: 'tool', tool: t }) as const;

test('it closes the horizontal gap first, then the vertical', () => {
  const r = play(grid(['M..', '...', '..P']), WAIT);
  assert.deepEqual(r.state.minotaur, { r: 0, c: 2 });
  assert.deepEqual(play(r.state, WAIT).state.player, { r: 2, c: 2 });
});

test('a wall across the horizontal sends it down; walls both ways hold it', () => {
  assert.deepEqual(play(grid(['M#.', '...', '..P']), WAIT).state.minotaur, { r: 1, c: 1 });
  assert.deepEqual(play(grid(['.#.', 'M#P', '.#.']), WAIT).state.minotaur, { r: 1, c: 0 });
});

test('walls, blocks, closed doors and toggles, water, fire, safe zones, the exit and the gate stop it', () => {
  for (const ch of ['#', 'O', 'R', 'T', '~', 'F', 'S', 'E', '|']) {
    const r = play(grid([`M${ch}..P`]), WAIT);
    assert.deepEqual(r.state.minotaur, { r: 0, c: 0 }, ch);
  }
});

test('it walks over things without taking them, slides on ice and does not press buttons', () => {
  const over = play(grid(['M*..P']), WAIT);
  assert.deepEqual(over.state.minotaur, { r: 0, c: 2 });
  assert.equal(over.state.objects[1], 'relic');
  assert.deepEqual(play(grid(['M=...P']), WAIT).state.minotaur, { r: 0, c: 3 }, 'ice carries it one cell further');
  const btn = play(grid(['M_..P', 'T....']), WAIT);
  assert.deepEqual(btn.state.minotaur, { r: 0, c: 2 });
  assert.equal(terrainAt(btn.state, { r: 1, c: 0 }), 'toggle-closed');
});

test('a catch costs a heart and throws you back to your last safe zone; it stays put', () => {
  const s = grid(['PS...', '.....', '....M']);
  const r = play(s, mv('right'), mv('right'));
  assert.equal(r.state.hearts, 2);
  assert.deepEqual(r.state.player, { r: 0, c: 1 });
  assert.deepEqual(r.state.minotaur, { r: 0, c: 2 });
  assert.ok(r.kinds.includes('caught'));
  assert.equal(r.state.outcome, 'playing');
});

test('caught on the throw-back cell: the Minotaur goes back to its start', () => {
  const r = play(grid(['M.P']), WAIT);
  assert.equal(r.state.hearts, 2);
  assert.deepEqual(r.state.player, { r: 0, c: 2 });
  assert.deepEqual(r.state.minotaur, { r: 0, c: 0 });
});

test('the last heart lost ends the try', () => {
  const r = play(grid(['M.P'], 'hearts: 1'), WAIT);
  assert.equal(r.state.outcome, 'lost');
  assert.ok(r.kinds.includes('lost'));
  assert.equal(step(r.state, WAIT).state, r.state);
});

test('you cannot walk into it; as stone it is a wall to you too', () => {
  const s = grid(['PM.']);
  assert.equal(step(s, mv('right')).state, s);
});

test("Medusa's mirror stones it for its next 3 turns", () => {
  const got = play(grid(['Pz.....M']), mv('right'));
  assert.deepEqual(got.state.minotaur, { r: 0, c: 5 });
  const stoned = play(got.state, tool('mirror'));
  assert.equal(stoned.state.tools.mirror, 0);
  assert.ok(stoned.kinds.includes('stoned'));
  const held = play(stoned.state, WAIT, WAIT);
  assert.deepEqual(held.state.minotaur, { r: 0, c: 5 });
  assert.equal(held.state.stone, 0);
  assert.deepEqual(play(held.state, WAIT).state.minotaur, { r: 0, c: 3 });
  assert.equal(step(got.state, tool('cake')).state, got.state, 'no cake, a bump');
});

test('honey cake gives a heart back, up to the start, and is a bump at full hearts', () => {
  const s = grid(['Px.....M']);
  const got = play(s, mv('right'));
  assert.equal(step(got.state, tool('cake')).state, got.state);
  const hurt = { ...got.state, hearts: 1 };
  const r = play(hurt, tool('cake'));
  assert.equal(r.state.hearts, 2);
  assert.equal(r.state.tools.cake, 0);
});

test("Daedalus's cow draws it first, and is gone when it is reached", () => {
  const s = { ...grid(['.....', 'P...M']), tools: { mirror: 0, cake: 0, cow: 2 } };
  const set = play(s, tool('cow'));
  assert.deepEqual(set.state.cow, { r: 1, c: 0 });
  assert.deepEqual(set.state.minotaur, { r: 1, c: 2 });
  const away = play(set.state, mv('up'));
  assert.deepEqual(away.state.minotaur, { r: 1, c: 0 });
  assert.equal(away.state.cow, null);
  assert.equal(step(set.state, tool('cow')).state, set.state, 'one cow at a time');
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test crete/test/puzzle-minotaur.test.ts`
Expected: FAIL (the Minotaur never moves; tools are bumps).

- [ ] **Step 3: Write minotaur.ts**

```ts
// websites/www.cs/games/crete/src/puzzle/minotaur.ts
/* The Island of Crete: the Minotaur's rule, the one from Theseus and the
 * Minotaur. Each turn it takes two steps toward its target (the cow while one
 * stands, else the player): one cell along the horizontal gap if that cell is
 * open to it, else along the vertical gap, else it stays. It never picks
 * anything up, never presses a button and never dies. DOM-free. */
import { TERRAIN } from './tiles.ts';
import type { Cell, Dir } from './tiles.ts';
import { inside, index, next, same } from './state.ts';
import { tAt, oAt } from './work.ts';
import type { GameEvent, Work } from './work.ts';

export function minotaurMayEnter(w: Work, x: Cell): boolean {
  return inside(w.level, x) && TERRAIN[tAt(w, x)].minotaur && oAt(w, x) !== 'block';
}

/** A catch: a heart lost, the player thrown back, or the try over. */
function caught(w: Work, ev: GameEvent[]): void {
  w.hearts--;
  ev.push({ kind: 'caught', at: w.player, hearts: w.hearts });
  if (w.hearts <= 0) {
    w.outcome = 'lost';
    ev.push({ kind: 'lost' });
    return;
  }
  w.player = w.throwBack;
  if (same(w.player, w.minotaur)) w.minotaur = w.level.minotaur;
}

/** The Minotaur arrives on `to`: the cow is gone, the player is caught. True when the turn's steps end. */
function arrive(w: Work, to: Cell, ev: GameEvent[]): boolean {
  w.minotaur = to;
  if (same(to, w.cow)) w.cow = null;
  if (same(to, w.player)) {
    caught(w, ev);
    return true;
  }
  return false;
}

/** One step. True when the turn's steps end (a catch). */
export function minotaurStep(w: Work, ev: GameEvent[]): boolean {
  const m = w.minotaur;
  if (!m) return true;
  const target = w.cow ?? w.player;
  const dc = Math.sign(target.c - m.c);
  const dr = Math.sign(target.r - m.r);
  const tries: Dir[] = [];
  if (dc) tries.push(dc > 0 ? 'right' : 'left');
  if (dr) tries.push(dr > 0 ? 'down' : 'up');
  const d = tries.find(dir => minotaurMayEnter(w, next(m, dir)));
  if (!d) return false;
  const to = next(m, d);
  ev.push({ kind: 'moved', who: 'minotaur', from: m, to });
  if (arrive(w, to, ev)) return true;
  // Ice and force floors move it on, as they move the player.
  let dir = d;
  const seen = new Set<number>([index(w, to)]);
  for (;;) {
    const def = TERRAIN[tAt(w, w.minotaur!)];
    if (def.carries) dir = def.carries;
    else if (!def.slides) return false;
    const on = next(w.minotaur!, dir);
    if (!minotaurMayEnter(w, on) || seen.has(index(w, on))) return false;
    ev.push({ kind: 'slid', who: 'minotaur', from: w.minotaur!, to: on });
    seen.add(index(w, on));
    if (arrive(w, on, ev)) return true;
  }
}

/** Its turn: a stone turn, or two steps. */
export function minotaurPhase(w: Work, ev: GameEvent[]): void {
  if (!w.minotaur) return;
  if (w.stone > 0) {
    w.stone--;
    return;
  }
  for (let i = 0; i < 2 && w.outcome === 'playing'; i++) if (minotaurStep(w, ev)) return;
}
```

- [ ] **Step 4: Wire it into step.ts and add the tools**

In `step.ts`: add `import { minotaurPhase } from './minotaur.ts';`, put `if (w.outcome === 'playing') minotaurPhase(w, ev);` just before `w.moves++;`, and replace the `else if (a.kind === 'tool')` branch with:

```ts
  } else if (a.kind === 'tool') {
    if (w.tools[a.tool] <= 0) return { state: s, events: [] };
    if (a.tool === 'cake') {
      if (w.hearts >= w.level.hearts) return { state: s, events: [] };
      w.hearts++;
    } else if (a.tool === 'cow') {
      if (w.cow) return { state: s, events: [] };
      w.cow = w.player;
    } else {
      w.stone = 3;
      ev.push({ kind: 'stoned', turns: 3 });
    }
    w.tools[a.tool]--;
  }
```

In `enterAsPlayer`, the `same(to, w.minotaur)` check already makes the Minotaur, stone or not, a bump, and `blockMayEnter` already closes its cell to blocks.

- [ ] **Step 5: Run all puzzle tests**

Run: `node --test crete/test/puzzle-*.test.ts && node _kit/build/build.mjs crete --check`
Expected: PASS. `puzzle-step.test.ts` grids have no `M`, and `minotaurPhase` returns at once when `w.minotaur` is null, so they keep passing.

- [ ] **Step 6: Commit**

```bash
git add websites/www.cs/games/crete
git commit -m "Crete engine: the Minotaur's rule, catches and the tools"
```

### Task 4: Undo, restart and the try

**Files:**
- Create: `websites/www.cs/games/crete/src/puzzle/run.ts`
- Modify: `websites/www.cs/games/crete/tsconfig.json`
- Test: `websites/www.cs/games/crete/test/puzzle-run.test.ts`

**Interfaces:**
- Consumes: `State`, `initial`, `step`, `Action`, `GameEvent`, `Level`.
- Produces: `Run { past: readonly State[]; now: State; assisted: boolean }`, `startRun(level: Level): Run`, `act(run: Run, a: Action): { run: Run; events: GameEvent[] }`, `undo(run: Run): Run`, `restart(run: Run): Run`, `assist(run: Run): Run`.

- [ ] **Step 1: Write the failing test**

```ts
// websites/www.cs/games/crete/test/puzzle-run.test.ts
// A try: undo steps back one turn as far as the start, restart goes back to the start,
// a finished try only undoes or restarts, and help marks the try assisted until it is left.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../src/puzzle/level.ts';
import { startRun, act, undo, restart, assist } from '../src/puzzle/run.ts';
import { mv } from './puzzle-grid.ts';

const lv = (rows: string[], header = '') => parse(`title: t\nintro: i\n${header}\n${rows.join('\n')}\n`);

test('undo steps back one turn; at the start it does nothing', () => {
  const r0 = startRun(lv(['P..E']));
  assert.equal(undo(r0), r0);
  const r1 = act(r0, mv('right')).run;
  const r2 = act(r1, mv('right')).run;
  assert.equal(r2.now.moves, 2);
  assert.equal(undo(r2).now, r1.now);
  assert.equal(undo(undo(r2)).now, r0.now);
});

test('a bump adds nothing to undo', () => {
  const r0 = startRun(lv(['P#']));
  const r = act(r0, mv('right'));
  assert.equal(r.run, r0);
  assert.deepEqual(r.events, []);
});

test('restart goes back to the start and keeps the assisted mark', () => {
  const r = act(assist(startRun(lv(['P..E']))), mv('right')).run;
  const back = restart(r);
  assert.equal(back.now.moves, 0);
  assert.deepEqual(back.past, []);
  assert.equal(back.assisted, true);
});

test('after a win or a loss only undo and restart act', () => {
  const won = act(act(startRun(lv(['P.E'])), mv('right')).run, mv('right')).run;
  assert.equal(won.now.outcome, 'won');
  assert.equal(act(won, mv('left')).run, won);
  assert.equal(undo(won).now.outcome, 'playing');
  const lost = act(startRun(lv(['M.P'], 'hearts: 1')), { kind: 'wait' }).run;
  assert.equal(lost.now.outcome, 'lost');
  assert.equal(act(lost, { kind: 'wait' }).run, lost);
  assert.equal(undo(lost).now.outcome, 'playing');
  assert.equal(restart(lost).now.hearts, 1);
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test crete/test/puzzle-run.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Write run.ts**

```ts
// websites/www.cs/games/crete/src/puzzle/run.ts
/* The Island of Crete: one try at a level, with its undo. Undo is the list of
 * earlier states; restart goes back to the level's start. Any help from
 * Ariadne's thread marks the try assisted, and restart keeps the mark: only
 * opening the trial again clears it. DOM-free. */
import { initial } from './state.ts';
import type { State } from './state.ts';
import { step } from './step.ts';
import type { Action, GameEvent } from './step.ts';
import type { Level } from './level.ts';

export interface Run {
  readonly past: readonly State[];
  readonly now: State;
  readonly assisted: boolean;
}

export const startRun = (level: Level): Run => ({ past: [], now: initial(level), assisted: false });

export function act(run: Run, a: Action): { run: Run; events: GameEvent[] } {
  const r = step(run.now, a);
  if (r.state === run.now) return { run, events: [] };
  return { run: { ...run, past: [...run.past, run.now], now: r.state }, events: r.events };
}

export function undo(run: Run): Run {
  if (run.past.length === 0) return run;
  return { ...run, past: run.past.slice(0, -1), now: run.past[run.past.length - 1]! };
}

export const restart = (run: Run): Run => ({ past: [], now: initial(run.now.level), assisted: run.assisted });
export const assist = (run: Run): Run => (run.assisted ? run : { ...run, assisted: true });
```

- [ ] **Step 4: Add `src/puzzle/run.ts` to `tsconfig.json`; run** `node --test crete/test/puzzle-*.test.ts`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add websites/www.cs/games/crete
git commit -m "Crete engine: undo, restart and the try"
```

### Task 5: The solver, then open PR A

**Files:**
- Create: `websites/www.cs/games/crete/src/puzzle/solver.ts`
- Modify: `websites/www.cs/games/crete/tsconfig.json`
- Test: `websites/www.cs/games/crete/test/puzzle-solver.test.ts`

**Interfaces:**
- Consumes: `State`, `step`, `Action`, `DIRS`, `TOOLS`, `OBJECTS`, `TERRAIN`.
- Produces: `SOLVER_CAP = 2_000_000`, `stateKey(s: State): string`, `SolveResult = { solved: true; line: Action[]; explored: number } | { solved: false; explored: number; capped: boolean }`, `solve(s: State, cap?: number): SolveResult`.

- [ ] **Step 1: Write the failing test**

```ts
// websites/www.cs/games/crete/test/puzzle-solver.test.ts
// The exact solver: the shortest winning line on small levels with known answers,
// "unsolved" when there is none, and the cap.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { solve, stateKey } from '../src/puzzle/solver.ts';
import { step } from '../src/puzzle/step.ts';
import { grid, mv } from './puzzle-grid.ts';

function replay(s: ReturnType<typeof grid>, line: ReturnType<typeof mv>[]) {
  let st = s;
  for (const a of line) st = step(st, a).state;
  return st;
}

test('the shortest line on open floor, and with a relic and the gate', () => {
  const a = solve(grid(['P.E']));
  assert.ok(a.solved);
  assert.deepEqual(a.line, [mv('right'), mv('right')]);
  const b = solve(grid(['P*.|E']));
  assert.ok(b.solved);
  assert.equal(b.line.length, 4);
  assert.equal(replay(grid(['P*.|E']), b.line).outcome, 'won');
});

test('a key fetched off the path is part of the line', () => {
  // Down, right (the red key), up, right (the door opens), right (the exit).
  const r = solve(grid(['P.RE', '.r##']));
  assert.ok(r.solved);
  assert.equal(r.line.length, 5);
});

test('no way out is "unsolved"; a tiny cap says it was capped', () => {
  const none = solve(grid(['P#E']));
  assert.ok(!none.solved && !none.capped);
  const corridor = solve(grid(['P.M.E']));
  assert.equal(corridor.solved, false, 'the Minotaur holds a one-wide corridor');
  const capped = solve(grid(['P........E']), 3);
  assert.ok(!capped.solved && capped.capped);
});

test('the key tells apart states that differ only in a door, a block or a held key', () => {
  const s = grid(['PrR.']);
  const t = step(s, mv('right')).state;
  assert.notEqual(stateKey(s), stateKey(t));
  assert.equal(stateKey(s), stateKey(grid(['PrR.'])));
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test crete/test/puzzle-solver.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Write solver.ts**

```ts
// websites/www.cs/games/crete/src/puzzle/solver.ts
/* The Island of Crete: the exact solver. Breadth-first over states from the
 * one given, so the first win found is a shortest line. It proves every trial
 * winnable and drives Ariadne's thread (one step, the whole line drawn, or
 * played out). DOM-free. */
import { DIRS, TERRAIN, OBJECTS, KEY_COLORS } from './tiles.ts';
import type { Tool } from './tiles.ts';
import { step } from './step.ts';
import type { Action } from './step.ts';
import type { State } from './state.ts';

export const SOLVER_CAP = 2_000_000;

export type SolveResult =
  | { solved: true; line: Action[]; explored: number }
  | { solved: false; explored: number; capped: boolean };

const cell = (x: { r: number; c: number } | null) => (x ? `${x.r},${x.c}` : '-');

/** Everything that can change during a try, as one string. Moves are left out: the search is breadth-first. */
export function stateKey(s: State): string {
  return [
    cell(s.player), cell(s.minotaur), cell(s.cow), cell(s.throwBack), s.stone, s.hearts, s.relicsLeft, s.pages,
    KEY_COLORS.map(k => s.keys[k]).join(''), s.gear.slice().sort().join('+'),
    s.tools.mirror, s.tools.cake, s.tools.cow,
    s.terrain.map(t => TERRAIN[t].char).join(''),
    s.objects.map(o => (o ? OBJECTS[o].char : '.')).join(''),
  ].join('|');
}

function actions(s: State): Action[] {
  const out: Action[] = DIRS.map(dir => ({ kind: 'move', dir }));
  out.push({ kind: 'wait' });
  for (const tool of ['mirror', 'cake', 'cow'] as Tool[]) if (s.tools[tool] > 0) out.push({ kind: 'tool', tool });
  return out;
}

export function solve(start: State, cap = SOLVER_CAP): SolveResult {
  if (start.outcome === 'won') return { solved: true, line: [], explored: 0 };
  const states: State[] = [start];
  const parent: number[] = [-1];
  const via: (Action | null)[] = [null];
  const seen = new Set<string>([stateKey(start)]);
  for (let head = 0; head < states.length; head++) {
    const s = states[head]!;
    for (const a of actions(s)) {
      const n = step(s, a).state;
      if (n === s || n.outcome === 'lost') continue;
      const k = stateKey(n);
      if (seen.has(k)) continue;
      seen.add(k);
      states.push(n);
      parent.push(head);
      via.push(a);
      if (n.outcome === 'won') {
        const line: Action[] = [];
        for (let i = states.length - 1; i > 0; i = parent[i]!) line.unshift(via[i]!);
        return { solved: true, line, explored: states.length };
      }
      if (states.length >= cap) return { solved: false, explored: states.length, capped: true };
    }
  }
  return { solved: false, explored: states.length, capped: false };
}
```

- [ ] **Step 4: Add `src/puzzle/solver.ts` to `tsconfig.json`. Run the gates**

Run (from `websites/www.cs/games`): `node --test crete/test/puzzle-*.test.ts && node _kit/build/build.mjs crete --check && bash units.sh`
Then (from `websites/www.cs`): `make test`
Expected: all PASS; `dist/` unchanged.

- [ ] **Step 5: Commit, push and open PR A**

```bash
git add websites/www.cs/games/crete
git commit -m "Crete engine: the exact solver"
git push -u origin crete/engine
gh pr create --title "Crete engine: tile puzzles, the Theseus Minotaur, undo and a solver" --body "$(cat <<'EOF'
Part 2 of the Crete redesign, first of three PRs: the DOM-free puzzle engine in `crete/src/puzzle/` and its tests. Nothing on the page changes.

- `tiles.ts`, `level.ts`: the pieces and the level text (parse with line and column errors, canonical round trip).
- `state.ts`, `step.ts`: immutable states; `step(state, action) → { state, events }`.
- `minotaur.ts`: two steps a turn, the horizontal gap first, else the vertical, else stay.
- `run.ts`: undo and restart. `solver.ts`: breadth-first, shortest line, capped at 2,000,000 states.

Spec: docs/superpowers/specs/2026-10-17-crete-engine-design.md · Plan: docs/superpowers/plans/2026-10-17-crete-engine.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01FoKMADRSwpF9h73QiHq2Hb
EOF
)"
```

The controller runs the pr-fix loop and merges on green.

---

## PR B — Art (a test page, the game unchanged)

Branch `crete/art` from `main` after PR A merges.

### Task 6: The Blender tiles

**Files:**
- Create: `websites/www.cs/games/crete/fx/blender/render_tiles.py`
- Create: `websites/www.cs/games/crete/fx/blender/*.blend` (written by the script; Git LFS through the existing `*.blend` rule)
- Create: `websites/www.cs/games/crete/fx/sprites/tiles.png`, `websites/www.cs/games/crete/fx/sprites/tiles.json`, `websites/www.cs/games/crete/fx/sprites/preview-16.png`
- Create: `websites/www.cs/games/crete/fx/CREDITS.md`
- Test: `websites/www.cs/games/crete/test/tiles-atlas.test.ts`

**Interfaces:**
- Consumes: `SPRITE_NAMES` and `TERRAIN` (for which sprites loop) from `src/puzzle/tiles.ts`.
- Produces: `fx/sprites/tiles.json` of this shape, read by Task 7:

```json
{
  "cell": 64,
  "rise": 24,
  "sprites": {
    "floor": { "x": 0, "y": 0, "frames": 1, "fps": 0 },
    "water": { "x": 0, "y": 88, "frames": 8, "fps": 8 }
  }
}
```

Every frame is `cell` px wide and `cell + rise` px tall; a sprite's frames run left to right from `(x, y)`. The bottom `cell` px are the cell itself; the top `rise` px are what stands above it (a wall's top, a figure's head), drawn over the cell above.

- [ ] **Step 1: Write the failing test**

```ts
// websites/www.cs/games/crete/test/tiles-atlas.test.ts
// The atlas names every sprite the board asks for, every frame lies inside the PNG,
// and the loops are the ones the spec names.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPRITE_NAMES } from '../src/puzzle/tiles.ts';

const dir = new URL('../fx/sprites/', import.meta.url);
const atlas = JSON.parse(readFileSync(new URL('tiles.json', dir), 'utf8')) as {
  cell: number; rise: number; sprites: Record<string, { x: number; y: number; frames: number; fps: number }>;
};
const png = readFileSync(new URL('tiles.png', dir));
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);

test('every sprite the board draws is in the atlas, and nothing else is', () => {
  assert.deepEqual(Object.keys(atlas.sprites).sort(), [...SPRITE_NAMES].sort());
});

test('every frame lies inside tiles.png', () => {
  for (const [name, s] of Object.entries(atlas.sprites)) {
    assert.ok(s.frames >= 1, name);
    assert.ok(s.x + s.frames * atlas.cell <= width, `${name} runs past the right edge`);
    assert.ok(s.y + atlas.cell + atlas.rise <= height, `${name} runs past the bottom`);
  }
});

test('water, fire, the force floors and the Minotaur loop; everything else is still', () => {
  const loops = ['water', 'fire', 'force-up', 'force-down', 'force-left', 'force-right', 'minotaur'];
  for (const [name, s] of Object.entries(atlas.sprites)) {
    if (loops.includes(name)) assert.ok(s.frames >= 6 && s.fps > 0, name);
    else assert.equal(s.frames, 1, name);
  }
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test crete/test/tiles-atlas.test.ts`
Expected: FAIL, `ENOENT … tiles.json`.

- [ ] **Step 3: Write render_tiles.py**

Model it on `websites/www.cs/games/tankity/fx/blender/render_fx.py` — read that file's header, `parse_args`, `reset_scene`, the material helpers and the sheet tiling and quantize steps first, and keep the same options where they apply (`--out`, `--only`, `--engine`, `--samples`, `--supersample`, `--seed`, `--blend-dir`, `--no-blend`, `--no-quantize`, `--keep-frames`). The module docstring states how to regenerate:

```
/Applications/Blender.app/Contents/MacOS/Blender -b -P render_tiles.py -- --out ../sprites
```

What the script must do:

1. **One camera for every sprite:** orthographic, tilted 35° down from the horizontal (three-quarter top-down), framing exactly one 1 × 1 unit cell in the bottom `cell` px of a `cell × (cell + rise)` frame (`cell = 64`, `rise = 24`), so a 0.375-unit-tall wall's top fills the `rise` band. Transparent film for objects and figures; terrain is opaque.
2. **One light rig:** a warm sun from the upper left (the same for every sprite, so tiles join), a cool fill, and for figures a rim light from behind plus a 1 px dark outline (Freestyle or an inverted-hull solidify) so they read at 16 px.
3. **Painted, realistic materials, built in code, no outside assets:** limestone (noise-driven colour and bump, warm off-white) for floor, wall (top and front face) and safe zone (floor with a carved laurel ring); dirt; sea-blue water with animated wave normals (8 frames, 8 fps, looping); fire (emissive animated flame, 8 frames, 10 fps, looping); pale-blue ice with specular streaks; force floors (bronze plates with an engraved arrow; the arrow glyphs scroll one plate length over 8 frames at 8 fps, looping, one sprite per direction); a bronze button; toggle walls (open: a lowered bronze grate flush with the floor; closed: the grate raised); four bronze doors with an enamel band in the key colour (red, blue, yellow, green); the gate (closed: bronze bars; open: bars lifted); the exit (a stair going down into light).
4. **Objects** sit in the middle of a transparent cell: relic (a gold double axe, the labrys), four keys (bronze with the enamel colour), flippers, fire boots, skates, suction boots, Medusa's mirror (a polished bronze disc with a gorgon face), honey cake, cow (a small wooden cow on wheels), story page (a rolled papyrus), block (a limestone cube, opaque, the full cell).
5. **Figures:** Theseus (a short tunic, a red cloak for contrast, holding a thread spool), the Minotaur (bull head, dark hide, 8-frame breathing loop at 6 fps), the stone Minotaur (the same pose in grey limestone, still), and the standing cow (the cow object at full figure size).
6. **The sheet:** each sprite's frames left to right on its own row of `tiles.png`, rows in `SPRITE_NAMES` order. Read that order from the TypeScript by parsing `src/puzzle/tiles.ts` is fragile; instead the script carries its own list and **asserts** at the end that `tiles.json` names exactly the sprites in the list (the node test above checks it against `SPRITE_NAMES`).
7. **The 16 px check**, after quantizing, with system `python3` and Pillow (skip with a warning when Pillow is missing): for every object and figure sprite, take its first frame, downscale to 16 px wide (Lanczos), and require an alpha coverage between 12% and 85% and a mean luminance difference of at least 0.18 against the downscaled `floor` sprite under it; print each failure and exit non-zero. Write `preview-16.png`: every sprite at 16, 24 and 48 px on a floor background, labelled, for a human look.
8. Save each scene to `fx/blender/<sprite>.blend` unless `--no-blend`.

- [ ] **Step 4: Render**

Run (from `websites/www.cs/games/crete/fx/blender`): `/Applications/Blender.app/Contents/MacOS/Blender -b -P render_tiles.py -- --out ../sprites`
Expected: `tiles.png`, `tiles.json`, `preview-16.png` written, the 16 px check passes. Open `preview-16.png` (Read tool) and look at it: every object and both Minotaurs must be told apart at 16 px. Fix materials and rerun until they are.

- [ ] **Step 5: Run the test, check sizes**

Run: `node --test crete/test/tiles-atlas.test.ts && du -k ../sprites/tiles.png`
Expected: PASS; `tiles.png` under 1500 KB (quantized).

- [ ] **Step 6: Write `fx/CREDITS.md`** (one paragraph: every sprite is rendered by `blender/render_tiles.py` from scenes built in code; no outside assets), and make sure `git lfs` is installed (`git lfs version`) so the `.blend` files go to LFS.

- [ ] **Step 7: Commit**

```bash
git add websites/www.cs/games/crete/fx websites/www.cs/games/crete/test/tiles-atlas.test.ts
git lfs ls-files | grep crete/fx/blender | head -3   # expect the .blend files listed
git commit -m "Crete art: Blender tiles for every piece, figure and loop"
```

### Task 7: The board planner, the canvas and the test page, then open PR B

**Files:**
- Create: `websites/www.cs/games/crete/src/board-plan.ts` (DOM-free)
- Create: `websites/www.cs/games/crete/src/board.ts` (DOM)
- Create: `websites/www.cs/games/crete/src/tiles-page.ts` (DOM, the test page's entry)
- Create: `websites/www.cs/games/crete/tiles-test.html`
- Modify: `websites/www.cs/games/crete/build.json` (entry `src/tiles-page.ts` → `tiles-test`, `iife`)
- Modify: `websites/www.cs/games/crete/tsconfig.json`, `websites/www.cs/games/crete/src/tsconfig.dom.json`
- Modify: `websites/www.cs/games/crete/tools/install-files.php` (`precache_dirs` add `fx/sprites`; `precache_exclude` add `tiles-test.*`, `preview-16.png`)
- Test: `websites/www.cs/games/crete/test/board-plan.test.ts`

**Interfaces:**
- Consumes: `State`, `GameEvent`, `TERRAIN`, `OBJECTS`, `Cell`, the `tiles.json` shape from Task 6.
- Produces (board-plan.ts):
  - `Atlas { cell: number; rise: number; sprites: Record<string, { x: number; y: number; frames: number; fps: number }> }`
  - `SLIDE_MS = 120`
  - `Timeline { duration: number; at(ms: number): Figures }`, `Figures { player: { r: number; c: number }; minotaur: { r: number; c: number } | null }` (fractional cells)
  - `timeline(before: State, events: GameEvent[], reducedMotion: boolean, after: State): Timeline` (at or past `duration` it returns the after-state's figures, which covers throw-backs and the Minotaur's trip home)
  - `Draw { sprite: string; frame: number; x: number; y: number }` (x, y in cells; y is the cell's top, the sprite's rise goes above it)
  - `drawList(s: State, figures: Figures, atlas: Atlas, ms: number): Draw[]`
  - `boardRows(level: { rows: number }, atlas: Atlas): number` (rows plus the top rise, for fitting)
- Produces (board.ts): `createBoard(canvas: HTMLCanvasElement, atlas: Atlas, image: HTMLImageElement): Board`, `Board { size(cellPx: number): void; paint(list: Draw[], thread?: Cell[]): void }`.

- [ ] **Step 1: Write the failing test**

```ts
// websites/www.cs/games/crete/test/board-plan.test.ts
// The board's plan: rows back to front so a wall's top overlaps the row above, figures over their row,
// a turn's slides one after the other at 120 ms a cell, and reduced motion snaps.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { drawList, timeline, SLIDE_MS, boardRows } from '../src/board-plan.ts';
import type { Atlas } from '../src/board-plan.ts';
import { step } from '../src/puzzle/step.ts';
import { grid, mv, WAIT } from './puzzle-grid.ts';

const atlas = JSON.parse(readFileSync(new URL('../fx/sprites/tiles.json', import.meta.url), 'utf8')) as Atlas;

test('terrain is drawn row by row from the top, objects and figures after their row', () => {
  const s = grid(['P#', '*M']);
  const list = drawList(s, { player: s.player, minotaur: s.minotaur }, atlas, 0);
  const names = list.map(d => d.sprite);
  assert.deepEqual(names, ['floor', 'wall', 'theseus', 'floor', 'floor', 'relic', 'minotaur']);
  assert.deepEqual(list.find(d => d.sprite === 'wall'), { sprite: 'wall', frame: 0, x: 1, y: 0 });
});

test('the gate shows open once the relics are taken; a stone Minotaur and a standing cow have their own sprites', () => {
  const s = { ...grid(['P|M']), relicsLeft: 0, stone: 2, cow: { r: 0, c: 0 } };
  const names = drawList(s, { player: s.player, minotaur: s.minotaur }, atlas, 0).map(d => d.sprite);
  assert.ok(names.includes('gate-open'));
  assert.ok(names.includes('minotaur-stone'));
  assert.ok(names.includes('cow-standing'));
});

test('a loop picks its frame from the time', () => {
  const s = grid(['P~']);
  const water = (ms: number) => drawList(s, { player: s.player, minotaur: null }, atlas, ms).find(d => d.sprite === 'water')!.frame;
  const fps = atlas.sprites.water!.fps;
  assert.equal(water(0), 0);
  assert.equal(water(1000 / fps), 1);
  assert.equal(water((1000 / fps) * atlas.sprites.water!.frames), 0);
});

test("a turn plays the player's slide, then each Minotaur step, 120 ms a cell", () => {
  const s = grid(['P....', '.....', '....M']);
  const r = step(s, mv('right'));
  const tl = timeline(s, r.events, false, r.state);
  assert.equal(tl.duration, 3 * SLIDE_MS);
  assert.deepEqual(tl.at(SLIDE_MS / 2).player, { r: 0, c: 0.5 });
  assert.deepEqual(tl.at(SLIDE_MS / 2).minotaur, { r: 2, c: 4 });
  assert.deepEqual(tl.at(SLIDE_MS * 1.5).minotaur, { r: 2, c: 3.5 });
  assert.deepEqual(tl.at(tl.duration), { player: r.state.player, minotaur: r.state.minotaur });
  assert.deepEqual(tl.at(tl.duration + 999), tl.at(tl.duration));
});

test('reduced motion snaps; a catch snaps the player back after the Minotaur arrives', () => {
  const s = grid(['P....', '.....', '....M']);
  const moved = step(s, mv('right'));
  assert.equal(timeline(s, moved.events, true, moved.state).duration, 0);
  const c = grid(['M.P']);
  const r = step(c, WAIT);
  const tl = timeline(c, r.events, false, r.state);
  assert.deepEqual(tl.at(tl.duration).player, r.state.player);
  assert.deepEqual(tl.at(tl.duration).minotaur, r.state.minotaur);
});

test('the board is the rows plus the rise of the top row', () => {
  assert.equal(boardRows({ rows: 10 }, atlas), 10 + atlas.rise / atlas.cell);
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `node --test crete/test/board-plan.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Write board-plan.ts**

```ts
// websites/www.cs/games/crete/src/board-plan.ts
/* The Island of Crete: what the board draws, as data. `drawList` lists the
 * sprites row by row from the top, so a wall's top (the sprite's rise) lies
 * over the row above; a row's objects and figures follow its terrain.
 * `timeline` turns a turn's events into where the figures stand at each
 * moment: the player's moves and slides first, then each Minotaur step,
 * SLIDE_MS a cell; reduced motion snaps. DOM-free. */
import { TERRAIN, OBJECTS } from './puzzle/tiles.ts';
import type { Cell } from './puzzle/tiles.ts';
import type { State } from './puzzle/state.ts';
import type { GameEvent } from './puzzle/step.ts';

export interface Atlas {
  cell: number;
  rise: number;
  sprites: Record<string, { x: number; y: number; frames: number; fps: number }>;
}
export interface Pos { r: number; c: number }
export interface Figures { player: Pos; minotaur: Pos | null }
export interface Draw { sprite: string; frame: number; x: number; y: number }
export interface Timeline { duration: number; at(ms: number): Figures }

export const SLIDE_MS = 120;

export const boardRows = (level: { rows: number }, atlas: Atlas): number => level.rows + atlas.rise / atlas.cell;

function frameAt(atlas: Atlas, sprite: string, ms: number): number {
  const s = atlas.sprites[sprite];
  if (!s || s.frames <= 1 || s.fps <= 0) return 0;
  return Math.floor((ms * s.fps) / 1000) % s.frames;
}

export function drawList(s: State, fig: Figures, atlas: Atlas, ms: number): Draw[] {
  const out: Draw[] = [];
  const put = (sprite: string, x: number, y: number) => out.push({ sprite, frame: frameAt(atlas, sprite, ms), x, y });
  const { rows, cols } = s.level;
  const onRow = (p: Pos | null, r: number) => !!p && Math.round(p.r) === r;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const t = s.terrain[r * cols + c]!;
      const sprites = TERRAIN[t].sprites;
      put(t === 'gate' && s.relicsLeft === 0 ? sprites[1]! : sprites[0]!, c, r);
    }
    for (let c = 0; c < cols; c++) {
      const o = s.objects[r * cols + c];
      if (o) put(OBJECTS[o].sprite, c, r);
    }
    if (s.cow && s.cow.r === r) put('cow-standing', s.cow.c, r);
    if (onRow(fig.minotaur, r)) put(s.stone > 0 ? 'minotaur-stone' : 'minotaur', fig.minotaur!.c, fig.minotaur!.r);
    if (onRow(fig.player, r)) put('theseus', fig.player.c, fig.player.r);
  }
  return out;
}

interface Seg { who: 'player' | 'minotaur'; from: Cell; to: Cell }

export function timeline(before: State, events: GameEvent[], reducedMotion: boolean, after: State): Timeline {
  const segs: Seg[] = [];
  for (const e of events) {
    if ((e.kind === 'moved' || e.kind === 'slid') && e.who !== 'block') segs.push({ who: e.who, from: e.from, to: e.to });
  }
  const end: Figures = { player: after.player, minotaur: after.minotaur };
  const duration = reducedMotion ? 0 : segs.length * SLIDE_MS;
  const lerp = (a: Cell, b: Cell, t: number): Pos => ({ r: a.r + (b.r - a.r) * t, c: a.c + (b.c - a.c) * t });
  return {
    duration,
    at(ms: number): Figures {
      if (ms >= duration) return end;
      const f: Figures = { player: before.player, minotaur: before.minotaur };
      segs.forEach((s, i) => {
        if (ms >= i * SLIDE_MS) f[s.who] = lerp(s.from, s.to, Math.min(1, (ms - i * SLIDE_MS) / SLIDE_MS));
      });
      return f;
    },
  };
}
```

- [ ] **Step 4: Write board.ts**

```ts
// websites/www.cs/games/crete/src/board.ts
/* The Island of Crete: paints a draw list (src/board-plan.ts) on the board's
 * canvas from the sprite atlas, at the device's pixel ratio so the tiles stay
 * sharp, and draws Ariadne's thread as a red line through cell centres. */
import type { Atlas, Draw } from './board-plan.ts';
import { boardRows } from './board-plan.ts';
import type { Cell } from './puzzle/tiles.ts';

export interface Board {
  /** Sets the canvas to `cols × rows` cells of `cellPx` CSS pixels (plus the top row's rise). */
  size(cols: number, rows: number, cellPx: number): void;
  paint(list: Draw[], thread?: readonly Cell[]): void;
}

export function createBoard(canvas: HTMLCanvasElement, atlas: Atlas, image: HTMLImageElement): Board {
  const ctx = canvas.getContext('2d')!;
  let px = 16;
  const rise = atlas.rise / atlas.cell;
  return {
    size(cols, rows, cellPx) {
      px = cellPx;
      const dpr = window.devicePixelRatio || 1;
      const w = cols * cellPx;
      const h = boardRows({ rows }, atlas) * cellPx;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.dataset.cell = String(cellPx);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    },
    paint(list, thread) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const fw = atlas.cell;
      const fh = atlas.cell + atlas.rise;
      for (const d of list) {
        const s = atlas.sprites[d.sprite];
        if (!s) continue;
        // The canvas starts `rise` above row 0, so a sprite's frame top (its cell's top minus the rise) is y * px.
        ctx.drawImage(image, s.x + d.frame * fw, s.y, fw, fh, d.x * px, d.y * px, px, px * (1 + rise));
      }
      if (thread && thread.length > 1) {
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = Math.max(2, px / 8);
        ctx.lineJoin = 'round';
        ctx.beginPath();
        thread.forEach((c, i) => {
          const x = (c.c + 0.5) * px;
          const y = (c.r + 0.5 + rise) * px;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
    },
  };
}
```

Check it on the test page in Step 6: a wall in row 1 must overlap the bottom of row 0, and nothing may be cut off at the top.

- [ ] **Step 5: The test page**

`tiles-test.html`: a plain page (copy `index.html`'s head: charset, viewport, `game.css`, `dist/kit.css`) with a `<canvas id="stage">`, a size picker (16, 24, 32, 48, 64 px a cell), a "Reduced motion" checkbox, and a `<pre id="level">` showing the level text. `src/tiles-page.ts` imports `tiles.json` (esbuild bundles JSON), loads `fx/sprites/tiles.png`, parses this level, and lets the arrow keys, `.` (wait) and Z/X/C play it through `act` from `run.ts`, animating each turn with `timeline` on `requestAnimationFrame`:

```
title: Tiles
intro: Every piece on one board.

#############
#P.*rRbByYgG#
#~f.Fh.=k.>u#
#%S_Tt.^v<..#
#zxcpO....|E#
#..........M#
#############
```

The page also draws each sprite alone in a strip under the board at the picked size. Add the entry to `build.json` `entries`: `{ "in": "src/tiles-page.ts", "out": "tiles-test", "format": "iife" }`; add `board.ts` and `tiles-page.ts` to `src/tsconfig.dom.json` and `board-plan.ts` to `tsconfig.json`.

- [ ] **Step 6: Build and look**

Run (from `websites/www.cs/games`): `node _kit/build/build.mjs crete && (cd crete && php tools/install-files.php) && node --test crete/test/board-plan.test.ts crete/test/tiles-atlas.test.ts`
Then serve the site in Docker on an ephemeral port (unique project name; see `websites/www.cs/Makefile` for the compose file) and open `games/crete/tiles-test.html` with the Playwright MCP browser at 375 × 667 and 1280 × 800. Take a screenshot at 16 px and at 48 px a cell; check the wall overlap, the loops moving, the slide timing, and the 16 px read. Tear the project down with `docker compose -p <name> down`.

- [ ] **Step 7: Site versions, gates, commit, PR**

```bash
cd websites/www.cs && php tools/site-versions.php && php tools/site-game-pages.php
bash games/units.sh && make test
git add -A websites/www.cs/games/crete websites/www.cs/*.html websites/www.cs/**/sw.js
git commit -m "Crete art: the board planner, the canvas and a tiles test page"
git push -u origin crete/art
gh pr create --title "Crete art: Blender tiles and the board renderer" --body "<summary of Tasks 6–7, the spec and plan paths, then the attribution lines>"
```

`git status` before the add: only Crete files, the site pages `site-versions.php` touched, and `sw.js` should be listed. The live game does not use the board yet.

---

## PR C — The game

Branch `crete/trials` from `main` after PR B merges.

### Task 8: Eight trials, each proved

**Files:**
- Create: `websites/www.cs/games/crete/src/puzzle/trials.ts`
- Modify: `websites/www.cs/games/crete/tsconfig.json`
- Test: `websites/www.cs/games/crete/test/puzzle-trials.test.ts`

**Interfaces:**
- Consumes: `parse`, `initial`, `solve`, `step`, `Level`.
- Produces: `TRIALS: readonly { id: string; text: string }[]` (8, ids `trial-1` … `trial-8`), `trialLevel(i: number): Level` (0-based, parsed once and cached).

- [ ] **Step 1: Write the failing test** (the `SHORTEST` numbers are filled in Step 4 from the solver's own output, then never edited by hand again without a rule change)

```ts
// websites/www.cs/games/crete/test/puzzle-trials.test.ts
// Every trial parses, fits a phone, is solved within the cap, and teaches its idea; its shortest line is
// pinned so a rule change that alters a trial fails here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TRIALS, trialLevel } from '../src/puzzle/trials.ts';
import { initial } from '../src/puzzle/state.ts';
import { solve } from '../src/puzzle/solver.ts';
import { step } from '../src/puzzle/step.ts';
import type { GameEvent } from '../src/puzzle/step.ts';
import { parse, serialize } from '../src/puzzle/level.ts';

const SHORTEST: number[] = [0, 0, 0, 0, 0, 0, 0, 0];

function solved(i: number) {
  const r = solve(initial(trialLevel(i)));
  assert.ok(r.solved, `trial ${i + 1} unsolved`);
  assert.ok(r.explored < 200_000, `trial ${i + 1} explored ${r.explored}`);
  const events: GameEvent[] = [];
  let s = initial(trialLevel(i));
  for (const a of r.line) { const x = step(s, a); s = x.state; events.push(...x.events); }
  assert.equal(s.outcome, 'won');
  return { line: r.line, events, kinds: new Set(events.map(e => e.kind)), took: new Set(events.flatMap(e => (e.kind === 'took' ? [e.what] : []))) };
}

test('eight trials, canonical text, at most 12 by 12, trial 1 at most 8 by 8', () => {
  assert.equal(TRIALS.length, 8);
  TRIALS.forEach((t, i) => {
    assert.equal(serialize(parse(t.text)), t.text, t.id);
    const lv = trialLevel(i);
    assert.ok(lv.rows <= 12 && lv.cols <= 12, t.id);
    assert.ok(lv.title && lv.intro, t.id);
    assert.ok(lv.minotaur, `${t.id} has a Minotaur`);
  });
  assert.ok(trialLevel(0).rows <= 8 && trialLevel(0).cols <= 8);
});

test('each shortest line is pinned', () => {
  assert.deepEqual(TRIALS.map((_, i) => solved(i).line.length), SHORTEST);
});

test('trial 1: walking straight to the exit gets you caught', () => {
  const lv = trialLevel(0);
  const free = solve(initial({ ...lv, minotaur: null }));
  assert.ok(free.solved);
  let s = initial(lv);
  const kinds: string[] = [];
  for (const a of free.line) { const x = step(s, a); s = x.state; kinds.push(...x.events.map(e => e.kind)); }
  assert.ok(kinds.includes('caught'));
});

test('trials 2 to 8 each need their idea', () => {
  assert.ok(trialLevel(1).relics >= 2 && trialLevel(1).terrain.includes('gate'));
  const t3 = solved(2);
  assert.ok(t3.events.filter(e => e.kind === 'opened').length >= 2 && t3.took.has('key-green'));
  const t4 = solved(3);
  assert.ok(t4.took.has('flippers') && t4.took.has('fire-boots'));
  const t5 = solved(4);
  assert.ok(t5.took.has('skates') && t5.took.has('suction') && t5.kinds.has('slid'));
  const t6 = solved(5);
  assert.ok(t6.kinds.has('pushed') && t6.kinds.has('flipped') && t6.kinds.has('sank'));
  const lv7 = trialLevel(6);
  const toolless = { ...lv7, objects: lv7.objects.map(o => (o === 'mirror' || o === 'cake' || o === 'cow' ? null : o)) };
  assert.equal(solve(initial(toolless)).solved, false, 'trial 7 needs a tool');
  assert.ok(lv7.terrain.includes('safe'));
  const t8 = solved(7);
  const ideas = [t8.kinds.has('opened'), t8.took.has('flippers') || t8.took.has('fire-boots'), t8.kinds.has('slid'), t8.kinds.has('pushed'), t8.events.some(e => e.kind === 'stoned')];
  assert.ok(ideas.filter(Boolean).length >= 4, 'the finale combines at least four ideas');
});
```

- [ ] **Step 2: Run it to see it fail** — `node --test crete/test/puzzle-trials.test.ts`; expected FAIL, module not found.

- [ ] **Step 3: Write trials.ts**

```ts
// websites/www.cs/games/crete/src/puzzle/trials.ts
/* The Island of Crete: the eight trials, in the level text (src/puzzle/level.ts).
 * Each teaches one idea; the solver proves each winnable (test/puzzle-trials.test.ts).
 * DOM-free. */
import { parse } from './level.ts';
import type { Level } from './level.ts';

export const TRIALS: readonly { id: string; text: string }[] = [
  { id: 'trial-1', text: `title: …\nintro: …\n\n…\n` },
  // trial-2 … trial-8
];

const cache = new Map<number, Level>();
export function trialLevel(i: number): Level {
  let lv = cache.get(i);
  if (!lv) { lv = parse(TRIALS[i]!.text); cache.set(i, lv); }
  return lv;
}
```

Design the eight levels with these targets, in the myth's voice (titles and one- or two-line intros; Theseus speaks of Ariadne, Daedalus and the tribute; no modern words). Iterate with the solver: write a level, run `solve`, print the line and its length (a scratch script in your scratchpad), adjust.

| # | Idea | Must be true |
|---|------|--------------|
| 1 | Walls and the Minotaur's rule | ≤ 8 × 8; 3 hearts (no `hearts` line); the player starts beside a wall; the Minotaur-free shortest path is caught; the solution parks the Minotaur behind a wall; 8–20 moves |
| 2 | Relics and the gate | ≥ 2 relics, a gate before the exit; 12–30 moves |
| 3 | Keys and doors | red, blue or yellow doors with their keys and one green door pair sharing a green key; ≥ 2 doors opened in the line |
| 4 | Water and fire | flippers and fire boots both taken in the line |
| 5 | Ice and force floors | skates and suction boots both taken; at least one slide or carry in the line |
| 6 | Blocks and buttons | a block sunk into water, a button pressed by a block or by you, a toggle wall that matters |
| 7 | Tools and safe zones | a safe zone; unsolvable with the tools removed; all three tools on the board |
| 8 | Finale | ≤ 12 × 12; ≥ 4 ideas in the line; 30–80 moves; `hearts: 3` |

Every level: exactly one `P` and one `M`; surrounded by walls; `explored < 200,000`; canonical text (`serialize(parse(text)) === text`).

- [ ] **Step 4: Pin the lines.** Run a scratch script that prints `solve(initial(trialLevel(i))).line.length` for each trial; put the numbers into `SHORTEST`. Run `node --test crete/test/puzzle-trials.test.ts`; expected PASS.

- [ ] **Step 5: Commit** — `git add websites/www.cs/games/crete && git commit -m "Crete: eight trials, each proved by the solver"`

### Task 9: Keys, status, help and saved progress

**Files:**
- Modify: `websites/www.cs/games/crete/src/keys.ts`, `src/status.ts`, `src/help.ts`
- Create: `websites/www.cs/games/crete/src/progress.ts`
- Modify: `websites/www.cs/games/crete/tsconfig.json`
- Test: modify `test/keys.test.ts` only where it names removed actions, `test/key-table.test.ts`, `test/status.test.ts`, `test/help.test.ts`; create `test/progress.test.ts`

**Interfaces:**
- Produces (keys.ts): `Action = MoveAction | 'wait' | 'undo' | 'restart' | 'hint' | 'route' | 'auto' | 'mute' | 'new' | 'menu'`; `KEYS` rows `wait: { label: '.', keys: ['.'] }`, `undo: { label: 'U', keys: ['u'] }`, `restart: { label: 'R', keys: ['r'] }`, `new: { label: 'N', keys: ['n'] }` (opens the trial list); `bash` is gone. `itemFor(key, TOOLS)` keeps its signature.
- Produces (status.ts): `StatusInput { trial: string; hearts: number; relicsLeft: number; keys: Record<KeyColor, number>; gear: readonly Gear[]; moves: number; stone: number }`, `StatusView { trial: string; hearts: string; relics: string; keys: string; gear: string; moves: string; heartsNote: string }`, `statusView(i: StatusInput): StatusView`.
- Produces (help.ts): `helpLines(keys: Record<Action, KeyDef>, tools: typeof TOOLS): Seg[][]`.
- Produces (progress.ts): `PROGRESS_KEY = 'crete-progress'`, `TrialProgress { cleared: boolean; assisted: boolean; best: number | null }`, `Progress { get(id: string): TrialProgress; record(id: string, moves: number, assisted: boolean): TrialProgress }`, `createProgress(storage: StorageLike | null): Progress`.

- [ ] **Step 1: Write the failing tests**

```ts
// websites/www.cs/games/crete/test/progress.test.ts
// Trial progress in this browser: cleared, assisted, best moves; blocked or corrupt storage is an empty record.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProgress, PROGRESS_KEY } from '../src/progress.ts';
import type { StorageLike } from '../../_kit/ports.ts';

const memory = (init: Record<string, string> = {}): StorageLike & { data: Record<string, string> } => {
  const data = { ...init };
  return { data, getItem: k => data[k] ?? null, setItem: (k, v) => { data[k] = v; }, removeItem: k => { delete data[k]; } };
};

test('an unplayed trial is not cleared', () => {
  assert.deepEqual(createProgress(memory()).get('trial-1'), { cleared: false, assisted: false, best: null });
});

test('best keeps the fewest unassisted moves; assisted clears alone mark the trial assisted', () => {
  const st = memory();
  const p = createProgress(st);
  assert.deepEqual(p.record('trial-2', 30, true), { cleared: true, assisted: true, best: null });
  assert.deepEqual(p.record('trial-2', 25, false), { cleared: true, assisted: false, best: 25 });
  assert.deepEqual(p.record('trial-2', 28, false), { cleared: true, assisted: false, best: 25 });
  assert.deepEqual(createProgress(st).get('trial-2'), { cleared: true, assisted: false, best: 25 }, 'kept in storage');
});

test('blocked or corrupt storage is an empty record and never throws', () => {
  const throwing: StorageLike = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() {} };
  for (const st of [null, throwing, memory({ [PROGRESS_KEY]: '{not json' }), memory({ [PROGRESS_KEY]: '{"trial-1":{"best":"x"}}' })]) {
    const p = createProgress(st);
    assert.deepEqual(p.get('trial-1'), { cleared: false, assisted: false, best: null });
    assert.doesNotThrow(() => p.record('trial-1', 9, false));
  }
});
```

Check `StorageLike` in `games/_kit/ports.ts` and match the `memory` stub to its exact members.

For `status.test.ts` and `help.test.ts`, replace the old cases with ones for the new inputs:

```ts
// in test/status.test.ts
test('hearts are a heart and a number; keys and gear list what is held', () => {
  const v = statusView({ trial: 'The first gate', hearts: 4, relicsLeft: 2, keys: { red: 1, blue: 0, yellow: 0, green: 1 },
    gear: ['flippers'], moves: 12, stone: 0 });
  assert.equal(v.hearts, '♥ 4');
  assert.equal(v.relics, '2');
  assert.equal(v.moves, '12');
  assert.match(v.keys, /red/i);
  assert.match(v.keys, /green/i);
  assert.doesNotMatch(v.keys, /blue/i);
  assert.equal(v.trial, 'The first gate');
});
```

```ts
// in test/help.test.ts
test('the help names every key from the key table and the tools', () => {
  const text = helpLines(KEYS, TOOLS).flat().map(s => (typeof s === 'string' ? s : s.strong)).join('');
  for (const a of ['wait', 'undo', 'restart', 'hint', 'route', 'auto'] as const) assert.ok(text.includes(KEYS[a].label), a);
  for (const t of Object.values(TOOLS)) assert.ok(text.includes(t.key) && text.includes(t.name), t.name);
  assert.doesNotMatch(text, /bash|fuse|seed/i);
});
```

- [ ] **Step 2: Run them to see them fail** — `node --test crete/test/progress.test.ts crete/test/status.test.ts crete/test/help.test.ts crete/test/key-table.test.ts`.

- [ ] **Step 3: Implement.** `progress.ts` stores one JSON object under `PROGRESS_KEY` with the kit's `pref` + `json` codec (see `src/settings.ts` and `_kit/prefs.ts`); its guard accepts only `{ [id]: { cleared: boolean; best: number | null } }` with integer `best ≥ 0`, and anything else reads as `{}`. `assisted` is derived (`cleared && best === null`), not stored. `statusView` formats: `hearts: '♥ N'`, `heartsNote: 'N hearts left'`; keys as one compact string of held colours with counts (e.g. `'🔴1 🟢1'`, with a screen-reader word per colour in `keys` too, e.g. `<colour> key ×n`; pick one format and make the test match it); gear as the gear's names joined; when `stone > 0` the trial field is unchanged and `heartsNote` adds `the Minotaur is stone for N turns`. `helpLines` explains, in the game's voice: the goal (relics, the gate, the exit), the Minotaur's two steps and its rule, safe zones and hearts, keys and doors, water/fire/ice/force floors and their gear, blocks and buttons, the three tools with their keys from `TOOLS`, and the keys for wait, undo, restart, the thread (H, V, T), mute, the trial list and Q.

- [ ] **Step 4: Run** — same command; expected PASS. **Step 5: Commit** — `git commit -m "Crete: keys, status, help and saved progress for the trials"`.

### Task 10: The game on the engine; the old chase removed

**Files:**
- Delete: `src/engine.ts`, `src/grid.ts`, `src/bots.ts`, `test/engine.test.ts`, `test/bots.test.ts`, `test/maze-rule.test.ts`, `test/maze-sweep.test.ts`, `test/rules.test.ts`, and any other test that imports a deleted module (`grep -l "engine.ts\|grid.ts\|bots.ts" crete/test`)
- Create: `src/game.ts` (DOM-free controller), `src/ui/trials.tsx` (the trial list card)
- Modify: `src/main.ts`, `src/ui.ts`, `src/ui/strip.tsx`, `src/ui/status.tsx`, `src/ui/title.tsx`, `src/ui/menu.tsx`, `src/ui/end.tsx`, `src/audio.ts`, `index.html` (the `#stage` becomes `<canvas id="stage" class="stage" role="img" aria-label="The labyrinth">`), `game.css`, both `tsconfig` files, `test/keys.test.ts`, `test/ui.test.ts`, `test/views.test.ts`, `test/smoke.test.ts`, `test/audio.test.ts`
- Test: create `test/game.test.ts`

**Interfaces:**
- Consumes: everything above.
- Produces (game.ts):

```ts
export interface GameDeps {
  sfx(name: SfxName): void;
  say(text: string, tone?: 'info' | 'good' | 'bad'): void;
  progress: Progress;
  timers: Timers;           // _kit/ports.ts, for the T play-out
  clock: Clock;             // _kit/ports.ts, the animation's time
  reducedMotion(): boolean;
  changed(): void;          // the view redraws
}
export interface Game {
  readonly trial: number;            // 0-based, -1 before one opens
  readonly run: Run | null;
  readonly thread: readonly Cell[] | null;   // V: the line's cells while shown
  readonly playing: boolean;                 // T is playing the line out
  readonly anim: { timeline: Timeline; started: number } | null;
  open(i: number): void;             // starts trial i fresh (clears assisted)
  press(a: Action | 'undo' | 'restart'): void;
  hint(): void; route(): void; auto(): void;
  finishAnim(): void;
}
export function createGame(deps: GameDeps): Game;
```

`anim.started` is `clock.now()` when the turn was played. `press` while `anim` is running first calls `finishAnim()` and then acts, so a press during a slide acts at once and exactly once. Every event maps to a sound: `moved`(player)→`step`, `pushed`→`push`, `sank`→`splash`, `opened`→`door`, `took` key→`key`, `took` relic→`relic` (and `gate` when `relicsLeft` hits 0), other `took`→`pickup`, `flipped`→`button`, `slid`→`slide` (once a turn), `caught`→`caught`, `stoned`→`stone`, `won`→`win`, `lost`→`lose`; a bump → `bump`. On `won`, `progress.record(TRIALS[trial].id, run.now.moves, run.assisted)`. `open(i)` says the trial's title and intro (`say(title, 'info')`, `say(intro, 'info')`), which the page shows in the toast as the trial starts.

- [ ] **Step 1: Write the failing test**

```ts
// websites/www.cs/games/crete/test/game.test.ts
// The controller: a press during a slide finishes it and acts once; the thread marks the try assisted;
// a win records progress; undo and restart go through; sounds follow the events.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/game.ts';
import { createProgress } from '../src/progress.ts';
import { manualClock } from '../../_kit/test/clock.ts';
import { solve } from '../src/puzzle/solver.ts';
import { initial } from '../src/puzzle/state.ts';
import { trialLevel, TRIALS } from '../src/puzzle/trials.ts';
import type { Action } from '../src/puzzle/step.ts';

function harness() {
  const sounds: string[] = [];
  const m = manualClock();
  const progress = createProgress(null);
  const game = createGame({
    sfx: n => sounds.push(n), say() {}, progress, timers: m.timers, clock: m.clock, reducedMotion: () => false, changed() {},
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
  h.game.route();
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
    const d = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] }[dir];
    return start.now.terrain[(p.r + d[0]) * start.now.level.cols + p.c + d[1]] === 'wall';
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
```

Trial 1 must start with the player beside a wall (Task 8's level is designed so; the last test checks it).

- [ ] **Step 2: Run it to see it fail** — `node --test crete/test/game.test.ts`.

- [ ] **Step 3: Write game.ts** to the interface above. The thread: `hint()` solves from `run.now` and presses the first action (bump-safe; if unsolved, `say('The thread goes slack: undo or restart.', 'bad')`); `route()` toggles `thread` to the cells the line's player positions walk through (replay the line with `step`, collect `player` after each); `auto()` toggles playing: every `SLIDE_MS * 3` ms (through `timers`) press the next action of a fresh solve, stopping on a win, a loss, an unsolved state, any manual press or `open`. All three call `assist`.

- [ ] **Step 4: Rewire the page.**
  - `main.ts`: load `tiles.json` (import) and `fx/sprites/tiles.png` (an `Image` with the versioned URL the install tool writes, or a plain relative URL — check what `install-files.php` versions), create the board, the game and the UI; a `requestAnimationFrame` loop paints `drawList(run.now, figures, atlas, now)` and `thread`, where `figures` is `anim.timeline.at(now - anim.started)` while a turn animates and `{ player: run.now.player, minotaur: run.now.minotaur }` otherwise, and calls `game.finishAnim()` once `now - anim.started ≥ anim.timeline.duration`; the page's clock is `{ now: () => performance.now() }`; `?seed=` (any value) opens trial 1 with the title card closed; otherwise the title card shows. `window.__creteTest = { game, TRIALS, solve, initial, trialLevel }` for the browser specs; remove `__mazeTest`.
  - `ui.ts`: the board fit uses `fitCell(w, h, cols, boardRows(level, atlas), 0)` and `board.size(...)`; the keyboard maps `KEYS` through `actionFor` (moves, wait, undo, restart, hint, route, auto, mute, new) and tools through `itemFor(key, TOOLS)`; Q stays the kit's back key; keys wait while a card is up; Escape is not bound.
  - `strip.tsx`: the pad, `#btn-wait`, `#btn-undo`, `#btn-restart`, `#btn-hint`, `#btn-route`, `#btn-auto`, and `#tool-mirror`, `#tool-cake`, `#tool-cow` with counts; each with its key tab from `KEYS` / `TOOLS`. Bash is gone. Moves and tools are disabled when the try is over; Undo and Restart are not.
  - `status.tsx`: `#hud-trial`, `#hud-hearts` (title = `heartsNote`), `#hud-relics`, `#hud-keys`, `#hud-gear`, `#hud-moves`, and Menu.
  - `ui/trials.tsx`: a card `#trials-veil` listing the eight trials as buttons `#trial-1` … `#trial-8`, each with its title and a line `cleared · best N` / `cleared with help` / `not yet`; Q closes it back to where it was opened from. The title card's Play (`#title-play`, label from `KEYS.new`) opens it; N opens it in play.
  - `menu.tsx`: the seed box and random run are gone; sound, full screen, the story log, how to play (from `helpLines`), Quit stay.
  - `end.tsx`: won → the moves, the best, "with help" when assisted, buttons Next trial (`#end-next`, hidden after trial 8), Retry, Trials; lost → "The Minotaur has you", Undo, Restart.
  - `audio.ts`: the voice table gets `step, push, splash, sizzle, door, key, relic, gate, button, slide, caught, stone, win, lose, bump, pickup, page, hint`; drop `bash`, `hurt`, `open`, `answerOn`, `answerOff`, `heart`, `move` unless still used. `sizzle` plays when fire boots are taken and when you step on fire.
  - `game.css`: the canvas centred in `#board` with `image-rendering: auto`; the strip's new buttons keep the ≤ 400 px portrait rule fitting (the pad plus seven actions plus three tools must fit 320 px wide: put the thread buttons and the tools on a second grid row in that rule).
  - `index.html`, `README.md`, `metadata.yaml`: say what the game is now (tile puzzles in the Labyrinth, the Minotaur's rule, eight trials); no "text-based chase".

- [ ] **Step 5: Fix the remaining unit tests** that the rewire breaks (`keys`, `ui`, `views`, `smoke`, `audio`, `layers`): keep every case about Q, Escape, the layers and chords; replace seed and Bash cases with wait, undo, restart and the trial list.

- [ ] **Step 6: Build and run the units**

```bash
cd websites/www.cs/games && node _kit/build/build.mjs crete && (cd crete && php tools/install-files.php) && bash units.sh
```
Expected: PASS.

- [ ] **Step 7: Commit** — `git commit -m "Crete: the game plays the trials on the puzzle engine; the old chase is gone"`

### Task 11: The browser specs, docs, versions, then open PR C

**Files:**
- Modify: `websites/www.cs/tests/e2e/crete-play.spec.ts` (rewrite), `websites/www.cs/tests/e2e/crete-layout.spec.ts` (the board is a canvas)
- Modify: `websites/www.cs/games/crete/README.md`, the site pages and `sw.js` the version tools touch, `docs/` mentions of Crete's seeded chase if any (`git grep -n "seed" -- websites/www.cs/games/crete docs | grep -i crete`)

- [ ] **Step 1: Rewrite crete-play.spec.ts**

```ts
// How The Island of Crete plays, through its own buttons and keys. Any change to Crete must keep this green.
import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const PAGE = 'games/crete/';
const BUTTON: Record<string, string> = { up: '.mv-up', down: '.mv-down', left: '.mv-left', right: '.mv-right', wait: '#btn-wait' };

async function openTrial1(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(PAGE);
  await expect(page.locator('#title-veil')).toBeVisible();
  await page.locator('#title-play').click();
  await expect(page.locator('#trials-veil')).toBeVisible();
  await page.locator('#trial-1').click();
  await expect(page.locator('#trials-veil')).toBeHidden();
  return errors;
}

/** The winning line from the game's own solver, as button names. */
const line = (page: Page) => page.evaluate(() => {
  const t = (window as unknown as { __creteTest: any }).__creteTest;
  const r = t.solve(t.game.run.now);
  return r.solved ? r.line.map((a: any) => (a.kind === 'move' ? a.dir : a.kind)) as string[] : [];
});
const now = (page: Page) => page.evaluate(() => {
  const s = (window as unknown as { __creteTest: any }).__creteTest.game.run.now;
  return { moves: s.moves, hearts: s.hearts, outcome: s.outcome };
});

test('trial 1 is won through the strip, with an undo on the way', async ({ page }) => {
  const errors = await openTrial1(page);
  const steps = await line(page);
  expect(steps.length).toBeGreaterThan(0);
  await page.locator(BUTTON[steps[0]!]!).click();
  await page.locator('#btn-undo').click();
  expect((await now(page)).moves).toBe(0);
  for (const s of steps) await page.locator(BUTTON[s]!).click();
  expect((await now(page)).outcome).toBe('won');
  await expect(page.locator('#end-veil')).toBeVisible();
  await expect(page.locator('#hud-moves')).toHaveText(String(steps.length));
  expect(errors).toEqual([]);
});

test('walking straight at the exit gets you caught once: a heart lost, thrown back', async ({ page }) => {
  await openTrial1(page);
  const caught = await page.evaluate(() => {
    const t = (window as unknown as { __creteTest: any }).__creteTest;
    const lv = t.trialLevel(0);
    const free = t.solve(t.initial({ ...lv, minotaur: null }));
    return free.line.map((a: any) => a.dir as string);
  });
  for (const d of caught) {
    await page.locator(BUTTON[d]!).click();
    if ((await now(page)).hearts < 3) break;
  }
  const s = await now(page);
  expect(s.hearts).toBe(2);
  expect(s.outcome).toBe('playing');
  await expect(page.locator('#hud-hearts')).toHaveText('♥ 2');
});

test('keys: arrows move, U undoes, Q opens the menu and Escape does nothing', async ({ page }) => {
  await openTrial1(page);
  const steps = await line(page);
  const key: Record<string, string> = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', wait: '.' };
  await page.keyboard.press(key[steps[0]!]!);
  expect((await now(page)).moves).toBe(1);
  await page.keyboard.press('u');
  expect((await now(page)).moves).toBe(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('#menu-veil')).toBeHidden();
  await page.keyboard.press('q');
  await expect(page.locator('#menu-veil')).toBeVisible();
});

test('a ?seed= link opens trial 1', async ({ page }) => {
  await page.goto(`${PAGE}?seed=stefan-1984`);
  await expect(page.locator('#title-veil')).toBeHidden();
  await expect(page.locator('#hud-trial')).not.toHaveText('');
});
```

Keep any existing cases in the old spec that are about the shell rather than the chase (fullscreen, Escape, title card after Quit, the ending over the title card) and port them to the trial flow.

- [ ] **Step 2: Update crete-layout.spec.ts**: wait for `#stage[data-cell]` instead of `#stage .cell`; the cell size is `Number(canvas.dataset.cell)` and must be ≥ 8; "nothing over the maze" uses the canvas rect; the stats loop reads the new `#status-root .stat` items; the screens that opened a run now open trial 1 through `#title-play` → `#trial-1`; add the trial list to the screens checked (`#trials-veil .card` fits). Keep the ten screen sizes.

- [ ] **Step 3: Run the browser specs**

```bash
cd websites/www.cs && make e2e E2E_ARGS="crete-play.spec.ts crete-layout.spec.ts"
```
Expected: PASS. CI's Linux fonts are wider than macOS's: also run the layout spec with Verdana as the body font (temporarily, uncommitted) at 320, 360 and 393 px wide, and fix any button that leaves the frame.

- [ ] **Step 4: Docs and versions.** Update `games/crete/README.md` to describe the game as it is (the trials, the rules, the art pipeline and how to regenerate it, the test page); then from `websites/www.cs`: `php tools/site-versions.php && php tools/site-game-pages.php`, and `make test`.

- [ ] **Step 5: Commit, push, open PR C**

```bash
git add -A websites/www.cs docs
git commit -m "Crete: browser specs and docs for the trials"
git push -u origin crete/trials
gh pr create --title "Crete: eight trials on the puzzle engine, with the Blender board" --body "<summary of Tasks 8–11; that the seeded chase is removed and ?seed= opens trial 1; the spec and plan paths; the attribution lines>"
```

The controller runs the pr-fix loop, merges on green, and reports the cache-busted play link `https://www.cs.siue.edu/~wgrim/play/crete/?v=<sha>`.
