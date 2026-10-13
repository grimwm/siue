// websites/www.cs/games/_kit/keys.ts
// The back key: Q closes whatever is open, in every game. Never Escape:
// Safari and Firefox always spend Esc on leaving full screen, and no page can
// stop them, so a game that asked for Esc would throw its player out of full
// screen. Q matches either case and never with Ctrl, Cmd or Alt (Cmd+Q quits
// the browser), and a key that is still being composed belongs to the input
// method.

/** How the back key is printed on buttons and hints. */
export const BACK_KEY = 'Q';

/** The part of a keyboard event the back key reads. */
export interface BackKeyEvent {
  key?: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  isComposing?: boolean;
  /** An auto-repeat keydown: a held key, not another press. */
  repeat?: boolean;
}

/** True when the press is the back key. */
export function isBackKey(ev: BackKeyEvent): boolean {
  return (ev.key === 'q' || ev.key === 'Q') && !ev.ctrlKey && !ev.metaKey && !ev.altKey && !ev.isComposing;
}

/** Input types that take no typed text, so Q is not a letter there. */
const NON_TEXT_INPUTS: ReadonlySet<string> = new Set(
  ['range', 'checkbox', 'radio', 'button', 'submit', 'reset', 'image', 'color', 'file']);

/** True when a key pressed on `target` types into it, so Q is a letter there. */
export function typesText(target: unknown): boolean {
  const t = target as { tagName?: string; type?: string; readOnly?: boolean; isContentEditable?: boolean } | null | undefined;
  if (!t) return false;
  if (t.isContentEditable) return true;
  if (t.tagName === 'SELECT') return true;
  if (t.tagName === 'INPUT' && t.type && NON_TEXT_INPUTS.has(t.type)) return false;
  return (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') && !t.readOnly;
}
