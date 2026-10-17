/* The Island of Crete: the key table. One place says which keys do what and
 * what a button's key tab prints, so a tab can never disagree with its
 * binding. The tools' keys are not here: they come from the engine's ITEMS.
 * Q is the kit's back key (isBackKey) and Escape is not bound. DOM-free. */
import { BACK_KEY } from "../../_kit/keys.ts";

export type MoveAction = "up" | "down" | "left" | "right";
export type Action = MoveAction | "hint" | "route" | "auto" | "bash" | "mute" | "new" | "menu";

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
  hint: { label: "H", keys: ["h"] },
  route: { label: "V", keys: ["v"] },
  auto: { label: "T", keys: ["t"] },
  bash: { label: "Space", keys: [" ", "spacebar"] },
  mute: { label: "M", keys: ["m"] },
  new: { label: "N", keys: ["n"] },
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
