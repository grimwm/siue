/* The Island of Crete: the level editor, a layer over the game frame (#editor-root, which holds its own board
 * canvas #editor-stage). It draws the draft as the game would at its start, paints it with the mouse or one
 * finger (a drag paints every cell it crosses and is one undo step; two fingers move the view), and answers the
 * editor's keys while src/ui.ts hands them over. The draft and its undo history live for the page's life: leaving the
 * editor by Try it or Q keeps them. It shows the draft in either look: Classic, the game's tilted sheet with its
 * compass camera (classic-view.ts), or Modern, the game's 3D board (modern-view.ts, loaded only once Modern is
 * chosen); the bar's Classic and Modern buttons, or B, switch between them and set the game's own look setting, and
 * the heading and tilt go across with the switch, as in the game. It keeps the author's best
 * for each level it tried: the fewest moves of a try won without Ariadne's thread, by the level's share text, so
 * an edit leaves a level with no best until it is won again. Needs the DOM lib. */
import { validInitials } from '../../../_kit/initials.ts';
import { isBackKey, typesText } from '../../../_kit/keys.ts';
import { oneOf, pref, text as textCodec } from '../../../_kit/prefs.ts';
import { browserStorage } from '../../../_kit/ports.browser.ts';
import { drawList } from '../board-plan.ts';
import type { Atlas, Figures } from '../board-plan.ts';
import { initial } from '../puzzle/state.ts';
import type { State } from '../puzzle/state.ts';
import type { Level } from '../puzzle/level.ts';
import type { Difficulty } from '../puzzle/difficulty.ts';
import { parse } from '../puzzle/level.ts';
import { lineOf } from '../puzzle/cache.ts';
import type { Action } from '../puzzle/step.ts';
import { startSearch } from '../solver-client.ts';
import type { SolverJob } from '../solver-client.ts';
import { TERRAIN } from '../puzzle/tiles.ts';
import type { Cell, Terrain } from '../puzzle/tiles.ts';
import { renderEditorPanel } from './bar.tsx';
import { createChecker } from './check.ts';
import { INITIALS_MESSAGE, shareLink } from './share-panel.tsx';
import { editorActionFor } from './keys.ts';
import { commit, redoH, startHistory, undoH } from './history.ts';
import type { History } from './history.ts';
import { newDraft, paint, resize, toLevel, toText } from './model.ts';
import type { Brush, Draft } from './model.ts';
import { HIDDEN_MARK, dirOf, nextDir } from './palette.tsx';
import { createClassicView } from './classic-view.ts';
import type { ClassicView } from './classic-view.ts';
import { createModernView, drawModern } from './modern-view.ts';
import type { ModernView } from './modern-view.ts';
import type { ModernBoard } from '../modern/board3d.ts';
import type { IconSheet } from '../icons-models.ts';
import type { Heading } from '../modern/compass.ts';
import type { Look, WallMode } from '../settings.ts';

export interface Editor {
  /** Shows the editor on `draft` (one undo step on the history, so U brings back the draft before it), or on the
   *  draft in progress, or on a new 12 x 12 one. */
  open(draft?: Draft): void;
  close(): void;
  /** The draft as it stands, mid-stroke included. */
  readonly draft: Draft;
  /** Handles a key press while the editor is the top layer; false when the press is not the editor's. */
  key(ev: KeyboardEvent): boolean;
  /** A try of the share text `text` was won in `moves` without the thread. */
  tryWon(text: string, moves: number): void;
  /** The author's best for the share text `text`, or null before a try of it is won without the thread. */
  bestFor(text: string): number | null;
  /** The Modern board while the editor shows it, else null; for tests. */
  readonly modern: ModernBoard | null;
  /** The Classic view while the editor shows it, else null; for tests. */
  readonly classic: Pick<ClassicView, 'view' | 'setView' | 'zoom' | 'at'> | null;
}

export interface EditorDeps {
  root: HTMLElement;
  atlas: Atlas;
  image: HTMLImageElement;
  /** Plays the draft on the game screen; `text` is its share text (`toText(draft, true)`), and `line` the shortest
   *  winning line of the last Check when that was of this very text, else null. */
  tryIt(level: Level, text: string, line: Action[] | null): void;
  /** Starts the solver's `measure` search on a share text (Check); the page's worker by default. */
  start?: (text: string) => SolverJob;
  /** The draft changed. */
  changed(): void;
  /** The page's URL without its hash, which a share link is added to; the window's own by default. */
  pageUrl?: () => string;
  /** Leaves the editor for the title card (its Leave button), when the page gives it. */
  leave?: () => void;
  /** The game's look setting, which the editor opens in and its Classic and Modern buttons set; without it the
   *  editor shows Classic alone. */
  look?: { get(): Look; set(look: Look): void };
  /** The Modern look's needs: the modern bundle's loader, the Modern icons and the walls setting. */
  modern?: { load(): Promise<typeof import('../modern/entry.ts') | null>; icons: IconSheet; walls(): WallMode };
  /** Says a short message on the page's toast (the Modern look could not start). */
  say?: (message: string) => void;
}

/** The owner flag: the kit pref `crete-owner` set to `on` shows the campaign's own tools. */
export const OWNER_PREF = 'crete-owner';
/** The kit pref that remembers the author's initials. */
export const INITIALS_PREF = 'crete-initials';
const NEW_SIDE = 12;
const STOPPED_MESSAGE = 'The search stopped before it finished; press Share again to keep going.';
export const NO_MODERN_MESSAGE = 'The modern look needs WebGL, which this browser does not have; building in Classic.';

/** The figures where the level starts them. */
function restingFigures(s: State): Figures {
  return { player: s.player, minotaur: s.minotaur, hazards: s.hazards.map(h => ({ kind: h.kind, at: h.at })) };
}

/** The cells on the straight line from `a` to `b`, `b` included and `a` not, with no gaps (Bresenham). */
export function lineCells(a: Cell, b: Cell): Cell[] {
  const out: Cell[] = [];
  const dc = Math.abs(b.c - a.c), dr = -Math.abs(b.r - a.r);
  const sc = a.c < b.c ? 1 : -1, sr = a.r < b.r ? 1 : -1;
  let err = dc + dr;
  let { r, c } = a;
  while (r !== b.r || c !== b.c) {
    const e2 = 2 * err;
    if (e2 >= dr) { err += dr; c += sc; }
    if (e2 <= dc) { err += dc; r += sr; }
    out.push({ r, c });
  }
  return out;
}

const HIDDEN_BY_CHAR = new Map((Object.keys(HIDDEN_MARK) as Terrain[]).map(t => [TERRAIN[t].char, HIDDEN_MARK[t]!]));

/** The cells whose terrain the game draws as something else (a fake wall as wall, an invisible wall as floor), with
 *  the letter the editor's board marks them with. */
export function hiddenMarks(d: Draft): { r: number; c: number; mark: string }[] {
  const out: { r: number; c: number; mark: string }[] = [];
  d.cells.forEach((ch, i) => {
    const mark = HIDDEN_BY_CHAR.get(ch);
    if (mark) out.push({ r: Math.floor(i / d.cols), c: i % d.cols, mark });
  });
  return out;
}

/** Finds `#id` under `root`, or makes it as a child of `parent`. */
function part(root: HTMLElement, parent: HTMLElement, id: string, tag: string): HTMLElement {
  const found = root.querySelector<HTMLElement>(`#${id}`);
  if (found) return found;
  const el = document.createElement(tag);
  el.id = id;
  parent.appendChild(el);
  return el;
}

export function createEditor(deps: EditorDeps): Editor {
  const { root, atlas, image } = deps;
  const holder = part(root, root, 'editor-board', 'div');
  const canvas = part(root, holder, 'editor-stage', 'canvas') as HTMLCanvasElement;
  const panel = part(root, root, 'editor-panel', 'div');
  const owner = pref(OWNER_PREF, 'off', oneOf(['on', 'off'], 'off'), browserStorage());
  const savedInitials = pref(INITIALS_PREF, '', textCodec, browserStorage());

  let history: History<Draft> | null = null;
  /** The draft on show: the history's present, or a stroke's work before it is committed. */
  let live: Draft = newDraft(NEW_SIDE, NEW_SIDE);
  let brush: Brush = { kind: 'terrain', t: 'wall' };
  let isOwner = false;
  /** The initials as typed, and what the last Share made or said: a link for the share text `text`, or a message. */
  let initials = savedInitials.get();
  let sharing = false;
  let shared: { text: string; link: { url: string; name: string } | null; message: string } | null = null;
  /** The running Share's number; a Share that is no longer the latest drops its answer. */
  let shareGen = 0;
  /** The share text of the Share that is waiting on a Check; null when none is. */
  let sharingText: string | null = null;
  let drawer = false;
  let shown = false;
  /** The draft the Classic board last showed. */
  let classicFor: Draft | null = null;
  /** The stroke in progress: its pointer (-1 for the Modern board's) and the last cell it painted. */
  let stroke: { id: number; last: Cell } | null = null;
  /** The look the editor shows: Classic until the page's look setting says Modern and the 3D board has loaded. */
  let look: Look = 'classic';
  let modernView: ModernView | null = null;
  /** The draft the Modern board last showed. */
  let modernFor: Draft | null = null;
  /** The toast has said Modern cannot start here. */
  let noModernSaid = false;
  const modernOn = (): boolean => look === 'modern' && !!modernView?.board;
  /** The brush on either look's board: a drag that starts off the board starts its stroke where it first reaches a
   *  cell. */
  const painter = {
    stroke: (at: Cell, first: boolean) => (first || !stroke ? beginStroke(-1, at) : strokeTo(-1, at)),
    end: () => { if (stroke?.id === -1) endStroke(); },
    drop: () => dropStroke(),
  };
  const classic: ClassicView = createClassicView({ holder, canvas, atlas, image, hidden: () => !shown || modernOn(), painter });
  /** The author's best by share text. */
  const bests = new Map<string, number>();
  const checker = createChecker(deps.start ?? (text => startSearch(text, 'rate')), () => { endStoppedShare(); clearStoppedMessage(); drawPanel(); });

  const now = (): History<Draft> => (history ??= startHistory(newDraft(NEW_SIDE, NEW_SIDE)));

  function drawBoard(): void {
    if (!shown) return;
    if (modernOn()) {
      if (modernFor !== live) {
        modernFor = live;
        drawModern(modernView!.board!, initial(toLevel(live)), hiddenMarks(live));
      }
      return;
    }
    if (classicFor !== live) {
      classicFor = live;
      const s = initial(toLevel(live));
      classic.draw(live.cols, live.rows, drawList(s, restingFigures(s), atlas, 0), hiddenMarks(live));
    }
  }

  /** Lays the board out again for the space it has. */
  function fit(): void {
    if (!shown) return;
    if (modernOn()) modernView!.resize();
    else classic.fit();
  }

  function drawPanel(): void {
    if (!shown) return;
    const h = now();
    const text = toText(live, true);
    const checked = checker.state;
    const answered = checked.kind === 'done' || checked.kind === 'failed' ? checked.text : null;
    renderEditorPanel(panel, {
      check: {
        state: checked, current: text, level: answered !== null && answered !== text ? parse(answered) : toLevel(live),
        onCheck: runCheck, onShare: shareFromStrip, onStop: () => checker.stop(), onKeep: () => checker.keepSearching(),
      },
      share: {
        initials, busy: sharing, draft: live, owner: isOwner,
        message: shared && shared.text === text ? shared.message : '',
        link: shared && shared.text === text ? shared.link : null,
        onInitials: (raw) => {
          initials = raw;
          const ok = validInitials(raw);
          if (ok !== null) savedInitials.set(ok);
        },
        onShare: () => { void runShare(); },
        onId: (id) => edit(d => (id === d.id ? d : { ...d, id })),
        onTitle: (title) => edit(d => (title === d.title ? d : { ...d, title })),
        onIntro: (intro) => edit(d => (intro === d.intro ? d : { ...d, intro })),
      },
      draft: live, canUndo: h.canUndo, canRedo: h.canRedo, brush, owner: isOwner, drawer,
      ...(deps.look ? { look, onLook: (l: Look) => setLook(l, true) } : {}),
      onPick: (b) => {
        brush = b;
        drawer = false;
        drawPanel();
      },
      onRotate: rotate,
      onUndo: () => step(undoH),
      onRedo: () => step(redoH),
      onTry: tryIt,
      ...(deps.leave ? { onLeave: deps.leave } : {}),
      onDrawer: (open) => {
        drawer = open;
        drawPanel();
      },
      onResize: (rows, cols) => edit(d => (Number.isFinite(rows) && Number.isFinite(cols) ? resize(d, rows, cols) : d)),
      onHearts: (n) => edit(d => {
        if (!Number.isFinite(n)) return d;
        const hearts = Math.min(99, Math.max(1, Math.trunc(n)));
        return hearts === d.hearts ? d : { ...d, hearts };
      }),
      onRelics: (n) => edit(d => (n === d.relics || (n !== null && !Number.isFinite(n)) ? d : { ...d, relics: n })),
    });
  }

  /** Shows `d` as the draft; the history is the caller's. */
  function show(d: Draft): void {
    if (d === live) return;
    live = d;
    checker.edited(toText(d, true));
    drawBoard();
    drawPanel();
    deps.changed();
  }

  /** One undo step: `fn` of the present draft. */
  function edit(fn: (d: Draft) => Draft): void {
    endStroke();
    history = commit(now(), fn(now().now));
    show(history.now);
  }

  function step(fn: (h: History<Draft>) => History<Draft>): void {
    endStroke();
    history = fn(now());
    show(history.now);
  }

  function rotate(): void {
    const dir = dirOf(brush);
    if (dir === null || (brush.kind !== 'hazard' && brush.kind !== 'machine')) return;
    brush = { ...brush, dir: nextDir(dir) };
    drawPanel();
  }

  /** Shows the draft in `next`, and with `store` makes it the game's look too. Modern loads the 3D board the first
   *  time; where it cannot start, the editor stays in Classic and says so. */
  function setLook(next: Look, store: boolean): void {
    endStroke();
    if (store) deps.look?.set(next);
    // One view for both looks: the heading and tilt go across with the switch; the zoom goes back to the whole board.
    const from: Heading | null = modernOn() ? { yaw: modernView!.board!.yaw(), pitch: modernView!.board!.pitch() } : null;
    look = next;
    if (next === 'classic') {
      modernView?.show(false);
      drawPanel();
      drawBoard();
      if (from) classic.setView(from.yaw, from.pitch);
      else classic.fit();
      return;
    }
    drawPanel();
    const m = deps.modern;
    if (!m) return;
    modernView ??= createModernView({
      holder, load: m.load, atlas, image, icons: m.icons, walls: m.walls, hidden: () => !shown,
      painter,
    });
    const view = modernView;
    void view.ready().then(ok => {
      if (look !== 'modern') return;
      if (!ok) {
        look = 'classic';
        // Said once a visit: the setting stays Modern, so each opening of the editor finds it cannot start again.
        if (!noModernSaid) {
          noModernSaid = true;
          deps.say?.(NO_MODERN_MESSAGE);
        }
        drawPanel();
        return;
      }
      if (!shown) return;
      view.show(true);
      modernFor = null;
      drawBoard();
      // The Classic view showed until now, the Modern board loading or not: its heading and tilt go across.
      const v = classic.view();
      view.board!.reset();
      view.board!.setView(v.yaw, v.pitch);
    });
  }

  function tryIt(): void {
    endStroke();
    const text = toText(live, true);
    const c = checker.state;
    deps.tryIt(toLevel(live), text, c.kind === 'done' && c.text === text ? lineOf(c.d.line) : null);
  }

  /** Checks the draft as it stands. */
  function runCheck(): void {
    endStroke();
    void checker.check(toText(live, true));
  }

  /** Share, from the strip: the drawer opens, as that is where the link and the initials are. */
  function shareFromStrip(): void {
    drawer = true;
    void runShare();
  }

  /** Stop pauses the search a Share is waiting on, which then never answers: that Share ends here, saying so. */
  function endStoppedShare(): void {
    const c = checker.state;
    if (!sharing || sharingText === null || c.kind !== 'running' || !c.stopped || c.text !== sharingText) return;
    shareGen++;
    sharing = false;
    shared = { text: sharingText, link: null, message: STOPPED_MESSAGE };
    sharingText = null;
  }

  /** Keep searching resumed the search, or it finished: "press Share again" no longer applies. */
  function clearStoppedMessage(): void {
    if (shared?.message !== STOPPED_MESSAGE) return;
    const c = checker.state;
    if (c.kind === 'running' && c.stopped && c.text === shared.text) return;
    shared = null;
  }

  /** Makes the link for the draft as it stands: Check first when the draft is not what the last Check proved. */
  async function runShare(): Promise<void> {
    endStroke();
    const text = toText(live, true);
    const mine = ++shareGen;
    const say = (message: string, link: { url: string; name: string } | null = null): void => {
      sharing = false;
      sharingText = null;
      shared = { text, link, message };
      drawPanel();
    };
    if (validInitials(initials) === null) { say(INITIALS_MESSAGE); return; }
    const c = checker.state;
    sharing = true;
    sharingText = text;
    shared = null;
    drawPanel();
    let d: Difficulty | null;
    if (c.kind === 'done' && c.text === text) d = c.d;
    else d = await checker.check(text);
    if (mine !== shareGen) return;
    sharingText = null;
    if (d === null) {
      // Cancelled by an edit or a newer Check, or the solver failed: the Check panel says which.
      sharing = false;
      drawPanel();
      return;
    }
    const base = deps.pageUrl ? deps.pageUrl() : location.href.split('#')[0]!;
    const r = await shareLink(base, text, d, initials, bests.get(text) ?? null);
    if (mine !== shareGen) return;
    if (r.ok) say('', { url: r.url, name: r.name });
    else say(r.message);
  }

  /* ---------- painting ---------- */
  function endStroke(): void {
    if (!stroke) return;
    stroke = null;
    history = commit(now(), live);
    drawPanel();
  }

  /** A second finger came down: the stroke so far is undone, and the fingers scroll. */
  function dropStroke(): void {
    if (!stroke) return;
    stroke = null;
    show(now().now);
  }

  /** A stroke by pointer `id` starts at `at`. */
  function beginStroke(id: number, at: Cell): void {
    if (!shown || stroke) return;
    // The press keeps the focus where it was; a number box keeping it would take the editor's keys as typing.
    const focused = document.activeElement as HTMLElement | null;
    if (focused && typesText(focused)) focused.blur();
    stroke = { id, last: at };
    show(paint(live, at, brush));
  }

  /** The stroke by pointer `id` moves on to `at`, painting every cell on the way. */
  function strokeTo(id: number, at: Cell): void {
    if (!stroke || id !== stroke.id) return;
    if (at.r === stroke.last.r && at.c === stroke.last.c) return;
    let d = live;
    for (const c of lineCells(stroke.last, at)) d = paint(d, c, brush);
    stroke.last = at;
    show(d);
  }

  image.addEventListener('load', () => { classicFor = null; drawBoard(); });
  if (typeof ResizeObserver === 'function') new ResizeObserver(fit).observe(holder);
  if (typeof window !== 'undefined') window.addEventListener('resize', fit);

  return {
    open(draft) {
      if (draft) history = history ? commit(history, draft) : startHistory(draft);
      isOwner = owner.get() === 'on';
      if (brush.kind === 'page' && !isOwner) brush = { kind: 'terrain', t: 'wall' };
      shown = true;
      root.hidden = false;
      live = now().now;
      checker.edited(toText(live, true));
      classicFor = modernFor = null;
      const wanted = deps.look?.get() ?? 'classic';
      if (wanted !== look || (wanted === 'modern' && !modernOn())) setLook(wanted, false);
      else if (modernOn()) modernView!.show(true);
      drawPanel();
      drawBoard();
    },
    close() {
      // A running check goes on while the editor is left (Try it, Q); its panel is current on return.
      endStroke();
      drawer = false;
      shown = false;
      root.hidden = true;
      modernView?.show(false);
    },
    get draft() {
      return live;
    },
    key(ev) {
      if (!shown || typesText(ev.target)) return false;
      if (isBackKey(ev)) {
        if (!drawer) return false;
        ev.preventDefault();
        drawer = false;
        drawPanel();
        return true;
      }
      const action = editorActionFor(ev);
      if (!action) return false;
      ev.preventDefault();
      if (ev.repeat && action !== 'undo' && action !== 'redo') return true;
      switch (action) {
        case 'undo': step(undoH); break;
        case 'redo': step(redoH); break;
        case 'try': tryIt(); break;
        case 'check': runCheck(); break;
        case 'rotate': rotate(); break;
        case 'look': if (deps.look) setLook(look === 'modern' ? 'classic' : 'modern', true); break;
      }
      return true;
    },
    tryWon(text, moves) {
      const best = bests.get(text);
      if (best === undefined || moves < best) bests.set(text, moves);
    },
    bestFor: text => bests.get(text) ?? null,
    get modern() {
      return modernOn() ? modernView!.board : null;
    },
    get classic() {
      return shown && !modernOn() ? classic : null;
    },
  };
}
