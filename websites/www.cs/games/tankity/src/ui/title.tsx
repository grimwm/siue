/* The title card over the dimmed demo, on the kit's Dialog: Play, Play with
 * friends, Tutorial, a Settings link, and the three-letter initials. The game
 * owns whether it shows, the initials and what each button does; this draws
 * them and reports. Its mount point (#title-root) stays in index.html.
 * Copyright (C) 2026 William Grim
 * SPDX-License-Identifier: GPL-3.0-or-later */
import { render } from 'preact';
import { Dialog } from '../../../_kit/ui/dialog.tsx';
import { KeyHints, Key, blurThen } from './chrome.tsx';
import { InitialsPicker } from './initials-picker.tsx';
import type { KeyHintFn } from './chrome.tsx';

export interface TitleProps {
  keyHint: KeyHintFn;
  /** The card shows; the demo plays dimmed behind it. */
  open: boolean;
  /** The saved initials, three uppercase letters. */
  initials: string;
  /** A change puts the saved set back in the boxes (the card opening). */
  initialsRev?: number;
  /** Why the last typed set was refused, or empty. */
  problem: string;
  /** An installed app that could not close itself says how, or empty. */
  hint: string;
  /** The menu is open (the Settings link's aria-expanded). */
  settingsOpen: boolean;
  /** All three boxes hold a letter: the set, uppercase. The game checks it. */
  onInitials: (word: string) => void;
  onPlay: () => void;
  onFriends: () => void;
  onTutorial: () => void;
  onSettings: () => void;
}

export function Title(p: TitleProps) {
  // No onDismiss: Q opens the settings menu over the card, never closes it.
  return (
    <KeyHints.Provider value={p.keyHint}>
      <Dialog open={p.open} id="title-card" veilClass="title-veil" panelClass="title-card" titleId="title-h"
        title="Operation Tankity" describedBy="title-tag" focusId="title-play">
        <p id="title-tag" class="title-tag">Mind the wind. Flatten the drone battery.</p>
        <button type="button" id="title-play" class="title-play btn-primary" onClick={blurThen(p.onPlay)}>
          <span aria-hidden="true">▶ </span>Play <Key at="global:new" bare />
        </button>
        <div class="title-row">
          <button type="button" id="rooms-open" onClick={blurThen(p.onFriends)}>Play with friends <Key at="global:rooms" bare /></button>
          <button type="button" id="tutorial-open" onClick={blurThen(p.onTutorial)}>Tutorial <Key at="global:tutorial" bare /></button>
        </div>
        <InitialsPicker idPrefix="title" initials={p.initials} rev={p.initialsRev} onInitials={p.onInitials}
          problem={p.problem} noteId="title-initials-note" />
        <p class="title-note" id="title-initials-note" role="status">{p.problem}</p>
        {p.hint && <p class="title-hint" id="title-hint" role="status">{p.hint}</p>}
        <button type="button" id="title-settings" class="title-link" aria-haspopup="dialog" aria-expanded={p.settingsOpen}
          onClick={blurThen(p.onSettings)}>Settings <Key at="global:back" bare /></button>
      </Dialog>
    </KeyHints.Provider>
  );
}

/** Draws (or redraws) the title card into its mount point. */
export function renderTitle(container: Element, props: TitleProps): void {
  render(<Title {...props} />, container);
}
