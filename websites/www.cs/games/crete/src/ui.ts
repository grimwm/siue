/* The Island of Crete: the page. Sizes the board, draws the status bar, the
 * strip, the toast and the cards, and turns keys and clicks into game
 * presses. It reads the game's state and calls its actions; it holds no
 * rules. Needs the DOM lib, so it is in the second program
 * (src/tsconfig.dom.json).
 */
import { isBackKey, typesText } from "../../_kit/keys.ts";
import type { Board } from "./board.ts";
import type { Editor } from "./editor/editor.ts";
import { boardRows } from "./board-plan.ts";
import type { Atlas } from "./board-plan.ts";
import type { Game, SfxName, Tone } from "./game.ts";
import { KEYS, actionFor, isMove, itemFor } from "./keys.ts";
import { createLayers } from "./layers.ts";
import type { LayerName } from "./layers.ts";
import type { FoundPages } from "./pages.ts";
import type { Progress } from "./progress.ts";
import { pagesTaken } from "./puzzle/state.ts";
import type { State } from "./puzzle/state.ts";
import { TOOLS } from "./puzzle/tiles.ts";
import type { Tool } from "./puzzle/tiles.ts";
import { CAMPAIGN_LEVELS, CHAPTERS, LEVEL_IDS, chapterOf, nextChapter } from "./campaign/chapters.ts";
import type { Levels, OutsideLevel } from "./campaign/chapters.ts";
import { statusView } from "./status.ts";
import { cellFor } from "./fit.ts";
import { follow } from "./follow.ts";
import { helpLines } from "./help.ts";
import { renderChapterCard } from "./ui/chapter.tsx";
import { renderEndCard } from "./ui/end.tsx";
import type { EndView } from "./ui/end.tsx";
import { renderLore } from "./ui/lore.tsx";
import type { LoreEntry } from "./ui/lore.tsx";
import { renderMenu } from "./ui/menu.tsx";
import type { LogLine } from "./ui/menu.tsx";
import { renderStatus } from "./ui/status.tsx";
import { renderStoryCard } from "./ui/story.tsx";
import { renderStart } from "./ui/start.tsx";
import { renderStrip } from "./ui/strip.tsx";
import type { ToolRow } from "./ui/strip.tsx";
import { renderTitleCard } from "./ui/title.tsx";
import { ratingText, renderSharedCard } from "./ui/shared.tsx";
import type { SharedView } from "./share/visit.ts";
import type { RatingState } from "./share/rating.ts";
import { renderLevels } from "./ui/levels.tsx";
import type { LevelRow } from "./ui/levels.tsx";

/** What the page borrows at run time. */
export interface UiDeps {
  atlas: Atlas;
  board: Board;
  progress: Progress;
  /** The story pages found in this browser, for the Lore book. */
  pages: FoundPages;
  /** The levels the game plays, for telling one from outside the campaign; without it every level is the campaign's. */
  levels?: Pick<Levels, "outside">;
  /** Voices an event (the chapter card's sound). */
  sfx?(name: SfxName): void;
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
  /** Play on the title card: opens Chapter 1's card. */
  play(): void;
  /** Back to the editor from a try: offered in the menu and on the end card while a try is in play. */
  backToEditor?(): void;
  /** The level editor, when the page has one: Make a level on the title card opens it, and while it is the top
   *  layer every key goes to it. */
  editor?: Pick<Editor, "open" | "close" | "key">;
  /** The open share link, when the page has one: its card, Play and Edit a copy. */
  shared?: { card(): SharedView | null; play(): void; edit(): void };
  /** The editor's visit ended: the editor was left for the title card, or a campaign level was opened (from a try,
   *  or from anywhere). */
  leftEditor?(): void;
}

export interface Ui {
  /** A line for the toast and the story log. */
  say(text: string, tone?: Tone): void;
  render(game: Game): void;
  setMuted(muted: boolean): void;
  setFullscreen(on: boolean): void;
  bindControls(controls: Controls): void;
  /** The title card, alone; `hint` adds how to close an installed app, and `note` why a share link did not open. */
  showTitle(hint: boolean, note?: string): void;
  /** The level list, over whatever is showing. */
  showLevels(): void;
  /** Chapter `n`'s card, over whatever is showing: the opening one (Enter starts the first level this browser
   *  has not cleared), or the closing one. */
  showChapter(n: number, closing: boolean): void;
  /** Closes every card. */
  closeLayers(): void;
  /** The card showing now, if any. */
  top(): LayerName | null;
  /** The level editor, alone, when the page has one: on `draft` when given, else on the draft in progress. */
  showEditor(draft?: Parameters<Editor["open"]>[0]): void;
  /** The open share link's card, alone. */
  showShared(): void;
  /** A share link could not be opened: the toast and the title card say why. */
  refuseLink(message: string): void;
  /** Draws the cards again (the shared card's rating came in). */
  refresh(): void;
  /** Leaves the editor for the title card. */
  leaveEditor(): void;
}

const TOOL_EMOJI: Record<Tool, string> = { mirror: "🪞", cake: "🍯", cow: "🐄" };
const TOOL_KINDS = Object.keys(TOOLS) as Tool[];

const LOG_LIMIT = 80;
const TOAST_MS = 3000;

const $ = (id: string): HTMLElement => document.getElementById(id)!;

export function createUi(deps: UiDeps): Ui {
  const { atlas, board, progress, pages, sfx } = deps;

  /** The level in play when it is from outside the campaign, else null. */
  const outsideOf = (g: Game | null): OutsideLevel | null => (g && g.trial >= 0 ? deps.levels?.outside?.(g.trial) ?? null : null);
  /** An outside level's kicker on its start and end cards. */
  const outsideKicker = (o: OutsideLevel): string => (o.kind === "try" ? "Your level" : "Shared level");
  /** The shared card, while a shared level is in play and the open link's card is that level's. */
  const sharedCard = (g: Game | null): (() => void) | undefined => {
    const card = controls?.shared?.card();
    return card && g?.run && outsideOf(g)?.kind === "shared" && card.level === g.run.now.level ? showShared : undefined;
  };
  /** Back to the editor, while a try is in play and the page gives it. */
  const backToEditor = (g: Game | null): (() => void) | undefined => {
    const back = controls?.backToEditor;
    return back && g?.run && outsideOf(g)?.kind === "try" ? () => back() : undefined;
  };

  const log: LogLine[] = [];
  let muted = false;
  let full = false;
  let toastTimer = 0;
  let controls: Controls | null = null;
  let game: Game | null = null;
  let titleHint = false;
  /** Why the last share link did not open, on the title card until it shows again some other way. */
  let titleNote = "";
  let end: EndView = { open: false, won: false, hasNext: false, hasLevels: false, pages: [], kicker: "", title: "", text: "", score: "" };
  /** The try whose ending card has been shown, so closing the card does not bring it back. */
  let endFor: unknown = null;
  let sized = "";
  /** The opening the start card was last shown for. */
  let shownOpen = 0;
  /** The chapter card's chapter, whether it is the closing card, and the level Enter on it starts. */
  let chapterN = 1;
  let chapterClosing = false;
  let chapterTarget = 0;
  /** The chapter the level list shows. */
  let listed = 1;
  /** The Lore book's open entry, or null for its list. */
  let loreShown: LoreEntry | null = null;
  /** The Lore entry was opened by taking its page, so its Back closes the book rather than showing the list. */
  let loreFromPickup = false;
  /** The pages of this try already shown on taking them. */
  let announced: string[] = [];
  /** Pages taken together (one slide can take several) that wait to open after the one showing. */
  let pending: string[] = [];
  /** The editor's layer is in the stack and the editor has been opened for it. */
  let editorShown = false;

  const layers = createLayers(() => {
    if (layers.any()) game?.stop();
    if (editorShown && !layers.has("editor")) {
      editorShown = false;
      controls?.editor?.close();
    }
    // A page opened on taking it that closes some other way (Quit closes every card) leaves nothing waiting on it.
    if (loreFromPickup && !layers.isOpen("lore")) {
      loreFromPickup = false;
      loreShown = null;
      pending = [];
      (controls?.game ?? game)?.resume();
    }
    drawLayers();
  });

  /** The campaign index of chapter `n`'s first level. */
  function firstOf(n: number): number {
    return CHAPTERS.filter((c) => c.n < n && c.released).reduce((sum, c) => sum + c.levelIds.length, 0);
  }

  function levelRows(n: number): LevelRow[] {
    const first = firstOf(n);
    return CHAPTERS[n - 1]!.levelIds.map((id, i) => {
      const p = progress.get(id);
      return {
        title: CAMPAIGN_LEVELS.level(first + i).title,
        status: !p.cleared ? "not yet" : p.assisted ? "cleared with help" : `cleared · best ${p.best}`,
      };
    });
  }

  /** The first level of chapter `n` this browser has not cleared; the chapter's first when it has cleared all. */
  function resumeOf(n: number): number {
    const c = CHAPTERS[n - 1]!;
    const i = c.levelIds.findIndex((id) => !progress.get(id).cleared);
    return firstOf(n) + Math.max(0, i);
  }

  function showChapter(n: number, closing: boolean, target = resumeOf(n)): void {
    chapterN = n;
    chapterClosing = closing;
    chapterTarget = target;
    sfx?.("chapter");
    layers.open("chapter");
  }

  /** Closes a card; with nothing left open and no level loaded, the title shows rather than a blank screen. */
  function leave(name: LayerName): void {
    layers.close(name);
    if (!layers.any() && !(controls?.game ?? game)?.run) showTitle(titleHint);
  }

  /** Opens level `i`. A level from inside the campaign ends the editor's visit, if a try was part of it. */
  function open(i: number): void {
    layers.clear();
    if (!deps.levels?.outside?.(i)) controls?.leftEditor?.();
    controls?.game.open(i);
  }

  /** A level picked from the list or the chapter card: a chapter's first level shows the chapter card first. */
  function pick(i: number): void {
    const { chapter, within } = chapterOf(i);
    if (within === 0) {
      layers.close("levels");
      showChapter(chapter.n, false, i);
    } else open(i);
  }

  /** Enter on the opening card starts the level it was opened for. */
  function enter(): void {
    open(chapterTarget);
  }

  function showEditor(draft?: Parameters<Editor["open"]>[0]): void {
    const editor = controls?.editor;
    if (!editor) return;
    layers.clear();
    layers.open("editor");
    editorShown = true;
    editor.open(draft);
  }

  function showShared(): void {
    if (!controls?.shared?.card()) return;
    layers.clear();
    layers.open("shared");
  }

  /** The shared card's rating line: null while the rating is worked out. */
  function ratingLine(r: RatingState): string | null {
    if (r.kind === "done") return ratingText(r.d);
    if (r.kind === "failed") return `No rating: ${r.message}`;
    if (r.kind === "waiting") return "Rating waits for your Check in the editor.";
    return null;
  }

  function leaveEditor(): void {
    if (!layers.has("editor")) return;
    showTitle(titleHint);
    controls?.leftEditor?.();
  }

  function drawLayers(): void {
    const g = controls?.game ?? game;
    renderTitleCard($("title-root"), {
      open: layers.isOpen("title"),
      hint: titleHint,
      ...(titleNote ? { note: titleNote } : {}),
      onPlay: () => controls?.play(),
      onStory: () => layers.open("story"),
      ...(controls?.editor ? { onEditor: showEditor } : {}),
      onSettings: () => layers.open("menu"),
    });
    const card = controls?.shared?.card() ?? null;
    renderSharedCard($("shared-root"), {
      open: layers.isOpen("shared") && card !== null,
      name: card?.name ?? "",
      rating: card ? ratingLine(card.rating) : null,
      best: card?.best ?? null,
      onPlay: () => controls?.shared?.play(),
      onEdit: () => controls?.shared?.edit(),
    });
    const out = outsideOf(g);
    const playing = g && g.trial >= 0 && !out ? chapterOf(g.trial) : null;
    renderChapterCard($("chapter-root"), {
      open: layers.isOpen("chapter"),
      chapter: CHAPTERS[chapterN - 1]!,
      closing: chapterClosing,
      next: nextChapter(chapterN),
      onEnter: enter,
      onLevels: () => layers.open("levels"),
      onClose: () => leave("chapter"),
    });
    renderLevels($("levels-root"), {
      open: layers.isOpen("levels"),
      chapters: CHAPTERS,
      shown: listed,
      rows: levelRows(listed),
      current: playing && playing.chapter.n === listed ? playing.within : -1,
      onPick: (i) => pick(firstOf(listed) + i),
      onTab: (n) => {
        listed = n;
        drawLayers();
      },
      onClose: () => layers.close("levels"),
    });
    const lv = g?.run?.now.level;
    renderStart($("start-root"), {
      open: layers.isOpen("start"),
      chapter: playing?.chapter.n ?? 1,
      number: (playing?.within ?? 0) + 1,
      ...(out ? { kicker: outsideKicker(out) } : {}),
      title: out ? out.name : lv?.title ?? "",
      intro: lv?.intro ?? "",
      ...(out?.best != null ? { best: `beat ${out.best}` } : {}),
      onBegin: () => layers.close("start"),
    });
    renderEndCard($("end-root"), {
      ...end,
      open: layers.isOpen("end"),
      onNext: () => open((g?.trial ?? 0) + 1),
      onRetry: () => open(g?.trial ?? 0),
      onTrials: () => layers.open("levels"),
      onUndo: () => g?.press("undo"),
      onRestart: () => g?.press("restart"),
      onBackToEditor: backToEditor(g),
    });
    renderLore($("lore-root"), {
      open: layers.isOpen("lore"),
      chapters: CHAPTERS,
      found: pages.has,
      closingSeen: (n) => {
        const last = CHAPTERS[n - 1]?.levelIds.at(-1);
        return last !== undefined && progress.get(last).cleared;
      },
      shown: loreShown,
      onShow: (e) => {
        if (e === null && loreFromPickup) {
          closePickup();
          return;
        }
        loreShown = e;
        drawLayers();
      },
      onClose: () => {
        if (loreFromPickup) closePickup();
        else layers.close("lore");
      },
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
      onLore: () => {
        loreShown = null;
        loreFromPickup = false;
        layers.open("lore");
      },
      onQuit: () => {
        controls?.wake();
        controls?.quit();
      },
      onClose: () => layers.close("menu"),
      onBackToEditor: backToEditor(g),
      onSharedCard: sharedCard(g),
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
    const fitted = cellFor(w, h, cols, rows, 0, boardRows(run.now.level, atlas));
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
        open: true, won, hasNext: false, hasLevels: false, pages: [], kicker: "Level failed", title: "The Minotaur has you",
        text: "Your last heart is gone. Undo a turn or begin the level again.", score: `${s.moves} moves`,
      };
    }
    const how = run.assisted ? "You followed Ariadne's thread." : "You found the way on your own.";
    const help = run.assisted ? "with help" : "";
    const out = outsideOf(g);
    // A level from outside the campaign records nothing and has no chapter: its card names it and, for a shared
    // level, sets the win against the author's best (only a win without help can beat it).
    if (out) {
      const author = out.best === null ? "" : !run.assisted && s.moves < out.best ? ` You beat the author's ${out.best}.` : ` The author's best is ${out.best}.`;
      return {
        open: true, won, hasNext: false, hasLevels: false, pages: [], kicker: outsideKicker(out), title: out.name,
        text: how + author, score: [`${s.moves} moves`, help].filter(Boolean).join(" · "),
      };
    }
    const best = progress.get(LEVEL_IDS[g.trial]!).best;
    // Every page this win took, not only the new ones: a replayed win still shows its page line.
    const titles = CHAPTERS.flatMap((c) => c.lore?.pages ?? []);
    const pages = pagesTaken(s).map((id) => titles.find((p) => p.id === id)?.title ?? id);
    return {
      open: true, won, hasNext: g.trial + 1 < LEVEL_IDS.length, hasLevels: true, pages, kicker: `Level ${chapterOf(g.trial).within + 1} cleared`, title: s.level.title,
      text: how,
      score: [`${s.moves} moves`, best !== null ? `best ${best}` : "", help].filter(Boolean).join(" · "),
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
    const out = outsideOf(g);
    if (sized !== `${s.level.cols}x${s.level.rows}`) fit();
    else followPlayer(s);
    // A level opened: the start card shows (a restart does not); the story log keeps its words.
    if (g.opens !== shownOpen) {
      shownOpen = g.opens;
      announced = [];
      pending = [];
      const name = out ? out.name : s.level.title;
      log.push({ text: s.level.intro ? `${name}: ${s.level.intro}` : name, tone: "info" });
      layers.open("start");
    }

    renderStatus($("status-root"), {
      view: statusView({
        trial: out ? "" : `${chapterOf(g.trial).within + 1}/${chapterOf(g.trial).chapter.levelIds.length}`,
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
      // A chapter's last level won: its closing card opens over the end card, which waits under it.
      const place = out ? null : chapterOf(g.trial);
      if (place && end.won && place.within === place.chapter.levelIds.length - 1) showChapter(place.chapter.n, true);
    }
    announcePages(g);
    drawLayers();
  }

  /** A story page taken this turn opens its Lore entry over everything else: while the turn animates, the
   *  moment the figure reaches it (the animation waits at it until the entry closes); with no animation, once the
   *  turn has landed, one page after another. The book still lists it as found only after the win. A page taken
   *  back by Undo shows again when retaken. */
  function announcePages(g: Game): void {
    if (outsideOf(g)) return;
    const taken = pagesTaken(g.run!.now);
    announced = announced.filter((id) => taken.includes(id));
    const fresh = taken.filter((id) => !announced.includes(id));
    if (fresh.length === 0) return;
    if (g.anim) {
      const at = g.anim.paused?.id;
      if (at === undefined || !fresh.includes(at)) return;
      announced.push(at);
      pending.push(at);
    } else {
      announced = taken;
      pending.push(...fresh);
    }
    if (!loreFromPickup) showNextPickup();
  }

  /** Opens the next page waiting to be shown on taking it. */
  function showNextPickup(): void {
    const id = pending.shift();
    if (id === undefined) return;
    loreShown = { kind: "page", id };
    loreFromPickup = true;
    layers.open("lore");
    drawLayers();
  }

  /** Closes a page opened on taking it; the next page taken in the same turn, if any, opens in its place, and
   *  otherwise a turn's animation paused at the page goes on. */
  function closePickup(): void {
    if (pending.length > 0) {
      showNextPickup();
      return;
    }
    loreFromPickup = false;
    loreShown = null;
    layers.close("lore");
    (controls?.game ?? game)?.resume();
  }

  function showTitle(hint: boolean, note = ""): void {
    titleHint = hint;
    titleNote = note;
    layers.clear();
    layers.open("title");
  }

  /** The enabled buttons of card `name`, in order. */
  function cardButtons(name: LayerName): HTMLElement[] {
    const veil = document.getElementById(`${name}-root`);
    return veil ? (Array.from(veil.querySelectorAll("button")) as HTMLElement[]).filter((b) => !(b as HTMLButtonElement).disabled) : [];
  }

  /** True when the focus is on nothing of the card (its id has no `prefix`) or on one of its default buttons. */
  function onDefault(id: string | undefined, prefix: string, ...defaults: string[]): boolean {
    return id === undefined || !id.startsWith(prefix) || defaults.includes(id);
  }

  /* ---------- input: moves, tools and guides never share a key ---------- */
  function bindControls(c: Controls): void {
    controls = c;
    game = c.game;
    document.addEventListener("keydown", (ev) => {
      if (typesText(ev.target)) return;
      c.wake();
      // The editor takes every key while it is the top layer; a Q it does not use (no dialog of its own is open)
      // leaves it for the title card.
      if (layers.isOpen("editor") && c.editor) {
        if (!c.editor.key(ev) && isBackKey(ev)) {
          ev.preventDefault();
          if (!ev.repeat) leaveEditor();
        }
        return;
      }
      if (isBackKey(ev)) {
        ev.preventDefault();
        if (ev.repeat) return;
        // An open Lore entry goes back to the list; the next Q closes the book.
        if (layers.isOpen("lore") && loreShown && !loreFromPickup) {
          loreShown = null;
          drawLayers();
        } else if (layers.isOpen("lore") && loreFromPickup) {
          closePickup();
        } else if (layers.isOpen("title")) layers.open("menu");
        else if (layers.isOpen("shared")) showTitle(titleHint);
        else if (layers.isOpen("chapter")) leave("chapter");
        else layers.pressBack();
        return;
      }
      // A chord is the browser's (Cmd+R reloads, Ctrl+T opens a tab), never a game key.
      if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
      const k = ev.key.toLowerCase();
      const action = actionFor(k);
      // Held Enter repeats nothing: it would close the card the first press opened, or press its focused button.
      if (action === "begin" && ev.repeat) {
        ev.preventDefault();
        return;
      }
      // The title's Play is worded N: there it opens the chapter card, elsewhere N opens the list.
      if (action === "new") {
        ev.preventDefault();
        if (layers.isOpen("title")) c.play();
        else layers.open("levels");
        return;
      }
      if (action === "mute") {
        c.toggleMute();
        return;
      }
      // Each card's own keys act only while it is the top card: I and E on the title, F and L on the menu.
      if (action === "story" && layers.isOpen("title")) {
        ev.preventDefault();
        if (!ev.repeat) layers.open("story");
        return;
      }
      if (action === "editor" && layers.isOpen("title") && c.editor) {
        ev.preventDefault();
        if (!ev.repeat) showEditor();
        return;
      }
      if (action === "fullscreen" && layers.isOpen("menu")) {
        ev.preventDefault();
        if (!ev.repeat) c.toggleFullscreen();
        return;
      }
      if (action === "lore" && layers.isOpen("menu")) {
        ev.preventDefault();
        if (!ev.repeat) {
          loreShown = null;
          loreFromPickup = false;
          layers.open("lore");
        }
        return;
      }
      // Up and down (or k and j) move the focus between the top card's enabled buttons, clamped at the ends; Enter
      // and Space press the focused one (the cards whose Enter means something say so below).
      const top = layers.top();
      const buttons = top && top !== "start" ? cardButtons(top) : [];
      const named = (ev.target as HTMLElement | null)?.id;
      const focused = buttons.find((b) => !!named && b.id === named) ?? buttons.find((b) => b === document.activeElement) ?? null;
      const stepKey = action === "up" || k === "k" ? -1 : action === "down" || k === "j" ? 1 : 0;
      if (stepKey !== 0 && buttons.length > 0 && top !== "levels") {
        ev.preventDefault();
        const to = buttons[Math.min(buttons.length - 1, Math.max(0, buttons.indexOf(focused as HTMLElement) + stepKey))]!;
        to.focus();
        to.scrollIntoView?.({ block: "nearest" });
        return;
      }
      // The level list: left and right (or A and D) switch between the released chapters' tabs.
      if (top === "levels" && (action === "left" || action === "right")) {
        ev.preventDefault();
        const released = CHAPTERS.filter((ch) => ch.released).map((ch) => ch.n);
        const at = released.indexOf(listed);
        const to = released[Math.min(released.length - 1, Math.max(0, at + (action === "left" ? -1 : 1)))];
        if (to !== undefined && to !== listed) {
          listed = to;
          drawLayers();
        }
        return;
      }
      // The levels list: up and down (or j and k) move between its levels, Enter opens the one chosen.
      if (layers.isOpen("levels")) {
        const chosen = /^level-(\d+)$/.exec((document.activeElement as HTMLElement | null)?.id ?? "");
        const step = action === "up" || k === "k" ? -1 : action === "down" || k === "j" ? 1 : 0;
        if (step !== 0) {
          ev.preventDefault();
          const count = levelRows(listed).length;
          const from = chosen ? Number(chosen[1]) : 0;
          const to = Math.min(count, Math.max(1, from + step));
          const target = document.getElementById(`level-${to}`);
          target?.focus();
          target?.scrollIntoView?.({ block: "nearest" });
          return;
        }
        if (action === "begin" && chosen) {
          ev.preventDefault();
          pick(firstOf(listed) + Number(chosen[1]) - 1);
          return;
        }
      }
      // Begin on the chapter card: the opening one starts a level, the closing one goes on. Tabbed to Levels,
      // Enter presses that button instead.
      if (layers.isOpen("chapter") && action === "begin" && onDefault(focused?.id, "chapter-", "chapter-enter", "chapter-continue")) {
        ev.preventDefault();
        if (chapterClosing) layers.close("chapter");
        else enter();
        return;
      }
      // A won ending card: Begin goes on to the next level (unless another of its buttons has the focus), R plays
      // this one again.
      if (layers.isOpen("end") && end.won) {
        if (action === "begin" && end.hasNext && onDefault(focused?.id, "end-", "end-next")) {
          ev.preventDefault();
          open(c.game.trial + 1);
          return;
        }
        if (action === "restart") {
          ev.preventDefault();
          open(c.game.trial);
          return;
        }
      }
      // A lost ending card: U undoes the last turn and R begins the level again, as its buttons say.
      if (layers.isOpen("end") && !end.won && (action === "undo" || action === "restart")) {
        ev.preventDefault();
        c.game.press(action);
        return;
      }
      // A Lore entry opened by taking its page closes on Enter or Space, and the game plays on.
      if (layers.isOpen("lore") && loreFromPickup && action === "begin" && onDefault(focused?.id, "lore-", "lore-close", "lore-back")) {
        ev.preventDefault();
        closePickup();
        return;
      }
      // Anywhere else Enter or Space presses the button with the focus.
      if (action === "begin" && focused) {
        ev.preventDefault();
        focused.click();
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
      // A card is up: only Q, N and M (and the keys a card names) reach the game.
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
    showLevels: () => layers.open("levels"),
    showChapter: (n, closing) => showChapter(n, closing),
    closeLayers: () => layers.clear(),
    top: () => layers.top(),
    showEditor,
    showShared,
    refuseLink: (message) => {
      say(message, "bad");
      showTitle(titleHint, message);
    },
    refresh: () => drawLayers(),
    leaveEditor,
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
