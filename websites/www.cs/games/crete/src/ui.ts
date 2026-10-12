/* The Island of Crete: the page. Draws the board, the HUD, the inventory, the
 * log and the ending, and turns keys and clicks into game actions. It reads
 * the engine's state and calls its actions; it holds no rules. Only the
 * engine's types are imported; `createUi` takes the values it borrows as
 * arguments. Needs the DOM lib, so it is in the second program
 * (src/tsconfig.dom.json).
 */
import type { Game, ItemDef, ItemKind, LogTone } from "./engine.ts";
import { renderEndCard } from "./ui/end.tsx";
import { renderInventory } from "./ui/inventory.tsx";
import type { EndView } from "./ui/end.tsx";

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
  /** Wake the speakers: any gesture does. */
  wake(): void;
}

export interface Ui {
  say(text: string, tone?: LogTone): void;
  render(game: Game): void;
  showEnd(game: Game, won: boolean): void;
  hideEnd(): void;
  clearLog(): void;
  /** Put the run's seed in the seed box and in the address. */
  showSeed(seed: string): void;
  setMuteLabel(muted: boolean): void;
  bindControls(controls: Controls): void;
}

const LOOT_EMOJI: Record<string, string> = {
  shard: "🔮",
  snack: "🥣",
  jammer: "📻",
  page: "📄",
  fuse: "🔌",
};

const MOVES: Record<string, readonly [number, number]> = {
  arrowup: [-1, 0],
  w: [-1, 0],
  arrowdown: [1, 0],
  s: [1, 0],
  arrowleft: [0, -1],
  a: [0, -1],
  arrowright: [0, 1],
  d: [0, 1],
};
const PAD_MOVES: Record<string, readonly [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};
const ITEM_KEYS: Record<string, ItemKind> = { z: "shard", x: "snack", c: "jammer" };

const $ = (id: string): HTMLElement => document.getElementById(id)!;
const seedBox = (): HTMLInputElement => $("seed-input") as HTMLInputElement;

export function createUi(deps: UiDeps): Ui {
  const { ROWS, COLS, MAX_HP, TOTAL_PAGES, ITEMS, key } = deps;

  function say(text: string, tone?: LogTone): void {
    const li = document.createElement("li");
    if (tone) li.className = tone;
    li.textContent = text;
    const log = $("log");
    log.appendChild(li);
    while (log.children.length > 80) log.removeChild(log.firstChild!);
    log.scrollTop = log.scrollHeight;
  }

  function render(game: Game): void {
    const G = game.G;
    const { walls, safe, barriers, pickups, player, foe, exit } = G;
    const stage = $("stage");
    stage.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
    const route = new Set(
      G.showRoute ? game.goalPath().map((p) => key(p.r, p.c)) : [],
    );
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

    $("hud-hp").textContent = `${G.hp}/${MAX_HP}`;
    $("hud-turns").textContent = String(G.turns);
    $("hud-pages").textContent = `${G.pages}/${TOTAL_PAGES}`;
    $("hud-score").textContent = String(G.score);
    $("hud-fuses").textContent = String(G.fuses);
    $("hud-bash").textContent =
      G.bashCd > 0 ? `recharging (${G.bashCd})` : "ready (Space)";
    const d = game.foeDistance();
    if (!G.over && G.turns > 0) {
      if (d >= 0 && d <= 4) deps.heart();
    }
    $("hud-dist").textContent =
      G.frozen > 0
        ? `frozen solid (${G.frozen} turn${G.frozen === 1 ? "" : "s"})`
        : safe.has(key(player.r, player.c))
          ? "pacing outside your safe zone"
          : d < 0
            ? "lost in the static"
            : `${d} steps away — and it moves twice`;

    $("run-stats").textContent =
      `Seed ${G.seed} · optimal route ${G.optimal} moves · mistake budget ${G.budget} ` +
      `· Sugar Puffs heal ${G.snackHeal} · creature pace 2/turn, spawned ${G.foeSpawnDist} away`;

    renderInventory($("inventory-root"), {
      rows: (Object.keys(ITEMS) as ItemKind[]).map((kind) => {
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
      }),
      onUse: (kind) => game.useItem(kind),
    });
  }

  /* ---------- endings ---------- */
  let end: EndView = { open: false, kicker: "", title: "", text: "", score: "" };
  let again = (): void => {};
  function drawEnd(): void {
    renderEndCard($("end-root"), { ...end, onAgain: () => again() });
  }

  function showEnd(game: Game, won: boolean): void {
    const G = game.G;
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
    drawEnd();
    render(game);
  }

  function hideEnd(): void {
    end = { ...end, open: false };
    drawEnd();
  }

  function showSeed(seed: string): void {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("seed", seed);
      window.history.replaceState(null, "", url);
    } catch (_) {
      /* file:// or sandbox: seed box still shows it */
    }
    seedBox().value = seed;
    seedBox().blur();
  }

  function setMuteLabel(muted: boolean): void {
    $("mute").textContent = muted ? "🔇 Muted (M)" : "🔊 Sound (M)";
  }

  /* ---------- input: moves, items, bash, and guides never share a key ---------- */
  function bindControls({ game, restart, toggleMute, wake }: Controls): void {
    const G = game.G;
    document.addEventListener("keydown", (ev) => {
      const tag = (ev.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      wake();
      const k = ev.key.toLowerCase();
      if (k === "n") {
        ev.preventDefault();
        restart(seedBox().value);
        return;
      }
      if (k === "m") {
        toggleMute();
        return;
      }
      if (k === "t") {
        ev.preventDefault();
        game.toggleAuto();
        return;
      }
      if (k === "v") {
        game.toggleAnswer();
        return;
      }
      if (k === "h") {
        game.hint();
        return;
      }
      if (G.over || G.auto) return;
      if (k === " " || k === "spacebar") {
        if (tag === "BUTTON") return;
        ev.preventDefault();
        game.bash();
        return;
      }
      const move = MOVES[k];
      if (move) {
        ev.preventDefault();
        game.tryMove(move[0], move[1]);
        return;
      }
      const item = ITEM_KEYS[k];
      if (item) {
        ev.preventDefault();
        game.useItem(item);
      }
    });

    document.addEventListener("pointerdown", wake);

    document.querySelectorAll("[data-move]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const dir = btn.getAttribute("data-move");
        if (!dir || G.auto) return;
        const delta = PAD_MOVES[dir];
        if (delta) game.tryMove(delta[0], delta[1]);
      });
    });
    $("seed-form").addEventListener("submit", (ev) => {
      ev.preventDefault();
      restart(seedBox().value);
    });
    again = () => restart(seedBox().value);
    $("random-run").addEventListener("click", () => {
      wake();
      restart("");
    });
    $("mute").addEventListener("click", () => {
      wake();
      toggleMute();
    });
    $("btn-hint").addEventListener("click", () => {
      wake();
      game.hint();
    });
    $("btn-answer").addEventListener("click", () => {
      wake();
      game.toggleAnswer();
    });
    $("btn-auto").addEventListener("click", () => {
      wake();
      game.toggleAuto();
    });
    $("btn-bash").addEventListener("click", () => {
      wake();
      game.bash();
    });
  }

  drawEnd();
  return {
    say, render, showEnd, hideEnd, showSeed, setMuteLabel, bindControls,
    clearLog: () => { $("log").innerHTML = ""; },
  };
}
