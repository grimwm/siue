/* The Island of Crete: the page. Sizes the board, draws the status bar, the
 * strip, the toast and the cards, and turns keys and clicks into game
 * presses. It reads the game's state and calls its actions; it holds no
 * rules. Needs the DOM lib, so it is in the second program
 * (src/tsconfig.dom.json).
 */
import { track } from "./track.ts";
import { isBackKey, typesText } from "../../_kit/keys.ts";
import type { Timers } from "../../_kit/ports.ts";
import type { SheetBoard } from "./sheet-board.ts";
import type { Editor } from "./editor/editor.ts";
import type { Atlas } from "./board-plan.ts";
import type { Game, SfxName, Stop, Tone } from "./game.ts";
import { ENTRY, LISTED, backpack, cardOf, locked, metId } from "./dictionary.ts";
import type { Entry } from "./dictionary.ts";
import type { Met } from "./met.ts";
import { HEARTS_LINES, nextLine } from "./hearts-lines.ts";
import type { IconSheet } from "./icons-models.ts";
import type { Pics } from "./ui/sprite.tsx";
import { BANNER_MS, isFirst as firstMeeting, meetNotices } from "./notices.ts";
import { KEYS, actionFor, isDemoKey, isMove, itemFor } from "./keys.ts";
import type { MoveAction } from "./keys.ts";
import { PadPress, padDir } from "./pad.ts";
import { TOUR_ID, showTour, tourDue } from "./tour.ts";
import type { Tour } from "./tour.ts";
import { createRuleTips } from "./rule-tips.ts";
import type { TipEvent } from "./rule-tips.ts";
import { HINT_KEY } from "./modern/hint.ts";
import { createLayers } from "./layers.ts";
import type { LayerName } from "./layers.ts";
import type { FoundPages } from "./pages.ts";
import type { Progress } from "./progress.ts";
import { pagesTaken } from "./puzzle/state.ts";
import type { State } from "./puzzle/state.ts";
import { TOOLS } from "./puzzle/tiles.ts";
import type { Tool } from "./puzzle/tiles.ts";
import { CAMPAIGN_LEVELS, CHAPTERS, LEVEL_IDS, chapterOf, nextChapter, placeWords } from "./campaign/chapters.ts";
import { FEWEST, againstFewest } from "./campaign/fewest.ts";
import type { Levels, OutsideLevel } from "./campaign/chapters.ts";
import { statusView } from "./status.ts";
import { activeEffects, pickupWatch } from "./tool-effects.ts";
import { centredOn, createSheetView, eye, holdTarget, keepInView, panned, project, sheetCell, unproject, wholeFrame } from "./sheet.ts";
import type { Frame } from "./sheet.ts";
import { createCompassButton } from "./modern/controls.ts";
import type { CompassButton } from "./modern/controls.ts";
import type { Heading } from "./modern/compass.ts";
import { ZOOM_STEP, clampZoom, restarted, zoomedCell } from "./zoom.ts";
import type { Run } from "./puzzle/run.ts";
import { createGestures } from "./modern/gestures.ts";
import type { CamOp, Ptr } from "./modern/gestures.ts";
import { helpLines } from "./help.ts";
import { renderChapterCard } from "./ui/chapter.tsx";
import { renderEndCard } from "./ui/end.tsx";
import type { EndView } from "./ui/end.tsx";
import { renderLore } from "./ui/lore.tsx";
import { renderMeetCard } from "./ui/meet.tsx";
import { renderBanner } from "./ui/banner.tsx";
import { DICTIONARY_TABS, renderDictionary } from "./ui/dictionary.tsx";
import type { DictionaryTab } from "./ui/dictionary.tsx";
import type { LoreEntry } from "./ui/lore.tsx";
import { renderMenu } from "./ui/menu.tsx";
import type { LogLine } from "./ui/menu.tsx";
import { renderStatus } from "./ui/status.tsx";
import { renderStoryCard } from "./ui/story.tsx";
import { renderStart } from "./ui/start.tsx";
import { renderStrip } from "./ui/strip.tsx";
import type { ToolRow } from "./ui/strip.tsx";
import type { HelpBuild, Look, PadSide, WallMode } from "./settings.ts";
import { renderTitleCard } from "./ui/title.tsx";
import { renderDemoStrip } from "./ui/demo.tsx";
import type { DemoView } from "./demo.ts";
import { renderLookPick } from "./ui/look-pick.tsx";
import { renderHelpAsk } from "./ui/help-ask.tsx";
import { ratingText, renderSharedCard } from "./ui/shared.tsx";
import type { SharedView } from "./share/visit.ts";
import type { RatingState } from "./share/rating.ts";
import { renderLevels } from "./ui/levels.tsx";
import { renderEndlessCard } from "./ui/endless.tsx";
import type { EndlessMode } from "./endless/mode.ts";
import { endlessKicker } from "./endless/name.ts";
import { wallHint } from "./wall-hint.ts";
import type { LevelMark, LevelRow } from "./ui/levels.tsx";

/** What the page borrows at run time. */
export interface UiDeps {
  atlas: Atlas;
  board: SheetBoard;
  progress: Progress;
  /** The story pages found in this browser, for the Lore Book. */
  pages: FoundPages;
  /** The levels the game plays, for telling one from outside the campaign and a try's proven line (its fewest moves); without it every level is the campaign's. */
  levels?: Pick<Levels, "outside" | "line">;
  /** Voices an event (the chapter card's sound). */
  sfx?(name: SfxName): void;
  /** Told the cards after every change to them (the modern board hides behind the editor). */
  cards?(stack: LayerName[]): void;
  /** The Dictionary entries met in this browser. Without it no first card or banner shows and every entry is locked. */
  met?: Met;
  /** The Modern icons (fx/sprites/modern-icons.json): the Dictionary's pictures in the Modern look. Without them every
   *  picture is Classic's sprite. */
  icons?: IconSheet;
  /** The Map button's face, painted by the page with the level in the other look. */
  thumb?: HTMLCanvasElement;
  /** The randomness that picks the hearts line (src/hearts-lines.ts); Math.random when not given. */
  rng?: () => number;
  /** The banner's timer; the window's when not given. */
  timers?: Pick<Timers, "setTimeout" | "clearTimeout">;
}

/** What a key press or click asks of the page. */
export interface Controls {
  game: Game;
  toggleMute(): void;
  /** The Music switch, beside Sound in the menu. */
  toggleMusic?(): void;
  /** The Music in the background switch, under Music in the menu. */
  toggleBackground?(): void;
  /** The Look choice (the new-game card and the menu). */
  setLook?(look: Look): void;
  /** The Walls choice, shown while the look is modern. */
  setWalls?(walls: WallMode): void;
  /** The Arrows choice in the menu: the edge of the strip the move pad stands at. */
  setPad?(side: PadSide): void;
  /** The Mini map switch, shown while the look is modern. */
  toggleMinimap?(): void;
  /** The Help Build Endless Levels switch in the menu. */
  toggleHelpBuild?(): void;
  /** The player answered the card that asks once whether to help build Endless levels. */
  setHelpBuild?(on: boolean): void;
  /** Show View Tips: the modern board's tips by the compass again (the menu, the ? key). */
  showViewTips?(): void;
  toggleFullscreen(): void;
  /** Wake the speakers: any gesture does. */
  wake(): void;
  /** Leave the game (the menu's Quit). */
  quit(): void;
  /** Enter the halls on the new-game card (after the title card's Play): opens Chapter 1's opening card, whatever
   *  this browser has cleared. Given level `at` (the title card's Continue), that level's chapter card instead,
   *  whose Enter starts it. */
  play(at?: number): void;
  /** Back to the editor from a try: offered in the menu and on the end card while a try is in play. */
  backToEditor?(): void;
  /** The level editor, when the page has one: Make a level on the title card opens it, and while it is the top
   *  layer every key goes to it. */
  editor?: Pick<Editor, "open" | "close" | "key">;
  /** The open share link, when the page has one: its card, Play and Edit a copy. */
  shared?: { card(): SharedView | null; play(): void; edit(): void };
  /** Endless, when the page has it: its card's words and actions, and the link that opens the saved run's seed. */
  endless?: { mode: EndlessMode; link(): string | null; copy?(link: string): void };
  /** The editor's visit ended: the editor was left for the title card, or a campaign level was opened (from a try,
   *  or from anywhere). */
  leftEditor?(): void;
  /** Demo, when the page has it: the title card's Demo (and its key) starts it. */
  demo?: { start(): void };
}

export interface Ui {
  /** A line for the toast and the story log. */
  say(text: string, tone?: Tone): void;
  render(game: Game): void;
  setMuted(muted: boolean): void;
  setMusic(on: boolean): void;
  setBackground(on: boolean): void;
  setFullscreen(on: boolean): void;
  /** Shows the look and wall choices the page restored or changed. */
  setLook(look: Look, walls: WallMode): void;
  /** Puts the move pad at this edge of the strip (the frame wears `pad-right` for the right). */
  setPad(side: PadSide): void;
  /** Shows the Mini map switch's state. */
  setMinimap(on: boolean): void;
  /** Shows the Help Build Endless Levels switch's state; unset makes New Game and Endless ask first. */
  setHelpBuild(state: HelpBuild): void;
  /** Whether the modern board shows: it fills the board's space, so the classic canvas is not fitted and nothing
   *  scrolls. */
  setModernBoard(on: boolean): void;
  /** Turns a move key or pad press, a direction on the screen, into the direction on the grid it moves. */
  setMoveDir(fn: (dir: MoveAction) => MoveAction): void;
  /** The classic board's heading and tilt as it shows them now. */
  classicView(): Heading;
  /** Puts the classic board at this heading and tilt at once: the modern board's view, on switching looks. */
  setClassicView(yaw: number, pitch: number): void;
  /** How the classic sheet is framed now (src/sheet.ts); null before it is. */
  classicFrame(): Frame | null;
  /** True while a card other than the start card is open. */
  cardsOpen(): boolean;
  /** True while any card, the start card too, is open. */
  layersOpen(): boolean;
  /** Whether taking `what` now is a first, whose card the page shows (the game stops the turn's animation there). */
  isFirst(id: string): boolean;
  /** Closes the start card, as a move does. */
  closeStart(): void;
  bindControls(controls: Controls): void;
  /** The title card, alone; `hint` adds how to close an installed app, and `note` why a share link did not open. */
  showTitle(hint: boolean, note?: string): void;
  /** The level list, over whatever is showing. */
  showLevels(): void;
  /** Chapter `n`'s card, over whatever is showing: the opening one (Enter starts level `target`, the chapter's
   *  first unless given), or the closing one. */
  showChapter(n: number, closing: boolean, target?: number): void;
  /** Closes every card. */
  closeLayers(): void;
  /** The card showing now, if any. */
  top(): LayerName | null;
  /** The level editor, alone, when the page has one: on `draft` when given, else on the draft in progress. */
  showEditor(draft?: Parameters<Editor["open"]>[0]): void;
  /** The open share link's card, alone. */
  showShared(): void;
  /** The Endless card, alone. */
  showEndless(): void;
  /** A share link could not be opened: the toast and the title card say why. */
  refuseLink(message: string): void;
  /** Draws the cards again (the shared card's rating came in). */
  refresh(): void;
  /** Leaves the editor for the title card. */
  leaveEditor(): void;
  /** Leaves the shared card for the title card, keeping the installed-app close hint as it was. */
  leaveShared(): void;
  /** Demo is playing (its strip's words), or not: while it plays no card, banner or tip shows and nothing is met. */
  setDemo(view: DemoView | null): void;
}

const TOOL_KINDS = Object.keys(TOOLS) as Tool[];

const LOG_LIMIT = 80;
const TOAST_MS = 3000;
/** A long line stays up long enough to read: about 55 ms a character, never less than TOAST_MS. */
const toastMs = (text: string): number => Math.max(TOAST_MS, text.length * 55);
/** A wheel line, in pixels. */
const WHEEL_LINE_PX = 16;
/** How long the classic view rests before the sheet is drawn again at the cell that fits it. */
const SETTLE_MS = 200;
/** Whether the player asked for less motion: the view jumps rather than eases. */
/** A tool button's pickup glow and wiggle: two rounds of 1.1 s (game.css, .tool.got). */
const PICKUP_MS = 2200;
const reducedMotion = (): boolean => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

const $ = (id: string): HTMLElement => document.getElementById(id)!;

export function createUi(deps: UiDeps): Ui {
  const { atlas, board, progress, pages, sfx, met } = deps;
  const timers = deps.timers ?? { setTimeout: (fn: () => void, ms: number) => globalThis.setTimeout(fn, ms) as unknown as number, clearTimeout: (id: number) => globalThis.clearTimeout(id) };

  /** The level in play when it is from outside the campaign, else null. */
  const outsideOf = (g: Game | null): OutsideLevel | null => (g && g.trial >= 0 ? deps.levels?.outside?.(g.trial) ?? null : null);
  /** An outside level's kicker on its start and end cards. */
  const outsideKicker = (o: OutsideLevel): string => (o.kind === "try" ? "Your level" : o.kind === "endless" ? endlessKicker(o.depth ?? 1) : "Shared level");
  /** The menu's kicker and the line under its title: the level's chapter and number and its name, or for a level
   *  from outside the campaign what kind it is and its name; nothing when no level is open. */
  const menuPlace = (
    out: OutsideLevel | null,
    at: { chapter: { n: number }; within: number } | null,
    title: string,
  ): { place?: string; levelName?: string } =>
    out ? { place: outsideKicker(out), levelName: out.name }
      : at ? { place: placeWords(at.chapter.n, at.within + 1, title).short, levelName: title }
      : {};
  /** The shared card, while a shared level is in play and the open link's card is that level's. */
  const sharedCard = (g: Game | null): (() => void) | undefined => {
    const card = controls?.shared?.card();
    return card && g?.run && outsideOf(g)?.kind === "shared" && card.level === g.run.now.level ? () => showShared(true) : undefined;
  };
  /** Back to the editor, while a try is in play and the page gives it. */
  const backToEditor = (g: Game | null): (() => void) | undefined => {
    const back = controls?.backToEditor;
    return back && g?.run && outsideOf(g)?.kind === "try" ? () => back() : undefined;
  };

  const log: LogLine[] = [];
  let muted = false;
  let music = true;
  let background = true;
  let full = false;
  let look: Look = "modern";
  let walls: WallMode = "solid";
  let pad: PadSide = "left";
  let minimap = false;
  let helpBuild: HelpBuild = "unset";
  /** What the title card was doing when the Help Build card asked first: it goes on once answered. */
  let afterAsk: (() => void) | null = null;
  /** The strip as last drawn: a phone's, and whether its Thread panel is open. */
  let compact = false;
  let threadOpen = false;
  let toastTimer = 0;
  let controls: Controls | null = null;
  let game: Game | null = null;
  let titleHint = false;
  let sharedFromMenu = false;
  /** Why the last share link did not open, on the title card until it shows again some other way. */
  let titleNote = "";
  let end: EndView = { open: false, won: false, hasNext: false, hasLevels: false, pages: [], kicker: "", title: "", text: "", score: "" };
  /** The try whose ending card has been shown, so closing the card does not bring it back. */
  let endFor: unknown = null;
  let sized = "";
  /** The classic board's zoom over its whole-level cell, and that cell in CSS px (src/zoom.ts). */
  let zoom = 1;
  let wholePx = 0;
  /** The classic sheet's heading and tilt (src/sheet.ts), its cell in CSS px, and how it frames the board now. */
  const sheetView = createSheetView();
  let cellCss = 0;
  let frame: Frame | null = null;
  /** The classic board's compass, the easing display frame while the view eases, and the wait for it to rest. */
  let compass: CompassButton | null = null;
  let easing = 0;
  let settleTimer = 0;
  /** The opening and the try the zoom was kept for: a new level or a restart goes back to the whole level. */
  let zoomOpen = -1;
  let zoomRun: Run | null = null;
  /** The opening the start card was last shown for. */
  let shownOpen = 0;
  /** The chapter card's chapter, whether it is the closing card, and the level Enter on it starts. */
  let chapterN = 1;
  let chapterClosing = false;
  /** On a closing card opened by a win, that win's ending and score: "Level 10 cleared: 76 moves · best possible 76". */
  let chapterScore = "";
  let chapterTarget = 0;
  /** The chapter the level list shows. */
  let listed = 1;
  /** The Lore Book's open entry, or null for its list. */
  let loreShown: LoreEntry | null = null;
  /** The Lore entry was opened by taking its page, so its Back closes the book rather than showing the list. */
  let loreFromPickup = false;
  /** The pages of this try already shown on taking them. */
  let announced: string[] = [];
  /** Pages taken together (one slide can take several) that wait to open after the one showing. */
  let pending: string[] = [];
  /** The editor's layer is in the stack and the editor has been opened for it. */
  let editorShown = false;
  /** The first card showing, by entry id, and the first cards waiting behind it. */
  let meetShown: string | null = null;
  let meetQueue: string[] = [];
  /** The card showing was opened where the turn's animation stopped, which goes on once the card closes. */
  let meetAtStop = false;
  /** The animation stop whose card was opened, so a redraw does not open it again. */
  let stopNoticed: Stop | null = null;
  /** The state whose pickups and sights were last noticed. */
  let noticedNow: State | null = null;
  /** Entries whose first card showed at a stop of the turn animating: its landing gives them no banner. */
  let shownThisTurn = new Set<string>();
  /** The banner's entries (none while it is away), how many banners have shown, and the timer that takes it away. */
  let bannerEntries: Entry[] = [];
  /** The banner's line of words, when it says one (the hearts back to three) rather than naming entries. */
  let bannerLine: string | null = null;
  /** The next level is being reached from inside the game (Next, or a closing card going on): its opening shows the
   *  hearts line. Set by the way there; any other way to a level clears it. */
  let advancing = false;
  /** A level was opened by going on: the hearts line waits until no card is open. */
  let heartsQueued = false;
  /** The hearts line shown last, so the next differs. */
  let heartsLast = -1;
  let bannerSeq = 0;
  let bannerTimer = 0;
  /** The tools just picked up, each with the number of its pickup: a tool button glows and its picture wiggles
   *  while its number stands, and a new number plays them again. */
  const watchPickups = pickupWatch();
  const lit = new Map<Tool, number>();
  const litTimers = new Map<Tool, number>();
  let litSeq = 0;
  /** Tools picked up on the turn `litFor`, waiting for its animation to land. */
  let litWaiting: Tool[] = [];
  let litFor: State | null = null;
  function flushLit(): void {
    for (const t of litWaiting) lightTool(t);
    litWaiting = [];
    litFor = null;
  }
  /** A tool button's pickup glow: twice, then still (game.css, .tool.got). None with reduced motion. */
  function lightTool(t: Tool): void {
    if (reducedMotion()) return;
    lit.set(t, ++litSeq);
    const was = litTimers.get(t);
    if (was !== undefined) timers.clearTimeout(was);
    litTimers.set(t, timers.setTimeout(() => {
      lit.delete(t);
      litTimers.delete(t);
      if (game?.run) drawStrip(game);
    }, PICKUP_MS));
  }
  /** What the Dictionary's pictures are drawn from: the look the board shows now. */
  const pics = (): Pics => (deps.icons ? { look, atlas, icons: deps.icons } : { look, atlas });
  /** The Dictionary's tab. */
  let dictTab: DictionaryTab = "backpack";
  /** The modern board shows instead of the classic canvas. */
  let modernBoard = false;
  /** A move on the screen as a move on the grid. */
  let moveDir = (dir: MoveAction): MoveAction => dir;
  /** Demo is playing: its strip's words. */
  let demo: DemoView | null = null;

  const layers = createLayers(() => {
    if (layers.any()) game?.stop();
    if (!layers.isOpen("menu")) resetAsking = false;
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
    // A first card closed some other way (Quit, a level opened) takes the cards waiting behind it too.
    if (meetShown !== null && !layers.has("meet")) {
      meetShown = null;
      meetQueue = [];
      if (meetAtStop) {
        meetAtStop = false;
        (controls?.game ?? game)?.resume();
      }
    }
    showHeartsWhenClear();
    drawLayers();
    deps.cards?.(layers.stack());
    tourWhenClear();
    tipsWhenClear();
  });

  /** The campaign index of chapter `n`'s first level. */
  function firstOf(n: number): number {
    return CHAPTERS.filter((c) => c.n < n && c.released).reduce((sum, c) => sum + c.levelIds.length, 0);
  }

  function levelRows(n: number): LevelRow[] {
    const first = firstOf(n);
    return CHAPTERS[n - 1]!.levelIds.map((id, i) => {
      const p = progress.get(id);
      const fewest = FEWEST[id];
      const level = CAMPAIGN_LEVELS.level(first + i);
      const marks: LevelMark[] = !p.cleared ? [{ text: "not yet" }]
        : p.assisted ? [{ text: "cleared with help", tone: "clear" }]
        : [{ text: "cleared", tone: "clear" }, { text: `your best ${p.best}` }];
      if (fewest !== undefined) {
        marks.push({ text: `best possible ${fewest}` });
        if (p.cleared && !p.assisted) {
          marks.push(p.best! <= fewest ? { text: "perfect", tone: "perfect" } : { text: `(${p.best! - fewest} over)`, tone: "over", sep: " " });
        }
      }
      if (level.pageIds.some((pg) => pages.has(pg))) marks.push({ text: "page found", tone: "page" });
      return { title: level.title, marks };
    });
  }

  /** Continue on a closing card: the next chapter's opening card when it is released, else back to the end card. */
  function goOn(): void {
    const next = nextChapter(chapterN);
    if (next?.released) {
      showChapter(next.n, false);
      advancing = true;
    } else leave("chapter");
  }

  /** Next level from the end card: a chapter's first level shows that chapter's opening card first. */
  function nextLevel(): void {
    const g = controls?.game ?? game;
    if (outsideOf(g)?.kind === "endless") {
      const mode = controls?.endless?.mode;
      mode?.next();
      if (mode?.view().finding) showEndless(true);
      return;
    }
    pick(g!.trial + 1, true);
  }

  /** The Endless card opened from play (Next Level waiting on the next level), not from the title card or a link:
   *  Escape leaves it be. */
  let endlessFromPlay = false;

  /** The Endless card, alone; `fromPlay` when Next Level opened it to wait for the level being made. */
  function showEndless(fromPlay = false): void {
    if (!controls?.endless) return;
    endlessFromPlay = fromPlay;
    layers.clear();
    layers.open("endless");
  }

  /** New Game on the title card: the new-game card, once the Help Build card has its answer. */
  function newGame(): void {
    askFirst(() => layers.open("look"));
  }

  /** The title card's New Game and Endless ask once, before they go on, whether this device may help build Endless
   *  levels; once answered (or with no one to answer to) they go straight on. Demo never asks. */
  function askFirst(then: () => void): void {
    if (helpBuild !== "unset" || !controls?.setHelpBuild) {
      then();
      return;
    }
    afterAsk = then;
    layers.open("help");
  }

  /** The answer on the Help Build card: kept, and what asked goes on. */
  function answerAsk(on: boolean): void {
    controls?.wake();
    helpBuild = on ? "on" : "off";
    controls?.setHelpBuild?.(on);
    const then = afterAsk;
    afterAsk = null;
    layers.close("help");
    then?.();
  }

  /** Demo, from the title card: Endless plays by itself under no card (src/demo.ts). */
  function startDemo(): void {
    controls?.wake();
    controls?.demo?.start();
  }

  /** Demo started or ended, or its words changed. Once it ends, what it played stays as it was: its last level's
   *  start, end and first cards never show late. */
  function setDemo(view: DemoView | null): void {
    const starting = !demo && !!view;
    demo = view;
    if (starting) {
      // The level played before stays hidden while Demo finds its own, which then fades in: one map, never two.
      boardFade("wait");
      // Whatever stood over the board before (a banner, a toast; a rule tip hides while Demo plays) goes.
      bannerEntries = [];
      bannerLine = null;
      timers.clearTimeout(bannerTimer);
      timers.clearTimeout(toastTimer);
      const toast = document.getElementById("toast");
      if (toast) toast.className = "toast";
      drawLayers();
    }
    if (!view) {
      if (document.getElementById("board")?.className.includes("board-wait")) boardFade("in");
      const g = controls?.game ?? game;
      endFor = g?.run ?? null;
      shownOpen = g?.opens ?? shownOpen;
      noticedNow = g?.run?.now ?? null;
    }
    renderDemoStrip(document.getElementById("demo-root"), { view });
  }

  /** Q or Back on the Endless card: a search the player waits on stops, and the title card shows. */
  function leaveEndless(): void {
    controls?.endless?.mode.cancel();
    showTitle(titleHint);
  }

  function showChapter(n: number, closing: boolean, target = firstOf(n)): void {
    chapterN = n;
    chapterClosing = closing;
    chapterScore = "";
    chapterTarget = target;
    advancing = false;
    sfx?.("chapter");
    layers.open("chapter");
  }

  /** Closes a card; with nothing left open and no level loaded, the title shows rather than a blank screen. */
  function leave(name: LayerName): void {
    layers.close(name);
    if (!layers.any() && !(controls?.game ?? game)?.run) showTitle(titleHint);
  }

  /** Opens level `i`. A level from inside the campaign ends the editor's visit, if a try was part of it. `advance`:
   *  it is reached by going on from inside the game, so the hearts line shows once its cards have closed. */
  function open(i: number, advance = false): void {
    advancing = false;
    heartsQueued = false;
    layers.clear();
    // Queued once the cards are cleared, so it waits for the new level's own start card.
    heartsQueued = advance;
    if (!deps.levels?.outside?.(i)) controls?.leftEditor?.();
    controls?.game.open(i);
  }

  /** A level picked from the list or the chapter card, or gone on to (`advance`): a chapter's first level shows the
   *  chapter card first. */
  function pick(i: number, advance = false): void {
    const { chapter, within } = chapterOf(i);
    if (within === 0) {
      layers.close("levels");
      showChapter(chapter.n, false, i);
      advancing = advance;
    } else open(i, advance);
  }

  /** A look picked on the new-game card: drawn at once and remembered. */
  function pickLook(l: Look): void {
    controls?.wake();
    if (l !== look) controls?.setLook?.(l);
  }

  /** The first released level this browser has not cleared, in campaign order: where the title card's Continue
   *  goes. Null when nothing is cleared yet (a new game is the only way in) or when everything is. */
  function resume(): number | null {
    const ids = LEVEL_IDS.map((id) => progress.get(id).cleared);
    if (!ids.some(Boolean)) return null;
    const i = ids.indexOf(false);
    return i < 0 ? null : i;
  }

  /** Where Continue goes, for its title and accessible name: "Continue at Chapter 2, Level 3". */
  function continueWords(i: number): string {
    const { chapter, within } = chapterOf(i);
    return `Continue at Chapter ${chapter.n}, Level ${within + 1}`;
  }

  /** Continue on the title card: the chapter card of the first level not cleared, whose Enter starts it. */
  function goResume(): void {
    const i = resume();
    if (i === null) return;
    track("game_start", "continue");
    controls?.wake();
    controls?.play(i);
  }

  /** Enter the halls on the new-game card: the card closes and the chapter card opens over the title. */
  function enterHalls(): void {
    track("game_start", "new");
    layers.close("look");
    controls?.play();
  }

  /** Enter on the opening card starts the level it was opened for. */
  function enter(): void {
    open(chapterTarget, advancing);
  }

  function showEditor(draft?: Parameters<Editor["open"]>[0]): void {
    const editor = controls?.editor;
    if (!editor) return;
    layers.clear();
    layers.open("editor");
    editorShown = true;
    editor.open(draft);
  }

  /** `fromMenu`: the card was opened from the menu during its level, so Q goes back to the menu, not the title card. */
  function showShared(fromMenu = false): void {
    if (!controls?.shared?.card()) return;
    sharedFromMenu = fromMenu;
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

  function leaveShared(): void {
    if (layers.isOpen("shared")) showTitle(titleHint);
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
      onPlay: newGame,
      ...(resume() !== null ? { resume: continueWords(resume()!), onContinue: goResume } : {}),
      onStory: () => layers.open("story"),
      ...(controls?.editor ? { onEditor: showEditor } : {}),
      ...(controls?.endless ? { onEndless: () => askFirst(() => showEndless()) } : {}),
      ...(controls?.demo ? { onDemo: startDemo } : {}),
      onSettings: () => layers.open("menu"),
    });
    renderDemoStrip(document.getElementById("demo-root"), { view: demo });
    const endless = controls?.endless;
    if (endless) {
      const copy = endless.copy;
      renderEndlessCard($("endless-root"), {
        ...endless.mode.view(),
        open: layers.isOpen("endless"),
        link: endless.link(),
        ...(copy ? { onCopy: copy } : {}),
        onContinue: () => {
          controls?.wake();
          track("game_start", "endless");
          endless.mode.continueRun();
        },
        onNew: (seed, tier, grade) => {
          controls?.wake();
          track("game_start", "endless");
          endless.mode.newRun(seed, tier, grade);
        },
        onGrade: grade => endless.mode.choose(grade),
        onCancel: leaveEndless,
        onBack: leaveEndless,
      });
    }
    renderHelpAsk($("help-root"), {
      open: layers.isOpen("help"),
      onYes: () => answerAsk(true),
      onNo: () => answerAsk(false),
    });
    renderLookPick($("look-root"), {
      open: layers.isOpen("look"),
      look,
      onLook: pickLook,
      onEnter: enterHalls,
      onBack: () => layers.close("look"),
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
      score: chapterScore,
      next: nextChapter(chapterN),
      pagesFound: CHAPTERS.flatMap(c => c.lore?.pages ?? []).filter(pg => pages.has(pg.id)).length,
      pagesTotal: CHAPTERS.flatMap(c => c.lore?.pages ?? []).length,
      onEnter: enter,
      onLevels: () => layers.open("levels"),
      onClose: () => (chapterClosing ? goOn() : leave("chapter")),
      onBack: () => leave("chapter"),
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
    const hint = lv ? wallHint(lv, playing?.chapter.n ?? null) : null;
    renderStart($("start-root"), {
      open: layers.isOpen("start"),
      chapter: playing?.chapter.n ?? 1,
      number: (playing?.within ?? 0) + 1,
      ...(out ? { kicker: outsideKicker(out) } : {}),
      title: out ? out.name : lv?.title ?? "",
      intro: lv?.intro ?? "",
      ...(hint ? { hint } : {}),
      ...(out?.best != null ? { best: `beat ${out.best}` } : {}),
      onBegin: () => layers.close("start"),
    });
    renderEndCard($("end-root"), {
      ...end,
      open: layers.isOpen("end"),
      onNext: nextLevel,
      onRetry: () => open(g?.trial ?? 0),
      onTrials: () => layers.open("levels"),
      onUndo: () => g?.press("undo"),
      onRestart: () => g?.press("restart"),
      onBackToEditor: backToEditor(g),
    });
    renderLore($("lore-root"), {
      open: layers.isOpen("lore"),
      fromPickup: loreFromPickup,
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
    renderMeetCard($("meet-root"), { open: layers.isOpen("meet"), entry: meetShown === null ? null : ENTRY[meetShown] ?? null, pics: pics(), onClose: closeMeet });
    renderDictionary($("dict-root"), {
      open: layers.isOpen("dictionary"),
      tab: dictTab,
      inLevel: !!g?.run,
      held: backpack(g?.run?.now ?? null),
      rows: LISTED.map((entry) => ({ entry, met: !locked(entry.id, (k) => met?.has(k) ?? false) })),
      pics: pics(),
      onTab: (t) => {
        dictTab = t;
        drawLayers();
      },
      onClose: () => layers.close("dictionary"),
    });
    const tipNow = tipShowing();
    renderBanner($("banner-root"), { entries: bannerEntries, line: bannerLine, seq: bannerSeq, pics: pics(), tip: tipNow, onTip: closeTip });
    // A tip that has just come up takes the focus, so the keyboard lands on Got It.
    if (tipNow && tipNow.id !== tipFocused) document.getElementById("tip-ok")?.focus();
    tipFocused = tipNow?.id ?? null;
    renderMenu($("menu-root"), {
      open: layers.isOpen("menu"),
      muted,
      music,
      background,
      fullscreen: full,
      look,
      walls,
      pad,
      minimap,
      helpBuild: helpBuild === "on",
      log,
      help: helpLines(KEYS, TOOLS),
      onSound: () => {
        controls?.wake();
        controls?.toggleMute();
      },
      onMusic: () => {
        controls?.wake();
        controls?.toggleMusic?.();
      },
      onBackground: () => {
        controls?.wake();
        controls?.toggleBackground?.();
      },
      onFullscreen: () => controls?.toggleFullscreen(),
      onWalls: (w) => controls?.setWalls?.(w),
      onPad: (side) => controls?.setPad?.(side),
      onMinimap: () => controls?.toggleMinimap?.(),
      onHelpBuild: () => controls?.toggleHelpBuild?.(),
      viewTips: look === "modern" || touchScreen(),
      onViewTips: () => {
        layers.close("menu");
        viewTips();
      },
      resetAsking,
      onResetAsk: (asking) => {
        resetAsking = asking;
        drawLayers();
        document.getElementById(asking ? "menu-reset-no" : "menu-reset-tips")?.focus();
      },
      onResetTips: () => {
        resetAsking = false;
        resetTips();
        drawLayers();
        document.getElementById("menu-reset-tips")?.focus();
      },
      onLore: () => {
        loreShown = null;
        loreFromPickup = false;
        layers.open("lore");
      },
      onDictionary: () => showDictionary(),
      onQuit: () => {
        controls?.wake();
        controls?.quit();
      },
      onClose: () => layers.close("menu"),
      ...menuPlace(out, playing, lv?.title ?? ""),
      onBackToEditor: backToEditor(g),
      onSharedCard: sharedCard(g),
      ...endlessSeed(out),
    });
  }

  /** The menu's seed line during an Endless run, with Copy Seed Link when the page can copy. */
  function endlessSeed(out: OutsideLevel | null): { seed?: string; onCopySeed?: () => void } {
    const endless = controls?.endless;
    const seed = out?.kind === "endless" && !out.demo ? endless?.mode.view().run?.seed : undefined;
    if (!endless || !seed) return {};
    const link = endless.link();
    const copy = endless.copy;
    return link && copy ? { seed, onCopySeed: () => copy(link) } : { seed };
  }

  /** The fewest possible moves of the level in play, where known (the campaign's table, an Endless level's search, a
   *  try's or a shared level's proven line), and the player's own best clear of a campaign level. */
  function fewestOf(g: Game, out: OutsideLevel | null): { fewest?: number; yourBest?: number | null } {
    if (out) {
      const fewest = out.fewest ?? (out.kind !== "endless" ? deps.levels?.line?.(g.trial)?.length : undefined);
      return fewest === undefined ? {} : { fewest };
    }
    const id = LEVEL_IDS[g.trial];
    const fewest = id === undefined ? undefined : FEWEST[id];
    return fewest === undefined ? {} : { fewest, yourBest: progress.get(id!).best };
  }

  function say(text: string, tone?: Tone): void {
    log.push(tone ? { text, tone } : { text });
    while (log.length > LOG_LIMIT) log.shift();
    // Demo plays quietly: its lines go to the story log, not the toast.
    if (demo) return;
    const toast = $("toast");
    toast.textContent = text;
    toast.className = tone ? `toast show ${tone}` : "toast show";
    timers.clearTimeout(toastTimer);
    toastTimer = timers.setTimeout(() => { toast.className = toast.className.split(" ").filter((c) => c !== "show").join(" "); }, toastMs(text));
    if (layers.isOpen("menu")) drawLayers();
  }

  /** The classic board's cell at its whole-level fit (src/sheet.ts sheetCell), for the view as it now is: the largest
   *  whole CSS px cell at which the turned, tilted level fits the board's space unscaled; then the zoom, if any
   *  (src/zoom.ts), on top of it. */
  function fit(): void {
    const run = game?.run;
    if (!run) return;
    if (modernBoard) {
      sized = "";
      return;
    }
    const { cols, rows } = run.now.level;
    const view = $("stage-view");
    wholePx = sheetCell(sheetView.cur, cols, rows, atlas.rise / atlas.cell, view.clientWidth, view.clientHeight);
    sized = `${cols}x${rows}`;
    resize();
  }

  /** Sizes the sheet for the zoom and frames it: the whole level at zoom 1; zoomed, the view keeps its centre (or,
   *  about the screen point `at`, the spot of the board under it) and Theseus inside it. */
  function resize(at?: { x: number; y: number }): void {
    const run = game?.run;
    if (!run || modernBoard || !wholePx) return;
    const { cols, rows } = run.now.level;
    const view = $("stage-view");
    // A board with no room (hidden, or collapsed by the layout) is framed once it has some.
    if (view.clientWidth <= 0 || view.clientHeight <= 0) return;
    const before = frame;
    const was = cellCss;
    zoom = clampZoom(zoom, wholePx);
    cellCss = zoomedCell(wholePx, zoom, window.devicePixelRatio || 1);
    board.size(cols, rows, cellCss);
    const vw = view.clientWidth, vh = view.clientHeight;
    if (zoom === 1 || !before || !was) {
      frame = wholeFrame(sheetView.cur, cols, rows, cellCss, atlas.rise / atlas.cell, vw, vh);
      if (zoom > 1) frame = keepInView({ ...frame, k: 1, ox: 0, oy: 0 }, (run.now.player.c + 0.5) * cellCss, (run.now.player.r + 0.5) * cellCss, cols, rows, cellCss);
    } else {
      const ratio = cellCss / was;
      const r = view.getBoundingClientRect();
      const p = at ? { x: at.x - r.left, y: at.y - r.top } : { x: vw / 2, y: vh / 2 };
      const g = unproject(before, p.x, p.y);
      const mid = unproject(before, vw / 2, vh / 2) ?? { x: before.tx, y: before.ty };
      let f: Frame = { ...before, tx: mid.x * ratio, ty: mid.y * ratio, ox: 0, oy: 0, k: 1, d: eye(cols, rows, cellCss), vw, vh };
      if (g) {
        const q = project(f, g.x * ratio, g.y * ratio);
        f = centredOn(f, vw / 2 + q.x - p.x, vh / 2 + q.y - p.y);
      }
      frame = holdTarget(f, cols, rows, cellCss);
      if (!at) frame = keepInView(frame, (run.now.player.c + 0.5) * cellCss, (run.now.player.r + 0.5) * cellCss, cols, rows, cellCss);
    }
    board.frame(frame);
  }

  /** Frames the sheet again for the view as it now is (a turn, a tilt), keeping the zoom and where it looks. */
  function reframe(): void {
    const run = game?.run;
    if (!run || modernBoard || !frame || !cellCss) return;
    const { cols, rows } = run.now.level;
    const view = $("stage-view");
    const vw = view.clientWidth, vh = view.clientHeight;
    if (vw <= 0 || vh <= 0) return;
    const v = sheetView.cur;
    frame = zoom === 1
      ? wholeFrame(v, cols, rows, cellCss, atlas.rise / atlas.cell, vw, vh)
      : { ...frame, yaw: v.yaw, pitch: v.pitch, vw, vh };
    board.frame(frame);
    compass?.setView(v.yaw, v.pitch);
    // Once the view rests, the whole level is drawn again at the cell that fits it unscaled, crisp.
    clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => {
      if (zoom === 1 && !easing) fit();
    }, SETTLE_MS);
  }

  /** Eases the view toward where a button, a key or the compass sent it, a display frame at a time. A frame's time
   *  can come before the input that started the ease (a phone stamps the frame as it begins, then reads the tap), so
   *  the time between frames is measured on the frames' own clock, the first counting as a sixtieth of a second; and
   *  the next frame is asked for before this one is drawn, so the ease always finishes. */
  function ease(): void {
    if (easing) return;
    let last: number | null = null;
    const tick = (now: number): void => {
      const moving = sheetView.step(last === null ? 1 / 60 : (now - last) / 1000, reducedMotion());
      last = now;
      easing = moving ? requestAnimationFrame(tick) : 0;
      reframe();
      if (!moving && zoom === 1) fit();
    };
    easing = requestAnimationFrame(tick);
  }

  /** Pans a zoomed board, instantly, to keep the player two cells inside the view; the zoom stays as it is. */
  function followPlayer(s: State): void {
    if (zoom === 1 || !frame || modernBoard) return;
    const { cols, rows } = s.level;
    frame = keepInView(frame, (s.player.c + 0.5) * cellCss, (s.player.r + 0.5) * cellCss, cols, rows, cellCss);
    board.frame(frame);
  }

  function toolRows(g: Game): ToolRow[] {
    const s = g.run!.now;
    return TOOL_KINDS.map((kind) => ({
      kind,
      entry: ENTRY[kind]!,
      name: TOOLS[kind].name,
      key: TOOLS[kind].key,
      count: s.tools[kind],
      desc: TOOLS[kind].desc,
      disabled: s.outcome !== "playing" || s.tools[kind] <= 0,
      lit: s.tools[kind] > 0 ? lit.get(kind) ?? 0 : 0,
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
    const caughtWords = g.catches === 0 ? "" : ` You were caught ${g.catches === 1 ? "once" : `${g.catches} times`}, so this win does not count toward your best.`;
    const how = (run.assisted ? "You followed Ariadne's thread." : "You found the way on your own.") + caughtWords;
    const help = run.assisted ? "with help" : "";
    const out = outsideOf(g);
    // A level from outside the campaign records nothing and has no chapter: its card names it and, for a shared
    // level, sets the win against the author's best (only a win without help can beat it).
    if (out?.kind === "endless") {
      return {
        open: true, won, hasNext: true, hasLevels: false, pages: [], kicker: `${endlessKicker(out.depth ?? 1)} cleared`, title: out.name,
        text: how,
        score: [`${s.moves} moves`, out.fewest !== undefined ? againstFewest(s.moves, out.fewest, g.catches) : "", help].filter(Boolean).join(" · "),
      };
    }
    if (out) {
      const author = out.best === null ? "" : !run.assisted && g.catches === 0 && s.moves < out.best ? ` You beat the author's ${out.best}.` : ` The author's best is ${out.best}.`;
      return {
        open: true, won, hasNext: false, hasLevels: false, pages: [], kicker: outsideKicker(out), title: out.name,
        text: how + author, score: [`${s.moves} moves`, help].filter(Boolean).join(" · "),
      };
    }
    const id = LEVEL_IDS[g.trial]!;
    const best = progress.get(id).best;
    const fewest = FEWEST[id];
    // Every page this win took, not only the new ones: a replayed win still shows its page line.
    const titles = CHAPTERS.flatMap((c) => c.lore?.pages ?? []);
    const pages = pagesTaken(s).map((id) => titles.find((p) => p.id === id)?.title ?? id);
    return {
      open: true, won, hasNext: g.trial + 1 < LEVEL_IDS.length, hasLevels: true, pages, kicker: `Level ${chapterOf(g.trial).within + 1} cleared`, title: s.level.title,
      text: how,
      score: [`${s.moves} moves`, fewest !== undefined ? againstFewest(s.moves, fewest, g.catches) : "", best !== null && best !== s.moves ? `your best ${best}` : "", help]
        .filter(Boolean).join(" · "),
    };
  }

  /** The board's state between levels: "wait" keeps it hidden (Demo finding its first level, so the level played
   *  before never shows under it), "in-a" or "in-b" fades it in (two names, so each new level starts the fade again),
   *  "" shows it as it is. A fade that has run its course is taken off, so the board keeps no animated layer. */
  let fadeHeard = false;
  function boardFade(state: "wait" | "in" | ""): void {
    const el = document.getElementById("board");
    if (!el) return;
    if (!fadeHeard) {
      fadeHeard = true;
      el.addEventListener("animationend", (e) => {
        if ((e as AnimationEvent).animationName?.startsWith("board-in") && el.className.includes("board-in")) boardFade("");
      });
    }
    const rest = el.className.split(" ").filter((c) => c && !c.startsWith("board-"));
    const was = el.className.includes("board-in-a") ? "a" : "b";
    const cls = state === "wait" ? "board-wait" : state === "in" && !reducedMotion() ? `board-in-${was === "a" ? "b" : "a"}` : "";
    el.className = [...rest, cls].filter(Boolean).join(" ");
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
    // A new level opens at 75° and north up; it and a restart show the whole level again; a step or an undo keeps
    // the zoom and the view.
    if (g.opens !== zoomOpen) {
      sheetView.home(false);
      compass?.setView(sheetView.cur.yaw, sheetView.cur.pitch);
      sized = "";
    }
    if (g.opens !== zoomOpen || restarted(zoomRun, run)) {
      zoomOpen = g.opens;
      if (zoom !== 1) {
        zoom = 1;
        sized = "";
      }
    }
    zoomRun = run;
    if (sized !== `${s.level.cols}x${s.level.rows}`) fit();
    else followPlayer(s);
    // A level opened: the start card shows (a restart does not); the story log keeps its words.
    if (g.opens !== shownOpen) {
      shownOpen = g.opens;
      // The new level fades in at once, under its start card (which waits for input as before), never a blank board.
      boardFade("in");
      announced = [];
      pending = [];
      const name = out ? out.name : s.level.title;
      log.push({ text: s.level.intro ? `${name}: ${s.level.intro}` : name, tone: "info" });
      if (!out) listed = chapterOf(g.trial).chapter.n;
      tips?.clear();
      // Demo plays its levels by itself: no card stands over them.
      if (!demo) layers.open("start");
    }

    const at = out ? null : chapterOf(g.trial);
    const place = at ? placeWords(at.chapter.n, at.within + 1, s.level.title) : null;
    renderStatus($("status-root"), {
      view: statusView({
        trial: place?.short ?? (out?.kind === "endless" ? `Endless • Level ${out.depth ?? 1}` : ""),
        trialNote: place?.full ?? (out?.kind === "endless" ? `${endlessKicker(out.depth ?? 1)}: ${out.name}` : ""),
        hearts: s.hearts,
        relicsLeft: s.relicsLeft,
        keys: s.keys,
        gear: s.gear,
        moves: s.moves,
        stone: s.stone,
        effects: activeEffects(s),
        ...fewestOf(g, out),
      }),
      menuKey: KEYS.menu.label,
      onMenu: () => layers.open("menu"),
    });

    // A pickup glows once the turn's animation has landed (a first card can pause it before the figure reaches the
    // tool); a newer turn lights the pickups still waiting at once.
    if (litFor !== null && litFor !== s) flushLit();
    const got = watchPickups(s, g.took);
    if (got.length > 0) {
      litWaiting = got;
      litFor = s;
    }
    if (!g.anim) flushLit();
    drawStrip(g);

    // The ending card waits for the last step to land; a try taken back or begun again lets the next ending show.
    if (s.outcome === "playing") {
      endFor = null;
      layers.close("end");
    } else if (!g.anim && endFor !== run && !demo) {
      endFor = run;
      end = endView(g);
      layers.open("end");
      // A chapter's last level won: its closing card opens over the end card, which waits under it.
      // It carries the win's moves and best possible, since it covers the end card that shows them.
      if (at && end.won && at.within === at.chapter.levelIds.length - 1) {
        showChapter(at.chapter.n, true);
        chapterScore = `${end.kicker}: ${end.score}`;
      }
    }
    if (!demo) {
      notice(g);
      announcePages(g);
    }
    drawLayers();
  }

  /** First cards show, and banners, where the player is not trying out a level from the editor. */
  const cardsOn = (g: Game | null): boolean => !!met && outsideOf(g)?.kind !== "try";

  function isFirst(id: string): boolean {
    return !demo && !!met && firstMeeting(id, met, cardsOn(controls?.game ?? game));
  }

  /** What the player meets: where the turn's animation stopped at a first meeting (an item taken, an active tile
   *  touched), its card; once a turn has landed, a card for each other first meeting and one banner for the rest. A
   *  story page taken has neither: its story opens, and its entry is noted as met. */
  function notice(g: Game): void {
    if (!met) return;
    const run = g.run!;
    const on = cardsOn(g);
    const stop = g.anim?.paused ?? null;
    if (stop && stop.kind === "meet" && stop !== stopNoticed) {
      stopNoticed = stop;
      const id = cardOf(stop.id);
      shownThisTurn.add(stop.id);
      meetQueue = [id, ...meetQueue.filter((x) => x !== id)];
      meetAtStop = true;
      showNextMeet();
      return;
    }
    if (g.anim || run.now === noticedNow) return;
    noticedNow = run.now;
    tipsAfter(g);
    if (on && g.took.includes("page")) met.add(metId("page"));
    const plan = meetNotices(g.meets, met, on, shownThisTurn);
    shownThisTurn = new Set();
    for (const id of plan.cards) if (id !== meetShown && !meetQueue.includes(id)) meetQueue.push(id);
    showBanner(plan.banners);
    showNextMeet();
  }

  /** Opens the next first card waiting, unless one is showing or a story page taken is being read. */
  function showNextMeet(): void {
    if (meetShown !== null || loreFromPickup) return;
    const id = meetQueue.shift();
    if (id === undefined) return;
    met?.add(metId(id));
    meetShown = id;
    layers.open("meet");
  }

  /** Closes the first card: the next one waiting opens in its place; then a story page taken waits its turn, and a
   *  turn's animation stopped at the card goes on. */
  function closeMeet(): void {
    const next = meetQueue.shift();
    if (next !== undefined) {
      met?.add(metId(next));
      meetShown = next;
      drawLayers();
      return;
    }
    meetShown = null;
    layers.close("meet");
    if (pending.length > 0) showNextPickup();
    if (meetAtStop) {
      meetAtStop = false;
      (controls?.game ?? game)?.resume();
    }
  }

  /** The banner, naming `ids`, until BANNER_MS have passed; a new one replaces it. */
  function showBanner(ids: readonly string[], line: string | null = null): void {
    if (ids.length === 0 && line === null) return;
    bannerEntries = ids.map((id) => ENTRY[id]!);
    bannerLine = line;
    bannerSeq++;
    timers.clearTimeout(bannerTimer);
    bannerTimer = timers.setTimeout(() => {
      bannerEntries = [];
      bannerLine = null;
      drawLayers();
    }, BANNER_MS);
  }

  /** The hearts line, once a level gone on to has its board in view: no card open, its start card included. */
  /** Reset Tips in the menu is asking whether to go ahead. */
  let resetAsking = false;
  /** The touch tour showing, if it is. */
  let tour: Tour | null = null;
  const touchScreen = (): boolean => typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;

  /** A level's start card was up at the last change of cards: its closing is the moment play starts. */
  let startWasUp = false;
  /** Play has started since the touch tour last could show, and it waits for the cards to clear. */
  let tourWaits = false;

  /** The touch tour, by itself, the first time play starts on a touch screen, once no card is over the board. It
   *  waits a moment so a card opening in the same breath (a first card, the next level's start card) goes first. */
  function tourWhenClear(): void {
    const startUp = layers.isOpen("start");
    if (startWasUp && !startUp) tourWaits = true;
    startWasUp = startUp;
    if (!tourWaits || tour || !met) return;
    timers.setTimeout(() => {
      const run = (controls?.game ?? game)?.run;
      if (!tourWaits || tour || !met || demo) return;
      const seen = met.carded(TOUR_ID);
      if (seen || !touchScreen()) {
        tourWaits = false;
        return;
      }
      if (tourDue({ touch: true, seen, playing: run?.now.outcome === "playing", covered: layers.any() })) {
        tourWaits = false;
        openTour();
      }
    }, 0);
  }

  function openTour(): void {
    if (tour) return;
    met?.noteCard(TOUR_ID);
    tour = showTour($("frame"), {
      surface: () => document.getElementById(modernBoard ? "stage3d" : "stage-view"),
      reducedMotion,
      closed: () => {
        tour = null;
        tipsWhenClear();
      },
    });
  }

  /** The tip whose Got It last took the focus. */
  let tipFocused: string | null = null;

  /** The rule tips (src/rule-tips.ts), where first cards show. */
  const tips = met ? createRuleTips(met) : null;

  /** The rule tip standing, while the board is in view: none under a card or the touch tour, which go first. */
  const tipShowing = () => (tips && !tour && !demo && !layers.any() ? tips.shown() : null);

  function closeTip(): void {
    tips?.close();
    drawLayers();
  }

  /** When the last blocked press nudged the tip, so a held key or pad nudges it once, not on every repeat. */
  let nudgedAt = -Infinity;
  /** A rule tip stands and holds play: true, and the tip is nudged (a pulse, and the focus on Got It) so the player
   *  sees why nothing moved. */
  function tipHolds(): boolean {
    if (!tipShowing()) return false;
    const now = Date.now();
    if (now - nudgedAt > 600) {
      nudgedAt = now;
      const box = document.getElementById("tip");
      if (box) box.className = box.className.includes("nudge-a") ? "tip-box nudge-b" : "tip-box nudge-a";
    }
    document.getElementById("tip-ok")?.focus();
    return true;
  }

  /** What the try in play shows the tips: with `turned`, the turn that just landed (if it was one, not an undo or a
   *  restart); else the board as it stands. None once the try is over, so no tip is spent under the ending card. */
  function tipEvent(g: Game, turned: boolean): TipEvent | null {
    const s = g.run?.now;
    if (!s || s.outcome !== "playing") return null;
    const sight = { beast: s.minotaur !== null, relics: s.relicsLeft > 0 };
    return turned && g.turn ? { kind: "turn", ...sight, moves: s.moves, steps: g.turn.beast, caught: g.turn.caught } : { kind: "view", ...sight };
  }

  /** A turn landed, or an undo or a restart did: the tip it calls for. Not while the touch tour shows or waits to;
   *  an undo's only under no card. */
  function tipsAfter(g: Game): void {
    if (!tips || !cardsOn(g) || tour || tourWaits || (!g.turn && layers.any())) return;
    const ev = tipEvent(g, true);
    if (ev && tips.on(ev)) drawLayers();
  }

  /** The board came into view with play under way (a level begun, a card or the touch tour closed): the tip that
   *  calls for, once the touch tour has had its moment to open first. A turn already under way (a move closed the
   *  start card or the tour) tells its own tip when it lands, so nothing shows over it in passing. */
  function tipsWhenClear(): void {
    if (!tips) return;
    timers.setTimeout(() => {
      const g = controls?.game ?? game;
      if (!g || g.anim || demo || !cardsOn(g) || tour || tourWaits || layers.any()) return;
      const ev = tipEvent(g, false);
      if (ev && tips.on(ev)) drawLayers();
    }, 0);
  }

  /** Show View Tips (the menu, the ? key): the touch tour on a touch screen, else the modern board's tips. */
  function viewTips(): void {
    if (touchScreen() && (controls?.game ?? game)?.run) openTour();
    else controls?.showViewTips?.();
  }

  /** Reset Tips: every first card, the touch tour and the modern board's view tips show again; the Dictionary keeps
   *  every entry met. The view tips come back from the next visit on. */
  function resetTips(): void {
    met?.resetCards();
    // Play is under way: once the menu closes, the touch tour shows as it did the first time.
    tourWaits = true;
    try {
      localStorage.removeItem(HINT_KEY);
    } catch {
      // No storage: the view tips keep their record for this visit.
    }
    say("Tips reset: first-time tips and cards will show again.", "info");
  }

  function showHeartsWhenClear(): void {
    if (!heartsQueued || layers.any() || !(controls?.game ?? game)?.run) return;
    heartsQueued = false;
    heartsLast = nextLine(deps.rng ?? Math.random, heartsLast);
    showBanner([], HEARTS_LINES[heartsLast]!);
  }

  /** The Dictionary, on Backpack while a level is open and on Entries otherwise. */
  function showDictionary(): void {
    dictTab = (controls?.game ?? game)?.run ? "backpack" : "entries";
    layers.open("dictionary");
  }

  /** Whether the frame is a phone's, as the phone layouts in game.css read it: portrait at most 760 px wide, or
   *  landscape at most 500 px tall. */
  function phone(): boolean {
    const f = $("frame");
    const w = f.clientWidth;
    const h = f.clientHeight;
    return (h >= w && w <= 760) || (w > h && h <= 500);
  }

  /** The strip again when the screen turns between a phone's and a wider one. */
  function restrip(): void {
    if (game?.run && phone() !== compact) drawStrip(game);
  }

  /** Shuts the Thread panel; `refocus` hands the focus back to Thread (Q does; a tap elsewhere keeps its own). */
  function shutThread(refocus: boolean): void {
    threadOpen = false;
    if (game?.run) drawStrip(game);
    if (refocus) document.getElementById("btn-thread")?.focus();
  }

  /** The strip, for a game with a level open. */
  function drawStrip(g: Game): void {
    const act = (fn: () => void) => (): void => {
      controls?.wake();
      fn();
    };
    /** A press that plays: held while a rule tip stands. */
    const play = (fn: () => void) => act(() => {
      if (!tipHolds()) fn();
    });
    compact = phone();
    if (!compact) threadOpen = false;
    renderStrip($("strip-root"), {
      tools: toolRows(g),
      pics: pics(),
      playing: g.playing,
      route: g.thread !== null,
      over: g.run!.now.outcome !== "playing",
      compact,
      threadOpen,
      onThread: (open) => {
        threadOpen = open;
        drawStrip(g);
      },
      onMenu: () => layers.open("menu"),
      look,
      thumb: deps.thumb,
      // A pointer on the pad moves by itself (bindPad), which keeps its click from reaching here; Enter or Space on a
      // focused arrow clicks it.
      onMove: (dir) => {
        play(() => {
          layers.close("start");
          g.press({ kind: "move", dir: moveDir(dir) });
        })();
      },
      onWait: play(() => g.press({ kind: "wait" })),
      onUndo: play(() => g.press("undo")),
      onRestart: play(() => g.press("restart")),
      onHint: play(() => { track("hint"); g.hint(); }),
      onRoute: play(() => { track("route"); g.route(); }),
      onAuto: play(() => { track("auto"); g.auto(); }),
      onTool: (tool) => play(() => g.press({ kind: "tool", tool }))(),
      onLook: (l) => act(() => controls?.setLook?.(l))(),
    });
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
      const at = g.anim.paused?.kind === "page" ? g.anim.paused.id : undefined;
      if (at === undefined || !fresh.includes(at)) return;
      announced.push(at);
      pending.push(at);
    } else {
      announced = taken;
      pending.push(...fresh);
    }
    if (!loreFromPickup && meetShown === null) showNextPickup();
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
    showNextMeet();
  }

  function showTitle(hint: boolean, note = ""): void {
    titleHint = hint;
    titleNote = note;
    layers.clear();
    layers.open("title");
  }

  /** True when the top card was opened from the title card: Endless opened from it or from a link (not the card
   *  Next Level opens to wait for a level), or any card but the editor with the title card under it. */
  function fromTitle(): boolean {
    const top = layers.top();
    return (top === "endless" && !endlessFromPlay) || (top !== null && top !== "endless" && top !== "title" && top !== "editor" && layers.has("title"));
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

  /** The move pad under a finger, pen or mouse (src/pad.ts): a press arms the arrow it lands on, a lift there is one
   *  move, a hold walks on, and a slide into another arrow moves that way and walks on while held there. Holding
   *  stops when the finger lifts (wherever it lifts: the lift is heard on the document), when a card covers the board,
   *  when the try ends or Theseus is caught, when a move goes nowhere (a wall, a snare), and when another level opens.
   *  The click a press makes is never a move: the press has moved already. */
  function bindPad(): void {
    const root = $("strip-root");
    let held: { id: number; pad: HTMLElement; press: PadPress; hearts: number; opens: number } | null = null;
    let ticker = 0;
    const blocked = (): boolean => layers.stack().some((n) => n !== "start");
    const stop = (): void => {
      held = null;
      clearInterval(ticker);
      ticker = 0;
    };
    /** One move the way the screen shows `dir`; false when it could not be made. */
    const step = (dir: MoveAction): boolean => {
      const g = controls?.game;
      const run = g?.run;
      if (!g || !run || run.now.outcome !== "playing" || blocked() || tipHolds()) return false;
      controls?.wake();
      layers.close("start");
      const moves = run.now.moves;
      g.press({ kind: "move", dir: moveDir(dir) });
      return (g.run?.now.moves ?? moves) !== moves;
    };
    const make = (press: PadPress, dir: MoveAction | null): void => {
      if (dir) press.stalled = !step(dir);
    };
    const tick = (): void => {
      const g = controls?.game;
      const h = held;
      if (!h || !g?.run) return stop();
      const now = g.run.now;
      if (g.opens !== h.opens || now.outcome !== "playing" || now.hearts < h.hearts || blocked()) return stop();
      make(h.press, h.press.tick(performance.now(), g.anim !== null));
    };
    const dirAt = (pad: HTMLElement, e: PointerEvent): MoveAction | null => {
      const hub = pad.querySelector(".pad-hub")?.getBoundingClientRect() ?? pad.getBoundingClientRect();
      return padDir(e.clientX - (hub.left + hub.width / 2), e.clientY - (hub.top + hub.height / 2), hub.width / 2);
    };
    /** The press ends: lifted (`tap`), a tap on the arrow it came down on moves once; cancelled, nothing moves. */
    const end = (tap: boolean): void => {
      const h = held;
      if (!h) return;
      stop();
      const dir = h.press.up();
      if (tap && dir) step(dir);
    };
    root.addEventListener("pointerdown", (ev) => {
      const e = ev as PointerEvent;
      const pad = (e.target as Element | null)?.closest?.(".pad") as HTMLElement | null;
      if (!pad || (e.pointerType === "mouse" && e.button !== 0)) return;
      // No focus ring, text selection or page scroll from a press on the pad.
      e.preventDefault();
      // A second finger down before the first has lifted: the first one's tap still counts, once.
      end(true);
      try {
        pad.setPointerCapture(e.pointerId);
      } catch {
        // A synthetic pointer cannot be captured; it still reaches the pad.
      }
      const run = controls?.game?.run;
      held = { id: e.pointerId, pad, press: new PadPress(dirAt(pad, e), performance.now()), hearts: run?.now.hearts ?? 0, opens: controls?.game?.opens ?? 0 };
      ticker = window.setInterval(tick, 30);
    });
    root.addEventListener("pointermove", (ev) => {
      const e = ev as PointerEvent;
      const h = held;
      if (!h || e.pointerId !== h.id) return;
      e.preventDefault();
      make(h.press, h.press.over(dirAt(h.pad, e), performance.now()));
    });
    // Heard on the document, so a finger that lifts off the pad, or whose capture is lost, still ends the press.
    document.addEventListener("pointerup", (ev) => {
      if (held && (ev as PointerEvent).pointerId === held.id) end(true);
    }, true);
    for (const t of ["pointercancel", "lostpointercapture"]) {
      document.addEventListener(t, (ev) => {
        if (held && (ev as PointerEvent).pointerId === held.id) end(false);
      }, true);
    }
    // A pointer's click on an arrow, which can come long after the lift, is never a move: the press made its own.
    // Enter or Space on a focused arrow clicks it with no pointer (detail 0), and that still moves.
    root.addEventListener("click", (e) => {
      if ((e as MouseEvent).detail > 0 && (e.target as Element | null)?.closest?.(".pad")) e.stopPropagation();
    }, true);
    root.addEventListener("contextmenu", (e) => {
      if ((e.target as Element | null)?.closest?.(".pad")) e.preventDefault();
    });
  }

  /** The classic board's own pointer controls and compass, as the modern board's camera has them: one finger turns
   *  and tilts, as the left button does; two fingers twist to turn, pinch to zoom and drag to pan; the right or middle
   *  button pans; the wheel zooms toward the pointer; a double tap or double click goes back to the opening view. The
   *  compass stands at the board's bottom-right, with no camera buttons. Every control is ignored while a card other
   *  than the start card is open. */
  function bindClassicView(): void {
    const view = $("stage-view");
    $("stage").style.touchAction = "none";
    view.style.touchAction = "none";
    const gestures = createGestures(() => performance.now());
    const blocked = (): boolean => modernBoard || layers.stack().some((n) => n !== "start");
    const zoomBy = (k: number, at?: { x: number; y: number }): void => {
      zoom = clampZoom(zoom * k, wholePx);
      resize(at);
    };
    /** Back to the opening view: 75°, north up, the whole level. */
    const reset = (): void => {
      sheetView.home(true);
      if (zoom !== 1) {
        zoom = 1;
        resize();
      }
      ease();
    };
    const turn = (deg: number, eased: boolean): void => {
      sheetView.turn(deg, eased);
      if (eased) ease();
      else reframe();
    };
    const tilt = (deg: number, eased: boolean): void => {
      sheetView.tilt(deg, eased);
      if (eased) ease();
      else reframe();
    };
    const apply = (ops: CamOp[]): void => {
      if (!ops.length || blocked()) return;
      for (const op of ops) {
        if (op.kind === "zoom") zoomBy(1 / op.factor, { x: op.x, y: op.y });
        else if (op.kind === "pan") {
          const run = game?.run;
          if (zoom === 1 || !frame || !run) continue;
          frame = panned(frame, op.dx, op.dy, run.now.level.cols, run.now.level.rows, cellCss);
          board.frame(frame);
        } else if (op.kind === "turn") turn(op.deg, false);
        else if (op.kind === "tilt") tilt(op.deg, false);
        else if (op.kind === "reset") reset();
      }
    };
    const ptr = (e: PointerEvent): Ptr => ({
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      type: e.pointerType === "touch" || e.pointerType === "pen" ? e.pointerType : "mouse",
      button: e.button,
    });
    view.addEventListener("pointerdown", (e) => {
      const p = e as PointerEvent;
      if (blocked()) return;
      try {
        view.setPointerCapture(p.pointerId);
      } catch {
        // A synthetic pointer cannot be captured; its moves still reach the board.
      }
      apply(gestures.down(ptr(p)));
    });
    view.addEventListener("pointermove", (e) => apply(gestures.move(ptr(e as PointerEvent))));
    view.addEventListener("pointerup", (e) => apply(gestures.up(ptr(e as PointerEvent))));
    view.addEventListener("pointercancel", (e) => gestures.cancel((e as PointerEvent).pointerId));
    // A finger that lost its capture, or left the board without one, is gone: it never pairs with the next touch.
    view.addEventListener("lostpointercapture", (e) => gestures.cancel((e as PointerEvent).pointerId));
    view.addEventListener("pointerleave", (e) => {
      const p = e as PointerEvent;
      if (p.pointerType !== "mouse" && !view.hasPointerCapture?.(p.pointerId)) gestures.cancel(p.pointerId);
    });
    view.addEventListener("dblclick", () => {
      if (!blocked()) reset();
    });
    view.addEventListener("contextmenu", (e) => e.preventDefault());
    view.addEventListener("wheel", (e) => {
      const w = e as WheelEvent;
      if (blocked()) return;
      w.preventDefault();
      const px = w.deltaMode === 1 ? WHEEL_LINE_PX : w.deltaMode === 2 ? view.clientHeight : 1;
      apply(gestures.wheel(w.deltaY * px, w.clientX, w.clientY));
    }, { passive: false });

    const cam = $("classic-cam");
    compass = createCompassButton("classic-compass", { blocked, gesture: () => layers.close("start") },
      { turn, tilt, reset, zoomStep: (d) => zoomBy(d > 0 ? ZOOM_STEP : 1 / ZOOM_STEP) });
    compass.setView(sheetView.cur.yaw, sheetView.cur.pitch);
    cam.append(compass.button);
  }

  /* ---------- input: moves, tools and guides never share a key ---------- */
  function bindControls(c: Controls): void {
    controls = c;
    game = c.game;
    document.addEventListener("keydown", (ev) => {
      // Escape is no letter: in the Endless card's seed box it still backs out to the title card.
      const escape = ev.key === "Escape" && !ev.ctrlKey && !ev.metaKey && !ev.altKey && !ev.isComposing;
      if (typesText(ev.target)) {
        if (escape && layers.isOpen("endless") && fromTitle()) {
          ev.preventDefault();
          if (!ev.repeat) leaveEndless();
        }
        return;
      }
      c.wake();
      // F toggles full screen wherever it is pressed: in play, on any card and in the editor (Demo's own key watch in
      // src/main.ts lets it through). A chord is the browser's; a held F toggles once.
      if (actionFor(ev.key) === "fullscreen" && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
        ev.preventDefault();
        if (!ev.repeat) c.toggleFullscreen();
        return;
      }
      // The editor takes every key while it is the top layer; a Q it does not use (no dialog of its own is open)
      // leaves it for the title card.
      if (layers.isOpen("editor") && c.editor) {
        if (!c.editor.key(ev) && isBackKey(ev)) {
          ev.preventDefault();
          if (!ev.repeat) leaveEditor();
        }
        return;
      }
      // Escape is bound only where it cannot cost a run: it puts away the rule tip standing, and it backs out of a card
      // opened from the title card (the new-game card, the chapter card a new game opens, Endless, the story, the menu
      // as Settings) as Q does. Where the browser grants the full-screen toggle the Escape lock (Keyboard Lock), Escape
      // never leaves full screen; where it does not (Safari, Firefox), the browser spends Escape on leaving full
      // screen, so Q stays the sure back key.
      if (escape && tipShowing()) {
        ev.preventDefault();
        if (!ev.repeat) closeTip();
        return;
      }
      if (isBackKey(ev) || (escape && fromTitle())) {
        ev.preventDefault();
        if (ev.repeat) return;
        // An open Thread panel shuts first, unless a card other than the start card is over it.
        const over = layers.top();
        if (threadOpen && (over === null || over === "start")) {
          shutThread(true);
          return;
        }
        // An open Lore entry goes back to the list; the next Q closes the book.
        if (layers.isOpen("lore") && loreShown && !loreFromPickup) {
          loreShown = null;
          drawLayers();
        } else if (layers.isOpen("lore") && loreFromPickup) {
          closePickup();
        } else if (layers.isOpen("meet")) closeMeet();
        else if (layers.isOpen("help")) answerAsk(false);
        else if (layers.isOpen("title")) layers.open("menu");
        else if (layers.isOpen("endless")) leaveEndless();
        else if (layers.isOpen("shared")) {
          if (sharedFromMenu) {
            layers.clear();
            layers.open("menu");
          } else showTitle(titleHint);
        }
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
      // Enter or Space puts away the rule tip standing, as Got It does, and nothing more: not a focused button.
      if (action === "begin" && tipShowing()) {
        ev.preventDefault();
        closeTip();
        return;
      }
      // The title's New Game is worded N: there it opens the new-game card, elsewhere N opens the list (not over the
      // new-game card, which has no list to show, nor over the Help Build card, which waits for its answer).
      if (action === "new") {
        ev.preventDefault();
        if (layers.isOpen("title")) newGame();
        else if (!layers.isOpen("look") && !layers.isOpen("help")) layers.open("levels");
        return;
      }
      if (action === "mute") {
        c.toggleMute();
        return;
      }
      // Each card's own keys act only while it is the top card: I, E and D on the title, L and G on the menu.
      if (action === "story" && layers.isOpen("title")) {
        ev.preventDefault();
        if (!ev.repeat) layers.open("story");
        return;
      }
      // D is "right" everywhere else; on the title card, whose focus moves only up and down, it starts Demo.
      if (isDemoKey(k) && layers.top() === "title" && c.demo) {
        ev.preventDefault();
        if (!ev.repeat) startDemo();
        return;
      }
      if (action === "endless" && layers.isOpen("title") && c.endless) {
        ev.preventDefault();
        if (!ev.repeat) askFirst(() => showEndless());
        return;
      }
      if (action === "editor" && layers.isOpen("title") && c.editor) {
        ev.preventDefault();
        if (!ev.repeat) showEditor();
        return;
      }
      if (action === "dictionary" && layers.isOpen("menu")) {
        ev.preventDefault();
        if (!ev.repeat) showDictionary();
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
      // The Dictionary: up and down scroll its list, left and right switch its tabs.
      if (top === "dictionary" && stepKey !== 0) {
        ev.preventDefault();
        const panel = document.getElementById("dict-veil")?.querySelector(".card") as HTMLElement | null | undefined;
        panel?.scrollBy?.({ top: stepKey * 64 });
        return;
      }
      if (top === "dictionary" && (action === "left" || action === "right")) {
        ev.preventDefault();
        const to = DICTIONARY_TABS[action === "left" ? 0 : 1]!;
        if (to !== dictTab) {
          dictTab = to;
          drawLayers();
          document.getElementById(`dict-tab-${to}`)?.focus();
        }
        return;
      }
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
      // The new-game card: left and right (or A and D) pick a look; Enter goes in while the focus is on nothing or on
      // Enter the halls, and otherwise presses the focused picture or Back.
      if (layers.isOpen("look") && (action === "left" || action === "right")) {
        ev.preventDefault();
        const to: Look = action === "left" ? "modern" : "classic";
        pickLook(to);
        document.getElementById(`pick-${to}`)?.focus();
        return;
      }
      // Enter on the title card is Continue, when it is offered, unless another of its buttons has the focus.
      if (top === "title" && action === "begin" && resume() !== null && onDefault(focused?.id, "title-", "title-continue")) {
        ev.preventDefault();
        goResume();
        return;
      }
      if (layers.isOpen("look") && action === "begin" && onDefault(focused?.id, "pick-", "pick-enter")) {
        ev.preventDefault();
        enterHalls();
        return;
      }
      // Begin on the chapter card: the opening one starts a level, the closing one goes on. Tabbed to Levels,
      // Enter presses that button instead.
      if (layers.isOpen("chapter") && action === "begin" && onDefault(focused?.id, "chapter-", "chapter-enter", "chapter-continue")) {
        ev.preventDefault();
        if (chapterClosing) goOn();
        else enter();
        return;
      }
      // A won ending card: Begin goes on to the next level (unless another of its buttons has the focus), R plays
      // this one again.
      if (layers.isOpen("end") && end.won) {
        if (action === "begin" && end.hasNext && onDefault(focused?.id, "end-", "end-next")) {
          ev.preventDefault();
          nextLevel();
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
      // A first card closes on Enter or Space, as a page opened on taking it does.
      if (layers.isOpen("meet") && action === "begin" && onDefault(focused?.id, "meet-", "meet-go", "meet-close")) {
        ev.preventDefault();
        closeMeet();
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
      // A rule tip holds play until it is put away: the keys that play wait, and the tip is nudged.
      const plays = isMove(action) || action === "wait" || action === "undo" || action === "restart" || action === "hint"
        || action === "route" || action === "auto" || (!action && itemFor(k, TOOLS) !== null);
      if (plays && tipHolds()) {
        ev.preventDefault();
        return;
      }
      if (isMove(action)) {
        ev.preventDefault();
        g.press({ kind: "move", dir: moveDir(action) });
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
      } else if (action === "tips") {
        ev.preventDefault();
        viewTips();
      } else if (action === "look") {
        ev.preventDefault();
        if (!ev.repeat) c.setLook?.(look === "modern" ? "classic" : "modern");
      } else {
        const tool = itemFor(k, TOOLS);
        if (tool) {
          ev.preventDefault();
          g.press({ kind: "tool", tool });
        }
      }
    });

    document.addEventListener("pointerdown", c.wake);
    bindClassicView();
    bindPad();
    // A tap on the toast puts it away.
    $("toast").addEventListener("click", () => $("toast").classList.remove("show"));

    // A tap anywhere but on the Thread panel or its button shuts the panel.
    document.addEventListener("pointerdown", (e) => {
      if (!threadOpen) return;
      const fold = document.getElementById("btn-thread")?.parentNode;
      for (let n = e.target as Node | null; n; n = n.parentNode) if (n === fold) return;
      shutThread(false);
    });

    const resized = (): void => {
      fit();
      restrip();
    };
    if (typeof ResizeObserver === "function") new ResizeObserver(resized).observe($("board"));
    if (typeof window !== "undefined") window.addEventListener("resize", resized);
  }

  drawLayers();
  return {
    say,
    render,
    bindControls,
    showTitle,
    showLevels: () => layers.open("levels"),
    showChapter: (n, closing, target) => showChapter(n, closing, target),
    closeLayers: () => layers.clear(),
    top: () => layers.top(),
    showEditor,
    showShared: () => showShared(),
    showEndless,
    refuseLink: (message) => {
      say(message, "bad");
      showTitle(titleHint, message);
    },
    refresh: () => drawLayers(),
    leaveEditor,
    leaveShared,
    setDemo,
    setMuted: (m) => {
      muted = m;
      drawLayers();
    },
    setMusic: (on) => {
      music = on;
      drawLayers();
    },
    setBackground: (on) => {
      background = on;
      drawLayers();
    },
    setFullscreen: (on) => {
      full = on;
      drawLayers();
    },
    setLook: (l, w) => {
      look = l;
      walls = w;
      if (game?.run) drawStrip(game);
      drawLayers();
    },
    setPad: (side) => {
      pad = side;
      const frame = $("frame");
      const rest = frame.className.split(" ").filter((c) => c && c !== "pad-right");
      frame.className = (side === "right" ? [...rest, "pad-right"] : rest).join(" ");
      drawLayers();
    },
    setMinimap: (on) => {
      minimap = on;
      drawLayers();
    },
    setHelpBuild: (state) => {
      helpBuild = state;
      drawLayers();
    },
    setModernBoard: (on) => {
      modernBoard = on;
      sized = "";
      fit();
    },
    setMoveDir: (fn) => {
      moveDir = fn;
    },
    classicView: () => ({ ...sheetView.cur }),
    classicFrame: () => frame,
    setClassicView: (yaw, pitch) => {
      sheetView.set(yaw, pitch);
      compass?.setView(sheetView.cur.yaw, sheetView.cur.pitch);
      sized = "";
      fit();
    },
    cardsOpen: () => layers.stack().some((n) => n !== "start"),
    layersOpen: () => layers.stack().length > 0,
    isFirst,
    closeStart: () => layers.close("start"),
  };
}
