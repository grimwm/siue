/* The Island of Crete: the game itself, with no page in it. Seeded maze
 * generation, the chase rules and the run's state live here, so a Node test
 * can play a run. Everything the player sees or hears goes out through
 * `Hooks` (a log line, a sound name, "redraw", "show the ending"), and the
 * timers arrive as an argument too; src/ui.ts and src/audio.ts are the other
 * ends of those hooks. This file is in the DOM-free program (tsconfig.json),
 * so it cannot reach for `document` or `window`.
 * You move once per turn; the creature moves twice. Reach the exit alive.
 */

import type { Timers } from '../../_kit/ports.ts';
import { ROWS, COLS, DIRS, key, inBounds, unkey, grid, bfsDist, bfsPath, manhattan } from './grid.ts';
import type { Cell } from './grid.ts';
import { dasher, strategist } from './bots.ts';
import type { Bot, BotAction } from './bots.ts';
export { ROWS, COLS, key, bfsDist, bfsPath, manhattan };
export type { Cell };
export type { Timers };

/* ---------- seeded RNG (mulberry32 + string hash) ---------- */
export type Rng = () => number;

export function hashSeed(str: string): number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export function mulberry32(a: number): Rng {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- tuning ---------- */
export const MAX_HP = 20;
export const TOTAL_PAGES = 3;
const BARRIER_COUNT = 2;
const BASH_RANGE = 1;
const BASH_PUSH = 3;
const BASH_COOLDOWN = 3;

/* ---------- items: Z/X/C are far from WASD and 1-3 on purpose ---------- */
export type ItemKind = "shard" | "snack" | "jammer";
export type PickupKind = ItemKind | "page" | "fuse";

export interface ItemDef {
  key: string;
  name: string;
  desc: string;
}

export const ITEMS: Record<ItemKind, ItemDef> = {
  shard: {
    key: "Z",
    name: "Mirror Shard",
    desc: "Freeze the creature for one full turn.",
  },
  snack: {
    key: "X",
    name: "Sugar Puffs",
    desc: "Heal. Potency is rolled per run.",
  },
  jammer: {
    key: "C",
    name: "Signal Jammer",
    desc: "Hurl the creature far away. A weapon of static.",
  },
};

/* ---------- what the engine tells the page ---------- */
export type LogTone = "good" | "bad" | "info";
export type SfxName =
  | "move" | "bump" | "pickup" | "page" | "open" | "bash" | "hurt"
  | "win" | "lose" | "heart" | "hint" | "answerOn" | "answerOff";

export interface Hooks {
  say(text: string, tone?: LogTone): void;
  sfx(name: SfxName): void;
  /** The state changed: redraw the board and the HUD. */
  render(): void;
  /** The run ended (won or not): show the ending. */
  showEnd(won: boolean): void;
  timers: Timers;
}

/* ---------- state ---------- */

export interface State {
  seed: string;
  rng: Rng;
  /** walls[r][c] is true where a wall (or a closed barrier) stands. */
  walls: boolean[][];
  /** Cell keys (see key). */
  safe: Set<string>;
  barriers: Set<string>;
  pickups: Map<string, PickupKind>;
  player: Cell;
  foe: Cell;
  exit: Cell;
  hp: number;
  turns: number;
  pages: number;
  score: number;
  opened: number;
  /** Moves on the shortest route with every barrier open. */
  optimal: number;
  inv: Record<ItemKind, number>;
  fuses: number;
  snackHeal: number;
  foeSpawnDist: number;
  frozen: number;
  bashCd: number;
  /** Turns waited in a row; any other turn the player spends resets it. */
  stillTurns: number;
  dazed: number;
  hint: string | null;
  hintTimer: number;
  showRoute: boolean;
  auto: boolean;
  autoTimer: number;
  over: boolean;
  won: boolean;
  deathCause: string;
}


/* ---------- maze generation (randomized DFS + loop openings) ---------- */
export function carveMaze(rng: Rng): boolean[][] {
  const walls = grid(true);
  const stack: Array<[number, number]> = [[1, 1]];
  walls[1]![1] = false;
  while (stack.length) {
    const [r, c] = stack[stack.length - 1]!;
    const opts: Array<[number, number, number, number]> = [];
    for (const [dr, dc] of DIRS) {
      const nr = r + dr * 2,
        nc = c + dc * 2;
      if (nr > 0 && nr < ROWS - 1 && nc > 0 && nc < COLS - 1 && walls[nr]![nc]) {
        opts.push([nr, nc, r + dr, c + dc]);
      }
    }
    if (!opts.length) {
      stack.pop();
      continue;
    }
    const [nr, nc, br, bc] = opts[Math.floor(rng() * opts.length)]!;
    walls[br]![bc] = false;
    walls[nr]![nc] = false;
    stack.push([nr, nc]);
  }
  // Open loops so the chase has more than one line of escape.
  for (let i = 0; i < 16; i++) {
    const r = 1 + Math.floor(rng() * (ROWS - 2));
    const c = 1 + Math.floor(rng() * (COLS - 2));
    if (!walls[r]![c]) continue;
    const horiz = !walls[r]![c - 1] && !walls[r]![c + 1];
    const vert = !walls[r - 1]?.[c] && !walls[r + 1]?.[c];
    if (horiz !== vert) walls[r]![c] = false;
  }
  return walls;
}


/* ---------- run setup: fresh maze, permadeath ---------- */
export interface Layout {
  walls: boolean[][];
  safe: Set<string>;
  barriers: Set<string>;
  pickups: Map<string, PickupKind>;
  foe: Cell;
  foeDist: number;
  optimal: number;
}

const LOOT: PickupKind[] = ["shard", "snack", "jammer", "page", "page", "page", "fuse", "fuse"];

function buildMaze(rng: Rng, start: Cell, exit: Cell): Layout {
  const walls = carveMaze(rng);
  const path = bfsPath(walls, start, exit);

  // Two safe zones straddling the escape route, kept apart so both survive.
  const safe = new Set<string>();
  let prev: Cell | null = null;
  for (const frac of [1 / 3, 2 / 3]) {
    let idx = Math.floor(path.length * frac);
    let spot: Cell = path[idx] || exit;
    while (
      prev &&
      idx < path.length - 2 &&
      Math.abs(spot.r - prev.r) + Math.abs(spot.c - prev.c) < 6
    ) {
      idx += 1;
      spot = path[idx]!;
    }
    prev = spot;
    for (const [dr, dc] of [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ] as const) {
      const r = spot.r + dr,
        c = spot.c + dc;
      if (r > 0 && r < ROWS - 1 && c > 0 && c < COLS - 1) {
        walls[r]![c] = false;
        safe.add(key(r, c));
      }
    }
  }
  safe.delete(key(start.r, start.c));
  safe.delete(key(exit.r, exit.c));

  const taken = new Set<string>([
    key(start.r, start.c),
    key(exit.r, exit.c),
    ...safe,
  ]);

  // Fuse barriers sit on the escape route, spaced so they never bunch up.
  // A closed barrier is a real wall until a fuse opens it. Nothing pauses.
  const barriers = new Set<string>();
  for (let i = 0; i < BARRIER_COUNT; i++) {
    let idx = Math.floor((path.length * (i + 1)) / (BARRIER_COUNT + 1));
    while (idx < path.length - 1 && taken.has(key(path[idx]!.r, path[idx]!.c)))
      idx++;
    const cell = path[idx]!;
    if (!taken.has(key(cell.r, cell.c))) {
      barriers.add(key(cell.r, cell.c));
      walls[cell.r]![cell.c] = true;
      taken.add(key(cell.r, cell.c));
    }
  }

  // Loot must be reachable without crossing a closed barrier, or fuses deadlock.
  const reach = bfsDist(walls, start);
  const open: Cell[] = [];
  for (let r = 1; r < ROWS - 1; r++) {
    for (let c = 1; c < COLS - 1; c++) {
      const k = key(r, c);
      if (!walls[r]![c] && reach[r]![c] !== -1 && !taken.has(k))
        open.push({ r, c });
    }
  }
  const pickups = new Map<string, PickupKind>();
  for (const kind of LOOT) {
    if (!open.length) break;
    const spot = open.splice(Math.floor(rng() * open.length), 1)[0]!;
    pickups.set(key(spot.r, spot.c), kind);
    taken.add(key(spot.r, spot.c));
  }

  // The creature starts far: farthest from you, never camping the exit.
  const dist = bfsDist(walls, start);
  const distExit = bfsDist(walls, exit);
  const openWalls = walls.map((row) => row.slice());
  for (const k of barriers) {
    const [br, bc] = unkey(k);
    openWalls[br]![bc] = false;
  }
  const optimal = bfsDist(openWalls, start)[exit.r]![exit.c]!;
  const spots: Cell[] = [];
  for (let r = 1; r < ROWS - 1; r++) {
    for (let c = 1; c < COLS - 1; c++) {
      if (!walls[r]![c] && !taken.has(key(r, c)) && dist[r]![c] !== -1)
        spots.push({ r, c });
    }
  }
  const farFromExit = spots.filter((p) => distExit[p.r]![p.c]! >= 10);
  const pool = farFromExit.length ? farFromExit : spots;
  let foe: Cell | null = null,
    foeDist = -1;
  for (const p of pool) {
    if (dist[p.r]![p.c]! > foeDist) {
      foeDist = dist[p.r]![p.c]!;
      foe = p;
    }
  }
  if (!foe) foe = { ...exit };
  if (foeDist < 0) foeDist = 0;
  return { walls, safe, barriers, pickups, foe, foeDist, optimal };
}

/** The player's start cell. */
export const START: Readonly<Cell> = { r: 1, c: 1 };
/** The exit cell. */
export const EXIT: Readonly<Cell> = { r: ROWS - 2, c: COLS - 2 };

/** Attempt `attempt`'s layout stream. */
export function mazeRng(seed: string, attempt: number): Rng {
  return mulberry32(hashSeed(`${seed}:maze:${attempt}`));
}

/** Attempt `attempt`'s run stream: the creature's tie-breaks, the jammer, the snack. */
export function runRng(seed: string, attempt: number): Rng {
  return mulberry32(hashSeed(`${seed}:run:${attempt}`));
}

/** Attempt `attempt`'s maze; a fresh copy each call, since a run changes it as it plays. */
export function layoutFor(seed: string, attempt: number): Layout {
  return buildMaze(mazeRng(seed, attempt), START, EXIT);
}

/** Candidates a seed gets before falling back. */
export const MAX_ATTEMPTS = 80;
/** Past MAX_ATTEMPTS, draws continue only to find a maze the strategist wins; a safety bound; no swept seed gets near it. */
const LAST_ATTEMPT = 399;

export interface Trial {
  won: boolean;
  /** The creature ended a turn beside the bot, or caught it. */
  met: boolean;
  /** The fewest steps (Manhattan) between them at the end of any turn. */
  closest: number;
}

export type Judge = (seed: string, attempt: number, bot: Bot) => Trial;

export interface RunPick {
  attempt: number;
  /** No candidate passed both checks; this is the best winnable one. */
  fallback: boolean;
  layout: Layout;
  rng: Rng;
}

/** The creature never starts nearer than this to the player, barriers open. */
export const MIN_SPAWN = 8;

/** Steps from the start to the creature with every barrier open: what it takes the creature to arrive once the player has opened them. */
export function spawnDistance(layout: Layout): number {
  const open = layout.walls.map((row) => row.slice());
  for (const k of layout.barriers) {
    const [r, c] = unkey(k);
    open[r]![c] = false;
  }
  return bfsDist(open, START)[layout.foe.r]![layout.foe.c]!;
}

/**
 * Whether a candidate is a board at all. A closed barrier near the start can
 * seal off a pocket: too small for the loot, or leaving the creature on the
 * exit or a step or two from the player. Those are not mazes, whatever the
 * bots make of them.
 */
export function layoutOk(layout: Layout): boolean {
  const { foe } = layout;
  return (
    layout.pickups.size === LOOT.length &&
    !(foe.r === EXIT.r && foe.c === EXIT.c) &&
    spawnDistance(layout) >= MIN_SPAWN
  );
}

function pick(seed: string, attempt: number, fallback: boolean): RunPick {
  return { attempt, fallback, layout: layoutFor(seed, attempt), rng: runRng(seed, attempt) };
}

/**
 * A run's maze for a seed: the same seed always gives the same maze. The first
 * attempt whose dasher meets the creature and whose strategist escapes is
 * kept (spec section 4); failing that, the strategist-won attempt whose dasher
 * came closest. A maze the strategist loses is never returned.
 */
export function generateRun(seed: string, judge: Judge = trial): RunPick {
  let best: { attempt: number; closest: number } | null = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (!layoutOk(layoutFor(seed, attempt))) continue;
    const dash = judge(seed, attempt, dasher);
    // A non-meeting candidate can only matter as a closer fallback.
    if (!dash.met && best && dash.closest >= best.closest) continue;
    if (!judge(seed, attempt, strategist).won) continue;
    if (dash.met) return pick(seed, attempt, false);
    best = { attempt, closest: dash.closest };
  }
  if (best) return pick(seed, best.attempt, true);
  for (let attempt = MAX_ATTEMPTS; attempt <= LAST_ATTEMPT; attempt++) {
    if (layoutOk(layoutFor(seed, attempt)) && judge(seed, attempt, strategist).won) return pick(seed, attempt, true);
  }
  throw new Error(`Crete: no winnable maze for seed ${seed}`);
}

/** The seed a run uses: the typed one, or a fresh random one. */
export function chooseSeed(seedStr: string): string {
  return (seedStr || "").trim() || "stefan-" + Math.floor(Math.random() * 9000 + 1000);
}

/** A run's state before any maze exists. */
function blankState(): State {
  return {
    seed: "",
    rng: mulberry32(hashSeed("")),
    walls: [],
    safe: new Set(),
    barriers: new Set(),
    pickups: new Map(),
    player: { r: 1, c: 1 },
    foe: { r: 1, c: 1 },
    exit: { r: ROWS - 2, c: COLS - 2 },
    hp: MAX_HP,
    turns: 0,
    pages: 0,
    score: 0,
    opened: 0,
    optimal: 0,
    inv: { shard: 1, snack: 1, jammer: 1 },
    fuses: 0,
    snackHeal: 5,
    foeSpawnDist: 0,
    frozen: 0,
    bashCd: 0,
    stillTurns: 0,
    dazed: 0,
    hint: null,
    hintTimer: 0,
    showRoute: false,
    auto: false,
    autoTimer: 0,
    over: false,
    won: false,
    deathCause: "",
  };
}

const DIR_WORD: Record<string, string> = {
  "-1,0": "north ⬆️",
  "1,0": "south ⬇️",
  "0,-1": "west ⬅️",
  "0,1": "east ➡️",
};

/** The running game: its state and the actions that change it. */
export interface Game {
  G: State;
  newRun(seedStr: string): void;
  /** A run on attempt `attempt`'s layout and run stream. */
  startRun(seed: string, attempt: number): void;
  tryMove(dr: number, dc: number): void;
  bash(): void;
  useItem(kind: ItemKind): void;
  /** Spend a turn in place; the creature still moves. */
  wait(): void;
  /** Whether the jammer has somewhere far enough to throw the creature. */
  canJam(): boolean;
  hint(): void;
  clearHint(): void;
  toggleAnswer(): void;
  toggleAuto(): void;
  stopAuto(msg?: string): void;
  autoStep(): void;
  /** The page is hidden: stop the play-through and hint timers without ending either. */
  pause(): void;
  /** The page is back: re-arm what pause() stopped. Safe to call when nothing was paused. */
  resume(): void;
  goalPath(): Cell[];
  foeStep(): void;
  creaturePhase(bonusSteps: number): void;
  /** Steps from the player to the creature, -1 if there is no way. */
  foeDistance(): number;
  /** Ends the run where it stands, with no ending card: the player is leaving. */
  quit(): void;
}

const popcount = (n: number): number => (n === 0 ? 0 : (n & 1) + popcount(n >> 1));

export function createGame(hooks: Hooks): Game {
  const G = blankState();
  const { say, sfx, timers } = hooks;
  const render = (): void => hooks.render();

  function newRun(seedStr: string): void {
    const seed = chooseSeed(seedStr);
    const { rng, layout } = generateRun(seed);
    applyRun(seed, layout, rng);
  }

  function startRun(seed: string, attempt: number): void {
    applyRun(seed, layoutFor(seed, attempt), runRng(seed, attempt));
  }

  function applyRun(seed: string, layout: Layout, rng: Rng): void {
    const { walls, safe, barriers, pickups, foe, foeDist, optimal } = layout;
    Object.assign(G, {
      seed,
      rng,
      walls,
      safe,
      barriers,
      pickups,
      player: { ...START },
      foe,
      hp: MAX_HP,
      turns: 0,
      pages: 0,
      score: 0,
      opened: 0,
      optimal,
      inv: { shard: 1, snack: 1, jammer: 1 },
      fuses: 0,
      snackHeal: 4 + Math.floor(rng() * 3),
      foeSpawnDist: foeDist,
      frozen: 0,
      bashCd: 0,
      stillTurns: 0,
      dazed: 0,
      hint: null,
      hintTimer: 0,
      showRoute: false,
      auto: false,
      autoTimer: 0,
      over: false,
      won: false,
      deathCause: "",
    });
  }

  /* ---------- the chase: two creature steps per player turn ---------- */
  function foeStep(): void {
    const { walls, safe, player, foe } = G;
    if (foe.r === player.r && foe.c === player.c) return;
    const dist = bfsDist(walls, player);
    const options = DIRS.map(([dr, dc]) => ({
      r: foe.r + dr,
      c: foe.c + dc,
    })).filter(
      (p) => inBounds(p.r, p.c) && !walls[p.r]![p.c] && !safe.has(key(p.r, p.c)),
    );
    if (!options.length) return;
    const distTo = (p: Cell): number => dist[p.r]![p.c]!;
    options.sort((a, b) => {
      const da = distTo(a) === -1 ? 1e9 : distTo(a);
      const db = distTo(b) === -1 ? 1e9 : distTo(b);
      return da - db;
    });
    const bestD = distTo(options[0]!);
    const tied = options.filter((p) => distTo(p) === bestD);
    const next = tied[Math.floor(G.rng() * tied.length)]!;
    foe.r = next.r;
    foe.c = next.c;
  }

  function creaturePhase(bonusSteps: number): void {
    if (G.over) return;
    G.bashCd = Math.max(0, G.bashCd - 1);
    const slowed = G.dazed > 0;
    G.dazed = 0;
    if (G.frozen > 0) {
      G.frozen -= 1;
      say("The creature judders, trapped inside the mirror static.", "good");
      return;
    }
    const steps = (slowed ? 1 : 2) + (bonusSteps || 0);
    for (let i = 0; i < steps; i++) {
      foeStep();
      if (
        G.foe.r === G.player.r &&
        G.foe.c === G.player.c &&
        !G.safe.has(key(G.player.r, G.player.c))
      ) {
        die("It found you between the frames. The screen goes white.");
        return;
      }
    }
    // Its aura burns: ending a turn beside it costs HP, safe zone or not.
    if (Math.abs(G.foe.r - G.player.r) + Math.abs(G.foe.c - G.player.c) === 1) {
      say("Its proximity burns (−2 HP). Keep moving.", "bad");
      if (wound(2)) {
        render();
        return;
      }
    }
  }

  function die(cause: string): void {
    stopAuto();
    clearHint();
    G.hint = null;
    G.over = true;
    G.won = false;
    G.deathCause = cause;
    sfx("lose");
    say(cause, "bad");
    hooks.showEnd(false);
  }

  function heal(n: number): number {
    const before = G.hp;
    G.hp = Math.min(MAX_HP, G.hp + n);
    return G.hp - before;
  }

  function wound(n: number): boolean {
    G.hp -= n;
    sfx("hurt");
    if (G.hp <= 0) {
      G.hp = 0;
      die("The static wore you down to nothing.");
      return true;
    }
    return false;
  }

  /* ---------- player actions ---------- */
  let autoPilot = false;
  // Timers pause() stopped and resume() should re-arm.
  let autoPaused = false;
  let hintPaused = false;
  function blockedMsg(): boolean {
    if (G.auto && !autoPilot) {
      say("Play-through is running — press T to take over.", "info");
      return true;
    }
    if (G.over) {
      say("Run over — press N for a new run.", "info");
      return true;
    }
    return false;
  }

  function tryMove(dr: number, dc: number): void {
    if (blockedMsg()) return;
    const nr = G.player.r + dr,
      nc = G.player.c + dc;
    if (!inBounds(nr, nc) || G.walls[nr]![nc]) {
      if (G.barriers.has(key(nr, nc))) {
        if (G.fuses > 0) {
          G.fuses -= 1;
          G.opened += 1;
          G.barriers.delete(key(nr, nc));
          G.walls[nr]![nc] = false;
          G.score += 40;
          sfx("open");
          say("Key placed. The 🚧 barrier grinds open (+40). Run!", "good");
        } else {
          sfx("bump");
          say(
            "🚧 barrier. It wants a 🔌 fuse. Find one — the Labyrinth never waits.",
            "info",
          );
          return;
        }
      } else {
        sfx("bump");
        say("Wall. The Labyrinth declines. That step costs nothing.", "info");
        return;
      }
    }
    G.player.r = nr;
    G.player.c = nc;
    G.turns += 1;
    G.stillTurns = 0;
    sfx("move");
    resolveTile();
    if (!G.over) creaturePhase(0);
    render();
  }

  function bash(): void {
    if (blockedMsg()) return;
    if (G.bashCd > 0) {
      say(`Bash is recharging (${G.bashCd} turns). Move instead.`, "info");
      return;
    }
    const dr = G.foe.r - G.player.r,
      dc = G.foe.c - G.player.c;
    if (Math.abs(dr) + Math.abs(dc) !== BASH_RANGE) {
      say(
        "Nothing in reach. Bash (Space) only lands on the adjacent creature.",
        "info",
      );
      return;
    }
    const stepR = Math.sign(dr),
      stepC = Math.sign(dc);
    let tr = G.foe.r,
      tc = G.foe.c;
    for (let i = 0; i < BASH_PUSH; i++) {
      const nr = tr + stepR,
        nc = tc + stepC;
      if (
        !inBounds(nr, nc) ||
        G.walls[nr]![nc] ||
        G.safe.has(key(nr, nc)) ||
        (nr === G.player.r && nc === G.player.c)
      )
        break;
      tr = nr;
      tc = nc;
    }
    G.foe.r = tr;
    G.foe.c = tc;
    G.bashCd = BASH_COOLDOWN;
    G.dazed = 1;
    G.turns += 1;
    G.stillTurns = 0;
    sfx("bash");
    say(
      "You slam the static with a CRT monitor. The 👹 reels backwards, dazed — it moves once, not twice.",
      "good",
    );
    creaturePhase(0);
    render();
  }

  function resolveTile(): void {
    const k = key(G.player.r, G.player.c);
    if (G.player.r === G.exit.r && G.player.c === G.exit.c) {
      G.over = true;
      G.won = true;
      stopAuto();
      sfx("win");
      hooks.showEnd(true);
      return;
    }
    if (G.safe.has(k)) {
      say(
        "Safe zone. The static cannot cross the blue lines. Breathe.",
        "good",
      );
    }
    const kind = G.pickups.get(k);
    if (kind !== undefined) {
      G.pickups.delete(k);
      if (kind === "page") {
        G.pages += 1;
        G.score += 100;
        sfx("page");
        say(
          `Script page ${G.pages}/${TOTAL_PAGES} recovered (+100). The ending sharpens.`,
          "good",
        );
      } else if (kind === "fuse") {
        G.fuses += 1;
        G.score += 20;
        sfx("pickup");
        say(
          `🔌 fuse recovered (${G.fuses} held, +20). Barriers fear you.`,
          "good",
        );
      } else {
        G.inv[kind] = Math.min(3, G.inv[kind] + 1);
        sfx("pickup");
        say(
          `Picked up: ${ITEMS[kind].name}. Use it with ${ITEMS[kind].key}.`,
          "good",
        );
      }
    }
  }

  function useItem(kind: ItemKind): void {
    if (blockedMsg()) return;
    if (G.inv[kind] <= 0) {
      say(`No ${ITEMS[kind].name} left. The maze keeps what it takes.`, "info");
      return;
    }
    if (kind === "snack" && G.hp >= MAX_HP) {
      say(
        "Already at full health. The Sugar Puffs stay in your pocket — no turn spent.",
        "info",
      );
      return;
    }
    if (kind === "jammer" && !canJam()) {
      say(
        "Signal Jammer hisses. Nowhere far is left to throw it — no turn spent.",
        "info",
      );
      return;
    }
    G.inv[kind] -= 1;
    if (kind === "shard") {
      // Free action: freezing costs no turn, so you move while it stands still.
      G.frozen = 1;
      say(
        "Mirror Shard raised. The creature freezes solid — move, it skips its next turn.",
        "good",
      );
      render();
      return;
    }
    G.turns += 1;
    G.stillTurns = 0;
    if (kind === "snack") {
      const got = heal(G.snackHeal);
      say(`Sugar Puffs (+${got} HP). Theseus types faster.`, "good");
      creaturePhase(0);
    } else if (kind === "jammer") {
      const spot = farSpot(6)!;
      G.foe.r = spot.r;
      G.foe.c = spot.c;
      say(
        "Signal Jammer screams. The creature is hurled deep into the static.",
        "good",
      );
      creaturePhase(0);
    }
    render();
  }

  function farCells(minDist: number): Cell[] {
    const dist = bfsDist(G.walls, G.player);
    const cands: Cell[] = [];
    for (let r = 1; r < ROWS - 1; r++) {
      for (let c = 1; c < COLS - 1; c++) {
        if (!G.walls[r]![c] && !G.safe.has(key(r, c)) && dist[r]![c]! >= minDist)
          cands.push({ r, c });
      }
    }
    return cands;
  }

  function farSpot(minDist: number): Cell | null {
    const cands = farCells(minDist);
    if (!cands.length) return null;
    return cands[Math.floor(G.rng() * cands.length)]!;
  }

  function canJam(): boolean {
    return farCells(6).length > 0;
  }

  function wait(): void {
    if (blockedMsg()) return;
    G.turns += 1;
    G.stillTurns += 1;
    say("You hold still behind the blue lines and let it pace.", "info");
    creaturePhase(0);
    render();
  }

  /* ---------- hint: one move in advance ---------- */
  /**
   * The fewest-step trip to the exit, counting any fuses worth fetching on
   * the way, and with equal steps the one that spends fewer fuses. The search
   * runs over (cell, which board fuses are already taken, barriers crossed):
   * stepping on a fuse takes it, crossing a barrier spends one. Empty when
   * the exit is out of reach even with every fuse.
   */
  function bestTrip(): Cell[] {
    const fuseCells: number[] = [];
    for (const [k, v] of G.pickups) {
      if (v !== "fuse") continue;
      const [r, c] = unkey(k);
      fuseCells.push(r * COLS + c);
    }
    const masks = 1 << fuseCells.length;
    const maxSpent = G.fuses + fuseCells.length;
    const K = maxSpent + 1;
    const total = ROWS * COLS * masks * K;
    const idx = (cell: number, mask: number, spent: number): number => (cell * masks + mask) * K + spent;
    const from = new Int32Array(total).fill(-2);
    const dist = new Int32Array(total).fill(-1);
    const startCell = G.player.r * COLS + G.player.c;
    const start = idx(startCell, 0, 0);
    from[start] = -1;
    dist[start] = 0;
    const queue = [start];
    let best = -1;
    for (let head = 0; head < queue.length; head++) {
      const cur = queue[head]!;
      if (best !== -1 && dist[cur]! > dist[best]!) break;
      const spent = cur % K;
      const rest = (cur - spent) / K;
      const mask = rest % masks;
      const cell = (rest - mask) / masks;
      const r = Math.floor(cell / COLS),
        c = cell % COLS;
      if (r === G.exit.r && c === G.exit.c) {
        if (best === -1 || spent < best % K) best = cur;
        continue;
      }
      const held = G.fuses + popcount(mask) - spent;
      for (const [dr, dc] of DIRS) {
        const nr = r + dr,
          nc = c + dc;
        if (!inBounds(nr, nc)) continue;
        let nSpent = spent,
          nMask = mask;
        if (G.walls[nr]![nc]) {
          if (!G.barriers.has(key(nr, nc)) || held < 1) continue;
          nSpent += 1;
        } else {
          const f = fuseCells.indexOf(nr * COLS + nc);
          if (f !== -1) nMask |= 1 << f;
        }
        const next = idx(nr * COLS + nc, nMask, nSpent);
        if (from[next] !== -2) continue;
        from[next] = cur;
        dist[next] = dist[cur]! + 1;
        queue.push(next);
      }
    }
    if (best === -1) return [];
    const path: Cell[] = [];
    for (let at = best; at !== -1; at = from[at]!) {
      const spent = at % K;
      const cell = Math.floor(((at - spent) / K) / masks);
      path.push({ r: Math.floor(cell / COLS), c: cell % COLS });
    }
    return path.reverse();
  }

  function goalPath(): Cell[] {
    const open = bfsPath(G.walls, G.player, G.exit);
    if (open.length) return open;
    const trip = bestTrip();
    if (trip.length) return trip;
    // Out of reach even with every fuse: head for the nearest one.
    const d = bfsDist(G.walls, G.player);
    let target: Cell | null = null,
      bestD = 1e9;
    for (const [k, v] of G.pickups) {
      if (v !== "fuse") continue;
      const [r, c] = unkey(k);
      if (d[r]![c] !== -1 && d[r]![c]! < bestD) {
        bestD = d[r]![c]!;
        target = { r, c };
      }
    }
    if (!target) return [];
    return bfsPath(G.walls, G.player, target);
  }

  function clearHint(): void {
    if (G.hintTimer) timers.clearTimeout(G.hintTimer);
    hintPaused = false;
  }

  function armHintFade(): void {
    G.hintTimer = timers.setTimeout(() => {
      G.hint = null;
      render();
    }, 1600);
  }

  function hint(): void {
    if (blockedMsg()) return;
    const p = goalPath();
    if (p.length < 2) {
      say("No route anywhere. You are the maze now.", "info");
      return;
    }
    const nx = p[1]!;
    G.hint = key(nx.r, nx.c);
    sfx("hint");
    say(
      `Hint: head ${DIR_WORD[nx.r - G.player.r + "," + (nx.c - G.player.c)]}. One move only — the rest is yours.`,
      "info",
    );
    render();
    clearHint();
    armHintFade();
  }

  /* ---------- answer: reveal the whole route ---------- */
  function toggleAnswer(): void {
    if (G.over) {
      say("Run over — press N for a new run.", "info");
      return;
    }
    G.showRoute = !G.showRoute;
    sfx(G.showRoute ? "answerOn" : "answerOff");
    say(
      G.showRoute
        ? "Answer revealed: the green trail is the shortest way out."
        : "Answer hidden. Back to instinct.",
      "info",
    );
    render();
  }

  /* ---------- play-through: the game plays itself ---------- */
  function toggleAuto(): void {
    if (G.auto) {
      stopAuto("Play-through paused. Your run again.");
      return;
    }
    if (blockedMsg()) return;
    G.auto = true;
    say("▶ Play-through running. Press T to take over.", "info");
    render();
    G.autoTimer = timers.setInterval(autoStep, 350);
  }

  function stopAuto(msg?: string): void {
    if (G.autoTimer) timers.clearInterval(G.autoTimer);
    G.autoTimer = 0;
    autoPaused = false;
    G.auto = false;
    if (msg && !G.over) {
      say(msg, "info");
      render();
    }
  }

  function autoStep(): void {
    if (!G.auto || G.over) {
      stopAuto();
      return;
    }
    autoPilot = true;
    try {
      const action = strategist(game);
      if (action.kind === "stuck") {
        stopAuto("Play-through is stuck. Your move.");
        return;
      }
      perform(game, action);
    } finally {
      autoPilot = false;
    }
  }

  /* A hidden tab runs no auto-step and no hint fade: the play-through stays
     "running" (G.auto) and the hint stays shown, and resume() re-arms both. */
  function pause(): void {
    if (G.autoTimer) {
      timers.clearInterval(G.autoTimer);
      G.autoTimer = 0;
      autoPaused = true;
    }
    if (G.hint !== null && G.hintTimer) {
      timers.clearTimeout(G.hintTimer);
      G.hintTimer = 0;
      hintPaused = true;
    }
  }

  function resume(): void {
    if (autoPaused) {
      autoPaused = false;
      if (G.auto && !G.over) G.autoTimer = timers.setInterval(autoStep, 350);
    }
    if (hintPaused) {
      hintPaused = false;
      if (G.hint !== null) armHintFade();
    }
  }

  function foeDistance(): number {
    return bfsDist(G.walls, G.player)[G.foe.r]![G.foe.c]!;
  }

  function quit(): void {
    if (G.over) return;
    stopAuto();
    clearHint();
    G.hint = null;
    G.over = true;
    G.won = false;
    render();
  }

  const game: Game = {
    G, newRun, startRun, tryMove, bash, useItem, wait, canJam, hint, clearHint, toggleAnswer, toggleAuto,
    stopAuto, autoStep, pause, resume, goalPath, foeStep, creaturePhase, foeDistance, quit,
  };
  return game;
}

/** Carries out a bot's choice through the same actions a player has. */
export function perform(game: Game, action: BotAction): void {
  switch (action.kind) {
    case "bash": game.bash(); break;
    case "item": game.useItem(action.item); break;
    case "wait": game.wait(); break;
    case "move": game.tryMove(action.dr, action.dc); break;
    case "stuck": break;
  }
}

const INERT_TIMERS: Timers = {
  setTimeout: () => 0,
  clearTimeout: () => {},
  setInterval: () => 0,
  clearInterval: () => {},
};
/** A bot that has not finished by then has lost. */
const TRIAL_ACTIONS = 600;

/** Plays attempt `attempt` of `seed` with `bot` under the real rules, from the stream the real run would use. */
export function trial(seed: string, attempt: number, bot: Bot): Trial {
  const game = createGame({ say() {}, sfx() {}, render() {}, showEnd() {}, timers: INERT_TIMERS });
  game.startRun(seed, attempt);
  const G = game.G;
  let closest = manhattan(G.player, G.foe);
  for (let i = 0; i < TRIAL_ACTIONS && !G.over; i++) {
    const action = bot(game);
    if (action.kind === "stuck") break;
    perform(game, action);
    closest = Math.min(closest, manhattan(G.player, G.foe));
  }
  return { won: G.won, met: closest <= 1, closest };
}
