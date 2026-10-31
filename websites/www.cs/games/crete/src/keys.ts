/* The Island of Crete: the key table. One place says which keys do
 * what and what a button's key tab prints, so a tab can never disagree with
 * its binding. The tools' keys are not here: they come from TOOLS. Q is the
 * kit's back key (isBackKey) and Escape is not bound. DOM-free. */
import { BACK_KEY } from "../../_kit/keys.ts";

export type MoveAction = "up" | "down" | "left" | "right";
export type Action =
  | MoveAction
  | "begin" | "wait" | "undo" | "restart" | "hint" | "route" | "auto" | "mute" | "new" | "menu" | "story" | "fullscreen" | "lore" | "dictionary" | "editor" | "look";

export interface KeyDef {
  /** What a button's key tab and the help text print. */
  label: string;
  /** `KeyboardEvent.key` lower-cased, for each press that does it. */
  keys: readonly string[];
}

export const KEYS: Record<Action, KeyDef> = {
  up: { label: "↑", keys: ["arrowup", "w"] },
  down: { label: "↓", keys: ["arrowdown", "s"] },
  left: { label: "←", keys: ["arrowleft", "a"] },
  right: { label: "→", keys: ["arrowright", "d"] },
  /** Closes the start card; no other key of the game. */
  begin: { label: "↵", keys: ["enter", " "] },
  wait: { label: ".", keys: ["."] },
  undo: { label: "U", keys: ["u"] },
  restart: { label: "R", keys: ["r"] },
  hint: { label: "H", keys: ["h"] },
  route: { label: "V", keys: ["v"] },
  auto: { label: "T", keys: ["t"] },
  mute: { label: "M", keys: ["m"] },
  /** Opens the level list. */
  new: { label: "N", keys: ["n"] },
  /** Opens the story card, from the title card. */
  story: { label: "I", keys: ["i"] },
  /** Toggles full screen, from the menu. */
  fullscreen: { label: "F", keys: ["f"] },
  /** Opens the Lore book, from the menu. */
  lore: { label: "L", keys: ["l"] },
  /** Opens the Dictionary, from the menu. */
  dictionary: { label: "G", keys: ["g"] },
  /** Opens the level editor, from the title card. */
  editor: { label: "E", keys: ["e"] },
  /** Swaps the board between the modern and the classic look, from the strip. */
  look: { label: "B", keys: ["b"] },
  // Q is read with isBackKey; this row only names it.
  menu: { label: BACK_KEY, keys: [] },
};

export const MOVE_DELTA: Record<MoveAction, readonly [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

const BY_KEY = new Map<string, Action>();
for (const action of Object.keys(KEYS) as Action[]) {
  for (const k of KEYS[action].keys) BY_KEY.set(k, action);
}

/** The action a key press does, or null. */
export function actionFor(key: string): Action | null {
  return BY_KEY.get(key.toLowerCase()) ?? null;
}

export function isMove(a: Action | null): a is MoveAction {
  return a === "up" || a === "down" || a === "left" || a === "right";
}

/** The tool whose printed key this press is, or null. */
export function itemFor<K extends string>(key: string, items: Record<K, { key: string }>): K | null {
  const k = key.toLowerCase();
  return (Object.keys(items) as K[]).find((kind) => items[kind].key.toLowerCase() === k) ?? null;
}
