/* The Island of Crete: the game itself, with no page in it. Seeded maze
 * generation, the chase rules and the run's state live here, so a Node test
 * can play a run. Everything the player sees or hears goes out through
 * `Hooks` (a log line, a sound name, "redraw", "show the ending"), and the
 * timers arrive as an argument too; src/ui.ts and src/audio.ts are the other
 * ends of those hooks. This file is in the DOM-free program (tsconfig.json),
 * so it cannot reach for `document` or `window`.
 * You move once per turn; the creature moves twice. Reach the exit alive.
 */

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
export const ROWS = 15;
export const COLS = 15;
export const MAX_HP = 20;
export const TOTAL_PAGES = 3;
const BARRIER_COUNT = 2;
const MISTAKE_BUDGET = 6;
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

/** The timer functions the engine needs; the page passes its own. */
export interface Timers {
  setTimeout(fn: () => void, ms: number): number;
  clearTimeout(id: number): void;
  setInterval(fn: () => void, ms: number): number;
  clearInterval(id: number): void;
}

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
export interface Cell {
  r: number;
  c: number;
}

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
  /** Wrong turns you can afford. */
  budget: number;
  inv: Record<ItemKind, number>;
  fuses: number;
  snackHeal: number;
  foeSpawnDist: number;
  frozen: number;
  bashCd: number;
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

export const key = (r: number, c: number): string => r + "," + c;
const inBounds = (r: number, c: number): boolean => r >= 0 && r < ROWS && c >= 0 && c < COLS;
const DIRS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

/** A [row, column] pair from a cell key. */
function unkey(k: string): [number, number] {
  const [r, c] = k.split(",").map(Number);
  return [r!, c!];
}

/** Every cell of a ROWS x COLS grid set to `value`. */
function grid<T>(value: T): T[][] {
  return Array.from({ length: ROWS }, () => Array<T>(COLS).fill(value));
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

/** Steps from `t` to every cell (-1 where unreachable, or all -1 if `t` is a wall). */
export function bfsDist(walls: boolean[][], t: Cell): number[][] {
  const dist = grid(-1);
  if (walls[t.r]![t.c]) return dist;
  const q: Array<[number, number]> = [[t.r, t.c]];
  dist[t.r]![t.c] = 0;
  while (q.length) {
    const [r, c] = q.shift()!;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr,
        nc = c + dc;
      if (inBounds(nr, nc) && !walls[nr]![nc] && dist[nr]![nc] === -1) {
        dist[nr]![nc] = dist[r]![c]! + 1;
        q.push([nr, nc]);
      }
    }
  }
  return dist;
}

/** The shortest route from `from` to `to`, both included; empty when there is none. */
export function bfsPath(walls: boolean[][], from: Cell, to: Cell): Cell[] {
  const dist = bfsDist(walls, to);
  if (dist[from.r]![from.c] === -1) return [];
  const path: Cell[] = [{ ...from }];
  let cur: Cell = { ...from };
  while (cur.r !== to.r || cur.c !== to.c) {
    const here = cur;
    const next = DIRS.map(([dr, dc]) => ({ r: here.r + dr, c: here.c + dc }))
      .filter(
        (p) =>
          inBounds(p.r, p.c) && !walls[p.r]![p.c] && dist[p.r]![p.c] !== -1,
      )
      .sort((a, b) => dist[a.r]![a.c]! - dist[b.r]![b.c]!)[0];
    if (!next) return [];
    path.push(next);
    cur = next;
  }
  return path;
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
  /** Spare turns: the creature's distance minus your optimal route. */
  margin: number;
}

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
  const loot: PickupKind[] = [
    "shard",
    "snack",
    "jammer",
    "page",
    "page",
    "page",
    "fuse",
    "fuse",
  ];
  for (const kind of loot) {
    if (!open.length) break;
    const spot = open.splice(Math.floor(rng() * open.length), 1)[0]!;
    pickups.set(key(spot.r, spot.c), kind);
    taken.add(key(spot.r, spot.c));
  }

  // The creature starts far: farthest from you, never camping the exit.
  // margin = spare turns = foe distance minus your optimal route. That is how
  // many wrong turns you can afford before escape becomes impossible.
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
  const margin = foeDist - optimal;
  return { walls, safe, barriers, pickups, foe, foeDist, optimal, margin };
}

/** The player's start cell. */
export const START: Readonly<Cell> = { r: 1, c: 1 };
/** The exit cell. */
export const EXIT: Readonly<Cell> = { r: ROWS - 2, c: COLS - 2 };

/**
 * A run's maze for a seed: the same seed always gives the same maze. Mazes are
 * generated until the escape math works (the optimal route plus a spare
 * mistake budget fits inside the creature's starting distance); attempts just
 * advance the same rng stream. The rng comes back too, since the run keeps
 * drawing from it.
 */
export function generateRun(seed: string): { rng: Rng; layout: Layout } {
  const rng = mulberry32(hashSeed(seed));
  let best: Layout | null = null;
  for (let attempt = 0; attempt < 80; attempt++) {
    const cand = buildMaze(rng, START, EXIT);
    if (!best || cand.margin > best.margin) best = cand;
    if (cand.margin >= MISTAKE_BUDGET) {
      best = cand;
      break;
    }
  }
  return { rng, layout: best! };
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
    budget: 0,
    inv: { shard: 1, snack: 1, jammer: 1 },
    fuses: 0,
    snackHeal: 5,
    foeSpawnDist: 0,
    frozen: 0,
    bashCd: 0,
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
  tryMove(dr: number, dc: number): void;
  bash(): void;
  useItem(kind: ItemKind): void;
  hint(): void;
  clearHint(): void;
  toggleAnswer(): void;
  toggleAuto(): void;
  stopAuto(msg?: string): void;
  autoStep(): void;
  goalPath(): Cell[];
  foeStep(): void;
  creaturePhase(bonusSteps: number): void;
  /** Steps from the player to the creature, -1 if there is no way. */
  foeDistance(): number;
}

export function createGame(hooks: Hooks): Game {
  const G = blankState();
  const { say, sfx, timers } = hooks;
  const render = (): void => hooks.render();

  function newRun(seedStr: string): void {
    const seed = chooseSeed(seedStr);
    const { rng, layout } = generateRun(seed);
    const { walls, safe, barriers, pickups, foe, foeDist, optimal, margin } = layout;
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
      budget: margin,
      inv: { shard: 1, snack: 1, jammer: 1 },
      fuses: 0,
      snackHeal: 4 + Math.floor(rng() * 3),
      foeSpawnDist: foeDist,
      frozen: 0,
      bashCd: 0,
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
    if (kind === "jammer" && !farSpot(6)) {
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

  function farSpot(minDist: number): Cell | null {
    const dist = bfsDist(G.walls, G.player);
    const cands: Cell[] = [];
    for (let r = 1; r < ROWS - 1; r++) {
      for (let c = 1; c < COLS - 1; c++) {
        const k = key(r, c);
        if (!G.walls[r]![c] && !G.safe.has(k) && dist[r]![c]! >= minDist)
          cands.push({ r, c });
      }
    }
    if (!cands.length) return null;
    return cands[Math.floor(G.rng() * cands.length)]!;
  }

  /* ---------- hint: one move in advance ---------- */
  function goalPath(): Cell[] {
    const p = bfsPath(G.walls, G.player, G.exit);
    if (p.length) return p;
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
    G.hintTimer = timers.setTimeout(() => {
      G.hint = null;
      render();
    }, 1600);
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
      if (
        Math.abs(G.foe.r - G.player.r) + Math.abs(G.foe.c - G.player.c) === 1 &&
        G.bashCd === 0
      ) {
        bash();
        return;
      }
      const p = goalPath();
      if (p.length < 2) {
        stopAuto("Play-through is stuck. Your move.");
        return;
      }
      tryMove(p[1]!.r - G.player.r, p[1]!.c - G.player.c);
    } finally {
      autoPilot = false;
    }
  }

  function foeDistance(): number {
    return bfsDist(G.walls, G.player)[G.foe.r]![G.foe.c]!;
  }

  return {
    G, newRun, tryMove, bash, useItem, hint, clearHint, toggleAnswer, toggleAuto,
    stopAuto, autoStep, goalPath, foeStep, creaturePhase, foeDistance,
  };
}
