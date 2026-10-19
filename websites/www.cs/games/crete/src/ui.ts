/* The Island of Crete: the page. Sizes the board, draws the status bar, the
 * strip, the toast and the cards, and turns keys and clicks into game
 * presses. It reads the game's state and calls its actions; it holds no
 * rules. Needs the DOM lib, so it is in the second program
 * (src/tsconfig.dom.json).
 */
import { isBackKey, typesText } from "../../_kit/keys.ts";
import type { Board } from "./board.ts";
import { boardRows } from "./board-plan.ts";
import type { Atlas } from "./board-plan.ts";
import type { Game, Tone } from "./game.ts";
import { KEYS, actionFor, isMove, itemFor } from "./keys.ts";
import { createLayers } from "./layers.ts";
import type { LayerName } from "./layers.ts";
import type { Progress } from "./progress.ts";
import type { State } from "./puzzle/state.ts";
import { TOOLS } from "./puzzle/tiles.ts";
import type { Tool } from "./puzzle/tiles.ts";
import { TRIALS, trialLevel } from "./puzzle/trials.ts";
import { statusView } from "./status.ts";
import { cellFor } from "./fit.ts";
import { follow } from "./follow.ts";
import { helpLines } from "./help.ts";
import { renderEndCard } from "./ui/end.tsx";
import type { EndView } from "./ui/end.tsx";
import { renderMenu } from "./ui/menu.tsx";
import type { LogLine } from "./ui/menu.tsx";
import { renderStatus } from "./ui/status.tsx";
import { renderStoryCard } from "./ui/story.tsx";
import { renderStart } from "./ui/start.tsx";
import { renderStrip } from "./ui/strip.tsx";
import type { ToolRow } from "./ui/strip.tsx";
import { renderTitleCard } from "./ui/title.tsx";
import { renderTrials } from "./ui/trials.tsx";
import type { TrialRow } from "./ui/trials.tsx";

/** What the page borrows at run time. */
export interface UiDeps {
  atlas: Atlas;
  board: Board;
  progress: Progress;
}

/** What a key press or click asks of the page. */
export interface Controls {
  game: Game;
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
  say(text: string, tone?: Tone): void;
  render(game: Game): void;
  setMuted(muted: boolean): void;
  setFullscreen(on: boolean): void;
  bindControls(controls: Controls): void;
  /** The title card, alone; `hint` adds how to close an installed app. */
  showTitle(hint: boolean): void;
  /** The trial list, over whatever is showing. */
  showTrials(): void;
  /** Closes every card. */
  closeLayers(): void;
  /** The card showing now, if any. */
  top(): LayerName | null;
}

const TOOL_EMOJI: Record<Tool, string> = { mirror: "🪞", cake: "🍯", cow: "🐄" };
const TOOL_KINDS = Object.keys(TOOLS) as Tool[];

const LOG_LIMIT = 80;
const TOAST_MS = 3000;

const $ = (id: string): HTMLElement => document.getElementById(id)!;

export function createUi(deps: UiDeps): Ui {
  const { atlas, board, progress } = deps;

  const log: LogLine[] = [];
  let muted = false;
  let full = false;
  let toastTimer = 0;
  let controls: Controls | null = null;
  let game: Game | null = null;
  let titleHint = false;
  let end: EndView = { open: false, won: false, hasNext: false, kicker: "", title: "", text: "", score: "" };
  /** The try whose ending card has been shown, so closing the card does not bring it back. */
  let endFor: unknown = null;
  let sized = "";
  /** The opening the start card was last shown for. */
  let shownOpen = 0;

  const layers = createLayers(() => {
    if (layers.any()) game?.stop();
    drawLayers();
  });

  function trialRows(): TrialRow[] {
    return TRIALS.map((t, i) => {
      const p = progress.get(t.id);
      return {
        title: trialLevel(i).title,
        status: !p.cleared ? "not yet" : p.assisted ? "cleared with help" : `cleared · best ${p.best}`,
      };
    });
  }

  function pick(i: number): void {
    layers.clear();
    controls?.game.open(i);
  }

  function drawLayers(): void {
    const g = controls?.game ?? game;
    renderTitleCard($("title-root"), {
      open: layers.isOpen("title"),
      hint: titleHint,
      onPlay: () => controls?.play(),
      onStory: () => layers.open("story"),
      onSettings: () => layers.open("menu"),
    });
    renderTrials($("trials-root"), {
      open: layers.isOpen("trials"),
      rows: trialRows(),
      current: g?.trial ?? -1,
      onPick: pick,
      onClose: () => layers.close("trials"),
    });
    const lv = g?.run?.now.level;
    renderStart($("start-root"), {
      open: layers.isOpen("start"),
      number: (g?.trial ?? 0) + 1,
      title: lv?.title ?? "",
      intro: lv?.intro ?? "",
      onBegin: () => layers.close("start"),
    });
    renderEndCard($("end-root"), {
      ...end,
      open: layers.isOpen("end"),
      onNext: () => pick((g?.trial ?? 0) + 1),
      onRetry: () => pick(g?.trial ?? 0),
      onTrials: () => layers.open("trials"),
      onUndo: () => g?.press("undo"),
      onRestart: () => g?.press("restart"),
    });
    renderStoryCard($("story-root"), { open: layers.isOpen("story"), onClose: () => layers.close("story") });
    renderMenu($("menu-root"), {
      open: layers.isOpen("menu"),
      muted,
      fullscreen: full,
      log,
      help: helpLines(KEYS, TOOLS),
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

  function say(text: string, tone?: Tone): void {
    log.push(tone ? { text, tone } : { text });
    while (log.length > LOG_LIMIT) log.shift();
    const toast = $("toast");
    toast.textContent = text;
    toast.className = tone ? `toast show ${tone}` : "toast show";
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), TOAST_MS);
    if (layers.isOpen("menu")) drawLayers();
  }

  /** The cell size: the largest whole pixel count whose canvas, as the board actually sizes it
   *  (whole device pixels), fits the space the board has left. A big level (src/fit.ts) keeps cells of at least
   *  32 px instead and scrolls inside the board. */
  function fit(): void {
    const run = game?.run;
    if (!run) return;
    const { cols, rows } = run.now.level;
    const holder = $("board");
    const canvas = $("stage");
    setScrolls(holder, false); // measured as if it did not scroll: a scroll bar must not change the answer
    const bs = getComputedStyle(holder);
    const w = holder.clientWidth - parseFloat(bs.paddingLeft) - parseFloat(bs.paddingRight);
    const h = holder.clientHeight - parseFloat(bs.paddingTop) - parseFloat(bs.paddingBottom);
    const fitted = cellFor(w, h, cols, boardRows(run.now.level, atlas), 0);
    let cell = Math.max(1, fitted.cell);
    board.size(cols, rows, cell);
    // The board snaps a cell to whole device pixels, which can round it up: read what it made.
    while (!fitted.scrolls && cell > 1 && (parseFloat(canvas.style.width) > w || parseFloat(canvas.style.height) > h)) {
      cell--;
      board.size(cols, rows, cell);
    }
    setScrolls(holder, fitted.scrolls);
    sized = `${cols}x${rows}`;
    followPlayer(run.now);
  }

  function setScrolls(holder: HTMLElement, on: boolean): void {
    const rest = holder.className.split(" ").filter((c) => c && c !== "scrolls");
    holder.className = (on ? [...rest, "scrolls"] : rest).join(" ");
  }

  /** Scrolls a big board, instantly, to keep the player two cells inside the view. */
  function followPlayer(s: State): void {
    const holder = $("board");
    if (!holder.className.split(" ").includes("scrolls")) {
      holder.scrollLeft = 0;
      holder.scrollTop = 0;
      return;
    }
    const canvas = $("stage");
    const cell = parseFloat(canvas.style.width) / s.level.cols;
    const rise = parseFloat(canvas.style.height) - s.level.rows * cell;
    const to = follow(
      { x: holder.scrollLeft, y: holder.scrollTop, w: holder.clientWidth, h: holder.clientHeight },
      { w: holder.scrollWidth, h: holder.scrollHeight },
      { left: canvas.offsetLeft + s.player.c * cell, top: canvas.offsetTop + rise + s.player.r * cell, size: cell },
      2 * cell,
    );
    holder.scrollLeft = to.x;
    holder.scrollTop = to.y;
  }

  function toolRows(g: Game): ToolRow[] {
    const s = g.run!.now;
    return TOOL_KINDS.map((kind) => ({
      kind,
      emoji: TOOL_EMOJI[kind],
      name: TOOLS[kind].name,
      key: TOOLS[kind].key,
      count: s.tools[kind],
      desc: TOOLS[kind].desc,
      disabled: s.outcome !== "playing" || s.tools[kind] <= 0,
    }));
  }

  function endView(g: Game): EndView {
    const run = g.run!;
    const s = run.now;
    const won = s.outcome === "won";
    if (!won) {
      return {
        open: true, won, hasNext: false, kicker: "Trial failed", title: "The Minotaur has you",
        text: "Your last heart is gone. Undo a turn or begin the trial again.", score: `${s.moves} moves`,
      };
    }
    const best = progress.get(TRIALS[g.trial]!.id).best;
    return {
      open: true, won, hasNext: g.trial + 1 < TRIALS.length, kicker: `Trial ${g.trial + 1} cleared`, title: s.level.title,
      text: run.assisted ? "You followed Ariadne's thread." : "You found the way on your own.",
      score: [`${s.moves} moves`, best !== null ? `best ${best}` : "", run.assisted ? "with help" : ""].filter(Boolean).join(" · "),
    };
  }

  function render(g: Game): void {
    game = g;
    const run = g.run;
    if (!run) {
      drawLayers();
      return;
    }
    const s = run.now;
    if (sized !== `${s.level.cols}x${s.level.rows}`) fit();
    else followPlayer(s);
    // A trial opened: the start card shows (a restart does not); the story log keeps its words.
    if (g.opens !== shownOpen) {
      shownOpen = g.opens;
      log.push({ text: `${s.level.title}: ${s.level.intro}`, tone: "info" });
      layers.open("start");
    }

    renderStatus($("status-root"), {
      view: statusView({
        trial: `${g.trial + 1}/${TRIALS.length}`,
        hearts: s.hearts,
        relicsLeft: s.relicsLeft,
        keys: s.keys,
        gear: s.gear,
        moves: s.moves,
        stone: s.stone,
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
      playing: g.playing,
      route: g.thread !== null,
      over: s.outcome !== "playing",
      onMove: (dir) => act(() => {
        layers.close("start");
        g.press({ kind: "move", dir });
      })(),
      onWait: act(() => g.press({ kind: "wait" })),
      onUndo: act(() => g.press("undo")),
      onRestart: act(() => g.press("restart")),
      onHint: act(() => g.hint()),
      onRoute: act(() => g.route()),
      onAuto: act(() => g.auto()),
      onTool: (tool) => act(() => g.press({ kind: "tool", tool }))(),
    });

    // The ending card waits for the last step to land; a try taken back or begun again lets the next ending show.
    if (s.outcome === "playing") {
      endFor = null;
      layers.close("end");
    } else if (!g.anim && endFor !== run) {
      endFor = run;
      end = endView(g);
      layers.open("end");
    }
    drawLayers();
  }

  function showTitle(hint: boolean): void {
    titleHint = hint;
    layers.clear();
    layers.open("title");
  }

  /* ---------- input: moves, tools and guides never share a key ---------- */
  function bindControls(c: Controls): void {
    controls = c;
    game = c.game;
    document.addEventListener("keydown", (ev) => {
      if (typesText(ev.target)) return;
      c.wake();
      if (isBackKey(ev)) {
        ev.preventDefault();
        if (!ev.repeat) layers.pressBack();
        return;
      }
      // A chord is the browser's (Cmd+R reloads, Ctrl+T opens a tab), never a game key.
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      const k = ev.key.toLowerCase();
      const action = actionFor(k);
      if (action === "new") {
        ev.preventDefault();
        layers.open("trials");
        return;
      }
      if (action === "mute") {
        c.toggleMute();
        return;
      }
      // The start card closes on Begin and on a move, which then also moves; it blocks nothing else.
      if (layers.isOpen("start")) {
        if (action === "begin") {
          ev.preventDefault();
          layers.close("start");
          return;
        }
        if (isMove(action)) layers.close("start");
      }
      // A card is up: only Q, N and M reach the game.
      if (layers.any() && !layers.isOpen("start")) return;
      const g = c.game;
      if (isMove(action)) {
        ev.preventDefault();
        g.press({ kind: "move", dir: action });
      } else if (action === "wait") {
        ev.preventDefault();
        g.press({ kind: "wait" });
      } else if (action === "undo" || action === "restart") {
        g.press(action);
      } else if (action === "hint") {
        g.hint();
      } else if (action === "route") {
        g.route();
      } else if (action === "auto") {
        ev.preventDefault();
        g.auto();
      } else {
        const tool = itemFor(k, TOOLS);
        if (tool) {
          ev.preventDefault();
          g.press({ kind: "tool", tool });
        }
      }
    });

    document.addEventListener("pointerdown", c.wake);
    // A tap on the toast puts it away.
    $("toast").addEventListener("click", () => $("toast").classList.remove("show"));

    if (typeof ResizeObserver === "function") new ResizeObserver(fit).observe($("board"));
    if (typeof window !== "undefined") window.addEventListener("resize", fit);
  }

  drawLayers();
  return {
    say,
    render,
    bindControls,
    showTitle,
    showTrials: () => layers.open("trials"),
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
  };
}
