/* The Island of Crete: the level editor's keys. While the editor is the top
 * layer every key goes to it (src/ui.ts), so these may reuse the game's
 * letters. Q is the kit's back key (src/ui.ts reads it) and Escape is not
 * bound. Undo and redo also answer the usual Ctrl or Cmd chords; every other
 * chord is the browser's. DOM-free. */
import type { KeyDef } from '../keys.ts';

export type EditorAction = 'undo' | 'redo' | 'try' | 'check' | 'rotate';

export const EDITOR_KEYS: Record<EditorAction, KeyDef> = {
  undo: { label: 'U', keys: ['u'] },
  redo: { label: 'Y', keys: ['y'] },
  /** Plays the draft on the game screen. */
  try: { label: 'P', keys: ['p'] },
  /** Solves the draft and rates it. */
  check: { label: 'C', keys: ['c'] },
  /** Turns the brush's facing a quarter clockwise. */
  rotate: { label: 'O', keys: ['o'] },
};

/** The part of a keyboard event the editor's keys read. */
export interface EditorKeyEvent {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}

const BY_KEY = new Map<string, EditorAction>();
for (const action of Object.keys(EDITOR_KEYS) as EditorAction[]) {
  for (const k of EDITOR_KEYS[action].keys) BY_KEY.set(k, action);
}

/** The editor action a press does, or null: U, Ctrl/Cmd+Z undo; Y, Ctrl/Cmd+Y, Ctrl/Cmd+Shift+Z redo. */
export function editorActionFor(ev: EditorKeyEvent): EditorAction | null {
  const k = ev.key.toLowerCase();
  if (ev.altKey) return null;
  if (ev.ctrlKey || ev.metaKey) {
    if (k === 'z') return ev.shiftKey ? 'redo' : 'undo';
    if (k === 'y') return 'redo';
    return null;
  }
  return BY_KEY.get(k) ?? null;
}
