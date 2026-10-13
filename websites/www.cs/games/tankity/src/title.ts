/* Operation Tankity: the title card over the demo.
 *
 * Whether the card shows, the initials it edits, and its props; the card
 * itself is src/ui/title.tsx on the kit's Dialog, which moves focus. What its
 * buttons do (a solo match, the rooms, the tutorial, the menu) arrives as deps. */
import { saveInitials } from './initials.ts';
import type { Pref } from '../../_kit/prefs.ts';
import { renderTitle as drawTitle } from './ui/title.tsx';
import type { KeyHintFn } from './ui/chrome.tsx';

export interface TitleDeps {
  $(id: string): HTMLElement | null;
  keyHint: KeyHintFn;
  /** The player's saved initials (main.ts's savedInitials), shared with the rooms. */
  initials: Pref<string>;
  play(): void;
  friends(): void;
  tutorial(): void;
  settings(): void;
  settingsOpen(): boolean;
}

export function createTitle(deps: TitleDeps) {
  const { $, keyHint, initials, play, friends, tutorial, settings, settingsOpen } = deps;
  let open = false;
  let problem = '';
  let hint = '';
  let rev = 0;

  function titleOpen(): boolean {
    return open;
  }
  /* A refused set stays in the boxes beside the line saying why, as in the
     rooms lobby; the saved set stays in use until an allowed one is typed. */
  function chooseInitials(word: string): void {
    problem = saveInitials(initials, word);
    renderTitle();
  }
  function renderTitle(): void {
    const el = $('title-root');
    if (!el) return;
    drawTitle(el, {
      keyHint, open, initials: initials.get(), initialsRev: rev, problem, hint, settingsOpen: settingsOpen(),
      onInitials: chooseInitials, onPlay: play, onFriends: friends, onTutorial: tutorial, onSettings: settings,
    });
  }
  /* The Dialog focuses Play as the card shows, so a keyboard player lands on it. */
  function openTitle(): void {
    problem = '';
    hint = '';
    rev++;
    open = true;
    renderTitle();
  }
  function closeTitle(): void {
    if (!open) return;
    open = false;
    hint = '';
    renderTitle();
  }
  /** Words on the card, for as long as it stays open (an installed app's way out). */
  function showHint(text: string): void {
    if (!open) return;
    hint = text;
    renderTitle();
  }

  return { titleOpen, openTitle, closeTitle, showHint, renderTitle };
}
