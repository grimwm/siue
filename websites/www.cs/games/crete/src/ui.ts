/* The Island of Crete: the page. Draws the board, the status bar, the strip,
 * the toast and the cards, and turns keys and clicks into game actions. It
 * reads the engine's state and calls its actions; it holds no rules. Only the
 * engine's types are imported; `createUi` takes the values it borrows as
 * arguments. Needs the DOM lib, so it is in the second program
 * (src/tsconfig.dom.json).
 */
import { isBackKey, typesText } from "../../_kit/keys.ts";
import type { Game, ItemDef, ItemKind, LogTone } from "./engine.ts";
import { KEYS, MOVE_DELTA, actionFor, isMove, itemFor } from "./keys.ts";
import { createLayers } from "./layers.ts";
import type { LayerName } from "./layers.ts";
import { statusView } from "./status.ts";
import { fitCell } from "./fit.ts";
import { helpLines } from "./help.ts";
import { renderEndCard } from "./ui/end.tsx";
import type { EndView } from "./ui/end.tsx";
import { renderMenu } from "./ui/menu.tsx";
import type { LogLine } from "./ui/menu.tsx";
import { renderStatus } from "./ui/status.tsx";
import { renderStoryCard } from "./ui/story.tsx";
import { renderStrip } from "./ui/strip.tsx";
import type { ToolRow } from "./ui/strip.tsx";
import { renderTitleCard } from "./ui/title.tsx";

/** What the page borrows from the engine at run time. */
export interface UiDeps {
  ROWS: number;
  COLS: number;
  MAX_HP: number;
  TOTAL_PAGES: number;
  ITEMS: Record<ItemKind, ItemDef>;
  /** The key a cell goes by in the engine's sets. */
  key(r: number, c: number): string;
  /** The heartbeat sound for a creature close by. */
  heart(): void;
}

/** What a key press or click asks of the page. */
export interface Controls {
  game: Game;
  /** A new run on this seed ("" for a fresh random one). */
  restart(seed: string): void;
  toggleMute(): void;
  toggleFullscreen(): void;
  /** Wake the speakers: any gesture does. */
  wake(): void;
  /** Leave the game (the menu's Quit). */
  quit(): void;
  /** Play on the title card. */
  play(): void;
}

export interface Ui {
  /** A line for the toast and the story log. */
  say(text: string, tone?: LogTone): void;
  render(game: Game): void;
  /** The ending card, over the title card. */
  showEnd(game: Game, won: boolean): void;
  clearLog(): void;
  /** Put the run's seed in the seed box and in the address. */
  showSeed(seed: string): void;
  setMuted(muted: boolean): void;
  setFullscreen(on: boolean): void;
  bindControls(controls: Controls): void;
  /** The title card, alone; `hint` adds how to close an installed app. */
  showTitle(hint: boolean): void;
  /** Closes every card. */
  closeLayers(): void;
  /** The card showing now, if any. */
  top(): LayerName | null;
}

const LOOT_EMOJI: Record<string, string> = {
  shard: "🔮",
  snack: "🥣",
  jammer: "📻",
  page: "📄",
  fuse: "🔌",
};

const LOG_LIMIT = 80;
const TOAST_MS = 4000;

const $ = (id: string): HTMLElement => document.getElementById(id)!;

export function createUi(deps: UiDeps): Ui {
  const { ROWS, COLS, MAX_HP, TOTAL_PAGES, ITEMS, key } = deps;
  const itemKinds = Object.keys(ITEMS) as ItemKind[];
  const itemKeys = itemKinds.map((k) => ITEMS[k].key);

  const log: LogLine[] = [];
  let seedText = "";
  let runInfo = "";
  let muted = false;
  let full = false;
  let toastTimer = 0;
  let controls: Controls | null = null;
  let game: Game | null = null;
  let end: EndView = { open: false, kicker: "", title: "", text: "", score: "" };
  let titleHint = false;

  const layers = createLayers(() => {
    if (layers.any()) game?.stopAuto();
    drawLayers();
  });

  function drawLayers(): void {
    renderTitleCard($("title-root"), {
      open: layers.isOpen("title"),
      hint: titleHint,
      onPlay: () => controls?.play(),
      onStory: () => layers.open("story"),
      onSettings: () => layers.open("menu"),
    });
    renderEndCard($("end-root"), {
      ...end,
      open: layers.isOpen("end"),
      onAgain: () => controls?.restart(seedText),
    });
    renderStoryCard($("story-root"), { open: layers.isOpen("story"), onClose: () => layers.close("story") });
    renderMenu($("menu-root"), {
      open: layers.isOpen("menu"),
      seed: seedText,
      runInfo,
      muted,
      fullscreen: full,
      log,
      help: helpLines(KEYS, itemKeys),
      onSeed: (text) => {
        seedText = text;
        drawLayers();
      },
      onPlaySeed: () => controls?.restart(seedText),
      onRandom: () => {
        controls?.wake();
        controls?.restart("");
      },
      onSound: () => {
        controls?.wake();
        controls?.toggleMute();
      },
      onFullscreen: () => controls?.toggleFullscreen(),
      onQuit: () => {
        controls?.wake();
        controls?.quit();
      },
      onClose: () => layers.close("menu"),
    });
  }

  function say(text: string, tone?: LogTone): void {
    log.push(tone ? { text, tone } : { text });
    while (log.length > LOG_LIMIT) log.shift();
    const toast = $("toast");
    toast.textContent = text;
    toast.className = tone ? `toast show ${tone}` : "toast show";
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), TOAST_MS);
    if (layers.isOpen("menu")) drawLayers();
  }

  /** The cell size: the largest whole pixel count that fits the space the board has left. */
  function fit(): void {
    const board = $("board");
    const stage = $("stage");
    const bs = getComputedStyle(board);
    const w = board.clientWidth - parseFloat(bs.paddingLeft) - parseFloat(bs.paddingRight);
    const h = board.clientHeight - parseFloat(bs.paddingTop) - parseFloat(bs.paddingBottom);
    const gap = parseFloat(getComputedStyle(stage).columnGap) || 0;
    stage.style.setProperty("--cell", `${Math.max(1, fitCell(w, h, COLS, ROWS, gap))}px`);
  }

  function toolRows(g: Game): ToolRow[] {
    const G = g.G;
    return itemKinds.map((kind) => {
      const def = ITEMS[kind];
      const useNote = kind === "shard" ? " Move right after." : " Using it costs your turn.";
      return {
        kind,
        emoji: LOOT_EMOJI[kind] ?? "🎁",
        name: def.name,
        key: def.key,
        count: G.inv[kind],
        desc: (kind === "snack" ? `Heal ${G.snackHeal} HP.` : def.desc) + useNote,
        disabled: G.over || G.inv[kind] <= 0,
      };
    });
  }

  function render(g: Game): void {
    game = g;
    const G = g.G;
    const { walls, safe, barriers, pickups, player, foe, exit } = G;
    const stage = $("stage");
    stage.style.gridTemplateColumns = `repeat(${COLS}, var(--cell, 16px))`;
    const route = new Set(G.showRoute ? g.goalPath().map((p) => key(p.r, p.c)) : []);
    let html = "";
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const k = key(r, c);
        let ch = walls[r]![c] ? "⬛" : "";
        let cls = "cell";
        if (!walls[r]![c] && r === exit.r && c === exit.c) {
          ch = "🚪";
          cls += " e";
        }
        if (safe.has(k)) {
          ch = "🛡️";
          cls += " s";
        }
        if (pickups.has(k)) {
          ch = LOOT_EMOJI[pickups.get(k)!] || "🎁";
          cls += " i";
        }
        if (barriers.has(k)) {
          ch = "🚧";
          cls += " g";
        }
        if (r === foe.r && c === foe.c && !(r === player.r && c === player.c)) {
          ch = G.frozen > 0 ? "🥶" : "👹";
          cls += " c";
        }
        if (r === player.r && c === player.c) {
          ch = "🧑‍💻";
          cls += " p";
        }
        if (route.has(k)) cls += " rt";
        if (G.hint === k) cls += " hm";
        html += `<span class="${cls}">${ch}</span>`;
      }
    }
    stage.innerHTML = html;
    fit();

    const d = g.foeDistance();
    if (!G.over && G.turns > 0 && d >= 0 && d <= 4) deps.heart();
    renderStatus($("status-root"), {
      view: statusView({
        hp: G.hp,
        maxHp: MAX_HP,
        turns: G.turns,
        pages: G.pages,
        totalPages: TOTAL_PAGES,
        score: G.score,
        fuses: G.fuses,
        bashCd: G.bashCd,
        frozen: G.frozen,
        inSafe: safe.has(key(player.r, player.c)),
        foeDist: d,
      }),
      menuKey: KEYS.menu.label,
      onMenu: () => layers.open("menu"),
    });

    const act = (fn: () => void) => (): void => {
      controls?.wake();
      fn();
    };
    renderStrip($("strip-root"), {
      tools: toolRows(g),
      auto: G.auto,
      route: G.showRoute,
      over: G.over,
      onMove: (dir) => {
        controls?.wake();
        if (G.auto || layers.any()) return;
        const [dr, dc] = MOVE_DELTA[dir];
        g.tryMove(dr, dc);
      },
      onHint: act(() => g.hint()),
      onRoute: act(() => g.toggleAnswer()),
      onAuto: act(() => g.toggleAuto()),
      onBash: act(() => g.bash()),
      onTool: (kind) => act(() => g.useItem(kind))(),
    });

    runInfo =
      `Seed ${G.seed} · optimal route ${G.optimal} moves ` +
      `· Sugar Puffs heal ${G.snackHeal} · creature pace 2/turn, spawned ${G.foeSpawnDist} away`;
    if (layers.isOpen("menu")) drawLayers();
  }

  /* ---------- endings: the title card waits under the ending card ---------- */
  function showEnd(g: Game, won: boolean): void {
    const G = g.G;
    let title: string, text: string;
    if (won && G.pages >= TOTAL_PAGES) {
      title = "True Ending: Shut Down the Maze";
      text =
        "Every page recovered, every choice owned. Theseus ships the game, " +
        "and the creature starves outside the safe zones. Five stars in Whitehead’s review.";
    } else if (won && G.pages > 0) {
      title = "Lesser Escape: Out, But Thin";
      text =
        `You reached the exit with ${G.pages}/${TOTAL_PAGES} pages. The game ships with bugs, ` +
        "and something still rustles in the code. It works — barely.";
    } else if (won) {
      title = "Bare Survival: The Hallway Ending";
      text =
        "You escaped with no pages and no proof. Nobody believes the maze was real. " +
        "The creature waits for your sequel.";
    } else {
      title = "Taken: The PAX Ending";
      text = G.deathCause || "The creature reached you.";
    }
    end = {
      open: true,
      kicker: won ? "You escaped" : "Run over — permadeath, no continues",
      title,
      text,
      score:
        `Score ${G.score} · ${G.turns} turns · pages ${G.pages}/${TOTAL_PAGES} · ` +
        `barriers opened ${G.opened} · seed ${G.seed}`,
    };
    titleHint = false;
    layers.open("title");
    layers.open("end");
    render(g);
  }

  function showTitle(hint: boolean): void {
    titleHint = hint;
    layers.clear();
    layers.open("title");
  }

  function showSeed(seed: string): void {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("seed", seed);
      window.history.replaceState(null, "", url);
    } catch (_) {
      /* file:// or sandbox: the seed box still shows it */
    }
    seedText = seed;
    drawLayers();
  }

  /* ---------- input: moves, tools, bash, and guides never share a key ---------- */
  function bindControls(c: Controls): void {
    controls = c;
    game = c.game;
    const G = c.game.G;
    document.addEventListener("keydown", (ev) => {
      if (typesText(ev.target)) return;
      const tag = (ev.target as HTMLElement | null)?.tagName;
      c.wake();
      if (isBackKey(ev)) {
        ev.preventDefault();
        if (!ev.repeat) layers.pressBack();
        return;
      }
      const k = ev.key.toLowerCase();
      const action = actionFor(k);
      if (action === "new") {
        ev.preventDefault();
        c.restart(seedText);
        return;
      }
      if (action === "mute") {
        c.toggleMute();
        return;
      }
      // A card is up: only Q, N and M reach the game.
      if (layers.any()) return;
      if (action === "auto") {
        ev.preventDefault();
        c.game.toggleAuto();
        return;
      }
      if (action === "route") {
        c.game.toggleAnswer();
        return;
      }
      if (action === "hint") {
        c.game.hint();
        return;
      }
      if (G.over || G.auto) return;
      if (action === "bash") {
        if (tag === "BUTTON") return;
        ev.preventDefault();
        c.game.bash();
        return;
      }
      if (isMove(action)) {
        ev.preventDefault();
        const [dr, dc] = MOVE_DELTA[action];
        c.game.tryMove(dr, dc);
        return;
      }
      const item = itemFor(k, ITEMS);
      if (item) {
        ev.preventDefault();
        c.game.useItem(item);
      }
    });

    document.addEventListener("pointerdown", c.wake);

    if (typeof ResizeObserver === "function") new ResizeObserver(fit).observe($("board"));
    if (typeof window !== "undefined") window.addEventListener("resize", fit);
  }

  drawLayers();
  return {
    say,
    render,
    showEnd,
    showSeed,
    bindControls,
    showTitle,
    closeLayers: () => layers.clear(),
    top: () => layers.top(),
    setMuted: (m) => {
      muted = m;
      drawLayers();
    },
    setFullscreen: (on) => {
      full = on;
      drawLayers();
    },
    clearLog: () => {
      log.length = 0;
      $("toast").className = "toast";
      if (layers.isOpen("menu")) drawLayers();
    },
  };
}
