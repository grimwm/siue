/* The Island of Crete: the touch tour, a short animated walkthrough of the controls for a touch screen. Ghost
 * fingertips over the real move pad and board show each way to play, one step at a time with a caption: a tap on an
 * arrow, a held arrow, a slide from one arrow to another, one finger turning and tilting the view, and two fingers
 * panning, twisting and pinching it. The board itself turns, tilts, slides and grows a little with them (a passing
 * CSS animation on top of whatever view it has, gone when the step ends), and Theseus never moves. The steps loop
 * until the tour is closed: by Skip (Got It once every step has shown), a tap anywhere, or any key but a browser
 * chord. With reduced
 * motion nothing moves: each step shows its fingertips where they end, an arrow for the way they went, and Next.
 *
 * It shows by itself once, the first time a level is in play on a touch screen with no card over it; Show View Tips
 * (the menu, the ? key) shows it again on a touch screen, and Reset Tips shows it by itself once more. Whether it has
 * shown is kept with the first cards (src/met.ts, as TOUR_ID). */
import type { MoveAction } from "./keys.ts";

/** The tour's id among the first cards shown (src/met.ts noteCard). */
export const TOUR_ID = "touch-tour";
/** How long each step plays, in ms. */
export const STEP_MS = 2600;

export interface TourStep {
  caption: string;
  /** The fingertips, as fractions of what they stand over, from where they start to where they end. */
  play: (at: TourPlaces) => { dots: [Path] | [Path, Path]; board?: Keyframe[] };
}

type Point = { x: number; y: number };
/** A fingertip's way over a step: its points, evenly in time, and whether it is pressing at each. */
interface Path { points: Point[]; press: boolean[] }

export interface TourPlaces {
  arrow(dir: MoveAction): Point;
  /** A point on the board, as fractions of its width and height. */
  board(fx: number, fy: number): Point;
}

const still = (p: Point, n: number): Point[] => Array.from({ length: n }, () => p);

/** The steps, in order. Their captions are the tour's words. */
export const TOUR_STEPS: readonly TourStep[] = [
  {
    caption: "Tap an arrow to take a step",
    play: at => ({ dots: [{ points: still(at.arrow("right"), 5), press: [false, true, false, true, false] }] }),
  },
  {
    caption: "Hold an arrow to keep walking",
    play: at => ({ dots: [{ points: still(at.arrow("right"), 4), press: [false, true, true, true] }] }),
  },
  {
    caption: "Slide to another arrow to change way",
    play: at => ({ dots: [{ points: [at.arrow("left"), at.arrow("left"), at.arrow("up"), at.arrow("up")], press: [false, true, true, true] }] }),
  },
  {
    caption: "One finger turns and tilts the view",
    play: at => ({
      dots: [{ points: [at.board(0.3, 0.5), at.board(0.3, 0.5), at.board(0.7, 0.5), at.board(0.7, 0.35), at.board(0.7, 0.6)], press: [false, true, true, true, true] }],
      board: [
        { transform: "none" },
        { transform: "none" },
        { transform: "rotate(-14deg)" },
        { transform: "perspective(900px) rotate(-14deg) rotateX(14deg)" },
        { transform: "perspective(900px) rotate(-14deg) rotateX(-6deg)" },
      ],
    }),
  },
  {
    caption: "Two fingers pan, twist and pinch",
    play: at => ({
      dots: [
        { points: [at.board(0.38, 0.5), at.board(0.38, 0.5), at.board(0.48, 0.45), at.board(0.5, 0.33), at.board(0.42, 0.25)], press: [false, true, true, true, true] },
        { points: [at.board(0.62, 0.5), at.board(0.62, 0.5), at.board(0.72, 0.45), at.board(0.66, 0.6), at.board(0.78, 0.7)], press: [false, true, true, true, true] },
      ],
      board: [
        { transform: "none" },
        { transform: "none" },
        { transform: "translate(6%, -4%)" },
        { transform: "translate(6%, -4%) rotate(16deg)" },
        { transform: "translate(6%, -4%) rotate(16deg) scale(1.18)" },
      ],
    }),
  },
];

/** Whether the tour shows by itself now: on a touch screen, a level in play with no card over it, not yet shown. */
export function tourDue(o: { touch: boolean; seen: boolean; playing: boolean; covered: boolean }): boolean {
  return o.touch && !o.seen && o.playing && !o.covered;
}

export interface TourHost {
  /** The surface the board draws on in the look showing, which the tour turns and tilts for a moment. */
  surface(): HTMLElement | null;
  reducedMotion(): boolean;
  /** The tour closed. */
  closed(): void;
}

export interface Tour {
  close(): void;
}

/** Shows the tour over `frame` (the game's frame, which holds the board and the strip). */
export function showTour(frame: HTMLElement, host: TourHost): Tour {
  const veil = document.createElement("div");
  veil.id = "tour";
  veil.className = "tour";
  veil.setAttribute("role", "dialog");
  veil.setAttribute("aria-label", "How to play on a touch screen");
  const dots = [0, 1].map(() => {
    const d = document.createElement("span");
    d.className = "tour-dot";
    d.setAttribute("aria-hidden", "true");
    veil.append(d);
    return d;
  });
  const trace = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  trace.setAttribute("class", "tour-trace");
  trace.setAttribute("aria-hidden", "true");
  veil.append(trace);
  const card = document.createElement("div");
  card.className = "tour-card";
  const caption = document.createElement("p");
  caption.id = "tour-caption";
  caption.className = "tour-caption";
  caption.setAttribute("aria-live", "polite");
  const pips = document.createElement("p");
  pips.className = "tour-pips";
  pips.setAttribute("aria-hidden", "true");
  const buttons = document.createElement("div");
  buttons.className = "tour-buttons";
  const btn = (id: string, label: string): HTMLButtonElement => {
    const b = document.createElement("button");
    b.type = "button";
    b.id = id;
    b.textContent = label;
    buttons.append(b);
    return b;
  };
  const still = host.reducedMotion();
  const next = still ? btn("tour-next", "Next") : null;
  const done = btn("tour-done", "Skip");
  card.append(caption, pips, buttons);
  veil.append(card);
  frame.append(veil);

  let step = -1;
  let shownAll = false;
  let timer = 0;
  let running: Animation[] = [];
  let closed = false;

  const center = (el: Element | null): Point => {
    const r = el?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: 0, y: 0 };
  };
  const places: TourPlaces = {
    arrow: dir => center(document.querySelector(`.pad .mv-${dir}`)),
    board(fx, fy) {
      const r = (host.surface() ?? frame).getBoundingClientRect();
      return { x: r.left + r.width * fx, y: r.top + r.height * fy };
    },
  };
  const at = (p: Point, press: boolean): { transform: string; opacity: number } => ({ transform: `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(${press ? 0.8 : 1})`, opacity: 1 });

  function stopAnims(): void {
    for (const a of running) a.cancel();
    running = [];
  }

  function show(i: number): void {
    stopAnims();
    clearTimeout(timer);
    step = i % TOUR_STEPS.length;
    if (step === TOUR_STEPS.length - 1) shownAll = true;
    done.textContent = shownAll ? "Got It" : "Skip";
    const s = TOUR_STEPS[step]!;
    caption.textContent = s.caption;
    pips.textContent = TOUR_STEPS.map((_, j) => (j === step ? "●" : "○")).join(" ");
    const plan = s.play(places);
    trace.innerHTML = "";
    dots.forEach((d, j) => {
      const path = plan.dots[j];
      d.hidden = !path;
      if (!path) return;
      const frames: Keyframe[] = path.points.map((p, k) => ({ ...at(p, path.press[k]!), offset: k / (path.points.length - 1) }));
      d.classList.toggle("press", path.press[path.press.length - 1]!);
      if (still) {
        const a = path.points[0]!, b = path.points[path.points.length - 1]!;
        Object.assign(d.style, { transform: String(at(b, true).transform), opacity: "1" });
        if (Math.hypot(b.x - a.x, b.y - a.y) > 4) {
          const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
          line.setAttribute("d", `M${path.points.map(p => `${p.x},${p.y}`).join(" L")}`);
          trace.append(line);
        }
        return;
      }
      running.push(d.animate(frames, { duration: STEP_MS, easing: "ease-in-out", fill: "forwards" }));
    });
    const surface = host.surface();
    if (!still && plan.board && surface) {
      running.push(surface.animate(plan.board, { duration: STEP_MS, easing: "ease-in-out", composite: "add" }));
    }
    if (!still) timer = window.setTimeout(() => show(step + 1), STEP_MS + 500);
  }

  function close(): void {
    if (closed) return;
    closed = true;
    stopAnims();
    clearTimeout(timer);
    document.removeEventListener("keydown", onKey, true);
    veil.remove();
    host.closed();
  }
  const onKey = (e: KeyboardEvent): void => {
    // A browser chord (Ctrl, Alt, Meta) or a modifier alone is the browser's, not a key to close the tour.
    if (e.ctrlKey || e.altKey || e.metaKey || ["Shift", "Control", "Alt", "Meta"].includes(e.key)) return;
    e.preventDefault();
    e.stopPropagation();
    close();
  };
  document.addEventListener("keydown", onKey, true);
  veil.addEventListener("pointerdown", e => {
    // The tour takes every press: nothing under it moves Theseus or the view.
    e.preventDefault();
    e.stopPropagation();
  });
  veil.addEventListener("click", e => {
    if (e.target === next) show(step + 1);
    else close();
  });
  show(0);
  return { close };
}
