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
import { KEYS, actionFor, isMove, itemFor } from "./keys.ts";
import type { MoveAction } from "./keys.ts";
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
import type { Look, PadSide, WallMode } from "./settings.ts";
import { renderTitleCard } from "./ui/title.tsx";
import { renderLookPick } from "./ui/look-pick.tsx";
import { ratingText, renderSharedCard } from "./ui/shared.tsx";
import type { SharedView } from "./share/visit.ts";
import type { RatingState } from "./share/rating.ts";
import { renderLevels } from "./ui/levels.tsx";
import type { LevelRow } from "./ui/levels.tsx";

/** What the page borrows at run time. */
export interface UiDeps {
  atlas: Atlas;
  board: SheetBoard;
  progress: Progress;
  /** The story pages found in this browser, for the Lore Book. */
  pages: FoundPages;
  /** The levels the game plays, for telling one from outside the campaign; without it every level is the campaign's. */
  levels?: Pick<Levels, "outside">;
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
  /** The editor's visit ended: the editor was left for the title card, or a campaign level was opened (from a try,
   *  or from anywhere). */
  leftEditor?(): void;
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
  /** A finger swiped the board (either look): Theseus moves that way as the screen shows it, unless a card is up. */
  swipe(dir: MoveAction): void;
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
  /** A share link could not be opened: the toast and the title card say why. */
  refuseLink(message: string): void;
  /** Draws the cards again (the shared card's rating came in). */
  refresh(): void;
  /** Leaves the editor for the title card. */
  leaveEditor(): void;
  /** Leaves the shared card for the title card, keeping the installed-app close hint as it was. */
  leaveShared(): void;
}

const TOOL_EMOJI: Record<Tool, string> = { mirror: "🪞", cake: "🍯", cow: "🐄" };
const TOOL_KINDS = Object.keys(TOOLS) as Tool[];

const LOG_LIMIT = 80;
const TOAST_MS = 3000;
/** A wheel line, in pixels. */
const WHEEL_LINE_PX = 16;
/** How long the classic view rests before the sheet is drawn again at the cell that fits it. */
const SETTLE_MS = 200;
/** Whether the player asked for less motion: the view jumps rather than eases. */
const reducedMotion = (): boolean => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
/** The classic board's camera buttons, drawn as the modern board's are. */
const TURN_LEFT_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4h4"/></svg>';
const TURN_RIGHT_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.5-5.8"/><path d="M20 4v4h-4"/></svg>';
const ZOOM_IN_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';
const ZOOM_OUT_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>';

const $ = (id: string): HTMLElement => document.getElementById(id)!;

export function createUi(deps: UiDeps): Ui {
  const { atlas, board, progress, pages, sfx, met } = deps;
  const timers = deps.timers ?? { setTimeout: (fn: () => void, ms: number) => globalThis.setTimeout(fn, ms) as unknown as number, clearTimeout: (id: number) => globalThis.clearTimeout(id) };

  /** The level in play when it is from outside the campaign, else null. */
  const outsideOf = (g: Game | null): OutsideLevel | null => (g && g.trial >= 0 ? deps.levels?.outside?.(g.trial) ?? null : null);
  /** An outside level's kicker on its start and end cards. */
  const outsideKicker = (o: OutsideLevel): string => (o.kind === "try" ? "Your level" : "Shared level");
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
  /** What the Dictionary's pictures are drawn from: the look the board shows now. */
  const pics = (): Pics => (deps.icons ? { look, atlas, icons: deps.icons } : { look, atlas });
  /** The Dictionary's tab. */
  let dictTab: DictionaryTab = "backpack";
  /** The modern board shows instead of the classic canvas. */
  let modernBoard = false;
  /** A move on the screen as a move on the grid. */
  let moveDir = (dir: MoveAction): MoveAction => dir;

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
      const target = fewest === undefined ? "" : p.cleared && !p.assisted ? ` · ${againstFewest(p.best!, fewest)}` : ` · best possible ${fewest}`;
      return {
        title: CAMPAIGN_LEVELS.level(first + i).title,
        status: (!p.cleared ? "not yet" : p.assisted ? "cleared with help" : `cleared · your best ${p.best}`) + target,
      };
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
    pick((controls?.game ?? game)!.trial + 1, true);
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
      onPlay: () => layers.open("look"),
      ...(resume() !== null ? { resume: continueWords(resume()!), onContinue: goResume } : {}),
      onStory: () => layers.open("story"),
      ...(controls?.editor ? { onEditor: showEditor } : {}),
      onSettings: () => layers.open("menu"),
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
      onEnter: enter,
      onLevels: () => layers.open("levels"),
      onClose: () => (chapterClosing ? goOn() : leave("chapter")),
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
    renderBanner($("banner-root"), { entries: bannerEntries, line: bannerLine, seq: bannerSeq, pics: pics() });
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
      onViewTips: () => {
        layers.close("menu");
        controls?.showViewTips?.();
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

  /** Eases the view toward where a button, a key or the compass sent it, a display frame at a time. */
  function ease(): void {
    if (easing) return;
    let last = performance.now();
    const tick = (now: number): void => {
      const moving = sheetView.step((now - last) / 1000, reducedMotion());
      last = now;
      reframe();
      easing = moving ? requestAnimationFrame(tick) : 0;
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
    const id = LEVEL_IDS[g.trial]!;
    const best = progress.get(id).best;
    const fewest = FEWEST[id];
    // Every page this win took, not only the new ones: a replayed win still shows its page line.
    const titles = CHAPTERS.flatMap((c) => c.lore?.pages ?? []);
    const pages = pagesTaken(s).map((id) => titles.find((p) => p.id === id)?.title ?? id);
    return {
      open: true, won, hasNext: g.trial + 1 < LEVEL_IDS.length, hasLevels: true, pages, kicker: `Level ${chapterOf(g.trial).within + 1} cleared`, title: s.level.title,
      text: how,
      score: [`${s.moves} moves`, fewest !== undefined ? againstFewest(s.moves, fewest) : "", best !== null && best !== s.moves ? `your best ${best}` : "", help]
        .filter(Boolean).join(" · "),
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
      announced = [];
      pending = [];
      const name = out ? out.name : s.level.title;
      log.push({ text: s.level.intro ? `${name}: ${s.level.intro}` : name, tone: "info" });
      if (!out) listed = chapterOf(g.trial).chapter.n;
      layers.open("start");
    }

    const at = out ? null : chapterOf(g.trial);
    const place = at ? placeWords(at.chapter.n, at.within + 1, s.level.title) : null;
    renderStatus($("status-root"), {
      view: statusView({
        trial: place?.short ?? "",
        trialNote: place?.full ?? "",
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

    drawStrip(g);

    // The ending card waits for the last step to land; a try taken back or begun again lets the next ending show.
    if (s.outcome === "playing") {
      endFor = null;
      layers.close("end");
    } else if (!g.anim && endFor !== run) {
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
    notice(g);
    announcePages(g);
    drawLayers();
  }

  /** First cards show, and banners, where the player is not trying out a level from the editor. */
  const cardsOn = (g: Game | null): boolean => !!met && outsideOf(g)?.kind !== "try";

  function isFirst(id: string): boolean {
    return !!met && firstMeeting(id, met, cardsOn(controls?.game ?? game));
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
    compact = phone();
    if (!compact) threadOpen = false;
    renderStrip($("strip-root"), {
      tools: toolRows(g),
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
      onMove: (dir) => act(() => {
        layers.close("start");
        g.press({ kind: "move", dir: moveDir(dir) });
      })(),
      onWait: act(() => g.press({ kind: "wait" })),
      onUndo: act(() => g.press("undo")),
      onRestart: act(() => g.press("restart")),
      onHint: act(() => { track("hint"); g.hint(); }),
      onRoute: act(() => { track("route"); g.route(); }),
      onAuto: act(() => { track("auto"); g.auto(); }),
      onTool: (tool) => act(() => g.press({ kind: "tool", tool }))(),
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

  /** The enabled buttons of card `name`, in order. */
  function cardButtons(name: LayerName): HTMLElement[] {
    const veil = document.getElementById(`${name}-root`);
    return veil ? (Array.from(veil.querySelectorAll("button")) as HTMLElement[]).filter((b) => !(b as HTMLButtonElement).disabled) : [];
  }

  /** True when the focus is on nothing of the card (its id has no `prefix`) or on one of its default buttons. */
  function onDefault(id: string | undefined, prefix: string, ...defaults: string[]): boolean {
    return id === undefined || !id.startsWith(prefix) || defaults.includes(id);
  }

  /** A swipe on either board: a move as the screen shows it, closing the start card as a move key does. */
  function swipe(dir: MoveAction): void {
    const g = controls?.game;
    if (!g || layers.stack().some((n) => n !== "start")) return;
    controls?.wake();
    layers.close("start");
    g.press({ kind: "move", dir: moveDir(dir) });
  }

  /** The classic board's own pointer controls and camera buttons, as the modern board's camera has them: one finger
   *  swipes Theseus a cell; two fingers twist to turn, slide up and down together to tilt, pinch to zoom and drag to
   *  pan; the left button drags to turn and tilt, the right or middle button to pan; the wheel zooms toward the
   *  pointer; a double tap or double click goes back to the opening view. The turn, zoom and Reset buttons stand at
   *  the board's top-right, behind a View button on a narrow touch screen, and the compass at its bottom-right. Every
   *  control is ignored while a card other than the start card is open. */
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
        if (op.kind === "swipe") swipe(op.dir);
        else if (op.kind === "zoom") zoomBy(1 / op.factor, { x: op.x, y: op.y });
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
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "modern-viewbtn";
    toggle.textContent = "View";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "classic-cam-buttons");
    const group = document.createElement("div");
    group.id = "classic-cam-buttons";
    group.className = "cam";
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", "Camera");
    const button = (id: string, label: string, html: string, className: string, fn: () => void): HTMLButtonElement => {
      const b = document.createElement("button");
      b.type = "button";
      b.id = id;
      b.className = className;
      b.setAttribute("aria-label", label);
      b.title = label;
      b.innerHTML = html;
      b.addEventListener("click", () => {
        if (!blocked()) fn();
      });
      return b;
    };
    group.append(
      button("classic-left", "Turn left", TURN_LEFT_ICON, "cbtn", () => turn(-90, true)),
      button("classic-right", "Turn right", TURN_RIGHT_ICON, "cbtn", () => turn(90, true)),
      button("classic-zoom-in", "Zoom in", ZOOM_IN_ICON, "cbtn", () => zoomBy(ZOOM_STEP)),
      button("classic-zoom-out", "Zoom out", ZOOM_OUT_ICON, "cbtn", () => zoomBy(1 / ZOOM_STEP)),
      button("classic-reset", "Reset view", "Reset", "cbtn wide", reset),
    );
    toggle.addEventListener("click", () => {
      const open = !group.className.split(" ").includes("open");
      group.className = open ? "cam open" : "cam";
      toggle.setAttribute("aria-expanded", String(open));
    });
    compass = createCompassButton("classic-compass", { blocked, gesture: () => layers.close("start") }, { turn, tilt, reset });
    compass.setView(sheetView.cur.yaw, sheetView.cur.pitch);
    cam.append(toggle, group, compass.button);
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
        else if (layers.isOpen("title")) layers.open("menu");
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
      // The title's New Game is worded N: there it opens the new-game card, elsewhere N opens the list (not over the
      // new-game card, which has no list to show).
      if (action === "new") {
        ev.preventDefault();
        if (layers.isOpen("title")) layers.open("look");
        else if (!layers.isOpen("look")) layers.open("levels");
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
        c.showViewTips?.();
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
    refuseLink: (message) => {
      say(message, "bad");
      showTitle(titleHint, message);
    },
    refresh: () => drawLayers(),
    leaveEditor,
    leaveShared,
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
    swipe,
  };
}
